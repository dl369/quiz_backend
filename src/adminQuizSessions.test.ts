import {
  v2requestAdminQuizCreate, requestAdminAuthRegister, v2requestAdminQuestionCreate,
  requestClear, requestAdminSessionStart, requestAdminQuizSessions, requestAdminUpdateSession
} from './requestBoilerPlates';

const error = { error: expect.any(String) };
const autoStartNum = 10;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizSessions', () => {
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
      requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      const sessionStatus = requestAdminQuizSessions('invalidToken', quizId.quizId);
      expect(sessionStatus.body).toEqual(error);
      expect(sessionStatus.statusCode).toEqual(401);
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
      requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      const sessionStatus = requestAdminQuizSessions('', quizId.quizId);
      expect(sessionStatus.body).toEqual(error);
      expect(sessionStatus.statusCode).toEqual(401);
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
      requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      const sessionStatus = requestAdminQuizSessions(user.token, 10);
      expect(sessionStatus.body).toEqual(error);
      expect(sessionStatus.statusCode).toEqual(403);
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
      requestAdminSessionStart(user.token, quizId.quizId, autoStartNum);
      const sessionStatus = requestAdminQuizSessions(user2.token, quizId.quizId);
      expect(sessionStatus.body).toEqual(error);
      expect(sessionStatus.statusCode).toEqual(403);
    });
  });
  describe('Passing Tests', () => {
    test('View sessions', () => {
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
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const sessionStatus = requestAdminQuizSessions(user.token, quizId.quizId);
      expect(sessionStatus.body).toEqual({ activeSessions: [expect.any(Number)], inactiveSessions: [] });
      expect(sessionStatus.statusCode).toEqual(200);
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      const sessionStatus2 = requestAdminQuizSessions(user.token, quizId.quizId);
      expect(sessionStatus2.body).toEqual({ activeSessions: [], inactiveSessions: [expect.any(Number)] });
      expect(sessionStatus2.statusCode).toEqual(200);
    });
  });
});
