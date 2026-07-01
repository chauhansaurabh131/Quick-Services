import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  applyMiddleware,
  compose,
  legacy_createStore as createStore,
} from 'redux';
import {persistReducer, persistStore} from 'redux-persist';
import createSagaMiddleware from 'redux-saga';

import rootReducer from '../index';
import rootSaga from '../../saga';
import Reactotron from 'reactotron-react-native';

const middleware = [];
const enhancers = [];

const sagaMonitor = __DEV__ ? Reactotron.createSagaMonitor() : undefined;

const sagaMiddleware = createSagaMiddleware({
  sagaMonitor,
  onError: (error, errorInfo) => {
    console.log('Saga error caught:', error, errorInfo);
  },
});

middleware.push(sagaMiddleware);
enhancers.push(applyMiddleware(...middleware));

if (__DEV__) {
  const reactotronEnhancer = Reactotron.createEnhancer();
  if (reactotronEnhancer) {
    enhancers.push(reactotronEnhancer);
  }
}

const persistConfig = {
  key: 'QuickService',
  storage: AsyncStorage,
};

const persistRootReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistRootReducer, compose(...enhancers));
export const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);
