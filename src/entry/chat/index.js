import Chat from './Chat';


const chat = new Chat(document.getElementById('app'));


// 接口列表
const apiList = ['sendMessage'];


/**
 * 暴露接口
 * 
 * frames[0].postMessage(['apiName', data1, data2...], 'http://chatUrl');
 */
window.addEventListener('message', function (e) {
  if (e.source !== window.parent) return;

  let m = e.data;
  if (!m || !(m instanceof Array)) {
    console.warn('api调用无效，参考格式：["api", data1, data2]');
    return;
  }

  let [api, ...args] = m;
  if (apiList.indexOf(api) === -1) {
    console.warn('no api:', api);
    return;
  }

  console.log('chat api call:', m);
  chat[api](...args);
});
