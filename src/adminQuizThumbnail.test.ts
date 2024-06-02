import {
  v2requestAdminQuizCreate, requestAdminAuthRegister,
  requestClear, v2requestAdminQuizInfo, requestAdminQuizThumbnailUpdate
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuiztThumbnailUpdate', () => {
  describe('Error Tests', () => {
    test('Token is invalid', () => {
      const token = requestAdminAuthRegister('matthewvucic5@gmail.com', 'Password123', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(token.token, 'Aero', 'Quiz about Aeroplanes').body;
      const thumbnailUpdate = requestAdminQuizThumbnailUpdate('Invalid Token', quizId.quizId, 'http://google.com/some/image2/path.jpg');
      expect(thumbnailUpdate.body).toEqual(error);
      expect(thumbnailUpdate.statusCode).toEqual(401);
    });
    test('Valid Token provided but not owner of quiz', () => {
      const token = requestAdminAuthRegister('matthewvucic5@gmail.com', 'Password123', 'Matthew', 'Vucic').body;
      const token2 = requestAdminAuthRegister('matthewvucic6@gmail.com', 'Password123', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(token.token, 'Aero', 'Quiz about Aeroplanes').body;
      const thumbnailUpdate = requestAdminQuizThumbnailUpdate(token2.token, quizId.quizId, 'http://google.com/some/image2/path.jpg');
      expect(thumbnailUpdate.body).toEqual(error);
      expect(thumbnailUpdate.statusCode).toEqual(403);
    });
    test('Incorrect URL ending', () => {
      const token = requestAdminAuthRegister('matthewvucic5@gmail.com', 'Password123', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(token.token, 'Aero', 'Quiz about Aeroplanes').body;
      const thumbnailUpdate = requestAdminQuizThumbnailUpdate(token.token, quizId.quizId, 'http://google.com/some/image2/path');
      expect(thumbnailUpdate.body).toEqual(error);
      expect(thumbnailUpdate.statusCode).toEqual(400);
    });
    test('Incorrect URL begining', () => {
      const token = requestAdminAuthRegister('matthewvucic5@gmail.com', 'Password123', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(token.token, 'Aero', 'Quiz about Aeroplanes').body;
      const thumbnailUpdate = requestAdminQuizThumbnailUpdate(token.token, quizId.quizId, 'google.com/some/image2/path.jpg');
      expect(thumbnailUpdate.body).toEqual(error);
      expect(thumbnailUpdate.statusCode).toEqual(400);
    });
    test('invalid quiz', () => {
      const token = requestAdminAuthRegister('matthewvucic5@gmail.com', 'Password123', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(token.token, 'Aero', 'Quiz about Aeroplanes').body;
      const thumbnailUpdate = requestAdminQuizThumbnailUpdate(token.token, quizId.quizId + 1, 'http://google.com/some/image2/path.jpg');
      expect(thumbnailUpdate.body).toEqual(error);
      expect(thumbnailUpdate.statusCode).toEqual(403);
    });
    test('empty url', () => {
      const token = requestAdminAuthRegister('matthewvucic5@gmail.com', 'Password123', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(token.token, 'Aero', 'Quiz about Aeroplanes').body;
      const thumbnailUpdate = requestAdminQuizThumbnailUpdate(token.token, quizId.quizId, '');
      expect(thumbnailUpdate.body).toEqual(error);
      expect(thumbnailUpdate.statusCode).toEqual(400);
    });
  });
  describe('Passing Tests', () => {
    test('Correct inputs', () => {
      const token = requestAdminAuthRegister('matthewvucic5@gmail.com', 'Password123', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(token.token, 'Aero', 'Quiz about Aeroplanes').body;
      const thumbnailUpdate = requestAdminQuizThumbnailUpdate(token.token, quizId.quizId, 'http://google.com/some/image2/path.jpg');
      expect(thumbnailUpdate.body).toEqual({});
      expect(thumbnailUpdate.statusCode).toEqual(200);

      const quizInfo = v2requestAdminQuizInfo(token.token, quizId.quizId);

      expect(quizInfo.body).toStrictEqual({
        quizId: quizId.quizId,
        name: 'Aero',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz about Aeroplanes',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      });
    });
  });
});
