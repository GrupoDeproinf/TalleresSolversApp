import {Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../../style/external.css';
import {brandData} from '../../../../data/productDetailBrand';
import {commonStyles} from '../../../../style/commonStyle.css';
import appColors from '../../../../themes/appColors';
import {fontSizes} from '../../../../themes/appConstant';
import {useValues} from '../../../../../App';
import { t } from 'i18next';

const BrandData = ({DataService}) => {
  const {textColorStyle, viewRTLStyle, textRTLStyle, isRTL} = useValues();
  

  return (
    <View>
      <View style={[external.mt_10]}>
        {/* {brandData.map((item, index) => ( */}
          <View
            style={[
              external.fd_row,
              external.mt_5,
              {flexDirection: viewRTLStyle},
            ]}>
            <Text
              style={[
                commonStyles.subtitleText,
                {width: isRTL ? null : '35%'},
                {textAlign: textRTLStyle},
              ]}>

                Categoria
            </Text>
            <View style={[external.fd_row, {flexDirection: viewRTLStyle}]}>
              <Text
                style={[
                  commonStyles.titleText19,
                  external.ph_10,
                  {color: appColors.subtitle, fontSize: fontSizes.FONT17},
                  {textAlign: textRTLStyle},
                ]}>
                :
              </Text>
              <Text
                style={[
                  commonStyles.subtitleText,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {/* {item.subttile} */}
                {DataService?.categoria ? DataService?.categoria : DataService?.nombre_categoria}
              </Text>
            </View>
          </View>
        {/* ))} */}
      </View>

      <View style={[external.mt_10]}>
        {/* {brandData.map((item, index) => ( */}
          <View
            style={[
              external.fd_row,
              external.mt_5,
              {flexDirection: viewRTLStyle},
            ]}>
            <Text
              style={[
                commonStyles.subtitleText,
                {width: isRTL ? null : '35%'},
                {textAlign: textRTLStyle},
              ]}>

              Subcategoria
            </Text>
            <View style={[external.fd_row, {flexDirection: viewRTLStyle}]}>
              <Text
                style={[
                  commonStyles.titleText19,
                  external.ph_10,
                  {color: appColors.subtitle, fontSize: fontSizes.FONT17},
                  {textAlign: textRTLStyle},
                ]}>
                :
              </Text>
              <Text
                style={[
                  commonStyles.subtitleText,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {/* {item.subttile} */}
                {Array.isArray(DataService?.subcategoria) ? DataService?.subcategoria[0]?.nombre_subcategoria : t(DataService?.subcategoria)}
              </Text>
            </View>
          </View>
        {/* ))} */}
      </View>
    </View>
  );
};

export default BrandData;
