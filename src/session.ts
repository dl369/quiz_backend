import fs from 'fs';
import HTTPError from 'http-errors';
import { getData, setData, GameState, getTimers } from './dataStore';
import {
  checkTokenLoggedIn,
  findUser,
  lobbyHelper,
  questionCountDownHelper,
  questionCloseHelper,
  questionOpenHelper,
  answerShowHelper,
  finalResultsHelper,
} from './helper';
import { playerFinalResults } from './player';
const MAX_AUTOSTART = 50;
const NO_QUESTIONS = 0;
const MAX_SESSIONS = 10;

enum Actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

/**
 * This copies the quiz, so that any edits whilst a session is running does not affect active session
 * @param {string} token
 * @param {number} quizId
 * @param {number} autoStartNum
 * @returns {sessionId: number}
 */
function adminSessionStart(token: string, quizId: number, autoStartNum: number) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const user = findUser(token);

  if (!loggedIn) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (user.trash.some(trashedQuiz => trashedQuiz.quizId === quizId)) {
    throw HTTPError(400, 'Quiz is in the trash');
  }

  if (index === -1) {
    throw HTTPError(403, 'quizId is not valid');
  }

  if (autoStartNum > MAX_AUTOSTART) {
    throw HTTPError(400, 'invalid autoStartNum');
  }

  if (data.quizzes[index].numQuestions === NO_QUESTIONS) {
    throw HTTPError(400, 'quiz has no questions');
  }

  const activeSessions = data.sessions.filter(session =>
    session.sessionState !== GameState.END && session.metadata.quizId === quizId
  );

  if (activeSessions && activeSessions.length >= MAX_SESSIONS) {
    throw HTTPError(400, 'Max sessions for this quiz reached');
  }

  if (!(data.quizzes[index].authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  const sessionId = Math.floor(Math.random() * 5000);
  const answerSubmissions = [];
  for (let i = 0; i < data.quizzes[index].numQuestions; i++) {
    answerSubmissions.push({ submissions: [] });
  }

  data.sessions.push({
    sessionId: sessionId,
    sessionState: GameState.LOBBY,
    atQuestion: 0,
    players: [],
    autoStartNum: autoStartNum,
    metadata: data.quizzes[index],
    answerSubmissions: answerSubmissions,
    questionStartTime: 0,
  });
  setData(data);
  return { sessionId };
}

/**
 * Retrieves active and inactive session ids (sorted in ascending order) for a quiz
 * - Active sessions are sessions that are not in the END state
 * - Inactive sessions are sessions in the END state.
 * @param {string} token
 * @param {number} quizId
 * @returns {two arrays of sessionIds: number}
 */
function adminQuizSessions(token: string, quizId: number) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quiz = data.quizzes[index];

  if (!loggedIn) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (index === -1) {
    throw HTTPError(403, 'quizId is not valid');
  }

  if (!(quiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  const sessions = data.sessions.filter(session => session.metadata.quizId === quizId);
  const activeSessions: number[] = [];
  const inactiveSessions: number[] = [];

  sessions.forEach(session => {
    if (session.sessionState === GameState.END) {
      inactiveSessions.push(session.sessionId);
    } else {
      activeSessions.push(session.sessionId);
    }
  });

  setData(data);
  return {
    activeSessions,
    inactiveSessions
  };
}

/**
 * Updates session state to another session state
 * @param {string} token
 * @param {number} quizId
 * @param {number} sessionId
 * @param {Actions} action
 * @returns {}
 */
function adminUpdateSession(quizId: number, sessionId: number, token: string, action: Actions) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quiz = data.quizzes[index];
  const sessionIndex = data.sessions.findIndex(session => session.sessionId === sessionId);
  const session = data.sessions[sessionIndex];

  if (!loggedIn) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (index === -1) {
    throw HTTPError(403, 'quizId is not valid');
  }

  if (!(quiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  if (!(data.sessions.some(session => session.sessionId === sessionId))) {
    throw HTTPError(400, 'sessionId is invalid');
  }

  const currentState: GameState = session.sessionState;
  let updatedState: GameState = currentState; // Initialize with current state to handle unhandled cases.

  switch (currentState) {
    case GameState.LOBBY: {
      if (action !== Actions.NEXT_QUESTION && action !== Actions.END) {
        throw HTTPError(400, 'Lobby cannot perform this action');
      }
      updatedState = lobbyHelper(currentState, action);

      if (action === Actions.NEXT_QUESTION) {
        const questionNum = session.atQuestion + 1;
        const currState = GameState.QUESTION_COUNTDOWN;
        const timerId = setTimeout(() => {
          if (session.atQuestion === questionNum && session.sessionState === currState) {
            session.sessionState = GameState.QUESTION_OPEN;
            session.questionStartTime = Date.now() / 1000;
          }
        }, 3000);
        const timerStore = getTimers();
        timerStore.push(timerId);
      }

      break;
    }

    case GameState.QUESTION_COUNTDOWN: {
      if (action !== Actions.SKIP_COUNTDOWN && action !== Actions.END) {
        throw HTTPError(400, 'Question Countdown cannot perform this action');
      }
      updatedState = questionCountDownHelper(currentState, action);

      if (action === Actions.SKIP_COUNTDOWN) {
        const duration = session.metadata.questions[session.atQuestion - 1].duration;
        const questionNum = session.atQuestion;
        const currState = GameState.QUESTION_OPEN;
        const timerId = setTimeout(() => {
          if (session.atQuestion === questionNum && session.sessionState === currState) {
            session.sessionState = GameState.QUESTION_CLOSE;
          }
        }, duration * 1000);
        const timerStore = getTimers();
        timerStore.push(timerId);
      }
      break;
    }

    case GameState.QUESTION_CLOSE: {
      if (action === Actions.SKIP_COUNTDOWN) {
        throw HTTPError(400, 'Question close cannot perform this action');
      }
      updatedState = questionCloseHelper(currentState, action);

      if (action === Actions.NEXT_QUESTION) {
        const questionNum = session.atQuestion + 1;
        if (questionNum > session.metadata.numQuestions) {
          throw HTTPError(400, 'not enough questions');
        }
        const currState = GameState.QUESTION_COUNTDOWN;
        const timerId = setTimeout(() => {
          if (session.atQuestion === questionNum && session.sessionState === currState) {
            session.sessionState = GameState.QUESTION_OPEN;
          }
        }, 3000);
        const timerStore = getTimers();
        timerStore.push(timerId);
      }
      break;
    }

    case GameState.QUESTION_OPEN: {
      if (action === Actions.SKIP_COUNTDOWN || action === Actions.GO_TO_FINAL_RESULTS || action === Actions.NEXT_QUESTION) {
        throw HTTPError(400, 'Question open cannot perform this action');
      }
      updatedState = questionOpenHelper(currentState, action, quiz, session);

      break;
    }

    case GameState.ANSWER_SHOW: {
      if (action === Actions.SKIP_COUNTDOWN || action === Actions.GO_TO_ANSWER) {
        throw HTTPError(400, 'Answer show cannot perform this action');
      }
      updatedState = answerShowHelper(currentState, action);
      if (action === Actions.NEXT_QUESTION) {
        const questionNum = session.atQuestion + 1;
        if (questionNum > session.metadata.numQuestions) {
          throw HTTPError(400, 'not enough questions');
        }
        const currState = GameState.QUESTION_COUNTDOWN;
        const timerId = setTimeout(() => {
          if (session.atQuestion === questionNum && session.sessionState === currState) {
            session.sessionState = GameState.QUESTION_OPEN;
          }
        }, 3000);
        const timerStore = getTimers();
        timerStore.push(timerId);
      }
      break;
    }

    case GameState.FINAL_RESULTS: {
      if (action === Actions.NEXT_QUESTION || action === Actions.SKIP_COUNTDOWN || action === Actions.GO_TO_ANSWER || action === Actions.GO_TO_FINAL_RESULTS) {
        throw HTTPError(400, 'Final results cannot perform this action');
      }
      updatedState = finalResultsHelper(currentState, action);
      break;
    }

    case GameState.END: {
      throw HTTPError(400, 'End cannot perform this action');
    }
  }

  if (action === Actions.NEXT_QUESTION) {
    session.atQuestion++;
  }

  if (updatedState === GameState.QUESTION_OPEN) {
    session.questionStartTime = Date.now() / 1000; // Update time on transitioning to QUESTION_OPEN
  }

  session.sessionState = updatedState;
  setData(data);
  return {};
}

/**
  * adminQuizSessionFinalResults generates the final results for a quiz
  * session
  *
  *
  * @param {string} token - token of user
  * @param {number} quizId - QuizId of respective session
  * @param {number} sessionId - SessionId of respective session
  * ...
  *
  * @returns {{finalResults}} - Final Results of a quiz session
  * @returns {{error: string}} - If inputs are invalid
*/
function adminQuizSessionResults(quizId: number, sessionId: number, token: string) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quiz = data.quizzes[index];
  let sessionExists = false;
  let foundSession;

  if (!loggedIn) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (index === -1) {
    throw HTTPError(403, 'quizId is not valid');
  }

  if (!(quiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  for (const session of data.sessions) {
    if (session.sessionId === sessionId) {
      sessionExists = true;
      foundSession = session;
      if (session.sessionState !== GameState.FINAL_RESULTS) {
        throw HTTPError(400, 'Session not in final results state');
      }
    }
  }

  if (sessionExists === false) {
    throw HTTPError(400, 'Session does not exist');
  }

  const playerId = foundSession.players[0].playerId;

  const finalResults = playerFinalResults(playerId);
  return {
    finalResults
  };
}

/**
  * adminQuizSessionFinalResultsCsv generates the final results for a quiz
  * session in csv format.
  *
  *
  * @param {string} token - token of user
  * @param {number} quizId - QuizId of respective session
  * @param {number} sessionId - SessionId of respective session
  * ...
  *
  * @returns {{filePath}} - Path to csv file
  * @returns {{error: string}} - If inputs are invalid
*/
function adminQuizSessionResultsCsv(quizId: number, sessionId: number, token: string) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quiz = data.quizzes[index];
  let sessionExists = false;
  let foundSession;

  if (!loggedIn) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (index === -1) {
    throw HTTPError(403, 'quizId is not valid');
  }

  if (!(quiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  for (const session of data.sessions) {
    if (session.sessionId === sessionId) {
      sessionExists = true;
      foundSession = session;
      if (session.sessionState !== GameState.FINAL_RESULTS) {
        throw HTTPError(400, 'Session not in final results state');
      }
    }
  }

  if (sessionExists === false) {
    throw HTTPError(400, 'Session does not exist');
  }

  const playerId = foundSession.players[0].playerId;

  const finalResults = playerFinalResults(playerId);

  const rows: (string | number)[][] = [['Player']];
  const numberOfQuestions = finalResults.questionResults.length;

  let i = 1;
  while (i <= numberOfQuestions) {
    rows[0].push(`question${i}score`, `question${i}rank`);
    i++;
  }

  const sortedUsersAlphabet = [];

  for (const user1 of finalResults.usersRankedByScore) {
    let inserted = false;
    if (sortedUsersAlphabet.length === 0) {
      inserted = true;
      sortedUsersAlphabet.push(user1);
    } else {
      for (const user2 of sortedUsersAlphabet) {
        if (user1.name.localeCompare(user2.name) < 0) {
          sortedUsersAlphabet.splice(sortedUsersAlphabet.indexOf(user2), 0, user1);
          inserted = true;
          break;
        }
      }
    }

    if (inserted === false) {
      sortedUsersAlphabet.push(user1);
    }
  }

  for (const user3 of sortedUsersAlphabet) {
    const row: (string | number)[] = [user3.name];
    for (const result of finalResults.questionResults) {
      if (result.playersCorrectList.includes(user3.name)) {
        const questionIndex = finalResults.questionResults.indexOf(result);
        const nameIndex = result.playersCorrectList.indexOf(user3.name);
        const unmodifiedScore = quiz.questions[questionIndex].points;
        let rank = 1;
        let i = 1;
        while (i <= nameIndex) {
          if (Math.round(unmodifiedScore / (i + 1)) !== Math.round(unmodifiedScore / i)) {
            rank = i + 1;
          }
          i++;
        }
        row.push(Math.round(quiz.questions[questionIndex].points / (rank)), rank);
      } else {
        row.push(0, result.playersCorrectList.length + 1);
      }
    }
    rows.push(row);
  }

  const csv: string = rows.map(row =>
    row.map((item: string | number) => `"${item}"`).join(',')
  ).join('\n');

  const filePath = `${sessionId}.csv`;
  fs.writeFileSync(`./${filePath}`, csv, 'utf-8');

  return filePath;
}

export {
  adminSessionStart,
  adminQuizSessions,
  adminUpdateSession,
  adminQuizSessionResults,
  adminQuizSessionResultsCsv
};
