import {
  requestAdminAuthRegister, requestAdminQuestionCreate, requestClear, requestPlayerSendChatMessage,
  v2requestAdminQuizCreate, requestAdminSessionStart, requestPlayerJoin,

} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('ChatMessage', () => {
  describe('Functionality Tests', () => {
    test('Send Valid Chat Message', () => {
      const user = requestAdminAuthRegister('example@gmail.com', 'Password123', 'John', 'Doe').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'JohnDoe').body;

      const message = { messageBody: 'Hello everyone! Nice to chat.' };
      const response = requestPlayerSendChatMessage(player.playerId, message);

      expect(response.body).toStrictEqual({});
      expect(response.statusCode).toStrictEqual(200);
    });
  });

  describe('Error Cases', () => {
    test('Message Body Too Short', () => {
      const user = requestAdminAuthRegister('example@gmail.com', 'Password123', 'John', 'Doe').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'JohnDoe').body;
      const message = { messageBody: '' };
      const response = requestPlayerSendChatMessage(player.playerId, message);
      expect(response.body).toStrictEqual(error);
      expect(response.statusCode).toStrictEqual(400);
    });

    test('Message Body Too Long', () => {
      const user = requestAdminAuthRegister('example@gmail.com', 'Password123', 'John', 'Doe').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'JohnDoe').body;
      const message = { messageBody: 'a'.repeat(101) }; // 101 characters long
      const response = requestPlayerSendChatMessage(player.playerId, message);
      expect(response.body).toStrictEqual(error);
      expect(response.statusCode).toStrictEqual(400);
    });

    test('Invalid Player ID', () => {
      const invalidPlayerId = 999999; // Assuming 999999 is not a valid player ID
      const message = { messageBody: 'This should fail due to invalid player ID.' };
      const response = requestPlayerSendChatMessage(invalidPlayerId, message);
      expect(response.body).toStrictEqual(error);
      expect(response.statusCode).toStrictEqual(400);
    });
  });
});
