import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';
import React from 'react';

export function Samsung({color, width}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '74'}
      height="12"
      viewBox="0 0 74 12"
      fill="none">
      <G clip-path="url(#clip0_1877_26930)">
        <Path
          d="M4.9016 7.91244C5.0032 8.16768 4.97099 8.49479 4.92143 8.69303C4.83469 9.04492 4.5968 9.40423 3.89303 9.40423C3.23387 9.40423 2.83242 9.02261 2.83242 8.4477V7.42426H0V8.23707C0 10.5912 1.85111 11.3024 3.83604 11.3024C5.74414 11.3024 7.31523 10.6532 7.56551 8.89128C7.69437 7.97935 7.60021 7.38214 7.5556 7.16159C7.10955 4.95116 3.10501 4.292 2.80516 3.05545C2.76353 2.87309 2.76015 2.68409 2.79525 2.50036C2.86959 2.16087 3.10005 1.79164 3.75922 1.79164C4.37873 1.79164 4.73805 2.17326 4.73805 2.74817V3.40237H7.37223V2.65896C7.37223 0.359318 5.308 0 3.81621 0C1.93784 0 0.403924 0.621993 0.123903 2.34424C0.0495612 2.81507 0.0371709 3.23635 0.148684 3.76665C0.607124 5.92256 4.35643 6.54703 4.9016 7.91244Z"
          fill={color || '#9BA6B8'}
        />
        <Path
          d="M11.3776 0.695837L9.41992 11.2499H12.2722L13.7169 1.67219H13.7763L15.1814 11.2499H18.0188L16.0735 0.693359L11.3776 0.695837ZM27.3239 0.695837L26.0229 8.7644H25.961L24.6625 0.695837H20.3581L20.1251 11.2499H22.7667L22.8312 1.7614H22.8906L24.6525 11.2499H27.3313L29.0957 1.76388H29.1527L29.2196 11.2499H31.8587L31.6258 0.693359L27.3239 0.695837Z"
          fill={color || '#9BA6B8'}
        />
        <Path
          d="M39.2922 8.25131C39.3938 8.50655 39.3616 8.83365 39.3121 9.0319C39.2253 9.38378 38.9874 9.7431 38.2837 9.7431C37.6245 9.7431 37.223 9.36148 37.223 8.78657V7.76313H34.3906V8.57594C34.3906 10.9301 36.2417 11.6413 38.2267 11.6413C40.1348 11.6413 41.7059 10.992 41.9561 9.23014C42.085 8.31822 41.9908 7.721 41.9462 7.50046C41.5002 5.29003 37.4956 4.63087 37.1958 3.39431C37.1542 3.21196 37.1508 3.02295 37.1859 2.83923C37.2602 2.49973 37.4907 2.1305 38.1498 2.1305C38.7694 2.1305 39.1287 2.51212 39.1287 3.08703V3.74124H41.7629V2.99782C41.7629 0.698186 39.6986 0.338867 38.2068 0.338867C36.3285 0.338867 34.7945 0.96086 34.5145 2.68311C34.4402 3.15394 34.4278 3.57521 34.5393 4.10552C34.9977 6.26143 38.7471 6.8859 39.2922 8.25131Z"
          fill={color || '#9BA6B8'}
        />
        <Path
          d="M48.1513 9.66871C48.8848 9.66871 49.1103 9.16319 49.1623 8.90547C49.1846 8.79148 49.1871 8.63784 49.1871 8.50154V0.695658H51.8585V8.26117C51.859 8.49269 51.8507 8.72414 51.8337 8.95503C51.6478 10.9251 50.0916 11.5644 48.1513 11.5644C46.2085 11.5644 44.6523 10.9251 44.4664 8.95503C44.459 8.85095 44.4391 8.45446 44.4416 8.26117V0.69318H47.113V8.49907C47.1105 8.63784 47.1154 8.79148 47.1377 8.90547C47.1873 9.16319 47.4153 9.66871 48.1513 9.66871ZM61.057 0.695658L61.2007 8.97981H61.1437L58.7152 0.695658H54.7999V11.1382H57.3944L57.2507 2.56659H57.3077L59.9121 11.1382H63.6714V0.695658H61.057ZM70.1639 9.55968C70.9271 9.55968 71.1947 9.07645 71.2418 8.79148C71.2641 8.67501 71.2666 8.52632 71.2666 8.39499V6.85859H70.1837V5.32219H73.9231V8.15214C73.9231 8.35038 73.9181 8.49411 73.8859 8.84599C73.7125 10.769 72.0447 11.4554 70.1738 11.4554C68.3028 11.4554 66.6376 10.769 66.4617 8.84599C66.4319 8.49411 66.4245 8.35038 66.4245 8.15214V3.71146C66.4245 3.52312 66.4493 3.19106 66.4691 3.0176C66.7045 1.04259 68.3028 0.408203 70.1738 0.408203C72.0447 0.408203 73.6852 1.03763 73.8785 3.01512C73.9132 3.35214 73.9033 3.70898 73.9033 3.70898V4.06334H71.2418V3.47108C71.2418 3.47108 71.2418 3.22328 71.2096 3.06964C71.16 2.8367 70.9618 2.30144 70.154 2.30144C69.3858 2.30144 69.1603 2.80944 69.1033 3.06964C69.071 3.20841 69.0587 3.39674 69.0587 3.56773V8.39251C69.0587 8.52632 69.0636 8.67501 69.0834 8.79395C69.133 9.07645 69.4006 9.55968 70.1639 9.55968Z"
          fill={color || '#9BA6B8'}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1877_26930">
          <Rect width="74" height="12" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}