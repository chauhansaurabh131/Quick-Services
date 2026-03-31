import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';

const resources = {
  en: {translation: en},
  hi: {translation: hi},
  gu: {translation: gu},
};

const LANGUAGE_KEY = 'APP_LANGUAGE';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async callback => {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    callback(savedLanguage || 'en');
  },
  init: () => {},
  cacheUserLanguage: async language => {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // ⭐ IMPORTANT FIX
    },
  });

export default i18n;
