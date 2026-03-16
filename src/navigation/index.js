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

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Demo" component={DemoScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
