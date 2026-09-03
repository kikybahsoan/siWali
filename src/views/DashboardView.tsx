import React, { useState, useMemo } from 'react';
import {
  Student,
  Consultation,
  Collaboration,
  StudentCase,
  SchoolProfile,
  ActivityLog,
  ActivityType,
} from '../types';
import { TabType } from '../components/BottomNav';
import { DriveImage } from '../components/DriveImage';
import {
  Users,
  MessageSquareText,
  UsersRound,
  GitFork,
  ChevronRight,
  PlusCircle,
  BookOpen,
  Calendar,
  Search,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  Award,
  Sun,
  Dumbbell,
  Sparkle,
  Building,
  HeartHandshake,
  CalendarCheck,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Image as ImageIcon,
  Camera,
  Eye,
  Clock,
  User,
  Tag,
  X,
  ExternalLink,
  Layers,
  Filter,
  Check,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  students: Student[];
  consultations: Consultation[];
  collaborations: Collaboration[];
  cases: StudentCase[];
  activities?: ActivityLog[];
  profile: SchoolProfile;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  onNavigateToTab?: (tab: TabType) => void;
  onNavigate?: (tab: TabType) => void;
  onQuickAction?: (action: 'new_consultation' | 'new_collaboration' | 'new_case' | 'new_student' | 'new_activity') => void;
  onSelectStudent?: (student: Student) => void;
  onSelectCase?: (studentCase: StudentCase) => void;
  onOpenNewConsultation?: () => void;
  onOpenNewCollaboration?: () => void;
  onOpenNewCase?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  consultations,
  collaborations,
  cases,
  activities = [],
  profile,
  isAdmin = false,
  onRequireAdmin,
  onNavigateToTab,
  onNavigate,
  onQuickAction,
  onSelectStudent,
  onSelectCase,
  onOpenNewConsultation,
  onOpenNewCollaboration,
  onOpenNewCase,
}) => {
  const [tableSearch, setTableSearch] = useState<string>('');
  const [galleryFilter, setGalleryFilter] = useState<'ALL' | ActivityType | 'WITH_PHOTO'>('ALL');
  const [previewActivity, setPreviewActivity] = useState<ActivityLog | null>(null);

  const navigate = (tab: TabType) => {
    if (onNavigateToTab) onNavigateToTab(tab);
    else if (onNavigate) onNavigate(tab);
  };

  const handleCreateConsultation = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    if (onOpenNewConsultation) onOpenNewConsultation();
    else if (onQuickAction) onQuickAction('new_consultation');
    else navigate('consultations');
  };

  const handleCreateCollaboration = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    if (onOpenNewCollaboration) onOpenNewCollaboration();
    else if (onQuickAction) onQuickAction('new_collaboration');
    else navigate('collaborations');
  };

  const handleCreateCase = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    if (onOpenNewCase) onOpenNewCase();
    else if (onQuickAction) onQuickAction('new_case');
    else navigate('cases');
  };

  const handleCreateActivity = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    if (onQuickAction) onQuickAction('new_activity');
    else navigate('activities');
  };

  // Calculations
  const totalStudents = students.length;
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyConsultations =
    consultations.filter((c) => c.date.startsWith(currentMonth)).length || consultations.length;
  const activeCasesList = cases.filter((c) => c.status === 'Aktif' || c.status === 'Eskalasi');
  const escalatedCasesList = cases.filter((c) => c.status === 'Eskalasi' || c.isEscalatedToPrincipal);
  const activeCasesCount = activeCasesList.length;
  const escalatedCount = escalatedCasesList.length;

  const academicCasesCount = cases.filter((c) => c.pathway === 'Jalur A').length;
  const socialCasesCount = cases.filter((c) => c.pathway === 'Jalur B' || !c.pathway).length;

  // Activities metrics
  const harianCount = activities.filter((a) => a.type === 'Harian').length;
  const mingguanCount = activities.filter((a) => a.type === 'Mingguan').length;
  const bulananCount = activities.filter((a) => a.type === 'Bulanan').length;
  const activitiesWithPhotoCount = activities.filter(
    (a) => a.photoUrl && a.photoUrl.trim().length > 0
  ).length;

  const totalActivityAttendance = useMemo(() => {
    return activities.reduce((acc, a) => acc + (a.actualAttendanceCount || 0), 0);
  }, [activities]);

  const avgAttendancePerSession = useMemo(() => {
    if (activities.length === 0) return 0;
    return Math.round(totalActivityAttendance / activities.length);
  }, [activities, totalActivityAttendance]);

  // Gallery Filtered Activities
  const filteredGalleryActivities = useMemo(() => {
    let list = [...activities];
    if (galleryFilter === 'WITH_PHOTO') {
      list = list.filter((a) => a.photoUrl && a.photoUrl.trim().length > 0);
    } else if (galleryFilter !== 'ALL') {
      list = list.filter((a) => a.type === galleryFilter);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, galleryFilter]);

  // Activity Distribution Data (Bar Chart)
  const activityDistributionData = useMemo(() => {
    const categoriesMap: { [key: string]: { label: string; target: number; fill: string } } = {
      'Religi': { label: 'Sholat Dhuha / Religi', target: 20, fill: '#10B981' },
      'Literasi': { label: 'Literasi Pagi DKV', target: 16, fill: '#3B82F6' },
      'Kebersihan': { label: 'Kebersihan 5R Studio', target: 15, fill: '#06B6D4' },
      'Senam': { label: 'Senam / Olahraga', target: 10, fill: '#F43F5E' },
      'Upacara': { label: 'Upacara / Apel', target: 8, fill: '#6366F1' },
      'Parenting': { label: 'Parenting / Paguyuban', target: 4, fill: '#8B5CF6' },
      'Evaluasi': { label: 'Refleksi Perwalian', target: 6, fill: '#F59E0B' },
      'Bimbingan': { label: 'Bimbingan Klasikal', target: 6, fill: '#EC4899' },
    };

    return Object.keys(categoriesMap).map((catKey) => {
      const catConfig = categoriesMap[catKey];
      const matched = activities.filter(
        (a) => a.category?.toLowerCase().includes(catKey.toLowerCase())
      );
      const count = matched.length;
      const totalAttendance = matched.reduce(
        (acc, curr) => acc + (curr.actualAttendanceCount || 0),
        0
      );
      const avgAttendance = count > 0 ? Math.round(totalAttendance / count) : 0;

      return {
        key: catKey,
        name: catConfig.label,
        count: count,
        target: catConfig.target,
        avgAttendance: avgAttendance,
        fill: catConfig.fill,
      };
    });
  }, [activities]);

  // Activity Type Pie Data
  const activityTypePieData = useMemo(() => {
    const data = [
      { name: 'Harian', value: harianCount, color: '#10B981' },
      { name: 'Mingguan', value: mingguanCount, color: '#3B82F6' },
      { name: 'Bulanan', value: bulananCount, color: '#8B5CF6' },
    ];
    return data.some((d) => d.value > 0)
      ? data
      : [{ name: 'Belum Ada Kegiatan', value: 1, color: '#CBD5E1' }];
  }, [harianCount, mingguanCount, bulananCount]);

  // Most active category
  const mostActiveCategory = useMemo(() => {
    if (activityDistributionData.length === 0) return '-';
    const sorted = [...activityDistributionData].sort((a, b) => b.count - a.count);
    return sorted[0]?.count > 0 ? sorted[0].name : 'Sholat Dhuha / Religi';
  }, [activityDistributionData]);

  // Case Pathway Pie Data
  const caseStatusPieData = useMemo(() => {
    const monitoringCount = Math.max(0, totalStudents - activeCasesCount);
    return [
      { name: 'Monitoring Rutin', value: monitoringCount, color: '#10B981' },
      { name: 'Jalur A (Mapel/Akademik)', value: academicCasesCount, color: '#3B82F6' },
      { name: 'Jalur B (BK & Sosial)', value: socialCasesCount, color: '#8B5CF6' },
      { name: 'Eskalasi Pimpinan', value: escalatedCount, color: '#EF4444' },
    ];
  }, [totalStudents, activeCasesCount, academicCasesCount, socialCasesCount, escalatedCount]);

  // Filtered students for quick table
  const filteredStudents = students.filter((s) => {
    const q = tableSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.rombel.toLowerCase().includes(q) ||
      (s.fatherName && s.fatherName.toLowerCase().includes(q)) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(q))
    );
  });

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('religi') || cat.includes('dhuha')) return <Sun className="w-4 h-4 text-emerald-600" />;
    if (cat.includes('literasi')) return <BookOpen className="w-4 h-4 text-blue-600" />;
    if (cat.includes('kebersihan') || cat.includes('lingkungan')) return <Sparkle className="w-4 h-4 text-cyan-600" />;
    if (cat.includes('senam') || cat.includes('olahraga')) return <Dumbbell className="w-4 h-4 text-rose-600" />;
    if (cat.includes('upacara') || cat.includes('apel')) return <Building className="w-4 h-4 text-indigo-600" />;
    if (cat.includes('parenting') || cat.includes('wali')) return <HeartHandshake className="w-4 h-4 text-purple-600" />;
    if (cat.includes('refleksi') || cat.includes('evaluasi')) return <Flame className="w-4 h-4 text-amber-600" />;
    return <CalendarCheck className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Dashboard Terpadu Wali Kelas
              </span>
              <span className="text-xs text-blue-200">
                {profile.schoolName || 'SMK Negeri 2 Gorontalo'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
              Selamat Bertugas, {profile.homeroomTeacherName || 'Guru Wali'}!
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              Monitoring holistik perkembangan murid binaan DKV, program kegiatan pembiasaan harian/mingguan/bulanan, dan alur penanganan kasus SOP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('activities')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/20 flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-300" />
              <span>Buka Kegiatan ({activities.length})</span>
            </button>
            <button
              onClick={() => navigate('students')}
              className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Kelola Murid ({totalStudents})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Murid */}
        <div
          id="stat-card-students"
          onClick={() => navigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Murid Binaan
            </p>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-800 group-hover:bg-blue-100 transition-colors">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalStudents}</p>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1">
            <span className="font-semibold text-blue-700">10-DKV-1, 10-DKV-3, 11-DKV-3</span>
          </p>
        </div>

        {/* Card 2: Kegiatan Pembiasaan */}
        <div
          id="stat-card-activities"
          onClick={() => navigate('activities')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kegiatan Terlaksana
            </p>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100 transition-colors">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {activities.length < 10 ? `0${activities.length}` : activities.length}
          </p>
          <p className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <span>{harianCount} Harian • {mingguanCount} Mingguan • {bulananCount} Bulanan</span>
          </p>
        </div>

        {/* Card 3: Konsultasi & Bimbingan */}
        <div
          id="stat-card-consultations"
          onClick={() => navigate('consultations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Konsultasi & Sesi
            </p>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-800 group-hover:bg-indigo-100 transition-colors">
              <MessageSquareText className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {consultations.length < 10 ? `0${consultations.length}` : consultations.length}
          </p>
          <p className="text-[11px] text-indigo-600 mt-2 font-medium">
            +{monthlyConsultations} sesi bulan berjalan
          </p>
        </div>

        {/* Card 4: Status Kasus SOP & Eskalasi */}
        <div
          id="stat-card-cases"
          onClick={() => navigate('cases')}
          className={`p-5 rounded-2xl border shadow-xs transition-all cursor-pointer group ${
            escalatedCount > 0
              ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300 hover:shadow-md'
              : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${
                escalatedCount > 0 ? 'text-rose-700' : 'text-slate-500'
              }`}
            >
              Kasus Aktif / SOP
            </p>
            <span
              className={`p-2 rounded-xl ${
                escalatedCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-purple-50 text-purple-800'
              }`}
            >
              <GitFork className="w-4 h-4" />
            </span>
          </div>
          <p
            className={`text-3xl font-bold mt-2 ${
              escalatedCount > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {activeCasesCount < 10 ? `0${activeCasesCount}` : activeCasesCount}
          </p>
          <p
            className={`text-[11px] mt-2 font-medium ${
              escalatedCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'
            }`}
          >
            {escalatedCount > 0
              ? `⚠️ ${escalatedCount} Butuh Atensi Kepala Sekolah`
              : 'Kondisi Perwalian Terkendali'}
          </p>
        </div>
      </div>

      {/* SECTION 1: GALERI KEGIATAN PEMBIASAAN & PROGRAM WALI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Galeri Kegiatan Pembiasaan & Program Wali
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activities.length} Kegiatan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dokumentasi visual pembiasaan Sholat Dhuha, Literasi Pagi DKV, Kebersihan 5R Studio, Kebugaran, dan Paguyuban Kelas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('activities')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Buka Menu Kegiatan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCreateActivity}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Tambah Kegiatan</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </span>
          <button
            onClick={() => setGalleryFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              galleryFilter === 'ALL'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Semua ({activities.length})
          </button>
          <button
            onClick={() => setGalleryFilter('Harian')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              galleryFilter === 'Harian'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            Harian ({harianCount})
          </button>
          <button
            onClick={() => setGalleryFilter('Mingguan')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              galleryFilter === 'Mingguan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
            }`}
          >
            Mingguan ({mingguanCount})
          </button>
          <button
            onClick={() => setGalleryFilter('Bulanan')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              galleryFilter === 'Bulanan'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800'
            }`}
          >
            Bulanan ({bulananCount})
          </button>
          <button
            onClick={() => setGalleryFilter('WITH_PHOTO')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              galleryFilter === 'WITH_PHOTO'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            📸 Berfoto ({activitiesWithPhotoCount})
          </button>
        </div>

        {/* Gallery Cards Grid */}
        {filteredGalleryActivities.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 mt-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Belum ada kegiatan pada filter ini</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tambahkan kegiatan pembiasaan baru atau ubah filter untuk menampilkan data lainnya.
            </p>
            <button
              onClick={handleCreateActivity}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Kegiatan Pembiasaan</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {filteredGalleryActivities.slice(0, 8).map((act) => {
              const typeBadgeColor =
                act.type === 'Harian'
                  ? 'bg-emerald-500 text-white'
                  : act.type === 'Mingguan'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600 text-white';

              const hasPhoto = act.photoUrl && act.photoUrl.trim().length > 0;

              return (
                <div
                  key={act.id}
                  onClick={() => setPreviewActivity(act)}
                  className="group bg-slate-50/60 hover:bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Photo Preview Container */}
                  <div className="h-40 w-full bg-slate-200 relative overflow-hidden shrink-0">
                    {hasPhoto ? (
                      <DriveImage
                        src={act.photoUrl}
                        alt={act.title}
                        preset="card"
                        fallbackType="custom"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 via-emerald-50/50 to-blue-50/50 flex flex-col items-center justify-center p-4 text-center">
                        <div className="p-3 rounded-2xl bg-white shadow-2xs text-emerald-700 mb-2 group-hover:scale-110 transition-transform">
                          {getCategoryIcon(act.category)}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 line-clamp-1">
                          {act.category}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Dokumentasi Terjadwal</span>
                      </div>
                    )}

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${typeBadgeColor}`}>
                        {act.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/70 text-white backdrop-blur-xs">
                        {act.status}
                      </span>
                    </div>

                    {/* Hover Eye Overlay */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lihat Detail</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {act.dayName ? `${act.dayName}, ` : ''}
                          {formatIndonesianDate(act.date)}
                        </span>
                        {act.time && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{act.time}</span>
                          </>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {act.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {act.description || 'Tidak ada deskripsi rinci.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1 truncate max-w-[130px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{act.location || 'SMKN 2'}</span>
                      </span>

                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                        👥 {act.actualAttendanceCount || 36} Hadir
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredGalleryActivities.length > 8 && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('activities')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
            >
              <span>Lihat {filteredGalleryActivities.length - 8} Kegiatan Lainnya di Halaman Kegiatan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: GRAFIK & ANALITIK KETERLAKSANAAN PEMBIASAAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2 cols): Grafik Realisasi per Kategori Pembiasaan */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Grafik Keterlaksanaan Program Pembiasaan Murid
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Realisasi kegiatan terlaksana vs target semester per kategori pembiasaan & program wali
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kategori Teraktif: {mostActiveCategory}</span>
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityDistributionData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10.5, fill: '#475569' }}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value: any, name: string) => [
                      `${value} Sesi`,
                      name === 'count' ? 'Realisasi Terlaksana' : 'Target Semester',
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    formatter={(val) => (
                      <span className="text-xs text-slate-700 font-medium">
                        {val === 'count' ? 'Realisasi Terlaksana' : 'Target Semester'}
                      </span>
                    )}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} name="count" />
                  <Bar dataKey="target" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Grid under Chart */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <p className="text-[10px] text-emerald-700 font-semibold uppercase tracking-tight">Total Terlaksana</p>
              <p className="text-base font-bold text-emerald-900 mt-0.5">{activities.length} Sesi</p>
            </div>
            <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
              <p className="text-[10px] text-blue-700 font-semibold uppercase tracking-tight">Rata-rata Hadir</p>
              <p className="text-base font-bold text-blue-900 mt-0.5">{avgAttendancePerSession} Murid/Sesi</p>
            </div>
            <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-100">
              <p className="text-[10px] text-purple-700 font-semibold uppercase tracking-tight">Dokumentasi Foto</p>
              <p className="text-base font-bold text-purple-900 mt-0.5">{activitiesWithPhotoCount} Kegiatan</p>
            </div>
            <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100">
              <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-tight">Total Partisipasi</p>
              <p className="text-base font-bold text-amber-900 mt-0.5">{totalActivityAttendance} Akumulasi</p>
            </div>
          </div>
        </div>

        {/* Side Chart (1 col): Proporsi Tipe & Distribusi Penanganan Kasus SOP */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Distribusi Tipe Pembiasaan
                </h3>
              </div>
              <button
                onClick={() => navigate('activities')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
              >
                Detail <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Proporsi pelaksanaan program harian, mingguan, dan bulanan
            </p>

            <div className="h-44 w-full mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityTypePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {activityTypePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '11px',
                    }}
                    formatter={(val, name) => [`${val} Kegiatan`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">{activities.length}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Total</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-2 mt-2 text-xs">
              {activityTypePieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate max-w-[170px] text-xs">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => navigate('activities')}
              className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Menu Pembiasaan</span>
            </button>
            <button
              onClick={() => navigate('cases')}
              className="flex-1 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Status SOP ({activeCasesCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Table: Daftar Murid & Status Penanganan */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Daftar Murid & Status Penanganan
            </h3>
            <p className="text-xs text-slate-500">
              Profil 14 murid perwalian DKV beserta status SOP bimbingan
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau wali..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="text-sm bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 w-full outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-6 py-3">Nama Murid</th>
                <th className="px-6 py-3">Rombel</th>
                <th className="px-6 py-3">Orang Tua / Wali</th>
                <th className="px-6 py-3">Tahapan SOP</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                // Find associated case
                const studentCase = cases.find(
                  (c) => c.studentId === student.id || c.studentName === student.name
                );
                const isEscalated =
                  studentCase && (studentCase.status === 'Eskalasi' || studentCase.isEscalatedToPrincipal);
                const parentName =
                  student.guardianName ||
                  student.fatherName ||
                  student.motherName ||
                  'Tidak tercatat';

                let sopBadge = (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] rounded uppercase font-bold tracking-tight">
                    Monitoring Rutin
                  </span>
                );

                if (isEscalated) {
                  sopBadge = (
                    <span className="px-2 py-1 bg-red-600 text-white text-[10px] rounded uppercase font-bold tracking-tight shadow-xs animate-pulse">
                      Eskalasi Pimpinan
                    </span>
                  );
                } else if (studentCase) {
                  if (studentCase.currentStep >= 7) {
                    sopBadge = (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] rounded uppercase font-bold tracking-tight">
                        Implementasi / Evaluasi
                      </span>
                    );
                  } else if (studentCase.pathway === 'Jalur B') {
                    sopBadge = (
                      <span className="px-2 py-1 bg-violet-100 text-violet-700 text-[10px] rounded uppercase font-bold tracking-tight">
                        Koordinasi BK (Tahap {studentCase.currentStep})
                      </span>
                    );
                  } else {
                    sopBadge = (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] rounded uppercase font-bold tracking-tight">
                        Jalur Mapel (Tahap {studentCase.currentStep})
                      </span>
                    );
                  }
                }

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isEscalated ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <DriveImage
                            src={student.photoUrl}
                            alt={student.name}
                            preset="thumb"
                            fallbackType="student"
                            gender={student.gender}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div
                            className={`font-semibold ${
                              isEscalated ? 'text-red-900' : 'text-slate-900'
                            }`}
                          >
                            {student.name}
                          </div>
                          <div className="text-xs text-slate-400 italic font-mono">
                            {student.nisn}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 font-mono">
                        {student.rombel}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">
                      <div className="text-xs font-medium">{parentName}</div>
                      {student.phone && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          {student.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5">{sopBadge}</td>
                    <td className="px-6 py-3.5 text-right">
                      {isEscalated ? (
                        <button
                          onClick={() => {
                            if (onSelectCase && studentCase) onSelectCase(studentCase);
                            navigate('cases');
                          }}
                          className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline inline-flex items-center gap-0.5"
                        >
                          Lihat Kasus
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (onSelectStudent) onSelectStudent(student);
                            navigate('students');
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                        >
                          Detail Profil
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Two Column Bottom Grid: Aktivitas Terbaru & Mekanisme SOP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1-2: Aktivitas Terbaru (Jurnal Guru Wali) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Aktivitas Terbaru (Jurnal Guru Wali)
              </h4>
              <button
                onClick={() => navigate('journal')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                Buka Jurnal Rekap <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {consultations.slice(0, 2).map((item) => (
                <div key={item.id} className="flex gap-3.5 items-start">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-800">
                      <span className="font-bold text-blue-900">Konsultasi</span> dengan{' '}
                      <span className="font-semibold text-slate-900">{item.studentName}</span>:{' '}
                      <span className="text-slate-600">{item.problem}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.dayName}, {formatIndonesianDate(item.date)} • Saran: {item.teacherAdvice}
                    </p>
                  </div>
                </div>
              ))}

              {collaborations.slice(0, 2).map((item) => (
                <div key={item.id} className="flex gap-3.5 items-start">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-600 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-800">
                      <span className="font-bold text-violet-900">Kolaborasi</span> (
                      {item.collaborators?.join(', ') || 'Lintas Pendidik'}) untuk{' '}
                      <span className="font-semibold text-slate-900">{item.studentName}</span>:{' '}
                      <span className="text-slate-600">{item.problemDetails}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.dayName}, {formatIndonesianDate(item.date)} • Bentuk:{' '}
                      {item.forms?.join('; ') || 'Koordinasi'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Total {consultations.length} konsultasi & {collaborations.length} kolaborasi tercatat
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCreateConsultation}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-xs font-semibold text-blue-700 transition-colors"
              >
                + Konsultasi
              </button>
              <button
                onClick={handleCreateCollaboration}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-violet-50 text-xs font-semibold text-violet-700 transition-colors"
              >
                + Kolaborasi
              </button>
            </div>
          </div>
        </div>

        {/* Kolom 3: Mekanisme SOP (Quick Track) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-purple-600" />
                Mekanisme SOP (Quick Track)
              </h4>
              <button
                onClick={() => navigate('cases')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Alur 8 Tahap →
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-700">
                  01
                </div>
                <span className="text-xs font-semibold text-slate-800">1. Monitoring Rutin</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">
                  02
                </div>
                <span className="text-xs font-medium text-slate-500">2. Identifikasi Masalah</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">
                  03
                </div>
                <span className="text-xs font-medium text-slate-500">3. Koordinasi Wali Kelas</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                  04
                </div>
                <span className="text-xs font-medium text-emerald-800">4. Jalur A (Mapel) / B (BK)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleCreateCase}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Buka Kasus Penanganan Baru
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal for Gallery Item */}
      {previewActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
            {/* Header Image or Banner */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
              {previewActivity.photoUrl ? (
                <DriveImage
                  src={previewActivity.photoUrl}
                  alt={previewActivity.title}
                  preset="hero"
                  fallbackType="custom"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
                  <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
                    {getCategoryIcon(previewActivity.category)}
                  </div>
                  <h3 className="text-xl font-bold">{previewActivity.title}</h3>
                  <p className="text-xs text-blue-200 mt-1">{previewActivity.category}</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setPreviewActivity(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badges on Bottom of Image */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-md">
                  {previewActivity.type}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold border border-white/20">
                  {previewActivity.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-600/90 text-white text-xs font-semibold">
                  Status: {previewActivity.status}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{previewActivity.title}</h3>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5 font-medium">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {previewActivity.dayName ? `${previewActivity.dayName}, ` : ''}
                    {formatIndonesianDate(previewActivity.date)}
                  </span>
                  {previewActivity.time && (
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      {previewActivity.time}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {previewActivity.location || 'SMK Negeri 2 Gorontalo'}
                  </span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rombel Sasaran</span>
                  <span className="font-semibold text-slate-800">{previewActivity.rombel || 'Semua Rombel'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tingkat Kehadiran</span>
                  <span className="font-semibold text-emerald-700">
                    👥 {previewActivity.actualAttendanceCount || 36} Murid Hadir
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Guru Pembina / PIC</span>
                  <span className="font-semibold text-slate-800">
                    {previewActivity.leaderOrPic || profile.homeroomTeacherName || 'Wali Kelas'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Deskripsi & Pelaksanaan Kegiatan
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {previewActivity.description || 'Tidak ada deskripsi rinci.'}
                </p>
              </div>

              {/* Outcome / Catatan RTL */}
              {previewActivity.outcome && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Hasil Ketercapaian / Catatan Tindak Lanjut
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/80">
                    {previewActivity.outcome}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setPreviewActivity(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setPreviewActivity(null);
                    navigate('activities');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Buka di Halaman Kegiatan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
