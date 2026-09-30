// "Mis citas" del conductor (vista='conductor') y "Agenda" del taller
// (vista='taller'): próximas arriba, historial abajo.
import React, {useCallback, useMemo, useState} from 'react';
import {View, ScrollView, RefreshControl, Alert, StyleSheet} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {ArrowLeft, CalendarX2, CalendarDays} from 'lucide-react-native';
import {AppText, Banner, EmptyState, IconButton, Segmented, TallerCardSkeleton, colors, space, useMargenesSistema} from '../../ui';
import {mensajeDeError} from '../../components/registro/validators';
import {abrirWhatsApp} from '../../utils/contacto';
import CitaCard from './CitaCard';
import {citasApi, esActiva, esFutura, fechaAmigable, hoyVE} from './citasApi';

const MisCitas = ({vista: vistaProp, enPestana}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const vista = vistaProp || route.params?.vista || 'conductor';
  const insets = useMargenesSistema();
  const [citas, setCitas] = useState(null);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [ocupado, setOcupado] = useState(null); // {id, accion}
  const [filtro, setFiltro] = useState('proximas');

  const cargar = useCallback(async () => {
    setError('');
    try {
      setCitas(vista === 'taller' ? await citasApi.agendaTaller() : await citasApi.misCitas());
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cargar las citas.'));
      setCitas(prev => prev || []);
    }
  }, [vista]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const {proximas, pasadas} = useMemo(() => {
    const lista = citas || [];
    const orden = (a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`);
    return {
      proximas: lista.filter(c => esActiva(c) && esFutura(c)).sort(orden),
      pasadas: lista.filter(c => !(esActiva(c) && esFutura(c))).sort((a, b) => orden(b, a)),
    };
  }, [citas]);

  const ejecutar = async (cita, accion, extra) => {
    setOcupado({id: cita.id, accion});
    try {
      await citasApi.actualizar(cita.id, accion, extra);
      await cargar();
    } catch (e) {
      Alert.alert('Solvers', mensajeDeError(e, 'No pudimos actualizar la cita.'));
    } finally {
      setOcupado(null);
    }
  };

  const onAccion = (cita, accion) => {
    if (accion === 'reprogramar') {
      navigation.navigate('ReservarCita', {
        citaId: cita.id,
        uid_taller: cita.uid_taller,
        nombre_taller: cita.nombre_taller,
        nombre_servicio: cita.nombre_servicio,
      });
      return;
    }
    const preguntas = {
      cancelar: ['¿Cancelar la cita?', vista === 'taller' ? 'Le avisamos al conductor.' : 'Le avisamos al taller.', 'Sí, cancelar'],
      rechazar: ['¿No puedes atenderla?', 'Le avisamos al conductor para que elija otra hora.', 'No puedo'],
      completar: ['¿Marcar como atendida?', 'Le pediremos al conductor que califique el servicio.', 'Sí, atendida'],
    };
    const q = preguntas[accion];
    if (!q) return ejecutar(cita, accion);
    Alert.alert(q[0], q[1], [
      {text: 'Volver', style: 'cancel'},
      {text: q[2], style: accion === 'completar' ? 'default' : 'destructive', onPress: () => ejecutar(cita, accion)},
    ]);
  };

  const onWhatsApp = cita => {
    const otro = vista === 'taller' ? cita.phone_usuario : cita.phone_taller;
    const msg =
      vista === 'taller'
        ? `Hola ${cita.nombre_usuario || ''}, te escribimos de ${cita.nombre_taller} por tu cita del ${fechaAmigable(cita.fecha)}.`
        : `Hola ${cita.nombre_taller || ''}, te escribo por mi cita del ${fechaAmigable(cita.fecha)} (Solvers).`;
    abrirWhatsApp(otro, msg);
  };

  const lista = filtro === 'proximas' ? proximas : pasadas;
  const hoy = hoyVE();
  const pendientesHoy = vista === 'taller' ? proximas.filter(c => c.estado === 'pendiente').length : 0;

  return (
    <View style={st.root}>
      <View style={[st.header, {paddingTop: insets.top + space.s}]}>
        {!enPestana ? <IconButton icon={ArrowLeft} label="Volver" color={colors.onNavy} onPress={() => navigation.goBack()} /> : null}
        <View style={{flex: 1, marginLeft: enPestana ? space.s : space.xs}}>
          <AppText variant="title" color={colors.onNavy}>
            {vista === 'taller' ? 'Agenda' : 'Mis citas'}
          </AppText>
          <AppText variant="caption" color={colors.onNavyMuted}>
            {vista === 'taller'
              ? pendientesHoy
                ? `${pendientesHoy} por confirmar`
                : 'Tus citas con conductores'
              : 'Tus reservas en talleres'}
          </AppText>
        </View>
      </View>

      <View style={st.segmento}>
        <Segmented
          value={filtro}
          onChange={setFiltro}
          options={[
            {value: 'proximas', label: `Próximas${proximas.length ? ` (${proximas.length})` : ''}`},
            {value: 'pasadas', label: 'Historial'},
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={st.body}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={async () => {
              setRefrescando(true);
              await cargar();
              setRefrescando(false);
            }}
          />
        }>
        {error ? <Banner text={error} actionLabel="Reintentar" onAction={cargar} style={{marginBottom: space.m}} /> : null}
        {citas == null ? (
          <>
            <TallerCardSkeleton />
            <TallerCardSkeleton />
          </>
        ) : lista.length === 0 ? (
          <EmptyState
            icon={filtro === 'proximas' ? CalendarDays : CalendarX2}
            title={filtro === 'proximas' ? 'No tienes citas próximas' : 'Sin historial todavía'}
            message={
              vista === 'taller'
                ? 'Cuando un conductor reserve, te llega una notificación y la ves aquí.'
                : 'Busca un taller y toca "Reservar cita" en su ficha.'
            }
            actionLabel={vista === 'taller' ? undefined : 'Buscar taller'}
            onAction={() => navigation.navigate('DrawerScreen', {screen: 'HomeScreen'})}
          />
        ) : (
          lista.map((c, i) => {
            const cabecera = filtro === 'proximas' && (i === 0 || lista[i - 1].fecha !== c.fecha);
            return (
              <View key={c.id}>
                {cabecera ? (
                  <AppText variant="subtitle" color={c.fecha === hoy ? colors.blue : colors.navy} style={st.dia}>
                    {fechaAmigable(c.fecha)}
                  </AppText>
                ) : null}
                <CitaCard
                  cita={c}
                  vista={vista}
                  onAccion={onAccion}
                  ocupado={ocupado?.id === c.id ? ocupado.accion : null}
                  onWhatsApp={esActiva(c) ? onWhatsApp : undefined}
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export const AgendaTaller = props => <MisCitas {...props} vista="taller" />;
export const AgendaTallerPestana = () => <MisCitas vista="taller" enPestana />;

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.bg},
  header: {
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s,
    paddingBottom: space.m,
  },
  segmento: {paddingHorizontal: space.m, paddingTop: space.m, alignItems: 'flex-start'},
  body: {padding: space.m, paddingBottom: 110},
  dia: {marginTop: space.s, marginBottom: space.s, textTransform: 'capitalize'},
});

export default MisCitas;
