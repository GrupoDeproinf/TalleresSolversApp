import {ScrollView, Text, View} from 'react-native';
import React from 'react';
import FullHeader from '../../../commonComponents/fullHeader';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import NewArrivalContainer from '../../../components/homeScreen/newArrivalContainer';
import {newArrivalData} from '../../../data/homeScreen/newArrivalData';
import styles from './style.css';
import {useValues} from '../../../../App';

const WhishlitContainer = ({navigation}) => {
  const {bgFullStyle, t} = useValues();

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.mh_20]}>
        <FullHeader
          show={true}
          title={t('transData.myWishlistFive')}
          text={
            <Text style={styles.container}>{t('transData.removeAll')}</Text>
          }
          onpressBack={() => navigation.goBack('')}
        />
      </View>
      <NewArrivalContainer
        data={newArrivalData}
        show={false}
        showPlus={true}
        scrollable
        contentContainerStyle={[external.Pb_80]}
      />
    </View>
  );
};

export default WhishlitContainer;
