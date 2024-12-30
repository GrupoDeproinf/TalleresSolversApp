import React, { useState } from 'react';
import { FlatList, Image, TouchableOpacity, View } from 'react-native';
import { sliderStyles } from './styles.css';
import images from '../../../../utils/images';
import { useValues } from '../../../../../App';

const SliderDetails = ({ data }) => {
  const [selected, setSelected] = useState(0);
  const { isDark } = useValues();

  console.log('----------------------------------------------------------------')
  console.log('data', data)
  console.log('----------------------------------------------------------------')

  const renderItem = ({ item, index }) => {
    const isSelected = index === selected;
    return (
      <TouchableOpacity
        onPress={() => setSelected(index)}
        style={[
          isSelected
            ? sliderStyles.sliderItemSelected
            : sliderStyles.sliderItemUnselected,
        ]}
      >
        <Image
          style={[
            sliderStyles.sliderImage,
            isSelected
              ? sliderStyles.sliderImageSelected
              : sliderStyles.sliderImageUnselected,
          ]}
          source={item.images}
        />
      </TouchableOpacity>
    );
  };

  // Si solo hay una imagen, mostramos una única vista
  if (data?.length === 1) {
    return (
      <View
        style={[
          sliderStyles.container,
          { backgroundColor: isDark ? '#202329' : '#F3F5FB' },
        ]}
      >
        <Image
          style={sliderStyles.productImage}
          source={data[0].images}
        />
      </View>
    );
  }

  // Si hay varias imágenes, mostramos el carrusel
  return (
    <View
      style={[
        sliderStyles.container,
        { backgroundColor: isDark ? '#202329' : '#F3F5FB' },
      ]}
    >
      <Image style={sliderStyles.productImage} source={data[selected].images} />

      <FlatList
        renderItem={renderItem}
        data={data}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 20 }}
        ItemSeparatorComponent={() => <View style={sliderStyles.itemSeparator} />}
      />
    </View>
  );
};

export default SliderDetails;
