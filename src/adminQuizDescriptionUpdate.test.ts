import {
  requestAdminAuthRegister, requestAdminQuizCreate, requestAdminQuizInfo,
  requestClear, requestAdminQuizDescriptionUpdate
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

      const quizNameUpdate = requestAdminQuizDescriptionUpdate(user.token + 'invalid', quiz.quizId, 'new quiz');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(401);
    });
    test('Invalid quizId', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizDescriptionUpdate(user.token, quiz.quizId + 1, 'new quiz');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(403);
    });
    test('Quiz not owned by user', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('darrius@gmail.com', 'Password1', 'Darrius', 'Lam').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizDescriptionUpdate(user2.token, quiz.quizId, 'new quiz');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(403);
    });
    test('Description is greater than 100 characters long', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizNameUpdate = requestAdminQuizDescriptionUpdate(user.token, quiz.quizId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaazzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzaaaaaaaaaaaaa');
      expect(quizNameUpdate.body).toStrictEqual(error);
      expect(quizNameUpdate.statusCode).toStrictEqual(400);
    });
  });
  describe('Passing Tests', () => {
    test('Successful call', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'My Quiz', 'This is my quiz').body;
      requestAdminQuizInfo(user.token, quiz.quizId);

      const quizNameUpdate = requestAdminQuizDescriptionUpdate(user.token, quiz.quizId, 'new description');
      expect(quizNameUpdate.body).toStrictEqual({});
      expect(quizNameUpdate.statusCode).toStrictEqual(200);
      const quizInfo = requestAdminQuizInfo(user.token, quiz.quizId);
      expect(quizInfo.body).toStrictEqual({
        quizId: quiz.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'new description',
        numQuestions: 0,
        questions: [],
        duration: 0
      });
      // expect(quizInfo.body.timeLastEdited).toBeGreaterThan(quizTime);
    });
  });
});
