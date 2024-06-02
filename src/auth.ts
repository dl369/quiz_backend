import HTTPError from 'http-errors';
import crypto from 'crypto';
import { getData, setData, User } from './dataStore';
import {
  checkEmailInUse,
  checkEmailValid,
  checkFirstNameVaild,
  checkLastNameVaild,
  checkPasswordValid,
  checkTokenLoggedIn,
  findUser,
  getHashOf
} from './helper';

const initialLoginAttempts = 1;
const initialFailedPasswords = 0;

/**
  * adminAuthRegister generates an unique user Id if valid email,
  * password, first name and last name input, and successfully registers the
  * user to dataStore, Toohak's database
  *
  * @param {string} email - Email address of user
  * @param {string} password - Password of user
  * @param {string} nameFirst - User's first name
  * @param {string} nameLast - User's Last name
  * ...
  *
  * @returns {{authUserId: number}} - Unique user Id returned if valid email,
  * password, first name and last name input
  * @returns {{error: string}} - If inputs are invalid
*/
function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const data = getData();
  const users: User[] = data.users;

  // Check if email is in use - Check helper.js
  let checkValidity = checkEmailInUse(email);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }
  // Check if email is valid - Check helper.js
  checkValidity = checkEmailValid(email);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }
  // Check if given names are valid - Check helper.js
  checkValidity = checkFirstNameVaild(nameFirst);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }
  checkValidity = checkLastNameVaild(nameLast);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }
  // Check if password is valid - Check helper.js
  checkValidity = checkPasswordValid(password);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }
  // Set unique UserId, beginning at one, and incrementing as users register
  const aUID: number = users.length + 1;

  const token = JSON.stringify({
    sessionId: crypto.randomBytes(16).toString('hex'),
    authUserId: aUID,
  });

  users.push({
    userId: aUID,
    name: nameFirst + ' ' + nameLast,
    email: email,
    numSuccessfulLogins: initialLoginAttempts,
    numFailedPasswordsSinceLastLogin: initialFailedPasswords,
    password: getHashOf(password),
    pastPasswords: [],
    tokens: [token],
    trash: []
  });

  setData(data);

  return {
    token: token
  };
}

/**
  * adminAuthLogin will allow a registered user to log-in to their Toohak
  * account if they provide an registered email and respective password. The
  * function returns the authUserId of the given individual who logged in.
  *
  * @param {string} email - Email address of user
  * @param {string} password - Password of user
  * ...
  *
  * @returns {{authUserId: number}} - User's Id returned if valid email and
  * password input
  * @returns {{error: string}} - If inputs are invalid
*/
function adminAuthLogin(email: string, password: string) {
  const data = getData();
  const users: User[] = data.users;

  let emailExists = false;

  let newToken: string;

  // Checks if user email exists with respective password
  for (const user of users) {
    if (user.email === email) {
      if (user.password === getHashOf(password)) {
        emailExists = true;
        user.numSuccessfulLogins++;
        user.numFailedPasswordsSinceLastLogin = 0;

        newToken = JSON.stringify({
          sessionId: user.tokens.length + 1,
          authUserId: user.userId
        });
        user.tokens.push(newToken);
      } else {
        user.numFailedPasswordsSinceLastLogin++;
        throw HTTPError(400, 'Invalid password');
      }
    }
  }

  if (emailExists === false) {
    throw HTTPError(400, 'E-mail address does not exist');
  }

  setData(data);
  return {
    token: newToken
  };
}

