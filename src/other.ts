import { getData, setData, getTimers } from './dataStore';

/**
 * The clear function is designed to reset the application's state by clearing all stored data related to users and quizzes. This operation is particularly useful for reinitializing the application to its default state or preparing the system for a fresh set of data. Upon invocation, it retrieves the current state from the data store, sets both the users and quizzes arrays to empty, effectively removing all existing user and quiz data, and then updates the data store with this new, reset state. This function is essential for maintaining the integrity and manageability of the application's data, especially in development or testing environments where frequent resets may be necessary.
 *
 * @returns {void} This function does not return a value but instead updates the global data store directly.
 */
export const clear = () => {
  const data = getData();
  const timers = getTimers();

  for (const timer of timers) {
    clearTimeout(timer);
  }

  // Resetting the application state by clearing all relevant data arrays.
  data.users = [];
  data.quizzes = [];
  data.sessions = [];
  timers.length = 0;
  setData(data);
  return {};
};
