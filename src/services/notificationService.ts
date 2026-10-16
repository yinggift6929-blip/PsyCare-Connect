import { NotificationSettings, Patient, HandoverMessage, DtpRecord, HomeVisitRecord } from '../types.ts';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  telegramEnabled: true,
  telegramBotToken: '8489161754',
  telegramChatId: '-5506194529',
  lineEnabled: false,
  lineChannelAccessToken: '',
  lineTargetId: '',
  notifyOnNewPatient: false,
  notifyOnHandover: true,
  notifyOnDtpCrisis: true,
  notifyOnHomeVisit: false,
  notifyOnDailyDue: false,
};


const STORAGE_KEY = 'psycare_notification_settings_v1';

export function getLocalNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to read notification settings from localStorage', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveLocalNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save notification settings to localStorage', e);
  }
}

export interface SendResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface BroadcastResult {
  telegram?: SendResult;
  line?: SendResult;
}

/**
 * Send message via Telegram Bot API
 */
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  text: string
): Promise<SendResult> {
  const cleanToken = botToken.trim();
  let cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return { success: false, error: 'กรุณาระบุ Telegram Bot Token และ Chat ID ให้ครบถ้วน' };
  }

  // First try backend proxy (to keep server logs and handle full-stack mode)
  try {
    const res = await fetch('/api/notifications/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botToken: cleanToken, chatId: cleanChatId, text }),
    });

    if (res.ok) {
      const data = await res.json();
      return { 
        success: true, 
        message: data.message || `ส่งแจ้งเตือน Telegram เข้ากลุ่ม ${cleanChatId} สำเร็จ` 
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) {
        return { success: false, error: errData.error };
      }
    }
  } catch {
    // If backend proxy fails or not running, fallback to direct API
  }

  // Check if token is only the bot ID without the secret hash
  if (!cleanToken.includes(':')) {
    return { 
      success: false, 
      error: `⚠️ รหัส "${cleanToken}" คือ Bot ID ของ Telegram สำหรับการส่งข้อความเข้ากลุ่ม กรุณากรอก Bot Token ฉบับเต็ม (เช่น ${cleanToken}:AAHxxx...) ที่ได้รับจาก @BotFather ในช่องตั้งค่าครับ` 
    };
  }

  // Direct fetch fallback (Telegram Bot API allows CORS)
  try {
    let url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    let data = await res.json();

    // Auto-retry if group was migrated to supergroup
    if (!data.ok && data.parameters?.migrate_to_chat_id) {
      cleanChatId = String(data.parameters.migrate_to_chat_id);
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      data = await res.json();
    } else if (!data.ok && cleanChatId.startsWith('-') && !cleanChatId.startsWith('-100')) {
      // Retry with -100 prefix for supergroups
      const supergroupId = `-100${cleanChatId.slice(1)}`;
      const retryRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: supergroupId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      const retryData = await retryRes.json();
      if (retryData.ok) {
        data = retryData;
        cleanChatId = supergroupId;
      }
    }

    if (data.ok) {
      return { 
        success: true, 
        message: `ส่งแจ้งเตือน Telegram สำเร็จเรียบร้อย (กลุ่ม: ${cleanChatId})` 
      };
    } else {
      return { 
        success: false, 
        error: `Telegram Error: ${data.description || 'รหัส Token หรือ Chat ID ไม่ถูกต้อง'}` 
      };
    }
  } catch (err: any) {
    return { success: false, error: `ส่ง Telegram ไม่สำเร็จ: ${err.message || 'เน็ตเวิร์กขัดข้อง'}` };
  }
}

/**
 * Send message via LINE Messaging API (Push Message)
 */
export async function sendLineNotification(
  channelAccessToken: string,
  targetId: string,
  text: string
): Promise<SendResult> {
  const cleanToken = channelAccessToken.trim();
  const cleanTarget = targetId.trim();

  if (!cleanToken || !cleanTarget) {
    return { success: false, error: 'กรุณาระบุ LINE Channel Access Token และ User/Group ID ให้ครบถ้วน' };
  }

  // Try backend proxy first
  try {
    const res = await fetch('/api/notifications/line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelAccessToken: cleanToken,
        targetId: cleanTarget,
        text,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || 'ส่งแจ้งเตือน LINE สำเร็จ' };
    } else {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.error || `LINE API Error (HTTP ${res.status})` };
    }
  } catch {
    // If backend proxy is not accessible, notify user that LINE requires proxy due to LINE API CORS
    return { 
      success: false, 
      error: 'การส่งแจ้งเตือน LINE ต้องผ่านเซิร์ฟเวอร์ proxy (เนื่องจาก LINE Messaging API ป้องกัน CORS จากบราวเซอร์โดยตรง) หากใช้งานบน Vercel แนะนำใช้ Telegram หรือตั้งค่า Webhook proxy ครับ' 
    };
  }
}

