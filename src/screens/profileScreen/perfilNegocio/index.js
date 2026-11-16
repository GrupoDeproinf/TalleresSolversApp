// Perfil del negocio: una sola pantalla para editar los datos del taller.
//
// Reemplaza al editor antiguo de 7 pasos ("Mi cuenta (Negocio)") con el mismo
// diseño del registro. Solo se envía al servidor lo que el taller cambió, por
// /usuarios/actualizarPerfilTaller, que no toca documentos ni estatus.
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {Camera, Image as ImageIcon} from 'lucide-react-native';
import {BottomSheet} from '../../../ui';
import {Avatar} from '../../../ui/cuenta';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../../../axiosInstance';
import {C, Field, PrimaryButton, Banner, Chip} from '../../../components/registro/ui';
import MetodosPago, {METODOS_PAGO, CAMPOS_PAGO, datosParaEnviar} from '../../../components/registro/MetodosPago';
import LocationPicker from '../../../components/registro/LocationPicker';
import {validarNombre, validarTelefono, normalizarTelefono} from '../../../components/registro/validators';
import {OPCIONES_HORA, parseHorarios} from '../../../utils/taller';
import PhoneInput from '../../../ui/PhoneInput';
import {pendientesDelPerfil} from '../../../utils/perfilPendiente';

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

const PRESETS = [
  {label: 'Lun–Vie 8 a. m.–5 p. m.', dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], open: '08:00', close: '17:00'},
  {label: 'Sáb 8 a. m.–12 p. m.', dias: ['sabado'], open: '08:00', close: '12:00'},
];


const horarioDesde = raw => {
  const h = parseHorarios(raw) || {};
  return DIAS.reduce((acc, d) => {
    const x = h[d.key] || {};
    acc[d.key] = {
      enabled: x.enabled === true,
      open: typeof x.open === 'string' && x.open ? x.open : '08:00',
      close: typeof x.close === 'string' && x.close ? x.close : '17:00',
    };
    return acc;
  }, {});
};

const numero = v => {
  const n = Number(v);
  return Number.isFinite(n) && v !== '' && v != null ? n : null;
};

/** Convierte el usuario guardado en el formulario. */
const formularioDesde = u => ({
  nombre: String(u?.nombre || ''),
  descripcion: String(u?.Caracteristicas || ''),
  // Req. 006: redes sociales del negocio.
  instagram: String(u?.LinkInstagram || ''),
  facebook: String(u?.LinkFacebook || ''),
  tiktok: String(u?.LinkTiktok || ''),
  phone: String(u?.phone || ''),
  whatsapp: String(u?.whatsapp || ''),
  estado: String(u?.estado || ''),
  direccion: String(u?.Direccion || ''),
  lat: numero(u?.ubicacion?.lat ?? u?.lat),
  lng: numero(u?.ubicacion?.lng ?? u?.lng),
  horario: horarioDesde(u?.horarios_atencion),
  metodos: METODOS_PAGO.reduce((acc, m) => ({...acc, [m.value]: u?.metodos_pago?.[m.value] === true}), {}),
  // Datos opcionales para que le paguen (banco, teléfono, correo…).
  metodosDatos: Object.keys(CAMPOS_PAGO).reduce((acc, metodo) => {
    const d = u?.metodos_pago_datos?.[metodo];
    return d && typeof d === 'object' ? {...acc, [metodo]: {...d}} : acc;
  }, {}),
});

const OPCIONES_FOTO = {mediaType: 'photo', includeBase64: true, maxWidth: 1024, maxHeight: 1024, quality: 0.8};

const iguales = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Título de sección con la marca "Pendiente" cuando al perfil le falta ese dato.
const Seccion = ({titulo, pendiente, onLayout}) => (
  <View style={st.seccionFila} onLayout={onLayout}>
    <Text style={[st.seccion, {marginTop: 0, marginBottom: 0, flexShrink: 1}]}>{titulo}</Text>
    {pendiente ? (
      <View style={st.pendiente} accessibilityLabel="Pendiente por completar">
        <View style={st.pendientePunto} />
        <Text style={st.pendienteTexto}>Pendiente</Text>
      </View>
    ) : null}
  </View>
);

