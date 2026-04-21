import {
  ScrollView,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {windowWidth} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import api from '../../../../axiosInstance';
import NewCategoriesDetail from '../../../components/homeScreenTwo/newCategoriesDetail';
import { useRoute } from '@react-navigation/native';
import {Filter} from '../../../utils/icon';
import appColors from '../../../themes/appColors';
import {Search} from '../../../assets/icons/search';
import Geolocation from '@react-native-community/geolocation';

const CategoryDetail = ({navigation}) => {
  const {isDark, bgFullStyle, textRTLStyle} = useValues();
  const [dataByCategory, setDataByCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isFocusedSearch, setIsFocusedSearch] = useState(false);

  const route = useRoute();

  const {uid} = route.params;

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
        position => {
          resolve({
            latitude: position?.coords?.latitude,
            longitude: position?.coords?.longitude,
          });
        },
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  };

  const getDataByCategories = useCallback(async category => {
    try {
      const response = await api.post('/home/getProductsByCategory', {
        uid_categoria: category,
      });

      console.log('Category data response:', response.data);

      if (response.status === 200) {
        const location = await getCurrentLocation();
        const data = Array.isArray(response.data) ? response.data : [];
        const withDistance = data.map(item => {
          const latTaller = Number(item?.taller?.ubicacion?.lat);
          const lngTaller = Number(item?.taller?.ubicacion?.lng);
          let km_distance = null;

          if (
            location &&
            Number.isFinite(location.latitude) &&
            Number.isFinite(location.longitude) &&
            Number.isFinite(latTaller) &&
            Number.isFinite(lngTaller)
          ) {
            km_distance = calcularDistanciaKm(
              location.latitude,
              location.longitude,
              latTaller,
              lngTaller,
            );
          }

          return {
            ...item,
            km_distance,
          };
        });

        const sortedByDistance = [...withDistance].sort((a, b) => {
          const distA =
            a?.km_distance != null && Number.isFinite(Number(a.km_distance))
              ? Number(a.km_distance)
              : Number.POSITIVE_INFINITY;
          const distB =
            b?.km_distance != null && Number.isFinite(Number(b.km_distance))
              ? Number(b.km_distance)
              : Number.POSITIVE_INFINITY;
          return distA - distB;
        });

        setDataByCategory(sortedByDistance);
      } else {
        setDataByCategory([]);
      }
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setDataByCategory([]);
      setSelectedCategory(category);
    }
  }, []);

  const getCategoryById = async id => {
    try {
      // Validar que se pase un ID válido
      if (!id) {
        console.error('El ID proporcionado no es válido.');
        return;
      }

      // Realizar la solicitud GET utilizando Axios
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar que la respuesta del servidor sea exitosa
      if (response.status === 200) {
        const result = response.data;

        if (result.categories) {
          // Filtrar la categoría correspondiente al ID
          const filteredCategory = result.categories.find(
            category => category.id === id,
          );

          if (filteredCategory) {
            setCategories(filteredCategory); // Almacenar como un array con un solo elemento
          } else {
            console.warn(
              'No se encontró una categoría con el ID proporcionado.',
            );
            setCategories([]);
          }
        } else {
          console.warn(
            'La respuesta no contiene un array válido de categorías.',
          );
          setCategories([]);
        }
      } else {
        // Respuesta inesperada, establecer un array vacío
        setCategories([]);
      }
    } catch (error) {
      // Manejar errores en la solicitud
      setCategories([]);
      if (error.response) {
        console.error(
          'Error en la solicitud:',
          error.response.data?.message || error.response.statusText,
        );
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  useEffect(() => {
    console.log('**************************************34')
    console.log('CategoryDetail useEffect:', uid);
    console.log('**************************************34')
    
    getDataByCategories(uid);
    getCategoryById(uid);
  }, []);

  const handleSearchChange = (text) => {
    setSearchText(text);
    if (text === '') {
      getDataByCategories(uid);
    } else {
      const filtered = dataByCategory.filter(data_category =>
        data_category.nombre_servicio.toLowerCase().includes(text.toLowerCase())
      );
      setDataByCategory(filtered);
    }
  };

  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSub = isDark ? '#9CA3AF' : '#6B7280';
  const searchBg = isDark ? '#1F2344' : '#FFFFFF';
  const borderColor = isDark ? '#2A2E56' : '#E5E7EB';
  const headerTitleRaw = categories?.nombre ? categories.nombre : 'Categoría';
  const headerTitleDisplay =
    headerTitleRaw.length > 15 ? `${headerTitleRaw.slice(0, 15)}...` : headerTitleRaw;

  return (
    <View style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2344" />

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[external.Pb_30]}>

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
            placeholder="Filtrar por servicio"
            placeholderTextColor={textSub || appColors.subtitle}
            style={[
              styles.searchInput,
              commonStyles.subtitleText,
              {textAlign: textRTLStyle, color: textPrimary},
            ]}
            onChangeText={handleSearchChange}
            value={searchText}
            onFocus={() => setIsFocusedSearch(true)}
            onBlur={() => setIsFocusedSearch(false)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Text style={[styles.clearBtn, {color: textSub}]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.listWrap}>
          <NewCategoriesDetail
            data={dataByCategory}
            horizontal={false}
            numColumns={2}
            width={windowWidth(222)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBlock: {
    backgroundColor: '#1F2344',
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
  pillText: {
    color: '#FFD60A',
    fontSize: 12,
    fontWeight: '600',
  },
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
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    marginLeft: 8,
  },
  clearBtn: {
    fontSize: 13,
    paddingHorizontal: 2,
  },
  listWrap: {
    paddingTop: 2,
  },
});

export default CategoryDetail;
