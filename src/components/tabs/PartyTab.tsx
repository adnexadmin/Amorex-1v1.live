import React, { useState, useEffect, useRef } from 'react';
import { PartyRoom, UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Radio,
  Users,
  Music,
  Crown,
  Sparkles,
  Heart,
  Flame,
  Send,
  Minimize2,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  UserPlus,
  Check,
  Gamepad2,
  Gift,
  ShieldCheck,
  ShieldAlert,
  Trophy,
  Globe,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { usePartyAudioMesh } from '../../hooks/usePartyAudioMesh';
import { GuestSeatModal } from '../party/GuestSeatModal';
import { InRoomGamesDrawer } from '../party/InRoomGamesDrawer';
import { TopGiftersModal } from '../party/TopGiftersModal';
import { ReportUserModal, ReportTargetInfo } from '../modals/ReportUserModal';
import { autoTranslateText } from '../../utils/translate';
import { getAppLanguage, AppLanguage, SUPPORTED_LANGUAGES, t } from '../../utils/i18n';

interface PartyTabProps {
  rooms: PartyRoom[];
  user: UserProfile;
  onOpenGiftDrawer: (hostName: string) => void;
  onDeductCoins: (amount: number) => boolean;
  onAddCoins: (amount: number) => void;
  onOpenRecharge: () => void;
}

export const PartyTab: React.FC<PartyTabProps> = ({
  rooms,
  user,
  onOpenGiftDrawer,
  onDeductCoins,
  onAddCoins,
  onOpenRecharge
}) => {
  const [selectedRoom, setSelectedRoom] = useState<PartyRoom>(rooms?.[0] || {
    id: 'room-101',
    displayId: '99201948',
    title: '💖 Bollywood Karaoke Night & Romantic Lounge',
    hostId: 'host-1',
    hostName: 'Aanya Sharma',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    viewerCount: 4280,
    tags: ['Karaoke', 'Bollywood', '12Seats'],
    region: 'India'
  });
  const [seatLayoutMode, setSeatLayoutMode] = useState<'6' | '9' | '12'>('12');
  const [groupCallViewMode, setGroupCallViewMode] = useState<'VOICE' | 'VIDEO'>('VOICE');
  const [userSeatIndex, setUserSeatIndex] = useState<number | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoRequested, setIsVideoRequested] = useState<boolean>(true);
  const [followedGroups, setFollowedGroups] = useState<Record<string, boolean>>({});
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // 12-Seat WebRTC Audio & Video Mesh Hook
  const {
    speakingVolumes,
    isAudioMeshConnected,
    localMicLevel,
    localStream,
    isCameraActive,
    toggleCamera
  } = usePartyAudioMesh({
    userSeatIndex,
    totalSeats: 12,
    isMicMuted,
    isVideoEnabled: isVideoRequested
  });

  // Attach local camera stream to local video element if active
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCameraActive]);

  // Guest Seat Application Modal state
  const [applyingSeatIndex, setApplyingSeatIndex] = useState<number | null>(null);

  // In-Room Mini Games Drawer state
  const [isGamesDrawerOpen, setIsGamesDrawerOpen] = useState<boolean>(false);

  // 54-Second Countdown Lucky Bonus Chest Timer
  const [bonusCountdown, setBonusCountdown] = useState<number>(54);
  const [isChestReady, setIsChestReady] = useState<boolean>(false);

  // PiP Minimized Mode
  const [isPartyPiPActive, setIsPartyPiPActive] = useState<boolean>(false);

  // Report User & Room Safety Moderation State
  const [reportTarget, setReportTarget] = useState<ReportTargetInfo | null>(null);

  // In-Room Group Chat
  const [roomChatMessages, setRoomChatMessages] = useState<Array<{
    id: string;
    sender: string;
    level: number;
    text: string;
    isHost?: boolean;
    isGift?: boolean;
  }>>([
    { id: '1', sender: selectedRoom.hostName, level: 32, text: 'Welcome to the 12-Seat VIP Party Room! 💖 Grab a mic!', isHost: true },
    { id: '2', sender: 'CrownKing', level: 45, text: 'Hey everyone! Playing Champ Car racing 🏎️' },
    { id: '3', sender: 'Aanya_Lover', level: 19, text: 'Sent 10x Passion Roses to Host! 🌹', isGift: true }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Party Chat Auto-Translation
  const [currentAppLang, setCurrentAppLang] = useState<AppLanguage>(getAppLanguage());
  const [autoTranslatePartyChat, setAutoTranslatePartyChat] = useState<boolean>(true);
  const [partyChatOriginals, setPartyChatOriginals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail) {
        setCurrentAppLang(customEvent.detail);
      } else {
        setCurrentAppLang(getAppLanguage());
      }
    };
    window.addEventListener('amorex_language_changed', handleLangChange);
    return () => {
      window.removeEventListener('amorex_language_changed', handleLangChange);
    };
  }, []);

  // Top Gifters Leaderboard State & Real-Time Simulation
  const [topGifters, setTopGifters] = useState<Array<{
    userId: string;
    name: string;
    avatar: string;
    level: number;
    coinsContributed: number;
  }>>([
    { userId: 'u-1', name: 'CrownKing', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', level: 45, coinsContributed: 18500 },
    { userId: 'u-2', name: 'Layla_DXB', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', level: 24, coinsContributed: 12400 },
    { userId: 'u-3', name: 'PrinceAli', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', level: 18, coinsContributed: 8900 },
    { userId: 'u-4', name: 'Aanya_Lover', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', level: 19, coinsContributed: 4500 },
    { userId: 'u-5', name: 'Farhan_Vibes', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', level: 15, coinsContributed: 2300 }
  ]);
  const [isTopGiftersModalOpen, setIsTopGiftersModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTopGifters((prev) => {
        const gifterIndex = Math.floor(Math.random() * prev.length);
        const boost = Math.floor(Math.random() * 5) * 300 + 200;
        const updated = [...prev];
        updated[gifterIndex] = {
          ...updated[gifterIndex],
          coinsContributed: updated[gifterIndex].coinsContributed + boost
        };
        return updated.sort((a, b) => b.coinsContributed - a.coinsContributed);
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Floating Reaction Emojis
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

  // BGM Player state
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(true);
  const [bgmTrack, setBgmTrack] = useState<string>('Romantic Chill Lounge');

  // Simulated Occupied Guests for 12 seats
  const guestSeatsData = [
    { seat: 1, name: selectedRoom.hostName, avatar: selectedRoom.hostAvatar, level: 32, isHost: true },
    { seat: 2, name: 'Layla_DXB', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', level: 24 },
    { seat: 3, name: 'PrinceAli', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', level: 18 },
    { seat: 4, name: 'Aanya_Sing', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', level: 29 },
    { seat: 5, name: null, avatar: null, level: 0 },
    { seat: 6, name: null, avatar: null, level: 0 },
    { seat: 7, name: 'Farhan_Vibes', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', level: 15 },
    { seat: 8, name: null, avatar: null, level: 0 },
    { seat: 9, name: null, avatar: null, level: 0 },
    { seat: 10, name: null, avatar: null, level: 0 },
    { seat: 11, name: null, avatar: null, level: 0 },
    { seat: 12, name: null, avatar: null, level: 0 }
  ];

  // 54-Second Countdown Lucky Bonus Chest loop
  useEffect(() => {
    const timer = setInterval(() => {
      setBonusCountdown((prev) => {
        if (prev <= 1) {
          setIsChestReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaimBonusChest = () => {
    sound.playJackpotFanfare();
    const bonus = Math.floor(Math.random() * 101) + 100; // 100 - 200 coins
    onAddCoins(bonus);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    setIsChestReady(false);
    setBonusCountdown(54);
    setRoomChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: user.name,
        level: user.level || 2,
        text: `🎁 Claimed +${bonus} Free Lucky Chest Coins!`,
        isGift: true
      }
    ]);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sound.playClick();
    setRoomChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: user.name,
        level: user.level || 2,
        text: chatInput.trim()
      }
    ]);
    setChatInput('');
  };

  const handleSendQuickEmoji = (emoji: string) => {
    sound.playHeartLike();
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 60 + 20 };
    setFloatingReactions((prev) => [...prev, newReaction]);

    setRoomChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: user.name,
        level: user.level || 2,
        text: `${emoji} ${emoji} ${emoji}`
      }
    ]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1800);
  };

  const handleToggleFollow = (roomId: string) => {
    sound.playHeartLike();
    setFollowedGroups((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const handleConfirmGuestSeat = (withVideo: boolean = true) => {
    if (applyingSeatIndex === null) return;
    setIsVideoRequested(withVideo);
    setUserSeatIndex(applyingSeatIndex);
    setIsMicMuted(false);
    setApplyingSeatIndex(null);
    sound.playCallConnected();
    setRoomChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: user.name,
        level: user.level || 2,
        text: withVideo
          ? `📹 Joined Seat #${applyingSeatIndex + 1} with WebRTC Live Video & Audio Mesh!`
          : `🎤 Took Seat #${applyingSeatIndex + 1} and opened microphone!`
      }
    ]);
  };

  const handleLeaveSeat = () => {
    sound.playEndCall();
    setUserSeatIndex(null);
    setIsMicMuted(true);
  };

  const isFollowed = followedGroups[selectedRoom.id];

  // Number of seats to display
  const totalSeatsToShow = seatLayoutMode === '6' ? 6 : seatLayoutMode === '9' ? 9 : 12;
  const visibleGuestSeats = guestSeatsData.slice(1, totalSeatsToShow);

  return (
    <div className="pb-24 max-w-6xl mx-auto px-2.5 sm:px-6 flex flex-col gap-3 sm:gap-5 relative">
      {/* Floating Party Room PiP Bubble when Minimized */}
      <AnimatePresence>
        {isPartyPiPActive && (
          <motion.div
            drag
            dragConstraints={{ left: 10, right: 300, top: 50, bottom: 500 }}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed bottom-20 right-4 z-50 w-44 rounded-2xl overflow-hidden bg-[#14162B]/95 border border-pink-500/50 shadow-[0_0_25px_rgba(255,46,147,0.5)] p-2.5 backdrop-blur-xl cursor-grab active:cursor-grabbing text-white"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-pink-300">Party Audio PiP</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPartyPiPActive(false)}
                  className="p-1 text-gray-300 hover:text-white"
                  title="Maximize Room"
                >
                  <Maximize2 size={12} />
                </button>
                <button
                  onClick={() => setIsPartyPiPActive(false)}
                  className="p-1 text-gray-300 hover:text-red-400"
                  title="Close PiP"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="relative">
                <img
                  referrerPolicy="no-referrer"
                  src={selectedRoom.hostAvatar}
                  alt={selectedRoom.hostName}
                  className="w-9 h-9 rounded-full object-cover border border-pink-400"
                />
                {speakingVolumes[0] > 0.05 && (
                  <div className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping" />
                )}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-black truncate">{selectedRoom.title}</p>
                <p className="text-[9px] text-gray-400 truncate">Host: {selectedRoom.hostName}</p>
              </div>
            </div>

            {userSeatIndex !== null && (
              <button
                onClick={() => setIsMicMuted((prev) => !prev)}
                className={`w-full mt-2 py-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 ${
                  isMicMuted ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isMicMuted ? <MicOff size={10} /> : <Mic size={10} />}
                <span>{isMicMuted ? 'Unmute Mic' : 'Mic Active'}</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP ROOM SELECTION BAR */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => {
              sound.playClick();
              setSelectedRoom(room);
              setUserSeatIndex(null);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedRoom.id === room.id
                ? 'bg-gradient-to-r from-[#00D2FF] to-pink-500 text-[#090A15] shadow-[0_0_12px_rgba(0,210,255,0.4)] scale-105'
                : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            <span>👑</span>
            <span>{room.title}</span>
            <span className="text-[9px] opacity-75 font-mono">({room.viewerCount})</span>
          </button>
        ))}
      </div>

      {/* 2. MAIN 12-SEAT PARTY STAGE ARENA */}
      <div className="relative rounded-3xl overflow-hidden glass border border-pink-500/30 p-3 sm:p-5 shadow-2xl bg-gradient-to-b from-[#14162B]/95 via-[#090A15]/90 to-[#090A15]">
        {/* Floating Emojis Canvas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 1, y: '85%', x: `${r.x}%`, scale: 0.8 }}
              animate={{ opacity: 0, y: '20%', scale: 1.6 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="absolute text-3xl filter drop-shadow-[0_0_10px_#FF2E93]"
            >
              {r.emoji}
            </motion.div>
          ))}
        </div>

        {/* Room Header Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
              <Users size={12} className="text-[#00D2FF]" />
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {(selectedRoom?.viewerCount ?? 0).toLocaleString()} in Room
              </span>
            </div>

            {/* Seat Mode Selector: 6 / 9 / 12 Seats */}
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10">
              {(['6', '9', '12'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    sound.playClick();
                    setSeatLayoutMode(mode);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                    seatLayoutMode === mode
                      ? 'bg-[#FF2E93] text-white shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode} Seats
                </button>
              ))}
            </div>

            {/* View Mode: Voice vs. Live Video Group Call */}
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  sound.playClick();
                  setGroupCallViewMode('VOICE');
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                  groupCallViewMode === 'VOICE'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mic size={10} />
                <span className="hidden xs:inline">Voice</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setGroupCallViewMode('VIDEO');
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                  groupCallViewMode === 'VIDEO'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Video size={10} />
                <span>Video Call</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Follow Group */}
            <button
              onClick={() => handleToggleFollow(selectedRoom.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                isFollowed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-gradient-to-r from-pink-500 to-[#FF2E93] text-white shadow-md'
              }`}
            >
              {isFollowed ? <Check size={10} /> : <UserPlus size={10} />}
              <span>{isFollowed ? 'Joined' : '+ Follow'}</span>
            </button>

            {/* Report Room / Host to Super Admin */}
            <button
              id="party-room-header-report-btn"
              onClick={() => {
                sound.playClick();
                setReportTarget({
                  id: selectedRoom.hostId || `host-${selectedRoom.id}`,
                  name: selectedRoom.hostName,
                  avatar: selectedRoom.hostAvatar,
                  displayId: selectedRoom.hostId || 'HOST-VIP',
                  role: 'PARTY_HOST'
                });
              }}
              title="Report Room / Flag Inappropriate Content to Super Admin"
              className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 flex items-center gap-1 transition-all cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.3)]"
            >
              <ShieldAlert size={11} className="text-red-400" />
              <span className="hidden xs:inline">Report</span>
            </button>

            {/* Minimize to PiP */}
            <button
              onClick={() => {
                sound.playClick();
                setIsPartyPiPActive(true);
              }}
              title="Minimize to Floating PiP Audio"
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center border border-white/10"
            >
              <Minimize2 size={13} />
            </button>
          </div>
        </div>

        {/* WebRTC Live Group Call Mesh Status Strip */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-black/50 border border-emerald-400/30 text-[10px] relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-emerald-300">
              WebRTC Live Mesh: {isAudioMeshConnected ? 'Connected (Multi-Peer HD Audio & Video)' : 'Connecting...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {userSeatIndex !== null && (
              <span className="text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                Seat #{userSeatIndex + 1} Active
              </span>
            )}
            <span className="text-gray-400">
              {groupCallViewMode === 'VIDEO' ? '📹 HD Multi-Video Grid' : '🎙️ Multi-Mic Audio Stage'}
            </span>
          </div>
        </div>

        {/* Active Seater Real-Time Calling Controls Toolbar */}
        {userSeatIndex !== null && (
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-black/90 to-teal-950/90 border border-emerald-400/50 flex flex-wrap items-center justify-between gap-2 relative z-10 shadow-[0_0_20px_rgba(52,211,153,0.25)]">
            <div className="flex items-center gap-2">
              <div className="relative">
                {isCameraActive && localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-9 h-9 rounded-full object-cover border-2 border-emerald-400"
                  />
                ) : (
                  <img
                    referrerPolicy="no-referrer"
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full border border-emerald-400 object-cover"
                  />
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-[8px] text-black font-black">
                  ✓
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Live on Seat #{userSeatIndex + 1}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </span>
                <span className="text-[10px] text-emerald-300 font-medium">
                  {isMicMuted ? 'Microphone Muted' : 'Speaking Live (Mic Open)'} • {isCameraActive ? 'Camera On' : 'Camera Off'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Mic */}
              <button
                onClick={() => {
                  sound.playClick();
                  setIsMicMuted((prev) => !prev);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMicMuted
                    ? 'bg-red-500/30 text-red-200 border border-red-400'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                }`}
              >
                {isMicMuted ? <MicOff size={13} /> : <Mic size={13} />}
                <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              {/* Toggle Camera */}
              <button
                onClick={() => {
                  sound.playClick();
                  toggleCamera();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCameraActive
                    ? 'bg-pink-500/30 text-pink-200 border border-pink-400 shadow-[0_0_10px_rgba(255,46,147,0.3)]'
                    : 'bg-white/10 text-gray-300 border border-white/20'
                }`}
              >
                {isCameraActive ? <Video size={13} /> : <VideoOff size={13} />}
                <span>{isCameraActive ? 'Cam On' : 'Cam Off'}</span>
              </button>

              {/* Leave Seat */}
              <button
                onClick={handleLeaveSeat}
                className="px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold transition-colors cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        )}

        {/* TOP GIFTERS LEADERBOARD PREVIEW RIBBON */}
        <div
          onClick={() => {
            sound.playClick();
            setIsTopGiftersModalOpen(true);
          }}
          className="mx-3 sm:mx-5 my-2.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-950/85 via-slate-950/90 to-purple-950/85 border border-amber-400/40 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-[0_0_20px_rgba(255,215,0,0.15)] group relative z-10"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform shrink-0">
              <Trophy size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-black text-xs text-white">
                <span>🏆 Top Gifters Leaderboard</span>
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded-full font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-amber-200/90 font-medium truncate mt-0.5">
                1st: <strong className="text-white">{topGifters[0]?.name}</strong> ({topGifters[0]?.coinsContributed.toLocaleString()} 🪙)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-300 font-bold group-hover:translate-x-1 transition-transform shrink-0 pl-2">
            <span>View All</span>
            <span>→</span>
          </div>
        </div>

        {/* 3. HOST SPOTLIGHT & GROUP CALL STAGE */}
        {groupCallViewMode === 'VIDEO' ? (
          /* LIVE VIDEO GROUP CALL STAGE */
          <div className="py-2.5 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {/* Host Main Video Tile */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/60 border border-amber-400/50 shadow-[0_0_15px_rgba(255,215,0,0.2)] flex flex-col justify-between p-2 group">
                <img
                  referrerPolicy="no-referrer"
                  src={selectedRoom.hostAvatar}
                  alt={selectedRoom.hostName}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    speakingVolumes[0] > 0.05 ? 'scale-105' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                {/* Host Badge Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[9px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <span>👑</span>
                    <span>Host Lv.32</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                </div>

                {/* Host Info Footer */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate drop-shadow">{selectedRoom.hostName}</p>
                    <p className="text-[9px] text-amber-200/90 truncate">{selectedRoom.title}</p>
                  </div>
                  <div className={`p-1 rounded-full ${speakingVolumes[0] > 0.05 ? 'bg-emerald-500 text-black animate-pulse' : 'bg-black/60 text-white'}`}>
                    <Mic size={11} />
                  </div>
                </div>
              </div>

              {/* User Live Video Tile (if user is seated) or Join Tile */}
              {userSeatIndex !== null ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/60 border border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.25)] flex flex-col justify-between p-2">
                  {isCameraActive && localStream ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      referrerPolicy="no-referrer"
                      src={user.avatar}
                      alt={user.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[9px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <span>Seat #{userSeatIndex + 1}</span>
                      <span>(You)</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs font-black text-white truncate">{user.name}</span>
                    <div className={`p-1 rounded-full ${isMicMuted ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'}`}>
                      {isMicMuted ? <MicOff size={11} /> : <Mic size={11} />}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    setApplyingSeatIndex(0);
                  }}
                  className="rounded-2xl border border-dashed border-pink-400/50 bg-gradient-to-b from-pink-500/10 to-purple-600/10 hover:border-pink-400 hover:bg-pink-500/20 aspect-video flex flex-col items-center justify-center p-3 transition-all cursor-pointer group shadow-sm"
                >
                  <Video size={24} className="text-pink-400 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-black text-white">+ Join Video Call</span>
                  <span className="text-[9px] text-pink-300 font-medium">Turn on Camera &amp; Mic</span>
                </button>
              )}

              {/* Other seated guests preview tiles */}
              {visibleGuestSeats.slice(0, 2).map((guest, gIdx) => {
                if (!guest.name) return null;
                const actualSeat = gIdx + 1;
                const isSpeaking = speakingVolumes[actualSeat] > 0.05;
                return (
                  <div key={guest.seat} className="relative rounded-2xl overflow-hidden aspect-video bg-black/60 border border-white/15 flex flex-col justify-between p-2">
                    <img
                      referrerPolicy="no-referrer"
                      src={guest.avatar!}
                      alt={guest.name}
                      className={`absolute inset-0 w-full h-full object-cover ${isSpeaking ? 'scale-105 transition-transform' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[9px] font-black bg-black/60 text-amber-300 px-1.5 py-0.2 rounded">
                        Seat #{actualSeat + 1} • Lv.{guest.level}
                      </span>
                      {isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{guest.name}</span>
                      <div className={`p-1 rounded-full ${isSpeaking ? 'bg-emerald-500 text-black' : 'bg-black/60 text-white'}`}>
                        <Mic size={11} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* CLASSIC VOICE SPOTLIGHT STAGE */
          <div className="flex flex-col items-center justify-center pt-3 pb-4 relative z-10">
            <div className="relative flex flex-col items-center">
              {/* Crown */}
              <div className="absolute -top-4 text-xl filter drop-shadow-[0_0_8px_#FFD700] animate-bounce">
                👑
              </div>

              {/* Speaking Aura Ring */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-[#FFD700] via-[#FF2E93] to-[#00D2FF] shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all ${
                  speakingVolumes[0] > 0.05 ? 'scale-105 ring-4 ring-emerald-400' : ''
                }`}
              >
                <img
                  referrerPolicy="no-referrer"
                  src={selectedRoom.hostAvatar}
                  alt={selectedRoom.hostName}
                  className="w-full h-full rounded-full object-cover border-2 border-[#090A15]"
                />
              </div>

              {/* Host Details */}
              <div className="mt-1.5 flex flex-col items-center text-center">
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-black text-white">{selectedRoom.hostName}</span>
                  <span className="text-[8px] font-black bg-[#FFD700] text-black px-1.5 py-0.2 rounded shadow-xs">
                    Host Lv.32
                  </span>
                </div>
                <p className="text-[10px] text-pink-300 font-medium">{selectedRoom.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. MULTI-MIC GUEST SEATS GRID (Up to 11 Guest Seats) */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 py-2 relative z-10">
          {visibleGuestSeats.map((guest, idx) => {
            const actualSeatIdx = idx + 1;
            const isUserHere = userSeatIndex === actualSeatIdx;
            const isOccupied = isUserHere || guest.name !== null;
            const guestName = isUserHere ? user.name : guest.name;
            const guestAvatar = isUserHere ? user.avatar : guest.avatar;
            const guestLevel = isUserHere ? (user.level || 2) : guest.level;
            const isSpeaking = speakingVolumes[actualSeatIdx] > 0.05;

            return (
              <div
                key={guest.seat}
                className="flex flex-col items-center text-center group"
              >
                {isOccupied ? (
                  <div className="relative">
                    {/* Speaking Sound Ring */}
                    <div
                      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-[#00D2FF] transition-all overflow-hidden ${
                        isSpeaking ? 'ring-2 ring-emerald-400 scale-105 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : ''
                      }`}
                    >
                      {isUserHere && isCameraActive && localStream ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full rounded-full object-cover border border-emerald-400"
                        />
                      ) : (
                        <img
                          referrerPolicy="no-referrer"
                          src={guestAvatar!}
                          alt={guestName!}
                          className="w-full h-full rounded-full object-cover border border-[#090A15]"
                        />
                      )}
                    </div>

                    {/* Status Indicator Badges */}
                    <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5">
                      {isUserHere && isCameraActive && (
                        <div className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[8px] shadow-sm">
                          <Video size={8} />
                        </div>
                      )}
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-sm ${
                          isUserHere && isMicMuted
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500 text-black font-bold'
                        }`}
                      >
                        {isUserHere && isMicMuted ? <MicOff size={9} /> : <Mic size={9} />}
                      </div>
                    </div>

                    <span className="text-[8px] font-bold text-gray-300 block truncate max-w-[60px] mt-1">
                      {isUserHere ? 'You' : guestName}
                    </span>
                    <span className="text-[7px] text-amber-300 font-mono font-bold">
                      Lv.{guestLevel}
                    </span>

                    {/* User Leave Seat option */}
                    {isUserHere && (
                      <button
                        onClick={handleLeaveSeat}
                        className="text-[8px] text-red-400 hover:underline mt-0.5 cursor-pointer"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                ) : (
                  /* Vacant Seat: Glowing Chair with + Join Button */
                  <button
                    onClick={() => {
                      sound.playClick();
                      setApplyingSeatIndex(actualSeatIdx);
                    }}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/5 border border-dashed border-cyan-400/40 hover:border-cyan-400 hover:bg-cyan-500/10 flex flex-col items-center justify-center transition-all group cursor-pointer shadow-xs"
                    title={`Take Seat #${actualSeatIdx + 1}`}
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">🪑</span>
                    <span className="text-[8px] font-black text-cyan-300 mt-0.5 group-hover:text-white">
                      + Join
                    </span>
                  </button>
                )}
                <span className="text-[8px] text-gray-500 font-mono mt-0.5">
                  #{actualSeatIdx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* 5. DOCKED 54-SECOND LUCKY BONUS CHEST & GAME DRAWER LAUNCHER */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-10">
          {/* Mini-Games Launch Button */}
          <button
            id="party-mini-games-btn"
            onClick={() => {
              sound.playClick();
              setIsGamesDrawerOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-black font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:scale-105 transition-transform cursor-pointer"
          >
            <Gamepad2 size={14} />
            <span>Mini-Games (Champ Car &amp; 777)</span>
          </button>

          {/* 54-Second Countdown Lucky Bonus Chest */}
          <button
            id="party-lucky-chest-btn"
            onClick={isChestReady ? handleClaimBonusChest : undefined}
            className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all ${
              isChestReady
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-black animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.6)] cursor-pointer hover:scale-105'
                : 'bg-black/40 text-amber-300 border border-amber-400/30'
            }`}
          >
            <span className="text-base">{isChestReady ? '🎁' : '📦'}</span>
            <span>
              {isChestReady ? 'CLAIM BONUS!' : `Lucky Chest (${bonusCountdown}s)`}
            </span>
          </button>
        </div>

        {/* 6. LIVE IN-ROOM GROUP CHAT STREAM (Bottom-Left) */}
        <div className="mt-3 bg-black/40 rounded-2xl p-2.5 border border-white/10 max-h-40 overflow-y-auto no-scrollbar space-y-1.5 relative z-10 text-xs">
          <div className="flex items-center justify-between pb-1 px-0.5 border-b border-white/5 text-[10px]">
            <span className="font-bold text-gray-400">Live Party Chat</span>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setAutoTranslatePartyChat(!autoTranslatePartyChat);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
                autoTranslatePartyChat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
              title="Toggle Live Group Auto-Translation"
            >
              <Globe size={10} className={autoTranslatePartyChat ? 'text-cyan-400' : 'text-gray-400'} />
              <span>Auto-Translate: {autoTranslatePartyChat ? SUPPORTED_LANGUAGES.find(l => l.code === currentAppLang)?.nativeName || currentAppLang.toUpperCase() : 'OFF'}</span>
            </button>
          </div>

          {roomChatMessages.map((msg) => {
            const isMe = msg.sender === user.name;
            const isShowingOriginal = !!partyChatOriginals[msg.id];
            const autoResult = (!isMe && autoTranslatePartyChat && !msg.isGift)
              ? autoTranslateText(msg.text, currentAppLang)
              : null;
            const isAutoTranslated = !!(autoResult && autoResult.isTranslated && !isShowingOriginal);
            const displayText = isAutoTranslated ? autoResult.translatedText : msg.text;

            return (
              <div
                key={msg.id}
                className={`p-1.5 rounded-xl flex items-start gap-1.5 ${
                  msg.isGift
                    ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-200 border border-amber-400/30 font-bold'
                    : msg.isHost
                    ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30'
                    : 'bg-white/5 text-white/90'
                }`}
              >
                <span className="text-[8px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-black px-1 py-0.2 rounded-sm shrink-0">
                  Lv.{msg.level}
                </span>
                <span className="font-extrabold text-cyan-300 shrink-0">{msg.sender}:</span>
                <div className="flex-1 min-w-0">
                  <span className="break-words">{displayText}</span>
                  {isAutoTranslated && (
                    <span className="inline-flex items-center gap-0.5 ml-1.5 text-[8px] bg-cyan-400/20 text-cyan-300 font-bold px-1 py-0.2 rounded border border-cyan-400/30">
                      <Globe size={8} />
                      <span>Translated</span>
                    </span>
                  )}
                  {autoResult && autoResult.isTranslated && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPartyChatOriginals((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }));
                      }}
                      className="ml-1 text-[8px] text-cyan-400/80 hover:text-cyan-300 underline cursor-pointer"
                    >
                      {isShowingOriginal ? 'Show Translated' : 'Original'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 7. CHAT INPUT & QUICK REACTION EMOJIS */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col gap-2 relative z-10">
          {/* Quick Reaction Emoji Pill Buttons: 👏 Beat, 👑 Crown, 💖 Heart, 🔥 Fire */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { emoji: '👏', name: 'Beat' },
              { emoji: '👑', name: 'Crown' },
              { emoji: '💖', name: 'Heart' },
              { emoji: '🔥', name: 'Fire' }
            ].map((btn) => (
              <button
                key={btn.name}
                onClick={() => handleSendQuickEmoji(btn.emoji)}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs font-bold text-gray-200 border border-white/10 flex items-center gap-1 transition-transform active:scale-90 cursor-pointer"
              >
                <span>{btn.emoji}</span>
                <span className="text-[10px]">{btn.name}</span>
              </button>
            ))}

            {/* Virtual Gift Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenGiftDrawer(selectedRoom.hostName);
              }}
              className="ml-auto px-3 py-1 rounded-full bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white font-bold text-xs flex items-center gap-1 shadow-md hover:scale-105 transition-transform shrink-0 cursor-pointer"
            >
              <Gift size={12} />
              <span>Gift</span>
            </button>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChatMessage} className="flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say something nice in room..."
              className="flex-1 bg-[#090A15] border border-white/15 focus:border-pink-500 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>

      {/* Guest Application Confirmation Modal */}
      {applyingSeatIndex !== null && (
        <GuestSeatModal
          seatNumber={applyingSeatIndex + 1}
          roomTitle={selectedRoom.title}
          hostName={selectedRoom.hostName}
          onConfirm={handleConfirmGuestSeat}
          onClose={() => setApplyingSeatIndex(null)}
        />
      )}

      {/* In-Room Mini-Games Drawer Modal */}
      <InRoomGamesDrawer
        user={user}
        isOpen={isGamesDrawerOpen}
        onClose={() => setIsGamesDrawerOpen(false)}
        onDeductCoins={onDeductCoins}
        onAddCoins={onAddCoins}
        onOpenRecharge={onOpenRecharge}
      />

      {/* Top Gifters Leaderboard Modal */}
      <TopGiftersModal
        isOpen={isTopGiftersModalOpen}
        onClose={() => setIsTopGiftersModalOpen(false)}
        gifters={topGifters}
        roomTitle={selectedRoom.title}
        hostName={selectedRoom.hostName}
        onOpenGiftDrawer={onOpenGiftDrawer}
      />

      {/* Flag / Report User or Room Modal */}
      {reportTarget && (
        <ReportUserModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetUser={reportTarget}
          currentUser={user}
          sourceContext="party_room"
          contextDetails={{
            roomId: selectedRoom.id,
            roomTitle: selectedRoom.title
          }}
        />
      )}
    </div>
  );
};
