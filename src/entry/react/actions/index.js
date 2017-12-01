import keyMirror from 'keymirror';


export const actionTypes = keyMirror({
  INIT_STATE: null,
})
const AT = actionTypes


export function initState(data) {
  return {
    type: AT.INIT_STATE,
    data
  }
}

