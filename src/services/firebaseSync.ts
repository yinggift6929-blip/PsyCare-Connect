import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { auth } from './auth.ts';
import { AppClinicData } from '../types.ts';
import { initialClinicData } from '../data/seedData.ts';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL from Skill: pass firestoreDatabaseId when present
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// ----------------------------------------------------
// Error Handling conforming to FirestoreErrorInfo
// ----------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// ----------------------------------------------------
// Test Connection on Initial Boot
// ----------------------------------------------------
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'clinic_data', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline cache mode.');
    }
    return false;
  }
}

// ----------------------------------------------------
// Real-time Multi-Device Synchronization across
// Vercel, GitHub deployments, PCs, Tablets, and Phones
// ----------------------------------------------------
const CLINIC_DOC_PATH = 'clinic_data/current';

/**
 * Subscribes to real-time clinic data changes from Firestore
 * Instantly broadcasts to any device when data changes
 */
export function subscribeToClinicData(
  onDataUpdate: (data: AppClinicData, version: number) => void
): () => void {
  try {
    const clinicDocRef = doc(db, 'clinic_data', 'current');
    
    const unsubscribe = onSnapshot(
      clinicDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const raw = docSnap.data();
          if (raw && Array.isArray(raw.patients) && raw.patients.length > 0) {
            const version = raw.version || Date.now();
            const clinicPayload: AppClinicData = {
              patients: raw.patients || [],
              medications: raw.medications || [],
              dtps: raw.dtps || [],
              soapNotes: raw.soapNotes || [],
              safetyLogs: raw.safetyLogs || [],
              nurseRecords: raw.nurseRecords || [],
              psychRecords: raw.psychRecords || [],
              handovers: raw.handovers || [],
              mars5Records: raw.mars5Records || [],
              diepssRecords: raw.diepssRecords || [],
              homeVisits: raw.homeVisits || [],
              telemedRecords: raw.telemedRecords || [],
              metabolicRecords: raw.metabolicRecords || []
            };
            onDataUpdate(clinicPayload, version);
          }
        } else {
          // Document does not exist yet in cloud Firestore -> seed initial clinic data
          seedInitialFirestoreData();
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, CLINIC_DOC_PATH);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, CLINIC_DOC_PATH);
    return () => {};
  }
}

/**
 * Sanitizes object to remove all undefined properties, which Firestore rejects
 */
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Seed initial clinic data to Firestore cloud if not already present
 */
async function seedInitialFirestoreData() {
  try {
    const clinicDocRef = doc(db, 'clinic_data', 'current');
    const version = Date.now();
    const payload = sanitizeForFirestore({
      ...initialClinicData,
      version,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Seed'
    });
    await setDoc(clinicDocRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CLINIC_DOC_PATH);
  }
}

/**
 * Persists clinic data to Firestore cloud
 * Enables real-time sync across GitHub, Vercel, and all devices
 */
export async function saveFirestoreClinicData(
  data: AppClinicData,
  updatedBy: string = 'Care Team'
): Promise<{ success: boolean; version?: number }> {
  try {
    const clinicDocRef = doc(db, 'clinic_data', 'current');
    const version = Date.now();
    const rawPayload = {
      ...data,
      version,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    const cleanPayload = sanitizeForFirestore(rawPayload);
    await setDoc(clinicDocRef, cleanPayload);
    return { success: true, version };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CLINIC_DOC_PATH);
    return { success: false };
  }
}

/**
 * One-time fetch of clinic data from Firestore
 */
export async function fetchFirestoreClinicData(): Promise<{ data: AppClinicData; version: number } | null> {
  try {
    const clinicDocRef = doc(db, 'clinic_data', 'current');
    const docSnap = await getDoc(clinicDocRef);
    if (docSnap.exists()) {
      const raw = docSnap.data();
      if (raw && Array.isArray(raw.patients)) {
        const version = raw.version || Date.now();
        return {
          version,
          data: {
            patients: raw.patients || [],
            medications: raw.medications || [],
            dtps: raw.dtps || [],
            soapNotes: raw.soapNotes || [],
            safetyLogs: raw.safetyLogs || [],
            nurseRecords: raw.nurseRecords || [],
            psychRecords: raw.psychRecords || [],
            handovers: raw.handovers || [],
            mars5Records: raw.mars5Records || [],
            diepssRecords: raw.diepssRecords || [],
            homeVisits: raw.homeVisits || [],
            telemedRecords: raw.telemedRecords || [],
            metabolicRecords: raw.metabolicRecords || []
          }
        };
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, CLINIC_DOC_PATH);
  }
  return null;
}
