import {Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {fontSizes, windowHeight} from '../../../themes/appConstant';
import IconBackground from '../../../commonComponents/iconBackGround';
import {Notification} from '../../../utils/icon';
import {useValues} from '../../../../App';

const HeaderContainer = () => {
  const {textColorStyle, viewRTLStyle, t} = useValues();

  return (
    <View>
      <View
        style={[
          external.fd_row,
          external.ai_center,
          {flexDirection: viewRTLStyle},
        ]}>
        <Text
          style={[
            commonStyles.titleText19,
            external.ti_center,
            external.fg_1,
            {
              color: textColorStyle,
              fontSize: fontSizes.FONT21,
              marginLeft: windowHeight(30),
            },
          ]}>
          {t('transData.categories')}
        </Text>
        <IconBackground value={<Notification />} />
      </View>
    </View>
  );
};

export default HeaderContainer;
