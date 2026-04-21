import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import Icons from 'react-native-vector-icons/Ionicons';
import Icons2 from 'react-native-vector-icons/MaterialCommunityIcons';
import {getMapboxPublicToken} from '../../config/mapboxPublicToken';

const buildHTML = (
  originLat,
  originLng,
  destLat,
  destLng,
  destName,
  mapboxToken,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet"/>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:100vw;height:100vh;overflow:hidden;font-family:-apple-system,sans-serif;background:#F5F6F8;}
    #map{width:100%;height:100%;}

    /* ── MANEUVER BANNER ── */
    #banner{
      position:absolute;top:0;left:0;right:0;
      background:#2D3261;
      padding:14px 20px 14px;
      display:none;flex-direction:row;align-items:center;gap:14px;
      box-shadow:0 4px 16px rgba(0,0,0,0.4);
      z-index:20;
    }
    #arrow-box{
      width:54px;height:54px;background:rgba(255,255,255,0.15);
      border-radius:12px;display:flex;align-items:center;justify-content:center;
      font-size:28px;flex-shrink:0;
    }
    #banner-right{display:flex;flex-direction:column;gap:2px;}
    #dist-next{font-size:22px;font-weight:700;color:#fff;}
    #street-next{font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;}

    /* ── SPEED BOX ── */
    #speed-box{
      position:absolute;left:14px;bottom:130px;
      background:#fff;border-radius:12px;width:56px;height:56px;
      display:none;flex-direction:column;align-items:center;justify-content:center;
      box-shadow:0 2px 12px rgba(0,0,0,0.25);z-index:20;
    }
    #speed-val{font-size:20px;font-weight:800;color:#051E47;line-height:1;}
    #speed-unit{font-size:9px;color:#9BA6B8;font-weight:600;text-transform:uppercase;}

    /* ── BOTTOM INFO PANEL (preview) ── */
    #panel{
      position:absolute;bottom:0;left:0;right:0;
      background:#fff;border-radius:20px 20px 0 0;
      padding:16px 20px 36px;
      box-shadow:0 -4px 24px rgba(0,0,0,0.12);
      z-index:20;
    }
    #handle{width:40px;height:4px;background:#E0E0E0;border-radius:2px;margin:0 auto 14px;}
    #dest-name{font-size:16px;font-weight:700;color:#051E47;margin-bottom:10px;}
    #info-row{display:flex;gap:12px;margin-bottom:16px;}
    .chip{
      flex:1;background:#F5F6F8;border-radius:14px;
      padding:10px 0;display:flex;flex-direction:column;align-items:center;gap:2px;
    }
    .chip-val{font-size:16px;font-weight:700;color:#2D3261;}
    .chip-lbl{font-size:10px;color:#9BA6B8;font-weight:500;text-transform:uppercase;}

    /* ── ETA BAR (navigating) ── */
    #eta-bar{
      position:absolute;bottom:0;left:0;right:0;
      background:#fff;border-radius:16px 16px 0 0;
      padding:14px 20px 30px;
      display:none;flex-direction:row;align-items:center;gap:16px;
      box-shadow:0 -4px 16px rgba(0,0,0,0.12);z-index:20;
    }
    #eta-info{display:flex;flex-direction:column;gap:2px;flex:1;}
    #eta-time{font-size:22px;font-weight:800;color:#051E47;}
    #eta-dist{font-size:12px;color:#9BA6B8;font-weight:500;}
    #arrived-box{
      position:absolute;inset:0;background:rgba(17,166,121,0.95);
      display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;
      z-index:30;
    }
    #arrived-box span{font-size:52px;}
    #arrived-box p{font-size:22px;font-weight:700;color:#fff;}

    .mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right{display:none;}
    .mapboxgl-ctrl-top-right{display:none;}
  </style>
</head>
<body>
<div id="map"></div>

<!-- maneuver banner -->
<div id="banner">
  <div id="arrow-box"><span id="arrow-icon">↑</span></div>
  <div id="banner-right">
    <div id="dist-next">--</div>
    <div id="street-next">Calculando...</div>
  </div>
</div>

<!-- speed box -->
<div id="speed-box">
  <div id="speed-val">0</div>
  <div id="speed-unit">km/h</div>
</div>

