// Selector de especialidades en burbujas (estilo onboarding de Spotify).
//
// 1. El negocio toca las áreas en las que trabaja (burbujas grandes).
// 2. Debajo aparecen los servicios de cada área elegida (burbujas pequeñas)
//    y toca los que hace. Si falta alguno, lo agrega con "+ Otro".
// El primer servicio elegido es la especialidad destacada.
// `maximo` es el cupo de servicios del plan (en el registro, el gratuito):
// al llegar al tope no se pueden elegir más hasta quitar alguno.
//
// El catálogo viene del servidor (/usuarios/catalogoServicios).
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {C} from './ui';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AMARILLO = '#FCC800';
const MARINO = '#151D61';

// Nombre corto para que quepa dentro de la burbuja.
const CORTO = {
  mantenimiento: 'Mantenimiento',
  frenos: 'Frenos',
  suspension: 'Suspensión y dirección',
  electrico: 'Electricidad',
  climatizacion: 'Aire acondicionado',
  motor: 'Motor',
  transmision: 'Caja y embrague',
  escape: 'Escape',
  latoneria: 'Latonería y pintura',
  autolavado: 'Autolavado',
  tapiceria: 'Tapicería',
  vidrios: 'Parabrisas y vidrios',
  gas: 'Gas vehicular',
  motos: 'Motos',
};

const sinAcentos = v =>
  String(v || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

// Animación corta y con salida rápida: respuesta inmediata al tocar.
const animar = () =>
  LayoutAnimation.configureNext({
    duration: 220,
    create: {type: 'easeOut', property: 'opacity'},
    update: {type: 'easeOut'},
    delete: {type: 'easeOut', property: 'opacity'},
  });

/** Botón con "rebote" al presionar (la interfaz confirma el toque). */
const Burbuja = ({onPress, style, children, accessibilityLabel, seleccionada}) => {
  const escala = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(seleccionada ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(pop, {
      toValue: seleccionada ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [seleccionada, pop]);
  const presion = valor =>
    Animated.timing(escala, {toValue: valor, duration: 110, easing: Easing.out(Easing.cubic), useNativeDriver: true}).start();
  const crecer = pop.interpolate({inputRange: [0, 1], outputRange: [1, 1.04]});
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => presion(0.94)}
      onPressOut={() => presion(1)}
      accessibilityRole="checkbox"
      accessibilityState={{checked: !!seleccionada}}
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}>
      <Animated.View style={[style, {transform: [{scale: Animated.multiply(escala, crecer)}]}]}>{children}</Animated.View>
    </Pressable>
  );
};

