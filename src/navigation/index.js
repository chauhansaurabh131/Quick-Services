import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import LoginScreen from '../screen/customerAllScreen/loginScreen';
import DemoScreen from '../screen/customerAllScreen/demoScreen';
import OtpVerificationScreen from '../screen/customerAllScreen/otpVerificationScreen';
import BasicInfoScreen from '../screen/customerAllScreen/basicInfoScreen';
import BottomTabNavigator from './bottomTabNavigator';
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
import AccountTypeScreen from '../screen/accountTypeScreen';
import VendorBasicInfoScreen from '../screen/vendorAllScreen/vendorBasicInfoScreen';
import VendorBusinessAddressScreen from '../screen/vendorAllScreen/vendorBusinessAddressScreen';
import KycDetailsScreen from '../screen/vendorAllScreen/kycDetailsScreen';

import FaceCaptureScreen from '../screen/customerAllScreen/demoScreen/FaceCaptureScreen';
import VendorServiceAndPricingScreen from '../screen/vendorAllScreen/vendorServiceAndPricingScreen';
import VendorBankDetailsPayoutsScreen from '../screen/vendorAllScreen/vendorBankDetailsPayoutsScreen';
import BottomTabNavigatorVendor from './BottomTabNavigatorVendor';
import VendorWorkingScreen from '../screen/vendorAllScreen/vendorWorkingScreen';
import VendorReviewsFeedbackScreen from '../screen/vendorAllScreen/VendorReviewsFeedbackScreen';
import VendorSecuritySettingsScreen from '../screen/vendorAllScreen/vendorSecuritySettingsScreen';
import VendorChooseRegistrationScreen from '../screen/vendorAllScreen/vendorChooseRegistrationScreen';
import VendorRegistrationScreen from '../screen/vendorAllScreen/vendorRegistrationScreen';
import VendorOtpVerificationScreen from '../screen/vendorAllScreen/vendorOtpVerificationScreen';
import VendorSetPasswordScreen from '../screen/vendorAllScreen/vendorSetPasswordScreen';
import VendorLoginScreen from '../screen/vendorAllScreen/vendorLoginScreen';
import VendorResetPasswordScreen from '../screen/vendorAllScreen/vendorResetPasswordScreen';
import VendorWatchAndConfirmVerificationScreen from '../screen/vendorAllScreen/vendorWatchAndConfirmVerificationScreen';
import LegalAcknowledgementAndConsentScreen from '../screen/vendorAllScreen/legalAcknowledgementAndConsentScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const {isLoggedIn, user} = useSelector(state => state.auth || {});

  const isVendor =
    user?.role === 'vendor' ||
    user?.user?.role === 'vendor' ||
    user?.data?.role === 'vendor' ||
    user?.data?.user?.role === 'vendor';

  const initialRoute = isLoggedIn
    ? isVendor
      ? 'VendorApp'
      : 'MainApp'
    : 'AccountTypeScreen';

  React.useEffect(() => {
    if (isLoggedIn) {
      console.log('========================================================');
      console.log(
        'ACTIVE USER DATA (REDUX STATE):',
        JSON.stringify(user, null, 2),
      );
      console.log('========================================================');
    }
  }, [isLoggedIn, user]);

  console.log('====___isLoggedIn===>', user);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{headerShown: false}}>
        {/*<Stack.Screen*/}
        {/*  name="VendorServiceAndPricingScreen"*/}
        {/*  component={VendorServiceAndPricingScreen}*/}
        {/*/>*/}
        <Stack.Screen name="AccountTypeScreen" component={AccountTypeScreen} />

        <Stack.Screen name="Login" component={LoginScreen} />

        <Stack.Screen
          name="OtpVerificationScreen"
          component={OtpVerificationScreen}
        />

        <Stack.Screen name="VendorLoginScreen" component={VendorLoginScreen} />

        <Stack.Screen name="BasicInfoScreen" component={BasicInfoScreen} />

        <Stack.Screen
          name="VendorChooseRegistrationScreen"
          component={VendorChooseRegistrationScreen}
        />

        <Stack.Screen
          name="VendorResetPasswordScreen"
          component={VendorResetPasswordScreen}
        />

        <Stack.Screen
          name="VendorRegistrationScreen"
          component={VendorRegistrationScreen}
        />

        <Stack.Screen
          name="VendorOtpVerificationScreen"
          component={VendorOtpVerificationScreen}
        />

        <Stack.Screen
          name="VendorSetPasswordScreen"
          component={VendorSetPasswordScreen}
        />

        <Stack.Screen
          name="VendorBasicInfoScreen"
          component={VendorBasicInfoScreen}
        />

        <Stack.Screen
          name="VendorBusinessAddressScreen"
          component={VendorBusinessAddressScreen}
        />

        <Stack.Screen name="KycDetailsScreen" component={KycDetailsScreen} />
        <Stack.Screen name="FaceCaptureScreen" component={FaceCaptureScreen} />

        <Stack.Screen
          name="VendorServiceAndPricingScreen"
          component={VendorServiceAndPricingScreen}
        />

        <Stack.Screen
          name="VendorBankDetailsPayoutsScreen"
          component={VendorBankDetailsPayoutsScreen}
        />

        <Stack.Screen
          name="VendorWatchAndConfirmVerificationScreen"
          component={VendorWatchAndConfirmVerificationScreen}
        />

        <Stack.Screen
          name="LegalAcknowledgementAndConsentScreen"
          component={LegalAcknowledgementAndConsentScreen}
        />

        {/* Bottom Tabs */}
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />

        <Stack.Screen name="VendorApp" component={BottomTabNavigatorVendor} />

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

        <Stack.Screen
          name="VendorWorkingScreen"
          component={VendorWorkingScreen}
        />

        <Stack.Screen
          name="VendorReviewsFeedbackScreen"
          component={VendorReviewsFeedbackScreen}
        />

        <Stack.Screen
          name="VendorSecuritySettingsScreen"
          component={VendorSecuritySettingsScreen}
        />

        <Stack.Screen name="Demo" component={DemoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
