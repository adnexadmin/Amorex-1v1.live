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
  coins: 100000000, // 100M God Mode Coins
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

// Generate unique 8-digit ID
export const generateDisplayId = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

// Initial Gifts
export const VIRTUAL_GIFTS: VirtualGift[] = [
  { id: 'gift-rose', name: 'Passion Rose', price: 10, icon: '🌹', animationType: 'rose', category: 'Popular' },
  { id: 'gift-heart', name: 'Heart Arrow', price: 50, icon: '💘', animationType: 'heart', category: 'Romantic' },
  { id: 'gift-ring', name: 'Diamond Solitaire', price: 299, icon: '💍', animationType: 'ring', category: 'Romantic' },
  { id: 'gift-car', name: 'Cyber Sportscar', price: 999, icon: '🏎️', animationType: 'car', category: 'Luxury' },
  { id: 'gift-yacht', name: 'Neon Super Yacht', price: 2999, icon: '🛥️', animationType: 'yacht', category: 'Luxury' },
  { id: 'gift-castle', name: 'Moonlight Palace', price: 9999, icon: '🏰', animationType: 'castle', category: 'Special' },
  { id: 'gift-rocket', name: 'Cosmic Love Rocket', price: 19999, icon: '🚀', animationType: 'rocket', category: 'Special' }
];

// Initial Stream Hosts
export const INITIAL_HOSTS: StreamHost[] = [
  {
    id: 'host-1',
    displayId: '88204912',
    name: 'Aanya Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-phone-41551-large.mp4',
    age: 22,
    gender: 'female',
    region: 'India',
    level: 34,
    tags: ['Singing', 'Late Night', 'Romantic'],
    isLive: true,
    isPopular: true,
    isNew: false,
    viewerCount: 1420,
    bio: 'Singer & romantic storyteller 🎶 Looking for meaningful chats and laughter!',
    ratePerMin: 60,
    callStatus: 'available',
    languages: ['Hindi', 'English'],
    primaryLanguage: 'Hindi'
  },
  {
    id: 'host-2',
    displayId: '91482034',
    name: 'Layla Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-smiling-while-video-calling-with-her-phone-41556-large.mp4',
    age: 24,
    gender: 'female',
    region: 'Middle East',
    level: 48,
    tags: ['Arabic Vibes', 'Coffee', 'VIP Host'],
    isLive: true,
    isPopular: true,
    isNew: false,
    viewerCount: 2890,
    bio: 'Dubai nights & warm coffee talks ☕️ Top 10 Amorex Crown Streamer 👑',
    ratePerMin: 60,
    callStatus: 'available',
    languages: ['Arabic', 'English'],
    primaryLanguage: 'Arabic'
  },
  {
    id: 'host-3',
    displayId: '77291045',
    name: 'Nusrat Jahan',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-video-call-at-home-41555-large.mp4',
    age: 21,
    gender: 'female',
    region: 'Bangladesh',
    level: 19,
    tags: ['New Star', 'Bengali Poetry', 'Cute'],
    isLive: true,
    isPopular: false,
    isNew: true,
    viewerCount: 640,
    bio: 'Dancer & literature lover from Dhaka! Let us share poetry and stories 🌸',
    ratePerMin: 60,
    callStatus: 'available',
    languages: ['Bengali', 'English'],
    primaryLanguage: 'Bengali'
  },
  {
    id: 'host-4',
    displayId: '66391024',
    name: 'Zoya Malik',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-a-laptop-41553-large.mp4',
    age: 23,
    gender: 'female',
    region: 'Pakistan',
    level: 27,
    tags: ['Fashion', 'Lahore Vibes', 'Urdu Ghazal'],
    isLive: true,
    isPopular: true,
    isNew: false,
    viewerCount: 1830,
    bio: 'Urdu ghazals & fashion model ✨ Let us connect on 1v1 video calls!',
    ratePerMin: 60,
    callStatus: 'available',
    languages: ['Urdu', 'English', 'Punjabi'],
    primaryLanguage: 'Urdu'
  },
  {
    id: 'host-5',
    displayId: '55198274',
    name: 'Mai Nguyen',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-video-call-at-home-41555-large.mp4',
    age: 22,
    gender: 'female',
    region: 'Southeast Asia',
    level: 31,
    tags: ['Gaming', 'Party Queen', 'Dance'],
    isLive: true,
    isPopular: true,
    isNew: false,
    viewerCount: 1120,
    bio: 'Gamer girl & EDM lover 🎧 Join my party room or call me 1v1!',
    ratePerMin: 60,
    callStatus: 'available',
    languages: ['Vietnamese', 'English'],
    primaryLanguage: 'English'
  },
  {
    id: 'host-6',
    displayId: '44291823',
    name: 'Kabir Verma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-having-a-video-call-with-smartphone-41557-large.mp4',
    age: 25,
    gender: 'male',
    region: 'India',
    level: 42,
    tags: ['Guitarist', 'Bollywood', 'Humor'],
    isLive: true,
    isPopular: true,
    isNew: false,
    viewerCount: 970,
    bio: 'Guitar tunes & late night acoustic melodies 🎸 Let us talk music and love.',
    ratePerMin: 60,
    callStatus: 'available',
    languages: ['Hindi', 'English', 'Punjabi'],
    primaryLanguage: 'Hindi'
  },
  {
    id: 'host-7',
    displayId: '33182947',
    name: 'Priya Pillai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-phone-41551-large.mp4',
    age: 23,
    gender: 'female',
    region: 'India',
    level: 22,
    tags: ['Malayalam', 'Kerala Vibes', 'Sweet'],
    isLive: true,
    isPopular: false,
    isNew: true,
    viewerCount: 520,
    bio: 'South Indian charm & soulful conversations 🌴 Native Malayalam & English!',
    ratePerMin: 60,
    callStatus: 'available',
    languages: ['Malayalam', 'English', 'Tamil'],
    primaryLanguage: 'Malayalam'
  },
  {
    id: 'host-8',
    displayId: '22918374',
    name: 'Tariq Al-Hashemi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-having-a-video-call-with-smartphone-41557-large.mp4',
    age: 26,
    gender: 'male',
    region: 'Middle East',
    level: 39,
    tags: ['Car Enthusiast', 'Gamer', 'Deep Voice'],
    isLive: false,
    isPopular: false,
    isNew: false,
    viewerCount: 0,
    bio: 'Sports cars & chill gaming sessions 🏎️ Available for private audio/video calls!',
    ratePerMin: 60,
    callStatus: 'available',
    languages: ['Arabic', 'English'],
    primaryLanguage: 'Arabic'
  }
];

