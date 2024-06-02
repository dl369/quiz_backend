import {
  requestAdminAuthRegister, requestAdminAuthLogin, v2requestAdminAuthLogout,
  v2requestAdminQuizCreate, requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminAuthLogout HTTP Tests', () => {
  describe('Logout successful', () => {
    test('Valid logged-in token input', () => {
      const token1 = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic');
      const token2 = requestAdminAuthLogin('matthewvucic@gmail.com', 'Password1');

      const logOut1 = v2requestAdminAuthLogout(token1.body.token);

      expect(logOut1.body).toEqual({});
      expect(logOut1.statusCode).toEqual(200);

      const createQuizLoggedOut = v2requestAdminQuizCreate(token1.body.token, 'Matthew Vucic', 'Soccer');
      const createQuizLoggedIn = v2requestAdminQuizCreate(token2.body.token, 'Matthew Vucic', 'Basketball');

      expect(createQuizLoggedOut.body).toEqual(error);
      expect(createQuizLoggedOut.statusCode).toEqual(401);

      expect(createQuizLoggedIn.body).toEqual({ quizId: expect.any(Number) });
      expect(createQuizLoggedIn.statusCode).toEqual(200);
    });
  });

  describe('Error message appropriately returned', () => {
    test('Token empty', () => {
      const logout = v2requestAdminAuthLogout('');
      expect(logout.body).toEqual(error);
    });
    test('Token invalid', () => {
      const token1 = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;

      const logOut1 = v2requestAdminAuthLogout(token1.token);
      const logOut2 = v2requestAdminAuthLogout(token1.token);

      expect(logOut1.body).toEqual({});
      expect(logOut1.statusCode).toEqual(200);

      expect(logOut2.body).toEqual(error);
      expect(logOut2.statusCode).toEqual(401);
    });
  });
});
