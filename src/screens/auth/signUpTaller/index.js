// Registro del taller en 4 pasos con guardado automático.
//   1. Cuenta       · responsable, correo, teléfono, contraseña
//   2. Negocio      · nombre, RIF verificado al instante, estado, dirección, mapa, horario
//   3. Servicios    · categorías, métodos de pago y el cupo del plan gratuito
//   4. Documentos   · RIF, fotos del taller, opcionales, resumen y envío
// Si el taller cierra la app o se le acaba la batería, retoma donde iba
// (la contraseña nunca se guarda en el borrador). El plan se elige al final,
// cuando el gratuito esté por vencer: aquí se asigna el gratuito automáticamente.
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Modal,
  BackHandler,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../../../axiosInstance';
import {C, Field, PrimaryButton, Banner, Chip, Card, StepHeader} from '../../../components/registro/ui';
import TermsModal from '../../../components/registro/TermsModal';
import LocationPicker from '../../../components/registro/LocationPicker';
import {elegirArchivo, archivoABase64} from '../../../components/registro/mediaPicker';
import {
  validarNombre,
  validarCorreo,
  validarTelefono,
  validarPassword,
  validarRif,
  normalizarTelefono,
  formatearRif,
  onlyDigits,
  RIF_PREFIJOS,
  mensajeDeError,
} from '../../../components/registro/validators';
import {OPCIONES_HORA, hora12} from '../../../utils/taller';
import {direccionDesdeCoordenadas} from '../../../utils/geocoding';
import PhoneInput from '../../../ui/PhoneInput';
import useDisponibilidad, {MSG_CORREO_EXISTE, MSG_TELEFONO_EXISTE} from '../../../components/registro/useDisponibilidad';
import IrALogin from '../../../components/registro/IrALogin';
import {mostrarTelefono} from '../../../utils/telefono';
import {iniciarSesionTrasRegistro, obtenerTokenPushSeguro} from '../../../utils/authSession';

const DRAFT_KEY = '@registroTallerDraft';
// Identificador anónimo del borrador, para el aviso de registro incompleto.
const BORRADOR_ID_KEY = '@registroTallerBorradorId';

// Qué le falta al taller, en palabras que entienda quien le va a escribir.
const ETIQUETAS_FALTANTES = {
  responsable: 'Nombre del responsable',
  email: 'Correo',
  phone: 'Teléfono',
  whatsapp: 'WhatsApp',
  password: 'Contraseña',
  nombre: 'Nombre del taller',
  rif: 'Número de RIF',
  estado: 'Estado',
  direccion: 'Dirección',
  ubicacion: 'Ubicación en el mapa',
  horario: 'Horario de atención',
  categorias: 'Servicios que ofrece',
};
// Req. 005: registro en 3 pasos (cuenta, negocio, servicios).
const TOTAL = 3;

const ESTADOS = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo',
  'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira',
  'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre',
  'Táchira', 'Trujillo', 'Yaracuy', 'Zulia',
].map(e => ({label: e, value: e}));

const DIAS = [
  {key: 'lunes', label: 'Lun'},
  {key: 'martes', label: 'Mar'},
  {key: 'miercoles', label: 'Mié'},
  {key: 'jueves', label: 'Jue'},
  {key: 'viernes', label: 'Vie'},
  {key: 'sabado', label: 'Sáb'},
  {key: 'domingo', label: 'Dom'},
];

const HORAS = OPCIONES_HORA;

const METODOS_PAGO = [
  {value: 'efectivo', label: 'Efectivo'},
  {value: 'pagoMovil', label: 'Pago Móvil'},
  {value: 'puntoVenta', label: 'Punto de venta'},
  {value: 'transferencia', label: 'Transferencia'},
  {value: 'tarjetaCreditoN', label: 'Crédito nacional'},
  {value: 'tarjetaCreditoI', label: 'Crédito internacional'},
  {value: 'zelle', label: 'Zelle'},
  {value: 'zinli', label: 'Zinli'},
];

const DOCS = [
  {key: 'rifIdFiscal', label: 'RIF', help: 'Foto o PDF legible del RIF vigente.', required: true, pdf: true},
  {key: 'fotoFrenteTaller', label: 'Frente del taller', help: 'Que se vea la fachada o el letrero.', required: true},
  {key: 'fotoInternaTaller', label: 'Interior del taller', help: 'El área de trabajo.', required: true},
  {key: 'logotipoNegocio', label: 'Logo del negocio', help: 'Opcional. Se muestra a los conductores.'},
];

// En el registro solo se piden el logo y el RIF; las fotos del taller se suben
// después, desde "Tu negocio" (Req. 005).
const DOCS_REGISTRO = ['logotipoNegocio', 'rifIdFiscal'].map(k => DOCS.find(d => d.key === k));

