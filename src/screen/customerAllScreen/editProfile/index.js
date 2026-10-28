import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import RBSheet from 'react-native-raw-bottom-sheet';
import { updateUserCustomer, uploadProfilePic, verifyUpdateOtp, sendUpdateMobileOtp } from '../../../actions/customerAuthActions';
import { colors } from '../../../utils/colors';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { icons } from '../../../assets';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth || {});

  console.log('user========', user?.user);

  const reduxUser =
    user?.user ||
    user?.customerUser ||
    user?.data?.user ||
    user?.data?.customerUser ||
    user?.data ||
    user ||
    {};

  /* ── Stored mobile (from Redux) ─────────────────────────────────────── */
  const storedMobile =
    reduxUser?.mobileNumber != null
      ? String(reduxUser.mobileNumber)
      : reduxUser?.phone != null
        ? String(reduxUser.phone)
        : reduxUser?.mobile != null
          ? String(reduxUser.mobile)
          : reduxUser?.phoneNumber != null
            ? String(reduxUser.phoneNumber)
            : '';

  /* ─── state ─────────────────────────────────────────────────────────── */
  const [fullName, setFullName] = useState(
    reduxUser?.fullName ||
    reduxUser?.name ||
    reduxUser?.userName ||
    reduxUser?.customerName ||
    '',
  );
  const [mobile, setMobile] = useState(storedMobile);
  const [email, setEmail] = useState(
    String(reduxUser?.email || reduxUser?.userEmail || ''),
  );

  const [profileUri, setProfileUri] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ── OTP bottom-sheet state ─────────────────────────────────────────── */
  const otpSheetRef = useRef();
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  /* ── Mobile-changed flag ─────────────────────────────────────────────── */
  // true when user has typed a DIFFERENT 10-digit number than what's stored
  const isMobileChanged =
    storedMobile !== '' &&
    mobile.trim().length === 10 &&
    mobile.trim() !== storedMobile.trim();

  /* ─── profile photo pick ─────────────────────────────────────────────── */
  const handlePickPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      setProfileUri(asset.uri);
      setUploadingPhoto(true);

      dispatch(
        uploadProfilePic(
          {
            selectedUri: asset.uri,
            fileName: asset.fileName || `avatar-${Date.now()}.jpg`,
            contentType: asset.type || 'image/jpeg',
          },
          (err) => {
            setUploadingPhoto(false);
            if (err) {
              Alert.alert('Upload Failed', err?.message || 'Could not upload photo.');
            }
          },
        ),
      );
    });
  };

  /* ─── save profile (name + optional email) ───────────────────────────── */
  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Please enter your name.');
      return;
    }
    setSaving(true);
    // mobileNumber excluded — API requires countryCodeId alongside it
    const payload = {
      fullName: fullName.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
    };
    dispatch(
      updateUserCustomer(payload, (err) => {
        setSaving(false);
        if (err) {
          Alert.alert('Update Failed', err?.message || 'Could not update profile.');
        } else {
          Alert.alert('Success', 'Profile updated successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      }),
    );
  };

  /* ─── open OTP sheet — call update-user API with mobile to trigger OTP ── */
  const COUNTRY_CODE_ID = '6a420c2f668100ad2212e8ea';

  const handleVerifyNumberPress = () => {
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Please enter your name first.');
      return;
    }
    if (mobile.trim().length !== 10) {
      Alert.alert('Validation', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setSendingOtp(true);

    const payload = {
      fullName: fullName.trim(),
      mobileNumber: Number(mobile.trim()),
      countryCodeId: COUNTRY_CODE_ID,
      ...(email.trim() ? { email: email.trim() } : {}),
    };

    dispatch(
      sendUpdateMobileOtp(payload, (err) => {
        setSendingOtp(false);
        if (err) {
          Alert.alert(
            'Failed',
            err?.message || 'Could not send OTP. Please try again.',
          );
          return;
        }
        // API success — OTP sent to device; open OTP sheet.
        // mobileNumber is NOT yet changed in Redux state.
        setOtpDigits(['', '', '', '']);
        setFocusedOtpIndex(0);
        otpSheetRef.current?.open();
        setTimeout(() => otpRefs[0].current?.focus(), 350);
      }),
    );
  };

  /* ─── OTP digit change with auto-advance / backspace ─────────────────── */
  const handleOtpChange = (text, index) => {
    const updated = [...otpDigits];
    updated[index] = text;
    setOtpDigits(updated);

    if (text && index < 3) {
      setFocusedOtpIndex(index + 1);
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      setFocusedOtpIndex(index - 1);
      otpRefs[index - 1].current?.focus();
    }
  };

  /* ─── submit OTP — POST /customer/auth/verify-update-otp ────────────── */
  const handleVerifyOtp = () => {
    const otp = otpDigits.join('');
    if (otp.length < 4) {
      Alert.alert('Enter OTP', 'Please enter all 4 digits.');
      return;
    }
    setVerifyingOtp(true);
    dispatch(
      verifyUpdateOtp({ otp, type: 'mobile' }, (err) => {
        setVerifyingOtp(false);
        if (err) {
          Alert.alert(
            'Invalid OTP',
            err?.message || 'The OTP entered is incorrect. Please try again.',
          );
          return;
        }
        otpSheetRef.current?.close();
        Alert.alert('Success', 'Mobile number updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }),
    );
  };

  const avatarUri =
    profileUri ||
    (Array.isArray(reduxUser?.userProfilePic) && reduxUser.userProfilePic.length > 0
      ? reduxUser.userProfilePic[0]?.url || reduxUser.userProfilePic[0]
      : typeof reduxUser?.userProfilePic === 'string'
      ? reduxUser.userProfilePic
      : null) ||
    null;

  /* ─── button config ──────────────────────────────────────────────────── */
  const isNameEmpty = !fullName.trim();
  const primaryDisabled = saving || isNameEmpty;
  const primaryBg = saving
    ? '#A97FE9'
    : isNameEmpty
      ? '#C4B0E8'
      : '#731EE2';

  /* ─── render ─────────────────────────────────────────────────────────── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>

      {/* ── Header ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: wp(20),
          paddingVertical: hp(14),
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Image
            source={icons.back_Arrow_Icon}
            style={{
              width: hp(18),
              height: hp(18),
              resizeMode: 'contain',
              tintColor: colors.pureBlack,
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            color: colors.pureBlack,
            marginRight: hp(18),
          }}>
          Edit Profile
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={hp(10)}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: hp(28),
            paddingBottom: hp(24),
          }}>

          {/* ── Avatar ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePickPhoto}
            disabled={uploadingPhoto}
            style={{ alignSelf: 'center', marginBottom: hp(32) }}>
            {/* circle photo */}
            <View
              style={{
                width: hp(96),
                height: hp(96),
                borderRadius: hp(100),
                backgroundColor: '#E9E9E9',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {uploadingPhoto ? (
                <ActivityIndicator size="large" color="#731EE2" />
              ) : avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={icons.camera_Icon}
                  style={{ width: wp(28), height: hp(26), resizeMode: 'contain' }}
                />
              )}
            </View>

            {/* purple edit badge - only shown when an image is present */}
            {Boolean(avatarUri) && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: hp(28),
                  height: hp(28),
                  borderRadius: hp(50),
                  backgroundColor: '#731EE2',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: colors.white,
                }}>
                <Image
                  source={icons.edit_Icon}
                  style={{
                    width: hp(13),
                    height: hp(13),
                    resizeMode: 'contain',
                    tintColor: colors.white,
                  }}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* ── Fields ── */}
          <BorderShowLabelTextInputComponent
            label={'Full Name'}
            value={fullName}
            onChangeText={setFullName}
            multiline={false}
          />

          <BorderShowLabelTextInputComponent
            label={'Mobile Number'}
            value={mobile}
            onChangeText={val => setMobile(val.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={10}
            multiline={false}
          />

          {/* ── Changed-mobile hint ── */}
          {isMobileChanged && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: wp(20),
                marginTop: hp(5),
                marginBottom: hp(2),
              }}>
              <View
                style={{
                  width: hp(6),
                  height: hp(6),
                  borderRadius: hp(3),
                  backgroundColor: '#F59E0B',
                  marginRight: wp(6),
                }}
              />
              <Text
                style={{
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  color: '#F59E0B',
                  includeFontPadding: false,
                }}>
                New number – tap Verify Number to confirm
              </Text>
            </View>
          )}

          <BorderShowLabelTextInputComponent
            label={'Email'}
            value={email}
            onChangeText={setEmail}
            optional
            multiline={false}
            keyboardType="email-address"
          />
        </ScrollView>

        {/* ── Bottom Button ── */}
        <View
          style={{
            paddingHorizontal: wp(22),
            paddingBottom: hp(24),
            paddingTop: hp(10),
            backgroundColor: colors.white,
          }}>
          {isMobileChanged ? (
            /* ── Verify Number button ── */
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={sendingOtp}
              onPress={handleVerifyNumberPress}
              style={{
                width: '100%',
                height: hp(52),
                backgroundColor: sendingOtp ? '#D4930A' : '#F59E0B',
                borderRadius: hp(50),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {sendingOtp ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  Verify Number
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            /* ── Save Changes button ── */
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={primaryDisabled}
              onPress={handleSave}
              style={{
                width: '100%',
                height: hp(52),
                backgroundColor: primaryBg,
                borderRadius: hp(50),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>

      {/* ── OTP Verification Bottom Sheet ── */}
      <RBSheet
        ref={otpSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={hp(410)}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
          draggableIcon: {
            backgroundColor: '#E0E0E0',
            width: wp(40),
            height: hp(4),
          },
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            backgroundColor: '#FFFFFF',
            paddingHorizontal: wp(24),
            paddingTop: hp(12),
            paddingBottom: hp(28),
          },
        }}>

        <View style={{ alignItems: 'center', width: '100%' }}>

          {/* Title */}
          <Text
            style={{
              fontSize: fontSize(20),
              fontFamily: fontFamily.poppins700,
              color: '#111111',
              textAlign: 'center',
              marginTop: hp(4),
            }}>
            Verify Number
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: fontSize(13),
              fontFamily: fontFamily.poppins400,
              color: '#777777',
              textAlign: 'center',
              marginTop: hp(6),
              marginBottom: hp(28),
            }}>
            Enter the 4-digit OTP sent to +91 {mobile}
          </Text>

          {/* 4-digit OTP row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '80%',
              marginBottom: hp(32),
            }}>
            {[0, 1, 2, 3].map(index => {
              const isFocused = focusedOtpIndex === index;
              const hasValue = !!otpDigits[index];
              return (
                <View
                  key={index}
                  style={{ width: wp(54), alignItems: 'center' }}>
                  <TextInput
                    ref={otpRefs[index]}
                    value={otpDigits[index]}
                    onFocus={() => setFocusedOtpIndex(index)}
                    onChangeText={text => handleOtpChange(text, index)}
                    onKeyPress={e => handleOtpKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={{
                      fontSize: fontSize(24),
                      fontFamily: fontFamily.poppins700,
                      color: '#111111',
                      textAlign: 'center',
                      width: '100%',
                      height: hp(40),
                      padding: 0,
                    }}
                  />
                  {/* Underline bar */}
                  <View
                    style={{
                      width: '100%',
                      height: 2,
                      backgroundColor:
                        isFocused ? '#731EE2' : hasValue ? '#111111' : '#E0E0E0',
                      marginTop: hp(8),
                      borderRadius: 1,
                    }}
                  />
                </View>
              );
            })}
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={verifyingOtp}
            onPress={handleVerifyOtp}
            style={{
              backgroundColor: '#731EE2',
              width: '100%',
              height: hp(52),
              borderRadius: hp(50),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {verifyingOtp ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                }}>
                Confirm OTP
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={sendingOtp || verifyingOtp}
            onPress={handleVerifyNumberPress}
            style={{ marginTop: hp(16), padding: hp(4) }}>
            <Text
              style={{
                fontSize: fontSize(13),
                fontFamily: fontFamily.poppins500,
                color: '#731EE2',
              }}>
              Didn't receive OTP? Resend
            </Text>
          </TouchableOpacity>

        </View>
      </RBSheet>

    </SafeAreaView>
  );
};

export default EditProfileScreen;
