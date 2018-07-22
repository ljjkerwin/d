
/**
 * 每隔x秒执行一次，最后延时x秒后执行一次
 */
export default function throttleDebounce(fun, interval = 200) {
  let timer,
    noStop = false; // 标记timer期间是否有触发

  const setTimer = function (args) {
    if (timer) return;
    timer = setTimeout(function () {
      clearTimeout(timer);
      timer = null;
      if (noStop) {
        noStop = false;
        setTimer(args);
        fun(...args);
      }
    }, interval)
  }

  return function (...args) {
    noStop = true;
    if (!timer) {
      setTimer(args);
      fun(...args);
    }
  }
}