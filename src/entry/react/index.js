import './index.scss';
import React from 'react';
import { render } from 'react-dom';


class Item extends React.Component {
  componentWillMount() {
    console.log('mount')
  }
  render() {
    return (<div>{this.props.name}</div>)
  }
  componentWillUpdate() {
    console.log('update')
  }
  componentDidUpdate(nextProps) {
    console.log(this.props.name, nextProps.name)
  }
}


class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 1,
      arr: [
        {
          name: 1
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
            return (<Item key={item.name}
              {...item} />)
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



render(<View />, document.getElementById('app'));


