// Tarjeta "Servicios por completar" de la bandeja de Servicios del taller.
// Lista lo que eligió en el registro y aún no ha creado; cada fila abre el
// formulario con el nombre y la categoría ya llenos.
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../../axiosInstance';
import {categoriaPorGrupo} from '../../utils/serviciosPorCompletar';

const MARINO = '#1D1E56';
const AMARILLO = '#FFD60A';

// El catálogo cambia poco: se pide una vez por sesión de la app.
let catalogoEnMemoria = null;

const ServiciosPorCompletar = ({pendientes, onCompletar, titulo = 'Servicios por completar', maximo = 6}) => {
  const [categorias, setCategorias] = useState(catalogoEnMemoria || {});

  useEffect(() => {
    if (catalogoEnMemoria || !pendientes.length) return;
    api
      .get('/usuarios/catalogoServicios')
      .then(r => {
        catalogoEnMemoria = categoriaPorGrupo(r?.data?.grupos);
        setCategorias(catalogoEnMemoria);
      })
      .catch(() => {});
  }, [pendientes.length]);

  if (!pendientes.length) return null;
  const visibles = pendientes.slice(0, maximo);
  const resto = pendientes.length - visibles.length;

  return (
    <View style={s.tarjeta}>
      <View style={s.cabecera}>
        <Text style={s.titulo}>{titulo}</Text>
        <View style={s.contador}>
          <Text style={s.contadorTexto}>{pendientes.length}</Text>
        </View>
      </View>
      <Text style={s.ayuda}>Los elegiste al registrarte. Agrega precio, descripción y una foto para que los conductores los vean.</Text>
      {visibles.map(e => (
        <Pressable
          key={`${e.grupo}-${e.servicio}`}
          onPress={() => onCompletar({nombre: e.servicio, categoriaUid: categorias[e.grupo] || ''})}
          style={({pressed}) => [s.fila, pressed && {opacity: 0.85}]}
          accessibilityRole="button"
          accessibilityLabel={`Completar ${e.servicio}`}>
          <View style={s.icono}>
            <MaterialCommunityIcons name="wrench-outline" size={18} color={MARINO} />
          </View>
          <View style={{flex: 1}}>
            <Text style={s.nombre} numberOfLines={1}>{e.servicio}</Text>
            <Text style={s.falta}>Falta precio y foto</Text>
          </View>
          <View style={s.boton}>
            <Text style={s.botonTexto}>Completar</Text>
          </View>
        </Pressable>
      ))}
      {resto > 0 ? <Text style={s.resto}>y {resto} más</Text> : null}
    </View>
  );
};

const s = StyleSheet.create({
  tarjeta: {backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E3E6F0', padding: 14, marginHorizontal: 20, marginTop: 12, marginBottom: 4},
  cabecera: {flexDirection: 'row', alignItems: 'center'},
  titulo: {flex: 1, fontSize: 16, fontWeight: '800', color: MARINO},
  contador: {minWidth: 26, height: 26, borderRadius: 13, backgroundColor: AMARILLO, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6},
  contadorTexto: {fontSize: 13, fontWeight: '900', color: MARINO},
  ayuda: {fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 8, lineHeight: 18},
  fila: {flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F0F2F7'},
  icono: {width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF0F8', alignItems: 'center', justifyContent: 'center', marginRight: 10},
  nombre: {fontSize: 14.5, fontWeight: '700', color: MARINO},
  falta: {fontSize: 12, color: '#B45309', marginTop: 2},
  boton: {minHeight: 36, borderRadius: 999, backgroundColor: MARINO, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 8},
  botonTexto: {color: AMARILLO, fontWeight: '800', fontSize: 13},
  resto: {fontSize: 12.5, color: '#64748B', marginTop: 6, textAlign: 'center'},
});

export default ServiciosPorCompletar;
