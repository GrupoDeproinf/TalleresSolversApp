import {
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Alert,
  useWindowDimensions,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AuthContainer from '../../../commonComponents/authContainer';
import {apple, facebook} from '../../../constant';
import TextInputs from '../../../commonComponents/textInputs';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import {Email} from '../../../assets/icons/email';
import {Apple, FaceBook, Google, Key} from '../../../utils/icon';
import Icons from 'react-native-vector-icons/FontAwesome';
import {useValues} from '../../../../App';
import LinearBoderText from '../../../commonComponents/linearBoderText';
import CheckBox from '../../../commonComponents/checkBox';
import {fontSizes} from '../../../themes/appConstant';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../axiosInstance';
import DeviceInfo from 'react-native-device-info';

import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB7JeVA4YZBzTblEOnZ-drNT-vwv085fgM",
  authDomain: "talleres-solvers-app.firebaseapp.com",
  projectId: "talleres-solvers-app",
  storageBucket: "talleres-solvers-app.firebasestorage.app",
  messagingSenderId: "144076824848",
  appId: "1:144076824848:web:cdaf60b28136561b338595",
  measurementId: "G-DXQ986SLJR"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

/** Igual que App.tsx: unifica userData anidado de getUserByUid. */
const flattenUserDataFromGetUserResponse = data => {
  if (!data || typeof data !== 'object') {
    return {};
  }
  let merged = {...data};
  const nest = data.userData ?? data.data ?? data.user;
  if (nest && typeof nest === 'object' && !Array.isArray(nest)) {
    merged = {...merged, ...nest};
    const inner = nest.userData;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      merged = {...merged, ...inner};
    }
  }
  return merged;
};

/** Mismo contrato que App.tsx `saveTokenToBackend` (uid + token). */
const saveLoginFcmTokenToBackend = async (token, uid_usuario) => {
  if (!token || !uid_usuario) {
    return false;
  }
  try {
    await api.post('usuarios/UpdateUsuariosAll', {
      uid: uid_usuario,
      token,
    });
    return true;
  } catch (e) {
    console.error('saveLoginFcmTokenToBackend error:', e);
    return false;
  }
};

const registerMessagingDeviceSafe = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch (regErr) {
    console.warn('registerDeviceForRemoteMessages:', regErr);
  }
};

const getMessagingTokenSafe = async () => {
  try {
    return await messaging().getToken();
  } catch (tokenErr) {
    console.error('Error getting FCM token:', tokenErr);
    return null;
  }
};

/** Paso 1 (login exitoso): enriquecer userData con `getUserByUid` si hay uid. */
const mergeLoginUserWithGetUserByUid = async sessionUser => {
  if (!sessionUser || typeof sessionUser !== 'object') {
    return {};
  }
  let merged = {...sessionUser};
  const uid = String(merged.uid ?? merged.id ?? '').trim();
  if (!uid) {
    return merged;
  }
  try {
    const res = await api.post('usuarios/getUserByUid', {uid});
    const fresh = flattenUserDataFromGetUserResponse(res?.data ?? {});
    merged = {...merged, ...fresh};
  } catch (e) {
    console.warn('login getUserByUid:', e);
  }
  return merged;
};

/** Paso 2: FCM + backend si el token cambió o faltaba (alineado con App.tsx). */
const syncLoginUserFcmWithBackend = async userData => {
  const base = userData && typeof userData === 'object' ? {...userData} : {};
  await registerMessagingDeviceSafe();
  const fcmToken = await getMessagingTokenSafe();
  const uid = String(base.uid ?? base.id ?? '').trim();
  const storedToken = base.token;
  const shouldSync =
    !!fcmToken &&
    !!uid &&
    (storedToken == null ||
      storedToken === '' ||
      storedToken !== fcmToken);

  if (!shouldSync) {
    return base;
  }
  const ok = await saveLoginFcmTokenToBackend(fcmToken, uid);
  if (ok) {
    return {...base, token: fcmToken};
  }
  return base;
};

