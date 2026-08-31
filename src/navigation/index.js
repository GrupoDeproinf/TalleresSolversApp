import React from 'react';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/auth/login';


import SignUp from '../screens/auth/signUp';
import ForgetPassword from '../screens/auth/forgotPassword';
import ResetPassword from '../screens/auth/resetPassword';





import CategoryDetail from '../screens/categoryScreen/CategoryDetail';
import OtpVerfication from '../screens/auth/verificationCode';


import NotificationScreen from '../screens/notification';
import MyWhishList from '../screens/myWhishList';
import NotificationContainer from '../screens/notification/notificationDesc';
import WhishlitContainer from '../screens/myWhishList/whishlistScreen';
import EditProfile from '../screens/profileScreen/editProfile';
import TallerProfileScreen from '../screens/profileScreen/tallerProfileScreen';
import OrderHistory from '../screens/profileScreen/orderHistory';

import CheckoutScreen from '../screens/checkOut';
import Splash from '../screens/intro/splash';


import Onboarding from '../screens/intro/onBording';
import OnboardingTwo from '../screens/intro/onBordingTwo';
import FormTaller from '../screens/FormTaller'
import FormService from '../screens/FormService'

import TalleresContainer from '../screens/Talleres'
import Planscreen from '../screens/profileScreen/planes';

import ReportarPago from '../screens/ReportarPago';

import ServiciosContainer from '../screens/Servicios'

import TallerEditProfileScreen from '../screens/profileScreen/editProfileTaller';



import LoaderScreen from '../screens/loaderScreen';


import OfferScreen from '../screens/offerScreen';
import Settings from '../screens/profileScreen/notificationSetting';
import PaymentScreen from '../screens/profileScreen/paymentScreen';
import ChangePasswordScreen from '../screens/changePassword';
import AddressScreen from '../screens/profileScreen/addressScreen';
import AddtocartOne from '../screens/addtocartOne';
import AddToCartTwo from '../screens/addtoCartTwo';
import ChangeAddressScreen from '../screens/changeAddress';
import RatingScreen from '../screens/ratingScreen';
import ProductDetailOne from '../screens/productScreen/productDetailOne';
import CategoryTwo from '../screens/categoryTwo';
import VoucherScreen from '../screens/voucherScreen';

import OrderStatus from '../screens/orderStatus';
import PlanesContainer from '../screens/PlanesTaller';
import PlanesRegistro from '../screens/PlanesRegistro';
import DrawerScreen from '../drawer';
import TallerDetail from '../screens/tallerDetail';

import VehiclesScreen from '../screens/profileScreen/vehiclesScreen';
import VehicleAddStepper from '../screens/profileScreen/vehiclesScreen/VehicleAddStepper';
import VehicleNotificationsScreen from '../screens/profileScreen/vehiclesScreen/VehicleNotificationsScreen';
import VehicleMaintenanceScreen from '../screens/profileScreen/vehiclesScreen/VehicleMaintenanceScreen';
import SolicitudServicio from '../screens/SolicitudServicio';
import MisSolicitudesScreen from '../screens/misSolicitudes';
import SolicitudesTallerScreen from '../screens/solicitudesTaller';
import TallerInfoScreen from '../screens/tallerInfo';


// import ProductDetailTwo from '../screens/productScreen/productDetailTwo';
// import ProductDetailThree from '../screens/productScreen/productDetailThree';
// import HomeScreenTwo from '../screens/homeScreenTwo';

import RadioSelector from '../screens/perimeter-map';


const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export const navigate = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

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
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName='LoaderScreen' screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={Login} />
        {/* <Stack.Screen name="Login" component={Login} /> */}



        
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />


        {/* <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
        <Stack.Screen name="OtpVerfication" component={OtpVerfication} /> */}

        <Stack.Screen name="Splash" component={Splash} />

        
        <Stack.Screen name="CategoryDetail" component={CategoryDetail} />
        
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="MyWhishList" component={MyWhishList} />
        <Stack.Screen name="NotificationContainer" component={NotificationContainer} />
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



        {/* por validar */}

        <Stack.Screen name="OfferScreen" component={OfferScreen} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen}/>
        <Stack.Screen name="AddressScreen" component={AddressScreen} />
        <Stack.Screen name="AddtocartOne" component={AddtocartOne} />
        <Stack.Screen name="AddToCartTwo" component={AddToCartTwo} />
        <Stack.Screen name="ChangeAddressScreen" component={ChangeAddressScreen}/>
        <Stack.Screen name="ProductDetailOne" component={ProductDetailOne} />
        <Stack.Screen name="RatingScreen" component={RatingScreen} />
        <Stack.Screen name="CategoryTwo" component={CategoryTwo} />
        <Stack.Screen name="VoucherScreen" component={VoucherScreen} />
        <Stack.Screen name="OrderStatus" component={OrderStatus} />
        <Stack.Screen name="Planes" component={PlanesContainer}/>  
        <Stack.Screen name="PlanesRegistro" component={PlanesRegistro} />
        <Stack.Screen name="LoaderScreen" component={LoaderScreen} />


        <Stack.Screen name="DrawerScreen" component={DrawerScreen} />



        <Stack.Screen name="TallerDetail" component={TallerDetail} />



        {/* Nuevas rutas, nueva version */}
        <Stack.Screen name="VehiclesScreen" component={VehiclesScreen} />
        <Stack.Screen name="VehicleAddStepper" component={VehicleAddStepper} />
        <Stack.Screen name="VehicleNotificationsScreen" component={VehicleNotificationsScreen} />
        <Stack.Screen name="VehicleMaintenanceScreen" component={VehicleMaintenanceScreen} />
        <Stack.Screen name="SolicitudServicio" component={SolicitudServicio} />
        <Stack.Screen name="MisSolicitudes" component={MisSolicitudesScreen} />
        <Stack.Screen name="SolicitudesTaller" component={SolicitudesTallerScreen} />
        <Stack.Screen name="TallerInfoScreen" component={TallerInfoScreen} />

        <Stack.Screen name="RadioSelector" component={RadioSelector} />

        {/* <Stack.Screen name="HomeScreenTwo" component={HomeScreenTwo} />
        <Stack.Screen name="ProductDetailThree" component={ProductDetailThree} />
        <Stack.Screen name="ProductDetailTwo" component={ProductDetailTwo} /> */}

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;
