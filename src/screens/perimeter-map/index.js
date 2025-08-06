import React, { useEffect, useState } from 'react';
import { Dimensions, View, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import { Text } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { MapPin, Navigation, Clock, Map, SlidersHorizontal } from 'lucide-react-native';
import NearlyTallerItem from './components/nearlyTaller';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import MapComponent from '../mapMultimarker';
import MapTalleres from '../mapMultimarker'; // Importar el componente de mapa

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

const PerimeterMapScreen = () => {
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  const [searchRadius, setSearchRadius] = useState(10); // Valor por defecto
  const [talleres, setTalleres] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingTalleres, setIsLoadingTalleres] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMap, setshowMap] = useState(false);

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
  // Preparar las coordenadas de los talleres para el mapa
  const getTalleresCoordinates = () => {
    return talleres
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
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: "#162556",
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
      <SlidersHorizontal size={24} color="#E4E4E7" />
    </TouchableOpacity>
  );

  useEffect(() => {
    getUserData();
    requestLocationPermission();
  }, []);

  const radiusOptions = [
    {
      value: 5,
      label: '5km',
      icon: <MapPin size={14} color={searchRadius === 5 ? '#162556' : '#162556'} />,
    },
    {
      value: 10,
      label: '10km',
      icon: <Navigation size={14} color={searchRadius === 10 ? '#162556' : '#162556'} />,
    },
    {
      value: 20,
      label: '20km',
      icon: <Clock size={14} color={searchRadius === 20 ? '#162556' : '#162556'} />,
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
          message: 'Esta app necesita acceder a tu ubicación para mostrar talleres cercanos',
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
        console.log('🔍 Buscando talleres cercanos...');
        console.log('📍 Ubicación:', location);
        console.log('🏢 Estado:', userInfo.estado);
        console.log('📏 Radio:', searchRadius);

        const response = await api.post('/distance/nearby', {
          estado: userInfo?.estado,
          lat: location?.latitude,
          lng: location?.longitude,
          radio: searchRadius || 10, // Valor por defecto si no hay radio seleccionado
        });

        console.log('✅ Respuesta de talleres:', response.data);
        setTalleres(response.data.talleres || response.data || []);
      } catch (error) {
        console.error('❌ Error al obtener talleres cercanos:', error);
        
        // Mostrar mensaje de error más específico
        if (error.response) {
          console.error('Error del servidor:', error.response.data);
          Alert.alert(
            'Error del servidor',
            'No se pudieron obtener los talleres cercanos. Inténtalo de nuevo más tarde.',
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

  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#2D3261', padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#eeeeee', flex: 1 }}>
            Talleres cercanos
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
            activeOpacity={0.8}
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
        <Text style={{ fontSize: 14, color: '#e8eaf6', marginBottom: 20 }}>
          Aquí se mostrarán los talleres cercanos a tu ubicación.
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: screenWidth,
          height: screenHeight * 0.8,
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
              color: '#2D3261', 
              fontSize: 14, 
              marginTop: 10,
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {talleres.filter(taller => {
                return taller.distancia !== undefined && taller.distancia !== null && taller.distancia <= searchRadius;
              }).length} talleres encontrados en {searchRadius}km
            </Text>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {isLoadingTalleres ? (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 20 
            }}>
              <ActivityIndicator size="small" color="#2D3261" style={{ marginRight: 10 }} />
              <Text style={{ color: '#2D3261', fontSize: 14 }}>
                Buscando talleres cercanos...
              </Text>
            </View>
          ) : talleres.length > 0 ? (
            talleres
              .map(taller => {
                // Usar la distancia que viene de la API
                console.log('🏢 Taller:', taller);
                let distanciaMostrada = 'Distancia no disponible';
                if (taller.distancia !== undefined && taller.distancia !== null) {
                  distanciaMostrada = `${taller.distancia.toFixed(2)} km`;
                  console.log('🏢 Taller:', taller.nombre, 'Distancia de API:', distanciaMostrada);
                } else {
                  console.log('🏢 Taller:', taller.nombre, 'No hay distancia en la API');
                }
                
                return {
                  ...taller,
                  distanciaMostrada
                };
              })
              .filter(taller => {
                // Filtrar por radio usando la distancia de la API
                if (taller.distancia !== undefined && taller.distancia !== null) {
                  return taller.distancia <= searchRadius;
                }
                // Si no hay distancia, mostrar el taller de todas formas
                return true;
              })
              .sort((a, b) => {
                // Ordenar por distancia (más cercanos primero)
                if (a.distancia !== undefined && b.distancia !== undefined) {
                  return a.distancia - b.distancia;
                }
                return 0;
              })
              .map(taller => (
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
                  navigation={navigation}
                />
              ))
          ) : location && userInfo?.estado ? (
            <View style={{ 
              alignItems: 'center', 
              padding: 20 
            }}>
              <Text style={{ color: '#94A3B8', fontSize: 16, textAlign: 'center' }}>
                No se encontraron talleres en un radio de {searchRadius}km
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
                Intenta aumentar el radio de búsqueda
              </Text>
            </View>
          ) : (
            <View style={{ 
              alignItems: 'center', 
              padding: 20 
            }}>
              <Text style={{ color: '#94A3B8', fontSize: 16, textAlign: 'center' }}>
                {!location ? 'Obtén tu ubicación para ver talleres cercanos' : 'Selecciona un estado para buscar talleres'}
              </Text>
            </View>
          )}
                 </ScrollView>

         {/* Mapa condicional */}
         {showMap == true ? (
           <View
             style={[stylesMap.container, { marginTop: 5, marginBottom: 15 }]}>
             {talleres.length > 0 ? (
               <MapTalleres
                 talleres={talleres}
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
            backgroundColor: '#2D3261',
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
            minHeight: 300,
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
                color: '#2D3261',
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
                <Text style={{ color: '#2D3261', fontSize: 16, fontWeight: 'bold' }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contenido del selector de filtros */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#2D3261',
                marginBottom: 15,
              }}>
                Opciones de filtro
              </Text>
              
              {/* Aquí puedes agregar más opciones de filtro */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#e9ecef',
                }}
                onPress={() => {
                  console.log('Filtro 1 seleccionado');
                  handleCloseFilterModal();
                }}
              >
                <Text style={{ color: '#2D3261', fontSize: 14 }}>
                  Filtro por distancia
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#e9ecef',
                }}
                onPress={() => {
                  console.log('Filtro 2 seleccionado');
                  handleCloseFilterModal();
                }}
              >
                <Text style={{ color: '#2D3261', fontSize: 14 }}>
                  Filtro por servicios
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#e9ecef',
                }}
                onPress={() => {
                  console.log('Filtro 3 seleccionado');
                  handleCloseFilterModal();
                }}
              >
                <Text style={{ color: '#2D3261', fontSize: 14 }}>
                  Filtro por horario
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
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
    color: '#162556',
    marginLeft: 6,
  },
     radioTextSelected: {
     color: '#162556',
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
