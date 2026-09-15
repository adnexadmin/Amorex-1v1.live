import {
  UserProfile,
  StreamHost,
  PartyRoom,
  MomentPost,
  ChatConversation,
  BackpackItem,
  DailyTask,
  UTRRequest,
  VirtualGift,
  CallHistoryItem,
  UserReport,
  ReportStatus,
  CoinLedgerItem,
  FinancialSettings,
  AgentInfo,
  AgentHostRecord,
  SubAgentRecord,
  AgentTopUpRecord,
  CPQuestItem,
  CPMemoirItem,
  CPGiftItem
} from '../types';
import { db } from '../services/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

// ----------------------------------------------------
// Super Admin Constants
// ----------------------------------------------------
export const SUPER_ADMIN_EMAIL = 'adnexadmin@gmail.com';
export const USER_SUPER_ADMIN_EMAIL = 'adnexadmin@gmail.com';
export const SUPER_ADMIN_PASSWORD = 'admin';

export function isSuperAdminEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === SUPER_ADMIN_EMAIL.toLowerCase() || clean.includes('admin') || clean === 'adnexadmin@gmail.com';
}

// ----------------------------------------------------
// Device Fingerprint & Display ID
// ----------------------------------------------------
export function getDeviceFingerprint(): string {
  try {
    const existing = localStorage.getItem('amorex_device_fingerprint');
    if (existing) return existing;
    const newFp = 'fp_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('amorex_device_fingerprint', newFp);
    return newFp;
  } catch {
    return 'fp_fallback_' + Date.now();
  }
}

// Deterministic 8-digit Display ID generator based on user's Email ID
export function generateDeterministicDisplayId(email?: string): string {
  if (!email) return '88204912';
  const cleanEmail = email.trim().toLowerCase();
  
  if (cleanEmail === 'adnexadmin@gmail.com' || cleanEmail.includes('admin')) {
    return '1000001';
  }

  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = (hash * 31 + cleanEmail.charCodeAt(i)) >>> 0;
  }
  const resultNum = 10000000 + (hash % 89999999);
  return resultNum.toString();
}

export function generateDisplayId(email?: string): string {
  return generateDeterministicDisplayId(email);
}

// ----------------------------------------------------
// User Profiles
// ----------------------------------------------------
export const initialUser: UserProfile = {
  id: 'usr-default-01',
  displayId: generateDeterministicDisplayId('alex.rivers@amorex.live'),
  name: 'Alex Rivers',
  email: 'alex.rivers@amorex.live',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  role: 'USER',
  is_super_admin: false,
  isRealUser: true,
  level: 3,
  coins: 1250,
  gems: 180,
  vouchers: 2,
  experience: 450,
  exp: 450,
  gender: 'male',
  age: 24,
  region: 'India',
  bio: 'Exploring romantic video connections on Amorex Live ✨',
  isVerifiedHost: false,
  faceVerified: true,
  isOnboarded: true,
  timeSpentSeconds: 120,
  followingCount: 12,
  followersCount: 45,
  friendsCount: 8,
  visitorsCount: 130,
  likesCount: 89,
  deviceFingerprint: 'dev_default_01'
};

// Permanent Fixed Super Admin Profile (ID: 1000001)
export const createSuperAdminProfile = (
  email: string = 'adnexadmin@gmail.com',
  name: string = 'Adnex Super Admin'
): UserProfile => ({
  id: 'admin_1000001',
  displayId: '1000001',
  name,
  email: email.trim().toLowerCase(),
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  role: 'SUPER_ADMIN',
  is_super_admin: true,
  isRealUser: true,
  level: 99,
  coins: 99999999,
  gems: 999999,
  vouchers: 999,
  experience: 999999,
  exp: 999999,
  gender: 'female',
  age: 25,
  region: 'Global HQ',
  bio: 'Official Amorex Super Admin & 24/7 Live Support Center',
  isVerifiedHost: true,
  faceVerified: true,
  isOnboarded: true,
  timeSpentSeconds: 0,
  followingCount: 0,
  followersCount: 50000,
  friendsCount: 100,
  visitorsCount: 100000,
  likesCount: 500000,
  deviceFingerprint: 'admin_device_master'
});

