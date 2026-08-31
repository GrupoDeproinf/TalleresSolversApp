import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Image,
  Pressable,
  PermissionsAndroid,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dropdown} from 'react-native-element-dropdown';
import DatePicker from 'react-native-date-picker';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Icons from 'react-native-vector-icons/FontAwesome';
import IconsFA5 from 'react-native-vector-icons/FontAwesome5';
import Icons2 from 'react-native-vector-icons/Ionicons';
import appColors from '../../../../themes/appColors';
import api from '../../../../../axiosInstance';
import vehicleFormStyles from '../VehicleFormModal/style.css';
import BooleanPillToggle from '../BooleanPillToggle';

const TIPO_VEHICULO_OPTIONS_FALLBACK = [
  {label: 'Automóvil', value: 'Automóvil'},
  {label: 'Moto', value: 'Moto'},
  {label: 'Camión', value: 'Camión'},
  {label: 'Camioneta', value: 'Camioneta'},
  {label: 'SUV', value: 'SUV'},
  {label: 'Bus', value: 'Bus'},
  {label: 'Otro', value: 'Otro'},
];

const timestampToDate = ts => {
  if (!ts) return null;
  if (ts instanceof Date) return isNaN(ts.getTime()) ? null : ts;
  if (typeof ts === 'string' || typeof ts === 'number') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === 'object') {
    const sec = ts?._seconds ?? ts?.seconds;
    if (sec == null) return null;
    const d = new Date(sec * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const dateToTimestamp = d =>
  d instanceof Date && !isNaN(d.getTime()) ? Math.floor(d.getTime() / 1000) : null;

const formatDateDisplay = d =>
  d instanceof Date && !isNaN(d.getTime())
    ? d.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})
    : '';

const isRemoteDocumentUrl = uri =>
  /^https?:\/\//i.test(String(uri ?? '').trim());

/**
 * Valor para la clave *_base64 en el save (no se envían las *_url).
 * - Usuario eligió imagen nueva → base64.
 * - Sin modificar (sigue la URL del GET en uri, sin b64 nuevo) → la misma URL en esa propiedad.
 * - Vacío y había URL del GET → null (eliminó la imagen).
 * - Vacío y nunca hubo URL → null.
 */
const documentPayloadBase64FieldValue = (uri, b64, initialUrlFromGet) => {
  const b = String(b64 ?? '').trim();
  const u = String(uri ?? '').trim();

  if (b) {
    return b;
  }
  if (isRemoteDocumentUrl(u)) {
    return u;
  }
  const iu = String(initialUrlFromGet ?? '').trim();
  if (iu) {
    return null;
  }
  return null;
};

const DEFAULT_VALUES = {
  vehiculo_placa: '',
  vehiculo_marca: '',
  vehiculo_modelo: '',
  vehiculo_anio: '',
  vehiculo_color: '',
  tipo_vehiculo: '',
  uid_tipo_vehiculo: '',
  KM: '',
  KM_correa_tiempo: '',
  KM_ultima_rotacion_cauchos: '',
  // --- Ficha técnica (Step 2 nuevo) ---
  capacidad_tanque_combustible: '',
  cilindrada: '',
  numero_cilindros: '',
  tipo_aceite_motor: '',
  viscosidad_aceite_motor: '',
  marca_aceite_motor: '',
  marca_aceite_motor_custom: '',
  capacidad_tanque_combustible_custom: '',
  cilindrada_custom: '',
  numero_cilindros_custom: '',
  viscosidad_aceite_motor_custom: '',
  amperaje_bateria_custom: '',
  tamano_neumatico_custom: '',
  tamano_rin_custom: '',
  litros_aceite: '',
  litros_aceite_custom: '',
  tipo_aceite_diferencial: '',
  viscosidad_aceite_diferencial: '',
  viscosidad_aceite_diferencial_custom: '',
  tipo_aceite_transmision: '',
  tipo_refrigerante: '',
  tecnologia_refrigerante: '',
  tipo_liga_frenos: '',
  amperaje_bateria: '',
  tamano_neumatico: '',
  tamano_rin: '',
  presion_neumatico: '',
  marca_bujia: '',
  marca_bujia_custom: '',
  codigo_bujia: '',
  codigo_bujia_custom: '',
  nivel_blindaje: '',
  proximo_cambio_aceite: null,
  ultimo_cambio_bujias_filtro: null,
  ultimo_cambio_pila_gasolina: null,
  ultimo_lavado: null,
  ultima_vez_gasolina: null,
  ultima_vez_alineacion: null,
  contratacion_RCV: false,
  grua: false,
  activo: true,
  por_defecto: false,
  path: '',
  imagen_base64: '',
  // Paso 3 — documentos (galería)
  doc_circ_frente_uri: '',
  doc_circ_frente_b64: '',
  doc_circ_reverso_uri: '',
  doc_circ_reverso_b64: '',
  doc_rcv_frente_uri: '',
  doc_rcv_frente_b64: '',
  doc_rcv_reverso_uri: '',
  doc_rcv_reverso_b64: '',
  doc_rcv_vencimiento: null,
  doc_trim_frente_uri: '',
  doc_trim_frente_b64: '',
  doc_trim_reverso_uri: '',
  doc_trim_reverso_b64: '',
  doc_trim_vencimiento: null,
};

const DATE_FIELDS = [
  {key: 'proximo_cambio_aceite', label: 'Próximo cambio de aceite'},
  {key: 'ultimo_cambio_bujias_filtro', label: 'Último cambio bujías/filtro'},
  {key: 'ultimo_cambio_pila_gasolina', label: 'Último cambio pila gasolina'},
  {key: 'ultimo_lavado', label: 'Último lavado'},
  {key: 'ultima_vez_gasolina', label: 'Último abastecimiento de combustible'},
  {key: 'ultima_vez_alineacion', label: 'Última alineación de ruedas'},
];

const DOCUMENT_DATE_FIELDS = [
  {key: 'doc_rcv_vencimiento', label: 'Vencimiento del RCV'},
  {key: 'doc_trim_vencimiento', label: 'Vencimiento del trimestre'},
];

const ALL_DATE_FIELD_LABELS = [...DATE_FIELDS, ...DOCUMENT_DATE_FIELDS];

const toDropdownData = arr =>
  (Array.isArray(arr) ? arr : []).map(v => ({
    label: String(v),
    value: String(v),
  }));

const OTROS_BUBBLE = 'Otros';

/** Primera lista en orden, luego ítems de la segunda que no estén ya (mismo texto). */
const mergeOptionListsPrimaryFirst = (primary, secondary) => {
  const seen = new Set((primary || []).map(String));
  const out = [...(primary || [])];
  for (const x of secondary || []) {
    const s = String(x);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(x);
    }
  }
  return out;
};

// Manual digital: fusión de la lista “clásica” + la ampliada, conservando orden de la primera
const capacidadTanqueCombustibleOptions = mergeOptionListsPrimaryFirst(
  ['30 L', '35 L', '40 L', '45 L', '50 L', '60 L'],
  ['70 L', '80 L', '100 L', '120 L'],
);
const cilindradaOptions = mergeOptionListsPrimaryFirst(
  ['1.4 L', '1.6 L', '2.0 L', '2.4 L', '3.0 L', '3.5 L'],
  ['1.0 L', '1.2 L', '1.3 L', '1.5 L', '1.8 L', '4.0 L', '4.5 L', '5.3 L', '5.7 L'],
);
const numeroCilindrosOptions = mergeOptionListsPrimaryFirst(
  ['3', '4', '5', '6', '8'],
  ['10', '12'],
);
const tipoAceiteMotorOptions = ['Sintético', 'Semisintético', 'Mineral'];
const viscosidadAceiteMotorOptions = mergeOptionListsPrimaryFirst(
  ['5W-30', '5W-40', '10W-30', '10W-40', '15W-40'],
  ['0W-20', '5W-20', '20W-50'],
);
const marcaAceiteMotorOptions = [
  'Mobil 1',
  'Castrol',
  'Shell Helix',
  'Motul',
  'Yac',
  'Elf',
  OTROS_BUBBLE,
];
const MARCA_ACEITE_PRESETS = marcaAceiteMotorOptions.filter(o => o !== OTROS_BUBBLE);
/** Solo las primeras marcas en burbuja; el resto entra por Otros. */
const MARCA_ACEITE_VISIBLE = MARCA_ACEITE_PRESETS.slice(0, 5);

