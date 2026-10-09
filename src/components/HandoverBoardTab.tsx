import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  User, 
  Check, 
  CornerDownRight,
  Filter
} from 'lucide-react';
import { Patient, HandoverMessage, RoleType } from '../types.ts';

interface HandoverBoardTabProps {
  patient: Patient;
  handovers: HandoverMessage[];
  currentRole: RoleType;
  onSubmitHandover: (handover: {
    targetRole: RoleType | 'all';
    priority: 'normal' | 'urgent' | 'stat';
    subject: string;
    content: string;
  }) => void;
  onResolveHandover: (handoverId: string, responseNote?: string) => void;
}

export const HandoverBoardTab: React.FC<HandoverBoardTabProps> = ({
  patient,
  handovers,
  currentRole,
  onSubmitHandover,
  onResolveHandover
}) => {
  const [targetRole, setTargetRole] = useState<RoleType | 'all'>('all');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'stat'>('normal');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  // Resolving Note Form state for individual items
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState('');

  const patientHandovers = handovers.filter(h => h.patientId === patient.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert('กรุณากรอกหัวข้อและรายละเอียดข้อความส่งต่อ');
      return;
    }
    onSubmitHandover({
      targetRole,
      priority,
      subject: subject.trim(),
      content: content.trim()
    });
    setSubject('');
    setContent('');
  };

  const handleConfirmResolve = (id: string) => {
    onResolveHandover(id, responseNote.trim() || 'รับทราบและดำเนินการตามแผนเรียบร้อย');
    setResolvingId(null);
    setResponseNote('');
  };

  const getRoleBadge = (role: string) => {
    if (role === 'pharmacist') return <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-md font-medium text-[10px]">💊 เภสัชกร</span>;
    if (role === 'nurse') return <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-medium text-[10px]">🩺 พยาบาล</span>;
    if (role === 'psychologist') return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-medium text-[10px]">🧠 นักจิตวิทยา</span>;
    return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-medium text-[10px]">👥 ทีมสหวิชาชีพ</span>;
  };

  return (
    <div className="space-y-5">
      {/* 1. Create New Handover Note Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-pink-50">
          <div className="p-1.5 bg-amber-100 text-amber-700 rounded-xl">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              กระดานส่งต่อและประสานงานสหวิชาชีพ (Multidisciplinary Handover Board)
            </h3>
            <p className="text-[11px] text-slate-500">
              ฝากโน้ตติดตาม ส่งต่อข้อมูลการดูแลผู้ป่วย {patient.name} (HN: {patient.hn}) ถึงทีมสหวิชาชีพ
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 bg-pink-50/20 p-3.5 rounded-xl border border-pink-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ส่งถึงวิชาชีพ (@Target):
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                <option value="all">@ ทีมสหวิชาชีพทั้งหมด (All Team)</option>
                <option value="pharmacist">@ เภสัชกร (Pharmacist)</option>
                <option value="nurse">@ พยาบาล (Nurse)</option>
                <option value="psychologist">@ นักจิตวิทยา (Psychologist)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ระดับความเร่งด่วน (Priority):
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                <option value="normal">ปกติ (Routine Care)</option>
                <option value="urgent">เร่งด่วน (Urgent / High Risk)</option>
                <option value="stat">วิกฤต (STAT / Relapse Alert)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                หัวข้อส่งต่อ (Subject):
              </label>
              <input
                type="text"
                placeholder="เช่น ขอติดตาม Adherence / เฝ้าระวัง EPS"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              รายละเอียดข้อมูลที่ต้องการประสานงาน:
            </label>
            <textarea
              rows={2}
              placeholder="พิมพ์รายละเอียดที่ต้องการให้ทีมสหวิชาชีพช่วยติดตามดูแล เช่น ผลข้างเคียงจากยา, นัดฉีดยา Depot, หรือประเด็นความเครียด..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-slate-500">
              ผู้ส่งข้อความ: {getRoleBadge(currentRole)}
            </span>
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" /> ส่งโน้ตประสานงาน
            </button>
          </div>
        </form>
      </div>

      {/* 2. Handover History List */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-pink-50">
          <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <span>ประวัติการส่งต่อเคสของ {patient.name}</span>
            <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-normal">
              {patientHandovers.length} ข้อความ
            </span>
          </h4>
        </div>

        {patientHandovers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-pink-50/20 rounded-xl border border-dashed border-pink-100">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p>ยังไม่มีข้อความส่งต่อสหวิชาชีพสำหรับผู้ป่วยรายนี้</p>
            <p className="text-[11px] text-slate-400 mt-1">ใช้แบบฟอร์มด้านบนเพื่อสื่อสารและวางแผนการดูแลร่วมกัน</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patientHandovers.map((h) => {
              const isResolved = h.status === 'resolved';

              return (
                <div
                  key={h.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 transition ${
                    isResolved
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : h.priority === 'stat'
                      ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200'
                      : h.priority === 'urgent'
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-white border-pink-100 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{h.subject}</span>
                      {h.priority === 'stat' && (
                        <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                          <Flame className="w-3 h-3" /> STAT / วิกฤต
                        </span>
                      )}
                      {h.priority === 'urgent' && (
                        <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> ด่วน (Urgent)
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> รับทราบ/จัดการแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" /> รอดำเนินการ (Open)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>จาก: {getRoleBadge(h.senderRole)}</span>
                    <span>→ ส่งถึง: {getRoleBadge(h.targetRole)}</span>
                  </div>

                  <p className="text-slate-800 text-xs leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100">
                    {h.content}
                  </p>

                  {/* Resolution Note if any */}
                  {h.responseNote && (
                    <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>การตอบรับ ({h.resolvedBy || 'ทีมงาน'}):</strong> {h.responseNote}
                        {h.resolvedAt && <span className="text-[10px] text-emerald-700 ml-2">({h.resolvedAt})</span>}
                      </div>
                    </div>
                  )}

                  {/* Action to Resolve */}
                  {!isResolved && (
                    <div className="pt-1 flex items-center justify-end">
                      {resolvingId === h.id ? (
                        <div className="flex items-center gap-2 w-full pt-1">
                          <input
                            type="text"
                            placeholder="พิมพ์ข้อความตอบกลับหรือการดำเนินการ..."
                            value={responseNote}
                            onChange={(e) => setResponseNote(e.target.value)}
                            className="flex-1 text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400"
                          />
                          <button
                            onClick={() => handleConfirmResolve(h.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition shadow-2xs"
                          >
                            ยืนยันรับทราบ
                          </button>
                          <button
                            onClick={() => setResolvingId(null)}
                            className="text-slate-500 hover:text-slate-700 text-xs px-2 py-1"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResolvingId(h.id)}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg font-medium transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> มาร์กว่ารับทราบแล้ว / ตอบกลับ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
