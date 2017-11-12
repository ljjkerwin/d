import React, { Component } from 'react';
import * as actions from '../actions';


export default class Status extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    let status = this.props.status;

    return (
      <div className="chat-status" onClick={this.handleClick}>
        {getStatusString(status)}
      </div>
    );

    return null;
  }

  handleClick() {
    if (this.props.status !== '') return;
    actions.requestMessages();
  }
}


function getStatusString(status) {
  if (status === '') return '加载更多';
  return ({
    init: '加载中...',
    pending: 'loading',
    end: '加载完毕',
  })[status];
}