import {
  Cards,
  Key,
  Location,
  LogOut,
  OrderHistory,
  Profile,
  Setting,
} from '../../utils/icon';
export const profileData = [
  {
    id: 0,
    title: 'Perfil',
    icon: <Profile />,
    screenName: 'EditProfile',
  },
  // {
  //   id: 1,
  //   title: 'transData.manageDeliveryAddress',
  //   icon: <Location />,
  //   screenName: 'AddressScreen',
  // },
  {
    id: 2,
    title: 'Mis Intereses',
    icon: <OrderHistory />,
    screenName: 'OrderHistory',
  },
  // {
  //   id: 3,
  //   title: 'transData.setting',
  //   icon: <Setting />,
  //   screenName: 'Settings',
  // },
  // {
  //   id: 4,
  //   title: 'transData.managePaymentMethod',
  //   icon: <Cards />,
  //   screenName: 'PaymentScreen',
  // },
  {
    id: 5,
    title: 'Cambiar clave',
    icon: <Key width={24} height={24} />,
    // screenName: 'ChangePasswordScreen',
    screenName: 'ForgetPassword',
  },
  {
    id: 6,
    title: 'Cerrar sesión',
    icon: <LogOut />,
    screenName: '',
  },
];

export const profileDataAdmin = [
  {
    id: 6,
    title: 'Cerrar sesión',
    icon: <LogOut />,
    screenName: '',
  },
];
