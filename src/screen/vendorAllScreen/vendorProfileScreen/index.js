import React from 'react';
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
import {icons, images} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

const VendorProfileScreen = () => {
  const navigation = useNavigation();

  const appVersion = DeviceInfo.getVersion();

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
          Profile
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{paddingBottom: hp(200)}}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
          }}
          style={{
            width: hp(120),
            height: hp(120),
            resizeMode: 'cover',
            borderRadius: hp(100),
            alignSelf: 'center',
            marginTop: hp(20),
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: hp(35),
          }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(24),
              fontFamily: fontFamily.poppins600,
            }}>
            Star Unisex Salon
          </Text>
          <Image
            source={icons.verified_Icon}
            style={{
              width: hp(16),
              height: hp(16),
              resizeMode: 'contain',
              marginLeft: wp(9),
              top: -2,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Image
            source={icons.star_Icon}
            style={{
              width: hp(13),
              height: hp(13),
              resizeMode: 'contain',
              top: -2,
              marginRight: wp(7),
            }}
          />
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}>
            4.6 (120 Reviews)
          </Text>
        </View>

        <View style={{marginHorizontal: wp(18)}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: hp(27),
            }}>
            <View
              style={{
                // width: wp(162),
                width: '48%',
                height: hp(96),
                borderRadius: hp(18),
                backgroundColor: '#F8F4FF',
              }}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  marginTop: hp(17),
                  marginLeft: wp(23),
                }}>
                Monthly Earnings
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(22),
                  fontFamily: fontFamily.poppins600,
                  marginLeft: wp(23),
                }}>
                Rs. 12.5K
              </Text>
            </View>

            <View
              style={{
                // width: wp(162),
                width: '48%',
                height: hp(96),
                borderRadius: hp(18),
                backgroundColor: '#F8F4FF',
              }}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  marginTop: hp(17),
                  marginLeft: wp(27),
                }}>
                Total Jobs
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(22),
                  fontFamily: fontFamily.poppins600,
                  marginLeft: wp(27),
                }}>
                12
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: '#A9A9A9',
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              marginTop: hp(37),
            }}>
            Business Settings
          </Text>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('MyBookingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(23),
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
                Business Information
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
              // navigation.navigate('MyBookingScreen');
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
                Manage Services & Pricing
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
              navigation.navigate('VendorWorkingScreen');
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
                Working Hours
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
              // navigation.navigate('MyBookingScreen');
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
                Bank & Payouts
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
              color: '#A9A9A9',
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              marginTop: hp(35),
            }}>
            Operation
          </Text>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('VendorReviewsFeedbackScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(23),
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
                Review & Feedback
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
                Support & FAQs
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
              navigation.navigate('VendorSecuritySettingsScreen');
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
                Security Settings
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
                Logout
              </Text>
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: '#737373',
              fontSize: fontSize(13),
              fontFamily: fontFamily.poppins400,
              marginTop: hp(41),
              alignSelf: 'center',
              marginBottom: hp(31),
            }}>
            v{appVersion} Build 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VendorProfileScreen;
