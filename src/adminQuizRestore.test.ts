import {
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestAdminQuizRemove,
  requestAdminQuizList,
  requestAdminQuizTrash,
  requestAdminQuizRestore,
  requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Testing adminQuizRestore', () => {
  describe('Error Tests', () => {
    test('Quiz name has already been restored', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      requestAdminQuizRestore(quizId.quizId, user.token);
      // Attempt to restore the quiz again
      const removeAgain = requestAdminQuizRestore(quizId.quizId, user.token);
      expect(removeAgain.body).toEqual(error);
      expect(removeAgain.statusCode).toEqual(400);
    });
    test('Quiz is not in the trash', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quiz2Id = requestAdminQuizCreate(user.token, 'Space', 'Quiz about Space').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Attempt to restore a quiz that is not in the trash
      const quizRestore = requestAdminQuizRestore(quiz2Id.quizId, user.token);
      expect(quizRestore.body).toEqual(error);
      expect(quizRestore.statusCode).toEqual(400);
    });
    test('Token is invalid', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Attempt to restore a quiz with an invalid userId
      const quizRestore = requestAdminQuizRestore(quizId.quizId, (user.token + 'invalid'));
      expect(quizRestore.body).toEqual(error);
      expect(quizRestore.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Attempt to restore a quiz with an empty userId
      const quizRestore = requestAdminQuizRestore(quizId.quizId, '');
      expect(quizRestore.body).toEqual(error);
      expect(quizRestore.statusCode).toEqual(401);
    });
    test('QuizId is invalid', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Attempt to restore a invalid quizid
      const quizRestore = requestAdminQuizRestore((quizId.quizId + 1), user.token);
      expect(quizRestore.body).toEqual(error);
      expect(quizRestore.statusCode).toEqual(403);
    });
    test('User does not own this quiz', () => {
      const user1 = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const user2 = requestAdminAuthRegister('Jerry@gmail.com', 'Password12345', 'Jerry', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user1.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user1.token, quizId.quizId);
      // User2 attempts to restore a quiz belonging to user1
      const quizRestore = requestAdminQuizRestore(quizId.quizId, user2.token);
      expect(quizRestore.body).toEqual(error);
      expect(quizRestore.statusCode).toEqual(403);
    });
  });
  describe('Passing Tests', () => {
    test('Quiz successfullly restored', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      const quizRestore = requestAdminQuizRestore(quizId.quizId, user.token);
      expect(quizRestore.body).toEqual({});
      expect(quizRestore.statusCode).toEqual(200);
      expect(requestAdminQuizList(user.token).body).toEqual({
        quizzes: [
          {
            quizId: quizId.quizId,
            name: 'Aero'
          }
        ]
      });
      expect(requestAdminQuizTrash(user.token).body).toEqual({
        quizzes: [
        ]
      });
    });
  });
});
