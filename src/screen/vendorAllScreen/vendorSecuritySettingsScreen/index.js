import React, {useState} from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import SwitchButton from '../../../components/switchButton';

const VendorSecuritySettingsScreen = () => {
  const navigation = useNavigation();

  const [authentication, setAuthentication] = useState(false);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
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
          Security Settings
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

      <View style={{marginHorizontal: wp(18)}}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            marginTop: hp(26),
          }}>
          Account Security
        </Text>

        <TouchableOpacity
          onPress={() => {
            // navigation.navigate('VendorSecuritySettingsScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(27),
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
              Change Mobile Number
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

        <View
          onPress={() => {
            // navigation.navigate('VendorSecuritySettingsScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(27),
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
              Two-Factor Authentication
            </Text>
          </View>

          <SwitchButton
            value={authentication}
            onChange={v => setAuthentication(v)}
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            // navigation.navigate('VendorSecuritySettingsScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(27),
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
              Manage Trusted Device
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

        <Text
          style={{
            color: colors.pureBlack,
            marginTop: hp(35),
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
          }}>
          Login Activity
        </Text>

        <TouchableOpacity
          onPress={() => {
            // navigation.navigate('VendorSecuritySettingsScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(27),
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

            <View>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins500,
                  marginLeft: wp(18),
                  top: 5,
                }}>
                Surat, Gujarat
              </Text>
              <Text
                style={{
                  color: '#BBBBBB',
                  marginLeft: wp(18),
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                }}>
                iPhone 15 Pro Active Now
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            // navigation.navigate('VendorSecuritySettingsScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(27),
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

            <View>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins500,
                  marginLeft: wp(18),
                  top: 5,
                }}>
                Gandhinagar, Gujarat
              </Text>
              <Text
                style={{
                  color: '#BBBBBB',
                  marginLeft: wp(18),
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                }}>
                iPhone 15 Pro Active Now
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{position: 'absolute', bottom: 0, width: '100%'}}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={{
            backgroundColor: '#FCF2F2',
            width: '90%',
            height: hp(50),
            borderRadius: hp(50),
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#D61616',
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins500,
            }}>
            Deactivate Account
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            textAlign: 'center',
            marginTop: hp(26),
            marginBottom: hp(34),
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
          }}>
          Deactivating your account will temporarily disable your{'\n'}vendor
          profile and service.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default VendorSecuritySettingsScreen;
