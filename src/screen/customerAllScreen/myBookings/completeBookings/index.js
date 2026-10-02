import React from 'react';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {colors} from '../../../../utils/colors';
import {icons, images} from '../../../../assets';
import {fontFamily, fontSize, hp, wp} from '../../../../utils/helpers';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const defaultBookings = [
  {
    id: '1',
    service: 'Home Deep Cleaning',
    salon: 'Sparkle Home Services',
    name: 'Ranjit Shah',
    date: '05 Oct, 2026',
    time: '9 AM to 11 AM',
    price: 'Rs. 850.00',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    service: 'AC Repair',
    salon: 'CoolFix Experts',
    name: 'Karan Verma',
    date: '07 Oct, 2026',
    time: '2 PM to 3 PM',
    price: 'Rs. 450.00',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: '3',
    service: 'Kitchen Plumbing',
    salon: 'Quick Plumbing Service',
    name: 'Amit Patel',
    date: '10 Oct, 2026',
    time: '11 AM to 12 PM',
    price: 'Rs. 300.00',
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
];

const CompleteBookings = ({
  bookingsList,
  fetching = false,
  loadingMore = false,
  onRefresh,
  onLoadMore,
}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const dataToDisplay =
    Array.isArray(bookingsList) && bookingsList.length > 0
      ? bookingsList
      : bookingsList
      ? []
      : defaultBookings;

  const monthsShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const getBookingTitle = item => {
    let title =
      item?.serviceName ||
      item?.serviceTitle ||
      item?.notes ||
      (Array.isArray(item?.serviceIds) && item.serviceIds.length > 0
        ? item.serviceIds[0]?.title ||
          item.serviceIds[0]?.name ||
          item.serviceIds[0]
        : null) ||
      item?.serviceId?.title ||
      item?.serviceId?.name ||
      item?.service ||
      'Service';
    if (typeof title === 'object' && title !== null) {
      title = title.title || title.name || 'Service';
    }
    let str = String(title || 'Service').trim();
    if (str.includes(',')) {
      str = str.split(',')[0].trim();
    }
    return str || 'Service';
  };

  const getSalonName = item => {
    return (
      item?.businessName ||
      item?.vendor?.businessName ||
      item?.vendorId?.businessName ||
      item?.vendorId?.name ||
      item?.vendorName ||
      item?.salon ||
      'Service Provider'
    );
  };

  const getVendorName = item => {
    return (
      item?.vendorName ||
      item?.vendor?.name ||
      item?.vendorId?.fullName ||
      item?.vendorId?.name ||
      item?.name ||
      'Service Professional'
    );
  };

  const getVendorImage = item => {
    const pic =
      item?.profilePic ||
      item?.profileImage ||
      item?.vendor?.profilePic ||
      item?.vendor?.profileImage ||
      item?.vendorId?.profilePic ||
      item?.vendorId?.profile_pic ||
      item?.image;
    if (typeof pic === 'string' && pic.startsWith('http')) {
      return {uri: pic};
    }
    if (typeof pic === 'object' && pic !== null && pic.uri) {
      return pic;
    }
    return images.demo_User_Img;
  };

  const getBookingDate = item => {
    const rawDate = item?.bookingDate || item?.date || item?.createdAt;
    if (!rawDate) {
      return item?.date || '05 Oct, 2026';
    }
    const str = String(rawDate).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      const monthName = monthsShort[parseInt(m, 10) - 1] || 'Oct';
      return `${parseInt(d, 10)} ${monthName}, ${y}`;
    }
    return str;
  };

  const getBookingTime = item => {
    return (
      item?.timeSlot || item?.appointmentTime || item?.time || '9 AM to 11 AM'
    );
  };

  const getBookingPrice = item => {
    const val =
      item?.totalAmount ?? item?.totalPayable ?? item?.price ?? '850.00';
    const str = String(val)
      .replace(/^Rs\.\s*/i, '')
      .replace(/^₹\s*/, '');
    const num = Number(str);
    const formatted = !isNaN(num) ? num.toFixed(2) : str;
    return `Rs. ${formatted}`;
  };

  const renderItem = ({item}) => {
    const title = getBookingTitle(item);
    const salon = getSalonName(item);
    const vendorName = getVendorName(item);
    const vendorImg = getVendorImage(item);
    const bookingDate = getBookingDate(item);
    const bookingTime = getBookingTime(item);
    const price = getBookingPrice(item);

    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: '#E5E5E5',
          borderRadius: hp(16),
          padding: hp(14),
          marginBottom: hp(15),
          backgroundColor: colors.white,
        }}>
        {/* Service */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              marginRight: wp(10),
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              color: colors.pureBlack,
            }}>
            {title}
          </Text>

          <Text
            style={{
              fontSize: fontSize(10),
              fontFamily: fontFamily.poppins600,
              color: '#4A85F6',
              letterSpacing: 0.5,
            }}>
            COMPLETED
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={{
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
              color: colors.black,
            }}>
            {salon}
          </Text>
          <Image
            source={icons.verified_Icon}
            style={{
              width: hp(11),
              height: hp(11),
              resizeMode: 'contain',
              marginLeft: wp(6),
              top: -1,
            }}
          />
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: '#E7E7E7',
            marginTop: hp(15),
            marginBottom: hp(20),
          }}
        />

        {/* Profile */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={vendorImg}
            style={{
              width: hp(44),
              height: hp(44),
              borderRadius: hp(10),
              marginRight: wp(15),
            }}
          />

          <View>
            <Text
              style={{
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
              }}>
              {vendorName}
            </Text>

            <Text
              style={{
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                color: '#8C8C8C',
              }}>
              Service Professional
            </Text>
          </View>
        </View>

        {/* Booking Info */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: hp(18),
          }}>
          <View>
            <Text
              style={{
                fontSize: fontSize(12),
                color: '#909090',
                fontFamily: fontFamily.poppins400,
              }}>
              {t('date')}
            </Text>
            <Text
              style={{
                fontSize: fontSize(12),
                color: colors.pureBlack,
                fontFamily: fontFamily.poppins600,
              }}>
              {bookingDate}
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: fontSize(12),
                color: '#909090',
                fontFamily: fontFamily.poppins400,
              }}>
              {t('time')}
            </Text>
            <Text
              style={{
                fontSize: fontSize(12),
                color: colors.pureBlack,
                fontFamily: fontFamily.poppins600,
              }}>
              {bookingTime}
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: fontSize(12),
                color: '#909090',
                fontFamily: fontFamily.poppins400,
              }}>
              {t('total')}
            </Text>
            <Text
              style={{
                fontSize: fontSize(12),
                color: colors.pureBlack,
                fontFamily: fontFamily.poppins600,
              }}>
              {price}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: '#E7E7E7',
            marginTop: hp(18),
            marginBottom: hp(18),
          }}
        />

        {/* View Details */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('DetailsScreen', {
              booking: {...item, status: 'completed'},
            });
          }}
          style={{
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryColor,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins600,
            }}>
            {t('viewDetails')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (fetching && dataToDisplay.length === 0) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator
          size="large"
          color={colors.primaryColor || '#731EE2'}
        />
      </View>
    );
  }

  if (!fetching && dataToDisplay.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: wp(20),
          marginTop: hp(60),
        }}>
        <Text
          style={{
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            color: colors.pureBlack,
            textAlign: 'center',
          }}>
          No Completed Bookings
        </Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, paddingHorizontal: wp(18)}}>
      <FlatList
        data={dataToDisplay}
        keyExtractor={(item, index) =>
          item._id || item.id || item.bookingId || String(index)
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: hp(30)}}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{paddingVertical: hp(15), alignItems: 'center'}}>
              <ActivityIndicator
                size="small"
                color={colors.primaryColor || '#731EE2'}
              />
            </View>
          ) : null
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={fetching}
              onRefresh={onRefresh}
              tintColor={colors.primaryColor}
            />
          ) : undefined
        }
      />
    </View>
  );
};

export default CompleteBookings;
