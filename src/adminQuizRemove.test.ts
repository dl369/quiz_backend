import {
  requestAdminQuizCreate, requestAdminAuthRegister, requestAdminQuizRemove,
  requestAdminQuizInfo, requestAdminQuizTrash, requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizRemove', () => {
  describe('Error Tests', () => {
    test('Token is invalid ', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizRemove = requestAdminQuizRemove('invalidToken', quizId);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizRemove = requestAdminQuizRemove('', quizId);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(401);
    });
    test('QuizId is invalid', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      const quizRemove = requestAdminQuizRemove(user.token, 10);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(403);
    });
    test('QuizId is empty', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      const quizRemove = requestAdminQuizRemove(user.token, 10);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(403);
    });
    test('QuizId belongs to another user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizRemove = requestAdminQuizRemove(user2.token, quizId);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(403);
    });
  });
  describe('Passing Tests', () => {
    test('Last test is removed', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizRemove = requestAdminQuizRemove(user.token, quizId.quizId);
      const trash = requestAdminQuizTrash(user.token);
      expect(quizRemove.body).toEqual({});
      expect(trash.body).toStrictEqual({
        quizzes: [{
          quizId: expect.any(Number),
          name: expect.any(String)
        }]
      });
      expect(requestAdminQuizInfo(user.token, quizId).body).toStrictEqual(error);
      expect(quizRemove.statusCode).toEqual(200);
    });
    test('One test is removed', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizCreate(user.token, 'Plane', 'Quiz about Plaes');
      const quizRemove = requestAdminQuizRemove(user.token, quizId.quizId);
      const trash = requestAdminQuizTrash(user.token);
      expect(quizRemove.body).toEqual({});
      expect(trash.body).toStrictEqual({
        quizzes: [{
          quizId: expect.any(Number),
          name: expect.any(String)
        }]
      });
      expect(requestAdminQuizInfo(user.token, quizId).body).toStrictEqual(error);
      expect(quizRemove.statusCode).toEqual(200);
    });
    test('Remove multiple quizzes from the same user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const secondQuizId = requestAdminQuizCreate(user.token, 'Plane', 'Quiz about Plaes').body;
      const quizRemove = requestAdminQuizRemove(user.token, quizId.quizId);
      const secondQuizRemove = requestAdminQuizRemove(user.token, secondQuizId.quizId);
      const trash = requestAdminQuizTrash(user.token);
      expect(requestAdminQuizInfo(user.token, quizId).body).toStrictEqual(error);
      expect(requestAdminQuizInfo(user.token, secondQuizId).body).toStrictEqual(error);
      expect(quizRemove.body).toEqual({});
      expect(secondQuizRemove.body).toEqual({});
      expect(trash.body).toStrictEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String)
          },
          {
            quizId: expect.any(Number),
            name: expect.any(String)
          }
        ]
      });
      expect(quizRemove.statusCode).toEqual(200);
      expect(secondQuizRemove.statusCode).toEqual(200);
    });
    test('Remove quizzes from different users', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const secondQuizId = requestAdminQuizCreate(user2.token, 'Plane', 'Quiz about Plaes').body;
      const quizRemove = requestAdminQuizRemove(user.token, quizId.quizId);
      const secondQuizRemove = requestAdminQuizRemove(user2.token, secondQuizId.quizId);
      const trash = requestAdminQuizTrash(user.token);
      expect(quizRemove.body).toEqual({});
      expect(secondQuizRemove.body).toEqual({});
      expect(trash.body).toStrictEqual({
        quizzes: [
          {
            quizId: quizId.quizId,
            name: 'Aero'
          }
        ]
      });
      expect(requestAdminQuizInfo(user.token, quizId).body).toStrictEqual(error);
      expect(requestAdminQuizInfo(user2.token, secondQuizId).body).toStrictEqual(error);
      expect(quizRemove.statusCode).toEqual(200);
      expect(secondQuizRemove.statusCode).toEqual(200);
    });
  });
});
