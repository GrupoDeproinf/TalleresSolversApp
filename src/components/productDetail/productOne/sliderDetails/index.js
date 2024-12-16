import React, {useState} from 'react';
import {FlatList, Image, TouchableOpacity, Text, View} from 'react-native';
import {commonStyles} from '../../../../style/commonStyle.css';
import {BackLeft, Heart} from '../../../../utils/icon';
import {details} from '../../../../constant';
import {external} from '../../../../style/external.css';
import IconBackground from '../../../../commonComponents/iconBackGround';
import images from '../../../../utils/images';
import {sliderData} from '../../../../data/productDetailBrand';
import {sliderStyles} from './styles.css';
import {useValues} from '../../../../../App';
import {Search} from '../../../../assets/icons/search';
import {windowHeight} from '../../../../themes/appConstant';
import {useNavigation} from '@react-navigation/native';

const SliderDetails = (data) => {
  const [selected, setSelected] = useState(0);
  const [productImage, setProductImage] = useState(images.productImage);
  const {isDark, textColorStyle, iconColorStyle} = useValues();
  const colors = ['#97B086', '#EFA86F', '#4775F4', '#E2DF93'];
  const navigation = useNavigation();
  const renderItem = ({item, index}) => {
    const isSelected = item.id === selected;
    return (
      <View style={[sliderStyles.sliderItemContainer]}>
        <TouchableOpacity
          onPress={() => {
            setSelected(index);
            setProductImage(item.images);
          }}
          style={
            isSelected
              ? [
                  sliderStyles.sliderItemSelected,
                  {backgroundColor: isDark ? '#1A1C22' : 'white'},
                ]
              : [sliderStyles.sliderItemUnselected]
          }>
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
      </View>
    );
  };

  return (
    <View
      style={[
        sliderStyles.container,
        {backgroundColor: isDark ? '#202329' : '#F3F5FB'},
      ]}>
      <View style={sliderStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack('')}>
          <BackLeft />
        </TouchableOpacity>
        <Text
          style={[
            commonStyles.titleText19,
            sliderStyles.titleText,
            {color: textColorStyle},
          ]}>
          {details}
        </Text>
        <View style={sliderStyles.iconContainer}>
          <TouchableOpacity style={sliderStyles.iconMargin}>
            <IconBackground value={<Search color={iconColorStyle} />} />
          </TouchableOpacity>
          <IconBackground value={<Heart />} />
        </View>
      </View>
      <View>
        {colors.map((color, index) => (
          <View
            key={index}
            style={[sliderStyles.colorMap, {backgroundColor: color}]}
          />
        ))}
      </View>

      <Image style={sliderStyles.productImage} source={productImage} />
      <Image
        style={sliderStyles.productImageTwo}
        source={images.productRound}
      />

      <FlatList
        renderItem={renderItem}
        data={data}
        horizontal
        style={[external.as_center, {marginTop: windowHeight(40)}]}
        // eslint-disable-next-line react/no-unstable-nested-components
        ItemSeparatorComponent={() => (
          <View style={sliderStyles.itemSeparator} />
        )}
      />
    </View>
  );
};

export default SliderDetails;
