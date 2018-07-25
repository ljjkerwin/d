
import React, { Fragment } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import throttleDebounce from 'modules/utils/throttleDebounce';
import animation from './animation';



let headImgUrl = 'https://img.qlchat.com/qlLive/userHeadImg/A346CA7B-7F38-4069-A949-5E90333859F8-S72MJ3AD2I.jpg@60w_60h_1e_1c_2o'


export default class BulletScreen extends React.Component {
	static defaultProps = {
        getBulletsInterval: 30,
        roleList: [],
	}

	conf = {
        // 显示区域宽度
        wrapWidth: 0,   
        // 每条弹幕的行高
        lineHeight: 0,
        // 每条弹幕的滚动时间
		oneRoundTime: 10000,
	}

	state = {
		// 弹幕组件开关
		isSwitchOn: true,
		// 是否显示弹幕背景
		isShowMask: false,
		// 弹幕背景显示动画已跑完
		hasShowMask: false,
		isShowSendBar: false,

		// 弹幕请求状态
		getBulletsStatus: '', // pending
		preGetBulletsStartTime: undefined,
		preGetBulletsEndTime: undefined,

		// 发送弹幕请求状态
		addBulletStatus: '',

        // 弹幕播放的状态
		isPlay: false,

		// 所有弹幕对象池
		bulletMap: {},
		// 待显示弹幕id队列
		bulletWaitIds: [],
        // 每行的状态
		rowsStatus: [
			/**
			{ 
				top,
				bullets: [
					{
						id,
						top,
						startTime,
					}
				]
			}
			 */
		],

		bulletInputText: '',
	}

	componentWillMount() {window.bs = this
		// 读取开关状态
		let isSwitchOn = true;
		try {
			if (localStorage.getItem('BULLET_SCREEN_SWITCH_OFF') > 0) {
				isSwitchOn = false;
			}
		} catch (e) {}
		this.setState({
			isSwitchOn,
		})
    }
    
    componentDidMount() {
        this.play()
    }

	componentWillReceiveProps(nextProps) {
		if (!this.state.isSwitchOn) return;
        if (this.props.currentTime !== nextProps.currentTime) {
            this.handleUpdateCurrentTime(Math.floor(nextProps.currentTime));
        }
    }
    
    componentWillUpdate() {
        // this.__=Date.now()
    }
    componentDidUpdate() {
        // log(Date.now() - this.__)
    }

	render() {
		let { bulletMap, rowsStatus, isPlay } = this.state;
		let now = Date.now();

		return <Fragment>
            {
                this.state.isSwitchOn &&
                <TransitionGroup>
                    {
                        this.state.isShowMask &&
                        <CSSTransition
                            classNames="co-bullet-screen"
                            timeout={{enter: 1000, exit: 300}}
							onEntered={this.onEntered}
							onExit={this.onExited}
                        >
							<div className="co-bullet-screen"
								ref={r => this.refWrap = r}>
                                <div className="reference" ref={r => this.refRefer = r}></div>
                                <div className="bullet-screen-layer">
                                    {rowsStatus.map(row => {
										return row.bullets.map((bulletStatus, index) => {
											let preBulletStatus = index ? row.bullets[index - 1] : null;
											return <Bullet
												key={bulletStatus.id}
												data={bulletMap[bulletStatus.id]}
												status={bulletStatus}
												preBulletStatus={preBulletStatus}
												conf={this.conf}
												isPlay={isPlay}
												now={now}
												roleList={this.props.roleList}
											/>;
										})
									})}
                                </div>
                            </div>
                        </CSSTransition>
                    }
                </TransitionGroup>
            }

			{
				this.props.bulletScreenControllerWrap &&
					createPortal(
						<div className="co-bullet-screen-controller">
							<div className={`btn-bullet on-log${this.state.isSwitchOn ? ' active' : ''}`}
								 onClick={this.state.isSwitchOn ? this.onClickSwitchOff : this.onClickSwitchOn}
								 data-log-region={this.state.isSwitchOn ? "bullet-screen-btn-off" : "bullet-screen-btn-on"}
							><span></span></div>
							{
								this.state.isSwitchOn &&
								<div className="btn-edit on-log" 
									onClick={this.showSendBar}
									data-log-region="bullet-screen-btn-edit"
								><span></span></div>
							}
						</div>,
						this.props.bulletScreenControllerWrap
					)
			}
			{
				(this.state.isShowSendBar || this.state.bulletInputText) && this.props.mainContainer &&
				createPortal(
					<div className="co-bullet-screen-send-bar" ref={r => this.inputBoxWrap = r}>
						<input type="text"
						       value={this.state.bulletInputText}
						       onChange={this.bulletInputChangeHandle}
						       onBlur={this.bulletInputBlurHandle}
						       placeholder={this.props.topicInfo.isBanned === 'Y' ? "本话题已被禁言" : "看来你想发个弹幕~"}
							   autoFocus={true}
							   disabled={this.props.topicInfo.isBanned === 'Y'}
						/>
						<div className="send-btn on-log"
							onClick={this.sendBullet}
							data-log-region="bullet-screen-btn-send"
						>发送</div>
					</div>,
					this.props.mainContainer
				)
			}
        </Fragment>
	}

