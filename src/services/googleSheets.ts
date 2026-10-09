import { 
  AppClinicData, 
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
  DtpDomain,
  RoleType,
  PatientTrackingGroup
} from '../types.ts';

export const DEFAULT_SPREADSHEET_ID = '1ILefnwJLb1fsKLqjlRElV4E04dMmBUXFpq2wZXtPTVw';

export interface SheetTabDefinition {
  title: string;
  headers: string[];
}

export const REQUIRED_TABS: SheetTabDefinition[] = [
  {
    title: 'Patients',
    headers: ['ID', 'HN', 'ชื่อ-นามสกุล', 'เพศ', 'อายุ', 'การวินิจฉัยหลัก', 'กลุ่มการติดตาม', 'กลุ่มคลินิก/แท็ก', 'ระดับความเสี่ยง', 'Adherence %', 'เบอร์โทร', 'ที่อยู่', 'วันที่พบล่าสุด', 'วันนัดถัดไป', 'ประเภทการนัด', 'วัตถุประสงค์การนัด', 'อัปเดตล่าสุด']
  },
  {
    title: 'Medications',
    headers: ['ID', 'Patient ID', 'HN', 'ชื่อยาและขนาดยา', 'วิธีใช้ (Sig)', 'ข้อบ่งชี้ (Indication)', 'Adherence %', 'หมวดยา', 'วันที่เริ่มยา', 'หมายเหตุ']
  },
  {
    title: 'DTP_Records',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'ประเภท DTP', 'รายละเอียดยาและปัญหา', 'ยาสาเหตุ', 'การแก้ไข/Intervention', 'สถานะ', 'ผู้บันทึก']
  },
  {
    title: 'SOAP_Notes',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'Subjective (S)', 'Objective (O)', 'Assessment (A)', 'Plan (P)', 'ผู้บันทึก', 'บทบาทวิชาชีพ']
  },
  {
    title: 'Nurse_Care',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'BP', 'Pulse', 'น้ำหนัก (kg)', 'BMI', 'ยาฉีด LAI Depot', 'วันฉีด Depot', 'กินยาต่อหน้า (DOT)', 'ผลตรวจสภาวะจิต (MSE)', 'พฤติกรรมเสี่ยง', 'พยาบาลผู้บันทึก']
  },
  {
    title: 'Psych_Assessments',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'PHQ-9', 'ความเสี่ยงฆ่าตัวตาย (8Q)', 'GAD-7', 'รูปแบบการบำบัด', 'ครั้งที่', 'บันทึกการปรึกษา/CBT', 'นักจิตวิทยาผู้บันทึก']
  },
  {
    title: 'Handover_Board',
    headers: ['ID', 'Patient ID', 'HN', 'ชื่อผู้ป่วย', 'วันที่-เวลา', 'จากวิชาชีพ', 'ส่งถึงวิชาชีพ', 'ความเร่งด่วน', 'หัวข้อ', 'รายละเอียดข้อความ', 'สถานะ', 'ผู้ตอบรับ', 'เวลาตอบรับ', 'ข้อความตอบกลับ']
  },
  {
    title: 'Safety_Logs',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'Clozapine WBC (/mm³)', 'Clozapine ANC (/mm³)', 'Serum Lithium (mEq/L)', 'อาการ EPS/AIMS', 'ความดันโลหิต', 'FBS (mg/dL)', 'Lipids', 'น้ำหนัก', 'BMI', 'หมายเหตุความปลอดภัย']
  },
  {
    title: 'Adherence_MARS5',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'Q1_ลืมกินยา', 'Q2_หยุดยาชั่วคราว', 'Q3_หยุดยาบางช่วง', 'Q4_ข้ามบางมื้อ', 'Q5_กินยาน้อยกว่าสั่ง', 'คะแนนรวม (เต็ม 25)', 'การแปลผล', 'ผู้ประเมิน', 'หมายเหตุ']
  },
  {
    title: 'DIEPSS_Assessments',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'ยาต้านโรคจิตที่สงสัย', 'Gait', 'Kinetic_tremor', 'Rest_tremor', 'Sialorrhea', 'Muscle_rigidity', 'Akathisia', 'Dystonia', 'Dyskinesia', 'Overall_severity', 'คะแนนรวม (เต็ม 36)', 'ระดับความรุนแรง', 'แผนการจัดการ', 'ผู้ประเมิน']
  },
  {
    title: 'Home_Visits',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'ทีมผู้ร่วมเยี่ยม', 'สภาพแวดล้อมที่บ้าน/ครอบครัว', 'ปัญหาที่พบบ่อย (แถบเลื่อน)', 'รายละเอียดปัญหาอื่นๆ', 'ปัญหาทั้งหมด', 'รายละเอียดการติดตามช่วยเหลือ', 'แผนการดูแลต่อเนื่อง', 'วันนัดถัดไป', 'ประเภทการนัด', 'รูปภาพแนบ (URLs/Data)', 'ผู้บันทึก']
  },
  {
    title: 'Telemed_Care',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'ช่องทางติดต่อ', 'ผู้ให้ข้อมูล', 'อาการที่รายงาน', 'ความร่วมมือการทานยา', 'ผลข้างเคียง', 'คำแนะนำทางเภสัชกรรม', 'วันนัดถัดไป', 'ประเภทการนัด', 'ผู้บันทึก']
  },
  {
    title: 'Metabolic_Monitoring',
    headers: ['ID', 'Patient ID', 'HN', 'วันที่', 'ยาสงสัย', 'รอบเอว (cm)', 'น้ำหนัก (kg)', 'ส่วนสูง (cm)', 'BMI', 'SBP', 'DBP', 'FBS (mg/dL)', 'HbA1c', 'Triglycerides', 'HDL', 'Total Chol', 'LDL', 'จำนวนเกณฑ์ที่เข้า (เต็ม 5)', 'เข้าเกณฑ์ Metabolic Syndrome', 'เกณฑ์ที่ผิดปกติ', 'คำแนะนำทางเภสัชกรรม', 'ผู้บันทึก']
  }
];

