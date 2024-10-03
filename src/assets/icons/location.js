import Svg, {Path} from 'react-native-svg';
import React from 'react';
import {useValues} from '../../../App';

export function Location(props) {
  const {iconColorStyle} = useValues();
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={23}
      fill="none"
      {...props}>
      <Path
        stroke={iconColorStyle}
        strokeWidth={1.2}
        d="M12 13.43a3.12 3.12 0 1 0 0-6.24 3.12 3.12 0 0 0 0 6.24Z"
      />
      <Path
        stroke={iconColorStyle}
        strokeWidth={1.2}
        d="M3.62 8.49c1.97-8.66 14.8-8.65 16.76.01 1.15 5.08-2.01 9.38-4.78 12.04a5.193 5.193 0 0 1-7.21 0c-2.76-2.66-5.92-6.97-4.77-12.05Z"
      />
    </Svg>
  );
}
