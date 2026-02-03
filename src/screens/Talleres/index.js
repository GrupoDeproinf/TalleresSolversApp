import {ScrollView, Text, View, useFocusEffect, TouchableOpacity, Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native';
import React, { useEffect, useState } from 'react';
import FullHeader from '../../commonComponents/fullHeader';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import NewArrivalContainer from '../../components/homeScreen/newArrivalContainer';
import {newArrivalData} from '../../data/homeScreen/newArrivalData';
import styles from './style.css';
import {useValues} from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import api from '../../../axiosInstance';
import Icons from 'react-native-vector-icons/FontAwesome';
import { Filter } from '../../utils/icon';
import appColors from '../../themes/appColors';



const TalleresContainer = ({navigation}) => {

  const {bgFullStyle, t, textColorStyle} = useValues();

  const [dataTalleres, setdataTalleres] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterText, setFilterText] = useState('');

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
          // Hacer la solicitud GET utilizando Axios
          const response = await api.post('/usuarios/getTalleres', {
            estado: user.estado // Reemplaza 'tu_estado_aqui' con la variable del estado que deseas pasar
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
      
          // Verificar la respuesta del servidor
          if (response.status === 200) {
              const result = response.data;
              console.log("usuarios de resultados", result); // Aquí puedes manejar la respuesta
      
              setdataTalleres(result);
              setFilteredData(result); // Inicializar los datos filtrados con todos los datos
          } else {
              setdataTalleres([]);
              setFilteredData([]);
          }
      } catch (error) {
          setdataTalleres([]);
          setFilteredData([]);
          if (error.response) {
              console.error('Error en la solicitud:', error.response.data.message || error.response.statusText);
          } else {
              console.error('Error en la solicitud:', error.message);
          }
      }
      

    } catch(e) {
        setdataTalleres([])
        setFilteredData([])
        console.log(e)
    }
};

  // Función para filtrar los datos
  const handleFilter = (text) => {
    setFilterText(text);
    
    if (text.trim() === '') {
      // Si el texto está vacío, mostrar todos los datos
      setFilteredData(dataTalleres);
    } else {
      // Filtrar por nombre o estado
      const filtered = dataTalleres.filter(taller => {
        const nombreMatch = taller.nombre?.toLowerCase().includes(text.toLowerCase());
        const estadoMatch = taller.estado?.toLowerCase().includes(text.toLowerCase());
        return nombreMatch || estadoMatch;
      });
      setFilteredData(filtered);
    }
  };

  // Limpiar filtro
  const clearFilter = () => {
    setFilterText('');
    setFilteredData(dataTalleres);
    setShowFilterModal(false);
  };

  const CloseSesion = async () => {
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

  return (
    <View
    style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>

      <View style={[external.mh_20, { marginTop: 10, marginBottom: 10 }]}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 50,
        }}>
          {/* Icono de cerrar sesión a la izquierda */}
          <TouchableOpacity
            onPress={CloseSesion}
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icons name="sign-out" size={24} color={textColorStyle} />
          </TouchableOpacity>

          {/* Título "Talleres" en el centro */}
          <Text style={[
            commonStyles.titleText19,
            { color: textColorStyle, fontWeight: 'bold', fontSize: 18 }
          ]}>
            Talleres
          </Text>

          {/* Icono de filtro a la derecha */}
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Filter />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[external.Pb_80]}>
        <NewArrivalContainer
          data={filteredData}
          show={false}
          showPlus={true}
          showcity={true}
        />
      </ScrollView>

      {/* Modal de Filtro */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={modalStyles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
              <TouchableWithoutFeedback>
                <View style={[modalStyles.modalContent, { backgroundColor: bgFullStyle }]}>
                  <View style={modalStyles.modalHeader}>
                    <Text style={[modalStyles.modalTitle, { color: textColorStyle }]}>
                      Filtrar Talleres
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowFilterModal(false)}
                      style={modalStyles.closeButton}>
                      <Icons name="times" size={24} color={textColorStyle} />
                    </TouchableOpacity>
                  </View>

                  <View style={modalStyles.inputContainer}>
                    <TextInput
                      style={[modalStyles.input, { 
                        color: textColorStyle, 
                        borderColor: textColorStyle === '#000' ? '#ccc' : '#555',
                        backgroundColor: bgFullStyle === '#000' ? '#333' : '#fff'
                      }]}
                      placeholder="Buscar por nombre o estado..."
                      placeholderTextColor={appColors.subtitle}
                      value={filterText}
                      onChangeText={handleFilter}
                      autoFocus={true}
                    />
                  </View>

                  <View style={modalStyles.buttonContainer}>
                    <TouchableOpacity
                      onPress={clearFilter}
                      style={[modalStyles.button, modalStyles.clearButton]}>
                      <Text style={modalStyles.clearButtonText}>Limpiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowFilterModal(false)}
                      style={[modalStyles.button, modalStyles.applyButton]}>
                      <Text style={modalStyles.applyButtonText}>Aplicar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default TalleresContainer;

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '60%',
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#e0e0e0',
  },
  clearButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#2D3261',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
