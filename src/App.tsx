/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  Pill, 
  Stethoscope, 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Home,
  PhoneCall,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Users,
  Bell
} from 'lucide-react';

import { 
  RoleType, 
  Patient, 
  Medication, 
  DtpRecord, 
  SoapNote, 
  SafetyLog, 
  NurseRecord, 
  PsychRecord, 
  HandoverMessage,
  Mars5Assessment,
  DiepssAssessment,
  HomeVisitRecord,
  TelemedRecord,
  MetabolicRecord,
  AppClinicData 
} from './types.ts';

import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/auth.ts';

import { 
  fetchServerClinicData, 
  saveServerClinicData, 
  checkServerDataVersion,
  fetchSharedGoogleToken, 
  saveSharedGoogleToken 
} from './services/apiSync.ts';

import { 
  loadLocalClinicData, 
  saveLocalClinicData, 
  getStoredSpreadsheetId, 
  saveStoredSpreadsheetId, 
  getLastSyncTime, 
  setLastSyncTime 
} from './services/storage.ts';

import { 
  initializeSheetTabs, 
  loadClinicDataFromSheets, 
  syncAllDataToSheets 
} from './services/googleSheets.ts';

import { Header } from './components/Header.tsx';
import { PatientSidebar } from './components/PatientSidebar.tsx';
import { PatientBanner } from './components/PatientBanner.tsx';
import { PharmacistCareTab } from './components/PharmacistCareTab.tsx';
import { NurseCareTab } from './components/NurseCareTab.tsx';
import { PsychologistTab } from './components/PsychologistTab.tsx';
import { HandoverBoardTab } from './components/HandoverBoardTab.tsx';
import { HomeVisitTab } from './components/HomeVisitTab.tsx';
import { TelemedTab } from './components/TelemedTab.tsx';
import { AnalyticsTab } from './components/AnalyticsTab.tsx';
import { SheetSettingsModal } from './components/SheetSettingsModal.tsx';
import { ConfirmDialog } from './components/ConfirmDialog.tsx';

import { AddPatientModal } from './components/modals/AddPatientModal.tsx';
import { EditPatientModal } from './components/modals/EditPatientModal.tsx';
import { AddMedicationModal } from './components/modals/AddMedicationModal.tsx';
import { AddDtpModal } from './components/modals/AddDtpModal.tsx';
import { AddNurseLogModal } from './components/modals/AddNurseLogModal.tsx';
import { AddPsychLogModal } from './components/modals/AddPsychLogModal.tsx';
import { DailyDueFollowupModal } from './components/modals/DailyDueFollowupModal.tsx';
import { Mars5AssessmentModal } from './components/assessments/Mars5AssessmentModal.tsx';
import { DiepssAssessmentModal } from './components/assessments/DiepssAssessmentModal.tsx';
import { HomeVisitModal } from './components/assessments/HomeVisitModal.tsx';
import { TelemedModal } from './components/assessments/TelemedModal.tsx';
import { MetabolicMonitoringModal } from './components/assessments/MetabolicMonitoringModal.tsx';