// Initial Moments Posts
export const INITIAL_MOMENTS: MomentPost[] = [
  {
    id: 'post-1',
    authorId: 'host-1',
    authorName: 'Aanya Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    authorLevel: 34,
    isVerified: true,
    timestamp: '15 mins ago',
    content: 'Just finished my live singing rehearsal! Ready for late-night romantic 1v1 video calls tonight. Who is joining me? 💖✨',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    likesCount: 342,
    commentsCount: 28,
    sharesCount: 14,
    hasLiked: false,
    tags: ['#AmorexRomance', '#Singing', '#LiveTonight'],
    comments: [
      { id: 'c1', userName: 'Rajesh_K', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', text: 'You were amazing on stage! Sending a castle gift tonight 🏰', time: '10m ago' },
      { id: 'c2', userName: 'Samir_99', userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', text: 'Call me 1v1 soon! 🌹', time: '5m ago' }
    ]
  },
  {
    id: 'post-2',
    authorId: 'host-2',
    authorName: 'Layla Al-Mansoor',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    authorLevel: 48,
    isVerified: true,
    timestamp: '1 hour ago',
    content: 'Sunset in Dubai from the 45th floor 🌅 Celebrating our Party Room victory in Champ Car Racing! Huge shoutout to my top gifters!',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    likesCount: 890,
    commentsCount: 74,
    sharesCount: 39,
    hasLiked: true,
    tags: ['#DubaiVibes', '#PartyRoom', '#TopHost'],
    comments: [
      { id: 'c3', userName: 'CrownKing', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', text: 'Best host on Amorex! Always supporting you 👑', time: '40m ago' }
    ]
  },
  {
    id: 'post-3',
    authorId: 'host-4',
    authorName: 'Zoya Malik',
    authorAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
    authorLevel: 27,
    isVerified: true,
    timestamp: '3 hours ago',
    content: '"Chandni raatein aur meethi baatein..." 🌙 Urdu poetry clip from yesterday’s 12-seat audio party. Tap to listen and connect!',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
    likesCount: 512,
    commentsCount: 42,
    sharesCount: 19,
    hasLiked: false,
    tags: ['#Poetry', '#Ghazal', '#UrduVibes'],
    comments: []
  }
];

// Initial 12-seat Party Rooms
export const INITIAL_ROOMS: PartyRoom[] = [
  {
    id: 'room-1',
    title: '💖 Late Night Romantic Dating & Voice Lounge',
    hostId: 'host-1',
    hostName: 'Aanya Sharma',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    category: 'Dating',
    mode: 'audio',
    wallpaper: 'romantic-neon',
    bgmPlaying: true,
    bgmGenre: 'Romantic',
    isLocked: false,
    onlineCount: 84,
    tag: '🔥 HOT',
    seats: [
      { seatIndex: 0, isHost: true, userId: 'host-1', userName: 'Aanya Sharma 👑', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', userLevel: 34, isSpeaking: true },
      { seatIndex: 1, userId: 'user-vip-1', userName: 'Aryan_Roy', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', userLevel: 28, isSpeaking: false },
      { seatIndex: 2, userId: 'user-vip-2', userName: 'Fatima_K', userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80', userLevel: 19, isSpeaking: true },
      { seatIndex: 3 },
      { seatIndex: 4, userId: 'user-vip-3', userName: 'Samir_DXB', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', userLevel: 45, isSpeaking: false },
      { seatIndex: 5 },
      { seatIndex: 6 },
      { seatIndex: 7 },
      { seatIndex: 8 },
      { seatIndex: 9 },
      { seatIndex: 10 },
      { seatIndex: 11 }
    ]
  },
  {
    id: 'room-2',
    title: '🏎️ Champ Car Racing & High Stakes Lounge',
    hostId: 'host-2',
    hostName: 'Layla Al-Mansoor',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    category: 'Gaming',
    mode: 'audio',
    wallpaper: 'cyber-dark',
    bgmPlaying: true,
    bgmGenre: 'Pop',
    isLocked: false,
    onlineCount: 142,
    tag: '⚡️ 10x JACKPOT',
    seats: [
      { seatIndex: 0, isHost: true, userId: 'host-2', userName: 'Layla 👑', userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', userLevel: 48, isSpeaking: true },
      { seatIndex: 1, userId: 'user-vip-4', userName: 'CyberKing', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', userLevel: 52, isSpeaking: true },
      { seatIndex: 2 },
      { seatIndex: 3 },
      { seatIndex: 4 },
      { seatIndex: 5 },
      { seatIndex: 6 },
      { seatIndex: 7 },
      { seatIndex: 8 },
      { seatIndex: 9 },
      { seatIndex: 10 },
      { seatIndex: 11 }
    ]
  },
  {
    id: 'room-3',
    title: '🎤 Acoustica & Soul Singing Studio',
    hostId: 'host-6',
    hostName: 'Kabir Verma',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    category: 'Singing',
    mode: 'audio',
    wallpaper: 'obsidian-purple',
    bgmPlaying: false,
    bgmGenre: 'RnB',
    isLocked: false,
    onlineCount: 56,
    tag: '🎵 LIVE',
    seats: [
      { seatIndex: 0, isHost: true, userId: 'host-6', userName: 'Kabir Guitar', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', userLevel: 42, isSpeaking: true },
      { seatIndex: 1 },
      { seatIndex: 2 },
      { seatIndex: 3 },
      { seatIndex: 4 },
      { seatIndex: 5 },
      { seatIndex: 6 },
      { seatIndex: 7 },
      { seatIndex: 8 },
      { seatIndex: 9 },
      { seatIndex: 10 },
      { seatIndex: 11 }
    ]
  }
];

// Initial Conversations
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant: {
      id: 'host-1',
      displayId: '88204912',
      name: 'Aanya Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isOnline: true,
      level: 34,
      isVerified: true
    },
    lastMessage: 'Hey! Loved your greeting in my live room earlier. Shall we start a 1v1 private call? 💖',
    lastMessageTime: '12:45 PM',
    unreadCount: 1
  },
  {
    id: 'conv-2',
    participant: {
      id: 'host-2',
      displayId: '91482034',
      name: 'Layla Al-Mansoor',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      isOnline: true,
      level: 48,
      isVerified: true
    },
    lastMessage: 'Marhaban! Thank you for the Cyber Sportscar gift in the Champ Car game! 🏎️',
    lastMessageTime: 'Yesterday',
    unreadCount: 0
  },
  {
    id: 'conv-3',
    participant: {
      id: 'host-7',
      displayId: '33182947',
      name: 'Priya Pillai',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      isOnline: false,
      lastSeen: '15m ago',
      level: 22,
      isVerified: true
    },
    lastMessage: 'സുഖമാണോ? (Are you doing well?) Let us chat in Malayalam anytime! 🌸',
    lastMessageTime: 'Aug 22',
    unreadCount: 0
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm1',
      senderId: 'host-1',
      senderName: 'Aanya Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      recipientId: 'current-user',
      type: 'text',
      content: 'Hello sweetheart! Welcome to Amorex Live! ✨',
      timestamp: '12:30 PM',
      translations: {
        'ml': 'ഹലോ പ്രിയപ്പെട്ടവരേ! അമൊറെക്സ് ലൈവിലേക്ക് സ്വാഗതം! ✨',
        'hi': 'नमस्ते प्रिय! अमोरिक्स लाइव में आपका स्वागत है! ✨',
        'ar': 'مرحباً عزيزي! مرحباً بك في أموريكس لايف! ✨'
      }
    },
    {
      id: 'm2',
      senderId: 'current-user',
      senderName: 'Me',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      recipientId: 'host-1',
      type: 'gift',
      content: 'Sent a Passion Rose 🌹',
      giftInfo: {
        giftId: 'gift-rose',
        giftName: 'Passion Rose',
        giftIcon: '🌹',
        coinValue: 10
      },
      timestamp: '12:35 PM'
    },
    {
      id: 'm3',
      senderId: 'host-1',
      senderName: 'Aanya Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      recipientId: 'current-user',
      type: 'text',
      content: 'Hey! Loved your greeting in my live room earlier. Shall we start a 1v1 private call? 💖',
      timestamp: '12:45 PM',
      translations: {
        'ml': 'ഹായ്! മുമ്പ് എന്റെ ലൈവ് റൂമിൽ നിങ്ങളുടെ ആശംസകൾ എനിക്ക് ഇഷ്ടപ്പെട്ടു. നമുക്ക് ഒരു 1v1 സ്വകാര്യ കോൾ ആരംഭിക്കാമോ? 💖',
        'hi': 'अरे! मुझे पहले मेरे लाइव रूम में आपकी शुभकामना बहुत पसंद आई। क्या हम 1v1 प्राइवेट कॉल शुरू करें? 💖',
        'ar': 'مرحباً! أحببت تحيتك في غرفتي المباشرة من قبل. هل نبدأ مكالمة خاصة 1v1؟ 💖'
      }
    }
  ]
};

// Daily Tasks & Sign-in
export const INITIAL_TASKS: DailyTask[] = [
  { id: 't1', title: 'Daily App Check-In', description: 'Log in and claim your daily romance bonus', progress: 1, target: 1, rewardCoins: 100, isClaimed: true },
  { id: 't2', title: 'Send 3 Heart Likes', description: 'Like moments from creators on the feed', progress: 2, target: 3, rewardCoins: 200, isClaimed: false },
  { id: 't3', title: 'Join a 12-Seat Party Room', description: 'Hang out in a live party room for 3 mins', progress: 3, target: 3, rewardCoins: 350, isClaimed: false },
  { id: 't4', title: 'Place a Bet in Champ Car', description: 'Try your luck on the turbo racing track', progress: 1, target: 1, rewardCoins: 450, isClaimed: false },
  { id: 't5', title: '1v1 Romantic Video Call', description: 'Connect with a host for at least 1 minute', progress: 0, target: 1, rewardCoins: 800, isClaimed: false }
];

export const INITIAL_BACKPACK: BackpackItem[] = [
  {
    id: 'bp-1',
    name: 'Neon Cupid Heart Ring',
    type: 'frame',
    icon: '💖',
    previewUrl: 'border-pink-500 shadow-pink-500/50',
    description: 'Pulsing pink heart avatar aura with sparkling Cupid wings',
    daysRemaining: 29,
    isEquipped: true
  },
  {
    id: 'bp-2',
    name: 'Imperial Golden Crown',
    type: 'frame',
    icon: '👑',
    previewUrl: 'border-amber-400 shadow-amber-400/60',
    description: 'Majestic royal golden frame for high-roller room entrances',
    daysRemaining: 15,
    isEquipped: false
  },
  {
    id: 'bp-3',
    name: 'Cyber Supercar Drift Entrance',
    type: 'entrance',
    icon: '🏎️',
    previewUrl: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    description: 'Dramatic tire screeching entry effect when joining any party room',
    daysRemaining: 22,
    isEquipped: true
  },
  {
    id: 'bp-4',
    name: '1v1 Discovery Turbo Boost',
    type: 'card',
    icon: '⚡️',
    previewUrl: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: '3x priority match ranking on the 1v1 Video Match radar',
    daysRemaining: 7,
    isEquipped: false
  }
];

export const INITIAL_UTR_REQUESTS: UTRRequest[] = [
  {
    id: 'utr-101',
    userId: 'usr-9281',
    userDisplayId: '44819203',
    userName: 'Vikram Singh',
    amountINR: 1400,
    coinsExpected: 110000,
    utrNumber: '428192039182',
    status: 'PENDING',
    timestamp: '10 mins ago'
  },
  {
    id: 'utr-102',
    userId: 'usr-3341',
    userDisplayId: '77291044',
    userName: 'Rohan Deshmukh',
    amountINR: 280,
    coinsExpected: 20000,
    utrNumber: '428100923847',
    status: 'APPROVED',
    timestamp: '2 hours ago'
  }
];

export const INITIAL_CHAT_CONVERSATIONS = [
  {
    id: 'conv-1',
    participantId: 'host-1',
    participantDisplayId: '88204912',
    participantName: 'Aanya Sharma',
    participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'Hey! Loved your greeting in my live room earlier. Shall we start a 1v1 private call? 💖',
    lastMessageTime: '12:45 PM',
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'host-1', text: 'Hello sweetheart! Welcome to Amorex Live! ✨', timestamp: '12:30 PM' },
      { id: 'm2', senderId: 'usr-default-01', text: 'Sent a Passion Rose 🌹', timestamp: '12:35 PM' },
      { id: 'm3', senderId: 'host-1', text: 'Hey! Loved your greeting in my live room earlier. Shall we start a 1v1 private call? 💖', timestamp: '12:45 PM' }
    ]
  },
  {
    id: 'conv-2',
    participantId: 'host-2',
    participantDisplayId: '91482034',
    participantName: 'Layla Al-Mansoor',
    participantAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    isOnline: true,
    lastMessage: 'Marhaban! Thank you for the Cyber Sportscar gift in the Champ Car game! 🏎️',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'm4', senderId: 'host-2', text: 'Marhaban! Welcome to Dubai VIP lounge!', timestamp: 'Yesterday' }
    ]
  },
  {
    id: 'conv-3',
    participantId: 'host-7',
    participantDisplayId: '33182947',
    participantName: 'Priya Pillai',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    isOnline: false,
    lastMessage: 'സുഖമാണോ? (Are you doing well?) Let us chat in Malayalam anytime! 🌸',
    lastMessageTime: 'Aug 22',
    unreadCount: 0,
    messages: [
      { id: 'm5', senderId: 'host-7', text: 'സുഖമാണോ? (Are you doing well?) Let us chat in Malayalam anytime! 🌸', timestamp: 'Aug 22' }
    ]
  }
];

// CamelCase Aliases for Application Component consumption
export const initialUser = INITIAL_USER;
export const initialHosts = INITIAL_HOSTS;
export const initialPartyRooms = INITIAL_ROOMS;
export const initialMoments = INITIAL_MOMENTS;
export const initialConversations = INITIAL_CHAT_CONVERSATIONS;
export const initialBackpack = INITIAL_BACKPACK;
export const initialTasks = INITIAL_TASKS;
export const initialUTRRequests = INITIAL_UTR_REQUESTS;
export const virtualGifts = VIRTUAL_GIFTS.map(g => ({ ...g, coinCost: g.price }));

// Initial Call History for 1v1 Video Calls
export const INITIAL_CALL_HISTORY: CallHistoryItem[] = [
  {
    id: 'call-hist-1',
    hostId: 'host-1',
    hostName: 'Aanya Sharma',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    hostCountry: 'India',
    hostLevel: 34,
    durationSec: 324, // 5m 24s
    coinsCharged: 324,
    timestamp: 'Today, 10:45 PM',
    rating: 5,
    quality: 'HD 1080p',
    status: 'completed',
    videoFilterUsed: 'heart-aura'
  },
  {
    id: 'call-hist-2',
    hostId: 'host-2',
    hostName: 'Layla Al-Mansoor',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    hostCountry: 'Middle East',
    hostLevel: 48,
    durationSec: 480, // 8m 00s
    coinsCharged: 480,
    timestamp: 'Yesterday, 9:18 PM',
    rating: 5,
    quality: 'HD 1080p',
    status: 'completed',
    videoFilterUsed: 'sparkle-glow'
  },
  {
    id: 'call-hist-3',
    hostId: 'host-4',
    hostName: 'Zoya Malik',
    hostAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
    hostCountry: 'Pakistan',
    hostLevel: 27,
    durationSec: 215, // 3m 35s
    coinsCharged: 215,
    timestamp: '2 days ago',
    rating: 5,
    quality: 'HD 1080p',
    status: 'completed',
    videoFilterUsed: 'vintage-love'
  },
  {
    id: 'call-hist-4',
    hostId: 'host-3',
    hostName: 'Nusrat Jahan',
    hostAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    hostCountry: 'Bangladesh',
    hostLevel: 19,
    durationSec: 156, // 2m 36s
    coinsCharged: 156,
    timestamp: '3 days ago',
    rating: 4,
    quality: 'HD 1080p',
    status: 'completed',
    videoFilterUsed: 'cherry-blossom'
  }
];

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
    console.error('Error reading call history:', e);
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

// ==========================================
// REAL REGISTERED USERS PERSISTENCE REGISTRY
// ==========================================
export const REGISTERED_USERS_KEY = 'amorex_registered_users';

export const getStoredRegisteredUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading registered users:', e);
    return [];
  }
};

export const saveRegisteredUser = (user: UserProfile, isNewRegistration: boolean = false): void => {
  if (typeof window === 'undefined' || !user) return;
  try {
    const currentList = getStoredRegisteredUsers();
    const now = Date.now();

    // Check if user already exists by ID, displayId, or email
    const existingIndex = currentList.findIndex(
      (u) =>
        u.id === user.id ||
        (user.displayId && u.displayId === user.displayId) ||
        (user.email && u.email && u.email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
        (user.phone && u.phone && u.phone.trim() === user.phone.trim())
    );

    const updatedUserRecord: UserProfile = {
      ...user,
      isRealUser: true, // Marked strictly as real registered user
      registeredAt: existingIndex >= 0 ? (currentList[existingIndex].registeredAt || user.registeredAt || now) : (user.registeredAt || now),
      lastActiveAt: now,
      timeSpentSeconds: existingIndex >= 0 ? (currentList[existingIndex].timeSpentSeconds || user.timeSpentSeconds || 0) : (user.timeSpentSeconds || 0)
    };

    let updatedList: UserProfile[];
    if (existingIndex >= 0) {
      updatedList = [...currentList];
      // Keep existing timeSpent unless incoming is greater
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
      // Prepend so recent registrations appear first
      updatedList = [updatedUserRecord, ...currentList];
    }

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));

    // Dispatch custom event for real-time reactive UI update
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
    console.error('Error updating user time spent:', e);
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
    console.error('Error updating user coins in registry:', e);
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
        return {
          ...u,
          isFrozen: newStatus
        };
      }
      return u;
    });

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updatedList }));
    return newStatus;
  } catch (e) {
    console.error('Error toggling user freeze:', e);
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
        return {
          ...u,
          isMuted: newStatus
        };
      }
      return u;
    });

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updatedList }));
    return newStatus;
  } catch (e) {
    console.error('Error toggling user mute:', e);
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
  } catch (e) {
    console.error('Error deleting user from registry:', e);
  }
};

