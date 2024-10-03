import * as React from 'react';
import Svg, {Defs, G, Path, Rect} from 'react-native-svg';
export function UncheckMark({props}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      {...props}>
      <Rect width={20} height={20} fill="#4D66FF" rx={4} />
      <Rect
        width={19}
        height={19}
        x={0.5}
        y={0.5}
        stroke="#4D66FF"
        strokeOpacity={0.1}
        rx={3.5}
      />
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m6.063 10.563 2.625 2.624 5.25-5.624"
      />
    </Svg>
  );
}
