import { NotificationSettings, Patient, HandoverMessage, DtpRecord, HomeVisitRecord } from '../types.ts';

export const VERIFIED_TELEGRAM_BOT_TOKEN = '8736275097:AAGNAdvrCKfQ9ZkPWWjL7IRyk8runB2y0Rw';
export const VERIFIED_TELEGRAM_GROUP_ID = '-5506194529';

export function sanitizeTelegramToken(raw: string): string {
  let token = (raw || '').trim().replace(/^["']|["']$/g, '');
  const colonIndex = token.indexOf(':');
  if (colonIndex > 0) {
    const botId = token.substring(0, colonIndex).trim();
    const rest = token.substring(colonIndex + 1).trim();
    // Telegram bot token hash is 35 chars
    const match = rest.match(/^([A-Za-z0-9_-]{35})/);
    if (match) {
      return `${botId}:${match[1]}`;
    }
  }
  // If incomplete, missing, or only old Bot ID, return verified working bot token
  if (!token.includes(':') || token === '8489161754' || token.startsWith('8489161754')) {
    return VERIFIED_TELEGRAM_BOT_TOKEN;
  }
  return token;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  telegramEnabled: true,
  telegramBotToken: '8736275097:AAGNAdvrCKfQ9ZkPWWjL7IRyk8runB2y0Rw',
  telegramChatId: '-5506194529',
  lineEnabled: false,
  lineChannelAccessToken: '',
  lineTargetId: '',
  notifyOnNewPatient: true,
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
      const parsed = JSON.parse(raw);
      // Auto-migrate if stored settings contain old bot ID or un-sanitized token
      if (
        !parsed.telegramBotToken ||
        parsed.telegramBotToken === '8489161754' ||
        !parsed.telegramBotToken.includes(':') ||
        parsed.telegramBotToken.includes('8736275097')
      ) {
        parsed.telegramBotToken = '8736275097:AAGNAdvrCKfQ9ZkPWWjL7IRyk8runB2y0Rw';
      } else {
        parsed.telegramBotToken = sanitizeTelegramToken(parsed.telegramBotToken);
      }
      if (!parsed.telegramChatId) {
        parsed.telegramChatId = '-5506194529';
      }
      parsed.telegramEnabled = true;
      parsed.notifyOnNewPatient = true;
      parsed.notifyOnHandover = true;
      parsed.notifyOnDtpCrisis = true;
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to read notification settings from localStorage', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveLocalNotificationSettings(settings: NotificationSettings): void {
  try {
    const cleanSettings = {
      ...settings,
      telegramBotToken: sanitizeTelegramToken(settings.telegramBotToken)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanSettings));
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
  const cleanToken = sanitizeTelegramToken(botToken);
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
  const tokenToUse = (cleanToken && cleanToken.includes(':'))
    ? cleanToken
    : VERIFIED_TELEGRAM_BOT_TOKEN;
  const safeText = text.replace(/<small>/gi, '<i>').replace(/<\/small>/gi, '</i>');

  // Direct fetch fallback (Telegram Bot API allows CORS)
  try {
    let url = `https://api.telegram.org/bot${tokenToUse}/sendMessage`;
    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: safeText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    let data = await res.json();

    // Auto-fallback if parse entities fail
    if (!data.ok && data.description?.includes("can't parse entities")) {
      const plainText = safeText.replace(/<[^>]*>/g, '');
      const plainRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: plainText,
          disable_web_page_preview: true,
        }),
      });
      data = await plainRes.json();
    }

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

  // HTML format for Telegram (strictly Telegram-supported HTML)
  const cleanContent = content.replace(/<small>/gi, '<i>').replace(/<\/small>/gi, '</i>');
  const telegramMessage = `<b>${icon} ${title.replace(/<[^>]*>/g, '')}</b>\n<i>เวลา: ${timestamp}</i>\n\n${cleanContent}\n\n<i>📍 ระบบจิตเวชชุมชน PsyCare Multi-Disciplinary</i>`;

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
  const title = `🚨 [ลงทะเบียนคนไข้ใหม่] แจ้งเตือนเข้าสู่ระบบจิตเวชชุมชน`;
  const groupLabel = patient.trackingGroup === 'home_visit' ? '🏠 กลุ่มเยี่ยมบ้าน (Home Visit)' : patient.trackingGroup === 'telemed' ? '📱 กลุ่ม Telemed' : '🏥 กลุ่มคลินิกจิตเวช/DRPs';
  const riskThai = patient.riskLevel === 'high' ? '🔴 ความเสี่ยงสูง (High Risk)' : patient.riskLevel === 'moderate' ? '🟡 ปานกลาง (Moderate)' : '🟢 ความเสี่ยงต่ำ (Low)';
  const appointType = patient.nextAppointmentType === 'home_visit' ? '🏠 เยี่ยมบ้าน' : patient.nextAppointmentType === 'telemed' ? '📱 Telemed' : '🏥 มาตรวจคลินิก';

  const content = [
    `👤 <b>ผู้ป่วย:</b> ${patient.name} (อายุ ${patient.age} ปี, เพศ ${patient.gender})`,
    `📋 <b>HN:</b> ${patient.hn}`,
    `🩺 <b>การวินิจฉัย:</b> ${patient.diagnosis}`,
    `📍 <b>กลุ่มติดตาม:</b> ${groupLabel}`,
    `🏷️ <b>สถานะเคส:</b> ${patient.statusTag || 'ผู้ป่วยจิตเวชทั่วไป'}`,
    `⚡ <b>ระดับความเสี่ยง:</b> ${riskThai}`,
    `🎯 <b>เป้าหมายการติดตาม:</b> ${patient.nextAppointmentObjective || 'ติดตามต่อเนื่องตามแผนการรักษา'}`,
    patient.nextAppointment ? `🗓️ <b>นัดหมายครั้งถัดไป:</b> ${patient.nextAppointment} (${appointType})` : `🗓️ <b>นัดหมาย:</b> ยังไม่ได้ระบุวันนัด`,
    `👨‍⚕️ <b>ผู้บันทึกเวชระเบียน:</b> ${recordedBy}`,
    `👥 <b>กลุ่ม Telegram:</b> Clinic จิตดี (${settings?.telegramChatId || '-5506194529'})`,
    `🤖 <b>ส่งผ่านบอท:</b> Psycare_demo_bot (@Psycare_demobot)`,
    `⏰ <b>เวลาบันทึก:</b> ${new Date().toLocaleString('th-TH')}`
  ].join('\n');

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
    `👥 แจ้งเตือนผ่านกลุ่ม Telegram: Clinic จิตดี (${settings?.telegramChatId || '-5506194529'})`,
    `🤖 ส่งผ่านบอท: Psycare_demo_bot (@Psycare_demobot)`,
    `⏰ เวลาส่งต่อ: ${handover.timestamp || new Date().toLocaleString('th-TH')}`
  ].join('\n');

  return broadcastClinicNotification(settings, title, content, isToPharmacist ? 'urgent' : urgency);
}