// Ícono de cada categoría según su nombre (las categorías vienen del panel).
const ICONOS_CATEGORIA = [
  [/aceite|lubric/, 'oil'],
  [/aire|a\/?c\b|climat/, 'snowflake'],
  [/lavado/, 'car-wash'],
  [/electro|bater/, 'car-battery'],
  [/escaneo|ecu|comput|diagn/, 'car-cog'],
  [/freno/, 'car-brake-alert'],
  [/\bgas\b|gnv|glp/, 'gas-cylinder'],
  [/latoner|pintura/, 'spray'],
  [/inyector/, 'engine'],
  [/metalmec/, 'cog'],
  [/mecanic/, 'wrench'],
  [/neumatic|rines|caucho|llanta/, 'tire'],
  [/parabrisa|vidrio/, 'car-windshield'],
  [/radiador/, 'radiator'],
  [/direccion|suspension|tren/, 'steering'],
  [/silenciador|escape/, 'pipe'],
  [/alarma|gps/, 'shield-car'],
  [/moto/, 'motorbike'],
  [/tapicer/, 'car-seat'],
];
const sinAcentos = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const iconoCategoria = nombre => {
  const n = sinAcentos(nombre);
  const hit = ICONOS_CATEGORIA.find(([re]) => re.test(n));
  return hit ? hit[1] : 'tools';
};
const nombreBonito = v => {
  const t = String(v || '').trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const horarioVacio = () =>
  DIAS.reduce((acc, d) => {
    acc[d.key] = {enabled: false, open: '08:00', close: '17:00'};
    return acc;
  }, {});

const PRESETS = [
  {label: 'Lun–Vie 8 a. m.–5 p. m.', dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], open: '08:00', close: '17:00'},
  {label: 'Sáb 8 a. m.–12 p. m.', dias: ['sabado'], open: '08:00', close: '12:00'},
];

const INICIAL = {
  step: 1,
  responsable: '',
  email: '',
  phone: '',
  whatsappIgual: true,
  whatsapp: '',
  nombre: '',
  rifPrefijo: 'J',
  rifNumero: '',
  estado: '',
  direccion: '',
  direccionMapa: '',
  lat: null,
  lng: null,
  horario: horarioVacio(),
  categorias: [],
  metodosPago: [],
  descripcion: '',
  docs: {},
};

const resumenHorario = h => {
  const on = DIAS.filter(d => h?.[d.key]?.enabled);
  if (!on.length) return 'Sin horario';
  return on.map(d => `${d.label} ${hora12(h[d.key].open, {corto: true})}–${hora12(h[d.key].close, {corto: true})}`).join(' · ');
};