export const purgeDemoUsersFromRegistry = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const currentList = getStoredRegisteredUsers();
    const initialCount = currentList.length;
    // Remove users flagged with isRealUser === false or matching default demo accounts
    const filtered = currentList.filter((u) => {
      if (u.isRealUser === false) return false;
      if (u.id === 'usr-default-01' || u.email === 'user@amorex.com') return false;
      return true;
    });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: filtered }));
    return initialCount - filtered.length;
  } catch (e) {
    console.error('Error purging demo users:', e);
    return 0;
  }
};

// ==========================================
// USER REPORTS & SAFETY MODERATION REGISTRY
// ==========================================
export const USER_REPORTS_KEY = 'amorex_user_reports';

export const INITIAL_SAMPLE_REPORTS: UserReport[] = [
  {
    id: 'REP-902148',
    reportedUserId: 'usr-88204912',
    reportedUserName: 'ShadowWolf',
    reportedUserDisplayId: '88204912',
    reportedUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    reporterUserId: 'usr-1002',
    reporterUserName: 'Priya Sharma',
    reporterUserDisplayId: '88492019',
    sourceContext: '1v1_call',
    contextDetails: {
      callDurationSec: 85,
    },
    category: 'scam_fraud',
    categoryLabel: 'Financial Scam & Unauthorized UPI Request',
    description: 'User repeatedly demanded private UPI transfer and off-platform WhatsApp contact during the private 1v1 video call.',
    quickTags: ['Off-Platform Payment', 'Suspicious UPI Solicitation'],
    createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    status: 'PENDING',
    actionTaken: 'NONE'
  },
  {
    id: 'REP-902149',
    reportedUserId: 'usr-88301145',
    reportedUserName: 'BlasterDJ',
    reportedUserDisplayId: '88301145',
    reportedUserAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    reporterUserId: 'usr-1003',
    reporterUserName: 'Ayesha Khan',
    reporterUserDisplayId: '88492020',
    sourceContext: 'party_room',
    contextDetails: {
      roomTitle: '🌟 Bollywood Karaoke Night & Chat',
      seatNumber: 4
    },
    category: 'harassment',
    categoryLabel: 'Verbal Harassment & Mic Blasting',
    description: 'Joined Seat 4 and started blasting abusive noises and insulting members on mic continuously.',
    quickTags: ['Abusive Speech', 'Mic Blasting in Room'],
    createdAt: Date.now() - 1000 * 60 * 120, // 2 hours ago
    status: 'PENDING',
    actionTaken: 'NONE'
  }
];

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
    console.error('Error reading user reports:', e);
    return INITIAL_SAMPLE_REPORTS;
  }
};

