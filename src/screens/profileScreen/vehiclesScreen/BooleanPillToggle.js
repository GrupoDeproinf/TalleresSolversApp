import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  pillToggleTrack: {
    width: 56,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  pillToggleTrackOff: {
    backgroundColor: '#D6DCE8',
  },
  pillToggleThumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  pillToggleThumbRowAlignOff: {
    justifyContent: 'flex-start',
  },
  pillToggleThumbRowAlignOn: {
    justifyContent: 'flex-end',
  },
  pillToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  pillToggleDisabled: {
    opacity: 0.42,
  },
});

const TRACK_ON = '#1F2344';

/**
 * Toggle tipo píldora (misma UX que en VehicleAddStepper).
 */
const BooleanPillToggle = ({value, onValueChange, disabled = false}) => (
  <Pressable
    disabled={disabled}
    onPress={() => onValueChange(!value)}
    style={({pressed}) => [
      styles.pillToggleTrack,
      value ? {backgroundColor: TRACK_ON} : styles.pillToggleTrackOff,
      disabled && styles.pillToggleDisabled,
      pressed && !disabled && {opacity: 0.7},
    ]}
    accessibilityRole="switch"
    accessibilityState={{checked: value, disabled: !!disabled}}>
    <View
      style={[
        styles.pillToggleThumbRow,
        value
          ? styles.pillToggleThumbRowAlignOn
          : styles.pillToggleThumbRowAlignOff,
      ]}>
      <View style={styles.pillToggleThumb} />
    </View>
  </Pressable>
);

export default BooleanPillToggle;