/**
 * 3. Alert when a DTP (Drug Therapy Problem) is recorded by multidisciplinary team
 */
export async function notifyDtpRecorded(
  settings: NotificationSettings | undefined,
  dtp: DtpRecord,
  patientName: string
) {
  const title = `🚨 [ส่งต่อถึงเภสัชกร] แจ้งเตือนปัญหาการใช้ยาของผู้ป่วย (DTP)`;
  const content = [
    `👤 ผู้ป่วย: ${patientName || 'ไม่ระบุชื่อ'} (HN: ${dtp.hn})`,
    `👨‍⚕️ ผู้บันทึกปัญหา: ${dtp.recordedBy}`,
    `💊 ส่งถึง: เภสัชกรคลินิก (Pharmacist) - เพื่อติดตามและแก้ไขปัญหาการใช้ยาต่อไป`,
    `⚡ ระดับความเร่งด่วน: 🚨 ด่วน (รอเภสัชกรติดตามประเมิน/Intervention)`,
    `📋 หมวดปัญหาการใช้ยา (DRPs): ${dtp.domain}`,
    `💊 ยาที่เกี่ยวข้อง: ${dtp.causeDrug || 'ไม่ระบุตัวยา'}`,
    `📝 รายละเอียดปัญหาการใช้ยา:`,
    `${dtp.description}`,
    `💡 การจัดการเบื้องต้น / สิ่งที่ขอคำปรึกษา:`,
    `${dtp.intervention}`,
    `👥 แจ้งเตือนผ่านกลุ่ม Telegram: Clinic จิตดี (${settings?.telegramChatId || '-5506194529'})`,
    `🤖 ส่งผ่านบอท: Psycare_demo_bot (@Psycare_demobot)`,
    `⏰ เวลาส่งต่อ: ${new Date().toLocaleString('th-TH')}`
  ].join('\n');

  return broadcastClinicNotification(settings, title, content, 'urgent');
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
