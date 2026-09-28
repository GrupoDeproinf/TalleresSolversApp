// Piezas de interfaz del registro nuevo (conductor y taller).
// Un solo estilo: azul marino de base, amarillo solo para la acción principal,
// verde/rojo solo para estados. Áreas táctiles de 44 px o más.
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, fonts} from '../../ui/tokens';

// Alias del sistema visual único (src/ui/tokens.js).
export const C = {
  navy: colors.navy,
  blue: colors.blue,
  yellow: colors.yellow,
  bg: colors.bg,
  card: colors.card,
  border: colors.border,
  text: colors.text,
  muted: colors.muted,
  ok: colors.ok,
  okBg: colors.okBg,
  error: colors.error,
  errorBg: colors.errorBg,
  warn: colors.warn,
  warnBg: colors.warnBg,
};

/** Encabezado del paso: "Paso 2 de 4 · Se guarda automáticamente" + barra. */
export const StepHeader = ({step, total, title, subtitle, savedLabel}) => (
  <View style={s.stepHeader}>
    <Text style={s.stepCounter}>
      Paso {step} de {total}
      {savedLabel ? ` · ${savedLabel}` : ''}
    </Text>
    <View style={s.progressTrack}>
      <View style={[s.progressFill, {width: `${(step / total) * 100}%`}]} />
    </View>
    <Text style={s.stepTitle}>{title}</Text>
    {subtitle ? <Text style={s.stepSubtitle}>{subtitle}</Text> : null}
  </View>
);

/**
 * Campo de texto con ayuda contextual y validación en línea.
 * - help: formato esperado (se muestra mientras no haya error)
 * - error: mensaje claro de qué falta
 * - ok: marca verde cuando el valor está bien
 */
export const Field = ({
  label,
  help,
  error,
  ok,
  okText,
  secure,
  right,
  style,
  inputStyle,
  ...inputProps
}) => {
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);
  const borderColor = error ? C.error : ok ? C.ok : focused ? C.blue : C.border;
  return (
    <View style={[s.field, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={s.fieldRow}>
        <View style={[s.inputWrap, {borderColor}]}>
          <TextInput
            placeholderTextColor="#9AA0B4"
            style={[s.input, inputStyle]}
            secureTextEntry={hidden}
            accessibilityLabel={label}
            {...inputProps}
            onFocus={e => {
              setFocused(true);
              inputProps.onFocus && inputProps.onFocus(e);
            }}
            onBlur={e => {
              setFocused(false);
              inputProps.onBlur && inputProps.onBlur(e);
            }}
          />
          {secure ? (
            <TouchableOpacity
              onPress={() => setHidden(h => !h)}
              style={s.eye}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}>
              <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={C.muted} />
            </TouchableOpacity>
          ) : ok ? (
            <Ionicons name="checkmark-circle" size={22} color={C.ok} style={s.okIcon} />
          ) : null}
        </View>
        {right}
      </View>
      {error ? (
        <Text style={s.error} accessibilityLiveRegion="polite">{error}</Text>
      ) : ok && okText ? (
        <Text style={s.okText}>✓ {okText}</Text>
      ) : help ? (
        <Text style={s.help}>{help}</Text>
      ) : null}
    </View>
  );
};

/** Botón con cinco estados: normal, presionado, cargando, deshabilitado y éxito. */
export const PrimaryButton = ({title, onPress, loading, disabled, done, variant = 'primary', style}) => {
  const isPrimary = variant === 'primary';
  const off = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={off}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{disabled: off, busy: !!loading}}
      style={[
        s.btn,
        isPrimary ? s.btnPrimary : s.btnSecondary,
        off && !loading && s.btnDisabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? C.yellow : C.navy} />
      ) : (
        <Text style={[s.btnText, isPrimary ? s.btnTextPrimary : s.btnTextSecondary]}>
          {done ? '✓ ' : ''}
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

/** Mensaje de error general con acción (ej. "Reintentar"). */
export const Banner = ({type = 'error', text, actionLabel, onAction}) => {
  if (!text) return null;
  const palette =
    type === 'ok'
      ? {bg: C.okBg, fg: C.ok, icon: 'checkmark-circle'}
      : type === 'warn'
      ? {bg: C.warnBg, fg: C.warn, icon: 'time-outline'}
      : {bg: C.errorBg, fg: C.error, icon: 'alert-circle'};
  return (
    <View style={[s.banner, {backgroundColor: palette.bg}]} accessibilityLiveRegion="polite">
      <Ionicons name={palette.icon} size={20} color={palette.fg} />
      <Text style={[s.bannerText, {color: palette.fg}]}>{text}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} style={s.bannerAction} accessibilityRole="button">
          <Text style={[s.bannerActionText, {color: palette.fg}]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

/** Chip seleccionable (categorías, días, prefijos). */
export const Chip = ({label, selected, onPress, style}) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{selected: !!selected}}
    style={[s.chip, selected && s.chipOn, style]}>
    <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
  </TouchableOpacity>
);

export const Card = ({children, style}) => <View style={[s.card, style]}>{children}</View>;

export const s = StyleSheet.create({
  stepHeader: {marginBottom: 18},
  stepCounter: {fontFamily: fonts.regular, fontSize: 14, color: C.muted, marginBottom: 8},
  progressTrack: {height: 8, borderRadius: 4, backgroundColor: C.border, overflow: 'hidden'},
  progressFill: {height: '100%', backgroundColor: C.yellow, borderRadius: 4},
  stepTitle: {fontSize: 28, fontFamily: fonts.extrabold, color: C.navy, marginTop: 18},
  stepSubtitle: {fontFamily: fonts.regular, fontSize: 16, color: C.muted, marginTop: 4, lineHeight: 22},
  field: {marginBottom: 16},
  label: {fontSize: 15, fontFamily: fonts.bold, color: C.navy, marginBottom: 6},
  fieldRow: {flexDirection: 'row', alignItems: 'center'},
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: C.bg,
    paddingHorizontal: 14,
  },
  input: {flex: 1, fontFamily: fonts.regular, fontSize: 16, color: C.text, paddingVertical: 12},
  eye: {minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
  okIcon: {marginLeft: 6},
  help: {fontFamily: fonts.regular, fontSize: 13, color: C.muted, marginTop: 6},
  error: {fontSize: 13, color: C.error, marginTop: 6, fontFamily: fonts.semibold},
  okText: {fontSize: 13, color: C.ok, marginTop: 6, fontFamily: fonts.semibold},
  btn: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnPrimary: {backgroundColor: C.navy},
  btnSecondary: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.border},
  btnDisabled: {opacity: 0.45},
  btnText: {fontSize: 17, fontFamily: fonts.extrabold},
  btnTextPrimary: {color: C.yellow},
  btnTextSecondary: {color: C.navy},
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  bannerText: {flex: 1, fontSize: 14, fontFamily: fonts.semibold, lineHeight: 20},
  bannerAction: {minHeight: 44, justifyContent: 'center', paddingHorizontal: 6},
  bannerActionText: {fontSize: 14, fontFamily: fonts.extrabold, textDecorationLine: 'underline'},
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: {backgroundColor: C.yellow, borderColor: C.yellow},
  chipText: {fontSize: 15, color: C.navy, fontFamily: fonts.semibold},
  chipTextOn: {fontFamily: fonts.extrabold},
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
  },
});
