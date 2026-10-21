/**
 * Date formatting utilities for Thai Clinical EHR (วัน/เดือน/ปี พ.ศ.)
 * แก้ไขปัญหาแสดงผล ปี/เดือน/วัน (YYYY-MM-DD) ที่ทำให้ผู้ใช้เกิดความสับสน
 * กำหนดรูปแบบ วัน -> เดือน -> ปี (พ.ศ.) ให้ชัดเจนและตรวจสอบได้ง่าย
 */

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_DAYS_FULL = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

export const THAI_DAYS_SHORT = [
  'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
];

export type ThaiDateFormat = 'short' | 'long' | 'numeric' | 'full' | 'day_short' | 'day_full';

export interface ParsedDateParts {
  year: number;        // ค.ศ. (e.g. 2026)
  thaiYear: number;    // พ.ศ. (e.g. 2569)
  month: number;       // 1 - 12
  day: number;         // 1 - 31
  dayOfWeek?: number;  // 0 (Sun) - 6 (Sat)
  isoString: string;   // YYYY-MM-DD
}

/**
 * แยกส่วนประกอบของวันที่อย่างแม่นยำ รองรับทั้ง YYYY-MM-DD, DD/MM/YYYY, พ.ศ. และ ค.ศ.
 */
export function parseDateParts(dateStr?: string | null): ParsedDateParts | null {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return null;
  }

  const clean = dateStr.trim();
  const dateOnly = clean.split('T')[0];
  const parts = dateOnly.split(/[\/\-]/);

  let year = NaN;
  let month = NaN;
  let day = NaN;

  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    if (p0 > 1000) {
      // YYYY-MM-DD or YYYY/MM/DD
      year = p0;
      month = p1;
      day = p2;
    } else {
      // DD/MM/YYYY or DD-MM-YYYY
      day = p0;
      month = p1;
      year = p2;
    }
  } else {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  // Handle Buddhist Era Year (พ.ศ.) > 2400
  let gregYear = year;
  let thaiYear = year;
  if (year > 2400) {
    thaiYear = year;
    gregYear = year - 543;
  } else {
    thaiYear = year + 543;
    gregYear = year;
  }

  // Check valid Date object to get correct Day of Week
  const testDate = new Date(gregYear, month - 1, day);
  const dayOfWeek = testDate.getDay();

  const dayPad = String(day).padStart(2, '0');
  const monthPad = String(month).padStart(2, '0');
  const isoString = `${gregYear}-${monthPad}-${dayPad}`;

  return {
    year: gregYear,
    thaiYear,
    month,
    day,
    dayOfWeek,
    isoString
  };
}

/**
 * แปลงวันที่จากสตริงมาตรฐาน (เช่น 2026-10-09 หรือ 09/10/2569)
 * ให้อยู่ในรูปแบบ วัน/เดือน/ปี (พ.ศ.) ที่คนไทยคุ้นเคย ชัดเจน ไม่สับสน
 *
 * ตัวอย่างผลลัพธ์:
 * - 'short':    "9 ต.ค. 2569"
 * - 'numeric':  "09/10/2569" (วัน/เดือน/ปี)
 * - 'long':     "9 ตุลาคม 2569"
 * - 'full':     "9 ต.ค. 2569 (09/10/2569)"
 * - 'day_short': "ศ. 9 ต.ค. 2569"
 * - 'day_full':  "วันศุกร์ที่ 9 ตุลาคม 2569 (09/10/2569)"
 */
export function formatAppointmentDate(
  dateStr?: string | null,
  format: ThaiDateFormat = 'short'
): string {
  const parsed = parseDateParts(dateStr);
  if (!parsed) {
    return dateStr ? String(dateStr) : '';
  }

  const { thaiYear, month, day, dayOfWeek } = parsed;
  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  const monthIdx = Math.max(0, Math.min(11, month - 1));
  const dayOfWeekIdx = (typeof dayOfWeek === 'number' && dayOfWeek >= 0 && dayOfWeek <= 6) ? dayOfWeek : 0;

  if (format === 'numeric') {
    // วัน/เดือน/ปี
    return `${dayStr}/${monthStr}/${thaiYear}`;
  }

  if (format === 'long') {
    return `${day} ${THAI_MONTHS_FULL[monthIdx]} ${thaiYear}`;
  }

  if (format === 'day_short') {
    return `${THAI_DAYS_SHORT[dayOfWeekIdx]} ${day} ${THAI_MONTHS_SHORT[monthIdx]} ${thaiYear}`;
  }

  if (format === 'day_full') {
    return `${THAI_DAYS_FULL[dayOfWeekIdx]}ที่ ${day} ${THAI_MONTHS_FULL[monthIdx]} พ.ศ. ${thaiYear} (${dayStr}/${monthStr}/${thaiYear})`;
  }

  if (format === 'full') {
    return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${thaiYear} (${dayStr}/${monthStr}/${thaiYear})`;
  }

  // Default 'short': "9 ต.ค. 2569"
  return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${thaiYear}`;
}

/**
 * แสดงป้ายข้อความสรุปวันที่ในรูปแบบ วัน/เดือน/ปี พร้อมวันในสัปดาห์
 */
export function formatThaiDateLabel(dateStr?: string | null): string {
  if (!dateStr) return 'ยังไม่ได้กำหนดวันนัด';
  return formatAppointmentDate(dateStr, 'day_full');
}

/**
 * สร้าง ISO string (YYYY-MM-DD) จากการบวกวันนัดหมายตามระยะเวลาทั่วไปในจิตเวช
 */
export function addDaysToDate(baseDateStr: string | null | undefined, daysToAdd: number): string {
  let baseDate = new Date();
  if (baseDateStr) {
    const parsed = parseDateParts(baseDateStr);
    if (parsed) {
      baseDate = new Date(parsed.year, parsed.month - 1, parsed.day);
    }
  }
  baseDate.setDate(baseDate.getDate() + daysToAdd);
  const y = baseDate.getFullYear();
  const m = String(baseDate.getMonth() + 1).padStart(2, '0');
  const d = String(baseDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
