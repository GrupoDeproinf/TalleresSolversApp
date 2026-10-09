// Inicio del taller (Req. 005).
//
// El taller es un usuario administrativo: al entrar ve cómo va su negocio
// (visitas, contactos, propuestas, servicios y plan), no el catálogo que ven
// los conductores. Los datos salen de /usuarios/resumenTaller.
// Estilo: línea gráfica de la campaña (ui/tokens > brand).
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../../axiosInstance';
import {colors, brand, fonts, radius, shadow, MAX_FONT_SCALE} from '../../ui/tokens';
import {estadoComercio} from '../../components/registro/EstadoComercioCard';

const T = props => <Text maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />;

const DIAS_CORTOS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

/** Compara los últimos 30 días con los 30 anteriores. */
const tendencia = (actual, previo) => {
  if (!previo && !actual) return null;
  if (!previo) return {texto: 'Nuevo este mes', sube: true};
  const pct = Math.round(((actual - previo) / previo) * 100);
  if (pct === 0) return {texto: 'Igual que el mes pasado', sube: null};
  return {texto: `${pct > 0 ? '+' : ''}${pct}% vs. mes pasado`, sube: pct > 0};
};

const ESTADO = {
  verificado: {texto: 'Taller verificado', icono: 'checkmark-circle', fg: brand.navyDeep, bg: brand.yellow},
  revision: {texto: 'En revisión', icono: 'time', fg: brand.navyDeep, bg: brand.yellowSoft},
  faltan: {texto: 'Falta un documento', icono: 'document-attach', fg: '#FFFFFF', bg: colors.error},
  rechazado: {texto: 'Requiere correcciones', icono: 'alert-circle', fg: '#FFFFFF', bg: colors.error},
};

const Metrica = ({icono, valor, etiqueta, nota, notaSube}) => (
  <View style={st.metrica}>
    <View style={st.metricaIcono}>
      <Ionicons name={icono} size={18} color={brand.navy} />
    </View>
    <T style={st.metricaValor}>{valor}</T>
    <T style={st.metricaEtiqueta}>{etiqueta}</T>
    {nota ? (
      <T style={[st.metricaNota, notaSube === true && {color: colors.ok}, notaSube === false && {color: colors.error}]}>{nota}</T>
    ) : null}
  </View>
);

