import {
  v2requestAdminQuizQuestionUpdate, requestAdminAuthRegister,
  v2requestAdminQuizCreate, v2requestAdminQuestionCreate, requestClear,
  v2requestAdminQuizInfo
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Admin Quiz Question Update Tests', () => {
  let quiz: number;
  let question: number;
  let token: string;
  const questionBody = {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Queen Elizabeth II', correct: false }
    ],
    thumbnailUrl: 'http://google.com/some/image/path.jpg'
  };

  beforeEach(() => {
    const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
    token = user.token;
    quiz = v2requestAdminQuizCreate(token, 'England', 'QuizAboutEngland').body.quizId;
    question = v2requestAdminQuestionCreate(quiz, token, questionBody).body.questionId;
  });

  test('Updates quiz question successfully with all conditions met', () => {
    const updatedQuestionBody = {
      question: 'Who is the current Monarch of the United Kingdom?',
      duration: 5,
      points: 10,
      answers: [
        { answer: 'King Charles III', correct: true },
        { answer: 'Queen Elizabeth II', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const updateResponse = v2requestAdminQuizQuestionUpdate(
      quiz, question, token, updatedQuestionBody
    );

    expect(updateResponse.statusCode).toEqual(200);
    expect(updateResponse.body).toStrictEqual({});

    const quizInfo = v2requestAdminQuizInfo(token, quiz);
    expect(quizInfo.body).toStrictEqual({
      quizId: quiz,
      name: 'England',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'QuizAboutEngland',
      numQuestions: 1,
      questions: [
        {
          questionId: question,
          question: 'Who is the current Monarch of the United Kingdom?',
          duration: 5,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 10,
          answers: [
            {
              answer: 'King Charles III',
              correct: true,
              answerId: expect.any(Number),
              colour: expect.any(String)
            },
            {
              answer: 'Queen Elizabeth II',
              correct: false,
              answerId: expect.any(Number),
              colour: expect.any(String)
            }
          ],
        }
      ],
      thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg',
      duration: 5
    });
  });
  test('Rejects update if question Id does not refer to a valid question within this quiz', () => {
    const questionBody2 = {
      question: 'Who is the current Monarch of the United Kingdom?',
      duration: 5,
      points: 10,
      answers: [
        { answer: 'King Charles III', correct: true },
        { answer: 'Queen Elizabeth II', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question + 1, token, questionBody2);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects update if question string length is out of bounds', () => {
    const questionBody2 = {
      question: 'Q?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Yes', correct: true },
        { answer: 'No', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody2);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects update if the question has incorrect number of answers', () => {
    const questionBody2 = {
      question: 'What is the capital of Australia?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Canberra', correct: true }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody2);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects update if question duration exceeds quiz limit', () => {
    const questionBody2 = {
      question: 'Who is the Queen of England?',
      duration: 4,
      points: 5,
      answers: [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth II', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    v2requestAdminQuestionCreate(quiz, token, questionBody2);
    const questionBody3 = {
      question: 'What is the largest planet in our solar system?',
      duration: 178,
      points: 5,
      answers: [
        { answer: 'Jupiter', correct: true },
        { answer: 'Mars', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody3);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Question duration not postive', () => {
    const questionBody2 = {
      question: 'What is the largest planet in our solar system?',
      duration: -1,
      points: 5,
      answers: [
        { answer: 'Jupiter', correct: true },
        { answer: 'Mars', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody2);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects update for invalid token', () => {
    const questionBody2 = {
      question: 'What is the largest planet in our solar system?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Jupiter', correct: true },
        { answer: 'Mars', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token + 'invalid', questionBody2);
    expect(response.statusCode).toEqual(401);
    expect(response.body).toEqual(error);
  });
  test('Rejects update if the points awarded are out of the allowed range', () => {
    const questionBody2 = {
      question: 'What is the largest planet in our solar system?',
      duration: 181,
      points: 11,
      answers: [
        { answer: 'Jupiter', correct: true },
        { answer: 'Mars', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody2);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects update if any answer length is out of bounds', () => {
    const questionBody2 = {
      question: 'asdfasdf',
      duration: 5,
      points: 5,
      answers: [
        { answer: '', correct: true },
        { answer: '', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody2);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects update if answer strings are duplicates', () => {
    const questionBody2 = {
      question: 'What is the largest planet in our solar system?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Mars', correct: true },
        { answer: 'Mars', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody2);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('Rejects update if there are no correct answers', () => {
    const questionBody2 = {
      question: 'What is the largest planet in our solar system?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Jupiter', correct: false },
        { answer: 'Mars', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody2);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(error);
  });
  test('invalid quizId', () => {
    const questionBody2 = {
      question: 'What is the largest planet in our solar system?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Jupiter', correct: false },
        { answer: 'Mars', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz + 1, question, token, questionBody2);
    expect(response.statusCode).toEqual(403);
    expect(response.body).toEqual(error);
  });
  test('quizId owned by another user', () => {
    const user2 = requestAdminAuthRegister('darriuslam@gmail.com', 'Password1', 'Darrius', 'Lam').body;
    const questionBody2 = {
      question: 'What is the largest planet in our solar system?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Jupiter', correct: false },
        { answer: 'Mars', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = v2requestAdminQuizQuestionUpdate(quiz, question, user2.token, questionBody2);
    expect(response.statusCode).toEqual(403);
    expect(response.body).toEqual(error);
  });

  test('Rejects update if thumbnailUrl is empty', () => {
    const baseQuestionBody = {
      question: 'Updated Question?',
      duration: 10,
      points: 1,
      answers: [
        { answer: 'Answer 1', correct: false },
        { answer: 'Answer 2', correct: true }
      ],
      thumbnailUrl: ''
    };
    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, baseQuestionBody);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: 'thumbnailUrl is empty' });
  });

  test('Rejects update if thumbnailUrl has invalid file format', () => {
    const baseQuestionBody = {
      question: 'Updated Question?',
      duration: 10,
      points: 1,
      answers: [
        { answer: 'Answer 1', correct: false },
        { answer: 'Answer 2', correct: true }
      ],
      thumbnailUrl: 'http://example.com/image.gif'
    };
    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, baseQuestionBody);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: 'Invalid thumbnailUrl' });
  });
  test('Rejects update if thumbnail URL does not start with http:// or https://', () => {
    const baseQuestionBody = {
      question: 'Updated Question?',
      duration: 10,
      points: 1,
      answers: [
        { answer: 'Answer 1', correct: false },
        { answer: 'Answer 2', correct: true }
      ],
      thumbnailUrl: ''
    };
    const questionBody = { ...baseQuestionBody, thumbnailUrl: 'ftp://example.com/image.jpg' };
    const response = v2requestAdminQuizQuestionUpdate(quiz, question, token, questionBody);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: 'Invalid thumbnailUrl' });
  });
});
