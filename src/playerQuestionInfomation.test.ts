import {
  v2requestAdminQuizCreate, requestAdminAuthRegister, v2requestAdminQuestionCreate,
  requestClear, requestAdminSessionStart, requestPlayerJoin,
  requestPlayerQuestionInfomation, requestAdminUpdateSession
} from './requestBoilerPlates';

const error = { error: expect.any(String) };
const autoStartNum = 10;
const initialQuestionPosition = 1;
const questionBody = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
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

describe('playerQuestionInfomation', () => {
  describe('Error Tests', () => {
    test('PlayerId does not exist', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      const playerQuestionInfo = requestPlayerQuestionInfomation(player.playerId + 1, initialQuestionPosition);
      expect(playerQuestionInfo.body).toEqual(error);
      expect(playerQuestionInfo.statusCode).toEqual(400);
    });
    test('questionPosition is invalid for the current session', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      const playerQuestionInfo = requestPlayerQuestionInfomation(player.playerId, 1000);
      expect(playerQuestionInfo.body).toEqual(error);
      expect(playerQuestionInfo.statusCode).toEqual(400);
    });
    test('Session is not currently on this question', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const questionBody2 = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
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
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody2);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      const playerQuestionInfo = requestPlayerQuestionInfomation(player.playerId, initialQuestionPosition + 1);
      expect(playerQuestionInfo.body).toEqual(error);
      expect(playerQuestionInfo.statusCode).toEqual(400);
    });
    test('Session state is invalid: LOBBY', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      const playerQuestionInfo = requestPlayerQuestionInfomation(player.playerId, initialQuestionPosition);
      expect(playerQuestionInfo.body).toEqual(error);
      expect(playerQuestionInfo.statusCode).toEqual(400);
    });
    test('Session state is invalid: QUESTION_COUNTDOWN', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT QUESTION');
      const playerQuestionInfo = requestPlayerQuestionInfomation(player.playerId, initialQuestionPosition);
      expect(playerQuestionInfo.body).toEqual(error);
      expect(playerQuestionInfo.statusCode).toEqual(400);
    });
    test('Session state is invalid: END', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'END');
      const playerQuestionInfo = requestPlayerQuestionInfomation(player.playerId, initialQuestionPosition);
      expect(playerQuestionInfo.body).toEqual(error);
      expect(playerQuestionInfo.statusCode).toEqual(400);
    });
  });
  describe('Success cases', () => {
    test('Successfully getting the Question info of a player', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      const playerQuestionInfo = requestPlayerQuestionInfomation(player.playerId, initialQuestionPosition);
      expect(playerQuestionInfo.body).toStrictEqual(
        {
          questionId: question.questionId,
          question: 'Who is the Monarch of England?',
          duration: 4,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Prince Charles',
              colour: expect.any(String)
            },
            {
              answerId: expect.any(Number),
              answer: 'Queen Elizabeth',
              colour: expect.any(String)
            }
          ]
        });
      expect(playerQuestionInfo.statusCode).toEqual(200);
    });
  });
});
