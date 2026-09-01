import React, { useState, useMemo } from 'react';
import {
  Collaboration,
  Student,
  CollaboratorType,
  CollaborationFormType,
  SchoolProfile,
} from '../types';
import {
  UsersRound,
  Plus,
  Printer,
  Calendar,
  Search,
  Trash2,
  Edit,
  X,
  CheckSquare,
  Square,
  CheckCircle2,
} from 'lucide-react';
import { formatIndonesianDate, getIndonesianDayName, getTodayDateString, getCurrentMonthPeriod, formatPeriod } from '../utils/formatters';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

const COLLABORATOR_OPTIONS: CollaboratorType[] = [
  'Guru BK',
  'Wali Kelas',
  'Guru Mapel',
  'Lainnya',
];

const COLLABORATION_FORM_OPTIONS: CollaborationFormType[] = [
  'Permintaan informasi akademik',
  'Diskusi hasil asesmen psikologis',
  'Observasi perilaku berisiko',
  'Konsultasi perkembangan/masalah',
  'Penanganan/rujukan kasus',
  'Penyusunan program bimbingan',
  'Lainnya',
];

interface CollaborationsViewProps {
  collaborations: Collaboration[];
  students: Student[];
  profile: SchoolProfile;
  onSaveCollaboration: (collab: Collaboration) => void;
  onDeleteCollaboration: (id: string) => void;
  onPrintCollaborationReport: (period: string, studentId?: string) => void;
  isOpenNewDirectly?: boolean;
  onCloseNewDirectly?: () => void;
}

