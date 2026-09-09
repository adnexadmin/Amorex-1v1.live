export type NavigationTab = 'LIVE' | 'MOMENTS' | 'PARTY' | 'MESSAGES' | 'PROFILE';

export type UserRole = 'USER' | 'VERIFIED_HOST' | 'AGENT' | 'SUPER_ADMIN';

export type Gender = 'female' | 'male' | 'other';

export type Region =
  | 'Oman'
  | 'India'
  | 'UAE'
  | 'Saudi Arabia'
  | 'Qatar'
  | 'Kuwait'
  | 'Bahrain'
  | 'Bangladesh'
  | 'Pakistan'
  | 'Middle East'
  | 'Southeast Asia'
  | 'Global'
  | string;

export interface UserProfile {
  id: string;
  displayId: string; // 8-digit unique ID e.g. "88492019"
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  avatarUrl?: string;
  coverPhoto?: string;
  gender: Gender;
  age: number;
  birthday?: string; // e.g. "2002-05-18"
  region: Region;
  signature?: string; // Personal signature
  locationVisible?: boolean; // Hidden/Visible toggle
  contentLanguage?: 'English' | 'Malayalam' | 'Hindi' | 'Arabic' | string;
  tags?: string[];
  role: UserRole;
  is_super_admin: boolean;
  isVerifiedHost: boolean;
  faceVerified: boolean;
  level: number;
  experience: number;
  coins: number; // Talk-time coins
  gems: number; // Gift earnings
  vouchers: number; // 60-second video call vouchers
  bio: string;
  followingCount: number;
  followersCount: number;
  friendsCount: number;
  equippedFrame?: string;
  equippedEntrance?: string;
  equippedCard?: string;
  cpPartner?: {
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
    level: number;
    intimacyPoints: number;
    anniversaryDate: string;
  };
  deviceFingerprint: string;
  isMuted?: boolean;
  isFrozen?: boolean;
  lastLoginDate?: string;
  signInStreak?: number;
  signedDays?: number[];
  registeredAt?: number;
  lastActiveAt?: number;
  timeSpentSeconds?: number;
  isRealUser?: boolean;
  registrationMethod?: 'email' | 'phone' | 'google' | 'guest';
}

export interface StreamHost {
  id: string;
  displayId: string;
  name: string;
  avatar: string;
  coverImage: string;
  videoUrl?: string;
  age: number;
  gender: Gender;
  region: Region;
  level: number;
  tags: string[];
  isLive: boolean;
  isPopular: boolean;
  isNew: boolean;
  viewerCount: number;
  bio: string;
  ratePerMin: number; // in coins (default 60)
  callStatus: 'available' | 'in_call' | 'busy';
  greetingAudio?: string;
  languages?: string[];
  primaryLanguage?: string;
}

export interface MomentPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  isVerified: boolean;
  timestamp: string;
  content: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  tags: string[];
  comments?: Array<{
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    time: string;
  }>;
}

export interface PartySeat {
  seatIndex: number;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  userLevel?: number;
  isMuted?: boolean;
  isSpeaking?: boolean;
  isHost?: boolean;
  frameUrl?: string;
}

export interface PartyRoom {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  coverImage: string;
  category: 'Chat' | 'Dating' | 'Singing' | 'Gaming' | 'Lounge';
  seats: PartySeat[];
  mode: 'audio' | 'video';
  wallpaper: string;
  bgmPlaying: boolean;
  bgmGenre: 'Pop' | 'RnB' | 'Rock' | 'Romantic' | 'LoFi';
  isLocked: boolean;
  onlineCount: number;
  tag: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  type: 'text' | 'voice' | 'image' | 'gift' | 'call_log';
  content: string;
  mediaUrl?: string;
  voiceDuration?: number;
  giftInfo?: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    coinValue: number;
  };
  callInfo?: {
    durationSec: number;
    callType: 'audio' | 'video';
    coinsCharged: number;
  };
  timestamp: string;
  isRead?: boolean;
  translations?: Record<string, string>; // language code -> translated string
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantDisplayId: string;
  participantName: string;
  participantAvatar: string;
  isOnline: boolean;
  isStranger?: boolean;
  isGroup?: boolean;
  groupMembers?: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Array<{
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    type?: 'text' | 'voice' | 'image' | 'video' | 'gift';
    mediaUrl?: string;
  }>;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    displayId: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
    level: number;
    isVerified: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface VirtualGift {
  id: string;
  name: string;
  price: number; // in coins
  coinCost?: number; // alias for price
  icon: string;
  animationType: 'rose' | 'heart' | 'ring' | 'car' | 'castle' | 'rocket' | 'yacht';
  category: 'Popular' | 'Romantic' | 'Luxury' | 'Special';
}

export interface RacingCar {
  id: number;
  name: string;
  color: string;
  odds: number;
  currentProgress: number;
  speed: number;
}

export interface UTRRequest {
  id: string;
  userId: string;
  userDisplayId: string;
  userName: string;
  amountINR: number;
  coinsExpected: number;
  utrNumber: string;
  screenshotUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardCoins: number;
  isClaimed: boolean;
}

export interface BackpackItem {
  id: string;
  name: string;
  type: 'frame' | 'entrance' | 'card';
  icon: string;
  previewUrl: string;
  description: string;
  daysRemaining: number;
  isEquipped: boolean;
}

