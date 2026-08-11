import * as TYPES from '../actions/actionTypes';

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
          user: {
            ...state.user?.user,
            ...action.data?.user,
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
    case TYPES.GET_SERVICES_BY_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        services: action.data,
        error: null,
      };
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
