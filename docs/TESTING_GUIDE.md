# Pictionary Game - Testing Guide

## Full Application Architecture

### Backend (server.js)
- **Express Server**: Serves static files from `/public`
- **Socket.IO**: Real-time bidirectional communication
- **Room Management**: In-memory storage using Map
- **Game Logic**: Turn rotation, scoring, word difficulty progression

### Frontend (public/)
- **index.html**: Game UI with lobby and game screens
- **style.css**: Responsive styling
- **script.js**: Canvas drawing, Socket.IO client, game state management

## Request Flow

### 1. Create/Join Room
```
Client → socket.emit('createRoom', playerName)
Server → validates → creates room → socket.emit('roomCreated', data)
Client → receives → shows lobby screen
```

### 2. Start Game
```
Client → socket.emit('startGame', roomCode)
Server → assigns word → socket.emit('yourTurn' to drawer)
Server → socket.emit('waitingForDrawing' to guessers)
```

### 3. Drawing
```
Drawer → mousedown → socket.emit('drawing', {type: 'start', x, y, color})
Drawer → mousemove → socket.emit('drawing', {type: 'draw', x, y, color})
Drawer → mouseup → socket.emit('drawing', {type: 'stop'})
Server → broadcasts to all other players in room
Guessers → receive → replicate drawing on canvas
```

### 4. Guessing
```
Guesser → types guess → clicks Guess button
Client → socket.emit('guess', {roomCode, guess})
Server → validates guess
  ├─ CORRECT → socket.emit('correctGuess' to all)
  └─ WRONG → socket.emit('wrongGuess' to drawer only
           └─ After 3 wrong → socket.emit('hint' to guesser)
```

## Testing Steps

### Step 1: Start Server
```bash
npm install
npm start
```
Server should log: `Server running on port 3000`

### Step 2: Open Two Browser Windows
- Window 1: http://localhost:3000
- Window 2: http://localhost:3000

### Step 3: Create Room (Window 1)
1. Enter name: "Player1"
2. Click "Create Room"
3. Note the 4-letter room code
4. **Check console**: Should see room creation logs

### Step 4: Join Room (Window 2)
1. Enter name: "Player2"
2. Enter room code from Window 1
3. Click "Join Room"
4. **Check console**: Should see join logs
5. Both windows should show 2 players in lobby

### Step 5: Test Duplicate Name (Window 2)
1. Try joining with name "Player1"
2. Should see error: "Name already taken in this room"

### Step 6: Start Game (Window 1)
1. Click "Start Game"
2. **Window 1**: Should see word to draw
3. **Window 2**: Should see "Player1 is drawing..."
4. **Check console**: Both windows should log game start

### Step 7: Test Drawing (Window 1)
1. Select a color from palette
2. Draw on canvas
3. **Window 2**: Should see drawing appear in real-time
4. **Window 2**: Try to draw - should not work (cursor: not-allowed)
5. **Check console**: Should see drawing events

### Step 8: Test Wrong Guesses (Window 2)
1. Type wrong guess: "test"
2. Click "Guess" button
3. **Check console**: Should see `[GUESS] WRONG!` in server logs
4. **Window 1**: Should see red notification: "❌ Player2 guessed: test"
5. Repeat 2 more times with different wrong guesses
6. **Window 2**: After 3rd wrong guess, should see hint: "💡 Hint: The word has X letters"

### Step 9: Test Correct Guess (Window 2)
1. Type the correct word (shown in Window 1)
2. Click "Guess"
3. **Check console**: Should see `[GUESS] CORRECT!` in server logs
4. **Both Windows**: Should see popup alert: "🎉 Player2 guessed [word] correctly!"
5. Scores should update: Player2: 100, Player1: 50
6. Canvas should clear
7. Turn should rotate to Player2

### Step 10: Verify Turn Rotation
1. **Window 2**: Should now see word to draw
2. **Window 1**: Should see "Player2 is drawing..."
3. Roles reversed successfully

## Console Logs to Verify

### Server Console:
```
[CONNECTION] New client connected: [socket-id]
[CREATE_ROOM] Player "Player1" creating room
[CREATE_ROOM] Room ABCD created successfully
[JOIN_ROOM] Player "Player2" attempting to join room ABCD
[JOIN_ROOM] Player "Player2" joined room ABCD
[START_GAME] Starting game in room ABCD
[GUESS] Received guess "test" in room ABCD
[GUESS] WRONG! "Player2" guessed "test" (correct: "cat")
[GUESS] Wrong guess count for Player2: 1
[GUESS] Sent wrong guess notification to drawer
[HINT] Sent hint to Player2: 3 letters
[GUESS] CORRECT! "Player2" guessed "cat"
```

### Browser Console (F12):
```
[CLIENT] Connected to server
[CLIENT] Creating room for player: Player1
[CLIENT] Room created: {roomCode: "ABCD", players: [...]}
[CLIENT] Starting game in room: ABCD
[CLIENT] My turn to draw. Word: cat
[CLIENT] Submitting guess: test in room: ABCD
[CLIENT] Wrong guess received: {guesser: "Player2", guess: "test"}
[CLIENT] Hint received: 3 letters
[CLIENT] Correct guess by Player2
```

## Features Verified

✅ Backend handles all requests (create, join, start, draw, guess)
✅ Frontend sends all requests via Socket.IO
✅ Drawing synchronization works (connected lines)
✅ Guessers cannot draw on canvas
✅ Wrong guesses show popup to drawer only
✅ Hints appear after 3 wrong guesses
✅ Correct guess shows popup to both players
✅ Duplicate names rejected
✅ Turn rotation works
✅ Scoring system works
✅ Word difficulty increases every 3 rounds

## Troubleshooting

If guesses don't work:
1. Check browser console for errors
2. Check server console for `[GUESS]` logs
3. Verify Socket.IO connection: Look for `[CLIENT] Connected to server`
4. Ensure you're not the drawer when guessing

If drawing doesn't sync:
1. Check for `drawing` events in console
2. Verify both clients are in same room
3. Check network tab for Socket.IO messages
