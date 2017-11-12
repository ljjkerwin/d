import React, { Component } from 'react';

export default class MessageList extends Component {
  render() {
    let { user, messages } = this.props;

    return (
      <div className="message-list">
        {messages.map(msg => {
          return (
            <div className="message-item" key={msg.id}>{msg.id}:{msg.content}</div>
          );
        })}
      </div>
    );
  }
}