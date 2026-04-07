import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {colors} from '../../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';

const KycDetailsScreen = ({route}) => {
  const navigation = useNavigation();
  const isCaptureDone = route.params?.isCaptureDone;
  const [image, setImage] = useState(null);

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled');
      } else if (response.errorCode) {
        console.log('Error:', response.errorMessage);
      } else {
        const selectedImage = response.assets[0];
        setImage(selectedImage.uri);
      }
    });
  };

  const isButtonEnabled = image && isCaptureDone;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* HEADER */}
      <View
        style={{
          height: hp(55),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          activeOpacity={0.6}
          style={{
            height: '100%',
            width: wp(65),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={icons.back_Arrow_Icon}
            style={{width: wp(15), height: hp(15), resizeMode: 'contain'}}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          KYC Details
        </Text>

        <Text
          style={{
            color: colors.primaryColor,
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
            marginRight: wp(13),
          }}>
          Step 4 of 6
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View
        style={{
          width: '100%',
          height: hp(1),
          backgroundColor: '#E5E5E5',
          // marginBottom: hp(5),
        }}>
        <View
          style={{
            width: '66.4%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{marginHorizontal: wp(18), marginTop: hp(5)}}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            marginTop: hp(15),
          }}>
          Identity Verification
        </Text>

        <Text
          style={{
            color: '#989898',
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
            marginTop: hp(10),
          }}>
          Help us keep our community safe by verifying{'\n'}your identity with
          official documents
        </Text>

        <View
          style={{
            width: '100%',
            height: hp(288),
            borderWidth: hp(1),
            borderColor: '#E0E0E0',
            borderRadius: hp(18),
            marginTop: hp(21),
          }}>
          <View style={{marginHorizontal: hp(23)}}>
            <Text
              style={{
                color: colors.pureBlack,
                marginTop: hp(30),
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins600,
              }}>
              Upload Government ID
            </Text>

            <Text
              style={{
                color: '#989898',
                marginTop: hp(22),
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              Upload a clear photo of your Passport,{'\n'}Driver’s License, or
              National Identity Card.
            </Text>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={openGallery}
              style={{
                height: hp(138),
                width: '100%',
                borderWidth: hp(1),
                borderColor: '#D6D6D6',
                borderStyle: 'dashed',
                borderRadius: hp(18),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FAFAFA',
                marginTop: hp(19),
                overflow: 'hidden', // 🔥 important for image
              }}>
              {image ? (
                <Image
                  source={{uri: image}}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
              ) : (
                <Image
                  source={icons.camera_Icon}
                  style={{
                    width: hp(28),
                    height: hp(26),
                    resizeMode: 'contain',
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            width: '100%',
            // height: hp(454),
            borderWidth: hp(1),
            borderColor: '#E0E0E0',
            borderRadius: hp(18),
            marginTop: hp(16),
            marginBottom: hp(18),
          }}>
          <View style={{marginHorizontal: hp(23)}}>
            <Text
              style={{
                color: colors.pureBlack,
                marginTop: hp(30),
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins600,
              }}>
              Take a Video Selfie
            </Text>

            <View
              activeOpacity={0.6}
              // onPress={() => navigation.navigate('FaceCaptureScreen')}
              style={{
                height: hp(176),
                width: '100%',
                borderWidth: hp(1),
                borderColor: '#D6D6D6',
                borderStyle: 'dashed',
                borderRadius: hp(18),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FAFAFA',
                marginTop: hp(32),
                overflow: 'hidden', // 🔥 important for image
              }}>
              <Image
                source={
                  isCaptureDone ? icons.verified_Icon : icons.face_video_Icon
                }
                style={{
                  width: hp(65),
                  height: hp(65),
                  resizeMode: 'contain',
                  tintColor: isCaptureDone ? colors.primaryColor : undefined,
                }}
              />
              <Text
                style={{
                  color: isCaptureDone ? colors.pureBlack : colors.pureBlack,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins600,
                  marginTop: hp(19),
                }}>
                {isCaptureDone ? '5 Sec Clip Done' : '5 sec Clip'}
              </Text>
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                marginTop: hp(24),
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins600,
              }}>
              Instructions :{' '}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp(10),
              }}>
              {isCaptureDone && (
                <Image
                  source={icons.green_Check_Icon}
                  style={{
                    width: hp(12),
                    height: hp(12),
                    resizeMode: 'contain',
                    marginRight: wp(15),
                  }}
                />
              )}

              <Text
                style={{
                  color: '#646464',
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                Hold camera at eye level
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp(5),
                marginBottom: hp(23),
              }}>
              {isCaptureDone && (
                <Image
                  source={icons.green_Check_Icon}
                  style={{
                    width: hp(12),
                    height: hp(12),
                    resizeMode: 'contain',
                    marginRight: wp(15),
                  }}
                />
              )}

              <Text
                style={{
                  color: '#646464',
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                Looks straight and fun your head slowly
              </Text>
            </View>

            {!isCaptureDone && (
              <TouchableOpacity
                onPress={() => navigation.navigate('FaceCaptureScreen')}
                activeOpacity={0.6}
                style={{
                  width: '100%',
                  height: hp(40),
                  backgroundColor: colors.pureBlack,
                  borderRadius: hp(50),
                  marginTop: hp(23),
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  marginBottom: hp(21),
                }}>
                <Image
                  source={icons.video_Icon}
                  style={{
                    width: hp(14),
                    height: hp(9),
                    resizeMode: 'contain',
                    marginRight: wp(15),
                  }}
                />
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Record 5s Video
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (isButtonEnabled) {
              navigation.navigate('VendorServiceAndPricingScreen');
            }
          }}
          activeOpacity={isButtonEnabled ? 0.6 : 1}
          disabled={!isButtonEnabled}
          style={{
            width: '100%',
            height: hp(50),
            borderRadius: hp(50),
            backgroundColor: colors.primaryColor,
            opacity: isButtonEnabled ? 1 : 0.5,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: hp(18),
          }}>
          {/* Center Text */}
          <Text
            style={{
              color: colors.white,
              position: 'absolute',
              alignSelf: 'center',
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins400,
              // opacity: isButtonEnabled ? 1 : 0.6,
            }}>
            Add Services & Pricing
          </Text>

          {/* Right Arrow */}
          <Image
            source={icons.back_Arrow_Icon}
            style={{
              position: 'absolute',
              right: hp(25),
              width: hp(15),
              height: hp(15),
              tintColor: colors.white,
              transform: [{rotate: '180deg'}],
            }}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KycDetailsScreen;
