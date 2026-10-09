import { AppClinicData } from '../types.ts';

/**
 * Checks current server data version for ultra-fast light polling
 */
export async function checkServerDataVersion(): Promise<{ version: number; timestamp: string } | null> {
  try {
    const res = await fetch('/api/clinic-data/version', { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    // quiet network fallback
  }
  return null;
}

/**
 * Fetches shared clinic data from the full-stack server
 * Enables cross-device auto-sync without requiring email sign-in on every device!
 */
export async function fetchServerClinicData(): Promise<AppClinicData | null> {
  try {
    const res = await fetch('/api/clinic-data', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.patients)) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Server sync not reachable, falling back to local storage cache:', error);
  }
  return null;
}

/**
 * Saves clinic data to the server disk
 * Immediately persists to all devices accessing the web app URL
 */
export async function saveServerClinicData(data: AppClinicData): Promise<{ success: boolean; version?: number; timestamp?: string }> {
  try {
    const res = await fetch('/api/clinic-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const result = await res.json();
      return { success: true, version: result.version, timestamp: result.timestamp };
    }
    return { success: false };
  } catch (error) {
    console.error('Failed to post clinic data to server:', error);
    return { success: false };
  }
}

/**
 * Fetches shared Google Token from backend if a colleague or previous session has signed in
 */
export async function fetchSharedGoogleToken(): Promise<{ token: string | null; spreadsheetId: string | null; lastSync: string | null } | null> {
  try {
    const res = await fetch('/api/sync-token');
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('Failed to fetch shared token from server:', error);
  }
  return null;
}

/**
 * Saves shared Google Token to backend for all devices to use without prompting email login
 */
export async function saveSharedGoogleToken(token: string, spreadsheetId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/sync-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, spreadsheetId })
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to save shared token to server:', error);
    return false;
  }
}
