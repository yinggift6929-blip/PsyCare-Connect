import React, { useState } from 'react';
import { Activity, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DiepssAssessment, Patient, Medication } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';

interface DiepssAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  medications: Medication[];
  onSave: (record: Partial<DiepssAssessment>) => void;
}

export const DiepssAssessmentModal: React.FC<DiepssAssessmentModalProps> = ({
  isOpen,
  onClose,
  patient,
  medications,
  onSave
}) => {
  // Antipsychotics from medication list
  const antipsychotics = medications
    .filter(m => m.patientId === patient.id && (m.category === 'Antipsychotic' || m.name.toLowerCase().includes('clozapine') || m.name.toLowerCase().includes('risperidone') || m.name.toLowerCase().includes('haloperidol') || m.name.toLowerCase().includes('quetiapine') || m.name.toLowerCase().includes('olanzapine') || m.name.toLowerCase().includes('paliperidone')));

  const defaultDrug = antipsychotics[0]?.name || 'Antipsychotic Therapy';

  const [antipsychoticDrug, setAntipsychoticDrug] = useState(defaultDrug);
  const [gait, setGait] = useState(0);
  const [kineticTremor, setKineticTremor] = useState(0);
  const [restTremor, setRestTremor] = useState(0);
  const [sialorrhea, setSialorrhea] = useState(0);
  const [muscleRigidity, setMuscleRigidity] = useState(0);
  const [akathisia, setAkathisia] = useState(0);
  const [dystonia, setDystonia] = useState(0);
  const [dyskinesia, setDyskinesia] = useState(0);
  const [overallSeverity, setOverallSeverity] = useState(0);
  const [actionPlan, setActionPlan] = useState('');
  const [evaluatedBy, setEvaluatedBy] = useState('ภญ.สุภิตา ทองขำ (เภสัชกรชำนาญการ)');

  if (!isOpen) return null;

  const totalScore = gait + kineticTremor + restTremor + sialorrhea + muscleRigidity + akathisia + dystonia + dyskinesia + overallSeverity;

  let severityLabel = 'Normal (ปกติ)';
  let severityBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (totalScore >= 16 || overallSeverity === 4) {
    severityLabel = 'Severe (รุนแรงมาก)';
    severityBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (totalScore >= 8 || overallSeverity === 3) {
    severityLabel = 'Moderate (ปานกลาง)';
    severityBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (totalScore > 0) {
    severityLabel = 'Minimal / Mild (เล็กน้อย-เบา)';
    severityBadgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }

  const items = [
    { id: 'gait', title: 'Gait (การเดิน)', desc: 'การแกว่งแขนลดลง, เดินก้าวสั้น, เดินซอยเท้าช้า (Parkinsonian gait)', val: gait, set: setGait },
    { id: 'kineticTremor', title: 'Kinetic tremor (อาการสั่นขณะเคลื่อนไหว)', desc: 'สั่นขณะหยิบจับสิ่งของ หรือขณะยื่นมือตรวจ Finger-to-nose', val: kineticTremor, set: setKineticTremor },
    { id: 'restTremor', title: 'Rest tremor (อาการสั่นขณะพัก)', desc: 'สั่นแบบ Pill-rolling ขณะวางมือพักบนตักหรือแขนเก้าอี้', val: restTremor, set: setRestTremor },
    { id: 'sialorrhea', title: 'Sialorrhea (ภาวะน้ำลายไหลยืด)', desc: 'น้ำลายสอ ล้นปาก เลอะหมอนตอนนอนหลับ พบบ่อยใน Clozapine', val: sialorrhea, set: setSialorrhea },
    { id: 'muscleRigidity', title: 'Muscle rigidity (อาการกล้ามเนื้อเกร็ง)', desc: 'ความต้านทานต่อการเคลื่อนไหวแบบฟันเฟือง (Cogwheel rigidity) ที่ข้อมือ/ข้อศอก', val: muscleRigidity, set: setMuscleRigidity },
    { id: 'akathisia', title: 'Akathisia (ภาวะกระสับกระส่ายอยู่ไม่นิ่ง)', desc: 'รู้สึกกระวนกระวาย ขยับขา ย่ำเท้าตลอดเวลา นั่งเฉยๆ ไม่ได้', val: akathisia, set: setAkathisia },
    { id: 'dystonia', title: 'Dystonia (กล้ามเนื้อบิดเกร็งเฉียบพลัน)', desc: 'คอบิดเกร็ง, ตากลอกขึ้นบนค้าง (Oculogyric crisis), กรามเกร็ง', val: dystonia, set: setDystonia },
    { id: 'dyskinesia', title: 'Dyskinesia (การเคลื่อนไหวผิดรูปผิดร่าง)', desc: 'เคี้ยวปาก ลิ้นดุนกระพุ้งแก้ม (Orofacial dyskinesia), ขยับนิ้วมือคล้ายเล่นเปียโน', val: dyskinesia, set: setDyskinesia },
    { id: 'overallSeverity', title: 'Overall Severity (ความรุนแรงในภาพรวม)', desc: 'ระดับความรุนแรงของอาการ EPS ทั้งหมดที่มีผลกระทบต่อการใช้ชีวิตประจำวันของผู้ป่วย', val: overallSeverity, set: setOverallSeverity },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      patientId: patient.id,
      hn: patient.hn,
      date: new Date().toISOString().split('T')[0],
      antipsychoticDrug: antipsychoticDrug.trim(),
      gait,
      kineticTremor,
      restTremor,
      sialorrhea,
      muscleRigidity,
      akathisia,
      dystonia,
      dyskinesia,
      overallSeverity,
      totalScore,
      actionPlan: actionPlan.trim(),
      evaluatedBy: evaluatedBy.trim() || 'เภสัชกร/แพทย์'
    });

    onClose();
  };

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      title="แบบประเมินอาการข้างเคียงทางระบบประสาท DIEPSS (EPS Scale)"
      subtitle={`ผู้ป่วย: ${patient.name} (HN: ${patient.hn}) • วินิจฉัย: ${patient.diagnosis}`}
      badgeText="Extrapyramidal Symptoms"
      badgeColor="rose"
      confidentialNotice="เวชระเบียนประเมินอาการไม่พึงประสงค์จากยารักษาโรคจิต (DIEPSS Extrapyramidal Symptom Record)"
      footer={
        <div className="flex items-center justify-end w-full gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            บันทึกคะแนน DIEPSS &amp; ซิงค์ข้อมูล
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Drug Context & Instruction */}
        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-amber-900 block">ยาต้านโรคจิตที่เกี่ยวข้อง (Antipsychotic Drug):</span>
            <input
              type="text"
              value={antipsychoticDrug}
              onChange={(e) => setAntipsychoticDrug(e.target.value)}
              placeholder="ระบุชื่อยา เช่น Haloperidol, Risperidone, Clozapine, Paliperidone"
              className="mt-1 p-1.5 text-xs bg-white border border-amber-300 rounded-lg w-full sm:w-80"
            />
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">คะแนนเต็ม 36 คะแนน (9 หัวข้อ)</span>
            <span className="text-xs font-bold text-amber-800">เกณฑ์ 0 = Normal ถึง 4 = Severe</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Table Matrix */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[11px] text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-5/12 font-bold">อาการข้างเคียงทางระบบประสาท (9 หัวข้อหลัก)</th>
                  <th className="p-2 text-center">0<br/><span className="text-[10px] font-normal">Normal</span></th>
                  <th className="p-2 text-center">1<br/><span className="text-[10px] font-normal">Minimal</span></th>
                  <th className="p-2 text-center">2<br/><span className="text-[10px] font-normal">Mild</span></th>
                  <th className="p-2 text-center">3<br/><span className="text-[10px] font-normal">Moderate</span></th>
                  <th className="p-2 text-center">4<br/><span className="text-[10px] font-normal">Severe</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-amber-50/20 transition">
                    <td className="p-3">
                      <strong className="text-slate-900 block">{it.title}</strong>
                      <span className="text-[10px] text-slate-500 block">{it.desc}</span>
                    </td>
                    {[0, 1, 2, 3, 4].map((score) => (
                      <td key={score} className="p-2 text-center">
                        <label className="flex items-center justify-center p-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`diepss_${it.id}`}
                            value={score}
                            checked={it.val === score}
                            onChange={() => it.set(score)}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-400 cursor-pointer"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Real-time Summary Tile */}
          <div className="p-4 rounded-xl border bg-slate-50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="font-bold text-xs text-slate-900">
                  คะแนน DIEPSS รวม: <span className="text-base text-amber-700 font-bold">{totalScore}</span> / 36 คะแนน
                </h4>
                <p className="text-[11px] text-slate-500">
                  ระดับความรุนแรงในภาพรวม (Overall Severity): {overallSeverity} / 4
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${severityBadgeColor}`}>
              {severityLabel}
            </span>
          </div>

          {/* Action Plan & Pharmacist Intervention */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">
              แผนการจัดการและการบริบาลทางเภสัชกรรม (Intervention &amp; Action Plan):
            </label>
            <textarea
              rows={2}
              placeholder="เช่น มี Akathisia ปานกลาง แนะนำประสานแพทย์พิจารณา Propranolol 10-20 mg หรือมี Tremor/Rigidity พิจารณาให้ Trihexyphenidyl 2 mg..."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Evaluator */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">แพทย์ / เภสัชกร / ผู้ประเมิน:</label>
            <input
              type="text"
              value={evaluatedBy}
              onChange={(e) => setEvaluatedBy(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </form>
      </div>
    </PsychiatricModalFrame>
  );
};
