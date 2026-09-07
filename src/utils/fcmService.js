import { DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

let notifee = null;
let AndroidImportance = { HIGH: 4 };

try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default || notifeeModule;
  if (notifeeModule.AndroidImportance) {
    AndroidImportance = notifeeModule.AndroidImportance;
  }
} catch (e) {
  console.log('[FCM Service] Notifee native module pending native rebuild');
}

/**
 * Request Notification Permissions for iOS and Android 13+ (API level 33+)
 */
export const requestUserPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[FCM Service] Android 13+ Notification Permission Granted');
      } else {
        console.log('[FCM Service] Android 13+ Notification Permission Denied');
      }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('[FCM Service] Messaging Authorization Status:', authStatus);
      await getFCMToken();
    } else {
      console.log('[FCM Service] Messaging Authorization Denied');
    }
  } catch (error) {
    console.log('[FCM Service] Error requesting permission:', error);
  }
};

/**
 * Fetch and return FCM Device Registration Token
 */
export const getFCMToken = async () => {
  try {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('\n==================================================');
        console.log('🔥 NEW FCM REGISTRATION TOKEN GENERATED:');
        console.log(fcmToken);
        console.log('==================================================\n');
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    } else {
      console.log('\n==================================================');
      console.log('🔥 EXISTING FCM REGISTRATION TOKEN LOADED:');
      console.log(fcmToken);
      console.log('==================================================\n');
    }
    return fcmToken;
  } catch (error) {
    console.log('[FCM Service] Error getting FCM Token:', error);
    return null;
  }
};

/**
 * Listen to FCM Token Refresh events
 */
export const listenToTokenRefresh = () => {
  return messaging().onTokenRefresh(async token => {
    console.log('\n==================================================');
    console.log('🔄 FCM TOKEN REFRESHED:');
    console.log(token);
    console.log('==================================================\n');
    await AsyncStorage.setItem('fcmToken', token);
  });
};

/**
 * Display native system notification in device notification bar / status bar
 */
export const displayDeviceNotification = async (title, body, data = {}) => {
  try {
    if (!notifee) {
      console.log('[FCM Service] Native Notifee module pending rebuild:', title, body);
      return;
    }

    const titleLower = String(title || '').toLowerCase();
    const bodyLower = String(body || '').toLowerCase();
    const dataStr = JSON.stringify(data || {}).toLowerCase();

    const isVendorBookingRequest =
      data?.isVendorRequest ||
      data?.type === 'new_booking' ||
      data?.type === 'vendor_booking' ||
      titleLower.includes('new booking') ||
      titleLower.includes('incoming request') ||
      titleLower.includes('booking request') ||
      bodyLower.includes('new booking') ||
      bodyLower.includes('booking request') ||
      dataStr.includes('panding') ||
      dataStr.includes('vendor');

    if (isVendorBookingRequest) {
      // VENDOR SIDE INCOMING BOOKING ALERT -> Use custom ringbell sound
      const channelId = await notifee.createChannel({
        id: 'karyaah_vendor_booking_ringbell_channel_v5',
        name: 'Karyaah Vendor Booking Alerts',
        importance: AndroidImportance.HIGH,
        sound: 'ringbell',
        vibration: true,
        vibrationPattern: [600, 1000, 600, 1000, 600, 1000],
      });

      await notifee.displayNotification({
        title: title || 'New Booking Request',
        body: body || 'You have a new incoming booking request.',
        data,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
          sound: 'ringbell',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'ringbell.mp3',
        },
      });
    } else {
      // CUSTOMER SIDE NOTIFICATION -> Use default system notification sound
      const channelId = await notifee.createChannel({
        id: 'karyaah_customer_default_channel',
        name: 'Karyaah Customer Notifications',
        importance: AndroidImportance.DEFAULT,
        sound: 'default',
        vibration: true,
      });

      await notifee.displayNotification({
        title: title || 'Notification',
        body: body || '',
        data,
        android: {
          channelId,
          importance: AndroidImportance.DEFAULT,
          smallIcon: 'ic_launcher',
          sound: 'default',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });
    }
  } catch (error) {
    console.log('[FCM Service] Error displaying device notification:', error);
  }
};



/**
 * Listen to Foreground Push Notifications
 */
export const listenToForegroundMessages = () => {
  return messaging().onMessage(async remoteMessage => {
    console.log('\n==================================================');
    console.log('📩 FOREGROUND PUSH NOTIFICATION RECEIVED:');
    console.log(JSON.stringify(remoteMessage, null, 2));
    console.log('==================================================\n');

    DeviceEventEmitter.emit('FCM_BOOKING_NOTIFICATION_RECEIVED', remoteMessage);

    const notificationTitle =
      remoteMessage?.notification?.title ||
      remoteMessage?.data?.title ||
      'Notification';
    const notificationBody =
      remoteMessage?.notification?.body ||
      remoteMessage?.data?.body ||
      '';

    await displayDeviceNotification(
      notificationTitle,
      notificationBody,
      remoteMessage?.data || {},
    );
  });
};

/**
 * Listen to Notification Open events (Tapped when app was in background or closed)
 */
export const listenToNotificationOpen = () => {
  // App opened from background state by tapping notification
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('\n==================================================');
    console.log('📲 APP OPENED FROM BACKGROUND BY NOTIFICATION TAP:');
    console.log(JSON.stringify(remoteMessage, null, 2));
    console.log('==================================================\n');
    DeviceEventEmitter.emit('FCM_BOOKING_NOTIFICATION_RECEIVED', remoteMessage);
  });

  // App opened from quit/closed state by tapping notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('\n==================================================');
        console.log('🚀 APP OPENED FROM CLOSED STATE BY NOTIFICATION TAP:');
        console.log(JSON.stringify(remoteMessage, null, 2));
        console.log('==================================================\n');
        DeviceEventEmitter.emit('FCM_BOOKING_NOTIFICATION_RECEIVED', remoteMessage);
      }
    });
};

/**
 * Master FCM Initialization Routine
 */
export const initFCM = async () => {
  await requestUserPermission();
  const unsubscribeForeground = listenToForegroundMessages();
  const unsubscribeTokenRefresh = listenToTokenRefresh();
  listenToNotificationOpen();

  return () => {
    if (unsubscribeForeground) unsubscribeForeground();
    if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
  };
};

export default {
  requestUserPermission,
  getFCMToken,
  listenToTokenRefresh,
  listenToForegroundMessages,
  listenToNotificationOpen,
  initFCM,
};