	showSendBar = () => {
		this.setState({isShowSendBar: !this.state.isShowSendBar}, () => {
			setTimeout(() => {
				this.inputBoxWrap.scrollIntoView(true);
			}, 200)
		})
	}

	bulletInputChangeHandle(e){
		this.setState({
			bulletInputText: e.target.value
		})
	}

	bulletInputBlurHandle(){
		this.hideSendBarTimer = setTimeout(() => {
			this.setState({
				isShowSendBar: false
			});
		}, 300)
	}

    sendBullet(){
		// 音频互动已结束情况下，只在本地发送
		if (this.props.topicInfo.style === 'audio' && this.props.topicInfo.status === 'ended') {
			let content = this.state.bulletInputText + '';
			if (!content.length) return;
			this.addBullet({
				id: Math.random(),
				content,
				isCurrentSend: true,
				headImgUrl: this.props.userInfo.headImgUrl,
			}, true)

			this.setState({
				bulletInputText: ''
			})
			return;
		}

		if (this.state.addBulletStatus === 'pending') return;
		let content = this.state.bulletInputText + '';
		if (!content.length) return;

		this.setState({addBulletStatus: 'pending'});
		request({
			url: '/api/wechat/bullet/add',
			method: 'POST',
			body: {
				liveId: this.props.topicInfo.liveId,
				topicId: this.props.topicInfo.id,
				style: this.props.topicInfo.style,
				playTime: Math.floor(this.props.currentTime || 0),
				content,
			}
		}).then(res => {
			if (res.state.code) throw Error(res.state.msg);

			let bullet = res.data.bullet;

			// 发送成功后高亮显示出来
			this.addBullet({
				...bullet,
				playTime: 0,
				isCurrentSend: true,
			}, true)

			this.setState({
				bulletInputText: ''
			});

			window.toast('发送成功');
		}).catch(err => {
			console.error(err);
			window.toast(err.message);
		}).then(() => {
			this.setState({addBulletStatus: ''});
		})

    }

    handleUpdateCurrentTime(nextCurrentTime) {
		let { preGetBulletsStartTime, preGetBulletsEndTime = 0 } = this.state;
		/**
		 * 后移大于5秒，视作向后拖动
		 * 前移大于5秒，视作向前拖动
		 * 其他微小拖动或正常时间流动，每interval秒请求一次
		 */
		if (nextCurrentTime > preGetBulletsEndTime || preGetBulletsStartTime === undefined) {
			// console.log(`${nextCurrentTime}s`, '完全清空队列，尝试请求新弹幕');
			this.cleanWaitQueue();
			this.getBullets(nextCurrentTime);
		} else if (nextCurrentTime > this.props.currentTime + 5) {
			// console.log(`${nextCurrentTime}s`, '向后拖动，部分清空队列');
			this.cleanWaitQueue(nextCurrentTime);
			this.setState({preGetBulletsStartTime: nextCurrentTime});
		} else if (this.props.currentTime > nextCurrentTime + 5) {
			// console.log(`${nextCurrentTime}s`, '向前拖动，清空队列，尝试请求新弹幕');
			this.cleanWaitQueue();
			this.getBullets(nextCurrentTime, true);
		}
    }

