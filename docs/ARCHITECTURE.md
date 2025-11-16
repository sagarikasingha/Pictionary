# Pictionary Game - Full Stack Architecture

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web server framework
- **Socket.IO** - Real-time bidirectional communication

### Frontend
- **HTML5 Canvas** - Drawing interface
- **Vanilla JavaScript** - Client-side logic
- **Socket.IO Client** - Real-time communication
- **CSS3** - Styling and responsive design

## Project Structure

```
Pictionary/
├── server.js              # Backend server with Socket.IO
├── package.json           # Dependencies and scripts
├── public/                # Frontend files (served statically)
│   ├── index.html        # Game UI
│   ├── style.css         # Styling
│   └── script.js         # Client-side logic
├── README.md             # Project documentation
├── TESTING_GUIDE.md      # Testing instructions
└── ARCHITECTURE.md       # This file
```

## Backend Architecture (server.js)

### Data Structures

```javascript
rooms = Map {
  "ABCD": {
    code: "ABCD",
    players: [
      { id: "socket-id-1", name: "Player1", score: 0 },
      { id: "socket-id-2", name: "Player2", score: 100 }
    ],
    currentDrawer: 0,           // Index of current drawer
    currentWord: "cat",         // Word to guess
    round: 1,                   // Current round number
    gameStarted: true,          // Game state
    wrongGuesses: Map {         // Track wrong guesses per player
      "socket-id-2": 3
    }
  }
}

words = {
  easy: ["cat", "dog", ...],
  medium: ["elephant", ...],
  hard: ["refrigerator", ...]
}
```

### Socket.IO Events (Server)

#### Incoming Events (from clients):
- `createRoom(playerName)` - Create new game room
- `joinRoom({roomCode, playerName})` - Join existing room
- `startGame(roomCode)` - Start the game
- `drawing({roomCode, data})` - Broadcast drawing data
- `guess({roomCode, guess})` - Submit word guess

#### Outgoing Events (to clients):
- `roomCreated({roomCode, players})` - Room created successfully
- `playerJoined({players})` - Player joined room
- `joinError(message)` - Join failed
- `yourTurn({word, round})` - Your turn to draw
- `waitingForDrawing({drawer, round})` - Wait for drawer
- `drawing(data)` - Drawing data from drawer
- `correctGuess({guesser, word, scores})` - Correct guess made
- `wrongGuess({guesser, guess})` - Wrong guess (to drawer only)
- `hint({letters})` - Hint after 3 wrong guesses
- `playerLeft({players})` - Player disconnected

### Game Logic Flow

```
1. Room Creation/Joining
   ├─ Generate 4-letter code
   ├─ Validate unique player names
   └─ Store in rooms Map

2. Game Start
   ├─ Select word based on difficulty
   ├─ Assign first drawer
   └─ Notify all players

3. Drawing Phase
   ├─ Drawer sends drawing events
   ├─ Server broadcasts to other players
   └─ Guessers receive and render

4. Guessing Phase
   ├─ Receive guess from player
   ├─ Validate against current word
   ├─ If correct:
   │  ├─ Award points (100 to guesser, 50 to drawer)
   │  ├─ Notify all players
   │  ├─ Rotate turn
   │  └─ Select new word
   └─ If wrong:
      ├─ Increment wrong guess counter
      ├─ Notify drawer
      └─ Send hint after 3 attempts

5. Turn Rotation
   ├─ Move to next player
   ├─ Increment round if back to first player
   ├─ Adjust difficulty every 3 rounds
   └─ Clear canvas and reset counters
```

## Frontend Architecture (public/script.js)

### State Management

```javascript
// Global state
currentRoom = ""           // Current room code
isDrawing = false         // Drawing state
currentColor = "#000"     // Selected color
isMyTurn = false          // Am I the drawer?
canvas, ctx               // Canvas references
```

### Canvas Drawing System

```javascript
Drawing Events:
├─ mousedown → startDrawing()
│  ├─ Begin path locally
│  └─ Emit 'start' event to server
├─ mousemove → draw()
│  ├─ Draw line locally
│  └─ Emit 'draw' event with coordinates
└─ mouseup → stopDrawing()
   └─ Emit 'stop' event

Receiving Drawing:
├─ 'start' → beginPath() + moveTo()
├─ 'draw' → lineTo() + stroke()
└─ 'stop' → (end path)
```

### UI Screens

```
1. Menu Screen (#menu)
   ├─ Game rules display
   ├─ Player name input
   ├─ Create room button
   └─ Join room section

2. Lobby Screen (#lobby)
   ├─ Room code display
   ├─ Players list
   └─ Start game button (for creator)

3. Game Screen (#game)
   ├─ Game header (round, scores)
   ├─ Drawing area
   │  ├─ Board color selector
   │  ├─ Color palette
   │  ├─ Clear button
   │  └─ Canvas
   └─ Sidebar
      ├─ Word display (for drawer)
      ├─ Guess area (for guessers)
      │  ├─ Input field
      │  ├─ Guess button
      │  └─ Hint display
      └─ Message notifications
```

