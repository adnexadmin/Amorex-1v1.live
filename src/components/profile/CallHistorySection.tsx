import React, { useState, useMemo } from 'react';
import { CallHistoryItem, StreamHost } from '../../types';
import { sound } from '../../utils/audio';
import {
  Video,
  PhoneCall,
  Clock,
  Coins,
  Star,
  Search,
  Trash2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CallHistorySectionProps {
  history: CallHistoryItem[];
  hosts?: StreamHost[];
  onReconnect: (call: CallHistoryItem) => void;
  onClearHistory?: () => void;
  onDeleteCall?: (callId: string) => void;
  onBack?: () => void;
  isSubView?: boolean;
}

export const CallHistorySection: React.FC<CallHistorySectionProps> = ({
  history,
  hosts = [],
  onReconnect,
  onClearHistory,
  onDeleteCall,
  onBack,
  isSubView = false
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'rated'>('all');
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  // Calculate high-level summary metrics
  const totalCalls = history.length;
  const totalSeconds = useMemo(() => {
    return history.reduce((acc, curr) => acc + (curr.durationSec || 0), 0);
  }, [history]);

  const totalCoinsSpent = useMemo(() => {
    return history.reduce((acc, curr) => acc + (curr.coinsCharged || 0), 0);
  }, [history]);

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const formatClockDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filter & search calls
  const filteredCalls = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        item.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.hostCountry && item.hostCountry.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'today') {
        return item.timestamp.toLowerCase().includes('today');
      }
      if (activeFilter === 'rated') {
        return (item.rating || 0) >= 4;
      }
      return true;
    });
  }, [history, searchQuery, activeFilter]);

  return (
    <div className="space-y-4">
      {/* Sub-view Header if navigating from profile */}
      {isSubView && (
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={() => {
              sound.playClick();
              onBack?.();
            }}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="text-pink-400" />
            <span>Back to Profile</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white flex items-center gap-1">
              <PhoneCall size={14} className="text-pink-400" />
              <span>1v1 Call History</span>
            </span>
            {history.length > 0 && onClearHistory && (
              <button
                onClick={() => {
                  sound.playClick();
                  if (confirmClear) {
                    onClearHistory();
                    setConfirmClear(false);
                  } else {
                    setConfirmClear(true);
                    setTimeout(() => setConfirmClear(false), 4000);
                  }
                }}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-bold ${
                  confirmClear
                    ? 'bg-rose-500/30 text-rose-300 border-rose-500 animate-pulse'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
                }`}
              >
                {confirmClear ? 'Confirm Clear All?' : 'Clear History'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-3 gap-2 p-3.5 rounded-3xl bg-gradient-to-br from-[#1F1435] via-[#14162B] to-[#0D1024] border border-pink-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
            <PhoneCall size={11} className="text-pink-400" />
            <span>Total Calls</span>
          </div>
          <span className="text-base sm:text-lg font-black text-white mt-0.5">
            {totalCalls}
          </span>
          <span className="text-[9px] text-pink-300/80">1v1 Video</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
            <Clock size={11} className="text-cyan-400" />
            <span>Talk Time</span>
          </div>
          <span className="text-base sm:text-lg font-black text-cyan-300 mt-0.5">
            {formatDuration(totalSeconds)}
          </span>
          <span className="text-[9px] text-cyan-300/70">HD Audio/Video</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
            <Coins size={11} className="text-amber-400" />
            <span>Coins Used</span>
          </div>
          <span className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
            {totalCoinsSpent.toLocaleString()}
          </span>
          <span className="text-[9px] text-amber-400/70">60🪙 / min</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search host by name or country..."
            className="w-full bg-[#14162B] border border-white/15 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-pink-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', label: `All (${history.length})` },
            { id: 'today', label: 'Today' },
            { id: 'rated', label: 'Top Rated ⭐' }
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveFilter(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
                    : 'bg-[#14162B] text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Call History List */}
      <div className="space-y-2.5">
        {filteredCalls.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-[#14162B]/60 border border-white/10 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,46,147,0.2)]">
              📹
            </div>
            <div>
              <h4 className="text-sm font-black text-white">No Call Records Found</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? `No previous calls found matching "${searchQuery}".`
                  : 'You have not completed any 1v1 video calls yet. Connect with a host from the Live tab!'}
              </p>
            </div>
          </div>
        ) : (
          filteredCalls.map((call) => {
            // Check if this host is live right now
            const hostData = hosts.find((h) => h.id === call.hostId);
            const isLive = hostData?.isLive ?? true;

            return (
              <motion.div
                key={call.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-[#171933] via-[#14162B] to-[#121427] border border-white/10 hover:border-pink-500/40 transition-all shadow-md group relative overflow-hidden"
              >
                {/* Subtle side glow */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-600 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center justify-between gap-3 pl-1.5">
                  {/* Left: Host Avatar & Call Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Host Avatar with Live Indicator */}
                    <div className="relative shrink-0">
                      <div className="w-13 h-13 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-md">
                        <img
                          referrerPolicy="no-referrer"
                          src={call.hostAvatar}
                          alt={call.hostName}
                          className="w-full h-full rounded-[14px] object-cover"
                        />
                      </div>
                      {isLive && (
                        <span
                          title="Host is Available & Online"
                          className="absolute -top-1 -right-1 flex h-3.5 w-3.5"
                        >
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-black" />
                        </span>
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-black/80 text-pink-300 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-pink-500/40">
                        Lv.{call.hostLevel || 24}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-black text-white truncate max-w-[130px] sm:max-w-[180px]">
                          {call.hostName}
                        </h4>
                        <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                        {call.hostCountry && (
                          <span className="text-[9px] bg-white/5 border border-white/10 text-gray-300 px-1.5 py-0.2 rounded-md font-medium truncate">
                            {call.hostCountry}
                          </span>
                        )}
                      </div>

                      {/* Duration & Timestamp Display */}
                      <div className="flex items-center gap-2 text-[11px] text-gray-300 font-medium">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                          <Clock size={10} className="text-emerald-400" />
                          <span>{formatClockDuration(call.durationSec)}</span>
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-[10px] text-gray-400 truncate">
                          {call.timestamp}
                        </span>
                      </div>

                      {/* Coins Spent & Tags */}
                      <div className="flex items-center gap-1.5 pt-0.5 text-[10px]">
                        <span className="text-amber-300 font-bold flex items-center gap-0.5">
                          <Coins size={10} className="text-amber-400" />
                          <span>{call.coinsCharged} Coins</span>
                        </span>
                        {call.rating && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-amber-300 font-semibold flex items-center gap-0.5">
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              <span>{call.rating}.0</span>
                            </span>
                          </>
                        )}
                        {call.videoFilterUsed && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-pink-300 text-[9px] bg-pink-500/15 px-1.5 py-0.2 rounded-full border border-pink-500/30">
                              {call.videoFilterUsed === 'heart-aura'
                                ? '💖 Heart Aura'
                                : call.videoFilterUsed === 'sparkle-glow'
                                ? '✨ Sparkle Glow'
                                : call.videoFilterUsed === 'vintage-love'
                                ? '🎞️ Vintage Love'
                                : call.videoFilterUsed}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Re-connect Button & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Delete Call Record Button */}
                    {onDeleteCall && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onDeleteCall(call.id);
                        }}
                        title="Delete from history"
                        className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    {/* Re-connect Button */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        onReconnect(call);
                      }}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF2E93] via-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black shadow-[0_0_15px_rgba(255,46,147,0.45)] hover:shadow-[0_0_20px_rgba(255,46,147,0.7)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <Video size={13} className="animate-pulse" />
                      <span>Re-connect</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
