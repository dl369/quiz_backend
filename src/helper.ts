import crypto from 'crypto';
import { getData, User, Quiz, Question, Session } from './dataStore';
import pkg from 'validator';
const { isEmail } = pkg;

const minNameLength = 2;
const maxNameLength = 20;
const minPasswordLength = 8;

enum GameState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

enum Actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}
/**
  * checkEmailInUse checks if a given email already exists
  *
  * @param {string} email - Desired email address of user
  * ...
  *
  * @returns {'Valid'} - If given email is unique
  * @returns {{error: string}} - If email already exists
*/
function checkEmailInUse(email: string) {
  const data = getData();
  const users: User[] = data.users;

  // Loops through users array to check if email exists
  for (const user of users) {
    if (user.email === email) {
      return { Valid: false, Message: 'Email address already in use' };
    }
  }
  return { Valid: true };
}

/**
  * checkEmailValid checks if a given email is valid according to validator
  * dependancy
  *
  * @param {string} email - Desired email address of user
  * ...
  *
  * @returns {'Valid'} - If given email is valid
  * @returns {{error: string}} - If email is invalid
*/
function checkEmailValid(email: string) {
  // Uses isEmail() from validator package to check if email is valid
  if (isEmail(email) === false) {
    return { Valid: false, Message: 'Invalid Email address' };
  }

  return { Valid: true };
}

