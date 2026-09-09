import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import { Volume2, VolumeX, Plus, Sparkles, Bell, Crown, ChevronRight, X, Heart, Gift, MessageSquare, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AmorexLogo } from './AmorexLogo';
import { LanguageSelector } from './LanguageSelector';
import { t, getAppLanguage, AppLanguage } from '../../utils/i18n';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAdmin?: () => void;
  onOpenAdminSuite?: () => void;
  onOpenRecharge: () => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onOpenInstallModal?: () => void;
  onOpenShare?: () => void;
  activeCoinRain?: boolean;
  onClaimCoinRain?: () => void;
}

// Compact currency formatter (e.g. 100,000,000 -> 100M, 50,000,000 -> 50M, 15,200 -> 15.2K)
const formatCompactNumber = (num?: number | null): string => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  const val = Number(num);
  if (val >= 1_000_000) {
    const formatted = (val / 1_000_000).toFixed(1);
    return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}M`;
  }
  if (val >= 10_000) {
    const formatted = (val / 1_000).toFixed(1);
    return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}K`;
  }
  return val.toLocaleString();
};

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAdmin,
  onOpenAdminSuite,
  onOpenRecharge,
  onOpenAuth,
  onOpenProfile,
  onOpenInstallModal,
  onOpenShare,
  activeCoinRain,
  onClaimCoinRain
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [currentLang, setCurrentLang] = useState<AppLanguage>(getAppLanguage());

  React.useEffect(() => {
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

  const notifications = [
    {
      id: '1',
      icon: '🎁',
      title: 'Daily Login Reward',
      desc: 'Claimed +1,000 Free Coins for Day 1 streak!',
      time: '5m ago',
      unread: true
    },
    {
      id: '2',
      icon: '👑',
      title: 'Party Room Invitation',
      desc: 'Layla invited you to 12-Seat VIP Lounge #104',
      time: '18m ago',
      unread: true
    },
    {
      id: '3',
      icon: '💖',
      title: 'New Romantic Match',
      desc: 'Aanya liked your profile in 1v1 Radar Matching',
      time: '1h ago',
      unread: false
    }
  ];

  const handleAdminClick = () => {
    sound.playCoinDrop();
    if (onOpenAdminSuite) onOpenAdminSuite();
    else if (onOpenAdmin) onOpenAdmin();
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleNotifications = () => {
    sound.playClick();
    setShowNotifications((prev) => !prev);
    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090A15]/95 border-b border-white/10 px-2.5 sm:px-6 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2 shadow-lg transition-all">
      {/* Coin Rain Global Marquee if active */}
      {activeCoinRain && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onClaimCoinRain}
          className="mb-1.5 cursor-pointer rounded-xl bg-gradient-to-r from-amber-500/20 via-[#FF2E93]/30 to-amber-500/20 border border-amber-400/50 px-3 py-1 flex items-center justify-between text-[11px] sm:text-xs text-amber-200 shadow-[0_0_15px_rgba(255,215,0,0.4)] animate-pulse"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-sm">🌧️🪙</span>
            <span>SUPER-ADMIN GLOBAL COIN RAIN ACTIVE!</span>
          </div>
          <span className="underline font-extrabold text-amber-300">Tap to Catch Coins! ✨</span>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* LEFT COLUMN: Dynamic Logged-In User Identity OR Public Brand Logo */}
        {user ? (
          <div
            onClick={() => {
              sound.playClick();
              if (onOpenProfile) onOpenProfile();
            }}
            className="flex items-center gap-2 group cursor-pointer p-1 -ml-1 rounded-2xl hover:bg-white/5 transition-all max-w-[45%] sm:max-w-xs shrink-0"
            title="View Profile"
          >
            {/* User Profile Avatar with VIP Level Glowing Ring */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#FFD700] via-[#FF2E93] to-[#00D2FF] shadow-[0_0_10px_rgba(255,46,147,0.5)] group-hover:scale-105 transition-transform">
                <img
                  referrerPolicy="no-referrer"
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border border-[#090A15]"
                />
              </div>

              {/* Online Indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#090A15]" />
            </div>

            {/* Nickname & Charm/Wealth Level Badge */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-pink-300 transition-colors truncate max-w-[90px] sm:max-w-[130px]">
                  {user.name}
                </span>
                {user.is_super_admin && (
                  <span className="text-[9px] text-[#FFD700]">👑</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Wealth/Charm Level Badge */}
                <span className="text-[9px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-black px-1.5 py-0.2 rounded-sm tracking-tighter leading-tight shadow-xs">
                  Lv.{user.level || 2}
                </span>
                {user.vip_level && user.vip_level > 0 ? (
                  <span className="text-[9px] font-bold text-pink-300 bg-pink-500/20 px-1 py-0.2 rounded-sm border border-pink-500/30 leading-tight">
                    VIP{user.vip_level}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          /* Logged-Out / Public State: 3D Amorex Heart Logo + AMOREX LIVE title */
          <div className="flex items-center shrink-0">
            <AmorexLogo size="sm" subtitle="Romantic Live & Party" />
          </div>
        )}

        {/* RIGHT COLUMN: Compact Wallet & Action Row */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {user ? (
            <>
              {/* Gold Coins Pill: 🪙 100M (compact text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30) */}
              <button
                id="recharge-coins-pill"
                onClick={() => {
                  sound.playClick();
                  onOpenRecharge();
                }}
                className="compact-coin-pill text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono font-bold hover:bg-amber-500/30 hover:border-amber-400/60 active:scale-95 transition-all shadow-[0_0_8px_rgba(255,215,0,0.15)] group cursor-pointer shrink-0"
                title="Gold Coins (Tap to Top-Up)"
              >
                <span className="text-xs">🪙</span>
                <span className="font-extrabold tracking-tight">
                  {formatCompactNumber(user.coins)}
                </span>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 text-black flex items-center justify-center font-black text-[9px] group-hover:scale-110 transition-transform ml-0.5">
                  <Plus size={8} strokeWidth={3.5} />
                </div>
              </button>

              {/* Purple Gems Pill: 💎 50M (compact text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30) */}
              <div
                className="compact-gem-pill text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-mono font-bold shrink-0"
                title="Gift Gems Balance"
              >
                <span className="text-xs">💎</span>
                <span className="font-extrabold tracking-tight">
                  {formatCompactNumber(user.gems)}
                </span>
              </div>

              {/* Notification Bell with unread badge */}
              <div className="relative">
                <button
                  id="notification-bell-btn"
                  onClick={handleToggleNotifications}
                  aria-label="Notifications"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-200 hover:text-white transition-all relative cursor-pointer"
                >
                  <Bell size={13} className="text-gray-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#FF2E93] text-white text-[8px] font-black flex items-center justify-center shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-10 z-50 w-72 sm:w-80 bg-[#14162B] border border-pink-500/30 rounded-2xl shadow-2xl p-3 text-white backdrop-blur-2xl"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
                          <Bell size={12} />
                          <span>Notifications &amp; Activity</span>
                        </div>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      <div className="py-2 space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                              n.unread ? 'bg-white/10 border border-pink-500/20' : 'bg-white/5'
                            }`}
                          >
                            <span className="text-base shrink-0 mt-0.5">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] text-white truncate">{n.title}</span>
                                <span className="text-[9px] text-gray-400 shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[10px] text-gray-300 leading-tight mt-0.5">{n.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          sound.playClick();
                          setShowNotifications(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full mt-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-cyan-300 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>View All in Profile</span>
                        <ChevronRight size={10} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar Direct Profile Navigation */}
              {onOpenProfile && (
                <button
                  id="navbar-profile-avatar-btn"
                  onClick={() => {
                    sound.playClick();
                    onOpenProfile();
                  }}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-pink-500/60 hover:border-pink-400 cursor-pointer shrink-0 transition-transform active:scale-95 shadow-[0_0_10px_rgba(255,46,147,0.3)]"
                  title={`${user.name} - Open Profile`}
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={user.avatarUrl || user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                </button>
              )}

              {/* SUPER-ADMIN Golden Crown Badge (if admin) */}
              {(user.is_super_admin || (user as any).role === 'admin') && (
                <motion.div
                  id="super-admin-crown-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAdminClick}
                  className="flex items-center gap-1 cursor-pointer bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-amber-400/50 hover:bg-white/10 transition-all shrink-0"
                  title="Super-Admin Suite"
                >
                  <Crown size={12} className="text-[#FFD700] shrink-0" />
                  <span className="text-[10px] uppercase tracking-wider font-extrabold gold-text hidden sm:inline">
                    Admin
                  </span>
                </motion.div>
              )}

              {/* Global Multi-Language Selector Dropdown */}
              <LanguageSelector variant="compact" />

              {/* Share App & Earn 10% Agent Promotion Button */}
              {onOpenShare && (
                <button
                  id="navbar-share-app-btn"
                  onClick={() => {
                    sound.playClick();
                    onOpenShare();
                  }}
                  aria-label="Share App & Earn"
                  className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/40 hover:border-emerald-300 text-emerald-300 hover:text-white flex items-center gap-1 text-[10px] sm:text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0 cursor-pointer active:scale-95"
                  title="Share App & Earn up to 10% Commission"
                >
                  <Share2 size={11} className="text-emerald-400" />
                  <span className="hidden md:inline">{t('agent.shareEarn', currentLang)}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-extrabold border border-emerald-400/30">
                    10%
                  </span>
                </button>
              )}

              {/* Install PWA App Button */}
              {onOpenInstallModal && (
                <button
                  id="navbar-install-app-btn"
                  onClick={() => {
                    sound.playClick();
                    onOpenInstallModal();
                  }}
                  aria-label="Install App"
                  className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-[#FF2E93]/20 via-pink-500/20 to-[#00D2FF]/20 border border-pink-500/30 hover:border-pink-400 text-white flex items-center gap-1 text-[10px] sm:text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(255,46,147,0.2)] shrink-0 cursor-pointer active:scale-95"
                  title="Install Amorex Live to Home Screen"
                >
                  <Download size={11} className="text-[#00D2FF]" />
                  <span className="hidden sm:inline">{t('common.installApp', currentLang)}</span>
                </button>
              )}

              {/* Sound FX Toggle Button */}
              <button
                id="sound-toggle-btn"
                onClick={handleToggleSound}
                aria-label="Toggle Sound Effects"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors shrink-0"
                title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} className="text-[#00D2FF]" />}
              </button>
            </>
          ) : (
            /* Logged-Out State Right: Language Selector + "SIGN IN / JOIN" Button */
            <div className="flex items-center gap-2">
              <LanguageSelector variant="compact" />
              <button
                id="header-sign-in-btn"
                onClick={() => {
                  sound.playClick();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-extrabold text-xs sm:text-sm border border-pink-500/50 bg-gradient-to-r from-[#FF1744]/20 via-[#FF2E93]/30 to-[#FF1744]/20 text-white hover:border-pink-400 hover:shadow-[0_0_15px_rgba(255,23,68,0.4)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer tracking-wider shrink-0"
              >
                <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent uppercase">
                  {t('landing.joinBtn', currentLang)}
                </span>
                <Sparkles size={12} className="text-[#FFD700] animate-pulse shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

