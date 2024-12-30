import React, {useState} from 'react';
import {FlatList, Image, TouchableOpacity, View, Text} from 'react-native';
import {sliderStyles} from './styles.css';
import notImageFound from '../../../../assets/noimageold.jpeg';
import {useValues} from '../../../../../App';

const SliderDetails = ({data}) => {
  const [selected, setSelected] = useState(0);
  const {isDark} = useValues();

  // Validamos y normalizamos la data
  const formattedData = Array.isArray(data)
    ? data.map(url => ({service_image: url}))
    : [];

  console.log('Data recibida:', data);
  console.log('Formatted Data:', formattedData);

  const renderItem = ({item, index}) => {
    const isSelected = index === selected;
    return (
      <TouchableOpacity
        onPress={() => setSelected(index)}
        style={[
          isSelected
            ? sliderStyles.sliderItemSelected
            : sliderStyles.sliderItemUnselected,
        ]}>
        <Image
          style={[
            sliderStyles.sliderImage,
            isSelected
              ? sliderStyles.sliderImageSelected
              : sliderStyles.sliderImageUnselected,
          ]}
          source={
            item?.service_image ? {uri: item.service_image} : notImageFound
          }
        />
      </TouchableOpacity>
    );
  };

  if (!formattedData || formattedData.length === 0) {
    return (
      <View style={sliderStyles.container}>
        <Image
          style={[
            sliderStyles.productImage, // Estilo para la imagen principal
            {
              alignSelf: 'center', // Centramos la imagen
              marginTop: 20, // Espaciado superior
            },
          ]}
          source={notImageFound}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        sliderStyles.container,
        {backgroundColor: isDark ? '#202329' : '#F3F5FB'},
      ]}>
      {/* Imagen principal */}
      <Image
        style={sliderStyles.productImage}
        source={
          formattedData[selected]?.service_image
            ? {uri: formattedData[selected].service_image}
            : notImageFound
        }
      />

      {/* Lista de imágenes en miniatura */}
      {formattedData.length > 1 && (
        <FlatList
          renderItem={renderItem}
          data={formattedData}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          style={{marginTop: 20}}
          ItemSeparatorComponent={() => (
            <View style={sliderStyles.itemSeparator} />
          )}
        />
      )}
    </View>
  );
};

export default SliderDetails;
