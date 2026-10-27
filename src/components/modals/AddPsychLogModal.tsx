import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { PsychRecord, Patient } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';
import { TeamMemberSlider } from '../common/TeamMemberSlider.tsx';
import { 
  getRememberedMemberForProfession, 
  formatMemberNameAndPosition,
  TeamMember 
} from '../../data/teamMembers.ts';

interface AddPsychLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (
    psychLog: Partial<PsychRecord>,
    medRecHandover?: { needMedRec: boolean; hospital: string; details: string }
  ) => void;
}

export const AddPsychLogModal: React.FC<AddPsychLogModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [selectedPsych, setSelectedPsych] = useState<TeamMember>(() => getRememberedMemberForProfession('psychologist'));
  const [phq9Score, setPhq9Score] = useState('10');
  const [suicideRisk8q, setSuicideRisk8q] = useState('0 (ไม่มีความเสี่ยง)');
  const [gad7Score, setGad7Score] = useState('');
  const [therapyType, setTherapyType] = useState('CBT (การปรับความคิดและพฤติกรรม)');
  const [sessionNumber, setSessionNumber] = useState('ครั้งที่ 1');
  const [counselingNotes, setCounselingNotes] = useState('');
  const [psychologistName, setPsychologistName] = useState(() => formatMemberNameAndPosition(getRememberedMemberForProfession('psychologist')));

  // Medication Reconciliation Referral to Pharmacist
  const [needMedRec, setNeedMedRec] = useState(false);
  const [medRecHospital, setMedRecHospital] = useState('');
  const [medRecDetails, setMedRecDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselingNotes.trim()) {
      alert('กรุณากรอกบันทึกการปรึกษา/การบำบัดทางจิต');
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
      phq9Score: parseInt(phq9Score) || 0,
      suicideRisk8q,
      gad7Score: gad7Score ? parseInt(gad7Score) : undefined,
      therapyType,
      sessionNumber,
      counselingNotes: counselingNotes.trim(),
      psychologistName: psychologistName.trim() || 'นักจิตวิทยาคลินิก',
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
              <option value=">=17 (ความเสี่ยงรุนแรง)">&ge; 17 (ความเสี่ยงรุนแรง)</option>
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
                <span>🏥 ส่งต่อเภสัชกร: สอบถามประวัติการรับยาจาก รพ.อื่น (Medication Reconciliation)</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                  ส่งต่อเภสัชกร
                </span>
              </span>
              <p className="text-[11px] text-slate-500 leading-tight">
                ติ๊กเลือกหากนักจิตวิทยาซักประวัติพบผู้ป่วยมีประวัติรับยาจาก รพ.อื่น / คลินิกนอก หรือหยุดยาเดิม เพื่อให้เภสัชกรช่วยตรวจสอบและประสานรายการยา
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
                  placeholder="เช่น รพ.ทั่วไป, รพ.จิตเวช, คลินิกจิตเวชนอก, ซื้อยาทานเอง"
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
                  placeholder="เช่น ผู้ป่วยให้ข้อมูลว่าเคยทานยาต้านเศร้าจาก รพ.อื่น, ทานยานอนหลับเพิ่มเอง, หรือมียาชุด..."
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

        <div className="pt-1 border-t border-amber-100">
          <TeamMemberSlider
            profession="psychologist"
            selectedMemberId={selectedPsych?.id}
            onSelectMember={(member) => {
              setSelectedPsych(member);
              setPsychologistName(formatMemberNameAndPosition(member));
            }}
            compact={true}
            label="นักจิตวิทยาผู้บันทึก (จำค่าตำแหน่งเดียวอัตโนมัติ)"
            helperText="กลุ่มวิชาชีพนี้มี 1 ตำแหน่ง ระบบจำค่าชื่อ น.ส.อัยมี สามะ (นักจิตวิทยา) ให้อัตโนมัติ"
          />
        </div>
      </form>
    </PsychiatricModalFrame>
  );
};
