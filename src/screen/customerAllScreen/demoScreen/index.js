import React, {useState} from 'react';
import {SafeAreaView, View, TextInput, StyleSheet, Image} from 'react-native';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';

const DemoScreen = () => {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Image
          source={icons.search_Icon} // add search icon in assets
          style={styles.searchIcon}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for Services (Cleaning)"
          placeholderTextColor="#9E9E9E"
          style={styles.searchInput}
        />
      </View>
    </SafeAreaView>
  );
};

export default DemoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(20),
    justifyContent: 'center',
    backgroundColor: 'white',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(46),
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    paddingHorizontal: wp(14),
    backgroundColor: '#F9FAFB',
  },

  searchIcon: {
    width: hp(13),
    height: hp(13),
    tintColor: '#9E9E9E',
    marginRight: wp(8),
    resizeMode: 'contain',
  },

  searchInput: {
    flex: 1,
    fontSize: fontSize(14),
    fontFamily: fontFamily.poppins400,
    color: '#000',
    paddingVertical: 0,
  },
});
