import {Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {external} from '../../../../style/external.css';
import styles from './styles.css';
import {useValues} from '../../../../../App';

const DetailsTextContainer = ({DataService}) => {
  const {textColorStyle, viewRTLStyle, currSymbol, currPrice} = useValues();

  return (
    <View>
      <View style={[styles.viewStyle, {flexDirection: viewRTLStyle}]}>
        <View
          style={[
            external.fd_row,
            {alignItems: 'baseline'},
            {flexDirection: viewRTLStyle},
          ]}>
          <Text style={[styles.priceContainer, {color: textColorStyle}]}>
            {currSymbol}
            {
              DataService != undefined ? (
                DataService?.precio
              ) : (
                (currPrice * 456.23).toFixed(2)
              )
            }
          </Text>
          {/* <Text style={[styles.priceText, external.ph_5]}>
            {currSymbol}
            {(currPrice * 556.45).toFixed(2)}
          </Text> */}
        </View>
        {/* <View style={styles.percentageOff}>
          <Text style={styles.textStyle}>10% off</Text>
        </View> */}
      </View>
    </View>
  );
};

export default DetailsTextContainer;
