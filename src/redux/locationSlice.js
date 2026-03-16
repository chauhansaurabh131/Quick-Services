import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  latitude: null,
  longitude: null,
  place: 'Fetching location...',
  fullAddress: '',
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      const {latitude, longitude, place, fullAddress} = action.payload;
      state.latitude = latitude;
      state.longitude = longitude;
      state.place = place;
      state.fullAddress = fullAddress;
    },
    resetLocation: state => {
      return initialState;
    },
  },
});

export const {setLocation, resetLocation} = locationSlice.actions;
export default locationSlice.reducer;
