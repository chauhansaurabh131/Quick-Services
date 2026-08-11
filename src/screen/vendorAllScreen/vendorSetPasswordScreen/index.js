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
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../utils/colors';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { icons } from '../../../assets';
import { useNavigation } from '@react-navigation/native';
import { updateVendorProfile, updateUserCustomer } from '../../../actions/customerAuthActions';

const VendorSetPasswordScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth || {});

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValid =
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    password === confirmPassword;

  const handleConfirm = () => {
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const payload = {
      password: password,
    };

    console.log(
      'Sending Vendor Set Password Payload:',
      JSON.stringify(payload, null, 2),
    );

    dispatch(
      updateVendorProfile(payload, (error, response) => {
        if (error) {
          console.log(
            'updateVendorProfile failed, trying updateUserCustomer fallback:',
            error,
          );
          dispatch(
            updateUserCustomer(payload, (err2, res2) => {
              if (err2) {
                Alert.alert(
                  'Failed to Set Password',
                  error?.message ||
                    error?.msg ||
                    err2?.message ||
                    err2?.msg ||
                    'Something went wrong. Please try again.',
                );
              } else {
                navigation.navigate('VendorBasicInfoScreen');
              }
            }),
          );
        } else {
          navigation.navigate('VendorBasicInfoScreen');
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
          Password
        </Text>

        <Text
          style={{
            color: colors.primaryColor,
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
            marginRight: wp(13),
          }}>
          Step 4 of 9
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={{ width: '100%', height: hp(1), backgroundColor: '#E5E5E5' }}>
        <View
          style={{
            width: '33.11%',
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
          Set Password
        </Text>

        <Text
          style={{
            color: '#717171',
            fontSize: fontSize(13),
            fontFamily: fontFamily.poppins400,
            marginTop: hp(5),
          }}>
          use strong password for security
        </Text>
      </View>

      <View
        style={{
          marginTop: hp(70),
          marginHorizontal: wp(36),
        }}>
        {/* Password */}

        <View
          style={{
            height: hp(50),
            borderWidth: 1,
            borderColor: '#D9D9D9',
            borderRadius: hp(25),
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: wp(20),
          }}>
          <TextInput
            placeholder="Choose Password"
            placeholderTextColor="#717171"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={{
              flex: 1,
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
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
                tintColor: '#AEAEAE',
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}

        <View
          style={{
            height: hp(50),
            borderWidth: 1,
            borderColor: '#D9D9D9',
            borderRadius: hp(25),
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: wp(20),
            marginTop: hp(15),
          }}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#717171"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={{
              flex: 1,
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}
          />

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Image
              source={
                showConfirmPassword
                  ? icons.password_Show_Icon
                  : icons.password_Hide_Icon
              }
              style={{
                width: hp(18),
                height: hp(18),
                resizeMode: 'contain',
                tintColor: '#AEAEAE',
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}

        <TouchableOpacity
          onPress={handleConfirm}
          activeOpacity={0.6}
          disabled={!isValid || loading}
          style={{
            height: hp(50),
            borderRadius: hp(25),
            backgroundColor: colors.primaryColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp(25),
            opacity: isValid && !loading ? 1 : 0.5,
          }}>
          {loading ? (
            <ActivityIndicator color={colors.white} size="large" />
          ) : (
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              Confirm
            </Text>
          )}
        </TouchableOpacity>

        {/* Hint */}

        <Text
          style={{
            textAlign: 'center',
            marginTop: hp(27),
            color: '#878787',
            fontSize: fontSize(12),
            fontFamily: fontFamily.poppins400,
            lineHeight: hp(18),
          }}>
          <Text style={{ color: colors.pureBlack }}>Hints :</Text> Must be 6-8
          characters long,{'\n'}
          including numbers and letters
        </Text>
      </View>

      <View style={{ marginHorizontal: wp(37), marginTop: hp(90) }}>
        <View
          style={{ width: '100%', height: hp(1), backgroundColor: '#E1E1E1' }}
        />
        <TouchableOpacity
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: hp(70),
          }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}>
            Member Login
          </Text>
          <Image
            source={icons.circle_Profile_Icon}
            style={{
              width: hp(16),
              height: hp(16),
              resizeMode: 'contain',
              marginLeft: wp(10),
              top: hp(-1),
            }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VendorSetPasswordScreen;
