// Mi perfil (conductor, taller y administrador).
// Rediseño con el sistema visual de la app: cabecera con foto y datos, el
// menú agrupado por tema y las acciones delicadas (cerrar sesión, borrar
// cuenta) separadas del resto y con confirmación.
import React, {useState, useEffect, useCallback} from 'react';
import {View, ScrollView, Linking, Alert, StyleSheet, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Store,
  Heart,
  Car,
  Tag as TagIcon,
  KeyRound,
  LifeBuoy,
  LogOut,
  Trash2,
  BarChart3,
  Camera,
} from 'lucide-react-native';

import api from '../../../axiosInstance';
import {AppText, Banner, Button, Tag, colors, space, radius} from '../../ui';
import {Avatar, GrupoMenu, FilaMenu, abrirSoporte, confirmarCerrarSesion} from '../../ui/cuenta';
import {cerrarSesionFirebase} from '../../utils/sesionSegura';

const SOLVERS_WEB_SIGN_IN = 'https://app.solversapp.com/sign-in?redirectUrl=/';

const TIPOS_CON_PERFIL = ['Cliente', 'Taller'];

/** El servidor responde "No se encontró el usuario" cuando el uid no está en Usuarios. */
const esUsuarioNoEncontrado = error => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const msg = typeof data === 'string' ? data : data?.message || data?.error || '';
  return status === 404 || /no se encontr/i.test(String(msg));
};

const vacio = v => v == null || String(v).trim() === '';

/** Qué le falta al perfil para estar completo (solo datos que se ven o se usan). */
const faltantes = u => {
  const f = [];
  if (vacio(u.image_perfil)) f.push('la foto');
  if (vacio(u.phone)) f.push('el teléfono');
  if (u.typeUser === 'Cliente' && vacio(u.cedula)) f.push('la cédula');
  return f;
};

const listaHumana = arr =>
  arr.length <= 1 ? arr.join('') : `${arr.slice(0, -1).join(', ')} y ${arr[arr.length - 1]}`;

