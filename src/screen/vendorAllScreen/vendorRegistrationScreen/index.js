import React, {useEffect, useState} from 'react';
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

const VendorRegistrationScreen = () => {
  const navigation = useNavigation();

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
      <View style={{width: '100%', height: hp(1), backgroundColor: '#E5E5E5'}}>
        <View
          style={{
            width: '11.11%',
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

      <View style={{marginHorizontal: wp(36), marginTop: hp(92)}}>
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
          }}
        />

        <TextInput
          placeholder={'Enter Email or Mobile'}
          placeholderTextColor={'grey'}
          value={emailOrMobile}
          onChangeText={setEmailOrMobile}
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
            onPress={() => {
              navigation.navigate('VendorOtpVerificationScreen', {
                contact: emailOrMobile,
              });
            }}
            activeOpacity={0.6}
            disabled={!isFormValid}
            style={{
              height: hp(50),
              borderRadius: hp(25),
              backgroundColor: colors.primaryColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: wp(36),
              opacity: isFormValid ? 1 : 0.5,
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
              }}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VendorRegistrationScreen;
