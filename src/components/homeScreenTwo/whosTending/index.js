import {Image, Text, View} from 'react-native';
import React from 'react';
import {tredndingTwoData} from '../../../data/homeScreenTwo/tredndingTwoData';
import SolidLine from '../../../commonComponents/solidLine';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {seeAll, whatsTrending} from '../../../constant';
import {useValues} from '../../../../App';
import styles from './styles.css';
import LinearGradient from 'react-native-linear-gradient';
const WhosTrending = () => {
  const {textColorStyle, linearColorStyle, linearColorStyleTwo, t} =
    useValues();

  return (
    <View style={[external.mh_20, external.mt_10]}>
      <H3HeadingCategory value={whatsTrending} seeall={seeAll} />
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={linearColorStyleTwo}
        style={[styles.container]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={styles.menuItemContent}>
          {tredndingTwoData.map((item, index) => (
            <View>
              <View style={[external.fd_row, external.ai_center]}>
                <Image style={styles.img} source={item.img} />
                <View>
                  <View style={[external.fd_row, external.ai_center]}>
                    <Text style={[styles.titleText, {color: textColorStyle}]}>
                      {t(item.title)}
                    </Text>
                    <Text style={styles.price}>${item.price}</Text>
                  </View>
                  <View style={[external.fd_row, external.ai_center]}>
                    <Text style={styles.subtitle}>{t(item.subtitle)}</Text>
                    <Text
                      style={[commonStyles.H1Banner, {color: textColorStyle}]}>
                      ${item.fullPrice}
                    </Text>
                  </View>
                </View>
              </View>
              {index === tredndingTwoData.length && -1(<SolidLine />)}
            </View>
          ))}
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

export default WhosTrending;
