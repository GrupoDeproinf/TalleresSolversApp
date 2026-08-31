import {View} from 'react-native';
import React from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {Heart} from '../../utils/icon';
import {offers} from '../../constant';
import appColors from '../../themes/appColors';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import {Search} from '../../assets/icons/search';
import TimerContainer from '../../components/offerContainer/timerContainer';
import TopDealOffer from '../../components/offerContainer/topDealOffer';
import WatchBand from '../../components/offerContainer/banner';
import TrendingOffer from '../../components/offerContainer/trendingOffer';
import {useValues} from '../../../App';

const OfferScreen = () => {
  const {bgFullStyle, iconColorStyle, t} = useValues();

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.ph_20]}>
        <HeaderContainer
          value={t('transData.offers')}
          show={true}
          icon={<Heart />}
          // iconTwo={<Search color={iconColorStyle} />}
        />
        <TimerContainer />
        <TrendingOffer />
      </View>
      <TopDealOffer />
      <WatchBand />
    </View>
  );
};

export default OfferScreen;
