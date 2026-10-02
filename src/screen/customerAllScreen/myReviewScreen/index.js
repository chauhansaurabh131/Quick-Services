import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import {
  deleteCustomerReview,
  getCustomerReviews,
  updateCustomerReview,
} from '../../../actions/customerAuthActions';
import {colors} from '../../../utils/colors';
import {
  fontFamily,
  fontSize,
  formatReviewTime,
  hp,
  wp,
} from '../../../utils/helpers';
import {icons} from '../../../assets';

const MyReviewsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {t} = useTranslation();

  // Delete Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReviewToDelete, setSelectedReviewToDelete] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Edit RBSheet states
  const editRBSheetRef = useRef();
  const [selectedEditReview, setSelectedEditReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Pagination & Loading states
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  // Redux Selectors
  const customerPaginatedReviews = useSelector(
    state =>
      state.auth?.customerPaginatedReviews ||
      state.customerAuth?.customerPaginatedReviews,
  );

  const reduxUser = useSelector(
    state => state.auth?.user || state.customerAuth?.user || {},
  );

  const customerName =
    reduxUser?.fullName ||
    reduxUser?.name ||
    reduxUser?.userName ||
    reduxUser?.customerName ||
    reduxUser?.user?.fullName ||
    reduxUser?.user?.name ||
    'Customer';

  const customerAvatar =
    reduxUser?.profilePic ||
    reduxUser?.profileImage ||
    reduxUser?.userProfilePic ||
    reduxUser?.user?.profilePic ||
    reduxUser?.user?.profileImage ||
    'https://randomuser.me/api/portraits/men/32.jpg';

  // API Fetch with Pagination
  const fetchReviews = (targetPage = 1, isInitialOrRefresh = false) => {
    if (isInitialOrRefresh) {
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }

    console.log(
      '==================================================',
      '\n[MyReviewsScreen] Calling getCustomerReviews API via Redux Saga',
      `\nTarget Page: ${targetPage}`,
      '\n==================================================',
    );

    dispatch(
      getCustomerReviews(targetPage, 10, (err, responseData) => {
        setRefreshing(false);
        setLoadingMore(false);

        if (err) {
          console.log('[MyReviewsScreen] Fetch reviews error:', err);
          return;
        }

        console.log(
          '==================================================',
          '\n[MyReviewsScreen] API Success Response:',
          JSON.stringify(responseData, null, 2),
          '\n==================================================',
        );

        const resObj = responseData?.data || responseData;
        const docs = Array.isArray(resObj?.docs)
          ? resObj.docs
          : Array.isArray(resObj?.reviews)
          ? resObj.reviews
          : Array.isArray(resObj)
          ? resObj
          : [];

        const limit = resObj?.limit || 10;
        const totalPages = resObj?.totalPages;
        const hasNext = resObj?.hasNextPage;

        if (hasNext !== undefined) {
          setHasMorePages(Boolean(hasNext));
        } else if (totalPages !== undefined) {
          setHasMorePages(targetPage < totalPages);
        } else {
          setHasMorePages(docs.length >= limit);
        }

        setPage(targetPage);
      }),
    );
  };

  useEffect(() => {
    fetchReviews(1, true);
  }, []);

  const handleRefresh = () => {
    fetchReviews(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !refreshing && hasMorePages) {
      fetchReviews(page + 1, false);
    }
  };

  // Map API docs ONLY (no static fallback)
  const rawDocs =
    customerPaginatedReviews?.docs ||
    customerPaginatedReviews?.data?.docs ||
    customerPaginatedReviews?.reviews ||
    customerPaginatedReviews?.data ||
    (Array.isArray(customerPaginatedReviews) ? customerPaginatedReviews : null);

  const reviewsList =
    Array.isArray(rawDocs) && rawDocs.length > 0
      ? rawDocs.map((r, idx) => ({
          id: r._id || r.id || String(idx),
          name:
            r.customerName ||
            r.name ||
            r.user?.fullName ||
            r.user?.name ||
            customerName,
          serviceName:
            r.serviceName || r.service || r.booking?.serviceName || 'Service',
          timeAgo:
            formatReviewTime(r.createdAt || r.time || r.reviewTime || r.date) ||
            r.timeAgo ||
            '',
          rating: r.stars ?? r.rating ?? r.star ?? 4.5,
          review: r.review || r.comment || r.feedback || '',
          reply: r.reply || r.vendorReply || null,
          image:
            r.profilePic ||
            r.profileImage ||
            r.userProfilePic ||
            r.user?.profilePic ||
            customerAvatar,
          rawObj: r,
        }))
      : [];

  const totalCount =
    customerPaginatedReviews?.totalDocs ??
    customerPaginatedReviews?.data?.totalDocs ??
    customerPaginatedReviews?.summary?.totalReviews ??
    reviewsList.length;

  const renderHeader = () => {
    if (reviewsList.length === 0) {
      return null;
    }
    return (
      <View style={{marginTop: hp(16), marginBottom: hp(10)}}>
        <Text
          style={{
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
            color: '#828B9E',
          }}>
          {totalCount} Reviews shared
        </Text>
      </View>
    );
  };

  const renderReviewItem = ({item}) => {
    const hasReply = Boolean(
      item.reply && String(item.reply).trim().length > 0,
    );

    return (
      <View
        style={{
          borderRadius: hp(18),
          borderWidth: 1,
          borderColor: '#EAEAEA',
          padding: wp(18),
          marginBottom: hp(16),
          backgroundColor: colors.white,
        }}>
        {/* User Info Header */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{uri: item.image || customerAvatar}}
            style={{
              width: hp(36),
              height: hp(36),
              borderRadius: hp(18),
            }}
          />

          <View style={{marginLeft: wp(12), flex: 1}}>
            <Text
              style={{
                fontSize: fontSize(15),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
              }}>
              {item.name}
            </Text>

            <Text
              style={{
                fontSize: fontSize(12),
                color: '#B4B4B4',
                fontFamily: fontFamily.poppins400,
                marginTop: hp(2),
              }}>
              {item.timeAgo}
            </Text>
          </View>
        </View>

        {/* Review Comment Text */}
        <Text
          style={{
            marginTop: hp(14),
            fontSize: fontSize(13),
            color: colors.pureBlack,
            fontFamily: fontFamily.poppins400,
            lineHeight: hp(19),
          }}>
          {item.review}
        </Text>

        {/* Rating Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp(16),
          }}>
          <Image
            source={icons.star_Icon}
            style={{
              width: hp(16),
              height: hp(16),
              tintColor: '#F0AA07',
              marginRight: wp(6),
            }}
          />
          <Text
            style={{
              fontSize: fontSize(15),
              color: colors.pureBlack,
              fontFamily: fontFamily.poppins600,
              top: 1,
            }}>
            {item.rating}
          </Text>
        </View>

        {/* Action Buttons Row (Edit & Delete) - Hide if vendor has replied */}
        {!hasReply && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: hp(14),
            }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedEditReview(item);
                setEditRating(item.rating || 5);
                setEditReviewText(item.review || '');
                editRBSheetRef.current?.open();
              }}
              style={{
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: hp(10),
                paddingHorizontal: wp(18),
                paddingVertical: hp(6),
                marginRight: wp(12),
                backgroundColor: colors.white,
              }}>
              <Text
                style={{
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins500,
                  color: colors.pureBlack,
                }}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedReviewToDelete(item);
                setDeleteModalVisible(true);
              }}
              style={{
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: hp(10),
                paddingHorizontal: wp(18),
                paddingVertical: hp(6),
                backgroundColor: colors.white,
              }}>
              <Text
                style={{
                  fontSize: fontSize(13),
                  fontFamily: fontFamily.poppins500,
                  color: '#FF4D4D',
                }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Vendor Reply Card Box (if reply exists) */}
        {hasReply && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F7F7F7',
              borderRadius: hp(14),
              padding: wp(14),
              marginTop: hp(14),
            }}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f',
              }}
              style={{
                width: hp(32),
                height: hp(32),
                borderRadius: hp(16),
              }}
            />
            <Text
              style={{
                flex: 1,
                marginLeft: wp(12),
                fontSize: fontSize(13),
                fontFamily: fontFamily.poppins400,
                color: colors.pureBlack,
                lineHeight: hp(18),
              }}>
              {item.reply}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={{paddingVertical: hp(20), alignItems: 'center'}}>
        <ActivityIndicator size="small" color={colors.primaryColor} />
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* Top Header Bar */}
      <View
        style={{
          height: hp(50),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
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
            fontFamily: fontFamily.poppins500,
          }}>
          {t('my_reviews') || 'My Reviews'}
        </Text>
      </View>

      {/* Bottom Header Divider Line */}
      <View
        style={{
          width: '100%',
          height: hp(1),
          backgroundColor: '#E3E3E3',
        }}
      />

      {/* Main Content Area */}
      {refreshing && page === 1 && reviewsList.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={colors.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={reviewsList}
          keyExtractor={item => item.id}
          renderItem={renderReviewItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primaryColor]}
              tintColor={colors.primaryColor}
            />
          }
          contentContainerStyle={
            reviewsList.length === 0
              ? {flex: 1, justifyContent: 'center', alignItems: 'center'}
              : {
                  paddingHorizontal: wp(16),
                  paddingBottom: hp(40),
                }
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !refreshing && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins400,
                    color: '#828282',
                  }}>
                  No reviews found
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setDeleteModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: wp(24),
          }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: wp(340),
              backgroundColor: colors.white,
              borderRadius: hp(24),
              paddingHorizontal: wp(24),
              paddingVertical: hp(28),
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: fontSize(18),
                fontFamily: fontFamily.poppins500,
                color: colors.pureBlack,
                textAlign: 'center',
                lineHeight: hp(26),
                marginBottom: hp(24),
              }}>
              Are you sure want to{'\n'}delete this review?
            </Text>

            {/* Modal Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
              }}>
              {/* Not Now Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setDeleteModalVisible(false)}
                style={{
                  flex: 1,
                  height: hp(46),
                  borderRadius: hp(23),
                  backgroundColor: colors.primaryColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: wp(12),
                }}>
                <Text
                  style={{
                    fontSize: fontSize(15),
                    fontFamily: fontFamily.poppins500,
                    color: colors.white,
                  }}>
                  Not Now
                </Text>
              </TouchableOpacity>

              {/* Yes, Delete Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={submittingDelete}
                onPress={() => {
                  const reviewId =
                    selectedReviewToDelete?.id ||
                    selectedReviewToDelete?.rawObj?._id ||
                    selectedReviewToDelete?.rawObj?.id;

                  if (!reviewId) {
                    Alert.alert(
                      'Error',
                      'Invalid review selected for deletion',
                    );
                    return;
                  }

                  console.log(
                    '==================================================',
                    '\n[MyReviewsScreen] Dispatching deleteCustomerReview via Redux & Saga',
                    `\nReview ID: ${reviewId}`,
                    '\n==================================================',
                  );

                  setSubmittingDelete(true);

                  dispatch(
                    deleteCustomerReview(reviewId, (err, resData) => {
                      setSubmittingDelete(false);
                      if (err) {
                        console.log(
                          '[MyReviewsScreen] Delete review failed:',
                          err,
                        );
                        Alert.alert(
                          'Error',
                          typeof err === 'string'
                            ? err
                            : err?.message ||
                                'Failed to delete review. Please try again.',
                        );
                        return;
                      }

                      console.log(
                        '==================================================',
                        '\n[MyReviewsScreen] Review deleted successfully:',
                        JSON.stringify(resData, null, 2),
                        '\n==================================================',
                      );

                      setDeleteModalVisible(false);
                      setSelectedReviewToDelete(null);
                      fetchReviews(1, true);
                    }),
                  );
                }}
                style={{
                  flex: 1,
                  height: hp(46),
                  borderRadius: hp(23),
                  borderWidth: 1,
                  borderColor: colors.primaryColor,
                  backgroundColor: colors.white,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {submittingDelete ? (
                  <ActivityIndicator size="small" color={colors.primaryColor} />
                ) : (
                  <Text
                    style={{
                      fontSize: fontSize(15),
                      fontFamily: fontFamily.poppins500,
                      color: colors.primaryColor,
                    }}>
                    Yes, Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modify Review RBSheet */}
      <RBSheet
        ref={editRBSheetRef}
        height={hp(480)}
        openDuration={250}
        closeOnDragDown={false}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            backgroundColor: colors.white,
            paddingHorizontal: wp(20),
            paddingTop: hp(16),
            paddingBottom: hp(20),
          },
        }}>
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View>
            {/* Sheet Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: hp(14),
              }}>
              <Text
                style={{
                  fontSize: fontSize(18),
                  fontFamily: fontFamily.poppins600,
                  color: colors.pureBlack,
                }}>
                Modify Review
              </Text>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => editRBSheetRef.current?.close()}
                style={{
                  width: hp(32),
                  height: hp(32),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: fontSize(20),
                    fontFamily: fontFamily.poppins400,
                    color: colors.pureBlack,
                  }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Border Line */}
            <View
              style={{
                width: '100%',
                height: hp(1),
                backgroundColor: '#EAEAEA',
                marginBottom: hp(20),
              }}
            />

            {/* Rate Your Professional Subtitle */}
            <Text
              style={{
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins600,
                color: colors.pureBlack,
                textAlign: 'center',
                marginBottom: hp(16),
              }}>
              Rate Your Professional
            </Text>

            {/* Star Rating Selectors */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: hp(20),
              }}>
              {[1, 2, 3, 4, 5].map(starIndex => (
                <TouchableOpacity
                  key={starIndex}
                  activeOpacity={0.7}
                  onPress={() => setEditRating(starIndex)}
                  style={{paddingHorizontal: wp(6)}}>
                  <Image
                    source={icons.star_Icon}
                    style={{
                      width: hp(32),
                      height: hp(32),
                      tintColor:
                        starIndex <= editRating ? '#F0AA07' : '#D1D1D1',
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Review Comment Multiline TextInput */}
            <View
              style={{
                borderRadius: hp(16),
                borderWidth: hp(1),
                borderColor: '#CCCCCC',
                height: hp(150),
                padding: wp(16),
                backgroundColor: colors.white,
              }}>
              <TextInput
                multiline={true}
                value={editReviewText}
                onChangeText={setEditReviewText}
                placeholder="Write your feedback..."
                placeholderTextColor="#999999"
                textAlignVertical="top"
                style={{
                  flex: 1,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                  padding: 0,
                }}
              />
            </View>
          </View>

          {/* Submit Review Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={submittingEdit}
            onPress={() => {
              if (!editReviewText || !editReviewText.trim()) {
                Alert.alert('Validation Error', 'Please enter your review');
                return;
              }

              const reviewId =
                selectedEditReview?.id ||
                selectedEditReview?.rawObj?._id ||
                selectedEditReview?.rawObj?.id;
              if (!reviewId) {
                Alert.alert('Error', 'Invalid review selected');
                return;
              }

              const payload = {
                rating: Number(editRating),
                review: editReviewText.trim(),
              };

              console.log(
                '==================================================',
                '\n[MyReviewsScreen] Dispatching updateCustomerReview via Redux & Saga',
                `\nReview ID: ${reviewId}`,
                '\nPayload:',
                JSON.stringify(payload, null, 2),
                '\n==================================================',
              );

              setSubmittingEdit(true);

              dispatch(
                updateCustomerReview(reviewId, payload, (err, resData) => {
                  setSubmittingEdit(false);
                  if (err) {
                    console.log('[MyReviewsScreen] Update review failed:', err);
                    Alert.alert(
                      'Error',
                      typeof err === 'string'
                        ? err
                        : err?.message ||
                            'Failed to update review. Please try again.',
                    );
                    return;
                  }

                  console.log(
                    '==================================================',
                    '\n[MyReviewsScreen] Review updated successfully:',
                    JSON.stringify(resData, null, 2),
                    '\n==================================================',
                  );

                  editRBSheetRef.current?.close();
                  fetchReviews(1, true);
                }),
              );
            }}
            style={{
              backgroundColor: colors.primaryColor,
              borderRadius: hp(25),
              height: hp(50),
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp(16),
              marginBottom: hp(8),
            }}>
            {submittingEdit ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text
                style={{
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                  color: colors.white,
                }}>
                Submit Review
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default MyReviewsScreen;
