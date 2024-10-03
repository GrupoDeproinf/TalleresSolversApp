import Svg, {Circle, Path} from 'react-native-svg';
import React from 'react';

export function Minus({props, color}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...props}>
      <Path
        stroke={color || '#051E47'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 10h10"
      />
    </Svg>
  );
}
