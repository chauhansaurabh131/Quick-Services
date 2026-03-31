import React from 'react';
import {View, Text, FlatList, Image, TouchableOpacity} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../../../utils/helpers';
import {colors} from '../../../../utils/colors';
import {icons, images} from '../../../../assets';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const bookings = [
  {
    id: '1',
    service: 'Hair Cut',
    salon: 'Star Unisex Salon',
    name: 'Raj Kushwaha',
    date: '01 Oct, 2026',
    time: '10 AM to 11 AM',
    price: 'Rs. 120.00',
    image: images.demo_User_Img,
  },
  {
    id: '2',
    service: 'Hair Styling',
    salon: 'Modern Salon',
    name: 'Amit Sharma',
    date: '03 Oct, 2026',
    time: '12 PM to 1 PM',
    price: 'Rs. 200.00',
    image: images.demo_User_Img,
  },
];

const ActiveBookings = () => {
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
              color: colors.primaryColor,
            }}>
            {t('onTheWay')}
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
            source={item.image}
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

        {/*/!* Divider *!/*/}
        {/*<View*/}
        {/*  style={{*/}
        {/*    height: 1,*/}
        {/*    backgroundColor: '#E7E7E7',*/}
        {/*    marginTop: hp(18),*/}
        {/*    // marginBottom: hp(20),*/}
        {/*  }}*/}
        {/*/>*/}

        {/* Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: hp(14),
          }}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={{
              flex: 1,
              height: hp(40),
              backgroundColor: '#F1EBFF',
              borderRadius: hp(20),
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: wp(8),
              flexDirection: 'row',
              width: wp(141),
            }}>
            <Image
              source={icons.call_Icon}
              style={{
                width: hp(13),
                height: hp(13),
                resizeMode: 'contain',
                top: 1,
                marginRight: wp(15),
              }}
            />
            <Text
              style={{
                color: colors.primaryColor,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins500,
              }}>
              {t('call')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            style={{
              flex: 1,
              height: hp(40),
              backgroundColor: '#F1EBFF',
              borderRadius: hp(20),
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: wp(8),
              flexDirection: 'row',
              width: wp(141),
            }}>
            <Image
              source={icons.message_Icon}
              style={{
                width: hp(15),
                height: hp(15),
                resizeMode: 'contain',
                top: 1,
                marginRight: wp(15),
              }}
            />

            <Text
              style={{
                color: colors.primaryColor,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins500,
              }}>
              {t('chat')}
            </Text>
          </TouchableOpacity>
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
            navigation.navigate('LiveTrackingScreen');
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

export default ActiveBookings;