export const saveUserReport = (report: UserReport): void => {
  if (typeof window === 'undefined' || !report) return;
  try {
    const current = getStoredUserReports();
    // Prepend so latest reports appear at the top
    const updated = [report, ...current.filter((r) => r.id !== report.id)];
    localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_reports_updated', { detail: updated }));
  } catch (e) {
    console.error('Error saving user report:', e);
  }
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
  } catch (e) {
    console.error('Error updating user report status:', e);
  }
};

export const deleteUserReport = (reportId: string): void => {
  if (typeof window === 'undefined' || !reportId) return;
  try {
    const current = getStoredUserReports();
    const updated = current.filter((r) => r.id !== reportId);
    localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_reports_updated', { detail: updated }));
  } catch (e) {
    console.error('Error deleting user report:', e);
  }
};

// =========================================================================
// MODULE 2: USER PROFILE DATA MUTATION & PERSISTENCE
// =========================================================================
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
      ...(params.avatar !== undefined || params.avatarUrl !== undefined
        ? { avatar: nextAvatar, avatarUrl: nextAvatar }
        : {}),
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
    console.error('Error updating user profile:', e);
    return null;
  }
};

// =========================================================================
// MODULE 3: COIN TRANSACTION LEDGER
// =========================================================================
export const COIN_LEDGER_KEY = 'amorex_coin_ledger';

