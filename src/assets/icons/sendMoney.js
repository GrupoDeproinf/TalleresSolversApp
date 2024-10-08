import Svg, {Path} from 'react-native-svg';
import React from 'react';

export function SendMoney(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={25}
      height={24}
      fill="none"
      {...props}>
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M10 13.75c0 .97.75 1.75 1.67 1.75h1.88c.8 0 1.45-.68 1.45-1.53 0-.91-.4-1.24-.99-1.45L11 11.47c-.59-.21-.99-.53-.99-1.45 0-.84.65-1.53 1.45-1.53h1.88c.92 0 1.67.78 1.67 1.75M12.5 7.5v9"
      />
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M22.5 12c0 5.52-4.48 10-10 10s-10-4.48-10-10 4.48-10 10-10M22.5 6V2h-4M17.5 7l5-5"
      />
    </Svg>
  );
}
