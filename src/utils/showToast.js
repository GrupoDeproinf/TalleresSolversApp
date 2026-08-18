import Toast from 'react-native-toast-message';

// Feedback cross-platform (Android e iOS).
//
// Antes se usaba ToastAndroid, que SOLO funciona en Android: en iOS los avisos
// simplemente no aparecían. Este helper usa react-native-toast-message, que
// funciona en ambas plataformas. Requiere que <Toast /> esté montado una vez
// en la raíz de la app (ver App.js). (APP-11)
export const toastMessage = text => {
  Toast.show({
    type: 'info',
    text1: text,
    position: 'bottom',
    visibilityTime: 3000,
  });
};

export default toastMessage;
