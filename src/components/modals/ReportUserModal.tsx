import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Send,
  Flag,
  UserX,
  VolumeX,
  Lock,
  Radio,
  FileText
} from 'lucide-react';
import {
  UserProfile,
  ReportReasonCategory,
  ReportSourceContext,
  UserReport
} from '../../types';
import { saveUserReport } from '../../utils/storage';
import { sound } from '../../utils/audio';

export interface ReportTargetInfo {
  id: string;
  name: string;
  avatar?: string;
  displayId?: string;
  role?: string;
}

export interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: ReportTargetInfo;
  currentUser: UserProfile;
  sourceContext: ReportSourceContext;
  contextDetails?: {
    roomTitle?: string;
    roomId?: string;
    callDurationSec?: number;
    seatNumber?: number;
  };
  onSubmitSuccess?: (report: UserReport) => void;
}

interface ViolationCategoryOption {
  id: ReportReasonCategory;
  title: string;
  subtitle: string;
  icon: string;
  suggestedTags: string[];
}

const VIOLATION_CATEGORIES: ViolationCategoryOption[] = [
  {
    id: 'harassment',
    title: 'Harassment & Bullying',
    subtitle: 'Abusive language, mic blasting, insults or persistent intimidation',
    icon: '🗣️',
    suggestedTags: ['Verbal Abuse', 'Mic Blasting', 'Personal Insults', 'Threats']
  },
  {
    id: 'inappropriate_content',
    title: 'Inappropriate Content & Nudity',
    subtitle: 'Sexual gestures, explicit exposure, or indecent live camera feeds',
    icon: '🔞',
    suggestedTags: ['Indecent Exposure', 'Suggestive Behavior', 'Unsolicited Media']
  },
  {
    id: 'scam_fraud',
    title: 'Financial Scam & Off-Platform Money',
    subtitle: 'Soliciting UPI, crypto, bank transfers, or external apps/WhatsApp',
    icon: '💸',
    suggestedTags: ['Off-Platform Payment', 'UPI Fraud', 'Fake Gift Promise', 'External Link']
  },
  {
    id: 'privacy_recording',
    title: 'Unauthorized Recording & Privacy Breach',
    subtitle: 'Screen recording private calls, disclosing personal PII or blackmail',
    icon: '📹',
    suggestedTags: ['Screen Recording', 'Doxxing PII', 'Blackmail / Extortion']
  },
  {
    id: 'underage',
    title: 'Underage or Stolen Identity',
    subtitle: 'Suspected minor under 18 or impersonating someone else',
    icon: '🚸',
    suggestedTags: ['Underage User', 'Fake Identity', 'Profile Impersonation']
  },
  {
    id: 'hate_speech',
    title: 'Hate Speech & Discrimination',
    subtitle: 'Attacking race, religion, ethnicity, gender, or nationality',
    icon: '🚫',
    suggestedTags: ['Hate Speech', 'Religious Slur', 'Discrimination']
  },
  {
    id: 'other',
    title: 'Other Community Violation',
    subtitle: 'Disrupting party room harmony or violating terms of service',
    icon: '⚠️',
    suggestedTags: ['Spamming Chat', 'Room Disruption', 'Other Terms Violation']
  }
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  currentUser,
  sourceContext,
  contextDetails,
  onSubmitSuccess
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportReasonCategory>('harassment');
  const [description, setDescription] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [muteUserLocally, setMuteUserLocally] = useState<boolean>(true);
  const [blockUserLocally, setBlockUserLocally] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<UserReport | null>(null);

  if (!isOpen) return null;

  const currentCategoryData =
    VIOLATION_CATEGORIES.find((c) => c.id === selectedCategory) || VIOLATION_CATEGORIES[0];

  const handleToggleTag = (tag: string) => {
    sound.playClick();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && selectedTags.length === 0) {
      alert('Please select at least one tag or enter a brief description of what happened.');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    setTimeout(() => {
      const reportId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
      const newReport: UserReport = {
        id: reportId,
        reportedUserId: targetUser.id,
        reportedUserName: targetUser.name,
        reportedUserAvatar: targetUser.avatar,
        reportedUserDisplayId: targetUser.displayId || targetUser.id.slice(0, 8),
        reporterUserId: currentUser.id,
        reporterUserName: currentUser.name,
        reporterUserDisplayId: currentUser.displayId,
        sourceContext,
        contextDetails: {
          roomTitle: contextDetails?.roomTitle,
          roomId: contextDetails?.roomId,
          callDurationSec: contextDetails?.callDurationSec,
          seatNumber: contextDetails?.seatNumber
        },
        category: selectedCategory,
        categoryLabel: currentCategoryData.title,
        description: description.trim() || `User reported for ${currentCategoryData.title} (${selectedTags.join(', ')})`,
        quickTags: selectedTags,
        createdAt: Date.now(),
        status: 'PENDING',
        actionTaken: 'NONE'
      };

      // Save into storage & dispatch live event for Super Admin dashboard
      saveUserReport(newReport);

      setIsSubmitting(false);
      setSubmittedReport(newReport);
      onSubmitSuccess?.(newReport);
    }, 450);
  };

  const handleResetAndClose = () => {
    sound.playClick();
    setSubmittedReport(null);
    setDescription('');
    setSelectedTags([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-lg bg-[#0E1020] border border-red-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-white overflow-hidden my-auto"
      >
        {/* Background glow header */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Report User Violation</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-500/30 uppercase tracking-wide">
                  Super Admin Urgent
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Routed directly with high priority to 24/7 Super Admin Moderation
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!submittedReport ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 relative z-10">
              {/* Reported Target Summary Card */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      referrerPolicy="no-referrer"
                      src={
                        targetUser.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={targetUser.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-red-500/60"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] flex items-center justify-center font-bold text-white">
                      !
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">
                        {targetUser.name}
                      </h4>
                      {targetUser.displayId && (
                        <span className="text-[10px] font-mono text-gray-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                          ID: {targetUser.displayId}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span>Source:</span>
                      <span className="text-pink-300 font-bold">
                        {sourceContext === '1v1_call'
                          ? `📞 1v1 Private Video Call${
                              contextDetails?.callDurationSec
                                ? ` (${contextDetails.callDurationSec}s elapsed)`
                                : ''
                            }`
                          : `🎉 Party Room: ${contextDetails?.roomTitle || 'VIP Stage'}${
                              contextDetails?.seatNumber ? ` (Seat #${contextDetails.seatNumber})` : ''
                            }`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] text-red-300 bg-red-950/60 border border-red-500/30 px-2 py-1 rounded-full font-bold">
                    Flagged Target
                  </span>
                </div>
              </div>

              {/* Step 1: Violation Category Selector */}
              <div>
                <label className="block text-xs font-black text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Flag size={12} className="text-red-400" />
                  <span>1. Select Violation Reason</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                  {VIOLATION_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedCategory(cat.id);
                          setSelectedTags([]);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-red-500/20 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-400/50'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-base shrink-0 mt-0.5">{cat.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate">{cat.title}</p>
                          <p className="text-[10px] text-gray-400 leading-snug line-clamp-1 mt-0.5">
                            {cat.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Suggested Quick Tags */}
              {currentCategoryData.suggestedTags.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">
                    2. Specific Indicators (Tap to Add)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCategoryData.suggestedTags.map((tag) => {
                      const isTagSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            isTagSelected
                              ? 'bg-red-500 text-white border-red-400 shadow-sm'
                              : 'bg-white/5 text-gray-300 border-white/15 hover:border-white/30'
                          }`}
                        >
                          {isTagSelected ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Detailed Description */}
              <div>
                <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>3. Evidence / Description</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {description.length}/300 chars
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                  placeholder="Describe what occurred, quotes, demands, or behavior observed so Super Admins can verify live call logs..."
                  rows={2}
                  className="w-full bg-[#070811] border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/80 transition-all resize-none"
                />
              </div>

              {/* Immediate Local Protection Options */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-[11px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Lock size={10} className="text-amber-400" />
                  <span>Immediate Self-Protection Measures</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={muteUserLocally}
                      onChange={(e) => setMuteUserLocally(e.target.checked)}
                      className="rounded border-gray-600 text-red-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="flex items-center gap-1">
                      <VolumeX size={11} className="text-amber-400" />
                      <span>Mute user audio immediately</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={blockUserLocally}
                      onChange={(e) => setBlockUserLocally(e.target.checked)}
                      className="rounded border-gray-600 text-red-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="flex items-center gap-1">
                      <UserX size={11} className="text-red-400" />
                      <span>Block user from future calls</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Escalating to Super Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Submit Urgent Report to Super Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 space-y-4 text-center relative z-10"
            >
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto text-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <CheckCircle2 size={32} className="text-white" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/40 uppercase font-black">
                  Case Docket: {submittedReport.id}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1.5">
                  Report Successfully Escalated
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
                  Your safety report regarding <span className="text-white font-bold">{targetUser.name}</span> has been routed directly to the Super Admin Moderation Desk.
                </p>
              </div>

              {/* Status details card */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-white/10">
                  <span className="text-gray-400">Violation Reason:</span>
                  <span className="font-bold text-red-300">{submittedReport.categoryLabel}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-white/10">
                  <span className="text-gray-400">Target User ID:</span>
                  <span className="font-mono text-amber-300 font-bold">{submittedReport.reportedUserDisplayId}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-white/10">
                  <span className="text-gray-400">Incident Source:</span>
                  <span className="text-pink-300 font-semibold">
                    {submittedReport.sourceContext === '1v1_call' ? '1v1 Private Video Call' : 'Party Room'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Moderation Priority:</span>
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    <Radio size={12} className="animate-pulse" /> Urgent Live Queue
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
                🛡️ Super Admins review live flagged streams and can apply global mutes, coin forfeiture, or permanent device freezing within minutes.
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer hover:opacity-95 transition-all"
              >
                Return to Call / Room
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
