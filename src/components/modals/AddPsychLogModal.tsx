import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { PsychRecord, Patient } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';

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
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      title="บันทึกผลการบำบัดทางจิตวิทยา (Psychological Therapy &amp; CBT)"
      subtitle={`ผู้ป่วย: ${patient.name} (HN: ${patient.hn}) • วินิจฉัย: ${patient.diagnosis}`}
      badgeText="Psychology"
      badgeColor="amber"
      confidentialNotice="เวชระเบียนการประเมินจิตวิทยาคลินิกและการบำบัดรายบุคคล (Psychological Counseling Record)"
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
            บันทึกผลจิตวิทยา &amp; ซิงค์ข้อมูล
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">คะแนนคัดกรองซึมเศร้า (PHQ-9):</label>
            <input
              type="number"
              min="0"
              max="27"
              placeholder="0-27"
              value={phq9Score}
              onChange={(e) => setPhq9Score(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">ความเสี่ยงฆ่าตัวตาย (8Q):</label>
            <select
              value={suicideRisk8q}
              onChange={(e) => setSuicideRisk8q(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="0 (ไม่มีความเสี่ยง)">0 (ไม่มีความเสี่ยง)</option>
              <option value="1-8 (ความเสี่ยงน้อย)">1-8 (ความเสี่ยงน้อย)</option>
              <option value="9-16 (ความเสี่ยงปานกลาง)">9-16 (ความเสี่ยงปานกลาง)</option>
              <option value=">=17 (ความเสี่ยงรุนแรง)">>=17 (ความเสี่ยงรุนแรง)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">คะแนนวิตกกังวล (GAD-7):</label>
            <input
              type="number"
              min="0"
              max="21"
              placeholder="0-21 (ไม่บังคับ)"
              value={gad7Score}
              onChange={(e) => setGad7Score(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">ครั้งที่บำบัด:</label>
            <input
              type="text"
              placeholder="ครั้งที่ 1"
              value={sessionNumber}
              onChange={(e) => setSessionNumber(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">รูปแบบการบำบัด (Therapy Modality):</label>
          <select
            value={therapyType}
            onChange={(e) => setTherapyType(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="CBT (การปรับความคิดและพฤติกรรม)">CBT (การปรับความคิดและพฤติกรรม)</option>
            <option value="Motivational Interviewing (MI)">Motivational Interviewing (MI - สร้างแรงจูงใจ)</option>
            <option value="Supportive Psychotherapy">Supportive Psychotherapy (ประคับประคองจิตใจ)</option>
            <option value="Psychoeducation">Psychoeducation (จิตศึกษาแก่ผู้ป่วยและครอบครัว)</option>
            <option value="Behavioral Activation">Behavioral Activation (กระตุ้นพฤติกรรมเชิงบวก)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            บันทึกการปรึกษา / ประเด็นหลัก (Counseling Notes): <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="ประเด็นปัญหา ความคิดอัตโนมัติ กลไกทางจิต แผนการมอบหมายงาน (Homework)..."
            value={counselingNotes}
            onChange={(e) => setCounselingNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">นักจิตวิทยาผู้บันทึก:</label>
          <input
            type="text"
            value={psychologistName}
            onChange={(e) => setPsychologistName(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </form>
    </PsychiatricModalFrame>
  );
};
