import React, { useState, useMemo } from 'react';
import {
  Student,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSession,
  SchoolProfile,
} from '../types';
import { StorageService } from '../services/storage';
import { SheetsSyncService } from '../services/sheetsSync';
import {
  formatIndonesianDate,
  getIndonesianDayName,
  getTodayDateString,
  INDONESIAN_MONTHS,
} from '../utils/formatters';
import { DriveImage } from '../components/DriveImage';
import { AppLogo } from '../components/AppLogo';
import {
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CloudCheck,
  Users,
  FileSpreadsheet,
  Check,
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CalendarCheck,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

interface AttendanceRecapViewProps {
  students: Student[];
  profile: SchoolProfile;
  attendances: AttendanceRecord[];
  onAttendanceUpdated: (records: AttendanceRecord[]) => void;
  onNavigateToScanner: () => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

export const AttendanceRecapView: React.FC<AttendanceRecapViewProps> = ({
  students,
  profile,
  attendances,
  onAttendanceUpdated,
  onNavigateToScanner,
  isAdmin,
  onRequireAdmin,
}) => {
  // Filter States
  const todayStr = useMemo(() => getTodayDateString(), []);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // 'all', 'today', or 'custom'
  const [customDate, setCustomDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, '0')
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear())
  );
  const [selectedRombel, setSelectedRombel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

  // Manual Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(todayStr);
  const [formTime, setFormTime] = useState<string>('07:00:00');
  const [formStatus, setFormStatus] = useState<AttendanceStatus>('Hadir');
  const [formSession, setFormSession] = useState<AttendanceSession>('Pembiasaan Pagi / KBM');
  const [formNotes, setFormNotes] = useState<string>('');

  // Sync state
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Filtered attendances list
  const filteredAttendances = useMemo(() => {
    return attendances.filter((att) => {
      // Date filter
      if (selectedDateFilter === 'today' && att.date !== todayStr) return false;
      if (selectedDateFilter === 'custom' && att.date !== customDate) return false;

      // Month/Year filter for matrix or all
      if (selectedDateFilter === 'all' && viewMode === 'matrix') {
        const [y, m] = att.date.split('-');
        if (y !== selectedYear || m !== selectedMonth) return false;
      }

      // Rombel filter
      if (selectedRombel !== 'all' && att.rombel !== selectedRombel) return false;

      // Status filter
      if (selectedStatus !== 'all' && att.status !== selectedStatus) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = att.studentName.toLowerCase().includes(q);
        const matchesNisn = att.nisn.includes(q);
        const matchesNotes = (att.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesNisn && !matchesNotes) return false;
      }

      return true;
    });
  }, [
    attendances,
    selectedDateFilter,
    todayStr,
    customDate,
    selectedMonth,
    selectedYear,
    selectedRombel,
    selectedStatus,
    searchQuery,
    viewMode,
  ]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = filteredAttendances.length;
    const hadir = filteredAttendances.filter((a) => a.status === 'Hadir').length;
    const terlambat = filteredAttendances.filter((a) => a.status === 'Terlambat').length;
    const sakit = filteredAttendances.filter((a) => a.status === 'Sakit').length;
    const izin = filteredAttendances.filter((a) => a.status === 'Izin').length;
    const alpa = filteredAttendances.filter((a) => a.status === 'Alpa').length;
    const persentase = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 100;

    return { total, hadir, terlambat, sakit, izin, alpa, persentase };
  }, [filteredAttendances]);

  // Open modal for new attendance record
  const handleOpenAddModal = () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingRecord(null);
    setFormStudentId(students[0]?.id || '');
    setFormDate(todayStr);
    const now = new Date();
    setFormTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
    );
    setFormStatus('Hadir');
    setFormSession('Pembiasaan Pagi / KBM');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for editing record
  const handleOpenEditModal = (rec: AttendanceRecord) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingRecord(rec);
    setFormStudentId(rec.studentId);
    setFormDate(rec.date);
    setFormTime(rec.time);
    setFormStatus(rec.status);
    setFormSession(rec.session);
    setFormNotes(rec.notes || '');
    setIsModalOpen(true);
  };

  // Save manual/edited record
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formStudentId);
    if (!st) return;

    const record: AttendanceRecord = {
      id: editingRecord ? editingRecord.id : `att-${formDate}-${st.id}`,
      studentId: st.id,
      studentName: st.name,
      nisn: st.nisn,
      rombel: st.rombel,
      date: formDate,
      dayName: getIndonesianDayName(formDate),
      time: formTime,
      session: formSession,
      status: formStatus,
      method: editingRecord ? editingRecord.method : 'Manual',
      notes: formNotes || (formStatus === 'Hadir' ? 'Tepat Waktu' : formStatus),
      photoUrl: st.photoUrl,
      createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { updatedList } = StorageService.recordAttendance(record);
    onAttendanceUpdated(updatedList);
    setIsModalOpen(false);

    // Auto sync to Google Sheets if configured
    if (SheetsSyncService.isConfigured()) {
      SheetsSyncService.pushToSheets().catch(() => {});
    }
  };

  // Delete attendance record
  const handleDeleteRecord = (id: string, name: string) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus data presensi untuk ${name}?`)) {
      const updated = StorageService.deleteAttendance(id);
      onAttendanceUpdated(updated);
      if (SheetsSyncService.isConfigured()) {
        SheetsSyncService.pushToSheets().catch(() => {});
      }
    }
  };

  // Trigger manual sync to Google Sheets
  const handleSyncToSheets = async () => {
    if (!SheetsSyncService.isConfigured()) {
      alert('URL Google Spreadsheet Web App belum dikonfigurasi. Buka menu Sinkron Cloud di samping untuk menghubungkan.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Sedang merekap & mengirim seluruh presensi ke Google Sheets...');
    try {
      const res = await SheetsSyncService.pushToSheets();
      if (res.success) {
        setSyncStatus('Berhasil disinkronkan ke tab "KEHADIRAN_MURID" di Google Spreadsheet!');
      } else {
        setSyncStatus(`Gagal: ${res.message}`);
      }
    } catch (e: any) {
      setSyncStatus(`Gagal koneksi: ${e.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Tanggal',
      'Hari',
      'Waktu',
      'NISN',
      'Nama Siswa',
      'Rombel',
      'Status',
      'Sesi',
      'Metode',
      'Keterangan',
    ];
    const rows = filteredAttendances.map((a) => [
      a.id,
      a.date,
      a.dayName,
      a.time,
      a.nisn,
      `"${a.studentName}"`,
      a.rombel,
      a.status,
      `"${a.session}"`,
      a.method,
      `"${a.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Presensi_DKV_${selectedDateFilter}_${todayStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique rombels
  const rombels = useMemo(() => {
    const set = new Set(students.map((s) => s.rombel));
    return Array.from(set);
  }, [students]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 flex items-center gap-1">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buku Presensi & Jurnal Absensi</span>
              </span>
              <span className="text-xs text-blue-200/80">
                SMK Negeri 2 Gorontalo • {profile.expertiseProgram}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Rekapitulasi Kehadiran Murid Binaan
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              Monitoring data kehadiran harian, mingguan, dan bulanan siswa. Seluruh data presensi otomatis tersinkronisasi ke Google Spreadsheet perwalian.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onNavigateToScanner}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Buka Scanner Barcode</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Input Manual</span>
            </button>

            <button
              onClick={handleSyncToSheets}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/20 flex items-center gap-1.5"
              title="Sinkronkan data presensi ke Google Sheets"
            >
              <CloudCheck className="w-4 h-4 text-emerald-300" />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Sheets'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/20 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-slide-down">
          <CloudCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Catatan</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">% Tingkat Hadir</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.persentase}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Hadir Tepat Waktu</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats.hadir}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Terlambat</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.terlambat}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Sakit & Izin</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.sakit + stats.izin}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Tanpa Keterangan</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats.alpa}</p>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Mode Tampilan:</span>
            <div className="p-1 rounded-xl bg-slate-100 flex items-center gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Linimasa
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Matriks Bulanan Resmi
              </button>
            </div>
          </div>

          {/* Right: Export & Quick Counts */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          {/* Filter 1: Rentang Tanggal */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Periode Tanggal:</label>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Semua Tanggal Tercatat</option>
              <option value="today">Hari Ini Saja ({formatIndonesianDate(todayStr)})</option>
              <option value="custom">Pilih Tanggal Khusus...</option>
            </select>
          </div>

          {selectedDateFilter === 'custom' && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Pilih Tanggal:</label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Filter 2: Rombel */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Rombel:</label>
            <select
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Semua Rombel (DKV)</option>
              {rombels.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Status Kehadiran:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Semua Status</option>
              <option value="Hadir">Hadir Tepat Waktu</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin">Izin</option>
              <option value="Alpa">Alpa</option>
              <option value="Dispensasi">Dispensasi</option>
            </select>
          </div>

          {/* Filter 4: Pencarian Nama / NISN */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Cari Murid:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NISN, atau catatan..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* View 1: List / Table View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Nama Murid</th>
                  <th className="py-3 px-4">Rombel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sesi Presensi</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <CalendarCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada data kehadiran yang sesuai filter.</p>
                      <p className="text-[11px] mt-0.5">Gunakan Scanner Barcode atau tombol Input Manual untuk menambahkan presensi.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAttendances.map((rec, idx) => {
                    const statusBadgeClass =
                      rec.status === 'Hadir'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : rec.status === 'Terlambat'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : rec.status === 'Sakit'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : rec.status === 'Izin'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200';

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-900">
                            {rec.dayName ? `${rec.dayName}, ` : ''}
                            {formatIndonesianDate(rec.date)}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{rec.time}</span>
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              {rec.photoUrl ? (
                                <DriveImage
                                  src={rec.photoUrl}
                                  alt={rec.studentName}
                                  preset="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600">
                                  {rec.studentName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 truncate">{rec.studentName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">NISN: {rec.nisn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                          {rec.rombel}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusBadgeClass}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                          {rec.session}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {rec.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                          {rec.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(rec)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Edit Presensi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec.id, rec.studentName)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Hapus Presensi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Monthly Attendance Matrix (Buku Presensi Resmi) */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Buku Matriks Kehadiran Siswa Bulanan
              </h3>
              <p className="text-xs text-slate-500">
                Format standar rekap perwalian: H (Hadir), T (Terlambat), S (Sakit), I (Izin), A (Alpa).
              </p>
            </div>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 font-semibold"
              >
                {INDONESIAN_MONTHS.map((m, idx) => {
                  const val = String(idx + 1).padStart(2, '0');
                  return (
                    <option key={val} value={val}>
                      {m}
                    </option>
                  );
                })}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 font-semibold"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 min-w-[180px]">Nama Murid</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-24">NISN</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-24">Rombel</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-200 w-12 bg-emerald-50 text-emerald-800">H</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-200 w-12 bg-amber-50 text-amber-800">T</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-200 w-12 bg-blue-50 text-blue-800">S</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-200 w-12 bg-purple-50 text-purple-800">I</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-200 w-12 bg-rose-50 text-rose-800">A</th>
                  <th className="py-2.5 px-3 text-center w-20">% Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((st, idx) => {
                  const studentRecords = filteredAttendances.filter((a) => a.studentId === st.id);
                  const hCount = studentRecords.filter((a) => a.status === 'Hadir').length;
                  const tCount = studentRecords.filter((a) => a.status === 'Terlambat').length;
                  const sCount = studentRecords.filter((a) => a.status === 'Sakit').length;
                  const iCount = studentRecords.filter((a) => a.status === 'Izin').length;
                  const aCount = studentRecords.filter((a) => a.status === 'Alpa').length;
                  const totalLogged = studentRecords.length;
                  const rate = totalLogged > 0 ? Math.round(((hCount + tCount) / totalLogged) * 100) : 100;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                        {st.name}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-600">
                        {st.nisn}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700">
                        {st.rombel}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold text-emerald-800 bg-emerald-50/40">
                        {hCount}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold text-amber-800 bg-amber-50/40">
                        {tCount}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold text-blue-800 bg-blue-50/40">
                        {sCount}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold text-purple-800 bg-purple-50/40">
                        {iCount}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-bold text-rose-800 bg-rose-50/40">
                        {aCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Printable Rekap Presensi with Kop Surat SMK Negeri 2 Gorontalo */}
      <div className="print-only hidden p-8 bg-white text-slate-900">
        {/* Kop Surat Sekolah */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 shrink-0">
            <AppLogo size="xl" />
          </div>
          <div className="text-center flex-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
              PEMERINTAH PROVINSI GORONTALO
            </h3>
            <h2 className="text-lg font-extrabold uppercase text-slate-900">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h2>
            <h1 className="text-xl font-black uppercase text-blue-900 tracking-tight">
              {profile.name || 'SMK NEGERI 2 GORONTALO'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {profile.address} • Telp: {profile.phone} • Email: {profile.email}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-5">
          <h2 className="text-base font-bold uppercase underline tracking-wider">
            LAPORAN REKAPITULASI PRESENSI & KEHADIRAN SISWA
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Tahun Pelajaran: {profile.schoolYear} • Semester: {profile.semester} • Program Keahlian: {profile.expertiseProgram}
          </p>
        </div>

        {/* Print Table */}
        <table className="w-full text-left text-xs border border-slate-400 mb-6">
          <thead className="bg-slate-100 border-b border-slate-400">
            <tr>
              <th className="p-2 border-r border-slate-400 text-center w-8">No</th>
              <th className="p-2 border-r border-slate-400">Tanggal</th>
              <th className="p-2 border-r border-slate-400">NISN</th>
              <th className="p-2 border-r border-slate-400">Nama Lengkap Murid</th>
              <th className="p-2 border-r border-slate-400">Rombel</th>
              <th className="p-2 border-r border-slate-400">Jam</th>
              <th className="p-2 border-r border-slate-400">Status</th>
              <th className="p-2">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {filteredAttendances.slice(0, 30).map((r, i) => (
              <tr key={r.id}>
                <td className="p-1.5 border-r border-slate-400 text-center">{i + 1}</td>
                <td className="p-1.5 border-r border-slate-400">{r.date}</td>
                <td className="p-1.5 border-r border-slate-400 font-mono">{r.nisn}</td>
                <td className="p-1.5 border-r border-slate-400 font-bold">{r.studentName}</td>
                <td className="p-1.5 border-r border-slate-400">{r.rombel}</td>
                <td className="p-1.5 border-r border-slate-400 font-mono">{r.time}</td>
                <td className="p-1.5 border-r border-slate-400 font-semibold">{r.status}</td>
                <td className="p-1.5">{r.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-10 pt-6 text-xs">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala SMK Negeri 2 Gorontalo</p>
            <div className="h-20" />
            <p className="font-bold underline">{profile.principalName}</p>
            <p className="text-[11px] text-slate-600">NIP. {profile.principalNip}</p>
          </div>

          <div className="text-center">
            <p>Gorontalo, {formatIndonesianDate(todayStr)}</p>
            <p className="font-bold">Guru Wali Kelas</p>
            <div className="h-20" />
            <p className="font-bold underline">{profile.homeroomTeacherName}</p>
            <p className="text-[11px] text-slate-600">NIP. {profile.homeroomTeacherNip}</p>
          </div>
        </div>
      </div>

      {/* Manual Input / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-700" />
                <span>{editingRecord ? 'Edit Data Kehadiran' : 'Input Catatan Presensi Manual'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3.5 text-xs">
              {/* Student Select */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Murid:</label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.nisn}) — {st.rombel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waktu Masuk:</label>
                  <input
                    type="time"
                    step="1"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Status & Session */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Kehadiran:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Alpa">Alpa</option>
                    <option value="Dispensasi">Dispensasi</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sesi Presensi:</label>
                  <select
                    value={formSession}
                    onChange={(e) => setFormSession(e.target.value as AttendanceSession)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Pembiasaan Pagi / KBM">Pembiasaan Pagi / KBM</option>
                    <option value="Sholat Dhuha / Dzuhur">Sholat Dhuha / Dzuhur</option>
                    <option value="Ekstrakurikuler / Kegiatan Sore">Ekstrakurikuler / Sore</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Keterangan Tambahan:</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Surat keterangan dokter terlampir, alasan terlambat..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Presensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
