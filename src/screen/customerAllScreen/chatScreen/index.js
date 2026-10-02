import React from 'react';
import {SafeAreaView, Text, View, StyleSheet} from 'react-native';
import {colors} from '../../../utils/colors';

const ChatScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.text}>Chat Screen</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white || '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#000000',
  },
});

export default ChatScreen;
