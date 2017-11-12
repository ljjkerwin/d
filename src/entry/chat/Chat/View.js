import './style.scss';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Status from './components/Status';
import MessageList from './components/MessageList';
import InputBox from './components/InputBox';

import * as actions from './actions';
import GV from './globalVariables';
import { getUrlParams, scrollBox, screenLogger } from 'modules/utils';



const $win = $(window);
const $body = $(document.body);
const log = screenLogger();


class View extends Component {
  constructor(props) {
    super(props);
    this.handleMessageListScroll = this.handleMessageListScroll.bind(this);
  }

  render() {
    let { status, user, messages } = this.props;

    let messageListStyle = {bottom: GV.isMobile ? '50px' : '164px'};

    return (
      <div id="chat">

        <div className="message-list-wrap-wrap" style={messageListStyle}
          ref="listww"
          onScroll={this.handleMessageListScroll}>
          <div className="message-list-wrap"
            ref="listw">

            <Status
              status={status} />
            <MessageList
              user={user}
              messages={messages} />

          </div>
        </div>

        <InputBox
          isMobile={GV.isMobile} />

      </div>
    );
  }

  componentDidMount() {

    // 模拟获取用户信息
    setTimeout(() => {
      actions.initMe({
        username: 'Kerwin',
      });

      actions.requestMessages(10);
    }, 500);

  }

  componentWillUpdate() {

    if (/UNSHIFT_MESSAGES/.test(this.props.actionType)) {
      if (GV.firstRenderMessage) return;

      // 向上插入消息后，恢复位置（前）
      let list = document.querySelector('.message-list');
      this.list = list;
      if (!list) return;

      GV.loadMoreSwitch = false;
      let listww = this.refs.listww;

      this.listHeight = list.offsetHeight;
      this.totalHeight = listww.scrollHeight;
      this.scrollTop = listww.scrollTop;
      let visibleHeight = listww.clientHeight;
      this.listBottom = this.totalHeight - this.scrollTop - visibleHeight;

      list.style.bottom = - this.listBottom + GV.inputBoxHeight + 'px';
      list.style.position = 'fixed';
    }
  }

  componentDidUpdate() {

    let actionType = this.props.actionType;
    if (/PUSH_MESSAGE/.test(actionType)) {
      if (GV.isBottom) {
        scrollBox.scrollToBottom(this.refs.listww, 300);
      }
    } else if (/UNSHIFT_MESSAGES/.test(actionType)) {
      if (!GV.firstRenderMessage) {
        // 向上插入消息后，恢复位置（后）
        if (!this.list) return;
        let list = this.list,
            listw = this.refs.listw,
            listww = this.refs.listww,
            _listHeight = list.offsetHeight - this.listHeight;
        listw.style.minHeight = this.totalHeight + _listHeight + 'px';
        setTimeout(() => {
          listww.scrollTop = this.scrollTop + _listHeight;
          list.style.position = '';
          list.style.bottom = 0;
          listw.style.minHeight = '';
          GV.loadMoreSwitch = true;
        }, 10)

      } else {
        scrollBox.skipToBottom(this.refs.listww);
        GV.firstRenderMessage = false;
      }
    }
  }

  handleMessageListScroll() {
    if (GV.loadMoreSwitch && this.refs.listww.scrollTop === 0) {
      actions.requestMessages();
    }

    let isBottom = scrollBox.isBottom(this.refs.listww, 10);
    GV.isBottom = isBottom;
  }
}


export default connect(state => state)(View);
