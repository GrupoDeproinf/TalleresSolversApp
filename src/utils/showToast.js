import {Alert} from 'react-native';

// Feedback cross-platform (Android e iOS).
//
// El codigo original usaba ToastAndroid, que SOLO funciona en Android: en iOS
// los avisos simplemente no aparecian. Se usa Alert, que funciona en las dos
// plataformas y no necesita montar nada en la raiz de la app, a diferencia de
// react-native-toast-message (que esta en package.json pero sin <Toast />
// montado, con lo que los avisos serian invisibles). (APP-11)
export const toastMessage = text => {
  Alert.alert('Solvers Informa', String(text ?? ''));
};

export default toastMessage;
