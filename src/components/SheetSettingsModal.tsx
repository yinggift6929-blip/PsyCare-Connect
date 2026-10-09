import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  Download, 
  X, 
  Layers, 
  HelpCircle,
  Database
} from 'lucide-react';
import { REQUIRED_TABS } from '../services/googleSheets.ts';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto custom-scrollbar space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                ศูนย์จัดการ Google Sheet ซิงค์ข้อมูลข้ามอุปกรณ์
              </h3>
              <p className="text-xs text-slate-500">
                เชื่อมต่อและจัดเก็บข้อมูลการบริบาลจิตเวชแบบถาวร ไม่สูญหายเมื่อเปิดบนอุปกรณ์ใดๆ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
              className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={handleSaveId}
              className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
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
        <div className="bg-pink-50/40 p-4 rounded-xl border border-pink-100 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-pink-600" />
              โครงสร้างแท็บใน Google Sheet ({REQUIRED_TABS.length} แท็บ)
            </h4>
            <button
              onClick={onInitializeHeaders}
              disabled={isSyncing}
              className="text-xs bg-white text-pink-700 hover:bg-pink-100 border border-pink-200 px-3 py-1 rounded-lg font-medium shadow-2xs transition"
            >
              ตรวจสอบและสร้างหัวตาราง (Init Headers)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-700">
            {REQUIRED_TABS.map((tab) => (
              <div key={tab.title} className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-pink-100/60">
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
            <Database className="w-4 h-4 text-pink-600" />
            การควบคุมข้อมูลและการซิงค์ (Manual Sync Controls)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Force Push */}
            <button
              onClick={onForcePush}
              disabled={isSyncing}
              className="p-3 bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 rounded-xl text-left transition flex items-start gap-2.5"
            >
              <Upload className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
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
    </div>
  );
};
