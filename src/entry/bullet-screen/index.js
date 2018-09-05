import './style.scss'

import React from 'react';
import { render } from 'react-dom';

import throttleDebounce from 'modules/utils/throttleDebounce';




class BulletScreen {
	constructor(conf = {}) {
		if (!conf.wrapDom) throw Error('wrapDom 缺失');
		conf.wrapWidth = conf.wrapDom.clientWidth;
		conf.wrapRectLeft = conf.wrapDom.getBoundingClientRect().left;
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

		setTimeout(() => {
			this.handleInsertWork();
		}, 10);
	}

	play() {
		if (this.isPlay) return;
		this.isPlay = true;

		this.rows.forEach(row => {
			row.Bullets.forEach(Bullet => {
				Bullet.play();
			})
		});

		this.handleInsertWork();
	}

	pause(cleanQueue = false) {
		if (!this.isPlay) return;
		this.isPlay = false;

		this.rows.forEach(row => {
			row.Bullets.forEach(Bullet => {
				Bullet.pause();
			})
		});

		if (cleanQueue) {
			this.bulletQueue = [];
		}
	}

	handleInsertWork = throttleDebounce(() => {
		if (!this.isPlay) return;

		const now = Date.now(),
			oneRoundTime = this.conf.oneRoundTime + 1333; // 加*取相对安全的单程时间

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

		let hasBullet = false;
		this.rows.forEach(row => {
			row.Bullets.forEach(Bullet => {
				hasBullet = true;
				Bullet.judgeIfPlay();
			});
		})

		if (hasBullet) {
			this.handleInsertWork();
		}
	}, 1000)

	newBullet({data, preBullet, top}) {
		const dom = document.createElement('div');
		dom.className = 'bullet';
		dom.style = ` top: ${top}px`;
		dom.innerHTML = data.content;
		this.Layer.appendChild(dom);

		const conf = this.conf;
		const Bullet = {
			dom,
			isPlay: false,
			finalLeft: undefined,
			timeUsed: 0,
			initAnimation() {
				const domWidth = this.dom.clientWidth;
				const totalDistance = domWidth + conf.wrapWidth;

				// 下一条显示不会追到尾部的间隔
				this.runNextBulletInterval = (domWidth + 10) / totalDistance * conf.oneRoundTime;
				// 上一条结束前不会追上的间隔
				this.catchUpPreBulletInterval = conf.oneRoundTime - conf.wrapWidth * conf.oneRoundTime / totalDistance;

				this.finalLeft = -totalDistance;
			},
			judgeIfPlay() {
				if (!this.isPlay) {
					// 前面没有弹幕，或距离前面弹幕为安全距离，开始运行生命周期
					if (!preBullet || Date.now() - preBullet.startTime >= Math.max(preBullet.runNextBulletInterval, this.catchUpPreBulletInterval)) {
						this.play();
					}
				}
			},
			play() {
				if (this.isPlay) return;
				this.isPlay = true;
				
				requestAnimationFrame(() => {
					this.dom.style.transition = `transform ${conf.oneRoundTime - this.timeUsed}ms linear`;
					this.dom.style.webkitTransform = `translate3d(${this.finalLeft}px,0,0)`;
					this.startTime = Date.now() - this.timeUsed;
				})
			},
			pause() {
				if (!this.isPlay) return;
				this.isPlay = false;

				requestAnimationFrame(() => {
					const rect = this.dom.getBoundingClientRect();
					this.dom.style.transform = `translate3d(${this.finalLeft + rect.width + (rect.left - conf.wrapRectLeft)}px,0,0)`;
					this.timeUsed = Date.now() - this.startTime;
				})
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
			wrapDom: document.getElementById('wrap'),
			rowNum: 10,
		});

		this.bs = bs


		for (let i = 0 ; i< 15;i ++) {
			const ran  = Math.random()
			bs.addBullet({
				content: (ran+'').slice(0, ran*20)
			});
		}
		setInterval(() => {
			for (let i = 0 ; i< 15;i ++) {
				const ran  = Math.random()
				bs.addBullet({
					content: (ran+'').slice(0, ran*20)
				});
			}	
		}, 3000)

		


	}

	render() {
		return <div>
			

			<div id="wrap">
			
			</div>
1
1
1
1
1
1
			<div onClick={() => {
				this.bs.play();
			}}>play</div>
			1
			1
			1
			1
			1
			1
			1
			1
			<div onClick={() => {
				this.bs.pause(true);
			}}>pause</div>

		</div>
	}
}



render(
<App/>
, document.getElementById('root'))



