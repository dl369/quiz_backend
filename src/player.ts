import HTTPError from 'http-errors';
import { getData, Player, Session, GameState } from './dataStore';
import {
  generateUniquePlayerName,
  findSession,
  findSessionWithPlayer,
  findPlayer,
  findCurrentSessionQuestion,
  playerNameAlreadyExists
} from './helper';

/**
 * Adds a player to a given session
 * If the name entered is an empty string, a name must be randomly generated
 * that conforms to the structure "[5 letters][3 numbers]"
 * (e.g. valid123, ifjru483, ofijr938) where there are no repetitions of
 * numbers or characters within the same name
 * @param {number} sessionId
 * @param {string} name
 * @returns {playerId: number}
 */
function playerJoin(sessionId: number, name: string): {playerId: number} {
  // Error cases

  const foundSession = findSession(sessionId);
  if (!foundSession) {
    throw HTTPError(400, 'Invalid SessionId');
  }
  if (playerNameAlreadyExists(sessionId, name)) {
    throw HTTPError(400, 'Name is already in use');
  }
  if (foundSession.sessionState !== GameState.LOBBY) {
    throw HTTPError(400, 'Quiz is not in lobby');
  }

  // Creating a new player
  if (name === '') {
    name = generateUniquePlayerName();
  }

  const playerId = Math.floor(Math.random() * 5000);

  const player: Player = {
    sessionId: foundSession.sessionId,
    playerId: playerId,
    name: name,
  };

  // Add the player to the session
  foundSession.players.push(player);

  // If players is over autoStartNum of quiz, begin the quiz
  if (foundSession.players.length >= foundSession.autoStartNum) {
    foundSession.sessionState = GameState.QUESTION_COUNTDOWN;
    // const questionNum = foundSession.atQuestion + 1;
    // const currState = GameState.QUESTION_COUNTDOWN;
    // const timerId = setTimeout(() => {
    //   if (foundSession.atQuestion === questionNum && foundSession.sessionState === currState) {
    //     foundSession.sessionState = GameState.QUESTION_OPEN;
    //     foundSession.questionStartTime = Date.now() / 1000;
    //   }
    // }, 3000);
    // const timerStore = getTimers();
    // timerStore.push(timerId);
  }
  return { playerId };
}

/**
 * Get the status of a guest player that has already joined a session
 * @param {number} playerId
 * @returns {state: GameState, numQuestions: Number, atQuestion: number}
 */
function playerStatus(playerId: number): {state: GameState, numQuestions: number, atQuestion: number} {
  const data = getData();

  let foundSession: Session | boolean = false;
  let foundPlayer: Player | boolean = false;
  for (const session of data.sessions) {
    for (const player of session.players) {
      if (player.playerId === playerId) {
        foundPlayer = player;
        foundSession = session;
      }
    }
  }

  // Error Case
  if (foundPlayer === false || foundSession === false) {
    throw HTTPError(400, 'Invalid playerId');
  }

  // Return player info

  return {
    state: foundSession.sessionState,
    numQuestions: foundSession.metadata.numQuestions,
    atQuestion: foundSession.atQuestion
  };
}

/**
 * Get the information about a question that the guest player is on.
 * Question position starts at 1
 * @param {number} playerId
 * @param {number} questionposition
 * @returns
 */
function playerQuestionInfomation(playerId: number, questionposition: number) {
  // Error Cases
  if (!findPlayer(playerId)) {
    throw HTTPError(400, 'Invalid playerId');
  }
  const session = findSessionWithPlayer(playerId);
  if (questionposition < 1 || questionposition > session.metadata.numQuestions) {
    throw HTTPError(400, 'invalid question position');
  }

  if (session.sessionState === GameState.LOBBY ||
    session.sessionState === GameState.QUESTION_COUNTDOWN ||
    session.sessionState === GameState.END) {
    throw HTTPError(400, 'invalid state');
  }

  if (session.atQuestion !== questionposition) {
    throw HTTPError(400, 'not up to question');
  }

  // Success case
  const currentQuestion = findCurrentSessionQuestion(session.sessionId);

  // Get question answers without revealing which question is right
  const currentQuestionGuestAnswers = [];
  for (const answer of currentQuestion.answers) {
    const answerWithoutCorrect = {
      answerId: answer.answerId,
      answer: answer.answer,
      colour: answer.colour
    };
    currentQuestionGuestAnswers.push(answerWithoutCorrect);
  }

  return {
    questionId: currentQuestion.questionId,
    question: currentQuestion.question,
    duration: currentQuestion.duration,
    thumbnailUrl: currentQuestion.thumbnailUrl,
    points: currentQuestion.points,
    answers: currentQuestionGuestAnswers
  };
}

