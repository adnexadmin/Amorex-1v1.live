import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Sparkles,
  Coins,
  CheckCircle2,
  Clock,
  Lock,
  Flame,
  Ticket,
  Gift,
  X,
  Crown,
  Star
} from 'lucide-react';

export interface DailyRewardTier {
  day: number;
  coins: number;
  voucher?: number;
  badge: string;
  title: string;
  subtitle: string;
  highlight?: boolean;
}

export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  { day: 1, coins: 100, badge: '✨', title: 'Day 1 Spark', subtitle: 'First Day Welcome' },
  { day: 2, coins: 150, badge: '💖', title: 'Day 2 Romance', subtitle: 'Romantic Warm-up' },
  { day: 3, coins: 200, voucher: 1, badge: '🎟️', title: 'Day 3 Match', subtitle: 'Coins + 1 Call Voucher' },
  { day: 4, coins: 250, badge: '🔥', title: 'Day 4 Passion', subtitle: 'Rising Streak Bonus' },
  { day: 5, coins: 350, badge: '💫', title: 'Day 5 Fortune', subtitle: 'VIP Energy Boost' },
  { day: 6, coins: 500, badge: '💎', title: 'Day 6 Diamond', subtitle: 'High Roller Reward' },
  { day: 7, coins: 1000, voucher: 2, badge: '👑', title: 'Day 7 Jackpot', subtitle: 'Royal Grand Chest', highlight: true }
];

export interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onClaimReward: (reward: DailyRewardTier, newStreak: number) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  user,
  onClaimReward
}) => {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [justClaimed, setJustClaimed] = useState<boolean>(false);
  const [timeLeftToReset, setTimeLeftToReset] = useState<string>('');

  // Calculate local date string (YYYY-MM-DD)
  const todayStr = new Date().toLocaleDateString('en-CA');

  // Determine current streak & claim status
  const lastCheckIn = user?.lastLoginDate || user?.lastCheckInDate;
  const isClaimedToday = lastCheckIn === todayStr;

  // Streak calculation
  const currentStreak = (() => {
    if (!lastCheckIn) return 1;
    if (lastCheckIn === todayStr) {
      return user?.signInStreak || user?.checkInStreak || 1;
    }
    // Check if yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toLocaleDateString('en-CA');

    if (lastCheckIn === yStr) {
      const prev = user?.signInStreak || user?.checkInStreak || 1;
      return (prev % 7) + 1;
    }
    // Missed a day -> reset to Day 1
    return 1;
  })();

  const activeReward = DAILY_REWARD_TIERS[(currentStreak - 1) % 7] || DAILY_REWARD_TIERS[0];

  // Countdown timer to next midnight reset
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeftToReset('00h 00m 00s');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeLeftToReset(`${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = () => {
    if (isClaimedToday || isClaiming || !user) return;

    setIsClaiming(true);
    sound.playJackpotFanfare();

    // Trigger dual celebration confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF1744', '#FF2E93', '#00D2FF', '#FFD700', '#9D00FF']
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FF2E93']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00D2FF', '#FF2E93']
        });
      }, 250);
    } catch (e) {
      // Confetti fallback
    }

    onClaimReward(activeReward, currentStreak);
    setJustClaimed(true);
    setIsClaiming(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* Animated Dialog Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#0F1123] border border-pink-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-[0_0_50px_rgba(255,46,147,0.35)] overflow-hidden"
        >
          {/* Ambient Glow Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-to-b from-[#FF2E93]/30 via-[#9D00FF]/20 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#00D2FF]/15 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
          >
            <X size={18} />
          </button>

          {/* Header Section */}
          <div className="text-center relative z-10 space-y-1.5 mb-5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/15 border border-pink-500/40 text-pink-300 text-xs font-black uppercase tracking-wider shadow-sm">
              <Calendar size={13} className="text-[#FFD700]" />
              <span>Daily Check-in Rewards</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center gap-2">
              <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
                First Login Bonus
              </span>
              <Sparkles size={22} className="text-[#FFD700] animate-pulse" />
            </h2>

            <p className="text-xs sm:text-sm text-gray-300">
              Check in every day to stack coins & unlock romantic call vouchers!
            </p>

            {/* Streak Indicator Pill */}
            <div className="pt-1 flex items-center justify-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <Flame size={14} className="text-orange-400 animate-bounce" />
                <span>
                  Streak: <strong className="text-white">{currentStreak} / 7 Days</strong>
                </span>
              </div>

              {isClaimedToday && (
                <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Claimed Today ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* 7-Day Rewards Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-5 relative z-10">
            {DAILY_REWARD_TIERS.map((tier) => {
              const isPastClaimed = (isClaimedToday && tier.day <= currentStreak) || (!isClaimedToday && tier.day < currentStreak);
              const isCurrentDay = tier.day === currentStreak;
              const isLockedDay = !isPastClaimed && !isCurrentDay;

              return (
                <motion.div
                  key={tier.day}
                  whileHover={isCurrentDay && !isClaimedToday ? { scale: 1.05 } : undefined}
                  className={`relative p-2 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                    tier.highlight ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    isCurrentDay
                      ? isClaimedToday
                        ? 'bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-gradient-to-b from-pink-500/25 to-[#00D2FF]/25 border-2 border-pink-400 shadow-[0_0_20px_rgba(255,46,147,0.5)] animate-pulse'
                      : isPastClaimed
                      ? 'bg-white/5 border border-white/10 opacity-70'
                      : 'bg-black/30 border border-white/5 opacity-50'
                  }`}
                >
                  {/* Top Day Badge */}
                  <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
                    isCurrentDay ? 'text-pink-300 font-extrabold' : 'text-gray-400'
                  }`}>
                    Day {tier.day}
                  </span>

                  {/* Icon / State */}
                  <div className="my-1">
                    {isPastClaimed ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={16} />
                      </div>
                    ) : isCurrentDay ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2E93] to-[#FFD700] text-white flex items-center justify-center shadow-md animate-bounce">
                        {tier.highlight ? <Crown size={16} /> : <Coins size={16} />}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-gray-500 flex items-center justify-center">
                        <Lock size={14} />
                      </div>
                    )}
                  </div>

                  {/* Coins Amount */}
                  <div className="mt-1">
                    <span className="text-xs font-black text-amber-300">
                      +{tier.coins}
                    </span>
                    <span className="text-[9px] text-gray-400 block">🪙</span>
                  </div>

                  {/* Extra Voucher Tag if applicable */}
                  {tier.voucher && (
                    <div className="mt-1 px-1 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[8px] font-bold flex items-center gap-0.5">
                      <Ticket size={8} />
                      <span>+{tier.voucher}</span>
                    </div>
                  )}

                  {/* Highlight Glow for Day 7 */}
                  {tier.highlight && (
                    <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-[8px] font-black text-white shadow-sm flex items-center gap-0.5">
                      <Star size={7} />
                      <span>JACKPOT</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          <div className="relative z-10 p-3.5 rounded-2xl bg-gradient-to-r from-[#FF2E93]/15 via-[#9D00FF]/15 to-[#00D2FF]/15 border border-pink-500/30 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF1744] via-[#FF2E93] to-[#00D2FF] text-white flex items-center justify-center shadow-lg text-xl">
                {activeReward.badge}
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{activeReward.title}</span>
                  <span className="text-amber-400 text-xs">+{activeReward.coins} 🪙</span>
                </h4>
                <p className="text-xs text-gray-300">
                  {activeReward.subtitle}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-semibold">Wallet Status</span>
              <span className="text-xs font-black text-pink-300 flex items-center justify-end gap-1">
                <Coins size={12} className="text-amber-400" />
                <span>{user?.coins ?? 0}</span>
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="relative z-10 space-y-3">
            {isClaimedToday || justClaimed ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
                >
                  <CheckCircle2 size={18} />
                  <span>Claimed for Today! ✓</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Clock size={13} className="text-pink-400" />
                  <span>Next reward unlocks in:</span>
                  <span className="font-mono font-bold text-pink-300">{timeLeftToReset}</span>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF1744] via-[#FF2E93] to-[#00D2FF] text-white font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(255,46,147,0.6)] hover:shadow-[0_0_40px_rgba(255,46,147,0.8)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-white/20"
              >
                <Gift size={18} className="animate-bounce" />
                <span>
                  {isClaiming ? 'Claiming Coins...' : `Claim Day ${currentStreak} Bonus (+${activeReward.coins} 🪙)`}
                </span>
                <Sparkles size={16} className="text-[#FFD700]" />
              </motion.button>
            )}

            {/* Quick Dismiss Option */}
            <div className="text-center">
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer py-1"
              >
                Continue to Live Streaming
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
