import { v2requestAdminQuizCreate, requestAdminAuthRegister, v2requestAdminQuizRemove, v2requestAdminQuizTrash, v2requestAdminQuizList, requestClear } from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizViewTrash', () => {
  describe('Error Tests', () => {
    test('Token is invalid ', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuizRemove(user.token, quizId.quizId);
      const viewTrash = v2requestAdminQuizTrash('Invalid Token');
      expect(viewTrash.body).toEqual(error);
      expect(viewTrash.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuizRemove(user.token, quizId.quizId);

      const viewTrash = v2requestAdminQuizTrash('');
      expect(viewTrash.body).toEqual(error);
      expect(viewTrash.statusCode).toEqual(401);
    });
  });
  describe('Passing Tests', () => {
    test('Quiz Trash successfully viewed', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuizRemove(user.token, quizId.quizId);
      const viewTrash = v2requestAdminQuizTrash(user.token);
      expect(viewTrash.body).toEqual({
        quizzes: [{
          quizId: quizId.quizId,
          name: 'Aero'
        }]
      });
      expect(viewTrash.statusCode).toEqual(200);
      expect(v2requestAdminQuizList(user.token).body).toEqual({ quizzes: [] });
    });
  });
});
