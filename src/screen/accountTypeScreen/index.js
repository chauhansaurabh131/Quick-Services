import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setLocation } from '../../actions/locationActions';
import { style } from '../customerAllScreen/loginScreen/style';
import { icons, images } from '../../assets';
import { colors } from '../../utils/colors';
import { fontFamily, fontSize, hp, wp } from '../../utils/helpers';

const AccountTypeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { t } = useTranslation();

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    const fetchLocationOnMount = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        dispatch(
          setLocation({
            longitude: null,
            latitude: null,
            place: 'Permission denied',
            fullAddress: '',
          }),
        );
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const { longitude, latitude } = position.coords;
          console.log(
            'AccountTypeScreen Location -> Longitude:',
            longitude,
            'Latitude:',
            latitude,
          );

          try {
            const addressRes = await axios.get(
              'https://nominatim.openstreetmap.org/reverse',
              {
                params: {
                  lat: latitude,
                  lon: longitude,
                  format: 'json',
                },
                headers: {
                  'User-Agent': 'doormigo-app',
                },
              },
            );

            const addr = addressRes.data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.hamlet ||
              addr.county ||
              '';
            const district = addr.state_district || '';
            const state = addr.state || '';
            const newFullAddress = `${city}, ${district}, ${state}`;

            dispatch(
              setLocation({
                longitude,
                latitude,
                place: city,
                fullAddress: newFullAddress,
              }),
            );
          } catch (error) {
            dispatch(
              setLocation({
                longitude,
                latitude,
                place: 'Unable to fetch location',
                fullAddress: '',
              }),
            );
          }
        },
        error => {
          console.log('AccountTypeScreen Geolocation error:', error);
          dispatch(
            setLocation({
              longitude: null,
              latitude: null,
              place: 'Location error',
              fullAddress: '',
            }),
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    };

    fetchLocationOnMount();
  }, [dispatch]);

  const handleAccountSelection = async type => {
    try {
      await AsyncStorage.setItem('accountType', type);
      if (type === 'customer') {
        navigation.navigate('Login');
      } else {
        navigation.navigate('VendorChooseRegistrationScreen');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ height: '50%' }}>
        <ImageBackground
          source={images.login_screen_img}
          style={{ width: '100%', height: '100%' }}
          resizeMode="stretch"
        />
      </View>

      <View style={{ flex: 1, marginTop: hp(37) }}>
        <View style={{ marginHorizontal: wp(25) }}>
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

          <View style={{ alignItems: 'center', marginTop: hp(71) }}>
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
