import { GoogleSheetsConfig, FullSyncPayload, Student, Consultation, Collaboration, StudentCase, SchoolProfile, AttendanceRecord, ActivityLog } from '../types';
import { StorageService } from './storage';

const SHEETS_CONFIG_KEY = 'siwali_sheets_sync_config_v1';

export const DEFAULT_SHEETS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwyFanvCA1kSeZ8_jKEQSmDmlggpuGdcJEN29kCsM8a4QNiH6Sf3mqLIId2Ipfa_XJK/exec';

export const DEFAULT_SHEETS_CONFIG: GoogleSheetsConfig = {
  webAppUrl: DEFAULT_SHEETS_WEB_APP_URL,
  spreadsheetUrl: '',
  lastSyncTime: '',
  autoSyncEnabled: true,
  syncIntervalSeconds: 120, // 2 Menit
};

export const GoogleAppsScriptTemplate = `/**
 * ============================================================================
 * siWali - Sistem Informasi Guru Wali SMK Negeri 2 Gorontalo
 * SCRIPT SINKRONISASI REAL-TIME GOOGLE SPREADSHEETS
 * ============================================================================
 * Petunjuk Pemasangan:
 * 1. Di Google Sheets, klik menu: Ekstensi > Apps Script
 * 2. Hapus semua kode di editor dan tempel kode ini seluruhnya
 * 3. Klik Simpan (Ikon Disket)
 * 4. Klik tombol 'Terapkan' (Deploy) di kanan atas > 'Penerapan Baru' (New Deployment)
 * 5. Pilih jenis: 'Aplikasi Web' (Web App)
 *    - Deskripsi: 'siWali Cloud Sync'
 *    - Jalankan sebagai: 'Saya' (Me)
 *    - Siapa yang memiliki akses: 'Siapa saja' (Anyone)
 * 6. Klik 'Terapkan' (Deploy), berikan izin akses Google akun Anda
 * 7. Salin 'URL Aplikasi Web' (berakhiran /exec) dan tempelkan di aplikasi siWali!
 * ============================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'fetch_all';
  
  if (action === 'push_all' && e.parameter.payload) {
    try {
      var payload = JSON.parse(e.parameter.payload);
      var result = saveAllDataToSheets(payload);
      return createJsonResponse({ status: 'success', message: 'Data berhasil disimpan ke Spreadsheet', result: result, timestamp: new Date().toISOString() });
    } catch(err) {
      return createJsonResponse({ status: 'error', message: err.toString() });
    }
  }

  var data = getAllDataFromSheets();
  return createJsonResponse({
    status: 'success',
    data: data,
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '';
    if (!rawData) {
      return createJsonResponse({ status: 'error', message: 'Tidak ada data terkirim' });
    }
    
    var payload = JSON.parse(rawData);
    var result = saveAllDataToSheets(payload);
    
    return createJsonResponse({
      status: 'success',
      message: 'Sinkronisasi Spreadsheet Berhasil!',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Gagal memproses data: ' + err.toString()
    });
  }
}

function createJsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#1E3A8A');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function saveAllDataToSheets(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. DATA MURID
  if (payload.students && Array.isArray(payload.students)) {
    var headersMurid = [
      'ID', 'No', 'Nama Lengkap', 'Panggilan', 'NISN', 'Rombel', 'L/P', 'Tempat Lahir', 'Tgl Lahir', 'Agama',
      'Alamat', 'Status Kelahiran', 'HP Murid', 'Media Sosial', 'Penyakit Kronis',
      'Nama Ayah', 'Pekerjaan Ayah', 'Suku Ayah', 'Hubungan Ayah',
      'Nama Ibu', 'Pekerjaan Ibu', 'Suku Ibu', 'Hubungan Ibu',
      'HP Ortu', 'HP Saudara', 'HP Tetangga',
      'TK Asal', 'SD Asal', 'SMP Asal',
      'Prestasi SD', 'Prestasi SMP', 'Ekstrakurikuler',
      'Cita-cita Profesi', 'Aspirasi Lanjutan', 'Mapel Dikuasai', 'Mapel Perlu Bimbingan', 'Catatan Perwalian',
      'Link Pasfoto Murid', 'Data JSON Lengkap', 'Tgl Update'
    ];
    var sheetMurid = getOrCreateSheet('DATA_MURID', headersMurid);
    sheetMurid.clearContents();
    sheetMurid.appendRow(headersMurid);
    var headerRange = sheetMurid.getRange(1, 1, 1, headersMurid.length);
    headerRange.setBackground('#1E3A8A');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheetMurid.setFrozenRows(1);

    var rowsMurid = [];
    for (var i = 0; i < payload.students.length; i++) {
      var s = payload.students[i];
      var goals = Array.isArray(s.careerGoals) ? s.careerGoals.filter(Boolean).join(' / ') : (s.careerGoals || '');
      var mastered = Array.isArray(s.masteredSubjects) ? s.masteredSubjects.filter(Boolean).join(', ') : '';
      var struggling = Array.isArray(s.strugglingSubjects) ? s.strugglingSubjects.filter(Boolean).join(', ') : '';
      var chronic = s.penyakitKronis || (Array.isArray(s.chronicIllnessHistory) ? s.chronicIllnessHistory.join(', ') : '');
      var tk = s.tkNama || (s.educationHistory && s.educationHistory[0] && s.educationHistory[0].level === 'TK' ? s.educationHistory[0].schoolName : '');
      var sd = s.sdNama || (s.educationHistory ? (s.educationHistory.find(function(e){ return e.level === 'SD'; }) || {}).schoolName : '') || '';
      var smp = s.smpNama || (s.educationHistory ? (s.educationHistory.find(function(e){ return e.level === 'SMP'; }) || {}).schoolName : '') || '';
      var presSMP = s.prestasiSMP || (s.achievements && s.achievements.length ? s.achievements.map(function(a){ return a.title; }).join(', ') : '');
      var ekskul = s.ekstrakurikuler || (s.extracurriculars && s.extracurriculars.length ? s.extracurriculars.map(function(e){ return e.name; }).join(', ') : '');

      rowsMurid.push([
        s.id || '',
        s.no || (i + 1),
        s.name || '',
        s.nickname || '',
        s.nisn || '',
        s.rombel || '',
        s.gender || '',
        s.birthPlace || '',
        s.birthDate || '',
        s.religion || '',
        s.address || '',
        s.statusKelahiran || (s.birthOrder ? ('Anak ke ' + s.birthOrder + ' dari ' + (s.totalSiblings || 1)) : ''),
        s.phone || '',
        s.socialMedia || '',
        chronic || '',
        s.fatherName || '',
        s.fatherJob || '',
        s.fatherEthnicity || '',
        s.fatherRelation || '',
        s.motherName || '',
        s.motherJob || '',
        s.motherEthnicity || '',
        s.motherRelation || '',
        s.parentPhone || '',
        s.siblingPhone || '',
        s.neighborPhone || '',
        tk || '',
        sd || '',
        smp || '',
        s.prestasiSD || '',
        presSMP || '',
        ekskul || '',
        goals || '',
        s.furtherStudyAspiration || '',
        mastered || '',
        struggling || '',
        s.notes || '',
        s.photoUrl || '',
        JSON.stringify(s),
        s.updatedAt || new Date().toISOString()
      ]);
    }
    if (rowsMurid.length > 0) {
      sheetMurid.getRange(2, 1, rowsMurid.length, rowsMurid[0].length).setValues(rowsMurid);
    }
  }

  // 2. KEGIATAN PEMBIASAAN
  if (payload.activities && Array.isArray(payload.activities)) {
    var headersKegiatan = [
      'ID', 'Tanggal', 'Hari', 'Waktu', 'Kategori', 'Tipe', 'Judul Kegiatan', 'Rombel', 'Lokasi', 'Partisipan', 'Jumlah Hadir', 'Status', 'Deskripsi Ringkas', 'Catatan Evaluasi / RTL', 'Pembina / PIC', 'Daftar 8 Dimensi Profil Lulusan', 'Link Foto Dokumentasi', 'Data JSON Lengkap', 'Tgl Update'
    ];
    var sheetKegiatan = getOrCreateSheet('KEGIATAN_PEMBIASAAN', headersKegiatan);
    sheetKegiatan.clearContents();
    sheetKegiatan.appendRow(headersKegiatan);
    sheetKegiatan.getRange(1, 1, 1, headersKegiatan.length).setBackground('#0D9488').setFontColor('#FFFFFF').setFontWeight('bold');
    sheetKegiatan.setFrozenRows(1);

    var rowsKegiatan = [];
    for (var a = 0; a < payload.activities.length; a++) {
      var act = payload.activities[a];
      var profilStr = Array.isArray(act.profilLulusan) ? act.profilLulusan.join(', ') : (act.profilLulusan || '');
      rowsKegiatan.push([
        act.id || '',
        act.date || '',
        act.dayName || '',
        act.time || '',
        act.category || '',
        act.type || '',
        act.title || '',
        act.rombel || 'Semua Rombel',
        act.location || '',
        act.targetParticipants || '',
        act.actualAttendanceCount || 0,
        act.status || 'Terlaksana',
        act.description || '',
        act.outcome || '',
        act.leaderOrPic || '',
        profilStr || '',
        act.photoUrl || '',
        JSON.stringify(act),
        act.updatedAt || act.createdAt || new Date().toISOString()
      ]);
    }
    if (rowsKegiatan.length > 0) {
      sheetKegiatan.getRange(2, 1, rowsKegiatan.length, rowsKegiatan[0].length).setValues(rowsKegiatan);
    }
  }

  // 3. KEHADIRAN MURID (PRESENSI BARCODE & REKAP)
  if (payload.attendances && Array.isArray(payload.attendances)) {
    var headersKehadiran = [
      'ID', 'Tanggal', 'Hari', 'Waktu Masuk', 'NISN', 'Nama Lengkap Murid', 'Rombel', 'Status Kehadiran', 'Sesi', 'Metode Presensi', 'Keterangan / Catatan', 'Data JSON Lengkap', 'Tgl Update'
    ];
    var sheetHadir = getOrCreateSheet('KEHADIRAN_MURID', headersKehadiran);
    sheetHadir.clearContents();
    sheetHadir.appendRow(headersKehadiran);
    sheetHadir.getRange(1, 1, 1, headersKehadiran.length).setBackground('#047857').setFontColor('#FFFFFF').setFontWeight('bold');
    sheetHadir.setFrozenRows(1);

    var rowsHadir = [];
    for (var h = 0; h < payload.attendances.length; h++) {
      var att = payload.attendances[h];
      rowsHadir.push([
        att.id || '',
        att.date || '',
        att.dayName || '',
        att.time || '',
        att.nisn || '',
        att.studentName || '',
        att.rombel || '',
        att.status || 'Hadir',
        att.session || 'Pembiasaan Pagi / KBM',
        att.method || 'Barcode / QR Scan',
        att.notes || '',
        JSON.stringify(att),
        att.updatedAt || att.createdAt || new Date().toISOString()
      ]);
    }
    if (rowsHadir.length > 0) {
      sheetHadir.getRange(2, 1, rowsHadir.length, rowsHadir[0].length).setValues(rowsHadir);
    }
  }

  // 4. KONSULTASI PERWALIAN
  if (payload.consultations && Array.isArray(payload.consultations)) {
    var sheetKonsul = getOrCreateSheet('KONSULTASI_PERWALIAN', [
      'ID', 'Tanggal', 'Hari', 'Nama Murid', 'Rombel', 'Permasalahan', 'Arahan Guru Wali', 'Status Tindak Lanjut', 'Data JSON Lengkap', 'Waktu Dibuat'
    ]);
    sheetKonsul.clearContents();
    sheetKonsul.appendRow([
      'ID', 'Tanggal', 'Hari', 'Nama Murid', 'Rombel', 'Permasalahan', 'Arahan Guru Wali', 'Status Tindak Lanjut', 'Data JSON Lengkap', 'Waktu Dibuat'
    ]);
    sheetKonsul.getRange(1, 1, 1, 10).setBackground('#059669').setFontColor('#FFFFFF').setFontWeight('bold');
    sheetKonsul.setFrozenRows(1);

    var rowsKonsul = [];
    for (var j = 0; j < payload.consultations.length; j++) {
      var c = payload.consultations[j];
      rowsKonsul.push([
        c.id || '',
        c.date || '',
        c.dayName || '',
        c.studentName || '',
        c.studentRombel || '',
        c.problem || '',
        c.teacherAdvice || '',
        c.followUpStatus || '',
        JSON.stringify(c),
        c.createdAt || ''
      ]);
    }
    if (rowsKonsul.length > 0) {
      sheetKonsul.getRange(2, 1, rowsKonsul.length, rowsKonsul[0].length).setValues(rowsKonsul);
    }
  }

  // 3. KOLABORASI BK & WALAS
  if (payload.collaborations && Array.isArray(payload.collaborations)) {
    var sheetCollab = getOrCreateSheet('KOLABORASI_BK_WALAS', [
      'ID', 'Tanggal', 'Hari', 'Pihak Terlibat', 'Bentuk Kolaborasi', 'Nama Murid', 'Rombel', 'Masalah Dibahas', 'Rencana RTL', 'Data JSON Lengkap', 'Waktu Dibuat'
    ]);
    sheetCollab.clearContents();
    sheetCollab.appendRow([
      'ID', 'Tanggal', 'Hari', 'Pihak Terlibat', 'Bentuk Kolaborasi', 'Nama Murid', 'Rombel', 'Masalah Dibahas', 'Rencana RTL', 'Data JSON Lengkap', 'Waktu Dibuat'
    ]);
    sheetCollab.getRange(1, 1, 1, 11).setBackground('#7C3AED').setFontColor('#FFFFFF').setFontWeight('bold');
    sheetCollab.setFrozenRows(1);

    var rowsCollab = [];
    for (var k = 0; k < payload.collaborations.length; k++) {
      var col = payload.collaborations[k];
      rowsCollab.push([
        col.id || '',
        col.date || '',
        col.dayName || '',
        (col.collaborators || []).join(', '),
        (col.forms || []).join(', '),
        col.studentName || '',
        col.studentRombel || '',
        col.problemDetails || '',
        col.followUpPlan || '',
        JSON.stringify(col),
        col.createdAt || ''
      ]);
    }
    if (rowsCollab.length > 0) {
      sheetCollab.getRange(2, 1, rowsCollab.length, rowsCollab[0].length).setValues(rowsCollab);
    }
  }

  // 4. PENANGANAN KASUS SOP
  if (payload.cases && Array.isArray(payload.cases)) {
    var sheetCases = getOrCreateSheet('PENANGANAN_KASUS_SOP', [
      'ID', 'No Kasus', 'Nama Murid', 'Rombel', 'Judul Kasus', 'Tgl Mulai', 'Tahap SOP (1-8)', 'Jalur', 'Status', 'Kunjungan Rumah', 'Eskalasi Kepsek', 'Catatan Kepsek', 'Data JSON Lengkap', 'Tgl Update'
    ]);
    sheetCases.clearContents();
    sheetCases.appendRow([
      'ID', 'No Kasus', 'Nama Murid', 'Rombel', 'Judul Kasus', 'Tgl Mulai', 'Tahap SOP (1-8)', 'Jalur', 'Status', 'Kunjungan Rumah', 'Eskalasi Kepsek', 'Catatan Kepsek', 'Data JSON Lengkap', 'Tgl Update'
    ]);
    sheetCases.getRange(1, 1, 1, 14).setBackground('#DC2626').setFontColor('#FFFFFF').setFontWeight('bold');
    sheetCases.setFrozenRows(1);

    var rowsCases = [];
    for (var m = 0; m < payload.cases.length; m++) {
      var cs = payload.cases[m];
      rowsCases.push([
        cs.id || '',
        cs.caseNumber || '',
        cs.studentName || '',
        cs.studentRombel || '',
        cs.title || '',
        cs.startDate || '',
        cs.currentStep || 1,
        cs.pathway || '-',
        cs.status || '',
        cs.hasHomeVisit ? 'Ya (' + (cs.homeVisitNotes || '') + ')' : 'Tidak',
        cs.isEscalatedToPrincipal ? 'Ya' : 'Tidak',
        cs.principalNotes || '',
        JSON.stringify(cs),
        cs.updatedAt || ''
      ]);
    }
    if (rowsCases.length > 0) {
      sheetCases.getRange(2, 1, rowsCases.length, rowsCases[0].length).setValues(rowsCases);
    }
  }

  // 5. PROFIL SEKOLAH
  if (payload.profile) {
    var sheetProfile = getOrCreateSheet('PROFIL_SEKOLAH', ['Nama Parameter', 'Nilai / Data']);
    sheetProfile.clearContents();
    sheetProfile.appendRow(['Nama Parameter', 'Nilai / Data']);
    sheetProfile.getRange(1, 1, 1, 2).setBackground('#1E293B').setFontColor('#FFFFFF').setFontWeight('bold');
    
    var prof = payload.profile;
    var rowsProfile = [
      ['Nama Sekolah', prof.name || 'SMK NEGERI 2 GORONTALO'],
      ['Alamat', prof.address || ''],
      ['Kecamatan', prof.subdistrict || ''],
      ['Kota', prof.city || ''],
      ['Provinsi', prof.province || ''],
      ['Email', prof.email || ''],
      ['Telepon', prof.phone || ''],
      ['Kode Pos', prof.postalCode || ''],
      ['Kepala Sekolah', prof.principalName || 'Drs. Jakub A GuE'],
      ['NIP Kepala Sekolah', prof.principalNip || '196706081994121002'],
      ['Guru Wali', prof.homeroomTeacherName || 'Abdul Rahman Bahsoan'],
      ['NIP Guru Wali', prof.homeroomTeacherNip || '19840715 201001 1 014'],
      ['Program Keahlian', prof.expertiseProgram || 'DKV'],
      ['Tahun Ajaran', prof.schoolYear || '2026/2027'],
      ['Semester', prof.semester || 'Ganjil'],
      ['Total Murid', String((payload.students || []).length)],
      ['Total Kegiatan Pembiasaan', String((payload.activities || []).length)],
      ['Total Konsultasi', String((payload.consultations || []).length)],
      ['Data JSON Lengkap', JSON.stringify(prof)],
      ['Data Master Lengkap (Backup)', JSON.stringify(payload)],
      ['Terakhir Disinkronkan', new Date().toISOString()]
    ];
    sheetProfile.getRange(2, 1, rowsProfile.length, 2).setValues(rowsProfile);
  }

  return {
    totalStudents: (payload.students || []).length,
    totalActivities: (payload.activities || []).length,
    totalConsultations: (payload.consultations || []).length,
    syncedAt: new Date().toISOString()
  };
}

function getAllDataFromSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {
    students: [],
    activities: [],
    attendances: [],
    consultations: [],
    collaborations: [],
    cases: [],
    profile: null,
    spreadsheetUrl: ss.getUrl()
  };

  // 1. DATA MURID
  var sheetMurid = ss.getSheetByName('DATA_MURID');
  if (sheetMurid && sheetMurid.getLastRow() > 1) {
    var valuesMurid = sheetMurid.getRange(2, 1, sheetMurid.getLastRow() - 1, sheetMurid.getLastColumn()).getValues();
    var headersMurid = sheetMurid.getRange(1, 1, 1, sheetMurid.getLastColumn()).getValues()[0];
    var photoColIdx = -1;
    for (var h = 0; h < headersMurid.length; h++) {
      var hName = String(headersMurid[h]).toLowerCase();
      if (hName.indexOf('pasfoto') !== -1 || (hName.indexOf('foto') !== -1 && hName.indexOf('murid') !== -1)) {
        photoColIdx = h;
        break;
      }
    }

    for (var i = 0; i < valuesMurid.length; i++) {
      var row = valuesMurid[i];
      var parsed = null;
      for (var colIdx = row.length - 1; colIdx >= 0; colIdx--) {
        var cell = row[colIdx];
        if (cell && typeof cell === 'string' && cell.indexOf('{') === 0 && cell.indexOf('"id"') !== -1) {
          try {
            parsed = JSON.parse(cell);
            break;
          } catch(e) {}
        }
      }

      var colPhoto = photoColIdx !== -1 && row[photoColIdx] ? String(row[photoColIdx]).trim() : '';

      if (parsed) {
        // If parsed exists, preserve photoUrl from column if present
        if (colPhoto && (!parsed.photoUrl || parsed.photoUrl.trim() === '')) {
          parsed.photoUrl = colPhoto;
        }
        result.students.push(parsed);
      } else if (row[0] || row[2]) {
        // Fallback reconstruction if JSON string is missing or corrupted
        result.students.push({
          id: String(row[0] || ('std-' + (i + 1))),
          no: Number(row[1]) || (i + 1),
          name: String(row[2] || ''),
          nickname: String(row[3] || ''),
          nisn: String(row[4] || ''),
          rombel: String(row[5] || '10-DKV-1'),
          gender: String(row[6] || 'L'),
          birthPlace: String(row[7] || ''),
          birthDate: String(row[8] || ''),
          religion: String(row[9] || 'Islam'),
          address: String(row[10] || ''),
          statusKelahiran: String(row[11] || ''),
          phone: String(row[12] || ''),
          socialMedia: String(row[13] || ''),
          penyakitKronis: String(row[14] || ''),
          fatherName: String(row[15] || ''),
          fatherJob: String(row[16] || ''),
          fatherEthnicity: String(row[17] || ''),
          fatherRelation: String(row[18] || ''),
          motherName: String(row[19] || ''),
          motherJob: String(row[20] || ''),
          motherEthnicity: String(row[21] || ''),
          motherRelation: String(row[22] || ''),
          parentPhone: String(row[23] || ''),
          siblingPhone: String(row[24] || ''),
          neighborPhone: String(row[25] || ''),
          tkNama: String(row[26] || ''),
          sdNama: String(row[27] || ''),
          smpNama: String(row[28] || ''),
          prestasiSD: String(row[29] || ''),
          prestasiSMP: String(row[30] || ''),
          ekstrakurikuler: String(row[31] || ''),
          careerGoals: row[32] ? [String(row[32])] : [],
          furtherStudyAspiration: String(row[33] || ''),
          masteredSubjects: row[34] ? String(row[34]).split(', ') : [],
          strugglingSubjects: row[35] ? String(row[35]).split(', ') : [],
          notes: String(row[36] || ''),
          photoUrl: colPhoto,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // 2. KEGIATAN PEMBIASAAN
  var sheetKegiatan = ss.getSheetByName('KEGIATAN_PEMBIASAAN');
  if (sheetKegiatan && sheetKegiatan.getLastRow() > 1) {
    var valuesKegiatan = sheetKegiatan.getRange(2, 1, sheetKegiatan.getLastRow() - 1, sheetKegiatan.getLastColumn()).getValues();
    for (var a = 0; a < valuesKegiatan.length; a++) {
      var rowK = valuesKegiatan[a];
      var parsedK = null;
      for (var colK = rowK.length - 1; colK >= 0; colK--) {
        var cellK = rowK[colK];
        if (cellK && typeof cellK === 'string' && cellK.indexOf('{') === 0 && (cellK.indexOf('"title"') !== -1 || cellK.indexOf('"id"') !== -1 || cellK.indexOf('"category"') !== -1)) {
          try {
            parsedK = JSON.parse(cellK);
            break;
          } catch(e) {}
        }
      }
      if (!parsedK && rowK[0]) {
        var rawProfil = String(rowK[15] || '');
        var hasDedicatedPhoto = String(rowK[16] || '').startsWith('http');
        var parsedProfilList = rawProfil ? rawProfil.split(',').map(function(item){ return item.trim(); }).filter(Boolean) : [];
        var actPhoto = hasDedicatedPhoto ? String(rowK[16]) : (rawProfil.startsWith('http') ? rawProfil : '');

        parsedK = {
          id: String(rowK[0] || ('act-' + (a + 1))),
          date: String(rowK[1] || ''),
          dayName: String(rowK[2] || ''),
          time: String(rowK[3] || ''),
          category: String(rowK[4] || 'Religi & Sholat Dhuha'),
          type: String(rowK[5] || 'Harian'),
          title: String(rowK[6] || 'Kegiatan'),
          rombel: String(rowK[7] || 'Semua Rombel'),
          location: String(rowK[8] || ''),
          targetParticipants: String(rowK[9] || ''),
          actualAttendanceCount: Number(rowK[10]) || 0,
          status: String(rowK[11] || 'Terlaksana'),
          description: String(rowK[12] || ''),
          outcome: String(rowK[13] || ''),
          leaderOrPic: String(rowK[14] || ''),
          profilLulusan: rawProfil.startsWith('http') ? [] : parsedProfilList,
          photoUrl: actPhoto,
          createdAt: String(rowK[18] || rowK[17] || new Date().toISOString()),
          updatedAt: String(rowK[18] || rowK[17] || new Date().toISOString())
        };
      }
      if (parsedK) {
        result.activities.push(parsedK);
      }
    }
  }

  // 3. KEHADIRAN MURID
  var sheetHadir = ss.getSheetByName('KEHADIRAN_MURID');
  if (sheetHadir && sheetHadir.getLastRow() > 1) {
    var valuesHadir = sheetHadir.getRange(2, 1, sheetHadir.getLastRow() - 1, sheetHadir.getLastColumn()).getValues();
    for (var h = 0; h < valuesHadir.length; h++) {
      var rowH = valuesHadir[h];
      var parsedH = null;
      for (var colH = rowH.length - 1; colH >= 0; colH--) {
        var cellH = rowH[colH];
        if (cellH && typeof cellH === 'string' && cellH.indexOf('{') === 0 && (cellH.indexOf('"studentId"') !== -1 || cellH.indexOf('"nisn"') !== -1)) {
          try {
            parsedH = JSON.parse(cellH);
            break;
          } catch(e) {}
        }
      }
      if (!parsedH && rowH[0]) {
        parsedH = {
          id: String(rowH[0] || ('att-' + (h + 1))),
          date: String(rowH[1] || ''),
          dayName: String(rowH[2] || ''),
          time: String(rowH[3] || ''),
          nisn: String(rowH[4] || ''),
          studentName: String(rowH[5] || ''),
          rombel: String(rowH[6] || '10-DKV-1'),
          status: String(rowH[7] || 'Hadir'),
          session: String(rowH[8] || 'Pembiasaan Pagi / KBM'),
          method: String(rowH[9] || 'Barcode / QR Scan'),
          notes: String(rowH[10] || ''),
          createdAt: String(rowH[12] || new Date().toISOString()),
          updatedAt: String(rowH[12] || new Date().toISOString())
        };
      }
      if (parsedH) {
        result.attendances.push(parsedH);
      }
    }
  }

  // 4. KONSULTASI
  var sheetKonsul = ss.getSheetByName('KONSULTASI_PERWALIAN');
  if (sheetKonsul && sheetKonsul.getLastRow() > 1) {
    var valuesKonsul = sheetKonsul.getRange(2, 1, sheetKonsul.getLastRow() - 1, sheetKonsul.getLastColumn()).getValues();
    for (var j = 0; j < valuesKonsul.length; j++) {
      var rowC = valuesKonsul[j];
      var parsedC = null;
      for (var colC = rowC.length - 1; colC >= 0; colC--) {
        var cellC = rowC[colC];
        if (cellC && typeof cellC === 'string' && cellC.indexOf('{') === 0 && cellC.indexOf('"id"') !== -1) {
          try {
            parsedC = JSON.parse(cellC);
            break;
          } catch(e) {}
        }
      }
      if (parsedC) {
        result.consultations.push(parsedC);
      }
    }
  }

  // 4. KOLABORASI
  var sheetCollab = ss.getSheetByName('KOLABORASI_BK_WALAS');
  if (sheetCollab && sheetCollab.getLastRow() > 1) {
    var valuesCollab = sheetCollab.getRange(2, 1, sheetCollab.getLastRow() - 1, sheetCollab.getLastColumn()).getValues();
    for (var k = 0; k < valuesCollab.length; k++) {
      var rowB = valuesCollab[k];
      var parsedB = null;
      for (var colB = rowB.length - 1; colB >= 0; colB--) {
        var cellB = rowB[colB];
        if (cellB && typeof cellB === 'string' && cellB.indexOf('{') === 0 && cellB.indexOf('"id"') !== -1) {
          try {
            parsedB = JSON.parse(cellB);
            break;
          } catch(e) {}
        }
      }
      if (parsedB) {
        result.collaborations.push(parsedB);
      }
    }
  }

  // 5. KASUS SOP
  var sheetCases = ss.getSheetByName('PENANGANAN_KASUS_SOP');
  if (sheetCases && sheetCases.getLastRow() > 1) {
    var valuesCases = sheetCases.getRange(2, 1, sheetCases.getLastRow() - 1, sheetCases.getLastColumn()).getValues();
    for (var m = 0; m < valuesCases.length; m++) {
      var rowS = valuesCases[m];
      var parsedS = null;
      for (var colS = rowS.length - 1; colS >= 0; colS--) {
        var cellS = rowS[colS];
        if (cellS && typeof cellS === 'string' && cellS.indexOf('{') === 0 && cellS.indexOf('"id"') !== -1) {
          try {
            parsedS = JSON.parse(cellS);
            break;
          } catch(e) {}
        }
      }
      if (parsedS) {
        result.cases.push(parsedS);
      }
    }
  }

  // 6. PROFIL SEKOLAH & MASTER BACKUP RESTORE
  var sheetProfile = ss.getSheetByName('PROFIL_SEKOLAH');
  if (sheetProfile && sheetProfile.getLastRow() > 1) {
    var valuesProf = sheetProfile.getRange(2, 1, sheetProfile.getLastRow() - 1, sheetProfile.getLastColumn()).getValues();
    var backupStore = null;
    for (var p = 0; p < valuesProf.length; p++) {
      if (valuesProf[p][0] === 'Data JSON Lengkap') {
        try { result.profile = JSON.parse(valuesProf[p][1]); } catch(e) {}
      }
      if (valuesProf[p][0] === 'Data Master Lengkap (Backup)') {
        try { backupStore = JSON.parse(valuesProf[p][1]); } catch(e) {}
      }
    }
    // Master backup restore if individual sheets were missing
    if (result.activities.length === 0 && backupStore && backupStore.activities && backupStore.activities.length > 0) {
      result.activities = backupStore.activities;
    }
    if (result.students.length === 0 && backupStore && backupStore.students && backupStore.students.length > 0) {
      result.students = backupStore.students;
    }
    if (result.consultations.length === 0 && backupStore && backupStore.consultations && backupStore.consultations.length > 0) {
      result.consultations = backupStore.consultations;
    }
    if (result.collaborations.length === 0 && backupStore && backupStore.collaborations && backupStore.collaborations.length > 0) {
      result.collaborations = backupStore.collaborations;
    }
    if (result.cases.length === 0 && backupStore && backupStore.cases && backupStore.cases.length > 0) {
      result.cases = backupStore.cases;
    }
  }

  return result;
}
`;

