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
import {
  fontFamily,
  fontSize,
  formatReviewTime,
  hp,
  wp,
} from '../../../utils/helpers';
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

  // Extract Rating (use averageRating first, fallback to rating)
  const rawRatingVal = Number(
    apiData?.averageRating ??
      apiData?.rating ??
      vendorUserObj?.averageRating ??
      vendorUserObj?.rating ??
      userObj?.averageRating ??
      userObj?.rating ??
      routeVendorData?.averageRating ??
      routeVendorData?.rating ??
      0,
  );
  const rating = !isNaN(rawRatingVal) && rawRatingVal > 0 ? rawRatingVal : 0;

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

  // Extract Customer Reviews from API data
  const apiReviews =
    apiData?.reviews ||
    apiData?.vendorUser?.reviews ||
    apiData?.data?.reviews ||
    routeVendorData?.reviews ||
    [];

  const customerReviews =
    Array.isArray(apiReviews) && apiReviews.length > 0
      ? apiReviews.map((r, idx) => ({
          id: r._id || r.id || String(idx),
          name:
            r.customerName ||
            r.user?.fullName ||
            r.user?.name ||
            r.userName ||
            r.name ||
            'Customer',
          service: r.serviceName || r.service || '',
          time: formatReviewTime(
            r.reviewTime || r.createdAt || r.time || r.date,
          ),
          rating: r.stars ?? r.rating ?? r.star ?? 5,
          review: r.review || r.comment || r.feedback || '',
          reply: r.reply || r.vendorReply || null,
          image:
            r.userProfilePic ||
            r.user?.profilePic ||
            r.user?.userProfilePic ||
            r.userImage ||
            r.profilePic ||
            r.image ||
            'https://randomuser.me/api/portraits/men/32.jpg',
        }))
      : [];

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

  const isValidObjectId = val =>
    typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val.trim());

  const getPreparedBookingPayload = () => {
    const validServiceIds = selectedServices
      .map(idx => {
        const sObj = offeredServices[idx] || {};
        const raw = sObj?.rawObj || sObj;

        const candidates = [
          typeof raw?.serviceId === 'object'
            ? raw?.serviceId?._id || raw?.serviceId?.id
            : null,
          typeof raw?.serviceId === 'string' ? raw?.serviceId : null,
          sObj?.serviceId?._id,
          sObj?.serviceId?.id,
          typeof sObj?.serviceId === 'string' ? sObj?.serviceId : null,
          sObj?.masterServiceId,
          raw?.masterServiceId,
          raw?._id,
          raw?.id,
          sObj?._id,
          sObj?.id,
        ];

        for (const cand of candidates) {
          if (isValidObjectId(cand)) {
            return String(cand).trim();
          }
        }
        return null;
      })
      .filter(Boolean);

    const allApiServices = [
      ...(Array.isArray(apiData?.services) ? apiData.services : []),
      ...(Array.isArray(apiData?.vendorUser?.services)
        ? apiData.vendorUser.services
        : []),
      ...(Array.isArray(routeVendorData?.services)
        ? routeVendorData.services
        : []),
    ];

    const fallbackServiceIds = allApiServices
      .map(s => {
        const cand =
          typeof s?.serviceId === 'object'
            ? s?.serviceId?._id || s?.serviceId?.id
            : typeof s?.serviceId === 'string'
            ? s?.serviceId
            : s?._id || s?.id;
        return isValidObjectId(cand) ? String(cand).trim() : null;
      })
      .filter(Boolean);

    const finalServiceIdsToPass =
      validServiceIds.length > 0 ? validServiceIds : fallbackServiceIds;

    const firstSelectedObj =
      offeredServices[selectedServices[0]] || offeredServices[0] || {};

    const candidateVendorServiceId = [
      firstSelectedObj?.vendorServiceId,
      firstSelectedObj?.rawObj?._id,
      firstSelectedObj?.rawObj?.id,
      apiData?.vendorServiceId,
      apiData?.vendorService?._id,
      apiData?.vendorService?.id,
      apiData?._id,
      apiData?.id,
    ].find(val => isValidObjectId(val));

    const vendorServiceIdToPass = candidateVendorServiceId
      ? String(candidateVendorServiceId).trim()
      : undefined;

    const selectedNotes =
      offeredServices
        .filter((_, idx) => selectedServices.includes(idx))
        .map(s => s.title)
        .join(' and ') || 'Instant service';

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentBookingDate = `${year}-${month}-${day}`;

    const currentRealTimeSlot = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase();

    const payload = {
      vendorId: vendorUserId || '6a7320cb3577104793b1929b',
      notes: selectedNotes,
      bookingDate: currentBookingDate,
      timeSlot: currentRealTimeSlot,
    };

    if (vendorServiceIdToPass) {
      payload.vendorServiceId = vendorServiceIdToPass;
    }

    if (finalServiceIdsToPass.length > 0) {
      payload.serviceIds = finalServiceIdsToPass;
    }

    return payload;
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
        'Current Location';

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
    const payload = getPreparedBookingPayload();
    navigation.navigate('BookingSummaryScreen', {
      item: apiData,
      vendor: apiData,
      selectedServices,
      bookingPayload: payload,
    });
  };

  const handleSelectAddressAndProceed = selectedAddr => {
    refAddressSheet.current?.close();
    const payload = getPreparedBookingPayload();
    navigation.navigate('BookingSummaryScreen', {
      item: apiData,
      vendor: apiData,
      selectedServices,
      selectedAddress: selectedAddr,
      bookingPayload: payload,
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
          contentContainerStyle={{paddingBottom: hp(100)}}>
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
                backgroundColor: 'rgba(0,0,0,0.5)',
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
                  tintColor: colors.white,
                }}
              />
            </TouchableOpacity>

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
                // backgroundColor: '#000000D6',
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.15,
                shadowRadius: 3,
              }}>
              <Image
                source={icons.heart_Icon}
                style={{
                  width: hp(17),
                  height: hp(17),
                  resizeMode: 'contain',
                  tintColor: isLiked ? '#731EE2' : '#FFFFFF',
                }}
              />
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
            {Number(rating) > 0 && (
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
            )}
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

          {/* CUSTOMER REVIEWS SECTION */}
          {customerReviews.length > 0 && (
            <View style={{paddingHorizontal: wp(20), paddingTop: hp(16)}}>
              <Text
                style={{
                  fontSize: fontSize(18),
                  fontFamily: fontFamily.poppins700,
                  color: colors.pureBlack,
                  marginBottom: hp(14),
                }}>
                Customer Reviews
              </Text>

              {customerReviews.map((item, index) => (
                <View
                  key={item.id || index}
                  style={{
                    borderWidth: 1,
                    borderColor: '#EAEAEA',
                    borderRadius: hp(18),
                    padding: wp(18),
                    marginBottom: hp(14),
                    backgroundColor: colors.white,
                  }}>
                  {/* User Header */}
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      source={{uri: item.image}}
                      style={{
                        width: hp(36),
                        height: hp(36),
                        borderRadius: hp(18),
                      }}
                    />

                    <View style={{marginLeft: wp(12)}}>
                      <Text
                        style={{
                          fontSize: fontSize(15),
                          fontFamily: fontFamily.poppins600,
                          color: colors.pureBlack,
                        }}>
                        {item.name}
                      </Text>

                      <Text
                        style={{
                          fontSize: fontSize(12),
                          color: '#B4B4B4',
                          fontFamily: fontFamily.poppins400,
                          marginTop: hp(2),
                        }}>
                        {item.service
                          ? `${item.service} • ${item.time}`
                          : item.time}
                      </Text>
                    </View>
                  </View>

                  {/* Review Text */}
                  {Boolean(item.review) && (
                    <Text
                      style={{
                        marginTop: hp(12),
                        fontSize: fontSize(12),
                        color: '#2C2C2C',
                        fontFamily: fontFamily.poppins400,
                        lineHeight: hp(18),
                      }}>
                      {item.review}
                    </Text>
                  )}

                  {/* Rating Footer */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: hp(14),
                    }}>
                    <Image
                      source={icons.star_Icon}
                      style={{
                        width: hp(14),
                        height: hp(14),
                        tintColor: '#F0AA07',
                        marginRight: wp(6),
                      }}
                    />
                    <Text
                      style={{
                        fontSize: fontSize(13),
                        color: colors.pureBlack,
                        fontFamily: fontFamily.poppins600,
                      }}>
                      {item.rating}
                    </Text>
                  </View>

                  {/* Vendor Reply Card */}
                  {Boolean(
                    item.reply && String(item.reply).trim().length > 0,
                  ) && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F7F7F7',
                        borderRadius: hp(14),
                        padding: wp(14),
                        marginTop: hp(14),
                      }}>
                      <Image
                        source={{uri: imageUri}}
                        style={{
                          width: hp(32),
                          height: hp(32),
                          borderRadius: hp(50),
                        }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          marginLeft: wp(12),
                          fontSize: fontSize(13),
                          fontFamily: fontFamily.poppins400,
                          color: colors.pureBlack,
                          lineHeight: hp(18),
                        }}>
                        {item.reply}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
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
                'Current Location';

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