/** Valor guardado en API → estado del formulario (presets vs "Otros" + texto libre). */
function marcaAceiteFromSaved(saved) {
  const raw = String(saved ?? '').trim();
  if (!raw) {
    return {marca_aceite_motor: '', marca_aceite_motor_custom: ''};
  }
  if (raw === OTROS_BUBBLE) {
    return {marca_aceite_motor: OTROS_BUBBLE, marca_aceite_motor_custom: ''};
  }
  if (MARCA_ACEITE_VISIBLE.includes(raw)) {
    return {marca_aceite_motor: raw, marca_aceite_motor_custom: ''};
  }
  if (MARCA_ACEITE_PRESETS.includes(raw)) {
    return {marca_aceite_motor: OTROS_BUBBLE, marca_aceite_motor_custom: raw};
  }
  return {marca_aceite_motor: OTROS_BUBBLE, marca_aceite_motor_custom: raw};
}

const litrosAceiteOptions = ['3 L', '4 L', '5 L', '6 L', '7 L'];
const tipoAceiteDiferencialOptions = ['GL-4', 'GL-5', 'GL-6'];
const viscosidadAceiteDiferencialOptions = ['75W-90', '80W-90', '85W-140'];
const tipoAceiteTransmisionOptions = ['ATF (Automática)', 'MTF (Manual)', 'CVT'];
const tipoRefrigeranteOptions = ['Orgánico (OAT)', 'Inorgánico (IAT)', 'Híbrido'];
const tecnologiaRefrigeranteOptions = ['Carboxilatos', 'Silicatos', 'Fosfatos'];
const tipoLigaFrenosOptions = ['DOT 3', 'DOT 4', 'DOT 5.1'];
const amperajeBateriaOptions = mergeOptionListsPrimaryFirst(
  [
    '35 Ah / 350 AMP',
    '45 Ah / 500 AMP',
    '60 Ah / 800 AMP',
    '75 Ah / 950 AMP',
    '90 Ah / 1100+ AMP',
  ],
);
const tamanoNeumaticoOptions = [
  '195/55 R16',
  '205/55 R16',
  '215/60 R16',
  '225/45 R17',
  '235/40 R18',
];
const tamanoRinOptions = ['15"', '16"', '17"', '18"', '19"'];
const presionNeumaticoOptions = ['28 PSI', '30 PSI', '32 PSI', '34 PSI', '36 PSI'];
const marcaBujiaOptions = ['NGK', 'Denso', 'Bosch', 'ACDelco', 'Champion'];
const codigoBujiaOptions = ['IFR6A', 'IK20', 'DR8EA', 'BR6FS', 'LFR6A-11'];
const nivelBlindajeOptions = [
  'No tiene blindaje',
  'Básico',
  'Intermedio',
  'Alto',
  'Máximo',
];

const TECHNICAL_PRESETS_BY_KEY = {
  capacidad_tanque_combustible: capacidadTanqueCombustibleOptions,
  cilindrada: cilindradaOptions,
  numero_cilindros: numeroCilindrosOptions,
  viscosidad_aceite_motor: viscosidadAceiteMotorOptions,
  amperaje_bateria: amperajeBateriaOptions,
  tamano_neumatico: tamanoNeumaticoOptions,
  tamano_rin: tamanoRinOptions,
  litros_aceite: litrosAceiteOptions,
  viscosidad_aceite_diferencial: viscosidadAceiteDiferencialOptions,
  marca_bujia: marcaBujiaOptions,
  codigo_bujia: codigoBujiaOptions,
};

/** Campos con burbuja Otros + input (marca_aceite va aparte). */
const TECHNICAL_OTHERS_FIELD_KEYS = Object.keys(TECHNICAL_PRESETS_BY_KEY);

/** Cuántas burbujas fijas mostrar antes de Otros (lista completa sigue valiendo para hidratar). */
const VISIBLE_PRESET_COUNT_DEFAULT = 5;
const VISIBLE_PRESET_COUNT_TIRE_RIN = 4;

const getVisiblePresetOptionsForOtrosField = (fieldKey, fullList) => {
  const list = Array.isArray(fullList) ? fullList : [];
  if (list.length === 0) return [];
  const cap =
    fieldKey === 'tamano_neumatico' || fieldKey === 'tamano_rin'
      ? VISIBLE_PRESET_COUNT_TIRE_RIN
      : VISIBLE_PRESET_COUNT_DEFAULT;
  const n = Math.min(cap, list.length);
  return list.slice(0, n);
};

const technicalFieldShowsOtrosBubble = (fieldKey, baseOptions) => {
  if (fieldKey === 'marca_aceite_motor') return false;
  // Lista cerrada de niveles (incl. "No tiene blindaje"); sin burbuja Otros.
  if (fieldKey === 'nivel_blindaje') return false;
  if (
    fieldKey === 'marca_bujia' ||
    fieldKey === 'codigo_bujia' ||
    fieldKey === 'litros_aceite' ||
    fieldKey === 'viscosidad_aceite_diferencial'
  ) {
    return true;
  }
  const list = baseOptions || [];
  const n = list.length;
  if (n === 0) return false;
  const maxLen = Math.max(...list.map(o => String(o).length));
  if (n > 5) return true;
  if (n >= 5 && maxLen > 14) return true;
  if (fieldKey === 'tamano_neumatico' || fieldKey === 'tamano_rin') return true;
  return false;
};

const technicalPresetFromSaved = (fieldKey, saved, fullPresets) => {
  const customKey = `${fieldKey}_custom`;
  const raw = String(saved ?? '').trim();
  if (!raw) {
    return {[fieldKey]: '', [customKey]: ''};
  }
  const visible = getVisiblePresetOptionsForOtrosField(fieldKey, fullPresets);
  if (visible.includes(raw)) {
    return {[fieldKey]: raw, [customKey]: ''};
  }
  if (fullPresets.includes(raw)) {
    return {[fieldKey]: OTROS_BUBBLE, [customKey]: raw};
  }
  return {[fieldKey]: OTROS_BUBBLE, [customKey]: raw};
};

const patchTechnicalOtrosFromInitial = initialValues => {
  const patch = {};
  for (const key of TECHNICAL_OTHERS_FIELD_KEYS) {
    const presets = TECHNICAL_PRESETS_BY_KEY[key];
    Object.assign(patch, technicalPresetFromSaved(key, initialValues?.[key], presets));
  }
  return patch;
};

const TECH_OTHERS_INPUT_PLACEHOLDER = {
  capacidad_tanque_combustible: 'Ej: 55 L o texto libre',
  cilindrada: 'Ej: 2.2 L',
  numero_cilindros: 'Ej: 12',
  viscosidad_aceite_motor: 'Ej: 0W-16',
  amperaje_bateria: 'Ej: 50 Ah / 600 AMP',
  tamano_neumatico: 'Ej: 205/60 R16',
  tamano_rin: 'Ej: 20"',
  litros_aceite: 'Ej: 4.5 L',
  viscosidad_aceite_diferencial: 'Ej: 75W-140',
  marca_bujia: 'Escribe la marca',
  codigo_bujia: 'Escribe el código',
};

const resolveTechnicalOtrosPayload = (form, key) => {
  if (form[key] === OTROS_BUBBLE) {
    return (form[`${key}_custom`] || '').trim() || null;
  }
  return (form[key] || '').trim() || null;
};

const TECHNICAL_FIELDS = [
  {
    key: 'capacidad_tanque_combustible',
    label: 'Capacidad del tanque de combustible',
    options: capacidadTanqueCombustibleOptions,
  },
  {key: 'cilindrada', label: 'Cilindrada', options: cilindradaOptions},
  {key: 'numero_cilindros', label: 'No. Cilindros', options: numeroCilindrosOptions},
  {key: 'tipo_aceite_motor', label: 'Tipo de aceite (Motor)', options: tipoAceiteMotorOptions},
  {
    key: 'viscosidad_aceite_motor',
    label: 'Viscosidad de aceite (Motor)',
    options: viscosidadAceiteMotorOptions,
  },
  {key: 'marca_aceite_motor', label: 'Marca de aceite (Motor)', options: marcaAceiteMotorOptions},
  {key: 'litros_aceite', label: 'Litros de aceite', options: litrosAceiteOptions},
  {
    key: 'tipo_aceite_diferencial',
    label: 'Tipo de aceite (Diferencial)',
    options: tipoAceiteDiferencialOptions,
  },
  {
    key: 'viscosidad_aceite_diferencial',
    label: 'Viscosidad de aceite (Diferencial)',
    options: viscosidadAceiteDiferencialOptions,
  },
  {key: 'tipo_aceite_transmision', label: 'Tipo de aceite (Transm.)', options: tipoAceiteTransmisionOptions},
  {key: 'tipo_refrigerante', label: 'Tipo de refrigerante', options: tipoRefrigeranteOptions},
  {
    key: 'tecnologia_refrigerante',
    label: 'Tecno. del refrigerante',
    options: tecnologiaRefrigeranteOptions,
  },
  {key: 'tipo_liga_frenos', label: 'Tipo de liga de frenos', options: tipoLigaFrenosOptions},
  {key: 'amperaje_bateria', label: 'Amperaje de la batería', options: amperajeBateriaOptions},
  {key: 'tamano_neumatico', label: 'Tamaño del neumático', options: tamanoNeumaticoOptions},
  {key: 'tamano_rin', label: 'Tamaño del rin', options: tamanoRinOptions},
  {key: 'presion_neumatico', label: 'Presión del neumático', options: presionNeumaticoOptions},
  {key: 'marca_bujia', label: 'Marca de bujía', options: marcaBujiaOptions},
  {key: 'codigo_bujia', label: 'Código de bujía', options: codigoBujiaOptions},
  {key: 'nivel_blindaje', label: 'Nivel de blindaje', options: nivelBlindajeOptions},
];

