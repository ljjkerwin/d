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
		
	

function addBullet(id) {
	let b = document.createElement('div')
	b.className='co-bullet'

	b.innerHTML=`
	<div class="avatar"></div>
	<div class="content">35r23423</div>
	`

	document.getElementById(id).appendChild(b)

	setTimeout(() => {
		b.style.transition= `transform 5000ms linear`;
		b.style.transform= `translate3d(${-1150}px,0,0)`;
	},100)

}

setInterval(() => {
	addBullet('l1')
	// addBullet('l2')
},2000)



	}

	render() {
		return <div>
			

			<div id="wrap">
			
				<div id='l1' style={{position: 'absolute',width: '100%', top: 0}}></div>
				<div id='l2' style={{position: 'absolute',width: '100%', top: 100}}></div>
			
			</div>



			<div id="oo" style={{wordBreak: 'break-all'}}>
			</div>
			
		</div>
	}
}



render(
<App/>
, document.getElementById('root'))


