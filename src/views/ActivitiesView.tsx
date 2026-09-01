import React, { useState, useMemo, useEffect } from 'react';
import { ActivityLog, ActivityType, ActivityCategory, RombelType, SchoolProfile } from '../types';
import { DriveImage } from '../components/DriveImage';
import { extractDriveFileId, DRIVE_GUIDE_STEPS } from '../utils/imageHelper';
import { formatIndonesianDate } from '../utils/formatters';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  HelpCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  Printer,
  ChevronRight,
  X,
  Save,
  BookOpen,
  HeartHandshake,
  Sun,
  Flame,
  Dumbbell,
  Sparkle,
  Building,
  CloudUpload,
  CloudCheck,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

interface ActivitiesViewProps {
  activities: ActivityLog[];
  profile: SchoolProfile;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  onSaveActivity: (activity: ActivityLog) => void;
  onDeleteActivity: (id: string) => void;
  onPrintActivities?: (activities: ActivityLog[], title: string) => void;
  onOpenSheetsSync?: () => void;
  onSyncNow?: () => Promise<void>;
  isSyncingSheets?: boolean;
  isOpenNewDirectly?: boolean;
  onCloseNewDirectly?: () => void;
}

const CATEGORY_OPTIONS: { label: ActivityCategory; type: ActivityType; icon: any }[] = [
  { label: 'Religi & Sholat Dhuha', type: 'Harian', icon: Sun },
  { label: 'Literasi Pagi', type: 'Harian', icon: BookOpen },
  { label: 'Kebersihan & Lingkungan', type: 'Harian', icon: Sparkle },
  { label: 'Senam & Olahraga', type: 'Harian', icon: Dumbbell },
  { label: 'Upacara & Apel', type: 'Mingguan', icon: Building },
  { label: 'Evaluasi & Refleksi Perwalian', type: 'Mingguan', icon: Flame },
  { label: 'Bimbingan Klasikal', type: 'Mingguan', icon: Users },
  { label: 'Parenting / Temu Wali Murid', type: 'Bulanan', icon: HeartHandshake },
  { label: 'Asesmen Perkembangan', type: 'Bulanan', icon: Sparkles },
  { label: 'Bakti Sosial & Aksi Nyata', type: 'Bulanan', icon: Users },
  { label: 'Lainnya', type: 'Harian', icon: Calendar },
];

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  profile,
  isAdmin = false,
  onRequireAdmin,
  onSaveActivity,
  onDeleteActivity,
  onPrintActivities,
  onOpenSheetsSync,
  onSyncNow,
  isSyncingSheets = false,
  isOpenNewDirectly = false,
  onCloseNewDirectly,
}) => {
  // Tabs: all, Harian, Mingguan, Bulanan
  const [activeTab, setActiveTab] = useState<'ALL' | ActivityType>('ALL');
  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Form State
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<ActivityLog | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [showDriveGuide, setShowDriveGuide] = useState<boolean>(false);

  // Handle direct open new from quick action
  useEffect(() => {
    if (isOpenNewDirectly) {
      handleOpenNew();
      if (onCloseNewDirectly) onCloseNewDirectly();
    }
  }, [isOpenNewDirectly]);

  const handleManualSync = async () => {
    if (onSyncNow) {
      setSyncFeedback('Menyinkronkan ke Google Spreadsheet...');
      try {
        await onSyncNow();
        setSyncFeedback('Data Kegiatan Berhasil Disinkronkan ke Spreadsheet!');
        setTimeout(() => setSyncFeedback(null), 4000);
      } catch {
        setSyncFeedback('Gagal menyinkronkan. Periksa koneksi Spreadsheet.');
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } else if (onOpenSheetsSync) {
      onOpenSheetsSync();
    }
  };

  // Detail Modal
  const [viewingActivity, setViewingActivity] = useState<ActivityLog | null>(null);

  // Quick Template Handler
  const handleApplyTemplate = (categoryName: string, type: ActivityType) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    const today = new Date().toISOString().substring(0, 10);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = dayNames[new Date().getDay()];

    let defaultTitle = categoryName;
    let defaultTime = '07:00 - 07:30';
    let defaultDesc = '';
    let defaultOutcome = 'Kegiatan terlaksana dengan baik, murid hadir tertib dan aktif.';
    let defaultPhoto = '';

    if (categoryName === 'Religi & Sholat Dhuha') {
      defaultTitle = "Sholat Dhuha Berjamaah & Tadarus Al-Qur'an";
      defaultTime = '06:50 - 07:25';
      defaultDesc = 'Pembiasaan sholat dhuha berjamaah dan tadarus surah pendek di musholla sekolah.';
      defaultPhoto = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=400&q=80';
    } else if (categoryName === 'Literasi Pagi') {
      defaultTitle = 'Literasi Pagi: Membaca & Bedah Karya Desain DKV';
      defaultTime = '07:15 - 07:45';
      defaultDesc = 'Kegiatan 15 menit membaca buku referensi desain visual dan apresiasi karya poster.';
      defaultPhoto = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80';
    } else if (categoryName === 'Kebersihan & Lingkungan') {
      defaultTitle = 'Piket Kebersihan Kelas & Penataan Studio Komputer DKV';
      defaultTime = '15:20 - 15:45';
      defaultDesc = 'Pembersihan meja kerja komputer, penataan kabel, dan penyapuan lantai ruang kelas.';
      defaultPhoto = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80';
    } else if (categoryName === 'Senam & Olahraga') {
      defaultTitle = 'Senam Pagi Kebugaran & Peregangan Ergonomis Komputer';
      defaultTime = '06:45 - 07:15';
      defaultDesc = 'Senam bersama di lapangan sekolah dan peregangan postur ergonomis bagi siswa DKV.';
      defaultPhoto = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80';
    } else if (categoryName === 'Upacara & Apel') {
      defaultTitle = 'Upacara Bendera Hari Senin & Apel Pembinaan Disiplin';
      defaultTime = '07:00 - 08:00';
      defaultDesc = 'Upacara bendera penaikan Sang Merah Putih dan pembinaan kedisiplinan serta kerapihan.';
      defaultPhoto = 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=400&q=80';
    } else if (categoryName === 'Parenting / Temu Wali Murid') {
      defaultTitle = 'Pertemuan Paguyuban Orang Tua / Parenting Murid DKV';
      defaultTime = '09:00 - 11:30';
      defaultDesc = 'Sosialisasi perkembangan belajar, portofolio karya, dan sinergi bimbingan dengan orang tua.';
      defaultPhoto = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80';
    }

    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      title: defaultTitle,
      type: type,
      category: categoryName,
      date: today,
      time: defaultTime,
      dayName: currentDay,
      rombel: 'Semua Rombel',
      targetParticipants: 'Seluruh Siswa Binaan DKV',
      actualAttendanceCount: 35,
      status: 'Terlaksana',
      location: 'SMK Negeri 2 Gorontalo',
      description: defaultDesc,
      outcome: defaultOutcome,
      photoUrl: defaultPhoto,
      leaderOrPic: profile.homeroomTeacherName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingActivity(newAct);
    setIsCreatingNew(true);
  };

  const handleOpenNew = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    const today = new Date().toISOString().substring(0, 10);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = dayNames[new Date().getDay()];

    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      title: '',
      type: activeTab === 'ALL' ? 'Harian' : activeTab,
      category: 'Religi & Sholat Dhuha',
      date: today,
      time: '07:00 - 07:30',
      dayName: currentDay,
      rombel: 'Semua Rombel',
      targetParticipants: 'Siswa Binaan DKV',
      actualAttendanceCount: 35,
      status: 'Terlaksana',
      location: 'SMK Negeri 2 Gorontalo',
      description: '',
      outcome: '',
      photoUrl: '',
      leaderOrPic: profile.homeroomTeacherName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingActivity(newAct);
    setIsCreatingNew(true);
  };

  const handleOpenEdit = (act: ActivityLog) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingActivity(JSON.parse(JSON.stringify(act)));
    setIsCreatingNew(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    if (!editingActivity.title.trim()) {
      alert('Judul kegiatan wajib diisi.');
      return;
    }
    onSaveActivity(editingActivity);
    setEditingActivity(null);
    setIsCreatingNew(false);
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Tab filter
      if (activeTab !== 'ALL' && act.type !== activeTab) return false;
      // Rombel filter
      if (selectedRombel !== 'ALL' && act.rombel !== selectedRombel && act.rombel !== 'Semua Rombel') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchCat = act.category.toLowerCase().includes(q);
        const matchDesc = act.description.toLowerCase().includes(q);
        const matchLoc = (act.location || '').toLowerCase().includes(q);
        return matchTitle || matchCat || matchDesc || matchLoc;
      }
      return true;
    });
  }, [activities, activeTab, selectedRombel, searchQuery]);

  // Counts
  const harianCount = activities.filter((a) => a.type === 'Harian').length;
  const mingguanCount = activities.filter((a) => a.type === 'Mingguan').length;
  const bulananCount = activities.filter((a) => a.type === 'Bulanan').length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header & Title Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Program Perwalian DKV
              </span>
              <span className="text-xs text-blue-200">
                T.A. {profile.schoolYear} - Semester {profile.semester}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
              Halaman Kegiatan Pembiasaan & Program Wali
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              Pencatatan dan dokumentasi kegiatan harian (Sholat Dhuha, Literasi, Kebersihan, Olahraga),
              mingguan (Upacara, Evaluasi), dan bulanan (Parenting, Asesmen) dengan foto terintegrasi Google Drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncingSheets}
              className={`px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs transition-all border flex items-center gap-1.5 ${
                isSyncingSheets
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/30 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Sinkronkan Kegiatan Pembiasaan & Program Wali ke Google Spreadsheet"
            >
              {isSyncingSheets ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Menyinkronkan...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Sinkronkan ke Cloud</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowDriveGuide(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-all border border-white/20 flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-blue-200" />
              <span>Panduan Link Drive</span>
            </button>
            <button
              onClick={handleOpenNew}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan</span>
            </button>
          </div>
        </div>

        {syncFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CloudCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Quick Template Chips */}
        <div className="mt-5 pt-4 border-t border-white/15">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Format Cepat Kegiatan (1-Klik Isi):</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleApplyTemplate('Religi & Sholat Dhuha', 'Harian')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Sholat Dhuha</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('Literasi Pagi', 'Harian')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>+ Literasi Pagi</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('Kebersihan & Lingkungan', 'Harian')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <Sparkle className="w-3.5 h-3.5 text-emerald-300" />
              <span>+ Kebersihan Kelas</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('Senam & Olahraga', 'Harian')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <Dumbbell className="w-3.5 h-3.5 text-rose-300" />
              <span>+ Senam & Olahraga</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('Upacara & Apel', 'Mingguan')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <Building className="w-3.5 h-3.5 text-cyan-300" />
              <span>+ Upacara Bendera</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('Parenting / Temu Wali Murid', 'Bulanan')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
              <span>+ Pertemuan Parenting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs: Harian, Mingguan, Bulanan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Semua Kegiatan</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'ALL' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Harian')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'Harian'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>a. Kegiatan Harian</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'Harian' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200/80 text-emerald-800'
              }`}
            >
              {harianCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Mingguan')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'Mingguan'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>b. Kegiatan Mingguan</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'Mingguan' ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-200/80 text-indigo-800'
              }`}
            >
              {mingguanCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Bulanan')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'Bulanan'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>c. Kegiatan Bulanan</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'Bulanan' ? 'bg-purple-700 text-purple-100' : 'bg-purple-200/80 text-purple-800'
              }`}
            >
              {bulananCount}
            </span>
          </button>
        </div>

        {/* Filter Rombel & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRombel}
            onChange={(e) => setSelectedRombel(e.target.value)}
            className="p-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Semua Rombel</option>
            <option value="10-DKV-1">10-DKV-1</option>
            <option value="10-DKV-3">10-DKV-3</option>
            <option value="11-DKV-3">11-DKV-3</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 w-36 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Grid List of Activities */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Catatan Kegiatan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Gunakan tombol Tambah Kegiatan atau klik template cepat di atas untuk mencatat Sholat Dhuha, Literasi, Kebersihan, Senam, Upacara, atau Pertemuan Orang Tua.
          </p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Catat Kegiatan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map((act) => {
            const isHarian = act.type === 'Harian';
            const isMingguan = act.type === 'Mingguan';
            const isBulanan = act.type === 'Bulanan';

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Photo Header (Low Resolution Google Drive / URL) */}
                <div
                  onClick={() => setViewingActivity(act)}
                  className="h-44 w-full bg-slate-100 relative cursor-pointer overflow-hidden"
                >
                  <DriveImage
                    src={act.photoUrl}
                    alt={act.title}
                    preset="low"
                    fallbackType="activity"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    showZoomIcon
                  />
                  {/* Badge Tipe */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-xs text-white ${
                        isHarian
                          ? 'bg-emerald-600'
                          : isMingguan
                          ? 'bg-indigo-600'
                          : 'bg-purple-600'
                      }`}
                    >
                      {act.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 backdrop-blur-xs text-white">
                      {act.rombel}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500 text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{act.status}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {act.category}
                      </span>
                      <span>•</span>
                      <span>
                        {act.dayName ? `${act.dayName}, ` : ''}
                        {formatIndonesianDate(act.date)}
                      </span>
                    </div>

                    <h3
                      onClick={() => setViewingActivity(act)}
                      className="font-bold text-slate-900 text-sm hover:text-blue-700 cursor-pointer line-clamp-2 leading-snug"
                    >
                      {act.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Metadata items */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{act.time || 'Waktu Pagi'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{act.actualAttendanceCount || 30} Hadir</span>
                      </div>
                    </div>

                    {act.location && (
                      <div className="flex items-center gap-1.5 text-slate-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={() => setViewingActivity(act)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {isAdmin ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(act)}
                          title="Edit Kegiatan"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setActivityToDelete(act)}
                          title="Hapus Kegiatan"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL: TAMBAH / EDIT KEGIATAN */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-base">
                  {isCreatingNew ? 'Tambah Kegiatan Baru' : 'Edit Data Kegiatan'}
                </h3>
              </div>
              <button
                onClick={() => setEditingActivity(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Tipe & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipe Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editingActivity.type}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        type: e.target.value as ActivityType,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Harian">a. Harian (Sholat Dhuha, Literasi, Kebersihan, Olahraga)</option>
                    <option value="Mingguan">b. Mingguan (Upacara, Evaluasi, Bimbingan)</option>
                    <option value="Bulanan">c. Bulanan (Parenting, Asesmen, Bakti Sosial)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori / Sub-Jenis <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editingActivity.category}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-600"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Judul Kegiatan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama / Judul Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sholat Dhuha Berjamaah & Tadarus Al-Qur'an"
                  value={editingActivity.title}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Tanggal, Hari, Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    value={editingActivity.date}
                    onChange={(e) => {
                      const val = e.target.value;
                      const dayIdx = new Date(val).getDay();
                      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                      setEditingActivity({
                        ...editingActivity,
                        date: val,
                        dayName: dayNames[dayIdx] || 'Senin',
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hari</label>
                  <input
                    type="text"
                    placeholder="Senin / Selasa / etc"
                    value={editingActivity.dayName || ''}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, dayName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    placeholder="Contoh: 07:00 - 07:30"
                    value={editingActivity.time || ''}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, time: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Rombel, Kehadiran, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sasaran Rombel</label>
                  <select
                    value={editingActivity.rombel}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        rombel: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Semua Rombel">Semua Rombel (10 & 11 DKV)</option>
                    <option value="10-DKV-1">10-DKV-1</option>
                    <option value="10-DKV-3">10-DKV-3</option>
                    <option value="11-DKV-3">11-DKV-3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Hadir</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="35"
                    value={editingActivity.actualAttendanceCount || ''}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        actualAttendanceCount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Kegiatan</label>
                  <select
                    value={editingActivity.status}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Terlaksana">Terlaksana</option>
                    <option value="Berlangsung">Berlangsung</option>
                    <option value="Terjadwal">Terjadwal</option>
                  </select>
                </div>
              </div>

              {/* Lokasi & PIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lokasi Pelaksanaan
                  </label>
                  <input
                    type="text"
                    placeholder="Musholla As-Salam / Ruang Kelas / Lab DKV"
                    value={editingActivity.location || ''}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, location: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Guru Pembina / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    placeholder="Abdul Rahman Bahsoan (Guru Wali)"
                    value={editingActivity.leaderOrPic || ''}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, leaderOrPic: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* FOTO DOKUMENTASI GOOGLE DRIVE (LOW RESOLUTION AUTO OPTIMIZED) */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-blue-950 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-700" />
                    <span>Foto Dokumentasi (Link Google Drive / URL Foto)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDriveGuide(true)}
                    className="text-[11px] text-blue-700 hover:text-blue-900 underline font-medium"
                  >
                    Cara Ambil Link Drive?
                  </button>
                </div>

                <p className="text-[11px] text-slate-600">
                  Tempelkan link share Google Drive atau URL gambar. Sistem akan otomatis mengonversi ke resolusi rendah (ringan & cepat dimuat).
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full flex-1">
                    <input
                      type="text"
                      placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                      value={editingActivity.photoUrl || ''}
                      onChange={(e) =>
                        setEditingActivity({ ...editingActivity, photoUrl: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="w-20 h-16 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                    <DriveImage
                      src={editingActivity.photoUrl}
                      alt="Preview Dokumentasi"
                      preset="low"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Deskripsi & Evaluasi */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi & Rincian Pelaksanaan Kegiatan
                </label>
                <textarea
                  rows={3}
                  placeholder="Rincikan alur pelaksanaan kegiatan, pembiasaan yang diterapkan..."
                  value={editingActivity.description}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hasil Kegiatan / Catatan Evaluasi
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan ketercapaian, antusiasme murid, tindak lanjut..."
                  value={editingActivity.outcome || ''}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, outcome: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                {!isCreatingNew && (
                  <button
                    type="button"
                    onClick={() => {
                      const act = editingActivity;
                      setEditingActivity(null);
                      setActivityToDelete(act);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Hapus kegiatan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingActivity(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Kegiatan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: LIHAT DOKUMENTASI KEGIATAN */}
      {viewingActivity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Image Header with Full Resolution or Medium */}
            <div className="h-64 sm:h-72 w-full bg-slate-900 relative">
              <DriveImage
                src={viewingActivity.photoUrl}
                alt={viewingActivity.title}
                preset="medium"
                className="w-full h-full object-contain bg-slate-950"
              />
              <button
                onClick={() => setViewingActivity(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-900 text-white shadow-md">
                  {viewingActivity.type}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/70 text-white">
                  {viewingActivity.rombel}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-bold text-xs">
                  {viewingActivity.category}
                </span>
                <span className="text-slate-500 font-medium">
                  {viewingActivity.dayName ? `${viewingActivity.dayName}, ` : ''}
                  {formatIndonesianDate(viewingActivity.date)}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {viewingActivity.title}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Waktu</p>
                  <p className="font-semibold text-slate-800">{viewingActivity.time || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Lokasi</p>
                  <p className="font-semibold text-slate-800">{viewingActivity.location || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Partisipan</p>
                  <p className="font-semibold text-slate-800">
                    {viewingActivity.actualAttendanceCount || 30} Siswa Hadir
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Pembina</p>
                  <p className="font-semibold text-slate-800 truncate">
                    {viewingActivity.leaderOrPic || profile.homeroomTeacherName}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Rincian Kegiatan:</h4>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {viewingActivity.description || 'Tidak ada catatan tambahan.'}
                </p>
              </div>

              {viewingActivity.outcome && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Hasil & Evaluasi:</h4>
                  <p className="text-emerald-900 bg-emerald-50/80 p-3 rounded-lg border border-emerald-200 leading-relaxed">
                    {viewingActivity.outcome}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                {isAdmin ? (
                  <button
                    onClick={() => {
                      const act = viewingActivity;
                      setViewingActivity(null);
                      setActivityToDelete(act);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Hapus Kegiatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Kegiatan</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    Mode Tamu (Hanya Lihat)
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <button
                      onClick={() => {
                        const act = viewingActivity;
                        setViewingActivity(null);
                        handleOpenEdit(act);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Kegiatan</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => setViewingActivity(null)}
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANDUAN LINK GOOGLE DRIVE MODAL */}
      {showDriveGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-blue-900">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-base">Panduan Memasang Foto dari Google Drive</h3>
              </div>
              <button
                onClick={() => setShowDriveGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Aplikasi siWali mendukung foto yang dipasang langsung dari Google Drive dengan <strong>resolusi rendah otomatis</strong> agar aplikasi tetap cepat dan hemat kuota data internet.
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

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Tips Penting:</strong> Pastikan saat membagikan foto di Google Drive, opsi akses diset ke <em>"Siapa saja yang memiliki link dapat melihat" (Anyone with link can view)</em> agar foto bisa ditampilkan di perangkat mana pun.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDriveGuide(false)}
                className="px-5 py-2 rounded-xl bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!activityToDelete}
        title="Hapus Dokumentasi Kegiatan"
        message="Apakah Anda yakin ingin menghapus kegiatan ini? Foto dokumentasi dan rincian ketercapaian akan dihapus permanen."
        itemName={activityToDelete ? `${activityToDelete.title} (${activityToDelete.type} - ${activityToDelete.rombel})` : undefined}
        confirmLabel="Ya, Hapus Kegiatan"
        onConfirm={() => {
          if (activityToDelete) {
            onDeleteActivity(activityToDelete.id);
            setActivityToDelete(null);
          }
        }}
        onClose={() => setActivityToDelete(null)}
      />
    </div>
  );
};
