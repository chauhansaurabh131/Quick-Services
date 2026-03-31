import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import {fontFamily, fontSize, hp, wp} from '../../../utils/helpers';
import {colors} from '../../../utils/colors';
import {icons} from '../../../assets';

const DemoScreen = () => {
  // STATES
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
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{paddingHorizontal: 16, marginTop: hp(20)}}>
        {/* SELECT DATE */}
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
                style={{width: wp(14), height: hp(15)}}
              />
            </View>

            <View style={{marginLeft: wp(19)}}>
              <Text
                style={{
                  color: colors.pureBlack,
                  fontSize: fontSize(16),
                  fontFamily: fontFamily.poppins600,
                }}>
                {selectedDate ? formatDate(selectedDate) : 'Select Date'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* SELECT TIME */}
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
                style={{width: wp(20), height: hp(14)}}
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
          </View>
        </TouchableOpacity>
      </View>

      {/* DATE MODAL */}
      <Modal visible={dateModalVisible} transparent animationType="slide">
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

export default DemoScreen;