export async function fetchSpreadsheetMetadata(token: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`ไม่สามารถเข้าถึง Google Sheet (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Initializes tabs and header rows in user's Google Sheet if they don't exist yet
 */
export async function initializeSheetTabs(token: string, spreadsheetId: string): Promise<string[]> {
  const meta = await fetchSpreadsheetMetadata(token, spreadsheetId);
  const existingSheetTitles = (meta.sheets || []).map((s: any) => s.properties?.title as string);

  const missingTabs = REQUIRED_TABS.filter(t => !existingSheetTitles.includes(t.title));

  if (missingTabs.length > 0) {
    // Add missing sheets
    const requests = missingTabs.map(tab => ({
      addSheet: {
        properties: {
          title: tab.title,
          gridProperties: {
            frozenRowCount: 1
          }
        }
      }
    }));

    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!batchRes.ok) {
      const err = await batchRes.text();
      console.warn('Could not add sheet tabs:', err);
    }
  }

  // Ensure header rows exist for all tabs
  for (const tab of REQUIRED_TABS) {
    try {
      const checkRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tab.title)}!A1:Z1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const checkData = await checkRes.json();
      if (!checkData.values || checkData.values.length === 0) {
        // Write header row
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tab.title)}!A1:append?valueInputOption=USER_ENTERED`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [tab.headers]
          })
        });
      }
    } catch (e) {
      console.error(`Failed to verify header for tab ${tab.title}:`, e);
    }
  }

  return REQUIRED_TABS.map(t => t.title);
}

/**
 * Fetches all clinic data from Google Sheets
 */
