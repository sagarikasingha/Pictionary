# Pictionary Game

A full-stack real-time multiplayer Pictionary game with comprehensive testing.

## 📁 Project Structure

```
Pictionary/
├── src/                    # Source code
│   ├── server.js          # Backend server
│   ├── words.js           # Word lists
│   └── public/            # Frontend files
│       ├── index.html
│       ├── style.css
│       └── script.js
├── tests/                  # Test suite
│   ├── features/          # Cucumber feature files
│   ├── steps/             # Step definitions
│   ├── support/           # Test configuration
│   └── reports/           # Test reports (generated)
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── TESTING_GUIDE.md
│   └── ... (other docs)
├── package.json
└── README.md
```

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Run Application
```bash
npm start
# Open http://localhost:3000
```

### Run Tests

**Option 1: Using batch script (Recommended for Windows)**
```bash
run-tests.bat
```

**Option 2: Manual (2 terminals)**
```bash
# Terminal 1
npm start

# Terminal 2 (wait 3 seconds)
npm run test:manual
```

### Development Mode
```bash
npm run dev
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Headless Mode
```bash
npm run test:headless
```

### Test Reports
After running tests, view the HTML report:
```
tests/reports/cucumber-report.html
```

## 📚 Documentation

All documentation is in the `docs/` folder:
- **ARCHITECTURE.md** - System architecture
- **TESTING_GUIDE.md** - Testing procedures
- **QUICK_REFERENCE.md** - Developer reference
- **WORD_GENERATION_GUIDE.md** - Word system guide

## ✨ Features

- Real-time multiplayer gameplay
- 60-second timer per turn
- Progressive difficulty (easy → medium → hard)
- Hint system after 3 wrong guesses
- Room persistence
- Custom pencil cursor
- Modern animated UI
- 200+ words per difficulty level

## 🎮 How to Play

1. Create or join a room with 4-letter code
2. Wait for players (minimum 2)
3. Take turns drawing and guessing
4. First correct guesser gets 100 points
5. Drawer gets 50 points
6. Complete within 60 seconds!

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Testing**: Playwright, Cucumber, Chai

## 📝 License


