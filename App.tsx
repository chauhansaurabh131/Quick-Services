import React from 'react';
import {SafeAreaView} from 'react-native';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import Navigation from './src/navigation';
import './src/localization/i18n';
import {LogBox} from 'react-native';

LogBox.ignoreAllLogs();

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaView style={{flex: 1}}>
        <Navigation />
      </SafeAreaView>
    </Provider>
  );
};

export default App;
