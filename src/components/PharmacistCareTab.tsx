import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Activity, 
  ShieldAlert, 
  FlaskConical, 
  Flame,
  Check,
  ChevronDown,
  ClipboardCheck,
  HeartPulse,
  Scale
} from 'lucide-react';
import { 
  Patient, 
  Medication, 
  DtpRecord, 
  SoapNote, 
  SafetyLog,
  Mars5Assessment,
  DiepssAssessment,
  MetabolicRecord 
} from '../types.ts';

interface PharmacistCareTabProps {
  patient: Patient;
  medications: Medication[];
  dtps: DtpRecord[];
  soapNotes: SoapNote[];
  safetyLogs: SafetyLog[];
  mars5Records: Mars5Assessment[];
  diepssRecords: DiepssAssessment[];
  metabolicRecords: MetabolicRecord[];
  onOpenAddMed: () => void;
  onDeleteMed: (med: Medication) => void;
  onOpenAddDtp: () => void;
  onToggleDtpStatus: (dtpId: string) => void;
  onOpenMars5: () => void;
  onOpenDiepss: () => void;
  onOpenMetabolic: () => void;
  onSaveSoapNote: (soap: { subjective: string; objective: string; assessment: string; plan: string }) => void;
  onSaveSafetyLog: (safety: Partial<SafetyLog>) => void;
}

