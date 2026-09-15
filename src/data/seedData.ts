import { Student, Consultation, Collaboration, StudentCase, SchoolProfile, ActivityLog } from "../types";

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  name: "SMK NEGERI 2 GORONTALO",
  address: "Jl. Achmad Nadjamuddin, Kel. Limba U Dua, Kec. Kota Selatan",
  subdistrict: "Kota Selatan",
  city: "Kota Gorontalo",
  province: "Provinsi Gorontalo",
  email: "smkngorontalo.@gmail.com",
  phone: "(0435) 822354",
  postalCode: "96115",
  principalName: "Drs. Jakub A GuE",
  principalNip: "196706081994121002",
  homeroomTeacherName: "Abdul Rahman Bahsoan",
  homeroomTeacherNip: "19840715 201001 1 014",
  expertiseProgram: "DKV (Desain Komunikasi Visual)",
  schoolYear: "2026/2027",
  semester: "Ganjil",
};

export const INITIAL_STUDENTS: Student[] = [
  {
    "id": "std-1",
    "no": 1,
    "name": "Dani Lasantu",
    "nickname": "DANI",
    "rombel": "10-DKV-1",
    "gender": "L",
    "nisn": "0116441651",
    "birthPlace": "Gorontalo",
    "birthDate": "06/03/2011",
    "religion": "Islam",
    "address": "leato selatan",
    "addressDetail": {
      "rtRw": "002/001",
      "kelurahan": "Limba U Dua",
      "kecamatan": "Kota Selatan",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "081527619488",
    "socialMedia": "ig:teedani",
    "birthOrder": 1,
    "totalSiblings": 3,
    "chronicIllnessHistory": [],
    "fatherName": "Sumarton djafar",
    "fatherJob": "polisi hutan",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 2.500.000 - Rp 4.000.000",
    "motherName": "Ratna Ningsih K. Igiasi",
    "motherJob": "ibu rumah tangga",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "-",
    "parentPhone": "081527619488",
    "siblingPhone": "085240112233",
    "neighborPhone": "081340998877",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "TK NEGRI PEMBINA",
        "entryYear": "2015",
        "gradYear": "2017",
        "duration": ""
      },
      {
        "level": "SD",
        "schoolName": "SDN 46 DUMBO RAYA",
        "entryYear": "2017",
        "gradYear": "",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMPN9 KOTA GORONTALO",
        "entryYear": "2023",
        "gradYear": "2026",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-1",
        "title": "Juara 2 Lomba Menggambar Poster FLS2N SMP",
        "category": "Non-Akademik",
        "level": "Kota",
        "year": "2025"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-0-1788152222254",
        "name": "Desain Grafis & Multimedia Club"
      },
      {
        "id": "ex-1-1788152222255",
        "name": "PMR (Palang Merah Remaja)"
      }
    ],
    "careerGoals": [
      "GURU PJOK",
      "BASARNAS"
    ],
    "furtherStudyAspiration": "S1 Desain Komunikasi Visual (DKV) / Seni Rupa",
    "masteredSubjects": [
      "Dasar Desain Grafis",
      "Seni Budaya",
      "Bahasa Inggris"
    ],
    "strugglingSubjects": [
      "Matematika",
      "Fisika Terapan",
      "Informatika"
    ],
    "notes": "Hambatan Finansial: tidak ada hambatan",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.583Z",
    "tkNama": "TK NEGRI PEMBINA",
    "tkTahunMasuk": "2015",
    "tkTahunKeluar": "2017",
    "tkLamaBelajar": "1 Tahun",
    "sdNama": "SDN 46 DUMBO RAYA",
    "sdTahunMasuk": "2017",
    "sdTahunKeluar": "2023",
    "sdLamaBelajar": "6 Tahun",
    "smpNama": "SMPN9 KOTA GORONTALO",
    "smpTahunMasuk": "2023",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Desain Grafis & Multimedia Club, PMR (Palang Merah Remaja)",
    "prestasiSMP": "JUARA 3 MINSOC antar sekolah",
    "statusKelahiran": "4,dari 4 bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1oKHD6avcht_1LWSaZdRmzE3MrSyLdh1a/view?usp=drive_link",
    "tempatTanggalLahir": "06/03/2011"
  },
  {
    "id": "std-2",
    "no": 2,
    "name": "Idris M. Musa",
    "nickname": "dafa",
    "rombel": "10-DKV-1",
    "gender": "L",
    "nisn": "0102526339",
    "birthPlace": "Leato selatan",
    "birthDate": "07-10-2010",
    "religion": "Islam",
    "address": "tamboo",
    "addressDetail": {
      "rtRw": "001/002",
      "kelurahan": "Limba B",
      "kecamatan": "Kota Selatan",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "82296885797",
    "socialMedia": "raffa_musa",
    "birthOrder": 2,
    "totalSiblings": 2,
    "chronicIllnessHistory": [],
    "fatherName": "Mohammad musa",
    "fatherJob": "kuli&nelayan",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "kandung",
    "fatherIncome": "Rp 3.000.000",
    "motherName": "Sry Wahyuni Amlain",
    "motherJob": "waiters",
    "motherEthnicity": "Saluan",
    "motherRelation": "Kandung",
    "motherIncome": "Rp 1.500.000",
    "parentPhone": "62 823-4380-9260",
    "siblingPhone": "62 815-2359-948",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SDN 54 Dumbo Raya",
        "entryYear": "",
        "gradYear": "2022",
        "duration": "6 tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMP 9 kota Gorontalo",
        "entryYear": "2022",
        "gradYear": "2026",
        "duration": "3 tahun"
      }
    ],
    "achievements": [],
    "extracurriculars": [
      {
        "id": "ex-0-1789008181534",
        "name": "Fotografi & Videografi"
      }
    ],
    "careerGoals": [
      "pemain d Fc Barcelona dan menjadi tentara"
    ],
    "furtherStudyAspiration": "D4 Animasi / Multimedia",
    "masteredSubjects": [
      "penjas"
    ],
    "strugglingSubjects": [
      "Matematika",
      "Bahasa Inggris"
    ],
    "notes": "Hobi: main bola",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.584Z",
    "sdNama": "SDN 54 Dumbo Raya",
    "sdTahunMasuk": "2017",
    "sdTahunKeluar": "2022",
    "sdLamaBelajar": "6 tahun",
    "smpNama": "SMP 9 kota Gorontalo",
    "smpTahunMasuk": "2022",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 tahun",
    "ekstrakurikuler": "Futsal",
    "statusKelahiran": "anak ke 2",
    "photoUrl": "https://drive.google.com/file/d/1-iTDWJA8CKWlE4lRcQZKYQW9NqxjVeVx/view?usp=drive_link",
    "tempatTanggalLahir": "Leato selatan",
    "penyakitKronis": "pusing kunang\"",
    "tkLamaBelajar": "2 tahun"
  },
  {
    "id": "std-3",
    "no": 3,
    "name": "Karsum Kanoli",
    "nickname": "Cicii",
    "rombel": "10-DKV-1",
    "gender": "P",
    "nisn": "0115048618",
    "birthPlace": "Botubarani",
    "birthDate": "10-03-2011",
    "religion": "Islam",
    "address": "Botubarani",
    "addressDetail": {
      "rtRw": "003/001",
      "kelurahan": "Tenda",
      "kecamatan": "Hulonthalangi",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "085343608186",
    "socialMedia": "ciciikanoli",
    "birthOrder": 3,
    "totalSiblings": 4,
    "chronicIllnessHistory": [],
    "fatherName": "Kadir kanoli",
    "fatherJob": "Nelayan",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 1.800.000",
    "motherName": "Saida Abas",
    "motherJob": "Ibu rumah tangga",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "-",
    "parentPhone": "082290445566",
    "siblingPhone": "",
    "neighborPhone": "085340112299",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "TK MEKAR WANGI",
        "entryYear": "2015",
        "gradYear": "",
        "duration": ""
      },
      {
        "level": "SD",
        "schoolName": "SD N 2 KABLA BONE",
        "entryYear": "2017",
        "gradYear": "2023",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMP N3 SATAP KABILA BONE",
        "entryYear": "2023",
        "gradYear": "2026",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-2",
        "title": "Juara 3 Cerdas Cermat PAI Tingkat SMP",
        "category": "Akademik",
        "level": "Kecamatan",
        "year": "2024"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-0-1789009403291",
        "name": "Rohis / Remaja Masjid"
      },
      {
        "id": "ex-1-1789009403291",
        "name": "Desain Kaligrafi Digital"
      }
    ],
    "careerGoals": [
      "Perawa"
    ],
    "furtherStudyAspiration": "S1 Pendidikan Seni Rupa / Desain Grafis",
    "masteredSubjects": [
      "penjas",
      "Bk",
      "Agama"
    ],
    "strugglingSubjects": [
      "Matematika Kejuruan",
      "Fisika"
    ],
    "notes": "Hambatan Finansial: tidak ada hambatan",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.584Z",
    "sdNama": "SD N 2 KABLA BONE",
    "sdTahunMasuk": "2017",
    "sdTahunKeluar": "2023",
    "sdLamaBelajar": "6 Tahun",
    "smpNama": "SMP N3 SATAP KABILA BONE",
    "smpTahunMasuk": "2023",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Rohis / Remaja Masjid, Desain Kaligrafi Digital",
    "prestasiSMP": "Juara 3 Cerdas Cermat PAI Tingkat SMP (2024)",
    "statusKelahiran": "Anak ke 6 dari 6 bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1k5xs8MrashHR-6j9aPafoxBSxgOLJ50W/view?usp=drive_link",
    "tempatTanggalLahir": "Botubarani, 10-03-2011",
    "penyakitKronis": "a. Asam lambung",
    "tkNama": "TK MEKAR WANGI",
    "tkTahunMasuk": "2015"
  },
  {
    "id": "std-4",
    "no": 4,
    "name": "Moh. Juan Elfarazy Djafar",
    "nickname": "Juan",
    "rombel": "10-DKV-1",
    "gender": "L",
    "nisn": "0111865175",
    "birthPlace": "Gorontalo",
    "birthDate": "27-11-2011",
    "religion": "Islam",
    "address": "Yos Sudarso",
    "addressDetail": {
      "rtRw": "002/003",
      "kelurahan": "Biawao",
      "kecamatan": "Kota Selatan",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "081240477266",
    "socialMedia": "@juan.elfarazy",
    "birthOrder": 1,
    "totalSiblings": 2,
    "chronicIllnessHistory": [
      "Asma Ringan"
    ],
    "fatherName": "Zulkifli Djafar",
    "fatherJob": "PNS",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 4.500.000",
    "motherName": "Yani Mohamad",
    "motherJob": "PNS Guru",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "Rp 4.000.000",
    "parentPhone": "081240477266",
    "siblingPhone": "",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SD Negeri 1 Kota Selatan",
        "entryYear": "2017",
        "gradYear": "2023",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMP Negeri 2 Gorontalo",
        "entryYear": "2023",
        "gradYear": "2026",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-3",
        "title": "Juara 1 Lomba Desain Logo Sekolah",
        "category": "Non-Akademik",
        "level": "Sekolah",
        "year": "2025"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-6",
        "name": "OSIS Media Komunikasi"
      },
      {
        "id": "ex-7",
        "name": "Basket"
      }
    ],
    "careerGoals": [
      "Creative Director di Agensi Periklanan",
      "Brand Designer"
    ],
    "furtherStudyAspiration": "S1 Manajemen Komunikasi Visual",
    "masteredSubjects": [
      "Typografi & Layout",
      "Bahasa Inggris",
      "Informatika"
    ],
    "strugglingSubjects": [
      "Kimia Terapan"
    ],
    "notes": "Kreatif, memiliki kepemimpinan yang baik.",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-08-22T14:00:00Z",
    "photoUrl": "https://drive.google.com/test-photo-std-4"
  },
  {
    "id": "std-5",
    "no": 5,
    "name": "Aulia R. Ajuba",
    "nickname": "Aulia",
    "rombel": "10-DKV-3",
    "gender": "P",
    "nisn": "0113004394",
    "birthPlace": "Gorontalo",
    "birthDate": "2 April 2011",
    "religion": "Islam",
    "address": "talumolo",
    "addressDetail": {
      "rtRw": "001/001",
      "kelurahan": "Siendeng",
      "kecamatan": "Hulonthalangi",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "085756721646",
    "socialMedia": "aull_ayuba",
    "birthOrder": 2,
    "totalSiblings": 3,
    "chronicIllnessHistory": [],
    "fatherName": "Riston ayuba",
    "fatherJob": "Wiraswasta",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 2.800.000",
    "motherName": "Fatmawaty Anwar",
    "motherJob": "ibu rumah tangga",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "Rp 1.500.000",
    "parentPhone": "085370201244",
    "siblingPhone": "",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "tk Al-Muhajirin",
        "entryYear": "2014",
        "gradYear": "2015",
        "duration": ""
      },
      {
        "level": "SD",
        "schoolName": "SDN 50 dumboraya",
        "entryYear": "2016",
        "gradYear": "2023",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "smp negeri 5 Gorontalo",
        "entryYear": "2023",
        "gradYear": "2026",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [],
    "extracurriculars": [
      {
        "id": "ex-0-1789008235406",
        "name": "Desain Mode & Merchandise"
      }
    ],
    "careerGoals": [
      "dokter"
    ],
    "furtherStudyAspiration": "D4 Tata Busana & Desain",
    "masteredSubjects": [
      "dasar kejujuran",
      "bahasa Indonesia",
      "bahasa Inggris"
    ],
    "strugglingSubjects": [
      "Matematika"
    ],
    "notes": "Karakter tekun, rajin mengikuti tugas studio gambar.",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.581Z",
    "sdNama": "SDN 50 dumboraya",
    "sdTahunMasuk": "2016",
    "sdTahunKeluar": "2023",
    "sdLamaBelajar": "6 Tahun",
    "smpNama": "smp negeri 5 Gorontalo",
    "smpTahunMasuk": "2023",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Desain Mode & Merchandise",
    "statusKelahiran": "anak ke 1 dari 2 bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1wrCtDktGs4V70F7DJ4_c7O373grG6YWp/view?usp=drive_link",
    "tempatTanggalLahir": "Gorontalo 2 April 2011",
    "tkNama": "tk Al-Muhajirin",
    "tkTahunMasuk": "2014",
    "tkTahunKeluar": "2015"
  },
  {
    "id": "std-6",
    "no": 6,
    "name": "Katla Alfiani Abdullah",
    "nickname": "Katla",
    "rombel": "10-DKV-3",
    "gender": "P",
    "nisn": "0118692572",
    "birthPlace": "Gorontalo",
    "birthDate": "4-mei-2011",
    "religion": "Islam",
    "address": "Botu pingge",
    "addressDetail": {
      "rtRw": "002/002",
      "kelurahan": "Botu",
      "kecamatan": "Dumbo Raya",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "877-1294-2869",
    "socialMedia": "@Cimoy1",
    "birthOrder": 1,
    "totalSiblings": 1,
    "chronicIllnessHistory": [],
    "fatherName": "Rivon Abdullah",
    "fatherJob": "Tambang",
    "fatherEthnicity": "Blum tau",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 3.500.000",
    "motherName": "Andriyani",
    "motherJob": "Rumah tangga",
    "motherEthnicity": "Jawa",
    "motherRelation": "Kandung",
    "motherIncome": "-",
    "parentPhone": "813-5667-9887",
    "siblingPhone": "",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "Katla alfiani Abdullah",
        "entryYear": "",
        "gradYear": "",
        "duration": ""
      },
      {
        "level": "SD",
        "schoolName": "Katla alfiani Abdullah",
        "entryYear": "",
        "gradYear": "",
        "duration": "6 tahun"
      },
      {
        "level": "SMP",
        "schoolName": "Katla alfiani Abdullah",
        "entryYear": "2023",
        "gradYear": "2026",
        "duration": "3 tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-4",
        "title": "Peserta Pameran Karya Seni Pelajar",
        "category": "Non-Akademik",
        "level": "Provinsi",
        "year": "2025"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-0-1789008270099",
        "name": "Seni Lukis & Mural"
      }
    ],
    "careerGoals": [
      "Polwan"
    ],
    "furtherStudyAspiration": "S1 Game Design & Visual Effects",
    "masteredSubjects": [
      "Informatika",
      "matematika",
      "olahraga"
    ],
    "strugglingSubjects": [
      "PP",
      "sejarah"
    ],
    "notes": "Hobi: Berenang,masak ,dan lain nya | Hambatan Finansial: tidak ada hambatan | Hal ingin diperbaiki: Ingin memperbaiki smua yng ad di dalam diriku",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.581Z",
    "sdNama": "Katla alfiani Abdullah",
    "sdTahunMasuk": "2017",
    "sdTahunKeluar": "2023",
    "sdLamaBelajar": "6 tahun",
    "smpNama": "Katla alfiani Abdullah",
    "smpTahunMasuk": "2023",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 tahun",
    "ekstrakurikuler": "Seni Lukis & Mural",
    "prestasiSMP": "Peserta Pameran Karya Seni Pelajar (2025)",
    "statusKelahiran": "Anak ke 2 dari 4 bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1F54_KDEhHN576CT69jsyKVNOiD81Rd2u/view?usp=drive_link",
    "tempatTanggalLahir": "Gorontalo / 4-mei-2011",
    "penyakitKronis": "Asma",
    "tkNama": "Katla alfiani Abdullah"
  },
  {
    "id": "std-7",
    "no": 7,
    "name": "M. Wahyudin Usman",
    "nickname": "Wahyu",
    "rombel": "10-DKV-3",
    "gender": "L",
    "nisn": "0112403432",
    "birthPlace": "Kota Gorontalo",
    "birthDate": "22 Maret 2011",
    "religion": "Islam",
    "address": "Biawu JL. G. Tilongkabila",
    "addressDetail": {
      "rtRw": "001/004",
      "kelurahan": "Padebuolo",
      "kecamatan": "Kota Timur",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "08971336864",
    "socialMedia": "@wahyudin_usman",
    "birthOrder": 3,
    "totalSiblings": 5,
    "chronicIllnessHistory": [],
    "fatherName": "Amirudin usman",
    "fatherJob": "Petani/Pekebun",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 1.500.000",
    "motherName": "Zumuria igirisa",
    "motherJob": "sppg biawu",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "-",
    "parentPhone": "085399887711",
    "siblingPhone": "",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "TK Bustanul Athfal 2",
        "entryYear": "2016",
        "gradYear": "",
        "duration": ""
      },
      {
        "level": "SD",
        "schoolName": "mi Al-Huda",
        "entryYear": "2017",
        "gradYear": "2023",
        "duration": "6 Tahun"
      }
    ],
    "achievements": [],
    "extracurriculars": [
      {
        "id": "ex-0-1788152322650",
        "name": "Pramuka Penegak"
      }
    ],
    "careerGoals": [
      "Fotografer Dokumenter",
      "Editor Video"
    ],
    "furtherStudyAspiration": "D3 Multimedia & Broadcasting",
    "masteredSubjects": [
      "Teknik Pengambilan Gambar",
      "Pendidikan Jasmani"
    ],
    "strugglingSubjects": [
      "Bahasa Inggris",
      "Matematika"
    ],
    "notes": "Jarak rumah cukup jauh ke sekolah, perlu pendampingan absensi.",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.580Z",
    "sdNama": "mi Al-Huda",
    "sdTahunMasuk": "2017",
    "sdTahunKeluar": "2023",
    "sdLamaBelajar": "6 Tahun",
    "smpNama": "SMP Negeri 1 Tilongkabila",
    "smpTahunMasuk": "2023",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Pramuka Penegak",
    "statusKelahiran": "Anak ke 2 dari 2 bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1UnumAG2jEDVtowCxHxypdxTdvQSsK0Bt/view?usp=drive_link",
    "tempatTanggalLahir": "Kota Gorontalo 22 Maret 2011",
    "tkNama": "TK Bustanul Athfal 2",
    "tkTahunMasuk": "2016"
  },
  {
    "id": "std-8",
    "no": 8,
    "name": "Moh. Alrezky Gobel",
    "nickname": "Alrezky",
    "rombel": "10-DKV-3",
    "gender": "L",
    "nisn": "0105725886",
    "birthPlace": "Gorontalo",
    "birthDate": "08-03-2010",
    "religion": "Islam",
    "address": "Jl. Jend. Pol. A. Sujarwo",
    "addressDetail": {
      "rtRw": "003/002",
      "kelurahan": "Moodu",
      "kecamatan": "Kota Timur",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "081240477234",
    "socialMedia": "@alrezkygobel",
    "birthOrder": 2,
    "totalSiblings": 2,
    "chronicIllnessHistory": [],
    "fatherName": "Didin Gobel",
    "fatherJob": "Wiraswasta / Percetakan",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 3.800.000",
    "motherName": "Nurhayati Ishak",
    "motherJob": "PNS",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "Rp 3.500.000",
    "parentPhone": "081240477234",
    "siblingPhone": "",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SD Negeri 10 Kota Timur",
        "entryYear": "2016",
        "gradYear": "2022",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMP Negeri 3 Gorontalo",
        "entryYear": "2022",
        "gradYear": "2025",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-5",
        "title": "Juara 1 Lomba Fotografi Pelajar",
        "category": "Non-Akademik",
        "level": "Kota",
        "year": "2025"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-0-1788152348849",
        "name": "Jurnalistik Sekolah"
      },
      {
        "id": "ex-1-1788152348849",
        "name": "Desain Percetakan"
      }
    ],
    "careerGoals": [
      "Wirausahawan Studio Kreatif & Sablon",
      "Fotografer Komersial"
    ],
    "furtherStudyAspiration": "S1 Manajemen Bisnis Industri Kreatif",
    "masteredSubjects": [
      "Teknik Cetak & Sablon",
      "Software Desain Vektor",
      "Kewirausahaan"
    ],
    "strugglingSubjects": [
      "Sejarah",
      "Pendidikan Pancasila"
    ],
    "notes": "Sangat mengerti operasional mesin cetak & sablon merchandise.",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-08-31T04:59:08.849Z",
    "sdNama": "SD Negeri 10 Kota Timur",
    "sdTahunMasuk": "2016",
    "sdTahunKeluar": "2022",
    "sdLamaBelajar": "6 Tahun",
    "smpNama": "SMP Negeri 3 Gorontalo",
    "smpTahunMasuk": "2022",
    "smpTahunKeluar": "2025",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Jurnalistik Sekolah, Desain Percetakan",
    "prestasiSMP": "Juara 1 Lomba Fotografi Pelajar (2025)",
    "statusKelahiran": "Anak ke 2 dari 2 bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1P3Xd_WTXphHU96zZUKSGkUplr5FDnPaw/view?usp=drive_link"
  },
  {
    "id": "std-9",
    "no": 9,
    "name": "Mohamad Oxal Husain",
    "nickname": "OXAL",
    "rombel": "10-DKV-3",
    "gender": "L",
    "nisn": "0093548183",
    "birthPlace": "suwawa",
    "birthDate": "3 Oktober 2009",
    "religion": "Islam",
    "address": "Desa dutohe barat",
    "addressDetail": {
      "rtRw": "002/001",
      "kelurahan": "Bolihuangga",
      "kecamatan": "Limboto",
      "kabKota": "Kab. Gorontalo"
    },
    "phone": "082394994773",
    "socialMedia": "xallpnd",
    "birthOrder": 1,
    "totalSiblings": 2,
    "chronicIllnessHistory": [],
    "fatherName": "HENDRA HUSAIN",
    "fatherJob": "PEKERJAAN MENGAMBANG",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 2.400.000",
    "motherName": "HERLINA AKUBA",
    "motherJob": "Pedagang Kuliner",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "Rp 1.200.000",
    "parentPhone": "082259614009",
    "siblingPhone": "",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "TK HUYULA",
        "entryYear": "2015",
        "gradYear": "2016",
        "duration": "gak terlalu"
      },
      {
        "level": "SD",
        "schoolName": "SDN 6 KABILA",
        "entryYear": "2017",
        "gradYear": "2024",
        "duration": "lumayan"
      },
      {
        "level": "SMP",
        "schoolName": "SMPN 2 KABILA",
        "entryYear": "2024",
        "gradYear": "2026",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [],
    "extracurriculars": [
      {
        "id": "ex-0-1788152384016",
        "name": "Musik Band Sekolah"
      }
    ],
    "careerGoals": [
      "dokter"
    ],
    "furtherStudyAspiration": "DK",
    "masteredSubjects": [
      "PJOK",
      "DASAR KEJURUAN"
    ],
    "strugglingSubjects": [
      "mtk",
      "sejarah"
    ],
    "notes": "Hobi: main bola, main basket, main badminton | Keterampilan diminati: BASKET, BOLA | Hambatan Finansial: tidak ada hambatan | Kebanggaan: selalu kuat | Hal ingin diperbaiki: berhenti merokok",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.583Z",
    "sdNama": "SDN 6 KABILA",
    "sdTahunMasuk": "2017",
    "sdTahunKeluar": "2024",
    "sdLamaBelajar": "lumayan",
    "smpNama": "SMPN 2 KABILA",
    "smpTahunMasuk": "2024",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Pramuka",
    "statusKelahiran": "anak ke 3 dari 3 bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1N94NowDDNC5IPqCtkCga808HGCmhORVU/view?usp=drive_link",
    "tempatTanggalLahir": "suwawa 3 Oktober 2009",
    "tkNama": "TK HUYULA",
    "tkTahunMasuk": "2015",
    "tkTahunKeluar": "2016",
    "tkLamaBelajar": "gak terlalu",
    "prestasiSMP": "Juara 2 lomba lari balok"
  },
  {
    "id": "std-10",
    "no": 10,
    "name": "Rahmat Abubakar",
    "nickname": "Rahmat",
    "rombel": "10-DKV-3",
    "gender": "L",
    "nisn": "0117459238",
    "birthPlace": "Gorontalo",
    "birthDate": "25-03-2011",
    "religion": "Islam",
    "address": "Jl. Gelatik",
    "addressDetail": {
      "rtRw": "001/003",
      "kelurahan": "Heledulaa Selatan",
      "kecamatan": "Kota Timur",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "085341718720",
    "socialMedia": "@rahmat_abubakar",
    "birthOrder": 2,
    "totalSiblings": 4,
    "chronicIllnessHistory": [],
    "fatherName": "Ariyanto Abubakar",
    "fatherJob": "Buruh Harian Lepas",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 1.600.000",
    "motherName": "Isna Konta",
    "motherJob": "Ibu Rumah Tangga",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "-",
    "parentPhone": "085341718720",
    "siblingPhone": "",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SD Negeri 17 Kota Timur",
        "entryYear": "2017",
        "gradYear": "2023",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMP Negeri 9 Gorontalo",
        "entryYear": "2023",
        "gradYear": "2026",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [],
    "extracurriculars": [
      {
        "id": "ex-14",
        "name": "Futsal"
      },
      {
        "id": "ex-15",
        "name": "Desain Spanduk"
      }
    ],
    "careerGoals": [
      "Operator Komputer Desain",
      "Teknisi Cetak"
    ],
    "furtherStudyAspiration": "Langsung Bekerja di Industri Percetakan",
    "masteredSubjects": [
      "Aplikasi Pengolah Vektor",
      "Pendidikan Jasmani"
    ],
    "strugglingSubjects": [
      "Matematika",
      "Fisika"
    ],
    "notes": "Membutuhkan pendampingan peralatan praktikum mandiri.",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-08-23T09:00:00Z"
  },
  {
    "id": "std-11",
    "no": 11,
    "name": "Budiono Sutejo",
    "nickname": "Budi",
    "rombel": "11-DKV-3",
    "gender": "L",
    "nisn": "0095689263",
    "birthPlace": "Leato selatan",
    "birthDate": "19 Juni 2009",
    "religion": "Islam",
    "address": "Jl. R. Atje slamet",
    "addressDetail": {
      "rtRw": "002/002",
      "kelurahan": "Limba U Dua",
      "kecamatan": "Kota Selatan",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "081242565323",
    "socialMedia": "@budisutejo.dkv",
    "birthOrder": 1,
    "totalSiblings": 2,
    "chronicIllnessHistory": [],
    "fatherName": "Barwan sutejo",
    "fatherJob": "Petani",
    "fatherEthnicity": "Saluan",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 2.000.000",
    "motherName": "Norma Nojo",
    "motherJob": "IRT",
    "motherEthnicity": "Saluan",
    "motherRelation": "Kandung",
    "motherIncome": "-",
    "guardianName": "Sohora Ena",
    "guardianJob": "Pensiunan PNS",
    "guardianRelation": "Nenek / Wali Asuh di Gorontalo",
    "parentPhone": "081355443322",
    "siblingPhone": "",
    "neighborPhone": "085299001122",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SDN pongidan",
        "entryYear": "2014",
        "gradYear": "2022",
        "duration": "6 tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMPN 9 GORONTALO",
        "entryYear": "2022",
        "gradYear": "2025",
        "duration": "3 tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-6",
        "title": "Juara Harapan 1 Lomba Banner Edukasi Lingkungan",
        "category": "Non-Akademik",
        "level": "Provinsi",
        "year": "2025"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-0-1788152484904",
        "name": "Desain Kemasan (Packaging)"
      }
    ],
    "careerGoals": [
      "Desainer"
    ],
    "furtherStudyAspiration": "DKV",
    "masteredSubjects": [
      "Kk",
      "pjok"
    ],
    "strugglingSubjects": [
      "Matematika"
    ],
    "notes": "Tinggal bersama wali di Gorontalo, mandiri dan rajin.",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.582Z",
    "sdNama": "SDN pongidan",
    "sdTahunMasuk": "2014",
    "sdTahunKeluar": "2022",
    "sdLamaBelajar": "6 tahun",
    "smpNama": "SMPN 9 GORONTALO",
    "smpTahunMasuk": "2022",
    "smpTahunKeluar": "2025",
    "smpLamaBelajar": "3 tahun",
    "ekstrakurikuler": "Desain Kemasan (Packaging)",
    "prestasiSMP": "Juara Harapan 1 Lomba Banner Edukasi Lingkungan (2025)",
    "statusKelahiran": "2 dari 4",
    "photoUrl": "https://drive.google.com/file/d/1w6fqNmUZG7fBtzwQF7b9I_TS0oP252xV/view?usp=drive_link",
    "tempatTanggalLahir": "Leato selatan, 19 Juni 2009"
  },
  {
    "id": "std-12",
    "no": 12,
    "name": "Christover Yoxy Yakobus",
    "nickname": "Christo",
    "rombel": "11-DKV-3",
    "gender": "L",
    "nisn": "0103242075",
    "birthPlace": "Gorontalo",
    "birthDate": "12-06-2010",
    "religion": "Kristen Protestan",
    "address": "Jl. Trans Sulawesi",
    "addressDetail": {
      "rtRw": "004/001",
      "kelurahan": "Talumolo",
      "kecamatan": "Dumbo Raya",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "",
    "socialMedia": "@christoyoxy",
    "birthOrder": 2,
    "totalSiblings": 3,
    "chronicIllnessHistory": [],
    "fatherName": "Yoce Yacobus",
    "fatherJob": "Karyawan Ekspedisi",
    "fatherEthnicity": "Minahasa",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 3.200.000",
    "motherName": "Mellyana B. Tiha",
    "motherJob": "Wiraswasta",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "Rp 2.000.000",
    "parentPhone": "081340118822",
    "siblingPhone": "",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SD Katolik Santa Maria Gorontalo",
        "entryYear": "2016",
        "gradYear": "2022",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMP Katolik Santa Maria",
        "entryYear": "2022",
        "gradYear": "2025",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-7",
        "title": "Juara 2 Lomba Video Kreatif Profil Sekolah",
        "category": "Non-Akademik",
        "level": "Kota",
        "year": "2025"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-0-1788152580990",
        "name": "Broadcasting & Live Streaming Team"
      }
    ],
    "careerGoals": [
      "Motion Graphic Designer",
      "Video Producer"
    ],
    "furtherStudyAspiration": "S1 Film & Televisi / Multimedia",
    "masteredSubjects": [
      "Motion Graphics",
      "Editing Video",
      "Bahasa Inggris"
    ],
    "strugglingSubjects": [
      "Pendidikan Agama Khusus",
      "Fisika"
    ],
    "notes": "Keahlian teknis software After Effects dan Premiere sangat bagus.",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-08-31T05:03:00.991Z",
    "sdNama": "SD Katolik Santa Maria Gorontalo",
    "sdTahunMasuk": "2016",
    "sdTahunKeluar": "2022",
    "sdLamaBelajar": "6 Tahun",
    "smpNama": "SMP Katolik Santa Maria",
    "smpTahunMasuk": "2022",
    "smpTahunKeluar": "2025",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Broadcasting & Live Streaming Team",
    "prestasiSMP": "Juara 2 Lomba Video Kreatif Profil Sekolah (2025)",
    "statusKelahiran": "Anak ke 2 dari 3 bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1HJl5LSuPRmACEvspoHUP20dADD8CeR8S/view?usp=drive_link"
  },
  {
    "id": "std-13",
    "no": 13,
    "name": "Khaidir Yasin Nento",
    "nickname": "Alim",
    "rombel": "11-DKV-3",
    "gender": "L",
    "nisn": "0108006413",
    "birthPlace": "Gorontalo",
    "birthDate": "31 Mei",
    "religion": "Islam",
    "address": "Botubarani",
    "addressDetail": {
      "rtRw": "001/002",
      "kelurahan": "Pohe",
      "kecamatan": "Hulonthalangi",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "",
    "socialMedia": "khaidirnento002@gmail.com",
    "birthOrder": 2,
    "totalSiblings": 4,
    "chronicIllnessHistory": [],
    "fatherName": "Fance nento",
    "fatherJob": "Pilot drone",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "Rp 1.700.000",
    "motherName": "Lindha Aksar",
    "motherJob": "Wira suasta",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "-",
    "parentPhone": "085398884048",
    "siblingPhone": "",
    "neighborPhone": ".",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SD Negeri 1 Pohe",
        "entryYear": "2016",
        "gradYear": "2022",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMP Negeri 5 Gorontalo",
        "entryYear": "2022",
        "gradYear": "2025",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [],
    "extracurriculars": [
      {
        "id": "ex-0-1788152461421",
        "name": "Desain Sablon Manual & Digital"
      }
    ],
    "careerGoals": [
      "Polisi"
    ],
    "furtherStudyAspiration": "D3 Teknik Grafika",
    "masteredSubjects": [
      "Sablon Manual",
      "Vektor CorelDRAW",
      "Kewirausahaan"
    ],
    "strugglingSubjects": [
      "Matematika",
      "Bahasa Inggris"
    ],
    "notes": "Hambatan Finansial: tidak ada hambatan",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.582Z",
    "sdNama": "SD Negeri 1 Pohe",
    "sdTahunMasuk": "2016",
    "sdTahunKeluar": "2022",
    "sdLamaBelajar": "6 Tahun",
    "smpNama": "SMP Negeri 5 Gorontalo",
    "smpTahunMasuk": "2022",
    "smpTahunKeluar": "2025",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Tidak ada",
    "statusKelahiran": "Anak Tunggal",
    "photoUrl": "https://drive.google.com/file/d/1UjDuvCtZsCOQcVEzbmizAXs3SvD4P7WT/view?usp=drive_link",
    "tempatTanggalLahir": "Gorontalo, 31 Mei",
    "penyakitKronis": "a. Asam lambung"
  },
  {
    "id": "std-14",
    "no": 14,
    "name": "Misnawati Abdul",
    "nickname": "mimi",
    "rombel": "11-DKV-3",
    "gender": "P",
    "nisn": "0104886340",
    "birthPlace": "donggala",
    "birthDate": "21,03,10.",
    "religion": "Islam",
    "address": "jl. jenderal katamso",
    "addressDetail": {
      "rtRw": "002/003",
      "kelurahan": "Siendeng",
      "kecamatan": "Hulonthalangi",
      "kabKota": "Kota Gorontalo"
    },
    "phone": "082190089126",
    "socialMedia": "ig@mimiabdul03",
    "birthOrder": 3,
    "totalSiblings": 4,
    "chronicIllnessHistory": [],
    "fatherName": "mohammad abdul",
    "fatherJob": "Almarhum",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "-",
    "motherName": "kasma djafar",
    "motherJob": "ibu rumah tangga",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "Rp 1.400.000",
    "guardianName": "Adrian Abdul",
    "guardianJob": "Karyawan Swasta",
    "guardianRelation": "Kakak Kandung",
    "parentPhone": "081240446419",
    "siblingPhone": "081240556677",
    "neighborPhone": "",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "tk lestari",
        "entryYear": "2015",
        "gradYear": "2016",
        "duration": ""
      },
      {
        "level": "SD",
        "schoolName": "SDN 33 hulonthalangi",
        "entryYear": "2016",
        "gradYear": "2022",
        "duration": "6 Tahun"
      },
      {
        "level": "SMP",
        "schoolName": "smp negeri 4 kota Gorontalo",
        "entryYear": "2023",
        "gradYear": "2025",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-8",
        "title": "Juara 1 Lomba Cipta Puisi & Ilustrasi Tingkat Kota",
        "category": "Akademik",
        "level": "Kota",
        "year": "2025"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-0-1788152440340",
        "name": "Desain Layout Majalah Dinding"
      },
      {
        "id": "ex-1-1788152440340",
        "name": "PMR"
      }
    ],
    "careerGoals": [
      "Editor Buku & Layout Designer",
      "Ilustrator Freelance"
    ],
    "furtherStudyAspiration": "S1 Sastra & Desain Komunikasi Visual",
    "masteredSubjects": [
      "dasar kejujuran",
      "konsentrasi keahlian"
    ],
    "strugglingSubjects": [
      "Matematika",
      "Fisika Terapan"
    ],
    "notes": "Hambatan Finansial: tidak ada hambatan",
    "createdAt": "2026-07-15T08:00:00Z",
    "updatedAt": "2026-09-15T00:32:06.582Z",
    "sdNama": "SDN 33 hulonthalangi",
    "sdTahunMasuk": "2016",
    "sdTahunKeluar": "2022",
    "sdLamaBelajar": "6 Tahun",
    "smpNama": "smp negeri 4 kota Gorontalo",
    "smpTahunMasuk": "2023",
    "smpTahunKeluar": "2025",
    "smpLamaBelajar": "3 Tahun",
    "ekstrakurikuler": "Desain Layout Majalah Dinding, PMR",
    "prestasiSMP": "Juara 1 Lomba Cipta Puisi & Ilustrasi Tingkat Kota (2025)",
    "statusKelahiran": "anak pertama dari empat bersaudara",
    "photoUrl": "https://drive.google.com/file/d/1QrkDASPfVy5CNeRiAJlfOAWwy6bomQYi/view?usp=drive_link",
    "tempatTanggalLahir": "donggala, 21,03,10.",
    "penyakitKronis": "DBD\nMAG",
    "tkNama": "tk lestari",
    "tkTahunMasuk": "2015",
    "tkTahunKeluar": "2016"
  },
  {
    "id": "std-1789428969539",
    "no": 15,
    "name": "Fardhan Aditya Lantoni",
    "nickname": "Fardhan",
    "nisn": "1234",
    "birthPlace": "kelurahan tenda",
    "birthDate": "tanggal 19",
    "tempatTanggalLahir": "kelurahan tenda, tanggal 19",
    "rombel": "11-DKV-3",
    "gender": "L",
    "religion": "Islam",
    "address": "kelurahan tenda",
    "statusKelahiran": "kedua dari kesatu",
    "birthOrder": 1,
    "totalSiblings": 1,
    "phone": "08987421750",
    "socialMedia": "razakeeca@gmail.com",
    "penyakitKronis": "",
    "chronicIllnessHistory": [],
    "fatherName": "Hengky lantoni",
    "fatherJob": "kuli bangunan",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "motherName": "Mei Bakar",
    "motherJob": "",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "guardianName": "",
    "guardianJob": "",
    "guardianRelation": "",
    "parentPhone": "+62 895-3264-77089",
    "siblingPhone": "+62 896-7679-0762",
    "neighborPhone": "",
    "tkNama": "TK bayangkari",
    "tkTahunMasuk": "",
    "tkTahunKeluar": "",
    "tkLamaBelajar": "",
    "sdNama": "SDN 38 hulonthalangi",
    "sdTahunMasuk": "2016",
    "sdTahunKeluar": "2021",
    "sdLamaBelajar": "6 tahun",
    "smpNama": "SMP negeri 2 kota gorontalo",
    "smpTahunMasuk": "2022",
    "smpTahunKeluar": "2025",
    "smpLamaBelajar": "3 tahun",
    "prestasiSD": "",
    "prestasiSMP": "",
    "ekstrakurikuler": "",
    "careerGoals": [
      "bekerja di kapal",
      "dan cita-cita saya adalah boxing"
    ],
    "furtherStudyAspiration": "",
    "masteredSubjects": [
      "inform",
      "konsentrasi keahlian",
      "b inggris"
    ],
    "strugglingSubjects": [
      "matematika"
    ],
    "notes": "Hobi: main game, sedikit olahraga, dan makan | Keterampilan dikuasai: panjat pohon, dan berenang | Hambatan Finansial: ada hambatan | Karakter diri: sedikit kemalasan, gampang dipicu, dan gampang beradaptasi | Hal ingin diperbaiki: tinggi badan",
    "createdAt": "2026-09-14T23:36:09.539Z",
    "updatedAt": "2026-09-15T00:32:06.583Z",
    "photoUrl": "https://drive.google.com/file/d/1f4oHy4cCghZm5UV2Jy15rRwHIxx1pvjR/view?usp=drivesdk",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "TK bayangkari",
        "entryYear": "",
        "gradYear": "",
        "duration": ""
      },
      {
        "level": "SD",
        "schoolName": "SDN 38 hulonthalangi",
        "entryYear": "2016",
        "gradYear": "2021",
        "duration": "6 tahun"
      },
      {
        "level": "SMP",
        "schoolName": "SMP negeri 2 kota gorontalo",
        "entryYear": "2022",
        "gradYear": "2025",
        "duration": "3 tahun"
      }
    ],
    "extracurriculars": []
  },
  {
    "id": "std-1789429083924",
    "no": 16,
    "name": "Moh Checen Potabuga",
    "nickname": "Checen",
    "nisn": "0102319423",
    "birthPlace": "Talaga",
    "birthDate": "",
    "tempatTanggalLahir": "Talaga",
    "rombel": "10-DKV-3",
    "gender": "L",
    "religion": "Islam",
    "address": "Talaga",
    "statusKelahiran": "Anak ke5",
    "birthOrder": 1,
    "totalSiblings": 1,
    "phone": "085959479728",
    "socialMedia": "ig_ecenptg4",
    "penyakitKronis": "magh",
    "chronicIllnessHistory": [],
    "fatherName": "Wahidin Potabuga",
    "fatherJob": "Kepala Desa",
    "fatherEthnicity": "Mongondow",
    "fatherRelation": "Kandung",
    "motherName": "Erni Endeka",
    "motherJob": "Ibu rumah tangga",
    "motherEthnicity": "Mongondow",
    "motherRelation": "Kandung",
    "guardianName": "",
    "guardianJob": "",
    "guardianRelation": "",
    "parentPhone": "081350479010",
    "siblingPhone": "85824021985",
    "neighborPhone": "",
    "tkNama": "",
    "tkTahunMasuk": "2014",
    "tkTahunKeluar": "2015",
    "tkLamaBelajar": "",
    "sdNama": "SDN WANGGA BARU",
    "sdTahunMasuk": "2015",
    "sdTahunKeluar": "2022",
    "sdLamaBelajar": "6 tahun",
    "smpNama": "MTS SYAFI'IYAH",
    "smpTahunMasuk": "2022",
    "smpTahunKeluar": "2025",
    "smpLamaBelajar": "3 tahun",
    "prestasiSD": "",
    "prestasiSMP": "",
    "ekstrakurikuler": "Tenis meja",
    "careerGoals": [
      "Brimob"
    ],
    "furtherStudyAspiration": "DKV",
    "masteredSubjects": [
      "penjas"
    ],
    "strugglingSubjects": [
      "",
      "",
      ""
    ],
    "notes": "Hobi: main bola | Hal ingin diperbaiki: sikap",
    "createdAt": "2026-09-14T23:38:03.924Z",
    "updatedAt": "2026-09-15T00:32:06.584Z",
    "photoUrl": "https://drive.google.com/file/d/1PnV8sFt0Tp17qpMjUbZPXxkF8-T9ZaYH/view?usp=drivesdk",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SDN WANGGA BARU",
        "entryYear": "2015",
        "gradYear": "2022",
        "duration": "6 tahun"
      },
      {
        "level": "SMP",
        "schoolName": "MTS SYAFI'IYAH",
        "entryYear": "2022",
        "gradYear": "2025",
        "duration": "3 tahun"
      }
    ],
    "extracurriculars": []
  },
  {
    "id": "std-1789432326584-13",
    "no": 17,
    "name": "Farel Kamumu",
    "nickname": "fel",
    "nisn": "0119827364",
    "rombel": "10-DKV-2",
    "gender": "L",
    "birthPlace": "kotaraja kec dulupi kab Boalemo",
    "birthDate": "01-01-2010",
    "tempatTanggalLahir": "kotaraja kec dulupi kab Boalemo",
    "religion": "Islam",
    "address": "kotatengah",
    "statusKelahiran": "anak ke 1",
    "phone": "085220047202",
    "socialMedia": "",
    "penyakitKronis": "mag dan pusing",
    "chronicIllnessHistory": [
      "mag dan pusing"
    ],
    "photoUrl": "",
    "fatherName": "Andres kamumu",
    "fatherJob": "nelayan",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "kamdung",
    "fatherIncome": "-",
    "motherName": "indreyin nanto",
    "motherJob": "ibu rumah tangga",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "kandung",
    "motherIncome": "-",
    "parentPhone": "",
    "siblingPhone": "",
    "neighborPhone": "",
    "tkNama": "",
    "tkTahunMasuk": "",
    "tkTahunKeluar": "lupaa",
    "tkLamaBelajar": "",
    "sdNama": "SDN 05 dulupi",
    "sdTahunMasuk": "",
    "sdTahunKeluar": "2023",
    "sdLamaBelajar": "6 tahun",
    "smpNama": "Mts alkhairaat dulupi",
    "smpTahunMasuk": "",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 tahun",
    "prestasiSD": "",
    "prestasiSMP": "",
    "ekstrakurikuler": "",
    "educationHistory": [
      {
        "level": "SD",
        "schoolName": "SDN 05 dulupi",
        "entryYear": "",
        "gradYear": "2023",
        "duration": "6 tahun"
      },
      {
        "level": "SMP",
        "schoolName": "Mts alkhairaat dulupi",
        "entryYear": "",
        "gradYear": "2026",
        "duration": "3 tahun"
      }
    ],
    "achievements": [],
    "extracurriculars": [],
    "careerGoals": [
      "Desainer Grafis",
      "Pemain Sepak Bola"
    ],
    "furtherStudyAspiration": "DKV (Desain Komunikasi Visual)",
    "masteredSubjects": [
      "Dasar Kejuruan",
      "Agama"
    ],
    "strugglingSubjects": [
      "Matematika",
      "Bahasa Inggris"
    ],
    "notes": "Data identitas murid berhasil ditambahkan.",
    "createdAt": "2026-09-15T00:32:06.584Z",
    "updatedAt": "2026-09-15T00:32:06.584Z"
  },
  {
    "id": "std-1789432326586-14",
    "no": 18,
    "name": "Raihan Raihan Rizki Wahid Dunda",
    "nickname": "Rehan",
    "nisn": "3113880723",
    "rombel": "10-DKV-2",
    "gender": "L",
    "birthPlace": "Gorontalo",
    "birthDate": "12 April 2011",
    "tempatTanggalLahir": "Gorontalo, 12 April 2011",
    "religion": "Islam",
    "address": "Moodu",
    "statusKelahiran": "Anak 1 dari 2 bersaudara",
    "phone": "081243482279",
    "socialMedia": "ig.Raihandunda",
    "penyakitKronis": "Magh",
    "chronicIllnessHistory": [
      "Magh"
    ],
    "photoUrl": "",
    "fatherName": "Arifin Dunda",
    "fatherJob": "Karyawan Swasta",
    "fatherEthnicity": "Gorontalo",
    "fatherRelation": "Kandung",
    "fatherIncome": "-",
    "motherName": "Nurhafnita",
    "motherJob": "Dosen",
    "motherEthnicity": "Gorontalo",
    "motherRelation": "Kandung",
    "motherIncome": "-",
    "parentPhone": "085398764432",
    "siblingPhone": "089530201983",
    "neighborPhone": "",
    "tkNama": "TK. Alwathania",
    "tkTahunMasuk": "2015",
    "tkTahunKeluar": "2017",
    "tkLamaBelajar": "2 tahun",
    "sdNama": "Mi. Alkhairat Gorontalo",
    "sdTahunMasuk": "2017",
    "sdTahunKeluar": "2023",
    "sdLamaBelajar": "6 tahun",
    "smpNama": "Mts Alkhairat Gorontalo",
    "smpTahunMasuk": "2023",
    "smpTahunKeluar": "2026",
    "smpLamaBelajar": "3 Tahun",
    "prestasiSD": "",
    "prestasiSMP": "Juara 1 lomba Tahfizul Quran",
    "ekstrakurikuler": "Tidak Ada",
    "educationHistory": [
      {
        "level": "TK",
        "schoolName": "TK. Alwathania",
        "entryYear": "2015",
        "gradYear": "2017",
        "duration": "2 tahun"
      },
      {
        "level": "SD",
        "schoolName": "Mi. Alkhairat Gorontalo",
        "entryYear": "2017",
        "gradYear": "2023",
        "duration": "6 tahun"
      },
      {
        "level": "SMP",
        "schoolName": "Mts Alkhairat Gorontalo",
        "entryYear": "2023",
        "gradYear": "2026",
        "duration": "3 Tahun"
      }
    ],
    "achievements": [
      {
        "id": "ach-1789432326586",
        "title": "Juara 1 lomba Tahfizul Quran",
        "category": "Non-Akademik",
        "level": "Sekolah",
        "year": "2025"
      }
    ],
    "extracurriculars": [
      {
        "id": "ex-0",
        "name": "Tidak Ada"
      }
    ],
    "careerGoals": [
      "Pemain Real Madrid dan desainer"
    ],
    "furtherStudyAspiration": "DKV",
    "masteredSubjects": [
      "Agama",
      "Informatika",
      "Dasar Kejuruan"
    ],
    "strugglingSubjects": [
      "MTK",
      "Bahasa Ingris",
      "Sejarah"
    ],
    "notes": "Hobi: Main Bola, Main Game | Keterampilan diminati: Bola, Basket | Hambatan Finansial: tidak ada hambatan | Karakter diri: gampang beradaptasi, kuat makam, kuat tidur | Kebanggaan: selallu kuat dan sehat | Hal ingin diperbaiki: ingin memperbaiki semua",
    "createdAt": "2026-09-15T00:32:06.586Z",
    "updatedAt": "2026-09-15T00:32:06.586Z"
  }
];

export const INITIAL_CONSULTATIONS: Consultation[] = [];

export const INITIAL_COLLABORATIONS: Collaboration[] = [];

export const INITIAL_CASES: StudentCase[] = [];

export const INITIAL_ACTIVITIES: ActivityLog[] = [];
