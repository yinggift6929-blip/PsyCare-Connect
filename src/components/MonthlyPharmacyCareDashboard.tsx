import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  TrendingUp, 
  Home, 
  PhoneCall, 
  Building2, 
  Activity, 
  ShieldCheck, 
  Users, 
  ClipboardCheck, 
  HeartHandshake, 
  Sparkles, 
  X, 
  Search, 
  ArrowUpRight, 
  Filter 
} from 'lucide-react';
import { 
  Patient, 
  DtpRecord, 
  Medication, 
  HomeVisitRecord, 
  TelemedRecord, 
  NurseRecord, 
  PsychRecord, 
  SafetyLog, 
  Mars5Assessment, 
  DiepssAssessment, 
  MetabolicRecord,
  DtpDomain
} from '../types.ts';
import { formatAppointmentDate, getYearMonth, getCurrentYearMonth } from '../utils/dateUtils.ts';

interface MonthlyPharmacyCareDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  dtps: DtpRecord[];
  medications?: Medication[];
  homeVisits?: HomeVisitRecord[];
  telemedRecords?: TelemedRecord[];
  nurseRecords?: NurseRecord[];
  psychRecords?: PsychRecord[];
  safetyLogs?: SafetyLog[];
  mars5Records?: Mars5Assessment[];
  diepssRecords?: DiepssAssessment[];
  metabolicRecords?: MetabolicRecord[];
  onSelectPatient?: (patientId: string) => void;
  onSyncNow?: () => void;
}

