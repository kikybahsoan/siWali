import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleSheetsConfig,
  FullSyncPayload,
  Student,
  Consultation,
  Collaboration,
  StudentCase,
  SchoolProfile,
  ActivityLog,
} from '../types';
import { SheetsSyncService, GoogleAppsScriptTemplate } from '../services/sheetsSync';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Database,
  Cloud,
  CloudCheck,
  CloudUpload,
  CloudDownload,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Zap,
  QrCode,
  Download,
  Upload,
  Share2,
  CalendarCheck,
} from 'lucide-react';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  activities?: ActivityLog[];
  consultations: Consultation[];
  collaborations: Collaboration[];
  cases: StudentCase[];
  profile: SchoolProfile;
  onSyncComplete: () => void;
}

export const SheetsSyncModal: React.FC<SheetsSyncModalProps> = ({
  isOpen,
  onClose,
  students,
  activities = [],
  consultations,
  collaborations,
  cases,
  profile,
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'mobile' | 'backup' | 'guide' | 'structure'>('config');
  const [config, setConfig] = useState<GoogleSheetsConfig>(SheetsSyncService.getConfig());
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedMobileLink, setCopiedMobileLink] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isImportingBackup, setIsImportingBackup] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const current = SheetsSyncService.getConfig();
      setConfig(current);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mobileSyncUrl = SheetsSyncService.getShareableSyncUrl();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GoogleAppsScriptTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCopyMobileLink = () => {
    navigator.clipboard.writeText(mobileSyncUrl);
    setCopiedMobileLink(true);
    setTimeout(() => setCopiedMobileLink(false), 3000);
  };

  const handleSaveConfig = () => {
    SheetsSyncService.saveConfig(config);
    setStatusMessage({
      type: 'success',
      text: 'Pengaturan Google Spreadsheet berhasil disimpan!',
    });
  };

  const handleTestConnection = async () => {
    if (!config.webAppUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Harap masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);
    try {
      const result = await SheetsSyncService.testConnection(config.webAppUrl.trim());
      if (result.success) {
        SheetsSyncService.saveConfig(config);
        setStatusMessage({
          type: 'success',
          text: 'Koneksi Berhasil! Aplikasi terhubung secara real-time ke Google Spreadsheet.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message,
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: `Gagal menguji koneksi: ${e.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePullFromSheets = async () => {
    if (!config.webAppUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Harap masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setIsPulling(true);
    setStatusMessage(null);
    try {
      const result = await SheetsSyncService.pullFromSheets(config.webAppUrl.trim());
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: 'Data berhasil ditarik dari Google Spreadsheet! Data lokal telah diperbarui.',
        });
        setConfig(SheetsSyncService.getConfig());
        onSyncComplete();
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message,
        });
      }
    } finally {
      setIsPulling(false);
    }
  };

  const handlePushToSheets = async () => {
    if (!config.webAppUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Harap masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setIsPushing(true);
    setStatusMessage(null);
    try {
      const payload: FullSyncPayload = {
        students,
        activities,
        consultations,
        collaborations,
        cases,
        profile,
        lastUpdated: new Date().toISOString(),
      };
      const result = await SheetsSyncService.pushToSheets(config.webAppUrl.trim(), payload);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: 'Semua data murid, kegiatan pembiasaan, konsultasi, kolaborasi, SOP kasus & profil berhasil disimpan ke Google Spreadsheet!',
        });
        setConfig(SheetsSyncService.getConfig());
        onSyncComplete();
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message,
        });
      }
    } finally {
      setIsPushing(false);
    }
  };

  const handleExportBackup = () => {
    SheetsSyncService.exportBackupFile();
    setStatusMessage({
      type: 'success',
      text: 'File cadangan JSON lengkap telah diunduh!',
    });
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsImportingBackup(true);
    const res = await SheetsSyncService.importBackupFile(file);
    setIsImportingBackup(false);
    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'Data cadangan berhasil dipulihkan ke perangkat ini!',
      });
      onSyncComplete();
    } else {
      setStatusMessage({
        type: 'error',
        text: res.message,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isConfigured = Boolean(
    config.webAppUrl && config.webAppUrl.trim().startsWith('https://script.google.com/')
  );

  return (
    <div
      id="sheets-sync-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1e40af] to-[#047857] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  Sinkronisasi Cloud &amp; Multi-Device
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-300/30 text-[10px] font-semibold uppercase tracking-wider">
                  Real-Time Cloud
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Penyimpanan Data Terpusat di Google Spreadsheet &amp; Sinkronisasi Otomatis ke Smartphone / Tablet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Pengaturan &amp; Sync
            {isConfigured && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'mobile'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            Buka di HP (QR Code)
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            Cadangan Offline (JSON)
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Panduan Script
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'structure'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Struktur 6 Sheet
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Status Feedback Banner */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 border transition-all ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{statusMessage.text}</div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: PENGATURAN & SINKRONISASI */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Connection Status Card */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isConfigured
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isConfigured
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {isConfigured ? (
                      <CloudCheck className="w-6 h-6" />
                    ) : (
                      <Cloud className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Status:{' '}
                      {isConfigured
                        ? 'Google Spreadsheet Terhubung'
                        : 'Belum Terhubung (Mode Penyimpanan Lokal)'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {config.lastSyncTime
                        ? `Terakhir disinkronkan: ${new Date(
                            config.lastSyncTime
                          ).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}`
                        : 'Belum pernah disinkronkan ke cloud.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !config.webAppUrl}
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-blue-600' : ''}`}
                    />
                    {isTesting ? 'Menguji...' : 'Uji Koneksi'}
                  </button>

                  {config.spreadsheetUrl && (
                    <a
                      href={config.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Buka Spreadsheet
                    </a>
                  )}
                </div>
              </div>

              {/* Form Input URL Apps Script */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    URL Aplikasi Web Google Apps Script (*Web App URL*)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      value={config.webAppUrl}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, webAppUrl: e.target.value }))
                      }
                      className="w-full text-xs sm:text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <span>💡 URL ini didapat setelah melakukan Deploy sebagai Web App di Google Sheets.</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoSyncEnabled}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, autoSyncEnabled: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Aktifkan Sinkronisasi Latar Belakang Otomatis (Setiap 25 detik)
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
              </div>

              {/* Action Buttons: Tarik & Kirim Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pull Action */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                      <CloudDownload className="w-5 h-5 text-blue-600" />
                      <h3>Tarik Data Terbaru dari Spreadsheet</h3>
                    </div>
                    <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                      Unduh seluruh data murid, kegiatan pembiasaan, konsultasi, kolaborasi, dan kasus SOP yang tersimpan di Google Spreadsheet ke perangkat ini.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePullFromSheets}
                    disabled={isPulling || !config.webAppUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />
                    {isPulling ? 'Sedang Menarik Data...' : 'Tarik Data dari Cloud Sekarang'}
                  </button>
                </div>

                {/* Push Action */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <CloudUpload className="w-5 h-5 text-emerald-600" />
                      <h3>Kirim Data Lokal ke Spreadsheet</h3>
                    </div>
                    <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">
                      Unggah {students.length} murid, {activities.length} kegiatan, {consultations.length} konsultasi, {cases.length} kasus dari perangkat ini ke Spreadsheet Google Drive.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePushToSheets}
                    disabled={isPushing || !config.webAppUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CloudUpload className={`w-4 h-4 ${isPushing ? 'animate-pulse' : ''}`} />
                    {isPushing ? 'Sedang Mengunggah...' : 'Kirim Semua Data ke Cloud'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUKA DI HP (QR CODE & LINK SINKRONISASI) */}
          {activeTab === 'mobile' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                    <Smartphone className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      Sinkronisasi Instan ke Smartphone / HP
                    </h3>
                    <p className="text-xs text-blue-200">
                      Buka siWali di HP Anda dengan data yang langsung tersinkron secara otomatis
                    </p>
                  </div>
                </div>
              </div>

              {config.webAppUrl ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white p-6 rounded-2xl border border-slate-200">
                  {/* Left: QR Code */}
                  <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 inline-block">
                      <QRCodeSVG
                        value={mobileSyncUrl}
                        size={190}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-3">
                      Scan dengan Kamera Smartphone Anda
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                      Kamera HP akan membuka website dan otomatis menghubungkan URL Google Spreadsheet.
                    </p>
                  </div>

                  {/* Right: Copy Link & 3 Steps Guide */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Tautan Sinkronisasi Langsung untuk HP:
                      </label>
                      <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-700 break-all border border-slate-200 select-all">
                        {mobileSyncUrl}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyMobileLink}
                        className="mt-2.5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        {copiedMobileLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedMobileLink ? 'Tautan Berhasil Disalin!' : 'Salin Tautan (Kirim ke WhatsApp / Chat)'}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                      <h4 className="text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-700" />
                        Cara Kerja di Smartphone:
                      </h4>
                      <ol className="text-[11px] text-blue-900 space-y-1 list-decimal list-inside leading-relaxed">
                        <li>Buka tautan atau scan QR code di atas menggunakan smartphone Anda.</li>
                        <li>Aplikasi siWali di HP akan langsung menyimpan alamat Google Spreadsheet.</li>
                        <li>Data murid, kegiatan, konsultasi &amp; kasus akan otomatis ditarik dari Cloud.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                  <h4 className="text-sm font-bold text-amber-900">
                    URL Google Apps Script Belum Diatur
                  </h4>
                  <p className="text-xs text-amber-800 max-w-md mx-auto">
                    Silakan masukkan URL Web App Google Apps Script di tab <strong>"Pengaturan &amp; Sync"</strong> terlebih dahulu agar QR code sinkronisasi HP dapat dibuat.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('config')}
                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs"
                  >
                    Buka Pengaturan URL
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CADANGAN OFFLINE (JSON) */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                    <Database className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      Cadangan &amp; Pemulihan Data Offline (File JSON)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Simpan salinan data lengkap ke file komputer/HP dan pulihkan sewaktu-waktu tanpa internet
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Backup Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Download className="w-5 h-5 text-blue-600" />
                      <h4>Ekspor Cadangan Lengkap</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Unduh file JSON berisi seluruh data ({students.length} murid, {activities.length} kegiatan, {consultations.length} konsultasi, {cases.length} kasus SOP, dan profil sekolah).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Unduh File Cadangan JSON
                  </button>
                </div>

                {/* Import Backup Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Upload className="w-5 h-5 text-emerald-600" />
                      <h4>Pulihkan dari File Cadangan</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Pilih file cadangan JSON dari perangkat Anda untuk memuat seluruh data ke aplikasi ini secara instan.
                    </p>
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackup}
                      className="hidden"
                      id="import-backup-input"
                    />
                    <label
                      htmlFor="import-backup-input"
                      className={`w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        isImportingBackup ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {isImportingBackup ? 'Memproses...' : 'Pilih File JSON untuk Dipulihkan'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PANDUAN 5 LANGKAH & KODE APPS SCRIPT */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Copy Script Card */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-sm text-white">
                      Kode Google Apps Script (Versi 2.0 - Termasuk Kegiatan Pembiasaan)
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Kode Disalin!' : 'Salin Seluruh Kode Script'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  Tempelkan kode ini di editor Google Apps Script spreadsheet Anda:
                </p>

                <pre className="bg-black/60 p-4 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-52 border border-slate-800 select-all">
                  {GoogleAppsScriptTemplate}
                </pre>
              </div>

              {/* Update Deployment Notice */}
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tips Jika Anda Sudah Memasang Script Sebelumnya (Perbarui Versi):</span>
                </div>
                <p className="text-amber-900/90 leading-relaxed pl-6">
                  Jika Anda telah memasang script versi lama, ganti kodenya di Apps Script dengan kode di atas, lalu klik:
                  <strong className="block mt-1 font-semibold text-amber-950">
                    Terapkan (Deploy) &gt; Kelola Penerapan (Manage Deployments) &gt; Edit (Ikon Pensil) &gt; Versi: Versi Baru (New version) &gt; Terapkan (Deploy).
                  </strong>
                  Dengan begitu, Google Spreadsheet akan langsung membuat dan membaca tab <strong>KEGIATAN_PEMBIASAAN</strong> secara otomatis.
                </p>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Petunjuk Pemasangan 5 Langkah Mudah:
                </h3>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Buka Google Sheets Baru / Eksisting
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Buka <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold underline">sheets.new</a> atau Google Spreadsheet yang ingin Anda gunakan sebagai database siWali.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Buka Editor Apps Script
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Di menu atas Google Sheets, klik menu: <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Tempelkan Kode Script &amp; Simpan
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Hapus semua kode bawaan di editor, klik tombol <strong>"Salin Seluruh Kode Script"</strong> di atas, tempelkan ke editor, lalu klik ikon <strong>Simpan (Disket)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Terapkan sebagai Aplikasi Web (Deploy as Web App)
                    </h4>
                    <ul className="text-xs text-slate-600 mt-1 space-y-1 list-disc list-inside">
                      <li>Klik tombol <strong>Terapkan (Deploy)</strong> di kanan atas &gt; <strong>Penerapan baru (New deployment)</strong>.</li>
                      <li>Pilih jenis: <strong>Aplikasi Web (Web App)</strong> (ikon gerigi).</li>
                      <li>Jalankan sebagai: <strong>Saya (Me)</strong>.</li>
                      <li>
                        Siapa yang memiliki akses: <strong className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">Siapa saja (Anyone)</strong> *(wajib agar dapat diakses dari device lain tanpa login akun berulang)*.
                      </li>
                      <li>Klik <strong>Terapkan (Deploy)</strong> dan berikan izin akses Google akun Anda.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      Salin URL Web App &amp; Tempelkan di siWali
                    </h4>
                    <p className="text-xs text-emerald-900 mt-0.5">
                      Salin <strong>URL Aplikasi Web</strong> yang berakhiran <code>/exec</code>, buka kembali tab <strong>"Pengaturan &amp; Sync"</strong> di atas, dan tempelkan ke kolom URL Web App!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AKSES MULTI-DEVICE & STRUKTUR 6 SHEET */}
          {activeTab === 'structure' && (
            <div className="space-y-6">
              {/* Multi Device Architecture Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Cloud className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      Arsitektur Real-Time Multi-Device
                    </h3>
                    <p className="text-xs text-slate-300">
                      Akses dan input data dari mana saja secara serentak
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center gap-3">
                    <Laptop className="w-6 h-6 text-emerald-300 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Laptop Guru Wali</p>
                      <p className="text-[10px] text-slate-300">Input di ruang guru</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-amber-300 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Smartphone / Tablet</p>
                      <p className="text-[10px] text-slate-300">Pantau saat di kelas / luar</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-blue-300 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Google Spreadsheet</p>
                      <p className="text-[10px] text-slate-300">Pusat database aman di Drive</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-blue-200 leading-relaxed">
                  Ketika Anda menempelkan URL Web App Google Apps Script yang sama pada siWali di laptop maupun ponsel, kedua perangkat akan otomatis membaca dan menulis ke Spreadsheet Google Drive yang sama.
                </p>
              </div>

              {/* Sheet Tables Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  6 Lembar Kerja (*Sheet*) yang Dikelola Otomatis di Google Sheets:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-800" />
                      <p className="text-xs font-bold text-slate-900">DATA_MURID</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Menyimpan biodata lengkap murid (NISN, orang tua, riwayat pendidikan, prestasi, ekskul, dan cita-cita).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      <p className="text-xs font-bold text-slate-900">KEGIATAN_PEMBIASAAN</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Dokumentasi kegiatan harian, mingguan, bulanan (Sholat Dhuha, Literasi, Kebersihan Studio, Senam &amp; Parenting).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <p className="text-xs font-bold text-slate-900">KONSULTASI_PERWALIAN</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Rekap permasalahan siswa dan arahan tindak lanjut bimbingan personal guru wali.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      <p className="text-xs font-bold text-slate-900">KOLABORASI_BK_WALAS</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Dokumentasi koordinasi terpadu bersama Guru BK, Wali Kelas, dan Guru Mapel.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                      <p className="text-xs font-bold text-slate-900">PENANGANAN_KASUS_SOP</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Data 8 tahapan SOP kasus, status Jalur A/B, kunjungan rumah (*home visit*), dan eskalasi Kepala Sekolah.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                      <p className="text-xs font-bold text-slate-900">PROFIL_SEKOLAH</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Kop sekolah, data Kepala Sekolah (Drs. Jakub A GuE - NIP 196706081994121002), dan data Guru Wali Murid.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {isConfigured ? 'Status: Real-Time Sync Aktif' : 'Status: Penyimpanan Lokal'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveConfig();
                onClose();
              }}
              className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Selesai &amp; Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
