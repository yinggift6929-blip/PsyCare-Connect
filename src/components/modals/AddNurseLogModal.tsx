import React, { useState } from 'react';
import { Stethoscope, X } from 'lucide-react';
import { NurseRecord, Patient } from '../../types.ts';

interface AddNurseLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (nurseLog: Partial<NurseRecord>) => void;
}

export const AddNurseLogModal: React.FC<AddNurseLogModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('78');
  const [weight, setWeight] = useState('68');
  const [bmi, setBmi] = useState('23.5');
  const [depotDrug, setDepotDrug] = useState('');
  const [depotDate, setDepotDate] = useState('');
  const [dotObserved, setDotObserved] = useState(true);
  const [mseObservation, setMseObservation] = useState('');
  const [riskBehavior, setRiskBehavior] = useState('ปกติ ไม่พบพฤติกรรมก้าวร้าว');
  const [nurseName, setNurseName] = useState('พว.ประภัสสร (พยาบาลจิตเวช)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mseObservation.trim()) {
      alert('กรุณากรอกผลการสังเกตสภาวะจิต (MSE)');
      return;
    }

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      date: new Date().toISOString().split('T')[0],
      bp: bp.trim(),
      pulse: pulse.trim(),
      weight: parseFloat(weight) || 60,
      bmi: parseFloat(bmi) || 22,
      depotDrug: depotDrug.trim() || undefined,
      depotDate: depotDate || undefined,
      dotObserved,
      mseObservation: mseObservation.trim(),
      riskBehavior: riskBehavior.trim(),
      nurseName: nurseName.trim() || 'พยาบาลจิตเวช'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">บันทึกการพยาบาลจิตเวช (Nurse Log)</h3>
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
              <label className="block font-bold text-slate-700 mb-1">ความดันโลหิต (BP):</label>
              <input
                type="text"
                placeholder="120/80"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ชีพจร (Pulse):</label>
              <input
                type="text"
                placeholder="78"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">น้ำหนัก (kg):</label>
              <input
                type="number"
                step="0.1"
                placeholder="68"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">BMI:</label>
              <input
                type="number"
                step="0.1"
                placeholder="23.5"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-900">
              <input
                type="checkbox"
                checked={dotObserved}
                onChange={(e) => setDotObserved(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span>ยืนยันผู้ป่วยรับประทานยาต่อหน้าพยาบาล (DOT)</span>
            </label>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-slate-600 mb-0.5">ยาฉีด Depot / LAI:</label>
                <input
                  type="text"
                  placeholder="เช่น Paliperidone 100 mg"
                  value={depotDrug}
                  onChange={(e) => setDepotDrug(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-teal-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-0.5">วันฉีด Depot:</label>
                <input
                  type="date"
                  value={depotDate}
                  onChange={(e) => setDepotDate(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-teal-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">การสังเกตสภาวะจิต (MSE Observation): *</label>
            <textarea
              rows={3}
              required
              placeholder="บันทึกการสบตา การพูดคุย อารมณ์ ท่าทาง ความร่วมมือในการสนทนา..."
              value={mseObservation}
              onChange={(e) => setMseObservation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">พฤติกรรมเสี่ยงหรือความรุนแรง:</label>
            <input
              type="text"
              placeholder="เช่น ปกติ ไม่มีพฤติกรรมก้าวร้าว หรือ วุ่นวายสับสน"
              value={riskBehavior}
              onChange={(e) => setRiskBehavior(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">พยาบาลผู้บันทึก:</label>
            <input
              type="text"
              value={nurseName}
              onChange={(e) => setNurseName(e.target.value)}
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              บันทึก Nurse Log & ซิงค์ Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
