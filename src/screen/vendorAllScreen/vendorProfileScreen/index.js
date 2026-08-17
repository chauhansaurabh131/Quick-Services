import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  PanResponder,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {launchImageLibrary} from 'react-native-image-picker';
import {s3Api} from '../../../apis';
import {
  getVendorUserDetails,
  logoutUser,
  updateVendorProfile,
} from '../../../actions/customerAuthActions';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

const rangeOptions = [
  {distance: '1–5', fee: '100.00', percentage: 25, radius: 5},
  {distance: '1–10', fee: '150.00', percentage: 62.5, radius: 10},
  {distance: '1–15', fee: '200.00', percentage: 100, radius: 15},
];

const VendorProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {user, vendorUserDetails} = useSelector(state => state.auth || {});

  const reduxUser =
    user?.user || user?.data?.user || user?.vendorUser || user || {};

  const vendorUserId =
    reduxUser?._id ||
    reduxUser?.id ||
    user?._id ||
    user?.id ||
    user?.user?._id ||
    user?.user?.id;

  const [localProfileImage, setLocalProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Booking Area Modal States
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const initialIndex = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (vendorUserId) {
        dispatch(getVendorUserDetails(vendorUserId));
      }
    }, [vendorUserId, dispatch]),
  );

  const serviceRadius =
    user?.vendorUser?.serviceRadius ??
    user?.user?.vendorUser?.serviceRadius ??
    user?.user?.serviceRadius ??
    user?.data?.vendorUser?.serviceRadius ??
    user?.data?.user?.serviceRadius ??
    user?.data?.serviceRadius ??
    user?.serviceRadius ??
    reduxUser?.vendorUser?.serviceRadius ??
    reduxUser?.serviceRadius ??
    vendorUserDetails?.vendorUser?.serviceRadius ??
    vendorUserDetails?.serviceRadius ??
    vendorUserDetails?.data?.vendorUser?.serviceRadius ??
    vendorUserDetails?.data?.serviceRadius;

  const matchedOption = rangeOptions.find(
    item => item.radius === Number(serviceRadius),
  );

  const bookingAreaText = matchedOption
    ? `${matchedOption.distance} km`
    : serviceRadius
    ? `1–${serviceRadius} km`
    : '1–5 km';

  console.log(
    '[VendorProfileScreen] serviceRadius:',
    serviceRadius,
    '| bookingAreaText:',
    bookingAreaText,
  );

  useEffect(() => {
    if (serviceRadius) {
      const idx = rangeOptions.findIndex(
        item => item.radius === Number(serviceRadius),
      );
      if (idx !== -1) {
        setSelectedRangeIndex(idx);
      }
    }
  }, [serviceRadius]);

  const handleConfirmArea = () => {
    const selectedOption = rangeOptions[selectedRangeIndex];
    const newRadius = selectedOption.radius;
    setConfirmLoading(true);
    dispatch(
      updateVendorProfile({serviceRadius: newRadius}, (error, response) => {
        setConfirmLoading(false);
        if (error) {
          console.log('Error updating serviceRadius:', error);
        } else {
          console.log('ServiceRadius updated successfully:', response);
          setAreaModalVisible(false);
        }
      }),
    );
  };

  const handleTrackPress = evt => {
    const clickX = evt.nativeEvent.locationX;
    if (trackWidth > 0) {
      const ratio = clickX / trackWidth;
      if (ratio < 0.45) {
        setSelectedRangeIndex(0);
      } else if (ratio < 0.8) {
        setSelectedRangeIndex(1);
      } else {
        setSelectedRangeIndex(2);
      }
    } else {
      setSelectedRangeIndex(prev => (prev + 1) % rangeOptions.length);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialIndex.current = selectedRangeIndex;
      },
      onPanResponderMove: (evt, gestureState) => {
        const stepWidth = trackWidth > 0 ? trackWidth / 3 : 70;
        const stepsMoved = Math.round(gestureState.dx / stepWidth);
        const nextIndex = Math.max(
          0,
          Math.min(2, initialIndex.current + stepsMoved),
        );
        setSelectedRangeIndex(nextIndex);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const stepWidth = trackWidth > 0 ? trackWidth / 3 : 70;
        const stepsMoved = Math.round(gestureState.dx / stepWidth);
        const nextIndex = Math.max(
          0,
          Math.min(2, initialIndex.current + stepsMoved),
        );
        setSelectedRangeIndex(nextIndex);
      },
    }),
  ).current;

  const rawPic =
    reduxUser?.profilePic ||
    reduxUser?.profileImage ||
    reduxUser?.userProfilePic ||
    user?.profilePic ||
    user?.profileImage ||
    user?.user?.profilePic ||
    user?.user?.profileImage ||
    vendorUserDetails?.profilePic ||
    vendorUserDetails?.profileImage ||
    vendorUserDetails?.data?.profilePic ||
    vendorUserDetails?.data?.profileImage;

  const profileImageUri =
    typeof rawPic === 'string'
      ? rawPic
      : Array.isArray(rawPic) && rawPic.length > 0
      ? rawPic[0]?.url ||
        rawPic[0]?.location ||
        rawPic[0]?.fileUrl ||
        (typeof rawPic[0] === 'string' ? rawPic[0] : null)
      : typeof rawPic === 'object' && rawPic !== null
      ? rawPic.url || rawPic.location || rawPic.fileUrl
      : 'https://images.unsplash.com/photo-1560066984-138dadb4c035';

  const vendorTitle =
    reduxUser?.businessName ||
    reduxUser?.business_name ||
    user?.businessName ||
    reduxUser?.fullName ||
    reduxUser?.name ||
    user?.fullName ||
    user?.name ||
    vendorUserDetails?.businessName ||
    vendorUserDetails?.name ||
    vendorUserDetails?.fullName ||
    'Vendor Profile';

  const ratingValue = reduxUser?.rating || vendorUserDetails?.rating || '4.6';

  const reviewsCountValue =
    reduxUser?.totalReviews ||
    reduxUser?.reviewsCount ||
    vendorUserDetails?.totalReviews ||
    '120';

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to select image');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const selectedUri = asset.uri;
        const fileName = asset.fileName || `vendor-avatar-${Date.now()}.jpg`;
        const contentType = asset.type || 'image/jpeg';

        setLocalProfileImage(selectedUri);
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
              user?.tokens?.access;
            if (typeof rawToken === 'object' && rawToken !== null) {
              rawToken = rawToken.token || rawToken.accessToken;
            }
            token = typeof rawToken === 'string' ? rawToken : null;
          }

          const s3Payload = {
            key: fileName,
            contentType: contentType,
            profileType: 'profileImage',
            isProfilePic: true,
            caption: 'Vendor Profile Picture',
          };

          const apiRes = await s3Api.getProfilePicUploadUrl(
            s3Payload,
            token || '',
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
            const imageBlobRes = await fetch(selectedUri);
            const blob = await imageBlobRes.blob();

            let s3UploadRes = await fetch(presignedUploadUrl, {
              method: 'PUT',
              headers: {'Content-Type': contentType},
              body: blob,
            });

            if (!s3UploadRes.ok && s3UploadRes.status === 403) {
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
              throw new Error(
                `S3 PUT upload failed with status ${s3UploadRes.status}`,
              );
            }
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

          dispatch(
            updateVendorProfile(
              {profilePic: displayUrl, profileImage: displayUrl},
              (err, res) => {
                setUploadingImage(false);
                if (err) {
                  console.log('Error updating vendor profile picture:', err);
                } else {
                  console.log('Successfully updated profile picture:', res);
                }
              },
            ),
          );
        } catch (uploadError) {
          console.log('S3 Upload Error:', uploadError);
          setUploadingImage(false);
          Alert.alert(
            'Upload Error',
            uploadError?.message || 'Failed to upload image',
          );
        }
      }
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('token');
          } catch (error) {
            console.log('Error clearing token on logout:', error);
          }
          dispatch(logoutUser());
          navigation.reset({
            index: 0,
            routes: [{name: 'AccountTypeScreen'}],
          });
        },
      },
    ]);
  };

  const appVersion = DeviceInfo.getVersion();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* HEADER */}
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
          Profile
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{paddingBottom: hp(200)}}>
        {/* Profile Image with Black Circular Edit Button Badge */}
        <View
          style={{
            alignSelf: 'center',
            marginTop: hp(20),
            position: 'relative',
          }}>
          <Image
            source={{
              uri: localProfileImage || profileImageUri,
            }}
            style={{
              width: hp(120),
              height: hp(120),
              resizeMode: 'cover',
              borderRadius: hp(60),
            }}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openGallery}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: hp(38),
              height: hp(38),
              borderRadius: hp(19),
              backgroundColor: '#000000',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.white,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3,
            }}>
            {uploadingImage ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Image
                source={icons.edit_Icon}
                style={{
                  width: hp(16),
                  height: hp(16),
                  resizeMode: 'contain',
                  tintColor: colors.white,
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Vendor Business Title */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: hp(35),
          }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(24),
              fontFamily: fontFamily.poppins600,
            }}>
            {vendorTitle}
          </Text>
          <Image
            source={icons.verified_Icon}
            style={{
              width: hp(16),
              height: hp(16),
              resizeMode: 'contain',
              marginLeft: wp(9),
              top: -2,
            }}
          />
        </View>

        {/* Rating Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Image
            source={icons.star_Icon}
            style={{
              width: hp(13),
              height: hp(13),
              resizeMode: 'contain',
              top: -2,
              marginRight: wp(7),
            }}
          />
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}>
            {ratingValue} ({reviewsCountValue} Reviews)
          </Text>
        </View>

        <View style={{marginHorizontal: wp(18)}}>
          {/* Top Divider */}
          <View
            style={{
              width: '100%',
              height: hp(1),
              backgroundColor: '#E3E3E3',
              marginTop: hp(25),
            }}
          />

          {/* BOOKING AREA ROW */}
          <TouchableOpacity
            onPress={() => setAreaModalVisible(true)}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(22),
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
                Booking Area
              </Text>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins700,
                  marginRight: wp(10),
                }}>
                {bookingAreaText}
              </Text>

              <Image
                source={icons.bottom_Arrow_Icon}
                style={{
                  width: hp(9),
                  height: hp(6),
                  resizeMode: 'contain',
                  transform: [{rotate: '-90deg'}],
                }}
              />
            </View>
          </TouchableOpacity>

          {/* SECTION HEADER: BUSINESS SETTINGS */}
          <Text
            style={{
              color: '#A9A9A9',
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              marginTop: hp(32),
            }}>
            Business Settings
          </Text>

          {/* Business Profile */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('VendorBasicInfoScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(23),
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
                Business Profile
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

          {/* Manage Services & Pricing */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('VendorServiceAndPricingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(27),
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
                Manage Services & Pricing
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

          {/* Working Hours */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('VendorWorkingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(27),
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
                Working Hours
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

          {/* Bank Details */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('VendorBankDetailsPayoutsScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(27),
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
                Bank Details
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

          {/* Earnings & History */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('VendorApp', {screen: 'Earnings'});
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(27),
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
                Earnings & History
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

          <Text
            style={{
              color: '#A9A9A9',
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              marginTop: hp(35),
            }}>
            Operation
          </Text>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('VendorReviewsFeedbackScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(23),
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
                Review & Feedback
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
              marginTop: hp(27),
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
                Support & FAQs
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
              navigation.navigate('VendorSecuritySettingsScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(27),
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
                Security Settings
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
                Logout
              </Text>
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: '#737373',
              fontSize: fontSize(13),
              fontFamily: fontFamily.poppins400,
              marginTop: hp(41),
              alignSelf: 'center',
              marginBottom: hp(31),
            }}>
            v{appVersion} Build 2026
          </Text>
        </View>
      </ScrollView>

      {/* SELECT SERVICE AREA MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={areaModalVisible}
        onRequestClose={() => setAreaModalVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: wp(20),
          }}>
          <View
            style={{
              width: '100%',
              backgroundColor: colors.white,
              borderRadius: hp(24),
              paddingHorizontal: wp(20),
              paddingVertical: hp(26),
              alignItems: 'center',
            }}>
            {/* Title */}
            <Text
              style={{
                fontSize: fontSize(20),
                fontFamily: fontFamily.poppins700,
                color: colors.pureBlack,
                textAlign: 'center',
                marginTop: hp(4),
              }}>
              Select Service Area
            </Text>

            {/* Slider Section */}
            <View
              style={{
                width: '100%',
                marginTop: hp(40),
                marginBottom: hp(20),
              }}>
              {/* Interactive Track */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleTrackPress}
                onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
                {...panResponder.panHandlers}
                style={{
                  width: '100%',
                  height: hp(36),
                  justifyContent: 'center',
                  paddingVertical: hp(6),
                }}>
                <View
                  style={{
                    width: '100%',
                    height: hp(4),
                    backgroundColor: '#EDE5FF',
                    borderRadius: hp(10),
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      width: `${rangeOptions[selectedRangeIndex].percentage}%`,
                      height: '100%',
                      backgroundColor: '#731EE2',
                      borderRadius: hp(10),
                    }}
                  />
                </View>

                <View
                  style={{
                    position: 'absolute',
                    left: `${rangeOptions[selectedRangeIndex].percentage}%`,
                    transform: [{translateX: -hp(14)}],
                    width: hp(28),
                    height: hp(28),
                    borderRadius: hp(14),
                    backgroundColor: '#731EE2',
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                  }}
                />
              </TouchableOpacity>

              {/* Labels Row Below Slider */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginTop: hp(20),
                }}>
                <View>
                  <Text
                    style={{
                      fontSize: fontSize(22),
                      fontFamily: fontFamily.poppins700,
                      color: colors.pureBlack,
                    }}>
                    {rangeOptions[selectedRangeIndex].distance}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize(12),
                      fontFamily: fontFamily.poppins400,
                      color: '#9E9E9E',
                      marginTop: hp(2),
                    }}>
                    Kilometers
                  </Text>
                </View>

                <View style={{alignItems: 'flex-end'}}>
                  <Text
                    style={{
                      fontSize: fontSize(22),
                      fontFamily: fontFamily.poppins700,
                      color: colors.pureBlack,
                    }}>
                    {rangeOptions[selectedRangeIndex].fee}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize(12),
                      fontFamily: fontFamily.poppins400,
                      color: '#9E9E9E',
                      marginTop: hp(2),
                    }}>
                    You'll receive the visit fee.
                  </Text>
                </View>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={confirmLoading}
              onPress={handleConfirmArea}
              style={{
                width: '100%',
                height: hp(50),
                backgroundColor: '#731EE2',
                borderRadius: hp(16),
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp(10),
              }}>
              {confirmLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  Confirm
                </Text>
              )}
            </TouchableOpacity>

            {/* Subtext */}
            <Text
              style={{
                fontSize: fontSize(12),
                fontFamily: fontFamily.poppins400,
                color: '#4B4B4B',
                textAlign: 'center',
                marginTop: hp(18),
                paddingHorizontal: wp(6),
                lineHeight: hp(18),
              }}>
              By confirming, you'll receive enquiries within your selected
              service radius, along with your configured site visit charges.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VendorProfileScreen;