<!-- preview panel -->
<div id="panel">
  <div id="handle"></div>
  <div id="dest-name">${destName.replace(/'/g, "\\'")}</div>
  <div id="info-row">
    <div class="chip">
      <span class="chip-val" id="p-duration">--</span>
      <span class="chip-lbl">Tiempo</span>
    </div>
    <div class="chip">
      <span class="chip-val" id="p-distance">--</span>
      <span class="chip-lbl">Distancia</span>
    </div>
  </div>
</div>

<!-- ETA bar during navigation -->
<div id="eta-bar">
  <div id="eta-info">
    <div id="eta-time">--</div>
    <div id="eta-dist">--</div>
  </div>
</div>

<!-- arrived -->
<div id="arrived-box">
  <span>🎉</span>
  <p>¡Llegaste!</p>
</div>

<script>
mapboxgl.accessToken='${mapboxToken}';

var origin=[${originLng},${originLat}];
var destination=[${destLng},${destLat}];
var steps=[];
var currentStep=0;
var navigating=false;
var routeData=null;

var map=new mapboxgl.Map({
  container:'map',
  style:'mapbox://styles/mapbox/streets-v12',
  center:origin,zoom:15,pitch:0,bearing:0
});

/* ── MARKERS ── */
// Destino
var destEl=document.createElement('div');
destEl.innerHTML='<div style="width:36px;height:36px;background:#2D3261;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.4)"></div>';
new mapboxgl.Marker({element:destEl,anchor:'bottom'}).setLngLat(destination).addTo(map);

// Usuario (flecha)
var userEl=document.createElement('div');
userEl.style.cssText='width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:24px solid #2D3261;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));';
var userMarker=new mapboxgl.Marker({element:userEl,rotationAlignment:'map'}).setLngLat(origin).addTo(map);

/* ── HELPERS ── */
function fmtDur(s){var m=Math.round(s/60);return m<60?m+' min':Math.floor(m/60)+'h '+(m%60)+'min';}
function fmtDist(m){return m>=1000?(m/1000).toFixed(1)+' km':Math.round(m)+' m';}
function haversine(a,b){
  var R=6371000,r=Math.PI/180;
  var dLat=(b[1]-a[1])*r,dLng=(b[0]-a[0])*r;
  var s=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}

var MANEUVER_ICONS={
  'turn left':'↰','turn right':'↱',
  'slight left':'↖','slight right':'↗',
  'sharp left':'⬅','sharp right':'➡',
  'uturn':'↩','straight':'↑',
  'merge':'↑','ramp':'↗','fork left':'↖','fork right':'↗',
  'end of road':'🏁','arrive':'🏁','depart':'↑',
};
function maneuverIcon(step){
  if(!step) return '↑';
  var type=step.maneuver.type||'';
  var mod=step.maneuver.modifier||'';
  var key=(type+' '+mod).trim().toLowerCase();
  return MANEUVER_ICONS[key]||MANEUVER_ICONS[type]||'↑';
}

/* ── ROUTE FETCH ── */
function fetchRoute(orig){
  var url='https://api.mapbox.com/directions/v5/mapbox/driving/'
    +orig[0]+','+orig[1]+';'+destination[0]+','+destination[1]
    +'?steps=true&geometries=geojson&language=es&access_token=${mapboxToken}';
  return fetch(url).then(function(r){return r.json();}).then(function(data){
    if(!data.routes||!data.routes.length) return null;
    routeData=data.routes[0];
    steps=routeData.legs[0].steps;
    document.getElementById('p-duration').textContent=fmtDur(routeData.duration);
    document.getElementById('p-distance').textContent=fmtDist(routeData.distance);
    document.getElementById('eta-time').textContent=fmtDur(routeData.duration);
    document.getElementById('eta-dist').textContent=fmtDist(routeData.distance);
    drawRoute(routeData.geometry);
    fitRoute(routeData.geometry.coordinates);
    window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({
      type:'ready',duration:routeData.duration,distance:routeData.distance
    }));
    return routeData;
  });
}

function drawRoute(geom){
  if(map.getSource('route')){map.getSource('route').setData(geom);return;}
  map.addSource('route',{type:'geojson',data:geom});
  map.addLayer({id:'route-casing',type:'line',source:'route',
    layout:{'line-join':'round','line-cap':'round'},
    paint:{'line-color':'#fff','line-width':12}});
  map.addLayer({id:'route-line',type:'line',source:'route',
    layout:{'line-join':'round','line-cap':'round'},
    paint:{'line-color':'#4A90E2','line-width':7}});
}

function fitRoute(coords){
  var bounds=coords.reduce(function(b,c){return b.extend(c);},
    new mapboxgl.LngLatBounds(coords[0],coords[0]));
  map.fitBounds(bounds,{padding:{top:60,bottom:220,left:40,right:40},pitch:0,duration:800});
}

/* ── NAVIGATION MODE ── */
window.startNavigation=function(){
  navigating=true;
  currentStep=0;
  document.getElementById('panel').style.display='none';
  document.getElementById('banner').style.display='flex';
  document.getElementById('speed-box').style.display='flex';
  document.getElementById('eta-bar').style.display='flex';
  map.easeTo({pitch:60,zoom:17,duration:800,center:userMarker.getLngLat()});
  speak('Iniciando navegación. ' + (steps[0]&&steps[0].maneuver.instruction||''));
  updateBanner();
};

window.cancelNavigation=function(){
  navigating=false;
  currentStep=0;
  document.getElementById('panel').style.display='block';
  document.getElementById('banner').style.display='none';
  document.getElementById('speed-box').style.display='none';
  document.getElementById('eta-bar').style.display='none';
  document.getElementById('arrived-box').style.display='none';
  if(routeData){
    fitRoute(routeData.geometry.coordinates);
  }
};

function speak(text){
  if(!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text);
  u.rate=1.0; u.pitch=1.0; u.volume=1.0;
  var voices=window.speechSynthesis.getVoices();
  var latinoCodes=['es-MX','es-US','es-419','es-VE','es-CO','es-AR','es-CL','es-PE'];
  var chosen=null;
  for(var i=0;i<latinoCodes.length;i++){
    chosen=voices.find(function(v){return v.lang===latinoCodes[i];});
    if(chosen) break;
  }
  if(!chosen) chosen=voices.find(function(v){return v.lang.startsWith('es');});
  if(chosen) u.voice=chosen;
  u.lang=chosen?chosen.lang:'es-MX';
  window.speechSynthesis.speak(u);
}

function updateBanner(){
  if(!steps.length||currentStep>=steps.length) return;
  var step=steps[currentStep];
  document.getElementById('arrow-icon').textContent=maneuverIcon(step);
  document.getElementById('dist-next').textContent=fmtDist(step.distance);
  var name=step.name||step.maneuver.instruction||'Continúa';
  document.getElementById('street-next').textContent=name;
  speak(step.maneuver.instruction||name);
}

/* ── LOCATION UPDATE FROM RN ── */
window.updateLocation=function(lat,lng,speed,bearing){
  var lngLat=[lng,lat];
  userMarker.setLngLat(lngLat);
  if(typeof bearing==='number') userEl.style.transform='rotate('+bearing+'deg)';
  if(typeof speed==='number'&&speed>=0){
    document.getElementById('speed-val').textContent=Math.round(speed*3.6);
  }

  if(navigating){
    // Seguir al usuario
    map.easeTo({center:lngLat,bearing:bearing||map.getBearing(),duration:500});

    // Detectar llegada al destino
    if(haversine(lngLat,destination)<50){
      speak('Has llegado a tu destino.');
      document.getElementById('arrived-box').style.display='flex';
      window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'arrived'}));
      return;
    }

    // Avanzar paso si el usuario está cerca del inicio del siguiente
    if(currentStep<steps.length-1){
      var nextStepCoord=steps[currentStep+1].maneuver.location;
      if(haversine(lngLat,nextStepCoord)<30){
        currentStep++;
        updateBanner();
      }
    }

    // Recalcular ruta y ETA
    if(routeData){
      var rem=steps.slice(currentStep).reduce(function(a,s){return a+s.duration;},0);
      var remDist=steps.slice(currentStep).reduce(function(a,s){return a+s.distance;},0);
      document.getElementById('eta-time').textContent=fmtDur(rem);
      document.getElementById('eta-dist').textContent=fmtDist(remDist);
    }
  }
};

