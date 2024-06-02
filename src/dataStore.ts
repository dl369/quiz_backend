export interface User {
  userId: number,
  name: string,
  email: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  password: string,
  pastPasswords: string[],
  tokens: string[],
  trash: Quiz[]
}

export interface Quiz {
  quizId: number,
  token: string,
  authUserId: number,
  timeCreated: number
  timeLastEdited: number
  name: string
  description: string
  numQuestions: number
  questions: Question[]
  duration: number
  thumbnailUrl?: string
  sessions?: Session[]
}

export interface Session {
  messages?: Message[]
  sessionId: number
  players: Player[],
  autoStartNum: number,
  sessionState: GameState,
  atQuestion: number
  questionStartTime?: number
  answerSubmissions: AnswerSubmission[]
  metadata: Quiz
}

export enum GameState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export interface AnswerSubmission {
  submissions: Submission[]
}

export interface Submission {
  playerId: number
  isCorrect: boolean
  timeTaken: number
  score: number
}

export interface Question {
  questionId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[],
  thumbnailUrl?: string,
}

export interface Answer {
  answerId: number,
  answer: string,
  colour: string,
  correct: boolean
}

export interface Player {
  sessionId: number,
  playerId: number,
  name: string,
}

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  sessions: Session[];
}

let data: DataStore = {
  users: [],
  quizzes: [],
  sessions: [],
};

export interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number; // Unix timestamp
}

const timerStore: ReturnType<typeof setTimeout>[] = [];

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

function getTimers() {
  return timerStore;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore) {
  data = newData;
}

export { getData, setData, getTimers };
