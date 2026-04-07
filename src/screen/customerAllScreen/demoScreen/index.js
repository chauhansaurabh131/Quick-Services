import React from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {fontFamily, fontSize, hp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {colors} from '../../../utils/colors';

import {useNavigation} from '@react-navigation/native';

const DemoScreen = ({route}) => {
  const navigation = useNavigation();
  const isCaptureDone = route.params?.isCaptureDone;

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
            // borderColor: isCaptureDone ? colors.primaryColor : '#D6D6D6',
            // borderStyle: isCaptureDone ? 'solid' : 'dashed',

            borderColor: '#D6D6D6',
            borderStyle: 'dashed',
            borderRadius: hp(18),
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: isCaptureDone ? '#F0FFF0' : '#FAFAFA',
            backgroundColor: '#FAFAFA',
            marginTop: hp(32),
            overflow: 'hidden', // 🔥 important for image
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
              color: isCaptureDone ? colors.pureBlack : colors.pureBlack,
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
    </SafeAreaView>
  );
};

export default DemoScreen;