map.on('load',function(){fetchRoute(origin);});
</script>
</body>
</html>
`;

const MapboxNavigation = ({
  visible,
  destinationLat,
  destinationLng,
  destinationName = 'Destino',
  onClose,
}) => {
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [arrived, setArrived] = useState(false);
  const webViewRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setIsNavigating(false);
      setArrived(false);
      return;
    }
    setLoading(true);
    setError(null);
    setIsNavigating(false);
    setArrived(false);
    Geolocation.getCurrentPosition(
      pos => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('No se pudo obtener tu ubicación.\nVerifica los permisos de localización.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, [visible]);

  // Watcher de posición cuando navega
  useEffect(() => {
    if (!isNavigating) {
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    watchIdRef.current = Geolocation.watchPosition(
      pos => {
        const { latitude, longitude, speed, heading } = pos.coords;
        webViewRef.current?.injectJavaScript(
          `window.updateLocation(${latitude},${longitude},${speed ?? 0},${heading ?? 0}); true;`
        );
      },
      null,
      { enableHighAccuracy: true, distanceFilter: 5, interval: 2000 },
    );
    return () => {
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isNavigating]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    webViewRef.current?.injectJavaScript('window.startNavigation(); true;');
  };

  const handleMessage = event => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'arrived') setArrived(true);
    } catch (_) {}
  };

  const handleClose = () => {
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsNavigating(false);
    setArrived(false);
    onClose();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2D3261" />
          <Text style={styles.subText}>Obteniendo tu ubicación...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.center}>
          <Icons2 name="map-marker-off" size={52} color="#9BA6B8" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          style={{ flex: 1 }}
          originWhitelist={['*']}
          source={{
            html: buildHTML(
              origin.lat,
              origin.lng,
              destinationLat,
              destinationLng,
              destinationName,
              getMapboxPublicToken(),
            ),
          }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleMessage}
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.center, StyleSheet.absoluteFillObject, { backgroundColor: '#0f1923' }]}>
              <ActivityIndicator size="large" color="#4A90E2" />
            </View>
          )}
        />

        {/* ¡Vamos! — antes de navegar */}
        {!isNavigating && !arrived && (
          <View style={styles.goContainer}>
            <TouchableOpacity
              style={styles.goBtn}
              onPress={handleStartNavigation}
              activeOpacity={0.85}>
              <Icons name="navigate" size={22} color="#FFFFFF" />
              <Text style={styles.goBtnText}>¡Vamos!</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancelar viaje — durante navegación */}
        {isNavigating && !arrived && (
          <View style={styles.cancelContainer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setIsNavigating(false);
                webViewRef.current?.injectJavaScript('window.cancelNavigation(); true;');
              }}
              activeOpacity={0.85}>
              <Icons name="close-circle" size={18} color="#FA3131" />
              <Text style={styles.cancelBtnText}>Cancelar viaje</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Arrived overlay en RN también */}
        {arrived && (
          <View style={styles.arrivedOverlay}>
            <Text style={styles.arrivedEmoji}>🎉</Text>
            <Text style={styles.arrivedText}>¡Llegaste!</Text>
            <TouchableOpacity style={styles.arrivedBtn} onPress={handleClose}>
              <Text style={styles.arrivedBtnText}>Cerrar navegación</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        {/* Header — siempre light */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backBtn} activeOpacity={0.8}>
            <Icons name="arrow-back" size={20} color="#051E47" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{destinationName}</Text>
            <Text style={styles.headerSub}>{isNavigating ? 'Navegando' : 'Cómo llegar'}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ flex: 1 }}>{renderContent()}</View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F6F8',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#051E47' },
  headerSub: { fontSize: 11, color: '#9BA6B8', marginTop: 1 },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 16, backgroundColor: '#FFFFFF',
  },
  subText: { fontSize: 14, color: '#9BA6B8', textAlign: 'center' },
  errorText: { fontSize: 14, color: '#9BA6B8', textAlign: 'center', lineHeight: 22 },
  closeBtn: {
    backgroundColor: '#2D3261', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  closeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  /* ¡Vamos! */
  goContainer: {
    position: 'absolute', bottom: 210, left: 0, right: 0,
    alignItems: 'center',
  },
  /* Cancelar viaje */
  cancelContainer: {
    position: 'absolute', bottom: 150, left: 0, right: 0,
    alignItems: 'center',
  },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#FA3131',
    paddingVertical: 11, paddingHorizontal: 28,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cancelBtnText: { color: '#FA3131', fontSize: 15, fontWeight: '700' },
  goBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#2D3261',
    paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: '#2D3261',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  goBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },

  /* Arrived */
  arrivedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,166,121,0.96)',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  arrivedEmoji: { fontSize: 64 },
  arrivedText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  arrivedBtn: {
    marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 36,
  },
  arrivedBtnText: { color: '#11A679', fontSize: 16, fontWeight: '700' },
});

export default MapboxNavigation;
