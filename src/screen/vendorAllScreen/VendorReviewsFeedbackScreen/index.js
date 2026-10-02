import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import {
  deleteVendorReviewReply,
  getVendorPaginatedReviews,
  replyVendorReview,
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

const defaultReviewsData = [
  {
    id: '1',
    name: 'Wade Warren',
    service: 'Deep House Cleaning',
    time: '2 hours ago',
    rating: 5,
    review:
      'The service was amazing! Very professional and detailed work. Highly satisfied with the result.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    reply: null,
  },
  {
    id: '2',
    name: 'Rahul Bajaj',
    service: 'Hair Cut',
    time: '2 day ago',
    rating: 4.5,
    review:
      'Outstanding photography service! Captured every moment beautifully, and the USB storage option was a convenient bonus.',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    reply: 'Thank you for your valuable feedback',
  },
];

const VendorReviewsFeedbackScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const refRBSheet = useRef();
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Delete Reply Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReplyToDelete, setSelectedReplyToDelete] = useState(null);
  const [submittingDeleteReply, setSubmittingDeleteReply] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  const handleSendReply = () => {
    if (!replyText || !replyText.trim()) {
      Alert.alert('Validation Error', 'Please enter your reply message');
      return;
    }

    const targetId = selectedReview?.id || selectedReview?._id;
    if (!targetId) {
      Alert.alert('Error', 'No review selected');
      return;
    }

    setSendingReply(true);

    const payload = {
      vendorReply: replyText.trim(),
    };

    dispatch(
      replyVendorReview(targetId, payload, (err, resData) => {
        setSendingReply(false);
        if (err) {
          console.log('[VendorReviewsFeedbackScreen] Reply error:', err);
          Alert.alert(
            'Error',
            err?.message || err?.error || 'Failed to send reply',
          );
          return;
        }

        console.log('[VendorReviewsFeedbackScreen] Reply success:', resData);
        refRBSheet.current?.close();
        setReplyText('');
        setSelectedReview(null);

        // Refresh reviews list to show updated reply
        fetchReviews(1, true);
      }),
    );
  };

  const authUser = useSelector(
    state => state.auth?.user || state.customerAuth?.user || {},
  );
  const vendorAvatar =
    authUser?.profilePic ||
    authUser?.profileImage ||
    authUser?.vendor?.profilePic ||
    authUser?.user?.profilePic ||
    authUser?.data?.profilePic ||
    'https://randomuser.me/api/portraits/men/32.jpg';

  const vendorPaginatedReviews = useSelector(
    state =>
      state.auth?.vendorPaginatedReviews ||
      state.customerAuth?.vendorPaginatedReviews,
  );
  const reduxLoading = useSelector(
    state => state.auth?.loading || state.customerAuth?.loading,
  );

  const fetchReviews = (targetPage = 1, isInitialOrRefresh = false) => {
    if (isInitialOrRefresh) {
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }

    dispatch(
      getVendorPaginatedReviews(targetPage, 10, (err, responseData) => {
        setRefreshing(false);
        setLoadingMore(false);

        if (err) {
          console.log('[VendorReviewsFeedbackScreen] Fetch error:', err);
          return;
        }

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

  const rawDocs =
    vendorPaginatedReviews?.docs ||
    vendorPaginatedReviews?.data?.docs ||
    vendorPaginatedReviews?.reviews ||
    vendorPaginatedReviews?.data ||
    (Array.isArray(vendorPaginatedReviews) ? vendorPaginatedReviews : null);

  const reviewsList =
    Array.isArray(rawDocs) && rawDocs.length > 0
      ? rawDocs.map((r, idx) => ({
          id: r._id || r.id || String(idx),
          name:
            r.customerName ||
            r.user?.fullName ||
            r.user?.name ||
            r.userName ||
            r.name ||
            'Customer',
          service: r.serviceName || r.service || r.booking?.serviceName || '',
          time: formatReviewTime(
            r.createdAt || r.reviewTime || r.time || r.date || r.timeAgo,
          ),
          rating: r.stars ?? r.rating ?? r.star ?? 4.5,
          review: r.review || r.comment || r.feedback || '',
          reply: r.reply || r.vendorReply || null,
          image:
            r.userProfilePic ||
            r.user?.profilePic ||
            r.user?.userProfilePic ||
            r.userImage ||
            r.profilePic ||
            r.image ||
            'https://randomuser.me/api/portraits/men/32.jpg',
        }))
      : [];

  const rawAvgRating =
    vendorPaginatedReviews?.averageRating ??
    vendorPaginatedReviews?.data?.averageRating ??
    vendorPaginatedReviews?.rating ??
    vendorPaginatedReviews?.data?.rating ??
    3.5;

  const numericAvg = parseFloat(rawAvgRating) || 3.5;
  const formattedAverageRating = numericAvg.toFixed(1);

  const breakdownObj =
    vendorPaginatedReviews?.breakdown ||
    vendorPaginatedReviews?.data?.breakdown ||
    vendorPaginatedReviews?.ratingBreakdown ||
    vendorPaginatedReviews?.data?.ratingBreakdown ||
    vendorPaginatedReviews?.ratingsBreakdown ||
    vendorPaginatedReviews?.data?.ratingsBreakdown ||
    null;

  const defaultBreakdownCounts = {5: 12000, 4: 9500, 3: 4000, 2: 2100, 1: 1200};

  const formatCount = count => {
    const num = Number(count) || 0;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return String(num);
  };

  const getStarCount = starNum => {
    if (
      breakdownObj &&
      (breakdownObj[starNum] !== undefined ||
        breakdownObj[String(starNum)] !== undefined)
    ) {
      return (
        Number(breakdownObj[starNum] ?? breakdownObj[String(starNum)]) || 0
      );
    }
    if (Array.isArray(rawDocs) && rawDocs.length > 0) {
      return rawDocs.filter(
        r => Math.round(Number(r.stars ?? r.rating ?? r.star ?? 0)) === starNum,
      ).length;
    }
    return defaultBreakdownCounts[starNum] || 0;
  };

  const totalRatingsCount = [5, 4, 3, 2, 1].reduce(
    (acc, star) => acc + getStarCount(star),
    0,
  );

  const breakdownList = [5, 4, 3, 2, 1].map(starNum => {
    const cnt = getStarCount(starNum);
    const pct =
      totalRatingsCount > 0
        ? `${Math.max(
            0,
            Math.min(100, Math.round((cnt / totalRatingsCount) * 100)),
          )}%`
        : '0%';
    return {
      star: starNum,
      value: formatCount(cnt),
      width: pct,
    };
  });

  const renderHeader = () => {
    if (reviewsList.length === 0) {
      return null;
    }
    return (
      <View>
        <View
          style={{
            marginTop: wp(20),
            borderRadius: hp(18),
            borderWidth: hp(1),
            borderColor: '#EAEAEA',
            padding: wp(18),
          }}>
          {/* Rating Number */}
          <Text
            style={{
              fontSize: fontSize(34),
              fontFamily: fontFamily.poppins700,
              color: colors.pureBlack,
            }}>
            {formattedAverageRating}
          </Text>

          {/* ⭐ Stars (Full & Half Star rendering) */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {[1, 2, 3, 4, 5].map(starIndex => {
              const fullCount = Math.floor(numericAvg);
              const remainder = numericAvg - fullCount;
              const isFull = starIndex <= fullCount;
              const isHalf =
                !isFull &&
                starIndex === fullCount + 1 &&
                remainder >= 0.25 &&
                remainder < 0.75;
              const isExtraFull =
                !isFull && starIndex === fullCount + 1 && remainder >= 0.75;
              const isStarGold = isFull || isExtraFull;

              return (
                <View
                  key={starIndex}
                  style={{
                    width: hp(25),
                    height: hp(23),
                    marginRight: wp(22),
                    marginBottom: hp(20),
                    position: 'relative',
                  }}>
                  {/* Base Star */}
                  <Image
                    source={icons.star_Icon}
                    style={{
                      width: hp(25),
                      height: hp(23),
                      tintColor: isStarGold ? '#F0AA07' : '#D1D1D1',
                    }}
                  />

                  {/* Half Star Gold Overlay */}
                  {isHalf && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '50%',
                        height: '100%',
                        overflow: 'hidden',
                      }}>
                      <Image
                        source={icons.star_Icon}
                        style={{
                          width: hp(25),
                          height: hp(23),
                          tintColor: '#F0AA07',
                        }}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Dynamic Rating Breakdown Bars */}
          {breakdownList.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp(10),
              }}>
              {/* Star Number */}
              <Text
                style={{
                  width: wp(20),
                  fontSize: fontSize(10),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins400,
                }}>
                {item.star}
              </Text>

              {/* Background Bar */}
              <View
                style={{
                  flex: 1,
                  height: hp(7),
                  backgroundColor: '#FFF7E5',
                  borderRadius: hp(10),
                  marginHorizontal: wp(8),
                }}>
                {/* Filled Bar */}
                <View
                  style={{
                    width: item.width,
                    height: '100%',
                    backgroundColor: '#F5A623',
                    borderRadius: hp(10),
                  }}
                />
              </View>

              {/* Count */}
              <Text
                style={{
                  width: wp(35),
                  fontSize: fontSize(10),
                  textAlign: 'right',
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* 🔥 CUSTOMER REVIEWS HEADER */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: hp(30),
            marginBottom: hp(6),
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins600,
              color: colors.pureBlack,
            }}>
            Customer Reviews
          </Text>

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: fontSize(12),
                color: colors.pureBlack,
                fontFamily: fontFamily.poppins600,
              }}>
              Newest
            </Text>

            <TouchableOpacity
              style={{
                width: hp(30),
                height: hp(26),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={icons.bottom_Arrow_Icon}
                style={{width: wp(8), height: hp(5), resizeMode: 'contain'}}
              />
            </TouchableOpacity>
          </View>
        </View>
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
          marginTop: hp(14),
          borderRadius: hp(18),
          borderWidth: hp(1),
          borderColor: '#EAEAEA',
          padding: wp(18),
          backgroundColor: colors.white,
        }}>
        {/* Top User Info */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{uri: item.image}}
            style={{
              width: hp(36),
              height: hp(36),
              borderRadius: hp(50),
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
              {item.time}
            </Text>
          </View>
        </View>

        {/* Review Comment */}
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

        {/* If Replied -> Display Vendor Reply Card & Edit / Delete Buttons Below */}
        {hasReply ? (
          <View style={{marginTop: hp(14)}}>
            {/* Vendor Reply Card */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F7F7F7',
                borderRadius: hp(14),
                padding: wp(14),
              }}>
              <Image
                source={{uri: vendorAvatar}}
                style={{
                  width: hp(34),
                  height: hp(34),
                  borderRadius: hp(50),
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

            {/* Edit & Delete Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp(12),
              }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedReview(item);
                  setReplyText(item.reply);
                  refRBSheet.current?.open();
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
                  setSelectedReplyToDelete(item);
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
          </View>
        ) : (
          /* If Not Replied -> Show Reply Button */
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: hp(10),
            }}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => {
                setSelectedReview(item);
                setReplyText('');
                refRBSheet.current?.open();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F5F5F5',
                borderRadius: hp(25),
                paddingHorizontal: wp(18),
                height: hp(40),
                justifyContent: 'center',
              }}>
              <Image
                source={icons.reply_Icon}
                style={{
                  width: hp(18),
                  height: hp(14),
                  marginRight: wp(10),
                  resizeMode: 'contain',
                }}
              />
              <Text
                style={{
                  fontSize: fontSize(15),
                  color: colors.pureBlack,
                  fontFamily: fontFamily.poppins500,
                }}>
                Reply
              </Text>
            </TouchableOpacity>
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
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
          }}>
          Reviews & Feedback
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

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
                  paddingHorizontal: wp(18),
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

      {/* Reply Bottom Sheet */}
      <RBSheet
        ref={refRBSheet}
        height={hp(420)}
        openDuration={250}
        closeOnDragDown={true}
        customStyles={{
          container: {
            borderTopLeftRadius: hp(24),
            borderTopRightRadius: hp(24),
            paddingHorizontal: wp(20),
            paddingTop: hp(8),
            paddingBottom: hp(20),
            backgroundColor: colors.white,
          },
          draggableIcon: {
            backgroundColor: '#E0E0E0',
            width: wp(40),
            height: hp(4),
            borderRadius: hp(2),
          },
        }}>
        {selectedReview && (
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Review Card */}
              <View
                style={{
                  borderRadius: hp(18),
                  borderWidth: hp(1),
                  borderColor: '#EAEAEA',
                  padding: wp(16),
                  marginTop: hp(6),
                }}>
                {/* User Info & Rating Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}>
                    <Image
                      source={{uri: selectedReview.image}}
                      style={{
                        width: hp(36),
                        height: hp(36),
                        borderRadius: hp(50),
                      }}
                    />

                    <View style={{marginLeft: wp(12), flex: 1}}>
                      <Text
                        style={{
                          fontSize: fontSize(15),
                          fontFamily: fontFamily.poppins600,
                          color: colors.pureBlack,
                        }}>
                        {selectedReview.name}
                      </Text>

                      <Text
                        style={{
                          fontSize: fontSize(12),
                          color: '#B4B4B4',
                          fontFamily: fontFamily.poppins500,
                        }}>
                        {selectedReview.time}
                      </Text>
                    </View>
                  </View>

                  {/* Rating */}
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                      }}>
                      {selectedReview.rating}
                    </Text>
                  </View>
                </View>

                {/* Review Text */}
                <Text
                  style={{
                    marginTop: hp(14),
                    fontSize: fontSize(12),
                    color: colors.pureBlack,
                    fontFamily: fontFamily.poppins400,
                    lineHeight: hp(18),
                  }}>
                  {selectedReview.review}
                </Text>
              </View>

              {/* Reply Text Box */}
              <View
                style={{
                  marginTop: hp(16),
                  borderRadius: hp(18),
                  borderWidth: hp(1),
                  borderColor: '#BDBDBD',
                  height: hp(130),
                  padding: wp(16),
                }}>
                <TextInput
                  multiline={true}
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Thanks you for your kind words"
                  placeholderTextColor="#7D7575"
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
            </ScrollView>

            {/* Send Reply Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={sendingReply}
              onPress={handleSendReply}
              style={{
                backgroundColor: colors.primaryColor,
                borderRadius: hp(30),
                height: hp(50),
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp(12),
                marginBottom: hp(8),
                opacity: sendingReply ? 0.7 : 1,
              }}>
              {sendingReply ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={{
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                    color: colors.white,
                  }}>
                  Send Reply
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </RBSheet>

      {/* Delete Reply Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setDeleteModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: wp(20),
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
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedReplyToDelete(null);
                }}
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
                disabled={submittingDeleteReply}
                onPress={() => {
                  const targetId =
                    selectedReplyToDelete?.id || selectedReplyToDelete?._id;

                  if (!targetId) {
                    Alert.alert(
                      'Error',
                      'Invalid review selected for deletion',
                    );
                    return;
                  }

                  setSubmittingDeleteReply(true);

                  dispatch(
                    deleteVendorReviewReply(targetId, (err, resData) => {
                      setSubmittingDeleteReply(false);
                      if (err) {
                        console.log(
                          '[VendorReviewsFeedbackScreen] Delete reply error:',
                          err,
                        );
                        Alert.alert(
                          'Error',
                          typeof err === 'string'
                            ? err
                            : err?.message || 'Failed to delete reply',
                        );
                        return;
                      }

                      setDeleteModalVisible(false);
                      setSelectedReplyToDelete(null);
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
                {submittingDeleteReply ? (
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
    </SafeAreaView>
  );
};

export default VendorReviewsFeedbackScreen;
