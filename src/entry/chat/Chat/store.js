import { combineReducers, createStore, applyMiddleware, compose } from 'redux'; // 35k
import keyMirror from 'keymirror';
// import Immutable, { Map } from 'immutable'; // 140k
import createLogger from 'redux-logger'; // 25k


// actionType constance
export const actionTypes = keyMirror({
  CHANGE_STATUS: null,

  INIT_ME: null,
  UPDATE_ME: null,

  REQUEST_MESSAGES: null,
  UNSHIFT_MESSAGES: null,
  PUSH_MESSAGE: null,
  UPDATE_MESSAGES: null,
  REMOVE_MESSAGES: null,
});


// reducers
const reducers = combineReducers({
  status,
  me,
  messages,
  actionType,
});


function status(state = 'init', action) {
  switch (action.type) {
    case actionTypes.REQUEST_MESSAGES:
      return 'pending';
    case actionTypes.UNSHIFT_MESSAGES:
      return '';
    case actionTypes.CHANGE_STATUS:
      return action.status;
    case actionTypes.INIT_ME:
      return '';
    default:
      return state;
  }
}

function me(state = null, action) {
  switch (action.type) {
    case actionTypes.INIT_ME:
      return initMe(state, action.me);
    case actionTypes.UPDATE_ME:
      return updateMe(state, action.me);
    default:
      return state;
  }
}

function messages(state = [], action) {
  switch (action.type) {
    case actionTypes.UNSHIFT_MESSAGES:
      return unshiftMessages(state, action.messages);
    case actionTypes.PUSH_MESSAGE:
      return pushMessage(state, action.message);
    case actionTypes.UPDATE_MESSAGES:
      return updateMessages(state, action.messages);
    case actionTypes.REMOVE_MESSAGES:
      return removeMessages(state, action.messages);
    default:
      return state;
  }
}

function actionType(state, action) {
  return action.type;
}



function initMe(state, me) {
  return me;
}

function updateMe(state, me) {
  return Object.assign(state, me);
}

function unshiftMessages(state, messages) {
  return messages.concat(state);
}

function pushMessage(state, message) {
  let newState = state.concat([message]);
  return newState;
}

function updateMessages(state, messages) {
  let index;
  messages.forEach(msg => {
    index = findMessageIndex(state, msg.id);
    Object.assign(state[index], msg);
  });
  return state;
}

function removeMessages(state, messages) {
  let index;
  messagses.forEach(msg => {
    index = findMessageIndex(state, msg.id);
    state.splice(index, 1);
  });
  return state;
}

function findMessageIndex(messages, id) {
  let len = messages && messages.length || 0;
  for (let i = 0; i < len; i++) {
    if (messages[i].id == id) {
      return i;
    }
  }
}



// middleware
const middleWare = [];
const enhances = [];

if (true) {
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhances.push(window.__REDUX_DEVTOOLS_EXTENSION__());
  } else if (window.Symbol) {
    let logger = createLogger();
    middleWare.push(logger);
    enhances.unshift(applyMiddleware(logger));
  }
}


// create store
export default createStore(reducers, compose(...enhances));
