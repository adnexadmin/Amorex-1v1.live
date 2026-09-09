import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Coins,
  Gem,
  Copy,
  Check,
  ChevronRight,
  Briefcase,
  Calendar,
  Heart,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  Trophy,
  Settings,
  Sparkles,
  Share2,
  Shield,
  LogOut,
  Award,
  Lock,
  ArrowLeft,
  Flame,
  Star,
  Clock,
  PhoneCall,
  Globe,
  Camera
} from 'lucide-react';
import { UserProfile, BackpackItem, DailyTask, StreamHost, CallHistoryItem } from '../../types';
import { sound } from '../../utils/audio';
import { getStoredRegisteredUsers, isSuperAdminEmail, getStoredCallHistory } from '../../utils/storage';
import { EditProfileScreen } from './EditProfileScreen';
import { WalletTransactionHistory } from './WalletTransactionHistory';
import { GoldCoinDetails } from './GoldCoinDetails';
import { CPSpace } from './CPSpace';
import { CallHistorySection } from './CallHistorySection';
import { AvatarUploadModal } from './AvatarUploadModal';
import { AgentDashboard } from '../agent/AgentDashboard';
import { PrivacyPolicyModal } from '../modals/PrivacyPolicyModal';
import { AgentPromotionBanner } from '../common/AgentPromotionBanner';
import { LanguageSelector } from '../common/LanguageSelector';
import { t, getAppLanguage, AppLanguage } from '../../utils/i18n';

interface ProfileDashboardProps {
  initialUser?: UserProfile;
  backpack?: BackpackItem[];
  tasks?: DailyTask[];
  onOpenRecharge: () => void;
  onOpenAdminSuite?: () => void;
  onSwitchToSuperAdmin?: () => void;
  onLogout: () => void;
  onClaimTask?: (taskId: string) => void;
  onEquipBackpackItem?: (itemId: string) => void;
  onOpenSupportBot?: (context?: { source: string; query: string }) => void;
  onOpenInstallModal?: () => void;
  onOpenShareModal?: () => void;
  onStart1v1Call?: (host: StreamHost) => void;
  hosts?: StreamHost[];
}

