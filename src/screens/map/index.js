import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
// import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {commonStyles} from '../../style/commonStyle.css';
import Icons from 'react-native-vector-icons/FontAwesome'; // Asegúrate de importar el ícono que estás usando

import MapView, {Marker} from 'react-native-maps';

const MapComponent = ({initialRegion, edit, returnFunction, useThisCoo}) => {
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [showbutton, setshowbutton] = useState(true);
  const [gpsModalVisible, setGpsModalVisible] = useState(false);

  const mapStyle = [
    // Aquí puedes añadir tu estilo personalizado para el mapa
  ];

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
        console.log('initialRegion', initialRegion);
        console.log('useThisCoo', useThisCoo);
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
    console.log('initialRegion', initialRegion);
    console.log('useThisCoo', useThisCoo);
    if (!useThisCoo) {
      getCurrentLocation();
    } else {
      if (
        initialRegion.latitude != undefined &&
        initialRegion.latitude != '' &&
        initialRegion.longitude != undefined &&
        initialRegion.longitude != ''
      ) {
        console.log('Aquiii');
        setLocation({
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      } else {
        console.log('Aquiii2');
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
          const {latitude, longitude} = info.coords;
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
      const {latitude, longitude} = event.nativeEvent.coordinate;
      setLocation({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
    }
  };

  const validarUbicacion = () => {
    console.log('useThisCoo', useThisCoo);

    if (!useThisCoo) {
      Geolocation.getCurrentPosition(
        info => {
          const {latitude, longitude} = info.coords;
          console.log(latitude);
          console.log(longitude);
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
          console.log('Se agregó :>');
          setModalVisible(true);
        },
        error => {
          console.log('Error al obtener la ubicación:', error);
          setGpsModalVisible(true);
          setModalVisible(false);
        },
      );
    } else {
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {showbutton ? (
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
              marginTop: 10,
              width: 300,
            },
          ]}
          onPress={() => validarUbicacion()}>
          <Icons name="map-marker" size={15} color="#2D3261" />
          <Text
            style={[
              stylesImage.buttonText,
              {marginLeft: 10, color: '#2D3261'},
            ]}>
            Ubicación
          </Text>
        </TouchableOpacity>
      ) : null}

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          console.log('Aquiiii');
          returnFunction(location);
        }}>
        <View style={styles.modalContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 20,
              marginTop: 50,
              justifyContent: 'center',
            }}>
            <Icons
              name="question-circle"
              size={18}
              color="#2D3261"
              style={{marginRight: 8}}
            />
            <Text
              style={{
                color: '#2D3261',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              Haz clic en el mapa para marcar la ubicación del taller
            </Text>
          </View>

          <MapView
            style={styles.map}
            region={location || initialRegion}
            customMapStyle={mapStyle}
            showsUserLocation={true}
            onPress={handleMapPress}>
            {location && (
              <Marker coordinate={location} title="Ubicación seleccionada" />
            )}
          </MapView>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 0,
            }}>
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
                  flex: 1,
                  marginRight: 5,
                },
              ]}
              onPress={() => {
                setModalVisible(false);
                console.log('Aquiiii');
                returnFunction(initialRegion);
              }}>
              <Text
                style={[
                  stylesImage.buttonText,
                  {marginLeft: 10, color: '#2D3261'},
                ]}>
                Cerrar Mapa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#28a745',
                  borderStyle: 'solid',
                  borderRadius: 5,
                  backgroundColor: '#28a745',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  marginBottom: 10,
                  flex: 1,
                  marginLeft: 5,
                },
              ]}
              onPress={() => {
                setModalVisible(false);
                console.log('Aquiiii');
                returnFunction(location == null ? initialRegion : location);

                Alert.alert(
                  'Solvers Informa',
                  'Ubicación guardada correctamente',
                );
              }}>
              <Icons name="map-marker" size={15} color="#FFF" />
              <Text
                style={[
                  stylesImage.buttonText,
                  {marginLeft: 10, color: '#FFF'},
                ]}>
                Guardar Ubicación
              </Text>
            </TouchableOpacity>
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
              <TouchableOpacity
                style={stylesModal.buttonNo}
                onPress={() => setGpsModalVisible(false)}>
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

export default MapComponent;
