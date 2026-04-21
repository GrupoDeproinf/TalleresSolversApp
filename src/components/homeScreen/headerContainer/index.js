import {
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {external} from '../../../style/external.css';
import {useNavigation} from '@react-navigation/native';
import styles from './style.css';
import {useValues} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icons from 'react-native-vector-icons/FontAwesome5';
import Geolocation from '@react-native-community/geolocation';
import api from '../../../../axiosInstance';

/**
 * @param {object} props
 * @param {function} props.onPress
 */
const HeaderContainer = ({onPress}) => {
  const navigation = useNavigation('');
  const {viewRTLStyle} = useValues();
  const [infoUser, setinfoUser] = useState({
    uid: '',
    nombre: '',
    cedula: '',
    phone: '',
    typeUser: '',
  });
  const [location, setLocation] = useState(null);
  const [hasNearbyTalleres, setHasNearbyTalleres] = useState(false);

  /**
   * Efecto Pulse en la sombra: subida rápida al pico y caída más lenta (ritmo tipo latido).
   * Solo anima sombra (opacity / radius / elevation), el borde del círculo no se mueve.
   */
  const shadowPulse = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef(null);

  useEffect(() => {
    getData();
    requestLocationPermissionAndFetch();
  }, []);

  useEffect(() => {
    fetchNearbyForBadge();
  }, [location, infoUser?.estado]);

  /** Pulse solo cuando la consulta de cercanos devolvió al menos un registro */
  useEffect(() => {
    if (!hasNearbyTalleres) {
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
        pulseLoopRef.current = null;
      }
      shadowPulse.setValue(0);
      return;
    }

    const pulseCycle = Animated.sequence([
      Animated.timing(shadowPulse, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(90),
      Animated.timing(shadowPulse, {
        toValue: 0,
        duration: 1100,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.delay(280),
    ]);

    const loop = Animated.loop(pulseCycle);
    pulseLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      pulseLoopRef.current = null;
      shadowPulse.setValue(0);
    };
  }, [hasNearbyTalleres, shadowPulse]);

  const animatedShadowOpacity = shadowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.48, 0.92],
  });

  const animatedShadowRadius = shadowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 28],
  });

  const animatedElevation =
    Platform.OS === 'android'
      ? shadowPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 18],
        })
      : undefined;

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log('valor del storage', user);

      setinfoUser(user);
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        info => {
          const {latitude, longitude} = info.coords || {};
          if (latitude != null && longitude != null) {
            resolve({latitude, longitude});
            return;
          }
          reject(new Error('No se pudo obtener lat/lng.'));
        },
        error => reject(error),
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        },
      );
    });

  const requestLocationPermissionAndFetch = async () => {
    try {
      if (Platform.OS === 'android') {
        const fine = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        const coarse = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );

        if (fine || coarse) {
          const loc = await getCurrentLocation();
          setLocation(loc);
          return;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message:
              'Esta app necesita acceder a tu ubicación para mostrar negocios cercanos.',
            buttonNeutral: 'Pregúntame después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const loc = await getCurrentLocation();
          setLocation(loc);
        }
      } else {
        const loc = await getCurrentLocation();
        setLocation(loc);
      }
    } catch (e) {
      setHasNearbyTalleres(false);
    }
  };

  const fetchNearbyForBadge = async () => {
    if (!location?.latitude || !location?.longitude || !infoUser?.estado) return;
    try {
      const response = await api.post('/distance/getNearbyWithCategories', {
        estado: infoUser?.estado,
        lat: location?.latitude,
        lng: location?.longitude,
        radio: 5,
      });

      const data = response?.data;
      const talleres = Array.isArray(data?.talleres)
        ? data.talleres
        : Array.isArray(data)
        ? data
        : [];

      setHasNearbyTalleres(talleres.length > 0);
    } catch (e) {
      setHasNearbyTalleres(false);
    }
  };

  const mapShadowAnimatedStyle = hasNearbyTalleres
    ? {
        shadowOpacity: animatedShadowOpacity,
        shadowRadius: animatedShadowRadius,
        ...(animatedElevation != null ? {elevation: animatedElevation} : {}),
      }
    : {
        shadowOpacity: 0.55,
        shadowRadius: 12,
        ...(Platform.OS === 'android' ? {elevation: 8} : {}),
      };

  return (
    <View style={styles.headerCard}>
    <View style={styles.headerCircle1} />
    <View style={styles.headerCircle2} />
    <View
      style={[
        styles.headerCardInner,
        external.fd_row,
        external.ai_center,
        external.js_space,
        {flexDirection: viewRTLStyle},
      ]}>
      {/* <IconBackground value={<Drawer />} onPress={onPress} /> */}
      <View style={styles.leftBlock}>
        <Text style={styles.overlineText}>Bienvenido</Text>
        <Text style={styles.helloText} numberOfLines={1}>
          Hola, {infoUser?.nombre || 'Usuario'}
        </Text>
      </View>
      {/* <TouchableOpacity
        style={styles.logoWrap}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('RadioSelector')}>
        <Wrench size={20} color="#FFD60A" />
      </TouchableOpacity> */}
      <View style={styles.mapButtonWrap}>
        <Animated.View style={[styles.mapBtnCircle, mapShadowAnimatedStyle]}>
          <TouchableOpacity
            style={styles.mapBtnTouchableInner}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('RadioSelector')}>
            <Icons name="map-marked-alt" size={32} color="#FFD60A" />
          </TouchableOpacity>
          {hasNearbyTalleres ? <View style={styles.mapBadgeDot} /> : null}
        </Animated.View>
      </View>
    </View>
  </View>
  );
};

export default HeaderContainer;
