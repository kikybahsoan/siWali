export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function getIndonesianDayName(dateString: string): string {
  if (!dateString) return 'Senin';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Senin';
    return INDONESIAN_DAYS[d.getDay()];
  } catch {
    return 'Senin';
  }
}

export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    // Handle DD-MM-YYYY or YYYY-MM-DD
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      const monthIdx = parseInt(month, 10) - 1;
      return `${parseInt(day, 10)} ${INDONESIAN_MONTHS[monthIdx] || month} ${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate()} ${INDONESIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateString;
  }
}

export function formatPeriod(yearMonth: string): string {
  // yearMonth: "2026-08"
  if (!yearMonth) return 'Agustus 2026';
  const parts = yearMonth.split('-');
  if (parts.length === 2) {
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${INDONESIAN_MONTHS[monthIdx] || parts[1]} ${parts[0]}`.toUpperCase();
  }
  return yearMonth.toUpperCase();
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
