import React, { useState, useMemo } from 'react';
import { Consultation, Student, SchoolProfile } from '../types';
import {
  MessageSquareText,
  Plus,
  Printer,
  Calendar,
  Search,
  Filter,
  Trash2,
  Edit,
  X,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatIndonesianDate, getIndonesianDayName, getTodayDateString, getCurrentMonthPeriod, formatPeriod } from '../utils/formatters';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface ConsultationsViewProps {
  consultations: Consultation[];
  students: Student[];
  profile: SchoolProfile;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  onSaveConsultation: (consultation: Consultation) => void;
  onDeleteConsultation: (id: string) => void;
  onPrintConsultationReport: (period: string, studentId?: string) => void;
  isOpenNewDirectly?: boolean;
  onCloseNewDirectly?: () => void;
}

export const ConsultationsView: React.FC<ConsultationsViewProps> = ({
  consultations,
  students,
  profile,
  isAdmin = false,
  onRequireAdmin,
  onSaveConsultation,
  onDeleteConsultation,
  onPrintConsultationReport,
  isOpenNewDirectly = false,
  onCloseNewDirectly,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthPeriod());
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpenNewDirectly);
  const [editingItem, setEditingItem] = useState<Consultation | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Consultation | null>(null);

  // Form State
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formDate, setFormDate] = useState<string>(getTodayDateString());
  const [formProblem, setFormProblem] = useState<string>('');
  const [formTeacherAdvice, setFormTeacherAdvice] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Selesai' | 'Perlu Tindak Lanjut' | 'Dirujuk ke Kasus'>(
    'Selesai'
  );

  // Open Add Modal
  const handleOpenAdd = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingItem(null);
    setFormStudentId(students[0]?.id || '');
    setFormDate(getTodayDateString());
    setFormProblem('');
    setFormTeacherAdvice('');
    setFormStatus('Selesai');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Consultation) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingItem(item);
    setFormStudentId(item.studentId);
    setFormDate(item.date);
    setFormProblem(item.problem);
    setFormTeacherAdvice(item.teacherAdvice);
    setFormStatus(item.followUpStatus);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (onCloseNewDirectly) onCloseNewDirectly();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formStudentId);
    if (!st) {
      alert('Pilih murid terlebih dahulu');
      return;
    }
    if (!formProblem.trim() || !formTeacherAdvice.trim()) {
      alert('Masalah yang dibicarakan dan Saran Guru Wali wajib diisi');
      return;
    }

    const newItem: Consultation = {
      id: editingItem ? editingItem.id : `cst-${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      studentRombel: st.rombel,
      date: formDate,
      dayName: getIndonesianDayName(formDate),
      problem: formProblem.trim(),
      teacherAdvice: formTeacherAdvice.trim(),
      followUpStatus: formStatus,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    onSaveConsultation(newItem);
    handleCloseModal();
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return consultations.filter((item) => {
      const matchMonth = !selectedMonth || item.date.startsWith(selectedMonth);
      const matchStudent =
        selectedStudentFilter === 'all' || item.studentId === selectedStudentFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.studentName.toLowerCase().includes(query) ||
        item.problem.toLowerCase().includes(query) ||
        item.teacherAdvice.toLowerCase().includes(query);
      return matchMonth && matchStudent && matchQuery;
    });
  }, [consultations, selectedMonth, selectedStudentFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-amber-600" />
              Laporan Pelaksanaan Konsultasi Perwalian
            </h2>
            <p className="text-xs text-slate-600">
              Dokumentasi bimbingan dan tindak lanjut personal murid wali DKV
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              id="print-consultation-report-btn"
              onClick={() => onPrintConsultationReport(selectedMonth, selectedStudentFilter === 'all' ? undefined : selectedStudentFilter)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-900 text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              Cetak Laporan Bulanan
            </button>

            <button
              id="add-consultation-btn"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              title={isAdmin ? 'Catat konsultasi baru' : 'Masuk Admin untuk catat konsultasi'}
            >
              <Plus className="w-4 h-4" />
              + Catat Konsultasi
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          {/* Period Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Periode Bulan & Tahun:
            </label>
            <input
              id="consultation-period-filter"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter Nama Murid Wali:
            </label>
            <select
              id="consultation-student-filter"
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="all">Semua Murid (14 Siswa)</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.rombel})
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Cari Kata Kunci:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari masalah/saran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Period Banner Info */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          Menampilkan <strong>{filteredList.length}</strong> catatan konsultasi periode{' '}
          <strong className="text-blue-900">{formatPeriod(selectedMonth)}</strong>
        </span>
        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth('')}
            className="text-blue-700 hover:underline font-semibold"
          >
            Tampilkan Semua Periode
          </button>
        )}
      </div>

      {/* Mobile-first Cards List & Desktop Table */}
      <div className="space-y-3">
        {filteredList.map((item, index) => (
          <div
            key={item.id}
            id={`consultation-card-${item.id}`}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Date, Student Name, Rombel, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{item.studentName}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-semibold">
                        {item.studentRombel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>
                        {item.dayName}, {formatIndonesianDate(item.date)}
                      </span>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.followUpStatus === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.followUpStatus === 'Perlu Tindak Lanjut'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {item.followUpStatus}
                </span>
              </div>

              {/* Problem Content */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">
                    Masalah yang Dibicarakan:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{item.problem}</p>
                </div>

                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-950 block mb-1">
                    Saran Guru Wali / Tindak Lanjut:
                  </span>
                  <p className="text-blue-900 leading-relaxed">{item.teacherAdvice}</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Guru Wali: {profile.homeroomTeacherName}
              </span>
              {isAdmin ? (
                <div className="flex items-center gap-1.5">
                  <button
                    id={`edit-consultation-${item.id}`}
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 px-2.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    id={`delete-consultation-${item.id}`}
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus Catatan Konsultasi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
          <p className="text-sm font-semibold">Belum ada catatan konsultasi pada filter ini.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 rounded-xl bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Tambah Konsultasi Sekarang
          </button>
        </div>
      )}

      {/* MODAL: ADD / EDIT KONSULTASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingItem ? 'Edit Catatan Konsultasi' : 'Catat Konsultasi Perwalian Baru'}
                </h3>
                <p className="text-xs text-slate-300">
                  Laporan Pelaksanaan Konsultasi Perwalian — SMKN 2 Gorontalo
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Murid Wali (14 Siswa DKV) *
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — ({st.rombel}) • NISN: {st.nisn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Konsultasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hari (Otomatis)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={getIndonesianDayName(formDate)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Masalah yang Dibicarakan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formProblem}
                  onChange={(e) => setFormProblem(e.target.value)}
                  placeholder="Deskripsikan masalah akademik, kehadiran, minat bakat, atau kendala pribadi siswa..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Saran Guru Wali / Tindak Lanjut *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formTeacherAdvice}
                  onChange={(e) => setFormTeacherAdvice(e.target.value)}
                  placeholder="Solusi, arahan, jadwal monitoring, atau kesepakatan bersama siswa..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Tindak Lanjut
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Selesai">Selesai (Tuntaskan di Bimbingan)</option>
                  <option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut Lanjutan</option>
                  <option value="Dirujuk ke Kasus">Dirujuk ke Kasus SOP Khusus</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      const it = editingItem;
                      handleCloseModal();
                      setItemToDelete(it);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Hapus catatan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                  >
                    Batal
                  </button>
                  <button
                    id="save-consultation-submit-btn"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold shadow-md"
                  >
                    {editingItem ? 'Perbarui Catatan' : 'Simpan Konsultasi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title="Hapus Catatan Konsultasi"
        message="Apakah Anda yakin ingin menghapus catatan bimbingan dan konsultasi perwalian ini? Data yang dihapus tidak dapat dikembalikan."
        itemName={itemToDelete ? `${itemToDelete.studentName} (${itemToDelete.studentRombel}) - Masalah: ${itemToDelete.problem}` : undefined}
        confirmLabel="Ya, Hapus Catatan"
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteConsultation(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
