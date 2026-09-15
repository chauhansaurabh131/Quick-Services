import React, { useEffect, useState, useRef } from 'react';
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
import { colors } from '../../../utils/colors';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { icons, images } from '../../../assets';
import { useNavigation, useRoute } from '@react-navigation/native';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../../../actions/locationActions';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

let WebView = null;
try {
  const wvModule = require('react-native-webview');
  WebView = wvModule.WebView || wvModule.default || wvModule;
} catch (e) {
  WebView = null;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBaqU_1hOFIhVLm8su_caJheEChJCNBTyY';



const getLeafletMapHtml = (lat, lng) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { touch-action: pan-x pan-y; -webkit-tap-highlight-color: transparent; }
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #f4f3f0; }
    .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 16);
    
    // Google Maps Road Tile Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    var moveTimeout = null;
    map.on('movestart', function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MOVE_START' }));
      }
    });

    map.on('moveend', function() {
      if (moveTimeout) clearTimeout(moveTimeout);
      moveTimeout = setTimeout(function() {
        var center = map.getCenter();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MOVE_END',
            latitude: center.lat,
            longitude: center.lng
          }));
        }
      }, 150);
    });

    window.panToLoc = function(newLat, newLng) {
      map.setView([newLat, newLng], 16, { animate: true });
    };
  </script>