### Socket.IO Events (Client)

#### Emitting Events:
```javascript
socket.emit('createRoom', playerName)
socket.emit('joinRoom', {roomCode, playerName})
socket.emit('startGame', roomCode)
socket.emit('drawing', {roomCode, data})
socket.emit('guess', {roomCode, guess})
```

#### Listening Events:
```javascript
socket.on('roomCreated', data => {...})
socket.on('playerJoined', data => {...})
socket.on('yourTurn', data => {...})
socket.on('waitingForDrawing', data => {...})
socket.on('drawing', data => {...})
socket.on('correctGuess', data => {...})
socket.on('wrongGuess', data => {...})
socket.on('hint', data => {...})
```

## Communication Flow

### Example: Player Makes a Guess

```
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│  Guesser    │                │   Server    │                │   Drawer    │
│  (Client)   │                │  (Node.js)  │                │  (Client)   │
└──────┬──────┘                └──────┬──────┘                └──────┬──────┘
       │                              │                              │
       │ 1. Type "cat" + Click Guess  │                              │
       │────────────────────────────>│                              │
       │   emit('guess', {            │                              │
       │     roomCode: "ABCD",        │                              │
       │     guess: "cat"             │                              │
       │   })                         │                              │
       │                              │                              │
       │                              │ 2. Validate guess            │
       │                              │    - Find player             │
       │                              │    - Check if correct        │
       │                              │    - Update scores           │
       │                              │                              │
       │ 3. Correct guess!            │                              │
       │<─────────────────────────────│                              │
       │   on('correctGuess', {       │                              │
       │     guesser: "Player2",      │                              │
       │     word: "cat",             │                              │
       │     scores: [...]            │                              │
       │   })                         │                              │
       │                              │                              │
       │                              │ 4. Notify drawer             │
       │                              │─────────────────────────────>│
       │                              │   on('correctGuess', {...})  │
       │                              │                              │
       │ 5. Show popup alert          │                              │ 5. Show popup alert
       │    Update scores             │                              │    Update scores
       │    Clear canvas              │                              │    Clear canvas
       │                              │                              │
```

### Example: Wrong Guess Flow

```
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│  Guesser    │                │   Server    │                │   Drawer    │
└──────┬──────┘                └──────┬──────┘                └──────┬──────┘
       │                              │                              │
       │ 1. emit('guess', "dog")      │                              │
       │────────────────────────────>│                              │
       │                              │                              │
       │                              │ 2. Wrong! Increment counter  │
       │                              │    wrongGuesses.set(id, 1)   │
       │                              │                              │
       │                              │ 3. Notify drawer only        │
       │                              │─────────────────────────────>│
       │                              │   on('wrongGuess', {         │
       │                              │     guesser: "Player2",      │
       │                              │     guess: "dog"             │
       │                              │   })                         │
       │                              │                              │
       │                              │                              │ 4. Show notification
       │                              │                              │    "❌ Player2: dog"
       │                              │                              │
       │ (After 3rd wrong guess)      │                              │
       │<─────────────────────────────│                              │
       │   on('hint', {               │                              │
       │     letters: 3               │                              │
       │   })                         │                              │
       │                              │                              │
       │ 5. Show hint                 │                              │
       │    "💡 Hint: 3 letters"      │                              │
       │                              │                              │
```

## Security & Validation

### Server-Side Validation
- ✅ Room existence check
- ✅ Duplicate name prevention
- ✅ Drawer cannot guess
- ✅ Game state validation
- ✅ Player authentication via socket ID

### Client-Side Validation
- ✅ Input sanitization (trim)
- ✅ Empty input prevention
- ✅ Drawing permission check (isMyTurn)
- ✅ Room code format (4 letters, uppercase)

## Performance Optimizations

1. **In-Memory Storage**: Fast room/player lookups using Map
2. **Event Broadcasting**: Only send to relevant players
3. **Canvas Optimization**: Efficient drawing with beginPath/stroke
4. **Minimal Data Transfer**: Only coordinates and colors sent
5. **Automatic Cleanup**: Rooms deleted when empty

## Scalability Considerations

Current implementation uses in-memory storage. For production:
- Use Redis for room/player storage
- Implement Socket.IO adapter for multiple servers
- Add database for persistent scores/history
- Implement rate limiting
- Add authentication/authorization

## Error Handling

### Server
- Room not found → emit 'joinError'
- Duplicate name → emit 'joinError'
- Invalid game state → silent ignore with logs

### Client
- Connection lost → auto-reconnect (Socket.IO default)
- Invalid input → alert messages
- Network errors → console logs

## Logging

Both server and client have comprehensive logging:
- Connection events
- Room operations
- Game actions
- Guess validation
- Error conditions

Check browser console (F12) and server terminal for real-time logs.
