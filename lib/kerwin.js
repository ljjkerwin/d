/*-----------------------kerwin库-----------------------*/

/**
 * 事件委托
 */
function eventDelegate(el, type, selector, cb) {
  el.addEventListener(type, function (e) {
    var t = e.target;
    while (t !== el && t) {
      if (elMatchSelector(t, selector)) {
        return cb && cb.call(t, e);
      }
      t = t.parentNode;
    }
  })
}

/**
 * 检查el是否符合选择器
 * todo
 */
function elMatchSelector(el, selector) {
  if (!el) return false;
  if (el.className.indexOf(selector) >= 0) return true;
  return false;
}

//移动设备屏幕自适应
(function (win, doc) {
  responsive();
  win.addEventListener("resize", responsive);
  function responsive() {
    var docEl = doc.documentElement;
    var windowWidth = docEl.clientWidth;
    var designWidth = parseInt(docEl.getAttribute("data-designWidth")) || 750;
    if (windowWidth > designWidth) {
      windowWidth = designWidth;
    }
    docEl.style.fontSize = windowWidth * 100 / designWidth + "px";
  }
})(window, document);

//图片预加载
function preloadImages(arr, callback) {
  var imgArr = [];
  for (var i = 0; i < arr.length; i++) {
    imgArr[i] = new Image();
    imgArr[i].src = arr[i];
    if (callback) {
      imgArr[i].onload = function () {
        callback.call(imgArr[i]);
      }
    }
  }
}

//缩写console方法
function log(msg) {
  // console.log.apply(console,arguments);
  console.log(msg);
}

function dir(msg) {
  console.dir(msg);
}

//获取节点
function getId(id) {
  return document.getElementById(id);
}

function getTag(tagname) {
  return document.getElementsByTagName(tagname);
}

function getIdTag(id, tagname) {
  return document.getElementById(id).getElementsByTagName(tagname);
}

function getClass(classname) {
  if (typeof document.getElementsByClassName === "function")
    return document.getElementsByClassName(classname);
  var arr = new Array();
  var allEle = document.getElementsByTagName("*");
  fnEach(allEle, function (ele) {
    try {
      if (ele.className == classname) {
        arr.push(ele);
      }
    } catch (e) { }
  })
  return arr;
}

//获取事件对象
function getTarget(e) {
  return e.target || e.srcElement;
}

//遍历一维或二维数组对象，并执行方法
function fnEach(arr, fn) {
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    if (typeof arr[i].length == "undefined") {
      fn(arr[i]);
    } else {
      var len1 = arr[i].length;
      for (var j = 0; j < len1; j++) {
        fn(arr[i][j]);
      }
    }
  }
}

//隐藏任意数量节点
function hideEle() {
  function hide(ele) {
    ele.style.display = "none";
  }
  fnEach(arguments, hide);
}

//显示任意数量节点
function showEle() {
  function show(ele) {
    ele.style.display = "";
  }
  fnEach(arguments, show);
}

//事件绑定
function addEvent(ele, type, fn) {
  if (ele.addEventListener) {
    ele.addEventListener(type, fn, false);
  } else if (ele.attachEvent) {
    ele.attachEvent("on" + type, fn);
  } else {
    ele["on" + type] = fn;
  }
}

//事件移除
function rmEvent(ele, type, fn) {
  if (ele.removeEventListener) {
    ele.removeEventListener(type, fn);
  } else if (ele.detachEvent) {
    ele.detachEvent("on" + type, fn);
  } else {
    ele["on" + type] = null;
  }
}

//一次执行函数
function oneTimeEvent(ele, type, fn) {
  function _fn() {
    fn();
    rmEvent(ele, type, _fn);
  }
  addEvent(ele, type, _fn);
}

//节点缓慢消失
function fadeOut(ele, time, callback) {
  var op;
  if (typeof getComputedStyle == "undefined") {
    var sub = ele.currentStyle.filter;
    sub = sub.substring(14, sub.length - 1);
    op = sub ? sub : 100;
    _op = op * 40 / time;
    var int = setInterval(function () {
      op -= _op;
      ele.style.filter = "alpha(opacity=" + op + ")";
      if (op < 0) {
        clearInterval(int);
        ele.style.filter = "alpha(opacity=0)";
        ele.style.display = "none";
        if (callback) callback();
      }
    }, 40);
  } else {
    op = getComputedStyle(ele, null).opacity;
    _op = op * 40 / time;
    var int = setInterval(function () {
      op -= _op;
      ele.style.opacity = op;
      if (op < 0) {
        clearInterval(int);
        ele.style.opacity = 0;
        ele.style.display = "none";
        if (callback) callback();
      }
    }, 40);
  }
}

