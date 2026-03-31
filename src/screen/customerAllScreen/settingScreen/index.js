import React, {useRef, useState} from 'react';
import {
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
import {useTranslation} from 'react-i18next';
import RBSheet from 'react-native-raw-bottom-sheet';
import SwitchButton from '../../../components/switchButton';
import DeviceInfo from 'react-native-device-info';

const SettingScreen = () => {
  const navigation = useNavigation();

  const refRBSheet = useRef();
  const {t, i18n} = useTranslation();

  const [notification, setNotification] = useState(false);
  const [email, setEmail] = useState(false);

  const appVersion = DeviceInfo.getVersion();

  const selectLanguage = lang => {
    i18n.changeLanguage(lang);
    console.log(' === var ===> ', lang);
    refRBSheet.current.close();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View
        style={{
          height: hp(50),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* Back Arrow */}
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
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          {t('settings')}
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#E3E3E3'}}
      />

      <ScrollView>
        <View style={{marginHorizontal: wp(22), marginTop: hp(26)}}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
            }}>
            {t('accountSettings')}
          </Text>

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
                {t('editProfile')}
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
            onPress={() => refRBSheet.current.open()}
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
                {t('language')}
              </Text>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  color: colors.black,
                  marginRight: wp(20),
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                {i18n.language === 'hi'
                  ? 'हिन्दी'
                  : i18n.language === 'gu'
                  ? 'ગુજરાતી'
                  : 'English'}
              </Text>

              <Image
                source={icons.bottom_Arrow_Icon}
                style={{
                  width: hp(9),
                  height: hp(6),
                  resizeMode: 'contain',
                  transform: [{rotate: '-90deg'}],
                  top: -2,
                }}
              />
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(35),
            }}>
            {t('notification')}
          </Text>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
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
                {t('pushNotification')}
              </Text>
            </View>

            <SwitchButton
              value={notification}
              onChange={v => setNotification(v)}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
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
                {t('emailAlerts')}
              </Text>
            </View>

            <SwitchButton value={email} onChange={v => setEmail(v)} />
          </TouchableOpacity>

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(35),
            }}>
            {t('privacySecurity')}
          </Text>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
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
                {t('clearSearchHistory')}
              </Text>
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(35),
            }}>
            {t('about')}
          </Text>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
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
                {t('privacyPolicy')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
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
                {t('termsOfService')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
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
                {t('appVersion')}
              </Text>
            </View>

            <Text
              style={{
                color: colors.primaryColor,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
              }}>
              v{appVersion}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            style={{
              width: '100%',
              height: hp(50),
              backgroundColor: '#FCF2F2',
              borderRadius: hp(25),
              marginTop: hp(47),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: '#D61616',
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              {t('deactivateAccount')}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: '#808080',
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
              paddingVertical: hp(22),
              alignSelf: 'center',
            }}>
            BookMyService 2026
          </Text>
        </View>
      </ScrollView>

      <RBSheet
        ref={refRBSheet}
        height={hp(180)}
        openDuration={250}
        customStyles={{
          container: {
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}>
        <TouchableOpacity
          style={{paddingVertical: 15}}
          onPress={() => selectLanguage('en')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('english')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{paddingVertical: 15}}
          onPress={() => selectLanguage('hi')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('hindi')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{paddingVertical: 15}}
          onPress={() => selectLanguage('gu')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('gujarati')}
          </Text>
        </TouchableOpacity>
      </RBSheet>
    </SafeAreaView>
  );
};
export default SettingScreen;
