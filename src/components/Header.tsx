import React from 'react';
import { User } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  Pill, 
  Stethoscope, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Settings2,
  Sparkles,
  Bell
} from 'lucide-react';
import { RoleType } from '../types.ts';

interface HeaderProps {
  currentRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  user: User | null;
  spreadsheetId: string;
  isSyncing: boolean;
  syncSuccess: boolean | null;
  lastSyncTime: string | null;
  dueTodayCount: number;
  onOpenDailyAlert: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onSyncNow: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  user,
  spreadsheetId,
  isSyncing,
  syncSuccess,
  lastSyncTime,
  dueTodayCount,
  onOpenDailyAlert,
  onLogin,
  onLogout,
  onSyncNow,
  onOpenSettings
}) => {
  const sheetEditUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return (
    <header className="bg-gradient-to-r from-pink-900 via-rose-900 to-purple-950 text-white sticky top-0 z-40 shadow-lg border-b border-pink-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Clinic Title */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center shadow-inner border border-pink-300/40 shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight truncate">
                  PsyCare Sheet Connect
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-pink-950/70 text-pink-200 px-2.5 py-0.5 rounded-full border border-pink-500/30">
                  <Sparkles className="w-3 h-3 text-pink-300" /> สหวิชาชีพจิตเวช
                </span>
              </div>
              <p className="text-[11px] text-pink-200/80 truncate">
                บริบาลเภสัชกรรม • พยาบาล • นักจิตวิทยา • ซิงค์อัตโนมัติข้ามอุปกรณ์
              </p>
            </div>
          </div>

          {/* Role Switcher Center Pill */}
          <div className="hidden lg:flex items-center bg-black/25 backdrop-blur-md rounded-2xl p-1 border border-pink-500/20">
            <span className="text-[11px] font-medium text-pink-200 px-2">บทบาท:</span>
            <button
              onClick={() => onSelectRole('pharmacist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentRole === 'pharmacist'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-pink-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-pink-200" /> เภสัชกร (Pharmacist)
            </button>
            <button
              onClick={() => onSelectRole('nurse')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentRole === 'nurse'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-pink-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-200" /> พยาบาล (Nurse)
            </button>
            <button
              onClick={() => onSelectRole('psychologist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentRole === 'psychologist'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-pink-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-200" /> นักจิตวิทยา (Psychologist)
            </button>
          </div>

          {/* Right: Daily Alert Bell & Google Sheet & Auth Control */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Daily Due Followup Alert Bell (Requirement 5) */}
            <button
              onClick={onOpenDailyAlert}
              title="ดูรายชื่อผู้ป่วยที่ต้องติดตามวันนี้ (3 กลุ่ม: เยี่ยมบ้าน, Telemed, คลินิก)"
              className="relative p-2 bg-pink-800/80 hover:bg-pink-700 text-white rounded-xl border border-pink-400/30 transition flex items-center gap-1.5 shadow-xs"
            >
              <Bell className="w-4 h-4 text-pink-200" />
              <span className="hidden sm:inline text-xs font-bold">นัดวันนี้</span>
              {dueTodayCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                  {dueTodayCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2 bg-pink-950/40 p-1 sm:p-1.5 rounded-2xl border border-pink-400/20">
                {/* Sync Action Button */}
                <button
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  title="ซิงค์ข้อมูลล่าสุดกับ Google Sheet"
                  className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ทันที'}</span>
                </button>

                {/* Open Google Sheet Link */}
                <a
                  href={sheetEditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition shadow-sm"
                  title="เปิดดูไฟล์ Google Sheet จริง"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">เปิด Sheet</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </a>

                {/* Sheet Settings */}
                <button
                  onClick={onOpenSettings}
                  title="ตั้งค่า Google Sheet"
                  className="text-pink-200 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
                >
                  <Settings2 className="w-4 h-4" />
                </button>

                {/* User Info Avatar & Logout */}
                <div className="flex items-center gap-2 pl-1 border-l border-pink-700/50">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-7 h-7 rounded-full border border-pink-300"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <button
                    onClick={onLogout}
                    title="ออกจากระบบ Google"
                    className="text-pink-200 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-900/30 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Google Sign-in Official Styled Button + Settings */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onLogin}
                  className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition transform active:scale-95 border border-slate-200"
                  title="เข้าสู่ระบบ Google เพื่อเชื่อมต่อและบันทึกข้อมูลลง Google Sheet อัตโนมัติ"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>เชื่อมต่อ Google Sheet</span>
                </button>
                <button
                  onClick={onOpenSettings}
                  title="ตั้งค่า Sheet ID"
                  className="text-pink-200 hover:text-white p-2 rounded-xl bg-pink-950/40 hover:bg-pink-950/60 border border-pink-700/40 transition"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Sub-bar */}
        <div className="py-1.5 border-t border-pink-700/20 flex flex-wrap items-center justify-between text-[11px] text-pink-200">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ฐานข้อมูลกลางออนไลน์ (ซิงค์อัตโนมัติทุกอุปกรณ์ • ข้อมูลไม่หาย)
            </span>

            {user && (
              <>
                <span className="hidden sm:inline text-pink-300/60">•</span>
                <span className="flex items-center gap-1 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Google Sheet เชื่อมต่อแล้ว
                </span>
              </>
            )}

            <span className="hidden sm:inline text-pink-300/60">•</span>
            <span className="hidden sm:inline text-pink-200/90 truncate max-w-xs">
              Sheet ID: <code className="bg-pink-950/60 px-1.5 py-0.5 rounded text-[10px] text-pink-100">{spreadsheetId}</code>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <span className="text-pink-300/80">
                ซิงค์ล่าสุด: {lastSyncTime}
              </span>
            )}

            {/* Mobile Role Switcher */}
            <div className="flex lg:hidden items-center gap-1 bg-pink-950/40 p-0.5 rounded-lg border border-pink-600/30">
              <button
                onClick={() => onSelectRole('pharmacist')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'pharmacist' ? 'bg-pink-600 text-white' : 'text-pink-300'
                }`}
              >
                เภสัช
              </button>
              <button
                onClick={() => onSelectRole('nurse')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'nurse' ? 'bg-teal-600 text-white' : 'text-pink-300'
                }`}
              >
                พยาบาล
              </button>
              <button
                onClick={() => onSelectRole('psychologist')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'psychologist' ? 'bg-purple-600 text-white' : 'text-pink-300'
                }`}
              >
                จิตวิทยา
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
