import React from 'react';

interface PrayerStampProps {
  date?: string;
  time?: string;
  verifier?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rotation?: number; // e.g. -2, 1, 0 degrees
  className?: string;
}

export const PrayerStamp: React.FC<PrayerStampProps> = ({
  date,
  time,
  verifier = 'ROHIS',
  size = 'sm',
  rotation = 0,
  className = '',
}) => {
  // Size styles
  const sizeConfig = {
    xs: {
      box: 'w-10 h-7 border-[1.5px] p-0.5 rounded-[3px]',
      innerBox: 'border-[0.5px] p-0.5 rounded-[2px]',
      header: 'text-[5px] font-black tracking-widest',
      iconSize: 'w-2.5 h-2.5',
      subText: 'text-[4.5px] font-bold tracking-tight',
      dateText: 'text-[4px]',
    },
    sm: {
      box: 'w-14 h-9 border-[1.5px] p-0.5 rounded-[3px]',
      innerBox: 'border-[0.5px] p-0.5 rounded-[2px]',
      header: 'text-[6.5px] font-black tracking-widest',
      iconSize: 'w-3.5 h-3.5',
      subText: 'text-[5.5px] font-bold tracking-tight',
      dateText: 'text-[5px]',
    },
    md: {
      box: 'w-24 h-16 border-2 p-1 rounded-md shadow-sm',
      innerBox: 'border p-1 rounded-[3px]',
      header: 'text-[10px] font-black tracking-widest',
      iconSize: 'w-6 h-6',
      subText: 'text-[8px] font-bold',
      dateText: 'text-[7px]',
    },
    lg: {
      box: 'w-36 h-24 border-[3px] p-1.5 rounded-lg shadow-md',
      innerBox: 'border-1.5 p-1.5 rounded-[5px]',
      header: 'text-sm font-black tracking-widest',
      iconSize: 'w-9 h-9',
      subText: 'text-[11px] font-extrabold',
      dateText: 'text-[9px]',
    },
  }[size];

  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none font-sans text-red-600 border-red-600 transition-transform ${sizeConfig.box} ${className}`}
      style={{
        borderColor: '#dc2626',
        color: '#dc2626',
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }}
      title={`Cap Pengesahan Sholat Rohis SMKN 2 Gorontalo ${date ? `(${date})` : ''}`}
    >
      <div
        className={`w-full h-full border-red-500/80 border-dashed flex flex-col items-center justify-between text-center leading-none ${sizeConfig.innerBox}`}
        style={{ borderColor: '#ef4444' }}
      >
        {/* Top Header */}
        <div className={`font-black uppercase tracking-wider text-red-700 ${sizeConfig.header}`}>
          ROHIS
        </div>

        {/* Center: Mosque Emblem */}
        <div className="flex items-center justify-center my-0.5 gap-0.5">
          <svg
            className={`${sizeConfig.iconSize} fill-current text-red-600 shrink-0`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Mosque dome with crescent */}
            <path
              d="M12 2C11.6 2 11.3 2.2 11.1 2.5C10.7 2.1 10.2 1.8 9.6 1.8C8.5 1.8 7.6 2.7 7.6 3.8C7.6 4.3 7.8 4.7 8.1 5.1C6.2 6.1 4.8 8.1 4.5 10.5H19.5C19.2 8.1 17.8 6.1 15.9 5.1C16.2 4.7 16.4 4.3 16.4 3.8C16.4 2.7 15.5 1.8 14.4 1.8C13.8 1.8 13.3 2.1 12.9 2.5C12.7 2.2 12.4 2 12 2Z"
              fill="currentColor"
            />
            <path
              d="M4 11H20V14H4V11Z"
              fill="currentColor"
            />
            <path
              d="M4 15H8V21H4V15ZM10 15H14V21H10V15ZM16 15H20V21H16V15Z"
              fill="currentColor"
            />
          </svg>
          {size !== 'xs' && (
            <span className={`${sizeConfig.subText} uppercase font-extrabold text-red-700`}>
              TERCATAT
            </span>
          )}
        </div>

        {/* Bottom Text */}
        <div className={`font-black uppercase tracking-tight text-red-700 ${sizeConfig.subText}`}>
          SMKN 2 GORONTALO
        </div>
      </div>
    </div>
  );
};
