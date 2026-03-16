import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {colors} from '../../../utils/colors';

const BookingScreen = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <Text style={{color: 'black'}}>Booking Screen</Text>
    </SafeAreaView>
  );
};

export default BookingScreen;
