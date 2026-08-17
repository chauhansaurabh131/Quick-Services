import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Modal,
  PanResponder,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../utils/colors';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { icons } from '../../../assets';
import SwitchButton from '../../../components/switchButton';
import VendorHomeBookingComponent from '../../../components/vendorHomeBookingComponent';
import {
  getVendorUserDetails,
  updateVendorProfile,
} from '../../../actions/customerAuthActions';

const rangeOptions = [
  { distance: '1–5', fee: '100.00', percentage: 25, radius: 5 },
  { distance: '1–10', fee: '150.00', percentage: 62.5, radius: 10 },
  { distance: '1–15', fee: '200.00', percentage: 100, radius: 15 },
];

const VendorHomeScreen = () => {
  const dispatch = useDispatch();

  const { user, vendorUserDetails } = useSelector(state => state.auth || {});

  const reduxUser =
    user?.user || user?.data?.user || user?.vendorUser || user || {};

  const vendorUserId =
    reduxUser?._id ||
    reduxUser?.id ||
    user?._id ||
    user?.id ||
    user?._id ||
    user?.user?._id ||
    user?.user?.id ||
    user?.userId;

  // Sync fresh vendor details from API on home screen load
  useEffect(() => {
    if (vendorUserId) {
      dispatch(getVendorUserDetails(vendorUserId));
    }
  }, [vendorUserId, dispatch]);

  const currentRadius =
    user?.vendorUser?.serviceRadius ??
    user?.user?.serviceRadius ??
    user?.data?.vendorUser?.serviceRadius ??
    user?.data?.user?.serviceRadius ??
    user?.data?.serviceRadius ??
    user?.serviceRadius ??
    reduxUser?.serviceRadius ??
    vendorUserDetails?.vendorUser?.serviceRadius ??
    vendorUserDetails?.serviceRadius ??
    vendorUserDetails?.data?.serviceRadius;

  const hasKilometerSet = Boolean(
    currentRadius !== undefined &&
      currentRadius !== null &&
      Number(currentRadius) > 0,
  );

  const [online, setOnline] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const initialIndex = useRef(0);

  // Sync selectedRangeIndex with Redux serviceRadius if present
  useEffect(() => {
    if (currentRadius) {
      const idx = rangeOptions.findIndex(
        item => item.radius === Number(currentRadius),
      );
      if (idx !== -1) {
        setSelectedRangeIndex(idx);
      }
    }
  }, [currentRadius]);

  // Show modal ONLY if vendor has NOT set service radius / kilometer in API or Redux
  useFocusEffect(
    useCallback(() => {
      if (!hasKilometerSet && !currentRadius) {
        setModalVisible(true);
      } else {
        setModalVisible(false);
      }
    }, [hasKilometerSet, currentRadius]),
  );

  useEffect(() => {
    if (hasKilometerSet) {
      setModalVisible(false);
    }
  }, [hasKilometerSet]);

  // Disable hardware back button when modal is open and kilometer is NOT set
  useEffect(() => {
    const onBackPress = () => {
      if (modalVisible && !hasKilometerSet) {
        console.log(
          '[VendorHomeScreen] Back press disabled: Service radius / kilometer must be set first.',
        );
        return true; // Block hardware back action
      }
      return false; // Allow normal back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => backHandler.remove();
  }, [modalVisible, hasKilometerSet]);

  const handleConfirmArea = () => {
    const selectedOption = rangeOptions[selectedRangeIndex];
    const serviceRadius = selectedOption.radius;

    console.log('==================================================');
    console.log('[VendorHomeScreen] Dispatching updateVendorProfile');
    console.log('Payload:', { serviceRadius });
    console.log('PUT https://service.mntech.website/v1/vendor/vendorUser/update-profile');
    console.log('==================================================');

    setConfirmLoading(true);
    dispatch(
      updateVendorProfile({ serviceRadius }, (error, response) => {
        setConfirmLoading(false);
        if (error) {
          console.log('Error updating vendor profile serviceRadius:', error);
        } else {
          console.log('Vendor profile updated successfully:', response);
          setModalVisible(false);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {/* HEADER */}
      <View
        style={{
          height: hp(56),
          marginHorizontal: wp(18),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Image
          source={icons.doormigo_Icon}
          style={{ width: wp(62), height: hp(18), resizeMode: 'contain' }}
        />

        <TouchableOpacity>
          <Image
            source={icons.notification_Bell_Icon}
            style={{ width: hp(13), height: hp(16), resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{ width: '100%', height: hp(1), backgroundColor: '#EEEEEE' }}
      />

      {/* ONLINE/OFFLINE STATUS BOX */}
      <View style={{ marginHorizontal: wp(18), marginTop: hp(14) }}>
        <View
          style={{
            width: '100%',
            backgroundColor: '#FAFAFA',
            height: hp(76),
            borderRadius: hp(18),
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: wp(22),
            }}>
            <View>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                }}>
                Status : {online ? 'Online' : 'Offline'}
              </Text>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                }}>
                {online
                  ? 'Ready to accept booking'
                  : 'Currently not accepting bookings'}
              </Text>
            </View>

            <View style={{ top: 10 }}>
              <SwitchButton value={online} onChange={v => setOnline(v)} />
            </View>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <VendorHomeBookingComponent />
      </View>

      {/* SELECT SERVICE AREA MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          if (hasKilometerSet) {
            setModalVisible(false);
          } else {
            console.log(
              '[VendorHomeScreen] Modal close prevented: kilometer not set yet.',
            );
          }
        }}>
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
              {/* Interactive Touch & Drag Slider Track */}
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
                {/* Thin Background Track Line */}
                <View
                  style={{
                    width: '100%',
                    height: hp(4),
                    backgroundColor: '#EDE5FF',
                    borderRadius: hp(10),
                    overflow: 'hidden',
                  }}>
                  {/* Active Progress */}
                  <View
                    style={{
                      width: `${rangeOptions[selectedRangeIndex].percentage}%`,
                      height: '100%',
                      backgroundColor: '#731EE2',
                      borderRadius: hp(10),
                    }}
                  />
                </View>

                {/* Solid Purple Thumb Knob */}
                <View
                  style={{
                    position: 'absolute',
                    left: `${rangeOptions[selectedRangeIndex].percentage}%`,
                    transform: [{ translateX: -hp(14) }],
                    width: hp(28),
                    height: hp(28),
                    borderRadius: hp(14),
                    backgroundColor: '#731EE2',
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
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
                {/* Distance */}
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

                {/* Visit Fee */}
                <View style={{ alignItems: 'flex-end' }}>
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
              By confirming, you'll receive enquiries within your selected service radius, along with your configured site visit charges.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VendorHomeScreen;
