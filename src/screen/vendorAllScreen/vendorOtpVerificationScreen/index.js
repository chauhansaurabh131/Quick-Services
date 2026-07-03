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
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';

const VendorOtpVerificationScreen = ({route}) => {
  const navigation = useNavigation();

  const {contact} = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

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

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.join('').length === 4;

  const isEmail = contact?.includes('@');

  const displayText = isEmail
    ? `OTP sent to ${contact}`
    : `OTP sent to +91 ${contact}`;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* HEADER */}
      <View
        style={{
          height: hp(55),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          activeOpacity={0.6}
          style={{
            height: '100%',
            width: wp(65),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={icons.back_Arrow_Icon}
            style={{width: wp(15), height: hp(15), resizeMode: 'contain'}}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          OTP Verification
        </Text>

        <Text
          style={{
            color: colors.primaryColor,
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
            marginRight: wp(13),
          }}>
          Step 3 of 9
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={{width: '100%', height: hp(1), backgroundColor: '#E5E5E5'}}>
        <View
          style={{
            width: '22.11%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      <View style={{marginTop: hp(70), alignItems: 'center'}}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(20),
            fontFamily: fontFamily.poppins500,
          }}>
          Verify Your Number
        </Text>

        <Text
          style={{
            color: '#717171',
            fontSize: fontSize(13),
            fontFamily: fontFamily.poppins400,
            marginTop: hp(5),
          }}>
          {displayText}
        </Text>
      </View>

      <View
        style={{
          marginTop: hp(90),
          marginHorizontal: wp(36),
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
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
              style={{
                width: wp(55),
                height: hp(55),
                textAlign: 'center',
                fontSize: fontSize(24),
                fontFamily: fontFamily.poppins500,
                borderBottomWidth: hp(1),
                borderBottomColor:
                  focusedIndex === index ? colors.pureBlack : '#D9D9D9',
                color: colors.pureBlack,
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          disabled={timer > 0}
          activeOpacity={0.6}
          onPress={() => setTimer(30)}
          style={{
            marginTop: hp(45),
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: timer > 0 ? '#717171' : colors.pureBlack,
              // color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}>
            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>

      {!keyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: hp(30),
            width: '100%',
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('VendorSetPasswordScreen');
            }}
            activeOpacity={0.6}
            disabled={!isOtpComplete}
            style={{
              height: hp(50),
              borderRadius: hp(25),
              backgroundColor: colors.primaryColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: wp(36),
              opacity: isOtpComplete ? 1 : 0.5,
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
              }}>
              Verify & Proceed
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VendorOtpVerificationScreen;
