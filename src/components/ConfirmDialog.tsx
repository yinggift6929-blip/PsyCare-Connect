import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'ยืนยันการลบ',
  cancelLabel = 'ยกเลิก',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">

      <div className="relative bg-gradient-to-b from-[#fdfbfb] via-[#ffffff] to-[#faf6f8] rounded-3xl max-w-md w-full shadow-[0_25px_60px_-15px_rgba(20,10,30,0.35)] border border-rose-200/80 overflow-hidden">
        {/* Multidisciplinary Top Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 via-teal-400 to-amber-400" />
        
        {/* Institutional Sub-bar */}
        <div className="px-5 py-2 bg-gradient-to-r from-rose-50/90 to-slate-50/90 border-b border-rose-100 flex items-center justify-between text-[11px] text-slate-600">
          <span className="font-bold text-slate-800">ระบบความปลอดภัยเวชระเบียนคลินิก</span>
          <span className="text-[10px] text-rose-700 font-semibold">PsyCare Safety Confirmation</span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
              {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition active:scale-95 cursor-pointer ${
                isDestructive 
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800' 
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

