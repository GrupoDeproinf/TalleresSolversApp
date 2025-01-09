import {Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../../style/external.css';
import {BackLeft, Heart} from '../../../../utils/icon';
import {details} from '../../../../constant';
import IconBackground from '../../../../commonComponents/iconBackGround';
import Slider from './slider';
import {Search} from '../../../../assets/icons/search';
import {useValues} from '../../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {styles} from './slider/styles';

const SliderDetailsTwo = () => {
  const {iconColorStyle, textColorStyle, linearColorStyle} = useValues();
  const colors = ['#97B086', '#EFA86F', '#4775F4', '#E2DF93'];
  return (
    <>
      <LinearGradient colors={linearColorStyle} style={styles.linear} />
      <View
        style={[
          external.fd_row,
          external.js_space,
          external.ti_center,
          external.pt_15,
        ]}>
        <BackLeft />
        <Text style={(styles.text, {color: textColorStyle})}>{details}</Text>
        <View style={[external.fd_row, external.ai_center]}>
          <View style={[external.mh_5]}>
            {/* <IconBackground value={<Search color={iconColorStyle} />} /> */}
          </View>
          <IconBackground value={<Heart />} />
        </View>
      </View>
      <Slider />
      <View style={styles.viewStyle}>
        {colors.map((color, index) => (
          <View
            key={index}
            style={[styles.colorMap, {backgroundColor: color}]}
          />
        ))}
      </View>
    </>
  );
};

export default SliderDetailsTwo;
