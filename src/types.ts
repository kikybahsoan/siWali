export type RombelType = '10-DKV-1' | '10-DKV-2' | '10-DKV-3' | '11-DKV-3';

export type GenderType = 'L' | 'P';

export interface EducationHistory {
  level: 'TK' | 'SD' | 'SMP';
  schoolName: string;
  entryYear: string;
  gradYear: string;
  duration: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: 'Akademik' | 'Non-Akademik';
  level: 'Sekolah' | 'Kecamatan' | 'Kota' | 'Provinsi' | 'Nasional';
  year: string;
}

export interface Extracurricular {
  id: string;
  name: string;
  role?: string;
}

export interface Student {
  id: string;
  no: number;
  // 1. IDENTITAS MURID
  name: string; // 1. Nama Lengkap
  nickname?: string; // 2. Nama Panggilan
  nisn: string; // 3. NISN
  birthPlace: string; // Tempat Lahir
  birthDate: string; // Tanggal Lahir (DD-MM-YYYY)
  tempatTanggalLahir?: string; // 4. Tempat, Tanggal Lahir gabungan (e.g. Gorontalo, 22 Maret 2011)
  gender: GenderType; // 5. Jenis Kelamin ('L' | 'P' / Laki-laki | Perempuan)
  religion?: string; // 6. Agama
  address: string; // 7. Alamat Rumah
  addressDetail?: {
    rtRw?: string;
    kelurahan?: string;
    kecamatan?: string;
    kabKota?: string;
  };
  statusKelahiran?: string; // 8. Status Kelahiran (e.g. "Anak ke 2 dari 3 bersaudara")
  birthOrder?: number; // Anak ke-
  totalSiblings?: number; // Dari ... bersaudara
  phone?: string; // 9. No HP Pribadi
  socialMedia?: string; // 10. Akun Media Sosial
  penyakitKronis?: string; // 11. Penyakit Kronis yang Pernah Diderita
  chronicIllnessHistory?: string[]; // list riwayat penyakit
  photoUrl?: string; // Foto Murid (URL Google Drive / Gambar Resolusi Rendah)

  // Rombel & Kategori
  rombel: RombelType;

  // 2. IDENTITAS ORANG TUA / WALI
  // Data Ayah
  fatherName: string; // 1. Nama Ayah
  fatherJob?: string; // 2. Pekerjaan Ayah
  fatherEthnicity?: string; // 3. Suku/Etnis Ayah
  fatherRelation?: 'Kandung' | 'Tiri' | 'Angkat' | 'Wali' | 'Alm.' | string; // 4. Hubungan Ayah dgn Murid
  fatherIncome?: string;

  // Data Ibu
  motherName: string; // 5. Nama Ibu
  motherJob?: string; // 6. Pekerjaan Ibu
  motherEthnicity?: string; // 7. Suku/Etnis Ibu
  motherRelation?: 'Kandung' | 'Tiri' | 'Angkat' | 'Wali' | 'Almh.' | string; // 8. Hubungan Ibu dgn Murid
  motherIncome?: string;

  // Wali Asuh (opsional)
  guardianName?: string;
  guardianJob?: string;
  guardianRelation?: string;

  // Kontak Orang Tua & Kerabat
  parentPhone?: string; // 9. No HP Orang Tua/Wali
  siblingPhone?: string; // 10. No HP Kakak/Adik
  neighborPhone?: string; // 11. No HP Tetangga

  // 3. RIWAYAT PENDIDIKAN & PRESTASI
  // TK / PAUD
  tkNama?: string;
  tkTahunMasuk?: string;
  tkTahunKeluar?: string;
  tkLamaBelajar?: string;

  // SD / MI
  sdNama?: string;
  sdTahunMasuk?: string;
  sdTahunKeluar?: string;
  sdLamaBelajar?: string;

  // SMP / MTS
  smpNama?: string;
  smpTahunMasuk?: string;
  smpTahunKeluar?: string;
  smpLamaBelajar?: string;

  // Prestasi & Ekskul
  prestasiSD?: string; // 4. Prestasi di SD
  prestasiSMP?: string; // 5. Prestasi di SMP
  ekstrakurikuler?: string; // 6. Ekstrakurikuler di sekolah saat ini

  // Legacy structured collections
  educationHistory?: EducationHistory[];
  achievements?: Achievement[];
  extracurriculars?: Extracurricular[];

  // 4. ASPIRASI STUDI & MINAT KARIER (Bagian Pelengkap Guru Wali)
  careerGoals?: [string, string] | string[];
  furtherStudyAspiration?: string;
  masteredSubjects?: string[];
  strugglingSubjects?: string[];
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  studentId: string;
  studentName: string;
  studentRombel: RombelType;
  date: string; // YYYY-MM-DD
  dayName: string; // Senin, Selasa, etc.
  problem: string;
  teacherAdvice: string;
  followUpStatus: 'Selesai' | 'Perlu Tindak Lanjut' | 'Dirujuk ke Kasus';
  createdAt: string;
}

export type CollaboratorType = 'Guru BK' | 'Wali Kelas' | 'Guru Mapel' | 'Lainnya';

export type CollaborationFormType =
  | 'Permintaan informasi akademik'
  | 'Diskusi hasil asesmen psikologis'
  | 'Observasi perilaku berisiko'
  | 'Konsultasi perkembangan/masalah'
  | 'Penanganan/rujukan kasus'
  | 'Penyusunan program bimbingan'
  | 'Lainnya';

export interface Collaboration {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string;
  collaborators: CollaboratorType[];
  collaboratorOther?: string;
  forms: CollaborationFormType[];
  formOther?: string;
  studentId: string;
  studentName: string;
  studentRombel: RombelType;
  problemDetails: string;
  followUpPlan?: string;
  createdAt: string;
}

