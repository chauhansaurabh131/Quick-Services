import * as TYPES from './actionTypes';

export const loginCustomer = (payload, callback) => ({
  type: TYPES.LOGIN_CUSTOMER,
  data: {payload, callback},
});

export const loginCustomerSuccess = data => ({
  type: TYPES.LOGIN_CUSTOMER_SUCCESS,
  data,
});

export const loginCustomerFailed = error => ({
  type: TYPES.LOGIN_CUSTOMER_FAILED,
  error,
});

export const verifyOtpCustomer = (payload, callback) => ({
  type: TYPES.VERIFY_OTP_CUSTOMER,
  data: {payload, callback},
});

export const verifyOtpCustomerSuccess = data => ({
  type: TYPES.VERIFY_OTP_CUSTOMER_SUCCESS,
  data,
});

export const verifyOtpCustomerFailed = error => ({
  type: TYPES.VERIFY_OTP_CUSTOMER_FAILED,
  error,
});

export const updateUserCustomer = (payload, callback) => ({
  type: TYPES.UPDATE_USER_CUSTOMER,
  data: {payload, callback},
});

export const updateUserCustomerSuccess = (data, payload) => ({
  type: TYPES.UPDATE_USER_CUSTOMER_SUCCESS,
  data,
  payload,
});

export const updateUserCustomerFailed = error => ({
  type: TYPES.UPDATE_USER_CUSTOMER_FAILED,
  error,
});
