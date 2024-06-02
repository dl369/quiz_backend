import {
  v2requestAdminQuizCreate, requestAdminAuthRegister, v2requestAdminQuestionCreate,
  requestClear, v2requestAdminQuizInfo
} from './requestBoilerPlates';

const error = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('adminQuestionCreate', () => {
  describe('Error Tests', () => {
    test('Token is invalid', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, 'invalidToken', questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(401);
    });
    test('Token is empty', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true
          }
        ]
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, '', questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(401);
    });
    test('Question string is less than 5 characters in length', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Ques',
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('Question string is greater than 50 characters in length', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Question title that is longer than 50 characters in length',
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('The question has more than 6 answers', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Question with more than 6 answers',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: '1',
            correct: true
          },
          {
            answer: '2',
            correct: false
          },
          {
            answer: '3',
            correct: false
          },
          {
            answer: '4',
            correct: false
          },
          {
            answer: '5',
            correct: false
          },
          {
            answer: '6',
            correct: false
          },
          {
            answer: '7',
            correct: false
          },
        ]
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('The question has less than 2 answers', () => {
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
          }
        ]
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('The question duration is not a positive number', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
        duration: -4,
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('The sum of the question durations in the quiz exceeds 3 minutes', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
        duration: 179,
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
      v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const question2 = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody2);
      expect(question2.body).toEqual(error);
      expect(question2.statusCode).toEqual(400);
    });
    test('The points awarded for the question are less than 1', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
        duration: 4,
        points: 0,
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('The points awarded for the question are greater than 10', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
        duration: 4,
        points: 11,
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('The length of any answer is shorter than 1 character long', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: '',
            correct: true
          },
          {
            answer: 'Queen Elizabeth',
            correct: false
          }
        ]
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('The length of any answer is longer than 30 characters long', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles answer that is longer than 30 characters',
            correct: true
          },
          {
            answer: 'Queen Elizabeth',
            correct: false
          }
        ]
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('Any answer strings are duplicates of one another (within the same question)', () => {
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
            answer: 'Prince Charles',
            correct: false
          }
        ]
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
    test('There are no correct answers', () => {
      const user = requestAdminAuthRegister('matthewvucic@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const quizId = v2requestAdminQuizCreate(user.token, 'Aero', 'Quiz about Aeroplanes').body;
      const questionBody = {
        question: 'Who is the Monarch of England',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: false
          },
          {
            answer: 'Queen Elizabeth',
            correct: false
          }
        ]
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });

    test('QuizId belongs to another user', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
      const user2 = requestAdminAuthRegister('isaacchiu@gmail.com', 'Password1', 'Isaac', 'Chiu').body;
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user2.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(403);
    });

    test('QuizId is invalid', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
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
      const question = v2requestAdminQuestionCreate(quizId.quizId + 1, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(403);
    });

    test('empty thumbnail', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
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
        ],
        thumbnailUrl: ''
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });

    test('invalid thumbnail', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
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
        ],
        thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.gif'
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });

    test('invalid thumbnail', () => {
      const user = requestAdminAuthRegister('matthewvuci@gmail.com', 'Password1', 'Matthew', 'Vucic').body;
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
        ],
        thumbnailUrl: 'c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg'
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual(error);
      expect(question.statusCode).toEqual(400);
    });
  });

  describe('Passing Tests', () => {
    test('One question is created', () => {
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
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      expect(question.body).toEqual({ questionId: expect.any(Number) });
      expect(question.statusCode).toEqual(200);

      const quizInfo = v2requestAdminQuizInfo(user.token, quizId.quizId);
      expect(quizInfo.body).toStrictEqual({
        quizId: quizId.quizId,
        name: 'Aero',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz about Aeroplanes',
        numQuestions: 1,
        questions: [
          {
            questionId: question.body.questionId,
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
        duration: 4,
        thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg'
      });
    });
    test('Multiple questions are created', () => {
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
        ],
        thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg'
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
        thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg'
      };
      const question = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody);
      const question2 = v2requestAdminQuestionCreate(quizId.quizId, user.token, questionBody2);
      expect(question.body).toEqual({ questionId: expect.any(Number) });
      expect(question2.body).toEqual({ questionId: expect.any(Number) });
      expect(question.statusCode).toEqual(200);
      expect(question2.statusCode).toEqual(200);

      const quizInfo = v2requestAdminQuizInfo(user.token, quizId.quizId);
      expect(quizInfo.body).toStrictEqual({
        quizId: quizId.quizId,
        name: 'Aero',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz about Aeroplanes',
        numQuestions: 2,
        questions: [
          {
            questionId: question.body.questionId,
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
            ],
            thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg'
          },
          {
            questionId: question2.body.questionId,
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
            thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg'
          }
        ],
        duration: 8,
        thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg'
      });
    });
  });
});