/**
 * Broadcast notification to all enabled channels
 */
export async function broadcastClinicNotification(
  settings: NotificationSettings | undefined,
  title: string,
  content: string,
  urgency: 'normal' | 'urgent' | 'warning' = 'normal'
): Promise<BroadcastResult> {
  if (!settings) return {};

  const icon = urgency === 'urgent' ? '🚨 [ด่วนที่สุด]' : urgency === 'warning' ? '⚠️ [ข้อควรระวัง]' : '🔔 [แจ้งเตือนคลินิกจิตเวช]';
  const timestamp = new Date().toLocaleString('th-TH', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  });

  // HTML format for Telegram
  const telegramMessage = `<b>${icon} ${escapeHtml(title)}</b>\n<i>เวลา: ${timestamp}</i>\n\n${escapeHtml(content)}\n\n<small>📍 ระบบจิตเวชชุมชน PsyCare Multi-Disciplinary</small>`;

  // Plain text format for LINE
  const lineMessage = `${icon} ${title}\nเวลา: ${timestamp}\n\n${content}\n\n📍 ระบบจิตเวชชุมชน PsyCare`;

  const results: BroadcastResult = {};

  if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
    results.telegram = await sendTelegramNotification(
      settings.telegramBotToken,
      settings.telegramChatId,
      telegramMessage
    );
  }

  if (settings.lineEnabled && settings.lineChannelAccessToken && settings.lineTargetId) {
    results.line = await sendLineNotification(
      settings.lineChannelAccessToken,
      settings.lineTargetId,
      lineMessage
    );
  }

  return results;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ----------------------------------------------------
// Specific Notification Triggers for Clinic Events
// ----------------------------------------------------

/**
 * 1. Alert when a new patient is registered
 */
export async function notifyNewPatientCreated(
  settings: NotificationSettings | undefined,
  patient: Patient,
  recordedBy: string = 'เจ้าหน้าที่'
) {
  if (!settings?.notifyOnNewPatient) return;

  const title = `ลงทะเบียนผู้ป่วยใหม่: ${patient.name}`;
  const groupLabel = patient.trackingGroup === 'home_visit' ? 'กลุ่มเยี่ยมบ้าน' : patient.trackingGroup === 'telemed' ? 'กลุ่ม Telemed' : 'กลุ่มคลินิก/DRPs';
  const content = `• HN: ${patient.hn}\n• ชื่อ-สกุล: ${patient.name} (อายุ ${patient.age} ปี)\n• วินิจฉัย: ${patient.diagnosis}\n• กลุ่มติดตาม: ${groupLabel}\n• สถานะ/ป้ายกำกับ: ${patient.statusTag || '-'}\n• ระดับความเสี่ยง: ${patient.riskLevel.toUpperCase()}\n• บันทึกโดย: ${recordedBy}`;

  return broadcastClinicNotification(settings, title, content, patient.riskLevel === 'high' ? 'urgent' : 'normal');
}

/**
 * 2. Alert when a handover note is posted (e.g. forward drug problems to pharmacist)
 */
export async function notifyHandoverPosted(
  settings: NotificationSettings | undefined,
  handover: HandoverMessage
) {
  if (!settings?.notifyOnHandover) return;

  const isToPharmacist = handover.targetRole === 'pharmacist' || handover.targetRole === 'all';
  const senderThai = handover.senderRole === 'nurse' ? 'พยาบาลวิชาชีพ' : handover.senderRole === 'psychologist' ? 'นักจิตวิทยา' : 'เภสัชกร';
  const priorityThai = handover.priority === 'stat' ? 'วิกฤต (STAT)' : handover.priority === 'urgent' ? 'ด่วนมาก (Urgent)' : 'ปกติ (Routine)';

  let title = '';
  if (isToPharmacist) {
    title = `🚨 [ส่งต่อถึงเภสัชกร] แจ้งเตือนปัญหาการใช้ยาของผู้ป่วยจากทีมสหวิชาชีพ`;
  } else {
    title = `ส่งเวรสหวิชาชีพ (${senderThai} -> ${handover.targetRole.toUpperCase()})`;
  }

  const urgency = handover.priority === 'stat' || handover.priority === 'urgent' ? 'urgent' : 'normal';
  
  const content = [
    `👤 ผู้ป่วย: ${handover.patientName || 'ไม่ระบุชื่อ'} (HN: ${handover.hn})`,
    `👨‍⚕️ ผู้ส่งต่อ: ${senderThai}`,
    `🎯 ส่งถึง: ${handover.targetRole === 'pharmacist' ? '💊 เภสัชกรคลินิก (Pharmacist) - รับทราบปัญหาการใช้ยา' : handover.targetRole === 'all' ? '👥 ทีมสหวิชาชีพทั้งหมด' : handover.targetRole}`,
    `⚡ ระดับความเร่งด่วน: ${priorityThai}`,
    `📋 หัวข้อส่งต่อ: ${handover.subject}`,
    `📝 รายละเอียดปัญหาการใช้ยา:`,
    `${handover.content}`,
    `👥 แจ้งเตือนผ่านกลุ่ม Telegram: ${settings?.telegramChatId || '-5506194529'}`,
    `🤖 Bot ID: 8489161754`,
    `⏰ เวลาส่งต่อ: ${handover.timestamp || new Date().toLocaleString('th-TH')}`
  ].join('\n');

  return broadcastClinicNotification(settings, title, content, isToPharmacist ? 'urgent' : urgency);
}


