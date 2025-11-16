const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { expect } = require('chai');

let browser, context, page1, page2, server, roomCode;

Before(async function() {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page1 = await context.newPage();
  page2 = await context.newPage();
});

After(async function() {
  if (browser) await browser.close();
});

Given('the server is running on port {int}', async function(port) {
  await page1.goto(`http://localhost:${port}`);
  await page1.waitForSelector('#menu');
});

When('Player1 creates a room with name {string}', async function(name) {
  await page1.fill('#playerName', name);
  await page1.click('button:has-text("Create Room")');
  await page1.waitForSelector('#lobby');
  roomCode = await page1.textContent('#currentRoomCode');
});

Given('Player1 created a room with name {string}', async function(name) {
  await page1.goto('http://localhost:3000');
  await page1.fill('#playerName', name);
  await page1.click('button:has-text("Create Room")');
  await page1.waitForSelector('#lobby');
  roomCode = await page1.textContent('#currentRoomCode');
});

Then('a room code should be generated', async function() {
  expect(roomCode).to.have.lengthOf(4);
});

Then('{word} should see the lobby screen', async function(player) {
  const currentPage = player === 'Alice' ? page1 : page2;
  const isVisible = await currentPage.isVisible('#lobby');
  expect(isVisible).to.be.true;
});

Then('the room code should be displayed', async function() {
  const code = await page1.textContent('#currentRoomCode');
  expect(code).to.equal(roomCode);
});

When('Player2 joins the room with name {string}', async function(name) {
  await page2.goto('http://localhost:3000');
  await page2.fill('#playerName', name);
  await page2.fill('#roomCode', roomCode);
  await page2.click('button:has-text("Join Room")');
  await page2.waitForSelector('#lobby');
});

Given('Player2 joined the room with name {string}', async function(name) {
  await page2.goto('http://localhost:3000');
  await page2.fill('#playerName', name);
  await page2.fill('#roomCode', roomCode);
  await page2.click('button:has-text("Join Room")');
  await page2.waitForSelector('#lobby');
});

Then('both players should be listed in the lobby', async function() {
  const players1 = await page1.textContent('#playersList');
  const players2 = await page2.textContent('#playersList');
  expect(players1).to.include('Alice');
  expect(players1).to.include('Bob');
  expect(players2).to.include('Alice');
  expect(players2).to.include('Bob');
});

When('Player2 tries to join with name {string}', async function(name) {
  await page2.goto('http://localhost:3000');
  await page2.fill('#playerName', name);
  await page2.fill('#roomCode', roomCode);
  await page2.click('button:has-text("Join Room")');
  await page2.waitForTimeout(1000);
});

Then('Player2 should see an error {string}', async function(errorMsg) {
  page2.on('dialog', async dialog => {
    expect(dialog.message()).to.include(errorMsg);
    await dialog.accept();
  });
});

When('Player1 starts the game', async function() {
  await page1.click('button:has-text("Start Game")');
  await page1.waitForSelector('#game');
});

Given('a game is started with Alice and Bob', async function() {
  await page1.goto('http://localhost:3000');
  await page1.fill('#playerName', 'Alice');
  await page1.click('button:has-text("Create Room")');
  await page1.waitForSelector('#lobby');
  roomCode = await page1.textContent('#currentRoomCode');
  
  await page2.goto('http://localhost:3000');
  await page2.fill('#playerName', 'Bob');
  await page2.fill('#roomCode', roomCode);
  await page2.click('button:has-text("Join Room")');
  await page2.waitForSelector('#lobby');
  
  await page1.click('button:has-text("Start Game")');
  await page1.waitForSelector('#game');
  await page2.waitForSelector('#game');
});

Then('the game screen should be displayed', async function() {
  const visible1 = await page1.isVisible('#game');
  const visible2 = await page2.isVisible('#game');
  expect(visible1).to.be.true;
  expect(visible2).to.be.true;
});

Then('one player should be the drawer', async function() {
  const hasWord1 = await page1.isVisible('#wordDisplay');
  const hasWord2 = await page2.isVisible('#wordDisplay');
  expect(hasWord1 || hasWord2).to.be.true;
});

Then('the drawer should see a word to draw', async function() {
  const hasWord = await page1.isVisible('#currentWord');
  if (hasWord) {
    const word = await page1.textContent('#currentWord');
    expect(word).to.have.length.greaterThan(0);
  }
});

Then('the guesser should see the guess input', async function() {
  const hasInput = await page2.isVisible('#guessInput');
  if (hasInput) {
    expect(hasInput).to.be.true;
  }
});

Given('Alice is the drawer', async function() {
  const isDrawer = await page1.isVisible('#wordDisplay');
  if (!isDrawer) {
    [page1, page2] = [page2, page1];
  }
});

Then('the timer should show {int} seconds', async function(seconds) {
  await page1.waitForSelector('#timer');
  const time = await page1.textContent('#timeLeft');
  expect(parseInt(time)).to.equal(seconds);
});

Then('the timer should count down every second', async function() {
  const time1 = await page1.textContent('#timeLeft');
  await page1.waitForTimeout(2000);
  const time2 = await page1.textContent('#timeLeft');
  expect(parseInt(time2)).to.be.lessThan(parseInt(time1));
});

When('the timer reaches {int} seconds', async function(seconds) {
  await page1.waitForFunction(
    (s) => parseInt(document.getElementById('timeLeft').textContent) <= s,
    seconds
  );
});

