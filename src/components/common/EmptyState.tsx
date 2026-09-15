import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  colorScheme?: 'pink' | 'cyan' | 'purple' | 'amber';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  badge = 'Fresh Start',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  colorScheme = 'pink'
}) => {
  const colorMap = {
    pink: {
      glow: 'from-pink-500/20 via-purple-500/10 to-transparent',
      border: 'border-pink-500/30 hover:border-pink-500/50',
      iconBg: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      btn: 'bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white shadow-[0_0_20px_rgba(255,46,147,0.4)]'
    },
    cyan: {
      glow: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      border: 'border-cyan-500/30 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      btn: 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-[0_0_20px_rgba(0,210,255,0.4)]'
    },
    purple: {
      glow: 'from-purple-500/20 via-indigo-500/10 to-transparent',
      border: 'border-purple-500/30 hover:border-purple-500/50',
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      btn: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
    },
    amber: {
      glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
      border: 'border-amber-500/30 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      btn: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black shadow-[0_0_20px_rgba(251,191,36,0.4)]'
    }
  };

  const scheme = colorMap[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center my-6 glass border ${scheme.border} bg-gradient-to-b ${scheme.glow} backdrop-blur-xl`}
    >
      {/* Background Decorative Rings */}
      <div className="absolute w-72 h-72 rounded-full bg-white/[0.02] -z-10 blur-xl pointer-events-none" />

      {badge && (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border mb-4 uppercase tracking-wider ${scheme.badgeBg}`}>
          <Sparkles size={12} />
          <span>{badge}</span>
        </span>
      )}

      {/* Floating Animated Icon */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-20 h-20 rounded-3xl flex items-center justify-center border shadow-lg mb-5 ${scheme.iconBg}`}
      >
        <Icon size={38} strokeWidth={1.8} />
      </motion.div>

      <h3 className="text-white font-black text-lg sm:text-xl tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-gray-400 text-xs sm:text-sm max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={() => {
              sound.playClick();
              onAction();
            }}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 ${scheme.btn}`}
          >
            <span>{actionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={() => {
              sound.playClick();
              onSecondaryAction();
            }}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
