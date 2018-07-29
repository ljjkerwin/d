import './style.scss'

import React from 'react';
import { render } from 'react-dom';
import classNames from 'classnames';

import throttleDebounce from 'modules/utils/throttleDebounce';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
// import BulletScreen from './bullet-screen';











class BulletScreen {
	constructor(conf = {
		wrapDom,
		rowHeight: 20,
		oneRoundTime: 5000,
		render: text => text,
	}) {
		if (!conf.wrapDom) throw Error('wrapDom 缺失');
		conf.wrapWidth = conf.wrapDom.clientWidth;
		this.conf = conf;

		this.newLayer();
	}

	bulletQueue = []
	rows = []

	addBullet(bullet, isUnshift) {
		if (!bullet || bullet.length === 0) return;

		if (Array.isArray(bullet)) {
			this.bulletQueue = this.bulletQueue.concat(bullet);
		} else {
			isUnshift ? this.bulletQueue.unshift(bullet) : this.bulletQueue.push(bullet);
		}

		this.handleInsertWork();
	}

	handleInsertWork = throttleDebounce(() => {
		if (!this.bulletQueue.length) return;

		const bullet = this.bulletQueue.shift();
		const Bullet = this.newBullet(bullet);

		setTimeout(() => {

			Bullet.play();
		})
	}, 100)

	newBullet(data) {
		const dom = document.createElement('div');
		dom.style = 'position: absolute; transform: translate3d(0,0,0);';
		dom.innerHTML = data.content;
		this.Layer.appendChild(dom);
		const Bullet = {
			dom,
			play() {
				this.dom.style.transition = `transform ${5000}ms linear`;
				this.dom.style.transform = `translate3d(${400}px,0,0)`;
			}
		}
		return Bullet;
	}

	newLayer() {
		const dom = document.createElement('div');
		dom.style = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2';
		this.conf.wrapDom.appendChild(dom);
		this.Layer = dom;
	}

	unmount() {
		this.Layer.remove();
		this.Layer = null;
	}
}







class App extends React.Component {

	state = {
		currentTime: 0,
	}

	componentDidMount() {
		
		const bs = new BulletScreen({
			wrapDom: document.getElementById('wrap')
		});

		bs.addBullet({
			content: 234432234
		});


	}

	render() {
		return <div>
			

			<div id="wrap">
			
			</div>

		</div>
	}
}



render(
<App/>
, document.getElementById('root'))



