import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import SwitchButton from '../../../components/switchButton';

const VendorWorkingScreen = () => {
  const navigation = useNavigation();

  const [online, setOnline] = useState(false);

  const [schedule, setSchedule] = useState([
    {day: 'Monday', enabled: true},
    {day: 'Tuesday', enabled: true},
    {day: 'Wednesday', enabled: true},
    {day: 'Thursday', enabled: true},
    {day: 'Friday', enabled: true},
    {day: 'Saturday', enabled: true},
    {day: 'Sunday', enabled: true},
  ]);

  const toggleDay = index => {
    const updated = [...schedule];
    updated[index].enabled = !updated[index].enabled;
    setSchedule(updated);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* HEADER */}
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
            style={{width: hp(14), height: hp(14)}}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
          }}>
          Working Hours
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

      {/* 🔥 SCROLL */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(18),
          paddingBottom: hp(40),
        }}>
        {/* STORE STATUS */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            marginTop: hp(26),
          }}>
          Store Status
        </Text>

        <View
          style={{
            width: '100%',
            backgroundColor: '#FAFAFA',
            height: hp(76),
            borderRadius: hp(18),
            justifyContent: 'center',
            marginTop: hp(12),
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
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                  color: colors.pureBlack,
                }}>
                Status : {online ? 'Online' : 'Offline'}
              </Text>

              <Text
                style={{
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                }}>
                {online
                  ? 'Ready to accept booking'
                  : 'Currently not accepting bookings'}
              </Text>
            </View>

            <SwitchButton value={online} onChange={v => setOnline(v)} />
          </View>
        </View>

        {/* WEEKLY SCHEDULE */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            marginTop: hp(27),
            marginBottom: hp(10),
          }}>
          Weekly Schedule
        </Text>

        {schedule.map((item, index) => (
          <View
            key={index}
            style={{
              width: '100%',
              height: hp(80),
              borderWidth: hp(1),
              borderRadius: hp(18),
              borderColor: '#EAEAEA',
              paddingVertical: hp(18),
              paddingHorizontal: wp(21),
              marginBottom: hp(12),
              backgroundColor: '#fff',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  {item.day}
                </Text>

                <Text
                  style={{
                    color: colors.primaryColor,
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  09:00 AM - 06:00 PM
                </Text>
              </View>

              <SwitchButton
                value={item.enabled}
                onChange={() => toggleDay(index)}
              />
            </View>
          </View>
        ))}

        {/* SAVE BUTTON */}
        <TouchableOpacity
          activeOpacity={0.6}
          style={{
            width: '100%',
            height: hp(50),
            backgroundColor: colors.primaryColor,
            borderRadius: hp(50),
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: hp(27),
          }}>
          <Text
            style={{
              color: colors.white,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins500,
            }}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VendorWorkingScreen;
