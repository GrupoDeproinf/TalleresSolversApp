// Métodos de pago que acepta el taller. Al marcar uno que tiene datos (Pago
// Móvil, Transferencia, Zelle, Zinli) se abre debajo un espacio para
// escribirlos de una vez. Escribirlos es opcional: si se dejan vacíos, el
// método queda marcado igual. Lo que se escriba lo ven los conductores en el
// perfil del taller.
import React from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {C} from './ui';

export const METODOS_PAGO = [
  {value: 'efectivo', label: 'Efectivo', icono: 'cash'},
  {value: 'pagoMovil', label: 'Pago Móvil', icono: 'cellphone-wireless'},
  {value: 'puntoVenta', label: 'Punto de venta', icono: 'credit-card-wireless-outline'},
  {value: 'transferencia', label: 'Transferencia', icono: 'bank-transfer'},
  {value: 'tarjetaCreditoN', label: 'Crédito nacional', icono: 'credit-card-outline'},
  {value: 'tarjetaCreditoI', label: 'Crédito internacional', icono: 'credit-card-multiple-outline'},
  {value: 'zelle', label: 'Zelle', icono: 'alpha-z-circle-outline'},
  {value: 'zinli', label: 'Zinli', icono: 'wallet-outline'},
];

// Deben coincidir con los que acepta el servidor (perfilTaller.CAMPOS_PAGO).
export const CAMPOS_PAGO = {
  pagoMovil: [
    {clave: 'banco', label: 'Banco', placeholder: 'Banco de Venezuela'},
    {clave: 'telefono', label: 'Teléfono', placeholder: '0414 1234567', teclado: 'phone-pad'},
    {clave: 'documento', label: 'Cédula o RIF', placeholder: 'J-12345678-9'},
  ],
  transferencia: [
    {clave: 'banco', label: 'Banco', placeholder: 'Banesco'},
    {clave: 'cuenta', label: 'Número de cuenta', placeholder: '0134 0000 00 0000000000', teclado: 'number-pad'},
    {clave: 'titular', label: 'Titular', placeholder: 'Taller Los Hermanos, C.A.'},
    {clave: 'documento', label: 'Cédula o RIF', placeholder: 'J-12345678-9'},
  ],
  zelle: [
    {clave: 'correo', label: 'Correo o teléfono', placeholder: 'pagos@tutaller.com', teclado: 'email-address'},
    {clave: 'titular', label: 'Titular', placeholder: 'Nombre de la cuenta'},
  ],
  zinli: [{clave: 'correo', label: 'Correo', placeholder: 'pagos@tutaller.com', teclado: 'email-address'}],
};

/** Deja solo los datos de los métodos marcados y sin campos vacíos. */
export const datosParaEnviar = (seleccion, datos) => {
  const salida = {};
  Object.keys(CAMPOS_PAGO).forEach(metodo => {
    if (!seleccion?.[metodo]) return;
    const limpio = {};
    CAMPOS_PAGO[metodo].forEach(({clave}) => {
      const v = String(datos?.[metodo]?.[clave] || '').trim();
      if (v) limpio[clave] = v;
    });
    if (Object.keys(limpio).length) salida[metodo] = limpio;
  });
  return salida;
};

/** Texto de cada dato para mostrarlo en el perfil: [{label, valor}]. */
export const datosParaMostrar = (metodo, datos) =>
  (CAMPOS_PAGO[metodo] || [])
    .map(c => ({label: c.label, valor: String(datos?.[metodo]?.[c.clave] || '').trim()}))
    .filter(d => d.valor);

const MetodosPago = ({seleccion, datos, onChange}) => {
  const alternar = metodo => onChange({...seleccion, [metodo]: !seleccion?.[metodo]}, datos || {});
  const escribir = (metodo, clave, valor) =>
    onChange(seleccion, {...(datos || {}), [metodo]: {...(datos?.[metodo] || {}), [clave]: valor}});

  return (
    <View>
      {METODOS_PAGO.map(m => {
        const marcado = !!seleccion?.[m.value];
        const campos = CAMPOS_PAGO[m.value];
        return (
          <View key={m.value} style={[s.fila, marcado && s.filaMarcada]}>
            <TouchableOpacity
              style={s.cabecera}
              activeOpacity={0.8}
              onPress={() => alternar(m.value)}
              accessibilityRole="checkbox"
              accessibilityState={{checked: marcado}}
              accessibilityLabel={m.label}>
              <View style={[s.icono, marcado && s.iconoMarcado]}>
                <MaterialCommunityIcons name={m.icono} size={22} color={marcado ? C.yellow : C.navy} />
              </View>
              <Text style={s.nombre}>{m.label}</Text>
              <MaterialCommunityIcons
                name={marcado ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={24}
                color={marcado ? C.ok : C.muted}
              />
            </TouchableOpacity>
            {marcado && campos ? (
              <View style={s.datos}>
                <Text style={s.ayuda}>Datos para que te paguen (opcional). Los verán los conductores en tu perfil.</Text>
                {campos.map(c => (
                  <View key={c.clave} style={s.campo}>
                    <Text style={s.campoLabel}>{c.label}</Text>
                    <TextInput
                      style={s.input}
                      value={String(datos?.[m.value]?.[c.clave] || '')}
                      onChangeText={v => escribir(m.value, c.clave, v)}
                      placeholder={c.placeholder}
                      placeholderTextColor="#9AA0B4"
                      keyboardType={c.teclado || 'default'}
                      autoCapitalize={c.teclado === 'email-address' ? 'none' : 'sentences'}
                      autoCorrect={false}
                      maxLength={80}
                      accessibilityLabel={`${m.label}: ${c.label}`}
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  fila: {borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#FFFFFF', marginBottom: 8},
  filaMarcada: {borderColor: C.ok},
  cabecera: {flexDirection: 'row', alignItems: 'center', minHeight: 54, paddingHorizontal: 12},
  icono: {width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF0F8', alignItems: 'center', justifyContent: 'center'},
  iconoMarcado: {backgroundColor: C.navy},
  nombre: {flex: 1, marginLeft: 12, fontSize: 15.5, fontWeight: '700', color: C.navy},
  datos: {paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#EEF0F6'},
  ayuda: {fontSize: 12.5, color: C.muted, marginTop: 10, marginBottom: 2},
  campo: {marginTop: 8},
  campoLabel: {fontSize: 12.5, fontWeight: '700', color: C.navy, marginBottom: 4},
  input: {minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 12, fontSize: 15, color: C.text},
});

export default MetodosPago;
