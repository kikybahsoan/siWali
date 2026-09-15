import { Student, Consultation, Collaboration, StudentCase, SchoolProfile, ActivityLog, AttendanceRecord } from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_ACTIVITIES,
  INITIAL_CONSULTATIONS,
  INITIAL_COLLABORATIONS,
  INITIAL_CASES,
  INITIAL_SCHOOL_PROFILE,
} from '../data/seedData';
import { getIndonesianDayName, getTodayDateString } from '../utils/formatters';

const KEYS = {
  STUDENTS: 'siwali_students_v2',
  DELETED_STUDENT_IDS: 'siwali_deleted_student_ids_v1',
  LAST_LOCAL_EDIT: 'siwali_last_local_edit_time_v1',
  ACTIVITIES: 'siwali_activities_v2',
  ATTENDANCES: 'siwali_attendances_v2',
  CONSULTATIONS: 'siwali_consultations_v2',
  COLLABORATIONS: 'siwali_collaborations_v2',
  CASES: 'siwali_cases_v2',
  PROFILE: 'siwali_school_profile_v1',
};

// Generate realistic initial attendance records for the last 5 days
function generateSeedAttendances(studentsList: Student[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Create records for the last 5 days (excluding Sunday)
  for (let offset = 4; offset >= 0; offset--) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - offset);
    if (targetDate.getDay() === 0) continue; // Skip Sunday

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = getIndonesianDayName(dateStr);

    studentsList.forEach((st, idx) => {
      // Deterministic variety: student 4 is sakit on 2 days ago, student 9 is izin on 3 days ago
      let status: AttendanceRecord['status'] = 'Hadir';
      let notes = 'Presensi Tepat Waktu';
      let time = `06:${45 + (idx % 14)}:${String((idx * 7) % 60).padStart(2, '0')}`;

      if (offset === 1 && idx === 3) {
        status = 'Sakit';
        notes = 'Demam flu, surat dokter terlampir';
        time = '07:15:00';
      } else if (offset === 2 && idx === 8) {
        status = 'Izin';
        notes = 'Izin acara keluarga';
        time = '07:05:00';
      } else if (offset === 0 && idx === 11) {
        status = 'Terlambat';
        notes = 'Terlambat 10 menit karena ban kempes';
        time = '07:10:24';
      }

      records.push({
        id: `att-${dateStr}-${st.id}`,
        studentId: st.id,
        studentName: st.name,
        nisn: st.nisn,
        rombel: st.rombel,
        date: dateStr,
        dayName,
        time,
        session: 'Pembiasaan Pagi / KBM',
        status,
        method: 'Barcode / QR Scan',
        notes,
        photoUrl: st.photoUrl,
        scannedAt: `${dateStr}T${time}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  return records;
}

export const StorageService = {
  // Local Edit Timing to Prevent Sync Race Conditions
  recordLocalEditTime: (): void => {
    try {
      localStorage.setItem(KEYS.LAST_LOCAL_EDIT, String(Date.now()));
    } catch {}
  },

  getLastLocalEditTime: (): number => {
    try {
      const t = localStorage.getItem(KEYS.LAST_LOCAL_EDIT);
      return t ? Number(t) : 0;
    } catch {
      return 0;
    }
  },

  // Deletion Tombstones to Prevent Deleted Students from Being Resurrected by Remote Pull
  getDeletedStudentIds: (): Record<string, string> => {
    try {
      const data = localStorage.getItem(KEYS.DELETED_STUDENT_IDS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  recordDeletedStudentId: (id: string): void => {
    try {
      const map = StorageService.getDeletedStudentIds();
      map[id] = new Date().toISOString();
      localStorage.setItem(KEYS.DELETED_STUDENT_IDS, JSON.stringify(map));
    } catch {}
  },

  removeDeletedStudentId: (id: string): void => {
    try {
      const map = StorageService.getDeletedStudentIds();
      if (map[id]) {
        delete map[id];
        localStorage.setItem(KEYS.DELETED_STUDENT_IDS, JSON.stringify(map));
      }
    } catch {}
  },

  // Students
  getStudents: (): Student[] => {
    try {
      const data = localStorage.getItem(KEYS.STUDENTS);
      if (!data) {
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
      }
      const parsed: Student[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
      }

      // Ensure all seed students (specifically Raihan, Farel, Moh Checen Potabuga) exist in the list
      const existingIds = new Set(parsed.map((s) => s.id));
      const existingNames = new Set(parsed.map((s) => s.name.trim().toLowerCase()));
      const existingNisns = new Set(parsed.map((s) => s.nisn?.trim()).filter(Boolean));

      let hasChanges = false;
      const merged = [...parsed];

      for (const initSt of INITIAL_STUDENTS) {
        const hasId = existingIds.has(initSt.id);
        const hasName = existingNames.has(initSt.name.trim().toLowerCase());
        const hasNisn = initSt.nisn ? existingNisns.has(initSt.nisn.trim()) : false;

        if (!hasId && !hasName && !hasNisn) {
          merged.push(initSt);
          hasChanges = true;
        } else if (hasName) {
          // If name matches, ensure NISN, rombel, and photoUrl are up-to-date
          const idx = merged.findIndex(
            (s) => s.name.trim().toLowerCase() === initSt.name.trim().toLowerCase()
          );
          if (idx >= 0 && (!merged[idx].nisn || merged[idx].nisn === '12345' || !merged[idx].rombel || !merged[idx].photoUrl)) {
            merged[idx] = {
              ...merged[idx],
              nisn: initSt.nisn || merged[idx].nisn,
              rombel: initSt.rombel || merged[idx].rombel,
              photoUrl: initSt.photoUrl || merged[idx].photoUrl,
            };
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents: (students: Student[]): void => {
    try {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  },

  saveStudent: (student: Student): Student[] => {
    StorageService.removeDeletedStudentId(student.id);
    StorageService.recordLocalEditTime();
    const list = StorageService.getStudents();
    const idx = list.findIndex((s) => s.id === student.id);
    let updated: Student[];
    const now = new Date().toISOString();
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = {
        ...student,
        updatedAt: now,
      };
    } else {
      updated = [
        ...list,
        {
          ...student,
          no: list.length + 1,
          createdAt: student.createdAt || now,
          updatedAt: now,
        },
      ];
    }
    StorageService.saveStudents(updated);
    return updated;
  },

  deleteStudent: (id: string): Student[] => {
    StorageService.recordDeletedStudentId(id);
    StorageService.recordLocalEditTime();
    const list = StorageService.getStudents();
    const updated = list.filter((s) => s.id !== id);
    StorageService.saveStudents(updated);
    return updated;
  },

  // Smart Bidirectional Merge for Students (Anti-Data-Loss Protection)
  mergeStudents: (remoteStudents: Student[]): Student[] => {
    const localList = StorageService.getStudents();
    const deletedMap = StorageService.getDeletedStudentIds();
    const mergedMap = new Map<string, Student>();

    // 1. Initialize map with existing local students
    for (const st of localList) {
      if (st && st.id) {
        mergedMap.set(st.id, st);
      }
    }

    // 2. Iterate through remote students
    for (const r of remoteStudents) {
      if (!r || !r.id) continue;

      // Check if student was explicitly deleted locally
      const deletedAt = deletedMap[r.id];
      if (deletedAt) {
        const rTime = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
        const dTime = new Date(deletedAt).getTime();
        // If deleted locally after or at the same time as remote update, honor deletion!
        if (dTime >= rTime) {
          continue;
        } else {
          // Remote was explicitly updated after local deletion, restore student
          StorageService.removeDeletedStudentId(r.id);
        }
      }

      const local = mergedMap.get(r.id);
      if (!local) {
        // Student exists on remote but not locally (and not deleted): add to local
        mergedMap.set(r.id, r);
      } else {
        // Both exist: compare update timestamps
        const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
        const remoteTime = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;

        if (remoteTime > localTime) {
          // Remote is strictly newer, adopt remote changes
          // But guard: if remote has blank/missing photoUrl and local has valid photoUrl, keep local photoUrl!
          mergedMap.set(r.id, {
            ...r,
            photoUrl: r.photoUrl || local.photoUrl || '',
          });
        } else {
          // Local is newer or equal: KEEP LOCAL EDITS!
          // But if local had no photoUrl and remote does have one, adopt remote photoUrl
          if (!local.photoUrl && r.photoUrl) {
            mergedMap.set(r.id, { ...local, photoUrl: r.photoUrl });
          }
        }
      }
    }

    const result = Array.from(mergedMap.values());
    result.sort((a, b) => (a.no || 0) - (b.no || 0));
    StorageService.saveStudents(result);
    return result;
  },

  // Activities (Harian, Mingguan, Bulanan)
  getActivities: (): ActivityLog[] => {
    try {
      const data = localStorage.getItem(KEYS.ACTIVITIES);
      if (!data) {
        localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
        return INITIAL_ACTIVITIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ACTIVITIES;
    }
  },

  saveActivities: (activities: ActivityLog[]): void => {
    try {
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities to localStorage', e);
    }
  },

  saveActivity: (activity: ActivityLog): ActivityLog[] => {
    const list = StorageService.getActivities();
    const idx = list.findIndex((a) => a.id === activity.id);
    let updated: ActivityLog[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...activity, updatedAt: new Date().toISOString() };
    } else {
      updated = [
        {
          ...activity,
          id: activity.id || `act-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...list,
      ];
    }
    StorageService.saveActivities(updated);
    return updated;
  },

  deleteActivity: (id: string): ActivityLog[] => {
    const list = StorageService.getActivities();
    const updated = list.filter((a) => a.id !== id);
    StorageService.saveActivities(updated);
    return updated;
  },

  // Attendances (Presensi Barcode & Rekap)
  getAttendances: (): AttendanceRecord[] => {
    try {
      const data = localStorage.getItem(KEYS.ATTENDANCES);
      let parsed: AttendanceRecord[];
      if (!data) {
        const students = StorageService.getStudents();
        const seed = generateSeedAttendances(students);
        localStorage.setItem(KEYS.ATTENDANCES, JSON.stringify(seed));
        return seed;
      }
      parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) parsed = [];

      // Check if target students (Raihan, Farel, Moh Checen Potabuga) or any student is missing attendance records
      const currentStudents = StorageService.getStudents();
      const existingStudentIds = new Set(parsed.map((a) => a.studentId));
      const existingStudentNames = new Set(parsed.map((a) => (a.studentName || '').trim().toLowerCase()));

      const missingStudents = currentStudents.filter(
        (st) =>
          !existingStudentIds.has(st.id) &&
          !existingStudentNames.has(st.name.trim().toLowerCase())
      );

      let hasChanges = false;
      let combined = [...parsed];

      if (missingStudents.length > 0) {
        const newRecords = generateSeedAttendances(missingStudents);
        combined = [...newRecords, ...combined];
        hasChanges = true;
      }

      // Also ensure today's attendance record exists for Raihan, Farel, and Moh Checen Potabuga if missing today
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      const dayName = getIndonesianDayName(todayStr);

      const targetNames = ['raihan', 'farel', 'checen'];
      for (const tName of targetNames) {
        const st = currentStudents.find((s) => s.name.toLowerCase().includes(tName));
        if (st) {
          const hasTodayRecord = combined.some(
            (a) =>
              (a.studentId === st.id || (a.studentName || '').toLowerCase().includes(tName)) &&
              a.date === todayStr
          );
          if (!hasTodayRecord) {
            const time = tName === 'raihan' ? '06:48:15' : tName === 'farel' ? '06:52:30' : '06:55:10';
            const todayRecord: AttendanceRecord = {
              id: `att-${todayStr}-${st.id}`,
              studentId: st.id,
              studentName: st.name,
              nisn: st.nisn,
              rombel: st.rombel,
              date: todayStr,
              dayName,
              time,
              session: 'Pembiasaan Pagi / KBM',
              status: 'Hadir',
              method: 'Barcode / QR Scan',
              notes: 'Presensi Barcode Tepat Waktu',
              photoUrl: st.photoUrl,
              scannedAt: `${todayStr}T${time}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            combined.unshift(todayRecord);
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        localStorage.setItem(KEYS.ATTENDANCES, JSON.stringify(combined));
      }

      return combined;
    } catch {
      return [];
    }
  },

  saveAttendances: (attendances: AttendanceRecord[]): void => {
    try {
      localStorage.setItem(KEYS.ATTENDANCES, JSON.stringify(attendances));
    } catch (e) {
      console.error('Failed to save attendances to localStorage', e);
    }
  },

  recordAttendance: (record: AttendanceRecord): { updatedList: AttendanceRecord[]; isNew: boolean; record: AttendanceRecord } => {
    const list = StorageService.getAttendances();
    // Check if record for same student and date already exists
    const idx = list.findIndex(
      (a) => a.id === record.id || (a.studentId === record.studentId && a.date === record.date && (a.session === record.session || !a.session))
    );

    let updatedList: AttendanceRecord[];
    let finalRecord: AttendanceRecord;
    let isNew = false;

    if (idx >= 0) {
      finalRecord = {
        ...list[idx],
        ...record,
        updatedAt: new Date().toISOString(),
      };
      updatedList = [...list];
      updatedList[idx] = finalRecord;
    } else {
      isNew = true;
      finalRecord = {
        ...record,
        id: record.id || `att-${record.date}-${record.studentId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = [finalRecord, ...list];
    }

    StorageService.saveAttendances(updatedList);
    return { updatedList, isNew, record: finalRecord };
  },

  deleteAttendance: (id: string): AttendanceRecord[] => {
    const list = StorageService.getAttendances();
    const updated = list.filter((a) => a.id !== id);
    StorageService.saveAttendances(updated);
    return updated;
  },

  // Consultations
  getConsultations: (): Consultation[] => {
    try {
      const data = localStorage.getItem(KEYS.CONSULTATIONS);
      if (!data) {
        localStorage.setItem(KEYS.CONSULTATIONS, JSON.stringify(INITIAL_CONSULTATIONS));
        return INITIAL_CONSULTATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CONSULTATIONS;
    }
  },

  saveConsultations: (consultations: Consultation[]): void => {
    try {
      localStorage.setItem(KEYS.CONSULTATIONS, JSON.stringify(consultations));
    } catch (e) {
      console.error('Failed to save consultations to localStorage', e);
    }
  },

  saveConsultation: (consultation: Consultation): Consultation[] => {
    const list = StorageService.getConsultations();
    const idx = list.findIndex((c) => c.id === consultation.id);
    let updated: Consultation[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = consultation;
    } else {
      updated = [
        {
          ...consultation,
          id: consultation.id || `cst-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...list,
      ];
    }
    StorageService.saveConsultations(updated);
    return updated;
  },

  deleteConsultation: (id: string): Consultation[] => {
    const list = StorageService.getConsultations();
    const updated = list.filter((c) => c.id !== id);
    StorageService.saveConsultations(updated);
    return updated;
  },

  // Collaborations
  getCollaborations: (): Collaboration[] => {
    try {
      const data = localStorage.getItem(KEYS.COLLABORATIONS);
      if (!data) {
        localStorage.setItem(KEYS.COLLABORATIONS, JSON.stringify(INITIAL_COLLABORATIONS));
        return INITIAL_COLLABORATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COLLABORATIONS;
    }
  },

  saveCollaborations: (collaborations: Collaboration[]): void => {
    try {
      localStorage.setItem(KEYS.COLLABORATIONS, JSON.stringify(collaborations));
    } catch (e) {
      console.error('Failed to save collaborations to localStorage', e);
    }
  },

  saveCollaboration: (collab: Collaboration): Collaboration[] => {
    const list = StorageService.getCollaborations();
    const idx = list.findIndex((c) => c.id === collab.id);
    let updated: Collaboration[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = collab;
    } else {
      updated = [
        {
          ...collab,
          id: collab.id || `col-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...list,
      ];
    }
    StorageService.saveCollaborations(updated);
    return updated;
  },

  deleteCollaboration: (id: string): Collaboration[] => {
    const list = StorageService.getCollaborations();
    const updated = list.filter((c) => c.id !== id);
    StorageService.saveCollaborations(updated);
    return updated;
  },

  // Cases / SOP
  getCases: (): StudentCase[] => {
    try {
      const data = localStorage.getItem(KEYS.CASES);
      if (!data) {
        localStorage.setItem(KEYS.CASES, JSON.stringify(INITIAL_CASES));
        return INITIAL_CASES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CASES;
    }
  },

  saveCases: (cases: StudentCase[]): void => {
    try {
      localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
    } catch (e) {
      console.error('Failed to save cases to localStorage', e);
    }
  },

  saveCase: (item: StudentCase): StudentCase[] => {
    const list = StorageService.getCases();
    const idx = list.findIndex((c) => c.id === item.id);
    let updated: StudentCase[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      const caseCount = list.length + 1;
      const caseNumber = `KASUS/DKV/2026/${String(caseCount).padStart(3, '0')}`;
      updated = [
        {
          ...item,
          id: item.id || `case-${Date.now()}`,
          caseNumber: item.caseNumber || caseNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...list,
      ];
    }
    StorageService.saveCases(updated);
    return updated;
  },

  deleteCase: (id: string): StudentCase[] => {
    const list = StorageService.getCases();
    const updated = list.filter((c) => c.id !== id);
    StorageService.saveCases(updated);
    return updated;
  },

  // School Profile
  getProfile: (): SchoolProfile => {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      if (!data) {
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_SCHOOL_PROFILE));
        return INITIAL_SCHOOL_PROFILE;
      }
      const parsed = JSON.parse(data);
      const merged: SchoolProfile = {
        ...INITIAL_SCHOOL_PROFILE,
        ...(parsed && typeof parsed === 'object' ? parsed : {}),
      };
      // Auto-upgrade if previous default principal name was Yakob Saleh
      if (merged.principalName === 'Drs. H. Yakob A. Saleh, M.Pd' || merged.principalNip === '19680512 199403 1 008') {
        merged.principalName = 'Drs. Jakub A GuE';
        merged.principalNip = '196706081994121002';
      }
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(merged));
      return merged;
    } catch {
      return INITIAL_SCHOOL_PROFILE;
    }
  },

  getAllData: () => {
    return {
      students: StorageService.getStudents(),
      activities: StorageService.getActivities(),
      attendances: StorageService.getAttendances(),
      consultations: StorageService.getConsultations(),
      collaborations: StorageService.getCollaborations(),
      cases: StorageService.getCases(),
      profile: StorageService.getProfile(),
    };
  },

  importAllData: (data: {
    students?: Student[];
    activities?: ActivityLog[];
    attendances?: AttendanceRecord[];
    consultations?: Consultation[];
    collaborations?: Collaboration[];
    cases?: StudentCase[];
    profile?: SchoolProfile;
  }) => {
    if (data.students && Array.isArray(data.students) && data.students.length > 0) {
      StorageService.mergeStudents(data.students);
    }
    if (data.activities && Array.isArray(data.activities) && data.activities.length > 0) {
      StorageService.saveActivities(data.activities);
    }
    if (data.attendances && Array.isArray(data.attendances) && data.attendances.length > 0) {
      StorageService.saveAttendances(data.attendances);
    }
    if (data.consultations && Array.isArray(data.consultations) && data.consultations.length > 0) {
      StorageService.saveConsultations(data.consultations);
    }
    if (data.collaborations && Array.isArray(data.collaborations) && data.collaborations.length > 0) {
      StorageService.saveCollaborations(data.collaborations);
    }
    if (data.cases && Array.isArray(data.cases) && data.cases.length > 0) {
      StorageService.saveCases(data.cases);
    }
    if (data.profile && typeof data.profile === 'object' && Object.keys(data.profile).length > 0) {
      const current = StorageService.getProfile();
      StorageService.saveProfile({
        ...current,
        ...data.profile,
      });
    }
  },

  saveProfile: (profile: SchoolProfile): void => {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  // Reset to default empty state
  resetAll: (): void => {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(KEYS.ATTENDANCES, JSON.stringify(generateSeedAttendances(INITIAL_STUDENTS)));
    localStorage.setItem(KEYS.CONSULTATIONS, JSON.stringify(INITIAL_CONSULTATIONS));
    localStorage.setItem(KEYS.COLLABORATIONS, JSON.stringify(INITIAL_COLLABORATIONS));
    localStorage.setItem(KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_SCHOOL_PROFILE));
  },

  // Clear all data records (Students, Activities, Attendances, Consultations, Collaborations, Cases)
  clearAll: (): void => {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify([]));
    localStorage.setItem(KEYS.ATTENDANCES, JSON.stringify([]));
    localStorage.setItem(KEYS.CONSULTATIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.COLLABORATIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.CASES, JSON.stringify([]));
  },
};

