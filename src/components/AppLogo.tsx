import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subTextColor?: string;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  textColor = 'text-white',
  subTextColor = 'text-blue-200',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official High-Resolution Vector Logo */}
      <div className={`${currentSize} shrink-0 relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield with Gold Border */}
          <path
            d="M50 5 L88 20 V52 C88 74 50 95 50 95 C50 95 12 74 12 52 V20 L50 5 Z"
            fill="#1E3A8A"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Layer */}
          <path
            d="M50 12 L81 24 V50 C81 67 50 86 50 86 C50 86 19 67 19 50 V24 L50 12 Z"
            fill="#0F172A"
            opacity="0.25"
          />

          {/* White Shield Canvas */}
          <path
            d="M50 15 L78 26 V49 C78 65 50 83 50 83 C50 83 22 65 22 49 V26 L50 15 Z"
            fill="#FFFFFF"
          />

          {/* Top Gold Star / Crown */}
          <circle cx="50" cy="27" r="5" fill="#F59E0B" />
          <path
            d="M50 20 L52 25 L57 26 L53 29 L54 34 L50 31 L46 34 L47 29 L43 26 L48 25 Z"
            fill="#D97706"
          />

          {/* SMK Vokasi Cog / Gear & Flame */}
          <circle cx="50" cy="50" r="15" fill="#1E3A8A" />
          <circle cx="50" cy="50" r="9" fill="#FFFFFF" />

          {/* DKV Pen / Torch Symbol */}
          <path
            d="M48 42 L52 42 L53 52 L50 56 L47 52 Z"
            fill="#DC2626"
          />
          <circle cx="50" cy="40" r="2.5" fill="#F59E0B" />

          {/* Rice & Cotton Wreath (Kemakmuran & Pendidikan) */}
          <path
            d="M26 38 C23 48 26 62 36 70"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M74 38 C77 48 74 62 64 70"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Banner Ribbons with SMKN 2 */}
          <path
            d="M30 71 Q50 67 70 71 L67 77 Q50 73 33 77 Z"
            fill="#1E3A8A"
          />
          <text
            x="50"
            y="75.5"
            textAnchor="middle"
            fill="#F59E0B"
            fontSize="5.5"
            fontWeight="bold"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            letterSpacing="0.5"
          >
            SMKN 2 GORONTALO
          </text>
        </svg>
      </div>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-base sm:text-lg ${textColor}`}>
              siWali
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              DKV
            </span>
          </div>
          <p className={`text-[10px] sm:text-[11px] font-medium tracking-wide uppercase truncate ${subTextColor}`}>
            SMK Negeri 2 Gorontalo
          </p>
        </div>
      )}
    </div>
  );
};
