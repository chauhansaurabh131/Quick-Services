import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';

const VendorLoginScreen = () => {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();

  const isFormValid =
    emailOrMobile.trim().length > 0 && password.trim().length > 0;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <Text
        style={{
          padding: hp(26),
          fontSize: fontSize(16),
          fontFamily: fontFamily.poppins700,
          color: colors.primaryColor,
        }}>
        Karyaah
      </Text>

      <View style={{alignItems: 'center', marginTop: hp(90)}}>
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
          onPress={() => {
            navigation.navigate('VendorResetPasswordScreen');
          }}
          activeOpacity={0.6}
          disabled={!isFormValid}
          style={{
            height: hp(50),
            borderRadius: hp(25),
            backgroundColor: colors.primaryColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp(30),
            opacity: isFormValid ? 1 : 0.5,
          }}>
          <Text
            style={{
              color: colors.white,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins500,
            }}>
            Login
          </Text>
        </TouchableOpacity>

        {/* Reset Password */}

        <TouchableOpacity
          activeOpacity={0.6}
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
