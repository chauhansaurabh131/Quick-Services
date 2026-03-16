import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {colors} from '../../../utils/colors';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <Text style={{color: 'black'}}>Profile Scren</Text>
    </SafeAreaView>
  );
};
export default ProfileScreen;
