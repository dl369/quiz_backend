import {
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestAdminQuizRemove,
  requestAdminQuizList,
  requestAdminQuizTrash,
  requestAdminQuizTrashEmpty,
  requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Testing adminQuizTrashEmpty', () => {
  describe('Error Tests', () => {
    test('Trash is already empty', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      // Attempt to empty trash that has nothing in it
      const emptyTrash = requestAdminQuizTrashEmpty(user.token, [quizId.quizId]);
      expect(emptyTrash.body).toEqual(error);
      expect(emptyTrash.statusCode).toEqual(400);
    });
    test('Quiz is not in the trash', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quiz2Id = requestAdminQuizCreate(user.token, 'Space', 'Quiz about Space').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Attempt to empty a quiz that is not in the trash
      const emptyTrash = requestAdminQuizTrashEmpty(user.token, [quiz2Id.quizId]);
      expect(emptyTrash.body).toEqual(error);
      expect(emptyTrash.statusCode).toEqual(400);
    });
    test('QuizId is invalid', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Attempt to restore a invalid quizid
      const emptyTrash = requestAdminQuizTrashEmpty(user.token, [quizId.quizId + 1]);
      expect(emptyTrash.body).toEqual(error);
      expect(emptyTrash.statusCode).toEqual(403);
    });
    test('Token is invalid', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Attempt to restore a quiz with an invalid userId
      const emptyTrash = requestAdminQuizTrashEmpty((user.token + 'invalid'), [quizId.quizId]);
      expect(emptyTrash.body).toEqual(error);
      expect(emptyTrash.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Attempt to restore a quiz with an empty userId
      const emptyTrash = requestAdminQuizTrashEmpty('', [quizId.quizId]);
      expect(emptyTrash.body).toEqual(error);
      expect(emptyTrash.statusCode).toEqual(401);
    });
    test('User does not own this quiz', () => {
      const user1 = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const user2 = requestAdminAuthRegister('Jerry@gmail.com', 'Password12345', 'Jerry', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user1.token, 'Aero', 'Quiz about Aeroplanes').body;
      requestAdminQuizRemove(user1.token, quizId.quizId);
      // User2 attempts to restore a quiz belonging to user1
      const emptyTrash = requestAdminQuizTrashEmpty(user2.token, [quizId.quizId]);
      expect(emptyTrash.body).toEqual(error);
      expect(emptyTrash.statusCode).toEqual(403);
    });
  });
  describe('Passing Tests', () => {
    test('1 quiz successfullly emptied from the trash', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      // Remove 1 quiz
      requestAdminQuizRemove(user.token, quizId.quizId);
      // Empty it from trash
      const emptyTrash = requestAdminQuizTrashEmpty(user.token, [quizId.quizId]);
      expect(emptyTrash.body).toEqual({});
      expect(emptyTrash.statusCode).toEqual(200);
      expect(requestAdminQuizList(user.token).body).toEqual({
        quizzes: [
        ]
      });
      expect(requestAdminQuizTrash(user.token).body).toEqual({
        quizzes: [
        ]
      });
    });
    test('2 quizes successfullly emptied from the trash', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password1234', 'Bob', 'Johnson').body;
      const quizId = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const quiz2Id = requestAdminQuizCreate(user.token, 'Space', 'Quiz about Space').body;
      const quiz3Id = requestAdminQuizCreate(user.token, 'Dino', 'Quiz about Dinos').body;
      // Remove 2 quizzes
      requestAdminQuizRemove(user.token, quizId.quizId);
      requestAdminQuizRemove(user.token, quiz2Id.quizId);
      // Empty both quizzes from trash
      const emptyTrash = requestAdminQuizTrashEmpty(user.token, [quizId.quizId, quiz2Id.quizId]);
      expect(emptyTrash.body).toEqual({});
      expect(emptyTrash.statusCode).toEqual(200);
      expect(requestAdminQuizList(user.token).body).toEqual({
        quizzes: [{
          quizId: quiz3Id.quizId,
          name: 'Dino'
        }]
      });
      expect(requestAdminQuizTrash(user.token).body).toEqual({
        quizzes: [
        ]
      });
    });
  });
});