const PROGRESS_FIELDS = [
  'vehiculo_placa',
  'vehiculo_marca',
  'vehiculo_modelo',
  'vehiculo_anio',
  'vehiculo_color',
  'uid_tipo_vehiculo',
  'KM',
  ...TECHNICAL_FIELDS.map(f => f.key),
];

const DOC_PROGRESS_URI_KEYS = [
  'doc_circ_frente_uri',
  'doc_circ_reverso_uri',
  'doc_rcv_frente_uri',
  'doc_rcv_reverso_uri',
  'doc_trim_frente_uri',
  'doc_trim_reverso_uri',
];

const TECHNICAL_FIELD_MAP = TECHNICAL_FIELDS.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

const TECHNICAL_SECTIONS = [
  {
    key: 'perfil_motor',
    title: 'Perfil del Motor',
    icon: 'cogs',
    fields: [
      'capacidad_tanque_combustible',
      'cilindrada',
      'numero_cilindros',
      'amperaje_bateria',
      'marca_bujia',
      'codigo_bujia',
      'nivel_blindaje',
    ],
  },
  {
    key: 'lubricantes',
    title: 'Lubricantes y Filtros',
    icon: 'tint',
    fields: [
      'tipo_aceite_motor',
      'viscosidad_aceite_motor',
      'marca_aceite_motor',
      'litros_aceite',
      'tipo_aceite_diferencial',
      'viscosidad_aceite_diferencial',
      'tipo_aceite_transmision',
      'tipo_refrigerante',
      'tecnologia_refrigerante',
      'tipo_liga_frenos',
    ],
  },
  {
    key: 'neumaticos',
    title: 'Neumáticos y Ruedas',
    icon: 'car',
    fields: ['tamano_neumatico', 'tamano_rin', 'presion_neumatico'],
  },
];

const PRESSURE_MIN = 20;
const PRESSURE_MAX = 60;

const parsePressurePair = value => {
  const raw = String(value || '').trim();
  if (!raw) return {front: 32, rear: 32};

  // Soporta formatos como: "32 PSI", "32/30 PSI", "32|30"
  const nums = raw.match(/\d+/g) || [];
  if (nums.length >= 2) {
    const front = Number(nums[0]) || 32;
    const rear = Number(nums[1]) || front;
    return {
      front: Math.min(PRESSURE_MAX, Math.max(PRESSURE_MIN, front)),
      rear: Math.min(PRESSURE_MAX, Math.max(PRESSURE_MIN, rear)),
    };
  }

  const same = Number(nums[0]) || 32;
  const safe = Math.min(PRESSURE_MAX, Math.max(PRESSURE_MIN, same));
  return {front: safe, rear: safe};
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    backgroundColor: '#1F2344',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,214,10,0.12)',
    top: -32,
    right: -24,
  },
  headerCircle2: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 28,
    left: -16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD60A',
  },
  headerSpacer: {
    width: 40,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,214,10,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPillsRow: {
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepPill: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  stepPillActive: {
    backgroundColor: '#1F2344',
    borderColor: '#1F2344',
  },
  stepPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2344',
  },
  stepPillTextActive: {
    color: '#FFD60A',
  },
  stickyTopBlock: {
    backgroundColor: '#F5F6F8',
    paddingBottom: 8,
    zIndex: 5,
  },
  progressWrap: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#DCE3F1',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1F2344',
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#5D668A',
  },
  tipsCard: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2344',
  },
  tipsSubtitle: {
    fontSize: 13,
    marginTop: 6,
    color: '#5D668A',
    lineHeight: 18,
  },
  outerCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9EDF5',
    padding: 12,
    marginBottom: 12,
  },
  subCardLast: {
    marginBottom: 0,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 10,
  },
  techSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9EDF5',
    padding: 12,
    marginBottom: 12,
    width: 320,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  techSectionsHorizontal: {
    paddingRight: 8,
    alignItems: 'flex-start',
  },
  techSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1F2344',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  techSectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2D3261',
    borderWidth: 1.5,
    borderColor: '#4E5AA8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  techSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
  },
  optionBoxesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  optionBox: {
    borderWidth: 1.5,
    borderColor: '#D6DCE8',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  optionBoxActive: {
    borderColor: '#1F2344',
    backgroundColor: '#EAF0FF',
  },
  optionBoxText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  optionBoxTextActive: {
    color: '#1F2344',
    fontWeight: '800',
  },
  pressureSectionWrap: {
    marginTop: 4,
  },
  pressureRowWrap: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  pressureWheelBlock: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E7ECF7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  pressureWheelBlockLeft: {
    marginRight: 0,
    marginBottom: 10,
  },
  pressureWheelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2344',
    marginBottom: 8,
  },
  pressureControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressureIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressureValueText: {
    minWidth: 84,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2344',
    marginHorizontal: 12,
  },
  docBlock: {
    marginBottom: 22,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  docBlockLast: {
    borderBottomWidth: 0,
    marginBottom: 8,
    paddingBottom: 0,
  },
  docBlockTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 4,
  },
  docBlockHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 17,
  },
  docPhotoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  docPhotoSlot: {
    flex: 1,
  },
  docPhotoSlotSpacer: {
    marginRight: 10,
  },
  docPhotoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  docPickBtn: {
    borderWidth: 1.5,
    borderColor: '#D6DCE8',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  docPickBtnFilled: {
    borderStyle: 'solid',
    borderColor: '#1F2344',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  docThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  docRemoveX: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.4)',
  },
  docThumbHit: {
    ...StyleSheet.absoluteFillObject,
  },
  docExpandPhotoBtn: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 35, 68, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.45)',
  },
  docChangePhotoBtn: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 35, 68, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.45)',
  },
  docFullPreviewLayer: {
    flex: 1,
    backgroundColor: '#000000',
    flexDirection: 'column',
  },
  docFullPreviewBody: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  docFullPreviewImage: {
    width: '100%',
    flex: 1,
  },
  docFullPreviewFooter: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,214,10,0.25)',
  },
  docFullPreviewClose: {
    width: '100%',
    maxWidth: 340,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.35)',
  },
  docFullPreviewCloseText: {
    color: '#FFD60A',
    fontWeight: '800',
    fontSize: 15,
  },
  docPickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  docDateBtn: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  docDateBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2344',
  },
  docDatePlaceholder: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepPillCompactText: {
    fontSize: 11,
    textAlign: 'center',
  },
  /** Mismo patrón visual que VehicleMaintenanceScreen (kmHero*) */
  kmHeroOuter: {
    marginTop: 12,
    marginHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  kmHeroTouchable: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2344',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#FFD60A',
    shadowColor: '#FFD60A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 8,
  },
  kmHeroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kmHeroTextCol: {flex: 1, minWidth: 0},
  kmHeroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,214,10,0.95)',
    letterSpacing: 0.6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  kmHeroLabelParen: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.2,
  },
  kmHeroInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  kmHeroValueInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    minHeight: 28,
  },
  kmHeroHint: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.72)',
  },
  kmHeroChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,214,10,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCardWrap: {
    paddingHorizontal: 16,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F6F8',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  footerCardInsideSticky: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  footerButtonRow: {
    flexDirection: 'row',
  },
});

