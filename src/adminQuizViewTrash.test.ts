import { requestAdminQuizCreate, requestAdminAuthRegister, requestAdminQuizRemove, requestAdminQuizTrash, requestAdminQuizList, requestClear } from './requestBoilerPlates';

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
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      const viewTrash = requestAdminQuizTrash('Invalid Token');
      expect(viewTrash.body).toEqual(error);
      expect(viewTrash.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);

      const viewTrash = requestAdminQuizTrash('');
      expect(viewTrash.body).toEqual(error);
      expect(viewTrash.statusCode).toEqual(401);
    });
  });
  describe('Passing Tests', () => {
    test('Quiz Trash successfully viewed', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);

      const user2 = requestAdminAuthRegister('darrius@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId2 = requestAdminQuizCreate(user2.token, 'Aero2', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user2.token, quizId2.quizId);

      const viewTrash = requestAdminQuizTrash(user.token);
      expect(viewTrash.body).toEqual({
        quizzes: [{
          quizId: quizId.quizId,
          name: 'Aero'
        }]
      });
      expect(viewTrash.statusCode).toEqual(200);
      expect(requestAdminQuizList(user.token).body).toEqual({ quizzes: [] });
    });
  });
});
