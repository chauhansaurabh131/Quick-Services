import * as TYPES from '../actions/actionTypes';

const dedupeAddresses = list => {
  if (!Array.isArray(list)) {
    return [];
  }
  const map = new Map();
  list.forEach(item => {
    if (!item) {
      return;
    }
    const key = item._id || item.id || (typeof item === 'string' ? item : null);
    if (key) {
      map.set(String(key), item);
    }
  });
  return Array.from(map.values());
};

const syncUserAddresses = (stateUser, addressList) => {
  if (!stateUser) {
    return stateUser;
  }

  const cleanList = dedupeAddresses(addressList);
  const updatedUser = {...stateUser};

  // Remove top-level addresses property if present ("dont create outside of user")
  if ('addresses' in updatedUser) {
    delete updatedUser.addresses;
  }

  if (updatedUser.user && typeof updatedUser.user === 'object') {
    updatedUser.user = {
      ...updatedUser.user,
      addresses: cleanList,
    };
  } else if (
    updatedUser.data?.user &&
    typeof updatedUser.data.user === 'object'
  ) {
    updatedUser.data = {
      ...updatedUser.data,
      user: {
        ...updatedUser.data.user,
        addresses: cleanList,
      },
    };
  } else {
    updatedUser.addresses = cleanList;
  }

  return updatedUser;
};

const initialState = {
  loading: false,
  user: null,
  error: null,
  isLoggedIn: false,
};

const customerAuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case TYPES.LOGIN_CUSTOMER:
    case TYPES.LOGIN_VENDOR:
    case TYPES.REGISTER_VENDOR:
    case TYPES.VERIFY_OTP_CUSTOMER:
    case TYPES.VERIFY_OTP_VENDOR:
    case TYPES.UPDATE_USER_CUSTOMER:
    case TYPES.UPLOAD_PROFILE_PIC:
    case TYPES.UPDATE_VENDOR_PROFILE:
    case TYPES.SAVE_BUSINESS_ADDRESS:
    case TYPES.SAVE_VENDOR_SERVICES:
    case TYPES.GET_VENDOR_SERVICES_BY_CATEGORY:
    case TYPES.GET_VENDOR_USER_DETAILS:
    case TYPES.GET_MY_AVAILABILITY:
    case TYPES.UPDATE_MY_AVAILABILITY:
    case TYPES.GET_CUSTOMER_BOOKINGS:
    case TYPES.CANCEL_CUSTOMER_BOOKING:
    case TYPES.CREATE_CUSTOMER_REVIEW:
    case TYPES.GET_VENDOR_PAGINATED_REVIEWS:
    case TYPES.REPLY_VENDOR_REVIEW:
    case TYPES.GET_CUSTOMER_REVIEWS:
    case TYPES.UPDATE_CUSTOMER_REVIEW:
    case TYPES.DELETE_CUSTOMER_REVIEW:
    case TYPES.DELETE_VENDOR_REVIEW_REPLY:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case TYPES.DELETE_VENDOR_REVIEW_REPLY_SUCCESS: {
      const targetReviewId = action.reviewId || action.payload?.reviewId;
      const existingDocs = state.vendorPaginatedReviews?.docs;

      if (Array.isArray(existingDocs) && targetReviewId) {
        const updatedDocs = existingDocs.map(item => {
          const itemId = item._id || item.id;
          if (String(itemId) === String(targetReviewId)) {
            return {
              ...item,
              vendorReply: null,
              reply: null,
              replyAt: null,
            };
          }
          return item;
        });

        return {
          ...state,
          loading: false,
          deleteVendorReviewReplyResult: action.data,
          vendorPaginatedReviews: {
            ...state.vendorPaginatedReviews,
            docs: updatedDocs,
          },
          error: null,
        };
      }

      return {
        ...state,
        loading: false,
        deleteVendorReviewReplyResult: action.data,
        error: null,
      };
    }
    case TYPES.DELETE_CUSTOMER_REVIEW_SUCCESS: {
      const targetId = action.payload?.reviewId;
      const existingDocs = state.customerPaginatedReviews?.docs || [];
      const updatedDocs = targetId
        ? existingDocs.filter(
            item => String(item._id || item.id) !== String(targetId),
          )
        : existingDocs;

      return {
        ...state,
        loading: false,
        customerPaginatedReviews: {
          ...state.customerPaginatedReviews,
          docs: updatedDocs,
        },
        deleteCustomerReviewResult: action.payload?.data,
        error: null,
      };
    }
    case TYPES.UPDATE_CUSTOMER_REVIEW_SUCCESS: {
      const targetId = action.payload?.reviewId;
      const updatedData = action.payload?.data;

      const existingDocs = state.customerPaginatedReviews?.docs || [];
      const updatedDocs = existingDocs.map(item => {
        const itemId = item._id || item.id;
        if (targetId && String(itemId) === String(targetId)) {
          return {
            ...item,
            ...(typeof updatedData === 'object' ? updatedData : {}),
            rating: updatedData?.rating ?? item.rating,
            review: updatedData?.review ?? item.review,
            comment:
              updatedData?.review ?? updatedData?.comment ?? item.comment,
          };
        }
        return item;
      });

      return {
        ...state,
        loading: false,
        customerPaginatedReviews: {
          ...state.customerPaginatedReviews,
          docs: updatedDocs,
        },
        updateCustomerReviewResult: action.payload?.data,
        error: null,
      };
    }
    case TYPES.CREATE_CUSTOMER_REVIEW_SUCCESS:
      return {
        ...state,
        loading: false,
        createReviewResult: action.data,
        error: null,
      };
    case TYPES.REPLY_VENDOR_REVIEW_SUCCESS: {
      const targetReviewId = action.reviewId || action.payload?.reviewId;
      const updatedReplyData = action.data || action.payload?.data;

      const existingDocs = state.vendorPaginatedReviews?.docs;
      if (Array.isArray(existingDocs) && targetReviewId) {
        const updatedDocs = existingDocs.map(item => {
          const itemId = item._id || item.id;
          if (String(itemId) === String(targetReviewId)) {
            return {
              ...item,
              vendorReply:
                updatedReplyData?.vendorReply ||
                updatedReplyData?.reply ||
                item.vendorReply,
              reply:
                updatedReplyData?.vendorReply ||
                updatedReplyData?.reply ||
                item.reply,
              replyAt: updatedReplyData?.replyAt || new Date().toISOString(),
            };
          }
          return item;
        });

        return {
          ...state,
          loading: false,
          replyReviewResult: action.data,
          vendorPaginatedReviews: {
            ...state.vendorPaginatedReviews,
            docs: updatedDocs,
          },
          error: null,
        };
      }

      return {
        ...state,
        loading: false,
        replyReviewResult: action.data,
        error: null,
      };
    }
    case TYPES.GET_VENDOR_PAGINATED_REVIEWS_SUCCESS: {
      const pageNum = action.payload?.page || 1;
      const rawPayload = action.payload?.data;

      const newReviews = Array.isArray(rawPayload?.docs)
        ? rawPayload.docs
        : Array.isArray(rawPayload?.data?.docs)
        ? rawPayload.data.docs
        : Array.isArray(rawPayload?.reviews)
        ? rawPayload.reviews
        : Array.isArray(rawPayload?.data)
        ? rawPayload.data
        : Array.isArray(rawPayload)
        ? rawPayload
        : [];

      const existingData = state.vendorPaginatedReviews;
      const existingReviews =
        pageNum > 1 && Array.isArray(existingData?.docs)
          ? existingData.docs
          : pageNum > 1 && Array.isArray(existingData)
          ? existingData
          : [];

      const combinedDocs =
        pageNum === 1 ? newReviews : [...existingReviews, ...newReviews];

      return {
        ...state,
        loading: false,
        vendorPaginatedReviews: {
          ...(typeof rawPayload === 'object' && rawPayload !== null
            ? rawPayload
            : {}),
          docs: combinedDocs,
        },
        error: null,
      };
    }
    case TYPES.GET_CUSTOMER_REVIEWS_SUCCESS: {
      const pageNum = action.payload?.page || 1;
      const rawPayload = action.payload?.data;

      const newReviews = Array.isArray(rawPayload?.docs)
        ? rawPayload.docs
        : Array.isArray(rawPayload?.data?.docs)
        ? rawPayload.data.docs
        : Array.isArray(rawPayload?.reviews)
        ? rawPayload.reviews
        : Array.isArray(rawPayload?.data)
        ? rawPayload.data
        : Array.isArray(rawPayload)
        ? rawPayload
        : [];

      const existingData = state.customerPaginatedReviews;
      const existingReviews =
        pageNum > 1 && Array.isArray(existingData?.docs)
          ? existingData.docs
          : pageNum > 1 && Array.isArray(existingData)
          ? existingData
          : [];

      const combinedDocs =
        pageNum === 1 ? newReviews : [...existingReviews, ...newReviews];

      return {
        ...state,
        loading: false,
        customerPaginatedReviews: {
          ...(typeof rawPayload === 'object' && rawPayload !== null
            ? rawPayload
            : {}),
          docs: combinedDocs,
        },
        error: null,
      };
    }
    case TYPES.LOGIN_CUSTOMER_FAILED:
    case TYPES.LOGIN_VENDOR_FAILED:
    case TYPES.REGISTER_VENDOR_FAILED:
    case TYPES.VERIFY_OTP_CUSTOMER_FAILED:
    case TYPES.VERIFY_OTP_VENDOR_FAILED:
    case TYPES.UPDATE_USER_CUSTOMER_FAILED:
    case TYPES.UPLOAD_PROFILE_PIC_FAILED:
    case TYPES.UPDATE_VENDOR_PROFILE_FAILED:
    case TYPES.SAVE_BUSINESS_ADDRESS_FAILED:
    case TYPES.SAVE_VENDOR_SERVICES_FAILED:
    case TYPES.GET_VENDOR_SERVICES_BY_CATEGORY_FAILED:
    case TYPES.GET_VENDOR_USER_DETAILS_FAILED:
    case TYPES.GET_MY_AVAILABILITY_FAILED:
    case TYPES.UPDATE_MY_AVAILABILITY_FAILED:
    case TYPES.UPDATE_USER_LOCATION_FAILED:
    case TYPES.SAVE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.UPDATE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.GET_CUSTOMER_ADDRESSES_FAILED:
    case TYPES.DELETE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.CREATE_BOOKING_FAILED:
    case TYPES.GET_BOOKING_BY_ID_FAILED:
    case TYPES.GET_VENDOR_BOOKINGS_FAILED:
    case TYPES.ACCEPT_VENDOR_BOOKING_FAILED:
    case TYPES.RESEND_OTP_VENDOR_FAILED:
    case TYPES.GET_CUSTOMER_BOOKINGS_FAILED:
    case TYPES.CANCEL_CUSTOMER_BOOKING_FAILED:
    case TYPES.CREATE_CUSTOMER_REVIEW_FAILED:
    case TYPES.GET_VENDOR_PAGINATED_REVIEWS_FAILED:
    case TYPES.REPLY_VENDOR_REVIEW_FAILED:
    case TYPES.GET_CUSTOMER_REVIEWS_FAILED:
    case TYPES.UPDATE_CUSTOMER_REVIEW_FAILED:
    case TYPES.DELETE_CUSTOMER_REVIEW_FAILED:
    case TYPES.DELETE_VENDOR_REVIEW_REPLY_FAILED:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case TYPES.LOGIN_CUSTOMER_SUCCESS:
    case TYPES.REGISTER_VENDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.data,
        error: null,
      };
    case TYPES.LOGIN_VENDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.data,
        isLoggedIn: true,
        error: null,
      };
    case TYPES.VERIFY_OTP_CUSTOMER_SUCCESS:
    case TYPES.VERIFY_OTP_VENDOR_SUCCESS:
      const userObj =
        action.data?.user || action.data?.data?.user || action.data;
      const hasName = userObj?.fullName || userObj?.name;
      return {
        ...state,
        loading: false,
        user: {
          ...state.user,
          ...action.data,
        },
        isLoggedIn: hasName ? true : false,
        error: null,
      };
    case TYPES.UPDATE_USER_CUSTOMER_SUCCESS:
    case TYPES.UPLOAD_PROFILE_PIC_SUCCESS:
    case TYPES.UPDATE_VENDOR_PROFILE_SUCCESS:
    case TYPES.SAVE_BUSINESS_ADDRESS_SUCCESS:
    case TYPES.SAVE_VENDOR_SERVICES_SUCCESS: {
      const updatedPic =
        action.payload?.profileImage ||
        action.payload?.profilePic ||
        action.data?.profileImage ||
        action.data?.profilePic ||
        action.data?.user?.profileImage ||
        action.data?.user?.profilePic ||
        action.data?.vendorUser?.profilePic ||
        action.data?.vendorUser?.profileImage;

      return {
        ...state,
        loading: false,
        user: {
          ...state.user,
          ...action.data,
          ...(updatedPic
            ? {
                profileImage: updatedPic,
                profilePic: updatedPic,
                userProfilePic: updatedPic,
              }
            : {}),
          serviceRadius:
            action.payload?.serviceRadius ??
            action.data?.serviceRadius ??
            state.user?.serviceRadius,
          user: {
            ...state.user?.user,
            ...action.data?.user,
            ...action.payload,
            ...(updatedPic
              ? {
                  profileImage: updatedPic,
                  profilePic: updatedPic,
                  userProfilePic: updatedPic,
                }
              : {}),
          },
          customerUser: {
            ...state.user?.customerUser,
            ...action.data?.customerUser,
            ...action.payload,
            ...(updatedPic
              ? {
                  profileImage: updatedPic,
                  profilePic: updatedPic,
                  userProfilePic: updatedPic,
                }
              : {}),
          },
          vendorUser: {
            ...state.user?.vendorUser,
            ...action.data?.vendorUser,
            ...action.payload,
            ...(updatedPic
              ? {
                  profileImage: updatedPic,
                  profilePic: updatedPic,
                  userProfilePic: updatedPic,
                }
              : {}),
          },
        },
        isLoggedIn: true,
        error: null,
      };
    }
    case TYPES.GET_VENDOR_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.data,
        error: null,
      };
    case TYPES.GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        customerCategories: action.data,
        error: null,
      };
    case TYPES.GET_CATEGORY_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedCategoryDetails: action.data,
        error: null,
      };
    case TYPES.GET_SERVICES_BY_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        services: action.data,
        error: null,
      };
    case TYPES.GET_VENDOR_SERVICES_BY_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorServices: action.data,
        error: null,
      };
    case TYPES.GET_VENDOR_USER_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorUserDetails: action.data,
        error: null,
      };
    case TYPES.GET_MY_AVAILABILITY_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorAvailability: action.data,
        error: null,
      };
    case TYPES.UPDATE_MY_AVAILABILITY_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorAvailability: {
          ...(typeof state.vendorAvailability === 'object'
            ? state.vendorAvailability
            : {}),
          ...(typeof action.data === 'object' ? action.data : {}),
          ...(typeof action.payload === 'object' ? action.payload : {}),
        },
        error: null,
      };
    case TYPES.UPDATE_USER_LOCATION_SUCCESS:
      return {
        ...state,
        loading: false,
        locationUpdateData: action.data,
        error: null,
      };
    case TYPES.GET_CUSTOMER_ADDRESSES_SUCCESS: {
      const extractedList = Array.isArray(action.data)
        ? action.data
        : Array.isArray(action.data?.docs)
        ? action.data.docs
        : Array.isArray(action.data?.addresses)
        ? action.data.addresses
        : Array.isArray(action.data?.data)
        ? action.data.data
        : Array.isArray(action.data?.data?.docs)
        ? action.data.data.docs
        : Array.isArray(action.data?.data?.addresses)
        ? action.data.data.addresses
        : [];

      return {
        ...state,
        loading: false,
        user: syncUserAddresses(state.user, extractedList),
        customerAddressData: action.data,
        error: null,
      };
    }
    case TYPES.SAVE_CUSTOMER_ADDRESS_SUCCESS: {
      const existingAddresses =
        state.user?.user?.addresses ||
        state.user?.data?.user?.addresses ||
        state.user?.addresses ||
        [];

      let updatedList = [];
      const newAddressItem = action.data?.data || action.data;

      if (Array.isArray(newAddressItem)) {
        updatedList = newAddressItem;
      } else if (newAddressItem && typeof newAddressItem === 'object') {
        updatedList = [...existingAddresses, newAddressItem];
      } else {
        updatedList = existingAddresses;
      }

      return {
        ...state,
        loading: false,
        user: syncUserAddresses(state.user, updatedList),
        customerAddressData: action.data,
        error: null,
      };
    }
    case TYPES.UPDATE_CUSTOMER_ADDRESS_SUCCESS: {
      const existingAddresses =
        state.user?.user?.addresses ||
        state.user?.data?.user?.addresses ||
        state.user?.addresses ||
        [];

      let updatedList = [];
      const modifiedItem = action.data?.data || action.data;

      if (Array.isArray(modifiedItem)) {
        updatedList = modifiedItem;
      } else if (modifiedItem && typeof modifiedItem === 'object') {
        const modId = modifiedItem._id || modifiedItem.id;
        if (modId) {
          updatedList = existingAddresses.map(item =>
            (item._id || item.id) === modId ? {...item, ...modifiedItem} : item,
          );
        } else {
          updatedList = existingAddresses;
        }
      } else {
        updatedList = existingAddresses;
      }

      return {
        ...state,
        loading: false,
        user: syncUserAddresses(state.user, updatedList),
        customerAddressData: action.data,
        error: null,
      };
    }
    case TYPES.DELETE_CUSTOMER_ADDRESS_SUCCESS: {
      const targetAddressId =
        action.addressId ||
        action.data?.addressId ||
        action.data?.id ||
        action.data?._id;

      const existingAddresses =
        state.user?.user?.addresses ||
        state.user?.data?.user?.addresses ||
        state.user?.addresses ||
        [];

      const filteredList = targetAddressId
        ? existingAddresses.filter(
            item =>
              (item._id || item.id) !== targetAddressId &&
              item !== targetAddressId,
          )
        : existingAddresses;

      return {
        ...state,
        loading: false,
        user: syncUserAddresses(state.user, filteredList),
        customerAddressData: action.data,
        error: null,
      };
    }
    case TYPES.CREATE_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        bookingData: action.data,
        error: null,
      };
    case TYPES.GET_BOOKING_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        activeBookingDetails: action.data,
        error: null,
      };
    case TYPES.GET_VENDOR_BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        vendorBookings: {
          ...(state.vendorBookings || {}),
          [action.payload?.status || 'panding']: action.payload?.data,
        },
        error: null,
      };
    case TYPES.GET_CUSTOMER_BOOKINGS_SUCCESS: {
      const statusKey = action.payload?.status || 'accepted';
      const pageNum = action.payload?.page || 1;
      const newItems = Array.isArray(action.payload?.data)
        ? action.payload.data
        : [];

      const existingItems =
        pageNum > 1 && Array.isArray(state.customerBookings?.[statusKey])
          ? state.customerBookings[statusKey]
          : [];

      const existingIds = new Set(
        existingItems.map(item =>
          String(item._id || item.id || item.bookingId || item.booking_id),
        ),
      );
      const uniqueNewItems = newItems.filter(
        item =>
          !existingIds.has(
            String(item._id || item.id || item.bookingId || item.booking_id),
          ),
      );

      return {
        ...state,
        loading: false,
        customerBookings: {
          ...(state.customerBookings || {}),
          [statusKey]:
            pageNum === 1 ? newItems : [...existingItems, ...uniqueNewItems],
        },
        error: null,
      };
    }
    case TYPES.ACCEPT_VENDOR_BOOKING_SUCCESS: {
      const acceptedId =
        action.data?._id || action.data?.id || action.data?.bookingId;
      const currentPanding = state.vendorBookings?.panding;
      const updatedPanding = Array.isArray(currentPanding)
        ? currentPanding.filter(
            item => (item._id || item.id) !== acceptedId && item !== acceptedId,
          )
        : currentPanding;

      return {
        ...state,
        loading: false,
        acceptedBookingResult: action.data,
        vendorBookings: {
          ...(state.vendorBookings || {}),
          panding: updatedPanding,
        },
        error: null,
      };
    }
    case TYPES.CANCEL_VENDOR_BOOKING_SUCCESS: {
      const cancelledId =
        action.data?._id || action.data?.id || action.data?.bookingId;
      const currentPanding = state.vendorBookings?.panding;
      const currentAccepted = state.vendorBookings?.accepted;

      const updatedPanding = Array.isArray(currentPanding)
        ? currentPanding.filter(
            item =>
              (item._id || item.id) !== cancelledId && item !== cancelledId,
          )
        : currentPanding;

      const updatedAccepted = Array.isArray(currentAccepted)
        ? currentAccepted.filter(
            item =>
              (item._id || item.id) !== cancelledId && item !== cancelledId,
          )
        : currentAccepted;

      return {
        ...state,
        loading: false,
        cancelledBookingResult: action.data,
        vendorBookings: {
          ...(state.vendorBookings || {}),
          panding: updatedPanding,
          accepted: updatedAccepted,
        },
        error: null,
      };
    }
    case TYPES.CANCEL_CUSTOMER_BOOKING_SUCCESS: {
      const cancelledId =
        action.data?._id || action.data?.id || action.data?.bookingId;
      const currentAccepted = state.customerBookings?.accepted;

      const updatedAccepted = Array.isArray(currentAccepted)
        ? currentAccepted.filter(
            item =>
              (item._id || item.id) !== cancelledId && item !== cancelledId,
          )
        : currentAccepted;

      return {
        ...state,
        loading: false,
        cancelledCustomerBookingResult: action.data,
        customerBookings: {
          ...(state.customerBookings || {}),
          accepted: updatedAccepted,
        },
        error: null,
      };
    }
    case TYPES.RESEND_OTP_VENDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case TYPES.LOGIN_CUSTOMER_FAILED:
    case TYPES.LOGIN_VENDOR_FAILED:
    case TYPES.REGISTER_VENDOR_FAILED:
    case TYPES.VERIFY_OTP_CUSTOMER_FAILED:
    case TYPES.VERIFY_OTP_VENDOR_FAILED:
    case TYPES.UPDATE_USER_CUSTOMER_FAILED:
    case TYPES.UPDATE_VENDOR_PROFILE_FAILED:
    case TYPES.SAVE_BUSINESS_ADDRESS_FAILED:
    case TYPES.SAVE_VENDOR_SERVICES_FAILED:
    case TYPES.GET_VENDOR_SERVICES_BY_CATEGORY_FAILED:
    case TYPES.GET_VENDOR_USER_DETAILS_FAILED:
    case TYPES.GET_MY_AVAILABILITY_FAILED:
    case TYPES.UPDATE_MY_AVAILABILITY_FAILED:
    case TYPES.UPDATE_USER_LOCATION_FAILED:
    case TYPES.SAVE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.UPDATE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.GET_CUSTOMER_ADDRESSES_FAILED:
    case TYPES.DELETE_CUSTOMER_ADDRESS_FAILED:
    case TYPES.CREATE_BOOKING_FAILED:
    case TYPES.GET_BOOKING_BY_ID_FAILED:
    case TYPES.GET_VENDOR_BOOKINGS_FAILED:
    case TYPES.ACCEPT_VENDOR_BOOKING_FAILED:
    case TYPES.RESEND_OTP_VENDOR_FAILED:
    case TYPES.GET_CUSTOMER_BOOKINGS_FAILED:
    case TYPES.CANCEL_CUSTOMER_BOOKING_FAILED:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case TYPES.LOGOUT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default customerAuthReducer;
