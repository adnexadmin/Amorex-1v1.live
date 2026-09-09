import React, { useState } from 'react';
import { UserProfile, UTRRequest } from '../../types';
import { sound } from '../../utils/audio';
import { X, Sparkles, MessageSquare, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface RechargeModalProps {
  user: UserProfile;
  onClose: () => void;
  onSubmitUTR: (req: Omit<UTRRequest, 'id' | 'status' | 'timestamp'>) => void;
  onInstantCredit: (coins: number) => void;
  onOpenSupportBot?: () => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  user,
  onClose,
  onSubmitUTR,
  onInstantCredit,
  onOpenSupportBot
}) => {
  const [activeTab, setActiveTab] = useState<'tiers' | 'utr' | 'whatsapp'>('tiers');
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const pricingTiers = [
    { inr: 280, coins: 20000, bonus: 'Standard Pack', tag: 'Starter' },
    { inr: 700, coins: 55000, bonus: '+5,000 Free Coins', tag: 'Popular' },
    { inr: 1400, coins: 110000, bonus: '+10,000 Free Coins', tag: '🔥 Best Value' },
    { inr: 3500, coins: 300000, bonus: '+50,000 VIP Coins', tag: 'High Roller' },
    { inr: 11000, coins: 1000000, bonus: '10 Lakhs + 👑 Crown Badge', tag: '🏆 Mega VIP' }
  ];

  const handleInstantDemoPurchase = (tier: typeof pricingTiers[0]) => {
    sound.playCoinDrop();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    onInstantCredit(tier.coins);
    setSuccessMessage(`🎉 Successfully recharged +${tier.coins.toLocaleString()} Coins!`);
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1800);
  };

  const handleUTRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 8) {
      return;
    }
    sound.playClick();
    setIsSubmitting(true);

    const tier = pricingTiers[selectedTier];

    setTimeout(() => {
      onSubmitUTR({
        userId: user.id,
        userDisplayId: user.displayId,
        userName: user.name,
        amountINR: tier.inr,
        coinsExpected: tier.coins,
        utrNumber: utrNumber.trim()
      });
      setIsSubmitting(false);
      setSuccessMessage(`✅ UTR #${utrNumber} submitted! Verification will take 1-3 mins.`);
      setUtrNumber('');
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-[#14162B] border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFD700] to-[#FF2E93] flex items-center justify-center text-xl shadow-[0_0_12px_#FFD700]">
              🪙
            </div>
            <div>
              <h2 className="text-base font-black text-white">Wallet & Agent Coin Store</h2>
              <p className="text-xs text-amber-300 font-medium">
                Current Coins: {user.coins.toLocaleString()} • Gems: {user.gems.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex rounded-xl bg-black/40 p-1 my-3 border border-white/5">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tiers');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tiers'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-sm font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Instant Coin Packages
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('utr');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'utr'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-sm font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Submit UTR Receipt
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('whatsapp');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            WhatsApp Agent
          </button>
        </div>

        {successMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold text-center">
            {successMessage}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* TAB 1: Pricing Tiers Grid */}
          {activeTab === 'tiers' && (
            <div className="space-y-2.5">
              <p className="text-xs text-gray-400">
                Select your preferred coin package. Coins are instantly credited for 1v1 calls and party room games.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pricingTiers.map((tier, idx) => (
                  <button
                    key={tier.inr}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTier(idx);
                    }}
                    className={`p-3.5 rounded-2xl border text-left relative transition-all ${
                      selectedTier === idx
                        ? 'bg-gradient-to-b from-amber-500/20 to-yellow-900/30 border-amber-400 shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-102'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-300">{tier.tag}</span>
                      <span className="text-sm font-black text-amber-300">₹{tier.inr.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">🪙</span>
                      <span className="text-base font-black text-white">{tier.coins.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-pink-400 font-semibold mt-1">{tier.bonus}</p>

                    {/* Instant Purchase */}
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Direct Recharge</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstantDemoPurchase(tier);
                        }}
                        className="text-[10px] font-black bg-amber-400 hover:bg-amber-300 text-black px-2 py-1 rounded-lg"
                      >
                        Buy Now
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: UTR Receipt Submission */}
          {activeTab === 'utr' && (
            <form onSubmit={handleUTRSubmit} className="space-y-3 p-3 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Selected Package</label>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    ₹{pricingTiers[selectedTier].inr} INR → +{pricingTiers[selectedTier].coins.toLocaleString()} Coins
                  </span>
                  <span className="text-amber-400 font-semibold">{pricingTiers[selectedTier].tag}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  12-Digit UPI / UTR Transaction Reference ID
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 428190382910"
                  className="w-full bg-[#090A15] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-200">
                💡 Transfer via GPay / PhonePe / Paytm to Amorex Official Agent UPI: <strong className="text-white">amorexpay@upi</strong>, then enter the 12-digit UTR above.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <span className="animate-spin">⏳</span> : <Check size={14} />}
                <span>Submit UTR for Agent Approval</span>
              </button>
            </form>
          )}

          {/* TAB 3: WhatsApp Agent Portal */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto text-2xl shadow-lg">
                💬
              </div>
              <div>
                <h3 className="text-base font-black text-white">Official 24/7 WhatsApp Agent</h3>
                <p className="text-xs text-emerald-300 mt-1">
                  Instant coin recharges, Host agent onboarding, and VIP bonus discounts!
                </p>
              </div>

              <div className="p-3 bg-black/40 rounded-xl text-xs text-gray-300 font-mono text-left">
                <p>Support Agent: <strong>Amorex VIP Desk</strong></p>
                <p>WhatsApp: <strong>+91 98765 43210</strong></p>
                <p>Avg Response Time: <strong>&lt; 2 minutes</strong></p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSuccessMessage('📱 Redirecting to Official WhatsApp Agent Top-Up Channel...');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:scale-102 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Chat with WhatsApp Agent</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 gap-2 flex-wrap">
          <button
            onClick={() => {
              sound.playClick();
              onOpenSupportBot?.();
            }}
            className="flex items-center gap-1 text-cyan-300 font-bold hover:underline cursor-pointer"
          >
            <MessageSquare size={12} />
            <span>💬 Chat with Official Recharge Agent</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              100% Encrypted & Safe Payments
            </span>
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-white cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