	/**
	 * 插入弹幕到等待队列
	 * @param {object|array} bullet
	 * @param {boolean} isUnshift 是否从头部插入
	 */
	addBullet = (bullet, isUnshift) => {
        if (!bullet || bullet.length === 0 || !this.state.isSwitchOn) return;

		let bulletMap = {...this.state.bulletMap};
		let bulletWaitIds = [...this.state.bulletWaitIds];

		if (isUnshift) {
			if (!bulletMap[bullet.id]) {
				bulletMap[bullet.id] = bullet;
				bulletWaitIds.unshift(bullet.id);
			}
		} else {
			(bullet instanceof Array ? bullet : [bullet]).forEach(item => {
				if (bulletMap[item.id]) return;
				bulletMap[item.id] = item;
				bulletWaitIds.push(item.id);
			})
		}

		this.setState({
			bulletMap,
			bulletWaitIds,
		}, () => {
			this.handleInsertWork();
		})
	}

	/**
	 * 暂停弹幕播放接口
	 */
    pause = () => {
        this.setState({isPlay: false})
    }

	/**
	 * 恢复播放状态接口
	 */
    play = () => {
        this.state.isPlay || this.setState({isPlay: true}, () => {
            this.handleInsertWork()
            this.handleCleanWork()
        })
	}

	/**
	 * 请求弹幕数据
	 * @param {boolean} isForward 是否向前拖动的请求
	 */
	getBullets = (startTime = 0, isForward) => {
		if (!this.state.isSwitchOn) return;
		if (this.state.getBulletsStatus === 'pending') return;

		let getBulletsInterval = this.props.getBulletsInterval;
		// 为防止频繁向前拖动引起的大量数据请求，此值为true时，请求时间段会变小
		if (isForward) {
			getBulletsInterval = 20;
		}

		let endTime = startTime + getBulletsInterval;
		if (startTime < 2) startTime = 0; // 向左拖到尽头时极端情况

		this.setState({getBulletsStatus: 'pending'});
        
        Promise.resolve().then(res => {



            let list = [
                {id: Math.random(), headImgUrl, content: '阿斯顿发斯蒂芬撒地方'},
            ]
			this.addBullet(list);
			

		}).catch(err => {
			console.error(err);
		}).then(() => {
			this.setState({
				getBulletsStatus: '',
				preGetBulletsStartTime: startTime,
				preGetBulletsEndTime: endTime,
			});
		})
	}

    onClickSwitchOn = () => {
        this.setState({
            isSwitchOn: true
        })
		try { localStorage.setItem('BULLET_SCREEN_SWITCH_OFF', '') } catch(e) {}
    }

    onClickSwitchOff = () => {
        this.setState({
            isSwitchOn: false,
			isShowMask: false,
			hasShowMask: false,
			bulletMap: {},
			bulletWaitIds: [],
			rowsStatus: [],

			getBulletsStatus: '',
			preGetBulletsStartTime: undefined,
			preGetBulletsEndTime: undefined,
		})
		try { localStorage.setItem('BULLET_SCREEN_SWITCH_OFF', '1') } catch(e) {}
    }

    /**
     * 清空等待队列
     */
    cleanWaitQueue = currentTime => {
		let bulletMap = {...this.state.bulletMap};
		let bulletWaitIds = [...this.state.bulletWaitIds];

		let len = bulletWaitIds.length;
		let i = 0;
		for (; i < len; i++) {
			if (bulletMap[bulletWaitIds[i]].playTime >= currentTime) {
				break;
			}
			delete bulletMap[bulletWaitIds[i]];
		}
		bulletWaitIds.splice(0, i);
		this.setState({
			bulletMap,
			bulletWaitIds,
		})
    }

