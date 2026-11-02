import React from 'react';
import { User } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  Pill, 
  Stethoscope, 
  Brain, 
  Building2, 
  CheckCircle2, 
  LogOut, 
  Settings2, 
  Sparkles, 
  Bell, 
  BarChart3, 
  Send,
  UserCheck
} from 'lucide-react';
import { RoleType } from '../types.ts';
import { 
  TeamMember, 
  getTeamMembersByProfession 
} from '../data/teamMembers.ts';

interface HeaderProps {
  currentRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  activeTeamMember?: TeamMember;
  onSelectTeamMember?: (member: TeamMember) => void;
  user: User | null;
  spreadsheetId: string;
  isSyncing: boolean;
  syncSuccess: boolean | null;
  lastSyncTime: string | null;
  dueTodayCount: number;
  onOpenDailyAlert: () => void;
  onOpenMonthlyDashboard?: () => void;
  onOpenNotificationSettings?: () => void;
  isNotificationActive?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onSyncNow: () => void;
  onRefreshServerData?: () => void;
  onOpenSettings: () => void;
  onOpenDeviceSync?: () => void;
  activeDevicesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activeTeamMember,
  onSelectTeamMember,
  user,
  spreadsheetId,
  isSyncing,
  syncSuccess: _syncSuccess,
  lastSyncTime,
  dueTodayCount,
  onOpenDailyAlert,
  onOpenMonthlyDashboard,
  onOpenNotificationSettings,
  isNotificationActive,
  onLogin,
  onLogout,
  onSyncNow,
  onRefreshServerData,
  onOpenSettings,
  activeDevicesCount
}) => {
  const sheetEditUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return (
    <header className="bg-gradient-to-r from-pink-700 via-rose-700 to-pink-700 text-white sticky top-0 z-40 shadow-md border-b border-rose-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Clinic Title (กว้างขวาง สบายตา ไม่โดนบีบย่อ) */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-white text-rose-700 flex items-center justify-center shadow-xs shrink-0">
              <Brain className="w-5 h-5 text-rose-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight text-white">
                  PsyCare Sheet Connect
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/30 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-pink-200" /> สหวิชาชีพจิตเวช
                </span>
              </div>
              <p className="text-[11px] text-pink-100 font-medium truncate">
                ระบบบริบาลเภสัชกรรม • สหวิชาชีพคลินิกจิตเวช
              </p>
            </div>
          </div>

          {/* Multidisciplinary Role Switcher (แถบเลือกวิชาชีพแบบกะทัดรัด พร้อมเลือกผู้ปฏิบัติงานในตัว) */}
          <div className="hidden lg:flex items-center bg-black/15 backdrop-blur-md rounded-2xl p-1 border border-white/20 shadow-inner">
            <span className="text-[11px] font-bold text-pink-100 px-2">กลุ่มวิชาชีพ:</span>
            
            {/* Pharmacist */}
            <button
              onClick={() => onSelectRole('pharmacist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'pharmacist'
                  ? 'bg-white text-rose-900 shadow-sm font-extrabold'
                  : 'text-pink-100 hover:text-white hover:bg-white/15'
              }`}
            >
              <Pill className="w-3.5 h-3.5" /> 
              <span>ภญ.สุภิตา (เภสัชกร)</span>
            </button>

            {/* Nurse with inline quick selector */}
            <div className="relative inline-flex items-center">
              <button
                onClick={() => onSelectRole('nurse')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentRole === 'nurse'
                    ? 'bg-white text-teal-950 shadow-sm font-extrabold'
                    : 'text-pink-100 hover:text-white hover:bg-white/15'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> 
                <span>พยาบาลวิชาชีพ</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  currentRole === 'nurse' ? 'bg-teal-100 text-teal-900' : 'bg-white/20 text-white'
                }`}>
                  3
                </span>
              </button>

              {currentRole === 'nurse' && (
                <select
                  value={activeTeamMember?.id}
                  onChange={(e) => {
                    const found = getTeamMembersByProfession('nurse').find(m => m.id === e.target.value);
                    if (found && onSelectTeamMember) onSelectTeamMember(found);
                  }}
                  className="ml-1 text-[11px] bg-white text-teal-950 font-bold px-2 py-1 rounded-lg border border-teal-300 shadow-2xs cursor-pointer focus:outline-hidden"
                  title="เลือกรายชื่อพยาบาลผู้ปฏิบัติงาน"
                >
                  {getTeamMembersByProfession('nurse').map((nurse) => (
                    <option key={nurse.id} value={nurse.id}>
                      {nurse.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Psychologist */}
            <button
              onClick={() => onSelectRole('psychologist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'psychologist'
                  ? 'bg-white text-amber-950 shadow-sm font-extrabold'
                  : 'text-pink-100 hover:text-white hover:bg-white/15'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-amber-700" /> 
              <span>น.ส.อัยมี (จิตวิทยา)</span>
            </button>

            {/* Public Health */}
            <button
              onClick={() => onSelectRole('public_health')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'public_health'
                  ? 'bg-white text-blue-950 shadow-sm font-extrabold'
                  : 'text-pink-100 hover:text-white hover:bg-white/15'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> 
              <span>น.ส. สุธาสินี (สธ.)</span>
            </button>
          </div>

          {/* Right: Dashboard, Daily Alert Bell, Fast Sync & Google Sheet */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Monthly Clinic Jit-Dee Pharmacy Dashboard Button */}
            {onOpenMonthlyDashboard && (
              <button
                onClick={onOpenMonthlyDashboard}
                title="แสดง Dashboard สรุปผลการบริบาลเภสัชกรรมผู้ป่วยคลินิกจิตดี รายเดือน เพื่อดึงสรุปเป็นผลการดำเนินงาน"
                className="px-2.5 sm:px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer backdrop-blur-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 text-pink-200" />
                <span className="hidden md:inline">Dashboard สรุปผลงาน</span>
                <span className="md:hidden">Dashboard</span>
              </button>
            )}

            {/* Daily Due Followup Alert Bell */}
            <button
              onClick={onOpenDailyAlert}
              title="ดูรายชื่อผู้ป่วยที่ต้องติดตามวันนี้ (เยี่ยมบ้าน, Telemed, คลินิก)"
              className="relative p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 transition flex items-center gap-1.5 shadow-2xs font-semibold cursor-pointer"
            >
              <Bell className="w-4 h-4 text-pink-200" />
              <span className="hidden sm:inline text-xs font-bold text-white">นัดวันนี้</span>
              {dueTodayCount > 0 && (
                <span className="bg-white text-rose-700 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {dueTodayCount}
                </span>
              )}
            </button>

            {/* Notification Settings (LINE & Telegram) */}
            {onOpenNotificationSettings && (
              <button
                onClick={onOpenNotificationSettings}
                title="ตั้งค่าการแจ้งเตือน LINE & Telegram (รับเคสผู้ป่วย / ส่งเวร / นัดหมายเข้ามือถือ)"
                className={`p-2 rounded-xl border transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                  isNotificationActive
                    ? 'bg-white/30 text-white border-white/50'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-pink-200" />
                <span className="hidden xl:inline text-xs font-bold text-white">แจ้งเตือน Telegram/LINE</span>
                {isNotificationActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="เปิดใช้งานแจ้งเตือนอยู่"></span>
                )}
              </button>
            )}

            {/* Quick Refresh from Server across all devices */}
            {onRefreshServerData && (
              <button
                onClick={onRefreshServerData}
                disabled={isSyncing}
                title="ดึงข้อมูลล่าสุดจากทุกเครื่องทันที (Live Sync)"
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-pink-200 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden 2xl:inline text-xs font-semibold text-white">ดึงข้อมูลล่าสุด</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 bg-white/20 p-1 sm:p-1.5 rounded-2xl border border-white/30 shadow-2xs backdrop-blur-xs">
                {/* Sync to Sheet Action Button */}
                <button
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  title="ซิงค์ข้อมูลกับ Google Sheet"
                  className="bg-white hover:bg-rose-50 text-rose-900 disabled:opacity-50 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-rose-700 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ Sheet'}</span>
                </button>

                {/* Open Google Sheet Link */}
                <a
                  href={sheetEditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/25 hover:bg-white/35 text-white border border-white/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition shadow-2xs"
                  title="เปิดดูไฟล์ Google Sheet จริง"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden md:inline">เปิด Sheet</span>
                  <ExternalLink className="w-3 h-3 text-white" />
                </a>

                {/* Sheet Settings */}
                <button
                  onClick={onOpenSettings}
                  title="ตั้งค่า Google Sheet"
                  className="text-pink-100 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer"
                >
                  <Settings2 className="w-4 h-4 text-white" />
                </button>

                {/* User Info Avatar & Logout */}
                <div className="flex items-center gap-2 pl-1 border-l border-white/20">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-7 h-7 rounded-full border border-white/40 shadow-2xs"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white text-rose-800 flex items-center justify-center text-xs font-bold shadow-2xs">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <button
                    onClick={onLogout}
                    title="ออกจากระบบ Google"
                    className="text-pink-200 hover:text-white p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Google Sign-in Soft Styled Button + Settings */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onLogin}
                  className="bg-white hover:bg-rose-50 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 shadow-xs transition transform active:scale-95 border border-white/40 cursor-pointer"
                  title="เชื่อมต่อ Google Sheet สำหรับสำรองข้อมูลลง Sheet"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>เชื่อม Google Sheet</span>
                </button>
                <button
                  onClick={onOpenSettings}
                  title="ตั้งค่า Sheet ID"
                  className="text-white hover:text-white p-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 transition shadow-2xs cursor-pointer"
                >
                  <Settings2 className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Sub-bar: Compact, Elegant, Official */}
        <div className="py-1.5 border-t border-rose-600/50 text-[11px] text-pink-100 flex flex-wrap items-center justify-between -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={onRefreshServerData}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-white font-bold bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-lg border border-white/20 text-[11px] transition cursor-pointer shadow-2xs"
              title="ระบบเชื่อมต่อคลาวด์อัตโนมัติ รองรับ Vercel, GitHub และเชื่อมโยงทุกอุปกรณ์ตรงกันทันที"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>🟢 ซิงค์อัตโนมัติ Cloud Real-Time</span>
              {activeDevicesCount !== undefined && activeDevicesCount > 0 && (
                <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {activeDevicesCount} เครื่อง
                </span>
              )}
            </button>

            {user && (
              <>
                <span className="hidden sm:inline text-rose-400">•</span>
                <span className="flex items-center gap-1 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  Google Sheet เชื่อมต่อแล้ว
                </span>
              </>
            )}

            <span className="hidden sm:inline text-rose-400">•</span>
            <span className="hidden sm:inline text-pink-100/90 truncate max-w-xs">
              Sheet ID: <code className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] text-pink-100 border border-white/20 font-mono">{spreadsheetId}</code>
            </span>

            {/* Display active practitioner info subtly in the status line */}
            {activeTeamMember && (
              <>
                <span className="hidden md:inline text-rose-400">•</span>
                <span className="hidden md:inline-flex items-center gap-1 text-pink-100 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-pink-300" />
                  <span>ผู้ปฏิบัติงาน: <strong>{activeTeamMember.name}</strong> ({activeTeamMember.position})</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <span className="text-pink-100/80">
                ซิงค์ล่าสุด: <strong className="text-white font-bold">{lastSyncTime}</strong>
              </span>
            )}

            {/* Mobile Role Switcher */}
            <div className="flex lg:hidden items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/20">
              <button
                onClick={() => onSelectRole('pharmacist')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'pharmacist' ? 'bg-white text-rose-900' : 'text-pink-100'
                }`}
              >
                เภสัช
              </button>
              <button
                onClick={() => onSelectRole('nurse')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'nurse' ? 'bg-white text-teal-900' : 'text-pink-100'
                }`}
              >
                พยาบาล
              </button>
              <button
                onClick={() => onSelectRole('psychologist')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'psychologist' ? 'bg-white text-amber-900' : 'text-pink-100'
                }`}
              >
                จิตวิทยา
              </button>
              <button
                onClick={() => onSelectRole('public_health')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'public_health' ? 'bg-white text-blue-900' : 'text-pink-100'
                }`}
              >
                สธ.
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
