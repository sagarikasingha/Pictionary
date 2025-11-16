const socket = io();
let currentRoom = '';
let isDrawing = false;
let currentColor = '#000';
let canvas, ctx;
let isMyTurn = false;

// Initialize canvas
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    setupCanvas();
});

function setupCanvas() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    
    if (e.type === 'touchstart') {
        startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
    } else if (e.type === 'touchmove') {
        draw({ clientX: touch.clientX, clientY: touch.clientY });
    }
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (!isMyTurn) return;
    isDrawing = true;
    const coords = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    socket.emit('drawing', {
        roomCode: currentRoom,
        data: {
            x: coords.x,
            y: coords.y,
            color: currentColor,
            type: 'start'
        }
    });
}

function draw(e) {
    if (!isDrawing || !isMyTurn) return;
    
    const coords = getCanvasCoordinates(e);
    ctx.strokeStyle = currentColor;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    socket.emit('drawing', {
        roomCode: currentRoom,
        data: {
            x: coords.x,
            y: coords.y,
            color: currentColor,
            type: 'draw'
        }
    });
}

function stopDrawing() {
    if (isDrawing && isMyTurn) {
        socket.emit('drawing', {
            roomCode: currentRoom,
            data: { type: 'stop' }
        });
    }
    isDrawing = false;
}

function createRoom() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    console.log('[CLIENT] Creating room for player:', playerName);
    socket.emit('createRoom', playerName);
}

function joinRoom() {
    const playerName = document.getElementById('playerName').value.trim();
    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
    
    if (!playerName || !roomCode) {
        alert('Please enter your name and room code');
        return;
    }
    
    console.log('[CLIENT] Joining room:', roomCode, 'as player:', playerName);
    socket.emit('joinRoom', { roomCode, playerName });
}

function startGame() {
    console.log('[CLIENT] Starting game in room:', currentRoom);
    socket.emit('startGame', currentRoom);
}

function exitRoom() {
    if (confirm('Are you sure you want to exit the room?')) {
        console.log('[CLIENT] Exiting room:', currentRoom);
        socket.emit('exitRoom', currentRoom);
        currentRoom = '';
        isMyTurn = false;
        showScreen('menu');
    }
}

function changeColor(color) {
    currentColor = color;
    document.querySelectorAll('.color').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
}

