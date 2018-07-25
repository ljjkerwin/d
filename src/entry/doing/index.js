import './style.scss'

import React from 'react';
import { render } from 'react-dom';
import classNames from 'classnames';

import throttleDebounce from 'modules/utils';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import BulletScreen from './bullet-screen';




class App extends React.Component {

	state = {
		currentTime: 0,
	}

	componentDidMount() {
		
		demo.style.transition= `transform 10000ms linear`;
		demo.style.transform= `translate3d(${-600}px,0,0)`;
		
		return
		this.setState({
			currentTime: this.state.currentTime
		})
		setTimeout(() => {
			this.setState({
				currentTime: this.state.currentTime + 1
			})
		}, 1000)
		setInterval(() => {
			this.setState({
				currentTime: this.state.currentTime + 3
			})
		}, 5000)
	}

	render() {
		return <div>
			

			<div id="wrap">
				<div class="co-bullet" id="demo">
				<div className="content">35r23324523423</div></div>
			
			{/* <BulletScreen 
				currentTime={this.state.currentTime}
			/> */}
			
			
			</div>
			<div id="oo" style={{wordBreak: 'break-all'}}>
			</div>
			
		</div>
	}
}



render(
<App/>
, document.getElementById('root'))
