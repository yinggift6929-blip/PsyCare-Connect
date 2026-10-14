import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  X, 
  Copy, 
  Check, 
  QrCode, 
  RefreshCw, 
  Laptop, 
  Tablet, 
  Wifi, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import QRCode from 'qrcode';

interface MultiDeviceLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDevicesCount: number;
  lastSyncTimestamp: string | null;
  onForceSync: () => Promise<void>;
  isSyncing: boolean;
}

export const MultiDeviceLinkModal: React.FC<MultiDeviceLinkModalProps> = ({
  isOpen,
  onClose,
  activeDevicesCount,
  lastSyncTimestamp,
  onForceSync,
  isSyncing
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      setAppUrl(currentUrl);

      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#881337', // deep rose/burgundy
          light: '#ffffff'
        }
      })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard && appUrl) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 max-h-[92vh] overflow-y-auto custom-scrollbar space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                เชื่อมโยงข้อมูลทุกอุปกรณ์ (Multi-Device Connect)
              </h3>
              <p className="text-xs text-rose-600 font-medium">
                ซิงค์ข้อมูลผู้ป่วยและเวชระเบียนตรงกันแบบ Real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Card */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-4 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-900">
                ระบบเชื่อมต่อ Real-time Stream Active
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              ทุกอุปกรณ์ที่เปิดอยู่จะได้รับข้อมูลที่อัปเดตทันทีภายในไม่กี่วินาที
            </p>
            {lastSyncTimestamp && (
              <p className="text-[10px] text-slate-400">
                ซิงค์ล่าสุด: {lastSyncTimestamp}
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <div className="text-xl font-black text-emerald-800">
              {Math.max(1, activeDevicesCount)}
            </div>
            <div className="text-[10px] font-bold text-emerald-700">
              เครื่องที่เชื่อมต่อ
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="text-center space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
          <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-rose-150">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Scan to open on another device" 
                className="w-48 h-48 mx-auto rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                <QrCode className="w-12 h-12 animate-pulse text-rose-300" />
              </div>
            )}
          </div>

          <p className="text-xs font-bold text-slate-800">
            📱 ใช้มือถือหรือแท็บเล็ตสแกน QR Code นี้
          </p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            เพื่อเปิดระบบบนอุปกรณ์อื่น ข้อมูลผู้ป่วย บันทึกยา SOAP DRPs และผลประเมินจะแสดงตรงกันทันที
          </p>
        </div>

        {/* App URL Copy Box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 block">
            หรือเปิดด้วยลิงก์ URL นี้บนอุปกรณ์อื่น:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 p-2.5 bg-slate-50 border border-rose-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>คัดลอกแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Device Types Supported */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-[11px]">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <Laptop className="w-4 h-4 text-rose-500 mx-auto" />
            <div className="font-bold text-slate-800">คอมพิวเตอร์</div>
            <div className="text-[10px] text-slate-400">PC & Mac</div>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <Tablet className="w-4 h-4 text-teal-600 mx-auto" />
            <div className="font-bold text-slate-800">แท็บเล็ต / iPad</div>
            <div className="text-[10px] text-slate-400">พกพาสะดวก</div>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <Smartphone className="w-4 h-4 text-indigo-600 mx-auto" />
            <div className="font-bold text-slate-800">สมาร์ทโฟน</div>
            <div className="text-[10px] text-slate-400">iOS & Android</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-rose-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onForceSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-rose-600' : ''}`} />
            <span>{isSyncing ? 'กำลังดึงข้อมูลล่าสุด...' : 'ดึงข้อมูลล่าสุดเดี๋ยวนี้'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            เสร็จสิ้น
          </button>
        </div>

      </div>
    </div>
  );
};
