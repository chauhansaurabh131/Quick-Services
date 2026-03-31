import React, {useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation, useRoute} from '@react-navigation/native';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';

const EnterCompleteAddressScreen = () => {
  const route = useRoute();
  const editData = route.params?.editData;
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [selectedType, setSelectedType] = useState('Home');
  const [address, setAddress] = useState('');
  const [floor, setFloor] = useState('');
  const [landmark, setLandmark] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const addressTypes = [
    {id: 1, label: t('home'), value: 'Home', icon: icons.purple_Home_Icon},
    {id: 2, label: t('work'), value: 'Work', icon: icons.work_Icon},
    {id: 3, label: t('hotel'), value: 'Hotel', icon: icons.hotel_Icon},
    {id: 4, label: t('other'), value: 'Other', icon: icons.other_Icon},
  ];

  useEffect(() => {
    if (editData) {
      setSelectedType(editData.type);
      setAddress(editData.address);
      setFloor(editData.floor);
      setLandmark(editData.landmark);
      setName(editData.name);
      setMobile(editData.mobile);
    }
  }, [editData]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isFormValid =
    address.trim() !== '' && name.trim() !== '' && mobile.trim().length === 10;

  const handleSaveAddress = async () => {
    try {
      const existing = await AsyncStorage.getItem('ADDRESSES');
      let addressList = existing ? JSON.parse(existing) : [];

      if (editData) {
        // 🔥 UPDATE MODE
        const updatedList = addressList.map(item =>
          item.id === editData.id
            ? {
                ...item,
                type: selectedType,
                address,
                floor,
                landmark,
                name,
                mobile,
              }
            : item,
        );

        await AsyncStorage.setItem('ADDRESSES', JSON.stringify(updatedList));
      } else {
        // 🔥 CREATE MODE
        const newAddress = {
          id: Date.now(),
          type: selectedType,
          address,
          floor,
          landmark,
          name,
          mobile,
          isDefault: false,
        };

        addressList.push(newAddress);

        await AsyncStorage.setItem('ADDRESSES', JSON.stringify(addressList));
      }

      navigation.goBack();
    } catch (e) {
      console.log('Error:', e);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{paddingBottom: hp(40)}}>
            {/* HEADER */}
            <View
              style={{
                height: hp(50),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  position: 'absolute',
                  left: 0,
                  width: wp(50),
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.back_Arrow_Icon}
                  style={{
                    width: hp(14),
                    height: hp(14),
                    resizeMode: 'contain',
                  }}
                />
              </TouchableOpacity>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('enter_complete_address')}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                width: '100%',
                height: hp(1),
                backgroundColor: '#E3E3E3',
              }}
            />

            {/* SAVE ADDRESS */}
            <View style={{marginTop: hp(18)}}>
              <Text
                style={{
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  color: '#7D7D7D',
                  marginBottom: hp(11),
                  marginHorizontal: wp(18),
                }}>
                Save address as
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingLeft: wp(16),
                  paddingRight: wp(16),
                }}>
                {addressTypes.map(item => {
                  const isSelected = selectedType === item.value;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setSelectedType(item.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: hp(10),
                        borderWidth: 1,
                        borderColor: isSelected ? '#CDADF6' : '#D2D2D2',
                        backgroundColor: isSelected ? '#F3F0FF' : '#FFF',
                        marginRight: wp(10),
                        width: wp(104),
                        height: hp(44),
                        justifyContent: 'center',
                      }}>
                      <Image
                        source={item.icon}
                        style={{
                          width: hp(14),
                          height: hp(14),
                          marginRight: wp(10),
                          resizeMode: 'contain',
                        }}
                      />

                      <Text
                        style={{
                          fontSize: fontSize(14),
                          fontFamily: fontFamily.poppins400,
                          color: colors.pureBlack,
                          top: 2,
                        }}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* INPUTS */}
              <View style={{marginTop: hp(10)}}>
                <BorderShowLabelTextInputComponent
                  label={`${t('complete_address')} *`}
                  value={address}
                  onChangeText={setAddress}
                />

                <BorderShowLabelTextInputComponent
                  label={`${t('floor')}`}
                  optional
                  value={floor}
                  onChangeText={setFloor}
                />

                <BorderShowLabelTextInputComponent
                  label={`${t('nearby_landmark')}`}
                  optional
                  value={landmark}
                  onChangeText={setLandmark}
                />
              </View>

              {/* RECEIVER DETAILS */}
              <Text
                style={{
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  color: '#7D7D7D',
                  paddingHorizontal: wp(16),
                  marginTop: hp(31),
                }}>
                Add Service Receiver’s Details
              </Text>

              <BorderShowLabelTextInputComponent
                label={t('name')}
                value={name}
                onChangeText={setName}
                multiline={false}
              />

              <BorderShowLabelTextInputComponent
                label={t('mobile_number')}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="number-pad"
                maxLength={10}
                multiline={false}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {!isKeyboardVisible && (
          <View
            style={{
              position: 'absolute',
              bottom: hp(20),
              left: wp(16),
              right: wp(16),
            }}>
            <TouchableOpacity
              activeOpacity={isFormValid ? 0.6 : 1}
              disabled={!isFormValid}
              onPress={handleSaveAddress}
              style={{
                height: hp(50),
                borderRadius: hp(25),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.primaryColor, // ✅ ALWAYS SAME
                opacity: isFormValid ? 1 : 0.5, // 👈 only fade effect
              }}>
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(15),
                  fontFamily: fontFamily.poppins400,
                }}>
                {editData ? t('update_address') : t('save_address')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EnterCompleteAddressScreen;
