import React from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../../../utils/colors';
import {icons, images} from '../../../../assets';
import {fontFamily, fontSize, hp, wp} from '../../../../utils/helpers';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const bookings = [
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

const CompleteBookings = () => {
  const {t} = useTranslation();

  const navigation = useNavigation();

  const renderItem = ({item}) => {
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
          }}>
          <Text
            style={{
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              color: colors.pureBlack,
            }}>
            {item.service}
          </Text>

          <Text
            style={{
              fontSize: fontSize(10),
              fontFamily: fontFamily.poppins500,
              color: '#1E59E2',
            }}>
            {t('complete')}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={{
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
              color: colors.black,
              // marginTop: hp(3),
            }}>
            {item.salon}
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
            source={{uri: item.image}}
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
              {item.name}
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
              {item.date}
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
              {item.time}
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
              {item.price}
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
            navigation.navigate('ServiceCompletedScreen');
          }}
          style={{
            // marginTop: hp(12),
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

  return (
    <View style={{paddingHorizontal: wp(18)}}>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: hp(30)}}
      />
    </View>
  );
};

export default CompleteBookings;
