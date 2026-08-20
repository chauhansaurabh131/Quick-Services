import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwitchButton from '../../../components/switchButton';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useTranslation} from 'react-i18next';

import {useDispatch, useSelector} from 'react-redux';
import {
  getCustomerAddresses,
  deleteCustomerAddress,
} from '../../../actions/customerAuthActions';

const normalizeAddressItem = item => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const locType = item.locationType || item.type || 'Home';
  const typeCapitalized =
    typeof locType === 'string' && locType.length > 0
      ? locType.charAt(0).toUpperCase() + locType.slice(1).toLowerCase()
      : 'Home';

  return {
    id: item._id || item.id || String(Math.random()),
    _id: item._id || item.id || String(Math.random()),
    type: typeCapitalized,
    locationType: (item.locationType || locType || 'home').toLowerCase(),
    address: item.address || '',
    floor: item.floor || '',
    landmark: item.landmark || '',
    name: item.receiverName || item.name || item.fullName || '',
    receiverName: item.receiverName || item.name || item.fullName || '',
    mobile: item.receiverMobile
      ? String(item.receiverMobile)
      : item.mobile
      ? String(item.mobile)
      : '',
    receiverMobile: item.receiverMobile || item.mobile || '',
    isDefault: Boolean(item.isDefault),
    rawItem: item,
  };
};

const ManageAddressesScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [addresses, setAddresses] = useState([]);

  const refRBSheet = useRef();
  const [selectedAddress, setSelectedAddress] = useState(null);

  const reduxAuthUser = useSelector(
    state => state.auth?.user || state.auth || {},
  );

  const handleDeleteAddress = () => {
    if (!selectedAddress) {
      return;
    }

    const targetId = selectedAddress.id || selectedAddress._id;
    refRBSheet.current?.close();

    console.log(
      '==================================================',
      '\n[ManageAddressesScreen Dispatching Redux Saga DELETE]',
      `\nTarget Address ID: ${targetId}`,
      '\n==================================================',
    );

    dispatch(
      deleteCustomerAddress(targetId, (error, responseData) => {
        if (error) {
          console.log(
            '==================================================',
            '\n[ManageAddressesScreen Delete Error]',
            '\nError:',
            JSON.stringify(error, null, 2),
            '\n==================================================',
          );
          Alert.alert('Error', error?.message || 'Failed to delete address');
          return;
        }

        console.log(
          '==================================================',
          '\n[ManageAddressesScreen Delete Success]',
          '\nResponse:',
          JSON.stringify(responseData, null, 2),
          '\n==================================================',
        );

        setAddresses(prev =>
          prev.filter(item => item.id !== targetId && item._id !== targetId),
        );
      }),
    );
  };

  useEffect(() => {
    const loadAddresses = async () => {
      // 1. First load from AsyncStorage for instant UI display
      try {
        const localData = await AsyncStorage.getItem('ADDRESSES');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAddresses(parsed.map(normalizeAddressItem).filter(Boolean));
          }
        }
      } catch (e) {
        console.log('[ManageAddressesScreen] Local load error:', e);
      }

      // 2. Extract logged in userId
      let userId =
        reduxAuthUser?.id ||
        reduxAuthUser?._id ||
        reduxAuthUser?.user?.id ||
        reduxAuthUser?.user?._id ||
        reduxAuthUser?.data?.user?.id ||
        reduxAuthUser?.data?.user?._id;

      if (!userId) {
        try {
          const storedUserStr = await AsyncStorage.getItem('userData');
          if (storedUserStr) {
            const parsedUser = JSON.parse(storedUserStr);
            userId =
              parsedUser?.id ||
              parsedUser?._id ||
              parsedUser?.user?.id ||
              parsedUser?.user?._id;
          }
        } catch (e) {
          console.log('[ManageAddressesScreen] Storage user error:', e);
        }
      }

      console.log(
        '==================================================',
        '\n[ManageAddressesScreen Fetching API Addresses]',
        `\nUser ID: ${userId || 'N/A'}`,
        '\n==================================================',
      );

      // 3. Dispatch Redux Saga getCustomerAddresses
      dispatch(
        getCustomerAddresses(userId, async (error, responseData) => {
          if (error) {
            console.log(
              '==================================================',
              '\n[ManageAddressesScreen API Error]',
              '\nError:',
              JSON.stringify(error, null, 2),
              '\n==================================================',
            );
            return;
          }

          console.log(
            '==================================================',
            '\n[ManageAddressesScreen API Success Payload]',
            '\nResponse:',
            JSON.stringify(responseData, null, 2),
            '\n==================================================',
          );

          let rawList = [];
          if (Array.isArray(responseData)) {
            rawList = responseData;
          } else if (Array.isArray(responseData?.data)) {
            rawList = responseData.data;
          } else if (Array.isArray(responseData?.data?.docs)) {
            rawList = responseData.data.docs;
          } else if (Array.isArray(responseData?.data?.addresses)) {
            rawList = responseData.data.addresses;
          } else if (Array.isArray(responseData?.docs)) {
            rawList = responseData.docs;
          } else if (Array.isArray(responseData?.addresses)) {
            rawList = responseData.addresses;
          }

          console.log(
            '[ManageAddressesScreen Extracted List Count]:',
            rawList.length,
          );

          if (Array.isArray(rawList)) {
            const normalizedList = rawList
              .map(normalizeAddressItem)
              .filter(Boolean);
            setAddresses(normalizedList);
            try {
              await AsyncStorage.setItem(
                'ADDRESSES',
                JSON.stringify(normalizedList),
              );
            } catch (storageErr) {
              console.log(
                '[ManageAddressesScreen] Storage save error:',
                storageErr,
              );
            }
          }
        }),
      );
    };

    const unsubscribe = navigation.addListener('focus', loadAddresses);
    loadAddresses();
    return unsubscribe;
  }, [navigation, dispatch]);

  console.log(' === Get addresses ===> ', addresses);

  const handleToggleDefault = async id => {
    try {
      const updated = addresses.map(item => ({
        ...item,
        isDefault: item.id === id, // 👈 only one true
      }));

      setAddresses(updated);

      await AsyncStorage.setItem('ADDRESSES', JSON.stringify(updated));
    } catch (e) {
      console.log(e);
    }
  };

  const formatMobile = number => {
    if (!number) {
      return '';
    }

    const clean = number.replace(/\D/g, ''); // remove non-numbers

    if (clean.length === 10) {
      return `${clean.slice(0, 5)} ${clean.slice(5)}`;
    }

    return clean;
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
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
          {t('manage_addresses')}
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

      <View style={{paddingHorizontal: wp(16), marginTop: hp(13)}}>
        {addresses.length === 0 && (
          <Text
            style={{textAlign: 'center', marginTop: hp(50), color: 'black'}}>
            No addresses found
          </Text>
        )}

        {addresses.map(item => (
          <View
            key={item.id}
            style={{
              width: '100%',
              borderWidth: 1,
              borderRadius: hp(12),
              borderColor: '#E4E4E4',
              padding: hp(16),
              marginBottom: hp(10),
            }}>
            {/* Name */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: fontFamily.poppins600,
                  fontSize: fontSize(15),
                  color: colors.pureBlack,
                }}>
                {item.name}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setSelectedAddress(item);
                  refRBSheet.current.open();
                }}
                style={{
                  width: hp(30),
                  height: hp(24),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.three_Dot_Icon}
                  style={{width: hp(10), height: hp(10), resizeMode: 'contain'}}
                />
              </TouchableOpacity>
            </View>

            {/* Address */}
            <Text
              style={{
                fontFamily: fontFamily.poppins400,
                fontSize: fontSize(12),
                color: '#828282',
                marginTop: hp(4),
              }}>
              {item.address}
            </Text>

            {/* Floor */}
            {item.floor ? (
              <Text
                style={{
                  fontSize: fontSize(12),
                  color: '#828282',
                }}>
                Floor: {item.floor}
              </Text>
            ) : null}

            {/* Optional Fields */}
            {item.landmark ? (
              <Text style={{fontSize: fontSize(12), color: '#828282'}}>
                Landmark: {item.landmark}
              </Text>
            ) : null}

            {/* Mobile */}
            <Text
              style={{
                fontFamily: fontFamily.poppins400,
                fontSize: fontSize(12),
                color: colors.pureBlack,
                marginTop: hp(4),
              }}>
              +91 {formatMobile(item.mobile)}
            </Text>

            {/* Type (Home, Work) */}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp(16),
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: fontFamily.poppins400,
                  fontSize: fontSize(12),
                  color: '#7D7575',
                }}>
                {item.type ? t(item.type.toLowerCase()) || item.type : 'Home'}
              </Text>

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    fontFamily: fontFamily.poppins400,
                    fontSize: fontSize(12),
                    color: '#7D7575',
                    marginRight: wp(20),
                  }}>
                  {t('default')}
                </Text>

                <SwitchButton
                  value={item.isDefault}
                  onChange={() => handleToggleDefault(item.id)}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      <RBSheet
        ref={refRBSheet}
        height={hp(180)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(20),
            borderTopRightRadius: hp(20),
            // padding: wp(16),
          },
        }}>
        <Text
          style={{
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
            marginBottom: hp(20),
            color: colors.pureBlack,
            marginTop: hp(19),
            paddingHorizontal: wp(16),
          }}>
          <Text>{t('select_option')}</Text>
        </Text>

        <View
          style={{width: '100%', height: hp(1), backgroundColor: '#DFDFDF'}}
        />

        <View style={{paddingHorizontal: wp(16)}}>
          {/* Delete */}
          <TouchableOpacity
            onPress={handleDeleteAddress}
            style={{
              flexDirection: 'row',
              marginTop: hp(27),
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={icons.delete_Icon}
                style={{
                  width: hp(16),
                  height: hp(16),
                  resizeMode: 'contain',
                  marginRight: wp(16),
                }}
              />

              <Text
                style={{
                  fontSize: fontSize(14),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('delete_address')}
              </Text>
            </View>

            <Image
              source={icons.bottom_Arrow_Icon}
              style={{
                width: hp(10),
                height: hp(12),
                resizeMode: 'contain',
                transform: [{rotate: '-90deg'}],
              }}
            />
          </TouchableOpacity>

          {/* Edit */}
          <TouchableOpacity
            onPress={() => {
              refRBSheet.current.close();

              navigation.navigate('EnterCompleteAddressScreen', {
                editData: selectedAddress,
              });
            }}
            style={{
              flexDirection: 'row',
              marginTop: hp(27),
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={icons.edit_Icon}
                style={{
                  width: hp(16),
                  height: hp(16),
                  resizeMode: 'contain',
                  marginRight: wp(16),
                }}
              />
              <Text
                style={{
                  fontSize: fontSize(14),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('modify_address')}
              </Text>
            </View>

            <Image
              source={icons.bottom_Arrow_Icon}
              style={{
                width: hp(10),
                height: hp(12),
                resizeMode: 'contain',
                transform: [{rotate: '-90deg'}],
              }}
            />
          </TouchableOpacity>
        </View>
      </RBSheet>

      <View
        style={{
          position: 'absolute',
          bottom: hp(20),
          left: wp(16),
          right: wp(16),
        }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={async () => {
            try {
              const data = await AsyncStorage.getItem('ADDRESSES');
              const list = data ? JSON.parse(data) : [];

              if (list.length >= 3) {
                Alert.alert(t('limit_reached'), t('address_limit_msg'));
                return;
              }

              navigation.navigate('EnterCompleteAddressScreen');
            } catch (e) {
              console.log(e);
            }
          }}
          style={{
            height: hp(50),
            borderRadius: hp(25),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.primaryColor, // ✅ ALWAYS SAME
          }}>
          <Text
            style={{
              color: colors.white,
              fontSize: fontSize(15),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('add_new_address')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ManageAddressesScreen;
