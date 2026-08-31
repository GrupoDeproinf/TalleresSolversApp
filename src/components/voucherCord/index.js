import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import images from '../../utils/images';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import {fontSizes, windowHeight} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import {useNavigation} from '@react-navigation/native';
import styles from './style.css';
import {useValues} from '../../../App';

const VoucherCard = () => {
  const navigation = useNavigation('');
  const {viewRTLStyle} = useValues();
  const {isDark, textColorStyle} = useValues();
  const DarkImg = isDark ? images.darkApplyCode : images.applyCode;
  return (
    <View style={[external.mh_20, external.mv_15]}>
      <ImageBackground
        resizeMode="stretch"
        style={[styles.container, {flexDirection: viewRTLStyle}]}
        source={DarkImg}>
        <TextInput
          style={[
            commonStyles.subtitleText,
            {
              fontSize: fontSizes.FONT18,
              color: textColorStyle,
              paddingHorizontal: windowHeight(15),
            },
          ]}>
          #FIRSTORDER458ABC
        </TextInput>
        <TouchableOpacity onPress={() => navigation.navigate('VoucherScreen')}>
          <Text style={styles.applyNow}>Apply Now</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default VoucherCard;
