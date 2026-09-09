import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface CoinRainCelebrationProps {
  onCollect: (amount: number) => void;
  onClose: () => void;
}

interface FallingCoin {
  id: number;
  x: number;
  speed: number;
  size: number;
  collected: boolean;
  value: number;
}

export const CoinRainCelebration: React.FC<CoinRainCelebrationProps> = ({ onCollect, onClose }) => {
  const [coins, setCoins] = useState<FallingCoin[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);

  useEffect(() => {
    sound.playJackpotFanfare();
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.2 },
      colors: ['#FFD700', '#FF2E93', '#00D2FF']
    });

    const generated: FallingCoin[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 85 + 5,
      speed: 3 + Math.random() * 4,
      size: 28 + Math.random() * 20,
      collected: false,
      value: Math.floor(50 + Math.random() * 200)
    }));
    setCoins(generated);

    const timer = setTimeout(() => {
      onClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleCatchCoin = (id: number, val: number) => {
    sound.playCoinDrop();
    setCoins((prev) => prev.map((c) => (c.id === id ? { ...c, collected: true } : c)));
    setTotalCollected((prev) => prev + val);
    onCollect(val);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start overflow-hidden">
      {/* Top Banner Alert */}
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 20, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        className="pointer-events-auto bg-[#14162B]/95 border-2 border-[#FFD700] rounded-2xl px-6 py-3 shadow-[0_0_30px_rgba(255,215,0,0.6)] backdrop-blur-xl flex items-center gap-4 text-center"
      >
        <div className="text-3xl animate-bounce">👑💰</div>
        <div>
          <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest">
            Global Super-Admin Coin Rain!
          </h3>
          <p className="text-xs text-white/90 font-medium">
            Tap falling coins to collect! Caught:{' '}
            <span className="font-extrabold text-[#FFD700]">+{totalCollected} Coins</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg"
        >
          Close
        </button>
      </motion.div>

      {/* Falling Coins */}
      <AnimatePresence>
        {coins.map((coin) => {
          if (coin.collected) return null;
          return (
            <motion.div
              key={coin.id}
              initial={{ y: -50, x: `${coin.x}vw`, rotate: 0 }}
              animate={{
                y: '105vh',
                rotate: 720
              }}
              transition={{
                duration: coin.speed,
                ease: 'linear',
                repeat: Infinity
              }}
              onClick={() => handleCatchCoin(coin.id, coin.value)}
              className="absolute pointer-events-auto cursor-pointer select-none hover:scale-125 transition-transform"
              style={{
                left: `${coin.x}vw`,
                width: `${coin.size}px`,
                height: `${coin.size}px`
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#FFD700] via-[#FFE066] to-[#FF9E00] flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_#FFD700] border-2 border-white/60">
                🪙
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
