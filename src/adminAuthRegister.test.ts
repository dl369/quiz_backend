import { requestAdminAuthRegister, requestAdminUserDetails, requestClear } from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminAuthRegister HTTP Tests', () => {
  describe('authUserId appropriately returned', () => {
    test('User inputs valid email, password, nameFirst, nameLast', () => {
      const token = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      expect(token.token).toEqual(expect.any(String));

      expect(requestAdminUserDetails(token.token).body).toStrictEqual({
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

  describe('Error appropriately returned', () => {
    describe('Email address error tests', () => {
      test('Email address used by another User', () => {
        requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic');
        // expect(firstAuthUserId).toEqual({authUserId: expect.any(Number)})

        const token2 = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic');
        expect(token2.body).toEqual(error);
        expect(token2.statusCode).toEqual(400);
      });

      test('Email address is invalid', () => {
        const token = requestAdminAuthRegister('matthewvucicgmail.com', 'Password1', 'Matthew', 'Vucic');
        expect(token.body).toEqual(error);
        expect(token.statusCode).toEqual(400);
      });
    });

    describe('Name error tests', () => {
      test.each([
        // Testing nameFirst -> authUserId, email and nameLast don't matter
        { nameFirst: 'M' }, // Testing a name with numbers
        { nameFirst: '"Matthew#"' }, // Testing a name with special characters
        { nameFirst: 'B' }, // Testing a name with < 2 characters
        { nameFirst: 'Matthew-Stephen-Isaac' } // Testing a name with > 20 characters
      ])("error: ('$nameFirst') is Invalid", ({ nameFirst }) => {
        const token = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', nameFirst, 'Vucic');
        expect(token.body).toEqual(error);
        expect(token.statusCode).toEqual(400);
      });
      // Testing if the nameLast is valid
      test.each([
        // Testing nameLast -> authUserId, email and nameFirst don't matter
        { nameLast: 'J0hnson' }, // Testing a name with numbers
        { nameLast: '"Vucic!"' }, // Testing a name with special characters
        { nameLast: 'V' }, // Testing a name with < 2 characters
        { nameLast: 'Vucic-Anastasiou-Chiu' } // Testing a name with > 20 characters
      ])("error: ('$nameLast') is Invalid", ({ nameLast }) => {
        const token = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', nameLast);
        expect(token.body).toEqual(error);
        expect(token.statusCode).toEqual(400);
      });

      describe('Password error tests', () => {
        test.each([
        // Testing nameLast -> authUserId, email and nameFirst don't matter
          { password: '1111111' }, // Testing Password contains zero letters
          { password: 'Password' }, // Testing Password contains zero numbers
          { password: 'Pass1' }, // Password contains less than 8 characters
        ])("error: ('$password') is Invalid", ({ password }) => {
          const token = requestAdminAuthRegister('matthewvucic@gmail.com', password, 'Matthew', 'Vucic');
          expect(token.body).toEqual(error);
          expect(token.statusCode).toEqual(400);
        });
      });
    });
  });
});