export const INITIAL_COIN_LEDGER: CoinLedgerItem[] = [
  {
    id: 'tx-1',
    title: 'Sign-in Reward',
    type: 'credit',
    amount: 100,
    timestamp: Date.now() - 1000 * 60 * 15,
    dateFormatted: 'Today, 14:20',
    category: 'sign_in',
    note: 'Day 7 Streak Bonus'
  },
  {
    id: 'tx-2',
    title: 'Task Reward',
    type: 'credit',
    amount: 250,
    timestamp: Date.now() - 1000 * 60 * 45,
    dateFormatted: 'Today, 13:50',
    category: 'task',
    note: 'Send 3 Heart Likes in Live Room'
  },
  {
    id: 'tx-3',
    title: 'Top-up Bonus',
    type: 'credit',
    amount: 5000,
    timestamp: Date.now() - 1000 * 3600 * 3,
    dateFormatted: 'Today, 11:30',
    category: 'top_up',
    note: 'Extra 10% Gold Promotion Top-up Bonus'
  },
  {
    id: 'tx-4',
    title: 'Video Chat Cost',
    type: 'debit',
    amount: 360,
    timestamp: Date.now() - 1000 * 3600 * 6,
    dateFormatted: 'Today, 08:45',
    category: 'video_chat',
    note: '6 mins HD Private Call with Aanya'
  },
  {
    id: 'tx-5',
    title: 'Give Gift',
    type: 'debit',
    amount: 999,
    timestamp: Date.now() - 1000 * 3600 * 12,
    dateFormatted: 'Yesterday, 22:15',
    category: 'gift',
    note: 'Sent Cyber Sportscar to Layla'
  },
  {
    id: 'tx-6',
    title: 'Game Bet',
    type: 'debit',
    amount: 500,
    timestamp: Date.now() - 1000 * 3600 * 18,
    dateFormatted: 'Yesterday, 16:30',
    category: 'game',
    note: 'Champ Car Speed Grand Prix #4'
  },
  {
    id: 'tx-7',
    title: 'Consumption Return',
    type: 'credit',
    amount: 1500,
    timestamp: Date.now() - 1000 * 3600 * 19,
    dateFormatted: 'Yesterday, 15:35',
    category: 'consumption_return',
    note: 'Lucky 3x Jackpot Return & Rebate'
  },
  {
    id: 'tx-8',
    title: 'Agent Top-up Transfer',
    type: 'credit',
    amount: 30000,
    timestamp: Date.now() - 1000 * 3600 * 36,
    dateFormatted: '2 days ago',
    category: 'agent_transfer',
    note: 'Official Agency Top-up by Amorex Star Agency'
  }
];

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
    console.error('Error fetching coin ledger:', e);
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
    dateFormatted:
      item.dateFormatted ||
      new Date(now).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
  };

  const updated = [newTx, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(COIN_LEDGER_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('amorex_coin_ledger_updated', { detail: updated }));
    window.dispatchEvent(new CustomEvent('amorex_wallet_updated'));
  }
  return newTx;
};

