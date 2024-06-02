import {
  v2requestAdminQuizCreate, requestAdminAuthRegister, v2requestAdminQuestionCreate,
  requestClear, requestAdminSessionStart, requestAdminUpdateSession,
} from './requestBoilerPlates';

const error = { error: expect.any(String) };
const autoStartNum = 10;
const questionBody = {
  question: 'Who is the Monarch of England',
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

describe('adminUpdateSession', () => {
  describe('Error Tests', () => {
    test('Token is invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, 'invalidToken', 'END');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, '', 'END');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(401);
    });
    test('quizId is invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId + 1, sessionId.sessionId, user.token, 'END');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(403);
    });
    test('quiz belongs to another user', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user2.token, 'END');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(403);
    });
    test('sessionId is invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const update = requestAdminUpdateSession(quizId.quizId, 10, user.token, 'END');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(400);
    });
    test('action is invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'INVALID');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(400);
    });
  });
  describe('Action errors for LOBBY state', () => {
    test('SKIP_COUNTDOWN in LOBBY', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(400);
    });
    test('GO_TO_ANSWER in LOBBY', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(400);
    });
    test('GO_TO_FINAL_RESULTS in LOBBY', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
      expect(update.body).toEqual(error);
      expect(update.statusCode).toEqual(400);
    });
  });
  describe('Action errors for QUESTION_COUNTDOWN state', () => {
    test('NEXT_QUESTION in QUESTION_COUNTDOWN', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      // session in lobby
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      // question countdown
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      // question
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      expect(update2.body).toEqual(error);
      expect(update2.statusCode).toEqual(400);
    });
    test('GO_TO_ANSWER in QUESTION_COUNTDOWN', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      expect(update2.body).toEqual(error);
      expect(update2.statusCode).toEqual(400);
    });
    test('GO_TO_FINAL_RESULTS in QUESTION_COUNTDOWN', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
      expect(update2.body).toEqual(error);
      expect(update2.statusCode).toEqual(400);
    });
  });
  describe('Action errors for QUESTION_OPEN state', () => {
    test('NEXT_QUESTION in QUESTION_OPEN', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      expect(update3.body).toEqual(error);
      expect(update3.statusCode).toEqual(400);
    });
    test('SKIP_COUNTDOWN in QUESTION_OPEN', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      expect(update3.body).toEqual(error);
      expect(update3.statusCode).toEqual(400);
    });
    test('GO_TO_FINAL_RESULTS in QUESTION_OPEN', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
      expect(update3.body).toEqual(error);
      expect(update3.statusCode).toEqual(400);
    });
  });
  describe('Action errors for QUESTION_CLOSE state', () => {
    test('SKIP_COUNTDOWN in QUESTION_CLOSE', async () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      await new Promise(resolve => setTimeout(resolve, 4001));
      const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      expect(update3.body).toEqual(error);
      expect(update3.statusCode).toEqual(400);
    });
    test('not enough questions', async () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      await new Promise(resolve => setTimeout(resolve, 4000));
      const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      expect(update3.body).toEqual(error);
      expect(update3.statusCode).toEqual(400);
    });
  });
  describe('Action errors for ANSWER_SHOW state', () => {
    test('SKIP_COUNTDOWN in ANSWER_SHOW', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      const update4 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      expect(update4.body).toEqual(error);
      expect(update4.statusCode).toEqual(400);
    });
    test('GO_TO_ANSWER in ANSWER_SHOW', async () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      const update4 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      expect(update4.body).toEqual(error);
      expect(update4.statusCode).toEqual(400);
    });
    test('not enough questions', async () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      expect(update3.body).toEqual(error);
      expect(update3.statusCode).toEqual(400);
    });
  });
  describe('Action errors for FINAL_RESULTS state', () => {
    test('SKIP_COUNTDOWN in FINAL_RESULTS', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULT');
      const update5 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      expect(update5.body).toEqual(error);
      expect(update5.statusCode).toEqual(400);
    });
    test('NEXT_QUESTION in FINAL_RESULTS', async () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;

      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');

      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');

      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');

      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');

      const update5 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      expect(update5.body).toEqual(error);
      expect(update5.statusCode).toEqual(400);
    });
    test('GO_TO_ANSWER in FINAL_RESULTS', async () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULT');
      const update5 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      expect(update5.body).toEqual(error);
      expect(update5.statusCode).toEqual(400);
    });
    test('GO_TO_FINAL_RESULTS in FINAL_RESULTS', async () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
      const update5 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
      expect(update5.body).toEqual(error);
      expect(update5.statusCode).toEqual(400);
    });
  });
  describe('Action errors for END state', () => {
    test('NEXT_QUESTION in END', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      expect(update2.body).toEqual(error);
      expect(update2.statusCode).toEqual(400);
    });
    test('SKIP_COUNTDOWN in END', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      expect(update2.body).toEqual(error);
      expect(update2.statusCode).toEqual(400);
    });
    test('GO_TO_ANSWER in END', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      expect(update2.body).toEqual(error);
      expect(update2.statusCode).toEqual(400);
    });
    test('GO_TO_FINAL_RESULTS in END', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
      expect(update2.body).toEqual(error);
      expect(update2.statusCode).toEqual(400);
    });
    test('END in END', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      expect(update2.body).toEqual(error);
      expect(update2.statusCode).toEqual(400);
    });
  });
});
describe('Passing Tests', () => {
  describe('LOBBY Tests', () => {
    test('NEXT_QUESTION', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      expect(update.body).toEqual({});
      expect(update.statusCode).toEqual(200);
    });
    test('END', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      const update = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      expect(update.body).toEqual({});
      expect(update.statusCode).toEqual(200);
    });
  });
  describe('QUESTION_COUNTDOWN Tests', () => {
    test('SKIP_COUNTDOWN', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
      expect(update2.body).toEqual({});
      expect(update2.statusCode).toEqual(200);
    });
    test('END', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
      expect(update2.body).toEqual({});
      expect(update2.statusCode).toEqual(200);
    });
    test('Wait out countdown', async () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
      requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
      await new Promise(resolve => setTimeout(resolve, 3500));
      const update2 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
      expect(update2.body).toEqual({});
      expect(update2.statusCode).toEqual(200);
    });
    describe('QUESTION_OPEN Tests', () => {
      test('GO_TO_ANSWER', () => {
        const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
        const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
        v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
        const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
        requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
        requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
        const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
        expect(update3.body).toEqual({});
        expect(update3.statusCode).toEqual(200);
      });
      test('END', () => {
        const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
        const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
        v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
        const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
        requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
        requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
        const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
        expect(update3.body).toEqual({});
        expect(update3.statusCode).toEqual(200);
      });
      test('Wait out duration', async () => {
        // Register and set up the session
        const user = (await requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic')).body;
        const quizId = (await v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes')).body;
        await v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
        const sessionId = (await requestAdminSessionStart(user.token, quizId.quizId, autoStartNum)).body;

        // Perform state transitions
        await requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
        await requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
        await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate wait

        // Attempt to skip countdown again (assuming the state should not allow this)
        const update3 = await requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');

        // Assert the response
        expect(update3.body).toEqual(error); // Ensure you define what `error` should be before this test
        expect(update3.statusCode).toEqual(400);
      });

      describe('QUESTION_CLOSE Tests', () => {
        jest.setTimeout(10000);
        test('GO_TO_ANSWER', async () => {
          const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
          const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
          await new Promise(resolve => setTimeout(resolve, 4000));
          const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
          expect(update3.body).toEqual({});
          expect(update3.statusCode).toEqual(200);
        });
        test('GO_TO_FINAL_RESULTS', async () => {
          const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
          const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          // question closed
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
          // question open
          await new Promise(resolve => setTimeout(resolve, 4000));
          // should be question closed
          const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
          expect(update3.body).toEqual({});
          expect(update3.statusCode).toEqual(200);
        });
        test('NEXT_QUESTION', async () => {
          const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
          const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
          await new Promise(resolve => setTimeout(resolve, 4000));
          const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          expect(update3.body).toEqual({});
          expect(update3.statusCode).toEqual(200);
          await new Promise(resolve => setTimeout(resolve, 4000));
        });
        test('END', async () => {
          const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
          const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
          await new Promise(resolve => setTimeout(resolve, 4000));
          const update3 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');

          expect(update3.body).toEqual({});
          expect(update3.statusCode).toEqual(200);
        });
      });
      describe('ANSWER_SHOW Tests', () => {
        test('NEXT_QUESTION', () => {
          const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
          const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
          const update4 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          expect(update4.body).toEqual({});
          expect(update4.statusCode).toEqual(200);
        });
        test('GO_TO_FINAL_RESULTS', () => {
          const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
          const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
          const update4 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
          expect(update4.body).toEqual({});
          expect(update4.statusCode).toEqual(200);
        });
        test('END', () => {
          const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
          const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
          const update4 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
          expect(update4.body).toEqual({});
          expect(update4.statusCode).toEqual(200);
        });
      });
      describe('FINAL_RESULTS Tests', () => {
        test('END', () => {
          const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
          const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
          v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
          const sessionId = requestAdminSessionStart(user.token, quizId.quizId, autoStartNum).body;
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'NEXT_QUESTION');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'SKIP_COUNTDOWN');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_ANSWER');
          requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
          const update5 = requestAdminUpdateSession(quizId.quizId, sessionId.sessionId, user.token, 'END');
          expect(update5.body).toEqual({});
          expect(update5.statusCode).toEqual(200);
        });
      });
    });
  });
});
