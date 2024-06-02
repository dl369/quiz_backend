import {
  requestAdminQuizCreate, requestAdminAuthRegister, requestClear, requestAdminQuizInfo
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizCreate', () => {
  describe('Error Tests', () => {
    test('Token is invalid', () => {
      const quizId = requestAdminQuizCreate('invalidToken', 'Aero', 'Quiz about Aeroplanes');
      expect(quizId.body).toEqual(error);
      expect(quizId.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const quizId = requestAdminQuizCreate('', 'Aero', 'Quiz about Aeroplanes');
      expect(quizId.body).toEqual(error);
      expect(quizId.statusCode).toEqual(401);
    });
    test('Name contains invalid characters', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, '@ero', 'Quiz about Aeroplanes');
      expect(quizId.body).toEqual(error);
      expect(quizId.statusCode).toEqual(400);
    });
    test('Name is less than 3 characters long', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Ao', 'Quiz about Aeroplanes');
      expect(quizId.body).toEqual(error);
      expect(quizId.statusCode).toEqual(400);
    });
    test('Name is greater than 30 characters long', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aeroplane Quiz about Aeroplanes', 'Quiz about Aeroplanes');
      expect(quizId.body).toEqual(error);
      expect(quizId.statusCode).toEqual(400);
    });
    test('Name is already used by the current logged in user for another quiz', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      const secondQuizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      expect(secondQuizId.body).toEqual(error);
      expect(secondQuizId.statusCode).toEqual(400);
    });
    test('Description is more than 100 characters in length', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about airborne vessels with wings, powered by engines, designed to transport people and cargo over distances');
      expect(quizId.body).toEqual(error);
      expect(quizId.statusCode).toEqual(400);
    });
  });
  describe('Passing Tests', () => {
    test('AuthId, Name and Description are appropriately inputed', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      expect(quizId.body).toEqual({ quizId: expect.any(Number) });
      expect(quizId.statusCode).toEqual(200);

      const quizInfo = requestAdminQuizInfo(user.token, quizId.body.quizId);

      expect(quizInfo.body).toStrictEqual({
        quizId: quizId.body.quizId,
        name: 'Aero',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz about Aeroplanes',
        numQuestions: 0,
        questions: [],
        duration: 0
      });
    });
    test('Register multiple quizzes', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes');
      const secondQuizId = requestAdminQuizCreate(user.token, 'Plane', 'Quiz about Planes');
      expect(quizId.body).toEqual({ quizId: expect.any(Number) });
      expect(secondQuizId.body).toEqual({ quizId: expect.any(Number) });
      expect(quizId.statusCode).toEqual(200);
      expect(secondQuizId.statusCode).toEqual(200);

      let quizInfo = requestAdminQuizInfo(user.token, quizId.body.quizId);
      expect(quizInfo.body).toStrictEqual({
        quizId: quizId.body.quizId,
        name: 'Aero',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz about Aeroplanes',
        numQuestions: 0,
        questions: [],
        duration: 0
      });

      quizInfo = requestAdminQuizInfo(user.token, secondQuizId.body.quizId);
      expect(quizInfo.body).toStrictEqual({
        quizId: secondQuizId.body.quizId,
        name: 'Plane',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz about Planes',
        numQuestions: 0,
        questions: [],
        duration: 0
      });
    });
  });
});
