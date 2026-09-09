import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Award,
  DollarSign,
  TrendingUp,
  UserPlus,
  Send,
  Phone,
  MessageSquare,
  Mail,
  Copy,
  Check,
  Search,
  CheckCircle2,
  ChevronRight,
  Shield,
  Coins,
  ArrowLeft,
  Share2,
  Sliders,
  Sparkles,
  Zap,
  Globe,
  Video,
  Radio,
  Clock,
  Briefcase
} from 'lucide-react';
import {
  UserProfile,
  AgentInfo,
  AgentHostRecord,
  SubAgentRecord,
  AgentTopUpRecord,
  FinancialSettings
} from '../../types';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  getStoredAgentInfo,
  saveAgentInfo,
  getStoredAgentHosts,
  addAgentHost,
  getStoredSubAgents,
  addSubAgent,
  getStoredAgentTopUps,
  executeAgentUserTopUp,
  getAgentCommissionTier,
  getStoredFinancialSettings,
  getStoredRegisteredUsers
} from '../../utils/storage';

interface AgentDashboardProps {
  currentUser: UserProfile;
  onBack: () => void;
  onOpenSupportBot?: (ctx?: { source: string; query: string }) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  currentUser,
  onBack,
  onOpenSupportBot
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hosts' | 'subagents' | 'topup'>('overview');
  const [agentInfo, setAgentInfo] = useState<AgentInfo>(() => getStoredAgentInfo());
  const [hosts, setHosts] = useState<AgentHostRecord[]>(() => getStoredAgentHosts());
  const [subAgents, setSubAgents] = useState<SubAgentRecord[]>(() => getStoredSubAgents());
  const [topUps, setTopUps] = useState<AgentTopUpRecord[]>(() => getStoredAgentTopUps());
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>(() => getStoredFinancialSettings());

  // Registration & Info Modal
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<boolean>(false);
  const [formAgencyName, setFormAgencyName] = useState<string>(agentInfo.agencyName);
  const [formPhone, setFormPhone] = useState<string>(agentInfo.phone);
  const [formWhatsapp, setFormWhatsapp] = useState<string>(agentInfo.whatsapp);
  const [formTelegram, setFormTelegram] = useState<string>(agentInfo.telegram);
  const [formEmail, setFormEmail] = useState<string>(agentInfo.email);

  // Top-up form state
  const [targetUserIdInput, setTargetUserIdInput] = useState<string>('88492019');
  const [targetUserFound, setTargetUserFound] = useState<UserProfile | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-2');
  const [customCoinsInput, setCustomCoinsInput] = useState<string>('');
  const [isExecutingTopUp, setIsExecutingTopUp] = useState<boolean>(false);
  const [topUpFeedback, setTopUpFeedback] = useState<string>('');

  // Host binding state
  const [isAddHostOpen, setIsAddHostOpen] = useState<boolean>(false);
  const [newHostDisplayId, setNewHostDisplayId] = useState<string>('');
  const [newHostName, setNewHostName] = useState<string>('');
  const [hostFilter, setHostFilter] = useState<'all' | 'live' | 'active'>('all');

  // Sub-agent recruit state
  const [isAddSubAgentOpen, setIsAddSubAgentOpen] = useState<boolean>(false);
  const [newSubAgencyName, setNewSubAgencyName] = useState<string>('');
  const [newSubAgentContact, setNewSubAgentContact] = useState<string>('');

  // Calculator state
  const [calcVolumeCoins, setCalcVolumeCoins] = useState<number>(20000000);

  // Toast / Copy notification
  const [toastMessage, setToastMessage] = useState<string>('');