export async function loadClinicDataFromSheets(token: string, spreadsheetId: string): Promise<AppClinicData | null> {
  try {
    const ranges = REQUIRED_TABS.map(t => `${encodeURIComponent(t.title)}!A2:Z1000`).join('&ranges=');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges}`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`โหลดข้อมูลจาก Google Sheet ล้มเหลว: status ${res.status}`);
    }

    const data = await res.json();
    const valueRanges = data.valueRanges || [];

    const getRows = (tabName: string): any[][] => {
      const found = valueRanges.find((vr: any) => vr.range && (vr.range.startsWith(`'${tabName}'!`) || vr.range?.startsWith(`${tabName}!`) || vr.range?.includes(tabName)));
      return found?.values || [];
    };

    const patientRows = getRows('Patients');
    const medicationRows = getRows('Medications');
    const dtpRows = getRows('DTP_Records');
    const soapRows = getRows('SOAP_Notes');
    const nurseRows = getRows('Nurse_Care');
    const psychRows = getRows('Psych_Assessments');
    const handoverRows = getRows('Handover_Board');
    const safetyRows = getRows('Safety_Logs');
    const mars5Rows = getRows('Adherence_MARS5');
    const diepssRows = getRows('DIEPSS_Assessments');
    const homeVisitRows = getRows('Home_Visits');
    const telemedRows = getRows('Telemed_Care');
    const metabolicRows = getRows('Metabolic_Monitoring');

    // If sheets are totally empty (fresh sheet), return null so caller knows to push initial seed data
    if (patientRows.length === 0 && medicationRows.length === 0) {
      return null;
    }

    const parsedPatients: Patient[] = patientRows.map((r, i) => {
      // Determine if row is using expanded schema (17 columns) or legacy (13 columns)
      const isExpanded = r.length >= 14;
      const trackingGrp = isExpanded 
        ? ((r[6] === 'home_visit' || r[6] === 'telemed' || r[6] === 'clinic_dtp') ? r[6] : 'home_visit')
        : 'home_visit';

      return {
        id: r[0] || `P_${Date.now()}_${i}`,
        hn: r[1] || '',
        name: r[2] || '',
        gender: (r[3] === 'หญิง' ? 'หญิง' : 'ชาย'),
        age: parseInt(r[4]) || 30,
        diagnosis: r[5] || 'Psychiatric Condition',
        trackingGroup: trackingGrp as PatientTrackingGroup,
        statusTag: isExpanded ? (r[7] || 'General Psych') : (r[6] || 'General Psych'),
        riskLevel: isExpanded 
          ? ((r[8] === 'high' || r[8] === 'moderate') ? r[8] : 'low') 
          : ((r[7] === 'high' || r[7] === 'moderate') ? r[7] : 'low'),
        adherenceScore: isExpanded ? (parseInt(r[9]) || 100) : (parseInt(r[8]) || 100),
        phone: isExpanded ? (r[10] || '') : (r[9] || ''),
        address: isExpanded ? (r[11] || '') : '',
        lastVisit: isExpanded ? (r[12] || '') : (r[10] || ''),
        nextAppointment: isExpanded ? (r[13] || '') : (r[11] || ''),
        nextAppointmentType: isExpanded ? ((r[14] === 'home_visit' || r[14] === 'telemed' || r[14] === 'clinic') ? r[14] : undefined) : undefined,
        nextAppointmentObjective: isExpanded ? (r[15] || '') : '',
        updatedAt: isExpanded ? (r[16] || new Date().toLocaleString('th-TH')) : (r[12] || new Date().toLocaleString('th-TH'))
      };
    });

    const parsedMedications: Medication[] = medicationRows.map((r, i) => ({
      id: r[0] || `M_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      name: r[3] || '',
      sig: r[4] || '',
      indication: r[5] || '',
      adherence: parseInt(r[6]) || 100,
      category: (r[7] as any) || 'General',
      startDate: r[8] || '',
      notes: r[9] || ''
    }));

    const parsedDtps: DtpRecord[] = dtpRows.map((r, i) => ({
      id: r[0] || `D_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      date: r[3] || '',
      domain: (r[4] as DtpDomain) || 'Non-adherence',
      description: r[5] || '',
      causeDrug: r[6] || '',
      intervention: r[7] || '',
      status: (r[8] === 'resolved' ? 'resolved' : 'pending'),
      recordedBy: r[9] || 'เภสัชกร'
    }));

    const parsedSoap: SoapNote[] = soapRows.map((r, i) => ({
      id: r[0] || `S_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      date: r[3] || '',
      subjective: r[4] || '',
      objective: r[5] || '',
      assessment: r[6] || '',
      plan: r[7] || '',
      recordedBy: r[8] || 'เภสัชกร',
      role: (r[9] as RoleType) || 'pharmacist'
    }));

    const parsedNurse: NurseRecord[] = nurseRows.map((r, i) => ({
      id: r[0] || `N_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      date: r[3] || '',
      bp: r[4] || '120/80',
      pulse: r[5] || '78',
      weight: parseFloat(r[6]) || 65,
      bmi: parseFloat(r[7]) || 22.5,
      depotDrug: r[8] || '',
      depotDate: r[9] || '',
      dotObserved: r[10] === 'ใช่' || r[10] === 'true',
      mseObservation: r[11] || '',
      riskBehavior: r[12] || 'ปกติ',
      nurseName: r[13] || 'พยาบาลจิตเวช'
    }));

    const parsedPsych: PsychRecord[] = psychRows.map((r, i) => ({
      id: r[0] || `PS_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      date: r[3] || '',
      phq9Score: parseInt(r[4]) || 0,
      suicideRisk8q: r[5] || '0 (ไม่มีความเสี่ยง)',
      gad7Score: parseInt(r[6]) || 0,
      therapyType: r[7] || 'CBT',
      sessionNumber: r[8] || 'ครั้งที่ 1',
      counselingNotes: r[9] || '',
      psychologistName: r[10] || 'นักจิตวิทยาคลินิก'
    }));

    const parsedHandovers: HandoverMessage[] = handoverRows.map((r, i) => ({
      id: r[0] || `H_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      patientName: r[3] || '',
      timestamp: r[4] || '',
      senderRole: (r[5] as RoleType) || 'pharmacist',
      targetRole: (r[6] as RoleType | 'all') || 'all',
      priority: (r[7] as any) || 'normal',
      subject: r[8] || '',
      content: r[9] || '',
      status: (r[10] === 'resolved' ? 'resolved' : 'open'),
      resolvedBy: r[11] || '',
      resolvedAt: r[12] || '',
      responseNote: r[13] || ''
    }));

    const parsedSafety: SafetyLog[] = safetyRows.map((r, i) => ({
      id: r[0] || `SL_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      date: r[3] || '',
      clozapineWbc: parseFloat(r[4]) || undefined,
      clozapineAnc: parseFloat(r[5]) || undefined,
      lithiumLevel: parseFloat(r[6]) || undefined,
      epsSymptoms: r[7] || '',
      metabolicBp: r[8] || '',
      metabolicFbs: parseFloat(r[9]) || undefined,
      metabolicLipids: r[10] || '',
      weight: parseFloat(r[11]) || undefined,
      bmi: parseFloat(r[12]) || undefined,
      notes: r[13] || ''
    }));

    const parsedMars5: Mars5Assessment[] = mars5Rows.map((r, i) => ({
      id: r[0] || `MARS_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      date: r[3] || '',
      q1: parseInt(r[4]) || 5,
      q2: parseInt(r[5]) || 5,
      q3: parseInt(r[6]) || 5,
      q4: parseInt(r[7]) || 5,
      q5: parseInt(r[8]) || 5,
      totalScore: parseInt(r[9]) || 25,
      interpretation: r[10] || 'อยู่ในเกณฑ์ดี',
      evaluatedBy: r[11] || 'เภสัชกร',
      notes: r[12] || ''
    }));

    const parsedDiepss: DiepssAssessment[] = diepssRows.map((r, i) => ({
      id: r[0] || `DIEPSS_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      date: r[3] || '',
      antipsychoticDrug: r[4] || '',
      gait: parseInt(r[5]) || 0,
      kineticTremor: parseInt(r[6]) || 0,
      restTremor: parseInt(r[7]) || 0,
      sialorrhea: parseInt(r[8]) || 0,
      muscleRigidity: parseInt(r[9]) || 0,
      akathisia: parseInt(r[10]) || 0,
      dystonia: parseInt(r[11]) || 0,
      dyskinesia: parseInt(r[12]) || 0,
      overallSeverity: parseInt(r[13]) || 0,
      totalScore: parseInt(r[14]) || 0,
      severityLabel: r[15] || 'Normal',
      actionPlan: r[16] || '',
      evaluatedBy: r[17] || 'เภสัชกร'
    }));

    const parsedHomeVisits: HomeVisitRecord[] = homeVisitRows.map((r, i) => {
      let imgs: string[] = [];
      let commonProbs: string[] = [];
      try {
        if (r[13]) imgs = JSON.parse(r[13]);
        else if (r[9]) imgs = JSON.parse(r[9]);
      } catch {
        if (r[13]) imgs = [r[13]];
        else if (r[9]) imgs = [r[9]];
      }

      try {
        if (r[6]) commonProbs = JSON.parse(r[6]);
      } catch {
        if (r[6]) commonProbs = r[6].split(',').map((s: string) => s.trim());
      }

      const isExpanded = r.length >= 13;

      return {
        id: r[0] || `HV_${Date.now()}_${i}`,
        patientId: r[1] || '',
        hn: r[2] || '',
        date: r[3] || '',
        teamMembers: r[4] || '',
        environmentNotes: r[5] || '',
        selectedCommonProblems: Array.isArray(commonProbs) ? commonProbs : [],
        customProblemNotes: isExpanded ? (r[7] || '') : '',
        problemsFound: isExpanded ? (r[8] || '') : (r[6] || ''),
        followupDetails: isExpanded ? (r[9] || '') : (r[7] || ''),
        actionPlan: isExpanded ? (r[10] || '') : (r[8] || ''),
        nextAppointmentDate: isExpanded ? (r[11] || undefined) : undefined,
        nextAppointmentType: isExpanded ? (r[12] as any) : undefined,
        images: Array.isArray(imgs) ? imgs : [],
        recordedBy: isExpanded ? (r[14] || 'ทีมสหวิชาชีพ') : (r[10] || 'ทีมสหวิชาชีพ')
      };
    });

    const parsedTelemed: TelemedRecord[] = telemedRows.map((r, i) => ({
      id: r[0] || `TM_${Date.now()}_${i}`,
      patientId: r[1] || '',
      hn: r[2] || '',
      date: r[3] || '',
      channel: (r[4] as any) || 'โทรศัพท์ (Phone Call)',
      respondent: (r[5] as any) || 'ผู้ป่วยโดยตรง',
      symptomsStatus: r[6] || '',
      adherenceStatus: r[7] || '',
      sideEffectsStatus: r[8] || '',
      counselingProvided: r[9] || '',
      nextAppointmentDate: r[10] || undefined,
      nextAppointmentType: (r[11] as any) || 'telemed',
      recordedBy: r[12] || 'เภสัชกร'
    }));

    const parsedMetabolic: MetabolicRecord[] = metabolicRows.map((r, i) => {
      let crList: string[] = [];
      try {
        if (r[19]) crList = JSON.parse(r[19]);
      } catch {
        if (r[19]) crList = [r[19]];
      }
      return {
        id: r[0] || `MET_${Date.now()}_${i}`,
        patientId: r[1] || '',
        hn: r[2] || '',
        date: r[3] || '',
        suspectedDrug: r[4] || '',
        waistCm: parseFloat(r[5]) || 0,
        weightKg: parseFloat(r[6]) || 0,
        heightCm: parseFloat(r[7]) || 0,
        bmi: parseFloat(r[8]) || 0,
        sbp: parseInt(r[9]) || 0,
        dbp: parseInt(r[10]) || 0,
        fbs: parseInt(r[11]) || 0,
        hba1c: parseFloat(r[12]) || undefined,
        triglycerides: parseInt(r[13]) || 0,
        hdl: parseInt(r[14]) || 0,
        totalCholesterol: parseInt(r[15]) || undefined,
        ldl: parseInt(r[16]) || undefined,
        criteriaMetCount: parseInt(r[17]) || 0,
        isMetabolicSyndrome: r[18] === 'ใช่' || r[18] === 'true',
        criteriaList: Array.isArray(crList) ? crList : [],
        pharmacistAdvice: r[20] || '',
        recordedBy: r[21] || 'เภสัชกร'
      };
    });

    return {
      patients: parsedPatients,
      medications: parsedMedications,
      dtps: parsedDtps,
      soapNotes: parsedSoap,
      nurseRecords: parsedNurse,
      psychRecords: parsedPsych,
      handovers: parsedHandovers,
      safetyLogs: parsedSafety,
      mars5Records: parsedMars5,
      diepssRecords: parsedDiepss,
      homeVisits: parsedHomeVisits,
      telemedRecords: parsedTelemed,
      metabolicRecords: parsedMetabolic
    };
  } catch (error) {
    console.error('Failed to load clinic data from Google Sheets:', error);
    throw error;
  }
}

