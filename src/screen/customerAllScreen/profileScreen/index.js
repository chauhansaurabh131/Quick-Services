import React, {useState} from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useTranslation} from 'react-i18next';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [profileImage, setProfileImage] = useState(null);

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled');
      } else if (response.assets) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <Text
        style={{
          color: colors.black,
          alignSelf: 'center',
          marginTop: hp(23),
          fontSize: fontSize(14),
          fontFamily: fontFamily.poppins400,
        }}>
        {t('profile')}
      </Text>

      <TouchableOpacity
        activeOpacity={0.6}
        onPress={openGallery}
        style={{
          width: hp(120),
          height: hp(120),
          borderRadius: hp(100),
          backgroundColor: '#F9F9F9',
          justifyContent: 'center',
          alignSelf: 'center',
          marginTop: hp(33),
          alignItems: 'center',
          overflow: 'hidden',
        }}>
        {profileImage ? (
          <Image
            source={{uri: profileImage}}
            style={{width: '100%', height: '100%', borderRadius: hp(100)}}
          />
        ) : (
          <Image
            source={icons.camera_Icon}
            style={{width: wp(28), height: hp(26), resizeMode: 'contain'}}
          />
        )}
      </TouchableOpacity>

      <Text
        style={{
          color: colors.pureBlack,
          alignSelf: 'center',
          marginTop: hp(22),
          fontSize: fontSize(24),
          fontFamily: fontFamily.poppins600,
        }}>
        Rahul Sharma
      </Text>

      <View
        style={{
          marginHorizontal: wp(25),
          marginTop: hp(40),
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('MyBookingScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={{
                width: hp(29),
                height: hp(29),
                borderRadius: hp(50),
                backgroundColor: '#F6F0FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={icons.list_Icon}
                style={{width: hp(11), height: hp(12), resizeMode: 'contain'}}
              />
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
                marginLeft: wp(18),
              }}>
              {t('myBookings')}
            </Text>
          </View>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(9),
              height: hp(6),
              resizeMode: 'contain',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(25),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={{
                width: hp(29),
                height: hp(29),
                borderRadius: hp(50),
                backgroundColor: '#F6F0FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={icons.list_Icon}
                style={{width: hp(11), height: hp(12), resizeMode: 'contain'}}
              />
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
                marginLeft: wp(18),
              }}>
              {t('paymentMethod')}
            </Text>
          </View>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(9),
              height: hp(6),
              resizeMode: 'contain',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ManageAddressesScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(25),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={{
                width: hp(29),
                height: hp(29),
                borderRadius: hp(50),
                backgroundColor: '#F6F0FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={icons.list_Icon}
                style={{width: hp(11), height: hp(12), resizeMode: 'contain'}}
              />
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
                marginLeft: wp(18),
              }}>
              {t('manageAddresses')}
            </Text>
          </View>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(9),
              height: hp(6),
              resizeMode: 'contain',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(25),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={{
                width: hp(29),
                height: hp(29),
                borderRadius: hp(50),
                backgroundColor: '#F6F0FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={icons.list_Icon}
                style={{width: hp(11), height: hp(12), resizeMode: 'contain'}}
              />
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
                marginLeft: wp(18),
              }}>
              {t('referEarn')}
            </Text>
          </View>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(9),
              height: hp(6),
              resizeMode: 'contain',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('HelpSupportScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(25),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={{
                width: hp(29),
                height: hp(29),
                borderRadius: hp(50),
                backgroundColor: '#F6F0FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={icons.list_Icon}
                style={{width: hp(11), height: hp(12), resizeMode: 'contain'}}
              />
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
                marginLeft: wp(18),
              }}>
              {t('helpSupport')}
            </Text>
          </View>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(9),
              height: hp(6),
              resizeMode: 'contain',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SettingScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(25),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={{
                width: hp(29),
                height: hp(29),
                borderRadius: hp(50),
                backgroundColor: '#F6F0FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={icons.list_Icon}
                style={{width: hp(11), height: hp(12), resizeMode: 'contain'}}
              />
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
                marginLeft: wp(18),
              }}>
              {t('settings')}
            </Text>
          </View>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(9),
              height: hp(6),
              resizeMode: 'contain',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Login');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(25),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={{
                width: hp(29),
                height: hp(29),
                borderRadius: hp(50),
                backgroundColor: '#FFDEDE',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={icons.logout_Icon}
                style={{width: hp(11), height: hp(12), resizeMode: 'contain'}}
              />
            </View>

            <Text
              style={{
                color: colors.red,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
                marginLeft: wp(18),
              }}>
              {t('logout')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
export default ProfileScreen;
