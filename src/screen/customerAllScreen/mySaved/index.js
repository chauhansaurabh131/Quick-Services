import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {
  getFavoriteVendors,
  deleteFavoriteVendor,
  toggleFavoriteVendor,
} from '../../../actions/customerAuthActions';

const MySaved = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {loading: sagaLoading, favoriteVendors: reduxFavoriteVendors} =
    useSelector(state => state.auth || {});

  const [refreshing, setRefreshing] = useState(false);
  const [localList, setLocalList] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchSavedVendors = useCallback(() => {
    dispatch(
      getFavoriteVendors((err, res) => {
        setRefreshing(false);
        setIsInitialLoading(false);
        if (err) {
          console.log('[MySaved Screen] Error fetching favorite vendors:', err);
        } else {
          console.log(
            '[MySaved Screen] Fetched favorite vendors response:',
            res,
          );
        }
      }),
    );
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchSavedVendors();
    }, [fetchSavedVendors]),
  );

  useEffect(() => {
    let rawList = [];
    if (Array.isArray(reduxFavoriteVendors)) {
      rawList = reduxFavoriteVendors;
    } else if (Array.isArray(reduxFavoriteVendors?.docs)) {
      rawList = reduxFavoriteVendors.docs;
    } else if (Array.isArray(reduxFavoriteVendors?.data)) {
      rawList = reduxFavoriteVendors.data;
    } else if (Array.isArray(reduxFavoriteVendors?.data?.docs)) {
      rawList = reduxFavoriteVendors.data.docs;
    } else if (Array.isArray(reduxFavoriteVendors?.favorites)) {
      rawList = reduxFavoriteVendors.favorites;
    }

    const favoritedList = rawList.filter(item => {
      if (!item) {
        return false;
      }
      const isFav =
        item.isFavorite ??
        item.isLiked ??
        item.vendorUser?.isFavorite ??
        item.vendorUser?.isLiked;
      return isFav !== false;
    });

    setLocalList(favoritedList);
  }, [reduxFavoriteVendors]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSavedVendors();
  };

  const handleRemoveFavorite = (vendorId, vendorItem) => {
    const targetId =
      vendorId ||
      vendorItem?.vendorId ||
      vendorItem?.vendorUser?._id ||
      vendorItem?.vendorUser?.id ||
      vendorItem?._id ||
      vendorItem?.id;

    if (!targetId) {
      console.log('[MySaved] Cannot find target vendor ID to remove');
      return;
    }

    const isCurrentlyLiked =
      vendorItem?.isFavorite ??
      vendorItem?.isLiked ??
      vendorItem?.vendorUser?.isFavorite ??
      vendorItem?.vendorUser?.isLiked ??
      true;

    if (isCurrentlyLiked) {
      setLocalList(prev =>
        prev.filter(item => {
          const itemId =
            item?.vendorId ||
            item?.vendorUser?._id ||
            item?.vendorUser?.id ||
            item?._id ||
            item?.id;
          return String(itemId) !== String(targetId);
        }),
      );

      Toast.show({
        type: 'success',
        text1: 'Vendor Removed',
        text2: 'Vendor removed from your saved list.',
        position: 'top',
      });

      dispatch(
        deleteFavoriteVendor(targetId, (err, res) => {
          if (err) {
            console.log(
              '[MySaved] Error calling deleteFavoriteVendor API:',
              err,
            );
            fetchSavedVendors();
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to remove vendor from saved list.',
              position: 'top',
            });
          } else {
            console.log(
              '[MySaved] deleteFavoriteVendor API success response:',
              res,
            );
          }
        }),
      );
    } else {
      Toast.show({
        type: 'success',
        text1: 'Vendor Saved',
        text2: 'Vendor saved to your shortlist.',
        position: 'top',
      });

      dispatch(
        toggleFavoriteVendor({vendorId: targetId}, (err, res) => {
          if (err) {
            console.log(
              '[MySaved] Error calling toggleFavoriteVendor API:',
              err,
            );
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to save vendor to shortlist.',
              position: 'top',
            });
          } else {
            console.log(
              '[MySaved] toggleFavoriteVendor API success response:',
              res,
            );
            fetchSavedVendors();
          }
        }),
      );
    }
  };

  const handleVendorPress = item => {
    const vendorUserObj =
      item?.vendorUser || item?.vendorId || item?.vendor || item;
    const vendorUserId =
      item?.vendorId ||
      vendorUserObj?._id ||
      vendorUserObj?.id ||
      item?.userId ||
      item?._id ||
      item?.id;

    navigation.navigate('PreBookingServiceScreen', {
      vendorUserId,
      item: vendorUserObj,
      vendor: vendorUserObj,
    });
  };

  const renderVendorItem = ({item}) => {
    const vendorUserObj =
      item?.vendorUser || item?.vendorId || item?.vendor || item;
    const userObj =
      (typeof vendorUserObj?.userId === 'object' && vendorUserObj?.userId) ||
      item?.userId ||
      {};

    const vendorId =
      item?.vendorId ||
      vendorUserObj?._id ||
      vendorUserObj?.id ||
      item?._id ||
      item?.id;

    const businessName =
      item?.businessName ||
      vendorUserObj?.businessName ||
      vendorUserObj?.name ||
      userObj?.fullName ||
      userObj?.name ||
      item?.name ||
      'Star Unisex Saloon';

    const rawRating =
      item?.averageRating ??
      item?.rating ??
      vendorUserObj?.averageRating ??
      vendorUserObj?.rating ??
      userObj?.averageRating ??
      userObj?.rating ??
      0;
    const ratingVal =
      Number(rawRating) > 0 ? Number(rawRating).toFixed(1) : '4.6';

    const rawPrice =
      item?.price ||
      item?.charge ||
      item?.visitCharge ||
      vendorUserObj?.charge ||
      vendorUserObj?.visitCharge ||
      500;

    const startingPrice =
      typeof rawPrice === 'number'
        ? `Rs. ${rawPrice}`
        : String(rawPrice).startsWith('Rs.')
        ? String(rawPrice)
        : String(rawPrice).startsWith('₹')
        ? `Rs. ${String(rawPrice).replace('₹', '').trim()}`
        : `Rs. ${rawPrice}`;

    const rawDistance =
      item?.distance ??
      item?.dist ??
      vendorUserObj?.distance ??
      vendorUserObj?.dist;
    const distanceText =
      rawDistance !== null &&
      rawDistance !== undefined &&
      !isNaN(Number(rawDistance))
        ? `${Number(rawDistance).toFixed(1)}km Away`
        : '1.2km Away';

    const imageUri =
      (typeof item?.profilePic === 'string' &&
        item.profilePic.trim() !== '' &&
        item.profilePic) ||
      (typeof item?.profileImage === 'string' &&
        item.profileImage.trim() !== '' &&
        item.profileImage) ||
      (typeof item?.vendorProfilePic === 'string' &&
        item.vendorProfilePic.trim() !== '' &&
        item.vendorProfilePic) ||
      (typeof userObj?.profilePic === 'string' &&
        userObj.profilePic.trim() !== '' &&
        userObj.profilePic) ||
      (typeof userObj?.profileImage === 'string' &&
        userObj.profileImage.trim() !== '' &&
        userObj.profileImage) ||
      (typeof vendorUserObj?.profilePic === 'string' &&
        vendorUserObj.profilePic.trim() !== '' &&
        vendorUserObj.profilePic) ||
      item?.image ||
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f';

    const isLiked =
      item?.isFavorite ??
      item?.isLiked ??
      vendorUserObj?.isFavorite ??
      vendorUserObj?.isLiked ??
      true;

    const availabilityObj =
      (Array.isArray(item?.vendorAvailability) &&
        item?.vendorAvailability[0]) ||
      (typeof item?.vendorAvailability === 'object' &&
      item?.vendorAvailability !== null
        ? item.vendorAvailability
        : null) ||
      (Array.isArray(vendorUserObj?.vendorAvailability) &&
        vendorUserObj?.vendorAvailability[0]) ||
      (typeof vendorUserObj?.vendorAvailability === 'object' &&
      vendorUserObj?.vendorAvailability !== null
        ? vendorUserObj.vendorAvailability
        : {}) ||
      {};

    const bookingOption = (
      availabilityObj?.bookingOption ||
      availabilityObj?.booking_option ||
      item?.bookingOption ||
      vendorUserObj?.bookingOption ||
      ''
    ).toLowerCase();

    const categoryName = (
      item?.categoryTitle ||
      vendorUserObj?.categoryId?.title ||
      vendorUserObj?.categoryId?.name ||
      item?.categoryName ||
      ''
    ).toLowerCase();

    const isInstant =
      bookingOption === 'instant' ||
      bookingOption.includes('instant') ||
      (!bookingOption &&
        (categoryName.includes('salon') || categoryName.includes('saloon')));

    const isAvailable =
      availabilityObj?.isAvailable !== undefined
        ? Boolean(availabilityObj.isAvailable)
        : item?.isAvailable !== undefined
        ? Boolean(item.isAvailable)
        : Boolean(
            availabilityObj?.isOnline !== false &&
              availabilityObj?.storeStatus !== 'offline' &&
              availabilityObj?.statusBadge !== 'offline',
          );

    const priceLabel = isInstant ? 'Starting from ' : 'Visiting Charge ';
    const actionButtonText = isInstant ? 'Book Now' : 'Book Appointment';

    const rawDuration = item?.duration || vendorUserObj?.duration;
    const timeOrDistanceText = rawDuration
      ? `${rawDuration} mins`
      : distanceText;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleVendorPress(item)}
        style={styles.cardContainer}>
        {/* Vendor Image Banner */}
        <View style={styles.imageContainer}>
          <Image source={{uri: imageUri}} style={styles.vendorImage} />

          {/* Rating Badge Overlay */}
          <View style={styles.ratingBadge}>
            <Image source={icons.star_Icon} style={styles.starIcon} />
            <Text style={styles.ratingText}>{ratingVal}</Text>
          </View>

          {/* Top Right Overlay: Always show Heart Icon */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleRemoveFavorite(vendorId, item)}
            style={styles.heartButton}>
            <Image
              source={icons.heart_Icon}
              style={isLiked ? styles.heartIconLiked : styles.heartIconUnliked}
            />
          </TouchableOpacity>

          {/* Bottom Right Overlay: Vendor is offline badge when offline */}
          {!isAvailable && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>Vendor is offline</Text>
            </View>
          )}
        </View>

        {/* Card Content Details */}
        <View style={styles.cardBody}>
          {/* Business Title & Verified Checkmark */}
          <View style={styles.titleRow}>
            <Text style={styles.businessName} numberOfLines={1}>
              {businessName}
            </Text>
            <Image source={icons.verified_Icon} style={styles.verifiedIcon} />
          </View>

          {/* Starting Price / Visiting Charge */}
          <Text style={styles.priceText}>
            {priceLabel}
            <Text style={styles.priceHighlight}>{startingPrice}</Text>
          </Text>

          {/* Horizontal Divider Line */}
          <View style={styles.divider} />

          {/* Bottom Info & Action Row */}
          {!isAvailable ? (
            <>
              <View style={styles.distanceContainerRow}>
                <Image source={icons.timer_Icon} style={styles.clockIcon} />
                <Text style={styles.distanceText}>{timeOrDistanceText}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  Alert.alert(
                    'Notification Set',
                    `We will notify you when ${businessName} becomes available.`,
                  )
                }
                style={styles.notifyButton}>
                <Image
                  source={icons.notification_Bell_Icon}
                  style={styles.notifyBellIcon}
                />
                <Text style={styles.notifyButtonText}>
                  Notify Me When Available
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.bottomRow}>
              <View style={styles.distanceContainer}>
                <Image source={icons.timer_Icon} style={styles.clockIcon} />
                <Text style={styles.distanceText}>{timeOrDistanceText}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleVendorPress(item)}
                style={styles.bookNowContainer}>
                <Text style={styles.bookNowText}>{actionButtonText}</Text>
                <Image
                  source={icons.back_Arrow_Icon}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Screen Header matching design */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
          style={styles.backButton}>
          <Image source={icons.back_Arrow_Icon} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Saved</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Main Content Area */}
      {isInitialLoading && sagaLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#731EE2" />
          <Text style={styles.loadingText}>Loading saved vendors...</Text>
        </View>
      ) : (
        <FlatList
          data={localList}
          keyExtractor={(item, index) =>
            item.vendorId || item._id || item.id || index.toString()
          }
          renderItem={renderVendorItem}
          contentContainerStyle={
            localList.length === 0
              ? styles.emptyListContent
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#731EE2']}
              tintColor="#731EE2"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Image
                  source={icons.heart_Icon}
                  style={styles.emptyHeartIcon}
                />
              </View>
              <Text style={styles.emptyTitle}>No Saved Vendors Yet</Text>
              <Text style={styles.emptySubtitle}>
                Save your favorite vendors and service providers to access them
                quickly anytime.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  try {
                    navigation.navigate('Home');
                  } catch (e) {
                    console.log('Error navigating to Home:', e);
                  }
                }}
                style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>Explore Services</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    height: hp(54),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: colors.white,
  },
  backButton: {
    width: hp(36),
    height: hp(36),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    width: hp(18),
    height: hp(18),
    resizeMode: 'contain',
    tintColor: colors.pureBlack,
  },
  headerTitle: {
    fontFamily: fontFamily.poppins600,
    fontSize: fontSize(17),
    color: colors.pureBlack,
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: hp(36),
  },
  listContent: {
    paddingHorizontal: wp(16),
    paddingTop: hp(16),
    paddingBottom: hp(40),
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: hp(16),
    marginBottom: hp(16),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: hp(140),
  },
  vendorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: hp(12),
    left: wp(12),
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: hp(20),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
  },
  starIcon: {
    width: hp(12),
    height: hp(12),
    resizeMode: 'contain',
    marginRight: wp(4),
  },
  ratingText: {
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fontFamily.poppins600,
  },
  heartButton: {
    position: 'absolute',
    top: hp(12),
    right: wp(12),
    width: hp(32),
    height: hp(32),
    borderRadius: hp(16),
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIconLiked: {
    width: hp(16),
    height: hp(16),
    tintColor: '#731EE2',
    resizeMode: 'contain',
  },
  heartIconUnliked: {
    width: hp(16),
    height: hp(16),
    tintColor: colors.white,
    resizeMode: 'contain',
  },
  offlineBadge: {
    position: 'absolute',
    bottom: hp(12),
    right: wp(12),
    backgroundColor: '#FEE2E2',
    borderRadius: hp(50),
    paddingHorizontal: wp(14),
    paddingVertical: hp(5),
  },
  offlineBadgeText: {
    color: '#DC2626',
    fontSize: fontSize(12),
    fontFamily: fontFamily.poppins600,
  },
  cardBody: {
    paddingHorizontal: wp(16),
    paddingTop: hp(12),
    paddingBottom: hp(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessName: {
    fontFamily: fontFamily.poppins700,
    fontSize: fontSize(17),
    color: colors.pureBlack,
    flexShrink: 1,
  },
  verifiedIcon: {
    width: hp(16),
    height: hp(16),
    resizeMode: 'contain',
    marginLeft: wp(6),
  },
  priceText: {
    fontFamily: fontFamily.poppins400,
    fontSize: fontSize(13),
    color: '#4A4A4A',
    marginTop: hp(4),
  },
  priceHighlight: {
    fontFamily: fontFamily.poppins600,
    color: '#731EE2',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: hp(10),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    width: hp(14),
    height: hp(14),
    tintColor: '#8E8E93',
    resizeMode: 'contain',
    marginRight: wp(6),
  },
  distanceText: {
    fontFamily: fontFamily.poppins500,
    fontSize: fontSize(13),
    color: '#8E8E93',
  },
  bookNowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instantBookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
  },
  distanceContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(12),
  },
  notifyButton: {
    width: '100%',
    height: hp(44),
    backgroundColor: '#FAF5FF',
    borderRadius: hp(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyBellIcon: {
    width: hp(16),
    height: hp(16),
    tintColor: '#731EE2',
    resizeMode: 'contain',
    marginRight: wp(8),
  },
  notifyButtonText: {
    color: '#731EE2',
    fontFamily: fontFamily.poppins600,
    fontSize: fontSize(14),
  },
  bookNowText: {
    color: '#731EE2',
    fontFamily: fontFamily.poppins600,
    fontSize: fontSize(14),
  },
  arrowIcon: {
    width: hp(12),
    height: hp(12),
    resizeMode: 'contain',
    transform: [{rotate: '180deg'}],
    tintColor: '#731EE2',
    marginLeft: wp(6),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(60),
  },
  loadingText: {
    fontFamily: fontFamily.poppins500,
    fontSize: fontSize(14),
    color: '#8E8E93',
    marginTop: hp(12),
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(16),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(20),
    width: '100%',
  },
  emptyIconCircle: {
    width: hp(80),
    height: hp(80),
    borderRadius: hp(40),
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(20),
  },
  emptyHeartIcon: {
    width: hp(36),
    height: hp(36),
    tintColor: '#731EE2',
    resizeMode: 'contain',
  },
  emptyTitle: {
    fontFamily: fontFamily.poppins700,
    fontSize: fontSize(18),
    color: colors.pureBlack,
    marginBottom: hp(8),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fontFamily.poppins400,
    fontSize: fontSize(13),
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: hp(20),
    marginBottom: hp(24),
  },
  exploreButton: {
    backgroundColor: '#731EE2',
    paddingHorizontal: wp(24),
    paddingVertical: hp(12),
    borderRadius: hp(30),
  },
  exploreButtonText: {
    fontFamily: fontFamily.poppins600,
    fontSize: fontSize(14),
    color: colors.white,
  },
});

export default MySaved;
