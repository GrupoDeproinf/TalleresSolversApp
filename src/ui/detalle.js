// Piezas compartidas por las fichas de servicio y de taller (Fase 2 de la
// mejora de experiencia del conductor). Mismo sistema visual que el inicio.
import React, {useState} from 'react';
import {View, Image, FlatList, Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import {ArrowLeft, Star, ChevronRight} from 'lucide-react-native';
import {AppText, colors, space, radius, fonts, TOUCH} from './index';

const SIN_IMAGEN = require('../assets/noimageNew.png');

/** Lista de URLs válidas a partir de un string o un arreglo. */
export const listaImagenes = (...fuentes) => {
  const salida = [];
  fuentes.forEach(f => {
    (Array.isArray(f) ? f : [f]).forEach(v => {
      const u = typeof v === 'string' ? v.trim() : v && typeof v === 'object' ? String(v.url || v.uri || '').trim() : '';
      if (u && !salida.includes(u)) salida.push(u);
    });
  });
  return salida;
};

/**
 * Fotos deslizables a todo el ancho, con puntos y botón de volver encima.
 * Las imágenes se muestran completas (contain) sobre un fondo suave: muchos
 * talleres suben logos o volantes y recortarlos los deja ilegibles.
 */
export const Galeria = ({imagenes, onBack}) => {
  const {width} = useWindowDimensions();
  const alto = Math.round(width * 0.66);
  const [actual, setActual] = useState(0);
  const lista = imagenes && imagenes.length ? imagenes : [null];
  return (
    <View style={{width, height: alto, backgroundColor: colors.navy}}>
      <FlatList
        data={lista}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(u, i) => `${u || 'vacia'}-${i}`}
        onMomentumScrollEnd={e => setActual(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({item}) => (
          <View style={{width, height: alto, backgroundColor: '#EEF0F6'}}>
            {/* Fondo: la misma foto difuminada para que no queden franjas vacías. */}
            {item ? (
              <Image source={{uri: item}} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={18} />
            ) : null}
            <Image
              source={item ? {uri: item} : SIN_IMAGEN}
              style={{width, height: alto}}
              resizeMode={item ? 'contain' : 'cover'}
              accessibilityIgnoresInvertColors
            />
          </View>
        )}
      />
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
          style={d.volver}>
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
      ) : null}
      {lista.length > 1 ? (
        <View style={d.puntos} accessibilityLabel={`Foto ${actual + 1} de ${lista.length}`}>
          {lista.map((_, i) => (
            <View key={i} style={[d.punto, i === actual && d.puntoOn]} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

/** Bloque con título. */
export const Seccion = ({titulo, children, style, accion}) => (
  <View style={[d.seccion, style]}>
    <View style={d.seccionCabecera}>
      <AppText variant="subtitle" style={{flex: 1}} accessibilityRole="header">
        {titulo}
      </AppText>
      {accion || null}
    </View>
    {children}
  </View>
);

/** "★ 4,5 · 12 reseñas" o "Sin reseñas aún". Toca para verlas. */
export const Valoracion = ({comentarios, onPress}) => {
  const lista = Array.isArray(comentarios) ? comentarios : [];
  const total = lista.length;
  const promedio = total ? lista.reduce((s, c) => s + (Number(c?.puntuacion) || 0), 0) / total : 0;
  const texto = total
    ? `${promedio.toFixed(1).replace('.', ',')} · ${total} ${total === 1 ? 'reseña' : 'reseñas'}`
    : 'Sin reseñas aún';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={total ? `Calificación ${texto}. Ver reseñas` : 'Sin reseñas aún'}
      style={({pressed}) => [d.valoracion, pressed && {opacity: 0.7}]}>
      <Star size={16} color={total ? '#E6A800' : colors.muted} fill={total ? '#E6A800' : 'transparent'} strokeWidth={2} />
      <AppText variant="caption" color={total ? colors.text : colors.muted}>
        {texto}
      </AppText>
      {total && onPress ? <ChevronRight size={16} color={colors.muted} strokeWidth={2.2} /> : null}
    </Pressable>
  );
};

const METODOS = {
  pagoMovil: 'Pago Móvil',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  zelle: 'Zelle / Divisas',
  puntoVenta: 'Punto de venta',
  tarjetaCreditoN: 'Tarjeta de crédito nacional',
  tarjetaCreditoI: 'Tarjeta de crédito internacional',
  zinli: 'Zinli',
};

/** Etiquetas de los métodos de pago activos. Devuelve [] si no hay. */
export const metodosActivos = metodos =>
  Object.entries(metodos && typeof metodos === 'object' && !Array.isArray(metodos) ? metodos : {})
    .filter(([k, v]) => v === true && METODOS[k])
    .map(([k]) => METODOS[k]);

export const MetodosPago = ({metodos}) => {
  const lista = metodosActivos(metodos);
  if (!lista.length) return null;
  return (
    <View style={d.chips}>
      {lista.map(m => (
        <View key={m} style={d.chip}>
          <AppText variant="caption">{m}</AppText>
        </View>
      ))}
    </View>
  );
};

/** Horario agrupado por días (filas de `getHorarioAtencionDisplay`). */
export const Horario = ({filas, texto}) =>
  texto ? (
    <AppText variant="body">{texto}</AppText>
  ) : (
    <View style={{gap: space.s}}>
      {(filas || []).map(f => (
        <View key={f.key} style={d.horarioFila}>
          <AppText variant="body" color={colors.muted} style={{flex: 1}}>
            {f.label}
          </AppText>
          <AppText variant="body" style={{fontFamily: fonts.medium}}>
            {f.time}
          </AppText>
        </View>
      ))}
    </View>
  );

const d = StyleSheet.create({
  volver: {
    position: 'absolute',
    top: space.s,
    left: space.s,
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    backgroundColor: 'rgba(15,18,40,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puntos: {
    position: 'absolute',
    // Por encima de la tarjeta que se monta sobre la foto.
    bottom: space.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: space.s,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15,18,40,0.45)',
  },
  punto: {width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)'},
  puntoOn: {backgroundColor: '#FFFFFF'},
  seccion: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    padding: space.m,
    marginTop: space.m,
  },
  seccionCabecera: {flexDirection: 'row', alignItems: 'center', marginBottom: space.s},
  valoracion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 32,
    paddingHorizontal: space.s,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    alignSelf: 'flex-start',
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: space.s},
  chip: {
    paddingHorizontal: space.m,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  horarioFila: {flexDirection: 'row', alignItems: 'center'},
});
