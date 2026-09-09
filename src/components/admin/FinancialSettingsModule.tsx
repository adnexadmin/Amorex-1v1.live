import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign,
  Coins,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  Save,
  RefreshCw,
  TrendingUp,
  Award,
  ShieldCheck,
  Percent,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { FinancialSettings, CoinPricingPackage, UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  getStoredFinancialSettings,
  saveFinancialSettings,
  mintSuperAdminCoins,
  DEFAULT_FINANCIAL_SETTINGS
} from '../../utils/storage';

interface FinancialSettingsModuleProps {
  currentUser: UserProfile;
  onCoinsMinted?: (amount: number, newBalance: number) => void;
  showToast: (msg: string) => void;
}

export const FinancialSettingsModule: React.FC<FinancialSettingsModuleProps> = ({
  currentUser,
  onCoinsMinted,
  showToast
}) => {
  const [settings, setSettings] = useState<FinancialSettings>(() => getStoredFinancialSettings());
  const [baseCoinsPerDollar, setBaseCoinsPerDollar] = useState<number>(settings.baseCoinsPerDollar || 6000);
  const [packages, setPackages] = useState<CoinPricingPackage[]>(settings.packages || []);
  const [agentRebateEnabled, setAgentRebateEnabled] = useState<boolean>(settings.agentRebateEnabled ?? true);

  // Minting state
  const [mintAmount, setMintAmount] = useState<number>(5000000);
  const [customMintInput, setCustomMintInput] = useState<string>('5000000');
  const [mintNote, setMintNote] = useState<string>('Master Treasury Agency Batch');
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintSuccessMsg, setMintSuccessMsg] = useState<string>('');

  // Package editor modal / inline state
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [pkgUsd, setPkgUsd] = useState<number>(15);
  const [pkgCoins, setPkgCoins] = useState<number>(90000);
  const [pkgBonus, setPkgBonus] = useState<number>(10000);
  const [pkgLabel, setPkgLabel] = useState<string>('+10k Bonus Coins');
  const [pkgTag, setPkgTag] = useState<string>('Special Deal');
  const [isAddingNewPkg, setIsAddingNewPkg] = useState<boolean>(false);

  // Refresh settings when events trigger
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<FinancialSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        setBaseCoinsPerDollar(customEvent.detail.baseCoinsPerDollar);
        setPackages(customEvent.detail.packages);
        setAgentRebateEnabled(customEvent.detail.agentRebateEnabled);
      }
    };
    window.addEventListener('amorex_financial_settings_updated', handleUpdate);
    return () => window.removeEventListener('amorex_financial_settings_updated', handleUpdate);
  }, []);

  // Save all financial settings
  const handleSaveSettings = () => {
    sound.playClick();
    const updated: FinancialSettings = {
      ...settings,
      baseCoinsPerDollar,
      packages,
      agentRebateEnabled,
      updatedAt: Date.now()
    };
    saveFinancialSettings(updated);
    setSettings(updated);
    showToast('✅ Dollar pricing & financial rules successfully saved!');
  };

  // Quick preset apply
  const handleApplyPreset = (coinsPerUsd: number, presetName: string) => {
    sound.playClick();
    setBaseCoinsPerDollar(coinsPerUsd);
    // Recalculate package coin amounts proportionally based on new rate
    const updatedPkgs = packages.map((pkg) => ({
      ...pkg,
      coins: pkg.usd * coinsPerUsd
    }));
    setPackages(updatedPkgs);
    showToast(`Applied "${presetName}": $1 USD = ${coinsPerUsd.toLocaleString()} Coins`);
  };

  // Handle Mint Coins to Master Wallet
  const handleExecuteMint = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customMintInput) || mintAmount;
    if (amount <= 0) {
      showToast('Please enter a valid coin minting amount.');
      return;
    }

    sound.playJackpotFanfare();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    setIsMinting(true);

    const result = mintSuperAdminCoins(amount, currentUser.displayId, mintNote);
    if (result.success) {
      setMintSuccessMsg(`🎉 Successfully minted +${amount.toLocaleString()} Coins to Master Treasury!`);
      onCoinsMinted?.(amount, result.newBalance);
      showToast(`Master Treasury credited +${amount.toLocaleString()} Coins!`);
      setTimeout(() => {
        setMintSuccessMsg('');
        setIsMinting(false);
      }, 2500);
    } else {
      setIsMinting(false);
      showToast('Error minting coins to wallet.');
    }
  };

  // Delete package
  const handleDeletePackage = (id: string) => {
    sound.playClick();
    const updated = packages.filter((p) => p.id !== id);
    setPackages(updated);
  };

  // Save or Add package
  const handleSavePackage = () => {
    sound.playClick();
    if (isAddingNewPkg) {
      const newPkg: CoinPricingPackage = {
        id: `pkg-${Date.now()}`,
        usd: Number(pkgUsd) || 5,
        coins: Number(pkgCoins) || (Number(pkgUsd) || 5) * baseCoinsPerDollar,
        bonusCoins: Number(pkgBonus) || 0,
        bonusLabel: pkgLabel || undefined,
        tag: pkgTag || undefined
      };
      setPackages([...packages, newPkg]);
      setIsAddingNewPkg(false);
    } else if (editingPackageId) {
      const updated = packages.map((p) => {
        if (p.id === editingPackageId) {
          return {
            ...p,
            usd: Number(pkgUsd),
            coins: Number(pkgCoins),
            bonusCoins: Number(pkgBonus),
            bonusLabel: pkgLabel || undefined,
            tag: pkgTag || undefined
          };
        }
        return p;
      });
      setPackages(updated);
      setEditingPackageId(null);
    }
    showToast('Package updated! Click "Save Configuration" to persist.');
  };

  const startEditPackage = (pkg: CoinPricingPackage) => {
    sound.playClick();
    setEditingPackageId(pkg.id);
    setPkgUsd(pkg.usd);
    setPkgCoins(pkg.coins);
    setPkgBonus(pkg.bonusCoins || 0);
    setPkgLabel(pkg.bonusLabel || '');
    setPkgTag(pkg.tag || '');
    setIsAddingNewPkg(false);
  };

  const startAddNewPackage = () => {
    sound.playClick();
    setIsAddingNewPkg(true);
    setEditingPackageId(null);
    setPkgUsd(15);
    setPkgCoins(15 * baseCoinsPerDollar);
    setPkgBonus(5000);
    setPkgLabel('+5,000 Free Coins');
    setPkgTag('Hot');
  };

  return (
    <div className="space-y-6 text-white text-xs">
      {/* SECTION 1: MASTER COIN MINTING CARD */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#1F1706] via-[#140F03] to-[#0A0802] border-2 border-[#FFD700]/70 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-black flex items-center justify-center text-2xl font-black shadow-[0_0_15px_#FFD700]">
              🪙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-amber-300">
                  Master Coin Minting & Agency Treasury
                </h3>
                <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                Directly generate talk-time and gift coins into your master wallet to distribute to official agents.
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-amber-500/40 px-3.5 py-2 rounded-2xl shrink-0">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Treasury Balance</span>
            <span className="text-base font-black text-amber-300">
              {(currentUser.coins || 0).toLocaleString()} <span className="text-xs text-amber-400/80">Coins</span>
            </span>
          </div>
        </div>

        {/* Mint Form */}
        <form onSubmit={handleExecuteMint} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-amber-200 mb-1.5">
              Select Batch Mint Amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { amount: 1000000, label: '1,000,000 (1M)' },
                { amount: 5000000, label: '5,000,000 (5M)' },
                { amount: 10000000, label: '10,000,000 (10M)' },
                { amount: 50000000, label: '50,000,000 (50M)' },
                { amount: 100000000, label: '100,000,000 (100M)' }
              ].map((tier) => (
                <button
                  type="button"
                  key={tier.amount}
                  onClick={() => {
                    sound.playClick();
                    setMintAmount(tier.amount);
                    setCustomMintInput(tier.amount.toString());
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                    Number(customMintInput) === tier.amount
                      ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(255,215,0,0.5)]'
                      : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10'
                  }`}
                >
                  +{tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Custom Mint Amount (Coins)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={customMintInput}
                  onChange={(e) => setCustomMintInput(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full bg-[#080913] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3 top-2 text-[10px] text-amber-400/70 font-bold uppercase">
                  Coins
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Distribution Purpose / Note
              </label>
              <input
                type="text"
                value={mintNote}
                onChange={(e) => setMintNote(e.target.value)}
                placeholder="e.g. Agency Coin Allocation Batch #4"
                className="w-full bg-[#080913] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-gray-400">
              * Minted coins are verified on the Master Ledger and ready to be transferred to registered agents.
            </p>

            <button
              type="submit"
              disabled={isMinting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:opacity-95 text-black font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coins size={15} />
              <span>{isMinting ? 'Minting in Progress...' : 'Mint Coins to Master Wallet'}</span>
            </button>
          </div>

          {mintSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} />
              <span>{mintSuccessMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* SECTION 2: DYNAMIC DOLLAR PRICING ($ USD) CONFIGURATION */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#111322] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-400" />
              <span>Dynamic Dollar ($ USD) Coin Pricing Engine</span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Set how many coins users and agents receive per Dollar ($ USD). All storefront packages dynamically calculate from this base rate.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Save size={14} />
            <span>Save Configuration</span>
          </button>
        </div>

        {/* Base Rate Slider and Presets */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Base Conversion Ratio
              </span>
              <div className="text-xl font-black text-white mt-0.5">
                $1.00 USD = <span className="text-amber-400">{baseCoinsPerDollar.toLocaleString()} Coins</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-400 font-bold">Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset(6000, 'Standard ($1=6k)')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-gray-200"
              >
                Standard (6k)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(7500, 'Competitive ($1=7.5k)')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-cyan-300"
              >
                Competitive (7.5k)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(10000, 'Holiday Promo ($1=10k)')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-bold text-amber-300 border border-amber-500/30"
              >
                Promo (10k)
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>3,000 Coins / $</span>
              <span>Selected: {baseCoinsPerDollar.toLocaleString()} Coins / $</span>
              <span>15,000 Coins / $</span>
            </div>
            <input
              type="range"
              min="3000"
              max="15000"
              step="500"
              value={baseCoinsPerDollar}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBaseCoinsPerDollar(val);
                // Update packages
                setPackages((prev) =>
                  prev.map((p) => ({
                    ...p,
                    coins: p.usd * val
                  }))
                );
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Dynamic Example Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center">
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-[10px] text-gray-400 block">$5 USD</span>
              <span className="text-xs font-black text-amber-300">
                {(5 * baseCoinsPerDollar).toLocaleString()} Coins
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-[10px] text-gray-400 block">$10 USD</span>
              <span className="text-xs font-black text-amber-300">
                {(10 * baseCoinsPerDollar).toLocaleString()} Coins
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-[10px] text-gray-400 block">$50 USD</span>
              <span className="text-xs font-black text-amber-300">
                {(50 * baseCoinsPerDollar).toLocaleString()} Coins
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-[10px] text-gray-400 block">$100 USD</span>
              <span className="text-xs font-black text-amber-300">
                {(100 * baseCoinsPerDollar).toLocaleString()} Coins
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: STOREFRONT PACKAGES LIST & MANAGER */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase text-gray-300">
                Active Storefront Dollar Packages ({packages.length})
              </h4>
              <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                Real-time Sync
              </span>
            </div>

            <button
              onClick={startAddNewPackage}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Custom Package</span>
            </button>
          </div>

          {/* Package Editor Drawer / Card */}
          <AnimatePresence>
            {(isAddingNewPkg || editingPackageId) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-[#1A1C30] border border-amber-400/50 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-black text-amber-300">
                    {isAddingNewPkg ? 'Create New Coin Package' : 'Edit Coin Package'}
                  </span>
                  <button
                    onClick={() => {
                      setIsAddingNewPkg(false);
                      setEditingPackageId(null);
                    }}
                    className="text-gray-400 hover:text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Price ($ USD)</label>
                    <input
                      type="number"
                      min="1"
                      value={pkgUsd}
                      onChange={(e) => {
                        const usd = Number(e.target.value);
                        setPkgUsd(usd);
                        setPkgCoins(usd * baseCoinsPerDollar);
                      }}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Base Coins</label>
                    <input
                      type="number"
                      value={pkgCoins}
                      onChange={(e) => setPkgCoins(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Bonus Coins</label>
                    <input
                      type="number"
                      value={pkgBonus}
                      onChange={(e) => setPkgBonus(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Bonus Label</label>
                    <input
                      type="text"
                      value={pkgLabel}
                      onChange={(e) => setPkgLabel(e.target.value)}
                      placeholder="+5k Free Coins"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={pkgTag}
                      onChange={(e) => setPkgTag(e.target.value)}
                      placeholder="Popular"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={handleSavePackage}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-black font-black text-xs hover:bg-amber-300 cursor-pointer"
                  >
                    Apply to List
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid of Packages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-2 relative group"
              >
                {pkg.tag && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-black shadow-xs">
                    {pkg.tag}
                  </span>
                )}

                <div>
                  <div className="text-lg font-black text-emerald-400 flex items-center">
                    <span>${pkg.usd}</span>
                    <span className="text-[10px] text-gray-400 ml-1 font-normal">USD</span>
                  </div>

                  <div className="text-base font-black text-amber-300 mt-1">
                    {pkg.coins.toLocaleString()}{' '}
                    <span className="text-[10px] text-amber-400/80 font-bold">Coins</span>
                  </div>

                  {pkg.bonusCoins && pkg.bonusCoins > 0 ? (
                    <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                      +{pkg.bonusCoins.toLocaleString()} Bonus ({pkg.bonusLabel || 'Free'})
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 block mt-0.5">Standard Pack</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-400 font-mono">
                    ~{(pkg.coins / pkg.usd).toFixed(0)} coins/$
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditPackage(pkg)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white"
                      title="Edit package"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                      title="Delete package"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Agent Rebate Toggle */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Percent size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Official Agency Commission Engine</p>
              <p className="text-[10px] text-gray-400">
                Enables automatic 4% to 24% tiered commission calculation on all agent user top-ups.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setAgentRebateEnabled(!agentRebateEnabled);
            }}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              agentRebateEnabled ? 'bg-emerald-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                agentRebateEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
