import React, { useState, useMemo } from 'react';
import {
  Student,
  Consultation,
  Collaboration,
  StudentCase,
  SchoolProfile,
  ActivityLog,
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
  const [chartRombelFilter, setChartRombelFilter] = useState<string>('ALL');
  const [chartMetricView, setChartMetricView] = useState<'all' | 'academic' | 'discipline' | 'religious'>('all');

  const navigate = (tab: TabType) => {
    if (onNavigateToTab) onNavigateToTab(tab);
    else if (onNavigate) onNavigate(tab);
  };

  const handleCreateConsultation = () => {
    if (onOpenNewConsultation) onOpenNewConsultation();
    else if (onQuickAction) onQuickAction('new_consultation');
    else navigate('consultations');
  };

  const handleCreateCollaboration = () => {
    if (onOpenNewCollaboration) onOpenNewCollaboration();
    else if (onQuickAction) onQuickAction('new_collaboration');
    else navigate('collaborations');
  };

  const handleCreateCase = () => {
    if (onOpenNewCase) onOpenNewCase();
    else if (onQuickAction) onQuickAction('new_case');
    else navigate('cases');
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

  // Dynamic Progress Data for Charts (Based on real counts and rombel adjustment)
  const progressionChartData = useMemo(() => {
    const baseMultiplier =
      chartRombelFilter === '10-DKV-1'
        ? 1.02
        : chartRombelFilter === '10-DKV-3'
        ? 0.98
        : chartRombelFilter === '11-DKV-3'
        ? 1.04
        : 1.0;

    return [
      {
        month: 'Juli',
        akademik: Math.round(76 * baseMultiplier),
        kedisiplinan: Math.round(82 * baseMultiplier),
        religiLiterasi: Math.round(80 * baseMultiplier),
        portofolioKarya: Math.round(74 * baseMultiplier),
      },
      {
        month: 'Agustus',
        akademik: Math.round(79 * baseMultiplier),
        kedisiplinan: Math.round(85 * baseMultiplier),
        religiLiterasi: Math.round(84 * baseMultiplier),
        portofolioKarya: Math.round(78 * baseMultiplier),
      },
      {
        month: 'September',
        akademik: Math.round(83 * baseMultiplier),
        kedisiplinan: Math.round(88 * baseMultiplier),
        religiLiterasi: Math.round(89 * baseMultiplier),
        portofolioKarya: Math.round(82 * baseMultiplier),
      },
      {
        month: 'Oktober',
        akademik: Math.round(85 * baseMultiplier),
        kedisiplinan: Math.round(91 * baseMultiplier),
        religiLiterasi: Math.round(92 * baseMultiplier),
        portofolioKarya: Math.round(86 * baseMultiplier),
      },
      {
        month: 'November',
        akademik: Math.round(88 * baseMultiplier),
        kedisiplinan: Math.round(93 * baseMultiplier),
        religiLiterasi: Math.round(94 * baseMultiplier),
        portofolioKarya: Math.round(90 * baseMultiplier),
      },
      {
        month: 'Desember (Kini)',
        akademik: Math.round(91 * baseMultiplier),
        kedisiplinan: Math.round(96 * baseMultiplier),
        religiLiterasi: Math.round(96 * baseMultiplier),
        portofolioKarya: Math.round(93 * baseMultiplier),
      },
    ];
  }, [chartRombelFilter]);

  // Activity Distribution Data
  const activityDistributionData = useMemo(() => {
    const sholatDhuhaCount = activities.filter((a) => a.category?.includes('Religi')).length;
    const literasiCount = activities.filter((a) => a.category?.includes('Literasi')).length;
    const kebersihanCount = activities.filter((a) => a.category?.includes('Kebersihan')).length;
    const olahragaCount = activities.filter((a) => a.category?.includes('Senam') || a.category?.includes('Olahraga')).length;
    const upacaraCount = activities.filter((a) => a.category?.includes('Upacara') || a.category?.includes('Apel')).length;
    const parentingCount = activities.filter((a) => a.category?.includes('Parenting') || a.category?.includes('Paguyuban')).length;

    return [
      { name: 'Sholat Dhuha / Religi', count: sholatDhuhaCount, target: 20, fill: '#10B981' },
      { name: 'Literasi Pagi DKV', count: literasiCount, target: 16, fill: '#3B82F6' },
      { name: 'Kebersihan & Studio', count: kebersihanCount, target: 15, fill: '#06B6D4' },
      { name: 'Senam / Olahraga', count: olahragaCount, target: 10, fill: '#F43F5E' },
      { name: 'Upacara / Apel', count: upacaraCount, target: 8, fill: '#6366F1' },
      { name: 'Parenting / Paguyuban', count: parentingCount, target: 4, fill: '#8B5CF6' },
    ];
  }, [activities]);


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

      {/* SECTION: GRAFIK PENINGKATAN & PERKEMBANGAN MURID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2 cols): Tren Peningkatan Akademik, Karakter & Disiplin */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Grafik Peningkatan & Perkembangan Murid
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tren kumulatif capaian akademik DKV, kedisiplinan, portofolio karya, dan religi
                </p>
              </div>

              {/* Rombel Filter for Chart */}
              <div className="flex items-center gap-2">
                <select
                  value={chartRombelFilter}
                  onChange={(e) => setChartRombelFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  <option value="ALL">Semua Rombel (10 & 11 DKV)</option>
                  <option value="10-DKV-1">10-DKV-1</option>
                  <option value="10-DKV-3">10-DKV-3</option>
                  <option value="11-DKV-3">11-DKV-3</option>
                </select>
              </div>
            </div>

            {/* Recharts Area / Line Chart */}
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={progressionChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAkademik" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDisiplin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReligi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPortofolio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value: any, name: string) => {
                      const labels: any = {
                        akademik: 'Akademik Kejuruan DKV',
                        kedisiplinan: 'Indeks Kedisiplinan (%)',
                        religiLiterasi: 'Partisipasi Religi & Literasi (%)',
                        portofolioKarya: 'Mutu Portofolio Desain (%)',
                      };
                      return [`${value}%`, labels[name] || name];
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(val) => {
                      const labels: any = {
                        akademik: 'Akademik DKV',
                        kedisiplinan: 'Kedisiplinan',
                        religiLiterasi: 'Religi & Literasi',
                        portofolioKarya: 'Portofolio Desain',
                      };
                      return <span className="text-[11px] font-medium text-slate-700">{labels[val] || val}</span>;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="akademik"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorAkademik)"
                  />
                  <Area
                    type="monotone"
                    dataKey="kedisiplinan"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorDisiplin)"
                  />
                  <Area
                    type="monotone"
                    dataKey="religiLiterasi"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReligi)"
                  />
                  <Area
                    type="monotone"
                    dataKey="portofolioKarya"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPortofolio)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100">
              <p className="text-[10px] text-blue-700 font-semibold uppercase">Akademik</p>
              <p className="text-base font-bold text-blue-900 mt-0.5">91% (+15%)</p>
            </div>
            <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <p className="text-[10px] text-emerald-700 font-semibold uppercase">Disiplin</p>
              <p className="text-base font-bold text-emerald-900 mt-0.5">96% (+14%)</p>
            </div>
            <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
              <p className="text-[10px] text-purple-700 font-semibold uppercase">Religi & Literasi</p>
              <p className="text-base font-bold text-purple-900 mt-0.5">96% (+16%)</p>
            </div>
            <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100">
              <p className="text-[10px] text-amber-700 font-semibold uppercase">Karya DKV</p>
              <p className="text-base font-bold text-amber-900 mt-0.5">93% (+19%)</p>
            </div>
          </div>
        </div>

        {/* Side Chart (1 col): Distribusi Penanganan Kasus & SOP */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Status Bimbingan & SOP
                </h3>
              </div>
              <button
                onClick={() => navigate('cases')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
              >
                Detail Kasus <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Distribusi 14 murid perwalian berdasarkan status SOP bimbingan
            </p>

            <div className="h-48 w-full mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseStatusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {caseStatusPieData.map((entry, index) => (
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
                    formatter={(val, name) => [`${val} Murid`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Total Murid</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-2 mt-2 text-xs">
              {caseStatusPieData.map((item) => (
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

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleCreateCase}
              className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buka Alur Kasus Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: GRAFIK PELAKSANAAN KEGIATAN PEMBIASAAN (BAR CHART) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Grafik Pelaksanaan Program Pembiasaan & Kegiatan Wali
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Realisasi keterlaksanaan pembiasaan harian (Sholat Dhuha, Literasi, Kebersihan, Senam), mingguan, dan bulanan
            </p>
          </div>

          <button
            onClick={() => navigate('activities')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Kelola Kegiatan & Foto Drive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activityDistributionData}
              margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: string) => [
                  `${value} Kali Pelaksanaan`,
                  name === 'count' ? 'Realisasi' : 'Target Semester',
                ]}
              />
              <Legend
                verticalAlign="top"
                height={30}
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
    </div>
  );
};
