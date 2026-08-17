import React, {useEffect, useState} from 'react';
import {
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
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {colors} from '../../../utils/colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getVendorServicesByCategory} from '../../../actions/customerAuthActions';

const BookingServiceScreen = ({route}) => {
  const dispatch = useDispatch();
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
    console.log(
      '==================================================',
      '\n[BookingServiceScreen Dispatching Redux Saga Action]',
      '\nAction: GET_VENDOR_SERVICES_BY_CATEGORY',
      `\nCategory ID: ${categoryId}`,
      `\nLongitude: ${lon}`,
      `\nLatitude: ${lat}`,
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

            if (Array.isArray(fetchedList)) {
              setVendorServicesList(fetchedList);
            }
          }
        },
      ),
    );
  }, [categoryId, lon, lat, dispatch]);

  useEffect(() => {
    if (Array.isArray(reduxVendorServices)) {
      setVendorServicesList(reduxVendorServices);
    }
  }, [reduxVendorServices]);

  const dataToDisplay = vendorServicesList.map((item, idx) => ({
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
          <View>
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
          </View>

          {/* Card Body */}
          <View
            style={{
              paddingHorizontal: wp(16),
              paddingTop: hp(14),
              paddingBottom: hp(12),
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
              Starting from {startingPrice}
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

            {/* Centered Book Now with Right Arrow */}
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
        <View>
          <Image
            source={{uri: item.image}}
            style={{
              width: '100%',
              height: hp(120),
              resizeMode: 'cover',
            }}
          />

          {/* Rating */}
          <View
            style={{
              position: 'absolute',
              top: hp(10),
              left: wp(12),
              backgroundColor: '#1C1C1C',
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
                top: -2,
              }}
            />

            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(11),
                fontFamily: fontFamily.poppins600,
                top: 2,
              }}>
              {item.rating}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={{padding: wp(14)}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: fontFamily.poppins600,
                fontSize: fontSize(19),
                color: colors.pureBlack,
              }}>
              {item.name}
            </Text>

            <Image
              source={icons.verified_Icon}
              style={{
                width: hp(15),
                height: hp(15),
                resizeMode: 'contain',
                marginLeft: wp(8),
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text
              style={{
                fontFamily: fontFamily.poppins500,
                fontSize: fontSize(13),
                color: '#979797',
                marginTop: hp(3),
              }}
            />

            <Text
              style={{
                fontSize: fontSize(13),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
              }}>
              Visiting Charge Rs. {item.price}
            </Text>
          </View>

          <View
            style={{
              width: '100%',
              height: hp(1),
              backgroundColor: '#E6E6E6',
              marginTop: hp(13),
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: hp(10),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
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
                  marginLeft: wp(11),
                  top: 1.5,
                }}>
                {item.distance || item.time}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() =>
                  navigation.navigate('PreBookingServiceScreen', {
                    vendorUserId:
                      item._id || item.rawItem?._id || item.id || item.userId,
                    item: item.rawItem || item,
                    vendor: item.rawItem || item,
                  })
                }>
                <Text
                  style={{
                    color: '#731EE2',
                    fontFamily: fontFamily.poppins600,
                    fontSize: fontSize(14),
                    marginRight: wp(7),
                    top: 1,
                  }}>
                  Book Appointment
                </Text>
              </TouchableOpacity>

              <Image
                source={icons.back_Arrow_Icon}
                style={{
                  width: hp(13),
                  height: hp(13),
                  resizeMode: 'contain',
                  transform: [{rotate: '180deg'}],
                  tintColor: '#731EE2',
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View style={{padding: wp(18)}}>
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

      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: wp(18),
          // backgroundColor: 'orange',
          justifyContent: 'space-between',
          marginBottom: hp(10),
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

            // marginTop: hp(20),
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

        <TouchableOpacity
          activeOpacity={0.6}
          style={{
            width: hp(40),
            height: hp(40),
            borderWidth: 1,
            borderRadius: hp(50),
            borderColor: '#E1E1E1',
            backgroundColor: '#F9FAFB',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={icons.filter_Icon}
            style={{width: hp(16), height: hp(16), resizeMode: 'contain'}}
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
    </SafeAreaView>
  );
};

export default BookingServiceScreen;
