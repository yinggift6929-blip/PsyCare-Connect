import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldAlert, 
  FlaskConical, 
  Check, 
  ChevronDown, 
  ClipboardCheck, 
  HeartPulse, 
  Calendar, 
  Home, 
  PhoneCall, 
  Building2, 
  Search, 
  Sparkles, 
  User, 
  CalendarClock, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  Patient, 
  Medication, 
  DtpRecord, 
  SoapNote, 
  SafetyLog, 
  Mars5Assessment, 
  DiepssAssessment, 
  MetabolicRecord,
  DtpDomain,
  PatientTrackingGroup
} from '../types.ts';
import { STANDARD_DRUG_GROUPS } from './modals/AddMedicationModal.tsx';
import { GenderBadge } from './common/GenderIcon.tsx';
import { formatAppointmentDate } from '../utils/dateUtils.ts';
import { ThaiAppointmentDatePicker } from './common/ThaiAppointmentDatePicker.tsx';

interface PharmacistCareTabProps {
  patient: Patient;
  medications: Medication[];
  dtps: DtpRecord[];
  soapNotes?: SoapNote[];
  safetyLogs: SafetyLog[];
  mars5Records: Mars5Assessment[];
  diepssRecords: DiepssAssessment[];
  metabolicRecords: MetabolicRecord[];
  onOpenAddMed: () => void;
  onDeleteMed: (med: Medication) => void;
  onOpenAddDtp: () => void;
  onToggleDtpStatus: (dtpId: string) => void;
  onSaveDtp?: (dtp: Partial<DtpRecord>) => void;
  onSaveMedication?: (med: Partial<Medication>) => void;
  onOpenMars5: () => void;
  onOpenDiepss: () => void;
  onOpenMetabolic: () => void;
  onSaveSoapNote?: (soap: { subjective: string; objective: string; assessment: string; plan: string }) => void;
  onSaveSafetyLog: (safety: Partial<SafetyLog>) => void;
  onSaveMars5?: (record: Partial<Mars5Assessment>, updatedAdherencePercent?: number) => void;
  onUpdateAppointment?: (patientId: string, appointment: { nextAppointment?: string; nextAppointmentType?: 'home_visit' | 'telemed' | 'clinic'; nextAppointmentObjective?: string }) => void;
}

// 6 Required DRP Topics (Requirement 2)
export const DRP_REQUIRED_TOPICS = [
  '2.1 Non adherence - ลืมกินยา',
  '2.2 Non adherence - กินยาผิดขนาด มากกว่าแพทย์สั่ง',
  '2.3 Non adherence - กินยาผิดขนาด น้อยกว่าแพทย์สั่ง',
  '2.4 Non adherence - หยุดกินยาเอง',
  '2.5 เกิด ADR ได้แก่ EPS สั่น เกร็ง',
  '2.6 เกิด Drug interaction (DI)'
] as const;

