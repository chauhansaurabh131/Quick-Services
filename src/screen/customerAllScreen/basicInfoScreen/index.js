import React, {useEffect, useState} from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {icons} from '../../../assets';
import {launchImageLibrary} from 'react-native-image-picker';
import {style} from './style';

const BasicInfoScreen = ({navigation}) => {
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
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

  const handleMobileChange = text => {
    const formatted = text
      .replace(/\D/g, '') // only numbers
      .slice(0, 10) // max 10 digits
      .replace(/(\d{5})(\d{0,5})/, '$1 $2')
      .trim();

    setMobile(formatted);
  };

  return (
    <SafeAreaView style={style.container}>
      {/* HEADER */}
      <View style={style.headerBody}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          activeOpacity={0.6}
          style={style.backArrowContainer}>
          <Image source={icons.back_Arrow_Icon} style={style.backArrowImage} />
        </TouchableOpacity>

        <Text style={style.headerTittle}>Basic Info</Text>

        <Text style={style.headerSubTittle}>Step 3 of 4</Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={style.progressBarContainer}>
        <View style={style.progressBarStyle} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={style.bodyContainer}>
          <Text style={style.bodyTittle}>We use this to personalized your</Text>
          <Text style={[style.bodyTittle, {top: -1}]}>booking experience.</Text>
        </View>

        {/* IMAGE PICKER */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={openGallery}
          style={style.imagePickerContainer}>
          {profileImage ? (
            <Image source={{uri: profileImage}} style={style.imageDisplay} />
          ) : (
            <Image source={icons.camera_Icon} style={style.addImage} />
          )}
        </TouchableOpacity>

        <View style={style.bodyDataContainer}>
          <Text style={style.tittleStyle}>Full Name</Text>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
            placeholderTextColor="#BDBDBD"
            style={style.nameTextInputStyle}
          />

          <View style={style.numberTextInputContainer}>
            <Text style={style.tittleStyle}>Mobile Number</Text>

            <View style={style.numberTextInput}>
              <Text style={style.numberTextInputCode}>+91</Text>

              <TextInput
                value={mobile}
                onChangeText={handleMobileChange}
                placeholder="00000 00000"
                placeholderTextColor="#BDBDBD"
                keyboardType="number-pad"
                style={style.numberTextInputStyle}
              />
            </View>
          </View>

          <View style={style.emailTextInputStyle}>
            <Text style={style.tittleStyle}>Email (Optional)</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email"
              placeholderTextColor="#BDBDBD"
              style={style.nameTextInputStyle}
            />
          </View>
        </View>
      </ScrollView>

      {!keyboardVisible && (
        <View style={style.buttonContainer}>
          <TouchableOpacity activeOpacity={0.8} style={style.buttonStyle}>
            <Text style={style.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BasicInfoScreen;