/**
 * Allow the current player to submit answer(s) to the currently active question. Question position starts at 1
 * Note: An answer can be re-submitted once first selection is made, as long as game is in the right state
 * @param {number[]} answerIds
 * @param {number} playerId
 * @param {number} questionPosition
 * @returns {}
 */
function playerAnswerSubmit(answerIds: number[], playerId: number, questionPosition: number) {
  const data = getData();
  const session = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!session) {
    throw HTTPError(400, 'playerId does not exist');
  }

  if (questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw HTTPError(400, 'invalid question position');
  }

  if (session.sessionState !== GameState.QUESTION_OPEN) {
    throw HTTPError(400, 'invalid state');
  }

  if (session.atQuestion !== questionPosition) {
    throw HTTPError(400, 'not up to question');
  }

  for (const answer of answerIds) {
    let matchingId = 0;
    for (const questionAnswer of session.metadata.questions[questionPosition - 1].answers) {
      if (answer === questionAnswer.answerId) {
        matchingId = 1;
      }
    }
    if (matchingId === 0) {
      throw HTTPError(400, 'invalid questionId');
    }
  }

  if (new Set(answerIds).size !== answerIds.length) {
    throw HTTPError(400, 'duplicate answerId');
  }

  if (answerIds.length < 1) {
    throw HTTPError(400, 'invalid answerId');
  }

  let isCorrect = true;
  for (const answer of session.metadata.questions[questionPosition - 1].answers) {
    if (answer.correct && !answerIds.some(answerId => answerId === answer.answerId)) {
      isCorrect = false;
    }
  }

  let score = 0;
  if (isCorrect) {
    let scalingFactor = 1;
    for (const answers of session.answerSubmissions[questionPosition - 1].submissions) {
      if (answers.isCorrect) {
        scalingFactor++;
      }
    }

    score = session.metadata.questions[questionPosition - 1].points / scalingFactor;
  }

  const resubmission = session.answerSubmissions[questionPosition - 1].submissions
    .find(submission => submission.playerId === playerId);

  if (resubmission) {
    resubmission.isCorrect = isCorrect;
    resubmission.timeTaken = (new Date().getTime() / 1000) - session.questionStartTime;
    resubmission.score = score;
  } else {
    session.answerSubmissions[questionPosition - 1].submissions.push({
      isCorrect: isCorrect,
      playerId: playerId,
      timeTaken: (new Date().getTime() / 1000) - session.questionStartTime,
      score: score,
    });
  }

  return {};
}

/**
 * Get the results for a particular question of the session a player is playing in.
 * Question position starts at 1
 * @param {number} playerId
 * @param {number} questionPosition
 * @param {boolean} helper
 * @returns
 */
