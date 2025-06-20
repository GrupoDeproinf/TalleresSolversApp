import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomContainer from '../../../commonComponents/bottomContainer';
import {commonStyles} from '../../../style/commonStyle.css';
import {windowWidth} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';
import {BackLeft, Plus} from '../../../utils/icon';
import {addtoBag, buyNow, writeYourReview} from '../../../constant';
import styles from './style.css';
import NewArrivalBigContainer from '../../../components/homeScreenTwo/newArrivalTwoContainer';
import {newArrivalBigData} from '../../../data/homeScreenTwo/newArrivalData';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {Cart} from '../../../assets/icons/cart';
import DetailsTextContainer from '../../../components/productDetail/productOne/detailsText';
import DescriptionText from '../../../components/productDetail/productOne/descriptionText';
import InfoContainer from '../../../components/productDetail/productOne/infoContainer';
import BrandData from '../../../components/productDetail/productOne/brandData';
import IconProduct from '../../../components/productDetail/productOne/iconProduct';
import KeyFeatures from '../../../components/productDetail/productOne/keyFeatures';
import RatingScreen from '../../../components/productDetail/productOne/reviewScreen';
import {useValues} from '../../../../App';
import SliderDetails from '../../../components/productDetail/productOne/sliderDetails';
import {useNavigation, useRoute} from '@react-navigation/native';
import api from '../../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {FlatList} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Alert} from 'react-native';
import {
  ClipboardDocumentIcon,
  ClipboardIcon,
  PhoneIcon,
} from 'react-native-heroicons/outline'; // Importar íconos
import {Linking} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';
import IconContact from '../../../components/productDetail/productOne/iconContact';
import MapComponent from '../../map';
import MapRutaComponent from '../../mapRuta';

