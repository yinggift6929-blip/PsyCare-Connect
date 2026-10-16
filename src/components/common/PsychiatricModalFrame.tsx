import React from 'react';
import { X, ShieldCheck, HeartPulse, Brain, Activity, Lock } from 'lucide-react';

interface PsychiatricModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: string; // e.g. 'max-w-3xl', 'max-w-2xl', 'max-w-xl', 'max-w-4xl'
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  badgeText?: string;
  badgeColor?: 'rose' | 'emerald' | 'indigo' | 'amber' | 'sky';
  confidentialNotice?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PsychiatricModalFrame: React.FC<PsychiatricModalFrameProps> = ({
  isOpen,
  onClose,
  maxWidth = 'max-w-3xl',
  title,
  subtitle,
  icon,
  headerAction,
  badgeText,
  badgeColor = 'rose',
  confidentialNotice = 'เอกสารเวชระเบียนจิตเวชและความปลอดภัยทางคลินิก (Confidential Psychiatric Medical Record)',
  children,
  footer
}) => {
  if (!isOpen) return null;

  const badgeStyles = {
    rose: 'bg-rose-50 text-rose-800 border-rose-200/90',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/90',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/90',
    sky: 'bg-sky-50 text-sky-800 border-sky-200/90',
  }[badgeColor];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Ambient serene light glows in backdrop - soft calming therapeutic tones */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center select-none">
        <div className="w-[620px] h-[520px] bg-rose-400/12 rounded-full blur-3xl -translate-y-24 -translate-x-36" />
        <div className="w-[520px] h-[420px] bg-teal-400/12 rounded-full blur-3xl translate-y-36 translate-x-36" />
        <div className="w-[440px] h-[340px] bg-indigo-400/10 rounded-full blur-3xl translate-y-8" />
      </div>

      {/* Main Modal Card Container */}
      <div 
        className={`relative ${maxWidth} w-full rounded-3xl bg-gradient-to-b from-[#fdfbfc] via-[#ffffff] to-[#faf5f8] shadow-[0_25px_70px_-12px_rgba(25,12,35,0.4)] border border-rose-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 ring-1 ring-black/5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Multidisciplinary Top Clinical Stripe (Pharmacist, Nurse, Psychologist, Physician) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-400 via-teal-400 to-amber-400 shrink-0" />

        {/* Official Hospital / Psychiatric Clinical Institutional Header Ribbon */}
        <div className="px-5 sm:px-6 py-2 bg-gradient-to-r from-rose-50/95 via-pink-50/80 to-slate-50/90 border-b border-rose-100 flex items-center justify-between text-[11px] text-slate-600 shrink-0 select-none">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-100" />
            <span className="font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <span>ระบบบริบาลผู้ป่วยจิตเวชชุมชนและสุขภาพจิต</span>
              <span className="hidden sm:inline text-rose-600 font-semibold">(PsyCare Network)</span>
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden md:inline text-[10px] text-slate-500 font-medium">
              ทีมสหวิชาชีพ: เภสัชกร • พยาบาล • นักจิตวิทยา
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[10px] sm:text-[11px]">
            <span className="inline-flex items-center gap-1 bg-white/80 border border-rose-200/70 px-2 py-0.5 rounded-md font-semibold text-rose-700">
              <Lock className="w-3 h-3 text-rose-500" />
              <span>ความลับทางการแพทย์ (Confidential)</span>
            </span>
          </div>
        </div>

        {/* Decorative Formal Psychiatric Background Watermarks & Neural Synapses */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
          {/* Subtle Hospital Grid Texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.018]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="clinic-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#be185d" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#clinic-grid)" />
          </svg>

          {/* Top-Right: Stylized Psychiatric Brain Hemisphere & Neural Synapses */}
          <svg 
            className="absolute -top-10 -right-10 w-96 h-96 text-rose-500/[0.045] transform rotate-12"
            viewBox="0 0 200 200" 
            fill="currentColor"
          >
            {/* Brain Outline & Cortical Lobes */}
            <path d="M100 20 C70 20, 40 38, 40 75 C40 92, 50 108, 62 118 C58 135, 70 158, 92 165 C98 166, 100 180, 100 180 C100 180, 102 166, 108 165 C130 158, 142 135, 138 118 C150 108, 160 92, 160 75 C160 38, 130 20, 100 20 Z" />
            {/* Neural Synapse Nodes & Interconnections */}
            <circle cx="75" cy="60" r="14" opacity="0.6" />
            <circle cx="125" cy="60" r="14" opacity="0.6" />
            <circle cx="65" cy="98" r="12" opacity="0.5" />
            <circle cx="135" cy="98" r="12" opacity="0.5" />
            <circle cx="100" cy="125" r="16" opacity="0.7" />
            <circle cx="85" cy="150" r="9" opacity="0.4" />
            <circle cx="115" cy="150" r="9" opacity="0.4" />
            {/* Synaptic Pathway Lines */}
            <line x1="75" y1="60" x2="100" y2="125" stroke="currentColor" strokeWidth="3" opacity="0.5" />
            <line x1="125" y1="60" x2="100" y2="125" stroke="currentColor" strokeWidth="3" opacity="0.5" />
            <line x1="65" y1="98" x2="100" y2="125" stroke="currentColor" strokeWidth="3" opacity="0.5" />
            <line x1="135" y1="98" x2="100" y2="125" stroke="currentColor" strokeWidth="3" opacity="0.5" />
          </svg>

          {/* Bottom-Left: Calming Serenity Waves (Alpha / Theta Brainwaves of Mental Healing) */}
          <svg 
            className="absolute -bottom-8 -left-8 w-[420px] h-48 text-teal-500/[0.045] transform -rotate-2" 
            viewBox="0 0 400 150" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3.5"
          >
            <path d="M0,75 Q50,35 100,75 T200,75 T300,75 T400,75" />
            <path d="M0,100 Q60,60 120,100 T240,100 T360,100 T480,100" opacity="0.65" />
            <path d="M0,125 Q70,85 140,125 T280,125 T420,125" opacity="0.45" />
          </svg>

          {/* Bottom-Right Formal Institutional Watermark Emblem */}
          <div className="absolute right-6 bottom-10 opacity-[0.04] flex flex-col items-center justify-center text-slate-800">
            <HeartPulse className="w-44 h-44" />
            <span className="font-extrabold text-[10px] tracking-[0.25em] uppercase mt-1">
              Holistic Psychiatric Care &amp; Pharmacotherapy
            </span>
          </div>
        </div>

        {/* Modal Header Row */}
        <div className="relative z-10 px-5 sm:px-7 pt-4 pb-3 border-b border-rose-100 flex items-start justify-between gap-3 shrink-0 bg-white/70 backdrop-blur-xs">
          <div className="flex items-start gap-3 min-w-0">
            {icon ? (
              <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xs shrink-0 mt-0.5">
                {icon}
              </div>
            ) : (
              <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xs shrink-0 mt-0.5">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {title}
                </h2>
                {badgeText && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${badgeStyles}`}>
                    {badgeText}
                  </span>
                )}
              </div>
              {subtitle && (
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerAction}
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-xl transition cursor-pointer"
              title="ปิดหน้าต่าง (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="relative z-10 p-5 sm:p-7 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {children}
        </div>

        {/* Formal Institutional Footer & Confidentiality Notice */}
        <div className="relative z-10 px-5 sm:px-7 py-3 bg-gradient-to-r from-rose-50/80 via-white to-pink-50/80 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] text-center sm:text-left">
            <span className="p-1 bg-rose-100 text-rose-700 rounded-md shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span>{confidentialNotice}</span>
          </div>

          {footer && (
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              {footer}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
