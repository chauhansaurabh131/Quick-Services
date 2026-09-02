import React, {useState, useEffect, useRef} from 'react';
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
  const selectedTab = activeTab || internalTab;

  const isValidObjectId = val =>
    typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val.trim());

  const getMongoBookingId = item => {
    if (!item) {
      return null;
    }
    const candidates = [
      item.id,
      item._id,
      item.bookingId,
      item.mongoBookingId,
      item.bookingId?._id,
      item.bookingId?.id,
      item.data?._id,
      item.data?.id,
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

  useEffect(() => {
    if (vendorUserId) {
      setFetchingBookings(true);
      dispatch(
        getVendorBookings(vendorUserId, currentStatusQuery, (err, res) => {
          setFetchingBookings(false);
        }),
      );
    }
  }, [dispatch, vendorUserId, selectedTab, currentStatusQuery]);

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
    item.addressId?.displayAddress ||
    item.addressId?.address ||
    item.address ||
    item.location ||
    'Dumas Rd, Magdalla,';

  const getItemCustomerName = item =>
    item.customerId?.fullName ||
    item.customerId?.name ||
    item.customerName ||
    item.name ||
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
    const rawDate = item.bookingDate || item.date || item.createdAt;
    const slot = item.timeSlot || item.appointmentTime || item.slot || '';

    if (rawDate) {
      const formattedDate = formatDisplayDate(rawDate);
      return slot ? `${formattedDate} ${slot}` : formattedDate;
    }

    if (item.dateTime) {
      const parts = String(item.dateTime).split(' ');
      const datePart = parts[0];
      const timePart = parts.slice(1).join(' ');
      const formattedDate = formatDisplayDate(datePart);
      return timePart ? `${formattedDate} ${timePart}` : formattedDate;
    }

    return index === 1 ? '2 Oct 2026 01:00 PM' : '12 Apr 26 10:00';
  };

  const getItemPrice = item => {
    const rawVal =
      item.totalPayable ??
      item.totalAmount ??
      item.price ??
      item.subtotal ??
      '120.00';
    const strVal = String(rawVal).replace(/^\$/, '₹');
    return strVal.startsWith('₹') ? strVal : `₹${strVal}`;
  };

  const getItemReason = item =>
    item.cancellationReason ||
    item.reason ||
    item.cancelReason ||
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
    </View>
  );
};

export default VendorHomeBookingComponent;
