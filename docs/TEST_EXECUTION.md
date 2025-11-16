# Test Execution Guide

## 📋 Prerequisites

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `@cucumber/cucumber` - BDD testing framework
- `playwright` - Browser automation
- `chai` - Assertion library

### 2. Install Playwright Browsers
```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

---

## 🚀 Running Tests

### Method 1: Run All Tests (Recommended)
```bash
npm test
```

**What happens:**
1. Server starts automatically on port 3000
2. All Cucumber scenarios execute
3. Test report generates in `tests/reports/`
4. Server stops automatically

**Output:**
```
╔════════════════════════════════════════════════════════════════╗
║           PICTIONARY GAME - TEST SUITE STARTING            ║
╚════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────┐
│ 🎬 SCENARIO: Create a new game room
└────────────────────────────────────────────────────────────────┘
  📋 Context: the server is running on port 3000
     ✅ PASSED
  ▶️ Action: Player1 creates a room with name "Alice"
     ✅ PASSED
...
```

---

### Method 2: Run Tests in Headless Mode
```bash
npm run test:headless
```

**Difference:**
- Browsers run in background (no visible windows)
- Faster execution
- Good for CI/CD pipelines

---

### Method 3: Manual Test Execution

#### Step 1: Start Server
```bash
npm start
```

Keep this terminal open. Server runs on `http://localhost:3000`

#### Step 2: Run Tests (New Terminal)
```bash
npx cucumber-js tests/features --require tests/steps --require tests/support
```

#### Step 3: Stop Server
Press `Ctrl+C` in the server terminal

---

## 🎯 Running Specific Tests

### Run Single Feature File
```bash
npx cucumber-js tests/features/game.feature
```

### Run Specific Scenario
```bash
npx cucumber-js tests/features/game.feature:5
```
(Line 5 is where the scenario starts)

### Run Scenarios by Tag
Add tags to scenarios in `game.feature`:
```gherkin
@smoke
Scenario: Create a new game room
```

Then run:
```bash
npx cucumber-js --tags "@smoke"
```

---

## 📊 Test Reports

### HTML Report
After running tests, open:
```
tests/reports/cucumber-report.html
```

**Contains:**
- ✅ Passed scenarios
- ❌ Failed scenarios
- ⏱️ Execution time
- 📸 Screenshots (if configured)

### JSON Report
```
tests/reports/cucumber-report.json
```

Use for CI/CD integration or custom reporting.

---

## 🐛 Debugging Tests

### Run with Visible Browser
Edit `tests/steps/game.steps.js`:
```javascript
browser = await chromium.launch({ 
  headless: false,  // Show browser
  slowMo: 100       // Slow down actions
});
```

### Add Breakpoints
```javascript
When('Player1 creates a room', async function() {
  await page1.fill('#playerName', 'Alice');
  debugger;  // Pauses here
  await page1.click('button:has-text("Create Room")');
});
```

Run with:
```bash
node --inspect-brk node_modules/.bin/cucumber-js tests/features
```

### Take Screenshots on Failure
Add to `tests/support/hooks.js`:
```javascript
After(async function(scenario) {
  if (scenario.result.status === 'FAILED') {
    const screenshot = await page1.screenshot();
    this.attach(screenshot, 'image/png');
  }
});
```

---

## 🔧 Troubleshooting

### Issue: "Server not running"
**Solution:**
```bash
# Terminal 1
npm start

# Terminal 2 (wait 2 seconds)
npm test
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Windows
taskkill /F /IM node.exe

# Then restart
npm start
```

### Issue: "Playwright browsers not installed"
**Solution:**
```bash
npx playwright install
```

### Issue: "Tests timeout"
**Solution:**
Increase timeout in `tests/steps/game.steps.js`:
```javascript
Before({ timeout: 60000 }, async function() {
  // 60 second timeout
});
```

### Issue: "Cannot find module"
**Solution:**
```bash
npm install
```

---

## 📈 Test Coverage

Current test scenarios: **18**

### Covered Features:
- ✅ Room creation and joining
- ✅ Duplicate name prevention
- ✅ Game start with 2+ players
- ✅ 60-second timer countdown
- ✅ Timer expiration and turn rotation
- ✅ Real-time drawing synchronization
- ✅ Correct/wrong guess handling
- ✅ Hint system (3 wrong guesses)
- ✅ Board and drawing color changes
- ✅ Canvas clear functionality
- ✅ Exit room feature
- ✅ Progressive difficulty
- ✅ Room persistence

---

## 🎬 Quick Start Example

```bash
# 1. Install everything
npm install
npx playwright install

# 2. Run tests
npm test

# 3. View report
start tests/reports/cucumber-report.html
```

---

## 📝 Writing New Tests

### 1. Add Scenario to `tests/features/game.feature`
```gherkin
Scenario: New feature test
  Given some precondition
  When user does something
  Then expected result occurs
```

### 2. Implement Steps in `tests/steps/game.steps.js`
```javascript
Given('some precondition', async function() {
  // Setup code
});

When('user does something', async function() {
  // Action code
});

Then('expected result occurs', async function() {
  // Assertion code
  expect(result).to.be.true;
});
```

### 3. Run Tests
```bash
npm test
```

---

## 🚦 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx playwright install
      - run: npm test
      - uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: tests/reports/
```

---

## 📞 Support

If tests fail:
1. Check server is running (`npm start`)
2. Check port 3000 is available
3. Check Playwright browsers installed
4. Check test logs for specific errors
5. Run with visible browser for debugging

---

## ✅ Success Criteria

Tests pass when you see:
```
╔════════════════════════════════════════════════════════════════╗
║           PICTIONARY GAME - TEST SUITE COMPLETED           ║
╚════════════════════════════════════════════════════════════════╝

18 scenarios (18 passed)
XX steps (XX passed)
```

All scenarios should show ✅ PASSED status.
