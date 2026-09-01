import React from 'react';
import {
  Student,
  Consultation,
  Collaboration,
  StudentCase,
  SchoolProfile,
} from '../types';
import { OfficialHeader } from './OfficialHeader';
import { SignatureBlock } from './SignatureBlock';
import { DriveImage } from './DriveImage';
import { Printer, X, Download } from 'lucide-react';
import {
  formatIndonesianDate,
  formatPeriod,
  getTodayDateString,
} from '../utils/formatters';

export type PrintDocType =
  | 'student_profile'
  | 'consultation_report'
  | 'collaboration_report'
  | 'case_journal'
  | 'unified_journal';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: PrintDocType;
  profile: SchoolProfile;
  student?: Student | null;
  consultations?: Consultation[];
  collaborations?: Collaboration[];
  studentCase?: StudentCase | null;
  period?: string;
  filterStudentName?: string;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  docType,
  profile,
  student,
  consultations = [],
  collaborations = [],
  studentCase,
  period,
  filterStudentName,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-6 print:p-0 print:bg-white print:static">
      {/* Top Floating Bar for user actions (hidden on print) */}
      <div className="no-print w-full max-w-4xl bg-slate-900 text-white rounded-2xl p-3 sm:p-4 mb-4 shadow-xl flex items-center justify-between sticky top-2 z-20">
        <div>
          <h3 className="text-sm font-bold">Pratinjau Dokumen Cetak / PDF</h3>
          <p className="text-xs text-slate-300">
            Tata letak resmi kop surat SMK Negeri 2 Gorontalo format A4
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="do-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="bg-white w-full max-w-4xl min-h-[1050px] shadow-2xl rounded-none sm:rounded-lg p-6 sm:p-10 text-slate-900 border border-slate-200 print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none">
        {/* KOP SURAT RESMI */}
        <OfficialHeader profile={profile} />

        {/* 1. DOCUMENT: PROFIL IDENTITAS MURID WALI */}
        {docType === 'student_profile' && student && (
          <div className="space-y-3.5">
            <div className="text-center my-2">
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide underline underline-offset-4">
                LEMBAR IDENTITAS & BUKU INDUK MURID WALI
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Program Keahlian {profile.expertiseProgram || 'Desain Komunikasi Visual (DKV)'} • Tahun Ajaran {profile.schoolYear || '2026/2027'}
              </p>
            </div>

            {/* BAGIAN 1: IDENTITAS MURID */}
            <div className="border border-slate-900 text-xs">
              <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-900 flex justify-between items-center">
                <span>1. IDENTITAS MURID</span>
                <span className="font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded">Rombel: {student.rombel}</span>
              </div>
              <div className="p-3 flex flex-col md:flex-row gap-4">
                {/* Photo 3x4 */}
                <div className="w-24 h-32 border border-slate-900 shrink-0 flex flex-col items-center justify-center bg-slate-50 text-[10px] text-slate-500 overflow-hidden relative">
                  {student.photoUrl ? (
                    <DriveImage
                      src={student.photoUrl}
                      alt={student.name}
                      preset="low"
                      fallbackType="student"
                      gender={student.gender}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-1 font-semibold">
                      <span>Pas Foto</span>
                      <br />
                      <span>3 x 4 cm</span>
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <span className="text-slate-600 inline-block w-32">1. Nama Lengkap</span>
                    <span className="font-bold">: {student.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">2. Nama Panggilan</span>
                    <span>: {student.nickname || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">3. NISN</span>
                    <span className="font-bold font-mono">: {student.nisn || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">4. Tempat, Tgl Lahir</span>
                    <span>
                      : {student.tempatTanggalLahir || (student.birthPlace ? `${student.birthPlace}, ${student.birthDate}` : '-')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">5. Jenis Kelamin</span>
                    <span>: {student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">6. Agama</span>
                    <span>: {student.religion || 'Islam'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 inline-block w-32">7. Alamat Rumah</span>
                    <span>: {student.address || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">8. Status Kelahiran</span>
                    <span>
                      : {student.statusKelahiran || (student.birthOrder ? `Anak ke ${student.birthOrder} dari ${student.totalSiblings || 1} bersaudara` : '-')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">9. No. HP Pribadi</span>
                    <span>: {student.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">10. Media Sosial</span>
                    <span>: {student.socialMedia || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 inline-block w-32">11. Penyakit Kronis</span>
                    <span>
                      : {student.penyakitKronis || (student.chronicIllnessHistory?.length ? student.chronicIllnessHistory.join(', ') : '-')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BAGIAN 2: IDENTITAS ORANG TUA / WALI */}
            <div className="border border-slate-900 text-xs">
              <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-900">
                2. IDENTITAS ORANG TUA / WALI
              </div>
              <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {/* Data Ayah */}
                <div className="col-span-2 text-blue-900 font-bold border-b border-slate-200 pb-1 mt-0.5">
                  A. Data Ayah
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">1. Nama Ayah</span>
                  <span className="font-bold">: {student.fatherName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">2. Pekerjaan Ayah</span>
                  <span>: {student.fatherJob || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">3. Suku/Etnis Ayah</span>
                  <span>: {student.fatherEthnicity || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">4. Hubungan Ayah</span>
                  <span>: {student.fatherRelation || 'Kandung'}</span>
                </div>

                {/* Data Ibu */}
                <div className="col-span-2 text-blue-900 font-bold border-b border-slate-200 pb-1 mt-1.5">
                  B. Data Ibu
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">5. Nama Ibu</span>
                  <span className="font-bold">: {student.motherName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">6. Pekerjaan Ibu</span>
                  <span>: {student.motherJob || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">7. Suku/Etnis Ibu</span>
                  <span>: {student.motherEthnicity || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">8. Hubungan Ibu</span>
                  <span>: {student.motherRelation || 'Kandung'}</span>
                </div>

                {/* Kontak Orang Tua & Kerabat */}
                <div className="col-span-2 text-blue-900 font-bold border-b border-slate-200 pb-1 mt-1.5">
                  C. Kontak Orang Tua & Kerabat
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">9. No HP Orang Tua/Wali</span>
                  <span className="font-bold">: {student.parentPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">10. No HP Kakak/Adik</span>
                  <span>: {student.siblingPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">11. No HP Tetangga</span>
                  <span>: {student.neighborPhone || '-'}</span>
                </div>
              </div>
            </div>

            {/* BAGIAN 3: RIWAYAT PENDIDIKAN & PRESTASI */}
            <div className="border border-slate-900 text-xs">
              <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-900">
                3. RIWAYAT PENDIDIKAN, PRESTASI & EKSTRAKURIKULER
              </div>
              <div className="p-3 space-y-2">
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-300 p-1.5 w-24">Jenjang</th>
                      <th className="border border-slate-300 p-1.5">Nama Sekolah</th>
                      <th className="border border-slate-300 p-1.5 w-24 text-center">Th. Masuk</th>
                      <th className="border border-slate-300 p-1.5 w-24 text-center">Th. Keluar</th>
                      <th className="border border-slate-300 p-1.5 w-24 text-center">Lama Belajar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-1.5 font-bold">TK / PAUD</td>
                      <td className="border border-slate-300 p-1.5">
                        {student.tkNama || student.educationHistory?.find(e => e.level === 'TK')?.schoolName || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.tkTahunMasuk || student.educationHistory?.find(e => e.level === 'TK')?.entryYear || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.tkTahunKeluar || student.educationHistory?.find(e => e.level === 'TK')?.gradYear || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.tkLamaBelajar || student.educationHistory?.find(e => e.level === 'TK')?.duration || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-1.5 font-bold">SD / MI</td>
                      <td className="border border-slate-300 p-1.5 font-semibold">
                        {student.sdNama || student.educationHistory?.find(e => e.level === 'SD')?.schoolName || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.sdTahunMasuk || student.educationHistory?.find(e => e.level === 'SD')?.entryYear || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.sdTahunKeluar || student.educationHistory?.find(e => e.level === 'SD')?.gradYear || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.sdLamaBelajar || student.educationHistory?.find(e => e.level === 'SD')?.duration || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-1.5 font-bold">SMP / MTS</td>
                      <td className="border border-slate-300 p-1.5 font-semibold">
                        {student.smpNama || student.educationHistory?.find(e => e.level === 'SMP')?.schoolName || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.smpTahunMasuk || student.educationHistory?.find(e => e.level === 'SMP')?.entryYear || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.smpTahunKeluar || student.educationHistory?.find(e => e.level === 'SMP')?.gradYear || '-'}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        {student.smpLamaBelajar || student.educationHistory?.find(e => e.level === 'SMP')?.duration || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-600 block font-semibold mb-0.5">4. Prestasi di SD:</span>
                    <p className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                      {student.prestasiSD || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 block font-semibold mb-0.5">5. Prestasi di SMP:</span>
                    <p className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                      {student.prestasiSMP || (student.achievements?.length ? student.achievements.map(a => `${a.title} (${a.year})`).join(', ') : '-')}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block font-semibold mb-0.5">6. Ekstrakurikuler Saat Ini:</span>
                    <p className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                      {student.ekstrakurikuler || (student.extracurriculars?.length ? student.extracurriculars.map(e => e.name).join(', ') : '-')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BAGIAN 4: ASPIRASI STUDI & MINAT */}
            <div className="border border-slate-900 text-xs">
              <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-900">
                4. CITA-CITA, MINAT & ASPIRASI STUDI
              </div>
              <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <span className="text-slate-600 inline-block w-36">Cita-cita Profesi</span>
                  <span className="font-bold">
                    : {(Array.isArray(student.careerGoals) ? student.careerGoals.filter(Boolean).join(' / ') : student.careerGoals) || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">Aspirasi Lanjutan</span>
                  <span>: {student.furtherStudyAspiration || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">Mapel Paling Dikuasai</span>
                  <span className="text-emerald-800 font-semibold">
                    : {student.masteredSubjects?.filter(Boolean).join(', ') || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-36">Mapel Perlu Bimbingan</span>
                  <span className="text-amber-800 font-semibold">
                    : {student.strugglingSubjects?.filter(Boolean).join(', ') || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <SignatureBlock profile={profile} />
          </div>
        )}

        {/* 2. DOCUMENT: LAPORAN PELAKSANAAN KONSULTASI PERWALIAN */}
        {docType === 'consultation_report' && (
          <div className="space-y-4">
            <div className="text-center my-3">
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide underline underline-offset-4">
                LAPORAN PELAKSANAAN KONSULTASI PERWALIAN
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Periode: {period ? formatPeriod(period) : 'Semua Periode'} • Guru Wali: {profile.homeroomTeacherName}
              </p>
              {filterStudentName && (
                <p className="text-xs font-bold text-blue-900">
                  Sasaran Khusus: {filterStudentName}
                </p>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="border border-slate-900 p-2 text-center w-8">No</th>
                    <th className="border border-slate-900 p-2 text-left w-36">Hari, Tanggal</th>
                    <th className="border border-slate-900 p-2 text-left w-40">Nama Murid (Rombel)</th>
                    <th className="border border-slate-900 p-2 text-left">Masalah yang Dibicarakan</th>
                    <th className="border border-slate-900 p-2 text-left">Saran Guru Wali / Tindak Lanjut</th>
                    <th className="border border-slate-900 p-2 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((item, idx) => (
                    <tr key={item.id} className="align-top hover:bg-slate-50">
                      <td className="border border-slate-900 p-2 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-900 p-2">
                        <span className="font-bold block">{item.dayName},</span>
                        <span>{formatIndonesianDate(item.date)}</span>
                      </td>
                      <td className="border border-slate-900 p-2">
                        <span className="font-bold block">{item.studentName}</span>
                        <span className="text-[11px] text-slate-600">({item.studentRombel})</span>
                      </td>
                      <td className="border border-slate-900 p-2 leading-relaxed">{item.problem}</td>
                      <td className="border border-slate-900 p-2 leading-relaxed">{item.teacherAdvice}</td>
                      <td className="border border-slate-900 p-2 text-center font-semibold text-[11px]">
                        {item.followUpStatus}
                      </td>
                    </tr>
                  ))}

                  {consultations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="border border-slate-900 p-6 text-center text-slate-500 italic">
                        Tidak ada catatan konsultasi pada periode yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <SignatureBlock profile={profile} />
          </div>
        )}

        {/* 3. DOCUMENT: LAPORAN KOLABORASI BK, WALI KELAS, GURU MAPEL */}
        {docType === 'collaboration_report' && (
          <div className="space-y-4">
            <div className="text-center my-3">
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide underline underline-offset-4">
                LAPORAN KOLABORASI DENGAN GURU BK, WALI KELAS, GURU MAPEL
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Periode: {period ? formatPeriod(period) : 'Semua Periode'} • Guru Wali: {profile.homeroomTeacherName}
              </p>
              {filterStudentName && (
                <p className="text-xs font-bold text-emerald-900">
                  Sasaran Khusus: {filterStudentName}
                </p>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="border border-slate-900 p-2 text-center w-8">No</th>
                    <th className="border border-slate-900 p-2 text-left w-36">Hari, Tanggal</th>
                    <th className="border border-slate-900 p-2 text-left w-36">Kolaborator</th>
                    <th className="border border-slate-900 p-2 text-left w-48">Bentuk Kolaborasi</th>
                    <th className="border border-slate-900 p-2 text-left">Sasaran Murid Wali & Masalahnya</th>
                    <th className="border border-slate-900 p-2 text-left">Rencana Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody>
                  {collaborations.map((item, idx) => (
                    <tr key={item.id} className="align-top hover:bg-slate-50">
                      <td className="border border-slate-900 p-2 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-900 p-2">
                        <span className="font-bold block">{item.dayName},</span>
                        <span>{formatIndonesianDate(item.date)}</span>
                      </td>
                      <td className="border border-slate-900 p-2 font-semibold">
                        {item.collaborators?.map((c) => (c === 'Lainnya' && item.collaboratorOther ? item.collaboratorOther : c)).join(', ') || '-'}
                      </td>
                      <td className="border border-slate-900 p-2">
                        <ul className="list-disc list-inside space-y-0.5">
                          {(item.forms || []).map((f, i) => (
                            <li key={i}>{f === 'Lainnya' && item.formOther ? item.formOther : f}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-slate-900 p-2">
                        <span className="font-bold block text-slate-900">
                          {item.studentName} ({item.studentRombel})
                        </span>
                        <p className="mt-1 leading-relaxed">{item.problemDetails}</p>
                      </td>
                      <td className="border border-slate-900 p-2 leading-relaxed">
                        {item.followUpPlan || '-'}
                      </td>
                    </tr>
                  ))}

                  {collaborations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="border border-slate-900 p-6 text-center text-slate-500 italic">
                        Tidak ada catatan kolaborasi pada periode yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <SignatureBlock profile={profile} />
          </div>
        )}

        {/* 4. DOCUMENT: JURNAL SOP PENANGANAN KASUS MURID WALI */}
        {docType === 'case_journal' && studentCase && (
          <div className="space-y-4">
            <div className="text-center my-3">
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide underline underline-offset-4">
                JURNAL PENANGANAN MASALAH MURID WALI (SOP KOLABORASI)
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Nomor Register: {studentCase.caseNumber} • Program DKV SMKN 2 Gorontalo
              </p>
            </div>

            {/* Case Summary Info Box */}
            <div className="border border-slate-900 text-xs">
              <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-900 flex justify-between">
                <span>IDENTITAS KASUS MURID WALI</span>
                <span>STATUS: {studentCase.status.toUpperCase()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <span className="text-slate-600 inline-block w-32">Nama Murid</span>
                  <span className="font-bold">: {studentCase.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-32">Rombongan Belajar</span>
                  <span className="font-bold">: {studentCase.studentRombel}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-32">Judul Kasus</span>
                  <span className="font-bold">: {studentCase.title}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-32">Tanggal Inisiasi</span>
                  <span>: {formatIndonesianDate(studentCase.startDate)}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-32">Jalur Penanganan</span>
                  <span className="font-bold">: {studentCase.pathway || 'Jalur A'}</span>
                </div>
                <div>
                  <span className="text-slate-600 inline-block w-32">Tahap Berjalan</span>
                  <span className="font-bold">: Tahap {studentCase.currentStep} dari 8</span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-slate-600 block font-semibold">Uraian Masalah Awal:</span>
                  <p className="mt-0.5 p-2 bg-slate-50 border border-slate-200 rounded">
                    {studentCase.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Chronology Table of 8 SOP Steps */}
            <div>
              <h3 className="text-xs font-bold uppercase mb-1">
                KRONOLOGI & TAHAPAN PELAKSANAAN SOP MEKANISME KOLABORASI:
              </h3>
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="border border-slate-900 p-2 text-center w-12">Tahap</th>
                    <th className="border border-slate-900 p-2 text-left w-48">Nama Tahapan SOP</th>
                    <th className="border border-slate-900 p-2 text-left w-32">Tanggal & Pelaksana</th>
                    <th className="border border-slate-900 p-2 text-left">Uraian Kegiatan & Catatan Temuan</th>
                  </tr>
                </thead>
                <tbody>
                  {studentCase.logs.map((log) => (
                    <tr key={log.step} className="align-top hover:bg-slate-50">
                      <td className="border border-slate-900 p-2 text-center font-bold">
                        {log.step}
                      </td>
                      <td className="border border-slate-900 p-2 font-bold">
                        {log.stepTitle}
                      </td>
                      <td className="border border-slate-900 p-2">
                        <span className="block">{formatIndonesianDate(log.date)}</span>
                        <span className="text-[11px] text-slate-600 font-semibold">{log.actor}</span>
                      </td>
                      <td className="border border-slate-900 p-2 leading-relaxed">
                        <p>{log.notes}</p>
                        {log.extraData?.homeVisitNotes && (
                          <div className="mt-1 p-1 bg-emerald-50 text-emerald-900 text-[11px] border border-emerald-200 rounded">
                            <strong>Kunjungan Rumah (Home Visit):</strong> {log.extraData.homeVisitNotes}
                          </div>
                        )}
                        {log.extraData?.principalDirectives && (
                          <div className="mt-1 p-1 bg-red-50 text-red-900 text-[11px] border border-red-200 rounded">
                            <strong>Arahan Kepala Sekolah:</strong> {log.extraData.principalDirectives}
                          </div>
                        )}
                        {log.extraData?.evaluationNotes && (
                          <div className="mt-1 p-1 bg-purple-50 text-purple-900 text-[11px] border border-purple-200 rounded">
                            <strong>Evaluasi Akhir:</strong> {log.extraData.evaluationNotes}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Special Summary Notes if available */}
            {studentCase.evaluationNotes && (
              <div className="border border-slate-900 p-3 text-xs bg-slate-50">
                <span className="font-bold block mb-1">REKOMENDASI & HASIL EVALUASI AKHIR:</span>
                <p>{studentCase.evaluationNotes}</p>
              </div>
            )}

            {/* Signatures */}
            <SignatureBlock profile={profile} />
          </div>
        )}

        {/* 5. DOCUMENT: REKAP JURNAL KEGIATAN TERPADU GURU WALI */}
        {docType === 'unified_journal' && (
          <div className="space-y-4">
            <div className="text-center my-3">
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide underline underline-offset-4">
                REKAP JURNAL KEGIATAN TERPADU GURU WALI
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Periode: {period ? formatPeriod(period) : 'Semua Periode'} • Guru Wali: {profile.homeroomTeacherName}
              </p>
              {filterStudentName && (
                <p className="text-xs font-bold text-blue-900">
                  Sasaran: {filterStudentName}
                </p>
              )}
            </div>

            {/* Combined Activities */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="border border-slate-900 p-2 text-center w-8">No</th>
                    <th className="border border-slate-900 p-2 text-left w-32">Tanggal</th>
                    <th className="border border-slate-900 p-2 text-left w-32">Jenis Kegiatan</th>
                    <th className="border border-slate-900 p-2 text-left w-40">Nama Murid (Rombel)</th>
                    <th className="border border-slate-900 p-2 text-left">Uraian Masalah / Kegiatan</th>
                    <th className="border border-slate-900 p-2 text-left">Tindak Lanjut / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Consultations */}
                  {consultations.map((c, i) => (
                    <tr key={`c-${c.id}`} className="align-top hover:bg-slate-50">
                      <td className="border border-slate-900 p-2 text-center">{i + 1}</td>
                      <td className="border border-slate-900 p-2">{formatIndonesianDate(c.date)}</td>
                      <td className="border border-slate-900 p-2 font-bold text-amber-800">
                        Konsultasi Perwalian
                      </td>
                      <td className="border border-slate-900 p-2 font-semibold">
                        {c.studentName} ({c.studentRombel})
                      </td>
                      <td className="border border-slate-900 p-2 leading-relaxed">{c.problem}</td>
                      <td className="border border-slate-900 p-2 leading-relaxed">
                        <span>{c.teacherAdvice}</span>
                        <span className="block mt-1 font-bold text-[10px]">[{c.followUpStatus}]</span>
                      </td>
                    </tr>
                  ))}

                  {/* Collaborations */}
                  {collaborations.map((col, i) => (
                    <tr key={`col-${col.id}`} className="align-top hover:bg-slate-50">
                      <td className="border border-slate-900 p-2 text-center">
                        {consultations.length + i + 1}
                      </td>
                      <td className="border border-slate-900 p-2">{formatIndonesianDate(col.date)}</td>
                      <td className="border border-slate-900 p-2 font-bold text-emerald-800">
                        Kolaborasi ({col.collaborators?.join(', ') || 'Lintas Pendidik'})
                      </td>
                      <td className="border border-slate-900 p-2 font-semibold">
                        {col.studentName} ({col.studentRombel})
                      </td>
                      <td className="border border-slate-900 p-2 leading-relaxed">
                        {col.problemDetails}
                      </td>
                      <td className="border border-slate-900 p-2 leading-relaxed">
                        {col.followUpPlan || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <SignatureBlock profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
};
