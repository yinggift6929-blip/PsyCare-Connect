import React from 'react';
import { PhoneCall, Plus, Calendar, Phone, CheckCircle2, AlertCircle, MessageSquare, Video } from 'lucide-react';
import { TelemedRecord, Patient } from '../types.ts';

interface TelemedTabProps {
  patient: Patient;
  telemedRecords: TelemedRecord[];
  onOpenAddTelemed: () => void;
}

export const TelemedTab: React.FC<TelemedTabProps> = ({
  patient,
  telemedRecords,
  onOpenAddTelemed
}) => {
  const patientTelemedLogs = telemedRecords.filter(t => t.patientId === patient.id);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 text-teal-700 rounded-xl">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                บันทึกการติดตามทางไกล (Telemedicine / Telepsychiatry Care)
              </h3>
              <p className="text-[11px] text-slate-500">
                ติดตามอาการ ความสม่ำเสมอการใช้ยา และผลข้างเคียงทางโทรศัพท์/วิดีโอคอล: {patient.name} (HN: {patient.hn})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patient.phone && (
              <a
                href={`tel:${patient.phone}`}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5"
                title="โทรออกทันที"
              >
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>โทร {patient.phone}</span>
              </a>
            )}
            <button
              onClick={onOpenAddTelemed}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" /> บันทึก Telemed ใหม่
            </button>
          </div>
        </div>
      </div>

      {/* History Logs */}
      <div className="space-y-3.5">
        {patientTelemedLogs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-pink-100 text-center text-slate-400 text-xs space-y-2">
            <PhoneCall className="w-10 h-10 mx-auto text-teal-200" />
            <p className="font-medium text-slate-600">ยังไม่มีประวัติการติดตาม Telemed สำหรับผู้ป่วยรายนี้</p>
            <p className="text-[11px] text-slate-400">
              กดปุ่ม "+ บันทึก Telemed ใหม่" เพื่อบันทึกผลการโทรติดตามอาการและคำแนะนำการใช้ยา
            </p>
          </div>
        ) : (
          patientTelemedLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-pink-50 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-600" /> วันที่ติดต่อ: {log.date}
                  </span>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
                    {log.channel}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    ผู้ให้ข้อมูล: {log.respondent}
                  </span>
                </div>

                <span className="text-[11px] text-slate-500">
                  ผู้ให้บริการ: <strong className="text-slate-700">{log.recordedBy}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-teal-50/40 p-3 rounded-xl border border-teal-100 space-y-1">
                  <strong className="text-teal-900 block font-bold">อาการที่รายงาน:</strong>
                  <p className="text-slate-700 leading-relaxed text-[11px]">{log.symptomsStatus}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-800 block font-bold">ความร่วมมือการทานยา & ผลข้างเคียง:</strong>
                  <p className="text-slate-700 text-[11px]">
                    <strong>การทานยา:</strong> {log.adherenceStatus}
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    <strong>ผลข้างเคียง:</strong> {log.sideEffectsStatus || 'ไม่มี'}
                  </p>
                </div>
              </div>

              <div className="bg-pink-50/30 p-3 rounded-xl border border-pink-100">
                <strong className="text-pink-900 block mb-0.5 font-bold">คำแนะนำทางเภสัชกรรม (Counseling Provided):</strong>
                <p className="text-slate-700 text-[11px] leading-relaxed">{log.counselingProvided}</p>
              </div>

              {log.nextAppointmentDate && (
                <div className="flex items-center justify-between text-[11px] text-teal-800 bg-teal-50/60 p-2 rounded-lg border border-teal-200">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    วันนัดติดตามครั้งถัดไป: {log.nextAppointmentDate}
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded font-medium border text-slate-700">
                    {log.nextAppointmentType === 'home_visit' ? '🏠 นัดเยี่ยมบ้าน' : (log.nextAppointmentType === 'clinic' ? '🏥 นัดมาคลินิก' : '📱 นัดโทร Telemed')}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
