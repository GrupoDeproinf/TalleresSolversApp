import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import appColors from '../../themes/appColors';
import {windowHeight} from '../../themes/appConstant';
import JsSpaceContainer from '../jsSpaceContainer';
import DashedBorderComponent from '../dashBorder';
import SolidLine from '../solidLine';
import {external} from '../../style/external.css';
import {styles} from './style.css';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';

const SubtotalContainer = () => {
  const {linearColorStyle, isDark, t, currSymbol, currPrice} = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  return (
    <>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.container,
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
          <JsSpaceContainer
            title={t('transData.subTotal')}
            price={`${currSymbol}${(currPrice * 3914.79).toFixed(2)}`}
          />

          <JsSpaceContainer
            title={t('transData.shippingCharge')}
            price={`${currSymbol}${(currPrice * 50.0).toFixed(2)}`}
          />
          <View style={[external.mv_5]}>
            <DashedBorderComponent />
          </View>
          <JsSpaceContainer
            title={t('transData.totalAmount')}
            price={`${currSymbol}${(currPrice * 3964.79).toFixed(2)}`}
          />
          <JsSpaceContainer
            title={t('transData.discount10')}
            price={`${currSymbol}${(currPrice * 396.48).toFixed(2)}`}
          />
          <SolidLine marginVertical={windowHeight(10)} />
          <JsSpaceContainer
            title={t('transData.payableAmount')}
            price={`${currSymbol}${(currPrice * 3568.31).toFixed(2)}`}
            color={'#2D3261'}
          />
        </LinearGradient>
      </LinearGradient>
    </>
  );
};

export default SubtotalContainer;
