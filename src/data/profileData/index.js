import { Linking } from 'react-native';
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
  {
    id: 2,
    title: 'Mis Intereses',
    icon: <OrderHistory />,
    screenName: 'OrderHistory',
  },

  {
    id: 3,
    title: 'Planes',
    icon: <OrderHistory />,
    screenName: 'Planes',
  },
  {
    id: 5,
    title: 'Cambiar clave',
    icon: <Key width={24} height={24} />,
    screenName: 'ForgetPassword',
  },
  {
    id: 7,
    title: 'Soporte',
    icon: <Location />,
    screenName: 'whatsapp://send?text=%C2%A1Hola%21%20Necesito%20ayuda&phone=+584241318415',
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
