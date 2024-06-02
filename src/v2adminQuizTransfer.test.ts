import {
  v2requestAdminQuizCreate, requestAdminAuthRegister, v2requestAdminQuizTransfer,
  v2requestAdminQuestionCreate, requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizTransfer', () => {
  describe('Error Tests', () => {
    test('Token is invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu');
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const transfer = v2requestAdminQuizTransfer(quizId.quizId, 'invalidToken', 'isaacchiu@gmail.com');
      expect(transfer.body).toEqual(error);
      expect(transfer.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu');
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const transfer = v2requestAdminQuizTransfer(quizId.quizId, '', 'isaacchiu@gmail.com');
      expect(transfer.body).toEqual(error);
      expect(transfer.statusCode).toEqual(401);
    });
    test('QuizId is invalid', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu');
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const transfer = v2requestAdminQuizTransfer(quizId.quizId + 1, user.token, 'isaacchiu@gmail.com');
      expect(transfer.body).toEqual(error);
      expect(transfer.statusCode).toEqual(403);
    });
    test('QuizId belongs to another user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const transfer = v2requestAdminQuizTransfer(quizId.quizId, user2.token, 'isaacchiu@gmail.com');
      expect(transfer.body).toEqual(error);
      expect(transfer.statusCode).toEqual(403);
    });
    test('userEmail is not a real user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const transfer = v2requestAdminQuizTransfer(quizId.quizId, user.token, 'isaacchiu@gmail.com');
      expect(transfer.body).toEqual(error);
      expect(transfer.statusCode).toEqual(400);
    });
    test('userEmail is the logged in user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const transfer = v2requestAdminQuizTransfer(quizId.quizId, user.token, 'matthewvuci@gmail.com');
      expect(transfer.body).toEqual(error);
      expect(transfer.statusCode).toEqual(400);
    });
    test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuizCreate(user2.token, 'Aero', 'Quiz about Aeroplanes');
      const transfer = v2requestAdminQuizTransfer(quizId.quizId, user.token, 'isaacchiu@gmail.com');
      expect(transfer.body).toEqual(error);
      expect(transfer.statusCode).toEqual(400);
    });
  });
  describe('Passing Tests', () => {
    test('Quiz is transfered sucessfully', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu');
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const transfer = v2requestAdminQuizTransfer(quizId.quizId, user.token, 'isaacchiu@gmail.com');
      expect(transfer.body).toEqual({});
      expect(transfer.statusCode).toEqual(200);
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(403);
    });
    test('Multiple quizzes are transfered sucessfully', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu');
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizId2 = v2requestAdminQuizCreate(user.token, 'Plane', 'Quiz about Aeroplanes').body;
      const transfer = v2requestAdminQuizTransfer(quizId.quizId, user.token, 'isaacchiu@gmail.com');
      const transfer2 = v2requestAdminQuizTransfer(quizId2.quizId, user.token, 'isaacchiu@gmail.com');
      expect(transfer.body).toEqual({});
      expect(transfer2.body).toEqual({});
      expect(transfer.statusCode).toEqual(200);
      expect(transfer2.statusCode).toEqual(200);
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const question2 = v2requestAdminQuestionCreate(quizId2.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question2.body).toEqual(error);
      expect(question.statusCode).toEqual(403);
      expect(question2.statusCode).toEqual(403);
    });
  });
});
