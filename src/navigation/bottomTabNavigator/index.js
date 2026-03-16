import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image} from 'react-native';

import HomeScreen from '../../screen/customerAllScreen/homeScreen';
import BookingScreen from '../../screen/customerAllScreen/bookingScreen';
import ChatScreen from '../../screen/customerAllScreen/chatScreen';
import ProfileScreen from '../../screen/customerAllScreen/profileScreen';
import {icons} from '../../assets';
import {fontFamily, hp} from '../../utils/helpers';
import BookingServiceScreen from '../../screen/customerAllScreen/bookingServiceScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: hp(60), // increase tab height
          paddingBottom: 10, // space at bottom
          paddingTop: 6,
          borderTopWidth: 1,
          elevation: 8,
        },

        tabBarActiveTintColor: '#731EE2',
        tabBarInactiveTintColor: '#726286',

        // 👇 Label Font Style
        tabBarLabelStyle: {
          fontSize: hp(10), // change font size here
          marginTop: 2,
          fontFamily: fontFamily.poppins400,
        },

        tabBarIcon: ({focused, color}) => {
          let icon;

          switch (route.name) {
            case 'Home':
              icon = icons.home_Icon;
              break;
            case 'Bookings':
              icon = icons.bookings_Icon;
              break;
            case 'Chat':
              icon = icons.chat_Icon;
              break;
            case 'Profile':
              icon = icons.profile_Icon;
              break;
            default:
              icon = icons.home_Icon;
          }

          return (
            <Image
              source={icon}
              style={{
                width: hp(16),
                height: hp(16),
                tintColor: color,
              }}
            />
          );
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

      <Tab.Screen
        name="BookingServiceScreen"
        component={BookingServiceScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: {display: 'none'},
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
