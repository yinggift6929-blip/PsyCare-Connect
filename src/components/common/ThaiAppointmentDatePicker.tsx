import React, { useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, CalendarDays } from 'lucide-react';
import {
  parseDateParts,
  formatAppointmentDate,
  THAI_MONTHS_FULL,
  addDaysToDate
} from '../../utils/dateUtils.ts';

interface ThaiAppointmentDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  themeColor?: 'rose' | 'indigo' | 'teal';
  allowQuickShortcuts?: boolean;
  className?: string;
}

export const ThaiAppointmentDatePicker: React.FC<ThaiAppointmentDatePickerProps> = ({
  value,
  onChange,
  label = 'วันนัดหมายติดตามครั้งถัดไป:',
  required = false,
  themeColor = 'indigo',
  allowQuickShortcuts = true,
  className = ''
}) => {
  const parsed = useMemo(() => parseDateParts(value), [value]);

  // Color schemes
  const colorMap = {
    indigo: {
      border: 'border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300',
      badgeBg: 'bg-indigo-50/90 text-indigo-900 border-indigo-200',
      badgeAccent: 'text-indigo-600',
      quickBtn: 'hover:bg-indigo-50 text-indigo-700 border-indigo-200 bg-white',
      ring: 'focus:ring-indigo-300'
    },
    rose: {
      border: 'border-rose-200 focus:border-rose-400 focus:ring-rose-300',
      badgeBg: 'bg-rose-50/90 text-rose-900 border-rose-200',
      badgeAccent: 'text-rose-600',
      quickBtn: 'hover:bg-rose-50 text-rose-700 border-rose-200 bg-white',
      ring: 'focus:ring-rose-300'
    },
    teal: {
      border: 'border-teal-200 focus:border-teal-400 focus:ring-teal-300',
      badgeBg: 'bg-teal-50/90 text-teal-900 border-teal-200',
      badgeAccent: 'text-teal-600',
      quickBtn: 'hover:bg-teal-50 text-teal-700 border-teal-200 bg-white',
      ring: 'focus:ring-teal-300'
    }
  }[themeColor];

  // Current values
  const currentDay = parsed?.day || 0;
  const currentMonth = parsed?.month || 0;
  const currentYear = parsed?.year || 0;
  const currentThaiYear = parsed?.thaiYear || 0;

  // Handlers for individual Day / Month / Year changes
  const handleDayChange = (newDay: number) => {
    const today = new Date();
    const y = currentYear || today.getFullYear();
    const m = currentMonth || (today.getMonth() + 1);
    const dPad = String(newDay).padStart(2, '0');
    const mPad = String(m).padStart(2, '0');
    onChange(`${y}-${mPad}-${dPad}`);
  };

  const handleMonthChange = (newMonth: number) => {
    const today = new Date();
    const y = currentYear || today.getFullYear();
    const d = currentDay || today.getDate();
    // Days in this month
    const maxDays = new Date(y, newMonth, 0).getDate();
    const finalDay = Math.min(d, maxDays);
    const dPad = String(finalDay).padStart(2, '0');
    const mPad = String(newMonth).padStart(2, '0');
    onChange(`${y}-${mPad}-${dPad}`);
  };

  const handleYearChange = (newThaiYear: number) => {
    const gregYear = newThaiYear - 543;
    const today = new Date();
    const m = currentMonth || (today.getMonth() + 1);
    const d = currentDay || today.getDate();
    const dPad = String(d).padStart(2, '0');
    const mPad = String(m).padStart(2, '0');
    onChange(`${gregYear}-${mPad}-${dPad}`);
  };

  // Quick shortcuts
  const applyQuickOffset = (days: number) => {
    const todayIso = new Date().toISOString().split('T')[0];
    const newDate = addDaysToDate(todayIso, days);
    onChange(newDate);
  };

  // Year options: current year - 1 to + 4 (Buddhist Era)
  const baseYear = new Date().getFullYear();
  const yearOptions = [
    baseYear - 1 + 543,
    baseYear + 543,
    baseYear + 1 + 543,
    baseYear + 2 + 543,
    baseYear + 3 + 543
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <span className="text-[10px] text-slate-500 font-medium">
            รูปแบบ: <strong>วัน / เดือน / ปี (พ.ศ.)</strong>
          </span>
        </div>
      )}

      {/* Main Selectors in Thai Order: วัน -> เดือน -> ปี พ.ศ. */}
      <div className="grid grid-cols-12 gap-1.5 text-xs">
        {/* วันที่ 1 - 31 */}
        <div className="col-span-3 sm:col-span-3">
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
            วันที่ (1-31):
          </label>
          <select
            value={currentDay || ''}
            onChange={(e) => handleDayChange(parseInt(e.target.value, 10))}
            className={`w-full p-2 bg-white border ${colorMap.border} rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2`}
          >
            <option value="">- วัน -</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {String(d).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* เดือน (มกราคม - ธันวาคม) */}
        <div className="col-span-5 sm:col-span-5">
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
            เดือน:
          </label>
          <select
            value={currentMonth || ''}
            onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
            className={`w-full p-2 bg-white border ${colorMap.border} rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2`}
          >
            <option value="">- เลือกเดือน -</option>
            {THAI_MONTHS_FULL.map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {idx + 1}. {mName}
              </option>
            ))}
          </select>
        </div>

        {/* ปี พ.ศ. */}
        <div className="col-span-4 sm:col-span-4">
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
            ปี (พ.ศ.):
          </label>
          <select
            value={currentThaiYear || ''}
            onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
            className={`w-full p-2 bg-white border ${colorMap.border} rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2`}
          >
            <option value="">- พ.ศ. -</option>
            {yearOptions.map((ty) => (
              <option key={ty} value={ty}>
                {ty} ({ty - 543})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alternative Native Calendar Picker & Clear Option */}
      <div className="flex items-center gap-2 pt-0.5">
        <div className="relative flex-1">
          <input
            type="date"
            value={parsed?.isoString || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full py-1.5 px-2.5 text-[11px] bg-slate-50 hover:bg-white border ${colorMap.border} rounded-lg text-slate-700 cursor-pointer focus:outline-none focus:ring-1`}
            title="คลิกเพื่อเลือกจากปฏิทินแบบกราฟิก"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-slate-400 hover:text-rose-600 px-2 py-1 rounded border border-slate-200 hover:border-rose-200 transition shrink-0"
          >
            ล้างวันนัด
          </button>
        )}
      </div>

      {/* Quick Psychiatric Follow-up Shortcuts */}
      {allowQuickShortcuts && (
        <div className="flex items-center gap-1 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mr-0.5">
            <Clock className="w-2.5 h-2.5" /> ด่วน:
          </span>
          <button
            type="button"
            onClick={() => applyQuickOffset(7)}
            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition ${colorMap.quickBtn}`}
          >
            +1 สัปดาห์
          </button>
          <button
            type="button"
            onClick={() => applyQuickOffset(14)}
            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition ${colorMap.quickBtn}`}
          >
            +2 สัปดาห์
          </button>
          <button
            type="button"
            onClick={() => applyQuickOffset(30)}
            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition ${colorMap.quickBtn}`}
          >
            +1 เดือน
          </button>
          <button
            type="button"
            onClick={() => applyQuickOffset(60)}
            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition ${colorMap.quickBtn}`}
          >
            +2 เดือน
          </button>
          <button
            type="button"
            onClick={() => applyQuickOffset(90)}
            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition ${colorMap.quickBtn}`}
          >
            +3 เดือน
          </button>
        </div>
      )}

      {/* Prominent Thai Date Confirmation Banner */}
      {value ? (
        <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${colorMap.badgeBg} text-xs animate-in fade-in`}>
          <CalendarDays className={`w-4 h-4 shrink-0 mt-0.5 ${colorMap.badgeAccent}`} />
          <div className="min-w-0 flex-1">
            <div className="font-bold flex items-center gap-1.5 flex-wrap">
              <span>วันนัดที่เลือก:</span>
              <span className="underline decoration-2 font-extrabold text-[13px]">
                {formatAppointmentDate(value, 'day_full')}
              </span>
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
              <span>
                ลำดับถูกต้อง: วันที่ <strong>{parsed?.day}</strong> เดือน <strong>{parsed && THAI_MONTHS_FULL[parsed.month - 1]}</strong> พ.ศ. <strong>{parsed?.thaiYear}</strong> (ไม่สับสนกับ ปี/เดือน/วัน)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 italic flex items-center gap-1 px-1">
          <Calendar className="w-3 h-3" />
          <span>ยังไม่ได้กำหนดวันนัดหมาย</span>
        </div>
      )}
    </div>
  );
};
