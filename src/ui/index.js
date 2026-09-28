// Biblioteca de componentes de Solvers (propuesta de mejora, sección 5).
// Se construyen una vez y se usan en todas las pantallas nuevas.
// Íconos: un solo set (lucide-react-native), trazo 2.
import React from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
} from 'react-native';
import {
  Search,
  X,
  Star,
  MapPin,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  Info,
} from 'lucide-react-native';
import {Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, space, radius, type, fonts, shadow, TOUCH, MAX_FONT_SCALE} from './tokens';

export * from './tokens';

/**
 * Márgenes del sistema (barra de estado arriba, barra de gestos abajo).
 * En iOS la app ya está dentro del SafeAreaView de React Native (App.tsx), que
 * aplica esos márgenes: sumarlos otra vez los duplicaría. En Android ese
 * SafeAreaView no hace nada y, con edge-to-edge (targetSdk 35+), hay que
 * aplicarlos a mano.
 */
export const useMargenesSistema = () => {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'android' ? {top: insets.top, bottom: insets.bottom} : {top: 0, bottom: 0};
};

// ── Texto ──────────────────────────────────────────────────────────────────

/** Texto con los cuatro niveles del sistema (display/title/subtitle/body/caption). */
export const AppText = ({variant = 'body', color, style, children, ...rest}) => (
  <Text
    maxFontSizeMultiplier={MAX_FONT_SCALE}
    style={[type[variant], {color: color || colors.text}, style]}
    {...rest}>
    {children}
  </Text>
);

// ── Botón (cinco estados) ──────────────────────────────────────────────────

const BTN = {
  primary: {bg: colors.navy, bgPressed: '#151833', fg: colors.yellow, border: colors.navy},
  accent: {bg: colors.yellow, bgPressed: colors.yellowPressed, fg: colors.navy, border: colors.yellow},
  secondary: {bg: colors.card, bgPressed: colors.bg, fg: colors.navy, border: colors.border},
  ghost: {bg: 'transparent', bgPressed: colors.bg, fg: colors.navy, border: 'transparent'},
  success: {bg: colors.ok, bgPressed: colors.ok, fg: '#FFFFFF', border: colors.ok},
};

