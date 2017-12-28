import 'modules/base-style';
import './index.scss';
import React from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import store from './store';

import * as actions from './actions';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 1,
      arr: [
        {
          name: 5
        },
        {
          name: 2
        },
        {
          name: 3
        },
      ]
    }
  }

  render() {
    let { arr } = this.state;

    return (
      <div>
        <div onClick={this.handleClick}>{this.state.num}</div>
        <div>
          {arr.map((item, index) => {
            return (
              <div key={index}>{item.name}</div>
            )
          })}
        </div>
      </div>
      
    );
  }

  handleClick = () => {
    let _arr = this.state.arr.concat([]);
    let _item = _arr.shift();
    _arr.push(_item)

    this.setState({
      num: this.state.num + 1,
      // arr: _arr
    })
  }
}




const mapStateToProps = state => {
  return state
}

const Container = connect(mapStateToProps)(App)

const root = document.createElement('div')
document.body.insertBefore(root, document.body.firstChild)
render(
  <Provider store={store}>
    <Container />
  </Provider>, 
  root
)


