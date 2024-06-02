import {
  requestAdminAuthRegister, requestAdminQuizCreate, requestAdminQuizInfo,
  requestClear, requestAdminQuestionDuplicate, requestAdminQuestionCreate
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuizInfo', () => {
  describe('Error Tests', () => {
    test('Invalid token', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      const question = requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
      const questionDuplicate = requestAdminQuestionDuplicate(quiz.quizId, question.questionId, user.token + 'invalid');

      expect(questionDuplicate.body).toStrictEqual(error);
      expect(questionDuplicate.statusCode).toStrictEqual(401);
    });
    test('Invalid quizId', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      const question = requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
      const questionDuplicate = requestAdminQuestionDuplicate(quiz.quizId + 1, question.questionId, user.token);

      expect(questionDuplicate.body).toStrictEqual(error);
      expect(questionDuplicate.statusCode).toStrictEqual(403);
    });
    test('Quiz not owned by user', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('darrius@gmail.com', 'Password1', 'Darrius', 'Lam').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      const question = requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
      const questionDuplicate = requestAdminQuestionDuplicate(quiz.quizId, question.questionId, user2.token);

      expect(questionDuplicate.body).toStrictEqual(error);
      expect(questionDuplicate.statusCode).toStrictEqual(403);
    });
    test('Invalid questionId', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionDuplicate = requestAdminQuestionDuplicate(quiz.quizId, 1, user.token);

      expect(questionDuplicate.body).toStrictEqual(error);
      expect(questionDuplicate.statusCode).toStrictEqual(400);
    });
  });
  describe('Passing Tests', () => {
    test('Successful call', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = requestAdminQuizCreate(user.token, 'quiz', 'description').body;
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
      const questionBody2 = {
        question: 'Who was the Queen of England',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: false
          },
          {
            answer: 'Queen Elizabeth',
            correct: true
          }
        ]
      };
      const question = requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
      const question2 = requestAdminQuestionCreate(quiz.quizId, user.token, questionBody2).body;
      const questionDuplicate = requestAdminQuestionDuplicate(quiz.quizId, question.questionId, user.token);
      expect(questionDuplicate.body).toStrictEqual({ newQuestionId: expect.any(Number) });
      expect(questionDuplicate.statusCode).toStrictEqual(200);

      const quizInfo = requestAdminQuizInfo(user.token, quiz.quizId);

      expect(quizInfo.body).toStrictEqual({
        quizId: quiz.quizId,
        name: 'quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description',
        numQuestions: 3,
        questions: [
          {
            questionId: question.questionId,
            question: 'Who is the Monarch of England',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
                answerId: expect.any(Number),
                colour: expect.any(String),
              },
              {
                answer: 'Queen Elizabeth',
                correct: false,
                answerId: expect.any(Number),
                colour: expect.any(String),
              }
            ]
          },
          {
            questionId: questionDuplicate.body.newQuestionId,
            question: 'Who is the Monarch of England',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
                answerId: expect.any(Number),
                colour: expect.any(String),
              },
              {
                answer: 'Queen Elizabeth',
                correct: false,
                answerId: expect.any(Number),
                colour: expect.any(String),
              }
            ]
          },
          {
            questionId: question2.questionId,
            question: 'Who was the Queen of England',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: false,
                answerId: expect.any(Number),
                colour: expect.any(String),
              },
              {
                answer: 'Queen Elizabeth',
                correct: true,
                answerId: expect.any(Number),
                colour: expect.any(String),
              }
            ]
          }
        ],
        duration: 12
      });
    });
  });
});
