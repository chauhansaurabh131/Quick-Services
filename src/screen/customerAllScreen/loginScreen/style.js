import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';

export const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageTopContainer: {
    height: '50%',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  bodyContainer: {
    flex: 1,
    marginTop: hp(37),
  },
  bodySecondContainer: {
    marginHorizontal: wp(25),
  },
  bodyTittle: {
    color: colors.pureBlack,
    fontSize: fontSize(28),
    fontFamily: fontFamily.poppins600,
  },
  bodySubTittle: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins500,
    color: colors.pureBlack,
    marginTop: hp(10),
  },
  textInputBody: {
    width: '100%',
    height: hp(50),
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: wp(40),
    backgroundColor: 'white',
    flexDirection: 'row',
    marginTop: hp(41),
  },
  textInputCountry: {
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
    width: '20%',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    left: 0.5,
    justifyContent: 'space-around',
    paddingHorizontal: wp(3),
  },
  textInputNumber: {
    color: 'black',
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins400,
  },
  textInputImage: {
    width: wp(9),
    height: hp(6),
    resizeMode: 'contain',
  },
  textInputVerticalLine: {
    height: '100%',
    width: wp(1),
    backgroundColor: '#DDDDDD',
  },
  textInputStyle: {
    flex: 1,
    fontSize: fontSize(14),
    color: colors.pureBlack,
    paddingHorizontal: wp(17),
  },
  buttonPosition: {
    position: 'absolute',
    width: '100%',
    bottom: 35,
  },
  buttonBody: {
    marginHorizontal: wp(25),
  },
  buttonBodyStyle: {
    width: '100%',
    height: hp(50),
    backgroundColor: colors.primaryColor,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextStyle: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins400,
  },
});
