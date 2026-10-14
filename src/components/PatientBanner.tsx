import React, { useState } from 'react';
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
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  HeartHandshake,
  CheckCircle2,
  CalendarClock,
  Sparkles,
  Info
} from 'lucide-react';
import { Patient, DtpRecord, HandoverMessage, Medication, PatientTrackingGroup } from '../types.ts';

interface PatientBannerProps {
  patient: Patient;
  dtps: DtpRecord[];
  handovers: HandoverMessage[];
  medications?: Medication[];
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onNavigateTab?: (tab: 'rx' | 'nurse' | 'psych' | 'homevisit' | 'telemed' | 'handover' | 'analytics') => void;
}

type ProfileSection = 'demographics' | 'meds' | 'dtps' | 'appointment' | 'handover' | null;

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  dtps,
  handovers,
  medications = [],
  onEditPatient,
  onDeletePatient,
  onNavigateTab
}) => {
  // Controlled expandable details section (null = only big icons shown)
  const [expandedSection, setExpandedSection] = useState<ProfileSection>(null);

  const pendingDtps = dtps.filter(d => d.patientId === patient.id && d.status === 'pending');
  const resolvedDtps = dtps.filter(d => d.patientId === patient.id && d.status === 'resolved');
  const openHandovers = handovers.filter(h => h.patientId === patient.id && h.status === 'open');
  const patientMeds = medications.filter(m => m.patientId === patient.id);

  const toggleSection = (section: ProfileSection) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

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
    <div className="bg-white rounded-3xl shadow-xs border border-rose-100 p-4 sm:p-5 relative transition-all">
      {/* Top Patient Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-rose-50">
        <div className="flex items-center gap-3.5">
          {/* Large Patient Avatar */}
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-100 via-pink-100 to-rose-200 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
            {patient.gender === 'ชาย' ? 'ช' : 'ญ'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {patient.name}
              </h2>

              {/* Status Badges */}
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

              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
                {patient.statusTag}
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span><strong>วินิจฉัยหลัก:</strong> {patient.diagnosis}</span>
              <span>•</span>
              <span>อายุ {patient.age} ปี ({patient.gender})</span>
              {patient.nextAppointment && (
                <>
                  <span>•</span>
                  <span className="text-indigo-700 font-medium">
                    นัดครั้งถัดไป: {patient.nextAppointment} ({getAppointmentTypeLabel(patient.nextAppointmentType)})
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons: Edit, Delete, Toggle */}
        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
          <button
            onClick={() => onEditPatient(patient)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer shadow-2xs"
            title="แก้ไขชื่อผู้ป่วย / ระบุสถานะ D/C หรือ Refer รพ.อื่น"
          >
            <Edit className="w-3.5 h-3.5 text-rose-500" />
            <span>แก้ไขชื่อ / D/C / Refer</span>
          </button>

          <button
            onClick={() => onDeletePatient(patient)}
            title="ลบข้อมูลผู้ป่วย (พร้อมยืนยัน)"
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition border border-transparent hover:border-rose-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Requirement 2: Big Action Icons (โชว์เฉพาะไอคอนใหญ่ๆ ดูง่าย สบายตา คลิกเพื่อขยายรายละเอียด) */}
      <div className="pt-3.5">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            ภาพรวมข้อมูลผู้ป่วย (คลิกที่ไอคอนเพื่อขยายรายละเอียด)
          </span>

          {expandedSection && (
            <button
              onClick={() => setExpandedSection(null)}
              className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold transition"
            >
              <span>ย่อมุมมองทั้งหมด</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Big Icon 1: ข้อมูลผู้ป่วย & ที่อยู่ติดต่อ */}
          <button
            type="button"
            onClick={() => toggleSection('demographics')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-center sm:items-start gap-2 relative group cursor-pointer ${
              expandedSection === 'demographics'
                ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-300/40 shadow-xs'
                : 'bg-white hover:bg-rose-50/40 border-slate-200 hover:border-rose-200 shadow-2xs'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition transform">
              <User className="w-6 h-6" />
            </div>
            <div className="w-full text-center sm:text-left min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                ข้อมูล & ประวัติ
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                อายุ {patient.age} ปี • {patient.phone ? 'มีเบอร์โทร' : 'ไม่มีเบอร์'}
              </div>
            </div>
            <div className="mt-auto pt-1 flex items-center justify-between w-full text-[10px] font-bold text-rose-600">
              <span>{expandedSection === 'demographics' ? 'ย่อรายละเอียด' : 'คลิกดูข้อมูล'}</span>
              {expandedSection === 'demographics' ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              )}
            </div>
          </button>

          {/* Big Icon 2: ยา & ความร่วมมือ (Adherence) */}
          <button
            type="button"
            onClick={() => toggleSection('meds')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-center sm:items-start gap-2 relative group cursor-pointer ${
              expandedSection === 'meds'
                ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-300/40 shadow-xs'
                : 'bg-white hover:bg-teal-50/40 border-slate-200 hover:border-teal-200 shadow-2xs'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition transform">
              <Pill className="w-6 h-6" />
            </div>
            <div className="w-full text-center sm:text-left min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                ยา & Adherence
              </div>
              <div className="text-[11px] font-semibold truncate mt-0.5 text-teal-700">
                Adherence: {patient.adherenceScore}%
              </div>
            </div>
            <div className="mt-auto pt-1 flex items-center justify-between w-full text-[10px] font-bold text-teal-700">
              <span>{patientMeds.length > 0 ? `${patientMeds.length} รายการยา` : 'ดูรายการยา'}</span>
              {expandedSection === 'meds' ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              )}
            </div>
          </button>

          {/* Big Icon 3: ปัญหาการใช้ยา (DRPs) */}
          <button
            type="button"
            onClick={() => toggleSection('dtps')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-center sm:items-start gap-2 relative group cursor-pointer ${
              expandedSection === 'dtps'
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/40 shadow-xs'
                : 'bg-white hover:bg-amber-50/40 border-slate-200 hover:border-amber-200 shadow-2xs'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="w-full text-center sm:text-left min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                ปัญหาการใช้ยา (DRPs)
              </div>
              <div className="text-[11px] font-bold truncate mt-0.5 text-amber-700">
                {pendingDtps.length > 0 ? `รอดำเนินการ ${pendingDtps.length} เรื่อง` : 'ไม่มี DRPs ค้าง'}
              </div>
            </div>
            <div className="mt-auto pt-1 flex items-center justify-between w-full text-[10px] font-bold text-amber-800">
              <span>{pendingDtps.length > 0 ? '⚠️ ต้องติดตาม' : 'ปกติ / แก้ไขแล้ว'}</span>
              {expandedSection === 'dtps' ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              )}
            </div>
          </button>

          {/* Big Icon 4: วันนัด & แผนติดตามต่อเนื่อง */}
          <button
            type="button"
            onClick={() => toggleSection('appointment')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-center sm:items-start gap-2 relative group cursor-pointer ${
              expandedSection === 'appointment'
                ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-300/40 shadow-xs'
                : 'bg-white hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-200 shadow-2xs'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition transform">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div className="w-full text-center sm:text-left min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                วันนัด & แผนติดตาม
              </div>
              <div className="text-[11px] font-bold truncate mt-0.5 text-indigo-700">
                {patient.nextAppointment || 'ยังไม่มีวันนัด'}
              </div>
            </div>
            <div className="mt-auto pt-1 flex items-center justify-between w-full text-[10px] font-bold text-indigo-800">
              <span>{getAppointmentTypeLabel(patient.nextAppointmentType)}</span>
              {expandedSection === 'appointment' ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              )}
            </div>
          </button>

          {/* Big Icon 5: ส่งต่อสหวิชาชีพ (Handover) */}
          <button
            type="button"
            onClick={() => toggleSection('handover')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-center sm:items-start gap-2 relative group cursor-pointer col-span-2 sm:col-span-1 lg:col-span-1 ${
              expandedSection === 'handover'
                ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-300/40 shadow-xs'
                : 'bg-white hover:bg-purple-50/40 border-slate-200 hover:border-purple-200 shadow-2xs'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="w-full text-center sm:text-left min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                ส่งต่อสหวิชาชีพ
              </div>
              <div className="text-[11px] font-bold truncate mt-0.5 text-purple-700">
                {openHandovers.length > 0 ? `เปิดอยู่ ${openHandovers.length} เรื่อง` : 'สื่อสารปกติ'}
              </div>
            </div>
            <div className="mt-auto pt-1 flex items-center justify-between w-full text-[10px] font-bold text-purple-800">
              <span>{openHandovers.length > 0 ? 'รอประสานงาน' : 'เรียบร้อย'}</span>
              {expandedSection === 'handover' ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Expandable Clinical Details Drawer / Panel (ขยายรายละเอียดเมื่อคลิก) */}
      {expandedSection && (
        <div className="mt-4 pt-4 border-t border-rose-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 relative">
            {/* Header of expanded panel */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  {expandedSection === 'demographics' && 'รายละเอียดข้อมูลส่วนบุคคล & ที่อยู่สำหรับลงพื้นที่'}
                  {expandedSection === 'meds' && 'ข้อมูลรายการยา & ความร่วมมือในการใช้ยา (Adherence)'}
                  {expandedSection === 'dtps' && 'รายการปัญหาการใช้ยา (DRPs) & การแก้ไขของเภสัชกร'}
                  {expandedSection === 'appointment' && 'แผนการนัดหมาย & วัตถุประสงค์การติดตามต่อเนื่อง'}
                  {expandedSection === 'handover' && 'ข้อความประสานงานสหวิชาชีพ (Handover Board)'}
                </h3>
              </div>

              <button
                onClick={() => setExpandedSection(null)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1 rounded-lg transition"
                title="ย่อรายละเอียด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: Section 1 (Demographics) */}
            {expandedSection === 'demographics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200/70">
                  <div className="text-slate-500 font-semibold text-[11px] pb-1 border-b border-slate-100 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    ข้อมูลทั่วไป
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ชื่อ-สกุล:</span>
                      <strong className="text-slate-800 text-xs">{patient.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">เลขประจำตัว (HN):</span>
                      <strong className="text-slate-800 font-mono text-xs">{patient.hn}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">เพศ / อายุ:</span>
                      <span className="text-slate-700">{patient.gender} ({patient.age} ปี)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">กลุ่มการดูแล:</span>
                      <span className="text-slate-700 font-semibold">{getGroupBadge(patient.trackingGroup)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">การวินิจฉัยโรคจิตเวชหลัก:</span>
                    <strong className="text-rose-700 text-xs">{patient.diagnosis}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ป้ายสถานะทางคลินิก (Status Tag):</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                      {patient.statusTag}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200/70">
                  <div className="text-slate-500 font-semibold text-[11px] pb-1 border-b border-slate-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    ข้อมูลติดต่อ & ที่อยู่เยี่ยมบ้าน
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">เบอร์โทรศัพท์:</span>
                    {patient.phone ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="text-slate-800 text-xs">{patient.phone}</strong>
                        <a
                          href={`tel:${patient.phone}`}
                          className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-md font-semibold text-[10px] hover:bg-teal-100 flex items-center gap-1 transition"
                        >
                          <Phone className="w-2.5 h-2.5" /> โทรหาผู้ป่วย/ญาติ
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">ไม่ระบุเบอร์โทรศัพท์</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ที่อยู่สำหรับลงพื้นที่เยี่ยมบ้าน:</span>
                    {patient.address ? (
                      <div className="mt-0.5">
                        <p className="text-slate-700 text-xs leading-relaxed">{patient.address}</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(patient.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> เปิดค้นหาพิกัดใน Google Maps
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">ไม่ระบุที่อยู่</span>
                    )}
                  </div>
                  {patient.lastVisit && (
                    <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      มารับบริการครั้งล่าสุด: <strong>{patient.lastVisit}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content: Section 2 (Meds & Adherence) */}
            {expandedSection === 'meds' && (
              <div className="space-y-3 text-xs">
                {/* Adherence Indicator */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[11px] text-slate-500 block">คะแนนความร่วมมือในการรับประทานยา (Adherence Score):</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-36 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            patient.adherenceScore >= 80 ? 'bg-teal-500' : patient.adherenceScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${patient.adherenceScore}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-sm text-slate-800">{patient.adherenceScore}%</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        patient.adherenceScore >= 80 ? 'bg-teal-100 text-teal-800' : patient.adherenceScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {patient.adherenceScore >= 80 ? 'High Adherence' : patient.adherenceScore >= 60 ? 'Moderate' : 'Poor Adherence'}
                      </span>
                    </div>
                  </div>

                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('rx')}
                      className="px-3 py-1.5 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>เปิดแท็บบริบาลเภสัชกรรม (Rx Care)</span>
                    </button>
                  )}
                </div>

                {/* Medications List */}
                {patientMeds.length > 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">ชื่อยาจิตเวช / ขนาด</th>
                          <th className="py-2 px-3">วิธีรับประทาน (Sig)</th>
                          <th className="py-2 px-3">ข้อบ่งใช้</th>
                          <th className="py-2 px-3 text-right">Adherence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {patientMeds.map(med => (
                          <tr key={med.id} className="hover:bg-rose-50/20">
                            <td className="py-2 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                              {med.name}
                            </td>
                            <td className="py-2 px-3 text-slate-600">{med.sig}</td>
                            <td className="py-2 px-3 text-slate-500">{med.indication}</td>
                            <td className="py-2 px-3 text-right font-bold text-teal-700">{med.adherence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-slate-500">
                    ยังไม่มีรายการยาในระบบ สามารถคลิกที่ <strong>บริบาลเภสัชกรรม (Rx Care)</strong> เพื่อเพิ่มยา
                  </div>
                )}
              </div>
            )}

            {/* Content: Section 3 (DRPs) */}
            {expandedSection === 'dtps' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      สรุปปัญหาการใช้ยา: พบทั้งหมด {dtps.filter(d => d.patientId === patient.id).length} เรื่อง
                    </span>
                    <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      รอดำเนินการ {pendingDtps.length}
                    </span>
                    <span className="text-[11px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                      แก้ไขสำเร็จ {resolvedDtps.length}
                    </span>
                  </div>

                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('rx')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition"
                    >
                      จัดการ / เพิ่ม DTP ใหม่
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {dtps.filter(d => d.patientId === patient.id).length > 0 ? (
                    dtps.filter(d => d.patientId === patient.id).map(dtp => (
                      <div
                        key={dtp.id}
                        className={`p-3 rounded-xl border transition ${
                          dtp.status === 'pending'
                            ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{dtp.domain}</span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border text-slate-600">
                              ยาที่เกี่ยวข้อง: <strong>{dtp.causeDrug}</strong>
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dtp.status === 'pending' ? 'bg-amber-200 text-amber-900' : 'bg-teal-100 text-teal-800'
                          }`}>
                            {dtp.status === 'pending' ? '⏳ รอดำเนินการ' : '✅ แก้ไขแล้ว'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 mt-1.5 leading-relaxed">{dtp.description}</p>
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] text-indigo-900">
                          <strong>แผนการแก้ไขทางเภสัชกรรม:</strong> {dtp.intervention}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-slate-500">
                      ไม่พบปัญหาการใช้ยา (DRPs) ที่บันทึกไว้สำหรับผู้ป่วยรายนี้
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content: Section 4 (Appointment & Care Plan) */}
            {expandedSection === 'appointment' && (
              <div className="space-y-3 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      วันนัดหมายติดตามต่อเนื่องครั้งถัดไป:
                    </span>
                    <span className="text-sm font-extrabold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                      {patient.nextAppointment || 'ยังไม่มีการกำหนดวันนัด'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ช่องทางติดตาม:</span>
                      <strong className="text-slate-800">{getAppointmentTypeLabel(patient.nextAppointmentType)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">วัตถุประสงค์การนัดหมาย:</span>
                      <span className="text-slate-700 font-medium">
                        {patient.nextAppointmentObjective || 'ติดตามอาการและการใช้ยาต่อเนื่อง'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onNavigateTab && (
                    <>
                      <button
                        onClick={() => onNavigateTab('homevisit')}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold flex items-center gap-1 border border-indigo-200 transition"
                      >
                        <Home className="w-3.5 h-3.5" /> ไปที่แท็บเยี่ยมบ้าน
                      </button>
                      <button
                        onClick={() => onNavigateTab('telemed')}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-semibold flex items-center gap-1 border border-teal-200 transition"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> ไปที่แท็บ Telemed
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Content: Section 5 (Handover Messages) */}
            {expandedSection === 'handover' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-800 text-xs">
                    การส่งต่อและประสานงานทีมสหวิชาชีพ (เภสัชกร • พยาบาล • นักจิตวิทยา)
                  </span>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('handover')}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      เปิด Handover Board เต็มรูปแบบ
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {handovers.filter(h => h.patientId === patient.id).length > 0 ? (
                    handovers.filter(h => h.patientId === patient.id).map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl border transition ${
                          msg.status === 'open' ? 'bg-purple-50/50 border-purple-200' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{msg.subject}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded-md">
                              จาก: {msg.senderRole} ➔ ถึง: {msg.targetRole}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            msg.status === 'open' ? 'bg-purple-200 text-purple-900' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {msg.status === 'open' ? 'รอติดตาม' : 'เสร็จสิ้น'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{msg.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-slate-500">
                      ยังไม่มีข้อความส่งต่อสหวิชาชีพสำหรับเคสนี้
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
