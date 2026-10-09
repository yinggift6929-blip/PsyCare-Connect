import React from 'react';
import { 
  Stethoscope, 
  Plus, 
  Activity, 
  Syringe, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ShieldCheck, 
  Calendar,
  Weight
} from 'lucide-react';
import { Patient, NurseRecord } from '../types.ts';

interface NurseCareTabProps {
  patient: Patient;
  nurseRecords: NurseRecord[];
  onOpenAddNurseLog: () => void;
}

export const NurseCareTab: React.FC<NurseCareTabProps> = ({
  patient,
  nurseRecords,
  onOpenAddNurseLog
}) => {
  const patientNurseLogs = nurseRecords.filter(n => n.patientId === patient.id);
  const latestLog = patientNurseLogs[0];

  return (
    <div className="space-y-5">
      {/* Overview Vital Signs & Quick Indicators */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 text-teal-700 rounded-xl">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                บันทึกการพยาบาลและการบริหารยา (Nursing Care & Observation Log)
              </h3>
              <p className="text-[11px] text-slate-500">
                สัญญาณชีพ, การฉีดยา Depot LAI, พฤติกรรมสังเกต และการกินยาต่อหน้าพยาบาล (DOT)
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddNurseLog}
            className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> บันทึกการพยาบาลใหม่
          </button>
        </div>

        {/* 4 Cards Quick Vitals Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* BP & Pulse */}
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
            <div className="flex items-center justify-between text-teal-700 text-xs font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> สัญญาณชีพ (Vitals)
              </span>
            </div>
            <p className="text-base font-bold text-slate-800">
              {latestLog ? `${latestLog.bp} mmHg` : '120/80 mmHg'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ชีพจร: {latestLog ? `${latestLog.pulse} bpm` : '76 bpm'}
            </p>
          </div>

          {/* Weight & BMI */}
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
            <div className="flex items-center justify-between text-teal-700 text-xs font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Weight className="w-3.5 h-3.5" /> น้ำหนัก / BMI
              </span>
            </div>
            <p className="text-base font-bold text-slate-800">
              {latestLog ? `${latestLog.weight} kg` : '65.0 kg'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              BMI: {latestLog ? latestLog.bmi : '22.5'}
            </p>
          </div>

          {/* Depot / LAI Injection */}
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
            <div className="flex items-center justify-between text-teal-700 text-xs font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Syringe className="w-3.5 h-3.5" /> ยาฉีด Depot (LAI)
              </span>
            </div>
            <p className="text-xs font-bold text-teal-900 truncate">
              {latestLog?.depotDrug ? latestLog.depotDrug : 'ไม่มีรายการยาฉีด'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {latestLog?.depotDate ? `ฉีดล่าสุด: ${latestLog.depotDate}` : 'รับประทานยาเม็ด'}
            </p>
          </div>

          {/* Observed Therapy DOT */}
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
            <div className="flex items-center justify-between text-teal-700 text-xs font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> กินยาต่อหน้า (DOT)
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-1">
              {latestLog?.dotObserved ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ยืนยันกินยาเรียบร้อย
                </span>
              ) : (
                <span className="text-slate-500">ไม่ได้สังเกตต่อหน้า</span>
              )}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              พยาบาล: {latestLog?.nurseName || 'พว.สมหญิง'}
            </p>
          </div>
        </div>
      </div>

      {/* Nursing History Logs Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 space-y-3">
        <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
          <span>ประวัติบันทึกการพยาบาลและการประเมินสภาวะจิต (MSE)</span>
          <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-normal">
            {patientNurseLogs.length} บันทึก
          </span>
        </h4>

        {patientNurseLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-pink-50/20 rounded-xl border border-dashed border-pink-100">
            <Stethoscope className="w-8 h-8 mx-auto text-teal-300 mb-2" />
            <p>ยังไม่มีประวัติบันทึกการพยาบาลสำหรับผู้ป่วยรายนี้</p>
            <p className="text-[11px] text-slate-400 mt-1">กด "บันทึกการพยาบาลใหม่" ด้านบนเพื่อบันทึกสัญญาณชีพและการสังเกตพฤติกรรม</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patientNurseLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 pb-1 border-b border-teal-100">
                  <span className="font-bold text-teal-900 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-teal-600" /> วันที่: {log.date}
                  </span>
                  <span className="text-teal-700 font-semibold">{log.nurseName}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-700 bg-white/70 p-2 rounded-lg border border-teal-50">
                  <div><strong>BP / PR:</strong> {log.bp} ({log.pulse} bpm)</div>
                  <div><strong>น้ำหนัก:</strong> {log.weight} kg (BMI {log.bmi})</div>
                  <div><strong>ฉีดยา Depot:</strong> {log.depotDrug || '-'}</div>
                  <div><strong>กินยา DOT:</strong> {log.dotObserved ? '✓ ทานต่อหน้า' : '-'}</div>
                </div>

                <div>
                  <strong className="text-slate-800 block text-[11px]">การสังเกตสภาวะจิต (Mental State Examination - MSE):</strong>
                  <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed">{log.mseObservation}</p>
                </div>

                {log.riskBehavior && (
                  <div>
                    <strong className="text-rose-700 block text-[11px]">พฤติกรรมเสี่ยงหรือความรุนแรง:</strong>
                    <p className="text-slate-700 text-[11px] mt-0.5">{log.riskBehavior}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