const SignUpTaller = ({navigation}) => {
  const [f, setF] = useState(INICIAL);
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendStage, setSendStage] = useState('');
  const [banner, setBanner] = useState({type: 'error', text: ''});
  const [termsVisible, setTermsVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [pickerFor, setPickerFor] = useState(null);
  const [categoriasDisp, setCategoriasDisp] = useState([]);
  const [catsError, setCatsError] = useState('');
  const [planGratis, setPlanGratis] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const scrollRef = useRef(null);

  // ── Borrador: cargar y guardar automáticamente ───────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          setF({...INICIAL, ...d, step: Math.min(Math.max(Number(d.step) || 1, 1), TOTAL), whatsappIgual: true, horario: {...horarioVacio(), ...(d.horario || {})}});
          if (d.step > 1 || d.email || d.nombre) setResumed(true);
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(f)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [f, loaded]);

  // ── Datos para el paso 3 ────────────────────────────────────────────────
  const cargarCategorias = useCallback(async () => {
    setCatsError('');
    try {
      const r = await api.get('/usuarios/getActiveCategories');
      const list = (r?.data?.categories || [])
        .map(c => ({uid: c.id || c.uid, nombre: String(c.nombre || '').trim()}))
        .filter(c => c.uid && c.nombre)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setCategoriasDisp(list);
    } catch (e) {
      setCatsError(mensajeDeError(e, 'No pudimos cargar las categorías.'));
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
    api
      .get('/usuarios/getPlanes')
      .then(r => {
        const planes = Array.isArray(r?.data) ? r.data : [];
        const g = planes.find(p => ['gratis', 'plan gratis', 'gratuito'].includes(String(p?.nombre || '').toLowerCase()));
        if (g) setPlanGratis(g);
      })
      .catch(() => {});
  }, [cargarCategorias]);

  // ── Dirección escrita del pin ────────────────────────────────────────────
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const buscarDireccion = useCallback(async (lat, lng) => {
    setBuscandoDireccion(true);
    const dir = await direccionDesdeCoordenadas(lat, lng);
    setBuscandoDireccion(false);
    if (!dir) return;
    setF(prev => {
      // Si el pin cambió mientras se buscaba, no pisar.
      if (prev.lat !== lat || prev.lng !== lng) return prev;
      // Si aún no escribió la dirección, se la sugerimos para que la complete.
      const direccion = String(prev.direccion || '').trim() ? prev.direccion : dir;
      return {...prev, direccionMapa: dir, direccion};
    });
  }, []);

  // Borradores viejos con pin pero sin dirección escrita.
  useEffect(() => {
    if (loaded && Number.isFinite(f.lat) && Number.isFinite(f.lng) && !f.direccionMapa) {
      buscarDireccion(f.lat, f.lng);
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers de estado ────────────────────────────────────────────────────
  const set = (k, v) => setF(prev => ({...prev, [k]: v}));
  const touch = k => () => setTouched(t => ({...t, [k]: true}));
  const touchMany = keys => setTouched(t => keys.reduce((a, k) => ({...a, [k]: true}), {...t}));

  // Correo y teléfono: se verifica si ya tienen cuenta mientras se escribe.
  const dispEmail = useDisponibilidad('email', f.email.trim().toLowerCase(), !validarCorreo(f.email));
  const dispPhone = useDisponibilidad('phone', normalizarTelefono(f.phone), !validarTelefono(f.phone));

  const errores = useMemo(() => {
    const e = {
      responsable: validarNombre(f.responsable, 'el nombre del responsable'),
      email: validarCorreo(f.email) || (dispEmail === 'taken' ? MSG_CORREO_EXISTE : ''),
      phone: validarTelefono(f.phone) || (dispPhone === 'taken' ? MSG_TELEFONO_EXISTE : ''),
      whatsapp: '', // Req. 005: un solo número; el WhatsApp es el mismo teléfono
      password: validarPassword(password),
      nombre: validarNombre(f.nombre, 'el nombre del taller'),
      rif: validarRif(f.rifPrefijo, f.rifNumero),
      estado: f.estado ? '' : 'Elige el estado donde está el taller.',
      direccion: String(f.direccion).trim().length >= 8 ? '' : 'Escribe la dirección con una referencia (ej: Av. Bolívar, frente a la plaza).',
      ubicacion: Number.isFinite(f.lat) && Number.isFinite(f.lng) ? '' : 'Marca en el mapa dónde está el taller para que los conductores lleguen.',
      horario: '',
      categorias: f.categorias.length ? '' : 'Elige al menos una categoría de servicio.',
    };
    // Req. 005: el horario ya no se pide en el registro; se carga en el perfil.
    return e;
  }, [f, password, dispEmail, dispPhone]);

  const CAMPOS_PASO = {
    1: ['responsable', 'email', 'phone', 'whatsapp', 'password'],
    2: ['nombre', 'rif', 'estado', 'direccion', 'ubicacion'],
    3: ['categorias'],
  };
  const pasoValido = n => !CAMPOS_PASO[n].some(k => errores[k]);
  const show = k => (touched[k] ? errores[k] : '');

  const faltantesDocs = DOCS.filter(d => d.required && !f.docs?.[d.key]?.uri).map(d => d.label);

  // ── Aviso de registro incompleto (Req. 003) ──────────────────────────────
  // Al pasar del paso 1 (ya hay teléfono válido) y en cada cambio de paso se
  // informa el avance al servidor. Es silencioso y nunca afecta al registro.
  const borradorIdRef = useRef('');
  useEffect(() => {
    if (!loaded || f.step < 2) return;
    (async () => {
      try {
        if (!borradorIdRef.current) {
          let id = await AsyncStorage.getItem(BORRADOR_ID_KEY);
          if (!id) {
            id = `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
            await AsyncStorage.setItem(BORRADOR_ID_KEY, id);
          }
          borradorIdRef.current = id;
        }
        const phone = normalizarTelefono(f.phone);
        const faltantes = [
          ...Object.keys(ETIQUETAS_FALTANTES)
            .filter(k => k !== 'password' && errores[k])
            .map(k => ETIQUETAS_FALTANTES[k]),
          ...faltantesDocs.map(d => `Documento: ${d}`),
        ];
        await api.post(
          '/usuarios/registroProgreso',
          {
            borradorId: borradorIdRef.current,
            paso: f.step,
            responsable: f.responsable.trim(),
            nombre: f.nombre.trim(),
            email: f.email.trim().toLowerCase(),
            phone,
            whatsapp: phone,
            faltantes,
          },
          {timeout: 15000},
        );
      } catch (e) {}
    })();
    // Solo al cambiar de paso: no en cada tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.step, loaded]);

  // ── Verificación del documento RIF (Req. 003) ────────────────────────────
  // Al subir el RIF se compara con el número escrito. Es informativo: nunca
  // impide continuar, y lo que no se pueda leer lo revisa una persona.
  const [rifCheck, setRifCheck] = useState({estado: '', mensaje: ''});
  const rifDocUri = f.docs?.rifIdFiscal?.uri || '';
  const rifDeclarado = errores.rif ? '' : `${f.rifPrefijo}-${onlyDigits(f.rifNumero)}`;
  useEffect(() => {
    if (!rifDocUri || !rifDeclarado) {
      setRifCheck({estado: '', mensaje: ''});
      return undefined;
    }
    let cancelado = false;
    setRifCheck({estado: 'revisando', mensaje: ''});
    (async () => {
      try {
        const documento = await archivoABase64(rifDocUri);
        const {data} = await api.post(
          '/usuarios/validarRifDocumento',
          {rif: rifDeclarado, nombre: f.nombre.trim(), documento},
          {timeout: 45000},
        );
        if (cancelado) return;
        setRifCheck({
          estado: data?.estado || '',
          mensaje:
            data?.estado === 'no_legible'
              ? 'No pudimos leer el RIF automáticamente. Lo revisará nuestro equipo.'
              : data?.mensaje || '',
        });
      } catch (e) {
        // Sin conexión, o un servidor que aún no tiene esta función: se omite
        // el aviso; el documento se revisa igual al aprobar el negocio.
        if (!cancelado) setRifCheck({estado: '', mensaje: ''});
      }
    })();
    return () => {
      cancelado = true;
    };
    // El nombre no dispara una nueva revisión: solo viaja como referencia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rifDocUri, rifDeclarado]);

  // ── Navegación entre pasos ───────────────────────────────────────────────
  const irA = n => {
    set('step', n);
    setBanner({type: 'error', text: ''});
    requestAnimationFrame(() => scrollRef.current?.scrollTo({y: 0, animated: false}));
  };

  const atras = useCallback(() => {
    if (f.step > 1) {
      irA(f.step - 1);
      return true;
    }
    navigation.goBack();
    return true;
  }, [f.step, navigation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', atras);
    return () => sub.remove();
  }, [atras]);

  const continuar = async () => {
    const campos = CAMPOS_PASO[f.step];
    touchMany(campos);
    if (!pasoValido(f.step)) {
      setBanner({type: 'error', text: 'Revisa lo marcado en rojo para continuar.'});
      return;
    }
    if (f.step === 1) {
      // Avisar temprano si el correo o el teléfono ya existen.
      setChecking(true);
      try {
        const email = f.email.trim().toLowerCase();
        const phone = normalizarTelefono(f.phone);
        const [p, e] = await Promise.allSettled([
          api.post('/home/validatePhone', {phone}),
          api.post('/home/validateEmail', {email}),
        ]);
        if (e.status === 'rejected' && e.reason?.response?.status === 409) {
          setBanner({type: 'error', text: 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.'});
          return;
        }
        if (p.status === 'rejected' && p.reason?.response?.status === 409) {
          setBanner({type: 'error', text: 'Este teléfono ya está registrado con otra cuenta.'});
          return;
        }
        const sinRed = [p, e].find(x => x.status === 'rejected' && !x.reason?.response);
        if (sinRed) {
          setBanner({type: 'error', text: mensajeDeError(sinRed.reason)});
          return;
        }
      } finally {
        setChecking(false);
      }
    }
    irA(f.step + 1);
  };

  // ── Documentos ───────────────────────────────────────────────────────────
  const elegirDoc = async source => {
    const key = pickerFor;
    setPickerFor(null);
    if (!key) return;
    // Esperar a que cierre la hoja antes de abrir cámara/galería (iOS).
    await new Promise(r => setTimeout(r, 350));
    try {
      const file = await elegirArchivo(source);
      if (file) setF(prev => ({...prev, docs: {...prev.docs, [key]: file}}));
    } catch (e) {
      setBanner({type: 'error', text: e.friendly || 'No pudimos abrir el archivo. Intenta con otra foto.'});
    }
  };

  const quitarDoc = key => setF(prev => {
    const docs = {...prev.docs};
    delete docs[key];
    return {...prev, docs};
  });

  // ── Envío ────────────────────────────────────────────────────────────────
  const onEnviar = () => {
    // Revalida todo por si viene de un borrador viejo.
    for (const n of [1, 2, 3]) {
      if (!pasoValido(n)) {
        touchMany(CAMPOS_PASO[n]);
        irA(n);
        setBanner({type: 'error', text: n === 1 && errores.password ? 'Por seguridad, vuelve a escribir tu contraseña.' : 'Falta completar este paso.'});
        return;
      }
    }
    setTermsVisible(true);
  };

  const enviar = async () => {
    setTermsVisible(false);
    setSending(true);
    setBanner({type: 'error', text: ''});
    try {
      setSendStage('Preparando documentos…');
      const docsB64 = {};
      const ilegibles = [];
      for (const d of DOCS) {
        const file = f.docs?.[d.key];
        if (!file?.uri) continue;
        try {
          docsB64[d.key] = await archivoABase64(file.uri);
        } catch (e) {
          ilegibles.push(d.label);
        }
      }
      if (ilegibles.length) {
        setF(prev => {
          const docs = {...prev.docs};
          DOCS.filter(d => ilegibles.includes(d.label)).forEach(d => delete docs[d.key]);
          return {...prev, docs};
        });
        throw {friendly: `No pudimos leer: ${ilegibles.join(', ')}. Vuelve a subirlo(s) y envía de nuevo.`};
      }

      setSendStage('Creando tu cuenta…');
      const token = await obtenerTokenPushSeguro();
      const email = f.email.trim().toLowerCase();
      const phone = normalizarTelefono(f.phone);
      const whatsapp = phone; // Req. 005: un solo número
      const metodos = METODOS_PAGO.reduce((acc, m) => ({...acc, [m.value]: f.metodosPago.includes(m.value)}), {});
      const categorias = categoriasDisp.filter(c => f.categorias.includes(c.uid));

      const res = await api.post(
        '/usuarios/SaveTallerExtended',
        {
          nombre: f.nombre.trim(),
          responsable: f.responsable.trim(),
          rif: `${f.rifPrefijo}-${onlyDigits(f.rifNumero)}`,
          phone,
          whatsapp,
          typeUser: 'Taller',
          email,
          password,
          Direccion: f.direccion.trim(),
          RegComercial: '',
          Caracteristicas: f.descripcion.trim(),
          Experiencia: '',
          LinkFacebook: '',
          LinkInstagram: '',
          LinkTiktok: '',
          seguro: '',
          agenteAutorizado: 'no',
          metodos_pago: metodos,
          horarios_atencion: f.horario,
          estado: f.estado,
          categorias,
          base64: docsB64.logotipoNegocio || '',
          rifIdFiscal: docsB64.rifIdFiscal || '',
          permisoOperacion: docsB64.permisoOperacion || '',
          logotipoNegocio: docsB64.logotipoNegocio || '',
          fotoFrenteTaller: docsB64.fotoFrenteTaller || '',
          fotoInternaTaller: docsB64.fotoInternaTaller || '',
          ubicacion: {lat: f.lat, lng: f.lng},
          lat: f.lat,
          lng: f.lng,
          token,
        },
        {timeout: 90000},
      );
      const uid = res?.data?.uid;

      // Plan gratuito automático: sus días arrancan cuando lo aprueben.
      setSendStage('Activando tu plan gratuito…');
      if (uid) {
        try {
          await api.post('/usuarios/AsociarPlan', {uid, plan_uid: 'gratis'});
        } catch (e) {
          console.warn('AsociarPlan gratis:', e?.message);
        }
      }

      await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
      await AsyncStorage.removeItem(BORRADOR_ID_KEY).catch(() => {});
      setSendStage('Entrando…');
      try {
        await iniciarSesionTrasRegistro(email, password);
        navigation.reset({index: 0, routes: [{name: 'LoaderScreen'}]});
      } catch (e) {
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
        Alert.alert('Solvers', 'Tu negocio quedó registrado. Inicia sesión para ver el estado de la revisión.');
      }
    } catch (err) {
      setBanner({
        type: 'error',
        text: err?.friendly || mensajeDeError(err, 'No pudimos enviar tu registro. Tus datos siguen guardados: toca Reintentar.'),
      });
    } finally {
      setSending(false);
      setSendStage('');
    }
  };

  const empezarDeCero = () => {
    Alert.alert('Empezar de cero', 'Se borrará lo que llevas escrito en este registro.', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
          if (borradorIdRef.current) {
            api.post('/usuarios/registroProgreso', {borradorId: borradorIdRef.current, completado: true}).catch(() => {});
          }
          AsyncStorage.removeItem(BORRADOR_ID_KEY).catch(() => {});
          borradorIdRef.current = '';
          setF(INICIAL);
          setPassword('');
          setTouched({});
          setResumed(false);
        },
      },
    ]);
  };

  // ── Pasos ────────────────────────────────────────────────────────────────
  const paso1 = (
    <>
      <StepHeader step={1} total={TOTAL} savedLabel="Se guarda automáticamente" title="Tu cuenta" subtitle="Con estos datos entrarás a Solvers." />
      <Field label="Nombre del responsable" placeholder="Nombre y apellido" value={f.responsable}
        onChangeText={v => set('responsable', v)} onBlur={touch('responsable')} error={show('responsable')}
        ok={touched.responsable && !errores.responsable} autoCapitalize="words" textContentType="name" />
      <Field label="Correo" placeholder="taller@gmail.com" value={f.email} onChangeText={v => set('email', v)}
        onBlur={touch('email')} error={dispEmail === 'taken' ? MSG_CORREO_EXISTE : show('email')}
        ok={dispEmail === 'ok' || (touched.email && !errores.email && dispEmail === 'error')}
        okText={dispEmail === 'ok' ? 'Correo disponible' : undefined}
        help={dispEmail === 'checking' ? 'Verificando que el correo esté disponible…' : 'Lo usarás para entrar. Te avisamos aquí cuando revisemos tu negocio.'}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" />
      {dispEmail === 'taken' ? <IrALogin onPress={() => navigation.navigate('Login')} /> : null}
      <PhoneInput label="Teléfono" value={f.phone} onChange={v => set('phone', v)} onBlur={touch('phone')}
        error={dispPhone === 'taken' ? MSG_TELEFONO_EXISTE : show('phone')}
        ok={dispPhone === 'ok' || (touched.phone && !errores.phone && dispPhone === 'error')}
        help={dispPhone === 'checking' ? 'Verificando que el teléfono esté disponible…' : 'También lo usamos como tu WhatsApp para los conductores.'} />
      {dispPhone === 'taken' ? <IrALogin onPress={() => navigation.navigate('Login')} /> : null}
      <Field label="Contraseña" placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword}
        onBlur={touch('password')} error={show('password')} secure autoCapitalize="none" textContentType="newPassword"
        help="Mínimo 6 caracteres. Por seguridad no se guarda en el borrador." />
      <Text style={[st.help, {marginTop: 12}]}>
        Guardamos tu avance. Si no terminas el registro, podemos escribirte por WhatsApp para ayudarte a completarlo.
      </Text>
    </>
  );

  const rifError = show('rif');
  const rifOk = !errores.rif;
  // Documentos del negocio (Req. 003: se cargan en el paso 2, junto al RIF).
  const docsBloque = (
    <>
      {DOCS_REGISTRO.map(d => {
        const file = f.docs?.[d.key];
        const esImagen = file?.type?.startsWith('image/');
        return (
          <View key={d.key} style={[st.docRow, file ? {borderColor: C.ok} : null]}>
            {file && esImagen ? (
              <Image source={{uri: file.uri}} style={st.docThumb} />
            ) : (
              <View style={[st.docThumb, st.docThumbEmpty]}>
                <Ionicons name={file ? 'document-text' : d.required ? 'camera-outline' : 'add'} size={24} color={file ? C.ok : C.muted} />
              </View>
            )}
            <View style={{flex: 1, marginHorizontal: 12}}>
              <Text style={st.docTitle}>
                {d.label} {d.required ? <Text style={st.req}>*</Text> : <Text style={st.opt}>(opcional)</Text>}
              </Text>
              <Text style={[st.docHelp, file && {color: C.ok}]}>{file ? `✓ ${file.name || 'Listo'}` : d.help}</Text>
              {d.key === 'rifIdFiscal' && file && rifCheck.estado ? (
                <Text
                  style={[
                    st.docHelp,
                    {marginTop: 4},
                    rifCheck.estado === 'verificado' && {color: C.ok},
                    rifCheck.estado === 'no_coincide' && {color: C.error},
                  ]}>
                  {rifCheck.estado === 'revisando'
                    ? 'Comparando con el RIF que escribiste…'
                    : rifCheck.estado === 'verificado'
                      ? `✓ ${rifCheck.mensaje}`
                      : rifCheck.mensaje}
                </Text>
              ) : null}
            </View>
            {file ? (
              <TouchableOpacity onPress={() => quitarDoc(d.key)} style={st.docAction} accessibilityLabel={`Quitar ${d.label}`}>
                <Ionicons name="trash-outline" size={22} color={C.error} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setPickerFor(d.key)} style={st.docAction} accessibilityLabel={`Subir ${d.label}`}>
                <Text style={st.docActionText}>Subir</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </>
  );

  const paso2 = (
    <>
      <StepHeader step={2} total={TOTAL} savedLabel="Se guarda automáticamente" title="Tu negocio" subtitle="Lo que verán los conductores en Solvers." />
      <Field label="Nombre del taller" placeholder="Taller Los Hermanos" value={f.nombre} onChangeText={v => set('nombre', v)}
        onBlur={touch('nombre')} error={show('nombre')} ok={touched.nombre && !errores.nombre} autoCapitalize="words" />

      <Text style={st.label}>Logotipo y RIF</Text>
      <Text style={st.help}>Sube tu logotipo y tu RIF. Comparamos el RIF del documento con el número que escribas abajo.</Text>
      {docsBloque}

      <Text style={[st.label, {marginTop: 8}]}>Número de RIF</Text>
      <View style={st.chipsRow}>
        {RIF_PREFIJOS.map(p => (
          <Chip key={p} label={p} selected={f.rifPrefijo === p} onPress={() => set('rifPrefijo', p)} style={st.rifChip} />
        ))}
      </View>
      <Field placeholder="12345678-9" value={formatearRif(f.rifNumero)} onChangeText={v => set('rifNumero', onlyDigits(v).slice(0, 9))}
        onBlur={touch('rif')} error={rifError} ok={rifOk && onlyDigits(f.rifNumero).length === 9}
        okText="RIF con formato y dígito verificador correctos" help="9 números, tal como aparece en tu RIF." keyboardType="number-pad" maxLength={10} />

      <Text style={st.label}>Estado</Text>
      <Dropdown
        style={[st.dropdown, show('estado') ? {borderColor: C.error} : null]}
        data={ESTADOS}
        labelField="label"
        valueField="value"
        value={f.estado}
        placeholder="Elige el estado"
        placeholderStyle={{color: '#9AA0B4', fontSize: 16}}
        selectedTextStyle={{color: C.text, fontSize: 16}}
        search
        searchPlaceholder="Buscar…"
        onChange={i => {
          set('estado', i.value);
          touch('estado')();
        }}
      />
      {show('estado') ? <Text style={st.err}>{show('estado')}</Text> : <View style={{height: 16}} />}

      <Field label="Dirección" placeholder="Av. Bolívar, local 3, frente a la plaza" value={f.direccion}
        onChangeText={v => set('direccion', v)} onBlur={touch('direccion')} error={show('direccion')}
        ok={touched.direccion && !errores.direccion} multiline inputStyle={{minHeight: 56, textAlignVertical: 'top'}} />

      <Text style={st.label}>Ubicación en el mapa</Text>
      <TouchableOpacity style={[st.mapBtn, show('ubicacion') ? {borderColor: C.error} : errores.ubicacion ? null : {borderColor: C.ok}]}
        onPress={() => setMapVisible(true)} accessibilityRole="button">
        <Ionicons name={errores.ubicacion ? 'location-outline' : 'location'} size={24} color={errores.ubicacion ? C.navy : C.ok} />
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={st.mapTitle}>{errores.ubicacion ? 'Marcar en el mapa' : 'Ubicación marcada'}</Text>
          <Text style={st.mapSub}>
            {errores.ubicacion
              ? 'Toca para mover el pin hasta tu taller.'
              : buscandoDireccion
              ? 'Buscando la dirección…'
              : `${f.direccionMapa || 'Pin colocado en el mapa'} · Toca para ajustar`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={C.muted} />
      </TouchableOpacity>
      {show('ubicacion') ? <Text style={st.err}>{show('ubicacion')}</Text> : <View style={{height: 16}} />}

    </>
  );

  const cupo = planGratis?.cantidad_servicios;
  const paso3 = (
    <>
      <StepHeader step={3} total={TOTAL} savedLabel="Se guarda automáticamente" title="Tus servicios" subtitle="¿Qué trabajos hace tu taller? El primero que elijas será tu servicio principal." />
      {catsError ? (
        <Banner text={catsError} actionLabel="Reintentar" onAction={cargarCategorias} />
      ) : !categoriasDisp.length ? (
        <Text style={st.help}>Cargando categorías…</Text>
      ) : null}
      <View style={st.buscador}>
        <Ionicons name="search" size={20} color={C.muted} />
        <TextInput
          style={st.buscadorInput}
          placeholder="Buscar servicios…"
          placeholderTextColor="#9AA0B4"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCorrect={false}
          accessibilityLabel="Buscar servicios"
        />
      </View>
      <View style={st.catGrid}>
        {categoriasDisp
          .filter(c => !busqueda.trim() || sinAcentos(c.nombre).includes(sinAcentos(busqueda.trim())))
          .map(c => {
            const idx = f.categorias.indexOf(c.uid);
            const sel = idx >= 0;
            const principal = idx === 0;
            return (
              <TouchableOpacity
                key={c.uid}
                style={[st.catCard, sel && st.catCardSel, principal && st.catCardPrincipal]}
                activeOpacity={0.85}
                accessibilityRole="checkbox"
                accessibilityState={{checked: sel}}
                accessibilityLabel={`${nombreBonito(c.nombre)}${principal ? ', servicio principal' : ''}`}
                onPress={() => {
                  setF(prev => ({
                    ...prev,
                    categorias: prev.categorias.includes(c.uid) ? prev.categorias.filter(x => x !== c.uid) : [...prev.categorias, c.uid],
                  }));
                  touch('categorias')();
                }}>
                <MaterialCommunityIcons name={iconoCategoria(c.nombre)} size={26} color={principal ? C.navy : sel ? C.yellow : C.navy} />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={[st.catNombre, sel && !principal && {color: '#FFFFFF'}]} numberOfLines={2}>{nombreBonito(c.nombre)}</Text>
                  {principal ? <Text style={st.catPrincipalText}>Servicio principal</Text> : null}
                </View>
                {principal ? (
                  <MaterialCommunityIcons name="crown" size={18} color={C.navy} />
                ) : sel ? (
                  <Ionicons name="checkmark-circle" size={20} color={C.yellow} />
                ) : null}
              </TouchableOpacity>
            );
          })}
      </View>
      {show('categorias') ? <Text style={st.err}>{show('categorias')}</Text> : null}

      <Card style={{marginTop: 12, backgroundColor: '#F2F4FF', borderColor: '#D9DEFA'}}>
        <Text style={st.cardTitle}>Tu plan gratuito</Text>
        <Text style={st.cardBody}>
          {cupo ? `Incluye hasta ${cupo} servicios publicados` : 'Incluye tus primeros servicios publicados'}
          {planGratis?.vigencia ? ` durante ${planGratis.vigencia} días` : ''}. Empieza a contar cuando aprobemos tu negocio;
          el plan pago lo eliges después, cuando el gratuito esté por vencer.
        </Text>
      </Card>

    </>
  );

  const pasos = {1: paso1, 2: paso2, 3: paso3};
  const esUltimo = f.step === TOTAL;

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={st.topBar}>
        <TouchableOpacity onPress={atras} style={st.topBtn} accessibilityRole="button" accessibilityLabel="Atrás">
          <Ionicons name="chevron-back" size={26} color={C.navy} />
        </TouchableOpacity>
        <Text style={st.topTitle}>Registra tu taller</Text>
        <View style={st.topBtn} />
      </View>

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
          {resumed ? (
            <Banner type="ok" text="Retomamos donde quedaste." actionLabel="Empezar de cero" onAction={empezarDeCero} />
          ) : null}
          <Banner text={banner.text} actionLabel={banner.text && esUltimo && !sending ? 'Reintentar' : ''} onAction={onEnviar} />
          {loaded ? pasos[f.step] : null}
        </ScrollView>

        <View style={st.footer}>
          {sendStage ? <Text style={st.stage}>{sendStage}</Text> : null}
          <PrimaryButton
            title={esUltimo ? 'Enviar a revisión' : 'Continuar'}
            onPress={esUltimo ? onEnviar : continuar}
            loading={checking || sending}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Hoja para elegir cámara / galería / PDF */}
      <Modal visible={!!pickerFor} transparent animationType="fade" onRequestClose={() => setPickerFor(null)}>
        <TouchableOpacity style={st.sheetBg} activeOpacity={1} onPress={() => setPickerFor(null)}>
          <View style={st.sheet}>
            <Text style={st.sheetTitle}>{DOCS.find(d => d.key === pickerFor)?.label}</Text>
            {[
              ['camera', 'camera-outline', 'Tomar foto'],
              ['gallery', 'images-outline', 'Elegir de la galería'],
              ...(DOCS.find(d => d.key === pickerFor)?.pdf ? [['pdf', 'document-outline', 'Subir PDF']] : []),
            ].map(([src, icon, label]) => (
              <TouchableOpacity key={src} style={st.sheetItem} onPress={() => elegirDoc(src)} accessibilityRole="button">
                <Ionicons name={icon} size={24} color={C.navy} />
                <Text style={st.sheetText}>{label}</Text>
              </TouchableOpacity>
            ))}
            <PrimaryButton title="Cancelar" variant="secondary" onPress={() => setPickerFor(null)} style={{marginTop: 8}} />
          </View>
        </TouchableOpacity>
      </Modal>

      <LocationPicker
        visible={mapVisible}
        lat={f.lat}
        lng={f.lng}
        onClose={() => setMapVisible(false)}
        onConfirm={({lat, lng}) => {
          setF(prev => ({...prev, lat, lng, direccionMapa: ''}));
          touch('ubicacion')();
          setMapVisible(false);
          buscarDireccion(lat, lng);
        }}
      />

      <TermsModal visible={termsVisible} onClose={() => setTermsVisible(false)} onAccept={enviar} acceptLabel="Acepto y enviar" />
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  topBar: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 52},
  topBtn: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  topTitle: {flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: C.navy},
  body: {padding: 20, paddingTop: 8, paddingBottom: 32},
  footer: {padding: 16, paddingBottom: 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: '#FFFFFF'},
  stage: {textAlign: 'center', color: C.muted, marginBottom: 8, fontSize: 14},
  label: {fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 8},
  opt: {fontWeight: '400', color: C.muted},
  req: {color: C.error},
  help: {fontSize: 13, color: C.muted, marginBottom: 8},
  err: {fontSize: 13, color: C.error, marginTop: 6, marginBottom: 12, fontWeight: '600'},
  link: {color: C.blue, fontWeight: '700', fontSize: 15},
  check: {flexDirection: 'row', alignItems: 'center', minHeight: 44, marginTop: -6, marginBottom: 10},
  checkText: {marginLeft: 8, fontSize: 15, color: C.text},
  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4},
  rifChip: {minWidth: 48, paddingHorizontal: 12},
  dropdown: {minHeight: 52, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 14},
  mapBtn: {flexDirection: 'row', alignItems: 'center', minHeight: 64, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 14},
  mapTitle: {fontSize: 16, fontWeight: '700', color: C.navy},
  mapSub: {fontSize: 13, color: C.muted, marginTop: 2},
  horaRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  horaDia: {width: 48, fontSize: 15, fontWeight: '700', color: C.navy},
  horaDrop: {flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 12, marginRight: 8},
  cardTitle: {fontSize: 16, fontWeight: '800', color: C.navy, marginBottom: 6},
  cardBody: {fontSize: 14, color: C.text, lineHeight: 21},
  buscador: {flexDirection: 'row', alignItems: 'center', minHeight: 48, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 14, marginBottom: 12},
  buscadorInput: {flex: 1, marginLeft: 8, fontSize: 16, color: C.text, paddingVertical: 10},
  catGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  catCard: {width: '48.5%', minHeight: 64, flexDirection: 'row', alignItems: 'center', borderRadius: 14, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10},
  catCardSel: {backgroundColor: C.navy, borderColor: C.navy},
  catCardPrincipal: {backgroundColor: C.yellow, borderColor: C.yellow},
  catNombre: {fontSize: 14, fontWeight: '700', color: C.navy},
  catPrincipalText: {fontSize: 11, fontWeight: '600', color: C.navy, marginTop: 2},
  docRow: {flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 10, marginBottom: 10},
  docThumb: {width: 52, height: 52, borderRadius: 10},
  docThumbEmpty: {backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center'},
  docTitle: {fontSize: 15, fontWeight: '700', color: C.navy},
  docHelp: {fontSize: 13, color: C.muted, marginTop: 2},
  docAction: {minWidth: 60, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
  docActionText: {color: C.blue, fontWeight: '800', fontSize: 15},
  sumRow: {flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F1F6'},
  sumKey: {width: 100, color: C.muted, fontSize: 14},
  sumVal: {flex: 1, color: C.text, fontSize: 14, fontWeight: '600'},
  sheetBg: {flex: 1, backgroundColor: 'rgba(13,14,45,0.55)', justifyContent: 'flex-end'},
  sheet: {backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20},
  sheetTitle: {fontSize: 17, fontWeight: '800', color: C.navy, marginBottom: 8},
  sheetItem: {flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 12},
  sheetText: {fontSize: 16, color: C.text},
});

export default SignUpTaller;
