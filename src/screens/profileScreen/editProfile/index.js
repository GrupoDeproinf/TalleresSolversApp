// Datos personales del conductor.
//
// Rediseño con las mismas piezas del registro y del perfil del negocio:
// - La cédula y el estado son opcionales. El registro nuevo no los pide, y
//   antes esta pantalla los exigía: el conductor no podía ni cambiar su foto,
//   y el error solo decía "validar formulario".
// - Cada error dice qué campo es y cómo arreglarlo.
// - "Guardar" se activa solo si hay cambios, y avisa al salir sin guardar.
// - La foto se elige de la galería o la cámara (antes también aceptaba
//   cualquier archivo, y la "X" no la borraba de verdad).
// Los talleres editan su perfil en PerfilNegocio.
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {Camera, Image as ImageIcon} from 'lucide-react-native';

import api from '../../../../axiosInstance';
import {C, Field, PrimaryButton, Banner} from '../../../components/registro/ui';
import {validarNombre, validarTelefono, normalizarTelefono} from '../../../components/registro/validators';
import PhoneInput from '../../../ui/PhoneInput';
import {BottomSheet} from '../../../ui';
import {Avatar} from '../../../ui/cuenta';
import {splitDocumentId} from '../../../utils/documentId';
import {sanitizeUserInfo} from '../../../utils/sanitizeUserInfo';
import {esCuentaTaller} from '../../../utils/modoApp';

const ESTADOS = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo',
  'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira',
  'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre',
  'Táchira', 'Trujillo', 'Yaracuy', 'Zulia',
].map(e => ({label: e, value: e}));

// Documentos de una persona: venezolano, extranjero o pasaporte.
const PREFIJOS_PERSONA = ['V', 'E', 'P'];

const OPCIONES_FOTO = {mediaType: 'photo', includeBase64: true, maxWidth: 1024, maxHeight: 1024, quality: 0.8};

const formularioDesde = u => {
  const [prefijo, numero] = splitDocumentId(u?.cedula);
  return {
    nombre: String(u?.nombre || ''),
    prefijo: prefijo || 'V',
    cedula: String(numero || '').replace(/\D/g, ''),
    phone: String(u?.phone || ''),
    estado: String(u?.estado || ''),
  };
};

