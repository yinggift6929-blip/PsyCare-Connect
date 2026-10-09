import React from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Pill,
  MessageSquare,
  Trash2,
  Edit,
  Home,
  PhoneCall,
  Building2,
  MapPin
} from 'lucide-react';
import { Patient, DtpRecord, HandoverMessage, PatientTrackingGroup } from '../types.ts';

interface PatientBannerProps {
  patient: Patient;
  dtps: DtpRecord[];
  handovers: HandoverMessage[];
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  dtps,
  handovers,
  onEditPatient,
  onDeletePatient
}) => {
  const pendingDtps = dtps.filter(d => d.patientId === patient.id && d.status === 'pending');
  const openHandovers = handovers.filter(h => h.patientId === patient.id && h.status === 'open');

  const getGroupBadge = (group: PatientTrackingGroup) => {
    if (group === 'home_visit') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
          <Home className="w-3.5 h-3.5 text-indigo-600" /> กลุ่มเยี่ยมบ้าน (Home Visit)
        </span>
      );
    }
    if (group === 'telemed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold bg-teal-100 text-teal-900 px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
          <PhoneCall className="w-3.5 h-3.5 text-teal-600" /> กลุ่ม Telemed (Telepsychiatry)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-50 text-rose-900 px-3 py-1 rounded-full border border-rose-200 shadow-2xs">
        <Building2 className="w-3.5 h-3.5 text-rose-500" /> คลินิกจิตเวช / ปัญหาการใช้ยา (DTP)
      </span>
    );
  };

  const getAppointmentTypeLabel = (type?: 'home_visit' | 'telemed' | 'clinic') => {
    if (type === 'home_visit') return '🏠 เยี่ยมบ้าน';
    if (type === 'telemed') return '📱 โทร Telemed';
    return '🏥 ตรวจคลินิก';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-rose-100 p-4 sm:p-5 relative overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-rose-100/40 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Patient Identity & Bio */}
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-100 to-pink-100 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
            {patient.gender === 'ชาย' ? 'ช' : 'ญ'}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {patient.name}
              </h2>
              <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-mono font-medium border border-rose-200">
                HN: {patient.hn}
              </span>
              {getGroupBadge(patient.trackingGroup || 'home_visit')}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                patient.riskLevel === 'high'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : patient.riskLevel === 'moderate'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-teal-100 text-teal-800 border-teal-200'
              }`}>
                {patient.riskLevel === 'high' ? 'เสี่ยงสูง' : patient.riskLevel === 'moderate' ? 'เสี่ยงปานกลาง' : 'ความเสี่ยงต่ำ'}
              </span>
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-medium">
                {patient.statusTag}
              </span>
            </div>

            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-slate-600">
              <span>
                <strong className="text-rose-700">การวินิจฉัยหลัก:</strong> {patient.diagnosis}
              </span>
              <span>
                <strong>อายุ:</strong> {patient.age} ปี ({patient.gender})
              </span>
              {patient.phone && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3 h-3 text-teal-500" />
                  <a href={`tel:${patient.phone}`} className="hover:underline">{patient.phone}</a>
                </span>
              )}
              {patient.address && (
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  {patient.address}
                </span>
              )}
            </div>

            {/* Continuous Appointment Banner */}
            {patient.nextAppointment && (
              <div className="flex items-center gap-2 flex-wrap text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200 mt-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-indigo-900">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  วันนัดติดตามต่อเนื่อง: <strong>{patient.nextAppointment}</strong>
                </span>
                <span className="bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.2 rounded-md">
                  {getAppointmentTypeLabel(patient.nextAppointmentType)}
                </span>
                {patient.nextAppointmentObjective && (
                  <span className="text-slate-600 truncate max-w-md">
                    • {patient.nextAppointmentObjective}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clinical Metric Tiles & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Adherence Card */}
          <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-2.5 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-500 block">Adherence</span>
            <span className={`text-sm font-bold block mt-0.5 ${
              patient.adherenceScore >= 80 ? 'text-teal-600' : patient.adherenceScore >= 60 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {patient.adherenceScore}%
            </span>
          </div>

          {/* DTPs Status Card */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2.5 text-center min-w-[95px]">
            <span className="text-[10px] text-slate-500 block">DTPs รอดำเนินการ</span>
            <span className="text-sm font-bold text-amber-700 block mt-0.5">
              {pendingDtps.length} รายการ
            </span>
          </div>

          {/* Handover Alert Card */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-2.5 text-center min-w-[105px]">
            <span className="text-[10px] text-slate-500 block">รอส่งต่อสหวิชาชีพ</span>
            <span className="text-sm font-bold text-purple-700 block mt-0.5">
              {openHandovers.length} ข้อความ
            </span>
          </div>

          {/* Action buttons: Edit & Delete */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onEditPatient(patient)}
              title="แก้ไขข้อมูลผู้ป่วยและวันนัดติดตาม"
              className="text-slate-600 hover:text-rose-600 hover:bg-white p-2 rounded-lg transition"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeletePatient(patient)}
              title="ลบข้อมูลผู้ป่วย (พร้อมยืนยัน)"
              className="text-slate-400 hover:text-rose-600 hover:bg-white p-2 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

