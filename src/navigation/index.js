import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screen/customerAllScreen/loginScreen';
import DemoScreen from '../screen/customerAllScreen/demoScreen';
import OtpVerificationScreen from '../screen/customerAllScreen/otpVerificationScreen';
import BasicInfoScreen from '../screen/customerAllScreen/basicInfoScreen';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
