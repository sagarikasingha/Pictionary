# Complete Request/Response Flow

## Overview

This document shows the complete flow of data between client and server for every action in the game.

---

## 1️⃣ Create Room Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 1)                                               │
└─────────────────────────────────────────────────────────────────┘
  User enters name: "Player1"
  User clicks "Create Room"
  ↓
  console.log('[CLIENT] Creating room for player: Player1')
  ↓
  socket.emit('createRoom', 'Player1')
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVER                                                          │
└─────────────────────────────────────────────────────────────────┘
  Receives: createRoom event
  ↓
  console.log('[CREATE_ROOM] Player "Player1" creating room')
  ↓
  Generate room code: "ABCD"
  ↓
  Create room object:
  {
    code: "ABCD",
    players: [{ id: "socket-123", name: "Player1", score: 0 }],
    currentDrawer: 0,
    currentWord: "",
    round: 1,
    gameStarted: false,
    wrongGuesses: Map {}
  }
  ↓
  Store in rooms Map
  ↓
  socket.join("ABCD")
  ↓
  console.log('[CREATE_ROOM] Room ABCD created successfully')
  ↓
  socket.emit('roomCreated', {
    roomCode: "ABCD",
    players: [{ id: "socket-123", name: "Player1", score: 0 }]
  })
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 1)                                               │
└─────────────────────────────────────────────────────────────────┘
  Receives: roomCreated event
  ↓
  console.log('[CLIENT] Room created:', data)
  ↓
  currentRoom = "ABCD"
  ↓
  Display lobby screen with:
  - Room code: "ABCD"
  - Players: Player1
  - Start Game button (visible)
```

---

## 2️⃣ Join Room Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 2)                                               │
└─────────────────────────────────────────────────────────────────┘
  User enters name: "Player2"
  User enters room code: "ABCD"
  User clicks "Join Room"
  ↓
  console.log('[CLIENT] Joining room: ABCD as player: Player2')
  ↓
  socket.emit('joinRoom', {
    roomCode: "ABCD",
    playerName: "Player2"
  })
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVER                                                          │
└─────────────────────────────────────────────────────────────────┘
  Receives: joinRoom event
  ↓
  console.log('[JOIN_ROOM] Player "Player2" attempting to join room ABCD')
  ↓
  Validate:
  ✓ Room exists?
  ✓ Game not started?
  ✓ Name not taken?
  ↓
  Add player to room:
  room.players.push({ id: "socket-456", name: "Player2", score: 0 })
  ↓
  socket.join("ABCD")
  ↓
  console.log('[JOIN_ROOM] Player "Player2" joined room ABCD')
  ↓
  io.to("ABCD").emit('playerJoined', {
    players: [
      { id: "socket-123", name: "Player1", score: 0 },
      { id: "socket-456", name: "Player2", score: 0 }
    ]
  })
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Both Windows)                                           │
└─────────────────────────────────────────────────────────────────┘
  Receives: playerJoined event
  ↓
  console.log('[CLIENT] Player joined:', data)
  ↓
  Update players list:
  - Player1
  - Player2
```

---

## 3️⃣ Start Game Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 1 - Creator)                                     │
└─────────────────────────────────────────────────────────────────┘
  User clicks "Start Game"
  ↓
  console.log('[CLIENT] Starting game in room: ABCD')
  ↓
  socket.emit('startGame', 'ABCD')
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVER                                                          │
└─────────────────────────────────────────────────────────────────┘
  Receives: startGame event
  ↓
  console.log('[START_GAME] Starting game in room ABCD')
  ↓
  Validate: room.players.length >= 2
  ↓
  room.gameStarted = true
  ↓
  Select word: room.currentWord = getRandomWord('easy') → "cat"
  ↓
  room.wrongGuesses.clear()
  ↓
  Get drawer: room.players[0] → Player1
  ↓
  io.to("socket-123").emit('yourTurn', {
    word: "cat",
    round: 1
  })
  ↓
  io.to("socket-456").emit('waitingForDrawing', {
    drawer: "Player1",
    round: 1
  })
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 1 - Drawer)                                      │
└─────────────────────────────────────────────────────────────────┘
  Receives: yourTurn event
  ↓
  console.log('[CLIENT] My turn to draw. Word: cat')
  ↓
  isMyTurn = true
  canvas.style.cursor = 'crosshair'
  ↓
  Show game screen with:
  - Word display: "cat"
  - Drawing tools enabled
  - Canvas ready

┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 2 - Guesser)                                     │
└─────────────────────────────────────────────────────────────────┘
  Receives: waitingForDrawing event
  ↓
  console.log('[CLIENT] Waiting for Player1 to draw')
  ↓
  isMyTurn = false
  canvas.style.cursor = 'not-allowed'
  ↓
  Show game screen with:
  - "Player1 is drawing..."
  - Guess input field
  - Canvas (view only)
```

---

## 4️⃣ Drawing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 1 - Drawer)                                      │
└─────────────────────────────────────────────────────────────────┘
  User presses mouse down at (100, 150)
  ↓
  startDrawing() called
  ↓
  Check: isMyTurn === true ✓
  ↓
  isDrawing = true
  ctx.beginPath()
  ctx.moveTo(100, 150)
  ↓
  socket.emit('drawing', {
    roomCode: "ABCD",
    data: {
      type: 'start',
      x: 100,
      y: 150,
      color: '#000'
    }
  })
  ↓
  User moves mouse to (120, 170)
  ↓
  draw() called
  ↓
  ctx.strokeStyle = '#000'
  ctx.lineTo(120, 170)
  ctx.stroke()
  ↓
  socket.emit('drawing', {
    roomCode: "ABCD",
    data: {
      type: 'draw',
      x: 120,
      y: 170,
      color: '#000'
    }
  })
  ↓
  User releases mouse
  ↓
  stopDrawing() called
  ↓
  socket.emit('drawing', {
    roomCode: "ABCD",
    data: { type: 'stop' }
  })
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVER                                                          │
└─────────────────────────────────────────────────────────────────┘
  Receives: drawing events
  ↓
  Broadcast to all OTHER players in room:
  socket.to("ABCD").emit('drawing', data)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 2 - Guesser)                                     │
└─────────────────────────────────────────────────────────────────┘
  Receives: drawing event (type: 'start')
  ↓
  ctx.beginPath()
  ctx.moveTo(100, 150)
  ↓
  Receives: drawing event (type: 'draw')
  ↓
  ctx.strokeStyle = '#000'
  ctx.lineTo(120, 170)
  ctx.stroke()
  ↓
  Result: Drawing appears on guesser's canvas!
```

---

## 5️⃣ Wrong Guess Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 2 - Guesser)                                     │
└─────────────────────────────────────────────────────────────────┘
  User types: "dog"
  User clicks "Guess" button
  ↓
  submitGuess() called
  ↓
  console.log('[CLIENT] Submitting guess: dog in room: ABCD')
  ↓
  socket.emit('guess', {
    roomCode: "ABCD",
    guess: "dog"
  })
  ↓
  Clear input field
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVER                                                          │
└─────────────────────────────────────────────────────────────────┘
  Receives: guess event
  ↓
  console.log('[GUESS] Received guess "dog" in room ABCD')
  ↓
  Find player: Player2 (socket-456)
  Find drawer: Player1 (socket-123)
  ↓
  Validate: player !== drawer ✓
  ↓
  Compare: "dog" === "cat" ✗
  ↓
  console.log('[GUESS] WRONG! "Player2" guessed "dog" (correct: "cat")')
  ↓
  Increment counter:
  wrongGuesses.set("socket-456", 1)
  ↓
  console.log('[GUESS] Wrong guess count for Player2: 1')
  ↓
  Send to drawer ONLY:
  io.to("socket-123").emit('wrongGuess', {
    guesser: "Player2",
    guess: "dog"
  })
  ↓
  console.log('[GUESS] Sent wrong guess notification to drawer')
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 1 - Drawer)                                      │
└─────────────────────────────────────────────────────────────────┘
  Receives: wrongGuess event
  ↓
  console.log('[CLIENT] Wrong guess received:', data)
  ↓
  showMessage("❌ Player2 guessed: dog", '#ff6b6b')
  ↓
  Display red notification for 3 seconds

┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 2 - Guesser)                                     │
└─────────────────────────────────────────────────────────────────┘
  No notification received (guess is private)
```

---

## 6️⃣ Hint Flow (After 3 Wrong Guesses)

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 2 - Guesser)                                     │
└─────────────────────────────────────────────────────────────────┘
  User submits 3rd wrong guess: "bird"
  ↓
  socket.emit('guess', { roomCode: "ABCD", guess: "bird" })
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVER                                                          │
└─────────────────────────────────────────────────────────────────┘
  Receives: guess event
  ↓
  Compare: "bird" === "cat" ✗
  ↓
  Increment: wrongGuesses.set("socket-456", 3)
  ↓
  console.log('[GUESS] Wrong guess count for Player2: 3')
  ↓
  Check: wrongCount === 3 ✓
  ↓
  io.to("socket-456").emit('hint', {
    letters: 3  // "cat".length
  })
  ↓
  console.log('[HINT] Sent hint to Player2: 3 letters')
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 2 - Guesser)                                     │
└─────────────────────────────────────────────────────────────────┘
  Receives: hint event
  ↓
  console.log('[CLIENT] Hint received: 3 letters')
  ↓
  Display hint:
  "💡 Hint: The word has 3 letters"
```

---

## 7️⃣ Correct Guess Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Window 2 - Guesser)                                     │
└─────────────────────────────────────────────────────────────────┘
  User types: "cat"
  User clicks "Guess"
  ↓
  console.log('[CLIENT] Submitting guess: cat in room: ABCD')
  ↓
  socket.emit('guess', {
    roomCode: "ABCD",
    guess: "cat"
  })
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVER                                                          │
└─────────────────────────────────────────────────────────────────┘
  Receives: guess event
  ↓
  console.log('[GUESS] Received guess "cat" in room ABCD')
  ↓
  Compare: "cat" === "cat" ✓
  ↓
  console.log('[GUESS] CORRECT! "Player2" guessed "cat"')
  ↓
  Update scores:
  Player2.score += 100  → 100
  Player1.score += 50   → 50
  ↓
  Broadcast to ALL in room:
  io.to("ABCD").emit('correctGuess', {
    guesser: "Player2",
    word: "cat",
    scores: [
      { name: "Player1", score: 50 },
      { name: "Player2", score: 100 }
    ]
  })
  ↓
  Rotate turn:
  room.currentDrawer = 1  // Now Player2's turn
  ↓
  Wait 3 seconds...
  ↓
  Select new word: "elephant" (round 1, still easy)
  ↓
  room.wrongGuesses.clear()
  ↓
  io.to("socket-456").emit('yourTurn', {
    word: "elephant",
    round: 1
  })
  ↓
  io.to("socket-123").emit('waitingForDrawing', {
    drawer: "Player2",
    round: 1
  })
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Both Windows)                                           │
└─────────────────────────────────────────────────────────────────┘
  Receives: correctGuess event
  ↓
  console.log('[CLIENT] Correct guess by Player2')
  ↓
  alert("🎉 Player2 guessed \"cat\" correctly!")
  ↓
  Update scores display:
  Scores: Player1: 50 | Player2: 100
  ↓
  Clear canvas
  ↓
  Wait for next turn...
```

---

## Summary

### Total Request Types: 5
1. `createRoom` - Create new game room
2. `joinRoom` - Join existing room
3. `startGame` - Start the game
4. `drawing` - Send drawing data
5. `guess` - Submit word guess

### Total Response Types: 8
1. `roomCreated` - Room created successfully
2. `playerJoined` - Player joined room
3. `joinError` - Join failed
4. `yourTurn` - Your turn to draw
5. `waitingForDrawing` - Wait for drawer
6. `drawing` - Drawing data
7. `correctGuess` - Correct guess made
8. `wrongGuess` - Wrong guess (drawer only)
9. `hint` - Hint after 3 wrong guesses

### Key Points
✅ All requests go through Socket.IO (no REST API)
✅ Server validates all actions
✅ Comprehensive logging on both sides
✅ Real-time bidirectional communication
✅ Room-based message broadcasting
✅ Private messages (wrong guesses, hints)
✅ Public messages (correct guesses)
