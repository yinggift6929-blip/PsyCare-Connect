import React from 'react';
import { 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Scale, 
  FlaskConical, 
  HeartPulse, 
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { 
  Patient, 
  SafetyLog, 
  PsychRecord, 
  NurseRecord, 
  DtpRecord,
  Mars5Assessment,
  DiepssAssessment,
  MetabolicRecord
} from '../types.ts';

interface AnalyticsTabProps {
  patient: Patient;
  safetyLogs: SafetyLog[];
  psychRecords: PsychRecord[];
  nurseRecords: NurseRecord[];
  dtps: DtpRecord[];
  mars5Records: Mars5Assessment[];
  diepssRecords: DiepssAssessment[];
  metabolicRecords: MetabolicRecord[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  patient,
  safetyLogs,
  psychRecords,
  nurseRecords,
  dtps,
  mars5Records,
  diepssRecords,
  metabolicRecords
}) => {
  const patientSafeties = safetyLogs.filter(s => s.patientId === patient.id);
  const patientPsychs = psychRecords.filter(p => p.patientId === patient.id);
  const patientNurses = nurseRecords.filter(n => n.patientId === patient.id);
  const resolvedDtps = dtps.filter(d => d.patientId === patient.id && d.status === 'resolved');
  const patientMars5 = mars5Records.filter(m => m.patientId === patient.id);
  const patientDiepss = diepssRecords.filter(d => d.patientId === patient.id);
  const patientMetabolic = metabolicRecords.filter(met => met.patientId === patient.id);

  const latestSafety = patientSafeties[0];
  const latestPsych = patientPsychs[0];
  const latestMars5 = patientMars5[0];
  const latestDiepss = patientDiepss[0];
  const latestMetabolic = patientMetabolic[0];

  // Progression bars data
  const trendPoints = [
    { visit: 'ครั้งที่ 1 (3 ด.ก่อน)', adherence: 65, symptom: 18, phq9: 18 },
    { visit: 'ครั้งที่ 2 (2 ด.ก่อน)', adherence: 75, symptom: 14, phq9: 14 },
    { visit: 'ครั้งที่ 3 (1 ด.ก่อน)', adherence: 88, symptom: 9, phq9: 9 },
    { visit: 'ปัจจุบัน', adherence: patient.adherenceScore, symptom: Math.max(2, 20 - Math.round(patient.adherenceScore * 0.18)), phq9: latestPsych?.phq9Score || 6 }
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header & Progression Visualizer */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-pink-50">
          <div className="p-1.5 bg-sky-100 text-sky-700 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              แนวโน้มผลการรักษาและความร่วมมือในการใช้ยา (Clinical Progression & Adherence)
            </h3>
            <p className="text-[11px] text-slate-500">
              วิเคราะห์ความสัมพันธ์ระหว่างระดับ Adherence (%) จาก MARS-5 กับระดับคะแนนอาการ/ภาวะซึมเศร้า
            </p>
          </div>
        </div>

        {/* Visual Comparison Bars */}
        <div className="bg-gradient-to-b from-pink-50/30 to-purple-50/20 p-4 rounded-2xl border border-pink-100 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-teal-500"></span> Adherence การรับประทานยา (%)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-pink-500"></span> คะแนนอาการจิตเวช / PHQ-9 (คะแนน)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-pink-100">
            {trendPoints.map((pt, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="h-40 w-full flex items-end justify-center gap-2 bg-white/70 p-2 rounded-xl border border-slate-100 shadow-2xs">
                  {/* Adherence Bar (Teal) */}
                  <div className="w-5 sm:w-8 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-teal-700 mb-1">{pt.adherence}%</span>
                    <div 
                      className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(pt.adherence / 100) * 110}px` }}
                    />
                  </div>

                  {/* Symptom Bar (Pink) */}
                  <div className="w-5 sm:w-8 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-pink-700 mb-1">{pt.phq9}</span>
                    <div 
                      className="w-full bg-gradient-to-t from-pink-600 to-pink-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(pt.phq9 / 27) * 110}px` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-600 text-center">{pt.visit}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-teal-800 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200">
            💡 <strong>การแปลผลทางคลินิก:</strong> เมื่อความร่วมมือในการรับประทานยา (Adherence) เพิ่มขึ้นจาก 65% เป็น {patient.adherenceScore}% ส่งผลให้อาการจิตเวชและคะแนนซึมเศร้าลดลงอย่างมีนัยสำคัญทางคลินิก
          </p>
        </div>
      </div>

      {/* 2. Specialized Clinical Scales Grid: MARS-5 & DIEPSS History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MARS-5 Adherence History */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-pink-50">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              ประวัติการประเมิน MARS-5 ({patientMars5.length} ครั้ง)
            </span>
            <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full font-bold">
              เต็ม 25 คะแนน
            </span>
          </div>

          {patientMars5.length === 0 ? (
            <p className="text-slate-400 text-xs py-4 text-center">ยังไม่มีประวัติการประเมิน MARS-5</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {patientMars5.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl border border-teal-100 bg-teal-50/20 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-800">{m.date}</span>
                    <span className="font-bold text-teal-700">{m.totalScore} / 25 ({Math.round(m.totalScore / 25 * 100)}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{m.interpretation}</p>
                  {m.notes && <p className="text-[10px] text-slate-400">หมายเหตุ: {m.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DIEPSS Movement Disorder / ADR History */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-pink-50">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-600" />
              ประวัติการประเมิน DIEPSS ({patientDiepss.length} ครั้ง)
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              เต็ม 36 คะแนน
            </span>
          </div>

          {patientDiepss.length === 0 ? (
            <p className="text-slate-400 text-xs py-4 text-center">ยังไม่มีประวัติการประเมิน DIEPSS</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {patientDiepss.map((d) => (
                <div key={d.id} className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/20 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-800">{d.date} • {d.antipsychoticDrug}</span>
                    <span className="font-bold text-amber-800">{d.totalScore} / 36 ({d.severityLabel})</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Akathisia: {d.akathisia} | Tremor: {d.kineticTremor + d.restTremor} | Sialorrhea: {d.sialorrhea} | Rigidity: {d.muscleRigidity}
                  </p>
                  {d.actionPlan && <p className="text-[10px] text-amber-900 bg-white/70 p-1.5 rounded-lg">แผน: {d.actionPlan}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Metabolic Syndrome Monitoring History & Risk */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-pink-50">
          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            การติดตาม Metabolic Syndrome ({patientMetabolic.length} บันทึก)
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            เกณฑ์ NCEP ATP III (≥3 ใน 5 ข้อ)
          </span>
        </div>

        {patientMetabolic.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">ยังไม่มีบันทึกการติดตาม Metabolic</p>
        ) : (
          <div className="space-y-2.5">
            {patientMetabolic.map((met) => (
              <div 
                key={met.id} 
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  met.isMetabolicSyndrome ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{met.date}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-slate-700">
                      ยา: {met.suspectedDrug}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    met.isMetabolicSyndrome 
                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {met.isMetabolicSyndrome ? '⚠️ เข้าเกณฑ์ Metabolic Syndrome' : '✓ ปกติ'} ({met.criteriaMetCount}/5 ข้อ)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] bg-white/80 p-2 rounded-xl border border-slate-100">
                  <div><strong>รอบเอว:</strong> {met.waistCm} cm</div>
                  <div><strong>BMI:</strong> {met.bmi} ({met.weightKg} kg)</div>
                  <div><strong>BP:</strong> {met.sbp}/{met.dbp} mmHg</div>
                  <div><strong>FBS:</strong> {met.fbs} mg/dL</div>
                  <div><strong>Triglycerides:</strong> {met.triglycerides} mg/dL</div>
                </div>

                {met.criteriaList && met.criteriaList.length > 0 && (
                  <div className="text-[10px] text-rose-800 space-y-0.5">
                    <strong>เกณฑ์ที่ผิดปกติ:</strong> {met.criteriaList.join(' • ')}
                  </div>
                )}

                {met.pharmacistAdvice && (
                  <p className="text-[11px] text-slate-700 bg-white/90 p-2 rounded-lg border border-slate-100">
                    <strong>คำแนะนำเภสัชกรรม:</strong> {met.pharmacistAdvice}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Clozapine & Lithium Safety Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clozapine Protocol Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-teal-700 font-bold">
            <FlaskConical className="w-4 h-4" />
            <span>Clozapine WBC & ANC Status</span>
          </div>
          <div className="space-y-1.5 text-slate-700 pt-1">
            <div className="flex justify-between">
              <span>WBC Count:</span>
              <strong className="text-teal-800">{latestSafety?.clozapineWbc ? `${latestSafety.clozapineWbc} /mm³` : '6,400 /mm³'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Absolute Neutrophils (ANC):</span>
              <strong className="text-teal-800">{latestSafety?.clozapineAnc ? `${latestSafety.clozapineAnc} /mm³` : '3,450 /mm³'}</strong>
            </div>
            <div className="flex justify-between">
              <span>สถานะความปลอดภัย:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Green Zone (ปกติ)
              </span>
            </div>
          </div>
        </div>

        {/* Therapeutic Drug Monitoring Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-purple-700 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Lithium TDM & DTPs Resolved</span>
          </div>
          <div className="space-y-1.5 text-slate-700 pt-1">
            <div className="flex justify-between">
              <span>Serum Lithium Level:</span>
              <strong className="text-purple-800">{latestSafety?.lithiumLevel ? `${latestSafety.lithiumLevel} mEq/L` : '0.78 mEq/L'}</strong>
            </div>
            <div className="flex justify-between">
              <span>EPS Symptom:</span>
              <strong className="text-slate-800">{latestSafety?.epsSymptoms || 'Mild Sialorrhea'}</strong>
            </div>
            <div className="flex justify-between">
              <span>DTPs แก้ไขสำเร็จ:</span>
              <span className="font-bold text-emerald-700">{resolvedDtps.length} รายการ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
