const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();
const words = require('./words');

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function getRandomWord(difficulty) {
  const wordList = words[difficulty];
  return wordList[Math.floor(Math.random() * wordList.length)];
}

function getDifficulty(round) {
  if (round <= 3) return 'easy';
  if (round <= 6) return 'medium';
  return 'hard';
}

function getRoundsSinceStart(room) {
  return Math.floor((room.currentDrawer + room.players.length * (room.round - 1)) / room.players.length);
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
        if (completedRounds === 3) {
          io.to(roomCode).emit('difficultyChange', { difficulty: 'medium', round: room.round });
        } else if (completedRounds === 6) {
          io.to(roomCode).emit('difficultyChange', { difficulty: 'hard', round: room.round });
        }
      }
      
      setTimeout(() => {
        room.currentWord = getRandomWord(getDifficulty(room.round));
        room.wrongGuesses.clear();
        
        const newDrawer = room.players[room.currentDrawer];
        io.to(newDrawer.id).emit('yourTurn', { word: room.currentWord, round: room.round });
        
        room.players.forEach(p => {
          if (p.id !== newDrawer.id) {
            io.to(p.id).emit('waitingForDrawing', { drawer: newDrawer.name, round: room.round });
          }
        });
        
        startTimer(roomCode);
      }, 3000);
    }
  }, 1000);
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
      room.currentWord = getRandomWord(getDifficulty(room.round));
      room.wrongGuesses.clear();
      
      const drawer = room.players[room.currentDrawer];
      io.to(drawer.id).emit('yourTurn', { word: room.currentWord, round: room.round });
      
      room.players.forEach(player => {
        if (player.id !== drawer.id) {
          io.to(player.id).emit('waitingForDrawing', { drawer: drawer.name, round: room.round });
        }
      });
      
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
        if (completedRounds === 3) {
          io.to(roomCode).emit('difficultyChange', { difficulty: 'medium', round: room.round });
        } else if (completedRounds === 6) {
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
      
      if (room.timer) clearInterval(room.timer);
      
      setTimeout(() => {
        room.currentWord = getRandomWord(getDifficulty(room.round));
        room.wrongGuesses.clear();
        
        const newDrawer = room.players[room.currentDrawer];
        io.to(newDrawer.id).emit('yourTurn', { word: room.currentWord, round: room.round });
        
        room.players.forEach(p => {
          if (p.id !== newDrawer.id) {
            io.to(p.id).emit('waitingForDrawing', { drawer: newDrawer.name, round: room.round });
          }
        });
        
        startTimer(roomCode);
      }, 3000);
    } else {
      console.log(`[GUESS] WRONG! "${player.name}" guessed "${guess}" (correct: "${room.currentWord}")`);
      const wrongCount = (room.wrongGuesses.get(socket.id) || 0) + 1;
      room.wrongGuesses.set(socket.id, wrongCount);
      console.log(`[GUESS] Wrong guess count for ${player.name}: ${wrongCount}`);
      
      // Send wrong guess to drawer
      io.to(drawer.id).emit('wrongGuess', { guesser: player.name, guess });
      console.log(`[GUESS] Sent wrong guess notification to drawer`);
      
      if (wrongCount === 3) {
        io.to(socket.id).emit('hint', { letters: room.currentWord.length });
        console.log(`[HINT] Sent hint to ${player.name}: ${room.currentWord.length} letters`);
      }
    }
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