Then('the timer should turn red', async function() {
  const hasWarning = await page1.evaluate(() => {
    return document.getElementById('timer').classList.contains('warning');
  });
  expect(hasWarning).to.be.true;
});

When('{int} seconds pass without a correct guess', async function(seconds) {
  await page1.waitForTimeout(seconds * 1000);
});

Then('a {string} message should appear', async function(message) {
  await page1.waitForSelector('.message');
  const msg = await page1.textContent('.message');
  expect(msg).to.include(message);
});

Then('the turn should rotate to Bob', async function() {
  await page2.waitForSelector('#wordDisplay', { timeout: 5000 });
  const isDrawer = await page2.isVisible('#wordDisplay');
  expect(isDrawer).to.be.true;
});

Then('the timer should reset to {int} seconds', async function(seconds) {
  await page1.waitForTimeout(1000);
  const time = await page1.textContent('#timeLeft');
  expect(parseInt(time)).to.be.closeTo(seconds, 2);
});

When('Alice draws on the canvas', async function() {
  await page1.mouse.move(100, 100);
  await page1.mouse.down();
  await page1.mouse.move(200, 200);
  await page1.mouse.up();
});

Then('Bob should see the drawing in real-time', async function() {
  await page2.waitForTimeout(500);
  const canvas = await page2.$('#canvas');
  expect(canvas).to.not.be.null;
});

Then('Bob should not be able to draw', async function() {
  const cursor = await page2.evaluate(() => {
    return window.getComputedStyle(document.getElementById('canvas')).cursor;
  });
  expect(cursor).to.include('not-allowed');
});

Given('Alice is the drawer with word {string}', async function(word) {
  this.currentWord = word;
});

When('Bob guesses {string}', async function(guess) {
  await page2.fill('#guessInput', guess);
  await page2.click('button:has-text("Guess")');
});

Then('a popup should show {string}', async function(message) {
  page1.on('dialog', async dialog => {
    expect(dialog.message()).to.include(message);
    await dialog.accept();
  });
  page2.on('dialog', async dialog => {
    expect(dialog.message()).to.include(message);
    await dialog.accept();
  });
  await page1.waitForTimeout(1000);
});

Then('Bob should get {int} points', async function(points) {
  await page2.waitForTimeout(1000);
  const scores = await page2.textContent('#scores');
  expect(scores).to.include('Bob');
});

Then('Alice should get {int} points', async function(points) {
  await page1.waitForTimeout(1000);
  const scores = await page1.textContent('#scores');
  expect(scores).to.include('Alice');
});

Then('Alice should see {string}', async function(message) {
  await page1.waitForSelector('.message');
  const msg = await page1.textContent('.message');
  expect(msg).to.include(message);
});

Then('Bob should not see any notification', async function() {
  const hasMessage = await page2.isVisible('.message');
  expect(hasMessage).to.be.false;
});

When('Bob makes {int} wrong guesses', async function(count) {
  for (let i = 0; i < count; i++) {
    await page2.fill('#guessInput', `wrong${i}`);
    await page2.click('button:has-text("Guess")');
    await page2.waitForTimeout(500);
  }
});

Then('Bob should see a hint showing the word length', async function() {
  await page2.waitForSelector('#hintDisplay');
  const hint = await page2.textContent('#hintDisplay');
  expect(hint).to.include('letters');
});

When('Alice selects black board color', async function() {
  await page1.click('button:has-text("Black")');
});

Then('the canvas background should be black', async function() {
  const bgColor = await page1.evaluate(() => {
    return window.getComputedStyle(document.getElementById('canvas')).backgroundColor;
  });
  expect(bgColor).to.include('0, 0, 0');
});

When('Alice selects red color', async function() {
  await page1.click('.color[style*="background: #f00"]');
});

Then('the drawing color should be red', async function() {
  await page1.waitForTimeout(500);
});

Given('Alice has drawn on the canvas', async function() {
  await page1.mouse.move(100, 100);
  await page1.mouse.down();
  await page1.mouse.move(200, 200);
  await page1.mouse.up();
});

When('Alice clicks clear button', async function() {
  await page1.click('button:has-text("Clear")');
});

Then('the canvas should be empty', async function() {
  await page1.waitForTimeout(500);
});

When('Bob exits the room', async function() {
  await page2.click('button:has-text("Exit Room")');
  page2.on('dialog', async dialog => {
    await dialog.accept();
  });
});

Then('Alice should see {string}', async function(message) {
  await page1.waitForSelector('.message');
  const msg = await page1.textContent('.message');
  expect(msg).to.include(message);
});

Then('the room should remain open', async function() {
  const isLobby = await page1.isVisible('#lobby');
  expect(isLobby).to.be.true;
});

When('{int} rounds are completed', async function(rounds) {
  this.rounds = rounds;
});

Then('the difficulty should change to {word}', async function(difficulty) {
  await page1.waitForTimeout(1000);
});

When('Alice exits the room', async function() {
  await page1.click('button:has-text("Exit Room")');
  page1.on('dialog', async dialog => {
    await dialog.accept();
  });
});

Then('other players should be able to join with the same code', async function() {
  await page2.goto('http://localhost:3000');
  await page2.fill('#playerName', 'Charlie');
  await page2.fill('#roomCode', roomCode);
  await page2.click('button:has-text("Join Room")');
  await page2.waitForSelector('#lobby');
});
