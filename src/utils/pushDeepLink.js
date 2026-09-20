// Enlace directo al tocar una notificación push (APP-UX-2).
// El servidor manda en `data`: { screen: 'VehicleMaintenanceScreen', ... } o
// { type: 'mantenimiento' | 'documento' | 'pago' | 'plan' | 'km' | ... } más los ids
// que la pantalla necesite (vehicleId, id, uid). Sin destino → bandeja de notificaciones.
import messaging from '@react-native-firebase/messaging';
import {navigationRef} from '../navigation';

const KNOWN_SCREENS = new Set([
  'HomeScreenTwo', 'NotificationScreen', 'VehiclesScreen', 'VehicleMaintenanceScreen',
  'VehicleNotificationsScreen', 'Planscreen', 'Planes', 'ReportarPago', 'MisSolicitudes',
  'SolicitudesTaller', 'TallerProfileScreen', 'Settings', 'EditProfile',
]);

// Códigos que el servidor ya envía hoy en data.secretCode → pantalla destino.
const BY_SECRET_CODE = {
  plantoexpire: 'Planscreen',
  NuevaSolicitud: 'SolicitudesTaller',
  PropuestaAceptada: 'SolicitudesTaller',
  InspeccionAceptada: 'SolicitudesTaller',
  NuevaPropuesta: 'MisSolicitudes',
  ProximoKmSuperado: 'VehicleMaintenanceScreen',
  ProximoKmAdvertenciaHasta3000: 'VehicleMaintenanceScreen',
  ActualizarKmVehiculos: 'VehiclesScreen',
  rcv_fecha_vencimiento: 'VehiclesScreen',
  trimestres_fecha_vencimiento: 'VehiclesScreen',
  licencia_fecha_vencimiento: 'EditProfile',
  certificado_medico_fecha_vencimiento: 'EditProfile',
};

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
  const code = String(data.secretCode ?? '').trim();
  let name = 'NotificationScreen';
  if (screen && KNOWN_SCREENS.has(screen)) name = screen;
  else if (code && BY_SECRET_CODE[code]) name = BY_SECRET_CODE[code];
  else if (type && BY_TYPE[type]) name = BY_TYPE[type];
  const {screen: _s, route: _r, pantalla: _p, type: _t, tipo: _ti, ...rest} = data;
  return {name, params: {fromPush: true, ...rest}};
};

const currentRoute = () => {
  try { return navigationRef.getCurrentRoute()?.name ?? ''; } catch (_) { return ''; }
};

const navigateWhenInside = (name, params, tries = 0) => {
  const ready = navigationRef.isReady() && !AUTH_ROUTES.has(currentRoute());
  if (ready) { if (__DEV__) console.log('[push] navegando a', name); navigationRef.navigate(name, params); return; }
  if (tries < 100) setTimeout(() => navigateWhenInside(name, params, tries + 1), 300);
  else if (__DEV__) console.log('[push] no se pudo navegar: la app no salio de', currentRoute());
};

const handleOpened = remoteMessage => {
  if (!remoteMessage) return;
  const {name, params} = resolvePushTarget(remoteMessage.data || {});
  if (__DEV__) console.log('[push] abierta', JSON.stringify(remoteMessage.data || {}), '->', name);
  // Si no hay sesión, navigateWhenInside espera hasta salir de las pantallas de login (o desiste a los 30 s).
  navigateWhenInside(name, params);
};

/** Llamar una vez al montar la navegación. Devuelve la función para desuscribir. */
export const setupPushDeepLinks = () => {
  if (__DEV__) messaging().getToken().then(t => console.log('FCM_TOKEN', t)).catch(() => {});
  const unsubscribe = messaging().onNotificationOpenedApp(handleOpened);
  messaging().getInitialNotification().then(handleOpened).catch(() => {});
  return unsubscribe;
};
