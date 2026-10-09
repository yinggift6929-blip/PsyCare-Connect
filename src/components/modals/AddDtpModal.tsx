import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { DtpRecord, DtpDomain, Patient } from '../../types.ts';

interface AddDtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (dtp: Partial<DtpRecord>) => void;
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
  const [recordedBy, setRecordedBy] = useState('ภญ.สุพิชฌาย์ (เภสัชกรคลินิก)');

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
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">บันทึกปัญหาจากการใช้ยา (DTP)</h3>
              <p className="text-xs text-slate-500">สำหรับผู้ป่วย {patient.name} (HN: {patient.hn})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ประเภทปัญหา DTP (Domain):</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="Non-adherence">Non-adherence (ขาดยา / ลืมทานยา / หยุดยาเอง)</option>
              <option value="Adverse Drug Reaction / EPS">Adverse Drug Reaction / EPS (อาการข้างเคียง / สั่นเกร็ง)</option>
              <option value="Drug Interaction">Drug Interaction (ปฏิกิริยาระหว่างยา เช่น Lithium + NSAIDs)</option>
              <option value="Subtherapeutic Dose">Subtherapeutic Dose (ขนาดยาต่ำเกินไป อาการยังไม่คุม)</option>
              <option value="Overdosage">Overdosage (ขนาดยาเกินขนาด / เสี่ยงต่อพิษ)</option>
              <option value="Unnecessary Drug Therapy">Unnecessary Drug Therapy (ยาซ้ำซ้อน / ไม่มีข้อบ่งชี้)</option>
              <option value="Need Additional Therapy">Need Additional Therapy (ต้องการยาเพิ่มเติม)</option>
              <option value="Safety Monitoring">Safety Monitoring (ต้องตรวจ Lab ติดตามความปลอดภัย เช่น CBC/ANC)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ยาสาเหตุ (Cause Drug):</label>
            <input
              type="text"
              placeholder="เช่น Clozapine, Haloperidol, Lithium, Sertraline"
              value={causeDrug}
              onChange={(e) => setCauseDrug(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">รายละเอียดปัญหาที่พบ: *</label>
            <textarea
              rows={3}
              required
              placeholder="ระบุเหตุการณ์ อาการ หรือความเสี่ยงที่พบจากการซักประวัติ/ตรวจ Lab..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">การบริบาลทางเภสัชกรรม / ข้อเสนอแนะ (Intervention): *</label>
            <textarea
              rows={3}
              required
              placeholder="เช่น ปรึกษาแพทย์ปรับลดขนาดยา, ให้สุขศึกษาการทานยาพร้อมอาหาร, ส่งต่อทีมพยาบาล..."
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ผู้บันทึก (Recorded By):</label>
            <input
              type="text"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              บันทึก DTP & ซิงค์ Google Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
