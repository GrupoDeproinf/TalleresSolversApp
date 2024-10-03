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
        <View style={styles.viewContainer}>
          <Apple colors={appColors.screenBg} width={windowHeight(20)} />
          <Text style={[commonStyles.H1Banner, external.mh_5, external.mt_3]}>
            {watch}
          </Text>
        </View>
        <Text style={styles.activeText}> {t('transData.activeStyle')}</Text>
        <Text style={styles.seriesText}>{t('transData.series')}</Text>
        <Text style={styles.fullScreenText}>{t('transData.fullScreen')}</Text>
      </ImageBackground>
    </View>
  );
};

export default BannerContainer;
