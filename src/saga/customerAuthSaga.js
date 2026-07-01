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
    const token =
      response.data?.token ||
      response.data?.data?.token ||
      response.data?.tokens?.access?.token ||
      response.data?.data?.tokens?.access?.token;

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
    console.log('Retrieved Token from AsyncStorage for Update:', token);

    if (!token) {
      console.log('Token not found in AsyncStorage. Querying Redux state...');
      const authState = yield select(state => state.auth);
      console.log(
        'auth state user data:',
        JSON.stringify(authState?.user, null, 2),
      );
      token =
        authState?.user?.token ||
        authState?.user?.data?.token ||
        authState?.user?.tokens?.access?.token ||
        authState?.user?.data?.tokens?.access?.token;
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

export default function* customerAuthSaga() {
  yield takeLatest(TYPES.LOGIN_CUSTOMER, registerCustomer);
  yield takeLatest(TYPES.VERIFY_OTP_CUSTOMER, verifyOtpCustomer);
  yield takeLatest(TYPES.UPDATE_USER_CUSTOMER, updateCustomerUser);
}