export type VideoFilterType =
  | 'none'
  | 'heart-aura'
  | 'sparkle-glow'
  | 'vintage-love'
  | 'beauty-mode'
  | 'soft-glow'
  | 'sepia'
  | 'romantic'
  | 'candlelight'
  | 'dreamy'
  | 'golden-hour'
  | 'cherry-blossom'
  | 'vintage-noir';

export interface CallHistoryItem {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostCountry?: string;
  hostLevel?: number;
  durationSec: number;
  coinsCharged: number;
  timestamp: string; // ISO date string or formatted timestamp
  rating?: number;
  quality?: string;
  status: 'completed' | 'missed' | 'declined';
  videoFilterUsed?: VideoFilterType;
}

export type ReportReasonCategory =
  | 'harassment'
  | 'inappropriate_content'
  | 'scam_fraud'
  | 'underage'
  | 'privacy_recording'
  | 'hate_speech'
  | 'other';

export type ReportSourceContext = '1v1_call' | 'party_room';

export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface UserReport {
  id: string; // e.g. "REP-882019"
  reportedUserId: string;
  reportedUserName: string;
  reportedUserAvatar?: string;
  reportedUserDisplayId?: string;
  reporterUserId: string;
  reporterUserName: string;
  reporterUserDisplayId?: string;
  sourceContext: ReportSourceContext;
  contextDetails?: {
    roomTitle?: string;
    roomId?: string;
    callDurationSec?: number;
    seatNumber?: number;
  };
  category: ReportReasonCategory;
  categoryLabel: string;
  description: string;
  quickTags: string[];
  createdAt: number; // Date.now()
  status: ReportStatus;
  adminNotes?: string;
  actionTaken?: 'NONE' | 'MUTED' | 'FROZEN' | 'WARNED' | 'DISMISSED';
  resolvedAt?: number;
  resolvedBy?: string;
}

export type TransactionType = 'credit' | 'debit';

export type CoinLedgerCategory =
  | 'task'
  | 'video_chat'
  | 'sign_in'
  | 'gift'
  | 'game'
  | 'top_up'
  | 'consumption_return'
  | 'agent_transfer'
  | 'mint'
  | 'quest'
  | 'recharge'
  | 'cp_gift'
  | 'other';

export interface CoinLedgerItem {
  id: string;
  userId?: string;
  title: string; // e.g. "Task Reward", "Video Chat Cost", "Sign-in Reward", "Give Gift", "Game Bet", "Top-up Bonus", "Consumption Return"
  type: TransactionType; // 'credit' | 'debit'
  amount: number; // positive number, e.g. 50, 360
  timestamp: number; // ms
  dateFormatted?: string;
  category?: CoinLedgerCategory | string;
  balanceAfter?: number;
  referenceId?: string;
  note?: string;
}

export interface CoinPricingPackage {
  id: string;
  usd: number;
  coins: number;
  bonusCoins?: number;
  bonusLabel?: string;
  tag?: string;
  isPopular?: boolean;
}

export interface FinancialSettings {
  baseCoinsPerDollar: number; // Default 6,000 coins per $1 (so $5 = 30,000, $10 = 60,000)
  packages: CoinPricingPackage[];
  agentRebateEnabled: boolean;
  minWithdrawalCoins: number;
  updatedAt: number;
}

export interface AgentInfo {
  agencyName: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  email: string;
  agentCode: string;
  registeredAt: number;
  level: number; // Level 1 to 6
  thirtyDayAchievementCoins: number;
  commissionRatio: number; // 0.04 to 0.24 (4% to 24%)
  totalEarnedCommissionUSD: number;
  totalDistributedCoins: number;
  subAgentsCount: number;
  hostsCount: number;
  walletCoins: number;
}

export interface AgentHostRecord {
  id: string;
  name: string;
  displayId: string;
  avatar: string;
  monthlyHours: number;
  dailyHours: number;
  giftCoinsReceived: number;
  status: 'active' | 'live' | 'offline';
  joinedAt: string;
}

export interface SubAgentRecord {
  id: string;
  agencyName: string;
  agentCode: string;
  contactName: string;
  level: number;
  thirtyDayCoins: number;
  commissionRatio: number;
  referralCommissionEarned: number;
  joinedAt: string;
}

export interface AgentTopUpRecord {
  id: string;
  targetUserId: string;
  targetUserDisplayId: string;
  targetUserName: string;
  targetUserAvatar?: string;
  coinsTransferred: number;
  amountUSD: number;
  commissionEarnedUSD: number;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING';
}

export interface CPQuestItem {
  id: string;
  title: string;
  description: string;
  scope: 'daily' | 'weekly';
  progress: number;
  target: number;
  rewardCoins: number;
  rewardIntimacy: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionType: 'send_message' | 'voice_party' | 'video_call' | 'send_gift' | 'feed_like';
}

export interface CPMemoirItem {
  id: string;
  title: string;
  date: string;
  photoUrl: string;
  description: string;
  milestoneLevel: number;
}

export interface CPGiftItem {
  id: string;
  name: string;
  icon: string;
  coinPrice: number;
  intimacyValue: number;
  animationKey?: string;
  description: string;
}



