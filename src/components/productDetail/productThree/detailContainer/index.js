import {ImageBackground, Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../../style/external.css';
import {commonStyles} from '../../../../style/commonStyle.css';
import images from '../../../../utils/images';
import styles from './style';
import {useValues} from '../../../../../App';
import IconBackground from '../../../../commonComponents/iconBackGround';
import appColors from '../../../../themes/appColors';
import {Battery, Ble, Wifi} from '../../../../utils/icon';
import {fontSizes} from '../../../../themes/appConstant';

const DetailContainer = () => {
  const {
    isRTL,
    setIsRTL,
    isDark,
    setIsDark,
    textRTLStyle,
    viewRTLStyle,
    t,
    setCurrSymbol,
    setCurrPrice,
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
  } = useValues();
  const Bgimg = isDark ? images.colorProductTwo : images.colorProduct;
  return (
    <View style={[external.mh_20]}>
      <ImageBackground
        resizeMode="stretch"
        style={styles.imgBackground}
        source={Bgimg}>
        <View style={[external.mh_20, external.mt_30]}>
          <Text
            style={[
              commonStyles.titleText19,
              external.mt_8,
              {color: textColorStyle},
            ]}>
            Beats solo3 Bluetooth Headset | Blue
          </Text>
          <Text style={[commonStyles.subtitleText]}>
            16 Hours playback, On ear headphones
          </Text>
          <View
            style={[
              external.fd_row,
              external.ai_center,
              external.js_space,
              external.mt_20,
            ]}>
            <View style={[external.fd_row, {alignItems: 'baseline'}]}>
              <Text style={[styles.priceContainer, {color: textColorStyle}]}>
                $456.23
              </Text>
              <Text style={[styles.priceText, external.ph_5]}>$556.45</Text>
            </View>
            <View style={styles.percentageOff}>
              <Text style={styles.tenPercentage}>10% off</Text>
            </View>
          </View>
          <View
            style={[
              external.fd_row,
              external.js_space,
              external.ai_center,
              external.mt_10,
              {flexDirection: viewRTLStyle},
            ]}>
            <View style={[external.ai_center]}>
              <IconBackground
                backgroundColor={appColors.bgLayer}
                value={<Battery />}
              />

              <Text
                style={[
                  commonStyles.subtitleText,
                  {fontSize: fontSizes.FONT14},
                ]}>
                Strong Connection
              </Text>
            </View>
            <View style={[external.ai_center]}>
              <IconBackground
                backgroundColor={appColors.bgLayer}
                value={<Wifi />}
              />
              <Text
                style={[
                  commonStyles.subtitleText,
                  {fontSize: fontSizes.FONT14},
                ]}>
                Bluetooth Connect
              </Text>
            </View>
            <View style={[external.ai_center]}>
              <IconBackground
                backgroundColor={appColors.bgLayer}
                value={<Ble />}
              />
              <Text
                style={[
                  commonStyles.subtitleText,
                  {fontSize: fontSizes.FONT14},
                ]}>
                Super Battery
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default DetailContainer;
