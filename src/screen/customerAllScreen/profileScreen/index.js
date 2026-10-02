import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {
  logoutUser,
  updateUserCustomer,
  uploadProfilePic,
} from '../../../actions/customerAuthActions';
import {resetLocation} from '../../../actions/locationActions';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useTranslation} from 'react-i18next';
import {s3Api} from '../../../apis';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const {user} = useSelector(state => state.auth || {});
  const [asyncImage, setAsyncImage] = useState(null);
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  console.log('userdata', user);

  const reduxUser =
    user?.user ||
    user?.customerUser ||
    user?.data?.user ||
    user?.data?.customerUser ||
    user?.data ||
    user ||
    {};

  const extractPicUrl = val => {
    if (!val) {
      return null;
    }
    if (Array.isArray(val) && val.length > 0) {
      const activePicObj = val.find(
        item => item && (item.isProfilePic === true || item.isProfile === true),
      );
      if (activePicObj) {
        const res = extractPicUrl(activePicObj);
        if (res) {
          return res;
        }
      }
      const lastItemRes = extractPicUrl(val[val.length - 1]);
      if (lastItemRes) {
        return lastItemRes;
      }

      const firstItemRes = extractPicUrl(val[0]);
      if (firstItemRes) {
        return firstItemRes;
      }

      return null;
    }

    if (typeof val === 'string' && val.trim().length > 0) {
      const trimmed = val.trim();
      if (
        trimmed === '[object Object]' ||
        trimmed === 'null' ||
        trimmed === 'undefined'
      ) {
        return null;
      }
      if (
        trimmed.startsWith('file://') ||
        trimmed.startsWith('content://') ||
        trimmed.startsWith('ph://') ||
        trimmed.startsWith('assets-library://')
      ) {
        return trimmed;
      }
      if (trimmed.startsWith('http://')) {
        return trimmed.replace('http://', 'https://');
      }
      if (trimmed.startsWith('https://')) {
        return trimmed;
      }
      if (
        !trimmed.startsWith('http') &&
        !trimmed.startsWith('/') &&
        trimmed.includes('.')
      ) {
        return `https://trendigo-s3.s3.amazonaws.com/${trimmed}`;
      }
      return trimmed;
    }

    if (typeof val === 'object' && val !== null) {
      return (
        extractPicUrl(val.url) ||
        extractPicUrl(val.fileUrl) ||
        extractPicUrl(val.location) ||
        extractPicUrl(val.uri) ||
        extractPicUrl(val.s3Url) ||
        extractPicUrl(val.publicUrl) ||
        extractPicUrl(val.profilePic) ||
        extractPicUrl(val.profileImage) ||
        null
      );
    }
    return null;
  };

  useEffect(() => {
    const loadStoragePic = async () => {
      try {
        const storedPic = await AsyncStorage.getItem('PROFILE_PIC');
        if (storedPic) {
          const extracted = extractPicUrl(storedPic);
          if (extracted) {
            setAsyncImage(extracted);
            return;
          }
        }
        const storedUser = await AsyncStorage.getItem('USER');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const pic = extractPicUrl(
            parsed?.profileImage ||
              parsed?.profilePic ||
              parsed?.userProfilePic ||
              parsed?.user?.profileImage ||
              parsed?.user?.profilePic,
          );
          if (pic) {
            setAsyncImage(pic);
          }
        }
      } catch (err) {}
    };
    loadStoragePic();
  }, []);

  const displayProfileImageUri =
    extractPicUrl(localProfileImage) ||
    extractPicUrl(reduxUser?.profilePic) ||
    extractPicUrl(reduxUser?.profileImage) ||
    extractPicUrl(reduxUser?.userProfilePic) ||
    extractPicUrl(user?.user?.profilePic) ||
    extractPicUrl(user?.user?.profileImage) ||
    extractPicUrl(user?.user?.userProfilePic) ||
    extractPicUrl(user?.customerUser?.profileImage) ||
    extractPicUrl(user?.customerUser?.profilePic) ||
    extractPicUrl(user?.data?.user?.profileImage) ||
    extractPicUrl(user?.data?.user?.profilePic) ||
    extractPicUrl(user?.profilePic) ||
    extractPicUrl(user?.profileImage) ||
    extractPicUrl(user?.userProfilePic) ||
    extractPicUrl(asyncImage);

  console.log('Resolved displayProfileImageUri:', displayProfileImageUri);

  const customerName =
    reduxUser?.fullName ||
    reduxUser?.name ||
    reduxUser?.userName ||
    reduxUser?.customerName ||
    user?.user?.fullName ||
    user?.user?.name ||
    user?.customerUser?.fullName ||
    user?.customerUser?.name ||
    user?.fullName ||
    user?.name ||
    'Rahul Sharma';

  const handleLogout = () => {
    Alert.alert(t('logout') || 'Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: t('logout') || 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('SELECTED_LOCATION');
          } catch (error) {
            console.log('Error clearing token on logout:', error);
          }
          dispatch(resetLocation());
          dispatch(logoutUser());
          navigation.reset({
            index: 0,
            routes: [{name: 'AccountTypeScreen'}],
          });
        },
      },
    ]);
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to select image');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const selectedUri = asset.uri;
        const fileName = asset.fileName || `customer-avatar-${Date.now()}.jpg`;
        const contentType = asset.type || 'image/jpeg';

        setLocalProfileImage(selectedUri);
        setUploadingImage(true);

        const payload = {
          selectedUri,
          fileName,
          contentType,
        };

        console.log(
          'Dispatching UPLOAD_PROFILE_PIC Redux Action with payload:',
          payload,
        );

        dispatch(
          uploadProfilePic(payload, (err, res) => {
            setUploadingImage(false);
            if (err) {
              console.log(
                'Error uploading profile picture via Redux/Saga:',
                err,
              );
              Alert.alert(
                'Upload Failed',
                err?.message || 'Failed to upload profile picture',
              );
            } else {
              console.log(
                'Profile picture uploaded successfully via Redux/Saga:',
                res,
              );
              const newUrl =
                res?.displayUrl ||
                res?.data?.profileImage ||
                res?.data?.profilePic;
              if (newUrl) {
                setLocalProfileImage(selectedUri || newUrl);
                setAsyncImage(newUrl);
                AsyncStorage.setItem('PROFILE_PIC', newUrl).catch(() => {});
              } else {
                setLocalProfileImage(selectedUri);
              }
            }
          }),
        );
      }
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <Text
        style={{
          color: colors.black,
          alignSelf: 'center',
          marginTop: hp(23),
          fontSize: fontSize(14),
          fontFamily: fontFamily.poppins400,
        }}>
        {t('profile')}
      </Text>

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
          <ActivityIndicator size="large" color="#731EE2" />
        ) : displayProfileImageUri ? (
          <Image
            key={displayProfileImageUri}
            source={{uri: displayProfileImageUri}}
            style={{width: '100%', height: '100%', borderRadius: hp(100)}}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={icons.camera_Icon}
            style={{width: wp(28), height: hp(26), resizeMode: 'contain'}}
          />
        )}
      </TouchableOpacity>

      <Text
        style={{
          color: colors.pureBlack,
          alignSelf: 'center',
          marginTop: hp(15),
          fontSize: fontSize(24),
          fontFamily: fontFamily.poppins600,
        }}>
        {customerName}
      </Text>

      <View
        style={{
          marginHorizontal: wp(25),
          marginTop: hp(15),
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('MyBookingScreen');
          }}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              {t('myBookings')}
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
              {t('paymentMethod')}
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
            navigation.navigate('ManageAddressesScreen');
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
              {t('manageAddresses')}
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
            navigation.navigate('MyReviewScreen');
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
              My Reviews
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
              {t('referEarn')}
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
            marginTop: hp(25),
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
              {t('helpSupport')}
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
            navigation.navigate('SettingScreen');
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
              {t('settings')}
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
          onPress={handleLogout}
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
              {t('logout')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
export default ProfileScreen;
