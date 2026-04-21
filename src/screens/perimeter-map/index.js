import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform, Alert, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { ArrowLeft, MapPin, Navigation, Clock, Map, SlidersHorizontal } from 'lucide-react-native';
import NearlyTallerItem from './components/nearlyTaller';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import MapComponent from '../mapMultimarker';
import MapTalleres from '../mapMultimarker'; // Importar el componente de mapa
import MapRutaComponent from '../mapRuta'; // Importar el componente de ruta

/** Solo para textos del listado de categorías (filtro): minúsculas y primera mayúscula. */
const categoryLabelSentenceCase = raw => {
  const s = String(raw ?? '').trim();
  if (!s) {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const RadioSelector = ({ options, selectedValue, onSelect, style }) => (
  <View style={[styles.radioContainer, style]}>
    {options.map(option => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.radioOption,
          selectedValue === option.value && styles.radioOptionSelected,
        ]}
        onPress={() => onSelect(option.value)}
        activeOpacity={0.7}>
        <View style={styles.radioContent}>
          {option.icon}
          <Text
            style={[
              styles.radioText,
              selectedValue === option.value && styles.radioTextSelected,
            ]}>
            {option.label}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

/** Ancho lógico ≥ esto: Pro Max / Plus / tablet; por debajo: Pro y modelos estándar (sin subtítulo en cabecera). */
const HEADER_SUBTITLE_MIN_WIDTH = 428;

const PerimeterMapScreen = () => {
  const navigation = useNavigation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const showHeaderSubtitle = screenWidth >= HEADER_SUBTITLE_MIN_WIDTH;

  const [searchRadius, setSearchRadius] = useState(5); // Valor por defecto
  const [talleres, setTalleres] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingTalleres, setIsLoadingTalleres] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMap, setshowMap] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedTallerForRoute, setSelectedTallerForRoute] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Función para manejar el clic en un taller
  const handleTallerPress = (taller) => {
    console.log('🏢 Taller seleccionado:', taller);
    console.log('🏢 Taller seleccionado:', taller.nombre, 'ID:', taller.id || taller.uid);
    navigation.navigate('TallerDetail', {
      tallerId: taller.id || taller.uid,
      tallerData: taller
    });
  };

  // Función para manejar el botón del mapa
  const handleMapButtonPress = () => {
    console.log('🗺️ Abriendo mapa con talleres...');
    setShowMapModal(true);
  };

  // Función para cerrar el modal del mapa
  const handleCloseMapModal = () => {
    setShowMapModal(false);
  };

  // Función para abrir el modal de filtros
  const handleOpenFilterModal = () => {
    setShowFilterModal(true);
  };

  // Función para cerrar el modal de filtros
  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  // Función para manejar la selección de categorías
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Función para aplicar filtros
  const handleApplyFilters = () => {
    console.log('Filtros aplicados:', selectedCategories);
    handleCloseFilterModal();
  };

  // Función para filtrar talleres por categorías seleccionadas
  const getFilteredTalleres = () => {
    if (selectedCategories.length === 0) {
      // Si no hay categorías seleccionadas, mostrar todos los talleres
      return talleres;
    }

    return talleres.filter(taller => {
      // Verificar si el taller tiene categorías
      if (!taller.categorias || taller.categorias.length === 0) {
        return false; // Si no tiene categorías, no mostrarlo
      }

      // Verificar si alguna de las categorías del taller coincide con las seleccionadas
      return taller.categorias.some(categoria =>
        selectedCategories.includes(categoria.uid_categoria)
      );
    });
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  // Función para manejar el botón de ruta
  const handleRoutePress = (taller) => {
    console.log('🗺️ Abriendo ruta hacia:', taller.nombre);
    setSelectedTallerForRoute(taller);
    setShowRouteModal(true);
  };

  // Función para cerrar el modal de ruta
  const handleCloseRouteModal = () => {
    setShowRouteModal(false);
    setSelectedTallerForRoute(null);
  };

  // Función para redirigir al detalle del taller
  const redirectToTaller = (taller) => {
    setshowMap(false);
    if (taller != null) {
      console.log('🏢 Taller:', taller);
      navigation.navigate('TallerDetail', {
        tallerId: taller.id || taller.uid,
        tallerData: taller
      });

    }
  }

  const getCategories = async () => {
    try {
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const result = response.data;
        if (result) {
          setCategories(result.categories);
          setFilteredCategories(result.categories);
        } else {
          console.warn('La respuesta no contiene un array válido de categorías.');
          setCategories([]);
          setFilteredCategories([]);
        }
      } else {
        setCategories([]);
        setFilteredCategories([]);
      }
    } catch (error) {
      setCategories([]);
      setFilteredCategories([]);
      if (error.response) {
        console.error('Error en la solicitud:', error.response.data?.message || error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };
  // Preparar las coordenadas de los talleres para el mapa
  const getTalleresCoordinates = () => {
    return getFilteredTalleres()
      .filter(taller => taller.ubicacion.latitud && taller.ubicacion.longitud)
      .map(taller => ({
        latitude: parseFloat(taller.ubicacion.latitud),
        longitude: parseFloat(taller.ubicacion.longitud),
        title: taller.nombre || 'Taller',
        description: taller.direccion || ''
      }));
  };

  // Componente del botón flotante de filtros
  const FloatingFilterButton = () => (
    <View style={{ position: "relative" }}>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 30,
          right: 20,
          backgroundColor: '#1F2344',
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
        activeOpacity={0.8}
        onPress={handleOpenFilterModal}
      >
        <SlidersHorizontal size={24} color="#FFD60A" />
      </TouchableOpacity>

      {/* Indicador de filtros activos */}
      {selectedCategories.length > 0 && (
        <View style={{
          position: "absolute",
          bottom: 70,
          right: 20,
          backgroundColor: "#ff4444",
          width: 20,
          height: 20,
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
          elevation: 4,
        }}>
          <Text style={{
            color: "#ffffff",
            fontSize: 10,
            fontWeight: "bold",
          }}>
            {selectedCategories.length}
          </Text>
        </View>
      )}
    </View>
  );

  useEffect(() => {
    getUserData();
    requestLocationPermission();
    getCategories();
  }, []);

  const radiusOptions = [
    {
      value: 5,
      label: '5km',
      icon: <MapPin size={14} color={searchRadius === 5 ? '#1F2344' : '#1F2344'} />,
    },
    {
      value: 10,
      label: '10km',
      icon: <Navigation size={14} color={searchRadius === 10 ? '#1F2344' : '#1F2344'} />,
    },
    {
      value: 20,
      label: '20km',
      icon: <Clock size={14} color={searchRadius === 20 ? '#1F2344' : '#1F2344'} />,
    },
  ];

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue ? JSON.parse(jsonValue) : null;
      console.log('Usuario obtenido:', user);
      if (user) setUserInfo(user);
    } catch (e) {
      console.error('Error al obtener el usuario:', e);
    }
  };

  const getCurrentLocation = () => {
    console.log('🔍 Ejecutando getCurrentLocation...');
    setIsLoadingLocation(true);

    Geolocation.getCurrentPosition(
      info => {
        console.log('📍 Ubicación obtenida:', info);
        const { latitude, longitude } = info.coords;
        console.log('🔍 Ubicación obtenida:', latitude, longitude);
        setLocation({ latitude, longitude });
        setIsLoadingLocation(false);
      },
      error => {
        console.error('❌ Error al obtener la ubicación:', error);
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
            { text: 'Reintentar', onPress: () => getCurrentLocation() },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      },
      {
        enableHighAccuracy: false, // Cambiado a false para mayor compatibilidad
        timeout: 15000, // Reducido el timeout a 15 segundos
        maximumAge: 60000, // Aumentado para usar ubicación en caché si está disponible
      }
    );
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const fine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        const coarse = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);

        console.log('Permiso fine:', fine);
        console.log('Permiso coarse:', coarse);

        // Si ya tenemos permisos, obtener ubicación directamente
        if (fine === PermissionsAndroid.RESULTS.GRANTED || coarse === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permisos ya concedidos');
          setTimeout(() => {
            getCurrentLocation();
          }, 500);
          return;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message: 'Esta app necesita acceder a tu ubicación para mostrar negocios cercanos',
            buttonNeutral: 'Pregúntame después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso concedido');

          // Espera un momento antes de obtener ubicación
          setTimeout(() => {
            getCurrentLocation();
          }, 1000);
        } else {
          console.warn('Permiso de ubicación denegado');
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
      console.error('Error al pedir permiso:', err);
      Alert.alert(
        'Error de permisos',
        'Hubo un problema al solicitar permisos de ubicación.',
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    const fetchNearbyTalleres = async () => {
      if (!location || !userInfo?.estado) return;

      setIsLoadingTalleres(true);

      try {
        console.log('🔍 Buscando negocios cercanos...');
        console.log('📍 Ubicación:', location);
        console.log('🏢 Estado:', userInfo.estado);
        console.log('📏 Radio:', searchRadius);

        const response = await api.post('/distance/getNearbyWithCategories', {
          estado: userInfo?.estado,
          lat: location?.latitude,
          lng: location?.longitude,
          radio: searchRadius || 5, // Valor por defecto si no hay radio seleccionado
        });

        console.log('✅ Respuesta de talleres:', response.data);
        setTalleres(response.data.talleres || response.data || []);
      } catch (error) {
        console.error('❌ Error al obtener negocios cercanos:', error);

        // Mostrar mensaje de error más específico
        if (error.response) {
          console.error('Error del servidor:', error.response.data);
          Alert.alert(
            'Error del servidor',
            'No se pudieron obtener los negocios cercanos. Inténtalo de nuevo más tarde.',
            [{ text: 'OK' }]
          );
        } else if (error.request) {
          console.error('Error de red:', error.request);
          Alert.alert(
            'Error de conexión',
            'No hay conexión a internet. Verifica tu conexión e inténtalo de nuevo.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Error',
            'Ocurrió un error inesperado al obtener los talleres.',
            [{ text: 'OK' }]
          );
        }

        setTalleres([]);
      } finally {
        setIsLoadingTalleres(false);
      }
    };

    fetchNearbyTalleres();
  }, [searchRadius, location, userInfo]);

  const visibleTalleres = useMemo(() => {
    const filtered = getFilteredTalleres();
    return filtered
      .map(taller => {
        const hasDistance =
          taller?.distancia !== undefined && taller?.distancia !== null;
        const distanciaMostrada = hasDistance
          ? `${Number(taller.distancia).toFixed(2)} km`
          : 'Distancia no disponible';
        return {
          ...taller,
          distanciaMostrada,
          hasDistance,
        };
      })
      .filter(taller => (taller.hasDistance ? taller.distancia <= searchRadius : true))
      .sort((a, b) => {
        if (a.hasDistance && b.hasDistance) return a.distancia - b.distancia;
        if (a.hasDistance) return -1;
        if (b.hasDistance) return 1;
        return 0;
      });
  }, [talleres, selectedCategories, searchRadius]);

  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#1F2344', padding: 20, overflow: 'hidden' }}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: 'rgba(255,214,10,0.14)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}>
            <ArrowLeft size={20} color="#FFD60A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFD60A', flex: 1 }}>
            Negocios cercanos
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#ffca00',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            activeOpacity={0.7}
            onPress={() => setshowMap(true)}
          >
            <Map size={16} color="#162556" style={{ marginRight: 6 }} />
            <Text style={{
              color: '#162556',
              fontSize: 14,
              fontWeight: '600'
            }}>
              Ver mapa
            </Text>
          </TouchableOpacity>
        </View>
        {showHeaderSubtitle ? (
          <Text style={{ fontSize: 14, color: '#e8eaf6', marginBottom: 20 }}>
            Aquí se mostrarán los negocios cercanos a tu ubicación.
            {selectedCategories.length > 0 && (
              <Text style={{ color: '#ffca00', fontWeight: 'bold' }}>
                {' '}
                Filtrados por {selectedCategories.length} categoría
                {selectedCategories.length > 1 ? 's' : ''}
              </Text>
            )}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: screenWidth,
          height: screenHeight * 0.77,
          backgroundColor: '#fff',
          borderTopLeftRadius: 60,
          borderTopRightRadius: 60,
          paddingTop: 20,
          paddingHorizontal: 30,
          elevation: 8,
        }}>
        <View style={styles.bottomSelectorContainer}>
          <Text style={styles.bottomSelectorLabel}>Buscar en un radio de:</Text>
          <RadioSelector
            options={radiusOptions}
            selectedValue={searchRadius}
            onSelect={setSearchRadius}
            style={styles.bottomSelector}
          />
          {location && talleres.length > 0 && (
            <Text style={{
              color: '#1F2344',
              fontSize: 14,
              marginTop: 10,
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {getFilteredTalleres().filter(taller => {
                return taller.distancia !== undefined && taller.distancia !== null && taller.distancia <= searchRadius;
              }).length} negocios encontrados en {searchRadius}km
              {selectedCategories.length > 0 && ` (filtrados por ${selectedCategories.length} categoría${selectedCategories.length > 1 ? 's' : ''})`}
            </Text>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {isLoadingTalleres ? (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
              <View style={{
                backgroundColor: '#1F2344',
                borderRadius: 999,
                paddingVertical: 10,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <ActivityIndicator size="small" color="#FFD60A" style={{ marginRight: 10 }} />
                <Text style={{ color: '#FFD60A', fontSize: 14, fontWeight: '700' }}>
                Buscando negocios cercanos...
                </Text>
              </View>
            </View>
          ) : visibleTalleres.length > 0 ? (
            visibleTalleres.map(taller => (
              <NearlyTallerItem
                key={taller.id || taller.uid}
                item={{
                  nombre: taller.nombre,
                  direccion: taller.Direccion || 'Dirección no disponible',
                  distancia: taller.distanciaMostrada,
                  estado: taller.estado,
                  metodosPago: taller.metodos_pago,
                }}
                onPress={() => handleTallerPress(taller)}
                onRoutePress={() => handleRoutePress(taller)}
                navigation={navigation}
              />
            ))
          ) : location && userInfo?.estado ? (
            <View style={{
              alignItems: 'center',
              padding: 20
            }}>
              <Text style={{ color: '#94A3B8', fontSize: 16, textAlign: 'center' }}>
                {selectedCategories.length > 0
                  ? `No se encontraron talleres con las categorías seleccionadas en un radio de ${searchRadius}km`
                  : `No se encontraron talleres en un radio de ${searchRadius}km`
                }
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
                {selectedCategories.length > 0
                  ? 'Intenta cambiar las categorías o aumentar el radio de búsqueda'
                  : 'Intenta aumentar el radio de búsqueda'
                }
              </Text>
            </View>
          ) : (
            <View style={{
              alignItems: 'center',
              padding: 20
            }}>
              <Text style={{ color: '#94A3B8', fontSize: 16, textAlign: 'center' }}>
                {!location ? 'Obtén tu ubicación para ver negocios cercanos' : 'Selecciona un estado para buscar negocios'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Mapa condicional */}
        {showMap == true ? (
          <View
            style={[stylesMap.container, { marginTop: 5, marginBottom: 15 }]}>
            {getFilteredTalleres().length > 0 ? (
              <MapTalleres
                talleres={getFilteredTalleres()}
                // edit={false}
                returnFunction={redirectToTaller}
              // useThisCoo={true}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Botón flotante de filtros */}
      <FloatingFilterButton />

      {/* Modal del mapa con talleres */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showMapModal}
        onRequestClose={handleCloseMapModal}
      >
        <View style={{ flex: 1 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            paddingTop: 50,
            backgroundColor: '#1F2344',
          }}>
            <Text style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 'bold',
            }}>
              Mapa de Talleres
            </Text>
            <TouchableOpacity
              onPress={handleCloseMapModal}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <MapComponent
            initialRegion={location || {
              latitude: 19.4326,
              longitude: -99.1332,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
            edit={false}
            returnFunction={handleCloseMapModal}
            useThisCoo={true}
            coordinatesList={getTalleresCoordinates()}
          />
        </View>
      </Modal>

      {/* Modal del selector de filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={handleCloseFilterModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            minHeight: 500,
            maxHeight: '80%',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1F2344',
              }}>
                Filtros
              </Text>
              <TouchableOpacity
                onPress={handleCloseFilterModal}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#f0f0f0',
                }}
              >
                <Text style={{ color: '#1F2344', fontSize: 16, fontWeight: 'bold' }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contenido del selector de filtros */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1F2344',
                marginBottom: 15,
              }}>
                Filtrar por categorías
              </Text>

              {/* Categorías como etiquetas (misma lógica de selección) */}
              <ScrollView
                style={styles.categoryTagsScroll}
                contentContainerStyle={styles.categoryTagsScrollContent}
                showsVerticalScrollIndicator={false}>
                {categories.length > 0 ? (
                  <View style={styles.categoryTagsWrap}>
                    {categories.map(category => {
                      const selected = selectedCategories.includes(category.id);
                      const label = categoryLabelSentenceCase(
                        category.nombre ||
                          category.name ||
                          'Categoría sin nombre',
                      );
                      return (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryTag,
                            selected && styles.categoryTagSelected,
                          ]}
                          onPress={() => handleCategoryToggle(category.id)}
                          activeOpacity={0.75}>
                          <Text
                            style={[
                              styles.categoryTagText,
                              selected && styles.categoryTagTextSelected,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {label}
                          </Text>
                          {selected ? (
                            <Text style={styles.categoryTagCheck}>✓</Text>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.categoryTagsEmpty}>
                    <ActivityIndicator size="small" color="#1F2344" />
                    <Text style={styles.categoryTagsEmptyText}>
                      {categoryLabelSentenceCase('Cargando categorías...')}
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Botones de acción */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
                paddingTop: 15,
                borderTopWidth: 1,
                borderTopColor: '#e9ecef'
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#f8f9fa',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#e9ecef',
                    flex: 1,
                    marginRight: 10,
                  }}
                  onPress={handleClearFilters}
                >
                  <Text style={{
                    color: '#1F2344',
                    fontSize: 14,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    Limpiar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#1F2344',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    flex: 1,
                    marginLeft: 10,
                  }}
                  onPress={handleApplyFilters}
                >
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 14,
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    Aplicar ({selectedCategories.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal del componente de ruta */}
      {showRouteModal && selectedTallerForRoute && (
        <MapRutaComponent
          initialRegion={{
            latitude: parseFloat(selectedTallerForRoute.ubicacion?.latitud || selectedTallerForRoute.ubicacion?.lat || 0),
            longitude: parseFloat(selectedTallerForRoute.ubicacion?.longitud || selectedTallerForRoute.ubicacion?.lng || 0),
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
            name_taller: selectedTallerForRoute.nombre
          }}
          edit={false}
          returnFunction={handleCloseRouteModal}
          useThisCoo={true}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headerCircle1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,214,10,0.12)',
    top: -30,
    right: -20,
  },
  headerCircle2: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 52,
    left: -14,
  },
  bottomSelectorContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  bottomSelectorLabel: {
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 12,
    fontWeight: '600',
  },
  bottomSelector: {
    backgroundColor: '#F8FAFF',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E1E7FF',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 2,
    backgroundColor: 'transparent',
  },
  radioOptionSelected: {
    backgroundColor: '#ffca00',
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2344',
    marginLeft: 6,
  },
  radioTextSelected: {
    color: '#1F2344',
  },
  categoryTagsScroll: {
    maxHeight: 350,
  },
  categoryTagsScrollContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  categoryTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '100%',
    gap: 6,
  },
  categoryTagSelected: {
    backgroundColor: '#ffca00',
    borderColor: '#E7BF00',
    borderWidth: 1.5,
  },
  categoryTagText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 220,
  },
  categoryTagTextSelected: {
    color: '#1F2344',
    fontWeight: '700',
  },
  categoryTagCheck: {
    color: '#1F2344',
    fontSize: 14,
    fontWeight: '800',
  },
  categoryTagsEmpty: {
    alignItems: 'center',
    padding: 20,
  },
  categoryTagsEmptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

// Estilos para el mapa
const stylesMap = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: 300, // Altura fija para el mapa
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default PerimeterMapScreen;
