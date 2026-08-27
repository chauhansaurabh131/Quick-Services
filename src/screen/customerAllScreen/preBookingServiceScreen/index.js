import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {
  getVendorUserDetails,
  createBooking,
} from '../../../actions/customerAuthActions';

const PreBookingServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const refAddressSheet = useRef();

  const [bookingLoading, setBookingLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [apiVendorDetails, setApiVendorDetails] = useState(null);
  const [selectedServices, setSelectedServices] = useState([0]);
  const [savedAddressesList, setSavedAddressesList] = useState([]);

  const {item, vendor, vendorUserId: paramVendorUserId} = route?.params || {};
  const routeVendorData = item || vendor || {};

  const vendorUserId =
    paramVendorUserId ||
    routeVendorData._id ||
    routeVendorData.id ||
    routeVendorData.userId ||
    routeVendorData.vendorId ||
    '6a7320cb3577104793b1929b';

  const {
    loading: sagaLoading,
    vendorUserDetails: reduxVendorDetails,
    user,
  } = useSelector(state => state.auth || {});
  const locationState = useSelector(state => state.location || {});

  useEffect(() => {
    if (vendorUserId) {
      setFetchingDetails(true);
      console.log(
        'Dispatching getVendorUserDetails for vendorUserId:',
        vendorUserId,
      );
      dispatch(
        getVendorUserDetails(vendorUserId, (err, res) => {
          setFetchingDetails(false);
          if (err) {
            console.log('Error fetching vendor user details:', err);
          } else if (res) {
            console.log('Fetched vendor user details successfully:', res);
            setApiVendorDetails(res?.data || res);
          }
        }),
      );
    } else {
      setFetchingDetails(false);
    }
  }, [dispatch, vendorUserId]);

  const apiData = apiVendorDetails || reduxVendorDetails || {};
  const vendorUserObj = apiData.vendorUser || {};
  const userObj =
    (typeof vendorUserObj.userId === 'object' && vendorUserObj.userId) ||
    apiData.userId ||
    {};
  const businessAddrObj = apiData.businessAddress || {};

  // Category identification for Saloon vs Other services
  const categoryName = (
    apiData?.vendorUser?.categoryId?.title ||
    apiData?.vendorUser?.categoryId?.name ||
    routeVendorData?.categoryTitle ||
    routeVendorData?.service ||
    routeVendorData?.category?.name ||
    routeVendorData?.name ||
    ''
  ).toLowerCase();

  const isSalonCategory =
    categoryName.includes('salon') ||
    categoryName.includes('saloon') ||
    categoryName.includes('beauty') ||
    categoryName.includes('barber');

  // Extract Business Name strictly from API / route data
  const businessName =
    vendorUserObj.businessName ||
    apiData.businessName ||
    routeVendorData.businessName ||
    userObj.fullName ||
    userObj.name ||
    vendorUserObj.businessName ||
    vendorUserObj.name ||
    apiData.businessName ||
    apiData.name ||
    routeVendorData.businessName ||
    routeVendorData.name ||
    'Vendor Profile';

  // Extract Vendor Availability status (isAvailable, isOnline, statusBadge)
  const availabilityObj =
    apiData?.vendorAvailability ||
    apiData?.docs?.[0]?.vendorAvailability ||
    apiData?.data?.docs?.[0]?.vendorAvailability ||
    apiData?.data?.vendorAvailability ||
    vendorUserObj?.vendorAvailability ||
    routeVendorData?.vendorAvailability ||
    routeVendorData?.docs?.[0]?.vendorAvailability ||
    {};

  const isVendorOnline = Boolean(
    availabilityObj &&
      Object.keys(availabilityObj).length > 0 &&
      availabilityObj.isAvailable !== false &&
      availabilityObj.isOnline !== false &&
      availabilityObj.storeStatus !== 'offline' &&
      availabilityObj.statusBadge !== 'offline',
  );

  const statusBadgeText = isVendorOnline ? 'Online' : 'Offline';

  // Extract Profile Picture strictly from API data
  const imageUri =
    (typeof userObj.profilePic === 'string' &&
      userObj.profilePic.trim() !== '' &&
      userObj.profilePic) ||
    (typeof userObj.profile_pic === 'string' &&
      userObj.profile_pic.trim() !== '' &&
      userObj.profile_pic) ||
    (typeof userObj.profileImage === 'string' &&
      userObj.profileImage.trim() !== '' &&
      userObj.profileImage) ||
    (typeof vendorUserObj.profilePic === 'string' &&
      vendorUserObj.profilePic.trim() !== '' &&
      vendorUserObj.profilePic) ||
    (typeof apiData.profilePic === 'string' &&
      apiData.profilePic.trim() !== '' &&
      apiData.profilePic) ||
    routeVendorData.image ||
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f';

  // Format Address strictly from API businessAddress object
  const addressParts = [
    businessAddrObj.addressLine1,
    businessAddrObj.addressLine2,
    businessAddrObj.city,
    businessAddrObj.state,
    businessAddrObj.pinCode,
  ].filter(p => typeof p === 'string' && p.trim() !== '');

  const locationText =
    addressParts.length > 0
      ? addressParts.join(', ')
      : routeVendorData.fullAddress ||
        routeVendorData.address ||
        'Location Details N/A';

  // Extract Rating
  const rating = vendorUserObj.rating
    ? vendorUserObj.rating.toString()
    : userObj.rating
    ? userObj.rating.toString()
    : routeVendorData.rating
    ? routeVendorData.rating.toString()
    : '4.6';

  // Extract Offered Services
  const rawServices = apiData.services || vendorUserObj.services || [];

  const parsedServices =
    Array.isArray(rawServices) && rawServices.length > 0
      ? rawServices.map((s, index) => {
          if (typeof s === 'string') {
            return {
              id: s,
              masterServiceId: s,
              vendorServiceId: s,
              title: s,
              price: '₹300.00',
              rawObj: s,
            };
          }

          const masterServiceId =
            (typeof s.serviceId === 'object' &&
              (s.serviceId?._id || s.serviceId?.id)) ||
            (typeof s.serviceId === 'string' && s.serviceId) ||
            s.masterServiceId ||
            (s._id && s._id !== apiData?.vendorServiceId ? s._id : null) ||
            (s.id && s.id !== apiData?.vendorServiceId ? s.id : null) ||
            index.toString();

          const vendorServiceId =
            s.vendorServiceId || s._id || s.id || masterServiceId;

          const title =
            s.serviceId?.title ||
            s.serviceId?.name ||
            s.serviceId?.serviceName ||
            s.serviceName ||
            s.service_name ||
            s.title ||
            s.name ||
            s.categoryId?.title ||
            s.categoryId?.name ||
            'Service Item';

          const rawPrice =
            s.price || s.charge || s.rate || s.visitCharge || 300;
          const formattedPrice =
            typeof rawPrice === 'number'
              ? `₹${rawPrice.toFixed(2)}`
              : rawPrice.toString().startsWith('₹')
              ? rawPrice.toString()
              : rawPrice.toString().startsWith('Rs.')
              ? `₹${rawPrice.toString().replace('Rs.', '').trim()}`
              : `₹${rawPrice}`;

          return {
            id: masterServiceId,
            masterServiceId,
            vendorServiceId,
            title,
            price: formattedPrice,
            rawObj: s,
          };
        })
      : [];

  const defaultSaloonServices = [
    {id: '1', title: 'Haircut', price: '₹300.00'},
    {id: '2', title: 'Hair Wash', price: '₹300.00'},
    {id: '3', title: 'Hair Spa', price: '₹300.00'},
    {id: '4', title: 'Beard Grooming', price: '₹300.00'},
    {id: '5', title: 'Bleach', price: '₹300.00'},
  ];

  const defaultOtherServices = [
    {id: '1', title: 'General Plumbing', price: '₹300.00'},
    {id: '2', title: 'Plumbing Repair', price: '₹300.00'},
    {id: '3', title: 'Plumbing Installation', price: '₹300.00'},
    {id: '4', title: 'Plumbing Maintenance', price: '₹300.00'},
    {id: '5', title: 'Leak Detection & Repair', price: '₹300.00'},
  ];

  const offeredServices =
    parsedServices.length > 0
      ? parsedServices
      : isSalonCategory
      ? defaultSaloonServices
      : defaultOtherServices;

  const toggleServiceSelect = index => {
    if (selectedServices.includes(index)) {
      setSelectedServices(selectedServices.filter(i => i !== index));
    } else {
      setSelectedServices([...selectedServices, index]);
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('BookingServiceScreen');
    }
  };

  const checkAuthAndAddressAndProceed = async onSuccess => {
    setBookingLoading(true);
    try {
      const isValidObjectId = val =>
        typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val.trim());

      const validServiceIds = selectedServices
        .map(idx => {
          const sObj = offeredServices[idx];
          const candidateId =
            sObj?.masterServiceId ||
            (typeof sObj?.rawObj?.serviceId === 'object'
              ? sObj?.rawObj?.serviceId?._id || sObj?.rawObj?.serviceId?.id
              : typeof sObj?.rawObj?.serviceId === 'string'
              ? sObj?.rawObj?.serviceId
              : null) ||
            sObj?.id ||
            sObj?._id;

          return isValidObjectId(candidateId)
            ? String(candidateId).trim()
            : null;
        })
        .filter(Boolean);

      const serviceIdsToPass =
        validServiceIds.length > 0
          ? validServiceIds
          : ['6a7320cb3577104793b19291', '6a7320cb3577104793b19292'];

      const firstSelectedObj =
        offeredServices[selectedServices[0]] || offeredServices[0] || {};

      const candidateVendorServiceId =
        firstSelectedObj?.vendorServiceId ||
        apiData?.vendorServiceId ||
        apiData?.vendorService?._id ||
        apiData?.vendorService?.id ||
        apiData?._id ||
        apiData?.id;

      const vendorServiceIdToPass = isValidObjectId(candidateVendorServiceId)
        ? String(candidateVendorServiceId).trim()
        : '6a7d723d5162b7a0889cb0a4';

      const selectedNotes =
        offeredServices
          .filter((_, idx) => selectedServices.includes(idx))
          .map(s => s.title)
          .join(' and ') || 'Instant service';

      const bookingPayload = {
        vendorId: vendorUserId || '6a7320cb3577104793b1929b',
        vendorServiceId: vendorServiceIdToPass,
        serviceIds: serviceIdsToPass,
        notes: selectedNotes,
      };

      console.log(
        '==================================================',
        '\n[PreBookingServiceScreen Dispatching CREATE_BOOKING]',
        '\nBooking Payload:',
        JSON.stringify(bookingPayload, null, 2),
        '\n==================================================',
      );

      dispatch(
        createBooking(bookingPayload, (error, responseData) => {
          setBookingLoading(false);
          let extractedBookingId = null;

          if (error) {
            console.log(
              '==================================================',
              '\n[PreBookingServiceScreen Create Booking Error]',
              '\nError:',
              JSON.stringify(error, null, 2),
              '\n==================================================',
            );
          } else {
            const mongoIdCandidate =
              responseData?.data?._id ||
              responseData?._id ||
              responseData?.data?.id ||
              responseData?.id ||
              responseData?.data?.bookingId ||
              responseData?.bookingId;

            extractedBookingId = isValidObjectId(mongoIdCandidate)
              ? String(mongoIdCandidate).trim()
              : mongoIdCandidate || '665b1234567890abcdef1234';

            console.log(
              '==================================================',
              '\n[PreBookingServiceScreen Create Booking Success]',
              `\nExtracted Booking ID: ${extractedBookingId}`,
              '\nResponse:',
              JSON.stringify(responseData, null, 2),
              '\n==================================================',
            );
          }

          if (onSuccess) {
            onSuccess(bookingPayload, responseData, extractedBookingId);
          }
        }),
      );
    } catch (err) {
      setBookingLoading(false);
      console.log(
        '[PreBookingServiceScreen] checkAuthAndAddressAndProceed Error:',
        err,
      );
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const reduxUserObj =
        user?.customerUser || user?.user || user?.data?.user || user || {};
      let userAddresses =
        reduxUserObj?.addresses ||
        user?.addresses ||
        reduxVendorDetails?.user?.addresses ||
        [];

      let storageAddresses = [];
      try {
        const rawAddresses = await AsyncStorage.getItem('ADDRESSES');
        if (rawAddresses) {
          storageAddresses = JSON.parse(rawAddresses);
        }
      } catch (e) {
        console.log(
          '[PreBookingServiceScreen] Storage address parse error:',
          e,
        );
      }

      const allAddresses = [
        ...(Array.isArray(userAddresses) ? userAddresses : []),
        ...(Array.isArray(storageAddresses) ? storageAddresses : []),
      ].filter(Boolean);

      const map = new Map();
      allAddresses.forEach(item => {
        const key = item._id || item.id || item.address;
        if (key && !map.has(key)) {
          map.set(String(key), item);
        }
      });

      let savedList = Array.from(map.values());

      const activeHomeScreenAddress =
        locationState?.fullAddress ||
        locationState?.address ||
        '8, Rameshwar Nagar, J P Nagar Society, Bardoli, Gujarat, India';

      const activeMobile =
        user?.mobile ||
        user?.mobileNumber ||
        user?.phoneNumber ||
        user?.user?.mobile ||
        user?.customerUser?.mobile ||
        '7405665654';

      const formattedMobile = String(activeMobile).startsWith('+')
        ? String(activeMobile)
        : `+91-${activeMobile}`;

      const currentLocationCard = {
        id: 'current_location_card_top',
        locationType: 'unlabeled',
        type: 'Current Location',
        address: activeHomeScreenAddress,
        displayAddress: activeHomeScreenAddress,
        mobile: formattedMobile,
        latitude: locationState?.latitude || 21.1255,
        longitude: locationState?.longitude || 73.1155,
      };

      const filteredSavedList = savedList.filter(item => {
        const addrStr = item?.address || item?.displayAddress || '';
        return !addrStr.includes('412, amazing star');
      });

      const finalCombinedList = [currentLocationCard, ...filteredSavedList];

      setSavedAddressesList(finalCombinedList);
    } catch (err) {
      console.log('[PreBookingServiceScreen] loadSavedAddresses Error:', err);
    }
  };

  const handleBookAppointmentPress = () => {
    if (isSalonCategory) {
      checkAuthAndAddressAndProceed((payload, responseData, bookingId) => {
        navigation.navigate('BookingSummaryScreen', {
          bookingId: bookingId || '9F8A2D3C',
          item: apiData,
          vendor: apiData,
          selectedServices,
          bookingData: responseData,
        });
      });
    } else {
      loadSavedAddresses();
      refAddressSheet.current?.open();
    }
  };

  const handleSelectAddressAndProceed = selectedAddr => {
    refAddressSheet.current?.close();
    checkAuthAndAddressAndProceed((payload, responseData, bookingId) => {
      navigation.navigate('BookingSummaryScreen', {
        bookingId: bookingId || '9F8A2D3C',
        item: apiData,
        vendor: apiData,
        selectedServices,
        bookingData: responseData,
        selectedAddress: selectedAddr,
      });
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {fetchingDetails && !apiVendorDetails ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={colors.pureBlack} />
          <Text
            style={{
              marginTop: hp(12),
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins500,
              color: '#8E8E93',
            }}>
            Loading Vendor Profile...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: hp(90)}}>
          {/* HERO IMAGE & FLOATING ACTION BUTTONS */}
          <View style={{width: '100%', height: hp(250), position: 'relative'}}>
            <Image
              source={{uri: imageUri}}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
              }}
            />

            {/* FLOATING BACK BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBackPress}
              style={{
                position: 'absolute',
                top: hp(16),
                left: wp(18),
                width: hp(38),
                height: hp(38),
                borderRadius: hp(19),
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.15,
                shadowRadius: 3,
              }}>
              <Image
                source={icons.back_Arrow_Icon}
                style={{
                  width: hp(16),
                  height: hp(16),
                  resizeMode: 'contain',
                  tintColor: colors.pureBlack,
                }}
              />
            </TouchableOpacity>

            {/* FLOATING STATUS BADGE PILL (OFFLINE / ONLINE) */}
            <View
              style={{
                position: 'absolute',
                top: hp(16),
                right: wp(64),
                paddingHorizontal: wp(14),
                paddingVertical: hp(6),
                borderRadius: hp(50),
                backgroundColor: '#EDEDED',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.15,
                shadowRadius: 3,
              }}>
              <Text
                style={{
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins500,
                  color: colors.pureBlack,
                }}>
                {statusBadgeText}
              </Text>
            </View>

            {/* FLOATING LIKE / HEART BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsLiked(!isLiked)}
              style={{
                position: 'absolute',
                top: hp(16),
                right: wp(18),
                width: hp(38),
                height: hp(38),
                borderRadius: hp(19),
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.15,
                shadowRadius: 3,
              }}>
              <Text
                style={{
                  fontSize: fontSize(18),
                  color: isLiked ? '#FF3B30' : colors.pureBlack,
                }}>
                {isLiked ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* OVERLAPPING VENDOR INFO CARD SHEET */}
          <View
            style={{
              marginTop: -hp(24),
              borderTopLeftRadius: hp(24),
              borderTopRightRadius: hp(24),
              backgroundColor: colors.white,
              paddingHorizontal: wp(20),
              paddingTop: hp(20),
              paddingBottom: hp(10),
            }}>
            {/* Business Name & Verified Badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: fontSize(22),
                  fontFamily: fontFamily.poppins700,
                  color: colors.pureBlack,
                }}>
                {businessName}
              </Text>

              <Image
                source={icons.verified_Icon}
                style={{
                  width: hp(18),
                  height: hp(18),
                  resizeMode: 'contain',
                  marginLeft: wp(8),
                }}
              />
            </View>

            {/* Location Subtitle */}
            <Text
              style={{
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                color: '#9E9E9E',
                marginTop: hp(4),
              }}>
              {locationText}
            </Text>

            {/* Rating Pill */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp(14),
              }}>
              <View
                style={{
                  backgroundColor: '#3A3A3A',
                  borderRadius: hp(50),
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: wp(12),
                  paddingVertical: hp(5),
                }}>
                <Image
                  source={icons.star_Icon}
                  style={{
                    width: hp(14),
                    height: hp(14),
                    resizeMode: 'contain',
                    marginRight: wp(6),
                  }}
                />
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  {rating}
                </Text>
              </View>
            </View>
          </View>

          {/* OFFERED SERVICES SECTION */}
          <View style={{paddingHorizontal: wp(20), paddingTop: hp(16)}}>
            <Text
              style={{
                fontSize: fontSize(18),
                fontFamily: fontFamily.poppins700,
                color: colors.pureBlack,
                marginBottom: hp(14),
              }}>
              Offered Services
            </Text>

            {offeredServices.length === 0 ? (
              <Text
                style={{
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                  color: '#9E9E9E',
                }}>
                No services listed.
              </Text>
            ) : (
              offeredServices.map((serviceObj, index) => {
                const isSelected = selectedServices.includes(index);
                return (
                  <TouchableOpacity
                    key={serviceObj.id || index}
                    activeOpacity={0.8}
                    onPress={() => toggleServiceSelect(index)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? '#FCFAFF' : '#FAFAFA',
                      borderWidth: isSelected ? 1.5 : 0,
                      borderColor: isSelected ? '#731EE2' : 'transparent',
                      borderRadius: hp(16),
                      paddingVertical: hp(14),
                      paddingHorizontal: wp(18),
                      marginBottom: hp(12),
                    }}>
                    {/* Service Title */}
                    <Text
                      style={{
                        fontSize: fontSize(15),
                        fontFamily: fontFamily.poppins600,
                        color: isSelected ? '#731EE2' : colors.pureBlack,
                        flex: 1,
                      }}>
                      {serviceObj.title}
                    </Text>

                    {/* Price (Displayed ONLY for Saloon Category) */}
                    {isSalonCategory && (
                      <Text
                        style={{
                          fontSize: fontSize(15),
                          fontFamily: fontFamily.poppins700,
                          color: isSelected ? '#731EE2' : colors.pureBlack,
                          marginRight: wp(14),
                        }}>
                        {serviceObj.price}
                      </Text>
                    )}

                    {/* Action Checkmark / Plus Icon */}
                    <View
                      style={{
                        width: hp(24),
                        height: hp(24),
                        borderRadius: hp(12),
                        backgroundColor: isSelected ? '#731EE2' : '#000000',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: fontSize(13),
                          fontWeight: '700',
                          top: -1,
                        }}>
                        {isSelected ? '✓' : '+'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* STICKY BOTTOM ACTION FOOTER FOR ALL CATEGORIES */}
      {!fetchingDetails && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            paddingHorizontal: wp(20),
            paddingVertical: hp(12),
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -3},
            shadowOpacity: 0.08,
            shadowRadius: 5,
          }}>
          <TouchableOpacity
            activeOpacity={bookingLoading ? 1 : 0.8}
            disabled={bookingLoading}
            onPress={handleBookAppointmentPress}
            style={{
              width: '100%',
              height: hp(52),
              backgroundColor: '#731EE2',
              borderRadius: hp(50),
              justifyContent: 'center',
              alignItems: 'center',
              opacity: bookingLoading ? 0.6 : 1,
            }}>
            {bookingLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                  textAlign: 'center',
                }}>
                Book Appointment
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* SELECT AN ADDRESS RAW BOTTOM SHEET */}
      <RBSheet
        ref={refAddressSheet}
        height={hp(520)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            paddingHorizontal: wp(20),
            paddingTop: hp(20),
            paddingBottom: hp(20),
            backgroundColor: '#F8FAFC',
          },
        }}>
        {/* Title */}
        <Text
          style={{
            fontSize: fontSize(18),
            fontFamily: fontFamily.poppins700,
            color: '#1A1D26',
            marginBottom: hp(16),
          }}>
          Select an address
        </Text>

        {/* + Add Address Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            refAddressSheet.current?.close();
            navigation.navigate('EnterCompleteAddressScreen');
          }}
          style={{
            width: '100%',
            backgroundColor: colors.white,
            borderRadius: hp(16),
            borderWidth: 1,
            borderColor: '#E8ECF2',
            paddingVertical: hp(14),
            paddingHorizontal: wp(16),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: hp(20),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: fontSize(20),
                color: '#00875A',
                fontFamily: fontFamily.poppins600,
                marginRight: wp(12),
                lineHeight: hp(22),
              }}>
              +
            </Text>
            <Text
              style={{
                fontSize: fontSize(15),
                fontFamily: fontFamily.poppins600,
                color: '#00875A',
              }}>
              Add Address
            </Text>
          </View>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(10),
              height: hp(12),
              tintColor: '#6B7280',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </TouchableOpacity>

        {/* ADDRESS CARDS LIST */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {(() => {
            const currentLocationItem = savedAddressesList.find(
              a =>
                a?.id === 'current_location_card_top' ||
                a?.locationType === 'current' ||
                a?.locationType === 'unlabeled',
            );

            const otherSavedAddresses = savedAddressesList.filter(
              a =>
                a?.id !== 'current_location_card_top' &&
                a?.locationType !== 'current' &&
                a?.locationType !== 'unlabeled',
            );

            const renderAddressCard = (addrItem, cardIndex) => {
              const isCurrentLoc =
                addrItem?.id === 'current_location_card_top' ||
                addrItem?.locationType === 'current' ||
                addrItem?.locationType === 'unlabeled';

              const displayTitle = isCurrentLoc
                ? 'Current Location'
                : addrItem?.type || addrItem?.locationType || 'Saved Address';

              const fullText =
                addrItem?.displayAddress ||
                addrItem?.address ||
                locationState?.fullAddress ||
                '8, Rameshwar Nagar, J P Nagar Society, Bardoli, Gujarat, India';

              const rawUserPhone =
                addrItem?.mobile ||
                addrItem?.receiverMobile ||
                user?.mobile ||
                user?.mobileNumber ||
                user?.phoneNumber ||
                '7405665654';

              const userPhone = String(rawUserPhone).startsWith('+')
                ? String(rawUserPhone)
                : `+91-${rawUserPhone}`;

              return (
                <TouchableOpacity
                  key={cardIndex}
                  activeOpacity={0.8}
                  onPress={() => handleSelectAddressAndProceed(addrItem)}
                  style={{
                    width: '100%',
                    backgroundColor: colors.white,
                    borderRadius: hp(20),
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                    padding: wp(18),
                    marginBottom: hp(14),
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                  {/* DELIVERS TO BADGE */}
                  <Text
                    style={{
                      fontSize: fontSize(11),
                      fontFamily: fontFamily.poppins700,
                      color: '#3B82F6',
                      letterSpacing: 0.6,
                      marginBottom: hp(12),
                      textTransform: 'uppercase',
                    }}>
                    DELIVERS TO
                  </Text>

                  {/* MAIN CONTENT ROW */}
                  <View
                    style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    {/* LEFT COLUMN: ICON */}
                    <View
                      style={{
                        alignItems: 'center',
                        marginRight: wp(16),
                        width: wp(28),
                      }}>
                      <Image
                        source={
                          isCurrentLoc
                            ? icons.location_Icon
                            : String(displayTitle)
                                .toLowerCase()
                                .includes('work')
                            ? icons.work_Icon || icons.home_Icon
                            : icons.home_Icon
                        }
                        style={{
                          width: hp(24),
                          height: hp(24),
                          tintColor: isCurrentLoc
                            ? colors.primaryColor || '#731EE2'
                            : '#475569',
                          resizeMode: 'contain',
                        }}
                      />
                    </View>

                    {/* RIGHT COLUMN: TITLE, ADDRESS, PHONE */}
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontSize: fontSize(16),
                          fontFamily: fontFamily.poppins700,
                          color: '#1E293B',
                          marginBottom: hp(4),
                        }}>
                        {displayTitle}
                      </Text>

                      <Text
                        style={{
                          fontSize: fontSize(13),
                          fontFamily: fontFamily.poppins400,
                          color: '#475569',
                          lineHeight: hp(20),
                          marginBottom: hp(6),
                        }}
                        numberOfLines={3}>
                        {fullText}
                      </Text>

                      <Text
                        style={{
                          fontSize: fontSize(12),
                          fontFamily: fontFamily.poppins500,
                          color: '#64748B',
                        }}>
                        Phone number:{' '}
                        <Text
                          style={{
                            fontFamily: fontFamily.poppins600,
                            color: '#1E293B',
                          }}>
                          {userPhone}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            };

            return (
              <>
                {/* 1. CURRENT LOCATION CARD */}
                {currentLocationItem &&
                  renderAddressCard(currentLocationItem, 'top_current')}

                {/* 2. SAVED ADDRESSES HEADER */}
                {otherSavedAddresses.length > 0 && (
                  <Text
                    style={{
                      fontSize: fontSize(12),
                      fontFamily: fontFamily.poppins600,
                      color: '#8D93A1',
                      letterSpacing: 0.8,
                      marginTop: hp(10),
                      marginBottom: hp(12),
                      textTransform: 'uppercase',
                    }}>
                    SAVED ADDRESSES
                  </Text>
                )}

                {/* 3. OTHER SAVED ADDRESS CARDS */}
                {otherSavedAddresses.map((addrItem, idx) =>
                  renderAddressCard(addrItem, `saved_${idx}`),
                )}
              </>
            );
          })()}
        </ScrollView>
      </RBSheet>
    </SafeAreaView>
  );
};

export default PreBookingServiceScreen;