const Accion = ({icono, titulo, detalle, onPress}) => (
  <TouchableOpacity style={st.accion} onPress={onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={titulo}>
    <View style={st.accionIcono}>
      <Ionicons name={icono} size={20} color={brand.navy} />
    </View>
    <View style={{flex: 1}}>
      <T style={st.accionTitulo}>{titulo}</T>
      {detalle ? <T style={st.accionDetalle}>{detalle}</T> : null}
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
  </TouchableOpacity>
);

const TallerInicio = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [usuario, setUsuario] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async esRefresco => {
    if (esRefresco) setRefrescando(true);
    setError('');
    try {
      const raw = await AsyncStorage.getItem('@userInfo');
      const local = raw ? JSON.parse(raw) : {};
      setUsuario(prev => prev || local);
      const uid = String(local?.uid || local?.id || '');
      if (!uid) return;
      const [r, u] = await Promise.allSettled([
        api.post('/usuarios/resumenTaller', {uid}, {timeout: 25000}),
        api.post('/usuarios/getUserByUid', {uid}, {timeout: 25000}),
      ]);
      if (u.status === 'fulfilled' && u.value?.data?.userData) setUsuario({...local, ...u.value.data.userData});
      if (r.status === 'fulfilled') setResumen(r.value.data);
      else setError('No pudimos cargar los datos de tu negocio. Desliza hacia abajo para reintentar.');
    } catch (e) {
      setError('No pudimos cargar los datos de tu negocio. Desliza hacia abajo para reintentar.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar(false);
    }, [cargar]),
  );

  // Las pestañas del taller no se llaman igual en los dos juegos de pestañas.
  const irAPestana = (...nombres) => {
    const disponibles = navigation.getState?.()?.routeNames || [];
    const destino = nombres.find(n => disponibles.includes(n));
    if (destino) navigation.navigate(destino);
  };
  const irAServicios = () => irAPestana('Servicios', 'ServiciosScreen');
  const irASolicitudes = () => irAPestana('MisSolicitudes');

  const est = estadoComercio(usuario);
  const tipoEstado =
    usuario?.status === 'Aprobado' ? 'verificado' : est?.tipo && ESTADO[est.tipo] ? est.tipo : usuario?.status ? 'revision' : null;
  const chip = tipoEstado ? ESTADO[tipoEstado] : null;

  const v = resumen?.visitas;
  const c = resumen?.contactos;
  const p = resumen?.propuestas;
  const s = resumen?.servicios;
  const plan = resumen?.plan;
  const maxDia = Math.max(1, ...(v?.porDia || []).map(d => d.cantidad));
  const tv = v ? tendencia(v.ultimos30, v.previos30) : null;
  const tc = c ? tendencia(c.ultimos30, c.previos30) : null;

  return (
    <View style={st.pantalla}>
      <ScrollView
        contentContainerStyle={{paddingBottom: insets.bottom + 120}}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} tintColor={brand.yellow} />}>
        {/* ── Cabecera de campaña ── */}
        <View style={[st.hero, {paddingTop: insets.top + 18}]}>
          <Image source={require('../../assets/brand/huella-amarilla.png')} style={st.huella} resizeMode="contain" accessible={false} />
          <T style={st.heroSaludo}>Tu negocio</T>
          <T style={st.heroNombre} numberOfLines={2}>
            {usuario?.nombre || 'Solvers'}
          </T>
          {chip ? (
            <View style={[st.chip, {backgroundColor: chip.bg}]}>
              <Ionicons name={chip.icono} size={15} color={chip.fg} />
              <T style={[st.chipTexto, {color: chip.fg}]}>{chip.texto}</T>
            </View>
          ) : null}
        </View>

        <View style={st.cuerpo}>
          {tipoEstado === 'faltan' ? (
            <Accion
              icono="document-attach-outline"
              titulo="Sube tus documentos"
              detalle="Con ellos revisamos y aprobamos tu negocio."
              onPress={() => navigation.navigate('DocumentosTaller')}
            />
          ) : null}

          {cargando && !resumen ? (
            <View style={st.centro}>
              <ActivityIndicator color={brand.navy} />
            </View>
          ) : null}

          {error ? <T style={st.error}>{error}</T> : null}

          {resumen ? (
            <>
              <T style={st.seccion}>Últimos 30 días</T>
              <View style={st.fila}>
                <Metrica icono="eye-outline" valor={v.ultimos30} etiqueta="Visitas a tu perfil" nota={tv?.texto} notaSube={tv?.sube} />
                <Metrica icono="call-outline" valor={c.ultimos30} etiqueta="Contactos recibidos" nota={tc?.texto} notaSube={tc?.sube} />
              </View>
              <View style={st.fila}>
                <Metrica icono="document-text-outline" valor={p.ultimos30} etiqueta="Propuestas enviadas" nota={`${p.total} en total`} />
                <Metrica icono="construct-outline" valor={s.publicados} etiqueta="Servicios publicados" nota={s.sinPublicar ? `${s.sinPublicar} sin publicar` : `${s.total} en total`} />
              </View>

              <T style={st.seccion}>Visitas de la semana</T>
              <View style={st.tarjeta}>
                <View style={st.barras} accessibilityLabel={`Visitas de los últimos 7 días: ${v.ultimos7}`}>
                  {v.porDia.map(d => (
                    <View key={d.dia} style={st.barraCol}>
                      <T style={st.barraValor}>{d.cantidad || ''}</T>
                      <View style={[st.barra, {height: 6 + Math.round((d.cantidad / maxDia) * 70)}, d.cantidad ? null : st.barraVacia]} />
                      <T style={st.barraDia}>{DIAS_CORTOS[new Date(`${d.dia}T12:00:00`).getDay()]}</T>
                    </View>
                  ))}
                </View>
                {!v.total ? <T style={st.vacio}>Aún no hay visitas. Publica tus servicios para aparecer en las búsquedas.</T> : null}
              </View>

              <T style={st.seccion}>Lo que más te piden</T>
              <View style={st.tarjeta}>
                {c.topServicios.length ? (
                  c.topServicios.map((t, i) => (
                    <View key={t.nombre} style={[st.top, i > 0 && st.topBorde]}>
                      <View style={st.topPuesto}>
                        <T style={st.topPuestoTexto}>{i + 1}</T>
                      </View>
                      <T style={st.topNombre} numberOfLines={1}>
                        {t.nombre}
                      </T>
                      <T style={st.topCantidad}>
                        {t.cantidad} {t.cantidad === 1 ? 'contacto' : 'contactos'}
                      </T>
                    </View>
                  ))
                ) : (
                  <T style={st.vacio}>Cuando los conductores te contacten por un servicio, lo verás aquí.</T>
                )}
              </View>

              <T style={st.seccion}>Tu plan</T>
              <View style={st.tarjeta}>
                {plan ? (
                  <>
                    <View style={st.planFila}>
                      <T style={st.planNombre}>{plan.nombre || 'Plan'}</T>
                      {plan.diasRestantes != null && !plan.pendienteInicio ? (
                        <T style={[st.planDias, plan.diasRestantes <= 3 && {color: colors.error}]}>
                          {plan.diasRestantes === 0 ? 'Vence hoy' : `${plan.diasRestantes} ${plan.diasRestantes === 1 ? 'día restante' : 'días restantes'}`}
                        </T>
                      ) : null}
                    </View>
                    <T style={st.planDetalle}>
                      {plan.pendienteInicio
                        ? 'Empieza a contar cuando aprobemos tu negocio.'
                        : s.cupoRestante != null
                          ? `Puedes publicar ${s.cupoRestante} ${s.cupoRestante === 1 ? 'servicio más' : 'servicios más'}.`
                          : ''}
                    </T>
                  </>
                ) : (
                  <T style={st.vacio}>Aún no tienes un plan activo.</T>
                )}
              </View>
            </>
          ) : null}

          <T style={st.seccion}>Accesos rápidos</T>
          <Accion icono="construct-outline" titulo="Mis servicios" detalle="Crea, edita y publica lo que ofreces." onPress={irAServicios} />
          <Accion icono="clipboard-outline" titulo="Solicitudes" detalle="Responde a los conductores que te buscan." onPress={irASolicitudes} />
          <Accion icono="storefront-outline" titulo="Perfil del negocio" detalle="Horario, dirección, contacto y documentos." onPress={() => navigation.navigate('PerfilNegocio')} />

          <T style={st.lema}>{brand.promise}</T>
        </View>
      </ScrollView>
    </View>
  );
};

