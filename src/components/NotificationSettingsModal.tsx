import React, { useState } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  ExternalLink,
  ShieldAlert,
  Save,
  Check,
  Smartphone,
  Users
} from 'lucide-react';
import { NotificationSettings } from '../types.ts';
import { sendTelegramNotification, sendLineNotification, sanitizeTelegramToken } from '../services/notificationService.ts';
import { PsychiatricModalFrame } from './common/PsychiatricModalFrame.tsx';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (settings: NotificationSettings) => Promise<void> | void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  onSaveSettings,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'telegram' | 'line' | 'events'>('telegram');
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingLine, setTestingLine] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [lineStatus, setLineStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestTelegram = async () => {
    const cleanToken = sanitizeTelegramToken(settings.telegramBotToken);
    const cleanChatId = settings.telegramChatId.trim();

    if (!cleanToken || !cleanChatId) {
      setTelegramStatus({ success: false, message: 'กรุณากรอก Telegram Bot Token และ Chat ID ก่อนทดสอบครับ' });
      return;
    }

    if (!cleanToken.includes(':')) {
      setTelegramStatus({
        success: false,
        message: `⚠️ รหัสที่ระบุ (${cleanToken}) คือ Bot ID ของ Telegram สำหรับการส่งข้อความเข้ากลุ่ม Telegram API ต้องการ Bot Token ฉบับเต็ม เช่น ${cleanToken}:AAHxxx... ที่ได้รับจาก @BotFather กรุณานำ Token ฉบับเต็มมากรอกในช่องด้านบนครับ`
      });
      return;
    }

    setTestingTelegram(true);
    setTelegramStatus(null);
    const testMsg = `<b>🔔 ทดสอบการแจ้งเตือนจากระบบ PsyCare</b>\n\nการเชื่อมต่อระหว่างระบบดูแลผู้ป่วยจิตเวชชุมชนและ Telegram สำเร็จเรียบร้อยแล้วครับ!\n\n<i>พร้อมรับการแจ้งเตือนปัญหาการใช้ยา ส่งต่อถึงเภสัชกร และเคสผู้ป่วยแบบ Real-Time</i>\n\n👥 <i>กลุ่ม: Clinic จิตดี (${cleanChatId})</i>\n🤖 <i>บอท: @Psycare_demobot</i>`;
    const res = await sendTelegramNotification(cleanToken, cleanChatId, testMsg);
    setTestingTelegram(false);
    setTelegramStatus({
      success: res.success,
      message: res.success ? `✅ ส่งข้อความทดสอบเข้ากลุ่ม Telegram Clinic จิตดี (${cleanChatId}) สำเร็จเรียบร้อย! ตรวจสอบในกลุ่มได้เลยครับ` : `❌ ${res.error}`,
    });
  };

  const handleTestLine = async () => {
    if (!settings.lineChannelAccessToken.trim() || !settings.lineTargetId.trim()) {
      setLineStatus({ success: false, message: 'กรุณากรอก Channel Access Token และ User/Group ID ก่อนทดสอบครับ' });
      return;
    }
    setTestingLine(true);
    setLineStatus(null);
    const testMsg = `🔔 ทดสอบการแจ้งเตือนจากระบบ PsyCare\n\nการเชื่อมต่อระหว่างระบบดูแลผู้ป่วยจิตเวชชุมชนและ LINE Messaging API สำเร็จเรียบร้อยแล้ว!\n\nพร้อมรับการแจ้งเตือนเคสผู้ป่วย นัดหมาย และการส่งเวรแบบ Real-Time`;
    const res = await sendLineNotification(settings.lineChannelAccessToken, settings.lineTargetId, testMsg);
    setTestingLine(false);
    setLineStatus({
      success: res.success,
      message: res.success ? '✅ ส่งข้อความทดสอบเข้า LINE สำเร็จ!' : `❌ ${res.error}`,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleanSettings = {
        ...settings,
        telegramBotToken: sanitizeTelegramToken(settings.telegramBotToken)
      };
      await onSaveSettings(cleanSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      icon={<Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      title="ศูนย์ตั้งค่าการแจ้งเตือน LINE & Telegram"
      subtitle="แจ้งเตือนเคสผู้ป่วย, ส่งเวรทีมสหวิชาชีพ, และสรุปนัดหมายติดตามเข้ามือถือทันที"
      badgeText="Real-Time"
      badgeColor="emerald"
      confidentialNotice="การเชื่อมต่อระบบแจ้งเตือนภายนอก (Encrypted Push Notification)"
      footer={
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-xs mr-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> บันทึกและซิงค์ Cloud เรียบร้อย
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
          </button>
        </div>
      }
    >


        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('telegram')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'telegram'
                ? 'bg-white text-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-500" />
            <span>Telegram (แนะนำ)</span>
            {settings.telegramEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('line')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'line'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>LINE Messaging</span>
            {settings.lineEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'events'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>เลือกเหตุการณ์แจ้งเตือน</span>
          </button>
        </div>

        {/* TAB 1: TELEGRAM */}
        {activeTab === 'telegram' && (
          <div className="space-y-4">
            {/* Recommendation Banner */}
            <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">ทำไมแนะนำใช้ Telegram เป็นหลัก?</p>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  Telegram Bot <b>ฟรี 100% ไม่มีจำกัดจำนวนข้อความ</b> ติดตั้งง่ายใน 2 นาที ไม่ต้องผูกบัตรเครดิต สามารถส่งแจ้งเตือนทั้งเข้าแชทส่วนตัว หรือดึงเข้า <b>กลุ่มบุคลากร (ทีมแพทย์ พยาบาล เภสัช)</b> ได้ทันที
                </p>
              </div>
            </div>

            {/* Toggle Enable */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate-800">เปิดใช้งานแจ้งเตือนผ่าน Telegram</p>
                <p className="text-[11px] text-slate-500">ส่งข้อความอัตโนมัติเมื่อมีเคสหรือการส่งเวร</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.telegramEnabled}
                  onChange={(e) => setSettings({ ...settings, telegramEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900 flex items-center gap-1.5">
                    <span>🤖 Telegram Bot:</span>
                    <span className="font-semibold text-slate-800">Psycare_demo_bot (@Psycare_demobot)</span>
                    <code className="bg-white px-2 py-0.5 rounded font-mono text-sky-700 border border-sky-300">8736275097</code>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    เชื่อมต่อแล้ว
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900 flex items-center gap-1.5">
                    <span>👥 ส่งเข้ากลุ่ม:</span>
                    <span className="font-semibold text-slate-800">Clinic จิตดี</span>
                    <code className="bg-white px-2 py-0.5 rounded font-mono text-sky-700 border border-sky-300">-5506194529</code>
                  </span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-semibold">
                    แจ้งเตือนผ่านกลุ่มเท่านั้น
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>1. Telegram Bot Token <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (รหัส API ฉบับเต็มจาก @BotFather)
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.telegramBotToken}
                  onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                  placeholder="เช่น 8736275097:AAGNAdvrCKfQ9ZkPWWjL7IRyk8runB2y0Rw..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                {!settings.telegramBotToken.includes(':') && settings.telegramBotToken.trim().length > 0 && (
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-1.5 space-y-1.5 text-[11px] text-amber-900 leading-relaxed">
                    <p>
                      💡 <b>คำแนะนำ:</b> รหัสที่ระบุคือ <b>Bot ID</b> ซึ่ง Telegram API ต้องการ <b>Bot Token ฉบับเต็ม</b> (เช่น <code>8736275097:AAGN...</code>)
                    </p>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-slate-600">พิมพ์ <code>/token</code> ใน @BotFather เพื่อคัดลอกรหัส</span>
                      <button
                        type="button"
                        onClick={() => window.open('https://t.me/BotFather', '_blank')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-white hover:bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-300 shadow-2xs transition cursor-pointer"
                      >
                        <span>เปิด @BotFather</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>2. Telegram Group ID (แจ้งเตือนเฉพาะกลุ่ม) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-sky-700 font-semibold">กลุ่ม: -5506194529</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.telegramChatId}
                    onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                    placeholder="เช่น -5506194529"
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, telegramChatId: '-5506194529' })}
                    className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 shrink-0"
                    title="คลิกเพื่อเลือกกลุ่ม ID: -5506194529"
                  >
                    ใช้กลุ่ม -5506194529
                  </button>
                </div>
              </div>
            </div>

            {/* Test Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingTelegram ? 'กำลังส่งทดสอบ...' : 'ทดสอบส่งแจ้งเตือนเข้า Telegram กลุ่ม (-5506194529)'}</span>
              </button>
            </div>

            {telegramStatus && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  telegramStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {telegramStatus.message}
              </div>
            )}

            {/* Step-by-Step Guide Accordion */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <HelpCircle className="w-4 h-4 text-sky-500" />
                <span>วิธีสร้าง Telegram Bot และหา Chat ID ใน 4 ขั้นตอน:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed pl-1">
                <li>
                  เปิดแอป <b>Telegram</b> ค้นหาช่องค้นหาพิมพ์ <b className="text-sky-600 font-mono">@BotFather</b> แล้วกด Start
                </li>
                <li>
                  พิมพ์ <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">/newbot</code> แล้วตั้งชื่อบอท เช่น <i>PsyCareClinic</i> และ username เช่น <i>PsyCareAlert_bot</i>
                </li>
                <li>
                  BotFather จะส่ง <b>HTTP API Token</b> (ข้อความตัวเลขยาวๆ) ให้นำมากรอกในช่อง <i>Telegram Bot Token</i> ด้านบน
                </li>
                <li>
                  <b>วิธีหา Chat ID:</b>
                  <div className="pl-4 pt-1 space-y-1 text-slate-500">
                    <div>• <b>รับคนเดียว:</b> ค้นหา <code className="font-mono text-sky-600">@userinfobot</code> ใน Telegram กด Start จะได้ตัวเลข <b>Id: ...</b> นำมากรอกได้เลย</div>
                    <div>• <b>รับเป็นกลุ่มทีมแพทย์/พยาบาล:</b> เชิญบอทของคุณเข้ากลุ่ม แล้วเชิญบอท <code className="font-mono text-sky-600">@RawDataBot</code> เข้ากลุ่มชั่วคราวเพื่อดูเลข <code>chat.id</code> (ขึ้นต้นด้วยเครื่องหมายลบ เช่น <code>-100xxxxxxx</code>)</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: LINE MESSAGING */}
        {activeTab === 'line' && (
          <div className="space-y-4">
            {/* Important Notice about LINE Notify */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">ข้อควรรู้: LINE Notify ยุติการให้บริการแล้ว (Sunset)</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  บริการ LINE Notify แบบเก่าปิดตัวลงแล้ว ดังนั้นการแจ้งเตือนเข้า LINE ในปัจจุบันต้องใช้ <b>LINE Messaging API (LINE Official Account)</b> โดยสร้างผ่าน LINE Developers Console
                </p>
              </div>
            </div>

            {/* Toggle Enable */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate-800">เปิดใช้งานแจ้งเตือนผ่าน LINE</p>
                <p className="text-[11px] text-slate-500">ส่งข้อความแจ้งเตือนผ่าน LINE Messaging API</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.lineEnabled}
                  onChange={(e) => setSettings({ ...settings, lineEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. LINE Channel Access Token (Long-Lived) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.lineChannelAccessToken}
                  onChange={(e) => setSettings({ ...settings, lineChannelAccessToken: e.target.value })}
                  placeholder="เช่น eyJhbGciOiJIUzI1NiJ9..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. LINE User ID หรือ Group ID ผู้รับ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.lineTargetId}
                  onChange={(e) => setSettings({ ...settings, lineTargetId: e.target.value })}
                  placeholder="เช่น U8a94639e4a... หรือ Group ID C..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* Test Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestLine}
                disabled={testingLine}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{testingLine ? 'กำลังส่งทดสอบ...' : 'ทดสอบส่งแจ้งเตือน LINE ทันที'}</span>
              </button>
            </div>

            {lineStatus && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  lineStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {lineStatus.message}
              </div>
            )}

            {/* Guide */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>วิธีขอ Channel Access Token และ User ID จาก LINE Developers:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed pl-1">
                <li>
                  เข้าสู่เว็บไซต์ <a href="https://developers.line.biz/" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">LINE Developers Console <ExternalLink className="w-3 h-3" /></a> แล้วเข้าสู่ระบบ
                </li>
                <li>
                  สร้าง <b>Provider</b> (เช่น Clinic) แล้วกด Create a new channel เลือก <b>Messaging API</b>
                </li>
                <li>
                  เข้าไปที่แท็บ <b>Messaging API</b> เลื่อนลงมาล่างสุดที่หัวข้อ <i>Channel access token (long-lived)</i> แล้วกด <b>Issue</b> นำ Token มาใส่ในช่องด้านบน
                </li>
                <li>
                  ไปที่แท็บ <b>Basic settings</b> เลื่อนลงมาหา <b>Your user ID</b> (ขึ้นต้นด้วยอักษร <code>U</code>) นำมากรอกในช่อง LINE User ID
                </li>
                <li>
                  <b>สำคัญ:</b> สแกน QR code ของบอทในแท็บ Messaging API เพื่อกด Add Friend เป็นเพื่อนกับบอทก่อน บอทจึงจะส่งแจ้งเตือนเข้าแชทได้ครับ
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS SELECTION */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-900">
              <p className="font-bold mb-1">เลือกประเภทเหตุการณ์ที่ต้องการให้แจ้งเตือนเข้า Telegram / LINE</p>
              <p className="text-[11px] text-rose-800">
                เมื่อเกิดเหตุการณ์ที่เลือก ระบบจะทำการส่งข้อความแจ้งเตือนอัตโนมัติไปยังช่องทางที่เปิดใช้งานทันที
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={settings.notifyOnNewPatient}
                  onChange={(e) => setSettings({ ...settings, notifyOnNewPatient: e.target.checked })}
                  className="mt-1 rounded text-rose-500 focus:ring-rose-400"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">1. แจ้งเตือนเมื่อลงทะเบียนผู้ป่วยใหม่ (New Patient)</p>
                  <p className="text-[11px] text-slate-500">ส่งชื่อ, HN, กลุ่มติดตาม (เยี่ยมบ้าน/Telemed/คลินิก), วินิจฉัย และระดับความเสี่ยง</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={settings.notifyOnHandover}
                  onChange={(e) => setSettings({ ...settings, notifyOnHandover: e.target.checked })}
                  className="mt-1 rounded text-rose-500 focus:ring-rose-400"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">2. แจ้งเตือนเมื่อมีการบันทึกส่งเวร (Handover Board)</p>
                  <p className="text-[11px] text-slate-500">แจ้งเตือนข้ามวิชาชีพ (แพทย์/พยาบาล/เภสัช/นักจิตวิทยา) พร้อมระดับความเร่งด่วน</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={settings.notifyOnDtpCrisis}
                  onChange={(e) => setSettings({ ...settings, notifyOnDtpCrisis: e.target.checked })}
                  className="mt-1 rounded text-rose-500 focus:ring-rose-400"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">3. แจ้งเตือนปัญหาการใช้ยา (DTP) หรืออาการไม่พึงประสงค์ (ADR/EPS)</p>
                  <p className="text-[11px] text-slate-500">แจ้งเตือนทันทีเมื่อเภสัชกรบันทึกปัญหา DTP หรือผลประเมิน DIEPSS/Metabolic วิกฤต</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={settings.notifyOnHomeVisit}
                  onChange={(e) => setSettings({ ...settings, notifyOnHomeVisit: e.target.checked })}
                  className="mt-1 rounded text-rose-500 focus:ring-rose-400"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">4. แจ้งเตือนเมื่อบันทึกผลการเยี่ยมบ้าน (Home Visit Record)</p>
                  <p className="text-[11px] text-slate-500">สรุปผลการลงพื้นที่ สภาพจิตใจ ปัญหาที่พบ และแผนนัดหมายต่อเนื่อง</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={settings.notifyOnDailyDue}
                  onChange={(e) => setSettings({ ...settings, notifyOnDailyDue: e.target.checked })}
                  className="mt-1 rounded text-rose-500 focus:ring-rose-400"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">5. เปิดให้กดส่งสรุปรายชื่อผู้ป่วยที่ต้องติดตามประจำวัน</p>
                  <p className="text-[11px] text-slate-500">ปุ่มส่งสรุปยอดนัดหมายวันนี้ในหน้าต่างระฆังแจ้งเตือน</p>
                </div>
              </label>
            </div>
          </div>
        )}

    </PsychiatricModalFrame>
  );
};
