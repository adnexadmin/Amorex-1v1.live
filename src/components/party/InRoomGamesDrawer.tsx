import React, { useState, useEffect } from 'react';
import { UserProfile, RacingCar } from '../../types';
import { sound } from '../../utils/audio';
import {
  X,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  Zap,
  Play,
  Gift,
  Coins,
  ChevronRight,
  ShieldAlert,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface InRoomGamesDrawerProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onDeductCoins: (amount: number) => boolean;
  onAddCoins: (amount: number) => void;
  onOpenRecharge: () => void;
}

export const InRoomGamesDrawer: React.FC<InRoomGamesDrawerProps> = ({
  user,
  isOpen,
  onClose,
  onDeductCoins,
  onAddCoins,
  onOpenRecharge
}) => {
  const [activeGame, setActiveGame] = useState<'racing' | 'slots' | 'reels' | 'feast' | 'sphinx'>('racing');

  // ================= 1. CHAMP CAR RACING (30s Cycle: 20s bet, 7s race, 3s payout) =================
  const [racePhase, setRacePhase] = useState<'betting' | 'racing' | 'payout'>('betting');
  const [raceCountdown, setRaceCountdown] = useState<number>(20);
  const [selectedCar, setSelectedCar] = useState<number>(1);
  const [carBetAmount, setCarBetAmount] = useState<number>(100);
  const [activeBets, setActiveBets] = useState<Record<number, number>>({});
  const [winnerCar, setWinnerCar] = useState<RacingCar | null>(null);
  const [carProgress, setCarProgress] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });

  const cars: RacingCar[] = [
    { id: 1, name: '⚡ Cyber Pink Turbo', color: 'from-[#FF2E93] to-purple-600', odds: 2.5, currentProgress: carProgress[1] || 0, speed: 1.2 },
    { id: 2, name: '🏎️ Neon Gold Beast', color: 'from-[#FFD700] to-amber-600', odds: 3.2, currentProgress: carProgress[2] || 0, speed: 1.1 },
    { id: 3, name: '🚀 Cyan Stealth Phantom', color: 'from-[#00D2FF] to-blue-600', odds: 4.0, currentProgress: carProgress[3] || 0, speed: 1.4 },
    { id: 4, name: '🔥 Midnight Obsidian', color: 'from-purple-600 to-indigo-800', odds: 5.5, currentProgress: carProgress[4] || 0, speed: 1.0 }
  ];

  // Racing timer loop
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setRaceCountdown((prev) => {
        if (prev > 1) return prev - 1;

        if (racePhase === 'betting') {
          setRacePhase('racing');
          sound.playCarRev();
          const pickWinner = Math.floor(Math.random() * 4) + 1;
          const chosen = cars.find((c) => c.id === pickWinner) || cars[0];
          setWinnerCar(chosen);

          // Animate progress during race
          const raceAnim = setInterval(() => {
            setCarProgress((curr) => {
              const updated = { ...curr };
              let maxP = 0;
              [1, 2, 3, 4].forEach((id) => {
                const boost = id === pickWinner ? Math.random() * 22 + 15 : Math.random() * 16 + 8;
                updated[id] = Math.min(100, (curr[id] || 0) + boost);
                if (updated[id] > maxP) maxP = updated[id];
              });
              if (maxP >= 100) clearInterval(raceAnim);
              return updated;
            });
          }, 800);

          return 7;
        } else if (racePhase === 'racing') {
          setRacePhase('payout');
          if (winnerCar && activeBets[winnerCar.id]) {
            const bet = activeBets[winnerCar.id];
            const winCoins = Math.floor(bet * winnerCar.odds);
            sound.playJackpotFanfare();
            onAddCoins(winCoins);
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          }
          return 3;
        } else {
          setRacePhase('betting');
          setActiveBets({});
          setCarProgress({ 1: 0, 2: 0, 3: 0, 4: 0 });
          setWinnerCar(null);
          return 20;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, racePhase, winnerCar, activeBets, onAddCoins]);

  const handlePlaceCarBet = (carId: number) => {
    if (racePhase !== 'betting') return;
    if (!onDeductCoins(carBetAmount)) {
      onOpenRecharge();
      return;
    }
    sound.playCoinDrop();
    setActiveBets((prev) => ({
      ...prev,
      [carId]: (prev[carId] || 0) + carBetAmount
    }));
  };

  // ================= 2. 777 MEGA JACKPOT SLOT =================
  const [slotReels, setSlotReels] = useState<string[]>(['💎', '7️⃣', '💎']);
  const [isSlotSpinning, setIsSlotSpinning] = useState<boolean>(false);
  const [slotBet, setSlotBet] = useState<number>(50);
  const [slotWinMessage, setSlotWinMessage] = useState<string>('');

  const handleSpin777 = () => {
    if (isSlotSpinning) return;
    if (!onDeductCoins(slotBet)) {
      onOpenRecharge();
      return;
    }
    setIsSlotSpinning(true);
    setSlotWinMessage('');
    sound.playSlotTick();

    const symbols = ['🍒', '🍋', '🍇', '💎', '🔔', '7️⃣'];
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      sound.playSlotTick();
      setSlotReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);

      if (ticks > 12) {
        clearInterval(interval);
        setIsSlotSpinning(false);
        const finalSymbols = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];
        // Lucky booster 25% chance of 3x or 2x match
        if (Math.random() < 0.25) {
          const matchSym = Math.random() < 0.4 ? '7️⃣' : symbols[Math.floor(Math.random() * symbols.length)];
          finalSymbols[0] = matchSym;
          finalSymbols[1] = matchSym;
          finalSymbols[2] = matchSym;
        }
        setSlotReels(finalSymbols);

        if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
          const mult = finalSymbols[0] === '7️⃣' ? 50 : finalSymbols[0] === '💎' ? 25 : 10;
          const win = slotBet * mult;
          sound.playJackpotFanfare();
          onAddCoins(win);
          setSlotWinMessage(`🎉 JACKPOT WIN! +${win.toLocaleString()} Coins (${mult}x Multiplier)`);
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        } else if (finalSymbols[0] === finalSymbols[1] || finalSymbols[1] === finalSymbols[2]) {
          const win = slotBet * 2;
          sound.playCoinDrop();
          onAddCoins(win);
          setSlotWinMessage(`✨ Nice Match! +${win.toLocaleString()} Coins (2x)`);
        } else {
          setSlotWinMessage('Try again for the 777 Mega Jackpot!');
        }
      }
    }, 100);
  };

  // ================= 3. LUCKY REELS FRUIT COMBO =================
  const [fruitReels, setFruitReels] = useState<string[]>(['🍒', '🍋', '🍇', '💎']);
  const [isFruitSpinning, setIsFruitSpinning] = useState<boolean>(false);
  const [fruitBet, setFruitBet] = useState<number>(100);
  const [fruitWinMsg, setFruitWinMsg] = useState<string>('');

  const handleSpinFruitReels = () => {
    if (isFruitSpinning) return;
    if (!onDeductCoins(fruitBet)) {
      onOpenRecharge();
      return;
    }
    setIsFruitSpinning(true);
    setFruitWinMsg('');
    sound.playSlotTick();

    const fruits = ['🍒', '🍋', '🍇', '🍉', '🍓', '💎', '7️⃣'];
    let count = 0;
    const interval = setInterval(() => {
      count++;
      sound.playSlotTick();
      setFruitReels([
        fruits[Math.floor(Math.random() * fruits.length)],
        fruits[Math.floor(Math.random() * fruits.length)],
        fruits[Math.floor(Math.random() * fruits.length)],
        fruits[Math.floor(Math.random() * fruits.length)]
      ]);

      if (count > 14) {
        clearInterval(interval);
        setIsFruitSpinning(false);
        const finalFruit = [
          fruits[Math.floor(Math.random() * fruits.length)],
          fruits[Math.floor(Math.random() * fruits.length)],
          fruits[Math.floor(Math.random() * fruits.length)],
          fruits[Math.floor(Math.random() * fruits.length)]
        ];
        if (Math.random() < 0.3) {
          finalFruit[0] = '🍓';
          finalFruit[1] = '🍓';
          finalFruit[2] = '🍓';
        }
        setFruitReels(finalFruit);

        const counts: Record<string, number> = {};
        finalFruit.forEach((f) => { counts[f] = (counts[f] || 0) + 1; });
        const maxFreq = Math.max(...Object.values(counts));

        if (maxFreq >= 4) {
          const win = fruitBet * 30;
          sound.playJackpotFanfare();
          onAddCoins(win);
          setFruitWinMsg(`🍓 4X FRUIT COMBO! +${win.toLocaleString()} Coins!`);
          confetti({ particleCount: 100, spread: 80 });
        } else if (maxFreq === 3) {
          const win = fruitBet * 5;
          sound.playCoinDrop();
          onAddCoins(win);
          setFruitWinMsg(`🍇 3X COMBO! +${win.toLocaleString()} Coins!`);
        } else if (maxFreq === 2) {
          const win = fruitBet * 1.5;
          sound.playCoinDrop();
          onAddCoins(win);
          setFruitWinMsg(`🍋 2X PAIR! +${win.toLocaleString()} Coins!`);
        } else {
          setFruitWinMsg('Spin again to land 3x or 4x Combos!');
        }
      }
    }, 90);
  };

  // ================= 4. GREEDY FEAST MULTIPLIER CHALLENGE =================
  const [feastBet, setFeastBet] = useState<number>(100);
  const [feastSelectedDish, setFeastSelectedDish] = useState<number>(1);
  const [isFeastSpinning, setIsFeastSpinning] = useState<boolean>(false);
  const [feastResult, setFeastResult] = useState<string>('');

  const feastDishes = [
    { id: 1, name: 'Roast Turkey', icon: '🍗', mult: 2, prob: '50%' },
    { id: 2, name: 'Prime Rib', icon: '🥩', mult: 5, prob: '25%' },
    { id: 3, name: 'Royal Cake', icon: '🍰', mult: 10, prob: '15%' },
    { id: 4, name: 'King Lobster', icon: '🦞', mult: 25, prob: '10%' }
  ];

  const handlePlayGreedyFeast = () => {
    if (isFeastSpinning) return;
    if (!onDeductCoins(feastBet)) {
      onOpenRecharge();
      return;
    }
    setIsFeastSpinning(true);
    setFeastResult('');
    sound.playSlotTick();

    setTimeout(() => {
      setIsFeastSpinning(false);
      const chosen = feastDishes.find((d) => d.id === feastSelectedDish) || feastDishes[0];
      const winRoll = Math.random();
      const threshold = chosen.mult === 2 ? 0.55 : chosen.mult === 5 ? 0.3 : chosen.mult === 10 ? 0.18 : 0.08;

      if (winRoll < threshold) {
        const win = Math.floor(feastBet * chosen.mult);
        sound.playJackpotFanfare();
        onAddCoins(win);
        setFeastResult(`👑 Feast Served! Won ${win.toLocaleString()} Coins (${chosen.mult}x)!`);
        confetti({ particleCount: 80, spread: 70 });
      } else {
        sound.playClick();
        setFeastResult(`The Chef ate the ${chosen.name}! Try another feast dish.`);
      }
    }, 1500);
  };

  // ================= 5. SPHINX LEGEND PYRAMID VAULT =================
  const [sphinxBet, setSphinxBet] = useState<number>(100);
  const [isOpeningSphinx, setIsOpeningSphinx] = useState<boolean>(false);
  const [sphinxReward, setSphinxReward] = useState<string>('');

  const sphinxVaults = [
    { id: 1, name: 'Golden Scarab', icon: '🪲', mult: 3 },
    { id: 2, name: 'Eye of Horus', icon: '👁️', mult: 8 },
    { id: 3, name: 'Pharaoh Mask', icon: '👑', mult: 20 },
    { id: 4, name: 'Anubis Secret Vault', icon: '⚱️', mult: 50 }
  ];

  const handleOpenSphinxVault = (vaultId: number) => {
    if (isOpeningSphinx) return;
    if (!onDeductCoins(sphinxBet)) {
      onOpenRecharge();
      return;
    }
    setIsOpeningSphinx(true);
    setSphinxReward('');
    sound.playSlotTick();

    setTimeout(() => {
      setIsOpeningSphinx(false);
      const vault = sphinxVaults.find((v) => v.id === vaultId) || sphinxVaults[0];
      const isWin = Math.random() < 0.45;
      if (isWin) {
        const mult = vault.mult;
        const win = sphinxBet * mult;
        sound.playJackpotFanfare();
        onAddCoins(win);
        setSphinxReward(`🏺 ${vault.name} Unlocked! +${win.toLocaleString()} Coins (${mult}x)!`);
        confetti({ particleCount: 100, spread: 80 });
      } else {
        sound.playClick();
        setSphinxReward('Pyramid curse! Try opening another mystic vault.');
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-xl bg-[#0F1123] border-t sm:border border-amber-400/40 rounded-t-3xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col max-h-[90vh] text-white overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5">
                <span>Party Mini-Games Hub</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/40">
                  Live Multiplayer
                </span>
              </h3>
              <p className="text-[10px] text-gray-400">Play with party guests while staying connected on mic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Game Navigation Tabs */}
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar border-b border-white/5">
          {[
            { id: 'racing', name: 'Champ Car', icon: '🏎️' },
            { id: 'slots', name: '777 Jackpot', icon: '🎰' },
            { id: 'reels', name: 'Lucky Reels', icon: '🍒' },
            { id: 'feast', name: 'Greedy Feast', icon: '🍗' },
            { id: 'sphinx', name: 'Sphinx Legend', icon: '🏺' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveGame(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                activeGame === tab.id
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_0_12px_rgba(255,215,0,0.5)] scale-105'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Game Content Area */}
        <div className="py-2.5 overflow-y-auto max-h-[60vh] space-y-3">
          {/* ================= 1. CHAMP CAR RACING ================= */}
          {activeGame === 'racing' && (
            <div className="space-y-3">
              {/* Header Status & Countdown */}
              <div className="bg-black/50 p-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">🏁</span>
                  <div>
                    <h4 className="text-xs font-black text-amber-300 uppercase">Champ Car Racing (30s Cycle)</h4>
                    <p className="text-[10px] text-gray-400">
                      {racePhase === 'betting' && `Betting Phase (${raceCountdown}s)`}
                      {racePhase === 'racing' && `Live Race Track Sprint! (${raceCountdown}s)`}
                      {racePhase === 'payout' && `Winner: ${winnerCar?.name || 'Car 1'}`}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs text-gray-400 block">Timer</span>
                  <span className={`text-base font-black ${racePhase === 'betting' ? 'text-amber-400' : 'text-pink-400'}`}>
                    00:{raceCountdown.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Race Track Animation */}
              <div className="bg-black/70 p-3 rounded-2xl border border-pink-500/20 space-y-2">
                {cars.map((car) => {
                  const betOnCar = activeBets[car.id] || 0;
                  return (
                    <div key={car.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white flex items-center gap-1">
                          <span>{car.name}</span>
                          <span className="text-[9px] text-amber-300 font-mono">({car.odds}x)</span>
                        </span>
                        {betOnCar > 0 && (
                          <span className="text-[10px] text-emerald-300 font-bold">
                            Bet: 🪙{betOnCar.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Track Progress Bar */}
                      <div className="h-4 bg-white/10 rounded-full overflow-hidden relative">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${car.color}`}
                          animate={{ width: `${carProgress[car.id] || 0}%` }}
                          transition={{ ease: 'easeOut', duration: 0.4 }}
                        />
                        <span
                          className="absolute top-0 bottom-0 flex items-center text-xs transition-all"
                          style={{ left: `${Math.min(92, carProgress[car.id] || 0)}%` }}
                        >
                          🏎️
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bet Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">Select Bet Amount:</span>
                  <div className="flex items-center gap-1">
                    {[100, 500, 1000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          sound.playClick();
                          setCarBetAmount(amt);
                        }}
                        className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                          carBetAmount === amt
                            ? 'bg-amber-400 text-black shadow-xs'
                            : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {cars.map((car) => (
                    <button
                      key={car.id}
                      disabled={racePhase !== 'betting'}
                      onClick={() => handlePlaceCarBet(car.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        racePhase === 'betting'
                          ? 'bg-white/5 border-amber-400/30 hover:border-amber-400 hover:bg-white/10'
                          : 'opacity-50 border-white/10 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xs font-black text-white">{car.name}</span>
                      <span className="text-[10px] text-amber-300 font-extrabold mt-0.5">
                        Bet 🪙{carBetAmount} (Win {(carBetAmount * car.odds).toFixed(0)})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. 777 MEGA JACKPOT SLOT ================= */}
          {activeGame === 'slots' && (
            <div className="space-y-3 text-center">
              <div className="bg-gradient-to-r from-[#2A0818] via-[#12050E] to-[#090A15] p-3 rounded-2xl border border-pink-500/40 shadow-inner">
                <p className="text-[11px] font-bold text-pink-300 uppercase tracking-widest">777 Mega Jackpot Slot</p>

                {/* 3 Reels Display */}
                <div className="flex items-center justify-center gap-3 my-4">
                  {slotReels.map((sym, idx) => (
                    <motion.div
                      key={idx}
                      animate={isSlotSpinning ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 0.2, repeat: isSlotSpinning ? Infinity : 0 }}
                      className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-black/80 border-2 border-amber-400/60 shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center justify-center text-4xl sm:text-5xl"
                    >
                      {sym}
                    </motion.div>
                  ))}
                </div>

                {slotWinMessage && (
                  <p className="text-xs font-black text-amber-300 animate-pulse">{slotWinMessage}</p>
                )}
              </div>

              {/* Spin Action */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-xs text-gray-400">Bet:</span>
                  {[50, 100, 500].map((b) => (
                    <button
                      key={b}
                      onClick={() => setSlotBet(b)}
                      className={`text-xs font-bold px-2 py-0.5 rounded ${slotBet === b ? 'bg-amber-400 text-black' : 'text-gray-400'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSpin777}
                  disabled={isSlotSpinning}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-black font-black text-xs shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>{isSlotSpinning ? 'SPINNING...' : `SPIN (🪙${slotBet})`}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= 3. LUCKY REELS FRUIT COMBO ================= */}
          {activeGame === 'reels' && (
            <div className="space-y-3 text-center">
              <div className="bg-[#14162B] p-3 rounded-2xl border border-cyan-400/30">
                <p className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest">Lucky Fruit Reels (4-Reels)</p>

                <div className="flex items-center justify-center gap-2 my-4">
                  {fruitReels.map((sym, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-18 sm:w-16 sm:h-20 rounded-xl bg-black/70 border border-cyan-400/50 flex items-center justify-center text-3xl sm:text-4xl shadow-md"
                    >
                      {sym}
                    </div>
                  ))}
                </div>

                {fruitWinMsg && (
                  <p className="text-xs font-black text-cyan-300">{fruitWinMsg}</p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleSpinFruitReels}
                  disabled={isFruitSpinning}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-[#00D2FF] to-blue-600 text-white font-black text-xs shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  {isFruitSpinning ? 'SPINNING...' : `SPIN (🪙${fruitBet})`}
                </button>
              </div>
            </div>
          )}

          {/* ================= 4. GREEDY FEAST ================= */}
          {activeGame === 'feast' && (
            <div className="space-y-3">
              <div className="bg-black/50 p-3 rounded-2xl border border-white/10 text-center">
                <p className="text-xs font-bold text-amber-300 uppercase">Select Your Feast Dish &amp; Win Multipliers</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {feastDishes.map((dish) => (
                    <button
                      key={dish.id}
                      onClick={() => {
                        sound.playClick();
                        setFeastSelectedDish(dish.id);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        feastSelectedDish === dish.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{dish.icon}</span>
                      <div className="text-left">
                        <span className="text-xs font-black block">{dish.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">{dish.mult}x Multiplier</span>
                      </div>
                    </button>
                  ))}
                </div>

                {feastResult && (
                  <p className="text-xs font-bold text-pink-300 mt-3">{feastResult}</p>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handlePlayGreedyFeast}
                  disabled={isFeastSpinning}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-xs shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  {isFeastSpinning ? 'SERVING DISH...' : `PLAY FEAST (🪙${feastBet})`}
                </button>
              </div>
            </div>
          )}

          {/* ================= 5. SPHINX LEGEND ================= */}
          {activeGame === 'sphinx' && (
            <div className="space-y-3 text-center">
              <div className="bg-black/50 p-3 rounded-2xl border border-amber-400/30">
                <p className="text-xs font-bold text-amber-300 uppercase">Pyramid Mystery Vault Picker</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Pick an ancient vault to discover treasures up to 50x!</p>

                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  {sphinxVaults.map((vault) => (
                    <button
                      key={vault.id}
                      onClick={() => handleOpenSphinxVault(vault.id)}
                      disabled={isOpeningSphinx}
                      className="p-3 rounded-xl bg-gradient-to-b from-amber-900/30 to-black/60 border border-amber-400/40 hover:border-amber-400 hover:scale-102 transition-all flex flex-col items-center justify-center cursor-pointer"
                    >
                      <span className="text-3xl mb-1">{vault.icon}</span>
                      <span className="text-xs font-bold text-white">{vault.name}</span>
                      <span className="text-[10px] text-amber-300 font-mono font-black">Up to {vault.mult}x</span>
                    </button>
                  ))}
                </div>

                {sphinxReward && (
                  <p className="text-xs font-bold text-amber-300 mt-3">{sphinxReward}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Wallet Balance */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Balance:</span>
            <span className="font-mono font-bold text-amber-300">🪙 {user.coins.toLocaleString()}</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenRecharge();
            }}
            className="text-xs font-bold text-[#00D2FF] hover:underline"
          >
            + Top Up Coins
          </button>
        </div>
      </motion.div>
    </div>
  );
};
