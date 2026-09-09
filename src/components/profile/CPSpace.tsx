import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  Sparkles,
  Gift,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  Plus,
  Coins,
  Send,
  UserPlus,
  Smile,
  Shield,
  Clock,
  Star
} from 'lucide-react';
import { UserProfile, CPQuestItem, CPMemoirItem, CPGiftItem } from '../../types';
import { sound } from '../../utils/audio';
import {
  INITIAL_CP_MEMOIRS,
  INITIAL_CP_GIFTS,
  recordCoinTransaction
} from '../../utils/storage';
import { useCPTaskEngine } from '../../hooks/useCPTaskEngine';

interface CPSpaceProps {
  user: UserProfile;
  onBack: () => void;
  onOpenRecharge?: () => void;
  onStart1v1Call?: (hostId: string) => void;
}

export const CPSpace: React.FC<CPSpaceProps> = ({
  user,
  onBack,
  onOpenRecharge,
  onStart1v1Call
}) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'memoir' | 'gift'>('quests');
  const { dailyQuests, weeklyQuests, trackAction, claimReward } = useCPTaskEngine();

  // CP Partner details
  const [cpPartner, setCpPartner] = useState(
    user.cpPartner || {
      partnerId: 'host-1',
      partnerName: 'Aanya Sharma',
      partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      level: 3,
      intimacyPoints: 2480,
      anniversaryDate: '2026-06-15'
    }
  );

  // Calculate days together
  const daysTogether = Math.max(
    1,
    Math.floor((Date.now() - new Date(cpPartner.anniversaryDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  const [memoirs, setMemoirs] = useState<CPMemoirItem[]>(INITIAL_CP_MEMOIRS);
  const [gifts] = useState<CPGiftItem[]>(INITIAL_CP_GIFTS);
  const [userCoins, setUserCoins] = useState<number>(user.coins || 88500);

  // Interactive feedback
  const [actionNotice, setActionNotice] = useState<string>('');
  const [showAddMemoirModal, setShowAddMemoirModal] = useState<boolean>(false);
  const [newMemoirTitle, setNewMemoirTitle] = useState<string>('');
  const [newMemoirDesc, setNewMemoirDesc] = useState<string>('');
  const [sendingGiftId, setSendingGiftId] = useState<string | null>(null);

  // Sync user coins
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const u = localStorage.getItem('amorex_user');
        if (u) {
          const parsed = JSON.parse(u);
          setUserCoins(parsed.coins || 0);
          if (parsed.cpPartner) setCpPartner(parsed.cpPartner);
        }
      } catch (e) {}
    };

    window.addEventListener('amorex_user_updated', handleUpdate);
    window.addEventListener('amorex_wallet_updated', handleUpdate);
    return () => {
      window.removeEventListener('amorex_user_updated', handleUpdate);
      window.removeEventListener('amorex_wallet_updated', handleUpdate);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 2500);
  };

  // Handle "GO" button click for quests
  const handleQuestGo = (quest: CPQuestItem) => {
    sound.playClick();
    if (quest.isCompleted && !quest.isClaimed) {
      // Claim
      const res = claimReward(quest.id);
      if (res.success) {
        sound.playCoinDrop();
        triggerToast(`Claimed +${res.rewardCoins} Coins & +${res.rewardIntimacy} Intimacy!`);
      }
      return;
    }

    // Advance quest progress interactively
    trackAction(quest.actionType, 1);
    sound.playClick();

    if (quest.actionType === 'video_call' && onStart1v1Call) {
      triggerToast('Connecting to your CP video lounge...');
      setTimeout(() => onStart1v1Call(cpPartner.partnerId), 600);
    } else if (quest.actionType === 'send_message') {
      triggerToast('Whisper sent to CP partner in chat!');
    } else if (quest.actionType === 'voice_party') {
      triggerToast('Voice party intimacy synced!');
    } else if (quest.actionType === 'feed_like') {
      triggerToast('Liked 1 Couple Moment!');
    } else {
      triggerToast('Quest activity recorded!');
    }
  };

  // Handle sending Intimacy Gift
  const handleSendGift = (gift: CPGiftItem) => {
    if (userCoins < gift.coinPrice) {
      sound.playClick();
      triggerToast('Insufficient coins! Please recharge to send gift.');
      if (onOpenRecharge) onOpenRecharge();
      return;
    }

    setSendingGiftId(gift.id);
    sound.playGiftSound();

    // Deduct coins & record ledger
    const newCoins = userCoins - gift.coinPrice;
    setUserCoins(newCoins);

    recordCoinTransaction({
      title: `CP Intimacy Gift: ${gift.name}`,
      type: 'debit',
      amount: gift.coinPrice,
      category: 'cp_gift'
    });

    // Update user profile
    try {
      const u = localStorage.getItem('amorex_user');
      if (u) {
        const parsed = JSON.parse(u);
        parsed.coins = newCoins;
        if (parsed.cpPartner) {
          parsed.cpPartner.intimacyPoints = (parsed.cpPartner.intimacyPoints || 0) + gift.intimacyValue;
          setCpPartner({ ...parsed.cpPartner });
        } else {
          const updatedPartner = {
            ...cpPartner,
            intimacyPoints: cpPartner.intimacyPoints + gift.intimacyValue
          };
          parsed.cpPartner = updatedPartner;
          setCpPartner(updatedPartner);
        }
        localStorage.setItem('amorex_user', JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent('amorex_user_updated', { detail: parsed }));
      }
    } catch (e) {}

    // Advance 'send_gift' quest
    trackAction('send_gift', 1);

    triggerToast(`Sent ${gift.name}! +${gift.intimacyValue} Intimacy EXP added! 💕`);
    setTimeout(() => setSendingGiftId(null), 1000);
  };

  // Handle Add Memoir
  const handleAddMemoir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoirTitle.trim()) return;

    sound.playClick();
    const newEntry: CPMemoirItem = {
      id: `mem-${Date.now()}`,
      title: newMemoirTitle.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      photoUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
      description: newMemoirDesc.trim() || 'A magical sweet chapter added to our couple history.',
      milestoneLevel: cpPartner.level
    };

    setMemoirs([newEntry, ...memoirs]);
    setNewMemoirTitle('');
    setNewMemoirDesc('');
    setShowAddMemoirModal(false);
    triggerToast('New romantic memory captured in Memoir! 📸');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-xl mx-auto pb-28 text-white space-y-4"
    >
      {/* Top App Bar */}
      <div className="flex items-center justify-between py-3.5 px-3 border-b border-white/10 sticky top-0 bg-[#070814]/95 backdrop-blur-md z-30">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black tracking-wide text-white flex items-center justify-center gap-1.5">
            <Heart size={15} className="text-pink-500 fill-pink-500" />
            <span>Couple Space (CP)</span>
          </h2>
          <p className="text-[10px] text-pink-400 font-bold">Together for {daysTogether} Days 💕</p>
        </div>

        {/* User Coin Balance Badge */}
        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-amber-500/30">
          <Coins size={13} className="text-amber-400" />
          <span className="text-xs font-black text-amber-300">{userCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Floating Notice */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs rounded-full shadow-2xl flex items-center gap-2 pointer-events-none"
          >
            <Sparkles size={14} />
            <span>{actionNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* CP PARTNER HERO CARD: Dual Avatars & Intimacy Bar */}
      {/* ========================================================================= */}
      <div className="px-3 sm:px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2D0D25] via-[#1A0A1F] to-[#0D0512] border border-pink-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Dual Avatars Linked by Heart */}
          <div className="flex items-center justify-center gap-4 relative py-2">
            {/* User Avatar */}
            <div className="text-center space-y-1">
              <div className="relative inline-block">
                <img
                  referrerPolicy="no-referrer"
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-pink-500 shadow-[0_0_15px_rgba(255,46,147,0.4)]"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-pink-500 text-[9px] font-black text-white">
                  You
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate max-w-[80px]">{user.name}</p>
            </div>

            {/* Glowing Heart Bond Indicator */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(255,46,147,0.6)] animate-pulse">
                <Heart size={20} className="fill-white text-white" />
              </div>
              <span className="text-[10px] font-black text-pink-300">Lv.{cpPartner.level} CP</span>
            </div>

            {/* CP Partner Avatar */}
            <div className="text-center space-y-1">
              <div className="relative inline-block">
                <img
                  referrerPolicy="no-referrer"
                  src={cpPartner.partnerAvatar}
                  alt={cpPartner.partnerName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-purple-500 text-[9px] font-black text-white">
                  CP
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate max-w-[80px]">{cpPartner.partnerName}</p>
            </div>
          </div>

          {/* Intimacy Progress Bar */}
          <div className="mt-3 pt-3 border-t border-pink-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-bold flex items-center gap-1">
                <Flame size={14} className="text-amber-400 fill-amber-400" />
                <span>Intimacy EXP</span>
              </span>
              <span className="text-pink-300 font-black">
                {cpPartner.intimacyPoints.toLocaleString()} / 5,000 EXP
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (cpPartner.intimacyPoints / 5000) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 text-center pt-0.5">
              Level 4 unlocks: Exclusive CP Private Live Stream & Couple Audio Filter
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABBED INTERFACE: Quests, Memoir, Gift */}
      {/* ========================================================================= */}
      <div className="px-3 sm:px-4">
        <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('quests');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'quests'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Quests</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('memoir');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'memoir'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} />
            <span>Memoir</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('gift');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'gift'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gift size={14} />
            <span>Gift</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUESTS (Daily quests & Weekly quests with Progress Bars & GO buttons) */}
      {/* ========================================================================= */}
      {activeTab === 'quests' && (
        <div className="px-3 sm:px-4 space-y-4">
          {/* Section A: Daily Quests */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Clock size={13} />
                <span>Daily CP Quests</span>
              </h3>
              <span className="text-[10px] text-gray-400">Resets daily at 00:00</span>
            </div>

            <div className="rounded-3xl bg-[#12142B] border border-white/10 divide-y divide-white/5 overflow-hidden shadow-lg">
              {dailyQuests.map((quest) => {
                const percent = Math.min(100, Math.round((quest.progress / quest.target) * 100));
                const canClaim = quest.isCompleted && !quest.isClaimed;
                return (
                  <div key={quest.id} className="p-3.5 sm:p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-white">{quest.title}</p>
                          <span className="text-[10px] font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                            +{quest.rewardCoins} Coins
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{quest.description}</p>
                      </div>

                      {/* Action Button: "GO" or "CLAIM" or "COMPLETED" */}
                      <div>
                        {quest.isClaimed ? (
                          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-gray-400 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>Claimed</span>
                          </span>
                        ) : canClaim ? (
                          <button
                            onClick={() => handleQuestGo(quest)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs shadow-lg animate-pulse hover:opacity-90 cursor-pointer"
                          >
                            CLAIM
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuestGo(quest)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs shadow-md hover:opacity-90 cursor-pointer flex items-center gap-1"
                          >
                            <span>GO</span>
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Counter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400 font-semibold">Progress</span>
                        <span className="font-bold text-pink-300">
                          {quest.progress} / {quest.target} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Weekly Quests */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Star size={13} />
                <span>Weekly Intimacy Challenges</span>
              </h3>
              <span className="text-[10px] text-gray-400">Resets every Monday</span>
            </div>

            <div className="rounded-3xl bg-[#12142B] border border-white/10 divide-y divide-white/5 overflow-hidden shadow-lg">
              {weeklyQuests.map((quest) => {
                const percent = Math.min(100, Math.round((quest.progress / quest.target) * 100));
                const canClaim = quest.isCompleted && !quest.isClaimed;
                return (
                  <div key={quest.id} className="p-3.5 sm:p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-white">{quest.title}</p>
                          <span className="text-[10px] font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                            +{quest.rewardCoins} Coins
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{quest.description}</p>
                      </div>

                      {/* Action Button: "GO" or "CLAIM" */}
                      <div>
                        {quest.isClaimed ? (
                          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-gray-400 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>Claimed</span>
                          </span>
                        ) : canClaim ? (
                          <button
                            onClick={() => handleQuestGo(quest)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs shadow-lg animate-pulse hover:opacity-90 cursor-pointer"
                          >
                            CLAIM
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuestGo(quest)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs shadow-md hover:opacity-90 cursor-pointer flex items-center gap-1"
                          >
                            <span>GO</span>
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Counter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400 font-semibold">Progress</span>
                        <span className="font-bold text-purple-300">
                          {quest.progress} / {quest.target} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MEMOIR (Couple Timeline & Milestones) */}
      {/* ========================================================================= */}
      {activeTab === 'memoir' && (
        <div className="px-3 sm:px-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-pink-400">
                Memoirs & Milestones
              </h3>
              <p className="text-[10px] text-gray-400">Chronicle of your love journey together</p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowAddMemoirModal(true);
              }}
              className="px-3 py-1.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all"
            >
              <Plus size={14} />
              <span>Add Memory</span>
            </button>
          </div>

          {/* Timeline of Memoir Cards */}
          <div className="space-y-3">
            {memoirs.map((mem, idx) => (
              <div
                key={mem.id}
                className="rounded-3xl bg-[#12142B] border border-white/10 overflow-hidden shadow-lg"
              >
                <div className="relative h-40 w-full bg-black/40 overflow-hidden">
                  <img
                    referrerPolicy="no-referrer"
                    src={mem.photoUrl}
                    alt={mem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12142B] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-pink-300 border border-white/10 flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{mem.date}</span>
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-pink-500 text-[10px] font-black text-white shadow-md">
                    Chapter #{idx + 1}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <h4 className="text-sm font-bold text-white">{mem.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{mem.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Memoir Modal */}
          {showAddMemoirModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-3xl bg-[#12142B] border border-pink-500/40 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Heart size={16} className="text-pink-500 fill-pink-500" />
                    <span>Record Couple Memory</span>
                  </h3>
                  <button
                    onClick={() => setShowAddMemoirModal(false)}
                    className="w-7 h-7 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddMemoir} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300">Memory Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Midnight Starry Call"
                      value={newMemoirTitle}
                      onChange={(e) => setNewMemoirTitle(e.target.value)}
                      className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300">Story / Thoughts</label>
                    <textarea
                      rows={3}
                      placeholder="What made this moment unforgettable?"
                      value={newMemoirDesc}
                      onChange={(e) => setNewMemoirDesc(e.target.value)}
                      className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs shadow-lg cursor-pointer"
                  >
                    Save to Memoir
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GIFT (Exclusive CP Intimacy Gifts with Intimacy EXP values) */}
      {/* ========================================================================= */}
      {activeTab === 'gift' && (
        <div className="px-3 sm:px-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-pink-400">
                Exclusive CP Gifts
              </h3>
              <p className="text-[10px] text-gray-400">Send romantic gifts to level up your CP bond</p>
            </div>
            {onOpenRecharge && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenRecharge();
                }}
                className="px-3 py-1 rounded-full bg-amber-400 text-black font-black text-[11px] shadow-sm cursor-pointer"
              >
                + Top Up
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gifts.map((gift) => {
              const isSending = sendingGiftId === gift.id;
              return (
                <div
                  key={gift.id}
                  className="p-4 rounded-3xl bg-[#12142B] border border-white/10 hover:border-pink-500/40 transition-all shadow-lg flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-3xl flex items-center justify-center shrink-0 border border-pink-500/30">
                      {gift.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-white">{gift.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{gift.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-amber-300 flex items-center gap-0.5">
                          <Coins size={11} className="text-amber-400" />
                          <span>{gift.coinPrice} Coins</span>
                        </span>
                        <span className="text-[10px] font-black text-pink-300 flex items-center gap-0.5">
                          <Flame size={11} className="text-pink-400" />
                          <span>+{gift.intimacyValue} EXP</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendGift(gift)}
                    disabled={isSending}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 via-[#FF2E93] to-purple-600 text-white font-black text-xs shadow-md hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Send size={12} />
                    <span>{isSending ? 'Sending Love...' : `Send (${gift.coinPrice} Coins)`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
