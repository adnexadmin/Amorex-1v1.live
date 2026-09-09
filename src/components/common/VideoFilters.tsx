import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Smile,
  Flame,
  Wand2,
  Heart,
  Sliders,
  X,
  Palette,
  Eye,
  Check,
  Sun,
  Camera,
  Moon,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoFilterType } from '../../types';
import { sound } from '../../utils/audio';

export type FilterCategory = 'all' | 'romantic' | 'beauty' | 'cinema';

export interface FilterPreset {
  id: VideoFilterType;
  name: string;
  category: 'romantic' | 'beauty' | 'cinema';
  tagline: string;
  icon: string;
  color: string;
  badgeBg: string;
  previewGradient: string;
  getCSS: (intensity: number) => string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'heart-aura',
    name: 'Heart Aura',
    category: 'romantic',
    tagline: 'Pulsing romantic blush & radiant heart contour',
    icon: '💖',
    color: 'from-rose-500 via-pink-500 to-red-500',
    badgeBg: 'bg-rose-500/25 text-rose-200 border-rose-500/50',
    previewGradient: 'from-pink-600/60 via-rose-600/40 to-red-950/70',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const b = 1 + 0.08 * factor;
      const c = 1 + 0.12 * factor;
      const s = 1 + 0.36 * factor;
      const blur = Math.round(20 * factor);
      const alpha = (0.55 * factor).toFixed(2);
      return `brightness(${b}) contrast(${c}) saturate(${s}) drop-shadow(0 0 ${blur}px rgba(255, 23, 68, ${alpha}))`;
    }
  },
  {
    id: 'sparkle-glow',
    name: 'Sparkle Glow',
    category: 'romantic',
    tagline: 'Celestial diamond stardust & shimmering highlights',
    icon: '✨',
    color: 'from-amber-300 via-yellow-400 to-pink-400',
    badgeBg: 'bg-amber-400/25 text-amber-200 border-amber-400/50',
    previewGradient: 'from-amber-400/50 via-pink-500/40 to-purple-950/60',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const b = 1 + 0.14 * factor;
      const c = 1 + 0.08 * factor;
      const s = 1 + 0.28 * factor;
      const blur = Math.round(18 * factor);
      const alpha = (0.5 * factor).toFixed(2);
      return `brightness(${b}) contrast(${c}) saturate(${s}) drop-shadow(0 0 ${blur}px rgba(255, 215, 0, ${alpha}))`;
    }
  },
  {
    id: 'vintage-love',
    name: 'Vintage Love',
    category: 'romantic',
    tagline: 'Warm 35mm nostalgic romance & golden amber tone',
    icon: '🎞️',
    color: 'from-amber-500 via-orange-400 to-rose-600',
    badgeBg: 'bg-amber-500/25 text-amber-200 border-amber-500/50',
    previewGradient: 'from-amber-700/60 via-rose-800/40 to-stone-950/80',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const sep = (0.42 * factor).toFixed(2);
      const b = 1 + 0.05 * factor;
      const c = 1 + 0.16 * factor;
      const s = 1 + 0.25 * factor;
      const blur = Math.round(14 * factor);
      const alpha = (0.4 * factor).toFixed(2);
      return `sepia(${sep}) hue-rotate(-6deg) brightness(${b}) contrast(${c}) saturate(${s}) drop-shadow(0 0 ${blur}px rgba(217, 119, 6, ${alpha}))`;
    }
  },
  {
    id: 'none',
    name: 'Natural HD',
    category: 'beauty',
    tagline: 'True HD untouched clarity',
    icon: '💎',
    color: 'from-gray-400 to-slate-200',
    badgeBg: 'bg-white/10 text-gray-200 border-white/20',
    previewGradient: 'from-gray-700 via-gray-800 to-black',
    getCSS: () => 'none'
  },
  {
    id: 'beauty-mode',
    name: 'Beauty Radiance',
    category: 'beauty',
    tagline: 'Silky smooth skin & delicate radiance',
    icon: '💖',
    color: 'from-pink-400 to-rose-400',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    previewGradient: 'from-pink-500/40 via-rose-500/30 to-purple-900/50',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const b = 1 + 0.09 * factor;
      const c = 1 + 0.05 * factor;
      const s = 1 + 0.14 * factor;
      const blur = (0.35 * factor).toFixed(2);
      return `brightness(${b}) contrast(${c}) saturate(${s}) blur(${blur}px)`;
    }
  },
  {
    id: 'soft-glow',
    name: 'Soft Glow',
    category: 'beauty',
    tagline: 'Dreamy ethereal angelic halo',
    icon: '🌸',
    color: 'from-fuchsia-400 to-pink-500',
    badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    previewGradient: 'from-fuchsia-500/40 via-pink-600/30 to-indigo-950/60',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const b = 1 + 0.1 * factor;
      const c = 1 + 0.06 * factor;
      const s = 1 + 0.22 * factor;
      const shadowBlur = Math.round(18 * factor);
      const alpha = (0.45 * factor).toFixed(2);
      return `brightness(${b}) contrast(${c}) saturate(${s}) drop-shadow(0 0 ${shadowBlur}px rgba(255, 46, 147, ${alpha}))`;
    }
  },
  {
    id: 'romantic',
    name: 'Romantic Blush',
    category: 'romantic',
    tagline: 'Intimate rose tones & warmth',
    icon: '🌹',
    color: 'from-rose-500 to-red-500',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    previewGradient: 'from-rose-600/50 via-pink-600/40 to-red-950/60',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const b = 1 + 0.06 * factor;
      const c = 1 + 0.1 * factor;
      const s = 1 + 0.32 * factor;
      const hue = Math.round(360 - 18 * factor);
      const alpha = (0.4 * factor).toFixed(2);
      return `brightness(${b}) contrast(${c}) saturate(${s}) hue-rotate(${hue}deg) drop-shadow(0 0 14px rgba(255, 105, 180, ${alpha}))`;
    }
  },
  {
    id: 'cherry-blossom',
    name: 'Sakura Petals',
    category: 'romantic',
    tagline: 'Delicate pastel pink & floral charm',
    icon: '🌸',
    color: 'from-pink-300 to-rose-400',
    badgeBg: 'bg-pink-400/20 text-pink-200 border-pink-400/40',
    previewGradient: 'from-pink-400/40 via-rose-300/30 to-purple-950/50',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const b = 1 + 0.08 * factor;
      const c = 1 + 0.06 * factor;
      const s = 1 + 0.26 * factor;
      const alpha = (0.38 * factor).toFixed(2);
      return `brightness(${b}) contrast(${c}) saturate(${s}) hue-rotate(-8deg) drop-shadow(0 0 16px rgba(244, 114, 182, ${alpha}))`;
    }
  },
  {
    id: 'candlelight',
    name: 'Candlelight',
    category: 'romantic',
    tagline: 'Warm amber intimate evening glow',
    icon: '🕯️',
    color: 'from-orange-400 to-amber-500',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    previewGradient: 'from-amber-600/50 via-orange-500/40 to-yellow-950/60',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const sep = (0.32 * factor).toFixed(2);
      const hue = Math.round(14 * factor);
      const b = 1 + 0.08 * factor;
      const c = 1 + 0.14 * factor;
      const s = 1 + 0.35 * factor;
      const alpha = (0.42 * factor).toFixed(2);
      return `sepia(${sep}) hue-rotate(${hue}deg) brightness(${b}) contrast(${c}) saturate(${s}) drop-shadow(0 0 16px rgba(251, 146, 60, ${alpha}))`;
    }
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'romantic',
    tagline: 'Sun-drenched sunset warmth',
    icon: '🌅',
    color: 'from-amber-400 to-yellow-500',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    previewGradient: 'from-yellow-500/50 via-amber-600/40 to-stone-950/60',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const sep = (0.24 * factor).toFixed(2);
      const b = 1 + 0.09 * factor;
      const c = 1 + 0.08 * factor;
      const s = 1 + 0.32 * factor;
      const alpha = (0.45 * factor).toFixed(2);
      return `sepia(${sep}) brightness(${b}) contrast(${c}) saturate(${s}) hue-rotate(-12deg) drop-shadow(0 0 18px rgba(245, 158, 11, ${alpha}))`;
    }
  },
  {
    id: 'dreamy',
    name: 'Dreamy Twilight',
    category: 'romantic',
    tagline: 'Moonlit lavender & starry shimmer',
    icon: '💜',
    color: 'from-violet-400 to-purple-500',
    badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    previewGradient: 'from-purple-600/50 via-indigo-600/40 to-slate-950/70',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const b = 1 + 0.08 * factor;
      const c = 1 + 0.08 * factor;
      const s = 1 + 0.26 * factor;
      const hue = Math.round(285);
      const alpha = (0.42 * factor).toFixed(2);
      return `brightness(${b}) contrast(${c}) saturate(${s}) hue-rotate(${hue}deg) drop-shadow(0 0 16px rgba(168, 85, 247, ${alpha}))`;
    }
  },
  {
    id: 'sepia',
    name: 'Sepia Nostalgia',
    category: 'cinema',
    tagline: 'Golden vintage romantic cinema portrait',
    icon: '🎞️',
    color: 'from-amber-400 to-yellow-600',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    previewGradient: 'from-yellow-700/50 via-amber-800/40 to-black',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const sep = (0.55 * factor).toFixed(2);
      const b = 1 + 0.03 * factor;
      const c = 1 + 0.12 * factor;
      const s = 1 + 0.18 * factor;
      return `sepia(${sep}) contrast(${c}) brightness(${b}) saturate(${s})`;
    }
  },
  {
    id: 'vintage-noir',
    name: 'Noir Elegance',
    category: 'cinema',
    tagline: 'Monochrome classic Hollywood drama',
    icon: '🖤',
    color: 'from-gray-300 to-zinc-500',
    badgeBg: 'bg-white/10 text-gray-300 border-white/20',
    previewGradient: 'from-gray-300/30 via-zinc-600/30 to-black',
    getCSS: (intensity: number) => {
      const factor = intensity / 100;
      const gray = (1 * factor).toFixed(2);
      const c = 1 + 0.35 * factor;
      const b = 1 + 0.05 * factor;
      return `grayscale(${gray}) contrast(${c}) brightness(${b})`;
    }
  }
];

