import React, { useState, useMemo } from 'react';
import {
  StudentCase,
  Student,
  SopStepNumber,
  CasePathway,
  SopStepLog,
  SchoolProfile,
} from '../types';
import {
  GitFork,
  Plus,
  Printer,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  FileText,
  UserCheck,
  Building,
  Check,
  ChevronRight,
  AlertCircle,
  X,
  Trash2,
  Edit,
} from 'lucide-react';
import { formatIndonesianDate, getTodayDateString } from '../utils/formatters';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

const SOP_STEP_DEFINITIONS: {
  step: SopStepNumber;
  title: string;
  shortDesc: string;
  description: string;
}[] = [
  {
    step: 1,
    title: 'Monitoring Rutin',
    shortDesc: 'Pemantauan berkala murid wali',
    description: 'Pemantauan normal terhadap kehadiran, keterlibatan di kelas, dan dinamika sosial murid.',
  },
  {
    step: 2,
    title: 'Identifikasi Masalah',
    shortDesc: 'Verifikasi adanya temuan khusus',
    description: 'Menilai apakah terdapat indikasi masalah belajar, absensi, atau perilaku. Jika Tidak, kasus ditutup kembali ke Monitoring Rutin.',
  },
  {
    step: 3,
    title: 'Koordinasi Awal dengan Wali Kelas',
    shortDesc: 'Konsolidasi informasi murid',
    description: 'Guru Wali berkoordinasi dengan Wali Kelas mengenai catatan kelas dan latar belakang siswa.',
  },
  {
    step: 4,
    title: 'Penentuan Jenis Masalah (Jalur A/B)',
    shortDesc: 'Klasifikasi Jalur Penanganan',
    description: 'Jalur A (Akademik & Pembelajaran bersama Guru Mapel) atau Jalur B (Pribadi/Sosial/Karakter bersama Guru BK).',
  },
  {
    step: 5,
    title: 'Tindak Lanjut & Pelibatan Orang Tua',
    shortDesc: 'Komunikasi Ortu / Home Visit',
    description: 'Menghubungi orang tua/wali dan melakukan Kunjungan Rumah (Home Visit) bila diperlukan.',
  },
  {
    step: 6,
    title: 'Penilaian Bobot Masalah',
    shortDesc: 'Evaluasi eskalasi pimpinan',
    description: 'Apakah masalah berkategori berat dan butuh keputusan Kepala Sekolah? Jika Ya, lakukan Eskalasi ke Kepala Sekolah.',
  },
  {
    step: 7,
    title: 'Implementasi & Pendampingan Murid',
    shortDesc: 'Eksekusi rencana intervensi',
    description: 'Pelaksanaan tindakan pendampingan, bimbingan belajar khusus, atau sesi konseling terpadu.',
  },
  {
    step: 8,
    title: 'Evaluasi & Pelaporan Pendampingan',
    shortDesc: 'Penyelesaian & Jurnal Kasus',
    description: 'Mengevaluasi hasil pendampingan, mencatat rekomendasi akhir, dan mengembalikan murid ke status Monitoring Rutin.',
  },
];

