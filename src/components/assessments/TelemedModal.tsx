import React, { useState } from 'react';
import { PhoneCall, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { TelemedRecord, Patient } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';
import { ThaiAppointmentDatePicker } from '../common/ThaiAppointmentDatePicker.tsx';
import { TeamMemberSlider } from '../common/TeamMemberSlider.tsx';
import { getActiveTeamMember, formatMemberNameAndPosition, TeamMember } from '../../data/teamMembers.ts';

interface TelemedModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (record: Partial<TelemedRecord>, nextAppDate?: string, nextAppType?: 'home_visit' | 'telemed' | 'clinic', nextAppObj?: string) => void;
}

export const TelemedModal: React.FC<TelemedModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [selectedStaff, setSelectedStaff] = useState<TeamMember>(() => getActiveTeamMember());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState<'โทรศัพท์ (Phone Call)' | 'วิดีโอคอล (Video Call)' | 'LINE Official / ข้อความ'>('โทรศัพท์ (Phone Call)');
  const [respondent, setRespondent] = useState<'ผู้ป่วยโดยตรง' | 'ญาติ / ผู้ดูแลหลัก'>('ผู้ป่วยโดยตรง');
  const [symptomsStatus, setSymptomsStatus] = useState('');
  const [adherenceStatus, setAdherenceStatus] = useState('รับประทานยาครบสม่ำเสมอทุกวัน');
  const [sideEffectsStatus, setSideEffectsStatus] = useState('ไม่มีผลข้างเคียงรบกวน');
  const [counselingProvided, setCounselingProvided] = useState('');
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');
  const [nextAppointmentType, setNextAppointmentType] = useState<'home_visit' | 'telemed' | 'clinic'>('telemed');
  const [nextAppointmentObjective, setNextAppointmentObjective] = useState('');
  const [recordedBy, setRecordedBy] = useState(() => formatMemberNameAndPosition(getActiveTeamMember()));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsStatus.trim() && !counselingProvided.trim()) {
      alert('กรุณากรอกอาการที่รายงานหรือคำแนะนำทางเภสัชกรรม');
      return;
    }

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      date,
      channel,
      respondent,
      symptomsStatus: symptomsStatus.trim(),
      adherenceStatus: adherenceStatus.trim(),
      sideEffectsStatus: sideEffectsStatus.trim(),
      counselingProvided: counselingProvided.trim(),
      nextAppointmentDate: nextAppointmentDate || undefined,
      nextAppointmentType,
      recordedBy: recordedBy.trim()
    }, nextAppointmentDate || undefined, nextAppointmentType, nextAppointmentObjective.trim() || undefined);

    onClose();
  };

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={<PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      title="บันทึกการติดตามทางไกล (Telepsychiatry &amp; Telemed)"
      subtitle={`ผู้ป่วย: ${patient.name} (HN: ${patient.hn}) • วินิจฉัย: ${patient.diagnosis}`}
      badgeText="Telepsychiatry"
      badgeColor="emerald"
      confidentialNotice="เวชระเบียนการบริบาลและติดตามผู้ป่วยทางไกล (Telehealth Psychiatric Care)"
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
            บันทึก Telemed &amp; ซิงค์ข้อมูล
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">วันที่ติดต่อ (Date):</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">ช่องทางการสื่อสาร:</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            >
              <option value="โทรศัพท์ (Phone Call)">📞 โทรศัพท์ (Phone Call)</option>
              <option value="วิดีโอคอล (Video Call)">📹 วิดีโอคอล (Video Call)</option>
              <option value="LINE Official / ข้อความ">💬 LINE Official / ข้อความ</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">ผู้ให้ข้อมูล / ผู้รับสาย:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="resp"
                checked={respondent === 'ผู้ป่วยโดยตรง'}
                onChange={() => setRespondent('ผู้ป่วยโดยตรง')}
                className="text-teal-600"
              />
              <span>ผู้ป่วยโดยตรง</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="resp"
                checked={respondent === 'ญาติ / ผู้ดูแลหลัก'}
                onChange={() => setRespondent('ญาติ / ผู้ดูแลหลัก')}
                className="text-teal-600"
              />
              <span>ญาติ / ผู้ดูแลหลัก</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            สรุปอาการทางจิต / ปัญหาสุขภาพที่รายงาน: <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="เช่น อาการหลงผิดลดลง หลับได้ดี ไม่อ่อนเพลีย ไม่มีพฤติกรรมก้าวร้าว..."
            value={symptomsStatus}
            onChange={(e) => setSymptomsStatus(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">การรับประทานยา (Adherence):</label>
            <select
              value={adherenceStatus}
              onChange={(e) => setAdherenceStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="รับประทานยาครบสม่ำเสมอทุกวัน">✅ ทานยาครบสม่ำเสมอทุกวัน</option>
              <option value="ลืมทานยาบางมื้อ (1-2 ครั้ง/สัปดาห์)">⚠️ ลืมทานยาบางมื้อ (1-2 ครั้ง)</option>
              <option value="หยุดยาเอง / ปรับขนาดยาเอง">🛑 หยุดยาเอง / ปรับลดขนาดยาเอง</option>
              <option value="ยาใกล้หมดก่อนวันนัด">💊 ยาใกล้หมดก่อนวันนัด</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">อาการข้างเคียงจากยา (Side Effects):</label>
            <input
              type="text"
              placeholder="เช่น ปากแห้ง, มือสั่น, น้ำลายยืด, ไม่มี"
              value={sideEffectsStatus}
              onChange={(e) => setSideEffectsStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            คำแนะนำทางเภสัชกรรม / การให้สุขศึกษาจิตเวช: <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="เช่น แนะนำการดื่มน้ำบ่อยๆ, แนะนำการไม่หยุดยาเอง, เสริมแรงจูงใจในการทานยาต่อเนื่อง..."
            value={counselingProvided}
            onChange={(e) => setCounselingProvided(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        {/* Next Appointment Booking Section */}
        <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 space-y-2">
          <div className="flex items-center gap-1.5 text-teal-900 font-bold">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>นัดหมายติดตามครั้งถัดไป (Next Follow-up Plan)</span>
          </div>
          <div className="space-y-2.5">
            <ThaiAppointmentDatePicker
              value={nextAppointmentDate}
              onChange={setNextAppointmentDate}
              label="วันนัดครั้งถัดไป:"
              themeColor="teal"
            />
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">ประเภทการติดตาม:</label>
              <select
                value={nextAppointmentType}
                onChange={(e) => setNextAppointmentType(e.target.value as any)}
                className="w-full p-2 text-xs bg-white border border-teal-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                <option value="telemed">📱 โทร/ติดต่อ Telemed</option>
                <option value="home_visit">🏠 เยี่ยมบ้าน (Home Visit)</option>
                <option value="clinic">🏥 มาตรวจที่คลินิกจิตเวช</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-0.5">วัตถุประสงค์การติดตามต่อเนื่อง:</label>
            <input
              type="text"
              placeholder="เช่น โทรติดตามอาการคลื่นไส้ซ้ำ, ตรวจนับเม็ดยา, ส่งต่อพบแพทย์"
              value={nextAppointmentObjective}
              onChange={(e) => setNextAppointmentObjective(e.target.value)}
              className="w-full p-1.5 text-xs bg-white border border-teal-200 rounded-lg"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-teal-100">
          <TeamMemberSlider
            profession={selectedStaff.profession}
            selectedMemberId={selectedStaff.id}
            onSelectMember={(m) => {
              setSelectedStaff(m);
              setRecordedBy(formatMemberNameAndPosition(m));
            }}
            showProfessionTabs={true}
            compact={true}
            label="ผู้ให้บริการ / ผู้บันทึก Telemed"
            helperText="เลือกกลุ่มวิชาชีพและเลื่อนเลือกรายชื่อในกลุ่มวิชาชีพเดียวกัน ระบบจำค่าชื่อตำแหน่งอัตโนมัติ"
          />
        </div>
      </form>
    </PsychiatricModalFrame>
  );
};