	handleInsertWork = throttleDebounce(() => {
        // console.log('insert work')
		if (!this.state.isPlay) return;
		if (!this.state.bulletWaitIds.length) return;

		let { currentTime } = this.props;
		let { bulletMap, bulletWaitIds, rowsStatus } = this.state;

		// 弹幕背景还没显示 并 将有弹幕需要显示，提前显示弹幕背景，此处2是弹幕显示动画的时间
		if (!this.state.isShowMask && !(bulletMap[bulletWaitIds[0]].playTime - 1 > currentTime)) {
			this.setState({
                isShowMask: true
			});
		}
		// 没跑完弹幕背景显示动画，先不插入
		if (!this.state.hasShowMask) return this.handleInsertWork();

		let canUseRows = [];
		let now = Date.now();

		// 计算可用行
		rowsStatus.forEach((row, index) => {
			// 当前行为空
			if (!row.bullets.length) {
				canUseRows.push(index);

			} else {
				let last = row.bullets[row.bullets.length - 1];
				// 如果最后一条弹幕已开始，立即插入待开始弹幕
				if (last.startTime) {
					canUseRows.push(index);
				}
			}
		})

		// 没空闲位置，预约下次执行
		if (canUseRows.length === 0) return this.handleInsertWork();

		bulletWaitIds = [...bulletWaitIds];
		rowsStatus = [...rowsStatus];

		// 为空位置分配等待状态的弹幕
		let canUseRowsLen = canUseRows.length;
		for (let i = 0; i < canUseRowsLen; i++) {
			// 如果currentTime还没达到弹幕开始时间，返回
			if (bulletMap[bulletWaitIds[0]].playTime > currentTime) break;

			let ran = parseInt(Math.random() * canUseRows.length, 10);
			let ranRowIndex = canUseRows[ran];
			let bulletId = bulletWaitIds.shift();

			rowsStatus[ranRowIndex] = {
				...rowsStatus[ranRowIndex],
				bullets: [...rowsStatus[ranRowIndex].bullets, {
					id: bulletId,
					top: rowsStatus[ranRowIndex].top,
				}]
			};
			// console.log('insert:', bulletId);
			if (!bulletWaitIds.length) break;
			canUseRows.splice(ran, 1);
		}

		this.setState({
			bulletWaitIds,
			rowsStatus,
		}, () => {
			// 等待队列里还有数据时，预约下次读取
			this.state.bulletWaitIds.length && this.handleInsertWork();
			this.handleCleanWork();
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
        // console.log('clean work:', this.state.bulletMap, this.state.bulletWaitIds, this.state.rowsStatus)
        this.cleanTimer = null;
        if (!this.state.isPlay) return;

		let bulletMap = {...this.state.bulletMap},
			rowsStatus = [...this.state.rowsStatus],
			now = Date.now(),
			oneRoundTime = this.conf.oneRoundTime + 300, // 加*取相对安全的单程时间
			hasRunningBullet = false, // 有正在运行的弹幕
			hasCompleteBullet = false; // 有已完成的弹幕

		rowsStatus.forEach(row => {
			row.bullets = row.bullets.filter(bulletStatus => {
				if (now - bulletStatus.startTime > oneRoundTime) {
					delete bulletMap[bulletStatus.id];
					hasCompleteBullet = true;
					// console.log('clean:', bulletStatus.id)
					return false;
				} else {
					hasRunningBullet = true;
				}
				return true;
			});
		});

		if (hasCompleteBullet) {
			this.setState({
				bulletMap,
				rowsStatus,
			}, () => {
				this.handleInsertWork();
				this.handleCleanWork();
			});
		}

		// 显示区里还有弹幕的话，预约下次清理
		if (hasRunningBullet) {
			this.handleCleanWork();
		}
    }

    onEntered = () => {
		this.state.isShowMask && this.setState({
			hasShowMask: true,
		}, () => {
			this.initSize(this.play);
		})
	}
	
	onExited = () => {
		this.state.isShowMask || this.setState({
			hasShowMask: false,
		})
	}

    initSize = cb => {
		let wrapWidth = this.refWrap.clientWidth;
		let wrapHeight = this.refWrap.clientHeight;
		let wrapViewLeft = this.refWrap.getBoundingClientRect().left;
		let itemHeight = this.refRefer.clientHeight;
		let lineHeight = 1.5 * itemHeight;
		let rowNum = 1;
		let startTop = (wrapHeight - (rowNum - 1) * lineHeight - itemHeight) / 2;

		this.conf = {
			...this.conf,
			wrapWidth,
			wrapViewLeft,
			lineHeight,
        }

        // 初始化可用行状态
		let rowsStatus = [];
		for (let i = 0; i < rowNum; i++) {
			rowsStatus[i] = {
				top: startTop + i * lineHeight,
				bullets: [],
			}
		}

		this.setState({
			rowsStatus,
		}, cb)
	}

	onClickBulletScreenBg = () => {
		// 如果在输入框focus状态下，不操作
		if (this.state.isShowSendBar) return;

		// 屏幕上没内容，允许点击隐藏弹幕背景
		let count = 0;
		this.state.rowsStatus.forEach(row => {
			row.bullets.forEach(bulletStatus => {
				count++;
			})
		})
		if (count) return;

		this.setState({
			isShowMask: false,
		})
	}
}



class Bullet extends React.Component {
	isRun = false

	state = {
		finalLeft: null,
		curLeft: 0,
		curRoundTime: null,
		hasRole: false,
		content: '',
	}

	render() {
		let { data, status, conf } = this.props;
		let { finalLeft, curLeft, curRoundTime } = this.state;
		
		let style = {
			top: status.top,
			transition: `transform ${curRoundTime === null ? conf.oneRoundTime : curRoundTime}ms linear`,
			transform: `translate3d(${curLeft === null ? finalLeft : curLeft}px,0,0)`,
		}

		let cln = classNames('co-bullet', {
			'role-user': this.state.hasRole,
			'current-user': data.isCurrentSend,
		})

		return (
			<div
				className={cln}
				style={style}
				ref={r => this.dom = r}
			>
				<div className="avatar" style={{backgroundImage: `url(${imgUrlFormat(data.userHeadImg || data.headImgUrl || data.createByHeadImgUrl, '@60w_60h_1e_1c_2o')})`}}></div>
				<div className="content">{this.state.content}</div>
			</div>
		);
	}

	componentWillMount() {
		this.initData();
	}

	componentDidMount() {
		this.initAnimation();
	}

	componentDidUpdate() {
		this.judgeIfRun();
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.isPlay !== nextProps.isPlay) {
			if (nextProps.isPlay === false) {
				this.pause();
			} else {
				this.play();
			}
		}

		if (this.props.roleList !== nextProps.roleList) {
			this.setState({
				hasRole: nextProps.roleList.indexOf(`${nextProps.data.userId || nextProps.data.createBy}`) >= 0
			})
		}
	}

	initData = () => {
		// 截取content
		let content = String(this.props.data.content);
		content.length > 30 && (content = content.slice(0,30) + '...');

		// 判断身份
		let hasRole = this.props.roleList.indexOf(`${this.props.data.userId || this.props.data.createBy}`) >= 0;

		this.setState({
			content,
			hasRole,
		})
	}

	initAnimation = () => {
		let conf = this.props.conf;
		let domWidth = this.dom.clientWidth;
		let totalDistance = domWidth + conf.wrapWidth;

		// 下一条显示不会追到尾部的间隔
		this.props.status.runNextBulletInterval = (domWidth + 10) / totalDistance * conf.oneRoundTime;
		// 上一条结束前不会追上的间隔
		this.props.status.catchUpPreBulletInterval = conf.oneRoundTime - conf.wrapWidth * conf.oneRoundTime / totalDistance;
this.props.status.finalLeft =  -totalDistance
		this.setState({
			finalLeft: -totalDistance,
		}, () => {
            
		    this.judgeIfRun();
        })
	}

	judgeIfRun = () => {
		if (!this.isRun && this.props.isPlay) {
			// 前面没有弹幕，或距离前面弹幕为安全距离，开始运行生命周期
		 	if (!this.props.preBulletStatus || Date.now() - this.props.preBulletStatus.startTime >= Math.max(this.props.preBulletStatus.runNextBulletInterval, this.props.status.catchUpPreBulletInterval)) {
				this.isRun = true;
				this.play();
			}
		}
	}

	pause = () => {
		if (!this.isRun) return;

		this.setState({
			curLeft: this.state.finalLeft + this.dom.clientWidth + (this.dom.getBoundingClientRect().left - this.props.conf.wrapViewLeft)
		});

		// 记录已经过了播放了多久动画
		this.props.status.timeUsed = Date.now() - this.props.status.startTime;
	}

	play = () => {
		if (!this.isRun) return;
		const timeUsed = this.props.status.timeUsed || 0;

		this.setState({
			curRoundTime: this.props.conf.oneRoundTime - timeUsed,
			curLeft: null
		})
			// 修正开始时间
			this.props.status.startTime = Date.now() - timeUsed;
            this.props.status.timeUsed = undefined;
            
            
            // animation.add({
            //     startValue: 0,
            //     endValue:this.props.status.finalLeft,
            //     duration: 5000,
            //     step: (v) => {
            //         this.dom.style.transform = `translate3d(${v}px,0,0)`;
            //         // this.dom.style.left = `${v}px`;
            //     }
            // });
	}
}





export const imgUrlFormat = (url, formatStrQ = "?x-oss-process=image/resize,m_fill,limit_0,h_64,w_64", formatStrW = "/64") => {

    if (/(img\.qlchat\.com)/.test(url)) {
        url = url.replace(/@.*/, "") + formatStrQ;
    } else if (/(wx\.qlogo\.cn\/mmopen)/.test(url)) {
        url = url.replace(/(\/(0|132|64|96)$)/, formatStrW);
    };

    return url;
};


function log(c) {
    oo.innerHTML =c + ','+oo.innerHTML;
}