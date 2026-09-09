import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Student, AttendanceRecord, AttendanceStatus, AttendanceSession, SchoolProfile } from '../types';
import { StorageService } from '../services/storage';
import { SheetsSyncService } from '../services/sheetsSync';
import { getIndonesianDayName, getTodayDateString, formatIndonesianDate } from '../utils/formatters';
import { DriveImage } from '../components/DriveImage';
import { BatchBarcodeCardsModal } from '../components/BatchBarcodeCardsModal';
import { StudentBarcodeCard } from '../components/StudentBarcodeCard';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  Printer,
  RefreshCw,
  Search,
  ExternalLink,
  CloudCheck,
  CloudOff,
  Keyboard,
  Check,
  Users,
  X,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AttendanceScannerViewProps {
  students: Student[];
  profile: SchoolProfile;
  attendances: AttendanceRecord[];
  onAttendanceUpdated: (records: AttendanceRecord[]) => void;
  onNavigateToRecap: () => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

// Synthesize pleasant chime using Web Audio API
function playChime(isSuccess: boolean = true) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isSuccess) {
      // Pleasant two-tone ascending chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.36);
    } else {
      // Low buzz for warning/error
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.26);
    }
  } catch (e) {
    // AudioContext blocked by browser policy until gesture
  }
}

