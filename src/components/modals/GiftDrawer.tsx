import React, { useState } from 'react';
import { VirtualGift, UserProfile } from '../../types';
import { VIRTUAL_GIFTS } from '../../utils/storage';
import { sound } from '../../utils/audio';
import { X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface GiftDrawerProps {
  recipientName: string;
  user?: UserProfile;
  userCoins?: number;
  onSendGift: (gift: VirtualGift, count?: number) => void;
  onClose: () => void;
  onOpenRecharge: () => void;
}

export const GiftDrawer: React.FC<GiftDrawerProps> = ({
  recipientName,
  user,
  userCoins,
  onSendGift,
  onClose,
  onOpenRecharge
}) => {
  const [selectedGift, setSelectedGift] = useState<VirtualGift>(VIRTUAL_GIFTS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [activeAnimation, setActiveAnimation] = useState<{ gift: VirtualGift; combo: number } | null>(null);

  const categories = ['All', 'Romantic', 'Popular', 'Luxury', 'Special'];
  const comboOptions = [1, 17, 37, 77];

  const filteredGifts = activeCategory === 'All'
    ? VIRTUAL_GIFTS
    : VIRTUAL_GIFTS.filter((g) => g.category === activeCategory);

  const totalPrice = (selectedGift.price || selectedGift.coinCost || 0) * comboMultiplier;

  const handleSend = () => {
    const currentCoins = user?.coins ?? userCoins ?? 0;
    if (currentCoins < totalPrice) {
      sound.playClick();
      onOpenRecharge();
      return;
    }

    sound.playGiftBoom();
    setActiveAnimation({ gift: selectedGift, combo: comboMultiplier });

    // Multi-burst sounds for high combos
    if (comboMultiplier > 1) {
      setTimeout(() => sound.playCoinDrop(), 200);
      setTimeout(() => sound.playCoinDrop(), 400);
    }

    if (totalPrice >= 999 || comboMultiplier > 1) {
      confetti({
        particleCount: comboMultiplier > 1 ? 120 : 80,
        spread: 100,
        origin: { y: 0.6 }
      });
    }

    // Trigger onSendGift with count
    onSendGift(selectedGift, comboMultiplier);

    setTimeout(() => {
      setActiveAnimation(null);
    }, 2800);
  };

  return (
    <>
      {/* Full-Screen Gift Animation Overlay */}
      <AnimatePresence>
        {activeAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: [0.3, 1.2, 1] }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs"
          >
            <div className="relative flex flex-col items-center">
              {/* Pulsing Aura */}
              <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-pink-500/40 via-amber-400/40 to-cyan-400/40 blur-2xl animate-pulse" />

              <motion.div
                animate={{
                  rotate: [0, -10, 10, -5, 0],
                  y: [0, -20, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-8xl md:text-9xl filter drop-shadow-[0_0_30px_rgba(255,46,147,0.8)] z-10"
              >
                {activeAnimation.gift.icon}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-4 bg-[#14162B]/90 border border-[#FFD700] rounded-2xl px-6 py-2 shadow-[0_0_20px_#FFD700] text-center z-10"
              >
                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                  {activeAnimation.combo > 1 ? `🔥 ${activeAnimation.combo}x Lucky Combo Burst!` : 'Luxury Gift Sent!'}
                </p>
                <h2 className="text-lg font-black text-white">
                  {activeAnimation.gift.name} {activeAnimation.combo > 1 && <span className="text-[#FFD700]">x{activeAnimation.combo}</span>}
                </h2>
                <p className="text-xs text-pink-300">To: {recipientName}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Drawer Modal */}
      <div className="fixed inset-0 z-45 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full max-w-lg bg-[#14162B] border-t sm:border border-pink-500/30 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Send Virtual Gift</span>
                <Sparkles size={16} className="text-[#FFD700]" />
              </h3>
              <p className="text-xs text-gray-400">To: <span className="text-pink-400 font-semibold">{recipientName}</span></p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          {/* Category Pills & Lucky Combo Multipliers Row */}
          <div className="flex items-center justify-between gap-2 py-2 border-b border-white/5">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playClick();
                    setActiveCategory(cat);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-[#FF2E93] to-[#9D00FF] text-white shadow-[0_0_10px_#FF2E93]'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lucky Combo Multipliers: [x1, x17, x37, x77] */}
            <div className="flex items-center gap-1 shrink-0 bg-black/40 p-1 rounded-xl border border-amber-400/30">
              <span className="text-[10px] font-bold text-amber-300 px-1 hidden sm:inline">Combo:</span>
              {comboOptions.map((multiplier) => (
                <button
                  key={multiplier}
                  onClick={() => {
                    sound.playClick();
                    setComboMultiplier(multiplier);
                  }}
                  className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all ${
                    comboMultiplier === multiplier
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_0_8px_rgba(255,215,0,0.6)] scale-105'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  x{multiplier}
                </button>
              ))}
            </div>
          </div>

          {/* Gift Grid */}
          <div className="grid grid-cols-4 gap-2.5 py-2 overflow-y-auto max-h-60 pr-1">
            {filteredGifts.map((gift) => {
              const isSelected = selectedGift.id === gift.id;
              return (
                <button
                  key={gift.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedGift(gift);
                  }}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#FF2E93]/20 to-purple-900/40 border-[#FF2E93] shadow-[0_0_15px_rgba(255,46,147,0.4)] scale-105'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-md mb-1">{gift.icon}</span>
                  <span className="text-[11px] font-bold text-white truncate w-full text-center">
                    {gift.name}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="text-[10px]">🪙</span>
                    <span className="text-[10px] font-black text-amber-300">{gift.price}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Wallet Balance + Send Action */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Balance:</span>
              <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-amber-400/30">
                <span>🪙</span>
                <span className="text-xs font-black text-amber-300">
                  {(user?.coins ?? 0).toLocaleString()}
                </span>
              </div>
              {(user?.coins ?? 0) < totalPrice && (
                <button
                  onClick={onOpenRecharge}
                  className="text-xs font-bold text-[#00D2FF] hover:underline"
                >
                  Top Up
                </button>
              )}
            </div>

            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] hover:opacity-90 text-white font-black text-xs shadow-[0_0_15px_rgba(255,46,147,0.5)] transition-all cursor-pointer"
            >
              <Send size={13} />
              <span>
                Send {comboMultiplier > 1 ? `${comboMultiplier}x ` : ''}({(totalPrice ?? 0).toLocaleString()} Coins)
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};
