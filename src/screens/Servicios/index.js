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
import NavigationButton from '../../commonComponents/navigationButton';
import appColors from '../../themes/appColors';
import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';



const ServiciosContainer = ({ navigation }) => {

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

  const gotoPlans = () => {
    navigationScreen.navigate('Planscreen');
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


        setdataServicios(result.services);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={modalStyles.centeredView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={modalStyles.centeredView}>
            <ScrollView
              contentContainerStyle={modalStyles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={modalStyles.modalView}>
                <View style={modalStyles.iconContainer}>
                  <Icons name="calendar-check-o" size={60} color="#2D3261" />
                </View>

                <Text style={modalStyles.titleText}>
                  ¡Estás a un paso de activar tu taller!
                </Text>

                <Text style={modalStyles.descriptionText}>
                  Para comenzar a ofrecer tus servicios, necesitamos verificar tu información. Agenda una cita y uno de nuestros agentes certificadores visitará tu taller.
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

                    <TouchableOpacity
                      style={modalStyles.button}
                      onPress={handleAgendarCita}
                    >
                      <Icons name="calendar" size={20} color="#fff" style={modalStyles.buttonIcon} />
                      <Text style={modalStyles.buttonText}>
                        {dateConfirmed ? 'Cambiar Fecha' : 'Agendar Cita'}
                      </Text>
                    </TouchableOpacity>

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
                      <Text style={modalStyles.skipButtonText}>Saltar por ahora</Text>
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
            Nuestro agente certificador visitará tu taller en la fecha indicada para verificar la información y aprobar tus servicios.
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
              <Text style={modalStyles.stepText}>Espera la visita del certificador</Text>
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
              Seleccionar Plan
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
              Actualmente, usted no tiene un plan activo.
            </Text>

            <Text style={[styles.bagisEmptySomething, { textAlign: 'justify' }]}>
              Tu prueba gratuita ha finalizado, pero aún conservas tus servicios. Estos se encuentran temporalmente desactivados; adquiere un nuevo plan para reactivarlos y continuar ofreciendo tus servicios.
            </Text>
          </View>

          <View style={{ width: '100%' }}>
            <NavigationButton
              title="Planes"
              backgroundColor={'#2D3261'}
              color={appColors.screenBg}
              onPress={() => gotoPlans()}
            />
          </View>
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



  if (showServices) {
    return (
      <View
        style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
        {renderModalAprobacion()}
        {renderModalCitaAgendada()}
        <View style={[external.mh_20]}>
          <FullHeader
            cantServices={cantServices}
            showNewService={true}
            showArrow={false}
            show={false}
            showClose={false}
            title="Servicios"
            text={
              <Text style={styles.container}>Filtrar</Text>
            }
            onpressBack={() => navigation.goBack('')}
          />
        </View>
        {dataServicios.length === 0 ? (
          <View style={modalStyles.emptyStateContainer}>
            <View style={modalStyles.emptyStateIconContainer}>
              <Icons name="wrench" size={80} color="#2D3261" />
            </View>

            <Text style={modalStyles.emptyStateTitle}>
              ¡Comienza a ofrecer tus servicios!
            </Text>

            <Text style={modalStyles.emptyStateDescription}>
              Aún no tienes servicios creados. Crea tu primer servicio y comienza a recibir solicitudes de clientes.
            </Text>

            <View style={modalStyles.emptyStateFeaturesContainer}>
              <View style={modalStyles.emptyStateFeature}>
                <Icons name="check-circle" size={20} color="#28a745" />
                <Text style={modalStyles.emptyStateFeatureText}>Define tus propios precios</Text>
              </View>
              <View style={modalStyles.emptyStateFeature}>
                <Icons name="check-circle" size={20} color="#28a745" />
                <Text style={modalStyles.emptyStateFeatureText}>Gestiona tu disponibilidad</Text>
              </View>
              <View style={modalStyles.emptyStateFeature}>
                <Icons name="check-circle" size={20} color="#28a745" />
                <Text style={modalStyles.emptyStateFeatureText}>Recibe solicitudes al instante</Text>
              </View>
            </View>

            {/* <TouchableOpacity
              style={modalStyles.emptyStateButton}
              onPress={() => navigationScreen.navigate('NewService')}
            >
              <Icons name="plus-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={modalStyles.emptyStateButtonText}>Crear mi primer servicio</Text>
            </TouchableOpacity> */}
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[external.Pb_80]}>
            <ServicesContainer
              data={dataServicios}
              show={false}
              showPlus={true}
            />
          </ScrollView>
        )}
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
    marginLeft: 5,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 7,

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
    fontSize: 14,
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
  // Estilos para Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  emptyStateIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3261',
    textAlign: 'center',
    marginBottom: 15,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyStateFeaturesContainer: {
    width: '100%',
    marginBottom: 30,
  },
  emptyStateFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 10,
  },
  emptyStateFeatureText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  emptyStateButton: {
    backgroundColor: '#2D3261',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D3261',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

    fontSize: 14,
    color: '#333',
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiciosContainer;