/**
 * 3. Alert when a DTP or Crisis ADR is recorded
 */
export async function notifyDtpRecorded(
  settings: NotificationSettings | undefined,
  dtp: DtpRecord,
  patientName: string
) {
  if (!settings?.notifyOnDtpCrisis) return;

  const isPending = dtp.status === 'pending';
  const title = `ปัญหาการใช้ยา (DTP): ${patientName}`;
  const content = `• HN: ${dtp.hn} (${patientName})\n• หมวดปัญหา: ${dtp.domain}\n• ยาที่เกี่ยวข้อง: ${dtp.causeDrug || '-'}\n• รายละเอียดปัญหา: ${dtp.description}\n• การจัดการ/Intervention: ${dtp.intervention}\n• สถานะ: ${dtp.status.toUpperCase()}\n• บันทึกโดย: ${dtp.recordedBy}`;

  return broadcastClinicNotification(settings, title, content, isPending ? 'urgent' : 'warning');
}

/**
 * 4. Alert when a Home Visit is recorded
 */
export async function notifyHomeVisitRecorded(
  settings: NotificationSettings | undefined,
  visit: HomeVisitRecord,
  patientName: string
) {
  if (!settings?.notifyOnHomeVisit) return;

  const title = `บันทึกผลการเยี่ยมบ้าน: ${patientName}`;
  const content = `• HN: ${visit.hn} (${patientName})\n• วันที่เยี่ยม: ${visit.date}\n• ผู้ร่วมทีม: ${visit.teamMembers}\n• สภาพแวดล้อม: ${visit.environmentNotes || '-'}\n• ปัญหาที่พบ: ${visit.problemsFound || 'ไม่พบปัญหาผิดปกติ'}\n• แผนการดูแล: ${visit.actionPlan}\n• นัดติดตามครั้งถัดไป: ${visit.nextAppointmentDate || 'ไม่ได้ระบุ'}\n• บันทึกโดย: ${visit.recordedBy}`;

  return broadcastClinicNotification(settings, title, content, 'normal');
}


/**
 * 5. Daily Due Followup Summary
 */
export async function notifyDailyDueSummary(
  settings: NotificationSettings | undefined,
  dueTodayPatients: Patient[],
  overduePatients: Patient[]
) {
  const todayStr = new Date().toLocaleDateString('th-TH', { 
    dateStyle: 'long' 
  });

  const total = dueTodayPatients.length;
  const overdueTotal = overduePatients.length;

  const title = `สรุปนัดหมายติดตามผู้ป่วยประจำวัน (${todayStr})`;
  
  let content = `📊 ยอดผู้ป่วยที่ต้องติดตามวันนี้: ${total} ราย\n⚠️ มียอดค้างติดตามก่อนหน้า: ${overdueTotal} ราย\n\n`;

  if (dueTodayPatients.length > 0) {
    content += `📋 รายชื่อนัดวันนี้:\n` + dueTodayPatients.slice(0, 8).map((p, idx) => {
      const type = p.trackingGroup === 'home_visit' ? '🏠 เยี่ยมบ้าน' : p.trackingGroup === 'telemed' ? '📞 Telemed' : '🏥 คลินิก';
      return `${idx + 1}. [${type}] ${p.name} (HN: ${p.hn}) - ${p.statusTag || p.diagnosis}`;
    }).join('\n');

    if (dueTodayPatients.length > 8) {
      content += `\n...และอีก ${dueTodayPatients.length - 8} ราย`;
    }
  } else {
    content += `✅ วันนี้ไม่มีรายการนัดหมายที่ต้องติดตาม`;
  }

  return broadcastClinicNotification(settings, title, content, total > 0 ? 'normal' : 'normal');
}
