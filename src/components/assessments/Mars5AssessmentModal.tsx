import React, { useState } from 'react';
import { ClipboardCheck, X, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Mars5Assessment, Patient } from '../../types.ts';

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
  const [evaluatedBy, setEvaluatedBy] = useState('ภญ.สุพิชฌาย์ (เภสัชกรคลินิก)');
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
      evaluatedBy: evaluatedBy.trim() || 'เภสัชกร',
      notes: notes.trim() || undefined
    }, autoUpdatePatientScore ? adherencePercent : undefined);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto custom-scrollbar space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                แบบประเมิน MARS-5 (Medication Adherence Report Scale)
              </h3>
              <p className="text-xs text-slate-500">
                ประเมินพฤติกรรมความร่วมมือในการใช้ยาของผู้ป่วย: {patient.name} (HN: {patient.hn})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instruction Banner */}
        <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-pink-900 mb-0.5">คำชี้แจง:</p>
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
              <tbody className="divide-y divide-slate-100">
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
                            className="w-4 h-4 text-pink-600 focus:ring-pink-400 cursor-pointer"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Real-time Score & Interpretation Result Box */}
          <div className={`p-4 rounded-xl border transition ${
            isGoodAdherence ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {isGoodAdherence ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    ผลการประเมิน: <span className={isGoodAdherence ? 'text-emerald-700' : 'text-amber-800'}>
                      {totalScore} / 25 คะแนน ({adherencePercent}%)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {isGoodAdherence 
                      ? 'เกณฑ์: ได้คะแนน ≥ 23-24 คะแนนขึ้นไป ถือว่ามี Adherence อยู่ในเกณฑ์ดี (High Adherence)'
                      : 'เกณฑ์: ได้คะแนน < 23 คะแนน มีความร่วมมือในการใช้ยาต่ำ-ปานกลาง เสี่ยงต่ออาการกำเริบ'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                  isGoodAdherence 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {isGoodAdherence ? '✓ Adherence ดีเยี่ยม' : '⚠️ ต้องเสริมสร้าง Adherence'}
                </span>
              </div>
            </div>
          </div>

          {/* Auto update toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={autoUpdatePatientScore}
              onChange={(e) => setAutoUpdatePatientScore(e.target.checked)}
              className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
            />
            <span>
              อัปเดตค่าความร่วมมือในการใช้ยา (Adherence Score: <strong>{adherencePercent}%</strong>) ในเวชระเบียนของผู้ป่วยอัตโนมัติ
            </span>
          </label>

          {/* Notes & Evaluator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">หมายเหตุเพิ่มเติม / ข้อสังเกต:</label>
              <input
                type="text"
                placeholder="เช่น ผู้ป่วยลืมทานเฉพาะมื้อกลางวัน, มีคนช่วยจัดยา..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">เภสัชกร/ผู้ประเมิน:</label>
              <input
                type="text"
                value={evaluatedBy}
                onChange={(e) => setEvaluatedBy(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              บันทึกผล MARS-5 & ซิงค์ Google Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
