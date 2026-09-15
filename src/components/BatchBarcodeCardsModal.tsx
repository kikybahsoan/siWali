import React, { useState } from 'react';
import { Student, SchoolProfile } from '../types';
import { StudentBarcodeCard } from './StudentBarcodeCard';
import { OfficialHeader } from './OfficialHeader';
import { X, Printer, Filter, CheckSquare, Square } from 'lucide-react';

interface BatchBarcodeCardsModalProps {
  students: Student[];
  profile: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const BatchBarcodeCardsModal: React.FC<BatchBarcodeCardsModalProps> = ({
  students,
  profile,
  isOpen,
  onClose,
}) => {
  const [selectedRombel, setSelectedRombel] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    students.map((s) => s.id)
  );

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) => {
    const matchRombel = selectedRombel === 'all' || s.rombel === selectedRombel;
    return matchRombel;
  });

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const printableStudents = filteredStudents.filter((s) =>
    selectedStudentIds.includes(s.id)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Kartu Barcode Presensi Murid Wali</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold">
                {printableStudents.length} Kartu Siap Cetak
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak lembaran kartu barcode & QR Code presensi untuk dibagikan kepada murid atau ditempel di kartu pelajar
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar (No Print) */}
        <div className="no-print p-3 sm:p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Rombel:
            </span>
            <select
              value={selectedRombel}
              onChange={(e) => {
                setSelectedRombel(e.target.value);
                // auto reselect all for that rombel
                const matched = students.filter(
                  (s) => e.target.value === 'all' || s.rombel === e.target.value
                );
                setSelectedStudentIds(matched.map((s) => s.id));
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white text-slate-700"
            >
              <option value="all">Semua Rombel ({students.length})</option>
              <option value="10-DKV-1">10-DKV-1</option>
              <option value="10-DKV-2">10-DKV-2</option>
              <option value="10-DKV-3">10-DKV-3</option>
              <option value="11-DKV-3">11-DKV-3</option>
            </select>

            <button
              onClick={toggleSelectAll}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5"
            >
              {selectedStudentIds.length === filteredStudents.length ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-blue-700" />
                  <span>Batal Pilih Semua</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pilih Semua</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu ({printableStudents.length})</span>
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Printable Header (Visible only on print or preview) */}
          <div className="print-only mb-4">
            <OfficialHeader
              profile={profile}
              documentTitle="LEMBAR KARTU PRESENSI & BARCODE MURID PERWALIAN"
            />
            <div className="text-center text-xs text-slate-600 mb-4">
              Gunting kartu sesuai garis batas dan berikan kepada masing-masing murid untuk presensi harian berbasis barcode/QR.
            </div>
          </div>

          {/* Cards Grid: 2 columns for print sheet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((st) => {
              const isSelected = selectedStudentIds.includes(st.id);
              return (
                <div
                  key={st.id}
                  className={`relative transition-opacity ${!isSelected ? 'opacity-40 no-print' : ''}`}
                >
                  {/* Selection Checkbox for No-Print */}
                  <button
                    type="button"
                    onClick={() => toggleStudent(st.id)}
                    className="no-print absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/90 shadow border border-slate-200 hover:bg-blue-50 text-slate-700"
                    title={isSelected ? 'Hapus dari cetak' : 'Sertakan dalam cetak'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-700" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <StudentBarcodeCard
                    student={st}
                    profile={profile}
                    compact={true}
                    showPrintButton={false}
                  />
                </div>
              );
            })}
          </div>

          {printableStudents.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Tidak ada murid yang dipilih untuk dicetak.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
