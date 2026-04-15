import React from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';

const data = [
  {day: 'Mon', value: 30},
  {day: 'Tue', value: 40},
  {day: 'Wed', value: 35},
  {day: 'Thu', value: 80},
  {day: 'Fri', value: 100},
  {day: 'Sat', value: 50},
];

const jobHistoryData = [
  {
    id: '1',
    name: 'Star Salon',
    service: 'Hair Cut',
    date: '1 Oct 2026',
    price: 'Rs. 120.00',
    rating: 4.4,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Star Salon',
    service: 'Hair Cut',
    date: '1 Oct 2026',
    price: 'Rs. 120.00',
    rating: 4.5,
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
];

const EarningsScreen = () => {
  const navigation = useNavigation();
  const maxValue = Math.max(...data.map(item => item.value));

  const renderJobItem = ({item}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: hp(5),
          paddingVertical: hp(12), // ✅ important
        }}>
        {/* Left Section */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {/* Image (URL) */}
          <Image
            source={{uri: item.image}}
            style={{
              width: hp(40),
              height: hp(40),
              borderRadius: hp(20),
            }}
          />

          {/* Text */}
          <View style={{marginLeft: wp(12)}}>
            <Text
              style={{
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
                color: colors.pureBlack,
              }}>
              {item.name}
            </Text>

            <Text
              style={{
                fontSize: fontSize(12),
                color: '#B4B4B4',
                // marginTop: 2,
                fontFamily: fontFamily.poppins500,
              }}>
              {item.service} • {item.date}
            </Text>
          </View>
        </View>

        {/* Right Section */}
        <View style={{alignItems: 'flex-end'}}>
          <Text
            style={{
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins500,
              color: colors.pureBlack,
            }}>
            {item.price}
          </Text>

          <Text
            style={{
              fontSize: fontSize(12),
              color: '#FFA500',
              // marginTop: 2,
              fontFamily: fontFamily.poppins500,
            }}>
            ⭐ {item.rating}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* Header */}
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
          Earnings & History
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          // paddingHorizontal: wp(18),
          paddingBottom: hp(40),
        }}>
        <View style={{marginHorizontal: wp(18), marginTop: hp(27)}}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
            }}>
            Today’s Earnings
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: hp(27),
            }}>
            <View
              style={{
                // width: wp(162),
                width: '48%',
                height: hp(96),
                borderRadius: hp(18),
                backgroundColor: '#F8F4FF',
              }}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  marginTop: hp(17),
                  marginLeft: wp(23),
                }}>
                Today’s Earning
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(22),
                  fontFamily: fontFamily.poppins600,
                  marginLeft: wp(23),
                }}>
                Rs. 450.00
              </Text>
            </View>

            <View
              style={{
                // width: wp(162),
                width: '48%',
                height: hp(96),
                borderRadius: hp(18),
                backgroundColor: '#F8F4FF',
              }}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  marginTop: hp(17),
                  marginLeft: wp(27),
                }}>
                Jobs Completed
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(22),
                  fontFamily: fontFamily.poppins600,
                  marginLeft: wp(27),
                }}>
                09
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: colors.pureBlack,
              marginTop: hp(17),
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
            }}>
            Weekly Earnings
          </Text>

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(30),
                fontFamily: fontFamily.poppins500,
              }}>
              Rs. 450.00
            </Text>
            <Text
              style={{
                color: '#139950',
                fontSize: fontSize(12),
                fontFamily: fontFamily.poppins400,
                marginLeft: wp(10),
                top: hp(1),
              }}>
              +12% vs last week
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: hp(30),
              paddingHorizontal: wp(10),
              height: hp(120),
            }}>
            {data.map((item, index) => {
              const isActive = item.day === 'Thu' || item.day === 'Fri';

              // 🔥 Fixed heights (like design, not dynamic)
              const heights = {
                Mon: hp(30),
                Tue: hp(60),
                Wed: hp(35),
                Thu: hp(90),
                Fri: hp(110),
                Sat: hp(55),
              };

              return (
                <View key={index} style={{alignItems: 'center'}}>
                  {/* Bar */}
                  <View
                    style={{
                      width: wp(48),
                      height: heights[item.day], // 🔥 fixed design height
                      backgroundColor: isActive ? '#731EE2' : '#F6F0FF',

                      // 🔥 IMPORTANT (only top rounded)
                      borderTopLeftRadius: hp(18),
                      borderTopRightRadius: hp(18),
                    }}
                  />

                  {/* Label */}
                  <Text
                    style={{
                      marginTop: hp(8),
                      fontSize: fontSize(10),
                      fontFamily: fontFamily.poppins400,
                      color: colors.pureBlack,
                    }}>
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(30),
            }}>
            Weekly Earnings
          </Text>

          <View
            style={{
              width: '100%',
              height: hp(96),
              backgroundColor: '#F8F8F8',
              borderRadius: hp(18),
              marginTop: hp(18),
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: wp(23),
                paddingVertical: hp(25),
              }}>
              <View>
                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Current Balance
                </Text>

                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(22),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  Rs. 2400.00
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                style={{
                  width: wp(111),
                  height: hp(40),
                  backgroundColor: colors.primaryColor,
                  borderRadius: hp(50),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Withdraw
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
              Job History
            </Text>

            <TouchableOpacity>
              <Text
                style={{
                  color: colors.primaryColor,
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins600,
                }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          <View
            style={{
              marginTop: hp(12),
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: '#E5E5E5',
            }}>
            <FlatList
              data={jobHistoryData}
              keyExtractor={item => item.id}
              renderItem={renderJobItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#E5E5E5',
                    width: '100%', // ✅ FULL WIDTH
                  }}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EarningsScreen;
