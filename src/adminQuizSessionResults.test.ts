import {
  requestPlayerAnswerSubmit, requestClear, requestAdminAuthRegister, v2requestAdminQuizCreate,
  v2requestAdminQuestionCreate, v2requestAdminQuizInfo, requestPlayerJoin,
  requestAdminSessionStart, requestAdminUpdateSession, requestQuizSessionFinalResults
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('AnswerSubmit', () => {
  describe('Error Tests', () => {
    test('Invalid sessionId', () => {
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
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_FINAL_RESULTS');

      const answerResult = requestQuizSessionFinalResults(user.token, quiz.quizId, session.sessionId + 1);
      expect(answerResult.body).toEqual(error);
      expect(answerResult.statusCode).toStrictEqual(400);
    });
    test('Invalid quizId', () => {
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
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_FINAL_RESULTS');

      const answerResult = requestQuizSessionFinalResults(user.token, quiz.quizId + 1, session.sessionId);
      expect(answerResult.body).toEqual(error);
      expect(answerResult.statusCode).toStrictEqual(403);
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
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);

      const answerResult = requestQuizSessionFinalResults(user.token, quiz.quizId, session.sessionId);
      expect(answerResult.body).toEqual(error);
      expect(answerResult.statusCode).toStrictEqual(400);
    });
    test('Invalid token', () => {
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
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_FINAL_RESULTS');

      const answerResult = requestQuizSessionFinalResults('Invalid Token', quiz.quizId, session.sessionId);
      expect(answerResult.body).toEqual(error);
      expect(answerResult.statusCode).toStrictEqual(401);
    });
    test('Valid token provided but not owner of quiz', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user1 = requestAdminAuthRegister('matthewvucic5@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
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
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');
      requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_FINAL_RESULTS');

      const answerResult = requestQuizSessionFinalResults(user1.token, quiz.quizId, session.sessionId);
      expect(answerResult.body).toEqual(error);
      expect(answerResult.statusCode).toStrictEqual(403);
    });
  });

  describe('Passing Tests', () => {
    test('1 correct answer, multiple player', () => {
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
      const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;

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
      const answerId = quizInfo.questions[0].answers[0].answerId;
      const incorrectAnswerId = quizInfo.questions[0].answers[1].answerId;
      const answerId2 = quizInfo.questions[1].answers[0].answerId;
      const incorrectAnswerId2 = quizInfo.questions[1].answers[1].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      const player2 = requestPlayerJoin(session.sessionId, 'Rob').body;
      const player3 = requestPlayerJoin(session.sessionId, 'Isaac').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');

      const answerSubmit = requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      expect(answerSubmit.body).toStrictEqual({});
      const answerSubmit2 = requestPlayerAnswerSubmit([incorrectAnswerId], player2.playerId, 1);
      expect(answerSubmit2.body).toStrictEqual({});
      const answerSubmit3 = requestPlayerAnswerSubmit([answerId], player3.playerId, 1);
      expect(answerSubmit3.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'NEXT_QUESTION');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'SKIP_COUNTDOWN');

      const answer2Submit = requestPlayerAnswerSubmit([answerId2], player.playerId, 2);
      expect(answer2Submit.body).toStrictEqual({});
      const answer2Submit2 = requestPlayerAnswerSubmit([incorrectAnswerId2], player2.playerId, 2);
      expect(answer2Submit2.body).toStrictEqual({});
      const answer2Submit3 = requestPlayerAnswerSubmit([answerId2], player3.playerId, 2);
      expect(answer2Submit3.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_ANSWER');
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, 'GO_TO_FINAL_RESULTS');
      const answerResult = requestQuizSessionFinalResults(user.token, quiz.quizId, session.sessionId).body;

      expect(answerResult.finalResults).toStrictEqual({
        usersRankedByScore: [
          {
            name: 'John',
            score: 10
          },
          {
            name: 'Isaac',
            score: 5
          },
          {
            name: 'Rob',
            score: 0
          }
        ],
        questionResults: [
          {
            questionId: question.questionId,
            playersCorrectList: [
              'John', 'Isaac'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 67
          },
          {
            questionId: question2.questionId,
            playersCorrectList: [
              'John', 'Isaac'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 67
          },
        ]
      });
    });
  });
});