/**
 * Botón con cinco estados: normal, presionado, cargando, deshabilitado y éxito.
 * - `accent` (amarillo) solo para la acción principal de la pantalla.
 */
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  done = false,
  icon: Icon,
  size = 'l',
  style,
  accessibilityLabel,
}) => {
  const v = BTN[done ? 'success' : variant] || BTN.primary;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off || done}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{disabled: off, busy: loading}}
      style={({pressed}) => [
        ui.btn,
        size === 'm' && ui.btnM,
        {backgroundColor: pressed ? v.bgPressed : v.bg, borderColor: v.border},
        disabled && !loading && ui.btnDisabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={ui.btnRow}>
          {done ? (
            <Check size={18} color={v.fg} strokeWidth={2.5} />
          ) : Icon ? (
            <Icon size={18} color={v.fg} strokeWidth={2.2} />
          ) : null}
          <Text
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            numberOfLines={1}
            style={[ui.btnText, size === 'm' && ui.btnTextM, {color: v.fg}]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

/** Botón de solo ícono: siempre con etiqueta para lector de pantalla. */
export const IconButton = ({icon: Icon, onPress, label, color = colors.navy, bg = 'transparent', size = 22, style}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={6}
    style={({pressed}) => [ui.iconBtn, {backgroundColor: bg, opacity: pressed ? 0.7 : 1}, style]}>
    <Icon size={size} color={color} strokeWidth={2.2} />
  </Pressable>
);

// ── Chips y etiquetas ──────────────────────────────────────────────────────

/** Chip de categoría o filtro. Seleccionado = amarillo. */
export const Chip = ({label, selected, onPress, icon: Icon, style}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{selected: !!selected}}
    style={({pressed}) => [
      ui.chip,
      selected && ui.chipOn,
      pressed && !selected && {backgroundColor: colors.bg},
      style,
    ]}>
    {Icon ? <Icon size={16} color={colors.navy} strokeWidth={2.2} /> : null}
    <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[ui.chipText, selected && ui.chipTextOn]}>
      {label}
    </Text>
  </Pressable>
);

const TAG = {
  ok: {bg: colors.okBg, fg: colors.ok},
  warn: {bg: colors.warnBg, fg: colors.warn},
  error: {bg: colors.errorBg, fg: colors.error},
  info: {bg: colors.infoBg, fg: colors.info},
  neutral: {bg: colors.bg, fg: colors.muted},
};

/** Etiqueta de estado (abierto, en revisión, rechazado…). */
export const Tag = ({label, tone = 'neutral', style}) => {
  const t = TAG[tone] || TAG.neutral;
  return (
    <View style={[ui.tag, {backgroundColor: t.bg}, style]}>
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[ui.tagText, {color: t.fg}]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

// ── Contenedores ───────────────────────────────────────────────────────────

export const Card = ({children, style, onPress, accessibilityLabel}) =>
  onPress ? (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({pressed}) => [ui.card, pressed && ui.cardPressed, style]}>
      {children}
    </Pressable>
  ) : (
    <View style={[ui.card, style]}>{children}</View>
  );

/** Aviso con causa y acción ("No hay conexión · Reintentar"). */
export const Banner = ({tone = 'error', text, actionLabel, onAction, style}) => {
  if (!text) return null;
  const t = TAG[tone] || TAG.error;
  const Icon = tone === 'ok' ? CheckCircle2 : tone === 'warn' ? Clock : tone === 'info' ? Info : AlertCircle;
  return (
    <View style={[ui.banner, {backgroundColor: t.bg}, style]} accessibilityLiveRegion="polite">
      <Icon size={20} color={t.fg} strokeWidth={2.2} />
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[ui.bannerText, {color: t.fg}]}>
        {text}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onAction} accessibilityRole="button" style={ui.bannerAction}>
          <Text style={[ui.bannerActionText, {color: t.fg}]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

/** Estado vacío con ilustración (ícono), explicación y siguiente paso. */
export const EmptyState = ({icon: Icon = Search, title, message, actionLabel, onAction, style}) => (
  <View style={[ui.empty, style]}>
    <View style={ui.emptyIcon}>
      <Icon size={30} color={colors.navy} strokeWidth={2} />
    </View>
    {title ? (
      <AppText variant="subtitle" style={ui.center}>
        {title}
      </AppText>
    ) : null}
    {message ? (
      <AppText variant="body" color={colors.muted} style={[ui.center, {marginTop: space.xs}]}>
        {message}
      </AppText>
    ) : null}
    {actionLabel ? (
      <Button title={actionLabel} onPress={onAction} variant="secondary" size="m" style={{marginTop: space.m}} />
    ) : null}
  </View>
);

/** Bloque gris de carga (en lugar de un spinner a pantalla completa). */
export const Skeleton = ({width = '100%', height = 16, r = radius.s, style}) => (
  <View style={[{width, height, borderRadius: r, backgroundColor: colors.skeleton}, style]} />
);

export const TallerCardSkeleton = () => (
  <View style={[ui.card, ui.tallerRow]}>
    <Skeleton width={72} height={72} r={radius.m} />
    <View style={{flex: 1, marginLeft: space.m, gap: space.s}}>
      <Skeleton width="70%" height={18} />
      <Skeleton width="50%" height={14} />
      <Skeleton width={70} height={22} r={radius.pill} />
    </View>
  </View>
);

// ── Búsqueda ───────────────────────────────────────────────────────────────

export const SearchBar = ({value, onChangeText, placeholder, onSubmit, autoFocus, style}) => (
  <View style={[ui.search, style]}>
    <Search size={20} color={colors.muted} strokeWidth={2.2} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      style={ui.searchInput}
      returnKeyType="search"
      onSubmitEditing={onSubmit}
      autoFocus={autoFocus}
      autoCorrect={false}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      accessibilityLabel={placeholder}
    />
    {value ? (
      <IconButton icon={X} label="Borrar búsqueda" onPress={() => onChangeText('')} color={colors.muted} size={18} />
    ) : null}
  </View>
);

// ── Tarjeta de taller / servicio ───────────────────────────────────────────

/**
 * Tarjeta compacta: nombre, distancia, valoración y abierto/cerrado en una
 * línea de lectura, más la categoría o el precio.
 */
export const TallerCard = ({
  title,
  subtitle,
  imageUri,
  distance,
  rating,
  open, // 'open' | 'closed' | 'unknown'
  tag,
  price,
  onPress,
}) => {
  const meta = [
    distance,
    rating ? `★ ${rating}` : null,
    open === 'open' ? 'Abierto' : open === 'closed' ? 'Cerrado' : null,
  ].filter(Boolean);
  const a11y = [title, subtitle, ...meta, tag, price ? `desde ${price}` : null].filter(Boolean).join(', ');
  return (
    <Card onPress={onPress} style={ui.tallerRow} accessibilityLabel={a11y}>
      <View style={ui.tallerImgWrap}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={ui.tallerImg} resizeMode="cover" />
        ) : (
          <MapPin size={26} color={colors.muted} strokeWidth={2} />
        )}
      </View>
      <View style={ui.tallerBody}>
        <AppText variant="subtitle" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.muted} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
        {meta.length ? (
          <View style={ui.metaRow}>
            {meta.map((m, i) => (
              <React.Fragment key={m}>
                {i > 0 ? <Text style={ui.metaDot}> · </Text> : null}
                {m.startsWith('★') ? (
                  <View style={ui.ratingInline}>
                    <Star size={13} color={colors.navy} fill={colors.navy} />
                    <Text style={ui.metaText}> {m.slice(2)}</Text>
                  </View>
                ) : (
                  <Text
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                    style={[
                      ui.metaText,
                      m === 'Abierto' && {color: colors.ok, fontFamily: fonts.semibold},
                      m === 'Cerrado' && {color: colors.error, fontFamily: fonts.semibold},
                    ]}>
                    {m}
                  </Text>
                )}
              </React.Fragment>
            ))}
          </View>
        ) : null}
        {tag || price ? (
          <View style={ui.tallerFooter}>
            {tag ? <Tag label={tag} tone="ok" /> : <View />}
            {price ? (
              <AppText variant="caption" color={colors.navy} style={{fontFamily: fonts.semibold}}>
                desde {price}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
};

// ── Selector de dos opciones (Lista / Mapa) ────────────────────────────────

export const Segmented = ({options, value, onChange, style}) => (
  <View style={[ui.segment, style]} accessibilityRole="tablist">
    {options.map(o => {
      const on = o.value === value;
      const Icon = o.icon;
      return (
        <Pressable
          key={o.value}
          onPress={() => onChange(o.value)}
          accessibilityRole="tab"
          accessibilityState={{selected: on}}
          style={[ui.segmentItem, on && ui.segmentOn]}>
          {Icon ? <Icon size={16} color={on ? colors.navy : colors.muted} strokeWidth={2.2} /> : null}
          <Text style={[ui.segmentText, on && ui.segmentTextOn]}>{o.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

// ── Hoja inferior para acciones secundarias ────────────────────────────────

export const BottomSheet = ({visible, onClose, title, children}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <Pressable style={ui.sheetOverlay} onPress={onClose} accessibilityLabel="Cerrar" accessibilityRole="button" />
    <View style={ui.sheet}>
      <View style={ui.sheetHandle} />
      <View style={ui.sheetHeader}>
        <AppText variant="title" style={{flex: 1}}>
          {title}
        </AppText>
        <IconButton icon={X} label="Cerrar" onPress={onClose} />
      </View>
      {children}
    </View>
  </Modal>
);

// ── Estilos ────────────────────────────────────────────────────────────────

const ui = StyleSheet.create({
  center: {textAlign: 'center'},
  btn: {
    minHeight: 54,
    borderRadius: radius.l,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.l,
  },
  btnM: {minHeight: TOUCH, borderRadius: radius.m, paddingHorizontal: space.m},
  btnDisabled: {opacity: 0.45},
  btnRow: {flexDirection: 'row', alignItems: 'center', gap: space.s},
  btnText: {fontFamily: fonts.bold, fontSize: 17},
  btnTextM: {fontSize: 15},
  iconBtn: {
    minWidth: TOUCH,
    minHeight: TOUCH,
    borderRadius: TOUCH / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    minHeight: TOUCH,
    paddingHorizontal: space.m,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: space.s,
  },
  chipOn: {backgroundColor: colors.yellow, borderColor: colors.yellow},
  chipText: {fontFamily: fonts.medium, fontSize: 15, color: colors.navy},
  chipTextOn: {fontFamily: fonts.bold},
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {fontFamily: fonts.semibold, fontSize: 12},
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.m,
    marginBottom: 12,
    ...shadow.card,
  },
  cardPressed: {backgroundColor: '#FAFAFD', transform: [{scale: 0.99}]},
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.m,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: space.s,
  },
  bannerText: {flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20},
  bannerAction: {minHeight: TOUCH, justifyContent: 'center', paddingHorizontal: 6},
  bannerActionText: {fontFamily: fonts.bold, fontSize: 14, textDecorationLine: 'underline'},
  empty: {alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.l},
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.m,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.l,
    paddingLeft: space.m,
    paddingRight: space.xs,
    minHeight: 54,
    gap: space.s,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  tallerRow: {flexDirection: 'row', alignItems: 'center', padding: 12},
  tallerImgWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.m,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tallerImg: {width: '100%', height: '100%'},
  tallerBody: {flex: 1, marginLeft: 12, gap: 2},
  metaRow: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 2},
  metaText: {fontFamily: fonts.regular, fontSize: 14, color: colors.muted},
  metaDot: {fontSize: 14, color: colors.muted},
  ratingInline: {flexDirection: 'row', alignItems: 'center'},
  tallerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    padding: 4,
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: radius.pill,
  },
  segmentOn: {backgroundColor: colors.card, ...shadow.card},
  segmentText: {fontFamily: fonts.medium, fontSize: 14, color: colors.muted},
  segmentTextOn: {fontFamily: fonts.bold, color: colors.navy},
  sheetOverlay: {flex: 1, backgroundColor: colors.overlay},
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.l,
    paddingBottom: space.xl,
    paddingTop: space.s,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: space.s,
  },
  sheetHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: space.m},
});
