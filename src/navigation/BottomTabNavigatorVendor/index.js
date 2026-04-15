import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image} from 'react-native';

import HomeScreen from '../../screen/customerAllScreen/homeScreen';
import BookingScreen from '../../screen/customerAllScreen/bookingScreen';
import ChatScreen from '../../screen/customerAllScreen/chatScreen';
import ProfileScreen from '../../screen/customerAllScreen/profileScreen';
import SettingScreen from '../../screen/customerAllScreen/settingScreen';

import {icons} from '../../assets';
import {fontFamily, hp} from '../../utils/helpers';
import VendorHomeScreen from '../../screen/vendorAllScreen/vendorHomeScreen';
import EarningsScreen from '../../screen/vendorAllScreen/earningsScreen';
import VendorProfileScreen from '../../screen/vendorAllScreen/vendorProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigatorVendor = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: hp(60),
          paddingBottom: 10,
          paddingTop: 6,
          borderTopWidth: 1,
          elevation: 8,
        },

        tabBarActiveTintColor: '#731EE2',
        tabBarInactiveTintColor: '#726286',

        tabBarLabelStyle: {
          fontSize: hp(10),
          marginTop: 2,
          fontFamily: fontFamily.poppins400,
        },

        tabBarIcon: ({color}) => {
          let icon;

          switch (route.name) {
            case 'Home':
              icon = icons.home_Icon;
              break;
            case 'Bookings':
              icon = icons.bookings_Icon;
              break;
            case 'Earnings':
              icon = icons.wallet_Icon;
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
      <Tab.Screen name="Home" component={VendorHomeScreen} />
      <Tab.Screen name="Bookings" component={BookingScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={VendorProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigatorVendor;