const LoginSubmitButton = ({
  onPress,
  disabled,
  loginStyles: ls,
  layout,
  appColors: colors,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
    style={[
      ls.loginBtn,
      {
        backgroundColor: disabled ? colors.lightButton : colors.primary,
      },
    ]}>
    <View style={ls.loginBtnIconWrap}>
      <Icons
        name="sign-in"
        size={Math.round(20 * layout.fontScale)}
        color={colors.primary}
      />
    </View>
    <Text
      style={[
        ls.loginBtnText,
        {
          color: disabled ? colors.titleText : colors.screenBg,
        },
      ]}>
      Iniciar sesión
    </Text>
  </TouchableOpacity>
);

/** Layout login: prioridad móvil; `maxContent` por si limitas ancho (footer, modales, etc.). */
const useLoginLayout = () => {
  const {width, height} = useWindowDimensions();
  return useMemo(() => {
    const gutter = Math.round(Math.max(10, Math.min(24, width * 0.048)));
    const maxContent = Math.min(width, 480);
    const fontScale = Math.min(1.06, Math.max(0.88, width / 375));
    const shortScreen = height < 660;
    const padFormH = Math.round(Math.max(10, Math.min(20, width * 0.035)));
    const btnWidth = Math.min(420, width - gutter * 2);
    return {
      gutter,
      maxContent,
      fontScale,
      shortScreen,
      padFormH,
      btnWidth,
      formPadV: shortScreen ? 16 : 24,
      btnMarginTop: shortScreen ? 18 : 28,
    };
  }, [width, height]);
};

/** Margen entre el borde inferior del campo y el borde superior del teclado. */
const ABOVE_KEYBOARD_GAP = 10;
/** Un poco de scroll extra tras el solapamiento medido (evitar valores altos: se acumula con varios timers). */
const SCROLL_COMFORT_EXTRA = 14;

const SignIn = ({navigation}) => {
  const layout = useLoginLayout();
  const {height: windowHeight} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const emailWrapRef = useRef(null);
  const passwordWrapRef = useRef(null);
  /** 'email' | 'password' | null — para volver a hacer scroll cuando ya hay `keyboardInset`. */
  const focusedFieldRef = useRef(null);
  const scrollYRef = useRef(0);
  const scrollViewportHRef = useRef(0);
  const contentHeightRef = useRef(0);
  /** Borde superior del teclado en coordenadas de ventana (`measureInWindow`). */
  const keyboardTopYRef = useRef(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [checkedData, setCheckedData] = useState(false);
  const [isSignInDisabled, setSignInDisabled] = useState(false);

  const [showPass, setshowPass] = useState(true);

  useEffect(() => {
    setSignInDisabled(false);
    setEmail('');
    setPassword('');
  }, []);
  
  useEffect(() => {

    checkAndRequestNotificationPermission()

  }, []);

  useEffect(() => {
    const onShow = e => {
      const ec = e?.endCoordinates;
      const h = ec?.height ?? 0;
      setKeyboardInset(h);
      let top = null;
      if (h > 0) {
        const sy =
          ec && typeof ec.screenY === 'number' && !Number.isNaN(ec.screenY)
            ? ec.screenY
            : null;
        // Android a veces envía screenY = 0: usar borde superior = alto ventana − alto teclado
        if (
          sy != null &&
          sy > 40 &&
          sy < windowHeight - 40
        ) {
          top = sy;
        } else {
          top = Math.max(0, windowHeight - h);
        }
      }
      keyboardTopYRef.current = top;
    };
    const onHide = () => {
      setKeyboardInset(0);
      keyboardTopYRef.current = null;
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollRef.current?.scrollTo({y: 0, animated: false});
        }, 80);
      });
    };
    const subShow = Keyboard.addListener('keyboardDidShow', onShow);
    const subHide = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [windowHeight]);

  const scrollFieldIntoView = useCallback(
    (fieldRef, field /* 'email' | 'password' */) => {
      const wrap = fieldRef?.current;
      const sv = scrollRef.current;
      if (!wrap || !sv) {
        return;
      }
      const kh = keyboardInset;
      const keyboardTop =
        keyboardTopYRef.current ??
        (kh > 0 ? windowHeight - kh : windowHeight);

      wrap.measureInWindow((fx, fy, fw, fh) => {
        const inputBottom = fy + fh;
        const targetBottom = keyboardTop - ABOVE_KEYBOARD_GAP;
        /** Cuánto hay que subir el scroll para que el borde inferior del campo quede en `targetBottom`. */
        const overlapLift = inputBottom - targetBottom;
        if (overlapLift <= 4) {
          return;
        }
        let lift = overlapLift + SCROLL_COMFORT_EXTRA;
        /*
         * Solo si casi no hay solapamiento medido pero hay teclado (coords raras en Android),
         * un empujón pequeño — sin mezclar con un "floor" grande que dispara el scroll.
         */
        if (kh > 0 && overlapLift > 0 && overlapLift < 28) {
          const nudge = field === 'password' ? 18 : 12;
          lift = Math.max(lift, overlapLift + nudge);
        }
        if (lift < 6) {
          return;
        }
        const maxScroll = Math.max(
          0,
          contentHeightRef.current - scrollViewportHRef.current,
        );
        if (maxScroll < 1) {
          return;
        }
        const nextY = Math.min(
          maxScroll,
          Math.max(0, scrollYRef.current + lift),
        );
        sv.scrollTo({y: nextY, animated: true});
      });
    },
    [keyboardInset, windowHeight],
  );

  useEffect(() => {
    if (keyboardInset <= 0) {
      return;
    }
    const id = setTimeout(() => {
      if (focusedFieldRef.current === 'password') {
        scrollFieldIntoView(passwordWrapRef, 'password');
      } else if (focusedFieldRef.current === 'email') {
        scrollFieldIntoView(emailWrapRef, 'email');
      }
    }, 140);
    return () => clearTimeout(id);
  }, [keyboardInset, scrollFieldIntoView]);

  const checkAndRequestNotificationPermission = async () => {
    console.log(Platform.Version)
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Permiso de notificaciones',
        message: 'Esta aplicación necesita acceso para enviarte notificaciones',
        buttonNeutral: 'Pregúntame más tarde',
        buttonNegative: 'Cancelar',
        buttonPositive: 'OK',
      },
    );
    console.log(granted);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Permiso de notificaciones concedido');
    } else {
      console.log('Permiso de notificaciones denegado');
    }
  } else {
    // console.log("No se requiere permiso de notificaciones en esta versión de Android");
  }
};
  
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const onHandleChange = async () => {
    console.log("Aquiiiii")

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    setSignInDisabled(true);

    if (isEmailValid && isPasswordValid) {
      console.log(email);
      console.log(password);
      console.log(JSON.stringify({email: email}));

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/authenticateUser', {
          email: email.toLowerCase(),
          password: password,
        });

        // Verificar la respuesta del servidor
        const result = response.data; // Los datos vienen directamente de response.data
        console.log('Este es el usuario nuevo ', result); // Aquí puedes manejar la respuesta

        if (
          result.message === 'Usuario autenticado exitosamente' ||
          result.message === 'Usuario autenticado exitosamente como Admin'
        ) {
          try {
            let userData =
              result.userData && typeof result.userData === 'object'
                ? {...result.userData}
                : {};

            userData = await mergeLoginUserWithGetUserByUid(userData);
            userData = await syncLoginUserFcmWithBackend(userData);

            if(result.userData.typeUser == "Certificador"){
              if(result?.userData?.token == undefined || result?.userData?.token == ''){

                try {
                  const token = await messaging().getToken();
                  console.log("FCM token certificador:", token);
                  try{
                    const response2 = await api.post('/usuarios/UpdateUsuariosAll', {
                      uid: result?.userData?.uid,
                      token: token,
                    });

                    console.log('Este es el usuario nuevo ', response2); 
                  }  catch (error) {
                    console.error("Error en actualizar el usuario:", error);
                  }

                } catch (error) {
                  console.error("Error getting FCM token:", error);
                }
              }
            }
            const jsonValue = JSON.stringify({
              ...result.userData,
              ...userData,
            });
            console.log(jsonValue);
            await AsyncStorage.setItem('@userInfo', jsonValue);
          } catch (e) {
            console.log(e);
          }

          setSignInDisabled(true);
          setEmail('');
          setPassword('');
          setSignInDisabled(false);
          navigation.navigate('LoaderScreen');
        } else {
          setSignInDisabled(false);
          
          showToast(
            'No se ha encontrado el usuario, por favor validar formulario',
          );
        }
      } catch (error) {
        if (error.response) {
          // La solicitud se hizo y el servidor respondió con un código de estado
          console.error('Error en la solicitud1:', error.response.data);
          console.error('Error en la solicitud2:', error.response.data.error);
          console.error('Error en la solicitud3:', error.response.data.message);

          if (error?.response?.data?.error == "Firebase: Error (auth/invalid-credential)."){
            showToast(
              'Credenciales incorrectas, por favor validar formulario',
            );
          } else if (error?.response?.data?.error == "Firebase: Error (auth/user-not-found)."){
            showToast(
              'Usuario no encontrado, por favor validar formulario',
            );
          } else if (error?.response?.data?.error == "Firebase: Error (auth/wrong-password)."){
            showToast(
              'Contraseña incorrecta, por favor validar formulario',
            );
          } 
          
          setSignInDisabled(false);
          // showToast(
          //   'Error al encontrar al usuario, por favor validar formulario',
          // );
        } else {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('Error en la solicitud:', error);
          setSignInDisabled(false);
          showToast('Usuario no encontrado, por favor validar formulario');
        }
      }
    } else {
      setSignInDisabled(false);
    }
  };

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };

  const appVersion = DeviceInfo.getVersion(); // Versión como "1.0.0"
  const buildNumber = DeviceInfo.getBuildNumber();

  const {bgFullStyle, textColorStyle, t, iconColorStyle} = useValues();
  const valData = () => {
    setCheckedData(!checkedData);
  };
  const {linearColorStyleTwo, linearColorStyle} = useValues();

  const changePassValue = () => {
    setshowPass(!showPass);
  };

  const loginStyles = useMemo(() => {
    const fs = layout.fontScale;
    return StyleSheet.create({
      screenRoot: {
        flex: 1,
        width: '100%',
        backgroundColor: bgFullStyle,
      },
      keyboardAvoidFill: {
        flex: 1,
        width: '100%',
      },
      scrollFlex: {
        flex: 1,
        width: '100%',
      },
      scrollContent: {
        flexGrow: 1,
        width: '100%',
        paddingBottom: 12,
      },
      scrollInner: {
        width: '100%',
        flexGrow: 0,
      },
      mainColumn: {
        flex: 1,
        width: '100%',
        alignSelf: 'stretch',
      },
      footer: {
        width: '100%',
        paddingTop: 12,
        paddingHorizontal: layout.gutter,
        backgroundColor: bgFullStyle,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(31, 35, 68, 0.12)',
      },
      footerLoginSection: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
      },
      footerVersionRow: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
      },
      wrap: {
        width: '100%',
        paddingHorizontal: 0,
        flexGrow: 0,
      },
      formCard: {
        backgroundColor: appColors.screenBg,
        borderRadius: Math.round(18 + 2 * fs),
        paddingHorizontal: layout.padFormH,
        paddingVertical: layout.formPadV,
        marginTop: 0,
      },
      forgotWrap: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 4,
      },
      forgotText: {
        fontSize: Math.round(13 * fs),
        fontWeight: '600',
        color: appColors.primary,
      },
      btnWrap: {
        marginTop: layout.btnMarginTop,
        alignItems: 'center',
        width: '100%',
      },
      loginBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Math.round(12 + 2 * fs),
        paddingHorizontal: Math.round(20 * fs),
        borderRadius: 999,
        width: layout.btnWidth,
        maxWidth: '100%',
      },
      loginBtnIconWrap: {
        width: Math.round(34 * fs),
        height: Math.round(34 * fs),
        borderRadius: Math.round(17 * fs),
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Math.round(10 * fs),
      },
      loginBtnText: {
        fontSize: Math.round(18 * fs),
        fontWeight: '700',
      },
      signUpRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 0,
        paddingHorizontal: 4,
        gap: 8,
      },
      signUpLabel: {
        fontSize: Math.round(13 * fs),
        color: appColors.subtitle,
        marginRight: 0,
        textAlign: 'center',
      },
      signUpBtn: {
        paddingVertical: Math.round(7 * fs),
        paddingHorizontal: Math.round(16 * fs),
        borderRadius: 22,
        backgroundColor: appColors.primaryLight,
        borderWidth: 1,
        borderColor: 'rgba(45, 50, 97, 0.12)',
      },
      signUpBtnText: {
        fontSize: Math.round(14 * fs),
        fontWeight: '700',
        color: appColors.primary,
      },
      versionText: {
        fontSize: Math.round(11 * fs),
        color: appColors.subtitle,
        opacity: 0.85,
      },
    });
  }, [layout, bgFullStyle]);

  /** Padding inferior del scroll: suficiente para el desplazamiento sin duplicar casi todo el teclado. */
  const scrollBottomPad =
    12 +
    (keyboardInset > 0
      ? Math.round(keyboardInset * 0.4) + Math.round(insets.bottom) + 48
      : 0);

  return (
    <View style={loginStyles.screenRoot}>
      <KeyboardAvoidingView
        style={loginStyles.keyboardAvoidFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <View style={{flex: 1, width: '100%'}}>
          <View style={loginStyles.mainColumn}>
            <ScrollView
              ref={scrollRef}
              style={loginStyles.scrollFlex}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={e => {
                scrollYRef.current = e.nativeEvent.contentOffset.y;
              }}
              onLayout={e => {
                scrollViewportHRef.current = e.nativeEvent.layout.height;
              }}
              onContentSizeChange={(_, h) => {
                contentHeightRef.current = h;
              }}
              contentContainerStyle={[
                loginStyles.scrollContent,
                {paddingBottom: scrollBottomPad},
              ]}
              bounces={false}
              removeClippedSubviews={false}>
              <View
                style={[
                  styles.container,
                  loginStyles.scrollInner,
                  {backgroundColor: bgFullStyle, paddingHorizontal: 0},
                  loginStyles.wrap,
                ]}>
                <AuthContainer
                  scrollEmbedded
                  title="¡Hola de nuevo!"
                  subtitle="Accede a tu cuenta para gestionar tus servicios y vehículos."
                  AlignItemTitle={'center'}
                  value={
                    <View style={loginStyles.formCard}>
                      <View ref={emailWrapRef} collapsable={false}>
                  <TextInputs
                    dismissKeyboardOnPressOutside={false}
                    keyboardType={'email-address'}
                    title="Correo electrónico"
                    value={email}
                    placeHolder="Ej. tu@correo.com"
                    onFocus={() => {
                      focusedFieldRef.current = 'email';
                      setTimeout(() => scrollFieldIntoView(emailWrapRef, 'email'), 160);
                    }}
                    onChangeText={text => {
                      setEmail(text);
                      setEmailTyping(true);
                      if (text.trim() === '') {
                        setEmailError('Email is requerido');
                      } else {
                        setEmailError('');
                      }
                    }}
                    onBlur={() => {
                      focusedFieldRef.current = null;
                      validateEmail();
                      setEmailTyping(false);
                    }}
                    icon={
                      <Email
                        color={isEmailTyping ? iconColorStyle : appColors.subtitle}
                      />
                    }
                  />
                      </View>
                  {emailError !== '' && (
                    <Text style={styles.errorStyle}>{emailError}</Text>
                  )}
                      <View ref={passwordWrapRef} collapsable={false}>
                  <TextInputs
                    dismissKeyboardOnPressOutside={false}
                    title="Contraseña"
                    value={password}
                    placeHolder="Mínimo 6 caracteres"
                    secureTextEntry={showPass}
                    showPass={true}
                    changePassValue={changePassValue}
                    onFocus={() => {
                      focusedFieldRef.current = 'password';
                      setTimeout(() => scrollFieldIntoView(passwordWrapRef, 'password'), 160);
                    }}
                    onChangeText={text => {
                      setPassword(text);
                      setPwdTyping(true);
                      if (text.length < 6) {
                        setPasswordError(
                          'Contraseña debe tener mínimo 6 caracteres',
                        );
                      } else {
                        setPasswordError('');
                      }
                    }}
                    onBlur={() => {
                      focusedFieldRef.current = null;
                      validatePassword();
                      setPwdTyping(false);
                    }}
                    icon={
                      <Key
                        color={isPwdTyping ? iconColorStyle : appColors.subtitle}
                      />
                    }
                  />
                      </View>
                  {passwordError !== '' && (
                    <Text style={styles.errorStyle}>{passwordError}</Text>
                  )}
                  <TouchableOpacity
                    style={loginStyles.forgotWrap}
                    onPress={() => navigation.navigate('ForgetPassword')}
                    activeOpacity={0.8}>
                    <Text style={loginStyles.forgotText}>
                      Olvidé mi contraseña
                    </Text>
                  </TouchableOpacity>
                    </View>
                  }
                />

                {/* Botón principal solo en footer (visible en pantallas pequeñas) */}
                {/*
            <View style={loginStyles.btnWrap}>
              <LoginSubmitButton
                onPress={onHandleChange}
                disabled={isSignInDisabled}
                loginStyles={loginStyles}
                layout={layout}
                appColors={appColors}
              />
            </View>
            */}
              </View>
            </ScrollView>
          </View>

          <View
            style={[
              loginStyles.footer,
              {paddingBottom: Math.max(insets?.bottom ?? 0, 10) + 8},
            ]}>
            <View style={loginStyles.footerLoginSection}>
              <LoginSubmitButton
                onPress={onHandleChange}
                disabled={isSignInDisabled}
                loginStyles={loginStyles}
                layout={layout}
                appColors={appColors}
              />
            </View>
            <View style={loginStyles.signUpRow}>
              <Text style={loginStyles.signUpLabel}>¿No tienes cuenta?</Text>
              <TouchableOpacity
                style={loginStyles.signUpBtn}
                onPress={() => navigation.navigate('SignUp')}
                activeOpacity={0.8}>
                <Text style={loginStyles.signUpBtnText}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>
            <View style={loginStyles.footerVersionRow}>
              <Text style={loginStyles.versionText}>
                Versión {DeviceInfo.getVersion()}
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignIn;