// =========================================================================
// MODULE 3A: FINANCIAL SETTINGS & COIN MINTING (SUPER ADMIN)
// =========================================================================
export const FINANCIAL_SETTINGS_KEY = 'amorex_financial_settings';

export const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
  baseCoinsPerDollar: 6000, // $1 = 6,000 coins ($5 = 30,000, $10 = 60,000)
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
    return {
      ...DEFAULT_FINANCIAL_SETTINGS,
      ...parsed
    };
  } catch (e) {
    console.error('Error fetching financial settings:', e);
    return DEFAULT_FINANCIAL_SETTINGS;
  }
};

export const saveFinancialSettings = (settings: FinancialSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      ...settings,
      updatedAt: Date.now()
    };
    localStorage.setItem(FINANCIAL_SETTINGS_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('amorex_financial_settings_updated', { detail: payload }));
  } catch (e) {
    console.error('Error saving financial settings:', e);
  }
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
        return {
          ...u,
          coins: nextCoins
        };
      }
      return u;
    });

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));

    // Update current user if active user is Super Admin
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

    // Record in global transaction ledger with specific requested label
    recordCoinTransaction({
      title: 'Minted Master Coins',
      type: 'credit',
      amount,
      category: 'mint',
      note: note || `Minted +${amount.toLocaleString()} Coins to Master Treasury`
    });

    window.dispatchEvent(new CustomEvent('amorex_users_updated', { detail: updated }));
    window.dispatchEvent(new CustomEvent('amorex_wallet_updated'));

    return { success: true, newBalance };
  } catch (e) {
    console.error('Error minting super admin coins:', e);
    return { success: false, newBalance: 0 };
  }
};

// =========================================================================
// MODULE 3B: COMPREHENSIVE AGENT COMMISSION TIER SYSTEM & AGENCY REGISTRY
// =========================================================================
export interface CommissionTierDetails {
  level: number;
  ratio: number;
  percentage: number;
  label: string;
  minCoins: number;
  nextThreshold: number | null;
  coinsNeededForNext: number;
  progressPercent: number;
}

/**
 * Exact Commission Ratio Tier System based on total 30-day achievement:
 * - Level 1 (< 5M coins) = 4% Ratio
 * - Level 2 (5M coins) = 8% Ratio
 * - Level 3 (15M coins) = 12% Ratio
 * - Level 4 (50M coins) = 16% Ratio
 * - Level 5 (150M coins) = 20% Ratio
 * - Level 6 (500M coins) = 24% Ratio
 */
export const getAgentCommissionTier = (achievementCoins: number): CommissionTierDetails => {
  if (achievementCoins >= 500000000) {
    return {
      level: 6,
      ratio: 0.24,
      percentage: 24,
      label: 'Level 6 (500M+)',
      minCoins: 500000000,
      nextThreshold: null,
      coinsNeededForNext: 0,
      progressPercent: 100
    };
  }
  if (achievementCoins >= 150000000) {
    const range = 500000000 - 150000000;
    const progress = achievementCoins - 150000000;
    return {
      level: 5,
      ratio: 0.20,
      percentage: 20,
      label: 'Level 5 (150M+)',
      minCoins: 150000000,
      nextThreshold: 500000000,
      coinsNeededForNext: 500000000 - achievementCoins,
      progressPercent: Math.min(100, Math.round((progress / range) * 100))
    };
  }
  if (achievementCoins >= 50000000) {
    const range = 150000000 - 50000000;
    const progress = achievementCoins - 50000000;
    return {
      level: 4,
      ratio: 0.16,
      percentage: 16,
      label: 'Level 4 (50M+)',
      minCoins: 50000000,
      nextThreshold: 150000000,
      coinsNeededForNext: 150000000 - achievementCoins,
      progressPercent: Math.min(100, Math.round((progress / range) * 100))
    };
  }
  if (achievementCoins >= 15000000) {
    const range = 50000000 - 15000000;
    const progress = achievementCoins - 15000000;
    return {
      level: 3,
      ratio: 0.12,
      percentage: 12,
      label: 'Level 3 (15M+)',
      minCoins: 15000000,
      nextThreshold: 50000000,
      coinsNeededForNext: 50000000 - achievementCoins,
      progressPercent: Math.min(100, Math.round((progress / range) * 100))
    };
  }
  if (achievementCoins >= 5000000) {
    const range = 15000000 - 5000000;
    const progress = achievementCoins - 5000000;
    return {
      level: 2,
      ratio: 0.08,
      percentage: 8,
      label: 'Level 2 (5M+)',
      minCoins: 5000000,
      nextThreshold: 15000000,
      coinsNeededForNext: 15000000 - achievementCoins,
      progressPercent: Math.min(100, Math.round((progress / range) * 100))
    };
  }
  return {
    level: 1,
    ratio: 0.04,
    percentage: 4,
    label: 'Level 1 (< 5M)',
    minCoins: 0,
    nextThreshold: 5000000,
    coinsNeededForNext: 5000000 - achievementCoins,
    progressPercent: Math.min(100, Math.round((achievementCoins / 5000000) * 100))
  };
};

export const AGENT_INFO_KEY = 'amorex_agent_info';
export const AGENT_HOSTS_KEY = 'amorex_agent_hosts';
export const AGENT_SUBAGENTS_KEY = 'amorex_agent_subagents';
export const AGENT_TOPUPS_KEY = 'amorex_agent_topups';

