import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  PermissionsAndroid,
  Platform,
  Image,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';

import {colors} from '../../../utils/colors';
import {icons} from '../../../assets';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {setLocation} from '../../../actions/locationActions';
import HomeScreenOurServicesComponent from '../../../components/homeScreenOurServicesComponent';
import HomeScreenQuickBookComponent from '../../../components/homeScreenQuickBookComponent';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {customerAuth} from '../../../apis';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const {
    latitude: savedLat,
    longitude: savedLon,
    place,
    fullAddress,
  } = useSelector(state => state.location);
  const {user} = useSelector(state => state.auth || {});

  const [search, setSearch] = useState('');
  const {t} = useTranslation();

  const locationRef = useRef({latitude: savedLat, longitude: savedLon});

  useEffect(() => {
    locationRef.current = {latitude: savedLat, longitude: savedLon};
  }, [savedLat, savedLon]);

  const getAuthTokenAndUserId = async () => {
    let token = await AsyncStorage.getItem('token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      let rawToken =
        user?.token ||
        user?.accessToken ||
        user?.data?.token ||
        user?.data?.accessToken ||
        user?.tokens?.access?.token ||
        user?.tokens?.access ||
        user?.data?.tokens?.access?.token ||
        user?.data?.tokens?.access ||
        user?.user?.token ||
        user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const userId =
      user?.id ||
      user?._id ||
      user?.user?.id ||
      user?.user?._id ||
      user?.customerUser?.id ||
      user?.customerUser?._id ||
      user?.data?.user?.id ||
      user?.data?.user?._id ||
      user?.data?.id ||
      user?.data?._id;

    return {token, userId};
  };

  useEffect(() => {
    let watchId = null;

    const initLocationTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        dispatch(
          setLocation({
            latitude: null,
            longitude: null,
            place: 'Permission denied',
            fullAddress: '',
          }),
        );
        return;
      }

      getCurrentLocation();

      watchId = Geolocation.watchPosition(
        position => {
          const {longitude, latitude} = position.coords;
          console.log(
            'HomeScreen Live Location Update -> Longitude:',
            longitude,
            'Latitude:',
            latitude,
          );
          handleNewCoordinates(longitude, latitude);
        },
        error => {
          console.log('HomeScreen Geolocation watch error:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 4000,
          fastestInterval: 2000,
        },
      );
    };

    initLocationTracking();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (savedLon !== null && savedLat !== null) {
      console.log(
        'HomeScreen Redux Location -> Longitude:',
        savedLon,
        'Latitude:',
        savedLat,
      );
    }
  }, [savedLon, savedLat]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleNewCoordinates = async (longitude, latitude) => {
    const prevLon = locationRef.current.longitude;
    const prevLat = locationRef.current.latitude;

    if (
      prevLon &&
      prevLat &&
      Math.abs(prevLon - longitude) < 0.0001 &&
      Math.abs(prevLat - latitude) < 0.0001
    ) {
      return;
    }

    // Send PUT request to location API
    try {
      const {token, userId} = await getAuthTokenAndUserId();
      console.log('Updating location API for User ID:', userId);

      if (userId && token) {
        const locationPayload = {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        };

        console.log(
          `PUT Request to /customer/user/${userId}:`,
          JSON.stringify(locationPayload),
        );

        const apiRes = await customerAuth.updateUserLocation(
          userId,
          locationPayload,
          token,
        );

        console.log(
          'Location API Update Success:',
          JSON.stringify(apiRes?.data, null, 2),
        );
      } else {
        console.log(
          'Location API Update skipped (Missing User ID or Token). User ID:',
          userId,
          '| Token present:',
          !!token,
        );
      }
    } catch (apiErr) {
      console.log(
        'Location API Update Error:',
        apiErr?.response?.data || apiErr?.message,
      );
    }

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
          latitude,
          longitude,
          place: city,
          fullAddress: newFullAddress,
        }),
      );
    } catch (error) {
      dispatch(
        setLocation({
          latitude,
          longitude,
          place: 'Unable to fetch location',
          fullAddress: '',
        }),
      );
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      dispatch(
        setLocation({
          latitude: null,
          longitude: null,
          place: 'Permission denied',
          fullAddress: '',
        }),
      );
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const {longitude, latitude} = position.coords;
        console.log(
          'HomeScreen Initial Location -> Longitude:',
          longitude,
          'Latitude:',
          latitude,
        );
        handleNewCoordinates(longitude, latitude);
      },
      error => {
        dispatch(
          setLocation({
            latitude: null,
            longitude: null,
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
        {/* HEADER */}
        <View
          style={{
            marginTop: hp(18),
            marginHorizontal: wp(18),
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp(10),
          }}>
          <Image
            source={icons.doormigo_Icon}
            style={{width: wp(62), height: hp(18), resizeMode: 'contain'}}
          />

          <Image
            source={icons.notification_Bell_Icon}
            style={{width: wp(13), height: hp(16), resizeMode: 'contain'}}
          />
        </View>

        <FlatList
          data={[]}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* LOCATION */}
              <View style={{marginHorizontal: wp(18), marginTop: hp(6)}}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View
                    style={{
                      width: hp(32),
                      height: hp(32),
                      backgroundColor: '#F6F6F6',
                      borderRadius: hp(50),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={icons.location_Icon}
                      style={{
                        width: wp(9),
                        height: hp(13),
                        resizeMode: 'contain',
                      }}
                    />
                  </View>

                  <View style={{marginLeft: wp(7), flex: 1}}>
                    <Text
                      style={{
                        color: colors.pureBlack,
                        fontSize: fontSize(10),
                        fontFamily: fontFamily.poppins600,
                      }}>
                      {place}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{
                        color: colors.black,
                        fontSize: fontSize(8),
                        fontFamily: fontFamily.poppins400,
                      }}>
                      {fullAddress}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* SEARCH BAR */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: hp(40),
                  borderRadius: hp(50),
                  borderWidth: 1,
                  borderColor: '#E1E1E1',
                  paddingHorizontal: wp(14),
                  backgroundColor: '#F9FAFB',
                  marginHorizontal: wp(18),
                  marginTop: hp(20),
                }}>
                <Image
                  source={icons.search_Icon}
                  style={{
                    width: hp(13),
                    height: hp(13),
                    tintColor: '#9E9E9E',
                    marginRight: wp(8),
                    resizeMode: 'contain',
                  }}
                />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  // placeholder="Search for Services (Cleaning)"
                  placeholder={t('searchServices')}
                  placeholderTextColor="#9E9E9E"
                  style={{
                    flex: 1,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                    color: '#000',
                    paddingVertical: 0,
                    top: 2,
                  }}
                />
              </View>

              {/* OUR SERVICES */}
              <View style={{marginHorizontal: wp(18), marginTop: hp(20)}}>
                <HomeScreenOurServicesComponent />
              </View>

              {/* QUICK BOOK */}
              <HomeScreenQuickBookComponent />

              <View style={{height: hp(30)}} />
            </>
          }
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;
