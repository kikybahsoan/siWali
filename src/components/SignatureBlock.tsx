import React from 'react';
import { SchoolProfile } from '../types';
import { formatIndonesianDate } from '../utils/formatters';

interface SignatureBlockProps {
  profile?: SchoolProfile;
  date?: string;
  signLocation?: string;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  profile,
  date,
  signLocation = 'Gorontalo',
}) => {
  const currentDateFormatted = date
    ? formatIndonesianDate(date)
    : formatIndonesianDate(new Date().toISOString().split('T')[0]);

  const principalName = profile?.principalName || 'Drs. Jakub A GuE';
  const principalNip = profile?.principalNip || '196706081994121002';
  const teacherName = profile?.homeroomTeacherName || 'Abdul Rahman Bahsoan';
  const teacherNip = profile?.homeroomTeacherNip || '19840715 201001 1 014';

  return (
    <div className="mt-8 pt-4 text-xs sm:text-sm text-slate-900 print-avoid-break">
      <div className="flex justify-end mb-4">
        <p className="font-medium text-right">
          {signLocation}, {currentDateFormatted}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 text-center">
        {/* Kolom Kiri: Kepala Sekolah */}
        <div className="flex flex-col items-center justify-between min-h-[120px]">
          <div>
            <p className="font-semibold text-slate-900">Mengetahui,</p>
            <p className="font-medium text-slate-800">Kepala SMK Negeri 2 Gorontalo</p>
          </div>

          <div className="mt-14 w-full">
            <p className="font-bold underline text-slate-900 uppercase tracking-tight">{principalName}</p>
            <p className="text-[11px] text-slate-700">NIP. {principalNip}</p>
          </div>
        </div>

        {/* Kolom Kanan: Guru Wali */}
        <div className="flex flex-col items-center justify-between min-h-[120px]">
          <div>
            <p className="font-semibold text-slate-900">Guru Wali Murid,</p>
            <p className="font-medium text-slate-800">Program Keahlian DKV</p>
          </div>

          <div className="mt-14 w-full">
            <p className="font-bold underline text-slate-900 uppercase tracking-tight">{teacherName}</p>
            <p className="text-[11px] text-slate-700">NIP. {teacherNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
