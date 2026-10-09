import React, { useState } from 'react';
import { Home, Plus, Calendar, Users, AlertTriangle, CheckCircle2, Image as ImageIcon, ExternalLink, X } from 'lucide-react';
import { HomeVisitRecord, Patient } from '../types.ts';

interface HomeVisitTabProps {
  patient: Patient;
  homeVisits: HomeVisitRecord[];
  onOpenAddHomeVisit: () => void;
}

export const HomeVisitTab: React.FC<HomeVisitTabProps> = ({
  patient,
  homeVisits,
  onOpenAddHomeVisit
}) => {
  const patientVisits = homeVisits.filter(hv => hv.patientId === patient.id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Overview & Action Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-xl">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                บันทึกการเยี่ยมบ้านของทีมสหวิชาชีพ (Multidisciplinary Home Visit)
              </h3>
              <p className="text-[11px] text-slate-500">
                ติดตามการใช้ยา สภาพแวดล้อมที่บ้าน การดูแลของครอบครัว พร้อมรูปถ่ายแนบ: {patient.name} (HN: {patient.hn})
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddHomeVisit}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> บันทึกการเยี่ยมบ้านใหม่
          </button>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {patientVisits.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-pink-100 text-center text-slate-400 text-xs space-y-2">
            <Home className="w-10 h-10 mx-auto text-purple-200" />
            <p className="font-medium text-slate-600">ยังไม่มีบันทึกการเยี่ยมบ้านสำหรับผู้ป่วยรายนี้</p>
            <p className="text-[11px] text-slate-400">
              กดปุ่ม "+ บันทึกการเยี่ยมบ้านใหม่" เพื่อบันทึกปัญหาที่พบ การช่วยเหลือ และแนบรูปถ่ายซองยา/สภาพบ้าน
            </p>
          </div>
        ) : (
          patientVisits.map((visit) => (
            <div key={visit.id} className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 space-y-3.5 text-xs">
              {/* Visit Header */}
              <div className="flex items-center justify-between pb-2 border-b border-pink-50 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    วันที่เยี่ยมบ้าน: {visit.date}
                  </span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200 font-medium">
                    ผู้บันทึก: {visit.recordedBy}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>ทีมผู้ร่วมเยี่ยม: <strong className="text-slate-700">{visit.teamMembers}</strong></span>
                </div>
              </div>

              {/* 3 Columns/Sections: Environment, Problems, Follow-up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Problems Found */}
                <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 space-y-1">
                  <strong className="text-rose-900 flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> ปัญหาที่พบในการเยี่ยมบ้าน:
                  </strong>
                  <p className="text-slate-700 leading-relaxed text-[11px] whitespace-pre-line">
                    {visit.problemsFound || 'ไม่พบปัญหาสำคัญ'}
                  </p>
                </div>

                {/* Follow-up & Interventions */}
                <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100 space-y-1">
                  <strong className="text-teal-900 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> การติดตามและการช่วยเหลือของทีม:
                  </strong>
                  <p className="text-slate-700 leading-relaxed text-[11px] whitespace-pre-line">
                    {visit.followupDetails || 'ติดตามดูแลตามมาตรฐาน'}
                  </p>
                </div>
              </div>

              {/* Environment notes & Action plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[11px]">
                {visit.environmentNotes && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <strong className="text-slate-800 block mb-0.5">สภาพแวดล้อมที่บ้าน / ผู้ดูแลครอบครัว:</strong>
                    <p className="text-slate-600">{visit.environmentNotes}</p>
                  </div>
                )}
                {visit.actionPlan && (
                  <div className="bg-purple-50/40 p-3 rounded-xl border border-purple-100">
                    <strong className="text-purple-900 block mb-0.5">แผนการดูแลต่อเนื่อง:</strong>
                    <p className="text-purple-800">{visit.actionPlan}</p>
                  </div>
                )}
              </div>

              {/* Attached Images Gallery */}
              {visit.images && visit.images.length > 0 && (
                <div className="pt-2 border-t border-pink-50 space-y-2">
                  <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                    รูปภาพประกอบการเยี่ยมบ้าน ({visit.images.length} รูป):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {visit.images.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className="h-24 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 hover:shadow-md transition relative group"
                      >
                        <img
                          src={img}
                          alt={`รูปที่ ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px]">
                          <span>คลิกดูรูปใหญ่</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal for Full Image View */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-2 bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white text-slate-700 hover:text-black p-1.5 rounded-full shadow-lg border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="รูปภาพขนาดเต็ม"
              className="max-h-[82vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
