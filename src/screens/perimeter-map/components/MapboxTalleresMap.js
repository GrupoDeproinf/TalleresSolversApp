/**
 * MapboxTalleresMap
 *
 * Mapa de múltiples talleres usando Mapbox GL JS vía WebView.
 * Mismo token y estilo que MapboxNavigation — sin Google Maps API key.
 *
 * Props:
 *   visible        {boolean}
 *   talleres       {Array}   — cada item con { id|uid, nombre, Direccion, distancia,
 *                              phone, whatsapp, email, lat, lng }
 *   userLocation   {{ latitude, longitude } | null}
 *   onClose        {() => void}
 *   onTallerPress  {(taller) => void}  — callback al pulsar "Ver negocio"
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAPBOX_TOKEN =
  'REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN';

// ─── Builder del HTML ─────────────────────────────────────────────────────────
const buildHtml = (talleres, userLat, userLng) => {
  const hasUser = userLat != null && userLng != null;

  const center = hasUser
    ? [userLng, userLat]
    : talleres.length > 0
    ? [talleres[0].lng, talleres[0].lat]
    : [-66.9036, 10.4806];

  // Serializa todos los campos que necesita el popup del mapa
  const markersData = JSON.stringify(
    talleres
      .filter(t => Number.isFinite(t.lat) && Number.isFinite(t.lng))
      .map(t => ({
        id: String(t.id || t.uid || ''),
        nombre: String(t.nombre || 'Taller'),
        direccion: String(t.Direccion || t.direccion || ''),
        distancia:
          t.distancia != null && Number.isFinite(Number(t.distancia))
            ? `${Number(t.distancia).toFixed(2)} km`
            : '',
        phone: String(t.phone || t.telefono || ''),
        whatsapp: String(t.whatsapp || ''),
        email: String(t.email || ''),
        lat: Number(t.lat),
        lng: Number(t.lng),
      })),
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
  <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
  <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet'/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body,html,#map{width:100%;height:100%;background:#080920;}
    .mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-logo{display:none;}
    .mapboxgl-popup-content{display:none!important;}
    .mapboxgl-popup-tip{display:none!important;}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  mapboxgl.accessToken='${MAPBOX_TOKEN}';
  var map=new mapboxgl.Map({
    container:'map',
    style:'mapbox://styles/mapbox/navigation-night-v1',
    center:[${center[0]},${center[1]}],
    zoom:12,
    interactive:true,
    attributionControl:false,
  });
  map.touchZoomRotate.enable();
  map.scrollZoom.enable();
  map.dragPan.enable();

  var talleres=${markersData};

  function send(data){
    try{ window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(data)); }catch(e){}
  }

  map.on('load',function(){

    /* ── Marcador del usuario ─────────────────────────────────────────────── */
    ${hasUser ? `
    var uEl=document.createElement('div');
    uEl.innerHTML='<svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="19" r="18" fill="rgba(0,0,0,0.25)" transform="translate(0.5,0.5)"/><circle cx="19" cy="19" r="18" fill="#ffffff" stroke="rgba(77,166,255,0.7)" stroke-width="2.5"/><path d="M19 5 L30 31 L19 23 L8 31 Z" fill="#1E3A5F"/></svg>';
    uEl.style.width='38px';uEl.style.height='38px';uEl.style.cursor='default';
    new mapboxgl.Marker({element:uEl,anchor:'center'}).setLngLat([${userLng},${userLat}]).addTo(map);
    ` : ''}

    /* ── Marcadores de talleres ───────────────────────────────────────────── */
    talleres.forEach(function(t){
      var el=document.createElement('div');
      el.innerHTML='<svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="19" r="18" fill="rgba(0,0,0,0.25)" transform="translate(0.5,0.5)"/><circle cx="19" cy="19" r="18" fill="#FFD60A" stroke="#fff" stroke-width="2.5"/><path d="M19 8C14.6 8 11 11.6 11 16C11 21.5 19 31 19 31C19 31 27 21.5 27 16C27 11.6 23.4 8 19 8Z" fill="#1F2344"/><circle cx="19" cy="16" r="3.5" fill="#FFD60A"/></svg>';
      el.style.width='38px';el.style.height='38px';el.style.cursor='pointer';

      new mapboxgl.Marker({element:el,anchor:'bottom'}).setLngLat([t.lng,t.lat]).addTo(map);

      el.addEventListener('click',function(e){
        e.stopPropagation();
        send({type:'tallerTap',taller:t});
      });
    });

    /* ── Ajustar cámara para mostrar todos ───────────────────────────────── */
    if(talleres.length>0){
      var b=new mapboxgl.LngLatBounds();
      talleres.forEach(function(t){b.extend([t.lng,t.lat]);});
      ${hasUser ? `b.extend([${userLng},${userLat}]);` : ''}
      if(!b.isEmpty()) map.fitBounds(b,{padding:80,duration:800,maxZoom:14});
    }

    /* cerrar card inferior al tocar el fondo del mapa */
    map.on('click',function(){
      send({type:'mapTap'});
    });
  });
