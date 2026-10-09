import React, { useState } from 'react';
import { PhoneCall, X, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { TelemedRecord, Patient } from '../../types.ts';

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
  const [recordedBy, setRecordedBy] = useState('ภญ.สุพิชฌาย์ (เภสัชกรคลินิก)');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto custom-scrollbar space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                บันทึกการติดตามทางไกล (Telemedicine / Telepsychiatry)
              </h3>
              <p className="text-xs text-slate-500">
                ผู้ป่วย: {patient.name} (HN: {patient.hn}) • เบอร์โทร: {patient.phone || '-'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">วันที่ติดต่อ: *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ช่องทางการสื่อสาร:</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="โทรศัพท์ (Phone Call)">โทรศัพท์ (Phone Call)</option>
                <option value="วิดีโอคอล (Video Call)">วิดีโอคอล (Video Call)</option>
                <option value="LINE Official / ข้อความ">LINE Official / ข้อความ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ผู้รับสาย / ผู้ให้ข้อมูล:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="respondent"
                  value="ผู้ป่วยโดยตรง"
                  checked={respondent === 'ผู้ป่วยโดยตรง'}
                  onChange={() => setRespondent('ผู้ป่วยโดยตรง')}
                  className="text-teal-600"
                />
                <span>ผู้ป่วยโดยตรง</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="respondent"
                  value="ญาติ / ผู้ดูแลหลัก"
                  checked={respondent === 'ญาติ / ผู้ดูแลหลัก'}
                  onChange={() => setRespondent('ญาติ / ผู้ดูแลหลัก')}
                  className="text-teal-600"
                />
                <span>ญาติ / ผู้ดูแลหลัก</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">อาการทางจิตและอารมณ์ปัจจุบัน (Current Psychiatric Symptoms): *</label>
            <textarea
              rows={2}
              required
              placeholder="เช่น อาการหูแว่วสงบดี นอนหลับได้ อารมณ์แจ่มใสขึ้น ไม่มีพฤติกรรมก้าวร้าว..."
              value={symptomsStatus}
              onChange={(e) => setSymptomsStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ความร่วมมือการทานยา (Adherence):</label>
              <input
                type="text"
                value={adherenceStatus}
                onChange={(e) => setAdherenceStatus(e.target.value)}
                placeholder="เช่น ทานครบ, ลืม 1 มื้อ, ขาดยา"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">อาการข้างเคียงที่รายงาน (Side Effects):</label>
              <input
                type="text"
                value={sideEffectsStatus}
                onChange={(e) => setSideEffectsStatus(e.target.value)}
                placeholder="เช่น คลื่นไส้, มือสั่น, น้ำลายไหล, ง่วง"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">คำแนะนำทางเภสัชกรรมและการให้กำลังใจ (Counseling Provided): *</label>
            <textarea
              rows={2}
              required
              placeholder="คำแนะนำการปรับเวลาทานยา การจัดการผลข้างเคียง และการนัดหมาย..."
              value={counselingProvided}
              onChange={(e) => setCounselingProvided(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Continuous Appointment Tracking (Requirement 4) */}
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
            <span className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-teal-600" />
              กำหนดวันนัดติดตามต่อเนื่อง (Next Follow-up Appointment):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">วันนัดครั้งถัดไป:</label>
                <input
                  type="date"
                  value={nextAppointmentDate}
                  onChange={(e) => setNextAppointmentDate(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-teal-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">ประเภทการนัด:</label>
                <select
                  value={nextAppointmentType}
                  onChange={(e) => setNextAppointmentType(e.target.value as any)}
                  className="w-full p-1.5 text-xs bg-white border border-teal-200 rounded-lg"
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">ผู้ให้บริการ / ผู้บันทึก:</label>
            <input
              type="text"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
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
              บันทึก Telemed & ซิงค์ข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
