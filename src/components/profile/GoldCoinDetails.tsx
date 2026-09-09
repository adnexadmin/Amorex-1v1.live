import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Calendar,
  Sparkles,
  PhoneCall,
  Gift,
  CheckCircle2,
  CreditCard,
  Heart,
  Gamepad2,
  Send,
  RotateCcw,
  Search,
  X,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { CoinLedgerItem, TransactionType } from '../../types';
import { sound } from '../../utils/audio';
import { getStoredCoinLedger } from '../../utils/storage';

interface GoldCoinDetailsProps {
  onBack: () => void;
  onOpenRecharge?: () => void;
  coinBalance?: number;
}

export const GoldCoinDetails: React.FC<GoldCoinDetailsProps> = ({
  onBack,
  onOpenRecharge,
  coinBalance: propBalance
}) => {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<CoinLedgerItem | null>(null);

  const [ledger, setLedger] = useState<CoinLedgerItem[]>(() => getStoredCoinLedger());
  const [currentBalance, setCurrentBalance] = useState<number>(() => {
    if (propBalance !== undefined) return propBalance;
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('amorex_user');
        if (u) return JSON.parse(u).coins || 88500;
      } catch (e) {}
    }
    return 88500;
  });

  // Listen to ledger updates and wallet balance updates
  useEffect(() => {
    const handleLedgerUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CoinLedgerItem[]>;
      if (customEvent.detail) {
        setLedger(customEvent.detail);
      } else {
        setLedger(getStoredCoinLedger());
      }
    };

    const handleWalletUpdate = () => {
      try {
        const u = localStorage.getItem('amorex_user');
        if (u) {
          setCurrentBalance(JSON.parse(u).coins || 0);
        }
      } catch (e) {}
      setLedger(getStoredCoinLedger());
    };

    window.addEventListener('amorex_coin_ledger_updated', handleLedgerUpdate);
    window.addEventListener('amorex_wallet_updated', handleWalletUpdate);
    window.addEventListener('amorex_user_updated', handleWalletUpdate);

    return () => {
      window.removeEventListener('amorex_coin_ledger_updated', handleLedgerUpdate);
      window.removeEventListener('amorex_wallet_updated', handleWalletUpdate);
      window.removeEventListener('amorex_user_updated', handleWalletUpdate);
    };
  }, []);

  // Filter items
  const filteredItems = ledger.filter((item) => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'task' && !item.title.toLowerCase().includes('task') && item.category !== 'task') return false;
      if (selectedCategory === 'video_chat' && !item.title.toLowerCase().includes('video') && item.category !== 'video_chat') return false;
      if (selectedCategory === 'sign_in' && !item.title.toLowerCase().includes('sign-in') && item.category !== 'sign_in') return false;
      if (selectedCategory === 'gift' && !item.title.toLowerCase().includes('gift') && item.category !== 'gift') return false;
      if (selectedCategory === 'game' && !item.title.toLowerCase().includes('game') && item.category !== 'game') return false;
      if (selectedCategory === 'top_up' && !item.title.toLowerCase().includes('top-up') && !item.title.toLowerCase().includes('recharge') && item.category !== 'top_up' && item.category !== 'recharge') return false;
      if (selectedCategory === 'consumption_return' && !item.title.toLowerCase().includes('return') && item.category !== 'consumption_return') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchNote = (item.note || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNote && !matchCat) return false;
    }
    return true;
  });

  // Calculate totals
  const totalCredit = ledger
    .filter((i) => i.type === 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDebit = ledger
    .filter((i) => i.type === 'debit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Helper icon by category or title
  const getCategoryIcon = (category?: string, type?: TransactionType, title?: string) => {
    const t = (title || '').toLowerCase();
    if (t.includes('video chat') || category === 'video_chat') {
      return <PhoneCall size={15} className="text-rose-400" />;
    }
    if (t.includes('gift') || category === 'gift' || category === 'cp_gift') {
      return <Gift size={15} className="text-pink-400" />;
    }
    if (t.includes('game') || category === 'game') {
      return <Gamepad2 size={15} className="text-purple-400" />;
    }
    if (t.includes('consumption return') || category === 'consumption_return') {
      return <RotateCcw size={15} className="text-amber-400" />;
    }
    if (t.includes('task') || category === 'task') {
      return <CheckCircle2 size={15} className="text-emerald-400" />;
    }
    if (t.includes('sign-in') || category === 'sign_in') {
      return <Calendar size={15} className="text-cyan-400" />;
    }
    if (t.includes('top-up') || t.includes('agent') || category === 'top_up' || category === 'agent_transfer') {
      return <Send size={15} className="text-emerald-400" />;
    }
    if (type === 'credit') {
      return <Sparkles size={15} className="text-emerald-400" />;
    }
    return <ArrowDownLeft size={15} className="text-rose-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto pb-28 text-white space-y-4"
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
          <h2 className="text-sm font-black tracking-wide text-white">Gold Coin Details</h2>
          <p className="text-[10px] text-gray-400">Comprehensive Transaction Ledger</p>
        </div>

        {onOpenRecharge ? (
          <button
            onClick={() => {
              sound.playClick();
              onOpenRecharge();
            }}
            className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-md transition-all cursor-pointer"
          >
            Recharge
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Balance Summary Header Card */}
      <div className="px-3 sm:px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2D2109] via-[#1B150A] to-[#0D0B05] border border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                <Coins size={14} className="text-amber-400" />
                <span>Available Coin Balance</span>
              </span>
              <div className="text-3xl font-black text-amber-300 tracking-tight">
                {currentBalance.toLocaleString()}{' '}
                <span className="text-xs font-bold text-amber-400/80">Coins</span>
              </div>
            </div>

            {onOpenRecharge && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenRecharge();
                }}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs shadow-lg hover:opacity-95 transition-all cursor-pointer"
              >
                + Top Up
              </button>
            )}
          </div>

          {/* Quick stats: Total Earned vs Total Spent */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-amber-500/20 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowUpRight size={13} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Total Credits</p>
                <p className="font-bold text-emerald-400">+{totalCredit.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowDownLeft size={13} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Total Debits</p>
                <p className="font-bold text-rose-400">-{totalDebit.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Quick Filters */}
      <div className="px-3 sm:px-4 space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by title or description..."
            className="w-full bg-[#12142B] border border-white/10 rounded-2xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type Switcher: All, Credits (+), Debits (-) */}
        <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setFilter('all');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-400 text-black shadow-md font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Types ({ledger.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilter('credit');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'credit'
                ? 'bg-emerald-500 text-black shadow-md font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Credits (+)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilter('debit');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'debit'
                ? 'bg-rose-500 text-white shadow-md font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Debits (-)
          </button>
        </div>

        {/* Specific Interaction Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'task', label: 'Task Reward' },
            { id: 'video_chat', label: 'Video Chat Cost' },
            { id: 'sign_in', label: 'Sign-in Reward' },
            { id: 'gift', label: 'Give Gift' },
            { id: 'game', label: 'Game Bet' },
            { id: 'top_up', label: 'Top-up Bonus' },
            { id: 'consumption_return', label: 'Consumption Return' }
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 shadow-xs'
                    : 'bg-[#12142B] text-gray-300 border-white/10 hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-3 sm:px-4">
        <div className="rounded-3xl bg-[#12142B] border border-white/10 overflow-hidden divide-y divide-white/5 shadow-lg">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Coins size={32} className="mx-auto text-gray-500" />
              <p className="text-xs font-bold text-gray-300">No transactions found</p>
              <p className="text-[10px] text-gray-500">Try changing the search query or active filter chips</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isCredit = item.type === 'credit';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedItem(item);
                  }}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {/* Left: Icon & Title + Note + Timestamp */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {getCategoryIcon(item.category, item.type, item.title)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.title}
                      </p>

                      {item.note && (
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                          {item.note}
                        </p>
                      )}

                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 font-mono">
                        <Calendar size={10} className="text-gray-500" />
                        <span>
                          {item.dateFormatted ||
                            new Date(item.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount with Green "+" or Red "-" */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-black tracking-tight ${
                        isCredit
                          ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                          : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                      }`}
                    >
                      {isCredit ? `+${item.amount.toLocaleString()}` : `-${item.amount.toLocaleString()}`}
                    </span>
                    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                      {isCredit ? 'Credit' : 'Debit'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* TRANSACTION RECEIPT MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#12142B] border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-amber-400" />
                  <span className="font-black text-white">Transaction Statement</span>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-center py-2">
                <span
                  className={`text-2xl font-black ${
                    selectedItem.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedItem.type === 'credit' ? '+' : '-'}
                  {selectedItem.amount.toLocaleString()} Coins
                </span>
                <p className="text-xs font-bold text-gray-300 mt-1">{selectedItem.title}</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck size={12} />
                  <span>Verified & Settled</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="font-mono text-gray-200">{selectedItem.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="font-bold text-amber-300 uppercase">{selectedItem.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="font-bold text-white uppercase">{selectedItem.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date & Time:</span>
                  <span className="text-gray-200 font-mono">
                    {new Date(selectedItem.timestamp).toLocaleString()}
                  </span>
                </div>
                {selectedItem.note && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-gray-400 block mb-0.5">Details:</span>
                    <span className="text-gray-200">{selectedItem.note}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs cursor-pointer"
              >
                Close Statement
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

