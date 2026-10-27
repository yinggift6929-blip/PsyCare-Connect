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
  onSave: (
    nurseLog: Partial<NurseRecord>,
    medRecHandover?: { needMedRec: boolean; hospital: string; details: string }
  ) => void;
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

  // Medication Reconciliation Referral to Pharmacist
  const [needMedRec, setNeedMedRec] = useState(false);
  const [medRecHospital, setMedRecHospital] = useState('');
  const [medRecDetails, setMedRecDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mseObservation.trim()) {
      alert('กรุณากรอกผลการสังเกตสภาวะจิต (MSE)');
      return;
    }

    if (needMedRec && !medRecHospital.trim()) {
      alert('กรุณาระบุชื่อโรงพยาบาลเดิมหรือแหล่งที่ผู้ป่วยรับยา');
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
      nurseName: nurseName.trim() || 'พยาบาลจิตเวช',
      medRecRequested: needMedRec,
      medRecOtherHospital: needMedRec ? medRecHospital.trim() : undefined,
      medRecDetails: needMedRec ? medRecDetails.trim() : undefined
    }, needMedRec ? {
      needMedRec: true,
      hospital: medRecHospital.trim(),
      details: medRecDetails.trim()
    } : undefined);

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

        {/* ส่งต่อข้อมูลเพื่อให้เภสัชกรสอบถาม ประวัติการรับยาจาก รพ.อื่น (Medication Reconciliation) */}
        <div className={`p-3.5 rounded-2xl border transition ${
          needMedRec 
            ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200 shadow-2xs' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={needMedRec}
              onChange={(e) => setNeedMedRec(e.target.checked)}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer shrink-0"
            />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
                <span>🏥 ส่งต่อเภสัชกรสอบถามประวัติการรับยาจาก รพ.อื่น (Medication Reconciliation)</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                  ส่งต่อเภสัชกร
                </span>
              </span>
              <p className="text-[11px] text-slate-500 leading-tight">
                ติ๊กเลือกหากพยาบาลซักประวัติพบผู้ป่วยมีประวัติรับยาจาก รพ.อื่น / คลินิกอื่น หรือมียาโรคประจำตัวเดิม เพื่อให้เภสัชกรช่วยตรวจสอบและประสานรายการยา
              </p>
            </div>
          </label>

          {needMedRec && (
            <div className="mt-3 pt-3 border-t border-amber-200 space-y-2.5 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  ชื่อโรงพยาบาลเดิม / คลินิกที่ผู้ป่วยรับยา: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={needMedRec}
                  placeholder="เช่น รพ.ศูนย์หาดใหญ่, รพ.จิตเวชสงขลา, รพ.สต., คลินิกนอก"
                  value={medRecHospital}
                  onChange={(e) => setMedRecHospital(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  รายละเอียดรายการยาหรือข้อมูลที่พบจากการซักประวัติ:
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ผู้ป่วยแจ้งว่ามียาความดันและเบาหวานรับจาก รพ.เดิม, ทานยาชุดแก้ปวดร่วมด้วย, หรือหยุดยาจิตเวชเดิม..."
                  value={medRecDetails}
                  onChange={(e) => setMedRecDetails(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="p-2 bg-white/90 rounded-lg border border-amber-200 text-[10px] text-amber-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>ระบบจะส่งข้อความแจ้งเตือนถึงเภสัชกรในกระดานส่งต่อและกลุ่ม Telegram ทันทีที่บันทึก</span>
              </div>
            </div>
          )}
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
