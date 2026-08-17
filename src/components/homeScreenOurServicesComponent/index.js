import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../utils/helpers';
import {icons} from '../../assets';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {customerAuth} from '../../apis';

const services = [
  {
    id: '6a7320cb3577104793b1929b',
    key: 'plumbing',
    name: 'Plumbing',
    icon: icons.plumbling_Icon,
  },
  {
    id: '6a70376b304b3286b0534645',
    key: 'cleaning',
    name: 'Cleaning',
    icon: icons.cleaning_Icon,
  },
  {
    id: '6a71cacc6f40382298df9018',
    key: 'salon',
    name: 'Salon',
    icon: icons.salon_Icon,
  },
  {
    id: '6a70376b304b3286b0534646',
    key: 'electrical',
    name: 'Electrical',
    icon: icons.electrical_Icon,
  },
  {
    id: '6a70376b304b3286b0534647',
    key: 'painting',
    name: 'Painting',
    icon: icons.painting_Icon,
  },
  {
    id: '6a70376b304b3286b0534648',
    key: 'moving',
    name: 'Moving',
    icon: icons.moving_Icon,
  },
];

const HomeScreenOurServicesComponent = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {user} = useSelector(state => state.auth || {});

  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let token = await AsyncStorage.getItem('token');
      if (typeof token === 'object' && token !== null) {
        token = token.token || token.accessToken;
      }
      if (!token || token === '[object Object]') {
        token =
          user?.token ||
          user?.accessToken ||
          user?.data?.token ||
          user?.data?.accessToken ||
          user?.tokens?.access?.token ||
          user?.tokens?.access ||
          user?.data?.tokens?.access?.token ||
          user?.data?.tokens?.access ||
          user?.user?.token ||
          user?.data?.user?.token;
      }
      if (!token) {
        token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTcwMzc2YjMwNGIzMjg2YjA1MzQ2NDUiLCJpYXQiOjE3ODY0MjkwNzYsImV4cCI6MTc4NjYwOTA3Nn0.9FBnZ2Ez6EqzBxJ62Ra8QCZjxI0kkhtxx4KPImEvNPI';
      }

      console.log('Fetching customer categories API...');
      const response = await customerAuth.getCategories(token);
      console.log(
        'Customer Categories API Response:',
        JSON.stringify(response?.data, null, 2),
      );

      const fetchedCategories =
        response?.data?.data?.categories ||
        response?.data?.categories ||
        response?.data?.data ||
        (Array.isArray(response?.data) ? response?.data : []);

      if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
        setCategoriesList(fetchedCategories);
      }
    } catch (error) {
      console.log(
        'Customer Categories API Error:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryIcon = (item, defaultIcon) => {
    if (item.icon && typeof item.icon === 'string') {
      return {uri: item.icon};
    }
    if (item.image && typeof item.image === 'string') {
      return {uri: item.image};
    }
    if (item.imageUrl && typeof item.imageUrl === 'string') {
      return {uri: item.imageUrl};
    }

    const categoryName = (
      item.name ||
      item.title ||
      item.key ||
      ''
    ).toLowerCase();
    if (categoryName.includes('plumb')) {
      return icons.plumbling_Icon;
    }
    if (categoryName.includes('clean')) {
      return icons.cleaning_Icon;
    }
    if (
      categoryName.includes('salon') ||
      categoryName.includes('beauty') ||
      categoryName.includes('barber')
    ) {
      return icons.salon_Icon;
    }
    if (categoryName.includes('electr')) {
      return icons.electrical_Icon;
    }
    if (categoryName.includes('paint')) {
      return icons.painting_Icon;
    }
    if (categoryName.includes('mov') || categoryName.includes('pack')) {
      return icons.moving_Icon;
    }

    return defaultIcon || icons.cleaning_Icon;
  };

  const dataToRender = categoriesList.length > 0 ? categoriesList : services;

  const {longitude, latitude} = useSelector(state => state.location || {});

  const handleCategoryPress = async item => {
    const rawId = item._id || item.id || item.vendorUserId;
    const isMongoId =
      typeof rawId === 'string' && /^[0-9a-fA-F]{24}$/.test(rawId);
    const categoryId = isMongoId ? rawId : '6a7320cb3577104793b1929b';
    const lon = longitude || 72.5714;
    const lat = latitude || 23.0225;

    try {
      let token = await AsyncStorage.getItem('token');
      if (typeof token === 'object' && token !== null) {
        token = token.token || token.accessToken;
      }
      if (!token || token === '[object Object]') {
        token =
          user?.token ||
          user?.accessToken ||
          user?.data?.token ||
          user?.data?.accessToken ||
          user?.tokens?.access?.token ||
          user?.tokens?.access ||
          user?.data?.tokens?.access?.token ||
          user?.data?.tokens?.access ||
          user?.user?.token ||
          user?.data?.user?.token;
      }
      if (!token) {
        token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTcwMzc2YjMwNGIzMjg2YjA1MzQ2NDUiLCJpYXQiOjE3ODY0MjkwNzYsImV4cCI6MTc4NjYwOTA3Nn0.9FBnZ2Ez6EqzBxJ62Ra8QCZjxI0kkhtxx4KPImEvNPI';
      }

      console.log(
        `[Category Clicked: ${
          item.name || item.key || 'Plumbing'
        }] Calling Vendor User Category API...`,
      );
      console.log(
        `GET https://service.mntech.website/v1/customer/vendorUser/category/${categoryId}?latitude=${lat}&longitude=${lon}`,
      );

      const response = await customerAuth.getVendorServicesByCategory(
        categoryId,
        lon,
        lat,
        token,
      );

      console.log(
        'Vendor User API Response:',
        JSON.stringify(response?.data, null, 2),
      );
    } catch (error) {
      console.log(
        'Vendor User API Error:',
        error?.response?.data || error?.message,
      );
    }

    navigation.navigate('BookingServiceScreen', {
      category: item,
      categoryId,
      longitude: lon,
      latitude: lat,
    });
  };

  const renderItem = ({item, index}) => {
    const defaultFallback = services[index % services.length]?.icon;
    const categoryIcon =
      item.icon && typeof item.icon !== 'string'
        ? item.icon
        : getCategoryIcon(item, defaultFallback);

    const categoryName =
      item.name || item.title || (item.key ? t(item.key) : 'Service');

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.serviceBox}
        onPress={() => handleCategoryPress(item)}>
        <Image source={categoryIcon} style={styles.icon} />
        <Text numberOfLines={1} style={styles.serviceText}>
          {categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{marginTop: hp(10)}}>
      <Text style={styles.title}>Our Services</Text>

      {loading && dataToRender.length === 0 ? (
        <ActivityIndicator
          size="small"
          color={colors.pureBlack}
          style={{marginVertical: hp(20)}}
        />
      ) : (
        <FlatList
          data={dataToRender}
          keyExtractor={(item, index) =>
            item._id || item.id || item.key || index.toString()
          }
          renderItem={renderItem}
          numColumns={3}
          columnWrapperStyle={{justifyContent: 'space-between'}}
          contentContainerStyle={{marginTop: hp(10)}}
        />
      )}
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
