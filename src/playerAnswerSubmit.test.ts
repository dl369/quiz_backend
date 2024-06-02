import {
  requestPlayerAnswerSubmit, requestClear, requestAdminAuthRegister, v2requestAdminQuizCreate,
  v2requestAdminQuestionCreate, v2requestAdminQuizInfo, requestPlayerJoin, requestPlayerFinalResult,
  requestAdminSessionStart, requestAdminUpdateSession,
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

describe('AnswerSubmit', () => {
  describe('Error Tests', () => {
    test('Invalid playerId', async () => {
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
      const answerSubmit = requestPlayerAnswerSubmit([answerId], player.playerId + 1, 1);

      expect(answerSubmit.body).toStrictEqual(error);
      expect(answerSubmit.statusCode).toStrictEqual(400);
    });
    test('Invalid question position', async () => {
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
      const answerSubmit = requestPlayerAnswerSubmit([answerId], player.playerId, 2);

      expect(answerSubmit.body).toStrictEqual(error);
      expect(answerSubmit.statusCode).toStrictEqual(400);
    });
    test('invalid session state', async () => {
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
      const answerSubmit = requestPlayerAnswerSubmit([answerId], player.playerId, 1);

      expect(answerSubmit.body).toStrictEqual(error);
      expect(answerSubmit.statusCode).toStrictEqual(400);
    });
    test('not up to question', async () => {
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
      const answerSubmit = requestPlayerAnswerSubmit([answerId], player.playerId, 2);

      expect(answerSubmit.body).toStrictEqual(error);
      expect(answerSubmit.statusCode).toStrictEqual(400);
    });
    test('invlaid answerId', async () => {
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
      const answerSubmit = requestPlayerAnswerSubmit([answerId + 1], player.playerId, 1);

      expect(answerSubmit.body).toStrictEqual(error);
      expect(answerSubmit.statusCode).toStrictEqual(400);
    });
    test('dupe answerid', async () => {
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
      const answerSubmit = requestPlayerAnswerSubmit([answerId, answerId], player.playerId, 1);

      expect(answerSubmit.body).toStrictEqual(error);
      expect(answerSubmit.statusCode).toStrictEqual(400);
    });
    test('0 answers', async () => {
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

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      const answerSubmit = requestPlayerAnswerSubmit([], player.playerId, 1);

      expect(answerSubmit.body).toStrictEqual(error);
      expect(answerSubmit.statusCode).toStrictEqual(400);
    });
  });

  describe('Passing Tests', () => {
    test('1 correct answer, 1 player', async () => {
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
      const answerId2 = quizInfo.questions[1].answers[0].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      const answerSubmit = requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      expect(answerSubmit.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      const answerSubmit2 = requestPlayerAnswerSubmit([answerId2], player.playerId, 2);
      expect(answerSubmit2.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_FINAL_RESULTS);
      const answerResult = requestPlayerFinalResult(player.playerId).body;

      expect(answerResult).toStrictEqual({
        usersRankedByScore: [
          {
            name: 'John',
            score: 10
          }
        ],
        questionResults: [
          {
            questionId: question.questionId,
            playersCorrectList: [
              'John'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100
          },
          {
            questionId: question2.questionId,
            playersCorrectList: [
              'John'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100
          }
        ]
      });
    });
    test('1 correct answer, multiple player', async () => {
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
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);

      const answerSubmit = requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      expect(answerSubmit.body).toStrictEqual({});
      const answerSubmit2 = requestPlayerAnswerSubmit([incorrectAnswerId], player2.playerId, 1);
      expect(answerSubmit2.body).toStrictEqual({});
      const answerSubmit3 = requestPlayerAnswerSubmit([answerId], player3.playerId, 1);
      expect(answerSubmit3.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);

      const answer2Submit = requestPlayerAnswerSubmit([answerId2], player.playerId, 2);
      expect(answer2Submit.body).toStrictEqual({});
      const answer2Submit2 = requestPlayerAnswerSubmit([incorrectAnswerId2], player2.playerId, 2);
      expect(answer2Submit2.body).toStrictEqual({});
      const answer2Submit3 = requestPlayerAnswerSubmit([answerId2], player3.playerId, 2);
      expect(answer2Submit3.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_FINAL_RESULTS);
      const answerResult = requestPlayerFinalResult(player.playerId).body;

      expect(answerResult).toStrictEqual({
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
    test('multiple correct answer, 1 player', async () => {
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
          },
          {
            answer: 'Charles II',
            correct: true
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
          },
          {
            answer: 'elizabeth II',
            correct: true
          },
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      const question2 = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody2).body;

      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId).body;
      const answerIds = [quizInfo.questions[0].answers[0].answerId, quizInfo.questions[0].answers[2].answerId];
      const answerIds2 = [quizInfo.questions[1].answers[0].answerId]; // only 1 correct

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      const answerSubmit = requestPlayerAnswerSubmit(answerIds, player.playerId, 1);
      expect(answerSubmit.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      const answerSubmit2 = requestPlayerAnswerSubmit(answerIds2, player.playerId, 2);
      expect(answerSubmit2.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_FINAL_RESULTS);
      const answerResult = requestPlayerFinalResult(player.playerId).body;

      expect(answerResult).toStrictEqual({
        usersRankedByScore: [
          {
            name: 'John',
            score: 5
          }
        ],
        questionResults: [
          {
            questionId: question.questionId,
            playersCorrectList: [
              'John'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100
          },
          {
            questionId: question2.questionId,
            playersCorrectList: [

            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 0
          }
        ]
      });
    });
    test('1 correct answer, 1 player', async () => {
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
      const answerId2 = quizInfo.questions[1].answers[0].answerId;

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      const answerSubmit = requestPlayerAnswerSubmit([answerId], player.playerId, 1);
      expect(answerSubmit.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);

      await new Promise(resolve => setTimeout(resolve, 4000));

      const answerSubmit2 = requestPlayerAnswerSubmit([answerId2], player.playerId, 2);
      expect(answerSubmit2.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_FINAL_RESULTS);
      const answerResult = requestPlayerFinalResult(player.playerId).body;

      expect(answerResult).toStrictEqual({
        usersRankedByScore: [
          {
            name: 'John',
            score: 10
          }
        ],
        questionResults: [
          {
            questionId: question.questionId,
            playersCorrectList: [
              'John'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100
          },
          {
            questionId: question2.questionId,
            playersCorrectList: [
              'John'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100
          }
        ]
      });
    });
    test('RESUBMISSION', async () => {
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
          },
          {
            answer: 'Charles II',
            correct: true
          }
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;

      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId).body;
      const answerIds = [quizInfo.questions[0].answers[0].answerId, quizInfo.questions[0].answers[2].answerId];
      const answerIds2 = [quizInfo.questions[0].answers[0].answerId]; // only 1 correct

      const session = requestAdminSessionStart(user.token, quiz.quizId, 10).body;
      const player = requestPlayerJoin(session.sessionId, 'John').body;
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.NEXT_QUESTION);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.SKIP_COUNTDOWN);
      const answerSubmit = requestPlayerAnswerSubmit(answerIds, player.playerId, 1);
      expect(answerSubmit.body).toStrictEqual({});

      const answerSubmit2 = requestPlayerAnswerSubmit(answerIds2, player.playerId, 1);
      expect(answerSubmit2.body).toStrictEqual({});

      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_ANSWER);
      requestAdminUpdateSession(quiz.quizId, session.sessionId, user.token, Actions.GO_TO_FINAL_RESULTS);
      const answerResult = requestPlayerFinalResult(player.playerId).body;

      expect(answerResult).toStrictEqual({
        usersRankedByScore: [
          {
            name: 'John',
            score: 0
          }
        ],
        questionResults: [
          {
            questionId: question.questionId,
            playersCorrectList: [
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 0
          },
        ]
      });
    });
  });
});
