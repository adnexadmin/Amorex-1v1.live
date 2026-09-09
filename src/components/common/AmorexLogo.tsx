import React from 'react';
import heart3dLogo from '../../assets/images/amorex_3d_heart_logo_1787566285140.jpg';

interface AmorexLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export const AmorexLogo: React.FC<AmorexLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle = 'Romantic Social Universe'
}) => {
  const iconDimensions = {
    sm: { box: 'w-8 h-8', img: 'w-7 h-7', text: 'text-lg', sub: 'text-[8px]' },
    md: { box: 'w-11 h-11', img: 'w-10 h-10', text: 'text-xl sm:text-2xl', sub: 'text-[9px] sm:text-[10px]' },
    lg: { box: 'w-16 h-16', img: 'w-15 h-15', text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    xl: { box: 'w-24 h-24', img: 'w-22 h-22', text: 'text-4xl sm:text-5xl', sub: 'text-sm' }
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 3D Romantic Embracing Soulmates Heart Emblem */}
      <div
        className={`${iconDimensions.box} relative rounded-2xl bg-gradient-to-b from-[#FF4081] via-[#FF1744] to-[#C2185B] p-[1.5px] shadow-[0_0_25px_rgba(255,23,68,0.55),0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center shrink-0 group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(255,46,147,0.75)] overflow-hidden`}
      >
        {/* Inner Container */}
        <div className="w-full h-full bg-gradient-to-b from-[#1E0E28] via-[#12091B] to-[#0A0512] rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Specular 3D Upper Light Reflection */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-white/25 rounded-full blur-[2px] pointer-events-none z-20" />
          
          {/* 3D Heart Logo Image */}
          <img
            src={heart3dLogo}
            alt="Amorex 3D Heart"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-[13px] animate-romantic-pulse"
          />

          {/* Crystalline Gloss Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* AMOREX LIVE Typography */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-center gap-2 leading-none">
            <span className={`font-black italic tracking-tight bg-gradient-to-r from-[#FF2E93] via-[#FF85C0] to-[#00D2FF] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,46,147,0.4)] ${iconDimensions.text}`}>
              AMOREX
            </span>
            <span className="text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-[#FF1744] to-[#FF2E93] text-white px-2 py-0.5 rounded-full tracking-wider uppercase font-mono shadow-[0_0_10px_rgba(255,23,68,0.5)] inline-flex items-center justify-center">
              LIVE
            </span>
          </div>
          <span className={`text-white/60 tracking-wider font-semibold mt-0.5 ${iconDimensions.sub}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
