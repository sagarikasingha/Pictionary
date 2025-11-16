# Pictionary Game

A full-stack real-time multiplayer Pictionary game built with Node.js, Express, and Socket.IO.

## 🎮 Live Demo

Start the server and open `http://localhost:3000` in multiple browser windows to play!

## Features

- **Web-based gameplay** - Play directly in your browser
- **Game rules display** - Clear instructions shown at start
- **4-letter room codes** - Easy room joining system
- **Multiple board colors** - White, black, and green backgrounds
- **Color palette** - 8 different drawing colors
- **Turn-based drawing** - Players take turns drawing and guessing
- **Scoring system** - 100 points for correct guess, 50 for drawer
- **Progressive difficulty** - Words get harder every 3 rounds
- **Hint system** - Get word length hint after 3 wrong guesses
- **Real-time guesses** - Drawer sees all guesses in real-time

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and go to `http://localhost:3000`

## How to Play

1. Enter your name and create a room or join with a 4-letter code
2. Wait for other players to join (minimum 2 players)
3. Take turns drawing the given word while others guess
4. First correct guesser gets 100 points, drawer gets 50 points
5. Words become more challenging every 3 rounds
6. Get hints after 3 wrong guesses

## Game Rules

- Players take turns drawing and guessing words
- Correct guesser gets 100 points, drawer gets 50 points  
- Words get harder every 3 rounds (easy → medium → hard)
- After 3 wrong guesses, you get a hint showing word length
- Use 4-letter room codes to join games
- Drawing tools include color palette and board color options

## 🏗️ Architecture

### Backend (Node.js + Express + Socket.IO)
- Real-time bidirectional communication
- Room-based game management
- Turn rotation and scoring logic
- Word difficulty progression
- Comprehensive request logging

### Frontend (HTML5 + CSS3 + JavaScript)
- Canvas-based drawing interface
- Socket.IO client for real-time updates
- Responsive UI with multiple screens
- Drawing synchronization
- Client-side validation

## 📡 API Events

### Client → Server
- `createRoom(playerName)` - Create new game room
- `joinRoom({roomCode, playerName})` - Join existing room
- `startGame(roomCode)` - Start the game
- `drawing({roomCode, data})` - Send drawing data
- `guess({roomCode, guess})` - Submit word guess

### Server → Client
- `roomCreated({roomCode, players})` - Room created
- `playerJoined({players})` - Player joined
- `yourTurn({word, round})` - Your turn to draw
- `waitingForDrawing({drawer, round})` - Wait for drawer
- `correctGuess({guesser, word, scores})` - Correct guess
- `wrongGuess({guesser, guess})` - Wrong guess (drawer only)
- `hint({letters})` - Hint after 3 wrong guesses

## 🧪 Testing

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test:
1. Start server: `npm start`
2. Open two browser windows at `http://localhost:3000`
3. Create room in window 1, join in window 2
4. Start game and test drawing/guessing
5. Check browser console (F12) and server logs

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Full system architecture
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing procedures
- [FIXES.md](FIXES.md) - Recent bug fixes

## 🔧 Development

For development with auto-restart:
```bash
npm run dev
```

## 🐛 Debugging

Both client and server have comprehensive logging:
- **Server logs**: Check terminal for `[CONNECTION]`, `[GUESS]`, etc.
- **Client logs**: Open browser console (F12) for `[CLIENT]` messages

## 🚀 Features Verified

✅ Backend handles all requests (create, join, start, draw, guess)  
✅ Frontend sends requests via Socket.IO  
✅ Drawing synchronization (connected lines)  
✅ Guessers cannot draw  
✅ Wrong guesses show to drawer only  
✅ Hints after 3 wrong guesses  
✅ Correct guess popup to both players  
✅ Duplicate name prevention  
✅ Turn rotation  
✅ Scoring system  
✅ Progressive difficulty