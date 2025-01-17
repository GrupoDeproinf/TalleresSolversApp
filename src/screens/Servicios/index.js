import { ScrollView, Text, View, useFocusEffect, Image } from 'react-native';
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



const ServiciosContainer = ({ navigation }) => {

  const { bgFullStyle,textColorStyle,  t } = useValues();

  const [dataServicios, setdataServicios] = useState([]);

  // variables para los mensajes de la vista
  const [showPlanes, setshowPlanes] = useState(false);
  const [showPorAprobar, setshowPorAprobar] = useState(false); 
  const [showServices, setshowServices] = useState(false);

  const [cantServices, setcantServices] = useState(0); 


  const navigationScreen = useNavigation();

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
      
        if (result.message === 'Usuario encontrado') {
          console.log("result.userData.subscripcion_actual", result.userData.subscripcion_actual)
          if (result.userData.subscripcion_actual == undefined) {
            setshowPlanes(true)
            setshowPorAprobar(false)
            setshowServices(false)
          } else if (result.userData.subscripcion_actual.status == "Por Aprobar") {
            setshowPlanes(false)
            setshowPorAprobar(true)
            setshowServices(false)
            setdataServicios([])
          } else if (result.userData.subscripcion_actual.status == "Aprobado"){
            console.log("aprobado")
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

  const gotoPlans = () =>{
    navigationScreen.navigate('Planscreen');
  }



  const getServices = async (uid) => {
       try {
          // Hacer la solicitud GET utilizando Axios
          const response = await api.post('/usuarios/getServicesByTalleruid', {
            uid_taller: uid,
          });

          console.log("Esto es el response",response.status)

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



  if (showPlanes) {
    return (
      <View
        style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
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
                { color: textColorStyle},
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

            <Text style={[styles.bagisEmptySomething, { textAlign: 'center' }]}>
            Para comenzar a usar la aplicación y ofrecer sus servicios, debe adquirir un plan.
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
                { color: textColorStyle},
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
              Actualmente, su reporte de pago está en proceso de validación.
            </Text>

            <Text style={[styles.bagisEmptySomething, { textAlign: 'center' }]}>
            Estamos verificando su pago en breve podra iniciar la publicacion de sus servicios.
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[external.Pb_80]}>
          <ServicesContainer
            data={dataServicios}
            show={false}
            showPlus={true}
          />
        </ScrollView>
      </View>
    );
  }

};

export default ServiciosContainer;
