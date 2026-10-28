import React from 'react';
import {TouchableOpacity, View, Animated, StyleSheet} from 'react-native';
import {hp, wp} from '../../utils/helpers';

const SwitchButton = ({value, onChange, disabled = false}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={0.8}
      onPress={() => {
        if (!disabled && onChange) {
          onChange(!value);
        }
      }}
      style={[
        styles.container,
        {backgroundColor: value ? '#6C2BD9' : '#BDBDBD'},
        disabled && {opacity: 0.5},
      ]}>
      <View
        style={[styles.circle, {alignSelf: value ? 'flex-end' : 'flex-start'}]}
      />
    </TouchableOpacity>
  );
};

export default SwitchButton;

const styles = StyleSheet.create({
  container: {
    width: wp(51),
    height: hp(28),
    borderRadius: hp(20),
    padding: 3,
    justifyContent: 'center',
  },

  circle: {
    width: hp(24),
    height: hp(24),
    borderRadius: hp(20),
    backgroundColor: '#fff',
  },
});
