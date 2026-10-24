import React, { useRef, useState, useEffect } from 'react';
import { 
  Pill, 
  Stethoscope, 
  Brain, 
  Building2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Sparkles,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import { RoleType } from '../../types.ts';
import { 
  TeamMember, 
  MULTIDISCIPLINARY_TEAM, 
  PROFESSION_GROUPS, 
  getTeamMembersByProfession, 
  isSingleMemberProfession, 
  getRememberedMemberForProfession, 
  saveRememberedMemberForProfession,
  formatMemberNameAndPosition
} from '../../data/teamMembers.ts';

interface TeamMemberSliderProps {
  profession?: RoleType;
  selectedMemberId?: string;
  onSelectMember: (member: TeamMember) => void;
  showProfessionTabs?: boolean;
  onProfessionChange?: (profession: RoleType) => void;
  compact?: boolean;
  label?: string;
  helperText?: string;
}

export const TeamMemberSlider: React.FC<TeamMemberSliderProps> = ({
  profession: propProfession,
  selectedMemberId,
  onSelectMember,
  showProfessionTabs = false,
  onProfessionChange,
  compact = false,
  label = 'ทีมสหวิชาชีพผู้บันทึก / ปฏิบัติงาน',
  helperText
}) => {
  const [activeProfession, setActiveProfession] = useState<RoleType>(propProfession || 'nurse');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Sync if propProfession changes
  useEffect(() => {
    if (propProfession) {
      setActiveProfession(propProfession);
    }
  }, [propProfession]);

  // Current list of members in this profession
  const currentMembers = getTeamMembersByProfession(activeProfession);
  const isSingle = isSingleMemberProfession(activeProfession);

  // Check scroll position
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [currentMembers]);

  // Auto-select and remember if single member profession
  useEffect(() => {
    if (isSingle && currentMembers.length === 1) {
      const singleMember = currentMembers[0];
      if (selectedMemberId !== singleMember.id) {
        onSelectMember(singleMember);
        saveRememberedMemberForProfession(singleMember);
      }
    } else if (!isSingle && currentMembers.length > 0) {
      // If none selected, load remembered member
      const isCurrentSelectedInGroup = currentMembers.some(m => m.id === selectedMemberId);
      if (!isCurrentSelectedInGroup) {
        const remembered = getRememberedMemberForProfession(activeProfession);
        onSelectMember(remembered);
      }
    }
  }, [activeProfession, isSingle]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const handleMemberClick = (member: TeamMember) => {
    onSelectMember(member);
    saveRememberedMemberForProfession(member);
  };

  const handleTabClick = (pKey: RoleType) => {
    setActiveProfession(pKey);
    if (onProfessionChange) {
      onProfessionChange(pKey);
    }
  };

  const getProfessionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Pill':
        return <Pill className="w-3.5 h-3.5" />;
      case 'Stethoscope':
        return <Stethoscope className="w-3.5 h-3.5" />;
      case 'Brain':
        return <Brain className="w-3.5 h-3.5" />;
      case 'Building2':
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <UserCheck className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Header with Title & Single Position Indicator */}
      {(label || showProfessionTabs) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {label && (
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <SlidersHorizontal className="w-3.5 h-3.5 text-pink-600" />
              <span>{label}</span>
              {isSingle && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <Lock className="w-2.5 h-2.5 text-slate-500" /> จำค่าชื่อตำแหน่งอัตโนมัติ
                </span>
              )}
            </div>
          )}

          {/* Optional Profession Tabs */}
          {showProfessionTabs && (
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
              {PROFESSION_GROUPS.map((group) => {
                const isActive = activeProfession === group.key;
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => handleTabClick(group.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {getProfessionIcon(group.icon)}
                    <span>{group.label}</span>
                    {!group.singleMemberOnly && (
                      <span className="text-[9px] px-1 rounded-full bg-teal-100 text-teal-800 font-bold ml-0.5">
                        3
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Helper text if provided */}
      {helperText && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}

      {/* The Scrollable Slider Container (แถบเลื่อน) */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute -left-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 text-slate-700 hover:text-pink-600 rounded-full shadow-md border border-slate-200 flex items-center justify-center transition cursor-pointer"
            title="เลื่อนซ้าย"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 text-slate-700 hover:text-pink-600 rounded-full shadow-md border border-slate-200 flex items-center justify-center transition cursor-pointer"
            title="เลื่อนขวา"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scroll-smooth no-scrollbar"
        >
          {currentMembers.map((member) => {
            const isSelected = selectedMemberId === member.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => handleMemberClick(member)}
                className={`flex-shrink-0 text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  compact ? 'min-w-[210px]' : 'min-w-[250px]'
                } ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-50 via-rose-50/70 to-pink-50/40 border-pink-400 ring-2 ring-pink-400/40 shadow-xs'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}
                >
                  {member.shortName.charAt(0)}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-slate-900 text-xs truncate">
                      {member.name}
                    </span>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-pink-500 text-white shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md truncate ${
                        isSelected
                          ? 'bg-pink-100 text-pink-800 border border-pink-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {member.position}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Single-Member Lock Note or Multi-Member Selection Instruction */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
        {isSingle ? (
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Check className="w-3 h-3 text-emerald-600" />
            จำค่าตำแหน่งเดียว: <strong className="text-slate-800">{currentMembers[0]?.position}</strong>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-teal-700 font-medium">
            <Sparkles className="w-3 h-3 text-teal-500" />
            เลื่อนแถบเพื่อเลือกรายชื่อพยาบาลผู้ปฏิบัติงาน ({currentMembers.length} ท่าน)
          </span>
        )}

        {selectedMemberId && (
          <span className="font-semibold text-pink-700 truncate max-w-[200px]">
            {formatMemberNameAndPosition(
              currentMembers.find(m => m.id === selectedMemberId) || currentMembers[0]
            )}
          </span>
        )}
      </div>
    </div>
  );
};
