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
  Alert
} from 'react-native';
import {windowHeight, windowWidth, fontSizes} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import appFonts from '../../themes/appFonts';

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import {useNavigation} from '@react-navigation/native';

const PlanesRegistro = () => {

  const [infoUser, setinfoUser] = useState([]);
  const [dataPlanes, setdataPlanes] = useState([]);
  const [planGratis, setPlanGratis] = useState(null);

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

        setPlanGratis(planGratuito);
        setdataPlanes(filteredPlans);
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

          navigationScreen.navigate('LoaderScreen');
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

  const handleSeleccionarPlan = (plan) => {
    console.log('Plan seleccionado:', plan);

    plan.flag = 'from-plan';

    navigationScreen.navigate('ReportarPago', {data: plan});


  };

  const handleSaltar = () => {
    // navigationScreen.navigate('Login');
    handlePruebaGratis()
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
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titulo}>¡Ya casi!</Text>
          <Text style={styles.subtitulo}>Comienza a Gestionar tu Negocio</Text>
          <Text style={styles.descripcion}>
            Elige un plan o comienza con nuestra prueba gratuita. Una vez seleccionado el plan podrás publicar tus servicios y comenzar a crecer.
          </Text>
        </View>

        {/* Botón de Prueba Gratuita */}
        <View style={styles.pruebaGratisContainer}>
          <TouchableOpacity
            style={styles.botonPruebaGratis}
            onPress={handlePruebaGratis}
            activeOpacity={0.8}>
            <Text style={styles.botonPruebaGratisText}>
              Usar Prueba Gratis por {planGratis?.vigencia} Días
            </Text>
          </TouchableOpacity>
        </View>

        {/* Separador */}
        <View style={styles.separadorContainer}>
          <View style={styles.separadorLinea} />
          <Text style={styles.separadorText}>O Elige un Plan de Suscripción</Text>
        </View>

        {/* Planes */}
        <View style={styles.planesContainer}>
          {dataPlanes.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planContent}>
                <View style={styles.planInfo}>
                  <View style={styles.planHeader}>
                    <Text style={styles.planNombre}>{plan?.nombre}</Text>
                    <View style={styles.precioContainer}>
                      <Text style={styles.planPrecio}>${plan?.monto}</Text>
                      <Text style={styles.planDuracion}>{plan?.duracion}</Text>
                    </View>
                  </View>
                  <Text style={styles.planDescripcion}>Cantidad de Servicios: {plan?.cantidad_servicios}</Text>
                  <Text style={styles.planDescripcion}>Vigencia: {plan?.vigencia} Días</Text>
                </View>
                <View style={styles.botonColumn}>
                  <TouchableOpacity
                    style={styles.botonSeleccionar}
                    onPress={() => handleSeleccionarPlan(plan)}
                    activeOpacity={0.7}>
                    <Text style={styles.botonSeleccionarText}>Seleccionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
        {/* Opción de Saltar */}
        <View style={styles.saltarContainer}>
          <TouchableOpacity onPress={handleSaltar} activeOpacity={0.7}>
            <Text style={styles.saltarText}>Saltar por ahora</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: windowWidth(15),
  },
  header: {
    paddingHorizontal: windowWidth(15),
    paddingTop: windowHeight(15),
    paddingBottom: windowHeight(6),
    alignItems: 'flex-start',
  },
  titulo: {
    fontSize: fontSizes.FONT28,
    fontFamily: appFonts.bold,
    color: 'black',
    textAlign: 'left',
    marginBottom: windowHeight(3),
  },
  subtitulo: {
    fontSize: fontSizes.FONT18,
    // fontFamily: appFonts.bold,
    color: '#2c3e50',
    textAlign: 'left',
    marginBottom: windowHeight(10),
  },
  descripcion: {
    fontSize: fontSizes.FONT18,
    fontFamily: appFonts.bold,
    color: '#2c3e50',
    textAlign: 'justify',
    lineHeight: windowHeight(22),
    marginBottom: windowHeight(15),
  },
  pruebaGratisContainer: {
    paddingHorizontal: windowWidth(20),
    marginBottom: windowHeight(20),
  },
  botonPruebaGratis: {
    backgroundColor: '#1a365d',
    borderRadius: windowWidth(6),
    paddingVertical: windowHeight(3),
    alignItems: 'center',
    justifyContent: 'center',
    height: windowHeight(35),
  },
  botonPruebaGratisText: {
    color: '#ffffff',
    fontSize: fontSizes.FONT22,
    fontFamily: appFonts.bold,
  },
  separadorContainer: {
    alignItems: 'center',
    paddingHorizontal: windowWidth(6),
    marginTop: windowHeight(0),
    marginBottom: windowHeight(8),
  },
  separadorLinea: {
    width: '70%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: windowHeight(5),
  },
  separadorText: {
    fontSize: fontSizes.FONT19,
    fontFamily: appFonts.regular,
    marginBottom: windowHeight(10),
    color: 'black',
  },
  planesContainer: {
    paddingHorizontal: windowWidth(10),
  },
  planCard: {
    borderRadius: windowWidth(10),
    // borderWidth: 1,
    // borderColor: '#1a365d',
    backgroundColor: '#ffffff',
    padding: windowWidth(20),
    marginBottom: windowHeight(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planInfo: {
    flex: 1,
    marginRight: windowWidth(4),
  },
  planHeader: {
    marginBottom: windowHeight(1.5),
  },
  planNombre: {
    fontSize: fontSizes.FONT20,
    fontFamily: appFonts.bold,
    color: 'black',
    marginBottom: windowHeight(2),
  },
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrecio: {
    fontSize: fontSizes.FONT20,
    fontFamily: appFonts.bold,
    color: 'black',
  },
  planDuracion: {
    fontSize: fontSizes.FONT14,
    fontFamily: appFonts.regular,
    color: 'black',
    marginLeft: windowWidth(1),
  },
  planDescripcion: {
    fontSize: fontSizes.FONT14,
    fontFamily: appFonts.regular,
    color: '#2c3e50',
    lineHeight: windowHeight(18),
  },
  botonColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSeleccionar: {
    borderRadius: windowWidth(10),
    backgroundColor: '#1a365d',
    paddingVertical: windowHeight(1.5),
    paddingHorizontal: windowWidth(4),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
    minWidth: windowWidth(25),
    height: windowHeight(25),
    width: windowWidth(110),
  },
  botonSeleccionarText: {
    fontSize: fontSizes.FONT14,
    fontFamily: appFonts.regular,
    color: 'white',
  },
  saltarContainer: {
    paddingHorizontal: windowWidth(6),
    paddingVertical: windowHeight(3),
    alignItems: 'center',
  },
  saltarText: {
    fontSize: fontSizes.FONT14,
    fontFamily: appFonts.regular,
    color: '#95a5a6',
  },
});

export default PlanesRegistro;
