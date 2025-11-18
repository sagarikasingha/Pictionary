const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();
const { words, wordHints } = require('./words');
const turnAcknowledgments = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function getRandomWord(difficulty) {
  const wordList = words[difficulty];
  return wordList[Math.floor(Math.random() * wordList.length)];
}

function getDifficulty(round) {
  if (round <= 5) return 'easy';
  if (round <= 10) return 'medium';
  return 'hard';
}

function getRoundsSinceStart(room) {
  return Math.floor((room.currentDrawer + room.players.length * (room.round - 1)) / room.players.length);
}

function calculateSimilarity(guess, word) {
  const g = guess.toLowerCase().trim();
  const w = word.toLowerCase().trim();
  
  if (g.length === 0 || w.length === 0) return 0;
  if (g.length !== w.length) return 0;
  
  let matches = 0;
  for (let i = 0; i < g.length; i++) {
    if (g[i] === w[i]) matches++;
  }
  
  return (matches / w.length) * 100;
}

function startTimer(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  
  if (room.timer) clearInterval(room.timer);
  
  room.timeLeft = 60;
  io.to(roomCode).emit('timerUpdate', { timeLeft: 60 });
  
  room.timer = setInterval(() => {
    room.timeLeft--;
    io.to(roomCode).emit('timerUpdate', { timeLeft: room.timeLeft });
    
    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      console.log(`[TIMER] Time's up in room ${roomCode}`);
      
      io.to(roomCode).emit('timeUp', { word: room.currentWord });
      
      room.currentDrawer = (room.currentDrawer + 1) % room.players.length;
      if (room.currentDrawer === 0) {
        room.round++;
        const completedRounds = room.round - 1;
        if (completedRounds === 5) {
          io.to(roomCode).emit('difficultyChange', { difficulty: 'medium', round: room.round });
        } else if (completedRounds === 10) {
          io.to(roomCode).emit('difficultyChange', { difficulty: 'hard', round: room.round });
        }
      }
      
      setTimeout(() => {
        startNewTurn(roomCode);
      }, 3000);
    }
  }, 1000);
}

function startNewTurn(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  
  room.currentWord = getRandomWord(getDifficulty(room.round));
  room.wrongGuesses.clear();
  
  const newDrawer = room.players[room.currentDrawer];
  turnAcknowledgments.set(roomCode, new Set());
  
  const hint = wordHints[room.currentWord] || 'Draw this object';
  io.to(newDrawer.id).emit('yourTurn', { word: room.currentWord, hint: hint, round: room.round, waitingForAck: true });
  
  room.players.forEach(p => {
    if (p.id !== newDrawer.id) {
      io.to(p.id).emit('waitingForDrawing', { drawer: newDrawer.name, round: room.round, waitingForAck: true });
    }
  });
}

