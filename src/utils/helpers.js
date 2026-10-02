import {STANDARD_SCREEN_HEIGHT, STANDARD_SCREEN_WIDTH} from './constants';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';
import {Platform} from 'react-native';

export const wp = val => {
  const valInPercentage = (val * 100) / STANDARD_SCREEN_WIDTH;
  return widthPercentageToDP(valInPercentage);
};

export const hp = val => {
  const valInPercentage = (val * 100) / STANDARD_SCREEN_HEIGHT;
  return heightPercentageToDP(valInPercentage);
};

export const fontSize = value => RFValue(value, STANDARD_SCREEN_HEIGHT);

export const isAndroid = Platform.OS === 'android';

export const isIOS = Platform.OS === 'ios';

export const fontFamily = {
  inter700: isAndroid ? 'inter_bold' : 'Inter-Bold',
  inter600: isAndroid ? 'inter_semi_bold' : 'Inter-SemiBold',
  inter500: isAndroid ? 'inter_medium' : 'Inter-Medium',
  inter400: isAndroid ? 'inter_regular' : 'Inter-Regular',

  poppins700: 'Poppins-Bold',
  poppins600: 'Poppins-SemiBold',
  poppins500: 'Poppins-Medium',
  poppins400: 'Poppins-Regular',

  bebesneue400: isAndroid ? 'bebasneue_regular' : 'Bebas Neue',
  nunito200: isAndroid ? 'nunito_extra_light' : 'Nunito ExtraLight',
  nunito300: isAndroid ? 'nunito_light' : 'Nunito Light',
  nunito400: isAndroid ? 'nunito_regular' : 'Nunito Regular',
  nunito500: isAndroid ? 'nunito_medium' : 'Nunito Medium',
  nunito600: isAndroid ? 'nunito_semi_bold' : 'Nunito SemiBold',
  nunito700: isAndroid ? 'nunito_bold' : 'Nunito Bold',
  montserrat: 'Montserrat', // New font entry
};

export const formatReviewTime = reviewTime => {
  if (!reviewTime) {
    return '';
  }

  const dateObj = new Date(reviewTime);
  if (isNaN(dateObj.getTime())) {
    return String(reviewTime);
  }

  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();

  if (diffInMs < 0) {
    return '5min ago';
  }

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSeconds / 60);

  if (diffInMins < 1) {
    return '1min ago';
  }

  if (diffInMins < 60) {
    return `${diffInMins}min ago`;
  }

  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    const finalMonths = diffInMonths < 1 ? 1 : diffInMonths;
    return `${finalMonths} ${finalMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  const finalYears = diffInYears < 1 ? 1 : diffInYears;
  return `${finalYears} ${finalYears === 1 ? 'year' : 'years'} ago`;
};