export const DEFAULT_AGENT_INFO: AgentInfo = {
  agencyName: 'Amorex Star Agency',
  phone: '+971 50 123 4567',
  whatsapp: '+971 50 123 4567',
  telegram: '@amorex_star_agency',
  email: 'agency@amorex.com',
  agentCode: 'AG-882019',
  registeredAt: Date.now() - 1000 * 86400 * 25,
  level: 3,
  thirtyDayAchievementCoins: 18500000, // 18.5M coins -> Level 3 (12% Ratio)
  commissionRatio: 0.12,
  totalEarnedCommissionUSD: 1480,
  totalDistributedCoins: 18500000,
  subAgentsCount: 4,
  hostsCount: 8,
  walletCoins: 2500000
};

export const INITIAL_AGENT_HOSTS: AgentHostRecord[] = [
  {
    id: 'host-1',
    name: 'Aanya Sharma',
    displayId: '88204912',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    monthlyHours: 48.5,
    dailyHours: 3.2,
    giftCoinsReceived: 4200000,
    status: 'live',
    joinedAt: 'Aug 10, 2026'
  },
  {
    id: 'host-2',
    name: 'Layla Al-Mansoor',
    displayId: '91482034',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    monthlyHours: 62.0,
    dailyHours: 4.5,
    giftCoinsReceived: 6800000,
    status: 'live',
    joinedAt: 'Aug 04, 2026'
  },
  {
    id: 'host-3',
    name: 'Zara Chen',
    displayId: '77219402',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    monthlyHours: 34.2,
    dailyHours: 2.1,
    giftCoinsReceived: 2150000,
    status: 'active',
    joinedAt: 'Aug 14, 2026'
  },
  {
    id: 'host-7',
    name: 'Priya Pillai',
    displayId: '33182947',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    monthlyHours: 41.8,
    dailyHours: 2.8,
    giftCoinsReceived: 3100000,
    status: 'active',
    joinedAt: 'Aug 12, 2026'
  }
];

export const INITIAL_SUBAGENTS: SubAgentRecord[] = [
  {
    id: 'sub-1',
    agencyName: 'Dubai Elite Talent',
    agentCode: 'AG-99104',
    contactName: 'Khalid Al-Hashemi',
    level: 2,
    thirtyDayCoins: 8200000,
    commissionRatio: 0.08,
    referralCommissionEarned: 328,
    joinedAt: 'Aug 02, 2026'
  },
  {
    id: 'sub-2',
    agencyName: 'Mumbai Spark Media',
    agentCode: 'AG-44201',
    contactName: 'Rohan Mehra',
    level: 3,
    thirtyDayCoins: 21400000,
    commissionRatio: 0.12,
    referralCommissionEarned: 856,
    joinedAt: 'Aug 08, 2026'
  },
  {
    id: 'sub-3',
    agencyName: 'Doha Royals Agency',
    agentCode: 'AG-55392',
    contactName: 'Fatima Al-Thani',
    level: 1,
    thirtyDayCoins: 3800000,
    commissionRatio: 0.04,
    referralCommissionEarned: 152,
    joinedAt: 'Aug 20, 2026'
  }
];

export const INITIAL_AGENT_TOPUPS: AgentTopUpRecord[] = [
  {
    id: 'top-1',
    targetUserId: 'usr-default-01',
    targetUserDisplayId: '88492019',
    targetUserName: 'Dev Rohan',
    coinsTransferred: 60000,
    amountUSD: 10,
    commissionEarnedUSD: 1.2,
    timestamp: Date.now() - 1000 * 3600 * 2,
    status: 'COMPLETED'
  },
  {
    id: 'top-2',
    targetUserId: 'usr-1002',
    targetUserDisplayId: '88492020',
    targetUserName: 'Aarav VIP',
    coinsTransferred: 300000,
    amountUSD: 50,
    commissionEarnedUSD: 6.0,
    timestamp: Date.now() - 1000 * 3600 * 26,
    status: 'COMPLETED'
  },
  {
    id: 'top-3',
    targetUserId: 'usr-1003',
    targetUserDisplayId: '88492021',
    targetUserName: 'Princess Zara',
    coinsTransferred: 150000,
    amountUSD: 25,
    commissionEarnedUSD: 3.0,
    timestamp: Date.now() - 1000 * 3600 * 48,
    status: 'COMPLETED'
  }
];

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
    return {
      ...DEFAULT_AGENT_INFO,
      ...parsed,
      level: tier.level,
      commissionRatio: tier.ratio
    };
  } catch (e) {
    console.error('Error fetching agent info:', e);
    return DEFAULT_AGENT_INFO;
  }
};

export const saveAgentInfo = (info: Partial<AgentInfo>): AgentInfo => {
  const current = getStoredAgentInfo();
  const achievement = info.thirtyDayAchievementCoins !== undefined ? info.thirtyDayAchievementCoins : current.thirtyDayAchievementCoins;
  const tier = getAgentCommissionTier(achievement);

  const updated: AgentInfo = {
    ...current,
    ...info,
    level: tier.level,
    commissionRatio: tier.ratio
  };

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
    console.error('Error fetching agent hosts:', e);
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
    console.error('Error fetching sub-agents:', e);
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
    console.error('Error fetching agent top-ups:', e);
    return INITIAL_AGENT_TOPUPS;
  }
};

/**
 * Executes a direct Top-Up to a user from the Agent Dashboard
 */
