// src/redux/store.ts

import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers/rootReducer';

const initialState = {
  counter: 0,
  message: '',
};

const store = createStore(
  rootReducer,
  initialState, 
  applyMiddleware()
);

export type AppDispatch = typeof store.dispatch;

export default store;
