import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';

const reviewsData = [
  {
    id: '1',
    name: 'Rahul Bajaj',
    service: 'Hair Cut',
    time: '2 day ago',
    rating: 4.5,
    review:
      'Outstanding photography service! Captured every moment beautifully, and the USB storage option was a convenient bonus.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Amit Sharma',
    service: 'Hair Styling',
    time: '1 day ago',
    rating: 4.2,
    review: 'Very professional and quick service. Highly recommended!',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: '3',
    name: 'Rohit Singh',
    service: 'Beard Trim',
    time: '3 day ago',
    rating: 4.8,
    review: 'Loved the experience. Staff was very friendly.',
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    id: '4',
    name: 'Vikas Patel',
    service: 'Facial',
    time: '5 day ago',
    rating: 4.3,
    review: 'Clean place and good service quality.',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
];

const VendorReviewsFeedbackScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
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
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
          }}>
          Reviews & Feedback
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(18),
          paddingBottom: hp(40),
        }}>
        <View>
          <View
            style={{
              marginTop: wp(20),
              borderRadius: hp(18),
              borderWidth: hp(1),
              borderColor: '#EAEAEA',
              padding: wp(18),
            }}>
            {/* Rating Number */}
            <Text
              style={{
                fontSize: fontSize(34),
                fontFamily: fontFamily.poppins700,
                color: colors.pureBlack,
              }}>
              4.0
            </Text>

            {/* ⭐ Stars (Single Icon + tintColor) */}
            <View style={{flexDirection: 'row'}}>
              {[1, 2, 3, 4, 5].map((item, index) => (
                <Image
                  key={index}
                  source={icons.star_Icon} // ✅ same icon
                  style={{
                    width: hp(25),
                    height: hp(23),
                    marginRight: wp(22),
                    tintColor: item <= 4 ? '#F0AA07' : '#D1D1D1', // 🔥 color control
                    marginBottom: hp(20),
                  }}
                />
              ))}
            </View>

            {/* Rating Bars */}
            {[
              {star: 5, value: '12K', width: '90%'},
              {star: 4, value: '9.5K', width: '70%'},
              {star: 3, value: '4K', width: '40%'},
              {star: 2, value: '2.1K', width: '25%'},
              {star: 1, value: '1.2K', width: '15%'},
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: hp(10),
                }}>
                {/* Star Number */}
                <Text
                  style={{
                    width: wp(20),
                    fontSize: fontSize(10),
                    color: colors.pureBlack,
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {item.star}
                </Text>

                {/* Background Bar */}
                <View
                  style={{
                    flex: 1,
                    height: hp(7),
                    backgroundColor: '#FFF7E5',
                    borderRadius: hp(10),
                    marginHorizontal: wp(8),
                  }}>
                  {/* Filled Bar */}
                  <View
                    style={{
                      width: item.width,
                      height: '100%',
                      backgroundColor: '#F5A623',
                      borderRadius: hp(10),
                    }}
                  />
                </View>

                {/* Count */}
                <Text
                  style={{
                    width: wp(35),
                    fontSize: fontSize(10),
                    textAlign: 'right',
                    fontFamily: fontFamily.poppins400,
                    color: colors.pureBlack,
                  }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* 🔥 CUSTOMER REVIEWS HEADER */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: hp(30),
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
              }}>
              Customer Reviews
            </Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: fontSize(12),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins600,
                }}>
                Newest
              </Text>

              <TouchableOpacity
                style={{
                  width: hp(30),
                  height: hp(26),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.bottom_Arrow_Icon}
                  style={{width: wp(8), height: hp(5), resizeMode: 'contain'}}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 🔥 REVIEWS LIST */}
          {reviewsData.map(item => (
            <View
              key={item.id}
              style={{
                marginTop: hp(14),
                borderRadius: hp(18),
                borderWidth: hp(1),
                borderColor: '#EAEAEA',
                padding: wp(20),
                // paddingVertical: hp(18),
              }}>
              {/* Top */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={{uri: item.image}}
                  style={{
                    width: hp(34),
                    height: hp(34),
                    borderRadius: hp(50),
                  }}
                />

                <View style={{marginLeft: wp(12)}}>
                  <Text
                    style={{
                      fontSize: fontSize(15),
                      fontFamily: fontFamily.poppins500,
                      color: colors.pureBlack,
                      top: 5,
                    }}>
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      fontSize: fontSize(12),
                      color: '#B4B4B4',
                      fontFamily: fontFamily.poppins500,
                    }}>
                    {item.service} • {item.time}
                  </Text>
                </View>
              </View>

              {/* Review */}
              <Text
                style={{
                  marginTop: hp(14),
                  fontSize: fontSize(12),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins400,
                }}>
                {item.review}
              </Text>

              {/* Bottom */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: hp(20),
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={icons.star_Icon}
                    style={{
                      width: hp(14),
                      height: hp(14),
                      tintColor: '#F0AA07',
                      marginRight: wp(7),
                    }}
                  />
                  <Text
                    style={{
                      marginLeft: 5,
                      fontSize: fontSize(15),
                      color: colors.pureBlack,
                      fontFamily: fontFamily.poppins500,
                      top: 2,
                    }}>
                    {item.rating}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F5F5F5',
                    borderRadius: hp(25),
                    width: wp(119),
                    height: hp(40),
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={icons.reply_Icon}
                    style={{
                      width: hp(18),
                      height: hp(14),
                      marginRight: hp(17),
                      resizeMode: 'contain',
                    }}
                  />
                  <Text
                    style={{
                      fontSize: fontSize(16),
                      color: colors.pureBlack,
                      fontFamily: fontFamily.poppins500,
                    }}>
                    Reply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VendorReviewsFeedbackScreen;
