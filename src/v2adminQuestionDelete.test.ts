import {
  requestAdminAuthRegister, v2requestAdminQuizCreate, v2requestAdminQuizInfo,
  requestClear, v2requestAdminQuestionDelete, v2requestAdminQuestionCreate
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
      const questionDelete = v2requestAdminQuestionDelete(quiz.quizId, question.questionId, user.token + 'invalid');

      expect(questionDelete.body).toStrictEqual(error);
      expect(questionDelete.statusCode).toStrictEqual(401);
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
      const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
      const questionDelete = v2requestAdminQuestionDelete(quiz.quizId + 1, question.questionId, user.token);

      expect(questionDelete.body).toStrictEqual(error);
      expect(questionDelete.statusCode).toStrictEqual(403);
    });
    test('Quiz not owned by user', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('darrius@gmail.com', 'Password1', 'Darrius', 'Lam').body;
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
      const questionDelete = v2requestAdminQuestionDelete(quiz.quizId, question.questionId, user2.token);

      expect(questionDelete.body).toStrictEqual(error);
      expect(questionDelete.statusCode).toStrictEqual(403);
    });
    test('Invalid questionId', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;

      const questionDelete = v2requestAdminQuestionDelete(quiz.quizId, 1, user.token);

      expect(questionDelete.body).toStrictEqual(error);
      expect(questionDelete.statusCode).toStrictEqual(400);
    });
  });
  describe('Passing Tests', () => {
    test('Successful call', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quiz = v2requestAdminQuizCreate(user.token, 'quiz', 'description').body;
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
        ],
        thumbnailUrl: 'http://google.com/some/image2/path.jpg'
      };
      const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
      const question2 = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody2).body;
      const questionDelete = v2requestAdminQuestionDelete(quiz.quizId, question.questionId, user.token);
      expect(questionDelete.body).toStrictEqual({});
      expect(questionDelete.statusCode).toStrictEqual(200);

      const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId);

      expect(quizInfo.body).toStrictEqual({
        quizId: quiz.quizId,
        name: 'quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description',
        numQuestions: 1,
        questions: [
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
            ],
            thumbnailUrl: 'http://google.com/some/image2/path.jpg'
          }
        ],
        duration: 4,
        thumbnailUrl: expect.any(String)
      });
    });
  });
});
