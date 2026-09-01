import React from 'react';
import { TabType } from './BottomNav';
import { SchoolProfile } from '../types';
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  UsersRound,
  GitFork,
  BookOpen,
  CalendarCheck,
  Settings,
  Printer,
  ShieldAlert,
  FileSpreadsheet,
  CloudCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  profile: SchoolProfile;
  escalatedCount: number;
  totalStudents: number;
  totalActivities?: number;
  isSheetsConfigured?: boolean;
  onOpenSettings: () => void;
  onOpenSheetsSync?: () => void;
  onQuickPrint: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  profile,
  escalatedCount,
  totalStudents,
  totalActivities = 0,
  isSheetsConfigured = false,
  onOpenSettings,
  onOpenSheetsSync,
  onQuickPrint,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      code: 'DB',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'students' as TabType,
      code: 'ID',
      label: 'Identitas Murid',
      icon: Users,
      badge: totalStudents,
    },
    {
      id: 'activities' as TabType,
      code: 'KG',
      label: 'Kegiatan Pembiasaan',
      icon: CalendarCheck,
      badge: totalActivities > 0 ? totalActivities : undefined,
    },
    {
      id: 'consultations' as TabType,
      code: 'KP',
      label: 'Konsultasi Perwalian',
      icon: MessageSquareText,
    },
    {
      id: 'collaborations' as TabType,
      code: 'KB',
      label: 'Kolaborasi BK & Walas',
      icon: UsersRound,
    },
    {
      id: 'cases' as TabType,
      code: 'PM',
      label: 'Penanganan Kasus SOP',
      icon: GitFork,
      alertBadge: escalatedCount > 0 ? escalatedCount : undefined,
    },
    {
      id: 'journal' as TabType,
      code: 'JR',
      label: 'Jurnal Guru Wali',
      icon: BookOpen,
    },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden lg:flex w-64 bg-[#1E3A8A] text-white flex-col h-screen sticky top-0 shrink-0 select-none shadow-xl border-r border-blue-900 z-30"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-blue-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">siWali</h1>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              DKV
            </span>
          </div>
          <p className="text-xs text-blue-300 mt-1 uppercase tracking-widest font-medium">
            SMK Negeri 2 Gorontalo
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left px-3.5 py-3 rounded-lg flex items-center justify-between transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-900 border-l-4 border-emerald-400 text-white font-semibold shadow-inner'
                  : 'hover:bg-blue-800/60 text-blue-100 font-normal hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold tracking-tighter transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'border border-white/20 text-blue-200 group-hover:border-white/40 group-hover:text-white'
                  }`}
                >
                  {item.code}
                </div>
                <span className="text-sm tracking-tight">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.alertBadge !== undefined && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-600 text-[10px] font-bold text-white shadow animate-pulse">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    {item.alertBadge}
                  </span>
                )}
                {item.badge !== undefined && item.alertBadge === undefined && (
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-800/80 border border-blue-700 text-[10px] font-semibold text-blue-200">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* Quick Tools in Nav */}
        <div className="pt-4 mt-4 border-t border-blue-800/80 px-2 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 mb-2">
            Aksi Cepat & Cloud
          </p>
          {onOpenSheetsSync && (
            <button
              onClick={onOpenSheetsSync}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                isSheetsConfigured
                  ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-900/60'
                  : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className={`w-4 h-4 ${isSheetsConfigured ? 'text-emerald-400' : 'text-blue-300'}`} />
                <span className="font-medium">Google Spreadsheet</span>
              </div>
              {isSheetsConfigured && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          )}
          <button
            onClick={onQuickPrint}
            className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs text-blue-200 hover:bg-blue-800/50 hover:text-white transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-300" />
            <span>Export & Cetak PDF</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs text-blue-200 hover:bg-blue-800/50 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-blue-300" />
            <span>Pengaturan & Kop Sekolah</span>
          </button>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-blue-800 bg-[#172e6b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs uppercase shrink-0 shadow-sm ring-2 ring-emerald-400/40">
              {profile.homeroomTeacherName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('') || 'AB'}
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate" title={profile.homeroomTeacherName}>
                {profile.homeroomTeacherName}
              </p>
              <p className="text-[10px] text-blue-300 truncate">
                Guru Wali {profile.expertiseProgram}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800/60 transition-colors shrink-0"
            title="Pengaturan Profil"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
