import {
  requestAdminAuthRegister, v2requestAdminQuizCreate,
  v2requestAdminQuizList, requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizList Tests', () => {
  describe('Error Tests', () => {
    test('Token is invalid', () => {
      const quizzes = v2requestAdminQuizList('invalidToken');
      expect(quizzes.body).toEqual(error);
      expect(quizzes.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const quizzes = v2requestAdminQuizList('');
      expect(quizzes.body).toEqual(error);
      expect(quizzes.statusCode).toEqual(401);
    });
  });
  describe('Passing Tests', () => {
    test('Valid Token is inputted', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      const quizzes = v2requestAdminQuizList(user.token);
      expect(quizzes.body).toStrictEqual({
        quizzes: [{
          quizId: expect.any(Number),
          name: expect.any(String)
        }]
      });
      expect(quizzes.statusCode).toEqual(200);
    });
    test('Empty List', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizzes = v2requestAdminQuizList(user.token);
      expect(quizzes.body).toEqual({ quizzes: [] });
      expect(quizzes.statusCode).toEqual(200);
    });
    test('Multiple quizzes', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      v2requestAdminQuizCreate(user.token, 'Plane', 'Another Quiz about Planes');
      const quizzes = v2requestAdminQuizList(user.token);
      expect(quizzes.body).toStrictEqual({
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
      expect(quizzes.statusCode).toEqual(200);
    });
  });
});
