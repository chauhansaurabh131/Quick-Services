import {call, put, select, takeLatest} from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TYPES from '../actions/actionTypes';
import * as actions from '../actions/customerAuthActions';
import {customerAuth} from '../apis';

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
    console.log('Verify OTP Request Payload:', payload);
    const response = yield call(customerAuth.verifyOtp, payload);
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
    console.log('Verify OTP Vendor Request Payload:', payload);
    const response = yield call(customerAuth.verifyOtpVendor, payload);
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
    } = action.data;
    console.log(
      '==================================================',
      '\n[Redux Saga: GET_VENDOR_SERVICES_BY_CATEGORY Request]',
      `\nCategory ID: ${categoryId}`,
      `\nLongitude: ${longitude}`,
      `\nLatitude: ${latitude}`,
      `\nPage: ${page}`,
      `\nLimit: ${limit}`,
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
    console.log('Login Vendor Request Payload:', payload);
    const response = yield call(customerAuth.loginVendor, payload, token);
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
}
