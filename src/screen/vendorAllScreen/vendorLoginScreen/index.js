import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../utils/colors';
import { fontFamily, fontSize, hp } from '../../../utils/helpers';
import { icons } from '../../../assets';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loginVendor } from '../../../actions/customerAuthActions';

const VendorLoginScreen = () => {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth || {});

  const isFormValid =
    emailOrMobile.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (!isFormValid || loading) {
      return;
    }

    const trimmedInput = emailOrMobile.trim();
    const isEmail = trimmedInput.includes('@');

    let payload = {
      password: password,
    };

    if (isEmail) {
      payload.email = trimmedInput;
    } else {
      const cleanNumber = trimmedInput.replace(/\D/g, '');
      if (cleanNumber.length !== 10) {
        Alert.alert(
          'Invalid Mobile Number',
          'Please enter a valid 10-digit mobile number or email address.',
        );
        return;
      }
      payload.mobileNumber = cleanNumber;
      payload.countryCodeId = '6a420c2f668100ad2212e8ea';
    }

    const defaultToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTI1NWI1N2NmNWY3MzRiNjAyN2JmZWYiLCJpYXQiOjE3NjQwNTU5MDksImV4cCI6MTc2NDIzNTkwOX0.LBljN_-Uk2eig2LgGefiNI9vCqkfMXIsLJrXmZy9NPs';

    dispatch(
      loginVendor(
        payload,
        (error, response) => {
          if (error) {
            const errorMsg =
              typeof error === 'string'
                ? error
                : error?.message || error?.error || 'Login failed. Please check your credentials.';
            Alert.alert('Login Failed', errorMsg);
          } else {
            console.log('Vendor Login successful:', response);
            navigation.reset({
              index: 0,
              routes: [{ name: 'VendorApp' }],
            });
          }
        },
        defaultToken,
      ),
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Text
        style={{
          padding: hp(26),
          fontSize: fontSize(16),
          fontFamily: fontFamily.poppins700,
          color: colors.primaryColor,
        }}>
        Karyaah
      </Text>

      <View style={{ alignItems: 'center', marginTop: hp(90) }}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(20),
            fontFamily: fontFamily.poppins600,
          }}>
          Vendor Login
        </Text>

        <Text
          style={{
            color: '#717171',
            fontSize: fontSize(13),
            fontFamily: fontFamily.poppins400,
            marginTop: hp(5),
          }}>
          Welcome Back to Quick Service App
        </Text>
      </View>

      <View
        style={{
          marginHorizontal: hp(30),
          marginTop: hp(80),
        }}>
        {/* Email / Mobile */}

        <TextInput
          placeholder="Email or Mobile"
          placeholderTextColor="#717171"
          value={emailOrMobile}
          onChangeText={setEmailOrMobile}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            height: hp(50),
            borderWidth: hp(1),
            borderColor: '#D9D9D9',
            borderRadius: hp(25),
            paddingHorizontal: hp(20),
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
            color: colors.pureBlack,
          }}
        />

        {/* Password */}

        <View
          style={{
            height: hp(50),
            borderWidth: hp(1),
            borderColor: '#D9D9D9',
            borderRadius: hp(25),
            paddingHorizontal: hp(20),
            marginTop: hp(15),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#717171"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={{
              flex: 1,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              color: colors.pureBlack,
            }}
          />

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                showPassword
                  ? icons.password_Show_Icon
                  : icons.password_Hide_Icon
              }
              style={{
                width: hp(18),
                height: hp(18),
                resizeMode: 'contain',
                tintColor: '#A0A0A0',
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}

        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.6}
          disabled={!isFormValid || loading}
          style={{
            height: hp(50),
            borderRadius: hp(25),
            backgroundColor: colors.primaryColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp(30),
            opacity: isFormValid && !loading ? 1 : 0.5,
          }}>
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* Reset Password */}

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            navigation.navigate('VendorResetPasswordScreen');
          }}
          style={{
            alignItems: 'center',
            marginTop: hp(28),
          }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(13),
              fontFamily: fontFamily.poppins400,
            }}>
            Reset Password
          </Text>
        </TouchableOpacity>

        {/* Divider */}

        <View
          style={{
            height: 1,
            backgroundColor: '#E5E5E5',
            marginTop: hp(90),
          }}
        />

        {/* Register */}

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            navigation.navigate('VendorChooseRegistrationScreen');
          }}
          style={{
            alignItems: 'center',
            marginTop: hp(40),
          }}>
          <Text
            style={{
              color: colors.primaryColor,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins500,
            }}>
            New Vendor? Start Registration
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VendorLoginScreen;

