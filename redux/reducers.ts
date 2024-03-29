// src/redux/reducers.ts

import { ADD_MESSAGE, UPDATE_CODE, updateUserEmail } from './actions';

interface RootState {
  messages: string[];
  code: string;
  userEmail: string; 
}

// Define action types
interface AddMessageAction {
  type: typeof ADD_MESSAGE;
  payload: string;
}

interface UpdateCodeAction {
  type: typeof UPDATE_CODE;
  payload: string;
}

interface UpdateUserEmailAction {
  type: typeof updateUserEmail;
  payload: string;
}

type ActionTypes = AddMessageAction | UpdateCodeAction | UpdateUserEmailAction;

const initialState: RootState = {
  messages: [],
  code: '// Write your code here',
  userEmail: '', 
};

const rootReducer = (state = initialState, action: ActionTypes) => {
  switch (action.type) {
    case ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case UPDATE_CODE:
      return {
        ...state,
        code: action.payload,
      };

    case updateUserEmail:
      return {
        ...state,
        userEmail: action.payload,
      };

    default:
      return state;
  }
};

export default rootReducer;
