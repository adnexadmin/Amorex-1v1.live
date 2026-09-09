import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  ShieldCheck, 
  Coins, 
  CircleDollarSign, 
  Sparkles, 
  ArrowRight, 
  X, 
  TrendingUp, 
  CheckCircle2, 
  Share2, 
  MessageSquare,
  Building2,
  Gift
} from 'lucide-react';
import { t } from '../../utils/i18n';

interface AgentPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyWithSuperAdmin: () => void;
  onOpenShareModal?: () => void;
  onOpenShare?: () => void;
  spentCoinsAmount?: number;
  triggerSpentCoins?: number;
}

export const AgentPromotionModal: React.FC<AgentPromotionModalProps> = ({
  isOpen,
  onClose,
  onApplyWithSuperAdmin,
  onOpenShareModal,
  onOpenShare,
  spentCoinsAmount = 240,
  triggerSpentCoins
}) => {
  const handleShareClick = () => {
    onOpenShareModal?.();
    onOpenShare?.();
  };
  // Commission calculator state (simulated monthly coin recharge)
  const [calcVolume, setCalcVolume] = useState(150000);

  // Profit calculation logic based on tiers
  const getCommissionRate = (volume: number) => {
    if (volume > 200000) return 0.10; // 10%
    if (volume > 50000) return 0.08; // 8%
    return 0.05; // 5%
  };

  const currentRate = getCommissionRate(calcVolume);
  const estimatedProfit = Math.round(calcVolume * currentRate);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative w-full max-w-xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-rose-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden text-white my-auto max-h-[92vh] flex flex-col"
          >
            {/* Ambient Lighting FX */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Body */}
            <div className="overflow-y-auto pr-1 space-y-5 custom-scrollbar">
              {/* Header Badge & Title */}
              <div className="text-center space-y-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold tracking-wide uppercase shadow-sm">
                  <Rocket className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  {t('agent.spendTriggerTitle')}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-rose-100 to-amber-200 bg-clip-text text-transparent">
                  {t('agent.profitTitle')}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                  {t('agent.spendTriggerDesc')}
                </p>

                {spentCoinsAmount > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Triggered by recent spend: <strong>{spentCoinsAmount.toLocaleString()} Coins</strong></span>
                  </div>
                )}
              </div>

              {/* Attractive UI Icons Trio Highlight */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-2 shadow-inner">
                    <CircleDollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-white">Up to 10% Profit</span>
                  <span className="text-[10px] text-zinc-400">On every user top-up</span>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2 shadow-inner">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-white">Official Shield</span>
                  <span className="text-[10px] text-zinc-400">Verified agency status</span>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-rose-500/10 to-rose-500/5 border border-rose-500/20 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center mb-2 shadow-inner">
                    <Rocket className="w-5 h-5 text-rose-400" />
                  </div>
                  <span className="text-xs font-bold text-white">Weekly Payouts</span>
                  <span className="text-[10px] text-zinc-400">Direct bank transfer</span>
                </div>
              </div>

              {/* Profit Structure Tiers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                    Agent Commission Tier Structure
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold">Tiered by Volume</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className={`p-3 rounded-xl border transition-all ${currentRate === 0.05 ? 'bg-zinc-800/80 border-rose-400' : 'bg-zinc-900/60 border-white/5'}`}>
                    <div className="text-[11px] text-zinc-400">{t('agent.tier1Title')}</div>
                    <div className="text-base font-extrabold text-white mt-0.5">{t('agent.tier1Rate')}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Starter Agency</div>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${currentRate === 0.08 ? 'bg-zinc-800/80 border-amber-400' : 'bg-zinc-900/60 border-white/5'}`}>
                    <div className="text-[11px] text-zinc-400">{t('agent.tier2Title')}</div>
                    <div className="text-base font-extrabold text-amber-400 mt-0.5">{t('agent.tier2Rate')}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Silver Partner</div>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all relative overflow-hidden ${currentRate === 0.10 ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-900/20' : 'bg-zinc-900/60 border-white/5'}`}>
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg text-white">
                      MAX
                    </div>
                    <div className="text-[11px] text-rose-300 font-semibold">{t('agent.tier3Title')}</div>
                    <div className="text-base font-extrabold text-rose-400 mt-0.5">{t('agent.tier3Rate')}</div>
                    <div className="text-[10px] text-rose-200/70 mt-1">Highest Industry Rate</div>
                  </div>
                </div>
              </div>

              {/* Commission Calculator Interactive Slider */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {t('agent.simulatorTitle')}
                  </span>
                  <span className="text-rose-400 font-bold">
                    {(currentRate * 100).toFixed(0)}% Payout Tier
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{t('agent.simulatorSpendLabel')}:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      {calcVolume.toLocaleString()} Coins
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="10000"
                    value={calcVolume}
                    onChange={(e) => setCalcVolume(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>10,000 Coins (5%)</span>
                    <span>100,000 Coins (8%)</span>
                    <span>200,000+ Coins (10%)</span>
                  </div>
                </div>

                {/* Profit Result Display */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/50 to-amber-950/40 border border-rose-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-zinc-300 font-medium">
                      {t('agent.simulatorEarnLabel')}
                    </div>
                    <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300">
                      +{estimatedProfit.toLocaleString()} Coins
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                      Weekly Bank Payout
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Benefits List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('agent.benefit1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('agent.benefit2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('agent.benefit3')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('agent.benefit4')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="pt-4 mt-2 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  onApplyWithSuperAdmin();
                  onClose();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:brightness-110 active:scale-[0.99] font-bold text-sm sm:text-base text-white shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>{t('agent.getStartedBtn')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleShareClick();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.99] border border-white/15 font-semibold text-xs text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t('agent.shareBtn')}</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-medium text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {t('agent.maybeLater')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
