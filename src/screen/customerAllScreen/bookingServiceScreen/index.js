import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {colors} from '../../../utils/colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getVendorServicesByCategory} from '../../../actions/customerAuthActions';

const filterOptions = [
  'Instant Booking',
  'Schedule Booking',
  'Popular',
  'Within 1 km',
];

const BookingServiceScreen = ({route}) => {
  const dispatch = useDispatch();
  const refRBSheet = useRef();

  const {
    place,
    fullAddress,
    longitude: reduxLon,
    latitude: reduxLat,
  } = useSelector(state => state.location);
  const {loading: sagaLoading, vendorServices: reduxVendorServices} =
    useSelector(state => state.auth || {});

  const [search, setSearch] = useState('');
  const [vendorServicesList, setVendorServicesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter BottomSheet State
  const [selectedFilter, setSelectedFilter] = useState('Instant Booking');
  const [appliedFilter, setAppliedFilter] = useState(null);

  const navigation = useNavigation();

  const {
    category,
    categoryId: paramCatId,
    longitude: paramLon,
    latitude: paramLat,
  } = route?.params || {};

  const categoryId =
    paramCatId || category?._id || category?.id || '6a70376b304b3286b0534645';
  const lon = paramLon || reduxLon || 72.5714;
  const lat = paramLat || reduxLat || 23.0225;

  useEffect(() => {
    setLoading(true);
    setPage(1);
    console.log(
      '==================================================',
      '\n[BookingServiceScreen Dispatching Redux Saga Action (Page 1)]',
      '\nAction: GET_VENDOR_SERVICES_BY_CATEGORY',
      `\nCategory ID: ${categoryId}`,
      `\nLongitude: ${lon}`,
      `\nLatitude: ${lat}`,
      '\nPage: 1',
      '\n==================================================',
    );

    dispatch(
      getVendorServicesByCategory(
        categoryId,
        lon,
        lat,
        (error, responseData) => {
          setLoading(false);
          if (error) {
            console.log(
              '==================================================',
              '\n[BookingServiceScreen Redux Saga Error Callback]',
              '\nError:',
              JSON.stringify(error, null, 2),
              '\n==================================================',
            );
          } else {
            console.log(
              '==================================================',
              '\n[BookingServiceScreen Redux Saga Success Callback]',
              '\nData Payload:',
              JSON.stringify(responseData, null, 2),
              '\n==================================================',
            );

            const fetchedList =
              (Array.isArray(responseData?.data?.docs) &&
                responseData.data.docs) ||
              (Array.isArray(responseData?.docs) && responseData.docs) ||
              (Array.isArray(responseData?.data?.services) &&
                responseData.data.services) ||
              (Array.isArray(responseData?.data?.vendorServices) &&
                responseData.data.vendorServices) ||
              (Array.isArray(responseData?.services) &&
                responseData.services) ||
              (Array.isArray(responseData?.vendorServices) &&
                responseData.vendorServices) ||
              (Array.isArray(responseData?.data) && responseData.data) ||
              (Array.isArray(responseData) ? responseData : []);

            const totalP =
              responseData?.data?.totalPages || responseData?.totalPages || 1;

            if (Array.isArray(fetchedList)) {
              setVendorServicesList(fetchedList);
            }
            setTotalPages(totalP);
          }
        },
        1,
        10,
      ),
    );
  }, [categoryId, lon, lat, dispatch]);

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) {
      return;
    }

    const nextPage = page + 1;
    setLoadingMore(true);
    console.log(
      '==================================================',
      '\n[BookingServiceScreen Loading More Data]',
      `\nFetching Page: ${nextPage} of ${totalPages}`,
      '\n==================================================',
    );

    dispatch(
      getVendorServicesByCategory(
        categoryId,
        lon,
        lat,
        (error, responseData) => {
          setLoadingMore(false);
          if (error) {
            console.log('[BookingServiceScreen LoadMore Error]:', error);
          } else {
            const newDocs =
              (Array.isArray(responseData?.data?.docs) &&
                responseData.data.docs) ||
              (Array.isArray(responseData?.docs) && responseData.docs) ||
              (Array.isArray(responseData?.data?.services) &&
                responseData.data.services) ||
              (Array.isArray(responseData?.data?.vendorServices) &&
                responseData.data.vendorServices) ||
              (Array.isArray(responseData?.services) &&
                responseData.services) ||
              (Array.isArray(responseData?.data) && responseData.data) ||
              (Array.isArray(responseData) ? responseData : []);

            const totalP =
              responseData?.data?.totalPages ||
              responseData?.totalPages ||
              totalPages;

            setTotalPages(totalP);
            setPage(nextPage);

            if (Array.isArray(newDocs) && newDocs.length > 0) {
              setVendorServicesList(prevList => {
                const existingIds = new Set(
                  prevList.map(item => item._id || item.id || item.userId),
                );
                const filteredNew = newDocs.filter(
                  item => !existingIds.has(item._id || item.id || item.userId),
                );
                return [...prevList, ...filteredNew];
              });
            }
          }
        },
        nextPage,
        10,
      ),
    );
  };

  // Filter vendor list by search text and applied filter option
  const filteredList = vendorServicesList.filter(item => {
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      const bName = (
        item.businessName ||
        item.business_name ||
        item.name ||
        ''
      ).toLowerCase();
      const sTitle = (
        item.categoryTitle ||
        item.category_title ||
        item.serviceName ||
        ''
      ).toLowerCase();
      if (!bName.includes(q) && !sTitle.includes(q)) {
        return false;
      }
    }

    if (appliedFilter === 'Instant Booking') {
      const avail = item.vendorAvailability || {};
      const isInstant =
        avail.bookingOption === 'instant' ||
        avail.statusBadge === 'instant' ||
        avail.isOnline === true;
      if (!isInstant) {
        return false;
      }
    } else if (appliedFilter === 'Schedule Booking') {
      const avail = item.vendorAvailability || {};
      const isSchedule =
        avail.bookingOption === 'schedule' || avail.statusBadge === 'schedule';
      if (!isSchedule) {
        return false;
      }
    } else if (appliedFilter === 'Popular') {
      const ratingVal = Number(item.rating || 4.8);
      if (ratingVal < 4.5) {
        return false;
      }
    } else if (appliedFilter === 'Within 1 km') {
      const distVal =
        item.distance !== null && item.distance !== undefined
          ? Number(item.distance)
          : null;
      if (distVal !== null && !isNaN(distVal) && distVal > 1) {
        return false;
      }
    }

    return true;
  });

  const dataToDisplay = filteredList.map((item, idx) => ({
    id: item._id || item.id || idx.toString(),
    name:
      item.businessName ||
      item.business_name ||
      item.vendor?.businessName ||
      item.vendor?.business_name ||
      item.vendorId?.businessName ||
      item.vendorId?.business_name ||
      item.vendorName ||
      item.vendor_name ||
      item.vendorId?.name ||
      item.vendor?.name ||
      item.name ||
      item.title ||
      'Quick Service Provider',
    service:
      item.categoryTitle ||
      item.category_title ||
      item.serviceDetails?.title ||
      item.serviceDetails?.name ||
      item.serviceName ||
      item.service_name ||
      item.title ||
      item.service?.name ||
      item.serviceId?.name ||
      category?.name ||
      'Professional Service',
    price:
      item.charge !== null && item.charge !== undefined
        ? `Rs. ${item.charge}`
        : item.visitCharge !== null && item.visitCharge !== undefined
        ? `Rs. ${item.visitCharge}`
        : item.price
        ? `Rs. ${item.price}`
        : 'Rs. 0',

    rating: item.rating ? item.rating.toString() : '4.8',
    distance:
      item.distance !== null &&
      item.distance !== undefined &&
      !isNaN(Number(item.distance))
        ? `${Number(item.distance).toFixed(1)} Km Away`
        : item.dist !== null &&
          item.dist !== undefined &&
          !isNaN(Number(item.dist))
        ? `${Number(item.dist).toFixed(1)} Km Away`
        : '8.6 Km Away',
    time:
      item.distance !== null &&
      item.distance !== undefined &&
      !isNaN(Number(item.distance))
        ? `${Number(item.distance).toFixed(1)} Km Away`
        : item.duration
        ? `${item.duration} mins`
        : '8.6 Km Away',
    _id: item._id || item.id || item.userId || item.vendorUserId,
    rawItem: item,
    vendorAvailability:
      item.vendorAvailability ||
      item.vendor?.vendorAvailability ||
      item.vendorId?.vendorAvailability ||
      {},
    image:
      (typeof item.profilePic === 'string' &&
        item.profilePic.trim() !== '' &&
        item.profilePic) ||
      (typeof item.profile_pic === 'string' &&
        item.profile_pic.trim() !== '' &&
        item.profile_pic) ||
      (typeof item.profileImage === 'string' &&
        item.profileImage.trim() !== '' &&
        item.profileImage) ||
      (Array.isArray(item.profilePic) && item.profilePic[0]) ||
      (Array.isArray(item.profileImage) && item.profileImage[0]) ||
      item.image ||
      item.imageUrl ||
      item.vendor?.image ||
      item.vendorId?.image ||
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f',
  }));

  const renderItem = ({item}) => {
    const nameStr = (
      category?.name ||
      category?.title ||
      category?.key ||
      category?.categoryName ||
      item?.categoryTitle ||
      item?.category_title ||
      item?.categoryName ||
      item?.service ||
      item?.name ||
      ''
    ).toLowerCase();

    const isSalonCategory =
      nameStr.includes('salon') ||
      nameStr.includes('saloon') ||
      nameStr.includes('beauty') ||
      nameStr.includes('barber');

    const availabilityObj =
      item.vendorAvailability ||
      item.rawItem?.vendorAvailability ||
      item.vendor?.vendorAvailability ||
      item.vendorId?.vendorAvailability ||
      item.rawItem ||
      item;

    const isAvailable =
      availabilityObj?.isAvailable !== undefined
        ? Boolean(availabilityObj.isAvailable)
        : item.rawItem?.isAvailable !== undefined
        ? Boolean(item.rawItem.isAvailable)
        : item.isAvailable !== undefined
        ? Boolean(item.isAvailable)
        : Boolean(
            availabilityObj?.isOnline !== false &&
              availabilityObj?.storeStatus !== 'offline' &&
              availabilityObj?.statusBadge !== 'offline',
          );

    if (isSalonCategory) {
      const startingPrice = item.price
        ? item.price.startsWith('Rs.')
          ? item.price
          : `Rs. ${item.price}`
        : 'Rs. 500';

      return (
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: hp(18),
            marginBottom: hp(16),
            borderWidth: 1,
            borderColor: '#E8E8E8',
            overflow: 'hidden',
          }}>
          {/* Image Container */}
          <View style={{position: 'relative'}}>
            <Image
              source={{uri: item.image}}
              style={{
                width: '100%',
                height: hp(140),
                resizeMode: 'cover',
              }}
            />

            {/* Rating Pill */}
            <View
              style={{
                position: 'absolute',
                top: hp(12),
                left: wp(12),
                backgroundColor: 'rgba(28, 28, 28, 0.85)',
                borderRadius: hp(50),
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: wp(10),
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
                {item.rating}
              </Text>
            </View>

            {/* Status Pill (Offline Only when isAvailable is false) */}
            {!isAvailable && (
              <View
                style={{
                  position: 'absolute',
                  top: hp(12),
                  right: wp(12),
                  backgroundColor: '#FEE2E2',
                  borderRadius: hp(50),
                  paddingHorizontal: wp(14),
                  paddingVertical: hp(5),
                }}>
                <Text
                  style={{
                    color: '#DC2626',
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  Vendor is offline
                </Text>
              </View>
            )}
          </View>

          {/* Card Body */}
          <View
            style={{
              paddingHorizontal: wp(16),
              paddingTop: hp(14),
              paddingBottom: hp(14),
            }}>
            {/* Business Title & Verified Badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: fontFamily.poppins600,
                  fontSize: fontSize(18),
                  color: colors.pureBlack,
                }}>
                {item.name}
              </Text>
              <Image
                source={icons.verified_Icon}
                style={{
                  width: hp(16),
                  height: hp(16),
                  resizeMode: 'contain',
                  marginLeft: wp(8),
                }}
              />
            </View>

            {/* Starting Price Subtitle */}
            <Text
              style={{
                fontFamily: fontFamily.poppins400,
                fontSize: fontSize(14),
                color: '#4A4A4A',
                marginTop: hp(4),
              }}>
              Starting from{' '}
              <Text
                style={{
                  fontFamily: fontFamily.poppins600,
                  color: '#731EE2',
                }}>
                {startingPrice}
              </Text>
            </Text>

            {/* Divider Line */}
            <View
              style={{
                width: '100%',
                height: hp(1),
                backgroundColor: '#E6E6E6',
                marginTop: hp(14),
                marginBottom: hp(12),
              }}
            />

            {!isAvailable ? (
              <>
                {/* Distance Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: hp(14),
                  }}>
                  <Image
                    source={icons.clock_Icon || icons.location_Icon}
                    style={{
                      width: hp(14),
                      height: hp(14),
                      tintColor: '#6B7280',
                      resizeMode: 'contain',
                      marginRight: wp(6),
                    }}
                  />
                  <Text
                    style={{
                      fontSize: fontSize(13),
                      fontFamily: fontFamily.poppins500,
                      color: '#6B7280',
                    }}>
                    {item.distance || '1.2km Away'}
                  </Text>
                </View>

                {/* Notify Me Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      'Notification Set',
                      `We will notify you when ${item.name} becomes available.`,
                    )
                  }
                  style={{
                    width: '100%',
                    height: hp(44),
                    backgroundColor: '#FAF5FF',
                    borderRadius: hp(50),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={icons.notification_Bell_Icon}
                    style={{
                      width: hp(16),
                      height: hp(16),
                      tintColor: '#731EE2',
                      resizeMode: 'contain',
                      marginRight: wp(8),
                    }}
                  />
                  <Text
                    style={{
                      color: '#731EE2',
                      fontFamily: fontFamily.poppins600,
                      fontSize: fontSize(14),
                    }}>
                    Notify Me When Available
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Centered Book Now with Right Arrow */
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('PreBookingServiceScreen', {
                    vendorUserId:
                      item._id || item.rawItem?._id || item.id || item.userId,
                    item: item.rawItem || item,
                    vendor: item.rawItem || item,
                  })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: hp(2),
                }}>
                <Text
                  style={{
                    color: '#731EE2',
                    fontFamily: fontFamily.poppins600,
                    fontSize: fontSize(15),
                    textAlign: 'center',
                  }}>
                  Book Now
                </Text>

                <Image
                  source={icons.back_Arrow_Icon}
                  style={{
                    position: 'absolute',
                    right: 0,
                    width: hp(14),
                    height: hp(14),
                    resizeMode: 'contain',
                    transform: [{rotate: '180deg'}],
                    tintColor: '#731EE2',
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: hp(18),
          marginBottom: hp(16),
          borderWidth: 1,
          borderColor: '#E8E8E8',
          overflow: 'hidden',
        }}>
        {/* Image */}
        <View style={{position: 'relative'}}>
          <Image
            source={{uri: item.image}}
            style={{
              width: '100%',
              height: hp(140),
              resizeMode: 'cover',
            }}
          />

          {/* Rating */}
          <View
            style={{
              position: 'absolute',
              top: hp(10),
              left: wp(12),
              backgroundColor: 'rgba(28, 28, 28, 0.85)',
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
                marginRight: wp(8),
              }}
            />

            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(11),
                fontFamily: fontFamily.poppins600,
              }}>
              {item.rating}
            </Text>
          </View>

          {/* Status Pill (Offline Only when isAvailable is false) */}
          {!isAvailable && (
            <View
              style={{
                position: 'absolute',
                top: hp(10),
                right: wp(12),
                backgroundColor: '#FEE2E2',
                borderRadius: hp(50),
                paddingHorizontal: wp(14),
                paddingVertical: hp(5),
              }}>
              <Text
                style={{
                  color: '#DC2626',
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins600,
                }}>
                Vendor is offline
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{padding: wp(16)}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: fontFamily.poppins600,
                fontSize: fontSize(18),
                color: colors.pureBlack,
              }}>
              {item.name}
            </Text>

            <Image
              source={icons.verified_Icon}
              style={{
                width: hp(16),
                height: hp(16),
                resizeMode: 'contain',
                marginLeft: wp(8),
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginTop: hp(4),
            }}>
            <Text
              style={{
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                color: '#4A4A4A',
              }}>
              Visiting Charge{' '}
              <Text
                style={{
                  fontFamily: fontFamily.poppins600,
                  color: '#731EE2',
                }}>
                {item.price?.startsWith('Rs.')
                  ? item.price
                  : `Rs. ${item.price}`}
              </Text>
            </Text>
          </View>

          <View
            style={{
              width: '100%',
              height: hp(1),
              backgroundColor: '#E6E6E6',
              marginTop: hp(14),
              marginBottom: hp(12),
            }}
          />

          {!isAvailable ? (
            <>
              {/* Distance Row */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: hp(14),
                }}>
                <Image
                  source={icons.clock_Icon || icons.location_Icon}
                  style={{
                    width: hp(14),
                    height: hp(14),
                    tintColor: '#6B7280',
                    resizeMode: 'contain',
                    marginRight: wp(6),
                  }}
                />
                <Text
                  style={{
                    fontSize: fontSize(13),
                    fontFamily: fontFamily.poppins500,
                    color: '#6B7280',
                  }}>
                  {item.distance || '1.2km Away'}
                </Text>
              </View>

              {/* Notify Me Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  Alert.alert(
                    'Notification Set',
                    `We will notify you when ${item.name} becomes available.`,
                  )
                }
                style={{
                  width: '100%',
                  height: hp(44),
                  backgroundColor: '#FAF5FF',
                  borderRadius: hp(50),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.notification_Bell_Icon}
                  style={{
                    width: hp(16),
                    height: hp(16),
                    tintColor: '#731EE2',
                    resizeMode: 'contain',
                    marginRight: wp(8),
                  }}
                />
                <Text
                  style={{
                    color: '#731EE2',
                    fontFamily: fontFamily.poppins600,
                    fontSize: fontSize(14),
                  }}>
                  Notify Me When Available
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Image
                  source={icons.location_Icon}
                  style={{width: hp(11), height: hp(13), resizeMode: 'contain'}}
                />
                <Text
                  style={{
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins500,
                    color: '#757575',
                    marginLeft: wp(6),
                  }}>
                  {item.distance}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() =>
                  navigation.navigate('PreBookingServiceScreen', {
                    vendorUserId:
                      item._id || item.rawItem?._id || item.id || item.userId,
                    item: item.rawItem || item,
                    vendor: item.rawItem || item,
                  })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#731EE2',
                    fontFamily: fontFamily.poppins600,
                    fontSize: fontSize(14),
                    marginRight: wp(6),
                  }}>
                  Book Appointment
                </Text>
                <Image
                  source={icons.back_Arrow_Icon}
                  style={{
                    width: hp(12),
                    height: hp(12),
                    resizeMode: 'contain',
                    transform: [{rotate: '180deg'}],
                    tintColor: '#731EE2',
                  }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* LOCATION & SEARCH */}
      <View style={{marginHorizontal: wp(18), marginTop: hp(10)}}>
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

      {/* SEARCH BAR & FILTER BUTTON */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: wp(18),
          justifyContent: 'space-between',
          marginBottom: hp(10),
          marginTop: hp(10),
        }}>
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
            width: '85%',
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

        {/* FILTER BUTTON */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => refRBSheet.current?.open()}
          style={{
            width: hp(40),
            height: hp(40),
            borderWidth: 1,
            borderRadius: hp(50),
            borderColor: appliedFilter ? '#731EE2' : '#E1E1E1',
            backgroundColor: appliedFilter ? '#FCFAFF' : '#F9FAFB',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={icons.filter_Icon}
            style={{
              width: hp(16),
              height: hp(16),
              resizeMode: 'contain',
              tintColor: appliedFilter ? '#731EE2' : undefined,
            }}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.pureBlack}
          style={{marginTop: hp(270)}}
        />
      ) : (
        <FlatList
          data={dataToDisplay}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View
                style={{
                  paddingVertical: hp(16),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size="small" color={colors.pureBlack} />
                <Text
                  style={{
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                    color: '#8E8E93',
                    marginTop: hp(4),
                  }}>
                  Loading more services...
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: hp(250),
              }}>
              <Image
                source={icons.search_Icon}
                style={{
                  width: hp(36),
                  height: hp(36),
                  tintColor: '#C7C7C7',
                  marginBottom: hp(12),
                }}
              />
              <Text
                style={{
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins500,
                  color: '#8E8E93',
                }}>
                No services available in this category
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: wp(18),
            marginTop: hp(20),
            paddingBottom: hp(40),
          }}
        />
      )}

      {/* SELECT FILTER RBSHEET BOTTOM SHEET */}
      <RBSheet
        ref={refRBSheet}
        height={hp(380)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            paddingHorizontal: wp(20),
            paddingTop: hp(20),
            paddingBottom: hp(24),
            backgroundColor: colors.white,
          },
        }}>
        {/* Title */}
        <Text
          style={{
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins500,
            color: colors.pureBlack,
            marginBottom: hp(16),
          }}>
          Select Filter
        </Text>

        {/* Filter Option Items */}
        {filterOptions.map(opt => {
          const isSelected = selectedFilter === opt;
          return (
            <TouchableOpacity
              key={opt}
              activeOpacity={0.8}
              onPress={() => setSelectedFilter(isSelected ? null : opt)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isSelected ? '#731EE20A' : '#F6F6F6',
                borderWidth: isSelected ? hp(1) : 0,
                borderColor: isSelected ? '#731EE259' : 'transparent',
                borderRadius: hp(50),
                paddingVertical: hp(10),
                paddingHorizontal: wp(18),
                marginBottom: hp(12),
              }}>
              <Text
                style={{
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  color: isSelected ? '#6A40A0' : colors.pureBlack,
                }}>
                {opt}
              </Text>

              {/* Action Checkmark / Plus Icon */}
              <View
                style={{
                  width: hp(24),
                  height: hp(24),
                  borderRadius: hp(12),
                  backgroundColor: isSelected ? '#7A51AF' : 'transparent',
                  borderWidth: isSelected ? 0 : 1.5,
                  borderColor: isSelected ? 'transparent' : '#4A4A4A',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {isSelected ? (
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: fontSize(13),
                      fontWeight: '700',
                      top: -1,
                    }}>
                    ✓
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: '#4A4A4A',
                      fontSize: fontSize(15),
                      fontWeight: '600',
                      top: -1,
                    }}>
                    +
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Apply Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setAppliedFilter(selectedFilter);
            refRBSheet.current?.close();
          }}
          style={{
            width: '100%',
            height: hp(52),
            backgroundColor: '#731EE2',
            borderRadius: hp(50),
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp(12),
          }}>
          <Text
            style={{
              color: colors.white,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              textAlign: 'center',
            }}>
            Apply
          </Text>
        </TouchableOpacity>
      </RBSheet>
    </SafeAreaView>
  );
};

export default BookingServiceScreen;
