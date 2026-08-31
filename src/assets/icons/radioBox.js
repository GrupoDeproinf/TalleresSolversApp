import Svg, {Circle, Path} from 'react-native-svg';
import React from 'react';

export function RadioBox(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      fill="none"
      {...props}>
      <Circle cx={11} cy={11} r={10.5} fill="#fff" stroke="#9BA6B8" />
    </Svg>
  );
}