  // Commission Tier info
  const tier = getAgentCommissionTier(agentInfo.thirtyDayAchievementCoins);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync with storage events
  useEffect(() => {
    const handleInfoUpdate = (e: Event) => {
      const ce = e as CustomEvent<AgentInfo>;
      if (ce.detail) setAgentInfo(ce.detail);
    };
    const handleHostsUpdate = (e: Event) => {
      const ce = e as CustomEvent<AgentHostRecord[]>;
      if (ce.detail) setHosts(ce.detail);
    };
    const handleSubAgentsUpdate = (e: Event) => {
      const ce = e as CustomEvent<SubAgentRecord[]>;
      if (ce.detail) setSubAgents(ce.detail);
    };
    const handleTopUpsUpdate = (e: Event) => {
      const ce = e as CustomEvent<AgentTopUpRecord[]>;
      if (ce.detail) setTopUps(ce.detail);
    };
    const handleFinancialUpdate = (e: Event) => {
      const ce = e as CustomEvent<FinancialSettings>;
      if (ce.detail) setFinancialSettings(ce.detail);
    };

    window.addEventListener('amorex_agent_info_updated', handleInfoUpdate);
    window.addEventListener('amorex_agent_hosts_updated', handleHostsUpdate);
    window.addEventListener('amorex_subagents_updated', handleSubAgentsUpdate);
    window.addEventListener('amorex_agent_topups_updated', handleTopUpsUpdate);
    window.addEventListener('amorex_financial_settings_updated', handleFinancialUpdate);

    return () => {
      window.removeEventListener('amorex_agent_info_updated', handleInfoUpdate);
      window.removeEventListener('amorex_agent_hosts_updated', handleHostsUpdate);
      window.removeEventListener('amorex_subagents_updated', handleSubAgentsUpdate);
      window.removeEventListener('amorex_agent_topups_updated', handleTopUpsUpdate);
      window.removeEventListener('amorex_financial_settings_updated', handleFinancialUpdate);
    };
  }, []);

