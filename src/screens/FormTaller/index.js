import {
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Modal,
  Alert,
  ScrollView,
  Image,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import React, {useState, useCallback, useRef} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/FontAwesome';
import Icons5 from 'react-native-vector-icons/FontAwesome5';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {useValues} from '../../../App';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './style.css';
import TextInputs from '../../commonComponents/textInputs';
import {WebView} from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import notImageFound from '../../assets/noimageNew.png';
import {Dropdown} from 'react-native-element-dropdown';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Icons2 from 'react-native-vector-icons/Ionicons';

const DARK_BLUE = '#1F2344';
const YELLOW = '#FFD60A';

const MAPBOX_TOKEN = 'REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN';

/** Picker interactivo con pin central (modo edición). */
const buildLocationPickerHTML = (lat, lng) => `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet"/>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"><\/script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:100vw;height:100vh;overflow:hidden;font-family:-apple-system,sans-serif;background:#1D1E56;}
    #map{width:100%;height:100%;}
    .mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-logo{display:none!important;}
    #pin{position:absolute;top:50%;left:50%;transform:translate(-50%,-100%);z-index:10;pointer-events:none;}
    #pin svg{filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));}
    #bottom{position:absolute;bottom:0;left:0;right:0;background:#1D1E56;border-radius:22px 22px 0 0;padding:16px 20px 40px;box-shadow:0 -4px 24px rgba(0,0,0,0.4);z-index:20;}
    #handle{width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 14px;}
    #confirm-btn{width:100%;padding:17px 0;border:none;border-radius:16px;background:#FFD60A;font-size:16px;font-weight:900;color:#1D1E56;cursor:pointer;}
    #hint{position:absolute;top:80px;left:50%;transform:translateX(-50%);background:rgba(29,30,86,0.82);border-radius:20px;padding:7px 16px;z-index:15;pointer-events:none;white-space:nowrap;}
    #hint span{font-size:12px;color:#FFFFFF;font-weight:600;}
    #locate-btn{position:absolute;top:16px;right:16px;width:46px;height:46px;border-radius:23px;background:#FFFFFF;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.3);z-index:15;transition:opacity 0.2s;}
    #locate-btn.loading{opacity:0.5;pointer-events:none;}
    @keyframes spin{to{transform:rotate(360deg);}}
    #locate-btn.loading svg{animation:spin 0.9s linear infinite;}
  </style>
</head><body>
<div id="map"></div>
<div id="pin"><svg width="36" height="44" viewBox="0 0 36 44" fill="none"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#E11D48"/><circle cx="18" cy="18" r="7" fill="white"/></svg></div>
<div id="hint"><span>Mueve el mapa para ajustar el pin</span></div>
<button id="locate-btn" onclick="requestLocation()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#1D1E56" stroke-width="2.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#1D1E56" stroke-width="2.2" stroke-linecap="round"/></svg></button>
<div id="bottom"><div id="handle"></div><button id="confirm-btn" onclick="confirm()">Usar esta ubicación</button></div>
<script>
mapboxgl.accessToken='${MAPBOX_TOKEN}';
var map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/streets-v12',center:[${lng},${lat}],zoom:15,attributionControl:false});
var currentLng=${lng},currentLat=${lat};
map.on('move',function(){var c=map.getCenter();currentLng=+c.lng.toFixed(6);currentLat=+c.lat.toFixed(6);});
setTimeout(function(){var h=document.getElementById('hint');if(h)h.style.display='none';},3000);
function confirm(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'confirm',lat:currentLat,lng:currentLng}));}
function requestLocation(){var btn=document.getElementById('locate-btn');if(btn)btn.classList.add('loading');window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'requestLocation'}));}
window.flyToLocation=function(lat,lng){currentLat=lat;currentLng=lng;map.flyTo({center:[lng,lat],zoom:16,duration:800,essential:true});var btn=document.getElementById('locate-btn');if(btn)btn.classList.remove('loading');};
<\/script></body></html>`;

/** Visor de solo lectura con marker (modo visualización). */
const buildLocationViewerHTML = (lat, lng) => `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet"/>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"><\/script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:100vw;height:100vh;overflow:hidden;}
    #map{width:100%;height:100%;}
    .mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-logo,.mapboxgl-ctrl-top-right,.mapboxgl-ctrl-top-left{display:none!important;}
  </style>
</head><body>
<div id="map"></div>
<script>
mapboxgl.accessToken='${MAPBOX_TOKEN}';
var map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/navigation-night-v1',center:[${lng},${lat}],zoom:15,attributionControl:false,interactive:true});
new mapboxgl.Marker({color:'#E11D48'}).setLngLat([${lng},${lat}]).addTo(map);
<\/script></body></html>`;

const TIME_OPTIONS = Array.from({length: 24}, (_, hour) => {
  const value = `${String(hour).padStart(2, '0')}:00`;
  return {label: value, value};
});

const BUSINESS_DAYS = [
  {key: 'lunes', label: 'Lunes'},
  {key: 'martes', label: 'Martes'},
  {key: 'miercoles', label: 'Miércoles'},
  {key: 'jueves', label: 'Jueves'},
  {key: 'viernes', label: 'Viernes'},
  {key: 'sabado', label: 'Sábado'},
  {key: 'domingo', label: 'Domingo'},
];

const METODOS_PAGO_DEF = [
  {label: 'Efectivo', value: 'efectivo'},
  {label: 'Pago Móvil', value: 'pagoMovil'},
  {label: 'Punto de venta', value: 'puntoVenta'},
  {label: 'Crédito internacional', value: 'tarjetaCreditoI'},
  {label: 'Crédito nacional', value: 'tarjetaCreditoN'},
  {label: 'Transferencia', value: 'transferencia'},
  {label: 'Zelle', value: 'zelle'},
  {label: 'Zinli', value: 'zinli'},
];

const ESTADOS_VZ = [
  {label: 'Seleccione un estado', value: ''},
  {label: 'Amazonas', value: 'Amazonas'},
  {label: 'Anzoátegui', value: 'Anzoátegui'},
  {label: 'Apure', value: 'Apure'},
  {label: 'Aragua', value: 'Aragua'},
  {label: 'Barinas', value: 'Barinas'},
  {label: 'Bolívar', value: 'Bolívar'},
  {label: 'Carabobo', value: 'Carabobo'},
  {label: 'Cojedes', value: 'Cojedes'},
  {label: 'Delta Amacuro', value: 'Delta Amacuro'},
  {label: 'Distrito Capital', value: 'Distrito Capital'},
  {label: 'Falcón', value: 'Falcón'},
  {label: 'Guárico', value: 'Guárico'},
  {label: 'Lara', value: 'Lara'},
  {label: 'La Guaira', value: 'La Guaira'},
  {label: 'Mérida', value: 'Mérida'},
  {label: 'Miranda', value: 'Miranda'},
  {label: 'Monagas', value: 'Monagas'},
  {label: 'Nueva Esparta', value: 'Nueva Esparta'},
  {label: 'Portuguesa', value: 'Portuguesa'},
  {label: 'Sucre', value: 'Sucre'},
  {label: 'Táchira', value: 'Táchira'},
  {label: 'Trujillo', value: 'Trujillo'},
  {label: 'Yaracuy', value: 'Yaracuy'},
  {label: 'Zulia', value: 'Zulia'},
];

const PREFIX_RIF = [
  {label: 'C-', value: 'C-'},
  {label: 'E-', value: 'E-'},
  {label: 'G-', value: 'G-'},
  {label: 'J-', value: 'J-'},
  {label: 'P-', value: 'P-'},
  {label: 'V-', value: 'V-'},
];

const buildDefaultBusinessHours = () =>
  BUSINESS_DAYS.reduce((acc, day) => {
    acc[day.key] = {enabled: false, open: '08:00', close: '17:00'};
    return acc;
  }, {});

const mergeHorariosFromApi = raw => {
  const base = buildDefaultBusinessHours();
  if (!raw || typeof raw !== 'object') return base;
  BUSINESS_DAYS.forEach(({key}) => {
    const item = raw[key];
    if (item && typeof item === 'object') {
      base[key] = {
        enabled: !!item.enabled,
        open: item.open || base[key].open,
        close: item.close || base[key].close,
      };
    }
  });
  return base;
};

const docUrlFromApi = v => {
  if (v == null || v === '') return '';
  const s = typeof v === 'string' ? v.trim() : String(v).trim();
  if (!/^https?:\/\//i.test(s)) return '';
  // Strip previous cache-buster before adding a fresh one
  const base = s.replace(/([?&])t=\d+(&|$)/, '$2').replace(/[?&]$/, '');
  return `${base}${base.includes('?') ? '&' : '?'}t=${Date.now()}`;
};

// ── Section header: ALL CAPS + horizontal line ──────────────────────────────
const SectionHeader = ({title}) => (
  <View style={styles.sectionHeaderRow}>
    <Text style={styles.sectionHeaderText}>{title.toUpperCase()}</Text>
    <View style={styles.sectionHeaderLine} />
  </View>
);

// ── Field row: text in view mode, input in edit mode ───────────────────────
// Pass `value` for text-based fields. Omit `value` for complex fields
// (Dropdown, Map, RadioButton) — they always render children.
const FieldBlock = ({label, value, children, isEditing = false, vertical = false}) => {
  // Complex field (no value prop) — always render children (no border wrapper)
  if (value === undefined) {
    if (vertical) {
      return (
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabelTop, isEditing && styles.fieldLabelActive]}>
            {label}
          </Text>
          {children}
        </View>
      );
    }
    return (
      <View style={[styles.fieldRow, isEditing ? styles.fieldRowEditing : styles.fieldRowReadonly]}>
        <Text style={[styles.fieldLabelInline, isEditing && styles.fieldLabelActive]} numberOfLines={2}>
          {label}
        </Text>
        <View style={styles.fieldInputCell}>{children}</View>
      </View>
    );
  }

  // Text field — view mode: label + value display
  if (!isEditing) {
    return (
      <View style={styles.fieldDisplayRow}>
        <Text style={styles.fieldDisplayLabel}>{label}</Text>
        <Text style={styles.fieldDisplayValue} numberOfLines={4}>
          {String(value).trim() || '—'}
        </Text>
      </View>
    );
  }

  // Text field — edit mode: input wrapped with border
  if (vertical) {
    return (
      <View style={styles.fieldWrap}>
        <Text style={[styles.fieldLabelTop, styles.fieldLabelActive]}>{label}</Text>
        <View style={styles.fieldInputEditing}>{children}</View>
      </View>
    );
  }
  return (
    <View style={styles.fieldRowEditing}>
      <Text style={[styles.fieldLabelInline, styles.fieldLabelActive]} numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.fieldInputEditing}>{children}</View>
    </View>
  );
};

