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
import {style} from '../../customerAllScreen/basicInfoScreen/style';
import {icons} from '../../../assets';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import BorderShowLabelTextInputComponent from '../../../components/borderShowLabelTextInputComponent';

const VendorBasicInfoScreen = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
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

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled');
      } else if (response.assets) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

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
          Basic Info
        </Text>

        <Text
          style={{
            color: colors.primaryColor,
            fontSize: fontSize(10),
            fontFamily: fontFamily.poppins400,
            marginRight: wp(13),
          }}>
          Step 2 of 6
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={{width: '100%', height: hp(1), backgroundColor: '#E5E5E5'}}>
        <View
          style={{
            width: '33.2%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginTop: hp(41), alignItems: 'center'}}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
            }}>
            We use this to personalized your
          </Text>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              top: -1,
            }}>
            booking experience.
          </Text>
        </View>

        {/* IMAGE PICKER */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={openGallery}
          style={{
            width: hp(120),
            height: hp(120),
            borderRadius: hp(100),
            backgroundColor: '#F9F9F9',
            justifyContent: 'center',
            alignSelf: 'center',
            marginTop: hp(33),
            alignItems: 'center',
            overflow: 'hidden',
          }}>
          {profileImage ? (
            <Image
              source={{uri: profileImage}}
              style={{width: '100%', height: '100%', borderRadius: hp(100)}}
            />
          ) : (
            <Image
              source={icons.camera_Icon}
              style={{width: wp(28), height: hp(26), resizeMode: 'contain'}}
            />
          )}
        </TouchableOpacity>

        <BorderShowLabelTextInputComponent
          label={'Full Name'}
          value={name}
          onChangeText={setName}
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'Business Name'}
          value={businessName}
          onChangeText={setBusinessName}
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'GSTIN or Registration Number'}
          value={gstNumber}
          onChangeText={setGstNumber}
          keyboardType="number-pad"
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'Contact Number'}
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="number-pad"
          maxLength={10}
          multiline={false}
        />

        <BorderShowLabelTextInputComponent
          label={'Enter your email address'}
          value={email}
          onChangeText={setEmail}
          // optional
          multiline={false}
        />

        <View style={{height: hp(120)}} />
      </ScrollView>

      {!keyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            alignItems: 'center',
            height: hp(90),
            backgroundColor: colors.white,
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
              navigation.navigate('VendorBusinessAddressScreen');
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VendorBasicInfoScreen;