/**
  * adminUserDetails will return all the relavent details of an admin that is logged in
  * @param {string} - token
  * ...
  * @returns User's details return if valid authUserId input
  * @returns {{error: string}} - If inputs are invalid
*/
function adminUserDetails(token: string) {
  const userToCheck = checkTokenLoggedIn(token);

  let userToFind: User;
  // Error Case when authUserId is invalid
  if (userToCheck === true) {
    userToFind = findUser(token);
  } else {
    throw HTTPError(401, 'Invalid token');
  }

  return {
    user: {
      userId: userToFind.userId,
      name: userToFind.name,
      email: userToFind.email,
      numSuccessfulLogins: userToFind.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: userToFind.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
  * adminUserDetailsUpdate will allow a registered user to update their user
  * details, including their email, First name, and Last name, if a valid
  * userId is input. The updated details are stored in dataStore.
  *
  * @param {string} token - Email address of user
  * @param {string} email - Email of user
  * @param {string} nameFirst - First Name of user
  * @param {string} nameLast - Last Name of user
  * ...
  *
  * @returns {}
  * @returns {{error: string}} - If inputs are invalid
*/
function adminUserDetailsUpdate (token: string, email: string, nameFirst: string, nameLast: string) {
  // Error Cases
  // AuthUserId is invalid
  const data = getData();
  const userToCheck = checkTokenLoggedIn(token);

  let userToUpdate: User;

  if (userToCheck === true) {
    userToUpdate = findUser(token);
  } else {
    throw HTTPError(401, 'Invalid user ID');
  }

  // Email is being used by another user

  if (data.users.some(user => user.email === email && userToUpdate.userId !== user.userId)) {
    throw HTTPError(400, 'Email belongs to another user');
  }

  let checkValidity = checkEmailValid(email);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }

  checkValidity = checkFirstNameVaild(nameFirst);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }

  checkValidity = checkLastNameVaild(nameLast);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }

  userToUpdate.email = email;
  userToUpdate.name = nameFirst + ' ' + nameLast;
  setData(data);

  return {};
}

/**
 * adminUserPasswordUpdate allows an admin to update the password of a registered
 * user, given the user's ID and the correct old password. The function first
 * verifies that the user exists, the old password is correct,
 * the new password is different from the old password, and the new password
 * hasn't been used previously by the user.
 *
 * Additionally, it checks the validity of the new password based on certain criteria
 * (presumably defined in the checkPasswordValid function).
 *
 * If all conditions are met, the user's password is updated in the dataStore;
 * otherwise, appropriate errors are returned.
 *
 * @param {number} authUserId - The unique identifier of the user whose password is to be updated.
 * @param {string} oldPassword - The current password of the user, which must be correctly provided for the update to proceed.
 * @param {string} newPassword - The new password that the user wishes to set. It must differ from the old password and meet the validity criteria.
 *
 * @returns {object} An empty object if the password update is successful, indicating no errors.
 * @returns {object} An object with an 'error' key and a string value describing
 * the reason for the failure if the update cannot be completed.
 * Possible errors include
 * - 'User not found.',
 * - 'Incorrect old password.',
 * - 'New password must be different from the old password.',
 * - 'New password has already been used.',
 * - or any validity error returned by checkPasswordValid.
 */
function adminUserPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const data = getData();

  const loggedIn = checkTokenLoggedIn(token);

  if (loggedIn === false) {
    throw HTTPError(401, 'Token invalid');
  }

  const userDetails = findUser(token);

  if (userDetails.password !== getHashOf(oldPassword)) {
    throw HTTPError(400, 'Incorrect old Password');
  }

  if (oldPassword === newPassword) {
    throw HTTPError(400, 'New password must be different from the old password.');
  }

  if (userDetails.pastPasswords.includes(getHashOf(newPassword))) {
    throw HTTPError(400, 'New password has already been used.');
  }

  const checkValidity = checkPasswordValid(newPassword);

  if (!checkValidity.Valid) {
    throw HTTPError(400, checkValidity.Message);
  }

  userDetails.pastPasswords.push(userDetails.password);
  userDetails.password = getHashOf(newPassword);

  setData(data);

  return {};
}

/**
  * Logs out user by removing token from user's sessions
  *
  * @param {string} token
  * ...
  *
  * @returns {}
*/
export function adminAuthLogout(token: string) {
  const loggedIn = checkTokenLoggedIn(token);

  if (loggedIn === false) {
    throw HTTPError(401, 'Token Invalid');
  }

  const requiredUser = findUser(token);

  requiredUser.tokens.splice(requiredUser.tokens.indexOf(token), 1);

  return {};
}

export {
  adminUserPasswordUpdate,
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate
};