/** Estado de la cuenta del taller, en palabras del dueño. */
const estadoTaller = u => {
  const cuenta = String(u.status || '');
  const plan = u.subscripcion_actual || null;
  const planStatus = String(plan?.status || '');
  if (cuenta === 'Rechazado') return {label: 'Cuenta rechazada', tone: 'error'};
  if (cuenta && cuenta !== 'Aprobado') return {label: 'En revisión', tone: 'warn'};
  if (!plan?.nombre) return {label: 'Sin plan', tone: 'neutral'};
  if (planStatus === 'Aprobado') return {label: `Plan ${plan.nombre}`, tone: 'ok'};
  if (planStatus === 'Vencido') return {label: `Plan ${plan.nombre} vencido`, tone: 'error', vencido: true};
  return {label: `Plan ${plan.nombre} · ${planStatus || 'pendiente'}`, tone: 'warn'};
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [infoUser, setinfoUser] = useState({uid: '', nombre: '', cedula: '', phone: '', typeUser: ''});
  const [imagePerfil, setimagePerfil] = useState('');
  // null | 'no_encontrada' (la cuenta ya no existe) | 'sin_conexion'
  const [avisoPerfil, setAvisoPerfil] = useState(null);
  // Hasta tener los datos del servidor no se dice qué falta en el perfil.
  const [cargado, setCargado] = useState(false);
  const [refrescando, setRefrescando] = useState(false);

  const getData = useCallback(async () => {
    let user = null;
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      user = jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      user = null;
    }

    // Primero lo que ya está guardado en la sesión: el menú correcto aparece
    // al instante y también sin conexión.
    if (user && typeof user === 'object') {
      setinfoUser(prev => ({...prev, ...user}));
      if (user.image_perfil) setimagePerfil(user.image_perfil);
    }
    if (!user?.uid) return;

    try {
      const response = await api.post('/usuarios/getUserByUid', {uid: user.uid});
      const userData = response?.data?.userData;
      if (response.status === 200 && userData) {
        setinfoUser(prev => ({...prev, ...userData}));
        setimagePerfil(userData.image_perfil || '');
        setAvisoPerfil(null);
        setCargado(true);
      }
    } catch (error) {
      if (esUsuarioNoEncontrado(error)) {
        // Los administradores no viven en Usuarios: es lo esperado para ellos.
        // Para un conductor o un taller significa que la cuenta ya no existe.
        setAvisoPerfil(TIPOS_CON_PERFIL.includes(user?.typeUser) ? 'no_encontrada' : null);
      } else {
        setAvisoPerfil('sin_conexion');
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getData();
    });
    return unsubscribe;
  }, [navigation, getData]);

  const refrescar = async () => {
    setRefrescando(true);
    await getData();
    setRefrescando(false);
  };

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('@userInfo');
    } catch (error) {
      console.warn('Error removing item:', error);
    }
    try {
      await AsyncStorage.removeItem('userToken');
      await cerrarSesionFirebase();
      navigation.replace('Login');
    } catch (error) {
      console.warn('Error logging out:', error);
    }
  };

  const borrarCuenta = () => {
    Alert.alert(
      'Borrar tu cuenta',
      'Se eliminan tu cuenta y tus datos de Solvers. No se puede deshacer.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Borrar cuenta',
          style: 'destructive',
          onPress: async () => {
            try {
              const jsonValue = await AsyncStorage.getItem('@userInfo');
              const user = jsonValue != null ? JSON.parse(jsonValue) : null;
              await api.post('/usuarios/deleteUserFromAuth', {uid: user?.uid});
              cerrarSesion();
            } catch (error) {
              Alert.alert('Solvers', 'No pudimos eliminar tu cuenta. Revisa tu conexión e inténtalo de nuevo.');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const abrirPanelWeb = async () => {
    try {
      await Linking.openURL(SOLVERS_WEB_SIGN_IN);
    } catch (e) {
      Alert.alert('Solvers', 'No se pudo abrir el enlace. Comprueba tu conexión e inténtalo de nuevo.');
    }
  };

  const esCliente = infoUser.typeUser === 'Cliente';
  const esTaller = infoUser.typeUser === 'Taller';
  const esAdmin = !esCliente && !esTaller;

  // Perfil del negocio en una sola pantalla (antes: editor de 7 pasos).
  const irAEditar = () => navigation.navigate(esTaller ? 'PerfilNegocio' : 'EditProfile');

  const tipoVisible = esCliente ? 'Conductor' : esTaller ? 'Taller' : infoUser.typeUser || 'Administrador';
  const estado = esTaller ? estadoTaller(infoUser) : null;
  const pendientes = cargado && !esAdmin ? faltantes({...infoUser, image_perfil: imagePerfil}) : [];

  return (
    <View style={s.pantalla}>
      <View style={[s.header, {paddingTop: insets.top + space.m}]}>
        <AppText variant="title" color={colors.onNavy} accessibilityRole="header">
          Mi perfil
        </AppText>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.navy} />}>
        {/* ── Quién eres ── */}
        <View style={s.tarjeta}>
          <View style={s.fila}>
            <View>
              <Avatar
                uri={imagePerfil}
                size={72}
                onPress={esAdmin ? undefined : irAEditar}
                label={esTaller ? 'Editar el perfil del negocio' : 'Editar tu perfil'}
              />
              {!esAdmin && !imagePerfil ? (
                <View style={s.camara} pointerEvents="none">
                  <Camera size={14} color={colors.navy} strokeWidth={2.4} />
                </View>
              ) : null}
            </View>
            <View style={{flex: 1, gap: 2}}>
              <AppText variant="subtitle" numberOfLines={2}>
                {infoUser.nombre || 'Usuario'}
              </AppText>
              <AppText variant="caption" color={colors.muted} numberOfLines={1}>
                {infoUser.email || 'Sin correo registrado'}
              </AppText>
              <View style={s.etiquetas}>
                <Tag label={tipoVisible} tone="info" />
                {estado ? <Tag label={estado.label} tone={estado.tone} /> : null}
              </View>
            </View>
          </View>
          {!esAdmin ? (
            <Button
              title={esTaller ? 'Editar perfil del negocio' : 'Editar mi perfil'}
              variant="secondary"
              size="m"
              onPress={irAEditar}
              style={{marginTop: space.m}}
            />
          ) : null}
        </View>

        {avisoPerfil === 'no_encontrada' ? (
          <Banner
            tone="error"
            text="No encontramos tu cuenta en Solvers. Puede que se haya eliminado. Inicia sesión de nuevo."
            actionLabel="Iniciar sesión"
            onAction={cerrarSesion}
            style={s.aviso}
          />
        ) : avisoPerfil === 'sin_conexion' ? (
          <Banner
            tone="warn"
            text="No pudimos actualizar tus datos. Revisa tu conexión."
            actionLabel="Reintentar"
            onAction={getData}
            style={s.aviso}
          />
        ) : pendientes.length ? (
          <Banner
            tone="info"
            text={`Te falta ${listaHumana(pendientes)}. Con el perfil completo ${
              esTaller ? 'los conductores confían más en tu negocio' : 'los talleres te atienden más rápido'
            }.`}
            actionLabel="Completar"
            onAction={irAEditar}
            style={s.aviso}
          />
        ) : null}

        {/* ── Menú ── */}
        {esCliente ? (
          <GrupoMenu titulo="Tu cuenta">
            <FilaMenu icon={User} titulo="Datos personales" ayuda="Nombre, cédula, teléfono y foto" onPress={irAEditar} />
            <FilaMenu
              icon={Car}
              titulo="Mis vehículos"
              ayuda="Tus carros y sus mantenimientos"
              onPress={() => navigation.navigate('VehiclesScreen')}
            />
            <FilaMenu
              icon={Heart}
              titulo="Mis intereses"
              ayuda="Servicios y talleres que guardaste"
              onPress={() => navigation.navigate('OrderHistory')}
            />
          </GrupoMenu>
        ) : null}

        {esTaller ? (
          <GrupoMenu titulo="Tu negocio">
            <FilaMenu
              icon={Store}
              titulo="Perfil del negocio"
              ayuda="Datos, horario, fotos y documentos"
              onPress={irAEditar}
            />
            <FilaMenu
              icon={TagIcon}
              titulo="Planes"
              ayuda={estado?.vencido ? 'Tu plan venció: renuévalo aquí' : 'Tu plan y renovaciones'}
              onPress={() => navigation.navigate('Planes')}
            />
            <FilaMenu
              icon={BarChart3}
              titulo="Panel web"
              ayuda="Estadísticas completas, en el navegador"
              externo
              onPress={abrirPanelWeb}
            />
            <FilaMenu
              icon={Car}
              titulo="Mis vehículos"
              ayuda="Si también usas Solvers como conductor"
              onPress={() => navigation.navigate('VehiclesScreen')}
            />
          </GrupoMenu>
        ) : null}

        <GrupoMenu titulo="Seguridad y ayuda">
          {!esAdmin ? (
            <FilaMenu
              icon={KeyRound}
              titulo="Cambiar contraseña"
              ayuda="Te enviamos un enlace a tu correo"
              onPress={() => navigation.navigate('ForgetPassword')}
            />
          ) : null}
          <FilaMenu icon={LifeBuoy} titulo="Soporte" ayuda="Escríbenos por WhatsApp" externo onPress={abrirSoporte} />
        </GrupoMenu>

        <GrupoMenu>
          <FilaMenu icon={LogOut} titulo="Cerrar sesión" peligro onPress={() => confirmarCerrarSesion(cerrarSesion)} />
        </GrupoMenu>

        {!esAdmin ? (
          <Button
            title="Borrar mi cuenta"
            variant="ghost"
            size="m"
            icon={Trash2}
            onPress={borrarCuenta}
            style={{marginTop: space.l, alignSelf: 'center'}}
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  pantalla: {flex: 1, backgroundColor: colors.bg},
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: space.m,
    paddingBottom: space.xl + space.l,
    borderBottomLeftRadius: radius.l,
    borderBottomRightRadius: radius.l,
  },
  // La tarjeta de arriba se monta sobre la franja azul.
  scroll: {flex: 1, marginTop: -(space.xl + space.s)},
  contenido: {paddingHorizontal: space.m, paddingBottom: space.xxl * 2},
  tarjeta: {backgroundColor: colors.card, borderRadius: radius.l, padding: space.m},
  fila: {flexDirection: 'row', alignItems: 'center', gap: space.m},
  etiquetas: {flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.xs},
  camara: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aviso: {marginTop: space.m},
});

export default ProfileScreen;
