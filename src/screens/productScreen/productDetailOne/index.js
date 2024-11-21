import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Modal,
  Pressable,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomContainer from '../../../commonComponents/bottomContainer';
import {commonStyles} from '../../../style/commonStyle.css';
import {windowWidth} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';
import {Plus} from '../../../utils/icon';
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
  const [data, setData] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [dataUser, setDataUser] = useState();

  useEffect(() => {
    const {uid, typeUser} = route.params;

    getService(uid);
    // getData(uid)
    setuidService(uid);
    settypeUserLogged(typeUser);
  }, []);

  const getService = async uid => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;
    setDataUser(user);
    console.log('111111111111111111111111111111111111111111111111111111111111111111')
    console.log('valor del storage', user);
    console.log('111111111111111111111111111111111111111111111111111111111111111111')

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

      if (result.message === 'Servicio encontrado') {
        console.log(
          'Este es el usuario encontrado:*******************************************',
          resultData.service,
        );
        console.log(
          '3333333333333333333333333333333333333333333333333333333333333',
        );
        console.log('uid', uid);
        console.log('user', dataUser);
        console.log(
          '3333333333333333333333333333333333333333333333333333333333333',
        );

        setDataService(resultData.service);
      } else {
        console.log('Servicio no encontrado');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  // const getData = async (id = null) => {
  //   try {
  //     const jsonValue = await AsyncStorage.getItem('@userInfo');
  //     const user = jsonValue != null ? JSON.parse(jsonValue) : null;

  //     console.log("Usuario:", user);

  //     try {
  //       // Realizar la solicitud GET para obtener todos los servicios
  //       const response = await api.get('/home/getServices');

  //       console.log("Esto es el response", response);

  //       // Verificar la respuesta del servidor
  //       if (response.status === 200) {
  //         const allServices = response.data;

  //         // Si se proporciona un ID, filtramos los datos localmente
  //         const filteredData = id
  //           ? allServices.filter(service => service.id === id)
  //           : allServices;

  //         console.log("Resultado filtrado:", filteredData);

  //         // Actualizar el estado con los datos filtrados
  //         setData(filteredData);
  //       } else {
  //         setData([]);
  //       }
  //     } catch (error) {
  //       console.error("Error en la solicitud:", error);
  //     }
  //   } catch (e) {
  //     console.error("Error al obtener el usuario:", e);
  //   }
  // };

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

  const showToast = text => {
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };

  const copyToClipboard = phone => {
    Clipboard.setString(phone);
    Alert.alert(
      'Copiado',
      `El número ${phone} ha sido copiado al portapapeles.`,
    );
  };

  const handleOpenModal = async () => {
    const servicePayload = {
      id: DataService.id,
      nombre_servicio: DataService.nombre_servicio,
      precio: DataService.precio,
      taller: DataService.taller,
      uid_servicio: DataService.id,
      uid_taller: DataService.taller,
      usuario_id: dataUser?.uid || '',
      usuario_nombre: dataUser?.nombre || '',
      usuario_email: dataUser?.email || '',
    };
  
    try {
      // Realizar la solicitud al endpoint
      const response = await api.post('/home/contactService', servicePayload);
  
      // Si llegamos aquí, la solicitud fue exitosa
      const responseData = response.data; // Axios ya procesa el JSON automáticamente
      console.log('Servicio guardado exitosamente:', responseData);
  
      // Mostrar mensaje de éxito al usuario
  
      // Abre el modal después de guardar exitosamente
      setModalVisible(true);
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
  

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[external.Pb_80]}
        style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
        <View>
          <SliderDetails />
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
              {DataService.categoria}
            </Text>
            <DetailsTextContainer DataService={DataService} />

            {/* <DescriptionText /> */}

            <InfoContainer
              title={'Descripción'}
              text={DataService.descripcion}
            />

            <BrandData DataService={DataService} />

            <IconProduct />

            <InfoContainer title={'Garantía'} text={DataService.garantia} />

            {/* <KeyFeatures /> */}
          </View>
        </View>
        <RatingScreen />

        {typeUserLogged != 'Taller' ? (
          <Text style={styles.writeYourReview}>{writeYourReview}</Text>
        ) : null}

        <View style={[external.mh_20, external.mt_20]}>
          <H3HeadingCategory
            value={'Productos Similares'}
            seeall={'Ver todos'}
          />
          <NewArrivalBigContainer
            data={newArrivalBigData}
            horizontal={true}
            width={windowWidth(205)}
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
                onPress={() => handleOpenModal()}
                style={[external.fd_row, external.ai_center, external.pt_4]}>
                <Cart />
                <Text style={styles.buyNowText}>Contactar</Text>
              </TouchableOpacity>
            )
          }
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FlatList
              data={[
                { id: '1', phone: '123-456-7890' },
                { id: '2', phone: '987-654-3210' },
                { id: '3', phone: '456-789-0123' },
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <PhoneIcon color="#2196F3" size={24} style={{ marginRight: 10 }} />
                  <Text style={styles.phone}>{item.phone}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(item.phone)}>
                    <ClipboardDocumentIcon color="#333" size={24} />
                  </TouchableOpacity>
                </View>
              )}
            />
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={handleCloseModal}>
              <Text style={styles.textStyle}>Cerrar Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductDetailOne;
