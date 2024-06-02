import {
  v2requestAdminQuizCreate, requestAdminAuthRegister, v2requestAdminQuestionCreate,
  requestClear, requestAdminSessionStart, v2requestAdminQuizRemove, requestAdminQuizSessions
} from './requestBoilerPlates';

const error = { error: expect.any(String) };
const autoStartNum = 10;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminSessionStart', () => {
  describe('Error Tests', () => {
    test('Token is invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const session = requestAdminSessionStart('invalidToken', quizId.quizId, autoStartNum);
      expect(session.body).toEqual(error);
      expect(session.statusCode).toEqual(401);
    });

    test('Token is empty', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const session = requestAdminSessionStart('', quizId.quizId, autoStartNum);
      expect(session.body).toEqual(error);
      expect(session.statusCode).toEqual(401);
    });
    test('autoStartNum is greater than 50', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quizId.quizId, 51);
      expect(session.body).toEqual(error);
      expect(session.statusCode).toEqual(400);
    });
    test('Number of sessions for this quiz exceeds 10', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      for (let i = 0; i < 10; i++) {
        requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      }
      const session = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      expect(session.body).toEqual(error);
      expect(session.statusCode).toEqual(400);
    });

    test('The quiz does not have any questions in it', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const session = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      expect(session.body).toEqual(error);
      expect(session.statusCode).toEqual(400);
    });
    test('Quiz is in the trash', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      v2requestAdminQuizRemove(user.token, quizId.quizId);
      const session = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      expect(session.body).toEqual(error);
      expect(session.statusCode).toEqual(400);
    });
    test('quizId is invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, 10, autoStartNum);
      expect(session.body).toEqual(error);
      expect(session.statusCode).toEqual(403);
    });
    test('quiz belongs to another user', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user2.token, quizId.quizId, autoStartNum);
      expect(session.body).toEqual(error);
      expect(session.statusCode).toEqual(403);
    });
  });
  describe('Passing Tests', () => {
    test('One session is created', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      expect(session.body).toEqual({ sessionId: expect.any(Number) });
      expect(session.statusCode).toEqual(200);
      const sessionStatus = requestAdminQuizSessions(user.token, quizId.quizId);
      expect(sessionStatus.body).toEqual({ activeSessions: [expect.any(Number)], inactiveSessions: [] });
    });
    test('Multiple sessions are created', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      const session2 = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      expect(session.body).toEqual({ sessionId: expect.any(Number) });
      expect(session.statusCode).toEqual(200);
      expect(session2.body).toEqual({ sessionId: expect.any(Number) });
      expect(session2.statusCode).toEqual(200);
      const sessionStatus = requestAdminQuizSessions(user.token, quizId.quizId);
      expect(sessionStatus.body).toEqual({ activeSessions: [expect.any(Number), expect.any(Number)], inactiveSessions: [] });
    });
  });
});
