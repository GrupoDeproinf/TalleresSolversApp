import {Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {fontSizes, windowHeight} from '../../../themes/appConstant';
import IconBackground from '../../../commonComponents/iconBackGround';
import {BackLeft, Notification} from '../../../utils/icon';
import {useValues} from '../../../../App';
import { imageRTLStyle } from '../../../style/rtlStyle';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const HeaderContainer = () => {
  const {textColorStyle, viewRTLStyle, t} = useValues();

  const navigation = useNavigation();

  return (
    <View>
      <View
        style={[
          external.fd_row,
          external.ai_center,
          {flexDirection: viewRTLStyle, alignItems: 'center'},
        ]}>
        {/* <TouchableOpacity
          onPress={() => navigation.goBack('')}
          style={{position: 'absolute'}} // Posiciona el botón de retroceso en la esquina izquierda
        >
          <View>
            <BackLeft style={[{marginTop: -4, paddingTop: 0}]}/>
          </View>
        </TouchableOpacity> */}
        <Text
          style={[
            commonStyles.titleText19,
            external.ti_center,
            external.fg_1,
            {
              color: textColorStyle,
              fontSize: fontSizes.FONT21,
              marginTop: windowHeight(15),
            },
          ]}>
          {'Categorias'}
        </Text>
        {/* <IconBackground value={<Notification />} /> */}
      </View>
    </View>
  );
};

export default HeaderContainer;
