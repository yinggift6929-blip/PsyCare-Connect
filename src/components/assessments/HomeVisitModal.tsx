import React, { useState } from 'react';
import { 
  Home, 
  X, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Users, 
  AlertTriangle, 
  Calendar,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { HomeVisitRecord, Patient } from '../../types.ts';

interface HomeVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (record: Partial<HomeVisitRecord>, nextAppDate?: string, nextAppType?: 'home_visit' | 'telemed' | 'clinic', nextAppObj?: string) => void;
}

// Common psychiatric home visit problems
const COMMON_HOME_VISIT_PROBLEMS = [
  'ลืมรับประทานยา / ขาดยาต่อเนื่อง',
  'พบยาเก่าหรือยาเหลือค้างสะสมจำนวนมากในบ้าน (Hoarding)',
  'เก็บรักษายาไม่ถูกต้อง / ยาชื้น / ถูกแสงแดด',
  'รับประทานยาซ้ำซ้อน / รับประทานยาผิดเวลา / ผิดขนาด',
  'ผู้ป่วยหยุดยาเองเนื่องจากเกิดผลข้างเคียง (EPS / ง่วงมาก / น้ำลายไหล)',
  'น้ำลายไหลยืดเลอะหมอนตอนนอนหลับ (Sialorrhea / Drooling)',
  'อาการสั่น / เดินเซ / กล้ามเนื้อเกร็ง (EPS / Parkinsonism)',
  'มีอาการกำเริบ / หูแว่ว / หวาดระแวง / หงุดหงิดก้าวร้าว',
  'ผู้ดูแลเหนื่อยล้า (Caregiver burden) / ขาดผู้ช่วยจัดยาและเตือน',
  'ดื่มสุราหรือใช้สารเสพติด / น้ำกระท่อม ร่วมกับการใช้ยา',
  'ปัญหาเศรษฐกิจ / ขาดแคลนค่าเดินทางมารับยาที่โรงพยาบาล',
  'ปฏิเสธการกินยา / ซ่อนยาใต้ลิ้น / กลืนยายาก',
  'อาการง่วงซึมมากเกินไปในเวลากลางวัน รบกวนการทำงาน',
  'ท้องผูกรุนแรงจากผลของยาต้านอาการทางจิต',
  'สภาพบ้านไม่ปลอดภัย / ขาดสุขอนามัยที่เหมาะสม',
  'อื่นๆ (ระบุเอง)'
];

