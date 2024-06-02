import {
  requestAdminAuthRegister,
  v2requestAdminUserDetails,
  v2requestAdminUserDetailsUpdate,
  requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Testing adminUserDetailsUpdate', () => {
  describe('Error Tests:', () => {
    test('Token is Invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      // Create an invalid token by adding 1 to the session and login id
      const detailsUpdate = v2requestAdminUserDetailsUpdate(user.token + 'invalid', 'z1234567@ad.unsw.edu.au', 'Bob', 'Johnson');
      expect(detailsUpdate.body).toStrictEqual(error);
      expect(detailsUpdate.statusCode).toStrictEqual(401);
    });
    test('Token is Empty', () => {
      const detailsUpdate = v2requestAdminUserDetailsUpdate('', 'z1234567@ad.unsw.edu.au', 'Bob', 'Johnson');
      expect(detailsUpdate.body).toStrictEqual(error);
      expect(detailsUpdate.statusCode).toStrictEqual(401);
    });
    test('Email is currently being used by another user', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminAuthRegister('darrius@gmail.com', 'Password1', 'Darrius', 'Lam');
      // Try to update email to token's email (The user already registered)
      const detailsUpdate = v2requestAdminUserDetailsUpdate(user.token, 'darrius@gmail.com', 'Bob', 'Johnson');
      expect(detailsUpdate.body).toStrictEqual(error);
      expect(detailsUpdate.statusCode).toStrictEqual(400);
    });
    // Testing emails that do not pass the validator test
    test.each([
      { email: 'z1234567ad.unsw.edu.au' }, // Missing @
      { email: 'z1234567@ad.123' }, // .Number
      { email: 'z1234567@ad&12' }, // Blacklisted symbol '&'
      { email: 'z1234567@' }, // Nothing after @
    ])("error: ('$email')", ({ email }) => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const userDetailsUpdate = v2requestAdminUserDetailsUpdate(user.token, email, 'Bob', 'Johnson');
      expect(userDetailsUpdate.body).toStrictEqual(error);
      expect(userDetailsUpdate.statusCode).toStrictEqual(400);
    });
    // Testing if the nameFirst is valid
    test.each([
      // Testing nameFirst -> authUserId, email and nameLast don't matter
      { nameFirst: 'B0b' }, // Testing a name with numbers
      { nameFirst: 'B!(l""#' }, // Testing a name with special characters
      { nameFirst: 'B' }, // Testing a name with < 2 characters
      { nameFirst: 'thisnamehasmorethantwentyletters' } // Testing a name with > 20 characters
    ])("error: ('$nameFirst') is Invalid", ({ nameFirst }) => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const userDetailsUpdate = v2requestAdminUserDetailsUpdate(user.token, 'victor@gmail.com', nameFirst, 'Johnson');
      expect(userDetailsUpdate.body).toStrictEqual(error);
      expect(userDetailsUpdate.statusCode).toStrictEqual(400);
    });
    // Testing if the nameLast is valid
    test.each([
      // Testing nameLast -> authUserId, email and nameFirst don't matter
      { nameLast: 'J0hnson' }, // Testing a name with numbers
      { nameLast: 'J!nS()n' }, // Testing a name with special characters
      { nameLast: 'J' }, // Testing a name with < 2 characters
      { nameLast: 'thisnamehasmorethantwentyletters' } // Testing a name with > 20 characters
    ])("error: ('$nameLast') is Invalid", ({ nameLast }) => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const userDetailsUpdate = v2requestAdminUserDetailsUpdate(user.token, 'victor@gmail.com', 'Bob', nameLast);
      expect(userDetailsUpdate.body).toStrictEqual(error);
      expect(userDetailsUpdate.statusCode).toStrictEqual(400);
    });
  });
  test('AdminUserDetailsUpdate is successful', () => {
    const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
    const userDetailsUpdate = v2requestAdminUserDetailsUpdate(user.token, 'expectedvictor@gmail.com', 'Bob', 'Johnson');
    expect(userDetailsUpdate.body).toStrictEqual({});
    expect(userDetailsUpdate.statusCode).toStrictEqual(200);
    expect(v2requestAdminUserDetails(user.token).body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Bob Johnson',
        email: 'expectedvictor@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });
  test('update user to same details', () => {
    const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
    const userDetailsUpdate = v2requestAdminUserDetailsUpdate(user.token, 'matthewvucic@gmail.com', 'Matthew', 'Vucic');
    expect(userDetailsUpdate.body).toStrictEqual({});
    expect(v2requestAdminUserDetails(user.token).body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Matthew Vucic',
        email: 'matthewvucic@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });
});
