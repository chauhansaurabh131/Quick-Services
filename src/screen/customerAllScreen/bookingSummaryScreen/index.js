import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import {colors} from '../../../utils/colors';
import {icons} from '../../../assets';
import {hp, fontSize, fontFamily, wp} from '../../../utils/helpers';
import {useNavigation} from '@react-navigation/native';
import SwitchButton from '../../../components/switchButton';
import {Calendar} from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

const BookingSummaryScreen = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const navigation = useNavigation();

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // FORMAT DATE → DD-MM-YYYY
  const formatDate = dateString => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  // FORMAT TIME → AM/PM
  const formatTime = date => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      <View
        style={{
          height: hp(50),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* Back Arrow */}
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

        {/* Title */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins400,
          }}>
          Booking Summary
        </Text>
      </View>

      <View
        style={{width: '100%', height: hp(1), backgroundColor: '#E3E3E3'}}
      />

      <ScrollView>
        <View style={{marginTop: hp(18), marginHorizontal: wp(18)}}>
          <Text
            style={{
              color: colors.pureBlack,
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins500,
            }}>
            Service Details
          </Text>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: hp(18),
              marginBottom: hp(16),
              borderWidth: 1,
              borderColor: '#E8E8E8',
              overflow: 'hidden',
              marginTop: hp(10),
            }}>
            {/* Image */}
            <View>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
                }}
                style={{
                  width: '100%',
                  height: hp(120),
                  resizeMode: 'cover',
                }}
              />

              {/* Rating */}
              <View
                style={{
                  position: 'absolute',
                  top: hp(10),
                  left: wp(12),
                  backgroundColor: '#1C1C1C',
                  borderRadius: hp(50),
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: wp(12),
                  paddingVertical: hp(5),
                }}>
                <Image
                  source={icons.star_Icon}
                  style={{
                    width: hp(14),
                    height: hp(14),
                    resizeMode: 'contain',
                    marginRight: wp(8),
                    top: -2,
                  }}
                />

                <Text
                  style={{
                    color: colors.white,
                    fontSize: fontSize(11),
                    fontFamily: fontFamily.poppins600,
                    top: 2,
                  }}>
                  4.6
                </Text>
              </View>
            </View>

            {/* Content */}
            <View style={{padding: wp(14)}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: fontFamily.poppins600,
                    fontSize: fontSize(19),
                    color: colors.pureBlack,
                  }}>
                  Star Unisex Saloon
                </Text>

                {/*<Text*/}
                {/*  style={{*/}
                {/*    fontFamily: fontFamily.poppins600,*/}
                {/*    fontSize: fontSize(12),*/}
                {/*    color: 'black',*/}
                {/*  }}>*/}
                {/*  {item.price}*/}
                {/*</Text>*/}

                <Image
                  source={icons.verified_Icon}
                  style={{
                    width: hp(15),
                    height: hp(15),
                    resizeMode: 'contain',
                    marginLeft: wp(8),
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: fontFamily.poppins500,
                    fontSize: fontSize(14),
                    color: '#979797',
                    marginTop: hp(3),
                  }}>
                  Standard Hair Cut
                </Text>

                <Text
                  style={{
                    fontSize: fontSize(14),
                    fontFamily: fontFamily.poppins600,
                    color: colors.pureBlack,
                  }}>
                  Rs. 120
                </Text>
              </View>

              <View
                style={{
                  width: '100%',
                  height: hp(1),
                  backgroundColor: '#E6E6E6',
                  marginTop: hp(13),
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: hp(10),
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <Image
                    source={icons.timer_Icon}
                    style={{
                      width: hp(12),
                      height: hp(12),
                      resizeMode: 'contain',
                    }}
                  />
                  <Text
                    style={{
                      fontSize: fontSize(14),
                      fontFamily: fontFamily.poppins500,
                      color: '#757575',
                      marginLeft: wp(11),
                      top: 1.5,
                    }}>
                    ETA : 20 Mins
                  </Text>
                </View>

                <TouchableOpacity activeOpacity={0.6}>
                  <Text
                    style={{
                      color: '#731EE2',
                      fontFamily: fontFamily.poppins600,
                      fontSize: fontSize(14),
                      marginRight: wp(7),
                      top: 1,
                    }}>
                    View Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/*Date Time Schedule*/}

          <View
            style={{
              marginTop: hp(10),
              flexDirection: 'row',
              // backgroundColor: 'orange',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: colors.pureBlack,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              Date & Time
            </Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  color: colors.primaryColor,
                  fontSize: fontSize(14),
                  fontFamily: fontFamily.poppins500,
                  marginRight: wp(9),
                }}>
                Schedule?
              </Text>
              <SwitchButton value={isEnabled} onChange={v => setIsEnabled(v)} />
            </View>
          </View>

          <View style={{marginTop: hp(20)}}>
            {!isEnabled ? (
              <TouchableOpacity
                activeOpacity={0.6}
                style={{
                  width: '100%',
                  height: hp(87),
                  borderColor: '#E8E8E8',
                  borderWidth: hp(1),
                  borderRadius: hp(18),
                  justifyContent: 'center',
                  backgroundColor: colors.white,
                  paddingHorizontal: wp(18),
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View
                    style={{
                      width: hp(45),
                      height: hp(45),
                      borderRadius: hp(50),
                      backgroundColor: '#F6F0FF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={icons.motor_Cycle_Icon}
                      style={{
                        width: wp(20),
                        height: hp(14),
                        resizeMode: 'contain',
                      }}
                    />
                  </View>

                  <View style={{marginLeft: wp(19)}}>
                    <Text
                      style={{
                        color: colors.pureBlack,
                        fontSize: fontSize(16),
                        fontFamily: fontFamily.poppins600,
                      }}>
                      Now
                    </Text>
                    <Text
                      style={{
                        color: colors.primaryColor,
                        fontSize: fontSize(14),
                        fontFamily: fontFamily.poppins500,
                      }}>
                      ETA 20-30 mins.
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => setDateModalVisible(true)}
                  style={{
                    width: '100%',
                    height: hp(87),
                    borderColor: '#E8E8E8',
                    borderWidth: hp(1),
                    borderRadius: hp(18),
                    justifyContent: 'center',
                    backgroundColor: colors.white,
                    paddingHorizontal: wp(18),
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={{
                        width: hp(45),
                        height: hp(45),
                        borderRadius: hp(50),
                        backgroundColor: '#F6F0FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        source={icons.calendar_Icon}
                        style={{
                          width: wp(14),
                          height: hp(15),
                          resizeMode: 'contain',
                        }}
                      />
                    </View>

                    <View style={{marginLeft: wp(19)}}>
                      <Text
                        style={{
                          color: colors.pureBlack,
                          fontSize: fontSize(16),
                          fontFamily: fontFamily.poppins600,
                        }}>
                        {selectedDate
                          ? formatDate(selectedDate)
                          : 'Select Date'}
                      </Text>
                    </View>

                    <View style={{position: 'absolute', right: 0}}>
                      <Image
                        source={icons.bottom_Arrow_Icon}
                        style={{
                          width: wp(12),
                          height: hp(10),
                          resizeMode: 'contain',
                          transform: [{rotate: '-90deg'}],
                        }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => {
                    if (!selectedDate) {
                      alert('Please select date first');
                      return;
                    }
                    setShowTimePicker(true); // ✅ open native picker
                  }}
                  style={{
                    width: '100%',
                    height: hp(87),
                    borderColor: '#E8E8E8',
                    borderWidth: hp(1),
                    borderRadius: hp(18),
                    justifyContent: 'center',
                    backgroundColor: colors.white,
                    paddingHorizontal: wp(18),
                    marginTop: hp(20),
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={{
                        width: hp(45),
                        height: hp(45),
                        borderRadius: hp(50),
                        backgroundColor: '#F6F0FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        source={icons.calendar_Icon}
                        style={{
                          width: wp(20),
                          height: hp(14),
                          resizeMode: 'contain',
                        }}
                      />
                    </View>

                    <View style={{marginLeft: wp(19)}}>
                      <Text
                        style={{
                          color: colors.pureBlack,
                          fontSize: fontSize(16),
                          fontFamily: fontFamily.poppins600,
                        }}>
                        {selectedTime ? selectedTime : 'Select Time'}
                      </Text>
                    </View>

                    <View style={{position: 'absolute', right: 0}}>
                      <Image
                        source={icons.bottom_Arrow_Icon}
                        style={{
                          width: wp(12),
                          height: hp(10),
                          resizeMode: 'contain',
                          transform: [{rotate: '-90deg'}],
                        }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text
            style={{
              color: colors.pureBlack,
              marginTop: hp(24),
              fontSize: fontSize(16),
              fontFamily: fontFamily.poppins500,
            }}>
            Price Breakdown
          </Text>

          <View
            style={{
              width: '100%',
              height: hp(191),
              borderWidth: 1.5,
              borderColor: '#E8E8E8',
              borderRadius: hp(18),
              marginTop: hp(20),
            }}>
            <View style={{marginTop: hp(15), marginHorizontal: wp(20)}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
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
                    color: 'black',
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
                  marginTop: hp(10),
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
                    color: 'black',
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
                  marginTop: hp(10),
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
                    color: 'black',
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
                  backgroundColor: '#E8E8E8',
                  marginTop: hp(20),
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: hp(18),
                }}>
                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  Total Payable
                </Text>
                <Text
                  style={{
                    color: colors.primaryColor,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                  }}>
                  136.00
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Demo');
            }}
            activeOpacity={0.6}
            style={{
              width: '100%',
              height: hp(50),
              borderRadius: hp(50),
              backgroundColor: colors.primaryColor,
              marginTop: hp(24),
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins400,
              }}>
              Confirm & Book
            </Text>

            <Image
              source={icons.back_Arrow_Icon}
              style={{
                width: hp(14),
                height: hp(14),
                tintColor: colors.white,
                transform: [{rotate: '180deg'}],
                marginLeft: wp(15),
                top: -2,
              }}
            />
          </TouchableOpacity>

          <View style={{alignItems: 'center', marginTop: hp(24)}}>
            <Text
              style={{
                color: '#6E6E6E',
                fontSize: fontSize(13),
                fontFamily: fontFamily.poppins400,
              }}>
              By tapping “Confirm & Book, you agree our
            </Text>
            <Text
              style={{
                color: '#6E6E6E',
                fontSize: fontSize(13),
                fontFamily: fontFamily.poppins400,
              }}>
              Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>

        <View style={{height: hp(30)}} />
      </ScrollView>

      {/* DATE MODAL */}
      <Modal visible={dateModalVisible} transparent animationType="none">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setDateModalVisible(false)}>
          <Pressable
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
            onPress={e => e.stopPropagation()}>
            <Calendar
              minDate={today}
              onDayPress={day => {
                setSelectedDate(day.dateString);
                setDateModalVisible(false);
              }}
              markedDates={{
                ...(selectedDate && {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: '#6C2BD9',
                    selectedTextColor: '#fff',
                  },
                }),
              }}
              theme={{
                selectedDayBackgroundColor: '#6C2BD9',
                todayTextColor: '#6C2BD9',
                arrowColor: '#6C2BD9',
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* TIME PICKER (NATIVE) */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="clock"
          onChange={(event, date) => {
            setShowTimePicker(false);

            if (event.type === 'set' && date) {
              setSelectedTime(formatTime(date));
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default BookingSummaryScreen;
