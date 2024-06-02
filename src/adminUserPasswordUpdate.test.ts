import { requestAdminAuthRegister, requestAdminUserPasswordUpdate, requestClear } from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Admin User Password Update Tests', () => {
  test('Rejects password update when old and new passwords are identical', () => {
    const registrationData = {
      email: 'matthewvucic@gmail.com',
      password: 'Password1',
      nameFirst: 'Matthew',
      nameLast: 'Vucic'
    };
    const registrationResponse = requestAdminAuthRegister(registrationData.email, registrationData.password, registrationData.nameFirst, registrationData.nameLast);
    const token = registrationResponse.body.token;
    const passwordUpdateResponse = requestAdminUserPasswordUpdate(token, 'Password1', 'Password1');

    expect(passwordUpdateResponse.body).toEqual(error);
  });

  test('Rejects password update when the new password was previously used', () => {
    const registrationData = {
      email: 'matthewvucic@gmail.com',
      password: 'Password1',
      nameFirst: 'Matthew',
      nameLast: 'Vucic'
    };
    const registrationResponse = requestAdminAuthRegister(
      registrationData.email,
      registrationData.password,
      registrationData.nameFirst,
      registrationData.nameLast);
    const token = registrationResponse.body.token;

    requestAdminUserPasswordUpdate(token, 'Password1', 'Password12');
    const passwordUpdateResponse = requestAdminUserPasswordUpdate(token, 'Password12', 'Password1');

    expect(passwordUpdateResponse.statusCode).toEqual(400);
    expect(passwordUpdateResponse.body).toEqual(error);
  });

  test('Rejects password update for passwords under 8 characters', () => {
    const registrationData = {
      email: 'matthewvucic@gmail.com',
      password: 'Password1',
      nameFirst: 'Matthew',
      nameLast: 'Vucic'
    };
    const registrationResponse = requestAdminAuthRegister(
      registrationData.email,
      registrationData.password,
      registrationData.nameFirst,
      registrationData.nameLast);

    const token = registrationResponse.body.token;

    const passwordUpdateResponse = requestAdminUserPasswordUpdate(token, 'Password1', 'short');

    expect(passwordUpdateResponse.statusCode).toEqual(400);
    expect(passwordUpdateResponse.body).toEqual(error);
  });

  test('Rejects password update without a mix of letters and numbers', () => {
    // Registration
    const registrationData = {
      email: 'mixTest@gmail.com',
      password: 'Password1',
      nameFirst: 'Mix',
      nameLast: 'Test'
    };
    const registrationResponse = requestAdminAuthRegister(
      registrationData.email,
      registrationData.password,
      registrationData.nameFirst,
      registrationData.nameLast
    );
    const token = registrationResponse.body.token;

    // Attempt password update with letters only
    const responseLettersOnly = requestAdminUserPasswordUpdate(
      token,
      'Password1',
      'OnlyLetters!'
    );
    expect(responseLettersOnly.statusCode).toEqual(400);
    expect(responseLettersOnly.body).toEqual(error);

    // Attempt password update with numbers only
    const responseNumbersOnly = requestAdminUserPasswordUpdate(
      token,
      'Password1',
      '123456789'
    );
    // expect(responseNumbersOnly.statusCode).toEqual(400);
    expect(responseNumbersOnly.body).toEqual(error);
  });

  test('should reject password update due to old password mismatch', () => {
    // Registration
    const registrationData = {
      email: 'mismatchTest@gmail.com',
      password: 'Password1',
      nameFirst: 'Mismatch',
      nameLast: 'Test'
    };
    const registrationResponse = requestAdminAuthRegister(
      registrationData.email,
      registrationData.password,
      registrationData.nameFirst,
      registrationData.nameLast
    );
    const token = registrationResponse.body.token;

    // Attempt password update with incorrect old password
    const result = requestAdminUserPasswordUpdate(
      token,
      'IncorrectOldPassword',
      'NewValidPassword!2'
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(error);
  });

  test('should reject password update when new password matches old password', () => {
    // Registration
    const registrationData = {
      email: 'rejectMatchTest@gmail.com',
      password: 'Password1',
      nameFirst: 'RejectMatch',
      nameLast: 'Test'
    };
    const registrationResponse = requestAdminAuthRegister(
      registrationData.email,
      registrationData.password,
      registrationData.nameFirst,
      registrationData.nameLast
    );
    const token = registrationResponse.body.token;

    // Attempt password update with the new password matching the old password
    const result = requestAdminUserPasswordUpdate(
      token,
      'Password1',
      'Password1'
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(error);
  });

  test('should reject password update for invalid session token', () => {
    const invalidToken = 'invalidToken123';

    // Attempt password update with an invalid token
    const result = requestAdminUserPasswordUpdate(
      invalidToken,
      'AnyPassword123!',
      'NewPassword456!'
    );
    expect(result.statusCode).toEqual(401);
    expect(result.body).toEqual(error);
  });

  test('should accept password update with all conditions met', () => {
    // Registration
    const registrationData = {
      email: 'acceptTest@gmail.com',
      password: 'Password1',
      nameFirst: 'Accept',
      nameLast: 'Test'
    };
    const registrationResponse = requestAdminAuthRegister(
      registrationData.email,
      registrationData.password,
      registrationData.nameFirst,
      registrationData.nameLast
    );
    const token = registrationResponse.body.token;

    // Attempt password update meeting all conditions
    const result = requestAdminUserPasswordUpdate(
      token,
      'Password1',
      'Password12'
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({});
  });
});
