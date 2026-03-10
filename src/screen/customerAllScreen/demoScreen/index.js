import React, {useState} from 'react';
import {SafeAreaView, View, TextInput, StyleSheet, Text} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';

const DemoScreen = () => {
  const [mobile, setMobile] = useState('');

  const handleMobileChange = text => {
    const formatted = text
      .replace(/\D/g, '') // only numbers
      .slice(0, 10) // max 10 digits
      .replace(/(\d{5})(\d{0,5})/, '$1 $2')
      .trim();

    setMobile(formatted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Enter Mobile Number</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.countryCode}>+91</Text>

        <TextInput
          value={mobile}
          onChangeText={handleMobileChange}
          placeholder="00000 00000"
          placeholderTextColor="#BDBDBD"
          keyboardType="number-pad"
          style={styles.input}
        />
      </View>
    </SafeAreaView>
  );
};

export default DemoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(20),
    justifyContent: 'center',
  },

  label: {
    color: 'black',
    fontSize: fontSize(16),
    marginBottom: hp(10),
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center', // ⭐ important
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    height: hp(44),
    paddingHorizontal: wp(12),
  },

  countryCode: {
    fontSize: fontSize(16),
    color: 'black',
    fontFamily: fontFamily.poppins400,
    marginRight: wp(6),
    includeFontPadding: false, // ⭐ Android fix
  },

  input: {
    flex: 1,
    fontSize: fontSize(16),
    color: 'black',
    fontFamily: fontFamily.poppins400,
    paddingVertical: 0, // ⭐ important
    includeFontPadding: false, // ⭐ Android fix
  },
});
