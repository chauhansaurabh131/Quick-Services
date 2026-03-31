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
import {colors} from '../../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../../utils/helpers';
import {icons} from '../../../../assets';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

const ServiceCompletedScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [rating, setRating] = useState(1); // default 4 stars
  const [feedback, setFeedback] = useState('');
  const [selectedTip, setSelectedTip] = useState('30'); // default selected

  const totalStars = 5;
  const tipOptions = ['No Tip', '30', '50', '80', '100'];

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
          {t('serviceCompleted')}
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#E3E3E3'}}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
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

            <View style={{alignItems: 'center', marginTop: hp(34)}}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins500,
                  marginBottom: hp(20),
                }}>
                {t('rateProfessional')}
              </Text>

              <View style={{flexDirection: 'row'}}>
                {[...Array(totalStars)].map((_, index) => {
                  const starIndex = index + 1;

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.7}
                      onPress={() => setRating(starIndex)}>
                      <Image
                        source={
                          starIndex <= rating
                            ? icons.color_Rating_Star // ⭐ filled
                            : icons.rating_Star_Icon // ☆ empty (add this icon)
                        }
                        style={{
                          width: 35,
                          height: 35,
                          marginHorizontal: 5,
                          resizeMode: 'contain',
                        }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View
              style={{
                marginTop: hp(43),
                backgroundColor: '#F3F4F6',
                borderRadius: hp(18),
                paddingHorizontal: wp(16),
                paddingVertical: hp(14),
                minHeight: hp(120), // ✅ important (increase height)
                width: '100%',
              }}>
              <TextInput
                placeholder={t('feedbackPlaceholder')}
                placeholderTextColor="black"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                textAlignVertical="top"
                style={{
                  fontSize: fontSize(14),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins400,
                  flex: 1, // ✅ use flex instead of height
                }}
              />
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                marginTop: hp(25),
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              {t('addTip')}
            </Text>
          </View>

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true} // ✅ important (Android fix)
              contentContainerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp(27),
                paddingLeft: wp(18),
              }}>
              {tipOptions.map((item, index) => {
                const isSelected = selectedTip === item;

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => setSelectedTip(item)}
                    style={{
                      borderRadius: hp(20),
                      borderWidth: hp(1),
                      borderColor: isSelected ? '#731EE2' : '#E0E0E0',
                      backgroundColor: isSelected ? '#F7F1FF' : 'transparent',
                      height: hp(34),
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: wp(10), // ✅ spacing
                      width: wp(84),
                    }}>
                    <Text
                      style={{
                        color: colors.pureBlack,
                        fontSize: fontSize(14),
                        fontFamily: fontFamily.poppins500,
                        top: 1,
                      }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{marginHorizontal: wp(18), marginTop: hp(25)}}>
              <TouchableOpacity
                activeOpacity={0.6}
                style={{
                  width: '100%',
                  height: hp(50),
                  borderRadius: hp(25),
                  backgroundColor: colors.primaryColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {t('releasePayment')}
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  color: '#6E6E6E',
                  fontSize: fontSize(10),
                  fontFamily: fontFamily.poppins400,
                  textAlign: 'center', // ✅ center align
                  marginTop: hp(21),
                  lineHeight: hp(18), // ✅ better readability
                  paddingHorizontal: wp(30),
                }}>
                {t('releasePaymentNoteLine1')}
                {'\n'}
                {t('releasePaymentNoteLine2')}
              </Text>
            </View>
            <View style={{height: hp(24)}} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceCompletedScreen;
