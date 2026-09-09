import React, { useState } from 'react';
import {
  Heart,
  Star,
  Clock,
  Coins,
  Sparkles,
  PhoneCall,
  UserPlus,
  UserCheck,
  Check,
  Award,
  Video,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { StreamHost, UserProfile } from '../../types';
import { WebRtcStats } from '../../services/WebRtcService';
import { sound } from '../../utils/audio';

export interface PostCallRatingData {
  rating: number;
  tags: string[];
  note?: string;
  durationSec: number;
  coinsCharged: number;
}

export interface PostCallSummaryProps {
  host: StreamHost;
  user: UserProfile;
  durationSec: number;
  coinsCharged: number;
  stats?: WebRtcStats;
  onClose: (ratingData?: PostCallRatingData) => void;
  onCallAgain?: () => void;
}

const COMPLIMENT_TAGS = [
  '💖 Sweet & Caring',
  '🌹 Romantic Chemistry',
  '✨ Charming Smile',
  '🎵 Melodic Voice',
  '⚡ Fun & Lively',
  '🌟 Great Listener',
  '💎 Truly Authentic'
];

export const PostCallSummary: React.FC<PostCallSummaryProps> = ({
  host,
  user,
  durationSec,
  coinsCharged,
  stats,
  onClose,
  onCallAgain
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '💖 Sweet & Caring',
    '✨ Charming Smile'
  ]);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatTimeDigital = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return 'Exceptional Chemistry! 💖';
      case 4:
        return 'Charming & Lovely! 🌹';
      case 3:
        return 'Good Conversation 😊';
      case 2:
        return 'Fair Experience 🙂';
      case 1:
        return 'Could Be Better 😕';
      default:
        return 'Select a rating';
    }
  };

  const toggleTag = (tag: string) => {
    sound.playClick();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRatingSelect = (starValue: number) => {
    sound.playClick();
    setRating(starValue);
    if (starValue === 5) {
      sound.playHeartLike();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF2E93', '#FF80AB', '#FFD700', '#FFFFFF']
      });
    }
  };

  const handleToggleFollow = () => {
    sound.playHeartLike();
    setIsFollowing((prev) => !prev);
    if (!isFollowing) {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.4 },
        colors: ['#FF2E93', '#FF80AB', '#00D2FF']
      });
    }
  };

  const handleSubmit = () => {
    sound.playCoinDrop();
    setIsSubmitted(true);

    const ratingData: PostCallRatingData = {
      rating,
      tags: selectedTags,
      note: feedbackNote.trim() || undefined,
      durationSec,
      coinsCharged
    };

    setTimeout(() => {
      onClose(ratingData);
    }, 650);
  };

  const displayStars = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl select-none overflow-y-auto font-sans">
      {/* Ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-lg bg-[#0C0E1E]/95 border border-pink-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(255,46,147,0.25)] text-white overflow-hidden my-auto"
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Heart size={16} className="text-white fill-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Call Summary</span>
                <Sparkles size={14} className="text-amber-400" />
              </h2>
              <p className="text-[11px] text-gray-400">
                Romantic 1v1 HD Session with <span className="text-pink-300 font-semibold">{host.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300">
            <ShieldCheck size={12} className="text-cyan-400" />
            <span>P2P Secured</span>
          </div>
        </div>

        {/* Host Identity Card */}
        <div className="mt-4 flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-2xl p-3 sm:p-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={host.avatar}
                alt={host.name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-pink-500/70 shadow-[0_0_15px_rgba(255,46,147,0.4)]"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-black text-white">
                Lv.{host.level}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-white">{host.name}</h3>
                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded-md font-bold">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                ID: <span className="font-mono text-gray-300">{host.displayId}</span> • {host.region}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleFollow}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isFollowing
                ? 'bg-white/15 text-pink-300 border border-pink-500/40'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck size={13} className="text-pink-400" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus size={13} />
                <span>+ Follow</span>
              </>
            )}
          </button>
        </div>

        {/* Metrics Grid: Total Duration & Total Coins Spent */}
        <div className="grid grid-cols-2 gap-3 mt-3.5">
          {/* Total Duration Card */}
          <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <Clock size={13} className="text-[#00D2FF]" />
                <span>Total Duration</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500">{formatTimeDigital(durationSec)}</span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {formatDuration(durationSec)}
              </div>
              <p className="text-[10px] text-cyan-300 mt-0.5 flex items-center gap-1">
                <Video size={10} />
                <span>
                  {stats
                    ? `${stats.rttMs}ms RTT • ${stats.jitterMs.toFixed(1)}ms Jitter • ${stats.packetLossPercentage.toFixed(1)}% Loss`
                    : 'HD 1080p Ultra-low Latency'}
                </span>
              </p>
            </div>
          </div>

          {/* Total Coins Spent Card */}
          <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <Coins size={13} className="text-amber-400" />
                <span>Coins Spent</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono">🪙</span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
                {coinsCharged > 0 ? `${coinsCharged.toLocaleString()}` : '0 Coins'}
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {coinsCharged === 0 ? (
                  <span className="text-emerald-400 font-semibold">Free 3m Voucher Used 🎉</span>
                ) : (
                  <span>Rate: {host.ratePerMin || 60} coins / min</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Input Section */}
        <div className="mt-4 bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 sm:p-4">
          <div className="text-center">
            <h4 className="text-xs sm:text-sm font-black text-white">
              Rate your experience with {host.name}
            </h4>
            <p className="text-[11px] font-bold text-pink-300 mt-0.5 h-4">
              {getRatingLabel(displayStars)}
            </p>
          </div>

          {/* 5 Star Rating Buttons */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-2.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= displayStars;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingSelect(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 rounded-full hover:scale-125 active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={28}
                    className={`transition-colors duration-150 ${
                      isFilled
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'text-gray-600 fill-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Romantic Impression Compliment Tags */}
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 font-semibold mb-1.5 text-center">
              Tap tags to leave quick compliments:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {COMPLIMENT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-500/30 text-pink-200 border border-pink-400 shadow-[0_0_8px_rgba(255,46,147,0.3)]'
                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Feedback Note */}
          <div className="mt-3">
            <div className="relative">
              <input
                type="text"
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder={`Leave a sweet message for ${host.name} (optional)...`}
                maxLength={100}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/60 transition-colors"
              />
              <span className="absolute right-2.5 top-2.5 text-[9px] font-mono text-gray-500">
                {feedbackNote.length}/100
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
          {onCallAgain && (
            <button
              onClick={() => {
                sound.playClick();
                onCallAgain();
              }}
              className="w-full sm:w-1/3 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-bold text-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <PhoneCall size={13} className="text-pink-400" />
              <span>Call Again</span>
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitted}
            className="w-full flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-95 text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(255,46,147,0.4)] transition-all cursor-pointer"
          >
            {isSubmitted ? (
              <>
                <Check size={14} className="text-white animate-bounce" />
                <span>Rating Submitted!</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-amber-300" />
                <span>Submit Rating &amp; Finish</span>
              </>
            )}
          </button>
        </div>

        {/* Dismiss / Skip Option */}
        <div className="mt-2 text-center">
          <button
            onClick={() => onClose()}
            className="text-[11px] text-gray-400 hover:text-gray-200 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Skip rating and return to browse
          </button>
        </div>
      </motion.div>
    </div>
  );
};