const st = StyleSheet.create({
  pantalla: {flex: 1, backgroundColor: colors.bg},
  hero: {
    backgroundColor: brand.navy,
    paddingHorizontal: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 6,
    borderBottomColor: brand.yellow,
    overflow: 'hidden',
  },
  huella: {position: 'absolute', top: -20, right: -160, width: 420, height: 128, opacity: 0.2, transform: [{rotate: '180deg'}]},
  heroSaludo: {fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, color: brand.yellow, textTransform: 'uppercase'},
  heroNombre: {fontFamily: brand.headlineFont, fontSize: 26, lineHeight: 31, color: '#FFFFFF', textTransform: 'uppercase', marginTop: 4},
  chip: {flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12},
  chipTexto: {fontFamily: fonts.bold, fontSize: 13, marginLeft: 6},
  cuerpo: {paddingHorizontal: 16, paddingTop: 16},
  centro: {paddingVertical: 40, alignItems: 'center'},
  error: {fontFamily: fonts.medium, fontSize: 14, color: colors.error, backgroundColor: colors.errorBg, borderRadius: radius.m, padding: 12, marginBottom: 8},
  seccion: {fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginTop: 18, marginBottom: 10},
  fila: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10},
  metrica: {width: '48.5%', backgroundColor: colors.card, borderRadius: radius.l, padding: 14, ...shadow.card},
  metricaIcono: {width: 34, height: 34, borderRadius: 17, backgroundColor: brand.yellowSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10},
  metricaValor: {fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 32, color: brand.navy},
  metricaEtiqueta: {fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginTop: 2},
  metricaNota: {fontFamily: fonts.medium, fontSize: 12, color: colors.muted, marginTop: 6},
  tarjeta: {backgroundColor: colors.card, borderRadius: radius.l, padding: 14, ...shadow.card},
  barras: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 118},
  barraCol: {flex: 1, alignItems: 'center', justifyContent: 'flex-end'},
  barraValor: {fontFamily: fonts.semibold, fontSize: 12, color: colors.muted, marginBottom: 4, minHeight: 16},
  barra: {width: 18, borderRadius: 6, backgroundColor: brand.yellow},
  barraVacia: {backgroundColor: colors.skeleton},
  barraDia: {fontFamily: fonts.medium, fontSize: 12, color: colors.muted, marginTop: 6},
  vacio: {fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted},
  top: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10},
  topBorde: {borderTopWidth: 1, borderTopColor: colors.border},
  topPuesto: {width: 26, height: 26, borderRadius: 13, backgroundColor: brand.navy, alignItems: 'center', justifyContent: 'center'},
  topPuestoTexto: {fontFamily: fonts.bold, fontSize: 13, color: brand.yellow},
  topNombre: {flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginHorizontal: 10},
  topCantidad: {fontFamily: fonts.medium, fontSize: 13, color: colors.muted},
  planFila: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  planNombre: {fontFamily: fonts.bold, fontSize: 17, color: brand.navy},
  planDias: {fontFamily: fonts.semibold, fontSize: 14, color: colors.ok},
  planDetalle: {fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 6},
  accion: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.l, padding: 14, marginBottom: 10, minHeight: 64, ...shadow.card},
  accionIcono: {width: 40, height: 40, borderRadius: 20, backgroundColor: brand.yellowSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12},
  accionTitulo: {fontFamily: fonts.bold, fontSize: 15, color: colors.text},
  accionDetalle: {fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2},
  lema: {fontFamily: 'Poppins-Italic', fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 18},
});

export default TallerInicio;
