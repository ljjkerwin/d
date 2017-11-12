function getToast() {
  var timer,
      el = document.createElement('div');
  el.setAttribute('style', 'max-width:70%;display:none;z-index:1010;-webkit-transition:opacity .5s ease;transition:opacity .5s ease;-webkit-transform:translate3d(-50%, 0, 0);transform:translate3d(-50%, 0, 0);-webkit-border-radius:10px;border-radius:10px;font-size:14px;color:#fff;position:fixed;top:55.6%;left:50%;padding:10px;background-color:rgba(0,0,0,0.8);text-align:center;word-break:break-all;font-family:"PingFangSC-Regular","Helvetica Neue",Helvetica,Arial,"Microsoft Yahei","Hiragino Sans GB","Heiti SC","WenQuanYi Micro Hei",sans-serif');
  document.body.appendChild(el);

  return function (content, timeout) {
    content = String(content);
    typeof timeout === 'undefined' && (timeout = 2000);

    // h5接口
    clearTimeout(timer);
    el.innerHTML = content;
    el.style.opacity = '1';
    el.style.display = 'block';

    timer = setTimeout(function () {
      el.style.opacity = '0';
      timer = setTimeout(function () {
        el.style.display = 'none';
      }, 550);
    }, timeout);
  }
}

var toast = getToast();

export default toast;

