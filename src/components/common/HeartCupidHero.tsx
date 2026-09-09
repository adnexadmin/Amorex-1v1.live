import React from 'react';
import { motion } from 'motion/react';
import heart3dLogo from '../../assets/images/amorex_3d_heart_logo_1787566285140.jpg';

interface HeartCupidHeroProps {
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const HeartCupidHero: React.FC<HeartCupidHeroProps> = ({ size = 'lg', interactive = true }) => {
  const sizeMap = {
    sm: 'w-32 h-32',
    md: 'w-52 h-52',
    lg: 'w-72 h-72 sm:w-88 sm:h-88 md:w-[380px] md:h-[380px]'
  };

  return (
    <div className={`relative flex items-center justify-center select-none mx-auto ${sizeMap[size]}`}>
      {/* Deep Royal Violet & Magenta Romantic Ambient Aura */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7B1FA2]/70 via-[#E91E63]/60 to-[#4A148C]/80 blur-3xl pointer-events-none"
      />

      {/* Radiant Outer Neon Ring */}
      <div className="absolute inset-4 rounded-full border border-pink-500/30 shadow-[0_0_30px_rgba(233,30,99,0.4)] pointer-events-none animate-pulse" />

      {/* Orbiting Stardust Sparkles Trail */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-gradient-to-r from-white to-[#FF80AB] rounded-full shadow-[0_0_18px_#FF80AB]" />
        <div className="absolute bottom-8 right-6 w-2.5 h-2.5 bg-[#FFD700] rounded-full shadow-[0_0_14px_#FFD700]" />
        <div className="absolute top-1/3 left-1 w-3 h-3 bg-white rounded-full shadow-[0_0_16px_#FFF]" />
        <div className="absolute bottom-1/3 left-6 w-2.5 h-2.5 bg-[#FF4081] rounded-full shadow-[0_0_12px_#FF4081]" />
      </motion.div>

      {/* Main 3D Soulmates Marble Sculpture Image with 3D Float & Pulse */}
      <motion.div
        whileHover={interactive ? { scale: 1.05, rotateZ: -1 } : undefined}
        whileTap={interactive ? { scale: 0.96 } : undefined}
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.04, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="relative z-10 w-full h-full flex items-center justify-center cursor-pointer group"
      >
        {/* Layered Masked Circular/Heart Glass Container with 3D Depth */}
        <div className="relative w-[92%] h-[92%] rounded-3xl p-1 bg-gradient-to-b from-pink-400/40 via-purple-600/30 to-pink-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(255,46,147,0.4)] backdrop-blur-md overflow-hidden">
          {/* 3D Render Image */}
          <img
            src={heart3dLogo}
            alt="Amorex 3D Romantic Embracing Soulmates Heart"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-[22px] transition-transform duration-500 group-hover:scale-108"
          />

          {/* Crystalline Gloss Sheen Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-[22px]" />
          
          {/* Subtle Top Specular Edge */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[22px]" />
        </div>
      </motion.div>
    </div>
  );
};

