// Reservar (o reprogramar) una cita: vehículo, día, hora y nota en una sola
// pantalla. Solo se ofrecen días en que el taller abre y horas con cupo.
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, ScrollView, Pressable, Text, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ArrowLeft, Car, CalendarCheck, Plus, CheckCircle2} from 'lucide-react-native';
import api from '../../../axiosInstance';
import {AppText, Banner, Button, IconButton, useMargenesSistema, colors, fonts, radius, space, shadow, TOUCH} from '../../ui';
import {mensajeDeError} from '../../components/registro/validators';
import {hora12} from '../../utils/taller';
import {citasApi, chipFecha, fechaAmigable, usuarioActual, vehiculoTexto} from './citasApi';

const OTRO = '__otro__';

const ReservarCita = () => {
  const navigation = useNavigation();
  const insets = useMargenesSistema();
  const p = useRoute().params || {};
  const reprogramar = !!p.citaId;

  const [dias, setDias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [sinHorario, setSinHorario] = useState(false);
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [vehiculos, setVehiculos] = useState(null);
  const [vehiculo, setVehiculo] = useState(null);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(null);

  const cargarDisponibilidad = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const r = await citasApi.disponibilidad(p.uid_taller, undefined, p.citaId);
      const lista = r?.dias || [];
      setDias(lista);
      setSinHorario(!!r?.sinHorario);
      // Primer día con cupo, si el elegido ya no tiene.
      setFecha(prev => (prev && lista.find(d => d.fecha === prev)?.hayCupo ? prev : lista.find(d => d.hayCupo)?.fecha || null));
    } catch (e) {
      setErrorCarga(mensajeDeError(e, 'No pudimos ver los horarios del taller.'));
    } finally {
      setCargando(false);
    }
  }, [p.uid_taller, p.citaId]);

  useEffect(() => {
    cargarDisponibilidad();
  }, [cargarDisponibilidad]);

  useEffect(() => {
    if (reprogramar) return;
    (async () => {
      try {
        const u = await usuarioActual();
        const r = await api.post('usuarios/getVehiculosByUsuarioUid', {uid: u?.uid});
        const lista = Array.isArray(r?.data) ? r.data : r?.data?.data || [];
        setVehiculos(lista);
        if (lista.length === 1) setVehiculo(lista[0]);
      } catch (_) {
        setVehiculos([]);
      }
    })();
  }, [reprogramar]);

  const dia = useMemo(() => dias.find(d => d.fecha === fecha), [dias, fecha]);
  useEffect(() => {
    if (hora && !dia?.horas?.find(h => h.hora === hora && h.libre)) setHora(null);
  }, [dia, hora]);

  const faltaVehiculo = !reprogramar && !vehiculo;
  const puedeEnviar = fecha && hora && !faltaVehiculo && !enviando;

  const enviar = async () => {
    if (!puedeEnviar) {
      setError(!fecha ? 'Elige el día.' : !hora ? 'Elige la hora.' : 'Elige el vehículo.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      if (reprogramar) {
        await citasApi.actualizar(p.citaId, 'reprogramar', {fecha, hora});
      } else {
        await citasApi.crear({
          uid_taller: p.uid_taller,
          uid_servicio: p.uid_servicio,
          nombre_servicio: p.nombre_servicio,
          fecha,
          hora,
          nota,
          vehiculo: vehiculo === OTRO ? {} : vehiculo,
        });
      }
      setListo({fecha, hora});
    } catch (e) {
      const codigo = e?.response?.data?.codigo;
      setError(mensajeDeError(e, 'No pudimos reservar. Intenta de nuevo.'));
      if (codigo === 'OCUPADO' || codigo === 'FUERA_DE_HORARIO') cargarDisponibilidad();
    } finally {
      setEnviando(false);
    }
  };

  // ── Éxito ────────────────────────────────────────────────────────────────
  if (listo) {
    return (
      <View style={[st.root, {paddingTop: insets.top}]}>
        <View style={st.exito}>
          <View style={st.exitoIcon}>
            <CheckCircle2 size={44} color={colors.ok} strokeWidth={2.2} />
          </View>
          <AppText variant="display" style={st.center}>
            {reprogramar ? 'Cita reprogramada' : '¡Cita pedida!'}
          </AppText>
          <AppText variant="subtitle" style={[st.center, {marginTop: space.s}]}>
            {fechaAmigable(listo.fecha)} · {hora12(listo.hora)}
          </AppText>
          <AppText variant="body" color={colors.muted} style={[st.center, {marginTop: space.s}]}>
            {p.nombre_taller || 'El taller'} la tiene que confirmar. Te avisamos con una notificación, y un día antes te
            recordamos la cita.
          </AppText>
          <Button title="Ver mis citas" variant="accent" onPress={() => navigation.replace('MisCitas')} style={{marginTop: space.l, alignSelf: 'stretch'}} />
          <Button title="Volver" variant="ghost" onPress={() => navigation.goBack()} style={{marginTop: space.s, alignSelf: 'stretch'}} />
        </View>
      </View>
    );
  }

  return (
    <View style={st.root}>
      <View style={[st.header, {paddingTop: insets.top + space.s}]}>
        <IconButton icon={ArrowLeft} label="Volver" color={colors.onNavy} onPress={() => navigation.goBack()} />
        <View style={{flex: 1, marginLeft: space.xs}}>
          <AppText variant="title" color={colors.onNavy}>
            {reprogramar ? 'Cambiar fecha de la cita' : 'Reservar cita'}
          </AppText>
          <AppText variant="caption" color={colors.onNavyMuted} numberOfLines={1}>
            {[p.nombre_servicio, p.nombre_taller].filter(Boolean).join(' · ')}
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={[st.body, {paddingBottom: 140}]} keyboardShouldPersistTaps="handled">
        {!reprogramar ? (
          <>
            <AppText variant="subtitle" style={st.titulo}>
              Vehículo
            </AppText>
            {vehiculos == null ? (
              <ActivityIndicator color={colors.navy} style={{alignSelf: 'flex-start'}} />
            ) : (
              <View style={{gap: space.s}}>
                {vehiculos.map(v => {
                  const on = vehiculo && vehiculo !== OTRO && (vehiculo.id || vehiculo.uid) === (v.id || v.uid);
                  return (
                    <Opcion key={v.id || v.uid} on={on} onPress={() => setVehiculo(v)} icon={Car} texto={vehiculoTexto(v) || 'Vehículo'} />
                  );
                })}
                {vehiculos.length === 0 ? (
                  <Opcion on={false} onPress={() => navigation.navigate('VehicleAddStepper')} icon={Plus} texto="Registrar mi vehículo" sub="Así el taller sabe qué carro llevas" />
                ) : null}
                <Opcion on={vehiculo === OTRO} onPress={() => setVehiculo(OTRO)} icon={Car} texto="Otro vehículo" sub="Se lo dices al taller en la nota" />
              </View>
            )}
          </>
        ) : null}

        <AppText variant="subtitle" style={st.titulo}>
          Día
        </AppText>
        {cargando ? (
          <ActivityIndicator color={colors.navy} style={{alignSelf: 'flex-start'}} />
        ) : errorCarga ? (
          <Banner text={errorCarga} actionLabel="Reintentar" onAction={cargarDisponibilidad} />
        ) : sinHorario || !dias.some(d => d.hayCupo) ? (
          <Banner
            tone="warn"
            text={sinHorario ? 'Este taller aún no cargó su horario. Escríbele por WhatsApp para acordar la cita.' : 'No quedan horas libres en los próximos 14 días.'}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: space.s}}>
            {dias.map(d => {
              const c = chipFecha(d.fecha);
              const on = d.fecha === fecha;
              const off = !d.hayCupo;
              return (
                <Pressable
                  key={d.fecha}
                  disabled={off}
                  onPress={() => setFecha(d.fecha)}
                  accessibilityRole="button"
                  accessibilityState={{selected: on, disabled: off}}
                  accessibilityLabel={`${fechaAmigable(d.fecha)}${off ? (d.abierto ? ', lleno' : ', cerrado') : ''}`}
                  style={[st.dia, on && st.diaOn, off && st.diaOff]}>
                  <Text style={[st.diaSem, on && st.txtOn]}>{c.dia}</Text>
                  <Text style={[st.diaNum, on && st.txtOn]}>{c.num}</Text>
                  <Text style={[st.diaMes, on && st.txtOn]}>{off ? (d.abierto ? 'lleno' : 'cerrado') : c.mes}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {dia && dia.hayCupo ? (
          <>
            <AppText variant="subtitle" style={st.titulo}>
              Hora · {fechaAmigable(dia.fecha)}
            </AppText>
            <View style={st.horas}>
              {dia.horas.map(h => {
                const on = h.hora === hora;
                return (
                  <Pressable
                    key={h.hora}
                    disabled={!h.libre}
                    onPress={() => setHora(h.hora)}
                    accessibilityRole="button"
                    accessibilityState={{selected: on, disabled: !h.libre}}
                    style={[st.hora, on && st.horaOn, !h.libre && st.diaOff]}>
                    <Text style={[st.horaTxt, on && st.txtOn, !h.libre && st.tachado]}>{hora12(h.hora)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {!reprogramar ? (
          <>
            <AppText variant="subtitle" style={st.titulo}>
              Nota para el taller <Text style={st.opcional}>(opcional)</Text>
            </AppText>
            <TextInput
              value={nota}
              onChangeText={setNota}
              placeholder="Ej: suena al frenar, lo llevo con el tanque lleno…"
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={300}
              style={st.nota}
            />
          </>
        ) : null}
      </ScrollView>

      <View style={[st.pie, {paddingBottom: Math.max(insets.bottom, space.s) + 4}]}>
        {error ? <Banner text={error} style={{marginBottom: space.s}} /> : null}
        <View style={st.pieFila}>
          <CalendarCheck size={20} color={fecha && hora ? colors.ok : colors.muted} strokeWidth={2.2} />
          <AppText variant="caption" color={fecha && hora ? colors.text : colors.muted} style={{flex: 1}}>
            {fecha && hora ? `${fechaAmigable(fecha)} · ${hora12(hora)}` : 'Elige día y hora'}
          </AppText>
        </View>
        <Button
          title={reprogramar ? 'Guardar nueva fecha' : 'Confirmar reserva'}
          variant="accent"
          onPress={enviar}
          loading={enviando}
          disabled={!fecha || !hora || faltaVehiculo}
        />
      </View>
    </View>
  );
};

const Opcion = ({on, onPress, icon: Icon, texto, sub}) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{selected: !!on}} style={[st.opcion, on && st.opcionOn]}>
    <Icon size={22} color={colors.navy} strokeWidth={2.2} />
    <View style={{flex: 1}}>
      <AppText variant="subtitle" numberOfLines={1}>
        {texto}
      </AppText>
      {sub ? (
        <AppText variant="caption" color={colors.muted}>
          {sub}
        </AppText>
      ) : null}
    </View>
    <View style={[st.radio, on && st.radioOn]} />
  </Pressable>
);

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.bg},
  center: {textAlign: 'center'},
  header: {
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s,
    paddingBottom: space.m,
  },
  body: {padding: space.m},
  titulo: {marginTop: space.l, marginBottom: space.s},
  opcional: {fontFamily: fonts.regular, color: colors.muted},
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: TOUCH + 12,
    padding: 12,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  opcionOn: {borderColor: colors.navy, backgroundColor: '#EEF0FB'},
  radio: {width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border},
  radioOn: {borderColor: colors.navy, borderWidth: 7},
  dia: {
    width: 64,
    paddingVertical: 10,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  diaOn: {backgroundColor: colors.navy, borderColor: colors.navy},
  diaOff: {opacity: 0.4},
  diaSem: {fontFamily: fonts.medium, fontSize: 13, color: colors.muted},
  diaNum: {fontFamily: fonts.bold, fontSize: 22, color: colors.navy, marginVertical: 2},
  diaMes: {fontFamily: fonts.medium, fontSize: 12, color: colors.muted},
  txtOn: {color: colors.yellow},
  horas: {flexDirection: 'row', flexWrap: 'wrap', gap: space.s},
  hora: {
    minWidth: 104,
    minHeight: TOUCH,
    paddingHorizontal: 12,
    borderRadius: radius.m,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horaOn: {backgroundColor: colors.navy, borderColor: colors.navy},
  horaTxt: {fontFamily: fonts.semibold, fontSize: 15, color: colors.navy},
  tachado: {textDecorationLine: 'line-through'},
  nota: {
    minHeight: 88,
    borderRadius: radius.m,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
  pie: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: space.m,
    paddingTop: space.s,
    ...shadow.bar,
  },
  pieFila: {flexDirection: 'row', alignItems: 'center', gap: space.s, marginBottom: space.s},
  exito: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.l},
  exitoIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.okBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.m,
  },
});

export default ReservarCita;
