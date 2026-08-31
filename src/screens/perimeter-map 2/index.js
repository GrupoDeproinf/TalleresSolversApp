import React, { useEffect, useState } from 'react';
import { Dimensions, View, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform, Alert, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { MapPin, Navigation, Clock, Map } from 'lucide-react-native';
import NearlyTallerItem from './components/nearlyTaller';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import MapTalleres from '../mapTalleres';

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

        const response = await api.post('/distance/nearby', {
          estado: userInfo?.estado,
          lat: location?.latitude,
          lng: location?.longitude,
          radio: searchRadius || 10, // Valor por defecto si no hay radio seleccionado
        });

        // console.log('✅ Respuesta de talleres:', response.data.talleres);
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

  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#2D3261', padding: 20 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#eeeeee' }}>
            negocios cercanos
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ffca00',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
            activeOpacity={0.7}
            onPress={() => {
              // Aquí puedes agregar la navegación al mapa
              // console.log('🏢 Talleres:', talleres);
              setshowMap(true);
            }}
          >
            <Map size={16} color="#162556" />
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#162556',
              marginLeft: 6,
            }}>
              Ver mapa
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 14, color: '#e8eaf6', marginBottom: 20 }}>
          Aquí se mostrarán los negocios cercanos a tu ubicación.
        </Text>

      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: screenWidth,
          height: screenHeight * 0.7,
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
                return taller?.distancia !== undefined && taller?.distancia !== null && taller?.distancia <= searchRadius;
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
                Buscando negocios cercanos...
              </Text>
            </View>
          ) : talleres.length > 0 ? (
            talleres
              .map(taller => {
                // Usar la distancia que viene de la API
                console.log('🏢 Taller:', taller);
                let distanciaMostrada = 'Distancia no disponible';
                if (taller?.distancia !== undefined && taller?.distancia !== null) {
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
                if (taller?.distancia !== undefined && taller?.distancia !== null) {
                  return taller?.distancia <= searchRadius;
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
                {!location ? 'Obtén tu ubicación para ver negocios cercanos' : 'Selecciona un estado para buscar talleres'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>


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

const stylesMap = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PerimeterMapScreen;
