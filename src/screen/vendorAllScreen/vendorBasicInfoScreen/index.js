import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RBSheet from 'react-native-raw-bottom-sheet';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { setLocation } from '../../../actions/locationActions';
import { colors } from '../../../utils/colors';
import { icons } from '../../../assets';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';
import { customerAuth, s3Api } from '../../../apis';
import {
  getVendorCategories,
  resendOtpVendor,
  updateUserCustomer,
  updateVendorProfile,
} from '../../../actions/customerAuthActions';

const VendorBasicInfoScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { loading, user } = useSelector(state => state.auth || {});
  const reduxUser = user?.user || user?.data?.user || user || {};

  const [profileImage, setProfileImage] = useState(
    reduxUser.profileImage || null,
  );
  const [s3UploadedImage, setS3UploadedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [name, setName] = useState(reduxUser.fullName || reduxUser.name || '');
  const [businessName, setBusinessName] = useState(
    reduxUser.businessName || '',
  );
  const [gstNumber, setGstNumber] = useState(
    reduxUser.gstin || reduxUser.gstNumber || '',
  );
  const [contactNumber, setContactNumber] = useState(
    reduxUser.mobileNumber || reduxUser.mobile
      ? String(reduxUser.mobileNumber || reduxUser.mobile)
      : '',
  );
  const [email, setEmail] = useState(reduxUser.email || '');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const getAuthTokenAndUserId = async () => {
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

    const userId =
      user?.id ||
      user?._id ||
      user?.user?.id ||
      user?.user?._id ||
      user?.vendorUser?.id ||
      user?.vendorUser?._id ||
      user?.customerUser?.id ||
      user?.customerUser?._id ||
      user?.data?.user?.id ||
      user?.data?.user?._id ||
      user?.data?.id ||
      user?.data?._id;

    return { token, userId };
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    const fetchAndUpdateLocationOnMount = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('VendorBasicInfoScreen: Location permission denied');
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const longitude = position.coords.longitude || 72.5714;
          const latitude = position.coords.latitude || 23.0225;

          console.log(
            'VendorBasicInfoScreen GPS Location -> Longitude:',
            longitude,
            'Latitude:',
            latitude,
          );

          await updateLocationApi(longitude, latitude);
        },
        async error => {
          console.log('VendorBasicInfoScreen Geolocation error:', error, 'Using fallback coordinates');
          await updateLocationApi(72.5714, 23.0225);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    };

    const updateLocationApi = async (longitude, latitude) => {
      try {
        const { token, userId } = await getAuthTokenAndUserId();
        console.log(
          '==================================================',
          '\n[VendorBasicInfoScreen Location PUT Request]',
          `\nUser ID: ${userId}`,
          `\nCoordinates: [${longitude}, ${latitude}] (Longitude first, Latitude second)`,
          `\nToken Preview: ${token ? `${token.substring(0, 20)}...` : 'NONE'}`,
          '\n==================================================',
        );

        if (userId && token) {
          const locationPayload = {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude], // Longitude first, Latitude second
            },
          };

          const apiRes = await customerAuth.updateUserLocation(
            userId,
            locationPayload,
            token,
          );

          console.log(
            '==================================================',
            '\n[VendorBasicInfoScreen Location PUT Success]',
            '\nResponse Data:',
            JSON.stringify(apiRes?.data, null, 2),
            '\n==================================================',
          );
        } else {
          console.log(
            'VendorBasicInfoScreen Location PUT skipped (Missing User ID or Token). User ID:',
            userId,
            '| Token present:',
            !!token,
          );
        }
      } catch (apiErr) {
        console.log(
          '==================================================',
          '\n[VendorBasicInfoScreen Location PUT Error]',
          '\nError Details:',
          JSON.stringify(apiErr?.response?.data || apiErr?.message, null, 2),
          '\n==================================================',
        );
      }

      try {
        const addressRes = await axios.get(
          'https://nominatim.openstreetmap.org/reverse',
          {
            params: {
              lat: latitude,
              lon: longitude,
              format: 'json',
            },
            headers: {
              'User-Agent': 'doormigo-app',
            },
          },
        );

        const addr = addressRes.data.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.hamlet ||
          addr.county ||
          '';
        const district = addr.state_district || '';
        const state = addr.state || '';
        const newFullAddress = `${city}, ${district}, ${state}`;

        dispatch(
          setLocation({
            longitude,
            latitude,
            place: city,
            fullAddress: newFullAddress,
          }),
        );
      } catch (error) {
        dispatch(
          setLocation({
            longitude,
            latitude,
            place: 'Unable to fetch location',
            fullAddress: '',
          }),
        );
      }
    };

    fetchAndUpdateLocationOnMount();
  }, []);

  const hasPreviousEmail = Boolean(
    reduxUser.email ||
    reduxUser.user?.email ||
    reduxUser.data?.email ||
    user?.vendorUser?.email ||
    user?.email,
  );

  const hasPreviousMobile = Boolean(
    reduxUser.mobileNumber ||
    reduxUser.mobile ||
    reduxUser.user?.mobileNumber ||
    reduxUser.data?.mobileNumber ||
    user?.vendorUser?.mobileNumber ||
    user?.mobileNumber,
  );

  const hasPreviousBusinessName = Boolean(
    reduxUser.businessName ||
    reduxUser.business_name ||
    reduxUser.user?.businessName ||
    reduxUser.data?.businessName ||
    user?.vendorUser?.businessName ||
    user?.businessName,
  );

  const [mobileVerified, setMobileVerified] = useState(
    Boolean(
      hasPreviousMobile ||
      reduxUser.mobileVerified ||
      reduxUser.isMobileVerified,
    ),
  );
  const [emailVerified, setEmailVerified] = useState(
    Boolean(
      hasPreviousEmail || reduxUser.emailVerified || reduxUser.isEmailVerified,
    ),
  );
  const [verifyType, setVerifyType] = useState('mobile');
  const [mobileVerifyLoading, setMobileVerifyLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [mobileTimer, setMobileTimer] = useState(0);

  const mobileSheetRef = useRef();
  const categorySheetRef = useRef();
  const otpInputRef = useRef(null);

  const handleOpenCategorySheet = () => {
    categorySheetRef.current?.open();
    setCategoriesLoading(true);
    dispatch(
      getVendorCategories((error, response) => {
        setCategoriesLoading(false);
        if (error) {
          console.log('Error fetching vendor categories:', error);
        } else {
          console.log('Vendor Categories API Response:', response);
          const list =
            response?.data || response?.categories || response || [];
          setCategoriesList(Array.isArray(list) ? list : []);
        }
      }),
    );
  };

  const handleSelectCategory = item => {
    setSelectedCategory(item);
    categorySheetRef.current?.close();

    const catId = typeof item === 'string' ? item : item._id || item.id;
    if (catId) {
      console.log('Dispatching updateVendorProfile with categoryId:', catId);
      dispatch(
        updateVendorProfile({ categoryId: catId }, (error, response) => {
          if (error) {
            console.log('Error updating categoryId in vendor profile:', error);
          } else {
            console.log('Successfully updated categoryId in vendor profile:', response);
          }
        }),
      );
    }
  };

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
    if (mobileTimer > 0) {
      interval = setInterval(() => {
        setMobileTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [mobileTimer]);

  const handleContactNumberChange = text => {
    setContactNumber(text);
    setMobileVerified(false);
  };

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
        const fileName = asset.fileName || `vendor-avatar-${Date.now()}.jpg`;
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
            caption: 'Vendor Profile Picture',
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

  const handleVerifyMobile = () => {
    const contactStr = (contactNumber ?? '').toString();
    const cleanNumber = contactStr.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid 10-digit mobile number',
      );
      return;
    }

    setMobileVerifyLoading(true);
    const payload = {
      mobileNumber: cleanNumber,
      countryCodeId: '6a420c2f668100ad2212e8ea',
    };

    dispatch(
      updateUserCustomer(payload, (error, response) => {
        setMobileVerifyLoading(false);
        if (error) {
          Alert.alert(
            'Error',
            error?.message || error?.msg || 'Something went wrong while sending OTP',
          );
        } else {
          setMobileTimer(30);
          mobileSheetRef.current?.open();
        }
      }),
    );
  };

  const handleVerifyEmail = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address',
      );
      return;
    }

    setMobileVerifyLoading(true);
    setVerifyType('email');
    const payload = {
      email: trimmedEmail,
    };

    if (name.trim()) {
      payload.name = name.trim();
    }

    console.log(
      'Sending Email OTP via updateVendorProfile API with payload:',
      JSON.stringify(payload, null, 2),
    );

    dispatch(
      updateVendorProfile(payload, (error, response) => {
        setMobileVerifyLoading(false);
        if (error) {
          Alert.alert(
            'Error',
            error?.message || error?.msg || 'Something went wrong while sending OTP',
          );
        } else {
          setMobileTimer(30);
          mobileSheetRef.current?.open();
        }
      }),
    );
  };

  const handleResendEmailOtp = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address',
      );
      return;
    }

    setMobileVerifyLoading(true);
    const payload = {
      email: trimmedEmail,
    };

    if (name.trim()) {
      payload.name = name.trim();
    }

    console.log(
      'Resending Email OTP via updateVendorProfile API with payload:',
      JSON.stringify(payload, null, 2),
    );

    dispatch(
      updateVendorProfile(payload, (error, response) => {
        setMobileVerifyLoading(false);
        if (error) {
          Alert.alert(
            'Resend Failed',
            error?.message || error?.msg || 'Failed to resend OTP',
          );
        } else {
          setMobileTimer(30);
          Alert.alert(
            'OTP Sent',
            response?.message || response?.msg || 'A new OTP has been sent successfully.',
          );
        }
      }),
    );
  };

  const handleResendMobileOtp = () => {
    const contactStr = (contactNumber ?? '').toString();
    const cleanNumber = contactStr.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid 10-digit mobile number',
      );
      return;
    }

    setMobileVerifyLoading(true);
    const payload = {
      mobileNumber: Number(cleanNumber) || cleanNumber,
      countryCodeId: '6a420c2f668100ad2212e8ea',
    };

    if (name.trim()) {
      payload.name = name.trim();
    }

    console.log(
      'Resending OTP via updateVendorProfile API with payload:',
      JSON.stringify(payload, null, 2),
    );

    dispatch(
      updateVendorProfile(payload, (error, response) => {
        setMobileVerifyLoading(false);
        if (error) {
          Alert.alert(
            'Resend Failed',
            error?.message || error?.msg || 'Failed to resend OTP',
          );
        } else {
          setMobileTimer(30);
          Alert.alert(
            'OTP Sent',
            response?.message || response?.msg || 'A new OTP has been sent successfully.',
          );
        }
      }),
    );
  };

  const handleGetStarted = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your Full Name');
      return;
    }

    const payload = {
      name: name.trim(),
    };

    // Check pre-existing data in reduxUser (from initial registration or earlier steps)
    const hasPreviousBusinessName = Boolean(
      reduxUser.businessName || reduxUser.business_name,
    );
    if (!hasPreviousBusinessName && businessName.trim()) {
      payload.businessName = businessName.trim();
    }

    const hasPreviousEmail = Boolean(reduxUser.email);
    if (!hasPreviousEmail && email.trim()) {
      payload.email = email.trim();
    }

    const hasPreviousMobile = Boolean(
      reduxUser.mobileNumber || reduxUser.mobile,
    );
    const contactStr = (contactNumber ?? '').toString();
    if (!hasPreviousMobile && contactStr.trim()) {
      payload.mobileNumber = contactStr.trim().replace(/\D/g, '');
      payload.countryCodeId = '6a420c2f668100ad2212e8ea';
    }

    if (gstNumber.trim()) {
      payload.gstNumber = gstNumber.trim();
    }

    if (selectedCategory) {
      const catId =
        typeof selectedCategory === 'string'
          ? null
          : selectedCategory._id || selectedCategory.id;

      if (catId) {
        payload.categoryId = catId;
      }
    }

    const imageToSave = s3UploadedImage || profileImage;
    if (imageToSave) {
      payload.profileImage = imageToSave;
    }

    console.log(
      'Sending Vendor Update Profile Payload:',
      JSON.stringify(payload, null, 2),
    );

    dispatch(
      updateVendorProfile(payload, (error, response) => {
        if (error) {
          Alert.alert(
            'Update Failed',
            error?.message ||
            error?.msg ||
            'Something went wrong while updating details',
          );
        } else {
          navigation.navigate('VendorBusinessAddressScreen');
        }
      }),
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
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
            style={{ width: wp(15), height: hp(15), resizeMode: 'contain' }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          Basic Info
        </Text>

        <Text
          style={{
            color: colors.primaryColor,
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
            marginRight: wp(13),
          }}>
          Step 5 of 9
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={{ width: '100%', height: hp(1), backgroundColor: '#E5E5E5' }}>
        <View
          style={{
            width: '44.44%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: hp(41), alignItems: 'center' }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}>
            We use this to personalized your
          </Text>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              top: -1,
            }}>
            booking experience.
          </Text>
        </View>

        {/* IMAGE PICKER */}
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={uploadingImage}
          onPress={openGallery}
          style={{
            width: hp(120),
            height: hp(120),
            borderRadius: hp(100),
            backgroundColor: '#F9F9F9',
            justifyContent: 'center',
            alignSelf: 'center',
            marginTop: hp(33),
            alignItems: 'center',
            overflow: 'hidden',
          }}>
          {uploadingImage ? (
            <ActivityIndicator size="large" color={colors.primaryColor} />
          ) : profileImage ? (
            <Image
              key={profileImage}
              source={{
                uri: profileImage.startsWith('http://')
                  ? profileImage.replace('http://', 'https://')
                  : profileImage,
              }}
              style={{ width: '100%', height: '100%', borderRadius: hp(100) }}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={icons.camera_Icon}
              style={{ width: wp(28), height: hp(26), resizeMode: 'contain' }}
            />
          )}
        </TouchableOpacity>

        <Text style={{ color: '#7E7E7E', textAlign: 'center', marginTop: hp(15), marginBottom: hp(30), fontSize: fontSize(12), fontFamily: fontFamily.poppins400 }}>Upload Store/Company Logo</Text>

        <BorderShowLabelTextInputComponent
          label={'Full Name'}
          value={name}
          onChangeText={setName}
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'Business Name'}
          value={businessName}
          onChangeText={setBusinessName}
          editable={!hasPreviousBusinessName}
          multiline={false}
        />

        {/* SELECT SERVICE CATEGORY */}
        <View style={{ marginTop: hp(16), paddingHorizontal: wp(16) }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenCategorySheet}
            style={{
              borderWidth: 1.5,
              borderColor: selectedCategory ? '#CDADF6' : '#D2D2D2',
              borderRadius: hp(12),
              paddingHorizontal: wp(12),
              height: hp(62),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.white,
            }}>
            {selectedCategory && (
              <Text
                style={{
                  position: 'absolute',
                  top: -hp(9),
                  left: wp(10),
                  backgroundColor: colors.white,
                  paddingHorizontal: wp(4),
                  fontSize: fontSize(10),
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                }}>
                Select Service Category
              </Text>
            )}

            <Text
              style={{
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                color: selectedCategory ? colors.pureBlack : '#999',
                flex: 1,
              }}>
              {selectedCategory
                ? typeof selectedCategory === 'string'
                  ? selectedCategory
                  : selectedCategory.name ||
                  selectedCategory.title ||
                  selectedCategory.categoryName ||
                  'Select Service Category'
                : 'Select Service Category'}
            </Text>

            <Image
              source={icons.bottom_Arrow_Icon}
              style={{
                width: hp(14),
                height: hp(14),
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>
        </View>

        <BorderShowLabelTextInputComponent
          label={'GSTIN or Registration Number'}
          value={gstNumber}
          onChangeText={setGstNumber}
          keyboardType="number-pad"
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'Contact Number'}
          value={contactNumber}
          onChangeText={handleContactNumberChange}
          keyboardType="number-pad"
          maxLength={10}
          editable={!hasPreviousMobile}
          multiline={false}
        />

        {!hasPreviousMobile && mobileVerified && (
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
              style={{ width: hp(15), height: hp(15), resizeMode: 'contain' }}
            />
            <Text
              style={{
                fontSize: fontSize(12),
                fontFamily: fontFamily.poppins500,
                color: '#22C55E',
                top: 1,
                marginLeft: wp(5),
              }}>
              Mobile Verified Successfully
            </Text>
          </View>
        )}

        <BorderShowLabelTextInputComponent
          label={'Enter your email address'}
          value={email}
          onChangeText={setEmail}
          editable={!hasPreviousEmail}
          multiline={false}
        />

        {!hasPreviousEmail && emailVerified && (
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
              style={{ width: hp(15), height: hp(15), resizeMode: 'contain' }}
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

        <View style={{ height: hp(120) }} />
      </ScrollView>

      {!keyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            alignItems: 'center',
            height: hp(90),
            backgroundColor: colors.white,
          }}>
          {!hasPreviousMobile && (contactNumber ?? '').toString().trim() !== '' && !mobileVerified ? (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={mobileVerifyLoading || uploadingImage}
              style={{
                width: '90%',
                height: hp(50),
                backgroundColor: colors.primaryColor,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                top: hp(10),
                opacity: mobileVerifyLoading || uploadingImage ? 0.6 : 1,
              }}
              onPress={() => {
                setVerifyType('mobile');
                handleVerifyMobile();
              }}>
              {mobileVerifyLoading ? (
                <ActivityIndicator color={colors.white} size="large" />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Verify Mobile Number
                </Text>
              )}
            </TouchableOpacity>
          ) : !hasPreviousEmail && email.trim() !== '' && !emailVerified ? (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={mobileVerifyLoading || uploadingImage}
              style={{
                width: '90%',
                height: hp(50),
                backgroundColor: colors.primaryColor,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                top: hp(10),
                opacity: mobileVerifyLoading || uploadingImage ? 0.6 : 1,
              }}
              onPress={() => {
                setVerifyType('email');
                handleVerifyEmail();
              }}>
              {mobileVerifyLoading ? (
                <ActivityIndicator color={colors.white} size="large" />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Verify Email Address
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading || uploadingImage}
              style={{
                width: '90%',
                height: hp(50),
                backgroundColor: colors.primaryColor,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                top: hp(10),
                opacity: loading || uploadingImage ? 0.6 : 1,
              }}
              onPress={handleGetStarted}>
              {loading ? (
                <ActivityIndicator color={colors.white} size="large" />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Get Started
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      <RBSheet
        ref={mobileSheetRef}
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
              style={{ width: hp(30), height: hp(30), resizeMode: 'contain' }}
            />

            <Text
              style={{
                marginTop: hp(10),
                fontSize: fontSize(18),
                color: '#22C55E',
                fontFamily: fontFamily.poppins600,
              }}>
              {verifyType === 'email'
                ? 'Email Verified Successfully'
                : 'Mobile Verified Successfully'}
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
              {verifyType === 'email'
                ? 'Verify Email Address'
                : 'Verify Mobile Number'}
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
              {verifyType === 'email' ? email : `+91 ${contactNumber}`}
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
                      otp.length === index ? colors.pureBlack : '#D9D9D9',
                  }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: '600',
                      color: colors.pureBlack,
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
              onPress={() => {
                if (verifyType === 'email') {
                  handleResendEmailOtp();
                } else {
                  handleResendMobileOtp();
                }
              }}
              disabled={mobileTimer > 0 || mobileVerifyLoading}
              style={{
                marginTop: hp(50),
                alignSelf: 'center',
              }}>
              {mobileVerifyLoading ? (
                <ActivityIndicator color={colors.primaryColor} size="large" />
              ) : (
                <Text
                  style={{
                    color: mobileTimer > 0 ? '#717171' : colors.pureBlack,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  {mobileTimer > 0
                    ? `Resend OTP in ${mobileTimer}s`
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
                backgroundColor:
                  otp.length === 4 ? colors.primaryColor : '#D9D9D9',
              }}
              onPress={async () => {
                setOtpLoading(true);
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

                  const payload = {
                    otp: otp,
                    type: verifyType,
                  };

                  console.log('Calling verifyUpdateOtp API with payload:', payload);
                  console.log('Authorization Token:', token ? `${token.substring(0, 25)}...` : 'NULL');

                  const response = await customerAuth.verifyUpdateOtp(
                    payload,
                    token || '',
                  );

                  console.log('verifyUpdateOtp Response:', response.data);

                  setOtpLoading(false);
                  setOtpVerified(true);

                  setTimeout(() => {
                    if (verifyType === 'email') {
                      setEmailVerified(true);
                    } else {
                      setMobileVerified(true);
                    }
                    setOtp('');

                    mobileSheetRef.current?.close();

                    setTimeout(() => {
                      setOtpVerified(false);
                    }, 300);
                  }, 1500);
                } catch (error) {
                  setOtpLoading(false);
                  const errorMsg =
                    error?.response?.data?.message ||
                    error?.response?.data?.msg ||
                    error?.message ||
                    'Verification failed';
                  console.log('verifyUpdateOtp Error:', error?.response?.data || error.message);
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

      {/* BOTTOM SHEET FOR SERVICE CATEGORIES */}
      <RBSheet
        ref={categorySheetRef}
        height={hp(420)}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(25),
            borderTopRightRadius: hp(25),
            paddingBottom: hp(20),
          },
          draggableIcon: {
            backgroundColor: '#D9D9D9',
            width: wp(45),
          },
        }}>
        <View style={{ paddingHorizontal: wp(20), flex: 1 }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(18),
              fontFamily: fontFamily.poppins600,
              marginBottom: hp(15),
              marginVertical: hp(20)
            }}>
            Select Service Category
          </Text>

          <View style={{ width: '100%', height: hp(1), backgroundColor: '#E6E6E6', marginBottom: hp(15) }} />

          {categoriesLoading ? (
            <ActivityIndicator
              color={colors.primaryColor}
              size="large"
              style={{ marginTop: hp(40) }}
            />
          ) : categoriesList.length === 0 ? (
            <Text
              style={{
                color: 'gray',
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                textAlign: 'center',
                marginTop: hp(40),
              }}>
              No categories found
            </Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {categoriesList.map((item, index) => {
                const categoryName =
                  typeof item === 'string'
                    ? item
                    : item.name || item.title || item.categoryName || '';
                const categoryId =
                  typeof item === 'string'
                    ? item
                    : item._id || item.id || index;
                const isSelected = Boolean(
                  selectedCategory &&
                  ((typeof selectedCategory === 'string' &&
                    selectedCategory === categoryName) ||
                    (item._id && selectedCategory._id === item._id) ||
                    (item.id && selectedCategory.id === item.id) ||
                    (selectedCategory.name &&
                      selectedCategory.name === categoryName)),
                );

                return (
                  <TouchableOpacity
                    key={categoryId.toString()}
                    activeOpacity={0.6}
                    onPress={() => handleSelectCategory(item)}
                    style={{
                      height: hp(48),
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottomWidth:
                        index !== categoriesList.length - 1 ? hp(1) : 0,
                      borderBottomColor: '#EEEEEE',
                    }}>
                    <Text
                      style={{
                        color: isSelected
                          ? colors.primaryColor
                          : colors.pureBlack,
                        fontSize: fontSize(14),
                        fontFamily: isSelected
                          ? fontFamily.poppins600
                          : fontFamily.poppins400,
                      }}>
                      {categoryName}
                    </Text>

                    <View
                      style={{
                        width: hp(20),
                        height: hp(20),
                        borderRadius: hp(10),
                        borderWidth: hp(1.5),
                        borderColor: isSelected
                          ? colors.primaryColor
                          : '#C7C7C7',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {isSelected && (
                        <View
                          style={{
                            width: hp(10),
                            height: hp(10),
                            borderRadius: hp(5),
                            backgroundColor: colors.primaryColor,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default VendorBasicInfoScreen;
