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
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import SwitchButton from '../../../components/switchButton';
import {Calendar} from 'react-native-calendars';
import {
  getBookingById,
  saveCustomerAddress,
  updateBookingAddress,
  createBooking,
} from '../../../actions/customerAuthActions';
import {setLocation} from '../../../actions/locationActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookingSummaryScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const routeBookingId = route.params?.bookingId || '9F8A2D3C';

  const reduxBookingDetails = useSelector(
    state => state.auth?.activeBookingDetails,
  );
  const {user} = useSelector(state => state.auth || {});

  const [isEnabled, setIsEnabled] = useState(false);
  const [fetchingBooking, setFetchingBooking] = useState(true);
  const [apiBookingDetails, setApiBookingDetails] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const refAppointmentSheet = useRef();
  const refAddressSheet = useRef();
  const refRequestSheet = useRef();
  const [timerSeconds, setTimerSeconds] = useState(60);

  useEffect(() => {
    let interval;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const formatTimer = secs => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(
      2,
      '0',
    )}`;
  };

  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedAddressState, setSelectedAddressState] = useState(null);

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

  // Vendor & Service dynamic fields
  const routeItem = route.params?.item || {};
  const routeVendor = route.params?.vendor || {};

  const saloonVendorObj =
    route.params?.vendor ||
    route.params?.item?.vendor ||
    route.params?.item?.vendorId ||
    route.params?.item ||
    vendorObj ||
    apiBookingDetails?.vendorId ||
    apiBookingDetails?.vendor ||
    {};

  const categoryName = (
    route.params?.categoryName ||
    route.params?.category?.name ||
    route.params?.item?.vendorUser?.categoryId?.title ||
    route.params?.item?.vendorUser?.categoryId?.name ||
    route.params?.vendor?.vendorUser?.categoryId?.title ||
    route.params?.vendor?.vendorUser?.categoryId?.name ||
    saloonVendorObj?.vendorUser?.categoryId?.title ||
    saloonVendorObj?.vendorUser?.categoryId?.name ||
    saloonVendorObj?.categoryId?.title ||
    saloonVendorObj?.categoryId?.name ||
    vendorObj?.category ||
    bookingObj?.vendorId?.categoryId?.title ||
    bookingSummaryObj?.vendor?.category ||
    apiBookingDetails?.data?.booking?.vendorId?.categoryId?.title ||
    route.params?.item?.categoryTitle ||
    route.params?.item?.category_title ||
    route.params?.vendor?.categoryTitle ||
    route.params?.item?.serviceDetails?.title ||
    route.params?.item?.service ||
    route.params?.item?.name ||
    route.params?.vendor?.name ||
    route.params?.businessName ||
    saloonVendorObj?.businessName ||
    saloonVendorObj?.name ||
    apiBookingDetails?.categoryId?.name ||
    apiBookingDetails?.serviceId?.name ||
    ''
  ).toLowerCase();

  const isSalonCategory =
    Boolean(route.params?.isSalonCategory) ||
    categoryName.includes('salon') ||
    categoryName.includes('saloon') ||
    categoryName.includes('beauty') ||
    categoryName.includes('barber') ||
    String(route.params?.businessName || '')
      .toLowerCase()
      .includes('salon') ||
    String(route.params?.businessName || '')
      .toLowerCase()
      .includes('saloon') ||
    String(routeItem?.vendorUser?.businessName || '')
      .toLowerCase()
      .includes('salon') ||
    String(routeItem?.vendorUser?.businessName || '')
      .toLowerCase()
      .includes('saloon') ||
    String(routeVendor?.vendorUser?.businessName || '')
      .toLowerCase()
      .includes('salon') ||
    String(routeVendor?.vendorUser?.businessName || '')
      .toLowerCase()
      .includes('saloon') ||
    String(saloonVendorObj?.businessName || saloonVendorObj?.name || '')
      .toLowerCase()
      .includes('salon') ||
    String(saloonVendorObj?.businessName || saloonVendorObj?.name || '')
      .toLowerCase()
      .includes('saloon');

  const vendorAvailabilityObj =
    bookingSummaryObj?.vendorAvailability ||
    bookingSummaryObj?.vendor?.vendorAvailability ||
    bookingObj?.vendorAvailability ||
    bookingObj?.vendorId?.vendorAvailability ||
    saloonVendorObj?.vendorAvailability ||
    saloonVendorObj?.vendorUser?.vendorAvailability ||
    routeVendor?.vendorAvailability ||
    routeItem?.vendorAvailability ||
    routeVendor?.vendorUser?.vendorAvailability ||
    routeItem?.vendorUser?.vendorAvailability ||
    apiBookingDetails?.vendorAvailability ||
    apiBookingDetails?.vendorId?.vendorAvailability ||
    apiBookingDetails?.vendor?.vendorAvailability ||
    saloonVendorObj?.docs?.[0]?.vendorAvailability ||
    routeItem?.docs?.[0]?.vendorAvailability ||
    routeVendor?.docs?.[0]?.vendorAvailability ||
    {};

  const weeklySchedule =
    vendorAvailabilityObj?.weeklySchedule ||
    bookingSummaryObj?.vendorAvailability?.weeklySchedule ||
    bookingSummaryObj?.vendor?.vendorAvailability?.weeklySchedule ||
    bookingObj?.vendorAvailability?.weeklySchedule ||
    bookingObj?.vendorId?.vendorAvailability?.weeklySchedule ||
    saloonVendorObj?.vendorAvailability?.weeklySchedule ||
    route.params?.item?.vendorAvailability?.weeklySchedule ||
    route.params?.vendor?.vendorAvailability?.weeklySchedule ||
    route.params?.item?.vendorUser?.vendorAvailability?.weeklySchedule ||
    route.params?.vendor?.vendorUser?.vendorAvailability?.weeklySchedule ||
    [];

  const vendorBookingOption = (
    vendorAvailabilityObj?.bookingOption ||
    vendorAvailabilityObj?.booking_option ||
    saloonVendorObj?.bookingOption ||
    saloonVendorObj?.vendorUser?.bookingOption ||
    routeVendor?.bookingOption ||
    routeItem?.bookingOption ||
    routeVendor?.vendorUser?.bookingOption ||
    routeItem?.vendorUser?.bookingOption ||
    route.params?.bookingOption ||
    route.params?.bookingType ||
    route.params?.bookingPayload?.bookingOption ||
    route.params?.bookingPayload?.bookingType ||
    appointmentObj?.bookingType ||
    bookingObj?.bookingType ||
    apiBookingDetails?.bookingType ||
    ''
  )
    .toLowerCase()
    .trim();

  // Booking mode: instant vs schedule
  const isInstantBooking = (() => {
    if (vendorBookingOption === 'instant') {
      return true;
    }
    if (vendorBookingOption === 'schedule') {
      return false;
    }
    if (
      vendorBookingOption.includes('instant') &&
      !vendorBookingOption.includes('schedule')
    ) {
      return true;
    }
    if (vendorBookingOption.includes('schedule')) {
      return false;
    }
    if (appointmentObj?.bookingType) {
      return String(appointmentObj.bookingType)
        .toLowerCase()
        .includes('instant');
    }
    if (bookingObj?.bookingType) {
      return String(bookingObj.bookingType).toLowerCase().includes('instant');
    }
    // Category-specific fallback: salon defaults to schedule, others default to instant
    return !isSalonCategory;
  })();

  const estimatedArrival =
    appointmentObj?.estimatedArrival ||
    bookingObj?.estimatedArrival ||
    '30-40 mins.';

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

  useEffect(() => {
    const existingDate =
      appointmentObj?.bookingDate ||
      appointmentObj?.date ||
      bookingObj?.bookingDate ||
      bookingObj?.date ||
      route.params?.bookingDate ||
      route.params?.bookingPayload?.bookingDate;

    const existingTime =
      appointmentObj?.timeSlot ||
      appointmentObj?.time ||
      bookingObj?.timeSlot ||
      bookingObj?.time ||
      route.params?.timeSlot ||
      route.params?.bookingPayload?.timeSlot;

    if (existingDate && !selectedDate) {
      setSelectedDate(existingDate);
    }
    if (existingTime && !selectedTime) {
      setSelectedTime(existingTime);
    }
  }, [apiBookingDetails, appointmentObj, bookingObj]);

  useEffect(() => {
    if (routeBookingId && !route.params?.bookingPayload) {
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

  // Vendor & Service dynamic fields

  const businessName =
    routeItem?.vendorUser?.businessName ||
    routeVendor?.vendorUser?.businessName ||
    routeItem?.businessName ||
    routeVendor?.businessName ||
    routeItem?.business_name ||
    routeVendor?.business_name ||
    vendorObj?.businessName ||
    vendorObj?.business_name ||
    vendorObj?.name ||
    bookingObj?.vendorId?.businessName ||
    bookingObj?.vendorId?.business_name ||
    bookingObj?.vendorId?.name ||
    bookingObj?.vendorId?.userId?.fullName ||
    bookingObj?.vendorId?.userId?.name ||
    routeItem?.vendorUser?.userId?.fullName ||
    routeItem?.vendorUser?.userId?.name ||
    routeVendor?.vendorUser?.userId?.fullName ||
    routeVendor?.vendorUser?.userId?.name ||
    routeItem?.name ||
    routeVendor?.name ||
    apiBookingDetails?.vendorId?.businessName ||
    apiBookingDetails?.vendorId?.userId?.fullName ||
    'Vendor Profile';

  const categoryTitle =
    routeItem?.categoryTitle ||
    routeItem?.category_title ||
    routeVendor?.categoryTitle ||
    routeVendor?.category_title ||
    vendorObj?.category ||
    bookingObj?.vendorId?.categoryId?.title ||
    'Service';

  const rawRatingVal =
    routeItem?.averageRating ??
    routeItem?.rating ??
    routeVendor?.averageRating ??
    routeVendor?.rating ??
    routeItem?.vendorUser?.averageRating ??
    routeItem?.vendorUser?.rating ??
    routeVendor?.vendorUser?.averageRating ??
    routeVendor?.vendorUser?.rating ??
    vendorObj?.rating ??
    bookingObj?.vendorId?.rating ??
    '4.5';

  const vendorRating =
    rawRatingVal !== undefined &&
    rawRatingVal !== null &&
    Number(rawRatingVal) > 0
      ? String(rawRatingVal)
      : '4.5';

  const staticFallbackImage =
    'https://images.unsplash.com/photo-1560066984-138dadb4c035';

  const rawVendorImage =
    routeItem?.vendorUser?.userId?.profilePic ||
    routeItem?.vendorUser?.userId?.profile_pic ||
    routeItem?.vendorUser?.userId?.profileImage ||
    routeItem?.vendorUser?.profilePic ||
    routeItem?.vendorUser?.profile_pic ||
    routeItem?.vendorUser?.profileImage ||
    routeVendor?.vendorUser?.userId?.profilePic ||
    routeVendor?.vendorUser?.userId?.profile_pic ||
    routeVendor?.vendorUser?.userId?.profileImage ||
    routeVendor?.vendorUser?.profilePic ||
    routeVendor?.vendorUser?.profile_pic ||
    routeVendor?.vendorUser?.profileImage ||
    routeItem?.profilePic ||
    routeItem?.profile_pic ||
    routeItem?.profileImage ||
    routeItem?.image ||
    routeItem?.imageUrl ||
    routeVendor?.profilePic ||
    routeVendor?.profile_pic ||
    routeVendor?.profileImage ||
    routeVendor?.image ||
    routeVendor?.imageUrl ||
    routeItem?.rawItem?.image ||
    routeItem?.rawItem?.profilePic ||
    routeItem?.rawItem?.profile_pic ||
    routeItem?.rawItem?.profileImage ||
    vendorObj?.profileImage ||
    vendorObj?.profilePic ||
    vendorObj?.profile_pic ||
    vendorObj?.image ||
    bookingObj?.vendorId?.userId?.profilePic ||
    bookingObj?.vendorId?.userId?.profile_pic ||
    bookingObj?.vendorId?.userId?.profileImage ||
    bookingObj?.vendorId?.profilePic ||
    bookingObj?.vendorId?.profileImage ||
    apiBookingDetails?.vendorId?.userId?.profilePic ||
    apiBookingDetails?.vendorId?.userId?.profile_pic ||
    apiBookingDetails?.vendorId?.userId?.profileImage ||
    staticFallbackImage;

  const vendorImage =
    imageError ||
    !rawVendorImage ||
    typeof rawVendorImage !== 'string' ||
    rawVendorImage.trim() === ''
      ? staticFallbackImage
      : rawVendorImage;

  const selectedAddress =
    selectedAddressState || route.params?.selectedAddress || {};

  // Customer Address dynamic fields
  const customerAddrObj =
    (selectedAddress &&
      Object.keys(selectedAddress).length > 0 &&
      selectedAddress) ||
    bookingSummaryObj?.customerAddress ||
    (typeof bookingObj?.addressId === 'object' ? bookingObj?.addressId : {}) ||
    {};

  const reduxLocationState = useSelector(state => state.location || {});
  const {fullAddress: reduxFullAddress, place: reduxPlace} = reduxLocationState;

  const loadSavedAddresses = async () => {
    try {
      const reduxUserObj =
        user?.customerUser || user?.user || user?.data?.user || user || {};
      let userAddresses = reduxUserObj?.addresses || user?.addresses || [];

      let storageAddresses = [];
      try {
        const rawAddresses = await AsyncStorage.getItem('ADDRESSES');
        if (rawAddresses) {
          storageAddresses = JSON.parse(rawAddresses);
        }
      } catch (e) {
        console.log('[BookingSummaryScreen] Storage address parse error:', e);
      }

      const allAddresses = [
        ...(Array.isArray(userAddresses) ? userAddresses : []),
        ...(Array.isArray(storageAddresses) ? storageAddresses : []),
      ].filter(Boolean);

      const map = new Map();
      allAddresses.forEach(item => {
        const key = item._id || item.id || item.address;
        if (key && !map.has(key)) {
          map.set(String(key), item);
        }
      });

      let savedList = Array.from(map.values());

      const activeHomeScreenAddress = reduxFullAddress || 'Current Location';

      const activeMobile =
        user?.mobile ||
        user?.mobileNumber ||
        user?.phoneNumber ||
        user?.user?.mobile ||
        user?.customerUser?.mobile ||
        '7405665654';

      const formattedMobile = String(activeMobile).startsWith('+')
        ? String(activeMobile)
        : `+91-${activeMobile}`;

      const currentLocationCard = {
        id: 'current_location_card_top',
        locationType: 'unlabeled',
        type: 'Current Location',
        address: activeHomeScreenAddress,
        displayAddress: activeHomeScreenAddress,
        mobile: formattedMobile,
        latitude: reduxLocationState?.latitude || 21.1255,
        longitude: reduxLocationState?.longitude || 73.1155,
      };

      const filteredSavedList = savedList.filter(item => {
        const addrStr = item?.address || item?.displayAddress || '';
        return !addrStr.includes('412, amazing star');
      });

      const finalCombinedList = [currentLocationCard, ...filteredSavedList];

      setSavedAddressesList(finalCombinedList);
    } catch (err) {
      console.log('[BookingSummaryScreen] loadSavedAddresses Error:', err);
    }
  };

  const handleOpenAddressSheet = () => {
    loadSavedAddresses();
    refAddressSheet.current?.open();
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSavedAddresses();
    }, [user, reduxFullAddress]),
  );

  const handleSelectAddressCard = addrItem => {
    setSelectedAddressState(addrItem);
    refAddressSheet.current?.close();
  };

  const selectedAddrText =
    customerAddrObj?.displayAddress ||
    customerAddrObj?.address ||
    [
      customerAddrObj?.houseNumber || customerAddrObj?.building,
      customerAddrObj?.floor,
      customerAddrObj?.landmark,
      customerAddrObj?.address,
      customerAddrObj?.city,
      customerAddrObj?.state,
      customerAddrObj?.pinCode || customerAddrObj?.zipCode,
    ]
      .filter(Boolean)
      .join(', ');

  const saloonBusinessName =
    route.params?.businessName ||
    saloonVendorObj?.vendorUser?.businessName ||
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
    saloonVendorObj?.vendorUser?.businessAddress ||
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
    route.params?.saloonAddressText ||
    route.params?.vendorAddressText ||
    formatSaloonAddr(saloonBizAddr) ||
    formatSaloonAddr(saloonVendorObj?.businessAddress) ||
    formatSaloonAddr(saloonVendorObj?.vendorUser?.businessAddress) ||
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

  const rawLocationType =
    customerAddrObj?.type || customerAddrObj?.locationType;

  const locationTypeLabel =
    typeof rawLocationType === 'string' &&
    rawLocationType.trim() !== '' &&
    rawLocationType !== 'unlabeled'
      ? rawLocationType.charAt(0).toUpperCase() + rawLocationType.slice(1)
      : reduxPlace || 'Current Location';

  const fullDisplayAddress =
    selectedAddrText || reduxFullAddress || 'Location updated';

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

  const parseAmountNumber = val => {
    if (typeof val === 'number') {
      return val;
    }
    if (!val) {
      return 0;
    }
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const servicesList = (() => {
    if (
      Array.isArray(route.params?.selectedServicesList) &&
      route.params.selectedServicesList.length > 0
    ) {
      return route.params.selectedServicesList;
    }
    if (
      Array.isArray(route.params?.bookingPayload?.services) &&
      route.params.bookingPayload.services.length > 0
    ) {
      return route.params.bookingPayload.services.map(s => ({
        id: s.serviceId || s.id,
        title: s.title || s.name || 'Service',
        price: parseAmountNumber(s.price || s.charge || 300),
      }));
    }
    if (
      Array.isArray(priceBreakdown?.services) &&
      priceBreakdown.services.length > 0
    ) {
      return priceBreakdown.services;
    }
    if (Array.isArray(route.params?.selectedServices)) {
      if (
        route.params.selectedServices.length > 0 &&
        typeof route.params.selectedServices[0] === 'object'
      ) {
        return route.params.selectedServices;
      }
      const rawVendorServices =
        routeItem?.services ||
        routeVendor?.services ||
        saloonVendorObj?.services ||
        [];
      if (Array.isArray(rawVendorServices) && rawVendorServices.length > 0) {
        return rawVendorServices
          .filter((_, idx) => route.params.selectedServices.includes(idx))
          .map(s => ({
            id: s._id || s.id,
            title:
              s.serviceId?.title ||
              s.serviceId?.name ||
              s.title ||
              s.name ||
              'Service',
            price: s.price || s.charge || 300,
          }));
      }
    }
    if (
      Array.isArray(bookingObj?.serviceIds) &&
      bookingObj.serviceIds.length > 0 &&
      typeof bookingObj.serviceIds[0] === 'object'
    ) {
      return bookingObj.serviceIds;
    }
    if (isSalonCategory) {
      return [{id: '1', title: 'Haircut', price: 300}];
    }
    return [];
  })();

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

  const salonServicesTotal = isSalonCategory
    ? servicesList.reduce((sum, svc) => {
        const p = parseAmountNumber(
          svc?.price ?? svc?.charge ?? svc?.amount ?? 300,
        );
        return sum + p;
      }, 0)
    : 0;

  const feeVal = isSalonCategory
    ? salonServicesTotal
    : priceBreakdown?.visitingCharge ??
      priceBreakdown?.subtotal ??
      priceBreakdown?.servicesTotal ??
      bookingObj?.subtotal ??
      100;

  const serviceFeePct = priceBreakdown?.serviceFeePercentage || '5%';

  const serviceFeeVal = isSalonCategory
    ? priceBreakdown?.serviceFee ??
      bookingObj?.serviceFee ??
      Math.round(salonServicesTotal * 0.05 * 100) / 100
    : priceBreakdown?.serviceFee ?? bookingObj?.serviceFee ?? 5;

  const taxVal = isSalonCategory
    ? priceBreakdown?.tax ??
      bookingObj?.tax ??
      Math.round(salonServicesTotal * 0.05 * 100) / 100
    : priceBreakdown?.tax ?? bookingObj?.tax ?? 5;

  const totalPayableVal = isSalonCategory
    ? priceBreakdown?.totalPayable ??
      bookingObj?.totalAmount ??
      Math.round(
        (salonServicesTotal + Number(serviceFeeVal) + Number(taxVal)) * 100,
      ) / 100
    : priceBreakdown?.totalPayable ?? bookingObj?.totalAmount ?? 110;

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
    // Validation for Schedule Booking (Appointment): Ensure date and time slot are selected!
    if (!isInstantBooking) {
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
      customerAddrObj?.city || customerAddrObj?.town || reduxPlace || '';

    const activeState =
      customerAddrObj?.state || customerAddrObj?.stateName || '';

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
        reduxFullAddress || customerAddrObj?.address || 'Location updated',
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

    const executeBookingSubmission = targetAddressId => {
      const isNewBookingFlow = Boolean(route.params?.bookingPayload);

      if (isNewBookingFlow) {
        const routePayload = route.params?.bookingPayload || {};

        const rawServiceIds =
          routePayload.serviceIds || route.params?.serviceIds || [];

        const validServiceIds = (
          Array.isArray(rawServiceIds) ? rawServiceIds : [rawServiceIds]
        )
          .map(val => (isValidObjectId(val) ? String(val).trim() : null))
          .filter(Boolean);

        const rawVendorServiceId =
          routePayload.vendorServiceId || route.params?.vendorServiceId;

        const validVendorServiceId = isValidObjectId(rawVendorServiceId)
          ? String(rawVendorServiceId).trim()
          : undefined;

        const newBookingPayload = {
          vendorId:
            routePayload.vendorId ||
            route.params?.vendorUserId ||
            route.params?.item?._id ||
            route.params?.item?.id ||
            '6a7320cb3577104793b1929b',
          notes: routePayload.notes || route.params?.notes || 'Instant service',
          bookingDate:
            (selectedDate ? selectedDayObj?.isoDate : null) ||
            routePayload.bookingDate ||
            route.params?.bookingDate ||
            new Date().toISOString().split('T')[0],
          timeSlot:
            (selectedTime ? String(selectedTime).replace('–', '-') : null) ||
            routePayload.timeSlot ||
            route.params?.timeSlot ||
            '10:00 am',
        };

        if (validVendorServiceId) {
          newBookingPayload.vendorServiceId = validVendorServiceId;
        }

        if (validServiceIds.length > 0) {
          newBookingPayload.serviceIds = validServiceIds;
        }

        if (!isSalonCategory && targetAddressId) {
          newBookingPayload.addressId = String(targetAddressId).trim();
        }

        console.log('\n==================================================');
        console.log(
          '[BookingSummaryScreen Confirm & Book -> Calling POST /v1/customer/bookings]',
        );
        console.log('Payload:', JSON.stringify(newBookingPayload, null, 2));
        console.log('==================================================\n');

        dispatch(
          createBooking(newBookingPayload, (cErr, cRes) => {
            setConfirmLoading(false);
            if (cErr) {
              console.log('[BookingSummaryScreen] createBooking Error:', cErr);
              Alert.alert(
                'Error',
                cErr?.message || cErr?.msg || 'Failed to create booking.',
              );
            } else {
              console.log(
                '==================================================',
                '\n[BookingSummaryScreen createBooking Success]',
                '\nResponse:',
                JSON.stringify(cRes, null, 2),
                '\n==================================================',
              );
              setTimerSeconds(60);
              refRequestSheet.current?.open();
            }
          }),
        );
        return;
      }

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
            setTimerSeconds(60);
            refRequestSheet.current?.open();
          },
        ),
      );
    };

    if (isSalonCategory) {
      console.log(
        '\n[BookingSummaryScreen] Saloon Category -> Omitting addressId in payload.\n',
      );
      executeBookingSubmission();
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
        `\n[BookingSummaryScreen] Reusing matching existing address ID: ${targetAddrId}.\n`,
      );
      executeBookingSubmission(targetAddrId);
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
            executeBookingSubmission(createdAddressId);
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
                  onError={() => setImageError(true)}
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

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isInstantBooking}
              onPress={() => refAppointmentSheet.current?.open()}
              style={{
                marginTop: hp(10),
                flexDirection: 'row',
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
            </TouchableOpacity>

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
                    marginBottom: hp(12),
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
                      fontFamily: fontFamily.poppins700,
                      lineHeight: hp(22),
                    }}>
                    {displayAddressText}
                  </Text>
                </View>

                {/* Divider Line */}
                <View
                  style={{
                    width: '100%',
                    height: 1,
                    backgroundColor: '#EBEBEB',
                    marginVertical: hp(14),
                  }}
                />

                {/* Bottom Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: fontSize(14),
                      fontFamily: fontFamily.poppins400,
                      color: '#222222',
                    }}>
                    Not this one?
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleOpenAddressSheet}
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: '#731EE2',
                        fontSize: fontSize(14),
                        fontFamily: fontFamily.poppins600,
                        marginRight: wp(6),
                      }}>
                      Change New
                    </Text>
                    <Image
                      source={icons.bottom_Arrow_Icon}
                      style={{
                        width: hp(10),
                        height: hp(12),
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
              {/* Individual Services Rows for Salon vs Single Visiting Fee Row for Non-Salon */}
              {isSalonCategory ? (
                servicesList.map((svc, idx) => {
                  const rawName =
                    svc?.rawTitle ||
                    svc?.title ||
                    svc?.name ||
                    `Service ${idx + 1}`;
                  const sTitle = String(rawName).replace(/\s*Fee$/i, '');
                  const sPrice = parseAmountNumber(
                    svc?.price ??
                      svc?.charge ??
                      svc?.amount ??
                      (servicesList.length === 1 ? feeVal : 300),
                  );

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

      {/* SELECT AN ADDRESS RAW BOTTOM SHEET */}
      <RBSheet
        ref={refAddressSheet}
        height={hp(520)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            paddingHorizontal: wp(20),
            paddingTop: hp(20),
            paddingBottom: hp(20),
            backgroundColor: '#F8FAFC',
          },
        }}>
        {/* Title */}
        <Text
          style={{
            fontSize: fontSize(18),
            fontFamily: fontFamily.poppins700,
            color: '#1A1D26',
            marginBottom: hp(16),
          }}>
          Select an address
        </Text>

        {/* + Add Address Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            refAddressSheet.current?.close();
            navigation.navigate('EnterCompleteAddressScreen');
          }}
          style={{
            width: '100%',
            backgroundColor: colors.white,
            borderRadius: hp(16),
            borderWidth: 1,
            borderColor: '#E8ECF2',
            paddingVertical: hp(14),
            paddingHorizontal: wp(16),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: hp(20),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: fontSize(20),
                color: '#00875A',
                fontFamily: fontFamily.poppins600,
                marginRight: wp(12),
                lineHeight: hp(22),
              }}>
              +
            </Text>
            <Text
              style={{
                fontSize: fontSize(15),
                fontFamily: fontFamily.poppins600,
                color: '#00875A',
              }}>
              Add Address
            </Text>
          </View>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(10),
              height: hp(12),
              tintColor: '#6B7280',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </TouchableOpacity>

        {/* ADDRESS CARDS LIST */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {(() => {
            const currentLocationItem = savedAddressesList.find(
              a =>
                a?.id === 'current_location_card_top' ||
                a?.locationType === 'current' ||
                a?.locationType === 'unlabeled',
            );

            const otherSavedAddresses = savedAddressesList.filter(
              a =>
                a?.id !== 'current_location_card_top' &&
                a?.locationType !== 'current' &&
                a?.locationType !== 'unlabeled',
            );

            const renderAddressCard = (addrItem, cardIndex) => {
              const isCurrentLoc =
                addrItem?.id === 'current_location_card_top' ||
                addrItem?.locationType === 'current' ||
                addrItem?.locationType === 'unlabeled';

              const displayTitle = isCurrentLoc
                ? 'Current Location'
                : addrItem?.type || addrItem?.locationType || 'Saved Address';

              const fullText =
                addrItem?.displayAddress ||
                addrItem?.address ||
                reduxFullAddress ||
                'Current Location';

              const rawUserPhone =
                addrItem?.mobile ||
                addrItem?.receiverMobile ||
                user?.mobile ||
                user?.mobileNumber ||
                user?.phoneNumber ||
                '7405665654';

              const userPhone = String(rawUserPhone).startsWith('+')
                ? String(rawUserPhone)
                : `+91-${rawUserPhone}`;

              return (
                <TouchableOpacity
                  key={cardIndex}
                  activeOpacity={0.8}
                  onPress={() => handleSelectAddressCard(addrItem)}
                  style={{
                    width: '100%',
                    backgroundColor: colors.white,
                    borderRadius: hp(20),
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                    padding: wp(18),
                    marginBottom: hp(14),
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                  {/* DELIVERS TO BADGE */}
                  <Text
                    style={{
                      fontSize: fontSize(11),
                      fontFamily: fontFamily.poppins700,
                      color: '#3B82F6',
                      letterSpacing: 0.6,
                      marginBottom: hp(12),
                      textTransform: 'uppercase',
                    }}>
                    DELIVERS TO
                  </Text>

                  {/* MAIN CONTENT ROW */}
                  <View
                    style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    {/* LEFT COLUMN: ICON */}
                    <View
                      style={{
                        alignItems: 'center',
                        marginRight: wp(16),
                        width: wp(28),
                      }}>
                      <Image
                        source={
                          isCurrentLoc
                            ? icons.location_Icon
                            : String(displayTitle)
                                .toLowerCase()
                                .includes('work')
                            ? icons.work_Icon || icons.home_Icon
                            : icons.home_Icon
                        }
                        style={{
                          width: hp(24),
                          height: hp(24),
                          tintColor: isCurrentLoc
                            ? colors.primaryColor || '#731EE2'
                            : '#475569',
                          resizeMode: 'contain',
                        }}
                      />
                    </View>

                    {/* RIGHT COLUMN: TITLE, ADDRESS, PHONE */}
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontSize: fontSize(16),
                          fontFamily: fontFamily.poppins700,
                          color: '#1E293B',
                          marginBottom: hp(4),
                        }}>
                        {displayTitle}
                      </Text>

                      <Text
                        style={{
                          fontSize: fontSize(13),
                          fontFamily: fontFamily.poppins400,
                          color: '#475569',
                          lineHeight: hp(20),
                          marginBottom: hp(6),
                        }}
                        numberOfLines={3}>
                        {fullText}
                      </Text>

                      <Text
                        style={{
                          fontSize: fontSize(12),
                          fontFamily: fontFamily.poppins500,
                          color: '#64748B',
                        }}>
                        Phone number:{' '}
                        <Text
                          style={{
                            fontFamily: fontFamily.poppins600,
                            color: '#1E293B',
                          }}>
                          {userPhone}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            };

            return (
              <>
                {/* 1. CURRENT LOCATION CARD */}
                {currentLocationItem &&
                  renderAddressCard(currentLocationItem, 'top_current')}

                {/* 2. SAVED ADDRESSES HEADER */}
                {otherSavedAddresses.length > 0 && (
                  <Text
                    style={{
                      fontSize: fontSize(13),
                      fontFamily: fontFamily.poppins600,
                      color: '#64748B',
                      marginTop: hp(10),
                      marginBottom: hp(12),
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                    SAVED ADDRESSES
                  </Text>
                )}

                {/* 3. OTHER SAVED ADDRESS CARDS */}
                {otherSavedAddresses.map((addrItem, idx) =>
                  renderAddressCard(addrItem, `saved_${idx}`),
                )}
              </>
            );
          })()}
        </ScrollView>
      </RBSheet>
      {/* REQUEST SENT CONFIRMATION BOTTOM SHEET */}
      <RBSheet
        ref={refRequestSheet}
        height={hp(340)}
        openDuration={250}
        closeOnPressMask={true}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            paddingHorizontal: wp(20),
            paddingTop: hp(24),
            paddingBottom: hp(20),
            alignItems: 'center',
            backgroundColor: colors.white,
          },
        }}>
        {/* Timer Circle */}
        <View
          style={{
            width: hp(80),
            height: hp(80),
            borderRadius: hp(40),
            backgroundColor: '#F3E8FF',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryColor || '#731EE2',
              fontSize: fontSize(18),
              fontFamily: fontFamily.poppins700,
            }}>
            {formatTimer(timerSeconds)}
          </Text>
        </View>

        {/* Request Sent Title */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(18),
            fontFamily: fontFamily.poppins700,
            textAlign: 'center',
            marginTop: hp(20),
          }}>
          Request Sent
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            color: '#333333',
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
            textAlign: 'center',
            marginTop: hp(6),
          }}>
          Please wait for confirmation.
        </Text>

        {/* Pay Visiting Fees Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            refRequestSheet.current?.close();
          }}
          style={{
            width: '100%',
            height: hp(50),
            borderRadius: hp(30),
            backgroundColor: colors.primaryColor || '#731EE2',
            marginTop: hp(24),
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: colors.white,
              fontSize: fontSize(15),
              fontFamily: fontFamily.poppins500,
            }}>
            {isSalonCategory ? 'Pay Total Amount : ' : 'Pay Visiting Fees : '}
            <Text
              style={{
                fontFamily: fontFamily.poppins700,
                color: colors.white,
              }}>
              Rs.{formatAmount(isSalonCategory ? totalPayableVal : feeVal)}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Cancel Request Link */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => refRequestSheet.current?.close()}
          style={{
            marginTop: hp(16),
            paddingVertical: hp(6),
            alignSelf: 'center',
          }}>
          <Text
            style={{
              color: colors.primaryColor || '#731EE2',
              fontSize: fontSize(15),
              fontFamily: fontFamily.poppins500,
            }}>
            Cancel Request
          </Text>
        </TouchableOpacity>
      </RBSheet>
    </SafeAreaView>
  );
};

export default BookingSummaryScreen;