export const HomeVisitModal: React.FC<HomeVisitModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [teamMembers, setTeamMembers] = useState('ภญ.สุพิชฌาย์ (เภสัชกร), พว.ประภัสสร (พยาบาล), นจต.นภัสสร (นักจิตวิทยา)');
  const [environmentNotes, setEnvironmentNotes] = useState('');
  
  // Requirement 3: Selected problems from scrolling bar & custom notes
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [customProblemNotes, setCustomProblemNotes] = useState('');

  const [followupDetails, setFollowupDetails] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  
  // Requirement 4: Continuous appointment tracking
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');
  const [nextAppointmentType, setNextAppointmentType] = useState<'home_visit' | 'telemed' | 'clinic'>('home_visit');
  const [nextAppointmentObjective, setNextAppointmentObjective] = useState('');

  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [recordedBy, setRecordedBy] = useState('ทีมสหวิชาชีพคลินิกจิตเวช');

  if (!isOpen) return null;

  const isOtherSelected = selectedProblems.includes('อื่นๆ (ระบุเอง)');

  const toggleProblem = (item: string) => {
    setSelectedProblems(prev => 
      prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (กรุณาเลือกรูปขนาดไม่เกิน 3MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages(prev => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Compile problems text
    const activeProblemList = selectedProblems.filter(p => p !== 'อื่นๆ (ระบุเอง)');
    if (isOtherSelected && customProblemNotes.trim()) {
      activeProblemList.push(`อื่นๆ: ${customProblemNotes.trim()}`);
    }

    const fullProblemsText = activeProblemList.join(', ');

    if (!fullProblemsText && !followupDetails.trim()) {
      alert('กรุณาเลือกปัญหาที่พบจากการเยี่ยมบ้าน หรือกรอกรายละเอียดการติดตาม');
      return;
    }

    onSave({
      patientId: patient.id,
      hn: patient.hn,
      date,
      teamMembers: teamMembers.trim(),
      environmentNotes: environmentNotes.trim(),
      selectedCommonProblems: selectedProblems,
      customProblemNotes: customProblemNotes.trim(),
      problemsFound: fullProblemsText,
      followupDetails: followupDetails.trim(),
      actionPlan: actionPlan.trim(),
      nextAppointmentDate: nextAppointmentDate || undefined,
      nextAppointmentType,
      images,
      recordedBy: recordedBy.trim()
    }, nextAppointmentDate || undefined, nextAppointmentType, nextAppointmentObjective.trim() || undefined);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto custom-scrollbar space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-2xl">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                แบบบันทึกการเยี่ยมบ้านทีมสหวิชาชีพ (Home Visit Record)
              </h3>
              <p className="text-xs text-slate-500">
                ผู้ป่วย: {patient.name} (HN: {patient.hn}) • {patient.address || 'ในเขตรับผิดชอบ'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">วันที่เยี่ยมบ้าน: *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ทีมสหวิชาชีพผู้ร่วมเยี่ยม:</label>
              <input
                type="text"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                placeholder="เช่น เภสัชกร, พยาบาล, นักจิตวิทยา, อสม."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              สภาพแวดล้อมที่บ้าน / ผู้ดูแลในครอบครัว (Environment & Family Care):
            </label>
            <textarea
              rows={2}
              placeholder="บันทึกสภาพบ้าน ความเป็นอยู่ ความปลอดภัย ที่เก็บยา และความร่วมมือของผู้ดูแลในครอบครัว..."
              value={environmentNotes}
              onChange={(e) => setEnvironmentNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Requirement 3: Scrolling horizontal bar for common home visit problems */}
          <div className="bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                ปัญหาที่พบบ่อยขณะเยี่ยมบ้าน (แถบเลื่อนแนวนอน):
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => sliderRef.current?.scrollBy({ left: -250, behavior: 'smooth' })}
                  className="p-1 px-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold shadow-2xs transition"
                  title="เลื่อนซ้าย"
                >
                  ◀ เลื่อนซ้าย
                </button>
                <button
                  type="button"
                  onClick={() => sliderRef.current?.scrollBy({ left: 250, behavior: 'smooth' })}
                  className="p-1 px-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold shadow-2xs transition"
                  title="เลื่อนขวา"
                >
                  เลื่อนขวา ▶
                </button>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full ml-1">
                  เลือกแล้ว {selectedProblems.length} รายการ
                </span>
              </div>
            </div>

            {/* Horizontal Scrolling Bar */}
            <div 
              ref={sliderRef}
              className="flex gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth custom-scrollbar"
            >
              {COMMON_HOME_VISIT_PROBLEMS.map((prob) => {
                const isSelected = selectedProblems.includes(prob);
                return (
                  <button
                    key={prob}
                    type="button"
                    onClick={() => toggleProblem(prob)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1.5 border shadow-2xs shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300'
                        : 'bg-white text-slate-700 hover:bg-indigo-50 border-slate-200'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{prob}</span>
                  </button>
                );
              })}
            </div>

            {/* Expandable Custom Problem Notes when "อื่นๆ" is selected */}
            {isOtherSelected && (
              <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-1.5 animate-in fade-in duration-200">
                <label className="block font-bold text-indigo-900 text-[11px]">
                  ✍️ พิมพ์รายละเอียดเพิ่มเติมสำหรับปัญหา "อื่นๆ":
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="พิมพ์รายละเอียดปัญหาเฉพาะที่พบจากการเยี่ยมบ้านรายนี้เพิ่มเติม..."
                  value={customProblemNotes}
                  onChange={(e) => setCustomProblemNotes(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-indigo-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              รายละเอียดการติดตามและการช่วยเหลือของทีม (Follow-up & Interventions): *
            </label>
            <textarea
              rows={2}
              required
              placeholder="เช่น คัดแยกยาหมดอายุทิ้ง, จัดยากระบอก 7 วัน (Pill Box), ให้คำแนะนำลดน้ำลายไหลย้อย, สอนญาติเทคนิคการสื่อสารเชิงบวก..."
              value={followupDetails}
              onChange={(e) => setFollowupDetails(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              แผนการดูแลต่อเนื่อง (Action Plan & Continuity of Care):
            </label>
            <input
              type="text"
              placeholder="เช่น ประสาน อสม. ช่วยติดตามการกินยาสัปดาห์ละ 1 ครั้ง, นัดพบจิตแพทย์ที่คลินิก 18 ต.ค."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Requirement 4: Setting Next Appointment for continuous follow-up */}
          <div className="p-3 bg-pink-50/40 rounded-xl border border-pink-200 space-y-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-pink-600" />
              กำหนดวันนัดติดตามต่อเนื่อง (Next Follow-up Appointment):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">วันนัดครั้งถัดไป:</label>
                <input
                  type="date"
                  value={nextAppointmentDate}
                  onChange={(e) => setNextAppointmentDate(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-pink-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">ประเภทการนัด:</label>
                <select
                  value={nextAppointmentType}
                  onChange={(e) => setNextAppointmentType(e.target.value as any)}
                  className="w-full p-1.5 text-xs bg-white border border-pink-200 rounded-lg"
                >
                  <option value="home_visit">🏠 เยี่ยมบ้าน (Home Visit)</option>
                  <option value="telemed">📱 โทร/ติดต่อ Telemed</option>
                  <option value="clinic">🏥 มาตรวจที่คลินิกจิตเวช</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">วัตถุประสงค์การติดตามต่อเนื่อง:</label>
              <input
                type="text"
                placeholder="เช่น เยี่ยมบ้านติดตามนับเม็ดยาซ้ำ, ฉีดยา Depot เข็มถัดไป, ประเมินอาการทางจิต"
                value={nextAppointmentObjective}
                onChange={(e) => setNextAppointmentObjective(e.target.value)}
                className="w-full p-1.5 text-xs bg-white border border-pink-200 rounded-lg"
              />
            </div>
          </div>

          {/* Image Upload & Attachment Section */}
          <div className="bg-purple-50/40 p-3.5 rounded-xl border border-purple-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                แนบรูปภาพการเยี่ยมบ้าน (ซองยา / ที่เก็บยา / สภาพแวดล้อม):
              </span>
              <span className="text-[11px] text-purple-700 font-medium">
                {images.length} รูปภาพ
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <label className="cursor-pointer bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 px-3 py-2 rounded-xl text-center font-medium transition flex items-center justify-center gap-1.5 shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>เลือกรูปภาพจากเครื่อง / ถ่ายภาพ</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex gap-1.5">
                <input
                  type="url"
                  placeholder="หรือวางลิงก์รูปภาพ (Image URL)..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 p-2 text-xs bg-white border border-purple-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  เพิ่ม URL
                </button>
              </div>
            </div>

            {/* Thumbnail Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-purple-200 h-24 bg-slate-100">
                    <img
                      src={img}
                      alt={`ภาพเยี่ยมบ้าน ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-lg transition"
                      title="ลบรูปภาพนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ผู้บันทึกข้อมูล:</label>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition"
            >
              บันทึกการเยี่ยมบ้าน & ซิงค์ข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