  // Look up target user for top-up
  useEffect(() => {
    if (!targetUserIdInput.trim()) {
      setTargetUserFound(null);
      return;
    }
    const registered = getStoredRegisteredUsers();
    const found = registered.find(
      (u) => u.displayId === targetUserIdInput.trim() || u.id === targetUserIdInput.trim()
    );
    setTargetUserFound(found || null);
  }, [targetUserIdInput]);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    sound.playClick();
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  // Save Agent Info
  const handleSaveAgentInfo = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const updated = saveAgentInfo({
      agencyName: formAgencyName.trim() || agentInfo.agencyName,
      phone: formPhone.trim(),
      whatsapp: formWhatsapp.trim(),
      telegram: formTelegram.trim(),
      email: formEmail.trim()
    });
    setAgentInfo(updated);
    setIsEditInfoOpen(false);
    showToast('✅ Agent Profile & Agency Info successfully updated!');
  };

  // Bind New Host
  const handleBindHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostDisplayId.trim()) {
      showToast('Please enter an 8-digit Host ID.');
      return;
    }
    sound.playClick();
    const newHost: AgentHostRecord = {
      id: `host-${Date.now()}`,
      name: newHostName.trim() || `Host ${newHostDisplayId.trim()}`,
      displayId: newHostDisplayId.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      monthlyHours: 0,
      dailyHours: 0,
      giftCoinsReceived: 0,
      status: 'active',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    addAgentHost(newHost);
    setIsAddHostOpen(false);
    setNewHostDisplayId('');
    setNewHostName('');
    showToast(`Talent ID ${newHost.displayId} successfully bound to agency!`);
  };

  // Recruit Sub-Agent
  const handleRecruitSubAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubAgencyName.trim()) {
      showToast('Please enter sub-agency name.');
      return;
    }
    sound.playClick();
    const newSub: SubAgentRecord = {
      id: `sub-${Date.now()}`,
      agencyName: newSubAgencyName.trim(),
      agentCode: `AG-${Math.floor(10000 + Math.random() * 90000)}`,
      contactName: newSubAgentContact.trim() || 'Agency Lead',
      level: 1,
      thirtyDayCoins: 0,
      commissionRatio: 0.04,
      referralCommissionEarned: 0,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    addSubAgent(newSub);
    setIsAddSubAgentOpen(false);
    setNewSubAgencyName('');
    setNewSubAgentContact('');
    showToast(`Sub-Agency "${newSub.agencyName}" onboarded! Code: ${newSub.agentCode}`);
  };

  // Execute Direct User Top-Up
  const handleExecuteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserIdInput.trim()) {
      showToast('Please enter a target user ID.');
      return;
    }

    const selectedPkg = financialSettings.packages.find((p) => p.id === selectedPackageId);
    let coins = selectedPkg ? selectedPkg.coins : 60000;
    let usd = selectedPkg ? selectedPkg.usd : 10;

    if (customCoinsInput.trim()) {
      const customCoins = Number(customCoinsInput);
      if (customCoins > 0) {
        coins = customCoins;
        usd = Number((coins / (financialSettings.baseCoinsPerDollar || 6000)).toFixed(2));
      }
    }

    sound.playJackpotFanfare();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    setIsExecutingTopUp(true);

    const result = executeAgentUserTopUp(targetUserIdInput.trim(), coins, usd);
    if (result.success) {
      setTopUpFeedback(result.message);
      showToast(result.message);
      setCustomCoinsInput('');
      setTimeout(() => {
        setTopUpFeedback('');
        setIsExecutingTopUp(false);
      }, 3000);
    } else {
      setIsExecutingTopUp(false);
      showToast(result.message);
    }
  };

  // Selected package details for calculation
  const currentSelectedPkg = financialSettings.packages.find((p) => p.id === selectedPackageId) || financialSettings.packages[0];
  const activeCoins = customCoinsInput ? Number(customCoinsInput) : (currentSelectedPkg?.coins || 60000);
  const activeUSD = customCoinsInput
    ? Number((Number(customCoinsInput) / (financialSettings.baseCoinsPerDollar || 6000)).toFixed(2))
    : (currentSelectedPkg?.usd || 10);
  const activeCommission = Number((activeUSD * tier.ratio).toFixed(2));

  // Filtered hosts
  const filteredHosts = hosts.filter((h) => {
    if (hostFilter === 'live') return h.status === 'live';
    if (hostFilter === 'active') return h.status === 'active';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080912] text-white flex flex-col relative pb-20">
      {/* Toast Bar */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-400 text-black font-black text-xs shadow-2xl flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP AGENCY HEADER */}
      <div className="bg-gradient-to-r from-[#12142B] via-[#1B1D3D] to-[#12142B] border-b border-amber-500/20 p-4 sm:p-5 sticky top-0 z-30 shadow-xl backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onBack();
              }}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer transition-colors shrink-0"
              title="Return"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-black flex items-center justify-center text-xl font-black shadow-[0_0_15px_#FFD700] shrink-0">
              🏢
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white">
                  {agentInfo.agencyName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[10px] font-black uppercase shadow-xs">
                  Level {tier.level} • {tier.percentage}% Ratio
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span className="font-mono text-amber-300 font-bold">Code: {agentInfo.agentCode}</span>
                <button
                  onClick={() => copyToClipboard(agentInfo.agentCode, 'Agency Code')}
                  className="text-gray-400 hover:text-white"
                  title="Copy Agent Code"
                >
                  <Copy size={12} />
                </button>
                <span>•</span>
                <button
                  onClick={() => setIsEditInfoOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Edit Agency Info
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Balance & Action */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="bg-black/40 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl text-right">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Agency Wallet</span>
              <span className="text-sm sm:text-base font-black text-amber-300 flex items-center justify-end gap-1">
                <Coins size={14} className="text-amber-400" />
                {agentInfo.walletCoins.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('topup');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:opacity-95 text-black font-black text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>Top-up Users</span>
            </button>
          </div>
        </div>

        {/* 4 MAIN PRODUCTION TABS */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar border-t border-white/5 pt-3">
          {[
            { id: 'overview', label: '📊 Overview & Commission', icon: Award },
            { id: 'hosts', label: `🎤 Hosts (${hosts.length})`, icon: Video },
            { id: 'subagents', label: `🤝 Sub-agents (${subAgents.length})`, icon: Users },
            { id: 'topup', label: '💳 Top-up Users & Ledger', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN BODY CONTENT */}
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & 6-LEVEL COMMISSION RATIO TIERS */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Key Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181A33] to-[#0D0F1F] border border-white/10">
                <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                  <span>30-Day Turnover</span>
                  <Coins size={14} className="text-amber-400" />
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-300 mt-1">
                  {agentInfo.thirtyDayAchievementCoins.toLocaleString()}
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">30-day coin achievement</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181A33] to-[#0D0F1F] border border-amber-500/30">
                <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                  <span>Commission Ratio</span>
                  <Award size={14} className="text-amber-400" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-1">
                  Level {tier.level} • <span className="text-amber-400">{tier.percentage}%</span>
                </div>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Active Tier Ratio</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181A33] to-[#0D0F1F] border border-white/10">
                <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                  <span>Total Earned</span>
                  <DollarSign size={14} className="text-emerald-400" />
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
                  ${agentInfo.totalEarnedCommissionUSD.toLocaleString()} USD
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">Cumulative agency profit</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181A33] to-[#0D0F1F] border border-white/10">
                <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                  <span>Total Distributed</span>
                  <Send size={14} className="text-cyan-400" />
                </div>
                <div className="text-lg sm:text-xl font-black text-cyan-300 mt-1">
                  {agentInfo.totalDistributedCoins.toLocaleString()}
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">Credited to users</span>
              </div>
            </div>

            {/* Next Tier Progress Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#111326] border border-amber-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-400" />
                    <span>Commission Tier Progress: Level {tier.level} ({tier.percentage}%)</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tier.nextThreshold
                      ? `Achieve ${(tier.nextThreshold).toLocaleString()} coins to unlock Level ${tier.level + 1} (${(tier.ratio + 0.04) * 100}% Ratio).`
                      : '🏆 Congratulations! You have reached the Maximum Level 6 (24% Ratio)!'}
                  </p>
                </div>

                {tier.nextThreshold && (
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400">Coins needed for Level {tier.level + 1}:</span>
                    <p className="text-sm font-black text-amber-300">
                      {tier.coinsNeededForNext.toLocaleString()} Coins
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full bg-black/60 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#FFD700]"
                  style={{ width: `${tier.progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                <span>Current: {agentInfo.thirtyDayAchievementCoins.toLocaleString()}</span>
                <span>{tier.progressPercent}% to next ratio</span>
                <span>Target: {tier.nextThreshold ? tier.nextThreshold.toLocaleString() : '500M+ MAX'}</span>
              </div>
            </div>

            {/* EXACT 6-LEVEL COMMISSION TIER RATIO SYSTEM TABLE */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#111326] border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                    <Award size={18} />
                    <span>Official 30-Day Achievement Commission Tier System</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Calculated based on rolling 30-day agency coin turnover and host gift volumes.
                  </p>
                </div>

                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold self-start sm:self-auto">
                  Automatic Live Settlement
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Tier Level</th>
                      <th className="py-2.5 px-3">30-Day Turnover Range</th>
                      <th className="py-2.5 px-3">Commission Ratio</th>
                      <th className="py-2.5 px-3">Gross Margin</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {[
                      { level: 1, range: '< 5,000,000 (< 5M)', ratio: '4% Ratio', margin: '4% on all top-ups' },
                      { level: 2, range: '5,000,000 (5M)', ratio: '8% Ratio', margin: '8% on all top-ups' },
                      { level: 3, range: '15,000,000 (15M)', ratio: '12% Ratio', margin: '12% on all top-ups' },
                      { level: 4, range: '50,000,000 (50M)', ratio: '16% Ratio', margin: '16% on all top-ups' },
                      { level: 5, range: '150,000,000 (150M)', ratio: '20% Ratio', margin: '20% on all top-ups' },
                      { level: 6, range: '500,000,000 (500M)', ratio: '24% Ratio', margin: '24% on all top-ups' }
                    ].map((row) => {
                      const isCurrent = tier.level === row.level;
                      return (
                        <tr
                          key={row.level}
                          className={`transition-colors ${
                            isCurrent
                              ? 'bg-amber-500/15 border-l-4 border-amber-400 text-white font-bold'
                              : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span>Level {row.level}</span>
                              {isCurrent && <CheckCircle2 size={14} className="text-amber-400" />}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-amber-200">{row.range} Coins</td>
                          <td className="py-3 px-3 font-black text-emerald-400">{row.ratio}</td>
                          <td className="py-3 px-3 text-gray-400">{row.margin}</td>
                          <td className="py-3 px-3 text-right">
                            {isCurrent ? (
                              <span className="bg-amber-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                                Active Tier
                              </span>
                            ) : tier.level > row.level ? (
                              <span className="text-[10px] text-emerald-400 font-bold">Achieved ✓</span>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-mono">Locked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Projected Earnings Calculator */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#13172E] to-[#0A0C1A] border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                    <Sliders size={16} />
                    <span>Interactive Agency Revenue & Commission Calculator</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Estimate monthly profit based on your projected coin volume distribution.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">Projected Monthly Coins:</span>
                  <span className="text-amber-400 font-mono font-black text-sm">
                    {calcVolumeCoins.toLocaleString()} Coins
                  </span>
                </div>
                <input
                  type="range"
                  min="2000000"
                  max="500000000"
                  step="2000000"
                  value={calcVolumeCoins}
                  onChange={(e) => setCalcVolumeCoins(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Calculated Earnings Details */}
              {(() => {
                const simulatedTier = getAgentCommissionTier(calcVolumeCoins);
                const simulatedUSD = calcVolumeCoins / (financialSettings.baseCoinsPerDollar || 6000);
                const projectedProfitUSD = simulatedUSD * simulatedTier.ratio;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Qualifying Tier</span>
                      <span className="text-sm font-black text-white mt-0.5">
                        Level {simulatedTier.level} ({simulatedTier.percentage}% Ratio)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Turnover ($ USD)</span>
                      <span className="text-sm font-black text-cyan-300 mt-0.5">
                        ${simulatedUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">Projected Agency Profit</span>
                      <span className="text-base font-black text-emerald-400 mt-0.5">
                        ${projectedProfitUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Share & Referral Link */}
            <div className="p-4 rounded-2xl bg-[#111326] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Share2 size={14} className="text-amber-400" />
                  <span>Agency Host & Sub-Agent Recruitment Link</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Share your official agency code to recruit streamers or sub-agents directly under your guild.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  readOnly
                  value={`https://amorex.app/join-agency?code=${agentInfo.agentCode}`}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono w-full sm:w-64 select-all"
                />
                <button
                  onClick={() =>
                    copyToClipboard(
                      `https://amorex.app/join-agency?code=${agentInfo.agentCode}`,
                      'Recruitment Link'
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-black font-black text-xs hover:bg-amber-300 cursor-pointer shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HOSTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'hosts' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Video size={18} className="text-pink-400" />
                  <span>Managed Stream Talents & Hosts ({hosts.length})</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Track live broadcast hours, gift revenues, and bind new talents using their 8-digit ID.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setHostFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      hostFilter === 'all' ? 'bg-white/20 text-white' : 'text-gray-400'
                    }`}
                  >
                    All ({hosts.length})
                  </button>
                  <button
                    onClick={() => setHostFilter('live')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      hostFilter === 'live' ? 'bg-rose-600 text-white' : 'text-gray-400'
                    }`}
                  >
                    Live Now ({hosts.filter((h) => h.status === 'live').length})
                  </button>
                </div>

                <button
                  onClick={() => setIsAddHostOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-95 text-white font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Bind New Host</span>
                </button>
              </div>
            </div>

            {/* Bind Host Modal */}
            <AnimatePresence>
              {isAddHostOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-[#141830] border border-pink-500/50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-black text-pink-300">
                      Bind Stream Talent to {agentInfo.agencyName}
                    </span>
                    <button
                      onClick={() => setIsAddHostOpen(false)}
                      className="text-gray-400 hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleBindHost} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Host 8-Digit Display ID</label>
                      <input
                        type="text"
                        required
                        value={newHostDisplayId}
                        onChange={(e) => setNewHostDisplayId(e.target.value)}
                        placeholder="e.g. 88204912"
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Host Stage Name</label>
                      <input
                        type="text"
                        value={newHostName}
                        onChange={(e) => setNewHostName(e.target.value)}
                        placeholder="e.g. Maya Star"
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs cursor-pointer shadow-md"
                      >
                        Confirm Contract Binding
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Host Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredHosts.map((host) => (
                <div
                  key={host.id}
                  className="p-4 rounded-2xl bg-[#111326] border border-white/10 hover:border-pink-500/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={host.avatar}
                        alt={host.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-white/15"
                      />
                      {host.status === 'live' && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[8px] font-black uppercase animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white">{host.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">ID: {host.displayId}</p>
                      <span className="text-[10px] text-gray-500 block">Joined {host.joinedAt}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Monthly Hours</span>
                      <span className="text-xs font-black text-cyan-300">{host.monthlyHours}h</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Gift Volume</span>
                      <span className="text-xs font-black text-amber-300">
                        {(host.giftCoinsReceived).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SUB-AGENTS NETWORK */}
        {/* ========================================================================= */}
        {activeTab === 'subagents' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-400" />
                  <span>Sub-Agencies & Guild Network ({subAgents.length})</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Earn multi-tier referral overrides on sub-agency coin turnovers.
                </p>
              </div>

              <button
                onClick={() => setIsAddSubAgentOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Onboard Sub-Agency</span>
              </button>
            </div>

            {/* Add Sub Agent Modal */}
            <AnimatePresence>
              {isAddSubAgentOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-[#16132E] border border-purple-500/50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-black text-purple-300">Register Sub-Agency Lead</span>
                    <button
                      onClick={() => setIsAddSubAgentOpen(false)}
                      className="text-gray-400 hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleRecruitSubAgent} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Sub-Agency Name</label>
                      <input
                        type="text"
                        required
                        value={newSubAgencyName}
                        onChange={(e) => setNewSubAgencyName(e.target.value)}
                        placeholder="e.g. Mumbai Spark Stars"
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Lead Contact Person</label>
                      <input
                        type="text"
                        value={newSubAgentContact}
                        onChange={(e) => setNewSubAgentContact(e.target.value)}
                        placeholder="e.g. Sameer Khan"
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black text-xs cursor-pointer shadow-md"
                      >
                        Generate Sub-Agency Code
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sub-agents Table */}
            <div className="p-4 rounded-2xl bg-[#111326] border border-white/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                    <th className="py-2.5 px-3">Sub-Agency</th>
                    <th className="py-2.5 px-3">Agent Code</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">30-Day Turnover</th>
                    <th className="py-2.5 px-3">Tier Ratio</th>
                    <th className="py-2.5 px-3 text-right">Referral Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subAgents.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/5">
                      <td className="py-3 px-3 font-bold text-white">{sub.agencyName}</td>
                      <td className="py-3 px-3 font-mono text-amber-300">{sub.agentCode}</td>
                      <td className="py-3 px-3 text-gray-300">{sub.contactName}</td>
                      <td className="py-3 px-3 font-mono text-cyan-300">
                        {sub.thirtyDayCoins.toLocaleString()} Coins
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black">
                          Level {sub.level} ({(sub.commissionRatio * 100).toFixed(0)}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400">
                        +${sub.referralCommissionEarned} USD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TOP-UP USERS & LEDGER */}
        {/* ========================================================================= */}
        {activeTab === 'topup' && (
          <div className="space-y-6">
            {/* Top-up Form Card */}
            <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-[#18152B] via-[#121124] to-[#0A0914] border border-amber-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                    <Send size={18} />
                    <span>Direct User Top-Up & Instant Commission Dispatch</span>
                  </h3>
                  <p className="text-xs text-gray-300">
                    Credit coins to user wallets directly. Earn your Level {tier.level} ({tier.percentage}%) commission instantly.
                  </p>
                </div>

                <div className="bg-black/50 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Your Commission Margin</span>
                  <span className="text-sm font-black text-emerald-400">{tier.percentage}% on every Dollar</span>
                </div>
              </div>

              <form onSubmit={handleExecuteTopUp} className="space-y-4">
                {/* Target User ID & Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Target User 8-Digit Display ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={targetUserIdInput}
                        onChange={(e) => setTargetUserIdInput(e.target.value)}
                        placeholder="e.g. 88492019"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold uppercase">
                        ID
                      </span>
                    </div>
                  </div>

                  {/* Target User Info Preview */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
                    {targetUserFound ? (
                      <>
                        <img
                          src={targetUserFound.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                          alt={targetUserFound.name}
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-white truncate">{targetUserFound.name}</h5>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              Verified
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">
                            Current Balance: {(targetUserFound.coins || 0).toLocaleString()} Coins
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 flex items-center gap-2 py-1">
                        <Search size={16} className="text-gray-500" />
                        <span>Enter 8-digit ID to verify registered user</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coin Packages Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Select Coin Package (Loaded from Dollar Pricing Settings)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {financialSettings.packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id && !customCoinsInput;
                      return (
                        <button
                          type="button"
                          key={pkg.id}
                          onClick={() => {
                            sound.playClick();
                            setSelectedPackageId(pkg.id);
                            setCustomCoinsInput('');
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_12px_rgba(255,215,0,0.3)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-emerald-400">${pkg.usd} USD</span>
                            {pkg.tag && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-black">
                                {pkg.tag}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-black text-amber-300 mt-1">
                            {pkg.coins.toLocaleString()} Coins
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Earns +${(pkg.usd * tier.ratio).toFixed(2)} USD Commission
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    Or Enter Custom Coin Amount
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={customCoinsInput}
                    onChange={(e) => setCustomCoinsInput(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
                  />
                </div>

                {/* Real-time Settlement Summary Box */}
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-gray-400">User will receive: </span>
                    <span className="text-amber-300 font-black text-sm">{activeCoins.toLocaleString()} Coins</span>
                    <span className="text-gray-400 ml-2 font-mono">(${activeUSD} USD)</span>
                  </div>

                  <div className="text-xs text-right">
                    <span className="text-emerald-400 font-bold">Your Instant Commission ({tier.percentage}%): </span>
                    <span className="text-emerald-300 font-black text-sm">+${activeCommission} USD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isExecutingTopUp}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:opacity-95 text-black font-black text-xs shadow-xl cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  <span>{isExecutingTopUp ? 'Executing Top-up...' : `Execute Top-up to User (${activeCoins.toLocaleString()} Coins)`}</span>
                </button>

                {topUpFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 size={16} />
                    <span>{topUpFeedback}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Agent Top-Up History Log */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#111326] border border-white/10 space-y-3">
              <h4 className="text-xs font-black uppercase text-gray-300">
                Agent Top-Up Settlement Ledger ({topUps.length})
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Target User</th>
                      <th className="py-2 px-3">Coins Transferred</th>
                      <th className="py-2 px-3">USD Amount</th>
                      <th className="py-2 px-3">Commission Earned</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {topUps.map((record) => (
                      <tr key={record.id} className="hover:bg-white/5">
                        <td className="py-2.5 px-3 text-gray-400 font-mono text-[10px]">
                          {new Date(record.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white block">{record.targetUserName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {record.targetUserDisplayId}</span>
                        </td>
                        <td className="py-2.5 px-3 font-black text-amber-300">
                          +{record.coinsTransferred.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-gray-300 font-mono">${record.amountUSD} USD</td>
                        <td className="py-2.5 px-3 font-black text-emerald-400">
                          +${record.commissionEarnedUSD} USD
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AGENT INFO REGISTRATION & EDIT DRAWER / MODAL */}
      <AnimatePresence>
        {isEditInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#12142B] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-amber-400" />
                  <h3 className="text-sm font-black text-white">Agency Registration & Official Profile</h3>
                </div>
                <button
                  onClick={() => setIsEditInfoOpen(false)}
                  className="text-gray-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAgentInfo} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Agency Name</label>
                  <input
                    type="text"
                    required
                    value={formAgencyName}
                    onChange={(e) => setFormAgencyName(e.target.value)}
                    placeholder="e.g. Amorex Star Agency"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">WhatsApp Contact</label>
                  <input
                    type="text"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Telegram Handle</label>
                  <input
                    type="text"
                    value={formTelegram}
                    onChange={(e) => setFormTelegram(e.target.value)}
                    placeholder="@amorex_agency"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="agency@amorex.com"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditInfoOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black cursor-pointer shadow-lg"
                  >
                    Save Agency Info
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
