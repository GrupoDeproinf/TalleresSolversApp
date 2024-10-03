import {ImageBackground, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {commonStyles} from '../../style/commonStyle.css';
import {apply, myCoupon, off} from '../../constant';
import {external} from '../../style/external.css';
import {voucherData} from '../../data/voucherData';
import {windowHeight} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import styles from './style.css';
import {useValues} from '../../../App';

const VoucherScreen = ({navigation}) => {
  const {bgFullStyle, isDark, textColorStyle} = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.ph_20]}>
        <HeaderContainer value={myCoupon} />
      </View>
      {voucherData.map((item, index) => (
        <View>
          <ImageBackground
            style={styles.img}
            source={isDark ? item.imgDark : item.img}>
            <Text
              style={[
                styles.offText,
                {
                  color: item.textColor
                    ? appColors.bgLayer
                    : appColors.subtitle,
                },
              ]}>
              {item.off}
              <Text
                style={[
                  commonStyles.titleText19,
                  {
                    color: item.textColor
                      ? appColors.bgLayer
                      : appColors.subtitle,
                  },
                ]}>
                {off}
              </Text>
            </Text>
            <View style={styles.viewText}>
              <View style={styles.viewTitleText}>
                <Text style={[styles.viewTitleText, {color: textColorStyle}]}>
                  {item.title}
                </Text>
                <View style={{marginRight: windowHeight(23)}}>{item.icon}</View>
              </View>
              <View style={[external.fd_row, external.ai_center]}>
                <Text style={styles.subtitleText}>
                  {item.subtitle}
                  {''}
                  <Text
                    style={{
                      color: item.textColor
                        ? textColorStyle
                        : appColors.subtitle,
                    }}>
                    {item.voucherCode}
                  </Text>
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack('')}>
                  <Text
                    style={[
                      styles.applyText,
                      {
                        color: item.textColor
                          ? appColors.primary
                          : appColors.subtitle,
                      },
                    ]}>
                    {apply}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
      ))}
    </View>
  );
};

export default VoucherScreen;
