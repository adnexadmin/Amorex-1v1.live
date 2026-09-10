import {
  UserProfile,
  StreamHost,
  MomentPost,
  PartyRoom,
  Conversation,
  ChatMessage,
  UTRRequest,
  DailyTask,
  BackpackItem,
  VirtualGift,
  CallHistoryItem,
  UserReport,
  ReportStatus,
  CoinLedgerItem,
  CPQuestItem,
  CPMemoirItem,
  CPGiftItem,
  Gender,
  Region,
  CoinPricingPackage,
  FinancialSettings,
  AgentInfo,
  AgentHostRecord,
  SubAgentRecord,
  AgentTopUpRecord
} from '../types';

// Super-Admin credentials & accounts
export const SUPER_ADMIN_EMAILS = ['admin@amorex.com', 'adnexadmin@gmail.com'];
export const SUPER_ADMIN_EMAIL = 'admin@amorex.com';
export const USER_SUPER_ADMIN_EMAIL = 'adnexadmin@gmail.com';
export const SUPER_ADMIN_PASSWORD = 'Amorex1235)';

export const isSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === 'admin@amorex.com' || clean === 'adnexadmin@gmail.com';
};

// Generate device fingerprint
export const getDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') return 'FP-SERVER-0001';
  const nav = window.navigator;
  const screen = window.screen;
  const raw = `${nav.userAgent}-${screen.width}x${screen.height}-${screen.colorDepth}-${nav.language}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `FP-AMX-${Math.abs(hash).toString(16).toUpperCase()}`;
};

export const createSuperAdminProfile = (email: string = 'adnexadmin@gmail.com', customName?: string): UserProfile => ({
  id: 'admin-amorex-001',
  displayId: '10000001',
  name: customName || (email.toLowerCase().includes('adnex') ? 'Super Admin Adnex' : 'Super Admin Amorex'),
  email: email,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  gender: 'female',
  age: 26,
  region: 'Global',
  role: 'SUPER_ADMIN',
  is_super_admin: true,
  isVerifiedHost: true,
  faceVerified: true,
  level: 99,
  experience: 999999,
  coins: 100000000, 
  gems: 50000000,
  vouchers: 99,
  bio: 'Official Super-Admin of Amorex Live Universe 👑',
  followingCount: 120,
  followersCount: 58000,
  friendsCount: 340,
  deviceFingerprint: getDeviceFingerprint(),
  equippedFrame: 'border-amber-400 shadow-amber-400/60'
});

// Default User Profile
export const INITIAL_USER: UserProfile = {
  id: 'usr-default-01',
  displayId: '88492019',
  name: 'Dev Rohan',
  email: 'user@amorex.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  gender: 'male',
  age: 24,
  region: 'India',
  role: 'USER',
  is_super_admin: false,
  isVerifiedHost: false,
  faceVerified: true,
  level: 12,
  experience: 4500,
  coins: 5000,
  gems: 1200,
  vouchers: 2,
  bio: 'Romance explorer & party room host enthusiast ✨',
  followingCount: 14,
  followersCount: 88,
  friendsCount: 22,
  deviceFingerprint: 'FP-DEFAULT-01',
  isRealUser: false
};

export const generateDisplayId = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const VIRTUAL_GIFTS: VirtualGift[] = [
  { id: 'gift-rose', name: 'Passion Rose', price: 10, icon: '🌹', animationType: 'rose', category: 'Popular' },
  { id: 'gift-heart', name: 'Heart Arrow', price: 50, icon: '💘', animationType: 'heart', category: 'Romantic' },
  { id: 'gift-ring', name: 'Diamond Solitaire', price: 299, icon: '💍', animationType: 'ring', category: 'Romantic' },
  { id: 'gift-car', name: 'Cyber Sportscar', price: 999, icon: '🏎️', animationType: 'car', category: 'Luxury' },
  { id: 'gift-yacht', name: 'Neon Super Yacht', price: 2999, icon: '🛥️', animationType: 'yacht', category: 'Luxury' },
  { id: 'gift-castle', name: 'Moonlight Palace', price: 9999, icon: '🏰', animationType: 'castle', category: 'Special' },
  { id: 'gift-rocket', name: 'Cosmic Love Rocket', price: 19999, icon: '🚀', animationType: 'rocket', category: 'Special' }
];

// CLEANED DUMMY DATA
export const INITIAL_HOSTS: StreamHost[] = [];
export const INITIAL_MOMENTS: MomentPost[] = [];
export const INITIAL_ROOMS: PartyRoom[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

export const INITIAL_TASKS: DailyTask[] = [
  { id: 't1', title: 'Daily App Check-In', description: 'Log in and claim your daily romance bonus', progress: 1, target: 1, rewardCoins: 100, isClaimed: true },
  { id: 't2', title: 'Send 3 Heart Likes', description: 'Like moments from creators on the feed', progress: 2, target: 3, rewardCoins: 200, isClaimed: false },
  { id: 't3', title: 'Join a 12-Seat Party Room', description: 'Hang out in a live party room for 3 mins', progress: 3, target: 3, rewardCoins: 350, isClaimed: false },
  { id: 't4', title: 'Place a Bet in Champ Car', description: 'Try your luck on the turbo racing track', progress: 1, target: 1, rewardCoins: 450, isClaimed: false },
  { id: 't5', title: '1v1 Romantic Video Call', description: 'Connect with a host for at least 1 minute', progress: 0, target: 1, rewardCoins: 800, isClaimed: false }
];

export const INITIAL_BACKPACK: BackpackItem[] = [
  { id: 'bp-1', name: 'Neon Cupid Heart Ring', type: 'frame', icon: '💖', previewUrl: 'border-pink-500 shadow-pink-500/50', description: 'Pulsing pink heart avatar aura', daysRemaining: 29, isEquipped: true },
  { id: 'bp-2', name: 'Imperial Golden Crown', type: 'frame', icon: '👑', previewUrl: 'border-amber-400 shadow-amber-400/60', description: 'Majestic royal golden frame', daysRemaining: 15, isEquipped: false },
  { id: 'bp-3', name: 'Cyber Supercar Drift Entrance', type: 'entrance', icon: '🏎️', previewUrl: 'bg-gradient-to-r from-cyan-500 to-blue-600', description: 'Dramatic tire screeching entry effect', daysRemaining: 22, isEquipped: true },
  { id: 'bp-4', name: '1v1 Discovery Turbo Boost', type: 'card', icon: '⚡️', previewUrl: 'bg-gradient-to-r from-purple-500 to-pink-500', description: '3x priority match ranking', daysRemaining: 7, isEquipped: false }
];

export const INITIAL_UTR_REQUESTS: UTRRequest[] = [];
export const INITIAL_CHAT_CONVERSATIONS: any[] = [];

export const initialUser = INITIAL_USER;
export const initialHosts = INITIAL_HOSTS;
export const initialPartyRooms = INITIAL_ROOMS;
export const initialMoments = INITIAL_MOMENTS;
export const initialConversations = INITIAL_CHAT_CONVERSATIONS;
export const initialBackpack = INITIAL_BACKPACK;
export const initialTasks = INITIAL_TASKS;
export const initialUTRRequests = INITIAL_UTR_REQUESTS;
export const virtualGifts = VIRTUAL_GIFTS.map(g => ({ ...g, coinCost: g.price }));

export const INITIAL_CALL_HISTORY: CallHistoryItem[] = [];

export const getStoredCallHistory = (): CallHistoryItem[] => {
  if (typeof window === 'undefined') return INITIAL_CALL_HISTORY;
  try {
    const saved = localStorage.getItem('amorex_call_history');
    if (!saved) {
      localStorage.setItem('amorex_call_history', JSON.stringify(INITIAL_CALL_HISTORY));
      return INITIAL_CALL_HISTORY;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CALL_HISTORY;
  } catch (e) {
    return INITIAL_CALL_HISTORY;
  }
};

export const saveStoredCallHistory = (history: CallHistoryItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('amorex_call_history', JSON.stringify(history));
  } catch (e) {
    console.error('Error saving call history:', e);
  }
};

export const REGISTERED_USERS_KEY = 'amorex_registered_users';

export const getStoredRegisteredUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveRegisteredUser = (user: UserProfile, isNewRegistration: boolean = false): void => {
  if (typeof window === 'undefined' || !user) return;
  try {
    const currentList = getStoredRegisteredUsers();
    const now = Date.now();

    const existingIndex = currentList.findIndex(
      (u) =>
        u.id === user.id ||
        (user.displayId && u.displayId === user.displayId) ||
        (user.email && u.email && u.email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
        (user.phone && u.phone && u.phone.trim() === user.phone.trim())
    );

    const updatedUserRecord: UserProfile = {
      ...user,
      isRealUser: true,
      registeredAt: existingIndex >= 0 ? (currentList[existingIndex].registeredAt || user.registeredAt || now) : (user.registeredAt || now),
      lastActiveAt: now,
      timeSpentSeconds: existingIndex >= 0 ? (currentList[existingIndex].timeSpentSeconds || user.timeSpentSeconds || 0) : (user.timeSpentSeconds || 0)
    };

    let updatedList: UserProfile[];
    if (existingIndex >= 0) {
      updatedList = [...currentList];
      if ((user.timeSpentSeconds || 0) > (currentList[existingIndex].timeSpentSeconds || 0)) {
        updatedUserRecord.timeSpentSeconds = user.timeSpentSeconds;
      } else {
        updatedUserRecord.timeSpentSeconds = currentList[existingIndex].timeSpentSeconds || 0;
      }
      updatedList[existingIndex] = {
        ...currentList[existingIndex],
        ...updatedUserRecord
      };
    } else {
      updatedList = [updatedUserRecord, ...currentList];
    }

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updatedList }));
  } catch (e) {
    console.error('Error saving registered user:', e);
  }
};

export const getStoredUser = (userId?: string): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  if (!userId) return null;
  const users = getStoredRegisteredUsers();
  return users.find((u) => u.id === userId || u.displayId === userId || u.email === userId) || null;
};

export const updateUserTimeSpent = (userId: string, additionalSeconds: number = 10): void => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const currentList = getStoredRegisteredUsers();
    let found = false;
    const now = Date.now();
    const updatedList = currentList.map((u) => {
      if (u.id === userId || u.displayId === userId) {
        found = true;
        const currentSecs = u.timeSpentSeconds || 0;
        return {
          ...u,
          timeSpentSeconds: currentSecs + additionalSeconds,
          lastActiveAt: now
        };
      }
      return u;
    });

    if (found) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updatedList }));
    }
  } catch (e) {
    console.error(e);
  }
};

export const updateUserCoinsInRegistry = (userId: string, coins: number, gems?: number): void => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const currentList = getStoredRegisteredUsers();
    const updatedList = currentList.map((u) => {
      if (u.id === userId || u.displayId === userId) {
        return {
          ...u,
          coins,
          gems: gems !== undefined ? gems : u.gems,
          lastActiveAt: Date.now()
        };
      }
      return u;
    });

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updatedList }));
  } catch (e) {
    console.error(e);
  }
};

export const toggleUserFreezeInRegistry = (userId: string): boolean => {
  if (typeof window === 'undefined' || !userId) return false;
  try {
    const currentList = getStoredRegisteredUsers();
    let newStatus = false;
    const updatedList = currentList.map((u) => {
      if (u.id === userId || u.displayId === userId) {
        newStatus = !u.isFrozen;
        return { ...u, isFrozen: newStatus };
      }
      return u;
    });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updatedList }));
    return newStatus;
  } catch (e) {
    return false;
  }
};

export const toggleUserMuteInRegistry = (userId: string): boolean => {
  if (typeof window === 'undefined' || !userId) return false;
  try {
    const currentList = getStoredRegisteredUsers();
    let newStatus = false;
    const updatedList = currentList.map((u) => {
      if (u.id === userId || u.displayId === userId) {
        newStatus = !u.isMuted;
        return { ...u, isMuted: newStatus };
      }
      return u;
    });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updatedList }));
    return newStatus;
  } catch (e) {
    return false;
  }
};

export const deleteUserFromRegistry = (userId: string): void => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const currentList = getStoredRegisteredUsers();
    const updatedList = currentList.filter((u) => u.id !== userId && u.displayId !== userId);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updatedList }));
  } catch (e) {}
};

export const purgeDemoUsersFromRegistry = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const currentList = getStoredRegisteredUsers();
    const initialCount = currentList.length;
    const filtered = currentList.filter((u) => {
      if (u.isRealUser === false) return false;
      if (u.id === 'usr-default-01' || u.email === 'user@amorex.com') return false;
      return true;
    });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: filtered }));
    return initialCount - filtered.length;
  } catch (e) {
    return 0;
  }
};

export const USER_REPORTS_KEY = 'amorex_user_reports';
export const INITIAL_SAMPLE_REPORTS: UserReport[] = [];

export const getStoredUserReports = (): UserReport[] => {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_REPORTS;
  try {
    const raw = localStorage.getItem(USER_REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(INITIAL_SAMPLE_REPORTS));
      return INITIAL_SAMPLE_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_REPORTS;
  } catch (e) {
    return INITIAL_SAMPLE_REPORTS;
  }
};

export const saveUserReport = (report: UserReport): void => {
  if (typeof window === 'undefined' || !report) return;
  try {
    const current = getStoredUserReports();
    const updated = [report, ...current.filter((r) => r.id !== report.id)];
    localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_reports_updated', { detail: updated }));
  } catch (e) {}
};

export const updateUserReportStatus = (
  reportId: string,
  status: ReportStatus,
  actionTaken: UserReport['actionTaken'] = 'NONE',
  adminNotes?: string,
  resolvedBy?: string
): void => {
  if (typeof window === 'undefined' || !reportId) return;
  try {
    const current = getStoredUserReports();
    const now = Date.now();
    const updated = current.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status,
          actionTaken,
          adminNotes: adminNotes ?? r.adminNotes,
          resolvedAt: status === 'RESOLVED' || status === 'DISMISSED' ? now : r.resolvedAt,
          resolvedBy: resolvedBy ?? r.resolvedBy
        };
      }
      return r;
    });
    localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_reports_updated', { detail: updated }));
  } catch (e) {}
};

export const deleteUserReport = (reportId: string): void => {
  if (typeof window === 'undefined' || !reportId) return;
  try {
    const current = getStoredUserReports();
    const updated = current.filter((r) => r.id !== reportId);
    localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_reports_updated', { detail: updated }));
  } catch (e) {}
};

export interface UpdateUserProfilePayload {
  userId?: string;
  name?: string;
  avatar?: string;
  avatarUrl?: string;
  coverPhoto?: string;
  gender?: Gender;
  age?: number;
  birthday?: string;
  region?: Region;
  signature?: string;
  bio?: string;
  locationVisible?: boolean;
  contentLanguage?: string;
  tags?: string[];
}

export const updateUserProfile = (params: UpdateUserProfilePayload): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('amorex_user');
    let currentUser: UserProfile;
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch (err) {
        currentUser = INITIAL_USER;
      }
    } else {
      currentUser = INITIAL_USER;
    }

    const nextAvatar = params.avatarUrl || params.avatar || currentUser.avatar;
    const updatedUser: UserProfile = {
      ...currentUser,
      ...(params.name !== undefined && { name: params.name.trim() }),
      ...(params.avatar !== undefined || params.avatarUrl !== undefined ? { avatar: nextAvatar, avatarUrl: nextAvatar } : {}),
      ...(params.coverPhoto !== undefined && { coverPhoto: params.coverPhoto }),
      ...(params.gender !== undefined && { gender: params.gender }),
      ...(params.age !== undefined && { age: Number(params.age) }),
      ...(params.birthday !== undefined && { birthday: params.birthday }),
      ...(params.region !== undefined && { region: params.region }),
      ...(params.signature !== undefined && { signature: params.signature.trim() }),
      ...(params.bio !== undefined && { bio: params.bio.trim() }),
      ...(params.locationVisible !== undefined && { locationVisible: params.locationVisible }),
      ...(params.contentLanguage !== undefined && { contentLanguage: params.contentLanguage }),
      ...(params.tags !== undefined && { tags: params.tags }),
      lastActiveAt: Date.now()
    };

    localStorage.setItem('amorex_user', JSON.stringify(updatedUser));
    saveRegisteredUser(updatedUser);
    window.dispatchEvent(new CustomEvent('amorex_user_updated', { detail: updatedUser }));
    if (params.contentLanguage) {
      window.dispatchEvent(new CustomEvent('amorex_language_changed', { detail: params.contentLanguage }));
    }
    return updatedUser;
  } catch (e) {
    return null;
  }
};

export const COIN_LEDGER_KEY = 'amorex_coin_ledger';
export const INITIAL_COIN_LEDGER: CoinLedgerItem[] = [];

export const getStoredCoinLedger = (userId?: string): CoinLedgerItem[] => {
  if (typeof window === 'undefined') return INITIAL_COIN_LEDGER;
  try {
    const raw = localStorage.getItem(COIN_LEDGER_KEY);
    if (!raw) {
      localStorage.setItem(COIN_LEDGER_KEY, JSON.stringify(INITIAL_COIN_LEDGER));
      return INITIAL_COIN_LEDGER;
    }
    const parsed: CoinLedgerItem[] = JSON.parse(raw);
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return INITIAL_COIN_LEDGER;
  }
};

export const recordCoinTransaction = (
  item: Omit<CoinLedgerItem, 'id' | 'timestamp'> & { timestamp?: number }
): CoinLedgerItem => {
  const current = getStoredCoinLedger();
  const now = item.timestamp || Date.now();
  const newTx: CoinLedgerItem = {
    ...item,
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    dateFormatted: item.dateFormatted || new Date(now).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  const updated = [newTx, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(COIN_LEDGER_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_coin_ledger_updated', { detail: updated }));
    window.dispatchEvent(new CustomEvent('amorex_wallet_updated'));
  }
  return newTx;
};

export const FINANCIAL_SETTINGS_KEY = 'amorex_financial_settings';
export const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
  baseCoinsPerDollar: 6000,
  packages: [
    { id: 'pkg-1', usd: 5, coins: 30000, bonusCoins: 0, bonusLabel: 'Starter Pack', tag: 'Starter' },
    { id: 'pkg-2', usd: 10, coins: 60000, bonusCoins: 5000, bonusLabel: '+5,000 Free Coins', tag: 'Popular', isPopular: true },
    { id: 'pkg-3', usd: 25, coins: 150000, bonusCoins: 20000, bonusLabel: '+20,000 Free Coins', tag: '🔥 Best Value' },
    { id: 'pkg-4', usd: 50, coins: 300000, bonusCoins: 50000, bonusLabel: '+50,000 VIP Coins', tag: 'High Roller' },
    { id: 'pkg-5', usd: 100, coins: 600000, bonusCoins: 120000, bonusLabel: '+120k VIP Coins + 👑 Crown', tag: '🏆 Mega VIP' },
    { id: 'pkg-6', usd: 500, coins: 3000000, bonusCoins: 800000, bonusLabel: '+800k Agency Master Coins', tag: 'Agency Pack' }
  ],
  agentRebateEnabled: true,
  minWithdrawalCoins: 100000,
  updatedAt: Date.now()
};

export const getStoredFinancialSettings = (): FinancialSettings => {
  if (typeof window === 'undefined') return DEFAULT_FINANCIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(FINANCIAL_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(FINANCIAL_SETTINGS_KEY, JSON.stringify(DEFAULT_FINANCIAL_SETTINGS));
      return DEFAULT_FINANCIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FINANCIAL_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_FINANCIAL_SETTINGS;
  }
};

export const saveFinancialSettings = (settings: FinancialSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    const payload = { ...settings, updatedAt: Date.now() };
    localStorage.setItem(FINANCIAL_SETTINGS_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('amorex_financial_settings_updated', { detail: payload }));
  } catch (e) {}
};

export const mintSuperAdminCoins = (
  amount: number,
  adminDisplayId: string = '10000001',
  note: string = 'Super Admin Coin Minting'
): { success: boolean; newBalance: number } => {
  if (typeof window === 'undefined' || amount <= 0) return { success: false, newBalance: 0 };
  try {
    const currentList = getStoredRegisteredUsers();
    let newBalance = 0;
    const updated = currentList.map((u) => {
      if (u.is_super_admin || u.role === 'SUPER_ADMIN' || u.displayId === adminDisplayId) {
        const nextCoins = (u.coins || 0) + amount;
        newBalance = nextCoins;
        return { ...u, coins: nextCoins };
      }
      return u;
    });

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));

    const activeRaw = localStorage.getItem('amorex_user');
    if (activeRaw) {
      try {
        const activeUser: UserProfile = JSON.parse(activeRaw);
        if (activeUser.is_super_admin || activeUser.role === 'SUPER_ADMIN') {
          activeUser.coins = (activeUser.coins || 0) + amount;
          newBalance = activeUser.coins;
          localStorage.setItem('amorex_user', JSON.stringify(activeUser));
          window.dispatchEvent(new CustomEvent('amorex_user_updated', { detail: activeUser }));
        }
      } catch (e) {}
    }

    recordCoinTransaction({ title: 'Minted Master Coins', type: 'credit', amount, category: 'mint', note: note || `Minted +${amount.toLocaleString()} Coins to Master Treasury` });
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updated }));
    window.dispatchEvent(new CustomEvent('amorex_wallet_updated'));

    return { success: true, newBalance };
  } catch (e) {
    return { success: false, newBalance: 0 };
  }
};

export const getAgentCommissionTier = (achievementCoins: number): CommissionTierDetails => {
  if (achievementCoins >= 500000000) return { level: 6, ratio: 0.24, percentage: 24, label: 'Level 6 (500M+)', minCoins: 500000000, nextThreshold: null, coinsNeededForNext: 0, progressPercent: 100 };
  if (achievementCoins >= 150000000) return { level: 5, ratio: 0.20, percentage: 20, label: 'Level 5 (150M+)', minCoins: 150000000, nextThreshold: 500000000, coinsNeededForNext: 500000000 - achievementCoins, progressPercent: Math.min(100, Math.round(((achievementCoins - 150000000) / 350000000) * 100)) };
  if (achievementCoins >= 50000000) return { level: 4, ratio: 0.16, percentage: 16, label: 'Level 4 (50M+)', minCoins: 50000000, nextThreshold: 150000000, coinsNeededForNext: 150000000 - achievementCoins, progressPercent: Math.min(100, Math.round(((achievementCoins - 50000000) / 100000000) * 100)) };
  if (achievementCoins >= 15000000) return { level: 3, ratio: 0.12, percentage: 12, label: 'Level 3 (15M+)', minCoins: 15000000, nextThreshold: 50000000, coinsNeededForNext: 50000000 - achievementCoins, progressPercent: Math.min(100, Math.round(((achievementCoins - 15000000) / 35000000) * 100)) };
  if (achievementCoins >= 5000000) return { level: 2, ratio: 0.08, percentage: 8, label: 'Level 2 (5M+)', minCoins: 5000000, nextThreshold: 15000000, coinsNeededForNext: 15000000 - achievementCoins, progressPercent: Math.min(100, Math.round(((achievementCoins - 5000000) / 10000000) * 100)) };
  return { level: 1, ratio: 0.04, percentage: 4, label: 'Level 1 (< 5M)', minCoins: 0, nextThreshold: 5000000, coinsNeededForNext: 5000000 - achievementCoins, progressPercent: Math.min(100, Math.round((achievementCoins / 5000000) * 100)) };
};

export const AGENT_INFO_KEY = 'amorex_agent_info';
export const AGENT_HOSTS_KEY = 'amorex_agent_hosts';
export const AGENT_SUBAGENTS_KEY = 'amorex_agent_subagents';
export const AGENT_TOPUPS_KEY = 'amorex_agent_topups';

export const DEFAULT_AGENT_INFO: AgentInfo = {
  agencyName: 'Amorex Star Agency', phone: '+971 50 123 4567', whatsapp: '+971 50 123 4567', telegram: '@amorex_star_agency', email: 'agency@amorex.com', agentCode: 'AG-882019', registeredAt: Date.now() - 1000 * 86400 * 25, level: 3, thirtyDayAchievementCoins: 18500000, commissionRatio: 0.12, totalEarnedCommissionUSD: 1480, totalDistributedCoins: 18500000, subAgentsCount: 0, hostsCount: 0, walletCoins: 2500000
};

export const INITIAL_AGENT_HOSTS: AgentHostRecord[] = [];
export const INITIAL_SUBAGENTS: SubAgentRecord[] = [];
export const INITIAL_AGENT_TOPUPS: AgentTopUpRecord[] = [];

export const getStoredAgentInfo = (): AgentInfo => {
  if (typeof window === 'undefined') return DEFAULT_AGENT_INFO;
  try {
    const raw = localStorage.getItem(AGENT_INFO_KEY);
    if (!raw) {
      localStorage.setItem(AGENT_INFO_KEY, JSON.stringify(DEFAULT_AGENT_INFO));
      return DEFAULT_AGENT_INFO;
    }
    const parsed: AgentInfo = JSON.parse(raw);
    const tier = getAgentCommissionTier(parsed.thirtyDayAchievementCoins || 0);
    return { ...DEFAULT_AGENT_INFO, ...parsed, level: tier.level, commissionRatio: tier.ratio };
  } catch (e) {
    return DEFAULT_AGENT_INFO;
  }
};

export const saveAgentInfo = (info: Partial<AgentInfo>): AgentInfo => {
  const current = getStoredAgentInfo();
  const achievement = info.thirtyDayAchievementCoins !== undefined ? info.thirtyDayAchievementCoins : current.thirtyDayAchievementCoins;
  const tier = getAgentCommissionTier(achievement);

  const updated: AgentInfo = { ...current, ...info, level: tier.level, commissionRatio: tier.ratio };

  if (typeof window !== 'undefined') {
    localStorage.setItem(AGENT_INFO_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_agent_info_updated', { detail: updated }));
  }
  return updated;
};

export const getStoredAgentHosts = (): AgentHostRecord[] => {
  if (typeof window === 'undefined') return INITIAL_AGENT_HOSTS;
  try {
    const raw = localStorage.getItem(AGENT_HOSTS_KEY);
    if (!raw) {
      localStorage.setItem(AGENT_HOSTS_KEY, JSON.stringify(INITIAL_AGENT_HOSTS));
      return INITIAL_AGENT_HOSTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_AGENT_HOSTS;
  } catch (e) {
    return INITIAL_AGENT_HOSTS;
  }
};

export const addAgentHost = (host: AgentHostRecord): void => {
  if (typeof window === 'undefined') return;
  const current = getStoredAgentHosts();
  const updated = [host, ...current.filter((h) => h.id !== host.id && h.displayId !== host.displayId)];
  localStorage.setItem(AGENT_HOSTS_KEY, JSON.stringify(updated));
  saveAgentInfo({ hostsCount: updated.length });
  window.dispatchEvent(new CustomEvent('amorex_agent_hosts_updated', { detail: updated }));
};

export const getStoredSubAgents = (): SubAgentRecord[] => {
  if (typeof window === 'undefined') return INITIAL_SUBAGENTS;
  try {
    const raw = localStorage.getItem(AGENT_SUBAGENTS_KEY);
    if (!raw) {
      localStorage.setItem(AGENT_SUBAGENTS_KEY, JSON.stringify(INITIAL_SUBAGENTS));
      return INITIAL_SUBAGENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SUBAGENTS;
  } catch (e) {
    return INITIAL_SUBAGENTS;
  }
};

export const addSubAgent = (subAgent: SubAgentRecord): void => {
  if (typeof window === 'undefined') return;
  const current = getStoredSubAgents();
  const updated = [subAgent, ...current.filter((s) => s.id !== subAgent.id && s.agentCode !== subAgent.agentCode)];
  localStorage.setItem(AGENT_SUBAGENTS_KEY, JSON.stringify(updated));
  saveAgentInfo({ subAgentsCount: updated.length });
  window.dispatchEvent(new CustomEvent('amorex_subagents_updated', { detail: updated }));
};

export const getStoredAgentTopUps = (): AgentTopUpRecord[] => {
  if (typeof window === 'undefined') return INITIAL_AGENT_TOPUPS;
  try {
    const raw = localStorage.getItem(AGENT_TOPUPS_KEY);
    if (!raw) {
      localStorage.setItem(AGENT_TOPUPS_KEY, JSON.stringify(INITIAL_AGENT_TOPUPS));
      return INITIAL_AGENT_TOPUPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_AGENT_TOPUPS;
  } catch (e) {
    return INITIAL_AGENT_TOPUPS;
  }
};

export const executeAgentUserTopUp = (
  targetDisplayId: string,
  coinsAmount: number,
  amountUSD: number
): { success: boolean; message: string; record?: AgentTopUpRecord } => {
  if (typeof window === 'undefined' || !targetDisplayId || coinsAmount <= 0) {
    return { success: false, message: 'Invalid target user ID or coin amount.' };
  }

  const registered = getStoredRegisteredUsers();
  const targetUser = registered.find((u) => u.displayId === targetDisplayId.trim() || u.id === targetDisplayId.trim());

  const targetName = targetUser ? targetUser.name : `User ${targetDisplayId}`;
  const targetId = targetUser ? targetUser.id : `usr-${targetDisplayId}`;

  const agentInfo = getStoredAgentInfo();
  const commissionEarnedUSD = Number((amountUSD * agentInfo.commissionRatio).toFixed(2));

  if (targetUser) {
    const updatedCoins = (targetUser.coins || 0) + coinsAmount;
    updateUserCoinsInRegistry(targetUser.id, updatedCoins, targetUser.gems);
  }

  const activeRaw = localStorage.getItem('amorex_user');
  if (activeRaw) {
    try {
      const activeUser: UserProfile = JSON.parse(activeRaw);
      if (activeUser.displayId === targetDisplayId.trim() || activeUser.id === targetDisplayId.trim()) {
        activeUser.coins = (activeUser.coins || 0) + coinsAmount;
        localStorage.setItem('amorex_user', JSON.stringify(activeUser));
        window.dispatchEvent(new CustomEvent('amorex_user_updated', { detail: activeUser }));
      }
    } catch (e) {}
  }

  const newRecord: AgentTopUpRecord = {
    id: `top-${Date.now()}`,
    targetUserId: targetId,
    targetUserDisplayId: targetDisplayId.trim(),
    targetUserName: targetName,
    targetUserAvatar: targetUser?.avatar,
    coinsTransferred: coinsAmount,
    amountUSD,
    commissionEarnedUSD,
    timestamp: Date.now(),
    status: 'COMPLETED'
  };

  const topUps = [newRecord, ...getStoredAgentTopUps()];
  localStorage.setItem(AGENT_TOPUPS_KEY, JSON.stringify(topUps));

  const nextAchievement = (agentInfo.thirtyDayAchievementCoins || 0) + coinsAmount;
  const nextDistributed = (agentInfo.totalDistributedCoins || 0) + coinsAmount;
  const nextEarnedUSD = (agentInfo.totalEarnedCommissionUSD || 0) + commissionEarnedUSD;
  const nextWalletCoins = Math.max(0, (agentInfo.walletCoins || 0) - coinsAmount);

  saveAgentInfo({ thirtyDayAchievementCoins: nextAchievement, totalDistributedCoins: nextDistributed, totalEarnedCommissionUSD: nextEarnedUSD, walletCoins: nextWalletCoins });

  recordCoinTransaction({ title: 'Top-up Bonus', type: 'credit', amount: coinsAmount, category: 'top_up', userId: targetId, note: `Transferred by Agent ${agentInfo.agencyName} ($${amountUSD} Top-up)` });

  window.dispatchEvent(new CustomEvent('amorex_agent_topups_updated', { detail: topUps }));

  return { success: true, message: `Successfully credited +${coinsAmount.toLocaleString()} Coins to ${targetName}! Earned +$${commissionEarnedUSD} commission.`, record: newRecord };
};

export const CP_QUESTS_KEY = 'amorex_cp_quests';
export const CP_MEMOIRS_KEY = 'amorex_cp_memoirs';
export const CP_PARTNER_KEY = 'amorex_cp_partner';

export const INITIAL_CP_QUESTS: CPQuestItem[] = [
  { id: 'cpq-1', title: 'Send 5 romantic whispers in chat', description: 'Keep the romance alive', scope: 'daily', progress: 3, target: 5, rewardCoins: 150, rewardIntimacy: 25, isCompleted: false, isClaimed: false, actionType: 'send_message' },
  { id: 'cpq-2', title: 'Co-host or join Voice Party for 5 mins', description: 'Hang out together', scope: 'daily', progress: 5, target: 5, rewardCoins: 250, rewardIntimacy: 50, isCompleted: true, isClaimed: false, actionType: 'voice_party' },
  { id: 'cpq-3', title: '1v1 Video date with your CP', description: 'Have a private video chat', scope: 'daily', progress: 0, target: 1, rewardCoins: 400, rewardIntimacy: 80, isCompleted: false, isClaimed: false, actionType: 'video_call' },
  { id: 'cpq-4', title: 'Exchange 3 Intimacy Gifts this week', description: 'Send special gifts', scope: 'weekly', progress: 2, target: 3, rewardCoins: 800, rewardIntimacy: 200, isCompleted: false, isClaimed: false, actionType: 'send_gift' },
  { id: 'cpq-5', title: 'Like 10 Moments on the Couple Feed', description: 'Support each other', scope: 'weekly', progress: 7, target: 10, rewardCoins: 500, rewardIntimacy: 120, isCompleted: false, isClaimed: false, actionType: 'feed_like' }
];

export const INITIAL_CP_MEMOIRS: CPMemoirItem[] = [
  { id: 'mem-1', title: 'First Encounter in Acoustic Lounge', date: 'July 15, 2026', photoUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80', description: 'Met in the Romantic Acoustic Lounge.', milestoneLevel: 1 },
  { id: 'mem-2', title: 'First 1v1 Midnight Video Call', date: 'July 28, 2026', photoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80', description: 'First face-to-face video call.', milestoneLevel: 3 },
  { id: 'mem-3', title: 'Official CP Space Pledge', date: 'August 14, 2026', photoUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80', description: 'Became official CP partners.', milestoneLevel: 5 }
];

export const INITIAL_CP_GIFTS: CPGiftItem[] = [
  { id: 'cpg-1', name: 'Love Letter', icon: '💌', coinPrice: 50, intimacyValue: 15, description: 'A handwritten letter' },
  { id: 'cpg-2', name: 'Rose Bouquet', icon: '🌹', coinPrice: 199, intimacyValue: 60, description: '99 vibrant scarlet roses' },
  { id: 'cpg-3', name: 'Crystal Tiara', icon: '👑', coinPrice: 599, intimacyValue: 200, description: 'Glittering Swarovski crown' },
  { id: 'cpg-4', name: 'Diamond Love Ring', icon: '💍', coinPrice: 1299, intimacyValue: 500, description: 'Pristine diamond solitaire' },
  { id: 'cpg-5', name: 'Fairytale Castle', icon: '🏰', coinPrice: 3999, intimacyValue: 1800, description: 'Grand enchanted castle' }
];

export const getStoredCPQuests = (): CPQuestItem[] => {
  if (typeof window === 'undefined') return INITIAL_CP_QUESTS;
  try {
    const raw = localStorage.getItem(CP_QUESTS_KEY);
    if (!raw) {
      localStorage.setItem(CP_QUESTS_KEY, JSON.stringify(INITIAL_CP_QUESTS));
      return INITIAL_CP_QUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CP_QUESTS;
  }
};

export const updateCPQuestProgress = (actionType: string, increment: number = 1): CPQuestItem[] => {
  const current = getStoredCPQuests();
  const updated = current.map((q) => {
    if (q.actionType === actionType && !q.isClaimed) {
      const newProgress = Math.min(q.target, q.progress + increment);
      return { ...q, progress: newProgress, isCompleted: newProgress >= q.target };
    }
    return q;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(CP_QUESTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_cp_quests_updated', { detail: updated }));
  }
  return updated;
};

export const claimCPQuestReward = (
  questId: string
): { success: boolean; rewardCoins: number; rewardIntimacy: number } => {
  const current = getStoredCPQuests();
  let rewardCoins = 0;
  let rewardIntimacy = 0;
  let success = false;

  const updated = current.map((q) => {
    if (q.id === questId && q.isCompleted && !q.isClaimed) {
      rewardCoins = q.rewardCoins;
      rewardIntimacy = q.rewardIntimacy;
      success = true;
      return { ...q, isClaimed: true };
    }
    return q;
  });

  if (success && typeof window !== 'undefined') {
    localStorage.setItem(CP_QUESTS_KEY, JSON.stringify(updated));
    recordCoinTransaction({ title: `Quest Reward: ${current.find((q) => q.id === questId)?.title || 'CP Quest'}`, type: 'credit', amount: rewardCoins, category: 'quest' });
    try {
      const u = localStorage.getItem('amorex_user');
      if (u) {
        const user = JSON.parse(u);
        user.coins = (user.coins || 0) + rewardCoins;
        localStorage.setItem('amorex_user', JSON.stringify(user));
        window.dispatchEvent(new CustomEvent('amorex_user_updated', { detail: user }));
      }
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('amorex_cp_quests_updated', { detail: updated }));
  }

  return { success, rewardCoins, rewardIntimacy };
};
