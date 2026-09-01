/**
 * Google Drive Image Optimizer & Helper Utility
 * Handles Google Drive sharing links and converts them into low-resolution,
 * fast-loading thumbnail URLs suitable for web apps and PDF printing.
 */

export function extractDriveFileId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/{FILE_ID}/view or /file/d/{FILE_ID}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id={FILE_ID} or ?id={FILE_ID}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/i);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: lh3.googleusercontent.com/d/{FILE_ID}
  const lh3Match = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  // Pattern 4: /folders/{ID} or /d/{ID}
  const dDirectMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{25,})/i);
  if (dDirectMatch && dDirectMatch[1]) return dDirectMatch[1];

  // Pattern 5: if user pasted only the raw File ID (25-45 characters alphanumeric with dashes/underscores)
  if (/^[a-zA-Z0-9_-]{28,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export type ImageSizePreset = 'thumb' | 'low' | 'small' | 'medium' | 'large' | 'original';

export function getOptimizedImageUrl(
  rawUrl?: string,
  preset: ImageSizePreset = 'low'
): string {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) return '';

  const trimmed = rawUrl.trim();
  const driveId = extractDriveFileId(trimmed);

  if (driveId) {
    // Low-resolution size tokens for Google Drive CDN (lh3)
    let sizeParam = 'w400';
    if (preset === 'thumb') {
      sizeParam = 'w150-h150-n';
    } else if (preset === 'small' || preset === 'low') {
      sizeParam = 'w320-h320-n'; // Low resolution fast-loading square/proportional
    } else if (preset === 'medium') {
      sizeParam = 'w600';
    } else if (preset === 'large') {
      sizeParam = 'w1000';
    }

    // lh3.googleusercontent.com/d/{ID}={size} is the fastest direct image thumbnail proxy
    return `https://lh3.googleusercontent.com/d/${driveId}=${sizeParam}`;
  }

  return trimmed;
}

export function getDriveThumbnailFallback(rawUrl?: string): string {
  const driveId = extractDriveFileId(rawUrl);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w400`;
  }
  return rawUrl || '';
}

export function isDriveUrl(url?: string): boolean {
  if (!url) return false;
  return /drive\.google\.com|googleusercontent\.com/i.test(url) || !!extractDriveFileId(url);
}

export const DRIVE_GUIDE_STEPS = [
  {
    step: 1,
    title: 'Unggah Foto ke Google Drive',
    desc: 'Buka Google Drive (drive.google.com) lalu upload foto murid / dokumentasi kegiatan.',
  },
  {
    step: 2,
    title: 'Ubah Akses Menjadi Publik',
    desc: 'Klik kanan foto -> Bagikan (Share) -> Ubah "Akses umum" menjadi "Siapa saja yang memiliki link" (Anyone with the link).',
  },
  {
    step: 3,
    title: 'Salin Link & Tempel di siWali',
    desc: 'Klik "Salin link" (Copy link) dan tempelkan ke kolom foto aplikasi siWali. Foto akan otomatis dioptimasi dengan resolusi ringan!',
  },
];
