import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  ToastAndroid,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  InteractionManager,
  AppState,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { hora12 } from '../../../utils/taller';
import BottomContainer from '../../../commonComponents/bottomContainer';
import { commonStyles } from '../../../style/commonStyle.css';
import { external } from '../../../style/external.css';
import { Plus } from '../../../utils/icon';
import { addtoBag, buyNow, writeYourReview } from '../../../constant';
import styles from './style.css';
import { Cart } from '../../../assets/icons/cart';
import DetailsTextContainer from '../../../components/productDetail/productOne/detailsText';
import DescriptionText from '../../../components/productDetail/productOne/descriptionText';
import BrandData from '../../../components/productDetail/productOne/brandData';
import IconProduct from '../../../components/productDetail/productOne/iconProduct';
import KeyFeatures from '../../../components/productDetail/productOne/keyFeatures';
import { useValues } from '../../../../App';
import SliderDetails from '../../../components/productDetail/productOne/sliderDetails';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import api from '../../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TallerDetailEmergencyModal from '../../tallerDetail/emergencyModalCliente';
import { FlatList } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  ClipboardDocumentIcon,
  ClipboardIcon,
  PhoneIcon,
} from 'react-native-heroicons/outline'; // Importar íconos
import { Linking } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import MapComponent from '../../map';
import MapboxNavigation from '../../../commonComponents/MapboxNavigation';
import ArrivedModal from '../../../commonComponents/ArrivedModal';
import BeautifulModal from '../../ratingScreen/components/modal';
import RatingSuccessModal from '../../../commonComponents/RatingSuccessModal';
import useLocationPermission from '../../../hooks/useLocationPermission';
import LocationPermissionModal from '../../../commonComponents/LocationPermissionModal';
import ContactBar, { CONTACT_BAR_SPACE } from '../../../ui/ContactBar';
import { llamar, abrirWhatsApp, puedeLlamar, puedeWhatsApp } from '../../../utils/contacto';
import { openHint, openState, tallerPhone, tallerWhatsApp, precioDesde, sentenceCase, firstImage, formatPrice, priceValue } from '../../../utils/taller';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  ShieldCheck,
  Store,
} from 'lucide-react-native';
import { AppText, Tag, TallerCard, colors, space, radius, shadow, TOUCH } from '../../../ui';
import { Galeria, Seccion, Valoracion, MetodosPago, metodosActivos, Horario, listaImagenes } from '../../../ui/detalle';

/** `metodos_pago` viene como objeto { efectivo: true, ... }, no como array. */
function hasActivePaymentMethods(metodosPago) {
  if (metodosPago == null) {
    return false;
  }
  if (Array.isArray(metodosPago)) {
    return metodosPago.length > 0;
  }
  if (typeof metodosPago === 'object') {
    return Object.values(metodosPago).some(v => v === true);
  }
  return false;
}

const HORARIO_DAY_ORDER = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

const HORARIO_DAY_LABELS = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const normalizeDayKey = dayKey =>
  String(dayKey ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/** Agrupa días consecutivos (orden Lunes→Domingo) con el mismo horario en una sola fila. */
function groupHorarioRowsByConsecutiveSameTime(detailRows) {
  if (!detailRows.length) {
    return [];
  }
  const grouped = [];
  let i = 0;
  while (i < detailRows.length) {
    const time = detailRows[i].time;
    let j = i;
    while (j + 1 < detailRows.length && detailRows[j + 1].time === time) {
      j += 1;
    }
    const start = detailRows[i];
    const end = detailRows[j];
    const label =
      i === j ? start.label : `${start.label} – ${end.label}`;
    grouped.push({
      key: detailRows.slice(i, j + 1).map(r => r.key).join('|'),
      label,
      time,
    });
    i = j + 1;
  }
  return grouped;
}

/** Filas por día o texto plano (fallback `horario`). */
function getHorarioAtencionDisplay(dataTaller) {
  if (!dataTaller) {
    return { rows: [], plain: '' };
  }

  let raw = dataTaller.horarios_atencion;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        raw = parsed;
      } else {
        return { rows: [], plain: String(raw).trim() };
      }
    } catch {
      return { rows: [], plain: raw.trim() };
    }
  }

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const normalizedSlots = Object.entries(raw).reduce((acc, [key, value]) => {
      const normalizedKey = normalizeDayKey(key);
      if (HORARIO_DAY_ORDER.includes(normalizedKey)) {
        acc[normalizedKey] = value;
      }
      return acc;
    }, {});

    const detailRows = [];
    for (const key of HORARIO_DAY_ORDER) {
      const slot = normalizedSlots[key];
      if (!slot || slot.enabled !== true) {
        continue;
      }
      const open = slot.open != null ? String(slot.open).trim() : '';
      const close = slot.close != null ? String(slot.close).trim() : '';
      if (!open || !close) {
        continue;
      }
      detailRows.push({
        key,
        label: HORARIO_DAY_LABELS[key] || key,
        time: `${hora12(open)} – ${hora12(close)}`,
      });
    }
    if (detailRows.length > 0) {
      return { rows: groupHorarioRowsByConsecutiveSameTime(detailRows), plain: '' };
    }
  }

  const horarioStr = dataTaller.horario;
  if (horarioStr != null && String(horarioStr).trim() !== '') {
    return { rows: [], plain: String(horarioStr).trim() };
  }

  return { rows: [], plain: '' };
}

