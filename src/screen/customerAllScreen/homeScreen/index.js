import React, { useEffect, useState, useRef } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';

import { colors } from '../../../utils/colors';
import { icons } from '../../../assets';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { setLocation } from '../../../actions/locationActions';
import HomeScreenOurServicesComponent from '../../../components/homeScreenOurServicesComponent';
import HomeScreenQuickBookComponent from '../../../components/homeScreenQuickBookComponent';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { customerAuth } from '../../../apis';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const {
    latitude: savedLat,
    longitude: savedLon,
    place,
    fullAddress,
    isManualSelection,
  } = useSelector(state => state.location || {});
  const { user } = useSelector(state => state.auth || {});

  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  const navigation = useNavigation();

  const locationRef = useRef({ latitude: savedLat, longitude: savedLon });

  useFocusEffect(
    React.useCallback(() => {
      // Keep session location if manually selected, otherwise live location
    }, []),
  );

  useEffect(() => {
    locationRef.current = { latitude: savedLat, longitude: savedLon };
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

    return { token, userId };
  };

  useEffect(() => {
    let watchId = null;

    const initLocationTracking = async () => {
      try {
        const savedLoc = await AsyncStorage.getItem('SELECTED_LOCATION');
        if (savedLoc) {
          const parsed = JSON.parse(savedLoc);
          if (parsed && parsed.latitude && parsed.longitude) {
            dispatch(
              setLocation({
                latitude: parsed.latitude,
                longitude: parsed.longitude,
                place: parsed.place || parsed.houseNumber || parsed.city || 'Selected Location',
                fullAddress: parsed.fullAddress || parsed.address || '',
              }),
            );
          }
        }
      } catch (err) {}

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
          const { longitude, latitude } = position.coords;
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
      handleNewCoordinates(savedLon, savedLat);
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

  const handleNewCoordinates = async (longitude, latitude, force = false) => {
    if (!longitude || !latitude) return;

    const prevLon = locationRef.current.longitude;
    const prevLat = locationRef.current.latitude;

    if (
      !force &&
      prevLon &&
      prevLat &&
      fullAddress &&
      fullAddress !== 'Current Location' &&
      fullAddress.length > 20 &&
      Math.abs(prevLon - longitude) < 0.0001 &&
      Math.abs(prevLat - latitude) < 0.0001
    ) {
      return;
    }

    // Send PUT request to location API
    try {
      const { token, userId } = await getAuthTokenAndUserId();
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
      }
    } catch (apiErr) {
      console.log(
        'Location API Update Error:',
        apiErr?.response?.data || apiErr?.message,
      );
    }

    try {
      const GOOGLE_MAPS_API_KEY = 'AIzaSyBaqU_1hOFIhVLm8su_caJheEChJCNBTyY';
      let city = '';
      let district = '';
      let state = '';
      let newFullAddress = '';
      let poiBuildingName = '';

      // 1. Try Google Geocoding API for exact city, area, & street address
      if (
        GOOGLE_MAPS_API_KEY &&
        GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
      ) {
        try {
          const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
          const gRes = await axios.get(gUrl);

          if (
            gRes.data?.status === 'OK' &&
            gRes.data?.results &&
            gRes.data.results.length > 0
          ) {
            const firstResult = gRes.data.results[0];
            newFullAddress = firstResult.formatted_address || '';

            let sublocalityVal = '';
            let neighborhoodVal = '';
            let localityVal = '';

            firstResult.address_components?.forEach(comp => {
              if (
                comp.types.includes('sublocality_level_1') ||
                comp.types.includes('sublocality')
              ) {
                sublocalityVal = comp.long_name;
              }
              if (
                comp.types.includes('neighborhood') ||
                comp.types.includes('sublocality_level_2')
              ) {
                neighborhoodVal = comp.long_name;
              }
              if (
                comp.types.includes('locality') ||
                comp.types.includes('postal_town')
              ) {
                localityVal = comp.long_name;
              }
              if (comp.types.includes('administrative_area_level_1')) {
                state = comp.long_name;
              }
            });

            city = sublocalityVal || neighborhoodVal || localityVal;
          }
        } catch (gErr) {
          console.log('[HomeScreen Location] Google Geocoding Error:', gErr?.message);
        }

        // 2. Google Nearby Search API to extract POI/building name (matches ChangeLocationScreen!)
        try {
          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=150&key=${GOOGLE_MAPS_API_KEY}`;
          const nRes = await axios.get(nearbyUrl);
          if (nRes.data?.status === 'OK' && nRes.data?.results?.length > 0) {
            const getDist = p => {
              const pLat = p.geometry?.location?.lat || latitude;
              const pLng = p.geometry?.location?.lng || longitude;
              return Math.pow(pLat - latitude, 2) + Math.pow(pLng - longitude, 2);
            };

            const sortedResults = [...nRes.data.results].sort(
              (a, b) => getDist(a) - getDist(b),
            );

            const detailedPlace = sortedResults.find(
              p =>
                p.name &&
                !p.types?.includes('locality') &&
                !p.types?.includes('political') &&
                !p.types?.includes('administrative_area_level_1') &&
                !p.types?.includes('country'),
            );

            if (detailedPlace && detailedPlace.name) {
              const poiName = detailedPlace.name;
              const vicinity = detailedPlace.vicinity || '';

              poiBuildingName = poiName;

              if (!newFullAddress || !newFullAddress.toLowerCase().includes(poiName.toLowerCase())) {
                const combined = [poiName, vicinity !== poiName ? vicinity : '', newFullAddress].filter(Boolean);
                newFullAddress = Array.from(new Set(combined)).join(', ');
              }
            }
          }
        } catch (nErr) {
          console.log('[HomeScreen Location] Nearby Search Error:', nErr?.message);
        }
      }

      // 2. OpenStreetMap Reverse Geocoding Fallback if Geocoding API denied/failed
      if (!newFullAddress || !city) {
        const fetchOsmAddress = async () => {
          const addressRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: { 'User-Agent': 'QuickServiceApp/1.0' },
            },
          );

          if (addressRes.data) {
            const addr = addressRes.data.address || {};
            const houseNo = addr.house_number || addr.housenumber || addr.building || '';
            const poiName =
              addr.amenity ||
              addr.shop ||
              addr.office ||
              addr.tourism ||
              addr.leisure ||
              addr.name ||
              '';
            const localArea =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.quarter ||
              addr.industrial ||
              addr.commercial ||
              '';
            const roadName = addr.road || addr.pedestrian || addr.street || '';
            const townName =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.hamlet ||
              addr.county ||
              addr.state_district ||
              '';
            const districtName = addr.state_district || addr.county || '';
            const stateNameVal = addr.state || '';

            const roadWithHouseNo = [houseNo, roadName].filter(Boolean).join(' ');
            const parts = [
              poiName,
              roadWithHouseNo || roadName,
              localArea,
              townName,
              districtName !== townName ? districtName : '',
              stateNameVal,
            ].filter(Boolean);

            if (!newFullAddress) {
              newFullAddress =
                parts.length > 0
                  ? Array.from(new Set(parts)).join(', ')
                  : addressRes.data.display_name || '';
            }

            if (!city) {
              city = localArea || townName || districtName || stateNameVal;
            }
          }
        };

        try {
          await fetchOsmAddress();
        } catch (osmErr) {
          if (osmErr?.response?.status === 429) {
            // Rate limited: wait 800ms and retry once
            await new Promise(res => setTimeout(res, 800));
            try {
              await fetchOsmAddress();
            } catch (retryErr) {
              console.log('[HomeScreen Location] OSM Retry Error:', retryErr?.message);
            }
          } else {
            console.log('[HomeScreen Location] OSM Reverse Error:', osmErr?.message);
          }
        }
      }

      const displayCity =
        city ||
        (newFullAddress ? newFullAddress.split(',').slice(-3)[0]?.trim() || newFullAddress.split(',')[0].trim() : 'Current Location');
      const displayAddress = newFullAddress || 'Current Location';

      // If user manually selected a location during active session, preserve it
      if (isManualSelection && fullAddress && fullAddress !== 'Current Location') {
        console.log('🏠 HOMESCREEN PRESERVING MANUAL SESSION LOCATION:', fullAddress);
        return;
      }

      console.log('\n==================================================');
      console.log('🏠 HOMESCREEN LIVE CURRENT GPS LOCATION:', displayCity);
      console.log('🏠 HOMESCREEN LIVE FULL ADDRESS:', displayAddress);
      console.log('==================================================\n');

      dispatch(
        setLocation({
          latitude,
          longitude,
          place: displayCity,
          fullAddress: displayAddress,
          isManualSelection: false,
        }),
      );
    } catch (error) {
      dispatch(
        setLocation({
          latitude,
          longitude,
          place: 'Current Location',
          fullAddress: 'Current Location',
        }),
      );
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      if (savedLat && savedLon) {
        handleNewCoordinates(savedLon, savedLat, true);
      }
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        if (position?.coords?.latitude && position?.coords?.longitude) {
          const { longitude, latitude } = position.coords;
          console.log(
            'HomeScreen Live Location Fetched -> Longitude:',
            longitude,
            'Latitude:',
            latitude,
          );
          handleNewCoordinates(longitude, latitude, true);
        } else if (savedLon && savedLat) {
          handleNewCoordinates(savedLon, savedLat, true);
        }
      },
      error => {
        console.log('[HomeScreen] GPS Error:', error?.message);
        if (savedLon && savedLat) {
          handleNewCoordinates(savedLon, savedLat, true);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5000,
      },
    );
  };

  const getDynamicCityTitle = (currentPlace, addr) => {
    if (
      currentPlace &&
      typeof currentPlace === 'string' &&
      currentPlace.trim() !== '' &&
      currentPlace !== 'Location updated'
    ) {
      return currentPlace.trim();
    }

    if (
      addr &&
      typeof addr === 'string' &&
      addr.trim() !== '' &&
      addr !== 'Location updated'
    ) {
      const parts = addr.split(',').map(s => s.trim()).filter(Boolean);
      return parts[0] || 'Current Location';
    }

    return 'Current Location';
  };

  const displayCityTitle = getDynamicCityTitle(place, fullAddress);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
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
            style={{ width: wp(62), height: hp(18), resizeMode: 'contain' }}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MyBookingScreen')}>
            <Image
              source={icons.notification_Bell_Icon}
              style={{ width: wp(16), height: hp(18), resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={[]}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* LOCATION HEADER CARD - TOUCHABLE LOCATION PICKER */}
              <View style={{ marginHorizontal: wp(18), marginTop: hp(10) }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ChangeLocationScreen')
                  }
                  style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Round Light Circle Pin Container */}
                  <View
                    style={{
                      width: hp(38),
                      height: hp(38),
                      backgroundColor: '#F3F4F6',
                      borderRadius: hp(19),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={icons.location_Icon}
                      style={{
                        width: wp(12),
                        height: hp(16),
                        resizeMode: 'contain',
                        tintColor: '#000000',
                      }}
                    />
                  </View>

                  {/* Location Title & Full Address */}
                  <View
                    style={{ marginLeft: wp(10), flex: 1, marginRight: wp(8) }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: colors.pureBlack,
                        fontSize: fontSize(13),
                        fontFamily: fontFamily.poppins600,
                        fontWeight: '700',
                      }}>
                      {displayCityTitle}
                    </Text>

                    <Text
                      numberOfLines={3}
                      style={{
                        color: '#8E8E93',
                        fontSize: fontSize(10),
                        fontFamily: fontFamily.poppins400,
                        marginTop: hp(1),
                      }}>
                      {fullAddress || 'Locating address...'}
                    </Text>
                  </View>

                  {/* Dropdown Chevron Arrow Icon */}
                  <Image
                    source={icons.bottom_Arrow_Icon}
                    style={{
                      width: wp(12),
                      height: hp(12),
                      resizeMode: 'contain',
                      tintColor: '#000000',
                    }}
                  />
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
              <View style={{ marginHorizontal: wp(18), marginTop: hp(20) }}>
                <HomeScreenOurServicesComponent />
              </View>

              {/* QUICK BOOK */}
              <HomeScreenQuickBookComponent />

              <View style={{ height: hp(30) }} />
            </>
          }
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;