const VehicleAddStepper = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const routeInitialValues = route?.params?.initialValues ?? null;
  const vehicleId = route?.params?.vehicleId ? String(route.params.vehicleId) : '';
  const [initialValues, setInitialValues] = useState(routeInitialValues);
  const [loadingVehicleData, setLoadingVehicleData] = useState(false);

  const [step, setStep] = useState(1); // 1: Vehículo, 2: Manual digital, 3: Documentos
  const [form, setForm] = useState(DEFAULT_VALUES);
  const [saving, setSaving] = useState(false);
  const [tipoVehiculoOptions, setTipoVehiculoOptions] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [datePickerModal, setDatePickerModal] = useState({
    visible: false,
    fieldKey: null,
    tempDate: new Date(),
  });
  const [docImagePreviewUri, setDocImagePreviewUri] = useState(null);

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState(null); // { uriKey, b64Key }

  const kmInputRef = useRef(null);

  useEffect(() => {
    if (step !== 3) {
      setDocImagePreviewUri(null);
    }
  }, [step]);

  useEffect(() => {
    setInitialValues(routeInitialValues);
  }, [routeInitialValues]);

  const initialDocumentUrls = useMemo(
    () => ({
      circ_frente: String(initialValues?.certificado_circulacion_frente_url ?? ''),
      circ_reverso: String(initialValues?.certificado_circulacion_reverso_url ?? ''),
      rcv_frente: String(initialValues?.rcv_documento_frente_url ?? ''),
      rcv_reverso: String(initialValues?.rcv_documento_reverso_url ?? ''),
      trim_frente: String(initialValues?.trimestres_frente_url ?? ''),
      trim_reverso: String(initialValues?.trimestres_reverso_url ?? ''),
    }),
    [initialValues],
  );

  const progressPercentage = useMemo(() => {
    const filledBase = PROGRESS_FIELDS.reduce((acc, key) => {
      if (key === 'marca_aceite_motor') {
        const v = String(form.marca_aceite_motor || '').trim();
        if (!v) return acc;
        if (v === OTROS_BUBBLE) {
          return String(form.marca_aceite_motor_custom || '').trim() ? acc + 1 : acc;
        }
        return acc + 1;
      }
      if (TECHNICAL_OTHERS_FIELD_KEYS.includes(key)) {
        const v = String(form[key] || '').trim();
        if (!v) return acc;
        if (v === OTROS_BUBBLE) {
          return String(form[`${key}_custom`] || '').trim() ? acc + 1 : acc;
        }
        return acc + 1;
      }
      const value = form[key];
      if (value == null) return acc;
      if (typeof value === 'string') return value.trim() ? acc + 1 : acc;
      return acc + 1;
    }, 0);
    const filledDocs = DOC_PROGRESS_URI_KEYS.reduce((acc, uriKey) => {
      const uri = form[uriKey];
      const b64Key = uriKey.replace(/_uri$/, '_b64');
      const b64 = form[b64Key];
      const hasB64 = typeof b64 === 'string' && b64.trim().length > 0;
      if (hasB64 || isRemoteDocumentUrl(uri)) return acc + 1;
      return acc;
    }, 0);
    const total = PROGRESS_FIELDS.length + DOC_PROGRESS_URI_KEYS.length || 1;
    const filled = filledBase + filledDocs;
    return Math.round((filled / total) * 100);
  }, [form]);

  useEffect(() => {
    let cancelled = false;
    setLoadingTipos(true);
    api
      .get('usuarios/getTiposVehiculo', {})
      .then(response => {
        if (cancelled) return;
        const data = response?.data;
        const list = Array.isArray(data) ? data : data?.data ?? data ?? [];
        const options = list
          .map(item => ({
            label: item.nombre ?? item.label ?? String(item.id ?? ''),
            value: String(item.id ?? ''),
          }))
          .filter(o => o.value && o.label);
        setTipoVehiculoOptions(options.length ? options : TIPO_VEHICULO_OPTIONS_FALLBACK);
      })
      .catch(() => {
        if (!cancelled) setTipoVehiculoOptions(TIPO_VEHICULO_OPTIONS_FALLBACK);
      })
      .finally(() => {
        if (!cancelled) setLoadingTipos(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchVehicleById = async () => {
      if (!vehicleId) return;
      try {
        setLoadingVehicleData(true);
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        const uid = user?.uid || user?.id || '';
        if (!uid) return;

        const response = await api.post('usuarios/getVehiculosByUsuarioUid', {uid});
        const data = response?.data;
        const list = Array.isArray(data) ? data : data?.data ?? [];
        const found = list.find(v => String(v?.id ?? '') === String(vehicleId));

        if (!cancelled && found) {
          console.log('Found vehicle:', found);
          setInitialValues(found);
        }
      } catch (e) {
        if (!cancelled) {
          Alert.alert('Atención', 'No se pudo cargar la información completa del vehículo.');
        }
      } finally {
        if (!cancelled) setLoadingVehicleData(false);
      }
    };

    fetchVehicleById();

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  useEffect(() => {
    setStep(1);
    setForm(
      initialValues && typeof initialValues === 'object'
        ? {
            ...DEFAULT_VALUES,
            vehiculo_placa: String(initialValues?.vehiculo_placa ?? ''),
            vehiculo_marca: String(initialValues?.vehiculo_marca ?? ''),
            vehiculo_modelo: String(initialValues?.vehiculo_modelo ?? ''),
            vehiculo_anio: String(initialValues?.vehiculo_anio ?? ''),
            vehiculo_color: String(initialValues?.vehiculo_color ?? ''),
            tipo_vehiculo: String(initialValues?.tipo_vehiculo ?? ''),
            uid_tipo_vehiculo: String(initialValues?.uid_tipo_vehiculo ?? ''),
            KM: String(initialValues?.KM ?? ''),
            KM_correa_tiempo: String(initialValues?.KM_correa_tiempo ?? ''),
            KM_ultima_rotacion_cauchos: String(initialValues?.KM_ultima_rotacion_cauchos ?? ''),
            ...patchTechnicalOtrosFromInitial(initialValues),
            tipo_aceite_motor: String(initialValues?.tipo_aceite_motor ?? ''),
            ...marcaAceiteFromSaved(initialValues?.marca_aceite_motor),
            tipo_aceite_diferencial: String(initialValues?.tipo_aceite_diferencial ?? ''),
            tipo_aceite_transmision: String(initialValues?.tipo_aceite_transmision ?? ''),
            tipo_refrigerante: String(initialValues?.tipo_refrigerante ?? ''),
            tecnologia_refrigerante: String(initialValues?.tecnologia_refrigerante ?? ''),
            tipo_liga_frenos: String(initialValues?.tipo_liga_frenos ?? ''),
            presion_neumatico: String(initialValues?.presion_neumatico ?? ''),
            nivel_blindaje: String(initialValues?.nivel_blindaje ?? ''),
            proximo_cambio_aceite: timestampToDate(initialValues?.proximo_cambio_aceite),
            ultimo_cambio_bujias_filtro: timestampToDate(initialValues?.ultimo_cambio_bujias_filtro),
            ultimo_cambio_pila_gasolina: timestampToDate(initialValues?.ultimo_cambio_pila_gasolina),
            ultimo_lavado: timestampToDate(initialValues?.ultimo_lavado),
            ultima_vez_gasolina: timestampToDate(initialValues?.ultima_vez_gasolina),
            ultima_vez_alineacion: timestampToDate(initialValues?.ultima_vez_alineacion),
            contratacion_RCV: Boolean(initialValues?.contratacion_RCV),
            grua: Boolean(initialValues?.grua),
            activo: initialValues?.activo !== false,
            por_defecto: Boolean(initialValues?.por_defecto),
            path: String(initialValues?.path ?? ''),
            imagen_base64: '',
            // Documentos: mismas claves que devuelve el GET / save
            doc_circ_frente_uri: String(
              initialValues?.certificado_circulacion_frente_url ?? '',
            ),
            doc_circ_frente_b64: '',
            doc_circ_reverso_uri: String(
              initialValues?.certificado_circulacion_reverso_url ?? '',
            ),
            doc_circ_reverso_b64: '',
            doc_rcv_frente_uri: String(initialValues?.rcv_documento_frente_url ?? ''),
            doc_rcv_frente_b64: '',
            doc_rcv_reverso_uri: String(initialValues?.rcv_documento_reverso_url ?? ''),
            doc_rcv_reverso_b64: '',
            doc_rcv_vencimiento: timestampToDate(initialValues?.rcv_fecha_vencimiento),
            doc_trim_frente_uri: String(initialValues?.trimestres_frente_url ?? ''),
            doc_trim_frente_b64: '',
            doc_trim_reverso_uri: String(initialValues?.trimestres_reverso_url ?? ''),
            doc_trim_reverso_b64: '',
            doc_trim_vencimiento: timestampToDate(
              initialValues?.trimestres_fecha_vencimiento,
            ),
          }
        : {...DEFAULT_VALUES},
    );
  }, [initialValues]);

  const updateField = (key, value) => setForm(prev => ({...prev, [key]: value}));

  const getPressurePair = () => parsePressurePair(form.presion_neumatico);

  const updatePressurePair = (front, rear) => {
    const safeFront = Math.min(PRESSURE_MAX, Math.max(PRESSURE_MIN, Number(front) || 32));
    const safeRear = Math.min(PRESSURE_MAX, Math.max(PRESSURE_MIN, Number(rear) || 32));
    // Se mantiene un solo campo para API
    updateField('presion_neumatico', `${safeFront}/${safeRear} PSI`);
  };

  const changePressure = (side, delta) => {
    const pair = getPressurePair();
    if (side === 'front') {
      updatePressurePair(pair.front + delta, pair.rear);
      return;
    }
    updatePressurePair(pair.front, pair.rear + delta);
  };

  const openDatePicker = fieldKey => {
    const current = form[fieldKey];
    setDatePickerModal({
      visible: true,
      fieldKey,
      tempDate: current instanceof Date && !isNaN(current.getTime()) ? current : new Date(),
    });
  };

  const closeDatePicker = () =>
    setDatePickerModal(prev => ({...prev, visible: false, fieldKey: null}));

  const confirmDatePicker = () => {
    if (datePickerModal.fieldKey) {
      updateField(datePickerModal.fieldKey, datePickerModal.tempDate);
    }
    closeDatePicker();
  };

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
    setForm(prev => ({...prev, [target.uriKey]: uri, [target.b64Key]: b64}));
  };

  const openPhotoOptions = (uriKey, b64Key) => {
    setPhotoModalTarget({uriKey, b64Key});
    setPhotoModalVisible(true);
  };

  const handlePickGallery = () => {
    setPhotoModalVisible(false);
    setTimeout(() => {
      launchImageLibrary(
        {mediaType: 'photo', selectionLimit: 1, includeBase64: true},
        response => {
          if (response?.didCancel || response?.errorCode) return;
          const asset = response?.assets?.[0];
          if (asset?.uri) applyPhotoResult(photoModalTarget, asset.uri, asset.base64 ?? '');
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
          if (response?.didCancel || response?.errorCode) return;
          const asset = response?.assets?.[0];
          if (asset?.uri) applyPhotoResult(photoModalTarget, asset.uri, asset.base64 ?? '');
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

  const pickDocumentFromGallery = (uriKey, base64Key) => {
    launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 1, includeBase64: true},
      response => {
        if (response?.didCancel) return;
        if (response?.errorCode) return;
        const asset = response?.assets?.[0];
        const uri = asset?.uri;
        const base64 = asset?.base64 ?? '';
        if (uri) {
          setForm(prev => ({...prev, [uriKey]: uri, [base64Key]: base64}));
        }
      },
    );
  };

  const clearDocument = (uriKey, base64Key) => {
    setForm(prev => ({...prev, [uriKey]: '', [base64Key]: ''}));
  };

  const openDocImagePreview = useCallback(uri => {
    const u = String(uri ?? '').trim();
    if (u) setDocImagePreviewUri(u);
  }, []);

  const closeDocImagePreview = useCallback(() => setDocImagePreviewUri(null), []);

  const renderDocPhotoSlot = (uriKey, b64Key, a11yLabel) => {
    const uri = form[uriKey];
    if (!uri) {
      return (
        <TouchableOpacity
          style={styles.docPickBtn}
          onPress={() => openPhotoOptions(uriKey, b64Key)}
          activeOpacity={0.85}>
          <Text style={styles.docPickBtnText}>Galería</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={[styles.docPickBtn, styles.docPickBtnFilled]}>
        <Pressable
          style={styles.docThumbHit}
          onPress={() => openDocImagePreview(uri)}
          android_ripple={{color: 'rgba(255,255,255,0.2)'}}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${a11yLabel} a pantalla completa`}>
          <Image source={{uri}} style={styles.docThumb} resizeMode="cover" />
        </Pressable>
        <Pressable
          style={styles.docExpandPhotoBtn}
          onPress={() => openDocImagePreview(uri)}
          hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
          android_ripple={{color: 'rgba(255,255,255,0.15)'}}
          accessibilityLabel="Pantalla completa">
          <IconsFA5 name="expand-arrows-alt" size={12} color="#FFD60A" solid />
        </Pressable>
        <Pressable
          style={styles.docChangePhotoBtn}
          onPress={() => openPhotoOptions(uriKey, b64Key)}
          hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
          android_ripple={{color: 'rgba(255,255,255,0.15)'}}
          accessibilityLabel="Cambiar foto">
          <IconsFA5 name="camera" size={12} color="#FFD60A" solid />
        </Pressable>
        <TouchableOpacity
          style={styles.docRemoveX}
          onPress={() => clearDocument(uriKey, b64Key)}
          hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
          accessibilityRole="button"
          accessibilityLabel="Quitar foto">
          <Icons name="times" size={15} color="#FFD60A" />
        </TouchableOpacity>
      </View>
    );
  };

  const validateStep1 = () => {
    const placa = (form.vehiculo_placa || '').trim();
    const marca = (form.vehiculo_marca || '').trim();
    const modelo = (form.vehiculo_modelo || '').trim();
    const anio = (form.vehiculo_anio || '').trim();
    const km = (form.KM || '').trim();

    if (!placa) return Alert.alert('Campo requerido', 'La placa del vehículo es obligatoria.'), false;
    if (!marca) return Alert.alert('Campo requerido', 'La marca del vehículo es obligatoria.'), false;
    if (!modelo) return Alert.alert('Campo requerido', 'El modelo del vehículo es obligatorio.'), false;
    if (!anio) return Alert.alert('Campo requerido', 'El año del vehículo es obligatorio.'), false;
    if (!km)
      return Alert.alert('Campo requerido', 'El kilometraje del vehículo es obligatorio.'), false;
    return true;
  };

  const handleContinue = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    const placa = (form.vehiculo_placa || '').trim();
    const marca = (form.vehiculo_marca || '').trim();
    const modelo = (form.vehiculo_modelo || '').trim();
    const anio = (form.vehiculo_anio || '').trim();
    const km = (form.KM || '').trim();

    if (!placa || !marca || !modelo || !anio || !km) {
      Alert.alert('Faltan datos', 'Completa la información del vehículo en el Paso 1.');
      setStep(1);
      return;
    }

    let uiduser = '';
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      uiduser = user?.uid ?? user?.id ?? '';
    } catch (e) {
      uiduser = '';
    }

    const imagen_base64 = (form.imagen_base64 || '').trim() || null;

    const safeDate = d => (d instanceof Date && !isNaN(d.getTime()) ? d : null);

    const circF = documentPayloadBase64FieldValue(
      form.doc_circ_frente_uri,
      form.doc_circ_frente_b64,
      initialDocumentUrls.circ_frente,
    );
    const circR = documentPayloadBase64FieldValue(
      form.doc_circ_reverso_uri,
      form.doc_circ_reverso_b64,
      initialDocumentUrls.circ_reverso,
    );
    const rcvF = documentPayloadBase64FieldValue(
      form.doc_rcv_frente_uri,
      form.doc_rcv_frente_b64,
      initialDocumentUrls.rcv_frente,
    );
    const rcvR = documentPayloadBase64FieldValue(
      form.doc_rcv_reverso_uri,
      form.doc_rcv_reverso_b64,
      initialDocumentUrls.rcv_reverso,
    );
    const trimF = documentPayloadBase64FieldValue(
      form.doc_trim_frente_uri,
      form.doc_trim_frente_b64,
      initialDocumentUrls.trim_frente,
    );
    const trimR = documentPayloadBase64FieldValue(
      form.doc_trim_reverso_uri,
      form.doc_trim_reverso_b64,
      initialDocumentUrls.trim_reverso,
    );

    const payload = {
      uiduser,
      uidvehicle: initialValues?.id != null ? String(initialValues.id) : '',
      vehiculo_placa: placa,
      vehiculo_marca: marca,
      vehiculo_modelo: modelo,
      vehiculo_anio: parseInt(anio, 10),
      vehiculo_color: (form.vehiculo_color || '').trim() || null,
      tipo_vehiculo: (form.tipo_vehiculo || '').trim() || null,
      uid_tipo_vehiculo: (form.uid_tipo_vehiculo || '').trim() || null,
      KM: parseInt(km, 10),
      KM_correa_tiempo: form.KM_correa_tiempo ? parseInt(form.KM_correa_tiempo, 10) : null,
      KM_ultima_rotacion_cauchos: form.KM_ultima_rotacion_cauchos
        ? parseInt(form.KM_ultima_rotacion_cauchos, 10)
        : null,
      proximo_cambio_aceite: safeDate(form.proximo_cambio_aceite),
      ultimo_cambio_bujias_filtro: safeDate(form.ultimo_cambio_bujias_filtro),
      ultimo_cambio_pila_gasolina: safeDate(form.ultimo_cambio_pila_gasolina),
      ultimo_lavado: safeDate(form.ultimo_lavado),
      ultima_vez_gasolina: safeDate(form.ultima_vez_gasolina),
      ultima_vez_alineacion: safeDate(form.ultima_vez_alineacion),
      contratacion_RCV: form.contratacion_RCV,
      grua: form.grua,
      activo: form.activo,
      por_defecto: form.por_defecto,
      imagen_base64,

      // --- Manual digital ---
      capacidad_tanque_combustible: resolveTechnicalOtrosPayload(
        form,
        'capacidad_tanque_combustible',
      ),
      cilindrada: resolveTechnicalOtrosPayload(form, 'cilindrada'),
      numero_cilindros: resolveTechnicalOtrosPayload(form, 'numero_cilindros'),
      tipo_aceite_motor: (form.tipo_aceite_motor || '').trim() || null,
      viscosidad_aceite_motor: resolveTechnicalOtrosPayload(form, 'viscosidad_aceite_motor'),
      marca_aceite_motor:
        form.marca_aceite_motor === OTROS_BUBBLE
          ? (form.marca_aceite_motor_custom || '').trim() || null
          : (form.marca_aceite_motor || '').trim() || null,
      litros_aceite: resolveTechnicalOtrosPayload(form, 'litros_aceite'),
      tipo_aceite_diferencial: (form.tipo_aceite_diferencial || '').trim() || null,
      viscosidad_aceite_diferencial: resolveTechnicalOtrosPayload(
        form,
        'viscosidad_aceite_diferencial',
      ),
      tipo_aceite_transmision: (form.tipo_aceite_transmision || '').trim() || null,
      tipo_refrigerante: (form.tipo_refrigerante || '').trim() || null,
      tecnologia_refrigerante: (form.tecnologia_refrigerante || '').trim() || null,
      tipo_liga_frenos: (form.tipo_liga_frenos || '').trim() || null,
      amperaje_bateria: resolveTechnicalOtrosPayload(form, 'amperaje_bateria'),
      tamano_neumatico: resolveTechnicalOtrosPayload(form, 'tamano_neumatico'),
      tamano_rin: resolveTechnicalOtrosPayload(form, 'tamano_rin'),
      presion_neumatico: (form.presion_neumatico || '').trim() || null,
      marca_bujia: resolveTechnicalOtrosPayload(form, 'marca_bujia'),
      codigo_bujia: resolveTechnicalOtrosPayload(form, 'codigo_bujia'),
      nivel_blindaje: (form.nivel_blindaje || '').trim() || null,

      certificado_circulacion_frente_base64: circF,
      certificado_circulacion_reverso_base64: circR,
      rcv_documento_frente_base64: rcvF,
      rcv_documento_reverso_base64: rcvR,
      trimestres_frente_base64: trimF,
      trimestres_reverso_base64: trimR,

      rcv_fecha_vencimiento: safeDate(form.doc_rcv_vencimiento),
      trimestres_fecha_vencimiento: safeDate(form.doc_trim_vencimiento),
    };

    setSaving(true);
    try {
      await api.post('usuarios/saveOrUpdateVehiculo', payload);
      Alert.alert('¡Listo!', 'Tu vehículo se guardó correctamente.', [{text: 'Entendido'}]);
      navigation.goBack();
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ?? err?.message ?? 'No se pudo guardar el vehículo.';
      Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>

      
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtnCircle}
          activeOpacity={0.85}>
          <ArrowLeft size={20} color="#FFD60A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar vehículo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        {loadingVehicleData ? (
          <View style={{paddingTop: 40, alignItems: 'center'}}>
            <ActivityIndicator size="small" color={appColors?.primary || '#1F2344'} />
          </View>
        ) : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 170}}
          stickyHeaderIndices={[0]}>
          <View style={styles.stickyTopBlock}>
            <View style={styles.stepPillsRow}>
              <TouchableOpacity
                onPress={() => setStep(1)}
                style={[styles.stepPill, step === 1 && styles.stepPillActive]}>
                <Text
                  style={[
                    styles.stepPillText,
                    styles.stepPillCompactText,
                    step === 1 && styles.stepPillTextActive,
                  ]}
                  numberOfLines={2}>
                  1 · Vehículo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStep(2)}
                style={[styles.stepPill, step === 2 && styles.stepPillActive]}>
                <Text
                  style={[
                    styles.stepPillText,
                    styles.stepPillCompactText,
                    step === 2 && styles.stepPillTextActive,
                  ]}
                  numberOfLines={2}>
                  2 · Manual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStep(3)}
                style={[styles.stepPill, step === 3 && styles.stepPillActive]}>
                <Text
                  style={[
                    styles.stepPillText,
                    styles.stepPillCompactText,
                    step === 3 && styles.stepPillTextActive,
                  ]}
                  numberOfLines={2}>
                  3 · Documentos
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {width: `${progressPercentage}%`}]} />
              </View>
              <Text style={styles.progressText}>{progressPercentage}% completado</Text>
            </View>
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Estos datos se usarán para tus alertas</Text>
            <Text style={styles.tipsSubtitle}>
              Primero el kilometraje (mismo aviso que en mantenimientos), luego placa, marca, modelo
              y año. El resto es opcional y podrás completarlo después.
            </Text>
          </View>

          {step === 1 ? (
            <View style={styles.kmHeroOuter}>
              <View style={styles.kmHeroTouchable}>
                <View style={styles.kmHeroIconWrap}>
                  <IconsFA5 name="tachometer-alt" size={22} color="#1F2344" />
                </View>
                <View style={styles.kmHeroTextCol}>
                  <Text style={styles.kmHeroLabel}>
                    KILOMETRAJE ACTUAL{' '}
                    <Text style={styles.kmHeroLabelParen}>(toca para modificar)</Text>
                  </Text>
                  <View style={styles.kmHeroInputRow}>
                    <TextInput
                      ref={kmInputRef}
                      style={styles.kmHeroValueInput}
                      value={form.KM}
                      onChangeText={v => updateField('KM', v.replace(/\D/g, ''))}
                      placeholder="Sin registrar — escribe aquí"
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      keyboardType="number-pad"
                      returnKeyType="done"
                      maxLength={9}
                    />
                    <TouchableOpacity
                      onPress={() => kmInputRef.current?.focus()}
                      style={[styles.kmHeroChevron, {marginLeft: 8}]}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                      accessibilityRole="button"
                      accessibilityLabel="Editar kilometraje">
                      <IconsFA5 name="pencil-alt" size={16} color="#FFD60A" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.kmHeroHint}>Odómetro del tablero (km)</Text>
                </View>
              </View>
            </View>
          ) : null}

          {step === 1 ? (
            <View style={styles.outerCard}>
              <Text style={styles.sectionTitle}>Información del vehículo</Text>
              <View style={vehicleFormStyles.stepSection}>
                <View style={vehicleFormStyles.stepCard}>
                  <View style={vehicleFormStyles.field}>
                    <Text style={vehicleFormStyles.label}>
                      Placa <Text style={vehicleFormStyles.labelRequired}>*</Text>
                    </Text>
                    <TextInput
                      style={vehicleFormStyles.input}
                      value={form.vehiculo_placa}
                      onChangeText={v => updateField('vehiculo_placa', v)}
                      placeholder="Ej: ABC123"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="characters"
                      returnKeyType="done"
                    />
                  </View>

                  <View style={vehicleFormStyles.row}>
                    <View style={[vehicleFormStyles.field, vehicleFormStyles.rowHalf]}>
                      <Text style={vehicleFormStyles.label}>
                        Marca <Text style={vehicleFormStyles.labelRequired}>*</Text>
                      </Text>
                      <TextInput
                        style={vehicleFormStyles.input}
                        value={form.vehiculo_marca}
                        onChangeText={v => updateField('vehiculo_marca', v)}
                        placeholder="Ej: Toyota"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                      />
                    </View>
                    <View style={[vehicleFormStyles.field, vehicleFormStyles.rowHalf]}>
                      <Text style={vehicleFormStyles.label}>
                        Modelo <Text style={vehicleFormStyles.labelRequired}>*</Text>
                      </Text>
                      <TextInput
                        style={vehicleFormStyles.input}
                        value={form.vehiculo_modelo}
                        onChangeText={v => updateField('vehiculo_modelo', v)}
                        placeholder="Ej: Corolla"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  <View style={vehicleFormStyles.row}>
                    <View style={[vehicleFormStyles.field, vehicleFormStyles.rowHalf]}>
                      <Text style={vehicleFormStyles.label}>
                        Año <Text style={vehicleFormStyles.labelRequired}>*</Text>
                      </Text>
                      <TextInput
                        style={vehicleFormStyles.input}
                        value={form.vehiculo_anio}
                        onChangeText={v => updateField('vehiculo_anio', v.replace(/\D/g, '').slice(0, 4))}
                        placeholder="Ej: 2022"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                    </View>
                    <View style={[vehicleFormStyles.field, vehicleFormStyles.rowHalf]}>
                      <Text style={vehicleFormStyles.label}>Color</Text>
                      <TextInput
                        style={vehicleFormStyles.input}
                        value={form.vehiculo_color}
                        onChangeText={v => updateField('vehiculo_color', v)}
                        placeholder="Ej: Blanco"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  <View style={vehicleFormStyles.field}>
                    <Text style={vehicleFormStyles.label}>Tipo de vehículo</Text>
                    {loadingTipos ? (
                      <View style={[vehicleFormStyles.input, {justifyContent: 'center'}]}>
                        <ActivityIndicator size="small" color={appColors?.primary} />
                      </View>
                    ) : (
                      <View style={styles.optionBoxesRow}>
                        {(tipoVehiculoOptions.length
                          ? tipoVehiculoOptions
                          : TIPO_VEHICULO_OPTIONS_FALLBACK
                        ).map(item => {
                          const value = String(item?.value ?? '');
                          const label = String(item?.label ?? item?.value ?? '');
                          const isActive = String(form.uid_tipo_vehiculo || '') === value;

                          return (
                            <TouchableOpacity
                              key={`tipo-${value || label}`}
                              activeOpacity={0.85}
                              onPress={() => {
                                updateField('uid_tipo_vehiculo', value);
                                updateField('tipo_vehiculo', label);
                              }}
                              style={[styles.optionBox, isActive && styles.optionBoxActive]}>
                              <Text
                                style={[
                                  styles.optionBoxText,
                                  isActive && styles.optionBoxTextActive,
                                ]}>
                                {label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  <View style={vehicleFormStyles.switchRow}>
                    <Text style={vehicleFormStyles.switchLabel}>Vehículo activo</Text>
                    <BooleanPillToggle
                      value={form.activo}
                      onValueChange={v => updateField('activo', v)}
                    />
                  </View>
                  <View style={vehicleFormStyles.switchRow}>
                    <Text style={vehicleFormStyles.switchLabel}>Vehículo predeterminado</Text>
                    <BooleanPillToggle
                      value={form.por_defecto}
                      onValueChange={v => updateField('por_defecto', v)}
                    />
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.outerCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.techSectionsHorizontal}>
                {TECHNICAL_SECTIONS.map(section => (
                  <View key={section.key} style={styles.techSectionCard}>
                    <View style={styles.techSectionHeader}>
                      <View style={styles.techSectionIconWrap}>
                        <Icons name={section.icon} size={16} color="#FFD60A" />
                      </View>
                      <Text style={styles.techSectionTitle}>{section.title}</Text>
                    </View>

                    {section.fields.map(fieldKey => {
                      const field = TECHNICAL_FIELD_MAP[fieldKey];
                      if (!field) return null;

                      if (field.key === 'presion_neumatico') {
                        const pressure = getPressurePair();
                        return (
                          <View key={field.key} style={vehicleFormStyles.field}>
                            <Text
                              style={[vehicleFormStyles.label, {fontWeight: '800', color: '#1F2344'}]}
                              numberOfLines={2}>
                              {field.label}
                            </Text>
                            <View style={styles.pressureSectionWrap}>
                              <View style={styles.pressureRowWrap}>
                                <View style={[styles.pressureWheelBlock, styles.pressureWheelBlockLeft]}>
                                  <Text style={styles.pressureWheelTitle}>Delantera:</Text>
                                  <View style={styles.pressureControlsRow}>
                                    <TouchableOpacity
                                      activeOpacity={0.85}
                                      style={styles.pressureIconButton}
                                      onPress={() => changePressure('front', -1)}>
                                      <Icons name="minus" size={14} color="#FFD60A" />
                                    </TouchableOpacity>
                                    <Text style={styles.pressureValueText}>{pressure.front} PSI</Text>
                                    <TouchableOpacity
                                      activeOpacity={0.85}
                                      style={styles.pressureIconButton}
                                      onPress={() => changePressure('front', 1)}>
                                      <Icons name="plus" size={14} color="#FFD60A" />
                                    </TouchableOpacity>
                                  </View>
                                </View>

                                <View style={styles.pressureWheelBlock}>
                                  <Text style={styles.pressureWheelTitle}>Trasera:</Text>
                                  <View style={styles.pressureControlsRow}>
                                    <TouchableOpacity
                                      activeOpacity={0.85}
                                      style={styles.pressureIconButton}
                                      onPress={() => changePressure('rear', -1)}>
                                      <Icons name="minus" size={14} color="#FFD60A" />
                                    </TouchableOpacity>
                                    <Text style={styles.pressureValueText}>{pressure.rear} PSI</Text>
                                    <TouchableOpacity
                                      activeOpacity={0.85}
                                      style={styles.pressureIconButton}
                                      onPress={() => changePressure('rear', 1)}>
                                      <Icons name="plus" size={14} color="#FFD60A" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      }

                      if (field.key === 'marca_aceite_motor') {
                        return (
                          <View key={field.key} style={vehicleFormStyles.field}>
                            <Text
                              style={[
                                vehicleFormStyles.label,
                                {fontWeight: '800', color: '#1F2344'},
                              ]}
                              numberOfLines={2}>
                              {field.label}
                            </Text>
                            <View style={styles.optionBoxesRow}>
                              {[...MARCA_ACEITE_VISIBLE, OTROS_BUBBLE].map(option => {
                                const isOtros = option === OTROS_BUBBLE;
                                const isActive = isOtros
                                  ? form.marca_aceite_motor === OTROS_BUBBLE
                                  : String(form.marca_aceite_motor || '') ===
                                    String(option);
                                return (
                                  <TouchableOpacity
                                    key={`${field.key}-${option}`}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                      setForm(prev => ({
                                        ...prev,
                                        marca_aceite_motor: option,
                                        marca_aceite_motor_custom:
                                          option === OTROS_BUBBLE
                                            ? prev.marca_aceite_motor_custom
                                            : '',
                                      }));
                                    }}
                                    style={[
                                      styles.optionBox,
                                      isActive && styles.optionBoxActive,
                                    ]}>
                                    <Text
                                      style={[
                                        styles.optionBoxText,
                                        isActive && styles.optionBoxTextActive,
                                      ]}>
                                      {option}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                            {form.marca_aceite_motor === OTROS_BUBBLE ? (
                              <TextInput
                                style={[vehicleFormStyles.input, {marginTop: 10}]}
                                placeholder="Escribe la marca del aceite"
                                placeholderTextColor="#9CA3AF"
                                value={form.marca_aceite_motor_custom}
                                onChangeText={v =>
                                  updateField('marca_aceite_motor_custom', v)
                                }
                              />
                            ) : null}
                          </View>
                        );
                      }

                      if (technicalFieldShowsOtrosBubble(field.key, field.options)) {
                        const customKey = `${field.key}_custom`;
                        const displayOptions = [
                          ...getVisiblePresetOptionsForOtrosField(field.key, field.options || []),
                          OTROS_BUBBLE,
                        ];
                        return (
                          <View key={field.key} style={vehicleFormStyles.field}>
                            <Text
                              style={[
                                vehicleFormStyles.label,
                                {fontWeight: '800', color: '#1F2344'},
                              ]}
                              numberOfLines={2}>
                              {field.label}
                            </Text>
                            <View style={styles.optionBoxesRow}>
                              {displayOptions.map(option => {
                                const isOtrosOpt = option === OTROS_BUBBLE;
                                const cur = String(form[field.key] || '');
                                const isActive = isOtrosOpt
                                  ? cur === OTROS_BUBBLE
                                  : cur === String(option) && cur !== OTROS_BUBBLE;
                                return (
                                  <TouchableOpacity
                                    key={`${field.key}-${option}`}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                      setForm(prev => ({
                                        ...prev,
                                        [field.key]: option,
                                        [customKey]:
                                          option === OTROS_BUBBLE ? prev[customKey] : '',
                                      }));
                                    }}
                                    style={[
                                      styles.optionBox,
                                      isActive && styles.optionBoxActive,
                                    ]}>
                                    <Text
                                      style={[
                                        styles.optionBoxText,
                                        isActive && styles.optionBoxTextActive,
                                      ]}>
                                      {option}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                            {form[field.key] === OTROS_BUBBLE ? (
                              <TextInput
                                style={[vehicleFormStyles.input, {marginTop: 10}]}
                                placeholder={
                                  TECH_OTHERS_INPUT_PLACEHOLDER[field.key] ||
                                  'Especifica el valor'
                                }
                                placeholderTextColor="#9CA3AF"
                                value={form[customKey]}
                                onChangeText={v => updateField(customKey, v)}
                              />
                            ) : null}
                          </View>
                        );
                      }

                      return (
                        <View key={field.key} style={vehicleFormStyles.field}>
                          <Text
                            style={[vehicleFormStyles.label, {fontWeight: '800', color: '#1F2344'}]}
                            numberOfLines={2}>
                            {field.label}
                          </Text>
                          <View style={styles.optionBoxesRow}>
                            {(field.options || []).map(option => {
                              const isActive = String(form[field.key] || '') === String(option);
                              return (
                                <TouchableOpacity
                                  key={`${field.key}-${option}`}
                                  activeOpacity={0.85}
                                  onPress={() => updateField(field.key, option)}
                                  style={[styles.optionBox, isActive && styles.optionBoxActive]}>
                                  <Text
                                    style={[
                                      styles.optionBoxText,
                                      isActive && styles.optionBoxTextActive,
                                    ]}>
                                    {option}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.outerCard}>
              <Text style={styles.sectionTitle}>Documentos</Text>
              <Text style={[styles.tipsSubtitle, {marginBottom: 16}]}>
                Sube fotos desde la galería. El certificado de circulación solo requiere imágenes; el
                RCV y el trimestre incluyen fecha de vencimiento.
              </Text>

              <View style={styles.docBlock}>
                <Text style={styles.docBlockTitle}>Certificado de circulación</Text>
                <Text style={styles.docBlockHint}>Una foto por cada lado del documento.</Text>
                <View style={styles.docPhotoRow}>
                  <View style={[styles.docPhotoSlot, styles.docPhotoSlotSpacer]}>
                    <Text style={styles.docPhotoLabel}>Frente</Text>
                    {renderDocPhotoSlot(
                      'doc_circ_frente_uri',
                      'doc_circ_frente_b64',
                      'Certificado de circulación (frente)',
                    )}
                  </View>
                  <View style={styles.docPhotoSlot}>
                    <Text style={styles.docPhotoLabel}>Reverso</Text>
                    {renderDocPhotoSlot(
                      'doc_circ_reverso_uri',
                      'doc_circ_reverso_b64',
                      'Certificado de circulación (reverso)',
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.docBlock}>
                <Text style={styles.docBlockTitle}>RCV</Text>
                <Text style={styles.docBlockHint}>Frente, reverso y fecha en que vence.</Text>
                <View style={styles.docPhotoRow}>
                  <View style={[styles.docPhotoSlot, styles.docPhotoSlotSpacer]}>
                    <Text style={styles.docPhotoLabel}>Frente</Text>
                    {renderDocPhotoSlot(
                      'doc_rcv_frente_uri',
                      'doc_rcv_frente_b64',
                      'RCV (frente)',
                    )}
                  </View>
                  <View style={styles.docPhotoSlot}>
                    <Text style={styles.docPhotoLabel}>Reverso</Text>
                    {renderDocPhotoSlot(
                      'doc_rcv_reverso_uri',
                      'doc_rcv_reverso_b64',
                      'RCV (reverso)',
                    )}
                  </View>
                </View>
                <Text style={[styles.docPhotoLabel, {marginTop: 4}]}>Vencimiento del RCV</Text>
                <TouchableOpacity
                  style={styles.docDateBtn}
                  onPress={() => openDatePicker('doc_rcv_vencimiento')}
                  activeOpacity={0.85}>
                  <Text
                    style={[
                      styles.docDateBtnText,
                      !form.doc_rcv_vencimiento && styles.docDatePlaceholder,
                    ]}>
                    {formatDateDisplay(form.doc_rcv_vencimiento) || 'Toca para elegir fecha'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.docBlock, styles.docBlockLast]}>
                <Text style={styles.docBlockTitle}>Trimestre</Text>
                <Text style={styles.docBlockHint}>Frente, reverso y fecha de vencimiento.</Text>
                <View style={styles.docPhotoRow}>
                  <View style={[styles.docPhotoSlot, styles.docPhotoSlotSpacer]}>
                    <Text style={styles.docPhotoLabel}>Frente</Text>
                    {renderDocPhotoSlot(
                      'doc_trim_frente_uri',
                      'doc_trim_frente_b64',
                      'Trimestre (frente)',
                    )}
                  </View>
                  <View style={styles.docPhotoSlot}>
                    <Text style={styles.docPhotoLabel}>Reverso</Text>
                    {renderDocPhotoSlot(
                      'doc_trim_reverso_uri',
                      'doc_trim_reverso_b64',
                      'Trimestre (reverso)',
                    )}
                  </View>
                </View>
                <Text style={[styles.docPhotoLabel, {marginTop: 4}]}>
                  Vencimiento del trimestre
                </Text>
                <TouchableOpacity
                  style={styles.docDateBtn}
                  onPress={() => openDatePicker('doc_trim_vencimiento')}
                  activeOpacity={0.85}>
                  <Text
                    style={[
                      styles.docDateBtnText,
                      !form.doc_trim_vencimiento && styles.docDatePlaceholder,
                    ]}>
                    {formatDateDisplay(form.doc_trim_vencimiento) || 'Toca para elegir fecha'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.stickyFooter}>
          <View style={styles.footerCardInsideSticky}>
            {step === 1 ? (
              <View style={styles.footerButtonRow}>
                <TouchableOpacity
                  style={[vehicleFormStyles.btn, vehicleFormStyles.btnSecondary]}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}>
                  <Text style={vehicleFormStyles.btnTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[vehicleFormStyles.btn, vehicleFormStyles.btnPrimary]}
                  onPress={handleContinue}
                  activeOpacity={0.8}>
                  <Text style={vehicleFormStyles.btnTextPrimary}>Continuar</Text>
                </TouchableOpacity>
              </View>
            ) : step === 2 ? (
              <View style={styles.footerButtonRow}>
                <TouchableOpacity
                  style={[vehicleFormStyles.btn, vehicleFormStyles.btnSecondary]}
                  onPress={() => setStep(1)}
                  activeOpacity={0.8}>
                  <Text style={vehicleFormStyles.btnTextSecondary}>Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[vehicleFormStyles.btn, vehicleFormStyles.btnPrimary]}
                  onPress={() => setStep(3)}
                  activeOpacity={0.8}>
                  <Text style={vehicleFormStyles.btnTextPrimary}>Siguiente</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.footerButtonRow}>
                <TouchableOpacity
                  style={[vehicleFormStyles.btn, vehicleFormStyles.btnSecondary]}
                  onPress={() => setStep(2)}
                  activeOpacity={0.8}>
                  <Text style={vehicleFormStyles.btnTextSecondary}>Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    vehicleFormStyles.btn,
                    vehicleFormStyles.btnPrimary,
                    saving && vehicleFormStyles.btnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={saving}
                  activeOpacity={0.8}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={vehicleFormStyles.btnTextPrimary}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={!!docImagePreviewUri}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={closeDocImagePreview}
        statusBarTranslucent>
        <View style={styles.docFullPreviewLayer}>
          <View style={[styles.docFullPreviewBody, {paddingTop: insets.top}]}>
            {docImagePreviewUri ? (
              <Image
                source={{uri: docImagePreviewUri}}
                style={styles.docFullPreviewImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
          <View
            style={[
              styles.docFullPreviewFooter,
              {paddingBottom: Math.max(insets.bottom, 18)},
            ]}>
            <TouchableOpacity
              style={styles.docFullPreviewClose}
              onPress={closeDocImagePreview}
              accessibilityRole="button"
              accessibilityLabel="Cerrar vista previa">
              <Text style={styles.docFullPreviewCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={datePickerModal.visible} transparent animationType="fade">
        <TouchableOpacity
          style={vehicleFormStyles.datePickerOverlay}
          activeOpacity={1}
          onPress={closeDatePicker}>
          <View style={vehicleFormStyles.datePickerBox}>
            <Text style={vehicleFormStyles.datePickerTitle}>
              {ALL_DATE_FIELD_LABELS.find(f => f.key === datePickerModal.fieldKey)?.label ??
                'Fecha'}
            </Text>
            <DatePicker
              date={datePickerModal.tempDate}
              onDateChange={d => setDatePickerModal(prev => ({...prev, tempDate: d}))}
              theme="light"
              mode="date"
              style={vehicleFormStyles.datePicker}
              locale="es"
            />
            <View style={vehicleFormStyles.datePickerFooter}>
              <TouchableOpacity
                style={vehicleFormStyles.datePickerBtnCancel}
                onPress={closeDatePicker}>
                <Text style={vehicleFormStyles.datePickerBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={vehicleFormStyles.datePickerBtnConfirm}
                onPress={confirmDatePicker}>
                <Text style={vehicleFormStyles.datePickerBtnConfirmText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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

export default VehicleAddStepper;