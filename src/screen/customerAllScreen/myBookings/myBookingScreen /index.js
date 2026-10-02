import React, {useState, useCallback} from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../../utils/helpers';
import {icons} from '../../../../assets';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {getCustomerBookings} from '../../../../actions/customerAuthActions';
import ActiveBookings from '../activeBookings';
import CompleteBookings from '../completeBookings';
import CancelBookings from '../cancelBookings';
import {useTranslation} from 'react-i18next';

const MyBookingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('active');
  const [pagesMap, setPagesMap] = useState({
    accepted: 1,
    completed: 1,
    cancelled: 1,
  });
  const [totalPagesMap, setTotalPagesMap] = useState({
    accepted: 1,
    completed: 1,
    cancelled: 1,
  });
  const [fetchingMap, setFetchingMap] = useState({
    accepted: false,
    completed: false,
    cancelled: false,
  });
  const [loadingMoreMap, setLoadingMoreMap] = useState({
    accepted: false,
    completed: false,
    cancelled: false,
  });

  const {t} = useTranslation();

  const {customerBookings} = useSelector(state => state.auth || {});

  const statusMap = {
    active: 'accepted',
    completed: 'completed',
    cancelled: 'cancelled',
  };

  const currentStatus = statusMap[selectedTab] || 'accepted';

  const fetchBookingsForTab = useCallback(
    (statusToFetch = currentStatus, targetPage = 1) => {
      const isFirstPage = targetPage === 1;
      if (isFirstPage) {
        setFetchingMap(prev => ({...prev, [statusToFetch]: true}));
      } else {
        setLoadingMoreMap(prev => ({...prev, [statusToFetch]: true}));
      }

      dispatch(
        getCustomerBookings(statusToFetch, targetPage, 10, (err, res) => {
          if (isFirstPage) {
            setFetchingMap(prev => ({...prev, [statusToFetch]: false}));
            setPagesMap(prev => ({...prev, [statusToFetch]: 1}));
          } else {
            setLoadingMoreMap(prev => ({...prev, [statusToFetch]: false}));
            setPagesMap(prev => ({...prev, [statusToFetch]: targetPage}));
          }

          if (!err && res) {
            const dataObj = res?.data || res;
            const calculatedPages =
              dataObj?.totalPages ||
              res?.totalPages ||
              Math.ceil(
                (dataObj?.totalResults ||
                  dataObj?.totalDocs ||
                  dataObj?.total ||
                  res?.totalResults ||
                  res?.totalDocs ||
                  res?.total ||
                  0) / 10,
              ) ||
              1;

            setTotalPagesMap(prev => ({
              ...prev,
              [statusToFetch]: calculatedPages > 0 ? calculatedPages : 1,
            }));
          }
        }),
      );
    },
    [dispatch, currentStatus],
  );

  useFocusEffect(
    useCallback(() => {
      fetchBookingsForTab(currentStatus, 1);
    }, [fetchBookingsForTab, currentStatus]),
  );

  const handleTabChange = tab => {
    setSelectedTab(tab);
    const newStatus = statusMap[tab] || 'accepted';
    fetchBookingsForTab(newStatus, 1);
  };

  const handleLoadMore = status => {
    const currentPage = pagesMap[status] || 1;
    const totalPages = totalPagesMap[status] || 1;
    const isFetching = fetchingMap[status];
    const isLoadingMore = loadingMoreMap[status];

    if (isFetching || isLoadingMore || currentPage >= totalPages) {
      return;
    }

    const nextPage = currentPage + 1;
    fetchBookingsForTab(status, nextPage);
  };

  const rawActive =
    customerBookings?.accepted || customerBookings?.panding || [];
  const activeBookingsList = Array.isArray(rawActive)
    ? rawActive
    : Array.isArray(rawActive?.results)
    ? rawActive.results
    : Array.isArray(rawActive?.docs)
    ? rawActive.docs
    : Array.isArray(rawActive?.data)
    ? rawActive.data
    : [];

  const rawCompleted = customerBookings?.completed || [];
  const completedBookingsList = Array.isArray(rawCompleted)
    ? rawCompleted
    : Array.isArray(rawCompleted?.results)
    ? rawCompleted.results
    : Array.isArray(rawCompleted?.docs)
    ? rawCompleted.docs
    : Array.isArray(rawCompleted?.data)
    ? rawCompleted.data
    : [];

  const rawCancelled = customerBookings?.cancelled || [];
  const cancelledBookingsList = Array.isArray(rawCancelled)
    ? rawCancelled
    : Array.isArray(rawCancelled?.results)
    ? rawCancelled.results
    : Array.isArray(rawCancelled?.docs)
    ? rawCancelled.docs
    : Array.isArray(rawCancelled?.data)
    ? rawCancelled.data
    : [];

  const TabButton = ({title, value}) => {
    const isActive = selectedTab === value;

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => handleTabChange(value)}
        style={{
          flex: 1,
          height: hp(40),
          backgroundColor: isActive ? '#731EE2' : 'transparent',
          borderRadius: hp(20),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: isActive ? colors.white : '#731EE2',
            fontSize: fontSize(12),
            fontFamily: fontFamily.poppins500,
          }}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* Header */}
      <View
        style={{
          height: hp(50),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: 0,
            width: wp(50),
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={icons.back_Arrow_Icon}
            style={{
              width: hp(14),
              height: hp(14),
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          {t('my_bookings') || 'My Bookings'}
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#E3E3E3'}}
      />

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#F8F4FF',
          marginHorizontal: wp(18),
          borderRadius: hp(25),
          marginTop: hp(19),
          marginBottom: hp(20),
        }}>
        <TabButton title={t('active')} value="active" />
        <TabButton title={t('completed')} value="completed" />
        <TabButton title={t('cancelled')} value="cancelled" />
      </View>

      {/* Tab Content */}
      <View style={{flex: 1}}>
        {selectedTab === 'active' && (
          <ActiveBookings
            bookingsList={activeBookingsList}
            fetching={fetchingMap.accepted}
            loadingMore={loadingMoreMap.accepted}
            onRefresh={() => fetchBookingsForTab('accepted', 1)}
            onLoadMore={() => handleLoadMore('accepted')}
          />
        )}
        {selectedTab === 'completed' && (
          <CompleteBookings
            bookingsList={completedBookingsList}
            fetching={fetchingMap.completed}
            loadingMore={loadingMoreMap.completed}
            onRefresh={() => fetchBookingsForTab('completed', 1)}
            onLoadMore={() => handleLoadMore('completed')}
          />
        )}
        {selectedTab === 'cancelled' && (
          <CancelBookings
            bookingsList={cancelledBookingsList}
            fetching={fetchingMap.cancelled}
            loadingMore={loadingMoreMap.cancelled}
            onRefresh={() => fetchBookingsForTab('cancelled', 1)}
            onLoadMore={() => handleLoadMore('cancelled')}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MyBookingScreen;