function changeBoardColor(color) {
    canvas.style.backgroundColor = color;
    document.querySelectorAll('.board-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function clearCanvas() {
    if (!isMyTurn) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('drawing', {
        roomCode: currentRoom,
        data: { clear: true }
    });
}

function submitGuess() {
    const guess = document.getElementById('guessInput').value.trim();
    if (!guess) return;
    
    console.log('[CLIENT] Submitting guess:', guess, 'in room:', currentRoom);
    console.log('[CLIENT] currentRoom value:', currentRoom, 'type:', typeof currentRoom);
    
    if (!currentRoom) {
        console.error('[CLIENT] ERROR: currentRoom is empty!');
        alert('Error: Not in a room. Please refresh and rejoin.');
        return;
    }
    
    socket.emit('guess', { roomCode: currentRoom, guess });
    document.getElementById('guessInput').value = '';
}

function showMessage(text, color = '#4CAF50') {
    const message = document.querySelector('.message');
    message.textContent = text;
    message.style.background = color;
    message.classList.remove('hidden');
    setTimeout(() => message.classList.add('hidden'), 3000);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// Socket event listeners
socket.on('connect', () => {
    console.log('[CLIENT] Connected to server');
});

socket.on('disconnect', () => {
    console.log('[CLIENT] Disconnected from server');
});

socket.on('roomCreated', (data) => {
    console.log('[CLIENT] Room created:', data);
    currentRoom = data.roomCode;
    document.getElementById('currentRoomCode').textContent = data.roomCode;
    updatePlayersList(data.players);
    showScreen('lobby');
    document.getElementById('startBtn').classList.remove('hidden');
});

socket.on('playerJoined', (data) => {
    console.log('[CLIENT] Player joined:', data);
    if (data.roomCode) {
        currentRoom = data.roomCode;
        document.getElementById('currentRoomCode').textContent = data.roomCode;
        showScreen('lobby');
    }
    updatePlayersList(data.players);
});

socket.on('joinError', (error) => {
    alert(error);
    console.log('[CLIENT] Join error:', error);
});

socket.on('yourTurn', (data) => {
    console.log('[CLIENT] My turn to draw. Word:', data.word);
    console.log('[CLIENT] currentRoom is:', currentRoom);
    isMyTurn = true;
    canvas.classList.remove('drawing-disabled');
    canvas.style.cursor = '';
    document.getElementById('roundNum').textContent = data.round;
    document.getElementById('currentWord').textContent = data.word;
    document.getElementById('wordDisplay').classList.remove('hidden');
    document.getElementById('guessArea').classList.add('hidden');
    document.getElementById('hintDisplay').classList.add('hidden');
    showScreen('game');
    showMessage('Your turn to draw!');
});

socket.on('waitingForDrawing', (data) => {
    console.log('[CLIENT] Waiting for', data.drawer, 'to draw');
    console.log('[CLIENT] currentRoom is:', currentRoom);
    isMyTurn = false;
    canvas.classList.add('drawing-disabled');
    canvas.style.cursor = 'not-allowed';
    document.getElementById('roundNum').textContent = data.round;
    document.getElementById('drawerName').textContent = `${data.drawer} is drawing...`;
    document.getElementById('wordDisplay').classList.add('hidden');
    document.getElementById('guessArea').classList.remove('hidden');
    document.getElementById('hintDisplay').classList.add('hidden');
    showScreen('game');
});

socket.on('drawing', (data) => {
    if (data.clear) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    if (data.type === 'start') {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
    } else if (data.type === 'draw') {
        ctx.strokeStyle = data.color;
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
    }
});

socket.on('correctGuess', (data) => {
    console.log('[CLIENT] Correct guess by', data.guesser);
    alert(`🎉 ${data.guesser} wins! Guessed "${data.word}" correctly!\n\n🎨 Next turn: ${data.nextDrawer}`);
    updateScores(data.scores);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('wrongGuess', (data) => {
    console.log('[CLIENT] Wrong guess received:', data);
    showMessage(`❌ ${data.guesser} guessed: "${data.guess}"`, '#ff6b6b');
});

socket.on('hint', (data) => {
    console.log('[CLIENT] Hint received:', data.letters, 'letters');
    const hintDiv = document.getElementById('hintDisplay');
    hintDiv.innerHTML = `💡 Hint: The word has ${data.letters} letters`;
    hintDiv.classList.remove('hidden');
});

socket.on('playerLeft', (data) => {
    console.log('[CLIENT] Player left:', data);
    updatePlayersList(data.players);
    if (data.playerName) {
        showMessage(`${data.playerName} left the room`, '#ff6b6b');
    }
    // Don't redirect to menu - room persists even when empty
});

socket.on('timerUpdate', (data) => {
    const timeLeftSpan = document.getElementById('timeLeft');
    const timerDiv = document.getElementById('timer');
    
    timeLeftSpan.textContent = data.timeLeft;
    
    if (data.timeLeft <= 10) {
        timerDiv.classList.add('warning');
    } else {
        timerDiv.classList.remove('warning');
    }
});

socket.on('timeUp', (data) => {
    showMessage(`Time's up! The word was: ${data.word}`, '#ff6b6b');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('difficultyChange', (data) => {
    showMessage(`Difficulty changed to ${data.difficulty}!`, '#667eea');
});

function updatePlayersList(players) {
    const list = document.getElementById('playersList');
    list.innerHTML = '<h3>Players:</h3>' + 
        players.map(p => `<div>${p.name}</div>`).join('');
}

function updateScores(scores) {
    const scoresDiv = document.getElementById('scores');
    scoresDiv.innerHTML = '<strong>Scores:</strong> ' + 
        scores.map(s => `${s.name}: ${s.score}`).join(' | ');
}

// Enter key for guess input
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('guessInput') === document.activeElement) {
        submitGuess();
    }
});