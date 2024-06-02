import {
  requestPlayerAnswerSubmit, requestClear, requestAdminAuthRegister, v2requestAdminQuizCreate,
  v2requestAdminQuestionCreate, v2requestAdminQuizInfo, requestPlayerJoin, requestAdminSessionStart,
  requestPlayerAnswerResult, requestAdminUpdateSession,
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

enum Actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('AnswerResult', () => {
  describe('Error Tests', () => {
    test('Invalid playerId', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId).body;
      const answerId = quizInfo.questions[0].answers[0].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      const answerResult = requestPlayerAnswerResult(player.playerId + 1, 1);

      expect(answerResult.body).toStrictEqual(error);
      expect(answerResult.statusCode).toStrictEqual(400);
    });
    test('Invalid question position', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId).body;
      const answerId = quizInfo.questions[0].answers[0].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      const answerResult = requestPlayerAnswerResult(player.playerId, 2);

      expect(answerResult.body).toStrictEqual(error);
      expect(answerResult.statusCode).toStrictEqual(400);
    });
    test('invalid session state', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId).body;
      const answerId = quizInfo.questions[0].answers[0].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      const answerResult = requestPlayerAnswerResult(player.playerId, 1);

      expect(answerResult.body).toStrictEqual(error);
      expect(answerResult.statusCode).toStrictEqual(400);
    });
    test('not up to question', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      const questionBody2 = {
        question: 'Who is the queen of England',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'elizabeth',
            correct: true
          },
          {
            answer: 'charles',
            correct: false
          }
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody2);
      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId).body;
      const answerId = quizInfo.questions[0].answers[0].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      const answerResult = requestPlayerAnswerResult(player.playerId, 2);

      expect(answerResult.body).toStrictEqual(error);
      expect(answerResult.statusCode).toStrictEqual(400);
    });
  });

  describe('Passing Tests', () => {
    test('success', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);

      const questionBody2 = {
        question: 'Who is the queen of England',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'elizabeth',
            correct: true
          },
          {
            answer: 'charles',
            correct: false
          }
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      const question2 = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody2).body;

      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId).body;
      const answerId1 = quizInfo.questions[1].answers[0].answerId;
      const answerId2 = quizInfo.questions[1].answers[1].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      const player2 = requestPlayerJoin(session.sessionId, 'Jason').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);

      requestPlayerAnswerSubmit([answerId1], player.playerId, 2);
      requestPlayerAnswerSubmit([answerId2], player2.playerId, 2);

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);

      const answerResult = requestPlayerAnswerResult(player.playerId, 2).body;

      expect(answerResult).toStrictEqual(
        {
          questionId: question2.questionId,
          playersCorrectList: [
            'John'
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 50
        }
      );
    });

    test('success', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody);

      const questionBody2 = {
        question: 'Who is the queen of England',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'elizabeth',
            correct: true
          },
          {
            answer: 'charles',
            correct: false
          }
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      const question2 = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody2).body;

      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId).body;
      const answerId1 = quizInfo.questions[1].answers[0].answerId;
      const answerId2 = quizInfo.questions[1].answers[1].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      const player2 = requestPlayerJoin(session.sessionId, 'Jason').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);

      requestPlayerAnswerSubmit([answerId1], player.playerId, 2);
      requestPlayerAnswerSubmit([answerId2], player2.playerId, 2);

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);

      const answerResult = requestPlayerAnswerResult(player.playerId, 2).body;

      expect(answerResult).toStrictEqual(
        {
          questionId: question2.questionId,
          playersCorrectList: [
            'John'
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 50
        }
      );
    });
  });
});
