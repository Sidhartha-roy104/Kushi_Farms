export default function Logo({ variant = 'dark', width = 148, height = 40 }) {
  const isLight = variant === 'light';
  const dropletStroke = isLight ? '#FFFFFF' : '#1256A8';
  const kushiFill = isLight ? '#FFFFFF' : '#0D458A';
  const dairyFill = isLight ? '#CFE4FB' : '#1256A8';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 185 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23 3C23 3 38 18.5 38 28.5C38 36.8 31.3 43.5 23 43.5C14.7 43.5 8 36.8 8 28.5C8 18.5 23 3 23 3Z"
        fill="#E5F2FF"
        stroke={dropletStroke}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="19.5" r="3.3" fill="#F7D138" />
      <path
        d="M11 31.5C14.8 28.5 20.2 28.5 24 31C27.8 33.4 31.8 32.5 35 30C34 36.8 29 41 23 41C17.2 41 12.2 37.2 11 31.5Z"
        fill="#64B232"
      />
      <text
        x="48"
        y="29"
        fill={kushiFill}
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="800"
        fontSize="24.5"
        letterSpacing="-0.03em"
      >
        Kushi
      </text>
      <text
        x="49"
        y="42"
        fill={dairyFill}
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="700"
        fontSize="10.2"
        letterSpacing="0.24em"
      >
        DAIRY
      </text>
      <path
        d="M117 10C117 6 121 3 125.5 3.4C125.2 7.8 121.8 11.2 117 10Z"
        fill="#64B232"
      />
    </svg>
  );
}
