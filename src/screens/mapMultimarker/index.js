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
import Geolocation from '@react-native-community/geolocation';
import { commonStyles } from '../../style/commonStyle.css';
import Icons from 'react-native-vector-icons/FontAwesome';
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
          <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Icons name="wrench" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>
                Talleres disponibles en tu zona
              </Text>
            </View>
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
                        <View style={styles.iconWrapper}>
                          <Icons name="phone" size={14} color="#4A90E2" />
                        </View>
                        <Text style={styles.infoLabelCompact}>Tel:</Text>
                        <Text style={styles.infoTextCompact}>{taller.phone}</Text>
                      </View>
                      {taller.whatsapp && (
                        <View style={styles.infoRowCompact}>
                          <View style={styles.iconWrapper}>
                            <Icons name="whatsapp" size={14} color="#25D366" />
                          </View>
                          <Text style={styles.infoLabelCompact}>WhatsApp:</Text>
                          <Text style={styles.infoTextCompact}>{taller.whatsapp}</Text>
                        </View>
                      )}
                      <View style={styles.infoRowCompact}>
                        <View style={styles.iconWrapper}>
                          <Icons name="envelope" size={14} color="#4A90E2" />
                        </View>
                        <Text style={styles.infoLabelCompact}>Email:</Text>
                        <Text style={styles.infoTextCompact}>{taller.email}</Text>
                      </View>
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.closeMapButton}
              onPress={() => {
                setModalVisible(false);
                if (returnFunction) returnFunction(null);
                console.log('Aquiiii');
              }}
            >
              <Icons name="times" size={18} color="#FFFFFF" style={styles.closeIcon} />
              <Text style={styles.closeMapButtonText}>
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
                      <Icons name="times" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.tallerInfoContent}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icons name="map-marker" size={16} color="#4A90E2" />
                      </View>
                      <Text style={styles.infoLabel}>Dirección:</Text>
                      <Text style={styles.infoText}>{selectedTaller.Direccion}, {selectedTaller.estado}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icons name="phone" size={16} color="#4A90E2" />
                      </View>
                      <Text style={styles.infoLabel}>Teléfono:</Text>
                      <Text style={styles.infoText}>{selectedTaller.phone}</Text>
                    </View>
                    {selectedTaller.whatsapp && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icons name="whatsapp" size={16} color="#25D366" />
                        </View>
                        <Text style={styles.infoLabel}>WhatsApp:</Text>
                        <Text style={styles.infoText}>{selectedTaller.whatsapp}</Text>
                      </View>
                    )}
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icons name="envelope" size={16} color="#4A90E2" />
                      </View>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoText}>{selectedTaller.email}</Text>
                    </View>
                    {selectedTaller.rif && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icons name="id-card" size={16} color="#4A90E2" />
                        </View>
                        <Text style={styles.infoLabel}>RIF:</Text>
                        <Text style={styles.infoText}>{selectedTaller.rif}</Text>
                      </View>
                    )}
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icons name="credit-card" size={16} color="#4A90E2" />
                      </View>
                      <Text style={styles.infoLabel}>Métodos de Pago:</Text>
                      <Text style={styles.infoText}>{formatMetodosPago(selectedTaller.metodos_pago)}</Text>
                    </View>
                    {selectedTaller.subscripcion_actual && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icons name="star" size={16} color="#FFD700" />
                        </View>
                        <Text style={styles.infoLabel}>Suscripción:</Text>
                        <Text style={styles.infoText}>{selectedTaller.subscripcion_actual.nombre}</Text>
                      </View>
                    )}
                    {selectedTaller.distancia && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icons name="road" size={16} color="#4A90E2" />
                        </View>
                        <Text style={styles.infoLabel}>Distancia:</Text>
                        <Text style={styles.infoText}>{selectedTaller.distancia.toFixed(2)} km</Text>
                      </View>
                    )}
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icons name="check-circle" size={16} color="#28a745" />
                      </View>
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
            <View style={stylesModal.iconContainer}>
              <Icons name="location-arrow" size={48} color="#FF6B6B" />
            </View>
            <Text style={stylesModal.modalTitle}>
              Ubicación Requerida
            </Text>
            <Text style={stylesModal.modalText}>
              Para mostrar los talleres cercanos, necesitamos acceso a tu ubicación. Por favor, habilita el GPS en tu dispositivo.
            </Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity style={stylesModal.buttonNo} onPress={() => setGpsModalVisible(false)}>
                <Text style={stylesModal.buttonText}>Entendido</Text>
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
    backgroundColor: '#F8F9FA',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: '#2D3261',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 12,
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  map: {
    flex: 1,
  },
  footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  closeMapButton: {
    backgroundColor: '#2D3261',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#2D3261',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  closeIcon: {
    marginRight: 10,
  },
  closeMapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  calloutContainerLarge: {
    width: 300,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  calloutHeaderCompact: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tallerNameCompact: {
    fontWeight: '700',
    fontSize: 16,
    color: '#2D3261',
    textAlign: 'center',
  },
  tallerInfoContentCompact: {
    marginBottom: 8,
  },
  infoRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  infoLabelCompact: {
    fontWeight: '600',
    color: '#495057',
    marginRight: 8,
    fontSize: 13,
    minWidth: 70,
  },
  infoTextCompact: {
    flex: 1,
    color: '#6C757D',
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tallerInfoContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#E9ECEF',
    paddingBottom: 16,
  },
  tallerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3261',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  tallerInfoContent: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 4,
  },
  infoIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 2,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#495057',
    marginRight: 12,
    minWidth: 90,
    fontSize: 14,
  },
  infoText: {
    flex: 1,
    color: '#6C757D',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  contactButton: {
    backgroundColor: '#2D3261',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#2D3261',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#25D366',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});

const stylesImage = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

const stylesModal = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    minWidth: '85%',
  },
  iconContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 40,
    padding: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3261',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6C757D',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonNo: {
    backgroundColor: '#2D3261',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: '60%',
    alignItems: 'center',
    shadowColor: '#2D3261',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MapTalleres;