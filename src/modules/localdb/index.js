/**
 * @dependencies Promise, Object.assign
 * 
 * @config {
 *    dbName
 *    tbName
 *    duration 消息保存时间 毫秒
 * }
 */
import localforage from 'localforage';

export default class Localdb {
  constructor(config) {
    typeof config === 'object' || (config = {});
    this.duration = config.duration || 0;
    this.maxLength = config.maxLength || 200;

    this.hasInit = false;
    this.switch = true;
    this.localforage = null;
    this.dataPromise = null;
    this.dataArr = [];
    this.oldestMessage = null;
    this.lastestMessageTime = 0;  // 不含发送错误的

    config.dbName && this.init(config.dbName, config.tbName);
  }

  init(dbName, tbName) {
    if (!dbName) {
      throw new Error('localforage needs a dbName!');
    }
    let config = { name: dbName };
    if (tbName) config.storeName = tbName;
    this.localforage = localforage.createInstance(config);
    this.hasInit = true;
  }

  add(msg) {
    if (!this.switch || !this.hasInit) return;
    
    let key = String(msg.id);
    if (!key) return;
    return this.localforage.setItem(key, msg);
  }

  update(msgsArr) {
    if (!this.switch || !this.hasInit) return;
    if (!(msgsArr instanceof Array)) return;

    msgsArr.forEach(msg => {
      if (!msg.id) return;
      this.localforage.getItem(msg.id).then(pre => {
        // 不存在则写入，存在则更新
        if (!pre) {
          return this.localforage.setItem(msg.id, msg);
        } else {
          Object.assign(pre, msg);
          return this.localforage.setItem(msg.id, pre);
        }
      });
    });
  }

  find(num = 10, message = null) {
    if (!this.switch || !this.hasInit) return Promise.resolve([]);
    return this.getAndSort()
      .then(dataArr => {
        let end = dataArr.length;
        
        // 截取指定id的message前num条
        if (message) {
          dataArr.map((value, index) => {
            if (message.id === value.id) {
              end = index;
            }
          });
        }

        let start = end - num;
        start < 0 && (start = 0);

        return dataArr.slice(start, end);
      });
  }

  getAndSort() {
    if (!this.dataPromise) {
      let { dataArr, localforage } = this;

      this.dataPromise = localforage
        .iterate((value, key, index) => {
          dataArr.push(value);
        })
        .then(() => {
          // 递增排序
          dataArr.sort((left, right) => {
            return left.send_time - right.send_time;
          });

          // 清除超过最大数量的消息
          if (dataArr.length > this.maxLength) {
            let _ = dataArr.splice(0, dataArr.length - this.maxLength);
            _.forEach(v => localforage.removeItem(v.id));
          }

          // 清除早于最早时间的消息
          let nowTime = Date.now(),
              oldestTime = nowTime - this.duration;
          for (let k = 0; k < dataArr.length; k++) {
            if (dataArr[k].send_time >= oldestTime) {
              let _ = dataArr.splice(0, k);
              _.forEach(v => localforage.removeItem(v.id));
              break;
            }
          }

          for (let i = dataArr.length - 1; i >= 0; i--) {
            if (dataArr[i].status !== 'error') {
              this.lastestMessageTime = dataArr[i].send_time;
              break;
            }
          }

          for (let j = 0; j < dataArr.length; j++) {
            if (dataArr[j].status !== 'error') {
              this.oldestMessage = dataArr[j];
              break;
            }
          }

          return dataArr;
        });
    }
    return this.dataPromise;
  }

  remove(id) {
    return this.localforage.removeItem(id);
  }

  clear() {
    return this.localforage.clear();
  }
}
