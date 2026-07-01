import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {icons, images} from '../../../assets';
import {style} from './style';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {loginCustomer} from '../../../actions/customerAuthActions';

const LoginScreen = ({navigation}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const {t} = useTranslation();

  const dispatch = useDispatch();
  const {loading} = useSelector(state => state.auth || {});

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleContinue = () => {
    if (mobileNumber.length < 10) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid 10-digit mobile number',
      );
      return;
    }

    const payload = {
      countryCodeId: '6a420c2f668100ad2212e8ea',
      mobileNumber: mobileNumber,
    };

    dispatch(
      loginCustomer(payload, (error, response) => {
        if (error) {
          Alert.alert('Error', error.message || 'Something went wrong');
        } else {
          navigation.navigate('OtpVerificationScreen', {mobileNumber});
        }
      }),
    );
  };

  return (
    <SafeAreaView style={style.container}>
      <View style={style.imageTopContainer}>
        <ImageBackground
          source={images.login_screen_img}
          style={style.imageStyle}
          resizeMode="stretch"
        />
      </View>

      <View style={style.bodyContainer}>
        <View style={style.bodySecondContainer}>
          <Text style={style.bodyTittle}>
            {t('welcome')}
            {'\n'}
            {t('bookMyService')}
          </Text>

          <View style={style.textInputBody}>
            <View style={style.textInputCountry}>
              <Text style={style.textInputNumber}>+91</Text>

              <Image
                source={icons.bottom_Arrow_Icon}
                style={style.textInputImage}
              />
            </View>
            <View style={style.textInputVerticalLine} />

            <TextInput
              placeholder="Enter Your Mobile Number"
              placeholderTextColor="#555"
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              maxLength={10}
              style={style.textInputStyle}
            />
          </View>
        </View>
      </View>

      {!keyboardVisible && (
        <View style={style.buttonPosition}>
          <View style={style.buttonBody}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={loading || mobileNumber.length !== 10}
              activeOpacity={0.6}
              style={[
                style.buttonBodyStyle,
                {
                  opacity: mobileNumber.length === 10 ? 1 : 0.5,
                },
              ]}>
              {loading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text style={style.buttonTextStyle}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;
