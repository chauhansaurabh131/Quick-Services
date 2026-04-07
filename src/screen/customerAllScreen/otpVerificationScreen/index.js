import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {icons} from '../../../assets';
import {style} from './style';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpVerificationScreen = ({navigation}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleVerify = async () => {
    try {
      const type = await AsyncStorage.getItem('accountType');
      if (type === 'vendor') {
        navigation.navigate('VendorBasicInfoScreen');
      } else {
        navigation.navigate('BasicInfoScreen');
      }
    } catch (e) {
      console.log('Error getting account type:', e);
      navigation.navigate('BasicInfoScreen');
    }
  };

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <SafeAreaView style={style.container}>
      {/* HEADER */}
      <View style={style.headerBody}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          activeOpacity={0.6}
          style={style.backArrowContainer}>
          <Image source={icons.back_Arrow_Icon} style={style.backArrowImage} />
        </TouchableOpacity>

        <Text style={style.headerTittle}>OTP Verification</Text>

        <Text style={style.headerSubTittle}>Step 2 of 4</Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={style.progressBarContainer}>
        <View style={style.progressBarStyle} />
      </View>

      {/* TEXT */}
      <View style={style.bodyTittleContainer}>
        <Text style={style.bodyTitle}>Verify Your Number</Text>

        <Text style={style.bodySubTittle}>OTP sent to +91 12123 32234</Text>
      </View>

      <View style={style.textInputContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            value={digit}
            placeholder="0"
            placeholderTextColor="#BDBDBD"
            keyboardType="number-pad"
            maxLength={1}
            onFocus={() => setFocusedIndex(index)}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            style={[
              style.textInputStyle,
              focusedIndex === index && [style.textInputSubTitle],
            ]}
          />
        ))}
      </View>

      <Text style={style.resendText}>Resend OTP</Text>

      {!keyboardVisible && (
        <View style={style.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleVerify}
            style={style.buttonStyle}>
            <Text style={style.buttonText}>Verify & Proceed</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;