export const MonthlyPharmacyCareDashboard: React.FC<MonthlyPharmacyCareDashboardProps> = ({
  isOpen,
  onClose,
  patients,
  dtps,
  medications = [],
  homeVisits = [],
  telemedRecords = [],
  nurseRecords = [],
  psychRecords = [],
  safetyLogs = [],
  mars5Records = [],
  diepssRecords = [],
  metabolicRecords = [],
  onSelectPatient,
  onSyncNow
}) => {
  // Extract all available months from records using robust getYearMonth
  const availableMonths = useMemo(() => {
    const dates: (string | undefined | null)[] = [];
    patients.forEach(p => {
      if (p.lastVisit) dates.push(p.lastVisit);
      if (p.nextAppointment) dates.push(p.nextAppointment);
      if (p.updatedAt) dates.push(p.updatedAt);
      if (p.hosxpNoteUpdatedAt) dates.push(p.hosxpNoteUpdatedAt);
    });
    dtps.forEach(d => { if (d.date) dates.push(d.date); });
    homeVisits.forEach(h => { if (h.date) dates.push(h.date); });
    telemedRecords.forEach(t => { if (t.date) dates.push(t.date); });
    mars5Records.forEach(m => { if (m.date) dates.push(m.date); });
    diepssRecords.forEach(d => { if (d.date) dates.push(d.date); });
    metabolicRecords.forEach(met => { if (met.date) dates.push(met.date); });

    const monthSet = new Set<string>();
    dates.forEach(d => {
      const ym = getYearMonth(d);
      if (ym) monthSet.add(ym);
    });

    // Ensure current month (e.g. 2026-11) is always included
    const currentYM = getCurrentYearMonth();
    monthSet.add(currentYM);
    monthSet.add('2026-10');

    const sorted = Array.from(monthSet).sort().reverse();
    return sorted;
  }, [patients, dtps, homeVisits, telemedRecords, mars5Records, diepssRecords, metabolicRecords]);

  // Selected Month (default to current month or first available or 'all')
  const currentYM = useMemo(() => getCurrentYearMonth(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return availableMonths.includes(currentYM) ? currentYM : (availableMonths[0] || 'all');
  });
  const [filterGroup, setFilterGroup] = useState<'all' | 'home_visit' | 'telemed' | 'clinic_dtp'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Synchronize selected month when modal opens or available months change
  useEffect(() => {
    if (isOpen) {
      if (selectedMonth !== 'all' && !availableMonths.includes(selectedMonth)) {
        if (availableMonths.includes(currentYM)) {
          setSelectedMonth(currentYM);
        } else if (availableMonths.length > 0) {
          setSelectedMonth(availableMonths[0]);
        } else {
          setSelectedMonth('all');
        }
      }
    }
  }, [isOpen, availableMonths, currentYM, selectedMonth]);

  if (!isOpen) return null;

  // Thai month names
  const formatThaiMonth = (ym: string) => {
    if (ym === 'all') return 'สรุปภาพรวมสะสมทั้งหมด (All Records)';
    const parts = ym.split('-');
    if (parts.length < 2) return ym;
    const year = parseInt(parts[0], 10) + 543;
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const mIdx = parseInt(parts[1], 10) - 1;
    return `${monthNames[mIdx] || parts[1]} พ.ศ. ${year}`;
  };

  // Navigate months
  const currentIdx = availableMonths.indexOf(selectedMonth);
  const handlePrevMonth = () => {
    if (currentIdx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIdx + 1]);
    }
  };
  const handleNextMonth = () => {
    if (currentIdx > 0) {
      setSelectedMonth(availableMonths[currentIdx - 1]);
    }
  };

  // Filter records according to selected month using getYearMonth
  const isDateInSelectedMonth = (dStr?: string | null) => {
    if (!dStr) return false;
    if (selectedMonth === 'all') return true;
    const ym = getYearMonth(dStr);
    return ym === selectedMonth;
  };

  // Filtered DTPs for this month
  const monthlyDtps = dtps.filter(d => isDateInSelectedMonth(d.date));
  const resolvedDtps = monthlyDtps.filter(d => d.status === 'resolved');
  const pendingDtps = monthlyDtps.filter(d => d.status === 'pending');
  const dtpResolutionRate = monthlyDtps.length > 0 
    ? Math.round((resolvedDtps.length / monthlyDtps.length) * 100) 
    : 100;

  // Monthly Home Visits & Telemed
  const monthlyHomeVisits = homeVisits.filter(h => isDateInSelectedMonth(h.date));
  const monthlyTelemeds = telemedRecords.filter(t => isDateInSelectedMonth(t.date));

  // Monthly Assessments
  const monthlyMars5 = mars5Records.filter(m => isDateInSelectedMonth(m.date));
  const monthlyDiepss = diepssRecords.filter(d => isDateInSelectedMonth(d.date));
  const monthlyMetabolics = metabolicRecords.filter(met => isDateInSelectedMonth(met.date));

  // Patients active or scheduled in this month or with DTPs in this month
  const monthlyPatientIds = new Set<string>();
  patients.forEach(p => {
    if (
      isDateInSelectedMonth(p.lastVisit) || 
      isDateInSelectedMonth(p.nextAppointment) ||
      isDateInSelectedMonth(p.updatedAt) ||
      isDateInSelectedMonth(p.hosxpNoteUpdatedAt)
    ) {
      monthlyPatientIds.add(p.id);
    }
  });
  monthlyDtps.forEach(d => monthlyPatientIds.add(d.patientId));
  monthlyHomeVisits.forEach(h => monthlyPatientIds.add(h.patientId));
  monthlyTelemeds.forEach(t => monthlyPatientIds.add(t.patientId));
  monthlyMars5.forEach(m => monthlyPatientIds.add(m.patientId));
  monthlyDiepss.forEach(d => monthlyPatientIds.add(d.patientId));
  monthlyMetabolics.forEach(met => monthlyPatientIds.add(met.patientId));

  // If specific month has matched records, use those.
  // If viewing all, or if no patients specifically have an appointment in the chosen month,
  // show all clinic patients so the user ALWAYS sees their registered clinic cohort!
  const hasSpecificMonthMatches = monthlyPatientIds.size > 0;
  const isShowingAllAsFallback = selectedMonth !== 'all' && !hasSpecificMonthMatches && patients.length > 0;

  const activePatientsInMonth = (selectedMonth === 'all' || !hasSpecificMonthMatches)
    ? patients
    : patients.filter(p => monthlyPatientIds.has(p.id));

  // Group distributions (3 Groups: เยี่ยมบ้าน, telemed, คลินิก/DRPs)
  const homeVisitGroupPatients = activePatientsInMonth.filter(p => p.trackingGroup === 'home_visit');
  const telemedGroupPatients = activePatientsInMonth.filter(p => p.trackingGroup === 'telemed');
  const clinicGroupPatients = activePatientsInMonth.filter(p => p.trackingGroup === 'clinic_dtp' || (!p.trackingGroup));

  // Average Adherence
  const avgAdherence = activePatientsInMonth.length > 0 
    ? Math.round(activePatientsInMonth.reduce((acc, p) => acc + (p.adherenceScore || 0), 0) / activePatientsInMonth.length)
    : 0;

  const highAdherenceCount = activePatientsInMonth.filter(p => p.adherenceScore >= 80).length;

  // DTP Domain Breakdown (Showing the 6 specific DRP topics)
  const standardDomains = useMemo(() => {
    const defaultList: string[] = [
      'Non adherence - ลืมกินยา',
      'Non adherence - กินยาผิดขนาด มากกว่าแพทย์สั่ง',
      'Non adherence - กินยาผิดขนาด น้อยกว่าแพทย์สั่ง',
      'Non adherence - หยุดกินยาเอง',
      'เกิด ADR ได้แก่ EPS สั่น เกร็ง',
      'เกิด Drug interaction (DI)',
      'Subtherapeutic Dose',
      'Overdosage',
      'Unnecessary Drug Therapy',
      'Need Additional Therapy',
      'Safety Monitoring'
    ];
    const presentDomains = monthlyDtps.map(d => d.domain);
    const extra = presentDomains.filter(d => !defaultList.includes(d));
    return [...defaultList, ...Array.from(new Set(extra))];
  }, [monthlyDtps]);

  const domainStats = standardDomains.map(domain => {
    const domainDtps = monthlyDtps.filter(d => {
      if (d.domain === domain) return true;
      if (domain.startsWith('Non adherence') && d.domain === 'Non-adherence') {
        if (domain === 'Non adherence - ลืมกินยา' && (!d.description || d.description.includes('ลืม') || d.description.includes('ขาด'))) return true;
      }
      if (domain.startsWith('เกิด ADR') && (d.domain === 'Adverse Drug Reaction / EPS' || d.domain.includes('ADR'))) return true;
      if (domain.startsWith('เกิด Drug interaction') && (d.domain === 'Drug Interaction' || d.domain.includes('Interaction'))) return true;
      return false;
    });
    const resolved = domainDtps.filter(d => d.status === 'resolved').length;
    const pending = domainDtps.filter(d => d.status === 'pending').length;
    const rate = domainDtps.length > 0 ? Math.round((resolved / domainDtps.length) * 100) : 0;
    return {
      domain,
      count: domainDtps.length,
      resolved,
      pending,
      rate
    };
  }).filter(stat => stat.count > 0 || [
    'Non adherence - ลืมกินยา',
    'Non adherence - กินยาผิดขนาด มากกว่าแพทย์สั่ง',
    'Non adherence - กินยาผิดขนาด น้อยกว่าแพทย์สั่ง',
    'Non adherence - หยุดกินยาเอง',
    'เกิด ADR ได้แก่ EPS สั่น เกร็ง',
    'เกิด Drug interaction (DI)'
  ].includes(stat.domain));

  // Filtered patient list for table view
  const displayPatients = activePatientsInMonth.filter(p => {
    if (filterGroup !== 'all' && p.trackingGroup !== filterGroup) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.hn.includes(q) || p.diagnosis.toLowerCase().includes(q);
    }
    return true;
  });

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Copy Executive Summary text
  const handleCopySummary = () => {
    const text = `📊 สรุปผลการบริบาลเภสัชกรรม คลินิกจิตดี ประจำเดือน ${formatThaiMonth(selectedMonth)}
--------------------------------------------------
1. จำนวนผู้ป่วยจิตเวชที่ได้รับการบริบาล: ${activePatientsInMonth.length} ราย
   - กลุ่มเยี่ยมบ้าน (Home Visit): ${homeVisitGroupPatients.length} ราย (${Math.round((homeVisitGroupPatients.length / Math.max(1, activePatientsInMonth.length)) * 100)}%)
   - กลุ่ม Telemed: ${telemedGroupPatients.length} ราย (${Math.round((telemedGroupPatients.length / Math.max(1, activePatientsInMonth.length)) * 100)}%)
   - กลุ่มคลินิก/DRPs: ${clinicGroupPatients.length} ราย (${Math.round((clinicGroupPatients.length / Math.max(1, activePatientsInMonth.length)) * 100)}%)
2. การแก้ไขปัญหาการใช้ยา (DRPs):
   - ค้นพบ DRPs รวม: ${monthlyDtps.length} เรื่อง
   - แก้ไขปัญหาสำเร็จแล้ว: ${resolvedDtps.length} เรื่อง (${dtpResolutionRate}%)
   - อยู่ระหว่างติดตาม: ${pendingDtps.length} เรื่อง
3. คะแนนความร่วมมือในการใช้ยา (Adherence) เฉลี่ย: ${avgAdherence}%
   - ผู้ป่วยที่มีความร่วมมือดี (≥ 80%): ${highAdherenceCount} ราย
4. การออกเยี่ยมบ้าน: ${monthlyHomeVisits.length} ครั้ง
5. การติดตามผ่าน Telemed: ${monthlyTelemeds.length} ครั้ง
6. การตรวจติดตามความปลอดภัย & Metabolic: ${monthlyMetabolics.length} ราย
--------------------------------------------------
จัดทำโดย: กลุ่มงานเภสัชกรรม คลินิกจิตดี (Jit-Dee Clinic)`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['HN', 'ชื่อผู้ป่วย', 'กลุ่มการดูแล', 'การวินิจฉัย', 'ระดับความเสี่ยง', 'Adherence (%)', 'วันนัดถัดไป (วัน/เดือน/ปี พ.ศ.)'];
    const rows = activePatientsInMonth.map(p => [
      p.hn,
      `"${p.name}"`,
      p.trackingGroup === 'home_visit' ? 'เยี่ยมบ้าน' : p.trackingGroup === 'telemed' ? 'Telemed' : 'คลินิก/DRPs',
      `"${p.diagnosis}"`,
      p.riskLevel,
      p.adherenceScore,
      p.nextAppointment ? formatAppointmentDate(p.nextAppointment, 'numeric') : ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JitDee_Monthly_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] shadow-2xl border border-rose-100 flex flex-col overflow-hidden">
        {/* Modal Top Bar (Non-printable controls) */}
        <div className="px-5 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50/60 via-white to-sky-50/60 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-800 leading-tight">
                  Dashboard สรุปผลการบริบาลเภสัชกรรม คลินิกจิตดี
                </h2>
                <span className="text-[11px] bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                  รายเดือน / สรุปผลงาน
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                สรุปตัวชี้วัดผลการดำเนินงานและสถิติการบริบาลทางเภสัชกรรม เพื่อดึงสรุปผลงานระดับโรงพยาบาล/PTC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Action Buttons: Copy, Print, Export */}
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
              title="คัดลอกสรุปผลการดำเนินงานเป็นข้อความ"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copiedSummary ? 'คัดลอกแล้ว!' : 'คัดลอกสรุป'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
              title="ส่งออกรายงานเป็นไฟล์ CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
              title="พิมพ์รายงานสรุปผลงานอย่างเป็นทางการ"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">พิมพ์รายงาน</span>
            </button>

            {onSyncNow && (
              <button
                onClick={onSyncNow}
                className="px-3 py-1.5 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                title="ซิงค์ข้อมูลกับ Google Sheets"
              >
                <span>ซิงค์ Sheet</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Selector Filter Bar */}
        <div className="px-5 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:border-b-2 print:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-600" />
              เลือกรอบเดือนที่ต้องการสรุป:
            </span>

            {/* Previous Month */}
            <button
              onClick={handlePrevMonth}
              disabled={currentIdx >= availableMonths.length - 1}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-600 transition"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-white border border-sky-300 text-sky-950 px-3 py-1.5 rounded-xl shadow-2xs focus:ring-2 focus:ring-sky-400 focus:outline-none cursor-pointer"
            >
              <option value="all">📊 สรุปภาพรวมสะสมทั้งหมด (All Records / ผู้ป่วยทั้งหมด)</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {formatThaiMonth(m)} {m === currentYM ? '⭐ (เดือนปัจจุบัน)' : ''}
                </option>
              ))}
            </select>

            {/* Next Month */}
            <button
              onClick={handleNextMonth}
              disabled={currentIdx <= 0}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-600 transition"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Switch Buttons */}
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => setSelectedMonth('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                  selectedMonth === 'all'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200'
                }`}
                title="แสดงข้อมูลสรุปผลงานสะสมทุกเดือนทั้งหมด"
              >
                📊 ภาพรวมทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setSelectedMonth(currentYM)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                  selectedMonth === currentYM
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200'
                }`}
                title="สลับไปดูข้อมูลประจำเดือนปัจจุบัน"
              >
                📅 เดือนปัจจุบัน
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              สถานะ: <strong className="text-slate-900">{formatThaiMonth(selectedMonth)}</strong>
              <span className="text-slate-400 ml-1.5 font-normal">({activePatientsInMonth.length} ราย)</span>
            </span>
          </div>
        </div>

        {/* Printable & Scrollable Dashboard Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          {/* Printable Header (Visible only when printing) */}
          <div className="hidden print:block text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold text-slate-900">
              รายงานสรุปผลการดำเนินงานการบริบาลทางเภสัชกรรม ผู้ป่วยคลินิกจิตดี (Jit-Dee Clinic)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              ประจำเดือน: {formatThaiMonth(selectedMonth)} • กลุ่มงานเภสัชกรรมและเครือข่ายบริการสุขภาพจิต
            </p>
          </div>

          {/* Informative Fallback Notice when a month has no specific appointments */}
          {isShowingAllAsFallback && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>ข้อสังเกต:</strong> ในรอบเดือน <strong>{formatThaiMonth(selectedMonth)}</strong> ยังไม่มีนัดหมายหรือกิจกรรมเฉพาะเจาะจง ระบบจึงแสดงข้อมูลผู้ป่วยทั้งหมดในความดูแลของคลินิกจิตดี (<strong>{patients.length} ราย</strong>) ให้ตรวจสอบ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMonth('all')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shrink-0 self-start sm:self-auto transition"
              >
                📊 ดูภาพรวมสะสมทั้งหมด
              </button>
            </div>
          )}

          {/* 1. Summary KPI Cards (ตัวชี้วัดผลการดำเนินงาน 4 เสาหลัก) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* KPI 1: ผู้ป่วยที่ได้รับการบริบาล */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-2xl border border-indigo-150 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">ผู้ป่วยที่ได้รับการบริบาล</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-950 mt-1">
                {activePatientsInMonth.length} <span className="text-xs font-semibold text-slate-500">ราย</span>
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-indigo-100 flex items-center justify-between flex-wrap gap-1">
                <span>🏠 เยี่ยมบ้าน {homeVisitGroupPatients.length}</span>
                <span>📱 Telemed {telemedGroupPatients.length}</span>
                <span>🏥 คลินิก/DRPs {clinicGroupPatients.length}</span>
              </div>
            </div>

            {/* KPI 2: DRPs Resolution Rate */}
            <div className="bg-gradient-to-br from-amber-50/80 to-white p-4 rounded-2xl border border-amber-150 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">อัตราแก้ไข DRPs สำเร็จ</span>
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {dtpResolutionRate}%
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-amber-100 flex items-center justify-between">
                <span>พบรวม: {monthlyDtps.length} เรื่อง</span>
                <span className="text-teal-700 font-bold">แก้ไขแล้ว {resolvedDtps.length}</span>
              </div>
            </div>

            {/* KPI 3: Adherence Rate */}
            <div className="bg-gradient-to-br from-teal-50/80 to-white p-4 rounded-2xl border border-teal-150 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900">ความร่วมมือใช้ยาเฉลี่ย</span>
                <Pill className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-teal-950 mt-1">
                {avgAdherence}%
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-teal-100 flex items-center justify-between">
                <span>High Adherence (≥80%):</span>
                <strong className="text-teal-700">{highAdherenceCount} ราย</strong>
              </div>
            </div>

            {/* KPI 4: Home Visits & Telemed Activities */}
            <div className="bg-gradient-to-br from-rose-50/80 to-white p-4 rounded-2xl border border-rose-150 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">กิจกรรมบริการเชิงรุก</span>
                <Activity className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-950 mt-1">
                {monthlyHomeVisits.length + monthlyTelemeds.length} <span className="text-xs font-semibold text-slate-500">ครั้ง</span>
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-rose-100 flex items-center justify-between">
                <span>เยี่ยมบ้าน: {monthlyHomeVisits.length} ครั้ง</span>
                <span>Telemed: {monthlyTelemeds.length} ครั้ง</span>
              </div>
            </div>
          </div>

          {/* 2. Breakdown by 3 Patient Tracking Groups (เยี่ยมบ้าน, Telemed, คลินิก/DRPs) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                สัดส่วนการดูแลผู้ป่วยจำแนก 3 กลุ่ม (เยี่ยมบ้าน, Telemed, คลินิก/DRPs)
              </h3>
              <span className="text-[11px] text-slate-500">
                รวมทั้งหมด {activePatientsInMonth.length} ราย
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Group 1: เยี่ยมบ้าน */}
              <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-150 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-indigo-600" />
                    กลุ่มเยี่ยมบ้าน (Home Visit)
                  </span>
                  <span className="text-sm font-black text-indigo-900">
                    {homeVisitGroupPatients.length} ราย
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full" 
                    style={{ width: `${Math.round((homeVisitGroupPatients.length / Math.max(1, activePatientsInMonth.length)) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ผู้ป่วยที่มีปัญหาขาดนัด ขาดยา หรือต้องการประเมินสภาพแวดล้อมที่บ้าน พร้อมคัดแยกยาเหลือใช้
                </p>
              </div>

              {/* Group 2: Telemed */}
              <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-150 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-teal-950 flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    กลุ่ม Telemed (Telepsychiatry)
                  </span>
                  <span className="text-sm font-black text-teal-900">
                    {telemedGroupPatients.length} ราย
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-600 h-full rounded-full" 
                    style={{ width: `${Math.round((telemedGroupPatients.length / Math.max(1, activePatientsInMonth.length)) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ติดตามอาการทางโทรศัพท์ เฝ้าระวังผลข้างเคียงช่วงเริ่มยาใหม่ และเสริมแรงจูงใจในการทานยาต่อเนื่อง
                </p>
              </div>

              {/* Group 3: คลินิก/DRPs */}
              <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-150 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-rose-500" />
                    กลุ่มคลินิก/DRPs (Clinic & DRPs)
                  </span>
                  <span className="text-sm font-black text-rose-900">
                    {clinicGroupPatients.length} ราย
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full" 
                    style={{ width: `${Math.round((clinicGroupPatients.length / Math.max(1, activePatientsInMonth.length)) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ตรวจติดตามทางคลินิกโรงพยาบาล ตรวจระดับยาในเลือด (TDM Clozapine/Lithium) และประเมิน DRPs เชิงลึก
                </p>
              </div>
            </div>
          </div>

          {/* 3. DRPs Analysis by 8 Domains (ตารางวิเคราะห์ปัญหาการใช้ยา 8 โดเมน) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  การจำแนกปัญหาการใช้ยา (Drug-Related Problems: DRPs) ประจำเดือน
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  จำแนกตามมาตรฐาน 8 หมวดปัญหาทางเภสัชกรรม พร้อมอัตราความสำเร็จในการแก้ไขปัญหา
                </p>
              </div>

              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {monthlyDtps.length > 0 ? (
                  `พบรวม ${monthlyDtps.length} เรื่อง • แก้ไขสำเร็จ ${resolvedDtps.length} เรื่อง (${dtpResolutionRate}%)`
                ) : (
                  <span>
                    ในเดือนนี้ยังไม่พบ DRPs {dtps.length > 0 && `(สะสมทั้งคลินิก ${dtps.length} เรื่อง)`}
                    {dtps.length > 0 && selectedMonth !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedMonth('all')}
                        className="ml-1.5 underline text-sky-700 hover:text-sky-900 font-bold cursor-pointer"
                      >
                        ดูทั้งหมด
                      </button>
                    )}
                  </span>
                )}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">หมวดปัญหาการใช้ยา (DRP Domain)</th>
                    <th className="py-2.5 px-3 text-center">จำนวนที่พบ (เรื่อง)</th>
                    <th className="py-2.5 px-3 text-center">สัดส่วน (%)</th>
                    <th className="py-2.5 px-3 text-center">แก้ไขสำเร็จ (Resolved)</th>
                    <th className="py-2.5 px-3 text-center">รอดำเนินการ (Pending)</th>
                    <th className="py-2.5 px-3 text-right">อัตราความสำเร็จ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {domainStats.map((d, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/20">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {d.domain}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                        {d.count}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">
                        {monthlyDtps.length > 0 ? `${Math.round((d.count / monthlyDtps.length) * 100)}%` : '0%'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-teal-700 font-bold">
                        {d.resolved}
                      </td>
                      <td className="py-2.5 px-3 text-center text-amber-700 font-bold">
                        {d.pending}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {d.count > 0 ? (
                          <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            d.rate >= 80 ? 'bg-teal-100 text-teal-800' : d.rate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {d.rate}%
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Active Patient Register for the Month */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-sky-600" />
                  ทะเบียนรายชื่อผู้ป่วยที่ได้รับการบริบาลทางเภสัชกรรมในรอบเดือนนี้
                </h3>
                <p className="text-[11px] text-slate-500">
                  แสดง {displayPatients.length} / {activePatientsInMonth.length} ราย
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2 print:hidden flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, HN, โรค..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-400 w-44"
                  />
                </div>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold text-slate-600">
                  <button
                    onClick={() => setFilterGroup('all')}
                    className={`px-2 py-1 rounded-lg transition ${filterGroup === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setFilterGroup('home_visit')}
                    className={`px-2 py-1 rounded-lg transition ${filterGroup === 'home_visit' ? 'bg-indigo-600 text-white shadow-2xs' : 'hover:text-indigo-600'}`}
                  >
                    เยี่ยมบ้าน
                  </button>
                  <button
                    onClick={() => setFilterGroup('telemed')}
                    className={`px-2 py-1 rounded-lg transition ${filterGroup === 'telemed' ? 'bg-teal-600 text-white shadow-2xs' : 'hover:text-teal-600'}`}
                  >
                    Telemed
                  </button>
                  <button
                    onClick={() => setFilterGroup('clinic_dtp')}
                    className={`px-2 py-1 rounded-lg transition ${filterGroup === 'clinic_dtp' ? 'bg-rose-400 text-white shadow-2xs' : 'hover:text-rose-600'}`}
                  >
                    คลินิก/DRPs
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">HN</th>
                    <th className="py-2.5 px-3">ชื่อ-สกุลผู้ป่วย</th>
                    <th className="py-2.5 px-3">กลุ่มการดูแล</th>
                    <th className="py-2.5 px-3">การวินิจฉัยหลัก</th>
                    <th className="py-2.5 px-3 text-center">Adherence</th>
                    <th className="py-2.5 px-3">สถานะ DRPs ในเดือนนี้</th>
                    <th className="py-2.5 px-3 text-right print:hidden">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 bg-slate-50/50">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto text-slate-500">
                          <AlertTriangle className="w-8 h-8 text-amber-500" />
                          <p className="font-bold text-slate-800 text-sm">ไม่พบข้อมูลผู้ป่วยตามเงื่อนไขที่เลือก</p>
                          <p className="text-xs text-slate-500">
                            {searchQuery 
                              ? `ไม่พบผลการค้นหาสำหรับ "${searchQuery}"` 
                              : `ในรอบเดือน ${formatThaiMonth(selectedMonth)} ยังไม่มีรายชื่อผู้ป่วยตรงตามตัวกรอง`}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                ล้างคำค้นหา
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => { setSelectedMonth('all'); setFilterGroup('all'); setSearchQuery(''); }}
                              className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                            >
                              📊 แสดงสรุปภาพรวมทั้งหมด ({patients.length} ราย)
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayPatients.map(p => {
                      const pDtps = monthlyDtps.filter(d => d.patientId === p.id);
                      const pPending = pDtps.filter(d => d.status === 'pending');
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{p.hn}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {p.name}
                            {p.statusTag && (
                              <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                {p.statusTag}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {p.trackingGroup === 'home_visit' ? (
                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200">
                                🏠 เยี่ยมบ้าน
                              </span>
                            ) : p.trackingGroup === 'telemed' ? (
                              <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-200">
                                📱 Telemed
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">
                                🏥 คลินิก/DRPs
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{p.diagnosis}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`font-bold ${
                              p.adherenceScore >= 80 ? 'text-teal-600' : p.adherenceScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {p.adherenceScore}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {pDtps.length > 0 ? (
                              <span className={`text-[11px] font-semibold ${pPending.length > 0 ? 'text-amber-700' : 'text-teal-700'}`}>
                                พบ {pDtps.length} เรื่อง {pPending.length > 0 ? `(ค้าง ${pPending.length})` : '(แก้ไขครบ)'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">ไม่พบ DRPs</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right print:hidden">
                            {onSelectPatient && (
                              <button
                                onClick={() => {
                                  onSelectPatient(p.id);
                                  onClose();
                                }}
                                className="text-xs text-sky-600 hover:text-sky-800 font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <span>เปิดดูเคส</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Printable Official Signature Section (Visible only when printing) */}
          <div className="hidden print:block pt-8 mt-8 border-t border-slate-300">
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-12">
                <p>ลงชื่อ.......................................................... ผู้รายงาน</p>
                <div>
                  <p>(ภญ.สุพิชฌาย์ เจริญสุข)</p>
                  <p className="text-slate-500">เภสัชกรชำนาญการ ผู้รับผิดชอบคลินิกจิตดี</p>
                </div>
              </div>
              <div className="space-y-12">
                <p>ลงชื่อ.......................................................... ผู้รับรองรายงาน</p>
                <div>
                  <p>(นพ.สมศักดิ์ สุขภาพจิต)</p>
                  <p className="text-slate-500">ประธานคณะกรรมการเภสัชกรรมและการบำบัด (PTC)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>
            ข้อมูลประมวลผล ณ วันที่: <strong>{new Date().toLocaleDateString('th-TH')}</strong> • คลินิกจิตดี (Jit-Dee Clinic)
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
