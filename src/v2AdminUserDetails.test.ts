import { requestAdminAuthRegister, v2requestAdminUserDetails, requestClear } from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Testing adminUserDetails', () => {
  test('Token is invalid', () => {
    const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
    // Create an invalid token by adding 1 to the session and login id
    const userDetails = v2requestAdminUserDetails(user.token + 'invalid');
    expect(userDetails.body).toEqual(error);
    expect(userDetails.statusCode).toEqual(401);
  });

  test('Token is empty', () => {
    const userDetails = v2requestAdminUserDetails('');
    expect(userDetails.body).toEqual(error);
    expect(userDetails.statusCode).toEqual(401);
  });

  test('AuthUserId return type is valid', () => {
    const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
    const userDetails = v2requestAdminUserDetails(user.token);
    expect(userDetails.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Matthew Vucic',
        email: 'matthewvucic@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
    expect(userDetails.statusCode).toEqual(200);
  });
});
