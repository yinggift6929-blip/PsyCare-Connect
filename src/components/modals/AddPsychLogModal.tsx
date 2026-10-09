import React, { useState } from 'react';
import { Brain, X } from 'lucide-react';
import { PsychRecord, Patient } from '../../types.ts';

interface AddPsychLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (psychLog: Partial<PsychRecord>) => void;
}

export const AddPsychLogModal: React.FC<AddPsychLogModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [phq9Score, setPhq9Score] = useState('10');
  const [suicideRisk8q, setSuicideRisk8q] = useState('0 (ไม่มีความเสี่ยง)');
  const [gad7Score, setGad7Score] = useState('');
  const [therapyType, setTherapyType] = useState('CBT (การปรับความคิดและพฤติกรรม)');
  const [sessionNumber, setSessionNumber] = useState('ครั้งที่ 1');
  const [counselingNotes, setCounselingNotes] = useState('');
  const [psychologistName, setPsychologistName] = useState('นจต.นภัสสร (นักจิตวิทยาคลินิก)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselingNotes.trim()) {
      alert('กรุณากรอกบันทึกการปรึกษา/การบำบัดทางจิต');
      return;
    }

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      date: new Date().toISOString().split('T')[0],
      phq9Score: parseInt(phq9Score) || 0,
      suicideRisk8q,
      gad7Score: gad7Score ? parseInt(gad7Score) : undefined,
      therapyType,
      sessionNumber,
      counselingNotes: counselingNotes.trim(),
      psychologistName: psychologistName.trim() || 'นักจิตวิทยาคลินิก'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">บันทึกผลประเมินจิตวิทยา / CBT</h3>
              <p className="text-xs text-slate-500">สำหรับผู้ป่วย {patient.name} (HN: {patient.hn})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">คะแนน PHQ-9 (0-27):</label>
              <input
                type="number"
                min="0"
                max="27"
                required
                value={phq9Score}
                onChange={(e) => setPhq9Score(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">คะแนนวิตกกังวล GAD-7 (0-21):</label>
              <input
                type="number"
                min="0"
                max="21"
                placeholder="ไม่บังคับ"
                value={gad7Score}
                onChange={(e) => setGad7Score(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ระดับความเสี่ยงฆ่าตัวตาย (8Q / 9Q):</label>
            <select
              value={suicideRisk8q}
              onChange={(e) => setSuicideRisk8q(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="0 (ไม่มีความเสี่ยง)">0 (ไม่มีความเสี่ยง)</option>
              <option value="ต่ำ (8Q = 1-8)">ต่ำ (8Q = 1-8 คะแนน)</option>
              <option value="ปานกลาง (8Q = 9-16)">ปานกลาง (8Q = 9-16 คะแนน)</option>
              <option value="รุนแรง (8Q ≥ 17)">รุนแรง (8Q ≥ 17 คะแนน - Safety Alert)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">รูปแบบการบำบัดทางจิต:</label>
              <select
                value={therapyType}
                onChange={(e) => setTherapyType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="CBT (การปรับความคิดและพฤติกรรม)">CBT (การปรับความคิดและพฤติกรรม)</option>
                <option value="Motivational Interviewing (MI)">Motivational Interviewing (MI)</option>
                <option value="Psychoeducation & Relapse Prevention">Psychoeducation & ป้องกันกำเริบ</option>
                <option value="Supportive Counseling">Supportive Counseling</option>
                <option value="Family Psychoeducation">Family Psychoeducation</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ครั้งที่บำบัด (Session):</label>
              <input
                type="text"
                placeholder="เช่น ครั้งที่ 2 / 6"
                value={sessionNumber}
                onChange={(e) => setSessionNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">บันทึกการให้คำปรึกษา / เทคนิคที่ใช้: *</label>
            <textarea
              rows={3}
              required
              placeholder="บันทึกประเด็นความคิดลบอัตโนมัติ การมอบหมายการบ้าน การฝึกผ่อนคลาย หรือ Safety Plan..."
              value={counselingNotes}
              onChange={(e) => setCounselingNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">นักจิตวิทยาผู้บันทึก:</label>
            <input
              type="text"
              value={psychologistName}
              onChange={(e) => setPsychologistName(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              บันทึกผลประเมิน & ซิงค์ Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
