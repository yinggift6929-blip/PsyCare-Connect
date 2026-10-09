import React, { useState } from 'react';
import { UserPlus, X, Home, PhoneCall, Building2, Calendar } from 'lucide-react';
import { Patient, RiskLevel, PatientTrackingGroup } from '../../types.ts';

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
  const [statusTag, setStatusTag] = useState('General Psych');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [adherenceScore, setAdherenceScore] = useState('100');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  const [nextAppointmentType, setNextAppointmentType] = useState<'home_visit' | 'telemed' | 'clinic'>('home_visit');
  const [nextAppointmentObjective, setNextAppointmentObjective] = useState('');

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
      statusTag,
      riskLevel,
      adherenceScore: Math.min(100, Math.max(0, parseInt(adherenceScore) || 100)),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      nextAppointment: nextAppointment || undefined,
      nextAppointmentType,
      nextAppointmentObjective: nextAppointmentObjective.trim() || undefined,
      lastVisit: new Date().toISOString().split('T')[0],
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">เพิ่มผู้ป่วยจิตเวชรายใหม่</h3>
              <p className="text-xs text-slate-500">บันทึกเวชระเบียนคลินิกจิตเวชและเชื่อมโยง Google Sheet</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Tracking Group Selector */}
          <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 space-y-1.5">
            <label className="block font-bold text-pink-900">
              กลุ่มการติดตามผู้ป่วย (Care Tracking Group): *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTrackingGroup('home_visit');
                  setNextAppointmentType('home_visit');
                }}
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
                onClick={() => {
                  setTrackingGroup('telemed');
                  setNextAppointmentType('telemed');
                }}
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
                onClick={() => {
                  setTrackingGroup('clinic_dtp');
                  setNextAppointmentType('clinic');
                }}
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
                placeholder="เช่น 66-00982"
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
                placeholder="เช่น นายประดิษฐ์ มีสุข"
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
                placeholder="40"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ระดับ Adherence (%):</label>
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
            <select
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">กลุ่มคลินิกเฉพาะทาง / แท็ก:</label>
              <select
                value={statusTag}
                onChange={(e) => setStatusTag(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="General Psych">General Psych (จิตเวชทั่วไป)</option>
                <option value="Clozapine Clinic">Clozapine Clinic (คลินิกโคลซาปีน)</option>
                <option value="Depot LAI">Depot LAI (ฉีดยาออกฤทธิ์เนิ่น)</option>
                <option value="Lithium TDM">Lithium TDM (ตรวจระดับยา)</option>
                <option value="High Suicide Risk">High Suicide Risk (เสี่ยงฆ่าตัวตายสูง)</option>
              </select>
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
                placeholder="081-xxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ที่อยู่ (สำหรับการเยี่ยมบ้าน):</label>
              <input
                type="text"
                placeholder="บ้านเลขที่, หมู่, ตำบล, อำเภอ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
                placeholder="เช่น เยี่ยมบ้านติดตามการทานยา, โทรเช็คผลข้างเคียง, นัดเจาะเลือด Clozapine ANC"
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
              บันทึกผู้ป่วย & ซิงค์อัตโนมัติ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
