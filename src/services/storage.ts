import { AppClinicData } from '../types.ts';
import { initialClinicData } from '../data/seedData.ts';
import { DEFAULT_SPREADSHEET_ID } from './googleSheets.ts';

const STORAGE_KEY_DATA = 'psycare_clinic_data_v2';
const STORAGE_KEY_SHEET_ID = 'psycare_spreadsheet_id_v2';
const STORAGE_KEY_LAST_SYNC = 'psycare_last_sync_timestamp';

export function getStoredSpreadsheetId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_SHEET_ID);
    return id && id.trim() ? id.trim() : DEFAULT_SPREADSHEET_ID;
  } catch {
    return DEFAULT_SPREADSHEET_ID;
  }
}

export function saveStoredSpreadsheetId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY_SHEET_ID, id.trim());
  } catch (e) {
    console.error('Failed to save spreadsheet id:', e);
  }
}

export function getLastSyncTime(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_SYNC);
  } catch {
    return null;
  }
}

export function setLastSyncTime(timestamp: string) {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, timestamp);
  } catch (e) {
    console.error('Failed to save last sync time:', e);
  }
}

export function loadLocalClinicData(): AppClinicData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.patients)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local storage clinic data:', e);
  }
  return initialClinicData;
}

export function saveLocalClinicData(data: AppClinicData) {
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local clinic data:', e);
  }
}
