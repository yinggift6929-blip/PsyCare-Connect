import React from 'react';
import { 
  Brain, 
  Plus, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  HeartHandshake, 
  CheckCircle2,
  Smile,
  ShieldAlert
} from 'lucide-react';
import { Patient, PsychRecord } from '../types.ts';

interface PsychologistTabProps {
  patient: Patient;
  psychRecords: PsychRecord[];
  onOpenAddPsychLog: () => void;
}

export const PsychologistTab: React.FC<PsychologistTabProps> = ({
  patient,
  psychRecords,
  onOpenAddPsychLog
}) => {
  const patientPsychLogs = psychRecords.filter(p => p.patientId === patient.id);
  const latestLog = patientPsychLogs[0];

  const getPhq9Interpretation = (score: number) => {
    if (score >= 20) return { label: 'รุนแรงมาก (Severe)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    if (score >= 15) return { label: 'ปานกลางค่อนข้างรุนแรง (Mod-Severe)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (score >= 10) return { label: 'ปานกลาง (Moderate)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (score >= 5) return { label: 'เล็กน้อย (Mild)', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    return { label: 'ไม่มีภาวะซึมเศร้า (Minimal/None)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const phq9Info = latestLog ? getPhq9Interpretation(latestLog.phq9Score) : { label: 'ยังไม่มีผลประเมิน', color: 'bg-slate-50 text-slate-600 border-slate-200' };

  return (
    <div className="space-y-5">
      {/* Psychological Overview & Scores */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-xl">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                การประเมินทางจิตวิทยาและการบำบัดทางจิต (Psychological Assessment & Psychotherapy)
              </h3>
              <p className="text-[11px] text-slate-500">
                แบบประเมิน PHQ-9, 8Q Suicide Risk, GAD-7 และบันทึก CBT / Counseling Sessions
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddPsychLog}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> บันทึกผลประเมิน / CBT ใหม่
          </button>
        </div>

        {/* 3 Metric Summary Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* PHQ-9 Card */}
          <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1">
            <span className="text-[11px] font-semibold text-purple-700 block">
              แบบประเมินภาวะซึมเศร้า (PHQ-9 Score)
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-purple-950">
                {latestLog ? `${latestLog.phq9Score} / 27` : '-'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${phq9Info.color}`}>
                {phq9Info.label}
              </span>
            </div>
          </div>

          {/* Suicide Risk 8Q Card */}
          <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1">
            <span className="text-[11px] font-semibold text-rose-700 block">
              การประเมินความเสี่ยงต่อการฆ่าตัวตาย (8Q / 9Q)
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-rose-950 truncate max-w-[150px]">
                {latestLog ? latestLog.suicideRisk8q : 'ยังไม่มีการประเมิน'}
              </span>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                Safety Protocol
              </span>
            </div>
          </div>

          {/* Therapy Session Card */}
          <div className="p-3.5 bg-pink-50/50 rounded-xl border border-pink-100 space-y-1">
            <span className="text-[11px] font-semibold text-pink-700 block">
              รูปแบบการบำบัดและความก้าวหน้า
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold text-pink-950 truncate">
                {latestLog ? latestLog.therapyType : 'Psychoeducation'}
              </span>
              <span className="text-[10px] font-bold bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                {latestLog?.sessionNumber || 'ครั้งที่ 1'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Psychological Notes Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 space-y-3">
        <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
          <span>ประวัติบันทึกการปรึกษาทางจิตวิทยา (Counseling & Psychotherapy Progress)</span>
          <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-normal">
            {patientPsychLogs.length} บันทึก
          </span>
        </h4>

        {patientPsychLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-pink-50/20 rounded-xl border border-dashed border-pink-100">
            <Brain className="w-8 h-8 mx-auto text-purple-300 mb-2" />
            <p>ยังไม่มีบันทึกการประเมินทางจิตวิทยาสำหรับผู้ป่วยรายนี้</p>
            <p className="text-[11px] text-slate-400 mt-1">กด "บันทึกผลประเมิน / CBT ใหม่" ด้านบนเพื่อเริ่มบันทึกคะแนน PHQ-9 และการบำบัด</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patientPsychLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 pb-1 border-b border-purple-100">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-purple-600" /> วันที่: {log.date}
                  </span>
                  <span className="text-purple-700 font-semibold">{log.psychologistName}</span>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-purple-100 font-medium">
                    <strong>PHQ-9:</strong> {log.phq9Score} คะแนน
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-purple-100 font-medium">
                    <strong>8Q Suicide:</strong> {log.suicideRisk8q}
                  </span>
                  {log.gad7Score !== undefined && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-purple-100 font-medium">
                      <strong>GAD-7:</strong> {log.gad7Score} คะแนน
                    </span>
                  )}
                  <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg font-medium">
                    {log.therapyType} ({log.sessionNumber})
                  </span>
                </div>

                <div>
                  <strong className="text-slate-800 block text-[11px] mb-0.5">บันทึกการให้คำปรึกษาและแผนการดูแล (Counseling Notes):</strong>
                  <p className="text-slate-700 text-[11px] leading-relaxed bg-white/60 p-2.5 rounded-xl border border-purple-50">
                    {log.counselingNotes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
