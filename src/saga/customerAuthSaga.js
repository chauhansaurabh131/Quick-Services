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
    console.log('Update Customer User Request Payload:', payload);
    let token = yield call(AsyncStorage.getItem, 'token');
    if (typeof token === 'object' && token !== null) {
      token = token.token || token.accessToken;
    }
    console.log('Retrieved Token from AsyncStorage for Update:', token);

    if (!token || token === '[object Object]') {
      console.log('Token not found in AsyncStorage. Querying Redux state...');
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
      console.log('Extracted Token from Redux state:', token);
    }

    const response = yield call(customerAuth.updateUser, payload, token || '');
    console.log(
      'Update Customer User Response:',
      JSON.stringify(response.data, null, 2),
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
      'Update Customer User Error:',
      JSON.stringify(errorData, null, 2),
    );
    yield put(actions.updateUserCustomerFailed(errorData));

    if (action.data.callback) {
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

    const response = yield call(customerAuth.updateVendorProfile, payload, token || '');
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
    console.log('Update Vendor Profile Error:', JSON.stringify(errorData, null, 2));
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

    const response = yield call(customerAuth.saveBusinessAddress, payload, token || '');
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
    console.log('Save Business Address Error:', JSON.stringify(errorData, null, 2));
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

    const categoriesData = response.data?.data || response.data?.categories || response.data;

    yield put(actions.getVendorCategoriesSuccess(categoriesData));

    if (callback) {
      callback(null, response.data);
    }
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.log('Get Vendor Categories Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.getVendorCategoriesFailed(errorData));

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
    console.log('Get Services By Category Error:', JSON.stringify(errorData, null, 2));
    yield put(actions.getServicesByCategoryFailed(errorData));

    if (action?.data?.callback) {
      action.data.callback(errorData, null);
    }
  }
}

function* saveVendorServicesSaga(action) {
  try {
    const {payload, callback} = action.data;
    console.log('Sending Vendor Services Payload:', JSON.stringify(payload, null, 2));
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
    console.log('Save Vendor Services Error:', JSON.stringify(errorData, null, 2));
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
    console.log('Login Vendor Response:', JSON.stringify(response.data, null, 2));

    yield put(
      actions.loginVendorSuccess(response.data.data || response.data),
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

export default function* customerAuthSaga() {
  yield takeLatest(TYPES.LOGIN_CUSTOMER, registerCustomer);
  yield takeLatest(TYPES.REGISTER_VENDOR, registerVendor);
  yield takeLatest(TYPES.VERIFY_OTP_CUSTOMER, verifyOtpCustomer);
  yield takeLatest(TYPES.VERIFY_OTP_VENDOR, verifyOtpVendor);
  yield takeLatest(TYPES.UPDATE_USER_CUSTOMER, updateCustomerUser);
  yield takeLatest(TYPES.UPDATE_VENDOR_PROFILE, updateVendorProfileSaga);
  yield takeLatest(TYPES.SAVE_BUSINESS_ADDRESS, saveBusinessAddressSaga);
  yield takeLatest(TYPES.GET_VENDOR_CATEGORIES, getVendorCategoriesSaga);
  yield takeLatest(TYPES.GET_SERVICES_BY_CATEGORY, getServicesByCategorySaga);
  yield takeLatest(TYPES.SAVE_VENDOR_SERVICES, saveVendorServicesSaga);
  yield takeLatest(TYPES.RESEND_OTP_VENDOR, resendOtpVendorSaga);
  yield takeLatest(TYPES.LOGIN_VENDOR, loginVendorSaga);
}

