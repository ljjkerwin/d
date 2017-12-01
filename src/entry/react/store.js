import { createStore, applyMiddleware, compose } from 'redux';
import reducers from './reducers';
import createLogger from 'redux-logger';



const enhances = [];

if (process.env.NODE_ENV === 'development') {
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhances.push(window.__REDUX_DEVTOOLS_EXTENSION__());
  } else if (window.Symbol) {
    enhances.push(applyMiddleware(createLogger()));
  }
}


const store = createStore(reducers);


export default store;