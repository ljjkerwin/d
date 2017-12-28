import { actionTypes as AT } from '../actions';


const initState = window.__initState || {};


export default function (state = initState, action) {
  switch (action.type) {
    case AT.INIT_STATE:
      state = {...state, ...action.data};
      break;
  }
  return state;
}