/**
 * Saves/Replaces full dataset into Google Sheet tabs
 */
export async function syncAllDataToSheets(token: string, spreadsheetId: string, data: AppClinicData) {
  // Ensure headers and tabs exist first
  await initializeSheetTabs(token, spreadsheetId);

  const clearAndWrite = async (tabName: string, headers: string[], rows: (string | number)[][]) => {
    // 1. Clear existing content below header
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A2:Z1000:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Append new rows
    if (rows.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A2:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: rows })
      });
    }
  };

  // Patients
  const patientRows = data.patients.map(p => [
    p.id, p.hn, p.name, p.gender, p.age, p.diagnosis, p.trackingGroup || 'home_visit', p.statusTag, p.riskLevel, p.adherenceScore, p.phone || '', p.address || '', p.lastVisit || '', p.nextAppointment || '', p.nextAppointmentType || '', p.nextAppointmentObjective || '', p.updatedAt
  ]);
  await clearAndWrite('Patients', REQUIRED_TABS[0].headers, patientRows);

  // Medications
  const medicationRows = data.medications.map(m => [
    m.id, m.patientId, m.hn, m.name, m.sig, m.indication, m.adherence, m.category || '', m.startDate || '', m.notes || ''
  ]);
  await clearAndWrite('Medications', REQUIRED_TABS[1].headers, medicationRows);

  // DTPs
  const dtpRows = data.dtps.map(d => [
    d.id, d.patientId, d.hn, d.date, d.domain, d.description, d.causeDrug, d.intervention, d.status, d.recordedBy
  ]);
  await clearAndWrite('DTP_Records', REQUIRED_TABS[2].headers, dtpRows);

  // SOAP
  const soapRows = data.soapNotes.map(s => [
    s.id, s.patientId, s.hn, s.date, s.subjective, s.objective, s.assessment, s.plan, s.recordedBy, s.role
  ]);
  await clearAndWrite('SOAP_Notes', REQUIRED_TABS[3].headers, soapRows);

  // Nurse
  const nurseRows = data.nurseRecords.map(n => [
    n.id, n.patientId, n.hn, n.date, n.bp, n.pulse, n.weight, n.bmi, n.depotDrug || '', n.depotDate || '', n.dotObserved ? 'ใช่' : 'ไม่ใช่', n.mseObservation, n.riskBehavior, n.nurseName
  ]);
  await clearAndWrite('Nurse_Care', REQUIRED_TABS[4].headers, nurseRows);

  // Psych
  const psychRows = data.psychRecords.map(ps => [
    ps.id, ps.patientId, ps.hn, ps.date, ps.phq9Score, ps.suicideRisk8q, ps.gad7Score || '', ps.therapyType, ps.sessionNumber, ps.counselingNotes, ps.psychologistName
  ]);
  await clearAndWrite('Psych_Assessments', REQUIRED_TABS[5].headers, psychRows);

  // Handovers
  const handoverRows = data.handovers.map(h => [
    h.id, h.patientId, h.hn, h.patientName, h.timestamp, h.senderRole, h.targetRole, h.priority, h.subject, h.content, h.status, h.resolvedBy || '', h.resolvedAt || '', h.responseNote || ''
  ]);
  await clearAndWrite('Handover_Board', REQUIRED_TABS[6].headers, handoverRows);

  // Safety
  const safetyRows = data.safetyLogs.map(sl => [
    sl.id, sl.patientId, sl.hn, sl.date, sl.clozapineWbc || '', sl.clozapineAnc || '', sl.lithiumLevel || '', sl.epsSymptoms || '', sl.metabolicBp || '', sl.metabolicFbs || '', sl.metabolicLipids || '', sl.weight || '', sl.bmi || '', sl.notes || ''
  ]);
  await clearAndWrite('Safety_Logs', REQUIRED_TABS[7].headers, safetyRows);

  // MARS-5
  const mars5Rows = (data.mars5Records || []).map(m => [
    m.id, m.patientId, m.hn, m.date, m.q1, m.q2, m.q3, m.q4, m.q5, m.totalScore, m.interpretation, m.evaluatedBy, m.notes || ''
  ]);
  await clearAndWrite('Adherence_MARS5', REQUIRED_TABS[8].headers, mars5Rows);

  // DIEPSS
  const diepssRows = (data.diepssRecords || []).map(d => [
    d.id, d.patientId, d.hn, d.date, d.antipsychoticDrug, d.gait, d.kineticTremor, d.restTremor, d.sialorrhea, d.muscleRigidity, d.akathisia, d.dystonia, d.dyskinesia, d.overallSeverity, d.totalScore, d.severityLabel, d.actionPlan, d.evaluatedBy
  ]);
  await clearAndWrite('DIEPSS_Assessments', REQUIRED_TABS[9].headers, diepssRows);

  // Home Visits
  const homeVisitRows = (data.homeVisits || []).map(hv => [
    hv.id, hv.patientId, hv.hn, hv.date, hv.teamMembers, hv.environmentNotes, JSON.stringify(hv.selectedCommonProblems || []), hv.customProblemNotes || '', hv.problemsFound, hv.followupDetails, hv.actionPlan, hv.nextAppointmentDate || '', hv.nextAppointmentType || '', JSON.stringify(hv.images || []), hv.recordedBy
  ]);
  await clearAndWrite('Home_Visits', REQUIRED_TABS[10].headers, homeVisitRows);

  // Telemed
  const telemedRows = (data.telemedRecords || []).map(tm => [
    tm.id, tm.patientId, tm.hn, tm.date, tm.channel, tm.respondent, tm.symptomsStatus, tm.adherenceStatus, tm.sideEffectsStatus, tm.counselingProvided, tm.nextAppointmentDate || '', tm.nextAppointmentType || '', tm.recordedBy
  ]);
  await clearAndWrite('Telemed_Care', REQUIRED_TABS[11].headers, telemedRows);

  // Metabolic Monitoring
  const metabolicRows = (data.metabolicRecords || []).map(met => [
    met.id, met.patientId, met.hn, met.date, met.suspectedDrug, met.waistCm, met.weightKg, met.heightCm, met.bmi, met.sbp, met.dbp, met.fbs, met.hba1c || '', met.triglycerides, met.hdl, met.totalCholesterol || '', met.ldl || '', met.criteriaMetCount, met.isMetabolicSyndrome ? 'ใช่' : 'ไม่ใช่', JSON.stringify(met.criteriaList || []), met.pharmacistAdvice, met.recordedBy
  ]);
  await clearAndWrite('Metabolic_Monitoring', REQUIRED_TABS[12].headers, metabolicRows);
}

/**
 * Appends a single row to a sheet tab in Google Sheets
 */
export async function appendRowToGoogleSheet(token: string, spreadsheetId: string, tabName: string, rowValues: (string | number)[]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A1:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });
  if (!res.ok) {
    throw new Error(`ไม่สามารถเพิ่มข้อมูลลงในแถว ${tabName}: ${res.status}`);
  }
  return await res.json();
}
