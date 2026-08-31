import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {useValues} from '../../../App';
export function ThreeDot({props}) {
  const {iconColorStyle} = useValues();
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...props}>
      <Path
        fill={iconColorStyle}
        d="M12 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM10.5 18a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z"
      />
    </Svg>
  );
}
