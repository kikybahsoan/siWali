import React from 'react';
import { SchoolProfile } from '../types';
import { TabType } from './BottomNav';
import { ShieldAlert, Printer, Settings, Plus, RotateCcw, FileSpreadsheet, CloudCheck, Cloud } from 'lucide-react';

interface TopHeaderProps {
  profile: SchoolProfile;
  activeTab: TabType;
  escalatedCount?: number;
  isSheetsConfigured?: boolean;
  isSheetsSyncing?: boolean;
  onOpenSettings: () => void;
  onOpenSheetsSync?: () => void;
  onQuickPrint?: () => void;
  onQuickNewAction?: () => void;
  onResetData?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  activeTab,
  escalatedCount = 0,
  isSheetsConfigured = false,
  isSheetsSyncing = false,
  onOpenSettings,
  onOpenSheetsSync,
  onQuickPrint,
  onQuickNewAction,
  onResetData,
}) => {
  const getTabHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return `Ringkasan Perwalian — ${profile.semester} ${profile.schoolYear}`;
      case 'students':
        return 'Identitas & Profil 14 Murid Wali';
      case 'activities':
        return 'Kegiatan Pembiasaan Harian, Mingguan & Bulanan';
      case 'consultations':
        return 'Laporan Pelaksanaan Konsultasi Perwalian';
      case 'collaborations':
        return 'Laporan Kolaborasi Guru BK, Walas & Mapel';
      case 'cases':
        return 'Mekanisme SOP Penanganan Masalah (8 Tahapan)';
      case 'journal':
        return 'Rekap Jurnal Terpadu Guru Wali';
      default:
        return 'Sistem Informasi Guru Wali (siWali)';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return `SMK Negeri 2 Gorontalo • Program Keahlian ${profile.expertiseProgram}`;
      case 'students':
        return 'Formulir 4 Bagian (Data Ortu, Akademik, Karakter & Bimbingan Awal)';
      case 'activities':
        return 'Dokumentasi Sholat Dhuha, Literasi, Kebersihan, Senam & Integrasi Foto Drive';
      case 'consultations':
        return 'Dokumentasi Bimbingan Personal & Rekomendasi Tindak Lanjut';
      case 'collaborations':
        return 'Koordinasi Lintas Pendidik & Penanganan Terpadu';
      case 'cases':
        return 'Alur Kasus Jalur A (Akademik), Jalur B (Sosial/BK) & Eskalasi Kepala Sekolah';
      case 'journal':
        return 'Linimasa Kronologis Seluruh Aktivitas Perwalian';
      default:
        return 'SMKN 2 Gorontalo';
    }
  };

  return (
    <header
      id="main-top-header"
      className="app-header no-print sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 h-16 flex items-center justify-between shadow-sm"
    >
      {/* Left: Tab Title & Context */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Brand indicator (visible when sidebar is hidden) */}
        <div className="lg:hidden flex items-center gap-2 pr-2 border-r border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            W
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight truncate">
            {getTabHeading()}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate">
            {getTabSubtitle()}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {escalatedCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs font-semibold shadow-xs"
            title={`${escalatedCount} Kasus Memerlukan Eskalasi Kepala Sekolah`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span className="hidden md:inline">Eskalasi:</span>
            <span className="font-bold">{escalatedCount}</span>
          </div>
        )}

        {/* Google Spreadsheet Sync Badge & Button */}
        {onOpenSheetsSync && (
          <button
            id="header-sheets-sync-btn"
            onClick={onOpenSheetsSync}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 border ${
              isSheetsConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Integrasi & Sinkronisasi Real-Time Google Spreadsheet"
          >
            {isSheetsConfigured ? (
              <>
                <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isSheetsSyncing ? 'animate-ping' : 'animate-pulse'}`} />
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 hidden sm:inline" />
                <span className="hidden sm:inline">Spreadsheet</span>
                <span className="sm:hidden">Sync</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Hubungkan Spreadsheet</span>
                <span className="sm:hidden">Spreadsheet</span>
              </>
            )}
          </button>
        )}

        {onQuickPrint && (
          <button
            id="header-export-pdf-btn"
            onClick={onQuickPrint}
            className="bg-white border border-slate-300 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-1.5 shadow-xs active:scale-95"
            title="Export dan Cetak Laporan Resmi"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Laporan PDF</span>
            <span className="sm:hidden">Cetak</span>
          </button>
        )}

        {onQuickNewAction && (
          <button
            id="header-add-new-btn"
            onClick={onQuickNewAction}
            className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium text-white shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">+ Data Baru</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        )}

        <button
          id="header-settings-btn"
          onClick={onOpenSettings}
          className="p-2 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Pengaturan Profil Guru & Kop Surat"
        >
          <Settings className="w-4 h-4" />
        </button>

        {onResetData && (
          <button
            id="header-reset-btn"
            onClick={onResetData}
            className="p-2 rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors hidden xl:block"
            title="Reset ke Data Awal 14 Siswa DKV"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