export const executeAgentUserTopUp = (
  targetDisplayId: string,
  coinsAmount: number,
  amountUSD: number
): { success: boolean; message: string; record?: AgentTopUpRecord } => {
  if (typeof window === 'undefined' || !targetDisplayId || coinsAmount <= 0) {
    return { success: false, message: 'Invalid target user ID or coin amount.' };
  }

  const registered = getStoredRegisteredUsers();
  const targetUser = registered.find(
    (u) => u.displayId === targetDisplayId.trim() || u.id === targetDisplayId.trim()
  );

  const targetName = targetUser ? targetUser.name : `User ${targetDisplayId}`;
  const targetId = targetUser ? targetUser.id : `usr-${targetDisplayId}`;

  // Calculate agent commission based on current tier ratio
  const agentInfo = getStoredAgentInfo();
  const commissionEarnedUSD = Number((amountUSD * agentInfo.commissionRatio).toFixed(2));

  // 1. Credit target user's coins in registry
  if (targetUser) {
    const updatedCoins = (targetUser.coins || 0) + coinsAmount;
    updateUserCoinsInRegistry(targetUser.id, updatedCoins, targetUser.gems);
  }

  // 2. Also update current user if currentUser is target
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

  // 3. Create TopUp Record
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

  // 4. Update agent stats & 30-day achievement coins
  const nextAchievement = (agentInfo.thirtyDayAchievementCoins || 0) + coinsAmount;
  const nextDistributed = (agentInfo.totalDistributedCoins || 0) + coinsAmount;
  const nextEarnedUSD = (agentInfo.totalEarnedCommissionUSD || 0) + commissionEarnedUSD;
  const nextWalletCoins = Math.max(0, (agentInfo.walletCoins || 0) - coinsAmount);

  saveAgentInfo({
    thirtyDayAchievementCoins: nextAchievement,
    totalDistributedCoins: nextDistributed,
    totalEarnedCommissionUSD: nextEarnedUSD,
    walletCoins: nextWalletCoins
  });

  // 5. Record transactions in ledger with specific requested labels
  recordCoinTransaction({
    title: 'Top-up Bonus',
    type: 'credit',
    amount: coinsAmount,
    category: 'top_up',
    userId: targetId,
    note: `Transferred by Agent ${agentInfo.agencyName} ($${amountUSD} Top-up)`
  });

  window.dispatchEvent(new CustomEvent('amorex_agent_topups_updated', { detail: topUps }));

  return {
    success: true,
    message: `Successfully credited +${coinsAmount.toLocaleString()} Coins to ${targetName}! Earned +$${commissionEarnedUSD} commission.`,
    record: newRecord
  };
};

// =========================================================================
// MODULE 3: CP SPACE (QUESTS, MEMOIR, GIFTS)
// =========================================================================
export const CP_QUESTS_KEY = 'amorex_cp_quests';
export const CP_MEMOIRS_KEY = 'amorex_cp_memoirs';
export const CP_PARTNER_KEY = 'amorex_cp_partner';

export const INITIAL_CP_QUESTS: CPQuestItem[] = [
  {
    id: 'cpq-1',
    title: 'Send 5 romantic whispers in chat',
    description: 'Keep the romance alive by messaging your CP partner',
    scope: 'daily',
    progress: 3,
    target: 5,
    rewardCoins: 150,
    rewardIntimacy: 25,
    isCompleted: false,
    isClaimed: false,
    actionType: 'send_message'
  },
  {
    id: 'cpq-2',
    title: 'Co-host or join Voice Party for 5 mins',
    description: 'Hang out together in any 12-seat romance party room',
    scope: 'daily',
    progress: 5,
    target: 5,
    rewardCoins: 250,
    rewardIntimacy: 50,
    isCompleted: true,
    isClaimed: false,
    actionType: 'voice_party'
  },
  {
    id: 'cpq-3',
    title: '1v1 Video date with your CP',
    description: 'Have a private face-to-face video chat',
    scope: 'daily',
    progress: 0,
    target: 1,
    rewardCoins: 400,
    rewardIntimacy: 80,
    isCompleted: false,
    isClaimed: false,
    actionType: 'video_call'
  },
  {
    id: 'cpq-4',
    title: 'Exchange 3 Intimacy Gifts this week',
    description: 'Send special CP gifts to boost couple level',
    scope: 'weekly',
    progress: 2,
    target: 3,
    rewardCoins: 800,
    rewardIntimacy: 200,
    isCompleted: false,
    isClaimed: false,
    actionType: 'send_gift'
  },
  {
    id: 'cpq-5',
    title: 'Like 10 Moments on the Couple Feed',
    description: 'Support each other and share love reactions',
    scope: 'weekly',
    progress: 7,
    target: 10,
    rewardCoins: 500,
    rewardIntimacy: 120,
    isCompleted: false,
    isClaimed: false,
    actionType: 'feed_like'
  }
];

export const INITIAL_CP_MEMOIRS: CPMemoirItem[] = [
  {
    id: 'mem-1',
    title: 'First Encounter in Acoustic Lounge',
    date: 'July 15, 2026',
    photoUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    description: 'Met in the Romantic Acoustic Lounge and stayed talking until 3 AM under the moon.',
    milestoneLevel: 1
  },
  {
    id: 'mem-2',
    title: 'First 1v1 Midnight Video Call',
    date: 'July 28, 2026',
    photoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    description: 'First face-to-face video call laughing through the cherry blossom filters.',
    milestoneLevel: 3
  },
  {
    id: 'mem-3',
    title: 'Official CP Space Pledge',
    date: 'August 14, 2026',
    photoUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
    description: 'Became official CP partners with custom love rings and matching avatar frames.',
    milestoneLevel: 5
  }
];

export const INITIAL_CP_GIFTS: CPGiftItem[] = [
  {
    id: 'cpg-1',
    name: 'Love Letter',
    icon: '💌',
    coinPrice: 50,
    intimacyValue: 15,
    description: 'A handwritten letter sealed with heartfelt romance'
  },
  {
    id: 'cpg-2',
    name: 'Rose Bouquet',
    icon: '🌹',
    coinPrice: 199,
    intimacyValue: 60,
    description: '99 vibrant scarlet roses expressing eternal devotion'
  },
  {
    id: 'cpg-3',
    name: 'Crystal Tiara',
    icon: '👑',
    coinPrice: 599,
    intimacyValue: 200,
    description: 'Glittering Swarovski crown fit for your romance queen'
  },
  {
    id: 'cpg-4',
    name: 'Diamond Love Ring',
    icon: '💍',
    coinPrice: 1299,
    intimacyValue: 500,
    description: 'Pristine diamond solitaire binding your hearts forever'
  },
  {
    id: 'cpg-5',
    name: 'Fairytale Castle',
    icon: '🏰',
    coinPrice: 3999,
    intimacyValue: 1800,
    description: 'Grand enchanted castle illuminating the entire screen'
  }
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
      return {
        ...q,
        progress: newProgress,
        isCompleted: newProgress >= q.target
      };
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
      return {
        ...q,
        isClaimed: true
      };
    }
    return q;
  });

  if (success && typeof window !== 'undefined') {
    localStorage.setItem(CP_QUESTS_KEY, JSON.stringify(updated));
    // Reward coins into user balance and record transaction
    recordCoinTransaction({
      title: `Quest Reward: ${current.find((q) => q.id === questId)?.title || 'CP Quest'}`,
      type: 'credit',
      amount: rewardCoins,
      category: 'quest'
    });
    // Update user coins
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



