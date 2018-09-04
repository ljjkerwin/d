import './style.scss'

import React from 'react';
import { render } from 'react-dom';
import classNames from 'classnames';

import throttleDebounce from 'modules/utils/throttleDebounce';




class BulletScreen {
	constructor(conf = {}) {
		if (!conf.wrapDom) throw Error('wrapDom 缺失');
		conf.wrapWidth = conf.wrapDom.clientWidth;
		conf.rowNum || (conf.rowNum = 4);
		conf.rowHeight || (conf.rowHeight = 20);
		conf.oneRoundTime || (conf.oneRoundTime = 5000);
		conf.render || (conf.render = text => text);
		
		this.conf = conf;
		this.isPlay = true;
		this.bulletQueue = [];

		// 初始化可用行状态
		let startTop = (conf.wrapDom.clientHeight - (conf.rowNum - 1) * conf.rowHeight - 28) / 2;
		let rows = [];
		for (let i = 0; i < conf.rowNum; i++) {
			rows.push({
				top: startTop + i * conf.rowHeight,
				Bullets: [],
			})
		}
		this.rows = rows;


		this.newLayer();
	}

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
		const now = Date.now(),
			oneRoundTime = this.conf.oneRoundTime + 1666; // 加*取相对安全的单程时间

		this.rows.forEach(row => {
			row.Bullets = row.Bullets.filter(Bullet => {
				if (now - Bullet.startTime > oneRoundTime) {
					Bullet.remove();
					return false;
				} else {
					return true;
				}
			})
		})

		
		if (this.bulletQueue.length) {
			// 获取可用行
			const canUseRows = [];
			this.rows.forEach((row, index) => {
				// 当前行为空
				if (!row.Bullets.length) {
					canUseRows.push(index);

				} else {
					let last = row.Bullets[row.Bullets.length - 1];
					// 如果最后一条弹幕已开始，立即插入待开始弹幕
					if (last.startTime) {
						canUseRows.push(index);
					}
				}
			})

			while (canUseRows.length && this.bulletQueue.length) {
				const ranRowIndex = canUseRows.splice(parseInt(Math.random() * canUseRows.length, 10), 1);
				const row = this.rows[ranRowIndex];
				const preBullet = row.Bullets[row.Bullets.length - 1];
				const bullet = this.bulletQueue.shift();
				const Bullet = this.newBullet({
					data: bullet,
					preBullet,
					top: row.top,
				});
				row.Bullets.push(Bullet);
			}
		}

		let hasInitedBullet = false;
		this.rows.forEach(row => {
			row.Bullets.forEach(Bullet => {
				hasInitedBullet = true;
				Bullet.judgeIfRun();
			});
		})

		if (hasInitedBullet) {
			this.handleInsertWork();
		}
	}, 1000)

	cleanTimer = null

	handleCleanWork = () => {
		if (!this.cleanTimer) {
			this.cleanTimer = setTimeout(this.cleanWorker, 1000);
		}
	}

	cleanWorker = () => {
		this.cleanTimer = null;
		if (!this.isPlay) return;

		const now = Date.now(),
			oneRoundTime = this.conf.oneRoundTime + 1666; // 加*取相对安全的单程时间
		let hasRunningBullet = false, // 有正在运行的弹幕
			hasCompleteBullet = false; // 有已完成的弹幕

		this.rows.forEach(row => {
			row.Bullets = row.Bullets.filter(Bullet => {
				if (now - Bullet.startTime > oneRoundTime) {
					Bullet.remove();
					hasCompleteBullet = true;
					return false;
				} else {
					hasCompleteBullet = true;
					return true;
				}
			})
		})

		if (hasRunningBullet) {
			this.handleInsertWork();
		}

		if (hasCompleteBullet) {
			this.handleCleanWork();
		}
	}

	newBullet({data, preBullet, top}) {
		const dom = document.createElement('div');
		dom.className = 'bullet';
		dom.style = ` top: ${top}px`;
		dom.innerHTML = data.content;
		this.Layer.appendChild(dom);

		const wrap = this;
		const Bullet = {
			dom,
			isRun: false,
			finalLeft: undefined,
			curLeft: 0,
			initAnimation() {
				const conf = wrap.conf;
				const domWidth = this.dom.clientWidth;
				const totalDistance = domWidth + conf.wrapWidth;

				// 下一条显示不会追到尾部的间隔
				this.runNextBulletInterval = (domWidth + 10) / totalDistance * conf.oneRoundTime;
				// 上一条结束前不会追上的间隔
				this.catchUpPreBulletInterval = conf.oneRoundTime - conf.wrapWidth * conf.oneRoundTime / totalDistance;

				this.finalLeft = -totalDistance;
			},
			judgeIfRun() {
				if (!this.isRun) {
					// 前面没有弹幕，或距离前面弹幕为安全距离，开始运行生命周期
					if (!preBullet || Date.now() - preBullet.startTime >= Math.max(preBullet.runNextBulletInterval, this.catchUpPreBulletInterval)) {
						this.isRun = true;
						this.play();
					}
				}
			},
			play() {
				const timeUsed = this.timeUsed || 0;

				this.dom.style.transition = `transform ${wrap.conf.oneRoundTime - timeUsed}ms linear`;
				this.dom.style.webkitTransform = `translate3d(${this.finalLeft}px,0,0)`;

				this.startTime = Date.now() - timeUsed;
				this.timeUsed = undefined;
			},
			remove() {
				data = null;
				preBullet = null;
				this.dom.remove();
			}
		}
		Bullet.initAnimation();
		return Bullet;
	}

	newLayer() {
		const dom = document.createElement('div');
		dom.style = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; overflow: hidden;';
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


		for (let i = 0 ; i< 10;i ++) {
			bs.addBullet({
				content: Math.random()
			});
		}	
		


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



