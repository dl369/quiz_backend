import {
  requestAdminAuthRegister, requestAdminAuthLogin, requestAdminUserDetails,
  requestClear
} from './requestBoilerPlates';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

const error = { error: expect.any(String) };

describe('adminAuthLogin HTTP Tests', () => {
  describe('token appropriately returned', () => {
    test('User inputs valid email, password', () => {
      requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic');
      const logInToken = requestAdminAuthLogin('matthewvucic@gmail.com', 'Password1');

      expect(logInToken.body).toEqual({ token: expect.any(String) });
      expect(logInToken.statusCode).toEqual(200);
    });

    test('numSuccessfulLogins and numFailedPasswordsSinceLastLogin are properly updating', () => {
      // successful login
      requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic');
      const logInToken = requestAdminAuthLogin('matthewvucic@gmail.com', 'Password1').body.token;

      expect(requestAdminUserDetails(logInToken).body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Matthew Vucic',
          email: 'matthewvucic@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
      // unsuccessful login, incorrect password
      expect(requestAdminAuthLogin('matthewvucic@gmail.com', 'wrongpassword').body).toEqual(error);
      expect(requestAdminUserDetails(logInToken).body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Matthew Vucic',
          email: 'matthewvucic@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 1,
        }
      });
      expect(requestAdminAuthLogin('matthewvucic@gmail.com', 'Password1').body.token).toEqual(expect.any(String));
      expect(requestAdminUserDetails(logInToken).body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Matthew Vucic',
          email: 'matthewvucic@gmail.com',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });
  });

  describe('Error message appropriately returned', () => {
    test('Registering user, then logging in with alternative email address', () => {
      requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic');
      const invalidUser = requestAdminAuthLogin('stephen@gmail.com', 'Password2');

      expect(invalidUser.body).toEqual(error);
      expect(invalidUser.statusCode).toEqual(400);
    });
    test('Logging in within email address without any users registered', () => {
      const invalidUser = requestAdminAuthLogin('matthewvucic@gmail.com', 'Password1');

      expect(invalidUser.body).toEqual(error);
      expect(invalidUser.statusCode).toEqual(400);
    });
    test('Incorrect Password', () => {
      requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic');
      const userIncPass = requestAdminAuthLogin('matthewvucic@gmail.com', 'Password2');

      expect(userIncPass.body).toEqual(error);
      expect(userIncPass.statusCode).toEqual(400);
    });
  });
});
