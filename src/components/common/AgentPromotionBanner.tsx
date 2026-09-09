import React from 'react';
import {
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Award,
  ArrowRight,
  Sparkles,
  Rocket,
  CircleDollarSign,
  Coins,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  Headphones,
  Zap
} from 'lucide-react';
import { t, getAppLanguage } from '../../utils/i18n';
import { sound } from '../../utils/audio';

interface AgentPromotionBannerProps {
  variant?: 'landing' | 'profile' | 'dashboard' | 'compact';
  onContactAdmin: () => void;
  onOpenShareModal?: () => void;
  className?: string;
}

export const AgentPromotionBanner: React.FC<AgentPromotionBannerProps> = ({
  variant = 'landing',
  onContactAdmin,
  onOpenShareModal,
  className = ''
}) => {
  const currentLang = getAppLanguage();

  const handleApply = () => {
    sound.playCoinDrop();
    onContactAdmin();
  };

  const handleShare = () => {
    sound.playClick();
    if (onOpenShareModal) {
      onOpenShareModal();
    }
  };

  // Profile or Dashboard Card Variant
  if (variant === 'profile' || variant === 'dashboard') {
    return (
      <div
        id="dashboard-agent-recruitment-card"
        className={`relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#1C1427] via-[#161224] to-[#0D0B18] p-5 sm:p-6 shadow-[0_8px_32px_rgba(255,215,0,0.14)] text-white space-y-4 ${className}`}
      >
        {/* Ambient Golden & Neon Glow Accents */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br from-amber-500/25 to-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#FF2E93]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Badge Strip with Attractive Icons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>{t('agent.bannerBadge', currentLang)}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold flex items-center gap-1">
              <Rocket className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{t('agent.profitTitle', currentLang)}</span>
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-400" />
            <span>ID: AMX-AGENT-2026</span>
          </span>
        </div>

        {/* Title & Commission Highlight */}
        <div>
          <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 leading-snug flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-amber-400 shrink-0 inline-block" />
            <span>{t('agent.bannerTitle', currentLang)}</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
            {t('agent.bannerDesc', currentLang)}
          </p>
        </div>

        {/* Visual Profit Structure Tiers (Clearly Displayed) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-white/5 border border-amber-500/20 hover:border-amber-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">{t('agent.tier1Title', currentLang)}</span>
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black text-amber-300 mt-0.5">{t('agent.tier1Rate', currentLang)}</div>
            <div className="text-[9px] text-zinc-400 mt-0.5">Instant user top-up rebate</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-amber-500/30 hover:border-amber-400/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 uppercase font-bold">{t('agent.tier2Title', currentLang)}</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black text-amber-400 mt-0.5">{t('agent.tier2Rate', currentLang)}</div>
            <div className="text-[9px] text-zinc-400 mt-0.5">High volume partner tier</div>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-yellow-600/20 border border-amber-400/60 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg text-white">
              MAX TIER
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-yellow-300 uppercase font-black">{t('agent.tier3Title', currentLang)}</span>
            </div>
            <div className="text-base font-black text-yellow-300 mt-0.5">{t('agent.tier3Rate', currentLang)}</div>
            <div className="text-[9px] text-yellow-200/90 mt-0.5">200K+ Coins • VIP Shield</div>
          </div>
        </div>

        {/* Attractive Feature Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-300 pt-1">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{t('agent.benefit1', currentLang)}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <Rocket className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{t('agent.benefit2', currentLang)}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <Headphones className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{t('agent.benefit3', currentLang)}</span>
          </div>
        </div>

        {/* Dual Actions: Apply Now + Share App */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleApply}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>{t('agent.contactAdminBtn', currentLang)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenShareModal && (
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-400/30 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-rose-400" />
              <span>{t('agent.shareBtn', currentLang)}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Landing page prominent full-width banner
  return (
    <div
      id="landing-agent-recruitment-banner"
      className={`w-full relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-[#1C1427] via-[#1B162C] to-[#120F1F] p-6 sm:p-8 lg:p-10 shadow-[0_12px_45px_rgba(255,215,0,0.18)] text-white ${className}`}
    >
      {/* Background Ambience & Flare */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-[#FF1744]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Copy & Commission Structure with Attractive Icons */}
        <div className="space-y-4 max-w-2xl text-center lg:text-left">
          <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{t('agent.bannerBadge', currentLang)}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
              <Rocket className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{t('agent.profitTitle', currentLang)}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 leading-tight">
            {t('agent.bannerTitle', currentLang)}
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {t('agent.bannerDesc', currentLang)}
          </p>

          {/* Profit Badges with Attractive Icons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
            <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-2 shadow-sm">
              <CircleDollarSign className="w-4 h-4 text-amber-400" />
              <span>Earn Up to 10% On Every Top-Up</span>
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Agency Status</span>
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-rose-500/30 text-xs font-bold text-rose-300 flex items-center gap-2 shadow-sm">
              <Rocket className="w-4 h-4 text-rose-400" />
              <span>Instant Weekly Bank Transfers</span>
            </span>
          </div>
        </div>

        {/* Right Column: High-Converting Apply Action Card */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col items-center gap-3">
          <div className="w-full sm:w-72 p-5 rounded-3xl bg-black/60 border border-amber-500/40 backdrop-blur-md text-center shadow-xl space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Diamond Agency Tier
            </div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500">
              10% EARN
            </div>
            <div className="text-xs text-zinc-300 font-medium">Per User Coin Top-Up</div>
          </div>

          <div className="w-full flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <button
              id="landing-agent-apply-btn"
              onClick={handleApply}
              className="w-full px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-sm shadow-[0_0_25px_rgba(255,215,0,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>{t('agent.contactAdminBtn', currentLang)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenShareModal && (
              <button
                id="landing-agent-share-btn"
                onClick={handleShare}
                className="w-full px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-rose-400" />
                <span>{t('agent.shareBtn', currentLang)}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

