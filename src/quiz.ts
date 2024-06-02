import HTTPError from 'http-errors';
import { getData, setData, Question, Quiz } from './dataStore';
import {
  checkTokenLoggedIn, findUser, findQuiz, findQuizInTrash,
  generateAnswerId, calculateTotalQuizDuration, randomColour, findSession
} from './helper';
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 100;
const MIN_QUESTION_LENGTH = 5;
const MAX_QUESTION_LENGTH = 50;
const MIN_ANSWERS = 2;
const MAX_ANSWERS = 6;
const MIN_DURATION = 0;
const MAX_DURATION = 180;
const MIN_POINTS = 1;
const MAX_POINTS = 10;
const MIN_ANSWER_LENGTH = 1;
const MAX_ANSWER_LENGTH = 30;

/**
 * Returns a list of quizzes belonging to the authUserId inputted
 * given the authUserId is valid
 * returns an object
 * @param {number} authUserId
 * @returns {{quizzes: quizList}}
 */
function adminQuizList(token: string) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  if (loggedIn === false) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  const quizList = data.quizzes.filter((quiz) => quiz.authUserId === JSON.parse(token).authUserId)
    .map((quiz) => ({ quizId: quiz.quizId, name: quiz.name }));
  setData(data);

  return { quizzes: quizList };
}

/**
 * Creates a quiz given a valid authUserId, name and description
 * Initialises quizId, timeCreated and timeLastEdited and pushes
 * other parameters to the object
 * returns an object
 * @param {any} token
 * @param {string} name
 * @param {string} description
 * @returns {{quizId}}
 */
function adminQuizCreate(token : string, name : string, description : string, v2: boolean) {
  const data = getData();
  const loggedIn = findUser(token);
  if (!loggedIn) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw HTTPError(400, 'Name contains invalid characters. Only alphanumeric and spaces are allowed.');
  }

  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    throw HTTPError(400, 'Name must be between 3 and 30 characters long.');
  }

  if (data.quizzes.some(quiz => quiz.authUserId === JSON.parse(token).authUserId && quiz.name === name)) {
    throw HTTPError(400, 'Name is already used by the current logged in user for another quiz.');
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw HTTPError(400, 'Description must be 100 characters or less.');
  }

  const quizId = Math.floor(Math.random() * 5000);

  if (v2) {
    data.quizzes.push({
      quizId,
      token,
      authUserId: loggedIn.userId,
      timeCreated: Math.floor(new Date().getTime() / 1000),
      timeLastEdited: Math.floor(new Date().getTime() / 1000),
      name,
      description,
      numQuestions: 0,
      questions: [],
      duration: 0,
      thumbnailUrl: 'https://c.files.bbci.co.uk/15E07/production/_112970698_qt.jpg'
    });
  } else {
    data.quizzes.push({
      quizId,
      token,
      authUserId: loggedIn.userId,
      timeCreated: Math.floor(new Date().getTime() / 1000),
      timeLastEdited: Math.floor(new Date().getTime() / 1000),
      name,
      description,
      numQuestions: 0,
      questions: [],
      duration: 0
    });
  }

  setData(data);
  return { quizId };
}

/**
 * Removes a quiz given a valid authUserId and that the quizId
 * is valid and belongs to the user
 * directly edits the array and returns and empty object
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{}}
 */
function adminQuizRemove(token: string, quizId: number) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  const user = findUser(token);

  if (loggedIn === false) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (index === -1) {
    throw HTTPError(403, 'quizId is not valid');
  }

  if (!data.quizzes.some(quiz => quiz.quizId === quizId && quiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another authUserId');
  }

  data.quizzes[index].timeLastEdited = Math.floor(new Date().getTime() / 1000);

  const removedQuiz = data.quizzes.splice(index, 1)[0];

  user.trash.push(removedQuiz);
  setData(data);
  return {};
}

/**
 * Given a valid authUserId and that the quizId
 * is valid and belongs to the user,
 * returns quiz info including, authUserId, quizId, name,
 * description, timeCreated and timeLastEdited.
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{
 *  quizId,
 *  name,
 *  timeCreated,
 *  timeLastEdited,
 *  description,
 * }}
 */
