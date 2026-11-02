import React from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Activity, 
  Trash2, 
  Edit, 
  Home, 
  PhoneCall, 
  Building2, 
  MapPin,
  Send
} from 'lucide-react';
import { Patient, DtpRecord, HandoverMessage, Medication, PatientTrackingGroup } from '../types.ts';
import { PatientGenderAvatar, GenderBadge } from './common/GenderIcon.tsx';
import { formatAppointmentDate } from '../utils/dateUtils.ts';

interface PatientBannerProps {
  patient: Patient;
  dtps?: DtpRecord[];
  handovers?: HandoverMessage[];
  medications?: Medication[];
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onNavigateTab?: (tab: 'rx' | 'nurse' | 'psych' | 'homevisit' | 'telemed' | 'handover' | 'analytics') => void;
  onOpenQuickDrugReferral?: () => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  onEditPatient,
  onDeletePatient,
  onNavigateTab,
  onOpenQuickDrugReferral
}) => {
  const getGroupBadge = (group: PatientTrackingGroup) => {
    if (group === 'home_visit') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
          <Home className="w-3.5 h-3.5 text-indigo-600" /> เยี่ยมบ้าน (Home Visit)
        </span>
      );
    }
    if (group === 'telemed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-teal-100 text-teal-900 px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
          <PhoneCall className="w-3.5 h-3.5 text-teal-600" /> Telemed (Telepsychiatry)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-900 px-3 py-1 rounded-full border border-rose-200 shadow-2xs">
        <Building2 className="w-3.5 h-3.5 text-rose-500" /> คลินิก/DRPs
      </span>
    );
  };

  const getAppointmentTypeLabel = (type?: 'home_visit' | 'telemed' | 'clinic') => {
    if (type === 'home_visit') return '🏠 เยี่ยมบ้าน';
    if (type === 'telemed') return '📱 โทร Telemed';
    return '🏥 ตรวจคลินิก';
  };

  const isDC = patient.name.toLowerCase().includes('d/c') || 
               patient.statusTag.toLowerCase().includes('d/c') || 
               patient.name.includes('จำหน่าย');

  const isRefer = patient.name.toLowerCase().includes('refer') || 
                 patient.statusTag.toLowerCase().includes('refer') || 
                 patient.name.includes('ส่งต่อ');

  return (
    <div className="bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200/90 rounded-3xl shadow-md border-2 border-slate-300 p-4 sm:p-5 relative transition-all">
      {/* Top Patient Summary Bar: Patient Profile */}
      <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Profile Header Label & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wide uppercase bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white shadow-2xs">
              <User className="w-3.5 h-3.5" />
              Patient Profile
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ข้อมูลผู้ป่วยจิตเวช & การดูแล
            </span>
            {isDC && (
              <span className="text-xs bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold shadow-2xs">
                🟡 จำหน่ายแล้ว (D/C)
              </span>
            )}
            {isRefer && (
              <span className="text-xs bg-purple-100 text-purple-950 px-2.5 py-0.5 rounded-full border border-purple-300 font-bold shadow-2xs">
                🟣 ส่งต่อรักษา รพ.อื่น (Refer)
              </span>
            )}
          </div>

          {/* Action Buttons: Forward to Pharmacist, Edit, Delete */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {onOpenQuickDrugReferral ? (
              <button
                onClick={onOpenQuickDrugReferral}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#6B8E23] via-[#759732] to-[#638420] hover:from-[#5e7e1c] hover:via-[#678526] hover:to-[#577218] px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs border border-[#58731d] active:scale-95"
                title="ส่งต่อเพื่อให้เภสัชกรรับทราบปัญหาการใช้ยาของผู้ป่วยจากทีมสหวิชาชีพ (แจ้งเตือนผ่านกลุ่ม Telegram: Clinic จิตดี -5506194529)"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">ส่งต่อปัญหาการใช้ยาถึงเภสัชกร</span>
                <span className="sm:hidden">ส่งต่อเภสัชกร</span>
                <span className="text-[10px] bg-black/15 text-white px-1.5 py-0.2 rounded-md font-mono border border-white/20">
                  กลุ่ม Clinic จิตดี
                </span>
              </button>
            ) : (onNavigateTab && (
              <button
                onClick={() => onNavigateTab('handover')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#6B8E23] hover:bg-[#5e7e1c] px-3 py-1.5 rounded-xl border border-[#58731d] transition cursor-pointer shadow-2xs active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>ส่งต่อเภสัชกร</span>
              </button>
            ))}

            <button
              onClick={() => onEditPatient(patient)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer shadow-2xs"
              title="แก้ไขชื่อผู้ป่วย / ระบุสถานะ D/C หรือ Refer รพ.อื่น"
            >
              <Edit className="w-3.5 h-3.5 text-rose-500" />
              <span>แก้ไข / D/C / Refer</span>
            </button>

            <button
              onClick={() => onDeletePatient(patient)}
              title="ลบข้อมูลผู้ป่วย (พร้อมยืนยัน)"
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition border border-transparent hover:border-rose-150 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Patient Identity & Diagnosis Display */}
        <div className="flex flex-col md:flex-row md:items-start gap-3.5 pt-1">
          {/* Large Patient Avatar with Gender Icon (ญ/ช) */}
          <div className="shrink-0 pt-0.5">
            <PatientGenderAvatar gender={patient.gender} size="lg" />
          </div>

          <div className="flex-1 min-w-0 space-y-2.5">
            {/* Row 1: ชื่อ สกุล ในบรรทัดเดียวกัน ต่อด้วย กล่อง HN: */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                {patient.name}
              </h2>

              {/* กล่อง HN: (เด่นชัด เข้าใจง่าย รูปแบบกล่อง) */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-50 border-2 border-pink-400/90 shadow-2xs font-mono">
                <span className="text-xs font-black text-pink-700">HN:</span>
                <span className="text-sm font-black text-pink-950 tracking-wider">{patient.hn}</span>
              </div>

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

              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
                {patient.statusTag}
              </span>
            </div>

            {/* Row 2: การวินิจฉัย (การวินิจฉัยโรคชัดเจน ต่อจากบรรทัดชื่อและ HN) */}
            <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 shadow-2xs">
                <Activity className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-amber-800">การวินิจฉัย:</span>
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {patient.diagnosis || 'ยังไม่ได้ระบุการวินิจฉัย'}
                </span>
              </div>

              {/* Demographics: อายุ, เพศ, เบอร์โทร, วันนัดถัดไป */}
              <div className="inline-flex items-center gap-2 text-xs text-slate-600 flex-wrap pl-1">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span>อายุ {patient.age} ปี</span>
                  <GenderBadge gender={patient.gender} />
                </span>

                {patient.phone && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{patient.phone}</span>
                    </span>
                  </>
                )}

                {patient.address && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[200px]" title={patient.address}>
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{patient.address}</span>
                    </span>
                  </>
                )}

                {patient.nextAppointment && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-indigo-700 font-bold inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      นัดครั้งถัดไป: <strong>{formatAppointmentDate(patient.nextAppointment, 'short')}</strong> ({getAppointmentTypeLabel(patient.nextAppointmentType)})
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
