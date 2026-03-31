import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screen/customerAllScreen/loginScreen';
import DemoScreen from '../screen/customerAllScreen/demoScreen';
import OtpVerificationScreen from '../screen/customerAllScreen/otpVerificationScreen';
import BasicInfoScreen from '../screen/customerAllScreen/basicInfoScreen';
import HomeScreen from '../screen/customerAllScreen/homeScreen';
import BottomTabNavigator from './bottomTabNavigator';
import BookingServiceScreen from '../screen/customerAllScreen/bookingServiceScreen';
import BookingSummaryScreen from '../screen/customerAllScreen/bookingSummaryScreen';
import SettingScreen from '../screen/customerAllScreen/settingScreen';
import MyBookingScreen from '../screen/customerAllScreen/myBookings/myBookingScreen ';
import HelpSupportScreen from '../screen/customerAllScreen/help&SupportScreen';
import BookingIssueScreen from '../screen/customerAllScreen/bookingIssueScreen';
import EnterCompleteAddressScreen from '../screen/customerAllScreen/enterCompleteAddressScreen';
import ManageAddressesScreen from '../screen/customerAllScreen/manageAddressesScreen';
import ServiceCompletedScreen from '../screen/customerAllScreen/myBookings/serviceCompletedScreen';
import LiveTrackingScreen from '../screen/customerAllScreen/myBookings/liveTrackingScreen';
import ServiceCancelledScreen from '../screen/customerAllScreen/myBookings/serviceCancelledScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />

        <Stack.Screen
          name="OtpVerificationScreen"
          component={OtpVerificationScreen}
        />
        <Stack.Screen name="BasicInfoScreen" component={BasicInfoScreen} />

        {/* Bottom Tabs */}
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />

        <Stack.Screen
          name="BookingSummaryScreen"
          component={BookingSummaryScreen}
        />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />

        <Stack.Screen name="MyBookingScreen" component={MyBookingScreen} />

        <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />

        <Stack.Screen
          name="BookingIssueScreen"
          component={BookingIssueScreen}
        />

        <Stack.Screen
          name="ManageAddressesScreen"
          component={ManageAddressesScreen}
        />
        <Stack.Screen
          name="EnterCompleteAddressScreen"
          component={EnterCompleteAddressScreen}
        />

        <Stack.Screen
          name="ServiceCompletedScreen"
          component={ServiceCompletedScreen}
        />

        <Stack.Screen
          name="LiveTrackingScreen"
          component={LiveTrackingScreen}
        />

        <Stack.Screen
          name="ServiceCancelledScreen"
          component={ServiceCancelledScreen}
        />

        <Stack.Screen name="Demo" component={DemoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
