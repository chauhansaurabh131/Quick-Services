import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';

const VendorResetPasswordScreen = () => {
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValid =
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    password === confirmPassword;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* Logo */}

      <Text
        style={{
          padding: hp(26),
          fontSize: fontSize(16),
          fontFamily: fontFamily.poppins700,
          color: colors.primaryColor,
        }}>
        Karyaah
      </Text>

      {/* Title */}

      <View style={{alignItems: 'center', marginTop: hp(90)}}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(20),
            fontFamily: fontFamily.poppins600,
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

      {/* Form */}

      <View
        style={{
          marginHorizontal: wp(30),
          marginTop: hp(80),
        }}>
        {/* Password */}

        <View
          style={{
            height: hp(50),
            borderWidth: hp(1),
            borderColor: '#D9D9D9',
            borderRadius: hp(25),
            paddingHorizontal: wp(20),
            flexDirection: 'row',
            alignItems: 'center',
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
            paddingHorizontal: wp(20),
            flexDirection: 'row',
            alignItems: 'center',
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
          activeOpacity={0.6}
          disabled={!isValid}
          style={{
            height: hp(50),
            borderRadius: hp(25),
            backgroundColor: colors.primaryColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp(30),
            opacity: isValid ? 1 : 0.5,
          }}>
          <Text
            style={{
              color: colors.white,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins500,
            }}>
            Confirm
          </Text>
        </TouchableOpacity>

        {/* Hint */}

        <Text
          style={{
            textAlign: 'center',
            marginTop: hp(15),
            color: '#717171',
            fontSize: fontSize(11),
            fontFamily: fontFamily.poppins400,
            lineHeight: hp(18),
          }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontFamily: fontFamily.poppins500,
            }}>
            Hints :
          </Text>{' '}
          Must be 6–8 characters long,{'\n'}
          including numbers and letters
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: '#E5E5E5',
            marginTop: hp(90),
          }}
        />

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => navigation.navigate('VendorLoginScreen')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp(40),
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryColor,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins500,
            }}>
            Vendor Login
          </Text>

          <Image
            source={icons.circle_Profile_Icon}
            style={{
              width: hp(16),
              height: hp(16),
              resizeMode: 'contain',
              marginLeft: wp(8),
              tintColor: colors.primaryColor,
              top: hp(-1),
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}

      {/*<View*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    bottom: hp(40),*/}
      {/*    width: '100%',*/}
      {/*    alignItems: 'center',*/}
      {/*  }}>*/}
      {/*  <View*/}
      {/*    style={{*/}
      {/*      width: '85%',*/}
      {/*      height: hp(1),*/}
      {/*      backgroundColor: '#E5E5E5',*/}
      {/*      marginBottom: hp(40),*/}
      {/*    }}*/}
      {/*  />*/}

      {/*<TouchableOpacity*/}
      {/*  activeOpacity={0.6}*/}
      {/*  onPress={() => navigation.navigate('VendorLoginScreen')}*/}
      {/*  style={{*/}
      {/*    flexDirection: 'row',*/}
      {/*    alignItems: 'center',*/}
      {/*  }}>*/}
      {/*  <Text*/}
      {/*    style={{*/}
      {/*      color: colors.primaryColor,*/}
      {/*      fontSize: fontSize(14),*/}
      {/*      fontFamily: fontFamily.poppins500,*/}
      {/*    }}>*/}
      {/*    Vendor Login*/}
      {/*  </Text>*/}

      {/*  <Image*/}
      {/*    source={icons.circle_Profile_Icon}*/}
      {/*    style={{*/}
      {/*      width: hp(16),*/}
      {/*      height: hp(16),*/}
      {/*      resizeMode: 'contain',*/}
      {/*      marginLeft: wp(8),*/}
      {/*      tintColor: colors.primaryColor,*/}
      {/*      top: hp(-1),*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</TouchableOpacity>*/}
      {/*</View>*/}
    </SafeAreaView>
  );
};

export default VendorResetPasswordScreen;