export const PharmacistCareTab: React.FC<PharmacistCareTabProps> = ({
  patient,
  medications,
  dtps,
  soapNotes: _soapNotes,
  safetyLogs,
  mars5Records,
  diepssRecords,
  metabolicRecords,
  onOpenAddMed,
  onDeleteMed,
  onOpenAddDtp,
  onToggleDtpStatus,
  onSaveDtp,
  onSaveMedication,
  onOpenMars5,
  onOpenDiepss,
  onOpenMetabolic,
  onSaveSoapNote: _onSaveSoapNote,
  onSaveSafetyLog,
  onSaveMars5,
  onUpdateAppointment
}) => {
  const patientMeds = medications.filter(m => m.patientId === patient.id);
  const patientDtps = dtps.filter(d => d.patientId === patient.id);
  const latestSafety = safetyLogs.filter(s => s.patientId === patient.id)[0];
  const patientMars5 = mars5Records.filter(m => m.patientId === patient.id);
  const latestMars5 = patientMars5[0];
  const patientDiepss = diepssRecords.filter(d => d.patientId === patient.id);
  const latestDiepss = patientDiepss[0];
  const patientMetabolic = metabolicRecords.filter(met => met.patientId === patient.id);
  const latestMetabolic = patientMetabolic[0];

  // ==========================================
  // Section 1 State: Quick Add Medication (Req 3 & 4)
  // ==========================================
  const [showQuickAddMed, setShowQuickAddMed] = useState(false);
  const [selectedPresetMed, setSelectedPresetMed] = useState<string>('Risperidone 2 mg');
  const [customMedName, setCustomMedName] = useState('');
  const [medCategory, setMedCategory] = useState<any>('Antipsychotic');
  // 6 slots + prn
  const [doseTab, setDoseTab] = useState('1'); // ช่อง 1
  const [mealTiming, setMealTiming] = useState<'หลังอาหาร' | 'ก่อนอาหาร' | 'พร้อมอาหาร' | 'ก่อนนอน'>('หลังอาหาร'); // ช่อง 2
  const [takeMorning, setTakeMorning] = useState(false); // ช่อง 3
  const [takeNoon, setTakeNoon] = useState(false); // ช่อง 4
  const [takeEvening, setTakeEvening] = useState(false); // ช่อง 5
  const [takeBedtime, setTakeBedtime] = useState(true); // ช่อง 6
  const [takePrn, setTakePrn] = useState(false); // เวลามีอาการ (prn)
  const [customSig, setCustomSig] = useState('');
  const [isEditingSigManually, setIsEditingSigManually] = useState(false);
  const [medAdherence, setMedAdherence] = useState('100');
  const [medSavedToast, setMedSavedToast] = useState(false);

  // ==========================================
  // Section 1.2 State: Adherence Assessment (MARS-5) after medication list (Requirement 4.1)
  // ==========================================
  const [showInlineMarsForm, setShowInlineMarsForm] = useState(false);
  const [marsQ1, setMarsQ1] = useState(5); // 1. ฉันลืมกินยา
  const [marsQ2, setMarsQ2] = useState(5); // 2. ฉันหยุดกินยาเองชั่วคราว
  const [marsQ3, setMarsQ3] = useState(5); // 3. ฉันหยุดกินยาเองเป็นบางช่วง
  const [marsQ4, setMarsQ4] = useState(5); // 4. ฉันข้ามการกินยาบางมื้อ
  const [marsQ5, setMarsQ5] = useState(5); // 5. ฉันกินยาน้อยกว่าที่หมอสั่ง
  const [marsEvaluator, setMarsEvaluator] = useState('ภญ.สุพิชฌาย์ (เภสัชกรคลินิก)');
  const [marsNotes, setMarsNotes] = useState('');
  const [adherenceSavedToast, setAdherenceSavedToast] = useState(false);

  const totalMarsScore = marsQ1 + marsQ2 + marsQ3 + marsQ4 + marsQ5;
  const marsAdherencePercent = Math.round((totalMarsScore / 25) * 100);
  const isHighAdherence = totalMarsScore >= 23;

  const handleInlineMarsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interpretationText = isHighAdherence
      ? `อยู่ในเกณฑ์ดี (High Adherence - ได้ ${totalMarsScore}/25 คะแนน)`
      : `อยู่ในเกณฑ์ปานกลาง/ต่ำ (Moderate-Low Adherence - ได้ ${totalMarsScore}/25 คะแนน)`;

    if (onSaveMars5) {
      onSaveMars5({
        patientId: patient.id,
        hn: patient.hn,
        date: new Date().toISOString().split('T')[0],
        q1: marsQ1,
        q2: marsQ2,
        q3: marsQ3,
        q4: marsQ4,
        q5: marsQ5,
        totalScore: totalMarsScore,
        interpretation: interpretationText,
        evaluatedBy: marsEvaluator.trim() || 'เภสัชกร',
        notes: marsNotes.trim() || undefined
      }, marsAdherencePercent);
    }
    setAdherenceSavedToast(true);
    setShowInlineMarsForm(false);
    setTimeout(() => setAdherenceSavedToast(false), 3500);
  };

  useEffect(() => {
    if (isEditingSigManually) return;
    const tabsStr = doseTab ? `${doseTab} เม็ด` : '1 เม็ด';
    const times: string[] = [];
    if (takeMorning) times.push('เช้า');
    if (takeNoon) times.push('กลางวัน');
    if (takeEvening) times.push('เย็น');
    if (takeBedtime) times.push('ก่อนนอน');
    if (takePrn) times.push('เวลามีอาการ (prn)');

    let generated = '';
    if (mealTiming === 'ก่อนนอน' && times.length === 1 && times[0] === 'ก่อนนอน') {
      generated = `รับประทานครั้งละ ${tabsStr} วันละ 1 ครั้ง ก่อนนอน`;
    } else if (times.length === 1 && times[0] === 'เวลามีอาการ (prn)') {
      const mealStr = mealTiming === 'ก่อนนอน' ? '' : ` ${mealTiming}`;
      generated = `รับประทานครั้งละ ${tabsStr}${mealStr} เวลามีอาการ (prn)`;
    } else {
      const timesStr = times.length > 0 ? times.join(', ') : 'ตามแพทย์สั่ง';
      const mealStr = mealTiming === 'ก่อนนอน' ? '' : ` ${mealTiming}`;
      generated = `รับประทานครั้งละ ${tabsStr}${mealStr} ${timesStr}`;
    }
    setCustomSig(generated);
  }, [doseTab, mealTiming, takeMorning, takeNoon, takeEvening, takeBedtime, takePrn, isEditingSigManually]);

  const handleQuickAddMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMedName = selectedPresetMed === 'custom' ? customMedName.trim() : selectedPresetMed;
    if (!finalMedName) {
      alert('กรุณาเลือกหรือระบุชื่อยา');
      return;
    }
    if (onSaveMedication) {
      onSaveMedication({
        patientId: patient.id,
        hn: patient.hn,
        name: finalMedName,
        category: medCategory,
        sig: customSig.trim(),
        indication: 'ควบคุมอาการทางจิตเวชและปรับสมดุล',
        adherence: Math.min(100, Math.max(0, parseInt(medAdherence) || 100)),
        startDate: new Date().toISOString().split('T')[0]
      });
      setMedSavedToast(true);
      setTimeout(() => setMedSavedToast(false), 3000);
      setShowQuickAddMed(false);
    } else {
      onOpenAddMed();
    }
  };

  // ==========================================
  // Section 2 State: DRPs Search & Fast Record (Req 1 & 2 & 3)
  // ==========================================
  const [drpSearch, setDrpSearch] = useState('');
  const [selectedDrpTopic, setSelectedDrpTopic] = useState<string>(DRP_REQUIRED_TOPICS[0]);
  const [drpCauseDrug, setDrpCauseDrug] = useState('');
  const [drpDescription, setDrpDescription] = useState('');
  const [drpIntervention, setDrpIntervention] = useState('');
  const [drpSavedToast, setDrpSavedToast] = useState(false);
  const [showDrpForm, setShowDrpForm] = useState(false);

  // Requirement 3: 2-Part DRP Choice ("ไม่มี DRP" vs "มี DRP")
  const [drpStatusChoice, setDrpStatusChoice] = useState<'no_drp' | 'has_drp' | null>(null);
  const [noDrpNotes, setNoDrpNotes] = useState('ประเมินแล้วไม่พบปัญหาจากการใช้ยา (No DRP) ผู้ป่วยรับประทานยาได้ตามแพทย์สั่งอย่างถูกต้องสม่ำเสมอ ไม่พบอาการไม่พึงประสงค์ สั่นเกร็ง หรืออันตรกิริยายา');

  const handleSaveNoDrp = () => {
    if (onSaveDtp) {
      onSaveDtp({
        patientId: patient.id,
        hn: patient.hn,
        date: new Date().toISOString().split('T')[0],
        domain: 'No DRP (ไม่พบปัญหาจากการใช้ยา)',
        description: noDrpNotes.trim() || 'ประเมินแล้วไม่พบปัญหาจากการใช้ยา ผู้ป่วยรับประทานยาได้ถูกต้องตามแพทย์สั่ง และไม่พบอาการไม่พึงประสงค์',
        causeDrug: '-',
        intervention: 'ให้คำแนะนำการรับประทานยาต่อเนื่อง และเฝ้าระวังอาการผิดปกติ',
        status: 'resolved',
        recordedBy: 'ภญ.สุภิตา ทองขำ (เภสัชกรชำนาญการ)'
      });
      setDrpSavedToast(true);
      setTimeout(() => setDrpSavedToast(false), 3000);
      setDrpStatusChoice(null);
    }
  };

  const handleSaveQuickDrp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drpDescription.trim() || !drpIntervention.trim()) {
      alert('กรุณากรอกรายละเอียดปัญหาและการแก้ไข (Intervention)');
      return;
    }
    // Clean domain label
    const cleanDomain = selectedDrpTopic.replace(/^2\.[1-6]\s*/, '') as DtpDomain;

    if (onSaveDtp) {
      onSaveDtp({
        patientId: patient.id,
        hn: patient.hn,
        date: new Date().toISOString().split('T')[0],
        domain: cleanDomain,
        description: drpDescription.trim(),
        causeDrug: drpCauseDrug.trim(),
        intervention: drpIntervention.trim(),
        status: 'pending',
        recordedBy: 'ภญ.สุภิตา ทองขำ (เภสัชกรชำนาญการ)'
      });
      setDrpDescription('');
      setDrpCauseDrug('');
      setDrpIntervention('');
      setShowDrpForm(false);
      setDrpSavedToast(true);
      setTimeout(() => setDrpSavedToast(false), 3000);
    } else {
      onOpenAddDtp();
    }
  };

  const filteredPatientDtps = patientDtps.filter(d => {
    if (!drpSearch.trim()) return true;
    const q = drpSearch.toLowerCase();
    return (
      d.domain.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.causeDrug.toLowerCase().includes(q) ||
      d.intervention.toLowerCase().includes(q)
    );
  });

  // ==========================================
  // Section 4 State: Assessments (ADR, Safety, Metabolic)
  // ==========================================
  const [wbcInput, setWbcInput] = useState(latestSafety?.clozapineWbc ? String(latestSafety.clozapineWbc) : '');
  const [ancInput, setAncInput] = useState(latestSafety?.clozapineAnc ? String(latestSafety.clozapineAnc) : '');
  const [lithiumInput, setLithiumInput] = useState(latestSafety?.lithiumLevel ? String(latestSafety.lithiumLevel) : '');
  const [epsInput, setEpsInput] = useState(latestSafety?.epsSymptoms || 'ไม่พบอาการสั่นหรือเกร็ง (No EPS)');
  const [safetySavedToast, setSafetySavedToast] = useState(false);

  const handleSaveSafety = () => {
    onSaveSafetyLog({
      clozapineWbc: wbcInput ? parseFloat(wbcInput) : undefined,
      clozapineAnc: ancInput ? parseFloat(ancInput) : undefined,
      lithiumLevel: lithiumInput ? parseFloat(lithiumInput) : undefined,
      epsSymptoms: epsInput,
      date: new Date().toISOString().split('T')[0]
    });
    setSafetySavedToast(true);
    setTimeout(() => setSafetySavedToast(false), 3000);
  };

  const ancValue = ancInput ? parseFloat(ancInput) : latestSafety?.clozapineAnc;
  let clozapineZone: 'green' | 'yellow' | 'red' | 'unknown' = 'unknown';
  if (ancValue !== undefined) {
    if (ancValue >= 1500) clozapineZone = 'green';
    else if (ancValue >= 1000) clozapineZone = 'yellow';
    else clozapineZone = 'red';
  }

  // ==========================================
  // Section 5 State: Follow-up Appointment Recording (Req 1)
  // ==========================================
  const [nextAppDate, setNextAppDate] = useState(patient.nextAppointment || '');
  const [nextAppType, setNextAppType] = useState<'home_visit' | 'telemed' | 'clinic'>(
    patient.nextAppointmentType || (patient.trackingGroup === 'home_visit' ? 'home_visit' : patient.trackingGroup === 'telemed' ? 'telemed' : 'clinic')
  );
  const [nextAppObjective, setNextAppObjective] = useState(patient.nextAppointmentObjective || '');
  const [appointmentSavedToast, setAppointmentSavedToast] = useState(false);

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextAppDate) {
      alert('กรุณาเลือกวันนัดหมายติดตาม');
      return;
    }
    if (onUpdateAppointment) {
      onUpdateAppointment(patient.id, {
        nextAppointment: nextAppDate,
        nextAppointmentType: nextAppType,
        nextAppointmentObjective: nextAppObjective.trim()
      });
      setAppointmentSavedToast(true);
      setTimeout(() => setAppointmentSavedToast(false), 3000);
    }
  };

  const getGroupBadge = (group: PatientTrackingGroup) => {
    if (group === 'home_visit') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
          <Home className="w-3 h-3 text-indigo-600" /> เยี่ยมบ้าน
        </span>
      );
    }
    if (group === 'telemed') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-lg border border-teal-200 shadow-2xs">
          <PhoneCall className="w-3 h-3 text-teal-600" /> Telemed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-lg border border-rose-200 shadow-2xs">
        <Building2 className="w-3 h-3 text-rose-600" /> คลินิก/DRPs
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ========================================================
          1. ข้อมูลผู้ป่วย & บัญชียาที่ผู้ป่วยใช้ (Requirement 1, 3, 4)
         ======================================================== */}
      <section className="bg-white rounded-3xl shadow-xs border border-rose-100 p-5 space-y-4">
        {/* Header Bar: ข้อมูลผู้ป่วย */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-200 to-pink-100 text-rose-800 flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
              <User className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  ขั้นตอนที่ 1
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  ข้อมูลผู้ป่วย, บัญชียา & ประเมินความร่วมมือ (Patient Profile, Medications & Adherence)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>ผู้ป่วย: <strong className="text-slate-800">{patient.name}</strong></span>
                <span>•</span>
                <span>HN: <strong className="font-mono text-rose-700">{patient.hn}</strong></span>
                <span>•</span>
                <span>อายุ {patient.age} ปี</span>
                <GenderBadge gender={patient.gender} />
                <span>•</span>
                <span>บันทึกรายการยาและประเมินความร่วมมือ (Adherence)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {getGroupBadge(patient.trackingGroup || 'clinic_dtp')}
            <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${
              patient.riskLevel === 'high'
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : patient.riskLevel === 'moderate'
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-teal-100 text-teal-800 border-teal-200'
            }`}>
              {patient.riskLevel === 'high' ? 'ความเสี่ยงสูง' : patient.riskLevel === 'moderate' ? 'ความเสี่ยงปานกลาง' : 'ความเสี่ยงต่ำ'}
            </span>
          </div>
        </div>

        {/* Medication Table Header & Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 text-teal-700 rounded-xl">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                รายการยาที่ผู้ป่วยใช้ ({patientMeds.length} รายการ)
              </h4>
              <p className="text-[11px] text-slate-500">
                แบ่งออกเป็น 3 กลุ่มยาจิตเวชหลัก พร้อมช่อง 6 ช่องระบุวิธีการรับประทาน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickAddMed(!showQuickAddMed)}
              className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              <span>{showQuickAddMed ? 'ปิดแถบเพิ่มยา' : '+ เพิ่มยา (3 กลุ่ม & 6 ช่อง)'}</span>
            </button>
            <button
              onClick={onOpenAddMed}
              className="text-xs bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-xl font-medium transition shadow-2xs hidden sm:flex items-center gap-1"
            >
              <span>เปิดฟอร์มเต็ม</span>
            </button>
          </div>
        </div>

        {/* Quick Add Medication Box (Requirements 3 & 4) */}
        {showQuickAddMed && (
          <form 
            onSubmit={handleQuickAddMedSubmit} 
            className="p-4 bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-white rounded-2xl border border-rose-200 space-y-3.5 shadow-xs animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-rose-150">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                เพิ่มยา: เลือกจาก 3 กลุ่มยามาตรฐาน หรือระบุเอง พร้อมติ๊ก 6 ช่องวิธีรับประทาน
              </span>
              <button 
                type="button" 
                onClick={() => setShowQuickAddMed(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium"
              >
                ย่อเก็บ
              </button>
            </div>

            {/* Requirement 3: 3 Drug Groups Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8">
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  เลือกยาจาก 3 กลุ่มมาตรฐาน (หรือระบุรายการอื่น): *
                </label>
                <select
                  value={selectedPresetMed}
                  onChange={(e) => {
                    setSelectedPresetMed(e.target.value);
                    if (STANDARD_DRUG_GROUPS.antipsychotic.drugs.includes(e.target.value)) {
                      setMedCategory('Antipsychotic');
                    } else if (STANDARD_DRUG_GROUPS.ssri.drugs.includes(e.target.value)) {
                      setMedCategory('Antidepressant');
                    } else if (STANDARD_DRUG_GROUPS.sedative.drugs.includes(e.target.value)) {
                      setMedCategory('Anxiolytic');
                    }
                  }}
                  className="w-full p-2.5 bg-white border border-rose-200 rounded-xl font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-rose-300"
                >
                  <optgroup label="3.1 Antipsychotic drugs">
                    {STANDARD_DRUG_GROUPS.antipsychotic.drugs.map(drug => (
                      <option key={drug} value={drug}>💊 {drug}</option>
                    ))}
                  </optgroup>
                  <optgroup label="3.2 กลุ่มยา SSRIs">
                    {STANDARD_DRUG_GROUPS.ssri.drugs.map(drug => (
                      <option key={drug} value={drug}>💊 {drug}</option>
                    ))}
                  </optgroup>
                  <optgroup label="3.3 กลุ่มยา Sedative">
                    {STANDARD_DRUG_GROUPS.sedative.drugs.map(drug => (
                      <option key={drug} value={drug}>💊 {drug}</option>
                    ))}
                  </optgroup>
                  <optgroup label="รายการยาอื่นๆ">
                    <option value="custom">✏️ รายการยาอื่นๆ (ระบุชื่อยาเอง)</option>
                  </optgroup>
                </select>

                {selectedPresetMed === 'custom' && (
                  <input
                    type="text"
                    required
                    placeholder="พิมพ์ชื่อยาและขนาดยาอื่นๆ เช่น Clozapine 100 mg, Sodium Valproate 200 mg"
                    value={customMedName}
                    onChange={(e) => setCustomMedName(e.target.value)}
                    className="w-full mt-2 p-2 bg-white border border-rose-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-300"
                  />
                )}
              </div>

              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Adherence (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={medAdherence}
                  onChange={(e) => setMedAdherence(e.target.value)}
                  className="w-full p-2.5 bg-white border border-rose-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </div>

            {/* Requirement 4: Sig Builder with prn */}
            <div className="p-3 bg-white rounded-2xl border border-rose-150 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                วิธีใช้ยา: สำหรับติ๊กเลือกวิธีการรับประทาน
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
                {/* ช่อง 1: ใส่เฉพาะตัวเลข ระบุจำนวนเม็ด */}
                <div className="bg-rose-50/40 p-2 rounded-xl border border-rose-200">
                  <label className="block text-[9px] font-bold text-rose-800 mb-0.5">
                    ช่อง 1: เม็ด
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={doseTab}
                    onChange={(e) => setDoseTab(e.target.value)}
                    placeholder="1"
                    className="w-full p-1 text-center font-extrabold text-slate-900 bg-white border border-rose-200 rounded-lg text-xs"
                  />
                </div>

                {/* ช่อง 2: ก่อน/หลังอาหาร */}
                <div className="bg-rose-50/40 p-2 rounded-xl border border-rose-200">
                  <label className="block text-[9px] font-bold text-rose-800 mb-0.5">
                    ช่อง 2: มื้อ
                  </label>
                  <select
                    value={mealTiming}
                    onChange={(e) => setMealTiming(e.target.value as any)}
                    className="w-full p-1 text-[11px] font-semibold text-slate-800 bg-white border border-rose-200 rounded-lg"
                  >
                    <option value="หลังอาหาร">หลังอาหาร</option>
                    <option value="ก่อนอาหาร">ก่อนอาหาร</option>
                    <option value="พร้อมอาหาร">พร้อมอาหาร</option>
                    <option value="ก่อนนอน">ก่อนนอน</option>
                  </select>
                </div>

                {/* ช่อง 3: เช้า */}
                <button
                  type="button"
                  onClick={() => setTakeMorning(!takeMorning)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                    takeMorning
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[9px] text-slate-400">ช่อง 3</span>
                  <span className="text-xs">🌅 เช้า</span>
                </button>

                {/* ช่อง 4: กลางวัน */}
                <button
                  type="button"
                  onClick={() => setTakeNoon(!takeNoon)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                    takeNoon
                      ? 'bg-orange-100 text-orange-900 border-orange-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[9px] text-slate-400">ช่อง 4</span>
                  <span className="text-xs">☀️ กลางวัน</span>
                </button>

                {/* ช่อง 5: เย็น */}
                <button
                  type="button"
                  onClick={() => setTakeEvening(!takeEvening)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                    takeEvening
                      ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[9px] text-slate-400">ช่อง 5</span>
                  <span className="text-xs">🌇 เย็น</span>
                </button>

                {/* ช่อง 6: ก่อนนอน */}
                <button
                  type="button"
                  onClick={() => setTakeBedtime(!takeBedtime)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                    takeBedtime
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[9px] text-slate-400">ช่อง 6</span>
                  <span className="text-xs">🌙 ก่อนนอน</span>
                </button>

                {/* เวลามีอาการ (prn) */}
                <button
                  type="button"
                  onClick={() => setTakePrn(!takePrn)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                    takePrn
                      ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[9px] text-slate-400">เวลามีอาการ</span>
                  <span className="text-xs">⚡ prn มีอาการ</span>
                </button>
              </div>

              {/* Sig Result text */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] font-mono text-rose-900 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex-1 mr-2 truncate">
                  Sig: {customSig}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingSigManually(!isEditingSigManually)}
                  className="text-[10px] text-slate-500 hover:text-rose-600 underline font-medium"
                >
                  {isEditingSigManually ? 'รีเซ็ตเป็นคำนวณอัตโนมัติ' : 'แก้ไขข้อความ'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowQuickAddMed(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs transition"
              >
                + บันทึกรายการยานี้
              </button>
            </div>
          </form>
        )}

        {medSavedToast && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            บันทึกรายการยาลงเวชระเบียนเรียบร้อยแล้ว
          </div>
        )}

        {/* Current Medication List Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-150">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/90 border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">ชื่อยา / ขนาดยา</th>
                <th className="px-3 py-2.5">หมวดยา</th>
                <th className="px-3.5 py-2.5">วิธีใช้ (Sig)</th>
                <th className="px-3 py-2.5">ข้อบ่งชี้ (Indication)</th>
                <th className="px-3 py-2.5 text-center">Adherence</th>
                <th className="px-3 py-2.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientMeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                    ยังไม่มีรายการยาสำหรับผู้ป่วยรายนี้ — กด "+ เพิ่มยา" เพื่อเลือกจาก 3 กลุ่มยามาตรฐาน
                  </td>
                </tr>
              ) : (
                patientMeds.map((med) => (
                  <tr key={med.id} className="hover:bg-rose-50/20 transition">
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">
                      {med.name}
                      {med.notes && <span className="block text-[10px] font-normal text-slate-500">{med.notes}</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {med.category || 'ยาจิตเวช'}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-medium">{med.sig}</td>
                    <td className="px-3 py-2.5 text-slate-500">{med.indication}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-block font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        med.adherence >= 80 
                          ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                          : med.adherence >= 60 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {med.adherence}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => onDeleteMed(med)}
                        title="ลบรายการยานี้"
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================
            1.2 แบบประเมินความร่วมมือในการกินยาของผู้ป่วย (Adherence Evaluation)
            (หลังจากบันทึกรายการยาครบแล้ว อ้างอิงแบบฟอร์มประเมิน Adherence MARS-5)
           ======================================================== */}
        <div className="pt-3 border-t border-rose-100/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-100 text-teal-800 rounded-xl shadow-2xs">
                <ClipboardCheck className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                    ประเมินความร่วมมือในการกินยาของผู้ป่วย (Medication Adherence)
                  </h4>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    อ้างอิงแบบฟอร์ม MARS-5
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ประเมินพฤติกรรมการรับประทานยาหลังบันทึกรายการยาครบถ้วน เพื่อวิเคราะห์ความร่วมมือในการรักษา
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowInlineMarsForm(!showInlineMarsForm)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-2xs border ${
                  showInlineMarsForm
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>{showInlineMarsForm ? 'ปิดแบบประเมินด่วน' : '+ ประเมินความร่วมมือด่วน'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenMars5}
                className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl font-semibold transition shadow-2xs flex items-center gap-1"
                title="เปิดแบบฟอร์มประเมิน MARS-5 เต็มหน้าต่าง"
              >
                <span>เปิดฟอร์มเต็ม</span>
              </button>
            </div>
          </div>

          {/* Toast Notification when Adherence is saved */}
          {adherenceSavedToast && (
            <div className="p-2.5 bg-teal-50 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              บันทึกผลการประเมินความร่วมมือในการกินยา (Adherence) และอัปเดตเวชระเบียนเรียบร้อยแล้ว
            </div>
          )}

          {/* Current Adherence Summary Card */}
          <div className="bg-gradient-to-r from-teal-50/50 via-emerald-50/30 to-slate-50/50 p-4 rounded-2xl border border-teal-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wide">
                  สถานะความร่วมมือในการกินยา (Current Adherence Status)
                </span>
                {latestMars5 ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    latestMars5.totalScore >= 23 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {latestMars5.totalScore >= 23 ? 'ความร่วมมือสูง (High Adherence)' : 'ความร่วมมือปานกลาง-ต่ำ (Mod/Low Adherence)'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    รอการประเมิน
                  </span>
                )}
              </div>

              {latestMars5 ? (
                <div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl font-black text-slate-900">
                      {latestMars5.totalScore} / 25 <span className="text-xs font-bold text-slate-500">คะแนน ({Math.round((latestMars5.totalScore / 25) * 100)}%)</span>
                    </span>
                    <span className="text-xs text-slate-600 font-medium truncate">
                      {latestMars5.interpretation}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>🗓️ วันที่ประเมิน: <strong>{latestMars5.date}</strong></span>
                    <span>•</span>
                    <span>👤 ผู้ประเมิน: <strong>{latestMars5.evaluatedBy}</strong></span>
                    {latestMars5.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-600">"{latestMars5.notes}"</span>
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-1">
                  ผู้ป่วยรายนี้ยังไม่มีผลการประเมิน MARS-5 ล่าสุด — กดปุ่ม <strong>"+ ประเมินความร่วมมือด่วน"</strong> เพื่อตอบคำถาม 5 ข้อและบันทึกคะแนน
                </div>
              )}
            </div>

            {/* Quick Score Bars / Details */}
            {latestMars5 && (
              <div className="bg-white/80 p-3 rounded-xl border border-teal-150 shrink-0 text-[11px] space-y-1">
                <span className="block font-bold text-teal-900 text-[10px] mb-1">
                  คะแนนแยกรายข้อ (1-5):
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                  <div className="p-1 rounded bg-teal-50 border border-teal-100">
                    <div className="text-[9px] text-slate-400">ข้อ 1</div>
                    <div className="font-bold text-teal-800">{latestMars5.q1}</div>
                  </div>
                  <div className="p-1 rounded bg-teal-50 border border-teal-100">
                    <div className="text-[9px] text-slate-400">ข้อ 2</div>
                    <div className="font-bold text-teal-800">{latestMars5.q2}</div>
                  </div>
                  <div className="p-1 rounded bg-teal-50 border border-teal-100">
                    <div className="text-[9px] text-slate-400">ข้อ 3</div>
                    <div className="font-bold text-teal-800">{latestMars5.q3}</div>
                  </div>
                  <div className="p-1 rounded bg-teal-50 border border-teal-100">
                    <div className="text-[9px] text-slate-400">ข้อ 4</div>
                    <div className="font-bold text-teal-800">{latestMars5.q4}</div>
                  </div>
                  <div className="p-1 rounded bg-teal-50 border border-teal-100">
                    <div className="text-[9px] text-slate-400">ข้อ 5</div>
                    <div className="font-bold text-teal-800">{latestMars5.q5}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inline MARS-5 Form (Referred from Step 4) */}
          {showInlineMarsForm && (
            <form
              onSubmit={handleInlineMarsSubmit}
              className="p-4 bg-gradient-to-br from-teal-50/60 via-emerald-50/40 to-white rounded-2xl border border-teal-200 space-y-4 animate-in fade-in duration-200 shadow-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-teal-150">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-teal-900">
                    แบบประเมินความร่วมมือ MARS-5 (Medication Adherence Report Scale)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInlineMarsForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  ย่อเก็บ
                </button>
              </div>

              <p className="text-[11px] text-slate-600">
                คำชี้แจง: ให้สอบถามผู้ป่วยตามคำถาม 5 ข้อด้านล่าง (1 = ทำเป็นประจำ จนถึง 5 = ไม่เคยทำเลย, คะแนนเต็ม 25 คะแนน)
              </p>

              {/* 5 Questions */}
              <div className="space-y-2.5">
                {[
                  { id: 1, text: '1. ฉันลืมกินยา (I forget to take them)', val: marsQ1, setter: setMarsQ1 },
                  { id: 2, text: '2. ฉันหยุดกินยาเองชั่วคราว (I alter the dose)', val: marsQ2, setter: setMarsQ2 },
                  { id: 3, text: '3. ฉันหยุดกินยาเองเป็นบางช่วง (I stop taking them for a while)', val: marsQ3, setter: setMarsQ3 },
                  { id: 4, text: '4. ฉันข้ามการกินยาบางมื้อ (I miss out a dose)', val: marsQ4, setter: setMarsQ4 },
                  { id: 5, text: '5. ฉันกินยาน้อยกว่าที่หมอสั่ง (I take less than instructed)', val: marsQ5, setter: setMarsQ5 },
                ].map((q) => (
                  <div key={q.id} className="p-3 bg-white rounded-xl border border-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      {q.text}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { score: 1, label: 'เป็นประจำ (1)' },
                        { score: 2, label: 'บ่อยๆ (2)' },
                        { score: 3, label: 'บางครั้ง (3)' },
                        { score: 4, label: 'นานๆ ครั้ง (4)' },
                        { score: 5, label: 'ไม่เคยเลย (5)' },
                      ].map((opt) => (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => q.setter(opt.score)}
                          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                            q.val === opt.score
                              ? 'bg-teal-600 text-white font-bold shadow-2xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Real-time Score Preview & Evaluator */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                <div className="md:col-span-5 bg-teal-50/80 p-3 rounded-xl border border-teal-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-teal-800 font-bold uppercase block">คะแนนรวมที่ได้:</span>
                    <span className="text-xl font-black text-slate-900">{totalMarsScore} / 25</span>
                    <span className="text-xs text-slate-500 font-medium ml-1">({marsAdherencePercent}%)</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                    isHighAdherence
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {isHighAdherence ? 'ความร่วมมือสูง (High)' : 'ปานกลาง-ต่ำ (Mod/Low)'}
                  </span>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ผู้ประเมิน:
                  </label>
                  <input
                    type="text"
                    value={marsEvaluator}
                    onChange={(e) => setMarsEvaluator(e.target.value)}
                    className="w-full p-2 bg-white border border-teal-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-300"
                    placeholder="ชื่อผู้ประเมิน"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    บันทึกเพิ่มเติม:
                  </label>
                  <input
                    type="text"
                    value={marsNotes}
                    onChange={(e) => setMarsNotes(e.target.value)}
                    className="w-full p-2 bg-white border border-teal-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-300"
                    placeholder="เช่น ผู้ป่วยรับยาตรงเวลา"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-150">
                <button
                  type="button"
                  onClick={() => setShowInlineMarsForm(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>✓ บันทึกผลการประเมินความร่วมมือ (Adherence)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ========================================================
          2. การค้นหาปัญหาที่เกิดจากการใช้ยา (DRPs) (Requirement 1 & 2)
         ======================================================== */}
      <section className="bg-white rounded-3xl shadow-xs border border-rose-100 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-2xl shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ขั้นตอนที่ 2
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  การค้นหาปัญหาที่เกิดจากการใช้ยา (Drug Therapy Problems - DRPs)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                จำแนก 6 หัวข้อ DRPs: Non adherence (ลืม/กินผิดขนาด/หยุดยาเอง), ADR สั่นเกร็ง, และ Drug Interaction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (showDrpForm) {
                  setShowDrpForm(false);
                  setDrpStatusChoice(null);
                } else {
                  setShowDrpForm(true);
                  setDrpStatusChoice('has_drp');
                }
              }}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showDrpForm ? 'ปิดฟอร์ม DRP' : '+ บันทึก DRP ใหม่'}</span>
            </button>
            <button
              onClick={onOpenAddDtp}
              className="text-xs bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl font-medium transition hidden sm:inline-block"
            >
              Modal
            </button>
          </div>
        </div>

        {/* Requirement 3: 2 ส่วนหลักที่สามารถเลือกติ๊กได้ว่า มี หรือ ไม่มี DRP */}
        <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>การประเมินปัญหาจากการใช้ยา (DRP Assessment): ติ๊กเลือกผลการประเมิน</span>
            </label>
            {drpStatusChoice && (
              <button
                type="button"
                onClick={() => {
                  setDrpStatusChoice(null);
                  setShowDrpForm(false);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline"
              >
                ล้างการเลือก
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ส่วนที่ 1: ไม่มี DRP */}
            <label
              onClick={() => {
                setDrpStatusChoice('no_drp');
                setShowDrpForm(false);
              }}
              className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 transition cursor-pointer select-none ${
                drpStatusChoice === 'no_drp'
                  ? 'bg-emerald-50/90 border-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20'
              }`}
            >
              <input
                type="radio"
                name="drp_choice"
                checked={drpStatusChoice === 'no_drp'}
                onChange={() => {}}
                className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ไม่มี DRP (ไม่พบปัญหาจากการใช้ยา)
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  ผู้ป่วยรับประทานยาถูกต้อง สม่ำเสมอ ไม่พบอาการข้างเคียง สั่นเกร็ง หรืออันตรกิริยาระหว่างยา
                </p>
              </div>
            </label>

            {/* ส่วนที่ 2: มี DRP */}
            <label
              onClick={() => {
                setDrpStatusChoice('has_drp');
                setShowDrpForm(true);
              }}
              className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 transition cursor-pointer select-none ${
                drpStatusChoice === 'has_drp'
                  ? 'bg-amber-50/90 border-amber-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20'
              }`}
            >
              <input
                type="radio"
                name="drp_choice"
                checked={drpStatusChoice === 'has_drp'}
                onChange={() => {}}
                className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  มี DRP (พบปัญหาจากการใช้ยา)
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  อ้างอิงข้อมูลเดิมที่เป็นแถบเลื่อน 6 ข้อมาตรฐาน (ลืม/ผิดขนาด/หยุดยาเอง, ADR สั่นเกร็ง, DI)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* ส่วนที่ 1 ฟอร์มบันทึกผล: กรณีเลือก ไม่มี DRP */}
        {drpStatusChoice === 'no_drp' && (
          <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white rounded-2xl border border-emerald-200 space-y-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ยืนยันผลการประเมิน: ไม่พบปัญหาจากการใช้ยา (No DRPs)
              </span>
              <button 
                type="button" 
                onClick={() => setDrpStatusChoice(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium"
              >
                ย่อเก็บ
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                บันทึกหมายเหตุการประเมิน (เพิ่มเติม):
              </label>
              <input
                type="text"
                value={noDrpNotes}
                onChange={(e) => setNoDrpNotes(e.target.value)}
                className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-300"
                placeholder="ระบุข้อสังเกตเพิ่มเติม เช่น ผู้ป่วยรับประทานยาครบถ้วนตามแพทย์สั่ง..."
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">
                ผู้ประเมิน: ภญ.สุภิตา ทองขำ (เภสัชกรชำนาญการ)
              </span>
              <button
                type="button"
                onClick={handleSaveNoDrp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>✓ บันทึกผล: ไม่มี DRP</span>
              </button>
            </div>
          </div>
        )}

        {/* ส่วนที่ 2 ฟอร์มบันทึกผล: กรณีเลือก มี DRP (อ้างอิงข้อมูลเดิมที่เป็นแถบเลื่อนทั้งหมด 6 หัวข้อมาตรฐาน) */}
        {showDrpForm && (
          <form 
            onSubmit={handleSaveQuickDrp}
            className="p-4 bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-white rounded-2xl border border-amber-200 space-y-3.5 shadow-xs animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                บันทึกปัญหา DRPs (อ้างอิงแถบเลื่อน 6 ข้อมาตรฐานเดิม)
              </span>
              <button 
                type="button" 
                onClick={() => {
                  setShowDrpForm(false);
                  if (drpStatusChoice === 'has_drp') setDrpStatusChoice(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium"
              >
                ย่อเก็บ
              </button>
            </div>

            {/* Requirement 2: 6 Specific DRP Topics Dropdown / Scrollbar */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                หัวข้อปัญหาจากการใช้ยา (DRP Scrollable Selector): *
              </label>
              <select
                value={selectedDrpTopic}
                onChange={(e) => setSelectedDrpTopic(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-amber-400"
              >
                <optgroup label="2.1 - 2.4 กลุ่ม Non adherence (ความร่วมมือการใช้ยา)">
                  <option value="2.1 Non adherence - ลืมกินยา">2.1 Non adherence - ลืมกินยา</option>
                  <option value="2.2 Non adherence - กินยาผิดขนาด มากกว่าแพทย์สั่ง">2.2 Non adherence - กินยาผิดขนาด มากกว่าแพทย์สั่ง</option>
                  <option value="2.3 Non adherence - กินยาผิดขนาด น้อยกว่าแพทย์สั่ง">2.3 Non adherence - กินยาผิดขนาด น้อยกว่าแพทย์สั่ง</option>
                  <option value="2.4 Non adherence - หยุดกินยาเอง">2.4 Non adherence - หยุดกินยาเอง</option>
                </optgroup>
                <optgroup label="2.5 - 2.6 กลุ่มอาการไม่พึงประสงค์ & อันตรกิริยา">
                  <option value="2.5 เกิด ADR ได้แก่ EPS สั่น เกร็ง">2.5 เกิด ADR ได้แก่ EPS สั่น เกร็ง</option>
                  <option value="2.6 เกิด Drug interaction (DI)">2.6 เกิด Drug interaction (DI)</option>
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ยาสาเหตุ (Cause Drug):
                </label>
                <select
                  value={drpCauseDrug}
                  onChange={(e) => setDrpCauseDrug(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-300"
                >
                  <option value="">-- เลือกจากรายการยาของผู้ป่วย หรือพิมพ์เอง --</option>
                  {patientMeds.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                  <option value="Haloperidol">Haloperidol</option>
                  <option value="Risperidone">Risperidone</option>
                  <option value="Trihexyphenidyl">Trihexyphenidyl</option>
                  <option value="Fluoxetine">Fluoxetine</option>
                  <option value="Sertraline">Sertraline</option>
                  <option value="Lorazepam">Lorazepam</option>
                  <option value="Clonazepam">Clonazepam</option>
                  <option value="Diazepam">Diazepam</option>
                  <option value="Clozapine">Clozapine</option>
                  <option value="Lithium">Lithium</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  พิมพ์ยาสาเหตุเพิ่มเติม (ถ้าไม่มีในลิสต์):
                </label>
                <input
                  type="text"
                  placeholder="เช่น Haloperidol 5 mg, Lithium Carbonate"
                  value={drpCauseDrug}
                  onChange={(e) => setDrpCauseDrug(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                รายละเอียดปัญหาที่พบจากการซักประวัติ: *
              </label>
              <textarea
                rows={2}
                required
                placeholder="ระบุพฤติกรรม อาการ หรือเหตุการณ์ เช่น ลืมทานยาวันละ 1-2 มื้อช่วงทำงาน, มีอาการมือสั่นเกร็งหลังปรับขนาดยา..."
                value={drpDescription}
                onChange={(e) => setDrpDescription(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                การบริบาลทางเภสัชกรรม / ข้อเสนอแนะ (Intervention): *
              </label>
              <textarea
                rows={2}
                required
                placeholder="เช่น แนะนำให้ญาติช่วยจัดยาใส่กล่องแบ่งยา, ปรึกษาแพทย์ปรับลดขนาดยา หรือเพิ่ม Artane บรรเทาอาการสั่น..."
                value={drpIntervention}
                onChange={(e) => setDrpIntervention(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDrpForm(false);
                  if (drpStatusChoice === 'has_drp') setDrpStatusChoice(null);
                }}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition"
              >
                บันทึก DRP นี้
              </button>
            </div>
          </form>
        )}

        {drpSavedToast && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            บันทึกข้อมูล DRPs เข้าสู่ระบบเรียบร้อยแล้ว
          </div>
        )}

        {/* DRP Search Filter Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาประวัติ DRPs, ยาสาเหตุ, หรือข้อเสนอแนะการบริบาล..."
            value={drpSearch}
            onChange={(e) => setDrpSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
          />
        </div>

        {/* DRPs List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
          {filteredPatientDtps.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-amber-50/20 rounded-2xl border border-dashed border-amber-200">
              <ShieldCheck className="w-8 h-8 mx-auto text-teal-400 mb-2" />
              <p className="font-bold text-slate-700">ไม่พบปัญหา DRPs ค้างอยู่</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ผู้ป่วยมีความร่วมมือในการใช้ยาและยังไม่พบอาการไม่พึงประสงค์รุนแรง
              </p>
            </div>
          ) : (
            filteredPatientDtps.map((dtp) => {
              const isNoDrp = dtp.domain.includes('No DRP') || dtp.domain.includes('ไม่พบปัญหา');
              return (
                <div
                  key={dtp.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition ${
                    isNoDrp
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : dtp.status === 'resolved'
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : 'bg-amber-50/40 border-amber-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold flex items-center gap-1.5 ${isNoDrp ? 'text-emerald-950' : 'text-amber-950'}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${isNoDrp ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {dtp.domain}
                    </span>
                    <button
                      onClick={() => onToggleDtpStatus(dtp.id)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                        dtp.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                      title="คลิกเพื่อสลับสถานะแก้ไขแล้ว/รอดำเนินการ"
                    >
                      {dtp.status === 'resolved' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> แก้ไขแล้ว (Resolved)
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" /> รอดำเนินการ (Pending)
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-slate-800 text-xs leading-relaxed">
                    <strong>ปัญหา:</strong> {dtp.description}
                  </p>
                  {dtp.causeDrug && dtp.causeDrug !== '-' && (
                    <p className="text-xs text-slate-600">
                      <strong>ยาสาเหตุ:</strong> <span className="font-bold text-rose-700">{dtp.causeDrug}</span>
                    </p>
                  )}
                  <div className={`p-2.5 rounded-xl border text-slate-700 text-xs ${isNoDrp ? 'bg-white border-emerald-150' : 'bg-white border-amber-150'}`}>
                    <strong className={`block mb-0.5 ${isNoDrp ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {isNoDrp ? 'คำแนะนำการบริบาล:' : 'การบริบาล / Intervention:'}
                    </strong>
                    {dtp.intervention}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>วันที่บันทึก: {dtp.date}</span>
                    <span>ผู้บันทึก: {dtp.recordedBy}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ========================================================
          3. ชุดแบบประเมินทางเภสัชกรรม (ADR & Metabolic Monitoring)
         ======================================================== */}
      <section className="bg-white rounded-3xl shadow-xs border border-rose-100 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-2xl shadow-2xs">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ขั้นตอนที่ 3
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  ชุดแบบประเมินทางเภสัชกรรม (ADR & Metabolic Monitoring)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ประเมินอาการไม่พึงประสงค์จากการใช้ยา (DIEPSS/EPS) และภาวะ Metabolic Syndrome
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onOpenDiepss}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition shadow-2xs"
            >
              DIEPSS (ADR)
            </button>
            <button
              onClick={onOpenMetabolic}
              className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition shadow-2xs"
            >
              Metabolic Lab
            </button>
          </div>
        </div>

        {/* 2 Summary Cards (ADR & Metabolic - Adherence moved to Step 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 3.1 ADR / EPS (DIEPSS) */}
          <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-150 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                3.1 ADR / EPS (DIEPSS)
              </span>
              <button
                onClick={onOpenDiepss}
                className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline"
              >
                + ประเมิน
              </button>
            </div>
            {latestDiepss ? (
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{latestDiepss.totalScore} / 36</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
                    {latestDiepss.severityLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  ยาที่เกี่ยวข้อง: {latestDiepss.antipsychoticDrug} ({latestDiepss.date})
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-2">ยังไม่มีผลประเมิน DIEPSS ล่าสุด</p>
            )}
          </div>

          {/* 3.2 Metabolic Syndrome */}
          <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-150 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                3.2 Metabolic Syndrome
              </span>
              <button
                onClick={onOpenMetabolic}
                className="text-[10px] text-rose-700 hover:text-rose-900 font-bold underline"
              >
                + บันทึกผลแล็บ
              </button>
            </div>
            {latestMetabolic ? (
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{latestMetabolic.criteriaMetCount} / 5 เกณฑ์</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    latestMetabolic.isMetabolicSyndrome 
                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {latestMetabolic.isMetabolicSyndrome ? 'Metabolic Syndrome' : 'ปกติ'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  เอว {latestMetabolic.waistCm} cm | FBS {latestMetabolic.fbs} | TG {latestMetabolic.triglycerides}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-2">ยังไม่มีข้อมูลติดตาม Metabolic</p>
            )}
          </div>
        </div>

        {/* Clozapine REMS & Lithium Monitor Quick Check */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-rose-500" />
              การเฝ้าระวังความปลอดภัยระดับยาและผลข้างเคียง (Safety & Lab Quick Check)
            </span>
            {safetySavedToast && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✓ บันทึกค่าความปลอดภัยแล้ว
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {/* WBC */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Clozapine WBC (/mm³):</label>
              <input
                type="number"
                placeholder="เช่น 6400"
                value={wbcInput}
                onChange={(e) => setWbcInput(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            {/* ANC */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1 flex items-center justify-between">
                <span>ANC Count (/mm³):</span>
                {clozapineZone === 'green' && <span className="text-emerald-700 font-bold">Green</span>}
                {clozapineZone === 'yellow' && <span className="text-amber-700 font-bold">Yellow</span>}
                {clozapineZone === 'red' && <span className="text-rose-700 font-bold animate-pulse">Red!</span>}
              </label>
              <input
                type="number"
                placeholder="เช่น 3200"
                value={ancInput}
                onChange={(e) => setAncInput(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            {/* Lithium */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Serum Lithium (mEq/L):</label>
              <input
                type="number"
                step="0.01"
                placeholder="เช่น 0.8"
                value={lithiumInput}
                onChange={(e) => setLithiumInput(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            {/* EPS */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">EPS & อาการสั่นเกร็ง:</label>
              <input
                type="text"
                placeholder="เช่น ไม่มีอาการสั่น หรือ สั่นมือเล็กน้อย"
                value={epsInput}
                onChange={(e) => setEpsInput(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveSafety}
              className="bg-slate-700 hover:bg-slate-800 text-white text-xs px-3.5 py-1.5 rounded-xl font-medium transition shadow-2xs"
            >
              บันทึกผลแล็บความปลอดภัย
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. การคีย์บันทึกนัดติดตาม (Requirement 1)
         ======================================================== */}
      <section className="bg-gradient-to-r from-rose-50/90 via-pink-50/60 to-indigo-50/50 rounded-3xl shadow-xs border border-rose-200 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl shadow-2xs">
              <CalendarClock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  ขั้นตอนที่ 4 (สิ้นสุดขั้นตอน)
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  การคีย์บันทึกนัดติดตาม (Follow-up Appointment Scheduling)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                ระบุวันนัดหมายครั้งถัดไป ช่องทางการดูแล (เยี่ยมบ้าน, Telemed หรือตรวจคลินิก/DRPs) และเป้าหมายการบริบาล
              </p>
            </div>
          </div>

          {appointmentSavedToast && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> บันทึกวันนัดติดตามแล้ว
            </span>
          )}
        </div>

        {/* Current Scheduled Status Banner */}
        {patient.nextAppointment && (
          <div className="p-3 bg-white/90 rounded-2xl border border-indigo-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-slate-600">นัดหมายปัจจุบันในระบบ:</span>
              <strong className="text-indigo-900 font-bold text-sm bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                {formatAppointmentDate(patient.nextAppointment, 'day_full')}
              </strong>
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-indigo-800">
                {patient.nextAppointmentType === 'home_visit' ? '🏠 เยี่ยมบ้าน' : patient.nextAppointmentType === 'telemed' ? '📱 โทร Telemed' : '🏥 ตรวจคลินิก/DRPs'}
              </span>
            </div>
            {patient.nextAppointmentObjective && (
              <span className="text-[11px] text-slate-500 italic max-w-xs truncate">
                เป้าหมาย: {patient.nextAppointmentObjective}
              </span>
            )}
          </div>
        )}

        {/* Appointment Form */}
        <form onSubmit={handleSaveAppointment} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 text-xs">
            {/* วันที่นัดถัดไป (วัน/เดือน/ปี พ.ศ.) */}
            <div className="sm:col-span-6">
              <ThaiAppointmentDatePicker
                value={nextAppDate}
                onChange={setNextAppDate}
                label="วันที่นัดหมายครั้งถัดไป:"
                required
                themeColor="indigo"
              />
            </div>

            {/* ช่องทางการติดตาม 3 กลุ่ม */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ช่องทางการติดตาม (3 กลุ่มการดูแล): *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNextAppType('home_visit')}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    nextAppType === 'home_visit'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>1. เยี่ยมบ้าน</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNextAppType('telemed')}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    nextAppType === 'telemed'
                      ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>2. Telemed</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNextAppType('clinic')}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    nextAppType === 'clinic'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>3. คลินิก/DRPs</span>
                </button>
              </div>
            </div>
          </div>

          {/* เป้าหมายและกิจกรรมที่ต้องทำในวันนัด */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              เป้าหมายและกิจกรรมในวันนัดติดตาม (Appointment Objective):
            </label>
            <input
              type="text"
              placeholder="เช่น ติดตาม Adherence การทานยา, ประเมินอาการสั่นเกร็งซ้ำหลังเริ่มยา Artane, ตรวจ CBC/ANC..."
              value={nextAppObjective}
              onChange={(e) => setNextAppObjective(e.target.value)}
              className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              🔔 ข้อมูลวันนัดจะปรากฏในระบบเตือนนัดหมาย และกระดานติดตามสหวิชาชีพ
            </span>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-6 py-2.5 rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarClock className="w-4 h-4" />
              <span>บันทึกวันนัดติดตาม</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
