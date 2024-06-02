import {
  v2requestAdminQuizQuestionMove, requestAdminAuthRegister,
  v2requestAdminQuizCreate, v2requestAdminQuestionCreate, v2requestAdminQuizInfo,
  requestClear
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Admin Quiz Question Move Tests', () => {
  test('Successfully moves a quiz question', () => {
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
      ]
    };
    const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;

    const question2 = v2requestAdminQuestionCreate(quiz.quizId, user.token, {
      question: 'What appears at night',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Moon',
          correct: true
        },
        {
          answer: 'Sun',
          correct: false
        }
      ]
    }).body;
    const response = v2requestAdminQuizQuestionMove(quiz.quizId, question2.questionId, user.token, 0);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({});
    const quizInfo = v2requestAdminQuizInfo(user.token, quiz.quizId);
    expect(quizInfo.body).toStrictEqual({
      quizId: quiz.quizId,
      name: 'Aero',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Quiz about Aeroplanes',
      numQuestions: 2,
      questions: [
        {
          questionId: question2.questionId,
          question: 'What appears at night',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Moon',
              correct: true,
              answerId: expect.any(Number),
              colour: expect.any(String),
            },
            {
              answer: 'Sun',
              correct: false,
              answerId: expect.any(Number),
              colour: expect.any(String),
            }
          ]
        },
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
        }
      ],
      duration: 8,
      thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg',
    });
  });
  test('Rejects move if Question Id does not refer to a valid question within this quiz', () => {
    // Step 1: Register a new admin user and create a quiz
    const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
    const quiz = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
    const newPosition = 1;

    // Step 2: Attempt to move a non-existent question within the quiz
    const moveResponse = v2requestAdminQuizQuestionMove(quiz.quizId, quiz.quizId + 1, user.token, newPosition);

    // Step 3: Validate the response for the correct error handling
    expect(moveResponse.statusCode).toEqual(400);
    expect(moveResponse.body).toEqual(error);
  });
  test('Rejects move if NewPosition is out of valid range', () => {
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
      ]
    };
    const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
    const invalidNewPosition = -1;

    const response = v2requestAdminQuizQuestionMove(quiz.quizId, question.questionId, user.token, invalidNewPosition);

    // Expected error for newPosition being out of the valid range
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects move if NewPosition is the same as the current position', () => {
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
      ]
    };
    const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;

    const response = v2requestAdminQuizQuestionMove(quiz.quizId, question.questionId, user.token, 0);

    // Expected error for attempting to move the question to its current position
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects move for invalid token (401 Unauthorized)', () => {
    const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
    const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
    const questionId = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody).body;
    const newPosition = 2; // New position to move the question to
    const invalidToken = user.token + 'invalid'; // Simulated invalid token

    const response = v2requestAdminQuizQuestionMove(quizId.quizId, questionId.questionId, invalidToken, newPosition);

    // Expected error for using an invalid token
    expect(response.statusCode).toEqual(401);
    expect(response.body).toEqual(error);
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
      ]
    };
    const newPosition = 2;
    const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
    const response = v2requestAdminQuizQuestionMove(quiz.quizId + 1, question.questionId, user.token, newPosition);

    expect(response.body).toStrictEqual(error);
    expect(response.statusCode).toStrictEqual(403);
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
      ]
    };
    const newPosition = 2;
    const question = v2requestAdminQuestionCreate(quiz.quizId, user.token, questionBody).body;
    const response = v2requestAdminQuizQuestionMove(quiz.quizId, question.questionId, user2.token, newPosition);

    expect(response.body).toStrictEqual(error);
    expect(response.statusCode).toStrictEqual(403);
  });
});
