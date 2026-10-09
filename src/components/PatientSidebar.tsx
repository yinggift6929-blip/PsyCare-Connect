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
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-pink-100 text-pink-800 px-2 py-0.2 rounded-md border border-pink-200">
        <Building2 className="w-2.5 h-2.5 text-pink-600" /> คลินิก/DTP
      </span>
    );
  };

  return (
    <aside className="bg-white rounded-3xl shadow-sm border border-pink-100 flex flex-col h-[calc(100vh-140px)] min-h-[580px]">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-pink-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-100 text-pink-700 rounded-2xl">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">
              ทะเบียนผู้ป่วยจิตเวช
            </h2>
            <p className="text-[11px] text-slate-500">
              พบ {filteredPatients.length} / {patients.length} ราย
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddPatient}
          className="bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>เพิ่มผู้ป่วย</span>
        </button>
      </div>

      {/* 3 Prominent Group Switcher Bars (Requirement 2) */}
      <div className="p-3 border-b border-pink-50 space-y-2 bg-slate-50/50">
        <div className="relative">
          <Search className="w-4 h-4 text-pink-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหา ชื่อ, HN, หรือโรคจิตเวช..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          />
        </div>

        {/* 3 Main Groups Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => onFilterTagChange('home_visit')}
            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
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
            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
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
            className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
              filterTag === 'clinic_dtp'
                ? 'bg-pink-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>คลินิก/DTP</span>
          </button>
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] custom-scrollbar">
          <button
            onClick={() => onFilterTagChange('all')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filterTag === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => onFilterTagChange('due_today')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 ${
              filterTag === 'due_today'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>นัดวันนี้</span>
          </button>
          <button
            onClick={() => onFilterTagChange('clozapine')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filterTag === 'clozapine'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            Clozapine
          </button>
          <button
            onClick={() => onFilterTagChange('high-risk')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filterTag === 'high-risk'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
            }`}
          >
            เสี่ยงสูง
          </button>
          <button
            onClick={() => onFilterTagChange('bipolar')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filterTag === 'bipolar'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'
            }`}
          >
            Bipolar
          </button>
        </div>
      </div>

      {/* Patient List Items Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p>ไม่พบรายชื่อผู้ป่วยในกลุ่มนี้</p>
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
                    ? 'bg-pink-50/90 border-pink-400 shadow-sm ring-1 ring-pink-300'
                    : 'bg-white hover:bg-pink-50/30 border-slate-100 hover:border-pink-200'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {patient.name}
                      </h4>
                      {getGroupBadge(patient.trackingGroup)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      HN: <span className="font-mono font-medium text-slate-700">{patient.hn}</span> • อายุ {patient.age} ปี
                    </p>
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
                    <span className={`flex items-center gap-1 font-semibold ${
                      isDueToday 
                        ? 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded' 
                        : isOverdue 
                        ? 'text-amber-700' 
                        : 'text-slate-500'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      {isDueToday ? '🚨 นัดวันนี้:' : isOverdue ? '⚠️ เลยกำหนด:' : 'นัด:'} {patient.nextAppointment}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {openHandovers > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full" title="โน้ตส่งต่อ">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {openHandovers}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-pink-600' : 'text-slate-300'}`} />
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
