import React, { useState, useMemo } from 'react';
import {
  Student,
  RombelType,
  GenderType,
  EducationHistory,
  Achievement,
  Extracurricular,
  SchoolProfile,
} from '../types';
import {
  Search,
  Plus,
  Printer,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Compass,
  X,
  PlusCircle,
  Eye,
  Image as ImageIcon,
  HelpCircle,
  User,
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/formatters';
import { DriveImage } from '../components/DriveImage';
import { DRIVE_GUIDE_STEPS } from '../utils/imageHelper';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface StudentsViewProps {
  students: Student[];
  profile?: SchoolProfile;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onPrintStudent: (student: Student) => void;
  isOpenNewDirectly?: boolean;
  onCloseNewDirectly?: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  profile,
  onSaveStudent,
  onDeleteStudent,
  onPrintStudent,
  isOpenNewDirectly = false,
  onCloseNewDirectly,
}) => {
  const [selectedRombel, setSelectedRombel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [activeFormTab, setActiveFormTab] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [showDriveGuide, setShowDriveGuide] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpenNewDirectly) {
      handleOpenCreateNew();
      if (onCloseNewDirectly) onCloseNewDirectly();
    }
  }, [isOpenNewDirectly]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchRombel = selectedRombel === 'all' || s.rombel === selectedRombel;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.nisn.includes(query) ||
        s.address.toLowerCase().includes(query) ||
        (s.fatherName && s.fatherName.toLowerCase().includes(query)) ||
        (s.motherName && s.motherName.toLowerCase().includes(query));
      return matchRombel && matchSearch;
    });
  }, [students, selectedRombel, searchQuery]);

  // Handle open create new form
  const handleOpenCreateNew = () => {
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      no: students.length + 1,
      // 1. Identitas Murid
      name: '',
      nickname: '',
      nisn: '',
      birthPlace: 'Gorontalo',
      birthDate: '',
      tempatTanggalLahir: '',
      rombel: '10-DKV-1',
      gender: 'L',
      religion: 'Islam',
      address: '',
      statusKelahiran: '',
      birthOrder: 1,
      totalSiblings: 1,
      phone: '',
      socialMedia: '',
      penyakitKronis: '',
      chronicIllnessHistory: [],

      // 2. Identitas Orang Tua / Wali
      fatherName: '',
      fatherJob: '',
      fatherEthnicity: 'Gorontalo',
      fatherRelation: 'Kandung',
      motherName: '',
      motherJob: '',
      motherEthnicity: 'Gorontalo',
      motherRelation: 'Kandung',
      guardianName: '',
      guardianJob: '',
      guardianRelation: '',
      parentPhone: '',
      siblingPhone: '',
      neighborPhone: '',

      // 3. Riwayat Pendidikan & Prestasi
      tkNama: '',
      tkTahunMasuk: '',
      tkTahunKeluar: '',
      tkLamaBelajar: '',
      sdNama: '',
      sdTahunMasuk: '',
      sdTahunKeluar: '',
      sdLamaBelajar: '',
      smpNama: '',
      smpTahunMasuk: '',
      smpTahunKeluar: '',
      smpLamaBelajar: '',
      prestasiSD: '',
      prestasiSMP: '',
      ekstrakurikuler: '',

      // 4. Cita-cita & Minat / Aspirasi
      careerGoals: ['', ''],
      furtherStudyAspiration: '',
      masteredSubjects: ['', '', ''],
      strugglingSubjects: ['', '', ''],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingStudent(newStudent);
    setIsCreatingNew(true);
    setActiveFormTab('A');
  };

  const handleOpenEdit = (student: Student) => {
    const cloned = JSON.parse(JSON.stringify(student));
    if (!cloned.tkNama && cloned.educationHistory) {
      const tk = cloned.educationHistory.find((e: any) => e.level === 'TK');
      if (tk) {
        cloned.tkNama = tk.schoolName;
        cloned.tkTahunMasuk = tk.entryYear;
        cloned.tkTahunKeluar = tk.gradYear;
        cloned.tkLamaBelajar = tk.duration;
      }
    }
    if (!cloned.sdNama && cloned.educationHistory) {
      const sd = cloned.educationHistory.find((e: any) => e.level === 'SD');
      if (sd) {
        cloned.sdNama = sd.schoolName;
        cloned.sdTahunMasuk = sd.entryYear;
        cloned.sdTahunKeluar = sd.gradYear;
        cloned.sdLamaBelajar = sd.duration;
      }
    }
    if (!cloned.smpNama && cloned.educationHistory) {
      const smp = cloned.educationHistory.find((e: any) => e.level === 'SMP');
      if (smp) {
        cloned.smpNama = smp.schoolName;
        cloned.smpTahunMasuk = smp.entryYear;
        cloned.smpTahunKeluar = smp.gradYear;
        cloned.smpLamaBelajar = smp.duration;
      }
    }
    if (!cloned.ekstrakurikuler && cloned.extracurriculars?.length) {
      cloned.ekstrakurikuler = cloned.extracurriculars.map((e: any) => e.name).join(', ');
    }
    if (!cloned.prestasiSMP && cloned.achievements?.length) {
      cloned.prestasiSMP = cloned.achievements.map((a: any) => `${a.title} (${a.year})`).join(', ');
    }
    if (!cloned.statusKelahiran && cloned.birthOrder) {
      cloned.statusKelahiran = `Anak ke ${cloned.birthOrder} dari ${cloned.totalSiblings || 1} bersaudara`;
    }
    if (!cloned.penyakitKronis && cloned.chronicIllnessHistory?.length) {
      cloned.penyakitKronis = cloned.chronicIllnessHistory.join(', ');
    }
    setEditingStudent(cloned);
    setIsCreatingNew(false);
    setActiveFormTab('A');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editingStudent.name.trim()) {
      alert('Nama lengkap murid wajib diisi.');
      return;
    }

    const updatedEdu: EducationHistory[] = (
      [
        {
          level: 'TK' as const,
          schoolName: editingStudent.tkNama || '',
          entryYear: editingStudent.tkTahunMasuk || '',
          gradYear: editingStudent.tkTahunKeluar || '',
          duration: editingStudent.tkLamaBelajar || '',
        },
        {
          level: 'SD' as const,
          schoolName: editingStudent.sdNama || '',
          entryYear: editingStudent.sdTahunMasuk || '',
          gradYear: editingStudent.sdTahunKeluar || '',
          duration: editingStudent.sdLamaBelajar || '',
        },
        {
          level: 'SMP' as const,
          schoolName: editingStudent.smpNama || '',
          entryYear: editingStudent.smpTahunMasuk || '',
          gradYear: editingStudent.smpTahunKeluar || '',
          duration: editingStudent.smpLamaBelajar || '',
        },
      ] as EducationHistory[]
    ).filter((e) => e.schoolName && e.schoolName.trim() !== '');

    const extracurricularsList: Extracurricular[] = editingStudent.ekstrakurikuler
      ? editingStudent.ekstrakurikuler
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean)
          .map((name, i) => ({ id: `ex-${i}-${Date.now()}`, name }))
      : editingStudent.extracurriculars || [];

    const studentToSave: Student = {
      ...editingStudent,
      educationHistory: updatedEdu,
      extracurriculars: extracurricularsList,
      updatedAt: new Date().toISOString(),
    };

    onSaveStudent(studentToSave);
    setEditingStudent(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Data Murid Wali ({students.length} Siswa DKV)
            </h2>
            <p className="text-xs text-slate-600">
              Formulir Identitas Murid Wali 4 Seksi & Format Resmi Cetak SMKN 2 Gorontalo
            </p>
          </div>

          <button
            id="add-student-btn"
            onClick={handleOpenCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            + Tambah Murid
          </button>
        </div>

        {/* Search and Rombel Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="student-search-input"
              type="text"
              placeholder="Cari nama murid, NISN, alamat, ortu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Rombel Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['all', '10-DKV-1', '10-DKV-3', '11-DKV-3'].map((rombel) => (
              <button
                key={rombel}
                id={`filter-rombel-${rombel}`}
                onClick={() => setSelectedRombel(rombel)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedRombel === rombel
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rombel === 'all' ? 'Semua Rombel' : rombel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredStudents.map((st) => (
          <div
            key={st.id}
            id={`student-card-${st.id}`}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                    <DriveImage
                      src={st.photoUrl}
                      alt={st.name}
                      preset="thumb"
                      fallbackType="student"
                      gender={st.gender}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {st.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      No. {st.no} • NISN: {st.nisn} • {st.gender === 'L' ? 'L' : 'P'}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold">
                  {st.rombel}
                </span>
              </div>

              {/* Card Meta Info */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {st.birthPlace}, {st.birthDate}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{st.address || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    HP: <strong className="text-slate-800">{st.phone || st.parentPhone || '-'}</strong>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 flex items-center justify-between">
                  <span>Ayah: <strong>{st.fatherName}</strong></span>
                  <span>Ibu: <strong>{st.motherName}</strong></span>
                </div>
                {st.guardianName && (
                  <div className="text-[11px] text-purple-700 font-medium">
                    Wali: {st.guardianName} ({st.guardianRelation || 'Wali'})
                  </div>
                )}
              </div>
            </div>

            {/* Card Action Buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
              <button
                id={`btn-detail-${st.id}`}
                onClick={() => setSelectedStudentForDetail(st)}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                Lihat Detail
              </button>

              <button
                id={`btn-edit-${st.id}`}
                onClick={() => handleOpenEdit(st)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors"
                title="Edit Formulir 4 Seksi"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>

              <button
                id={`btn-print-${st.id}`}
                onClick={() => onPrintStudent(st)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors"
                title="Cetak Formulir Identitas Murid Wali (Format Resmi)"
              >
                <Printer className="w-3.5 h-3.5 text-blue-700" />
                Cetak Form
              </button>

              <button
                id={`btn-delete-${st.id}`}
                onClick={() => setStudentToDelete(st)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                title="Hapus Data Murid"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
          <p className="text-sm font-semibold">Tidak ada data murid yang sesuai pencarian.</p>
          <button
            onClick={() => {
              setSelectedRombel('all');
              setSearchQuery('');
            }}
            className="mt-2 text-xs text-blue-700 font-bold underline"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* MODAL 1: VIEW STUDENT DETAIL (4 SEKSI LENGKAP) */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white uppercase">
                  {selectedStudentForDetail.rombel}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedStudentForDetail.name}
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  NISN: {selectedStudentForDetail.nisn}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const st = selectedStudentForDetail;
                    setSelectedStudentForDetail(null);
                    onPrintStudent(st);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Form A4
                </button>
                <button
                  onClick={() => setSelectedStudentForDetail(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: 4 Sections Detail */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {/* Foto Murid & Identitas Ringkas */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100">
                <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-white">
                  <DriveImage
                    src={selectedStudentForDetail.photoUrl}
                    alt={selectedStudentForDetail.name}
                    preset="low"
                    fallbackType="student"
                    gender={selectedStudentForDetail.gender}
                    className="w-full h-full object-cover"
                    showZoomIcon
                  />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-900 text-white font-bold text-[10px]">
                      {selectedStudentForDetail.rombel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px]">
                      No. Urut: {selectedStudentForDetail.no}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px]">
                      NISN: {selectedStudentForDetail.nisn}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedStudentForDetail.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {selectedStudentForDetail.nickname ? `Panggilan: "${selectedStudentForDetail.nickname}" • ` : ''}
                    {selectedStudentForDetail.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • Agama {selectedStudentForDetail.religion || 'Islam'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedStudentForDetail.birthPlace}, {selectedStudentForDetail.birthDate}
                  </p>
                </div>
              </div>

              {/* Seksi A: Identitas Dasar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-blue-900 mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center font-bold">
                    A
                  </span>
                  Identitas Dasar Murid Wali
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Nama Lengkap:</span>{' '}
                    <strong className="text-slate-900">{selectedStudentForDetail.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Nama Panggilan:</span>{' '}
                    <strong>{selectedStudentForDetail.nickname || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">NISN:</span>{' '}
                    <strong className="font-mono">{selectedStudentForDetail.nisn}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Jenis Kelamin:</span>{' '}
                    <strong>
                      {selectedStudentForDetail.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Tempat, Tanggal Lahir:</span>{' '}
                    <strong>
                      {selectedStudentForDetail.birthPlace}, {selectedStudentForDetail.birthDate}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Agama:</span>{' '}
                    <strong>{selectedStudentForDetail.religion || 'Islam'}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Alamat Lengkap:</span>{' '}
                    <strong>
                      {selectedStudentForDetail.address}
                      {selectedStudentForDetail.addressDetail?.kelurahan
                        ? `, Kel. ${selectedStudentForDetail.addressDetail.kelurahan}`
                        : ''}
                      {selectedStudentForDetail.addressDetail?.kecamatan
                        ? `, Kec. ${selectedStudentForDetail.addressDetail.kecamatan}`
                        : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Anak Ke:</span>{' '}
                    <strong>
                      {selectedStudentForDetail.birthOrder || 1} dari{' '}
                      {selectedStudentForDetail.totalSiblings || 1} bersaudara
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">No. HP Pribadi:</span>{' '}
                    <strong>{selectedStudentForDetail.phone || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Akun Medsos:</span>{' '}
                    <strong>{selectedStudentForDetail.socialMedia || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Riwayat Penyakit Kronis:</span>{' '}
                    <strong>
                      {selectedStudentForDetail.chronicIllnessHistory?.length
                        ? selectedStudentForDetail.chronicIllnessHistory.join(', ')
                        : 'Tidak ada'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Seksi B: Identitas Orang Tua */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-blue-900 mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center font-bold">
                    B
                  </span>
                  Identitas Orang Tua / Wali
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">Data Ayah:</p>
                    <p>Nama: <strong>{selectedStudentForDetail.fatherName}</strong></p>
                    <p>Pekerjaan: <strong>{selectedStudentForDetail.fatherJob || '-'}</strong></p>
                    <p>Suku/Etnis: <strong>{selectedStudentForDetail.fatherEthnicity || 'Gorontalo'}</strong></p>
                    <p>Hubungan: <strong>{selectedStudentForDetail.fatherRelation || 'Kandung'}</strong></p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">Data Ibu:</p>
                    <p>Nama: <strong>{selectedStudentForDetail.motherName}</strong></p>
                    <p>Pekerjaan: <strong>{selectedStudentForDetail.motherJob || '-'}</strong></p>
                    <p>Suku/Etnis: <strong>{selectedStudentForDetail.motherEthnicity || 'Gorontalo'}</strong></p>
                    <p>Hubungan: <strong>{selectedStudentForDetail.motherRelation || 'Kandung'}</strong></p>
                  </div>
                  {selectedStudentForDetail.guardianName && (
                    <div className="sm:col-span-2 p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                      <p className="font-bold text-purple-900 mb-1">Data Wali Asuh:</p>
                      <p>Nama: <strong>{selectedStudentForDetail.guardianName}</strong></p>
                      <p>Hubungan: <strong>{selectedStudentForDetail.guardianRelation || 'Wali'}</strong></p>
                      <p>Pekerjaan: <strong>{selectedStudentForDetail.guardianJob || '-'}</strong></p>
                    </div>
                  )}
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-slate-500">HP Orang Tua/Wali:</span>{' '}
                      <strong>{selectedStudentForDetail.parentPhone || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">HP Kakak/Adik:</span>{' '}
                      <strong>{selectedStudentForDetail.siblingPhone || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">HP Tetangga/Darurat:</span>{' '}
                      <strong>{selectedStudentForDetail.neighborPhone || '-'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seksi C: Pendidikan & Prestasi */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-blue-900 mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center font-bold">
                    C
                  </span>
                  Riwayat Pendidikan, Prestasi & Ekstrakurikuler
                </h4>
                <div className="space-y-2">
                  <p className="font-bold text-slate-800">Riwayat Sekolah:</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {selectedStudentForDetail.educationHistory?.map((edu) => (
                      <div key={edu.level} className="p-2 bg-white rounded border border-slate-200">
                        <span className="font-bold text-blue-800">{edu.level}:</span>{' '}
                        <span>{edu.schoolName || '-'}</span>
                      </div>
                    ))}
                  </div>

                  <p className="font-bold text-slate-800 pt-1">Prestasi:</p>
                  {selectedStudentForDetail.achievements?.length ? (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {selectedStudentForDetail.achievements.map((ach) => (
                        <li key={ach.id}>
                          <strong>{ach.title}</strong> ({ach.category} - Tingkat {ach.level}, {ach.year})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-[11px]">Belum ada data prestasi tercatat.</p>
                  )}

                  <p className="font-bold text-slate-800 pt-1">Ekstrakurikuler Saat Ini:</p>
                  {selectedStudentForDetail.extracurriculars?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudentForDetail.extracurriculars.map((ex) => (
                        <span
                          key={ex.id}
                          className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-semibold text-[11px]"
                        >
                          {ex.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">Belum ada data ekstrakurikuler.</p>
                  )}
                </div>
              </div>

              {/* Seksi D: Aspirasi Studi & Karier */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-blue-900 mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center font-bold">
                    D
                  </span>
                  Aspirasi Studi Lanjut & Karier
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-slate-500">Cita-cita Profesi:</span>{' '}
                    <strong>
                      {Array.isArray(selectedStudentForDetail.careerGoals)
                        ? selectedStudentForDetail.careerGoals.filter(Boolean).join(' / ')
                        : selectedStudentForDetail.careerGoals || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Aspirasi Jurusan Lanjutan:</span>{' '}
                    <strong>{selectedStudentForDetail.furtherStudyAspiration || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Mapel Paling Dikuasai:</span>{' '}
                    <strong className="text-emerald-700">
                      {selectedStudentForDetail.masteredSubjects?.filter(Boolean).join(', ') || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Mapel Paling Kurang Dikuasai:</span>{' '}
                    <strong className="text-amber-700">
                      {selectedStudentForDetail.strugglingSubjects?.filter(Boolean).join(', ') || '-'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const st = selectedStudentForDetail;
                  setSelectedStudentForDetail(null);
                  setStudentToDelete(st);
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200"
                title="Hapus Murid Ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Murid</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const st = selectedStudentForDetail;
                    setSelectedStudentForDetail(null);
                    handleOpenEdit(st);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold"
                >
                  Edit Data Lengkap
                </button>
                <button
                  onClick={() => setSelectedStudentForDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-300 hover:bg-slate-400 text-slate-800 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT STUDENT FULL FORM (4 SECTIONS A, B, C, D) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Form Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isCreatingNew ? 'Tambah Murid Wali Baru' : `Edit Identitas Murid: ${editingStudent.name}`}
                </h3>
                <p className="text-xs text-slate-300">
                  Formulir Resmi Identitas Murid Wali — SMK Negeri 2 Gorontalo
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Section Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-3 flex gap-1 overflow-x-auto">
              {[
                { id: 'A', label: 'A. Identitas Dasar' },
                { id: 'B', label: 'B. Orang Tua & Wali' },
                { id: 'C', label: 'C. Pendidikan & Prestasi' },
                { id: 'D', label: 'D. Cita-cita & Minat' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as 'A' | 'B' | 'C' | 'D')}
                  className={`px-3.5 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                    activeFormTab === tab.id
                      ? 'border-blue-900 text-blue-900 bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* TAB A: IDENTITAS DASAR */}
              {activeFormTab === 'A' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nama Lengkap Murid *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingStudent.name}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, name: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        placeholder="Contoh: Dani Lasantu"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nama Panggilan
                      </label>
                      <input
                        type="text"
                        value={editingStudent.nickname || ''}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, nickname: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        placeholder="Contoh: Dani"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">NISN *</label>
                      <input
                        type="text"
                        required
                        value={editingStudent.nisn}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, nisn: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-600"
                        placeholder="10 digit NISN"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Rombel</label>
                      <select
                        value={editingStudent.rombel}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            rombel: e.target.value as RombelType,
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="10-DKV-1">10-DKV-1</option>
                        <option value="10-DKV-3">10-DKV-3</option>
                        <option value="11-DKV-3">11-DKV-3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                      <select
                        value={editingStudent.gender}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            gender: e.target.value as GenderType,
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Agama</label>
                      <input
                        type="text"
                        value={editingStudent.religion || 'Islam'}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, religion: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={editingStudent.birthPlace}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, birthPlace: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Tanggal Lahir (DD-MM-YYYY)
                      </label>
                      <input
                        type="text"
                        value={editingStudent.birthDate}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, birthDate: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        placeholder="Contoh: 06-03-2011"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Alamat Jalan / Tempat Tinggal</label>
                      <input
                        type="text"
                        value={editingStudent.address}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, address: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        placeholder="Contoh: Jl. R Atje Slamet"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">No. HP Pribadi</label>
                      <input
                        type="text"
                        value={editingStudent.phone || ''}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, phone: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        placeholder="Contoh: 081527619488"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Akun Medsos (IG/Tiktok)</label>
                      <input
                        type="text"
                        value={editingStudent.socialMedia || ''}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, socialMedia: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        placeholder="Contoh: @danilasantu_"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Anak Ke-</label>
                      <input
                        type="number"
                        min="1"
                        value={editingStudent.birthOrder || 1}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            birthOrder: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Dari Berapa Bersaudara</label>
                      <input
                        type="number"
                        min="1"
                        value={editingStudent.totalSiblings || 1}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            totalSiblings: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Penyakit Kronis yang Pernah Diderita
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Asma, Alergi Dingin (kosongkan jika tidak ada)"
                        value={
                          editingStudent.penyakitKronis !== undefined
                            ? editingStudent.penyakitKronis
                            : editingStudent.chronicIllnessHistory?.join(', ') || ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingStudent({
                            ...editingStudent,
                            penyakitKronis: val,
                            chronicIllnessHistory: val ? [val] : [],
                          });
                        }}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Foto Murid Google Drive (Low Resolution Auto Optimized) */}
                    <div className="sm:col-span-2 p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-blue-950 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-blue-700" />
                          <span>Pas Foto Murid (Link Google Drive / URL Foto)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowDriveGuide(true)}
                          className="text-[11px] text-blue-700 hover:text-blue-900 underline font-medium flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Cara Pasang Link Drive</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Tempelkan link share foto dari Google Drive. Sistem otomatis mengubahnya ke resolusi rendah (ringan dimuat & dicetak).
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                          value={editingStudent.photoUrl || ''}
                          onChange={(e) =>
                            setEditingStudent({
                              ...editingStudent,
                              photoUrl: e.target.value,
                            })
                          }
                          className="flex-1 p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 bg-white"
                        />
                        <div className="w-12 h-16 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0 shadow-2xs">
                          <DriveImage
                            src={editingStudent.photoUrl}
                            alt="Preview Foto Murid"
                            preset="thumb"
                            fallbackType="student"
                            gender={editingStudent.gender}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB B: IDENTITAS ORANG TUA & WALI */}
              {activeFormTab === 'B' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <h5 className="font-bold text-slate-900">A. Data Ayah</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Nama Ayah</label>
                        <input
                          type="text"
                          value={editingStudent.fatherName}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, fatherName: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Pekerjaan Ayah</label>
                        <input
                          type="text"
                          value={editingStudent.fatherJob || ''}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, fatherJob: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Suku/Etnis Ayah</label>
                        <input
                          type="text"
                          value={editingStudent.fatherEthnicity || 'Gorontalo'}
                          onChange={(e) =>
                            setEditingStudent({
                              ...editingStudent,
                              fatherEthnicity: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Hubungan</label>
                        <select
                          value={editingStudent.fatherRelation || 'Kandung'}
                          onChange={(e) =>
                            setEditingStudent({
                              ...editingStudent,
                              fatherRelation: e.target.value as any,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Kandung">Ayah Kandung</option>
                          <option value="Tiri">Ayah Tiri</option>
                          <option value="Alm.">Almarhum</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <h5 className="font-bold text-slate-900">B. Data Ibu</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Nama Ibu</label>
                        <input
                          type="text"
                          value={editingStudent.motherName}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, motherName: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Pekerjaan Ibu</label>
                        <input
                          type="text"
                          value={editingStudent.motherJob || ''}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, motherJob: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Suku/Etnis Ibu</label>
                        <input
                          type="text"
                          value={editingStudent.motherEthnicity || 'Gorontalo'}
                          onChange={(e) =>
                            setEditingStudent({
                              ...editingStudent,
                              motherEthnicity: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Hubungan</label>
                        <select
                          value={editingStudent.motherRelation || 'Kandung'}
                          onChange={(e) =>
                            setEditingStudent({
                              ...editingStudent,
                              motherRelation: e.target.value as any,
                            })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Kandung">Ibu Kandung</option>
                          <option value="Tiri">Ibu Tiri</option>
                          <option value="Almh.">Almarhumah</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <h5 className="font-bold text-slate-900">C. Wali Asuh (Bila ada) & Kontak Darurat</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Nama Wali</label>
                        <input
                          type="text"
                          value={editingStudent.guardianName || ''}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, guardianName: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                          placeholder="Nama wali tinggal bersama"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Hubungan Wali</label>
                        <input
                          type="text"
                          value={editingStudent.guardianRelation || ''}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, guardianRelation: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                          placeholder="Contoh: Nenek / Paman"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">No. HP Ortu / Wali</label>
                        <input
                          type="text"
                          value={editingStudent.parentPhone || ''}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, parentPhone: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">No. HP Kakak/Adik / Tetangga</label>
                        <input
                          type="text"
                          value={editingStudent.siblingPhone || ''}
                          onChange={(e) =>
                            setEditingStudent({ ...editingStudent, siblingPhone: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB C: RIWAYAT PENDIDIKAN & PRESTASI */}
              {activeFormTab === 'C' && (
                <div className="space-y-4">
                  {/* TK */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-900 flex items-center justify-between">
                      <span>1. Taman Kanak-Kanak (TK / PAUD)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Boleh dikosongkan jika tidak ada</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Nama TK/PAUD</label>
                        <input
                          type="text"
                          placeholder="Nama TK (contoh: TK Pertiwi Gorontalo)"
                          value={editingStudent.tkNama || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, tkNama: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Tahun Masuk - Keluar</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Masuk"
                            value={editingStudent.tkTahunMasuk || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, tkTahunMasuk: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                          />
                          <span>-</span>
                          <input
                            type="text"
                            placeholder="Keluar"
                            value={editingStudent.tkTahunKeluar || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, tkTahunKeluar: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Lama Belajar</label>
                        <input
                          type="text"
                          placeholder="Contoh: 1 Tahun"
                          value={editingStudent.tkLamaBelajar || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, tkLamaBelajar: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SD */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-900 flex items-center justify-between">
                      <span>2. Sekolah Dasar (SD / MI)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Boleh dikosongkan jika belum ada</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Nama SD/MI</label>
                        <input
                          type="text"
                          placeholder="Nama SD (contoh: SDN 30 Kota Selatan)"
                          value={editingStudent.sdNama || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, sdNama: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Tahun Masuk - Keluar</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Masuk"
                            value={editingStudent.sdTahunMasuk || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, sdTahunMasuk: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                          />
                          <span>-</span>
                          <input
                            type="text"
                            placeholder="Keluar"
                            value={editingStudent.sdTahunKeluar || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, sdTahunKeluar: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Lama Belajar</label>
                        <input
                          type="text"
                          placeholder="Contoh: 6 Tahun"
                          value={editingStudent.sdLamaBelajar || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, sdLamaBelajar: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SMP */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-900 flex items-center justify-between">
                      <span>3. Sekolah Menengah Pertama (SMP / MTs)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Boleh dikosongkan jika belum ada</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Nama SMP/MTs</label>
                        <input
                          type="text"
                          placeholder="Nama SMP (contoh: SMP Negeri 1 Gorontalo)"
                          value={editingStudent.smpNama || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, smpNama: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Tahun Masuk - Keluar</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Masuk"
                            value={editingStudent.smpTahunMasuk || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, smpTahunMasuk: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                          />
                          <span>-</span>
                          <input
                            type="text"
                            placeholder="Keluar"
                            value={editingStudent.smpTahunKeluar || ''}
                            onChange={(e) => setEditingStudent({ ...editingStudent, smpTahunKeluar: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Lama Belajar</label>
                        <input
                          type="text"
                          placeholder="Contoh: 3 Tahun"
                          value={editingStudent.smpLamaBelajar || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, smpLamaBelajar: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prestasi & Ekstrakurikuler */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        4. Prestasi yang Pernah Dicapai Selama di SD
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Juara 1 Lomba Menggambar Tingkat Kecamatan, Juara Catur SD"
                        value={editingStudent.prestasiSD || ''}
                        onChange={(e) => setEditingStudent({ ...editingStudent, prestasiSD: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        5. Prestasi yang Pernah Dicapai Selama di SMP
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Juara 2 Poster FLS2N Tingkat Kota Gorontalo (2025)"
                        value={editingStudent.prestasiSMP || ''}
                        onChange={(e) => setEditingStudent({ ...editingStudent, prestasiSMP: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        6. Ekstrakurikuler di SMK Saat Ini yang Diikuti
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Desain Grafis Club, PMR, Futsal"
                        value={editingStudent.ekstrakurikuler || editingStudent.extracurriculars?.map((e) => e.name).join(', ') || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingStudent({ ...editingStudent, ekstrakurikuler: val });
                        }}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB D: ASPIRASI STUDI & MINAT */}
              {activeFormTab === 'D' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cita-cita Profesi (2 Profesi)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Graphic Designer / UI Designer, Animator"
                      value={
                        Array.isArray(editingStudent.careerGoals)
                          ? editingStudent.careerGoals.join(' / ')
                          : editingStudent.careerGoals || ''
                      }
                      onChange={(e) => {
                        const goals = e.target.value
                          .split('/')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setEditingStudent({ ...editingStudent, careerGoals: goals });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Aspirasi Jurusan Lanjutan / Karier
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: S1 Desain Komunikasi Visual (DKV)"
                      value={editingStudent.furtherStudyAspiration || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          furtherStudyAspiration: e.target.value,
                        })
                      }
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      3 Mata Pelajaran Paling Dikuasai
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Dasar Desain Grafis, Seni Budaya, Bahasa Inggris"
                      value={editingStudent.masteredSubjects?.join(', ') || ''}
                      onChange={(e) => {
                        const list = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setEditingStudent({ ...editingStudent, masteredSubjects: list });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      3 Mata Pelajaran Paling Tidak Dikuasai / Perlu Bimbingan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Matematika, Fisika Terapan, Informatika"
                      value={editingStudent.strugglingSubjects?.join(', ') || ''}
                      onChange={(e) => {
                        const list = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setEditingStudent({ ...editingStudent, strugglingSubjects: list });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* Form Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  {activeFormTab !== 'A' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeFormTab === 'B') setActiveFormTab('A');
                        if (activeFormTab === 'C') setActiveFormTab('B');
                        if (activeFormTab === 'D') setActiveFormTab('C');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                    >
                      ← Kembali
                    </button>
                  )}
                  {activeFormTab !== 'D' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeFormTab === 'A') setActiveFormTab('B');
                        if (activeFormTab === 'B') setActiveFormTab('C');
                        if (activeFormTab === 'C') setActiveFormTab('D');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold"
                    >
                      Lanjut →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isCreatingNew && (
                    <button
                      type="button"
                      onClick={() => {
                        const st = editingStudent;
                        setEditingStudent(null);
                        setStudentToDelete(st);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 mr-auto transition-colors"
                      title="Hapus data murid ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                  >
                    Batal
                  </button>
                  <button
                    id="save-student-btn"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold shadow-md"
                  >
                    Simpan Identitas Murid
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN GOOGLE DRIVE */}
      {showDriveGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-blue-900">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-base">Panduan Memasang Pas Foto dari Google Drive</h3>
              </div>
              <button
                onClick={() => setShowDriveGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Sistem siWali otomatis mengoptimalkan foto dari link Google Drive ke format <strong>resolusi rendah</strong> (hemat data & cepat dimuat).
            </p>

            <div className="space-y-3">
              {DRIVE_GUIDE_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{step.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDriveGuide(false)}
                className="px-5 py-2 rounded-xl bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title="Hapus Data Murid Wali"
        message="Apakah Anda yakin ingin menghapus data murid ini? Profil identitas 4 seksi dan seluruh riwayatnya akan dihapus permanen."
        itemName={studentToDelete ? `${studentToDelete.name} (${studentToDelete.rombel})` : undefined}
        confirmLabel="Ya, Hapus Murid"
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />
    </div>
  );
};
