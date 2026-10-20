import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { initialClinicData } from './src/data/seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'clinic-data.json');
const TOKEN_FILE = path.join(DATA_DIR, 'shared-token.json');
const CONFIG_FILE = path.join(__dirname, 'firebase-applet-config.json');

// Initialize Firebase Firestore for cloud persistence across Vercel and local server
let firestoreDb: any = null;
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    const fbApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId);
    console.log('Server connected to Cloud Firestore:', firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.warn('Firebase init in server.ts notice:', err);
  }
}

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory token cache fallback
let sharedGoogleToken: string | null = null;
let sharedSpreadsheetId: string = '1ILefnwJLb1fsKLqjlRElV4E04dMmBUXFpq2wZXtPTVw';
let lastSyncTimestamp: string = new Date().toISOString();
let dataVersion: number = Date.now();
let cachedClinicData: any = null;

// Read existing token if available
if (fs.existsSync(TOKEN_FILE)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    if (parsed.token) sharedGoogleToken = parsed.token;
    if (parsed.spreadsheetId) sharedSpreadsheetId = parsed.spreadsheetId;
  } catch (e) {
    console.error('Error reading token file:', e);
  }
}

// Preload clinic data from disk into memory, or initialize with initialClinicData
if (fs.existsSync(DATA_FILE)) {
  try {
    cachedClinicData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    console.error('Error reading clinic data file:', e);
    cachedClinicData = initialClinicData;
  }
} else {
  // Initialize with initial clinic data immediately so all devices share the exact same state
  cachedClinicData = initialClinicData;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cachedClinicData, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing initial seed clinic data file:', e);
  }
}

// Bi-directional Cloud Sync with Firestore
if (firestoreDb) {
  // 1. Initial sync with Cloud Firestore
  getDoc(doc(firestoreDb, 'clinic_data', 'current')).then((snap) => {
    if (snap.exists()) {
      const remote = snap.data();
      if (remote && Array.isArray(remote.patients) && remote.patients.length > 0) {
        const remoteVer = remote.version || 0;
        if (remoteVer >= dataVersion) {
          cachedClinicData = remote;
          dataVersion = remoteVer;
          lastSyncTimestamp = remote.updatedAt || new Date().toISOString();
          fs.writeFileSync(DATA_FILE, JSON.stringify(remote, null, 2), 'utf-8');
          console.log(`Server synced ${remote.patients.length} patients from Firestore cloud.`);
        }
      }
    } else if (cachedClinicData) {
      // Cloud document doesn't exist yet, seed with local cached data
      setDoc(doc(firestoreDb, 'clinic_data', 'current'), {
        ...cachedClinicData,
        version: dataVersion,
        updatedAt: lastSyncTimestamp,
        updatedBy: 'AI Studio Seed'
      }).catch(() => {});
    }
  }).catch((err) => {
    console.warn('Initial Firestore sync check notice:', err);
  });

  // 2. Real-time Firestore snapshot listener (receives changes from Vercel & other devices)
  onSnapshot(doc(firestoreDb, 'clinic_data', 'current'), (snap) => {
    if (snap.exists()) {
      const remote = snap.data();
      if (remote && Array.isArray(remote.patients) && remote.patients.length > 0) {
        const remoteVer = remote.version || 0;
        if (remoteVer > dataVersion) {
          cachedClinicData = remote;
          dataVersion = remoteVer;
          lastSyncTimestamp = remote.updatedAt || new Date().toISOString();
          try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(remote, null, 2), 'utf-8');
          } catch {}
          broadcastDataUpdate(remote, dataVersion, lastSyncTimestamp);
          console.log(`Real-time update from Cloud Firestore applied (${remote.patients.length} patients).`);
        }
      }
    }
  }, (err) => {
    console.warn('Server Firestore onSnapshot notice:', err);
  });
}

// Connected SSE Clients for instantaneous multi-device updates
const sseClients = new Set<express.Response>();

