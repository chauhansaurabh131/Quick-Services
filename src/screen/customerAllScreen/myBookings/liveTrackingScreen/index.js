import React, {useRef, useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Animated,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {fontFamily, fontSize, hp, wp} from '../../../../utils/helpers';
import {colors} from '../../../../utils/colors';
import {icons, images} from '../../../../assets';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const TOTAL_TIME = 12 * 60; // 12 mins in seconds

const LiveTrackingScreen = () => {
  const refTrackingSheet = useRef();
  const refCancelSheet = useRef();

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [sheetHeight, setSheetHeight] = useState(hp(370));
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReason, setSelectedReason] = useState(0); // default first selected
  const [comment, setComment] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;

  const {t} = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ✅ Open BottomSheet
  useEffect(() => {
    const timer = setTimeout(() => {
      refTrackingSheet.current?.open();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Animate Progress
  useEffect(() => {
    const progressValue = 1 - timeLeft / TOTAL_TIME;

    Animated.timing(progress, {
      toValue: progressValue,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  // Convert seconds → minutes
  const minutes = Math.ceil(timeLeft / 60);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ✅ Handle More Details
  const handleMoreDetails = () => {
    refTrackingSheet.current.close();

    setTimeout(() => {
      setSheetHeight(hp(700));
      setShowDetails(true);
      refTrackingSheet.current.open();
    }, 300);
  };

  const handleCancelOrder = () => {
    refTrackingSheet.current.close();

    setTimeout(() => {
      refCancelSheet.current.open();
    }, 300);
  };

  const handleKeepOrder = () => {
    refCancelSheet.current.close();

    setTimeout(() => {
      refTrackingSheet.current.open();
    }, 300);
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
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
          }}>
          {t('live_tracking')}
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />
      {/* MAP PLACEHOLDER */}
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'black'}}>Maps Showing Here</Text>
      </View>

      {/* BOTTOM SHEET */}
      <RBSheet
        ref={refTrackingSheet}
        height={sheetHeight}
        openDuration={250}
        closeOnDragDown={true}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}>
        {/* TITLE */}
        <Text
          style={{
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            color: colors.pureBlack,
            alignSelf: 'center',
            marginTop: hp(32),
          }}>
          {timeLeft === 0
            ? `${t('arrived')} 🎉`
            : `${t('arriving_in')} ${minutes} ${t('mins')}`}
        </Text>

        {/* STATUS ROW */}
        <View style={{paddingHorizontal: wp(17)}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp(15),
              marginTop: hp(56),
            }}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}>
              {t('service_status')}
            </Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={icons.motor_Cycle_Icon}
                style={{
                  width: hp(15),
                  height: hp(10),
                  resizeMode: 'contain',
                  marginRight: wp(8),
                }}
              />
              <Text
                style={{
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins400,
                  color: colors.primaryColor,
                }}>
                {t('on_the_way')}
              </Text>
            </View>
          </View>

          {/* PROGRESS BAR BACKGROUND */}
          <View
            style={{
              height: hp(10),
              backgroundColor: '#EFE8FF',
              borderRadius: hp(10),
              overflow: 'hidden',
            }}>
            {/* PROGRESS FILL */}
            <Animated.View
              style={{
                height: hp(10),
                backgroundColor: colors.primaryColor,
                width: widthInterpolate,
                borderRadius: hp(10), // ✅ ADD THIS
              }}
            />
          </View>

          {/*Service Details*/}

          <View
            style={{
              marginTop: hp(38),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between', // ✅ IMPORTANT
            }}>
            {/* LEFT SIDE (Image + Text) */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={images.demo_User_Img}
                style={{
                  width: hp(44),
                  height: hp(44),
                  resizeMode: 'contain',
                  borderRadius: hp(10),
                }}
              />

              <View style={{marginLeft: wp(15)}}>
                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins700,
                  }}>
                  Raj Kushwaha
                </Text>

                <Text
                  style={{
                    color: '#8C8C8C',
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  Service Professional
                </Text>
              </View>
            </View>

            {/* RIGHT SIDE BUTTONS */}
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                activeOpacity={0.6}
                style={{
                  width: hp(45),
                  height: hp(45),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(10), // ✅ spacing
                }}>
                <Image
                  source={icons.call_Icon}
                  style={{width: hp(14), height: hp(14), resizeMode: 'contain'}}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.6}
                style={{
                  width: hp(45),
                  height: hp(45),
                  borderRadius: hp(50),
                  backgroundColor: '#F6F0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={icons.message_Icon}
                  style={{width: hp(15), height: hp(15), resizeMode: 'contain'}}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* MORE DETAILS BUTTON */}
          {!showDetails && (
            <TouchableOpacity
              onPress={handleMoreDetails}
              style={{
                height: hp(50),
                backgroundColor: '#FAF6FF',
                borderRadius: hp(25),
                marginTop: hp(42),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: colors.primaryColor,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('more_details')}
              </Text>
            </TouchableOpacity>
          )}

          {/* ORDER SUMMARY */}
          {showDetails && (
            <View style={{marginTop: hp(30)}}>
              <View
                style={{
                  height: 1,
                  backgroundColor: '#E2E2E2',
                  marginBottom: hp(25),
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    color: '#404040',
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {t('order_summary')}
                </Text>
                <Text
                  style={{
                    color: colors.primaryColor,
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  #03021122
                </Text>
              </View>

              <View
                style={{
                  width: '100%',
                  backgroundColor: '#F9FAFB',
                  borderRadius: hp(18),
                  marginTop: hp(23),
                }}>
                <View style={{padding: wp(20)}}>
                  <Text
                    style={{
                      color: colors.pureBlack,
                      fontSize: fontSize(16),
                      fontFamily: fontFamily.poppins600,
                    }}>
                    {t('priceSummary')}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: hp(14),
                    }}>
                    <Text
                      style={{
                        color: '#6E6E6E',
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins400,
                      }}>
                      Standard Haircut Fee
                    </Text>

                    <Text
                      style={{
                        color: '#6E6E6E',
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins400,
                      }}>
                      120.00
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: hp(5),
                    }}>
                    <Text
                      style={{
                        color: '#6E6E6E',
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins400,
                      }}>
                      Service Fee (5%)
                    </Text>

                    <Text
                      style={{
                        color: '#6E6E6E',
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins400,
                      }}>
                      6.00
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: hp(5),
                    }}>
                    <Text
                      style={{
                        color: '#6E6E6E',
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins400,
                      }}>
                      Taxes
                    </Text>

                    <Text
                      style={{
                        color: '#6E6E6E',
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins400,
                      }}>
                      6.00
                    </Text>
                  </View>

                  <View
                    style={{
                      width: '100%',
                      height: hp(1),
                      backgroundColor: '#DFDFDF',
                      marginTop: hp(12),
                      marginBottom: hp(12),
                    }}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        color: colors.pureBlack,
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins500,
                      }}>
                      {t('totalPayable')}
                    </Text>

                    <Text
                      style={{
                        color: colors.pureBlack,
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins500,
                      }}>
                      136.00
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                style={{
                  width: '100%',
                  height: hp(50),
                  borderRadius: hp(25),
                  backgroundColor: colors.primaryColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: hp(20),
                }}>
                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins400,
                  }}>
                  {t('share_details')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleCancelOrder}
                style={{alignItems: 'center', marginTop: hp(22)}}>
                <Text
                  style={{
                    color: '#D33926',
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  {t('cancel_order')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </RBSheet>

      {/*Order Cancel BottomSheet*/}
      <RBSheet
        ref={refCancelSheet}
        height={hp(610)}
        openDuration={250}
        closeOnDragDown={true}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: wp(16),
          },
        }}>
        <Text
          style={{
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            color: colors.pureBlack,
            textAlign: 'center',
            marginBottom: hp(10),
            marginTop: hp(10),
          }}>
          {t('cancel_order')}?
        </Text>

        <Text
          style={{
            textAlign: 'center',
            color: '#747474',
            marginBottom: hp(20),
            fontSize: fontSize(12),
            fontFamily: fontFamily.poppins400,
          }}>
          {t('cancel_description')}
        </Text>

        {/* OPTIONS */}
        {[
          'change_my_mind',
          'wait_time_too_long',
          'order_by_mistake',
          'other',
        ].map((item, index) => {
          const isSelected = selectedReason === index;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedReason(index);
                if (index !== 3) {
                  setComment('');
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: hp(10),
              }}>
              {/* OUTER CIRCLE */}
              <View
                style={{
                  width: hp(20),
                  height: hp(20),
                  borderRadius: hp(10),
                  borderWidth: hp(1.5),
                  borderColor: isSelected ? colors.pureBlack : '#999',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(16),
                }}>
                {/* INNER DOT */}
                {isSelected && (
                  <View
                    style={{
                      width: hp(10),
                      height: hp(10),
                      borderRadius: hp(5),
                      backgroundColor: colors.pureBlack, // ✅ black dot
                    }}
                  />
                )}
              </View>

              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                {t(item)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {selectedReason === 3 && (
          <View style={{marginTop: hp(20)}}>
            {/* Label */}
            <Text
              style={{
                color: colors.primaryColor,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
                marginBottom: hp(10),
              }}>
              {t('comments')}
            </Text>

            {/* Input Box */}
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('write_reason')}
              placeholderTextColor="#999"
              multiline
              style={{
                height: hp(100),
                borderRadius: hp(15),
                borderWidth: hp(1),
                borderColor: '#C7C7C7',
                padding: hp(10),
                textAlignVertical: 'top', // ✅ important for multiline
                color: colors.pureBlack,
                fontSize: fontSize(14),
                fontFamily: fontFamily.poppins400,
              }}
            />
          </View>
        )}

        {!isKeyboardVisible && (
          <View style={{marginTop: selectedReason === 3 ? hp(26) : hp(182)}}>
            <TouchableOpacity
              onPress={() => {
                refCancelSheet.current.close();
                refTrackingSheet.current.close();
              }}
              activeOpacity={0.6}
              style={{
                width: '100%',
                height: hp(50),
                borderRadius: hp(25),
                backgroundColor: colors.primaryColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: colors.white,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins400,
                }}>
                {t('confirm_cancellation')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleKeepOrder}
              style={{alignItems: 'center', marginTop: hp(20)}}>
              <Text
                style={{
                  color: colors.primaryColor,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins500,
                }}>
                {t('keep_order')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </RBSheet>
    </SafeAreaView>
  );
};

export default LiveTrackingScreen;
