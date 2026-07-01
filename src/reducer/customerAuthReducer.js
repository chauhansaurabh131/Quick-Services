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
    case TYPES.VERIFY_OTP_CUSTOMER:
    case TYPES.UPDATE_USER_CUSTOMER:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case TYPES.LOGIN_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.data,
        error: null,
      };
    case TYPES.VERIFY_OTP_CUSTOMER_SUCCESS:
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
    case TYPES.LOGIN_CUSTOMER_FAILED:
    case TYPES.VERIFY_OTP_CUSTOMER_FAILED:
    case TYPES.UPDATE_USER_CUSTOMER_FAILED:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
};

export default customerAuthReducer;
