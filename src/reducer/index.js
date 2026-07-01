import {combineReducers} from 'redux';
import locationReducer from './locationReducer';
import customerAuthReducer from './customerAuthReducer';

const rootReducer = combineReducers({
  location: locationReducer,
  auth: customerAuthReducer,
});

export default (state, action) => {
  if (action.type === 'RESET_APP_STATE') {
    state = undefined;
  }
  return rootReducer(state, action);
};
