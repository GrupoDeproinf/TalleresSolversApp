import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import Icons from 'react-native-vector-icons/FontAwesome';

MapboxGL.setAccessToken('pk.eyJ1IjoibHVpcy1zb2x2ZXJzIiwiYSI6ImNtaTZla2k2ZzJxY3Yyam9sd3d4c2JoeDIifQ.za22tuYJ06Tf8mseJJMqmQ');

const MapTalleres = ({ talleres = [], initialRegion = null, edit = false, returnFunction = null, useThisCoo = false }) => {
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [tallerInfoModal, setTallerInfoModal] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState(null);
  const [showbutton, setshowbutton] = useState(true);
  const [gpsModalVisible, setGpsModalVisible] = useState(false);

  const defaultRegion = {
    latitude: 10.4806,
    longitude: -66.9036,
    zoomLevel: 12,
  };

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

    const latitude = (minLat + maxLat) / 2;
    const longitude = (minLng + maxLng) / 2;

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    const zoomLevel = Math.max(Math.min(15 - Math.log2(Math.max(latDelta, lngDelta)), 20), 2);

    return { latitude, longitude, zoomLevel };
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
          if (!useThisCoo) getCurrentLocation();
          else setLocationFromInitial();
        } else setshowbutton(false);
      } else {
        if (!useThisCoo) getCurrentLocation();
        else setLocationFromInitial();
      }
    } catch (error) {
      console.error(error);
      setshowbutton(false);
    }
  };

  const setLocationFromInitial = () => {
    if (initialRegion?.latitude && initialRegion?.longitude) {
      setLocation({
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
        zoomLevel: 15,
      });
    } else getCurrentLocation();
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (useThisCoo) setLocationFromInitial();
    else getCurrentLocation();
  }, [initialRegion]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      info => {
        const { latitude, longitude } = info.coords;
        setLocation({ latitude, longitude, zoomLevel: 15 });
      },
      error => setGpsModalVisible(true),
    );
  };

  const handleMapPress = (e) => {
    if (!edit) return;
    const [longitude, latitude] = e.geometry.coordinates;
    setLocation({ latitude, longitude, zoomLevel: 15 });
  };

  const handleTallerPress = (taller) => {
    setSelectedTaller(taller);
    setTallerInfoModal(true);
  };

  const formatMetodosPago = (metodos) => {
    return Object.entries(metodos)
      .filter(([_, value]) => value)
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
      }).join(', ') || 'No especificado';
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          if (returnFunction) returnFunction(location);
        }}
      >
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

          <MapboxGL.MapView
            style={styles.map}
            onPress={handleMapPress}
            styleURL={MapboxGL.StyleURL.Street}
          >
            {location && (
              <MapboxGL.Camera
                centerCoordinate={[location.longitude, location.latitude]}
                zoomLevel={location.zoomLevel}
              />
            )}

            {location && (
              <MapboxGL.PointAnnotation
                id="userLocation"
                coordinate={[location.longitude, location.latitude]}
              >
                <View style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: 'blue' }} />
              </MapboxGL.PointAnnotation>
            )}

            {talleres.map((taller, idx) => (
              <MapboxGL.PointAnnotation
                key={taller.id || idx}
                id={`taller-${taller.id || idx}`}
                coordinate={[taller.ubicacion.lng, taller.ubicacion.lat]}
                onSelected={() => handleTallerPress(taller)}
              >
                <View style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: 'red' }} />
                <MapboxGL.Callout title={taller.nombre}>
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
                </MapboxGL.Callout>
              </MapboxGL.PointAnnotation>
            ))}
          </MapboxGL.MapView>

          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.closeMapButton}
              onPress={() => {
                setModalVisible(false);
                if (returnFunction) returnFunction(null);
              }}
            >
              <Icons name="times" size={18} color="#FFFFFF" style={styles.closeIcon} />
              <Text style={styles.closeMapButtonText}>Cerrar Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de información del taller */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={tallerInfoModal}
        onRequestClose={() => setTallerInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tallerInfoContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTaller && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.tallerName}>{selectedTaller.nombre}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setTallerInfoModal(false)}
                    >
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
                      <Text style={[styles.infoText, { color: selectedTaller.status === 'Aprobado' ? '#28a745' : '#dc3545' }]}>{selectedTaller.status}</Text>
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

      {/* Modal GPS */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={gpsModalVisible}
        onRequestClose={() => setGpsModalVisible(false)}
      >
        <View style={stylesModal.container}>
          <View style={stylesModal.modalView}>
            <View style={stylesModal.iconContainer}>
              <Icons name="location-arrow" size={48} color="#FF6B6B" />
            </View>
            <Text style={stylesModal.modalTitle}>Ubicación Requerida</Text>
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

// Styles (idénticos a los que tenías)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  headerContainer: {
    backgroundColor: '#2D3261',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconContainer: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, padding: 12, marginRight: 15 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', textAlign: 'center', flex: 1 },
  map: { flex: 1 },
  footerContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 15 },
  closeMapButton: { backgroundColor: '#2D3261', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12 },
  closeIcon: { marginRight: 10 },
  closeMapButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  calloutContainerLarge: { width: 300, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8, borderWidth: 1, borderColor: '#E9ECEF' },
  calloutHeaderCompact: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
  tallerNameCompact: { fontWeight: '700', fontSize: 16, color: '#2D3261', textAlign: 'center' },
  tallerInfoContentCompact: { marginBottom: 8 },
  infoRowCompact: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 2 },
  iconWrapper: { width: 24, alignItems: 'center', marginRight: 8 },
  infoLabelCompact: { fontWeight: '600', color: '#495057', marginRight: 8, fontSize: 13, minWidth: 70 },
  infoTextCompact: { flex: 1, color: '#6C757D', fontSize: 13, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  tallerInfoContainer: { backgroundColor: '#FFFFFF', margin: 20, borderRadius: 20, padding: 24, maxHeight: '85%', width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tallerName: { fontSize: 20, fontWeight: '700', color: '#2D3261', flex: 1 },
  closeButton: { marginLeft: 12 },
  tallerInfoContent: { marginTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoIconContainer: { width: 30 },
  infoLabel: { fontWeight: '600', marginRight: 6, color: '#495057', minWidth: 90 },
  infoText: { flex: 1, color: '#6C757D' },
  actionButtons: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' },
  contactButton: { backgroundColor: '#2D3261', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, flex: 1, marginRight: 8 },
  contactButtonText: { color: '#FFFFFF', marginLeft: 6, fontWeight: '600' },
  whatsappButton: { backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, flex: 1 },
  whatsappButtonText: { color: '#FFFFFF', marginLeft: 6, fontWeight: '600' },
});

// Modal GPS styles
const stylesModal = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  iconContainer: { marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  modalText: { fontSize: 14, textAlign: 'center', color: '#555' },
  buttonContainer: { marginTop: 20, flexDirection: 'row', justifyContent: 'center' },
  buttonNo: { backgroundColor: '#2D3261', padding: 12, borderRadius: 12 },
  buttonText: { color: '#FFF', fontWeight: '600' },
});

export default MapTalleres;
