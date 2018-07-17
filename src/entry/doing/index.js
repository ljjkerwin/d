import './style.scss'

import React from 'react';
import { render } from 'react-dom';
import classNames from 'classnames';

import throttleDebounce from 'modules/utils';
import { TransitionGroup, CSSTransition } from 'react-transition-group';


class BulletScreen extends React.Component {
	bulletQueue = []

	conf = {
        // 显示区域宽度
        wrapWidth: 0,   
        // 每条弹幕的行高
        lineHeight: 0,
        // 每条弹幕的滚动时间
		oneRoundTime: 5000,
	}

	state = {
        isShowMask: false,
        // 弹幕播放的状态
        isPlay: false,
        // 在显示弹幕的状态
		bulletsStatusMap: {
			// id: { row: 1, bullet }
        },
        // 在显示行的状态
		rowsStatus: [
			// { top: 50, inUse: 'id' }
		],
	}

	componentDidMount() {
        window.bs = this;

        // setTimeout(() => {
        //     for (let i=0; i< 20;i++){

        //         let r = Math.random();
        //         let content = (r + '').slice(0,4) +[...new Array(parseInt(r*16))].map(() => 1)
            
        //         bs.addBullet({id: r,content})
            
        //     }
        // }, 100)

    }

    onEntered = () => {
        this.initSize(this.play);
    }

    initSize = cb => {
		let wrapWidth = this.refWrap.clientWidth;
		let wrapHeight = this.refWrap.clientHeight;
		let itemHeight = this.refRefer.clientHeight;
		let lineHeight = 1.5 * itemHeight;
		let rowNum = 4;
		let startTop = (wrapHeight - (rowNum - 1) * lineHeight - itemHeight) / 2;

		this.conf = {
			...this.conf,
			wrapWidth,
			lineHeight,
        }

        // 初始化可用行状态
		let rowsStatus = [];
		for (let i = 0; i < rowNum; i++) {
			rowsStatus[i] = {
				top: startTop + i * lineHeight,
				inUse: ''
			}
		}

		this.setState({
			rowsStatus,
		}, cb)
	}

	render() {
		let { bulletsStatusMap, isPlay } = this.state;
		let bulletsDom = [];

		Object.values(bulletsStatusMap).map(status => {
			bulletsDom.push(
				<Bullet 
					key={status.bullet.id}
					data={status.bullet}
					status={status}
					conf={this.conf}
					isPlay={isPlay}
				/>
			)
		})

		return (
            <TransitionGroup>
                {
                    this.state.isShowMask &&
                    <CSSTransition
                        classNames="co-bullet-screen"
                        timeout={2000}
                        onEntered={this.onEntered}
                    >
                        <div className="co-bullet-screen" ref={r => this.refWrap = r}>
                            <div className="reference" ref={r => this.refRefer = r}></div>
                            <div className="bullet-screen-layer">
                                {bulletsDom}
                            </div>
                        </div>
                    </CSSTransition>
                }
            </TransitionGroup>
		)
	}

	addBullet = (bullet) => {
        if (!bullet) return;
        if (!this.state.isShowMask) {
            this.setState({
                isShowMask: true
            })
        }

		if (typeof bullet === 'array') {
			this.bulletQueue = this.bulletQueue.concat(bullet);
		} else {
			this.bulletQueue.push(bullet);
		}

		this.handleInsertWork();
    }
    
	handleInsertWork = throttleDebounce(() => {
        // console.log('insert work')
        if (!this.state.isPlay) return;

		let { rowsStatus, bulletsStatusMap } = this.state;
		let canUseRows = [];
		let now = Date.now();

		// 计算可用行
		rowsStatus.forEach((row, index) => {
			// 当前行为空，或当前行占用时间达到要求
			if (!row.inUse) {
				canUseRows.push(index);
			} else {
				let status = bulletsStatusMap[row.inUse];
				if (status) {
					if (status.timeUsed > status.nextInterval ||
						!status.timeUsed && now - status.startTime > status.nextInterval
					) {
						canUseRows.push(index);
					}
				}
			}
		})

        // 弹幕队列还有数据，继续步进读取
		this.bulletQueue.length && this.handleInsertWork();

		// 没位置或没数据，不执行
		if (canUseRows.length === 0) return;
		if (!this.bulletQueue.length) return;
		
		rowsStatus = [...rowsStatus];
		bulletsStatusMap = {...bulletsStatusMap};

		let canUseRowsLen = canUseRows.length;
		for (let i = 0; i < canUseRowsLen; i++) {
			let ran = parseInt(Math.random() * canUseRows.length, 10);
			let ranRowIndex = canUseRows[ran];
			let bullet =  this.bulletQueue.shift();

			rowsStatus[ranRowIndex] = {...rowsStatus[ranRowIndex], inUse: bullet.id};
			bulletsStatusMap[bullet.id] = {
				row: ranRowIndex,
				top: rowsStatus[ranRowIndex].top,
				startTime: now,
				bullet,
			};
            // console.log('insert:', bullet.id);
			canUseRows.splice(ran, 1);
			if (!this.bulletQueue.length) break;
        }
        
        this.handleCleanWork();

		this.setState({
			bulletsStatusMap,
			rowsStatus,
		});

	}, 1000)

