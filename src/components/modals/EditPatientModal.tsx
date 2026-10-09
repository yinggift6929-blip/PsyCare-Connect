import React, { useState, useEffect } from 'react';
import { UserCheck, X, Home, PhoneCall, Building2, Calendar } from 'lucide-react';
import { Patient, RiskLevel, PatientTrackingGroup } from '../../types.ts';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 text-pink-700 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">แก้ไขข้อมูลผู้ป่วย</h3>
              <p className="text-xs text-slate-500">ปรับปรุงข้อมูลเวชระเบียน HN: {patient.hn}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Group Selection */}
          <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 space-y-1.5">
            <label className="block font-bold text-pink-900">
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
                    ? 'bg-pink-600 text-white border-pink-700 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-pink-50 border-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>คลินิกจิตเวช/DTP</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">เลขประจำตัวผู้ป่วย (HN): *</label>
              <input
                type="text"
                required
                value={hn}
                onChange={(e) => setHn(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล: *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">เพศ:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">อายุ (ปี):</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">การวินิจฉัยหลัก (Psychiatric Diagnosis):</label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">กลุ่มคลินิกเฉพาะทาง / แท็ก:</label>
              <input
                type="text"
                value={statusTag}
                onChange={(e) => setStatusTag(e.target.value)}
                placeholder="เช่น Clozapine Clinic, Bipolar I, Depot LAI"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ระดับความเสี่ยง (Risk Level):</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ที่อยู่ (สำหรับการเยี่ยมบ้าน):</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="บ้านเลขที่, หมู่, ตำบล, อำเภอ"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Continuous Appointment Tracking Section */}
          <div className="bg-pink-50/40 p-3 rounded-xl border border-pink-200 space-y-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-pink-600" />
              การติดตามต่อเนื่อง (Continuous Follow-up Appointment):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">วันนัดติดตามครั้งถัดไป:</label>
                <input
                  type="date"
                  value={nextAppointment}
                  onChange={(e) => setNextAppointment(e.target.value)}
                  className="w-full p-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">ช่องทางการติดตาม:</label>
                <select
                  value={nextAppointmentType}
                  onChange={(e) => setNextAppointmentType(e.target.value as any)}
                  className="w-full p-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                className="w-full p-2 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
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
              className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              บันทึกการแก้ไข & ซิงค์อัตโนมัติ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
