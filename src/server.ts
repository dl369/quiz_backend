import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserPasswordUpdate,
  adminAuthLogout,
  adminUserDetails,
  adminUserDetailsUpdate
} from './auth';

import {
  adminQuizCreate,
  adminQuizList,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizRemove,
  adminQuizTrash,
  adminQuizRestore,
  adminQuizTrashEmpty,
  adminQuizTransfer,
  adminQuestionCreate,
  adminQuestionDelete,
  adminQuestionDuplicate,
  adminQuizQuestionMove,
  adminQuizQuestionUpdate,
  adminQuizThumbnailUpdate,
  adminQuizGetSessionStatus,
} from './quiz';

import {
  playerJoin,
  playerStatus,
  playerQuestionInfomation,
  playerAnswerSubmit,
  playerAnswerResult,
  playerFinalResults,
  playerReturnMessages,
  playerSendChatMessage
} from './player';

import {
  adminSessionStart,
  adminQuizSessions,
  adminUpdateSession,
  adminQuizSessionResults,
  adminQuizSessionResultsCsv
} from './session';

import { getData, setData } from './dataStore';

import { clear } from './other';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
app.use('/finalSessionResults', express.static('finalSessionResults'));

const load = () => {
  if (fs.existsSync('./database.json')) {
    const file = fs.readFileSync('./database.json', { encoding: 'utf8' });
    setData(JSON.parse(file));
  }
};
load();

const save = () => {
  fs.writeFileSync('./database.json', JSON.stringify(getData()));
};

app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  save();
  return res.json(echo(data));
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  save();
  return res.status(200).json(response);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  save();
  return res.json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = adminAuthLogin(email, password);

  save();
  return res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const response = adminAuthLogout(token);

  save();
  return res.json(response);
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.header('token') as string;

  const response = adminAuthLogout(token);
  save();
  return res.json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = adminUserDetails(token);
  save();
  return res.status(200).json(response);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token') as string;

  const response = adminUserDetails(token);
  save();
  return res.status(200).json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;

  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  save();
  return res.status(200).json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { email, nameFirst, nameLast } = req.body;

  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  save();
  return res.status(200).json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);

  save();
  return res.status(200).json(response);
});

app.put('/v2/admin/user/password', (req, res) => {
  const token = req.header('token') as string;
  const { oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);

  save();
  res.status(200).json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const response = adminQuizCreate(token, name, description, false);

  save();
  return res.status(200).json(response);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, description } = req.body;
  const response = adminQuizCreate(token, name, description, true);

  save();
  return res.status(200).json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizList(token);

  save();
  return res.status(200).json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token');
  const response = adminQuizList(token);

  save();
  return res.status(200).json(response);
});

app.delete('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizId);
  const response = adminQuizRemove(token, quizId);

  save();
  return res.status(200).json(response);
});

app.delete('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizId);
  const response = adminQuizRemove(token, quizId);

  save();
  return res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuestionCreate(quizId, token, questionBody);

  save();
  return res.status(200).json(response);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.header('token');
  const { questionBody } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuestionCreate(quizId, token, questionBody);

  save();
  return res.status(200).json(response);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizTrash(token);

  save();
  return res.status(200).json(response);
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const response = adminQuizTrash(token);

  save();
  return res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizid = Number(req.params.quizid);
  const { token } = req.body;
  const response = adminQuizRestore(quizid, token);

  save();
  return res.status(200).json(response);
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizid = Number(req.params.quizid);
  const token = req.header('token') as string;
  const response = adminQuizRestore(quizid, token);

  save();
  return res.status(200).json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIds = Array.isArray(req.query.quizIds) ? req.query.quizIds.map(Number) : [Number(req.query.numbers)];
  const response = adminQuizTrashEmpty(token, quizIds);

  save();
  return res.status(200).json(response);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizIds = Array.isArray(req.query.quizIds) ? req.query.quizIds.map(Number) : [Number(req.query.numbers)];
  const response = adminQuizTrashEmpty(token, quizIds);

  save();
  return res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { token, userEmail } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizTransfer(quizId, token, userEmail);

  save();
  return res.status(200).json(response);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token = req.header('token');
  const { userEmail } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizTransfer(quizId, token, userEmail);

  save();
  return res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = Number(req.params.quizid);
  const response = adminQuizInfo(token, quizId, false);

  save();
  return res.json(response);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = Number(req.params.quizid);
  const response = adminQuizInfo(token, quizId, true);

  save();
  return res.json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = Number(req.params.quizid);
  const response = adminQuizNameUpdate(req.body.token, quizId, req.body.name);

  save();
  return res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = Number(req.params.quizid);
  const response = adminQuizNameUpdate(req.header('token'), quizId, req.body.name);

  save();
  return res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = Number(req.params.quizid);
  const response = adminQuizDescriptionUpdate(req.body.token, quizId, req.body.description);

  save();
  return res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = Number(req.params.quizid);
  const response = adminQuizDescriptionUpdate(req.header('token'), quizId, req.body.description);

  save();
  return res.status(200).json(response);
});