</body>
</html>
`;

const ChangeLocationScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const editData = route.params?.editData;
  const navigation = useNavigation();
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const webMapRef = useRef(null);

  const reduxLocation = useSelector(state => state.location || {});

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

  const DEFAULT_LAT = 21.1255599;
  const DEFAULT_LNG = 73.1155615;

  const initialLat = editData?.latitude || routeLat || DEFAULT_LAT;
  const initialLng = editData?.longitude || routeLng || DEFAULT_LNG;

  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  });

  const [loading, setLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef(null);
  const isSelectingSuggestionRef = useRef(false);
  const debounceReverseTimerRef = useRef(null);
  const ignoreReverseGeocodeCoordsRef = useRef(null);

  const setIgnoreReverseGeocode = (lat, lng, durationMs = 2500) => {
    if (!lat || !lng) return;
    ignoreReverseGeocodeCoordsRef.current = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      expiresAt: Date.now() + durationMs,
    };
  };

  const shouldSkipReverseGeocode = (lat, lng) => {
    if (!ignoreReverseGeocodeCoordsRef.current) return false;
    const { lat: targetLat, lng: targetLng, expiresAt } =
      ignoreReverseGeocodeCoordsRef.current;
    if (Date.now() > expiresAt) {
      ignoreReverseGeocodeCoordsRef.current = null;
      return false;
    }
    const latDiff = Math.abs(parseFloat(lat) - targetLat);
    const lngDiff = Math.abs(parseFloat(lng) - targetLng);
    if (latDiff < 0.0005 && lngDiff < 0.0005) {
      return true;
    }
    ignoreReverseGeocodeCoordsRef.current = null;
    return false;
  };

  const debouncedReverseGeocode = (lat, lng, delay = 350) => {
    if (debounceReverseTimerRef.current) {
      clearTimeout(debounceReverseTimerRef.current);
    }
    debounceReverseTimerRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, delay);
  };

  const geocodeQueryToCoords = async queryText => {
    if (!queryText) return null;

    // 1. Google Geocoding API for exact coordinates in India
    if (
      GOOGLE_MAPS_API_KEY &&
      GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
    ) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          queryText,
        )}&components=country:in&key=${GOOGLE_MAPS_API_KEY}`;
        const gRes = await axios.get(googleUrl);
        if (
          gRes.data?.status === 'OK' &&
          gRes.data?.results &&
          gRes.data.results.length > 0
        ) {
          const first = gRes.data.results[0];
          if (first.geometry?.location) {
            return {
              lat: first.geometry.location.lat,
              lng: first.geometry.location.lng,
              fullAddr: first.formatted_address || queryText,
            };
          }
        }
      } catch (gErr) {}
    }

    // 2. Photon API for dynamic real coordinates in India
    try {
      const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        queryText,
      )}&countrycode=in&limit=1`;
      const pRes = await axios.get(pUrl);
      if (pRes.data?.features && pRes.data.features.length > 0) {
        const feat = pRes.data.features[0];
        const coords = feat.geometry.coordinates;
        return {
          lat: coords[1],
          lng: coords[0],
          fullAddr: feat.properties.name || queryText,
        };
      }
    } catch (e) {}

    // 3. OSM Nominatim search with full query
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        queryText,
      )}&countrycodes=in&limit=1&addressdetails=1`;
      const res = await axios.get(osmUrl, {
        headers: { 'User-Agent': 'QuickServiceApp' },
      });
      if (res.data && res.data[0]) {
        return {
          lat: parseFloat(res.data[0].lat),
          lng: parseFloat(res.data[0].lon),
          fullAddr: res.data[0].display_name || queryText,
        };
      }
    } catch (e) {}

    // 4. Sub-phrase fallback search via Photon
    const cleanText = queryText
      .replace(/india/gi, '')
      .replace(/country/gi, '')
      .replace(/state/gi, '')
      .trim();

    const words = cleanText.split(/[\s,]+/).filter(w => w.length >= 2);
    if (words.length >= 2) {
      const subQuery = words.slice(-2).join(' ');
      try {
        const pUrl2 = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          subQuery,
        )}&countrycode=in&limit=1`;
        const pRes2 = await axios.get(pUrl2);
        if (pRes2.data?.features && pRes2.data.features.length > 0) {
          const feat = pRes2.data.features[0];
          const coords = feat.geometry.coordinates;
          return {
            lat: coords[1],
            lng: coords[0],
            fullAddr: feat.properties.name || queryText,
          };
        }
      } catch (e) {}
    }

    return null;
  };

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

  const handleSearchSubmit = async () => {
    Keyboard.dismiss();
    const query = searchText.trim();
    if (!query) return;

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }

    try {
      setSearching(true);
      isSelectingSuggestionRef.current = true;
      const result = await geocodeQueryToCoords(query);
      if (result && result.lat && result.lng) {
        setSuggestions([]);
        setAddress(result.fullAddr || query);
        setHouseNumber(query.split(',')[0].trim());
        setLandmark(query.split(',')[0].trim());
        setIgnoreReverseGeocode(result.lat, result.lng, 2500);
        animateToLocation(result.lat, result.lng);
      }
    } catch (err) {
      console.log('[SearchSubmit] Error:', err);
    } finally {
      setSearching(false);
    }
  };

  const sanitizeSearchQuery = rawQuery => {
    if (!rawQuery) return '';
    return rawQuery
      .replace(/\b(near|opp|opposite|behind|b\/h|o\/p|beside|next to|flat|house|floor|room|building|apt|apartment|no\.?|number)\b/gi, ' ')
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const fetchSearchSuggestions = async query => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setSearching(true);
      let list = [];
      const cleanQ = query.trim();
      const sanitizedQ = sanitizeSearchQuery(cleanQ);

      // 1. Google Places Autocomplete predictions (Google Maps standard)
      if (
        GOOGLE_MAPS_API_KEY &&
        GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
      ) {
        try {
          const isIndiaRegion =
            region.latitude >= 6 &&
            region.latitude <= 36 &&
            region.longitude >= 68 &&
            region.longitude <= 98;

          const locationBias = isIndiaRegion
            ? `&location=${region.latitude},${region.longitude}&radius=50000`
            : '';
          const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            sanitizedQ || cleanQ,
          )}${locationBias}&components=country:in&key=${GOOGLE_MAPS_API_KEY}`;
          const gRes = await axios.get(googleUrl);
          if (
            gRes.data?.status === 'OK' &&
            gRes.data?.predictions &&
            gRes.data.predictions.length > 0
          ) {
            gRes.data.predictions.forEach(p => {
              list.push({
                id: `google_${p.place_id}`,
                title:
                  p.structured_formatting?.main_text ||
                  p.description.split(',')[0],
                description: p.description,
                placeId: p.place_id,
                source: 'google',
              });
            });
          }
        } catch (gErr) {}
      }

      // 2. Real-time Photon Geocoding API Search (Multi-word queries ONLY - NO single word spam)
      const rawWords = (sanitizedQ || cleanQ).split(/\s+/).filter(Boolean);
      const multiWordQueries = [cleanQ, sanitizedQ];
      if (rawWords.length >= 2) {
        for (let i = 0; i < rawWords.length - 1; i++) {
          const phrase = `${rawWords[i]} ${rawWords[i + 1]}`;
          if (phrase.length >= 5) {
            multiWordQueries.push(phrase);
          }
        }
      }

      const searchQueries = Array.from(new Set(multiWordQueries.filter(Boolean)));

      for (const sq of searchQueries) {
        try {
          const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
            sq,
          )}&countrycode=in&limit=10`;
          const pRes = await axios.get(pUrl);
          if (pRes.data?.features && pRes.data.features.length > 0) {
            pRes.data.features.forEach((f, idx) => {
              const props = f.properties;
              const placeTitle =
                props.name ||
                props.street ||
                props.district ||
                props.city ||
                sq;

              const descParts = [
                placeTitle,
                props.street && props.street !== placeTitle ? props.street : null,
                props.district || props.suburb || props.neighbourhood,
                props.city || props.town || props.county,
                props.state,
                'India',
              ].filter(Boolean);

              const fullDesc = Array.from(new Set(descParts)).join(', ');
              list.push({
                id: `photon_${idx}_${props.osm_id || idx}_${sq}`,
                title: placeTitle,
                description: fullDesc,
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0],
                city: props.city || props.town || props.district || '',
                state: props.state || '',
                postcode: props.postcode || '',
                source: 'photon',
              });
            });
          }
        } catch (pErr) {}
        if (list.length >= 15) break;
      }

      // 3. Real-time OpenStreetMap Nominatim Search
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          sanitizedQ || cleanQ,
        )}&countrycodes=in&limit=8&addressdetails=1`;
        const osmRes = await axios.get(osmUrl, {
          headers: { 'User-Agent': 'QuickServiceApp' },
        });

        if (osmRes.data && Array.isArray(osmRes.data)) {
          osmRes.data.forEach((item, idx) => {
            const addr = item.address || {};
            const mainTitle =
              item.display_name.split(',')[0] || cleanQ;
            const cityVal =
              addr.city || addr.town || addr.village || addr.suburb || '';

            list.push({
              id: `osm_${idx}_${item.place_id}`,
              title: mainTitle,
              description: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              city: cityVal,
              state: addr.state || '',
              postcode: addr.postcode || '',
              source: 'osm',
            });
          });
        }
      } catch (osmErr) {}

      // 4. Dynamic Structured Match Generator (ONLY as last fallback if no API results found)
      if (list.length === 0 && rawWords.length >= 1) {
        const isNonIndianCity = city && (city.toLowerCase().includes('mountain view') || city.toLowerCase().includes('santa clara') || city.toLowerCase().includes('california') || city.toLowerCase().includes('united states'));
        const activeCity = (!isNonIndianCity && city) ? city : 'Bardoli';
        const activeState = (!isNonIndianCity && stateName) ? stateName : 'Gujarat';

        let socPart = rawWords.slice(0, 2).join(' ');
        let landPart = rawWords.slice(2).join(' ');
        if (!landPart && rawWords.length >= 2) {
          socPart = rawWords[0];
          landPart = rawWords.slice(1).join(' ');
        }

        if (socPart && landPart) {
          list.push({
            id: `struct_full_${Date.now()}_${Math.random()}`,
            title: `${socPart}, ${landPart}`,
            description: `${socPart}, ${landPart}, ${activeCity}, ${activeState}, India`,
            society: socPart,
            landmark: landPart,
            city: activeCity,
            source: 'structured_match',
          });
        }
        if (socPart) {
          list.push({
            id: `struct_soc_${Date.now()}_${Math.random()}`,
            title: `${socPart}`,
            description: `${socPart}, ${activeCity}, ${activeState}, India`,
            society: socPart,
            landmark: socPart,
            city: activeCity,
            source: 'structured_match',
          });
        }
      }

      // Deduplicate results by title/description
      const uniqueList = [];
      const seenKeys = new Set();
      list.forEach(item => {
        const key = (item.title + '|' + item.description)
          .toLowerCase()
          .trim();
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueList.push(item);
        }
      });

      console.log('\n==================================================');
      console.log('🔍 DYNAMIC GOOGLE MAPS ADDRESS SEARCH:', query);
      console.log(`📍 FOUND ${uniqueList.length} API RESULTS:`);
      uniqueList.forEach((item, idx) => {
        console.log(
          `   ${idx + 1}. [${item.source.toUpperCase()}] ${item.title} -> ${item.description}`,
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

  const handleSelectSuggestion = async item => {
    isSelectingSuggestionRef.current = true;
    setSearchText(item.title);
    setSuggestions([]);
    Keyboard.dismiss();

    let targetLat = item.lat;
    let targetLng = item.lng;

    if (item.source === 'structured_match') {
      setAddress(item.description);
      if (item.society) setHouseNumber(item.society);
      if (item.landmark) setLandmark(item.landmark);
      if (item.city) setCity(item.city);

      const geo = await geocodeQueryToCoords(item.description);
      if (geo && geo.lat && geo.lng) {
        targetLat = geo.lat;
        targetLng = geo.lng;
      } else {
        targetLat = region.latitude;
        targetLng = region.longitude;
      }

      if (targetLat && targetLng) {
        setIgnoreReverseGeocode(targetLat, targetLng, 2500);
        animateToLocation(targetLat, targetLng);
      }
      return;
    }

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

            const placeName = item.title || areaVal || streetVal.trim();
            setHouseNumber(placeName);
            setLandmark(placeName);
          } else {
            setHouseNumber(item.title);
            setLandmark(item.title);
          }
        }
      } catch (dErr) {
        console.log('[PlaceDetails] Error:', dErr?.message);
        setAddress(item.description);
        setHouseNumber(item.title);
        setLandmark(item.title);
      }
    } else if (item.source === 'photon' || item.source === 'osm') {
      setAddress(item.description);
      setHouseNumber(item.title);
      setLandmark(item.title);
      if (item.city) setCity(item.city);
      if (item.state) setStateName(item.state);
      if (item.postcode) setPinCode(item.postcode);

      if (item.lat && item.lng) {
        targetLat = item.lat;
        targetLng = item.lng;
      }
    }

    if (!targetLat || !targetLng) {
      const fullQueryStr = `${item.title || ''} ${item.description || ''}`;
      const geoRes = await geocodeQueryToCoords(fullQueryStr);
      if (geoRes && geoRes.lat && geoRes.lng) {
        targetLat = geoRes.lat;
        targetLng = geoRes.lng;
      }
    }

    if (targetLat && targetLng) {
      setIgnoreReverseGeocode(targetLat, targetLng, 2500);
      animateToLocation(targetLat, targetLng);
    }
  };

  useEffect(() => {
    if (editData) {
      setAddress(editData.address || '');
      setHouseNumber(editData.houseNumber || editData.flatNumber || '');
      setFloor(editData.floor || '');
      setLandmark(editData.landmark || '');
      setCity(editData.city || '');
      setStateName(editData.state || '');
      setPinCode(editData.pinCode || '');

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

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'Karyaah needs access to your location to pinpoint your address.',
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

  const fetchDeviceLocation = () => {
    try {
      setFetchingAddress(true);
      isSelectingSuggestionRef.current = false;

      if (
        !Geolocation ||
        typeof Geolocation.getCurrentPosition !== 'function'
      ) {
        if (reduxLocation?.latitude && reduxLocation?.longitude) {
          animateToLocation(reduxLocation.latitude, reduxLocation.longitude);
          reverseGeocode(reduxLocation.latitude, reduxLocation.longitude);
        } else {
          animateToLocation(DEFAULT_LAT, DEFAULT_LNG);
          reverseGeocode(DEFAULT_LAT, DEFAULT_LNG);
        }
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          if (position?.coords?.latitude && position?.coords?.longitude) {
            const { latitude, longitude } = position.coords;
            console.log('\n==================================================');
            console.log('📍 GPS BUTTON CLICKED -> LIVE COORDS:', latitude, longitude);
            console.log('==================================================\n');
            animateToLocation(latitude, longitude);
            reverseGeocode(latitude, longitude);
          } else if (reduxLocation?.latitude && reduxLocation?.longitude) {
            animateToLocation(reduxLocation.latitude, reduxLocation.longitude);
            reverseGeocode(reduxLocation.latitude, reduxLocation.longitude);
          } else {
            animateToLocation(DEFAULT_LAT, DEFAULT_LNG);
            reverseGeocode(DEFAULT_LAT, DEFAULT_LNG);
          }
        },
        error => {
          console.log('[GPS Button Error]:', error?.message);
          if (reduxLocation?.latitude && reduxLocation?.longitude) {
            animateToLocation(reduxLocation.latitude, reduxLocation.longitude);
            reverseGeocode(reduxLocation.latitude, reduxLocation.longitude);
          } else {
            animateToLocation(DEFAULT_LAT, DEFAULT_LNG);
            reverseGeocode(DEFAULT_LAT, DEFAULT_LNG);
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 },
      );
    } catch (err) {
      setFetchingAddress(false);
      if (reduxLocation?.latitude && reduxLocation?.longitude) {
        animateToLocation(reduxLocation.latitude, reduxLocation.longitude);
        reverseGeocode(reduxLocation.latitude, reduxLocation.longitude);
      }
    }
  };

  const getCurrentLocation = () => {
    isSelectingSuggestionRef.current = false;
    requestLocationPermission();
  };

  const handleWebMapMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MOVE_START') {
        onRegionChange();
      } else if (data.type === 'MOVE_END' && data.latitude && data.longitude) {
        const newRegion = {
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        };
        setRegion(newRegion);
        debouncedReverseGeocode(data.latitude, data.longitude, 400);
      }
    } catch (e) {
      console.log('[WebMapMessage] Error:', e);
    }
  };

  const animateToLocation = (lat, lng) => {
    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 800);
    if (webMapRef.current) {
      webMapRef.current.injectJavaScript(
        `if (window.panToLoc) { window.panToLoc(${lat}, ${lng}); } true;`,
      );
    }
  };

  const reverseGeocode = async (lat, lng) => {
    if (isSelectingSuggestionRef.current) {
      console.log('📍 [ReverseGeocode] Skipped because user selected search suggestion.');
      isSelectingSuggestionRef.current = false;
      setFetchingAddress(false);
      return;
    }

    try {
      setFetchingAddress(true);
      let addressFound = false;
      let freshAddress = '';
      let freshHouseNumber = '';
      let freshLandmark = '';
      let freshCity = '';
      let freshState = '';
      let freshPinCode = '';

      if (
        GOOGLE_MAPS_API_KEY &&
        GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
      ) {
        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
          const res = await axios.get(url);

          if (
            res.data?.status === 'OK' &&
            res.data?.results &&
            res.data.results.length > 0
          ) {
            const detailedResult =
              res.data.results.find(
                r =>
                  r.types?.includes('street_address') ||
                  r.types?.includes('route') ||
                  r.types?.includes('sublocality_level_1') ||
                  r.types?.includes('sublocality_level_2') ||
                  r.types?.includes('neighborhood') ||
                  r.types?.includes('premise'),
              ) || res.data.results[0];

            let streetVal = '';
            let areaVal = '';

            res.data.results.forEach(r => {
              r.address_components?.forEach(component => {
                if (
                  (component.types.includes('route') ||
                    component.types.includes('street_number') ||
                    component.types.includes('premise')) &&
                  !streetVal.includes(component.long_name)
                ) {
                  streetVal += (streetVal ? ' ' : '') + component.long_name;
                }
                if (
                  (component.types.includes('sublocality_level_1') ||
                    component.types.includes('sublocality') ||
                    component.types.includes('neighborhood')) &&
                  !areaVal
                ) {
                  areaVal = component.long_name;
                }
                if (
                  (component.types.includes('locality') ||
                    component.types.includes('postal_town')) &&
                  !freshCity
                ) {
                  freshCity = component.long_name;
                }
                if (
                  component.types.includes('administrative_area_level_1') &&
                  !freshState
                ) {
                  freshState = component.long_name;
                }
                if (component.types.includes('postal_code') && !freshPinCode) {
                  freshPinCode = component.long_name;
                }
              });
            });

            const placeName = areaVal || streetVal.trim();
            if (placeName) {
              freshHouseNumber = placeName;
              freshLandmark = placeName;
            }

            freshAddress = detailedResult.formatted_address || res.data.results[0]?.formatted_address || '';

            const parts = [
              streetVal.trim(),
              areaVal,
              freshCity,
              freshState,
              freshPinCode,
            ].filter(Boolean);
            const constructed = Array.from(new Set(parts)).join(', ');

            if (constructed && constructed.length > freshAddress.length) {
              freshAddress = constructed;
            }

            addressFound = true;
          }
        } catch (googleErr) {
          console.log(
            '[ReverseGeocode] Google Geocoding Axios Error:',
            googleErr?.message,
          );
        }
      }

      if (GOOGLE_MAPS_API_KEY) {
        try {
          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=150&key=${GOOGLE_MAPS_API_KEY}`;
          const nRes = await axios.get(nearbyUrl);
          if (nRes.data?.status === 'OK' && nRes.data?.results?.length > 0) {
            const getDist = p => {
              const pLat = p.geometry?.location?.lat || lat;
              const pLng = p.geometry?.location?.lng || lng;
              return Math.pow(pLat - lat, 2) + Math.pow(pLng - lng, 2);
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

              freshHouseNumber = poiName;
              freshLandmark = poiName;

              if (!freshAddress || !freshAddress.toLowerCase().includes(poiName.toLowerCase())) {
                const combined = [poiName, vicinity !== poiName ? vicinity : '', freshAddress].filter(Boolean);
                freshAddress = Array.from(new Set(combined)).join(', ');
              }
              addressFound = true;
            }
          }
        } catch (nErr) {
          console.log('[ReverseGeocode] Nearby Search Error:', nErr?.message);
        }
      }

      if (!addressFound) {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'QuickServiceApp' } },
          );

          if (res.data) {
            const addr = res.data.address || {};
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
            freshState = addr.state || '';
            freshPinCode = addr.postcode || '';
            freshCity = townName || localArea;

            const roadWithHouseNo = [houseNo, roadName].filter(Boolean).join(' ');
            const parts = [
              poiName,
              roadWithHouseNo || roadName,
              localArea,
              townName,
              districtName !== townName ? districtName : '',
              freshState,
              freshPinCode,
            ].filter(Boolean);

            freshAddress =
              parts.length > 0
                ? Array.from(new Set(parts)).join(', ')
                : res.data.display_name || '';

            const houseOrBuildingVal =
              poiName ||
              (houseNo ? `${houseNo}, ${roadName || localArea}` : '') ||
              roadName ||
              localArea ||
              townName;

            if (houseOrBuildingVal) {
              freshHouseNumber = houseOrBuildingVal;
              freshLandmark = poiName || roadName || localArea || townName;
            }
          }
        } catch (osmErr) {
          if (osmErr?.response?.status !== 429) {
            console.log('[ChangeLocationScreen] OSM Reverse Error:', osmErr?.message);
          }
        }
      }

      // Overwrite state completely with fresh location values (no appending previous addresses!)
      if (freshAddress) setAddress(freshAddress);
      if (freshHouseNumber) setHouseNumber(freshHouseNumber);
      if (freshLandmark) setLandmark(freshLandmark);
      if (freshCity) setCity(freshCity);
      if (freshState) setStateName(freshState);
      if (freshPinCode) setPinCode(freshPinCode);

    } catch (error) {
      console.log(
        '[ChangeLocationScreen] Reverse Geocoding Error:',
        error?.message || error,
      );
    } finally {
      setFetchingAddress(false);
    }
  };

  const onRegionChange = () => {
    if (isSelectingSuggestionRef.current) {
      return;
    }
    if (!fetchingAddress) {
      setFetchingAddress(true);
    }
  };

  const isNativeMapAvailable = () => {
    try {
      const { UIManager } = require('react-native');
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

  const onRegionChangeComplete = newRegion => {
    setRegion(newRegion);
    debouncedReverseGeocode(newRegion.latitude, newRegion.longitude, 400);
  };

  // Primary Action: Confirm & Update HomeScreen Location directly
  const handleConfirmHomeScreenLocation = async () => {
    if (loading) return;

    setLoading(true);

    const placeTitle = city || houseNumber || landmark || (address ? address.split(',')[0].trim() : '') || 'Selected Location';
    const fullAddressText = address || 'Location Selected';

    console.log('\n==================================================');
    console.log('📍 CONFIRMING HOMESCREEN LOCATION:');
    console.log('City / Place:', placeTitle);
    console.log('Full Address:', fullAddressText);
    console.log('Coordinates:', `Lat: ${region.latitude}, Lng: ${region.longitude}`);
    console.log('==================================================\n');

    // 1. Dispatch setLocation to Redux Store immediately!
    dispatch(
      setLocation({
        latitude: region.latitude,
        longitude: region.longitude,
        place: placeTitle,
        fullAddress: fullAddressText,
        isManualSelection: true,
      }),
    );

    // 2. Save location object to local storage
    try {
      const locObj = {
        latitude: region.latitude,
        longitude: region.longitude,
        place: placeTitle,
        fullAddress: fullAddressText,
        address: fullAddressText,
        houseNumber,
        floor,
        landmark,
        city,
        state: stateName,
        pinCode,
      };
      await AsyncStorage.setItem('SELECTED_LOCATION', JSON.stringify(locObj));
    } catch (err) {
      console.log('[ChangeLocationScreen] Storage Save Error:', err);
    }

    setLoading(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
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
                Select Location
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: hp(40) }}>
              <View
                style={{
                  width: '100%',
                  height: hp(1),
                  backgroundColor: '#E3E3E3',
                }}
              />

              {/* --- MAP AREA WITH CENTER PIN & SEARCH OVERLAY --- */}
              <View style={{ position: 'relative', zIndex: 9999 }}>
                {/* Search Bar Overlay */}
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputWrapper}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search area, apartment, landmark..."
                      placeholderTextColor="#888"
                      value={searchText}
                      onChangeText={handleSearchTextChange}
                      returnKeyType="search"
                      onSubmitEditing={handleSearchSubmit}
                    />
                    {searching && (
                      <ActivityIndicator
                        size="small"
                        color={colors.primaryColor || '#731EE2'}
                      />
                    )}
                  </View>

                  {suggestions.length > 0 && (
                    <View style={styles.suggestionsDropdown}>
                      <ScrollView
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        style={{ maxHeight: hp(220) }}>
                        {suggestions.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.suggestionItem}
                            onPress={() => handleSelectSuggestion(item)}>
                            <Text style={{ fontSize: 16, marginRight: 10 }}>
                              📍
                            </Text>
                            <View style={{ flex: 1 }}>
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

                <View style={styles.mapContainer}>
                  {isNativeMapAvailable() ? (
                    <MapView
                      ref={mapRef}
                      provider={PROVIDER_GOOGLE}
                      mapType="standard"
                      style={styles.map}
                      initialRegion={region}
                      onRegionChange={onRegionChange}
                      onRegionChangeComplete={onRegionChangeComplete}>
                      {Marker && (
                        <Marker
                          draggable
                          coordinate={{
                            latitude: region.latitude,
                            longitude: region.longitude,
                          }}
                          onDragEnd={e => {
                            const { latitude, longitude } =
                              e.nativeEvent.coordinate;
                            animateToLocation(latitude, longitude);
                            reverseGeocode(latitude, longitude);
                          }}
                          title="Selected Location"
                          description={address || 'Selected Location'}
                        />
                      )}
                    </MapView>
                  ) : WebView ? (
                    <WebView
                      ref={webMapRef}
                      originWhitelist={['*']}
                      source={{
                        html: getLeafletMapHtml(initialLat, initialLng),
                      }}
                      style={styles.map}
                      onMessage={handleWebMapMessage}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      scrollEnabled={true}
                      overScrollMode="never"
                    />
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

                  {/* Fixed Center Pin with Live Address Callout */}
                  <View pointerEvents="none" style={styles.centerPinContainer}>
                    <View style={styles.pinAddressCallout}>
                      <Text style={styles.pinCalloutTitle} numberOfLines={1}>
                        {fetchingAddress
                          ? 'Locating address...'
                          : houseNumber || landmark || 'Selected Location'}
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
                </View>
              </View>

              {/* ADDRESS DETAILS INPUT */}
              <View style={{ marginTop: hp(16) }}>
                <View style={{ marginTop: hp(3) }}>
                  <BorderShowLabelTextInputComponent
                    label={`${t('complete_address')} *`}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>
              <View style={{ marginBottom: hp(70) }} />
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
              activeOpacity={!loading ? 0.6 : 1}
              disabled={loading}
              onPress={handleConfirmHomeScreenLocation}
              style={{
                height: hp(50),
                borderRadius: hp(25),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.primaryColor || '#731EE2',
                opacity: !loading ? 1 : 0.5,
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
                  Confirm Location
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
    height: Dimensions.get('window').height * 0.65,
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
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
  pinIcon: { fontSize: 32 },
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
});

export default ChangeLocationScreen;