export function getStoredUser(userId?: string): UserProfile | null {
  try {
    if (userId) {
      const registered = getStoredRegisteredUsers();
      const found = registered.find((u) => u.id === userId || u.displayId === userId);
      if (found) return found;
    }
    const raw = localStorage.getItem('amorex_user');
    if (raw) return JSON.parse(raw);
    return null;
  } catch {
    return null;
  }
}

export function updateUserProfile(partial: Partial<UserProfile>): UserProfile {
  const current = getStoredUser() || initialUser;
  const updated: UserProfile = { ...current, ...partial };
  try {
    localStorage.setItem('amorex_user', JSON.stringify(updated));
    saveRegisteredUser(updated);
  } catch (e) {
    console.warn('[updateUserProfile error]:', e);
  }
  return updated;
}

// Save registered user directly to Firebase Firestore with strict Display ID Locking
export async function saveRegisteredUser(user: UserProfile, isNewRegistration: boolean = false) {
  if (!user || user.is_super_admin) return;

  try {
    const lockedDisplayId = user.email ? generateDeterministicDisplayId(user.email) : (user.displayId || '88204912');
    const userWithLockedId: UserProfile = {
      ...user,
      displayId: lockedDisplayId
    };

    // Local memory backup
    const rawList = localStorage.getItem('amorex_registered_users');
    let list: UserProfile[] = rawList ? JSON.parse(rawList) : [];
    const idx = list.findIndex((u) => u.id === userWithLockedId.id || (u.email && u.email === userWithLockedId.email));
    
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...userWithLockedId, displayId: lockedDisplayId };
    } else {
      list.push(userWithLockedId);
    }
    localStorage.setItem('amorex_registered_users', JSON.stringify(list));

    // Direct Cloud Write to Firestore Database
    if (db) {
      const userRef = doc(db, 'users', userWithLockedId.id);
      await setDoc(userRef, {
        ...userWithLockedId,
        displayId: lockedDisplayId,
        updatedAt: Date.now(),
        isOnline: true
      }, { merge: true });
    }
  } catch (e) {
    console.warn('[Utility Cloud Storage Error]:', e);
  }
}

// Synchronize Coin Changes across Local Storage and Cloud Database
export async function updateUserCoinsInRegistry(userId: string, newCoins: number, newGems?: number) {
  try {
    const rawList = localStorage.getItem('amorex_registered_users');
    let list: UserProfile[] = rawList ? JSON.parse(rawList) : [];
    
    list = list.map((u) => {
      if (u.id === userId || u.displayId === userId) {
        return {
          ...u,
          coins: newCoins,
          gems: newGems !== undefined ? newGems : u.gems
        };
      }
      return u;
    });
    localStorage.setItem('amorex_registered_users', JSON.stringify(list));

    // Also update current active user if matches
    const current = getStoredUser();
    if (current && (current.id === userId || current.displayId === userId)) {
      current.coins = newCoins;
      if (newGems !== undefined) current.gems = newGems;
      localStorage.setItem('amorex_user', JSON.stringify(current));
    }

    // Update in Cloud Database
    if (db) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: newCoins,
        ...(newGems !== undefined && { gems: newGems }),
        updatedAt: Date.now()
      });
    }
  } catch (e) {
    console.warn('[Utility Coin Sync Error]:', e);
  }
}

export function getStoredRegisteredUsers(): UserProfile[] {
  try {
    const rawList = localStorage.getItem('amorex_registered_users');
    return rawList ? JSON.parse(rawList) : [initialUser];
  } catch {
    return [initialUser];
  }
}

export function updateUserTimeSpent(userId: string, additionalSecs: number) {
  try {
    const rawList = localStorage.getItem('amorex_registered_users');
    let list: UserProfile[] = rawList ? JSON.parse(rawList) : [];
    list = list.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          timeSpentSeconds: (u.timeSpentSeconds || 0) + additionalSecs,
          lastActiveAt: Date.now()
        };
      }
      return u;
    });
    localStorage.setItem('amorex_registered_users', JSON.stringify(list));
  } catch (e) {
    console.warn('[updateUserTimeSpent error]:', e);
  }
}

export function toggleUserFreezeInRegistry(userId: string): boolean {
  let isFrozenNow = false;
  try {
    const rawList = localStorage.getItem('amorex_registered_users');
    let list: UserProfile[] = rawList ? JSON.parse(rawList) : [];
    list = list.map((u) => {
      if (u.id === userId || u.displayId === userId) {
        isFrozenNow = !u.isFrozen;
        return { ...u, isFrozen: isFrozenNow };
      }
      return u;
    });
    localStorage.setItem('amorex_registered_users', JSON.stringify(list));
    if (db) {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { isFrozen: isFrozenNow }).catch(() => {});
    }
  } catch (e) {
    console.warn('[toggleUserFreezeInRegistry error]:', e);
  }
  return isFrozenNow;
}

