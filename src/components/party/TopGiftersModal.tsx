import React from 'react';
import { Trophy, Crown, X, Sparkles, Gift, Coins, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/audio';

export interface GifterLeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  level: number;
  coinsContributed: number;
}

interface TopGiftersModalProps {
  isOpen: boolean;
  onClose: () => void;
  gifters: GifterLeaderboardEntry[];
  roomTitle: string;
  hostName: string;
  onOpenGiftDrawer: (recipientName: string) => void;
}

export const TopGiftersModal: React.FC<TopGiftersModalProps> = ({
  isOpen,
  onClose,
  gifters,
  roomTitle,
  hostName,
  onOpenGiftDrawer
}) => {
  if (!isOpen) return null;

  const sortedGifters = [...gifters].sort((a, b) => b.coinsContributed - a.coinsContributed);
  const totalPot = sortedGifters.reduce((acc, g) => acc + g.coinsContributed, 0);

  const top3 = sortedGifters.slice(0, 3);
  const rest = sortedGifters.slice(3);

  // Reorder top 3 for podium display: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-[#14162B] border-2 border-amber-400/40 rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.25)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="relative px-6 py-4 bg-gradient-to-r from-amber-950/80 via-[#14162B] to-purple-950/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,215,0,0.6)]">
                <Trophy size={22} className="fill-black" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <span>Top Gifters Leaderboard</span>
                  <Sparkles size={16} className="text-[#FFD700]" />
                </h3>
                <p className="text-xs text-amber-300/90 font-medium">
                  Room Pot: <span className="font-mono font-bold text-white">🪙 {totalPot.toLocaleString()} Coins</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-6">
            {/* Top 3 Podium Display */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-3 sm:gap-4 pt-4 pb-2">
                {podiumOrder.map((gifter) => {
                  if (!gifter) return null;
                  const rank = sortedGifters.findIndex((g) => g.userId === gifter.userId) + 1;
                  const isFirst = rank === 1;
                  const isSecond = rank === 2;

                  return (
                    <motion.div
                      key={gifter.userId}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: rank * 0.1 }}
                      className={`flex flex-col items-center relative ${
                        isFirst ? '-translate-y-4 sm:-translate-y-6' : ''
                      }`}
                    >
                      {/* Crown or Medal Badge */}
                      <div className="absolute -top-5 z-20">
                        {isFirst ? (
                          <div className="text-2xl filter drop-shadow-[0_0_10px_#FFD700] animate-bounce">
                            👑
                          </div>
                        ) : isSecond ? (
                          <div className="w-6 h-6 rounded-full bg-slate-300 text-black font-black text-xs flex items-center justify-center shadow-md border border-white">
                            2
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md border border-amber-500">
                            3
                          </div>
                        )}
                      </div>

                      {/* Avatar with Glow Ring */}
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] relative ${
                          isFirst
                            ? 'bg-gradient-to-tr from-[#FFD700] via-amber-400 to-yellow-200 shadow-[0_0_25px_rgba(255,215,0,0.6)]'
                            : isSecond
                            ? 'bg-gradient-to-tr from-slate-300 to-slate-500 shadow-[0_0_15px_rgba(203,213,225,0.4)]'
                            : 'bg-gradient-to-tr from-amber-600 to-amber-800 shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                        }`}
                      >
                        <img
                          referrerPolicy="no-referrer"
                          src={gifter.avatar}
                          alt={gifter.name}
                          className="w-full h-full rounded-full object-cover border-2 border-[#14162B]"
                        />
                      </div>

                      {/* Name & Coin Contribution */}
                      <div className="mt-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs sm:text-sm font-black text-white truncate max-w-[90px]">
                            {gifter.name}
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-400/30 inline-block mt-1">
                          🪙 {gifter.coinsContributed.toLocaleString()}
                        </span>
                      </div>

                      {/* Pedestal Base */}
                      <div
                        className={`w-20 sm:w-24 mt-2 rounded-t-xl bg-gradient-to-t flex items-center justify-center text-xs font-black shadow-lg ${
                          isFirst
                            ? 'h-16 from-amber-500/30 to-amber-500/10 border-t-2 border-amber-400 text-amber-300'
                            : isSecond
                            ? 'h-12 from-slate-500/30 to-slate-500/10 border-t-2 border-slate-300 text-slate-300'
                            : 'h-10 from-amber-800/30 to-amber-800/10 border-t-2 border-amber-600 text-amber-400'
                        }`}
                      >
                        #{rank} Place
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Remaining Ranking List (4th onwards) */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Other Top Contributors
              </h4>
              {rest.map((gifter, index) => {
                const rank = index + 4;
                return (
                  <div
                    key={gifter.userId}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-mono font-bold text-xs text-gray-400">
                        #{rank}
                      </span>
                      <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-[#00D2FF]">
                        <img
                          referrerPolicy="no-referrer"
                          src={gifter.avatar}
                          alt={gifter.name}
                          className="w-full h-full rounded-full object-cover border border-[#14162B]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{gifter.name}</span>
                          <span className="text-[8px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                            Lv.{gifter.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-300 font-mono font-semibold flex items-center gap-1 mt-0.5">
                          <Coins size={11} />
                          <span>{gifter.coinsContributed.toLocaleString()} Coins</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onClose();
                        onOpenGiftDrawer(gifter.name);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-[#FF2E93] text-white text-xs font-bold flex items-center gap-1 shadow-md hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Gift size={12} />
                      <span>Gift</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Award size={14} className="text-amber-400" />
              <span>Gifts sent in room update rankings instantly.</span>
            </p>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenGiftDrawer(hostName);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-black font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.4)] cursor-pointer hover:scale-105 transition-transform"
            >
              <Gift size={14} />
              <span>Send Room Gift</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