export const SheetsSyncService = {
  getConfig: (): GoogleSheetsConfig => {
    try {
      const data = localStorage.getItem(SHEETS_CONFIG_KEY);
      let parsed = data ? JSON.parse(data) : {};

      // Ensure active Google Apps Script Web App URL is set to the updated link
      parsed.webAppUrl = DEFAULT_SHEETS_WEB_APP_URL;
      parsed.autoSyncEnabled = true;

      if (!parsed.spreadsheetUrl) {
        parsed.spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1_Q7LKCY5xJROp3Ux2jueO8dSElyHEtK7BYW3aSYh8VQ/edit';
      }

      if (!parsed.syncIntervalSeconds || parsed.syncIntervalSeconds === 25) {
        parsed.syncIntervalSeconds = 120; // 2 Menit
      }

      const merged = { ...DEFAULT_SHEETS_CONFIG, ...parsed };
      try {
        localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(merged));
      } catch {}

      return merged;
    } catch {
      return DEFAULT_SHEETS_CONFIG;
    }
  },

  saveConfig: (config: GoogleSheetsConfig): void => {
    try {
      localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save Google Sheets sync config', e);
    }
  },

  isConfigured: (): boolean => {
    const cfg = SheetsSyncService.getConfig();
    return Boolean(
      cfg.webAppUrl &&
        cfg.webAppUrl.trim().startsWith('https://script.google.com/macros/s/') &&
        !cfg.webAppUrl.includes('AKfycbz8odQurm_YBWJVhMglT8z4NH9d1OO9odFL37laRn9l8mWTn1BpAGiWx_ias0X5606YtQ')
    );
  },

  getShareableSyncUrl: (baseUrl?: string): string => {
    const cfg = SheetsSyncService.getConfig();
    const currentBase = baseUrl || window.location.origin + window.location.pathname;
    if (!cfg.webAppUrl) return currentBase;
    const cleanBase = currentBase.split('?')[0].split('#')[0];
    return `${cleanBase}?syncUrl=${encodeURIComponent(cfg.webAppUrl.trim())}`;
  },

  // Export all application data as a downloadable JSON backup file
  exportBackupFile: (): void => {
    const data = StorageService.getAllData();
    const payload: FullSyncPayload = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `siWali-Backup-Lengkap-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import backup data from a JSON file object
  importBackupFile: async (file: File): Promise<{ success: boolean; message: string }> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || (typeof parsed !== 'object')) {
        return { success: false, message: 'Format file cadangan tidak valid.' };
      }
      StorageService.importAllData(parsed);
      return { success: true, message: 'Data cadangan berhasil dipulihkan!' };
    } catch (err: any) {
      return { success: false, message: `Gagal membaca file: ${err.message}` };
    }
  },

  // Pull latest data from Google Sheets Web App
  pullFromSheets: async (webAppUrl?: string): Promise<{ success: boolean; data?: FullSyncPayload; message: string }> => {
    const url = webAppUrl || SheetsSyncService.getConfig().webAppUrl;
    if (!url || !url.trim().startsWith('https://script.google.com/macros/s/')) {
      return { success: false, message: 'URL Google Apps Script Web App belum diatur.' };
    }

    // 1. Primary Attempt: Server-side proxy (completely bypasses browser CORS & iframe redirect limitations)
    try {
      const proxyUrl = `/api/sheets-sync?action=fetch_all&url=${encodeURIComponent(url.trim())}&t=${Date.now()}`;
      const proxyRes = await fetch(proxyUrl, {
        headers: { Accept: 'application/json' },
      });
      if (proxyRes.ok) {
        const proxyJson = await proxyRes.json();
        if (proxyJson.status === 'success' && proxyJson.data) {
          const remoteData = proxyJson.data;
          StorageService.importAllData(remoteData);

          const currentCfg = SheetsSyncService.getConfig();
          SheetsSyncService.saveConfig({
            ...currentCfg,
            lastSyncTime: new Date().toISOString(),
            spreadsheetUrl: remoteData.spreadsheetUrl || currentCfg.spreadsheetUrl,
          });

          return {
            success: true,
            data: remoteData,
            message: 'Data berhasil disinkronkan dari Google Spreadsheet.',
          };
        } else if (proxyJson.status === 'error' || proxyJson.status === 'unconfigured') {
          return {
            success: false,
            message: proxyJson.message || 'Gagal menyinkronkan data dengan Google Apps Script.',
          };
        }
      }
    } catch {
      // Fallback to direct fetch
    }

    // 2. Direct browser fetch fallback
    try {
      const response = await fetch(`${url.trim()}?action=fetch_all&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const text = await response.text();
      const trimmed = text.trim();

      if (response.status === 404 || trimmed.includes('404 Not Found')) {
        return {
          success: false,
          message: 'Deployment Web App Google Apps Script tidak ditemukan (HTTP 404).',
        };
      }

      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        return {
          success: false,
          message: 'Google Apps Script merespon dengan halaman HTML. Pastikan akses diatur ke "Siapa saja (Anyone)".',
        };
      }

      const result = JSON.parse(trimmed);
      if (result.status === 'success' && result.data) {
        const remoteData = result.data;
        StorageService.importAllData(remoteData);

        const currentCfg = SheetsSyncService.getConfig();
        SheetsSyncService.saveConfig({
          ...currentCfg,
          lastSyncTime: new Date().toISOString(),
          spreadsheetUrl: remoteData.spreadsheetUrl || currentCfg.spreadsheetUrl,
        });

        return {
          success: true,
          data: remoteData,
          message: 'Data berhasil disinkronkan dari Google Spreadsheet.',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Gagal membaca data dari Google Spreadsheet.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Koneksi gagal: ${err.message || 'Periksa URL Web App dan hak akses "Siapa saja"'}.`,
      };
    }
  },

  // Push local data to Google Sheets Web App
  pushToSheets: async (
    webAppUrl?: string,
    customPayload?: FullSyncPayload
  ): Promise<{ success: boolean; message: string }> => {
    const url = webAppUrl || SheetsSyncService.getConfig().webAppUrl;
    if (!url || !url.trim().startsWith('https://script.google.com/macros/s/')) {
      return { success: false, message: 'URL Google Apps Script Web App belum diatur.' };
    }

    const payload: FullSyncPayload = customPayload || {
      students: StorageService.getStudents(),
      activities: StorageService.getActivities(),
      attendances: StorageService.getAttendances(),
      consultations: StorageService.getConsultations(),
      collaborations: StorageService.getCollaborations(),
      cases: StorageService.getCases(),
      profile: StorageService.getProfile(),
      lastUpdated: new Date().toISOString(),
    };

    // 1. Primary Attempt: Server-side proxy (completely bypasses browser CORS & iframe redirect limitations)
    try {
      const proxyResponse = await fetch('/api/sheets-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webAppUrl: url.trim(),
          payload,
        }),
      });

      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.json();
        if (proxyResult.status === 'success') {
          const currentCfg = SheetsSyncService.getConfig();
          SheetsSyncService.saveConfig({
            ...currentCfg,
            lastSyncTime: new Date().toISOString(),
          });
          return { success: true, message: 'Data berhasil dikirim & disimpan di Google Spreadsheet!' };
        } else if (proxyResult.status === 'error' || proxyResult.status === 'unconfigured') {
          return { success: false, message: proxyResult.message || 'Gagal menyimpan ke Google Spreadsheet.' };
        }
      }
    } catch {
      // Continue to direct browser fetch fallback
    }

    // 2. Direct browser fetch fallback
    try {
      const response = await fetch(url.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const trimmed = text.trim();

      if (response.status === 404 || trimmed.includes('404 Not Found')) {
        return { success: false, message: 'Deployment Web App Google Apps Script tidak ditemukan (HTTP 404).' };
      }

      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        return {
          success: false,
          message: 'Google Apps Script merespon dengan halaman HTML. Pastikan akses diatur ke "Siapa saja (Anyone)".',
        };
      }

      const result = JSON.parse(trimmed);
      if (result.status === 'success') {
        const currentCfg = SheetsSyncService.getConfig();
        SheetsSyncService.saveConfig({
          ...currentCfg,
          lastSyncTime: new Date().toISOString(),
        });
        return { success: true, message: 'Data berhasil dikirim & disimpan di Google Spreadsheet!' };
      } else {
        return { success: false, message: result.message || 'Spreadsheet menolak data' };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal mengirim data ke Google Sheets: ${err.message || 'CORS / Jaringan'}.`,
      };
    }
  },

  // Immediate Student Save & Sync to Spreadsheet
  syncStudentImmediate: async (
    student: Student
  ): Promise<{ success: boolean; message: string }> => {
    StorageService.saveStudent(student);
    if (!SheetsSyncService.isConfigured()) {
      return { success: true, message: 'Data siswa & pasfoto tersimpan di penyimpanan lokal.' };
    }
    return SheetsSyncService.pushToSheets();
  },

  // Immediate Student Delete & Sync to Spreadsheet
  deleteStudentImmediate: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    StorageService.deleteStudent(id);
    if (!SheetsSyncService.isConfigured()) {
      return { success: true, message: 'Data siswa telah dihapus dari penyimpanan lokal.' };
    }
    return SheetsSyncService.pushToSheets();
  },

  // Immediate Activity Save & Sync to Spreadsheet
  syncActivityImmediate: async (
    activity: ActivityLog
  ): Promise<{ success: boolean; message: string }> => {
    StorageService.saveActivity(activity);
    if (!SheetsSyncService.isConfigured()) {
      return { success: true, message: 'Data kegiatan tersimpan di penyimpanan lokal.' };
    }
    return SheetsSyncService.pushToSheets();
  },

  // Immediate Activity Delete & Sync to Spreadsheet
  deleteActivityImmediate: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    StorageService.deleteActivity(id);
    if (!SheetsSyncService.isConfigured()) {
      return { success: true, message: 'Kegiatan telah dihapus dari penyimpanan lokal.' };
    }
    return SheetsSyncService.pushToSheets();
  },

  // Real-time synchronization for scanned attendance
  syncAttendanceRecord: async (
    record: AttendanceRecord
  ): Promise<{ success: boolean; message: string }> => {
    // If Google Sheets is configured, trigger pushToSheets automatically
    if (SheetsSyncService.isConfigured()) {
      try {
        const res = await SheetsSyncService.pushToSheets();
        return res;
      } catch (e: any) {
        return { success: false, message: `Gagal sinkron ke Sheets: ${e.message}` };
      }
    }
    return { success: true, message: 'Data tersimpan di penyimpanan lokal.' };
  },

  // Test connection to Google Apps Script Web App
  testConnection: async (webAppUrl: string): Promise<{ success: boolean; message: string; data?: any }> => {
    if (!webAppUrl || !webAppUrl.trim().startsWith('https://script.google.com/macros/s/')) {
      return { success: false, message: 'URL harus diawali dengan https://script.google.com/macros/s/.../exec' };
    }

    // Try server proxy first
    try {
      const proxyUrl = `/api/sheets-sync?action=fetch_all&url=${encodeURIComponent(webAppUrl.trim())}&t=${Date.now()}`;
      const proxyRes = await fetch(proxyUrl, { headers: { Accept: 'application/json' } });
      if (proxyRes.ok) {
        const proxyJson = await proxyRes.json();
        if (proxyJson.status === 'success') {
          return {
            success: true,
            message: 'Koneksi ke Google Spreadsheet Berhasil Terhubung!',
            data: proxyJson.data,
          };
        }
        return {
          success: false,
          message: proxyJson.message || 'Gagal terhubung ke Google Apps Script.',
        };
      }
    } catch {
      // Fallback to direct fetch
    }

    try {
      const response = await fetch(`${webAppUrl.trim()}?action=fetch_all&t=${Date.now()}`);
      const text = await response.text();
      const trimmed = text.trim();

      if (response.status === 404 || trimmed.includes('404 Not Found')) {
        return {
          success: false,
          message: 'Deployment Web App Google Apps Script tidak ditemukan (HTTP 404).',
        };
      }

      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        return {
          success: false,
          message: 'Web App merespon dengan halaman web/HTML. Pastikan akses diatur ke "Siapa saja (Anyone)".',
        };
      }

      const data = JSON.parse(trimmed);
      if (data.status === 'success') {
        return {
          success: true,
          message: 'Koneksi ke Google Spreadsheet Berhasil Terhubung!',
          data: data.data,
        };
      }
      return { success: false, message: data.message || 'Respon dari spreadsheet tidak valid.' };
    } catch (e: any) {
      return {
        success: false,
        message: `Gagal terhubung ke Google Apps Script: ${e.message}. Pastikan deployment diatur ke "Siapa saja (Anyone)".`,
      };
    }
  },
};