// Speech synthesis Indonesian announcement
function speakStudentName(name: string, status: string) {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${name}, ${status}`);
      utterance.lang = 'id-ID';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // Speech synthesis unavailable
  }
}

export const AttendanceScannerView: React.FC<AttendanceScannerViewProps> = ({
  students,
  profile,
  attendances,
  onAttendanceUpdated,
  onNavigateToRecap,
  isAdmin,
  onRequireAdmin,
}) => {
  // Scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceAnnounce, setVoiceAnnounce] = useState<boolean>(true);

  // Form controls for scan session
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('Hadir');
  const [selectedSession, setSelectedSession] = useState<AttendanceSession>('Pembiasaan Pagi / KBM');
  const [manualInput, setManualInput] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Last scanned student feedback card
  const [lastScannedRecord, setLastScannedRecord] = useState<AttendanceRecord | null>(null);
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [scanNotice, setScanNotice] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Card modal state
  const [isBatchCardsOpen, setIsBatchCardsOpen] = useState<boolean>(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Today's attendances
  const todayAttendances = useMemo(() => {
    return attendances.filter((a) => a.date === todayStr);
  }, [attendances, todayStr]);

  // Today's summary counts
  const todayStats = useMemo(() => {
    const present = todayAttendances.filter((a) => a.status === 'Hadir').length;
    const late = todayAttendances.filter((a) => a.status === 'Terlambat').length;
    const sick = todayAttendances.filter((a) => a.status === 'Sakit').length;
    const permission = todayAttendances.filter((a) => a.status === 'Izin').length;
    const total = todayAttendances.length;
    const percentage = students.length > 0 ? Math.round(((present + late) / students.length) * 100) : 0;
    return { present, late, sick, permission, total, percentage };
  }, [todayAttendances, students.length]);

  // List of students not yet scanned today
  const pendingStudents = useMemo(() => {
    const scannedIds = new Set(todayAttendances.map((a) => a.studentId));
    return students.filter((s) => !scannedIds.has(s.id));
  }, [students, todayAttendances]);

  // Filtered students for quick manual attendance click
  const filteredQuickStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        s.rombel.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  // Handle successful match and attendance recording
  const handleStudentMatch = async (matchedStudent: Student, rawCode: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const dayName = getIndonesianDayName(todayStr);

    // Default status logic: if after 07:15 and user selected Hadir, auto detect if late or keep selected
    let effectiveStatus = selectedStatus;
    if (selectedStatus === 'Hadir' && now.getHours() >= 7 && now.getMinutes() > 15) {
      // Auto-tag late if morning session past 07:15
      effectiveStatus = 'Terlambat';
    }

    const newRecord: AttendanceRecord = {
      id: `att-${todayStr}-${matchedStudent.id}`,
      studentId: matchedStudent.id,
      studentName: matchedStudent.name,
      nisn: matchedStudent.nisn,
      rombel: matchedStudent.rombel,
      date: todayStr,
      dayName,
      time: timeStr,
      session: selectedSession,
      status: effectiveStatus,
      method: 'Barcode / QR Scan',
      notes: effectiveStatus === 'Terlambat' ? 'Terlambat hadir setelah 07:15' : 'Presensi Barcode Tepat Waktu',
      photoUrl: matchedStudent.photoUrl,
      scannedAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Save to local storage
    const { updatedList, isNew } = StorageService.recordAttendance(newRecord);
    onAttendanceUpdated(updatedList);

    // Visual and Audio feedback
    setLastScannedRecord(newRecord);
    setLastScannedStudent(matchedStudent);

    if (soundEnabled) playChime(true);
    if (voiceAnnounce) speakStudentName(matchedStudent.name, effectiveStatus);

    setScanNotice({
      type: 'success',
      text: `${matchedStudent.name} (${matchedStudent.nisn}) berhasil dicatat sebagai [${effectiveStatus}] pada pukul ${timeStr}!`,
    });

    // Auto sync to Google Spreadsheet
    if (SheetsSyncService.isConfigured()) {
      setSyncNotice('Menyinkronkan ke Google Spreadsheet...');
      try {
        const res = await SheetsSyncService.syncAttendanceRecord(newRecord);
        if (res.success) {
          setSyncNotice('Otomatis tersimpan & terekap di Google Spreadsheet!');
        } else {
          setSyncNotice(res.message);
        }
      } catch (err: any) {
        setSyncNotice('Tersimpan di database lokal (sinkron offline).');
      }
    } else {
      setSyncNotice('Tersimpan di database lokal browser.');
    }

    setTimeout(() => {
      setSyncNotice(null);
    }, 4000);
  };

  // Find student by decoded text (NISN, Barcode, or ID)
  const processDecodedText = (decodedText: string) => {
    const cleanText = decodedText.trim();
    if (!cleanText) return;

    // Debounce duplicate scans within 2.5 seconds
    const nowTime = Date.now();
    if (
      cleanText === lastScannedCodeRef.current &&
      nowTime - lastScanTimeRef.current < 2500
    ) {
      return;
    }
    lastScannedCodeRef.current = cleanText;
    lastScanTimeRef.current = nowTime;

    // Try finding student by NISN, ID, or embedded string
    let foundStudent = students.find((s) => s.nisn === cleanText || s.id === cleanText);

    if (!foundStudent) {
      // Check if code contains prefix like "SIWALI:0078912345" or "NISN:0078912345"
      const match = cleanText.match(/\d{8,12}/);
      if (match) {
        const extractedNisn = match[0];
        foundStudent = students.find((s) => s.nisn === extractedNisn);
      }
    }

    if (!foundStudent) {
      // Try searching by name if input
      foundStudent = students.find(
        (s) => s.name.toLowerCase() === cleanText.toLowerCase()
      );
    }

    if (foundStudent) {
      handleStudentMatch(foundStudent, cleanText);
    } else {
      if (soundEnabled) playChime(false);
      setScanNotice({
        type: 'warning',
        text: `Barcode / NISN "${cleanText}" tidak terdaftar pada data 14 murid binaan. Silakan periksa kembali kartu siswa.`,
      });
    }
  };

  // Start Html5Qrcode scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-code-scanner-reader');
      }

      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setCameraError('Kamera tidak terdeteksi pada perangkat ini. Anda dapat menggunakan mode Input Barcode / NISN manual di bawah.');
        return;
      }

      setAvailableCameras(devices.map((d) => ({ id: d.id, label: d.label || `Kamera ${d.id}` })));
      const cameraIdToUse = selectedCameraId || devices[devices.length - 1].id; // Prefer back camera
      setSelectedCameraId(cameraIdToUse);

      await html5QrCodeRef.current.start(
        cameraIdToUse,
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
          ],
        },
        (decodedText) => {
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            processDecodedText(decodedText);
            setTimeout(() => {
              isProcessingRef.current = false;
            }, 1000);
          }
        },
        () => {
          // Ignore parse errors per frame
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setCameraError(
        `Izin kamera belum aktif atau diblokir: ${err.message || 'Periksa izin kamera browser'}. Silakan gunakan Input Barcode Manual atau pilih murid langsung.`
      );
      setIsCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current && isCameraActive) {
      try {
        await html5QrCodeRef.current.stop();
        setIsCameraActive(false);
      } catch (err) {
        console.error('Failed to stop camera', err);
      }
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle manual / USB barcode gun input submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processDecodedText(manualInput.trim());
    setManualInput('');
    if (manualInputRef.current) {
      manualInputRef.current.focus();
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-blue-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Camera className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Presensi Digital Cepat</span>
              </span>
              <span className="text-xs text-emerald-200/80">
                {getIndonesianDayName(todayStr)}, {formatIndonesianDate(todayStr)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Scan Barcode & QR Daftar Hadir Murid
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Arahkan kartu barcode/QR siswa ke kamera atau gunakan pemindai barcode USB. Kehadiran akan otomatis terekap ke Google Spreadsheet perwalian secara real-time.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsBatchCardsOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/20 flex items-center gap-2 shadow-xs"
              title="Buka & Cetak Kartu Barcode untuk seluruh murid"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak Kartu Barcode Siswa</span>
            </button>

            <button
              onClick={onNavigateToRecap}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Buka Rekap Kehadiran</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Google Sheets Sync Notification */}
      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-slide-down">
          <div className="flex items-center gap-2.5">
            <CloudCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-mono">
            Sheet: KEHADIRAN_MURID
          </span>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Hadir</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {todayStats.present}
            <span className="text-xs font-normal text-slate-500 ml-1">/ {students.length}</span>
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Tingkat Kehadiran</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{todayStats.percentage}%</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Terlambat</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{todayStats.late}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Sakit / Izin</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{todayStats.sick + todayStats.permission}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Belum Presensi</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{pendingStudents.length}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status Sync</p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-1">
            <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{SheetsSyncService.isConfigured() ? 'Spreadsheet Siap' : 'Database Lokal'}</span>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Camera Viewport & Scan Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            {/* Control Bar: Status, Session & Camera toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700">Tandai Sebagai:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AttendanceStatus)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Hadir">Hadir Tepat Waktu</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Dispensasi">Dispensasi</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700">Sesi:</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value as AttendanceSession)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Pembiasaan Pagi / KBM">Pembiasaan Pagi / KBM</option>
                  <option value="Sholat Dhuha / Dzuhur">Sholat Dhuha / Dzuhur</option>
                  <option value="Ekstrakurikuler / Kegiatan Sore">Ekstrakurikuler / Sore</option>
                </select>
              </div>

              {/* Sound / Voice Toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    soundEnabled
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                  title={soundEnabled ? 'Suara Chime Aktif' : 'Suara Dimatikan'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Camera Viewport */}
            <div className="mt-4">
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[380px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700">
                {/* Scanner container for html5-qrcode */}
                <div
                  id="qr-code-scanner-reader"
                  className={`w-full max-w-md ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {!isCameraActive && (
                  <div className="p-8 text-center flex flex-col items-center justify-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-white font-bold text-base">Kamera Pemindai Siap</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Aktifkan kamera untuk mulai memindai kartu barcode atau QR siswa secara otomatis.
                    </p>

                    <button
                      onClick={startCamera}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Nyalakan Kamera Scanner</span>
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-semibold text-emerald-300">Kamera Sedang Memindai...</span>
                    </div>

                    <button
                      onClick={stopCamera}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <CameraOff className="w-3.5 h-3.5" />
                      <span>Matikan Kamera</span>
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Info Akses Kamera:</p>
                    <p className="mt-0.5">{cameraError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Barcode / USB Gun Input Field */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <form onSubmit={handleManualSubmit} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5 text-blue-700" />
                    <span>Input Barcode Manual / USB Scanner Gun:</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Tekan Enter setelah scan/ketik</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={manualInputRef}
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Scan dengan USB barcode scanner atau ketik NISN murid..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Presensi</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Notice Banner */}
          {scanNotice && (
            <div
              className={`p-4 rounded-xl border text-xs font-semibold flex items-start justify-between shadow-xs transition-all ${
                scanNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {scanNotice.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <span>{scanNotice.text}</span>
              </div>
              <button
                onClick={() => setScanNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Col (5 cols): Last Scanned Student Feedback & Today's Attendance Feed */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Last Scanned Student Detail */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Kartu Murid Terakhir Terpindai</span>
              </h3>
              {lastScannedRecord && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Terverifikasi
                </span>
              )}
            </div>

            {lastScannedStudent && lastScannedRecord ? (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-emerald-300 shadow-xs">
                    {lastScannedStudent.photoUrl ? (
                      <DriveImage
                        src={lastScannedStudent.photoUrl}
                        alt={lastScannedStudent.name}
                        preset="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">
                        {lastScannedStudent.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {lastScannedStudent.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      NISN: {lastScannedStudent.nisn} • {lastScannedStudent.rombel}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          lastScannedRecord.status === 'Hadir'
                            ? 'bg-emerald-600 text-white'
                            : lastScannedRecord.status === 'Terlambat'
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {lastScannedRecord.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {lastScannedRecord.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Metode: {lastScannedRecord.method}</span>
                  <button
                    onClick={() => setSelectedStudentForCard(lastScannedStudent)}
                    className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                  >
                    <span>Lihat Kartu Barcode</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">Belum ada murid yang dipindai pada sesi ini.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Arahkan barcode atau klik nama murid di bawah.</p>
              </div>
            )}
          </div>

          {/* Today's Scanned Students Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>Riwayat Hadir Hari Ini ({todayAttendances.length})</span>
              </h3>
              <button
                onClick={onNavigateToRecap}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                Lihat Semua
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {todayAttendances.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Belum ada presensi tercatat untuk hari ini.
                </p>
              ) : (
                todayAttendances.map((att) => {
                  const statusColor =
                    att.status === 'Hadir'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : att.status === 'Terlambat'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  return (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/80 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                          {att.studentName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{att.studentName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {att.time} • {att.rombel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor}`}>
                          {att.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick 1-Click Manual Attendance Drawer / Table for all 14 Students */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-800" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Presensi Cepat 14 Murid Binaan (Tanpa Kamera)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Jika kartu murid tertinggal atau kamera tidak tersedia, klik tombol status untuk mencatat kehadiran langsung.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Cari nama / NISN murid..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredQuickStudents.map((st) => {
            const todayRecord = todayAttendances.find((a) => a.studentId === st.id);
            const isScanned = Boolean(todayRecord);

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isScanned
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {st.photoUrl ? (
                      <DriveImage
                        src={st.photoUrl}
                        alt={st.name}
                        preset="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600">
                        {st.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{st.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {st.nisn} • {st.rombel}
                    </p>
                    {isScanned && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        {todayRecord?.status} ({todayRecord?.time})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleStudentMatch(st, st.nisn)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                    title="Tandai Hadir"
                  >
                    <Check className="w-3 h-3" />
                    <span>Hadir</span>
                  </button>

                  <button
                    onClick={() => setSelectedStudentForCard(st)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                    title="Buka Kartu Barcode Siswa"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Barcode Cards Modal */}
      <BatchBarcodeCardsModal
        isOpen={isBatchCardsOpen}
        onClose={() => setIsBatchCardsOpen(false)}
        students={students}
        profile={profile}
      />

      {/* Single Student Barcode Card Modal */}
      {selectedStudentForCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Kartu Identitas & Barcode</h3>
              <button
                onClick={() => setSelectedStudentForCard(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center">
              <StudentBarcodeCard
                student={selectedStudentForCard}
                profile={profile}
                onPrint={() => window.print()}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedStudentForCard(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
