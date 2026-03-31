import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {colors} from '../../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../../utils/helpers';
import {icons} from '../../../../assets';

const ServiceCancelledScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
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
          {t('service_cancelled')}
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#E3E3E3'}}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            marginHorizontal: wp(18),
            marginTop: hp(10),
          }}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
            }}
            style={{
              width: '100%',
              height: hp(170),
              resizeMode: 'cover',
              borderRadius: hp(18),
            }}
          />
          <Text
            style={{
              color: colors.pureBlack,
              marginTop: hp(26),
              alignSelf: 'center',
              fontSize: fontSize(18),
              fontFamily: fontFamily.poppins600,
            }}>
            {t('workCompleted')}
          </Text>

          <Text
            style={{
              color: '#747474',
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
              textAlign: 'center',
              marginTop: hp(18),
              lineHeight: hp(18),
              // paddingHorizontal: wp(25),
            }}>
            {t('workCompletedDescLine1')}
            {'\n'}
            {t('workCompletedDescLine2')}
            {'\n'}
            {t('workCompletedDescLine3')}
          </Text>

          <View
            style={{
              width: '100%',
              backgroundColor: '#F9FAFB',
              borderRadius: hp(18),
              paddingVertical: hp(24),
              paddingHorizontal: wp(20),
              marginTop: hp(32),
            }}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins600,
              }}>
              {t('priceSummary')}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp(13),
              }}>
              <Text
                style={{
                  color: '#6E6E6E',
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                Standard Haircut Fee
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                120.00
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp(13),
              }}>
              <Text
                style={{
                  color: '#6E6E6E',
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                Service Fee (5%)
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                6.00
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp(13),
              }}>
              <Text
                style={{
                  color: '#6E6E6E',
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                Taxes
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                6.00
              </Text>
            </View>

            <View
              style={{
                width: '100%',
                height: hp(1),
                backgroundColor: '#DFDFDF',
                marginVertical: hp(12),
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp(13),
              }}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins500,
                }}>
                {t('totalPayable')}
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins700,
                }}>
                136.00
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('BookingSummaryScreen');
            }}
            activeOpacity={0.6}
            style={{
              width: '100%',
              height: hp(50),
              borderRadius: hp(25),
              backgroundColor: colors.primaryColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: hp(25),
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('book_again')}
            </Text>
          </TouchableOpacity>

          <View style={{height: hp(50)}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceCancelledScreen;
