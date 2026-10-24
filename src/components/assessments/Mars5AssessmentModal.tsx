import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Mars5Assessment, Patient } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';

interface Mars5AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (record: Partial<Mars5Assessment>, updatePatientAdherence?: number) => void;
}

export const Mars5AssessmentModal: React.FC<Mars5AssessmentModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [q1, setQ1] = useState(5); // ฉันลืมกินยา
  const [q2, setQ2] = useState(5); // ฉันหยุดกินยาเองชั่วคราว
  const [q3, setQ3] = useState(5); // ฉันหยุดกินยาเองเป็นบางช่วง
  const [q4, setQ4] = useState(5); // ฉันข้ามการกินยาบางมื้อ
  const [q5, setQ5] = useState(5); // ฉันกินยาน้อยกว่าที่หมอสั่ง
  const [evaluatedBy, setEvaluatedBy] = useState('ภญ.สุภิตา ทองขำ (เภสัชกรชำนาญการ)');
  const [notes, setNotes] = useState('');
  const [autoUpdatePatientScore, setAutoUpdatePatientScore] = useState(true);

  if (!isOpen) return null;

  const totalScore = q1 + q2 + q3 + q4 + q5;
  const isGoodAdherence = totalScore >= 23;
  const adherencePercent = Math.round((totalScore / 25) * 100);

  const questions = [
    { id: 1, text: '1. ฉันลืมกินยา', value: q1, setter: setQ1 },
    { id: 2, text: '2. ฉันหยุดกินยาเองชั่วคราว', value: q2, setter: setQ2 },
    { id: 3, text: '3. ฉันหยุดกินยาเองเป็นบางช่วง', value: q3, setter: setQ3 },
    { id: 4, text: '4. ฉันข้ามการกินยาบางมื้อ', value: q4, setter: setQ4 },
    { id: 5, text: '5. ฉันกินยาน้อยกว่าที่หมอสั่ง', value: q5, setter: setQ5 }
  ];

  const ratingOptions = [
    { score: 1, label: 'ทำเป็นประจำ (1)' },
    { score: 2, label: 'ทำบ่อยๆ (2)' },
    { score: 3, label: 'ทำบางครั้ง (3)' },
    { score: 4, label: 'ทำนานๆ ครั้ง (4)' },
    { score: 5, label: 'ไม่เคยทำเลย (5)' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interpretationText = isGoodAdherence
      ? `อยู่ในเกณฑ์ดี (High Adherence - ได้ ${totalScore}/25 คะแนน)`
      : `อยู่ในเกณฑ์ปานกลาง/ต่ำ (Moderate-Low Adherence - ได้ ${totalScore}/25 คะแนน)`;

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      date: new Date().toISOString().split('T')[0],
      q1,
      q2,
      q3,
      q4,
      q5,
      totalScore,
      interpretation: interpretationText,
      evaluatedBy: evaluatedBy.trim() || 'เภสัชกร/พยาบาล'
    }, autoUpdatePatientScore ? adherencePercent : undefined);

    onClose();
  };

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      icon={<ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      title="แบบประเมิน MARS-5 (Medication Adherence Report Scale)"
      subtitle={`ประเมินพฤติกรรมความร่วมมือในการใช้ยาของผู้ป่วย: ${patient.name} (HN: ${patient.hn})`}
      badgeText="Adherence Scale"
      badgeColor="emerald"
      confidentialNotice="เวชระเบียนประเมินพฤติกรรมความร่วมมือในการใช้ยาจิตเวช (Medication Adherence Record)"
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
            className="px-5 py-2 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            บันทึกผล MARS-5 &amp; ซิงค์ข้อมูล
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Instruction Banner */}
        <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-800 mb-0.5">คำชี้แจง:</p>
          <p>
            ใช้ประเมินพฤติกรรมการความร่วมมือในการใช้ยาของผู้ป่วย (Adherence) ผ่านคำถาม 5 ข้อ ให้ผู้ป่วยตอบตามความเป็นจริง (คะแนนเต็ม 25 คะแนน)
            โดย 1 = ทำเป็นประจำ, 2 = ทำบ่อยๆ, 3 = ทำบางครั้ง, 4 = ทำนานๆ ครั้ง, 5 = ไม่เคยทำเลย
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Table Matrix */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[11px] text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-5/12 font-bold">ข้อคำถาม (MARS-5 Items)</th>
                  {ratingOptions.map(opt => (
                    <th key={opt.score} className="p-2 text-center font-semibold">
                      <span className="block text-[10px] text-slate-500">{opt.label.split(' ')[0]}</span>
                      <span className="text-xs text-slate-800 font-bold">({opt.score})</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-pink-50/20 transition">
                    <td className="p-3 font-medium text-slate-800">{q.text}</td>
                    {ratingOptions.map((opt) => (
                      <td key={opt.score} className="p-2 text-center">
                        <label className="flex items-center justify-center p-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt.score}
                            checked={q.value === opt.score}
                            onChange={() => q.setter(opt.score)}
                            className="text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Real-time Score Preview Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
            isGoodAdherence ? 'bg-teal-50/70 border-teal-200' : 'bg-rose-50/70 border-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl text-white ${isGoodAdherence ? 'bg-teal-500' : 'bg-rose-500'}`}>
                {isGoodAdherence ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">
                  ผลรวมคะแนน MARS-5: {totalScore} / 25 คะแนน
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  การแปลผล: <strong className={isGoodAdherence ? 'text-teal-700' : 'text-rose-700'}>
                    {isGoodAdherence ? 'ความร่วมมือดี (High Adherence >= 23)' : 'ความร่วมมือต่ำ/ปานกลาง (Non-adherence < 23)'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-xl font-bold font-mono ${isGoodAdherence ? 'text-teal-600' : 'text-rose-600'}`}>
                {adherencePercent}%
              </span>
              <span className="block text-[10px] text-slate-500">Adherence Score</span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={autoUpdatePatientScore}
              onChange={(e) => setAutoUpdatePatientScore(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>อัปเดตเปอร์เซ็นต์ Adherence ในโปรไฟล์ผู้ป่วยโดยอัตโนมัติ ({adherencePercent}%)</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">บันทึกเพิ่มเติม / สาเหตุ:</label>
              <input
                type="text"
                placeholder="เช่น ผู้ป่วยลืมทานเฉพาะมื้อกลางวัน, มีคนช่วยจัดยา..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">เภสัชกร/ผู้ประเมิน:</label>
              <input
                type="text"
                value={evaluatedBy}
                onChange={(e) => setEvaluatedBy(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
        </form>
      </div>
    </PsychiatricModalFrame>
  );
};
