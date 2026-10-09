import React from 'react';
import { 
  Bell, 
  Home, 
  PhoneCall, 
  Building2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  X,
  Phone,
  UserCheck
} from 'lucide-react';
import { Patient, PatientTrackingGroup } from '../../types.ts';

interface DailyDueFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelectPatient: (patientId: string, groupAction?: 'home_visit' | 'telemed' | 'clinic') => void;
}

export const DailyDueFollowupModal: React.FC<DailyDueFollowupModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSelectPatient
}) => {
  if (!isOpen) return null;

  // Format today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDisplay = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // Categorize patients
  const dueTodayPatients = patients.filter(p => p.nextAppointment === todayStr);
  const overduePatients = patients.filter(p => p.nextAppointment && p.nextAppointment < todayStr);

  const homeVisitDue = dueTodayPatients.filter(p => p.trackingGroup === 'home_visit' || p.nextAppointmentType === 'home_visit');
  const telemedDue = dueTodayPatients.filter(p => p.trackingGroup === 'telemed' || p.nextAppointmentType === 'telemed');
  const clinicDue = dueTodayPatients.filter(p => 
    p.trackingGroup === 'clinic_dtp' || 
    (!p.nextAppointmentType || p.nextAppointmentType === 'clinic') && 
    p.trackingGroup !== 'home_visit' && 
    p.trackingGroup !== 'telemed'
  );

  const totalDueToday = dueTodayPatients.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto custom-scrollbar space-y-5">
        {/* Header Alert Banner */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  แจ้งเตือนผู้ป่วยที่ต้องติดตามวันนี้ (Daily Follow-up Alert)
                </h3>
                <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                  {totalDueToday} รายการ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-600" />
                ประจำวัน: <strong className="text-slate-700">{todayDisplay}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tracking Groups Overview Tabs / Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-indigo-900 block flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-indigo-600" /> กลุ่มเยี่ยมบ้าน
              </span>
              <span className="text-xl font-bold text-indigo-950 mt-0.5 block">{homeVisitDue.length} ราย</span>
            </div>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-lg">Home Visit</span>
          </div>

          <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-teal-900 block flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-teal-600" /> กลุ่ม Telemed
              </span>
              <span className="text-xl font-bold text-teal-950 mt-0.5 block">{telemedDue.length} ราย</span>
            </div>
            <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-lg">Telepsychiatry</span>
          </div>

          <div className="p-3 bg-pink-50/60 rounded-2xl border border-pink-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-pink-900 block flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-pink-600" /> กลุ่มคลินิกจิตเวช / DTP
              </span>
              <span className="text-xl font-bold text-pink-950 mt-0.5 block">{clinicDue.length} ราย</span>
            </div>
            <span className="text-[10px] bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded-lg">OPD Clinic</span>
          </div>
        </div>

        {/* List of Patients by Category */}
        <div className="space-y-4">
          {/* 1. กลุ่มเยี่ยมบ้าน */}
          {homeVisitDue.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-indigo-950 flex items-center gap-1.5 pb-1 border-b border-indigo-100">
                <Home className="w-4 h-4 text-indigo-600" />
                รายชื่อที่ต้องลงพื้นที่เยี่ยมบ้านวันนี้ ({homeVisitDue.length} ราย)
              </h4>
              <div className="space-y-2">
                {homeVisitDue.map(p => (
                  <div key={p.id} className="p-3.5 bg-indigo-50/30 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3 hover:bg-indigo-50/60 transition text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border font-mono text-slate-700">HN: {p.hn}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.2 rounded-full">
                          Adherence {p.adherenceScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        <strong>วัตถุประสงค์:</strong> {p.nextAppointmentObjective || 'เยี่ยมบ้านติดตามการทานยาและสภาพแวดล้อม'}
                      </p>
                      {p.address && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ที่อยู่: {p.address} • โทร: {p.phone || '-'}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onSelectPatient(p.id, 'home_visit');
                        onClose();
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <span>บันทึกเยี่ยมบ้าน</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. กลุ่ม Telemed */}
          {telemedDue.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-teal-950 flex items-center gap-1.5 pb-1 border-b border-teal-100">
                <PhoneCall className="w-4 h-4 text-teal-600" />
                รายชื่อที่ต้องโทร/ติดต่อ Telemed วันนี้ ({telemedDue.length} ราย)
              </h4>
              <div className="space-y-2">
                {telemedDue.map(p => (
                  <div key={p.id} className="p-3.5 bg-teal-50/30 rounded-2xl border border-teal-100 flex items-center justify-between gap-3 hover:bg-teal-50/60 transition text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border font-mono text-slate-700">HN: {p.hn}</span>
                        {p.phone && (
                          <span className="text-[11px] text-teal-800 font-semibold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-teal-600" /> {p.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        <strong>วัตถุประสงค์:</strong> {p.nextAppointmentObjective || 'โทรติดตามความสม่ำเสมอในการใช้ยาและผลข้างเคียง'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectPatient(p.id, 'telemed');
                        onClose();
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <span>บันทึก Telemed</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. กลุ่มคลินิกจิตเวช / พบปัญหาจากยา */}
          {clinicDue.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-pink-950 flex items-center gap-1.5 pb-1 border-b border-pink-100">
                <Building2 className="w-4 h-4 text-pink-600" />
                รายชื่อนัดคลินิกจิตเวช / ติดตามปัญหาการใช้ยา ({clinicDue.length} ราย)
              </h4>
              <div className="space-y-2">
                {clinicDue.map(p => (
                  <div key={p.id} className="p-3.5 bg-pink-50/30 rounded-2xl border border-pink-100 flex items-center justify-between gap-3 hover:bg-pink-50/60 transition text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border font-mono text-slate-700">HN: {p.hn}</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.2 rounded-md font-medium">
                          {p.statusTag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        <strong>การวินิจฉัย/วัตถุประสงค์:</strong> {p.diagnosis} • {p.nextAppointmentObjective || 'ตรวจติดตามความปลอดภัยทางคลินิก'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectPatient(p.id, 'clinic');
                        onClose();
                      }}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <span>เปิดดูเคสนี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Overdue Notice if any */}
          {overduePatients.length > 0 && (
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>มีผู้ป่วยที่เลยกำหนดนัดติดตามแล้ว ({overduePatients.length} ราย):</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {overduePatients.map(op => (
                  <button
                    key={op.id}
                    onClick={() => {
                      onSelectPatient(op.id);
                      onClose();
                    }}
                    className="bg-white hover:bg-rose-100 text-rose-900 px-2.5 py-1 rounded-xl border border-rose-200 text-[11px] font-medium transition"
                  >
                    {op.name} (นัด {op.nextAppointment})
                  </button>
                ))}
              </div>
            </div>
          )}

          {totalDueToday === 0 && overduePatients.length === 0 && (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-bold text-slate-800 text-sm">ไม่มีผู้ป่วยค้างนัดติดตามในวันนี้</p>
              <p className="text-slate-500 text-[11px]">การติดตามผู้ป่วยจิตเวชทั้ง 3 กลุ่มครบถ้วนเรียบร้อย</p>
            </div>
          )}
        </div>

        {/* Footer Dismiss Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            สามารถกดปุ่มกระดิ่ง 🔔 บนแถบเมนูด้านบน เพื่อเปิดดูหน้านี้ใหม่ได้ตลอดเวลา
          </span>
          <button
            onClick={onClose}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
          >
            เข้าสู่หน้าจอหลัก (Enter App)
          </button>
        </div>
      </div>
    </div>
  );
};
