import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { Student, SchoolProfile } from '../types';
import { DriveImage } from './DriveImage';
import { AppLogo } from './AppLogo';
import { Printer, Download, Copy, Check } from 'lucide-react';

interface StudentBarcodeCardProps {
  student: Student;
  profile?: SchoolProfile;
  showPrintButton?: boolean;
  compact?: boolean;
  onPrint?: () => void;
}

export const StudentBarcodeCard: React.FC<StudentBarcodeCardProps> = ({
  student,
  profile,
  showPrintButton = true,
  compact = false,
  onPrint,
}) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (barcodeRef.current && student.nisn) {
      try {
        JsBarcode(barcodeRef.current, student.nisn, {
          format: 'CODE128',
          lineColor: '#0F172A',
          width: compact ? 1.5 : 2,
          height: compact ? 36 : 48,
          displayValue: true,
          fontSize: compact ? 11 : 13,
          font: 'monospace',
          textMargin: 3,
          margin: 0,
        });
      } catch (err) {
        console.warn('JsBarcode rendering error:', err);
      }
    }
  }, [student.nisn, compact]);

  const handleCopyNisn = () => {
    navigator.clipboard.writeText(student.nisn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  };

  return (
    <div className={`relative bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden text-slate-900 ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-900 via-indigo-800 to-emerald-600" />

      {/* Header with School Logo & Name */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mt-1">
        <div className="flex items-center gap-2.5">
          <AppLogo size={compact ? 'xs' : 'sm'} />
          <div>
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-950 font-serif leading-none">
              SMK NEGERI 2 GORONTALO
            </h4>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5">
              KARTU PRESENSI DIGITAL & BARCODE MURID
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          {student.rombel}
        </span>
      </div>

      {/* Main Student Info & Photo */}
      <div className="flex items-start gap-3.5 my-3.5">
        {/* Student Photo */}
        <div className={`shrink-0 rounded-xl overflow-hidden border-2 border-slate-200 shadow-2xs bg-slate-100 ${compact ? 'w-14 h-18' : 'w-20 h-26'}`}>
          <DriveImage
            src={student.photoUrl}
            alt={student.name}
            preset="card"
            fallbackType="student"
            gender={student.gender}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Student Metadata */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
            Murid Wali No. {student.no}
          </div>
          <h3 className={`font-bold text-slate-900 truncate leading-tight ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
            {student.name}
          </h3>

          <div className="mt-1.5 space-y-0.5 text-xs text-slate-600 font-sans">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono">NISN:</span>
              <span className="font-mono font-bold text-blue-900 tracking-wide text-xs">
                {student.nisn}
              </span>
              <button
                type="button"
                onClick={handleCopyNisn}
                className="p-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                title="Salin NISN"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {student.birthPlace}, {student.birthDate}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              Wali: {profile?.homeroomTeacherName || 'Guru Wali DKV'}
            </div>
          </div>
        </div>

        {/* QR Code (Fast Mobile Camera Scanning) */}
        <div className="shrink-0 flex flex-col items-center justify-center p-1.5 bg-slate-50 rounded-xl border border-slate-200">
          <QRCodeSVG
            value={student.nisn}
            size={compact ? 52 : 68}
            level="M"
            marginSize={1}
          />
          <span className="text-[8px] font-mono text-slate-400 mt-0.5">QR PRESENSI</span>
        </div>
      </div>

      {/* 1D Linear Barcode (Code128 for Barcode Scanner Gun / Camera) */}
      <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
        <svg ref={barcodeRef} className="max-w-full" />
        <span className="text-[9px] text-slate-400 font-medium mt-1">
          Scan barcode atau QR ini di Kamera / Alat Scanner Presensi Sekolah
        </span>
      </div>

      {/* Actions (Print / Download) */}
      {showPrintButton && (
        <div className="no-print mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400">
            Cetak & bagikan kartu ini kepada murid
          </div>
          <button
            type="button"
            onClick={handleNativePrint}
            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu</span>
          </button>
        </div>
      )}
    </div>
  );
};