export type CasePathway = 'Jalur A' | 'Jalur B'; // Jalur A: Akademik, Jalur B: Sosial/Karakter

export type SopStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SopStepLog {
  step: SopStepNumber;
  stepTitle: string;
  date: string;
  notes: string;
  actor: string;
  completed: boolean;
  extraData?: {
    hasFinding?: boolean;
    pathway?: CasePathway;
    homeVisitConducted?: boolean;
    homeVisitNotes?: string;
    isSevereEscalated?: boolean;
    principalDirectives?: string;
    evaluationNotes?: string;
  };
}

export interface StudentCase {
  id: string;
  caseNumber: string; // e.g. "KASUS/DKV/2026/001"
  studentId: string;
  studentName: string;
  studentRombel: RombelType;
  title: string;
  description: string;
  startDate: string;
  currentStep: SopStepNumber;
  pathway?: CasePathway; // Jalur A: Akademik & Pembelajaran, Jalur B: Pribadi/Sosial/Karakter
  status: 'Aktif' | 'Eskalasi' | 'Selesai' | 'Dibatalkan';
  hasHomeVisit?: boolean;
  homeVisitNotes?: string;
  isEscalatedToPrincipal?: boolean;
  principalNotes?: string;
  evaluationNotes?: string;
  logs: SopStepLog[];
  createdAt: string;
  updatedAt: string;
}

export interface SchoolProfile {
  name: string;
  address: string;
  subdistrict: string;
  city: string;
  province: string;
  email: string;
  phone: string;
  postalCode: string;
  principalName: string;
  principalNip: string;
  homeroomTeacherName: string;
  homeroomTeacherNip: string;
  expertiseProgram: string;
  schoolYear: string;
  semester: string;
}

export type ActivityType = 'Harian' | 'Mingguan' | 'Bulanan';

export type ActivityCategory =
  | 'Religi & Sholat Dhuha'
  | 'Literasi Pagi'
  | 'Kebersihan & Lingkungan'
  | 'Senam & Olahraga'
  | 'Upacara & Apel'
  | 'Evaluasi & Refleksi Perwalian'
  | 'Bimbingan Klasikal'
  | 'Parenting / Temu Wali Murid'
  | 'Asesmen Perkembangan'
  | 'Bakti Sosial & Aksi Nyata'
  | 'Lainnya';

export interface ProfilLulusanDimension {
  id: string;
  name: string;
  description: string;
}

export const PROFIL_LULUSAN_DIMENSIONS: ProfilLulusanDimension[] = [
  {
    id: 'keimanan_ketakwaan',
    name: 'Keimanan dan Ketakwaan',
    description: 'Berakhlak mulia dan taat kepada Tuhan Yang Maha Esa.',
  },
  {
    id: 'kewargaan',
    name: 'Kewargaan',
    description: 'Memiliki kesadaran rasa cinta tanah air dan tanggung jawab sosial.',
  },
  {
    id: 'penalaran_kritis',
    name: 'Penalaran Kritis',
    description: 'Mampu memecahkan masalah secara logis dan analitis.',
  },
  {
    id: 'kreativitas',
    name: 'Kreativitas',
    description: 'Mampu menghasilkan gagasan atau karya yang baru dan orisinal.',
  },
  {
    id: 'kolaborasi',
    name: 'Kolaborasi',
    description: 'Mampu bekerja sama secara efektif dalam kelompok.',
  },
  {
    id: 'kemandirian',
    name: 'Kemandirian',
    description: 'Mampu mengatur diri dan bertanggung jawab atas proses belajarnya.',
  },
  {
    id: 'kesehatan',
    name: 'Kesehatan',
    description: 'Memiliki kesejahteraan jasmani dan rohani yang bugar.',
  },
  {
    id: 'komunikasi',
    name: 'Komunikasi',
    description: 'Mampu menyampaikan pesan secara jelas dan santun.',
  },
];

export interface ActivityLog {
  id: string;
  title: string;
  type: ActivityType; // Harian | Mingguan | Bulanan
  category: ActivityCategory | string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "07:00 - 07:30"
  dayName?: string; // Senin, Selasa, etc.
  rombel: RombelType | 'Semua Rombel';
  targetParticipants?: string;
  actualAttendanceCount?: number;
  status: 'Terlaksana' | 'Berlangsung' | 'Terjadwal';
  location?: string;
  description: string;
  outcome?: string; // Hasil kegiatan / catatan evaluasi
  profilLulusan?: string[]; // Daftar 8 Dimensi Profil Lulusan yang dipilih
  photoUrl?: string; // Foto Google Drive / URL resolusi rendah
  documentationPhotos?: string[];
  leaderOrPic?: string; // Guru Pembina / Penanggung Jawab
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Terlambat';

export type AttendanceMethod = 'Barcode / QR Scan' | 'Manual' | 'Auto Generate';

export type AttendanceSession = 'Pembiasaan Pagi / KBM' | 'Sholat Dhuha' | 'Literasi DKV' | 'Senam Pagi' | 'KBM Siang' | 'Kegiatan Khusus';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  rombel: RombelType;
  date: string; // YYYY-MM-DD
  dayName: string; // Senin, Selasa, dll.
  time: string; // HH:mm:ss
  session: AttendanceSession | string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  notes?: string;
  photoUrl?: string;
  scannedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetUrl?: string;
  lastSyncTime?: string;
  autoSyncEnabled: boolean;
  syncIntervalSeconds?: number;
}

export interface FullSyncPayload {
  students: Student[];
  activities?: ActivityLog[];
  attendances?: AttendanceRecord[];
  consultations: Consultation[];
  collaborations: Collaboration[];
  cases: StudentCase[];
  profile: SchoolProfile;
  lastUpdated?: string;
}

