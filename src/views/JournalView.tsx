import React, { useState, useMemo } from 'react';
import {
  Student,
  Consultation,
  Collaboration,
  StudentCase,
  SchoolProfile,
} from '../types';
import {
  BookOpen,
  Printer,
  Calendar,
  Search,
  Filter,
  MessageSquareText,
  UsersRound,
  GitFork,
  ArrowUpDown,
  User,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  formatIndonesianDate,
  getCurrentMonthPeriod,
  formatPeriod,
} from '../utils/formatters';

interface JournalViewProps {
  students: Student[];
  consultations: Consultation[];
  collaborations: Collaboration[];
  cases: StudentCase[];
  profile: SchoolProfile;
  onPrintJournalReport: (period: string, studentId?: string) => void;
  onNavigateToTab: (tab: 'consultations' | 'collaborations' | 'cases', detailId?: string) => void;
}

interface JournalEntry {
  id: string;
  type: 'consultation' | 'collaboration' | 'case';
  typeLabel: string;
  date: string;
  studentId: string;
  studentName: string;
  studentRombel: string;
  title: string;
  description: string;
  extraInfo: string;
  statusBadge: string;
  statusColor: string;
  rawRef: Consultation | Collaboration | StudentCase;
}

export const JournalView: React.FC<JournalViewProps> = ({
  students,
  consultations,
  collaborations,
  cases,
  profile,
  onPrintJournalReport,
  onNavigateToTab,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthPeriod());
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Combine and normalize all activities into unified entries
  const allEntries: JournalEntry[] = useMemo(() => {
    const list: JournalEntry[] = [];

    // 1. Consultations
    consultations.forEach((c) => {
      list.push({
        id: `c-${c.id}`,
        type: 'consultation',
        typeLabel: 'Konsultasi Perwalian',
        date: c.date,
        studentId: c.studentId,
        studentName: c.studentName,
        studentRombel: c.studentRombel,
        title: `Konsultasi: ${c.problem.substring(0, 60)}...`,
        description: c.problem,
        extraInfo: `Saran Guru Wali: ${c.teacherAdvice}`,
        statusBadge: c.followUpStatus,
        statusColor:
          c.followUpStatus === 'Selesai'
            ? 'bg-emerald-100 text-emerald-800'
            : c.followUpStatus === 'Perlu Tindak Lanjut'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-purple-100 text-purple-800',
        rawRef: c,
      });
    });

    // 2. Collaborations
    collaborations.forEach((col) => {
      list.push({
        id: `col-${col.id}`,
        type: 'collaboration',
        typeLabel: 'Kolaborasi Terpadu',
        date: col.date,
        studentId: col.studentId,
        studentName: col.studentName,
        studentRombel: col.studentRombel,
        title: `Kolaborasi ${col.collaborators?.join(', ') || 'Lintas Pendidik'}: ${col.forms?.join(', ') || 'Koordinasi'}`,
        description: col.problemDetails,
        extraInfo: col.followUpPlan ? `RTL: ${col.followUpPlan}` : '',
        statusBadge: col.collaborators?.join(' + ') || 'Kolaborasi',
        statusColor: 'bg-blue-100 text-blue-900',
        rawRef: col,
      });
    });

    // 3. Case logs
    cases.forEach((cas) => {
      cas.logs.forEach((l) => {
        list.push({
          id: `case-log-${cas.id}-${l.step}`,
          type: 'case',
          typeLabel: 'SOP Kasus Terstruktur',
          date: l.date || cas.startDate,
          studentId: cas.studentId,
          studentName: cas.studentName,
          studentRombel: cas.studentRombel,
          title: `[${cas.caseNumber}] Tahap ${l.step}: ${l.stepTitle}`,
          description: l.notes,
          extraInfo: `${cas.title} (${cas.pathway || 'Jalur A'})`,
          statusBadge: cas.status === 'Eskalasi' ? 'Eskalasi KS' : cas.status,
          statusColor:
            cas.status === 'Eskalasi'
              ? 'bg-red-600 text-white font-bold'
              : cas.status === 'Selesai'
              ? 'bg-slate-200 text-slate-700'
              : 'bg-purple-100 text-purple-800',
          rawRef: cas,
        });
      });
    });

    // Sort descending by date
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [consultations, collaborations, cases]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter((item) => {
      const matchMonth = !selectedMonth || item.date.startsWith(selectedMonth);
      const matchStudent =
        selectedStudentFilter === 'all' || item.studentId === selectedStudentFilter;
      const matchType = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.studentName.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.extraInfo.toLowerCase().includes(query);
      return matchMonth && matchStudent && matchType && matchQuery;
    });
  }, [allEntries, selectedMonth, selectedStudentFilter, selectedTypeFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-800" />
              Rekap Terpadu & Jurnal Harian Guru Wali
            </h2>
            <p className="text-xs text-slate-600">
              Kompilasi kronologis seluruh aktivitas konsultasi, kolaborasi BK/Mapel, dan alur kasus SOP
            </p>
          </div>

          <button
            id="print-unified-journal-btn"
            onClick={() =>
              onPrintJournalReport(
                selectedMonth,
                selectedStudentFilter === 'all' ? undefined : selectedStudentFilter
              )
            }
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-sm active:scale-95 self-stretch sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            Cetak Rekap Terpadu
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Periode Bulan:
            </label>
            <input
              id="journal-period-filter"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter Murid:
            </label>
            <select
              id="journal-student-filter"
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Jenis Aktivitas:
            </label>
            <select
              id="journal-type-filter"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="all">Semua Aktivitas</option>
              <option value="consultation">Konsultasi Perwalian</option>
              <option value="collaboration">Kolaborasi BK/Walas/Mapel</option>
              <option value="case">Alur Kasus SOP</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Cari Jurnal:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari aktivitas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          Menampilkan <strong>{filteredEntries.length}</strong> catatan aktivitas terpadu periode{' '}
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

      {/* Journal entries cards */}
      <div className="space-y-3">
        {filteredEntries.map((item, index) => {
          return (
            <div
              key={item.id}
              id={`journal-row-${item.id}`}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        item.type === 'consultation'
                          ? 'bg-amber-100 text-amber-900'
                          : item.type === 'collaboration'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {item.type === 'consultation' ? (
                        <MessageSquareText className="w-4 h-4" />
                      ) : item.type === 'collaboration' ? (
                        <UsersRound className="w-4 h-4" />
                      ) : (
                        <GitFork className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{item.studentName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {item.studentRombel}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                          {item.typeLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatIndonesianDate(item.date)}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${item.statusColor}`}
                  >
                    {item.statusBadge}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1.5">
                  <h4 className="font-bold text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.description}
                  </p>
                  {item.extraInfo && (
                    <p className="text-[11px] text-blue-900 font-medium px-1">
                      💡 {item.extraInfo}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Guru Wali: {profile.homeroomTeacherName}
                </span>
                <button
                  onClick={() => {
                    if (item.type === 'consultation') {
                      onNavigateToTab('consultations');
                    } else if (item.type === 'collaboration') {
                      onNavigateToTab('collaborations');
                    } else {
                      onNavigateToTab('cases', (item.rawRef as StudentCase).id);
                    }
                  }}
                  className="text-blue-800 hover:text-blue-950 font-bold flex items-center gap-1 text-xs"
                >
                  <span>Buka di Modul</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">Tidak ada jurnal aktivitas pada filter ini.</p>
        </div>
      )}
    </div>
  );
};
