import React, { useState, useMemo } from 'react';
import { Student, SchoolProfile, AttendanceRecord, AttendanceSession } from '../types';
import { StudentPrayerCard } from '../components/StudentPrayerCard';
import { PrayerStamp } from '../components/PrayerStamp';
import { StorageService } from '../services/storage';
import { DriveImage } from '../components/DriveImage';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Search,
  Award,
  Calendar,
  Sparkles,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Check,
  X,
  Plus,
  Trash2,
} from 'lucide-react';

interface PrayerCardViewProps {
  students: Student[];
  profile: SchoolProfile;
  attendances: AttendanceRecord[];
  onAttendanceUpdated: (records: AttendanceRecord[]) => void;
  onNavigateToScanner: () => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
  initialStudentId?: string | null;
}

export const PrayerCardView: React.FC<PrayerCardViewProps> = ({
  students,
  profile,
  attendances,
  onAttendanceUpdated,
  onNavigateToScanner,
  isAdmin,
  onRequireAdmin,
  initialStudentId,
}) => {
  // Currently selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialStudentId && students.some((s) => s.id === initialStudentId)) {
      return initialStudentId;
    }
    return students.length > 0 ? students[0].id : '';
  });

  const [studentSearch, setStudentSearch] = useState<string>('');
  const [semester, setSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [isBatchPrintMode, setIsBatchPrintMode] = useState<boolean>(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);

  // Manual stamp/edit modal state
  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    session: AttendanceSession;
    isPresent: boolean;
  } | null>(null);

  // Current student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Index of current student
  const currentIndex = useMemo(() => {
    return students.findIndex((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(students[currentIndex - 1].id);
    } else {
      setSelectedStudentId(students[students.length - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (currentIndex < students.length - 1) {
      setSelectedStudentId(students[currentIndex + 1].id);
    } else {
      setSelectedStudentId(students[0].id);
    }
  };

  // Filter students for search dropdown
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        s.rombel.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  // Handle cell click on the prayer card
  const handleCellClick = (
    date: string,
    session: AttendanceSession,
    isPresent: boolean
  ) => {
    setSelectedCell({ date, session, isPresent });
  };

  // Toggle or add prayer attendance manually
  const handleToggleAttendance = () => {
    if (!selectedCell || !currentStudent) return;

    const { date, session, isPresent } = selectedCell;

    if (isPresent) {
      // Find and remove
      const existing = attendances.find(
        (a) => a.studentId === currentStudent.id && a.date === date && a.session === session
      );
      if (existing) {
        const updated = StorageService.deleteAttendance(existing.id);
        onAttendanceUpdated(updated);
      }
    } else {
      // Add record
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const [y, m, d] = date.split('-').map(Number);
      const dayDate = new Date(y, m - 1, d);
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = dayNames[dayDate.getDay()];

      const sessionSlug = session.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newRec: AttendanceRecord = {
        id: `att-${date}-${sessionSlug}-${currentStudent.id}`,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        nisn: currentStudent.nisn,
        rombel: currentStudent.rombel,
        date,
        dayName,
        time: timeStr,
        session,
        status: 'Hadir',
        method: 'Manual',
        notes: 'Dicap oleh Pembina Rohis / Wali Kelas',
        photoUrl: currentStudent.photoUrl,
        scannedAt: `${date}T${timeStr}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const { updatedList } = StorageService.recordAttendance(newRec);
      onAttendanceUpdated(updatedList);
    }

    setSelectedCell(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearAllPrayerStamps = () => {
    const updated = StorageService.clearAllPrayerAttendances();
    onAttendanceUpdated(updated);
    setIsConfirmClearOpen(false);
  };

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        Belum ada data murid untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="no-print bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-2xl p-5 shadow-lg border border-amber-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/30">
                  Format Resmi Doc Oct 16 2026.pdf
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-red-600/30 text-red-200 border border-red-500/30">
                  Cap Rohis Sah
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Kartu Shalat Digital Murid
              </h1>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Monitoring pelaksanaan Sholat Dhuhur & Ashar (Senin–Kamis) serta Sholat Dhuha & Jumat (Jumat) ber-stempel resmi.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onNavigateToScanner}
              className="px-3.5 py-2 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <QrCode className="w-4 h-4 text-amber-800" />
              Scan Barcode Sholat
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-amber-700/60 hover:bg-amber-600/70 text-white border border-amber-400/40 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Cetak Kartu Siswa
            </button>
            <button
              onClick={() => setIsBatchPrintMode(!isBatchPrintMode)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                isBatchPrintMode
                  ? 'bg-amber-300 text-amber-950 font-black'
                  : 'bg-amber-900/80 hover:bg-amber-900 text-amber-100 border border-amber-700/60'
              }`}
            >
              <Users className="w-4 h-4" />
              {isBatchPrintMode ? 'Mode Tunggal' : 'Cetak Semua (17 Murid)'}
            </button>
            <button
              onClick={() => {
                if (!isAdmin) {
                  onRequireAdmin();
                  return;
                }
                setIsConfirmClearOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-900/70 hover:bg-red-800 text-red-100 border border-red-700/60 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              title="Hapus data cap sholat murid"
            >
              <Trash2 className="w-4 h-4 text-red-300" />
              Hapus Data Cap Sholat
            </button>
          </div>
        </div>
      </div>

      {/* Student Selector Carousel & Filter Bar (hidden on print) */}
      {!isBatchPrintMode && (
        <div className="no-print bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Previous / Next and Current Student Banner */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handlePrevStudent}
              title="Murid Sebelumnya"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 min-w-0 flex-1 sm:w-72">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <DriveImage
                  src={currentStudent.photoUrl}
                  alt={currentStudent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                    No. {currentStudent.no}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 font-mono truncate">
                    {currentStudent.nisn}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 truncate">
                  {currentStudent.name}
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentStudent.rombel}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextStudent}
              title="Murid Berikutnya"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Search Dropdown & Semester Switch */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Student Search Select */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.no}. {s.name} ({s.nisn})
                  </option>
                ))}
              </select>
              <Users className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Semester Buttons */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setSemester('ganjil')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  semester === 'ganjil'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester Ganjil (Jul - Des)
              </button>
              <button
                onClick={() => setSemester('genap')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  semester === 'genap'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester Genap (Jan - Jun)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Single Card Display */}
      {!isBatchPrintMode ? (
        <div id="single-prayer-card-container" className="print:m-0">
          <StudentPrayerCard
            student={currentStudent}
            profile={profile}
            attendances={attendances}
            semester={semester}
            onCellClick={handleCellClick}
            isInteractive={true}
          />
        </div>
      ) : (
        /* Batch Mode: Render all 17 students' prayer cards */
        <div className="space-y-8">
          <div className="no-print bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-700" />
              Menampilkan Kartu Shalat untuk seluruh {students.length} murid kelas X DKV 2 siap cetak.
            </span>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-900 text-white font-bold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen
            </button>
          </div>

          {students.map((st) => (
            <div key={st.id} className="print:break-after-page mb-6">
              <StudentPrayerCard
                student={st}
                profile={profile}
                attendances={attendances}
                semester={semester}
                onCellClick={handleCellClick}
                isInteractive={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Manual Stamp Confirmation Modal */}
      {selectedCell && currentStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Konfirmasi Stempel Sholat
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedCell.session}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200/60">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <DriveImage
                    src={currentStudent.photoUrl}
                    alt={currentStudent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {currentStudent.name}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    NISN: {currentStudent.nisn} • {currentStudent.rombel}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-900 mt-0.5">
                    Tanggal: {selectedCell.date} ({selectedCell.session})
                  </p>
                </div>
              </div>

              {/* Stamp Preview */}
              <div className="text-center py-2 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-wider">
                  Bentuk Stempel Cap Rohis:
                </span>
                <PrayerStamp size="md" rotation={selectedCell.isPresent ? 0 : -2} />
              </div>

              <p className="text-xs text-slate-600 text-center">
                {selectedCell.isPresent ? (
                  <span className="text-red-700 font-medium">
                    Sholat pada tanggal ini <b>sudah tercatat</b>. Apakah Anda ingin <b>membatalkan/menghapus cap</b> ini?
                  </span>
                ) : (
                  <span>
                    Apakah murid ini hadir dan melaksanakan <b>{selectedCell.session}</b> pada tanggal <b>{selectedCell.date}</b>?
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleToggleAttendance}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm text-white ${
                  selectedCell.isPresent
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {selectedCell.isPresent ? (
                  <>
                    <X className="w-4 h-4" />
                    Hapus Stempel Sholat
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Bubuhkan Cap Sholat (Sah)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Prayer Stamps Confirmation Modal */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Hapus Seluruh Data Cap Sholat?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan mengosongkan seluruh stempel sholat
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
              Semua catatan presensi sholat (Dhuhur, Ashar, Dhuha, Jumat) pada kartu digital seluruh murid binaan akan dihapus/dikosongkan. Anda dapat mulai mencatat kehadiran sholat yang baru melalui scan barcode.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsConfirmClearOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleClearAllPrayerStamps}
                className="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus Data Cap Sholat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
