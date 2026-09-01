import React from 'react';
import { SchoolProfile } from '../types';

interface OfficialHeaderProps {
  profile?: SchoolProfile;
  subTitle?: string;
  documentTitle?: string;
}

export const OfficialHeader: React.FC<OfficialHeaderProps> = ({
  profile,
  documentTitle,
}) => {
  const schoolName = profile?.name || 'SMK NEGERI 2 GORONTALO';
  const address = profile?.address || 'Jl. Achmad Nadjamuddin, Kel. Limba U Dua, Kec. Kota Selatan';
  const email = profile?.email || 'smkngorontalo.@gmail.com';
  const phone = profile?.phone || '(0435) 822354';
  const postalCode = profile?.postalCode || '96115';

  return (
    <div className="w-full text-slate-900 pb-2">
      {/* Kop Surat 2-column layout */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b-4 border-black">
        {/* Logo Kiri: Lambang Pemprov Gorontalo / Pendidikan */}
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-18 h-18 text-blue-900 drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Shield */}
            <path
              d="M50 5 L88 20 V52 C88 74 50 95 50 95 C50 95 12 74 12 52 V20 L50 5 Z"
              fill="#1e3a8a"
              stroke="#ca8a04"
              strokeWidth="3"
            />
            {/* Inner Gold Shield */}
            <path
              d="M50 12 L80 24 V50 C80 68 50 85 50 85 C50 85 20 68 20 50 V24 L50 12 Z"
              fill="#ffffff"
            />
            {/* Stars / Crown / Symbol */}
            <circle cx="50" cy="32" r="8" fill="#eab308" />
            <path
              d="M32 68 C32 45 68 45 68 68 C58 72 42 72 32 68 Z"
              fill="#1e3a8a"
            />
            {/* Rice and Cotton subtle arc */}
            <path
              d="M26 35 C22 48 26 62 34 70"
              stroke="#eab308"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M74 35 C78 48 74 62 66 70"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="#ca8a04"
              fontSize="9"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              SMK
            </text>
          </svg>
        </div>

        {/* Text Kop Surat */}
        <div className="flex-1 text-center font-serif leading-tight">
          <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-800">
            Pemerintah Provinsi Gorontalo
          </p>
          <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-800">
            Dinas Pendidikan dan Kebudayaan
          </p>
          <h1 className="text-base sm:text-xl font-bold tracking-tight uppercase text-black font-sans my-0.5">
            {schoolName}
          </h1>
          <p className="text-[10px] sm:text-xs font-sans text-slate-700">
            {address} • Telp: {phone} • Kode Pos: {postalCode}
          </p>
          <p className="text-[10px] sm:text-xs font-sans font-medium text-slate-700">
            Email: <span className="underline">{email}</span>
          </p>
          <p className="text-[10px] sm:text-xs font-sans font-bold tracking-wider text-black mt-0.5">
            KOTA GORONTALO PROVINSI GORONTALO
          </p>
        </div>

        {/* Logo Kanan: Tut Wuri Handayani / Logo Kejuruan DKV */}
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-18 h-18 drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Blue Circle */}
            <circle cx="50" cy="50" r="44" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
            {/* White Wing Motifs */}
            <path
              d="M50 20 L60 38 L80 42 L65 56 L69 76 L50 66 L31 76 L35 56 L20 42 L40 38 Z"
              fill="#fbbf24"
            />
            {/* Center Flame / Book */}
            <path
              d="M50 32 C55 42 62 48 50 62 C38 48 45 42 50 32 Z"
              fill="#dc2626"
            />
            {/* Book Base */}
            <path
              d="M36 68 Q50 63 64 68 L64 74 Q50 69 36 74 Z"
              fill="#ffffff"
            />
            <text
              x="50"
              y="87"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="7"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              DKV BISA
            </text>
          </svg>
        </div>
      </div>

      {/* Thin line under the thick line */}
      <div className="w-full border-b border-black mt-0.5 mb-3" />

      {/* Document Title if provided */}
      {documentTitle && (
        <div className="text-center my-3">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide underline underline-offset-4 text-black">
            {documentTitle}
          </h2>
        </div>
      )}
    </div>
  );
};
