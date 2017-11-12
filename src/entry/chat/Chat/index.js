import 'modules/base-style';
import React, { Component } from 'react'; // 130k
import { render } from 'react-dom'; // 560k
import { Provider } from 'react-redux'; // 30k
import store from './store';
import View from './View';
import * as actions from './actions';


class Chat {
  constructor(el) {
    render(
      <Provider store={store}>
        <View />
      </Provider>,
      el
    );
  }

  sendMessage(message) {
    return actions.sendMessage(message);
  }
}


export default Chat;
window.Chat = Chat;