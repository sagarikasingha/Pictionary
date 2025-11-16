Feature: Pictionary Game
  As a player
  I want to play Pictionary game
  So that I can draw and guess words with friends

  Background:
    Given the server is running on port 3000

  Scenario: Create a new game room
    When Player1 creates a room with name "Alice"
    Then a room code should be generated
    And Alice should see the lobby screen
    And the room code should be displayed

  Scenario: Join an existing room
    Given Player1 created a room with name "Alice"
    When Player2 joins the room with name "Bob"
    Then Bob should see the lobby screen
    And both players should be listed in the lobby

  Scenario: Prevent duplicate names in room
    Given Player1 created a room with name "Alice"
    When Player2 tries to join with name "Alice"
    Then Player2 should see an error "Name already taken in this room"

  Scenario: Start game with two players
    Given Player1 created a room with name "Alice"
    And Player2 joined the room with name "Bob"
    When Player1 starts the game
    Then the game screen should be displayed
    And one player should be the drawer
    And the drawer should see a word to draw
    And the guesser should see the guess input

  Scenario: Timer countdown during game
    Given a game is started with Alice and Bob
    And Alice is the drawer
    Then the timer should show 60 seconds
    And the timer should count down every second
    When the timer reaches 10 seconds
    Then the timer should turn red

  Scenario: Timer expires and turn rotates
    Given a game is started with Alice and Bob
    And Alice is the drawer
    When 60 seconds pass without a correct guess
    Then a "Time's up" message should appear
    And the turn should rotate to Bob
    And the timer should reset to 60 seconds

  Scenario: Draw on canvas
    Given a game is started with Alice and Bob
    And Alice is the drawer
    When Alice draws on the canvas
    Then Bob should see the drawing in real-time
    And Bob should not be able to draw

  Scenario: Submit correct guess
    Given a game is started with Alice and Bob
    And Alice is the drawer with word "cat"
    When Bob guesses "cat"
    Then a popup should show "Bob wins! Guessed cat correctly!"
    And Bob should get 100 points
    And Alice should get 50 points
    And the turn should rotate to Bob

  Scenario: Submit wrong guess
    Given a game is started with Alice and Bob
    And Alice is the drawer with word "cat"
    When Bob guesses "dog"
    Then Alice should see "Bob guessed: dog"
    And Bob should not see any notification

  Scenario: Hint after 3 wrong guesses
    Given a game is started with Alice and Bob
    And Alice is the drawer with word "cat"
    When Bob makes 3 wrong guesses
    Then Bob should see a hint showing the word length

  Scenario: Change board color
    Given a game is started with Alice and Bob
    And Alice is the drawer
    When Alice selects black board color
    Then the canvas background should be black

  Scenario: Change drawing color
    Given a game is started with Alice and Bob
    And Alice is the drawer
    When Alice selects red color
    Then the drawing color should be red

  Scenario: Clear canvas
    Given a game is started with Alice and Bob
    And Alice is the drawer
    And Alice has drawn on the canvas
    When Alice clicks clear button
    Then the canvas should be empty

  Scenario: Exit room during game
    Given a game is started with Alice and Bob
    When Bob exits the room
    Then Alice should see "Bob left the room"
    And the room should remain open

  Scenario: Progressive difficulty
    Given a game is started with Alice and Bob
    When 3 rounds are completed
    Then the difficulty should change to medium
    When 6 rounds are completed
    Then the difficulty should change to hard

  Scenario: Room persistence
    Given Player1 created a room with name "Alice"
    When Alice exits the room
    Then the room should remain open
    And other players should be able to join with the same code
