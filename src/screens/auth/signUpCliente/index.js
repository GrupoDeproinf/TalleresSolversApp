// Registro del conductor en un minuto (fase A del documento de mejora).
// Pide solo lo necesario para empezar a buscar: nombre, correo, teléfono y
// contraseña. Cédula y estado se completan después en "Editar perfil".
// Al terminar, entra directo a la app (sin volver al Login).
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../../../axiosInstance';
import {C, Field, PrimaryButton, Banner} from '../../../components/registro/ui';
import TermsModal from '../../../components/registro/TermsModal';
import PhoneInput from '../../../ui/PhoneInput';
import useDisponibilidad, {MSG_CORREO_EXISTE, MSG_TELEFONO_EXISTE} from '../../../components/registro/useDisponibilidad';
import IrALogin from '../../../components/registro/IrALogin';
import {
  validarNombre,
  validarCorreo,
  validarTelefono,
  validarPassword,
  normalizarTelefono,
  mensajeDeError,
} from '../../../components/registro/validators';
import {iniciarSesionTrasRegistro, obtenerTokenPushSeguro} from '../../../utils/authSession';

const DRAFT_KEY = '@registroClienteDraft';

const SignUpCliente = ({navigation}) => {
  const [form, setForm] = useState({nombre: '', email: '', phone: '', password: ''});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [termsVisible, setTermsVisible] = useState(false);
  const draftLoaded = useRef(false);

  // Retoma lo que ya había escrito (nunca la contraseña).
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          setForm(f => ({...f, nombre: d.nombre || '', email: d.email || '', phone: d.phone || ''}));
        }
      } catch (e) {}
      draftLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!draftLoaded.current) return;
    const {nombre, email, phone} = form;
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({nombre, email, phone})).catch(() => {});
  }, [form.nombre, form.email, form.phone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Correo y teléfono: se verifica si ya tienen cuenta mientras se escribe.
  const dispEmail = useDisponibilidad('email', form.email.trim().toLowerCase(), !validarCorreo(form.email));
  const dispPhone = useDisponibilidad('phone', normalizarTelefono(form.phone), !validarTelefono(form.phone));

  const errors = {
    nombre: validarNombre(form.nombre, 'tu nombre'),
    email: validarCorreo(form.email) || (dispEmail === 'taken' ? MSG_CORREO_EXISTE : ''),
    phone: validarTelefono(form.phone) || (dispPhone === 'taken' ? MSG_TELEFONO_EXISTE : ''),
    password: validarPassword(form.password),
  };
  const isValid = !Object.values(errors).some(Boolean);
  const show = k => (touched[k] ? errors[k] : '');
  const set = k => v => setForm(f => ({...f, [k]: v}));
  const touch = k => () => setTouched(t => ({...t, [k]: true}));

  const onCrear = () => {
    setTouched({nombre: true, email: true, phone: true, password: true});
    if (!isValid) {
      setBannerError('Revisa los campos marcados en rojo.');
      return;
    }
    setBannerError('');
    setTermsVisible(true);
  };

  const registrar = async () => {
    setTermsVisible(false);
    // El enlace "Términos y Condiciones" también abre el modal: si aún faltan
    // datos, "Acepto" no debe crear la cuenta, solo marcar lo que falta.
    if (!isValid) {
      onCrear();
      return;
    }
    setLoading(true);
    setBannerError('');
    const email = form.email.trim().toLowerCase();
    const phone = normalizarTelefono(form.phone);
    try {
      // Validación previa para dar un mensaje claro si ya existe.
      const [p, e] = await Promise.allSettled([
        api.post('/home/validatePhone', {phone}),
        api.post('/home/validateEmail', {email}),
      ]);
      if (e.status === 'rejected' && e.reason?.response?.status === 409) {
        setTouched(t => ({...t, email: true}));
        throw {friendly: 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.'};
      }
      if (p.status === 'rejected' && p.reason?.response?.status === 409) {
        throw {friendly: 'Este teléfono ya está registrado con otra cuenta.'};
      }

      const token = await obtenerTokenPushSeguro();
      await api.post('/usuarios/SaveClient', {
        Nombre: form.nombre.trim(),
        cedula: '',
        estado: '',
        phone,
        typeUser: 'Cliente',
        email,
        password: form.password,
        base64: null,
        token,
      });

      // Entra directo, sin pasar por el Login.
      try {
        await iniciarSesionTrasRegistro(email, form.password);
        await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
        navigation.reset({index: 0, routes: [{name: 'LoaderScreen'}]});
      } catch (loginErr) {
        await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
        Alert.alert('Solvers', 'Tu cuenta está lista. Inicia sesión para continuar.');
      }
    } catch (err) {
      setBannerError(err?.friendly || mensajeDeError(err, 'No pudimos crear tu cuenta. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={st.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={st.back}
            accessibilityRole="button"
            accessibilityLabel="Volver">
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={st.hTitle}>Crea tu cuenta</Text>
          <Text style={st.hSub}>En un minuto ya puedes buscar talleres cerca de ti.</Text>
        </View>

        <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
          <Banner text={bannerError} actionLabel={bannerError && !loading ? 'Reintentar' : ''} onAction={onCrear} />

          <Field
            label="¿Cómo te llamas?"
            placeholder="Nombre y apellido"
            value={form.nombre}
            onChangeText={set('nombre')}
            onBlur={touch('nombre')}
            error={show('nombre')}
            ok={touched.nombre && !errors.nombre}
            autoCapitalize="words"
            textContentType="name"
            returnKeyType="next"
          />
          <Field
            label="Correo"
            placeholder="nombre@gmail.com"
            value={form.email}
            onChangeText={set('email')}
            onBlur={touch('email')}
            error={dispEmail === 'taken' ? MSG_CORREO_EXISTE : show('email')}
            ok={dispEmail === 'ok' || (touched.email && !errors.email && dispEmail === 'error')}
            okText={dispEmail === 'ok' ? 'Correo disponible' : undefined}
            help={dispEmail === 'checking' ? 'Verificando que el correo esté disponible…' : 'Lo usarás para entrar y recuperar tu cuenta.'}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />
          {dispEmail === 'taken' ? <IrALogin onPress={() => navigation.navigate('Login')} /> : null}
          <PhoneInput
            label="Teléfono"
            value={form.phone}
            onChange={set('phone')}
            onBlur={touch('phone')}
            error={dispPhone === 'taken' ? MSG_TELEFONO_EXISTE : show('phone')}
            ok={dispPhone === 'ok' || (touched.phone && !errors.phone && dispPhone === 'error')}
            help={dispPhone === 'checking' ? 'Verificando que el teléfono esté disponible…' : 'Los talleres te contactarán por aquí.'}
          />
          {dispPhone === 'taken' ? <IrALogin onPress={() => navigation.navigate('Login')} /> : null}
          <Field
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChangeText={set('password')}
            onBlur={touch('password')}
            error={show('password')}
            help="Mínimo 6 caracteres. Toca el ojo para verla."
            secure
            autoCapitalize="none"
            textContentType="newPassword"
          />

          <PrimaryButton title="Crear cuenta" onPress={onCrear} loading={loading} style={{marginTop: 8}} />

          <Text style={st.legal}>
            Al crear tu cuenta aceptas los{' '}
            <Text style={st.link} onPress={() => setTermsVisible(true)}>
              Términos y Condiciones
            </Text>
            .
          </Text>

          <View style={st.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={st.footerBtn}>
              <Text style={st.footerText}>
                ¿Ya tienes cuenta? <Text style={st.link}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace('SignUpTaller')} style={st.footerBtn}>
              <Text style={st.footerText}>
                ¿Tienes un taller? <Text style={st.link}>Registra tu negocio</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        onAccept={registrar}
        acceptLabel="Acepto y crear cuenta"
      />
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  safe: {flex: 1, backgroundColor: C.navy},
  header: {backgroundColor: C.navy, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26},
  back: {width: 44, height: 44, justifyContent: 'center', marginLeft: -8},
  hTitle: {fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginTop: 6},
  hSub: {fontSize: 16, color: '#C9CCE0', marginTop: 6, lineHeight: 22},
  body: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingTop: 26,
    flexGrow: 1,
  },
  legal: {fontSize: 13, color: C.muted, textAlign: 'center', marginTop: 14, lineHeight: 19},
  link: {color: C.blue, fontWeight: '700'},
  footer: {marginTop: 22, alignItems: 'center'},
  footerBtn: {minHeight: 44, justifyContent: 'center'},
  footerText: {fontSize: 15, color: C.muted},
});

export default SignUpCliente;
