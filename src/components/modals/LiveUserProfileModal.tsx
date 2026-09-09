import React, { useEffect } from 'react';
import { StreamHost, UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import {
  ChevronLeft,
  MapPin,
  Heart,
  Video,
  Gift,
  Copy,
  Check,
  ShieldCheck,
  Languages,
  Sparkles,
  MessageSquare,
  Crown
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface LiveUserProfileModalProps {
  targetUser: StreamHost | UserProfile;
  currentUser: UserProfile | null;
  isFollowed?: boolean;
  onToggleFollow?: (id: string) => void;
  onStart1v1Call?: (host: StreamHost) => void;
  onOpenGiftDrawer?: (recipientName: string) => void;
  onClose: () => void;
}

export const LiveUserProfileModal: React.FC<LiveUserProfileModalProps> = ({
  targetUser,
  currentUser,
  isFollowed = false,
  onToggleFollow,
  onStart1v1Call,
  onOpenGiftDrawer,
  onClose
}) => {
  const [copiedId, setCopiedId] = React.useState<boolean>(false);

  // Router abstraction that connects to browser history without refreshing the app
  const router = {
    back: () => {
      sound.playClick();
      if (typeof window !== 'undefined' && window.history.state?.isLiveProfileModal) {
        window.history.back();
      } else {
        onClose();
      }
    }
  };

  // Synchronize with browser history state for smooth back navigation
  useEffect(() => {
    // Push modal state to browser history stack so back gestures & router.back() work seamlessly
    try {
      window.history.pushState({ isLiveProfileModal: true }, '');
    } catch {
      // ignore
    }

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  const displayId = (targetUser as StreamHost).id || (targetUser as UserProfile).displayId || '84920193';
  const name = targetUser.name || 'Amorex Star';
  const avatar = (targetUser as StreamHost).avatar || (targetUser as UserProfile).avatarUrl || (targetUser as UserProfile).avatar;
  const level = targetUser.level || 5;
  const isHost = 'hourlyRate' in targetUser || 'coverImage' in targetUser;
  const location = (targetUser as StreamHost).region || (targetUser as UserProfile).city 
    ? `${(targetUser as any).city || (targetUser as StreamHost).region || 'Dubai'}, ${(targetUser as any).country || 'UAE'}`
    : 'Dubai, UAE';

  const handleCopyId = () => {
    sound.playClick();
    navigator.clipboard?.writeText(String(displayId));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="w-full max-w-md bg-[#0F1123] border-t sm:border border-pink-500/30 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[85vh]"
        style={{
          boxShadow: '0 -10px 40px rgba(255, 46, 147, 0.25)'
        }}
      >
        {/* TOP HEADER: Prominent Back Navigation Button & Actions */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0F1123]/90 backdrop-blur-md border-b border-white/10">
          <button
            id="live-profile-back-button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold text-xs transition-all border border-white/15 cursor-pointer shadow-md"
            title="Return to Live Stream"
          >
            <ChevronLeft size={18} className="text-pink-400 stroke-[3]" />
            <span className="tracking-wide">Back to Live</span>
          </button>

          <span className="text-xs font-mono font-bold text-gray-400">
            Profile Details
          </span>

          <div className="w-16 flex justify-end">
            <span className="text-[10px] bg-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-500/30 flex items-center gap-1">
              <Sparkles size={10} className="text-pink-400" />
              <span>In Stream</span>
            </span>
          </div>
        </div>

        {/* PROFILE BODY (Smooth Scrolling) */}
        <div className="overflow-y-auto no-scrollbar p-5 space-y-4 smooth-scroll">
          {/* Avatar and Primary Identity */}
          <div className="flex flex-col items-center text-center relative">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#FFD700] via-[#FF2E93] to-[#00D2FF] shadow-[0_0_20px_rgba(255,46,147,0.5)]">
                <img
                  referrerPolicy="no-referrer"
                  src={avatar}
                  alt={name}
                  className="w-full h-full rounded-full object-cover border-2 border-[#090A15]"
                />
              </div>
              <span className="absolute -bottom-1 right-1 text-[10px] font-black bg-[#FFD700] text-black px-2 py-0.5 rounded-full shadow-md">
                Lv.{level}
              </span>
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090A15]" />
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">{name}</h3>
              <ShieldCheck size={18} className="text-[#00D2FF]" />
            </div>

            {/* Unique 8-Digit ID with Quick Copy */}
            <button
              onClick={handleCopyId}
              className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 transition-colors"
              title="Click to copy ID"
            >
              <span>ID: {displayId}</span>
              {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-gray-400" />}
            </button>

            {/* Live Location & Verification */}
            <div className="mt-2 flex items-center gap-2 text-xs text-pink-300 font-medium">
              <span className="flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                <MapPin size={12} className="text-pink-400" />
                <span>{location}</span>
              </span>
              <span className="flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 text-cyan-300">
                <Crown size={12} className="text-[#FFD700]" />
                <span>Verified VIP</span>
              </span>
            </div>
          </div>

          {/* Bio / Status */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-xs text-gray-200 leading-relaxed">
            <p className="italic">
              {(targetUser as any).bio || "Singing love songs & chatting with friends! Send a rose to enter VIP front row."}
            </p>
          </div>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Followers</div>
              <div className="text-base font-black text-white mt-0.5">
                {((targetUser as any).followerCount || 2420).toLocaleString()}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Charm</div>
              <div className="text-base font-black text-pink-400 mt-0.5">
                {((targetUser as any).charmLevel || 18)}🔥
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="text-xs text-gray-400 font-medium">Gifts Recv</div>
              <div className="text-base font-black text-amber-300 mt-0.5">
                12.5K 🎁
              </div>
            </div>
          </div>

          {/* Languages & Tags */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Languages size={12} className="text-pink-400" />
              <span>Languages Spoken</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {((targetUser as StreamHost).languages || ['English', 'Malayalam', 'Hindi']).map((lang, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-200 font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-3 bg-[#090A15] border-t border-white/10 flex items-center gap-2">
          {/* Follow / Unfollow */}
          {onToggleFollow && (
            <button
              id="live-profile-follow-btn"
              onClick={() => {
                sound.playHeartLike();
                onToggleFollow(String(displayId));
                confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isFollowed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                  : 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-[0_0_15px_rgba(255,46,147,0.5)] active:scale-95'
              }`}
            >
              <Heart size={14} className={isFollowed ? 'fill-emerald-300 text-emerald-300' : ''} />
              <span>{isFollowed ? 'Following' : 'Follow Host'}</span>
            </button>
          )}

          {/* Send Gift Direct */}
          {onOpenGiftDrawer && (
            <button
              id="live-profile-gift-btn"
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenGiftDrawer(name);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/50 text-amber-300 hover:bg-amber-500/40 font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Send Gift"
            >
              <Gift size={15} />
              <span>Gift</span>
            </button>
          )}

          {/* 1v1 Video Call Direct (if host) */}
          {isHost && onStart1v1Call && (
            <button
              id="live-profile-call-btn"
              onClick={() => {
                sound.playClick();
                onClose();
                onStart1v1Call(targetUser as StreamHost);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-cyan-600 text-black font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)]"
              title="Start 1v1 Video Call"
            >
              <Video size={15} />
              <span>1v1 Call</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
