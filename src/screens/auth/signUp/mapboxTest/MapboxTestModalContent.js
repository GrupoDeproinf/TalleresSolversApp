import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

const MAPBOX_TOKEN =
  'REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN';

const FALLBACK_COORDS = { latitude: 10.4806, longitude: -66.9036 };

const buildHTML = (lat, lng) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100vw; height: 100vh; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    #crosshair {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 10;
    }
    #crosshair::before, #crosshair::after {
      content: '';
      position: absolute;
      background: #2D3261;
    }
    #crosshair::before { width: 2px; height: 24px; top: -12px; left: -1px; }
    #crosshair::after  { width: 24px; height: 2px; left: -12px; top: -1px; }
    #dot {
      position: absolute;
      top: 50%; left: 50%;
      width: 10px; height: 10px;
      background: #2D3261;
      border: 2px solid white;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="crosshair"></div>
  <div id="dot"></div>
  <script>
    mapboxgl.accessToken = '${MAPBOX_TOKEN}';
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [${lng}, ${lat}],
      zoom: 15
    });

    function sendCoords() {
      var center = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: center.lat,
        longitude: center.lng
      }));
    }

    map.on('moveend', sendCoords);
    map.on('load', sendCoords);
  </script>
</body>
</html>
`;

const MapboxTestModalContent = ({ onClose, onConfirm }) => {
  const [initCoords, setInitCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setInitCoords({ latitude, longitude });
        setLoading(false);
      },
      () => {
        setInitCoords(FALLBACK_COORDS);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleMessage = event => {
    try {
      const coords = JSON.parse(event.nativeEvent.data);
      setSelectedCoords(coords);
    } catch (_) {}
  };

  const handleConfirm = () => {
    if (selectedCoords && onConfirm) {
      onConfirm(selectedCoords);
    }
    onClose();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seleccionar ubicación</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.75}>
          <Text style={styles.closeText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hintRow}>
        <Icons name="gesture-swipe" size={16} color="#9BA6B8" />
        <Text style={styles.hintText}>Mueve el mapa para centrar el marcador en tu ubicación</Text>
      </View>

      <View style={styles.mapWrapper}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color="#2D3261" size="large" />
            <Text style={styles.loaderText}>Obteniendo ubicación actual...</Text>
          </View>
        ) : (
          <WebView
            style={styles.map}
            originWhitelist={['*']}
            source={{ html: buildHTML(initCoords.latitude, initCoords.longitude) }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loader}>
                <ActivityIndicator color="#2D3261" size="large" />
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.footer}>
        {selectedCoords && (
          <Text style={styles.coordsText}>
            {selectedCoords.latitude.toFixed(6)}, {selectedCoords.longitude.toFixed(6)}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, !selectedCoords && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selectedCoords}
          activeOpacity={0.85}>
          <Icons name="map-marker-check" size={18} color="#FFFFFF" />
          <Text style={styles.confirmText}>Confirmar ubicación</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#051E47' },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  closeText: { fontSize: 13, fontWeight: '600', color: '#9BA6B8' },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 6,
  },
  hintText: { fontSize: 12, color: '#9BA6B8', flex: 1 },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  map: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 13, color: '#9BA6B8' },
  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8, gap: 8 },
  coordsText: { fontSize: 11, color: '#9BA6B8', textAlign: 'center' },
  confirmBtn: {
    backgroundColor: '#2D3261',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default MapboxTestModalContent;
