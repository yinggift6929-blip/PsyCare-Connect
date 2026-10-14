import React, { useState, useEffect } from 'react';
import { Pill, X, Sparkles, Check } from 'lucide-react';
import { Medication, Patient } from '../../types.ts';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (med: Partial<Medication>) => void;
}

// 3 Standard Psychiatric Drug Groups (Requirement 3)
export const STANDARD_DRUG_GROUPS = {
  antipsychotic: {
    label: '3.1 Antipsychotic drugs',
    drugs: [
      'Risperidone 1 mg',
      'Risperidone 2 mg',
      'Haloperidol 0.5 mg',
      'Haloperidol 5 mg',
      'Trihexyphenidyl 2 mg',
      'Trihexyphenidyl 5 mg'
    ]
  },
  ssri: {
    label: '3.2 กลุ่มยา SSRIs',
    drugs: [
      'Fluoxetine 20 mg',
      'Sertraline 50 mg'
    ]
  },
  sedative: {
    label: '3.3 กลุ่มยา Sedative',
    drugs: [
      'Lorazepam 0.5 mg',
      'Clonazepam 0.5 mg',
      'Clonazepam 2 mg',
      'Clorazepate 5 mg',
      'Diazepam 2 mg',
      'Diazepam 5 mg'
    ]
  }
};

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  // Drug selection state (Requirement 3)
  const [selectedPreset, setSelectedPreset] = useState<string>('Risperidone 2 mg');
  const [customDrugName, setCustomDrugName] = useState('');
  const [category, setCategory] = useState<any>('Antipsychotic');

  // 6-slot Sig State (Requirement 4)
  const [doseTab, setDoseTab] = useState('1'); // ช่อง 1: ใส่เฉพาะตัวเลข ระบุจำนวนเม็ด
  const [mealTiming, setMealTiming] = useState<'หลังอาหาร' | 'ก่อนอาหาร' | 'พร้อมอาหาร' | 'ก่อนนอน'>('หลังอาหาร'); // ช่อง 2: ก่อน/หลังอาหาร
  const [takeMorning, setTakeMorning] = useState(false); // ช่อง 3: เช้า
  const [takeNoon, setTakeNoon] = useState(false); // ช่อง 4: กลางวัน
  const [takeEvening, setTakeEvening] = useState(false); // ช่อง 5: เย็น
  const [takeBedtime, setTakeBedtime] = useState(true); // ช่อง 6: ก่อนนอน

  // Manual Sig Override
  const [customSig, setCustomSig] = useState('');
  const [isEditingSigManually, setIsEditingSigManually] = useState(false);

  const [indication, setIndication] = useState('');
  const [adherence, setAdherence] = useState('100');
  const [notes, setNotes] = useState('');

  // Auto-generate Sig from the 6 slots (Requirement 4)
  useEffect(() => {
    if (isEditingSigManually) return;

    const tabsStr = doseTab ? `${doseTab} เม็ด` : '1 เม็ด';
    const times: string[] = [];
    if (takeMorning) times.push('เช้า');
    if (takeNoon) times.push('กลางวัน');
    if (takeEvening) times.push('เย็น');
    if (takeBedtime) times.push('ก่อนนอน');

    let generated = '';
    if (mealTiming === 'ก่อนนอน' && times.length === 1 && times[0] === 'ก่อนนอน') {
      generated = `รับประทานครั้งละ ${tabsStr} วันละ 1 ครั้ง ก่อนนอน`;
    } else {
      const timesStr = times.length > 0 ? times.join(', ') : 'ตามแพทย์สั่ง';
      const mealStr = mealTiming === 'ก่อนนอน' ? '' : ` ${mealTiming}`;
      generated = `รับประทานครั้งละ ${tabsStr}${mealStr} ${timesStr}`;
    }

    setCustomSig(generated);
  }, [doseTab, mealTiming, takeMorning, takeNoon, takeEvening, takeBedtime, isEditingSigManually]);

  // Sync category and indication when preset drug changes
  const handlePresetChange = (drugName: string) => {
    setSelectedPreset(drugName);
    if (drugName === 'custom') {
      return;
    }
    if (STANDARD_DRUG_GROUPS.antipsychotic.drugs.includes(drugName)) {
      setCategory('Antipsychotic');
      if (drugName.includes('Trihexyphenidyl')) {
        setCategory('Antiparkinson');
        setIndication('ป้องกันและรักษาอาการสั่นเกร็ง (EPS)');
      } else {
        setIndication('ควบคุมอาการทางจิตเวชและลดความหวาดระแวง');
      }
    } else if (STANDARD_DRUG_GROUPS.ssri.drugs.includes(drugName)) {
      setCategory('Antidepressant');
      setIndication('รักษาภาวะซึมเศร้า วิตกกังวล และปรับสมดุลอารมณ์');
    } else if (STANDARD_DRUG_GROUPS.sedative.drugs.includes(drugName)) {
      setCategory('Anxiolytic');
      setIndication('ช่วยให้นอนหลับ ลดความกังวลและกระวนกระวาย');
    }
  };

  if (!isOpen) return null;

  const activeDrugName = selectedPreset === 'custom' ? customDrugName.trim() : selectedPreset;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDrugName) {
      alert('กรุณาเลือกหรือระบุชื่อยา');
      return;
    }
    if (!customSig.trim()) {
      alert('กรุณาระบุวิธีการใช้ยา');
      return;
    }

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      name: activeDrugName,
      category,
      sig: customSig.trim(),
      indication: indication.trim() || 'ควบคุมอาการทางจิตเวช',
      adherence: Math.min(100, Math.max(0, parseInt(adherence) || 100)),
      notes: notes.trim() || undefined,
      startDate: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl shadow-2xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">เพิ่มรายการยาผู้ป่วย</h3>
              <p className="text-xs text-slate-500">สำหรับ {patient.name} (HN: {patient.hn})</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Requirement 3: 3 Drug Groups Dropdown / Scrollable selector */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 flex items-center justify-between">
              <span>1. เลือกรายการยา (3 กลุ่มยาจิตเวชหลัก / แถบเลื่อน): *</span>
              <span className="text-[11px] text-rose-600 font-medium">3 กลุ่มมาตรฐาน</span>
            </label>

            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full p-2.5 bg-rose-50/30 border border-rose-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold text-slate-800 text-xs"
            >
              <optgroup label="3.1 Antipsychotic drugs">
                {STANDARD_DRUG_GROUPS.antipsychotic.drugs.map(drug => (
                  <option key={drug} value={drug}>💊 {drug}</option>
                ))}
              </optgroup>
              <optgroup label="3.2 กลุ่มยา SSRIs">
                {STANDARD_DRUG_GROUPS.ssri.drugs.map(drug => (
                  <option key={drug} value={drug}>💊 {drug}</option>
                ))}
              </optgroup>
              <optgroup label="3.3 กลุ่มยา Sedative">
                {STANDARD_DRUG_GROUPS.sedative.drugs.map(drug => (
                  <option key={drug} value={drug}>💊 {drug}</option>
                ))}
              </optgroup>
              <optgroup label="รายการยาอื่นๆ">
                <option value="custom">✏️ รายการยาอื่นๆ (เขียนระบุชื่อยาเอง)</option>
              </optgroup>
            </select>

            {/* Custom Drug Input when "custom" is selected */}
            {selectedPreset === 'custom' && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <label className="block font-medium text-slate-600 mb-1">
                  ระบุชื่อยาและขนาดยาอื่นๆ: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Clozapine 100 mg, Sodium Valproate 200 mg, Quetiapine 25 mg"
                  value={customDrugName}
                  onChange={(e) => setCustomDrugName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Requirement 4: 6-slot Sig Builder (ช่องที่ 1 - 6) */}
          <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                2. วิธีการใช้ยา (ช่อง 6 ช่อง ติ๊กเลือกการรับประทาน)
              </span>
              <span className="text-[10px] text-slate-500 font-medium">คำนวณ Sig อัตโนมัติ</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {/* ช่องที่ 1: ใส่เฉพาะตัวเลข ระบุจำนวนเม็ดที่รับประทาน */}
              <div className="col-span-1 bg-white p-2 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  ช่อง 1: เม็ด
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={doseTab}
                  onChange={(e) => setDoseTab(e.target.value)}
                  placeholder="1"
                  className="w-full p-1 text-center font-bold text-slate-900 bg-rose-50/30 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              {/* ช่องที่ 2: ก่อน/หลังอาหาร */}
              <div className="col-span-1 bg-white p-2 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  ช่อง 2: มื้อ
                </label>
                <select
                  value={mealTiming}
                  onChange={(e) => setMealTiming(e.target.value as any)}
                  className="w-full p-1 text-xs font-semibold text-slate-800 bg-rose-50/30 border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-300"
                >
                  <option value="หลังอาหาร">หลังอาหาร</option>
                  <option value="ก่อนอาหาร">ก่อนอาหาร</option>
                  <option value="พร้อมอาหาร">พร้อมอาหาร</option>
                  <option value="ก่อนนอน">ก่อนนอน</option>
                </select>
              </div>

              {/* ช่องที่ 3: เช้า */}
              <button
                type="button"
                onClick={() => setTakeMorning(!takeMorning)}
                className={`col-span-1 p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  takeMorning
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] text-slate-500">ช่อง 3</span>
                <span className="text-xs">🌅 เช้า</span>
                {takeMorning && <Check className="w-3 h-3 text-amber-700" />}
              </button>

              {/* ช่องที่ 4: กลางวัน */}
              <button
                type="button"
                onClick={() => setTakeNoon(!takeNoon)}
                className={`col-span-1 p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  takeNoon
                    ? 'bg-orange-100 text-orange-900 border-orange-300 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] text-slate-500">ช่อง 4</span>
                <span className="text-xs">☀️ เที่ยง</span>
                {takeNoon && <Check className="w-3 h-3 text-orange-700" />}
              </button>

              {/* ช่องที่ 5: เย็น */}
              <button
                type="button"
                onClick={() => setTakeEvening(!takeEvening)}
                className={`col-span-1 p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  takeEvening
                    ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] text-slate-500">ช่อง 5</span>
                <span className="text-xs">🌇 เย็น</span>
                {takeEvening && <Check className="w-3 h-3 text-rose-700" />}
              </button>

              {/* ช่องที่ 6: ก่อนนอน */}
              <button
                type="button"
                onClick={() => setTakeBedtime(!takeBedtime)}
                className={`col-span-1 p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  takeBedtime
                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300 shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] text-slate-500">ช่อง 6</span>
                <span className="text-xs">🌙 ก่อนนอน</span>
                {takeBedtime && <Check className="w-3 h-3 text-indigo-700" />}
              </button>
            </div>

            {/* Live Sig Preview / Editable Box */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-600">ข้อความวิธีใช้ยา (Sig):</span>
                <button
                  type="button"
                  onClick={() => setIsEditingSigManually(!isEditingSigManually)}
                  className="text-[10px] text-rose-600 hover:underline font-semibold"
                >
                  {isEditingSigManually ? '✓ ใช้ค่าคำนวณอัตโนมัติ' : '✏️ ปรับแก้ข้อความเอง'}
                </button>
              </div>
              <input
                type="text"
                required
                value={customSig}
                onChange={(e) => {
                  setCustomSig(e.target.value);
                  setIsEditingSigManually(true);
                }}
                className="w-full p-2 bg-white border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          {/* Category & Adherence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">หมวดยา (Category):</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium"
              >
                <option value="Antipsychotic">Antipsychotic (ยารักษาโรคจิต)</option>
                <option value="Antidepressant">Antidepressant (SSRIs / ยาต้านเศร้า)</option>
                <option value="Anxiolytic">Anxiolytic / Sedative (ยานอนหลับ/คลายกังวล)</option>
                <option value="Antiparkinson">Antiparkinsonian (Trihexyphenidyl / แก้สั่น)</option>
                <option value="Mood Stabilizer">Mood Stabilizer (ยาปรับอารมณ์)</option>
                <option value="General">Somatic / ยาโรคประจำตัวทั่วไป</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ความร่วมมือการใช้ยา (Adherence %):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={adherence}
                onChange={(e) => setAdherence(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 font-bold"
              />
            </div>
          </div>

          {/* Indication */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ข้อบ่งชี้ (Indication):</label>
            <input
              type="text"
              placeholder="เช่น ควบคุมอาการประสาทหลอน, ปรับสมดุลอารมณ์, ช่วยการนอน"
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">หมายเหตุ / คำเตือนเภสัชกรรม:</label>
            <input
              type="text"
              placeholder="เช่น ทานพร้อมอาหาร, ห้ามดื่มแอลกอฮอล์, ระวังอาการง่วงซึม"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Pill className="w-4 h-4" />
              <span>บันทึกรายการยา</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
