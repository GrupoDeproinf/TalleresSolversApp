// Tarjeta de una cita, compartida por "Mis citas" (conductor) y "Agenda"
// (taller). Muestra qué pasa y qué sigue, con las acciones que corresponden.
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Clock, Car, MessageCircle, StickyNote} from 'lucide-react-native';
import {AppText, Button, Card, Tag, colors, space} from '../../ui';
import {ESTADOS, cuandoCita, vehiculoTexto} from './citasApi';

const CitaCard = ({cita, vista, onAccion, ocupado, onWhatsApp}) => {
  const e = ESTADOS[cita.estado] || {label: cita.estado, tone: 'neutral'};
  const titulo = vista === 'taller' ? cita.nombre_usuario || 'Conductor' : cita.nombre_taller || 'Taller';
  const v = vehiculoTexto(cita.vehiculo || {});
  const acciones = [];
  if (vista === 'conductor') {
    if (['pendiente', 'confirmada'].includes(cita.estado)) {
      acciones.push({accion: 'reprogramar', title: 'Cambiar fecha', variant: 'secondary'});
      acciones.push({accion: 'cancelar', title: 'Cancelar', variant: 'ghost'});
    }
  } else {
    if (cita.estado === 'pendiente') {
      acciones.push({accion: 'confirmar', title: 'Confirmar', variant: 'accent'});
      acciones.push({accion: 'rechazar', title: 'No puedo', variant: 'ghost'});
    }
    if (cita.estado === 'confirmada') {
      acciones.push({accion: 'completar', title: 'Atendido', variant: 'primary'});
      acciones.push({accion: 'reprogramar', title: 'Mover', variant: 'secondary'});
    }
  }
  const siguiente =
    vista === 'conductor'
      ? {pendiente: 'Esperando que el taller confirme.', confirmada: 'Te recordamos un día antes.'}[cita.estado]
      : {pendiente: 'Confirma o avisa si no puedes.', confirmada: 'Márcala como atendida al terminar.'}[cita.estado];

  return (
    <Card style={st.card}>
      <View style={st.fila}>
        <View style={{flex: 1}}>
          <AppText variant="subtitle" numberOfLines={1}>
            {titulo}
          </AppText>
          {cita.nombre_servicio ? (
            <AppText variant="caption" color={colors.muted} numberOfLines={1}>
              {cita.nombre_servicio}
            </AppText>
          ) : null}
        </View>
        <Tag label={e.label} tone={e.tone} />
      </View>
      <Linea icon={Clock} texto={cuandoCita(cita)} fuerte />
      {v ? <Linea icon={Car} texto={v} /> : null}
      {cita.nota ? <Linea icon={StickyNote} texto={cita.nota} /> : null}
      {cita.motivo && ['rechazada', 'cancelada'].includes(cita.estado) ? (
        <AppText variant="caption" color={colors.error} style={{marginTop: space.xs}}>
          Motivo: {cita.motivo}
        </AppText>
      ) : null}
      {siguiente ? (
        <AppText variant="caption" color={colors.muted} style={{marginTop: space.s}}>
          {siguiente}
        </AppText>
      ) : null}
      {acciones.length || onWhatsApp ? (
        <View style={st.acciones}>
          {acciones.map(a => (
            <Button
              key={a.accion}
              size="m"
              title={a.title}
              variant={a.variant}
              loading={ocupado === a.accion}
              disabled={!!ocupado && ocupado !== a.accion}
              onPress={() => onAccion(cita, a.accion)}
              style={{flex: 1}}
            />
          ))}
          {onWhatsApp ? (
            <Button size="m" title="WhatsApp" icon={MessageCircle} variant="secondary" onPress={() => onWhatsApp(cita)} style={{flex: acciones.length ? 0 : 1}} />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
};

const Linea = ({icon: Icon, texto, fuerte}) => (
  <View style={st.linea}>
    <Icon size={16} color={fuerte ? colors.navy : colors.muted} strokeWidth={2.2} />
    <AppText variant={fuerte ? 'subtitle' : 'body'} color={fuerte ? colors.navy : colors.muted} style={{flex: 1}} numberOfLines={2}>
      {texto}
    </AppText>
  </View>
);

const st = StyleSheet.create({
  card: {padding: space.m},
  fila: {flexDirection: 'row', alignItems: 'flex-start', gap: space.s, marginBottom: space.s},
  linea: {flexDirection: 'row', alignItems: 'center', gap: space.s, marginTop: 4},
  acciones: {flexDirection: 'row', gap: space.s, marginTop: space.m},
});

export default CitaCard;
