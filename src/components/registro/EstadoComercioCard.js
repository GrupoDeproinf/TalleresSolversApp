// Tarjeta de estado del comercio después de enviar el registro.
// Dice en qué va la revisión, qué falta y qué hacer, en vez de un texto suelto
// "En espera de documentos".
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {C, PrimaryButton} from './ui';

// Tiempo que se le promete al taller. Ajustar si el equipo de revisión cambia.
export const TIEMPO_REVISION = '1 a 2 días hábiles';

export const DOCUMENTOS_REQUERIDOS = [
  {key: 'rifIdFiscal', label: 'RIF'},
  {key: 'fotoFrenteTaller', label: 'Foto del frente del taller'},
  {key: 'fotoInternaTaller', label: 'Foto del interior del taller'},
];

const tieneValor = v => typeof v === 'string' ? v.trim() !== '' : !!v;

export const documentosFaltantes = user =>
  DOCUMENTOS_REQUERIDOS.filter(d => !tieneValor(user?.[d.key])).map(d => d.label);

const toDate = v => {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  if (typeof v._seconds === 'number') return new Date(v._seconds * 1000);
  if (typeof v.seconds === 'number') return new Date(v.seconds * 1000);
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

/** Devuelve el estado a mostrar o null si no hay nada que avisar. */
export const estadoComercio = user => {
  if (!user || user.typeUser !== 'Taller') return null;
  const faltan = documentosFaltantes(user);
  const status = user.status;
  if (status === 'Rechazado') return {tipo: 'rechazado', faltan};
  if (status === 'Aprobado') {
    const inicio = toDate(user?.subscripcion_actual?.fecha_inicio);
    const dias = inicio ? (Date.now() - inicio.getTime()) / 86400000 : 99;
    return dias <= 7 ? {tipo: 'aprobado', faltan: [], inicio} : null;
  }
  if (faltan.length || status === 'En espera de documentos') return {tipo: 'faltan', faltan};
  return {tipo: 'revision', faltan: []};
};

const ESTILO = {
  revision: {icon: 'time-outline', fg: C.warn, bg: C.warnBg, titulo: 'En revisión'},
  faltan: {icon: 'document-attach-outline', fg: C.error, bg: C.errorBg, titulo: 'Falta un documento'},
  aprobado: {icon: 'checkmark-circle', fg: C.ok, bg: C.okBg, titulo: '¡Aprobado!'},
  rechazado: {icon: 'close-circle', fg: C.error, bg: C.errorBg, titulo: 'Necesitamos una corrección'},
};

const EstadoComercioCard = ({user, onSubirDocumentos, onCorregir, style}) => {
  const estado = estadoComercio(user);
  if (!estado) return null;
  const e = ESTILO[estado.tipo];
  const dias = user?.subscripcion_actual?.vigencia;

  let cuerpo = null;
  let accion = null;
  if (estado.tipo === 'revision') {
    cuerpo = `Recibimos todo. Revisamos tu negocio en ${TIEMPO_REVISION} y te avisamos por notificación y correo.`;
  } else if (estado.tipo === 'faltan') {
    const lista = estado.faltan.length ? estado.faltan.join(', ') : 'tus documentos';
    cuerpo = `Para revisar tu negocio nos falta: ${lista}. Súbelo y entras a revisión.`;
    accion = {label: estado.faltan.length > 1 ? 'Subir documentos' : 'Subir documento', onPress: onSubirDocumentos};
  } else if (estado.tipo === 'aprobado') {
    cuerpo = `Tu negocio ya está visible para los conductores. Tu plan gratuito${
      dias ? ` de ${dias} días` : ''
    } empezó a contar desde la aprobación.`;
  } else if (estado.tipo === 'rechazado') {
    const motivo = String(user?.motivoRechazo || '').trim();
    cuerpo = motivo
      ? `Motivo: ${motivo}. Corrígelo y lo volvemos a revisar.`
      : 'Revisa tus datos y documentos; si tienes dudas escríbenos por WhatsApp.';
    accion = {label: 'Corregir mis datos', onPress: onCorregir};
  }

  return (
    <View style={[st.card, {borderColor: e.fg}, style]} accessibilityRole="summary">
      <View style={[st.head, {backgroundColor: e.bg}]}>
        <Ionicons name={e.icon} size={22} color={e.fg} />
        <Text style={[st.title, {color: e.fg}]}>{e.titulo}</Text>
      </View>
      <Text style={st.body}>{cuerpo}</Text>
      {accion && accion.onPress ? (
        <PrimaryButton title={accion.label} onPress={accion.onPress} style={{marginTop: 12}} />
      ) : null}
    </View>
  );
};

const st = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  title: {fontSize: 15, fontWeight: '800'},
  body: {fontSize: 15, color: C.text, lineHeight: 22, marginTop: 10},
});

export default EstadoComercioCard;
