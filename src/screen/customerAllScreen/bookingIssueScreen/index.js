import React from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

const BookingIssueScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

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
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
          }}>
          {t('bookingIssues')}
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

      {/* ✅ SCROLLABLE CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{paddingHorizontal: wp(18), paddingTop: hp(20)}}>
          {/* ===== QUESTION 1 ===== */}
          <Text style={styles.title}>1. {t('bookingIssueQuestion')}</Text>

          <Text style={styles.desc}>{t('bookingIssueDesc')}</Text>

          {['reason1', 'reason2', 'reason3', 'reason4'].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: hp(8),
                marginLeft: wp(6),
              }}>
              {/* Circle Bullet */}
              <View
                style={{
                  width: hp(4),
                  height: hp(4),
                  borderRadius: hp(3),
                  backgroundColor: colors.pureBlack,
                  marginTop: hp(7),
                  marginRight: wp(10),
                }}
              />

              {/* Text */}
              <Text
                style={{
                  flex: 1,
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                  lineHeight: hp(20),
                }}>
                {t(item)}
              </Text>
            </View>
          ))}

          <Text style={styles.footer}>{t('bookingIssueFooter')}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* ===== QUESTION 2 ===== */}
          <Text style={[styles.title, {marginTop: hp(15)}]}>
            2. {t('bookingIssueQuestion2')}
          </Text>

          <Text style={styles.desc}>{t('bookingIssueDesc2')}</Text>

          {['reason2_1', 'reason2_2'].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: hp(8),
                marginLeft: wp(6),
              }}>
              {/* Circle Bullet */}
              <View
                style={{
                  width: hp(4),
                  height: hp(4),
                  borderRadius: hp(3),
                  backgroundColor: colors.pureBlack,
                  marginTop: hp(7),
                  marginRight: wp(10),
                }}
              />

              {/* Text */}
              <Text
                style={{
                  flex: 1,
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                  lineHeight: hp(20),
                }}>
                {t(item)}
              </Text>
            </View>
          ))}

          {/* Bottom Divider */}
          <View style={[styles.divider, {marginTop: hp(20)}]} />

          {/* ===== QUESTION 3 ===== */}
          <Text style={[styles.title, {marginTop: hp(15)}]}>
            3. {t('bookingIssueQuestion3')}
          </Text>

          {/* Step Path (UNDERLINE like UI) */}
          <Text style={styles.linkText}>{t('bookingPath')}</Text>

          <Text style={styles.desc}>{t('bookingSee')}</Text>

          {/* Bullet Points */}
          {['status1', 'status2', 'status3', 'status4'].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                // marginBottom: hp(8),
                marginLeft: wp(6),
              }}>
              {/* Custom Circle Bullet */}
              <View
                style={{
                  width: hp(4), // ⭐ size of dot
                  height: hp(4),
                  borderRadius: hp(3), // make it circle
                  backgroundColor: colors.pureBlack,
                  marginTop: hp(7), // ⭐ vertical alignment
                  marginRight: wp(10),
                }}
              />

              {/* Text */}
              <Text
                style={{
                  flex: 1,
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                  lineHeight: hp(20),
                }}>
                {t(item)}
              </Text>
            </View>
          ))}

          {/* Divider */}
          <View style={[styles.divider, {marginTop: hp(20)}]} />

          {/* ===== QUESTION 4 ===== */}
          <Text style={[styles.title, {marginTop: hp(15)}]}>
            4. {t('bookingIssueQuestion4')}
          </Text>

          {/* Answer (UNDERLINE like design) */}
          <Text style={styles.linkText}>{t('bookingModifyDesc')}</Text>

          <Text style={styles.linkText}>{t('bookingModifyPath')}</Text>

          {/* Divider */}
          <View style={[styles.divider, {marginTop: hp(20)}]} />

          {/* ===== QUESTION 5 ===== */}
          <Text style={[styles.title, {marginTop: hp(15)}]}>
            5. {t('bookingIssueQuestion5')}
          </Text>

          <Text style={styles.linkText}>{t('cancelGoTo')}</Text>

          <Text style={styles.linkText}>{t('cancelPath')}</Text>

          <View style={[styles.divider, {marginTop: hp(20)}]} />

          {/* ===== QUESTION 6 ===== */}
          <Text style={[styles.title, {marginTop: hp(15)}]}>
            6. {t('bookingIssueQuestion6')}
          </Text>

          <Text style={styles.desc}>{t('cancelGoTo')}</Text>

          <Text style={styles.desc}>{t('cancelPath')}</Text>

          <Text style={styles.footer}>{t('refundNote')}</Text>

          <View style={[styles.divider, {marginTop: hp(20)}]} />

          {/* ===== QUESTION 7 ===== */}
          <Text style={[styles.title, {marginTop: hp(15)}]}>
            7. {t('bookingIssueQuestion7')}
          </Text>

          <Text style={styles.desc}>{t('cancelGoTo')}</Text>

          <Text style={styles.desc}>{t('cancelPath')}</Text>

          <Text style={styles.footer}>{t('refundNote')}</Text>

          <View style={[styles.divider, {marginTop: hp(20)}]} />

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
              marginBottom: hp(20),
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingIssueScreen;

const styles = {
  title: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins600,
    color: colors.pureBlack,
    marginBottom: hp(10),
  },

  desc: {
    fontSize: fontSize(13),
    fontFamily: fontFamily.poppins400,
    color: colors.pureBlack,
    // marginBottom: hp(12),
    lineHeight: hp(20), // ⭐ important for spacing
  },

  bullet: {
    fontSize: fontSize(13),
    fontFamily: fontFamily.poppins400,
    color: colors.pureBlack,
    marginBottom: hp(6),
    marginLeft: wp(10),
    lineHeight: hp(20), // ⭐ important
  },

  footer: {
    fontSize: fontSize(13),
    fontFamily: fontFamily.poppins400,
    color: colors.pureBlack,
    marginTop: hp(12),
    lineHeight: hp(20),
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginTop: hp(20),
  },

  linkText: {
    fontSize: fontSize(13),
    fontFamily: fontFamily.poppins400,
    color: colors.pureBlack,
    // textDecorationLine: 'underline', // ✅ ONLY this line
    // marginBottom: hp(10),
    lineHeight: hp(20),
  },

  linkBullet: {
    fontSize: fontSize(13),
    fontFamily: fontFamily.poppins400,
    color: colors.pureBlack,
    marginBottom: hp(6),
    marginLeft: wp(10),
    lineHeight: hp(20), // ❌ REMOVE underline
  },
};
