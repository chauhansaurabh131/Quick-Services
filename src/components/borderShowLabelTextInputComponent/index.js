import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../utils/helpers';
import {colors} from '../../utils/colors';
import {useTranslation} from 'react-i18next';

const BorderShowLabelTextInputComponent = ({
  label = '',
  optional = false,
  value,
  onChangeText,
  keyboardType = 'default',
  maxLength,
  multiline = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isFocused || value;
  const {t} = useTranslation();

  return (
    <View style={{marginTop: hp(16), paddingHorizontal: wp(16)}}>
      <View
        style={{
          borderWidth: 1.5,
          borderColor: isActive ? '#CDADF6' : '#D2D2D2',
          borderRadius: hp(12),
          paddingHorizontal: wp(12),
          paddingBottom: hp(10),
        }}>
        {/* Floating Label */}
        {isActive && (
          <Text
            style={{
              position: 'absolute',
              top: -hp(9),
              left: wp(10),
              backgroundColor: colors.white,
              paddingHorizontal: wp(4),
              fontSize: fontSize(10),
              fontFamily: fontFamily.poppins400,
              color: colors.pureBlack,
            }}>
            {label}
          </Text>
        )}

        {/* Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={
            !isActive ? (optional ? `${label} (${t('optional')})` : label) : ''
          }
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          returnKeyType="done"
          blurOnSubmit
          style={{
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
            color: colors.pureBlack,
            minHeight: multiline ? hp(40) : hp(20),
            top: 7,
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
};

export default BorderShowLabelTextInputComponent;