export function toggleUserMuteInRegistry(userId: string): boolean {
  let isMutedNow = false;
  try {
    const rawList = localStorage.getItem('amorex_registered_users');
    let list: UserProfile[] = rawList ? JSON.parse(rawList) : [];
    list = list.map((u) => {
      if (u.id === userId || u.displayId === userId) {
        isMutedNow = !u.isMuted;
        return { ...u, isMuted: isMutedNow };
      }
      return u;
    });
    localStorage.setItem('amorex_registered_users', JSON.stringify(list));
    if (db) {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { isMuted: isMutedNow }).catch(() => {});
    }
  } catch (e) {
    console.warn('[toggleUserMuteInRegistry error]:', e);
  }
  return isMutedNow;
}

export function deleteUserFromRegistry(userId: string): void {
  try {
    const rawList = localStorage.getItem('amorex_registered_users');
    if (rawList) {
      const list: UserProfile[] = JSON.parse(rawList);
      const filtered = list.filter((u) => u.id !== userId && u.displayId !== userId);
      localStorage.setItem('amorex_registered_users', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('[deleteUserFromRegistry error]:', e);
  }
}

export function purgeDemoUsersFromRegistry(): number {
  try {
    const rawList = localStorage.getItem('amorex_registered_users');
    if (!rawList) return 0;
    const list: UserProfile[] = JSON.parse(rawList);
    const beforeCount = list.length;
    const realUsersOnly = list.filter((u) => u.isRealUser !== false || u.is_super_admin);
    localStorage.setItem('amorex_registered_users', JSON.stringify(realUsersOnly));
    return beforeCount - realUsersOnly.length;
  } catch {
    return 0;
  }
}

// ----------------------------------------------------
// Financial Settings & Master Coin Minting
// ----------------------------------------------------
export const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
  baseCoinsPerDollar: 6000,
  packages: [
    { id: 'pkg-1', usd: 5, coins: 30000, bonusCoins: 0, tag: 'Starter' },
    { id: 'pkg-2', usd: 10, coins: 60000, bonusCoins: 5000, bonusLabel: '+5K Free', isPopular: true },
    { id: 'pkg-3', usd: 25, coins: 150000, bonusCoins: 20000, bonusLabel: '+20K Free' },
    { id: 'pkg-4', usd: 50, coins: 300000, bonusCoins: 60000, bonusLabel: '+60K Free' },
    { id: 'pkg-5', usd: 100, coins: 600000, bonusCoins: 150000, bonusLabel: 'VIP +150K', tag: 'Best Value' }
  ],
  agentRebateEnabled: true,
  minWithdrawalCoins: 50000,
  updatedAt: Date.now()
};

export function getStoredFinancialSettings(): FinancialSettings {
  try {
    const raw = localStorage.getItem('amorex_financial_settings');
    return raw ? JSON.parse(raw) : DEFAULT_FINANCIAL_SETTINGS;
  } catch {
    return DEFAULT_FINANCIAL_SETTINGS;
  }
}

export function saveFinancialSettings(settings: FinancialSettings): void {
  try {
    localStorage.setItem('amorex_financial_settings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('amorex_financial_settings_updated', { detail: settings }));
  } catch (e) {
    console.warn('[saveFinancialSettings error]:', e);
  }
}

export function mintSuperAdminCoins(
  amount: number,
  displayId?: string,
  note?: string
): { success: boolean; newBalance: number; message: string } {
  try {
    const current = getStoredUser() || createSuperAdminProfile();
    const newBalance = (current.coins || 0) + amount;
    current.coins = newBalance;
    localStorage.setItem('amorex_user', JSON.stringify(current));

    recordCoinTransaction({
      title: note || `Super Admin Treasury Mint (+${amount.toLocaleString()})`,
      type: 'credit',
      amount,
      category: 'mint',
      balanceAfter: newBalance
    });

    updateUserCoinsInRegistry(current.id, newBalance);
    return {
      success: true,
      newBalance,
      message: `Minted ${amount.toLocaleString()} coins successfully.`
    };
  } catch (e) {
    return {
      success: false,
      newBalance: 0,
      message: 'Failed to mint coins.'
    };
  }
}

// ----------------------------------------------------
// Coin Ledger & Transactions
// ----------------------------------------------------
export function getStoredCoinLedger(): CoinLedgerItem[] {
  try {
    const raw = localStorage.getItem('amorex_coin_ledger');
    return raw ? JSON.parse(raw) : [
      {
        id: 'tx_init_1',
        title: 'Welcome Bonus Coins',
        type: 'credit',
        amount: 1000,
        timestamp: Date.now() - 3600000,
        dateFormatted: 'Today',
        category: 'top_up',
        balanceAfter: 1000
      }
    ];
  } catch {
    return [];
  }
}

export function recordCoinTransaction(
  item: Omit<CoinLedgerItem, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
): CoinLedgerItem {
  const newTx: CoinLedgerItem = {
    id: item.id || `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: item.timestamp || Date.now(),
    dateFormatted: new Date().toLocaleDateString(),
    ...item
  };

  try {
    const list = getStoredCoinLedger();
    list.unshift(newTx);
    localStorage.setItem('amorex_coin_ledger', JSON.stringify(list.slice(0, 200)));
    window.dispatchEvent(new CustomEvent('amorex_coin_ledger_updated', { detail: newTx }));
  } catch (e) {
    console.warn('[recordCoinTransaction error]:', e);
  }

  return newTx;
}

// ----------------------------------------------------
// Call History
// ----------------------------------------------------
export function getStoredCallHistory(): CallHistoryItem[] {
  try {
    const raw = localStorage.getItem('amorex_call_history');
    return raw ? JSON.parse(raw) : [
      {
        id: 'call_demo_1',
        hostId: 'host-1',
        hostName: 'Priya Sharma',
        hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        hostCountry: 'India',
        durationSec: 180,
        coinsCharged: 180,
        timestamp: 'Yesterday, 10:45 PM',
        status: 'completed'
      }
    ];
  } catch {
    return [];
  }
}

export function saveCallHistoryItem(item: CallHistoryItem): void {
  try {
    const list = getStoredCallHistory();
    list.unshift(item);
    localStorage.setItem('amorex_call_history', JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.warn('[saveCallHistoryItem error]:', e);
  }
}

// ----------------------------------------------------
// User Reports
// ----------------------------------------------------
export function getStoredUserReports(): UserReport[] {
  try {
    const raw = localStorage.getItem('amorex_user_reports');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserReport(report: UserReport): void {
  try {
    const list = getStoredUserReports();
    list.unshift(report);
    localStorage.setItem('amorex_user_reports', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('amorex_report_submitted', { detail: report }));
  } catch (e) {
    console.warn('[saveUserReport error]:', e);
  }
}

export function updateUserReportStatus(id: string, status: ReportStatus, actionTaken?: string): void {
  try {
    const list = getStoredUserReports();
    const updated = list.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status,
          ...(actionTaken && { actionTaken: actionTaken as any }),
          resolvedAt: Date.now()
        };
      }
      return r;
    });
    localStorage.setItem('amorex_user_reports', JSON.stringify(updated));
  } catch (e) {
    console.warn('[updateUserReportStatus error]:', e);
  }
}

export function deleteUserReport(id: string): void {
  try {
    const list = getStoredUserReports();
    const updated = list.filter((r) => r.id !== id);
    localStorage.setItem('amorex_user_reports', JSON.stringify(updated));
  } catch (e) {
    console.warn('[deleteUserReport error]:', e);
  }
}

// ----------------------------------------------------
// CP Space (Couples Space) & Task Engine
// ----------------------------------------------------
export const INITIAL_CP_MEMOIRS: CPMemoirItem[] = [
  {
    id: 'memoir_1',
    title: 'First Video Connection',
    date: '14 Feb 2025',
    photoUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600',
    description: 'The first time we spoke face-to-face across time zones ✨',
    milestoneLevel: 1
  },
  {
    id: 'memoir_2',
    title: 'Late Night Singing Party',
    date: '28 Feb 2025',
    photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
    description: 'Shared favorite acoustic melodies in the midnight party room 🎶',
    milestoneLevel: 5
  }
];

export const INITIAL_CP_GIFTS: CPGiftItem[] = [
  {
    id: 'cpg_rose',
    name: 'Eternal Rose',
    icon: '🌹',
    coinPrice: 99,
    intimacyValue: 10,
    description: 'A delicate blossoming rose symbol of budding intimacy.'
  },
  {
    id: 'cpg_ring',
    name: 'Diamond Promise Ring',
    icon: '💍',
    coinPrice: 599,
    intimacyValue: 80,
    description: 'A brilliant token of devotion and shared closeness.'
  },
  {
    id: 'cpg_castle',
    name: 'Lovers Fantasy Castle',
    icon: '🏰',
    coinPrice: 2999,
    intimacyValue: 500,
    description: 'Grand palace for high-level CP partners.'
  }
];

const INITIAL_CP_QUESTS: CPQuestItem[] = [
  {
    id: 'cpq_1',
    title: 'Daily Romantic Message',
    description: 'Send 1 loving text in private chat',
    scope: 'daily',
    progress: 0,
    target: 1,
    rewardCoins: 50,
    rewardIntimacy: 15,
    isCompleted: false,
    isClaimed: false,
    actionType: 'send_message'
  },
  {
    id: 'cpq_2',
    title: '1v1 Video Call Date',
    description: 'Enjoy at least 1 video call together',
    scope: 'daily',
    progress: 0,
    target: 1,
    rewardCoins: 120,
    rewardIntimacy: 35,
    isCompleted: false,
    isClaimed: false,
    actionType: 'video_call'
  },
  {
    id: 'cpq_3',
    title: 'Intimacy Gift Exchange',
    description: 'Send any couple gift in CP Space',
    scope: 'daily',
    progress: 0,
    target: 1,
    rewardCoins: 80,
    rewardIntimacy: 25,
    isCompleted: false,
    isClaimed: false,
    actionType: 'send_gift'
  }
];

export function getStoredCPQuests(): CPQuestItem[] {
  try {
    const raw = localStorage.getItem('amorex_cp_quests');
    return raw ? JSON.parse(raw) : INITIAL_CP_QUESTS;
  } catch {
    return INITIAL_CP_QUESTS;
  }
}

export function updateCPQuestProgress(actionType: string, increment: number = 1): CPQuestItem[] {
  try {
    const list = getStoredCPQuests();
    const updated = list.map((q) => {
      if (q.actionType === actionType && !q.isCompleted) {
        const newProgress = Math.min(q.target, q.progress + increment);
        return {
          ...q,
          progress: newProgress,
          isCompleted: newProgress >= q.target
        };
      }
      return q;
    });
    localStorage.setItem('amorex_cp_quests', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_cp_quests_updated', { detail: updated }));
    return updated;
  } catch {
    return INITIAL_CP_QUESTS;
  }
}

export function claimCPQuestReward(questId: string): { success: boolean; rewardCoins?: number; rewardIntimacy?: number } {
  try {
    const list = getStoredCPQuests();
    let claimed = false;
    let rewardCoins = 0;
    let rewardIntimacy = 0;
    const updated = list.map((q) => {
      if (q.id === questId && q.isCompleted && !q.isClaimed) {
        claimed = true;
        rewardCoins = q.rewardCoins;
        rewardIntimacy = q.rewardIntimacy;
        // Credit reward coins
        const current = getStoredUser();
        if (current) {
          const newCoins = (current.coins || 0) + q.rewardCoins;
          updateUserProfile({ coins: newCoins });
          recordCoinTransaction({
            title: `CP Quest Reward: ${q.title}`,
            type: 'credit',
            amount: q.rewardCoins,
            category: 'quest'
          });
        }
        return { ...q, isClaimed: true };
      }
      return q;
    });
    if (claimed) {
      localStorage.setItem('amorex_cp_quests', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('amorex_cp_quests_updated', { detail: updated }));
      return { success: true, rewardCoins, rewardIntimacy };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

// ----------------------------------------------------
// Agent Dashboard & Top-Up Engine
// ----------------------------------------------------
export const DEFAULT_AGENT_INFO: AgentInfo = {
  agencyName: 'Amorex Prime Agency',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  telegram: '@amorex_agency',
  email: 'agency@amorex.live',
  agentCode: 'AG-7788',
  registeredAt: Date.now() - 30 * 86400000,
  level: 2,
  thirtyDayAchievementCoins: 12500000,
  commissionRatio: 0.08,
  totalEarnedCommissionUSD: 340.50,
  totalDistributedCoins: 8500000,
  subAgentsCount: 3,
  hostsCount: 8,
  walletCoins: 450000
};

export function getStoredAgentInfo(): AgentInfo {
  try {
    const raw = localStorage.getItem('amorex_agent_info');
    return raw ? JSON.parse(raw) : DEFAULT_AGENT_INFO;
  } catch {
    return DEFAULT_AGENT_INFO;
  }
}

export function saveAgentInfo(info: Partial<AgentInfo>): AgentInfo {
  try {
    const existing = getStoredAgentInfo();
    const updated: AgentInfo = { ...existing, ...info };
    localStorage.setItem('amorex_agent_info', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_agent_info_updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.warn('[saveAgentInfo error]:', e);
    return getStoredAgentInfo();
  }
}

export function getAgentCommissionTier(thirtyDayCoins: number) {
  const tiers = [
    { level: 1, percentage: 4, ratio: 0.04, minCoins: 0, nextThreshold: 10000000 },
    { level: 2, percentage: 8, ratio: 0.08, minCoins: 10000000, nextThreshold: 30000000 },
    { level: 3, percentage: 12, ratio: 0.12, minCoins: 30000000, nextThreshold: 80000000 },
    { level: 4, percentage: 16, ratio: 0.16, minCoins: 80000000, nextThreshold: 150000000 },
    { level: 5, percentage: 20, ratio: 0.20, minCoins: 150000000, nextThreshold: 300000000 },
    { level: 6, percentage: 24, ratio: 0.24, minCoins: 300000000, nextThreshold: null }
  ];

  const currentTier = tiers.slice().reverse().find((t) => thirtyDayCoins >= t.minCoins) || tiers[0];
  const nextThreshold = currentTier.nextThreshold;
  const coinsNeededForNext = nextThreshold ? Math.max(0, nextThreshold - thirtyDayCoins) : 0;
  const progressPercent = nextThreshold
    ? Math.min(100, Math.round(((thirtyDayCoins - currentTier.minCoins) / (nextThreshold - currentTier.minCoins)) * 100))
    : 100;

  return {
    level: currentTier.level,
    percentage: currentTier.percentage,
    ratio: currentTier.ratio,
    nextThreshold,
    coinsNeededForNext,
    progressPercent
  };
}

export function getStoredAgentHosts(): AgentHostRecord[] {
  try {
    const raw = localStorage.getItem('amorex_agent_hosts');
    return raw ? JSON.parse(raw) : [
      {
        id: 'ah_1',
        name: 'Sara Khan',
        displayId: '88204911',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        monthlyHours: 48,
        dailyHours: 2.5,
        giftCoinsReceived: 450000,
        status: 'live',
        joinedAt: '2025-01-15'
      }
    ];
  } catch {
    return [];
  }
}

export function addAgentHost(host: Omit<AgentHostRecord, 'id' | 'joinedAt'>): AgentHostRecord {
  const newHost: AgentHostRecord = {
    id: `ah_${Date.now()}`,
    joinedAt: new Date().toISOString().slice(0, 10),
    ...host
  };
  try {
    const list = getStoredAgentHosts();
    list.unshift(newHost);
    localStorage.setItem('amorex_agent_hosts', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('amorex_agent_hosts_updated', { detail: list }));
  } catch (e) {
    console.warn('[addAgentHost error]:', e);
  }
  return newHost;
}

export function getStoredSubAgents(): SubAgentRecord[] {
  try {
    const raw = localStorage.getItem('amorex_sub_agents');
    return raw ? JSON.parse(raw) : [
      {
        id: 'sa_1',
        agencyName: 'Delhi Stars Agency',
        agentCode: 'AG-4412',
        contactName: 'Rohit Verma',
        level: 1,
        thirtyDayCoins: 4500000,
        commissionRatio: 0.04,
        referralCommissionEarned: 90,
        joinedAt: '2025-02-01'
      }
    ];
  } catch {
    return [];
  }
}

export function addSubAgent(subAgent: Omit<SubAgentRecord, 'id' | 'joinedAt'>): SubAgentRecord {
  const newSub: SubAgentRecord = {
    id: `sa_${Date.now()}`,
    joinedAt: new Date().toISOString().slice(0, 10),
    ...subAgent
  };
  try {
    const list = getStoredSubAgents();
    list.unshift(newSub);
    localStorage.setItem('amorex_sub_agents', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('amorex_sub_agents_updated', { detail: list }));
  } catch (e) {
    console.warn('[addSubAgent error]:', e);
  }
  return newSub;
}

export function getStoredAgentTopUps(): AgentTopUpRecord[] {
  try {
    const raw = localStorage.getItem('amorex_agent_topups');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function executeAgentUserTopUp(
  targetInput: string,
  coins: number,
  usd: number
): { success: boolean; message: string } {
  try {
    const registered = getStoredRegisteredUsers();
    const target = registered.find(
      (u) => u.displayId === targetInput || u.id === targetInput || (u.email && u.email.toLowerCase() === targetInput.toLowerCase())
    );

    if (!target) {
      return {
        success: false,
        message: `Target user '${targetInput}' was not found in registered accounts.`
      };
    }

    const agent = getStoredAgentInfo();
    const tier = getAgentCommissionTier(agent.thirtyDayAchievementCoins);
    const commissionUSD = Number((usd * tier.ratio).toFixed(2));

    // Update target user's coins
    const newTargetCoins = (target.coins || 0) + coins;
    updateUserCoinsInRegistry(target.id, newTargetCoins);

    // Record Top-Up History
    const newRecord: AgentTopUpRecord = {
      id: `topup_${Date.now()}`,
      targetUserId: target.id,
      targetUserDisplayId: target.displayId,
      targetUserName: target.name,
      targetUserAvatar: target.avatar,
      coinsTransferred: coins,
      amountUSD: usd,
      commissionEarnedUSD: commissionUSD,
      timestamp: Date.now(),
      status: 'COMPLETED'
    };

    const topUps = getStoredAgentTopUps();
    topUps.unshift(newRecord);
    localStorage.setItem('amorex_agent_topups', JSON.stringify(topUps));
    window.dispatchEvent(new CustomEvent('amorex_agent_topups_updated', { detail: topUps }));

    // Update agent metrics
    agent.totalDistributedCoins += coins;
    agent.totalEarnedCommissionUSD += commissionUSD;
    agent.thirtyDayAchievementCoins += coins;
    saveAgentInfo(agent);

    return {
      success: true,
      message: `Successfully credited +${coins.toLocaleString()} Coins to ${target.name} (ID: ${target.displayId})! Earned +$${commissionUSD.toFixed(2)} USD Commission.`
    };
  } catch (e) {
    return {
      success: false,
      message: 'Unexpected error executing agency top-up.'
    };
  }
}

// ----------------------------------------------------
// Virtual Gifts
// ----------------------------------------------------
export const virtualGifts: VirtualGift[] = [
  { id: 'g_rose', name: 'Rose', price: 10, coinCost: 10, icon: '🌹', animationType: 'rose', category: 'Popular' },
  { id: 'g_heart', name: 'Heart Sparkle', price: 50, coinCost: 50, icon: '💖', animationType: 'heart', category: 'Romantic' },
  { id: 'g_ring', name: 'Diamond Ring', price: 299, coinCost: 299, icon: '💍', animationType: 'ring', category: 'Romantic' },
  { id: 'g_car', name: 'Sports Car', price: 999, coinCost: 999, icon: '🏎️', animationType: 'car', category: 'Luxury' },
  { id: 'g_castle', name: 'Royal Castle', price: 2999, coinCost: 2999, icon: '🏰', animationType: 'castle', category: 'Luxury' },
  { id: 'g_rocket', name: 'Star Rocket', price: 5999, coinCost: 5999, icon: '🚀', animationType: 'rocket', category: 'Special' },
  { id: 'g_yacht', name: 'Mega Yacht', price: 9999, coinCost: 9999, icon: '🛥️', animationType: 'yacht', category: 'Luxury' }
];

export const VIRTUAL_GIFTS: VirtualGift[] = virtualGifts;

// ----------------------------------------------------
// Initial App State Datasets
// ----------------------------------------------------
export const initialHosts: StreamHost[] = [
  {
    id: 'host-1',
    displayId: '88204910',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
    age: 23,
    gender: 'female',
    region: 'India',
    level: 14,
    tags: ['Bollywood', 'Singing', 'LateNight'],
    isLive: true,
    isPopular: true,
    isNew: false,
    viewerCount: 1420,
    bio: 'Late night acoustic songs & heartwarming conversations ❤️',
    ratePerMin: 60,
    coinRatePerMin: 60,
    callStatus: 'available',
    languages: ['Hindi', 'English'],
    primaryLanguage: 'Hindi'
  },
  {
    id: 'host-2',
    displayId: '88204911',
    name: 'Aisha Al-Hassan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
    age: 24,
    gender: 'female',
    region: 'UAE',
    level: 22,
    tags: ['Fashion', 'Coffee', 'Vibes'],
    isLive: true,
    isPopular: true,
    isNew: false,
    viewerCount: 2890,
    bio: 'Dubai nights, lifestyle chats & pleasant video vibes ✨',
    ratePerMin: 90,
    coinRatePerMin: 90,
    callStatus: 'available',
    languages: ['Arabic', 'English'],
    primaryLanguage: 'Arabic'
  },
  {
    id: 'host-3',
    displayId: '88204912',
    name: 'Ananya Menon',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
    age: 22,
    gender: 'female',
    region: 'India',
    level: 18,
    tags: ['Malayalam', 'Dance', 'Friendly'],
    isLive: true,
    isPopular: false,
    isNew: true,
    viewerCount: 980,
    bio: 'Namaskaram! Connecting Malayalam voices worldwide 🌸',
    ratePerMin: 60,
    coinRatePerMin: 60,
    callStatus: 'available',
    languages: ['Malayalam', 'English'],
    primaryLanguage: 'Malayalam'
  }
];

export const initialPartyRooms: PartyRoom[] = [
  {
    id: 'room-1',
    title: 'Late Night Acoustic Lounge 🌙',
    hostId: 'host-1',
    hostName: 'Priya Sharma',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600',
    category: 'Singing',
    mode: 'audio',
    wallpaper: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
    bgmPlaying: true,
    bgmGenre: 'Romantic',
    isLocked: false,
    onlineCount: 42,
    seats: [
      { seatIndex: 0, userId: 'host-1', userName: 'Priya Sharma', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', isHost: true, isSpeaking: true },
      { seatIndex: 1, userId: 'usr-2', userName: 'Dev', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
      { seatIndex: 2 },
      { seatIndex: 3 },
      { seatIndex: 4 },
      { seatIndex: 5 },
      { seatIndex: 6 },
      { seatIndex: 7 }
    ]
  }
];

export const initialMoments: MomentPost[] = [
  {
    id: 'mom-1',
    authorId: 'host-1',
    authorName: 'Priya Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    authorLevel: 14,
    isVerified: true,
    timestamp: '2 hours ago',
    content: 'Sunset melodies by the sea 🌅 Who wants to hear an acoustic set tonight?',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600',
    likesCount: 142,
    commentsCount: 23,
    sharesCount: 11,
    tags: ['Sunset', 'Music', 'LiveVibes']
  }
];

export const initialConversations: ChatConversation[] = [
  {
    id: 'conv_super_admin_1000001',
    participantId: 'admin_1000001',
    participantDisplayId: '1000001',
    participantName: 'Adnex Super Admin',
    participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    hostId: 'admin_1000001',
    hostName: 'Adnex Super Admin',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    hostDisplayId: '1000001',
    isOnline: true,
    lastMessage: 'Official Amorex Support & Management Desk',
    lastMessageTime: 'Online',
    unreadCount: 0,
    messages: [
      {
        id: 'msg_welcome_admin',
        senderId: 'admin_1000001',
        text: 'Welcome to Amorex Live! Our 24/7 Super Admin center is active for your support and safety.',
        timestamp: 'Online',
        type: 'text'
      }
    ]
  }
];

export const initialBackpack: BackpackItem[] = [
  {
    id: 'bp_1',
    name: 'Neon Cyber Frame',
    type: 'frame',
    icon: '🔮',
    previewUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400',
    description: 'Electrifying neon aura frame for your profile avatar.',
    daysRemaining: 14,
    isEquipped: true
  }
];

export const initialTasks: DailyTask[] = [
  {
    id: 'task_1',
    title: 'Daily Check-in',
    description: 'Log in to claim free talk-time coins',
    progress: 1,
    target: 1,
    rewardCoins: 50,
    isClaimed: false
  },
  {
    id: 'task_2',
    title: 'Send a Virtual Gift',
    description: 'Send any gift in 1v1 video or party room',
    progress: 0,
    target: 1,
    rewardCoins: 100,
    isClaimed: false
  }
];

export const initialUTRRequests: UTRRequest[] = [];
