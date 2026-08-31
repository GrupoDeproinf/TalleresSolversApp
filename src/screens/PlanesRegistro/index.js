import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { windowHeight, windowWidth, fontSizes } from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import appFonts from '../../themes/appFonts';
import Icons from 'react-native-vector-icons/FontAwesome';
import IconsFA5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import { useNavigation, useRoute } from '@react-navigation/native';
import epStyles from '../profileScreen/editProfile/style.css';

const DARK_BLUE = '#1F2344';
const YELLOW = '#FFD60A';

const PlanesRegistro = () => {
  const route = useRoute();
  /** true si se abrió desde Mis planes (PlanesTaller). */
  const fromPlanesTaller = route.params?.fromPlanesTaller === true;

  const [infoUser, setinfoUser] = useState([]);
  const [dataPlanes, setdataPlanes] = useState([]);
  const [planGratis, setPlanGratis] = useState(null);
  const [showPruebaGratisModal, setShowPruebaGratisModal] = useState(false);

  const navigationScreen = useNavigation();

  useEffect(() => {
    getData();
    getPlanes();
  }, []);

  const getPlanes = async () => {
    try {
      // Hacer la solicitud GET utilizando Axios
      const response = await api.get('/usuarios/getPlanes', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar la respuesta del servidor
      if (response.status === 200) {
        const result = response.data;
        console.log('PLANESSS++++++++', result); // Aquí puedes manejar la respuesta

        // Separar el plan gratuito de los planes de pago
        const planGratuito = result.find(plan => 
          plan.nombre.toLowerCase() === 'gratis' || 
          plan.nombre.toLowerCase() === 'plan gratis' ||
          plan.nombre.toLowerCase() === 'gratuito'
        );

        const filteredPlans = result.filter(plan => 
          plan.nombre.toLowerCase() != 'gratis' && 
          plan.nombre.toLowerCase() != 'plan gratis' &&
          plan.nombre.toLowerCase() != 'gratuito'
        );

        const sortedPlans = [...filteredPlans].sort((a, b) => {
          const pa = Number(a?.monto);
          const pb = Number(b?.monto);
          const na = Number.isFinite(pa) ? pa : 0;
          const nb = Number.isFinite(pb) ? pb : 0;
          return na - nb;
        });

        setPlanGratis(planGratuito);
        setdataPlanes(sortedPlans);
      } else {
        setdataPlanes([]);
      }
    } catch (error) {
      setdataPlanes([]);
      if (error.response) {
        console.error(
          'Error en la solicitud:',
          error.response.data.message || error.response.statusText,
        );
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  }

  const handlePruebaGratis = async () => {
    console.log('aquinsdjnfskdnfmsnd');

    console.log('infoUser', infoUser.uid);
    console.log('planGratis', planGratis);

    console.log('infoUser.email', infoUser.email);
    console.log('infoUser.password', infoUser.password);


    try {
      const response = await api.post('/usuarios/AsociarPlan', {
        uid: infoUser.uid,
        plan_uid: 'gratis'
      });


      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/authenticateUser', {
          email: infoUser.email.toLowerCase(),
          password: infoUser.password,
        });

        // Verificar la respuesta del servidor
        const result = response.data; // Los datos vienen directamente de response.data

        if (
          result.message === 'Usuario autenticado exitosamente' ||
          result.message === 'Usuario autenticado exitosamente como Admin'
        ) {
          try {
            const jsonValue = JSON.stringify(result.userData);
            console.log(jsonValue);
            await AsyncStorage.setItem('@userInfo', jsonValue);
          } catch (e) {
            console.log(e);
          }

          if (fromPlanesTaller) {
              navigationScreen.navigate('LoaderScreen');
            } else {
              navigationScreen.navigate('FormService', { uid: '', fromRegistro: true });
            }
        } else {
          
          showToast(
            'No se ha encontrado el usuario, por favor validar formulario',
          );
        }
      } catch (error) {
        if (error.response) {
          if (error?.response?.data?.error == "Firebase: Error (auth/invalid-credential)."){
            showToast(
              'Credenciales incorrectas, por favor validar formulario',
            );
          } else if (error?.response?.data?.error == "Firebase: Error (auth/user-not-found)."){
            showToast(
              'Usuario no encontrado, por favor validar formulario',
            );
          } else if (error?.response?.data?.error == "Firebase: Error (auth/wrong-password)."){
            showToast(
              'Contraseña incorrecta, por favor validar formulario',
            );
          } 
        } else {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('Error en la solicitud:', error);
          showToast('Usuario no encontrado, por favor validar formulario');
        }
      }



      // navigationScreen.navigate('Login');
      
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
    }
  };

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };

  const confirmProbarGratis = () => {
    setShowPruebaGratisModal(true);
  };

  const handleSeleccionarPlan = plan => {
    console.log('Plan seleccionado:', plan);

    plan.flag = 'from-plan';

    const nextParams = { data: plan };
    if (route.params?.fromPlanesTaller === true) {
      nextParams.fromPlanesTaller = true;
    }
    navigationScreen.navigate('ReportarPago', nextParams);
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log('valor del storage1231', user.uid);

      setinfoUser(user);
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BLUE} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero: azul oscuro + curva amarilla */}
        <View style={styles.hero}>
          <View style={styles.heroInner}>
            {fromPlanesTaller ? (
              <View style={styles.heroTitleRow}>
                <TouchableOpacity
                  onPress={() => navigationScreen.goBack()}
                  activeOpacity={0.85}
                  style={epStyles.signUpLikeHeaderBackBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Volver">
                  <IconsFA5 name="chevron-left" size={20} color={YELLOW} />
                </TouchableOpacity>
                <View
                  style={epStyles.signUpLikeHeaderTitleSlot}
                  pointerEvents="box-none">
                  <Text
                    style={[styles.heroTitle, styles.heroTitleBesideBack]}
                    numberOfLines={2}>
                    Renueva o mejora tu plan
                  </Text>
                </View>
                <View style={styles.heroTitleRowSpacer} />
              </View>
            ) : (
              <Text style={styles.heroTitle}>
                ¡Todo listo para arrancar!
              </Text>
            )}
            <Text style={styles.heroSubtitle}>
              {fromPlanesTaller
                ? 'Elige el plan que quieras contratar. El pago y la activación siguen el flujo habitual.'
                : 'Elige el plan que mejor se adapte a tus metas y empieza a recibir solicitudes.'}
            </Text>
          </View>
        </View>

        {!fromPlanesTaller ? (
          <>
            <View style={styles.ctaWrap}>
              <TouchableOpacity
                style={styles.ctaPruebaGratis}
                onPress={confirmProbarGratis}
                activeOpacity={0.9}>
                <Text style={styles.ctaPruebaGratisText}>
                  Probar gratis por {planGratis?.vigencia ?? 30} días
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.separadorWrap}>
              <View style={styles.separadorLinea} />
              <Text style={styles.separadorText}>O elige un plan:</Text>
              <View style={styles.separadorLinea} />
            </View>
          </>
        ) : (
          <View style={styles.planesDesdeMisPlanesSpacer} />
        )}

        {/* Tarjetas de planes */}
        <View style={styles.planesWrap}>
          {dataPlanes.map((plan) => {
            const destacado = plan?.mejor_opcion === true;
            return (
              <View key={plan.id} style={styles.planCardWrap}>
                {destacado && (
                  <View style={styles.badgeMejorOpcion}>
                    <Text style={styles.badgeMejorOpcionText}>La mejor opción</Text>
                  </View>
                )}
                <View style={[styles.planCard, destacado && styles.planCardDestacado]}>
                  <View style={[styles.planCardHeader, destacado ? styles.planCardHeaderYellow : styles.planCardHeaderBlue]}>
                    <View style={styles.planCardHeaderLeft}>
                      <Text style={[styles.planCardNombre, destacado ? styles.planCardNombreDark : styles.planCardNombreWhite]}>
                        {plan?.nombre?.toUpperCase() || 'PLAN'}
                      </Text>
                      <Text style={[styles.planCardTagline, destacado ? styles.planCardTaglineDark : styles.planCardTaglineWhite]}>
                        {plan?.descripcion || `Hasta ${plan?.cantidad_servicios} servicios`}
                      </Text>
                    </View>
                    <View style={styles.planCardPrecioWrap}>
                      <Text style={[styles.planCardPrecio, destacado ? styles.planCardPrecioDark : styles.planCardPrecioWhite]}>
                        ${plan?.monto}
                      </Text>
                      <Text style={[styles.planCardMes, destacado ? styles.planCardMesDark : styles.planCardMesWhite]}>
                        /mes
                      </Text>
                    </View>
                  </View>
                  <View style={styles.planCardBody}>
                    <View style={styles.planCardBodyLeft}>
                      <View style={styles.planCardFeature}>
                        <Icons name="check-circle" size={18} color={DARK_BLUE} />
                        <Text style={styles.planCardFeatureText}>Hasta {plan?.cantidad_servicios} servicios</Text>
                      </View>
                      <View style={styles.planCardFeature}>
                        <Icons name="check-circle" size={18} color={DARK_BLUE} />
                        <Text style={styles.planCardFeatureText}>Estadísticas de tu negocio</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.planCardBtn, destacado ? styles.planCardBtnYellow : styles.planCardBtnBlue]}
                      onPress={() => handleSeleccionarPlan(plan)}
                      activeOpacity={0.85}>
                      <Text style={[styles.planCardBtnText, destacado ? styles.planCardBtnTextDark : styles.planCardBtnTextWhite]}>
                        Seleccionar plan
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>

      <Modal
        visible={showPruebaGratisModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPruebaGratisModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Activar prueba gratis</Text>
              <Text style={styles.modalSubtitle}>
                Tendrás acceso por {planGratis?.vigencia ?? 30} días. Puedes cancelar cuando quieras.
              </Text>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  activeOpacity={0.9}
                  onPress={() => setShowPruebaGratisModal(false)}>
                  <Text style={styles.modalBtnTextCancel}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnConfirm]}
                  activeOpacity={0.9}
                  onPress={async () => {
                    setShowPruebaGratisModal(false);
                    await handlePruebaGratis();
                  }}>
                  <Text style={styles.modalBtnTextConfirm}>Sí, activar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 0,
  },
  heroTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: windowHeight(6),
  },
  heroTitleRowSpacer: {
    width: 42,
  },
  heroTitleBesideBack: {
    marginTop: 0,
    marginBottom: 0,
    maxWidth: '100%',
  },
  hero: {
    width: '100%',
    backgroundColor: DARK_BLUE,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    paddingTop: windowHeight(18),
    paddingBottom: windowHeight(40),
    paddingHorizontal: windowWidth(16),
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 12,
    borderBottomColor: YELLOW,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderLeftColor: YELLOW,
    borderRightColor: YELLOW,
  },
  heroInner: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: fontSizes.FONT28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: Math.round(fontSizes.FONT28 * 1.22),
    marginBottom: windowHeight(10),
    marginTop: windowHeight(4),
    width: '100%',
    paddingHorizontal: windowWidth(4),
    maxWidth: 340,
  },
  heroSubtitle: {
    fontSize: fontSizes.FONT17,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: Math.round(fontSizes.FONT17 * 1.35),
    width: '100%',
    maxWidth: 340,
    paddingHorizontal: windowWidth(6),
  },
  planesDesdeMisPlanesSpacer: {
    height: 16,
    marginBottom: 8,
  },
  ctaWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: -18,
    marginBottom: 24,
    paddingHorizontal: windowWidth(16),
  },
  ctaPruebaGratis: {
    width: '100%',
    maxWidth: 280,
    minHeight: windowHeight(52),
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: windowWidth(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginTop: -8,
  },
  ctaPruebaGratisText: {
    fontSize: fontSizes.FONT18,
    fontWeight: '700',
    color: DARK_BLUE,
    textAlign: 'center',
    lineHeight: Math.round(fontSizes.FONT18 * 1.25),
  },
  separadorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  separadorLinea: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    maxWidth: 80,
  },
  separadorText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4B5563',
    marginHorizontal: 12,
  },
  planesWrap: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  planCardWrap: {
    marginBottom: 20,
    position: 'relative',
    width: '88%',
    maxWidth: 340,
  },
  badgeMejorOpcion: {
    position: 'absolute',
    top: -10,
    left: 20,
    zIndex: 1,
    backgroundColor: DARK_BLUE,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  badgeMejorOpcionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planCardDestacado: {},
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  planCardHeaderBlue: {
    backgroundColor: DARK_BLUE,
  },
  planCardHeaderYellow: {
    backgroundColor: YELLOW,
  },
  planCardHeaderLeft: {
    flex: 1,
  },
  planCardNombre: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  planCardNombreWhite: {
    color: '#FFFFFF',
  },
  planCardNombreDark: {
    color: '#1F2937',
  },
  planCardTagline: {
    fontSize: 14,
    lineHeight: 18,
  },
  planCardTaglineWhite: {
    color: 'rgba(255,255,255,0.9)',
  },
  planCardTaglineDark: {
    color: '#4B5563',
  },
  planCardPrecioWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planCardPrecio: {
    fontSize: 26,
    fontWeight: '800',
  },
  planCardPrecioWhite: {
    color: '#FFFFFF',
  },
  planCardPrecioDark: {
    color: '#1F2937',
  },
  planCardMes: {
    fontSize: 15,
    marginLeft: 2,
  },
  planCardMesWhite: {
    color: 'rgba(255,255,255,0.9)',
  },
  planCardMesDark: {
    color: '#4B5563',
  },
  planCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  planCardBodyLeft: {
    flex: 1,
    marginRight: 12,
  },
  planCardFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  planCardFeatureText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
    fontWeight: '500',
  },
  planCardBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  planCardBtnBlue: {
    backgroundColor: DARK_BLUE,
  },
  planCardBtnYellow: {
    backgroundColor: YELLOW,
  },
  planCardBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  planCardBtnTextWhite: {
    color: '#FFFFFF',
  },
  planCardBtnTextDark: {
    color: DARK_BLUE,
  },
  saltarWrap: {
    paddingVertical: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  saltarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 12,
  },
  modalTop: {
    backgroundColor: '#F9FAFF',
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#4B5563',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 18,
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.10)',
    marginRight: 10,
  },
  modalBtnConfirm: {
    backgroundColor: YELLOW,
    marginLeft: 10,
  },
  modalBtnTextCancel: {
    color: DARK_BLUE,
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
  },
  modalBtnTextConfirm: {
    color: DARK_BLUE,
    fontWeight: '900',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default PlanesRegistro;
