# Word Generation System - Complete Guide

## Overview

The word generation system selects words for players to draw based on the current round number. Words get progressively harder every 3 rounds.

---

## 📍 Location in Code

**File**: `server.js`  
**Lines**: 13-16 (word lists), 22-30 (helper functions)

---

## 🎯 Step-by-Step Explanation

### Step 1: Word Storage (Lines 13-16)

```javascript
const words = {
  easy: ['cat', 'dog', 'car', 'sun', 'tree', 'house', 'book', 'fish', 'bird', 'ball'],
  medium: ['elephant', 'computer', 'rainbow', 'mountain', 'butterfly', 'sandwich', 'bicycle', 'guitar', 'camera', 'flower'],
  hard: ['refrigerator', 'helicopter', 'microscope', 'constellation', 'architecture', 'democracy', 'philosophy', 'encyclopedia', 'metamorphosis', 'extraordinary']
};
```

**Explanation**:
- `words` is a JavaScript object with 3 properties
- Each property is an array of strings
- **easy**: Simple 3-5 letter words
- **medium**: Moderate 7-10 letter words  
- **hard**: Complex 10+ letter words

---

### Step 2: Difficulty Calculation (Lines 27-31)

```javascript
function getDifficulty(round) {
  if (round <= 3) return 'easy';
  if (round <= 6) return 'medium';
  return 'hard';
}
```

**Explanation**:
- Takes `round` number as input
- Returns difficulty level as string
- **Logic**:
  - Rounds 1-3 → 'easy'
  - Rounds 4-6 → 'medium'
  - Rounds 7+ → 'hard'

**Example**:
```javascript
getDifficulty(1)  // Returns: 'easy'
getDifficulty(4)  // Returns: 'medium'
getDifficulty(10) // Returns: 'hard'
```

---

### Step 3: Random Word Selection (Lines 22-25)

```javascript
function getRandomWord(difficulty) {
  const wordList = words[difficulty];
  return wordList[Math.floor(Math.random() * wordList.length)];
}
```

**Explanation**:

**Line 1**: Function takes difficulty level ('easy', 'medium', or 'hard')

**Line 2**: Get the word array for that difficulty
```javascript
// If difficulty = 'easy'
const wordList = words['easy'];
// wordList = ['cat', 'dog', 'car', 'sun', ...]
```

**Line 3**: Pick random word from array
```javascript
Math.random()                    // Random number 0.0 to 0.999...
Math.random() * wordList.length  // Random number 0 to array length
Math.floor(...)                  // Round down to integer
wordList[index]                  // Get word at that index
```

**Example**:
```javascript
// If wordList = ['cat', 'dog', 'car'] (length = 3)
Math.random() = 0.7
0.7 * 3 = 2.1
Math.floor(2.1) = 2
wordList[2] = 'car'  // Returns 'car'
```

---

## 🎮 Complete Flow

### When Game Starts (Line 77)

```javascript
socket.on('startGame', (roomCode) => {
  const room = rooms.get(roomCode);
  if (room && room.players.length >= 2) {
    room.gameStarted = true;
    
    // WORD GENERATION HAPPENS HERE ⬇️
    room.currentWord = getRandomWord(getDifficulty(room.round));
    
    room.wrongGuesses.clear();
    const drawer = room.players[room.currentDrawer];
    io.to(drawer.id).emit('yourTurn', { word: room.currentWord, round: room.round });
  }
});
```

**Step-by-step**:
1. Game starts, `room.round = 1`
2. Call `getDifficulty(1)` → returns `'easy'`
3. Call `getRandomWord('easy')` → returns random word like `'cat'`
4. Store in `room.currentWord = 'cat'`
5. Send word to drawer

---

### When Turn Rotates (Line 125)

```javascript
setTimeout(() => {
  // WORD GENERATION HAPPENS HERE ⬇️
  room.currentWord = getRandomWord(getDifficulty(room.round));
  
  room.wrongGuesses.clear();
  const newDrawer = room.players[room.currentDrawer];
  io.to(newDrawer.id).emit('yourTurn', { word: room.currentWord, round: room.round });
}, 3000);
```

**Step-by-step**:
1. Player guesses correctly
2. Turn rotates to next player
3. If all players had a turn, `room.round++`
4. Call `getDifficulty(room.round)` → get new difficulty
5. Call `getRandomWord(difficulty)` → get new word
6. Send new word to new drawer

---

## 📊 Difficulty Progression Example

```
Game Timeline:

Round 1: getDifficulty(1) → 'easy'   → getRandomWord('easy')   → 'cat'
Round 2: getDifficulty(2) → 'easy'   → getRandomWord('easy')   → 'dog'
Round 3: getDifficulty(3) → 'easy'   → getRandomWord('easy')   → 'sun'

Round 4: getDifficulty(4) → 'medium' → getRandomWord('medium') → 'elephant'
Round 5: getDifficulty(5) → 'medium' → getRandomWord('medium') → 'rainbow'
Round 6: getDifficulty(6) → 'medium' → getRandomWord('medium') → 'guitar'

Round 7: getDifficulty(7) → 'hard'   → getRandomWord('hard')   → 'refrigerator'
Round 8: getDifficulty(8) → 'hard'   → getRandomWord('hard')   → 'constellation'
Round 9: getDifficulty(9) → 'hard'   → getRandomWord('hard')   → 'philosophy'
```

