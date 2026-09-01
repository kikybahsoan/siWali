import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  UsersRound,
  GitFork,
  BookOpen,
  CalendarCheck,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'students'
  | 'activities'
  | 'consultations'
  | 'collaborations'
  | 'cases'
  | 'journal';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  escalatedCount: number;
  totalStudents: number;
  totalActivities?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  escalatedCount,
  totalStudents,
  totalActivities = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'students' as TabType,
      label: 'Murid Wali',
      icon: Users,
      badge: totalStudents,
    },
    {
      id: 'activities' as TabType,
      label: 'Kegiatan',
      icon: CalendarCheck,
      badge: totalActivities > 0 ? totalActivities : undefined,
    },
    {
      id: 'consultations' as TabType,
      label: 'Konsultasi',
      icon: MessageSquareText,
    },
    {
      id: 'cases' as TabType,
      label: 'Kasus SOP',
      icon: GitFork,
      alertBadge: escalatedCount > 0 ? escalatedCount : undefined,
    },
    {
      id: 'journal' as TabType,
      label: 'Jurnal Rekap',
      icon: BookOpen,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 max-w-lg mx-auto sm:max-w-none lg:hidden"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-blue-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-blue-800 rounded-full animate-fade-in" />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.alertBadge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                    {tab.alertBadge}
                  </span>
                )}
                {tab.badge !== undefined && tab.alertBadge === undefined && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] leading-tight mt-1 whitespace-nowrap ${
                  isActive ? 'text-blue-950 font-bold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
