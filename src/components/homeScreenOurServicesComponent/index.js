import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {colors} from '../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../utils/helpers';
import {icons} from '../../assets';
import {useNavigation} from '@react-navigation/native';

const services = [
  {id: '1', name: 'Plumbing', icon: icons.plumbling_Icon},
  {id: '2', name: 'Cleaning', icon: icons.cleaning_Icon},
  {id: '3', name: 'Salon', icon: icons.salon_Icon},
  {id: '4', name: 'Electrical', icon: icons.electrical_Icon},
  {id: '5', name: 'Painting', icon: icons.painting_Icon},
  {id: '6', name: 'Moving', icon: icons.moving_Icon},
];

const HomeScreenOurServicesComponent = () => {
  const navigation = useNavigation();

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.serviceBox}
        onPress={() => {
          navigation.navigate('BookingServiceScreen');
        }}>
        <Image source={item.icon} style={styles.icon} />
        <Text style={styles.serviceText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{marginTop: hp(10)}}>
      <Text style={styles.title}>Our Services</Text>

      <FlatList
        data={services}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        contentContainerStyle={{marginTop: hp(10)}}
      />
    </SafeAreaView>
  );
};

export default HomeScreenOurServicesComponent;

const styles = StyleSheet.create({
  title: {
    color: colors.pureBlack,
    fontSize: fontSize(15),
    fontFamily: fontFamily.poppins600,
    marginBottom: hp(13),
  },

  serviceBox: {
    width: wp(104),
    height: hp(103),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: hp(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(12),
  },

  icon: {
    width: hp(28),
    height: hp(28),
    marginBottom: hp(6),
    resizeMode: 'contain',
  },

  serviceText: {
    fontSize: fontSize(10),
    fontFamily: fontFamily.poppins400,
    color: colors.pureBlack,
    top: 5,
  },
});
