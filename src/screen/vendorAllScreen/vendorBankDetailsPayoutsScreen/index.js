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
import {useNavigation} from '@react-navigation/native';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';

const VendorBankDetailsPayoutsScreen = () => {
  const navigation = useNavigation();

  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [pinCode, setPinCode] = useState('');
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
          Bank Details for Payouts
        </Text>

        <Text
          style={{
            color: colors.primaryColor,
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
            marginRight: wp(15),
          }}>
          Step 6 of 6
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={{width: '100%', height: hp(1), backgroundColor: '#E5E5E5'}}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      <ScrollView>
        <View style={{marginHorizontal: wp(18), marginTop: hp(22)}}>
          <View
            style={{
              width: '100%',
              backgroundColor: '#FFFCF6',
              padding: hp(18),
              borderWidth: hp(1),
              borderColor: '#F0AA07',
              borderRadius: hp(18),
            }}>
            <View style={{flexDirection: 'row'}}>
              <Image
                source={icons.secure_Payout_Icon}
                style={{width: hp(16), height: hp(20), resizeMode: 'contain'}}
              />

              <View style={{marginLeft: wp(16)}}>
                <Text
                  style={{
                    color: '#F0AA07',
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  Secure Payouts
                </Text>

                <Text
                  style={{
                    color: colors.pureBlack,
                    marginTop: hp(9),
                    fontSize: fontSize(10),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Your payment information is stored securely; Payouts{'\n'}are
                  released automatically to this account 24 hours{'\n'}after
                  each job completion.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{marginTop: hp(5)}}>
          <BorderShowLabelTextInputComponent
            label={'Account Holder Name'}
            value={accountName}
            onChangeText={setBankName}
            multiline={false}
          />

          <BorderShowLabelTextInputComponent
            label={'Bank Name'}
            value={bankName}
            onChangeText={setBankName}
            multiline={false}
          />

          <BorderShowLabelTextInputComponent
            label={'Account Number'}
            value={accountNumber}
            onChangeText={setAccountNumber}
            multiline={false}
            keyboardType="number-pad"
          />

          <BorderShowLabelTextInputComponent
            label={'IFSC Code'}
            value={ifscCode}
            onChangeText={setIfscCode}
            multiline={false}
          />

          <BorderShowLabelTextInputComponent
            label={'Pin Code'}
            value={pinCode}
            onChangeText={setPinCode}
            multiline={false}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Text
            style={{
              color: colors.black,
              marginHorizontal: wp(18),
              textAlign: 'center',
              marginTop: hp(21),
              marginBottom: hp(10),
              fontSize: fontSize(10),
              fontFamily: fontFamily.poppins400,
            }}>
            By completing registration, you agree to our Terms of Service{'\n'}
            and Payout Policy. Your bank detail are encrypted and never{'\n'}
            share with customers.
          </Text>
        </View>
      </ScrollView>

      {!keyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            alignItems: 'center',
            height: hp(80),
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
              // navigation.navigate('VendorBusinessAddressScreen');
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              Complete Registration
            </Text>

            {/* Right Arrow */}
            <Image
              source={icons.back_Arrow_Icon}
              style={{
                position: 'absolute',
                right: hp(25),
                width: hp(15),
                height: hp(15),
                tintColor: colors.white,
                transform: [{rotate: '180deg'}],
              }}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VendorBankDetailsPayoutsScreen;