const ProductDetailOne = ({navigation}) => {
  const {bgFullStyle, textColorStyle, t, textRTLStyle, iconColorStyle} =
    useValues();

  const route = useRoute();

  const [DataService, setDataService] = useState({
    categoria: '',
    descripcion: '',
    estatus: true,
    garantia: '',
    id: '',
    nombre_servicio: '',
    precio: '',
    puntuacion: '',
    subcategoria: [],
    taller: '',
    uid_categoria: '',
    uid_servicio: '',
    uid_subcategoria: '',
    uid_taller: '',
  });

  const [uidService, setuidService] = useState('');
  const [typeUserLogged, settypeUserLogged] = useState('');
  const [data, setData] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [dataUser, setDataUser] = useState();
  const [dataProductCategory, setDataProductCategory] = useState('');

  const [showRuta, setshowRuta] = useState(false);

  const [dataTaller, setdataTaller] = useState(null);

  const scrollRef = React.createRef();

  useEffect(() => {
    const {uid, typeUser} = route.params;

    console.log(uid);
    getDataFirst(uid, typeUser);
    scrollRef.current?.scrollTo({y: 0, animated: true}); // Scroll to top
  }, []);

  const getDataFirst = (uid, typeUser) => {
    getService(uid);
    getData(uid);
    setuidService(uid);
    settypeUserLogged(typeUser);
  };

  const getService = async uid => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;
    setDataUser(user);

    try {
      const response = await api.post('/usuarios/getServiceByUid', {
        uid: uid,
      });

      // Verificar la respuesta del servidor
      const result = response.data;
      const resultData = {
        ...response.data,
        uid_servicio: result.id,
      };

      console.log(
        'resultDataresultDataresultDataresultDataresultDataresultDataresultData',
      );
      console.log('resultData', resultData);
      console.log(
        'resultDataresultDataresultDataresultDataresultDataresultDataresultData',
      );

      if (result.message === 'Servicio encontrado') {
        setDataService(resultData.service);
        console.log("este es el servicio")
        console.log(resultData.service)

        try {
          const responseTaller = await api.post('/usuarios/getUserByUid', {
            uid: resultData.service.uid_taller
          });
          console.log("abajo esta el result123444")
          console.log(responseTaller.data.userData)
          setdataTaller(responseTaller.data.userData)
        } catch (error) {

        }


        getAdditionalServices(
          resultData?.service?.uid_categoria,
          resultData?.service?.uid_servicio
            ? resultData?.service?.uid_servicio
            : resultData?.service?.id,
        );
      } else {
        // console.log('Servicio no encontrado');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  const getData = async (id = null) => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      console.log('Usuario:', user);

      try {
        // Realizar la solicitud GET para obtener todos los servicios
        const response = await api.get('/home/getServices');

        // Verificar la respuesta del servidor
        if (response.status === 200) {
          const allServices = response.data;

          // Si se proporciona un ID, filtramos los datos localmente
          const filteredData = id
            ? allServices.filter(
                service =>
                  service.uid_servicio === id ||
                  (service.uid_servicio === '' && service.id === id),
              )
            : allServices;

          // console.log('filtered', filteredData);

          // Actualizar el estado con los datos filtrados
          setData(filteredData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
      }
    } catch (e) {
      console.error('Error al obtener el usuario:', e);
    }
  };

  const getAdditionalServices = async (category, id) => {
    try {
      // Realizar la solicitud POST con parámetros
      const response = await api.post('/home/getServicesByCategory', {
        uid_categoria: category,
        id: id,
      });
  
      // Verificar la respuesta del servidor
      if (response.status === 200) {
        const allServices = response.data;
  
        // Filtrar los servicios que sean distintos al id proporcionado
        const filteredServices = allServices.filter(service => service.id !== id || service.uid_servicio !== id);
  
        // Actualizar el estado con los datos filtrados
        setDataProductCategory(filteredServices);
      } else {
        console.warn('Respuesta no exitosa. Estado:', response.status);
        setDataProductCategory([]);
      }
    } catch (error) {
      console.error(
        'Error en la solicitud de categoría:',
        error.message || error,
      );
    }
  };
  

  const PublicarService = async () => {
    console.log(DataService);

    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post(
        '/usuarios/saveOrUpdateService',
        DataService,
      );
      // Verificar la respuesta del servidor
      const result = response.data;

      if (
        result.message === 'Servicio actualizado exitosamente' ||
        result.message === 'Servicio creado exitosamente'
      ) {
        showToast('Servicio Publicado con exito');
        navigation.goBack();
      } else {
        showToast('Ha ocurrido un error');
        navigation.goBack();
      }
    } catch (error) {
      // Manejo de errores
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
      showToast('Ha ocurrido un error');
      navigation.goBack();
    }
  };

  const handleContact = async typeContact => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;

    const servicePayload = {
      id: DataService.uid_servicio || DataService.id,
      nombre_servicio: data[0].nombre_servicio || '',
      precio: DataService?.precio || '',
      taller: data[0]?.taller?.nombre || '',
      uid_servicio: DataService.id || '',
      uid_taller: DataService?.uid_taller || '',
      usuario_id: user?.uid || '',
      usuario_nombre: user?.nombre || '',
      usuario_email: user?.email || '',
      typeContact: typeContact,
    };

    console.log('-----------------------------------------------------');
    console.log('servicePayload', servicePayload);
    console.log('-----------------------------------------------------');

    try {
      // Realizar la solicitud al endpoint
      const response = await api.post('/home/contactService', servicePayload);

      // Si llegamos aquí, la solicitud fue exitosa
      const responseData = response.data; // Axios ya procesa el JSON automáticamente
      console.log('Servicio guardado exitosamente:', responseData);
    } catch (error) {
      // Manejar errores
      if (error.response) {
        // Errores del servidor (respuesta con error, por ejemplo, 400, 500)
        console.error('Error del servidor:', error.response.data);
      } else if (error.request) {
        // La solicitud se realizó pero no hubo respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        // Otro tipo de error
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
  };

  const showToast = text => {
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const GetCoordenadas = () => {};

  const closeMapRutas = () => {
    setshowRuta(false);
  };

  const stylesMap = StyleSheet.create({
    container: {justifyContent: 'center', alignItems: 'center'},
  });
  const dataTest = [{phone: '4241436070'}];

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[external.Pb_80]}
        style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
        <View>
          <View>
            <TouchableOpacity
              onPress={() => navigation.goBack('')}
              style={{position: 'absolute', left: 0}} // Posiciona el botón de retroceso en la esquina izquierda
            >
              <View style={[{marginLeft: 20, marginTop: 16}]}>
                <BackLeft />
              </View>
            </TouchableOpacity>
          </View>
          <SliderDetails data={DataService?.service_image} />
          <View style={[external.mh_20]}>
            <Text
              style={[
                commonStyles.titleText19,
                external.mt_8,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {/* {t('transData.Beatssolo3')}  */}
              {DataService.nombre
                ? DataService.nombre
                : DataService?.nombre_servicio}
            </Text>
            <Text
              style={[commonStyles.subtitleText, {textAlign: textRTLStyle}]}>
              {data[0]?.taller?.nombre}
            </Text>
            <Text
              style={[commonStyles.subtitleText, {textAlign: textRTLStyle}]}>
              {data[0]?.taller?.estado}
            </Text>
            <DetailsTextContainer DataService={DataService} />

            <InfoContainer
              title={'Descripción'}
              text={DataService.descripcion}
            />

            <BrandData DataService={DataService} />

            <IconProduct data={data[0]?.taller?.metodos_pago} />
            <IconContact data={data} />

            {data[0]?.taller?.ubicacion?.lat != undefined &&
            data[0]?.taller?.ubicacion?.lat != '' &&
            data[0]?.taller?.ubicacion?.lng != undefined &&
            data[0]?.taller?.ubicacion?.lng != '' ? (
              <View
                style={[stylesMap.container, {marginTop: 5, marginBottom: 15}]}>
                <TouchableOpacity
                  onPress={() => {
                    setshowRuta(true);
                  }}
                  style={[
                    stylesImage.button,
                    {
                      borderWidth: 1,
                      borderColor: '#2D3261',
                      borderStyle: 'dotted',
                      borderRadius: 5,
                      backgroundColor: '#FFF',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 15,
                      marginTop: 0,
                      width: windowWidth(350),
                    },
                  ]}>
                  <Text style={{color: '#2D3261', fontWeight: '700'}}>
                    Ver en Google Maps
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {data[0]?.taller?.ubicacion?.lat != undefined &&
            data[0]?.taller?.ubicacion?.lat != '' &&
            data[0]?.taller?.ubicacion?.lng != undefined &&
            data[0]?.taller?.ubicacion?.lng != '' &&
            showRuta == true ? (
              <View
                style={[stylesMap.container, {marginTop: 5, marginBottom: 15}]}>
                <MapRutaComponent
                  initialRegion={{
                    latitude: data[0]?.taller?.ubicacion?.lat,
                    longitude: data[0]?.taller?.ubicacion?.lng,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                    name_taller: data[0]?.taller?.nombre,
                  }}
                  edit={false}
                  returnFunction={closeMapRutas}
                  useThisCoo={true}
                />
              </View>
            ) : null}

            <InfoContainer title={'Garantía'} text={DataService.garantia} />
          </View>
        </View>

        {(DataService?.id || DataService?.uid_servicio) && (
          <RatingScreen data={DataService} />
        )}

        <View style={[external.mh_20, external.mt_20]}>
          <H3HeadingCategory value={'Productos Similares'} />
          <NewArrivalBigContainer
            data={dataProductCategory}
            horizontal={true}
            width={windowWidth(205)}
            onNavigate={uidServ => {
              getDataFirst(uidServ);
              scrollRef.current?.scrollTo({y: 0, animated: true}); // Scroll to top
            }}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomContainerView}>
        <BottomContainer
          leftValue={
            typeUserLogged === 'Taller' ? (
              <TouchableOpacity
                style={[external.fd_row, external.ai_center, external.mh_20]}
                onPress={() => navigation.goBack()}>
                <View
                  style={[external.mh_15, external.fd_row, external.ai_center]}>
                  {/* <Plus color={iconColorStyle} /> */}
                  <Text style={[styles.addToBeg, {color: textColorStyle}]}>
                    Volver
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View
                style={[external.fd_row, external.ai_center, external.mh_20]}>
                {/* <View
                  style={[external.mh_15, external.fd_row, external.ai_center]}>
                  <Plus color={iconColorStyle} />
                  <Text style={[styles.addToBeg, {color: textColorStyle}]}>
                    {addtoBag}
                  </Text>
                </View> */}
              </View>
            )
          }
          value={
            typeUserLogged === 'Taller' ? (
              <TouchableOpacity
                onPress={() => PublicarService()}
                style={[external.fd_row, external.ai_center, external.pt_4]}>
                <Cart />
                <Text style={styles.buyNowText}>Publicar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={async () => {

                  // DataService.nombre

                  try {
                    await api.post('/usuarios/sendNotification', {
                      token: dataTaller.token,
                      title: 'Contacto de Usuario',
                      body: "Hola, un usuario está interesado en contactarte para el servicio de " + DataService?.nombre_servicio +".",
                      secretCode: "Usuario contacta a taller",
                    });

                    handleContact('WhatsApp');
                    Linking.openURL(
                      `https://wa.me/+58${data[0]?.taller.phone}`,
                    );
                  } catch (error) {
                    console.log(error);
                  }


                }}
                style={[external.fd_row, external.ai_center, external.pt_4]}>
                <Cart />
                <Text style={styles.buyNowText}>Contactar</Text>
              </TouchableOpacity>
            )
          }
        />
      </View>
    </View>
  );
};

const stylesImage = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProductDetailOne;
