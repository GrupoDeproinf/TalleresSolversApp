import { ScrollView, Text, View, useFocusEffect, Image, Modal, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useEffect, useState } from 'react';
import FullHeader from '../../commonComponents/fullHeader';
import { external } from '../../style/external.css';
import { commonStyles } from '../../style/commonStyle.css';
import ServicesContainer from '../../components/homeScreen/ServicesContainer';
import { newArrivalData } from '../../data/homeScreen/newArrivalData';
import styles from './style.css';
import { useValues } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../../../axiosInstance';
import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { windowHeight, windowWidth } from '../../themes/appConstant';

const ServiciosContainer = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { bgFullStyle, textColorStyle, t } = useValues();

  const [dataServicios, setdataServicios] = useState([]);

  // variables para los mensajes de la vista
  const [showPlanes, setshowPlanes] = useState(false);
  const [showPorAprobar, setshowPorAprobar] = useState(false);
  const [showServices, setshowServices] = useState(false);
  const [showModalAprobacion, setShowModalAprobacion] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [userData, setuserData] = useState(null);
  const [showModalCitaAgendada, setShowModalCitaAgendada] = useState(false);
  const [scheduledVisitDate, setScheduledVisitDate] = useState('');

  const [cantServices, setcantServices] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);


  const navigationScreen = useNavigation();

  // Cargar datos en el montaje inicial
  useEffect(() => {
    getData();
  }, []);

  // Recargar datos cuando la pantalla recibe focus (al navegar de regreso)
  useEffect(() => {
    const unsubscribe = navigationScreen.addListener('focus', () => {
      getData();
    });

    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, [navigationScreen]);

  const fetchData = () => {
    // Aquí va tu lógica para cargar datos
    console.log('Cargando datos...');
  };

  const onCancel = () => {
    setModalVisible(false);
  };



  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/getUserByUid', {
          uid: user.uid,
        });

        // Verificar la respuesta del servidor

        const result = response.data;
        setuserData(result.userData);


        if (result.message === 'Usuario encontrado') {
          // console.log("result.userData.subscripcion_actual", result.userData.subscripcion_actual)

          if (result?.userData?.status == "En espera por aprobación" && result?.userData?.scheduled_visit == undefined) {
            setShowModalAprobacion(true);
            setshowPlanes(false);
            setshowPorAprobar(false);
            setshowServices(true);
            setcantServices(result.userData.subscripcion_actual.cantidad_servicios)
            getServices(user.uid)
          } else if (result?.userData?.status == "En espera por aprobación" && result?.userData?.scheduled_visit != undefined) {
            setShowModalCitaAgendada(true);
            setScheduledVisitDate(result.userData.scheduled_visit);
            setshowPlanes(false);
            setshowPorAprobar(false);
            setshowServices(true);
            setcantServices(result.userData.subscripcion_actual.cantidad_servicios)
            getServices(user.uid)
          }


          if (result?.userData?.status == "Aprobado" && result?.userData?.subscripcion_actual?.status == "Por Aprobar") {
            setshowPlanes(false)
            setshowPorAprobar(false)
            setshowServices(true)
            getServices(user.uid)
            setcantServices(result.userData.subscripcion_actual.cantidad_servicios)
          }

          if (result?.userData?.status == "Aprobado" && result?.userData?.subscripcion_actual?.status == 'Vencido') {
            setshowPlanes(true)
            setcantServices(result.userData.subscripcion_actual.cantidad_servicios)
          }

          if (result?.userData?.status == "Aprobado" && result?.userData?.subscripcion_actual == undefined) {
            setshowPlanes(true)
            setcantServices(result.userData.subscripcion_actual.cantidad_servicios)
          }



          if (result?.userData?.status == "Aprobado" && result?.userData?.subscripcion_actual?.status == 'Aprobado') {
            setshowPlanes(false)
            setshowPorAprobar(false)
            setshowServices(true)
            getServices(user.uid)
            setcantServices(result.userData.subscripcion_actual.cantidad_servicios)
          }






        } else {
          console.log('Usuario no encontrado');
          setdataServicios([])
        }
      } catch (error) {
        if (error.response) {
          console.error('Error en la solicitud:', error.response.statusText);
          setdataServicios([])
        } else {
          console.error('Error en la solicitud:', error.message);
          setdataServicios([])
        }
      }
    } catch (e) {
      setdataServicios([])
      console.log(e)
    }
  };

  /** Misma navegación que el CTA de Mis planes → catálogo con flujo de regreso coherente. */
  const gotoPlans = () => {
    navigationScreen.navigate('PlanesRegistro', {fromPlanesTaller: true});
  };

  const handleAgendarCita = () => {
    setShowDatePicker(true);
  };

  const confirmDate = async () => {
    // Aquí puedes enviar la fecha seleccionada a la API
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const fechaCita = `${day}-${month}-${year}`;

    console.log('Fecha seleccionada:', fechaCita);
    console.log("user", userData.uid)
    console.log("===========================================")

    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/updateScheduleDate', {
        uid: userData.uid,
        scheduled_visit: fechaCita,
      });

      // Verificar la respuesta del servidor
      const result = response.data;

      // console.log("result", result)

      if (result.message === "Fecha de programación actualizada con éxito") {
        setShowModalAprobacion(false);
        setshowPlanes(false);
        setshowPorAprobar(false);
        setshowServices(false);
        setDateConfirmed(true);
        setShowDatePicker(false);
        setShowModalAprobacion(false);
        getData();
      }


    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
        setdataServicios([])
      } else {
        console.error('Error en la solicitud:', error.message);
        setdataServicios([])
      }
    }





    // TODO: Llamar a la API para guardar la cita
  };

  const formatSelectedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return selectedDate.toLocaleDateString('es-ES', options);
  };

  /** Misma lógica que productDetailOne / getCommentsByService */
  const calculateAverageScore = comments => {
    if (!Array.isArray(comments) || comments.length === 0) {
      return 0;
    }
    const totalScore = comments.reduce(
      (sum, comment) => sum + (comment?.puntuacion || 0),
      0,
    );
    const averageScore = totalScore / comments.length;
    return Math.min(Math.max(Math.ceil(averageScore), 0), 5);
  };

  /** Por cada servicio consulta comentarios y sustituye `puntuacion` por el promedio calculado */
  const enrichServicesWithCommentRatings = async services => {

    console.log("services", services)
    if (!Array.isArray(services) || services.length === 0) {
      return services;
    }
    return Promise.all(
      services.map(async svc => {
        const uidService = svc?.uid_servicio || svc?.id;

        console.log("uidService", uidService)
        if (!uidService) {
          return svc;
        }
        try {
          const res = await api.post('/home/getCommentsByService', {
            uid_service: uidService,
          });
          console.log("res12312", res)
          if (res.status === 200) {
            const comments = Array.isArray(res.data) ? res.data : [];
            console.log("comments", comments)
            const avg = calculateAverageScore(comments);
            console.log("avg", avg)
            return {...svc, puntuacion: avg};
          } else {
            return {...svc, puntuacion: 0};
          }
        } catch (err) {
          console.log("err12312", err)
          console.error('Error en comentarios del servicio:', err);
        }
        return svc;
      }),
    );
  };

  const getServices = async (uid) => {
    try {
      // Hacer la solicitud GET utilizando Axios
      const response = await api.post('/usuarios/getServicesByTalleruid', {
        uid_taller: uid,
      });

      console.log("Esto es el response", response.status)

      // Verificar la respuesta del servidor
      if (response.status === 200) {
        const result = response.data;
        console.log("usuarios de resultados", result.services); // Aquí puedes manejar la respuesta

        const services = Array.isArray(result.services) ? result.services : [];
        const withRatings = await enrichServicesWithCommentRatings(services);
        
        setdataServicios(withRatings);
      } else {
        setdataServicios([]);
      }
    } catch (error) {
      setdataServicios([]);
      if (error.response) {
        console.error('Error en la solicitud:', error.response.data.message || error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  }



  // Modal de aprobación pendiente
  const renderModalAprobacion = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showModalAprobacion}
      onRequestClose={() => setShowModalAprobacion(false)}
    >
      
          <View style={modalStyles.centeredView}>
            <ScrollView
              contentContainerStyle={modalStyles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={modalStyles.modalView}>
                <View style={modalStyles.iconContainer}>
                  <Icons name="calendar-check-o" size={80} color="#2D3261" />
                </View>

                <Text style={modalStyles.titleText}>
                  ¡Estás a un paso de activar tu negocio!
                </Text>

                {/* <Text style={modalStyles.descriptionText}>
                  Ya tenemos tu información. Para comenzar a ofrecer tus servicios, puedes agendar una visita o esperar a que uno de nuestros agentes se ponga en contacto contigo para verificar tu taller.
                </Text> */}

                <Text style={modalStyles.descriptionText}>
                  Ya tenemos tu información y puedes crear tus servicios, pero deberás esperar a que nuestros agentes se pongan en contacto para que sean visibles a los usuarios.
                </Text>

                <View style={modalStyles.warningBox}>
                  <Icons name="info-circle" size={20} color="#FF6B00" style={modalStyles.warningIcon} />
                  <Text style={modalStyles.warningText}>
                    <Text style={{ fontWeight: 'bold' }}>Importante: </Text>
                    Puedes crear servicios ahora, pero no serán visibles en la tienda hasta completar la certificación.
                  </Text>
                </View>

                {!showDatePicker ? (
                  <>
                    {dateConfirmed && (
                      <View style={modalStyles.selectedDateBox}>
                        <Icons name="check-circle" size={18} color="#28a745" style={{ marginRight: 8 }} />
                        <Text style={modalStyles.selectedDateText}>
                          {formatSelectedDate()}
                        </Text>
                      </View>
                    )}

                    {/* <TouchableOpacity
                      style={modalStyles.button}
                      onPress={handleAgendarCita}
                    >
                      <Icons name="calendar" size={20} color="#fff" style={modalStyles.buttonIcon} />
                      <Text style={modalStyles.buttonText}>
                        {dateConfirmed ? 'Cambiar Fecha' : 'Agendar Cita'}
                      </Text>
                    </TouchableOpacity> */}

                    {dateConfirmed && (
                      <TouchableOpacity
                        style={modalStyles.confirmButton}
                        onPress={confirmDate}
                      >
                        <Icons name="check" size={20} color="#fff" style={modalStyles.buttonIcon} />
                        <Text style={modalStyles.buttonText}>Confirmar Cita</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={modalStyles.skipButton}
                      onPress={() => setShowModalAprobacion(false)}
                    >
                      {/* <Text style={modalStyles.skipButtonText}>Saltar por ahora</Text> */}
                      <Text style={modalStyles.skipButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={modalStyles.datePickerContainer}>
                    <Text style={modalStyles.datePickerTitle}>Selecciona la fecha de tu cita</Text>

                    <View style={modalStyles.datePickerWrapper}>
                      <DatePicker
                        date={selectedDate}
                        onDateChange={setSelectedDate}
                        mode="date"
                        theme="light"
                        locale="es"
                        minimumDate={new Date()}
                        maximumDate={new Date(2030, 11, 31)}
                        textColor="#2D3261"
                        fadeToColor="white"
                      />
                    </View>

                    <View style={modalStyles.datePickerButtons}>
                      <TouchableOpacity
                        style={modalStyles.cancelButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={modalStyles.doneButton}
                        onPress={() => {
                          setDateConfirmed(true);
                          setShowDatePicker(false);
                        }}
                      >
                        <Text style={modalStyles.doneButtonText}>Confirmar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
    </Modal>
  );

  // Modal para cita agendada
  const renderModalCitaAgendada = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showModalCitaAgendada}
      onRequestClose={() => setShowModalCitaAgendada(false)}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <View style={modalStyles.iconContainerSuccess}>
            <Icons name="calendar-check-o" size={80} color="#28a745" />
          </View>

          <Text style={modalStyles.titleTextSuccess}>
            ¡Tu cita está agendada!
          </Text>

          <View style={modalStyles.dateInfoBox}>
            <Icons name="calendar" size={24} color="#2D3261" style={{ marginRight: 10 }} />
            <View>
              <Text style={modalStyles.dateInfoLabel}>Fecha de visita programada:</Text>
              <Text style={modalStyles.dateInfoValue}>{scheduledVisitDate}</Text>
            </View>
          </View>

          <Text style={modalStyles.descriptionText}>
            Nuestro agente certificador puede visitar tu taller en la fecha indicada o ponerse en contacto contigo para verificar la información y aprobar tus servicios.
          </Text>

          <View style={modalStyles.infoBoxPending}>
            <Icons name="clock-o" size={24} color="#FF6B00" style={{ marginRight: 12 }} />
            <Text style={modalStyles.infoBoxText}>
              <Text style={{ fontWeight: 'bold' }}>Importante: </Text>
              Puedes crear servicios, pero no serán visibles para los clientes hasta que completes el proceso de certificación.
            </Text>
          </View>

          <View style={modalStyles.stepsContainer}>
            <Text style={modalStyles.stepsTitle}>Próximos pasos:</Text>
            <View style={modalStyles.stepItem}>
              <View style={modalStyles.stepNumber}>
                <Text style={modalStyles.stepNumberText}>1</Text>
              </View>
              <Text style={modalStyles.stepText}>Crea Servicios</Text>
            </View>
            <View style={modalStyles.stepItem}>
              <View style={modalStyles.stepNumber}>
                <Text style={modalStyles.stepNumberText}>2</Text>
              </View>
              <Text style={modalStyles.stepText}>Espera a que el certificador te contacte o visite tu taller</Text>
            </View>
            <View style={modalStyles.stepItem}>
              <View style={modalStyles.stepNumber}>
                <Text style={modalStyles.stepNumberText}>3</Text>
              </View>
              <Text style={modalStyles.stepText}>Recibe la aprobación y activa tus servicios</Text>
            </View>
          </View>

          <TouchableOpacity
            style={modalStyles.buttonSuccess}
            onPress={() => setShowModalCitaAgendada(false)}
          >
            <Icons name="check" size={20} color="#fff" style={modalStyles.buttonIcon} />
            <Text style={modalStyles.buttonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (showPlanes) {
    return (
      <View
        style={[
          commonStyles.commonContainer,
          {backgroundColor: bgFullStyle, flex: 1},
        ]}>
        {renderModalAprobacion()}
        {renderModalCitaAgendada()}
        <View
          style={[
            modalStyles.servicesHeaderWrapper,
            {paddingTop: insets.top + windowHeight(3.8)},
          ]}>
          <View style={modalStyles.servicesHeaderCircle1} />
          <View style={modalStyles.servicesHeaderCircle2} />
          <View style={modalStyles.servicesHeaderRow}>
            <View style={modalStyles.servicesHeaderCenter}>
              <Text style={modalStyles.servicesHeaderTitle}>Tu plan</Text>
              <Text style={modalStyles.servicesHeaderSubtitle}>
                Sin plan activo tus servicios quedan desactivados. Elige un plan
                para volver a ofrecerlos a tus clientes.
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={modalStyles.planInactiveScrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={modalStyles.planInactiveCardOuter}>
            <View style={modalStyles.planInactiveCard}>
              <View style={modalStyles.planInactiveLogoWrap}>
                <Image
                  source={require('../../assets/solverslogo2.png')}
                  style={modalStyles.planInactiveLogoImg}
                  resizeMode="contain"
                />
              </View>
              <View style={modalStyles.planInactiveFriendlyTag}>
                <Text style={modalStyles.planInactiveFriendlyTagText}>
                  Tus servicios siguen guardados
                </Text>
              </View>
              <Text
                style={[modalStyles.planInactiveTitle, {color: textColorStyle}]}>
                Reactivar es rápido y sencillo
              </Text>
              <Text style={modalStyles.planInactiveSubtitle}>
                La prueba gratuita terminó, pero tu trabajo en la app no se
                pierde: solo está en pausa.
              </Text>
              <Text style={modalStyles.planInactiveBody}>
                Cuando elijas un plan, tus servicios vuelven a activarse y podrás
                seguir recibiendo solicitudes de clientes como siempre.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            modalStyles.planInactiveFooter,
            {paddingBottom: Math.max(insets.bottom, 10), backgroundColor: bgFullStyle},
          ]}>
          <TouchableOpacity
            style={modalStyles.planInactiveFooterBtn}
            onPress={gotoPlans}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Renovar plan"
            accessibilityHint="Abre el catálogo de planes para reactivar tus servicios.">
            <Text style={modalStyles.planInactiveFooterBtnTitle}>Renovar plan</Text>
            <Text style={modalStyles.planInactiveFooterBtnHint}>
              Ver catálogo de planes y reactivar tus servicios.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  if (showPorAprobar) {
    return (
      <View
        style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
        {renderModalAprobacion()}
        {renderModalCitaAgendada()}
        <View style={[styles.container2]}>
          <View
            style={[
              external.ai_center,
              external.js_center,
              external.as_center,
            ]}>
            <Text
              style={[
                commonStyles.titleText19,
                external.ti_center,
                { color: textColorStyle },
              ]}>
              Proceso de validación
            </Text>
          </View>
        </View>

        <View style={styles.flexView}>
          <View
            style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Image
              source={require('../../assets/solverslogo.png')} // Asegúrate de que la ruta sea correcta
              style={{ width: 100, height: 100, marginBottom: 20 }} // Aumentar el tamaño de la imagen y agregar marginBottom
              resizeMode="contain" // Esto asegura que la imagen mantenga sus proporciones
            />

            <Text
              style={[
                styles.bagIsEmptyText,
                { color: textColorStyle, textAlign: 'center' },
              ]}>
              ¡Gracias por tu paciencia! Estamos procesando la validación de tu reporte de pago.
            </Text>

            <Text style={[styles.bagisEmptySomething, { textAlign: 'center' }]}>
              En breve podrás comenzar a publicar y ofrecer tus servicios. Te notificaremos cuando todo esté listo.
            </Text>
          </View>
        </View>
      </View>
    );
  }


  const createorEditService = () => {
    if (Number(cantServices) == 0 || Number(cantServices) < 0){
      setModalVisible(true)
    } else {
      navigationScreen.navigate('FormService', {uid: ''});
      setModalVisible(false)
    }
  }


  if (showServices) {
    return (
      <View
        style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle, flex: 1 }]}>
        {renderModalAprobacion()}
        {renderModalCitaAgendada()}
        {dataServicios.length > 0 ? (
          <View
            style={[
              modalStyles.servicesHeaderWrapper,
              { paddingTop: insets.top + windowHeight(3.8) },
            ]}>
            <View style={modalStyles.servicesHeaderCircle1} />
            <View style={modalStyles.servicesHeaderCircle2} />
            <View style={modalStyles.servicesHeaderRow}>
              <View style={modalStyles.servicesHeaderCenter}>
                <Text style={modalStyles.servicesHeaderTitle}>Servicios</Text>
                <Text style={modalStyles.servicesHeaderSubtitle}>
                  Publica y administra los servicios que ofreces a tus clientes.
                </Text>
              </View>
            </View>
          </View>
        ) : null}
        {dataServicios.length === 0 ? (
          <View style={[modalStyles.emptyStateContainer, { flex: 1 }]}>
            {/* Hero superior */}
            <View style={modalStyles.emptyHero}>
              <View style={modalStyles.emptyHeroInner}>
                {/* <Text style={modalStyles.emptyHeroTag}>SERVICIOS</Text> */}
                <Text style={modalStyles.emptyHeroTitle}>
                  ¡LLEVA TU NEGOCIO AL{'\n'}SIGUIENTE NIVEL! {' '} 
                  {/* <Text style={{ fontSize: 35, fontWeight: 'bold', color: '#FFD60A' }}>🚀</Text> */}
                </Text>
                <Text style={modalStyles.emptyHeroSubtitle}>
                  Crea tu perfil de servicios hoy mismo y empieza a conectar con cientos de
                  clientes que buscan lo que tú haces mejor.
                </Text>
              </View>
            </View>

            {/* Tarjeta de beneficios */}
            <View style={modalStyles.emptyCard}>
              <View style={modalStyles.emptyCardItem}>
                <Icons name="check-circle" size={18} color="#1F2344" />
                <View style={modalStyles.emptyCardItemTextWrap}>
                  <Text style={modalStyles.emptyCardItemTitle}>Ponle valor a tu trabajo</Text>
                  <Text style={modalStyles.emptyCardItemSubtitle}>Tú decides el precio</Text>
                </View>
              </View>
              <View style={modalStyles.emptyCardItem}>
                <Icons name="check-circle" size={18} color="#1F2344" />
                <View style={modalStyles.emptyCardItemTextWrap}>
                  <Text style={modalStyles.emptyCardItemTitle}>Sé dueño de tu tiempo</Text>
                  <Text style={modalStyles.emptyCardItemSubtitle}>Gestiona tu agenda</Text>
                </View>
              </View>
              <View style={modalStyles.emptyCardItem}>
                <Icons name="check-circle" size={20} color="#1F2344" />
                <View style={modalStyles.emptyCardItemTextWrap}>
                  <Text style={modalStyles.emptyCardItemTitle}>Clientes reales</Text>
                  <Text style={modalStyles.emptyCardItemSubtitle}>Recibe solicitudes al instante</Text>
                </View>
              </View>
            </View>

            {/* Botón principal */}
            <TouchableOpacity
              style={modalStyles.emptyPrimaryButton}
              activeOpacity={0.9}
              onPress={createorEditService}>
              <View style={modalStyles.emptyPrimaryIconWrap}>
                <Icons name="plus" size={25} color="#FFFFFF" />
              </View>
              <Text style={modalStyles.emptyPrimaryText}>Agrega tus servicios</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              external.Pb_80,
              { paddingBottom: insets.bottom + 120 },
            ]}>
            <ServicesContainer
              data={dataServicios}
              show={false}
              showPlus={true}
              uidTaller={userData?.uid}
              nombreTaller={
                userData?.nombre_taller ?? userData?.nombre ?? userData?.taller ?? ''
              }
            />
          </ScrollView>
        )}
        {dataServicios.length > 0 && (
          <TouchableOpacity
            style={[
              modalStyles.fabAdd,
              { bottom: insets.bottom + 16, right: 16 },
            ]}
            onPress={createorEditService}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Agregar servicio">
            <Icons name="plus" size={32} color="#FFD60A" />
          </TouchableOpacity>
        )}




        <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={onCancel}>
        <View style={stylesModal.container}>
          <View style={stylesModal.modalView}>
            <Text style={stylesModal.modalText}>
              Usted ha alcanzado la cantidad máxima de servicios permitidos en su plan. Para crear nuevos servicios, debe actualizar su plan.
            </Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity
                style={stylesModal.buttonYes}
                onPress={gotoPlans}>
                <Text style={stylesModal.buttonText}>Ir a planes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={stylesModal.buttonNo} onPress={onCancel}>
                <Text style={stylesModal.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>








      </View>

      



    );
  }

  // Renderizar el modal cuando no hay otra vista activa
  return (
    <View style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
      {renderModalAprobacion()}
      {renderModalCitaAgendada()}
    </View>
  );

};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  iconContainer: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#000',
  },
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#FFF4E6',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  warningIcon: {
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#8B4000',
    lineHeight: 18,
  },
  selectedDateBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  selectedDateText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2D3261',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
  datePickerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3261',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#2D3261',
    borderRadius: 10,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  // Estilos para Empty State (pantalla Servicios sin servicios)
  emptyStateContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  servicesHeaderWrapper: {
    width: '100%',
    backgroundColor: '#1F2344',
    paddingBottom: windowHeight(4.6),
    paddingHorizontal: windowWidth(5),
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    borderBottomWidth: 7,
    borderBottomColor: '#FFD60A',
    position: 'relative',
  },
  servicesHeaderCircle1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,214,10,0.12)',
    top: -34,
    right: -22,
  },
  servicesHeaderCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 30,
    left: -14,
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  servicesHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
  },
  servicesHeaderBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,214,10,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: windowHeight(1.4),
    left: windowWidth(4),
    zIndex: 3,
  },
  servicesHeaderTitle: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD60A',
    marginBottom: 10,
  },
  servicesHeaderSubtitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
    lineHeight: 22,
    paddingHorizontal: 0,
    width: '96%',
  },
  planInactiveScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: '100%',
  },
  planInactiveCardOuter: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  planInactiveCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 35, 68, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#1F2344',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.14,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  planInactiveLogoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 214, 10, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  planInactiveLogoImg: {
    width: 68,
    height: 68,
  },
  planInactiveFriendlyTag: {
    backgroundColor: 'rgba(31, 35, 68, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },
  planInactiveFriendlyTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.2,
  },
  planInactiveTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.35,
    lineHeight: 28,
    paddingHorizontal: 4,
  },
  planInactiveSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  planInactiveBody: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  planInactiveFooter: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(31, 35, 68, 0.12)',
  },
  planInactiveFooterBtn: {
    width: '100%',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInactiveFooterBtnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2344',
    textAlign: 'center',
  },
  planInactiveFooterBtnHint: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(31, 35, 68, 0.78)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
    paddingHorizontal: 4,
  },
  emptyHero: {
    width: '100%',
    backgroundColor: '#1F2344',
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    paddingTop: 32,
    paddingBottom: 90,
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 3,
    borderBottomColor: '#FFD60A',
    borderRightColor: '#FFD60A',
    borderLeftColor: '#FFD60A',
    borderTopColor: '#FFD60A',
    // borderTopWidth: 6,
    // borderTopLeftRadius: 120,
    // borderTopRightRadius: 120,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 12,

  },
  emptyHeroInner: {
    width: '88%',
    alignItems: 'center',
  },
  emptyHeroTag: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#E5E7EB',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyHeroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 35,
    marginBottom: 12,
  },
  emptyHeroSubtitle: {
    fontSize: 20,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 25,
  },
  emptyCard: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    textAlign: 'center',
  },
  emptyCardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emptyCardItemTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  emptyCardItemTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2344',
    marginBottom: 2,
  },
  emptyCardItemSubtitle: {
    fontSize: 17,
    color: '#1F2344',
  },
  emptyPrimaryButton: {
    marginTop: -10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: '#1F2344',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    width: '80%',
    height: 70,
  },
  emptyPrimaryIconWrap: {
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emptyPrimaryText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Estilos para Modal Cita Agendada
  iconContainerSuccess: {
    marginBottom: 20,
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 50,
  },
  titleTextSuccess: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateInfoBox: {
    backgroundColor: '#E8F0FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2D3261',
  },
  dateInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3261',
  },
  infoBoxPending: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#8B4000',
    lineHeight: 18,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3261',
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D3261',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabAdd: {
    position: 'absolute',
    zIndex: 30,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1F2344',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#FFD60A',
  },
});

const stylesModal = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonYes: {
    backgroundColor: '#2D3261', // Color del botón "Sí"
    borderRadius: 5,
    padding: 10,
    width: '48%', // Ajustar ancho para espacio entre botones
    alignItems: 'center',
  },
  buttonNo: {
    backgroundColor: '#bdbdbd',
    color: '#2D3261', // Color del botón "No"
    borderRadius: 5,
    padding: 10,
    width: '48%', // Ajustar ancho para espacio entre botones
    alignItems: 'center',
  },
  buttonText: {
    color: 'white', // Color del texto del botón
    fontWeight: 'bold',
  },
});

export default ServiciosContainer;