interface CasesViewProps {
  cases: StudentCase[];
  students: Student[];
  profile: SchoolProfile;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  selectedCaseId?: string | null;
  onSaveCase: (studentCase: StudentCase) => void;
  onDeleteCase: (id: string) => void;
  onPrintCaseReport: (studentCase: StudentCase) => void;
  isOpenNewDirectly?: boolean;
  onCloseNewDirectly?: () => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  students,
  profile,
  isAdmin = false,
  onRequireAdmin,
  selectedCaseId,
  onSaveCase,
  onDeleteCase,
  onPrintCaseReport,
  isOpenNewDirectly = false,
  onCloseNewDirectly,
}) => {
  const [selectedCase, setSelectedCase] = useState<StudentCase | null>(
    cases.find((c) => c.id === selectedCaseId) || cases[0] || null
  );

  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktif' | 'Eskalasi' | 'Selesai'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(isOpenNewDirectly);
  const [caseToDelete, setCaseToDelete] = useState<StudentCase | null>(null);

  // New Case Form
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formStartDate, setFormStartDate] = useState<string>(getTodayDateString());
  const [formInitialPathway, setFormInitialPathway] = useState<CasePathway>('Jalur A');

  // Step Update modal / state
  const [stepModalOpen, setStepModalOpen] = useState<boolean>(false);
  const [targetStepToUpdate, setTargetStepToUpdate] = useState<SopStepNumber>(1);
  const [stepNotes, setStepNotes] = useState<string>('');
  const [stepActor, setStepActor] = useState<string>('Abdul Rahman Bahsoan (Guru Wali)');
  const [stepPathway, setStepPathway] = useState<CasePathway>('Jalur A');
  const [stepHomeVisit, setStepHomeVisit] = useState<boolean>(false);
  const [stepHomeVisitNotes, setStepHomeVisitNotes] = useState<string>('');
  const [stepIsEscalated, setStepIsEscalated] = useState<boolean>(false);
  const [stepPrincipalDirectives, setStepPrincipalDirectives] = useState<string>('');
  const [stepEvaluationNotes, setStepEvaluationNotes] = useState<string>('');
  const [stepHasFinding, setStepHasFinding] = useState<boolean>(true);

  // Update selected case if prop changes
  React.useEffect(() => {
    if (selectedCaseId) {
      const found = cases.find((c) => c.id === selectedCaseId);
      if (found) setSelectedCase(found);
    }
  }, [selectedCaseId, cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'Eskalasi') return c.status === 'Eskalasi' || c.isEscalatedToPrincipal;
      return c.status === statusFilter;
    });
  }, [cases, statusFilter]);

  const handleOpenNewCase = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    setFormStudentId(students[0]?.id || '');
    setFormTitle('');
    setFormDescription('');
    setFormStartDate(getTodayDateString());
    setFormInitialPathway('Jalur A');
    setIsNewModalOpen(true);
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formStudentId);
    if (!st) {
      alert('Pilih murid terlebih dahulu');
      return;
    }
    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Judul kasus dan deskripsi wajib diisi');
      return;
    }

    const newCase: StudentCase = {
      id: `case-${Date.now()}`,
      caseNumber: `KASUS/DKV/2026/${String(cases.length + 1).padStart(3, '0')}`,
      studentId: st.id,
      studentName: st.name,
      studentRombel: st.rombel,
      title: formTitle.trim(),
      description: formDescription.trim(),
      startDate: formStartDate,
      currentStep: 1,
      pathway: formInitialPathway,
      status: 'Aktif',
      hasHomeVisit: false,
      isEscalatedToPrincipal: false,
      logs: [
        {
          step: 1,
          stepTitle: 'Monitoring Rutin',
          date: formStartDate,
          notes: 'Pencatatan awal temuan dan inisiasi penanganan kasus sesuai SOP.',
          actor: `${profile.homeroomTeacherName} (Guru Wali)`,
          completed: true,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveCase(newCase);
    setSelectedCase(newCase);
    setIsNewModalOpen(false);
    if (onCloseNewDirectly) onCloseNewDirectly();
  };

  // Open Step Update
  const handleOpenStepUpdate = (stepNum: SopStepNumber) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    if (!selectedCase) return;
    setTargetStepToUpdate(stepNum);
    const existingLog = selectedCase.logs.find((l) => l.step === stepNum);

    setStepNotes(existingLog?.notes || '');
    setStepActor(existingLog?.actor || `${profile.homeroomTeacherName} (Guru Wali)`);
    setStepPathway(selectedCase.pathway || 'Jalur A');
    setStepHomeVisit(selectedCase.hasHomeVisit || false);
    setStepHomeVisitNotes(selectedCase.homeVisitNotes || '');
    setStepIsEscalated(selectedCase.isEscalatedToPrincipal || false);
    setStepPrincipalDirectives(selectedCase.principalNotes || '');
    setStepEvaluationNotes(selectedCase.evaluationNotes || '');
    setStepHasFinding(true);
    setStepModalOpen(true);
  };

  const handleSaveStepProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const stepDef = SOP_STEP_DEFINITIONS.find((s) => s.step === targetStepToUpdate);
    const updatedLogs = [...selectedCase.logs];
    const logIdx = updatedLogs.findIndex((l) => l.step === targetStepToUpdate);

    const logEntry: SopStepLog = {
      step: targetStepToUpdate,
      stepTitle: stepDef?.title || `Tahap ${targetStepToUpdate}`,
      date: getTodayDateString(),
      notes: stepNotes.trim() || `Telah dilaksanakan tahap ${stepDef?.title}`,
      actor: stepActor.trim() || `${profile.homeroomTeacherName} (Guru Wali)`,
      completed: true,
      extraData: {
        hasFinding: stepHasFinding,
        pathway: targetStepToUpdate >= 4 ? stepPathway : undefined,
        homeVisitConducted: stepHomeVisit,
        homeVisitNotes: stepHomeVisitNotes,
        isSevereEscalated: stepIsEscalated,
        principalDirectives: stepPrincipalDirectives,
        evaluationNotes: stepEvaluationNotes,
      },
    };

    if (logIdx >= 0) {
      updatedLogs[logIdx] = logEntry;
    } else {
      updatedLogs.push(logEntry);
    }

    // Determine new status and next step
    let newStatus: 'Aktif' | 'Eskalasi' | 'Selesai' = selectedCase.status;
    let nextStep: SopStepNumber = Math.max(selectedCase.currentStep, targetStepToUpdate) as SopStepNumber;

    if (targetStepToUpdate === 2 && !stepHasFinding) {
      // If Step 2 has no finding -> close case back to monitoring
      newStatus = 'Selesai';
    } else if (targetStepToUpdate === 6 && stepIsEscalated) {
      newStatus = 'Eskalasi';
    } else if (targetStepToUpdate === 8) {
      newStatus = 'Selesai';
    } else if (newStatus === 'Eskalasi' && targetStepToUpdate > 6) {
      newStatus = 'Aktif'; // escalated directives received, back to active implementation
    }

    const updatedCase: StudentCase = {
      ...selectedCase,
      currentStep: nextStep,
      status: newStatus,
      pathway: targetStepToUpdate >= 4 ? stepPathway : selectedCase.pathway,
      hasHomeVisit: stepHomeVisit || selectedCase.hasHomeVisit,
      homeVisitNotes: stepHomeVisitNotes || selectedCase.homeVisitNotes,
      isEscalatedToPrincipal: stepIsEscalated || selectedCase.isEscalatedToPrincipal,
      principalNotes: stepPrincipalDirectives || selectedCase.principalNotes,
      evaluationNotes: stepEvaluationNotes || selectedCase.evaluationNotes,
      logs: updatedLogs,
      updatedAt: new Date().toISOString(),
    };

    onSaveCase(updatedCase);
    setSelectedCase(updatedCase);
    setStepModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Top Bar Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-purple-700" />
              SOP Penanganan Masalah Murid Wali (8 Tahap Alur Kasus)
            </h2>
            <p className="text-xs text-slate-600">
              Mekanisme Kolaborasi Terstruktur: Monitoring → Jalur A/B → Home Visit → Eskalasi KS → Selesai
            </p>
          </div>

          <button
            id="create-new-case-btn"
            onClick={handleOpenNewCase}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            + Buat Kasus Baru
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
          {[
            { id: 'all', label: `Semua Kasus (${cases.length})` },
            { id: 'Aktif', label: 'Kasus Aktif' },
            { id: 'Eskalasi', label: 'Eskalasi Kepala Sekolah' },
            { id: 'Selesai', label: 'Selesai' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                statusFilter === pill.id
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Case Selection List & Interactive SOP Visual Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Col: Case Selection Cards */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Daftar Kasus ({filteredCases.length})
          </h3>

          {filteredCases.map((item) => {
            const isSelected = selectedCase?.id === item.id;
            const isEscalated = item.status === 'Eskalasi' || item.isEscalatedToPrincipal;
            const isJalurA = item.pathway === 'Jalur A';

            return (
              <div
                key={item.id}
                id={`case-item-${item.id}`}
                onClick={() => setSelectedCase(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-600/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      {item.caseNumber}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug mt-0.5">
                      {item.studentName}
                    </h4>
                    <span className="text-[10px] text-slate-500">{item.studentRombel}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isEscalated
                        ? 'bg-red-600 text-white animate-pulse'
                        : item.status === 'Selesai'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isEscalated ? 'Eskalasi KS' : item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 font-medium">
                  {item.title}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                      isJalurA
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {item.pathway || 'Jalur A'}: {isJalurA ? 'Akademik' : 'Sosial'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-900">
                      Tahap {item.currentStep}/8
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCaseToDelete(item);
                      }}
                      className="p-1 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus Kasus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCases.length === 0 && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Tidak ada kasus dengan filter ini.
            </div>
          )}
        </div>

        {/* Right 2-Cols: Active Case Interactive Stepper & Timeline Details */}
        {selectedCase ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Case Header Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                      {selectedCase.caseNumber}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {selectedCase.studentRombel}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        selectedCase.pathway === 'Jalur A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {selectedCase.pathway === 'Jalur A'
                        ? 'Jalur A — Akademik & Pembelajaran'
                        : 'Jalur B — Pribadi/Sosial/Karakter'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {selectedCase.studentName}: {selectedCase.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mulai: {formatIndonesianDate(selectedCase.startDate)} • Guru Wali: {profile.homeroomTeacherName}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    id="print-case-btn"
                    onClick={() => onPrintCaseReport(selectedCase)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-sm"
                    title="Cetak Jurnal Penanganan Masalah Murid Wali (Format Resmi)"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Jurnal SOP
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setCaseToDelete(selectedCase)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus Kasus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Case Problem Description */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Uraian Masalah Awal:</strong>
                {selectedCase.description}
              </div>

              {/* Special Flags: Home Visit & Escalation Info */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {selectedCase.hasHomeVisit && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Home Visit Terlaksana: <strong>{selectedCase.homeVisitNotes || 'Ada'}</strong>
                    </span>
                  </div>
                )}

                {selectedCase.isEscalatedToPrincipal && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-900 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>
                      Arahan KS: <strong>{selectedCase.principalNotes || 'Eskalasi diajukan'}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Interactive SOP 8-Step Timeline */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Alur Stepper Penanganan Masalah (SOP SMKN 2 Gorontalo)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Klik tahapan untuk memperbarui catatan progres dan rekomendasi
                  </p>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900">
                  Tahap Aktif: {selectedCase.currentStep} / 8
                </span>
              </div>

              {/* 8-Step Stepper Flow */}
              <div className="space-y-3">
                {SOP_STEP_DEFINITIONS.map((stepItem) => {
                  const stepNum = stepItem.step;
                  const log = selectedCase.logs.find((l) => l.step === stepNum);
                  const isCompleted = !!log?.completed || selectedCase.currentStep > stepNum;
                  const isCurrent = selectedCase.currentStep === stepNum;
                  const isPending = selectedCase.currentStep < stepNum && !log?.completed;

                  // Pathway-specific coloring
                  const isJalurA = selectedCase.pathway === 'Jalur A';

                  return (
                    <div
                      key={stepNum}
                      id={`sop-step-${stepNum}`}
                      className={`rounded-xl border transition-all p-3 sm:p-3.5 ${
                        isCurrent
                          ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                          : isCompleted
                          ? 'bg-slate-50/70 border-slate-200'
                          : 'bg-white border-slate-200/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Step Number Circle */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isCurrent
                                ? 'bg-purple-700 text-white animate-pulse'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5
                                className={`text-xs sm:text-sm font-bold ${
                                  isCurrent
                                    ? 'text-purple-950'
                                    : isCompleted
                                    ? 'text-slate-900'
                                    : 'text-slate-600'
                                }`}
                              >
                                {stepNum}. {stepItem.title}
                              </h5>

                              {stepNum === 4 && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isJalurA
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                                  }`}
                                >
                                  {isJalurA ? 'Jalur A (Guru Mapel)' : 'Jalur B (Guru BK)'}
                                </span>
                              )}

                              {stepNum === 6 && selectedCase.isEscalatedToPrincipal && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                                  Eskalasi Kepala Sekolah
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {stepItem.description}
                            </p>

                            {/* Recorded Log Notes for this Step */}
                            {log && (
                              <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs">
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1">
                                  <span>Oleh: {log.actor}</span>
                                  <span>{formatIndonesianDate(log.date)}</span>
                                </div>
                                <p className="text-slate-800 font-medium">{log.notes}</p>

                                {log.extraData?.homeVisitNotes && (
                                  <p className="mt-1 text-emerald-800 text-[11px]">
                                    📍 Home Visit: {log.extraData.homeVisitNotes}
                                  </p>
                                )}

                                {log.extraData?.principalDirectives && (
                                  <p className="mt-1 text-red-800 text-[11px]">
                                    🏛️ Arahan KS: {log.extraData.principalDirectives}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action to update this step */}
                        <button
                          id={`update-step-btn-${stepNum}`}
                          onClick={() => handleOpenStepUpdate(stepNum)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                            isCurrent
                              ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-sm'
                              : isCompleted
                              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                              : 'bg-slate-100 hover:bg-purple-100 text-purple-900'
                          }`}
                        >
                          {log ? 'Edit Catatan' : 'Proses Tahap'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            <GitFork className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Pilih kasus di sebelah kiri untuk melihat alur SOP.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE NEW CASE */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Buka Kasus SOP Baru</h3>
                <p className="text-xs text-slate-300">
                  Inisiasi Alur SOP Penanganan Masalah Murid Wali DKV
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Murid Wali (14 Siswa DKV) *
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600 bg-slate-50 font-medium"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — ({st.rombel}) • NISN: {st.nisn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul / Perihal Kasus *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Penanganan Keterlambatan Kronis & Kendala Transportasi"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Mulai Penanganan *
                </label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prakiraan Jalur Masalah *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormInitialPathway('Jalur A')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formInitialPathway === 'Jalur A'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="block text-xs font-bold text-emerald-800">
                      Jalur A — Akademik
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Guru Wali + Walas + Guru Mapel
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormInitialPathway('Jalur B')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formInitialPathway === 'Jalur B'
                        ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="block text-xs font-bold text-purple-800">
                      Jalur B — Sosial/Karakter
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Guru Wali + Guru BK
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi & Kronologi Masalah Awal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan temuan awal, frekuensi kejadian, dampak terhadap pembelajaran..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  id="submit-create-case-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold shadow-md"
                >
                  Inisiasi Kasus SOP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE SOP STEP PROGRESS & ACTIONS */}
      {stepModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white uppercase">
                  Tahap {targetStepToUpdate} dari 8
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {SOP_STEP_DEFINITIONS.find((s) => s.step === targetStepToUpdate)?.title}
                </h3>
                <p className="text-xs text-slate-300">
                  Murid: {selectedCase.studentName} ({selectedCase.studentRombel})
                </p>
              </div>
              <button
                onClick={() => setStepModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStepProgress} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* Step specific options */}
              {targetStepToUpdate === 2 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-2">
                    Apakah terdapat temuan khusus masalah?
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <input
                        type="radio"
                        name="finding"
                        checked={stepHasFinding}
                        onChange={() => setStepHasFinding(true)}
                      />
                      Ya, ada masalah (Lanjut ke Tahap 3)
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <input
                        type="radio"
                        name="finding"
                        checked={!stepHasFinding}
                        onChange={() => setStepHasFinding(false)}
                      />
                      Tidak ada (Tutup Kasus & Monitoring Rutin)
                    </label>
                  </div>
                </div>
              )}

              {targetStepToUpdate === 4 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-800">
                    Pilih Jalur Penanganan SOP:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStepPathway('Jalur A')}
                      className={`p-2 rounded-lg border text-left ${
                        stepPathway === 'Jalur A'
                          ? 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="block text-xs text-emerald-800">Jalur A: Akademik</span>
                      <span className="text-[10px]">Guru Wali + Walas + Mapel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStepPathway('Jalur B')}
                      className={`p-2 rounded-lg border text-left ${
                        stepPathway === 'Jalur B'
                          ? 'bg-purple-100 border-purple-500 font-bold text-purple-950'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="block text-xs text-purple-800">Jalur B: Pribadi/BK</span>
                      <span className="text-[10px]">Guru Wali + Guru BK</span>
                    </button>
                  </div>
                </div>
              )}

              {targetStepToUpdate === 5 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stepHomeVisit}
                      onChange={(e) => setStepHomeVisit(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-700"
                    />
                    Dilakukan Kunjungan Rumah (Home Visit)?
                  </label>
                  {stepHomeVisit && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Catatan Hasil Kunjungan Rumah (Home Visit):
                      </label>
                      <textarea
                        rows={2}
                        value={stepHomeVisitNotes}
                        onChange={(e) => setStepHomeVisitNotes(e.target.value)}
                        placeholder="Kondisi tempat tinggal, penerimaan orang tua, faktor pendukung belajar di rumah..."
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  )}
                </div>
              )}

              {targetStepToUpdate === 6 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <label className="block font-bold text-slate-800">
                    Penilaian Bobot Masalah: Apakah Perlu Eskalasi ke Kepala Sekolah?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 font-bold text-red-700">
                      <input
                        type="radio"
                        name="escalate"
                        checked={stepIsEscalated}
                        onChange={() => setStepIsEscalated(true)}
                      />
                      Ya, Eskalasi ke Kepala Sekolah
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="escalate"
                        checked={!stepIsEscalated}
                        onChange={() => setStepIsEscalated(false)}
                      />
                      Tidak (Langsung Implementasi)
                    </label>
                  </div>

                  {stepIsEscalated && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-red-900 mb-1">
                        Catatan Arahan & Keputusan Kepala Sekolah:
                      </label>
                      <textarea
                        rows={2}
                        value={stepPrincipalDirectives}
                        onChange={(e) => setStepPrincipalDirectives(e.target.value)}
                        placeholder="Dispensasi khusus, kebijakan adaptif, surat peringatan, atau arahan langsung pimpinan..."
                        className="w-full p-2 rounded-lg border border-red-300 text-xs bg-red-50/50 focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  )}
                </div>
              )}

              {targetStepToUpdate === 8 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catatan Evaluasi Akhir & Rekomendasi Pendampingan:
                  </label>
                  <textarea
                    rows={3}
                    value={stepEvaluationNotes}
                    onChange={(e) => setStepEvaluationNotes(e.target.value)}
                    placeholder="Perkembangan sikap siswa, pencapaian target bimbingan, rekomendasi lanjutan..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              )}

              {/* General Step Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian Kegiatan & Catatan Tahap {targetStepToUpdate} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Tuliskan catatan pelaksanaan kegiatan pada tahap ini..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pelaksana / Aktor Tahap Ini
                </label>
                <input
                  type="text"
                  value={stepActor}
                  onChange={(e) => setStepActor(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStepModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  id="save-step-progress-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold shadow-md"
                >
                  Simpan Progres Tahap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!caseToDelete}
        title="Hapus Kasus Murid Wali"
        message="Apakah Anda yakin ingin menghapus catatan penanganan kasus SOP ini? Seluruh log 8 tahap dan riwayat eskalasi akan dihapus permanen."
        itemName={caseToDelete ? `${caseToDelete.caseNumber}: ${caseToDelete.studentName} (${caseToDelete.studentRombel}) - ${caseToDelete.title}` : undefined}
        confirmLabel="Ya, Hapus Kasus"
        onConfirm={() => {
          if (caseToDelete) {
            onDeleteCase(caseToDelete.id);
            if (selectedCase?.id === caseToDelete.id) {
              const remaining = cases.filter((c) => c.id !== caseToDelete.id);
              setSelectedCase(remaining[0] || null);
            }
            setCaseToDelete(null);
          }
        }}
        onClose={() => setCaseToDelete(null)}
      />
    </div>
  );
};
