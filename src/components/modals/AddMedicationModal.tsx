import React, { useState } from 'react';
import { Pill, X } from 'lucide-react';
import { Medication, Patient } from '../../types.ts';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (med: Partial<Medication>) => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('Antipsychotic');
  const [sig, setSig] = useState('');
  const [indication, setIndication] = useState('');
  const [adherence, setAdherence] = useState('100');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sig.trim()) {
      alert('กรุณากรอกชื่อยาและวิธีใช้');
      return;
    }

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      name: name.trim(),
      category,
      sig: sig.trim(),
      indication: indication.trim() || 'ควบคุมอาการทางจิตเวช',
      adherence: Math.min(100, Math.max(0, parseInt(adherence) || 100)),
      notes: notes.trim() || undefined,
      startDate: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">เพิ่มรายการยา</h3>
              <p className="text-xs text-slate-500">สำหรับผู้ป่วย {patient.name} (HN: {patient.hn})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ชื่อยาและขนาดยา (Drug Name & Strength): *</label>
            <input
              type="text"
              required
              placeholder="เช่น Risperidone 2 mg tab หรือ Clozapine 100 mg tab"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">กลุ่มยา (Category):</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="Antipsychotic">Antipsychotic (ยารักษาโรคจิต)</option>
                <option value="Mood Stabilizer">Mood Stabilizer (ยาปรับอารมณ์)</option>
                <option value="Antidepressant">Antidepressant (ยาต้านเศร้า)</option>
                <option value="Anxiolytic">Anxiolytic / Sedative (ยานอนหลับ/คลายกังวล)</option>
                <option value="Antiparkinson">Antiparkinsonian (ยาแก้ผลข้างเคียง EPS)</option>
                <option value="General">Somatic / ยาโรคประจำตัวทั่วไป</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Adherence (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={adherence}
                onChange={(e) => setAdherence(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">วิธีใช้ (Sig): *</label>
            <input
              type="text"
              required
              placeholder="เช่น รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนนอน"
              value={sig}
              onChange={(e) => setSig(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ข้อบ่งชี้ (Indication):</label>
            <input
              type="text"
              placeholder="เช่น คุมอาการประสาทหลอน, ปรับสมดุลอารมณ์, ช่วยการนอน"
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">หมายเหตุ / คำเตือนเภสัชกรรม:</label>
            <input
              type="text"
              placeholder="เช่น เฝ้าระวัง ANC, ห้ามทานร่วมกับ NSAIDs, ทานพร้อมอาหาร"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              บันทึกยา & ซิงค์ Google Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
