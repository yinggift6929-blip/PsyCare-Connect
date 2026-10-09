export type RoleType = 'pharmacist' | 'nurse' | 'psychologist';

export type RiskLevel = 'low' | 'moderate' | 'high';

// 3 Patient Tracking Groups: Home Visit, Telemed, Clinic DTP
export type PatientTrackingGroup = 'home_visit' | 'telemed' | 'clinic_dtp';

export interface Patient {
  id: string;
  hn: string;
  name: string;
  gender: 'ชาย' | 'หญิง';
  age: number;
  diagnosis: string;
  trackingGroup: PatientTrackingGroup; // 'home_visit' | 'telemed' | 'clinic_dtp'
  statusTag: string; // เช่น 'Clozapine Clinic', 'Bipolar I', 'LAI Depot', 'High Suicide Risk'
  riskLevel: RiskLevel;
  adherenceScore: number; // 0 - 100%
  phone?: string;
  address?: string; // ที่อยู่สำหรับเยี่ยมบ้าน
  lastVisit?: string;
  nextAppointment?: string;
  nextAppointmentType?: 'home_visit' | 'telemed' | 'clinic';
  nextAppointmentObjective?: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  hn: string;
  name: string;
  sig: string;
  indication: string;
  adherence: number; // 0 - 100%
  category?: 'Antipsychotic' | 'Mood Stabilizer' | 'Antidepressant' | 'Anxiolytic' | 'Antiparkinson' | 'General';
  startDate?: string;
  notes?: string;
}

export type DtpDomain = 
  | 'Non-adherence'
  | 'Adverse Drug Reaction / EPS'
  | 'Drug Interaction'
  | 'Subtherapeutic Dose'
  | 'Overdosage'
  | 'Unnecessary Drug Therapy'
  | 'Need Additional Therapy'
  | 'Safety Monitoring';

export interface DtpRecord {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  domain: DtpDomain;
  description: string;
  causeDrug: string;
  intervention: string;
  status: 'pending' | 'resolved';
  recordedBy: string;
}

export interface SoapNote {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  nextFollowupDate?: string;
  recordedBy: string;
  role: RoleType;
}

export interface SafetyLog {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  clozapineWbc?: number;
  clozapineAnc?: number;
  lithiumLevel?: number;
  epsSymptoms?: string;
  metabolicBp?: string;
  metabolicFbs?: number;
  metabolicLipids?: string;
  weight?: number;
  bmi?: number;
  notes?: string;
}

export interface NurseRecord {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  bp: string;
  pulse: string;
  weight: number;
  bmi: number;
  depotDrug?: string;
  depotDate?: string;
  dotObserved: boolean;
  mseObservation: string;
  riskBehavior: string;
  nextFollowupDate?: string;
  nurseName: string;
}

export interface PsychRecord {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  phq9Score: number;
  suicideRisk8q: string;
  gad7Score?: number;
  therapyType: string;
  sessionNumber: string;
  counselingNotes: string;
  nextFollowupDate?: string;
  psychologistName: string;
}

export interface HandoverMessage {
  id: string;
  patientId: string;
  hn: string;
  patientName: string;
  timestamp: string;
  senderRole: RoleType;
  targetRole: RoleType | 'all';
  priority: 'normal' | 'urgent' | 'stat';
  subject: string;
  content: string;
  status: 'open' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: string;
  responseNote?: string;
}

export interface Mars5Assessment {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  totalScore: number;
  interpretation: string;
  nextFollowupDate?: string;
  evaluatedBy: string;
  notes?: string;
}

export interface DiepssAssessment {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  antipsychoticDrug: string;
  gait: number;
  kineticTremor: number;
  restTremor: number;
  sialorrhea: number;
  muscleRigidity: number;
  akathisia: number;
  dystonia: number;
  dyskinesia: number;
  overallSeverity: number;
  totalScore: number;
  severityLabel: string;
  actionPlan: string;
  nextFollowupDate?: string;
  evaluatedBy: string;
}

// 2. แบบบันทึกการเยี่ยมบ้านทีมสหวิชาชีพ พร้อมปัญหาที่พบบ่อย (แถบเลื่อน) และแนบรูปภาพ
export interface HomeVisitRecord {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  teamMembers: string;
  environmentNotes: string;
  selectedCommonProblems: string[]; // รายการปัญหาที่เลือกจากแถบเลื่อน
  customProblemNotes: string; // รายละเอียดที่พิมพ์เพิ่มเติมเมื่อเลือก "อื่นๆ" หรือพิมพ์เสริม
  problemsFound: string; // รวมข้อความปัญหาทั้งหมด
  followupDetails: string;
  actionPlan: string;
  nextAppointmentDate?: string; // วันนัดติดตามต่อเนื่อง
  nextAppointmentType?: 'home_visit' | 'telemed' | 'clinic';
  images: string[];
  recordedBy: string;
}

// 3. แบบบันทึกการติดตาม Telemed (Telemedicine / Telepsychiatry)
export interface TelemedRecord {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  channel: 'โทรศัพท์ (Phone Call)' | 'วิดีโอคอล (Video Call)' | 'LINE Official / ข้อความ';
  respondent: 'ผู้ป่วยโดยตรง' | 'ญาติ / ผู้ดูแลหลัก';
  symptomsStatus: string; // อาการทางจิต/อารมณ์ในปัจจุบัน
  adherenceStatus: string; // การรับประทานยา (ทานครบ / ลืมบางมื้อ / ขาดยา)
  sideEffectsStatus: string; // อาการข้างเคียงที่รายงาน
  counselingProvided: string; // คำแนะนำทางเภสัชกรรม/การดูแล
  nextAppointmentDate?: string; // วันนัดติดตามครั้งถัดไป
  nextAppointmentType?: 'home_visit' | 'telemed' | 'clinic';
  recordedBy: string;
}

// 4. แบบบันทึกการติดตาม Metabolic Syndrome
export interface MetabolicRecord {
  id: string;
  patientId: string;
  hn: string;
  date: string;
  suspectedDrug: string;
  waistCm: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
  sbp: number;
  dbp: number;
  fbs: number;
  hba1c?: number;
  triglycerides: number;
  hdl: number;
  totalCholesterol?: number;
  ldl?: number;
  criteriaMetCount: number;
  isMetabolicSyndrome: boolean;
  criteriaList: string[];
  pharmacistAdvice: string;
  nextFollowupDate?: string;
  recordedBy: string;
}

export interface AppClinicData {
  patients: Patient[];
  medications: Medication[];
  dtps: DtpRecord[];
  soapNotes: SoapNote[];
  safetyLogs: SafetyLog[];
  nurseRecords: NurseRecord[];
  psychRecords: PsychRecord[];
  handovers: HandoverMessage[];
  mars5Records: Mars5Assessment[];
  diepssRecords: DiepssAssessment[];
  homeVisits: HomeVisitRecord[];
  telemedRecords: TelemedRecord[];
  metabolicRecords: MetabolicRecord[];
}
