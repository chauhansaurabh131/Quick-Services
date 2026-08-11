import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const LegalAcknowledgementAndConsentScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View
        style={{
          height: hp(56),
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          {t('legalTitle')}
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#EEEEEE'}}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginHorizontal: hp(17), marginTop: hp(17)}}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('legalConfirmDesc')}
          </Text>

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(29),
              marginBottom: hp(23),
            }}>
            {t('legalUnderstandAgree')}
          </Text>

          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              1.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint1')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              2.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint2')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              3.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint3')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              4.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint4')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              5.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint5')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              6.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint6')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              7.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint7')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              8.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint8')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              9.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint9')}
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: hp(3)}}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                marginRight: wp(5),
              }}>
              10.
            </Text>
            <Text
              style={{
                flex: 1,
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('legalPoint10')}
            </Text>
          </View>

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              marginTop: hp(25),
            }}>
            {t('legalByTappingPrefix')}
            <Text style={{fontFamily: fontFamily.poppins600}}>
              {t('legalByTappingBold')}
            </Text>
            {t('legalByTappingSuffix')}
          </Text>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'VendorApp'}],
              });
            }}
            style={{
              marginTop: hp(20),
              width: '100%',
              height: hp(41),
              borderRadius: hp(50),
              backgroundColor: colors.primaryColor,
              alignItems: 'center',
              marginBottom: hp(28),
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('iAgreeAndContinue')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalAcknowledgementAndConsentScreen;
