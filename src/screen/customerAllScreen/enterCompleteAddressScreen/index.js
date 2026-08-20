import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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

import {useDispatch} from 'react-redux';
import {
  saveCustomerAddress,
  updateCustomerAddress,
} from '../../../actions/customerAuthActions';

const EnumLocationTypeOfAddress = {
  HOME: 'home',
  WORK: 'work',
  HOTEL: 'hotel',
  OTHER: 'other',
};

const EnterCompleteAddressScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const editData = route.params?.editData;
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);
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
      setSelectedType(editData.type || editData.locationType || 'Home');
      setAddress(editData.address || '');
      setFloor(editData.floor || '');
      setLandmark(editData.landmark || '');
      setName(editData.name || editData.receiverName || '');
      setMobile(
        editData.mobile || editData.receiverMobile
          ? String(editData.mobile || editData.receiverMobile)
          : '',
      );
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
    if (!isFormValid || loading) {
      return;
    }

    setLoading(true);

    const locKey = selectedType.toUpperCase();
    const locationTypeVal =
      EnumLocationTypeOfAddress[locKey] || selectedType.toLowerCase();
    const numericMobile = Number(mobile.replace(/\D/g, ''));

    const isEditMode = Boolean(editData && (editData.id || editData._id));
    const addressId = editData?.id || editData?._id;

    const payload = {
      locationType: locationTypeVal,
      address: address.trim(),
      receiverName: name.trim(),
      receiverMobile: isNaN(numericMobile) ? mobile : numericMobile,
    };

    if (floor.trim() !== '') {
      payload.floor = floor.trim();
    }

    if (landmark.trim() !== '') {
      payload.landmark = landmark.trim();
    }

    if (!isEditMode) {
      payload.isDefault = true;
    }

    console.log(
      '==================================================',
      '\n[EnterCompleteAddressScreen Dispatching Redux Saga Action]',
      `\nMode: ${isEditMode ? 'UPDATE (PUT)' : 'CREATE (POST)'}`,
      `\nEndpoint: ${
        isEditMode
          ? `PUT /customer/address/${addressId}`
          : 'POST /customer/address'
      }`,
      '\nPayload:',
      JSON.stringify(payload, null, 2),
      '\n==================================================',
    );

    const actionToDispatch = isEditMode
      ? updateCustomerAddress(
          addressId,
          payload,
          async (error, responseData) => {
            setLoading(false);
            if (
              error ||
              responseData?.status === 'Failure' ||
              responseData?.code >= 400
            ) {
              const errMsgs =
                error?.message ||
                responseData?.message ||
                'Failed to update address';
              console.log(
                '==================================================',
                '\n[EnterCompleteAddressScreen Error Callback]',
                '\nError:',
                JSON.stringify(error || responseData, null, 2),
                '\n==================================================',
              );
              Alert.alert(
                'Error',
                typeof errMsgs === 'string' ? errMsgs : JSON.stringify(errMsgs),
              );
              return;
            }

            console.log(
              '==================================================',
              '\n[EnterCompleteAddressScreen Success Callback]',
              '\nData:',
              JSON.stringify(responseData, null, 2),
              '\n==================================================',
            );

            try {
              const existing = await AsyncStorage.getItem('ADDRESSES');
              let addressList = existing ? JSON.parse(existing) : [];

              const updatedList = addressList.map(item =>
                item.id === addressId || item._id === addressId
                  ? {
                      ...item,
                      type: selectedType,
                      locationType: locationTypeVal,
                      address,
                      floor,
                      landmark,
                      name,
                      mobile,
                    }
                  : item,
              );

              await AsyncStorage.setItem(
                'ADDRESSES',
                JSON.stringify(updatedList),
              );
            } catch (storageErr) {
              console.log(
                '[EnterCompleteAddressScreen] Local Storage Error:',
                storageErr,
              );
            }

            navigation.goBack();
          },
        )
      : saveCustomerAddress(payload, async (error, responseData) => {
          setLoading(false);
          if (
            error ||
            responseData?.status === 'Failure' ||
            responseData?.code >= 400
          ) {
            const errMsgs =
              error?.message ||
              responseData?.message ||
              'Failed to save address';
            console.log(
              '==================================================',
              '\n[EnterCompleteAddressScreen Error Callback]',
              '\nError:',
              JSON.stringify(error || responseData, null, 2),
              '\n==================================================',
            );
            Alert.alert(
              'Error',
              typeof errMsgs === 'string' ? errMsgs : JSON.stringify(errMsgs),
            );
            return;
          }

          console.log(
            '==================================================',
            '\n[EnterCompleteAddressScreen Success Callback]',
            '\nData:',
            JSON.stringify(responseData, null, 2),
            '\n==================================================',
          );

          try {
            const existing = await AsyncStorage.getItem('ADDRESSES');
            let addressList = existing ? JSON.parse(existing) : [];

            const savedAddressData = responseData?.data || responseData || {};
            const newAddress = {
              id: savedAddressData?.id || savedAddressData?._id || Date.now(),
              type: selectedType,
              locationType: locationTypeVal,
              address,
              floor,
              landmark,
              name,
              mobile,
              isDefault: true,
            };

            addressList.push(newAddress);
            await AsyncStorage.setItem(
              'ADDRESSES',
              JSON.stringify(addressList),
            );
          } catch (storageErr) {
            console.log(
              '[EnterCompleteAddressScreen] Local Storage Error:',
              storageErr,
            );
          }

          navigation.goBack();
        });

    dispatch(actionToDispatch);
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
              activeOpacity={isFormValid && !loading ? 0.6 : 1}
              disabled={!isFormValid || loading}
              onPress={handleSaveAddress}
              style={{
                height: hp(50),
                borderRadius: hp(25),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.primaryColor,
                opacity: isFormValid && !loading ? 1 : 0.5,
              }}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {editData ? t('update_address') : t('save_address')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EnterCompleteAddressScreen;