export const PharmacistCareTab: React.FC<PharmacistCareTabProps> = ({
  patient,
  medications,
  dtps,
  soapNotes,
  safetyLogs,
  mars5Records,
  diepssRecords,
  metabolicRecords,
  onOpenAddMed,
  onDeleteMed,
  onOpenAddDtp,
  onToggleDtpStatus,
  onOpenMars5,
  onOpenDiepss,
  onOpenMetabolic,
  onSaveSoapNote,
  onSaveSafetyLog
}) => {
  const patientMeds = medications.filter(m => m.patientId === patient.id);
  const patientDtps = dtps.filter(d => d.patientId === patient.id);
  const patientSoaps = soapNotes.filter(s => s.patientId === patient.id);
  const latestSafety = safetyLogs.filter(s => s.patientId === patient.id)[0];
  const patientMars5 = mars5Records.filter(m => m.patientId === patient.id);
  const latestMars5 = patientMars5[0];
  const patientDiepss = diepssRecords.filter(d => d.patientId === patient.id);
  const latestDiepss = patientDiepss[0];
  const patientMetabolic = metabolicRecords.filter(met => met.patientId === patient.id);
  const latestMetabolic = patientMetabolic[0];

  // SOAP Form State
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [soapSavedToast, setSoapSavedToast] = useState(false);

  // Safety Quick Input State
  const [wbcInput, setWbcInput] = useState(latestSafety?.clozapineWbc ? String(latestSafety.clozapineWbc) : '');
  const [ancInput, setAncInput] = useState(latestSafety?.clozapineAnc ? String(latestSafety.clozapineAnc) : '');
  const [lithiumInput, setLithiumInput] = useState(latestSafety?.lithiumLevel ? String(latestSafety.lithiumLevel) : '');
  const [epsInput, setEpsInput] = useState(latestSafety?.epsSymptoms || 'ไม่พบอาการสั่นหรือเกร็ง (No EPS)');
  const [safetySavedToast, setSafetySavedToast] = useState(false);

  const handleSaveSoap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjective.trim() && !objective.trim() && !assessment.trim() && !plan.trim()) {
      alert('กรุณากรอกข้อมูลใน SOAP Note อย่างน้อยหนึ่งช่อง');
      return;
    }
    onSaveSoapNote({
      subjective: subjective.trim(),
      objective: objective.trim(),
      assessment: assessment.trim(),
      plan: plan.trim()
    });
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setSoapSavedToast(true);
    setTimeout(() => setSoapSavedToast(false), 3000);
  };

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

  // Clozapine ANC Zone determination
  const ancValue = ancInput ? parseFloat(ancInput) : latestSafety?.clozapineAnc;
  let clozapineZone: 'green' | 'yellow' | 'red' | 'unknown' = 'unknown';
  if (ancValue !== undefined) {
    if (ancValue >= 1500) clozapineZone = 'green';
    else if (ancValue >= 1000) clozapineZone = 'yellow';
    else clozapineZone = 'red';
  }

  return (
    <div className="space-y-5">
      {/* 1. Quick Clinical Assessment Launchpad Banner (Soft, soothing pastel rose) */}
      <div className="bg-gradient-to-r from-rose-100/90 via-pink-100/70 to-rose-50 rounded-2xl p-4 text-slate-800 shadow-xs border border-rose-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2 text-slate-800">
              <ClipboardCheck className="w-4 h-4 text-rose-500" />
              ชุดแบบประเมินทางเภสัชกรรมจิตเวช (Clinical Assessment Scales)
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              แบบประเมินความร่วมมือในการใช้ยา (MARS-5), ประเมิน ADR ทางระบบประสาท (DIEPSS), และติดตาม Metabolic Syndrome
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenMars5}
              className="bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-rose-500" /> ทำแบบประเมิน MARS-5
            </button>
            <button
              onClick={onOpenDiepss}
              className="bg-white text-amber-800 hover:bg-amber-50 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-amber-600" /> ประเมิน ADR ด้วย DIEPSS
            </button>
            <button
              onClick={onOpenMetabolic}
              className="bg-white text-teal-800 hover:bg-teal-50 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1.5"
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" /> ติดตาม Metabolic
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Clinical Assessment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* MARS-5 Summary Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-teal-800 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              MARS-5 Adherence
            </span>
            <button
              onClick={onOpenMars5}
              className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold underline"
            >
              + ประเมินใหม่
            </button>
          </div>
          {latestMars5 ? (
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">{latestMars5.totalScore} / 25</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  latestMars5.totalScore >= 23 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {latestMars5.totalScore >= 23 ? 'High Adherence' : 'Moderate-Low'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                ประเมินเมื่อ: {latestMars5.date} โดย {latestMars5.evaluatedBy}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-[11px] py-1">ยังไม่มีการประเมิน MARS-5</p>
          )}
        </div>

        {/* DIEPSS Summary Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-600" />
              DIEPSS (ADR/EPS)
            </span>
            <button
              onClick={onOpenDiepss}
              className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold underline"
            >
              + ประเมินใหม่
            </button>
          </div>
          {latestDiepss ? (
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">{latestDiepss.totalScore} / 36</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-300">
                  {latestDiepss.severityLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                ยา: {latestDiepss.antipsychoticDrug} ({latestDiepss.date})
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-[11px] py-1">ยังไม่มีการประเมิน DIEPSS</p>
          )}
        </div>

        {/* Metabolic Monitoring Summary Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-800 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              Metabolic Syndrome
            </span>
            <button
              onClick={onOpenMetabolic}
              className="text-[10px] text-rose-700 hover:text-rose-900 font-semibold underline"
            >
              + บันทึกผลแล็บ
            </button>
          </div>
          {latestMetabolic ? (
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">{latestMetabolic.criteriaMetCount} / 5 เกณฑ์</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  latestMetabolic.isMetabolicSyndrome 
                    ? 'bg-rose-50 text-rose-800 border-rose-300' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  {latestMetabolic.isMetabolicSyndrome ? 'Metabolic Syndrome' : 'ปกติ'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                รอบเอว {latestMetabolic.waistCm} cm | FBS {latestMetabolic.fbs} | TG {latestMetabolic.triglycerides}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-[11px] py-1">ยังไม่มีการติดตาม Metabolic</p>
          )}
        </div>
      </div>

      {/* 3. Medication Profile Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 text-teal-700 rounded-xl">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                บัญชียาจิตเวชและยาร่วม (Medication Profile & Reconciliation)
              </h3>
              <p className="text-[11px] text-slate-500">
                รายการยาทั้งหมดของผู้ป่วย HN: {patient.hn} ({patientMeds.length} รายการ)
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddMed}
            className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> เพิ่มรายการยา
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-y border-slate-200/80">
              <tr>
                <th className="px-3 py-2.5">ชื่อยา / ขนาดยา</th>
                <th className="px-3 py-2.5">หมวดยา</th>
                <th className="px-3 py-2.5">วิธีใช้ (Sig)</th>
                <th className="px-3 py-2.5">ข้อบ่งชี้ (Indication)</th>
                <th className="px-3 py-2.5 text-center">Adherence</th>
                <th className="px-3 py-2.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientMeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                    ยังไม่มีรายการยาสำหรับผู้ป่วยรายนี้ — กด "+ เพิ่มรายการยา" ด้านบนเพื่อเริ่มบันทึก
                  </td>
                </tr>
              ) : (
                patientMeds.map((med) => (
                  <tr key={med.id} className="hover:bg-pink-50/20 transition">
                    <td className="px-3 py-2.5 font-bold text-slate-900">
                      {med.name}
                      {med.notes && <span className="block text-[10px] font-normal text-slate-500">{med.notes}</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {med.category || 'ยาจิตเวช'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{med.sig}</td>
                    <td className="px-3 py-2.5 text-slate-600">{med.indication}</td>
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
      </div>

      {/* 4. DTPs & Psychiatric Safety Protocols Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: DTPs Records (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-pink-100 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-pink-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">
                  ปัญหาจากการใช้ยา (Drug Therapy Problems - DTPs)
                </h4>
                <p className="text-[11px] text-slate-500">
                  ติดตาม ADR, Non-adherence, Drug Interactions และผลแทรกซ้อน
                </p>
              </div>
            </div>

            <button
              onClick={onOpenAddDtp}
              className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3 h-3" /> บันทึก DTP
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[360px] custom-scrollbar pr-1">
            {patientDtps.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-pink-50/20 rounded-xl border border-dashed border-pink-100">
                <ShieldCheck className="w-7 h-7 mx-auto text-teal-400 mb-1.5" />
                <p className="font-medium text-slate-600">ไม่พบปัญหา DTPs ในขณะนี้</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ผู้ป่วยมีความร่วมมือในการใช้ยาและผลข้างเคียงอยู่ในระดับควบคุมได้</p>
              </div>
            ) : (
              patientDtps.map((dtp) => (
                <div
                  key={dtp.id}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                    dtp.status === 'resolved'
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      {dtp.domain}
                    </span>
                    <button
                      onClick={() => onToggleDtpStatus(dtp.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                        dtp.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                      title="กดเพื่อสลับสถานะ"
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

                  <p className="text-slate-800 text-[11px] leading-relaxed">
                    <strong>ปัญหา:</strong> {dtp.description}
                  </p>
                  {dtp.causeDrug && (
                    <p className="text-[11px] text-slate-600">
                      <strong>ยาสาเหตุ:</strong> <span className="font-medium text-rose-700">{dtp.causeDrug}</span>
                    </p>
                  )}
                  <p className="text-slate-700 text-[11px] bg-white/70 p-2 rounded-lg border border-amber-100">
                    <strong className="text-amber-800">การบริบาล/Intervention:</strong> {dtp.intervention}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>วันที่: {dtp.date}</span>
                    <span>ผู้บันทึก: {dtp.recordedBy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Psychiatric Safety Protocols (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-pink-100 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-pink-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-xl">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs">
                เฝ้าระวังความปลอดภัยเฉพาะทางจิตเวช
              </h4>
            </div>

            {safetySavedToast && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ บันทึกความปลอดภัยแล้ว
              </span>
            )}
          </div>

          {/* Clozapine Safety Box */}
          <div className="p-3 bg-pink-50/40 rounded-xl border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-pink-900 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-pink-600" />
                Clozapine REMS: WBC & ANC Monitor
              </span>
              {clozapineZone === 'green' && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                  Green Zone (ปลอดภัย)
                </span>
              )}
              {clozapineZone === 'yellow' && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                  Yellow Zone (เฝ้าระวัง)
                </span>
              )}
              {clozapineZone === 'red' && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300 animate-pulse">
                  Red Zone (หยุดยา Clozapine ทันที)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">WBC Count (/mm³):</label>
                <input
                  type="number"
                  placeholder="เช่น 6400"
                  value={wbcInput}
                  onChange={(e) => setWbcInput(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">ANC Count (/mm³):</label>
                <input
                  type="number"
                  placeholder="เช่น 3200"
                  value={ancInput}
                  onChange={(e) => setAncInput(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              เกณฑ์: ANC ≥ 1500 (ปลอดภัย) | 1000-1499 (เฝ้าระวัง 2x/wk) | &lt; 1000 (หยุดยาพบแพทย์ด่วน)
            </p>
          </div>

          {/* Lithium & EPS Quick Check */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className="text-[10px] font-semibold text-slate-700">Serum Lithium Level (mEq/L):</label>
                <span className="text-[10px] text-slate-400">Target: 0.6 - 1.0</span>
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="เช่น 0.78"
                value={lithiumInput}
                onChange={(e) => setLithiumInput(e.target.value)}
                className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
              <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                ⚠️ เตือน: ระวังการใช้ร่วมกับ NSAIDs, ACEi, หรืออาการขาดน้ำ
              </span>
            </div>

            <div className="pt-1">
              <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">EPS & Movement Disorder Score:</label>
              <input
                type="text"
                placeholder="เช่น Mild sialorrhea, ไม่มี Akathisia หรือ Tremor"
                value={epsInput}
                onChange={(e) => setEpsInput(e.target.value)}
                className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveSafety}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs transition"
              >
                บันทึกข้อมูลความปลอดภัย
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Pharmacist Clinical SOAP Note Entry & History */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-pink-100 text-pink-700 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">
                บันทึกการบริบาลเภสัชกรรม (Pharmacist Clinical Note - SOAP)
              </h4>
              <p className="text-[11px] text-slate-500">
                เขียนบันทึกการบริบาล ข้อมูลจะถูกบันทึกและซิงค์ลง Google Sheet แท็บ SOAP_Notes ทันที
              </p>
            </div>
          </div>

          {soapSavedToast && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ บันทึก SOAP Note เรียบร้อย
            </span>
          )}
        </div>

        {/* SOAP Input Form */}
        <form onSubmit={handleSaveSoap} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Subjective (S): ข้อมูลจากการสัมภาษณ์ อาการสำคัญ และคำบอกเล่า
              </label>
              <textarea
                rows={3}
                placeholder="เช่น ผู้ป่วยเล่าว่านอนหลับดีขึ้น ไม่มีหูแว่ว แต่มีอาการปากแห้ง ทานยาตรงเวลา..."
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                className="w-full text-xs p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Objective (O): ข้อมูลตรวจร่างกาย Lab, สัญญาณชีพ, ผลประเมิน MARS-5 / DIEPSS
              </label>
              <textarea
                rows={3}
                placeholder="เช่น Adherence 95%, ผล MARS-5 = 24/25, DIEPSS = 2/36, ANC = 3,450 /mm³..."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full text-xs p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Assessment (A): การประเมินปัญหาจากการใช้ยา และความสม่ำเสมอ
              </label>
              <textarea
                rows={3}
                placeholder="เช่น สภาพจิตสงบดี DTP พบภาวะน้ำลายไหลย้อยตอนนอนจาก Clozapine, เข้าเกณฑ์ High adherence..."
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="w-full text-xs p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Plan (P): แผนการบริบาล การให้คำแนะนำผู้ป่วย และการประสานสหวิชาชีพ
              </label>
              <textarea
                rows={3}
                placeholder="เช่น 1. จ่าย Clozapine 100 mg 1xhs ต่อเนื่อง 2. แนะนำหนุนหมอนสูง 3. ประสานทีมเยี่ยมบ้าน..."
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full text-xs p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="bg-rose-400 hover:bg-rose-500 active:bg-rose-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition transform active:scale-95"
            >
              บันทึก SOAP Note ลงระบบ & Google Sheet
            </button>
          </div>
        </form>

        {/* History of Past SOAP Notes */}
        {patientSoaps.length > 0 && (
          <div className="pt-3 border-t border-pink-50 space-y-2">
            <h5 className="font-bold text-xs text-slate-700">ประวัติบันทึก SOAP Notes ย้อนหลัง ({patientSoaps.length} ฉบับ)</h5>
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {patientSoaps.map((soap) => (
                <div key={soap.id} className="p-3 bg-pink-50/30 rounded-xl border border-pink-100 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span className="font-bold text-pink-900">วันที่: {soap.date}</span>
                    <span className="text-slate-600">{soap.recordedBy}</span>
                  </div>
                  {soap.subjective && <p><strong className="text-pink-700">S:</strong> {soap.subjective}</p>}
                  {soap.objective && <p><strong className="text-pink-700">O:</strong> {soap.objective}</p>}
                  {soap.assessment && <p><strong className="text-pink-700">A:</strong> {soap.assessment}</p>}
                  {soap.plan && <p><strong className="text-pink-700">P:</strong> {soap.plan}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
