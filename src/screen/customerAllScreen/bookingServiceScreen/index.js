import React, {useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {colors} from '../../../utils/colors';
import {useNavigation} from '@react-navigation/native';

const BookingServiceScreen = () => {
  const {place, fullAddress} = useSelector(state => state.location);
  const [search, setSearch] = useState('');

  const navigation = useNavigation();

  const serviceList = [
    {
      id: '1',
      name: 'Star Unisex Saloon',
      service: 'Standard Hair Cut',
      price: 'Rs. 120',
      rating: '4.6',
      time: '20 mins',
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f',
    },
    {
      id: '2',
      name: 'Royal Hair Studio',
      service: 'Hair Styling',
      price: 'Rs. 180',
      rating: '4.7',
      time: '25 mins',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e',
    },
    {
      id: '3',
      name: 'Urban Salon',
      service: 'Hair Spa',
      price: 'Rs. 350',
      rating: '4.5',
      time: '30 mins',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
    },
  ];

  const renderItem = ({item}) => {
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

            {/*<Text*/}
            {/*  style={{*/}
            {/*    fontFamily: fontFamily.poppins600,*/}
            {/*    fontSize: fontSize(12),*/}
            {/*    color: 'black',*/}
            {/*  }}>*/}
            {/*  {item.price}*/}
            {/*</Text>*/}

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
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: fontFamily.poppins500,
                fontSize: fontSize(14),
                color: '#979797',
                marginTop: hp(3),
              }}>
              {item.service}
            </Text>

            <Text
              style={{
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
              }}>
              {item.price}
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
                source={icons.timer_Icon}
                style={{width: hp(12), height: hp(12), resizeMode: 'contain'}}
              />
              <Text
                style={{
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins500,
                  color: '#757575',
                  marginLeft: wp(11),
                  top: 1.5,
                }}>
                {item.time}
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
                onPress={() => navigation.navigate('BookingSummaryScreen')}>
                <Text
                  style={{
                    color: '#731EE2',
                    fontFamily: fontFamily.poppins600,
                    fontSize: fontSize(14),
                    marginRight: wp(7),
                    top: 1,
                  }}>
                  Book Now
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

      <FlatList
        data={serviceList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(18),
          marginTop: hp(20),
          paddingBottom: hp(40),
        }}
      />
    </SafeAreaView>
  );
};

export default BookingServiceScreen;
