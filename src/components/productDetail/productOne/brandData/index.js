import {Text, View, StyleSheet} from 'react-native';
import React from 'react';
import {useValues} from '../../../../../App';
import { t } from 'i18next';

const BrandData = ({DataService}) => {
  const {viewRTLStyle} = useValues();
  const categoriaValue = DataService?.categoria ? DataService?.categoria : DataService?.nombre_categoria;
  const subcategoriaValue = Array.isArray(DataService?.subcategoria)
    ? DataService?.subcategoria[0]?.nombre_subcategoria
    : t(DataService?.subcategoria);
  const normalize = value => String(value || '').trim().toLowerCase();
  const isEquivalent = (a, b) => normalize(a) == normalize(b);

  const chips = [];
  if (typeof categoriaValue === 'string' && categoriaValue.trim() !== '') {
    chips.push(categoriaValue);
  }
  if (
    typeof subcategoriaValue === 'string' &&
    subcategoriaValue.trim() !== '' &&
    !isEquivalent(subcategoriaValue, categoriaValue)
  ) {
    chips.push(subcategoriaValue);
  }

  if (chips.length === 0) return null;
  return (
    <View style={styles.tagsWrap}>
      <View style={[styles.tagsRow, {flexDirection: viewRTLStyle}]}>
        {chips.map((chipValue, idx) => (
          <View key={`${chipValue}-${idx}`} style={styles.tagChip}>
            <Text style={styles.tagChipText} numberOfLines={1}>
              {chipValue}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tagsWrap: {
    marginTop: 10,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#EEF2F7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#DEE5EE',
    maxWidth: '100%',
  },
  tagChipText: {
    color: '#1F2344',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default BrandData;
