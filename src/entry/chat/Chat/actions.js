import store, { actionTypes } from './store';
const { getState, dispatch } = store;
import Localdb from 'modules/localdb';


// 本地消息缓存
const messageCache = new Localdb('customerService');


/**
 * 发送消息：
 * 1.判断发送权限
 * 2.修饰消息
 * 3.存本地
 * 4.请求
 * 5.成功则插入消息并更新缓存
 */
export function sendMessage(message) {
  let me = getMe();
  if (!me) {
    return;
  }

  if (!message || !message.type || !message.content) {
    console.warn(message, 'message格式错误，参考 { type: "text", content: "123" }');
    return;
  }

  message.id = Math.random() + '';
  message.send_time = Math.random();
  

  // 非图像消息先存本地，复制备份保存
  if (!/image/.test(message.type)) {
    let _message = Object.assign({}, message, {status: 'error'}); // 用于重发
    messageCache.add(_message);
  }

  pushMessage(message);
  sendMessage_request(message);
}

function sendMessage_request(message) {
  console.log('send:', message);
  setTimeout(() => {
    Object.assign(message, {status: ''});
    updateMessages([message]);
    messageCache.update([message]);
  }, 500);
}



/**
 * 请求消息
 */
const defaultRequestNum = 10;
const requestBuffer = { // 请求结果缓存
  buffer: [],
  unshift(messages) {
    if (!messages || !messages.length) return;
    this.buffer = messages.concat(this.buffer);
  },
  render() {
    unshiftMessages(this.buffer);
    this.buffer = [];
  },
};

let hasMessages_localHistory = true;    // 本地历史
let hasMessages_serverHistory = true;   // 服务器历史


export function requestMessages(num = defaultRequestNum) {
  if (getStatus() !== '') return;

  dispatch({
    type: actionTypes.REQUEST_MESSAGES
  });

  if (hasMessages_localHistory) {
    requestMessages_localHistory(num);
  }
}

function requestMessages_localHistory(num = defaultRequestNum) {
  messageCache.find(num, getOldestMessage())
    .then(messages => {

      requestBuffer.unshift(messages);
      if (messages.length === num) {
        requestBuffer.render();
      } else {
        requestBuffer.render();
        console.log('localHistory read over');
        changeStatus('end');
        hasMessages_localHistory = false;
      }
    });
}




/**
 * actions
 */
export function unshiftMessages(messages) {
  dispatch({
    type: actionTypes.UNSHIFT_MESSAGES,
    messages
  });
}

function pushMessage(message) {
  dispatch({
    type: actionTypes.PUSH_MESSAGE,
    message
  });
}

function updateMessages(messages) {
  dispatch({
    type: actionTypes.UPDATE_MESSAGES,
    messages
  });
}

export function initMe(me) {
  dispatch({
    type: actionTypes.INIT_ME,
    me
  });
}

export function updateMe(me) {
  dispatch({
    type: actionTypes.UPDATE_ME,
    me
  });
}

export function changeStatus(status) {
  dispatch({
    type: actionTypes.CHANGE_STATUS,
    status
  });
}


/**
 * functions
 */
function getMe() {
  let state = getState();
  return state.me;
}

function getStatus() {
  return getState().status;
}

function getOldestMessage(messages = requestBuffer) {
  if (messages.length) {
    return messages[0];
  }
  messages = getState().messages;
  if (messages.length) {
    return messages[0];
  }
  return false;
}