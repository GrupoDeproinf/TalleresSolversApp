// Piezas de "Mi perfil" y de la cuenta del certificador: filas de menú
// agrupadas, cabecera con foto y acciones de cuenta (soporte, cerrar sesión).
import React from 'react';
import {View, Image, Pressable, Linking, Alert, StyleSheet} from 'react-native';
import {ChevronRight, ExternalLink} from 'lucide-react-native';
import {AppText, colors, space, radius, fonts, TOUCH} from './index';

const SIN_FOTO = require('../assets/noimageold.jpeg');

const SOPORTE_TEL = '584227658377';
const SOPORTE_TEXTO = '¡Hola! Necesito ayuda con Solvers';

/** Abre WhatsApp de soporte; si la app no está instalada, abre wa.me en el navegador. */
export const abrirSoporte = async () => {
  const texto = encodeURIComponent(SOPORTE_TEXTO);
  try {
    await Linking.openURL(`whatsapp://send?phone=+${SOPORTE_TEL}&text=${texto}`);
  } catch {
    try {
      await Linking.openURL(`https://wa.me/${SOPORTE_TEL}?text=${texto}`);
    } catch {
      Alert.alert('Solvers', 'No pudimos abrir WhatsApp. Escríbenos al +58 422-7658377.');
    }
  }
};

/** Pregunta antes de cerrar sesión. */
export const confirmarCerrarSesion = onConfirm =>
  Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta en este teléfono?', [
    {text: 'Cancelar', style: 'cancel'},
    {text: 'Cerrar sesión', style: 'destructive', onPress: onConfirm},
  ]);

/** Foto redonda; si no hay, la imagen genérica. */
export const Avatar = ({uri, size = 72, onPress, label}) => {
  const img = (
    <Image
      source={uri ? {uri} : SIN_FOTO}
      style={{width: size, height: size, borderRadius: size / 2, backgroundColor: colors.skeleton}}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
  if (!onPress) return img;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label || 'Cambiar foto'} hitSlop={6}>
      {img}
    </Pressable>
  );
};

/** Bloque blanco con título pequeño y filas separadas por una línea. */
export const GrupoMenu = ({titulo, children, style}) => {
  const filas = React.Children.toArray(children).filter(Boolean);
  if (!filas.length) return null;
  return (
    <View style={[c.grupo, style]}>
      {titulo ? (
        <AppText variant="caption" color={colors.muted} style={c.grupoTitulo} accessibilityRole="header">
          {titulo.toUpperCase()}
        </AppText>
      ) : null}
      <View style={c.grupoCaja}>
        {filas.map((f, i) => (
          <View key={i}>
            {i > 0 ? <View style={c.separador} /> : null}
            {f}
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Fila de menú: ícono, título, ayuda opcional y flecha.
 * - `externo`: se abre fuera de la app (muestra el ícono de enlace).
 * - `peligro`: texto en rojo y sin flecha (cerrar sesión, borrar cuenta).
 */
export const FilaMenu = ({icon: Icon, titulo, ayuda, onPress, externo, peligro, derecha}) => {
  const tono = peligro ? colors.error : colors.navy;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={externo ? 'link' : 'button'}
      accessibilityLabel={ayuda ? `${titulo}. ${ayuda}` : titulo}
      style={({pressed}) => [c.fila, pressed && {backgroundColor: colors.bg}]}>
      {Icon ? (
        <View style={[c.icono, peligro && {backgroundColor: colors.errorBg}]}>
          <Icon size={20} color={tono} strokeWidth={2.2} />
        </View>
      ) : null}
      <View style={{flex: 1}}>
        <AppText variant="body" color={tono} style={{fontFamily: fonts.medium}} numberOfLines={1}>
          {titulo}
        </AppText>
        {ayuda ? (
          <AppText variant="caption" color={colors.muted} numberOfLines={2}>
            {ayuda}
          </AppText>
        ) : null}
      </View>
      {derecha || null}
      {peligro ? null : externo ? (
        <ExternalLink size={18} color={colors.muted} strokeWidth={2.2} />
      ) : (
        <ChevronRight size={20} color={colors.muted} strokeWidth={2.2} />
      )}
    </Pressable>
  );
};

const c = StyleSheet.create({
  grupo: {marginTop: space.l},
  grupoTitulo: {marginLeft: space.xs, marginBottom: space.s, letterSpacing: 0.6},
  grupoCaja: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  separador: {height: 1, backgroundColor: colors.border, marginLeft: space.m + 40 + space.m},
  fila: {
    minHeight: TOUCH + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
