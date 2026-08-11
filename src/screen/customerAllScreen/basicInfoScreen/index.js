import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {icons} from '../../../assets';
import {launchImageLibrary} from 'react-native-image-picker';
import {style} from './style';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';
import {useDispatch, useSelector} from 'react-redux';
import {updateUserCustomer} from '../../../actions/customerAuthActions';
import RBSheet from 'react-native-raw-bottom-sheet';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {customerAuth, s3Api} from '../../../apis';

const BasicInfoScreen = ({navigation, route}) => {
  const {mobileNumber} = route.params || {};
  const dispatch = useDispatch();

  const {loading, user} = useSelector(state => state.auth || {});

  const reduxUser = user?.user || user?.data?.user || user || {};

  const [profileImage, setProfileImage] = useState(
    reduxUser.profileImage || null,
  );
  const [s3UploadedImage, setS3UploadedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fullName, setFullName] = useState(reduxUser.fullName || '');
  const [mobile, setMobile] = useState(
    mobileNumber || reduxUser.mobileNumber || reduxUser.mobile || '',
  );
  const [email, setEmail] = useState(reduxUser.email || '');
  const [emailVerified, setEmailVerified] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);

  const emailSheetRef = useRef();
  const otpInputRef = useRef(null);

  const isFullNameValid = fullName.trim().length > 0;

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Failed to select image');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const selectedUri = asset.uri;
        const fileName = asset.fileName || `customer-avatar-${Date.now()}.jpg`;
        const contentType = asset.type || 'image/jpeg';

        setProfileImage(selectedUri);
        setUploadingImage(true);

        try {
          let token = await AsyncStorage.getItem('token');
          if (typeof token === 'object' && token !== null) {
            token = token.token || token.accessToken;
          }
          if (!token || token === '[object Object]') {
            let rawToken =
              user?.token ||
              user?.accessToken ||
              user?.data?.token ||
              user?.data?.accessToken ||
              user?.tokens?.access?.token ||
              user?.tokens?.access ||
              user?.data?.tokens?.access?.token ||
              user?.data?.tokens?.access ||
              user?.user?.token ||
              user?.data?.user?.token;

            if (typeof rawToken === 'object' && rawToken !== null) {
              rawToken = rawToken.token || rawToken.accessToken;
            }
            token = typeof rawToken === 'string' ? rawToken : null;
          }

          console.log(
            'Extracted token for S3 upload:',
            token ? `${token}` : 'NULL/EMPTY!',
          );

          const s3Payload = {
            key: fileName,
            contentType: contentType,
            profileType: 'profileImage',
            isProfilePic: true,
            caption: 'Customer Profile Picture',
          };

          console.log('Requesting S3 upload URL with payload:', s3Payload);
          const apiRes = await s3Api.getProfilePicUploadUrl(
            s3Payload,
            token || '',
          );
          console.log(
            'S3 API response:',
            JSON.stringify(apiRes.data, null, 2),
          );

          const resData = apiRes?.data?.data || apiRes?.data || {};
          console.log(
            'Full S3 API Response Data:',
            JSON.stringify(resData, null, 2),
          );

          const presignedUploadUrl =
            resData.uploadUrl ||
            resData.upload_url ||
            resData.presignedUrl ||
            resData.putUrl ||
            (typeof resData.url === 'string' &&
            resData.url.includes('X-Amz-Algorithm')
              ? resData.url
              : null);

          let displayUrl =
            resData.fileUrl ||
            resData.downloadUrl ||
            resData.publicUrl ||
            resData.imageUrl ||
            resData.location ||
            resData.s3Url;

          if (presignedUploadUrl) {
            console.log('Uploading binary blob to presigned S3 URL...');
            const imageBlobRes = await fetch(selectedUri);
            const blob = await imageBlobRes.blob();

            let s3UploadRes = await fetch(presignedUploadUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': contentType,
              },
              body: blob,
            });

            if (!s3UploadRes.ok && s3UploadRes.status === 403) {
              console.log('Retrying PUT with x-amz-acl public-read...');
              s3UploadRes = await fetch(presignedUploadUrl, {
                method: 'PUT',
                headers: {
                  'Content-Type': contentType,
                  'x-amz-acl': 'public-read',
                },
                body: blob,
              });
            }

            if (!s3UploadRes.ok) {
              const errText = await s3UploadRes.text().catch(() => '');
              console.log('S3 Upload Error Response Body:', errText);
              throw new Error(
                `S3 PUT upload failed with status ${s3UploadRes.status}`,
              );
            }
            console.log('S3 image upload completed successfully!');
          }

          if (!displayUrl) {
            if (resData.key) {
              displayUrl = resData.key.startsWith('http')
                ? resData.key
                : `https://trendigo-s3.s3.amazonaws.com/${resData.key}`;
            } else if (presignedUploadUrl) {
              displayUrl = presignedUploadUrl.split('?')[0];
            } else {
              displayUrl = selectedUri;
            }
          }

          console.log('Final resolved image display URL:', displayUrl);
          setS3UploadedImage(displayUrl);
          setUploadingImage(false);
        } catch (uploadError) {
          console.log('S3 Upload Error:', uploadError);
          setUploadingImage(false);
          const msg =
            uploadError?.response?.data?.message ||
            uploadError?.message ||
            'Failed to upload image to S3';
          Alert.alert('Upload Error', msg);
        }
      }
    });
  };

  const handleMobileChange = text => {
    const formatted = text
      .replace(/\D/g, '') // only numbers
      .slice(0, 10) // max 10 digits
      .replace(/(\d{5})(\d{0,5})/, '$1 $2')
      .trim();

    setMobile(formatted);
  };

  const handleEmailChange = text => {
    setEmail(text);

    if (text.trim() === '') {
      setEmailVerified(false);
    } else {
      setEmailVerified(false);
    }
  };

  const handleVerifyEmail = () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your Full Name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your Email');
      return;
    }

    setEmailVerifyLoading(true);
    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
    };

    dispatch(
      updateUserCustomer(payload, (error, response) => {
        setEmailVerifyLoading(false);
        if (error) {
          Alert.alert(
            'Error',
            error.message || 'Something went wrong while sending OTP',
          );
        } else {
          setEmailTimer(30);
          emailSheetRef.current?.open();
        }
      }),
    );
  };

  const handleGetStarted = () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your Full Name');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
    };

    if (email.trim()) {
      payload.email = email.trim();
    }

    const imageToSave = s3UploadedImage || profileImage;
    if (imageToSave) {
      payload.profileImage = imageToSave;
    }

    dispatch(
      updateUserCustomer(payload, (error, response) => {
        if (error) {
          Alert.alert(
            'Update Failed',
            error.message || 'Something went wrong while updating details',
          );
        } else {
          navigation.replace('MainApp');
        }
      }),
    );
  };

  return (
    <SafeAreaView style={style.container}>
      {/* HEADER */}
      <View style={style.headerBody}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          activeOpacity={0.6}
          style={style.backArrowContainer}>
          <Image source={icons.back_Arrow_Icon} style={style.backArrowImage} />
        </TouchableOpacity>

        <Text style={style.headerTittle}>Basic Info</Text>

        <Text style={style.headerSubTittle}>Step 3 of 3</Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={style.progressBarContainer}>
        <View style={style.progressBarStyle} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={style.bodyContainer}>
          <Text style={style.bodyTittle}>We use this to personalized your</Text>
          <Text style={[style.bodyTittle, {top: -1}]}>booking experience.</Text>
        </View>

        {/* IMAGE PICKER */}
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={uploadingImage}
          onPress={openGallery}
          style={style.imagePickerContainer}>
          {uploadingImage ? (
            <ActivityIndicator size="large" color="#731EE2" />
          ) : profileImage ? (
            <Image
              key={profileImage}
              source={{
                uri: profileImage.startsWith('http://')
                  ? profileImage.replace('http://', 'https://')
                  : profileImage,
              }}
              style={style.imageDisplay}
              resizeMode="cover"
            />
          ) : (
            <Image source={icons.camera_Icon} style={style.addImage} />
          )}
        </TouchableOpacity>

        <View style={style.bodyDataContainer}>
          <BorderShowLabelTextInputComponent
            label={'Full Name'}
            value={fullName}
            onChangeText={setFullName}
            multiline={false}
          />

          <BorderShowLabelTextInputComponent
            label={'Mobile Number'}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="number-pad"
            maxLength={10}
            multiline={false}
          />

          <BorderShowLabelTextInputComponent
            label={'Email'}
            value={email}
            onChangeText={handleEmailChange}
            optional
            multiline={false}
          />

          {emailVerified && (
            <View
              style={{
                marginTop: hp(5),
                alignItems: 'center',
                flexDirection: 'row',
                marginHorizontal: wp(18),
              }}>
              <Image
                source={icons.verified_Icon}
                tintColor={'#1DC34C'}
                style={{width: hp(15), height: hp(15), resizeMode: 'contain'}}
              />
              <Text
                style={{
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins500,
                  color: '#22C55E',
                  top: 1,
                  marginLeft: wp(5),
                }}>
                Email Verified Successfully
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {!keyboardVisible && (
        <>
          {email.trim() !== '' && !emailVerified ? (
            <View style={style.buttonContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={emailVerifyLoading || !isFullNameValid}
                style={[
                  style.buttonStyle,
                  {
                    opacity: isFullNameValid ? 1 : 0.5,
                  },
                ]}
                onPress={handleVerifyEmail}>
                {emailVerifyLoading ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Text style={style.buttonText}>Verify Email</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={style.buttonContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={loading || !isFullNameValid}
                style={[
                  style.buttonStyle,
                  {
                    opacity: isFullNameValid ? 1 : 0.5,
                  },
                ]}
                onPress={handleGetStarted}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Text style={style.buttonText}>Get Started</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <RBSheet
        ref={emailSheetRef}
        height={hp(380)}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            paddingHorizontal: hp(20),
            paddingTop: hp(20),
          },
        }}>
        {otpVerified ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={icons.verified_Icon}
              tintColor={'#1DC34C'}
              style={{width: hp(30), height: hp(30), resizeMode: 'contain'}}
            />

            <Text
              style={{
                marginTop: hp(10),
                fontSize: fontSize(18),
                color: '#22C55E',
                fontFamily: fontFamily.poppins600,
              }}>
              Email Verified Successfully
            </Text>
          </View>
        ) : (
          <View>
            <Text
              style={{
                fontSize: fontSize(18),
                fontFamily: fontFamily.poppins600,
                textAlign: 'center',
                color: '#000',
              }}>
              Verify Email
            </Text>

            <Text
              style={{
                marginTop: hp(10),
                textAlign: 'center',
                color: '#666',
                fontSize: fontSize(14),
              }}>
              Enter the 4 digit OTP sent to
            </Text>

            <Text
              style={{
                textAlign: 'center',
                fontFamily: fontFamily.poppins600,
                color: '#000',
                marginTop: hp(5),
              }}>
              {email}
            </Text>

            {/* OTP BOXES */}

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => otpInputRef.current?.focus()}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: hp(35),
              }}>
              {[0, 1, 2, 3].map(index => (
                <View
                  key={index}
                  style={{
                    width: 65,
                    height: 65,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderBottomWidth: 2,
                    borderBottomColor:
                      otp.length === index ? 'black' : '#D9D9D9',
                  }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: '600',
                      color: '#000',
                    }}>
                    {otp[index] || ''}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>

            {/* Hidden Input */}

            <TextInput
              ref={otpInputRef}
              value={otp}
              onChangeText={text => {
                const value = text.replace(/[^0-9]/g, '').slice(0, 4);
                setOtp(value);
              }}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              style={{
                position: 'absolute',
                opacity: 0,
                width: 1,
                height: 1,
              }}
            />

            {/* Resend OTP */}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleVerifyEmail}
              disabled={emailTimer > 0 || emailVerifyLoading}
              style={{
                marginTop: hp(50),
                alignSelf: 'center',
              }}>
              {emailVerifyLoading ? (
                <ActivityIndicator color="#731EE2" size="small" />
              ) : (
                <Text
                  style={{
                    color: emailTimer > 0 ? '#717171' : '#000',
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  {emailTimer > 0
                    ? `Resend OTP in ${emailTimer}s`
                    : 'Resend OTP'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Verify Button */}

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={otp.length !== 4 || otpLoading}
              style={{
                marginTop: hp(35),
                height: hp(44),
                borderRadius: hp(12),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: otp.length === 4 ? '#731EE2' : '#D9D9D9',
              }}
              onPress={async () => {
                setOtpLoading(true);
                try {
                  let token = await AsyncStorage.getItem('token');
                  if (!token && user) {
                    token =
                      user?.token ||
                      user?.data?.token ||
                      user?.tokens?.access?.token ||
                      user?.data?.tokens?.access?.token;
                  }

                  const response = await customerAuth.verifyUpdateOtp(
                    {
                      otp: otp,
                      type: 'email',
                    },
                    token || '',
                  );

                  setOtpLoading(false);
                  setOtpVerified(true);

                  setTimeout(() => {
                    setEmailVerified(true);
                    setOtp('');

                    emailSheetRef.current?.close();

                    setTimeout(() => {
                      setOtpVerified(false);
                    }, 300);
                  }, 2000);
                } catch (error) {
                  setOtpLoading(false);
                  const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Verification failed';
                  Alert.alert('Verification Failed', errorMsg);
                }
              }}>
              {otpLoading ? (
                <ActivityIndicator color="#FFF" size={'large'} />
              ) : (
                <Text
                  style={{
                    color: '#FFF',
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  Verify OTP
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </RBSheet>
    </SafeAreaView>
  );
};

export default BasicInfoScreen;
