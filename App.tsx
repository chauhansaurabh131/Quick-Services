import React from 'react';
import {SafeAreaView} from 'react-native';
import {Provider} from 'react-redux';
import {store, persistor} from './src/reducer/store';
import {PersistGate} from 'redux-persist/integration/react';
import Navigation from './src/navigation';
import './src/localization/i18n';
import {LogBox} from 'react-native';

LogBox.ignoreAllLogs();

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={{flex: 1}}>
          <Navigation />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default App;