type DashboardSubView =
  | 'DASHBOARD'
  | 'EDIT_PROFILE'
  | 'WALLET_HISTORY'
  | 'GOLD_COIN_DETAILS'
  | 'AGENT'
  | 'EVENT'
  | 'CP'
  | 'VERIFICATION'
  | 'BACKPACK'
  | 'TASKS'
  | 'LEVEL'
  | 'SETTINGS'
  | 'HISTORY';

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  initialUser,
  backpack = [],
  tasks = [],
  onOpenRecharge,
  onOpenAdminSuite,
  onSwitchToSuperAdmin,
  onLogout,
  onClaimTask,
  onEquipBackpackItem,
  onOpenSupportBot,
  onOpenInstallModal,
  onOpenShareModal,
  onStart1v1Call,
  hosts = []
}) => {
  // Current user state fetched from storage / users table
  const [userData, setUserData] = useState<UserProfile>(() => {
    if (initialUser) return initialUser;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('amorex_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          // ignore
        }
      }
      const registered = getStoredRegisteredUsers();
      if (registered.length > 0) return registered[0];
    }
    return {
      id: 'usr_88204912',
      displayId: '88204912',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      gender: 'female',
      age: 22,
      region: 'India',
      role: 'USER',
      is_super_admin: false,
      isVerifiedHost: false,
      faceVerified: true,
      level: 3,
      experience: 1250,
      coins: 25000,
      gems: 1420,
      vouchers: 3,
      bio: 'Living my best live-streaming life on AmoreX! ✨',
      followingCount: 142,
      followersCount: 1280,
      friendsCount: 56
    };
  });

  // Real-time wallet balances bound to user data & live storage updates
  const [coinBalance, setCoinBalance] = useState<number>(userData.coins || 0);
  const [gemBalance, setGemBalance] = useState<number>(userData.gems || 0);

  // Active view routing
  const [activeView, setActiveView] = useState<DashboardSubView>('DASHBOARD');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail) {
        setCurrentLang(customEvent.detail);
      } else {
        setCurrentLang(getAppLanguage());
      }
    };
    window.addEventListener('amorex_language_changed', handleLangChange);
    return () => {
      window.removeEventListener('amorex_language_changed', handleLangChange);
    };
  }, []);

  // Clipboard copy feedback
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string>('');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  // Fetch core user data from users table on mount and listen to updates
  useEffect(() => {
    const syncUserData = () => {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('amorex_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserData(parsed);
          setCoinBalance(parsed.coins ?? 0);
          setGemBalance(parsed.gems ?? 0);
          return;
        } catch (e) {
          // ignore
        }
      }
      const registered = getStoredRegisteredUsers();
      if (registered.length > 0) {
        const found = registered.find((u) => u.id === userData.id || u.displayId === userData.displayId) || registered[0];
        setUserData(found);
        setCoinBalance(found.coins ?? 0);
        setGemBalance(found.gems ?? 0);
      }
    };

    syncUserData();

    const handleStorageChange = () => syncUserData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('amorex_users_updated', handleStorageChange);
    window.addEventListener('amorex_user_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('amorex_users_updated', handleStorageChange);
      window.removeEventListener('amorex_user_updated', handleStorageChange);
    };
  }, [userData.id, userData.displayId]);

  // Keep coin & gem balance in sync if parent passed updated initialUser
  useEffect(() => {
    if (initialUser) {
      setUserData(initialUser);
      setCoinBalance(initialUser.coins ?? 0);
      setGemBalance(initialUser.gems ?? 0);
    }
  }, [initialUser]);

  const handleCopyId = () => {
    sound.playClick();
    const idToCopy = userData.displayId || userData.id;
    navigator.clipboard?.writeText(idToCopy);
    setCopiedId(true);
    showToast(`User ID ${idToCopy} copied to clipboard!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Sub-view: Edit Profile
  if (activeView === 'EDIT_PROFILE') {
    return (
      <EditProfileScreen
        user={userData}
        onBack={() => setActiveView('DASHBOARD')}
        onSaveUser={(updated) => {
          setUserData(updated);
          setCoinBalance(updated.coins ?? 0);
          setGemBalance(updated.gems ?? 0);
        }}
      />
    );
  }

  // Sub-view: Gold Coin Details (Ledger & Transaction History)
  if (activeView === 'GOLD_COIN_DETAILS') {
    return (
      <GoldCoinDetails
        coinBalance={coinBalance}
        onBack={() => setActiveView('DASHBOARD')}
        onOpenRecharge={onOpenRecharge}
      />
    );
  }

  // Sub-view: Couple Space & Gamified Quests (CP)
  if (activeView === 'CP') {
    return (
      <CPSpace
        user={userData}
        onBack={() => setActiveView('DASHBOARD')}
        onOpenRecharge={onOpenRecharge}
        onStart1v1Call={(hostId) => {
          const matched = hosts.find((h) => h.id === hostId);
          if (matched && onStart1v1Call) {
            onStart1v1Call(matched);
          }
        }}
      />
    );
  }

  // Sub-view: Wallet & Ledger
  if (activeView === 'WALLET_HISTORY') {
    return (
      <WalletTransactionHistory
        coinBalance={coinBalance}
        gemBalance={gemBalance}
        onBack={() => setActiveView('DASHBOARD')}
        onOpenRecharge={onOpenRecharge}
      />
    );
  }

  // Sub-view: 1v1 Call History
  if (activeView === 'HISTORY') {
    return (
      <CallHistorySection
        history={getStoredCallHistory()}
        hosts={hosts}
        onReconnect={(call) => {
          const matched = hosts.find((h) => h.id === call.hostId);
          if (matched && onStart1v1Call) {
            onStart1v1Call(matched);
          }
        }}
        onBack={() => setActiveView('DASHBOARD')}
        isSubView={true}
      />
    );
  }

  // Sub-view: Comprehensive Agent Dashboard & Commission Tiers
  if (activeView === 'AGENT') {
    return (
      <AgentDashboard
        currentUser={userData}
        onBack={() => setActiveView('DASHBOARD')}
        onOpenSupportBot={onOpenSupportBot}
      />
    );
  }

  // Sub-view generic modal header for items like Agent, Event, CP, Verification, Backpack, Tasks, Level, Settings
  const renderSubViewContent = () => {
    if (activeView === 'DASHBOARD') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="w-full max-w-xl mx-auto pb-24 text-white"
      >
        <div className="flex items-center justify-between py-4 px-2 border-b border-white/10 sticky top-0 bg-[#070814]/90 backdrop-blur-md z-30">
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('DASHBOARD');
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-black tracking-wide text-white uppercase">
            {activeView.replace('_', ' ')}
          </h2>
          <div className="w-9" />
        </div>

        <div className="p-4 space-y-4">
          {activeView === 'AGENT' && (
            <AgentPromotionBanner
              variant="profile"
              onContactAdmin={() => {
                sound.playClick();
                onOpenSupportBot?.({
                  source: 'Agent Application',
                  query: 'I want to apply as an official Amorex Agent and earn up to 10% commission on every user coin top-up!'
                });
              }}
              onOpenShareModal={onOpenShareModal}
            />
          )}

          {activeView === 'EVENT' && (
            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 space-y-2">
                <span className="text-[10px] font-black uppercase text-pink-400 bg-pink-500/20 px-2 py-0.5 rounded">Live Now</span>
                <h3 className="text-base font-black text-white">Summer Star Gifting Carnival</h3>
                <p className="text-xs text-gray-300">Top 10 hosts win 500,000 diamond gems and exclusive profile borders.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400">
                Check back daily for 2x coin recharge hours and lucky box drops.
              </div>
            </div>
          )}

          {activeView === 'CP' && (
            <div className="p-5 rounded-2xl bg-pink-950/30 border border-pink-500/30 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
                <Heart size={28} className="fill-pink-500" />
              </div>
              <h3 className="text-base font-black text-white">Couple Space (CP)</h3>
              <p className="text-xs text-gray-300 max-w-sm mx-auto">
                Form an exclusive CP bond with your favorite host or friend. Unlock custom love rings, joint live room entrances, and intimacy rankings.
              </p>
              <button
                onClick={() => showToast('Proposal feature ready in party rooms!')}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs rounded-full shadow-lg"
              >
                Find CP Partner
              </button>
            </div>
          )}

          {activeView === 'VERIFICATION' && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Host & Identity Verification</h3>
                  <p className="text-xs text-emerald-400 font-bold">Face Recognition Active</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-gray-300 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between">
                  <span>Face Biometric Status:</span>
                  <span className="text-emerald-400 font-bold">Passed</span>
                </div>
                <div className="flex justify-between">
                  <span>Age Compliance (18+):</span>
                  <span className="text-emerald-400 font-bold">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Host Talent Badge:</span>
                  <span className="text-amber-400 font-bold">Eligible to Apply</span>
                </div>
              </div>
            </div>
          )}

          {activeView === 'BACKPACK' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase">My Inventory & Frames</h3>
              {backpack.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-gray-400">
                  Your backpack is currently empty. Claim daily tasks or win carnival events to earn luxury entrance cars and avatar frames!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {backpack.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{item.type.toLowerCase()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onEquipBackpackItem?.(item.id);
                          showToast(`Equipped ${item.name}!`);
                        }}
                        className={`w-full py-1 rounded-lg text-xs font-bold transition-all ${
                          item.isEquipped
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {item.isEquipped ? 'Equipped' : 'Equip'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'TASKS' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Daily Check-in & Talk Tasks</h3>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{task.title}</p>
                    <p className="text-[11px] text-gray-400">{task.description}</p>
                    <span className="text-[10px] text-amber-300 font-bold mt-1 inline-block">
                      +{task.rewardCoins} Coins
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onClaimTask?.(task.id);
                      showToast(`Claimed +${task.rewardCoins} Coins!`);
                    }}
                    disabled={task.isClaimed || task.progress < task.target}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      task.isClaimed
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                        : task.progress >= task.target
                        ? 'bg-amber-400 text-black shadow-md cursor-pointer'
                        : 'bg-white/10 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {task.isClaimed ? 'Claimed' : task.progress >= task.target ? 'Claim' : `${task.progress}/${task.target}`}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeView === 'LEVEL' && (
            <div className="p-5 rounded-2xl bg-white/5 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award size={28} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">VIP Level {userData.level || 3}</h3>
                  <p className="text-xs text-amber-300 font-bold">1,250 / 2,000 EXP to Level 4</p>
                </div>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full w-[62.5%]" />
              </div>
              <div className="text-xs text-gray-300 space-y-1.5 pt-1">
                <p>• Unlocks exclusive animated room enter greetings</p>
                <p>• +10% rebate bonus on weekly coin recharges</p>
                <p>• High-priority matching in 1v1 random video calls</p>
              </div>
            </div>
          )}

          {activeView === 'SETTINGS' && (
            <div className="space-y-3">
              {/* Global Multi-Language System (i18n) */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Globe size={15} className="text-cyan-400" />
                    <span>App Language / ഭാഷ / भाषा / لغة</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                    5 Languages
                  </span>
                </div>
                <LanguageSelector variant="settings" />
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveView('HISTORY');
                }}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-left hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">1v1 Call Records</p>
                    <p className="text-[10px] text-gray-400">View past connected video calls & reconnect</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSupportBot?.();
                }}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-left hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">24/7 AI Customer Support</p>
                    <p className="text-[10px] text-gray-400">Instant answers for coins, calls, and account</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsPrivacyModalOpen(true);
                }}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-left hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Privacy & Security Policy</p>
                    <p className="text-[10px] text-gray-400">GDPR compliance, encrypted calls & data control</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              {onOpenInstallModal && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenInstallModal();
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-left hover:bg-white/10 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <ShoppingBag size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Install App to Home Screen</p>
                      <p className="text-[10px] text-gray-400">Quick access & full-screen experience</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              <button
                onClick={() => {
                  sound.playClick();
                  onLogout();
                }}
                className="w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-left hover:bg-red-500/20 cursor-pointer mt-4"
              >
                <span className="text-xs font-bold text-red-400 flex items-center gap-2">
                  <LogOut size={14} />
                  <span>Log Out Account</span>
                </span>
                <ChevronRight size={16} className="text-red-400" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (activeView !== 'DASHBOARD') {
    return renderSubViewContent();
  }

  // ==========================================
  // MAIN SCREEN: PROFILE DASHBOARD
  // ==========================================
  return (
    <div className="w-full max-w-xl mx-auto pb-28 text-white space-y-4 px-3 sm:px-4">
      {/* Toast Feedback */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-pink-500 text-white font-black text-xs rounded-full shadow-2xl flex items-center gap-2 pointer-events-none"
          >
            <Check size={14} />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar Icons */}
      <div className="flex items-center justify-between pt-3 pb-1">
        <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
          <Sparkles size={14} />
          <span>Profile Dashboard</span>
        </span>

        <div className="flex items-center gap-2">
          {/* Super Admin Trigger if applicable */}
          {(userData.is_super_admin || isSuperAdminEmail(userData.email)) && (
            <button
              onClick={() => {
                sound.playClick();
                onSwitchToSuperAdmin?.();
              }}
              className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer hover:bg-amber-400/30"
            >
              <Shield size={11} />
              <span>Super Admin</span>
            </button>
          )}

          {/* Quick Language Switcher */}
          <LanguageSelector variant="compact" />

          <button
            onClick={() => {
              sound.playClick();
              setActiveView('SETTINGS');
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HEADER SECTION: Avatar, Nickname, Gender/Age, Level, User ID + Copy */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#12142B] via-[#0B0C1A] to-black border border-white/15 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Circular User Avatar with Direct Cloud Upload Trigger */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsAvatarModalOpen(true);
              }}
              className="group relative block rounded-full p-0.5 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              title="Click to update profile picture"
            >
              <img
                referrerPolicy="no-referrer"
                src={userData.avatarUrl || userData.avatar}
                alt={userData.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-pink-500/80 shadow-[0_0_20px_rgba(255,46,147,0.35)]"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={18} className="text-pink-300" />
              </div>
            </button>
            {/* Camera Upload Badge */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsAvatarModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 border-2 border-[#0B0C1A] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Upload New Profile Picture"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* User Info Details */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Nickname and Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide truncate max-w-[160px] sm:max-w-[200px]">
                {userData.name}
              </h2>

              {/* Gender / Age Badge */}
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase shadow-sm ${
                  userData.gender === 'male'
                    ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40'
                    : 'bg-pink-500/25 text-pink-300 border border-pink-400/40'
                }`}
              >
                <span>{userData.gender === 'male' ? '♂' : '♀'}</span>
                <span>{userData.age || 22}</span>
              </span>

              {/* Level Badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                <Star size={10} className="fill-black" />
                <span>Lv{userData.level || 3}</span>
              </span>
            </div>

            {/* User ID with Copy to Clipboard Icon */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">
                ID: {userData.displayId || userData.id}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
                title="Copy User ID to Clipboard"
              >
                {copiedId ? (
                  <Check size={12} className="text-emerald-400" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>

            {/* Bio snippet */}
            {userData.bio && (
              <p className="text-[11px] text-gray-400 italic line-clamp-1">
                "{userData.bio}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS ROW: 3-column grid for Friend, Follow, Fans */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-sm text-center">
        {/* Column 1: Friend */}
        <div className="flex flex-col items-center justify-center py-1">
          <span className="text-base sm:text-lg font-black text-white">
            {userData.friendsCount ?? 56}
          </span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Friend
          </span>
        </div>

        {/* Column 2: Follow */}
        <div className="flex flex-col items-center justify-center py-1 border-x border-white/10">
          <span className="text-base sm:text-lg font-black text-white">
            {userData.followingCount ?? 142}
          </span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Follow
          </span>
        </div>

        {/* Column 3: Fans */}
        <div className="flex flex-col items-center justify-center py-1">
          <span className="text-base sm:text-lg font-black text-white">
            {userData.followersCount ?? 1280}
          </span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Fans
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WALLET CARDS ROW: Two visually distinct rectangular cards side-by-side */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1 (Left): "My coins" with coin icon and current balance integer */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('GOLD_COIN_DETAILS');
          }}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#2D2109] via-[#1B150A] to-[#0D0B05] border border-amber-500/40 shadow-lg hover:border-amber-400 transition-all text-left group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              My coins
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins size={15} className="text-amber-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
            {coinBalance.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-amber-500/20 text-[10px] text-amber-400/80">
            <span>Talk time & gifts</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Card 2 (Right): "My gems" with diamond icon and current balance integer */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('WALLET_HISTORY');
          }}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#1A0B2E] via-[#0E1528] to-[#050C16] border border-cyan-500/40 shadow-lg hover:border-cyan-400 transition-all text-left group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              My gems
            </span>
            <div className="w-7 h-7 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gem size={15} className="text-cyan-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 tracking-tight">
            {gemBalance.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-cyan-500/20 text-[10px] text-cyan-400/80">
            <span>Gift earnings</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Quick Top-Up Bar */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 border border-pink-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-amber-400" />
          <span className="text-xs font-bold text-gray-200">Need more talk-time coins?</span>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onOpenRecharge();
          }}
          className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-[#FF2E93] text-white font-black text-xs shadow-md cursor-pointer hover:opacity-90 transition-all"
        >
          Recharge
        </button>
      </div>

      {/* Dedicated Public 'Become an Official Agent & Earn Money' Promotional Card */}
      <AgentPromotionBanner
        variant="profile"
        onContactAdmin={() => {
          sound.playClick();
          onOpenSupportBot?.({
            source: 'Profile Agent Recruitment Card',
            query: 'I want to apply as an official Amorex Agent and earn up to 10% commission on every user coin top-up!'
          });
        }}
        onOpenShareModal={onOpenShareModal}
      />

      {/* ========================================================================= */}
      {/* 4. NAVIGATION LIST: Scrollable vertical list of menu items */}
      {/* (Agent, Event, CP, Verification, Backpack, My Profile, My Tasks, My level, Settings) */}
      {/* ========================================================================= */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-1">
          Menu & Services
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden divide-y divide-white/5 shadow-sm">
          {/* Share App & Earn 10% Agent Commission */}
          {onOpenShareModal && (
            <button
              id="profile-menu-share-btn"
              onClick={() => {
                sound.playClick();
                onOpenShareModal();
              }}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent hover:bg-emerald-500/15 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
                  <Share2 size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                    {t('agent.shareEarn', currentLang)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {t('agent.subtitle', currentLang)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
                <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40 animate-pulse">
                  10% Commission
                </span>
                <ChevronRight size={16} />
              </div>
            </button>
          )}

          {/* 1. Agent */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('AGENT');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Briefcase size={16} />
              </div>
              <span className="text-xs font-bold text-white">Agent</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <span className="text-[10px] text-purple-300 font-semibold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                Guild Portal
              </span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 2. Event */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('EVENT');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <span className="text-xs font-bold text-white">Event</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <span className="text-[10px] text-pink-300 font-semibold bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/30">
                Summer Carnival
              </span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 3. CP */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('CP');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Heart size={16} />
              </div>
              <span className="text-xs font-bold text-white">CP</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <span className="text-[10px] text-rose-300 font-semibold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
                Couple Space
              </span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 4. Verification */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('VERIFICATION');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <span className="text-xs font-bold text-white">Verification</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Verified
              </span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 5. Backpack */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('BACKPACK');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
              <span className="text-xs font-bold text-white">Backpack</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <span className="text-[10px] text-gray-400 font-semibold">
                {backpack.length} items
              </span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 6. My Profile (Routes to EditProfile) */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('EDIT_PROFILE');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="text-xs font-bold text-white">My Profile</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <span className="text-[10px] text-blue-300 font-semibold">Edit Info</span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 7. My Tasks */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('TASKS');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-xs font-bold text-white">My Tasks</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <span className="text-[10px] text-amber-300 font-semibold">Daily Rewards</span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 8. My level */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('LEVEL');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Award size={16} />
              </div>
              <span className="text-xs font-bold text-white">My level</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <span className="text-[10px] text-amber-300 font-semibold">Lv{userData.level || 3} VIP</span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 9. Settings */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('SETTINGS');
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-500/15 text-gray-300 flex items-center justify-center">
                <Settings size={16} />
              </div>
              <span className="text-xs font-bold text-white">Settings</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white">
              <ChevronRight size={16} />
            </div>
          </button>
        </div>
      </div>

      {/* Privacy & Security Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onNavigateToSupportChat={(ctx) => {
          onOpenSupportBot?.(ctx);
        }}
      />

      {/* Cloud Storage & Firestore Profile Picture Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        currentAvatar={userData.avatarUrl || userData.avatar}
        userId={userData.id}
        userName={userData.name}
        onClose={() => setIsAvatarModalOpen(false)}
        onUploadSuccess={(newAvatarUrl, updatedUser) => {
          setUserData(updatedUser);
          showToast('Profile picture uploaded and synced to Firestore!');
        }}
      />
    </div>
  );
};
