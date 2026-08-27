import React, {useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  PermissionsAndroid,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons, images} from '../../../assets';
import {useNavigation, useRoute} from '@react-navigation/native';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';

import {useDispatch, useSelector} from 'react-redux';
import {
  saveCustomerAddress,
  updateCustomerAddress,
} from '../../../actions/customerAuthActions';

import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';

let GooglePlacesAutocomplete = null;
try {
  const placesModule = require('react-native-google-places-autocomplete');
  GooglePlacesAutocomplete =
    placesModule.GooglePlacesAutocomplete || placesModule.default;
} catch (e) {
  GooglePlacesAutocomplete = null;
}

// -------------------------------------------------------------
// CONFIGURATION: Set your Google Maps API Key here or pass via env
// -------------------------------------------------------------
const GOOGLE_MAPS_API_KEY = 'AIzaSyBaqU_1hOFIhVLm8su_caJheEChJCNBTyY';

const EnumLocationTypeOfAddress = {
  HOME: 'home',
  WORK: 'work',
  HOTEL: 'hotel',
  OTHER: 'other',
};

const EnterCompleteAddressScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const editData = route.params?.editData;
  const navigation = useNavigation();
  const {t} = useTranslation();
  const mapRef = useRef(null);

  const reduxLocation = useSelector(state => state.location || {});

  // Extract live location from route params or Redux state (HomeScreen Live Location)
  const routeLat =
    route.params?.latitude ||
    route.params?.location?.latitude ||
    route.params?.currentLocation?.latitude ||
    reduxLocation?.latitude;

  const routeLng =
    route.params?.longitude ||
    route.params?.location?.longitude ||
    route.params?.currentLocation?.longitude ||
    reduxLocation?.longitude;

  // Default Coordinates: Bardoli Live Location (Lat: 21.1255599, Lng: 73.1155615)
  const DEFAULT_LAT = 21.1255599;
  const DEFAULT_LNG = 73.1155615;

  const initialLat = editData?.latitude || routeLat || DEFAULT_LAT;
  const initialLng = editData?.longitude || routeLng || DEFAULT_LNG;

  // Map Region State (Default coordinates: Live Location / Bardoli)
  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  });

  // Form Fields State
  const [loading, setLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [selectedType, setSelectedType] = useState('Home');
  const [address, setAddress] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Search Bar Auto-Complete Suggestion State
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef(null);

  // Debounced Search Text Change Handler (Prevents HTTP 429 Rate Limits)
  const handleSearchTextChange = text => {
    setSearchText(text);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimerRef.current = setTimeout(() => {
      fetchSearchSuggestions(text);
    }, 400);
  };

  // Search Place Auto-Complete Suggestions (Google Places + OpenStreetMap Fallback)
  const fetchSearchSuggestions = async query => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setSearching(true);
      let list = [];

      // 1. Try Google Places Autocomplete (Biased to current location / Bardoli 50km radius)
      if (
        GOOGLE_MAPS_API_KEY &&
        GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
      ) {
        try {
          const gUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query,
          )}&location=${region.latitude},${
            region.longitude
          }&radius=50000&components=country:in&key=${GOOGLE_MAPS_API_KEY}`;
          const gRes = await axios.get(gUrl);

          if (gRes.data?.status === 'OK' && gRes.data?.predictions) {
            list = gRes.data.predictions.map(p => ({
              id: p.place_id,
              title: p.structured_formatting?.main_text || p.description,
              description: p.description,
              placeId: p.place_id,
              source: 'google',
            }));
          }
        } catch (gErr) {
          console.log('[Search] Google Places Error:', gErr?.message);
        }
      }

      // 2. OpenStreetMap Search for real location coordinates in India
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&countrycodes=in&limit=8&addressdetails=1`;

        const osmRes = await axios.get(osmUrl, {
          headers: {'User-Agent': 'QuickServiceApp'},
        });

        if (
          osmRes.data &&
          Array.isArray(osmRes.data) &&
          osmRes.data.length > 0
        ) {
          const osList = osmRes.data.map((item, idx) => ({
            id: `osm_${idx}_${item.place_id}`,
            title: item.display_name.split(',')[0],
            description: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            source: 'osm',
          }));

          // Merge OSM real-coordinate results
          list = [...list, ...osList];
        }

        // Also search with current city (e.g. query + " Bardoli") for local landmark matches
        const currentLocName = city || 'Bardoli';
        const localOsmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ' ' + currentLocName,
        )}&countrycodes=in&limit=5&addressdetails=1`;

        const localOsmRes = await axios.get(localOsmUrl, {
          headers: {'User-Agent': 'QuickServiceApp'},
        });

        if (
          localOsmRes.data &&
          Array.isArray(localOsmRes.data) &&
          localOsmRes.data.length > 0
        ) {
          const localList = localOsmRes.data.map((item, idx) => ({
            id: `osm_local_${idx}_${item.place_id}`,
            title: item.display_name.split(',')[0],
            description: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            source: 'osm',
          }));

          list = [...localList, ...list];
        }
      } catch (osmErr) {
        if (osmErr?.response?.status !== 429) {
          console.log('[Search] OSM Error:', osmErr?.message);
        }
      }

      // Filter out duplicate predictions by place ID / title
      const uniqueList = [];
      const seenTitles = new Set();
      list.forEach(item => {
        const titleKey = (item.title || item.description || '').toLowerCase();
        if (!seenTitles.has(titleKey)) {
          seenTitles.add(titleKey);
          uniqueList.push(item);
        }
      });

      console.log('\n==================================================');
      console.log('🔍 USER SEARCH QUERY:', query);
      console.log(`📍 SEARCH SUGGESTIONS FOUND (${uniqueList.length}):`);
      uniqueList.forEach((item, idx) => {
        console.log(
          `   ${idx + 1}. [${item.source.toUpperCase()}] ${item.title} -> ${
            item.description
          }`,
        );
      });
      console.log('==================================================\n');

      setSuggestions(uniqueList);
    } catch (err) {
      console.log('[SearchSuggestions] Error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Handle selection of suggested place -> Auto-fill text inputs & Navigate map pin
  const handleSelectSuggestion = async item => {
    setSearchText(item.title);
    setSuggestions([]);
    Keyboard.dismiss();

    if (item.source === 'custom_local') {
      setAddress(item.description);
      setHouseNumber(item.title);
      setLandmark(item.title);
      animateToLocation(region.latitude, region.longitude);
      return;
    }

    let targetLat = item.lat;
    let targetLng = item.lng;

    if (item.source === 'google' && item.placeId) {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.placeId}&key=${GOOGLE_MAPS_API_KEY}`;
        const dRes = await axios.get(detailsUrl);
        if (dRes.data?.result) {
          const result = dRes.data.result;

          if (result.geometry?.location) {
            targetLat = result.geometry.location.lat;
            targetLng = result.geometry.location.lng;
          }

          const formatted = result.formatted_address || item.description;
          setAddress(formatted);

          console.log('\n==================================================');
          console.log(
            '🎯 SELECTED SEARCH PLACE:',
            item.title || item.description,
          );
          console.log('📍 FULL ADDRESS:', formatted);
          console.log(
            '🎯 TARGET LATITUDE:',
            targetLat,
            '| TARGET LONGITUDE:',
            targetLng,
          );
          console.log('==================================================\n');

          if (result.address_components) {
            let streetVal = '';
            let areaVal = '';

            result.address_components.forEach(comp => {
              if (
                comp.types.includes('route') ||
                comp.types.includes('street_number')
              ) {
                streetVal += comp.long_name + ' ';
              }
              if (
                comp.types.includes('sublocality_level_1') ||
                comp.types.includes('sublocality') ||
                comp.types.includes('neighborhood')
              ) {
                areaVal = comp.long_name;
              }
              if (
                comp.types.includes('locality') ||
                comp.types.includes('postal_town')
              ) {
                setCity(comp.long_name);
              }
              if (comp.types.includes('administrative_area_level_1')) {
                setStateName(comp.long_name);
              }
              if (comp.types.includes('postal_code')) {
                setPinCode(comp.long_name);
              }
            });

            const placeName = areaVal || streetVal.trim() || item.title;
            setHouseNumber(placeName);
            setLandmark(placeName);
          }
        }
      } catch (dErr) {
        console.log('[PlaceDetails] Error:', dErr?.message);
        setAddress(item.description);
        setHouseNumber(item.title);
        setLandmark(item.title);
      }
    } else if (item.source === 'osm') {
      setAddress(item.description);
      setHouseNumber(item.title);
      setLandmark(item.title);

      console.log('\n==================================================');
      console.log('🎯 SELECTED SEARCH PLACE (OSM):', item.title);
      console.log('📍 FULL ADDRESS:', item.description);
      console.log(
        '🎯 TARGET LATITUDE:',
        targetLat,
        '| TARGET LONGITUDE:',
        targetLng,
      );
      console.log('==================================================\n');
    }

    if (targetLat && targetLng) {
      animateToLocation(targetLat, targetLng);
    }
  };

  const addressTypes = [
    {id: 1, label: t('home'), value: 'Home', icon: icons.purple_Home_Icon},
    {id: 2, label: t('work'), value: 'Work', icon: icons.work_Icon},
    {id: 3, label: t('hotel'), value: 'Hotel', icon: icons.hotel_Icon},
    {id: 4, label: t('other'), value: 'Other', icon: icons.other_Icon},
  ];

  useEffect(() => {
    if (editData) {
      const locType = editData.type || editData.locationType || 'Home';
      setSelectedType(
        locType.charAt(0).toUpperCase() + locType.slice(1).toLowerCase(),
      );
      setAddress(editData.address || '');
      setHouseNumber(editData.houseNumber || editData.flatNumber || '');
      setFloor(editData.floor || '');
      setLandmark(editData.landmark || '');
      setCity(editData.city || '');
      setStateName(editData.state || '');
      setPinCode(editData.pinCode || '');
      setName(editData.name || editData.receiverName || '');
      setMobile(
        editData.mobile || editData.receiverMobile
          ? String(editData.mobile || editData.receiverMobile)
          : '',
      );

      if (editData.latitude && editData.longitude) {
        animateToLocation(editData.latitude, editData.longitude);
      }
    } else {
      reverseGeocode(initialLat, initialLng);
      requestLocationPermission();
    }
  }, [editData]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 1. Request GPS Location Permission
  // 1. Request GPS Location Permission & Fetch Location
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'QuickService needs access to your location to pinpoint your address.',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchDeviceLocation();
        } else {
          reverseGeocode(DEFAULT_LAT, DEFAULT_LNG);
        }
      } else {
        const authStatus = await Geolocation.requestAuthorization('whenInUse');
        if (authStatus === 'granted') {
          fetchDeviceLocation();
        } else {
          reverseGeocode(DEFAULT_LAT, DEFAULT_LNG);
        }
      }
    } catch (err) {
      console.warn('Location Permission Error:', err);
      reverseGeocode(DEFAULT_LAT, DEFAULT_LNG);
    }
  };

  // 2. Fetch User Real Device GPS Location
  const fetchDeviceLocation = () => {
    try {
      if (
        !Geolocation ||
        typeof Geolocation.getCurrentPosition !== 'function'
      ) {
        return;
      }

      setFetchingAddress(true);
      Geolocation.getCurrentPosition(
        position => {
          if (position?.coords?.latitude && position?.coords?.longitude) {
            const {latitude, longitude} = position.coords;
            animateToLocation(latitude, longitude);
            reverseGeocode(latitude, longitude);
          } else {
            setFetchingAddress(false);
          }
        },
        error => {
          console.log(
            '[EnterCompleteAddressScreen] GPS Location error:',
            error,
          );
          setFetchingAddress(false);
          Alert.alert(
            'GPS Location Error',
            'Could not get device GPS location. Please turn on Location services on your phone.',
          );
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } catch (err) {
      console.log('[EnterCompleteAddressScreen] Location Exception:', err);
      setFetchingAddress(false);
    }
  };

  const getCurrentLocation = () => {
    requestLocationPermission();
  };

  // 3. Smooth Pan Map to Coordinate
  const animateToLocation = (lat, lng) => {
    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 800);
  };

  // 4. Reverse Geocoding (Lat/Lng -> Full Formatted Street / Area / City Address)
  const reverseGeocode = async (lat, lng) => {
    console.log('\n==================================================');
    console.log(
      `[ReverseGeocode] Dragged Pin Coordinates -> Lat: ${lat}, Lng: ${lng}`,
    );
    try {
      setFetchingAddress(true);
      let addressFound = false;

      if (
        GOOGLE_MAPS_API_KEY &&
        GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
      ) {
        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
          console.log('[ReverseGeocode] Requesting Google Geocoding API...');
          const res = await axios.get(url);

          console.log('[ReverseGeocode] Google API Status:', res.data?.status);
          if (res.data?.error_message) {
            console.log(
              '[ReverseGeocode] Google API Error Message:',
              res.data.error_message,
            );
          }

          if (
            res.data?.status === 'OK' &&
            res.data?.results &&
            res.data.results.length > 0
          ) {
            console.log(
              '[ReverseGeocode] Total Google Results Count:',
              res.data.results.length,
            );

            res.data.results.slice(0, 3).forEach((r, idx) => {
              console.log(
                `[ReverseGeocode] Result ${idx} (${r.types?.join(', ')}):`,
                r.formatted_address,
              );
            });

            const result = res.data.results[0];
            const fullAddressText = result.formatted_address || '';
            setAddress(fullAddressText);
            addressFound = true;

            console.log('\n==================================================');
            console.log('📍 DRAGGED PIN NEW ADDRESS:', fullAddressText);
            console.log('📍 COORDINATES:', `Lat: ${lat}, Lng: ${lng}`);
            console.log('==================================================\n');

            let streetVal = '';
            let areaVal = '';

            result.address_components.forEach(component => {
              if (
                component.types.includes('route') ||
                component.types.includes('street_number')
              ) {
                streetVal += component.long_name + ' ';
              }
              if (
                component.types.includes('sublocality_level_1') ||
                component.types.includes('sublocality') ||
                component.types.includes('neighborhood')
              ) {
                areaVal = component.long_name;
              }
              if (
                component.types.includes('locality') ||
                component.types.includes('postal_town')
              ) {
                setCity(component.long_name);
              }
              if (component.types.includes('administrative_area_level_1')) {
                setStateName(component.long_name);
              }
              if (component.types.includes('postal_code')) {
                setPinCode(component.long_name);
              }
            });

            const placeName = areaVal || streetVal.trim();
            if (placeName) {
              setHouseNumber(placeName);
              setLandmark(placeName);
            }
          }
        } catch (googleErr) {
          console.log(
            '[ReverseGeocode] Google Geocoding Axios Catch Error:',
            googleErr?.response?.data || googleErr?.message,
          );
        }
      }

      // Try Google Places Nearby Search API (returns exact POI, society, building, and road vicinity)
      if (!addressFound && GOOGLE_MAPS_API_KEY) {
        try {
          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=250&key=${GOOGLE_MAPS_API_KEY}`;
          const nRes = await axios.get(nearbyUrl);
          if (nRes.data?.status === 'OK' && nRes.data?.results?.length > 0) {
            // Calculate distance to pin for each result to pick the exact place under the pin
            const getDist = p => {
              const pLat = p.geometry?.location?.lat || lat;
              const pLng = p.geometry?.location?.lng || lng;
              return Math.pow(pLat - lat, 2) + Math.pow(pLng - lng, 2);
            };

            const sortedResults = [...nRes.data.results].sort(
              (a, b) => getDist(a) - getDist(b),
            );

            // Pick place with specific street / POI details closest to pin
            const detailedPlace =
              sortedResults.find(
                p =>
                  p.vicinity &&
                  p.vicinity.toLowerCase() !== 'bardoli' &&
                  !p.types?.includes('locality') &&
                  !p.types?.includes('political'),
              ) || sortedResults[0];

            const placeVicinity =
              detailedPlace.vicinity || detailedPlace.name || '';
            const fullAddr =
              placeVicinity.includes('Gujarat') ||
              placeVicinity.includes('Bardoli')
                ? `${placeVicinity}, Gujarat, India`
                : `${placeVicinity}, Bardoli, Gujarat, India`;

            setAddress(fullAddr);
            setHouseNumber(detailedPlace.name || placeVicinity.split(',')[0]);
            setLandmark(placeVicinity);
            setCity('Bardoli');
            setStateName('Gujarat');
            setPinCode('394600');
            addressFound = true;

            console.log('\n==================================================');
            console.log(
              '📍 DRAGGED PIN NEW ADDRESS (GOOGLE PLACES):',
              fullAddr,
            );
            console.log(
              '📍 BUILDING / LANDMARK:',
              detailedPlace.name,
              '| VICINITY:',
              placeVicinity,
            );
            console.log('📍 COORDINATES:', `Lat: ${lat}, Lng: ${lng}`);
            console.log('==================================================\n');
          }
        } catch (nErr) {
          console.log('[ReverseGeocode] Nearby Search Error:', nErr?.message);
        }
      }

      if (!addressFound) {
        console.log('[ReverseGeocode] Falling back to OpenStreetMap...');
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {headers: {'User-Agent': 'QuickServiceApp'}},
        );

        if (res.data) {
          const addr = res.data.address || {};
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
            addr.town ||
            addr.city ||
            addr.village ||
            addr.hamlet ||
            addr.county ||
            '';
          const districtName = addr.state_district || addr.county || '';
          const stateNameVal = addr.state || '';
          const postCodeVal = addr.postcode || '';

          const parts = [
            localArea,
            roadName,
            townName,
            districtName !== townName ? districtName : '',
            stateNameVal,
            postCodeVal,
          ].filter(Boolean);

          const formattedCleanAddress =
            parts.length > 0
              ? Array.from(new Set(parts)).join(', ')
              : res.data.display_name || '';

          setAddress(formattedCleanAddress);
          setCity(townName);
          setStateName(stateNameVal);
          setPinCode(postCodeVal);

          const placeName = localArea || roadName || townName;
          if (placeName) {
            setHouseNumber(placeName);
            setLandmark(placeName);
          }

          console.log('\n==================================================');
          console.log(
            '📍 DRAGGED PIN NEW ADDRESS (OSM):',
            formattedCleanAddress,
          );
          console.log('📍 COORDINATES:', `Lat: ${lat}, Lng: ${lng}`);
          console.log('==================================================\n');
        }
      }
    } catch (error) {
      console.log(
        '[EnterCompleteAddressScreen] Reverse Geocoding Error:',
        error,
      );
    } finally {
      setFetchingAddress(false);
      console.log('==================================================\n');
    }
  };

  // 5. Called when user starts dragging map under the center pin
  const onRegionChange = () => {
    if (!fetchingAddress) {
      setFetchingAddress(true);
    }
  };

  // Called when user finishes dragging map under the center pin
  const onRegionChangeComplete = newRegion => {
    setRegion(newRegion);
    reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const isFormValid =
    address.trim() !== '' && name.trim() !== '' && mobile.trim().length === 10;

  // 6. Submit Address to QuickService API via Redux Saga
  const handleSaveAddress = async () => {
    if (!isFormValid || loading) {
      return;
    }

    setLoading(true);

    const locKey = selectedType.toUpperCase();
    const locationTypeVal =
      EnumLocationTypeOfAddress[locKey] || selectedType.toLowerCase();
    const numericMobile = Number(mobile.replace(/\D/g, ''));

    const isEditMode = Boolean(editData && (editData.id || editData._id));
    const addressId = editData?.id || editData?._id;

    const payload = {
      locationType: locationTypeVal,
      address: address.trim(),
      receiverName: name.trim(),
      receiverMobile: isNaN(numericMobile) ? mobile : numericMobile,
      latitude: region.latitude,
      longitude: region.longitude,
      location: {
        type: 'Point',
        coordinates: [region.longitude, region.latitude], // Mongo GeoJSON format: [lng, lat]
      },
    };

    if (houseNumber.trim() !== '') {
      payload.houseNumber = houseNumber.trim();
    }

    if (floor.trim() !== '') {
      payload.floor = floor.trim();
    }

    if (landmark.trim() !== '') {
      payload.landmark = landmark.trim();
    }

    if (city) {
      payload.city = city;
    }
    if (stateName) {
      payload.state = stateName;
    }
    if (pinCode) {
      payload.pinCode = pinCode;
    }

    console.log('\n==================================================');
    console.log('💾 SAVED ADDRESS PAYLOAD TO TERMINAL:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('==================================================\n');

    if (!isEditMode) {
      payload.isDefault = true;
    }

    console.log(
      '==================================================',
      '\n[EnterCompleteAddressScreen Swiggy/Zomato Style Payload]',
      `\nMode: ${isEditMode ? 'UPDATE (PUT)' : 'CREATE (POST)'}`,
      `\nEndpoint: ${
        isEditMode
          ? `PUT /customer/address/${addressId}`
          : 'POST /customer/address'
      }`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    const actionToDispatch = isEditMode
      ? updateCustomerAddress(
          addressId,
          payload,
          async (error, responseData) => {
            setLoading(false);
            if (
              error ||
              responseData?.status === 'Failure' ||
              responseData?.code >= 400
            ) {
              const errMsgs =
                error?.message ||
                responseData?.message ||
                'Failed to update address';
              Alert.alert(
                'Error',
                typeof errMsgs === 'string' ? errMsgs : JSON.stringify(errMsgs),
              );
              return;
            }

            try {
              const existing = await AsyncStorage.getItem('ADDRESSES');
              let addressList = existing ? JSON.parse(existing) : [];

              const updatedList = addressList.map(item =>
                item.id === addressId || item._id === addressId
                  ? {
                      ...item,
                      type: selectedType,
                      locationType: locationTypeVal,
                      address,
                      houseNumber,
                      floor,
                      landmark,
                      name,
                      mobile,
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }
                  : item,
              );

              await AsyncStorage.setItem(
                'ADDRESSES',
                JSON.stringify(updatedList),
              );
            } catch (storageErr) {
              console.log(
                '[EnterCompleteAddressScreen] Local Storage Error:',
                storageErr,
              );
            }

            navigation.goBack();
          },
        )
      : saveCustomerAddress(payload, async (error, responseData) => {
          setLoading(false);
          if (
            error ||
            responseData?.status === 'Failure' ||
            responseData?.code >= 400
          ) {
            const errMsgs =
              error?.message ||
              responseData?.message ||
              'Failed to save address';
            Alert.alert(
              'Error',
              typeof errMsgs === 'string' ? errMsgs : JSON.stringify(errMsgs),
            );
            return;
          }

          try {
            const existing = await AsyncStorage.getItem('ADDRESSES');
            let addressList = existing ? JSON.parse(existing) : [];

            const savedAddressData = responseData?.data || responseData || {};
            const newAddress = {
              id: savedAddressData?.id || savedAddressData?._id || Date.now(),
              type: selectedType,
              locationType: locationTypeVal,
              address,
              houseNumber,
              floor,
              landmark,
              name,
              mobile,
              isDefault: true,
              latitude: region.latitude,
              longitude: region.longitude,
            };

            addressList.push(newAddress);
            await AsyncStorage.setItem(
              'ADDRESSES',
              JSON.stringify(addressList),
            );
          } catch (storageErr) {
            console.log(
              '[EnterCompleteAddressScreen] Local Storage Error:',
              storageErr,
            );
          }

          navigation.goBack();
        });

    dispatch(actionToDispatch);
  };

  const isNativeMapAvailable = () => {
    try {
      const {UIManager} = require('react-native');
      const hasValidKey =
        Boolean(GOOGLE_MAPS_API_KEY) &&
        GOOGLE_MAPS_API_KEY.startsWith('AIzaSy');

      return Boolean(
        MapView &&
          hasValidKey &&
          (UIManager.getViewManagerConfig?.('AIRMap') || UIManager.AIRMap),
      );
    } catch (e) {
      return true;
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            {/* HEADER */}
            <View
              style={{
                height: hp(50),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  position: 'absolute',
                  left: 0,
                  width: wp(50),
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.back_Arrow_Icon}
                  style={{
                    width: hp(14),
                    height: hp(14),
                    resizeMode: 'contain',
                  }}
                />
              </TouchableOpacity>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('enter_complete_address')}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{paddingBottom: hp(40)}}>
              {/* Divider */}
              <View
                style={{
                  width: '100%',
                  height: hp(1),
                  backgroundColor: '#E3E3E3',
                }}
              />

              {/* --- MAP AREA WITH CENTER PIN (SWIGGY/ZOMATO STYLE) --- */}
              <View style={styles.mapContainer}>
                {isNativeMapAvailable() ? (
                  <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={region}
                    onRegionChange={onRegionChange}
                    onRegionChangeComplete={onRegionChangeComplete}>
                    {Marker && (
                      <Marker
                        coordinate={{
                          latitude: region.latitude,
                          longitude: region.longitude,
                        }}
                        title="Selected Location"
                        description={address || 'Delivery Location'}
                      />
                    )}
                  </MapView>
                ) : (
                  <View style={styles.map}>
                    <Image
                      source={images.map_Img}
                      style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'cover',
                      }}
                    />
                  </View>
                )}

                {/* Fixed Center Pin (Swiggy / Zomato Pin with Live Address Callout) */}
                <View pointerEvents="none" style={styles.centerPinContainer}>
                  <View style={styles.pinAddressCallout}>
                    <Text style={styles.pinCalloutTitle} numberOfLines={1}>
                      {fetchingAddress
                        ? 'Locating address...'
                        : houseNumber || landmark || 'Delivery Location'}
                    </Text>
                    <Text style={styles.pinCalloutDesc} numberOfLines={1}>
                      {address || 'Move map to select location'}
                    </Text>
                    <View style={styles.pinCalloutArrow} />
                  </View>
                  <Text style={styles.pinIcon}>📍</Text>
                  <View style={styles.pinShadow} />
                </View>

                {/* GPS Button */}
                <TouchableOpacity
                  style={styles.gpsButton}
                  onPress={getCurrentLocation}>
                  <Image
                    source={icons.location_Icon}
                    style={{
                      width: hp(20),
                      height: hp(20),
                      resizeMode: 'contain',
                      tintColor: colors.primaryColor || '#731EE2',
                    }}
                  />
                </TouchableOpacity>

                {/* Search Bar Floating Overlay */}
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputWrapper}>
                    <Text style={{fontSize: 16, marginRight: 8}}>🔍</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search area, apartment, landmark..."
                      placeholderTextColor="#888"
                      value={searchText}
                      onChangeText={handleSearchTextChange}
                    />
                    {searching && (
                      <ActivityIndicator
                        size="small"
                        color={colors.primaryColor || '#731EE2'}
                      />
                    )}
                  </View>

                  {/* Live Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <View style={styles.suggestionsDropdown}>
                      <ScrollView
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        style={{maxHeight: hp(200)}}>
                        {suggestions.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.suggestionItem}
                            onPress={() => handleSelectSuggestion(item)}>
                            <Text style={{fontSize: 16, marginRight: 10}}>
                              📍
                            </Text>
                            <View style={{flex: 1}}>
                              <Text
                                style={styles.suggestionTitle}
                                numberOfLines={1}>
                                {item.title}
                              </Text>
                              <Text
                                style={styles.suggestionDesc}
                                numberOfLines={1}>
                                {item.description}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* --- BOTTOM SHEET FORM --- */}
              <View style={{marginTop: hp(16)}}>
                {/* INPUTS */}
                <View style={{marginTop: hp(3)}}>
                  <BorderShowLabelTextInputComponent
                    label="House / Flat / Floor / Building *"
                    value={houseNumber}
                    onChangeText={setHouseNumber}
                  />

                  <BorderShowLabelTextInputComponent
                    label={`${t('complete_address')} *`}
                    value={address}
                    onChangeText={setAddress}
                  />

                  <BorderShowLabelTextInputComponent
                    label={`${t('floor')}`}
                    optional
                    value={floor}
                    onChangeText={setFloor}
                  />

                  <BorderShowLabelTextInputComponent
                    label={`${t('nearby_landmark')}`}
                    optional
                    value={landmark}
                    onChangeText={setLandmark}
                  />
                </View>

                {/* SAVE ADDRESS AS */}
                <Text
                  style={{
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                    color: '#7D7D7D',
                    marginTop: hp(18),
                    marginBottom: hp(11),
                    marginHorizontal: wp(18),
                  }}>
                  Save address as
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingLeft: wp(16),
                    paddingRight: wp(16),
                  }}>
                  {addressTypes.map(item => {
                    const isSelected = selectedType === item.value;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setSelectedType(item.value)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: hp(10),
                          borderWidth: 1,
                          borderColor: isSelected ? '#CDADF6' : '#D2D2D2',
                          backgroundColor: isSelected ? '#F3F0FF' : '#FFF',
                          marginRight: wp(10),
                          width: wp(104),
                          height: hp(44),
                          justifyContent: 'center',
                        }}>
                        <Image
                          source={item.icon}
                          style={{
                            width: hp(14),
                            height: hp(14),
                            marginRight: wp(10),
                            resizeMode: 'contain',
                          }}
                        />

                        <Text
                          style={{
                            fontSize: fontSize(14),
                            fontFamily: fontFamily.poppins400,
                            color: colors.pureBlack,
                            top: 2,
                          }}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* RECEIVER DETAILS */}
                <Text
                  style={{
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                    color: '#7D7D7D',
                    paddingHorizontal: wp(16),
                    marginTop: hp(24),
                  }}>
                  Add Service Receiver’s Details
                </Text>

                <BorderShowLabelTextInputComponent
                  label={t('name')}
                  value={name}
                  onChangeText={setName}
                  multiline={false}
                />

                <BorderShowLabelTextInputComponent
                  label={t('mobile_number')}
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="number-pad"
                  maxLength={10}
                  multiline={false}
                />
              </View>
              <View style={{marginBottom: hp(70)}} />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

        {!isKeyboardVisible && (
          <View
            style={{
              position: 'absolute',
              bottom: hp(0),
              left: wp(16),
              right: wp(16),
              backgroundColor: 'white',
              height: hp(80),
            }}>
            <TouchableOpacity
              activeOpacity={isFormValid && !loading ? 0.6 : 1}
              disabled={!isFormValid || loading}
              onPress={handleSaveAddress}
              style={{
                height: hp(50),
                borderRadius: hp(25),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.primaryColor,
                opacity: isFormValid && !loading ? 1 : 0.5,
                top: hp(15),
              }}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {editData ? t('update_address') : t('save_address')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: Dimensions.get('window').height * 0.32,
    width: '100%',
    position: 'relative',
  },
  map: {flex: 1},
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -100,
    marginTop: -82,
    width: 200,
    alignItems: 'center',
    zIndex: 10,
  },
  pinAddressCallout: {
    backgroundColor: '#1E1E2D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 190,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pinCalloutTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pinCalloutDesc: {
    color: '#D1D5DB',
    fontSize: 9,
    textAlign: 'center',
  },
  pinCalloutArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1E1E2D',
    marginTop: 1,
  },
  pinIcon: {fontSize: 32},
  pinShadow: {
    width: 8,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    marginTop: -2,
  },
  gpsButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#fff',
    width: hp(40),
    height: hp(40),
    borderRadius: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 15,
    right: 15,
    zIndex: 9999,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 0,
  },
  suggestionsDropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  suggestionDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  addressBox: {
    marginHorizontal: wp(16),
    padding: wp(12),
    backgroundColor: '#F8F9FA',
    borderRadius: hp(10),
    minHeight: hp(48),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  addressText: {
    fontSize: fontSize(13),
    fontFamily: fontFamily.poppins500,
    color: '#222222',
  },
});

export default EnterCompleteAddressScreen;
