import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Student,
  Consultation,
  Collaboration,
  StudentCase,
  SchoolProfile,
  ActivityLog,
} from './types';
import { StorageService } from './services/storage';
import { SheetsSyncService } from './services/sheetsSync';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './views/DashboardView';
import { StudentsView } from './views/StudentsView';
import { ActivitiesView } from './views/ActivitiesView';
import { ConsultationsView } from './views/ConsultationsView';
import { CollaborationsView } from './views/CollaborationsView';
import { CasesView } from './views/CasesView';
import { JournalView } from './views/JournalView';
import { PrintDocumentModal, PrintDocType } from './components/PrintDocumentModal';
import { SheetsSyncModal } from './components/SheetsSyncModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import {
  Settings,
  X,
  Save,
  RotateCcw,
  User,
  School,
  Award,
  Calendar,
  FileSpreadsheet,
  CloudCheck,
} from 'lucide-react';

export function App() {
  // App Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Role Based Access Control State (Admin vs Tamu/User)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('siwali_is_admin') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  const handleLoginAdmin = () => {
    setIsAdmin(true);
    try {
      sessionStorage.setItem('siwali_is_admin', 'true');
    } catch {}
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem('siwali_is_admin');
    } catch {}
  };

  const handleRequireAdmin = () => {
    setIsAdminAuthModalOpen(true);
  };

  // Core App Data State
  const [profile, setProfile] = useState<SchoolProfile>(StorageService.getProfile());
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [activities, setActivities] = useState<ActivityLog[]>(StorageService.getActivities());
  const [consultations, setConsultations] = useState<Consultation[]>(StorageService.getConsultations());
  const [collaborations, setCollaborations] = useState<Collaboration[]>(StorageService.getCollaborations());
  const [cases, setCases] = useState<StudentCase[]>(StorageService.getCases());

  // Deep Navigation & Direct Modal Triggers
  const [selectedCaseIdForView, setSelectedCaseIdForView] = useState<string | null>(null);
  const [isDirectActionModalOpen, setIsDirectActionModalOpen] = useState<boolean>(false);

  // Settings / Profile Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState<SchoolProfile>(profile);

  // Google Sheets Cloud Sync Modal State
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [isSheetsConfigured, setIsSheetsConfigured] = useState<boolean>(SheetsSyncService.isConfigured());
  const [isSheetsSyncing, setIsSheetsSyncing] = useState<boolean>(false);

  // Print Preview Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printDocType, setPrintDocType] = useState<PrintDocType>('student_profile');
  const [printSelectedStudent, setPrintSelectedStudent] = useState<Student | null>(null);
  const [printSelectedCase, setPrintSelectedCase] = useState<StudentCase | null>(null);
  const [printPeriod, setPrintPeriod] = useState<string>('');
  const [printFilterStudentName, setPrintFilterStudentName] = useState<string>('');

  // Reload data from storage
  const reloadData = useCallback(() => {
    setProfile(StorageService.getProfile());
    setStudents(StorageService.getStudents());
    setActivities(StorageService.getActivities());
    setConsultations(StorageService.getConsultations());
    setCollaborations(StorageService.getCollaborations());
    setCases(StorageService.getCases());
    setIsSheetsConfigured(SheetsSyncService.isConfigured());
  }, []);

  // Trigger background auto-push to Google Sheets if configured
  const triggerAutoPush = useCallback(() => {
    const cfg = SheetsSyncService.getConfig();
    if (cfg.webAppUrl && cfg.autoSyncEnabled) {
      setIsSheetsSyncing(true);
      SheetsSyncService.pushToSheets()
        .catch(() => {})
        .finally(() => {
          setIsSheetsSyncing(false);
        });
    }
  }, []);

  // Real-Time Polling & Tab-Focus Background Sync
  useEffect(() => {
    const doPull = async () => {
      const cfg = SheetsSyncService.getConfig();
      if (cfg.webAppUrl && cfg.autoSyncEnabled) {
        setIsSheetsSyncing(true);
        const res = await SheetsSyncService.pullFromSheets();
        setIsSheetsSyncing(false);
        if (res.success) {
          reloadData();
        }
      }
    };

    // Initial pull on mount if configured
    if (SheetsSyncService.isConfigured()) {
      doPull();
    }

    // Interval polling every 25 seconds for cross-device real-time updates
    const interval = setInterval(() => {
      doPull();
    }, 25000);

    // Sync on window focus when user returns to this tab
    const handleFocus = () => {
      doPull();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [reloadData]);

  // Quick Action Handler from Dashboard
  const handleQuickAction = (
    action:
      | 'new_consultation'
      | 'new_collaboration'
      | 'new_case'
      | 'new_student'
      | 'new_activity'
  ) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    if (action === 'new_consultation') {
      setActiveTab('consultations');
      setIsDirectActionModalOpen(true);
    } else if (action === 'new_collaboration') {
      setActiveTab('collaborations');
      setIsDirectActionModalOpen(true);
    } else if (action === 'new_case') {
      setActiveTab('cases');
      setIsDirectActionModalOpen(true);
    } else if (action === 'new_student') {
      setActiveTab('students');
      setIsDirectActionModalOpen(true);
    } else if (action === 'new_activity') {
      setActiveTab('activities');
      setIsDirectActionModalOpen(true);
    }
  };

  // Student Actions
  const handleSaveStudent = (st: Student) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.saveStudent(st);
    reloadData();
    triggerAutoPush();
  };

  const handleDeleteStudent = (id: string) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.deleteStudent(id);
    reloadData();
    triggerAutoPush();
  };

  const handlePrintStudent = (st: Student) => {
    setPrintDocType('student_profile');
    setPrintSelectedStudent(st);
    setIsPrintModalOpen(true);
  };

  // Activity Log Actions
  const handleSaveActivity = (item: ActivityLog) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.saveActivity(item);
    reloadData();
    triggerAutoPush();
  };

  const handleDeleteActivity = (id: string) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.deleteActivity(id);
    reloadData();
    triggerAutoPush();
  };

  // Consultation Actions
  const handleSaveConsultation = (item: Consultation) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.saveConsultation(item);
    reloadData();
    triggerAutoPush();
  };

  const handleDeleteConsultation = (id: string) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.deleteConsultation(id);
    reloadData();
    triggerAutoPush();
  };

  const handlePrintConsultationReport = (period: string, studentId?: string) => {
    setPrintDocType('consultation_report');
    setPrintPeriod(period);
    if (studentId) {
      const st = students.find((s) => s.id === studentId);
      setPrintFilterStudentName(st?.name || '');
    } else {
      setPrintFilterStudentName('');
    }
    setIsPrintModalOpen(true);
  };

  // Collaboration Actions
  const handleSaveCollaboration = (item: Collaboration) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.saveCollaboration(item);
    reloadData();
    triggerAutoPush();
  };

  const handleDeleteCollaboration = (id: string) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.deleteCollaboration(id);
    reloadData();
    triggerAutoPush();
  };

  const handlePrintCollaborationReport = (period: string, studentId?: string) => {
    setPrintDocType('collaboration_report');
    setPrintPeriod(period);
    if (studentId) {
      const st = students.find((s) => s.id === studentId);
      setPrintFilterStudentName(st?.name || '');
    } else {
      setPrintFilterStudentName('');
    }
    setIsPrintModalOpen(true);
  };

  // Case Actions
  const handleSaveCase = (item: StudentCase) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.saveCase(item);
    reloadData();
    triggerAutoPush();
  };

  const handleDeleteCase = (id: string) => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.deleteCase(id);
    reloadData();
    triggerAutoPush();
  };

  const handlePrintCaseReport = (cas: StudentCase) => {
    setPrintDocType('case_journal');
    setPrintSelectedCase(cas);
    setIsPrintModalOpen(true);
  };

  // Unified Journal Print
  const handlePrintJournalReport = (period: string, studentId?: string) => {
    setPrintDocType('unified_journal');
    setPrintPeriod(period);
    if (studentId) {
      const st = students.find((s) => s.id === studentId);
      setPrintFilterStudentName(st?.name || '');
    } else {
      setPrintFilterStudentName('');
    }
    setIsPrintModalOpen(true);
  };

  // Cross-Navigation Helper
  const handleNavigateFromJournal = (tab: 'consultations' | 'collaborations' | 'cases', detailId?: string) => {
    if (tab === 'cases' && detailId) {
      setSelectedCaseIdForView(detailId);
    }
    setActiveTab(tab);
  };

  // Save Settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    StorageService.saveProfile(profileForm);
    setProfile(profileForm);
    setIsSettingsOpen(false);
    triggerAutoPush();
  };

  const handleResetData = () => {
    if (!isAdmin) {
      handleRequireAdmin();
      return;
    }
    if (confirm('PERINGATAN: Anda yakin ingin menghapus / mengosongkan semua data (profil siswa, kegiatan pembiasaan, konsultasi, kolaborasi, dan kasus)?')) {
      StorageService.clearAll();
      reloadData();
      setIsSettingsOpen(false);
      triggerAutoPush();
      alert('Semua data berhasil dikosongkan.');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] font-sans overflow-hidden text-slate-900 selection:bg-blue-200">
      {/* Desktop Clean Minimalism Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsDirectActionModalOpen(false);
          setActiveTab(tab);
        }}
        profile={profile}
        isAdmin={isAdmin}
        escalatedCount={cases.filter((c) => c.status === 'Eskalasi' || c.isEscalatedToPrincipal).length}
        totalStudents={students.length}
        totalActivities={activities.length}
        isSheetsConfigured={isSheetsConfigured}
        onOpenSheetsSync={() => {
          if (!isAdmin) {
            handleRequireAdmin();
            return;
          }
          setIsSheetsModalOpen(true);
        }}
        onOpenSettings={() => {
          setProfileForm(profile);
          setIsSettingsOpen(true);
        }}
        onQuickPrint={() => {
          setPrintDocType('consultation_report');
          setPrintPeriod('');
          setIsPrintModalOpen(true);
        }}
        onOpenAuthModal={handleRequireAdmin}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader
          profile={profile}
          activeTab={activeTab}
          isAdmin={isAdmin}
          escalatedCount={cases.filter((c) => c.status === 'Eskalasi' || c.isEscalatedToPrincipal).length}
          isSheetsConfigured={isSheetsConfigured}
          isSheetsSyncing={isSheetsSyncing}
          onOpenSheetsSync={() => {
            if (!isAdmin) {
              handleRequireAdmin();
              return;
            }
            setIsSheetsModalOpen(true);
          }}
          onOpenSettings={() => {
            setProfileForm(profile);
            setIsSettingsOpen(true);
          }}
          onQuickPrint={() => {
            if (activeTab === 'students') {
              if (students.length > 0) handlePrintStudent(students[0]);
              else setIsPrintModalOpen(true);
            } else if (activeTab === 'consultations') {
              handlePrintConsultationReport('');
            } else if (activeTab === 'collaborations') {
              handlePrintCollaborationReport('');
            } else if (activeTab === 'cases') {
              if (cases.length > 0) handlePrintCaseReport(cases[0]);
              else setIsPrintModalOpen(true);
            } else if (activeTab === 'journal') {
              handlePrintJournalReport('');
            } else {
              setPrintDocType('consultation_report');
              setPrintPeriod('');
              setIsPrintModalOpen(true);
            }
          }}
          onQuickNewAction={() => {
            if (!isAdmin) {
              handleRequireAdmin();
              return;
            }
            if (activeTab === 'dashboard') {
              handleQuickAction('new_consultation');
            } else {
              setIsDirectActionModalOpen(true);
            }
          }}
          onResetData={handleResetData}
          onOpenAuthModal={handleRequireAdmin}
          onLogoutAdmin={handleLogoutAdmin}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              consultations={consultations}
              collaborations={collaborations}
              cases={cases}
              activities={activities}
              profile={profile}
              isAdmin={isAdmin}
              onRequireAdmin={handleRequireAdmin}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onQuickAction={handleQuickAction}
              onSelectStudent={(st) => {
                setActiveTab('students');
              }}
              onSelectCase={(c) => {
                setSelectedCaseIdForView(c.id);
                setActiveTab('cases');
              }}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              profile={profile}
              isAdmin={isAdmin}
              onRequireAdmin={handleRequireAdmin}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onPrintStudent={handlePrintStudent}
              isOpenNewDirectly={isDirectActionModalOpen}
              onCloseNewDirectly={() => setIsDirectActionModalOpen(false)}
            />
          )}

          {activeTab === 'activities' && (
            <ActivitiesView
              activities={activities}
              students={students}
              profile={profile}
              isAdmin={isAdmin}
              onRequireAdmin={handleRequireAdmin}
              onSaveActivity={handleSaveActivity}
              onDeleteActivity={handleDeleteActivity}
              isOpenNewDirectly={isDirectActionModalOpen}
              onCloseNewDirectly={() => setIsDirectActionModalOpen(false)}
            />
          )}

          {activeTab === 'consultations' && (
            <ConsultationsView
              consultations={consultations}
              students={students}
              profile={profile}
              isAdmin={isAdmin}
              onRequireAdmin={handleRequireAdmin}
              onSaveConsultation={handleSaveConsultation}
              onDeleteConsultation={handleDeleteConsultation}
              onPrintConsultationReport={handlePrintConsultationReport}
              isOpenNewDirectly={isDirectActionModalOpen}
              onCloseNewDirectly={() => setIsDirectActionModalOpen(false)}
            />
          )}

          {activeTab === 'collaborations' && (
            <CollaborationsView
              collaborations={collaborations}
              students={students}
              profile={profile}
              isAdmin={isAdmin}
              onRequireAdmin={handleRequireAdmin}
              onSaveCollaboration={handleSaveCollaboration}
              onDeleteCollaboration={handleDeleteCollaboration}
              onPrintCollaborationReport={handlePrintCollaborationReport}
              isOpenNewDirectly={isDirectActionModalOpen}
              onCloseNewDirectly={() => setIsDirectActionModalOpen(false)}
            />
          )}

          {activeTab === 'cases' && (
            <CasesView
              cases={cases}
              students={students}
              profile={profile}
              isAdmin={isAdmin}
              onRequireAdmin={handleRequireAdmin}
              selectedCaseId={selectedCaseIdForView}
              onSaveCase={handleSaveCase}
              onDeleteCase={handleDeleteCase}
              onPrintCaseReport={handlePrintCaseReport}
              isOpenNewDirectly={isDirectActionModalOpen}
              onCloseNewDirectly={() => setIsDirectActionModalOpen(false)}
            />
          )}

          {activeTab === 'journal' && (
            <JournalView
              students={students}
              consultations={consultations}
              collaborations={collaborations}
              cases={cases}
              profile={profile}
              onPrintJournalReport={handlePrintJournalReport}
              onNavigateToTab={handleNavigateFromJournal}
            />
          )}
        </main>
      </div>

      {/* Mobile-First Floating Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsDirectActionModalOpen(false);
          setActiveTab(tab);
        }}
        escalatedCount={cases.filter((c) => c.status === 'Eskalasi' || c.isEscalatedToPrincipal).length}
        totalStudents={students.length}
        totalActivities={activities.length}
      />

      {/* GLOBAL PRINT / EXPORT PDF MODAL */}
      <PrintDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        docType={printDocType}
        profile={profile}
        student={printSelectedStudent}
        consultations={
          printPeriod
            ? consultations.filter((c) => c.date.startsWith(printPeriod))
            : consultations
        }
        collaborations={
          printPeriod
            ? collaborations.filter((c) => c.date.startsWith(printPeriod))
            : collaborations
        }
        studentCase={printSelectedCase}
        period={printPeriod}
        filterStudentName={printFilterStudentName}
      />

      {/* SETTINGS / PROFILE MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pengaturan Profil & Kop Sekolah
                  </h3>
                  <p className="text-xs text-slate-300">
                    Identitas Guru Wali & Dokumen Resmi SMKN 2 Gorontalo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* Guru Wali Info */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2.5">
                <h4 className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                  <User className="w-4 h-4 text-blue-800" />
                  Identitas Guru Wali (Pengguna Utama)
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Guru Wali *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.homeroomTeacherName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, homeroomTeacherName: e.target.value })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NIP Guru Wali
                    </label>
                    <input
                      type="text"
                      value={profileForm.homeroomTeacherNip}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, homeroomTeacherNip: e.target.value })
                      }
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tahun Ajaran
                    </label>
                    <input
                      type="text"
                      value={profileForm.schoolYear}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, schoolYear: e.target.value })
                      }
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={profileForm.semester}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, semester: e.target.value })
                      }
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Program Keahlian
                    </label>
                    <input
                      type="text"
                      value={profileForm.expertiseProgram}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, expertiseProgram: e.target.value })
                      }
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sekolah & Kepala Sekolah */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <School className="w-4 h-4 text-slate-700" />
                  Kop Dokumen Resmi & Kepala Sekolah
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Sekolah
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, address: e.target.value })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={profileForm.principalName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, principalName: e.target.value })
                      }
                      placeholder="Drs. Jakub A GuE"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={profileForm.principalNip}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, principalNip: e.target.value })
                      }
                      placeholder="196706081994121002"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Google Sheets Integration Quick Link inside Settings */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      Sinkronisasi Google Spreadsheet
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      {isSheetsConfigured ? 'Status: Terhubung (Cloud Real-Time)' : 'Status: Belum Dikonfigurasi'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsSheetsModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Buka Pengaturan Cloud
                </button>
              </div>

              {/* Reset to Empty State */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Hapus / Kosongkan Semua Data</span>
                </button>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                >
                  Tutup
                </button>
                <button
                  id="save-profile-settings-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold shadow-md flex items-center gap-1.5 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Real-Time Cloud Sync Modal */}
      <SheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => {
          setIsSheetsModalOpen(false);
          setIsSheetsConfigured(SheetsSyncService.isConfigured());
        }}
        students={students}
        consultations={consultations}
        collaborations={collaborations}
        cases={cases}
        profile={profile}
        onSyncComplete={() => {
          reloadData();
        }}
      />

      {/* Admin Authentication Password Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={handleLoginAdmin}
      />
    </div>
  );
}
export default App;
