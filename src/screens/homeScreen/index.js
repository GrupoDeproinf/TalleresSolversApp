import {ScrollView, View, Text, TextInput, Alert, PermissionsAndroid, Platform, TouchableOpacity} from 'react-native';
import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import HeaderContainer from '../../components/homeScreen/headerContainer';
import SearchContainer from '../../components/homeScreen/searchContainer';
import BannerContainer from '../../components/homeScreen/bannerContainer';
import NewArrivalContainer from '../../components/homeScreen/newArrivalContainer';
import styles from './style.css';
import {newArrivalSmallData} from '../../data/homeScreen/newArrivalData';
import {external} from '../../style/external.css';
import {useValues} from '../../../App';
import ProductSwiper from '../../components/homeScreen/productSwiper';
import {useNavigation} from '@react-navigation/native';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShowProductsContainer from '../../components/homeScreen/showProducts';
// import Search from '../../components/icons/Search';
import {Search} from '../../assets/icons/search';
import {commonStyles, textRTLStyle} from '../../../src/style/commonStyle.css';
import appColors from '../../../src/themes/appColors';
import Geolocation from '@react-native-community/geolocation';


const HomeScreen = () => {
  const {bgFullStyle, t} = useValues();
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [dataByCategory, setDataByCategory] = useState(null);
  const [dataByCategoryOriginal, setdataByCategoryOriginal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [originalCategory, setoriginalCategory] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 10;
  const scrollEndTriggered = useRef(false);
  const searchDebounceRef = useRef(null);
  const searchTextRef = useRef('');

  const normalizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n');
  };  

  const fetchWithFilterAndCategory = useCallback(async (filterValue) => {
    const uidCategoria = selectedCategory && selectedCategory !== 'Todos' ? selectedCategory : '';

    setPageIndex(1);
    setHasMore(true);
    scrollEndTriggered.current = false;
    setData([]);
    setOriginalData([]);
    setDataByCategory([]);
    setdataByCategoryOriginal([]);

    try {
      const body = {
        pageIndex: 1,
        pageSize: PAGE_SIZE,
        filter: filterValue || '',
        uid_categoria: uidCategoria,
        id: '',
        latitude: location?.latitude ?? '',
        longitude: location?.longitude ?? '',
      };
      console.log('body', body);
      const response = await api.post('/home/getServiciosPaginados', body);
      const newItems = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      const hasMorePages = newItems.length >= PAGE_SIZE;

      if (uidCategoria) {
        setDataByCategory(newItems);
        setdataByCategoryOriginal(newItems);
      } else {
        setData(newItems);
        setOriginalData(newItems);
        setDataByCategory(newItems);
        setdataByCategoryOriginal(newItems);
      }
      setHasMore(hasMorePages);
      setPageIndex(1);
    } catch (error) {
      console.error('Error fetching search data:', error);
      setData([]);
      setOriginalData([]);
      setDataByCategory([]);
      setdataByCategoryOriginal([]);
    }
  }, [selectedCategory]);

  const SEARCH_DEBOUNCE_MS = 1500;

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
    searchTextRef.current = text;
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null;
      const filterToSend = searchTextRef.current;
      fetchWithFilterAndCategory(filterToSend);
    }, SEARCH_DEBOUNCE_MS);
  }, [fetchWithFilterAndCategory]);

  const updateCategories = (data) => {
    const uniqueCategories = [...new Set(data.map(item => item.categoria))];
    const updatedCategories = originalCategory.filter(category => 
      category.id === 'Todos' || uniqueCategories.includes(category.nombre)
    );
    setCategories(updatedCategories);
  };

  const fetchProductsPage = useCallback(async (page, { append = false } = {}) => {
    const uidCategoria = selectedCategory && selectedCategory !== 'Todos' ? selectedCategory : '';
    const body = {
      pageIndex: page,
      pageSize: PAGE_SIZE,
      filter: searchText || '',
      uid_categoria: uidCategoria || '',
      id: '',
      latitude: location?.latitude ?? '',
      longitude: location?.longitude ?? '',
    };
    console.log('body', body);
    try {
      const response = await api.post('/home/getServiciosPaginados', body);
      const newItems = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      const hasMorePages = newItems.length >= PAGE_SIZE;

      console.log("response", response);
      console.log("newItems", newItems);

      if (append) {
        if (uidCategoria) {
          setDataByCategory(prev => (prev ? [...prev, ...newItems] : newItems));
          setdataByCategoryOriginal(prev => (prev ? [...prev, ...newItems] : newItems));
        } else {
          setData(prev => [...prev, ...newItems]);
          setOriginalData(prev => [...prev, ...newItems]);
          setDataByCategory(prev => (prev ? [...prev, ...newItems] : newItems));
          setdataByCategoryOriginal(prev => (prev ? [...prev, ...newItems] : newItems));
        }
      } else {
        if (uidCategoria) {
          setDataByCategory(newItems);
          setdataByCategoryOriginal(newItems);
        } else {
          setData(newItems);
          setOriginalData(newItems);
          setDataByCategory(newItems);
          setdataByCategoryOriginal(newItems);
        }
      }
      setHasMore(hasMorePages);
      setPageIndex(page);
    } catch (error) {
      console.error('Error fetching paginated data:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
      if (append) scrollEndTriggered.current = false;
    }
  }, [selectedCategory, searchText]);

  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    scrollEndTriggered.current = true;
    const nextPage = pageIndex + 1;
    fetchProductsPage(nextPage, { append: true });
  }, [loadingMore, hasMore, pageIndex, fetchProductsPage]);

  const handleScrollViewScroll = useCallback(
    ({ nativeEvent }) => {
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      const padding = 120;
      const isNearBottom =
        contentOffset.y + layoutMeasurement.height >= contentSize.height - padding;

      if (isNearBottom) {
        if (!scrollEndTriggered.current && hasMore && !loadingMore) {
          loadMoreProducts();
        }
      } else {
        scrollEndTriggered.current = false;
      }
    },
    [hasMore, loadingMore, loadMoreProducts]
  );

  const getData = useCallback(async () => {
    try {
      setPageIndex(1);
      setHasMore(true);
      const uidCategoria = '';
      const body = {
        pageIndex: 1,
        pageSize: PAGE_SIZE,
        filter: '',
        uid_categoria: uidCategoria,
        id: '',
        latitude: location?.latitude ?? '',
        longitude: location?.longitude ?? '',
      };
      console.log('body', body);
      const response = await api.post('/home/getServiciosPaginados', body);
      const newItems = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      const hasMorePages = newItems.length >= PAGE_SIZE;

      setData(newItems);
      setOriginalData(newItems);
      setDataByCategory(newItems);
      setdataByCategoryOriginal(newItems);
      setHasMore(hasMorePages);
      setPageIndex(1);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setOriginalData([]);
      setCategories([]);
    }
  }, []);

  const getDataByCategories = useCallback(async (category, filterValue) => {
    try {
      setSelectedCategory(category);
      setPageIndex(1);
      setHasMore(true);
      const body = {
        pageIndex: 1,
        pageSize: PAGE_SIZE,
        filter: filterValue ?? searchText ?? '',
        uid_categoria: category === 'Todos' ? '' : category,
        id: '',
        latitude: location?.latitude ?? '',
        longitude: location?.longitude ?? '',
      };
      console.log('body', body);
      const response = await api.post('/home/getServiciosPaginados', body);
      const newItems = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      const hasMorePages = newItems.length >= PAGE_SIZE;

      setDataByCategory(newItems);
      setdataByCategoryOriginal(newItems);
      setHasMore(hasMorePages);
      setPageIndex(1);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setDataByCategory([]);
      setdataByCategoryOriginal([]);
      setSelectedCategory(category);
    }
  }, [searchText]);

  const returnValues = useCallback(
    category => {
      console.log('Selected category:', category);


      if (category === 'Todos') {
        setDataByCategory(null);
        setSelectedCategory(null);
        getData();
      } else {
        getDataByCategories(category);
      }
    },
    [getDataByCategories],
  );

  useEffect(() => {
    getData();
    getCategories();
  }, [getData]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // useEffect separado para la ubicación - siempre actualiza al entrar al componente
  useEffect(() => {
    // Siempre solicitar nueva ubicación cada vez que se entre al componente
    const initializeLocation = () => {
      console.log('🔄 Inicializando ubicación - solicitando nueva ubicación...');
      const timeoutId = setTimeout(() => {
        requestLocationPermission();
      }, 1000);
      
      // Limpiar timeout si el componente se desmonta
      return () => clearTimeout(timeoutId);
    };
    
    initializeLocation();
  }, []); // Solo se ejecuta una vez al montar el componente


  const getCategories = async () => {
    try {
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const result = response.data;

        if (Array.isArray(result.categories)) {
          console.log('Categories:', result.categories);
          result.categories.unshift({id: 'Todos', nombre: 'Todos'});
          setCategories(result.categories);
          setoriginalCategory(result.categories)
        } else {
          console.warn(
            'La respuesta no contiene un array válido de categorías.',
          );
          setCategories([]);
          setoriginalCategory([])
        }
      } else {
        setCategories([]);
        setoriginalCategory([])
      }
    } catch (error) {
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

  // Función para obtener la ubicación actual
  const getCurrentLocation = () => {
    console.log('🔍 Ejecutando getCurrentLocation en HomeScreen...');
    setIsLoadingLocation(true);
    
    Geolocation.getCurrentPosition(
      info => {
        console.log('📍 Ubicación obtenida en HomeScreen:', info);
        const { latitude, longitude } = info.coords;
        console.log('🔍 Ubicación obtenida:', latitude, longitude);
        
        // Siempre actualizar la ubicación con los nuevos valores
        setLocation({ latitude, longitude });
        
        setIsLoadingLocation(false);
        
        // Guardar la ubicación en AsyncStorage para uso posterior
        AsyncStorage.setItem('@userLocation', JSON.stringify({ latitude, longitude }))
          .then(() => console.log('📍 Ubicación guardada en AsyncStorage'))
          .catch(error => console.error('Error al guardar ubicación:', error));
      },
      error => {
        console.error('❌ Error al obtener la ubicación en HomeScreen:', error);
        setIsLoadingLocation(false);
        
        // Mostrar un mensaje de error más específico según el tipo de error
        let errorMessage = 'No se pudo obtener tu ubicación.';
        
        switch (error.code) {
          case 1:
            errorMessage = 'Permiso de ubicación denegado. Ve a Configuración > Aplicaciones > [Tu App] > Permisos y habilita la ubicación.';
            break;
          case 2:
            errorMessage = 'Ubicación no disponible. Verifica que el GPS esté activado.';
            break;
          case 3:
            errorMessage = 'Tiempo de espera agotado. Verifica tu conexión GPS y vuelve a intentar.';
            break;
          default:
            errorMessage = 'Error al obtener ubicación. Verifica que el GPS esté activado y que hayas concedido permisos.';
        }
        
        Alert.alert(
          'Error de ubicación',
          errorMessage,
          [
            { text: 'Reintentar', onPress: () => requestLocationPermission() },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      },
      {
        enableHighAccuracy: true, // Habilitado para obtener ubicación más precisa
        timeout: 15000, // Timeout de 15 segundos
        maximumAge: 0, // Siempre obtener ubicación fresca, no usar caché
      }
    );
  };

  // Función para solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const fine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        const coarse = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);

        console.log('Permiso fine:', fine);
        console.log('Permiso coarse:', coarse);

        // Si ya tenemos permisos, obtener ubicación directamente
        if (fine === PermissionsAndroid.RESULTS.GRANTED || coarse === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permisos ya concedidos en HomeScreen');
          const timeoutId = setTimeout(() => {
            getCurrentLocation();
          }, 500);
          return;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message: 'Esta app necesita acceder a tu ubicación para mostrar servicios cercanos',
            buttonNeutral: 'Pregúntame después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso concedido en HomeScreen');
          
          // Espera un momento antes de obtener ubicación
          const timeoutId = setTimeout(() => {
            getCurrentLocation();
          }, 1000);
        } else {
          console.warn('Permiso de ubicación denegado en HomeScreen');
          Alert.alert(
            'Permiso denegado',
            'Necesitas conceder permisos de ubicación para usar esta función.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Para iOS, intentar obtener ubicación directamente
        getCurrentLocation();
      }
    } catch (err) {
      console.error('Error al pedir permiso en HomeScreen:', err);
      Alert.alert(
        'Error de permisos',
        'Hubo un problema al solicitar permisos de ubicación.',
        [{ text: 'OK' }]
      );
    }
  };

  // Función para obtener ubicación guardada
  const getStoredLocation = async () => {
    try {
      const storedLocation = await AsyncStorage.getItem('@userLocation');
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        // Siempre actualizar el estado con la ubicación guardada
        console.log('📍 Ubicación recuperada de AsyncStorage:', parsedLocation);
        setLocation(parsedLocation);
        return parsedLocation;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener ubicación guardada:', error);
      return null;
    }
  };

  // Función para actualizar ubicación manualmente
  const updateLocation = () => {
    console.log('🔄 Actualizando ubicación...');
    requestLocationPermission();
  };

  // Función para obtener la ubicación actual (para uso en otros componentes)
  const getCurrentLocationData = () => {
    return location;
  };


  // const displayData = useMemo(() => 
  //   dataByCategory !== null
  //     ? dataByCategory.length > 0
  //       ? dataByCategory
  //       : data
  //     : data,
  //   [dataByCategory, data]
  // );

  const displayData = useMemo(() => 
    dataByCategory !== null
      ? dataByCategory.length > 0
        ? dataByCategory
        : []
      : [],
    [dataByCategory, data]
  );
  
  const displayTitle = useMemo(() => 
    selectedCategory
      ? dataByCategory && dataByCategory.length > 0
        ? `Servicios seleccionados`
        : 'Servicios'
      : 'Servicios',
    [selectedCategory, dataByCategory]
  );

  return (
    <ScrollView
      contentContainerStyle={[external.Pb_80]}
      style={[styles.container, {backgroundColor: bgFullStyle}]}
      showsVerticalScrollIndicator={false}
      onScroll={handleScrollViewScroll}
      scrollEventThrottle={200}
    >
      <HeaderContainer />

      <View style={{flexDirection: 'row', alignItems: 'center', margin: 10, padding: 8, borderWidth: 1, borderColor: '#2D3261', borderRadius: 10}}>
        <Search />
        <TextInput
          placeholder="Filtrar por servicio, taller, estado y categoria"
          placeholderTextColor={appColors.subtitle}
          style={[
            external.ph_5,
            commonStyles.subtitleText,
            {textAlign: textRTLStyle, flex: 1, height: 40, textAlignVertical: 'center', paddingVertical: 0}
          ]}
          onChangeText={handleSearchChange}
          value={searchText}
        />
      </View>

       

      <BannerContainer />

      <ProductSwiper returnValues={returnValues} categories={categories.length == 0 ? [] : categories}/>

      {displayData.length === 0 && (
        <View style={{padding: 20, alignItems: 'center'}}>
          <Text style={{fontSize: 16, color: '#666'}}>
            No se encontraron servicios para la categoría seleccionada.
          </Text>
        </View>
      )}

             <ShowProductsContainer
         data={displayData}
         value={displayTitle}
         show={true}
         showPlus={true}
         userLocation={location}
         onEndReached={loadMoreProducts}
         loadingMore={loadingMore}
         hasMore={hasMore}
       />

      
      {/* <NewArrivalContainer
        data={newArrivalSmallData}
        value={t('transData.topRating')}
        show={true}
        showPlus={true}
      /> */}
    </ScrollView>
  );
};

export default React.memo(HomeScreen);
