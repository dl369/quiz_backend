import {
  v2requestAdminQuizCreate, requestAdminAuthRegister,
  requestClear, requestAdminSessionStart, requestPlayerJoin,
  v2requestAdminQuestionCreate, requestAdminUpdateSession,
  requestAdminQuizGetSessionStatus
} from './requestBoilerPlates';

import { GameState } from './dataStore';

const error = { error: expect.any(String) };
const autoStartNum = 10;
const questionBody = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Prince Charles',
      correct: true
    },
    {
      answer: 'Queen Elizabeth',
      correct: false
    }
  ]
};

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('playerJoin', () => {
  describe('Error Tests', () => {
    test('Name entered is not unique', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      requestPlayerJoin(session.sessionId, 'Victor');
      const player2 = requestPlayerJoin(session.sessionId, 'Victor');
      expect(player2.body).toEqual(error);
      expect(player2.statusCode).toEqual(400);
    });
    test('Session Id is invalid', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId + 1, 'Victor');
      expect(player.body).toEqual(error);
      expect(player.statusCode).toEqual(400);
    });
    test('Session is not in lobby state', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      const player = requestPlayerJoin(session.sessionId, 'Victor');
      expect(player.body).toEqual(error);
      expect(player.statusCode).toEqual(400);
    });
  });
  describe('Success cases', () => {
    test('Successfully creating a player', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor');
      expect(player.body).toEqual({ playerId: expect.any(Number) });
      expect(player.statusCode).toEqual(200);
    });
    test('Creating a player with an empty name', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, '');
      expect(player.body).toEqual({ playerId: expect.any(Number) });
      expect(player.statusCode).toEqual(200);
    });
    test('Player added correctly starts the session', async() => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      // Starting the quiz when 1 player joins
      const autoStartNumber = 1;
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNumber).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor');
      expect(player.body).toEqual({ playerId: expect.any(Number) });
      expect(player.statusCode).toEqual(200);
      expect(requestAdminQuizGetSessionStatus(user.token, quiz.quizId, session.sessionId).body).toStrictEqual(
        {
          state: GameState.QUESTION_COUNTDOWN,
          atQuestion: expect.any(Number),
          players: ['Victor'],
          metadata: {
            quizId: quiz.quizId,
            authUserId: expect.any(Number),
            name: 'Aero',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            token: user.token,
            description: 'Quiz about Aeroplanes',
            numQuestions: 1,
            questions: [
              {
                questionId: expect.any(Number),
                question: 'Who is the Monarch of England?',
                duration: 4,
                points: 5,
                answers: [
                  {
                    answerId: expect.any(Number),
                    answer: 'Prince Charles',
                    colour: expect.any(String),
                    correct: true
                  },
                  {
                    answerId: expect.any(Number),
                    answer: 'Queen Elizabeth',
                    colour: expect.any(String),
                    correct: false
                  }
                ]
              }
            ],
            duration: 4,
            thumbnailUrl: expect.any(String),
          }
        });
      // // test if the timer works that will send the question into Open
      // await new Promise(resolve => setTimeout(resolve, 4000));
      // const update2 = requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_ANSWER');
      // expect(update2.body).toEqual({});
      // expect(update2.statusCode).toEqual(200);
    });
    //   test('Adding a player correctly sets up the waiting duration for QUESTION_COUNTDOWN', async () => {
    //     // Register and set up the session
    //     const user = (await requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic')).body;
    //     const quiz = (await v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes')).body;
    //     await v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
    //     const autoStartNumber = 1;
    //     const session = (await requestAdminSessionStart(user.token, quiz.quizId, autoStartNumber)).body;

    //     // Add the player which will be the same as updating to NEXT_QUESTION
    //     const player = (await requestPlayerJoin(session.sessionId, 'Victor')).body;
    //     await requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
    //     await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate wait

    //     // Attempt to skip countdown again (assuming the state should not allow this)
    //     const update = await requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');

  //     // Assert the response
  //     expect(update.body).toEqual(error); // Ensure you define what `error` should be before this test
  //     expect(update.statusCode).toEqual(400);
  //   });
  });
});