io.on('connection', (socket) => {
  console.log(`[CONNECTION] New client connected: ${socket.id}`);
  
  socket.on('createRoom', (playerName) => {
    console.log(`[CREATE_ROOM] Player "${playerName}" creating room`);
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      players: [{ id: socket.id, name: playerName, score: 0 }],
      currentDrawer: 0,
      currentWord: '',
      round: 1,
      gameStarted: false,
      guesses: new Map(),
      wrongGuesses: new Map(),
      timer: null,
      timeLeft: 60
    };
    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, players: room.players });
    console.log(`[CREATE_ROOM] Room ${roomCode} created successfully`);
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    console.log(`[JOIN_ROOM] Player "${playerName}" attempting to join room ${roomCode}`);
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('joinError', 'Room not found');
      return;
    }
    if (room.gameStarted && room.players.length > 0) {
      socket.emit('joinError', 'Game already started');
      return;
    }
    if (room.players.some(p => p.name === playerName)) {
      socket.emit('joinError', 'Name already taken in this room');
      return;
    }
    room.players.push({ id: socket.id, name: playerName, score: 0 });
    socket.join(roomCode);
    io.to(roomCode).emit('playerJoined', { players: room.players, roomCode: roomCode });
    console.log(`[JOIN_ROOM] Player "${playerName}" joined room ${roomCode}`);
  });

  socket.on('startGame', (roomCode) => {
    console.log(`[START_GAME] Starting game in room ${roomCode}`);
    const room = rooms.get(roomCode);
    if (room && room.players.length >= 2) {
      room.gameStarted = true;
      startNewTurn(roomCode);
    }
  });

  socket.on('turnAcknowledged', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    const acks = turnAcknowledgments.get(roomCode);
    if (!acks) return;
    
    acks.add(socket.id);
    console.log(`[ACK] Player acknowledged in room ${roomCode}. ${acks.size}/${room.players.length}`);
    
    if (acks.size === room.players.length) {
      console.log(`[ACK] All players ready in room ${roomCode}. Starting timer.`);
      io.to(roomCode).emit('allPlayersReady');
      startTimer(roomCode);
    }
  });

  socket.on('drawing', ({ roomCode, data }) => {
    socket.to(roomCode).emit('drawing', data);
  });

  socket.on('guess', ({ roomCode, guess }) => {
    console.log(`[GUESS] Received guess "${guess}" in room ${roomCode}`);
    
    // Find room by code or by socket ID
    let room = rooms.get(roomCode);
    if (!room) {
      console.log(`[GUESS] Room ${roomCode} not found, searching by socket ID`);
      for (const [code, r] of rooms.entries()) {
        if (r.players.some(p => p.id === socket.id)) {
          room = r;
          roomCode = code;
          console.log(`[GUESS] Found player in room ${code}`);
          break;
        }
      }
    }
    
    if (!room) {
      console.log(`[GUESS] Player not in any room`);
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    const drawer = room.players[room.currentDrawer];
    
    if (player.id === drawer.id) {
      console.log(`[GUESS] Drawer cannot guess, ignoring`);
      return;
    }

    if (guess.toLowerCase() === room.currentWord.toLowerCase()) {
      console.log(`[GUESS] CORRECT! "${player.name}" guessed "${guess}"`);
      player.score += 100;
      drawer.score += 50;
      
      room.currentDrawer = (room.currentDrawer + 1) % room.players.length;
      if (room.currentDrawer === 0) {
        room.round++;
        const completedRounds = room.round - 1;
        if (completedRounds === 5) {
          io.to(roomCode).emit('difficultyChange', { difficulty: 'medium', round: room.round });
        } else if (completedRounds === 10) {
          io.to(roomCode).emit('difficultyChange', { difficulty: 'hard', round: room.round });
        }
      }
      
      const nextDrawer = room.players[room.currentDrawer];
      
      io.to(roomCode).emit('correctGuess', { 
        guesser: player.name, 
        word: room.currentWord,
        scores: room.players.map(p => ({ name: p.name, score: p.score })),
        nextDrawer: nextDrawer.name
      });
      
      if (room.timer) {
        clearInterval(room.timer);
        room.timer = null;
      }
      
      setTimeout(() => {
        startNewTurn(roomCode);
      }, 3000);
    } else {
      console.log(`[GUESS] WRONG! "${player.name}" guessed "${guess}" (correct: "${room.currentWord}")`);
      const wrongCount = (room.wrongGuesses.get(socket.id) || 0) + 1;
      room.wrongGuesses.set(socket.id, wrongCount);
      console.log(`[GUESS] Wrong guess count for ${player.name}: ${wrongCount}`);
      
      io.to(drawer.id).emit('wrongGuess', { guesser: player.name, guess });
      
      const similarity = calculateSimilarity(guess, room.currentWord);
      console.log(`[SIMILARITY] Player: ${player.name}, Guess: "${guess}", Word: "${room.currentWord}", Match: ${similarity.toFixed(2)}%`);
      
      if (similarity >= 60) {
        console.log(`[CLOSE_GUESS] Sending close guess hint to ${player.name} (${similarity.toFixed(2)}% match)`);
        io.to(socket.id).emit('closeGuess', { similarity: Math.round(similarity) });
      }
      
      if (wrongCount === 3) {
        io.to(socket.id).emit('hint', { letters: room.currentWord.length });
      }
    }
  });

  socket.on('passTurn', (roomCode) => {
    console.log(`[PASS_TURN] Player passing turn in room ${roomCode}`);
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    const drawer = room.players[room.currentDrawer];
    
    if (!player || player.id !== drawer.id) {
      console.log(`[PASS_TURN] Only drawer can pass`);
      return;
    }

    console.log(`[PASS_TURN] ${player.name} passed their turn`);
    
    if (room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }

    io.to(roomCode).emit('playerPassed', { playerName: player.name });
    
    room.currentDrawer = (room.currentDrawer + 1) % room.players.length;
    if (room.currentDrawer === 0) {
      room.round++;
      const completedRounds = room.round - 1;
      if (completedRounds === 5) {
        io.to(roomCode).emit('difficultyChange', { difficulty: 'medium', round: room.round });
      } else if (completedRounds === 10) {
        io.to(roomCode).emit('difficultyChange', { difficulty: 'hard', round: room.round });
      }
    }
    
    setTimeout(() => {
      startNewTurn(roomCode);
    }, 3000);
  });

  socket.on('exitRoom', (roomCode) => {
    console.log(`[EXIT_ROOM] Player exiting room ${roomCode}`);
    const room = rooms.get(roomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
      const playerName = room.players[playerIndex].name;
      room.players.splice(playerIndex, 1);
      socket.leave(roomCode);
      
      console.log(`[EXIT_ROOM] ${playerName} left room ${roomCode}. Remaining players: ${room.players.length}`);
      
      if (room.players.length === 0) {
        console.log(`[EXIT_ROOM] Room ${roomCode} is now empty but kept open`);
        room.gameStarted = false;
        if (room.timer) {
          clearInterval(room.timer);
          room.timer = null;
        }
      }
      
      io.to(roomCode).emit('playerLeft', { 
        players: room.players,
        playerName: playerName
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[DISCONNECT] Client disconnected: ${socket.id}`);
    for (const [roomCode, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const playerName = room.players[playerIndex].name;
        room.players.splice(playerIndex, 1);
        
        console.log(`[DISCONNECT] ${playerName} disconnected from room ${roomCode}. Remaining: ${room.players.length}`);
        
        if (room.players.length === 0) {
          console.log(`[DISCONNECT] Room ${roomCode} is now empty but kept open`);
          room.gameStarted = false;
          if (room.timer) {
            clearInterval(room.timer);
            room.timer = null;
          }
        }
        
        io.to(roomCode).emit('playerLeft', { 
          players: room.players,
          playerName: playerName
        });
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});