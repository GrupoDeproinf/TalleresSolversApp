import { Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../axiosInstance';
import { useValues } from '../../../../App';
import TallerEditStepper from '../editProfile/TallerEditStepper';
import epStyles from '../editProfile/style.css';

const DARK_BLUE = '#1F2344';
const YELLOW = '#FFD60A';

const BUSINESS_DAYS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const buildDefaultBusinessHours = () =>
  BUSINESS_DAYS.reduce((acc, day) => {
    acc[day.key] = { enabled: false, open: '08:00', close: '17:00' };
    return acc;
  }, {});

const mergeHorariosFromApi = raw => {
  const base = buildDefaultBusinessHours();
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  BUSINESS_DAYS.forEach(({ key }) => {
    const item = raw[key];
    if (item && typeof item === 'object') {
      base[key] = {
        enabled: !!item.enabled,
        open: item.open || base[key].open,
        close: item.close || base[key].close,
      };
    }
  });
  return base;
};

/** URLs públicas de documentos/imágenes guardadas en storage (no base64). */
const docUrlFromApi = v => {
  if (v == null || v === '') return '';
  const s = typeof v === 'string' ? v.trim() : String(v).trim();
  return /^https?:\/\//i.test(s) ? s : '';
};

const TallerEditProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { bgFullStyle } = useValues();

  const [uidUserConnected, setuidUserConnected] = useState('');
  const [email, setEmail] = useState('');
  const [cedula, setcedula] = useState(0);
  const [Nombre, setNombre] = useState('');
  const [phone, setPhone] = useState(0);
  const [Direccion, setDireccion] = useState('');
  const [RegComercial, setRegComercial] = useState('');
  const [Caracteristicas, setCaracteristicas] = useState('');
  const [Tarifa, setTarifa] = useState('');
  const [Experiencia, setExperiencia] = useState('');
  const [LinkFacebook, setLinkFacebook] = useState('');
  const [LinkInstagram, setLinkInstagram] = useState('');
  const [LinkTiktok, setLinkTiktok] = useState('');
  const [Garantia, setGarantia] = useState('');
  const [seguro, setseguro] = useState('');
  const [checked, setChecked] = useState('no');
  const [selectedPrefix, setSelectedPrefix] = useState('J-');
  const [whats, setwhats] = useState('');
  const [metodosPago, setMetodosPago] = useState([
    { label: 'Efectivo', value: 'efectivo', checked: false },
    { label: 'Pago Móvil', value: 'pagoMovil', checked: false },
    { label: 'Punto de venta', value: 'puntoVenta', checked: false },
    { label: 'Credito internacional', value: 'tarjetaCreditoI', checked: false },
    { label: 'Credito nacional', value: 'tarjetaCreditoN', checked: false },
    { label: 'Transferencia', value: 'transferencia', checked: false },
    { label: 'Zelle', value: 'zelle', checked: false },
    { label: 'Zinli', value: 'zinli', checked: false },
  ]);
  const [estadoSelected, setestadoSelected] = useState('');
  const [imagePerfil, setimagePerfil] = useState('');
  const [base64, setBase64] = useState(null);
  const [imageFirts, setimageFirts] = useState('');
  const [rifIdFiscalUrl, setRifIdFiscalUrl] = useState('');
  const [permisoOperacionUrl, setPermisoOperacionUrl] = useState('');
  const [logotipoNegocioUrl, setLogotipoNegocioUrl] = useState('');
  const [fotoFrenteTallerUrl, setFotoFrenteTallerUrl] = useState('');
  const [fotoInternaTallerUrl, setFotoInternaTallerUrl] = useState('');
  const [lat, setlat] = useState(10.4806);
  const [lng, setlng] = useState(-66.9036);
  const [businessHours, setBusinessHours] = useState(buildDefaultBusinessHours);
  const [tallerStepperProgress, setTallerStepperProgress] = useState({
    step: 1,
    total: 7,
  });
  /** Evita hidratar el stepper solo con uid: debe esperar al API o los campos quedan vacíos para siempre. */
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setProfileLoaded(false);
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      if (!user?.uid) {
        return;
      }
      setuidUserConnected(user.uid);

      try {
        const response = await api.post('/usuarios/getUserByUid', {
          uid: user.uid,
        });
        const result = response.data;
        if (response.status !== 200 || !result?.userData) {
          console.warn('Usuario no encontrado');
          setProfileLoaded(false);
          return;
        }

        const ud = result.userData;
        const pickDocUrl = key =>
          docUrlFromApi(ud[key] ?? result[key]);

        console.log('result', result);

        setNombre(ud.nombre || '');
        setEmail(ud.email || '');
        setPhone(ud.phone || '');
        setDireccion(ud.Direccion || '');
        setRegComercial(ud.RegComercial || '');
        setCaracteristicas(ud.Caracteristicas || '');
        setTarifa(ud.Tarifa || '');
        setExperiencia(ud.Experiencia || '');
        setLinkFacebook(ud.LinkFacebook || '');
        setLinkInstagram(ud.LinkInstagram || '');
        setLinkTiktok(ud.LinkTiktok || '');
        setGarantia(ud.Garantia || '');
        setseguro(ud.seguro || '');
        setimagePerfil(ud.image_perfil || '');
        setimageFirts(ud.image_perfil || '');
        setestadoSelected(ud.estado || '');

        setwhats(
          ud.whatsapp != null && ud.whatsapp !== ''
            ? String(ud.whatsapp)
            : '',
        );

        if (
          ud.ubicacion != null &&
          ud.ubicacion.lat != null &&
          ud.ubicacion.lng != null
        ) {
          setlat(Number(ud.ubicacion.lat));
          setlng(Number(ud.ubicacion.lng));
        }

        if (ud.metodos_pago && typeof ud.metodos_pago === 'object') {
          setMetodosPago(prev =>
            prev.map(m => ({
              ...m,
              checked: !!ud.metodos_pago[m.value],
            })),
          );
        }

        let horariosRaw = ud.horarios_atencion;
        if (typeof horariosRaw === 'string' && horariosRaw.trim()) {
          try {
            horariosRaw = JSON.parse(horariosRaw);
          } catch {
            horariosRaw = null;
          }
        }
        setBusinessHours(mergeHorariosFromApi(horariosRaw));

        const ag = ud.agenteAutorizado;
        if (ag === true || ag === 'si' || ag === 'Sí' || ag === 'SI') {
          setChecked('si');
        } else {
          setChecked('no');
        }

        if (ud.rif && String(ud.rif).includes('-')) {
          const typeID = String(ud.rif).split('-');
          setcedula(typeID[1] || '');
          setSelectedPrefix(`${typeID[0]}-`);
        }

        setRifIdFiscalUrl(pickDocUrl('rifIdFiscal'));
        setPermisoOperacionUrl(pickDocUrl('permisoOperacion'));
        setLogotipoNegocioUrl(pickDocUrl('logotipoNegocio'));
        setFotoFrenteTallerUrl(pickDocUrl('fotoFrenteTaller'));
        setFotoInternaTallerUrl(pickDocUrl('fotoInternaTaller'));

        setProfileLoaded(true);
      } catch (error) {
        setProfileLoaded(false);
        if (error.response) {
          console.error(
            'Error en la solicitud:',
            error.response.data?.message || error.response.statusText,
          );
        } else {
          console.error('Error en la solicitud:', error.message);
        }
      }
    } catch (e) {
      setProfileLoaded(false);
      console.log(e);
    }
  };

  const getImageName = url =>
    typeof url === 'string' && url ? url.split('/').pop() : '';

  const docImageTodelete = (storedUrl, newBase64) =>
    storedUrl && newBase64 ? getImageName(storedUrl) : '';

  /** Si el usuario subió archivo nuevo: base64 del payload; si no, la URL que ya venía del API. */
  const documentValueForApi = (payloadField, urlStored) => {
    if (payloadField != null && String(payloadField).trim() !== '') {
      return String(payloadField).trim();
    }
    return urlStored != null && urlStored !== '' ? String(urlStored) : '';
  };

  const showToast = text => {
    Alert.alert('Solvers Informa', text);
  };

  const handleTallerProfileSaveFromStepper = async payload => {
    if (!payload || !uidUserConnected) {
      return;
    }
    try {
      const phoneValidationResponse = await api.post('/home/validatePhone', {
        phone: payload.phone,
        uid: uidUserConnected,
      });

      const emailValidationResponse = await api.post('/home/validateEmail', {
        email: payload.email,
        uid: uidUserConnected,
      });

      if (
        phoneValidationResponse.status !== 200 ||
        phoneValidationResponse.data.valid !== true ||
        emailValidationResponse.status !== 200 ||
        emailValidationResponse.data.valid !== true
      ) {
        showToast(
          'El número de teléfono o el correo electrónico ya está registrado.',
        );
        return;
      }

      const infoUserCreated = {
        uid: uidUserConnected,
        nombre: payload.nombre ?? '',
        rif: payload.rif ?? '',
        phone: payload.phone ?? '',
        email: payload.email ?? '',
        Direccion: payload.Direccion ?? '',
        RegComercial: payload.RegComercial ?? '',
        Caracteristicas: payload.Caracteristicas ?? '',
        Tarifa: Tarifa ?? '',
        Experiencia: payload.Experiencia ?? '',
        LinkFacebook: payload.LinkFacebook ?? '',
        LinkInstagram: payload.LinkInstagram ?? '',
        LinkTiktok: payload.LinkTiktok ?? '',
        Garantia: Garantia ?? '',
        seguro: payload.seguro ?? '',
        agenteAutorizado:
          payload.agenteAutorizado === true ||
          payload.agenteAutorizado === 'si',
        whatsapp: payload.whatsapp ?? '',
        metodos_pago: payload.metodos_pago ?? {},
        estado: payload.estado ?? '',
        horarios_atencion: payload.horarios_atencion ?? businessHours,
        base64:
          payload.base64 == null || payload.base64 === undefined
            ? ''
            : payload.base64,
        imageTodelete:
          imageFirts !== '' && imageFirts !== undefined
            ? payload.base64 == null ||
              payload.base64 === undefined ||
              payload.base64 === ''
              ? ''
              : getImageName(imageFirts)
            : '',
        rifIdFiscal: documentValueForApi(
          payload.rifIdFiscal,
          rifIdFiscalUrl,
        ),
        permisoOperacion: documentValueForApi(
          payload.permisoOperacion,
          permisoOperacionUrl,
        ),
        logotipoNegocio: documentValueForApi(
          payload.logotipoNegocio,
          logotipoNegocioUrl,
        ),
        fotoFrenteTaller: documentValueForApi(
          payload.fotoFrenteTaller,
          fotoFrenteTallerUrl,
        ),
        fotoInternaTaller: documentValueForApi(
          payload.fotoInternaTaller,
          fotoInternaTallerUrl,
        ),
        rifIdFiscalTodelete: docImageTodelete(
          rifIdFiscalUrl,
          payload.rifIdFiscal,
        ),
        permisoOperacionTodelete: docImageTodelete(
          permisoOperacionUrl,
          payload.permisoOperacion,
        ),
        logotipoNegocioTodelete: docImageTodelete(
          logotipoNegocioUrl,
          payload.logotipoNegocio,
        ),
        fotoFrenteTallerTodelete: docImageTodelete(
          fotoFrenteTallerUrl,
          payload.fotoFrenteTaller,
        ),
        fotoInternaTallerTodelete: docImageTodelete(
          fotoInternaTallerUrl,
          payload.fotoInternaTaller,
        ),
        ubicacion: payload.ubicacion ?? { lat: payload.lat, lng: payload.lng },
        lat: payload.lat,
        lng: payload.lng,
      };

      console.log('infoUserCreated', infoUserCreated);

      const response = await api.post(
        '/usuarios/UpdateTallerUsuarioDocs',
        infoUserCreated,
      );

      if (response.status === 201 || response.status === 200) {
        try {
          const existing = await AsyncStorage.getItem('@userInfo');
          const prev = existing ? JSON.parse(existing) : {};
          const merged = {
            ...prev,
            ...infoUserCreated,
            uid: uidUserConnected,
            typeUser: 'Taller',
          };
          await AsyncStorage.setItem('@userInfo', JSON.stringify(merged));
        } catch (e) {
          console.error('Error al guardar en AsyncStorage:', e);
        }

        showToast('Taller actualizado exitosamente');
        navigation.goBack('');
      } else {
        const errorText = response.data;
        showToast(
          errorText?.message || 'Error inesperado en la actualización',
        );
      }
    } catch (error) {
      if (error.response) {
        showToast(
          error.response.data?.message ||
            'Error inesperado en la actualización',
        );
      } else {
        showToast('Error en la solicitud');
      }
    }
  };

  const handleTallerStepChange = useCallback((step, total) => {
    setTallerStepperProgress({ step, total });
  }, []);

  const initialTallerProfileForStepper = useMemo(
    () => ({
      hydrateReady: true,
      Nombre,
      cedula,
      email,
      selectedPrefix,
      estadoSelected,
      Direccion,
      RegComercial,
      phone,
      whats,
      Caracteristicas,
      Experiencia,
      LinkFacebook,
      LinkInstagram,
      LinkTiktok,
      seguro,
      checked,
      lat,
      lng,
      imageUri: imagePerfil || null,
      businessHours,
      metodosPago,
      rifIdFiscalUrl,
      permisoOperacionUrl,
      logotipoNegocioUrl,
      fotoFrenteTallerUrl,
      fotoInternaTallerUrl,
    }),
    [
      uidUserConnected,
      profileLoaded,
      Nombre,
      cedula,
      email,
      selectedPrefix,
      estadoSelected,
      Direccion,
      RegComercial,
      phone,
      whats,
      Caracteristicas,
      Experiencia,
      LinkFacebook,
      LinkInstagram,
      LinkTiktok,
      seguro,
      checked,
      lat,
      lng,
      imagePerfil,
      businessHours,
      metodosPago,
      rifIdFiscalUrl,
      permisoOperacionUrl,
      logotipoNegocioUrl,
      fotoFrenteTallerUrl,
      fotoInternaTallerUrl,
    ],
  );

  const progressTallerStepper = Math.round(
    (tallerStepperProgress.step /
      Math.max(tallerStepperProgress.total, 1)) *
      100,
  );

  return (
    <View
      style={[
        epStyles.signUpLikeRoot,
        { backgroundColor: bgFullStyle, padding: 30 },
      ]}>
      <View
        style={{
          marginHorizontal: -30,
          marginTop: -30,
          marginBottom: 16,
          backgroundColor: DARK_BLUE,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          overflow: 'hidden',
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 30,
          alignItems: 'center',
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderLeftColor: YELLOW,
          borderRightColor: YELLOW,
        }}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: insets.top + 8,
            paddingBottom: 8,
            paddingHorizontal: 0,
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={epStyles.signUpLikeHeaderBackBtn}
            accessibilityRole="button"
            accessibilityLabel="Volver">
            <Icons name="angle-left" size={22} color={YELLOW} />
          </TouchableOpacity>
          <View
            style={epStyles.signUpLikeHeaderTitleSlot}
            pointerEvents="box-none">
            <Text
              style={epStyles.signUpLikeHeaderTitleText}
              numberOfLines={2}>
              Mi cuenta
              <Text style={epStyles.signUpLikeHeaderTitleType}>
                {' '}
                (Negocio)
              </Text>
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
        <Text
          style={{
            fontSize: 20,
            color: '#E5E7EB',
            lineHeight: 28,
            marginBottom: 12,
            marginTop: 4,
            textAlign: 'center',
            paddingHorizontal: 8,
          }}>
          Actualiza los datos de tu negocio.
        </Text>
        <View
          style={{
            width: '100%',
            marginHorizontal: -30,
            height: 10,
            backgroundColor: DARK_BLUE,
            overflow: 'hidden',
          }}>
          <View
            style={{
              width: `${progressTallerStepper}%`,
              height: '100%',
              backgroundColor: YELLOW,
            }}
          />
        </View>
      </View>

      

      <View style={{ flex: 1, minHeight: 0 }}>
        {profileLoaded ? (
          <TallerEditStepper
            key={uidUserConnected || 'taller-edit-stepper'}
            initialProfile={initialTallerProfileForStepper}
            onSave={handleTallerProfileSaveFromStepper}
            onStepChange={handleTallerStepChange}
          />
        ) : null}
      </View>
    </View>
  );
};

export default TallerEditProfileScreen;
