import { Student, Consultation, Collaboration, StudentCase, SchoolProfile, ActivityLog } from '../types';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  name: 'SMK NEGERI 2 GORONTALO',
  address: 'Jl. Achmad Nadjamuddin, Kel. Limba U Dua, Kec. Kota Selatan',
  subdistrict: 'Kota Selatan',
  city: 'Kota Gorontalo',
  province: 'Provinsi Gorontalo',
  email: 'smkngorontalo.@gmail.com',
  phone: '(0435) 822354',
  postalCode: '96115',
  principalName: 'Drs. Jakub A GuE',
  principalNip: '196706081994121002',
  homeroomTeacherName: 'Abdul Rahman Bahsoan',
  homeroomTeacherNip: '19840715 201001 1 014',
  expertiseProgram: 'DKV (Desain Komunikasi Visual)',
  schoolYear: '2026/2027',
  semester: 'Ganjil',
};

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_CONSULTATIONS: Consultation[] = [];

export const INITIAL_COLLABORATIONS: Collaboration[] = [];

export const INITIAL_CASES: StudentCase[] = [];

export const INITIAL_ACTIVITIES: ActivityLog[] = [];
