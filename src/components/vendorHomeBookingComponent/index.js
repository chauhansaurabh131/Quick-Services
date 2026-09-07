import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  DeviceEventEmitter,
  Modal,
  Vibration,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import {fontFamily, fontSize, hp, wp} from '../../utils/helpers';
import {icons, images} from '../../assets';
import {colors} from '../../utils/colors';
import {
  getVendorBookings,
  acceptVendorBooking,
  cancelVendorBooking,
  vendorSendOtp,
  vendorResendOtp,
  vendorVerifyOtp,
} from '../../actions/customerAuthActions';
import Video from 'react-native-video';

const VendorHomeBookingComponent = ({
  bookingsList,
  onAcceptPress,
  onDeclinePress,
  onCancelPress,
  onCompletePress,
  activeTab,
  onTabChange,
}) => {
  const dispatch = useDispatch();
  const refRBSheet = useRef();
  const refOtpRBSheet = useRef();
  const [selectedCancelItem, setSelectedCancelItem] = useState(null);
  const [selectedCompleteItem, setSelectedCompleteItem] = useState(null);
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState(0);

  const [sendingOtpId, setSendingOtpId] = useState(null);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);

  const otpRef0 = useRef();
  const otpRef1 = useRef();
  const otpRef2 = useRef();
  const otpRef3 = useRef();

  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [otpTimer]);
  const {user, vendorBookings} = useSelector(state => state.auth || {});

  const reduxUser =
    user?.user || user?.data?.user || user?.vendorUser || user || {};

  const vendorUserId =
    reduxUser?.vendorUser?._id ||
    reduxUser?.vendorUser?.id ||
    reduxUser?.vendorId?._id ||
    reduxUser?.vendorId?.id ||
    reduxUser?._id ||
    reduxUser?.id ||
    user?.vendorUser?._id ||
    user?.vendorUser?.id ||
    user?._id ||
    user?.id ||
    '6a7320cb3577104793b1929b';

  const [internalTab, setInternalTab] = useState('new');
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [removedBookingIds, setRemovedBookingIds] = useState([]);
  const [incomingModalVisible, setIncomingModalVisible] = useState(false);
  const [incomingBookingItem, setIncomingBookingItem] = useState(null);
  const [dismissedBookingIds, setDismissedBookingIds] = useState([]);
  const [hasShownInitialModal, setHasShownInitialModal] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const ringbellPlayerRef = useRef(null);
  const selectedTab = activeTab || internalTab;

  const isValidObjectId = val =>
    typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val.trim());

  const getMongoBookingId = item => {
    if (!item) {
      return null;
    }
    const candidates = [
      item?.id,
      item?._id,
      item?.bookingId,
      item?.mongoBookingId,
      item?.bookingId?._id,
      item?.bookingId?.id,
      item?.data?._id,
      item?.data?.id,
    ];

    for (const cand of candidates) {
      if (isValidObjectId(cand)) {
        return String(cand).trim();
      }
    }

    const firstStr = candidates.find(
      c => typeof c === 'string' && c.trim().length > 0,
    );
    return firstStr ? String(firstStr).trim() : null;
  };

  const handleAcceptPress = item => {
    if (onAcceptPress) {
      onAcceptPress(item);
    }
    const bookingId = getMongoBookingId(item);
    if (!bookingId) {
      console.log(
        '[VendorHomeBookingComponent] No valid booking ID found to accept.',
      );
      return;
    }

    setAcceptingId(bookingId);
    dispatch(
      acceptVendorBooking(bookingId, (err, res) => {
        setAcceptingId(null);
        if (err) {
          console.log(
            '[VendorHomeBookingComponent] acceptVendorBooking Error:',
            err,
          );
          Alert.alert(
            'Error',
            err?.message || err?.msg || 'Failed to accept booking.',
          );
        } else {
          console.log(
            '[VendorHomeBookingComponent] acceptVendorBooking Success:',
            res,
          );
          setRemovedBookingIds(prev =>
            [...prev, bookingId, item?._id, item?.id].filter(Boolean),
          );
          if (vendorUserId) {
            dispatch(getVendorBookings(vendorUserId, 'panding'));
            dispatch(getVendorBookings(vendorUserId, 'accepted'));
          }
        }
      }),
    );
  };

  const handleDeclinePress = item => {
    setSelectedCancelItem(item);
    refRBSheet.current?.open();
  };

  const handleSelectCancelReason = selectedReason => {
    refRBSheet.current?.close();
    if (!selectedCancelItem) {
      return;
    }

    const bookingId = getMongoBookingId(selectedCancelItem);
    if (!bookingId) {
      console.log(
        '[VendorHomeBookingComponent] No valid booking ID found to cancel.',
      );
      return;
    }

    setCancellingId(bookingId);
    dispatch(
      cancelVendorBooking(bookingId, selectedReason, (err, res) => {
        setCancellingId(null);
        if (err) {
          console.log(
            '[VendorHomeBookingComponent] cancelVendorBooking Error:',
            err,
          );
          Alert.alert(
            'Error',
            err?.message || err?.msg || 'Failed to cancel booking.',
          );
        } else {
          console.log(
            '[VendorHomeBookingComponent] cancelVendorBooking Success:',
            res,
          );
          setRemovedBookingIds(prev =>
            [
              ...prev,
              bookingId,
              selectedCancelItem?._id,
              selectedCancelItem?.id,
            ].filter(Boolean),
          );
          if (vendorUserId) {
            dispatch(getVendorBookings(vendorUserId, 'panding'));
            dispatch(getVendorBookings(vendorUserId, 'cancelled'));
          }
          if (onDeclinePress) {
            onDeclinePress(selectedCancelItem, selectedReason);
          }
        }
      }),
    );
  };

  const handleCompleteButtonPress = item => {
    const bookingId = getMongoBookingId(item);
    if (!bookingId) {
      console.log(
        '[VendorHomeBookingComponent] No valid booking ID found for complete OTP.',
      );
      return;
    }

    setSendingOtpId(bookingId);
    dispatch(
      vendorSendOtp(bookingId, (err, res) => {
        setSendingOtpId(null);
        if (err) {
          console.log('[VendorHomeBookingComponent] vendorSendOtp Error:', err);
          Alert.alert(
            'Error',
            err?.message || err?.msg || 'Failed to send OTP to customer.',
          );
        } else {
          console.log(
            '[VendorHomeBookingComponent] vendorSendOtp Success:',
            res,
          );
          setSelectedCompleteItem(item);
          setOtpInput(['', '', '', '']);
          setFocusedOtpIndex(0);
          setOtpTimer(30);
          refOtpRBSheet.current?.open();
        }
      }),
    );
  };

  const handleResendOtp = () => {
    if (otpTimer > 0 || resendingOtp) {
      return;
    }
    const bookingId = getMongoBookingId(selectedCompleteItem);
    if (!bookingId) {
      return;
    }

    setResendingOtp(true);
    dispatch(
      vendorResendOtp(bookingId, (err, res) => {
        setResendingOtp(false);
        if (err) {
          console.log(
            '[VendorHomeBookingComponent] vendorResendOtp Error:',
            err,
          );
          Alert.alert(
            'Error',
            err?.message || err?.msg || 'Failed to resend OTP.',
          );
        } else {
          console.log(
            '[VendorHomeBookingComponent] vendorResendOtp Success:',
            res,
          );
          setOtpTimer(30);
          setOtpInput(['', '', '', '']);
          setFocusedOtpIndex(0);
          Alert.alert('Success', 'OTP resent to customer successfully.');
        }
      }),
    );
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otpInput.join('');
    if (enteredOtp.length < 4) {
      Alert.alert('Error', 'Please enter complete 4-digit OTP.');
      return;
    }
    const bookingId = getMongoBookingId(selectedCompleteItem);
    if (!bookingId) {
      return;
    }

    setVerifyingOtp(true);
    dispatch(
      vendorVerifyOtp(bookingId, enteredOtp, (err, res) => {
        setVerifyingOtp(false);
        if (err) {
          console.log(
            '[VendorHomeBookingComponent] vendorVerifyOtp Error:',
            err,
          );
          Alert.alert('Error', err?.message || err?.msg || 'Invalid OTP.');
        } else {
          console.log(
            '[VendorHomeBookingComponent] vendorVerifyOtp Success:',
            res,
          );
          refOtpRBSheet.current?.close();
          setRemovedBookingIds(prev =>
            [
              ...prev,
              bookingId,
              selectedCompleteItem?._id,
              selectedCompleteItem?.id,
            ].filter(Boolean),
          );
          if (vendorUserId) {
            dispatch(getVendorBookings(vendorUserId, 'accepted'));
          }
          if (onCompletePress) {
            onCompletePress(selectedCompleteItem, enteredOtp);
          }
        }
      }),
    );
  };

  const cancellationReasons = [
    'Customer unavailable',
    'Incorrect customer address',
    'Service not available',
    'Required service unavailable',
    'Price not agreed',
    'Customer requested cancellation',
    'Outside service area',
    'Schedule conflict',
    'Unable to reach customer',
    'Required materials unavailable',
    'Emergency / personal reason',
    'Duplicate order',
  ];

  const statusMap = {
    new: 'panding',
    confirmed: 'accepted',
    cancelled: 'cancelled',
  };

  const currentStatusQuery = statusMap[selectedTab] || 'panding';

  // 1. Fetch bookings when selected tab or vendorUserId updates
  const fetchBookings = useCallback(
    (statusToFetch = currentStatusQuery) => {
      if (vendorUserId) {
        setFetchingBookings(true);
        dispatch(
          getVendorBookings(vendorUserId, statusToFetch, (err, res) => {
            setFetchingBookings(false);
          }),
        );
      }
    },
    [dispatch, vendorUserId, currentStatusQuery],
  );

  useEffect(() => {
    fetchBookings(currentStatusQuery);
  }, [fetchBookings, currentStatusQuery]);

  const getLatestPendingItem = list => {
    if (!Array.isArray(list) || list.length === 0) {
      return null;
    }
    const sorted = [...list].sort((a, b) => {
      const timeA = new Date(a?.createdAt || a?.bookingDate || 0).getTime();
      const timeB = new Date(b?.createdAt || b?.bookingDate || 0).getTime();
      return timeB - timeA;
    });
    return sorted[0] || list[0];
  };

  const handleCloseIncomingModal = useCallback(() => {
    Vibration.cancel();
    const pandingRaw = vendorBookings?.panding || vendorBookings?.new || [];
    const pandingList = Array.isArray(pandingRaw)
      ? pandingRaw
      : Array.isArray(pandingRaw?.bookings)
      ? pandingRaw.bookings
      : Array.isArray(pandingRaw?.data)
      ? pandingRaw.data
      : [];

    const allPendingIds = pandingList
      .map(item => getMongoBookingId(item) || item?._id || item?.id)
      .filter(Boolean);

    setDismissedBookingIds(prev => [...new Set([...prev, ...allPendingIds])]);
    setIncomingModalVisible(false);
  }, [vendorBookings]);

  // 2. Listen to live Push Notifications -> Auto-refresh 'panding' & show ONLY the newest incoming booking modal
  useEffect(() => {
    const notificationListener = DeviceEventEmitter.addListener(
      'FCM_BOOKING_NOTIFICATION_RECEIVED',
      remoteMessage => {
        console.log(
          '\n==================================================',
          '\n[VendorHomeBookingComponent] New Push Notification received!',
          '\nFetching latest pending booking to display modal...',
          '\n==================================================\n',
        );
        if (vendorUserId) {
          dispatch(
            getVendorBookings(vendorUserId, 'panding', (err, res) => {
              const resData = res?.data || res;
              const list = Array.isArray(resData)
                ? resData
                : Array.isArray(resData?.bookings)
                ? resData.bookings
                : Array.isArray(resData?.data)
                ? resData.data
                : [];
              if (list.length > 0) {
                const newestItem = getLatestPendingItem(list);
                setIncomingBookingItem(newestItem);
                setIncomingModalVisible(true);
              }
            }),
          );
        }
      },
    );

    return () => notificationListener.remove();
  }, [dispatch, vendorUserId]);

  // 3. Periodic polling every 12 seconds to load fresh customer order requests live
  useEffect(() => {
    if (!vendorUserId) {
      return;
    }
    const interval = setInterval(() => {
      dispatch(getVendorBookings(vendorUserId, 'panding'));
      if (currentStatusQuery !== 'panding') {
        dispatch(getVendorBookings(vendorUserId, currentStatusQuery));
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [dispatch, vendorUserId, currentStatusQuery]);

  // 4. Auto-detect ONLY the single latest pending request when app opens/loads
  useEffect(() => {
    if (hasShownInitialModal) {
      return;
    }

    const pandingRaw = vendorBookings?.panding || vendorBookings?.new || [];
    const pandingList = Array.isArray(pandingRaw)
      ? pandingRaw
      : Array.isArray(pandingRaw?.bookings)
      ? pandingRaw.bookings
      : Array.isArray(pandingRaw?.data)
      ? pandingRaw.data
      : [];

    if (pandingList.length === 0) {
      return;
    }

    const latestItem = getLatestPendingItem(pandingList);
    const bId =
      getMongoBookingId(latestItem) || latestItem?._id || latestItem?.id;

    if (
      bId &&
      !removedBookingIds.includes(bId) &&
      !dismissedBookingIds.includes(bId)
    ) {
      setIncomingBookingItem(latestItem);
      setIncomingModalVisible(true);
      setHasShownInitialModal(true);
    }
  }, [
    vendorBookings,
    hasShownInitialModal,
    removedBookingIds,
    dismissedBookingIds,
  ]);

  // 5. Continuous 30-second vibration ringtone audio alert and countdown timer
  useEffect(() => {
    let timerId = null;

    if (incomingModalVisible && incomingBookingItem) {
      console.log(
        '[VendorHomeBookingComponent] Incoming Modal Opened -> Starting 30s call ringtone sound & vibration alert...',
      );

      // Start continuous repeating vibration pattern
      Vibration.vibrate([600, 1000, 600, 1000, 600, 1000], true);
      setCountdownSeconds(30);

      timerId = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            Vibration.cancel();
            console.log(
              '[VendorHomeBookingComponent] 30s timer expired -> Auto-closing incoming modal',
            );
            handleCloseIncomingModal();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      Vibration.cancel();
    }

    return () => {
      Vibration.cancel();
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [incomingModalVisible, incomingBookingItem, handleCloseIncomingModal]);

  const handleTabChange = tab => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const apiBookingsRaw =
    vendorBookings?.[currentStatusQuery] || vendorBookings?.[selectedTab] || [];

  const rawList = Array.isArray(apiBookingsRaw)
    ? apiBookingsRaw
    : Array.isArray(apiBookingsRaw?.bookings)
    ? apiBookingsRaw.bookings
    : Array.isArray(apiBookingsRaw?.data)
    ? apiBookingsRaw.data
    : [];

  const apiBookingsList = rawList.filter(item => {
    if (selectedTab === 'confirmed') {
      return true;
    }
    const mongoId = getMongoBookingId(item);
    const rawId = item?._id || item?.id;
    return (
      !removedBookingIds.includes(mongoId) && !removedBookingIds.includes(rawId)
    );
  });

  const dataToDisplay =
    Array.isArray(bookingsList) && bookingsList.length > 0
      ? bookingsList
      : apiBookingsList;

  const renderEmptyComponent = () => {
    if (fetchingBookings) {
      return (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: hp(220),
          }}>
          <ActivityIndicator
            size="large"
            color={colors.primaryColor || '#731EE2'}
          />
        </View>
      );
    }

    const emptySubtext = {
      new: 'No Booking Available',
      confirmed: 'No confirmed bookings at the moment.',
      cancelled: 'No cancelled bookings at the moment.',
    };

    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: hp(130),
          paddingHorizontal: wp(20),
        }}>
        <View
          style={{
            width: hp(89),
            height: hp(89),
            borderRadius: hp(50),
            backgroundColor: '#F8F4FF',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: hp(20),
          }}>
          <Image
            source={icons.booking_Calendar_Icon}
            style={{
              width: hp(38),
              height: hp(41),
              resizeMode: 'contain',
              tintColor: '#731EE2',
            }}
          />
        </View>
        <Text
          style={{
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            color: colors.pureBlack,
            textAlign: 'center',
          }}>
          {/*No Data Found*/}
          {emptySubtext[selectedTab] || 'No bookings found.'}
        </Text>
        {/*<Text*/}
        {/*  style={{*/}
        {/*    fontSize: fontSize(13),*/}
        {/*    fontFamily: fontFamily.poppins400,*/}
        {/*    color: '#8E8E8E',*/}
        {/*    textAlign: 'center',*/}
        {/*    marginTop: hp(4),*/}
        {/*  }}>*/}
        {/*  {emptySubtext[selectedTab] || 'No bookings found.'}*/}
        {/*</Text>*/}
      </View>
    );
  };

  const getItemTitle = item => {
    let raw =
      item?.serviceName ||
      item?.serviceNames ||
      (Array.isArray(item?.serviceIds) && item.serviceIds.length > 0
        ? item.serviceIds[0]?.title ||
          item.serviceIds[0]?.name ||
          item.serviceIds[0]
        : null) ||
      item?.serviceDetails?.title ||
      item?.serviceDetails?.name ||
      item?.serviceTitle ||
      item?.notes ||
      item?.title ||
      'Hair Cut';

    if (typeof raw === 'object' && raw !== null) {
      raw = raw.title || raw.name || raw.rawTitle || 'Hair Cut';
    }

    const str = String(raw || '').trim();

    if (str.includes(',')) {
      const first = str.split(',')[0].trim();
      return first || 'Hair Cut';
    }

    return str || 'Hair Cut';
  };

  const getItemLocation = item =>
    item?.addressId?.displayAddress ||
    item?.addressId?.address ||
    item?.address ||
    item?.location ||
    'Dumas Rd, Magdalla,';

  const getItemCustomerName = item =>
    item?.customerId?.fullName ||
    item?.customerId?.name ||
    item?.customerName ||
    item?.name ||
    'Rakesh Shukla';

  const monthsShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const formatDisplayDate = rawDateStr => {
    if (!rawDateStr) {
      return '';
    }
    const str = String(rawDateStr).trim();

    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      const yearShort = y.slice(-2);
      const monthName = monthsShort[parseInt(m, 10) - 1] || 'Aug';
      const dayNum = parseInt(d, 10);
      return `${dayNum} ${monthName} ${yearShort}`;
    }

    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      const dayNum = parsedDate.getDate();
      const monthName = monthsShort[parsedDate.getMonth()];
      const yearShort = String(parsedDate.getFullYear()).slice(-2);
      return `${dayNum} ${monthName} ${yearShort}`;
    }

    return str;
  };

  const getItemDateTime = (item, index) => {
    if (!item) {
      return index === 1 ? '2 Oct 2026 01:00 PM' : '12 Apr 26 10:00';
    }
    const rawDate = item?.bookingDate || item?.date || item?.createdAt;
    const slot = item?.timeSlot || item?.appointmentTime || item?.slot || '';

    if (rawDate) {
      const formattedDate = formatDisplayDate(rawDate);
      return slot ? `${formattedDate} ${slot}` : formattedDate;
    }

    if (item?.dateTime) {
      const parts = String(item?.dateTime || '').split(' ');
      const datePart = parts[0];
      const timePart = parts.slice(1).join(' ');
      const formattedDate = formatDisplayDate(datePart);
      return timePart ? `${formattedDate} ${timePart}` : formattedDate;
    }

    return index === 1 ? '2 Oct 2026 01:00 PM' : '12 Apr 26 10:00';
  };

  const getItemPrice = item => {
    const rawVal =
      item?.totalPayable ??
      item?.totalAmount ??
      item?.price ??
      item?.subtotal ??
      '120.00';
    const strVal = String(rawVal).replace(/^\$/, '₹');
    return strVal.startsWith('₹') ? strVal : `₹${strVal}`;
  };

  const getItemReason = item =>
    item?.cancellationReason ||
    item?.reason ||
    item?.cancelReason ||
    'Customer unavailable';

  const renderItem = ({item, index}) => {
    return (
      <View
        style={{
          marginTop: hp(14),
          borderRadius: hp(18),
          borderWidth: hp(1),
          borderColor: '#E7D4FF',
          overflow: 'hidden',
          backgroundColor: colors.white,
          // elevation: 2,
          // shadowColor: '#000',
          // shadowOffset: {width: 0, height: 2},
          // shadowOpacity: 0.05,
          // shadowRadius: 4,
        }}>
        {/* Map Banner Image with Cancelled Badge */}
        <View style={{position: 'relative', width: '100%', height: hp(120)}}>
          <Image
            source={images.map_Img}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
          {selectedTab === 'cancelled' && (
            <View
              style={{
                position: 'absolute',
                top: hp(12),
                right: wp(12),
                backgroundColor: '#FFE6E6',
                paddingHorizontal: wp(16),
                paddingVertical: hp(5),
                borderRadius: hp(50),
              }}>
              <Text
                style={{
                  color: '#9F1010',
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins600,
                }}>
                Cancelled
              </Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View
          style={{
            paddingHorizontal: wp(16),
            paddingTop: hp(14),
            paddingBottom: hp(16),
          }}>
          {/* Service Title */}
          <Text
            style={{
              fontSize: fontSize(18),
              fontFamily: fontFamily.poppins600,
              color: colors.pureBlack,
            }}>
            {getItemTitle(item)}
          </Text>

          {/* Location Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginTop: hp(6),
            }}>
            <Image
              source={icons.location_Icon}
              style={{
                width: hp(10),
                height: hp(10),
                resizeMode: 'contain',
                marginRight: wp(8),
                marginTop: hp(5),
                tintColor: '#222222',
              }}
            />
            <Text
              style={{
                flex: 1,
                fontSize: fontSize(13),
                fontFamily: fontFamily.poppins400,
                color: '#B4B4B4',
                lineHeight: hp(18),
              }}>
              {getItemLocation(item)}
            </Text>
          </View>

          {/* Customer Name Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: hp(3),
            }}>
            <Image
              source={icons.profile_Icon || icons.profile_Icon}
              style={{
                width: hp(8),
                height: hp(8),
                resizeMode: 'contain',
                marginRight: wp(8),
                tintColor: '#222222',
                top: -1,
              }}
            />
            <Text
              style={{
                fontSize: fontSize(13),
                fontFamily: fontFamily.poppins400,
                color: '#B4B4B4',
              }}>
              {getItemCustomerName(item)}
            </Text>
          </View>

          {/* Thin Horizontal Divider */}
          <View
            style={{
              height: hp(1),
              backgroundColor: '#E6E6E6',
              marginVertical: hp(12),
            }}
          />

          {/* Date/Time & Price Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: '#731EE2',
                fontSize: fontSize(15),
                fontFamily: fontFamily.poppins600,
              }}>
              {getItemDateTime(item, index)}
            </Text>

            {selectedTab !== 'cancelled' && (
              <Text
                style={{
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins700,
                  color: colors.pureBlack,
                }}>
                {getItemPrice(item)}
              </Text>
            )}
          </View>

          {/* Reason Row for Cancelled Tab */}
          {selectedTab === 'cancelled' && (
            <Text
              style={{
                marginTop: hp(12),
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins700,
                color: colors.pureBlack,
              }}>
              Reason :{' '}
              <Text
                style={{
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                }}>
                {getItemReason(item)}
              </Text>
            </Text>
          )}

          {/* Buttons Row for New Tab */}
          {selectedTab === 'new' && (
            <View
              style={{
                flexDirection: 'row',
                marginTop: hp(14),
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDeclinePress(item)}
                disabled={cancellingId === getMongoBookingId(item)}
                style={{
                  backgroundColor: '#F5F5F5',
                  width: '48%',
                  height: hp(44),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: hp(50),
                }}>
                {cancellingId === getMongoBookingId(item) ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryColor || '#731EE2'}
                  />
                ) : (
                  <Text
                    style={{
                      color: '#222222',
                      fontSize: fontSize(14),
                      fontFamily: fontFamily.poppins600,
                    }}>
                    Decline
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAcceptPress(item)}
                disabled={acceptingId === getMongoBookingId(item)}
                style={{
                  backgroundColor: '#731EE2',
                  width: '48%',
                  height: hp(44),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: hp(50),
                }}>
                {acceptingId === getMongoBookingId(item) ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: fontSize(14),
                      fontFamily: fontFamily.poppins600,
                    }}>
                    Accept
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Buttons Row for Confirmed Tab */}
          {selectedTab === 'confirmed' && (
            <View
              style={{
                flexDirection: 'row',
                marginTop: hp(14),
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDeclinePress(item)}
                disabled={cancellingId === getMongoBookingId(item)}
                style={{
                  backgroundColor: '#F5F5F5',
                  width: '48%',
                  height: hp(44),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: hp(50),
                }}>
                {cancellingId === getMongoBookingId(item) ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryColor || '#731EE2'}
                  />
                ) : (
                  <Text
                    style={{
                      color: '#222222',
                      fontSize: fontSize(14),
                      fontFamily: fontFamily.poppins600,
                    }}>
                    Cancel
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleCompleteButtonPress(item)}
                disabled={sendingOtpId === getMongoBookingId(item)}
                style={{
                  backgroundColor: '#731EE2',
                  width: '48%',
                  height: hp(44),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: hp(50),
                }}>
                {sendingOtpId === getMongoBookingId(item) ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: fontSize(14),
                      fontFamily: fontFamily.poppins600,
                    }}>
                    Complete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1, marginHorizontal: wp(16)}}>
      {/* 3 Segmented Tabs: New, Confirmed, Cancelled */}
      <View
        style={{
          marginTop: hp(14),
          backgroundColor: '#F8F4FF',
          borderRadius: hp(30),
          flexDirection: 'row',
          padding: wp(4),
          marginBottom: hp(4),
          height: hp(45),
        }}>
        {['new', 'confirmed', 'cancelled'].map(tabKey => {
          const isSelected = selectedTab === tabKey;
          const labelMap = {
            new: 'New',
            confirmed: 'Confirmed',
            cancelled: 'Cancelled',
          };

          return (
            <TouchableOpacity
              key={tabKey}
              activeOpacity={0.8}
              onPress={() => handleTabChange(tabKey)}
              style={{
                flex: 1,
                backgroundColor: isSelected ? '#731EE2' : 'transparent',
                paddingVertical: hp(2),
                borderRadius: hp(25),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: isSelected ? '#FFFFFF' : '#731EE2',
                  fontSize: fontSize(13),
                  fontFamily: isSelected
                    ? fontFamily.poppins600
                    : fontFamily.poppins500,
                }}>
                {labelMap[tabKey]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Booking Cards List */}
      <FlatList
        data={dataToDisplay}
        keyExtractor={(item, index) =>
          getMongoBookingId(item) || item?._id || item?.id || String(index)
        }
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: hp(20), flexGrow: 1}}
      />

      {/* Cancellation Reason RBSheet */}
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={hp(650)}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          draggableIcon: {
            backgroundColor: '#E0E0E0',
            width: wp(40),
            height: hp(4),
          },
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            backgroundColor: '#FFFFFF',
            paddingHorizontal: wp(20),
            paddingTop: hp(10),
            paddingBottom: hp(30),
          },
        }}>
        <Text
          style={{
            fontSize: fontSize(18),
            fontFamily: fontFamily.poppins700,
            color: '#111111',
            marginTop: hp(4),
          }}>
          Select the reason
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: '#EAEAEA',
            marginVertical: hp(14),
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: hp(40)}}>
          {cancellationReasons.map((reason, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => handleSelectCancelReason(reason)}
              style={{
                paddingVertical: hp(12),
              }}>
              <Text
                style={{
                  fontSize: fontSize(15),
                  fontFamily: fontFamily.poppins400,
                  color: '#222222',
                }}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </RBSheet>

      {/* Complete Order Enter OTP RBSheet */}
      <RBSheet
        ref={refOtpRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={hp(380)}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
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
            paddingBottom: hp(24),
          },
        }}>
        <View style={{alignItems: 'center', width: '100%'}}>
          {/* Main Title */}
          <Text
            style={{
              fontSize: fontSize(20),
              fontFamily: fontFamily.poppins700,
              color: '#111111',
              textAlign: 'center',
              marginTop: hp(4),
            }}>
            Enter OTP
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: fontSize(13),
              fontFamily: fontFamily.poppins400,
              color: '#777777',
              textAlign: 'center',
              marginTop: hp(6),
              marginBottom: hp(24),
            }}>
            Get the customer’s OTP to confirm completion
          </Text>

          {/* 4-Digit OTP Input Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '80%',
              marginTop: hp(10),
              marginBottom: hp(24),
            }}>
            {[0, 1, 2, 3].map(index => {
              const refs = [otpRef0, otpRef1, otpRef2, otpRef3];
              const isFocused = focusedOtpIndex === index;
              const hasValue = !!otpInput[index];

              return (
                <View
                  key={index}
                  style={{
                    width: wp(54),
                    alignItems: 'center',
                  }}>
                  <TextInput
                    ref={refs[index]}
                    value={otpInput[index]}
                    onFocus={() => setFocusedOtpIndex(index)}
                    onChangeText={text => {
                      const updated = [...otpInput];
                      updated[index] = text;
                      setOtpInput(updated);

                      if (text && index < 3) {
                        setFocusedOtpIndex(index + 1);
                        refs[index + 1].current?.focus();
                      }
                    }}
                    onKeyPress={({nativeEvent}) => {
                      if (
                        nativeEvent.key === 'Backspace' &&
                        !otpInput[index] &&
                        index > 0
                      ) {
                        setFocusedOtpIndex(index - 1);
                        refs[index - 1].current?.focus();
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={{
                      fontSize: fontSize(22),
                      fontFamily: fontFamily.poppins700,
                      color: '#111111',
                      textAlign: 'center',
                      width: '100%',
                      height: hp(36),
                      padding: 0,
                    }}
                  />
                  {/* Separate Underline Bar */}
                  <View
                    style={{
                      width: '100%',
                      height: 2,
                      backgroundColor:
                        isFocused || hasValue ? '#111111' : '#E0E0E0',
                      marginTop: hp(8),
                      borderRadius: 1,
                    }}
                  />
                </View>
              );
            })}
          </View>

          {/* Resend OTP Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={otpTimer > 0 || resendingOtp}
            onPress={handleResendOtp}
            style={{marginBottom: hp(24), marginTop: hp(20)}}>
            {resendingOtp ? (
              <ActivityIndicator size="small" color="#731EE2" />
            ) : (
              <Text
                style={{
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins500,
                  color: otpTimer > 0 ? '#888888' : '#222222',
                  textAlign: 'center',
                }}>
                {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Confirm Completion Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={verifyingOtp}
            onPress={handleVerifyOtp}
            style={{
              backgroundColor: '#731EE2',
              width: '100%',
              height: hp(48),
              borderRadius: hp(50),
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: hp(20),
            }}>
            {verifyingOtp ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(15),
                  fontFamily: fontFamily.poppins600,
                }}>
                Confirm Completion
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </RBSheet>

      {/* UBER / OLA STYLE INCOMING BOOKING REQUEST MODAL */}
      <Modal
        visible={incomingModalVisible && Boolean(incomingBookingItem)}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseIncomingModal}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: wp(18),
          }}>
          <View
            style={{
              width: '100%',
              backgroundColor: colors.white,
              borderRadius: hp(24),
              paddingHorizontal: wp(20),
              paddingTop: hp(20),
              paddingBottom: hp(24),
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 20,
            }}>
            {/* TOP BAR / BADGE */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: hp(15),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F3E8FF',
                  paddingHorizontal: wp(12),
                  paddingVertical: hp(6),
                  borderRadius: hp(20),
                }}>
                <View
                  style={{
                    width: hp(8),
                    height: hp(8),
                    borderRadius: hp(4),
                    backgroundColor: colors.primaryColor || '#731EE2',
                    marginRight: wp(6),
                  }}
                />
                <Text
                  style={{
                    color: colors.primaryColor || '#731EE2',
                    fontSize: fontSize(13),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  NEW REQUEST • {countdownSeconds}s
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCloseIncomingModal}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text
                  style={{
                    fontSize: fontSize(18),
                    fontFamily: fontFamily.poppins600,
                    color: '#717171',
                  }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* MAP HEADER PREVIEW */}
            <View
              style={{
                height: hp(110),
                borderRadius: hp(14),
                overflow: 'hidden',
                marginBottom: hp(15),
                backgroundColor: '#EFEFEF',
              }}>
              <Image
                source={images.map_Image || images.map}
                style={{width: '100%', height: '100%', resizeMode: 'cover'}}
              />
            </View>

            {/* SERVICE TITLE & PRICE */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: hp(12),
              }}>
              <Text
                style={{
                  fontSize: fontSize(18),
                  fontFamily: fontFamily.poppins600,
                  color: colors.pureBlack,
                  flex: 1,
                  marginRight: wp(10),
                }}>
                {getItemTitle(incomingBookingItem)}
              </Text>
              <Text
                style={{
                  fontSize: fontSize(18),
                  fontFamily: fontFamily.poppins700,
                  color: colors.pureBlack,
                }}>
                {getItemPrice(incomingBookingItem)}
              </Text>
            </View>

            {/* LOCATION & CUSTOMER INFO */}
            <View style={{marginBottom: hp(15)}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: hp(6),
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: fontSize(13),
                    fontFamily: fontFamily.poppins400,
                    color: '#717171',
                    flex: 1,
                  }}>
                  📍 {getItemLocation(incomingBookingItem)}
                </Text>
              </View>

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    fontSize: fontSize(13),
                    fontFamily: fontFamily.poppins400,
                    color: '#717171',
                  }}>
                  👤 {getItemCustomerName(incomingBookingItem)}
                </Text>
              </View>
            </View>

            {/* DATE & TIME SLOT */}
            <View
              style={{
                backgroundColor: '#F8F8F8',
                paddingVertical: hp(8),
                paddingHorizontal: wp(12),
                borderRadius: hp(8),
                marginBottom: hp(20),
              }}>
              <Text
                style={{
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins600,
                  color: colors.primaryColor || '#731EE2',
                }}>
                📅 {getItemDateTime(incomingBookingItem, 0)}
              </Text>
            </View>

            {/* ACTION BUTTONS (DECLINE / ACCEPT) */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={
                  cancellingId === getMongoBookingId(incomingBookingItem)
                }
                onPress={() => {
                  handleCloseIncomingModal();
                  handleDeclinePress(incomingBookingItem);
                }}
                style={{
                  flex: 1,
                  height: hp(48),
                  borderRadius: hp(24),
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(10),
                }}>
                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  Decline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                disabled={
                  acceptingId === getMongoBookingId(incomingBookingItem)
                }
                onPress={() => {
                  handleCloseIncomingModal();
                  handleAcceptPress(incomingBookingItem);
                }}
                style={{
                  flex: 1,
                  height: hp(48),
                  borderRadius: hp(24),
                  backgroundColor: colors.primaryColor || '#731EE2',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {acceptingId === getMongoBookingId(incomingBookingItem) ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: fontSize(15),
                      fontFamily: fontFamily.poppins600,
                    }}>
                    Accept
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* CONTINUOUS INCOMING CALL RINGTONE AUDIO PLAYER */}
      {incomingModalVisible && (
        <Video
          ref={ringbellPlayerRef}
          source={require('../../assets/sounds/ringbell.mp3')}
          paused={!incomingModalVisible}
          repeat={true}
          loop={true}
          volume={1.0}
          audioOnly={true}
          playInBackground={false}
          onEnd={() => {
            console.log(
              '[VendorHomeBookingComponent] ringbell 8s sound finished -> Auto-replaying from 0s',
            );
            if (ringbellPlayerRef.current) {
              ringbellPlayerRef.current.seek(0);
            }
          }}
          style={{width: 0, height: 0, position: 'absolute'}}
        />
      )}
    </View>
  );
};

export default VendorHomeBookingComponent;
