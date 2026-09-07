/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

// Register FCM background notification handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FCM Service] Background Push Notification received:', remoteMessage);
});

if (__DEV__) {
  require('./ReactotronConfig');
}

AppRegistry.registerComponent(appName, () => App);
