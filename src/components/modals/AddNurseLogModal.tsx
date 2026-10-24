import React, { useState } from 'react';
import { Stethoscope, CheckCircle2 } from 'lucide-react';
import { NurseRecord, Patient } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';
import { TeamMemberSlider } from '../common/TeamMemberSlider.tsx';
import { 
  getRememberedMemberForProfession, 
  formatMemberNameAndPosition, 
  TeamMember 
} from '../../data/teamMembers.ts';

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
  const [selectedNurse, setSelectedNurse] = useState<TeamMember>(() => getRememberedMemberForProfession('nurse'));
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('78');
  const [weight, setWeight] = useState('68');
  const [bmi, setBmi] = useState('23.5');
  const [depotDrug, setDepotDrug] = useState('');
  const [depotDate, setDepotDate] = useState('');
  const [dotObserved, setDotObserved] = useState(true);
  const [mseObservation, setMseObservation] = useState('');
  const [riskBehavior, setRiskBehavior] = useState('ปกติ ไม่พบพฤติกรรมก้าวร้าว');
  const [nurseName, setNurseName] = useState(() => formatMemberNameAndPosition(getRememberedMemberForProfession('nurse')));

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
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={<Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      title="บันทึกการพยาบาลจิตเวช (Psychiatric Nursing Care)"
      subtitle={`ผู้ป่วย: ${patient.name} (HN: ${patient.hn}) • วินิจฉัย: ${patient.diagnosis}`}
      badgeText="Nursing Care"
      badgeColor="emerald"
      confidentialNotice="เวชระเบียนการพยาบาลจิตเวชและความปลอดภัยผู้ป่วย (Psychiatric Nursing Record)"
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
            บันทึก Nurse Log &amp; ซิงค์ข้อมูล
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ความดันโลหิต (BP):</label>
            <input
              type="text"
              placeholder="120/80"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">ชีพจร (Pulse):</label>
            <input
              type="text"
              placeholder="78"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>

        <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 space-y-2">
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
          <label className="block font-bold text-slate-700 mb-1">
            การสังเกตสภาวะจิต (MSE Observation): <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="บันทึกการสบตา การพูดคุย อารมณ์ ท่าทาง ความร่วมมือในการสนทนา..."
            value={mseObservation}
            onChange={(e) => setMseObservation(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">พฤติกรรมเสี่ยงหรือความรุนแรง:</label>
          <input
            type="text"
            placeholder="เช่น ปกติ ไม่มีพฤติกรรมก้าวร้าว หรือ วุ่นวายสับสน"
            value={riskBehavior}
            onChange={(e) => setRiskBehavior(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="pt-1 border-t border-teal-100">
          <TeamMemberSlider
            profession="nurse"
            selectedMemberId={selectedNurse?.id}
            onSelectMember={(member) => {
              setSelectedNurse(member);
              setNurseName(formatMemberNameAndPosition(member));
            }}
            compact={true}
            label="พยาบาลวิชาชีพผู้บันทึก (เลือกจากแถบเลื่อน)"
            helperText="เลื่อนแถบเพื่อเลือกรายชื่อพยาบาลในกลุ่มวิชาชีพเดียวกัน ระบบจะจำค่าพยาบาลและตำแหน่งที่เลือกให้อัตโนมัติ"
          />
        </div>
      </form>
    </PsychiatricModalFrame>
  );
};
