import React, { useState } from 'react';
import { 
  Send, 
  AlertTriangle, 
  Pill, 
  CheckCircle2, 
  ExternalLink, 
  HelpCircle, 
  Sparkles,
  Flame,
  ShieldAlert,
  Save,
  MessageSquare,
  Key
} from 'lucide-react';
import { Patient, RoleType, NotificationSettings, HandoverMessage, Medication } from '../../types.ts';
import { PsychiatricModalFrame } from '../common/PsychiatricModalFrame.tsx';
import { sendTelegramNotification, sanitizeTelegramToken } from '../../services/notificationService.ts';
import { GenderBadge } from '../common/GenderIcon.tsx';

interface QuickDrugReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  currentRole: RoleType;
  medications?: Medication[];
  notificationSettings: NotificationSettings;
  onSaveNotificationSettings: (newSettings: NotificationSettings) => Promise<void> | void;
  onSubmitHandover: (handover: {
    targetRole: RoleType | 'all';
    priority: 'normal' | 'urgent' | 'stat';
    subject: string;
    content: string;
  }) => void;
}

const PRESET_TOPICS = [
  {
    id: 'adherence',
    icon: '🛑',
    label: 'ไม่ร่วมมือในการใช้ยา / ขาดยา (Non-Adherence)',
    subject: 'ผู้ป่วยขาดยา / หยุดยาเอง / ลืมทานยาบ่อยครั้ง',
    defaultContent: 'ญาติหรือผู้ป่วยรายงานว่าลืมทานยาบ่อยครั้ง หรือหยุดยาเอง เม็ดยาเหลือจำนวนมาก ขอส่งต่อเภสัชกรช่วยประเมินสาเหตุ ให้คำปรึกษา และวางแผนการทานยา',
    priority: 'urgent' as const
  },
  {
    id: 'adr_eps',
    icon: '⚠️',
    label: 'อาการข้างเคียงจากยา / EPS / สั่นเกร็ง (ADR)',
    subject: 'พบอาการข้างเคียงสงสัยจากยาจิตเวช (EPS / สั่น เกร็ง / น้ำลายยืด)',
    defaultContent: 'จากการตรวจติดตามพบผู้ป่วยมีอาการมือสั่น ตัวเกร็ง เดินซอยเท้า หรือน้ำลายยืดเลอะหมอน สงสัยเป็นอาการข้างเคียงจากยาต้านโรคจิต ขอส่งต่อให้เภสัชกรประเมิน DIEPSS และพิจารณาปรับยา',
    priority: 'urgent' as const
  },
  {
    id: 'dose_adjust',
    icon: '💊',
    label: 'ปรึกษาปรับขนาดยา / ผล Lab ผิดปกติ',
    subject: 'ขอคำปรึกษาทางเภสัชกรรมเกี่ยวกับการปรับขนาดยา หรือติดตามผลตรวจ Lab',
    defaultContent: 'ผู้ป่วยมีผลการตรวจหรืออาการเปลี่ยนแปลง ขอความกรุณาเภสัชกรช่วยตรวจสอบประวัติการใช้ยา ขนาดยาที่เหมาะสม หรือตรวจติดตามความปลอดภัยของยา',
    priority: 'normal' as const
  },
  {
    id: 'stat_crisis',
    icon: '🚨',
    label: 'วิกฤต / สงสัยแพ้ยารุนแรง / Relapse ด่วน',
    subject: 'ด่วนที่สุด (STAT) เฝ้าระวังความปลอดภัยจากการใช้ยาจิตเวช',
    defaultContent: 'พบอาการผิดปกติเร่งด่วนที่ต้องให้เภสัชกรและแพทย์ร่วมตรวจสอบทันทีเกี่ยวกับยาจิตเวชที่ผู้ป่วยได้รับ',
    priority: 'stat' as const
  }
];