function adminQuizInfo(token: string, quizId: number, v2: boolean) {
  const data = getData();

  // check if user exists
  const foundUser = findUser(token);
  if (!foundUser) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  // check quiz requirements
  const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!foundQuiz) {
    throw HTTPError(403, 'Invalid quizId');
  }
  if (foundQuiz.authUserId !== JSON.parse(token).authUserId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  if (v2) {
    return {
      quizId: quizId,
      name: foundQuiz.name,
      timeCreated: foundQuiz.timeCreated,
      timeLastEdited: foundQuiz.timeLastEdited,
      description: foundQuiz.description,
      numQuestions: foundQuiz.numQuestions,
      questions: foundQuiz.questions,
      duration: foundQuiz.duration,
      thumbnailUrl: foundQuiz.thumbnailUrl
    };
  } else {
    return {
      quizId: quizId,
      name: foundQuiz.name,
      timeCreated: foundQuiz.timeCreated,
      timeLastEdited: foundQuiz.timeLastEdited,
      description: foundQuiz.description,
      numQuestions: foundQuiz.numQuestions,
      questions: foundQuiz.questions,
      duration: foundQuiz.duration,
    };
  }
}

/**
 * Given a valid authUserId and that the quizId
 * is valid and belongs to the user,
 * updates the name of the quiz
 * returns an empty object
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {{}}
 */
function adminQuizNameUpdate(token: string, quizId: number, name: string) {
  const data = getData();

  // authUserId check
  const foundUser = findUser(token);
  if (!foundUser) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  // check quiz requirements
  const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!foundQuiz) {
    throw HTTPError(403, 'Invalid quizId');
  }
  if (foundQuiz.authUserId !== JSON.parse(token).authUserId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  // name checks
  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw HTTPError(400, 'Name contains invalid characters. Only alphanumeric and spaces are allowed.');
  }
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    throw HTTPError(400, 'Name must be between 3 and 30 characters long.');
  }
  if (data.quizzes.some(quiz => quiz.authUserId === JSON.parse(token).authUserId && quiz.name === name) &&
    name !== foundQuiz.name
  ) {
    throw HTTPError(400, 'Name is already used by the current logged in user for another quiz.');
  }

  foundQuiz.timeLastEdited = Math.floor(new Date().getTime() / 1000);

  // change name
  foundQuiz.name = name;
  setData(data);

  return {};
}

/**
 * Given a valid authUserId and that the quizId
 * is valid and belongs to the user,
 * updates the description of the quiz
 * returns an empty object
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} description
 * @returns {{}}
 */
function adminQuizDescriptionUpdate(token: string, quizId: number, description: string) {
  const data = getData();

  // error checks
  const foundUser = findUser(token);
  if (!foundUser) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw HTTPError(400, 'Invalid description length');
  }

  // check quiz requirements
  const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!foundQuiz) {
    throw HTTPError(403, 'Invalid quizId');
  }
  if (foundQuiz.authUserId !== JSON.parse(token).authUserId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  foundQuiz.timeLastEdited = Math.floor(new Date().getTime() / 1000);

  // change description
  foundQuiz.description = description;
  setData(data);

  return {};
}

/**
 * Creates question inside quiz
 *
 * @param {number} quizId - The ID of the quiz.
 * @param {string} token - The authentication token of the user attempting the operation.
 * @param {object} questionBody - information on question title, duration, points and answers
 *
 * @returns {questionId: number}
 * @returns {{error: string}} - If the operation is invalid, detailing the reason.
 */
