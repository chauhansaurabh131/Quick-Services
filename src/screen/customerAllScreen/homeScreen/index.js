import React, {useEffect, useState} from 'react';
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
import {setLocation} from '../../../redux/locationSlice';
import HomeScreenOurServicesComponent from '../../../components/homeScreenOurServicesComponent';
import HomeScreenQuickBookComponent from '../../../components/homeScreenQuickBookComponent';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const {
    latitude: savedLat,
    longitude: savedLon,
    place,
    fullAddress,
  } = useSelector(state => state.location);

  const [search, setSearch] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
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
      async position => {
        const {latitude, longitude} = position.coords;

        if (
          savedLat &&
          savedLon &&
          Math.abs(savedLat - latitude) < 0.0001 &&
          Math.abs(savedLon - longitude) < 0.0001
        ) {
          return;
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

          const addr = addressRes.data.address;

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
                  placeholder="Search for Services (Cleaning)"
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
