import React, {useRef, useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Linking,
  ActivityIndicator,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {colors} from '../../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../../utils/helpers';
import {icons, images} from '../../../../assets';
import {
  cancelCustomerBooking,
  createCustomerReview,
} from '../../../../actions/customerAuthActions';

const DetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const refCancelSheet = useRef();
  const [selectedReason, setSelectedReason] = useState(0);
  const [comment, setComment] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Review states for completed bookings
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const item = route?.params?.booking || {};

  // console.log('item', item);

  const statusRaw = String(
    item?.status || item?.bookingStatus || 'accepted',
  ).toLowerCase();
  const isCompleted = statusRaw === 'completed' || statusRaw === 'complete';
  const isCancelled =
    statusRaw === 'cancelled' ||
    statusRaw === 'canceled' ||
    statusRaw === 'cancel';
  const isActive = !isCompleted && !isCancelled;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

  const getBookingTitle = itemData => {
    let title =
      itemData?.serviceName ||
      itemData?.serviceTitle ||
      itemData?.notes ||
      (Array.isArray(itemData?.serviceIds) && itemData.serviceIds.length > 0
        ? itemData.serviceIds[0]?.title ||
          itemData.serviceIds[0]?.name ||
          itemData.serviceIds[0]
        : null) ||
      itemData?.serviceId?.title ||
      itemData?.serviceId?.name ||
      itemData?.service ||
      'Plumbing';
    if (typeof title === 'object' && title !== null) {
      title = title.title || title.name || 'Plumbing';
    }
    let str = String(title || 'Plumbing').trim();
    if (str.includes(',')) {
      str = str.split(',')[0].trim();
    }
    return str || 'Plumbing';
  };

  const getSalonName = itemData => {
    return (
      itemData?.businessName ||
      itemData?.vendor?.businessName ||
      itemData?.vendorId?.businessName ||
      itemData?.vendorId?.name ||
      itemData?.vendorName ||
      itemData?.salon ||
      'Star Unisex Salon'
    );
  };

  const getVendorName = itemData => {
    return (
      itemData?.vendorName ||
      itemData?.vendor?.name ||
      itemData?.vendorId?.fullName ||
      itemData?.vendorId?.name ||
      itemData?.name ||
      'Raj Kushwaha'
    );
  };

  const getVendorImage = itemData => {
    const pic =
      itemData?.profilePic ||
      itemData?.profileImage ||
      itemData?.vendor?.profilePic ||
      itemData?.vendor?.profileImage ||
      itemData?.vendorId?.profilePic ||
      itemData?.vendorId?.profile_pic ||
      itemData?.image;
    if (typeof pic === 'string' && pic.startsWith('http')) {
      return {uri: pic};
    }
    if (typeof pic === 'object' && pic !== null && pic.uri) {
      return pic;
    }
    return images.demo_User_Img;
  };

  const getBookingDate = itemData => {
    const rawDate =
      itemData?.bookingDate || itemData?.date || itemData?.createdAt;
    if (!rawDate) {
      return itemData?.date || '01 Oct, 2026';
    }
    const str = String(rawDate).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      const monthName = monthsShort[parseInt(m, 10) - 1] || 'Oct';
      return `${parseInt(d, 10)} ${monthName}, ${y}`;
    }
    return str;
  };

  const getBookingTime = itemData => {
    return (
      itemData?.timeSlot ||
      itemData?.appointmentTime ||
      itemData?.time ||
      '10 AM to 11 AM'
    );
  };

  const getBookingPrice = itemData => {
    const val =
      itemData?.totalAmount ??
      itemData?.totalPayable ??
      itemData?.price ??
      itemData?.subtotal ??
      '120.00';
    const str = String(val)
      .replace(/^Rs\.\s*/i, '')
      .replace(/^₹\s*/, '');
    const num = Number(str);
    const formatted = !isNaN(num) ? num.toFixed(2) : str;
    return `Rs. ${formatted}`;
  };

  const getBadgeConfig = () => {
    if (isCancelled) {
      return {
        bg: '#FFF0F0',
        color: '#DC2626',
        text: 'CANCELLED',
      };
    }
    if (isCompleted) {
      return {
        bg: '#E6F7ED',
        color: '#2E7D32',
        text: 'COMPLETED',
      };
    }
    return {
      bg: '#F6EEFF',
      color: colors.primaryColor || '#731EE2',
      text: 'ACCEPTED',
    };
  };

  const getPaymentData = itemData => {
    const bName = (
      itemData?.businessName ||
      itemData?.vendor?.businessName ||
      itemData?.salon ||
      ''
    ).toLowerCase();
    const sName = (
      itemData?.serviceName ||
      itemData?.serviceTitle ||
      itemData?.service ||
      ''
    ).toLowerCase();

    const isSalon =
      bName.includes('salon') ||
      bName.includes('parlour') ||
      bName.includes('beauty') ||
      bName.includes('spa') ||
      sName.includes('hair') ||
      sName.includes('beauty') ||
      sName.includes('salon') ||
      sName.includes('spa');

    const subtotal =
      itemData?.subtotal ?? itemData?.price ?? itemData?.amount ?? 120;
    const serviceFee = itemData?.serviceFee ?? itemData?.service_fee ?? 6;
    const tax = itemData?.tax ?? itemData?.taxes ?? itemData?.platformFee ?? 6;
    const totalAmount = itemData?.totalAmount ?? itemData?.totalPayable ?? 136;

    const formatNum = val => {
      const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
      return !isNaN(num) ? num.toFixed(2) : String(val);
    };

    if (isSalon) {
      return {
        line1Label: `${getBookingTitle(itemData)} Fee`,
        line1Value: formatNum(subtotal),
        line2Label: 'Service Fee (5%)',
        line2Value: formatNum(serviceFee),
        line3Label: 'Taxes',
        line3Value: formatNum(tax),
        totalLabel: 'Total Payable',
        totalValue: formatNum(totalAmount),
      };
    } else {
      return {
        line1Label: 'Visit Fee',
        line1Value: formatNum(subtotal),
        line2Label: 'Service Fee',
        line2Value: formatNum(serviceFee),
        line3Label: 'Platform Fee',
        line3Value: formatNum(tax),
        totalLabel: 'Total Payable',
        totalValue: formatNum(totalAmount),
      };
    }
  };

  const title = getBookingTitle(item);
  const salon = getSalonName(item);
  const vendorName = getVendorName(item);
  const vendorImg = getVendorImage(item);
  const bookingDate = getBookingDate(item);
  const bookingTime = getBookingTime(item);
  const price = getBookingPrice(item);
  const badgeConfig = getBadgeConfig();
  const payment = getPaymentData(item);

  const handleCallPhone = () => {
    const rawNumber =
      item?.vendorMobileNumber ||
      item?.vendorPhone ||
      item?.vendorMobile ||
      item?.vendorId?.vendorMobileNumber ||
      item?.vendorId?.mobileNumber ||
      item?.vendorId?.phone ||
      item?.vendorId?.mobile ||
      item?.vendorId?.phoneNumber ||
      item?.vendor?.vendorMobileNumber ||
      item?.vendor?.mobileNumber ||
      item?.vendor?.phone ||
      item?.vendor?.mobile ||
      item?.phone ||
      item?.mobile ||
      '7405665654';
    const cleanNumber = String(rawNumber).replace(/[^0-9+]/g, '');
    const url = `tel:${cleanNumber}`;
    Linking.canOpenURL(url)
      .then(supported => {
        return Linking.openURL(url);
      })
      .catch(err => console.log('Error opening dialer:', err));
  };

  const handleConfirmCancellation = () => {
    const reasonOptions = [
      'Change my mind',
      'Wait time too long',
      'Order by mistake',
      'Other',
    ];
    const selectedText = reasonOptions[selectedReason] || 'Other';
    const cancelReason =
      selectedReason === 3 ? comment.trim() || 'Other' : selectedText;
    const notes = comment.trim() || cancelReason;

    const bookingId = item?._id || item?.id || item?.bookingId;

    if (!bookingId) {
      console.log('Error: bookingId is missing');
      refCancelSheet.current?.close();
      navigation.goBack();
      return;
    }

    const payload = {
      cancelReason,
      notes,
    };

    setCancelLoading(true);
    dispatch(
      cancelCustomerBooking(bookingId, payload, (err, res) => {
        setCancelLoading(false);
        refCancelSheet.current?.close();
        if (!err) {
          console.log('Customer booking cancellation success:', res);
        } else {
          console.log('Customer booking cancellation error:', err);
        }
        navigation.goBack();
      }),
    );
  };

  const handleSubmitReview = () => {
    const bookingId = item?._id || item?.id || item?.bookingId;

    if (!bookingId) {
      console.log('Error: bookingId is missing');
      return;
    }

    const payload = {
      bookingId,
      rating,
      review: feedback.trim(),
    };

    setReviewLoading(true);
    dispatch(
      createCustomerReview(payload, (err, res) => {
        setReviewLoading(false);
        if (!err) {
          console.log('Customer review submission success:', res);
          navigation.goBack();
        } else {
          console.log('Customer review submission error:', err);
        }
      }),
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* Header */}
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
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins500,
          }}>
          Details
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#E3E3E3'}}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(18),
          paddingTop: hp(16),
          paddingBottom: hp(30),
        }}>
        {/* Booking Card */}
        <View
          style={{
            borderWidth: 1,
            borderColor: '#E5E5E5',
            borderRadius: hp(16),
            padding: hp(14),
            backgroundColor: colors.white,
          }}>
          {/* Service Title & Status Badge */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                marginRight: wp(10),
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
              }}>
              {title}
            </Text>

            <View
              style={{
                backgroundColor: badgeConfig.bg,
                paddingHorizontal: wp(14),
                paddingVertical: hp(5),
                borderRadius: hp(15),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: fontSize(11),
                  fontFamily: fontFamily.poppins600,
                  color: badgeConfig.color,
                  letterSpacing: 0.5,
                }}>
                {badgeConfig.text}
              </Text>
            </View>
          </View>

          {/* Salon Name & Verified Icon */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: fontSize(12),
                fontFamily: fontFamily.poppins400,
                color: colors.black,
              }}>
              {salon}
            </Text>
            <Image
              source={icons.verified_Icon}
              style={{
                width: hp(11),
                height: hp(11),
                resizeMode: 'contain',
                marginLeft: wp(6),
                top: -1,
              }}
            />
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: '#E7E7E7',
              marginTop: hp(15),
              marginBottom: hp(20),
            }}
          />

          {/* Profile */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={vendorImg}
              style={{
                width: hp(44),
                height: hp(44),
                borderRadius: hp(10),
                marginRight: wp(15),
              }}
            />

            <View>
              <Text
                style={{
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins600,
                  color: colors.pureBlack,
                }}>
                {vendorName}
              </Text>

              <Text
                style={{
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                  color: '#8C8C8C',
                }}>
                Service Professional
              </Text>
            </View>
          </View>

          {/* Booking Info */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: hp(18),
            }}>
            <View>
              <Text
                style={{
                  fontSize: fontSize(12),
                  color: '#909090',
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('date') || 'Date'}
              </Text>
              <Text
                style={{
                  fontSize: fontSize(12),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins600,
                }}>
                {bookingDate}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: fontSize(12),
                  color: '#909090',
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('time') || 'Time'}
              </Text>
              <Text
                style={{
                  fontSize: fontSize(12),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins600,
                }}>
                {bookingTime}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: fontSize(12),
                  color: '#909090',
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('total') || 'Total'}
              </Text>
              <Text
                style={{
                  fontSize: fontSize(12),
                  color: colors.primaryColor || '#731EE2',
                  fontFamily: fontFamily.poppins600,
                }}>
                {price}
              </Text>
            </View>
          </View>

          {/* Call Button & OTP Warning Message (ACTIVE BOOKINGS ONLY) */}
          {isActive && (
            <View style={{marginTop: hp(16)}}>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleCallPhone}
                style={{
                  width: '100%',
                  height: hp(42),
                  backgroundColor: '#F6EEFF',
                  borderRadius: hp(21),
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  source={icons.call_Icon}
                  style={{
                    width: hp(13),
                    height: hp(13),
                    resizeMode: 'contain',
                    marginRight: wp(10),
                  }}
                />
                <Text
                  style={{
                    color: colors.primaryColor || '#731EE2',
                    fontSize: fontSize(13),
                    fontFamily: fontFamily.poppins600,
                    letterSpacing: 0.5,
                  }}>
                  {(t('call') || 'CALL').toUpperCase()}
                </Text>
              </TouchableOpacity>

              {/* OTP Warning Message */}
              <View
                style={{
                  backgroundColor: '#FFF9EC',
                  borderRadius: hp(12),
                  paddingHorizontal: wp(14),
                  paddingVertical: hp(12),
                  marginTop: hp(12),
                }}>
                <Text
                  style={{
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                    color: '#917637',
                    lineHeight: hp(18),
                  }}>
                  Do not share OTP on call, share only on visit in the personal
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Card */}
        <View
          style={{
            borderWidth: 1,
            borderColor: '#E5E5E5',
            borderRadius: hp(16),
            padding: hp(18),
            backgroundColor: colors.white,
            marginTop: hp(16),
          }}>
          <Text
            style={{
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              color: colors.pureBlack,
              marginBottom: hp(14),
            }}>
            Payment
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp(10),
            }}>
            <Text
              style={{
                color: '#6E6E6E',
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {payment.line1Label}
            </Text>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins500,
              }}>
              {payment.line1Value}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp(10),
            }}>
            <Text
              style={{
                color: '#6E6E6E',
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {payment.line2Label}
            </Text>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins500,
              }}>
              {payment.line2Value}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp(14),
            }}>
            <Text
              style={{
                color: '#6E6E6E',
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {payment.line3Label}
            </Text>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins500,
              }}>
              {payment.line3Value}
            </Text>
          </View>

          <View
            style={{
              width: '100%',
              height: 1,
              backgroundColor: '#E7E7E7',
              marginBottom: hp(14),
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins600,
              }}>
              {payment.totalLabel}
            </Text>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins700,
              }}>
              {payment.totalValue}
            </Text>
          </View>
        </View>

        {/* Cancelled Booking Specific View (Refund Note & Explore More Vendors) */}
        {isCancelled && (
          <View style={{marginTop: hp(24)}}>
            {/* Refund Note */}
            <View
              style={{
                backgroundColor: '#FFF9EC',
                borderRadius: hp(12),
                paddingVertical: hp(14),
                paddingHorizontal: wp(16),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: '#917637',
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  textAlign: 'center',
                }}>
                Payment will be refund in 24 hours.
              </Text>
            </View>

            {/* Explore More Vendors Button */}
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigation.navigate('MainApp')}
              style={{
                width: '100%',
                height: hp(48),
                borderRadius: hp(24),
                backgroundColor: colors.primaryColor || '#731EE2',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp(40),
                marginBottom: hp(20),
              }}>
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                }}>
                Explore More Vendors
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Rate Your Professional Section (COMPLETED BOOKINGS ONLY) */}
        {isCompleted && (
          <View style={{marginTop: hp(28), alignItems: 'center'}}>
            <Text
              style={{
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
                marginBottom: hp(16),
              }}>
              Rate Your Professional
            </Text>

            {/* 5-Star Rating Bar */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: hp(24),
              }}>
              {[1, 2, 3, 4, 5].map(starIndex => (
                <TouchableOpacity
                  key={starIndex}
                  activeOpacity={0.7}
                  onPress={() => setRating(starIndex)}
                  style={{marginHorizontal: wp(6)}}>
                  <Image
                    source={
                      starIndex <= rating
                        ? icons.color_Rating_Star
                        : icons.rating_Star_Icon
                    }
                    style={{
                      width: hp(32),
                      height: hp(32),
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Feedback Box */}
            <View
              style={{
                width: '100%',
                borderRadius: hp(16),
                borderWidth: 1,
                borderColor: '#E5E5E5',
                backgroundColor: colors.white,
                padding: hp(14),
                minHeight: hp(110),
              }}>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Share your feedback"
                placeholderTextColor="#999999"
                multiline
                textAlignVertical="top"
                style={{
                  flex: 1,
                  fontSize: fontSize(14),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins400,
                }}
              />
            </View>

            {/* Submit Review Button */}
            <TouchableOpacity
              activeOpacity={0.6}
              disabled={reviewLoading}
              onPress={handleSubmitReview}
              style={{
                width: '100%',
                height: hp(48),
                borderRadius: hp(24),
                backgroundColor: colors.primaryColor || '#731EE2',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp(24),
                marginBottom: hp(20),
                opacity: reviewLoading ? 0.7 : 1,
              }}>
              {reviewLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  Submit Review
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel Appointment Button (ACTIVE BOOKINGS ONLY) */}
        {isActive && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => refCancelSheet.current?.open()}
            style={{
              alignItems: 'center',
              marginTop: hp(40),
              marginBottom: hp(20),
            }}>
            <Text
              style={{
                color: colors.primaryColor || '#731EE2',
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              Cancel Appointment
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Order Cancel BottomSheet (ACTIVE BOOKINGS ONLY) */}
      {isActive && (
        <RBSheet
          ref={refCancelSheet}
          height={hp(620)}
          openDuration={250}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopLeftRadius: hp(24),
              borderTopRightRadius: hp(24),
              paddingHorizontal: wp(20),
              paddingTop: hp(12),
            },
          }}>
          <Text
            style={{
              fontSize: fontSize(18),
              fontFamily: fontFamily.poppins600,
              color: colors.pureBlack,
              textAlign: 'center',
              marginTop: hp(10),
              marginBottom: hp(8),
            }}>
            Cancel Order?
          </Text>

          <Text
            style={{
              textAlign: 'center',
              color: '#747474',
              marginBottom: hp(20),
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
              lineHeight: hp(18),
            }}>
            We’re sorry to see you go. Please let us know why you’re cancelling
            so we can improve the experience.
          </Text>

          {/* OPTIONS */}
          {[
            'Change my mind',
            'Wait time too long',
            'Order by mistake',
            'Other',
          ].map((reasonLabel, index) => {
            const isSelected = selectedReason === index;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedReason(index);
                  if (index !== 3) {
                    setComment('');
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: hp(8),
                }}>
                {/* RADIO CIRCLE */}
                <View
                  style={{
                    width: hp(20),
                    height: hp(20),
                    borderRadius: hp(10),
                    borderWidth: hp(2),
                    borderColor: colors.pureBlack,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: wp(14),
                  }}>
                  {isSelected && (
                    <View
                      style={{
                        width: hp(10),
                        height: hp(10),
                        borderRadius: hp(5),
                        backgroundColor: colors.pureBlack,
                      }}
                    />
                  )}
                </View>

                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {reasonLabel}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* COMMENTS INPUT BOX (ALWAYS SHOWN, ENABLED ONLY WHEN 'OTHER' IS SELECTED) */}
          <View style={{marginTop: hp(14)}}>
            <Text
              style={{
                color:
                  selectedReason === 3
                    ? colors.primaryColor || '#731EE2'
                    : '#999999',
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins500,
                marginBottom: hp(8),
              }}>
              Comments
            </Text>

            <TextInput
              editable={selectedReason === 3}
              value={comment}
              onChangeText={setComment}
              placeholder={
                selectedReason === 3
                  ? 'Write your reason here...'
                  : "Select 'Other' to enter your reason"
              }
              placeholderTextColor="#A5A5A5"
              multiline
              textAlignVertical="top"
              style={{
                height: hp(90),
                borderRadius: hp(14),
                borderWidth: 1,
                borderColor:
                  selectedReason === 3
                    ? colors.primaryColor || '#731EE2'
                    : '#E0E0E0',
                backgroundColor:
                  selectedReason === 3 ? colors.white : '#F8F8F8',
                padding: hp(12),
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}
            />
          </View>

          {!isKeyboardVisible && (
            <View style={{marginTop: hp(20), marginBottom: hp(20)}}>
              <TouchableOpacity
                activeOpacity={0.6}
                disabled={cancelLoading}
                onPress={handleConfirmCancellation}
                style={{
                  width: '100%',
                  height: hp(48),
                  borderRadius: hp(24),
                  backgroundColor: colors.primaryColor || '#731EE2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: cancelLoading ? 0.7 : 1,
                }}>
                {cancelLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: fontSize(15),
                      fontFamily: fontFamily.poppins500,
                    }}>
                    Confirm Cancellation
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => refCancelSheet.current?.close()}
                style={{alignItems: 'center', marginTop: hp(16)}}>
                <Text
                  style={{
                    color: colors.primaryColor || '#731EE2',
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  Keep Order
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </RBSheet>
      )}
    </SafeAreaView>
  );
};

export default DetailsScreen;
