import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView
} from 'react-native';
// import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { commonStyles } from '../../style/commonStyle.css';
import Icons from 'react-native-vector-icons/FontAwesome'; // Asegúrate de importar el ícono que estás usando

import MapView, { Marker, Callout } from 'react-native-maps';

const MapTalleres = ({ talleres = [], initialRegion = null, edit = false, returnFunction = null, useThisCoo = false }) => {


  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [tallerInfoModal, setTallerInfoModal] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState(null);

  const [showbutton, setshowbutton] = useState(true);
  const [gpsModalVisible, setGpsModalVisible] = useState(false);

  const mapStyle = [
    // Aquí puedes añadir tu estilo personalizado para el mapa
  ];

  // Región por defecto si no se proporciona una
  const defaultRegion = {
    latitude: 10.4806,
    longitude: -66.9036,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Función para calcular la región que incluya todos los talleres
  const getRegionForTalleres = () => {
    if (!talleres || talleres.length === 0) {
      return initialRegion || defaultRegion;
    }

    let minLat = talleres[0].ubicacion.lat;
    let maxLat = talleres[0].ubicacion.lat;
    let minLng = talleres[0].ubicacion.lng;
    let maxLng = talleres[0].ubicacion.lng;

    talleres.forEach(taller => {
      minLat = Math.min(minLat, taller.ubicacion.lat);
      maxLat = Math.max(maxLat, taller.ubicacion.lat);
      minLng = Math.min(minLng, taller.ubicacion.lng);
      maxLng = Math.max(maxLng, taller.ubicacion.lng);
    });

    const latDelta = (maxLat - minLat) * 1.5; // Agregar padding
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message: 'Esta aplicación necesita acceso a tu ubicación',
            buttonNeutral: 'Pregúntame más tarde',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setshowbutton(true);
          console.log('Permiso de ubicación concedido');
          console.log(useThisCoo);
          console.log(initialRegion);
          if (!useThisCoo) {
            getCurrentLocation();
          } else {
            if (
              initialRegion.latitude != undefined &&
              initialRegion.latitude != '' &&
              initialRegion.longitude != undefined &&
              initialRegion.longitude != ''
            ) {
              setLocation({
                latitude: initialRegion.latitude,
                longitude: initialRegion.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              });
            } else {
              getCurrentLocation();
            }
          }
        } else {
          console.log('Permiso de ubicación denegado');
          setshowbutton(false);
        }
      } else {
        console.log("initialRegion", initialRegion);
        console.log("useThisCoo", useThisCoo);
        if (!useThisCoo) {
          getCurrentLocation();
        } else {
          if (
            initialRegion.latitude != undefined &&
            initialRegion.latitude != '' &&
            initialRegion.longitude != undefined &&
            initialRegion.longitude != ''
          ) {
            setLocation({
              latitude: initialRegion.latitude,
              longitude: initialRegion.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            });
          } else {
            getCurrentLocation();
          }
        }
      }
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error);
      setshowbutton(false);
    }
  };

  useEffect(() => {
    console.log("zzzzzzzzzz este es test");
    if (!useThisCoo) {
      getCurrentLocation();
    } else {
      if (
        initialRegion.latitude != undefined &&
        initialRegion.latitude != '' &&
        initialRegion.longitude != undefined &&
        initialRegion.longitude != ''
      ) {
        console.log("Aquiii")
        setLocation({
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      } else {
        console.log("Aquiii2")
        getCurrentLocation();
      }
    }

  }, [initialRegion]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    try {
      console.log('Aqui estoy :>');
      Geolocation.getCurrentPosition(
        info => {
          const { latitude, longitude } = info.coords;
          console.log(latitude);
          console.log(longitude);
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
          console.log('Se agregó :>');
        },
        error => {
          console.log('Error al obtener la ubicación:', error);
          setGpsModalVisible(true);
        },
      );
    } catch (error) {
      console.error('Error al intentar obtener la ubicación actual:', error);
      setGpsModalVisible(true);
    }
  };

  const handleMapPress = event => {
    if (edit) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setLocation({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
    }
  };

  const handleTallerPress = (taller) => {
    // setSelectedTaller(taller);
    // setTallerInfoModal(true);
  };

  const formatMetodosPago = (metodos) => {
    const metodosActivos = Object.entries(metodos)
      .filter(([key, value]) => value === true)
      .map(([key]) => {
        switch (key) {
          case 'transferencia': return 'Transferencia';
          case 'pagoMovil': return 'Pago Móvil';
          case 'zinli': return 'Zinli';
          case 'efectivo': return 'Efectivo';
          case 'puntoVenta': return 'Punto de Venta';
          case 'tarjetaCreditoN': return 'Tarjeta Crédito Nacional';
          case 'zelle': return 'Zelle';
          case 'tarjetaCreditoI': return 'Tarjeta Crédito Internacional';
          default: return key;
        }
      });

    return metodosActivos.length > 0 ? metodosActivos.join(', ') : 'No especificado';
  };

  return (
    <View style={styles.container}>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          console.log('Aquiiii');
          // if (returnFunction) returnFunction(location);
        }}>
        <View style={styles.modalContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 50, justifyContent: 'center' }}>

            {/* Leyenda amigable */}
            <Text
              style={{
                color: '#2D3261',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center', // Centra el texto horizontalmente
              }}
            >
              <Icons name="wrench" size={18} color="#2D3261" style={{ marginRight: 0 }} /> {""}
              Talleres disponibles en tu zona
            </Text>
          </View>

          <MapView
            style={styles.map}
            region={talleres && talleres.length > 0 ? getRegionForTalleres() : (location || initialRegion || defaultRegion)}
            customMapStyle={mapStyle}
            showsUserLocation={true}
            onPress={handleMapPress}>

            {/* Marker de ubicación del usuario si está disponible */}
            {location && (
              <Marker
                coordinate={location}
                title="Tu ubicación"
                pinColor="blue"
              />
            )}

            {/* Markers de talleres */}
            {talleres && talleres.map((taller, index) => (
              <Marker
                key={taller.id || index}
                coordinate={{
                  latitude: taller.ubicacion.lat,
                  longitude: taller.ubicacion.lng,
                }}
                title={taller.nombre}
                description={`${taller.Direccion} - ${taller.estado}`}
                pinColor="red"
              // onPress={() => handleTallerPress(taller)}
              >
                <Callout>
                  <View style={styles.calloutContainerLarge}>
                    <View style={styles.calloutHeaderCompact}>
                      <Text style={styles.tallerNameCompact}>{taller.nombre}</Text>
                    </View>

                    <View style={styles.tallerInfoContentCompact}>
                      <View style={styles.infoRowCompact}>
                        <Icons name="phone" size={14} color="#2D3261" />
                        <Text style={styles.infoLabelCompact}>Tel:</Text>
                        <Text style={styles.infoTextCompact}>{taller.phone}</Text>
                      </View>

                      {taller.whatsapp && (
                        <View style={styles.infoRowCompact}>
                          <Icons name="whatsapp" size={14} color="#25D366" />
                          <Text style={styles.infoLabelCompact}>WhatsApp:</Text>
                          <Text style={styles.infoTextCompact}>{taller.whatsapp}</Text>
                        </View>
                      )}

                      <View style={styles.infoRowCompact}>
                        <Icons name="envelope" size={14} color="#2D3261" />
                        <Text style={styles.infoLabelCompact}>Email:</Text>
                        <Text style={styles.infoTextCompact}>{taller.email}</Text>
                      </View>
                    </View>

                    {/* <View style={styles.actionButtonsCenter}>
                      <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => {
                          console.log('🏢 estas aqui');
                          setModalVisible(false);
                          if (returnFunction) returnFunction(taller);
                        }}
                      >
                        <Icons name="user" size={16} color="#FFF" />
                        <Text style={styles.profileButtonText}>Ir a perfil</Text>
                      </TouchableOpacity>
                    </View> */}
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 0, paddingHorizontal: 5 }}>
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 5,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  marginBottom: 10,
                  width: '100%', // Ancho completo
                },
              ]}
              onPress={() => {
                setModalVisible(false);
                if (returnFunction) returnFunction(null);
                console.log('Aquiiii');
              }}
            >
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 0, color: '#2D3261', fontSize: 14 },
                ]}
              >
                Cerrar Mapa
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </Modal>

      {/* Modal de información del taller */}
      <Modal
        animationType="slide"
        transparent={modalVisible}
        visible={tallerInfoModal}
        onRequestClose={() => setTallerInfoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.tallerInfoContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTaller && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.tallerName}>{selectedTaller.nombre}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setTallerInfoModal(false)}>
                      <Icons name="times" size={20} color="#2D3261" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.tallerInfoContent}>
                    <View style={styles.infoRow}>
                      <Icons name="map-marker" size={16} color="#2D3261" />
                      <Text style={styles.infoLabel}>Dirección:</Text>
                      <Text style={styles.infoText}>{selectedTaller.Direccion}, {selectedTaller.estado}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Icons name="phone" size={16} color="#2D3261" />
                      <Text style={styles.infoLabel}>Teléfono:</Text>
                      <Text style={styles.infoText}>{selectedTaller.phone}</Text>
                    </View>

                    {selectedTaller.whatsapp && (
                      <View style={styles.infoRow}>
                        <Icons name="whatsapp" size={16} color="#25D366" />
                        <Text style={styles.infoLabel}>WhatsApp:</Text>
                        <Text style={styles.infoText}>{selectedTaller.whatsapp}</Text>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <Icons name="envelope" size={16} color="#2D3261" />
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoText}>{selectedTaller.email}</Text>
                    </View>

                    {selectedTaller.rif && (
                      <View style={styles.infoRow}>
                        <Icons name="id-card" size={16} color="#2D3261" />
                        <Text style={styles.infoLabel}>RIF:</Text>
                        <Text style={styles.infoText}>{selectedTaller.rif}</Text>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <Icons name="credit-card" size={16} color="#2D3261" />
                      <Text style={styles.infoLabel}>Métodos de Pago:</Text>
                      <Text style={styles.infoText}>{formatMetodosPago(selectedTaller.metodos_pago)}</Text>
                    </View>

                    {selectedTaller.subscripcion_actual && (
                      <View style={styles.infoRow}>
                        <Icons name="star" size={16} color="#FFD700" />
                        <Text style={styles.infoLabel}>Suscripción:</Text>
                        <Text style={styles.infoText}>{selectedTaller.subscripcion_actual.nombre}</Text>
                      </View>
                    )}

                    {selectedTaller.distancia && (
                      <View style={styles.infoRow}>
                        <Icons name="road" size={16} color="#2D3261" />
                        <Text style={styles.infoLabel}>Distancia:</Text>
                        <Text style={styles.infoText}>{selectedTaller.distancia.toFixed(2)} km</Text>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <Icons name="check-circle" size={16} color="#28a745" />
                      <Text style={styles.infoLabel}>Estado:</Text>
                      <Text style={[styles.infoText, { color: selectedTaller.status === 'Aprobado' ? '#28a745' : '#dc3545' }]}>
                        {selectedTaller.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.contactButton}>
                      <Icons name="phone" size={16} color="#FFF" />
                      <Text style={styles.contactButtonText}>Llamar</Text>
                    </TouchableOpacity>

                    {selectedTaller.whatsapp && (
                      <TouchableOpacity style={styles.whatsappButton}>
                        <Icons name="whatsapp" size={16} color="#FFF" />
                        <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={gpsModalVisible}
        onRequestClose={() => setGpsModalVisible(false)}>
        <View style={stylesModal.container}>
          <View style={stylesModal.modalView}>
            <Text style={stylesModal.modalText}>
              Usted debe habilitar la ubicacion del dispositivo
            </Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity style={stylesModal.buttonNo} onPress={() => setGpsModalVisible(false)}>
                <Text style={stylesModal.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  map: {
    height: '77%',
    width: '100%',
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutContainerLarge: {
    width: 280,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  calloutHeaderCompact: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tallerNameCompact: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2D3261',
    textAlign: 'center',
  },
  tallerInfoContentCompact: {
    marginBottom: 10,
  },
  infoRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabelCompact: {
    fontWeight: '600',
    color: '#2D3261',
    marginLeft: 6,
    marginRight: 6,
    fontSize: 12,
    minWidth: 60,
  },
  infoTextCompact: {
    flex: 1,
    color: '#555',
    fontSize: 12,
  },
  actionButtonsCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    backgroundColor: '#2D3261',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
  },
  profileButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2D3261',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calloutLink: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tallerInfoContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  tallerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3261',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  tallerInfoContent: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#2D3261',
    marginLeft: 10,
    marginRight: 10,
    minWidth: 80,
  },
  infoText: {
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  contactButton: {
    backgroundColor: '#2D3261',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  contactButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  whatsappButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

const stylesImage = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const stylesModal = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonYes: {
    backgroundColor: '#2D3261', // Color del botón "Sí"
    borderRadius: 5,
    padding: 10,
    width: '48%', // Ajustar ancho para espacio entre botones
    alignItems: 'center',
  },
  buttonNo: {
    backgroundColor: '#FFA500', // Warning color
    color: '#2D3261', // Color del botón "No"
    borderRadius: 5,
    padding: 10,
    width: '48%', // Ajustar ancho para espacio entre botones
    alignItems: 'center',
  },
  buttonText: {
    color: 'white', // Color del texto del botón
    fontWeight: 'bold',
  },
});

export default MapTalleres;
