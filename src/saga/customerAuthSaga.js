import {call, put, select, takeLatest} from 'redux-saga/effects';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TYPES from '../actions/actionTypes';
import * as actions from '../actions/customerAuthActions';
import {customerAuth, s3Api} from '../apis';
import {getFCMToken} from '../utils/fcmService';

function* registerCustomer(action) {
  try {
    const {payload, callback} = action.data;
    console.log('Register Customer Request Payload:', payload);
    const response = yield call(customerAuth.register, payload);
    console.log(
      'Register Customer Response:',
      JSON.stringify(response.data, null, 2),
    );

    yield put(
      actions.loginCustomerSuccess(response.data.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log('Register Customer Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.loginCustomerFailed(errorData));

    if (action.data.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* verifyOtpCustomer(action) {
  try {
    const {payload, callback} = action.data;

    let fcmToken = yield call([AsyncStorage, 'getItem'], 'fcmToken');
    if (!fcmToken) {
      try {
        fcmToken = yield call(getFCMToken);
      } catch (fcmErr) {
        console.log('[Saga] Could not fetch FCM token:', fcmErr);
      }
    }

    const currentPlatform = Platform.OS || 'android';
    const finalPayload = {
      ...payload,
      deviceToken: payload?.deviceToken || fcmToken || '',
      platform: payload?.platform || currentPlatform,
    };

    console.log('Verify OTP Request Payload:', finalPayload);
    const response = yield call(customerAuth.verifyOtp, finalPayload);
    console.log('Verify OTP Response:', JSON.stringify(response.data, null, 2));

    yield put(
      actions.verifyOtpCustomerSuccess(response.data.data || response.data),
    );

    // Check all possible paths for token in response
    let rawToken =
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.data?.token ||
      response.data?.data?.accessToken ||
      response.data?.tokens?.access?.token ||
      response.data?.tokens?.access ||
      response.data?.data?.tokens?.access?.token ||
      response.data?.data?.tokens?.access ||
      response.data?.data?.user?.token ||
      response.data?.user?.token;

    if (typeof rawToken === 'object' && rawToken !== null) {
      rawToken = rawToken.token || rawToken.accessToken || rawToken.jwt;
    }

    const token = typeof rawToken === 'string' ? rawToken : null;

    console.log('Extracted Token:', token);

    if (token) {
      yield call(AsyncStorage.setItem, 'token', token);
      console.log('Token successfully stored in AsyncStorage');
    } else {
      console.log('Warning: No token found in verifyOtp response data!');
    }

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log('Verify OTP Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.verifyOtpCustomerFailed(errorData));

    if (action.data.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* updateCustomerUser(action) {
  try {
    const {payload, callback} = action.data;
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_USER_CUSTOMER Request]',
      '\nEndpoint: PUT https://service.mntech.website/v1/customer/auth/update-user',
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(customerAuth.updateUser, payload, token || '');
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_USER_CUSTOMER Success]',
      '\nResponse:',
      JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.updateUserCustomerSuccess(
        response.data.data || response.data,
        payload,
      ),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_USER_CUSTOMER Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.updateUserCustomerFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* registerVendor(action) {
  try {
    const {payload, callback} = action.data;
    console.log('Register Vendor Request Payload:', payload);
    const response = yield call(customerAuth.registerVendor, payload);
    console.log(
      'Register Vendor Response:',
      JSON.stringify(response.data, null, 2),
    );

    yield put(
      actions.registerVendorSuccess(response.data.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log('Register Vendor Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.registerVendorFailed(errorData));

    if (action.data.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* verifyOtpVendor(action) {
  try {
    const {payload, callback} = action.data;

    let fcmToken = yield call([AsyncStorage, 'getItem'], 'fcmToken');
    if (!fcmToken) {
      try {
        fcmToken = yield call(getFCMToken);
      } catch (fcmErr) {
        console.log('[Saga] Could not fetch FCM token:', fcmErr);
      }
    }

    const currentPlatform = Platform.OS || 'android';
    const finalPayload = {
      ...payload,
      deviceToken: payload?.deviceToken || fcmToken || '',
      platform: payload?.platform || currentPlatform,
    };

    console.log('Verify OTP Vendor Request Payload:', finalPayload);
    const response = yield call(customerAuth.verifyOtpVendor, finalPayload);
    console.log(
      'Verify OTP Vendor Response:',
      JSON.stringify(response.data, null, 2),
    );

    yield put(
      actions.verifyOtpVendorSuccess(response.data.data || response.data),
    );

    let rawToken =
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.data?.token ||
      response.data?.data?.accessToken ||
      response.data?.tokens?.access?.token ||
      response.data?.tokens?.access ||
      response.data?.data?.tokens?.access?.token ||
      response.data?.data?.tokens?.access ||
      response.data?.data?.user?.token ||
      response.data?.user?.token;

    if (typeof rawToken === 'object' && rawToken !== null) {
      rawToken = rawToken.token || rawToken.accessToken || rawToken.jwt;
    }

    const token = typeof rawToken === 'string' ? rawToken : null;
    console.log('Extracted Vendor Token:', token);

    if (token) {
      yield call(AsyncStorage.setItem, 'token', token);
      console.log('Vendor token successfully stored in AsyncStorage');
    }

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log('Verify OTP Vendor Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.verifyOtpVendorFailed(errorData));

    if (action.data.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* updateVendorProfileSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log('Update Vendor Profile Request Payload:', payload);
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.updateVendorProfile,
      payload,
      token || '',
    );
    console.log(
      'Update Vendor Profile Response:',
      JSON.stringify(response.data, null, 2),
    );

    yield put(
      actions.updateVendorProfileSuccess(
        response.data.data || response.data,
        payload,
      ),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      'Update Vendor Profile Error:',
      JSON.stringify(errorData, null, 2),
    );
    yield put(actions.updateVendorProfileFailed(errorData));

    if (action.data.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* saveBusinessAddressSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log('Save Business Address Request Payload:', payload);
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.saveBusinessAddress,
      payload,
      token || '',
    );
    console.log(
      'Save Business Address Response:',
      JSON.stringify(response.data, null, 2),
    );

    yield put(
      actions.saveBusinessAddressSuccess(
        response.data.data || response.data,
        payload,
      ),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      'Save Business Address Error:',
      JSON.stringify(errorData, null, 2),
    );
    yield put(actions.saveBusinessAddressFailed(errorData));

    if (action.data.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getVendorCategoriesSaga(action) {
  try {
    const callback = action?.data?.callback;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(customerAuth.getVendorCategories, token || '');
    console.log(
      'Get Vendor Categories Response:',
      JSON.stringify(response.data, null, 2),
    );

    const categoriesData =
      response.data?.data || response.data?.categories || response.data;

    yield put(actions.getVendorCategoriesSuccess(categoriesData));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      'Get Vendor Categories Error:',
      JSON.stringify(errorData, null, 2),
    );
    yield put(actions.getVendorCategoriesFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getCategoriesSaga(action) {
  try {
    const callback = action?.data?.callback;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(customerAuth.getCategories, token || '');
    console.log(
      'Get Categories Response:',
      JSON.stringify(response.data, null, 2),
    );

    const categoriesData =
      response.data?.data || response.data?.categories || response.data;

    yield put(actions.getCategoriesSuccess(categoriesData));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log('Get Categories Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.getCategoriesFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getCategoryByIdSaga(action) {
  try {
    const {categoryId, callback} = action.data;
    console.log('Fetching Category By ID:', categoryId);
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.getCategoryById,
      categoryId,
      token || '',
    );
    console.log(
      'Get Category By ID Response:',
      JSON.stringify(response.data, null, 2),
    );

    const categoryData = response.data?.data || response.data;

    yield put(actions.getCategoryByIdSuccess(categoryData));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      'Get Category By ID Error:',
      JSON.stringify(errorData, null, 2),
    );
    yield put(actions.getCategoryByIdFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getServicesByCategorySaga(action) {
  try {
    const {categoryId, callback} = action.data;
    console.log('Fetching Services for Category ID:', categoryId);
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.getServicesByCategory,
      categoryId,
      token || '',
    );
    console.log(
      'Get Services By Category Response:',
      JSON.stringify(response.data, null, 2),
    );

    const servicesData =
      response.data?.data || response.data?.services || response.data;

    yield put(actions.getServicesByCategorySuccess(servicesData, categoryId));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      'Get Services By Category Error:',
      JSON.stringify(errorData, null, 2),
    );
    yield put(actions.getServicesByCategoryFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getVendorServicesByCategorySaga(action) {
  try {
    const {
      categoryId,
      longitude,
      latitude,
      callback,
      page = 1,
      limit = 10,
      filter = null,
    } = action.data;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_SERVICES_BY_CATEGORY Request]',
      `\nCategory ID: ${categoryId}`,
      `\nLongitude: ${longitude}`,
      `\nLatitude: ${latitude}`,
      `\nPage: ${page}`,
      `\nLimit: ${limit}`,
      `\nFilter: ${filter || 'none'}`,
      '\n==================================================',
    );

    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    if (!token) {
      token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTcwMzc2YjMwNGIzMjg2YjA1MzQ2NDUiLCJpYXQiOjE3ODY0MjkwNzYsImV4cCI6MTc4NjYwOTA3Nn0.9FBnZ2Ez6EqzBxJ62Ra8QCZjxI0kkhtxx4KPImEvNPI';
    }

    const response = yield call(
      customerAuth.getVendorServicesByCategory,
      categoryId,
      longitude,
      latitude,
      token || '',
      page,
      limit,
      filter,
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_SERVICES_BY_CATEGORY Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const vendorServicesData =
      (Array.isArray(response?.data?.data?.docs) && response.data.data.docs) ||
      (Array.isArray(response?.data?.docs) && response.data.docs) ||
      (Array.isArray(response?.data?.data?.services) &&
        response.data.data.services) ||
      (Array.isArray(response?.data?.data?.vendorServices) &&
        response.data.data.vendorServices) ||
      (Array.isArray(response?.data?.services) && response.data.services) ||
      (Array.isArray(response?.data?.data) && response.data.data) ||
      (Array.isArray(response?.data) ? response.data : []);

    yield put(
      actions.getVendorServicesByCategorySuccess(
        vendorServicesData,
        categoryId,
      ),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_SERVICES_BY_CATEGORY Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getVendorServicesByCategoryFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getVendorUserDetailsSaga(action) {
  try {
    const {vendorUserId, callback} = action.data;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_USER_DETAILS Request]',
      `\nVendor User ID: ${vendorUserId}`,
      '\n==================================================',
    );

    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.getVendorUserDetails,
      vendorUserId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_USER_DETAILS Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const vendorDetails = response?.data?.data || response?.data;

    yield put(actions.getVendorUserDetailsSuccess(vendorDetails));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_USER_DETAILS Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getVendorUserDetailsFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* saveVendorServicesSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log(
      'Sending Vendor Services Payload:',
      JSON.stringify(payload, null, 2),
    );
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.saveVendorServices,
      payload,
      token || '',
    );
    console.log(
      'Save Vendor Services Response:',
      JSON.stringify(response.data, null, 2),
    );

    yield put(
      actions.saveVendorServicesSuccess(
        response.data.data || response.data,
        payload,
      ),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      'Save Vendor Services Error:',
      JSON.stringify(errorData, null, 2),
    );
    yield put(actions.saveVendorServicesFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* resendOtpVendorSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log('Resend OTP Vendor Payload:', JSON.stringify(payload, null, 2));

    const response = yield call(customerAuth.resendOtpVendor, payload);
    console.log(
      'Resend OTP Vendor Response:',
      JSON.stringify(response.data, null, 2),
    );

    yield put(actions.resendOtpVendorSuccess(response.data));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log('Resend OTP Vendor Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.resendOtpVendorFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* loginVendorSaga(action) {
  try {
    const {payload, callback, token} = action.data;

    let fcmToken = yield call([AsyncStorage, 'getItem'], 'fcmToken');
    if (!fcmToken) {
      try {
        fcmToken = yield call(getFCMToken);
      } catch (fcmErr) {
        console.log('[Saga] Could not fetch FCM token:', fcmErr);
      }
    }

    const currentPlatform = Platform.OS || 'android';
    const finalPayload = {
      ...payload,
      deviceToken: payload?.deviceToken || fcmToken || '',
      platform: payload?.platform || currentPlatform,
    };

    console.log('Login Vendor Request Payload:', finalPayload);
    const response = yield call(customerAuth.loginVendor, finalPayload, token);
    console.log(
      'Login Vendor Response:',
      JSON.stringify(response.data, null, 2),
    );

    yield put(actions.loginVendorSuccess(response.data.data || response.data));

    let rawToken =
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.data?.token ||
      response.data?.data?.accessToken ||
      response.data?.tokens?.access?.token ||
      response.data?.tokens?.access ||
      response.data?.data?.tokens?.access?.token ||
      response.data?.data?.tokens?.access ||
      response.data?.data?.user?.token ||
      response.data?.user?.token;

    if (typeof rawToken === 'object' && rawToken !== null) {
      rawToken = rawToken.token || rawToken.accessToken || rawToken.jwt;
    }

    const extractedToken = typeof rawToken === 'string' ? rawToken : null;
    console.log('Extracted Login Vendor Token:', extractedToken);

    if (extractedToken) {
      yield call(AsyncStorage.setItem, 'token', extractedToken);
      console.log('Vendor login token successfully stored in AsyncStorage');
    }

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log('Login Vendor Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.loginVendorFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getMyAvailabilitySaga(action) {
  try {
    const callback = action?.data?.callback;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_MY_AVAILABILITY Request]',
      '\nEndpoint: /vendor/vendorAvailability/my-availability',
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(customerAuth.getMyAvailability, token || '');

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_MY_AVAILABILITY Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const availabilityData = response?.data?.data || response?.data;

    yield put(actions.getMyAvailabilitySuccess(availabilityData));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_MY_AVAILABILITY Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getMyAvailabilityFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* updateMyAvailabilitySaga(action) {
  try {
    const {payload, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_MY_AVAILABILITY Request]',
      '\nEndpoint: PUT /vendor/vendorAvailability/my-availability',
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.updateMyAvailability,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_MY_AVAILABILITY Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const responseData = response?.data?.data || response?.data;

    yield put(actions.updateMyAvailabilitySuccess(responseData, payload));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_MY_AVAILABILITY Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.updateMyAvailabilityFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* updateUserLocationSaga(action) {
  try {
    const {userId, payload, callback} = action.data;
    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_USER_LOCATION Request]',
      `\nUserId: ${userId}`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      `\nPUT https://service.mntech.website/v1/customer/user/${userId}`,
      '\n==================================================',
    );
    const response = yield call(
      customerAuth.updateUserLocation,
      userId,
      payload,
      token || '',
    );
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_USER_LOCATION Success]',
      '\nData Payload:',
      JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.updateUserLocationSuccess(response.data.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_USER_LOCATION Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.updateUserLocationFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* saveCustomerAddressSaga(action) {
  try {
    const {payload, callback} = action.data;
    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: SAVE_CUSTOMER_ADDRESS Request]',
      '\nEndpoint: POST https://service.mntech.website/v1/customer/address',
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.saveCustomerAddress,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: SAVE_CUSTOMER_ADDRESS Success]',
      '\nResponse Data:',
      JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.saveCustomerAddressSuccess(response.data.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: SAVE_CUSTOMER_ADDRESS Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.saveCustomerAddressFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* updateCustomerAddressSaga(action) {
  try {
    const {addressId, payload, callback} = action.data;
    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_CUSTOMER_ADDRESS Request]',
      `\nEndpoint: PUT https://service.mntech.website/v1/customer/address/${addressId}`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.updateCustomerAddress,
      addressId,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_CUSTOMER_ADDRESS Success]',
      '\nResponse Data:',
      JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.updateCustomerAddressSuccess(response.data.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_CUSTOMER_ADDRESS Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.updateCustomerAddressFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getCustomerAddressesSaga(action) {
  try {
    let {userId, callback} = action.data || {};
    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    const authState = yield select(state => state.auth);
    if (!token || token === '[object Object]') {
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    if (!userId) {
      userId =
        authState?.user?.id ||
        authState?.user?._id ||
        authState?.user?.user?.id ||
        authState?.user?.user?._id ||
        authState?.user?.data?.user?.id ||
        authState?.user?.data?.user?._id;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_ADDRESSES Request]',
      `\nEndpoint: GET https://service.mntech.website/v1/customer/address/user/${userId}`,
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.getCustomerAddressesByUserId,
      userId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_ADDRESSES Success]',
      '\nResponse Data:',
      JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.getCustomerAddressesSuccess(
        response.data?.data || response.data?.docs || response.data,
      ),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_ADDRESSES Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getCustomerAddressesFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* deleteCustomerAddressSaga(action) {
  try {
    const {addressId, callback} = action.data;
    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_CUSTOMER_ADDRESS Request]',
      `\nEndpoint: DELETE https://service.mntech.website/v1/customer/address/${addressId}`,
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.deleteCustomerAddress,
      addressId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_CUSTOMER_ADDRESS Success]',
      '\nResponse Data:',
      JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.deleteCustomerAddressSuccess(
        response.data?.data || response.data,
        addressId,
      ),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_CUSTOMER_ADDRESS Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.deleteCustomerAddressFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* createBookingSaga(action) {
  try {
    const {payload, callback} = action.data;
    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: CREATE_BOOKING Request]',
      '\nEndpoint: POST https://service.mntech.website/v1/customer/bookings',
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.createBooking,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: CREATE_BOOKING Success]',
      '\nResponse Data:',
      JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.createBookingSuccess(response.data?.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: CREATE_BOOKING Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.createBookingFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getBookingByIdSaga(action) {
  try {
    const {bookingId, callback} = action.data;
    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_BOOKING_BY_ID Request]',
      `\nEndpoint: GET https://service.mntech.website/v1/customer/bookings/${bookingId}`,
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.getBookingDetailsById,
      bookingId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_BOOKING_BY_ID Success]',
      '\nResponse Data:',
      JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.getBookingByIdSuccess(response.data?.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_BOOKING_BY_ID Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getBookingByIdFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* updateBookingAddressSaga(action) {
  try {
    const {bookingId, payload, callback} = action.data || {};
    let token = yield call(AsyncStorage.getItem, 'token');

    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    console.log('\n==================================================');
    console.log('[Redux Saga: UPDATE_BOOKING_ADDRESS Request]');
    console.log(
      `Endpoint: PUT https://service.mntech.website/v1/customer/bookings/${bookingId}`,
    );
    console.log(`Booking ID: ${bookingId}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log(`Token Present: ${Boolean(token)}`);
    console.log('==================================================\n');

    const response = yield call(
      customerAuth.updateBookingAddress,
      bookingId,
      payload,
      token || '',
    );

    console.log('\n==================================================');
    console.log('[Redux Saga: UPDATE_BOOKING_ADDRESS Success]');
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('==================================================\n');

    yield put(
      actions.updateBookingAddressSuccess(response.data?.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || {
      message: error?.message || 'Failed to update booking address',
    };

    console.log('\n==================================================');
    console.log('[Redux Saga: UPDATE_BOOKING_ADDRESS Error]');
    console.log('Error Details:', JSON.stringify(errorData, null, 2));
    console.log('==================================================\n');

    yield put(actions.updateBookingAddressFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getVendorBookingsSaga(action) {
  try {
    const {vendorId, status, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_BOOKINGS Request]',
      `\nEndpoint: GET /v1/vendor/bookings/vendor/${vendorId}?status=${status}`,
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.getVendorBookingsByStatus,
      vendorId,
      status,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_BOOKINGS Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const responseData = response?.data?.data || response?.data;

    yield put(actions.getVendorBookingsSuccess(responseData, status));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_BOOKINGS Error]',
      '\nError:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getVendorBookingsFailed(errorData));
    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* acceptVendorBookingSaga(action) {
  try {
    const {bookingId, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: ACCEPT_VENDOR_BOOKING Request]',
      `\nEndpoint: PUT /v1/vendor/bookings/${bookingId}/accept`,
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.acceptVendorBookingById,
      bookingId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: ACCEPT_VENDOR_BOOKING Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const responseData = response?.data?.data || response?.data;

    yield put(actions.acceptVendorBookingSuccess(responseData));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: ACCEPT_VENDOR_BOOKING Error]',
      '\nError:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.acceptVendorBookingFailed(errorData));
    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* cancelVendorBookingSaga(action) {
  try {
    const {bookingId, cancelReason, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const payload = {cancelReason};

    console.log(
      '==================================================',
      '\n[Redux Saga: CANCEL_VENDOR_BOOKING Request]',
      `\nEndpoint: PUT /v1/vendor/bookings/${bookingId}/cancel`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.cancelVendorBookingById,
      bookingId,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: CANCEL_VENDOR_BOOKING Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const responseData = response?.data?.data || response?.data;

    yield put(actions.cancelVendorBookingSuccess(responseData));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: CANCEL_VENDOR_BOOKING Error]',
      '\nError:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.cancelVendorBookingFailed(errorData));
    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* vendorSendOtpSaga(action) {
  try {
    const {bookingId, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_SEND_OTP Request]',
      `\nEndpoint: POST /v1/vendor/bookings/${bookingId}/complete/send-otp`,
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.vendorSendOtpApi,
      bookingId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_SEND_OTP Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    yield put(actions.vendorSendOtpSuccess(response?.data));
    if (callback) {
      callback(null, response?.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_SEND_OTP Error]',
      '\nError:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.vendorSendOtpFailed(errorData));
    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* vendorResendOtpSaga(action) {
  try {
    const {bookingId, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_RESEND_OTP Request]',
      `\nEndpoint: POST /v1/vendor/bookings/${bookingId}/complete/resend-otp`,
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.vendorResendOtpApi,
      bookingId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_RESEND_OTP Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    yield put(actions.vendorResendOtpSuccess(response?.data));
    if (callback) {
      callback(null, response?.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_RESEND_OTP Error]',
      '\nError:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.vendorResendOtpFailed(errorData));
    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* vendorVerifyOtpSaga(action) {
  try {
    const {bookingId, otp, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const payload = {otp};

    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_VERIFY_OTP Request]',
      `\nEndpoint: POST /v1/vendor/bookings/${bookingId}/complete/verify-otp`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.vendorVerifyOtpApi,
      bookingId,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_VERIFY_OTP Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    yield put(actions.vendorVerifyOtpSuccess(response?.data));
    if (callback) {
      callback(null, response?.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: VENDOR_VERIFY_OTP Error]',
      '\nError:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.vendorVerifyOtpFailed(errorData));
    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getCustomerBookingsSaga(action) {
  try {
    const {
      status = 'accepted',
      page = 1,
      limit = 10,
      callback,
    } = action.data || {};
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_BOOKINGS Request]',
      `\nEndpoint: GET https://service.mntech.website/v1/customer/bookings?status=${status}&page=${page}`,
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.getCustomerBookingsByStatus,
      status,
      token || '',
      page,
      limit,
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_BOOKINGS Response]',
      `\nStatus Code: ${response?.status}`,
      '\nResponse Data:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const responseData =
      response?.data?.data?.results ||
      response?.data?.data?.docs ||
      response?.data?.data?.bookings ||
      response?.data?.data ||
      response?.data?.results ||
      response?.data?.docs ||
      response?.data?.bookings ||
      response?.data;

    yield put(actions.getCustomerBookingsSuccess(responseData, status, page));

    if (typeof callback === 'function') {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_BOOKINGS Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getCustomerBookingsFailed(errorData));
    if (typeof action?.data?.callback === 'function') {
      action.data.callback(errorData, null);
    }
  }
}

function* cancelCustomerBookingSaga(action) {
  try {
    const {bookingId, payload, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: CANCEL_CUSTOMER_BOOKING Request]',
      `\nEndpoint: PUT /v1/customer/bookings/${bookingId}/cancel`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.cancelCustomerBookingById,
      bookingId,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: CANCEL_CUSTOMER_BOOKING Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const responseData = response?.data?.data || response?.data;

    yield put(actions.cancelCustomerBookingSuccess(responseData));

    if (typeof callback === 'function') {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: CANCEL_CUSTOMER_BOOKING Error]',
      '\nError:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.cancelCustomerBookingFailed(errorData));
    if (typeof action?.data?.callback === 'function') {
      action.data.callback(errorData, null);
    }
  }
}

function* createCustomerReviewSaga(action) {
  try {
    const {payload, callback} = action.data;
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: CREATE_CUSTOMER_REVIEW Request]',
      '\nEndpoint: POST https://service.mntech.website/v1/customer/reviews',
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(
      customerAuth.createCustomerReview,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: CREATE_CUSTOMER_REVIEW Response]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const responseData = response?.data?.data || response?.data;

    yield put(actions.createCustomerReviewSuccess(responseData));

    if (typeof callback === 'function') {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: CREATE_CUSTOMER_REVIEW Error]',
      '\nError:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.createCustomerReviewFailed(errorData));
    if (typeof action?.data?.callback === 'function') {
      action.data.callback(errorData, null);
    }
  }
}

function* uploadProfilePicSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log(
      '==================================================',
      '\n[Redux Saga: UPLOAD_PROFILE_PIC Request]',
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }

    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const s3Payload = {
      key: payload.fileName || `customer-avatar-${Date.now()}.jpg`,
      contentType: payload.contentType || 'image/jpeg',
      profileType: 'profileImage',
      isProfilePic: true,
      caption: 'Customer Profile Picture',
    };

    console.log(
      '[Saga: UPLOAD_PROFILE_PIC] Requesting S3 URL with payload:',
      JSON.stringify(s3Payload, null, 2),
    );

    const apiRes = yield call(
      s3Api.getProfilePicUploadUrl,
      s3Payload,
      token || '',
    );
    console.log(
      '[Saga: UPLOAD_PROFILE_PIC] S3 API response:',
      JSON.stringify(apiRes?.data, null, 2),
    );

    const resData = apiRes?.data?.data || apiRes?.data || {};

    const presignedUploadUrl =
      resData.uploadUrl ||
      resData.upload_url ||
      resData.presignedUrl ||
      resData.putUrl ||
      (typeof resData.url === 'string' &&
      resData.url.includes('X-Amz-Algorithm')
        ? resData.url
        : null);

    let displayUrl =
      resData.fileUrl ||
      resData.downloadUrl ||
      resData.publicUrl ||
      resData.imageUrl ||
      resData.location ||
      resData.s3Url;

    if (presignedUploadUrl && payload.selectedUri) {
      console.log(
        '[Saga: UPLOAD_PROFILE_PIC] Uploading image binary to S3 presigned URL...',
      );
      const imageBlobRes = yield call(fetch, payload.selectedUri);
      const blob = yield call([imageBlobRes, 'blob']);

      let s3UploadRes = yield call(fetch, presignedUploadUrl, {
        method: 'PUT',
        headers: {'Content-Type': s3Payload.contentType},
        body: blob,
      });

      if (!s3UploadRes.ok && s3UploadRes.status === 403) {
        s3UploadRes = yield call(fetch, presignedUploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': s3Payload.contentType,
            'x-amz-acl': 'public-read',
          },
          body: blob,
        });
      }

      if (!s3UploadRes.ok) {
        throw new Error(
          `S3 PUT upload failed with status ${s3UploadRes.status}`,
        );
      }
      console.log('[Saga: UPLOAD_PROFILE_PIC] Binary upload to S3 succeeded!');
    }

    if (!displayUrl) {
      if (resData.key) {
        displayUrl = resData.key.startsWith('http')
          ? resData.key
          : `https://trendigo-s3.s3.amazonaws.com/${resData.key}`;
      } else if (presignedUploadUrl) {
        displayUrl = presignedUploadUrl.split('?')[0];
      } else {
        displayUrl = payload.selectedUri;
      }
    }

    const updatePayload = {
      profileImage: displayUrl,
      profilePic: displayUrl,
      userProfilePic: [{ url: displayUrl, isProfilePic: true }],
    };

    console.log(
      '[Saga: UPLOAD_PROFILE_PIC] Updating user profile with displayUrl:',
      displayUrl,
    );
    const updateRes = yield call(
      customerAuth.updateUser,
      updatePayload,
      token || '',
    );

    try {
      yield call([AsyncStorage, 'setItem'], 'PROFILE_PIC', displayUrl);
      const storedUserStr = yield call([AsyncStorage, 'getItem'], 'USER');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        const updatedStoredUser = {
          ...storedUser,
          profileImage: displayUrl,
          profilePic: displayUrl,
          userProfilePic: displayUrl,
          user: {
            ...(storedUser.user || {}),
            profileImage: displayUrl,
            profilePic: displayUrl,
            userProfilePic: displayUrl,
          },
          customerUser: {
            ...(storedUser.customerUser || {}),
            profileImage: displayUrl,
            profilePic: displayUrl,
            userProfilePic: displayUrl,
          },
        };
        yield call(
          [AsyncStorage, 'setItem'],
          'USER',
          JSON.stringify(updatedStoredUser),
        );
      }
    } catch (e) {}

    const responseData = updateRes?.data?.data ||
      updateRes?.data || {profileImage: displayUrl};

    yield put(actions.uploadProfilePicSuccess(responseData, updatePayload));
    yield put(actions.updateUserCustomerSuccess(responseData, updatePayload));

    if (callback) {
      callback(null, {displayUrl, data: responseData});
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '[Saga: UPLOAD_PROFILE_PIC] Error:',
      JSON.stringify(errorData, null, 2),
    );
    yield put(actions.uploadProfilePicFailed(errorData));
    if (typeof action?.data?.callback === 'function') {
      action.data.callback(errorData, null);
    }
  }
}

function* getVendorPaginatedReviewsSaga(action) {
  try {
    const {page = 1, limit = 10, callback} = action.data || {};
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_PAGINATED_REVIEWS Request]',
      `\nEndpoint: GET https://service.mntech.website/v1/vendor/reviews/paginated?page=${page}&limit=${limit}`,
      `\nPage: ${page}`,
      `\nLimit: ${limit}`,
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.getVendorPaginatedReviews,
      page,
      limit,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_PAGINATED_REVIEWS Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const reviewsData = response?.data?.data || response?.data;

    yield put(actions.getVendorPaginatedReviewsSuccess(reviewsData, page));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_PAGINATED_REVIEWS Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getVendorPaginatedReviewsFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* replyVendorReviewSaga(action) {
  try {
    const {reviewId, payload, callback} = action.data || {};
    console.log(
      '==================================================',
      '\n[Redux Saga: REPLY_VENDOR_REVIEW Request]',
      `\nEndpoint: POST https://service.mntech.website/v1/vendor/reviews/${reviewId}/reply`,
      `\nReview ID: ${reviewId}`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.replyVendorReview,
      reviewId,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: REPLY_VENDOR_REVIEW Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const responseData = response?.data?.data || response?.data;

    yield put(actions.replyVendorReviewSuccess(responseData, reviewId));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: REPLY_VENDOR_REVIEW Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.replyVendorReviewFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getCustomerReviewsSaga(action) {
  try {
    const {page = 1, limit = 10, callback} = action.data || {};
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_REVIEWS Request]',
      `\nEndpoint: GET https://service.mntech.website/v1/customer/reviews?page=${page}&limit=${limit}`,
      `\nPage: ${page}`,
      `\nLimit: ${limit}`,
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.getCustomerReviews,
      page,
      limit,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_REVIEWS Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const reviewsData = response?.data?.data || response?.data;

    yield put(actions.getCustomerReviewsSuccess(reviewsData, page));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_CUSTOMER_REVIEWS Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getCustomerReviewsFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* updateCustomerReviewSaga(action) {
  try {
    const {reviewId, payload, callback} = action.data || {};
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_CUSTOMER_REVIEW Request]',
      `\nEndpoint: PUT https://service.mntech.website/v1/customer/reviews/${reviewId}`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.updateCustomerReview,
      reviewId,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_CUSTOMER_REVIEW Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const updatedData = response?.data?.data || response?.data;

    yield put(actions.updateCustomerReviewSuccess(updatedData, reviewId));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: UPDATE_CUSTOMER_REVIEW Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.updateCustomerReviewFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* deleteCustomerReviewSaga(action) {
  try {
    const {reviewId, callback} = action.data || {};
    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_CUSTOMER_REVIEW Request]',
      `\nEndpoint: DELETE https://service.mntech.website/v1/customer/reviews/${reviewId}`,
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.deleteCustomerReview,
      reviewId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_CUSTOMER_REVIEW Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const deletedData = response?.data?.data || response?.data;

    yield put(actions.deleteCustomerReviewSuccess(deletedData, reviewId));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_CUSTOMER_REVIEW Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.deleteCustomerReviewFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* deleteVendorReviewReplySaga(action) {
  try {
    const {reviewId, callback} = action.data || {};
    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_VENDOR_REVIEW_REPLY Request]',
      `\nEndpoint: DELETE https://service.mntech.website/v1/vendor/reviews/${reviewId}/reply`,
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.deleteVendorReviewReply,
      reviewId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_VENDOR_REVIEW_REPLY Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const deletedData = response?.data?.data || response?.data;

    yield put(actions.deleteVendorReviewReplySuccess(deletedData, reviewId));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_VENDOR_REVIEW_REPLY Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.deleteVendorReviewReplyFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* toggleFavoriteVendorSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log(
      '==================================================',
      '\n[Redux Saga: TOGGLE_FAVORITE_VENDOR Request]',
      '\nEndpoint: POST https://service.mntech.website/v1/customer/favoriteVendor',
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.toggleFavoriteVendor,
      payload,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: TOGGLE_FAVORITE_VENDOR Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.toggleFavoriteVendorSuccess(
        response.data?.data || response.data,
        payload,
      ),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: TOGGLE_FAVORITE_VENDOR Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.toggleFavoriteVendorFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* getFavoriteVendorsSaga(action) {
  try {
    const callback = action?.data?.callback;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_FAVORITE_VENDORS Request]',
      '\nEndpoint: GET https://service.mntech.website/v1/customer/favoriteVendor',
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(customerAuth.getFavoriteVendors, token || '');

    console.log(
      '==================================================',
      '\n[Redux Saga: GET_FAVORITE_VENDORS Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const favoriteVendors = response?.data?.data || response?.data;

    yield put(actions.getFavoriteVendorsSuccess(favoriteVendors));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_FAVORITE_VENDORS Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.getFavoriteVendorsFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* deleteFavoriteVendorSaga(action) {
  try {
    const {vendorId, callback} = action.data || {};
    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_FAVORITE_VENDOR Request]',
      `\nEndpoint: DELETE https://service.mntech.website/v1/customer/favoriteVendor/vendor/${vendorId}`,
      `\nVendor ID: ${vendorId}`,
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.deleteFavoriteVendor,
      vendorId,
      token || '',
    );

    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_FAVORITE_VENDOR Success]',
      `\nStatus: ${response?.status}`,
      '\nData:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    const deletedData = response?.data?.data || response?.data;

    yield put(actions.deleteFavoriteVendorSuccess(deletedData, vendorId));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_FAVORITE_VENDOR Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.deleteFavoriteVendorFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* verifyUpdateOtpSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log(
      '==================================================',
      '\n[Redux Saga: VERIFY_UPDATE_OTP Request]',
      '\nPayload:', JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    const response = yield call(
      customerAuth.verifyUpdateOtp,
      payload,
      token || '',
    );
    console.log(
      '==================================================',
      '\n[Redux Saga: VERIFY_UPDATE_OTP Success]',
      '\nResponse:', JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.verifyUpdateOtpSuccess(response.data.data || response.data),
    );

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: VERIFY_UPDATE_OTP Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:', JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.verifyUpdateOtpFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* sendUpdateMobileOtpSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log(
      '==================================================',
      '\n[Redux Saga: SEND_UPDATE_MOBILE_OTP Request]',
      '\nPayload:', JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    let token = yield call([AsyncStorage, 'getItem'], 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    // Calls the same update-user endpoint to trigger OTP dispatch on device
    const response = yield call(customerAuth.updateUser, payload, token || '');
    console.log(
      '==================================================',
      '\n[Redux Saga: SEND_UPDATE_MOBILE_OTP Success] OTP sent to new mobile',
      '\nResponse:', JSON.stringify(response.data, null, 2),
      '\n==================================================',
    );

    // Intentionally dispatches SEND_UPDATE_MOBILE_OTP_SUCCESS — NOT
    // UPDATE_USER_CUSTOMER_SUCCESS — so the reducer does NOT write the new
    // mobileNumber into Redux state yet. The number only gets committed after
    // the OTP is verified via verifyUpdateOtpSaga.
    yield put(actions.sendUpdateMobileOtpSuccess(response.data.data || response.data));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: SEND_UPDATE_MOBILE_OTP Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:', JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.sendUpdateMobileOtpFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* deleteAccountSaga(action) {
  try {
    const callback = action?.data?.callback;

    let token = action?.data?.payload?.token;
    if (!token) {
      token = yield call([AsyncStorage, 'getItem'], 'token');
    }
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    if (!token || token === '[object Object]') {
      const authState = yield select(state => state.auth);
      let rawToken =
        authState?.user?.token ||
        authState?.user?.accessToken ||
        authState?.user?.data?.token ||
        authState?.user?.data?.accessToken ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.tokens?.access ||
        authState?.user?.data?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access ||
        authState?.user?.user?.token ||
        authState?.user?.data?.user?.token;

      if (typeof rawToken === 'object' && rawToken !== null) {
        rawToken = rawToken.token || rawToken.accessToken;
      }
      token = typeof rawToken === 'string' ? rawToken : null;
    }

    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_ACCOUNT Request]',
      '\nEndpoint: DELETE https://service.mntech.website/v1/customer/auth/delete-account',
      `\nToken Preview: ${token ? `${token.substring(0, 25)}...` : 'NONE'}`,
      '\n==================================================',
    );

    const response = yield call(customerAuth.deleteAccount, token || '');

    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_ACCOUNT Success]',
      '\nResponse Data:',
      JSON.stringify(response?.data, null, 2),
      '\n==================================================',
    );

    yield put(
      actions.deleteAccountSuccess(response?.data?.data || response?.data),
    );

    try {
      yield call([AsyncStorage, 'removeItem'], 'token');
      yield call([AsyncStorage, 'removeItem'], 'SELECTED_LOCATION');
    } catch (e) {
      console.log('Error clearing AsyncStorage on deleteAccount:', e);
    }
    yield put(actions.logoutUser());

    if (callback) {
      callback(null, response?.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log(
      '==================================================',
      '\n[Redux Saga: DELETE_ACCOUNT Error]',
      `\nStatus Code: ${error?.response?.status || 'N/A'}`,
      '\nError Details:',
      JSON.stringify(errorData, null, 2),
      '\n==================================================',
    );
    yield put(actions.deleteAccountFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

export default function* customerAuthSaga() {
  yield takeLatest(TYPES.LOGIN_CUSTOMER, registerCustomer);
  yield takeLatest(TYPES.REGISTER_VENDOR, registerVendor);
  yield takeLatest(TYPES.VERIFY_OTP_CUSTOMER, verifyOtpCustomer);
  yield takeLatest(TYPES.VERIFY_OTP_VENDOR, verifyOtpVendor);
  yield takeLatest(TYPES.UPDATE_USER_CUSTOMER, updateCustomerUser);
  yield takeLatest(TYPES.UPDATE_VENDOR_PROFILE, updateVendorProfileSaga);
  yield takeLatest(TYPES.SAVE_BUSINESS_ADDRESS, saveBusinessAddressSaga);
  yield takeLatest(TYPES.GET_VENDOR_CATEGORIES, getVendorCategoriesSaga);
  yield takeLatest(TYPES.GET_CATEGORIES, getCategoriesSaga);
  yield takeLatest(TYPES.GET_CATEGORY_BY_ID, getCategoryByIdSaga);
  yield takeLatest(TYPES.GET_SERVICES_BY_CATEGORY, getServicesByCategorySaga);
  yield takeLatest(
    TYPES.GET_VENDOR_SERVICES_BY_CATEGORY,
    getVendorServicesByCategorySaga,
  );
  yield takeLatest(TYPES.GET_VENDOR_USER_DETAILS, getVendorUserDetailsSaga);
  yield takeLatest(TYPES.SAVE_VENDOR_SERVICES, saveVendorServicesSaga);
  yield takeLatest(TYPES.RESEND_OTP_VENDOR, resendOtpVendorSaga);
  yield takeLatest(TYPES.LOGIN_VENDOR, loginVendorSaga);
  yield takeLatest(TYPES.GET_MY_AVAILABILITY, getMyAvailabilitySaga);
  yield takeLatest(TYPES.UPDATE_MY_AVAILABILITY, updateMyAvailabilitySaga);
  yield takeLatest(TYPES.UPDATE_USER_LOCATION, updateUserLocationSaga);
  yield takeLatest(TYPES.SAVE_CUSTOMER_ADDRESS, saveCustomerAddressSaga);
  yield takeLatest(TYPES.UPDATE_CUSTOMER_ADDRESS, updateCustomerAddressSaga);
  yield takeLatest(TYPES.GET_CUSTOMER_ADDRESSES, getCustomerAddressesSaga);
  yield takeLatest(TYPES.DELETE_CUSTOMER_ADDRESS, deleteCustomerAddressSaga);
  yield takeLatest(TYPES.CREATE_BOOKING, createBookingSaga);
  yield takeLatest(TYPES.GET_BOOKING_BY_ID, getBookingByIdSaga);
  yield takeLatest(TYPES.UPDATE_BOOKING_ADDRESS, updateBookingAddressSaga);
  yield takeLatest(TYPES.GET_VENDOR_BOOKINGS, getVendorBookingsSaga);
  yield takeLatest(TYPES.ACCEPT_VENDOR_BOOKING, acceptVendorBookingSaga);
  yield takeLatest(TYPES.CANCEL_VENDOR_BOOKING, cancelVendorBookingSaga);
  yield takeLatest(TYPES.VENDOR_SEND_OTP, vendorSendOtpSaga);
  yield takeLatest(TYPES.VENDOR_RESEND_OTP, vendorResendOtpSaga);
  yield takeLatest(TYPES.VENDOR_VERIFY_OTP, vendorVerifyOtpSaga);
  yield takeLatest(TYPES.GET_CUSTOMER_BOOKINGS, getCustomerBookingsSaga);
  yield takeLatest(TYPES.CANCEL_CUSTOMER_BOOKING, cancelCustomerBookingSaga);
  yield takeLatest(TYPES.CREATE_CUSTOMER_REVIEW, createCustomerReviewSaga);
  yield takeLatest(TYPES.UPLOAD_PROFILE_PIC, uploadProfilePicSaga);
  yield takeLatest(
    TYPES.GET_VENDOR_PAGINATED_REVIEWS,
    getVendorPaginatedReviewsSaga,
  );
  yield takeLatest(TYPES.REPLY_VENDOR_REVIEW, replyVendorReviewSaga);
  yield takeLatest(TYPES.GET_CUSTOMER_REVIEWS, getCustomerReviewsSaga);
  yield takeLatest(TYPES.UPDATE_CUSTOMER_REVIEW, updateCustomerReviewSaga);
  yield takeLatest(TYPES.DELETE_CUSTOMER_REVIEW, deleteCustomerReviewSaga);
  yield takeLatest(
    TYPES.DELETE_VENDOR_REVIEW_REPLY,
    deleteVendorReviewReplySaga,
  );
  yield takeLatest(TYPES.TOGGLE_FAVORITE_VENDOR, toggleFavoriteVendorSaga);
  yield takeLatest(TYPES.GET_FAVORITE_VENDORS, getFavoriteVendorsSaga);
  yield takeLatest(TYPES.DELETE_FAVORITE_VENDOR, deleteFavoriteVendorSaga);
  yield takeLatest(TYPES.VERIFY_UPDATE_OTP, verifyUpdateOtpSaga);
  yield takeLatest(TYPES.SEND_UPDATE_MOBILE_OTP, sendUpdateMobileOtpSaga);
  yield takeLatest(TYPES.DELETE_ACCOUNT, deleteAccountSaga);
}
