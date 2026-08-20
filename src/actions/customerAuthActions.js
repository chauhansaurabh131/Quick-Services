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

export const getCategories = callback => ({
  type: TYPES.GET_CATEGORIES,
  data: {callback},
});

export const getCategoriesSuccess = data => ({
  type: TYPES.GET_CATEGORIES_SUCCESS,
  data,
});

export const getCategoriesFailed = error => ({
  type: TYPES.GET_CATEGORIES_FAILED,
  error,
});

export const getCategoryById = (categoryId, callback) => ({
  type: TYPES.GET_CATEGORY_BY_ID,
  data: {categoryId, callback},
});

export const getCategoryByIdSuccess = data => ({
  type: TYPES.GET_CATEGORY_BY_ID_SUCCESS,
  data,
});

export const getCategoryByIdFailed = error => ({
  type: TYPES.GET_CATEGORY_BY_ID_FAILED,
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

export const getVendorServicesByCategory = (
  categoryId,
  longitude,
  latitude,
  callback,
  page = 1,
  limit = 10,
) => ({
  type: TYPES.GET_VENDOR_SERVICES_BY_CATEGORY,
  data: {categoryId, longitude, latitude, callback, page, limit},
});

export const getVendorServicesByCategorySuccess = (data, categoryId) => ({
  type: TYPES.GET_VENDOR_SERVICES_BY_CATEGORY_SUCCESS,
  data,
  categoryId,
});

export const getVendorServicesByCategoryFailed = error => ({
  type: TYPES.GET_VENDOR_SERVICES_BY_CATEGORY_FAILED,
  error,
});

export const getVendorUserDetails = (vendorUserId, callback) => ({
  type: TYPES.GET_VENDOR_USER_DETAILS,
  data: {vendorUserId, callback},
});

export const getVendorUserDetailsSuccess = data => ({
  type: TYPES.GET_VENDOR_USER_DETAILS_SUCCESS,
  data,
});

export const getVendorUserDetailsFailed = error => ({
  type: TYPES.GET_VENDOR_USER_DETAILS_FAILED,
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

export const getMyAvailability = callback => ({
  type: TYPES.GET_MY_AVAILABILITY,
  data: {callback},
});

export const getMyAvailabilitySuccess = data => ({
  type: TYPES.GET_MY_AVAILABILITY_SUCCESS,
  data,
});

export const getMyAvailabilityFailed = error => ({
  type: TYPES.GET_MY_AVAILABILITY_FAILED,
  error,
});

export const updateMyAvailability = (payload, callback) => ({
  type: TYPES.UPDATE_MY_AVAILABILITY,
  data: {payload, callback},
});

export const updateMyAvailabilitySuccess = (data, payload) => ({
  type: TYPES.UPDATE_MY_AVAILABILITY_SUCCESS,
  data,
  payload,
});

export const updateMyAvailabilityFailed = error => ({
  type: TYPES.UPDATE_MY_AVAILABILITY_FAILED,
  error,
});

export const logoutUser = () => ({
  type: TYPES.LOGOUT,
});

export const updateUserLocation = (userId, payload, callback) => ({
  type: TYPES.UPDATE_USER_LOCATION,
  data: {userId, payload, callback},
});

export const updateUserLocationSuccess = data => ({
  type: TYPES.UPDATE_USER_LOCATION_SUCCESS,
  data,
});

export const updateUserLocationFailed = error => ({
  type: TYPES.UPDATE_USER_LOCATION_FAILED,
  error,
});

export const saveCustomerAddress = (payload, callback) => ({
  type: TYPES.SAVE_CUSTOMER_ADDRESS,
  data: {payload, callback},
});

export const saveCustomerAddressSuccess = data => ({
  type: TYPES.SAVE_CUSTOMER_ADDRESS_SUCCESS,
  data,
});

export const saveCustomerAddressFailed = error => ({
  type: TYPES.SAVE_CUSTOMER_ADDRESS_FAILED,
  error,
});

export const updateCustomerAddress = (addressId, payload, callback) => ({
  type: TYPES.UPDATE_CUSTOMER_ADDRESS,
  data: {addressId, payload, callback},
});

export const updateCustomerAddressSuccess = data => ({
  type: TYPES.UPDATE_CUSTOMER_ADDRESS_SUCCESS,
  data,
});

export const updateCustomerAddressFailed = error => ({
  type: TYPES.UPDATE_CUSTOMER_ADDRESS_FAILED,
  error,
});

export const getCustomerAddresses = (userId, callback) => ({
  type: TYPES.GET_CUSTOMER_ADDRESSES,
  data: {userId, callback},
});

export const getCustomerAddressesSuccess = data => ({
  type: TYPES.GET_CUSTOMER_ADDRESSES_SUCCESS,
  data,
});

export const getCustomerAddressesFailed = error => ({
  type: TYPES.GET_CUSTOMER_ADDRESSES_FAILED,
  error,
});

export const deleteCustomerAddress = (addressId, callback) => ({
  type: TYPES.DELETE_CUSTOMER_ADDRESS,
  data: {addressId, callback},
});

export const deleteCustomerAddressSuccess = (data, addressId) => ({
  type: TYPES.DELETE_CUSTOMER_ADDRESS_SUCCESS,
  data,
  addressId,
});

export const deleteCustomerAddressFailed = error => ({
  type: TYPES.DELETE_CUSTOMER_ADDRESS_FAILED,
  error,
});

export const createBooking = (payload, callback) => ({
  type: TYPES.CREATE_BOOKING,
  data: {payload, callback},
});

export const createBookingSuccess = data => ({
  type: TYPES.CREATE_BOOKING_SUCCESS,
  data,
});

export const createBookingFailed = error => ({
  type: TYPES.CREATE_BOOKING_FAILED,
  error,
});

export const getBookingById = (bookingId, callback) => ({
  type: TYPES.GET_BOOKING_BY_ID,
  data: {bookingId, callback},
});

export const getBookingByIdSuccess = data => ({
  type: TYPES.GET_BOOKING_BY_ID_SUCCESS,
  data,
});

export const getBookingByIdFailed = error => ({
  type: TYPES.GET_BOOKING_BY_ID_FAILED,
  error,
});
