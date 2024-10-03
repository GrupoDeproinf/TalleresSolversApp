import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import React from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import {change} from '../../constant';
import {CheckOutIcon} from '../../utils/icon';
import styles from './style.css';
import InmyBegContainer from '../../components/InmyBegContainer';
import SubtotalContainer from '../../commonComponents/subTotal';
import BottomContainer from '../../commonComponents/bottomContainer';
import {windowHeight} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import LocationContainer from '../../components/locationContainer';
import VoucherCard from '../../components/voucherCord';
import {useValues} from '../../../App';
const AddtocartOne = ({navigation}) => {
  const {bgFullStyle, t, currSymbol, currPrice, textColorStyle} = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.mh_20]}>
        <HeaderContainer value={t('transData.myBeg')} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: windowHeight(70)}}>
        <LocationContainer
          borderColor={appColors.bgLayer}
          backgroundColor={appColors.bgLayout}
          locationBg={'rgba(77, 102, 255, 0.10)'}
          borderRadius={windowHeight(6)}
          value={<Text style={styles.changeText}>{change}</Text>}
          navigation={navigation}
        />
        <InmyBegContainer />
        <VoucherCard />
        <SubtotalContainer />
      </ScrollView>
      <View style={styles.bottomContainerView}>
        <BottomContainer
          leftValue={
            <Text style={[styles.textContainer, {color: textColorStyle}]}>
              {currSymbol}
              {(currPrice * 3568.31).toFixed(2)}
              <Text style={[commonStyles.subtitleText, {letterSpacing: 0.5}]}>
                {' '}
                (2 items)
              </Text>
            </Text>
          }
          value={
            <TouchableOpacity
              onPress={() => navigation.navigate('CheckoutScreen')}
              style={[external.fd_row, external.ai_center, external.pt_4]}>
              <CheckOutIcon />
              <Text style={[styles.checkOut]}>Check Out</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );
};

export default AddtocartOne;
