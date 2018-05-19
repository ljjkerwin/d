const body = document.body;


export default {

  isBottom(box = body, bottom = 0) {
    return box.scrollTop + box.clientHeight >= box.scrollHeight - bottom;
  },

  skipToBottom(box, scrollTop = 999999) {
    box.scrollTop = scrollTop;
  },

  scrollToBottom(box, time, callback) {
    return this.scrollToY(box, box.scrollHeight, time, callback);
  },

  /**
   * box: 带autoscroll属性的盒子，dom对象
   * scrollEnd: 将要滚动到的高度
   * time: 动画时间
   */
  scrollToY(box, scrollEnd, time, callback) {
    time || (time = 400);
    let scrollBegin = box.scrollTop;
    let dist = box.scrollTop - scrollEnd;
    let count = Math.ceil(time / 40);
    let distInt = Math.ceil(dist / count);
    let Int = setInterval(function() {
      scrollBegin = scrollBegin - distInt;
      box.scrollTop = scrollBegin;
      if (!--count) {
        box.scrollTop = scrollEnd;
        clearInterval(Int);
        callback && callback();
      }
    }, 40);
  },

  scrollToX(box, scrollEnd, time, callback) {
    time || (time = 200);
    // 起始点
    let scrollBegin = box.scrollLeft;
    // 需要滚动的距离
    let _scroll = scrollEnd - scrollBegin;
    let count = Math.ceil(time / 40);
    let distInt = Math.ceil(_scroll / count);
    let Int = setInterval(function() {
      scrollBegin += distInt;
      box.scrollLeft = scrollBegin;
      if (!--count) {
        box.scrollLeft = scrollEnd;
        clearInterval(Int);
        callback && callback();
      }
    }, 40);
  },
}