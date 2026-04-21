import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
// Ejemplo con Mapbox; asume que ya tienes configurado react-native-mapbox-gl/maps
// y el token de acceso en otro lugar del proyecto.
// Si aún no está configurado, este componente servirá como base visual.
// import MapboxGL from '@react-native-mapbox-gl/maps';

const MapboxTestModalContent = ({ onClose }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa de prueba (Mapbox)</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrapper}>
        {/* Reemplaza este bloque por el Mapbox real cuando esté configurado */}
        <View style={styles.fakeMap}>
          <Text style={styles.fakeMapText}>Aquí irá el mapa de Mapbox</Text>
        </View>

        {/* Ejemplo real (comentado hasta tener MapboxGL configurado)
        <MapboxGL.MapView style={styles.realMap}>
          <MapboxGL.Camera
            zoomLevel={14}
            centerCoordinate={[-122.4194, 37.7749]}
          />
        </MapboxGL.MapView>
        */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(248,250,252,0.15)',
  },
  closeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  mapWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  fakeMap: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeMapText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  // realMap: {
  //   flex: 1,
  //   borderRadius: 18,
  // },
});

export default MapboxTestModalContent;

