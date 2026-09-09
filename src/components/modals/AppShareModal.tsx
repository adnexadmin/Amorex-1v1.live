import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Send, 
  MessageCircle, 
  Twitter, 
  ExternalLink,
  ShieldCheck,
  Coins,
  Rocket
} from 'lucide-react';
import { t } from '../../utils/i18n';

interface AppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export const AppShareModal: React.FC<AppShareModalProps> = ({
  isOpen,
  onClose,
  referralCode = 'AGENT10'
}) => {
  const [copied, setCopied] = useState(false);

  // Derive dynamic share URL based on current origin
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://amorex.live';
  const shareUrl = `${baseUrl}/?ref=${referralCode}&promo=agent10`;

  const shareText = t('share.shareText', undefined, { link: shareUrl });

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Amorex & Earn 10% Commission',
          text: `Join Amorex! Become an Official Agent and earn up to 10% commission on top-ups.`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or failed
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Join Amorex! Become an Official Agent and earn up to 10% commission on top-ups.')}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-gradient-to-b from-rose-950/90 via-zinc-900 to-black border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white"
          >
            {/* Background Glow Accents */}
            <div className="absolute -top-24 -right-24 w-52 h-52 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    {t('share.title')}
                  </h3>
                  <p className="text-xs text-rose-300/80 font-medium">
                    {t('agent.bannerBadge')} • 10% Commission
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Preview Box */}
            <div className="my-5 space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Official Promotional Message
                  </span>
                  <span className="text-[11px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                    10% Payout
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans bg-black/40 p-3 rounded-xl border border-white/5 select-all">
                  {shareText}
                </p>
              </div>

              {/* Quick Perks Strip */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Coins className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-white">Up to 10%</p>
                  <p className="text-[9px] text-zinc-400">On Top-ups</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-white">Verified</p>
                  <p className="text-[9px] text-zinc-400">Agency Status</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Rocket className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-white">Weekly Pay</p>
                  <p className="text-[9px] text-zinc-400">Direct Bank</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Native Share button (if supported) */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:brightness-110 active:scale-[0.99] font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('share.nativeShareBtn')}
                  </button>
                )}

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.99] border border-white/15 font-semibold text-sm flex items-center justify-center gap-2 text-white transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{t('share.copySuccess')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('share.copyBtn')}</span>
                    </>
                  )}
                </button>

                {/* Social Share Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={handleWhatsAppShare}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {t('share.whatsappBtn')}
                  </button>

                  <button
                    onClick={handleTelegramShare}
                    className="py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {t('share.telegramBtn')}
                  </button>

                  <button
                    onClick={handleTwitterShare}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    {t('share.twitterBtn')}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer link to Agent Program */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Amorex Official Agency Network</span>
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                Earn 10% On Every Top-Up
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
