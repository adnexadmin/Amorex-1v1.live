import React from 'react';
import { AmorexLogo } from './AmorexLogo';
import { Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface LoadingSplashScreenProps {
  message?: string;
}

export const LoadingSplashScreen: React.FC<LoadingSplashScreenProps> = ({
  message = 'Connecting to Amorex Universe...'
}) => {
  return (
    <div
      id="amorex-splash-screen"
      className="fixed inset-0 z-[100] bg-[#090A15] text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FF2E93]/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-[#00D2FF]/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Main Branded Content */}
      <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
        {/* Animated Brand Logo with Ambient Pulsing Glow */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [0.95, 1.03, 0.95], opacity: 1 }}
          transition={{
            scale: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
            opacity: { duration: 0.4 }
          }}
          className="relative mb-6"
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-[#FF1744] via-[#FF2E93] to-[#00D2FF] rounded-full blur-xl opacity-40 animate-pulse" />
          <div className="relative p-2">
            <AmorexLogo size="lg" showText={false} />
          </div>
        </motion.div>

        {/* Brand Typography */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="space-y-1 mb-6"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
              AMOREX
            </span>
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-[#FF2E93] to-[#00D2FF] bg-clip-text text-transparent">
              LIVE
            </span>
          </div>
          <p className="text-xs text-pink-300 font-medium tracking-wide flex items-center justify-center gap-1">
            <Heart size={12} className="text-[#FF2E93] fill-[#FF2E93] animate-bounce" />
            <span>Romantic Social Universe & 1v1 Video</span>
          </p>
        </motion.div>

        {/* Sophisticated Dual-Ring Spinner */}
        <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-[#FF2E93] border-r-[#00D2FF] animate-spin" />
          <Sparkles size={16} className="text-[#FFD700] animate-pulse" />
        </div>

        {/* Status Message */}
        <p className="text-xs text-gray-300 font-medium animate-pulse tracking-wide">
          {message}
        </p>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E93] animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-ping delay-150" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-ping delay-300" />
        </div>
      </div>
    </div>
  );
};
