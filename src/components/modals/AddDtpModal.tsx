import React, { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { DtpRecord, DtpDomain, Patient } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';

interface AddDtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (dtp: Partial<DtpRecord>, notifyTelegram?: boolean) => void;
}

export const AddDtpModal: React.FC<AddDtpModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [domain, setDomain] = useState<DtpDomain>('Non-adherence');
  const [description, setDescription] = useState('');
  const [causeDrug, setCauseDrug] = useState('');
  const [intervention, setIntervention] = useState('');
  const [recordedBy, setRecordedBy] = useState('ภญ.สุภิตา ทองขำ (เภสัชกรชำนาญการ)');
  const [notifyTelegram, setNotifyTelegram] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !intervention.trim()) {
      alert('กรุณากรอกรายละเอียดปัญหาและการแก้ไข (Intervention)');
      return;
    }

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      date: new Date().toISOString().split('T')[0],
      domain,
      description: description.trim(),
      causeDrug: causeDrug.trim(),
      intervention: intervention.trim(),
      status: 'pending',
      recordedBy: recordedBy.trim() || 'เภสัชกร'
    }, notifyTelegram);

    onClose();
  };

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      title="บันทึกปัญหาจากการใช้ยาทางจิตเวช (DTP)"
      subtitle={`ผู้ป่วย: ${patient.name} (HN: ${patient.hn}) • วินิจฉัย: ${patient.diagnosis}`}
      badgeText="Clinical DRPs"
      badgeColor="rose"
      confidentialNotice="เวชระเบียนบริบาลทางเภสัชกรรมและความปลอดภัยในการใช้ยา (Pharmacotherapy Record)"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-sky-800 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200">
            <input
              type="checkbox"
              checked={notifyTelegram}
              onChange={(e) => setNotifyTelegram(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <Send className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-semibold">แจ้งเตือนเข้า Telegram กลุ่ม Clinic จิตดี (-5506194529)</span>
          </label>

          <div className="flex items-center gap-2">
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
              className="px-5 py-2 text-xs bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              บันทึก DTP &amp; ส่งข้อมูล
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            หัวข้อปัญหาจากการใช้ยา (DRPs) <span className="text-rose-500">*</span>
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value as any)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium"
          >
            <optgroup label="2.1 - 2.4 กลุ่ม Non adherence (ความร่วมมือการใช้ยา)">
              <option value="Non adherence - ลืมกินยา">2.1 Non adherence - ลืมกินยา</option>
              <option value="Non adherence - กินยาผิดขนาด มากกว่าแพทย์สั่ง">2.2 Non adherence - กินยาผิดขนาด มากกว่าแพทย์สั่ง</option>
              <option value="Non adherence - กินยาผิดขนาด น้อยกว่าแพทย์สั่ง">2.3 Non adherence - กินยาผิดขนาด น้อยกว่าแพทย์สั่ง</option>
              <option value="Non adherence - หยุดกินยาเอง">2.4 Non adherence - หยุดกินยาเอง</option>
            </optgroup>
            <optgroup label="2.5 - 2.6 อาการไม่พึงประสงค์ &amp; อันตรกิริยา">
              <option value="เกิด ADR ได้แก่ EPS สั่น เกร็ง">2.5 เกิด ADR ได้แก่ EPS สั่น เกร็ง</option>
              <option value="เกิด Drug interaction (DI)">2.6 เกิด Drug interaction (DI)</option>
            </optgroup>
            <optgroup label="หัวข้อ DRPs อื่นๆ">
              <option value="Subtherapeutic Dose">Subtherapeutic Dose (ขนาดยาต่ำกว่าเกณฑ์การรักษา)</option>
              <option value="Overdosage">Overdosage (ขนาดยาเกินขนาด)</option>
              <option value="Unnecessary Drug Therapy">Unnecessary Drug Therapy (ยาซ้ำซ้อน / ไม่มีข้อบ่งชี้)</option>
              <option value="Need Additional Therapy">Need Additional Therapy (ต้องการยาเพิ่มเติม)</option>
              <option value="Safety Monitoring">Safety Monitoring (เฝ้าระวังความปลอดภัย เช่น CBC, ANC, Lab)</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">ยาสาเหตุ (Cause Drug):</label>
          <input
            type="text"
            placeholder="เช่น Clozapine, Haloperidol, Lithium, Risperidone, Sertraline"
            value={causeDrug}
            onChange={(e) => setCauseDrug(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            รายละเอียดปัญหาที่พบ: <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="ระบุเหตุการณ์ อาการ หรือความเสี่ยงที่พบจากการซักประวัติ/ตรวจ Lab/สังเกตอาการ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            การบริบาลทางเภสัชกรรม / ข้อเสนอแนะ (Intervention): <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="เช่น ปรึกษาแพทย์ปรับลดขนาดยา, สุขศึกษาการทานยาพร้อมอาหาร, ส่งต่อทีมสหวิชาชีพติดตาม..."
            value={intervention}
            onChange={(e) => setIntervention(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">ผู้บันทึก (Recorded By):</label>
          <input
            type="text"
            value={recordedBy}
            onChange={(e) => setRecordedBy(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      </form>
    </PsychiatricModalFrame>
  );
};