//节点缓慢显示
function fadeIn(ele, time, callback) {
  var opS, opC = 0,
    opE;
  ele.style.display = "";
  if (typeof getComputedStyle == "undefined") {
    opE = 100;
    _op = opE * 40 / time;
    var int = setInterval(function () {
      opC += _op;
      ele.style.filter = "alpha(opacity=" + opC + ")";
      if (opC > opE) {
        clearInterval(int);
        ele.style.filter = "alpha(opacity=" + opE + ")";
        if (callback) callback();
      }
    }, 40);
  } else {
    opE = 1;
    _op = opE * 40 / time;
    var int = setInterval(function () {
      opC += _op;
      ele.style.opacity = opC;
      if (opC > opE) {
        clearInterval(int);
        ele.style.opacity = opE;
        if (callback) callback();
      }
    }, 40);
  }
}

//判断是否为手机号码
function isPhoneNum(num) {
  return /\b(13|14|15|17|18)\d{9}\b/.test(num);
}

//Ajax请求
function Ajax(obj) {
  var url = obj.url,
    async = obj.sayne !== false;
  type = obj.type || "GET",
    data = obj.data || null,
    success = obj.success || function () { };
  error = obj.error || function () { };
  if (type == "GET" && data) {
    for (item in data) {
      url += (url.indexOf("?") == -1 ? "?" : "&") + item + "=" + data[item];
    }
    data = null;
  }

  function createXHR() {
    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      try {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
          alert("your browser do not support AJAX");
        }
      }
    }
    return xhr;
  }
  var xhr = createXHR();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        success(xhr);
      } else {
        error(xhr);
      }
    }
  }
  xhr.open(type, url, async);
  //async参数指定是否请求是异步的-缺省值为true
  if (type == "POST") {
    //HTTP头信息，默认值：'application/x-www-form-urlencoded';
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;');
  }
  console.log("request-url:" + url);
  xhr.send(data);
  return xhr;
}

