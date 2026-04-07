import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {style} from '../customerAllScreen/loginScreen/style';
import {icons, images} from '../../assets';
import {colors} from '../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../utils/helpers';

const AccountTypeScreen = () => {
  const navigation = useNavigation();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const {t} = useTranslation();

  const handleAccountSelection = async type => {
    try {
      await AsyncStorage.setItem('accountType', type);
      if (type === 'customer') {
        navigation.navigate('Login');
      } else {
        navigation.navigate('Login');
      }
    } catch (e) {
      console.error(e);
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

          <View style={{alignItems: 'center', marginTop: hp(71)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins500,
              }}>
              Select Your Account Type
            </Text>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => handleAccountSelection('customer')}
              style={{
                width: '100%',
                height: hp(50),
                backgroundColor: colors.primaryColor,
                borderRadius: hp(50),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: hp(27),
              }}>
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                I am a Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => handleAccountSelection('vendor')}
              style={{
                width: '100%',
                height: hp(50),
                backgroundColor: '#A364F5',
                borderRadius: hp(50),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: hp(12),
              }}>
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                I am a Service Provider
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default AccountTypeScreen;
