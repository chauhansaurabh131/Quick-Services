import * as TYPES from './actionTypes';

export const setLocation = (payload) => ({
  type: TYPES.SET_LOCATION,
  payload,
});

export const resetLocation = () => ({
  type: TYPES.RESET_LOCATION,
});
