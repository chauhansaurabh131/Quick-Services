import React, {useState} from 'react';
import {Text, View, TouchableOpacity, FlatList, Image} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../utils/helpers';
import {icons, images} from '../../assets';
import {colors} from '../../utils/colors';

const VendorHomeBookingComponent = () => {
  const [selectedTab, setSelectedTab] = useState('new');

  const data = [
    {id: '1', title: 'Hair Cut', price: '$120.00'},
    {id: '2', title: 'Hair Cut', price: '$120.00'},
    {id: '3', title: 'Hair Cut', price: '$120.00'},
  ];

  const renderItem = ({item, index}) => {
    return (
      <View
        style={{
          marginTop: hp(14),
          borderRadius: 16,
          borderWidth: 1,
          // borderColor: index === 0 ? '#3B82F6' : '#E5D9FF', // 🔥 highlight first card
          borderColor: '#E7D4FF',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}>
        {/* Map Image */}
        <Image
          source={images.map_Img} // replace with your image
          style={{
            width: '100%',
            height: hp(107),
          }}
        />

        {/* Content */}
        <View style={{marginTop: hp(12), marginHorizontal: wp(17)}}>
          {/* Title */}
          <Text
            style={{
              fontSize: fontSize(19),
              fontFamily: fontFamily.poppins500,
              color: colors.pureBlack,
            }}>
            {item.title}
          </Text>

          {/* Address */}

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={icons.location_Icon}
              style={{
                width: hp(7),
                height: hp(10),
                resizeMode: 'contain',
                marginRight: wp(11),
              }}
            />
            <Text
              style={{
                fontSize: fontSize(12),
                fontFamily: fontFamily.poppins500,
                color: '#B4B4B4',
                // marginTop: 4,
              }}>
              Dumas Rd, Magdalla
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: hp(2),
            }}>
            <Image
              source={icons.profile_Icon}
              style={{
                width: hp(8),
                height: hp(8),
                resizeMode: 'contain',
                marginRight: wp(10),
                tintColor: colors.pureBlack,
              }}
            />
            <Text
              style={{
                fontSize: fontSize(12),
                fontFamily: fontFamily.poppins500,
                color: '#B4B4B4',
              }}>
              Rakesh Shukla
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{
              height: hp(1),
              backgroundColor: '#E6E6E6',
              marginVertical: hp(14),
            }}
          />

          {/* ETA / DATE + PRICE */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.primaryColor,
                fontSize: fontSize(15),
                fontFamily: fontFamily.poppins500,
              }}>
              {selectedTab === 'new'
                ? 'ETA : 20-25 Mins'
                : '2 Oct 2026 01:00 PM'}
            </Text>

            <Text
              style={{
                fontSize: fontSize(15),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
              }}>
              {item.price}
            </Text>
          </View>

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: hp(13),
              marginBottom: hp(18),
              justifyContent: 'space-between',
              flex: 1,
            }}>
            <TouchableOpacity
              activeOpacity={0.6}
              style={{
                backgroundColor: '#F6F6F6',
                width: '48%',
                height: hp(40),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: hp(50),
              }}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                Decline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              style={{
                backgroundColor: '#7B2FF7',
                borderRadius: hp(100),
                width: '48%',
                height: hp(40),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1, marginHorizontal: wp(16)}}>
      {/* 🔥 Tabs */}
      <View
        style={{
          marginTop: hp(14),
          backgroundColor: '#EDE7F6',
          borderRadius: hp(30),
          flexDirection: 'row',
          padding: wp(8),
        }}>
        <TouchableOpacity
          onPress={() => setSelectedTab('new')}
          style={{
            flex: 1,
            backgroundColor: selectedTab === 'new' ? '#7B2FF7' : 'transparent',
            paddingVertical: hp(8),
            borderRadius: hp(25),
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: selectedTab === 'new' ? '#fff' : '#7B2FF7',
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
            }}>
            New Requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('pending')}
          style={{
            flex: 1,
            backgroundColor:
              selectedTab === 'pending' ? '#7B2FF7' : 'transparent',
            paddingVertical: hp(8),
            borderRadius: hp(25),
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: selectedTab === 'pending' ? '#fff' : '#7B2FF7',
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
            }}>
            03 Pendings
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 List */}
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default VendorHomeBookingComponent;
