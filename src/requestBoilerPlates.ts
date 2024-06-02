import request from 'sync-request-curl';
import config from './config.json';
const port = config.port;
const url = config.url;
const baseUrl = `${url}:${port}/v1`;
const v2baseUrl = `${url}:${port}/v2`;

function requestAdminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    baseUrl + '/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizCreate(token: string, name: string, description: string) {
  const res = request(
    'POST',
    baseUrl + '/admin/quiz',
    {
      json: {
        token: token,
        name: name,
        description: description
      },
      timeout: 1000
    }
  );

  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizCreate(token: string, name: string, description: string) {
  const res = request(
    'POST',
    v2baseUrl + '/admin/quiz',
    {
      headers: {
        token: token
      },
      json: {
        name: name,
        description: description
      },
      timeout: 1000
    }
  );

  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminUserDetails(token: string) {
  const res = request(
    'GET',
    baseUrl + '/admin/user/details',
    {
      qs: {
        token: token,
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminUserDetails(token: string) {
  const res = request(
    'GET',
    v2baseUrl + '/admin/user/details',
    {
      headers: {
        token: token
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    baseUrl + '/admin/user/details',
    {
      json: {
        token: token,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    v2baseUrl + '/admin/user/details',
    {
      headers: {
        token: token
      },
      json: {
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizList(token: string) {
  const res = request(
    'GET',
    baseUrl + '/admin/quiz/list',
    {
      qs: {
        token: token
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizList(token: string) {
  const res = request(
    'GET',
    v2baseUrl + '/admin/quiz/list',
    {
      headers: {
        token: token
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizRemove(token: string, quizId: number) {
  const res = request(
    'DELETE',
    baseUrl + '/admin/quiz/' + quizId,
    {
      qs: {
        token: token
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizRemove(token: string, quizId: number) {
  const res = request(
    'DELETE',
    v2baseUrl + '/admin/quiz/' + quizId,
    {
      headers: {
        token: token
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizTrash(token: string) {
  const res = request(
    'GET',
    baseUrl + '/admin/quiz/trash',
    {
      qs: {
        token: token
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizTrash(token: string) {
  const res = request(
    'GET',
    v2baseUrl + '/admin/quiz/trash',
    {
      headers: {
        token: token
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    baseUrl + '/admin/auth/login',
    {
      json: {
        email: email,
        password: password,
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminAuthLogout(token: string) {
  const res = request(
    'POST',
    baseUrl + '/admin/auth/logout',
    {
      json: {
        token: token,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminAuthLogout(token: string) {
  const res = request(
    'POST',
    v2baseUrl + '/admin/auth/logout',
    {
      headers: {
        token: token,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuestionCreate (quizId: number, token: string, questionBody: object) {
  const res = request(
    'POST',
    baseUrl + '/admin/quiz/' + quizId + '/question',
    {
      json: {
        token: token,
        questionBody: questionBody,
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuestionCreate (quizId: number, token: string, questionBody: object) {
  const res = request(
    'POST',
    v2baseUrl + '/admin/quiz/' + quizId + '/question',
    {
      headers: {
        token: token,
      },
      json: {
        questionBody: questionBody,
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizTransfer(quizId: number, token: string, userEmail: string) {
  const res = request(
    'POST',
    baseUrl + '/admin/quiz/' + quizId + '/transfer',
    {
      json: {
        token: token,
        userEmail: userEmail,
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizTransfer(quizId: number, token: string, userEmail: string) {
  const res = request(
    'POST',
    v2baseUrl + '/admin/quiz/' + quizId + '/transfer',
    {
      headers: {
        token: token,
      },
      json: {
        userEmail: userEmail,
      },
      timeout: 1000
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizInfo(token: string, quizId: number) {
  const res = request(
    'GET',
    baseUrl + '/admin/quiz/' + quizId,
    {
      qs: {
        token: token,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizInfo(token: string, quizId: number) {
  const res = request(
    'GET',
    v2baseUrl + '/admin/quiz/' + quizId,
    {
      headers: {
        token: token,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizNameUpdate(token: string, quizId: number, name: string) {
  const res = request(
    'PUT',
    baseUrl + '/admin/quiz/' + quizId + '/name',
    {
      json: {
        token: token,
        name: name
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizNameUpdate(token: string, quizId: number, name: string) {
  const res = request(
    'PUT',
    v2baseUrl + '/admin/quiz/' + quizId + '/name',
    {
      headers: {
        token: token
      },
      json: {
        name: name
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizDescriptionUpdate(token: string, quizId: number, description: string) {
  const res = request(
    'PUT',
    baseUrl + '/admin/quiz/' + quizId + '/description',
    {
      json: {
        token: token,
        description: description
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizDescriptionUpdate(token: string, quizId: number, description: string) {
  const res = request(
    'PUT',
    v2baseUrl + '/admin/quiz/' + quizId + '/description',
    {
      headers: {
        token: token
      },
      json: {
        description: description
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestClear() {
  request(
    'DELETE',
    baseUrl + '/clear',
    {}
  );
  return {};
}

function requestAdminUserPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const res = request(
    'PUT',
    baseUrl + '/admin/user/password',
    {
      json: {
        token: token,
        oldPassword: oldPassword,
        newPassword: newPassword
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminUserPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const res = request(
    'PUT',
    v2baseUrl + '/admin/user/password',
    {
      headers: {
        token: token
      },
      json: {
        oldPassword: oldPassword,
        newPassword: newPassword
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizQuestionUpdate(quizId: number, questionId: number, token: string, questionBody: object) {
  const res = request(
    'PUT',
    baseUrl + '/admin/quiz/' + quizId + '/question/' + questionId,
    {
      json: {
        token: token,
        questionBody: questionBody
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizQuestionUpdate(quizId: number, questionId: number, token: string, questionBody: object) {
  const res = request(
    'PUT',
    v2baseUrl + '/admin/quiz/' + quizId + '/question/' + questionId,
    {
      headers: {
        token: token,
      },
      json: {
        questionBody: questionBody
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizQuestionMove(quizId: number, questionId: number, token: string, newPosition: number) {
  const res = request(
    'PUT',
    baseUrl + '/admin/quiz/' + quizId + '/question/' + questionId + '/move',
    {
      json: {
        token: token,
        newPosition: newPosition
      },
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizQuestionMove(quizId: number, questionId: number, token: string, newPosition: number) {
  const res = request(
    'PUT',
    v2baseUrl + '/admin/quiz/' + quizId + '/question/' + questionId + '/move',
    {
      headers: {
        token: token,
      },
      json: {
        newPosition: newPosition
      },
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuestionDelete(quizId: number, questionId: number, token: string) {
  const res = request(
    'DELETE',
    baseUrl + '/admin/quiz/' + quizId + '/question/' + questionId,
    {
      qs: {
        token: token,
      },
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuestionDelete(quizId: number, questionId: number, token: string) {
  const res = request(
    'DELETE',
    v2baseUrl + '/admin/quiz/' + quizId + '/question/' + questionId,
    {
      headers: {
        token: token,
      },
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuestionDuplicate(quizId: number, questionId: number, token: string) {
  const res = request(
    'POST',
    baseUrl + '/admin/quiz/' + quizId + '/question/' + questionId + '/duplicate',
    {
      json: {
        token: token,
      },
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuestionDuplicate(quizId: number, questionId: number, token: string) {
  const res = request(
    'POST',
    v2baseUrl + '/admin/quiz/' + quizId + '/question/' + questionId + '/duplicate',
    {
      headers: {
        token: token,
      },
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizRestore(quizid: number, token: string) {
  const res = request(
    'POST',
    baseUrl + '/admin/quiz/' + quizid + '/restore',
    {
      json: {
        quizId: quizid,
        token: token
      }
    }
  );

  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizRestore(quizid: number, token: string) {
  const res = request(
    'POST',
    v2baseUrl + '/admin/quiz/' + quizid + '/restore',
    {
      headers: {
        token: token
      },
      json: {
        quizId: quizid
      }
    }
  );

  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizTrashEmpty(token: string, quizIds: number[]) {
  const res = request(
    'DELETE',
    baseUrl + '/admin/quiz/trash/empty',
    {
      qs: {
        token: token,
        quizIds: quizIds
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function v2requestAdminQuizTrashEmpty(token: string, quizIds: number[]) {
  const res = request(
    'DELETE',
    v2baseUrl + '/admin/quiz/trash/empty',
    {
      headers: {
        token: token
      },
      qs: {
        quizIds: quizIds
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizThumbnailUpdate(token: string, quizId: number, imgUrl: string) {
  const res = request(
    'PUT',
    baseUrl + '/admin/quiz/' + quizId + '/thumbnail',
    {
      json: {
        quizId: quizId,
        imgUrl: imgUrl,
      },
      headers: {
        token: token,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizGetSessionStatus(token: string, quizId: number, sessionId: number) {
  const res = request(
    'GET',
    baseUrl + '/admin/quiz/' + quizId + '/session/' + sessionId,
    {
      json: {
        quizId: quizId,
        sessionId: sessionId,
      },
      headers: {
        token: token,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestPlayerReturnMessages(playerId: number) {
  const res = request(
    'GET',
    baseUrl + '/player/' + playerId + '/chat',
    {
      json: {
        playerId: playerId,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestPlayerSendChatMessage(playerId: number, message: { messageBody: string }) {
  const res = request(
    'POST',
    baseUrl + '/player/' + playerId + '/chat',
    {
      json: {
        message: message,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestPlayerJoin(sessionId: number, name: string) {
  const res = request(
    'POST',
    baseUrl + '/player/join',
    {
      json: {
        sessionId: sessionId,
        name: name
      },
    });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestPlayerAnswerSubmit(answerIds: number[], playerId: number, questionPosition: number) {
  const res = request(
    'PUT',
    baseUrl + '/player/' + playerId + '/question/' + questionPosition + '/answer',
    {
      json: {
        answerIds: answerIds
      },
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminSessionStart(token: string, quizId: number, autoStartNum: number) {
  const res = request(
    'POST',
    baseUrl + '/admin/quiz/' + quizId + '/session/start',
    {
      headers: {
        token: token
      },
      json: {
        autoStartNum: autoStartNum,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestPlayerStatus(playerId: number) {
  const res = request(
    'GET',
    baseUrl + '/player/' + playerId,
    {
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminQuizSessions(token: string, quizId: number) {
  const res = request(
    'GET',
    baseUrl + '/admin/quiz/' + quizId + '/sessions',
    {
      headers: {
        token: token
      },
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestAdminUpdateSession(quizId: number, sessionId: number, token: string, action: string) {
  const res = request(
    'PUT',
    baseUrl + '/admin/quiz/' + quizId + '/session/' + sessionId,
    {
      headers: {
        token: token
      },
      json: {
        action: action,
      }
    });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestPlayerQuestionInfomation(playerId: number, questionposition: number) {
  const res = request(
    'GET',
    baseUrl + '/player/' + playerId + '/question/' + questionposition,
    {
      json: {
        playerId: playerId,
        questionposition: questionposition
      },
    });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestPlayerAnswerResult(playerId: number, questionPosition: number) {
  const res = request(
    'GET',
    baseUrl + '/player/' + playerId + '/question/' + questionPosition + '/results',
    {
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestPlayerFinalResult(playerId: number) {
  const res = request(
    'GET',
    baseUrl + '/player/' + playerId + '/results',
    {
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestQuizSessionFinalResults(token: string, quizId: number, sessionId: number) {
  const res = request(
    'GET',
    baseUrl + '/admin/quiz/' + quizId + '/session/' + sessionId + '/results',
    {
      headers: {
        token: token,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

function requestQuizSessionFinalResultsCsv(token: string, quizId: number, sessionId: number) {
  const res = request(
    'GET',
    baseUrl + '/admin/quiz/' + quizId + '/session/' + sessionId + '/results/csv',
    {
      headers: {
        token: token,
      }
    }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

export {
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminUserDetails,
  requestAdminUserDetailsUpdate,
  requestAdminQuizList,
  requestAdminQuizRemove,
  requestAdminQuizTrash,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminQuestionCreate,
  requestAdminQuizTransfer,
  requestAdminQuizInfo,
  requestAdminQuizNameUpdate,
  requestAdminQuizDescriptionUpdate,
  requestPlayerJoin,
  requestPlayerStatus,
  requestPlayerQuestionInfomation,
  requestClear,
  requestAdminUserPasswordUpdate,
  requestAdminQuizQuestionUpdate,
  requestAdminQuizQuestionMove,
  requestAdminQuestionDelete,
  requestAdminQuestionDuplicate,
  requestAdminQuizRestore,
  requestAdminQuizTrashEmpty,
  v2requestAdminQuizTrash,
  v2requestAdminAuthLogout,
  v2requestAdminUserPasswordUpdate,
  v2requestAdminQuizQuestionUpdate,
  v2requestAdminQuizQuestionMove,
  v2requestAdminUserDetails,
  v2requestAdminUserDetailsUpdate,
  v2requestAdminQuizRestore,
  v2requestAdminQuizTrashEmpty,
  v2requestAdminQuizCreate,
  v2requestAdminQuestionCreate,
  v2requestAdminQuizInfo,
  requestAdminQuizThumbnailUpdate,
  requestAdminQuizGetSessionStatus,
  requestPlayerReturnMessages,
  requestPlayerSendChatMessage,
  v2requestAdminQuizNameUpdate,
  v2requestAdminQuizDescriptionUpdate,
  v2requestAdminQuestionDelete,
  v2requestAdminQuestionDuplicate,
  v2requestAdminQuizList,
  v2requestAdminQuizTransfer,
  v2requestAdminQuizRemove,
  requestPlayerAnswerSubmit,
  requestPlayerAnswerResult,
  requestPlayerFinalResult,
  requestAdminSessionStart,
  requestAdminQuizSessions,
  requestAdminUpdateSession,
  requestQuizSessionFinalResults,
  requestQuizSessionFinalResultsCsv,
};
