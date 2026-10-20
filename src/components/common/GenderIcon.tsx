import React from 'react';
import { Venus, Mars, User } from 'lucide-react';

interface GenderIconProps {
  gender: 'ชาย' | 'หญิง' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

/**
 * Stylized Female Avatar Icon (รูป icon ญ)
 */
export const FemaleAvatarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-label="เพศหญิง"
  >
    {/* Woman stylized face with hair */}
    <path 
      d="M12 2C8.69 2 6 4.69 6 8c0 2.21 1.2 4.15 3 5.19V14c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-.81c1.8-.94 3-2.98 3-5.19 0-3.31-2.69-6-6-6zm-3.5 6c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.25-.66 2.35-1.64 2.96-.36.22-.61.6-.66 1.02L13 13h-2l-.2-.98c-.05-.42-.3-.8-.66-1.02A3.49 3.49 0 0 1 8.5 8z" 
      opacity="0.9"
    />
    <path d="M4 20c0-3.31 2.69-6 6-6h4c3.31 0 6 2.69 6 6v1H4v-1z" />
    {/* Ponytail / Hair accent */}
    <path d="M5.5 8.5c-.83 0-1.5.67-1.5 1.5 0 1.5 1.5 3.5 2.5 4 .2-.5.5-1.5.5-2.5 0-1.66-.67-3-1.5-3z" opacity="0.6" />
    <path d="M18.5 8.5c.83 0 1.5.67 1.5 1.5 0 1.5-1.5 3.5-2.5 4-.2-.5-.5-1.5-.5-2.5 0-1.66.67-3 1.5-3z" opacity="0.6" />
  </svg>
);

/**
 * Stylized Male Avatar Icon (รูป icon ช)
 */
export const MaleAvatarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-label="เพศชาย"
  >
    {/* Man stylized face with short hair */}
    <circle cx="12" cy="8" r="4.5" />
    <path d="M4 20c0-3.31 2.69-6 6-6h4c3.31 0 6 2.69 6 6v1H4v-1z" />
    {/* Hair top trim */}
    <path d="M7.5 7.5C8 5 10 3.5 12 3.5s4 1.5 4.5 4c-.5-.8-1.5-1.5-2.5-1.5s-2 .7-2 1.5c0-.8-1-1.5-2-1.5s-2 .7-2.5 1.5z" opacity="0.7" />
  </svg>
);

/**
 * Gender Avatar Box Component (for Patient Banner & profile cards)
 */
export const PatientGenderAvatar: React.FC<{
  gender: 'ชาย' | 'หญิง' | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ gender, className = '', size = 'md' }) => {
  const isFemale = gender === 'หญิง';

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-13 h-13 rounded-2xl'
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8'
  }[size];

  return (
    <div
      className={`flex items-center justify-center shrink-0 border relative shadow-xs transition-all ${sizeClasses} ${
        isFemale
          ? 'bg-gradient-to-tr from-pink-100 via-rose-50 to-pink-200 text-pink-600 border-pink-300 ring-2 ring-pink-100/80 shadow-pink-100'
          : 'bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-200 text-sky-600 border-sky-300 ring-2 ring-sky-100/80 shadow-sky-100'
      } ${className}`}
      title={`ผู้ป่วยเพศ${isFemale ? 'หญิง (ญ)' : 'ชาย (ช)'}`}
    >
      {isFemale ? (
        <div className="flex flex-col items-center justify-center">
          <FemaleAvatarIcon className={iconSizes} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <MaleAvatarIcon className={iconSizes} />
        </div>
      )}

      {/* Small medical symbol corner badge */}
      <span 
        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-xs ${
          isFemale 
            ? 'bg-pink-500 text-white border-white' 
            : 'bg-sky-500 text-white border-white'
        }`}
      >
        {isFemale ? '♀' : '♂'}
      </span>
    </div>
  );
};

/**
 * Inline Gender Badge (Icon ญ / ช พร้อมข้อความ)
 */
export const GenderBadge: React.FC<{
  gender: 'ชาย' | 'หญิง' | string;
  className?: string;
  showText?: boolean;
}> = ({ gender, className = '', showText = true }) => {
  const isFemale = gender === 'หญิง';

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
        isFemale
          ? 'bg-pink-50 text-pink-700 border-pink-200'
          : 'bg-sky-50 text-sky-700 border-sky-200'
      } ${className}`}
      title={`เพศ${isFemale ? 'หญิง' : 'ชาย'}`}
    >
      {isFemale ? (
        <>
          <Venus className="w-3.5 h-3.5 text-pink-600" />
          {showText && <span>หญิง</span>}
        </>
      ) : (
        <>
          <Mars className="w-3.5 h-3.5 text-sky-600" />
          {showText && <span>ชาย</span>}
        </>
      )}
    </span>
  );
};
