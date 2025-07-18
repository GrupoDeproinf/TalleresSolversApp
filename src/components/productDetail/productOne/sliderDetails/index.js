import React, {useState} from 'react';
import {FlatList, Image, TouchableOpacity, View, Text} from 'react-native';
import {sliderStyles} from './styles.css';
import notImageFound from '../../../../assets/noimageold.jpeg';
import {useValues} from '../../../../../App';
import solversLogo from '../../../../assets/solverslogo.png';

const SliderDetails = ({data}) => {
  const [selected, setSelected] = useState(0);
  const {isDark} = useValues();

  // Validamos y normalizamos la data
  const formattedData = Array.isArray(data)
    ? data.map(url => ({service_image: url}))
    : [];

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
      <View
        style={[
          sliderStyles.container,
          {justifyContent: 'center', alignItems: 'center', height: 180},
        ]}>
        <Image
          source={solversLogo}
          style={{
            width: 80,
            height: 80,
            resizeMode: 'contain',
            marginBottom: 10,
          }}
        />
        <Text
          style={{
            color: '#9BA6B8',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
          Imagen{'\n'}no disponible
        </Text>
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
