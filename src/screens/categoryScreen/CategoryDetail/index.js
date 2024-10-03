import {ScrollView, View} from 'react-native';
import React from 'react';
import FullHeader from '../../../commonComponents/fullHeader';
import {external} from '../../../style/external.css';
import {Notification} from '../../../utils/icon';
import SearchContainer from '../../../components/homeScreen/searchContainer';
import NewArrivalBigContainer from '../../../components/homeScreenTwo/newArrivalTwoContainer';
import {categoryDetailData} from '../../../data/homeScreenTwo/newArrivalData';
import SortContainer from '../../../components/categoryContainer/sortContainer';
import {commonStyles} from '../../../style/commonStyle.css';
import {windowWidth} from '../../../themes/appConstant';
import {useValues} from '../../../../App';

const CategoryDetail = ({navigation}) => {
  const {linearColorStyle, isDark, bgFullStyle} = useValues();

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.mh_20]}>
        <FullHeader
          value={<Notification />}
          title={'Mobile & Accessories'}
          onpressBack={() => navigation.goBack('')}
          modelPress={() => navigation.navigate('NotificationScreen')}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[external.Pb_30]}>
        <SearchContainer />
        <SortContainer />
        <NewArrivalBigContainer
          data={categoryDetailData}
          horizontal={false}
          numColumns={2}
          width={windowWidth(210)}
        />
      </ScrollView>
    </View>
  );
};

export default CategoryDetail;
