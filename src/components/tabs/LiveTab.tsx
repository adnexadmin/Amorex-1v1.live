import React, { useState, useRef, useMemo } from 'react';
import { StreamHost, UserProfile, Gender, Region } from '../../types';
import { sound } from '../../utils/audio';
import {
  Radio,
  Sparkles,
  PhoneCall,
  ChevronDown,
  Globe,
  Heart,
  Video,
  Languages,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  X,
  Lock,
  Search,
  ShieldCheck,
  Eye,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LiveStreamModal } from '../modals/LiveStreamModal';

export interface LanguageOption {
  id: string;
  name: string;
  flag: string;
  native: string;
}

export const COMM_LANGUAGES: LanguageOption[] = [
  { id: 'All', name: 'All Languages', flag: '🌐', native: 'All' },
  { id: 'Malayalam', name: 'Malayalam', flag: '🌴', native: 'മലയാളം' },
  { id: 'Hindi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { id: 'Arabic', name: 'Arabic', flag: '🇦🇪', native: 'العربية' },
  { id: 'Bengali', name: 'Bengali', flag: '🇧🇩', native: 'বাংলা' },
  { id: 'Urdu', name: 'Urdu', flag: '🇵🇰', native: 'اردو' },
  { id: 'Tamil', name: 'Tamil', flag: '🌸', native: 'தமிழ்' },
  { id: 'English', name: 'English', flag: '🇬🇧', native: 'English' }
];

interface LiveTabProps {
  hosts: StreamHost[];
  user: UserProfile;
  onStart1v1Call: (host: StreamHost) => void;
  onOpenGiftDrawer: (hostName: string) => void;
  onMinimizeStreamToPiP?: (host: StreamHost) => void;
}

export const LiveTab: React.FC<LiveTabProps> = ({
  hosts,
  user,
  onStart1v1Call,
  onOpenGiftDrawer,
  onMinimizeStreamToPiP
}) => {
  const [subTab, setSubTab] = useState<'Popular' | 'New' | 'Follow'>('Popular');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [targetGender, setTargetGender] = useState<'all' | Gender>('all');
  const [targetRegion, setTargetRegion] = useState<'All' | Region>('All');
  const [targetLanguage, setTargetLanguage] = useState<string>('All');
  const [languageMode, setLanguageMode] = useState<'filter' | 'sortFirst'>('filter');
  const [levelBadgeFilter, setLevelBadgeFilter] = useState<'any' | 'similar'>('any');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'level' | 'language'>('popular');

  const [isRadarScanning, setIsRadarScanning] = useState<boolean>(false);
  const [radarMatchedHost, setRadarMatchedHost] = useState<StreamHost | null>(null);

  const [activeStreamHost, setActiveStreamHost] = useState<StreamHost | null>(null);
  const [followedHosts, setFollowedHosts] = useState<Record<string, boolean>>({});

  // Self Broadcast (Go Live) State
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [viewerCount, setViewerCount] = useState<number>(1);
  const [activeCoHost, setActiveCoHost] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Private Passcode Stream Setup
  const [isPrivateStream, setIsPrivateStream] = useState<boolean>(false);
  const [streamPasscode, setStreamPasscode] = useState<string>('');
  const [showPreLiveModal, setShowPreLiveModal] = useState<boolean>(false);

  // Viewer Requests Queue
  const [incomingWatchRequests, setIncomingWatchRequests] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [viewRequestHost, setViewRequestHost] = useState<StreamHost | null>(null);
  const [requestSentStatus, setRequestSentStatus] = useState<boolean>(false);

  // Super Admin Default Host Object (ID: 1000001)
  const superAdminHost: StreamHost = useMemo(() => ({
    id: 'admin_1000001',
    displayId: '1000001',
    name: 'Adnex Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
    level: 99,
    gender: 'female',
    age: 24,
    region: 'Global HQ',
    isLive: true,
    viewerCount: 9999,
    coinRatePerMin: 60,
    tags: ['SuperAdmin', 'OfficialSupport'],
    bio: 'Official Amorex Super Admin & 24/7 Live Support Center',
    followersCount: 50000,
    likesCount: 100000,
    languages: ['Malayalam', 'English', 'Hindi', 'Arabic'],
    primaryLanguage: 'Malayalam'
  }), []);

  const handleToggleFollow = (hostId: string) => {
    sound.playHeartLike();
    setFollowedHosts((prev) => ({ ...prev, [hostId]: !prev[hostId] }));
  };

  const hostSpeaksLanguage = (host: StreamHost, langId: string): boolean => {
    if (langId === 'All') return true;
    const target = langId.toLowerCase();
    if (host.primaryLanguage && host.primaryLanguage.toLowerCase() === target) return true;
    if (host.languages && host.languages.some((l) => l.toLowerCase() === target)) return true;
    if (host.tags && host.tags.some((t) => t.toLowerCase().includes(target))) return true;
    if (host.bio && host.bio.toLowerCase().includes(target)) return true;
    return false;
  };

  // Launch Broadcast Studio
  const handleConfirmStartBroadcast = async () => {
    sound.playClick();
    setShowPreLiveModal(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true
      });
      localStreamRef.current = stream;
      setIsBroadcasting(true);

      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(console.error);
        }
      }, 200);
    } catch (err) {
      console.warn('Camera access error:', err);
      setIsBroadcasting(true);
    }
  };

  const handleStopBroadcast = () => {
    sound.playClick();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setIsBroadcasting(false);
    setActiveCoHost(null);
    setIsPrivateStream(false);
    setStreamPasscode('');
    setIncomingWatchRequests([]);
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const vTrack = localStreamRef.current.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setIsCameraActive(vTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const aTrack = localStreamRef.current.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setIsMicActive(aTrack.enabled);
      }
    }
  };

  const handleApproveViewer = (viewer: { id: string; name: string; avatar: string }) => {
    sound.playCoinDrop();
    setViewerCount((prev) => prev + 1);
    setIncomingWatchRequests((prev) => prev.filter((v) => v.id !== viewer.id));
  };

  const handleRejectViewer = (viewerId: string) => {
    sound.playClick();
    setIncomingWatchRequests((prev) => prev.filter((v) => v.id !== viewerId));
  };

  const handleHostClick = (host: StreamHost) => {
    sound.playClick();
    if (host.isPrivate) {
      setViewRequestHost(host);
      setRequestSentStatus(false);
    } else {
      setActiveStreamHost(host);
    }
  };

  const handleSendWatchRequest = () => {
    sound.playClick();
    setRequestSentStatus(true);
    setTimeout(() => {
      sound.playCoinDrop();
      if (viewRequestHost) {
        setActiveStreamHost(viewRequestHost);
        setViewRequestHost(null);
        setRequestSentStatus(false);
      }
    }, 2500);
  };

  // Filter and Search Hosts
  const filteredHosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = hosts.filter((host) => {
      if (q) {
        const matchesName = host.name.toLowerCase().includes(q);
        const matchesId = host.displayId?.toString().includes(q) || host.id.toLowerCase().includes(q);
        return matchesName || matchesId;
      }
      if (subTab === 'Popular' && !host.isPopular) return false;
      if (subTab === 'New' && !host.isNew) return false;
      if (subTab === 'Follow' && !followedHosts[host.id]) return false;
      if (targetRegion !== 'All' && host.region !== targetRegion) return false;
      if (targetGender !== 'all' && host.gender !== targetGender) return false;
      if (languageMode === 'filter' && targetLanguage !== 'All' && !hostSpeaksLanguage(host, targetLanguage)) {
        return false;
      }
      return true;
    });

    // If searching for Super Admin ID '1000001' or 'admin', prioritize Super Admin at index 0
    if (q === '1000001' || q.includes('admin')) {
      const alreadyHasAdmin = list.some((h) => h.displayId === '1000001' || h.id === 'admin_1000001');
      if (!alreadyHasAdmin) {
        list = [superAdminHost, ...list];
      }
    }

    return list;
  }, [hosts, searchQuery, subTab, followedHosts, targetRegion, targetGender, languageMode, targetLanguage, superAdminHost]);

  const handleStartRadarScan = () => {
    sound.playClick();
    setIsRadarScanning(true);
    setRadarMatchedHost(null);

    setTimeout(() => {
      sound.playHeartLike();
      const eligible = filteredHosts.filter((h) => h.isLive);
      const chosen = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : superAdminHost;

      setRadarMatchedHost(chosen || null);
      setIsRadarScanning(false);
    }, 1800);
  };

  const followedCount = Object.values(followedHosts).filter(Boolean).length;

  return (
    <div className="pb-24 max-w-6xl mx-auto px-2.5 sm:px-6 flex flex-col gap-3 sm:gap-4">
      {/* Top Sticky Navigation Bar with Direct Search */}
      <nav className="flex flex-col gap-2.5 px-1 sm:px-2 border-b border-white/10 bg-[#090A15]/90 backdrop-blur-md sticky top-12 sm:top-14 z-30 py-2.5 -mt-2">
        {/* Direct Search Bar for finding Users & Super Admin (1000001) */}
        <div className="relative w-full flex items-center">
          <Search size={14} className="absolute left-3.5 text-pink-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. 1000001 for Super Admin) or Name..."
            className="w-full bg-white/5 border border-white/15 focus:border-pink-500 rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-gray-400 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-gray-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sub-tabs & Go Live Button */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
            <button
              onClick={() => {
                sound.playClick();
                setSubTab('Popular');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all uppercase shrink-0 cursor-pointer ${
                subTab === 'Popular' && !searchQuery
                  ? 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-[0_0_10px_rgba(255,46,147,0.5)]'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              POPULAR
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setSubTab('New');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all uppercase shrink-0 cursor-pointer ${
                subTab === 'New' && !searchQuery
                  ? 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-[0_0_10px_rgba(255,46,147,0.5)]'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              NEW
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setSubTab('Follow');
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all uppercase shrink-0 cursor-pointer ${
                subTab === 'Follow' && !searchQuery
                  ? 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-[0_0_10px_rgba(255,46,147,0.5)]'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              FOLLOWING ({followedCount})
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              id="user-start-broadcast-btn"
              onClick={() => setShowPreLiveModal(true)}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 via-[#FF2E93] to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,46,147,0.6)] hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
            >
              <Radio size={14} className="animate-pulse text-white" />
              <span>GO LIVE</span>
            </button>

            <div
              className={`relative glass px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                targetLanguage !== 'All' ? 'border-pink-500/60 bg-pink-500/15' : 'border-white/10 hover:bg-white/10'
              }`}
            >
              <Languages size={12} className={targetLanguage !== 'All' ? 'text-pink-400' : 'text-[#FF2E93]'} />
              <select
                value={targetLanguage}
                onChange={(e) => {
                  sound.playClick();
                  setTargetLanguage(e.target.value);
                }}
                className="bg-transparent text-[11px] font-bold uppercase focus:outline-none cursor-pointer pr-3 appearance-none text-gray-200"
              >
                {COMM_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-[#090A15] text-white">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={10} className="text-white/60 absolute right-1 pointer-events-none" />
            </div>
          </div>
        </div>
      </nav>

      {/* 1v1 Radar Matching Banner */}
      <section className="w-full glass rounded-2xl sm:rounded-3xl flex flex-col md:flex-row items-center p-3 sm:p-5 justify-between neon-border-cyan group relative overflow-hidden">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#00D2FF] animate-pulse absolute" />
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Radio size={18} className="text-[#00D2FF]" />
            </div>
          </div>
          <div>
            <div className="text-[#00D2FF] font-black text-xs sm:text-base tracking-wide uppercase flex items-center gap-1.5">
              <span>1v1 Matching Radar</span>
              <span className="text-[9px] bg-pink-500/20 text-pink-300 font-bold px-1.5 py-0.2 rounded-full border border-pink-500/30">
                AI Direct
              </span>
            </div>
            <div className="text-white/60 text-[11px] font-medium mt-0.5">
              Connect to verified host or Super Admin directly
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2.5 md:mt-0 w-full md:w-auto justify-end">
          <button
            onClick={handleStartRadarScan}
            disabled={isRadarScanning}
            className="bg-[#00D2FF] text-[#090A15] px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-xs tracking-wider hover:scale-105 transition-transform flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.4)] cursor-pointer"
          >
            {isRadarScanning ? (
              <>
                <Sparkles size={13} className="animate-spin" />
                <span>SCANNING...</span>
              </>
            ) : (
              <span>START RADAR</span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {radarMatchedHost && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 bg-[#090A15]/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-20"
            >
              <div className="flex items-center gap-2.5">
                <img
                  referrerPolicy="no-referrer"
                  src={radarMatchedHost.avatar}
                  alt={radarMatchedHost.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#FF2E93]"
                />
                <div>
                  <span className="font-bold text-white text-xs sm:text-sm">{radarMatchedHost.name}</span>
                  <span className="text-[10px] text-pink-300 block">ID: {radarMatchedHost.displayId} • Direct Match</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRadarMatchedHost(null)}
                  className="px-2 py-1 rounded-full text-xs text-white/50 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onStart1v1Call(radarMatchedHost);
                    setRadarMatchedHost(null);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] to-[#00D2FF] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer"
                >
                  <PhoneCall size={11} />
                  <span>Call 1v1</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Streamer Cards Grid */}
      {filteredHosts.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center flex flex-col items-center justify-center my-6 border border-white/10">
          <div className="w-16 h-16 rounded-full bg-pink-500/15 flex items-center justify-center text-3xl mb-3">
            🔍
          </div>
          <h3 className="text-white font-bold text-base mb-1">No Profiles Found</h3>
          <p className="text-gray-400 text-xs max-w-sm mb-4">
            Search <strong>1000001</strong> to reach Super Admin directly or clear search to browse live hosts.
          </p>
          <button
            onClick={() => setSearchQuery('1000001')}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            Connect to Super Admin (1000001)
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 px-0.5 sm:px-0">
          {filteredHosts.map((host, idx) => {
            const isSuperAdmin = host.displayId === '1000001' || host.id === 'admin_1000001';
            const isFollowed = followedHosts[host.id];

            return (
              <motion.div
                key={host.id}
                whileHover={{ y: -3 }}
                onClick={() => handleHostClick(host)}
                className={`relative rounded-2xl sm:rounded-3xl overflow-hidden glass h-56 sm:h-72 group transition-all cursor-pointer ${
                  isSuperAdmin
                    ? 'border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)]'
                    : idx % 2 === 0
                    ? 'border-pink-500/30 hover:border-pink-500/70'
                    : 'border-white/10 hover:border-[#00D2FF]/50'
                }`}
              >
                <img
                  referrerPolicy="no-referrer"
                  src={host.coverImage || host.avatar}
                  alt={host.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A15] via-black/30 to-transparent opacity-90" />

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                  {isSuperAdmin ? (
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] px-2 py-0.5 rounded-md font-black flex items-center gap-1 shadow-md">
                      <ShieldCheck size={11} />
                      <span>SUPER ADMIN</span>
                    </div>
                  ) : (
                    <div className="bg-[#FF2E93] text-white text-[9px] px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-1 shadow-sm">
                      <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                      <span>LIVE</span>
                    </div>
                  )}

                  {host.isPrivate && !isSuperAdmin && (
                    <div className="bg-amber-500/90 text-black text-[9px] px-1.5 py-0.5 rounded-md font-black flex items-center gap-1 shadow-sm">
                      <Lock size={9} />
                      <span>PRIVATE</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFollow(host.id);
                  }}
                  className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isFollowed
                      ? 'bg-[#FF2E93] text-white shadow-md'
                      : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60 border border-white/10'
                  }`}
                >
                  <Heart size={12} fill={isFollowed ? 'currentColor' : 'none'} />
                </button>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-1">
                      <h3 className="text-white font-extrabold text-xs sm:text-sm group-hover:text-pink-300 transition-colors truncate flex items-center gap-1">
                        <span>{host.name}</span>
                        {isSuperAdmin && <ShieldCheck size={12} className="text-amber-400 shrink-0" />}
                      </h3>
                      <p className="text-[10px] text-pink-300 font-mono truncate">
                        ID: {host.displayId} • {host.region}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onStart1v1Call(host);
                      }}
                      className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white font-black text-[10px] shadow-md hover:scale-105 transition-transform flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Video size={10} />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>
      )}

      {/* PRE-LIVE SETUP MODAL */}
      <AnimatePresence>
        {showPreLiveModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#14162B] border border-pink-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Radio size={16} className="text-pink-500" /> Live Stream Setup
                </h4>
                <button onClick={() => setShowPreLiveModal(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-xs font-bold block text-white">Private Host Stream</span>
                    <span className="text-[10px] text-gray-400">Viewers must request access to watch</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivateStream(!isPrivateStream)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      isPrivateStream ? 'bg-pink-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isPrivateStream ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleConfirmStartBroadcast}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 via-[#FF2E93] to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-transform cursor-pointer"
                >
                  Launch Studio 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEWER REQUEST TO WATCH MODAL */}
      <AnimatePresence>
        {viewRequestHost && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#14162B] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4"
            >
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 rounded-full border-2 border-cyan-400 p-0.5 mx-auto mb-2 overflow-hidden">
                  <img src={viewRequestHost.avatar} alt={viewRequestHost.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="text-sm font-black text-white">{viewRequestHost.name}'s Private Live</h4>
                <p className="text-xs text-gray-300">
                  Request permission to watch this private session.
                </p>
              </div>

              {requestSentStatus ? (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-cyan-300">Request Sent to Host!</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewRequestHost(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWatchRequest}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs uppercase tracking-wider shadow-md hover:scale-102 transition-transform cursor-pointer"
                  >
                    Request to Watch
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REAL BROADCAST STUDIO MODAL (HOST VIEW) */}
      <AnimatePresence>
        {isBroadcasting && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg h-[90vh] bg-[#0d0f1f] border border-pink-500/40 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(255,46,147,0.3)]"
            >
              <div className="p-3 bg-black/60 border-b border-white/10 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-pink-500 overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">{user.name}</h4>
                    <span className="text-[9px] text-red-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> LIVE
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStopBroadcast}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
                  >
                    End Stream
                  </button>
                </div>
              </div>

              <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-gray-400 text-xs">
                    Camera Off
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-black/70 border-t border-white/10 flex items-center justify-around z-20">
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-full cursor-pointer ${isCameraActive ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}
                >
                  {isCameraActive ? <Camera size={18} /> : <VideoOff size={18} />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full cursor-pointer ${isMicActive ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}
                >
                  {isMicActive ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stream Viewer Modal */}
      <AnimatePresence>
        {activeStreamHost && (
          <LiveStreamModal
            host={activeStreamHost}
            user={user}
            isFollowed={followedHosts[activeStreamHost.id]}
            onToggleFollow={handleToggleFollow}
            onStart1v1Call={onStart1v1Call}
            onOpenGiftDrawer={onOpenGiftDrawer}
            onMinimizeToPiP={onMinimizeStreamToPiP}
            onClose={() => setActiveStreamHost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
