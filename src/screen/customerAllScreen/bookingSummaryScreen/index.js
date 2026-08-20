import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {icons} from '../../../assets';
import {hp, fontSize, fontFamily, wp} from '../../../utils/helpers';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import SwitchButton from '../../../components/switchButton';
import {Calendar} from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import {getBookingById} from '../../../actions/customerAuthActions';

const BookingSummaryScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const routeBookingId = route.params?.bookingId || '9F8A2D3C';

  const [isEnabled, setIsEnabled] = useState(false);
  const [fetchingBooking, setFetchingBooking] = useState(true);
  const [apiBookingDetails, setApiBookingDetails] = useState(null);

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const reduxBookingDetails = useSelector(
    state => state.auth?.activeBookingDetails,
  );

  useEffect(() => {
    if (routeBookingId) {
      setFetchingBooking(true);
      console.log(
        '==================================================',
        `\n[BookingSummaryScreen Fetching Booking Details by ID: ${routeBookingId}]`,
        `\nEndpoint: GET /v1/customer/bookings/${routeBookingId}`,
        '\n==================================================',
      );

      dispatch(
        getBookingById(routeBookingId, (error, responseData) => {
          setFetchingBooking(false);
          if (error) {
            console.log(
              '==================================================',
              '\n[BookingSummaryScreen Fetch Booking Error]',
              '\nError:',
              JSON.stringify(error, null, 2),
              '\n==================================================',
            );
          } else {
            console.log(
              '==================================================',
              '\n[BookingSummaryScreen Fetch Booking Success]',
              '\nData:',
              JSON.stringify(responseData, null, 2),
              '\n==================================================',
            );
            setApiBookingDetails(responseData?.data || responseData);
          }
        }),
      );
    } else {
      setFetchingBooking(false);
    }
  }, [dispatch, routeBookingId]);

  const activeBooking =
    apiBookingDetails || reduxBookingDetails || route.params?.bookingData || {};
  const bookingObj =
    activeBooking?.booking ||
    activeBooking?.data?.booking ||
    activeBooking ||
    {};
  const bookingSummaryObj =
    activeBooking?.bookingSummary || activeBooking?.data?.bookingSummary || {};
  const appointmentObj = bookingSummaryObj?.appointment || {};
  const vendorObj = bookingSummaryObj?.vendor || bookingObj?.vendorId || {};
  const priceBreakdown = bookingSummaryObj?.priceBreakdown || {};

  const bookingDisplayId =
    bookingSummaryObj?.bookingId ||
    bookingObj?.bookingId ||
    activeBooking?.bookingId ||
    activeBooking?.id ||
    routeBookingId;

  const bookingType = (
    appointmentObj?.bookingType ||
    bookingObj?.bookingType ||
    'instant'
  ).toLowerCase();

  const estimatedArrival =
    appointmentObj?.estimatedArrival ||
    bookingObj?.estimatedArrival ||
    '30-40 mins.';

  const isInstantBooking = bookingType.includes('instant');

  // Vendor & Service dynamic fields
  const businessName =
    vendorObj?.businessName ||
    bookingObj?.vendorId?.userId?.fullName ||
    bookingObj?.vendorId?.userId?.name ||
    'Vendor Profile';

  const categoryTitle =
    vendorObj?.category || bookingObj?.vendorId?.categoryId?.title || 'Service';

  const vendorRating =
    vendorObj?.rating || bookingObj?.vendorId?.rating || '4.5';

  const vendorImage =
    vendorObj?.profileImage ||
    bookingObj?.vendorId?.userId?.profilePic ||
    bookingObj?.vendorId?.userId?.profileImage ||
    'https://images.unsplash.com/photo-1560066984-138dadb4c035';

  // Customer Address dynamic fields
  const customerAddrObj =
    bookingSummaryObj?.customerAddress ||
    (typeof bookingObj?.addressId === 'object' ? bookingObj?.addressId : {}) ||
    {};

  const locationTypeLabel = 'Current Location';

  const fullDisplayAddress =
    customerAddrObj?.displayAddress ||
    [
      customerAddrObj?.floor,
      customerAddrObj?.address,
      customerAddrObj?.landmark,
    ]
      .filter(Boolean)
      .join(', ') ||
    '12-02, Star Building, Sector 4C, Gandhinagar';

  const servicesList = Array.isArray(priceBreakdown?.services)
    ? priceBreakdown.services
    : Array.isArray(bookingObj?.serviceIds)
    ? bookingObj.serviceIds
    : [];

  const mainServiceTitle =
    servicesList
      .map(s => s?.rawTitle || s?.title)
      .filter(Boolean)
      .join(', ') ||
    bookingObj?.notes ||
    'General Service';

  const isVisitingPricing =
    servicesList.some(s => s?.pricingType === 'visiting') ||
    priceBreakdown?.visitingCharge > 0 ||
    bookingObj?.vendorServiceId?.pricingType === 'visiting';

  const feeLabel = isVisitingPricing
    ? 'Visiting Fee'
    : servicesList[0]?.title || 'Service Fee';

  const feeVal =
    priceBreakdown?.visitingCharge ??
    priceBreakdown?.subtotal ??
    priceBreakdown?.servicesTotal ??
    bookingObj?.subtotal ??
    100;

  const serviceFeeVal =
    priceBreakdown?.serviceFee ?? bookingObj?.serviceFee ?? 5;

  const serviceFeePct = priceBreakdown?.serviceFeePercentage || '5%';

  const taxVal = priceBreakdown?.tax ?? bookingObj?.tax ?? 5;

  const totalPayableVal =
    priceBreakdown?.totalPayable ?? bookingObj?.totalAmount ?? 110;

  const formatAmount = val => {
    if (val === undefined || val === null || isNaN(Number(val))) {
      return '0.00';
    }
    return Number(val).toFixed(2);
  };

  const today = new Date().toISOString().split('T')[0];

  // FORMAT DATE → DD-MM-YYYY
  const formatDate = dateString => {
    if (!dateString) {
      return '';
    }
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  // FORMAT TIME → AM/PM
  const formatTime = date => {
    if (!date) {
      return '';
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View
        style={{
          height: hp(50),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* Back Arrow */}
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

        {/* Title */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          Booking Summary
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#E3E3E3'}}
      />

      {fetchingBooking ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: hp(50),
          }}>
          <ActivityIndicator
            size="large"
            color={colors.primaryColor || '#731EE2'}
          />
          <Text
            style={{
              marginTop: hp(10),
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              color: '#7D7D7D',
            }}>
            Loading booking details...
          </Text>
        </View>
      ) : (
        <ScrollView>
          <View style={{marginTop: hp(18), marginHorizontal: wp(18)}}>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: hp(18),
                marginBottom: hp(16),
                borderWidth: 1,
                borderColor: '#E8E8E8',
                overflow: 'hidden',
                marginTop: hp(10),
              }}>
              {/* Image */}
              <View>
                <Image
                  source={{
                    uri: vendorImage,
                  }}
                  style={{
                    width: '100%',
                    height: hp(120),
                    resizeMode: 'cover',
                  }}
                />

                {/* Rating */}
                <View
                  style={{
                    position: 'absolute',
                    top: hp(10),
                    left: wp(12),
                    backgroundColor: '#1C1C1C',
                    borderRadius: hp(50),
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: wp(12),
                    paddingVertical: hp(5),
                  }}>
                  <Image
                    source={icons.star_Icon}
                    style={{
                      width: hp(14),
                      height: hp(14),
                      resizeMode: 'contain',
                      marginRight: wp(8),
                      top: -2,
                    }}
                  />

                  <Text
                    style={{
                      color: colors.white,
                      fontSize: fontSize(11),
                      fontFamily: fontFamily.poppins600,
                      top: 2,
                    }}>
                    {vendorRating}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View style={{padding: wp(14)}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: fontFamily.poppins600,
                      fontSize: fontSize(19),
                      color: colors.pureBlack,
                    }}>
                    {businessName}
                  </Text>

                  <Image
                    source={icons.verified_Icon}
                    style={{
                      width: hp(15),
                      height: hp(15),
                      resizeMode: 'contain',
                      marginLeft: wp(8),
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontFamily: fontFamily.poppins500,
                      fontSize: fontSize(14),
                      color: '#979797',
                      marginTop: hp(3),
                    }}>
                    {mainServiceTitle}
                  </Text>
                </View>

                {/* <Text
                  style={{
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins600,
                    color: colors.pureBlack,
                  }}>
                  Rs. 120
                </Text> */}
              </View>

              {/* <View
                style={{
                  width: '100%',
                  height: hp(1),
                  backgroundColor: '#E6E6E6',
                  marginTop: hp(13),
                }}
              /> */}

              {/* <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: hp(10),
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Image
                    source={icons.timer_Icon}
                    style={{
                      width: hp(12),
                      height: hp(12),
                      resizeMode: 'contain',
                    }}
                  />
                  <Text
                    style={{
                      fontSize: fontSize(14),
                      fontFamily: fontFamily.poppins500,
                      color: '#757575',
                      marginLeft: wp(11),
                      top: 1.5,
                    }}>
                    ETA : 20 Mins
                  </Text>
                </View>

                <TouchableOpacity activeOpacity={0.6}>
                  <Text
                    style={{
                      color: '#731EE2',
                      fontFamily: fontFamily.poppins600,
                      fontSize: fontSize(14),
                      marginRight: wp(7),
                      top: 1,
                    }}>
                    View Profile
                  </Text>
                </TouchableOpacity>
              </View> */}
            </View>

            {/*Date Time Schedule*/}

            <View
              style={{
                marginTop: hp(10),
                flexDirection: 'row',
                // backgroundColor: 'orange',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins500,
                }}>
                Set Appointment
              </Text>
            </View>

            {isInstantBooking ? (
              <View style={{marginTop: hp(20)}}>
                <View
                  style={{
                    width: '100%',
                    height: hp(87),
                    borderColor: '#E8E8E8',
                    borderWidth: hp(1),
                    borderRadius: hp(18),
                    justifyContent: 'center',
                    backgroundColor: colors.white,
                    paddingHorizontal: wp(18),
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={{
                        width: hp(45),
                        height: hp(45),
                        borderRadius: hp(50),
                        backgroundColor: '#F6F0FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        source={icons.quick_Book_Icon}
                        style={{
                          width: hp(20),
                          height: hp(20),
                          resizeMode: 'contain',
                          tintColor: '#731EE2',
                        }}
                      />
                    </View>

                    <View style={{marginLeft: wp(16)}}>
                      <Text
                        style={{
                          color: '#222222',
                          fontSize: fontSize(13),
                          fontFamily: fontFamily.poppins400,
                        }}>
                        Arriving In
                      </Text>
                      <Text
                        style={{
                          color: colors.pureBlack,
                          fontSize: fontSize(17),
                          fontFamily: fontFamily.poppins700,
                          marginTop: hp(2),
                        }}>
                        {estimatedArrival.endsWith('.')
                          ? estimatedArrival
                          : `${estimatedArrival}.`}
                      </Text>
                    </View>

                    <View style={{position: 'absolute', right: wp(1)}}>
                      <Image
                        source={icons.bottom_Arrow_Icon}
                        style={{
                          width: hp(10),
                          height: hp(12),
                          resizeMode: 'contain',
                          transform: [{rotate: '-90deg'}],
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{marginTop: hp(20)}}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => setDateModalVisible(true)}
                  style={{
                    width: '100%',
                    height: hp(87),
                    borderColor: '#E8E8E8',
                    borderWidth: hp(1),
                    borderRadius: hp(18),
                    justifyContent: 'center',
                    backgroundColor: colors.white,
                    paddingHorizontal: wp(18),
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={{
                        width: hp(45),
                        height: hp(45),
                        borderRadius: hp(50),
                        backgroundColor: '#F6F0FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        source={icons.motor_Cycle_Icon}
                        style={{
                          width: wp(20),
                          height: hp(14),
                          resizeMode: 'contain',
                        }}
                      />
                    </View>

                    <View style={{marginLeft: wp(19)}}>
                      <Text
                        style={{
                          color: '#969696',
                          fontSize: fontSize(16),
                          fontFamily: fontFamily.poppins600,
                        }}>
                        {selectedDate && selectedTime
                          ? `${formatDate(selectedDate)} | ${selectedTime}`
                          : 'Select Day & Time'}
                      </Text>
                    </View>

                    <View style={{position: 'absolute', right: wp(1)}}>
                      <Image
                        source={icons.bottom_Arrow_Icon}
                        style={{
                          width: hp(10),
                          height: hp(12),
                          resizeMode: 'contain',
                          transform: [{rotate: '-90deg'}],
                        }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* CONFIRM YOUR ADDRESS SECTION */}
            <View style={{marginTop: hp(24)}}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins500,
                }}>
                Confirm Your Address
              </Text>
              <Text
                style={{
                  color: '#7D7D7D',
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  marginTop: hp(4),
                }}>
                Your full address is shared only after the vendor confirms the
                booking.
              </Text>

              {/* Address Card */}
              <View
                style={{
                  width: '100%',
                  borderColor: '#E8E8E8',
                  borderWidth: hp(1),
                  borderRadius: hp(18),
                  backgroundColor: colors.white,
                  padding: wp(16),
                  marginTop: hp(14),
                }}>
                <Text
                  style={{
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                    color: '#7D7D7D',
                    marginBottom: hp(10),
                  }}>
                  {locationTypeLabel}
                </Text>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View
                    style={{
                      width: hp(45),
                      height: hp(45),
                      borderRadius: hp(50),
                      backgroundColor: '#F6F0FF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: wp(14),
                    }}>
                    <Image
                      source={
                        icons.purple_Home_Icon ||
                        icons.home_Icon ||
                        icons.location_Icon
                      }
                      style={{
                        width: hp(20),
                        height: hp(20),
                        resizeMode: 'contain',
                        tintColor: '#731EE2',
                      }}
                    />
                  </View>

                  <Text
                    style={{
                      flex: 1,
                      color: colors.pureBlack,
                      fontSize: fontSize(15),
                      fontFamily: fontFamily.poppins600,
                      lineHeight: hp(22),
                    }}>
                    {fullDisplayAddress}
                  </Text>
                </View>

                {/* Divider Line */}
                <View
                  style={{
                    width: '100%',
                    height: hp(1),
                    backgroundColor: '#E8E8E8',
                    marginVertical: hp(14),
                  }}
                />

                {/* Bottom Change Address Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontSize: fontSize(13),
                      fontFamily: fontFamily.poppins400,
                      color: colors.pureBlack,
                    }}>
                    Not this one?
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => navigation.navigate('ManageAddressesScreen')}
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: '#731EE2',
                        fontSize: fontSize(13),
                        fontFamily: fontFamily.poppins600,
                        marginRight: wp(6),
                      }}>
                      Change New
                    </Text>
                    <Image
                      source={icons.bottom_Arrow_Icon}
                      style={{
                        width: hp(8),
                        height: hp(10),
                        resizeMode: 'contain',
                        tintColor: '#731EE2',
                        transform: [{rotate: '-90deg'}],
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text
              style={{
                color: colors.pureBlack,
                marginTop: hp(24),
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              Price Breakdown
            </Text>

            <View
              style={{
                width: '100%',
                borderWidth: 1.5,
                borderColor: '#E8E8E8',
                borderRadius: hp(18),
                marginTop: hp(20),
                paddingVertical: hp(15),
                paddingHorizontal: wp(20),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    color: '#6E6E6E',
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {feeLabel}
                </Text>
                <Text
                  style={{
                    color: 'black',
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {formatAmount(feeVal)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: hp(10),
                }}>
                <Text
                  style={{
                    color: '#6E6E6E',
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Service Fee ({serviceFeePct})
                </Text>
                <Text
                  style={{
                    color: 'black',
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {formatAmount(serviceFeeVal)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: hp(10),
                }}>
                <Text
                  style={{
                    color: '#6E6E6E',
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Taxes
                </Text>
                <Text
                  style={{
                    color: 'black',
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {formatAmount(taxVal)}
                </Text>
              </View>

              <View
                style={{
                  width: '100%',
                  height: hp(1),
                  backgroundColor: '#E8E8E8',
                  marginTop: hp(20),
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: hp(18),
                }}>
                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  Total Payable
                </Text>
                <Text
                  style={{
                    color: colors.primaryColor,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  {formatAmount(totalPayableVal)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Demo');
              }}
              activeOpacity={0.6}
              style={{
                width: '100%',
                height: hp(50),
                borderRadius: hp(50),
                backgroundColor: colors.primaryColor,
                marginTop: hp(24),
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                Confirm & Book
              </Text>

              <Image
                source={icons.back_Arrow_Icon}
                style={{
                  width: hp(14),
                  height: hp(14),
                  tintColor: colors.white,
                  transform: [{rotate: '180deg'}],
                  marginLeft: wp(15),
                  top: -2,
                }}
              />
            </TouchableOpacity>

            <View style={{alignItems: 'center', marginTop: hp(24)}}>
              <Text
                style={{
                  color: '#6E6E6E',
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins400,
                }}>
                By tapping “Confirm & Book, you agree our
              </Text>
              <Text
                style={{
                  color: '#6E6E6E',
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins400,
                }}>
                Terms of Service and Privacy Policy.
              </Text>
            </View>
          </View>

          <View style={{height: hp(30)}} />
        </ScrollView>
      )}

      {/* DATE MODAL */}
      <Modal visible={dateModalVisible} transparent animationType="none">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setDateModalVisible(false)}>
          <Pressable
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
            onPress={e => e.stopPropagation()}>
            <Calendar
              minDate={today}
              onDayPress={day => {
                setSelectedDate(day.dateString);
                setDateModalVisible(false);
              }}
              markedDates={{
                ...(selectedDate && {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: '#6C2BD9',
                    selectedTextColor: '#fff',
                  },
                }),
              }}
              theme={{
                selectedDayBackgroundColor: '#6C2BD9',
                todayTextColor: '#6C2BD9',
                arrowColor: '#6C2BD9',
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* TIME PICKER (NATIVE) */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="clock"
          onChange={(event, date) => {
            setShowTimePicker(false);

            if (event.type === 'set' && date) {
              setSelectedTime(formatTime(date));
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default BookingSummaryScreen;