</script>
</body>
</html>`;
};

// ─── Componente ───────────────────────────────────────────────────────────────
const MapboxTalleresMap = ({
  visible,
  talleres = [],
  userLocation,
  onClose,
  onTallerPress,
}) => {
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + 10; // respeta notch / Dynamic Island / status bar

  const [selectedTaller, setSelectedTaller] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedTaller(null);
      setMapReady(false);
    }
  }, [visible]);

  const html = buildHtml(
    talleres,
    userLocation?.latitude ?? null,
    userLocation?.longitude ?? null,
  );

  const handleMessage = event => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'tallerTap') {
        const original = talleres.find(
          t => String(t.id || t.uid || '') === String(msg.taller.id),
        );
        setSelectedTaller(original ?? msg.taller);
      } else if (msg.type === 'mapTap') {
        setSelectedTaller(null);
      }
    } catch (_) {}
  };

  const callPhone = phone => {
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const openWhatsApp = number => {
    if (!number) return;
    const clean = number.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${clean}`).catch(() => {});
  };

  const content = (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Mapa WebView ── */}
      <WebView
        source={{ html }}
        style={StyleSheet.absoluteFillObject}
        javaScriptEnabled
        originWhitelist={['*']}
        onMessage={handleMessage}
        onLoad={() => setMapReady(true)}
        backgroundColor="#080920"
        scrollEnabled={false}
        domStorageEnabled
        allowsInlineMediaPlayback
        scalesPageToFit={false}
      />

      {/* ── Overlay de carga ── */}
      {!mapReady && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator color="#FFD60A" size="large" />
          <Text style={s.loadingText}>Cargando mapa…</Text>
        </View>
      )}

      {/* ── Botón cerrar ── */}
      <TouchableOpacity style={[s.closeBtn, {top: topOffset}]} onPress={onClose} activeOpacity={0.8}>
        <Icon name="chevron-down" size={22} color="#fff" />
      </TouchableOpacity>

      {/* ── Header con contador ── */}
      <View style={[s.header, {top: topOffset}]}>
        <View style={s.headerIconWrap}>
          <Icon name="wrench" size={13} color="#FFD60A" />
        </View>
        <Text style={s.headerTitle}>Negocios en tu zona</Text>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>{talleres.length}</Text>
        </View>
      </View>

      {/* ── Card del taller seleccionado (igual info que el callout anterior) ── */}
      {selectedTaller ? (
        <View style={s.tallerCard}>
          <View style={s.handle} />

          {/* Nombre */}
          <View style={s.cardHeader}>
            <View style={s.cardIconWrap}>
              <Icon name="wrench" size={14} color="#FFD60A" />
            </View>
            <Text style={s.tallerName} numberOfLines={1}>
              {String(selectedTaller.nombre || '').toUpperCase()}
            </Text>
          </View>

          {/* Info rows */}
          <View style={s.infoBlock}>
            {/* Teléfono */}
            {(selectedTaller.phone || selectedTaller.telefono) ? (
              <TouchableOpacity
                style={s.infoRow}
                onPress={() => callPhone(selectedTaller.phone || selectedTaller.telefono)}
                activeOpacity={0.7}>
                <View style={s.infoIconWrap}>
                  <Icon name="phone" size={14} color="#FFD60A" />
                </View>
                <Text style={s.infoLabel}>Tel:</Text>
                <Text style={[s.infoValue, s.infoLink]}>
                  {selectedTaller.phone || selectedTaller.telefono}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* WhatsApp */}
            {selectedTaller.whatsapp ? (
              <TouchableOpacity
                style={s.infoRow}
                onPress={() => openWhatsApp(selectedTaller.whatsapp)}
                activeOpacity={0.7}>
                <View style={s.infoIconWrap}>
                  <Icon name="whatsapp" size={14} color="#25D366" />
                </View>
                <Text style={s.infoLabel}>WhatsApp:</Text>
                <Text style={[s.infoValue, s.infoLinkWa]}>
                  {selectedTaller.whatsapp}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Email */}
            {selectedTaller.email ? (
              <View style={s.infoRow}>
                <View style={s.infoIconWrap}>
                  <Icon name="email-outline" size={14} color="#FFD60A" />
                </View>
                <Text style={s.infoLabel}>Email:</Text>
                <Text style={s.infoValue} numberOfLines={1}>
                  {selectedTaller.email}
                </Text>
              </View>
            ) : null}

            {/* Distancia */}
            {selectedTaller.distancia != null &&
            Number.isFinite(Number(selectedTaller.distancia)) ? (
              <View style={s.infoRow}>
                <View style={s.infoIconWrap}>
                  <Icon name="map-marker-distance" size={14} color="#FFD60A" />
                </View>
                <Text style={s.infoLabel}>Dist.:</Text>
                <Text style={s.infoValue}>
                  {Number(selectedTaller.distancia).toFixed(2)} km
                </Text>
              </View>
            ) : null}
          </View>

          {/* Botón ver negocio */}
          <TouchableOpacity
            style={s.verBtn}
            activeOpacity={0.85}
            onPress={() => {
              onTallerPress && onTallerPress(selectedTaller);
            }}>
            <Icon name="store" size={16} color="#0D0E2D" style={{marginRight: 8}} />
            <Text style={s.verBtnText}>Ver negocio</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  if (Platform.OS === 'android') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}>
        {content}
      </Modal>
    );
  }

  return visible ? content : null;
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080920',
    zIndex: 9998,
    elevation: 9998,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080920',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
  },
  closeBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(8,9,32,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  header: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2344',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.25)',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
  },
  headerIconWrap: {
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderRadius: 10,
    padding: 5,
  },
  headerTitle: {
    color: '#FFD60A',
    fontSize: 13,
    fontWeight: '700',
  },
  headerBadge: {
    backgroundColor: 'rgba(255,214,10,0.2)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  headerBadgeText: {
    color: '#FFD60A',
    fontSize: 11,
    fontWeight: '700',
  },

  /* ── Card inferior ── */
  tallerCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0E2D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: -4},
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cardIconWrap: {
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderRadius: 10,
    padding: 6,
  },
  tallerName: {
    flex: 1,
    color: '#FFD60A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  infoBlock: {
    marginBottom: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255,214,10,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    color: '#FFD60A',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 66,
  },
  infoValue: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  infoLink: {
    color: '#60A5FA',
    textDecorationLine: 'underline',
  },
  infoLinkWa: {
    color: '#25D366',
    textDecorationLine: 'underline',
  },
  verBtn: {
    backgroundColor: '#FFD60A',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD60A',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
  },
  verBtnText: {
    color: '#0D0E2D',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});

export default MapboxTalleresMap;
