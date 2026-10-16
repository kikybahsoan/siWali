import React, { useMemo } from 'react';
import { Student, AttendanceRecord, SchoolProfile, AttendanceSession } from '../types';
import { PrayerStamp } from './PrayerStamp';
import { Check, Calendar, Clock, User, Award, Info, Sparkles } from 'lucide-react';

interface StudentPrayerCardProps {
  student: Student;
  profile: SchoolProfile;
  attendances: AttendanceRecord[];
  semester?: 'ganjil' | 'genap';
  year?: number;
  onCellClick?: (date: string, session: AttendanceSession, isPresent: boolean) => void;
  isInteractive?: boolean;
}

interface MonthConfig {
  monthIndex: number; // 0-11
  name: string;
}

const SEMESTER_GANJIL: MonthConfig[] = [
  { monthIndex: 6, name: 'JULI' },
  { monthIndex: 7, name: 'AGUSTUS' },
  { monthIndex: 8, name: 'SEPTEMBER' },
  { monthIndex: 9, name: 'OKTOBER' },
  { monthIndex: 10, name: 'NOVEMBER' },
  { monthIndex: 11, name: 'DESEMBER' },
];

const SEMESTER_GENAP: MonthConfig[] = [
  { monthIndex: 0, name: 'JANUARI' },
  { monthIndex: 1, name: 'FEBRUARI' },
  { monthIndex: 2, name: 'MARET' },
  { monthIndex: 3, name: 'APRIL' },
  { monthIndex: 4, name: 'MEI' },
  { monthIndex: 5, name: 'JUNI' },
];

// Helper to determine sessions for a given date
export function getPrayerSessionsForDay(dayOfWeek: number): {
  session1: AttendanceSession;
  session2: AttendanceSession;
  label1: string;
  label2: string;
} {
  // 5 is Friday
  if (dayOfWeek === 5) {
    return {
      session1: 'Sholat Dhuha',
      session2: 'Sholat Jumat',
      label1: 'Dhuha',
      label2: 'Jumat',
    };
  }
  // Monday-Thursday (1-4) or weekend fallback
  return {
    session1: 'Sholat Dhuhur',
    session2: 'Sholat Ashar',
    label1: 'Dhuhur',
    label2: 'Ashar',
  };
}

