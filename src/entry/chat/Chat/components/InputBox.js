import './InputBox.scss';
import React, { Component } from 'react';
import 'paste.js';
import * as actions from '../actions';
import GV from '../globalVariables';



export default class InputBox extends Component {
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleSendClipboard = this.handleSendClipboard.bind(this);
    this.handleCancelClipboard = this.handleCancelClipboard.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  state = {
    imgDataCache: '',
  }

  render() {

    if (this.props.isMobile) {
      return this.renderMobile();
    } else {
      return this.renderPc();
    }
  }

  renderMobile() {
    return (
      <div className="input-box input-box-m">
        <label className="btn-default-l btn-img" htmlFor="input-image-m">图片</label>
        <input type="file" id="input-image-m" style={{display: 'none'}}
          onChange={this.handleFileChange} />
        <div className="input-wrap">
          <input type="text" placeholder="请输入内容"
            ref="input"
            onKeyUp={this.handleInput} />
        </div>
        <div className="btn-default btn-send" onClick={this.handleSend}>发送</div>
      </div>
    );
  }

  renderPc() {
    let { imgDataCache } = this.state;

    return (
      <div className="input-box input-box-pc">
        <div className="input-wrap">
          <textarea rows="5" placeholder="请输入内容"
            ref="input"
            onKeyUp={this.handleInput}></textarea>
        </div>
        
        <div className="btn-wrap">
          <label className="btn-default-l btn-img" htmlFor="input-image">图片</label>
          <input type="file" id="input-image" style={{display: 'none'}}
            onChange={this.handleFileChange} />
          <div className="btn-tips">截图后Ctrl+V发送图片</div>
          <div className="btn-default"
            onClick={testNotification} >测试浏览器通知</div>
          <div className="btn-default btn-send"
            onClick={this.handleSend} >发送</div>
        </div>

        {
          imgDataCache ?
          <div className="clipboard-wrap">
              <img className="clipboard-img"
                src={imgDataCache} />
            <div className="clipboard-tips">是否将此图片发至当前对话</div>
            <div className="clipboard-btn-wrap">
              <div className="btn-default-l"
                onClick={this.handleCancelClipboard} >取消</div>
              <div className="btn-default btn-send"
                onClick={this.handleSendClipboard} >发送</div>
            </div>
          </div>
          : null
        }
      </div>
    );
  }

  componentDidMount() {
    setTimeout(() => {
      let inputBoxEl = document.querySelector('.input-box');
      GV.inputBoxHeight = inputBoxEl && inputBoxEl.getBoundingClientRect().height || 0;
    }, 300)
    

    if (!this.props.isMobile) {
      $('.input-box-pc textarea').pastableTextarea();
      $('body').on('pasteImage', '.input-box-pc textarea', (ev, data) => {
        console.log("pasteImage: ", data);
        this.setState({
          imgDataCache: data.dataURL
        });
      })
    }
  }

  handleSend() {
    this.setState({
      imgDataCache: '',
    });

    let content = this.refs.input.value;

    if (!content) return;

    let message = {
      type: 'text',
      content,
    }

    this.refs.input.value = '';

    actions.sendMessage(message);
  }

  handleInput(e) {
    if (e.keyCode === 13) {
      this.handleSend();
    }
  }

  handleSendClipboard() {
    this.handleCancelClipboard();
  }

  handleCancelClipboard() {
    this.setState({
      imgDataCache: '',
    });
  }

  handleFileChange(e) {
    let file = e.target.files[0];
    if (!this.fileReader) {
      this.fileReader = new FileReader();
      this.fileReader.onload = e => {
        this.setState({
          imgDataCache: e.target.result
        });
      }
    }
    this.fileReader.readAsDataURL(file);
  }
}

function testNotification() {


  if (!window.Notification) {
    alert('不支持浏览器通知');
    return;
  }

  if (Notification.permission === 'denied') {
    alert('你已禁止通知权限');
  } else if (Notification.permission === 'default') {
    Notification.requestPermission(function (res) {
      console.log(res)
      new Notification('通知已开启')
    })
  } else if (Notification.permission === 'granted') {
    new Notification('测试通知')
  }

}

