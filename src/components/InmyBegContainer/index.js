import {View} from 'react-native';
import React from 'react';
import H3HeadingCategory from '../../commonComponents/headingCategory/H3HeadingCategory';
import {inmyBag, removeAll} from '../../constant';
import {newArrivalBigData} from '../../data/homeScreenTwo/newArrivalData';
import NewArrivalContainer from '../homeScreen/newArrivalContainer';
import {external} from '../../style/external.css';
import {windowHeight} from '../../themes/appConstant';

const InmyBegContainer = () => {
  return (
    <View>
      <View style={[external.mh_20]}>
        <H3HeadingCategory value={inmyBag} seeall={removeAll} />
      </View>
      <NewArrivalContainer
        data={newArrivalBigData}
        marginTop={windowHeight(1)}
      />
    </View>
  );
};

export default InmyBegContainer;