// ── Edit input: simple bordered TextInput ───────────────────────────────────
const EditInput = ({value, onChangeText, keyboardType, multiline, height, placeholder, autoCapitalize, editable = true}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType}
    multiline={multiline}
    textAlignVertical={multiline ? 'top' : 'center'}
    placeholder={placeholder || ''}
    placeholderTextColor="#9CA3AF"
    autoCapitalize={autoCapitalize || 'sentences'}
    editable={editable}
    style={[
      styles.editInput,
      !editable && styles.editInputDisabled,
      multiline && {height: height || 100, paddingTop: 10},
    ]}
  />
);

// ── Payment chip ────────────────────────────────────────────────────────────
const PagoChip = ({method, index, toggleMetodoPago, isEditing}) => (
  <TouchableOpacity
    style={[styles.pagoChip, method.checked && styles.pagoChipActive]}
    onPress={() => toggleMetodoPago(index)}
    disabled={!isEditing}
    activeOpacity={0.75}>
    {method.checked ? (
      <Icons name="check" size={11} color="#FFFFFF" style={{marginRight: 5}} />
    ) : null}
    <Text style={[styles.pagoChipText, method.checked && styles.pagoChipTextActive]}>
      {method.label}
    </Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
const FormTaller = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const [isEditing, setIsEditing] = useState(false);

  const [NameTaller, setNameTaller] = useState('');
  const [email, setEmail] = useState('');
  const [cedula, setcedula] = useState('');
  const [Nombre, setNombre] = useState('');
  const [phone, setPhone] = useState('');
  const [Direccion, setDireccion] = useState('');
  const [RegComercial, setRegComercial] = useState('');
  const [Caracteristicas, setCaracteristicas] = useState('');
  const [Tarifa, setTarifa] = useState('');
  const [Experiencia, setExperiencia] = useState('');
  const [LinkFacebook, setLinkFacebook] = useState('');
  const [LinkInstagram, setLinkInstagram] = useState('');
  const [LinkTiktok, setLinkTiktok] = useState('');
  const [Garantia, setGarantia] = useState('');
  const [seguro, setseguro] = useState('');
  const [checked, setChecked] = useState('no');
  const [selectedPrefix, setSelectedPrefix] = useState('J-');
  const [whats, setwhats] = useState('');
  const [metodosPago, setMetodosPago] = useState(
    METODOS_PAGO_DEF.map(m => ({...m, checked: false})),
  );
  const [estadoSelected, setestadoSelected] = useState('');
  const [imagePerfil, setimagePerfil] = useState('');
  const [rifIdFiscalUrl, setRifIdFiscalUrl] = useState('');
  const [rifIdFiscalBase64, setRifIdFiscalBase64] = useState('');
  const [rifIdFiscalLocalUri, setRifIdFiscalLocalUri] = useState('');

  const [permisoOperacionUrl, setPermisoOperacionUrl] = useState('');
  const [permisoOperacionBase64, setPermisoOperacionBase64] = useState('');
  const [permisoOperacionLocalUri, setPermisoOperacionLocalUri] = useState('');

  const [logotipoNegocioUrl, setLogotipoNegocioUrl] = useState('');
  const [logotipoNegocioBase64, setLogotipoNegocioBase64] = useState('');
  const [logotipoNegocioLocalUri, setLogotipoNegocioLocalUri] = useState('');

  const [fotoFrenteTallerUrl, setFotoFrenteTallerUrl] = useState('');
  const [fotoFrenteTallerBase64, setFotoFrenteTallerBase64] = useState('');
  const [fotoFrenteTallerLocalUri, setFotoFrenteTallerLocalUri] = useState('');

  const [fotoInternaTallerUrl, setFotoInternaTallerUrl] = useState('');
  const [fotoInternaTallerBase64, setFotoInternaTallerBase64] = useState('');
  const [fotoInternaTallerLocalUri, setFotoInternaTallerLocalUri] = useState('');
  const [lat, setlat] = useState(10.4806);
  const [lng, setlng] = useState(-66.9036);
  const [locationPicked, setLocationPicked] = useState(false);
  const [locationManuallyModified, setLocationManuallyModified] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [locationViewerVisible, setLocationViewerVisible] = useState(false);
  const locationPickerRef = useRef(null);
  const [businessHours, setBusinessHours] = useState(buildDefaultBusinessHours);

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [accionesModalVisible, setAccionesModalVisible] = useState(false);
  const [tipoAccion, settipoAccion] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [successModalType, setSuccessModalType] = useState(null); // null | 'aprobado' | 'rechazado'
  const [uidTaller, setuidTaller] = useState('');
  const [dataTaller, setdataTaller] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imgFullscreen, setImgFullscreen] = useState(null);

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState(null); // { setBase64, setLocalUri }

  const {bgFullStyle} = useValues();

  useFocusEffect(
    useCallback(() => {
      const uid = route.params?.uid;
      if (!uid) return;
      setModalVisible(false);
      setAccionesModalVisible(false);
      setIsEditing(false);
      setuidTaller(uid);
      getData(uid);
    }, [route.params?.uid]),
  );

  const getData = async uid => {
    setProfileLoaded(false);
    try {
      const response = await api.post('/usuarios/getUserByUid', {uid});
      const result = response.data;
      if (response.status !== 200 || !result?.userData) {
        console.warn('Usuario no encontrado');
        return;
      }
      const ud = result.userData;
      const pickDocUrl = key => docUrlFromApi(ud[key] ?? result[key]);

      setdataTaller(ud);
      setNameTaller(ud.nombre || '');
      setNombre(ud.nombre || '');
      setEmail(ud.email || '');
      setPhone(ud.phone != null ? String(ud.phone) : '');
      setDireccion(ud.Direccion || '');
      setRegComercial(ud.RegComercial != null ? String(ud.RegComercial) : '');
      setCaracteristicas(ud.Caracteristicas || '');
      setTarifa(ud.Tarifa || '');
      setExperiencia(ud.Experiencia || '');
      setLinkFacebook(ud.LinkFacebook || '');
      setLinkInstagram(ud.LinkInstagram || '');
      setLinkTiktok(ud.LinkTiktok || '');
      setGarantia(ud.Garantia || '');
      setseguro(ud.seguro || '');
      setimagePerfil(ud.image_perfil ? docUrlFromApi(ud.image_perfil) : '');
      setestadoSelected(ud.estado || '');
      setwhats(ud.whatsapp != null && ud.whatsapp !== '' ? String(ud.whatsapp) : '');

      if (ud.ubicacion?.lat != null && ud.ubicacion?.lng != null) {
        setlat(Number(ud.ubicacion.lat));
        setlng(Number(ud.ubicacion.lng));
        setLocationPicked(true);
        setLocationManuallyModified(false);
      }

      if (ud.metodos_pago && typeof ud.metodos_pago === 'object') {
        setMetodosPago(
          METODOS_PAGO_DEF.map(m => ({...m, checked: !!ud.metodos_pago[m.value]})),
        );
      }

      let horariosRaw = ud.horarios_atencion;
      if (typeof horariosRaw === 'string' && horariosRaw.trim()) {
        try {
          horariosRaw = JSON.parse(horariosRaw);
        } catch {
          horariosRaw = null;
        }
      }
      setBusinessHours(mergeHorariosFromApi(horariosRaw));

      const ag = ud.agenteAutorizado;
      setChecked(
        ag === true || ag === 'si' || ag === 'Sí' || ag === 'SI' ? 'si' : 'no',
      );

      if (ud.rif && String(ud.rif).includes('-')) {
        const parts = String(ud.rif).split('-');
        setcedula(parts[1] || '');
        setSelectedPrefix(`${parts[0]}-`);
      } else if (ud.rif != null && ud.rif !== '') {
        setcedula(String(ud.rif));
      }

      setRifIdFiscalUrl(pickDocUrl('rifIdFiscal'));
      setPermisoOperacionUrl(pickDocUrl('permisoOperacion'));
      setLogotipoNegocioUrl(pickDocUrl('logotipoNegocio'));
      setFotoFrenteTallerUrl(pickDocUrl('fotoFrenteTaller'));
      setFotoInternaTallerUrl(pickDocUrl('fotoInternaTaller'));

      setProfileLoaded(true);
    } catch (error) {
      setProfileLoaded(false);
      console.error('Error getUserByUid:', error.response?.data?.message || error.message);
    }
  };

  const getImageName = url =>
    typeof url === 'string' && url ? url.split('/').pop() : '';

  const docImageTodelete = (storedUrl, newBase64) =>
    storedUrl && newBase64 ? getImageName(storedUrl) : '';

  const documentValueForApi = (payloadField, urlStored) => {
    if (payloadField != null && String(payloadField).trim() !== '')
      return String(payloadField).trim();
    return urlStored != null && urlStored !== '' ? String(urlStored) : '';
  };

  const showToast = text => Alert.alert('Solvers Informa', text);

  const handleLocationPickerMessage = useCallback(event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'confirm') {
        setlat(data.lat);
        setlng(data.lng);
        setLocationPicked(true);
        setLocationManuallyModified(true);
        setLocationPickerVisible(false);
      } else if (data.type === 'requestLocation') {
        const doFly = (latitude, longitude) => {
          locationPickerRef.current?.injectJavaScript(
            `window.flyToLocation(${latitude}, ${longitude}); true;`,
          );
        };
        if (Platform.OS === 'ios') {
          Geolocation.requestAuthorization();
          Geolocation.getCurrentPosition(
            pos => doFly(pos.coords.latitude, pos.coords.longitude),
            () => {},
            {enableHighAccuracy: true, timeout: 10000},
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(granted => {
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              Geolocation.getCurrentPosition(
                pos => doFly(pos.coords.latitude, pos.coords.longitude),
                () => {},
                {enableHighAccuracy: true, timeout: 10000},
              );
            }
          });
        }
      }
    } catch {}
  }, []);

  const fileToBase64 = uri =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    });

  const applyPhotoResult = (target, uri, b64) => {
    if (!target) return;
    if (target.setBase64) target.setBase64(b64);
    if (target.setLocalUri) target.setLocalUri(uri);
  };

  const openPhotoOptions = (setBase64Fn, setLocalUriFn) => {
    setPhotoModalTarget({setBase64: setBase64Fn, setLocalUri: setLocalUriFn});
    setPhotoModalVisible(true);
  };

  const handlePickGallery = () => {
    setPhotoModalVisible(false);
    setTimeout(() => {
      launchImageLibrary(
        {mediaType: 'photo', includeBase64: true, selectionLimit: 1},
        response => {
          if (response.didCancel || response.error) return;
          const asset = response.assets?.[0];
          if (asset) applyPhotoResult(photoModalTarget, asset.uri, asset.base64);
        },
      );
    }, 400);
  };

  const handlePickCamera = async () => {
    setPhotoModalVisible(false);
    setTimeout(async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      launchCamera(
        {mediaType: 'photo', includeBase64: true},
        response => {
          if (response.didCancel || response.error) return;
          const asset = response.assets?.[0];
          if (asset) applyPhotoResult(photoModalTarget, asset.uri, asset.base64);
        },
      );
    }, 400);
  };

  const handlePickDocument = () => {
    setPhotoModalVisible(false);
    setTimeout(async () => {
      try {
        const res = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.allFiles],
        });
        const b64 = await fileToBase64(res.uri);
        applyPhotoResult(photoModalTarget, res.uri, b64);
      } catch (e) {
        if (!DocumentPicker.isCancel(e)) console.warn(e);
      }
    }, 400);
  };

  const selectDocument = (setBase64, setLocalUri) => {
    launchImageLibrary({mediaType: 'photo', includeBase64: true}, response => {
      if (!response.didCancel && !response.errorCode && response.assets?.[0]) {
        const asset = response.assets[0];
        if (asset.base64) setBase64(asset.base64);
        if (asset.uri) setLocalUri(asset.uri);
      }
    });
  };

  const toggleMetodoPago = index => {
    if (!isEditing) return;
    setMetodosPago(prev => {
      const next = [...prev];
      next[index] = {...next[index], checked: !next[index].checked};
      return next;
    });
  };

  const buildPayload = useCallback(
    () => ({
      nombre: Nombre ?? '',
      rif: `${selectedPrefix}${cedula}`,
      phone: String(phone ?? '').replace(/\s+/g, ''),
      email: email ?? '',
      Direccion: Direccion ?? '',
      RegComercial: RegComercial ?? '',
      Caracteristicas: Caracteristicas ?? '',
      Experiencia: Experiencia ?? '',
      LinkFacebook: LinkFacebook ?? '',
      LinkInstagram: LinkInstagram ?? '',
      LinkTiktok: LinkTiktok ?? '',
      seguro: seguro ?? '',
      agenteAutorizado: checked === 'si',
      whatsapp: String(whats ?? '').replace(/\s+/g, ''),
      metodos_pago: metodosPago.reduce((acc, m) => {
        acc[m.value] = m.checked;
        return acc;
      }, {}),
      estado: estadoSelected ?? '',
      horarios_atencion: businessHours,
      lat,
      lng,
      ubicacion: {lat, lng},
    }),
    [
      Nombre, selectedPrefix, cedula, phone, email, Direccion, RegComercial,
      Caracteristicas, Experiencia, LinkFacebook, LinkInstagram, LinkTiktok,
      seguro, checked, whats, metodosPago, estadoSelected, businessHours, lat, lng,
    ],
  );

  const handleSave = async () => {
    if (!uidTaller || saving) return;
    const payload = buildPayload();
    setSaving(true);
    try {
      const [phoneRes, emailRes] = await Promise.all([
        api.post('/home/validatePhone', {phone: payload.phone, uid: uidTaller}),
        api.post('/home/validateEmail', {email: payload.email, uid: uidTaller}),
      ]);
      if (
        phoneRes.status !== 200 || phoneRes.data.valid !== true ||
        emailRes.status !== 200 || emailRes.data.valid !== true
      ) {
        showToast('El teléfono o correo ya está registrado.');
        return;
      }
      const body = {
        uid: uidTaller,
        ...payload,
        Tarifa: Tarifa ?? '',
        Garantia: Garantia ?? '',
        base64: '',
        imageTodelete: '',
        rifIdFiscal: documentValueForApi(rifIdFiscalBase64, rifIdFiscalUrl),
        permisoOperacion: documentValueForApi(permisoOperacionBase64, permisoOperacionUrl),
        logotipoNegocio: documentValueForApi(logotipoNegocioBase64, logotipoNegocioUrl),
        fotoFrenteTaller: documentValueForApi(fotoFrenteTallerBase64, fotoFrenteTallerUrl),
        fotoInternaTaller: documentValueForApi(fotoInternaTallerBase64, fotoInternaTallerUrl),
        rifIdFiscalTodelete: docImageTodelete(rifIdFiscalUrl, rifIdFiscalBase64),
        permisoOperacionTodelete: docImageTodelete(permisoOperacionUrl, permisoOperacionBase64),
        logotipoNegocioTodelete: docImageTodelete(logotipoNegocioUrl, logotipoNegocioBase64),
        fotoFrenteTallerTodelete: docImageTodelete(fotoFrenteTallerUrl, fotoFrenteTallerBase64),
        fotoInternaTallerTodelete: docImageTodelete(fotoInternaTallerUrl, fotoInternaTallerBase64),
      };
      const response = await api.post('/usuarios/UpdateTallerUsuarioDocs', body);
      if (response.status === 200 || response.status === 201) {
        showToast('Negocio actualizado exitosamente');
        setIsEditing(false);
      } else {
        showToast(response.data?.message || 'Error inesperado');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error en la solicitud');
    } finally {
      setSaving(false);
    }
  };

  const onHandleChange = type => {
    settipoAccion(type);
    setModalVisible(true);
  };

  const onAccionEditarUsuario = () => {
    setAccionesModalVisible(false);
    setIsEditing(v => !v);
  };

  const onAccionAprobar = () => {
    setAccionesModalVisible(false);
    onHandleChange('Aprobar');
  };

  const onAccionRechazar = () => {
    setAccionesModalVisible(false);
    onHandleChange('Rechazar');
  };

  const onCancel = () => {
    setModalVisible(false);
    setMotivoRechazo('');
  };
  const onCerrarMenuAcciones = () => setAccionesModalVisible(false);

  const onConfirm = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const userLogged = jsonValue != null ? JSON.parse(jsonValue) : null;
      if (!userLogged?.uid || !uidTaller || !dataTaller) {
        Alert.alert('Solvers Informa', 'No se pudo completar la acción.');
        return;
      }
      const nuevoStatus = tipoAccion === 'Aprobar' ? 'Aprobado' : 'Rechazado';
      const response = await api.post('/usuarios/actualizarStatusUsuario', {
        uid: uidTaller,
        nuevoStatus,
        certificador_nombre: userLogged.nombre,
        certificador_key: userLogged.uid,
        ...(tipoAccion === 'Rechazar' && motivoRechazo.trim()
          ? {motivoRechazo: motivoRechazo.trim()}
          : {}),
      });
      if (
        response.data?.message ===
        'El estado del usuario ha sido actualizado exitosamente'
      ) {
        setModalVisible(false);
        setMotivoRechazo('');
        try {
          await api.post('/usuarios/sendNotification', {
            token: dataTaller.token,
            title: tipoAccion === 'Aprobar'
              ? 'Notificación de Aprobación de Taller'
              : 'Notificación de Rechazo de Taller',
            body: tipoAccion === 'Aprobar'
              ? '¡Felicitaciones! Su taller ha sido aprobado con éxito.'
              : 'Su taller no fue aprobado. Revise los requisitos e inténtelo nuevamente.',
            secretCode: tipoAccion === 'Aprobar' ? 'Aprovado Taller' : 'Rechazo Taller',
          });
        } catch (e) {
          console.log(e);
        }
        setSuccessModalType(tipoAccion === 'Aprobar' ? 'aprobado' : 'rechazado');
      } else {
        showToast('Ha ocurrido un error');
        setModalVisible(false);
        navigation.goBack();
      }
    } catch (e) {
      console.error(e);
      showToast('Ha ocurrido un error');
      setModalVisible(false);
      navigation.goBack();
    }
  };

  const mapLat = typeof lat === 'number' ? lat : Number(lat);
  const mapLng = typeof lng === 'number' ? lng : Number(lng);
  const showMap = Number.isFinite(mapLat) && Number.isFinite(mapLng);

  const statusColor =
    dataTaller?.status === 'Aprobado' ? '#22C55E'
    : dataTaller?.status === 'Rechazado' ? '#EF4444'
    : YELLOW;
  const statusTextColor =
    dataTaller?.status === 'Aprobado' || dataTaller?.status === 'Rechazado'
      ? '#FFFFFF'
      : DARK_BLUE;

  const docThumb = ({label, url, localUri, onSelect}) => {
    // Preview: prefer newly selected local image, else the stored URL
    const previewUri = localUri || url;
    const hasNew = !!localUri;

    if (previewUri) {
      return (
        <View key={label} style={styles.docThumbBtn}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setImgFullscreen(previewUri)}
            style={{flex: 1}}>
            <Image source={{uri: previewUri}} style={styles.docThumbImg} resizeMode="cover" />
            {hasNew && (
              <View style={styles.docNewBadge}>
                <Text style={styles.docNewBadgeText}>NUEVO</Text>
              </View>
            )}
            {!isEditing && (
              <View style={styles.docThumbOverlay}>
                <Icons5 name="expand" size={12} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity style={styles.docEditBtn} onPress={onSelect} activeOpacity={0.8}>
              <Icons5 name="camera" size={12} color="#FFFFFF" />
              <Text style={styles.docEditBtnText}>  Cambiar</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.docThumbLabel} numberOfLines={1}>{label}</Text>
        </View>
      );
    }

    // Empty cell
    if (isEditing) {
      return (
        <TouchableOpacity
          key={label}
          style={styles.docEmptyCell}
          onPress={onSelect}
          activeOpacity={0.8}>
          <View style={styles.docUploadIcon}>
            <Icons5 name="cloud-upload-alt" size={22} color={DARK_BLUE} />
          </View>
          <Text style={styles.docEmptyCellLabel} numberOfLines={1}>{label}</Text>
          <Text style={styles.docEmptyCellSub}>Toca para subir</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View key={label} style={styles.docEmptyCell}>
        <Icons5 name="file-alt" size={20} color="#D1D5DB" />
        <Text style={styles.docEmptyCellLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.docEmptyCellSub}>Sin archivo</Text>
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F4F5F9'}}>

      {/* ── Profile Header ──────────────────────────────────────────────── */}
      <View style={[styles.profileHeader, {paddingTop: insets.top + 4}]}>
        {/* Decorative circles */}
        <View style={styles.headerCircle1} pointerEvents="none" />
        <View style={styles.headerCircle2} pointerEvents="none" />

        {/* Top row: back + status */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.85}>
            <Icons name="angle-left" size={22} color={YELLOW} />
          </TouchableOpacity>
          <View style={{flex: 1}} />
          {dataTaller?.status ? (
            <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
              <Text style={[styles.statusBadgeText, {color: statusTextColor}]}>
                {dataTaller.status.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image
            source={imagePerfil ? {uri: imagePerfil} : notImageFound}
            style={styles.avatarImg}
            resizeMode="cover"
          />
        </View>

        {/* Name & estado */}
        <Text style={styles.profileName} numberOfLines={2}>
          {NameTaller || 'Negocio'}
        </Text>
        {estadoSelected ? (
          <View style={styles.profileLocationRow}>
            <Icons5 name="map-marker-alt" size={10} color="rgba(255,255,255,0.5)" />
            <Text style={styles.profileSubtitle}> {estadoSelected}</Text>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.headerDivider} />

        {/* Buttons */}
        <View style={styles.profileBtnsRow}>
          <TouchableOpacity
            style={styles.profileBtnPrimary}
            onPress={() => setAccionesModalVisible(true)}
            activeOpacity={0.85}>
            <Icons5 name="ellipsis-h" size={13} color={DARK_BLUE} />
            <Text style={styles.profileBtnPrimaryText}>  Acciones</Text>
          </TouchableOpacity>
          {isEditing && (
            <>
              <TouchableOpacity
                style={styles.profileBtnCancel}
                onPress={() => setIsEditing(false)}
                activeOpacity={0.85}>
                <Icons name="times" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.profileBtnCancelText}>  Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileBtnSave}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}>
                <Icons5 name="save" size={13} color="#FFFFFF" />
                <Text style={styles.profileBtnSaveText}>
                  {saving ? '  Guardando…' : '  Guardar'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {profileLoaded && uidTaller ? (
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ── Información general ─────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Información general" />
            <FieldBlock
              label="Nombre del negocio"
              value={Nombre}
              isEditing={isEditing}>
              <EditInput value={Nombre} onChangeText={setNombre} />
            </FieldBlock>
            <FieldBlock
              label="RIF"
              value={`${selectedPrefix}${cedula}`}
              isEditing={isEditing}
              vertical>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <View style={{width: '32%'}}>
                  <Dropdown
                    disable={!isEditing}
                    style={[styles.dropdownField, {minHeight: 46}]}
                    data={PREFIX_RIF}
                    labelField="label"
                    valueField="value"
                    value={selectedPrefix}
                    onChange={item => setSelectedPrefix(item.value)}
                  />
                </View>
                <View style={[styles.rifInput, !isEditing && styles.rifInputReadonly]}>
                  <TextInput
                    value={cedula}
                    onChangeText={setcedula}
                    keyboardType="numeric"
                    editable={isEditing}
                    placeholder="Número"
                    placeholderTextColor="#9CA3AF"
                    style={styles.rifInputText}
                  />
                </View>
              </View>
            </FieldBlock>
            <FieldBlock
              label="Correo electrónico"
              value={email}
              isEditing={isEditing}>
              <EditInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={false} />
            </FieldBlock>
            <FieldBlock
              label="Registro comercial"
              value={RegComercial}
              isEditing={isEditing}>
              <EditInput value={RegComercial} onChangeText={setRegComercial} keyboardType="numeric" />
            </FieldBlock>
            <FieldBlock
              label="Agente autorizado"
              value={checked === 'si' ? 'Sí' : 'No'}
              isEditing={isEditing}
              vertical>
              <View style={styles.segmentedWrap}>
                <TouchableOpacity
                  style={[styles.segmentedBtn, checked === 'si' && styles.segmentedBtnActive]}
                  onPress={() => isEditing && setChecked('si')}
                  activeOpacity={isEditing ? 0.8 : 1}>
                  <Icons5 name="check" size={13} color={checked === 'si' ? '#FFFFFF' : '#9CA3AF'} style={{marginRight: 6}} />
                  <Text style={[styles.segmentedBtnText, checked === 'si' && styles.segmentedBtnTextActive]}>Sí</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentedBtn, checked === 'no' && styles.segmentedBtnNo]}
                  onPress={() => isEditing && setChecked('no')}
                  activeOpacity={isEditing ? 0.8 : 1}>
                  <Icons name="times" size={13} color={checked === 'no' ? '#FFFFFF' : '#9CA3AF'} style={{marginRight: 6}} />
                  <Text style={[styles.segmentedBtnText, checked === 'no' && styles.segmentedBtnTextActive]}>No</Text>
                </TouchableOpacity>
              </View>
            </FieldBlock>
          </View>

          {/* ── Ubicación ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Ubicación" />
            <FieldBlock
              label="Estado"
              isEditing={isEditing}
              vertical>
              <Dropdown
                disable={!isEditing}
                style={[
                  styles.dropdownField,
                  !isEditing && styles.dropdownFieldReadonly,
                ]}
                placeholderStyle={{color: '#6B7280', fontSize: 14}}
                selectedTextStyle={{color: isEditing ? '#111827' : '#374151', fontSize: 14}}
                data={ESTADOS_VZ}
                labelField="label"
                valueField="value"
                value={estadoSelected}
                onChange={item => setestadoSelected(item.value)}
                search
              />
            </FieldBlock>
            {/* ── Location card ─────────────────────────────────────────── */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#FFFFFF', borderRadius: 14,
              padding: 14, marginBottom: 10,
              shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: {width: 0, height: 2},
              elevation: 2,
            }}>
              {/* Icon */}
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: locationPicked ? '#DCFCE7' : '#F3F4F6',
                alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
              }}>
                <Icons5 name="map-marker-alt" size={18} color={locationPicked ? '#16A34A' : '#9CA3AF'} />
              </View>

              {/* Text block */}
              <View style={{flex: 1, minWidth: 0}}>
                <Text numberOfLines={1} style={{fontSize: 14, fontWeight: '700', color: '#1F2937'}}>
                  Ubicación del negocio
                </Text>
                {locationPicked && (
                  <View style={{
                    alignSelf: 'flex-start',
                    backgroundColor: locationManuallyModified ? '#DBEAFE' : '#DCFCE7',
                    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginTop: 3,
                  }}>
                    <Text style={{
                      fontSize: 10, fontWeight: '700',
                      color: locationManuallyModified ? '#1D4ED8' : '#16A34A',
                    }}>
                      {locationManuallyModified ? 'Modificada' : 'Guardada'}
                    </Text>
                  </View>
                )}
                <Text style={{fontSize: 12, color: '#6B7280', marginTop: 3}}>
                  {locationManuallyModified
                    ? 'Ubicación actualizada correctamente'
                    : locationPicked
                      ? 'Ubicación guardada del perfil'
                      : 'Sin ubicación registrada'}
                </Text>
              </View>

              {/* Action button */}
              <TouchableOpacity
                style={{
                  backgroundColor: isEditing ? DARK_BLUE : '#F3F4F6',
                  borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
                  flexShrink: 0, marginLeft: 8,
                }}
                activeOpacity={0.8}
                onPress={() => isEditing ? setLocationPickerVisible(true) : setLocationViewerVisible(true)}>
                <Text style={{
                  fontSize: 12, fontWeight: '700',
                  color: isEditing ? YELLOW : '#374151',
                }}>
                  {isEditing ? (locationPicked ? 'Cambiar' : 'Seleccionar') : 'Ver mapa'}
                </Text>
              </TouchableOpacity>
            </View>
            <FieldBlock
              label="Dirección"
              value={Direccion}
              isEditing={isEditing}
              vertical>
              <EditInput value={Direccion} onChangeText={setDireccion} multiline height={100} />
            </FieldBlock>
          </View>

          {/* ── Contacto ────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Contacto" />
            <FieldBlock
              label="Teléfono"
              value={phone}
              isEditing={isEditing}>
              <EditInput value={phone} onChangeText={setPhone} keyboardType="numeric" />
            </FieldBlock>
            <FieldBlock
              label="WhatsApp"
              value={whats}
              isEditing={isEditing}>
              <EditInput value={whats} onChangeText={setwhats} keyboardType="numeric" />
            </FieldBlock>
          </View>

          {/* ── Presence / Redes ────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Redes sociales" />
            <FieldBlock
              label="Facebook"
              value={LinkFacebook}
              isEditing={isEditing}>
              <EditInput value={LinkFacebook} onChangeText={setLinkFacebook} autoCapitalize="none" />
            </FieldBlock>
            <FieldBlock
              label="Instagram"
              value={LinkInstagram}
              isEditing={isEditing}>
              <EditInput value={LinkInstagram} onChangeText={setLinkInstagram} autoCapitalize="none" />
            </FieldBlock>
            <FieldBlock
              label="TikTok"
              value={LinkTiktok}
              isEditing={isEditing}>
              <EditInput value={LinkTiktok} onChangeText={setLinkTiktok} autoCapitalize="none" />
            </FieldBlock>
          </View>

          {/* ── Detalles ────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Detalles del negocio" />
            <FieldBlock
              label="Características"
              value={Caracteristicas}
              isEditing={isEditing}
              vertical>
              <EditInput value={Caracteristicas} onChangeText={setCaracteristicas} multiline height={120} />
            </FieldBlock>
            <FieldBlock
              label="Experiencia"
              value={Experiencia}
              isEditing={isEditing}>
              <EditInput value={Experiencia} onChangeText={setExperiencia} />
            </FieldBlock>
            <FieldBlock
              label="Seguro"
              value={seguro}
              isEditing={isEditing}>
              <EditInput value={seguro} onChangeText={setseguro} />
            </FieldBlock>
          </View>

          {/* ── Métodos de pago ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Métodos de pago" />
            {!isEditing && (
              <Text style={styles.pagoHint}>
                {metodosPago.filter(m => m.checked).map(m => m.label).join(' · ') || '—'}
              </Text>
            )}
            {isEditing && (
              <View style={styles.pagoChipsWrap}>
                {metodosPago.map((method, index) => (
                  <PagoChip
                    key={method.value}
                    method={method}
                    index={index}
                    toggleMetodoPago={toggleMetodoPago}
                    isEditing={isEditing}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ── Horarios ────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Horarios de atención" />
            {BUSINESS_DAYS.map(day => {
              const dayData = businessHours[day.key] || {};
              return (
                <View
                  key={day.key}
                  style={[
                    styles.horarioDayCard,
                    isEditing && styles.horarioDayCardEditing,
                  ]}>
                  <View style={styles.horarioDayRow}>
                    <Text
                      style={[
                        styles.horarioDayLabel,
                        dayData.enabled && styles.horarioDayLabelActive,
                      ]}>
                      {day.label}
                    </Text>
                    {isEditing ? (
                      <Switch
                        value={!!dayData.enabled}
                        trackColor={{false: '#E5E7EB', true: YELLOW}}
                        thumbColor={dayData.enabled ? DARK_BLUE : '#9CA3AF'}
                        onValueChange={v =>
                          setBusinessHours(prev => ({
                            ...prev,
                            [day.key]: {...prev[day.key], enabled: v},
                          }))
                        }
                      />
                    ) : (
                      <View
                        style={[
                          styles.horarioStatusPill,
                          dayData.enabled && styles.horarioStatusPillActive,
                        ]}>
                        <Text
                          style={[
                            styles.horarioStatusText,
                            dayData.enabled && styles.horarioStatusTextActive,
                          ]}>
                          {dayData.enabled ? 'Abierto' : 'Cerrado'}
                        </Text>
                      </View>
                    )}
                  </View>
                  {dayData.enabled && (
                    <View style={styles.horarioTimeRow}>
                      <View style={[styles.horarioTimeCol, {marginRight: 6}]}>
                        <Text style={styles.horarioTimeLabel}>Apertura</Text>
                        <Dropdown
                          disable={!isEditing}
                          style={[styles.dropdownField, {minHeight: 40}]}
                          data={TIME_OPTIONS}
                          labelField="label"
                          valueField="value"
                          value={dayData.open}
                          onChange={item =>
                            setBusinessHours(prev => ({
                              ...prev,
                              [day.key]: {...prev[day.key], open: item.value},
                            }))
                          }
                        />
                      </View>
                      <View style={[styles.horarioTimeCol, {marginLeft: 6}]}>
                        <Text style={styles.horarioTimeLabel}>Cierre</Text>
                        <Dropdown
                          disable={!isEditing}
                          style={[styles.dropdownField, {minHeight: 40}]}
                          data={TIME_OPTIONS}
                          labelField="label"
                          valueField="value"
                          value={dayData.close}
                          onChange={item =>
                            setBusinessHours(prev => ({
                              ...prev,
                              [day.key]: {...prev[day.key], close: item.value},
                            }))
                          }
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* ── Documentos ──────────────────────────────────────────────── */}
          <View style={styles.section}>
            <SectionHeader title="Documentos" />
            <View style={styles.docGrid}>
              {docThumb({label: 'RIF / ID Fiscal',        url: rifIdFiscalUrl,       localUri: rifIdFiscalLocalUri,       onSelect: () => openPhotoOptions(setRifIdFiscalBase64,       setRifIdFiscalLocalUri)})}
              {docThumb({label: 'Permiso de operación',   url: permisoOperacionUrl,  localUri: permisoOperacionLocalUri,  onSelect: () => openPhotoOptions(setPermisoOperacionBase64,  setPermisoOperacionLocalUri)})}
              {docThumb({label: 'Logotipo',               url: logotipoNegocioUrl,   localUri: logotipoNegocioLocalUri,   onSelect: () => openPhotoOptions(setLogotipoNegocioBase64,   setLogotipoNegocioLocalUri)})}
              {docThumb({label: 'Foto frente',            url: fotoFrenteTallerUrl,  localUri: fotoFrenteTallerLocalUri,  onSelect: () => openPhotoOptions(setFotoFrenteTallerBase64,  setFotoFrenteTallerLocalUri)})}
              {docThumb({label: 'Foto interna',           url: fotoInternaTallerUrl, localUri: fotoInternaTallerLocalUri, onSelect: () => openPhotoOptions(setFotoInternaTallerBase64, setFotoInternaTallerLocalUri)})}
            </View>
          </View>

          <View style={{height: 40}} />
        </ScrollView>
      ) : null}

      {/* ── Modal: imagen fullscreen ────────────────────────────────────── */}
      <Modal
        transparent
        animationType="fade"
        visible={!!imgFullscreen}
        onRequestClose={() => setImgFullscreen(null)}
        statusBarTranslucent>
        <View style={styles.imgFullBackdrop}>
          <TouchableOpacity
            style={styles.imgFullClose}
            onPress={() => setImgFullscreen(null)}
            activeOpacity={0.8}>
            <Icons name="times" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {imgFullscreen ? (
            <Image
              source={{uri: imgFullscreen}}
              style={styles.imgFullImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>

      {/* ── Modal: menú acciones ─────────────────────────────────────────── */}
      <Modal
        transparent
        animationType="slide"
        visible={accionesModalVisible}
        onRequestClose={onCerrarMenuAcciones}>
        <TouchableWithoutFeedback onPress={onCerrarMenuAcciones}>
          <View style={styles.menuBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.menuCard}>
                {/* Handle bar */}
                <View style={styles.menuHandle} />

                {/* Header */}
                <View style={styles.menuHeader}>
                  <View style={styles.menuHeaderIcon}>
                    <Icons5 name="cogs" size={18} color={YELLOW} />
                  </View>
                  <View>
                    <Text style={styles.menuTitle}>Acciones</Text>
                    <Text style={styles.menuSubtitle}>{NameTaller || 'Negocio'}</Text>
                  </View>
                </View>

                {/* Editar negocio */}
                <TouchableOpacity
                  style={styles.menuOptionBtn}
                  onPress={onAccionEditarUsuario}
                  activeOpacity={0.8}>
                  <View style={[styles.menuOptionIcon, {backgroundColor: DARK_BLUE}]}>
                    <Icons5 name={isEditing ? 'eye' : 'pen'} size={14} color={YELLOW} />
                  </View>
                  <View style={styles.menuOptionBody}>
                    <Text style={styles.menuOptionTitle}>
                      {isEditing ? 'Modo visualización' : 'Editar negocio'}
                    </Text>
                    <Text style={styles.menuOptionDesc}>
                      {isEditing ? 'Salir del modo edición' : 'Modificar información del negocio'}
                    </Text>
                  </View>
                  <Icons name="angle-right" size={16} color={DARK_BLUE} />
                </TouchableOpacity>

                {/* Cargar servicio */}
                <TouchableOpacity
                  style={styles.menuOptionBtn}
                  onPress={() => {
                    setAccionesModalVisible(false);
                    navigation.navigate('FormService', {uid: '', uid_taller: uidTaller, nombre_taller: NameTaller});
                  }}
                  activeOpacity={0.8}>
                  <View style={[styles.menuOptionIcon, {backgroundColor: YELLOW}]}>
                    <Icons5 name="plus" size={14} color={DARK_BLUE} />
                  </View>
                  <View style={styles.menuOptionBody}>
                    <Text style={styles.menuOptionTitle}>Cargar servicio</Text>
                    <Text style={styles.menuOptionDesc}>
                      Agregar un nuevo servicio a este negocio
                    </Text>
                  </View>
                  <Icons name="angle-right" size={16} color={DARK_BLUE} />
                </TouchableOpacity>

                {/* Ver servicios */}
                <TouchableOpacity
                  style={styles.menuOptionBtn}
                  onPress={() => {
                    setAccionesModalVisible(false);
                    navigation.navigate('ServiciosContainer', {uid_taller: uidTaller, nombre_taller: NameTaller});
                  }}
                  activeOpacity={0.8}>
                  <View style={[styles.menuOptionIcon, {backgroundColor: DARK_BLUE}]}>
                    <Icons5 name="th-large" size={13} color={YELLOW} />
                  </View>
                  <View style={styles.menuOptionBody}>
                    <Text style={styles.menuOptionTitle}>Ver servicios</Text>
                    <Text style={styles.menuOptionDesc}>
                      Ver todos los servicios publicados de este negocio
                    </Text>
                  </View>
                  <Icons name="angle-right" size={16} color={DARK_BLUE} />
                </TouchableOpacity>

                {/* Aprobar */}
                <TouchableOpacity
                  style={styles.menuOptionBtn}
                  onPress={onAccionAprobar}
                  activeOpacity={0.8}>
                  <View style={[styles.menuOptionIcon, {backgroundColor: '#22C55E'}]}>
                    <Icons5 name="check" size={14} color="#FFFFFF" />
                  </View>
                  <View style={styles.menuOptionBody}>
                    <Text style={styles.menuOptionTitle}>Aprobar solicitud</Text>
                    <Text style={styles.menuOptionDesc}>
                      Activar este negocio en la plataforma
                    </Text>
                  </View>
                  <Icons name="angle-right" size={16} color={DARK_BLUE} />
                </TouchableOpacity>

                {/* Rechazar */}
                <TouchableOpacity
                  style={styles.menuOptionBtn}
                  onPress={onAccionRechazar}
                  activeOpacity={0.8}>
                  <View style={[styles.menuOptionIcon, {backgroundColor: '#EF4444'}]}>
                    <Icons5 name="times" size={14} color="#FFFFFF" />
                  </View>
                  <View style={styles.menuOptionBody}>
                    <Text style={styles.menuOptionTitle}>Rechazar solicitud</Text>
                    <Text style={styles.menuOptionDesc}>
                      Denegar el acceso a la plataforma
                    </Text>
                  </View>
                  <Icons name="angle-right" size={16} color={DARK_BLUE} />
                </TouchableOpacity>

                {/* Close */}
                <TouchableOpacity
                  style={styles.menuCloseBtn}
                  onPress={onCerrarMenuAcciones}
                  activeOpacity={0.8}>
                  <Text style={styles.menuCloseBtnText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Modal: confirmación ──────────────────────────────────────────── */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={onCancel}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.confirmBackdrop}>
          <TouchableWithoutFeedback>
          <View style={styles.confirmCard}>
            <View
              style={[
                styles.confirmIconWrap,
                {backgroundColor: tipoAccion === 'Aprobar' ? '#E8F5E9' : '#FFEBEE'},
              ]}>
              <Icons5
                name={tipoAccion === 'Aprobar' ? 'check-circle' : 'times-circle'}
                size={32}
                color={tipoAccion === 'Aprobar' ? '#2E7D32' : '#C62828'}
              />
            </View>
            <Text style={styles.confirmTitle}>
              {tipoAccion === 'Aprobar' ? '¿Aprobar negocio?' : '¿Rechazar negocio?'}
            </Text>
            <Text style={styles.confirmBody}>
              {tipoAccion === 'Aprobar'
                ? 'El negocio será aprobado y se notificará al propietario.'
                : 'El negocio será rechazado y se notificará al propietario.'}
            </Text>

            {tipoAccion === 'Rechazar' && (
              <View style={styles.confirmInputWrap}>
                <View style={styles.confirmInputLabelRow}>
                  <Text style={styles.confirmInputLabel}>Motivo del rechazo</Text>
                  <Text style={styles.confirmInputRequired}> *</Text>
                </View>
                <TextInput
                  style={styles.confirmInput}
                  placeholder="Describe detalladamente el motivo del rechazo..."
                  placeholderTextColor="#9BA6B8"
                  value={motivoRechazo}
                  onChangeText={setMotivoRechazo}
                  multiline
                  textAlignVertical="top"
                  scrollEnabled
                  blurOnSubmit={false}
                />
                {!motivoRechazo.trim() && (
                  <Text style={styles.confirmInputHint}>Este campo es obligatorio para rechazar.</Text>
                )}
              </View>
            )}

            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={styles.confirmBtnCancel}
                onPress={onCancel}
                activeOpacity={0.8}>
                <Text style={styles.confirmBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtnConfirm,
                  {backgroundColor: tipoAccion === 'Aprobar' ? '#2E7D32' : '#C62828'},
                  tipoAccion === 'Rechazar' && !motivoRechazo.trim() && styles.confirmBtnDisabled,
                ]}
                onPress={onConfirm}
                disabled={tipoAccion === 'Rechazar' && !motivoRechazo.trim()}
                activeOpacity={0.8}>
                <Text style={styles.confirmBtnConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
          </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal: negocio APROBADO ──────────────────────────────────────── */}
      <Modal
        transparent
        animationType="fade"
        visible={successModalType === 'aprobado'}
        onRequestClose={() => { setSuccessModalType(null); navigation.goBack(); }}>
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            {/* Icono */}
            <View style={styles.successIconRing}>
              <View style={[styles.successIconInner, {backgroundColor: '#22C55E'}]}>
                <Icons5 name="check" size={28} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.successTitle}>¡Negocio aprobado!</Text>
            <Text style={styles.successSubtitle}>
              <Text style={{fontWeight: '700', color: '#1A1F36'}}>{NameTaller}</Text>
              {' '}ya forma parte de la red de negocios verificados de Solvers.{'\n'}
              El propietario ha sido notificado.
            </Text>

            <View style={styles.successDivider} />

            <Text style={styles.successPromptTitle}>¿Deseas cargar servicios ahora?</Text>
            <Text style={styles.successPromptBody}>
              Puedes agregar los servicios de este negocio en este momento o hacerlo más tarde desde su perfil.
            </Text>

            {/* Botón principal: Cargar servicios */}
            <TouchableOpacity
              style={styles.successBtnPrimary}
              activeOpacity={0.88}
              onPress={() => {
                setSuccessModalType(null);
                navigation.navigate('FormService', {
                  uid: '',
                  uid_taller: uidTaller,
                  nombre_taller: NameTaller,
                });
              }}>
              <Icons5 name="plus-circle" size={16} color="#1D1E56" />
              <Text style={styles.successBtnPrimaryText}>  Cargar servicios ahora</Text>
            </TouchableOpacity>

            {/* Botón secundario: Continuar */}
            <TouchableOpacity
              style={styles.successBtnSecondary}
              activeOpacity={0.85}
              onPress={() => { setSuccessModalType(null); navigation.goBack(); }}>
              <Text style={styles.successBtnSecondaryText}>Continuar más tarde</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal: negocio RECHAZADO ─────────────────────────────────────── */}
      <Modal
        transparent
        animationType="fade"
        visible={successModalType === 'rechazado'}
        onRequestClose={() => { setSuccessModalType(null); navigation.goBack(); }}>
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            {/* Icono */}
            <View style={styles.successIconRing}>
              <View style={[styles.successIconInner, {backgroundColor: '#EF4444'}]}>
                <Icons5 name="times" size={28} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.successTitle}>Solicitud rechazada</Text>
            <Text style={styles.successSubtitle}>
              La solicitud de{' '}
              <Text style={{fontWeight: '700', color: '#1A1F36'}}>{NameTaller}</Text>
              {' '}ha sido rechazada correctamente.{'\n'}
              El propietario ha sido informado con el motivo indicado.
            </Text>

            <TouchableOpacity
              style={[styles.successBtnPrimary, {backgroundColor: '#FEE2E2', borderColor: '#FECACA'}]}
              activeOpacity={0.88}
              onPress={() => { setSuccessModalType(null); navigation.goBack(); }}>
              <Icons5 name="arrow-left" size={14} color="#C62828" />
              <Text style={[styles.successBtnPrimaryText, {color: '#C62828'}]}>  Volver al listado</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal: Visor de ubicación (solo lectura) ─────────────────────── */}
      <Modal
        visible={locationViewerVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setLocationViewerVisible(false)}>
        <View style={{flex: 1, backgroundColor: '#1D1E56'}}>
          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
          }}>
            <TouchableOpacity
              onPress={() => setLocationViewerVisible(false)}
              activeOpacity={0.8}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center', justifyContent: 'center', marginRight: 14,
              }}>
              <Icons name="times" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{flex: 1, fontSize: 16, fontWeight: '700', color: YELLOW}}>
              Ubicación del negocio
            </Text>
          </View>
          {/* WebView viewer */}
          <WebView
            source={{html: buildLocationViewerHTML(lat, lng)}}
            style={{flex: 1}}
            originWhitelist={['*']}
            javaScriptEnabled
          />
        </View>
      </Modal>

      {/* ── Modal: Selector de ubicación (edición) ──────────────────────── */}
      <Modal
        visible={locationPickerVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setLocationPickerVisible(false)}>
        <View style={{flex: 1, backgroundColor: '#1D1E56'}}>
          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
          }}>
            <TouchableOpacity
              onPress={() => setLocationPickerVisible(false)}
              activeOpacity={0.8}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center', justifyContent: 'center', marginRight: 14,
              }}>
              <Icons name="times" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{flex: 1, fontSize: 16, fontWeight: '700', color: YELLOW}}>
              Seleccionar ubicación
            </Text>
          </View>
          {/* WebView picker */}
          <WebView
            ref={locationPickerRef}
            source={{html: buildLocationPickerHTML(lat, lng)}}
            style={{flex: 1}}
            originWhitelist={['*']}
            javaScriptEnabled
            onMessage={handleLocationPickerMessage}
          />
        </View>
      </Modal>

      {/* ── Modal selector de foto ────────────────────────────────────────── */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,68,0.55)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPhotoModalVisible(false)} />
          <View style={{
            backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingHorizontal: 24, paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 22 }} />
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2344', textAlign: 'center', marginBottom: 6 }}>
              Adjuntar imagen o archivo
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 28 }}>
              Seleccione una opción para capturar{'\n'}la imagen y comprobar el documento
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Documento', icon: 'document-attach-outline', onPress: handlePickDocument },
                { label: 'Galería',   icon: 'images-outline',          onPress: handlePickGallery },
                { label: 'Cámara',    icon: 'camera-outline',          onPress: handlePickCamera },
              ].map(({ label, icon, onPress }) => (
                <TouchableOpacity key={label} onPress={onPress} activeOpacity={0.75}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20,
                    borderRadius: 18, backgroundColor: '#F0F1FA', borderWidth: 1.5, borderColor: '#2D3261' }}>
                  <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#2D3261',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icons2 name={icon} size={26} color="#FFD60A" />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2344', textAlign: 'center' }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setPhotoModalVisible(false)}
              style={{ paddingVertical: 14, borderRadius: 16, backgroundColor: '#F0F1FA', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2344' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FormTaller;
