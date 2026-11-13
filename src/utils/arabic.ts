import type { LayerFilterKey, SegmentType } from '../types/fiqh';

const DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/**
 * Normalizes Arabic text for search by removing diacritics and unifying common letter variants.
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(DIACRITICS_REGEX, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .toLowerCase()
    .trim();
}

export function segmentTypeToLayer(type: SegmentType): LayerFilterKey {
  switch (type) {
    case 'matn':
      return 'matn';
    case 'sharh':
    case 'hadith':
      return 'sharh';
    case 'keypoint':
    case 'khilaf':
      return 'keypoint';
    case 'tarjih':
      return 'tarjih';
    case 'ziyada':
      return 'ziyada';
    case 'qaidah':
      return 'qaidah';
  }
}

export function getSegmentBadgeLabel(type: SegmentType, customLabel?: string): string {
  if (customLabel) return customLabel;
  switch (type) {
    case 'matn':
      return 'المتن (الفقه الميسر)';
    case 'sharh':
      return 'الشرح';
    case 'keypoint':
      return 'نقطة مهمة / خلاصة';
    case 'khilaf':
      return 'نقل الخلاف';
    case 'tarjih':
      return 'الترجيح';
    case 'ziyada':
      return 'زيادة على المتن';
    case 'qaidah':
      return 'قاعدة';
    case 'hadith':
      return 'حديث وشاهد';
  }
}

export function toArabicDigits(num: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/\d/g, (d) => digits[Number(d)] ?? d);
}