/**
  * checkFirstNameValid checks if a given first name is valid
  *
  * @param {string} nameFirst - User's first name
  * ...
  *
  * @returns {'Valid'} - If name is valid
  * @returns {{error: string}} - If name is invalid
*/
function checkFirstNameVaild (nameFirst: string) {
  // Checks if name meets length criteria
  if (nameFirst.length < minNameLength) {
    return { Valid: false, Message: 'First name too short' };
  } else if (nameFirst.length > maxNameLength) {
    return { Valid: false, Message: 'First name too long' };
  }

  // Checks if name has valid characters
  const validChars = /^[a-zA-Z '-]+$/;

  if (!validChars.test(nameFirst)) {
    return { Valid: false, Message: 'Invalid characters' };
  }

  return { Valid: true };
}

/**
  * checkLastNameValid checks if a given last name is valid
  *
  * @param {string} nameLast - User's last name
  * ...
  *
  * @returns {'Valid'} - If name is valid
  * @returns {{error: string}} - If name is invalid
*/
function checkLastNameVaild (nameLast: string) {
  // Checks if name meets length criteria
  if (nameLast.length < minNameLength) {
    return { Valid: false, Message: 'Last name too short' };
  } else if (nameLast.length > maxNameLength) {
    return { Valid: false, Message: 'Last name too long' };
  }

  // Checks if name has valid characters
  const validChars = /^[a-zA-Z '-]+$/;

  if (!validChars.test(nameLast)) {
    return { Valid: false, Message: 'Invalid characters' };
  }
  return { Valid: true };
}

/**
  * checkPasswordValid checks if a given paswword is valid
  *
  * @param {string} password - User's password
  * ...
  *
  * @returns {'Valid'} - If password is valid
  * @returns {{error: string}} - If password is invalid
*/
function checkPasswordValid(password: string) {
  // Checks if password meets length criteria
  if (password.length < minPasswordLength) {
    return { Valid: false, Message: 'Password too short' };
  }

  // Checks if password meets character criteria
  const passwordContainsNo = /\d/.test(password);
  const passwordContainsLetter = /[a-zA-Z]/.test(password);

  if (passwordContainsNo === false) {
    return { Valid: false, Message: 'Password does not contain number' };
  } else if (passwordContainsLetter === false) {
    return { Valid: false, Message: 'Password does not contain letter' };
  }
  return { Valid: true };
}

/**
  * Checks if a given authUserId exists
  *
  * @param {string} token - User's ID
  * ...
  *
  * @returns {'Valid'} - To determine if authUserId exists or not
  * @returns {{error: string}} - If password is invalid
*/
function checkTokenLoggedIn(token: string): boolean {
  const data = getData();
  const users = data.users;

  let tokenLoggedIn = false;

  for (const user of users) {
    for (const token1 of user.tokens) {
      if (token === token1) {
        tokenLoggedIn = true;
      }
    }
  }
  return tokenLoggedIn;
}

/**
  * Finds a user with given authUserId
  *
  * @param {number} authUserId - User's ID
  * ...
  *
  * @returns {userToCheck} - An object of the given User's details
*/
function findUser (token: string): User {
  const data = getData();
  const users = data.users;

  let userToCheck;
  for (const user of users) {
    for (const token1 of user.tokens) {
      if (token === token1) {
        userToCheck = user;
      }
    }
  }

  return userToCheck;
}

/**
  * Finds a quiz with given quizId
  *
  * @param {number} quizId
  * ...
  *
  * @returns {quiz} - If quiz exists, returns an object of the given quiz's details
  * @returns {Boolean} - If quiz doesn't exist, returns false
*/
function findQuiz (quizId: number) {
  // const data = getData();
  // const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  // return foundQuiz;
  const data = getData();
  const quizes = data.quizzes;

  let quizToFind;
  for (const quiz of quizes) {
    if (quizId === quiz.quizId) {
      quizToFind = quiz;
    }
  }
  return quizToFind;
}

/**
  * Finds a quiz with given quizId in the trash
  *
  * @param {number} quizId
  * ...
  *
  * @returns {quiz} - If quiz exists, returns an object of the given quiz's details
  * @returns {Boolean} - If quiz doesn't exist, return false
*/
function findQuizInTrash (quizId: number) {
  const data = getData();

  let quizToFindInTrash;
  for (const user of data.users) {
    for (const trash of user.trash) {
      if (quizId === trash.quizId) {
        quizToFindInTrash = trash;
      }
    }
  }
  return quizToFindInTrash;
}

/**
  * Generates unique id for an answer
  *
  * @param {}
  * ...
  *
  * @returns {number}
*/
function generateAnswerId() {
  const timestamp = new Date().getTime();
  const randomPortion = Math.floor(Math.random() * 1000);
  return Number(`${timestamp}${randomPortion}`);
}

/**
  * Calculates total duration of questions in quiz
  *
  * @param {Question[]} questions - array of questions
  * ...
  *
  * @returns {number}
*/
function calculateTotalQuizDuration(questions: Question[]): number {
  return questions.reduce((totalDuration, question) => {
    return totalDuration + question.duration;
  }, 0);
}

/**
  * Generates random colour
  *
  * @param {}
  * ...
  *
  * @returns {string}
*/
function randomColour() {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Uses crypto to craate a hash
 * @param {string} plaintext
 * @returns
 */
function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

/**
 * Update session to Lobby
 * @param {GameState} currentState
 * @param {string} action
 * @returns
 */
function lobbyHelper(currentState: GameState, action: string) {
  let updatedState = currentState;

  if (currentState === GameState.LOBBY && action === Actions.END) {
    updatedState = GameState.END;
  }

  if (currentState === GameState.LOBBY && action === Actions.NEXT_QUESTION) {
    updatedState = GameState.QUESTION_COUNTDOWN;
  }
  return updatedState;
}

/**
 * Update session to Question Countdown
 * @param {GameState} currentState
 * @param {string} action
 * @returns
 */
function questionCountDownHelper(currentState: GameState, action: string) {
  let updatedState = currentState;
  if (currentState === GameState.QUESTION_COUNTDOWN && action === Actions.SKIP_COUNTDOWN) {
    updatedState = GameState.QUESTION_OPEN;
  }

  if (currentState === GameState.QUESTION_COUNTDOWN && action === Actions.END) {
    updatedState = GameState.END;
  }
  return updatedState;
}

/**
 * Update session to Question Open
 * @param {GameState} currentState
 * @param {string} action
 * @returns
 */
function questionOpenHelper(currentState: GameState, action: string, quiz : Quiz, session: Session) {
  let updatedState = currentState;

  if (currentState === GameState.QUESTION_OPEN && action === Actions.GO_TO_ANSWER) {
    updatedState = GameState.ANSWER_SHOW;
  }

  if (currentState === GameState.QUESTION_OPEN && action === Actions.END) {
    updatedState = GameState.END;
  }
  return updatedState;
}

/**
 * Update session to Question Close
 * @param {GameState} currentState
 * @param {string} action
 * @returns
 */
function questionCloseHelper(currentState: GameState, action: string) {
  let updatedState = currentState;
  if (currentState === GameState.QUESTION_CLOSE && action === Actions.END) {
    updatedState = GameState.END;
  }

  if (currentState === GameState.QUESTION_CLOSE && action === Actions.GO_TO_ANSWER) {
    updatedState = GameState.ANSWER_SHOW;
  }

  if (currentState === GameState.QUESTION_CLOSE && action === Actions.GO_TO_FINAL_RESULTS) {
    updatedState = GameState.FINAL_RESULTS;
  }

  if (currentState === GameState.QUESTION_CLOSE && action === Actions.NEXT_QUESTION) {
    updatedState = GameState.QUESTION_COUNTDOWN;
  }

  return updatedState;
}

/**
 * Update session to Answer Show
 * @param {GameState} currentState
 * @param {string} action
 * @returns
 */
function answerShowHelper(currentState: GameState, action: string) {
  let updatedState = currentState;
  if (currentState === GameState.ANSWER_SHOW && action === Actions.END) {
    updatedState = GameState.END;
  }

  if (currentState === GameState.ANSWER_SHOW && action === Actions.NEXT_QUESTION) {
    updatedState = GameState.QUESTION_COUNTDOWN;
  }

  if (currentState === GameState.ANSWER_SHOW && action === Actions.GO_TO_FINAL_RESULTS) {
    updatedState = GameState.FINAL_RESULTS;
  }

  return updatedState;
}

/**
 * Update session to FinalResults
 * @param {GameState} currentState
 * @param {string} action
 * @returns
 */
function finalResultsHelper(currentState: GameState, action: string) {
  let updatedState = currentState;

  if (currentState === GameState.FINAL_RESULTS && action === Actions.END) {
    updatedState = GameState.END;
  }

  return updatedState;
}

/**
  * Finds a session with given session
  *
  * @param {number} sessionId
  * ...
  *
  * @returns {session} - If session exists, returns an object of the given session's details
  * @returns {Boolean} - If session doesn't exist, returns false
*/
function findSession (sessionId: number) {
  const data = getData();
  const foundSession = data.sessions.find(session => session.sessionId === sessionId);
  return foundSession;
}

/**
  * Finds a Session with given playerId
  *
  * @param {number} playerId
  * ...
  *
  * @returns {Player} - If session exists, returns an object of the given player's details
  * @returns {Boolean} - If session or player doesn't exist, returns false
*/
function findSessionWithPlayer (playerId: number) {
  const data = getData();
  const session = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  return session;
}

/*
* Finds a player with given playerId
*
* @param {number} playerId
* ...
*
* @returns {Player} - If player exists, returns an object of the given player's details
* @returns {Boolean} - If player doesn't exist, returns false
*/
function findPlayer (playerId: number) {
  const foundSession = findSessionWithPlayer(playerId);
  if (!foundSession) {
    return false;
  }
  const player = foundSession.players.find(player => player.playerId === playerId);
  return player;
}

/**
 * Randomly generates a name that conforms to the structure "[5 letters][3 numbers]"
 * (e.g. valid123, ifjru483, ofijr938) where there are no repetitions of numbers
 * or characters within the same name
 * @returns {string} Name
 */
function generateUniquePlayerName(): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  let name = '';
  // Generate 5 unrepeated letters
  for (let i = 0; i < 5; i++) {
    let letter: string;
    do {
      letter = letters.charAt(Math.floor(Math.random() * letters.length));
    } while (name.includes(letter));
    name += letter;
  }

  // Generate 3 unrepeated numbers
  for (let i = 0; i < 3; i++) {
    let number: string;
    do {
      number = numbers.charAt(Math.floor(Math.random() * numbers.length));
    } while (name.includes(number));
    name += number;
  }

  return name;
}

/**
 * Finds the qeustion that the current session is on
 * @param {number} sessionId
 * @returns {question}
 * @returns {boolean} - False if question does not exist
 */
function findCurrentSessionQuestion(sessionId: number) {
  const session = findSession(sessionId);
  const question = session.metadata.questions[session.atQuestion];
  return question;
}

/**
 * Checks if a player name already exists in a given session
 * @param {number} sessionId
 * @param {string} name
 * @returns {boolean}
 */
function playerNameAlreadyExists(sessionId: number, name: string) {
  const session = findSession(sessionId);
  return session.players.some(player => player.name === name);
}

export {
  checkEmailInUse,
  checkEmailValid,
  checkFirstNameVaild,
  checkLastNameVaild,
  checkPasswordValid,
  checkTokenLoggedIn,
  findUser,
  findQuiz,
  findQuizInTrash,
  generateAnswerId,
  calculateTotalQuizDuration,
  randomColour,
  getHashOf,
  lobbyHelper,
  questionCountDownHelper,
  questionCloseHelper,
  questionOpenHelper,
  answerShowHelper,
  finalResultsHelper,
  findSession,
  findSessionWithPlayer,
  findPlayer,
  generateUniquePlayerName,
  findCurrentSessionQuestion,
  playerNameAlreadyExists
};
