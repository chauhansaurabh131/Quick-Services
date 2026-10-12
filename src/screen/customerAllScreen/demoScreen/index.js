import React, {useEffect, useRef, useState} from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {colors} from '../../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';

const DemoScreen = ({route}) => {
  const navigation = useNavigation();
  const isCaptureDone = route.params?.isCaptureDone;
  const visitingFee =
    route.params?.visitingFee || route.params?.totalPayable || 300;

  const refRBSheet = useRef();
  const [timerSeconds, setTimerSeconds] = useState(60);

  useEffect(() => {
    refRBSheet.current?.open();

    setTimerSeconds(60);
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimer = secs => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(
      2,
      '0',
    )}`;
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{paddingHorizontal: 18}}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => navigation.navigate('FaceCaptureScreen')}
          style={{
            height: hp(176),
            width: '100%',
            borderWidth: hp(1),
            borderColor: '#D6D6D6',
            borderStyle: 'dashed',
            borderRadius: hp(18),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FAFAFA',
            marginTop: hp(32),
            overflow: 'hidden',
          }}>
          <Image
            source={isCaptureDone ? icons.verified_Icon : icons.face_video_Icon}
            style={{
              width: hp(65),
              height: hp(65),
              resizeMode: 'contain',
              tintColor: isCaptureDone ? colors.primaryColor : undefined,
            }}
          />
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(19),
            }}>
            {isCaptureDone ? '5 Sec Clip Done' : '5 sec Clip'}
          </Text>
        </TouchableOpacity>

        <View style={{flexDirection: 'row', marginTop: hp(50)}}>
          {isCaptureDone && (
            <Image
              source={icons.call_Icon}
              style={{width: 20, height: 20, marginRight: 20}}
            />
          )}
          <Text style={{color: 'black'}}>Hold camera at eye level</Text>
        </View>
      </View>

      {/* Bottom Sheet Modal for Request Confirmation */}
      <RBSheet
        ref={refRBSheet}
        height={hp(330)}
        openDuration={250}
        closeOnPressMask={true}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            paddingHorizontal: wp(20),
            paddingTop: hp(24),
            paddingBottom: hp(20),
            alignItems: 'center',
            backgroundColor: colors.white,
          },
        }}>
        {/* Timer Circle */}
        <View
          style={{
            width: hp(80),
            height: hp(80),
            borderRadius: hp(40),
            backgroundColor: '#F3E8FF',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryColor || '#731EE2',
              fontSize: fontSize(18),
              fontFamily: fontFamily.poppins700,
            }}>
            {formatTimer(timerSeconds)}
          </Text>
        </View>

        {/* Request Sent Title */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(18),
            fontFamily: fontFamily.poppins700,
            textAlign: 'center',
            marginTop: hp(20),
          }}>
          Request Sent
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            color: '#333333',
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
            textAlign: 'center',
            marginTop: hp(6),
          }}>
          Please wait for confirmation.
        </Text>

        {/* Pay Visiting Fees Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            // Fee payment handler action
          }}
          style={{
            width: '100%',
            height: hp(50),
            borderRadius: hp(30),
            backgroundColor: colors.primaryColor || '#731EE2',
            marginTop: hp(24),
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: colors.white,
              fontSize: fontSize(15),
              fontFamily: fontFamily.poppins500,
            }}>
            Pay Visiting Fees :{' '}
            <Text
              style={{
                fontFamily: fontFamily.poppins700,
                color: colors.white,
              }}>
              Rs.{visitingFee}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Cancel Request Link */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => refRBSheet.current?.close()}
          style={{
            marginTop: hp(16),
            paddingVertical: hp(6),
            alignSelf: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryColor || '#731EE2',
              fontSize: fontSize(15),
              fontFamily: fontFamily.poppins500,
            }}>
            Cancel Request
          </Text>
        </TouchableOpacity>
      </RBSheet>
    </SafeAreaView>
  );
};

export default DemoScreen;
