import React, {useState} from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import SwitchButton from '../../../components/switchButton';
import VendorHomeBookingComponent from '../../../components/vendorHomeBookingComponent';

const VendorHomeScreen = () => {
  const [online, setOnline] = useState(false);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View
        style={{
          height: hp(56),
          marginHorizontal: wp(18),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Image
          source={icons.doormigo_Icon}
          style={{width: wp(62), height: hp(18), resizeMode: 'contain'}}
        />

        <TouchableOpacity>
          <Image
            source={icons.notification_Bell_Icon}
            style={{width: hp(13), height: hp(16), resizeMode: 'contain'}}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#EEEEEE'}}
      />

      <View style={{marginHorizontal: wp(18), marginTop: hp(14)}}>
        <View
          style={{
            width: '100%',
            backgroundColor: '#FAFAFA',
            height: hp(76),
            borderRadius: hp(18),
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: wp(22),
            }}>
            <View>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                }}>
                Status : {online ? 'Online' : 'Offline'}
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                }}>
                {online
                  ? 'Ready to accept booking'
                  : 'Currently not accepting bookings'}
              </Text>
            </View>

            <View style={{top: 10}}>
              <SwitchButton value={online} onChange={v => setOnline(v)} />
            </View>
          </View>
        </View>
      </View>

      <View style={{flex: 1}}>
        <VendorHomeBookingComponent />
      </View>
    </SafeAreaView>
  );
};

export default VendorHomeScreen;
