import React, { useState, useEffect } from 'react';
import {
  GoogleSheetsConfig,
  FullSyncPayload,
  Student,
  Consultation,
  Collaboration,
  StudentCase,
  SchoolProfile,
} from '../types';
import { SheetsSyncService, GoogleAppsScriptTemplate } from '../services/sheetsSync';
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
} from 'lucide-react';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
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
  consultations,
  collaborations,
  cases,
  profile,
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'guide' | 'structure'>('config');
  const [config, setConfig] = useState<GoogleSheetsConfig>(SheetsSyncService.getConfig());
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = SheetsSyncService.getConfig();
      setConfig(current);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GoogleAppsScriptTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
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
          text: 'Semua data murid, konsultasi, kolaborasi, SOP kasus & profil berhasil disimpan ke Google Spreadsheet!',
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
                  Integrasi Google Spreadsheet
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-300/30 text-[10px] font-semibold uppercase tracking-wider">
                  Real-Time Cloud
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Penyimpanan Data Terpusat, Real-Time & Dapat Diakses Lintas Perangkat (Laptop, Tablet, HP)
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Pengaturan & Sinkronisasi
            {isConfigured && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Panduan 5 Langkah & Kode Script
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'structure'
                ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Akses Multi-Device
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
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

              {/* Form Input URL Web App */}
              <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    URL Google Apps Script Web App (Wajib)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={config.webAppUrl}
                      onChange={(e) =>
                        setConfig({ ...config, webAppUrl: e.target.value })
                      }
                      placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                      className="w-full pl-3 pr-24 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs sm:text-sm font-mono text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-md bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold transition-colors"
                    >
                      Simpan URL
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Didapatkan dari menu <strong>Terapkan (Deploy) &gt; Penerapan Baru &gt; Aplikasi Web</strong> di Apps Script Google Spreadsheet Anda.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    URL Google Spreadsheet (Opsional untuk tautan cepat)
                  </label>
                  <input
                    type="url"
                    value={config.spreadsheetUrl || ''}
                    onChange={(e) =>
                      setConfig({ ...config, spreadsheetUrl: e.target.value })
                    }
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0X.../edit"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs text-slate-800 font-mono"
                  />
                </div>

                {/* Auto Sync Toggle */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Sinkronisasi Otomatis Real-Time
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Mengirimkan data otomatis setiap kali ada perubahan atau saat data ditambahkan.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoSyncEnabled}
                    onChange={(e) => {
                      const updated = { ...config, autoSyncEnabled: e.target.checked };
                      setConfig(updated);
                      SheetsSyncService.saveConfig(updated);
                    }}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                </div>
              </div>

              {/* Action Buttons (Pull / Push) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                      <CloudDownload className="w-4 h-4 text-blue-700" />
                      Tarik Data dari Spreadsheet (Pull)
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Mengambil data terbaru dari Google Spreadsheet ke perangkat ini. Sangat berguna jika Anda mengedit data dari HP/komputer lain.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePullFromSheets}
                    disabled={isPulling || !config.webAppUrl}
                    className="w-full py-2.5 px-4 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`}
                    />
                    {isPulling ? 'Menarik Data...' : 'Tarik Data Sekarang'}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                      <CloudUpload className="w-4 h-4 text-emerald-700" />
                      Kirim Data ke Spreadsheet (Push)
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Menyimpan semua 14 data murid, jurnal konsultasi, kolaborasi, kasus SOP, dan profil sekolah ke dalam Google Spreadsheet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePushToSheets}
                    disabled={isPushing || !config.webAppUrl}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CloudUpload
                      className={`w-3.5 h-3.5 ${isPushing ? 'animate-bounce' : ''}`}
                    />
                    {isPushing ? 'Menyimpan ke Cloud...' : 'Kirim Semua Data Sekarang'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PANDUAN 5 LANGKAH & KODE APPS SCRIPT */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-950">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-1 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Petunjuk Mudah Menghubungkan Google Spreadsheet ke siWali
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Cukup ikuti 5 langkah singkat di bawah ini. Anda tidak memerlukan keahlian teknis khusus; script yang kami sediakan akan membuat semua lembar kerja (*sheet*) dan kolom otomatis!
                </p>
              </div>

              {/* Step by Step Timeline */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Buka Google Spreadsheet Baru
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kunjungi{' '}
                      <a
                        href="https://sheets.new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 font-semibold underline inline-flex items-center gap-1"
                      >
                        sheets.new <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      atau buat spreadsheet baru di Google Drive Anda. Beri judul, misalnya: <em>"siWali SMKN 2 Gorontalo - Database Perwalian DKV"</em>.
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
                      Pada menu bagian atas Google Sheets Anda, klik menu{' '}
                      <strong className="text-slate-800">Ekstensi (Extensions)</strong> &gt;{' '}
                      <strong className="text-slate-800">Apps Script</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Tempelkan Kode Script Otomatis
                      </h4>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                          copiedCode
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-800 hover:bg-blue-900 text-white'
                        }`}
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Kode Berhasil Disalin!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Salin Kode Apps Script (1-Klik)
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      Hapus teks bawaan <code>function myFunction() &#123;&#125;</code> di editor Apps Script, lalu tempel kode yang disalin di bawah ini. Tekan ikon <strong>Simpan (Disket)</strong>.
                    </p>

                    {/* Code Snippet Box */}
                    <div className="relative rounded-lg bg-slate-900 text-slate-200 p-3 max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed border border-slate-800">
                      <pre>{GoogleAppsScriptTemplate.slice(0, 700)}...</pre>
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900 to-transparent flex items-end justify-center pb-1">
                        <span className="text-[10px] text-slate-400">
                          (Klik tombol "Salin Kode" di atas untuk menyalin seluruh kode)
                        </span>
                      </div>
                    </div>
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
                      <li>Klik <strong>Terapkan (Deploy)</strong> dan klik Izinkan Akses akun Google Anda.</li>
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
                      Salin <strong>URL Aplikasi Web</strong> yang berakhiran <code>/exec</code>, buka kembali tab <strong>"Pengaturan &amp; Sinkronisasi"</strong> di atas, dan tempelkan ke kolom URL Web App!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AKSES MULTI-DEVICE & STRUKTUR */}
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
                  5 Lembar Kerja (*Sheet*) yang Dibuat Otomatis:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-800" />
                      <p className="text-xs font-bold text-slate-900">DATA_MURID</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Menyimpan biodata lengkap 14 murid (NISN, orang tua, riwayat pendidikan, prestasi, ekskul, dan cita-cita).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <p className="text-xs font-bold text-slate-900">KONSULTASI_PERWALIAN</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Rekap permasalahan siswa setiap hari Selasa dan arahan tindak lanjut guru wali.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      <p className="text-xs font-bold text-slate-900">KOLABORASI_BK_WALAS</p>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Dokumentasi koordinasi setiap hari Jumat bersama Guru BK, Wali Kelas, dan Guru Mapel.
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

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white sm:col-span-2">
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
