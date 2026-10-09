import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'clinic-data.json');
const TOKEN_FILE = path.join(DATA_DIR, 'shared-token.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory token cache fallback
let sharedGoogleToken: string | null = null;
let sharedSpreadsheetId: string = '1ILefnwJLb1fsKLqjlRElV4E04dMmBUXFpq2wZXtPTVw';
let lastSyncTimestamp: string = new Date().toISOString();

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

// API: Get Clinic Data (Shared across all devices without login)
app.get('/api/clinic-data', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return res.json(JSON.parse(content));
    }
    // Return 404 so frontend can use initial seed data on first run
    return res.status(404).json({ message: 'No stored clinic data yet' });
  } catch (error: any) {
    console.error('Error reading clinic data:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API: Save/Sync Clinic Data
app.post('/api/clinic-data', (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    lastSyncTimestamp = new Date().toISOString();
    return res.json({ success: true, timestamp: lastSyncTimestamp });
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
