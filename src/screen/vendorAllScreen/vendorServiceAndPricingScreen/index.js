import React, {useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Keyboard,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';

const VendorServiceAndPricingScreen = () => {
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [prices, setPrices] = useState({});
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

  // 🔥 ALL SERVICES DATA
  const servicesData = [
    // SALON
    {id: 1, category: 'Salon', title: 'Hair Cut', desc: 'Professional trim'},
    {id: 2, category: 'Salon', title: 'Hair Spa', desc: 'Deep nourishment'},
    {id: 3, category: 'Salon', title: 'Facial', desc: 'Skin glow treatment'},
    {
      id: 4,
      category: 'Salon',
      title: 'Beard Trim',
      desc: 'Clean beard styling',
    },
    {id: 5, category: 'Salon', title: 'Hair Coloring', desc: 'Color services'},

    // AC REPAIR
    {
      id: 6,
      category: 'AC Repair',
      title: 'AC Installation',
      desc: 'Install AC',
    },
    {
      id: 7,
      category: 'AC Repair',
      title: 'AC Service',
      desc: 'General service',
    },
    {id: 8, category: 'AC Repair', title: 'Gas Refilling', desc: 'Refill gas'},
    {id: 9, category: 'AC Repair', title: 'AC Repair', desc: 'Fix issues'},
    {
      id: 10,
      category: 'AC Repair',
      title: 'AC Cleaning',
      desc: 'Deep cleaning',
    },

    // CLEANING
    {id: 11, category: 'Cleaning', title: 'Home Cleaning', desc: 'Full house'},
    {
      id: 12,
      category: 'Cleaning',
      title: 'Kitchen Cleaning',
      desc: 'Deep clean',
    },
    {
      id: 13,
      category: 'Cleaning',
      title: 'Bathroom Cleaning',
      desc: 'Sanitize',
    },
    {
      id: 14,
      category: 'Cleaning',
      title: 'Sofa Cleaning',
      desc: 'Fabric clean',
    },
    {
      id: 15,
      category: 'Cleaning',
      title: 'Carpet Cleaning',
      desc: 'Dust removal',
    },
  ];

  // 🔥 FILTER LOGIC
  const filteredServices = servicesData.filter(item =>
    item.category.toLowerCase().includes(search.toLowerCase()),
  );

  // 🔥 SELECT
  const toggleService = id => {
    if (selectedServices.includes(id)) {
      setSelectedServices(prev => prev.filter(i => i !== id));
    } else {
      setSelectedServices(prev => [...prev, id]);
    }
  };

  // 🔥 PRICE
  const handlePrice = (id, value) => {
    setPrices(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const isButtonEnabled = selectedServices.length > 0;

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
          Service & Pricing
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
            width: '88%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      {/* SEARCH */}
      <View style={{marginHorizontal: wp(18), marginTop: hp(20)}}>
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
          }}>
          Select Services
        </Text>
        <Text
          style={{
            color: '#989898',
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          Pick your skills and set your rates
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: hp(16),
            height: hp(50),
            marginTop: hp(16),
            paddingHorizontal: wp(15),
            borderWidth: 1,
            borderColor: '#E1E1E1',
            marginBottom: hp(5),
          }}>
          <Image
            source={icons.search_Icon}
            style={{width: hp(15), height: hp(15), marginRight: hp(10)}}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={'gray'}
            placeholder="Search (Salon / AC / Cleaning)"
            style={{
              flex: 1,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              top: 2,
              color: colors.black,
            }}
          />
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredServices}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{padding: hp(18), paddingBottom: hp(130)}}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          const isSelected = selectedServices.includes(item.id);

          return (
            <TouchableOpacity
              onPress={() => toggleService(item.id)}
              style={{
                borderWidth: hp(1),
                borderColor: isSelected ? '#99B8FF' : '#E0E0E0',
                borderRadius: hp(16),
                padding: hp(15),
                marginBottom: hp(12),
                backgroundColor: isSelected ? '#EEF4FF' : '#F7F7F7',
              }}>
              {/* TITLE */}
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      color: colors.pureBlack,
                      fontSize: fontSize(16),
                      fontFamily: fontFamily.poppins500,
                    }}>
                    {item.title}
                  </Text>

                  <Text
                    style={{
                      color: '#AAAAAA',
                      fontSize: fontSize(12),
                      fontFamily: fontFamily.poppins500,
                    }}>
                    {item.desc}
                  </Text>
                </View>

                {/* RADIO */}
                <View
                  style={{
                    width: hp(15),
                    height: hp(15),
                    borderRadius: hp(9),
                    borderWidth: hp(1.5),
                    borderColor: isSelected ? '#2F80ED' : '#000',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {isSelected && (
                    <Image
                      source={icons.green_Check_Icon} // ✅ your tick icon
                      style={{
                        width: hp(15),
                        height: hp(15),
                        tintColor: '#1E59E2',
                        resizeMode: 'contain',
                      }}
                    />
                  )}
                </View>
              </View>

              {/* PRICE */}
              <View
                style={{
                  marginTop: hp(10),
                  backgroundColor: '#FFFFFF',
                  borderRadius: hp(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: hp(10),
                  height: hp(43),
                }}>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={'#B9B9B9'}
                  keyboardType="numeric"
                  editable={isSelected}
                  value={prices[item.id]}
                  onChangeText={val => handlePrice(item.id, val)}
                  style={{
                    flex: 1,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                    top: 2,
                    color: isSelected ? colors.black : '#B9B9B9',
                  }}
                />
                <Text
                  style={{
                    color: isSelected ? colors.black : '#B9B9B9',
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Hour Rate
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {!keyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            alignItems: 'center',
            height: hp(100),
            backgroundColor: 'white',
            borderTopWidth: hp(1),
            borderTopColor: '#DDDDDD',
          }}>
          <Text
            style={{
              color: 'black',
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins600,
              marginTop: hp(10),
            }}>
            {selectedServices.length} Service Selected
          </Text>

          <TouchableOpacity
            activeOpacity={isButtonEnabled ? 0.6 : 1}
            disabled={!isButtonEnabled} // 🔥 disable press
            style={{
              width: '93%',
              height: hp(50),
              backgroundColor: colors.primaryColor,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
              top: hp(5),
              opacity: isButtonEnabled ? 1 : 0.5,
            }}
            onPress={() => {
              if (isButtonEnabled) {
                navigation.navigate('VendorBankDetailsPayoutsScreen');
              }
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              Add Bank Details
            </Text>

            {/* Right Arrow */}
            <Image
              source={icons.back_Arrow_Icon}
              style={{
                position: 'absolute',
                right: hp(25),
                width: hp(15),
                height: hp(15),
                tintColor: colors.white,
                transform: [{rotate: '180deg'}],
              }}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VendorServiceAndPricingScreen;