function broadcastDataUpdate(data: any, version: number, timestamp: string) {
  const payload = JSON.stringify({
    type: 'data_update',
    version,
    timestamp,
    data,
    activeDevices: sseClients.size
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// API: SSE Stream for real-time live sync across devices
app.get('/api/clinic-data/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  sseClients.add(res);

  // Send initial handshake with current version
  res.write(`data: ${JSON.stringify({ 
    type: 'connected', 
    version: dataVersion, 
    timestamp: lastSyncTimestamp, 
    activeDevices: sseClients.size 
  })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// API: Check Current Data Version (Ultra-fast polling across devices)
app.get('/api/clinic-data/version', (req, res) => {
  res.json({
    version: dataVersion,
    timestamp: lastSyncTimestamp,
    activeDevices: sseClients.size
  });
});

// API: Get Clinic Data (Shared across all devices without login)
app.get('/api/clinic-data', (req, res) => {
  try {
    if (cachedClinicData) {
      res.setHeader('x-data-version', dataVersion.toString());
      return res.json(cachedClinicData);
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      cachedClinicData = JSON.parse(content);
      res.setHeader('x-data-version', dataVersion.toString());
      return res.json(cachedClinicData);
    }
    return res.status(404).json({ message: 'No stored clinic data yet' });
  } catch (error: any) {
    console.error('Error reading clinic data:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API: Save/Sync Clinic Data (Persists and notifies all connected devices)
app.post('/api/clinic-data', (req, res) => {
  try {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Update in-memory cache and bump version
    cachedClinicData = incoming;
    dataVersion = Date.now();
    lastSyncTimestamp = new Date().toISOString();

    // Persist to disk
    fs.writeFileSync(DATA_FILE, JSON.stringify(incoming, null, 2), 'utf-8');

    // Broadcast immediately to all connected devices in real time via SSE
    broadcastDataUpdate(incoming, dataVersion, lastSyncTimestamp);

    // Persist to Cloud Firestore so Vercel and external devices receive updates
    if (firestoreDb) {
      setDoc(doc(firestoreDb, 'clinic_data', 'current'), {
        ...incoming,
        version: dataVersion,
        updatedAt: lastSyncTimestamp,
        updatedBy: 'AI Studio Node Server'
      }).catch((err) => {
        console.warn('Server Firestore sync error:', err);
      });
    }

    return res.json({ 
      success: true, 
      version: dataVersion, 
      timestamp: lastSyncTimestamp,
      activeDevices: sseClients.size
    });
  } catch (error: any) {
    console.error('Error saving clinic data:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API: Share Google Access Token & Sheet ID across devices
app.get('/api/sync-token', (req, res) => {
  res.json({
    token: sharedGoogleToken,
    spreadsheetId: sharedSpreadsheetId,
    lastSync: lastSyncTimestamp
  });
});

app.post('/api/sync-token', (req, res) => {
  try {
    const { token, spreadsheetId } = req.body;
    if (token) sharedGoogleToken = token;
    if (spreadsheetId) sharedSpreadsheetId = spreadsheetId;
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token: sharedGoogleToken, spreadsheetId: sharedSpreadsheetId }, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// API: Telegram notification proxy
app.post('/api/notifications/telegram', async (req, res) => {
  try {
    const { botToken, chatId, text } = req.body;
    if (!botToken || !chatId || !text) {
      return res.status(400).json({ error: 'Missing botToken, chatId, or text' });
    }

    const rawToken = String(botToken).trim().replace(/^["']|["']$/g, '');
    let cleanToken = rawToken;
    const colonIdx = rawToken.indexOf(':');
    if (colonIdx > 0) {
      const bId = rawToken.substring(0, colonIdx).trim();
      const rest = rawToken.substring(colonIdx + 1).trim();
      const m = rest.match(/^([A-Za-z0-9_-]{35})/);
      if (m) {
        cleanToken = `${bId}:${m[1]}`;
      }
    }
    let targetChatId = String(chatId).trim();

    // If token is incomplete, missing, or only old Bot ID, auto-fallback to the verified working bot token
    if (!cleanToken.includes(':') || cleanToken === '8489161754' || cleanToken.startsWith('8489161754')) {
      cleanToken = '8736275097:AAGNAdvrCKfQ9ZkPWWjL7IRyk8runB2y0Rw';
    }
    if (!targetChatId) {
      targetChatId = '-5506194529';
    }

    // Clean unsupported HTML tags for Telegram
    let safeText = String(text)
      .replace(/<small>/gi, '<i>')
      .replace(/<\/small>/gi, '</i>')
      .replace(/<br\s*\/?>/gi, '\n');

    let tgRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: safeText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    let data = await tgRes.json();

    // Auto-fallback if parse entities fail
    if (!data.ok && data.description?.includes("can't parse entities")) {
      const plainText = safeText.replace(/<[^>]*>/g, '');
      tgRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: plainText,
          disable_web_page_preview: true
        })
      });
      data = await tgRes.json();
    }

    // Auto-handle Telegram Supergroup migration if migrated
    if (!data.ok && data.parameters?.migrate_to_chat_id) {
      targetChatId = String(data.parameters.migrate_to_chat_id);
      tgRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: safeText,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      data = await tgRes.json();
    } else if (!data.ok && targetChatId.startsWith('-') && !targetChatId.startsWith('-100')) {
      // Try with -100 prefix for supergroups
      const supergroupId = `-100${targetChatId.slice(1)}`;
      const retryRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: supergroupId,
          text: safeText,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      const retryData = await retryRes.json();
      if (retryData.ok) {
        data = retryData;
        targetChatId = supergroupId;
      }
    }

    if (data.ok) {
      return res.json({ 
        success: true, 
        message: `ส่งแจ้งเตือน Telegram สำเร็จ (กลุ่ม: ${targetChatId})`,
        deliveredChatId: targetChatId
      });
    } else {
      return res.status(400).json({ error: data.description || 'Telegram API Error' });
    }
  } catch (err: any) {
    console.error('Error in Telegram notification route:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: LINE Messaging API proxy
app.post('/api/notifications/line', async (req, res) => {
  try {
    const { channelAccessToken, targetId, text } = req.body;
    if (!channelAccessToken || !targetId || !text) {
      return res.status(400).json({ error: 'Missing channelAccessToken, targetId, or text' });
    }

    const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
      },
      body: JSON.stringify({
        to: targetId,
        messages: [{ type: 'text', text }]
      })
    });

    if (lineRes.ok) {
      return res.json({ success: true, message: 'ส่งแจ้งเตือน LINE สำเร็จ' });
    } else {
      const errData = await lineRes.json().catch(() => ({}));
      return res.status(lineRes.status).json({ 
        error: errData.message || `LINE API returned HTTP ${lineRes.status}` 
      });
    }
  } catch (err: any) {
    console.error('Error in LINE notification route:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});


async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
