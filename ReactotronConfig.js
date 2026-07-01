import AsyncStorage from '@react-native-async-storage/async-storage';
import apiSaucePlugin from 'reactotron-apisauce';
import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import sagaPlugin from 'reactotron-redux-saga';

let host = 'localhost';
if (__DEV__) {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    host = scriptURL.split('://')[1].split(':')[0];
  }
}

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: 'QuickService',
    host: host,
  })
  .useReactNative()
  .use(apiSaucePlugin())
  .use(sagaPlugin())
  .use(reactotronRedux())
  .connect();

// Clear Reactotron on every bundle load
Reactotron.clear();

// Extend console with tron for easy access
console.tron = Reactotron;

export default reactotron;
