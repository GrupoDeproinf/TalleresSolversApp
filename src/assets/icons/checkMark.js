import * as React from 'react';
import Svg, {Rect} from 'react-native-svg';
export function CheckMark({props}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      {...props}>
      <Rect width={20} height={20} fill="#fff" rx={4} />
      <Rect
        width={19}
        height={19}
        x={0.5}
        y={0.5}
        stroke="#2D3261"
        strokeOpacity={0.1}
        rx={3.5}
      />
    </Svg>
  );
}
