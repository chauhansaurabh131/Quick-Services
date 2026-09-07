import React, {useEffect} from 'react';
import {SafeAreaView} from 'react-native';
import {Provider} from 'react-redux';
import {store, persistor} from './src/reducer/store';
import {PersistGate} from 'redux-persist/integration/react';
import Navigation from './src/navigation';
import './src/localization/i18n';
import {LogBox} from 'react-native';
import {initFCM} from './src/utils/fcmService';

import Toast from 'react-native-toast-message';

LogBox.ignoreAllLogs();

const App = () => {
  useEffect(() => {
    let cleanup;
    initFCM().then(unsub => {
      cleanup = unsub;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={{flex: 1}}>
          <Navigation />
          <Toast />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default App;
