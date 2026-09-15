import * as TYPES from '../actions/actionTypes';

const initialState = {
  latitude: null,
  longitude: null,
  place: 'Fetching location...',
  fullAddress: '',
  isManualSelection: false,
};

const locationReducer = (state = initialState, action) => {
  switch (action.type) {
    case TYPES.SET_LOCATION:
      return {
        ...state,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        place: action.payload.place,
        fullAddress: action.payload.fullAddress,
        isManualSelection:
          action.payload.isManualSelection !== undefined
            ? action.payload.isManualSelection
            : state.isManualSelection,
      };
    case TYPES.RESET_LOCATION:
      return initialState;
    default:
      return state;
  }
};

export default locationReducer;