function playerAnswerResult(playerId: number, questionPosition: number, helper: boolean) {
  const data = getData();
  const session = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!session) {
    throw HTTPError(400, 'playerId does not exist');
  }

  if (questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw HTTPError(400, 'invalid question position');
  }

  if (helper === false && session.sessionState !== GameState.ANSWER_SHOW) {
    throw HTTPError(400, 'invalid state');
  }

  if (session.atQuestion < questionPosition) {
    throw HTTPError(400, 'not up to question');
  }

  const playersCorrect = [];
  let totalAnswerTime = 0;
  for (const submissions of session.answerSubmissions[questionPosition - 1].submissions) {
    if (submissions.isCorrect) {
      const correctPlayerId = submissions.playerId;
      const playerName = session.players.find(player => player.playerId === correctPlayerId).name;
      playersCorrect.push(playerName);
    }
    const timeTaken = submissions.timeTaken;
    totalAnswerTime += timeTaken;
  }

  const questionId = session.metadata.questions[questionPosition - 1].questionId;
  const percentCorrect = Math.round(100 * playersCorrect.length / (session.players.length));
  const averageAnswerTime = Math.round(totalAnswerTime / session.answerSubmissions[questionPosition - 1].submissions.length);

  return {
    questionId: questionId,
    playersCorrectList: playersCorrect,
    percentCorrect: percentCorrect,
    averageAnswerTime: averageAnswerTime
  };
}

/**
 * Get the final results for a whole session a player is playing in
 * @param {number} playerId
 * @returns
 */
function playerFinalResults(playerId: number) {
  const data = getData();
  const session = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!session) {
    throw HTTPError(400, 'playerId does not exist');
  }

  if (session.sessionState !== GameState.FINAL_RESULTS) {
    throw HTTPError(400, 'invalid state');
  }

  const questionResults = [];
  for (let i = 0; i < session.metadata.numQuestions; i++) {
    const result = playerAnswerResult(playerId, i + 1, true);
    questionResults.push({
      questionId: result.questionId,
      playersCorrectList: result.playersCorrectList,
      averageAnswerTime: result.averageAnswerTime,
      percentCorrect: result.percentCorrect
    });
  }
  const rankedPlayers = [];
  for (const player of session.players) {
    rankedPlayers.push({
      name: player.name,
      score: 0,
      playerId: player.playerId
    });
  }

  for (const question of session.answerSubmissions) {
    for (const answer of question.submissions) {
      if (answer.isCorrect) {
        const player = rankedPlayers.find(player => player.playerId === answer.playerId);
        player.score += answer.score;
      }
    }
  }

  rankedPlayers.sort((a, b) => b.score - a.score);

  const rankedPlayersWithoutId = rankedPlayers.map(player => {
    const { playerId, ...playerWithoutId } = player;
    return playerWithoutId;
  });

  return {
    usersRankedByScore: rankedPlayersWithoutId,
    questionResults: questionResults
  };
}

/**
 * Return all messages that are in the same session as the player, in the order they were sent
 * In the repsonse, the timeSent is a unix timestamp that was recorded when the message was sent
 * @param {number} playerId
 * @returns {messages: Array}
 */
function playerReturnMessages(playerId: number) {
  const data = getData();

  const session = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!session) {
    throw HTTPError(400, 'playerId does not exist');
  }

  findPlayer(playerId);

  return { messages: session.messages };
}

/**
 * Send a new chat message to everyone in the session
 * @param {number} playerId
 * @param {message: string} message
 * @returns {}
 */
function playerSendChatMessage(playerId: number, message: { messageBody: string }) {
  const session = findSessionWithPlayer(playerId);
  if (!session) {
    throw HTTPError(400, 'Player ID does not exist in any session');
  }

  const player = session.players.find(player => player.playerId === playerId);

  const trimmedMessage = message.messageBody.trim();
  if (trimmedMessage.length < 1) {
    throw HTTPError(400, 'Message body is too short');
  }

  if (trimmedMessage.length > 100) {
    throw HTTPError(400, 'Message body is too long');
  }

  const newMessage = {
    messageBody: message.messageBody,
    playerId: playerId,
    playerName: player.name,
    timeSent: Math.floor(new Date().getTime() / 1000)
  };

  if (session.messages === undefined) {
    session.messages = [];
  }

  session.messages.push(newMessage);

  return {};
}

export {
  playerJoin,
  playerStatus,
  playerQuestionInfomation,
  playerAnswerSubmit,
  playerAnswerResult,
  playerFinalResults,
  playerReturnMessages,
  playerSendChatMessage
};
