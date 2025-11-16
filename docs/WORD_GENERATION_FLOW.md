# Word Generation Flow - Visual Guide

## 🎯 Complete Visual Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORD GENERATION SYSTEM                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: WORD STORAGE (server.js lines 13-16)                      │
└─────────────────────────────────────────────────────────────────────┘

    const words = {
      easy: ['cat', 'dog', 'car', 'sun', 'tree', ...],      ← 10 words
      medium: ['elephant', 'computer', 'rainbow', ...],      ← 10 words
      hard: ['refrigerator', 'helicopter', ...]              ← 10 words
    }

                              ↓

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: GAME STARTS (server.js line 77)                           │
└─────────────────────────────────────────────────────────────────────┘

    socket.on('startGame', (roomCode) => {
      const room = rooms.get(roomCode);
      room.round = 1;  ← Starting round
      
      // Generate word ⬇️
      room.currentWord = getRandomWord(getDifficulty(room.round));
    });

                              ↓

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: CALCULATE DIFFICULTY (server.js lines 27-31)              │
└─────────────────────────────────────────────────────────────────────┘

    getDifficulty(room.round)
    
    Input: room.round = 1
           ↓
    function getDifficulty(round) {
      if (round <= 3) return 'easy';     ← Round 1 matches this!
      if (round <= 6) return 'medium';
      return 'hard';
    }
           ↓
    Output: 'easy'

                              ↓

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: GET RANDOM WORD (server.js lines 22-25)                   │
└─────────────────────────────────────────────────────────────────────┘

    getRandomWord('easy')
    
    Input: difficulty = 'easy'
           ↓
    function getRandomWord(difficulty) {
      const wordList = words[difficulty];
      // wordList = ['cat', 'dog', 'car', 'sun', 'tree', ...]
           ↓
      return wordList[Math.floor(Math.random() * wordList.length)];
      // Math.random() = 0.3
      // 0.3 * 10 = 3
      // Math.floor(3) = 3
      // wordList[3] = 'sun'
    }
           ↓
    Output: 'sun'

                              ↓

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: STORE AND SEND WORD                                       │
└─────────────────────────────────────────────────────────────────────┘

    room.currentWord = 'sun';  ← Stored in room object
           ↓
    io.to(drawer.id).emit('yourTurn', { 
      word: 'sun',              ← Sent to drawer
      round: 1 
    });
           ↓
    Drawer sees: "Your word: sun"
```

---

## 🔄 Turn Rotation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHEN PLAYER GUESSES CORRECTLY                                      │
└─────────────────────────────────────────────────────────────────────┘

Player guesses 'sun' correctly
           ↓
┌──────────────────────────────┐
│  Update Scores               │
│  player.score += 100         │
│  drawer.score += 50          │
└──────────────────────────────┘
           ↓
┌──────────────────────────────┐
│  Rotate Turn                 │
│  room.currentDrawer++        │
│  If back to first player:    │
│    room.round++              │
└──────────────────────────────┘
           ↓
┌──────────────────────────────┐
│  Generate New Word           │
│  (Same process as above)     │
└──────────────────────────────┘
           ↓
    getDifficulty(room.round)
           ↓
    getRandomWord(difficulty)
           ↓
    room.currentWord = new word
           ↓
    Send to next drawer
```

---

## 📊 Difficulty Progression Chart

```
Round Number    Difficulty    Example Words
─────────────────────────────────────────────────────────
    1              easy          cat
    2              easy          dog
    3              easy          sun
    ─────────────────────────────────────────────────────
    4             medium         elephant
    5             medium         computer
    6             medium         rainbow
    ─────────────────────────────────────────────────────
    7              hard          refrigerator
    8              hard          helicopter
    9              hard          microscope
    10             hard          constellation
    ...            hard          ...
```

---

## 🎲 Random Selection Explained

### How Math.random() Works

```
Step 1: Generate random decimal
Math.random() → 0.7234891234

Step 2: Multiply by array length
0.7234891234 * 10 = 7.234891234

Step 3: Round down to integer
Math.floor(7.234891234) = 7

Step 4: Use as array index
wordList[7] → 'fish'
```

### Visual Example

```
Array: ['cat', 'dog', 'car', 'sun', 'tree', 'house', 'book', 'fish', 'bird', 'ball']
Index:   0      1      2      3      4       5        6       7       8       9

Random number: 0.7234891234
Calculation: 0.7234891234 * 10 = 7.234891234
Floor: Math.floor(7.234891234) = 7
Result: wordList[7] = 'fish'
```

---

## 🔍 Code Locations Reference