	cleanTimer = null

	handleCleanWork = () => {
		if (!this.cleanTimer) {
			this.cleanTimer = setTimeout(this.cleanWorker, 1000);
		}
	}

	// 清除展示完的弹幕
	cleanWorker = () => {
        // console.log('clean work')
        this.cleanTimer = null;
        if (!this.state.isPlay) return;

		let bulletsStatusMap = {...this.state.bulletsStatusMap},
			rowsStatus = [...this.state.rowsStatus],
			now = Date.now(),
			oneRoundTime = this.conf.oneRoundTime + 100,
			hasRunningBullet = false,
			hasCompleteBullet = false;
		for (let i in bulletsStatusMap) {
			if (now - bulletsStatusMap[i].startTime > oneRoundTime) {
				rowsStatus[bulletsStatusMap[i].row].inUse = '';
				delete bulletsStatusMap[i];
				hasCompleteBullet = true;
				// console.log('clean:', i);
			} else {
				hasRunningBullet = true;
			}
		}

		if (hasCompleteBullet) {
			this.setState({
				bulletsStatusMap,
				rowsStatus
			});

			// 有空位的话，继续插入缓存队列里的弹幕
			this.handleInsertWork();
		}

		// 显示区里还有弹幕的话会定时清理
		if (hasRunningBullet) {
			return this.handleCleanWork();
		}
    }

    cleanQueue = () => {
        this.bulletQueue = [];
    }
    
    pause = () => {
        this.setState({isPlay: false})
    }

    play = () => {
        this.setState({isPlay: true}, () => {
            this.handleInsertWork()
            this.handleCleanWork()
        })
    }
}



class Bullet extends React.Component {
	state = {
		finalLeft: null,
		curLeft: null,
		curRoundTime: null,
	}

	render() {
		let { data, status, conf } = this.props;
		let { finalLeft, curLeft, curRoundTime } = this.state;

		let style = {
			top: status.top,
			transition: `left ${curRoundTime === null ? conf.oneRoundTime : curRoundTime}ms linear`,
			left: curLeft === null ? finalLeft : curLeft,
		}

		return (
			<div 
				className="co-bullet"
				style={style}
				ref={r => this.refDom = r}
			>
				<div className="avator"></div>
				<div className="content">{data.content}</div>
			</div>
		);
	}

	componentDidMount() {
		// 计算终点偏移值
		let domWidth = this.refDom.clientWidth;
		this.setState({
			finalLeft: -domWidth
		})
		// 计算下一个字幕所需间隔
		this.props.status.nextInterval = Math.round((domWidth + this.props.conf.lineHeight) / (domWidth + this.props.conf.wrapWidth) * this.props.conf.oneRoundTime);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.isPlay !== nextProps.isPlay) {
			if (nextProps.isPlay === false) {
				this.pause();
			} else {
				this.play();
			}
		}
	}

	pause = () => {
		let offsetLeft = this.refDom.offsetLeft;
		this.setState({
			curLeft: offsetLeft
		})
		this.props.status.timeUsed = Date.now() - this.props.status.startTime;
	}

	play = () => {
		this.setState({
			curRoundTime: this.props.conf.oneRoundTime - this.props.status.timeUsed,
			curLeft: null
		})
		this.props.status.startTime = Date.now() - this.props.status.timeUsed;
		this.props.status.timeUsed = undefined;
	}
}




render(
<div>
    <button style={{marginTop: 600}} onClick={toggle}>toggle</button>
    <button style={{marginTop: 600}} onClick={() => {bs.cleanQueue()}}>clean</button>
    <BulletScreen />

</div>
, document.getElementById('root'))

function toggle() {
    if (window.sw) {
        bs.play()
        window.sw=false
      
    } else {


        bs.pause()
        
        window.sw=true
    }
}