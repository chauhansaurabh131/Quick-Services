import React from 'react';
import {
  ImageBackground,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {images} from '../../../assets';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import VendorLoginScreen from '../vendorLoginScreen';

const VendorChooseRegistrationScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View style={{height: '50%'}}>
        <ImageBackground
          source={images.login_screen_img}
          style={{width: '100%', height: '100%'}}
          resizeMode="stretch"
        />
      </View>

      <View style={{flex: 1, marginTop: hp(37)}}>
        <View style={{marginHorizontal: wp(25)}}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(28),
              fontFamily: fontFamily.poppins600,
            }}>
            {t('welcome')}
            {'\n'}
            {t('bookMyService')}
          </Text>

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins500,
              marginTop: hp(8),
            }}>
            Enter your mobile number to get started
          </Text>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              navigation.navigate('VendorLoginScreen');
            }}
            style={{
              width: '100%',
              height: hp(50),
              backgroundColor: colors.primaryColor,
              borderRadius: hp(50),
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: hp(40),
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              Already Member? Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              navigation.navigate('VendorRegistrationScreen');
            }}
            style={{
              width: '100%',
              height: hp(50),
              borderRadius: hp(50),
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: hp(20),
              borderWidth: hp(1),
              borderColor: '#731EE2',
            }}>
            <Text
              style={{
                color: colors.primaryColor,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              New Vendor? Start Registration
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VendorChooseRegistrationScreen;
