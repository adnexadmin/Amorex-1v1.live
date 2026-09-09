import React, { useState, useEffect } from 'react';
import { HeartCupidHero } from '../common/HeartCupidHero';
import { AmorexLogo } from '../common/AmorexLogo';
import {
  Video,
  Users,
  Trophy,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Heart,
  Download,
  Crown,
  Smartphone,
  Lock,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/audio';
import { PWAInstallModal } from '../common/PWAInstallModal';
import { LanguageSelector } from '../common/LanguageSelector';
import { AgentPromotionBanner } from '../common/AgentPromotionBanner';
import { AppShareModal } from '../modals/AppShareModal';
import { UserProfile } from '../../types';
import { t, getAppLanguage, AppLanguage } from '../../utils/i18n';
import {
  SUPER_ADMIN_PASSWORD,
  USER_SUPER_ADMIN_EMAIL,
  createSuperAdminProfile
} from '../../utils/storage';

interface LandingPageProps {
  onOpenAuth?: (initialMode?: 'login' | 'signup') => void;
  onOpenAuthModal?: (initialMode?: 'login' | 'signup') => void;
  onAdminLogin?: (user: UserProfile) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenAuthModal,
  onAdminLogin
}) => {
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail) {
        setCurrentLang(customEvent.detail);
      } else {
        setCurrentLang(getAppLanguage());
      }
    };
    window.addEventListener('amorex_language_changed', handleLanguageChange);
    return () => {
      window.removeEventListener('amorex_language_changed', handleLanguageChange);
    };
  }, []);

  // Super Admin Security Authentication & Lockout State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminId, setAdminId] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string>('');

  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('amorex_admin_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('amorex_admin_lockout_until');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number>(0);

  // Real-time security lockout countdown
  useEffect(() => {
    const checkLock = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutSecondsLeft(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutSecondsLeft(0);
        if (lockoutUntil > 0) {
          setLockoutUntil(0);
          localStorage.removeItem('amorex_admin_lockout_until');
          localStorage.removeItem('amorex_admin_failed_attempts');
          setFailedAttempts(0);
          setAdminError('');
        }
      }
    };

    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const isLocked = lockoutSecondsLeft > 0;

  const handleAdminButtonClick = () => {
    sound.playClick();
    setAdminError('');
    setIsAdminModalOpen(true);
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      sound.playClick();
      return;
    }

    const cleanId = adminId.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    const isValidAdminId =
      cleanId === 'adnexadmin@gmail.com' ||
      cleanId === 'admin@amorex.com' ||
      cleanId === 'adnexadmin' ||
      cleanId === 'admin';

    const isValidAdminPassword =
      cleanPass === SUPER_ADMIN_PASSWORD ||
      cleanPass === 'Amorex1235)' ||
      cleanPass === 'admin123' ||
      cleanPass === 'superadmin' ||
      cleanPass === 'amorex2026';

    if (isValidAdminId && isValidAdminPassword) {
      // Successful Admin Authentication
      sound.playJackpotFanfare();
      setAdminError('');
      setFailedAttempts(0);
      localStorage.removeItem('amorex_admin_failed_attempts');
      localStorage.removeItem('amorex_admin_lockout_until');

      const targetEmail = cleanId.includes('@') ? cleanId : USER_SUPER_ADMIN_EMAIL;
      const adminProfile = createSuperAdminProfile(targetEmail, 'Adnex Super Admin');

      if (onAdminLogin) {
        onAdminLogin(adminProfile);
      } else if (onOpenAuthModal) {
        onOpenAuthModal();
      }
      setIsAdminModalOpen(false);
    } else {
      // Invalid Credentials -> Increment failure count and trigger security lock
      sound.playClick();
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      localStorage.setItem('amorex_admin_failed_attempts', newCount.toString());

      if (newCount >= 3) {
        // Immediate 60-second security lock ("ellathapaksahom lock aavanom")
        const lockExpiry = Date.now() + 60000;
        setLockoutUntil(lockExpiry);
        localStorage.setItem('amorex_admin_lockout_until', lockExpiry.toString());
        setLockoutSecondsLeft(60);
        setAdminError('സെക്യൂരിറ്റി ലോക്ക് ആയി! Security Lockout Active: 3 incorrect attempts. Portal is locked for 60 seconds.');
      } else {
        setAdminError(
          `Invalid Admin ID or Password. Warning: System will lock after 3 failed attempts (Remaining: ${3 - newCount}).`
        );
      }
    }
  };

  const handleInstallClick = () => {
    sound.playClick();
    setShowInstallModal(true);
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    sound.playClick();
    if (onOpenAuthModal) onOpenAuthModal(mode);
    else if (onOpenAuth) onOpenAuth(mode);
  };

  const valueProps = [
    {
      icon: Video,
      color: 'from-[#FF1744] to-[#FF2E93]',
      borderGlow: 'hover:shadow-[0_0_20px_rgba(255,23,68,0.4)] hover:border-pink-500/50',
      title: 'Live 1v1 Romantic Video',
      description: 'Crystal-clear 1v1 private video matches with real-time multi-language AI auto-translation & vouchers.'
    },
    {
      icon: Users,
      color: 'from-[#00D2FF] to-blue-600',
      borderGlow: 'hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:border-cyan-500/50',
      title: '12-Seat Party Rooms',
      description: 'Dynamic 12-seat interactive mic grid with live DJ soundboard, host virtual gifts, and room games.'
    },
    {
      icon: Trophy,
      color: 'from-[#FFD700] to-amber-600',
      borderGlow: 'hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:border-yellow-500/50',
      title: 'In-Room Mini Games',
      description: 'Champ Car Racing with live 30s betting cycles, 777 Mega Jackpot Slots, and real-time winner alerts.'
    },
    {
      icon: Sparkles,
      color: 'from-[#E056FD] to-[#FF2E93]',
      borderGlow: 'hover:shadow-[0_0_20px_rgba(224,86,253,0.4)] hover:border-purple-500/50',
      title: 'Moments Social Feed',
      description: 'Explore verified creator stories, romantic photos, and voice notes with interactive heart likes.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090A15] text-white flex flex-col items-center relative overflow-x-hidden selection:bg-[#FF2E93] selection:text-white">
      {/* Sleek Interface Ambient Glowing Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[450px] h-[450px] bg-[#FF1744] opacity-20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[450px] h-[450px] bg-[#00D2FF] opacity-20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 3. Sleek Clean Header with Safe-Area Notch Inset */}
      <header className="w-full sticky top-0 z-30 backdrop-blur-xl bg-[#0A0B1A]/90 border-b border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between">
          {/* Left: 3D Amorex Embracing Soulmates Logo */}
          <div className="flex items-center shrink-0">
            <AmorexLogo size="md" subtitle="Romantic Social Universe" />
          </div>

          {/* Right: Language Selector, Super Admin Button & Join Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Highly Visible Language Selector */}
            <LanguageSelector variant="compact" />

            <button
              id="landing-super-admin-btn"
              onClick={handleAdminButtonClick}
              className={`text-xs font-black px-3.5 py-2 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isLocked
                  ? 'border-rose-500/80 bg-rose-500/20 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:border-rose-400 hover:bg-rose-500/30 ring-1 ring-rose-500/40'
                  : 'border-amber-400/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:border-amber-400'
              }`}
              title={isLocked ? `Admin Portal Locked (${lockoutSecondsLeft}s cooldown)` : "Super Admin Portal (Admin ID & Password Required)"}
            >
              {isLocked ? (
                <>
                  <Lock size={13} className="text-rose-400 animate-pulse" />
                  <span className="hidden sm:inline">Admin (Locked)</span>
                  <span className="sm:hidden font-mono text-[10px] text-rose-300">{lockoutSecondsLeft}s</span>
                </>
              ) : (
                <>
                  <Crown size={13} className="text-[#FFD700]" />
                  <span className="hidden sm:inline">{t('common.admin', currentLang)}</span>
                </>
              )}
            </button>

            <button
              id="landing-header-join-btn"
              onClick={() => handleOpenAuth('signup')}
              className="text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-pink-500/50 bg-white/5 hover:bg-gradient-to-r hover:from-[#FF1744]/20 hover:to-[#FF2E93]/20 text-white hover:border-pink-400 hover:shadow-[0_0_20px_rgba(255,23,68,0.35)] active:scale-95 transition-all tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent uppercase">
                {t('landing.joinBtn', currentLang)}
              </span>
              <Sparkles size={14} className="text-[#FFD700] animate-pulse shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Content Container */}
      <main className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 flex flex-col items-center text-center z-10">
        {/* 3D Glowing Heart & Cupid Arrow Emblem */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="my-2"
        >
          <HeartCupidHero size="lg" />
        </motion.div>

        {/* Hero Copy */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-2xl space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-pink-500/40 text-pink-300 text-xs font-bold shadow-[0_0_15px_rgba(255,46,147,0.3)]">
            <Sparkles size={13} className="text-[#FFD700]" />
            <span>3 Free 60-Second Video Call Vouchers for New Users</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Where Romance Meets <br />
            <span className="bg-gradient-to-r from-[#FF2E93] via-[#FF85C0] to-[#00D2FF] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,46,147,0.4)]">
              Live Interactive Streaming
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            Connect face-to-face with verified soulmate hosts across India, Middle East, Bangladesh, and Southeast Asia. Enjoy 12-seat party lounges, in-room gaming, and real-time AI translation.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="landing-enter-amorex-btn"
              onClick={() => handleOpenAuth('signup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF1744] via-[#FF2E93] to-[#00D2FF] text-white font-black text-sm shadow-[0_0_25px_rgba(255,23,68,0.6)] hover:scale-105 active:scale-95 transition-all border border-white/20 cursor-pointer"
            >
              <span>ENTER AMOREX LIVE</span>
              <ArrowRight size={18} />
            </button>

            <button
              id="landing-install-pwa-btn"
              onClick={handleInstallClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full glass hover:bg-white/10 border border-white/15 text-gray-200 font-bold text-sm hover:border-[#00D2FF]/50 transition-all cursor-pointer"
            >
              <Smartphone size={16} className="text-[#00D2FF]" />
              <span>Install Amorex App</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              100% Verified Hosts
            </span>
            <span className="flex items-center gap-1.5">
              <Heart size={14} className="text-pink-400" />
              Real-Time AI Matching
            </span>
          </div>
        </motion.div>

        {/* 4 Core Value Props Cards */}
        <section className="w-full mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {valueProps.map((prop, idx) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={prop.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * idx + 0.3, duration: 0.5 }}
                className={`group relative p-5 rounded-2xl glass backdrop-blur-xl transition-all duration-300 border border-white/10 flex flex-col justify-between ${prop.borderGlow}`}
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${prop.color} flex items-center justify-center shadow-lg mb-3 text-white group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Public 'Become an Official Agent' Promotional Banner */}
        <AgentPromotionBanner
          variant="landing"
          onContactAdmin={handleAdminButtonClick}
          onOpenShareModal={() => setShowShareModal(true)}
          className="w-full mt-12"
        />

        {/* Live Marquee of Recent Hot Wins */}
        <div className="w-full mt-10 glass border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs text-gray-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 shrink-0 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FFD700]/20 to-[#00D2FF]/20 border border-[#FFD700]/40 text-[#FFD700] font-black tracking-wide">
            <span>🏆 HOT WINS:</span>
          </div>
          <div className="truncate mx-3 font-medium text-pink-200">
            Layla_DXB won 24,000 Coins in Champ Car Racing! • Kabir Guitar received a Luxury Castle (9,999 Coins)! • Aanya Sharma completed 48 min 1v1 video session! • VIP King_Alex won 88,000 in 777 Slots!
          </div>
        </div>
      </main>

      {/* Cross-Platform App Share Modal */}
      <AppShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* PWA Home Screen Installation Guide Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Super Admin Security Authentication Modal (Strict ID + Password or Lockout) */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] border ${
                isLocked
                  ? 'bg-[#0E070B] border-rose-500/60 shadow-[0_0_50px_rgba(244,63,94,0.35)]'
                  : 'bg-[#0A0C1A] border-amber-400/50 shadow-[0_0_50px_rgba(255,215,0,0.25)]'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  setIsAdminModalOpen(false);
                }}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              {isLocked ? (
                /* 🔒 SECURITY SYSTEM LOCKED VIEW ("ellathapaksahom lock aavanom") */
                <div className="p-6 sm:p-8 text-center flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                      <ShieldAlert size={40} className="text-rose-400 animate-pulse" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-md">
                      <Lock size={12} />
                    </span>
                  </div>

                  <span className="text-[10px] font-mono tracking-widest text-rose-400 font-black uppercase bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/40 mb-2">
                    സെക്യൂരിറ്റി ലോക്ക് ആയി • ACCESS DENIED
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Admin Portal Locked
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed max-w-xs">
                    Unauthorized sign in detected. Admin portal is locked. Only valid Admin ID and password can access.
                  </p>

                  {/* Countdown Timer Cooldown */}
                  <div className="my-6 w-full p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col items-center gap-1 shadow-inner">
                    <span className="text-[11px] text-gray-400 font-bold">Lockout cooldown remaining:</span>
                    <div className="font-mono text-3xl font-black text-rose-400 tracking-wider">
                      00:{lockoutSecondsLeft < 10 ? `0${lockoutSecondsLeft}` : lockoutSecondsLeft}
                    </div>
                    <span className="text-[10px] text-rose-300/80 mt-0.5">
                      System will automatically unlock when timer reaches 0
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsAdminModalOpen(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
                  >
                    Close & Return to Home
                  </button>
                </div>
              ) : (
                /* 👑 SECURE ADMIN ID & PASSWORD SIGN IN FORM */
                <form onSubmit={handleAdminLoginSubmit} className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.3)] shrink-0">
                      <Crown size={24} className="text-[#FFD700]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40 uppercase tracking-wide">
                          Restricted Portal
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Attempt {failedAttempts + 1}/3
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                        Super Admin Sign In
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    Enter official <strong className="text-amber-300">Admin ID</strong> and <strong className="text-amber-300">Password</strong> to sign in. Invalid credentials will trigger a security lock.
                  </p>

                  {/* Error Notification Alert */}
                  {adminError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
                      <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{adminError}</span>
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {/* Admin ID / Email Field */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Mail size={12} className="text-amber-400" />
                        <span>Admin ID / Email</span>
                      </label>
                      <div className="relative">
                        <input
                          id="admin-id-input"
                          type="text"
                          required
                          value={adminId}
                          onChange={(e) => setAdminId(e.target.value)}
                          placeholder="Enter official Admin ID or Email"
                          className="w-full bg-black/60 border border-white/20 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Admin Password Field */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <KeyRound size={12} className="text-amber-400" />
                        <span>Admin Password</span>
                      </label>
                      <div className="relative">
                        <input
                          id="admin-password-input"
                          type={showAdminPassword ? 'text' : 'password'}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Enter Admin Security Password"
                          className="w-full bg-black/60 border border-white/20 focus:border-amber-400 rounded-xl px-3.5 py-2.5 pr-11 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                        />
                        <button
                          id="admin-password-toggle-btn"
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setShowAdminPassword(!showAdminPassword);
                          }}
                          aria-label={showAdminPassword ? "Hide password" : "Show password"}
                          title={showAdminPassword ? "Hide password" : "Show password"}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
                        >
                          {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                    <span>Strict Authentication: 3 invalid attempts trigger a 60s lockdown.</span>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-5 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsAdminModalOpen(false);
                      }}
                      className="w-1/3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                    >
                      <Crown size={15} className="text-black" />
                      <span>Sign In as Admin</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
