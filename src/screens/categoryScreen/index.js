import {View} from 'react-native';
import React from 'react';
import {external} from '../../style/external.css';
import HeaderContainer from '../../components/categoryContainer/headerContainer';
import SearchContainer from '../../components/homeScreen/searchContainer';
import ProductContainer from '../../components/categoryContainer/productContainer';
import {commonStyles} from '../../style/commonStyle.css';
import {useValues} from '../../../App';

const CategoryScreen = () => {
  const {bgFullStyle} = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.pt_10, external.ph_20]}>
        <HeaderContainer />
      </View>
      {/* <SearchContainer /> */}
      <ProductContainer />
    </View>
  );
};

export default CategoryScreen;
