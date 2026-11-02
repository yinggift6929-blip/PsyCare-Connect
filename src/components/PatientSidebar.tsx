import React from 'react';
import { 
  Search, 
  UserPlus, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Home,
  PhoneCall,
  Building2,
  Calendar
} from 'lucide-react';
import { Patient, HandoverMessage, PatientTrackingGroup } from '../types.ts';
import { PatientGenderAvatar } from './common/GenderIcon.tsx';
import { formatAppointmentDate } from '../utils/dateUtils.ts';

interface PatientSidebarProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  onOpenAddPatient: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterTag: string;
  onFilterTagChange: (tag: string) => void;
  handovers: HandoverMessage[];
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onOpenAddPatient,
  searchQuery,
  onSearchChange,
  filterTag,
  onFilterTagChange,
  handovers
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 3 Primary Tracking Groups
    if (filterTag === 'home_visit') return p.trackingGroup === 'home_visit' || p.nextAppointmentType === 'home_visit';
    if (filterTag === 'telemed') return p.trackingGroup === 'telemed' || p.nextAppointmentType === 'telemed';
    if (filterTag === 'clinic_dtp') return p.trackingGroup === 'clinic_dtp' || p.nextAppointmentType === 'clinic';

    // Sub-tags
    if (filterTag === 'all') return true;
    if (filterTag === 'due_today') return p.nextAppointment === todayStr;
    if (filterTag === 'dc_refer') {
      return p.name.toLowerCase().includes('d/c') || 
             p.name.toLowerCase().includes('refer') || 
             p.name.includes('จำหน่าย') || 
             p.name.includes('ส่งต่อ') || 
             p.statusTag.toLowerCase().includes('d/c') || 
             p.statusTag.toLowerCase().includes('refer');
    }
    if (filterTag === 'high-risk') return p.riskLevel === 'high';
    if (filterTag === 'clozapine') return p.statusTag.toLowerCase().includes('clozapine') || p.diagnosis.toLowerCase().includes('clozapine');
    if (filterTag === 'bipolar') return p.diagnosis.toLowerCase().includes('bipolar');
    if (filterTag === 'mdd') return p.diagnosis.toLowerCase().includes('depress') || p.diagnosis.toLowerCase().includes('mdd');

    return true;
  });

  const getUnreadHandoverCount = (patientId: string) => {
    return handovers.filter(h => h.patientId === patientId && h.status === 'open').length;
  };

  const getGroupBadge = (group: PatientTrackingGroup) => {
    if (group === 'home_visit') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded-md border border-indigo-200">
          <Home className="w-2.5 h-2.5 text-indigo-600" /> เยี่ยมบ้าน
        </span>
      );
    }
    if (group === 'telemed') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.2 rounded-md border border-teal-200">
          <PhoneCall className="w-2.5 h-2.5 text-teal-600" /> Telemed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-800 px-2 py-0.2 rounded-md border border-rose-200">
        <Building2 className="w-2.5 h-2.5 text-rose-500" /> คลินิก/DRPs
      </span>
    );
  };

  return (
    <aside className="bg-gradient-to-b from-rose-100 via-pink-100 to-rose-50/95 rounded-3xl shadow-md border-2 border-pink-300/80 flex flex-col h-[calc(100vh-140px)] min-h-[580px] overflow-hidden">
      {/* Sidebar Header with Deep Pink Theme */}
      <div className="p-4 border-b border-pink-300/70 bg-gradient-to-r from-pink-200/90 via-rose-100/90 to-pink-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-2xl shadow-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-pink-950 leading-tight">
              ทะเบียนผู้ป่วยจิตเวช
            </h2>
            <p className="text-[11px] text-pink-900/80 font-medium">
              พบ {filteredPatients.length} / {patients.length} ราย
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddPatient}
          className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition transform active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>เพิ่มผู้ป่วย</span>
        </button>
      </div>

      {/* 3 Prominent Group Switcher Bars on Rich Pink Backdrop */}
      <div className="p-3 border-b border-pink-300/70 space-y-2.5 bg-pink-100/60 backdrop-blur-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-pink-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหา ชื่อ, HN, หรือโรคจิตเวช..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-800 placeholder:text-pink-400 font-medium shadow-2xs transition"
          />
        </div>

        {/* 3 Main Groups Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-white/95 p-1 rounded-2xl border border-pink-300 shadow-2xs">
          <button
            onClick={() => onFilterTagChange('home_visit')}
            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              filterTag === 'home_visit'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
            }`}
          >
            <Home className="w-3 h-3" />
            <span>เยี่ยมบ้าน</span>
          </button>

          <button
            onClick={() => onFilterTagChange('telemed')}
            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              filterTag === 'telemed'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
            }`}
          >
            <PhoneCall className="w-3 h-3" />
            <span>Telemed</span>
          </button>

          <button
            onClick={() => onFilterTagChange('clinic_dtp')}
            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              filterTag === 'clinic_dtp'
                ? 'bg-pink-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>คลินิก/DRPs</span>
          </button>
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] custom-scrollbar">
          <button
            onClick={() => onFilterTagChange('all')}
            className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
              filterTag === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-white/90 text-slate-700 hover:bg-white border border-pink-300'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => onFilterTagChange('due_today')}
            className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
              filterTag === 'due_today'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white/90 text-rose-700 border border-pink-300 hover:bg-rose-50'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>นัดวันนี้</span>
          </button>
          <button
            onClick={() => onFilterTagChange('dc_refer')}
            className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
              filterTag === 'dc_refer'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white/90 text-amber-900 border border-pink-300 hover:bg-amber-50'
            }`}
          >
            <span>D/C & Refer</span>
          </button>
        </div>
      </div>

      {/* Patient List Items Scrollable with Distinct Card Contrasts */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-pink-800 text-xs bg-white/70 rounded-2xl border border-pink-300/80 my-2">
            <Users className="w-8 h-8 mx-auto text-pink-400 mb-2" />
            <p className="font-semibold text-pink-900">ไม่พบรายชื่อผู้ป่วยในกลุ่มนี้</p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const isSelected = patient.id === selectedPatientId;
            const openHandovers = getUnreadHandoverCount(patient.id);
            const isDueToday = patient.nextAppointment === todayStr;
            const isOverdue = patient.nextAppointment && patient.nextAppointment < todayStr;

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-white border-2 border-pink-500 shadow-sm ring-2 ring-pink-300/70 border-l-4 border-l-pink-600'
                    : 'bg-white/95 hover:bg-white border border-pink-200/90 hover:border-pink-400 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <PatientGenderAvatar gender={patient.gender} size="sm" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {patient.name}
                        </h4>
                        {(patient.name.toLowerCase().includes('d/c') || patient.statusTag.toLowerCase().includes('d/c') || patient.name.includes('จำหน่าย')) && (
                          <span className="text-[9px] bg-amber-100 text-amber-950 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                            D/C
                          </span>
                        )}
                        {(patient.name.toLowerCase().includes('refer') || patient.statusTag.toLowerCase().includes('refer') || patient.name.includes('ส่งต่อ')) && (
                          <span className="text-[9px] bg-purple-100 text-purple-950 font-bold px-1.5 py-0.2 rounded border border-purple-300">
                            Refer
                          </span>
                        )}
                        {getGroupBadge(patient.trackingGroup)}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        HN: <span className="font-mono font-bold text-pink-900">{patient.hn}</span> • อายุ {patient.age} ปี
                      </p>
                    </div>
                  </div>

                  {/* Adherence Badge */}
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      patient.adherenceScore >= 80
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : patient.adherenceScore >= 60
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      Adh: {patient.adherenceScore}%
                    </span>
                  </div>
                </div>

                {/* Appointment reminder bar */}
                {patient.nextAppointment && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span 
                      title={`วันนัดหมาย (วัน/เดือน/ปี): ${formatAppointmentDate(patient.nextAppointment, 'day_full')}`}
                      className={`flex items-center gap-1 font-semibold ${
                        isDueToday 
                          ? 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded' 
                          : isOverdue 
                          ? 'text-amber-700' 
                          : 'text-slate-500'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      {isDueToday ? '🚨 นัดวันนี้:' : isOverdue ? '⚠️ เลยกำหนด:' : 'นัด:'} {formatAppointmentDate(patient.nextAppointment, 'short')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {openHandovers > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full" title="โน้ตส่งต่อ">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {openHandovers}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-pink-600 font-bold' : 'text-slate-300'}`} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
