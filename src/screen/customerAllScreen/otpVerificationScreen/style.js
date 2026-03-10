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
    width: '30%',
    height: '100%',
    backgroundColor: colors.primaryColor,
  },
  bodyTittleContainer: {
    marginTop: hp(71),
    alignItems: 'center',
  },
  bodyTitle: {
    color: colors.pureBlack,
    fontSize: fontSize(20),
    fontFamily: fontFamily.poppins500,
  },
  bodySubTittle: {
    color: '#717171',
    fontSize: fontSize(13),
    fontFamily: fontFamily.poppins400,
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 40,
    marginTop: hp(114),
  },
  textInputStyle: {
    width: wp(55),
    height: hp(50),
    borderBottomWidth: 2,
    borderBottomColor: '#D9D9D9',
    textAlign: 'center',
    color: 'black',
    fontSize: fontSize(20),
    fontFamily: fontFamily.poppins500,
  },
  textInputSubTitle: {
    borderBottomColor: 'black',
  },
  resendText: {
    color: colors.pureBlack,
    marginTop: hp(43),
    textAlign: 'center',
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins400,
  },
  buttonContainer: {
    paddingHorizontal: wp(40),
    position: 'absolute',
    bottom: 35,
    width: '100%',
  },
  buttonStyle: {
    width: '100%',
    height: hp(50),
    backgroundColor: colors.primaryColor,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(40),
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins400,
  },
});
