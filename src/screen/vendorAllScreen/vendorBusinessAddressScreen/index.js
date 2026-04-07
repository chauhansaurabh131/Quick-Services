import React, {useEffect, useState} from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';
import {useNavigation} from '@react-navigation/native';

const VendorBusinessAddressScreen = () => {
  const [addressOne, setAddressOne] = useState('');
  const [addressTwo, setAddressTwo] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const navigation = useNavigation();

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
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* HEADER */}
      <View
        style={{
          height: hp(55),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          activeOpacity={0.6}
          style={{
            height: '100%',
            width: wp(65),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={icons.back_Arrow_Icon}
            style={{width: wp(15), height: hp(15), resizeMode: 'contain'}}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          Business Address
        </Text>

        <Text
          style={{
            color: colors.primaryColor,
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
            marginRight: wp(13),
          }}>
          Step 3 of 6
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={{width: '100%', height: hp(1), backgroundColor: '#E5E5E5'}}>
        <View
          style={{
            width: '49.8%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{marginTop: hp(5)}}>
        <BorderShowLabelTextInputComponent
          label={'Address Line 1'}
          value={addressOne}
          onChangeText={setAddressOne}
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'Address Line 2'}
          value={addressTwo}
          onChangeText={setAddressTwo}
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'City'}
          value={city}
          onChangeText={setCity}
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'State'}
          value={state}
          onChangeText={setState}
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'Pin Code'}
          value={pinCode}
          onChangeText={setPinCode}
          multiline={false}
        />
      </ScrollView>

      {!keyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            alignItems: 'center',
            height: hp(90),
          }}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              width: '90%',
              height: hp(50),
              backgroundColor: colors.primaryColor,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
              top: hp(10),
            }}
            onPress={() => {
              navigation.navigate('KycDetailsScreen');
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              KYC Details
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VendorBusinessAddressScreen;
