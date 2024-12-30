import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import FullHeader from '../../commonComponents/fullHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import api from '../../../axiosInstance';
import {useValues} from '../../../App';
import {textColorStyle} from '../../style/darkStyle';
import styles from './style.css';
import {commonStyles} from '../../style/commonStyle.css';
import moment from 'moment';
import HeaderContainer from '../../commonComponents/headingContainer';
import { external } from '../../style/external.css';

const PlanesContainer = () => {
  const {bgFullStyle, t} = useValues();
  const [dataTalleres, setDataTalleres] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    getData();

    // Limpia el listener cuando el componente se desmonta
  }, [navigation]);

  const getData = async () => {
    try {
      // Obtén datos del AsyncStorage
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log('........................................................');
      console.log('User info:', user?.uid);
      console.log('........................................................');

      if (!user || !user.uid) {
        console.error(
          'No se encontró información del usuario o UID es inválido',
        );
        setDataTalleres([]);
        return;
      }

      try {
        // Solicita datos a la API
        const response = await api.post('/home/getSubscriptionById', {
          uid: user.uid,
        });

        if (response.status === 200) {
          const result = response.data;
          console.log(
            '_________________________________________________________________',
          );
          console.log('result.data', result);
          console.log(
            '_________________________________________________________________',
          );

          // Procesa los datos para convertir y formatear las fechas
          const talleresConFechas = result.map(taller => {
            const fechaInicioFormateada = taller.fecha_inicio
              ? moment(
                  taller.fecha_inicio.toDate
                    ? taller.fecha_inicio.toDate()
                    : taller.fecha_inicio,
                ).format('DD/MM/YYYY')
              : null;

            const fechaFinFormateada = taller.fecha_fin
              ? moment(
                  taller.fecha_fin.toDate
                    ? taller.fecha_fin.toDate()
                    : taller.fecha_fin,
                ).format('DD/MM/YYYY')
              : null;

            return {
              ...taller,
              fecha_inicio_formateada: fechaInicioFormateada,
              fecha_fin_formateada: fechaFinFormateada,
            };
          });

          setDataTalleres(talleresConFechas); // Actualiza el estado con los datos procesados
        } else {
          setDataTalleres([]);
        }
      } catch (error) {
        setDataTalleres([]);
        console.error(
          'Error en la solicitud:',
          error.response?.data || error.message,
        );
      }
    } catch (e) {
      setDataTalleres([]);
      console.log('Error al obtener datos del AsyncStorage:', e);
    }
  };

  return (
    <View
    style={[
      commonStyles.commonContainer,
      external.ph_20,
      {backgroundColor: bgFullStyle},
    ]}>
      <HeaderContainer value="Planes" />

      <ScrollView contentContainerStyle={styles.scrollView}>
        {dataTalleres.length > 0 ? (
          dataTalleres.map((taller, index) => {
            let fechaFinFormateada = 'Fecha no disponible';

            try {
              if (taller.fecha_fin && taller.fecha_fin._seconds) {
                // Convierte el timestamp en segundos a una fecha legible
                fechaFinFormateada = moment
                  .unix(taller.fecha_fin._seconds)
                  .format('DD/MM/YYYY');
              }
            } catch (error) {
              console.error('Error al formatear fecha:', error);
            }

            return (
              <View
                key={index}
                style={styles.planCard}>
                <View style={styles.infoRow}>
                  <View>
                    <Text style={[styles.planTitle]}>{taller.nombre}</Text>
                    <Text style={[styles.datoSub]}>
                      Vencimiento: {fechaFinFormateada}
                    </Text>
                    <Text style={[styles.datoSub]}>
                      Duración: {taller.vigencia} días
                    </Text>
                  </View>
                  <View>
                    {taller.status === 'Aprobado' && (
                      <Text style={[styles.aprobado]}>{taller.status}</Text>
                    )}

                    {taller.status === 'Por Aprobar' && (
                      <Text style={[styles.poraprobar]}>{taller.status}</Text>
                    )}

                    {taller.status === 'Vencido' && (
                      <Text style={[styles.vencido]}>{taller.status}</Text>
                    )}
                    <Text style={styles.planPrice}>
                      Precio: {taller.monto} USD
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={[styles.noDataText, {color: textColorStyle}]}>
            No hay planes disponibles
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default PlanesContainer;