function adminQuestionCreate(quizId: number, token: string, questionBody: Question) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  if (loggedIn === false) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (index === -1) {
    throw HTTPError(403, 'quizId is not valid');
  }

  if (!(data.quizzes[index].authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  if (questionBody.question.length < MIN_QUESTION_LENGTH || questionBody.question.length > MAX_QUESTION_LENGTH) {
    throw HTTPError(400, 'Question length is invalid');
  }

  if (questionBody.answers.length > MAX_ANSWERS || questionBody.answers.length < MIN_ANSWERS) {
    throw HTTPError(400, 'Number of answers is invalid');
  }

  if (questionBody.duration <= MIN_DURATION) {
    throw HTTPError(400, 'Question duration is invalid');
  }

  if ((data.quizzes[index].duration + questionBody.duration) > MAX_DURATION) {
    throw HTTPError(400, 'Quiz duration is invalid');
  }

  if (questionBody.points < MIN_POINTS || questionBody.points > MAX_POINTS) {
    throw HTTPError(400, 'Question points is invalid');
  }

  for (const flag of questionBody.answers) {
    if (flag.answer.length < MIN_ANSWER_LENGTH || flag.answer.length > MAX_ANSWER_LENGTH) {
      throw HTTPError(400, 'Answer length is invalid');
    }
  }

  if (questionBody.thumbnailUrl === '') {
    throw HTTPError(400, 'thumbnailUrl is empty');
  }

  if (questionBody.thumbnailUrl) {
    if (!(questionBody.thumbnailUrl.toLowerCase().endsWith('.png') || questionBody.thumbnailUrl.toLowerCase().endsWith('.jpeg') || questionBody.thumbnailUrl.toLowerCase().endsWith('.jpg'))) {
      throw HTTPError(400, 'Invalid thumbnailUrl');
    }

    if (!(questionBody.thumbnailUrl.startsWith('http://') || questionBody.thumbnailUrl.startsWith('https://'))) {
      throw HTTPError(400, 'Invalid thumbnailUrl');
    }
  }

  const answers = questionBody.answers.map(answer => answer.answer);
  const hasDuplicates = (new Set(answers)).size !== answers.length;

  if (hasDuplicates) {
    throw HTTPError(400, 'Duplicate answers are invalid');
  }

  if (!questionBody.answers.some(answer => answer.correct)) {
    throw HTTPError(400, 'No correct answers found');
  }

  questionBody.answers = questionBody.answers.map((answer) => ({
    ...answer,
    answerId: generateAnswerId(),
    colour: randomColour(),
  }));

  const questionId = Date.now();
  questionBody.questionId = questionId;
  data.quizzes[index].questions.push(questionBody);
  data.quizzes[index].numQuestions = data.quizzes[index].questions.length;
  data.quizzes[index].timeLastEdited = Math.floor(new Date().getTime() / 1000);
  data.quizzes[index].duration += questionBody.duration;

  setData(data);

  return { questionId };
}

/**
 * Views all quizzes in trash
 *
 * @param {string} token - The authentication token of the user attempting the operation.
 *
 * @returns {{}} - Empty object on successful operation.
 * @returns {{error: string}} - If the operation is invalid, detailing the reason.
 */
function adminQuizTrash(token: string) {
  const loggedIn = checkTokenLoggedIn(token);
  const user = findUser(token);
  if (loggedIn === false) {
    throw HTTPError(401, 'Token Invalid');
  }

  const trashList = user.trash.filter(quiz => quiz.authUserId === JSON.parse(token).authUserId)
    .map((quiz) => ({ quizId: quiz.quizId, name: quiz.name }));

  return {
    quizzes: trashList
  };
}

/**
 * Restore a particular quiz from the trash back to an active quiz.
 * This edits the timeLastEdited timestamp
 * @param {number} quizId - quiz to restore from the trash
 * @param {string} token - user restoring the quiz
 *
 * @returns {{}}
 * @returns error
 */
function adminQuizRestore(quizId: number, token: string) {
  const data = getData();
  // Error checks

  const foundActiveQuiz = findQuiz(quizId);
  const foundUser = findUser(token);

  if (!foundUser) {
    throw HTTPError(401, 'Token is invalid or empty');
  }
  const foundQuizInTrash = findQuizInTrash(quizId);
  if (foundActiveQuiz) {
    throw HTTPError(400, 'Quiz is currently active');
  } else if (!foundQuizInTrash) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (foundQuizInTrash.authUserId !== JSON.parse(token).authUserId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  // Update the time edited
  foundQuizInTrash.timeLastEdited = Math.floor(new Date().getTime() / 1000);
  // Add it back to quizzes in data
  data.quizzes.push(foundQuizInTrash);
  // Delete it from the trash
  foundUser.trash.splice(foundUser.trash.indexOf(foundQuizInTrash), 1);
  return {};
}

/**
 * Permanently delete specific quizzes currently sitting in the trash
 * @param {string} token
 * @param {number[]} quizIds
 *
 * @returns {}
 * @returns {error}
 */
function adminQuizTrashEmpty(token: string, quizIds: number[]) {
  // Error checks

  const foundUser = findUser(token);
  if (!foundUser) {
    throw HTTPError(401, 'Token is invalid or empty');
  }
  // Checks all quizes in array
  let foundQuizInTrash: Quiz;
  let foundActiveQuiz: Quiz;

  for (const quizId of quizIds) {
    foundQuizInTrash = findQuizInTrash(quizId);
    foundActiveQuiz = findQuiz(quizId);
    if (foundActiveQuiz) {
      throw HTTPError(400, 'Quiz is currently active');
    } else if (!foundQuizInTrash) {
      throw HTTPError(403, 'Invalid quizId');
    }
    if (foundQuizInTrash.authUserId !== JSON.parse(token).authUserId) {
      throw HTTPError(403, 'User does not own this quiz');
    }
    foundUser.trash.splice(foundUser.trash.indexOf(foundQuizInTrash), 1);
  }

  return {};
}

/**
 * Transfer ownership of a quiz to a different user based on their email
 * @param {number} quizId
 * @param {string} token
 * @param {string} userEmail
 *
 * @returns {}
 * @returns {error}
 */
function adminQuizTransfer(quizId:number, token: string, userEmail: string) {
  const data = getData();
  const loggedIn = checkTokenLoggedIn(token);
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  if (loggedIn === false) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  if (index === -1) {
    throw HTTPError(403, 'quizId is not valid');
  }

  if (!(data.quizzes[index].authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  const foundEmailUser = data.users.find(user => user.email === userEmail);
  if (!foundEmailUser) {
    throw HTTPError(400, 'userEmail is not a real user');
  }
  if (foundEmailUser.userId === JSON.parse(token).authUserId) {
    throw HTTPError(400, 'userEmail is the current user');
  }

  const quizName = data.quizzes[index].name;
  const duplicateName = data.quizzes.some(quiz =>
    quiz.name === quizName &&
    quiz.authUserId === foundEmailUser.userId
  );

  if (duplicateName) {
    throw HTTPError(400, 'QuizID refers to a quiz that has a name that is already used by the target user');
  }

  // data.quizzes[index].token = foundEmailUser.token invalid
  data.quizzes[index].authUserId = foundEmailUser.userId;

  setData(data);

  return {};
}

/**
 * adminQuizQuestionUpdate attempts to update the details of a specific quiz question.
 * It validates the quiz and question IDs, the new question details, including the content, duration, points, and answers.
 *
 * @param {number} quizId - The unique identifier of the quiz containing the question.
 * @param {number} questionId - The unique identifier of the question to update.
 * @param {string} token - The session token of the admin attempting the update.
 * @param {QuestionBody} questionBody - The new details of the question.
 *
 * @returns {Object} - An empty object if the update is successful.
 * @returns {Object} - An object with an 'error' key describing the failure reason if the update fails.
 */
function adminQuizQuestionUpdate(quizId: number, questionId: number, token: string, questionBody: Question) {
  const data = getData();
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  if (!checkTokenLoggedIn(token)) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const quiz = data.quizzes[index];

  if (index === -1) {
    throw HTTPError(403, 'QuizId is not valid');
  }

  if (!(data.quizzes[index].authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'QuizId belongs to another user');
  }

  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  const question = quiz.questions[questionIndex];
  if (questionIndex === -1) {
    throw HTTPError(400, 'QuestionId is invalid');
  }

  if (questionBody.question.length < MIN_QUESTION_LENGTH || questionBody.question.length > MAX_QUESTION_LENGTH) {
    throw HTTPError(400, 'Question length is invalid');
  }

  if (questionBody.answers.length < MIN_ANSWERS || questionBody.answers.length > MAX_ANSWERS) {
    throw HTTPError(400, 'Number of answers is invalid');
  }

  if (questionBody.duration <= MIN_DURATION) {
    throw HTTPError(400, 'Question duration is invalid ');
  }

  if ((data.quizzes[index].duration + questionBody.duration) > MAX_DURATION) {
    throw HTTPError(400, 'Quiz duration is invalid');
  }

  if (questionBody.points < MIN_POINTS || questionBody.points > MAX_POINTS) {
    throw HTTPError(400, 'Question points is invalid');
  }

  for (const flag of questionBody.answers) {
    if (flag.answer.length < MIN_ANSWER_LENGTH || flag.answer.length > MAX_ANSWER_LENGTH) {
      throw HTTPError(400, 'Answer length is invalid');
    }
  }

  const answers = questionBody.answers.map(answer => answer.answer);
  const hasDuplicates = (new Set(answers)).size !== answers.length;

  if (hasDuplicates) {
    throw HTTPError(400, 'Duplicate answers are invalid');
  }

  if (!questionBody.answers.some(answer => answer.correct)) {
    throw HTTPError(400, 'No correct answers found');
  }

  if (questionBody.thumbnailUrl === '') {
    throw HTTPError(400, 'thumbnailUrl is empty');
  }

  if (questionBody.thumbnailUrl) {
    if (!(questionBody.thumbnailUrl.toLowerCase().endsWith('.png') || questionBody.thumbnailUrl.toLowerCase().endsWith('.jpeg') || questionBody.thumbnailUrl.toLowerCase().endsWith('.jpg'))) {
      throw HTTPError(400, 'Invalid thumbnailUrl');
    }

    if (!(questionBody.thumbnailUrl.startsWith('http://') || questionBody.thumbnailUrl.startsWith('https://'))) {
      throw HTTPError(400, 'Invalid thumbnailUrl');
    }
  }

  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.points = questionBody.points;
  question.answers = questionBody.answers.map(answer => ({
    ...answer,
    answerId: answer.answerId || generateAnswerId(),
    colour: answer.colour || randomColour(),
  }));

  const totalQuizDuration = calculateTotalQuizDuration(quiz.questions);
  data.quizzes[index].duration = totalQuizDuration;

  data.quizzes[index].timeLastEdited = Math.floor(new Date().getTime() / 1000);

  if (questionBody.thumbnailUrl) {
    question.thumbnailUrl = questionBody.thumbnailUrl;
  }

  setData(data);
  return {};
}

/**
 * Moves a quiz question to a new position within the quiz, if the operation is valid.
 * The function verifies the authenticity and authorization of the request, checks if the
 * quiz and question IDs are valid, and whether the new position is within the acceptable range.
 *
 * @param {number} quizId - The ID of the quiz.
 * @param {number} questionId - The ID of the question to move.
 * @param {string} token - The authentication token of the user attempting the operation.
 * @param {number} newPosition - The new position to move the question to within the quiz.
 *
 * @returns {{}} - Empty object on successful operation.
 * @returns {{error: string}} - If the operation is invalid, detailing the reason.
 */
function adminQuizQuestionMove(quizId: number, questionId: number, token: string, newPosition: number) {
  const data = getData();

  const foundUser = findUser(token);
  if (!foundUser) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  // check quiz requirements
  const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!foundQuiz) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (!(foundQuiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  // Check if the question belongs to the quiz and the new position is valid
  const questionIndex = foundQuiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  if (newPosition < 0 || newPosition >= foundQuiz.questions.length) {
    throw HTTPError(400, 'NewPosition is out of valid range');
  }

  // Assuming that questions have a 'position' property; adjust as needed
  if (questionIndex === newPosition) {
    throw HTTPError(400, 'NewPosition is the same as the current position');
  }

  // Move the question
  const [movedQuestion] = foundQuiz.questions.splice(questionIndex, 1);
  foundQuiz.questions.splice(newPosition, 0, movedQuestion);
  foundQuiz.timeLastEdited = Math.floor(new Date().getTime() / 1000);
  // Save the updated data
  setData(data);

  return {};
}

/**
 * Deletes a question in a given quiz
 *
 * @param {number} quizId - The ID of the quiz.
 * @param {number} questionId - The ID of the question to move.
 * @param {string} token - The authentication token of the user attempting the operation.
 *
 * @returns {{}} - Empty object on successful operation.
 * @returns {{error: string}} - If the operation is invalid, detailing the reason.
 */
function adminQuestionDelete(quizId: number, questionId: number, token: string) {
  const data = getData();

  const foundUser = findUser(token);
  if (!foundUser) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  // check quiz requirements
  const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!foundQuiz) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (!(foundQuiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  const questionIndex = foundQuiz.questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === -1) {
    throw HTTPError(400, 'Invalid questionId');
  }

  const questionDuration = foundQuiz.questions[questionIndex].duration;
  foundQuiz.duration -= questionDuration;
  foundQuiz.numQuestions--;

  foundQuiz.questions.splice(questionIndex, 1);
  foundQuiz.timeLastEdited = Math.floor(new Date().getTime() / 1000);

  return {};
}

/**
 * Duplicates a question in a quiz at the next point in quiz.
 *
 * @param {number} quizId - The ID of the quiz.
 * @param {number} questionId - The ID of the question to move.
 * @param {string} token - The authentication token of the user attempting the operation.
 *
 * @returns {{newQuestionId: number}}} - Empty object on successful operation.
 * @returns {{error: string}} - If the operation is invalid, detailing the reason.
 */
function adminQuestionDuplicate(quizId: number, questionId: number, token: string) {
  const data = getData();

  // check if user exists
  const foundUser = findUser(token);
  if (!foundUser) {
    throw HTTPError(401, 'Token is invalid or empty');
  }

  // check quiz requirements
  const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!foundQuiz) {
    throw HTTPError(403, 'Invalid quizId');
  }

  if (!(foundQuiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  const questionIndex = foundQuiz.questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === -1) {
    throw HTTPError(400, 'Invalid questionId');
  }

  const questionDuration = foundQuiz.questions[questionIndex].duration;
  foundQuiz.duration += questionDuration;
  foundQuiz.numQuestions++;

  const newQuestion = { ...foundQuiz.questions[questionIndex] };
  const newQuestionId = Date.now();
  newQuestion.questionId = newQuestionId;

  foundQuiz.questions.splice(questionIndex + 1, 0, newQuestion);
  foundQuiz.timeLastEdited = Math.floor(new Date().getTime() / 1000);

  return { newQuestionId: newQuestionId };
}

/**
 * Update the thumbnail for the quiz.
 * When this route is called, the timeLastEdited is updated.
 * @param {number} quizId
 * @param {string} token
 * @param {string} imgUrl
 * @returns
 */
function adminQuizThumbnailUpdate(quizId: number, token: string, imgUrl: string) {
  const data = getData();

  const loggedIn = checkTokenLoggedIn(token);

  if (loggedIn === false) {
    throw HTTPError(401, 'Token Invalid');
  }

  if (imgUrl === '') {
    throw HTTPError(400, 'thumbnailUrl is empty');
  }

  if (!(imgUrl.toLowerCase().endsWith('.png') || imgUrl.toLowerCase().endsWith('.jpeg') || imgUrl.toLowerCase().endsWith('.jpg'))) {
    throw HTTPError(400, 'Invalid thumbnailUrl');
  }

  if (!(imgUrl.startsWith('http://') || imgUrl.startsWith('https://'))) {
    throw HTTPError(400, 'Invalid thumbnailUrl');
  }

  const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!foundQuiz) {
    throw HTTPError(403, 'Invalid quizId');
  }
  if (foundQuiz.authUserId !== JSON.parse(token).authUserId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  foundQuiz.thumbnailUrl = imgUrl;
  foundQuiz.timeLastEdited = Math.floor(new Date().getTime() / 1000);

  return {};
}

/**
 * Retrieves active and inactive session ids (sorted in ascending order) for a quiz
 * - Active sessions are sessions that are not in the END state.
 * - Inactive sessions are sessions in the END state.
 * @param {string} token
 * @param {number} quizId
 * @param {number} sessionId
 * @returns
 */
function adminQuizGetSessionStatus(token: string, quizId: number, sessionId: number) {
  const data = getData();

  const loggedIn = checkTokenLoggedIn(token);
  if (loggedIn === false) {
    throw HTTPError(401, 'Token Invalid');
  }

  const session = findSession(sessionId);
  if (!findSession(sessionId)) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  const foundQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!(foundQuiz.authUserId === JSON.parse(token).authUserId)) {
    throw HTTPError(403, 'quizId belongs to another user');
  }

  // Make an array of just the player names
  const playerNames: string[] = [];
  for (const player of session.players) {
    playerNames.push(player.name);
  }

  return {
    state: session.sessionState,
    atQuestion: session.atQuestion,
    players: playerNames,
    metadata: session.metadata
  };
}

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizQuestionUpdate,
  adminQuizQuestionMove,
  adminQuizTrash,
  adminQuizRestore,
  adminQuizTrashEmpty,
  adminQuestionCreate,
  adminQuizTransfer,
  adminQuestionDelete,
  adminQuestionDuplicate,
  adminQuizThumbnailUpdate,
  adminQuizGetSessionStatus,
};

// 1. Take in a valid token,
// 2. find the email and the token associated with the email
// 3. Compare the foundEmail - token to the token taken from the parameter
// 4. if the token associated with the found email is the same as the token taken from the paramter
// return the error and statusCode
