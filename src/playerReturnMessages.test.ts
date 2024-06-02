import {
  requestAdminAuthRegister, requestAdminQuestionCreate, requestClear, requestPlayerReturnMessages,
  requestAdminSessionStart, v2requestAdminQuizCreate, requestPlayerJoin, requestPlayerSendChatMessage
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('playerReturnMessages HTTP Tests', () => {
  describe('Success Case', () => {
    test('Chat message is returned successfully', () => {
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

      const message1 = { messageBody: 'Hello everyone! Nice to chat.' };
      const message2 = { messageBody: 'Hello everyone! Welcome to the Quiz.' };
      requestPlayerSendChatMessage(player.playerId, message1);
      requestPlayerSendChatMessage(player.playerId, message2);

      const response = requestPlayerReturnMessages(player.playerId);

      const expectedMessages = {
        messages: [
          {
            messageBody: 'Hello everyone! Nice to chat.',
            playerId: player.playerId,
            playerName: 'JohnDoe',
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'Hello everyone! Welcome to the Quiz.',
            playerId: player.playerId,
            playerName: 'JohnDoe',
            timeSent: expect.any(Number)
          }
        ]
      };

      expect(response.body).toStrictEqual(expectedMessages);
      expect(response.statusCode).toStrictEqual(200);
    });
  });

  describe('Error message appropriately returned', () => {
    test('Player ID does not exist', () => {
      const nonExistentPlayerId = 9999;
      const response = requestPlayerReturnMessages(nonExistentPlayerId);
      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual(error);
    });
  });
});