const SelectorEspecialidades = ({grupos, areas, especialidades, onChange, maximo}) => {
  const [busqueda, setBusqueda] = useState('');
  const [agregandoEn, setAgregandoEn] = useState('');
  const [nuevo, setNuevo] = useState('');
  const [avisoTope, setAvisoTope] = useState(false);

  const tope = Number.isFinite(maximo) && maximo > 0 ? maximo : null;
  const lleno = tope != null && especialidades.length >= tope;
  // El aviso se va solo cuando vuelve a haber espacio.
  useEffect(() => {
    if (!lleno) setAvisoTope(false);
  }, [lleno]);

  const elegido = (grupo, servicio) =>
    especialidades.findIndex(e => e.grupo === grupo && sinAcentos(e.servicio) === sinAcentos(servicio));
  const destacada = especialidades[0];

  const alternarArea = id => {
    animar();
    if (areas.includes(id)) {
      onChange(
        areas.filter(a => a !== id),
        especialidades.filter(e => e.grupo !== id),
      );
      if (agregandoEn === id) setAgregandoEn('');
    } else {
      onChange([...areas, id], especialidades);
    }
  };

  const alternarServicio = (grupo, servicio, personalizado = false) => {
    const i = elegido(grupo, servicio);
    if (i >= 0) {
      onChange(areas, especialidades.filter((_, j) => j !== i));
    } else if (lleno) {
      setAvisoTope(true);
    } else {
      onChange(areas.includes(grupo) ? areas : [...areas, grupo], [...especialidades, {grupo, servicio, personalizado}]);
    }
  };

  const agregarOtro = grupo => {
    const t = nuevo.replace(/\s+/g, ' ').trim().slice(0, 60);
    if (lleno) {
      setAvisoTope(true);
    } else if (t.length >= 3 && elegido(grupo, t) < 0) {
      animar();
      onChange(areas, [...especialidades, {grupo, servicio: t.charAt(0).toUpperCase() + t.slice(1), personalizado: true}]);
    }
    setNuevo('');
    setAgregandoEn('');
  };

  // Búsqueda: servicios de cualquier área que coincidan.
  const resultados = useMemo(() => {
    const q = sinAcentos(busqueda);
    if (q.length < 2) return [];
    const out = [];
    grupos.forEach(g =>
      g.servicios.forEach(sv => {
        if (sinAcentos(sv).includes(q) || sinAcentos(g.nombre).includes(q)) out.push({grupo: g.id, servicio: sv});
      }),
    );
    return out.slice(0, 18);
  }, [busqueda, grupos]);

  const pildora = (grupo, servicio, personalizado) => {
    const i = elegido(grupo, servicio);
    const sel = i >= 0;
    const esDestacada = sel && i === 0;
    const bloqueada = !sel && lleno;
    return (
      <Burbuja
        key={`${grupo}-${servicio}`}
        seleccionada={sel}
        onPress={() => alternarServicio(grupo, servicio, personalizado)}
        accessibilityLabel={`${servicio}${esDestacada ? ', especialidad destacada' : ''}${bloqueada ? ', llegaste al máximo de tu plan' : ''}`}
        style={[s.pildora, sel && s.pildoraSel, esDestacada && s.pildoraDestacada, bloqueada && s.pildoraBloqueada]}>
        {esDestacada ? (
          <MaterialCommunityIcons name="crown" size={14} color={MARINO} style={{marginRight: 5}} />
        ) : sel ? (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{marginRight: 4}} />
        ) : null}
        <Text style={[s.pildoraTexto, sel && s.pildoraTextoSel, esDestacada && s.pildoraTextoDestacada]}>{servicio}</Text>
        {personalizado && sel ? <Ionicons name="close" size={14} color={esDestacada ? MARINO : '#FFFFFF'} style={{marginLeft: 4}} /> : null}
      </Burbuja>
    );
  };

  return (
    <View>
      <View style={s.buscador}>
        <Ionicons name="search" size={20} color={C.muted} />
        <TextInput
          style={s.buscadorInput}
          placeholder="Buscar servicio (frenos, aceite, batería…)"
          placeholderTextColor="#9AA0B4"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCorrect={false}
          accessibilityLabel="Buscar servicio"
        />
        {busqueda ? (
          <Pressable onPress={() => setBusqueda('')} hitSlop={10} accessibilityLabel="Borrar búsqueda">
            <Ionicons name="close-circle" size={20} color={C.muted} />
          </Pressable>
        ) : null}
      </View>

      {busqueda.trim().length >= 2 ? (
        <View style={s.bloque}>
          {resultados.length ? (
            <View style={s.nube}>{resultados.map(r => pildora(r.grupo, r.servicio, false))}</View>
          ) : (
            <Text style={s.ayuda}>No lo encontramos. Elige el área abajo y agrégalo con "+ Otro".</Text>
          )}
        </View>
      ) : null}

      <Text style={s.paso}>1. Toca las áreas en las que trabajas</Text>
      <View style={s.areas}>
        {grupos.map(g => {
          const sel = areas.includes(g.id);
          const cuantos = especialidades.filter(e => e.grupo === g.id).length;
          return (
            <Burbuja
              key={g.id}
              seleccionada={sel}
              onPress={() => alternarArea(g.id)}
              accessibilityLabel={g.nombre}
              style={[s.area, sel && s.areaSel]}>
              <MaterialCommunityIcons name={g.icono || 'tools'} size={28} color={sel ? MARINO : AMARILLO} />
              <Text style={[s.areaTexto, sel && s.areaTextoSel]} numberOfLines={2}>
                {CORTO[g.id] || g.nombre}
              </Text>
              {cuantos ? (
                <View style={s.contador}>
                  <Text style={s.contadorTexto}>{cuantos}</Text>
                </View>
              ) : null}
            </Burbuja>
          );
        })}
      </View>

      {areas.length ? (
        <View style={s.pasoFila}>
          <Text style={[s.paso, {flex: 1}]}>2. Elige los servicios que haces</Text>
          {tope != null ? (
            <View style={[s.cupo, lleno && s.cupoLleno]} accessibilityLabel={`${especialidades.length} de ${tope} servicios elegidos`}>
              <Text style={[s.cupoTexto, lleno && s.cupoTextoLleno]}>
                {especialidades.length} de {tope}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      {tope != null && areas.length ? (
        <Text style={[s.ayuda, {marginTop: -4, marginBottom: 10}]}>
          Tu plan gratuito incluye hasta {tope} servicios. Con un plan pago podrás publicar más.
        </Text>
      ) : null}
      {avisoTope ? (
        <View style={s.avisoTope} accessibilityLiveRegion="polite">
          <Ionicons name="information-circle" size={18} color={MARINO} />
          <Text style={s.avisoTopeTexto}>
            Ya elegiste {tope}, el máximo de tu plan gratuito. Quita uno para elegir otro.
          </Text>
        </View>
      ) : null}
      {areas
        .map(id => grupos.find(g => g.id === id))
        .filter(Boolean)
        .map(g => {
          const propios = especialidades.filter(e => e.grupo === g.id && e.personalizado);
          return (
            <View key={g.id} style={s.bloque}>
              <View style={s.bloqueCab}>
                <MaterialCommunityIcons name={g.icono || 'tools'} size={18} color={MARINO} />
                <Text style={s.bloqueTitulo}>{g.nombre}</Text>
              </View>
              <View style={s.nube}>
                {g.servicios.map(sv => pildora(g.id, sv, false))}
                {propios.map(e => pildora(g.id, e.servicio, true))}
                {agregandoEn === g.id || lleno ? null : (
                  <Burbuja
                    onPress={() => {
                      animar();
                      setNuevo('');
                      setAgregandoEn(g.id);
                    }}
                    accessibilityLabel={`Agregar otro servicio en ${g.nombre}`}
                    style={[s.pildora, s.pildoraOtro]}>
                    <Ionicons name="add" size={15} color={MARINO} style={{marginRight: 3}} />
                    <Text style={[s.pildoraTexto, {color: MARINO}]}>Otro</Text>
                  </Burbuja>
                )}
              </View>
              {agregandoEn === g.id ? (
                <View style={s.otroFila}>
                  <TextInput
                    style={s.otroInput}
                    value={nuevo}
                    onChangeText={setNuevo}
                    placeholder="¿Qué otro servicio haces?"
                    placeholderTextColor="#9AA0B4"
                    autoFocus
                    maxLength={60}
                    returnKeyType="done"
                    onSubmitEditing={() => agregarOtro(g.id)}
                    accessibilityLabel={`Otro servicio de ${g.nombre}`}
                  />
                  <Pressable onPress={() => agregarOtro(g.id)} style={s.otroBoton} accessibilityRole="button">
                    <Text style={s.otroBotonTexto}>Agregar</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}

      {destacada ? (
        <View style={s.destacada}>
          <MaterialCommunityIcons name="crown" size={16} color={MARINO} />
          <Text style={s.destacadaTexto}>
            Especialidad destacada: <Text style={{fontWeight: '800'}}>{destacada.servicio}</Text>
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const s = StyleSheet.create({
  buscador: {flexDirection: 'row', alignItems: 'center', minHeight: 48, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#FFFFFF', paddingHorizontal: 12, marginBottom: 6},
  buscadorInput: {flex: 1, marginLeft: 8, fontSize: 16, color: C.text, paddingVertical: 10},
  ayuda: {fontSize: 13, color: C.muted},
  paso: {fontSize: 14.5, fontWeight: '800', color: MARINO, marginTop: 14, marginBottom: 10},
  pasoFila: {flexDirection: 'row', alignItems: 'center'},
  cupo: {marginTop: 4, marginLeft: 8, borderRadius: 999, backgroundColor: '#EEF0F8', paddingHorizontal: 10, paddingVertical: 4},
  cupoLleno: {backgroundColor: AMARILLO},
  cupoTexto: {fontSize: 12.5, fontWeight: '800', color: MARINO},
  cupoTextoLleno: {color: MARINO},
  avisoTope: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF6CC', borderRadius: 12, padding: 10, marginBottom: 10},
  avisoTopeTexto: {marginLeft: 8, fontSize: 13, color: MARINO, flex: 1},
  areas: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  area: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MARINO,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  areaSel: {backgroundColor: AMARILLO},
  areaTexto: {marginTop: 4, fontSize: 11.5, lineHeight: 14, fontWeight: '700', color: '#FFFFFF', textAlign: 'center'},
  areaTextoSel: {color: MARINO},
  contador: {position: 'absolute', top: 4, right: 4, minWidth: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: MARINO, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4},
  contadorTexto: {fontSize: 11, fontWeight: '900', color: MARINO},
  bloque: {backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 10},
  bloqueCab: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  bloqueTitulo: {marginLeft: 8, fontSize: 14.5, fontWeight: '800', color: MARINO, flex: 1},
  nube: {flexDirection: 'row', flexWrap: 'wrap'},
  pildora: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D5D9EA',
    backgroundColor: '#F4F5FA',
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginRight: 7,
    marginBottom: 8,
  },
  pildoraSel: {backgroundColor: MARINO, borderColor: MARINO},
  pildoraDestacada: {backgroundColor: AMARILLO, borderColor: AMARILLO},
  pildoraBloqueada: {opacity: 0.4},
  pildoraOtro: {backgroundColor: '#FFFFFF', borderStyle: 'dashed', borderColor: MARINO},
  pildoraTexto: {fontSize: 13.5, fontWeight: '600', color: C.text},
  pildoraTextoSel: {color: '#FFFFFF'},
  pildoraTextoDestacada: {color: MARINO, fontWeight: '800'},
  otroFila: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  otroInput: {flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 12, fontSize: 16, color: C.text},
  otroBoton: {marginLeft: 8, minHeight: 44, borderRadius: 12, backgroundColor: MARINO, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center'},
  otroBotonTexto: {color: '#FFFFFF', fontWeight: '800', fontSize: 14},
  destacada: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF6CC', borderRadius: 12, padding: 10, marginTop: 4},
  destacadaTexto: {marginLeft: 8, fontSize: 13.5, color: MARINO, flex: 1},
});

export default SelectorEspecialidades;
