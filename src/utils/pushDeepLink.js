// Enlace directo al tocar una notificación push (APP-UX-2).
// El servidor manda en `data`: { screen: 'VehicleMaintenanceScreen', ... } o
// { type: 'mantenimiento' | 'documento' | 'pago' | 'plan' | 'km' | ... } más los ids
// que la pantalla necesite (vehicleId, id, uid). Sin destino → bandeja de notificaciones.
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigationRef} from '../navigation';

const KNOWN_SCREENS = new Set([
  'HomeScreenTwo', 'NotificationScreen', 'VehiclesScreen', 'VehicleMaintenanceScreen',
  'VehicleNotificationsScreen', 'Planscreen', 'Planes', 'ReportarPago', 'MisSolicitudes',
  'SolicitudesTaller', 'TallerProfileScreen', 'Settings',
]);

const BY_TYPE = {
  mantenimiento: 'VehicleMaintenanceScreen', maintenance: 'VehicleMaintenanceScreen',
  aceite: 'VehicleMaintenanceScreen', servicio: 'VehicleMaintenanceScreen',
  km: 'VehiclesScreen', odometro: 'VehiclesScreen', vehiculo: 'VehiclesScreen',
  documento: 'VehicleNotificationsScreen', certificado: 'VehicleNotificationsScreen',
  vencimiento: 'VehicleNotificationsScreen', alerta: 'VehicleNotificationsScreen',
  pago: 'Planscreen', trimestre: 'Planscreen', plan: 'Planscreen', cuota: 'Planscreen',
  solicitud: 'MisSolicitudes', cita: 'MisSolicitudes',
};

const AUTH_ROUTES = new Set(['LoaderScreen', 'Splash', 'Login', 'SignUp', 'Onboarding', 'OnboardingTwo', 'OtpVerfication', 'ForgetPassword']);

export const resolvePushTarget = (data = {}) => {
  const screen = String(data.screen ?? data.route ?? data.pantalla ?? '').trim();
  const type = String(data.type ?? data.tipo ?? '').trim().toLowerCase();
  let name = 'NotificationScreen';
  if (screen && KNOWN_SCREENS.has(screen)) name = screen;
  else if (type && BY_TYPE[type]) name = BY_TYPE[type];
  const {screen: _s, route: _r, pantalla: _p, type: _t, tipo: _ti, ...rest} = data;
  return {name, params: {fromPush: true, ...rest}};
};

const currentRoute = () => {
  try { return navigationRef.getCurrentRoute()?.name ?? ''; } catch (_) { return ''; }
};

const navigateWhenInside = (name, params, tries = 0) => {
  const ready = navigationRef.isReady() && !AUTH_ROUTES.has(currentRoute());
  if (ready) { navigationRef.navigate(name, params); return; }
  if (tries < 40) setTimeout(() => navigateWhenInside(name, params, tries + 1), 300);
};

const handleOpened = async remoteMessage => {
  if (!remoteMessage) return;
  try {
    const j = await AsyncStorage.getItem('@userInfo');
    if (!j) return; // sin sesión: que el flujo normal lleve al login
  } catch (_) { return; }
  const {name, params} = resolvePushTarget(remoteMessage.data || {});
  navigateWhenInside(name, params);
};

/** Llamar una vez al montar la navegación. Devuelve la función para desuscribir. */
export const setupPushDeepLinks = () => {
  const unsubscribe = messaging().onNotificationOpenedApp(handleOpened);
  messaging().getInitialNotification().then(handleOpened).catch(() => {});
  return unsubscribe;
};
