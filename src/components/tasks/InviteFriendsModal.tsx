import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Share2, Sparkles, MessageCircle, DollarSign, Gift, Users } from 'lucide-react';
import { sound } from '../../utils/audio';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  referralCode: string;
  onSimulateReferralSuccess: () => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  userId,
  referralCode,
  onSimulateReferralSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const inviteLink = `https://amorex.app/invite/${referralCode || userId}`;

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    sound.playClick();
    const text = encodeURIComponent(
      `Join Amorex Video & Party App with my referral code ${referralCode}! You will get 1,000 Free Gold Coins instantly! Download and register here: ${inviteLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    sound.playClick();
    const url = encodeURIComponent(inviteLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleTriggerSimulate = () => {
    setIsSimulating(true);
    sound.playClick();
    setTimeout(() => {
      setIsSimulating(false);
      onSimulateReferralSuccess();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-amber-950 via-gray-900 to-black rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 border-amber-500/50 text-white overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          
          <button 
            onClick={() => {
              sound.playClick();
              alert("Support Agent: For VIP agency queries, please contact admin@amorex.app or WhatsApp +91-9876543210.");
            }}
            className="text-xs font-extrabold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full cursor-pointer transition-colors"
          >
            Contact Us
          </button>
        </div>

        {/* Hero Title Matching Image 2 */}
        <div className="text-center mb-3">
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 bg-clip-text text-transparent drop-shadow-md">
            To be Agent To be Millionaire
          </h2>
          <div className="mt-2 inline-block bg-amber-500/20 border border-amber-400/40 rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-bold text-amber-200">
            Invitees top up $100, you can earn up to $20
          </div>
        </div>

        {/* Big Golden Treasure Chest Artwork & Banner */}
        <div className="relative my-3 flex flex-col items-center">
          <div className="w-32 h-28 sm:w-36 sm:h-32 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 rounded-3xl flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.5)] border-4 border-yellow-300 p-2">
            <span className="text-5xl sm:text-6xl animate-bounce">🪙</span>
          </div>
          {/* 3D Curved Banner */}
          <div className="-mt-4 z-10 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-1.5 rounded-full border-2 border-yellow-200 shadow-xl text-white font-black text-base sm:text-lg tracking-wider uppercase drop-shadow-md">
            Invite you friends
          </div>
        </div>

        {/* Commission & Reward Rules Box */}
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 sm:p-4 mb-4 text-center">
          <div className="text-xs sm:text-sm font-bold text-gray-200 mb-1">
            You will get up to <span className="text-amber-400 font-extrabold text-base">24%</span> commission rewards
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-500/20 text-[11px]">
            <div className="bg-black/40 p-2 rounded-xl border border-white/5">
              <span className="text-gray-400 block">Friend Registers</span>
              <span className="text-emerald-400 font-black text-xs">+1,000 🪙 For Friend</span>
            </div>
            <div className="bg-black/40 p-2 rounded-xl border border-white/5">
              <span className="text-gray-400 block">Your Referral Bonus</span>
              <span className="text-amber-300 font-black text-xs">+3,000 🪙 For You!</span>
            </div>
          </div>
        </div>

        {/* Section: Send to Friends */}
        <div className="mb-4">
          <div className="text-xs font-black uppercase text-amber-300 tracking-wider mb-2 text-center">
            Send to friends
          </div>

          {/* Yellow/Orange Copy Box Matching Reference Photo */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-3 sm:p-3.5 rounded-2xl shadow-lg border border-yellow-300/60 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 pr-1">
              <span className="text-[11px] font-extrabold text-amber-950 block">
                Copy the link & send to friends
              </span>
              <span className="text-[10px] font-mono text-white/95 truncate block font-bold">
                {inviteLink}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 bg-white hover:bg-yellow-50 text-amber-950 font-black text-xs rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleShareFacebook}
            className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 size={16} /> Facebook
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
        </div>

        {/* Quick Test / Instant Referral Simulator */}
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={handleTriggerSimulate}
            disabled={isSimulating}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg border border-emerald-400/40 flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles size={16} className="text-yellow-300" />
            <span>{isSimulating ? 'Registering friend...' : '⚡ Test Invite Friend (Earn +3,000 🪙)'}</span>
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-1">
            Simulates a friend clicking your link and completing registration.
          </p>
        </div>
      </div>
    </div>
  );
};
