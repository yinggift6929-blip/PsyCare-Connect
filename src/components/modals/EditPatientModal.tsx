import React, { useState, useEffect } from 'react';
import { UserCheck, Home, PhoneCall, Building2, Calendar, RotateCcw, Hospital, Tag, CheckCircle2, Venus, Mars } from 'lucide-react';
import { Patient, RiskLevel, PatientTrackingGroup } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';
import { formatAppointmentDate } from '../../utils/dateUtils.ts';
import { ThaiAppointmentDatePicker } from '../common/ThaiAppointmentDatePicker.tsx';


interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (updated: Patient) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [hn, setHn] = useState(patient.hn);
  const [name, setName] = useState(patient.name);
  const [referHospital, setReferHospital] = useState('');
  const [gender, setGender] = useState<'ชาย' | 'หญิง'>(patient.gender);
  const [age, setAge] = useState(String(patient.age));
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis);
  const [trackingGroup, setTrackingGroup] = useState<PatientTrackingGroup>(patient.trackingGroup || 'home_visit');
  const [statusTag, setStatusTag] = useState(patient.statusTag);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(patient.riskLevel);
  const [adherenceScore, setAdherenceScore] = useState(String(patient.adherenceScore));
  const [phone, setPhone] = useState(patient.phone || '');
  const [address, setAddress] = useState(patient.address || '');
  const [nextAppointment, setNextAppointment] = useState(patient.nextAppointment || '');
  const [nextAppointmentType, setNextAppointmentType] = useState<'home_visit' | 'telemed' | 'clinic'>(patient.nextAppointmentType || 'home_visit');
  const [nextAppointmentObjective, setNextAppointmentObjective] = useState(patient.nextAppointmentObjective || '');

  // Helper to extract clean base name without D/C or Refer tags
  const cleanName = (fullName: string) => {
    return fullName
      .replace(/\s*\(D\/C[^)]*\)/gi, '')
      .replace(/\s*\[D\/C[^\]]*\]/gi, '')
      .replace(/\s*\(จำหน่าย[^)]*\)/gi, '')
      .replace(/\s*\[จำหน่าย[^\]]*\]/gi, '')
      .replace(/\s*\(Refer[^)]*\)/gi, '')
      .replace(/\s*\[Refer[^\]]*\]/gi, '')
      .replace(/\s*\(ส่งต่อ[^)]*\)/gi, '')
      .replace(/\s*\[ส่งต่อ[^\]]*\]/gi, '')
      .trim();
  };

  const handleApplyDc = (tagText: string = 'D/C') => {
    const base = cleanName(name);
    setName(`${base} (${tagText})`);
    if (!statusTag.toLowerCase().includes('d/c') && !statusTag.includes('จำหน่าย')) {
      setStatusTag(prev => prev ? `D/C - จำหน่าย, ${prev}` : 'D/C - จำหน่าย');
    }
  };

  const handleApplyRefer = (hospitalName: string) => {
    const base = cleanName(name);
    const hosp = hospitalName.trim() || 'รพ.อื่น';
    setName(`${base} (Refer ${hosp})`);
    if (!statusTag.toLowerCase().includes('refer') && !statusTag.includes('ส่งต่อ')) {
      setStatusTag(prev => prev ? `Refer ${hosp}, ${prev}` : `Refer ${hosp}`);
    }
  };

  const handleResetNameToClean = () => {
    setName(cleanName(name));
  };

  useEffect(() => {
    if (patient) {
      setHn(patient.hn);
      setName(patient.name);
      setGender(patient.gender);
      setAge(String(patient.age));
      setDiagnosis(patient.diagnosis);
      setTrackingGroup(patient.trackingGroup || 'home_visit');
      setStatusTag(patient.statusTag);
      setRiskLevel(patient.riskLevel);
      setAdherenceScore(String(patient.adherenceScore));
      setPhone(patient.phone || '');
      setAddress(patient.address || '');
      setNextAppointment(patient.nextAppointment || '');
      setNextAppointmentType(patient.nextAppointmentType || 'home_visit');
      setNextAppointmentObjective(patient.nextAppointmentObjective || '');

      // Check if patient name has existing refer hospital
      const match = patient.name.match(/\(Refer\s+([^)]+)\)/i);
      if (match && match[1]) {
        setReferHospital(match[1].trim());
      } else {
        setReferHospital('');
      }
    }
  }, [patient]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hn.trim() || !name.trim()) {
      alert('กรุณากรอก HN และชื่อผู้ป่วย');
      return;
    }

    onSave({
      ...patient,
      hn: hn.trim(),
      name: name.trim(),
      gender,
      age: parseInt(age) || patient.age,
      diagnosis: diagnosis.trim(),
      trackingGroup,
      statusTag: statusTag.trim(),
      riskLevel,
      adherenceScore: Math.min(100, Math.max(0, parseInt(adherenceScore) || patient.adherenceScore)),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      nextAppointment: nextAppointment || undefined,
      nextAppointmentType,
      nextAppointmentObjective: nextAppointmentObjective.trim() || undefined,
      updatedAt: new Date().toLocaleString('th-TH')
    });

    onClose();
  };

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={<UserCheck className="w-5 h-5 text-white" />}
      title="แก้ไขข้อมูลและชื่อผู้ป่วยจิตเวช"
      subtitle={`เวชระเบียน HN: ${patient.hn} • ระบุสถานะ D/C หรือ Refer ไปรักษาต่อ`}
      badgeText="Edit Record"
      badgeColor="rose"
      confidentialNotice={`การแก้ไขข้อมูลเวชระเบียน HN: ${patient.hn} (${patient.name})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* Section: Patient Name Editing & D/C / Refer Assistants */}
          <div className="bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-purple-50/40 p-3.5 rounded-2xl border border-amber-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-rose-600" />
                <span>ชื่อ-นามสกุลผู้ป่วย: *</span>
              </label>
              <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md font-medium border border-amber-300">
                ✏️ สามารถพิมพ์แก้ไขได้ทันที
              </span>
            </div>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น นายสมชาย ใจดี หรือ นายสมชาย ใจดี (D/C)"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 font-semibold text-slate-800 shadow-2xs text-sm"
            />

            {/* Helper buttons for D/C and Refer */}
            <div className="space-y-2 pt-1 border-t border-amber-200/50">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-700" />
                  <span>ปุ่มลัดระบุสถานะต่อท้ายชื่อผู้ป่วย (D/C หรือ Refer รพ.อื่น):</span>
                </span>
                {(name.includes('D/C') || name.includes('Refer') || name.includes('จำหน่าย') || name.includes('ส่งต่อ')) && (
                  <button
                    type="button"
                    onClick={handleResetNameToClean}
                    className="text-slate-500 hover:text-rose-600 text-[10px] flex items-center gap-1 hover:underline cursor-pointer font-medium"
                    title="ล้างคำว่า (D/C) หรือ (Refer) ออกจากชื่อ"
                  >
                    <RotateCcw className="w-3 h-3" /> คืนชื่อเดิม
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyDc('D/C')}
                  className={`p-2 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer shadow-2xs ${
                    name.includes('(D/C)')
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-300'
                      : 'bg-white hover:bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[11px] leading-tight">+ ใส่ (D/C)</div>
                    <div className="text-[9px] text-slate-500">จำหน่ายผู้ป่วย</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyRefer(referHospital || 'รพ.อื่น')}
                  className={`p-2 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer shadow-2xs ${
                    name.includes('Refer')
                      ? 'bg-purple-100 border-purple-400 text-purple-950 font-bold ring-1 ring-purple-300'
                      : 'bg-white hover:bg-purple-50 border-purple-200 text-purple-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[11px] leading-tight">+ ใส่ (Refer)</div>
                    <div className="text-[9px] text-slate-500">ส่งต่อไป รพ.อื่น</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyRefer('รพ.จิตเวช')}
                  className="p-2 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer shadow-2xs bg-white hover:bg-purple-50 border-purple-200 text-purple-900"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[11px] leading-tight">+ (Refer รพ.จิตเวช)</div>
                    <div className="text-[9px] text-slate-500">รพ.เฉพาะทาง</div>
                  </div>
                </button>
              </div>

              {/* Refer Destination Hospital Detail Input */}
              <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100 space-y-1.5 mt-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700 font-semibold flex items-center gap-1">
                    <Hospital className="w-3.5 h-3.5 text-purple-600" />
                    <span>ระบุโรงพยาบาลที่ Refer ไปรักษาต่อ:</span>
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="เช่น รพ.สวนสราญรมย์, รพ.พระศรีมหาโพธิ์, รพ.สวนปรุง, รพ.ประจำจังหวัด..."
                    value={referHospital}
                    onChange={(e) => setReferHospital(e.target.value)}
                    className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyRefer(referHospital || 'รพ.อื่น')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition shadow-2xs"
                  >
                    นำต่อท้ายชื่อ
                  </button>
                </div>

                {/* Fast Hospital Suggestions */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {['รพ.จิตเวชเฉพาะทาง', 'รพ.สวนสราญรมย์', 'รพ.พระศรีมหาโพธิ์', 'รพ.สวนปรุง', 'รพ.จิตเวชขอนแก่น', 'รพ.ศูนย์ / รพ.ทั่วไป', 'รพ.ชุมชนใกล้บ้าน'].map((hosp) => (
                    <button
                      key={hosp}
                      type="button"
                      onClick={() => {
                        setReferHospital(hosp);
                        handleApplyRefer(hosp);
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 px-2 py-0.5 rounded-md transition cursor-pointer"
                    >
                      +{hosp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Group Selection */}
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">เลข HN: *</label>
              <input
                type="text"
                required
                value={hn}
                onChange={(e) => setHn(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 font-mono"
              />
            </div>
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
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">การวินิจฉัยหลัก (Diagnosis):</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Adherence (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={adherenceScore}
                onChange={(e) => setAdherenceScore(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">กลุ่มคลินิกเฉพาะทาง / แท็กสถานะ:</label>
              <input
                type="text"
                value={statusTag}
                onChange={(e) => setStatusTag(e.target.value)}
                placeholder="เช่น Clozapine Clinic, D/C, Refer รพ.อื่น"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ระดับความเสี่ยง (Risk Level):</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="low">ปกติ / เสี่ยงต่ำ (Low)</option>
                <option value="moderate">ปานกลาง (Moderate)</option>
                <option value="high">เสี่ยงสูง (High Risk)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081-xxx-xxxx"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ที่อยู่ (สำหรับการเยี่ยมบ้าน):</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="บ้านเลขที่, หมู่, ตำบล, อำเภอ"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          {/* Continuous Appointment Tracking Section */}
          <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100 space-y-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-rose-500" />
              การติดตามต่อเนื่อง (Continuous Follow-up Appointment):
            </span>
            <div className="space-y-3">
              <ThaiAppointmentDatePicker
                value={nextAppointment}
                onChange={setNextAppointment}
                label="วันนัดติดตามครั้งถัดไป:"
                themeColor="rose"
              />

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">ช่องทางการติดตาม:</label>
                <select
                  value={nextAppointmentType}
                  onChange={(e) => setNextAppointmentType(e.target.value as any)}
                  className="w-full p-2 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 text-xs font-medium"
                >
                  <option value="home_visit">🏠 เยี่ยมบ้าน (Home Visit)</option>
                  <option value="telemed">📱 โทร/ติดต่อ Telemed</option>
                  <option value="clinic">🏥 มาตรวจที่คลินิกจิตเวช</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">วัตถุประสงค์การติดตามต่อเนื่อง:</label>
              <input
                type="text"
                placeholder="เช่น ติดตามการทานยา, ฉีดยา Depot, ประเมินอาการทางจิต, ตรวจผลเลือด"
                value={nextAppointmentObjective}
                onChange={(e) => setNextAppointmentObjective(e.target.value)}
                className="w-full p-2 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-xs transition transform active:scale-95 cursor-pointer"
            >
              บันทึกการแก้ไข & ซิงค์อัตโนมัติ
            </button>
          </div>
        </form>
    </PsychiatricModalFrame>
  );
};

