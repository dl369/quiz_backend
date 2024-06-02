import {
  requestAdminAuthRegister, requestAdminQuizCreate, requestAdminQuizInfo,
  requestClear, requestAdminQuizNameUpdate
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizInfo', () => {
  describe('Error Tests', () => {
    test('Invalid token', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizNameUpdate(user.token + 'invalid', quiz.quizId, 'new quiz');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(401);
    });
    test('Invalid quizId', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizNameUpdate(user.token, quiz.quizId + 1, 'new quiz');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(403);
    });
    test('Quiz not owned by user', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('darrius@gmail.com', 'Password1', 'Darrius', 'Lam').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizNameUpdate(user2.token, quiz.quizId, 'new quiz');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(403);
    });
    test('Name contains invalid characters', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizNameUpdate(user.token, quiz.quizId, 'new quiz$$$');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(400);
    });
    test('Name is less than 3 characters long', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizNameUpdate(user.token, quiz.quizId, '1');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(400);
    });
    test('Name is greater than 30 characters long', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizNameUpdate(user.token, quiz.quizId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(400);
    });
    test('Name is already used by the current logged in user for another quiz', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizCreate(user.token, 'Aero2', 'Quiz about Aeroplanes');

      const quizNameUpdate = requestAdminQuizNameUpdate(user.token, quiz.quizId, 'Aero2');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(400);
    });
  });
  describe('Passing Tests', () => {
    test('Successful call', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'My Quiz', 'This is my quiz').body;
      requestAdminQuizInfo(user.token, quiz.quizId);

      const quizNameUpdate = requestAdminQuizNameUpdate(user.token, quiz.quizId, 'new quiz');
      expect(quizNameUpdate.body).toStrictEqual({});
      expect(quizNameUpdate.statusCode).toStrictEqual(200);
      const quizInfo = requestAdminQuizInfo(user.token, quiz.quizId);
      expect(quizInfo.body).toStrictEqual({
        quizId: quiz.quizId,
        name: 'new quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my quiz',
        numQuestions: 0,
        questions: [],
        duration: 0
      });
      // expect(quizInfo.body.timeLastEdited).toBeGreaterThan(quizTime);
    });

    test('update quiz name to same name', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'My Quiz', 'This is my quiz').body;
      const quizNameUpdate = requestAdminQuizNameUpdate(user.token, quiz.quizId, 'My Quiz');
      expect(quizNameUpdate.body).toStrictEqual({});
      const quizInfo = requestAdminQuizInfo(user.token, quiz.quizId);
      expect(quizInfo.body).toStrictEqual({
        quizId: quiz.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my quiz',
        numQuestions: 0,
        questions: [],
        duration: 0
      });
    });
  });
});
