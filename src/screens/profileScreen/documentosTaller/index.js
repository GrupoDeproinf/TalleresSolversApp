// Documentos del negocio: pantalla única para subir lo que falta.
//
// A esta pantalla llega el taller desde el aviso "Falta un documento". Antes
// ese botón abría el editor completo de 7 pasos, donde había que avanzar
// hasta encontrar los documentos. Aquí solo están los documentos, con el
// mismo diseño del registro.
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../../../axiosInstance';
import {C, PrimaryButton, Banner} from '../../../components/registro/ui';
import {elegirArchivo, archivoABase64} from '../../../components/registro/mediaPicker';

const DOCS = [
  {key: 'rifIdFiscal', label: 'RIF', help: 'Foto o PDF legible del RIF vigente.', required: true, pdf: true},
  {key: 'fotoFrenteTaller', label: 'Frente del taller', help: 'Que se vea la fachada o el letrero.', required: true},
  {key: 'fotoInternaTaller', label: 'Interior del taller', help: 'El área de trabajo.', required: true},
  {key: 'logotipoNegocio', label: 'Logo del negocio', help: 'Opcional. Se muestra a los conductores.'},
];
// El servidor espera recibir todos los campos de documentos: los que no se
// envían los guarda vacíos. Por eso se reenvía también el que no se muestra.
const CAMPOS_SERVIDOR = [...DOCS.map(d => d.key), 'permisoOperacion'];

const urlDe = v => {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object') return String(v.url || v.uri || '').trim();
  return '';
};

