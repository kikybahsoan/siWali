import { GoogleSheetsConfig, FullSyncPayload, Student, Consultation, Collaboration, StudentCase, SchoolProfile } from '../types';
import { StorageService } from './storage';

const SHEETS_CONFIG_KEY = 'siwali_sheets_sync_config_v1';

export const DEFAULT_SHEETS_CONFIG: GoogleSheetsConfig = {
  webAppUrl: '',
  spreadsheetUrl: '',
  lastSyncTime: '',
  autoSyncEnabled: true,
  syncIntervalSeconds: 25,
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
      'Data JSON Lengkap', 'Tgl Update'
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
        JSON.stringify(s),
        s.updatedAt || new Date().toISOString()
      ]);
    }
    if (rowsMurid.length > 0) {
      sheetMurid.getRange(2, 1, rowsMurid.length, rowsMurid[0].length).setValues(rowsMurid);
    }
  }

  // 2. KONSULTASI PERWALIAN
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
      ['Data JSON Lengkap', JSON.stringify(prof)],
      ['Terakhir Disinkronkan', new Date().toISOString()]
    ];
    sheetProfile.getRange(2, 1, rowsProfile.length, 2).setValues(rowsProfile);
  }

  return { totalStudents: (payload.students || []).length, syncedAt: new Date().toISOString() };
}

function getAllDataFromSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {
    students: [],
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
    for (var i = 0; i < valuesMurid.length; i++) {
      var row = valuesMurid[i];
      var parsed = null;
      // Search from the end for JSON payload column
      for (var colIdx = row.length - 1; colIdx >= 0; colIdx--) {
        var cell = row[colIdx];
        if (cell && typeof cell === 'string' && cell.indexOf('{') === 0 && cell.indexOf('"id"') !== -1) {
          try {
            parsed = JSON.parse(cell);
            break;
          } catch(e) {}
        }
      }
      if (parsed) {
        result.students.push(parsed);
      }
    }
  }

  // 2. KONSULTASI
  var sheetKonsul = ss.getSheetByName('KONSULTASI_PERWALIAN');
  if (sheetKonsul && sheetKonsul.getLastRow() > 1) {
    var valuesKonsul = sheetKonsul.getRange(2, 1, sheetKonsul.getLastRow() - 1, sheetKonsul.getLastColumn()).getValues();
    for (var j = 0; j < valuesKonsul.length; j++) {
      var jsonKonsul = valuesKonsul[j][8]; // Col 9 (Index 8)
      if (jsonKonsul && typeof jsonKonsul === 'string' && jsonKonsul.indexOf('{') === 0) {
        try { result.consultations.push(JSON.parse(jsonKonsul)); } catch(e) {}
      }
    }
  }

  // 3. KOLABORASI
  var sheetCollab = ss.getSheetByName('KOLABORASI_BK_WALAS');
  if (sheetCollab && sheetCollab.getLastRow() > 1) {
    var valuesCollab = sheetCollab.getRange(2, 1, sheetCollab.getLastRow() - 1, sheetCollab.getLastColumn()).getValues();
    for (var k = 0; k < valuesCollab.length; k++) {
      var jsonCollab = valuesCollab[k][9]; // Col 10 (Index 9)
      if (jsonCollab && typeof jsonCollab === 'string' && jsonCollab.indexOf('{') === 0) {
        try { result.collaborations.push(JSON.parse(jsonCollab)); } catch(e) {}
      }
    }
  }

  // 4. KASUS SOP
  var sheetCases = ss.getSheetByName('PENANGANAN_KASUS_SOP');
  if (sheetCases && sheetCases.getLastRow() > 1) {
    var valuesCases = sheetCases.getRange(2, 1, sheetCases.getLastRow() - 1, sheetCases.getLastColumn()).getValues();
    for (var m = 0; m < valuesCases.length; m++) {
      var jsonCases = valuesCases[m][12]; // Col 13 (Index 12)
      if (jsonCases && typeof jsonCases === 'string' && jsonCases.indexOf('{') === 0) {
        try { result.cases.push(JSON.parse(jsonCases)); } catch(e) {}
      }
    }
  }

  // 5. PROFIL SEKOLAH
  var sheetProfile = ss.getSheetByName('PROFIL_SEKOLAH');
  if (sheetProfile && sheetProfile.getLastRow() > 1) {
    var valuesProf = sheetProfile.getRange(2, 1, sheetProfile.getLastRow() - 1, 2).getValues();
    for (var p = 0; p < valuesProf.length; p++) {
      if (valuesProf[p][0] === 'Data JSON Lengkap') {
        try { result.profile = JSON.parse(valuesProf[p][1]); } catch(e) {}
      }
    }
  }

  return result;
}
`;

export const SheetsSyncService = {
  getConfig: (): GoogleSheetsConfig => {
    try {
      const data = localStorage.getItem(SHEETS_CONFIG_KEY);
      if (!data) return DEFAULT_SHEETS_CONFIG;
      return { ...DEFAULT_SHEETS_CONFIG, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SHEETS_CONFIG;
    }
  },

  saveConfig: (config: GoogleSheetsConfig): void => {
    try {
      localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save Google Sheets sync config', e);
    }
  },

  isConfigured: (): boolean => {
    const cfg = SheetsSyncService.getConfig();
    return Boolean(cfg.webAppUrl && cfg.webAppUrl.trim().startsWith('https://script.google.com/'));
  },

  // Pull latest data from Google Sheets Web App
  pullFromSheets: async (webAppUrl?: string): Promise<{ success: boolean; data?: FullSyncPayload; message: string }> => {
    const url = webAppUrl || SheetsSyncService.getConfig().webAppUrl;
    if (!url || !url.trim().startsWith('https://script.google.com/')) {
      return { success: false, message: 'URL Google Apps Script Web App belum diatur.' };
    }

    try {
      const response = await fetch(`${url.trim()}?action=fetch_all&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success' && result.data) {
        const remoteData = result.data;
        // Import into local storage
        if (remoteData.students && remoteData.students.length > 0) {
          StorageService.importAllData(remoteData);
        }
        
        // Update last sync time and spreadsheet URL if available
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
    if (!url || !url.trim().startsWith('https://script.google.com/')) {
      return { success: false, message: 'URL Google Apps Script Web App belum diatur.' };
    }

    const payload: FullSyncPayload = customPayload || {
      students: StorageService.getStudents(),
      activities: StorageService.getActivities(),
      consultations: StorageService.getConsultations(),
      collaborations: StorageService.getCollaborations(),
      cases: StorageService.getCases(),
      profile: StorageService.getProfile(),
      lastUpdated: new Date().toISOString(),
    };

    try {
      // Send as POST payload
      const response = await fetch(url.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
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
      // Fallback: If POST has CORS redirect issues in specific browser configs, try GET with payload chunk
      try {
        const jsonStr = encodeURIComponent(JSON.stringify(payload));
        // If within URI length limits
        if (jsonStr.length < 4000) {
          const fallbackRes = await fetch(`${url.trim()}?action=push_all&payload=${jsonStr}&t=${Date.now()}`);
          const fallbackJson = await fallbackRes.json();
          if (fallbackJson.status === 'success') {
            const currentCfg = SheetsSyncService.getConfig();
            SheetsSyncService.saveConfig({
              ...currentCfg,
              lastSyncTime: new Date().toISOString(),
            });
            return { success: true, message: 'Data berhasil disimpan ke Google Spreadsheet (via GET fallback).' };
          }
        }
      } catch (e) {
        // ignore fallback error
      }

      return {
        success: false,
        message: `Gagal mengirim data ke Google Sheets: ${err.message || 'CORS / Jaringan'}.`,
      };
    }
  },

  // Test connection to Google Apps Script Web App
  testConnection: async (webAppUrl: string): Promise<{ success: boolean; message: string; data?: any }> => {
    if (!webAppUrl || !webAppUrl.trim().startsWith('https://script.google.com/')) {
      return { success: false, message: 'URL harus diawali dengan https://script.google.com/macros/s/.../exec' };
    }

    try {
      const response = await fetch(`${webAppUrl.trim()}?action=fetch_all&t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
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
