import {
  v2requestAdminQuizCreate, requestAdminAuthRegister, v2requestAdminQuizRemove,
  v2requestAdminQuizInfo, v2requestAdminQuizTrash, requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('v2adminQuizRemove', () => {
  describe('Error Tests', () => {
    test('Token is invalid ', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizRemove = v2requestAdminQuizRemove('invalidToken', quizId.quizId);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizRemove = v2requestAdminQuizRemove('', quizId.quizId);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(401);
    });
    test('QuizId is invalid', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      const quizRemove = v2requestAdminQuizRemove(user.token, 10);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(403);
    });
    test('QuizId is empty', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      const quizRemove = v2requestAdminQuizRemove(user.token, 10);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(403);
    });
    test('QuizId belongs to another user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizRemove = v2requestAdminQuizRemove(user2.token, quizId.quizId);
      expect(quizRemove.body).toEqual(error);
      expect(quizRemove.statusCode).toEqual(403);
    });
  });
  describe('Passing Tests', () => {
    test('Last test is removed', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quizRemove = v2requestAdminQuizRemove(user.token, quizId.quizId);
      const trash = v2requestAdminQuizTrash(user.token);
      expect(quizRemove.body).toEqual({});
      expect(trash.body).toStrictEqual({
        quizzes: [{
          quizId: expect.any(Number),
          name: expect.any(String)
        }]
      });
      expect(v2requestAdminQuizInfo(user.token, quizId.quizId).body).toStrictEqual(error);
      expect(quizRemove.statusCode).toEqual(200);
    });
    test('One test is removed', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuizCreate(user.token, 'Plane', 'Quiz about Plaes');
      const quizRemove = v2requestAdminQuizRemove(user.token, quizId.quizId);
      const trash = v2requestAdminQuizTrash(user.token);
      expect(quizRemove.body).toEqual({});
      expect(trash.body).toStrictEqual({
        quizzes: [{
          quizId: expect.any(Number),
          name: expect.any(String)
        }]
      });
      expect(v2requestAdminQuizInfo(user.token, quizId.quizId).body).toStrictEqual(error);
      expect(quizRemove.statusCode).toEqual(200);
    });
    test('Remove multiple quizzes from the same user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const secondQuizId = v2requestAdminQuizCreate(user.token, 'Plane', 'Quiz about Plaes').body;
      const quizRemove = v2requestAdminQuizRemove(user.token, quizId.quizId);
      const secondQuizRemove = v2requestAdminQuizRemove(user.token, secondQuizId.quizId);
      const trash = v2requestAdminQuizTrash(user.token);
      expect(v2requestAdminQuizInfo(user.token, quizId.quizId).body).toStrictEqual(error);
      expect(v2requestAdminQuizInfo(user.token, secondQuizId.quizId).body).toStrictEqual(error);
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
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const secondQuizId = v2requestAdminQuizCreate(user2.token, 'Plane', 'Quiz about Plaes').body;
      const quizRemove = v2requestAdminQuizRemove(user.token, quizId.quizId);
      const secondQuizRemove = v2requestAdminQuizRemove(user2.token, secondQuizId.quizId);
      const trash = v2requestAdminQuizTrash(user.token);
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
      expect(v2requestAdminQuizInfo(user.token, quizId.quizId).body).toStrictEqual(error);
      expect(v2requestAdminQuizInfo(user2.token, secondQuizId.quizId).body).toStrictEqual(error);
      expect(quizRemove.statusCode).toEqual(200);
      expect(secondQuizRemove.statusCode).toEqual(200);
    });
  });
});
