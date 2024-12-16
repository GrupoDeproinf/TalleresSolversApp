import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, PermissionsAndroid, Platform, TouchableOpacity, Modal } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { commonStyles } from '../../style/commonStyle.css';
import Icons from 'react-native-vector-icons/FontAwesome'; // Asegúrate de importar el ícono que estás usando

const MapComponent = ({ initialRegion, edit, returnFunction, useThisCoo }) => {
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [showbutton, setshowbutton] = useState(true);

  const mapStyle = [
    // Aquí puedes añadir tu estilo personalizado para el mapa
  ];

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permiso de ubicación',
          message: 'Esta aplicación necesita acceso a tu ubicación',
          buttonNeutral: 'Pregúntame más tarde',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setshowbutton(true)
        console.log('Permiso de ubicación concedido');
        console.log(useThisCoo)
        console.log(initialRegion)
        if (!useThisCoo) {
          getCurrentLocation();
        }else {
          
          if (initialRegion.latitude != undefined && initialRegion.latitude != '' &&
            initialRegion.longitude != undefined && initialRegion.longitude != ''
          ) {
            setLocation({
              latitude:initialRegion.latitude,
              longitude:initialRegion.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            });
          } else {
            getCurrentLocation();
          }
        }
      } else {
        console.log('Permiso de ubicación denegado');
        setshowbutton(false)
      }
    } else {
      if (!useThisCoo) {
        getCurrentLocation();
      } else {
        if (initialRegion.latitude != undefined && initialRegion.latitude != '' &&
          initialRegion.longitude != undefined && initialRegion.longitude != ''
        ) {
          setLocation({
            latitude:initialRegion.latitude,
            longitude:initialRegion.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
        } else {
          getCurrentLocation();
        }

      }
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    console.log("Aqui estoy :>");
    Geolocation.getCurrentPosition(info => {
      const { latitude, longitude } = info.coords;
      console.log(latitude);
      console.log(longitude);
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
        console.log("Se agregó :>");
    });
  };

  const handleMapPress = (event) => {
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

  return (
    <View style={styles.container}>

      {
        showbutton ? (
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
                padding: 10,
                marginTop: 10,
                width:200
              },
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Icons name="map-marker" size={15} color="#2D3261" />
            <Text style={[stylesImage.buttonText, { marginLeft: 10, color: '#2D3261' }]}>
              Ubicación
            </Text>
          </TouchableOpacity>
        ) : null
      }



      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false)
          console.log("Aquiiii")
          returnFunction(location)
        }}
      >
        <View style={styles.modalContainer}>
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
                padding: 10,
                marginTop: 10,
              },
            ]}
            onPress={() => {
              setModalVisible(false)
              console.log("Aquiiii")
              returnFunction(location)
            }}
          >
            <Icons name="map-marker" size={15} color="#2D3261" />
            <Text style={[stylesImage.buttonText, { marginLeft: 10, color: '#2D3261' }]}>
              Cerrar Mapa
            </Text>
          </TouchableOpacity>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={location || initialRegion}
            customMapStyle={mapStyle}
            showsUserLocation={true}
            onPress={handleMapPress}
          >
            {location && (
              <Marker
                coordinate={location}
                title="Tu ubicación actual"
              />
            )}
          </MapView>
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
    height: '100%',
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

export default MapComponent;
