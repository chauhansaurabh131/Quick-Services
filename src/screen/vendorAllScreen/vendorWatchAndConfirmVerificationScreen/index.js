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
import {icons, video} from '../../../assets';
import Video from 'react-native-video';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const VendorWatchAndConfirmVerificationScreen = () => {
  const refRBSheet = useRef();
  const {t, i18n} = useTranslation();
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  const navigation = useNavigation();

  const questions = [
    {
      id: 1,
      question: t('question1'),
    },
    {
      id: 2,
      question: t('question2'),
    },
    {
      id: 3,
      question: t('question3'),
    },
  ];

  const [answers, setAnswers] = useState({
    1: 'yes',
    2: 'yes',
    3: 'yes',
  });

  const selectLanguage = lang => {
    i18n.changeLanguage(lang);
    refRBSheet.current?.close();
  };

  const onSelectAnswer = (id, value) => {
    if (!isVideoCompleted) {
      return;
    }
    setAnswers(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View
        style={{
          height: hp(56),
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#EEEEEE',
          backgroundColor: colors.white,
          position: 'relative',
        }}>
        {/* Center Title */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          {t('watchAndConfirm')}
        </Text>

        {/* Right Language Button */}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => refRBSheet.current?.open()}
          style={{
            position: 'absolute',
            right: wp(16),
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: hp(1),
            borderColor: '#DDDDDD',
            borderRadius: hp(20),
            paddingVertical: hp(2),
            paddingHorizontal: wp(8),
            backgroundColor: colors.white,
          }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(13),
              fontFamily: fontFamily.poppins600,
              marginRight: wp(6),
              marginLeft: wp(5),
            }}>
            {i18n.language === 'hi'
              ? 'Hin'
              : i18n.language === 'gu'
              ? 'Guj'
              : 'Eng'}
          </Text>

          <Image
            source={icons.bottom_Arrow_Icon}
            resizeMode="contain"
            style={{
              width: hp(11),
              height: hp(10),
              transform: [{rotate: '-90deg'}],
              tintColor: '#DBDBDB',
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Video
          source={video.verification_Video}
          style={{
            width: '100%',
            height: hp(232),
            backgroundColor: '#000',
          }}
          resizeMode="cover"
          controls
          controlsStyles={{
            hideForward: true,
            hideRewind: true,
            hideNext: true,
            hidePrevious: true,
            hideSeekBar: false,
          }}
          paused={true}
          onEnd={() => setIsVideoCompleted(true)}
          onError={e => console.log('Video Error:', e)}
        />

        <Text
          style={{
            textAlign: 'center',
            paddingVertical: hp(18),
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
          }}>
          {t('howToBehaveCustomerHome')}
        </Text>

        <View
          style={{width: '100%', height: hp(1), backgroundColor: '#DCDCDC'}}
        />

        <View style={{marginTop: hp(21), marginHorizontal: wp(18)}}>
          <Text
            style={{
              color: '#868686',
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins500,
            }}>
            {t('submitYourAnswer')}
          </Text>
        </View>

        <View style={{marginHorizontal: wp(16), marginTop: hp(18)}}>
          {questions.map((item, index) => (
            <View
              key={item.id}
              style={{
                borderWidth: hp(1),
                borderColor: '#E0E0E0',
                borderRadius: hp(14),
                padding: hp(18),
                marginBottom: hp(18),
                opacity: isVideoCompleted ? 1 : 0.6,
              }}>
              <Text
                style={{
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins500,
                  color: colors.pureBlack,
                  lineHeight: hp(22),
                }}>
                {index + 1}. {item.question}
                {/*<Text style={{color: 'red'}}>*</Text>*/}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: hp(13),
                  alignSelf: 'flex-start',
                  backgroundColor: '#F8F2FF',
                  borderRadius: hp(15),
                  padding: hp(2),
                }}>
                {/* YES */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={!isVideoCompleted}
                  onPress={() => onSelectAnswer(item.id, 'yes')}
                  style={{
                    backgroundColor:
                      answers[item.id] === 'yes' ? '#000' : 'transparent',
                    paddingHorizontal: wp(18),
                    paddingVertical: hp(8),
                    borderRadius: hp(10),
                  }}>
                  <Text
                    style={{
                      color:
                        answers[item.id] === 'yes'
                          ? colors.white
                          : colors.pureBlack,
                      fontFamily: fontFamily.poppins700,
                    }}>
                    {t('yes')}
                  </Text>
                </TouchableOpacity>

                {/* NO */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={!isVideoCompleted}
                  onPress={() => onSelectAnswer(item.id, 'no')}
                  style={{
                    backgroundColor:
                      answers[item.id] === 'no' ? '#000' : 'transparent',
                    paddingHorizontal: wp(18),
                    paddingVertical: hp(8),
                    borderRadius: hp(10),
                  }}>
                  <Text
                    style={{
                      color:
                        answers[item.id] === 'no'
                          ? colors.white
                          : colors.pureBlack,
                      fontFamily: fontFamily.poppins700,
                    }}>
                    {t('no')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!isVideoCompleted}
          onPress={() => {
            navigation.navigate('LegalAcknowledgementAndConsentScreen');
          }}
          style={{
            marginHorizontal: wp(18),
            marginBottom: hp(25),
            height: hp(41),
            borderRadius: hp(30),
            backgroundColor: colors.primaryColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp(5),
            opacity: isVideoCompleted ? 1 : 0.4,
          }}>
          <Text
            style={{
              color: colors.white,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('submitAndContinue')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <RBSheet
        ref={refRBSheet}
        height={hp(230)}
        openDuration={250}
        customStyles={{
          container: {
            padding: hp(20),
            borderTopLeftRadius: hp(20),
            borderTopRightRadius: hp(20),
            backgroundColor: colors.white,
          },
        }}>
        <Text
          style={{
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            color: colors.pureBlack,
            marginBottom: hp(15),
          }}>
          {t('selectLanguage') || 'Select Language'}
        </Text>

        <View
          style={{width: '100%', height: hp(1), backgroundColor: '#DCDCDC'}}
        />

        <TouchableOpacity
          style={{
            paddingVertical: hp(10),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp(10),
          }}
          onPress={() => selectLanguage('en')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(15),
              fontFamily:
                i18n.language === 'en'
                  ? fontFamily.poppins600
                  : fontFamily.poppins400,
            }}>
            English ({t('english') || 'English'})
          </Text>
          {i18n.language === 'en' && (
            <Image
              source={icons.green_Check_Icon}
              style={{width: hp(16), height: hp(16), resizeMode: 'contain'}}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingVertical: hp(10),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onPress={() => selectLanguage('hi')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(15),
              fontFamily:
                i18n.language === 'hi'
                  ? fontFamily.poppins600
                  : fontFamily.poppins400,
            }}>
            Hindi ({t('hindi') || 'हिन्दी'})
          </Text>
          {i18n.language === 'hi' && (
            <Image
              source={icons.green_Check_Icon}
              style={{width: hp(16), height: hp(16), resizeMode: 'contain'}}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingVertical: hp(10),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onPress={() => selectLanguage('gu')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(15),
              fontFamily:
                i18n.language === 'gu'
                  ? fontFamily.poppins600
                  : fontFamily.poppins400,
            }}>
            Gujarati ({t('gujarati') || 'ગુજરાતી'})
          </Text>
          {i18n.language === 'gu' && (
            <Image
              source={icons.green_Check_Icon}
              style={{width: hp(16), height: hp(16), resizeMode: 'contain'}}
            />
          )}
        </TouchableOpacity>
      </RBSheet>
    </SafeAreaView>
  );
};

export default VendorWatchAndConfirmVerificationScreen;