export function getVideoFilterCSS(filterType: VideoFilterType, intensity = 100): string {
  const preset = FILTER_PRESETS.find((p) => p.id === filterType) || FILTER_PRESETS[0];
  return preset.getCSS(intensity);
}

export interface VideoFiltersProps {
  /** Currently selected filter */
  activeFilter: VideoFilterType;
  /** Callback when filter changes */
  onFilterChange: (filter: VideoFilterType) => void;
  /** Filter intensity 0 - 100 */
  intensity?: number;
  /** Callback when intensity changes */
  onIntensityChange?: (intensity: number) => void;
  /** Optional video ref(s) to directly apply filter CSS to */
  targetVideoRefs?: (React.RefObject<HTMLVideoElement | null> | React.RefObject<HTMLElement | null>)[];
  /** Whether to apply to self-camera too */
  applyToSelf?: boolean;
  /** Callback to toggle applying to self camera */
  onToggleApplyToSelf?: (enabled: boolean) => void;
  /** Class name for root container */
  className?: string;
  /** Callback to open full drawer */
  onOpenFullDrawer?: () => void;
}

export const VideoFilters: React.FC<VideoFiltersProps> = ({
  activeFilter,
  onFilterChange,
  intensity = 100,
  onIntensityChange,
  targetVideoRefs,
  applyToSelf = false,
  onToggleApplyToSelf,
  className = '',
  onOpenFullDrawer
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [localIntensity, setLocalIntensity] = useState<number>(intensity);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    setLocalIntensity(intensity);
  }, [intensity]);

  // Apply CSS filter directly to target video elements whenever activeFilter or intensity changes
  useEffect(() => {
    const cssFilter = getVideoFilterCSS(activeFilter, localIntensity);

    if (targetVideoRefs && targetVideoRefs.length > 0) {
      targetVideoRefs.forEach((ref) => {
        if (ref && ref.current) {
          ref.current.style.filter = cssFilter;
          ref.current.style.transition = 'filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        }
      });
    }
  }, [activeFilter, localIntensity, targetVideoRefs]);

  const handleSelectFilter = (preset: FilterPreset) => {
    sound.playClick();
    onFilterChange(preset.id);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1600);
  };

  const handleIntensitySlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalIntensity(val);
    if (onIntensityChange) {
      onIntensityChange(val);
    }
  };

  const currentPreset = FILTER_PRESETS.find((p) => p.id === activeFilter) || FILTER_PRESETS[0];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Toast confirmation for active romantic filter */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            className="absolute -top-10 z-40 bg-black/85 backdrop-blur-xl px-3 py-1 rounded-full border border-pink-500/50 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,46,147,0.4)]"
          >
            <span>{currentPreset.icon}</span>
            <span>{currentPreset.name} Applied</span>
            <span className="text-pink-300 font-mono text-[10px]">({localIntensity}%)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Quick Slider Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2 w-full max-w-sm sm:max-w-md bg-[#0D0F1F]/95 backdrop-blur-2xl rounded-3xl p-3.5 sm:p-4 border border-pink-500/40 shadow-[0_0_35px_rgba(255,46,147,0.35)] text-white z-40"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-xs">
                  <Wand2 size={13} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1">
                    <span>Romantic 1v1 Video Filters</span>
                    <Sparkles size={12} className="text-[#FFD700] animate-spin" />
                  </h4>
                  <p className="text-[10px] text-pink-300">{currentPreset.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {onOpenFullDrawer && (
                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      onOpenFullDrawer();
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 font-bold flex items-center gap-1"
                  >
                    <span>Full Tray</span>
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Filter Presets Quick Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 py-2.5">
              {FILTER_PRESETS.slice(0, 6).map((preset) => {
                const isSelected = activeFilter === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectFilter(preset)}
                    className={`flex flex-col items-center p-1.5 rounded-2xl transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-b from-pink-500/30 to-purple-600/30 border-2 border-pink-400 shadow-[0_0_12px_rgba(255,46,147,0.5)] scale-105'
                        : 'bg-white/5 hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {preset.icon}
                    </span>
                    <span
                      className={`text-[9px] font-black mt-1 leading-tight text-center truncate max-w-[56px] ${
                        isSelected ? 'text-pink-300' : 'text-gray-300'
                      }`}
                    >
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-0.5 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Intensity Slider */}
            {activeFilter !== 'none' && (
              <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Sliders size={12} className="text-pink-400" />
                    <span>Filter Intensity</span>
                  </span>
                  <span className="text-pink-300 font-mono">{localIntensity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-mono">Soft</span>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    value={localIntensity}
                    onChange={handleIntensitySlider}
                    className="flex-1 accent-pink-500 h-1.5 bg-white/20 rounded-full cursor-pointer"
                  />
                  <span className="text-[10px] text-pink-400 font-mono">Max</span>
                </div>
              </div>
            )}

            {/* Self-Camera toggle if supported */}
            {onToggleApplyToSelf && (
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-gray-300">Also apply to your camera:</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleApplyToSelf(!applyToSelf);
                  }}
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 transition-all ${
                    applyToSelf
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {applyToSelf && <Check size={10} />}
                  <span>{applyToSelf ? 'Enabled' : 'Off'}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Filter Dock Pill (Always visible in Call Controls) */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-black/70 backdrop-blur-2xl px-3 sm:px-4 py-1.5 rounded-full border border-white/20 text-xs text-gray-300 shadow-2xl">
        {/* Toggle open detailed panel */}
        <button
          onClick={() => {
            sound.playClick();
            if (onOpenFullDrawer) {
              onOpenFullDrawer();
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          title="Open Video Filters & Overlays Interface"
          className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-extrabold pr-1.5 border-r border-white/15 cursor-pointer"
        >
          <Sparkles size={14} className="text-pink-400" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white">
            Filter:
          </span>
        </button>

        {/* Quick Filter Selection Buttons Carousel */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[240px] sm:max-w-md scroll-smooth">
          {FILTER_PRESETS.slice(0, 8).map((preset) => {
            const isSelected = activeFilter === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectFilter(preset)}
                className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white shadow-[0_0_12px_rgba(255,46,147,0.6)] scale-105 border border-pink-300/60'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* More Filters & Settings Full Interface Button */}
        <button
          onClick={() => {
            sound.playClick();
            if (onOpenFullDrawer) {
              onOpenFullDrawer();
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          title="Open Full Real-Time Filter Selection Tray"
          className="ml-1 px-2 py-0.5 rounded-full bg-pink-500/20 hover:bg-pink-500/40 border border-pink-400/40 text-pink-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
        >
          <Sliders size={10} />
          <span className="hidden sm:inline">More</span>
        </button>
      </div>
    </div>
  );
};
