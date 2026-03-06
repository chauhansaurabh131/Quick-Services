import React from 'react';
import {SafeAreaView, View, Text, TextInput, Image} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {colors} from '../../../utils/colors';

const DemoScreen = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{marginTop: hp(100), marginHorizontal: wp(17)}}>
        <View
          style={{
            width: '100%',
            height: hp(50),
            borderWidth: 1.5,
            borderColor: '#DDDDDD',
            borderRadius: wp(40),
            backgroundColor: 'white',
            flexDirection: 'row',
          }}>
          <View
            style={{
              backgroundColor: '#F9F9F9',
              flexDirection: 'row',
              width: '20%',
              alignItems: 'center',
              borderTopLeftRadius: 30,
              borderBottomLeftRadius: 30,
              left: 0.5,
              justifyContent: 'space-around',
              paddingHorizontal: wp(3),
            }}>
            <Text
              style={{
                color: 'black',
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              +91
            </Text>

            <Image
              source={icons.bottom_Arrow_Icon}
              style={{width: wp(9), height: hp(6), resizeMode: 'contain'}}
            />
          </View>
          <View
            style={{height: '100%', width: wp(1), backgroundColor: '#DDDDDD'}}
          />

          <TextInput
            placeholder="Enter Your Mobile Number"
            placeholderTextColor="#555"
            keyboardType="phone-pad"
            style={{
              flex: 1,
              fontSize: fontSize(14),
              color: colors.pureBlack,
              paddingHorizontal: wp(17),
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DemoScreen;
