import { device } from 'modules/utils';


const globalVariables = {
  
  isMobile: device.isMobile(),

  firstRenderMessage: true, //  首屏消息

  loadMoreSwitch: true, // 上拉加载更多开关
}


export default globalVariables;
window.GV = globalVariables;