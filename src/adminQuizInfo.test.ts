import { requestAdminAuthRegister, requestAdminQuizCreate, requestAdminQuizInfo, requestClear } from './requestBoilerPlates';

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

      const quizInfo = requestAdminQuizInfo(user.token + 'invalid', quiz.quizId);
      expect(quizInfo.body).toStrictEqual(error);
      expect(quizInfo.statusCode).toStrictEqual(401);
    });
    test('Invalid quizId', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizInfo = requestAdminQuizInfo(user.token, quiz.quizId + 1);
      expect(quizInfo.body).toStrictEqual(error);
      expect(quizInfo.statusCode).toStrictEqual(403);
    });
    test('Quiz not owned by user', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('darrius@gmail.com', 'Password1', 'Darrius', 'Lam').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const quizInfo = requestAdminQuizInfo(user2.token, quiz.quizId);
      expect(quizInfo.body).toStrictEqual(error);
      expect(quizInfo.statusCode).toStrictEqual(403);
    });
  });
  describe('Passing Tests', () => {
    test('Successful call', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'quiz', 'description').body;
      const quizInfo = requestAdminQuizInfo(user.token, quiz.quizId);

      expect(quizInfo.body).toStrictEqual({
        quizId: quiz.quizId,
        name: 'quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description',
        numQuestions: 0,
        questions: [],
        duration: 0
      });
      expect(quizInfo.statusCode).toStrictEqual(200);
    });
  });
});
