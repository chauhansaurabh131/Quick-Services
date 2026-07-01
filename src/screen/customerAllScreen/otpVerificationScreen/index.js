import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {verifyOtpCustomer} from '../../../actions/customerAuthActions';
import {colors} from '../../../utils/colors';
import {hp} from '../../../utils/helpers';
import {customerAuth} from '../../../apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';

const OtpVerificationScreen = ({navigation, route}) => {
  const {mobileNumber} = route.params || {};
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  const dispatch = useDispatch();
  const {loading} = useSelector(state => state.auth || {});

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const otpString = otp.join('');
  const isOtpComplete = otpString.length === 4;

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const payload = {
        countryCodeId: '6a420c2f668100ad2212e8ea',
        mobileNumber: mobileNumber || '',
      };

      await customerAuth.register(payload);
      setResendLoading(false);
      setTimer(30);
      // Alert.alert('OTP Sent', 'A new OTP has been sent to your mobile number.');
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'A new OTP has been sent to your mobile number.',
        position: 'top',
      });
    } catch (error) {
      setResendLoading(false);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong';
      Alert.alert('Error', errorMsg);
    }
  };

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

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid 4-digit OTP');
      return;
    }

    const payload = {
      mobileNumber: mobileNumber || '',
      otp: otpString,
    };

    dispatch(
      verifyOtpCustomer(payload, async (error, response) => {
        if (error) {
          Alert.alert(
            'Verification Failed',
            error.message || 'The OTP entered is incorrect',
          );
        } else {
          try {
            const userData = response?.data || response || {};
            const userObj = userData?.user || userData;
            console.log('OTP Verification Response User:', userObj);

            const fullName = userObj?.fullName || userObj?.name;
            if (fullName) {
              const role = userObj?.role;
              if (role === 'vendor') {
                navigation.replace('VendorApp');
              } else {
                navigation.replace('MainApp');
              }
            } else {
              const type = await AsyncStorage.getItem('accountType');
              if (type === 'vendor') {
                navigation.replace('VendorBasicInfoScreen');
              } else {
                navigation.replace('BasicInfoScreen', {mobileNumber});
              }
            }
          } catch (e) {
            console.log('Error in navigation check:', e);
            navigation.replace('BasicInfoScreen', {mobileNumber});
          }
        }
      }),
    );
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

        <Text style={style.headerSubTittle}>Step 2 of 3</Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={style.progressBarContainer}>
        <View style={style.progressBarStyle} />
      </View>

      {/* TEXT */}
      <View style={style.bodyTittleContainer}>
        <Text style={style.bodyTitle}>Verify Your Number</Text>

        <Text style={style.bodySubTittle}>
          OTP sent to +91 {mobileNumber || '12123 32234'}
        </Text>
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

      <TouchableOpacity
        onPress={handleResendOtp}
        disabled={timer > 0 || resendLoading}
        activeOpacity={0.6}>
        {resendLoading ? (
          <ActivityIndicator
            color={colors.primaryColor}
            size="small"
            style={{marginTop: hp(43)}}
          />
        ) : (
          <Text style={[style.resendText, timer > 0 && {color: '#717171'}]}>
            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </Text>
        )}
      </TouchableOpacity>

      {!keyboardVisible && (
        <View style={style.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleVerify}
            disabled={loading || !isOtpComplete}
            style={[
              style.buttonStyle,
              {
                opacity: isOtpComplete ? 1 : 0.5,
              },
            ]}>
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={style.buttonText}>Verify & Proceed</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      <Toast />
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;
