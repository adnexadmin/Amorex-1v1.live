import React, { useState } from 'react';
import { StreamHost, UserProfile, Gender, Region } from '../../types';
import { sound } from '../../utils/audio';
import {
  Radio,
  Sparkles,
  PhoneCall,
  ChevronDown,
  Globe,
  TrendingUp,
  Heart,
  Video,
  Languages,
  ArrowUpDown,
  Filter
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

  // Radar Match filters
  const [targetGender, setTargetGender] = useState<'all' | Gender>('female');
  const [targetRegion, setTargetRegion] = useState<'All' | Region>('All');
  const [targetLanguage, setTargetLanguage] = useState<string>('All');
  const [languageMode, setLanguageMode] = useState<'filter' | 'sortFirst'>('filter');
  const [levelBadgeFilter, setLevelBadgeFilter] = useState<'any' | 'similar'>('any');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'level' | 'language'>('popular');

  const [isRadarScanning, setIsRadarScanning] = useState<boolean>(false);
  const [radarMatchedHost, setRadarMatchedHost] = useState<StreamHost | null>(null);

  // Active Stream Viewer modal
  const [activeStreamHost, setActiveStreamHost] = useState<StreamHost | null>(null);
  const [followedHosts, setFollowedHosts] = useState<Record<string, boolean>>({});

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

  // Filter and Sort hosts
  let filteredHosts = hosts.filter((host) => {
    if (subTab === 'Popular' && !host.isPopular) return false;
    if (subTab === 'New' && !host.isNew) return false;
    if (subTab === 'Follow' && !followedHosts[host.id]) return false;
    if (targetRegion !== 'All' && host.region !== targetRegion) return false;
    if (targetGender !== 'all' && host.gender !== targetGender) return false;
    if (languageMode === 'filter' && targetLanguage !== 'All' && !hostSpeaksLanguage(host, targetLanguage)) {
      return false;
    }
    if (levelBadgeFilter === 'similar') {
      const userLevel = user?.level ?? 1;
      const levelDiff = Math.abs(host.level - userLevel);
      if (levelDiff > 20) return false;
    }
    return true;
  });

  // Sort logic
  filteredHosts = [...filteredHosts].sort((a, b) => {
    // If user chose Sort by Language, or is in sortFirst mode with a language chosen
    if ((sortBy === 'language' || languageMode === 'sortFirst') && targetLanguage !== 'All') {
      const aSpeaks = hostSpeaksLanguage(a, targetLanguage) ? 1 : 0;
      const bSpeaks = hostSpeaksLanguage(b, targetLanguage) ? 1 : 0;
      if (aSpeaks !== bSpeaks) return bSpeaks - aSpeaks;
    }
    if (sortBy === 'level') return b.level - a.level;
    if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return b.viewerCount - a.viewerCount;
  });

  // Trigger Radar 1v1 Matching
  const handleStartRadarScan = () => {
    sound.playClick();
    setIsRadarScanning(true);
    setRadarMatchedHost(null);

    setTimeout(() => {
      sound.playHeartLike();
      const eligible = hosts.filter(
        (h) =>
          (targetGender === 'all' || h.gender === targetGender) &&
          h.isLive &&
          (targetLanguage === 'All' || hostSpeaksLanguage(h, targetLanguage)) &&
          (levelBadgeFilter === 'any' || Math.abs(h.level - (user?.level ?? 1)) <= 25)
      );
      const chosen =
        eligible.length > 0
          ? eligible[Math.floor(Math.random() * eligible.length)]
          : hosts[0];

      setRadarMatchedHost(chosen);
      setIsRadarScanning(false);
    }, 2000);
  };

  const followedCount = Object.values(followedHosts).filter(Boolean).length;

  return (
    <div className="pb-24 max-w-6xl mx-auto px-2.5 sm:px-6 flex flex-col gap-3 sm:gap-4">
      {/* 1. Sub-Tabs Bar & Language Filter Controls Header */}
      <nav className="flex flex-col gap-2 px-1 sm:px-2 border-b border-white/10 bg-[#090A15]/85 backdrop-blur-md sticky top-12 sm:top-14 z-30 py-2 -mt-2">
        <div className="flex items-center justify-between gap-2">
          {/* Sub-tabs: Popular, New to Popular, Following */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
            <button
              onClick={() => {
                sound.playClick();
                setSubTab('Popular');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all uppercase shrink-0 cursor-pointer ${
                subTab === 'Popular'
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
              }}
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all uppercase shrink-0 cursor-pointer ${
                subTab === 'New'
                  ? 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-[0_0_10px_rgba(255,46,147,0.5)]'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              NEW TO POPULAR
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setSubTab('Follow');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all uppercase shrink-0 cursor-pointer ${
                subTab === 'Follow'
                  ? 'bg-gradient-to-r from-[#FF2E93] to-pink-600 text-white shadow-[0_0_10px_rgba(255,46,147,0.5)]'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              FOLLOWING ({followedCount})
            </button>
          </div>

          {/* Region, Language & Sort Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Selector Dropdown in Header */}
            <div
              id="live-header-language-toggle"
              className={`relative glass px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-all shrink-0 w-[120.2px] ${
                targetLanguage !== 'All'
                  ? 'border-pink-500/60 bg-pink-500/15 shadow-[0_0_10px_rgba(255,46,147,0.3)]'
                  : 'border-white/10 hover:bg-white/10'
              }`}
              title="Filter or Sort by Communication Language"
            >
              <Languages size={12} className={targetLanguage !== 'All' ? 'text-pink-400' : 'text-[#FF2E93]'} />
              <select
                value={targetLanguage}
                onChange={(e) => {
                  sound.playClick();
                  setTargetLanguage(e.target.value);
                }}
                className={`bg-transparent text-[11px] font-bold uppercase focus:outline-none cursor-pointer pr-3 appearance-none w-[117.6px] pt-[1px] -mr-[3px] -mb-[1px] -mt-[3px] -ml-[8px] ${
                  targetLanguage !== 'All' ? 'text-pink-300' : 'text-gray-200'
                }`}
              >
                {COMM_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-[#090A15] text-white">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={10} className="text-white/60 absolute right-1 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="hidden md:flex items-center gap-1 glass px-2.5 py-1 rounded-full text-xs text-white/80 border-white/10">
              <TrendingUp size={11} className="text-[#FFD700]" />
              <select
                value={sortBy}
                onChange={(e) => {
                  sound.playClick();
                  setSortBy(e.target.value as typeof sortBy);
                }}
                className="bg-transparent text-[11px] font-bold text-gray-200 uppercase focus:outline-none cursor-pointer pr-1 appearance-none"
              >
                <option value="popular" className="bg-[#090A15] text-white">Most Popular</option>
                <option value="language" className="bg-[#090A15] text-pink-300">Preferred Language First</option>
                <option value="newest" className="bg-[#090A15] text-white">New to Popular</option>
                <option value="level" className="bg-[#090A15] text-white">Highest Level</option>
              </select>
            </div>

            {/* Region Selector Pill */}
            <div className="relative glass px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer border-white/10 hover:bg-white/10 transition-colors shrink-0">
              <Globe size={11} className="text-[#00D2FF]" />
              <select
                value={targetRegion}
                onChange={(e) => {
                  sound.playClick();
                  setTargetRegion(e.target.value as typeof targetRegion);
                }}
                className="bg-transparent text-[11px] font-bold text-[#00D2FF] uppercase focus:outline-none cursor-pointer pr-3 appearance-none"
              >
                <option value="All" className="bg-[#090A15] text-white">ALL REGIONS</option>
                <option value="India" className="bg-[#090A15] text-white">INDIA</option>
                <option value="Middle East" className="bg-[#090A15] text-white">DUBAI / ME</option>
                <option value="Bangladesh" className="bg-[#090A15] text-white">BANGLADESH</option>
                <option value="Pakistan" className="bg-[#090A15] text-white">PAKISTAN</option>
                <option value="Southeast Asia" className="bg-[#090A15] text-white">SE ASIA</option>
              </select>
              <ChevronDown size={10} className="text-white/60 absolute right-1 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Language Filter Chips Carousel + Mode Toggle */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Scrollable Language Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {COMM_LANGUAGES.map((lang) => {
              const isSelected = targetLanguage === lang.id;
              const hostCount = hosts.filter((h) => hostSpeaksLanguage(h, lang.id)).length;

              return (
                <button
                  key={lang.id}
                  id={`lang-chip-${lang.id.toLowerCase()}`}
                  onClick={() => {
                    sound.playClick();
                    setTargetLanguage(lang.id);
                  }}
                  className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] font-bold tracking-tight transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white shadow-[0_0_12px_rgba(255,46,147,0.4)] border border-pink-400/50 scale-102'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {hostCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mode Toggle (Filter Only vs Sort First) */}
          {targetLanguage !== 'All' && (
            <div className="flex items-center gap-1 shrink-0 bg-white/5 p-0.5 rounded-full border border-white/10 text-[10px]">
              <button
                onClick={() => {
                  sound.playClick();
                  setLanguageMode('filter');
                }}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                  languageMode === 'filter'
                    ? 'bg-pink-500/80 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Only show hosts who speak this language"
              >
                <Filter size={10} />
                <span>Filter</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setLanguageMode('sortFirst');
                }}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                  languageMode === 'sortFirst'
                    ? 'bg-cyan-500/80 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Show all hosts, but sort preferred language first"
              >
                <ArrowUpDown size={10} />
                <span>Sort First</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Active Language Filter Banner (when specific language active) */}
      {targetLanguage !== 'All' && (
        <div className="glass px-3 py-2 rounded-xl flex items-center justify-between border border-pink-500/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">
              {COMM_LANGUAGES.find((l) => l.id === targetLanguage)?.flag}
            </span>
            <span className="text-gray-200">
              Showing {filteredHosts.length} hosts for{' '}
              <strong className="text-pink-300 font-bold">{targetLanguage}</strong>
              {languageMode === 'sortFirst' && ' (sorted to top of list)'}
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setTargetLanguage('All');
            }}
            className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* 2. Compact 1v1 Romantic Matching Radar Banner */}
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
                AI Match
              </span>
            </div>
            <div className="text-white/60 text-[11px] font-medium mt-0.5">
              Connect in 60s • {(user?.vouchers ?? 0) > 0 ? `${user?.vouchers} Free Vouchers Active` : 'Instant Video Call'}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5 md:mt-0 w-full md:w-auto justify-end">
          {/* Language filter for radar */}
          <select
            value={targetLanguage}
            onChange={(e) => {
              sound.playClick();
              setTargetLanguage(e.target.value);
            }}
            className="glass px-2.5 py-1.5 rounded-xl text-[11px] text-pink-300 focus:outline-none cursor-pointer border-pink-500/30 font-bold"
          >
            {COMM_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-[#090A15] text-white">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>

          {/* Gender */}
          <select
            value={targetGender}
            onChange={(e) => setTargetGender(e.target.value as typeof targetGender)}
            className="glass px-2.5 py-1.5 rounded-xl text-[11px] text-white/90 focus:outline-none cursor-pointer border-white/10 font-bold"
          >
            <option value="female" className="bg-[#090A15]">👩 Female</option>
            <option value="male" className="bg-[#090A15]">👨 Male</option>
            <option value="all" className="bg-[#090A15]">✨ Any Gender</option>
          </select>

          {/* Similar Level Badges Filter */}
          <select
            value={levelBadgeFilter}
            onChange={(e) => setLevelBadgeFilter(e.target.value as typeof levelBadgeFilter)}
            className="glass px-2.5 py-1.5 rounded-xl text-[11px] text-amber-300 focus:outline-none cursor-pointer border-amber-400/30 font-bold"
          >
            <option value="any" className="bg-[#090A15]">👑 All Levels</option>
            <option value="similar" className="bg-[#090A15]">🎯 Similar Level (Lv.{user.level || 2} ± 20)</option>
          </select>

          <button
            id="start-radar-match-btn"
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

        {/* Radar Match Drop Notification */}
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
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs sm:text-sm">{radarMatchedHost.name}</span>
                    <span className="text-[9px] font-bold text-[#FFD700] bg-black/50 px-1.5 py-0.2 rounded">
                      Lv.{radarMatchedHost.level}
                    </span>
                    {radarMatchedHost.primaryLanguage && (
                      <span className="text-[9px] font-bold text-pink-300 bg-pink-500/20 px-1.5 py-0.2 rounded">
                        🗣️ {radarMatchedHost.primaryLanguage}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/60">Match in {radarMatchedHost.region}! 💘</span>
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

      {/* 3. Streamer Cards Grid */}
      {filteredHosts.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center flex flex-col items-center justify-center my-6 border border-white/10">
          <div className="w-16 h-16 rounded-full bg-pink-500/15 flex items-center justify-center text-3xl mb-3">
            🗣️
          </div>
          <h3 className="text-white font-bold text-base mb-1">No Hosts Found</h3>
          <p className="text-gray-400 text-xs max-w-sm mb-4">
            No live hosts currently speaking <strong>{targetLanguage}</strong> in {subTab} tab. Try switching language or region.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              setTargetLanguage('All');
              setTargetRegion('All');
            }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Show All Languages
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 px-0.5 sm:px-0">
          {filteredHosts.map((host, idx) => {
            const isPinkNeon = idx % 2 === 0;
            const isFollowed = followedHosts[host.id];
            const isLanguageMatch = targetLanguage !== 'All' && hostSpeaksLanguage(host, targetLanguage);
            const hostLanguages = host.languages && host.languages.length > 0 ? host.languages : [host.primaryLanguage || 'English'];

            return (
              <motion.div
                key={host.id}
                whileHover={{ y: -3 }}
                onClick={() => {
                  sound.playClick();
                  setActiveStreamHost(host);
                }}
                className={`relative rounded-2xl sm:rounded-3xl overflow-hidden glass h-56 sm:h-72 group transition-all cursor-pointer ${
                  isLanguageMatch
                    ? 'border-pink-500/60 shadow-[0_0_15px_rgba(255,46,147,0.3)] ring-1 ring-pink-500/40'
                    : isPinkNeon
                    ? 'border-pink-500/30 hover:border-pink-500/70'
                    : 'border-white/10 hover:border-[#00D2FF]/50'
                }`}
              >
                {/* Host Cover Image */}
                <img
                  referrerPolicy="no-referrer"
                  src={host.coverImage}
                  alt={host.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A15] via-black/30 to-transparent opacity-90" />

                {/* Top Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  <div className="flex items-center gap-1">
                    <div className="bg-[#FF2E93] text-white text-[9px] px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-1 shadow-sm">
                      <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                      <span>LIVE</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-xs text-white/90 text-[9px] px-1.5 py-0.5 rounded-md font-semibold">
                      {(host.viewerCount ?? 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Highlighted Match Badge */}
                  {isLanguageMatch && (
                    <div className="bg-gradient-to-r from-pink-600/90 to-purple-600/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-xs">
                      <span>✨ {targetLanguage}</span>
                    </div>
                  )}
                </div>

                {/* Top Right Follow Button */}
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

                {/* Bottom Card Content */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1">
                        <h3 className="text-white font-extrabold text-xs sm:text-sm group-hover:text-pink-300 transition-colors truncate">
                          {host.name}
                        </h3>
                        <span className="text-[8px] font-bold text-[#FFD700] bg-black/60 px-1 py-0.2 rounded border border-[#FFD700]/30 shrink-0">
                          Lv.{host.level}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/70 truncate">{host.region} • {host.age}y</p>
                    </div>

                    {/* 1v1 Call Direct Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onStart1v1Call(host);
                      }}
                      className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white font-black text-[10px] shadow-md hover:scale-105 transition-transform flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Direct Video Call"
                    >
                      <Video size={10} />
                      <span>Call</span>
                    </button>
                  </div>

                  {/* Host Languages Badge Row */}
                  <div className="flex items-center gap-1 text-[9px] text-[#00D2FF] font-semibold truncate bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-white/10">
                    <Languages size={9} className="shrink-0 text-pink-400" />
                    <span className="truncate">
                      {hostLanguages.join(' • ')}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {host.tags.slice(0, 2).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[8px] text-white/70 bg-white/15 px-1.5 py-0.2 rounded-full truncate max-w-[80px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>
      )}

      {/* ACTIVE LIVE STREAM VIEWER MODAL */}
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
