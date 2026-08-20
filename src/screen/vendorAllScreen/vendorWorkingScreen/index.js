import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {colors} from '../../../utils/colors';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {icons} from '../../../assets';
import {useNavigation} from '@react-navigation/native';
import SwitchButton from '../../../components/switchButton';
import {
  getMyAvailability,
  updateMyAvailability,
} from '../../../actions/customerAuthActions';

const VendorWorkingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {vendorAvailability, loading} = useSelector(state => state.auth || {});

  const [online, setOnline] = useState(false);
  const [instantVisit, setInstantVisit] = useState(true);
  const [visitBySchedule, setVisitBySchedule] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [schedule, setSchedule] = useState([
    {day: 'Monday', enabled: true},
    {day: 'Tuesday', enabled: true},
    {day: 'Wednesday', enabled: true},
    {day: 'Thursday', enabled: true},
    {day: 'Friday', enabled: true},
    {day: 'Saturday', enabled: true},
    {day: 'Sunday', enabled: true},
  ]);

  const syncStateFromData = useCallback(data => {
    if (!data) {
      return;
    }

    // 1. Store Status / Online status
    if (data.storeStatus) {
      setOnline(data.storeStatus.toLowerCase() === 'online');
    } else if (data.isOnline !== undefined) {
      setOnline(Boolean(data.isOnline));
    }

    // 2. Booking Option ("instant" vs "schedule")
    if (data.bookingOption) {
      const opt = String(data.bookingOption).toLowerCase();
      if (opt === 'instant') {
        setInstantVisit(true);
        setVisitBySchedule(false);
      } else if (opt === 'schedule') {
        setInstantVisit(false);
        setVisitBySchedule(true);
      } else if (opt === 'both') {
        setInstantVisit(true);
        setVisitBySchedule(true);
      }
    }

    // 3. Weekly Schedule
    if (Array.isArray(data.weeklySchedule)) {
      setSchedule(prev =>
        prev.map(item => {
          const foundDay = data.weeklySchedule.find(
            d => d.day?.toLowerCase() === item.day.toLowerCase(),
          );
          return {
            ...item,
            enabled: foundDay ? Boolean(foundDay.isOpen) : item.enabled,
          };
        }),
      );
    }
  }, []);

  // Hydrate INSTANTLY if data is already in Redux
  useEffect(() => {
    if (vendorAvailability) {
      const data = vendorAvailability?.data || vendorAvailability;
      syncStateFromData(data);
    }
  }, [vendorAvailability, syncStateFromData]);

  // Background refetch on screen mount
  useEffect(() => {
    dispatch(
      getMyAvailability((error, response) => {
        if (!error && response) {
          const resData = response?.data || response;
          const data = resData?.data || resData;
          syncStateFromData(data);
        }
      }),
    );
  }, [dispatch, syncStateFromData]);

  const handleToggleOnline = v => {
    setOnline(v);
    console.log('[VendorWorkingScreen] Updating isOnline status:', v);
    dispatch(
      updateMyAvailability({isOnline: v}, (err, res) => {
        if (err) {
          console.log(
            '[VendorWorkingScreen] Update isOnline status error:',
            err,
          );
        } else {
          console.log(
            '[VendorWorkingScreen] Update isOnline status success:',
            res,
          );
        }
      }),
    );
  };

  const handleToggleInstant = value => {
    if (value) {
      setInstantVisit(true);
      setVisitBySchedule(false);
    } else {
      setInstantVisit(false);
      setVisitBySchedule(true);
    }
  };

  const handleToggleSchedule = value => {
    if (value) {
      setVisitBySchedule(true);
      setInstantVisit(false);
    } else {
      setVisitBySchedule(false);
      setInstantVisit(true);
    }
  };

  const toggleDay = index => {
    const updated = [...schedule];
    updated[index].enabled = !updated[index].enabled;
    setSchedule(updated);
  };

  const handleSaveChanges = () => {
    setSaveLoading(true);
    const bookingOption = instantVisit ? 'instant' : 'schedule';
    const payload = {
      isOnline: online,
      bookingOption: bookingOption,
      weeklySchedule: schedule.map(s => ({
        day: s.day.toLowerCase(),
        isOpen: Boolean(s.enabled),
      })),
    };

    console.log(
      '[VendorWorkingScreen] Save Changes Payload for updateMyAvailability:',
      payload,
    );
    dispatch(
      updateMyAvailability(payload, (error, response) => {
        setSaveLoading(false);
        if (error) {
          Alert.alert(
            'Error',
            error?.message ||
              error?.msg ||
              'Failed to save availability settings',
          );
        } else {
          Alert.alert(
            'Success',
            'Working hours and availability saved successfully',
          );
        }
      }),
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.white}}>
      {/* HEADER */}
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
            style={{width: hp(14), height: hp(14)}}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(14),
            fontFamily: fontFamily.poppins500,
          }}>
          Working Hours
        </Text>
      </View>

      {/* Divider */}
      <View style={{height: 1, backgroundColor: '#E3E3E3'}} />

      {/* SCROLL CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(18),
          paddingBottom: hp(40),
        }}>
        {/* STORE STATUS */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            marginTop: hp(26),
          }}>
          Store Status
        </Text>

        <View
          style={{
            width: '100%',
            backgroundColor: '#FAFAFA',
            height: hp(76),
            borderRadius: hp(18),
            justifyContent: 'center',
            marginTop: hp(12),
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: wp(22),
            }}>
            <View>
              <Text
                style={{
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                  color: colors.pureBlack,
                }}>
                Status : {online ? 'Online' : 'Offline'}
              </Text>

              <Text
                style={{
                  fontSize: fontSize(12),
                  fontFamily: fontFamily.poppins400,
                  color: colors.pureBlack,
                }}>
                {online
                  ? 'Ready to accept booking'
                  : 'Currently not accepting bookings'}
              </Text>
            </View>

            <SwitchButton value={online} onChange={handleToggleOnline} />
          </View>
        </View>

        {/* BOOKING OPTIONS */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            marginTop: hp(24),
            marginBottom: hp(12),
          }}>
          Booking Options
        </Text>

        {/* Instant Visit Card */}
        <View
          style={{
            width: '100%',
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: '#EAEAEA',
            borderRadius: hp(18),
            paddingVertical: hp(14),
            paddingHorizontal: wp(18),
            marginBottom: hp(12),
          }}>
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
                marginRight: wp(10),
              }}>
              <View
                style={{
                  width: hp(42),
                  height: hp(42),
                  borderRadius: hp(21),
                  backgroundColor: '#F5EFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(14),
                }}>
                <Image
                  source={icons.quick_Book_Icon}
                  style={{
                    width: hp(20),
                    height: hp(20),
                    resizeMode: 'contain',
                    tintColor: '#731EE2',
                  }}
                />
              </View>

              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                    color: colors.pureBlack,
                  }}>
                  Instant Visit
                </Text>
                <Text
                  style={{
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                    color: '#737373',
                    marginTop: hp(2),
                  }}>
                  Customer requests a service immediately.
                </Text>
              </View>
            </View>

            <SwitchButton value={instantVisit} onChange={handleToggleInstant} />
          </View>
        </View>

        {/* Visit by Schedule Card */}
        <View
          style={{
            width: '100%',
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: '#EAEAEA',
            borderRadius: hp(18),
            paddingVertical: hp(14),
            paddingHorizontal: wp(18),
            marginBottom: hp(12),
          }}>
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
                marginRight: wp(10),
              }}>
              <View
                style={{
                  width: hp(42),
                  height: hp(42),
                  borderRadius: hp(21),
                  backgroundColor: '#F5EFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(14),
                }}>
                <Image
                  source={icons.purple_Home_Icon}
                  style={{
                    width: hp(20),
                    height: hp(20),
                    resizeMode: 'contain',
                    tintColor: '#731EE2',
                  }}
                />
              </View>

              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins600,
                    color: colors.pureBlack,
                  }}>
                  Visit by Schedule
                </Text>
                <Text
                  style={{
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins400,
                    color: '#737373',
                    marginTop: hp(2),
                  }}>
                  Customer selects a preferred date and time.
                </Text>
              </View>
            </View>

            <SwitchButton
              value={visitBySchedule}
              onChange={handleToggleSchedule}
            />
          </View>
        </View>

        {/* WEEKLY SCHEDULE */}
        <Text
          style={{
            color: colors.pureBlack,
            fontSize: fontSize(16),
            fontFamily: fontFamily.poppins600,
            marginTop: hp(20),
            marginBottom: hp(12),
          }}>
          Weekly Schedule
        </Text>

        {schedule.map((item, index) => (
          <View
            key={index}
            style={{
              width: '100%',
              height: hp(80),
              borderWidth: hp(1),
              borderRadius: hp(18),
              borderColor: '#EAEAEA',
              paddingVertical: hp(18),
              paddingHorizontal: wp(21),
              marginBottom: hp(12),
              backgroundColor: '#fff',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text
                  style={{
                    color: colors.pureBlack,
                    fontSize: fontSize(16),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  {item.day}
                </Text>

                <Text
                  style={{
                    color: colors.primaryColor,
                    fontSize: fontSize(12),
                    fontFamily: fontFamily.poppins500,
                  }}>
                  09:00 AM - 06:00 PM
                </Text>
              </View>

              <SwitchButton
                value={item.enabled}
                onChange={() => toggleDay(index)}
              />
            </View>
          </View>
        ))}

        {/* SAVE BUTTON */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleSaveChanges}
          disabled={saveLoading}
          style={{
            width: '100%',
            height: hp(50),
            backgroundColor: colors.primaryColor,
            borderRadius: hp(50),
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: hp(27),
          }}>
          {saveLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text
              style={{
                color: colors.white,
                fontSize: fontSize(16),
                fontFamily: fontFamily.poppins500,
              }}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VendorWorkingScreen;
