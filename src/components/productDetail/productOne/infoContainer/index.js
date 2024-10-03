import {Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../../style/external.css';
import {commonStyles} from '../../../../style/commonStyle.css';
import appColors from '../../../../themes/appColors';
import {zebronicText} from '../../../../constant';
import {fontSizes} from '../../../../themes/appConstant';
import {useValues} from '../../../../../App';

const InfoContainer = () => {
  const {textColorStyle, t} = useValues();

  return (
    <View>
      <View style={[external.mt_15]}>
        <Text
          style={[
            commonStyles.titleText19,
            {fontSize: fontSizes.FONT17},
            {color: textColorStyle},
          ]}>
          Details :
        </Text>
        <Text
          style={[
            commonStyles.subtitleText,
            external.pt_5,
            {color: textColorStyle},
          ]}>
          {t('transData.zebronicText')}
        </Text>
      </View>
    </View>
  );
};

export default InfoContainer;
