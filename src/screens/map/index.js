import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { commonStyles } from '../../style/commonStyle.css';

const MapComponent = ({ initialRegion }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const mapStyle = [
    // Aquí puedes añadir tu estilo personalizado para el mapa
  ];

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  return (
    <View style={styles.container}>
      <Text style={[commonStyles.subtitleText]}>
        ¿Ya se encuentra registrado?
      </Text>
      <MapView
        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
        style={styles.map}
        region={initialRegion}
        customMapStyle={mapStyle}
        onPress={handleMapPress}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Ubicación Seleccionada"
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
    ...StyleSheet.absoluteFillObject, // Esto asegura que el mapa ocupe todo el contenedor
  },
});

export default MapComponent;
