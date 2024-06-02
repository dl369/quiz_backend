import {
  requestAdminAuthRegister, requestAdminQuizGetSessionStatus, requestAdminQuestionCreate,
  requestClear, requestAdminSessionStart, v2requestAdminQuizCreate
} from './requestBoilerPlates';

const error = { error: expect.any(String) };
const autoStartNum = 10;

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizGetSessionStatus HTTP Tests', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;

  describe('Success Case', () => {
    test('Session status retrieved successfully', () => {
      const user = requestAdminAuthRegister('Stephen@example.com', 'Password123', 'Valid', 'User').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Test Quiz', 'Description of the test quiz').body;
      const quizId = quiz.quizId;
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'Prince Harry',
            correct: false
          },
        ]
      };
      requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const sessionId = session.sessionId;
      const response = requestAdminQuizGetSessionStatus(user.token, quiz.quizId, sessionId);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        state: 'LOBBY',
        atQuestion: expect.any(Number),
        players: [],
        metadata: {
          quizId: quizId,
          authUserId: expect.any(Number),
          name: 'Test Quiz',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          token: user.token,
          description: 'Description of the test quiz',
          numQuestions: 1,
          questions: [
            {
              questionId: expect.any(Number),
              question: 'Who is the Monarch of England?',
              duration: 4,
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Prince Charles',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Prince Harry',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 4,
          thumbnailUrl: expect.any(String),
        }
      });
    });
  });

  describe('Error message appropriately returned', () => {
    test('Session Id does not refer to a valid session within the quiz', () => {
      const user = requestAdminAuthRegister('validuser@example.com', 'Password123', 'Valid', 'User').body;
      token = user.token;
      const quiz = v2requestAdminQuizCreate(user.token, 'Test Quiz', 'Description of the test quiz').body;
      quizId = quiz.quizId;
      const invalidSessionId = 9999999; // An assumed invalid session ID
      const response = requestAdminQuizGetSessionStatus(token, quizId, invalidSessionId);
      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual(error);
    });
    test('Token empty', () => {
      const emptyToken = '';
      const response = requestAdminQuizGetSessionStatus(emptyToken, sessionId, quizId);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual(error);
    });
    test('Token invalid', () => {
      const invalidToken = 'invalidToken123';
      const response = requestAdminQuizGetSessionStatus(invalidToken, quizId, sessionId);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual(error);
    });
    test('Valid Token Provided, but user is not owner of quiz', () => {
      const user = requestAdminAuthRegister('Stephen@example.com', 'Password123', 'Valid', 'User').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Test Quiz', 'Description of the test quiz').body;
      const quizId = quiz.quizId;
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'Prince Harry',
            correct: false
          },
        ]
      };
      requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const anotherUser = requestAdminAuthRegister('other@example.com', 'Password2', 'Other', 'User').body;
      const otherToken = anotherUser.token;
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const sessionId = session.sessionId;
      const response = requestAdminQuizGetSessionStatus(otherToken, quizId, sessionId);
      expect(response.statusCode).toEqual(403);
      expect(response.body).toEqual(error);
    });
  });
});
