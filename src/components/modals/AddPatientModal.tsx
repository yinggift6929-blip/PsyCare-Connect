import React, { useState } from 'react';
import { UserPlus, Home, PhoneCall, Building2, Venus, Mars } from 'lucide-react';
import { Patient, PatientTrackingGroup } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Partial<Patient>) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [hn, setHn] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('Schizophrenia (โรคจิตเภท)');
  const [customDiag, setCustomDiag] = useState('');
  const [trackingGroup, setTrackingGroup] = useState<PatientTrackingGroup>('home_visit');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hn.trim() || !name.trim()) {
      alert('กรุณากรอก HN และชื่อผู้ป่วย');
      return;
    }

    const finalDiag = diagnosis === 'อื่นๆ' ? customDiag.trim() || 'Psychiatric Condition' : diagnosis;

    onSave({
      hn: hn.trim(),
      name: name.trim(),
      gender,
      age: parseInt(age) || 30,
      diagnosis: finalDiag,
      trackingGroup,
      statusTag: 'General Psych',
      riskLevel: 'low',
      adherenceScore: 100, // ค่าเริ่มต้น 100% ประเมินจริงในขั้นตอนที่ 1 ของการบริบาลเภสัชกรรม
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      nextAppointmentType: trackingGroup === 'home_visit' ? 'home_visit' : trackingGroup === 'telemed' ? 'telemed' : 'clinic',
      lastVisit: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toLocaleString('th-TH')
    });

    onClose();
  };

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={<UserPlus className="w-5 h-5 text-white" />}
      title="เพิ่มผู้ป่วยจิตเวชรายใหม่"
      subtitle="บันทึกเวชระเบียนคลินิกสุขภาพจิตชุมชนและเชื่อมโยง Google Sheet"
      badgeText="OPD Registry"
      badgeColor="rose"
      confidentialNotice="การบันทึกเวชระเบียนผู้ป่วยจิตเวชรายใหม่ (New Patient Intake)"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* Tracking Group Selector */}
          <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-100 space-y-1.5">
            <label className="block font-bold text-slate-800">
              กลุ่มการติดตามผู้ป่วย (Care Tracking Group): *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTrackingGroup('home_visit')}
                className={`p-2 rounded-xl text-center font-bold border transition flex flex-col items-center gap-1 ${
                  trackingGroup === 'home_visit'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-indigo-50 border-slate-200'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>กลุ่มเยี่ยมบ้าน</span>
              </button>

              <button
                type="button"
                onClick={() => setTrackingGroup('telemed')}
                className={`p-2 rounded-xl text-center font-bold border transition flex flex-col items-center gap-1 ${
                  trackingGroup === 'telemed'
                    ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-teal-50 border-slate-200'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>กลุ่ม Telemed</span>
              </button>

              <button
                type="button"
                onClick={() => setTrackingGroup('clinic_dtp')}
                className={`p-2 rounded-xl text-center font-bold border transition flex flex-col items-center gap-1 ${
                  trackingGroup === 'clinic_dtp'
                    ? 'bg-rose-400 text-white border-rose-500 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-rose-50 border-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>กลุ่มคลินิก/DRPs</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">เลขประจำตัวผู้ป่วย (HN): *</label>
              <input
                type="text"
                required
                placeholder="เช่น 66-00982"
                value={hn}
                onChange={(e) => setHn(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล: *</label>
              <input
                type="text"
                required
                placeholder="เช่น นายประดิษฐ์ มีสุข"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">เพศ:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setGender('หญิง')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1 font-bold text-xs transition cursor-pointer ${
                    gender === 'หญิง'
                      ? 'bg-pink-100 text-pink-700 border-pink-400 ring-2 ring-pink-200 shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-pink-50 border-slate-200'
                  }`}
                  title="เพศหญิง"
                >
                  <Venus className="w-3.5 h-3.5 text-pink-600" />
                  <span>หญิง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('ชาย')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1 font-bold text-xs transition cursor-pointer ${
                    gender === 'ชาย'
                      ? 'bg-sky-100 text-sky-700 border-sky-400 ring-2 ring-sky-200 shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-sky-50 border-slate-200'
                  }`}
                  title="เพศชาย"
                >
                  <Mars className="w-3.5 h-3.5 text-sky-600" />
                  <span>ชาย</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">อายุ (ปี):</label>
              <input
                type="number"
                placeholder="40"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
              <input
                type="tel"
                placeholder="081-xxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ที่อยู่ (สำหรับการเยี่ยมบ้าน):</label>
              <input
                type="text"
                placeholder="บ้านเลขที่, หมู่, ตำบล, อำเภอ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">การวินิจฉัยหลัก (Psychiatric Diagnosis): *</label>
            <select
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium"
            >
              <option value="Schizophrenia (โรคจิตเภท)">Schizophrenia (โรคจิตเภท)</option>
              <option value="Major Depressive Disorder (โรคซึมเศร้า)">Major Depressive Disorder (โรคซึมเศร้า)</option>
              <option value="Bipolar I Disorder (อารมณ์สองขั้ว)">Bipolar I Disorder (อารมณ์สองขั้ว)</option>
              <option value="Schizoaffective Disorder">Schizoaffective Disorder</option>
              <option value="Generalized Anxiety Disorder">Generalized Anxiety Disorder (วิตกกังวล)</option>
              <option value="Substance-Induced Psychotic Disorder">Substance-Induced Psychotic Disorder</option>
              <option value="Dementia with BPSD">Dementia with BPSD</option>
              <option value="อื่นๆ">อื่นๆ (ระบุเอง)</option>
            </select>
          </div>

          {diagnosis === 'อื่นๆ' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">ระบุชื่อโรค:</label>
              <input
                type="text"
                placeholder="ระบุการวินิจฉัย"
                value={customDiag}
                onChange={(e) => setCustomDiag(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          )}

          {/* Telegram notification badge */}
          <div className="bg-sky-50/90 p-2.5 rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="font-semibold text-sky-950">
                📲 แจ้งเตือนคนไข้ใหม่เข้า Telegram กลุ่ม: <b>Clinic จิตดี (-5506194529)</b>
              </span>
            </div>
            <span className="text-[10px] bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-md font-medium">
              ส่งแจ้งเตือนทันทีเมื่อกดบันทึก
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 via-rose-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-xs transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>🚀 บันทึกคนไข้ &amp; แจ้งเตือน Telegram กลุ่ม</span>
            </button>
          </div>
        </form>
    </PsychiatricModalFrame>
  );
};

