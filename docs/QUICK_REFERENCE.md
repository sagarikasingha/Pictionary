# Quick Reference Card

## 🚀 Quick Start

```bash
npm install
npm start
# Open http://localhost:3000 in 2+ browser windows
```

## 📡 Socket.IO Events Cheat Sheet

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `createRoom` | `playerName` | Create new room |
| `joinRoom` | `{roomCode, playerName}` | Join existing room |
| `startGame` | `roomCode` | Start the game |
| `drawing` | `{roomCode, data}` | Send drawing data |
| `guess` | `{roomCode, guess}` | Submit guess |

### Server → Client
| Event | Payload | Who Receives | Description |
|-------|---------|--------------|-------------|
| `roomCreated` | `{roomCode, players}` | Creator | Room created |
| `playerJoined` | `{players}` | All in room | Player joined |
| `joinError` | `message` | Joiner | Join failed |
| `yourTurn` | `{word, round}` | Drawer | Your turn |
| `waitingForDrawing` | `{drawer, round}` | Guessers | Wait for drawer |
| `drawing` | `data` | All except drawer | Drawing data |
| `correctGuess` | `{guesser, word, scores}` | All in room | Correct guess |
| `wrongGuess` | `{guesser, guess}` | Drawer only | Wrong guess |
| `hint` | `{letters}` | Guesser (after 3 wrong) | Word length hint |
| `playerLeft` | `{players}` | All in room | Player left |

## 🎨 Drawing Data Format

```javascript
// Start drawing (mousedown)
{
  type: 'start',
  x: number,
  y: number,
  color: string
}

// Continue drawing (mousemove)
{
  type: 'draw',
  x: number,
  y: number,
  color: string
}

// Stop drawing (mouseup)
{
  type: 'stop'
}

// Clear canvas
{
  clear: true
}
```

## 🎯 Game Rules

| Rule | Value |
|------|-------|
| Correct guess points | 100 |
| Drawer points | 50 |
| Rounds 1-3 | Easy words |
| Rounds 4-6 | Medium words |
| Rounds 7+ | Hard words |
| Wrong guesses for hint | 3 |
| Room code length | 4 letters |
| Min players | 2 |

## 🔍 Debugging Commands

### Check Server Logs
```bash
# Look for these patterns:
[CONNECTION] - New connections
[CREATE_ROOM] - Room creation
[JOIN_ROOM] - Player joins
[START_GAME] - Game starts
[GUESS] - Guess attempts
[HINT] - Hints sent
```

### Check Client Logs (Browser Console)
```javascript
// Look for these patterns:
[CLIENT] Connected to server
[CLIENT] Creating room for player: ...
[CLIENT] Submitting guess: ...
[CLIENT] Wrong guess received: ...
[CLIENT] Hint received: ...
[CLIENT] Correct guess by ...
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Guess not working | Check if you're the drawer (drawers can't guess) |
| Drawing not syncing | Check Socket.IO connection in console |
| Can't join room | Verify room code and name uniqueness |
| Hint not showing | Make 3 wrong guesses first |
| Canvas not drawing | Check if it's your turn (isMyTurn flag) |

## 📁 File Structure

```
Pictionary/
├── server.js              # Backend (Socket.IO server)
├── package.json           # Dependencies
└── public/
    ├── index.html        # UI structure
    ├── style.css         # Styling
    └── script.js         # Client logic
```

## 🔧 Key Functions

### Server (server.js)
- `generateRoomCode()` - Generate 4-letter code
- `getRandomWord(difficulty)` - Get word by difficulty
- `getDifficulty(round)` - Calculate difficulty from round

### Client (script.js)
- `createRoom()` - Create new room
- `joinRoom()` - Join existing room
- `startGame()` - Start the game
- `startDrawing(e)` - Begin drawing
- `draw(e)` - Continue drawing
- `stopDrawing()` - End drawing
- `submitGuess()` - Submit guess
- `changeColor(color)` - Change pen color
- `changeBoardColor(color)` - Change board color
- `clearCanvas()` - Clear drawing

## 🎨 Color Palette

```javascript
Colors available:
#000 - Black
#f00 - Red
#0f0 - Green
#00f - Blue
#ff0 - Yellow
#f0f - Magenta
#0ff - Cyan
#fff - White
```

## 📊 Room Data Structure

```javascript
{
  code: "ABCD",                    // 4-letter room code
  players: [                       // Array of players
    {
      id: "socket-id",
      name: "PlayerName",
      score: 0
    }
  ],
  currentDrawer: 0,                // Index of current drawer
  currentWord: "cat",              // Word to guess
  round: 1,                        // Current round
  gameStarted: true,               // Game state
  wrongGuesses: Map {              // Wrong guess counter
    "socket-id": 3
  }
}
```

## 🧪 Testing Checklist

- [ ] Create room
- [ ] Join room with valid code
- [ ] Try duplicate name (should fail)
- [ ] Start game
- [ ] Draw on canvas (drawer)
- [ ] See drawing (guesser)
- [ ] Try to draw (guesser - should fail)
- [ ] Submit 3 wrong guesses
- [ ] See hint appear
- [ ] Submit correct guess
- [ ] See popup on both screens
- [ ] Verify scores updated
- [ ] Verify turn rotated

## 💡 Tips

1. **Always check console logs** - Both server and client log everything
2. **Test with 2+ windows** - Open multiple browser windows/tabs
3. **Use incognito mode** - Avoid cookie/session conflicts
4. **Check network tab** - See Socket.IO messages in DevTools
5. **Restart server** - If rooms get corrupted (in-memory storage)

## 🔗 Useful Links

- Socket.IO Docs: https://socket.io/docs/
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Express Docs: https://expressjs.com/
