import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  Download, 
  Layers, 
  HelpCircle,
  Database
} from 'lucide-react';
import { REQUIRED_TABS } from '../services/googleSheets.ts';
import { PsychiatricModalFrame } from './common/PsychiatricModalFrame.tsx';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetId: string;
  onUpdateSpreadsheetId: (id: string) => void;
  onInitializeHeaders: () => void;
  onForcePush: () => void;
  onForcePull: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  spreadsheetId,
  onUpdateSpreadsheetId,
  onInitializeHeaders,
  onForcePush,
  onForcePull,
  isSyncing,
  lastSyncTime
}) => {
  const [sheetIdInput, setSheetIdInput] = useState(spreadsheetId);

  if (!isOpen) return null;

  const handleSaveId = () => {
    if (!sheetIdInput.trim()) {
      alert('กรุณาระบุ Google Sheet ID');
      return;
    }
    onUpdateSpreadsheetId(sheetIdInput.trim());
  };

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return (
    <PsychiatricModalFrame
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      icon={<FileSpreadsheet className="w-5 h-5 text-white" />}
      title="ศูนย์จัดการ Google Sheet ซิงค์ข้อมูลข้ามอุปกรณ์"
      subtitle="เชื่อมต่อและจัดเก็บข้อมูลการบริบาลจิตเวชแบบถาวร ไม่สูญหายเมื่อเปิดบนอุปกรณ์ใดๆ"
      badgeText="Cloud Storage"
      badgeColor="emerald"
      confidentialNotice="การเชื่อมโยงฐานข้อมูลภายนอก (Google Cloud & Sheets EMR)"
    >
      <div className="space-y-5">


        {/* Sheet ID Configuration */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Google Spreadsheet ID ปัจจุบัน:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sheetIdInput}
              onChange={(e) => setSheetIdInput(e.target.value)}
              placeholder="เช่น 1ILefnwJLb1fsKLqjlRElV4E04dMmBUXFpq2wZXtPTVw"
              className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <button
              onClick={handleSaveId}
              className="bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition transform active:scale-95"
            >
              บันทึก ID
            </button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> เปิดดูไฟล์ใน Google Sheets จริง (แท็บใหม่)
            </a>
            {lastSyncTime && (
              <span className="text-[11px] text-slate-500">
                ซิงค์ล่าสุด: {lastSyncTime}
              </span>
            )}
          </div>
        </div>

        {/* Sheet Structure & Tabs Checklist */}
        <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-500" />
              โครงสร้างแท็บใน Google Sheet ({REQUIRED_TABS.length} แท็บ)
            </h4>
            <button
              onClick={onInitializeHeaders}
              disabled={isSyncing}
              className="text-xs bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg font-medium shadow-2xs transition"
            >
              ตรวจสอบและสร้างหัวตาราง (Init Headers)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-700">
            {REQUIRED_TABS.map((tab) => (
              <div key={tab.title} className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-rose-100/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="font-medium truncate">{tab.title}</span>
                <span className="text-[10px] text-slate-400">({tab.headers.length} คอลัมน์)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Synchronization Actions */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-rose-500" />
            การควบคุมข้อมูลและการซิงค์ (Manual Sync Controls)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Force Push */}
            <button
              onClick={onForcePush}
              disabled={isSyncing}
              className="p-3 bg-rose-50/70 hover:bg-rose-100/70 text-rose-900 border border-rose-200 rounded-xl text-left transition flex items-start gap-2.5"
            >
              <Upload className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-xs">ส่งข้อมูลทั้งหมดขึ้น Sheet (Force Push)</strong>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  อัปเดตข้อมูลจากแอปนี้ทั้งหมดไปยังทุกแท็บใน Google Sheet
                </p>
              </div>
            </button>

            {/* Force Pull */}
            <button
              onClick={onForcePull}
              disabled={isSyncing}
              className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-left transition flex items-start gap-2.5"
            >
              <Download className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-xs">ดึงข้อมูลจาก Sheet ล่าสุด (Force Pull)</strong>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  โหลดข้อมูลผู้ป่วยและบันทึกทั้งหมดที่มีใน Google Sheet ลงมาในแอป
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Explanation Footer */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            ระบบจะทำการบันทึกข้อมูลแบบคู่ขนาน (Dual-Sync) ลงใน Local Cache ของเบราว์เซอร์และ Google Sheets อัตโนมัติทุกครั้งที่มีการเพิ่ม แก้ไข หรือส่งต่อข้อมูล ทำให้ข้อมูลไม่สูญหายแม้เปิดในโทรศัพท์มือถือ แท็บเล็ต หรือคอมพิวเตอร์เครื่องอื่น
          </p>
        </div>
      </div>
    </PsychiatricModalFrame>
  );
};

