import {all, fork} from 'redux-saga/effects';
import customerAuthSaga from './customerAuthSaga';

export default function* root() {
  yield all([
    fork(customerAuthSaga),
  ]);
}
