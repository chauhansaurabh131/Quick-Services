import React from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../utils/helpers';
import {icons, images} from '../../assets';

const HomeScreenQuickBookComponent = () => {
  const quickServices = [
    {
      id: '1',
      name: 'Pest Control',
      price: 'From 120 - Express arrival',
      icon: icons.pest_Control_Icon,
    },
    {
      id: '2',
      name: 'Deep Cleaning',
      price: 'From 120 - Express arrival',
      icon: icons.cleaning_Icon,
    },
    {
      id: '3',
      name: 'AC Repair',
      price: 'From 120 - Express arrival',
      icon: icons.pest_Control_Icon,
    },
    {
      id: '4',
      name: 'Plumbing',
      price: 'From 120 - Express arrival',
      icon: icons.pest_Control_Icon,
    },
    {
      id: '5',
      name: 'Electrical',
      price: 'From 120 - Express arrival',
      icon: icons.electrical_Icon,
    },
  ];

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: wp(18),
          marginTop: hp(30),
        }}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(15),
            fontFamily: fontFamily.poppins600,
          }}>
          Quick Book
        </Text>

        <View
          style={{
            backgroundColor: '#FFF3F2',
            borderRadius: hp(50),
            marginLeft: 5,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 15,
            flexDirection: 'row',
          }}>
          <Image
            source={icons.quick_Book_Icon}
            style={{
              width: hp(5),
              height: hp(10),
              resizeMode: 'contain',
              marginRight: wp(10),
            }}
          />
          <Text
            style={{
              color: '#FF6654',
              fontSize: fontSize(10),
              fontFamily: fontFamily.poppins400,
            }}>
            20-25 Mins Delivery
          </Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.6} style={{marginHorizontal: wp(18)}}>
        <Image
          source={images.deep_Cleaning_Img}
          style={{
            width: '100%',
            height: hp(142),
            borderRadius: hp(10),
            marginTop: hp(18),
          }}
        />
      </TouchableOpacity>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={quickServices}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingLeft: wp(18), // ⭐ left space
          paddingRight: wp(6), // optional right space
        }}
        renderItem={({item}) => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              width: wp(223),
              height: hp(110),
              backgroundColor: '#F7F7F7',
              // backgroundColor: 'gray',
              borderRadius: hp(14),
              // padding: hp(14),
              marginRight: wp(12),
              marginTop: hp(13),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp(19),
                marginLeft: wp(16),
              }}>
              <View
                style={{
                  width: hp(39),
                  height: hp(39),
                  borderRadius: hp(50),
                  backgroundColor: colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={item.icon}
                  style={{
                    width: hp(16),
                    height: hp(18),
                    resizeMode: 'contain',
                  }}
                />
              </View>

              <View>
                <Text
                  style={{
                    marginLeft: wp(10),
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins600,
                    color: colors.pureBlack,
                  }}>
                  {item.name}
                </Text>
                <Text
                  style={{
                    marginLeft: wp(10),
                    fontSize: fontSize(10),
                    fontFamily: fontFamily.poppins400,
                    color: '#818181',
                  }}>
                  From 120 - Express arrival
                </Text>
              </View>
            </View>

            <View
              style={{
                marginHorizontal: wp(17),
                marginTop: hp(20),
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(10),
                  fontFamily: fontFamily.poppins600,
                }}>
                FASTEST NEAR YOU
              </Text>

              <Image
                source={icons.back_Arrow_Icon}
                style={{
                  width: hp(14),
                  height: hp(14),
                  resizeMode: 'contain',
                  transform: [{rotate: '180deg'}], // ⭐ rotate image
                  tintColor: '#FF6654',
                }}
              />
            </View>

            {/*<Text*/}
            {/*  style={{*/}
            {/*    marginTop: hp(4),*/}
            {/*    fontSize: fontSize(9),*/}
            {/*    color: '#8F8F8F',*/}
            {/*    fontFamily: fontFamily.poppins400,*/}
            {/*  }}>*/}
            {/*  {item.price}*/}
            {/*</Text>*/}

            {/*<Text*/}
            {/*  style={{*/}
            {/*    marginTop: hp(10),*/}
            {/*    fontSize: fontSize(10),*/}
            {/*    fontFamily: fontFamily.poppins600,*/}
            {/*  }}>*/}
            {/*  FASTEST NEAR YOU →*/}
            {/*</Text>*/}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};
export default HomeScreenQuickBookComponent;
