// src/redux/actions.ts

// Action types
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const UPDATE_CODE = 'UPDATE_CODE';

// Action creators
export const addMessage = (messageText: string) => ({
  type: ADD_MESSAGE,
  payload: { text: messageText, user: 'someUser' }, 
});

export const updateCode = (code: string) => ({
  type: UPDATE_CODE,
  payload: code,
});

export const updateUserEmail = (email: string) => ({
  type: 'UPDATE_USER_EMAIL',
  payload: email,
});

