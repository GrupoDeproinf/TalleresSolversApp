import {
  FlatList,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {useValues} from '../../../../App';
import api from '../../../../axiosInstance';
import NewCategoriesDetail from '../../../components/homeScreenTwo/newCategoriesDetail';
import {useRoute} from '@react-navigation/native';
import {Search} from '../../../assets/icons/search';
import Geolocation from '@react-native-community/geolocation';
import {windowWidth} from '../../../themes/appConstant';

const CategoryDetail = ({navigation}) => {
  const {isDark, bgFullStyle} = useValues();
  const [dataByCategory, setDataByCategory] = useState(null);
  const [categories, setCategories] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isFocusedSearch, setIsFocusedSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  // Datos originales para filtrar sin llamadas extra a la API
  const allDataRef = useRef([]);

  const route = useRoute();
  const {uid} = route.params;

  // ── Geolocalización ──────────────────────────────────────────────────────
  // enableHighAccuracy: false → usa red/WiFi en lugar del chip GPS físico.
  // En Android es hasta 10x más rápido (ms vs segundos).
  // maximumAge: 60000 → acepta posición cacheada de hasta 1 min.
  const toRad = value => (value * Math.PI) / 180;

  const calcularDistanciaKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const already = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (already) return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position => resolve({
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
        }),
        () => resolve(null),
        // false = red/WiFi (rápido) en lugar de GPS chip (lento en Android)
        {enableHighAccuracy: false, timeout: 5000, maximumAge: 60000},
      );
    });
  };

  const applyDistances = (data, location) => {
    if (!location) return data;
    const withDistance = data.map(item => {
      const latTaller = Number(item?.taller?.ubicacion?.lat);
      const lngTaller = Number(item?.taller?.ubicacion?.lng);
      const km_distance =
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude) &&
        Number.isFinite(latTaller) &&
        Number.isFinite(lngTaller)
          ? calcularDistanciaKm(location.latitude, location.longitude, latTaller, lngTaller)
          : null;
      return {...item, km_distance};
    });
    return [...withDistance].sort((a, b) => {
      const dA = Number.isFinite(Number(a?.km_distance)) ? Number(a.km_distance) : Infinity;
      const dB = Number.isFinite(Number(b?.km_distance)) ? Number(b.km_distance) : Infinity;
      return dA - dB;
    });
  };

  // ── Carga de datos ───────────────────────────────────────────────────────
  const getDataByCategories = useCallback(async category => {
    try {
      // 1. Fetch de la API — se muestra inmediatamente sin esperar GPS
      const response = await api.post('/home/getProductsByCategory', {
        uid_categoria: category,
      });

      if (response.status !== 200) {
        allDataRef.current = [];
        setDataByCategory([]);
        setLoading(false);
        return;
      }

      const data = Array.isArray(response.data) ? response.data : [];

      // Mostrar datos al usuario de inmediato (sin distancias aún)
      allDataRef.current = data;
      setDataByCategory(data);
      setLoading(false);

      // 2. GPS en paralelo — actualiza distancias cuando resuelve
      //    No bloquea el render inicial
      getCurrentLocation().then(location => {
        if (!location || !allDataRef.current.length) return;
        const sorted = applyDistances(allDataRef.current, location);
        allDataRef.current = sorted;
        setDataByCategory(sorted);
      });

    } catch {
      allDataRef.current = [];
      setDataByCategory([]);
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getCategoryById = async id => {
    try {
      if (!id) return;
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {'Content-Type': 'application/json'},
      });
      if (response.status === 200 && response.data?.categories) {
        const found = response.data.categories.find(c => c.id === id);
        setCategories(found || []);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    // Ambas llamadas en paralelo — no se bloquean entre sí
    getDataByCategories(uid);
    getCategoryById(uid);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback(text => {
    setSearchText(text);
    if (text.trim() === '') {
      setDataByCategory(allDataRef.current);
    } else {
      const lower = text.toLowerCase();
      setDataByCategory(
        allDataRef.current.filter(item =>
          String(item?.nombre_servicio || '').toLowerCase().includes(lower),
        ),
      );
    }
  }, []);

  const handleFocus = useCallback(() => setIsFocusedSearch(true),  []);
  const handleBlur  = useCallback(() => setIsFocusedSearch(false), []);

  // ── Colores ───────────────────────────────────────────────────────────────
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSub     = isDark ? '#9CA3AF' : '#6B7280';
  const searchBg    = isDark ? '#1F2344' : '#FFFFFF';
  const borderColor = isDark ? '#2A2E56' : '#E5E7EB';

  const headerTitleRaw = categories?.nombre ?? 'Categoría';
  const headerTitleDisplay =
    headerTitleRaw.length > 15 ? `${headerTitleRaw.slice(0, 15)}…` : headerTitleRaw;

  return (
    <View style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <StatusBar barStyle="light-content" backgroundColor="#1D1E56" />

      {/* ── HEADER ── */}
      <View style={styles.headerBlock}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack('')}
            style={styles.backBtn}
            activeOpacity={0.85}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitleDisplay}
          </Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {Array.isArray(dataByCategory) ? dataByCategory.length : 0} servicios
            </Text>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>
          Selecciona el servicio que mejor se adapte a tus necesidades
        </Text>
      </View>

      {/* ── BUSCADOR ── */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: searchBg,
            borderColor: isFocusedSearch ? '#FFD60A' : borderColor,
            shadowColor: isFocusedSearch ? '#FFD60A' : '#1F2344',
            shadowOpacity: isFocusedSearch ? 0.22 : 0.06,
          },
        ]}>
        <Search color={isFocusedSearch ? '#FFD60A' : textSub} size={17} />
        <TextInput
          placeholder="Filtrar por servicio..."
          placeholderTextColor={textSub}
          style={[styles.searchInput, {color: textPrimary}]}
          onChangeText={handleSearchChange}
          value={searchText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Text style={[styles.clearBtn, {color: textSub}]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── CONTENIDO ── */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#FFD60A" />
        </View>
      ) : (
        <NewCategoriesDetail
          data={dataByCategory}
          horizontal={false}
          numColumns={2}
          width={windowWidth(222)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerBlock: {
    backgroundColor: '#1D1E56',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,214,10,0.06)',
    top: -50,
    right: -30,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,214,10,0.05)',
    bottom: -20,
    left: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2,
  },
  pill: {
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.3)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  pillText: {color: '#FFD60A', fontSize: 12, fontWeight: '600'},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: '#FFD60A',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginHorizontal: 10,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(249,250,251,0.55)',
    lineHeight: 19,
    marginTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {flex: 1, fontSize: 15, paddingVertical: 0},
  clearBtn: {fontSize: 13, paddingHorizontal: 2},
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoryDetail;