```
server.js
├── Lines 13-16: Word Storage
│   const words = { easy: [...], medium: [...], hard: [...] }
│
├── Lines 22-25: Random Word Selection
│   function getRandomWord(difficulty) { ... }
│
├── Lines 27-31: Difficulty Calculation
│   function getDifficulty(round) { ... }
│
├── Line 77: Game Start - First Word Generation
│   socket.on('startGame', ...) {
│     room.currentWord = getRandomWord(getDifficulty(room.round));
│   }
│
└── Line 125: Turn Rotation - New Word Generation
    setTimeout(() => {
      room.currentWord = getRandomWord(getDifficulty(room.round));
    }, 3000);
```

---

## 🎮 Real Game Example

```
┌─────────────────────────────────────────────────────────────────────┐
│  GAME SESSION EXAMPLE                                               │
└─────────────────────────────────────────────────────────────────────┘

Players: Alice, Bob, Charlie

Turn 1 (Round 1):
  ├─ getDifficulty(1) → 'easy'
  ├─ getRandomWord('easy') → 'cat'
  ├─ Alice draws 'cat'
  └─ Bob guesses correctly → Turn rotates

Turn 2 (Round 1):
  ├─ getDifficulty(1) → 'easy'
  ├─ getRandomWord('easy') → 'dog'
  ├─ Bob draws 'dog'
  └─ Charlie guesses correctly → Turn rotates

Turn 3 (Round 1):
  ├─ getDifficulty(1) → 'easy'
  ├─ getRandomWord('easy') → 'sun'
  ├─ Charlie draws 'sun'
  └─ Alice guesses correctly → Round complete! Round++

Turn 4 (Round 2):
  ├─ getDifficulty(2) → 'easy'
  ├─ getRandomWord('easy') → 'tree'
  ├─ Alice draws 'tree'
  └─ Bob guesses correctly → Turn rotates

... (Rounds 2-3 continue with easy words)

Turn 10 (Round 4):
  ├─ getDifficulty(4) → 'medium'  ← Difficulty increases!
  ├─ getRandomWord('medium') → 'elephant'
  ├─ Alice draws 'elephant'
  └─ Bob guesses correctly → Turn rotates

... (Rounds 4-6 continue with medium words)

Turn 19 (Round 7):
  ├─ getDifficulty(7) → 'hard'  ← Difficulty increases again!
  ├─ getRandomWord('hard') → 'refrigerator'
  ├─ Alice draws 'refrigerator'
  └─ Charlie guesses correctly → Turn rotates

... (Round 7+ continue with hard words)
```

---

## 🛠️ Customization Examples

### Example 1: Add More Words

```javascript
const words = {
  easy: [
    'cat', 'dog', 'car', 'sun', 'tree', 'house', 'book', 'fish', 'bird', 'ball',
    // Add 10 more ⬇️
    'pen', 'cup', 'hat', 'bed', 'key', 'box', 'egg', 'ice', 'map', 'net'
  ],
  // Now 20 easy words total!
};
```

### Example 2: Change Difficulty Timing

```javascript
function getDifficulty(round) {
  if (round <= 5) return 'easy';      // 5 rounds instead of 3
  if (round <= 10) return 'medium';   // 5 rounds instead of 3
  return 'hard';
}
```

### Example 3: Add Category-Based Words

```javascript
const words = {
  easy: {
    animals: ['cat', 'dog', 'fish', 'bird'],
    objects: ['car', 'book', 'cup', 'pen'],
    nature: ['sun', 'tree', 'rain', 'snow']
  },
  // ... medium, hard
};

function getRandomWord(difficulty) {
  const categories = Object.keys(words[difficulty]);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const wordList = words[difficulty][randomCategory];
  return wordList[Math.floor(Math.random() * wordList.length)];
}
```

---

## 📝 Quick Summary

### The 3 Key Functions

1. **words** (object) - Stores all words organized by difficulty
2. **getDifficulty(round)** - Determines which difficulty to use
3. **getRandomWord(difficulty)** - Picks a random word from that difficulty

### The Flow

```
Round Number → getDifficulty() → Difficulty Level → getRandomWord() → Random Word
     1       →      'easy'      →      'easy'      →      'cat'      →    'cat'
     5       →      'medium'    →     'medium'     →   'elephant'   → 'elephant'
     10      →      'hard'      →      'hard'      → 'refrigerator' → 'refrigerator'
```

### Where It Happens

- **Game Start**: Line 77 in server.js
- **Turn Rotation**: Line 125 in server.js
- **Always**: After someone guesses correctly

---

## 🎯 Key Takeaways

✅ Words are stored in a simple JavaScript object  
✅ Difficulty is calculated based on round number  
✅ Random selection uses Math.random() and array indexing  
✅ New word is generated at game start and after each correct guess  
✅ Easy to customize by editing the words object or getDifficulty function  