export const QuickDrugReferralModal: React.FC<QuickDrugReferralModalProps> = ({
  isOpen,
  onClose,
  patient,
  currentRole,
  medications = [],
  notificationSettings,
  onSaveNotificationSettings,
  onSubmitHandover
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('adherence');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'stat'>('urgent');
  const [subject, setSubject] = useState(PRESET_TOPICS[0].subject);
  const [content, setContent] = useState(PRESET_TOPICS[0].defaultContent);

  // Bot Token input with automatic sanitization (Bot ID 8736275097)
  const [botTokenInput, setBotTokenInput] = useState(
    sanitizeTelegramToken(notificationSettings.telegramBotToken) || '8736275097:AAGNAdvrCKfQ9ZkPWWjL7IRyk8runB2y0Rw'
  );
  const [isEditingToken, setIsEditingToken] = useState(false);

  // Submission state
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const patientMeds = medications.filter(m => m.patientId === patient.id);
  const currentToken = sanitizeTelegramToken(notificationSettings.telegramBotToken);
  const hasFullToken = currentToken.includes(':');
  const targetChatId = notificationSettings.telegramChatId || '-5506194529';

  const handleSelectPreset = (preset: typeof PRESET_TOPICS[0]) => {
    setSelectedTopicId(preset.id);
    setSubject(preset.subject);
    setContent(preset.defaultContent);
    setPriority(preset.priority);
  };

  const handleSaveTokenOnly = async () => {
    const clean = sanitizeTelegramToken(botTokenInput);
    if (!clean) return;
    const updated = {
      ...notificationSettings,
      telegramBotToken: clean,
      telegramEnabled: true
    };
    await onSaveNotificationSettings(updated);
    setBotTokenInput(clean);
    setIsEditingToken(false);
  };

  const handleSubmitAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert('กรุณากรอกหัวข้อและรายละเอียดปัญหาการใช้ยา');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    // 1. Submit handover to clinic database FIRST so clinical patient data is ALWAYS saved
    onSubmitHandover({
      targetRole: 'pharmacist',
      priority,
      subject: subject.trim(),
      content: content.trim()
    });

    const tokenToUse = sanitizeTelegramToken(botTokenInput) || sanitizeTelegramToken(notificationSettings.telegramBotToken);

    // If token has changed, save to settings
    if (tokenToUse && tokenToUse !== notificationSettings.telegramBotToken) {
      const updated = {
        ...notificationSettings,
        telegramBotToken: tokenToUse,
        telegramEnabled: true
      };
      await onSaveNotificationSettings(updated);
    }

    // 2. Format Telegram notification message for the group
    const senderThai = currentRole === 'nurse' ? 'พยาบาลวิชาชีพ' : currentRole === 'psychologist' ? 'นักจิตวิทยา' : 'ทีมสหวิชาชีพ';
    const priorityThai = priority === 'stat' ? '🚨 วิกฤต (STAT)' : priority === 'urgent' ? '⚡ ด่วนมาก (Urgent)' : '📋 ปกติ (Routine)';
    const timestamp = new Date().toLocaleString('th-TH');

    const telegramMessage = [
      `<b>🚨 [ส่งต่อถึงเภสัชกร] แจ้งเตือนปัญหาการใช้ยาของผู้ป่วย</b>`,
      `<i>เวลา: ${timestamp}</i>`,
      ``,
      `👤 <b>ผู้ป่วย:</b> ${patient.name} (HN: ${patient.hn})`,
      `🩺 <b>วินิจฉัย:</b> ${patient.diagnosis}`,
      `👨‍⚕️ <b>ผู้ส่งต่อ:</b> ${senderThai}`,
      `💊 <b>ส่งถึง:</b> เภสัชกรคลินิก (Pharmacist)`,
      `⚡ <b>ความเร่งด่วน:</b> ${priorityThai}`,
      `📋 <b>หัวข้อ:</b> ${subject.trim()}`,
      ``,
      `📝 <b>รายละเอียดปัญหาการใช้ยา:</b>`,
      `${content.trim()}`,
      ``,
      `👥 <i>แจ้งเตือนผ่านกลุ่ม Telegram: ${targetChatId}</i>`,
      `<i>📍 ระบบจิตเวชชุมชน PsyCare Multi-Disciplinary</i>`
    ].join('\n');

    const finalToken = (tokenToUse && tokenToUse.includes(':'))
      ? tokenToUse
      : '8736275097:AAGNAdvrCKfQ9ZkPWWjL7IRyk8runB2y0Rw';
    const finalChatId = (targetChatId && targetChatId.length > 3)
      ? targetChatId
      : '-5506194529';

    try {
      const res = await sendTelegramNotification(finalToken, finalChatId, telegramMessage);
      if (res.success) {
        setSendResult({
          success: true,
          message: `✅ ส่งข้อความแจ้งเตือนเข้า Telegram กลุ่ม Clinic จิตดี (${finalChatId}) สำเร็จเรียบร้อยแล้ว! เภสัชกรในกลุ่มรับทราบทันที`
        });
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setSendResult({
          success: false,
          message: res.error || 'ส่งแจ้งเตือน Telegram ไม่สำเร็จ กรุณาตรวจสอบการดึงบอทเข้ากลุ่ม'
        });
        setIsEditingToken(true);
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: `ข้อผิดพลาด: ${err.message || 'เน็ตเวิร์กขัดข้อง'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      icon={<Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      title="ส่งต่อปัญหาการใช้ยาถึงเภสัชกร (Pharmacist Referral)"
      subtitle={`ส่งต่อข้อมูลการดูแลผู้ป่วย ${patient.name} (HN: ${patient.hn}) แจ้งเตือนเข้า Telegram กลุ่มทันที`}
      badgeText="แจ้งเตือน Telegram กลุ่ม"
      badgeColor="sky"
      confidentialNotice="การประสานงานความปลอดภัยทางยาและส่งต่อสหวิชาชีพ (Multidisciplinary Drug Safety Referral)"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-1.5 text-xs text-sky-800">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="font-semibold hidden sm:inline">กลุ่ม Telegram:</span>
            <code className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
              {targetChatId}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handleSubmitAndSend}
              disabled={isSending}
              className="bg-gradient-to-r from-sky-500 via-rose-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'กำลังส่งแจ้งเตือนเข้ากลุ่ม...' : '🚀 ยืนยันส่งต่อ & แจ้งเตือน Telegram กลุ่ม'}</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmitAndSend} className="space-y-4 text-xs">
        {/* Patient Summary Ribbon */}
        <div className="p-3 bg-gradient-to-r from-rose-50/80 via-white to-pink-50/80 rounded-xl border border-rose-200/80 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>{patient.name}</span>
              <span className="text-xs text-slate-500 font-mono font-normal">(HN: {patient.hn})</span>
              <GenderBadge gender={patient.gender} />
              <span className="text-xs text-slate-600 font-medium">{patient.age} ปี</span>
            </div>
            <div className="text-slate-600 text-xs mt-0.5">
              <strong>วินิจฉัยหลัก:</strong> {patient.diagnosis}
            </div>
          </div>

          {patientMeds.length > 0 && (
            <div className="text-right text-[11px] text-slate-500">
              <span className="block font-semibold text-slate-700">ยาปัจจุบัน ({patientMeds.length} รายการ):</span>
              <span className="text-rose-700 font-medium truncate max-w-xs block">
                {patientMeds.map(m => m.name).slice(0, 2).join(', ')}
                {patientMeds.length > 2 && ` +${patientMeds.length - 2}`}
              </span>
            </div>
          )}
        </div>

        {/* Telegram Bot Token Status / Fast Configuration Box */}
        {(!hasFullToken || isEditingToken) ? (
          <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-300 space-y-2.5 animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Key className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ระบุ Telegram Bot Token เพื่อส่งแจ้งเตือนเข้ากลุ่ม:</span>
              </div>
              <button
                type="button"
                onClick={() => window.open('https://t.me/BotFather', '_blank')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-white hover:bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-300 shadow-2xs transition"
              >
                <span>เปิด @BotFather ใน Telegram</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="text-[11px] text-amber-900 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-amber-200 space-y-1">
              <p>
                💡 Telegram Bot: <b>Psycare_demo_bot (@Psycare_demobot)</b> (ID: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900 font-bold">8736275097</code>)
              </p>
              <p className="text-slate-600">
                ส่งแจ้งเตือนเข้ากลุ่ม: <b>Clinic จิตดี (ID: -5506194529)</b> อัตโนมัติทันทีที่มีการส่งต่อปัญหาการใช้ยา
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={botTokenInput}
                onChange={(e) => setBotTokenInput(e.target.value)}
                placeholder="เช่น 8736275097:AAGNAdvrCKfQ9ZkPWWjL7IRyk8runB2y0Rw..."
                className="flex-1 p-2 text-xs bg-white border border-amber-300 rounded-xl font-mono focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveTokenOnly}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition shrink-0 cursor-pointer"
              >
                บันทึก Token
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-800">
                พร้อมส่งข้อความเข้ากลุ่ม Telegram: <code className="text-sky-700 font-bold">Clinic จิตดี ({targetChatId})</code>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">(@Psycare_demobot)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingToken(true)}
              className="text-[10px] text-sky-700 hover:text-sky-900 underline font-semibold cursor-pointer"
            >
              แก้ไข Token
            </button>
          </div>
        )}

        {/* Real-time Feedback Banner */}
        {sendResult && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
            sendResult.success 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}>
            {sendResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{sendResult.message}</p>
              {!sendResult.success && (
                <p className="text-[11px] text-slate-600">
                  ตรวจสอบว่าบอทถูกดึงเข้ากลุ่ม Telegram <b>{targetChatId}</b> แล้ว และมี Token จาก @BotFather ครบถ้วน
                </p>
              )}
            </div>
          </div>
        )}

        {/* 1. Quick Presets Selection */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
            <span>1. เลือกประเภทปัญหาการใช้ยา (คลิกเพื่อเลือกหัวข้อด่วน):</span>
            <span className="text-[11px] text-rose-600 font-medium">4 หมวดหลัก</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_TOPICS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 cursor-pointer ${
                  selectedTopicId === preset.id
                    ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-200 shadow-2xs'
                    : 'bg-white hover:bg-rose-50/40 border-slate-200'
                }`}
              >
                <span className="text-base shrink-0">{preset.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 text-[11px] leading-tight">
                    {preset.label}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {preset.subject}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Priority & Target Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ระดับความเร่งด่วน (Priority):
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full p-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none"
            >
              <option value="normal">📋 ปกติ (Routine Care)</option>
              <option value="urgent">⚡ ด่วนมาก (Urgent / High Risk)</option>
              <option value="stat">🚨 วิกฤต (STAT / ทันที)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ผู้ส่งต่อ (ทีมสหวิชาชีพ):
            </label>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-between">
              <span>{currentRole === 'nurse' ? '🩺 พยาบาลวิชาชีพ' : currentRole === 'psychologist' ? '🧠 นักจิตวิทยาคลินิก' : '💊 เภสัชกร'}</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-semibold">
                ส่งถึง 💊 เภสัชกร
              </span>
            </div>
          </div>
        </div>

        {/* 3. Subject */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            หัวข้อส่งต่อ (Subject): <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none"
            placeholder="ระบุหัวข้อปัญหาการใช้ยา..."
          />
        </div>

        {/* 4. Content */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            รายละเอียดปัญหาการใช้ยาที่ต้องการให้เภสัชกรช่วยเหลือ: <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2.5 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none"
            placeholder="พิมพ์รายละเอียดปัญหา เช่น พบผู้ป่วยหยุดทานยาเอง 1 สัปดาห์ หรือมีอาการข้างเคียง..."
          />
        </div>
      </form>
    </PsychiatricModalFrame>
  );
};