export const StudentPrayerCard: React.FC<StudentPrayerCardProps> = ({
  student,
  profile,
  attendances,
  semester = 'ganjil',
  year = 2026,
  onCellClick,
  isInteractive = true,
}) => {
  const months = semester === 'ganjil' ? SEMESTER_GANJIL : SEMESTER_GENAP;

  // Build indexed map of attendances for this student: "YYYY-MM-DD|session" -> AttendanceRecord
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendances.forEach((a) => {
      if (a.studentId === student.id && (a.status === 'Hadir' || a.status === 'Terlambat')) {
        const key = `${a.date}|${a.session}`;
        map.set(key, a);
      }
    });
    return map;
  }, [attendances, student.id]);

  // Compute school days for each month in the semester
  const monthDaysData = useMemo(() => {
    return months.map((m) => {
      const daysInMonth = new Date(year, m.monthIndex + 1, 0).getDate();
      const schoolDays: Array<{
        dateNumber: number;
        dateStr: string;
        dayOfWeek: number;
        sessions: ReturnType<typeof getPrayerSessionsForDay>;
        record1?: AttendanceRecord;
        record2?: AttendanceRecord;
      }> = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, m.monthIndex, day);
        const dow = d.getDay();
        // School days are Monday (1) to Friday (5)
        if (dow >= 1 && dow <= 5) {
          const dateStr = `${year}-${String(m.monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const sessions = getPrayerSessionsForDay(dow);
          const record1 = attendanceMap.get(`${dateStr}|${sessions.session1}`);
          const record2 = attendanceMap.get(`${dateStr}|${sessions.session2}`);

          schoolDays.push({
            dateNumber: day,
            dateStr,
            dayOfWeek: dow,
            sessions,
            record1,
            record2,
          });
        }
      }

      return {
        ...m,
        schoolDays,
      };
    });
  }, [months, year, attendanceMap]);

  // Stats calculation
  const stats = useMemo(() => {
    let totalTarget = 0;
    let totalStamped = 0;
    let dhuhurCount = 0;
    let asharCount = 0;
    let dhuhaCount = 0;
    let jumatCount = 0;

    monthDaysData.forEach((m) => {
      m.schoolDays.forEach((sd) => {
        totalTarget += 2;
        if (sd.record1) {
          totalStamped++;
          if (sd.sessions.session1 === 'Sholat Dhuhur') dhuhurCount++;
          if (sd.sessions.session1 === 'Sholat Dhuha') dhuhaCount++;
        }
        if (sd.record2) {
          totalStamped++;
          if (sd.sessions.session2 === 'Sholat Ashar') asharCount++;
          if (sd.sessions.session2 === 'Sholat Jumat') jumatCount++;
        }
      });
    });

    const percent = totalTarget > 0 ? Math.round((totalStamped / totalTarget) * 100) : 0;
    return { totalTarget, totalStamped, dhuhurCount, asharCount, dhuhaCount, jumatCount, percent };
  }, [monthDaysData]);

  return (
    <div className="bg-[#fcf7ed] print:bg-white text-slate-900 border-2 border-amber-900/40 rounded-xl p-4 sm:p-6 shadow-md font-sans select-none overflow-x-auto print:p-2 print:shadow-none print:border-slate-800">
      {/* Official Header matching Doc Oct 16 2026.pdf */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b-2 border-amber-900/30 gap-4">
        {/* Left: School Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-100/80 border border-amber-800/40 flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7 text-amber-900"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7V17C2 20.5 6.5 22 12 22C17.5 22 22 20.5 22 17V7L12 2ZM12 4.4L18.8 7.8L12 11.2L5.2 7.8L12 4.4ZM12 13.5L18 10.5V16.5C18 18.5 15 19.8 12 20C9 19.8 6 18.5 6 16.5V10.5L12 13.5Z" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider text-amber-900 uppercase">
              SMK Pusat Keunggulan
            </div>
            <div className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
              {profile.name || 'SMK Negeri 2 Gorontalo'}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              Kartu Kontrol & Pembiasaan Ibadah Shalat Berjamaah Murid
            </div>
          </div>
        </div>

        {/* Center/Title */}
        <div className="text-center sm:text-right">
          <h2 className="text-xl sm:text-2xl font-black tracking-wider text-amber-950 uppercase border-b-2 border-amber-900/60 inline-block pb-0.5">
            KARTU SHALAT
          </h2>
          <div className="text-xs font-semibold text-amber-900/80 mt-1">
            Semester {semester === 'ganjil' ? 'Ganjil' : 'Genap'} • Tahun Ajaran {profile.schoolYear || '2026/2027'}
          </div>
        </div>
      </div>

      {/* Student Identity Metadata Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-amber-50/80 p-3 rounded-lg border border-amber-800/20 text-xs mb-4">
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Nama Murid:</span>
          <span className="font-extrabold text-slate-900 text-sm truncate block">
            {student.name}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Kelas / Rombel:</span>
          <span className="font-bold text-slate-800">
            {student.rombel}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">NISN / No. Urut:</span>
          <span className="font-bold text-slate-800 font-mono">
            {student.nisn} (No. {student.no})
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Total Terstempel:</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">
              {stats.totalStamped} / {stats.totalTarget} Sholat
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              ({stats.percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Schedule Info */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-amber-950 mb-3 px-1 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
            <span className="font-semibold">Senin - Kamis:</span>
            <span className="text-slate-700">Baris Atas = <b>Dhuhur</b>, Baris Bawah = <b>Ashar</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>
            <span className="font-semibold">Jumat:</span>
            <span className="text-slate-700">Baris Atas = <b>Dhuha</b>, Baris Bawah = <b>Jumat</b></span>
          </div>
        </div>
        <div className="text-slate-600 italic text-[10px]">
          * Kolom ber-stempel merah menandakan presensi sholat sah tercatat lewat scan barcode/kartu
        </div>
      </div>

      {/* Main Table Grid matching Doc Oct 16 2026.pdf */}
      <div className="overflow-x-auto border-2 border-amber-950/40 rounded-lg bg-white shadow-inner">
        <div className="min-w-[950px]">
          {monthDaysData.map((month) => (
            <div key={month.name} className="border-b-2 border-amber-950/40 last:border-b-0">
              {/* Month Header Banner */}
              <div className="bg-amber-100/90 text-amber-950 font-black text-xs uppercase px-3 py-1.5 border-b border-amber-900/30 flex items-center justify-between tracking-wider">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-900" />
                  BULAN: {month.name}
                </span>
                <span className="text-[10px] font-bold text-amber-900/80">
                  {month.schoolDays.length} Hari Efektif Sekolah
                </span>
              </div>

              {/* Grid: Columns for Dates */}
              <div className="flex divide-x divide-amber-900/30 overflow-x-auto">
                {month.schoolDays.map((day) => {
                  const isFriday = day.dayOfWeek === 5;
                  return (
                    <div
                      key={day.dateStr}
                      className="flex-1 min-w-[36px] max-w-[48px] flex flex-col text-center"
                    >
                      {/* Date Header Cell */}
                      <div
                        className={`text-[10px] font-bold py-1 border-b border-amber-900/30 ${
                          isFriday
                            ? 'bg-emerald-50 text-emerald-900 font-extrabold'
                            : 'bg-amber-50/50 text-slate-800'
                        }`}
                        title={`${day.dateStr} (${isFriday ? 'Jumat' : 'Senin-Kamis'})`}
                      >
                        {day.dateNumber}
                      </div>

                      {/* Row 1: Sesi 1 (Dhuhur / Dhuha) */}
                      <div
                        onClick={() =>
                          isInteractive &&
                          onCellClick?.(
                            day.dateStr,
                            day.sessions.session1,
                            !!day.record1
                          )
                        }
                        className={`h-11 flex flex-col items-center justify-center border-b border-amber-900/20 relative group transition-colors ${
                          day.record1
                            ? 'bg-red-50/40 hover:bg-red-50'
                            : 'hover:bg-amber-100/50 cursor-pointer'
                        }`}
                        title={`${day.dateStr} [${day.sessions.session1}]: ${
                          day.record1 ? 'Sudah Tercatat / Dicap' : 'Klik untuk ubah presensi'
                        }`}
                      >
                        {day.record1 ? (
                          <PrayerStamp size="xs" rotation={-1} />
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-400 group-hover:text-amber-800">
                            {day.dateNumber}
                          </span>
                        )}
                      </div>

                      {/* Row 2: Sesi 2 (Ashar / Jumat) */}
                      <div
                        onClick={() =>
                          isInteractive &&
                          onCellClick?.(
                            day.dateStr,
                            day.sessions.session2,
                            !!day.record2
                          )
                        }
                        className={`h-11 flex flex-col items-center justify-center relative group transition-colors ${
                          day.record2
                            ? 'bg-red-50/40 hover:bg-red-50'
                            : 'hover:bg-amber-100/50 cursor-pointer'
                        }`}
                        title={`${day.dateStr} [${day.sessions.session2}]: ${
                          day.record2 ? 'Sudah Tercatat / Dicap' : 'Klik untuk ubah presensi'
                        }`}
                      >
                        {day.record2 ? (
                          <PrayerStamp size="xs" rotation={1} />
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-400 group-hover:text-amber-800">
                            {day.dateNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Signatures matching School Format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-6 pt-4 border-t border-amber-900/30 gap-6 text-xs text-slate-800">
        <div className="text-center sm:text-left">
          <p className="text-[11px] text-slate-500">Mengetahui,</p>
          <p className="font-bold text-slate-900 mt-0.5">Pembina Rohis / Guru PAI</p>
          <div className="h-14 flex items-end justify-center sm:justify-start">
            <div className="border-b border-dashed border-slate-700 w-44"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">NIP. ........................................</p>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-[11px] text-slate-500">
            Gorontalo, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="font-bold text-slate-900 mt-0.5">Wali Kelas {student.rombel}</p>
          <div className="h-14 flex items-end justify-center sm:justify-end">
            <div className="border-b border-dashed border-slate-700 w-44 text-center font-bold text-xs text-slate-900 pb-0.5">
              {profile.homeroomTeacherName || 'Guru Wali Kelas'}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            NIP. {profile.homeroomTeacherNip || '19850315 201001 1 012'}
          </p>
        </div>
      </div>
    </div>
  );
};
