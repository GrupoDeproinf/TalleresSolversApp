import {ScrollView, Text, TouchableOpacity, View, ToastAndroid,} from 'react-native';
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
    subcategoria: '',
    taller: '',
    uid_categoria: '',
    uid_servicio: '',
    uid_subcategoria: '',
    uid_taller: '',
  });

  const [uidService, setuidService] = useState('');
  const [typeUserLogged, settypeUserLogged] = useState('');

  useEffect(() => {
    const {uid, typeUser} = route.params;
    getService(uid);
    setuidService(uid);
    settypeUserLogged(typeUser);
  }, []);

  const getService = async uid => {
    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/getServiceByUid', {
        uid: uid,
      });

      // Verificar la respuesta del servidor
      const result = response.data;

      if (result.message === 'Servicio encontrado') {
        console.log(
          'Este es el usuario encontrado:*******************************************',
          result.service,
        );

        setDataService(result.service);
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

  const PublicarService = async() => {
    console.log(DataService);

    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/saveOrUpdateService', DataService);
      // Verificar la respuesta del servidor
      const result = response.data;

      if (
        result.message ===
        'Servicio actualizado exitosamente' || result.message ===
        'Servicio creado exitosamente'
      ) {
        showToast("Servicio Publicado con exito");
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
              {DataService.nombre_servicio}
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
                <View style={[external.mh_15, external.fd_row, external.ai_center]}>
                  {/* <Plus color={iconColorStyle} /> */}
                  <Text style={[styles.addToBeg, {color: textColorStyle}]}>
                    Volver
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View
                style={[external.fd_row, external.ai_center, external.mh_20]}>
                <View
                  style={[external.mh_15, external.fd_row, external.ai_center]}>
                  <Plus color={iconColorStyle} />
                  <Text style={[styles.addToBeg, {color: textColorStyle}]}>
                    {addtoBag}
                  </Text>
                </View>
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
                onPress={() => navigation.navigate('AddtocartOne')}
                style={[external.fd_row, external.ai_center, external.pt_4]}>
                <Cart />
                <Text style={styles.buyNowText}>{buyNow}</Text>
              </TouchableOpacity>
            )
          }
        />
      </View>
    </View>
  );
};

export default ProductDetailOne;
