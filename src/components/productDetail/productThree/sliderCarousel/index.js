import {Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../../style/external.css';
import {BackLeft, Heart} from '../../../../utils/icon';
import IconBackground from '../../../../commonComponents/iconBackGround';
import {Search} from '../../../../assets/icons/search';
import {details} from '../../../../constant';
import {styles} from './styles.css';
import {useValues} from '../../../../../App';
import Slider from './slider';

const SliderCarousel = () => {
  const {textColorStyle, iconColorStyle, isDark} = useValues();
  const BgColor = isDark ? '#23252B' : '#f4f5fb';
  const colors = ['#97B086', '#EFA86F', '#4775F4', '#E2DF93'];

  return (
    <View style={{backgroundColor: BgColor}}>
      <View
        style={[
          external.fd_row,
          external.js_space,
          external.ti_center,
          external.pt_15,
          external.mh_20,
          external.ai_center,
        ]}>
        <BackLeft />
        <Text style={(styles.text, {color: textColorStyle, marginLeft: 80})}>
          {details}
        </Text>
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
    </View>
  );
};

export default SliderCarousel;
