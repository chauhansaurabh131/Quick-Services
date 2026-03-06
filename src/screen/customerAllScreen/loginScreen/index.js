import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {colors} from '../../../utils/colors';
import {icons, images} from '../../../assets';
import {style} from './style';

const LoginScreen = ({navigation}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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
          <Text style={style.bodyTittle}>Welcome to{'\n'}BookMyService</Text>

          <Text style={style.bodySubTittle}>
            Enter your mobile number to get started
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
              style={style.textInputStyle}
            />
          </View>
        </View>
      </View>

      {!keyboardVisible && (
        <View style={style.buttonPosition}>
          <View style={style.buttonBody}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Demo')}
              activeOpacity={0.6}
              style={style.buttonBodyStyle}>
              <Text style={style.buttonTextStyle}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;