const PerfilNegocio = ({navigation}) => {
  const [uid, setUid] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [original, setOriginal] = useState(null);
  const [f, setF] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [tocado, setTocado] = useState({});
  const [banner, setBanner] = useState({type: 'error', text: ''});
  const [guardado, setGuardado] = useState(false);
  const [hojaFoto, setHojaFoto] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  // Posición de cada sección, para llevar al taller a lo que le falta.
  const scrollRef = useRef(null);
  const posiciones = useRef({});
  const marcar = k => e => {
    posiciones.current[k] = e.nativeEvent.layout.y;
  };
  const irA = k => {
    const y = posiciones.current[k];
    if (y != null) scrollRef.current?.scrollTo({y: Math.max(0, y - 12), animated: true});
    if (k === 'ubicacion') setMapVisible(true);
    if (k === 'logo') navigation.navigate('DocumentosTaller');
  };

  const set = (k, v) => {
    setGuardado(false);
    setF(prev => ({...prev, [k]: v}));
  };
  const tocar = k => () => setTocado(t => ({...t, [k]: true}));

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const raw = await AsyncStorage.getItem('@userInfo');
      const local = raw ? JSON.parse(raw) : {};
      const id = String(local?.uid || local?.id || '');
      setUid(id);
      let datos = local;
      try {
        const {data} = await api.post('/usuarios/getUserByUid', {uid: id});
        if (data?.userData) datos = {...local, ...data.userData};
      } catch (e) {
        // Sin conexión: se muestra lo último guardado en el teléfono.
      }
      const form = formularioDesde(datos);
      setUsuario(datos);
      setOriginal(form);
      setF(form);
    } catch (e) {
      setBanner({type: 'error', text: 'No pudimos cargar tu perfil. Revisa tu conexión e intenta de nuevo.'});
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const errores = useMemo(() => {
    if (!f) return {};
    const e = {
      nombre: validarNombre(f.nombre, 'el nombre del taller'),
      phone: validarTelefono(f.phone),
      estado: f.estado ? '' : 'Elige el estado donde está el taller.',
      direccion: f.direccion.trim().length >= 8 ? '' : 'Escribe la dirección con una referencia (ej: Av. Bolívar, frente a la plaza).',
      horario: '',
    };
    const on = DIAS.filter(d => f.horario[d.key]?.enabled);
    if (!on.length) e.horario = 'Elige al menos un día de atención (puedes usar los atajos).';
    else {
      const mal = on.find(d => f.horario[d.key].open >= f.horario[d.key].close);
      if (mal) e.horario = `El ${mal.label} cierra antes de abrir: revisa las horas.`;
    }
    return e;
  }, [f]);

  // Solo lo que cambió respecto a lo cargado. Así un campo que el taller no
  // tocó nunca se reescribe, aunque venga en un formato antiguo.
  const cambios = useMemo(() => {
    if (!f || !original) return {};
    const c = {};
    if (f.nombre.trim() !== original.nombre.trim()) c.nombre = f.nombre.trim();
    if (f.descripcion.trim() !== original.descripcion.trim()) c.Caracteristicas = f.descripcion.trim();
    if (f.instagram.trim() !== original.instagram.trim()) c.LinkInstagram = f.instagram.trim();
    if (f.facebook.trim() !== original.facebook.trim()) c.LinkFacebook = f.facebook.trim();
    if (f.tiktok.trim() !== original.tiktok.trim()) c.LinkTiktok = f.tiktok.trim();
    // Se compara ya normalizado: que el campo le dé formato al número al
    // mostrarlo no cuenta como un cambio del taller.
    const tel = v => normalizarTelefono(v || '');
    if (tel(f.phone) !== tel(original.phone)) c.phone = tel(f.phone);
    if (f.estado !== original.estado) c.estado = f.estado;
    if (f.direccion.trim() !== original.direccion.trim()) c.Direccion = f.direccion.trim();
    if ((f.lat !== original.lat || f.lng !== original.lng) && f.lat != null && f.lng != null) {
      c.lat = f.lat;
      c.lng = f.lng;
    }
    if (!iguales(f.horario, original.horario)) c.horarios_atencion = f.horario;
    if (!iguales(f.metodos, original.metodos)) c.metodos_pago = f.metodos;
    const datosAhora = datosParaEnviar(f.metodos, f.metodosDatos);
    if (!iguales(datosAhora, datosParaEnviar(original.metodos, original.metodosDatos))) c.metodos_pago_datos = datosAhora;
    return c;
  }, [f, original]);

  const hayCambios = Object.keys(cambios).length > 0;

  // Lo que le falta al perfil, según lo que hay ahora en pantalla: la marca
  // se quita apenas el taller llena el dato (y se confirma al guardar).
  const pendientes = useMemo(() => {
    if (!f) return [];
    return pendientesDelPerfil({
      descripcion: f.descripcion,
      diasAbiertos: DIAS.filter(d => f.horario[d.key]?.enabled).length,
      metodos: Object.values(f.metodos || {}).some(v => v === true),
      redes: [f.instagram, f.facebook, f.tiktok].some(v => String(v || '').trim()),
      ubicacion: f.lat != null && f.lng != null,
      logo: !!String((typeof usuario?.logotipoNegocio === 'string' ? usuario.logotipoNegocio : usuario?.logotipoNegocio?.url) || '').trim(),
    });
  }, [f, usuario]);
  const falta = k => pendientes.some(c => c.key === k);

  // Solo se valida lo que se va a enviar: un dato viejo incompleto que el
  // taller no tocó no le impide guardar otro cambio.
  const CAMPO_DE = {nombre: 'nombre', phone: 'phone', whatsapp: 'whatsapp', estado: 'estado', Direccion: 'direccion', horarios_atencion: 'horario'};
  const errorDeEnvio = Object.keys(cambios)
    .map(k => errores[CAMPO_DE[k]])
    .find(Boolean);

  const guardar = async () => {
    if (!uid || !hayCambios || guardando) return;
    if (errorDeEnvio) {
      setTocado({nombre: true, phone: true, whatsapp: true, estado: true, direccion: true, horario: true});
      setBanner({type: 'error', text: errorDeEnvio});
      return;
    }
    setGuardando(true);
    setBanner({type: 'error', text: ''});
    try {
      await api.post('/usuarios/actualizarPerfilTaller', {uid, ...cambios}, {timeout: 30000});
      const raw = await AsyncStorage.getItem('@userInfo');
      const local = raw ? JSON.parse(raw) : {};
      const fusion = {...local, ...cambios};
      if (cambios.lat != null) fusion.ubicacion = {lat: cambios.lat, lng: cambios.lng};
      await AsyncStorage.setItem('@userInfo', JSON.stringify(fusion));
      setOriginal(f);
      setGuardado(true);
      setBanner({type: 'ok', text: 'Guardamos los cambios de tu negocio.'});
    } catch (e) {
      setBanner({
        type: 'error',
        text: e?.response?.data?.message || 'No pudimos guardar los cambios. Revisa tu conexión y toca Guardar de nuevo.',
      });
    } finally {
      setGuardando(false);
    }
  };

  // La foto del negocio se sube apenas se elige: no depende de "Guardar".
  const subirFoto = async r => {
    if (r?.didCancel || r?.errorCode) return;
    const a = r?.assets?.[0];
    if (!a?.base64 || !uid) return;
    setSubiendoFoto(true);
    const anterior = String(usuario?.image_perfil || '').split('/').pop();
    try {
      await api.post('/usuarios/UpdateUsuariosAll', {uid, base64: a.base64, imageTodelete: anterior}, {timeout: 30000});
      let url = a.uri;
      try {
        const {data} = await api.post('/usuarios/getUserByUid', {uid});
        url = data?.userData?.image_perfil || url;
      } catch (e) {
        // Se muestra la foto elegida; el enlace llega en la próxima carga.
      }
      setUsuario(u => ({...u, image_perfil: url}));
      try {
        const raw = await AsyncStorage.getItem('@userInfo');
        const local = raw ? JSON.parse(raw) : {};
        await AsyncStorage.setItem('@userInfo', JSON.stringify({...local, image_perfil: url}));
      } catch (e) {}
      setBanner({type: 'ok', text: 'Actualizamos la foto de tu negocio.'});
    } catch (e) {
      setBanner({type: 'error', text: 'No pudimos subir la foto. Revisa tu conexión e intenta de nuevo.'});
    } finally {
      setSubiendoFoto(false);
    }
  };

  const fotoDesdeGaleria = () => {
    setHojaFoto(false);
    setTimeout(() => launchImageLibrary({...OPCIONES_FOTO, selectionLimit: 1}, subirFoto), 400);
  };

  const fotoDesdeCamara = () => {
    setHojaFoto(false);
    setTimeout(async () => {
      if (Platform.OS === 'android') {
        const ok = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (ok !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Solvers', 'Para tomar la foto, permite el uso de la cámara en los ajustes del teléfono.');
          return;
        }
      }
      launchCamera(OPCIONES_FOTO, subirFoto);
    }, 400);
  };

  const salir = () => {
    if (!hayCambios) {
      navigation.goBack();
      return;
    }
    Alert.alert('Cambios sin guardar', '¿Quieres salir sin guardar los cambios?', [
      {text: 'Seguir editando', style: 'cancel'},
      {text: 'Salir sin guardar', style: 'destructive', onPress: () => navigation.goBack()},
    ]);
  };

  const ver = k => (tocado[k] ? errores[k] : '');
  const tieneUbicacion = f && f.lat != null && f.lng != null;

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.header}>
        <TouchableOpacity onPress={salir} style={st.back} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={26} color={C.navy} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Perfil del negocio</Text>
        <View style={st.back} />
      </View>

      {cargando || !f ? (
        <View style={st.centro}>
          {cargando ? <ActivityIndicator color={C.navy} /> : <Banner type="error" text={banner.text} actionLabel="Reintentar" onAction={cargar} />}
        </View>
      ) : (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={scrollRef} contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
            <View style={st.fotoFila}>
              <View>
                <Avatar uri={usuario?.image_perfil} size={72} onPress={() => setHojaFoto(true)} label="Cambiar la foto del negocio" />
                <View style={st.fotoBadge} pointerEvents="none">
                  {subiendoFoto ? <ActivityIndicator size="small" color={C.navy} /> : <Camera size={14} color={C.navy} strokeWidth={2.4} />}
                </View>
              </View>
              <View style={{flex: 1}}>
                <Text style={st.title}>Tu negocio</Text>
                <Text style={[st.subtitle, {marginBottom: 0}]}>Lo que ven los conductores en Solvers.</Text>
                <TouchableOpacity onPress={() => setHojaFoto(true)} disabled={subiendoFoto} style={st.fotoLink} accessibilityRole="button">
                  <Text style={st.fotoLinkTexto}>{subiendoFoto ? 'Subiendo foto…' : usuario?.image_perfil ? 'Cambiar foto' : 'Agregar foto'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {pendientes.length ? (
              <View style={st.resumenPendiente}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
                  <Ionicons name="alert-circle" size={20} color={C.navy} />
                  <Text style={st.resumenTitulo}>
                    {pendientes.length === 1 ? 'Te falta 1 dato por completar' : `Te faltan ${pendientes.length} datos por completar`}
                  </Text>
                </View>
                <Text style={st.resumenTexto}>Un perfil completo genera más confianza y más contactos. Toca uno para ir a llenarlo:</Text>
                <View style={st.chipsRow}>
                  {pendientes.map(c => (
                    <TouchableOpacity
                      key={c.key}
                      style={st.resumenChip}
                      onPress={() => irA(c.key)}
                      accessibilityRole="button"
                      accessibilityLabel={`Completar ${c.label}`}>
                      <Text style={st.resumenChipTexto}>{c.label} ›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            <Field label="Nombre del negocio" value={f.nombre} onChangeText={v => set('nombre', v)}
              onBlur={tocar('nombre')} error={ver('nombre')} autoCapitalize="words" />

            <View style={st.soloLectura}>
              <Text style={st.soloLecturaTexto}>RIF: {usuario?.rif || '—'}</Text>
              <Text style={st.soloLecturaTexto}>Correo: {usuario?.email || '—'}</Text>
              <Text style={st.soloLecturaNota}>Para cambiar el RIF o el correo, escríbenos por soporte.</Text>
            </View>

            {falta('descripcion') ? <Seccion titulo="Descripción" pendiente onLayout={marcar('descripcion')} /> : null}
            <Field label="Cuéntale a los conductores sobre tu negocio" placeholder="Ej: 15 años en frenos y suspensión, atendemos todas las marcas."
              value={f.descripcion} onChangeText={v => set('descripcion', v.slice(0, 400))} multiline
              inputStyle={{minHeight: 84, textAlignVertical: 'top'}} help={`${f.descripcion.length}/400`} />

            <Text style={st.seccion}>Contacto</Text>
            {/* Req. 005: un solo número. El servidor lo usa también como WhatsApp. */}
            <PhoneInput label="Teléfono y WhatsApp" value={f.phone} onChange={v => set('phone', v)} onBlur={tocar('phone')} error={ver('phone')}
              help="Los conductores te llaman y te escriben a este número." />

            <Text style={st.seccion} onLayout={marcar('ubicacion')}>Ubicación</Text>
            <Text style={st.label}>Estado</Text>
            <Dropdown
              style={[st.dropdown, ver('estado') ? {borderColor: C.error} : null]}
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
                tocar('estado')();
              }}
            />
            {ver('estado') ? <Text style={st.err}>{ver('estado')}</Text> : <View style={{height: 16}} />}

            <Field label="Dirección" placeholder="Av. Bolívar, local 3, frente a la plaza" value={f.direccion}
              onChangeText={v => set('direccion', v)} onBlur={tocar('direccion')} error={ver('direccion')}
              multiline inputStyle={{minHeight: 56, textAlignVertical: 'top'}} />

            <Text style={st.label}>Ubicación en el mapa{falta('ubicacion') ? <Text style={st.pendienteInline}>  · Pendiente</Text> : null}</Text>
            <TouchableOpacity style={[st.mapBtn, tieneUbicacion ? {borderColor: C.ok} : st.campoPendiente]} onPress={() => setMapVisible(true)} accessibilityRole="button">
              <Ionicons name={tieneUbicacion ? 'location' : 'location-outline'} size={24} color={tieneUbicacion ? C.ok : C.navy} />
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={st.mapTitle}>{tieneUbicacion ? 'Ubicación marcada' : 'Marcar en el mapa'}</Text>
                <Text style={st.mapSub}>{tieneUbicacion ? 'Toca para ajustar el pin.' : 'Toca para mover el pin hasta tu taller.'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.muted} />
            </TouchableOpacity>
            <View style={{height: 16}} />

            <Seccion titulo="Horario de atención" pendiente={falta('horario')} onLayout={marcar('horario')} />
            <View style={st.chipsRow}>
              {PRESETS.map(p => (
                <Chip key={p.label} label={`+ ${p.label}`} onPress={() => {
                  setF(prev => {
                    const h = {...prev.horario};
                    p.dias.forEach(d => (h[d] = {enabled: true, open: p.open, close: p.close}));
                    return {...prev, horario: h};
                  });
                  tocar('horario')();
                }} />
              ))}
            </View>
            <View style={st.chipsRow}>
              {DIAS.map(d => (
                <Chip key={d.key} label={d.label} selected={!!f.horario[d.key]?.enabled} onPress={() => {
                  setF(prev => ({...prev, horario: {...prev.horario, [d.key]: {...prev.horario[d.key], enabled: !prev.horario[d.key]?.enabled}}}));
                  tocar('horario')();
                }} />
              ))}
            </View>
            {DIAS.filter(d => f.horario[d.key]?.enabled).map(d => (
              <View key={d.key} style={st.horaRow}>
                <Text style={st.horaDia}>{d.label}</Text>
                {['open', 'close'].map(k => (
                  <Dropdown key={k} style={st.horaDrop} data={OPCIONES_HORA} labelField="label" valueField="value"
                    value={f.horario[d.key][k]} selectedTextStyle={{fontSize: 15, color: C.text}}
                    onChange={i => setF(prev => ({...prev, horario: {...prev.horario, [d.key]: {...prev.horario[d.key], [k]: i.value}}}))} />
                ))}
              </View>
            ))}
            {ver('horario') ? <Text style={st.err}>{ver('horario')}</Text> : null}

            <Seccion titulo="Métodos de pago que aceptas" pendiente={falta('metodos')} onLayout={marcar('metodos')} />
            <MetodosPago
              seleccion={f.metodos}
              datos={f.metodosDatos}
              onChange={(sel, datos) => setF(prev => ({...prev, metodos: sel, metodosDatos: datos}))}
            />

            <Seccion titulo="Redes sociales" pendiente={falta('redes')} onLayout={marcar('redes')} />
            <Text style={st.notaRedes}>Opcional. Escribe tu usuario (@tunegocio) o el enlace. Solo se muestran en tu perfil las que llenes.</Text>
            <Field label="Instagram" placeholder="@tunegocio" value={f.instagram} onChangeText={v => set('instagram', v)}
              autoCapitalize="none" autoCorrect={false} keyboardType="url" />
            <Field label="Facebook" placeholder="facebook.com/tunegocio" value={f.facebook} onChangeText={v => set('facebook', v)}
              autoCapitalize="none" autoCorrect={false} keyboardType="url" />
            <Field label="TikTok" placeholder="@tunegocio" value={f.tiktok} onChangeText={v => set('tiktok', v)}
              autoCapitalize="none" autoCorrect={false} keyboardType="url" />

            <Seccion titulo="Documentos" pendiente={falta('logo')} />
            <TouchableOpacity style={[st.mapBtn, falta('logo') ? st.campoPendiente : null]} onPress={() => navigation.navigate('DocumentosTaller')} accessibilityRole="button">
              <Ionicons name="document-text-outline" size={24} color={C.navy} />
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={st.mapTitle}>Documentos del negocio</Text>
                <Text style={st.mapSub}>{falta('logo') ? 'Falta tu logo: súbelo aquí.' : 'RIF, fotos del taller y logo.'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.muted} />
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* El aviso va junto al botón: antes quedaba al final del formulario y no se veía. */}
      <View style={st.footer}>
        {banner.text && f && !(banner.type === 'ok' && hayCambios) ? (
          <View style={{marginBottom: 8}}>
            <Banner type={banner.type} text={banner.text} />
          </View>
        ) : null}
        <PrimaryButton
          done={guardado && !hayCambios}
          title={guardando ? 'Guardando…' : guardado && !hayCambios ? 'Guardado' : hayCambios ? 'Guardar cambios' : 'Sin cambios'}
          onPress={guardar}
          loading={guardando}
          disabled={!hayCambios || guardando || cargando}
        />
      </View>

      <BottomSheet visible={hojaFoto} onClose={() => setHojaFoto(false)} title="Foto del negocio">
        <Text style={[st.mapSub, {marginBottom: 12}]}>Es la que ven los conductores en la lista. Puede ser el frente del taller o tu logo.</Text>
        <View style={st.hojaFila}>
          <TouchableOpacity style={st.hojaOpcion} onPress={fotoDesdeCamara} accessibilityRole="button">
            <Camera size={26} color={C.navy} strokeWidth={2.2} />
            <Text style={st.hojaTexto}>Tomar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.hojaOpcion} onPress={fotoDesdeGaleria} accessibilityRole="button">
            <ImageIcon size={26} color={C.navy} strokeWidth={2.2} />
            <Text style={st.hojaTexto}>Elegir de la galería</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {f ? (
        <LocationPicker
          visible={mapVisible}
          lat={f.lat}
          lng={f.lng}
          onClose={() => setMapVisible(false)}
          onConfirm={({lat, lng}) => {
            setF(prev => ({...prev, lat, lng}));
            setMapVisible(false);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, height: 52},
  back: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {fontSize: 16, fontWeight: '700', color: C.navy},
  centro: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20},
  body: {paddingHorizontal: 20, paddingBottom: 24},
  title: {fontSize: 26, fontWeight: '800', color: C.navy, marginTop: 8},
  subtitle: {fontSize: 15, color: C.muted, marginTop: 4, marginBottom: 18},
  notaRedes: {fontSize: 13, color: C.muted, marginTop: -6, marginBottom: 10},
  seccion: {fontSize: 18, fontWeight: '800', color: C.navy, marginTop: 20, marginBottom: 12},
  label: {fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 8},
  err: {fontSize: 13, color: C.error, marginTop: 6, marginBottom: 12, fontWeight: '600'},
  soloLectura: {backgroundColor: C.bg, borderRadius: 14, padding: 14, marginBottom: 16},
  soloLecturaTexto: {fontSize: 15, color: C.text, fontWeight: '600', marginBottom: 2},
  soloLecturaNota: {fontSize: 13, color: C.muted, marginTop: 4},
  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4},
  dropdown: {minHeight: 52, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 14},
  mapBtn: {flexDirection: 'row', alignItems: 'center', minHeight: 64, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 14},
  mapTitle: {fontSize: 16, fontWeight: '700', color: C.navy},
  mapSub: {fontSize: 13, color: C.muted, marginTop: 2},
  horaRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  horaDia: {width: 48, fontSize: 15, fontWeight: '700', color: C.navy},
  horaDrop: {flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 12, marginRight: 8},
  seccionFila: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 12},
  pendiente: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4CC', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8},
  pendientePunto: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5484D', marginRight: 6},
  pendienteTexto: {fontSize: 12, fontWeight: '800', color: '#7A5B00'},
  pendienteInline: {fontSize: 13, fontWeight: '800', color: '#B7791F'},
  campoPendiente: {borderColor: '#FCC800', backgroundColor: '#FFFBEA'},
  resumenPendiente: {backgroundColor: '#FFF8DB', borderRadius: 16, borderWidth: 1.5, borderColor: '#FCC800', padding: 14, marginBottom: 18},
  resumenTitulo: {fontSize: 16, fontWeight: '800', color: C.navy, marginLeft: 8, flexShrink: 1},
  resumenTexto: {fontSize: 14, color: C.text, marginBottom: 10},
  resumenChip: {backgroundColor: '#FFFFFF', borderRadius: 999, borderWidth: 1, borderColor: '#F0D46A', paddingHorizontal: 10, paddingVertical: 5, marginRight: 6, marginBottom: 6},
  resumenChipTexto: {fontSize: 13, fontWeight: '700', color: C.navy},
  fotoFila: {flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8, marginBottom: 18},
  fotoBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.yellow,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoLink: {minHeight: 36, justifyContent: 'center', alignSelf: 'flex-start'},
  fotoLinkTexto: {fontSize: 15, fontWeight: '700', color: C.blue},
  hojaFila: {flexDirection: 'row', gap: 12, marginBottom: 8},
  hojaOpcion: {flex: 1, minHeight: 96, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12},
  hojaTexto: {fontSize: 14, fontWeight: '700', color: C.navy, textAlign: 'center'},
  footer: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: C.border},
});

export default PerfilNegocio;