export default function App() {
  // Authentication & Google Sheet State
  const [user, setUser] = useState<User | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(getStoredSpreadsheetId());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime());
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Clinic Core Data State
  const [clinicData, setClinicData] = useState<AppClinicData>(loadLocalClinicData());

  // UI Active State
  const [currentRole, setCurrentRole] = useState<RoleType>('pharmacist');
  const [activeTab, setActiveTab] = useState<'rx' | 'nurse' | 'psych' | 'homevisit' | 'telemed' | 'handover' | 'analytics'>('rx');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    const local = loadLocalClinicData();
    return local.patients[0]?.id || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  // Daily Due Alert Popup State (Requirement 5: Pops up on entering app)
  const [isDailyAlertOpen, setIsDailyAlertOpen] = useState(true);

  // Modals Open State
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isAddDtpOpen, setIsAddDtpOpen] = useState(false);
  const [isAddNurseOpen, setIsAddNurseOpen] = useState(false);
  const [isAddPsychOpen, setIsAddPsychOpen] = useState(false);
  const [isMars5Open, setIsMars5Open] = useState(false);
  const [isDiepssOpen, setIsDiepssOpen] = useState(false);
  const [isHomeVisitOpen, setIsHomeVisitOpen] = useState(false);
  const [isTelemedOpen, setIsTelemedOpen] = useState(false);
  const [isMetabolicOpen, setIsMetabolicOpen] = useState(false);
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState(false);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Real-time Central Sync Version Refs
  const lastKnownVersionRef = useRef<number>(0);
  const isSyncingCentralRef = useRef<boolean>(false);

  // Current Active Patient
  const activePatient = clinicData.patients.find(p => p.id === selectedPatientId) || clinicData.patients[0];

  // Helper to persist data locally, to central backend, and to Google Sheets
  const updateDataAndSync = useCallback(async (updater: (prev: AppClinicData) => AppClinicData) => {
    setClinicData((prev) => {
      const nextData = updater(prev);
      
      // 1. Persist locally to browser storage
      saveLocalClinicData(nextData);

      // 2. Persist to Central Backend Database immediately (auto-sync across all devices without email login)
      saveServerClinicData(nextData).then((res) => {
        if (res.success && res.version) {
          lastKnownVersionRef.current = res.version;
          setSyncStatusMessage('✓ บันทึกข้อมูลและซิงค์ตรงกันทุกอุปกรณ์เรียบร้อยแล้ว');
          setTimeout(() => setSyncStatusMessage(null), 3500);
        }
      }).catch(err => {
        console.warn('Central database auto-save notice:', err);
      });

      // 3. Async sync to Google Sheets if access token is available (either from active login or shared backend)
      getAccessToken().then(async (token) => {
        if (token && spreadsheetId) {
          try {
            setIsSyncing(true);
            await syncAllDataToSheets(token, spreadsheetId, nextData);
            const now = new Date().toLocaleTimeString('th-TH');
            setLastSync(now);
            setLastSyncTime(now);
            setSyncSuccess(true);
          } catch (e: any) {
            console.warn('Auto sync to Google Sheets background attempt:', e);
          } finally {
            setIsSyncing(false);
          }
        }
      });

      return nextData;
    });
  }, [spreadsheetId]);

  // Initial Data Load on Mount and Real-time Cross-Device Polling
  useEffect(() => {
    let isMounted = true;

    // Pull latest data from central server if updated on another device
    const checkAndPullUpdates = async () => {
      if (isSyncingCentralRef.current) return;
      try {
        const ver = await checkServerDataVersion();
        if (ver && ver.version && ver.version > lastKnownVersionRef.current) {
          isSyncingCentralRef.current = true;
          const remote = await fetchServerClinicData();
          if (isMounted && remote && Array.isArray(remote.patients) && remote.patients.length > 0) {
            lastKnownVersionRef.current = ver.version;
            setClinicData(remote);
            saveLocalClinicData(remote);
          }
          isSyncingCentralRef.current = false;
        }
      } catch (e) {
        isSyncingCentralRef.current = false;
      }
    };

    // Initial load from server (No login needed!)
    fetchServerClinicData().then((serverData) => {
      if (isMounted && serverData && serverData.patients && serverData.patients.length > 0) {
        setClinicData(serverData);
        saveLocalClinicData(serverData);
        setSelectedPatientId((prev) => prev || serverData.patients[0]?.id || '');
      } else {
        // If server has no data yet, push local clinic data immediately so all devices have shared data
        const initial = loadLocalClinicData();
        saveServerClinicData(initial).then(res => {
          if (res.version) lastKnownVersionRef.current = res.version;
        }).catch((e) => {
          console.warn('Initial server seed warning:', e);
        });
      }
    });

    // Check version right away
    checkServerDataVersion().then(v => {
      if (v?.version) lastKnownVersionRef.current = v.version;
    });

    // Check if a shared Google token / spreadsheet ID exists
    fetchSharedGoogleToken().then((shared) => {
      if (isMounted && shared?.spreadsheetId) {
        setSpreadsheetId(shared.spreadsheetId);
      }
    });

    // Event listeners: Instantly pull updates when user refocuses browser window or switches tabs
    const handleFocus = () => { checkAndPullUpdates(); };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndPullUpdates();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Fast polling every 2.5 seconds to guarantee all devices see the exact same data in real time
    const interval = setInterval(checkAndPullUpdates, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Auth Initialization on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser) => {
        setUser(authenticatedUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Login
  const handleLogin = async () => {
    try {
      setIsSyncing(true);
      setSyncStatusMessage('กำลังเข้าสู่ระบบ Google...');
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        // Save shared token to server for other devices on the clinic team
        saveSharedGoogleToken(result.accessToken, spreadsheetId).catch(() => {});
        setSyncStatusMessage('กำลังเชื่อมต่อ Google Sheet...');

        try {
          await initializeSheetTabs(result.accessToken, spreadsheetId);
          const remoteData = await loadClinicDataFromSheets(result.accessToken, spreadsheetId);
          if (remoteData && remoteData.patients.length > 0) {
            setClinicData(remoteData);
            saveLocalClinicData(remoteData);
            saveServerClinicData(remoteData);
            if (remoteData.patients[0]) {
              setSelectedPatientId(remoteData.patients[0].id);
            }
          } else {
            // Push current local data to fresh spreadsheet
            await syncAllDataToSheets(result.accessToken, spreadsheetId, clinicData);
          }
          const now = new Date().toLocaleTimeString('th-TH');
          setLastSync(now);
          setLastSyncTime(now);
          setSyncSuccess(true);
          setSyncStatusMessage('เชื่อมต่อ Google Sheet สำเร็จ');
          setTimeout(() => setSyncStatusMessage(null), 4000);
        } catch (sheetErr: any) {
          console.warn('Initial sheet check warning:', sheetErr);
          setSyncStatusMessage('เชื่อมต่อบัญชีสำเร็จ แต่ไม่สามารถเข้าถึง Sheet ID นี้ กรุณาตรวจสอบสิทธิ์การแชร์ใน Sheet Settings');
        }
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      alert(`การเข้าสู่ระบบไม่สำเร็จ: ${err.message || 'โปรดลองใหม่อีกครั้ง'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setSyncSuccess(null);
  };

  // Manual Sync Now
  const handleSyncNow = async () => {
    const token = await getAccessToken();
    if (!token) {
      handleLogin();
      return;
    }
    try {
      setIsSyncing(true);
      await initializeSheetTabs(token, spreadsheetId);
      await syncAllDataToSheets(token, spreadsheetId, clinicData);
      const now = new Date().toLocaleTimeString('th-TH');
      setLastSync(now);
      setLastSyncTime(now);
      setSyncSuccess(true);
    } catch (e: any) {
      console.error('Manual sync failed:', e);
      alert(`การซิงค์ข้อมูลลง Google Sheet ล้มเหลว: ${e.message}`);
      setSyncSuccess(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Force Push from Settings
  const handleForcePush = async () => {
    const token = await getAccessToken();
    if (!token) {
      alert('กรุณา Sign in with Google ก่อนส่งข้อมูล');
      return;
    }
    try {
      setIsSyncing(true);
      await syncAllDataToSheets(token, spreadsheetId, clinicData);
      const now = new Date().toLocaleTimeString('th-TH');
      setLastSync(now);
      setLastSyncTime(now);
      alert('ส่งข้อมูลทั้งหมดไปยัง Google Sheet สำเร็จเรียบร้อย');
    } catch (e: any) {
      alert(`เกิดข้อผิดพลาด: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Force Pull from Settings
  const handleForcePull = async () => {
    const token = await getAccessToken();
    if (!token) {
      alert('กรุณา Sign in with Google ก่อนดึงข้อมูล');
      return;
    }
    try {
      setIsSyncing(true);
      const remote = await loadClinicDataFromSheets(token, spreadsheetId);
      if (remote && remote.patients.length > 0) {
        setClinicData(remote);
        saveLocalClinicData(remote);
        if (remote.patients[0]) setSelectedPatientId(remote.patients[0].id);
        const now = new Date().toLocaleTimeString('th-TH');
        setLastSync(now);
        setLastSyncTime(now);
        alert(`ดึงข้อมูลจาก Google Sheet สำเร็จ (${remote.patients.length} รายการผู้ป่วย)`);
      } else {
        alert('ไม่พบข้อมูลใน Google Sheet หรือตารางยังว่างอยู่');
      }
    } catch (e: any) {
      alert(`ดึงข้อมูลไม่สำเร็จ: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initialize Headers from Settings
  const handleInitializeHeaders = async () => {
    const token = await getAccessToken();
    if (!token) {
      alert('กรุณา Sign in with Google ก่อน');
      return;
    }
    try {
      setIsSyncing(true);
      const tabs = await initializeSheetTabs(token, spreadsheetId);
      alert(`ตรวจสอบและสร้างหัวตารางสำเร็จ (${tabs.length} แท็บ)`);
    } catch (e: any) {
      alert(`เกิดข้อผิดพลาด: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateSpreadsheetId = (newId: string) => {
    setSpreadsheetId(newId);
    saveStoredSpreadsheetId(newId);
    alert('อัปเดต Google Sheet ID เรียบร้อย');
  };

  // Multidisciplinary Role selection handler
  const handleSelectRole = (role: RoleType) => {
    setCurrentRole(role);
    if (role === 'pharmacist') setActiveTab('rx');
    else if (role === 'nurse') setActiveTab('nurse');
    else if (role === 'psychologist') setActiveTab('psych');
  };

  // Action: Add New Patient
  const handleSaveNewPatient = (newP: Partial<Patient>) => {
    const patientObj: Patient = {
      id: `P_${Date.now()}`,
      hn: newP.hn || '',
      name: newP.name || '',
      gender: newP.gender || 'ชาย',
      age: newP.age || 30,
      diagnosis: newP.diagnosis || 'Schizophrenia',
      trackingGroup: newP.trackingGroup || 'clinic_dtp',
      statusTag: newP.statusTag || 'General Psych',
      riskLevel: newP.riskLevel || 'low',
      adherenceScore: newP.adherenceScore ?? 100,
      phone: newP.phone,
      address: newP.address,
      lastVisit: newP.lastVisit,
      nextAppointment: newP.nextAppointment,
      nextAppointmentType: newP.nextAppointmentType || (newP.trackingGroup === 'home_visit' ? 'home_visit' : newP.trackingGroup === 'telemed' ? 'telemed' : 'clinic'),
      nextAppointmentObjective: newP.nextAppointmentObjective,
      updatedAt: new Date().toLocaleString('th-TH')
    };

    updateDataAndSync((prev) => ({
      ...prev,
      patients: [patientObj, ...prev.patients]
    }));
    setSelectedPatientId(patientObj.id);
  };

  // Action: Edit Patient
  const handleSaveEditPatient = (updatedPatient: Patient) => {
    updateDataAndSync((prev) => ({
      ...prev,
      patients: prev.patients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
    }));
  };

  // Action: Delete Patient
  const handleDeletePatient = (patientToDelete: Patient) => {
    setConfirmDialog({
      isOpen: true,
      title: `ลบข้อมูลผู้ป่วย ${patientToDelete.name}?`,
      message: `คุณกำลังจะลบข้อมูลเวชระเบียนของผู้ป่วย HN: ${patientToDelete.hn} ออกจากระบบ การกระทำนี้จะมีผลลบรายการยา บันทึก SOAP และข้อมูลส่งต่อของผู้ป่วยรายนี้ออกจากระบบและ Google Sheet`,
      onConfirm: () => {
        updateDataAndSync((prev) => ({
          ...prev,
          patients: prev.patients.filter(p => p.id !== patientToDelete.id),
          medications: prev.medications.filter(m => m.patientId !== patientToDelete.id),
          dtps: prev.dtps.filter(d => d.patientId !== patientToDelete.id),
          soapNotes: prev.soapNotes.filter(s => s.patientId !== patientToDelete.id),
          nurseRecords: prev.nurseRecords.filter(n => n.patientId !== patientToDelete.id),
          psychRecords: prev.psychRecords.filter(ps => ps.patientId !== patientToDelete.id),
          handovers: prev.handovers.filter(h => h.patientId !== patientToDelete.id),
          mars5Records: (prev.mars5Records || []).filter(m => m.patientId !== patientToDelete.id),
          diepssRecords: (prev.diepssRecords || []).filter(d => d.patientId !== patientToDelete.id),
          homeVisits: (prev.homeVisits || []).filter(hv => hv.patientId !== patientToDelete.id),
          metabolicRecords: (prev.metabolicRecords || []).filter(met => met.patientId !== patientToDelete.id)
        }));
        setConfirmDialog(c => ({ ...c, isOpen: false }));
      }
    });
  };

  // Action: Add Medication
  const handleSaveMedication = (newMed: Partial<Medication>) => {
    if (!activePatient) return;
    const medObj: Medication = {
      id: `M_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      name: newMed.name || '',
      sig: newMed.sig || '',
      indication: newMed.indication || '',
      adherence: newMed.adherence ?? 100,
      category: newMed.category || 'General',
      startDate: newMed.startDate,
      notes: newMed.notes
    };

    updateDataAndSync((prev) => ({
      ...prev,
      medications: [medObj, ...prev.medications]
    }));
  };

  // Action: Delete Medication
  const handleDeleteMedication = (medToDelete: Medication) => {
    setConfirmDialog({
      isOpen: true,
      title: `ลบรายการยา ${medToDelete.name}?`,
      message: `ยืนยันการลบยา ${medToDelete.name} (${medToDelete.sig}) ของผู้ป่วย ${activePatient.name}?`,
      onConfirm: () => {
        updateDataAndSync((prev) => ({
          ...prev,
          medications: prev.medications.filter(m => m.id !== medToDelete.id)
        }));
        setConfirmDialog(c => ({ ...c, isOpen: false }));
      }
    });
  };

  // Action: Add DTP
  const handleSaveDtp = (newDtp: Partial<DtpRecord>) => {
    if (!activePatient) return;
    const dtpObj: DtpRecord = {
      id: `D_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: newDtp.date || new Date().toISOString().split('T')[0],
      domain: newDtp.domain || 'Non-adherence',
      description: newDtp.description || '',
      causeDrug: newDtp.causeDrug || '',
      intervention: newDtp.intervention || '',
      status: 'pending',
      recordedBy: newDtp.recordedBy || 'เภสัชกร'
    };

    updateDataAndSync((prev) => ({
      ...prev,
      dtps: [dtpObj, ...prev.dtps]
    }));
  };

  // Action: Toggle DTP Status
  const handleToggleDtpStatus = (dtpId: string) => {
    updateDataAndSync((prev) => ({
      ...prev,
      dtps: prev.dtps.map(d => d.id === dtpId ? { ...d, status: d.status === 'resolved' ? 'pending' : 'resolved' } : d)
    }));
  };

  // Action: Save SOAP Note
  const handleSaveSoapNote = (soap: { subjective: string; objective: string; assessment: string; plan: string }) => {
    if (!activePatient) return;
    const soapObj: SoapNote = {
      id: `S_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: new Date().toISOString().split('T')[0],
      subjective: soap.subjective,
      objective: soap.objective,
      assessment: soap.assessment,
      plan: soap.plan,
      recordedBy: currentRole === 'pharmacist' ? 'ภญ.สุพิชฌาย์ (เภสัชกรคลินิก)' : (currentRole === 'nurse' ? 'พว.ประภัสสร' : 'นจต.นภัสสร'),
      role: currentRole
    };

    updateDataAndSync((prev) => ({
      ...prev,
      soapNotes: [soapObj, ...prev.soapNotes]
    }));
  };

  // Action: Save Safety Log
  const handleSaveSafetyLog = (safety: Partial<SafetyLog>) => {
    if (!activePatient) return;
    const safetyObj: SafetyLog = {
      id: `SL_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: safety.date || new Date().toISOString().split('T')[0],
      clozapineWbc: safety.clozapineWbc,
      clozapineAnc: safety.clozapineAnc,
      lithiumLevel: safety.lithiumLevel,
      epsSymptoms: safety.epsSymptoms,
      notes: safety.notes
    };

    updateDataAndSync((prev) => ({
      ...prev,
      safetyLogs: [safetyObj, ...prev.safetyLogs]
    }));
  };

  // Action: Save Nurse Log
  const handleSaveNurseLog = (log: Partial<NurseRecord>) => {
    if (!activePatient) return;
    const nurseObj: NurseRecord = {
      id: `N_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: log.date || new Date().toISOString().split('T')[0],
      bp: log.bp || '120/80',
      pulse: log.pulse || '78',
      weight: log.weight || 60,
      bmi: log.bmi || 22,
      depotDrug: log.depotDrug,
      depotDate: log.depotDate,
      dotObserved: log.dotObserved ?? true,
      mseObservation: log.mseObservation || '',
      riskBehavior: log.riskBehavior || 'ปกติ',
      nurseName: log.nurseName || 'พยาบาลจิตเวช'
    };

    updateDataAndSync((prev) => ({
      ...prev,
      nurseRecords: [nurseObj, ...prev.nurseRecords]
    }));
  };

  // Action: Save Psych Log
  const handleSavePsychLog = (log: Partial<PsychRecord>) => {
    if (!activePatient) return;
    const psychObj: PsychRecord = {
      id: `PS_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: log.date || new Date().toISOString().split('T')[0],
      phq9Score: log.phq9Score || 0,
      suicideRisk8q: log.suicideRisk8q || '0',
      gad7Score: log.gad7Score,
      therapyType: log.therapyType || 'CBT',
      sessionNumber: log.sessionNumber || 'ครั้งที่ 1',
      counselingNotes: log.counselingNotes || '',
      psychologistName: log.psychologistName || 'นักจิตวิทยาคลินิก'
    };

    updateDataAndSync((prev) => ({
      ...prev,
      psychRecords: [psychObj, ...prev.psychRecords]
    }));
  };

  // Action: Save MARS-5 Assessment
  const handleSaveMars5 = (record: Partial<Mars5Assessment>, updatedAdherencePercent?: number) => {
    if (!activePatient) return;
    const marsObj: Mars5Assessment = {
      id: `MARS_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: record.date || new Date().toISOString().split('T')[0],
      q1: record.q1 || 5,
      q2: record.q2 || 5,
      q3: record.q3 || 5,
      q4: record.q4 || 5,
      q5: record.q5 || 5,
      totalScore: record.totalScore || 25,
      interpretation: record.interpretation || '',
      evaluatedBy: record.evaluatedBy || 'เภสัชกร',
      notes: record.notes
    };

    updateDataAndSync((prev) => {
      let nextPatients = prev.patients;
      if (updatedAdherencePercent !== undefined) {
        nextPatients = prev.patients.map(p => 
          p.id === activePatient.id ? { ...p, adherenceScore: updatedAdherencePercent, updatedAt: new Date().toLocaleString('th-TH') } : p
        );
      }
      return {
        ...prev,
        patients: nextPatients,
        mars5Records: [marsObj, ...(prev.mars5Records || [])]
      };
    });
  };

  // Action: Save DIEPSS Assessment
  const handleSaveDiepss = (record: Partial<DiepssAssessment>) => {
    if (!activePatient) return;
    const diepssObj: DiepssAssessment = {
      id: `DIEPSS_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: record.date || new Date().toISOString().split('T')[0],
      antipsychoticDrug: record.antipsychoticDrug || '',
      gait: record.gait || 0,
      kineticTremor: record.kineticTremor || 0,
      restTremor: record.restTremor || 0,
      sialorrhea: record.sialorrhea || 0,
      muscleRigidity: record.muscleRigidity || 0,
      akathisia: record.akathisia || 0,
      dystonia: record.dystonia || 0,
      dyskinesia: record.dyskinesia || 0,
      overallSeverity: record.overallSeverity || 0,
      totalScore: record.totalScore || 0,
      severityLabel: record.severityLabel || 'Normal',
      actionPlan: record.actionPlan || '',
      evaluatedBy: record.evaluatedBy || 'เภสัชกร'
    };

    updateDataAndSync((prev) => ({
      ...prev,
      diepssRecords: [diepssObj, ...(prev.diepssRecords || [])]
    }));
  };

  // Action: Save Home Visit Record
  const handleSaveHomeVisit = (
    record: Partial<HomeVisitRecord>,
    nextAppDate?: string,
    nextAppType?: 'home_visit' | 'telemed' | 'clinic',
    nextAppObj?: string
  ) => {
    if (!activePatient) return;
    const homeVisitObj: HomeVisitRecord = {
      id: `HV_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: record.date || new Date().toISOString().split('T')[0],
      teamMembers: record.teamMembers || '',
      environmentNotes: record.environmentNotes || '',
      selectedCommonProblems: record.selectedCommonProblems || [],
      customProblemNotes: record.customProblemNotes || '',
      problemsFound: record.problemsFound || '',
      followupDetails: record.followupDetails || '',
      actionPlan: record.actionPlan || '',
      nextAppointmentDate: nextAppDate || record.nextAppointmentDate,
      nextAppointmentType: nextAppType || record.nextAppointmentType || 'home_visit',
      images: record.images || [],
      recordedBy: record.recordedBy || 'ทีมสหวิชาชีพ'
    };

    updateDataAndSync((prev) => {
      let nextPatients = prev.patients;
      if (nextAppDate) {
        nextPatients = prev.patients.map(p => 
          p.id === activePatient.id ? {
            ...p,
            nextAppointment: nextAppDate,
            nextAppointmentType: nextAppType || 'home_visit',
            nextAppointmentObjective: nextAppObj || p.nextAppointmentObjective,
            updatedAt: new Date().toLocaleString('th-TH')
          } : p
        );
      }
      return {
        ...prev,
        patients: nextPatients,
        homeVisits: [homeVisitObj, ...(prev.homeVisits || [])]
      };
    });
  };

  // Action: Save Telemed Record
  const handleSaveTelemed = (
    record: Partial<TelemedRecord>,
    nextAppDate?: string,
    nextAppType?: 'home_visit' | 'telemed' | 'clinic',
    nextAppObj?: string
  ) => {
    if (!activePatient) return;
    const telemedObj: TelemedRecord = {
      id: `TM_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: record.date || new Date().toISOString().split('T')[0],
      channel: record.channel || 'โทรศัพท์ (Phone Call)',
      respondent: record.respondent || 'ผู้ป่วยโดยตรง',
      symptomsStatus: record.symptomsStatus || '',
      adherenceStatus: record.adherenceStatus || '',
      sideEffectsStatus: record.sideEffectsStatus || '',
      counselingProvided: record.counselingProvided || '',
      nextAppointmentDate: nextAppDate || record.nextAppointmentDate,
      nextAppointmentType: nextAppType || record.nextAppointmentType || 'telemed',
      recordedBy: record.recordedBy || 'เภสัชกร'
    };

    updateDataAndSync((prev) => {
      let nextPatients = prev.patients;
      if (nextAppDate) {
        nextPatients = prev.patients.map(p => 
          p.id === activePatient.id ? {
            ...p,
            nextAppointment: nextAppDate,
            nextAppointmentType: nextAppType || 'telemed',
            nextAppointmentObjective: nextAppObj || p.nextAppointmentObjective,
            updatedAt: new Date().toLocaleString('th-TH')
          } : p
        );
      }
      return {
        ...prev,
        patients: nextPatients,
        telemedRecords: [telemedObj, ...(prev.telemedRecords || [])]
      };
    });
  };

  // Action: Save Metabolic Record
  const handleSaveMetabolic = (record: Partial<MetabolicRecord>) => {
    if (!activePatient) return;
    const metabolicObj: MetabolicRecord = {
      id: `MET_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      date: record.date || new Date().toISOString().split('T')[0],
      suspectedDrug: record.suspectedDrug || '',
      waistCm: record.waistCm || 0,
      weightKg: record.weightKg || 0,
      heightCm: record.heightCm || 0,
      bmi: record.bmi || 0,
      sbp: record.sbp || 0,
      dbp: record.dbp || 0,
      fbs: record.fbs || 0,
      hba1c: record.hba1c,
      triglycerides: record.triglycerides || 0,
      hdl: record.hdl || 0,
      totalCholesterol: record.totalCholesterol,
      ldl: record.ldl,
      criteriaMetCount: record.criteriaMetCount || 0,
      isMetabolicSyndrome: record.isMetabolicSyndrome ?? false,
      criteriaList: record.criteriaList || [],
      pharmacistAdvice: record.pharmacistAdvice || '',
      recordedBy: record.recordedBy || 'เภสัชกร'
    };

    updateDataAndSync((prev) => ({
      ...prev,
      metabolicRecords: [metabolicObj, ...(prev.metabolicRecords || [])]
    }));
  };

  // Action: Submit Multidisciplinary Handover
  const handleSubmitHandover = (h: {
    targetRole: RoleType | 'all';
    priority: 'normal' | 'urgent' | 'stat';
    subject: string;
    content: string;
  }) => {
    if (!activePatient) return;
    const handoverObj: HandoverMessage = {
      id: `H_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      patientName: activePatient.name,
      timestamp: new Date().toLocaleString('th-TH'),
      senderRole: currentRole,
      targetRole: h.targetRole,
      priority: h.priority,
      subject: h.subject,
      content: h.content,
      status: 'open'
    };

    updateDataAndSync((prev) => ({
      ...prev,
      handovers: [handoverObj, ...prev.handovers]
    }));
  };

  // Action: Resolve Handover Note
  const handleResolveHandover = (handoverId: string, responseNote?: string) => {
    const resolverName = currentRole === 'pharmacist' ? 'เภสัชกร' : (currentRole === 'nurse' ? 'พยาบาล' : 'นักจิตวิทยา');

    updateDataAndSync((prev) => ({
      ...prev,
      handovers: prev.handovers.map(h => {
        if (h.id === handoverId) {
          return {
            ...h,
            status: 'resolved',
            resolvedBy: resolverName,
            resolvedAt: new Date().toLocaleString('th-TH'),
            responseNote: responseNote || 'รับทราบและประสานงานแล้ว'
          };
        }
        return h;
      })
    }));
  };

  // Manual Live Refresh from Server (cross-device live sync)
  const handleManualRefreshServer = async () => {
    setIsSyncing(true);
    try {
      const remote = await fetchServerClinicData();
      const ver = await checkServerDataVersion();
      if (ver?.version) lastKnownVersionRef.current = ver.version;
      if (remote && Array.isArray(remote.patients)) {
        setClinicData(remote);
        saveLocalClinicData(remote);
        setSyncStatusMessage('✓ ดึงข้อมูลล่าสุดจากทุกเครื่องตรงกันเรียบร้อยแล้ว');
        setTimeout(() => setSyncStatusMessage(null), 3000);
      }
    } catch (e: any) {
      alert(`ไม่สามารถดึงข้อมูลได้: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const openHandoversCount = activePatient 
    ? clinicData.handovers.filter(h => h.patientId === activePatient.id && h.status === 'open').length 
    : 0;

  // Format today's date and due count
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = clinicData.patients.filter(p => p.nextAppointment === todayStr).length;

  return (
    <div className="min-h-screen bg-[#faf6f7] text-slate-800 flex flex-col">
      {/* Top Main Navigation Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        user={user}
        spreadsheetId={spreadsheetId}
        isSyncing={isSyncing}
        syncSuccess={syncSuccess}
        lastSyncTime={lastSync}
        dueTodayCount={dueTodayCount}
        onOpenDailyAlert={() => setIsDailyAlertOpen(true)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSyncNow={handleSyncNow}
        onRefreshServerData={handleManualRefreshServer}
        onOpenSettings={() => setIsSheetSettingsOpen(true)}
      />

      {/* Sync Status Banner Notification if any */}
      {syncStatusMessage && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            {syncStatusMessage}
          </span>
          <button 
            onClick={() => setSyncStatusMessage(null)}
            className="text-white/80 hover:text-white text-xs underline"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Patient Directory Sidebar (4 Cols) */}
          <div className="lg:col-span-4">
            <PatientSidebar
              patients={clinicData.patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterTag={filterTag}
              onFilterTagChange={setFilterTag}
              handovers={clinicData.handovers}
            />
          </div>

          {/* Right Column: Active Patient Care Workspace (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {activePatient ? (
              <>
                {/* Patient Header Banner */}
                <PatientBanner
                  patient={activePatient}
                  dtps={clinicData.dtps}
                  handovers={clinicData.handovers}
                  onEditPatient={() => setIsEditPatientOpen(true)}
                  onDeletePatient={handleDeletePatient}
                />

                {/* Multidisciplinary Workplace Navigation Tabs */}
                <div className="bg-white rounded-2xl shadow-xs border border-rose-100 p-1.5 flex flex-wrap gap-1 text-xs font-semibold">
                  {/* Tab 1: Pharmacist Care & DTP */}
                  <button
                    onClick={() => setActiveTab('rx')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                      activeTab === 'rx'
                        ? 'bg-rose-400 text-white shadow-xs'
                        : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>บริบาลเภสัชกรรม (Rx Care & DTP)</span>
                  </button>

                  {/* Tab 2: Home Visit */}
                  <button
                    onClick={() => setActiveTab('homevisit')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                      activeTab === 'homevisit'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>เยี่ยมบ้านสหวิชาชีพ (Home Visit)</span>
                  </button>

                  {/* Tab 3: Telemed Care */}
                  <button
                    onClick={() => setActiveTab('telemed')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                      activeTab === 'telemed'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50/60'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>ติดตาม Telemed (Telepsychiatry)</span>
                  </button>

                  {/* Tab 4: Nursing Care */}
                  <button
                    onClick={() => setActiveTab('nurse')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                      activeTab === 'nurse'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/60'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>บันทึกการพยาบาล (Nurse Log)</span>
                  </button>

                  {/* Tab 5: Psychologist */}
                  <button
                    onClick={() => setActiveTab('psych')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                      activeTab === 'psych'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50/60'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>ประเมินจิตวิทยา & CBT</span>
                  </button>

                  {/* Tab 6: Handover Board */}
                  <button
                    onClick={() => setActiveTab('handover')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition relative ${
                      activeTab === 'handover'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50/60'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>ส่งต่อสหวิชาชีพ (Handover)</span>
                    {openHandoversCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        activeTab === 'handover' ? 'bg-white text-amber-700' : 'bg-rose-500 text-white'
                      }`}>
                        {openHandoversCount}
                      </span>
                    )}
                  </button>

                  {/* Tab 7: Analytics */}
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                      activeTab === 'analytics'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/60'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>แนวโน้ม & Lab Monitor</span>
                  </button>
                </div>

                {/* Tab Views */}
                {activeTab === 'rx' && (
                  <PharmacistCareTab
                    patient={activePatient}
                    medications={clinicData.medications}
                    dtps={clinicData.dtps}
                    soapNotes={clinicData.soapNotes}
                    safetyLogs={clinicData.safetyLogs}
                    mars5Records={clinicData.mars5Records || []}
                    diepssRecords={clinicData.diepssRecords || []}
                    metabolicRecords={clinicData.metabolicRecords || []}
                    onOpenAddMed={() => setIsAddMedOpen(true)}
                    onDeleteMed={handleDeleteMedication}
                    onOpenAddDtp={() => setIsAddDtpOpen(true)}
                    onToggleDtpStatus={handleToggleDtpStatus}
                    onOpenMars5={() => setIsMars5Open(true)}
                    onOpenDiepss={() => setIsDiepssOpen(true)}
                    onOpenMetabolic={() => setIsMetabolicOpen(true)}
                    onSaveSoapNote={handleSaveSoapNote}
                    onSaveSafetyLog={handleSaveSafetyLog}
                  />
                )}

                {activeTab === 'nurse' && (
                  <NurseCareTab
                    patient={activePatient}
                    nurseRecords={clinicData.nurseRecords}
                    onOpenAddNurseLog={() => setIsAddNurseOpen(true)}
                  />
                )}

                {activeTab === 'psych' && (
                  <PsychologistTab
                    patient={activePatient}
                    psychRecords={clinicData.psychRecords}
                    onOpenAddPsychLog={() => setIsAddPsychOpen(true)}
                  />
                )}

                {activeTab === 'homevisit' && (
                  <HomeVisitTab
                    patient={activePatient}
                    homeVisits={clinicData.homeVisits || []}
                    onOpenAddHomeVisit={() => setIsHomeVisitOpen(true)}
                  />
                )}

                {activeTab === 'telemed' && (
                  <TelemedTab
                    patient={activePatient}
                    telemedRecords={clinicData.telemedRecords || []}
                    onOpenAddTelemed={() => setIsTelemedOpen(true)}
                  />
                )}

                {activeTab === 'handover' && (
                  <HandoverBoardTab
                    patient={activePatient}
                    handovers={clinicData.handovers}
                    currentRole={currentRole}
                    onSubmitHandover={handleSubmitHandover}
                    onResolveHandover={handleResolveHandover}
                  />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsTab
                    patient={activePatient}
                    safetyLogs={clinicData.safetyLogs}
                    psychRecords={clinicData.psychRecords}
                    nurseRecords={clinicData.nurseRecords}
                    dtps={clinicData.dtps}
                    mars5Records={clinicData.mars5Records || []}
                    diepssRecords={clinicData.diepssRecords || []}
                    metabolicRecords={clinicData.metabolicRecords || []}
                  />
                )}
              </>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-pink-100 text-center text-slate-400 space-y-3">
                <Users className="w-12 h-12 mx-auto text-pink-200" />
                <h3 className="font-bold text-slate-700 text-base">ไม่พบผู้ป่วยในระบบ</h3>
                <p className="text-xs">กดปุ่ม "เพิ่มผู้ป่วย" ทางด้านซ้ายเพื่อเริ่มบันทึกข้อมูลรายแรก</p>
                <button
                  onClick={() => setIsAddPatientOpen(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
                >
                  + เพิ่มผู้ป่วยใหม่
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Clinical Input Modals */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onSave={handleSaveNewPatient}
      />

      {activePatient && (
        <>
          <EditPatientModal
            isOpen={isEditPatientOpen}
            onClose={() => setIsEditPatientOpen(false)}
            patient={activePatient}
            onSave={handleSaveEditPatient}
          />

          <AddMedicationModal
            isOpen={isAddMedOpen}
            onClose={() => setIsAddMedOpen(false)}
            patient={activePatient}
            onSave={handleSaveMedication}
          />

          <AddDtpModal
            isOpen={isAddDtpOpen}
            onClose={() => setIsAddDtpOpen(false)}
            patient={activePatient}
            onSave={handleSaveDtp}
          />

          <AddNurseLogModal
            isOpen={isAddNurseOpen}
            onClose={() => setIsAddNurseOpen(false)}
            patient={activePatient}
            onSave={handleSaveNurseLog}
          />

          <AddPsychLogModal
            isOpen={isAddPsychOpen}
            onClose={() => setIsAddPsychOpen(false)}
            patient={activePatient}
            onSave={handleSavePsychLog}
          />

          <Mars5AssessmentModal
            isOpen={isMars5Open}
            onClose={() => setIsMars5Open(false)}
            patient={activePatient}
            onSave={handleSaveMars5}
          />

          <DiepssAssessmentModal
            isOpen={isDiepssOpen}
            onClose={() => setIsDiepssOpen(false)}
            patient={activePatient}
            medications={clinicData.medications}
            onSave={handleSaveDiepss}
          />

          <HomeVisitModal
            isOpen={isHomeVisitOpen}
            onClose={() => setIsHomeVisitOpen(false)}
            patient={activePatient}
            onSave={handleSaveHomeVisit}
          />

          <TelemedModal
            isOpen={isTelemedOpen}
            onClose={() => setIsTelemedOpen(false)}
            patient={activePatient}
            onSave={handleSaveTelemed}
          />

          <MetabolicMonitoringModal
            isOpen={isMetabolicOpen}
            onClose={() => setIsMetabolicOpen(false)}
            patient={activePatient}
            medications={clinicData.medications}
            onSave={handleSaveMetabolic}
          />
        </>
      )}

      {/* Daily Due Followup Alert Modal (Requirement 5: Pops up on entry) */}
      <DailyDueFollowupModal
        isOpen={isDailyAlertOpen}
        onClose={() => setIsDailyAlertOpen(false)}
        patients={clinicData.patients}
        onSelectPatient={(patientId, groupAction) => {
          setSelectedPatientId(patientId);
          if (groupAction === 'home_visit') setActiveTab('homevisit');
          else if (groupAction === 'telemed') setActiveTab('telemed');
          else if (groupAction === 'clinic') setActiveTab('rx');
        }}
      />

      {/* Google Sheet Settings Modal */}
      <SheetSettingsModal
        isOpen={isSheetSettingsOpen}
        onClose={() => setIsSheetSettingsOpen(false)}
        spreadsheetId={spreadsheetId}
        onUpdateSpreadsheetId={handleUpdateSpreadsheetId}
        onInitializeHeaders={handleInitializeHeaders}
        onForcePush={handleForcePush}
        onForcePull={handleForcePull}
        isSyncing={isSyncing}
        lastSyncTime={lastSync}
      />

      {/* Destructive Operation Confirmation Dialog (Mandatory) */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(c => ({ ...c, isOpen: false }))}
      />
    </div>
  );
}
