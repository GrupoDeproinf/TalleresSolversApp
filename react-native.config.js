module.exports = {
  project: {
    ios: {},
    android: {},
  },
  // Mapas: Android usa solo @rnmapbox/maps; react-native-maps queda para iOS (MapKit).
  dependencies: {
    'react-native-maps': {
      platforms: {
        android: null,
      },
    },
  },
  assets: [
    './src/assets/fonts/', // Tu carpeta de fuentes personalizadas
    './node_modules/react-native-vector-icons/Fonts/' // Carpeta de fuentes de react-native-vector-icons
  ],
};