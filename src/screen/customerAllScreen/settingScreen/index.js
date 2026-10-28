import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../utils/colors';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { icons } from '../../../assets';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { deleteAccount } from '../../../actions/customerAuthActions';
import RBSheet from 'react-native-raw-bottom-sheet';
import SwitchButton from '../../../components/switchButton';
import DeviceInfo from 'react-native-device-info';

const SettingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const refRBSheet = useRef();
  const { t, i18n } = useTranslation();

  const [notification, setNotification] = useState(false);
  const [email, setEmail] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const appVersion = DeviceInfo.getVersion();

  const handleDeleteAccount = () => {
    if (isDeleting) {
      return;
    }
    setIsDeleting(true);

    dispatch(
      deleteAccount((err, res) => {
        setIsDeleting(false);
        if (err) {
          console.log('[SettingScreen] deleteAccount error:', err);
          Alert.alert(
            'Error',
            err?.message || err?.msg || 'Failed to delete account. Please try again.',
          );
          return;
        }

        setDeleteModalVisible(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'AccountTypeScreen' }],
        });
      }),
    );
  };

  const selectLanguage = lang => {
    i18n.changeLanguage(lang);
    console.log(' === var ===> ', lang);
    refRBSheet.current.close();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View
        style={{
          height: hp(50),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* Back Arrow */}
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

        {/* Title */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          {t('settings')}
        </Text>
      </View>

      <View
        style={{ width: '100%', height: hp(1), backgroundColor: '#E3E3E3' }}
      />

      <ScrollView>
        <View style={{ marginHorizontal: wp(22), marginTop: hp(26) }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
            }}>
            {t('language')}
          </Text>

          {/* <TouchableOpacity
            onPress={() => {
              navigation.navigate('SettingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(25),
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  width: hp(29),
                  height: hp(29),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.list_Icon}
                  style={{width: hp(11), height: hp(12), resizeMode: 'contain'}}
                />
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  marginLeft: wp(18),
                }}>
                {t('editProfile')}
              </Text>
            </View>

            <Image
              source={icons.bottom_Arrow_Icon}
              style={{
                width: hp(9),
                height: hp(6),
                resizeMode: 'contain',
                transform: [{rotate: '-90deg'}],
              }}
            />
          </TouchableOpacity> */}

          <TouchableOpacity
            onPress={() => refRBSheet.current.open()}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(25),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: hp(29),
                  height: hp(29),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.list_Icon}
                  style={{ width: hp(11), height: hp(12), resizeMode: 'contain' }}
                />
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  marginLeft: wp(18),
                }}>
                {t('language')}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  color: colors.black,
                  marginRight: wp(20),
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                {i18n.language === 'hi'
                  ? 'हिन्दी'
                  : i18n.language === 'gu'
                    ? 'ગુજરાતી'
                    : 'English'}
              </Text>

              <Image
                source={icons.bottom_Arrow_Icon}
                style={{
                  width: hp(9),
                  height: hp(6),
                  resizeMode: 'contain',
                  transform: [{ rotate: '-90deg' }],
                  top: -2,
                }}
              />
            </View>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(35),
            }}>
            {t('notification')}
          </Text>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(25),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: hp(29),
                  height: hp(29),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.list_Icon}
                  style={{ width: hp(11), height: hp(12), resizeMode: 'contain' }}
                />
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  marginLeft: wp(18),
                }}>
                {t('pushNotification')}
              </Text>
            </View>

            <SwitchButton
              value={notification}
              onChange={v => setNotification(v)}
            />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(25),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: hp(29),
                  height: hp(29),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.list_Icon}
                  style={{ width: hp(11), height: hp(12), resizeMode: 'contain' }}
                />
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  marginLeft: wp(18),
                }}>
                {t('emailAlerts')}
              </Text>
            </View>

            <SwitchButton value={false} disabled={true} />
          </View>

          {/* <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(35),
            }}>
            {t('privacySecurity')}
          </Text> */}

          {/* <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(25),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: hp(29),
                  height: hp(29),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.list_Icon}
                  style={{ width: hp(11), height: hp(12), resizeMode: 'contain' }}
                />
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  marginLeft: wp(18),
                }}>
                {t('clearSearchHistory')}
              </Text>
            </View>
          </TouchableOpacity> */}

          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(35),
            }}>
            {t('termsAndServices')}
          </Text>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(25),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: hp(29),
                  height: hp(29),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.list_Icon}
                  style={{ width: hp(11), height: hp(12), resizeMode: 'contain' }}
                />
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  marginLeft: wp(18),
                }}>
                {t('privacyPolicy')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(25),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: hp(29),
                  height: hp(29),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.list_Icon}
                  style={{ width: hp(11), height: hp(12), resizeMode: 'contain' }}
                />
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  marginLeft: wp(18),
                }}>
                {t('termsOfService')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate('SettingScreen');
            }}
            activeOpacity={0.6}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp(25),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: hp(29),
                  height: hp(29),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.list_Icon}
                  style={{ width: hp(11), height: hp(12), resizeMode: 'contain' }}
                />
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                  marginLeft: wp(18),
                }}>
                {t('appVersion')}
              </Text>
            </View>

            <Text
              style={{
                color: colors.primaryColor,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
              }}>
              v{appVersion}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeleteModalVisible(true)}
            activeOpacity={0.6}
            style={{
              width: '100%',
              height: hp(50),
              backgroundColor: '#FCF2F2',
              borderRadius: hp(25),
              marginTop: hp(47),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: '#D61616',
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              {t('deactivateAccount')}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: '#808080',
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
              paddingVertical: hp(22),
              alignSelf: 'center',
            }}>
            BookMyService 2026
          </Text>
        </View>
      </ScrollView>

      <RBSheet
        ref={refRBSheet}
        height={hp(180)}
        openDuration={250}
        customStyles={{
          container: {
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}>
        <TouchableOpacity
          style={{ paddingVertical: 15 }}
          onPress={() => selectLanguage('en')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('english')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: 15 }}
          onPress={() => selectLanguage('hi')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('hindi')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: 15 }}
          onPress={() => selectLanguage('gu')}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins400,
            }}>
            {t('gujarati')}
          </Text>
        </TouchableOpacity>
      </RBSheet>

      {/* Deactivate / Delete Account Confirmation Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setDeleteModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: wp(24),
          }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: wp(340),
              backgroundColor: colors.white,
              borderRadius: hp(24),
              paddingHorizontal: wp(24),
              paddingVertical: hp(28),
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: fontSize(18),
                fontFamily: fontFamily.poppins500,
                color: colors.pureBlack,
                textAlign: 'center',
                lineHeight: hp(26),
                marginBottom: hp(24),
              }}>
              {t(
                'deleteAccountConfirm',
                'Are you sure wan to\ndelete this account?',
              )}
            </Text>

            {/* Modal Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
              }}>
              {/* Not Now Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isDeleting}
                onPress={() => setDeleteModalVisible(false)}
                style={{
                  flex: 1,
                  height: hp(46),
                  borderRadius: hp(23),
                  backgroundColor: colors.primaryColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: wp(12),
                  opacity: isDeleting ? 0.7 : 1,
                }}>
                <Text
                  style={{
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins500,
                    color: colors.white,
                  }}>
                  {t('notNow', 'Not Now')}
                </Text>
              </TouchableOpacity>

              {/* Yes, Delete Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isDeleting}
                onPress={handleDeleteAccount}
                style={{
                  flex: 1,
                  height: hp(46),
                  borderRadius: hp(23),
                  borderWidth: 1,
                  borderColor: colors.primaryColor,
                  backgroundColor: colors.white,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: isDeleting ? 0.7 : 1,
                }}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.primaryColor} />
                ) : (
                  <Text
                    style={{
                      fontSize: fontSize(15),
                      fontFamily: fontFamily.poppins500,
                      color: colors.primaryColor,
                    }}>
                    {t('yesDelete', 'Yes, Delete')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
export default SettingScreen;
