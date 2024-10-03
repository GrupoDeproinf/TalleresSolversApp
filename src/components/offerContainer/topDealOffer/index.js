import {View} from 'react-native';
import React from 'react';
import DealContainer from '../../homeScreen/dealContainer';
import {dealDataThree} from '../../../data/homeScreen/dealData';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {external} from '../../../style/external.css';
import {useValues} from '../../../../App';

const TopDealOffer = () => {
  const {t} = useValues();
  return (
    <View>
      <View style={[external.mh_20, external.mt_30]}>
        <H3HeadingCategory value={t('transData.topDeal')} />
      </View>
      <DealContainer data={dealDataThree} show={true} />
    </View>
  );
};

export default TopDealOffer;