export const CollaborationsView: React.FC<CollaborationsViewProps> = ({
  collaborations,
  students,
  profile,
  onSaveCollaboration,
  onDeleteCollaboration,
  onPrintCollaborationReport,
  isOpenNewDirectly = false,
  onCloseNewDirectly,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthPeriod());
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpenNewDirectly);
  const [editingItem, setEditingItem] = useState<Collaboration | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Collaboration | null>(null);

  // Form State
  const [formDate, setFormDate] = useState<string>(getTodayDateString());
  const [formCollaborators, setFormCollaborators] = useState<CollaboratorType[]>(['Guru BK']);
  const [formCollaboratorOther, setFormCollaboratorOther] = useState<string>('');
  const [formForms, setFormForms] = useState<CollaborationFormType[]>([
    'Konsultasi perkembangan/masalah',
  ]);
  const [formFormOther, setFormFormOther] = useState<string>('');
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formProblemDetails, setFormProblemDetails] = useState<string>('');
  const [formFollowUpPlan, setFormFollowUpPlan] = useState<string>('');

  // Handle open add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormDate(getTodayDateString());
    setFormCollaborators(['Guru BK']);
    setFormCollaboratorOther('');
    setFormForms(['Konsultasi perkembangan/masalah']);
    setFormFormOther('');
    setFormStudentId(students[0]?.id || '');
    setFormProblemDetails('');
    setFormFollowUpPlan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Collaboration) => {
    setEditingItem(item);
    setFormDate(item.date);
    setFormCollaborators(item.collaborators || []);
    setFormCollaboratorOther(item.collaboratorOther || '');
    setFormForms(item.forms || []);
    setFormFormOther(item.formOther || '');
    setFormStudentId(item.studentId);
    setFormProblemDetails(item.problemDetails);
    setFormFollowUpPlan(item.followUpPlan || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (onCloseNewDirectly) onCloseNewDirectly();
  };

  const toggleCollaborator = (collab: CollaboratorType) => {
    if (formCollaborators.includes(collab)) {
      setFormCollaborators(formCollaborators.filter((c) => c !== collab));
    } else {
      setFormCollaborators([...formCollaborators, collab]);
    }
  };

  const toggleForm = (formType: CollaborationFormType) => {
    if (formForms.includes(formType)) {
      setFormForms(formForms.filter((f) => f !== formType));
    } else {
      setFormForms([...formForms, formType]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formStudentId);
    if (!st) {
      alert('Pilih sasaran murid wali terlebih dahulu');
      return;
    }
    if (formCollaborators.length === 0) {
      alert('Pilih minimal satu pihak kolaborator (Guru BK, Walas, atau Mapel)');
      return;
    }
    if (formForms.length === 0) {
      alert('Pilih minimal satu bentuk kolaborasi');
      return;
    }
    if (!formProblemDetails.trim()) {
      alert('Deskripsi sasaran murid dan masalahnya wajib diisi');
      return;
    }

    const newItem: Collaboration = {
      id: editingItem ? editingItem.id : `col-${Date.now()}`,
      date: formDate,
      dayName: getIndonesianDayName(formDate),
      collaborators: formCollaborators,
      collaboratorOther: formCollaboratorOther.trim(),
      forms: formForms,
      formOther: formFormOther.trim(),
      studentId: st.id,
      studentName: st.name,
      studentRombel: st.rombel,
      problemDetails: formProblemDetails.trim(),
      followUpPlan: formFollowUpPlan.trim(),
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    onSaveCollaboration(newItem);
    handleCloseModal();
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return collaborations.filter((item) => {
      const matchMonth = !selectedMonth || item.date.startsWith(selectedMonth);
      const matchStudent =
        selectedStudentFilter === 'all' || item.studentId === selectedStudentFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.studentName.toLowerCase().includes(query) ||
        (item.collaborators || []).join(' ').toLowerCase().includes(query) ||
        (item.forms || []).join(' ').toLowerCase().includes(query) ||
        item.problemDetails.toLowerCase().includes(query);
      return matchMonth && matchStudent && matchQuery;
    });
  }, [collaborations, selectedMonth, selectedStudentFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <UsersRound className="w-5 h-5 text-emerald-600" />
              Laporan Kolaborasi dengan Guru BK, Wali Kelas, Guru Mapel
            </h2>
            <p className="text-xs text-slate-600">
              Koordinasi terpadu penanganan perkembangan belajar dan karakter murid wali
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              id="print-collaboration-report-btn"
              onClick={() => onPrintCollaborationReport(selectedMonth, selectedStudentFilter === 'all' ? undefined : selectedStudentFilter)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-900 text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              Cetak Laporan Bulanan
            </button>

            <button
              id="add-collaboration-btn"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              + Catat Kolaborasi
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Periode Bulan & Tahun:
            </label>
            <input
              id="collab-period-filter"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter Sasaran Murid:
            </label>
            <select
              id="collab-student-filter"
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-600 font-medium"
            >
              <option value="all">Semua Murid (14 Siswa)</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.rombel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Cari Kata Kunci:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kolaborator/masalah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-600 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Period Banner Info */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          Menampilkan <strong>{filteredList.length}</strong> catatan kolaborasi periode{' '}
          <strong className="text-emerald-800">{formatPeriod(selectedMonth)}</strong>
        </span>
        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth('')}
            className="text-emerald-700 hover:underline font-semibold"
          >
            Tampilkan Semua Periode
          </button>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-3.5">
        {filteredList.map((item, index) => (
          <div
            key={item.id}
            id={`collab-card-${item.id}`}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{item.studentName}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
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

                <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                  {item.collaborators.map((collab) => (
                    <span
                      key={collab}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                    >
                      {collab === 'Lainnya' && item.collaboratorOther
                        ? item.collaboratorOther
                        : collab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges of Forms of Collaboration */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.forms.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-medium border border-blue-100"
                  >
                    • {f === 'Lainnya' && item.formOther ? item.formOther : f}
                  </span>
                ))}
              </div>

              {/* Problem Details and Follow up */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">
                    Sasaran Murid Wali & Masalahnya:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{item.problemDetails}</p>
                </div>

                {item.followUpPlan && (
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-950 block mb-1">
                      Rencana Tindak Lanjut Kolaborasi:
                    </span>
                    <p className="text-emerald-900 leading-relaxed">{item.followUpPlan}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Guru Wali: {profile.homeroomTeacherName}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  id={`edit-collab-${item.id}`}
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 px-2.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  id={`delete-collab-${item.id}`}
                  onClick={() => setItemToDelete(item)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Hapus Catatan Kolaborasi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
          <p className="text-sm font-semibold">Belum ada catatan kolaborasi pada filter ini.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Tambah Kolaborasi Sekarang
          </button>
        </div>
      )}

      {/* MODAL: ADD / EDIT KOLABORASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingItem ? 'Edit Catatan Kolaborasi' : 'Catat Kolaborasi Baru'}
                </h3>
                <p className="text-xs text-slate-300">
                  Laporan Kolaborasi dengan Guru BK, Wali Kelas, Guru Mapel — SMKN 2 Gorontalo
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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hari/Tanggal Kolaborasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
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

              {/* Checkboxes: Kolaborator */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-2">
                  1. Pihak Kolaborator (Multi-Pilih): *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COLLABORATOR_OPTIONS.map((collab) => {
                    const isChecked = formCollaborators.includes(collab);
                    return (
                      <button
                        key={collab}
                        type="button"
                        onClick={() => toggleCollaborator(collab)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                          isChecked
                            ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs">{collab}</span>
                      </button>
                    );
                  })}
                </div>
                {formCollaborators.includes('Lainnya') && (
                  <input
                    type="text"
                    placeholder="Sebutkan kolaborator lainnya (contoh: Kepala Program, Orang Tua)"
                    value={formCollaboratorOther}
                    onChange={(e) => setFormCollaboratorOther(e.target.value)}
                    className="mt-2 w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                )}
              </div>

              {/* Checkboxes: Bentuk Kolaborasi */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-2">
                  2. Bentuk Kolaborasi (Multi-Pilih): *
                </label>
                <div className="space-y-1.5">
                  {COLLABORATION_FORM_OPTIONS.map((formType) => {
                    const isChecked = formForms.includes(formType);
                    return (
                      <button
                        key={formType}
                        type="button"
                        onClick={() => toggleForm(formType)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                          isChecked
                            ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-700 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs">{formType}</span>
                      </button>
                    );
                  })}
                </div>
                {formForms.includes('Lainnya') && (
                  <input
                    type="text"
                    placeholder="Sebutkan bentuk kolaborasi lainnya..."
                    value={formFormOther}
                    onChange={(e) => setFormFormOther(e.target.value)}
                    className="mt-2 w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                  />
                )}
              </div>

              {/* Sasaran Murid Wali */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Sasaran Murid Wali *
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 bg-slate-50 font-medium"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — ({st.rombel}) • NISN: {st.nisn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Masalahnya */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. Masalah yang Dibahas & Catatan Temuan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formProblemDetails}
                  onChange={(e) => setFormProblemDetails(e.target.value)}
                  placeholder="Detail hasil observasi, data akademik, atau perilaku murid yang dibahas..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Rencana Tindak Lanjut */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  5. Kesepakatan / Rencana Tindak Lanjut Bersama
                </label>
                <textarea
                  rows={2}
                  value={formFollowUpPlan}
                  onChange={(e) => setFormFollowUpPlan(e.target.value)}
                  placeholder="Langkah bersama yang akan dilakukan oleh guru wali dan kolaborator..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Actions Footer */}
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
                    title="Hapus kolaborasi ini"
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
                    id="save-collab-submit-btn"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md"
                  >
                    {editingItem ? 'Perbarui Kolaborasi' : 'Simpan Kolaborasi'}
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
        title="Hapus Catatan Kolaborasi"
        message="Apakah Anda yakin ingin menghapus catatan kolaborasi ini? Data yang dihapus tidak dapat dikembalikan."
        itemName={itemToDelete ? `${itemToDelete.studentName} (${itemToDelete.studentRombel}) - Pihak: ${itemToDelete.collaborators?.join(', ')}` : undefined}
        confirmLabel="Ya, Hapus Kolaborasi"
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteCollaboration(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
