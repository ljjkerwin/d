export function getUrlParams() {
  let obj = {};
  let search = location.search.substring(1);
  search.replace(/(^|&)([^=&]+)=([^&]+)/g, function(a, b, key, val) {
  	obj[key] = val;
  })
  return obj;
}



export const device = {
  ua: window.navigator.userAgent || '',
  isIos() {
    return /iphone|ipad|ipod/i.test(this.ua);
  },
  isAndroid() {
    return /android/i.test(this.ua);
  },
  isMobile() {
    return /mobile/i.test(this.ua) || this.isIos() || this.isAndroid();
  },
  isPc() {
    return !this.isMobile();
  },
};


export const scrollBox = {
  body: document.body,

  isBottom(box = this.body, bottom = 0) {
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



export function screenLogger() {
  var div = document.createElement('div');
  div.setAttribute('style', 'position: fixed; z-index: 1000; right: 0; top: 0; width: 75%; max-height: 100%; overflow: auto; font-size: 12px;');
  document.body.appendChild(div);
  return function(str) {
    if (location.href.indexOf('ljjkerwin') > -1) return;
    if (typeof str === 'object') {
        str = JSON.stringify(str);
    }
    var _div = document.createElement('div');
    _div.setAttribute('style', 'border-bottom: 1px solid #ddd;');
    _div.innerHTML = str;
    div.appendChild(_div);
  }
}



/**
 * emojione表情转换
 */
export function convertEmojione(content) {
  if (typeof content === 'number') {
    content += '';
  }
  if (!content) {
    content = '';
  }
  return window.emojione ? emojione.unicodeToImage(content) : content;
}



/**
 * 过滤数字输入，保留特定位数小数
 */
export function numberInputFilter(num, fix = 2) {
  num = String(num);

  let match = num.match(fix ? new RegExp(`^((0|[1-9][0-9]*)(\\.\\d{0,${fix}})?)`) : /^(0|[1-9][0-9]*)/);

  return match ? match[1] : '';
}
