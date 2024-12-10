import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, PermissionsAndroid, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { commonStyles } from '../../style/commonStyle.css';

const MapComponent = ({ initialRegion }) => {
  const [location, setLocation] = useState(null);

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
        console.log('Permiso de ubicación concedido');
        // getCurrentLocation();
        watchLocation()
      } else {
        console.log('Permiso de ubicación denegado');
      }
    } else {
      watchLocation()
      // getCurrentLocation();
    }
  };

  useEffect(() => {

    requestLocationPermission();

  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      },
      (error) => {
        console.log('Error al obtener la ubicación:', error.message, error.code);
        if (error.code === 3) { // Timeout
          // Prueba a usar watchPosition como alternativa
          watchLocation();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Incrementar el tiempo de espera a 30 segundos
        maximumAge: 0, // Asegurarse de obtener una ubicación nueva
      }
    );
  };

  const watchLocation = () => {

    console.log("Aquiiiiiii")
    const watchId = Geolocation.watchPosition(
      (position) => {
        console.log(position)
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
        Geolocation.clearWatch(watchId); // Detener watchPosition después de obtener la ubicación
      },
      (error) => {
        console.log('Error al observar la ubicación:', error.message, error.code);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
        distanceFilter: 1, // Distancia mínima (en metros) que debe cambiar antes de actualizar la ubicación
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[commonStyles.subtitleText]}>
        ¿Ya se encuentra registrado?
      </Text>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={location || initialRegion}
        customMapStyle={mapStyle}
        showsUserLocation={true}
      >
        {location && (
          <Marker
            coordinate={location}
            title="Tu ubicación actual"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 400,
    width: 300,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapComponent;
