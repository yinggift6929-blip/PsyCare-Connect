import React, { useState } from 'react';
import { HeartPulse, X, AlertTriangle, ShieldCheck, CheckCircle2, Flame, Scale } from 'lucide-react';
import { MetabolicRecord, Patient, Medication } from '../../types.ts';

interface MetabolicMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  medications: Medication[];
  onSave: (record: Partial<MetabolicRecord>) => void;
}

export const MetabolicMonitoringModal: React.FC<MetabolicMonitoringModalProps> = ({
  isOpen,
  onClose,
  patient,
  medications,
  onSave
}) => {
  const antipsychotics = medications
    .filter(m => m.patientId === patient.id && (m.category === 'Antipsychotic' || m.name.toLowerCase().includes('clozapine') || m.name.toLowerCase().includes('olanzapine') || m.name.toLowerCase().includes('quetiapine') || m.name.toLowerCase().includes('risperidone') || m.name.toLowerCase().includes('paliperidone')));

  const defaultDrug = antipsychotics[0]?.name || 'Antipsychotic Therapy';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [suspectedDrug, setSuspectedDrug] = useState(defaultDrug);
  const [waistCm, setWaistCm] = useState('92');
  const [weightKg, setWeightKg] = useState('74');
  const [heightCm, setHeightCm] = useState('170');
  const [sbp, setSbp] = useState('128');
  const [dbp, setDbp] = useState('82');
  const [fbs, setFbs] = useState('105');
  const [hba1c, setHba1c] = useState('');
  const [triglycerides, setTriglycerides] = useState('175');
  const [hdl, setHdl] = useState('42');
  const [totalCholesterol, setTotalCholesterol] = useState('210');
  const [ldl, setLdl] = useState('130');
  const [pharmacistAdvice, setPharmacistAdvice] = useState('');
  const [recordedBy, setRecordedBy] = useState('ภญ.สุพิชฌาย์ (เภสัชกรคลินิก)');

  if (!isOpen) return null;

  // Auto calculate BMI
  const w = parseFloat(weightKg) || 0;
  const h = (parseFloat(heightCm) || 0) / 100;
  const calculatedBmi = h > 0 ? parseFloat((w / (h * h)).toFixed(1)) : 0;

  // NCEP ATP III 5 Criteria Checks:
  const waistVal = parseFloat(waistCm) || 0;
  const sbpVal = parseInt(sbp) || 0;
  const dbpVal = parseInt(dbp) || 0;
  const fbsVal = parseInt(fbs) || 0;
  const tgVal = parseInt(triglycerides) || 0;
  const hdlVal = parseInt(hdl) || 0;

  const isMale = patient.gender === 'ชาย';

  // 1. Waist: Male > 90 cm, Female > 80 cm
  const waistAbnormal = isMale ? waistVal > 90 : waistVal > 80;
  // 2. BP: SBP >= 130 or DBP >= 85
  const bpAbnormal = sbpVal >= 130 || dbpVal >= 85;
  // 3. FBS: >= 100 mg/dL
  const fbsAbnormal = fbsVal >= 100;
  // 4. Triglycerides: >= 150 mg/dL
  const tgAbnormal = tgVal >= 150;
  // 5. HDL: Male < 40, Female < 50 mg/dL
  const hdlAbnormal = isMale ? hdlVal < 40 : hdlVal < 50;

  const criteriaList: string[] = [];
  if (waistAbnormal) criteriaList.push(`รอบเอวเกินเกณฑ์ (${isMale ? '>90' : '>80'} cm) = ${waistVal} cm`);
  if (bpAbnormal) criteriaList.push(`ความดันโลหิตสูง (≥130/85 mmHg) = ${sbpVal}/${dbpVal} mmHg`);
  if (fbsAbnormal) criteriaList.push(`ระดับน้ำตาล FBS สูง (≥100 mg/dL) = ${fbsVal} mg/dL`);
  if (tgAbnormal) criteriaList.push(`ระดับไตรกลีเซอไรด์สูง (≥150 mg/dL) = ${tgVal} mg/dL`);
  if (hdlAbnormal) criteriaList.push(`ระดับไขมันดี HDL ต่ำ (${isMale ? '<40' : '<50'} mg/dL) = ${hdlVal} mg/dL`);

  const criteriaMetCount = criteriaList.length;
  const isMetabolicSyndrome = criteriaMetCount >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const advice = pharmacistAdvice.trim() || (isMetabolicSyndrome 
      ? 'เข้าเกณฑ์ Metabolic Syndrome (≥3 ข้อ) แนะนำควบคุมอาหาร ลดของทอดหวานมัน ออกกำลังกาย และปรึกษาแพทย์เรื่องยากลุ่มเสี่ยง'
      : 'ยังไม่เข้าเกณฑ์ Metabolic Syndrome แนะนำติดตามผลแล็บประจำปี');

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      date,
      suspectedDrug: suspectedDrug.trim(),
      waistCm: waistVal,
      weightKg: w,
      heightCm: parseFloat(heightCm) || 0,
      bmi: calculatedBmi,
      sbp: sbpVal,
      dbp: dbpVal,
      fbs: fbsVal,
      hba1c: hba1c ? parseFloat(hba1c) : undefined,
      triglycerides: tgVal,
      hdl: hdlVal,
      totalCholesterol: totalCholesterol ? parseInt(totalCholesterol) : undefined,
      ldl: ldl ? parseInt(ldl) : undefined,
      criteriaMetCount,
      isMetabolicSyndrome,
      criteriaList,
      pharmacistAdvice: advice,
      recordedBy: recordedBy.trim() || 'เภสัชกร'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto custom-scrollbar space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                แบบบันทึกการติดตาม Metabolic ที่เกี่ยวข้องกับยาจิตเวช
              </h3>
              <p className="text-xs text-slate-500">
                ประเมินเกณฑ์กลุ่มอาการเมแทบอลิก (NCEP ATP III): {patient.name} (HN: {patient.hn})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Antipsychotic Drug & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-pink-50/40 p-3 rounded-xl border border-pink-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">วันที่ตรวจวัด / ผลตรวจ Lab:</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-white border border-pink-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ยาต้านโรคจิตที่เฝ้าระวัง (Antipsychotic):</label>
              <input
                type="text"
                value={suspectedDrug}
                onChange={(e) => setSuspectedDrug(e.target.value)}
                placeholder="เช่น Clozapine, Olanzapine, Quetiapine, Risperidone"
                className="w-full p-2 bg-white border border-pink-200 rounded-xl"
              />
            </div>
          </div>

          {/* Anthropometrics & BP */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-pink-600" /> ข้อมูลสัดส่วนร่างกายและความดันโลหิต:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  รอบเอว (Waist cm):
                  <span className="block text-[10px] text-pink-600 font-normal">
                    (เกณฑ์: {isMale ? '>90' : '>80'} cm)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  className={`w-full p-2 border rounded-xl font-bold ${
                    waistAbnormal ? 'border-rose-400 bg-rose-50/50 text-rose-800' : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">น้ำหนัก (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">ส่วนสูง (cm):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  คำนวณ BMI:
                  <span className="block text-[10px] text-slate-400 font-normal">(Auto calculate)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={calculatedBmi > 0 ? `${calculatedBmi} kg/m²` : '-'}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  ความดันตัวบน (SBP mmHg):
                  <span className="text-[10px] text-slate-400 ml-1">เกณฑ์ ≥130</span>
                </label>
                <input
                  type="number"
                  required
                  value={sbp}
                  onChange={(e) => setSbp(e.target.value)}
                  className={`w-full p-2 border rounded-xl font-bold ${
                    sbpVal >= 130 ? 'border-rose-400 bg-rose-50/50 text-rose-800' : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  ความดันตัวล่าง (DBP mmHg):
                  <span className="text-[10px] text-slate-400 ml-1">เกณฑ์ ≥85</span>
                </label>
                <input
                  type="number"
                  required
                  value={dbp}
                  onChange={(e) => setDbp(e.target.value)}
                  className={`w-full p-2 border rounded-xl font-bold ${
                    dbpVal >= 85 ? 'border-rose-400 bg-rose-50/50 text-rose-800' : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Blood Labs */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" /> ผลตรวจทางห้องปฏิบัติการ (Metabolic Labs):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  FBS (mg/dL):
                  <span className="block text-[10px] text-pink-600 font-normal">(เกณฑ์ ≥100)</span>
                </label>
                <input
                  type="number"
                  required
                  value={fbs}
                  onChange={(e) => setFbs(e.target.value)}
                  className={`w-full p-2 border rounded-xl font-bold ${
                    fbsAbnormal ? 'border-rose-400 bg-rose-50/50 text-rose-800' : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Triglyceride (mg/dL):
                  <span className="block text-[10px] text-pink-600 font-normal">(เกณฑ์ ≥150)</span>
                </label>
                <input
                  type="number"
                  required
                  value={triglycerides}
                  onChange={(e) => setTriglycerides(e.target.value)}
                  className={`w-full p-2 border rounded-xl font-bold ${
                    tgAbnormal ? 'border-rose-400 bg-rose-50/50 text-rose-800' : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  HDL-Cholesterol (mg/dL):
                  <span className="block text-[10px] text-pink-600 font-normal">(เกณฑ์ {isMale ? '<40' : '<50'})</span>
                </label>
                <input
                  type="number"
                  required
                  value={hdl}
                  onChange={(e) => setHdl(e.target.value)}
                  className={`w-full p-2 border rounded-xl font-bold ${
                    hdlAbnormal ? 'border-rose-400 bg-rose-50/50 text-rose-800' : 'border-slate-200 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  HbA1c (%):
                  <span className="block text-[10px] text-slate-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  placeholder="เช่น 5.7"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Total Cholesterol (mg/dL):</label>
                <input
                  type="number"
                  value={totalCholesterol}
                  onChange={(e) => setTotalCholesterol(e.target.value)}
                  placeholder="เช่น 210"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">LDL-Cholesterol (mg/dL):</label>
                <input
                  type="number"
                  value={ldl}
                  onChange={(e) => setLdl(e.target.value)}
                  placeholder="เช่น 130"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Real-time Metabolic Syndrome Evaluation Box */}
          <div className={`p-4 rounded-xl border ${
            isMetabolicSyndrome ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {isMetabolicSyndrome ? (
                  <Flame className="w-5 h-5 text-rose-600 animate-pulse shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    ผลการประเมินกลุ่มอาการเมแทบอลิก: 
                    <span className={`ml-1 font-bold ${isMetabolicSyndrome ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {isMetabolicSyndrome ? '⚠️ เข้าเกณฑ์ Metabolic Syndrome' : '✓ ยังไม่เข้าเกณฑ์ Metabolic Syndrome'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    พบความผิดปกติ <strong>{criteriaMetCount} จาก 5 เกณฑ์</strong> (เกณฑ์วินิจฉัยเมื่อพบตั้งแต่ 3 ข้อขึ้นไป)
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isMetabolicSyndrome ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {criteriaMetCount} / 5 เกณฑ์
              </span>
            </div>

            {criteriaList.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-rose-200/60 text-[11px] text-slate-700 space-y-1">
                <span className="font-bold text-rose-900">เกณฑ์ที่พบความผิดปกติ:</span>
                {criteriaList.map((crit, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-rose-800">
                    <span>• {crit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advice & Evaluator */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              คำแนะนำและการบริบาลทางเภสัชกรรม (Pharmacist Clinical Advice):
            </label>
            <textarea
              rows={2}
              placeholder="เช่น แนะนำการปรับเปลี่ยนพฤติกรรม ลดอาหารหวานมันเค็ม นัดตรวจซ้ำ 3 เดือน หรือปรึกษาแพทย์พิจารณาปรับเปลี่ยนยาต้านโรคจิตที่เสี่ยงต่ำ..."
              value={pharmacistAdvice}
              onChange={(e) => setPharmacistAdvice(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">เภสัชกรผู้บันทึก:</label>
            <input
              type="text"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              บันทึกผล Metabolic & ซิงค์ Google Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