const EditProfile = ({navigation}) => {
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [original, setOriginal] = useState(null);
  const [f, setF] = useState(null);
  const [foto, setFoto] = useState({uri: '', base64: '', anterior: ''});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [hojaFoto, setHojaFoto] = useState(false);
  const [tocado, setTocado] = useState({});
  const [banner, setBanner] = useState({type: 'error', text: ''});

  const set = (k, v) => {
    setGuardado(false);
    setF(prev => ({...prev, [k]: v}));
  };
  const tocar = k => () => setTocado(t => ({...t, [k]: true}));

  const cargar = useCallback(async () => {
    setCargando(true);
    setBanner({type: 'error', text: ''});
    try {
      const raw = await AsyncStorage.getItem('@userInfo');
      const local = raw ? JSON.parse(raw) : {};
      if (esCuentaTaller(local)) {
        // El negocio tiene su propia pantalla (también en modo conductor: los
        // datos de la cuenta son los del negocio).
        navigation.replace('PerfilNegocio');
        return;
      }
      const id = String(local?.uid || '');
      setUid(id);
      let datos = local;
      try {
        const {data} = await api.post('/usuarios/getUserByUid', {uid: id});
        if (data?.userData) datos = {...local, ...data.userData};
      } catch (e) {
        // Sin conexión: se muestra lo último guardado en el teléfono.
      }
      const form = formularioDesde(datos);
      setEmail(String(datos?.email || ''));
      setFoto({uri: datos?.image_perfil || '', base64: '', anterior: datos?.image_perfil || ''});
      setOriginal(form);
      setF(form);
    } catch (e) {
      setBanner({type: 'error', text: 'No pudimos cargar tus datos. Revisa tu conexión e intenta de nuevo.'});
    } finally {
      setCargando(false);
    }
  }, [navigation]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const errores = useMemo(() => {
    if (!f) return {};
    const ced = f.cedula.trim();
    return {
      nombre: validarNombre(f.nombre, 'tu nombre y apellido'),
      phone: validarTelefono(f.phone),
      cedula: ced && (ced.length < 5 || ced.length > 10) ? 'Revisa el número: debe tener entre 5 y 10 dígitos.' : '',
    };
  }, [f]);

  const tel = v => normalizarTelefono(v || '');
  const hayCambios = useMemo(() => {
    if (!f || !original) return false;
    return (
      !!foto.base64 ||
      f.nombre.trim() !== original.nombre.trim() ||
      tel(f.phone) !== tel(original.phone) ||
      f.estado !== original.estado ||
      (f.cedula.trim() ? `${f.prefijo}${f.cedula}` : '') !== (original.cedula ? `${original.prefijo}${original.cedula}` : '')
    );
  }, [f, original, foto.base64]);

  // Solo se valida lo que cambió: un dato viejo con otro formato que el
  // conductor no tocó no le impide guardar su foto, por ejemplo.
  const primerError = !f || !original
    ? ''
    : [
        f.nombre.trim() !== original.nombre.trim() ? errores.nombre : '',
        tel(f.phone) !== tel(original.phone) ? errores.phone : '',
        f.cedula !== original.cedula ? errores.cedula : '',
      ].find(Boolean);

  const guardar = async () => {
    if (!uid || !hayCambios || guardando) return;
    if (primerError) {
      setTocado({nombre: true, phone: true, cedula: true});
      setBanner({type: 'error', text: primerError});
      return;
    }
    setGuardando(true);
    setBanner({type: 'error', text: ''});
    const phone = tel(f.phone);
    try {
      // El teléfono no puede estar en otra cuenta (el servidor responde 409).
      if (phone !== tel(original.phone)) {
        try {
          await api.post('/home/validatePhone', {phone, uid});
        } catch (e) {
          if (e?.response?.status === 409) {
            setTocado(t => ({...t, phone: true}));
            throw {amable: 'Ese teléfono ya está registrado en otra cuenta. Usa otro número.'};
          }
          throw e;
        }
      }
      const cedula = f.cedula.trim() ? `${f.prefijo}-${f.cedula.trim()}` : '';
      const anteriorNombre = foto.anterior ? String(foto.anterior).split('/').pop() : '';
      const datos = {
        Nombre: f.nombre.trim(),
        cedula,
        phone,
        typeUser: 'Cliente',
        email,
        uid,
        estado: f.estado,
        base64: foto.base64 || '',
        imageTodelete: foto.base64 && anteriorNombre ? anteriorNombre : '',
      };
      await api.post('/usuarios/UpdateClient', datos, {timeout: 30000});
      // El servidor no devuelve el enlace de la foto nueva: se vuelve a leer.
      let nuevaFoto = null;
      if (foto.base64) {
        try {
          const {data} = await api.post('/usuarios/getUserByUid', {uid});
          nuevaFoto = data?.userData?.image_perfil || null;
        } catch (e) {
          nuevaFoto = null;
        }
      }

      try {
        const raw = await AsyncStorage.getItem('@userInfo');
        const prev = raw ? JSON.parse(raw) : {};
        const {base64, imageTodelete, Nombre, ...resto} = datos;
        const fusion = sanitizeUserInfo({
          ...prev,
          ...resto,
          nombre: Nombre,
          ...(nuevaFoto ? {image_perfil: nuevaFoto} : {}),
        });
        await AsyncStorage.setItem('@userInfo', JSON.stringify(fusion));
      } catch (e) {
        // Si falla el guardado local, Mi perfil igual lo trae del servidor.
      }

      setOriginal(f);
      setFoto(p => ({uri: nuevaFoto || p.uri, base64: '', anterior: nuevaFoto || p.uri}));
      setGuardado(true);
      setBanner({type: 'ok', text: 'Listo, guardamos tus datos.'});
    } catch (e) {
      setBanner({
        type: 'error',
        text: e?.amable || e?.response?.data?.message || 'No pudimos guardar. Revisa tu conexión y toca Guardar de nuevo.',
      });
    } finally {
      setGuardando(false);
    }
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

  const usarFoto = r => {
    if (r?.didCancel || r?.errorCode) return;
    const a = r?.assets?.[0];
    if (!a?.base64) return;
    setGuardado(false);
    setFoto(p => ({...p, uri: a.uri, base64: a.base64}));
  };

  const desdeGaleria = () => {
    setHojaFoto(false);
    setTimeout(() => launchImageLibrary({...OPCIONES_FOTO, selectionLimit: 1}, usarFoto), 400);
  };

  const desdeCamara = () => {
    setHojaFoto(false);
    setTimeout(async () => {
      if (Platform.OS === 'android') {
        const ok = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (ok !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Solvers', 'Para tomar la foto, permite el uso de la cámara en los ajustes del teléfono.');
          return;
        }
      }
      launchCamera({...OPCIONES_FOTO, cameraType: 'front'}, usarFoto);
    }, 400);
  };

  const ver = k => (tocado[k] ? errores[k] : '');
  const prefijos = PREFIJOS_PERSONA.includes(f?.prefijo) ? PREFIJOS_PERSONA : [...PREFIJOS_PERSONA, f?.prefijo].filter(Boolean);

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.header}>
        <TouchableOpacity onPress={salir} style={st.back} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={26} color={C.navy} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Datos personales</Text>
        <View style={st.back} />
      </View>

      {cargando || !f ? (
        <View style={st.centro}>
          {cargando ? (
            <ActivityIndicator color={C.navy} />
          ) : (
            <Banner type="error" text={banner.text} actionLabel="Reintentar" onAction={cargar} />
          )}
        </View>
      ) : (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
            {/* Foto */}
            <View style={st.fotoBloque}>
              <View>
                <Avatar uri={foto.uri} size={96} onPress={() => setHojaFoto(true)} label="Cambiar foto de perfil" />
                <View style={st.fotoBadge} pointerEvents="none">
                  <Camera size={16} color={C.navy} strokeWidth={2.4} />
                </View>
              </View>
              <TouchableOpacity onPress={() => setHojaFoto(true)} style={st.fotoLink} accessibilityRole="button">
                <Text style={st.fotoLinkTexto}>{foto.uri ? 'Cambiar foto' : 'Agregar foto'}</Text>
              </TouchableOpacity>
              {foto.base64 ? <Text style={st.nota}>Foto nueva lista. Toca Guardar para subirla.</Text> : null}
            </View>

            <Field
              label="Nombre y apellido"
              value={f.nombre}
              onChangeText={v => set('nombre', v)}
              onBlur={tocar('nombre')}
              error={ver('nombre')}
              autoCapitalize="words"
              textContentType="name"
            />

            <PhoneInput
              label="Teléfono"
              value={f.phone}
              onChange={v => set('phone', v)}
              onBlur={tocar('phone')}
              error={ver('phone')}
              help="Los talleres te contactan a este número."
            />

            <Text style={st.label}>
              Cédula <Text style={st.opcional}>(opcional)</Text>
            </Text>
            <View style={st.cedulaFila}>
              <Dropdown
                style={st.prefijo}
                data={prefijos.map(p => ({label: `${p}-`, value: p}))}
                labelField="label"
                valueField="value"
                value={f.prefijo}
                selectedTextStyle={{color: C.text, fontSize: 16}}
                onChange={i => set('prefijo', i.value)}
                accessibilityLabel="Tipo de documento"
              />
              <Field
                style={{flex: 1, marginBottom: 0}}
                placeholder="12345678"
                value={f.cedula}
                onChangeText={v => set('cedula', v.replace(/\D/g, '').slice(0, 10))}
                onBlur={tocar('cedula')}
                keyboardType="number-pad"
                accessibilityLabel="Número de cédula"
              />
            </View>
            {ver('cedula') ? (
              <Text style={st.err}>{ver('cedula')}</Text>
            ) : (
              <Text style={st.ayuda}>Algunos talleres la piden para emitir la factura.</Text>
            )}

            <Text style={st.label}>
              Estado donde vives <Text style={st.opcional}>(opcional)</Text>
            </Text>
            <Dropdown
              style={st.dropdown}
              data={ESTADOS}
              labelField="label"
              valueField="value"
              value={f.estado}
              placeholder="Elige el estado"
              placeholderStyle={{color: '#9AA0B4', fontSize: 16}}
              selectedTextStyle={{color: C.text, fontSize: 16}}
              search
              searchPlaceholder="Buscar…"
              onChange={i => set('estado', i.value)}
            />
            <Text style={st.ayuda}>Te mostramos primero los talleres de tu zona.</Text>

            <View style={st.soloLectura}>
              <Text style={st.soloLecturaTexto}>Correo: {email || '—'}</Text>
              <Text style={st.soloLecturaNota}>Es con el que inicias sesión. Para cambiarlo, escríbenos por soporte.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* El aviso va junto al botón para que siempre se vea. */}
      <View style={st.footer}>
        {banner.text && f && !(banner.type === 'ok' && hayCambios) ? (
          <View style={{marginBottom: 8}}>
            <Banner type={banner.type} text={banner.text} />
          </View>
        ) : null}
        <PrimaryButton
          title={guardando ? 'Guardando…' : guardado && !hayCambios ? 'Guardado' : hayCambios ? 'Guardar cambios' : 'Sin cambios'}
          done={guardado && !hayCambios}
          onPress={guardar}
          loading={guardando}
          disabled={!hayCambios || guardando || cargando}
        />
      </View>

      <BottomSheet visible={hojaFoto} onClose={() => setHojaFoto(false)} title="Foto de perfil">
        <View style={st.hojaFila}>
          <TouchableOpacity style={st.hojaOpcion} onPress={desdeCamara} accessibilityRole="button">
            <Camera size={26} color={C.navy} strokeWidth={2.2} />
            <Text style={st.hojaTexto}>Tomar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.hojaOpcion} onPress={desdeGaleria} accessibilityRole="button">
            <ImageIcon size={26} color={C.navy} strokeWidth={2.2} />
            <Text style={st.hojaTexto}>Elegir de la galería</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
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
  fotoBloque: {alignItems: 'center', marginTop: 8, marginBottom: 20},
  fotoBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.yellow,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoLink: {minHeight: 44, justifyContent: 'center', paddingHorizontal: 12},
  fotoLinkTexto: {fontSize: 15, fontWeight: '700', color: C.blue},
  nota: {fontSize: 13, color: C.ok, fontWeight: '600'},
  label: {fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 8},
  opcional: {fontSize: 13, fontWeight: '500', color: C.muted},
  ayuda: {fontSize: 13, color: C.muted, marginTop: 6, marginBottom: 16},
  err: {fontSize: 13, color: C.error, marginTop: 6, marginBottom: 16, fontWeight: '600'},
  cedulaFila: {flexDirection: 'row', alignItems: 'center', gap: 8},
  prefijo: {width: 84, minHeight: 52, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 12},
  dropdown: {minHeight: 52, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 14},
  soloLectura: {backgroundColor: C.bg, borderRadius: 14, padding: 14, marginTop: 4},
  soloLecturaTexto: {fontSize: 15, color: C.text, fontWeight: '600', marginBottom: 2},
  soloLecturaNota: {fontSize: 13, color: C.muted, marginTop: 4},
  footer: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: C.border},
  hojaFila: {flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8},
  hojaOpcion: {
    flex: 1,
    minHeight: 96,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  hojaTexto: {fontSize: 14, fontWeight: '700', color: C.navy, textAlign: 'center'},
});

export default EditProfile;
