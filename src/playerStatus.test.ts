import {
  v2requestAdminQuizCreate, requestAdminAuthRegister,
  requestClear, requestAdminSessionStart, requestPlayerJoin,
  requestPlayerStatus, v2requestAdminQuestionCreate,
  // adminQuizGetSessionStatus
} from './requestBoilerPlates';

const error = { error: expect.any(String) };
const autoStartNum = 10;
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
      answer: 'Queen Elizabeth',
      correct: false
    }
  ]
};

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('playerStatus', () => {
  describe('Error Tests', () => {
    test('PlayerId does not exist', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      const playerStatus = requestPlayerStatus(player.playerId + 1);
      expect(playerStatus.body).toEqual(error);
      expect(playerStatus.statusCode).toEqual(400);
    });
  });
  describe('Success cases', () => {
    test('Successfully getting the info of a player', () => {
      const user = requestAdminAuthRegister('victor@gmail.com', 'Password123', 'Victor', 'Lim').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const session = requestAdminSessionStart(user.token, quiz.quizId, autoStartNum).body;
      const player = requestPlayerJoin(session.sessionId, 'Victor').body;
      const playerStatus = requestPlayerStatus(player.playerId);
      expect(playerStatus.body).toStrictEqual(
        {
          state: 'LOBBY',
          numQuestions: 1,
          atQuestion: 0
        }
      );
      expect(playerStatus.statusCode).toEqual(200);
    });
  });
});