---

## 🔧 How to Customize Words

### Add More Words

**Location**: `server.js`, lines 13-16

```javascript
const words = {
  easy: [
    'cat', 'dog', 'car', 'sun', 'tree', 'house', 'book', 'fish', 'bird', 'ball',
    // ADD MORE EASY WORDS HERE ⬇️
    'pen', 'cup', 'hat', 'bed', 'key', 'box', 'egg', 'ice', 'map', 'net'
  ],
  medium: [
    'elephant', 'computer', 'rainbow', 'mountain', 'butterfly', 'sandwich', 'bicycle', 'guitar', 'camera', 'flower',
    // ADD MORE MEDIUM WORDS HERE ⬇️
    'umbrella', 'keyboard', 'backpack', 'dinosaur', 'waterfall', 'spaceship'
  ],
  hard: [
    'refrigerator', 'helicopter', 'microscope', 'constellation', 'architecture', 'democracy', 'philosophy', 'encyclopedia', 'metamorphosis', 'extraordinary',
    // ADD MORE HARD WORDS HERE ⬇️
    'photosynthesis', 'cryptocurrency', 'biodiversity', 'electromagnetic'
  ]
};
```

### Change Difficulty Thresholds

**Location**: `server.js`, lines 27-31

```javascript
function getDifficulty(round) {
  // CUSTOMIZE THESE NUMBERS ⬇️
  if (round <= 5) return 'easy';      // First 5 rounds = easy
  if (round <= 10) return 'medium';   // Rounds 6-10 = medium
  return 'hard';                      // Round 11+ = hard
}
```

### Add New Difficulty Level

```javascript
const words = {
  easy: ['cat', 'dog', ...],
  medium: ['elephant', ...],
  hard: ['refrigerator', ...],
  // ADD NEW LEVEL ⬇️
  expert: ['antidisestablishmentarianism', 'pneumonoultramicroscopicsilicovolcanoconiosis']
};

function getDifficulty(round) {
  if (round <= 3) return 'easy';
  if (round <= 6) return 'medium';
  if (round <= 9) return 'hard';
  return 'expert';  // Round 10+ = expert
}
```

---

## 🧪 Testing Word Generation

### Test in Browser Console

Open browser console (F12) and run:

```javascript
// Test getDifficulty
console.log(getDifficulty(1));   // Should print: 'easy'
console.log(getDifficulty(5));   // Should print: 'medium'
console.log(getDifficulty(10));  // Should print: 'hard'

// Test getRandomWord
console.log(getRandomWord('easy'));    // Should print random easy word
console.log(getRandomWord('medium'));  // Should print random medium word
console.log(getRandomWord('hard'));    // Should print random hard word
```

### Test in Server

Add console logs in `server.js`:

```javascript
socket.on('startGame', (roomCode) => {
  const room = rooms.get(roomCode);
  if (room && room.players.length >= 2) {
    room.gameStarted = true;
    
    const difficulty = getDifficulty(room.round);
    const word = getRandomWord(difficulty);
    
    // ADD THESE LOGS ⬇️
    console.log(`[WORD] Round ${room.round} → Difficulty: ${difficulty} → Word: ${word}`);
    
    room.currentWord = word;
    // ... rest of code
  }
});
```

**Expected Output**:
```
[WORD] Round 1 → Difficulty: easy → Word: cat
[WORD] Round 4 → Difficulty: medium → Word: elephant
[WORD] Round 7 → Difficulty: hard → Word: refrigerator
```

---

## 📝 Summary

### Key Functions

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `getDifficulty(round)` | Determine difficulty level | Round number (1, 2, 3...) | 'easy', 'medium', or 'hard' |
| `getRandomWord(difficulty)` | Pick random word | Difficulty level | Random word string |

### Word Selection Process

```
1. Game starts or turn rotates
   ↓
2. Get current round number (e.g., round = 4)
   ↓
3. Calculate difficulty: getDifficulty(4) → 'medium'
   ↓
4. Get word list: words['medium'] → ['elephant', 'computer', ...]
   ↓
5. Pick random word: getRandomWord('medium') → 'elephant'
   ↓
6. Store in room: room.currentWord = 'elephant'
   ↓
7. Send to drawer: emit('yourTurn', { word: 'elephant' })
```

### Difficulty Timeline

- **Rounds 1-3**: Easy words (3-5 letters)
- **Rounds 4-6**: Medium words (7-10 letters)
- **Rounds 7+**: Hard words (10+ letters)

---

## 🎯 Quick Reference

**Where words are stored**: `server.js` lines 13-16  
**Where difficulty is calculated**: `server.js` lines 27-31  
**Where random word is picked**: `server.js` lines 22-25  
**When word is generated**: Game start (line 77) and turn rotation (line 125)

**To add words**: Edit the `words` object arrays  
**To change difficulty**: Edit the `getDifficulty()` function  
**To test**: Add console.log statements and check server terminal
