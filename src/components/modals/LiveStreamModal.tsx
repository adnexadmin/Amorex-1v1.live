import React, { useState, useEffect, useRef } from 'react';
import { StreamHost, UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import {
  X,
  Send,
  Heart,
  Video,
  ShieldCheck,
  Minimize2,
  Users,
  Palette,
  Check,
  UserPlus,
  Volume2,
  VolumeX,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { LiveUserProfileModal } from './LiveUserProfileModal';

interface LiveStreamModalProps {
  host: StreamHost;
  user: UserProfile;
  isFollowed?: boolean;
  onToggleFollow: (hostId: string) => void;
  onStart1v1Call: (host: StreamHost) => void;
  onOpenGiftDrawer: (hostName: string) => void;
  onMinimizeToPiP?: (host: StreamHost) => void;
  onClose: () => void;
}

type RoomTheme = 'rose' | 'cyberpunk' | 'space' | 'gold';

const ROOM_THEMES: Record<RoomTheme, { name: string; icon: string; bgGradient: string; glowColor: string }> = {
  rose: {
    name: 'Romantic Rose',
    icon: '🌹',
    bgGradient: 'from-[#2A0818]/90 via-[#12050E]/80 to-[#090A15]/95',
    glowColor: 'rgba(255, 46, 147, 0.4)'
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    icon: '⚡',
    bgGradient: 'from-[#051C2C]/90 via-[#0A0E24]/80 to-[#090A15]/95',
    glowColor: 'rgba(0, 210, 255, 0.4)'
  },
  space: {
    name: 'Starry Space',
    icon: '🌌',
    bgGradient: 'from-[#19082E]/90 via-[#0C061E]/80 to-[#090A15]/95',
    glowColor: 'rgba(157, 0, 255, 0.4)'
  },
  gold: {
    name: 'Gold Elegance',
    icon: '👑',
    bgGradient: 'from-[#2B1F04]/90 via-[#140E02]/80 to-[#090A15]/95',
    glowColor: 'rgba(255, 215, 0, 0.4)'
  }
};

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  host,
  user,
  isFollowed = false,
  onToggleFollow,
  onStart1v1Call,
  onOpenGiftDrawer,
  onMinimizeToPiP,
  onClose
}) => {
  const [selectedTheme, setSelectedTheme] = useState<RoomTheme>('rose');
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  const [streamComments, setStreamComments] = useState<Array<{ id: string; user: string; level: number; text: string; isGift?: boolean }>>([
    { id: 'welcome', user: host.name, level: host.level || 1, text: `Welcome to my live stream! Say hello in the chat 👋` }
  ]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number }>>([]);
  const [selectedProfile, setSelectedProfile] = useState<StreamHost | UserProfile | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const hostId8Digit = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < host.id.length; i++) {
      hash = (hash * 31 + host.id.charCodeAt(i)) >>> 0;
    }
    return 10000000 + (hash % 89999999);
  }, [host.id]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    sound.playClick();
    setStreamComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: user.name,
        level: user.level || 1,
        text: commentInput.trim()
      }
    ]);
    setCommentInput('');
  };

  const handleHeartBurst = () => {
    sound.playHeartLike();
    const newHeart = { id: Date.now(), x: Math.random() * 60 + 20 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg h-full sm:h-[88vh] bg-[#090A15] border sm:border border-pink-500/40 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-white"
        style={{
          boxShadow: `0 0 40px ${ROOM_THEMES[selectedTheme].glowColor}`
        }}
      >
        {/* Stream Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Live Video / Video Feed */}
          {host.videoUrl ? (
            <video
              ref={remoteVideoRef}
              src={host.videoUrl}
              autoPlay
              playsInline
              loop
              muted={isAudioMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              referrerPolicy="no-referrer"
              src={host.coverImage || host.avatar}
              alt={host.name}
              className="w-full h-full object-cover opacity-85 scale-105"
            />
          )}

          {/* Dynamic Theme Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${ROOM_THEMES[selectedTheme].bgGradient} pointer-events-none opacity-60`} />

          {/* Floating Reaction Hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {floatingHearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 1, y: '80%', x: `${h.x}%`, scale: 0.8 }}
                animate={{ opacity: 0, y: '20%', scale: 1.6 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute text-3xl filter drop-shadow-[0_0_10px_#FF2E93]"
              >
                💖
              </motion.div>
            ))}
          </div>

          {/* TOP HEADER: Host Identity & Room Status */}
          <div
            className="absolute left-3 right-3 flex items-center justify-between z-30"
            style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
          >
            <div
              id="stream-host-profile-card"
              onClick={() => {
                sound.playClick();
                setSelectedProfile(host);
              }}
              className="flex items-center gap-2 bg-[#090A15]/80 hover:bg-[#151833] backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/15 hover:border-pink-500/50 shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#FFD700] via-[#FF2E93] to-[#00D2FF]">
                  <img
                    referrerPolicy="no-referrer"
                    src={host.avatar}
                    alt={host.name}
                    className="w-full h-full rounded-full object-cover border border-[#090A15]"
                  />
                </div>
                <span className="absolute -bottom-1 -right-0.5 text-[8px] font-black bg-[#FFD700] text-black px-1 rounded-full">
                  Lv.{host.level || 1}
                </span>
              </div>

              <div className="flex flex-col pr-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-extrabold text-white leading-tight truncate max-w-[100px] sm:max-w-[130px]">
                    {host.name}
                  </h4>
                  {host.isPrivate && (
                    <span className="text-[8px] bg-amber-500/90 text-black px-1 rounded font-black flex items-center gap-0.5">
                      <Lock size={8} /> PVT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-pink-300">
                  <span className="flex items-center gap-0.5 text-cyan-300 font-bold">
                    <Users size={10} /> {(host?.viewerCount ?? 1).toLocaleString()} Watching
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playHeartLike();
                  onToggleFollow(host.id);
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.2 } });
                }}
                className={`ml-1 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                  isFollowed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                    : 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-md hover:scale-105'
                }`}
              >
                {isFollowed ? (
                  <>
                    <Check size={10} />
                    <span>Followed</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={10} />
                    <span>+ Follow</span>
                  </>
                )}
              </button>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/10"
              >
                {isAudioMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
              </button>

              <button
                onClick={() => setShowThemePicker((prev) => !prev)}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-amber-300 flex items-center justify-center border border-white/10 transition-colors"
              >
                <Palette size={14} />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onMinimizeToPiP?.(host);
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white flex items-center justify-center border border-white/10"
              >
                <Minimize2 size={15} />
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 text-gray-300 hover:text-white flex items-center justify-center border border-white/10"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Theme Selector Popover */}
          <AnimatePresence>
            {showThemePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-3 top-14 z-40 bg-[#14162B] border border-pink-500/30 rounded-2xl p-2.5 shadow-2xl w-44 space-y-1.5 backdrop-blur-xl"
              >
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider px-1">
                  Wallpaper Theme
                </p>
                {(Object.keys(ROOM_THEMES) as RoomTheme[]).map((key) => {
                  const t = ROOM_THEMES[key];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        sound.playClick();
                        setSelectedTheme(key);
                        setShowThemePicker(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                        selectedTheme === key
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </span>
                      {selectedTheme === key && <Check size={12} className="text-pink-400" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Safety Notice */}
          <div className="absolute top-16 left-3 right-3 z-20">
            <div className="bg-black/50 backdrop-blur-md rounded-xl px-3 py-1.5 border border-cyan-400/30 flex items-center justify-between text-[10px] text-cyan-200 shadow-md">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck size={13} className="text-[#00D2FF] shrink-0" />
                <span className="truncate">Live Stream Moderated 24/7. Keep chat friendly!</span>
              </div>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 shrink-0 ml-1">
                Verified
              </span>
            </div>
          </div>

          {/* Live Comments Overlay */}
          <div className="absolute bottom-20 left-3 right-3 space-y-1.5 max-h-48 overflow-y-auto no-scrollbar z-20 pointer-events-auto">
            {streamComments.map((c) => (
              <div
                key={c.id}
                className={`backdrop-blur-md rounded-xl px-3 py-1 text-xs w-fit max-w-[88%] border ${
                  c.isGift
                    ? 'bg-gradient-to-r from-amber-500/30 to-[#FF2E93]/30 border-amber-400/40 text-amber-200 font-bold'
                    : 'bg-black/60 border-white/10 text-white/95'
                }`}
              >
                <span className="text-[9px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-black px-1 py-0.2 rounded-sm mr-1.5">
                  Lv.{c.level}
                </span>
                <span className="font-extrabold text-pink-400 mr-1.5">{c.user}:</span>
                <span className="font-medium">{c.text}</span>
              </div>
            ))}
          </div>

          {/* Floating Heart Tap Button */}
          <button
            onClick={handleHeartBurst}
            className="absolute bottom-20 right-3 z-30 w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF2E93] to-pink-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,46,147,0.7)] hover:scale-110 active:scale-90 transition-transform cursor-pointer"
          >
            <Heart size={20} fill="currentColor" />
          </button>
        </div>

        {/* BOTTOM ACTION & COMMENT BAR */}
        <div className="p-3 bg-[#14162B] border-t border-white/10 flex items-center gap-2 z-30">
          <button
            id="stream-lucky-gifts-btn"
            onClick={() => {
              sound.playClick();
              onOpenGiftDrawer(host.name);
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-[#FF2E93] text-white flex items-center justify-center text-lg shadow-md hover:scale-110 transition-transform shrink-0 cursor-pointer"
            title="Send Gift"
          >
            🎁
          </button>

          {/* 1v1 Video Call Button */}
          <button
            id="stream-call-me-btn"
            onClick={() => {
              sound.playClick();
              onStart1v1Call(host);
              onClose();
            }}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] text-white font-black text-xs flex items-center gap-1.5 shrink-0 shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Video size={14} className="animate-pulse" />
            <span>Call 1v1</span>
          </button>

          {/* Comment Input */}
          <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-1.5">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Send message to host..."
              className="w-full bg-[#090A15] border border-white/15 focus:border-pink-500 rounded-full px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-pink-600 text-pink-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </motion.div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <LiveUserProfileModal
            targetUser={selectedProfile}
            currentUser={user}
            isFollowed={isFollowed}
            onToggleFollow={onToggleFollow}
            onStart1v1Call={onStart1v1Call}
            onOpenGiftDrawer={onOpenGiftDrawer}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
