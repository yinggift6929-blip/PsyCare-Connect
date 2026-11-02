import React, { useState, useEffect } from 'react';
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
  UserCheck,
  Palette
} from 'lucide-react';
import { RoleType } from '../types.ts';
import { 
  TeamMember, 
  getTeamMembersByProfession 
} from '../data/teamMembers.ts';

export type HeaderTheme = 'teal' | 'ocean' | 'indigo' | 'slate';

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

const THEMES: Record<HeaderTheme, {
  name: string;
  icon: string;
  headerBg: string;
  subbarBg: string;
  subbarText: string;
  subbarBorder: string;
  badgeBg: string;
  badgeText: string;
  navContainer: string;
  buttonActiveBg: string;
  buttonActiveText: string;
  buttonInactiveText: string;
  toolBtnBg: string;
}> = {
  teal: {
    name: 'เขียวมรกตการแพทย์ (สบายตา แนะนำ)',
    icon: '🌿',
    headerBg: 'bg-gradient-to-r from-[#0f766e] via-[#115e59] to-[#0f766e] border-b border-[#0d544f]',
    subbarBg: 'bg-[#0a3f3b]/95',
    subbarText: 'text-teal-100',
    subbarBorder: 'border-[#134e4a]',
    badgeBg: 'bg-white/20 border border-white/25',
    badgeText: 'text-teal-100',
    navContainer: 'bg-black/20 border border-white/20',
    buttonActiveBg: 'bg-white',
    buttonActiveText: 'text-teal-950',
    buttonInactiveText: 'text-teal-100 hover:text-white hover:bg-white/15',
    toolBtnBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
  },
  ocean: {
    name: 'น้ำเงินครามการแพทย์ (สดชื่น สะอาด)',
    icon: '🌊',
    headerBg: 'bg-gradient-to-r from-[#0369a1] via-[#075985] to-[#0369a1] border-b border-[#0c4a6e]',
    subbarBg: 'bg-[#082f49]/95',
    subbarText: 'text-sky-100',
    subbarBorder: 'border-[#0369a1]/50',
    badgeBg: 'bg-white/20 border border-white/25',
    badgeText: 'text-sky-100',
    navContainer: 'bg-black/20 border border-white/20',
    buttonActiveBg: 'bg-white',
    buttonActiveText: 'text-sky-950',
    buttonInactiveText: 'text-sky-100 hover:text-white hover:bg-white/15',
    toolBtnBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
  },
  indigo: {
    name: 'ครามลาเวนเดอร์ (สุขุม นุ่มนวล)',
    icon: '💜',
    headerBg: 'bg-gradient-to-r from-[#4338ca] via-[#3730a3] to-[#4338ca] border-b border-[#312e81]',
    subbarBg: 'bg-[#1e1b4b]/95',
    subbarText: 'text-indigo-100',
    subbarBorder: 'border-[#4338ca]/50',
    badgeBg: 'bg-white/20 border border-white/25',
    badgeText: 'text-indigo-100',
    navContainer: 'bg-black/20 border border-white/20',
    buttonActiveBg: 'bg-white',
    buttonActiveText: 'text-indigo-950',
    buttonInactiveText: 'text-indigo-100 hover:text-white hover:bg-white/15',
    toolBtnBg: 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
  },
  slate: {
    name: 'ชาร์โคลกราไฟต์ (โมเดิร์น สุขุม)',
    icon: '🖤',
    headerBg: 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700',
    subbarBg: 'bg-slate-950/95',
    subbarText: 'text-slate-300',
    subbarBorder: 'border-slate-800',
    badgeBg: 'bg-slate-700/80 border border-slate-600',
    badgeText: 'text-slate-200',
    navContainer: 'bg-slate-950/70 border border-slate-700',
    buttonActiveBg: 'bg-white',
    buttonActiveText: 'text-slate-950',
    buttonInactiveText: 'text-slate-300 hover:text-white hover:bg-white/10',
    toolBtnBg: 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-650'
  }
};

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
  const [theme, setTheme] = useState<HeaderTheme>(() => {
    return (localStorage.getItem('psycare_header_theme') as HeaderTheme) || 'teal';
  });
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('psycare_header_theme', theme);
  }, [theme]);

  const currentTheme = THEMES[theme] || THEMES.teal;
  const sheetEditUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return (
    <header className={`${currentTheme.headerBg} text-white sticky top-0 z-40 shadow-md backdrop-blur-md transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Clinic Title (กว้างขวาง สบายตา ไม่โดนบีบย่อ) */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs shrink-0 border border-white/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight text-white">
                  PsyCare Sheet Connect
                </h1>
                <span className={`hidden md:inline-flex items-center gap-1 text-[11px] font-bold ${currentTheme.badgeBg} ${currentTheme.badgeText} px-2.5 py-0.5 rounded-full shadow-2xs`}>
                  <Sparkles className="w-3 h-3" /> สหวิชาชีพจิตเวช
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-medium truncate">
                ระบบบริบาลเภสัชกรรม • สหวิชาชีพคลินิกจิตเวช
              </p>
            </div>
          </div>

          {/* Multidisciplinary Role Switcher */}
          <div className={`hidden lg:flex items-center ${currentTheme.navContainer} backdrop-blur-md rounded-2xl p-1 shadow-inner`}>
            <span className="text-[11px] font-bold text-white/80 px-2">กลุ่มวิชาชีพ:</span>
            
            {/* Pharmacist */}
            <button
              onClick={() => onSelectRole('pharmacist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'pharmacist'
                  ? `${currentTheme.buttonActiveBg} ${currentTheme.buttonActiveText} shadow-xs font-extrabold`
                  : currentTheme.buttonInactiveText
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
                    ? `${currentTheme.buttonActiveBg} ${currentTheme.buttonActiveText} shadow-xs font-extrabold`
                    : currentTheme.buttonInactiveText
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
                  className="ml-1 text-[11px] bg-white text-slate-900 font-bold px-2 py-1 rounded-lg border border-white/50 shadow-2xs cursor-pointer focus:outline-hidden"
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
                  ? `${currentTheme.buttonActiveBg} ${currentTheme.buttonActiveText} shadow-xs font-extrabold`
                  : currentTheme.buttonInactiveText
              }`}
            >
              <Brain className="w-3.5 h-3.5" /> 
              <span>น.ส.อัยมี (จิตวิทยา)</span>
            </button>

            {/* Public Health */}
            <button
              onClick={() => onSelectRole('public_health')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'public_health'
                  ? `${currentTheme.buttonActiveBg} ${currentTheme.buttonActiveText} shadow-xs font-extrabold`
                  : currentTheme.buttonInactiveText
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> 
              <span>น.ส. สุธาสินี (สธ.)</span>
            </button>
          </div>

          {/* Right: Dashboard, Daily Alert Bell, Fast Sync & Google Sheet */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Selector Palette Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                className={`p-2 rounded-xl border transition flex items-center gap-1 shadow-2xs cursor-pointer ${currentTheme.toolBtnBg}`}
                title="เปลี่ยนสีแถบด้านบน (เขียวมรกตการแพทย์ / น้ำเงินคราม / ม่วงคราม / กราไฟต์)"
              >
                <Palette className="w-4 h-4 text-white" />
                <span className="hidden sm:inline text-xs font-semibold">{currentTheme.icon}</span>
              </button>

              {isThemePickerOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 text-xs font-black text-slate-700 border-b border-slate-100 flex items-center justify-between">
                    <span>เลือกโทนสีแถบบน (สบายตา):</span>
                    <button 
                      onClick={() => setIsThemePickerOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1 pt-1.5">
                    {(Object.keys(THEMES) as HeaderTheme[]).map((tKey) => {
                      const t = THEMES[tKey];
                      return (
                        <button
                          key={tKey}
                          onClick={() => {
                            setTheme(tKey);
                            setIsThemePickerOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                            theme === tKey
                              ? 'bg-teal-50 text-teal-900 border border-teal-300 shadow-2xs'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{t.icon}</span>
                            <span>{t.name}</span>
                          </span>
                          {theme === tKey && <span className="text-teal-600 font-extrabold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Monthly Clinic Jit-Dee Pharmacy Dashboard Button */}
            {onOpenMonthlyDashboard && (
              <button
                onClick={onOpenMonthlyDashboard}
                title="แสดง Dashboard สรุปผลการบริบาลเภสัชกรรมผู้ป่วยคลินิกจิตดี รายเดือน เพื่อดึงสรุปเป็นผลการดำเนินงาน"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer backdrop-blur-xs ${currentTheme.toolBtnBg}`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-white" />
                <span className="hidden md:inline">Dashboard สรุปผลงาน</span>
                <span className="md:hidden">Dashboard</span>
              </button>
            )}

            {/* Daily Due Followup Alert Bell */}
            <button
              onClick={onOpenDailyAlert}
              title="ดูรายชื่อผู้ป่วยที่ต้องติดตามวันนี้ (เยี่ยมบ้าน, Telemed, คลินิก)"
              className={`relative p-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs font-semibold cursor-pointer ${currentTheme.toolBtnBg}`}
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="hidden sm:inline text-xs font-bold text-white">นัดวันนี้</span>
              {dueTodayCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {dueTodayCount}
                </span>
              )}
            </button>

            {/* Notification Settings (LINE & Telegram) */}
            {onOpenNotificationSettings && (
              <button
                onClick={onOpenNotificationSettings}
                title="ตั้งค่าการแจ้งเตือน LINE & Telegram (รับเคสผู้ป่วย / ส่งเวร / นัดหมายเข้ามือถือ)"
                className={`p-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                  isNotificationActive
                    ? 'bg-white/35 text-white border border-white/50'
                    : currentTheme.toolBtnBg
                }`}
              >
                <Send className="w-3.5 h-3.5 text-white" />
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
                className={`p-2 rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer ${currentTheme.toolBtnBg}`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
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
                  className="bg-white hover:bg-slate-100 text-slate-900 disabled:opacity-50 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ Sheet'}</span>
                </button>

                {/* Open Google Sheet Link */}
                <a
                  href={sheetEditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition shadow-2xs"
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
                  className="text-white hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer"
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
                    <div className="w-7 h-7 rounded-full bg-white text-slate-800 flex items-center justify-center text-xs font-bold shadow-2xs">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <button
                    onClick={onLogout}
                    title="ออกจากระบบ Google"
                    className="text-white/80 hover:text-rose-300 p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
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
                  className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 shadow-xs transition transform active:scale-95 border border-white/40 cursor-pointer"
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
                  className={`p-2 rounded-xl transition shadow-2xs cursor-pointer ${currentTheme.toolBtnBg}`}
                >
                  <Settings2 className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Sub-bar: Soothing, Seamless, Perfectly Coordinated */}
        <div className={`py-1.5 ${currentTheme.subbarBorder} text-[11px] ${currentTheme.subbarText} flex flex-wrap items-center justify-between -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 ${currentTheme.subbarBg}`}>
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
                <span className="hidden sm:inline text-white/40">•</span>
                <span className="flex items-center gap-1 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  Google Sheet เชื่อมต่อแล้ว
                </span>
              </>
            )}

            <span className="hidden sm:inline text-white/40">•</span>
            <span className="hidden sm:inline text-white/90 truncate max-w-xs">
              Sheet ID: <code className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] text-white border border-white/20 font-mono">{spreadsheetId}</code>
            </span>

            {/* Display active practitioner info subtly in the status line */}
            {activeTeamMember && (
              <>
                <span className="hidden md:inline text-white/40">•</span>
                <span className="hidden md:inline-flex items-center gap-1 text-white/90 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>ผู้ปฏิบัติงาน: <strong className="text-white font-bold">{activeTeamMember.name}</strong> ({activeTeamMember.position})</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <span className="text-white/80">
                ซิงค์ล่าสุด: <strong className="text-white font-bold">{lastSyncTime}</strong>
              </span>
            )}

            {/* Mobile Role Switcher */}
            <div className="flex lg:hidden items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/20">
              <button
                onClick={() => onSelectRole('pharmacist')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'pharmacist' ? 'bg-white text-slate-900' : 'text-white'
                }`}
              >
                เภสัช
              </button>
              <button
                onClick={() => onSelectRole('nurse')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'nurse' ? 'bg-white text-slate-900' : 'text-white'
                }`}
              >
                พยาบาล
              </button>
              <button
                onClick={() => onSelectRole('psychologist')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'psychologist' ? 'bg-white text-slate-900' : 'text-white'
                }`}
              >
                จิตวิทยา
              </button>
              <button
                onClick={() => onSelectRole('public_health')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentRole === 'public_health' ? 'bg-white text-slate-900' : 'text-white'
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
