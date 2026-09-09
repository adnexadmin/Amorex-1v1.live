import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Coins,
  Gem,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Clock,
  Video,
  Gift,
  Sparkles,
  PlusCircle,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { sound } from '../../utils/audio';

export interface WalletTransaction {
  id: string;
  type: 'RECHARGE' | 'CALL_EXPENSE' | 'GIFT_SENT' | 'GIFT_RECEIVED' | 'AIRDROP' | 'TASK_REWARD';
  currency: 'COINS' | 'GEMS';
  amount: number; // positive for credit (+), negative for debit (-)
  title: string;
  description: string;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING';
}

const WALLET_TX_KEY = 'amorex_wallet_transactions';

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TX-90281',
    type: 'AIRDROP',
    currency: 'COINS',
    amount: 50000,
    title: 'Super Admin Community Airdrop',
    description: 'Special platform welcome talk-time bonus granted by AmoreX Ops',
    timestamp: Date.now() - 1000 * 60 * 15,
    status: 'COMPLETED'
  },
  {
    id: 'TX-89104',
    type: 'CALL_EXPENSE',
    currency: 'COINS',
    amount: -1200,
    title: '1v1 Video Call with Ananya',
    description: 'Private 1v1 HD video call (2 minutes @ 600 coins/min)',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    status: 'COMPLETED'
  },
  {
    id: 'TX-88402',
    type: 'GIFT_SENT',
    currency: 'COINS',
    amount: -500,
    title: 'Sent Luxury Rose to Host',
    description: 'Gift animation in party room #8820',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    status: 'COMPLETED'
  },
  {
    id: 'TX-87519',
    type: 'RECHARGE',
    currency: 'COINS',
    amount: 10000,
    title: 'UPI / Card Coin Pack Recharge',
    description: 'Verified purchase of 10,000 AmoreX Talk-Time Coins',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    status: 'COMPLETED'
  },
  {
    id: 'TX-86922',
    type: 'GIFT_RECEIVED',
    currency: 'GEMS',
    amount: 250,
    title: 'Received Diamond Crown',
    description: 'Earning credited from viewer gift during audio room session',
    timestamp: Date.now() - 1000 * 60 * 60 * 36,
    status: 'COMPLETED'
  },
  {
    id: 'TX-85110',
    type: 'TASK_REWARD',
    currency: 'COINS',
    amount: 300,
    title: 'Daily Check-in Bonus',
    description: 'Claimed Day 1 login reward streak',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    status: 'COMPLETED'
  }
];

export const getStoredTransactions = (): WalletTransaction[] => {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(WALLET_TX_KEY);
    if (!raw) {
      localStorage.setItem(WALLET_TX_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
  } catch (e) {
    return INITIAL_TRANSACTIONS;
  }
};

interface WalletTransactionHistoryProps {
  coinBalance: number;
  gemBalance: number;
  onBack: () => void;
  onOpenRecharge: () => void;
}

export const WalletTransactionHistory: React.FC<WalletTransactionHistoryProps> = ({
  coinBalance,
  gemBalance,
  onBack,
  onOpenRecharge
}) => {
  const [filter, setFilter] = useState<'ALL' | 'COINS' | 'GEMS' | 'EXPENSES' | 'REWARDS'>('ALL');
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => getStoredTransactions());

  useEffect(() => {
    const handleUpdate = () => {
      setTransactions(getStoredTransactions());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('amorex_wallet_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('amorex_wallet_updated', handleUpdate);
    };
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    if (filter === 'COINS') return tx.currency === 'COINS';
    if (filter === 'GEMS') return tx.currency === 'GEMS';
    if (filter === 'EXPENSES') return tx.amount < 0;
    if (filter === 'REWARDS') return tx.amount > 0;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-xl mx-auto pb-24 text-white"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between py-4 px-2 border-b border-white/10 sticky top-0 bg-[#070814]/90 backdrop-blur-md z-30">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="text-base font-black tracking-wide text-white">Wallet & Ledger</h2>

        <button
          onClick={() => {
            sound.playClick();
            onOpenRecharge();
          }}
          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 cursor-pointer flex items-center gap-1.5 transition-all"
        >
          <PlusCircle size={13} />
          <span>Top Up</span>
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Dual Wallet Balances */}
        <div className="grid grid-cols-2 gap-3">
          {/* Coins Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[#1C180E] to-black border border-amber-500/40 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">My Coins</span>
              <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                <Coins size={15} className="text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300 tracking-tight">
              {coinBalance.toLocaleString()}
            </div>
            <p className="text-[10px] text-amber-400/70 mt-1">Talk-time & Live gifting</p>
          </div>

          {/* Gems Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-[#0B1522] to-black border border-cyan-500/40 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">My Gems</span>
              <div className="w-7 h-7 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center">
                <Gem size={15} className="text-cyan-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-cyan-300 tracking-tight">
              {gemBalance.toLocaleString()}
            </div>
            <p className="text-[10px] text-cyan-400/70 mt-1">Gift earnings & withdrawal</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'ALL', label: 'All History' },
            { id: 'COINS', label: '🪙 Coins' },
            { id: 'GEMS', label: '💎 Gems' },
            { id: 'EXPENSES', label: '📉 Spent' },
            { id: 'REWARDS', label: '📈 Received' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setFilter(tab.id as typeof filter);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-amber-400 text-black font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction Ledger */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold px-1">
            <span>Transaction Record</span>
            <span>{filteredTransactions.length} items</span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
              <Clock size={28} className="text-gray-500 mx-auto" />
              <p className="text-xs text-gray-400 font-medium">No transactions found for this filter</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isCredit = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                >
                  {/* Left Icon & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                        tx.currency === 'GEMS'
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                          : isCredit
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {tx.type === 'RECHARGE' ? (
                        <ArrowDownLeft size={18} />
                      ) : tx.type === 'CALL_EXPENSE' ? (
                        <Video size={18} />
                      ) : tx.type === 'GIFT_SENT' || tx.type === 'GIFT_RECEIVED' ? (
                        <Gift size={18} />
                      ) : (
                        <Sparkles size={18} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{tx.title}</p>
                      <p className="text-[11px] text-gray-400 truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                        <span className="font-mono">{tx.id}</span>
                        <span>•</span>
                        <span>{new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Amount & Status */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-black flex items-center justify-end gap-1 ${
                        isCredit ? 'text-emerald-400' : 'text-gray-200'
                      }`}
                    >
                      <span>{isCredit ? '+' : ''}{tx.amount.toLocaleString()}</span>
                      {tx.currency === 'COINS' ? (
                        <Coins size={13} className="text-amber-400 inline" />
                      ) : (
                        <Gem size={13} className="text-cyan-400 inline" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400/90 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 inline-block mt-1">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};
