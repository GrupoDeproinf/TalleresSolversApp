import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/auth/login';
import SignUp from '../screens/auth/signUp';
import ForgetPassword from '../screens/auth/forgotPassword';
import OtpVerfication from '../screens/auth/verificationCode';
import ResetPassword from '../screens/auth/resetPassword';
import HomeScreenTwo from '../screens/homeScreenTwo';
import CategoryDetail from '../screens/categoryScreen/CategoryDetail';
import LoaderScreen from '../screens/loaderScreen';
import NotificationScreen from '../screens/notification';
import MyWhishList from '../screens/myWhishList';
import NotificationContainer from '../screens/notification/notificationDesc';
import WhishlitContainer from '../screens/myWhishList/whishlistScreen';
import EditProfile from '../screens/profileScreen/editProfile';
import TallerProfileScreen from '../screens/profileScreen/tallerProfileScreen';
import OrderHistory from '../screens/profileScreen/orderHistory';
import OfferScreen from '../screens/offerScreen';
import Settings from '../screens/profileScreen/notificationSetting';
import PaymentScreen from '../screens/profileScreen/paymentScreen';
import ChangePasswordScreen from '../screens/changePassword';
import AddressScreen from '../screens/profileScreen/addressScreen';
import AddtocartOne from '../screens/addtocartOne';
import AddToCartTwo from '../screens/addtoCartTwo';
import ChangeAddressScreen from '../screens/changeAddress';
import CheckoutScreen from '../screens/checkOut';
import Splash from '../screens/intro/splash';
import RatingScreen from '../screens/ratingScreen';
import ProductDetailOne from '../screens/productScreen/productDetailOne';
import CategoryTwo from '../screens/categoryTwo';
import VoucherScreen from '../screens/voucherScreen';
import ProductDetailTwo from '../screens/productScreen/productDetailTwo';
import OrderStatus from '../screens/orderStatus';
import ProductDetailThree from '../screens/productScreen/productDetailThree';
import DrawerScreen from '../drawer';
import Onboarding from '../screens/intro/onBording';
import OnboardingTwo from '../screens/intro/onBordingTwo';
import FormTaller from '../screens/FormTaller'
import FormService from '../screens/FormService'

import TalleresContainer from '../screens/Talleres'
import Planscreen from '../screens/profileScreen/planes';

import ReportarPago from '../screens/ReportarPago';

import ServiciosContainer from '../screens/Servicios'
import PlanesContainer from '../screens/PlanesTaller';

import TallerEditProfileScreen from '../screens/profileScreen/editProfileTaller';



const Stack = createNativeStackNavigator();
const MyStack = () => {
  // const [initialScreen, setInitialScreen] = useState();
  
  // const validator = () => {
  //   AsyncStorage.getItem('token').then((value) => {
  //     if (value !== null) {
  //       navigation.navigate('HomeScreenTwo');
  //     }
  //   });
  // }

  // useEffect(() => {
  //   validator()
  // }, [])
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='LoaderScreen' screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />

        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
        <Stack.Screen name="OtpVerfication" component={OtpVerfication} />
        <Stack.Screen name="CategoryDetail" component={CategoryDetail} />
        <Stack.Screen name="LoaderScreen" component={LoaderScreen} />
        <Stack.Screen name="DrawerScreen" component={DrawerScreen} />
        
        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
        />

        <Stack.Screen name="MyWhishList" component={MyWhishList} />

        <Stack.Screen
          name="NotificationContainer"
          component={NotificationContainer}
        />

        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />


        <Stack.Screen name="ReportarPago" component={ReportarPago} /> 
        <Stack.Screen name="ServiciosContainer" component={ServiciosContainer} /> 

        <Stack.Screen name="WhishlitContainer" component={WhishlitContainer} /> 
        
         
        <Stack.Screen name="FormTaller" component={FormTaller} />  


        <Stack.Screen name="FormService" component={FormService} />  


        <Stack.Screen name="TalleresContainer" component={TalleresContainer} />  
        <Stack.Screen name="Planscreen" component={Planscreen} />



        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="TallerProfileScreen" component={TallerProfileScreen} /> 
        <Stack.Screen name="TallerEditProfileScreen" component={TallerEditProfileScreen} /> 
        <Stack.Screen name="OrderHistory" component={OrderHistory} />
        <Stack.Screen name="HomeScreenTwo" component={HomeScreenTwo} />
        <Stack.Screen name="OfferScreen" component={OfferScreen} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen
          name="ChangePasswordScreen"
          component={ChangePasswordScreen}
        />
        <Stack.Screen name="AddressScreen" component={AddressScreen} />
        <Stack.Screen name="AddtocartOne" component={AddtocartOne} />
        <Stack.Screen name="AddToCartTwo" component={AddToCartTwo} />
        <Stack.Screen
          name="ChangeAddressScreen"
          component={ChangeAddressScreen}
        />
        <Stack.Screen name="ProductDetailOne" component={ProductDetailOne} />
        <Stack.Screen name="RatingScreen" component={RatingScreen} />
        <Stack.Screen name="CategoryTwo" component={CategoryTwo} />
        <Stack.Screen name="VoucherScreen" component={VoucherScreen} />
        <Stack.Screen name="ProductDetailTwo" component={ProductDetailTwo} />
        <Stack.Screen name="OrderStatus" component={OrderStatus} />
        <Stack.Screen
          name="ProductDetailThree"
          component={ProductDetailThree}
        />
        <Stack.Screen
          name="Planes"
          component={PlanesContainer}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;
