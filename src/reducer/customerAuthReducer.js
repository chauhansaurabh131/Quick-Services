import * as TYPES from '../actions/actionTypes';

const dedupeAddresses = list => {
  if (!Array.isArray(list)) {
    return [];
  }
  const map = new Map();
  list.forEach(item => {
    if (!item) {
      return;
    }
    const key = item._id || item.id || (typeof item === 'string' ? item : null);
    if (key) {
      map.set(String(key), item);
    }
  });
  return Array.from(map.values());
};

const syncUserAddresses = (stateUser, addressList) => {
  if (!stateUser) {
    return stateUser;
  }

  const cleanList = dedupeAddresses(addressList);
  const updatedUser = {...stateUser};

  // Remove top-level addresses property if present ("dont create outside of user")
  if ('addresses' in updatedUser) {
    delete updatedUser.addresses;
  }

  if (updatedUser.user && typeof updatedUser.user === 'object') {
    updatedUser.user = {
      ...updatedUser.user,
      addresses: cleanList,
    };
  } else if (
    updatedUser.data?.user &&
    typeof updatedUser.data.user === 'object'
  ) {
    updatedUser.data = {
      ...updatedUser.data,
      user: {
        ...updatedUser.data.user,
        addresses: cleanList,
      },
    };
  } else {
    updatedUser.addresses = cleanList;
  }

  return updatedUser;
};

const initialState = {
  loading: false,
  user: null,
  error: null,
  isLoggedIn: false,
};

const customerAuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case TYPES.LOGIN_CUSTOMER:
    case TYPES.LOGIN_VENDOR:
    case TYPES.REGISTER_VENDOR:
    case TYPES.VERIFY_OTP_CUSTOMER:
    case TYPES.VERIFY_OTP_VENDOR:
    case TYPES.UPDATE_USER_CUSTOMER:
    case TYPES.UPDATE_VENDOR_PROFILE:
    case TYPES.SAVE_BUSINESS_ADDRESS:
    case TYPES.SAVE_VENDOR_SERVICES:
    case TYPES.GET_VENDOR_SERVICES_BY_CATEGORY:
    case TYPES.GET_VENDOR_USER_DETAILS:
    case TYPES.GET_MY_AVAILABILITY:
    case TYPES.UPDATE_MY_AVAILABILITY:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case TYPES.LOGIN_CUSTOMER_SUCCESS:
    case TYPES.REGISTER_VENDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.data,
        error: null,
      };
    case TYPES.LOGIN_VENDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.data,
        isLoggedIn: true,
        error: null,
      };
    case TYPES.VERIFY_OTP_CUSTOMER_SUCCESS:
    case TYPES.VERIFY_OTP_VENDOR_SUCCESS:
      const userObj =
        action.data?.user || action.data?.data?.user || action.data;
      const hasName = userObj?.fullName || userObj?.name;
      return {
        ...state,
        loading: false,
        user: {
          ...state.user,
          ...action.data,
        },
        isLoggedIn: hasName ? true : false,
        error: null,
      };
    case TYPES.UPDATE_USER_CUSTOMER_SUCCESS:
    case TYPES.UPDATE_VENDOR_PROFILE_SUCCESS:
    case TYPES.SAVE_BUSINESS_ADDRESS_SUCCESS:
    case TYPES.SAVE_VENDOR_SERVICES_SUCCESS:
      return {
        ...state,
        loading: false,
        user: {
          ...state.user,
          ...action.data,
          serviceRadius:
            action.payload?.serviceRadius ??
            action.data?.serviceRadius ??
            state.user?.serviceRadius,
          user: {
            ...state.user?.user,
            ...action.data?.user,
            ...action.payload,
          },
          vendorUser: {
            ...state.user?.vendorUser,
            ...action.data?.vendorUser,
            ...action.payload,
          },
        },
        isLoggedIn: true,
        error: null,
      };
    case TYPES.GET_VENDOR_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.data,
        error: null,
      };
    case TYPES.GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        customerCategories: action.data,
        error: null,
      };
    case TYPES.GET_CATEGORY_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedCategoryDetails: action.data,
        error: null,
      };
    case TYPES.GET_SERVICES_BY_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        services: action.data,
        error: null,
      };
    case TYPES.GET_VENDOR_SERVICES_BY_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorServices: action.data,
        error: null,
      };
    case TYPES.GET_VENDOR_USER_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorUserDetails: action.data,
        error: null,
      };
    case TYPES.GET_MY_AVAILABILITY_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorAvailability: action.data,
        error: null,
      };
    case TYPES.UPDATE_MY_AVAILABILITY_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorAvailability: {
          ...(typeof state.vendorAvailability === 'object'
            ? state.vendorAvailability
            : {}),
          ...(typeof action.data === 'object' ? action.data : {}),
          ...(typeof action.payload === 'object' ? action.payload : {}),
        },
        error: null,
      };
    case TYPES.UPDATE_USER_LOCATION_SUCCESS:
      return {
        ...state,
        loading: false,
        locationUpdateData: action.data,
        error: null,
      };
    case TYPES.GET_CUSTOMER_ADDRESSES_SUCCESS: {
      const extractedList = Array.isArray(action.data)
        ? action.data
        : Array.isArray(action.data?.docs)
        ? action.data.docs
        : Array.isArray(action.data?.addresses)
        ? action.data.addresses
        : Array.isArray(action.data?.data)
        ? action.data.data
        : Array.isArray(action.data?.data?.docs)
        ? action.data.data.docs
        : Array.isArray(action.data?.data?.addresses)
        ? action.data.data.addresses
        : [];

      return {
        ...state,
        loading: false,
        user: syncUserAddresses(state.user, extractedList),
        customerAddressData: action.data,
        error: null,
      };
    }
    case TYPES.SAVE_CUSTOMER_ADDRESS_SUCCESS: {
      const existingAddresses =
        state.user?.user?.addresses ||
        state.user?.data?.user?.addresses ||
        state.user?.addresses ||
        [];

      let updatedList = [];
      const newAddressItem = action.data?.data || action.data;

      if (Array.isArray(newAddressItem)) {
        updatedList = newAddressItem;
      } else if (newAddressItem && typeof newAddressItem === 'object') {
        updatedList = [...existingAddresses, newAddressItem];
      } else {
        updatedList = existingAddresses;
      }

      return {
        ...state,
        loading: false,
        user: syncUserAddresses(state.user, updatedList),
        customerAddressData: action.data,
        error: null,
      };
    }
    case TYPES.UPDATE_CUSTOMER_ADDRESS_SUCCESS: {
      const existingAddresses =
        state.user?.user?.addresses ||
        state.user?.data?.user?.addresses ||
        state.user?.addresses ||
        [];

      let updatedList = [];
      const modifiedItem = action.data?.data || action.data;

      if (Array.isArray(modifiedItem)) {
        updatedList = modifiedItem;
      } else if (modifiedItem && typeof modifiedItem === 'object') {
        const modId = modifiedItem._id || modifiedItem.id;
        if (modId) {
          updatedList = existingAddresses.map(item =>
            (item._id || item.id) === modId ? {...item, ...modifiedItem} : item,
          );
        } else {
          updatedList = existingAddresses;
        }
      } else {
        updatedList = existingAddresses;
      }

      return {
        ...state,
        loading: false,
        user: syncUserAddresses(state.user, updatedList),
        customerAddressData: action.data,
        error: null,
      };
    }
    case TYPES.DELETE_CUSTOMER_ADDRESS_SUCCESS: {
      const targetAddressId =
        action.addressId ||
        action.data?.addressId ||
        action.data?.id ||
        action.data?._id;

      const existingAddresses =
        state.user?.user?.addresses ||
        state.user?.data?.user?.addresses ||
        state.user?.addresses ||
        [];

      const filteredList = targetAddressId
        ? existingAddresses.filter(
            item =>
              (item._id || item.id) !== targetAddressId &&
              item !== targetAddressId,
          )
        : existingAddresses;

      return {
        ...state,
        loading: false,
        user: syncUserAddresses(state.user, filteredList),
        customerAddressData: action.data,
        error: null,
      };
    }
    case TYPES.CREATE_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        bookingData: action.data,
        error: null,
      };
    case TYPES.GET_BOOKING_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        activeBookingDetails: action.data,
        error: null,
      };
    case TYPES.GET_VENDOR_BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorBookings: {
          ...(state.vendorBookings || {}),
          [action.payload?.status || 'panding']: action.payload?.data,
        },
        error: null,
      };
    case TYPES.ACCEPT_VENDOR_BOOKING_SUCCESS: {
      const acceptedId =
        action.data?._id || action.data?.id || action.data?.bookingId;
      const currentPanding = state.vendorBookings?.panding;
      const updatedPanding = Array.isArray(currentPanding)
        ? currentPanding.filter(
            item => (item._id || item.id) !== acceptedId && item !== acceptedId,
          )
        : currentPanding;

      return {
        ...state,
        loading: false,
        acceptedBookingResult: action.data,
        vendorBookings: {
          ...(state.vendorBookings || {}),
          panding: updatedPanding,
        },
        error: null,
      };
    }
    case TYPES.CANCEL_VENDOR_BOOKING_SUCCESS: {
      const cancelledId =
        action.data?._id || action.data?.id || action.data?.bookingId;
      const currentPanding = state.vendorBookings?.panding;
      const currentAccepted = state.vendorBookings?.accepted;

      const updatedPanding = Array.isArray(currentPanding)
        ? currentPanding.filter(
            item =>
              (item._id || item.id) !== cancelledId && item !== cancelledId,
          )
        : currentPanding;

      const updatedAccepted = Array.isArray(currentAccepted)
        ? currentAccepted.filter(
            item =>
              (item._id || item.id) !== cancelledId && item !== cancelledId,
          )
        : currentAccepted;

      return {
        ...state,
        loading: false,
        cancelledBookingResult: action.data,
        vendorBookings: {
          ...(state.vendorBookings || {}),
          panding: updatedPanding,
          accepted: updatedAccepted,
        },
        error: null,
      };
    }
    case TYPES.RESEND_OTP_VENDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case TYPES.LOGIN_CUSTOMER_FAILED:
    case TYPES.LOGIN_VENDOR_FAILED:
    case TYPES.REGISTER_VENDOR_FAILED:
    case TYPES.VERIFY_OTP_CUSTOMER_FAILED:
    case TYPES.VERIFY_OTP_VENDOR_FAILED:
    case TYPES.UPDATE_USER_CUSTOMER_FAILED:
    case TYPES.UPDATE_VENDOR_PROFILE_FAILED:
    case TYPES.SAVE_BUSINESS_ADDRESS_FAILED:
    case TYPES.SAVE_VENDOR_SERVICES_FAILED:
    case TYPES.GET_VENDOR_SERVICES_BY_CATEGORY_FAILED:
    case TYPES.GET_VENDOR_USER_DETAILS_FAILED:
    case TYPES.GET_MY_AVAILABILITY_FAILED:
    case TYPES.UPDATE_MY_AVAILABILITY_FAILED:
    case TYPES.UPDATE_USER_LOCATION_FAILED:
    case TYPES.SAVE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.UPDATE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.GET_CUSTOMER_ADDRESSES_FAILED:
    case TYPES.DELETE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.CREATE_BOOKING_FAILED:
    case TYPES.GET_BOOKING_BY_ID_FAILED:
    case TYPES.GET_VENDOR_BOOKINGS_FAILED:
    case TYPES.ACCEPT_VENDOR_BOOKING_FAILED:
    case TYPES.RESEND_OTP_VENDOR_FAILED:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case TYPES.LOGOUT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default customerAuthReducer;
