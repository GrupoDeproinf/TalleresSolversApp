import {Image, Text, View} from 'react-native';
import React from 'react';
import {commonStyles} from '../../style/commonStyle.css';
import HeaderContainer from '../../commonComponents/headingContainer';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';
import SolidLine from '../../commonComponents/solidLine';
import images from '../../utils/images';
import OrderStepIndicator from '../../components/orderStepIndicator';
import NavigationButton from '../../commonComponents/navigationButton';
import styles from './style.css';
import DashedBorderComponent from '../../commonComponents/dashBorder';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

const OrderStatus = () => {
  const {
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    isDark,
    viewRTLStyle,
    t,
    textRTLStyle,
    currSymbol,
    currPrice,
  } = useValues();
  const navigation = useNavigation();

  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];

  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeaderContainer value={t('transData.orderStatus')} />
      <View style={[external.as_center, external.mt_20]}>
        <Text style={styles.expectedDataStyle}>
          {t('transData.expectedDelivery')}
        </Text>
        <Text style={[styles.expectedData, {color: textColorStyle}]}>
          {t('transData.expectedData')}
        </Text>
      </View>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.whiteContainer,
          {shadowColor: appColors.shadowColor, borderradius: 6},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
          ]}>
          <View style={[styles.trackOrderView, {flexDirection: viewRTLStyle}]}>
            <Text style={[commonStyles.titleText19, {color: textColorStyle}]}>
              {t('transData.trackOrder')}
            </Text>
            <Text
              style={[
                commonStyles.subtitleText,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {'Order ID : #4563213'}
            </Text>
          </View>
          <SolidLine />
          <View
            style={[
              external.fd_row,
              external.ai_center,
              {flexDirection: viewRTLStyle},
            ]}>
            <View
              style={[
                styles.imgView,
                {backgroundColor: isDark ? '#1A1C22' : '#F3F5FB'},
              ]}>
              <Image style={styles.img} source={images.productImageTwo} />
            </View>
            <View>
              <Text
                style={[
                  commonStyles.titleText19,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {t('transData.beatssolo')}
              </Text>
              <Text
                style={[commonStyles.subtitleText, {textAlign: textRTLStyle}]}>
                {t('transData.colorBlue')}
              </Text>
              <Text
                style={[
                  styles.text,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {currSymbol}
                {(currPrice * 456.23).toFixed(2)}
              </Text>
            </View>
          </View>
          <DashedBorderComponent />
          <OrderStepIndicator />
        </LinearGradient>
      </LinearGradient>
      <View style={[external.mt_25]}>
        <NavigationButton
          backgroundColor={appColors.primary}
          title={'Back to Home'}
          color={appColors.screenBg}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{name: 'DrawerScreen'}],
            });
          }}
        />
      </View>
    </View>
  );
};

export default OrderStatus;