//将url转换成对象
function parseUrl(url) {
  var arr = url.match(/(https?):\/\/([^:\/?#]+)(:\d*)?(\/[^?#]*)?(\?[^#]*)?(#.*)?/)
  var obj = {
    protocol: arr[1],
    host: arr[2],
    port: arr[3].substr(1),
    path: arr[4],
    query: {},
    hash: arr[6]
  }
  arr[5].split("?")[1].split("&").forEach(function (item) {
    obj.query[item.split("=")[0]] = item.split("=")[1];
  });
  return obj;
}

//时间格式化
function formatDate(date, str) {
  var obj = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    "S+": date.getMilliseconds()
  };
  str = str.replace(/y+/g, function (match) {
    return (date.getFullYear() + "").substr(4 - match.length);
  });
  for (var key in obj) {
    str = str.replace(new RegExp(key, "g"), function (match) {
      return (match.length == 1) ? (obj[key]) : ("00" + obj[key]).substr(("" + obj[key]).length);
    });
  }
  return str;
}

//增加类样式标签
function addClass(ele, classname) {
  if (ele.className) {
    ele.className += " " + classname;
  }
}

//删除类样式标签
function rmClass(ele, classname) {
  if (ele.className) {
    var _cn = ele.className;
    _cn = _cn.replace(classname, "");
    _cn = _cn.replace("  ", "");
    _cn = /.*[^\s]/.exec(_cn);
    ele.className = _cn;
  }
}

// 全屏图片浏览
function fullScreenImageViewer() {
  var mask = document.createElement('div');
  mask.style = 'position: fixed; z-index: 999; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,.5); display: none;';
  var img = document.createElement('img');
  img.style = 'position: absolute; top: 50%; left: 50%; max-width: 100%; max-height: 100%; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%);';
  mask.appendChild(img);
  document.body.appendChild(mask);
  mask.addEventListener('click', function () {
    mask.style.display = 'none';
    img.src = '';
  });

  return {
    mask: mask,
    img: img,
    show: function (src) {
      img.src = src;
      mask.style.display = 'block';
    }
  }
}


// 半透明气泡通知
function bubbleMessage() {
  var dom = document.createElement('div');
  dom.setAttribute('style', 'display: none; position: fixed; top: 60%; left: 50%; z-index: 99; -moz-transform: translateX(-50%); -webkit-transform: translateX(-50%); transform: translateX(-50%); padding: 6px 10px; max-width: 60%; overflow: hidden; background-color: rgba(0,0,0,.5); border-radius: 20px; font-size: 14px; color: #fff; text-align: center; word-break: break-all');
  dom.className = '_bubble_message_hide_';
  var style = document.createElement('style');
  style.innerHTML = '._bubble_message_hide_ { -moz-transition: opacity 1s, left 0s 1.1s; -webkit-transition: opacity 1s, left 0s 1.1s; transition: opacity 1s, left 0s 1.1s; opacity: 0; left: 200%!important;}';
  document.body.appendChild(style);
  document.body.appendChild(dom);

  var timer = null;
  var show = function (str, keepShow) {
    clearTimeout(timer);
    dom.innerHTML = str;
    dom.className = '_bubble_message_show_';
    dom.style.display = 'block';
    if (keepShow) return;
    timer = setTimeout(function () {
      dom.className = '_bubble_message_hide_';
      timer = setTimeout(function () {
        dom.style.display = 'none';
        dom.innerHTML = '';
      }, 1100);
    }, 800);
  }
  return show;
}



function screenLogger() {
  var div = document.createElement('div');
  div.setAttribute('style', 'position: fixed; z-index: 1000; right: 0; top: 0; width: 75%; max-height: 100%; overflow: auto; font-size: 12px;');
  document.body.appendChild(div);
  return function (str) {
    if (location.href.indexOf('m.ljjkerwin') > -1) return;
    if (typeof str === 'object') {
      str = JSON.stringify(str);
    }
    var _div = document.createElement('div');
    _div.setAttribute('style', 'border-bottom: 1px solid #ddd;');
    _div.innerHTML = str;
    div.appendChild(_div);
  }
}




// 数字加逗号

function formatNum(num) {
  num = num + '';
  var index = num.lastIndexOf('.')
  var result = '';
  if (index != -1) {
    result = num.substring(index);
    num = num.substring(0, index);
  }
  while (num.length > 3) {
    index = num.length - 3;
    result = ',' + num.substring(index) + result;
    num = num.substring(0, index);
  }
  result = num + result;
  return result;
}



/**
 * {
 *   _js   调试url  {string|array}
 *   js    正式url
 *   _css
 *   css
 * }
 */
function autoSelectAssets(params) {
  if (typeof params !== 'object') return;
  if (location.href.indexOf('dev=1') > -1) {
    insertAssets(params._css, 1);
    insertAssets(params._js);
  } else {
    insertAssets(params.css, 1);
    insertAssets(params.js);
  }
  function insertAssets(urls, type) {
    typeof urls === 'string' && insertAsset(urls, type);
    urls instanceof Array && urls.forEach(function (url) { typeof url === 'string' && insertAsset(url, type) });
  }
  function insertAsset(url, type) {
    if (!url) return;
    type || (type = 0); // 0-js, 1-css
    var el = document.createElement(type === 0 ? 'script' : 'link');
    if (type === 0) {
      el.src = url;
      document.body.appendChild(el);
    } else {
      el.href = url;
      el.rel = 'stylesheet';
      document.head.appendChild(el);
    }
  }
}



function getPopupWindow() {
  var wrapEl = document.createElement('div');
  wrapEl.setAttribute('style', 'display: none; position: fixed; z-index: 1000; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(0,0,0,.5)');
  wrapEl.addEventListener('click', function (e) {
    if (e.target === wrapEl) {
      wrapEl.style.display = 'none';
    }
  });

  var winEl = document.createElement('div');
  winEl.setAttribute('style', 'overflow-y: auto; padding: 20px 10px 10px; box-sizing: border-box; border-radius: 6px; min-width: 40%; min-height: 40%; max-width: 80%; max-height: 80%; background-color: #fff; font-size: 13px; color: #333; position: absolute; top: 50%; left: 50%; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%);');

  var cancelEl = document.createElement('div');
  cancelEl.setAttribute('style', 'position: absolute; top: 0; right: 0; line-height: 1; padding: 5px;');
  cancelEl.innerHTML = 'X';
  cancelEl.addEventListener('click', function () {
    wrapEl.style.display = 'none';
  });

  var contentEl = document.createElement('div');
  contentEl.setAttribute('style', 'word-break: break-word; max-width: 100%; max-height: 100%;');

  winEl.appendChild(cancelEl);
  winEl.appendChild(contentEl);
  wrapEl.appendChild(winEl);
  document.body.appendChild(wrapEl);
  return {
    show(html) {
      contentEl.innerHTML = html;
      wrapEl.style.display = 'block';
    },
    hide() {
      wrapEl.style.display = 'none';
    }
  };
}



/*
 * ready()加强版(自JavaScript权威指南)
 * 传递函数给whenReady()
 * 当文档解析完毕且为操作准备就绪时，函数作为document的方法调用
 */
function getOnReadyListener() {               //这个函数返回whenReady()函数
  var funcs = [];             //当获得事件时，要运行的函数
  var ready = false;          //当触发事件处理程序时,切换为true

  //当文档就绪时,调用事件处理程序
  function handler(e) {
    if (ready) return;       //确保事件处理程序只完整运行一次

    //如果发生onreadystatechange事件，但其状态不是complete的话,那么文档尚未准备好
    if (e.type === 'onreadystatechange' && document.readyState !== 'complete') {
      return;
    }

    //运行所有注册函数
    //注意每次都要计算funcs.length
    //以防这些函数的调用可能会导致注册更多的函数
    for (var i = 0; i < funcs.length; i++) {
      funcs[i].call(document);
    }
    //事件处理函数完整执行,切换ready状态, 并移除所有函数
    ready = true;
    funcs = null;
  }
  //为接收到的任何事件注册处理程序
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', handler, false);
    document.addEventListener('readystatechange', handler, false);            //IE9+
    window.addEventListener('load', handler, false);
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', handler);
    window.attachEvent('onload', handler);
  }

  return function ready(fn) {
    if (ready) { fn.call(document); }
    else { funcs.push(fn); }
  }
}



function changeUrlSearch(key, value) {
  var search = location.search,
    hasKey = false;
  search = search.replace(new RegExp('[?&]' + key + '=[^&]*'), function (match) {
    hasKey = true;
    return match.substr(0, 1) + key + '=' + encodeURIComponent(value);
  });
  if (!hasKey) {
    search += (search.indexOf('?') === -1 ? '?' : '&');
    search += key + '=' + encodeURIComponent(value);
  }
  return search;
}





function delayFun(fun, time) {
  let delay = time;
  let timer;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    let _args = arguments;
    timer = setTimeout(function () {
      if (typeof fun === 'function') {
        fun.apply(null, _args);
      }
    }, delay);
  }
}

function asyncRun(fun, param) {
  var _this = this;
  var args = Array.prototype.slice.call(arguments, 1);
  setTimeout(function () {
    fun.apply(_this, args);
  }, 0);
}

function getLS(name) {
  var obj = {
    name: '',
    obj: null,
    hasInit: false,
    init: function (name) {
      if (this.hasInit) return false;
      this.hasInit = true;
      if (!name) {
        console.warn('storage name missed');
        return false;
      }
      this.name = name;
      this.get();
    },
    get: function () {
      this.obj = JSON.parse(localStorage.getItem(this.name));
      if (!this.obj) {
        this.obj = {};
        this.set();
      }
      return this.obj;
    },
    set: function () {
      localStorage.setItem(this.name, JSON.stringify(this.obj));
    },
    getItem: function (key) {
      return this.obj[key];
    },
    setItem: function (key, val) {
      this.obj[key] = val;
      this.set();
    },
    removeItem: function (key) {
      delete this.obj[key];
      this.set();
    },
    clear: function () {
      return localStorage.removeItem(this.name);
    }
  }
  if (name) {
    obj.init(name);
    return obj;
  }
  return obj;
}