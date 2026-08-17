import React, { useEffect, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../utils/colors';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { icons } from '../../../assets';
import { useNavigation } from '@react-navigation/native';
import { registerVendor } from '../../../actions/customerAuthActions';

const VendorRegistrationScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth || {});

  const [businessName, setBusinessName] = useState('');
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  const isFormValid =
    businessName.trim().length > 0 && emailOrMobile.trim().length > 0;

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const trimmedInput = emailOrMobile.trim();
    const isEmail = trimmedInput.includes('@');

    let payload = {};
    if (isEmail) {
      payload = {
        businessName: businessName.trim(),
        email: trimmedInput,
      };
    } else {
      const cleanNumber = trimmedInput.replace(/\D/g, '');
      if (cleanNumber.length !== 10) {
        Alert.alert(
          'Invalid Mobile Number',
          'Please enter a valid 10-digit mobile number or email address',
        );
        return;
      }
      payload = {
        businessName: businessName.trim(),
        mobileNumber: cleanNumber,
        countryCodeId: '6a420c2f668100ad2212e8ea',
      };
    }

    console.log(
      'Sending registerVendor payload:',
      JSON.stringify(payload, null, 2),
    );

    dispatch(
      registerVendor(payload, (error, response) => {
        if (error) {
          Alert.alert(
            'Registration Failed',
            error?.message || error?.msg || 'Something went wrong. Please try again.',
          );
        } else {
          navigation.navigate('VendorOtpVerificationScreen', {
            contact: trimmedInput,
          });
        }
      }),
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
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
            style={{ width: wp(15), height: hp(15), resizeMode: 'contain' }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          Registration
        </Text>

        <Text
          style={{
            color: colors.primaryColor,
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
            marginRight: wp(13),
          }}>
          Step 2 of 9
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={{ width: '100%', height: hp(1), backgroundColor: '#E5E5E5' }}>
        <View
          style={{
            width: '11.11%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      <View style={{ marginTop: hp(70), alignItems: 'center' }}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(20),
            fontFamily: fontFamily.poppins500,
          }}>
          Join as Vendor
        </Text>

        <Text
          style={{
            color: '#717171',
            fontSize: fontSize(13),
            fontFamily: fontFamily.poppins400,
            marginTop: hp(5),
          }}>
          Join now and get more leads
        </Text>
      </View>

      <View style={{ marginHorizontal: wp(36), marginTop: hp(92) }}>
        <TextInput
          placeholder={'Enter Business Name'}
          placeholderTextColor={'grey'}
          value={businessName}
          onChangeText={setBusinessName}
          style={{
            width: '100%',
            height: hp(50),
            borderWidth: hp(1),
            borderRadius: hp(25),
            borderColor: '#D9D9D9',
            paddingHorizontal: wp(24),
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
            color: colors.pureBlack
          }}
        />

        <TextInput
          placeholder={'Enter Email or Mobile'}
          placeholderTextColor={'grey'}
          value={emailOrMobile}
          onChangeText={setEmailOrMobile}
          keyboardType={'email-address'}
          autoCapitalize={'none'}
          style={{
            width: '100%',
            height: hp(50),
            borderWidth: hp(1),
            borderRadius: hp(25),
            borderColor: '#D9D9D9',
            paddingHorizontal: wp(24),
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
            marginTop: hp(17),
            color: colors.pureBlack
          }}
        />
      </View>

      {!keyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: hp(30),
            width: '100%',
          }}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.6}
            disabled={!isFormValid || loading}
            style={{
              height: hp(50),
              borderRadius: hp(25),
              backgroundColor: colors.primaryColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: wp(36),
              opacity: isFormValid && !loading ? 1 : 0.5,
            }}>
            {loading ? (
              <ActivityIndicator color={colors.white} size="large" />
            ) : (
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VendorRegistrationScreen;
