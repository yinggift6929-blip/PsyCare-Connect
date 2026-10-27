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
  Bell,
  BarChart3,
  LayoutGrid
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
  NotificationSettings,
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
  saveSharedGoogleToken,
  connectClinicDataStream
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
import { MonthlyPharmacyCareDashboard } from './components/MonthlyPharmacyCareDashboard.tsx';
import { NotificationSettingsModal } from './components/NotificationSettingsModal.tsx';
import { QuickDrugReferralModal } from './components/modals/QuickDrugReferralModal.tsx';
import { 
  notifyNewPatientCreated, 
  notifyHandoverPosted, 
  notifyDtpRecorded, 
  notifyHomeVisitRecorded, 
  notifyDailyDueSummary, 
  getLocalNotificationSettings, 
  saveLocalNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS
} from './services/notificationService.ts';
import { 
  subscribeToClinicData, 
  saveFirestoreClinicData, 
  fetchFirestoreClinicData,
  testFirestoreConnection 
} from './services/firebaseSync.ts';
import { 
  TeamMember, 
  getActiveTeamMember, 
  getRememberedMemberForProfession, 
  saveRememberedMemberForProfession,
  formatMemberNameAndPosition 
} from './data/teamMembers.ts';


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

  // UI Active State & Multidisciplinary Practitioner
  const [activeTeamMember, setActiveTeamMember] = useState<TeamMember>(() => getActiveTeamMember());
  const [currentRole, setCurrentRole] = useState<RoleType>(() => getActiveTeamMember().profession);
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
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isQuickDrugReferralOpen, setIsQuickDrugReferralOpen] = useState(false);
  const [referralInitialTopic, setReferralInitialTopic] = useState<string>('med_rec');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    return getLocalNotificationSettings();
  });
  const [isMonthlyDashboardOpen, setIsMonthlyDashboardOpen] = useState(false);
  const [activeDevicesCount, setActiveDevicesCount] = useState<number>(1);
  const [crossDeviceToast, setCrossDeviceToast] = useState<{ message: string; timestamp: string } | null>(null);


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
    const newVersion = Date.now();
    lastKnownVersionRef.current = newVersion;

    setClinicData((prev) => {
      const nextData = updater(prev);
      (nextData as any).version = newVersion;
      
      // 1. Persist locally to browser storage
      saveLocalClinicData(nextData);

      // 2. Persist to Firestore Cloud Database (auto-sync across Vercel, GitHub, and all devices)
      saveFirestoreClinicData(nextData, user?.displayName || currentRole).then((res) => {
        if (res.success && res.version) {
          lastKnownVersionRef.current = Math.max(lastKnownVersionRef.current, res.version);
          setSyncStatusMessage('✓ ซิงค์ข้อมูลขึ้น Cloud เชื่อมต่อทุกอุปกรณ์เรียบร้อย');
          setTimeout(() => setSyncStatusMessage(null), 3500);
        }
      }).catch(err => {
        console.warn('Firestore cloud auto-save notice:', err);
      });

      // 3. Persist to Central Backend Database immediately (mirroring for server environment)
      saveServerClinicData({ ...nextData, version: newVersion }).catch(() => {});

      // 4. Async sync to Google Sheets if access token is available (either from active login or shared backend)
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
  }, [spreadsheetId, user, currentRole]);

  // Initial Data Load on Mount, Real-time Cross-Device Cloud Sync via Firestore
  useEffect(() => {
    let isMounted = true;

    // Test Firestore connection on boot per Skill requirement
    testFirestoreConnection().catch(() => {});

    // 1. Real-time Cloud Sync from Firebase Firestore (works everywhere: Vercel, GitHub, and all devices)
    const unsubscribeFirestore = subscribeToClinicData((remoteData, version) => {
      if (!isMounted) return;
      if (version > lastKnownVersionRef.current) {
        lastKnownVersionRef.current = version;
        setClinicData(remoteData);
        saveLocalClinicData(remoteData);
        if (remoteData.notificationSettings) {
          setNotificationSettings(remoteData.notificationSettings);
          saveLocalNotificationSettings(remoteData.notificationSettings);
        }
        const timeStr = new Date().toLocaleTimeString('th-TH');
        setCrossDeviceToast({
          message: '⚡ ข้อมูลซิงค์อัตโนมัติจากอุปกรณ์อื่นแบบ Real-Time (Cloud Sync)',
          timestamp: timeStr
        });
        setTimeout(() => setCrossDeviceToast(null), 4000);
      }
    });

    // Pull latest data from central server if updated on another device (for local node dev)
    const checkAndPullUpdates = async () => {
      if (isSyncingCentralRef.current) return;
      try {
        const ver = await checkServerDataVersion();
        if (ver?.activeDevices) {
          setActiveDevicesCount(ver.activeDevices);
        }
        if (ver && ver.version && ver.version > lastKnownVersionRef.current) {
          isSyncingCentralRef.current = true;
          const remote = await fetchServerClinicData();
          if (isMounted && remote && Array.isArray(remote.patients) && remote.patients.length > 0) {
            lastKnownVersionRef.current = ver.version;
            setClinicData(remote);
            saveLocalClinicData(remote);
            const timeStr = ver.timestamp ? new Date(ver.timestamp).toLocaleTimeString('th-TH') : new Date().toLocaleTimeString('th-TH');
            setCrossDeviceToast({
              message: '🔄 ข้อมูลได้รับการอัปเดตจากอุปกรณ์อื่นเรียบร้อยแล้ว',
              timestamp: timeStr
            });
            setTimeout(() => setCrossDeviceToast(null), 4000);
          }
          isSyncingCentralRef.current = false;
        }
      } catch (e) {
        isSyncingCentralRef.current = false;
      }
    };

    // 2. Instant Push Stream via Server-Sent Events (SSE) for Node backend
    const disconnectStream = connectClinicDataStream(
      (remoteData, version, timestamp) => {
        if (!isMounted) return;
        if (version > lastKnownVersionRef.current) {
          lastKnownVersionRef.current = version;
          setClinicData(remoteData);
          saveLocalClinicData(remoteData);
          const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString('th-TH') : new Date().toLocaleTimeString('th-TH');
          setCrossDeviceToast({
            message: '⚡ ข้อมูลได้รับการอัปเดตจากอุปกรณ์อื่นแบบ Real-time',
            timestamp: timeStr
          });
          setTimeout(() => setCrossDeviceToast(null), 4000);
        }
      },
      (info) => {
        if (!isMounted) return;
        if (info.activeDevices) setActiveDevicesCount(info.activeDevices);
        if (info.version && info.version > lastKnownVersionRef.current) {
          lastKnownVersionRef.current = info.version;
        }
      }
    );

    // 3. Initial load from Firestore Cloud / Server
    fetchFirestoreClinicData().then((res) => {
      if (isMounted && res?.data && Array.isArray(res.data.patients) && res.data.patients.length > 0) {
        lastKnownVersionRef.current = res.version || Date.now();
        setClinicData(res.data);
        saveLocalClinicData(res.data);
        setSelectedPatientId((prev) => prev || res.data.patients[0]?.id || '');
      } else {
        // Fallback to server if cloud document is initial
        fetchServerClinicData().then((serverData) => {
          if (isMounted && serverData && serverData.patients && serverData.patients.length > 0) {
            setClinicData(serverData);
            saveLocalClinicData(serverData);
            setSelectedPatientId((prev) => prev || serverData.patients[0]?.id || '');
          } else {
            // Seed cloud and server with local clinic data
            const initial = loadLocalClinicData();
            saveFirestoreClinicData(initial, 'Initial Setup');
            saveServerClinicData(initial).then(r => {
              if (r.version) lastKnownVersionRef.current = r.version;
            }).catch(() => {});
          }
        });
      }
    });

    // Check version right away
    checkServerDataVersion().then(v => {
      if (v?.version) lastKnownVersionRef.current = v.version;
      if (v?.activeDevices) setActiveDevicesCount(v.activeDevices);
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

    // Light background poll to verify connectivity
    const interval = setInterval(checkAndPullUpdates, 3000);

    return () => {
      isMounted = false;
      unsubscribeFirestore();
      disconnectStream();
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
    const remembered = getRememberedMemberForProfession(role);
    setActiveTeamMember(remembered);
    saveRememberedMemberForProfession(remembered);
    if (role === 'pharmacist') setActiveTab('rx');
    else if (role === 'nurse') setActiveTab('nurse');
    else if (role === 'psychologist') setActiveTab('psych');
    else if (role === 'public_health') setActiveTab('homevisit');
  };

  // Multidisciplinary Team Member selection handler (from slider)
  const handleSelectTeamMember = (member: TeamMember) => {
    setActiveTeamMember(member);
    setCurrentRole(member.profession);
    saveRememberedMemberForProfession(member);
    if (member.profession === 'pharmacist') setActiveTab('rx');
    else if (member.profession === 'nurse') setActiveTab('nurse');
    else if (member.profession === 'psychologist') setActiveTab('psych');
    else if (member.profession === 'public_health') setActiveTab('homevisit');
  };

  // Action: Add New Patient
  const handleSaveNewPatient = (newP: Partial<Patient>) => {
    const patientObj: Patient = {
      id: `P_${Date.now()}`,
      hn: (newP.hn || '').trim(),
      name: (newP.name || '').trim(),
      gender: newP.gender || 'ชาย',
      age: newP.age || 30,
      diagnosis: newP.diagnosis || 'Schizophrenia',
      trackingGroup: newP.trackingGroup || 'clinic_dtp',
      statusTag: newP.statusTag || 'General Psych',
      riskLevel: newP.riskLevel || 'low',
      adherenceScore: newP.adherenceScore ?? 100,
      lastVisit: newP.lastVisit || new Date().toISOString().split('T')[0],
      nextAppointmentType: newP.nextAppointmentType || (newP.trackingGroup === 'home_visit' ? 'home_visit' : newP.trackingGroup === 'telemed' ? 'telemed' : 'clinic'),
      updatedAt: new Date().toLocaleString('th-TH')
    };

    if (newP.phone && newP.phone.trim()) patientObj.phone = newP.phone.trim();
    if (newP.address && newP.address.trim()) patientObj.address = newP.address.trim();
    if (newP.nextAppointment) patientObj.nextAppointment = newP.nextAppointment;
    if (newP.nextAppointmentObjective) patientObj.nextAppointmentObjective = newP.nextAppointmentObjective;

    updateDataAndSync((prev) => {
      const remaining = prev.patients.filter(p => p.hn !== patientObj.hn && p.id !== patientObj.id);
      return {
        ...prev,
        patients: [patientObj, ...remaining]
      };
    });
    setSelectedPatientId(patientObj.id);
    setSearchQuery('');
    setFilterTag('all');

    // Broadcast instant alert to Telegram / LINE
    notifyNewPatientCreated(
      notificationSettings,
      patientObj,
      user?.displayName || formatMemberNameAndPosition(activeTeamMember)
    ).then((res) => {
      if (res?.telegram?.success) {
        setCrossDeviceToast({
          message: `📲 บันทึกคนไข้ใหม่ HN ${patientObj.hn} (${patientObj.name}) และแจ้งเตือน Telegram กลุ่มสำเร็จ`,
          timestamp: new Date().toLocaleTimeString('th-TH')
        });
      } else {
        setCrossDeviceToast({
          message: `✅ บันทึกข้อมูลคนไข้ใหม่ HN ${patientObj.hn} (${patientObj.name}) เรียบร้อยแล้ว`,
          timestamp: new Date().toLocaleTimeString('th-TH')
        });
      }
    }).catch(e => console.warn('Notification notice:', e));
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
    const recorderName = newDtp.recordedBy || (currentRole === 'nurse' ? 'พยาบาลวิชาชีพ' : (currentRole === 'psychologist' ? 'นักจิตวิทยา' : 'เภสัชกร'));
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
      recordedBy: recorderName
    };

    // Auto-create multidisciplinary handover to pharmacist so pharmacist can track and resolve
    const handoverObj: HandoverMessage = {
      id: `H_DTP_${Date.now()}`,
      patientId: activePatient.id,
      hn: activePatient.hn,
      patientName: activePatient.name,
      timestamp: new Date().toLocaleString('th-TH'),
      senderRole: currentRole,
      targetRole: 'pharmacist',
      priority: 'urgent',
      subject: `[ปัญหาการใช้ยา DTP] ${dtpObj.domain} (${dtpObj.causeDrug || 'ยาทั่วไป'})`,
      content: `${dtpObj.description}\nการจัดการ/ส่งต่อให้เภสัชกร: ${dtpObj.intervention}`,
      status: 'open'
    };

    updateDataAndSync((prev) => ({
      ...prev,
      dtps: [dtpObj, ...prev.dtps],
      handovers: [handoverObj, ...(prev.handovers || [])]
    }));

    notifyDtpRecorded(notificationSettings, dtpObj, activePatient.name).then((res) => {
      if (res?.telegram?.success) {
        setCrossDeviceToast({
          message: `📲 ส่งแจ้งเตือนปัญหาการใช้ยาของ ${activePatient.name} เข้า Telegram กลุ่ม Clinic จิตดี เรียบร้อยแล้ว`,
          timestamp: new Date().toLocaleTimeString('th-TH')
        });
      } else {
        setCrossDeviceToast({
          message: `📋 บันทึกปัญหาการใช้ยา (DTP) และส่งต่อถึงเภสัชกรเรียบร้อยแล้ว`,
          timestamp: new Date().toLocaleTimeString('th-TH')
        });
      }
    }).catch(() => {});
  };

  // Action: Toggle DTP Status
  const handleToggleDtpStatus = (dtpId: string) => {
    updateDataAndSync((prev) => ({
      ...prev,
      dtps: prev.dtps.map(d => d.id === dtpId ? { ...d, status: d.status === 'resolved' ? 'pending' : 'resolved' } : d)
    }));
  };

  // Action: Update Patient Appointment
  const handleUpdateAppointment = (patientId: string, appointment: { nextAppointment?: string; nextAppointmentType?: 'home_visit' | 'telemed' | 'clinic'; nextAppointmentObjective?: string }) => {
    updateDataAndSync((prev) => ({
      ...prev,
      patients: prev.patients.map(p => p.id === patientId ? { ...p, ...appointment, updatedAt: new Date().toISOString() } : p)
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
  const handleSaveNurseLog = (
    log: Partial<NurseRecord>,
    medRecHandover?: { needMedRec: boolean; hospital: string; details: string }
  ) => {
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
      nurseName: log.nurseName || 'พยาบาลจิตเวช',
      medRecRequested: log.medRecRequested,
      medRecOtherHospital: log.medRecOtherHospital,
      medRecDetails: log.medRecDetails
    };

    let newHandover: HandoverMessage | null = null;
    if (medRecHandover && medRecHandover.needMedRec) {
      newHandover = {
        id: `H_${Date.now()}`,
        patientId: activePatient.id,
        hn: activePatient.hn,
        patientName: activePatient.name,
        timestamp: new Date().toLocaleString('th-TH'),
        senderRole: 'nurse',
        targetRole: 'pharmacist',
        priority: 'urgent',
        subject: `[Med Rec จากพยาบาล] สอบถามประวัติรับยาจาก รพ.อื่น (${medRecHandover.hospital || 'รพ.อื่น'})`,
        content: `จากการซักประวัติและพยาบาลตรวจติดตาม พบประวัติรับยาจาก: ${medRecHandover.hospital || 'รพ.อื่น'}\nรายละเอียด: ${medRecHandover.details || 'ขอความกรุณาเภสัชกรสอบถามประวัติการใช้ยาเดิมและทำ Medication Reconciliation'}\nผู้ส่งต่อ: ${nurseObj.nurseName}`,
        status: 'open'
      };
    }

    updateDataAndSync((prev) => ({
      ...prev,
      nurseRecords: [nurseObj, ...prev.nurseRecords],
      handovers: newHandover ? [newHandover, ...prev.handovers] : prev.handovers
    }));

    if (newHandover) {
      notifyHandoverPosted(notificationSettings, newHandover).catch(() => {});
      setCrossDeviceToast({
        message: `🏥 ส่งต่อเภสัชกรทำ Med Rec (${medRecHandover?.hospital}) และแจ้งเตือน Telegram กลุ่มสำเร็จ`,
        timestamp: new Date().toLocaleTimeString('th-TH')
      });
    }
  };

  // Action: Save Psych Log
  const handleSavePsychLog = (
    log: Partial<PsychRecord>,
    medRecHandover?: { needMedRec: boolean; hospital: string; details: string }
  ) => {
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
      psychologistName: log.psychologistName || 'นักจิตวิทยาคลินิก',
      medRecRequested: log.medRecRequested,
      medRecOtherHospital: log.medRecOtherHospital,
      medRecDetails: log.medRecDetails
    };

    let newHandover: HandoverMessage | null = null;
    if (medRecHandover && medRecHandover.needMedRec) {
      newHandover = {
        id: `H_${Date.now()}`,
        patientId: activePatient.id,
        hn: activePatient.hn,
        patientName: activePatient.name,
        timestamp: new Date().toLocaleString('th-TH'),
        senderRole: 'psychologist',
        targetRole: 'pharmacist',
        priority: 'urgent',
        subject: `[Med Rec จากนักจิตวิทยา] สอบถามประวัติรับยาจาก รพ.อื่น (${medRecHandover.hospital || 'รพ.อื่น'})`,
        content: `จากการซักประวัติและให้การบำบัดทางจิตวิทยา พบประวัติรับยาจาก: ${medRecHandover.hospital || 'รพ.อื่น'}\nรายละเอียด: ${medRecHandover.details || 'ขอความกรุณาเภสัชกรสอบถามประวัติการใช้ยาเดิมและทำ Medication Reconciliation'}\nผู้ส่งต่อ: ${psychObj.psychologistName}`,
        status: 'open'
      };
    }

    updateDataAndSync((prev) => ({
      ...prev,
      psychRecords: [psychObj, ...prev.psychRecords],
      handovers: newHandover ? [newHandover, ...prev.handovers] : prev.handovers
    }));

    if (newHandover) {
      notifyHandoverPosted(notificationSettings, newHandover).catch(() => {});
      setCrossDeviceToast({
        message: `🏥 ส่งต่อเภสัชกรทำ Med Rec (${medRecHandover?.hospital}) และแจ้งเตือน Telegram กลุ่มสำเร็จ`,
        timestamp: new Date().toLocaleTimeString('th-TH')
      });
    }
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

    notifyHomeVisitRecorded(notificationSettings, homeVisitObj, activePatient.name).catch(() => {});
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

    notifyHandoverPosted(notificationSettings, handoverObj).then((result) => {
      if (result?.telegram?.success) {
        setCrossDeviceToast({
          message: `📲 ส่งแจ้งเตือนปัญหาการใช้ยาของ ${activePatient.name} เข้า Telegram กลุ่ม (${notificationSettings.telegramChatId || '-5506194529'}) สำเร็จเรียบร้อยแล้ว`,
          timestamp: new Date().toLocaleTimeString('th-TH')
        });
      } else if (result?.telegram?.error) {
        setCrossDeviceToast({
          message: `📋 บันทึกส่งต่อปัญหาการใช้ยาถึงเภสัชกรสำเร็จ (Telegram: ${result.telegram.error})`,
          timestamp: new Date().toLocaleTimeString('th-TH')
        });
      } else {
        setCrossDeviceToast({
          message: `📋 บันทึกส่งต่อปัญหาการใช้ยาถึง ${h.targetRole === 'pharmacist' ? 'เภสัชกร' : h.targetRole} เรียบร้อยแล้ว`,
          timestamp: new Date().toLocaleTimeString('th-TH')
        });
      }
    }).catch(() => {});
  };

  // Action: Save & Sync Notification Settings across all devices
  const handleSaveNotificationSettings = async (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    saveLocalNotificationSettings(newSettings);
    updateDataAndSync((prev) => ({
      ...prev,
      notificationSettings: newSettings
    }));
  };


  // Action: Resolve Handover Note
  const handleResolveHandover = (handoverId: string, responseNote?: string) => {
    const resolverName = formatMemberNameAndPosition(activeTeamMember);

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

  // Manual Live Refresh from Cloud & Server (cross-device live sync)
  const handleManualRefreshServer = async () => {
    setIsSyncing(true);
    try {
      const cloudRes = await fetchFirestoreClinicData();
      if (cloudRes?.data && Array.isArray(cloudRes.data.patients) && cloudRes.data.patients.length > 0) {
        setClinicData(cloudRes.data);
        saveLocalClinicData(cloudRes.data);
        lastKnownVersionRef.current = cloudRes.version || Date.now();
        setSyncStatusMessage('✓ ดึงข้อมูลล่าสุดจาก Cloud ซิงค์ตรงกันทุกเครื่องเรียบร้อย');
        setTimeout(() => setSyncStatusMessage(null), 3000);
        return;
      }
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

  const pendingDtpsCount = activePatient
    ? clinicData.dtps.filter(d => d.patientId === activePatient.id && d.status === 'pending').length
    : 0;

  const patientHomeVisitsCount = activePatient
    ? clinicData.homeVisits.filter(h => h.patientId === activePatient.id).length
    : 0;

  const patientTelemedCount = activePatient
    ? clinicData.telemedRecords.filter(t => t.patientId === activePatient.id).length
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
        activeTeamMember={activeTeamMember}
        onSelectTeamMember={handleSelectTeamMember}
        user={user}
        spreadsheetId={spreadsheetId}
        isSyncing={isSyncing}
        syncSuccess={syncSuccess}
        lastSyncTime={lastSync}
        dueTodayCount={dueTodayCount}
        onOpenDailyAlert={() => setIsDailyAlertOpen(true)}
        onOpenMonthlyDashboard={() => setIsMonthlyDashboardOpen(true)}
        onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
        isNotificationActive={Boolean(notificationSettings.telegramEnabled || notificationSettings.lineEnabled)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSyncNow={handleSyncNow}
        onRefreshServerData={handleManualRefreshServer}
        onOpenSettings={() => setIsSheetSettingsOpen(true)}
        activeDevicesCount={activeDevicesCount}
      />

      {/* Real-time Multi-Device Sync Toast Banner */}
      {crossDeviceToast && (
        <div className={`text-white text-xs px-4 py-2 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300 ${
          crossDeviceToast.message.includes('⚠️') 
            ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600' 
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span className="font-bold">{crossDeviceToast.message}</span>
            <span className="text-[11px] opacity-90">({crossDeviceToast.timestamp})</span>
          </div>
          <div className="flex items-center gap-2">
            {crossDeviceToast.message.includes('Token') && (
              <button
                onClick={() => {
                  setCrossDeviceToast(null);
                  setIsNotificationModalOpen(true);
                }}
                className="bg-white text-rose-800 px-2.5 py-0.5 rounded-md font-bold text-[11px] hover:bg-slate-100 transition shadow-2xs cursor-pointer"
              >
                ใส่ Bot Token ตอนนี้
              </button>
            )}
            <button 
              onClick={() => setCrossDeviceToast(null)}
              className="text-white/80 hover:text-white text-xs underline font-medium cursor-pointer"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}

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
                  medications={clinicData.medications}
                  onEditPatient={() => setIsEditPatientOpen(true)}
                  onDeletePatient={handleDeletePatient}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenQuickDrugReferral={() => setIsQuickDrugReferralOpen(true)}
                />

                {/* 4 Core Clinical Care & Monitoring Columns (จัดตำแหน่ง 4 คอลัมน์หลักล่างภาพรวมของผู้ป่วย) */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {/* Column 1: การบริบาลเภสัชกรรม */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('rx')}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2.5 cursor-pointer relative group ${
                        activeTab === 'rx'
                          ? 'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/60 border-rose-300 ring-2 ring-rose-400/50 shadow-sm'
                          : 'bg-white hover:bg-pink-50/40 border-slate-200 hover:border-pink-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2.5 rounded-xl transition ${
                          activeTab === 'rx' 
                            ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-2xs' 
                            : 'bg-pink-100 text-pink-700 group-hover:bg-pink-200'
                        }`}>
                          <Pill className="w-4 h-4" />
                        </div>
                        {pendingDtpsCount > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            DRP {pendingDtpsCount}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            DRP ปกติ
                          </span>
                        )}
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-tight ${activeTab === 'rx' ? 'text-rose-950 font-extrabold' : 'text-slate-800'}`}>
                          การบริบาลเภสัชกรรม
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          Rx Care, DTP & ยา
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-between pt-1.5 border-t w-full ${
                        activeTab === 'rx' ? 'text-rose-700 border-rose-200' : 'text-slate-400 border-slate-100 group-hover:text-pink-600'
                      }`}>
                        <span>{activeTab === 'rx' ? '● กำลังแสดง' : 'คลิกเปิดดู'}</span>
                        <span className="text-[9px] opacity-70">คอลัมน์ 1</span>
                      </div>
                    </button>

                    {/* Column 2: การเยี่ยมบ้าน */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('homevisit')}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2.5 cursor-pointer relative group ${
                        activeTab === 'homevisit'
                          ? 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100/60 border-indigo-300 ring-2 ring-indigo-400/50 shadow-sm'
                          : 'bg-white hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2.5 rounded-xl transition ${
                          activeTab === 'homevisit' 
                            ? 'bg-indigo-600 text-white shadow-2xs' 
                            : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200'
                        }`}>
                          <Home className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {patientHomeVisitsCount} บันทึก
                        </span>
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-tight ${activeTab === 'homevisit' ? 'text-indigo-950 font-extrabold' : 'text-slate-800'}`}>
                          การเยี่ยมบ้าน
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          Home Visit สหวิชาชีพ
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-between pt-1.5 border-t w-full ${
                        activeTab === 'homevisit' ? 'text-indigo-700 border-indigo-200' : 'text-slate-400 border-slate-100 group-hover:text-indigo-600'
                      }`}>
                        <span>{activeTab === 'homevisit' ? '● กำลังแสดง' : 'คลิกเปิดดู'}</span>
                        <span className="text-[9px] opacity-70">คอลัมน์ 2</span>
                      </div>
                    </button>

                    {/* Column 3: การติดตาม Telemed */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('telemed')}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2.5 cursor-pointer relative group ${
                        activeTab === 'telemed'
                          ? 'bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100/60 border-teal-300 ring-2 ring-teal-400/50 shadow-sm'
                          : 'bg-white hover:bg-teal-50/40 border-slate-200 hover:border-teal-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2.5 rounded-xl transition ${
                          activeTab === 'telemed' 
                            ? 'bg-teal-600 text-white shadow-2xs' 
                            : 'bg-teal-100 text-teal-700 group-hover:bg-teal-200'
                        }`}>
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          {patientTelemedCount} บันทึก
                        </span>
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-tight ${activeTab === 'telemed' ? 'text-teal-950 font-extrabold' : 'text-slate-800'}`}>
                          การติดตาม Telemed
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          โทร/วิดีโอคอลติดตาม
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-between pt-1.5 border-t w-full ${
                        activeTab === 'telemed' ? 'text-teal-700 border-teal-200' : 'text-slate-400 border-slate-100 group-hover:text-teal-600'
                      }`}>
                        <span>{activeTab === 'telemed' ? '● กำลังแสดง' : 'คลิกเปิดดู'}</span>
                        <span className="text-[9px] opacity-70">คอลัมน์ 3</span>
                      </div>
                    </button>

                    {/* Column 4: แนวโน้ม & Lab Monitor */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('analytics')}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2.5 cursor-pointer relative group ${
                        activeTab === 'analytics'
                          ? 'bg-gradient-to-br from-sky-50 via-cyan-50 to-sky-100/60 border-sky-300 ring-2 ring-sky-400/50 shadow-sm'
                          : 'bg-white hover:bg-sky-50/40 border-slate-200 hover:border-sky-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2.5 rounded-xl transition ${
                          activeTab === 'analytics' 
                            ? 'bg-sky-600 text-white shadow-2xs' 
                            : 'bg-sky-100 text-sky-700 group-hover:bg-sky-200'
                        }`}>
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                          Labs & Trends
                        </span>
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-tight ${activeTab === 'analytics' ? 'text-sky-950 font-extrabold' : 'text-slate-800'}`}>
                          แนวโน้ม & Lab Monitor
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          ผลตรวจแล็บ & กราฟแนวโน้ม
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-between pt-1.5 border-t w-full ${
                        activeTab === 'analytics' ? 'text-sky-700 border-sky-200' : 'text-slate-400 border-slate-100 group-hover:text-sky-600'
                      }`}>
                        <span>{activeTab === 'analytics' ? '● กำลังแสดง' : 'คลิกเปิดดู'}</span>
                        <span className="text-[9px] opacity-70">คอลัมน์ 4</span>
                      </div>
                    </button>
                  </div>

                  {/* Secondary Bar: Other Multidisciplinary Tools & Dashboard */}
                  <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 p-2 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-bold px-2">งานสหวิชาชีพเพิ่มเติม:</span>

                      <button
                        type="button"
                        onClick={() => setActiveTab('nurse')}
                        className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium transition cursor-pointer ${
                          activeTab === 'nurse'
                            ? 'bg-teal-700 text-white shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50'
                        }`}
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>บันทึกการพยาบาล (Nurse)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('psych')}
                        className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium transition cursor-pointer ${
                          activeTab === 'psych'
                            ? 'bg-amber-500 text-white shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
                        }`}
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>ประเมินจิตวิทยา & CBT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('handover')}
                        className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium transition cursor-pointer relative ${
                          activeTab === 'handover'
                            ? 'bg-purple-600 text-white shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>ส่งต่อสหวิชาชีพ (Handover)</span>
                        {openHandoversCount > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            activeTab === 'handover' ? 'bg-white text-purple-700' : 'bg-rose-500 text-white'
                          }`}>
                            {openHandoversCount}
                          </span>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMonthlyDashboardOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 font-bold border border-indigo-200 transition cursor-pointer ml-auto shadow-2xs"
                      title="แสดง Dashboard สรุปผลการบริบาลเภสัชกรรมผู้ป่วยคลินิกจิตดี รายเดือน เพื่อดึงสรุปเป็นผลการดำเนินงาน"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>📊 Dashboard ผลงานรายเดือน</span>
                    </button>
                  </div>
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
                    handovers={clinicData.handovers}
                    onOpenAddMed={() => setIsAddMedOpen(true)}
                    onDeleteMed={handleDeleteMedication}
                    onOpenAddDtp={() => setIsAddDtpOpen(true)}
                    onToggleDtpStatus={handleToggleDtpStatus}
                    onOpenMars5={() => setIsMars5Open(true)}
                    onOpenDiepss={() => setIsDiepssOpen(true)}
                    onOpenMetabolic={() => setIsMetabolicOpen(true)}
                    onSaveMedication={handleSaveMedication}
                    onSaveDtp={handleSaveDtp}
                    onUpdateAppointment={handleUpdateAppointment}
                    onSaveSoapNote={handleSaveSoapNote}
                    onSaveSafetyLog={handleSaveSafetyLog}
                    onSaveMars5={handleSaveMars5}
                    onResolveHandover={handleResolveHandover}
                  />
                )}

                {activeTab === 'nurse' && (
                  <NurseCareTab
                    patient={activePatient}
                    nurseRecords={clinicData.nurseRecords}
                    onOpenAddNurseLog={() => setIsAddNurseOpen(true)}
                    onOpenMedRecReferral={() => {
                      setReferralInitialTopic('med_rec');
                      setIsQuickDrugReferralOpen(true);
                    }}
                  />
                )}

                {activeTab === 'psych' && (
                  <PsychologistTab
                    patient={activePatient}
                    psychRecords={clinicData.psychRecords}
                    onOpenAddPsychLog={() => setIsAddPsychOpen(true)}
                    onOpenMedRecReferral={() => {
                      setReferralInitialTopic('med_rec');
                      setIsQuickDrugReferralOpen(true);
                    }}
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
                    notificationSettings={notificationSettings}
                    onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
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
        onSendDailyNotification={async (dueToday, overdue) => {
          await notifyDailyDueSummary(notificationSettings, dueToday, overdue);
        }}
        isNotificationEnabled={Boolean(notificationSettings.telegramEnabled || notificationSettings.lineEnabled)}
      />

      {/* Monthly Clinic Jit-Dee Pharmacy Care Dashboard Modal */}
      <MonthlyPharmacyCareDashboard
        isOpen={isMonthlyDashboardOpen}
        onClose={() => setIsMonthlyDashboardOpen(false)}
        patients={clinicData.patients}
        dtps={clinicData.dtps}
        medications={clinicData.medications}
        homeVisits={clinicData.homeVisits}
        telemedRecords={clinicData.telemedRecords}
        nurseRecords={clinicData.nurseRecords}
        psychRecords={clinicData.psychRecords}
        safetyLogs={clinicData.safetyLogs}
        mars5Records={clinicData.mars5Records}
        diepssRecords={clinicData.diepssRecords}
        metabolicRecords={clinicData.metabolicRecords}
        onSelectPatient={(patientId) => {
          setSelectedPatientId(patientId);
          setActiveTab('rx');
        }}
        onSyncNow={handleSyncNow}
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

      {/* LINE & Telegram Notification Hub Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        settings={notificationSettings}
        onSaveSettings={handleSaveNotificationSettings}
      />



      {/* Quick Pharmacist Drug Safety Referral Modal (Telegram Group Alert) */}
      {activePatient && (
        <QuickDrugReferralModal
          isOpen={isQuickDrugReferralOpen}
          onClose={() => setIsQuickDrugReferralOpen(false)}
          patient={activePatient}
          currentRole={currentRole}
          medications={clinicData.medications}
          notificationSettings={notificationSettings}
          onSaveNotificationSettings={handleSaveNotificationSettings}
          onSubmitHandover={handleSubmitHandover}
          initialTopicId={referralInitialTopic}
        />
      )}

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
