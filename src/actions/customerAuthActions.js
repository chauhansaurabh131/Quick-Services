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

export const registerVendor = (payload, callback) => ({
  type: TYPES.REGISTER_VENDOR,
  data: {payload, callback},
});

export const registerVendorSuccess = data => ({
  type: TYPES.REGISTER_VENDOR_SUCCESS,
  data,
});

export const registerVendorFailed = error => ({
  type: TYPES.REGISTER_VENDOR_FAILED,
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

export const verifyOtpVendor = (payload, callback) => ({
  type: TYPES.VERIFY_OTP_VENDOR,
  data: {payload, callback},
});

export const verifyOtpVendorSuccess = data => ({
  type: TYPES.VERIFY_OTP_VENDOR_SUCCESS,
  data,
});

export const verifyOtpVendorFailed = error => ({
  type: TYPES.VERIFY_OTP_VENDOR_FAILED,
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

export const updateVendorProfile = (payload, callback) => ({
  type: TYPES.UPDATE_VENDOR_PROFILE,
  data: {payload, callback},
});

export const updateVendorProfileSuccess = (data, payload) => ({
  type: TYPES.UPDATE_VENDOR_PROFILE_SUCCESS,
  data,
  payload,
});

export const updateVendorProfileFailed = error => ({
  type: TYPES.UPDATE_VENDOR_PROFILE_FAILED,
  error,
});

export const saveBusinessAddress = (payload, callback) => ({
  type: TYPES.SAVE_BUSINESS_ADDRESS,
  data: {payload, callback},
});

export const saveBusinessAddressSuccess = (data, payload) => ({
  type: TYPES.SAVE_BUSINESS_ADDRESS_SUCCESS,
  data,
  payload,
});

export const saveBusinessAddressFailed = error => ({
  type: TYPES.SAVE_BUSINESS_ADDRESS_FAILED,
  error,
});

export const getVendorCategories = callback => ({
  type: TYPES.GET_VENDOR_CATEGORIES,
  data: {callback},
});

export const getVendorCategoriesSuccess = data => ({
  type: TYPES.GET_VENDOR_CATEGORIES_SUCCESS,
  data,
});

export const getVendorCategoriesFailed = error => ({
  type: TYPES.GET_VENDOR_CATEGORIES_FAILED,
  error,
});

export const getServicesByCategory = (categoryId, callback) => ({
  type: TYPES.GET_SERVICES_BY_CATEGORY,
  data: {categoryId, callback},
});

export const getServicesByCategorySuccess = (data, categoryId) => ({
  type: TYPES.GET_SERVICES_BY_CATEGORY_SUCCESS,
  data,
  categoryId,
});

export const getServicesByCategoryFailed = error => ({
  type: TYPES.GET_SERVICES_BY_CATEGORY_FAILED,
  error,
});

export const saveVendorServices = (payload, callback) => ({
  type: TYPES.SAVE_VENDOR_SERVICES,
  data: {payload, callback},
});

export const saveVendorServicesSuccess = (data, payload) => ({
  type: TYPES.SAVE_VENDOR_SERVICES_SUCCESS,
  data,
  payload,
});

export const saveVendorServicesFailed = error => ({
  type: TYPES.SAVE_VENDOR_SERVICES_FAILED,
  error,
});

export const resendOtpVendor = (payload, callback) => ({
  type: TYPES.RESEND_OTP_VENDOR,
  data: {payload, callback},
});

export const resendOtpVendorSuccess = data => ({
  type: TYPES.RESEND_OTP_VENDOR_SUCCESS,
  data,
});

export const resendOtpVendorFailed = error => ({
  type: TYPES.RESEND_OTP_VENDOR_FAILED,
  error,
});

export const loginVendor = (payload, callback, token) => ({
  type: TYPES.LOGIN_VENDOR,
  data: {payload, callback, token},
});

export const loginVendorSuccess = data => ({
  type: TYPES.LOGIN_VENDOR_SUCCESS,
  data,
});

export const loginVendorFailed = error => ({
  type: TYPES.LOGIN_VENDOR_FAILED,
  error,
});

export const logoutUser = () => ({
  type: TYPES.LOGOUT,
});

