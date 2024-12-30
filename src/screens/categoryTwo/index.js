import {Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import HeaderContainer from '../../components/categoryContainer/headerContainer';
import SearchContainer from '../../components/homeScreen/searchContainer';
import appColors from '../../themes/appColors';
import {useValues} from '../../../App';
import {styles} from './styles.css';
import CategoryDetailScreen from '../../components/categoryDetailScreen';
import LinearGradient from 'react-native-linear-gradient';
import api from '../../../axiosInstance';
const CategoryTwo = () => {
  const adjustDataForNumber = (data, number) => {
    const adjustedData = [...data];
    adjustedData.forEach(item => {
      item.id = (item.id + number) % adjustedData.length;
    });
    adjustedData.sort((a, b) => a.id - b.id);

    return adjustedData;
  };
  const [selectedItem, setSelectedItem] = useState(0);
  const {isRTL, isDark, viewRTLStyle, t} = useValues();
  const colorBg = isDark ? appColors.bgLayout : appColors.layoutBg;
  const colorBgDark = isDark ? appColors.blackBg : appColors.screenBg;
  const colorText = isDark ? appColors.titleText : appColors.lightButton;
  const colorTextDark = isDark ? appColors.screenBg : appColors.titleText;

  const borderwidth = isRTL ? 2 : null;
  const {bgFullStyle, linearColorStyle} = useValues();

  const [categories, setCategories] = useState('');

  const getCategories = async () => {
    try {
      // Realizar la solicitud GET utilizando Axios
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Verificar que la respuesta del servidor sea exitosa
      if (response.status === 200) {
        const result = response.data;
  
        console.log('=================================================================================')
        console.log('response.data', result)
        console.log('=================================================================================')

        if (Array.isArray(result)) {
          setCategories(result);
        } else {
          console.warn('La respuesta no contiene un array válido de categorías.');
          setCategories([]);
        }
      } else {
        // Respuesta inesperada, establecer un array vacío
        setCategories([]);
      }
    } catch (error) {
      // Manejar errores en la solicitud
      setCategories([]);
      if (error.response) {
        console.error(
          'Error en la solicitud:',
          error.response.data?.message || error.response.statusText,
        );
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };
  
useEffect(() => {
  getCategories();
}, []);


  return (
    <View></View>
      // style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      // <View style={[external.pt_10, external.ph_20]}>
      //   <HeaderContainer />
      // </View>
      // <SearchContainer />
      // <View style={[styles.content, {flexDirection: viewRTLStyle}]}>
      //   <LinearGradient
      //     start={{x: 0.0, y: 0.0}}
      //     end={{x: 0.0, y: 1.0}}
      //     colors={linearColorStyle}
      //     style={[styles.menuColumn, {backgroundColor: colorBg}]}>
      //     {categories.map((item, index) => {
      //       return (
      //         <View>
      //           <TouchableOpacity
      //             key={item.id}
      //             onPress={() => setSelectedItem(item.id)}
      //             style={[
      //               styles.menuItem,
      //               item.id === selectedItem ? styles.selectedMenuItem : null,
      //               item.id === selectedItem && {borderRightColor: colorText},
      //               item.id === selectedItem && {borderLeftWidth: borderwidth},
      //               item.id === selectedItem && {backgroundColor: colorBgDark},
      //             ]}>
      //             <Text
      //               style={[
      //                 styles.menuItemText,
      //                 item.id === selectedItem
      //                   ? styles.menuItemTextSelect
      //                   : null,
      //                 item.id === selectedItem && {color: colorTextDark},
      //               ]}>
      //               {t(item.title)}
      //             </Text>
      //           </TouchableOpacity>
      //         </View>
      //       );
      //     })}
      //   </LinearGradient>
      //   <View>
      //     <CategoryDetailScreen
      //       data={adjustDataForNumber(categories, selectedItem)}
      //       number={selectedItem}
      //     />
      //   </View>
      // </View>
    // </View>
  );
};

export default CategoryTwo;