const DocumentosTaller = ({navigation}) => {
  const [uid, setUid] = useState('');
  const [guardados, setGuardados] = useState({}); // documentos ya en el servidor (URL)
  const [nuevos, setNuevos] = useState({}); // archivos elegidos ahora
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [pickerFor, setPickerFor] = useState(null);
  const [banner, setBanner] = useState({type: 'error', text: ''});
  const [rifAviso, setRifAviso] = useState(null);

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
        // Sin conexión: se muestra lo último que se conoce del teléfono.
      }
      setGuardados(CAMPOS_SERVIDOR.reduce((acc, k) => ({...acc, [k]: urlDe(datos?.[k])}), {}));
    } catch (e) {
      setBanner({type: 'error', text: 'No pudimos cargar tus documentos. Revisa tu conexión e intenta de nuevo.'});
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const elegir = async source => {
    const key = pickerFor;
    setPickerFor(null);
    if (!key) return;
    // Esperar a que cierre la hoja antes de abrir cámara/galería (iOS).
    await new Promise(r => setTimeout(r, 350));
    try {
      const file = await elegirArchivo(source);
      if (file) {
        setNuevos(prev => ({...prev, [key]: file}));
        setBanner({type: 'error', text: ''});
        if (key === 'rifIdFiscal') setRifAviso(null);
      }
    } catch (e) {
      setBanner({type: 'error', text: e.friendly || 'No pudimos abrir el archivo. Intenta con otra foto.'});
    }
  };

  const quitar = key =>
    setNuevos(prev => {
      const copia = {...prev};
      delete copia[key];
      return copia;
    });

  const faltantes = DOCS.filter(d => d.required && !nuevos[d.key] && !guardados[d.key]).map(d => d.label);
  const hayCambios = Object.keys(nuevos).length > 0;

  const guardar = async () => {
    if (!uid || !hayCambios || enviando) return;
    setEnviando(true);
    setBanner({type: 'error', text: ''});
    try {
      const cuerpo = {uid};
      for (const k of CAMPOS_SERVIDOR) {
        cuerpo[k] = nuevos[k] ? await archivoABase64(nuevos[k].uri) : guardados[k] || '';
      }
      await api.post('/usuarios/UpdateTallerUsuarioDocs', cuerpo, {timeout: 90000});

      // Traer el estado nuevo (documentos, estatus y verificación del RIF).
      let actualizado = null;
      try {
        const {data} = await api.post('/usuarios/getUserByUid', {uid});
        actualizado = data?.userData || null;
      } catch (e) {}
      if (actualizado) {
        const raw = await AsyncStorage.getItem('@userInfo');
        const local = raw ? JSON.parse(raw) : {};
        await AsyncStorage.setItem('@userInfo', JSON.stringify({...local, ...actualizado}));
        setGuardados(CAMPOS_SERVIDOR.reduce((acc, k) => ({...acc, [k]: urlDe(actualizado[k])}), {}));
        if (nuevos.rifIdFiscal && actualizado.rif_verificacion?.estado) {
          setRifAviso(actualizado.rif_verificacion);
        }
      }
      setNuevos({});
      const quedan = DOCS.filter(d => d.required && !urlDe((actualizado || {})[d.key]) && !nuevos[d.key]).length;
      setBanner({
        type: 'ok',
        text: quedan
          ? 'Guardado. Cuando subas lo que falta, tu negocio entra a revisión.'
          : 'Recibimos tus documentos. Tu negocio entró a revisión; te avisamos por notificación y correo.',
      });
    } catch (e) {
      setBanner({
        type: 'error',
        text: e?.response?.data?.message || 'No pudimos guardar tus documentos. Revisa tu conexión y toca Guardar de nuevo.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={26} color={C.navy} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Documentos del negocio</Text>
        <View style={st.back} />
      </View>

      {cargando ? (
        <View style={st.centro}>
          <ActivityIndicator color={C.navy} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
          <Text style={st.title}>Sube lo que falta</Text>
          <Text style={st.subtitle}>Con estos documentos revisamos y aprobamos tu negocio.</Text>

          {DOCS.map(d => {
            const nuevo = nuevos[d.key];
            const yaSubido = !nuevo && !!guardados[d.key];
            const listo = !!nuevo || yaSubido;
            const esImagen = nuevo?.type?.startsWith('image/');
            return (
              <View key={d.key} style={[st.docRow, listo ? {borderColor: C.ok} : null]}>
                {nuevo && esImagen ? (
                  <Image source={{uri: nuevo.uri}} style={st.docThumb} />
                ) : (
                  <View style={[st.docThumb, st.docThumbEmpty]}>
                    <Ionicons
                      name={listo ? 'document-text' : d.required ? 'camera-outline' : 'add'}
                      size={24}
                      color={listo ? C.ok : C.muted}
                    />
                  </View>
                )}
                <View style={{flex: 1, marginHorizontal: 12}}>
                  <Text style={st.docTitle}>
                    {d.label} {d.required ? <Text style={st.req}>*</Text> : <Text style={st.opt}>(opcional)</Text>}
                  </Text>
                  <Text style={[st.docHelp, listo && {color: C.ok}]}>
                    {nuevo ? `✓ ${nuevo.name || 'Listo para guardar'}` : yaSubido ? '✓ Ya lo recibimos' : d.help}
                  </Text>
                  {d.key === 'rifIdFiscal' && rifAviso?.estado && rifAviso.estado !== 'no_legible' ? (
                    <Text style={[st.docHelp, {marginTop: 4, color: rifAviso.estado === 'verificado' ? C.ok : C.error}]}>
                      {rifAviso.mensaje}
                    </Text>
                  ) : null}
                </View>
                {nuevo ? (
                  <TouchableOpacity onPress={() => quitar(d.key)} style={st.docAction} accessibilityLabel={`Quitar ${d.label}`}>
                    <Ionicons name="trash-outline" size={22} color={C.error} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setPickerFor(d.key)} style={st.docAction} accessibilityLabel={`${yaSubido ? 'Cambiar' : 'Subir'} ${d.label}`}>
                    <Text style={st.docActionText}>{yaSubido ? 'Cambiar' : 'Subir'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {faltantes.length && !banner.text ? (
            <Banner type="warn" text={`Aún falta: ${faltantes.join(', ')}.`} />
          ) : null}
          <Banner type={banner.type} text={banner.text} />
        </ScrollView>
      )}

      <View style={st.footer}>
        <PrimaryButton
          title={enviando ? 'Guardando…' : 'Guardar documentos'}
          onPress={guardar}
          loading={enviando}
          disabled={!hayCambios || enviando || cargando}
        />
      </View>

      <Modal visible={!!pickerFor} transparent animationType="fade" onRequestClose={() => setPickerFor(null)}>
        <TouchableOpacity style={st.sheetBg} activeOpacity={1} onPress={() => setPickerFor(null)}>
          <View style={st.sheet}>
            <Text style={st.sheetTitle}>{DOCS.find(d => d.key === pickerFor)?.label}</Text>
            {[
              ['camera', 'camera-outline', 'Tomar foto'],
              ['gallery', 'images-outline', 'Elegir de la galería'],
              ...(DOCS.find(d => d.key === pickerFor)?.pdf ? [['pdf', 'document-outline', 'Subir PDF']] : []),
            ].map(([src, icon, label]) => (
              <TouchableOpacity key={src} style={st.sheetItem} onPress={() => elegir(src)} accessibilityRole="button">
                <Ionicons name={icon} size={24} color={C.navy} />
                <Text style={st.sheetText}>{label}</Text>
              </TouchableOpacity>
            ))}
            <PrimaryButton title="Cancelar" variant="secondary" onPress={() => setPickerFor(null)} style={{marginTop: 8}} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, height: 52},
  back: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {fontSize: 16, fontWeight: '700', color: C.navy},
  centro: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  body: {paddingHorizontal: 20, paddingBottom: 24},
  title: {fontSize: 26, fontWeight: '800', color: C.navy, marginTop: 8},
  subtitle: {fontSize: 15, color: C.muted, marginTop: 4, marginBottom: 18},
  opt: {fontWeight: '400', color: C.muted},
  req: {color: C.error},
  docRow: {flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 10, marginBottom: 10},
  docThumb: {width: 52, height: 52, borderRadius: 10},
  docThumbEmpty: {backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center'},
  docTitle: {fontSize: 15, fontWeight: '700', color: C.navy},
  docHelp: {fontSize: 13, color: C.muted, marginTop: 2},
  docAction: {minWidth: 64, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
  docActionText: {color: C.blue, fontWeight: '800', fontSize: 15},
  footer: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: C.border},
  sheetBg: {flex: 1, backgroundColor: 'rgba(13,14,45,0.55)', justifyContent: 'flex-end'},
  sheet: {backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20},
  sheetTitle: {fontSize: 17, fontWeight: '800', color: C.navy, marginBottom: 8},
  sheetItem: {flexDirection: 'row', alignItems: 'center', minHeight: 52},
  sheetText: {fontSize: 16, color: C.navy, marginLeft: 14, fontWeight: '600'},
});

export default DocumentosTaller;