const STORAGE_CLIENTE_FAB_TALLER_UID = '@cliente_fab_taller_uid';

const KEYS_BY_JS_DOW = [
  'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado',
];

function timeStrToMinutes(s) {
  if (!s || typeof s !== 'string') return null;
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function isNowWithinHorarioAtencion(horariosRaw, now = new Date()) {
  let raw = horariosRaw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        raw = parsed;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const dayKey = KEYS_BY_JS_DOW[now.getDay()];
  let slotData = null;
  for (const [k, v] of Object.entries(raw)) {
    if (normalizeDayKey(k) === dayKey) { slotData = v; break; }
  }
  if (!slotData || slotData.enabled !== true) return false;
  const openM = timeStrToMinutes(slotData.open);
  const closeM = timeStrToMinutes(slotData.close);
  if (openM == null || closeM == null) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  if (closeM >= openM) return cur >= openM && cur <= closeM;
  return cur >= openM || cur <= closeM;
}

const ProductDetailOne = ({ navigation }) => {
  const { bgFullStyle, textColorStyle, t, textRTLStyle, iconColorStyle } =
    useValues();

  const { checkAndOpenMap, locModalVisible, setLocModalVisible, locModalType } = useLocationPermission();

  const route = useRoute();

  const [DataService, setDataService] = useState({
    categoria: '',
    descripcion: '',
    estatus: true,
    garantia: '',
    id: '',
    nombre_servicio: '',
    precio: '',
    puntuacion: '',
    subcategoria: [],
    taller: '',
    uid_categoria: '',
    uid_servicio: '',
    uid_subcategoria: '',
    uid_taller: '',
  });

  const [uidService, setuidService] = useState('');
  const [typeUserLogged, settypeUserLogged] = useState('');
  const [data, setData] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [dataUser, setDataUser] = useState();
  const [dataProductCategory, setDataProductCategory] = useState('');
  const [dataComments, setDataComments] = useState([]);
  const [dataAverage, setDataAverage] = useState(0);
  const [renderLoading, setRenderLoading] = useState(false);

  const [showRuta, setshowRuta] = useState(false);
  const [showArrived, setShowArrived] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [lastRating, setLastRating] = useState(0);

  const [dataTaller, setdataTaller] = useState(null);

  const insets = useSafeAreaInsets();
  const [showFabClienteHorario, setShowFabClienteHorario] = useState(false);
  const [isCliente, setIsCliente] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);

  const scrollRef = React.createRef();

  useEffect(() => {
    const initScreen = async () => {
      const { uid, typeUser } = route.params || {};
      // setRenderLoading(true);
      if (uid) {
        console.log(uid);
        console.log("uiddjfkbdfjgbdjfkg", uid)
        await getDataFirst(uid, typeUser);
      }
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setRenderLoading(false);
          });
        });
      });
      scrollRef.current?.scrollTo({ y: 0, animated: true }); // Scroll to top
    };
    initScreen();
  }, []);

  const getDataFirst = async (uid, typeUser) => {
    await Promise.all([getService(uid), getData(uid)]);
    setuidService(uid);
    settypeUserLogged(typeUser);
  };

  const getService = async uid => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;


    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/getUserByUid', {
        uid: user.uid,
      });


      const result = response.data;
      setDataUser(result.userData);

      console.log("result.userData", result.userData)

    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }


    try {
      const response = await api.post('/usuarios/getServiceByUid', {
        uid: uid,
      });

      // Verificar la respuesta del servidor
      const result = response.data;
      const resultData = {
        ...response.data,
        uid_servicio: result.id,
      };

      console.log(
        'resultDataresultDataresultDataresultDataresultDataresultDataresultData',
      );
      console.log('resultData', resultData);
      console.log(
        'resultDataresultDataresultDataresultDataresultDataresultDataresultData',
      );

      if (result.message === 'Servicio encontrado') {
        setDataService(resultData.service);
        console.log("este es el servicio")
        console.log(resultData.service)

        try {
          const responseTaller = await api.post('/usuarios/getUserByUid', {
            uid: resultData.service.uid_taller
          });
          console.log("abajo esta el result123444")
          console.log(responseTaller.data.userData)
          setdataTaller(responseTaller.data.userData)
        } catch (error) {

        }


        await getAdditionalServices(
          resultData?.service?.uid_categoria,
          resultData?.service?.uid_servicio
            ? resultData?.service?.uid_servicio
            : resultData?.service?.id,
        );
      } else {
        // console.log('Servicio no encontrado');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  const getData = async (id = null) => {
    // try {
    //   const jsonValue = await AsyncStorage.getItem('@userInfo');
    //   const user = jsonValue != null ? JSON.parse(jsonValue) : null;

    //   console.log('Usuario:', user);

    //   try {
    //     // Realizar la solicitud GET para obtener todos los servicios
    //     const response = await api.get('/home/getServices');

    //     // Verificar la respuesta del servidor
    //     if (response.status === 200) {
    //       const allServices = response.data;

    //       // Si se proporciona un ID, filtramos los datos localmente
    //       const filteredData = id
    //         ? allServices.filter(
    //           service =>
    //             service.uid_servicio === id ||
    //             (service.uid_servicio === '' && service.id === id),
    //         )
    //         : allServices;

    //       // console.log('filtered', filteredData);

    //       // Actualizar el estado con los datos filtrados
    //       setData(filteredData);
    //     } else {
    //       setData([]);
    //     }
    //   } catch (error) {
    //     console.error('Error en la solicitud:', error);
    //   }
    // } catch (e) {
    //   console.error('Error al obtener el usuario:', e);
    // }
  };

  const getAdditionalServices = async (category, id) => {

    try {
      // Realizar la solicitud POST con parámetros
      const response = await api.post('/home/getServicesByCategory', {
        uid_categoria: category,
        id: id,
      });

      // Verificar la respuesta del servidor
      if (response.status === 200) {
        const allServices = response.data;

        // Filtrar los servicios que sean distintos al id proporcionado
        const filteredServices = allServices.filter(service => service.id !== id || service.uid_servicio !== id);

        // Actualizar el estado con los datos filtrados
        setDataProductCategory(filteredServices);
      } else {
        console.warn('Respuesta no exitosa. Estado:', response.status);
        setDataProductCategory([]);
      }
    } catch (error) {
      console.error(
        'Error en la solicitud de categoría:',
        error.message || error,
      );
    }
  };

  const calculateAverageScore = comments => {
    if (!Array.isArray(comments) || comments.length === 0) return 0;
    const totalScore = comments.reduce(
      (sum, comment) => sum + (comment?.puntuacion || 0),
      0,
    );
    const averageScore = totalScore / comments.length;
    return Math.min(Math.max(Math.ceil(averageScore), 0), 5);
  };

  const getCommentsByService = async service => {
    try {
      const uidService = service?.uid_servicio || service?.id;
      if (!uidService) return;
      const response = await api.post('/home/getCommentsByService', {
        uid_service: uidService,
      });
      if (response.status === 200) {
        const comments = Array.isArray(response.data) ? response.data : [];
        setDataComments(comments);
        setDataAverage(calculateAverageScore(comments));
      } else {
        setDataComments([]);
        setDataAverage(0);
      }
    } catch (error) {
      console.error('Error en comentarios del servicio:', error);
      setDataComments([]);
      setDataAverage(0);
    }
  };

  useEffect(() => {
    if (DataService?.uid_servicio || DataService?.id) {
      getCommentsByService(DataService);
    }
  }, [DataService?.uid_servicio, DataService?.id]);

  useFocusEffect(
    useCallback(() => {
      if (DataService?.uid_servicio || DataService?.id) {
        getCommentsByService(DataService);
      }
    }, [DataService?.uid_servicio, DataService?.id]),
  );

  const recomputeFabVisibilidad = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem('@userInfo');
      const user = json ? JSON.parse(json) : null;
      setIsCliente(user?.typeUser === 'Cliente');
      if (!user || user.typeUser !== 'Cliente') { setShowFabClienteHorario(false); return; }
      if (!dataTaller) { setShowFabClienteHorario(false); return; }
      setShowFabClienteHorario(isNowWithinHorarioAtencion(dataTaller.horarios_atencion));
    } catch (_e) { setShowFabClienteHorario(false); }
  }, [dataTaller]);

  useEffect(() => { recomputeFabVisibilidad(); }, [recomputeFabVisibilidad]);

  useEffect(() => {
    const id = setInterval(recomputeFabVisibilidad, 60 * 1000);
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') recomputeFabVisibilidad();
    });
    return () => { clearInterval(id); sub.remove(); };
  }, [recomputeFabVisibilidad]);

  const handleFabClientePress = () => setEmergencyModalVisible(true);


  const PublicarService = async () => {
    console.log(DataService);

    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post(
        '/usuarios/saveOrUpdateService',
        DataService,
      );
      // Verificar la respuesta del servidor
      const result = response.data;

      if (
        result.message === 'Servicio actualizado exitosamente' ||
        result.message === 'Servicio creado exitosamente'
      ) {
        showToast('Servicio Publicado con exito');
        navigation.goBack();
      } else {
        showToast('Ha ocurrido un error');
        navigation.goBack();
      }
    } catch (error) {
      // Manejo de errores
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
      showToast('Ha ocurrido un error');
      navigation.goBack();
    }
  };

  const handleContact = async typeContact => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;

    const servicePayload = {
      id: DataService.uid_servicio || DataService.id,
      nombre_servicio: data[0].nombre_servicio || '',
      precio: DataService?.precio || '',
      taller: dataTaller?.nombre || '',
      uid_servicio: DataService.id || '',
      uid_taller: DataService?.uid_taller || '',
      usuario_id: user?.uid || '',
      usuario_nombre: user?.nombre || '',
      usuario_email: user?.email || '',
      typeContact: typeContact,
    };

    console.log('-----------------------------------------------------');
    console.log('servicePayload', servicePayload);
    console.log('-----------------------------------------------------');

    try {
      // Realizar la solicitud al endpoint
      const response = await api.post('/home/contactService', servicePayload);

      // Si llegamos aquí, la solicitud fue exitosa
      const responseData = response.data; // Axios ya procesa el JSON automáticamente
      console.log('Servicio guardado exitosamente:', responseData);
    } catch (error) {
      // Manejar errores
      if (error.response) {
        // Errores del servidor (respuesta con error, por ejemplo, 400, 500)
        console.error('Error del servidor:', error.response.data);
      } else if (error.request) {
        // La solicitud se realizó pero no hubo respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        // Otro tipo de error
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
  };

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const GetCoordenadas = () => { };

  // ── Calificación del servicio → Servicios/{uid}/calificaciones ────────────
  const handleRatingSubmit = async (puntuacion, comentario, etiquetas_rapidas) => {
    setShowRating(false);
    setLastRating(puntuacion);
    try {
      const json = await AsyncStorage.getItem('@userInfo');
      const user = json ? JSON.parse(json) : null;
      await api.post('/home/addCommentToService', {
        uid_service:      DataService?.uid_servicio || DataService?.id || '',
        nombre_taller:    dataTaller?.nombre || '',
        uid_taller:       DataService?.uid_taller || '',
        puntuacion,
        comentario,
        etiquetas_rapidas,
        usuario: {
          uid:    user?.uid    || user?.id    || '',
          nombre: user?.nombre || user?.name  || '',
          email:  user?.email  || '',
        },
      });
      setShowRatingSuccess(true);
    } catch (e) {
      console.warn('[ProductDetailOne] Error al enviar calificación:', e);
    }
  };

  const closeMapRutas = () => {
    setshowRuta(false);
  };

  const saveServiceContactView = async (type) => {
    try {
      await api.post('/home/saveServiceContactView', {
        nombre_taller: dataTaller?.nombre || null,
        uid_taller: DataService?.uid_taller || null,
        usuario: {
          id: dataUser?.id || dataUser?.uid || null,
          email: dataUser?.email || null,
          nombre: dataUser?.nombre || null,
        },
        type,
      });
    } catch (error) {
      console.warn('saveServiceContactView error:', error?.message);
    }
  };

  const handleCall = async () => {
    if (await llamar(tallerPhone(dataTaller))) saveServiceContactView('Llamada');
  };

  /**
   * WhatsApp con aviso al taller: le llega una notificación de que un
   * conductor está interesado y se registra el contacto.
   */
  const handleWhatsApp = async () => {
    const raw = tallerWhatsApp(dataTaller);
    if (!puedeWhatsApp(raw)) {
      showToast('Este taller no tiene WhatsApp registrado.');
      return;
    }
    // El servidor avisa al taller: su token push ya no viaja a la app.
    api
      .post('/home/notificarContactoTaller', {
        uid_taller: DataService?.uid_taller,
        nombre_servicio: DataService?.nombre_servicio || '',
      })
      .catch(() => {});
    handleContact('WhatsApp').catch(() => {});
    saveServiceContactView('Whatsapp');
    const servicio = String(DataService?.nombre_servicio || '').trim();
    const msg = `Hola ${dataTaller?.nombre || ''}, vi ${servicio ? `su servicio "${servicio}"` : 'su taller'} en Solvers y quisiera más información.`;
    abrirWhatsApp(raw, msg.replace(/\s+/g, ' '));
  };

  const stylesMap = StyleSheet.create({
    container: { justifyContent: 'center', alignItems: 'center' },
  });
  const dataTest = [{ phone: '4241436070' }];
  const precioNumero = Number(
    String(DataService?.precio ?? '')
      .replace(',', '.')
      .replace(/[^0-9.]/g, ''),
  );
  const precioVisible = Number.isFinite(precioNumero) && precioNumero > 0
    ? `${precioNumero.toFixed(2)}`
    : 'Por consultar';
  const heroImageSource =
    Array.isArray(DataService?.service_image) && DataService.service_image.length > 0
      ? {uri: DataService.service_image[0]}
      : require('../../../assets/noimageNew.png');

  const tallerDetailUid =
    dataTaller?.uid || dataTaller?.id || DataService?.uid_taller || '';

  const horarioAtencionDisplay = getHorarioAtencionDisplay(dataTaller);
  const showHorarioAtencion =
    horarioAtencionDisplay.rows.length > 0 ||
    horarioAtencionDisplay.plain !== '';

  const goToTallerDetail = () => {
    if (!tallerDetailUid) {
      return;
    }
    navigation.navigate('TallerDetail', {
      tallerId: tallerDetailUid,
      uid_taller: tallerDetailUid,
      tallerData: dataTaller,
    });
  };

  const nombreServicio = String(DataService?.nombre || DataService?.nombre_servicio || '').trim() || 'Servicio';
  const nombreTallerVisible = String(dataTaller?.nombre || dataTaller?.nombre_taller || '').trim();
  const estadoAbierto = openState(dataTaller?.horarios_atencion);
  const precioTexto = precioDesde(DataService?.precio, DataService?.tarifa);
  const garantiaTexto = String(DataService?.garantia || '').trim();
  const descripcionTexto = String(DataService?.descripcion || '').trim();
  const direccionTaller = String(
    dataTaller?.Direccion || dataTaller?.direccion || dataTaller?.ubicacion?.direccion || '',
  ).trim();
  const zonaTaller = [dataTaller?.municipio, dataTaller?.estado].map(v => String(v || '').trim()).filter(Boolean).join(', ');
  const categorias = [
    DataService?.nombre_categoria || DataService?.categoria,
    Array.isArray(DataService?.subcategoria) ? DataService.subcategoria[0]?.nombre_subcategoria : DataService?.subcategoria,
  ]
    .map(v => (typeof v === 'string' ? sentenceCase(v.trim()) : ''))
    .filter((v, i, a) => v && a.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i);
  const idActual = DataService?.uid_servicio || DataService?.id;
  const parecidos = (Array.isArray(dataProductCategory) ? dataProductCategory : [])
    .filter(s => (s?.uid_servicio || s?.id) && (s?.uid_servicio || s?.id) !== idActual)
    .slice(0, 4);
  const logoTaller = firstImage(dataTaller?.logotipoNegocio) || firstImage(dataTaller?.image_perfil);

  const verResenas = () =>
    navigation.navigate('RatingScreen', {
      dataComments,
      dataAverage,
      id: DataService?.id,
      dataTotal: DataService,
    });

  return (
    <View style={sd.pantalla}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: CONTACT_BAR_SPACE + space.l }}>
        <Galeria
          imagenes={listaImagenes(DataService?.service_image)}
          onBack={() => navigation.goBack()}
        />

        <View style={sd.cuerpo}>
          {/* Encabezado: qué es, quién lo hace, cómo lo califican y si está abierto */}
          <View style={sd.encabezado}>
            <AppText variant="title" accessibilityRole="header">
              {sentenceCase(nombreServicio)}
            </AppText>

            {nombreTallerVisible ? (
              <Pressable
                onPress={goToTallerDetail}
                disabled={!tallerDetailUid}
                accessibilityRole="button"
                accessibilityLabel={`Ver el taller ${nombreTallerVisible}`}
                style={({ pressed }) => [sd.taller, pressed && { opacity: 0.7 }]}>
                {logoTaller ? (
                  <Image source={{ uri: logoTaller }} style={sd.tallerLogo} />
                ) : (
                  <View style={[sd.tallerLogo, sd.tallerLogoVacio]}>
                    <Store size={18} color={colors.navy} strokeWidth={2.2} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" numberOfLines={1}>
                    {nombreTallerVisible}
                  </AppText>
                  <AppText variant="caption" color={colors.muted}>
                    Ver taller y todos sus servicios
                  </AppText>
                </View>
                <ChevronRight size={20} color={colors.navy} strokeWidth={2.4} />
              </Pressable>
            ) : null}

            <View style={sd.filaEstado}>
              <Valoracion comentarios={dataComments} onPress={dataComments.length ? verResenas : undefined} />
              {estadoAbierto === 'open' ? (
                <Tag label="Abierto ahora" tone="ok" />
              ) : estadoAbierto === 'closed' ? (
                <Tag label="Cerrado" tone="error" />
              ) : null}
            </View>
          </View>

          {/* Precio y garantía */}
          <View style={sd.precio}>
            <AppText variant="caption" color={colors.onNavyMuted}>
              Precio
            </AppText>
            <AppText variant="title" color={colors.onNavy}>
              {precioTexto}
            </AppText>
            {garantiaTexto ? (
              <View style={sd.garantia}>
                <ShieldCheck size={16} color={colors.yellow} strokeWidth={2.2} />
                <AppText variant="caption" color={colors.onNavy}>
                  Garantía: {garantiaTexto}
                </AppText>
              </View>
            ) : null}
            <AppText variant="caption" color={colors.onNavyMuted} style={{ marginTop: space.s }}>
              El precio final lo confirma el taller al revisar tu carro.
            </AppText>
          </View>

          <Seccion titulo="Sobre este servicio">
            <AppText variant="body" color={descripcionTexto ? colors.text : colors.muted}>
              {descripcionTexto || 'El taller no agregó una descripción. Escríbele para más detalles.'}
            </AppText>
            {categorias.length ? (
              <View style={sd.tags}>
                {categorias.map(c => (
                  <Tag key={c} label={c} tone="info" />
                ))}
              </View>
            ) : null}
          </Seccion>

          {showHorarioAtencion ? (
            <Seccion titulo="Horario de atención">
              <Horario filas={horarioAtencionDisplay.rows} texto={horarioAtencionDisplay.plain} />
            </Seccion>
          ) : null}

          {metodosActivos(dataTaller?.metodos_pago).length ? (
            <Seccion titulo="Formas de pago">
              <MetodosPago metodos={dataTaller?.metodos_pago} />
            </Seccion>
          ) : null}

          {direccionTaller || zonaTaller ? (
            <Seccion titulo="Dónde queda">
              <View style={sd.direccion}>
                <MapPin size={20} color={colors.navy} strokeWidth={2.2} />
                <View style={{ flex: 1 }}>
                  {direccionTaller ? <AppText variant="body">{direccionTaller}</AppText> : null}
                  {zonaTaller ? (
                    <AppText variant="caption" color={colors.muted}>
                      {zonaTaller}
                    </AppText>
                  ) : null}
                </View>
              </View>
            </Seccion>
          ) : null}

          {parecidos.length ? (
            <View style={{ marginTop: space.l }}>
              <AppText variant="subtitle" style={{ marginBottom: space.s }} accessibilityRole="header">
                Otros servicios parecidos
              </AppText>
              <View style={{ gap: space.s }}>
                {parecidos.map(s => {
                  const uid = s?.uid_servicio || s?.id;
                  const t = s?.taller || {};
                  return (
                    <TallerCard
                      key={uid}
                      title={sentenceCase(s?.nombre_servicio || s?.nombre) || 'Servicio'}
                      subtitle={sentenceCase(t?.nombre || t?.nombre_taller || s?.nombre_taller) || undefined}
                      imageUri={firstImage(s?.service_image) || firstImage(t?.image_perfil)}
                      tag={sentenceCase(s?.nombre_categoria || s?.categoria) || undefined}
                      price={formatPrice(priceValue(s))}
                      open={t?.horarios_atencion ? openState(t.horarios_atencion) : undefined}
                      onPress={() => navigation.push('ProductDetailOne', { uid })}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.bottomContainerView}>

        {typeUserLogged !== 'Taller' ? null : typeUserLogged === 'Taller' && dataUser?.status == "Aprobado" ? (
          null
        ) : <BottomContainer
        leftValue={
          typeUserLogged === 'Taller' ? (
            <TouchableOpacity
              style={[external.fd_row, external.ai_center, external.mh_20]}
              onPress={() => navigation.goBack()}>
              <View
                style={[external.mh_15, external.fd_row, external.ai_center]}>
                {/* <Plus color={iconColorStyle} /> */}
                <Text style={styles.footerLeftText}>
                  Volver
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={[external.fd_row, external.ai_center, external.mh_20]}>
            </View>
          )
        }
        value={
          <TouchableOpacity
              onPress={async () => {

                console.log("este es el dataTaller", dataTaller.phone)
                console.log("este es el dataServices ", DataService?.nombre_servicio)

                console.log("este es el phone", dataTaller?.phone)

                // // Validar el número de teléfono
                const phoneNumber = dataTaller?.whatsapp;
                // const phoneNumber = dataTaller?.phone;
                
                if (!phoneNumber || phoneNumber === null || phoneNumber === '') {
                  showToast('El número de teléfono no está disponible');
                  return;
                }

                // Convertir a string para validar
                const phoneString = String(phoneNumber).trim();
                
                // Validar que no empiece con 02
                if (phoneString.startsWith('02')) {
                  showToast('El número de teléfono no es válido');
                  return;
                }

                // Validar que empiece con 04 o 4
                if (!phoneString.startsWith('04') && !phoneString.startsWith('4')) {
                  showToast('El número de teléfono no es válido');
                  return;
                }

                try {
                  await api.post('/home/notificarContactoTaller', {
                    uid_taller: DataService?.uid_taller,
                    nombre_servicio: DataService?.nombre_servicio || '',
                  });

                  console.log("notificacion enviada con exito")

                  console.log("este es el phone", dataTaller?.phone)

                  handleContact('WhatsApp');
                  saveServiceContactView('Contactar');
                  Linking.openURL(
                    `https://wa.me/+58${phoneString}`,
                  );
                } catch (error) {
                  console.log("este es el error de la notificacion", error);
                  saveServiceContactView('Contactar');
                  Linking.openURL(
                    `https://wa.me/+58${phoneString}`,
                  );
                }


              }}
              style={styles.footerActionButton}>
              <MessageCircle size={20} color="#FFD60A" />
              <Text style={styles.footerActionText}>CONTACTAR</Text>
            </TouchableOpacity>
        }
        valueContainerStyle={styles.footerValueDarkContainer}
      />}


        
      </View>
      {/* Modal GPS / permisos de ubicación */}
      <LocationPermissionModal
        visible={locModalVisible}
        type={locModalType}
        onClose={() => setLocModalVisible(false)}
      />

      <MapboxNavigation
        visible={showRuta}
        destinationLat={dataTaller?.ubicacion?.lat}
        destinationLng={dataTaller?.ubicacion?.lng}
        destinationName={dataTaller?.nombre || 'Taller'}
        destinationAddress={dataTaller?.Direccion || dataTaller?.direccion || dataTaller?.ubicacion?.direccion}
        destinationCategory="Taller mecánico"
        destinationPhone={dataTaller?.phone || dataTaller?.telefono}
        destinationImage={dataTaller?.image_perfil || null}
        onClose={() => setshowRuta(false)}
        onFinish={() => {
          setshowRuta(false);
          setShowArrived(true);
        }}
      />

      <ArrivedModal
        visible={showArrived}
        destinationName={dataTaller?.nombre || 'el taller'}
        onClose={() => {
          setShowArrived(false);
          setShowRating(true);
        }}
        onSkip={() => setShowArrived(false)}
      />

      <BeautifulModal
        visible={showRating}
        businessName={DataService?.nombre_servicio || DataService?.nombre || dataTaller?.nombre || ''}
        onClose={() => setShowRating(false)}
        onSubmit={handleRatingSubmit}
      />

      <RatingSuccessModal
        visible={showRatingSuccess}
        rating={lastRating}
        onClose={() => setShowRatingSuccess(false)}
      />

      {typeUserLogged !== 'Taller' ? (
        <ContactBar
          onCall={handleCall}
          onWhatsApp={handleWhatsApp}
          onDirections={() => checkAndOpenMap(() => setshowRuta(true))}
          canCall={puedeLlamar(tallerPhone(dataTaller))}
          canWhatsApp={puedeWhatsApp(tallerWhatsApp(dataTaller))}
          canDirections={!!(dataTaller?.ubicacion?.lat && dataTaller?.ubicacion?.lng)}
          hint={
            isCliente && !showFabClienteHorario
              ? openHint(dataTaller?.horarios_atencion) || 'Solo se puede solicitar en horario de atención'
              : openHint(dataTaller?.horarios_atencion)
          }
          primary={
            isCliente
              ? {
                  title: showFabClienteHorario ? 'Solicitar servicio' : 'Cerrado ahora',
                  onPress: handleFabClientePress,
                  disabled: !showFabClienteHorario,
                }
              : {title: 'Escribir por WhatsApp', onPress: handleWhatsApp}
          }
        />
      ) : null}

      <TallerDetailEmergencyModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        uidTaller={tallerDetailUid}
        nombreTaller={dataTaller?.nombre || dataTaller?.nombre_taller || ''}
        servicio={{categoriaId: DataService?.uid_categoria, nombre: DataService?.nombre_servicio}}
      />

      {renderLoading ? (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(9, 13, 46, 0.28)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 14,
              paddingHorizontal: 18,
              paddingVertical: 14,
              alignItems: 'center',
            }}>
            <ActivityIndicator size="large" color="#2D3261" />
            <Text style={{marginTop: 10, color: '#2D3261', fontWeight: '700'}}>
              Cargando informacion...
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

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
  fabClienteHorario: {
    position: 'absolute',
    right: 14,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFD60A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
});

const sd = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  cuerpo: { paddingHorizontal: space.m },
  encabezado: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    padding: space.m,
    marginTop: -space.l,
    ...shadow.card,
  },
  taller: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    minHeight: TOUCH,
    marginTop: space.m,
    padding: space.s,
    borderRadius: radius.m,
    backgroundColor: colors.bg,
  },
  tallerLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card },
  tallerLogoVacio: { alignItems: "center", justifyContent: "center" },
  filaEstado: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: space.s, marginTop: space.m },
  precio: {
    backgroundColor: colors.navy,
    borderRadius: radius.l,
    padding: space.m,
    marginTop: space.m,
  },
  garantia: { flexDirection: "row", alignItems: "center", gap: space.xs, marginTop: space.s },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: space.s, marginTop: space.m },
  direccion: { flexDirection: "row", gap: space.s },
});

export default ProductDetailOne;
