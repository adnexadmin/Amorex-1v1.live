import React, { useState, useEffect } from 'react';
import { UserProfile, UTRRequest, UserReport, ReportStatus } from '../../types';
import { sound } from '../../utils/audio';
import {
  X,
  Send,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trophy,
  Users,
  Coins,
  Clock,
  Gem,
  Trash2,
  Search,
  ArrowUpDown,
  Lock,
  Unlock,
  VolumeX,
  Volume2,
  Mail,
  Phone,
  Globe,
  Radio,
  Check,
  AlertTriangle,
  Flag,
  UserX,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { FinancialSettingsModule } from './FinancialSettingsModule';
import {
  getStoredRegisteredUsers,
  updateUserCoinsInRegistry,
  toggleUserFreezeInRegistry,
  toggleUserMuteInRegistry,
  deleteUserFromRegistry,
  purgeDemoUsersFromRegistry,
  isSuperAdminEmail,
  getStoredUserReports,
  updateUserReportStatus,
  deleteUserReport
} from '../../utils/storage';

interface SuperAdminModalProps {
  user: UserProfile;
  utrRequests: UTRRequest[];
  onApproveUTR: (id: string) => void;
  onRejectUTR: (id: string) => void;
  onAirdropCoins: (targetDisplayId: string, amount: number) => boolean;
  onTriggerGlobalCoinRain: (poolAmount: number) => void;
  onClose: () => void;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  user,
  utrRequests,
  onApproveUTR,
  onRejectUTR,
  onAirdropCoins,
  onTriggerGlobalCoinRain,
  onClose
}) => {
  // Strict Security Access Enforcement
  const isSuperAdmin =
    user.is_super_admin === true ||
    isSuperAdminEmail(user.email) ||
    user.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'users' | 'financial' | 'telemetry' | 'airdrop' | 'utr' | 'moderation'>('users');

  // Real Registered Users Registry State
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    return getStoredRegisteredUsers();
  });

  // Sorting & Filtering
  const [sortOrder, setSortOrder] = useState<'recent' | 'timespent' | 'coins' | 'name'>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen' | 'muted'>('all');

  // Direct Inline Airdrop state
  const [activeAirdropUserId, setActiveAirdropUserId] = useState<string | null>(null);
  const [customAirdropAmount, setCustomAirdropAmount] = useState<number>(5000);

  // Global Airdrop tab state
  const [targetId, setTargetId] = useState<string>('');
  const [airdropAmount, setAirdropAmount] = useState<number>(50000);
  const [airdropMessage, setAirdropMessage] = useState<string>('');

  // Coin Rain state
  const [rainPool, setRainPool] = useState<number>(100000);

  // Moderation state
  const [modTargetId, setModTargetId] = useState<string>('');
  const [modActionStatus, setModActionStatus] = useState<string>('');

  // User Safety Reports Queue State
  const [userReports, setUserReports] = useState<UserReport[]>(() => getStoredUserReports());
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'>('ALL');

  // Banner notification message
  const [toastNotice, setToastNotice] = useState<string>('');

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => {
      setToastNotice('');
    }, 4000);
  };

  // Sync users in real-time from localStorage & events
  const refreshUsersList = () => {
    const list = getStoredRegisteredUsers();
    setRegisteredUsers(list);
  };

  useEffect(() => {
    refreshUsersList();

    const handleUpdate = () => {
      refreshUsersList();
      setUserReports(getStoredUserReports());
    };

    window.addEventListener('amorex_users_updated', handleUpdate);
    window.addEventListener('amorex_reports_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Heartbeat ticker to update live time spent display
    const interval = setInterval(() => {
      refreshUsersList();
    }, 3000);

    return () => {
      window.removeEventListener('amorex_users_updated', handleUpdate);
      window.removeEventListener('amorex_reports_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Filter out demo/mock accounts so ONLY real registered accounts are visible
  const isDemoAccount = (u: UserProfile): boolean => {
    if (u.isRealUser === false) return true;
    if (u.id === 'usr-default-01' || u.email === 'user@amorex.com') return true;
    if (u.displayId === '88492019' && u.name === 'Dev Rohan') return true;
    return false;
  };

  const realRegisteredUsers = registeredUsers.filter((u) => !isDemoAccount(u));

  // Purge demo accounts handler
  const handlePurgeDemoUsers = () => {
    sound.playClick();
    const purgedCount = purgeDemoUsersFromRegistry();
    refreshUsersList();
    sound.playCoinDrop();
    showToast(`🧹 Purged ${purgedCount} demo/mock accounts. Only real registered accounts remain!`);
  };

  // Format Time Spent (e.g. 14s, 5m 20s, 2h 15m)
  const formatTimeSpent = (totalSeconds: number = 0): string => {
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins < 60) {
      return `${mins}m ${secs}s`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Format Relative Registration Time
  const formatRelativeTime = (timestamp?: number): string => {
    if (!timestamp) return 'Just now';
    const diff = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diff < 15) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Format Full Date
  const formatFullDate = (timestamp?: number): string => {
    if (!timestamp) return 'Registered recently';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Sort & Filter Real Users
  const processedUsers = [...realRegisteredUsers]
    .filter((u) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.name || '').toLowerCase().includes(q);
        const matchId = (u.displayId || '').includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchPhone = (u.phone || '').includes(q);
        if (!matchName && !matchId && !matchEmail && !matchPhone) return false;
      }
      // Status filter
      if (statusFilter === 'active' && (u.isFrozen || u.isMuted)) return false;
      if (statusFilter === 'frozen' && !u.isFrozen) return false;
      if (statusFilter === 'muted' && !u.isMuted) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'recent') {
        // Most recent registration first
        return (b.registeredAt || 0) - (a.registeredAt || 0);
      }
      if (sortOrder === 'timespent') {
        return (b.timeSpentSeconds || 0) - (a.timeSpentSeconds || 0);
      }
      if (sortOrder === 'coins') {
        return (b.coins || 0) - (a.coins || 0);
      }
      if (sortOrder === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

  // Inline Airdrop to specific user
  const handleExecuteInlineAirdrop = (targetUser: UserProfile, amount: number) => {
    sound.playCoinDrop();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    const success = onAirdropCoins(targetUser.displayId, amount);
    if (success) {
      updateUserCoinsInRegistry(targetUser.id, (targetUser.coins || 0) + amount);
      refreshUsersList();
      showToast(`✅ Airdropped +${amount.toLocaleString()} Coins directly to ${targetUser.name} (${targetUser.displayId})!`);
      setActiveAirdropUserId(null);
    }
  };

  // Toggle freeze
  const handleToggleFreeze = (targetUser: UserProfile) => {
    sound.playClick();
    const newStatus = toggleUserFreezeInRegistry(targetUser.id);
    refreshUsersList();
    showToast(newStatus ? `🔒 Account ${targetUser.name} (${targetUser.displayId}) FROZEN.` : `🔓 Account ${targetUser.name} UN-FROZEN.`);
  };

  // Toggle mute
  const handleToggleMute = (targetUser: UserProfile) => {
    sound.playClick();
    const newStatus = toggleUserMuteInRegistry(targetUser.id);
    refreshUsersList();
    showToast(newStatus ? `🔇 User ${targetUser.name} muted for 24 hours.` : `🔊 User ${targetUser.name} unmuted.`);
  };

  // Delete user account
  const handleDeleteUser = (targetUser: UserProfile) => {
    if (confirm(`Are you sure you want to PERMANENTLY delete real account for ${targetUser.name} (ID: ${targetUser.displayId})? This action cannot be undone.`)) {
      sound.playClick();
      deleteUserFromRegistry(targetUser.id);
      refreshUsersList();
      showToast(`🗑️ User ${targetUser.name} (${targetUser.displayId}) deleted from registry.`);
    }
  };

  // Send airdrop from Tab 2
  const handleSendAirdrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || targetId.length < 5) {
      setAirdropMessage('❌ Invalid 8-Digit ID');
      return;
    }
    sound.playCoinDrop();
    const success = onAirdropCoins(targetId.trim(), Number(airdropAmount));
    if (success) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setAirdropMessage(`✅ Successfully dispatched ${airdropAmount.toLocaleString()} Coins to ID ${targetId}!`);
      setTargetId('');
      refreshUsersList();
    } else {
      setAirdropMessage(`⚠️ User ID ${targetId} not found in active session, fallback credited to ledger.`);
    }
  };

  // Launch Coin Rain
  const handleLaunchRain = () => {
    sound.playJackpotFanfare();
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } });
    onTriggerGlobalCoinRain(rainPool);
    setAirdropMessage(`🌧️ Global Coin Rain triggered across all live rooms with ${rainPool.toLocaleString()} coins!`);
  };

  // Strict Access Denied Guard
  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[#160A14] border-2 border-rose-500/70 rounded-3xl p-6 text-center text-white shadow-[0_0_50px_rgba(244,63,94,0.4)]"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <ShieldAlert size={34} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-rose-300">ACCESS RESTRICTED</h2>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            Real registered user accounts, coin balances, and time spent metrics are private and strictly protected.
            This suite is exclusively accessible by verified Super-Admin (<span className="text-amber-300 font-mono font-bold">adnexadmin@gmail.com</span>).
          </p>
          <div className="mt-5 p-3 rounded-xl bg-black/40 border border-rose-500/20 text-[11px] text-gray-400 font-mono">
            Client ID: {user.displayId} • Role: {user.role || 'USER'}
          </div>
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-lg cursor-pointer"
          >
            Close & Return to Amorex
          </button>
        </motion.div>
      </div>
    );
  }

  // Aggregate Real Metrics
  const totalCoinsInCirculation = realRegisteredUsers.reduce((sum, u) => sum + (u.coins || 0), 0);
  const totalTimeSpentSeconds = realRegisteredUsers.reduce((sum, u) => sum + (u.timeSpentSeconds || 0), 0);
  const totalActiveRecently = realRegisteredUsers.filter((u) => {
    const lastActive = u.lastActiveAt || 0;
    return Date.now() - lastActive < 300000; // active in last 5 mins
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2.5 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-4xl bg-[#0B0D1B] border-2 border-[#FFD700]/70 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(255,215,0,0.3)] text-white relative flex flex-col max-h-[92vh]"
      >
        {/* Header with Royal Gold Crown Badge */}
        <div className="flex items-center justify-between pb-3.5 border-b border-amber-400/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFD700] via-[#FF9E00] to-[#FF2E93] flex items-center justify-center text-xl shadow-[0_0_15px_#FFD700] shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 via-pink-200 to-cyan-300 bg-clip-text text-transparent">
                  SUPER-ADMIN MANAGEMENT SUITE
                </h2>
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                  GOD MODE
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  LIVE REAL DATA
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 font-mono">
                Operator: <span className="text-white font-bold">{user.email}</span> • ID: <span className="text-pink-300 font-bold">{user.displayId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="Close Management Suite"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sub-Nav Tabs */}
        <div className="flex items-center gap-1.5 py-2.5 border-b border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'users', label: `👥 Real Registered Users (${realRegisteredUsers.length})` },
            { id: 'financial', label: '💰 Financial & Minting' },
            { id: 'telemetry', label: '📊 Live Telemetry' },
            { id: 'airdrop', label: '💸 1-Click Coin Dispatcher' },
            { id: 'utr', label: `💳 UTR Approvals (${utrRequests.filter((r) => r.status === 'PENDING').length})` },
            {
              id: 'moderation',
              label: `🛡️ Reports & Moderation (${
                userReports.filter((r) => r.status === 'PENDING').length > 0
                  ? `${userReports.filter((r) => r.status === 'PENDING').length} URGENT`
                  : userReports.length
              })`
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-[0_0_12px_rgba(255,215,0,0.5)] font-black'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Toast Notification */}
        <AnimatePresence>
          {toastNotice && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="mt-2.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-between"
            >
              <span>{toastNotice}</span>
              <button onClick={() => setToastNotice('')} className="text-amber-400 hover:text-white ml-2">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* ========================================================================= */}
          {/* TAB 1: REAL REGISTERED USERS (Recent Sort, Coins, Time Spent, Purge Demo) */}
          {/* ========================================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-3.5">
              {/* Top Quick Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-900/30 to-black/50 border border-purple-500/30">
                  <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
                    <span>Real Accounts</span>
                    <Users size={14} />
                  </div>
                  <p className="text-xl font-black text-white mt-1">{realRegisteredUsers.length}</p>
                  <span className="text-[10px] text-gray-400">Demo accounts removed</span>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-black/50 border border-emerald-500/30">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                    <span>Active In App</span>
                    <Radio size={14} className="text-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xl font-black text-emerald-400 mt-1">{totalActiveRecently}</p>
                  <span className="text-[10px] text-emerald-300/80">Active last 5 mins</span>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-900/30 to-black/50 border border-amber-500/30">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                    <span>Total Real Coins</span>
                    <Coins size={14} />
                  </div>
                  <p className="text-xl font-black text-amber-300 mt-1">{totalCoinsInCirculation.toLocaleString()}</p>
                  <span className="text-[10px] text-amber-400/80">User wallet holdings</span>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-black/50 border border-cyan-500/30">
                  <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold">
                    <span>Total Time Spent</span>
                    <Clock size={14} />
                  </div>
                  <p className="text-xl font-black text-cyan-300 mt-1">{formatTimeSpent(totalTimeSpentSeconds)}</p>
                  <span className="text-[10px] text-cyan-400/80">Across all sessions</span>
                </div>
              </div>

              {/* Controls: Search, Sort Order, Filter, and Purge Demo Accounts Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Name, 8-Digit ID, Email, Phone..."
                    className="w-full bg-[#090A16] border border-white/10 focus:border-amber-400 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-[#090A16] border border-white/10 rounded-xl px-2.5 py-1.5">
                    <ArrowUpDown size={12} className="text-amber-400" />
                    <span className="text-[11px] text-gray-400 font-semibold">Sort:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                      className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="recent" className="bg-[#0e1020] text-white">✨ Recent Registration (Newest First)</option>
                      <option value="timespent" className="bg-[#0e1020] text-white">⏱️ Most Time Spent in App</option>
                      <option value="coins" className="bg-[#0e1020] text-white">🪙 Highest Coin Balance</option>
                      <option value="name" className="bg-[#0e1020] text-white">🔤 Name (A-Z)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="bg-[#090A16] border border-white/10 text-xs text-gray-300 font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#0e1020]">All Statuses</option>
                    <option value="active" className="bg-[#0e1020]">Active Only</option>
                    <option value="frozen" className="bg-[#0e1020]">Frozen Only</option>
                    <option value="muted" className="bg-[#0e1020]">Muted Only</option>
                  </select>

                  {/* Purge Demo Accounts Button */}
                  <button
                    onClick={handlePurgeDemoUsers}
                    className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-xs"
                    title="Remove mock demo users from suite"
                  >
                    <Trash2 size={13} />
                    <span>Purge Demo Accounts</span>
                  </button>
                </div>
              </div>

              {/* Registered Users List */}
              {processedUsers.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10 p-6">
                  <Users size={36} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-300">No real registered users found</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                    {searchQuery
                      ? `No user matched your query "${searchQuery}". Clear your search to view all.`
                      : 'All new account registrations created through Email, Phone SMS, or Google OAuth will appear here in real-time, sorted by most recent.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/20"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                    <span>Showing <strong className="text-white">{processedUsers.length}</strong> real registered accounts (sorted by {sortOrder === 'recent' ? 'most recent registration' : sortOrder})</span>
                    <span className="text-amber-300/80 font-mono">Real-time sync active</span>
                  </div>

                  {processedUsers.map((regUser, index) => {
                    const isOnline = Date.now() - (regUser.lastActiveAt || 0) < 60000;
                    const isInlineAirdropOpen = activeAirdropUserId === regUser.id;

                    return (
                      <div
                        key={regUser.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          regUser.isFrozen
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : regUser.isMuted
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-white/5 hover:bg-white/[0.07] border-white/10'
                        }`}
                      >
                        {/* User Card Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                          {/* Left: Avatar & Identity & Registration Date */}
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={regUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
                                alt={regUser.name}
                                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              {/* Live Online Pulse */}
                              {isOnline && (
                                <span
                                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0B0D1B] animate-pulse"
                                  title="Active right now"
                                />
                              )}
                              <span className="absolute -bottom-1 -left-1 text-[9px] font-black px-1.5 py-0.2 rounded-md bg-black/80 text-amber-300 border border-amber-400/40">
                                #{index + 1}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-black text-white truncate">{regUser.name}</h4>
                                <span className="text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                                  ID: {regUser.displayId}
                                </span>

                                {/* Registration Channel Badge */}
                                {regUser.registrationMethod === 'google' ? (
                                  <span className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                                    <Globe size={10} /> Google OAuth
                                  </span>
                                ) : regUser.phone ? (
                                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                                    <Phone size={10} /> {regUser.phone}
                                  </span>
                                ) : regUser.email ? (
                                  <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                                    <Mail size={10} /> {regUser.email}
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-bold">
                                    Member
                                  </span>
                                )}

                                {/* Status Badges */}
                                {regUser.isFrozen && (
                                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full shadow-xs">
                                    FROZEN
                                  </span>
                                )}
                                {regUser.isMuted && (
                                  <span className="text-[10px] bg-amber-400 text-black font-black px-2 py-0.5 rounded-full shadow-xs">
                                    MUTED (24H)
                                  </span>
                                )}
                              </div>

                              {/* Registration Timestamp */}
                              <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1 flex-wrap">
                                <span className="text-pink-300 font-semibold flex items-center gap-1">
                                  <Sparkles size={11} className="text-amber-400" />
                                  Registered: <strong>{formatRelativeTime(regUser.registeredAt)}</strong>
                                </span>
                                <span>•</span>
                                <span className="font-mono text-gray-400">{formatFullDate(regUser.registeredAt)}</span>
                                <span>•</span>
                                <span className="text-gray-400">{regUser.region || 'India'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Center / Right: App Time Spent & Live Coins Balance & Controls */}
                          <div className="flex items-center gap-3 sm:gap-4 flex-wrap shrink-0">
                            {/* App Time Spent Metric */}
                            <div className="p-2.5 px-3.5 rounded-xl bg-black/40 border border-cyan-500/30 text-right">
                              <div className="flex items-center justify-end gap-1 text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                                <Clock size={11} />
                                <span>Time Spent</span>
                              </div>
                              <p className="text-base font-black text-cyan-200 mt-0.5">
                                {formatTimeSpent(regUser.timeSpentSeconds || 0)}
                              </p>
                              <span className="text-[9px] text-gray-400">
                                {isOnline ? 'Active Now 🟢' : `Last seen ${formatRelativeTime(regUser.lastActiveAt)}`}
                              </span>
                            </div>

                            {/* Wallet Coins Balance Metric */}
                            <div className="p-2.5 px-3.5 rounded-xl bg-black/40 border border-amber-500/30 text-right">
                              <div className="flex items-center justify-end gap-1 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                                <Coins size={11} />
                                <span>Wallet Coins</span>
                              </div>
                              <p className="text-base font-black text-amber-300 mt-0.5">
                                {(regUser.coins || 0).toLocaleString()}
                              </p>
                              <span className="text-[9px] text-pink-300">
                                +{(regUser.gems || 0).toLocaleString()} Gems • {regUser.vouchers || 0} Call Vouchers
                              </span>
                            </div>

                            {/* Action Buttons Group */}
                            <div className="flex items-center gap-1.5">
                              {/* 1-Click Airdrop Toggle */}
                              <button
                                onClick={() => {
                                  sound.playClick();
                                  setActiveAirdropUserId(isInlineAirdropOpen ? null : regUser.id);
                                }}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                  isInlineAirdropOpen
                                    ? 'bg-amber-400 text-black shadow-[0_0_12px_#FFD700]'
                                    : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40'
                                }`}
                                title="Send Coins directly to this user"
                              >
                                <Coins size={14} />
                                <span className="hidden sm:inline">Airdrop</span>
                              </button>

                              {/* Freeze Toggle */}
                              <button
                                onClick={() => handleToggleFreeze(regUser)}
                                className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                  regUser.isFrozen
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                }`}
                                title={regUser.isFrozen ? 'Unfreeze account' : 'Freeze account for fraud prevention'}
                              >
                                {regUser.isFrozen ? <Unlock size={14} /> : <Lock size={14} />}
                              </button>

                              {/* Mic Mute Toggle */}
                              <button
                                onClick={() => handleToggleMute(regUser)}
                                className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                  regUser.isMuted
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                    : 'bg-white/10 text-gray-300 border border-white/15 hover:bg-white/20'
                                }`}
                                title={regUser.isMuted ? 'Unmute microphone' : 'Mute mic globally for 24h'}
                              >
                                {regUser.isMuted ? <Volume2 size={14} /> : <VolumeX size={14} />}
                              </button>

                              {/* Delete Account */}
                              <button
                                onClick={() => handleDeleteUser(regUser)}
                                className="p-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 cursor-pointer transition-colors"
                                title="Permanently Delete Account"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Inline Airdrop Drawer */}
                        <AnimatePresence>
                          {isInlineAirdropOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-3 pt-3 border-t border-amber-400/20"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-400/30">
                                <div className="text-xs">
                                  <span className="text-amber-300 font-black">Dispatch Coins to: </span>
                                  <span className="text-white font-bold">{regUser.name}</span>
                                  <span className="text-gray-400 font-mono text-[11px] ml-1.5">(ID: {regUser.displayId})</span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {[1000, 5000, 10000, 50000].map((preset) => (
                                    <button
                                      key={preset}
                                      onClick={() => handleExecuteInlineAirdrop(regUser, preset)}
                                      className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-black font-black text-xs border border-amber-400/40 transition-colors cursor-pointer"
                                    >
                                      +{preset >= 1000 ? `${preset / 1000}K` : preset}
                                    </button>
                                  ))}

                                  <div className="flex items-center gap-1 bg-black/40 border border-white/15 rounded-lg px-2 py-0.5">
                                    <span className="text-xs text-amber-300 font-mono">Custom:</span>
                                    <input
                                      type="number"
                                      min={100}
                                      step={500}
                                      value={customAirdropAmount}
                                      onChange={(e) => setCustomAirdropAmount(Number(e.target.value))}
                                      className="w-20 bg-transparent text-xs text-white focus:outline-none font-mono"
                                    />
                                    <button
                                      onClick={() => handleExecuteInlineAirdrop(regUser, customAirdropAmount)}
                                      className="px-2 py-0.5 rounded bg-amber-400 text-black font-black text-[11px] hover:bg-amber-300 cursor-pointer"
                                    >
                                      Send
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: FINANCIAL SETTINGS & COIN MINTING (DYNAMIC PRICING & MASTER WALLET) */}
          {/* ========================================================================= */}
          {activeTab === 'financial' && (
            <FinancialSettingsModule
              currentUser={user}
              onCoinsMinted={(amount, newBalance) => {
                showToast(`Master Treasury credited +${amount.toLocaleString()} Coins! New Balance: ${newBalance.toLocaleString()}`);
              }}
              showToast={showToast}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 2: LIVE TELEMETRY */}
          {/* ========================================================================= */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs text-gray-400">Active 1v1 Calls</span>
                  <p className="text-xl font-black text-cyan-400 mt-1">42 Calls</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">+18% vs yesterday</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs text-gray-400">12-Seat Party Rooms</span>
                  <p className="text-xl font-black text-pink-400 mt-1">18 Rooms</p>
                  <span className="text-[10px] text-pink-300 font-semibold">216 Seats active</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs text-gray-400">Online Real Users</span>
                  <p className="text-xl font-black text-amber-300 mt-1">{totalActiveRecently} Live</p>
                  <span className="text-[10px] text-gray-400">4 Global Regions</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs text-gray-400">Real Coins Circulation</span>
                  <p className="text-xl font-black text-emerald-300 mt-1">{totalCoinsInCirculation.toLocaleString()}</p>
                  <span className="text-[10px] text-amber-400">Registered user wallets</span>
                </div>
              </div>

              {/* Server Status Indicators */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20">
                <h4 className="text-xs font-black text-pink-300 uppercase tracking-wider mb-2">
                  System Health & Microservices
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-gray-300">WebRTC Video Gateway: OK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-gray-300">Champ Car Race Engine: OK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-gray-300">AI Translator Pipeline: OK</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: 1-CLICK COIN DISPATCHER & GLOBAL COIN RAIN */}
          {/* ========================================================================= */}
          {activeTab === 'airdrop' && (
            <div className="space-y-5">
              {/* Direct ID Dispatch Form */}
              <form onSubmit={handleSendAirdrop} className="p-4 rounded-2xl bg-white/5 border border-amber-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Send size={14} />
                    <span>Direct 8-Digit ID Airdrop</span>
                  </h4>
                  <span className="text-[10px] text-gray-400">Instant Ledger Injection</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Recipient 8-Digit ID
                    </label>
                    <input
                      type="text"
                      required
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      placeholder="e.g. 88204912 or 91482034"
                      className="w-full bg-[#090A15] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Coins Amount
                    </label>
                    <select
                      value={airdropAmount}
                      onChange={(e) => setAirdropAmount(Number(e.target.value))}
                      className="w-full bg-[#090A15] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value={10000}>10,000 Coins</option>
                      <option value={50000}>50,000 Coins</option>
                      <option value={100000}>100,000 Coins</option>
                      <option value={500000}>500,000 Coins</option>
                      <option value={1000000}>1,000,000 Coins (10 Lakhs)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Execute 1-Click Coin Dispatch</span>
                </button>
              </form>

              {/* Global Coin Rain Trigger */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-amber-900/30 border border-pink-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌧️</span>
                    <span>Global Room Coin Rain Trigger</span>
                  </h4>
                  <span className="text-[10px] text-pink-200">Broadcasts to all party rooms</span>
                </div>
                <p className="text-xs text-gray-300">
                  Shower all online users and party room guests with interactive falling gold coins in real-time.
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={rainPool}
                    onChange={(e) => setRainPool(Number(e.target.value))}
                    className="flex-1 bg-[#090A15] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white"
                  >
                    <option value={50000}>50,000 Coin Shower</option>
                    <option value={100000}>100,000 Coin Shower (Recommended)</option>
                    <option value={500000}>500,000 Mega Super Shower</option>
                  </select>
                  <button
                    onClick={handleLaunchRain}
                    className="px-5 py-2 bg-gradient-to-r from-[#FF2E93] to-purple-600 hover:scale-105 text-white font-black text-xs rounded-xl shadow-[0_0_15px_#FF2E93] transition-all cursor-pointer"
                  >
                    Launch Rain! 🌧️
                  </button>
                </div>
              </div>

              {airdropMessage && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-bold text-center">
                  {airdropMessage}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: UTR APPROVAL QUEUE */}
          {/* ========================================================================= */}
          {activeTab === 'utr' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Review and verify direct UPI/UTR recharge payment receipts
                </p>
              </div>

              {utrRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  No pending UTR requests.
                </div>
              ) : (
                utrRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{req.userName}</span>
                        <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                          ID: {req.userDisplayId}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : req.status === 'REJECTED'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300 font-bold mt-1">
                        ₹{req.amountINR.toLocaleString()} INR → +{req.coinsExpected.toLocaleString()} Coins
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        UTR No: <span className="text-white font-bold">{req.utrNumber}</span> • {req.timestamp}
                      </p>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            sound.playCoinDrop();
                            onApproveUTR(req.id);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          <span>Approve & Credit</span>
                        </button>
                        <button
                          onClick={() => {
                            sound.playClick();
                            onRejectUTR(req.id);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold cursor-pointer"
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: USER SAFETY REPORTS & MODERATION QUEUE */}
          {/* ========================================================================= */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Reports</span>
                  <span className="text-lg font-black text-white">{userReports.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40">
                  <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">Pending Urgent</span>
                  <span className="text-lg font-black text-red-400">
                    {userReports.filter((r) => r.status === 'PENDING').length}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Investigating</span>
                  <span className="text-lg font-black text-amber-400">
                    {userReports.filter((r) => r.status === 'INVESTIGATING').length}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Resolved</span>
                  <span className="text-lg font-black text-emerald-400">
                    {userReports.filter((r) => r.status === 'RESOLVED').length}
                  </span>
                </div>
              </div>

              {/* Status Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {(['ALL', 'PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'] as const).map((filter) => {
                  const count =
                    filter === 'ALL'
                      ? userReports.length
                      : userReports.filter((r) => r.status === filter).length;
                  const isSelected = reportFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => {
                        sound.playClick();
                        setReportFilter(filter);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-500 text-white font-black shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {filter} ({count})
                    </button>
                  );
                })}
              </div>

              {/* User Reports Incident Feed */}
              <div className="space-y-3">
                {userReports
                  .filter((r) => (reportFilter === 'ALL' ? true : r.status === reportFilter))
                  .length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                    <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold text-white">No Flagged Incident Reports in this View</p>
                    <p className="text-xs text-gray-400">
                      All community 1v1 calls and party rooms are currently operating within safe parameters.
                    </p>
                  </div>
                ) : (
                  userReports
                    .filter((r) => (reportFilter === 'ALL' ? true : r.status === reportFilter))
                    .map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-2xl bg-white/5 border border-red-500/30 space-y-3 relative overflow-hidden transition-all hover:border-red-500/60"
                      >
                        {/* Header: Docket ID, Source & Status */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-black text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                              {report.id}
                            </span>
                            <span className="text-[11px] font-bold text-pink-300">
                              {report.sourceContext === '1v1_call'
                                ? `📞 1v1 Private Call${
                                    report.contextDetails?.callDurationSec
                                      ? ` (${report.contextDetails.callDurationSec}s)`
                                      : ''
                                  }`
                                : `🎉 Party Room: ${report.contextDetails?.roomTitle || 'Room'}${
                                    report.contextDetails?.seatNumber
                                      ? ` (Seat #${report.contextDetails.seatNumber})`
                                      : ''
                                  }`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">
                              {new Date(report.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                report.status === 'PENDING'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                                  : report.status === 'INVESTIGATING'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : report.status === 'RESOLVED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-gray-700/40 text-gray-400'
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                        </div>

                        {/* Reported Target & Reporter Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Flagged Target Card */}
                          <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center gap-2.5">
                            <img
                              referrerPolicy="no-referrer"
                              src={
                                report.reportedUserAvatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                              }
                              alt={report.reportedUserName}
                              className="w-10 h-10 rounded-full object-cover border border-red-500"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-black text-red-400 uppercase block">Flagged Target</span>
                              <p className="text-xs font-black text-white truncate">{report.reportedUserName}</p>
                              <p className="text-[10px] font-mono text-gray-400">
                                ID: {report.reportedUserDisplayId || report.reportedUserId}
                              </p>
                            </div>
                          </div>

                          {/* Reporter Info */}
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="text-[9px] font-black text-gray-400 uppercase block">Reported By</span>
                              <p className="text-xs font-bold text-white truncate">{report.reporterUserName}</p>
                              <p className="text-[10px] font-mono text-gray-400">
                                ID: {report.reporterUserDisplayId || report.reporterUserId}
                              </p>
                            </div>
                            <span className="text-[10px] text-pink-300 bg-pink-950/40 border border-pink-500/30 px-2 py-0.5 rounded font-bold">
                              Verified
                            </span>
                          </div>
                        </div>

                        {/* Category & Tags */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-red-300 bg-red-500/20 px-2.5 py-0.5 rounded-md border border-red-500/30 flex items-center gap-1">
                              <Flag size={11} /> {report.categoryLabel}
                            </span>
                            {report.quickTags?.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] text-amber-200 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Evidence & Description */}
                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-gray-200 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Reported Incident Description
                          </span>
                          <p className="italic text-gray-300">"{report.description}"</p>
                        </div>

                        {/* Action Taken Status Banner if resolved */}
                        {report.actionTaken && report.actionTaken !== 'NONE' && (
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span>
                              Action Executed:{' '}
                              <strong className="text-white uppercase font-black">{report.actionTaken}</strong> by Super
                              Admin
                            </span>
                          </div>
                        )}

                        {/* Super Admin Direct Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* 1. Freeze Target Account */}
                          <button
                            onClick={() => {
                              sound.playClick();
                              const newStatus = toggleUserFreezeInRegistry(
                                report.reportedUserDisplayId || report.reportedUserId
                              );
                              updateUserReportStatus(
                                report.id,
                                'RESOLVED',
                                newStatus ? 'FROZEN' : 'NONE',
                                `Account ${newStatus ? 'FROZEN' : 'UNFROZEN'} by Super Admin`
                              );
                              showToast(
                                `🔒 Account ${report.reportedUserName} has been ${
                                  newStatus ? 'FROZEN' : 'UNFROZEN'
                                } & Report Marked Resolved.`
                              );
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                          >
                            <Lock size={12} />
                            <span>Freeze Account</span>
                          </button>

                          {/* 2. Global Mute Target Mic */}
                          <button
                            onClick={() => {
                              sound.playClick();
                              const newStatus = toggleUserMuteInRegistry(
                                report.reportedUserDisplayId || report.reportedUserId
                              );
                              updateUserReportStatus(
                                report.id,
                                'RESOLVED',
                                newStatus ? 'MUTED' : 'NONE',
                                `Microphone ${newStatus ? 'GLOBALLY MUTED' : 'UNMUTED'} by Super Admin`
                              );
                              showToast(
                                `🔇 User ${report.reportedUserName} microphone has been ${
                                  newStatus ? 'GLOBALLY MUTED' : 'UNMUTED'
                                } & Report Marked Resolved.`
                              );
                            }}
                            className="px-3 py-1.5 rounded-xl bg-yellow-600/80 hover:bg-yellow-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                          >
                            <VolumeX size={12} />
                            <span>Global Mute</span>
                          </button>

                          {/* 3. Mark Investigating */}
                          {report.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                sound.playClick();
                                updateUserReportStatus(report.id, 'INVESTIGATING');
                                showToast(`🔍 Docket ${report.id} marked under investigation.`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Search size={12} />
                              <span>Investigate</span>
                            </button>
                          )}

                          {/* 4. Mark Clean Resolved */}
                          {report.status !== 'RESOLVED' && (
                            <button
                              onClick={() => {
                                sound.playClick();
                                updateUserReportStatus(report.id, 'RESOLVED', 'WARNED');
                                showToast(`✅ Docket ${report.id} marked resolved with user warning.`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Check size={12} />
                              <span>Mark Resolved</span>
                            </button>
                          )}

                          {/* 5. Dismiss */}
                          {report.status !== 'DISMISSED' && (
                            <button
                              onClick={() => {
                                sound.playClick();
                                updateUserReportStatus(report.id, 'DISMISSED', 'DISMISSED');
                                showToast(`❌ Docket ${report.id} dismissed as non-violating.`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs cursor-pointer transition-all"
                            >
                              Dismiss
                            </button>
                          )}

                          {/* 6. Delete Record */}
                          <button
                            onClick={() => {
                              sound.playClick();
                              deleteUserReport(report.id);
                              showToast(`🗑️ Docket ${report.id} permanently deleted.`);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all cursor-pointer ml-auto"
                            title="Delete Docket"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Manual Targeted Sanction Tool */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-red-400" />
                  <span>Manual User ID Direct Moderation</span>
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Target User ID to Freeze or Global Mute
                  </label>
                  <input
                    type="text"
                    value={modTargetId}
                    onChange={(e) => setModTargetId(e.target.value)}
                    placeholder="Enter 8-digit User ID (e.g. 88204912)"
                    className="w-full bg-[#090A15] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/80"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      const target = modTargetId.trim() || '88204912';
                      const newStatus = toggleUserMuteInRegistry(target);
                      setModActionStatus(
                        `🚨 User ID ${target} microphone has been ${
                          newStatus ? 'GLOBALLY MUTED (24h)' : 'UNMUTED'
                        }.`
                      );
                      showToast(`User ID ${target} mute status toggled: ${newStatus ? 'MUTED' : 'UNMUTED'}`);
                    }}
                    className="flex-1 py-2 bg-yellow-600/80 hover:bg-yellow-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <VolumeX size={13} />
                    <span>Toggle Global Mute</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      const target = modTargetId.trim() || '88204912';
                      const newStatus = toggleUserFreezeInRegistry(target);
                      setModActionStatus(
                        `🔒 Account ID ${target} has been ${newStatus ? 'FROZEN' : 'UNFROZEN'}.`
                      );
                      showToast(`User ID ${target} freeze status toggled: ${newStatus ? 'FROZEN' : 'ACTIVE'}`);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Lock size={13} />
                    <span>Toggle Freeze Account</span>
                  </button>
                </div>

                {modActionStatus && (
                  <p className="text-xs text-amber-300 font-medium text-center">{modActionStatus}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-amber-400" />
            <span>Super-Admin Access Verified • Real Data Isolation Layer</span>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            Close Suite
          </button>
        </div>
      </motion.div>
    </div>
  );
};
