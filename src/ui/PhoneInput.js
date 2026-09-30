// Campo de teléfono con selector de país (bandera + código).
// Valor de entrada y salida en el formato guardado (ver utils/telefono.js):
// Venezuela "4121234567", otros países "+573001234567".
import React, {useMemo, useState} from 'react';
import {View, Text, TextInput, Pressable, FlatList, StyleSheet} from 'react-native';
import {ChevronDown, Check, CheckCircle2} from 'lucide-react-native';
import {BottomSheet, SearchBar} from './index';
import {colors, fonts, radius, space, TOUCH, MAX_FONT_SCALE} from './tokens';
import {
  PAISES,
  leerTelefono,
  armarTelefono,
  formatearNacional,
} from '../utils/telefono';

const sinAcentos = s =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const PhoneInput = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  ok,
  help,
  editable = true,
  style,
  compact = false, // para formularios antiguos con su propio título
}) => {
  const leido = useMemo(() => leerTelefono(value), [value]);
  // El país elegido se recuerda aunque el número esté vacío.
  const [paisElegido, setPaisElegido] = useState(null);
  const pais = paisElegido && !String(value || '').trim() ? paisElegido : leido.pais;
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [foco, setFoco] = useState(false);

  const lista = useMemo(() => {
    const q = sinAcentos(busqueda.trim());
    if (!q) return PAISES;
    return PAISES.filter(
      p => sinAcentos(p.nombre).includes(q) || p.codigo.startsWith(q.replace('+', '')),
    );
  }, [busqueda]);

  const elegir = p => {
    setPaisElegido(p);
    setAbierto(false);
    setBusqueda('');
    onChange && onChange(armarTelefono(p, leido.nacional));
  };

  const borde = error ? colors.error : ok ? colors.ok : foco ? colors.blue : colors.border;

  return (
    <View style={[s.field, style]}>
      {label && !compact ? (
        <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={s.label}>
          {label}
        </Text>
      ) : null}
      <View style={[s.row, {borderColor: borde}, !editable && s.disabled]}>
        <Pressable
          onPress={() => editable && setAbierto(true)}
          disabled={!editable}
          accessibilityRole="button"
          accessibilityLabel={`País: ${pais.nombre}, código más ${pais.codigo}. Toca para cambiar`}
          style={({pressed}) => [s.pais, pressed && {backgroundColor: colors.border}]}>
          <Text style={s.bandera}>{pais.bandera}</Text>
          <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={s.codigo}>
            +{pais.codigo}
          </Text>
          {editable ? <ChevronDown size={16} color={colors.muted} strokeWidth={2.2} /> : null}
        </Pressable>
        <TextInput
          value={formatearNacional(pais, leido.nacional)}
          onChangeText={t => onChange && onChange(armarTelefono(pais, t))}
          onFocus={() => setFoco(true)}
          onBlur={e => {
            setFoco(false);
            onBlur && onBlur(e);
          }}
          editable={editable}
          placeholder={pais.ejemplo}
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={pais.max + 4}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={s.input}
          accessibilityLabel={label || 'Teléfono'}
        />
        {ok && !error ? (
          <CheckCircle2 size={22} color={colors.ok} strokeWidth={2.2} style={{marginRight: 12}} />
        ) : null}
      </View>
      {error ? (
        <Text style={s.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : help ? (
        <Text style={s.help}>{help}</Text>
      ) : null}

      <BottomSheet visible={abierto} onClose={() => setAbierto(false)} title="Elige el país">
        <SearchBar
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar país o código"
          style={s.buscar}
        />
        <FlatList
          data={lista}
          keyExtractor={p => p.iso}
          keyboardShouldPersistTaps="handled"
          style={s.lista}
          renderItem={({item}) => {
            const on = item.iso === pais.iso;
            return (
              <Pressable
                onPress={() => elegir(item)}
                accessibilityRole="button"
                accessibilityState={{selected: on}}
                style={({pressed}) => [s.item, pressed && {backgroundColor: colors.bg}]}>
                <Text style={s.bandera}>{item.bandera}</Text>
                <Text style={s.itemNombre} numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Text style={s.itemCodigo}>+{item.codigo}</Text>
                {on ? <Check size={20} color={colors.ok} strokeWidth={2.5} /> : <View style={{width: 20}} />}
              </Pressable>
            );
          }}
          ListEmptyComponent={<Text style={s.help}>No encontramos ese país.</Text>}
        />
      </BottomSheet>
    </View>
  );
};

const s = StyleSheet.create({
  field: {marginBottom: space.m},
  label: {fontFamily: fonts.bold, fontSize: 15, color: colors.navy, marginBottom: 6},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.m,
    borderWidth: 1.5,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  disabled: {opacity: 0.6},
  pais: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 52,
    minWidth: TOUCH + 44,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: '#ECEEF5',
  },
  bandera: {fontSize: 20},
  codigo: {fontFamily: fonts.semibold, fontSize: 16, color: colors.navy},
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  help: {fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 6},
  error: {fontFamily: fonts.semibold, fontSize: 13, color: colors.error, marginTop: 6},
  buscar: {backgroundColor: colors.bg, marginBottom: space.s},
  lista: {maxHeight: 380},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH + 8,
    gap: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemNombre: {flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.text},
  itemCodigo: {fontFamily: fonts.regular, fontSize: 15, color: colors.muted},
});

export default PhoneInput;
