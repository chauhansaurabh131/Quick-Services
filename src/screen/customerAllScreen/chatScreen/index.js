import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {colors} from '../../../utils/colors';

const ChatScreen = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <Text style={{color: 'black'}}>Chat screen</Text>
    </SafeAreaView>
  );
};

export default ChatScreen;