app.delete('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = Number(req.params.quizId);
  const questionId = Number(req.params.questionId);
  const response = adminQuestionDelete(quizId, questionId, token);

  save();
  return res.status(200).json(response);
});

app.delete('/v2/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = Number(req.params.quizId);
  const questionId = Number(req.params.questionId);
  const response = adminQuestionDelete(quizId, questionId, token);

  save();
  return res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const token = req.body.token;
  const quizId = Number(req.params.quizId);
  const questionId = Number(req.params.questionId);
  const response = adminQuestionDuplicate(quizId, questionId, token);

  save();
  return res.status(200).json(response);
});

app.post('/v2/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = Number(req.params.quizId);
  const questionId = Number(req.params.questionId);
  const response = adminQuestionDuplicate(quizId, questionId, token);

  save();
  return res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;
  const response = adminQuizQuestionUpdate(quizId, questionId, token, questionBody);

  save();
  return res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token') as string;
  const { questionBody } = req.body;
  adminQuizQuestionUpdate(quizId, questionId, token, questionBody);
  save();
  return res.status(200).json({});
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, newPosition } = req.body;
  const response = adminQuizQuestionMove(quizId, questionId, token, newPosition);
  save();
  return res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token') as string;
  const { newPosition } = req.body;
  const response = adminQuizQuestionMove(quizId, questionId, token, newPosition);
  save();
  return res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token') as string;
  const { imgUrl } = req.body;
  const response = adminQuizThumbnailUpdate(quizId, token, imgUrl);
  save();
  return res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const response = adminQuizGetSessionStatus(token, quizId, sessionId);
  save();
  return res.json(response);
});

app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = playerReturnMessages(playerId);
  save();
  return res.json(response);
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { message } = req.body;
  const response = playerSendChatMessage(playerId, message);
  save();
  return res.json(response);
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  const response = playerJoin(sessionId, name);
  save();
  return res.status(200).json(response);
});

app.get('/v1/player/:playerId', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);

  const response = playerStatus(playerId);
  save();
  return res.status(200).json(response);
});

app.get('/v1/player/:playerId/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const questionposition = parseInt(req.params.questionposition);
  const response = playerQuestionInfomation(playerId, questionposition);
  save();
  return res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const { autoStartNum } = req.body;
  const response = adminSessionStart(token, quizId, autoStartNum);
  save();
  return res.status(200).json(response);
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const answerIds = req.body.answerIds;

  const response = playerAnswerSubmit(answerIds, playerId, questionPosition);
  save();
  return res.json(response);
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const response = playerAnswerResult(playerId, questionPosition, false);

  save();
  return res.json(response);
});

app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  const response = playerFinalResults(playerId);
  save();
  return res.json(response);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const response = adminQuizSessions(token, quizId);
  save();
  return res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const { action } = req.body;
  const response = adminUpdateSession(quizId, sessionId, token, action);
  save();
  return res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const response = adminQuizSessionResults(quizId, sessionId, token);
  save();
  return res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const filepath = adminQuizSessionResultsCsv(quizId, sessionId, token);
  const fileUrl = `http://localhost:${PORT}/${filepath}`;
  save();
  res.json({ url: fileUrl });
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
    0. You have defined routes below (not above) this middleware in server.ts
    1. You have not implemented the route ${req.method} ${req.path}
    2. There is a typo in either your test or server, e.g. /posts/list in one
      and, incorrectly, /post/list in the other
    3. You are using ts-node (instead of ts-node-dev) to start your server and
      have forgotten to manually restart to load the new changes
    4. You've forgotten a leading slash (/), e.g. you have posts/list instead
    of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
