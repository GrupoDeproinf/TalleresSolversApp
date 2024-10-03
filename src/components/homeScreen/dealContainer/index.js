import {FlatList, ImageBackground, Text, View} from 'react-native';
import React from 'react';
import styles from './style.css';
import {external} from '../../../style/external.css';
import {useValues} from '../../../../App';
const DealContainer = ({data, show, currSymbol, currPrice}) => {
  const {t} = useValues();
  const renderItem = ({item}) => (
    <View>
      <ImageBackground
        resizeMode="contain"
        style={styles.imgStyle}
        source={item.img}>
        {show ? (
          <View>
            <Text style={styles.textTwoStyle}>
              {item.title}
              <Text style={styles.priceContainerTwo}>{item.price}</Text>
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.textStyle}>{t(item.title)}</Text>
            <Text style={styles.priceContainer}>
              {currSymbol}
              {(currPrice * item.price).toFixed(2)}
            </Text>
          </View>
        )}
      </ImageBackground>
    </View>
  );
  return (
    <View>
      <FlatList
        ItemSeparatorComponent={() => <View style={{width: 15}} />}
        horizontal={true}
        data={data}
        renderItem={renderItem}
        contentContainerStyle={[external.mh_10]}
      />
    </View>
  );
};

export default DealContainer;
