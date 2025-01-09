import { Text, TouchableOpacity, View, StyleSheet, Modal } from 'react-native';
import React, {useState, useEffect} from 'react';
import { BackLeft } from '../../utils/icon';
import styles from './style.css';
import { useValues } from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const FullHeader = ({ onpressBack, modelPress, value, title, show, text, showArrow, showClose, showNewService, cantServices }) => {
  const {
    linearColorStyle,
    textColorStyle,
    linearColorStyleTwo,
    viewRTLStyle,
    imageRTLStyle,
  } = useValues();

  const navigationScreen = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    const unsubscribe = navigationScreen.addListener('focus', () => {
      setModalVisible(false)
    });

    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, [navigationScreen]);



  const CloseSesion = async () => {
    console.log("aquiiii")


    try {
      await AsyncStorage.removeItem('@userInfo');
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
    }

    try {
      await AsyncStorage.removeItem('userToken');
      navigationScreen.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


  const createorEditService = async () => {
    console.log("Aquiii estoy 123123")

    if (Number(cantServices) == 0 || Number(cantServices) < 0){
      setModalVisible(true)
    } else {
      navigationScreen.navigate('FormService', {uid: ''});
      setModalVisible(false)
    }

  };

  const onCancel = () => {
    setModalVisible(false);
  };


  const gotoPlans = () =>{
    navigationScreen.navigate('Planscreen');
  }


  return (
    <View style={[styles.container, { flexDirection: viewRTLStyle }]}>


      {
        showArrow ?? (
          <TouchableOpacity
            onPress={onpressBack}
            style={{ transform: [{ scale: imageRTLStyle }] }}>
            <BackLeft />
          </TouchableOpacity>
        )
      }

      {
        showClose ? (
          <TouchableOpacity onPress={CloseSesion}>
            <Text style={{ color: '#2D3261' }}>Cerrar Sesión</Text>
          </TouchableOpacity>

        ) : null
      }

{
        showNewService ? (
          <TouchableOpacity onPress={createorEditService} style={{marginRight:-55}}>
            <Text style={{ color: '#2D3261' }}>Agregar</Text>
          </TouchableOpacity>

        ) : null
      }
      





      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: showClose == true ? -60 : 20  }}>
        <Text style={[styles.titleText, { color: textColorStyle }]}>{title}</Text>
      </View>


      {show ? (
        <View>{text}</View>
      ) : (
        <TouchableOpacity activeOpacity={0.9} onPress={modelPress}>
          <LinearGradient
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
            colors={linearColorStyleTwo}
            style={[styles.cardContainer]}>
            <LinearGradient
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 0.0, y: 1.0 }}
              colors={linearColorStyle}
              style={[styles.menuItemContent]}>
              {value}
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      )}



      {/* Modal de no tiene servicios disponible */}

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
};

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

export default FullHeader;
