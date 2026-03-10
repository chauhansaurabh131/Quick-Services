import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';

export const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerBody: {
    height: hp(55),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backArrowContainer: {
    height: '100%',
    width: wp(65),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowImage: {
    width: wp(15),
    height: hp(15),
    resizeMode: 'contain',
  },
  headerTittle: {
    color: colors.pureBlack,
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins400,
  },
  headerSubTittle: {
    color: colors.primaryColor,
    fontSize: fontSize(10),
    fontFamily: fontFamily.poppins400,
    marginRight: wp(13),
  },
  progressBarContainer: {
    width: '100%',
    height: hp(1),
    backgroundColor: '#E5E5E5',
  },
  progressBarStyle: {
    width: '60%',
    height: '100%',
    backgroundColor: colors.primaryColor,
  },
  bodyContainer: {
    marginTop: hp(41),
    alignItems: 'center',
  },
  bodyTittle: {
    color: colors.pureBlack,
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins400,
  },
  imagePickerContainer: {
    width: hp(120),
    height: hp(120),
    borderRadius: hp(100),
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: hp(33),
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageDisplay: {
    width: '100%',
    height: '100%',
    borderRadius: hp(100),
  },
  addImage: {
    width: wp(28),
    height: hp(26),
    resizeMode: 'contain',
  },
  bodyDataContainer: {
    marginTop: hp(41),
    marginHorizontal: wp(37),
  },
  tittleStyle: {
    color: colors.pureBlack,
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins600,
  },
  nameTextInputStyle: {
    width: '100%',
    height: hp(44),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: hp(14),
    paddingHorizontal: 15,
    fontSize: fontSize(14),
    color: 'black',
    fontFamily: fontFamily.poppins400,
    marginTop: hp(10),
  },
  numberTextInputContainer: {
    marginTop: hp(29),
  },
  numberTextInput: {
    flexDirection: 'row',
    alignItems: 'center', // ⭐ important
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: hp(14),
    height: hp(44),
    paddingHorizontal: wp(12),
    marginTop: hp(10),
  },
  numberTextInputCode: {
    fontSize: fontSize(16),
    color: 'black',
    fontFamily: fontFamily.poppins400,
    marginRight: wp(6),
    includeFontPadding: false,
  },
  numberTextInputStyle: {
    flex: 1,
    fontSize: fontSize(16),
    color: 'black',
    fontFamily: fontFamily.poppins400,
    paddingVertical: 0, // ⭐ important
    includeFontPadding: false, // ⭐ Android fix
  },
  emailTextInputStyle: {
    marginTop: hp(29),
    marginBottom: hp(30),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    height: hp(90),
  },
  buttonStyle: {
    width: '80%',
    height: hp(50),
    backgroundColor: colors.primaryColor,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    top: hp(10),
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins400,
  },
});
