import {ImageBackground, Text, View} from 'react-native';
import React from 'react';
import images from '../../../utils/images';
import {external} from '../../../style/external.css';
import {Apple} from '../../../utils/icon';
import appColors from '../../../themes/appColors';
import {windowHeight} from '../../../themes/appConstant';
import {commonStyles} from '../../../style/commonStyle.css';
import {watch} from '../../../constant';
import styles from './style.css';
import {useValues} from '../../../../App';

const BannerContainer = () => {
  const {t} = useValues();
  return (
    <View style={[external.mt_20, external.mh_20]}>
      <ImageBackground
        resizeMode="cover"
        style={styles.imgStyle}
        source={images.homeBannerOne}>
      </ImageBackground>
    </View>
  );
};

export default BannerContainer;
