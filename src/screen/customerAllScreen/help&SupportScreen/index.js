import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const DATA = [
    {id: 1, key: 'bookingIssues', screen: 'BookingIssueScreen'},
    {id: 2, key: 'paymentRefunds', screen: 'BookingIssueScreen'},
    {id: 3, key: 'providerFeedback', screen: 'BookingIssueScreen'},
    {id: 4, key: 'accountAccess', screen: 'BookingIssueScreen'},
  ];

  const FAQ_DATA = [
    {id: 1, q: 'faq1_question', a: 'faq1_answer'},
    {id: 2, q: 'faq2_question', a: 'faq2_answer'},
    {id: 3, q: 'faq3_question', a: 'faq3_answer'},
    {id: 4, q: 'faq4_question', a: 'faq4_answer'},
  ];

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* Header */}
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
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          {t('helpSupport')}
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#E3E3E3'}}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: wp(18),
            marginTop: hp(15),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
              borderRadius: hp(16),
              paddingHorizontal: wp(12),
              height: hp(50),
              borderWidth: 1,
              borderColor: '#E1E1E1',
            }}>
            {/* Search Icon */}
            <Image
              source={icons.search_Icon} // make sure you have search icon
              style={{
                width: hp(13),
                height: hp(13),
                tintColor: '#93A0B4',
                resizeMode: 'contain',
              }}
            />

            {/* TextInput */}
            <TextInput
              placeholder={t('howCanWeHelp')}
              placeholderTextColor="black"
              style={{
                flex: 1,
                marginLeft: wp(10),
                fontSize: fontSize(15),
                fontFamily: fontFamily.poppins400,
                color: colors.pureBlack,
                top: 3,
              }}
            />
          </View>
        </View>

        <View style={{marginHorizontal: wp(18), marginTop: hp(20)}}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
            {DATA.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.screen)}
                style={{
                  width: '48%', // ✅ responsive (important fix)
                  aspectRatio: 1.4, // ✅ keeps same height proportion
                  borderWidth: 1,
                  borderColor: '#E9E9E9',
                  backgroundColor: '#FAFAFA', // slight gray like design
                  borderRadius: hp(14),
                  marginBottom: hp(15),
                  padding: hp(15),
                  // alignItems: 'center',
                  // justifyContent: 'center', // ✅ center everything
                }}>
                {/* Icon Box */}
                <View
                  style={{
                    width: hp(40),
                    height: hp(40),
                    backgroundColor: '#F1F1F1',
                    borderRadius: hp(10),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: hp(10),
                  }}>
                  <Image
                    source={icons.black_Home_Icon}
                    style={{
                      width: hp(15),
                      height: hp(12),
                      resizeMode: 'contain',
                    }}
                  />
                </View>

                {/* Title */}
                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins600,
                    // textAlign: 'center',
                  }}>
                  {t(item.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text
          style={{
            color: colors.pureBlack,
            marginHorizontal: wp(18),
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
          }}>
          {t('faqTitle')}
        </Text>

        <View style={{marginHorizontal: wp(18), marginTop: hp(10)}}>
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <View key={index}>
                {/* Question Row */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setOpenIndex(isOpen ? null : index)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: hp(14),
                  }}>
                  <Text
                    style={{
                      flex: 1,
                      color: colors.pureBlack,
                      fontSize: fontSize(13),
                      fontFamily: fontFamily.poppins600,
                    }}>
                    {t(item.q)}
                  </Text>

                  <Image
                    source={icons.bottom_Arrow_Icon}
                    style={{
                      width: hp(9),
                      height: hp(6),
                      resizeMode: 'contain',
                      transform: [{rotate: isOpen ? '180deg' : '0deg'}],
                    }}
                  />
                </TouchableOpacity>

                {/* ✅ When OPEN → show answer + divider BELOW */}
                {isOpen ? (
                  <>
                    <Text
                      style={{
                        color: '#6B7280',
                        fontSize: fontSize(12),
                        fontFamily: fontFamily.poppins400,
                        marginBottom: hp(12),
                        lineHeight: hp(18),
                      }}>
                      {t(item.a)}
                    </Text>

                    {/* Divider AFTER answer */}
                    <View
                      style={{
                        height: 1,
                        backgroundColor: '#E5E5E5',
                      }}
                    />
                  </>
                ) : (
                  /* ✅ When CLOSED → only divider */
                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#E5E5E5',
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        <Text
          style={{
            color: '#828282',
            marginTop: hp(26),
            textAlign: 'center',
            fontSize: fontSize(12),
            fontFamily: fontFamily.poppins400,
          }}>
          {t('stillNeedHelp')}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginHorizontal: wp(18),
            marginTop: hp(22),
            marginBottom: hp(30),
          }}>
          {/* Chat Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              width: '48%',
              height: hp(66),
              borderRadius: hp(14),
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.primaryColor, // base color
            }}>
            {/* Gradient Effect */}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: hp(14),
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#7C3AED',
              }}
            />

            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('chatWith')}
            </Text>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('support')}
            </Text>
          </TouchableOpacity>

          {/* Call Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              width: '48%',
              height: hp(66),
              borderRadius: hp(14),
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#7C3AED',
              backgroundColor: colors.white,
            }}>
            <Text
              style={{
                color: '#7C3AED',
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('callUs')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;
