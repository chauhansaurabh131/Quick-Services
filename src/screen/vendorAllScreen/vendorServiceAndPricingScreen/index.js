import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../utils/colors';
import { fontFamily, fontSize, hp, wp } from '../../../utils/helpers';
import { icons } from '../../../assets';
import { useNavigation } from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {
  getCategoryById,
  getServicesByCategory,
  getVendorCategories,
  saveVendorServices,
} from '../../../actions/customerAuthActions';

const VendorServiceAndPricingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { loading, user } = useSelector(state => state.auth || {});
  const reduxUser = user?.user || user?.data?.user || user || {};

  // console.log('====>user', user?.vendorUser?.id)

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [selectedServices, setSelectedServices] = useState([]);
  const [prices, setPrices] = useState({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const bottomSheetRef = useRef(null);

  const userCategoryId =
    user?.user?.categoryId ||
    user?.vendorUser?.categoryId ||
    user?.data?.user?.categoryId ||
    user?.data?.vendorUser?.categoryId ||
    user?.categoryId ||
    reduxUser?.categoryId ||
    reduxUser?.vendorUser?.categoryId ||
    null;

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

  useEffect(() => {
    if (userCategoryId) {
      console.log('Fetching category by ID on screen mount:', userCategoryId);
      setCategoriesLoading(true);
      dispatch(
        getCategoryById(userCategoryId, (error, response) => {
          setCategoriesLoading(false);
          if (error) {
            console.log('Error fetching category by ID:', error);
          } else {
            console.log('Get Category By ID Response:', response);
            const categoryObj =
              response?.data || response?.category || response;
            const categoryName =
              categoryObj?.name || categoryObj?.title || categoryObj?.categoryName || '';
            if (categoryName) {
              setSearch(categoryName);
              setSelectedCategory(categoryObj);
            }
          }
        }),
      );

      setServicesLoading(true);
      setServicesList([]);
      dispatch(
        getServicesByCategory(userCategoryId, (error, response) => {
          setServicesLoading(false);
          if (error) {
            console.log('Error fetching services by category:', error);
            setServicesList([]);
          } else {
            console.log('Services by Category API Response:', response);
            const list =
              response?.data || response?.services || response || [];
            setServicesList(Array.isArray(list) ? list : []);
          }
        }),
      );
    }
  }, [userCategoryId]);

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.open();
    setCategoriesLoading(true);
    dispatch(
      getVendorCategories((error, response) => {
        setCategoriesLoading(false);
        if (error) {
          console.log('Error fetching vendor categories:', error);
        } else {
          console.log('Vendor Categories API Response:', response);
          const list =
            response?.data || response?.categories || response || [];
          setCategoriesList(Array.isArray(list) ? list : []);
        }
      }),
    );
  };

  const handleSelectCategory = item => {
    const categoryName =
      typeof item === 'string'
        ? item
        : item.name || item.title || item.categoryName || '';
    const catId = typeof item === 'string' ? null : item._id || item.id;

    setSearch(categoryName);
    setSelectedCategory(item);
    bottomSheetRef.current?.close();

    if (catId) {
      setServicesLoading(true);
      setServicesList([]);
      dispatch(
        getServicesByCategory(catId, (error, response) => {
          setServicesLoading(false);
          if (error) {
            console.log('Error fetching services by category:', error);
            setServicesList([]);
          } else {
            console.log('Services by Category API Response:', response);
            const list =
              response?.data || response?.services || response || [];
            setServicesList(Array.isArray(list) ? list : []);
          }
        }),
      );
    }
  };

  const toggleService = id => {
    if (selectedServices.includes(id)) {
      setSelectedServices(prev => prev.filter(i => i !== id));
    } else {
      setSelectedServices(prev => [...prev, id]);
    }
  };

  const handlePrice = (id, value) => {
    setPrices(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveVendorServices = () => {
    if (selectedServices.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one service');
      return;
    }

    const vendorId =
      user?.vendorUser?.id ||
      user?.vendorUser?._id ||
      reduxUser?.vendorUser?.id ||
      reduxUser?.vendorUser?._id ||
      reduxUser._id ||
      reduxUser.id ||
      reduxUser.vendorId ||
      reduxUser.vendor_id ||
      user?.user?._id ||
      user?.user?.id ||
      user?.data?.user?._id ||
      user?.data?.user?.id ||
      user?.data?._id ||
      user?.data?.id ||
      user?._id ||
      user?.id ||
      '';

    const isSalonCategory = Boolean(
      search &&
      (search.trim().toLowerCase().includes('salon') ||
        search.trim().toLowerCase().includes('saloon')),
    );

    if (isSalonCategory) {
      for (const id of selectedServices) {
        const enteredVal = prices[id] ? prices[id].toString().trim() : '';
        if (!enteredVal || isNaN(Number(enteredVal)) || Number(enteredVal) <= 0) {
          const serviceObj = servicesList.find(
            item => (item._id || item.id) === id,
          );
          const serviceTitle =
            serviceObj?.title || serviceObj?.name || serviceObj?.serviceName || 'selected service';
          Alert.alert(
            'Price Required',
            `Please enter a price for "${serviceTitle}"`,
          );
          return;
        }
      }
    }

    const servicesPayload = selectedServices.map(id => {
      const parsedPrice = prices[id] ? Number(prices[id]) || 0 : 0;
      return {
        serviceId: id,
        pricingType: isSalonCategory ? 'fixed' : 'visiting',
        price: parsedPrice,
      };
    });

    const payload = {
      vendorId: vendorId,
      services: servicesPayload,
    };

    console.log(
      'Sending Vendor Services Payload:',
      JSON.stringify(payload, null, 2),
    );

    dispatch(
      saveVendorServices(payload, (error, response) => {
        if (error) {
          console.log('Save Vendor Services Error Response:', error);
          Alert.alert(
            'Save Failed',
            error?.message ||
            error?.msg ||
            'Something went wrong while saving services',
          );
        } else {
          console.log('Save Vendor Services Success Response:', response);
          navigation.navigate('VendorWatchAndConfirmVerificationScreen');
        }
      }),
    );
  };

  const isButtonEnabled = selectedServices.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
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
            style={{ width: wp(15), height: hp(15), resizeMode: 'contain' }}
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
      <View style={{ width: '100%', height: hp(1), backgroundColor: '#E5E5E5' }}>
        <View
          style={{
            width: '88%',
            height: '100%',
            backgroundColor: colors.primaryColor,
          }}
        />
      </View>

      {/* SEARCH / CATEGORY SELECTOR */}
      <View style={{ marginHorizontal: wp(18), marginTop: hp(20) }}>
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

        <TouchableOpacity
          activeOpacity={userCategoryId ? 1 : 0.7}
          disabled={Boolean(userCategoryId)}
          onPress={handleOpenBottomSheet}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: userCategoryId ? '#F5F5F5' : '#FFFFFF',
            borderRadius: hp(16),
            height: hp(52),
            marginTop: hp(16),
            paddingHorizontal: wp(16),
            borderWidth: 1,
            borderColor: userCategoryId ? '#E0E0E0' : '#E2E2E2',
            marginBottom: hp(5),
          }}>
          {categoriesLoading && !search ? (
            <ActivityIndicator size="small" color={colors.primaryColor} style={{ marginRight: hp(10) }} />
          ) : null}

          <Text
            style={{
              flex: 1,
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins500,
              color: userCategoryId
                ? '#666666'
                : search
                ? colors.pureBlack
                : '#999999',
            }}>
            {search || (categoriesLoading ? 'Loading category...' : 'Select Service Category')}
          </Text>

          <Image
            source={icons.bottom_Arrow_Icon}
            style={{
              width: hp(12),
              height: hp(12),
              resizeMode: 'contain',
              tintColor: userCategoryId ? '#C0C0C0' : '#B0B0B0',
            }}
          />
        </TouchableOpacity>
      </View>

      {/* SERVICES CONTENT AREA */}
      {servicesLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primaryColor} size="large" />
          <Text
            style={{
              color: 'gray',
              fontSize: fontSize(12),
              fontFamily: fontFamily.poppins400,
              marginTop: hp(10),
            }}>
            Loading services...
          </Text>
        </View>
      ) : servicesList.length > 0 ? (
        <FlatList
          data={servicesList}
          keyExtractor={(item, idx) => (item._id || item.id || idx).toString()}
          contentContainerStyle={{
            paddingHorizontal: wp(18),
            paddingTop: hp(18),
            paddingBottom: hp(130),
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins600,
                marginBottom: hp(15),
              }}>
              Select Offered Services
            </Text>
          }
          renderItem={({ item }) => {
            const itemId = item._id || item.id;
            const isSelected = selectedServices.includes(itemId);
            const title = item.title || item.name || item.serviceName || '';
            const desc = item.desc || item.description || '';

            const isSalonCategory = Boolean(
              search &&
              (search.trim().toLowerCase().includes('salon') ||
                search.trim().toLowerCase().includes('saloon')),
            );

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleService(itemId)}
                style={{
                  borderWidth: hp(1),
                  borderColor: isSelected ? '#99B8FF' : '#E0E0E0',
                  borderRadius: hp(16),
                  padding: hp(15),
                  marginBottom: hp(12),
                  backgroundColor: isSelected ? '#EEF4FF' : '#F7F7F7',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{ flex: 1, paddingRight: wp(10) }}>
                    <Text
                      style={{
                        color: colors.pureBlack,
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins500,
                      }}>
                      {title}
                    </Text>

                    {desc ? (
                      <Text
                        style={{
                          color: '#AAAAAA',
                          fontSize: fontSize(12),
                          fontFamily: fontFamily.poppins400,
                          marginTop: hp(2),
                        }}>
                        {desc}
                      </Text>
                    ) : null}
                  </View>

                  <Image
                    source={icons.green_Check_Icon}
                    resizeMode="contain"
                    style={{
                      width: hp(17),
                      height: hp(17),
                      tintColor: isSelected ? '#1E59E2' : '#D3D3D3',
                    }}
                  />
                </View>

                {isSelected && isSalonCategory && (
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
                      value={prices[itemId] || ''}
                      onChangeText={val => handlePrice(itemId, val)}
                      style={{
                        flex: 1,
                        fontSize: fontSize(14),
                        fontFamily: fontFamily.poppins400,
                        top: 2,
                        color: colors.black,
                      }}
                    />
                    <Text
                      style={{
                        color: 'grey',
                        fontSize: fontSize(14),
                        fontFamily: fontFamily.poppins400,
                      }}>
                      Fixed Rate
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              color: 'gray',
              fontSize: fontSize(14),
              fontFamily: fontFamily.poppins400,
              textAlign: 'center',
              marginHorizontal: wp(30),
            }}>
            {search
              ? `No services found for "${search}"`
              : 'Tap "Select Service" to pick a category'}
          </Text>
        </View>
      )}

      {/* BOTTOM BUTTON */}
      {!keyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            alignItems: 'center',
            height: hp(100),
            backgroundColor: colors.white
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
            activeOpacity={isButtonEnabled && !loading ? 0.6 : 1}
            disabled={!isButtonEnabled || loading}
            style={{
              width: '93%',
              height: hp(50),
              backgroundColor: colors.primaryColor,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
              top: hp(5),
              opacity: isButtonEnabled && !loading ? 1 : 0.5,
            }}
            onPress={handleSaveVendorServices}>
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                }}>
                Add Bank Details
              </Text>
            )}

            {!loading && (
              <Image
                source={icons.back_Arrow_Icon}
                style={{
                  position: 'absolute',
                  right: hp(25),
                  width: hp(15),
                  height: hp(15),
                  tintColor: colors.white,
                  transform: [{ rotate: '180deg' }],
                }}
              />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* BOTTOM SHEET FOR CATEGORIES */}
      <RBSheet
        ref={bottomSheetRef}
        height={hp(420)}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(25),
            borderTopRightRadius: hp(25),
            paddingBottom: hp(20),
          },
          draggableIcon: {
            backgroundColor: '#D9D9D9',
            width: wp(45),
          },
        }}>
        <View style={{ paddingHorizontal: wp(20), flex: 1 }}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(18),
              fontFamily: fontFamily.poppins600,
              marginBottom: hp(15),
            }}>
            Select Service
          </Text>

          {categoriesLoading ? (
            <ActivityIndicator
              color={colors.primaryColor}
              size="large"
              style={{ marginTop: hp(40) }}
            />
          ) : categoriesList.length === 0 ? (
            <Text
              style={{
                color: 'gray',
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
                textAlign: 'center',
                marginTop: hp(40),
              }}>
              No categories found
            </Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {categoriesList.map((item, index) => {
                const categoryName =
                  typeof item === 'string'
                    ? item
                    : item.name || item.title || item.categoryName || '';
                const categoryId =
                  typeof item === 'string'
                    ? item
                    : item._id || item.id || index;
                const isSelected = Boolean(
                  (search &&
                    categoryName &&
                    search.trim().toLowerCase() ===
                    categoryName.trim().toLowerCase()) ||
                  (selectedCategory &&
                    item &&
                    ((item._id && selectedCategory._id === item._id) ||
                      (item.id && selectedCategory.id === item.id))),
                );

                return (
                  <TouchableOpacity
                    key={categoryId.toString()}
                    activeOpacity={0.6}
                    onPress={() => handleSelectCategory(item)}
                    style={{
                      height: hp(48),
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottomWidth:
                        index !== categoriesList.length - 1 ? hp(1) : 0,
                      borderBottomColor: '#EEEEEE',
                    }}>
                    <Text
                      style={{
                        color: isSelected
                          ? colors.primaryColor
                          : colors.pureBlack,
                        fontSize: fontSize(14),
                        fontFamily: isSelected
                          ? fontFamily.poppins600
                          : fontFamily.poppins400,
                      }}>
                      {categoryName}
                    </Text>

                    <View
                      style={{
                        width: hp(20),
                        height: hp(20),
                        borderRadius: hp(10),
                        borderWidth: hp(1.5),
                        borderColor: isSelected
                          ? colors.primaryColor
                          : '#C7C7C7',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {isSelected && (
                        <View
                          style={{
                            width: hp(10),
                            height: hp(10),
                            borderRadius: hp(5),
                            backgroundColor: colors.primaryColor,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default VendorServiceAndPricingScreen;
