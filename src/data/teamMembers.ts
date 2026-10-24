import { RoleType } from '../types.ts';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  profession: RoleType;
  professionLabel: string;
  prefix: string;
  shortName: string;
  avatarColor: string;
  iconBg: string;
}

export interface ProfessionGroupInfo {
  key: RoleType;
  label: string;
  icon: string; // Icon identifier
  singleMemberOnly: boolean;
  colorClass: string;
  badgeClass: string;
}

export const MULTIDISCIPLINARY_TEAM: TeamMember[] = [
  {
    id: 'tm_rx_supita',
    name: 'ภญ.สุภิตา ทองขำ',
    position: 'เภสัชกรชำนาญการ',
    profession: 'pharmacist',
    professionLabel: 'เภสัชกร',
    prefix: 'ภญ.',
    shortName: 'สุภิตา',
    avatarColor: 'from-pink-500 to-rose-600',
    iconBg: 'bg-rose-100 text-rose-700'
  },
  {
    id: 'tm_nurse_rachanakorn',
    name: 'นางรชณากร บัวแก้ว',
    position: 'พยาบาลวิชาชีพชำนาญการ',
    profession: 'nurse',
    professionLabel: 'พยาบาลวิชาชีพ',
    prefix: 'นาง',
    shortName: 'รชณากร',
    avatarColor: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-100 text-teal-700'
  },
  {
    id: 'tm_nurse_thanom',
    name: 'น.ส.ถนอม คำทอง',
    position: 'พยาบาลวิชาชีพชำนาญการ',
    profession: 'nurse',
    professionLabel: 'พยาบาลวิชาชีพ',
    prefix: 'น.ส.',
    shortName: 'ถนอม',
    avatarColor: 'from-teal-600 to-cyan-700',
    iconBg: 'bg-teal-100 text-teal-800'
  },
  {
    id: 'tm_nurse_arisa',
    name: 'น.ส.อริสา ขุนพรหม',
    position: 'พยาบาลวิชาชีพปฏิบัติการ',
    profession: 'nurse',
    professionLabel: 'พยาบาลวิชาชีพ',
    prefix: 'น.ส.',
    shortName: 'อริสา',
    avatarColor: 'from-emerald-500 to-teal-700',
    iconBg: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'tm_psych_aimee',
    name: 'น.ส.อัยมี สามะ',
    position: 'นักจิตวิทยา',
    profession: 'psychologist',
    professionLabel: 'นักจิตวิทยา',
    prefix: 'น.ส.',
    shortName: 'อัยมี',
    avatarColor: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'tm_pubhealth_suthasinee',
    name: 'น.ส. สุธาสินี นะนุ้ย',
    position: 'นักวิชาการสาธารณสุข',
    profession: 'public_health',
    professionLabel: 'นักวิชาการสาธารณสุข',
    prefix: 'น.ส.',
    shortName: 'สุธาสินี',
    avatarColor: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 text-blue-800'
  }
];

export const PROFESSION_GROUPS: ProfessionGroupInfo[] = [
  {
    key: 'pharmacist',
    label: 'เภสัชกร',
    icon: 'Pill',
    singleMemberOnly: true,
    colorClass: 'text-rose-700 border-rose-300 bg-rose-50',
    badgeClass: 'bg-rose-100 text-rose-800'
  },
  {
    key: 'nurse',
    label: 'พยาบาลวิชาชีพ',
    icon: 'Stethoscope',
    singleMemberOnly: false, // มี 3 คน ให้ใช้แถบเลื่อน
    colorClass: 'text-teal-700 border-teal-300 bg-teal-50',
    badgeClass: 'bg-teal-100 text-teal-800'
  },
  {
    key: 'psychologist',
    label: 'นักจิตวิทยา',
    icon: 'Brain',
    singleMemberOnly: true,
    colorClass: 'text-amber-700 border-amber-300 bg-amber-50',
    badgeClass: 'bg-amber-100 text-amber-800'
  },
  {
    key: 'public_health',
    label: 'นักวิชาการสาธารณสุข',
    icon: 'Building2',
    singleMemberOnly: true,
    colorClass: 'text-blue-700 border-blue-300 bg-blue-50',
    badgeClass: 'bg-blue-100 text-blue-800'
  }
];

// LocalStorage Keys
const STORAGE_PREFIX = 'psycare_team_';
const ACTIVE_MEMBER_KEY = `${STORAGE_PREFIX}active_member_id`;
const PROFESSION_REMEMBER_PREFIX = `${STORAGE_PREFIX}remembered_`;

/**
 * Filter team members by profession
 */
export function getTeamMembersByProfession(profession: RoleType): TeamMember[] {
  return MULTIDISCIPLINARY_TEAM.filter(m => m.profession === profession);
}

/**
 * Check if a profession has only a single member (ตำแหน่งเดียวในกลุ่ม)
 */
export function isSingleMemberProfession(profession: RoleType): boolean {
  return getTeamMembersByProfession(profession).length === 1;
}

/**
 * Get the remembered member for a specific profession.
 * If the profession has only 1 member, it returns that member automatically (จำค่าตำแหน่งเดียว).
 * If multiple members (e.g. nurse), it retrieves the stored selection from localStorage,
 * or defaults to the first member.
 */
export function getRememberedMemberForProfession(profession: RoleType): TeamMember {
  const members = getTeamMembersByProfession(profession);
  if (members.length === 0) {
    return MULTIDISCIPLINARY_TEAM[0];
  }

  // กรณีมีคนเดียว/ตำแหน่งเดียวในกลุ่ม ให้จำค่าคนนั้นโดยอัตโนมัติ
  if (members.length === 1) {
    return members[0];
  }

  // กรณีมีหลายคน (เช่น พยาบาล) ค้นหาจาก localStorage ที่เคยเลือกไว้
  try {
    const savedId = localStorage.getItem(`${PROFESSION_REMEMBER_PREFIX}${profession}`);
    if (savedId) {
      const found = members.find(m => m.id === savedId);
      if (found) return found;
    }
  } catch (e) {
    console.warn('Cannot read localStorage for team member:', e);
  }

  return members[0];
}

/**
 * Save the selected member for a profession in localStorage
 */
export function saveRememberedMemberForProfession(member: TeamMember): void {
  try {
    localStorage.setItem(`${PROFESSION_REMEMBER_PREFIX}${member.profession}`, member.id);
    localStorage.setItem(ACTIVE_MEMBER_KEY, member.id);
  } catch (e) {
    console.warn('Cannot save localStorage for team member:', e);
  }
}

/**
 * Get active team member globally
 */
export function getActiveTeamMember(): TeamMember {
  try {
    const activeId = localStorage.getItem(ACTIVE_MEMBER_KEY);
    if (activeId) {
      const found = MULTIDISCIPLINARY_TEAM.find(m => m.id === activeId);
      if (found) return found;
    }
  } catch (e) {
    console.warn('Cannot read active member from localStorage:', e);
  }
  return MULTIDISCIPLINARY_TEAM[0]; // Default to Pharmacist
}

/**
 * Format member name with position
 * e.g. "ภญ.สุภิตา ทองขำ (เภสัชกรชำนาญการ)"
 */
export function formatMemberNameAndPosition(member: TeamMember): string {
  return `${member.name} (${member.position})`;
}
