import Svg, {Path} from 'react-native-svg';
import React from 'react';
import {useValues} from '../../../App';

export function Key({color, width, height}) {
  const {iconColorStyle} = useValues();
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '20'}
      height={height || '20'}
      viewBox="0 0 20 20"
      fill="none">
      <Path
        d="M16.4912 12.4416C14.7746 14.1499 12.3162 14.6749 10.1579 13.9999L6.23289 17.9166C5.94955 18.2083 5.39122 18.3833 4.99122 18.3249L3.17455 18.0749C2.57455 17.9916 2.01622 17.4249 1.92455 16.8249L1.67455 15.0083C1.61622 14.6083 1.80789 14.0499 2.08289 13.7666L5.99955 9.84994C5.33289 7.68327 5.84955 5.22494 7.56622 3.5166C10.0246 1.05827 14.0162 1.05827 16.4829 3.5166C18.9496 5.97494 18.9496 9.98327 16.4912 12.4416Z"
        stroke={color || iconColorStyle}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.74121 14.5752L7.65788 16.4919"
        stroke={color || iconColorStyle}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.083 9.16699C12.7734 9.16699 13.333 8.60735 13.333 7.91699C13.333 7.22664 12.7734 6.66699 12.083 6.66699C11.3927 6.66699 10.833 7.22664 10.833 7.91699C10.833 8.60735 11.3927 9.16699 12.083 9.16699Z"
        stroke={color || iconColorStyle}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}