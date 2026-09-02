import React, {useEffect, useRef, useState} from 'react';
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
  Alert,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {colors} from '../../../utils/colors';
import {icons} from '../../../assets';
import {hp, fontSize, fontFamily, wp} from '../../../utils/helpers';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import SwitchButton from '../../../components/switchButton';
import {Calendar} from 'react-native-calendars';
import {
  getBookingById,
  saveCustomerAddress,
  updateBookingAddress,
} from '../../../actions/customerAuthActions';

const BookingSummaryScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const routeBookingId = route.params?.bookingId || '9F8A2D3C';

  const [isEnabled, setIsEnabled] = useState(false);
  const [fetchingBooking, setFetchingBooking] = useState(true);
  const [apiBookingDetails, setApiBookingDetails] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const refAppointmentSheet = useRef();

  const weeklySchedule =
    bookingSummaryObj?.vendorAvailability?.weeklySchedule ||
    bookingSummaryObj?.vendor?.vendorAvailability?.weeklySchedule ||
    bookingObj?.vendorAvailability?.weeklySchedule ||
    bookingObj?.vendorId?.vendorAvailability?.weeklySchedule ||
    route.params?.item?.vendorAvailability?.weeklySchedule ||
    route.params?.vendor?.vendorAvailability?.weeklySchedule ||
    [];

  const getUpcomingDays = () => {
    const months = [
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
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    const result = [];
    const now = new Date();

    for (let i = 0; i < 3; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayIdx = d.getDay();
      const dayName = fullDayNames[dayIdx];
      const dayLabel = i === 0 ? 'Today' : daysOfWeek[dayIdx];
      const dateStr = `${d.getDate()} ${months[d.getMonth()]}`;

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;

      let isOpen = true;
      if (Array.isArray(weeklySchedule) && weeklySchedule.length > 0) {
        const foundDay = weeklySchedule.find(
          s => String(s?.day).toLowerCase() === dayName,
        );
        if (foundDay) {
          isOpen = Boolean(foundDay.isOpen);
        }
      }

      result.push({
        id: i,
        dayLabel,
        dateStr,
        fullFormatted: `${dayLabel}, ${dateStr}`,
        isoDate,
        isOpen,
        dayName,
      });
    }
    return result;
  };

  const daysList = getUpcomingDays();
  const firstOpenDay = daysList.find(d => d.isOpen) || daysList[0];
  const [selectedDayObj, setSelectedDayObj] = useState(firstOpenDay);

  const timeSlotObjects = [
    {slot: '9 am – 12 pm', endHour: 12},
    {slot: '12 pm – 3 pm', endHour: 15},
    {slot: '3 pm – 6 pm', endHour: 18},
  ];

  const isTimeSlotDisabled = (slotObj, dayObj) => {
    if (!dayObj || dayObj.dayLabel !== 'Today') {
      return false;
    }
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    if (currentHour > slotObj.endHour) {
      return true;
    }
    if (currentHour === slotObj.endHour && currentMin > 0) {
      return true;
    }
    return false;
  };

  const firstAvailableSlot =
    timeSlotObjects.find(s => !isTimeSlotDisabled(s, firstOpenDay))?.slot ||
    timeSlotObjects[0].slot;

  const [tempTimeSlot, setTempTimeSlot] = useState(firstAvailableSlot);

  useEffect(() => {
    const openDay = daysList.find(d => d.isOpen);
    if (openDay && (!selectedDayObj || !selectedDayObj.isOpen)) {
      setSelectedDayObj(openDay);
    }
  }, [apiBookingDetails]);

  useEffect(() => {
    if (selectedDayObj) {
      const avail = timeSlotObjects.find(
        s => !isTimeSlotDisabled(s, selectedDayObj),
      );
      if (avail) {
        setTempTimeSlot(avail.slot);
      }
    }
  }, [selectedDayObj]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const reduxBookingDetails = useSelector(
    state => state.auth?.activeBookingDetails,
  );
  const {user} = useSelector(state => state.auth || {});

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

  const selectedAddress = route.params?.selectedAddress || {};

  // Customer Address dynamic fields
  const customerAddrObj =
    selectedAddress ||
    bookingSummaryObj?.customerAddress ||
    (typeof bookingObj?.addressId === 'object' ? bookingObj?.addressId : {}) ||
    {};

  const {fullAddress: reduxFullAddress, place: reduxPlace} = useSelector(
    state => state.location || {},
  );

  const categoryName = (
    vendorObj?.category ||
    bookingObj?.vendorId?.categoryId?.title ||
    bookingSummaryObj?.vendor?.category ||
    apiBookingDetails?.data?.booking?.vendorId?.categoryId?.title ||
    route.params?.category?.name ||
    route.params?.item?.categoryTitle ||
    route.params?.item?.category_title ||
    route.params?.vendor?.categoryTitle ||
    route.params?.item?.serviceDetails?.title ||
    route.params?.item?.service ||
    apiBookingDetails?.categoryId?.name ||
    apiBookingDetails?.serviceId?.name ||
    ''
  ).toLowerCase();

  const isSalonCategory =
    categoryName.includes('salon') ||
    categoryName.includes('saloon') ||
    categoryName.includes('beauty') ||
    categoryName.includes('barber');

  const saloonVendorObj =
    route.params?.vendor ||
    route.params?.item?.vendor ||
    route.params?.item?.vendorId ||
    route.params?.item ||
    vendorObj ||
    apiBookingDetails?.vendorId ||
    apiBookingDetails?.vendor ||
    {};

  const saloonBusinessName =
    saloonVendorObj?.businessName ||
    saloonVendorObj?.business_name ||
    saloonVendorObj?.name ||
    businessName ||
    'Saloon Location';

  const saloonBizAddr =
    bookingSummaryObj?.businessAddress ||
    bookingSummaryObj?.vendor?.businessAddress ||
    bookingObj?.businessAddress ||
    bookingObj?.vendorId?.businessAddress ||
    saloonVendorObj?.businessAddress ||
    saloonVendorObj?.address ||
    {};

  const formatSaloonAddr = addr => {
    if (typeof addr === 'string') {
      return addr;
    }
    if (typeof addr === 'object' && addr !== null) {
      const parts = [
        addr.addressLine1 ||
          addr.address1 ||
          addr.line1 ||
          addr.houseNo ||
          addr.street,
        addr.addressLine2 ||
          addr.address2 ||
          addr.line2 ||
          addr.area ||
          addr.landmark,
        addr.city,
        addr.state,
        addr.pinCode || addr.pincode || addr.zipCode,
      ].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    return null;
  };

  const saloonAddressText =
    formatSaloonAddr(saloonBizAddr) ||
    formatSaloonAddr(saloonVendorObj?.businessAddress) ||
    formatSaloonAddr(saloonVendorObj?.address) ||
    (typeof saloonVendorObj?.location === 'string'
      ? saloonVendorObj.location
      : null) ||
    [
      saloonVendorObj?.businessName || saloonVendorObj?.name,
      saloonVendorObj?.city || saloonVendorObj?.place,
      saloonVendorObj?.state || 'Gujarat',
    ]
      .filter(Boolean)
      .join(', ');

  const vendorSaloonAddressId =
    saloonVendorObj?.addressId ||
    saloonVendorObj?.vendorAddressId ||
    saloonVendorObj?.address?._id ||
    saloonVendorObj?.address?.id ||
    saloonVendorObj?._id ||
    saloonVendorObj?.id;

  const locationTypeLabel = reduxPlace || 'Current Location';

  const fullDisplayAddress =
    reduxFullAddress ||
    customerAddrObj?.displayAddress ||
    [
      customerAddrObj?.floor,
      customerAddrObj?.address,
      customerAddrObj?.landmark,
    ]
      .filter(Boolean)
      .join(', ') ||
    'Bardoli, Gujarat, India';

  const displayHeaderTitle = isSalonCategory
    ? 'Saloon Location'
    : 'Confirm Your Address';

  const displayHeaderSubtitle = isSalonCategory
    ? null
    : 'Your full address is shared only after the vendor confirms the booking.';

  const displayCardLabel = isSalonCategory
    ? saloonBusinessName
    : locationTypeLabel;

  const displayAddressText = isSalonCategory
    ? saloonAddressText
    : fullDisplayAddress;

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

  const handleConfirmAndBookPress = () => {
    // Validation for Salon Category: Ensure date and time slot are selected!
    if (isSalonCategory) {
      if (!selectedDate || !selectedTime) {
        Alert.alert(
          'Notice',
          'Please select a date and time slot before proceeding with your booking.',
        );
        refAppointmentSheet.current?.open();
        return;
      }
    }

    setConfirmLoading(true);

    const activeLat = Number(customerAddrObj?.latitude || 21.1255);
    const activeLng = Number(customerAddrObj?.longitude || 73.1155);

    const activePinCode =
      customerAddrObj?.pinCode ||
      customerAddrObj?.postCode ||
      customerAddrObj?.zipCode ||
      '394601';

    const activeCity =
      customerAddrObj?.city || customerAddrObj?.town || reduxPlace || 'Bardoli';

    const activeState =
      customerAddrObj?.state || customerAddrObj?.stateName || 'Gujarat';

    const activeHouseNumber =
      customerAddrObj?.houseNumber || customerAddrObj?.building || '';

    const activeFloor = customerAddrObj?.floor || '';
    const activeLandmark = customerAddrObj?.landmark || '';

    const rawLocType = String(
      customerAddrObj?.locationType || customerAddrObj?.type || 'home',
    )
      .toLowerCase()
      .trim();

    const activeLocationType = [
      'home',
      'work',
      'hotel',
      'other',
      'unlabeled',
    ].includes(rawLocType)
      ? rawLocType
      : 'unlabeled';

    const realCustomerName =
      user?.fullName ||
      user?.name ||
      user?.user?.fullName ||
      user?.user?.name ||
      user?.customerUser?.fullName ||
      user?.customerUser?.name ||
      user?.data?.user?.fullName ||
      user?.data?.user?.name ||
      user?.data?.fullName ||
      user?.data?.name ||
      'saurabh singh';

    const realCustomerMobileStr =
      user?.mobile ||
      user?.mobileNumber ||
      user?.phoneNumber ||
      user?.phone ||
      user?.user?.mobile ||
      user?.user?.mobileNumber ||
      user?.user?.phoneNumber ||
      user?.customerUser?.mobile ||
      user?.customerUser?.mobileNumber ||
      user?.data?.user?.mobile ||
      user?.data?.user?.mobileNumber ||
      user?.data?.mobile ||
      '7405665654';

    const realCustomerMobileNum = Number(
      String(realCustomerMobileStr).replace(/[^0-9]/g, '') || 7405665654,
    );

    const addressPayload = {
      address:
        reduxFullAddress ||
        customerAddrObj?.address ||
        'Bardoli, Gujarat, India',
      houseNumber: activeHouseNumber,
      floor: activeFloor,
      landmark: activeLandmark,
      city: activeCity,
      state: activeState,
      pinCode: activePinCode,
      locationType: activeLocationType,
      receiverName: realCustomerName,
      receiverMobile: realCustomerMobileNum,
      isDefault: false,
      latitude: activeLat,
      longitude: activeLng,
      location: {
        type: 'Point',
        coordinates: [activeLng, activeLat],
      },
    };

    const isValidObjectId = val =>
      typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val.trim());

    const existingAddrId = [
      customerAddrObj?._id,
      customerAddrObj?.id,
      customerAddrObj?.addressId,
      selectedAddress?._id,
      selectedAddress?.id,
    ]
      .map(val => (isValidObjectId(val) ? String(val).trim() : null))
      .find(Boolean);

    const mongoBookingId =
      [
        bookingObj?._id,
        bookingObj?.id,
        activeBooking?._id,
        activeBooking?.id,
        activeBooking?.data?._id,
        activeBooking?.data?.id,
        route.params?.bookingData?._id,
        route.params?.bookingData?.id,
        route.params?.bookingData?.data?._id,
        route.params?.bookingData?.data?.id,
        routeBookingId,
      ]
        .map(val => (isValidObjectId(val) ? String(val).trim() : null))
        .find(Boolean) || '665b1234567890abcdef1234';

    const customerId = [
      user?._id,
      user?.id,
      user?.user?._id,
      user?.user?.id,
      user?.customerUser?._id,
      user?.customerUser?.id,
      user?.data?.user?._id,
      user?.data?.user?.id,
      user?.data?._id,
      user?.data?.id,
      bookingObj?.customerId?._id,
      bookingObj?.customerId?.id,
      bookingObj?.customerId,
    ]
      .map(val => (isValidObjectId(val) ? String(val).trim() : null))
      .find(Boolean);

    const proceedToUpdateBooking = targetAddressId => {
      const updateBookingPayload = {};

      if (!isSalonCategory) {
        if (!isValidObjectId(targetAddressId)) {
          console.log(
            '[BookingSummaryScreen Error] Invalid address ID format:',
            targetAddressId,
          );
          setConfirmLoading(false);
          Alert.alert(
            'Error',
            'Invalid address selected. Please select a valid address.',
          );
          return;
        }
        updateBookingPayload.addressId = String(targetAddressId).trim();
      }

      if (customerId && isValidObjectId(customerId)) {
        updateBookingPayload.customerId = String(customerId).trim();
      }

      if (selectedDate && selectedTime) {
        const formattedBookingDate =
          selectedDayObj?.isoDate || new Date().toISOString().split('T')[0];
        const formattedTimeSlot = String(selectedTime).replace('–', '-');

        updateBookingPayload.bookingDate = formattedBookingDate;
        updateBookingPayload.timeSlot = formattedTimeSlot;
      }

      console.log('\n==================================================');
      console.log(
        `[BookingSummaryScreen Step 2 -> Calling PUT /v1/customer/bookings/${mongoBookingId}]`,
      );
      console.log(`MongoDB Booking ID: ${mongoBookingId}`);
      console.log(`Is Salon Category: ${isSalonCategory}`);
      console.log('Payload:', JSON.stringify(updateBookingPayload, null, 2));
      console.log('==================================================\n');

      dispatch(
        updateBookingAddress(
          mongoBookingId,
          updateBookingPayload,
          (uErr, uRes) => {
            setConfirmLoading(false);
            if (uErr) {
              console.log(
                '[BookingSummaryScreen] updateBookingAddress Error:',
                uErr,
              );
            } else {
              console.log(
                '[BookingSummaryScreen Step 2 Success -> Booking Address Updated]',
                JSON.stringify(uRes, null, 2),
              );
            }
            navigation.navigate('Demo');
          },
        ),
      );
    };

    if (isSalonCategory) {
      console.log(
        `\n[BookingSummaryScreen] Saloon Category -> Omitting addressId in payload. Calling PUT /v1/customer/bookings/${mongoBookingId}.\n`,
      );
      proceedToUpdateBooking();
      return;
    }

    const userAddresses =
      user?.addresses ||
      user?.customerUser?.addresses ||
      user?.data?.user?.addresses ||
      [];

    const matchingSavedAddr = Array.isArray(userAddresses)
      ? userAddresses.find(item => {
          const itemId = item?._id || item?.id;
          if (!isValidObjectId(itemId)) {
            return false;
          }
          const itemText = (item?.address || item?.displayAddress || '')
            .toLowerCase()
            .trim();
          const targetText = (addressPayload?.address || '')
            .toLowerCase()
            .trim();
          return (
            itemText.length > 0 &&
            targetText.length > 0 &&
            (itemText.includes(targetText) || targetText.includes(itemText))
          );
        })
      : null;

    const targetAddrId =
      existingAddrId || matchingSavedAddr?._id || matchingSavedAddr?.id;

    if (targetAddrId && isValidObjectId(targetAddrId)) {
      console.log(
        `\n[BookingSummaryScreen] Reusing matching existing address ID: ${targetAddrId}. Skipping POST saveCustomerAddress to avoid duplicate entry in ManageAddressesScreen.\n`,
      );
      proceedToUpdateBooking(targetAddrId);
    } else {
      console.log('\n==================================================');
      console.log(
        '[BookingSummaryScreen Confirm & Book -> Calling saveCustomerAddress]',
      );
      console.log('Endpoint: POST /v1/customer/address');
      console.log('Payload:', JSON.stringify(addressPayload, null, 2));
      console.log('==================================================\n');

      dispatch(
        saveCustomerAddress(addressPayload, (error, responseData) => {
          if (error) {
            console.log(
              '[BookingSummaryScreen] saveCustomerAddress Error:',
              error,
            );
            setConfirmLoading(false);
            Alert.alert(
              'Error',
              error?.message || 'Failed to save address details',
            );
            return;
          }

          console.log(
            '[BookingSummaryScreen saveCustomerAddress Success Response]:',
            JSON.stringify(responseData, null, 2),
          );

          const resData = responseData?.data || responseData || {};
          const candidateIds = [
            resData?._id,
            resData?.id,
            resData?.data?._id,
            resData?.data?.id,
            responseData?._id,
            responseData?.id,
            responseData?.data?._id,
            responseData?.data?.id,
          ];

          const createdAddressId = candidateIds
            .map(val => (isValidObjectId(val) ? String(val).trim() : null))
            .find(Boolean);

          if (createdAddressId) {
            proceedToUpdateBooking(createdAddressId);
          } else {
            console.log(
              '[BookingSummaryScreen] No valid MongoDB ObjectId returned by saveCustomerAddress',
            );
            setConfirmLoading(false);
            Alert.alert(
              'Error',
              'Unable to retrieve valid address record. Please try again.',
            );
          }
        }),
      );
    }
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

            {isInstantBooking && !isSalonCategory ? (
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
                  onPress={() => refAppointmentSheet.current?.open()}
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
                        source={
                          isSalonCategory
                            ? icons.salon_Icon || icons.purple_Home_Icon
                            : icons.motor_Cycle_Icon || icons.purple_Home_Icon
                        }
                        style={{
                          width: hp(22),
                          height: hp(22),
                          resizeMode: 'contain',
                          tintColor: '#731EE2',
                        }}
                      />
                    </View>

                    <View style={{marginLeft: wp(16), flex: 1}}>
                      {selectedDate && selectedTime ? (
                        <>
                          <Text
                            style={{
                              color: '#222222',
                              fontSize: fontSize(13),
                              fontFamily: fontFamily.poppins400,
                            }}>
                            Selected Day & Time
                          </Text>
                          <Text
                            style={{
                              color: colors.pureBlack,
                              fontSize: fontSize(16),
                              fontFamily: fontFamily.poppins700,
                              marginTop: hp(2),
                            }}>
                            {`${
                              selectedDayObj?.dayLabel ||
                              selectedDate.split(',')[0]
                            }, ${selectedTime.replace('–', 'to')}`}
                          </Text>
                        </>
                      ) : (
                        <Text
                          style={{
                            color: '#969696',
                            fontSize: fontSize(16),
                            fontFamily: fontFamily.poppins600,
                          }}>
                          Select Day & Time
                        </Text>
                      )}
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
                {displayHeaderTitle}
              </Text>
              {Boolean(displayHeaderSubtitle) && (
                <Text
                  style={{
                    color: '#7D7D7D',
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                    marginTop: hp(4),
                  }}>
                  {displayHeaderSubtitle}
                </Text>
              )}

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
                  {displayCardLabel}
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
                        isSalonCategory
                          ? icons.location_Icon || icons.purple_Home_Icon
                          : icons.purple_Home_Icon ||
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
                    {displayAddressText}
                  </Text>
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
              {/* Individual Services Rows for Salon vs Single Visiting Fee Row for Non-Salon */}
              {isSalonCategory && servicesList.length > 0 ? (
                servicesList.map((svc, idx) => {
                  const rawName =
                    svc?.rawTitle ||
                    svc?.title ||
                    svc?.name ||
                    `Service ${idx + 1}`;
                  const sTitle = String(rawName).replace(/\s*Fee$/i, '');
                  const sPrice =
                    svc?.price ??
                    svc?.charge ??
                    svc?.amount ??
                    (servicesList.length === 1 ? feeVal : 0);

                  return (
                    <View
                      key={
                        svc?.id || svc?.serviceId || svc?.vendorServiceId || idx
                      }
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: idx === 0 ? 0 : hp(10),
                      }}>
                      <Text
                        style={{
                          color: '#6E6E6E',
                          fontSize: fontSize(16),
                          fontFamily: fontFamily.poppins400,
                        }}>
                        {sTitle}
                      </Text>
                      <Text
                        style={{
                          color: 'black',
                          fontSize: fontSize(16),
                          fontFamily: fontFamily.poppins400,
                        }}>
                        {formatAmount(sPrice)}
                      </Text>
                    </View>
                  );
                })
              ) : (
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
                    Visiting Fee
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
              )}

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
              onPress={handleConfirmAndBookPress}
              activeOpacity={confirmLoading ? 1 : 0.6}
              disabled={confirmLoading}
              style={{
                width: '100%',
                height: hp(50),
                borderRadius: hp(50),
                backgroundColor: colors.primaryColor,
                marginTop: hp(24),
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                opacity: confirmLoading ? 0.6 : 1,
              }}>
              {confirmLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
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
                </>
              )}
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

      {/* SELECT DAY & TIME BOTTOM SHEET */}
      <RBSheet
        ref={refAppointmentSheet}
        height={hp(480)}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            paddingHorizontal: wp(20),
            paddingTop: hp(16),
            backgroundColor: colors.white,
          },
          draggableIcon: {
            backgroundColor: '#D1D5DB',
            width: wp(40),
          },
        }}>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontSize: fontSize(18),
              fontFamily: fontFamily.poppins600,
              color: colors.pureBlack,
            }}>
            Select Day & Time
          </Text>

          <Text
            style={{
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
              color: '#7D7D7D',
              marginTop: hp(4),
              marginBottom: hp(18),
            }}>
            We'll send you timely reminders before your appointment begins.
          </Text>

          {/* Date selector cards row */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            {daysList.map(item => {
              const isSelected = selectedDayObj?.id === item.id;
              const isDisabled = !item.isOpen;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={isDisabled ? 1 : 0.7}
                  disabled={isDisabled}
                  onPress={() => {
                    if (!isDisabled) {
                      setSelectedDayObj(item);
                    }
                  }}
                  style={{
                    flex: 1,
                    marginHorizontal: wp(4),
                    paddingVertical: hp(12),
                    borderRadius: hp(16),
                    borderWidth: isSelected && !isDisabled ? hp(1.5) : hp(1),
                    borderColor: isDisabled
                      ? '#E5E5E5'
                      : isSelected
                      ? '#731EE2'
                      : '#E8E8E8',
                    backgroundColor: isDisabled
                      ? '#F5F5F5'
                      : isSelected
                      ? '#F6F0FF'
                      : colors.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isDisabled ? 0.45 : 1,
                  }}>
                  <Text
                    style={{
                      fontSize: fontSize(14),
                      fontFamily: fontFamily.poppins600,
                      color: isDisabled
                        ? '#A3A3A3'
                        : isSelected
                        ? '#731EE2'
                        : colors.pureBlack,
                    }}>
                    {item.dayLabel}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize(12),
                      fontFamily: fontFamily.poppins400,
                      color: isDisabled
                        ? '#A3A3A3'
                        : isSelected
                        ? '#731EE2'
                        : '#969696',
                      marginTop: hp(2),
                    }}>
                    {item.dateStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Available Time slots */}
          <Text
            style={{
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins600,
              color: colors.pureBlack,
              marginTop: hp(20),
              marginBottom: hp(12),
            }}>
            Available Time slots
          </Text>

          {/* Time slot pill list */}
          {timeSlotObjects.map(slotObj => {
            const slot = slotObj.slot;
            const isSelected = tempTimeSlot === slot;
            const isDisabled = isTimeSlotDisabled(slotObj, selectedDayObj);

            return (
              <TouchableOpacity
                key={slot}
                activeOpacity={isDisabled ? 1 : 0.7}
                disabled={isDisabled}
                onPress={() => {
                  if (!isDisabled) {
                    setTempTimeSlot(slot);
                  }
                }}
                style={{
                  width: '100%',
                  height: hp(44),
                  borderRadius: hp(50),
                  borderWidth: isSelected && !isDisabled ? hp(1.5) : hp(1),
                  borderColor: isDisabled
                    ? '#E5E5E5'
                    : isSelected
                    ? '#731EE2'
                    : '#E8E8E8',
                  backgroundColor: isDisabled
                    ? '#F5F5F5'
                    : isSelected
                    ? '#F6F0FF'
                    : colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: hp(10),
                  opacity: isDisabled ? 0.45 : 1,
                }}>
                <Text
                  style={{
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins600,
                    color: isDisabled
                      ? '#A3A3A3'
                      : isSelected
                      ? '#731EE2'
                      : colors.pureBlack,
                  }}>
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Confirm Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setSelectedDate(selectedDayObj.fullFormatted);
              setSelectedTime(tempTimeSlot);
              refAppointmentSheet.current?.close();
            }}
            style={{
              width: '100%',
              height: hp(48),
              borderRadius: hp(50),
              backgroundColor: '#731EE2',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: hp(18),
              marginBottom: hp(20),
            }}>
            <Text
              style={{
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins600,
                color: colors.white,
              }}>
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default BookingSummaryScreen;
