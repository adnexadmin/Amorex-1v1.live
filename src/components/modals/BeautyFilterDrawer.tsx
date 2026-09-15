import React, { useState } from 'react';
import {
  Sparkles,
  Smile,
  Sliders,
  X,
  Check,
  RotateCcw,
  Eye,
  Sun,
  Palette,
  Heart,
  Wand2,
  Droplet,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BeautyFilterSettings, BeautyPresetType } from '../../types';
import { sound } from '../../utils/audio';

export interface BeautyFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BeautyFilterSettings;
  onChange: (settings: BeautyFilterSettings) => void;
  onCompareHold?: (isComparing: boolean) => void;
}

export const BEAUTY_PRESETS: Record<
  BeautyPresetType,
  {
    name: string;
    description: string;
    icon: string;
    color: string;
    settings: Omit<BeautyFilterSettings, 'enabled' | 'target'>;
  }
> = {
  natural: {
    name: 'Natural Glow',
    description: 'Clean subtle brightness & soft skin refinement',
    icon: '🌿',
    color: 'from-emerald-400 to-teal-400',
    settings: {
      preset: 'natural',
      brightness: 110,
      saturation: 114,
      contrast: 102,
      smoothness: 25,
      warmth: 15,
      overlayGlow: true
    }
  },
  rosy: {
    name: 'Rosy Radiance',
    description: 'Flattering pink blush tone & luminous cheek glow',
    icon: '🌸',
    color: 'from-pink-400 to-rose-400',
    settings: {
      preset: 'rosy',
      brightness: 114,
      saturation: 128,
      contrast: 104,
      smoothness: 35,
      warmth: 40,
      overlayGlow: true
    }
  },
  porcelain: {
    name: 'Porcelain Smooth',
    description: 'Silky smooth complexion with pure high-definition clarity',
    icon: '💎',
    color: 'from-cyan-400 to-blue-400',
    settings: {
      preset: 'porcelain',
      brightness: 118,
      saturation: 108,
      contrast: 105,
      smoothness: 65,
      warmth: 5,
      overlayGlow: false
    }
  },
  glow: {
    name: 'Sunlit Warmth',
    description: 'Golden hour amber warmth & sun-kissed vibrance',
    icon: '☀️',
    color: 'from-amber-400 to-orange-400',
    settings: {
      preset: 'glow',
      brightness: 116,
      saturation: 135,
      contrast: 106,
      smoothness: 35,
      warmth: 50,
      overlayGlow: true
    }
  },
  glamour: {
    name: 'Glamour Chic',
    description: 'Maximum luminosity, vivid colors & radiant halo',
    icon: '✨',
    color: 'from-fuchsia-400 to-pink-500',
    settings: {
      preset: 'glamour',
      brightness: 122,
      saturation: 140,
      contrast: 108,
      smoothness: 45,
      warmth: 30,
      overlayGlow: true
    }
  },
  custom: {
    name: 'Custom',
    description: 'Hand-tuned brightness, vibrance & skin smoothing',
    icon: '🎨',
    color: 'from-purple-400 to-indigo-400',
    settings: {
      preset: 'custom',
      brightness: 114,
      saturation: 126,
      contrast: 104,
      smoothness: 35,
      warmth: 30,
      overlayGlow: true
    }
  }
};

export const DEFAULT_BEAUTY_SETTINGS: BeautyFilterSettings = {
  enabled: true,
  preset: 'rosy',
  brightness: 114,
  saturation: 128,
  contrast: 104,
  smoothness: 35,
  warmth: 40,
  overlayGlow: true,
  target: 'self'
};

export function getBeautyFilterCSS(settings: BeautyFilterSettings): string {
  if (!settings.enabled) return 'none';

  const b = (settings.brightness / 100).toFixed(2);
  const s = (settings.saturation / 100).toFixed(2);
  const c = (settings.contrast / 100).toFixed(2);
  const blurPx = ((settings.smoothness / 100) * 0.7).toFixed(2);
  const sepiaVal = ((settings.warmth / 100) * 0.12).toFixed(2);
  const hueDeg = Math.round((settings.warmth / 100) * -8);
  const shadowAlpha = (0.28 * (settings.brightness / 100)).toFixed(2);

  const parts = [
    `brightness(${b})`,
    `saturate(${s})`,
    `contrast(${c})`
  ];

  if (parseFloat(blurPx) > 0.05) {
    parts.push(`blur(${blurPx}px)`);
  }
  if (parseFloat(sepiaVal) > 0.01) {
    parts.push(`sepia(${sepiaVal})`);
    parts.push(`hue-rotate(${hueDeg}deg)`);
  }
  if (settings.preset === 'glow' || settings.preset === 'glamour') {
    parts.push(`drop-shadow(0 0 10px rgba(255, 182, 193, ${shadowAlpha}))`);
  }

  return parts.join(' ');
}

export const BEAUTY_STORAGE_KEY = 'amorex_beauty_filter_settings';

export function getStoredBeautySettings(): BeautyFilterSettings {
  if (typeof window === 'undefined') return DEFAULT_BEAUTY_SETTINGS;
  try {
    const raw = localStorage.getItem(BEAUTY_STORAGE_KEY);
    if (!raw) return DEFAULT_BEAUTY_SETTINGS;
    return { ...DEFAULT_BEAUTY_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_BEAUTY_SETTINGS;
  }
}

export function saveStoredBeautySettings(settings: BeautyFilterSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BEAUTY_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export const BeautyFilterDrawer: React.FC<BeautyFilterDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
  onCompareHold
}) => {
  const [isComparing, setIsComparing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTogglePower = () => {
    sound.playClick();
    const updated = { ...settings, enabled: !settings.enabled };
    onChange(updated);
    saveStoredBeautySettings(updated);
  };

  const handleSelectPreset = (presetKey: BeautyPresetType) => {
    sound.playClick();
    const presetData = BEAUTY_PRESETS[presetKey].settings;
    const updated: BeautyFilterSettings = {
      ...settings,
      ...presetData,
      enabled: true,
      preset: presetKey
    };
    onChange(updated);
    saveStoredBeautySettings(updated);
  };

  const handleSliderChange = (key: keyof BeautyFilterSettings, value: number | boolean | string) => {
    const updated: BeautyFilterSettings = {
      ...settings,
      preset: 'custom',
      [key]: value
    };
    onChange(updated);
    saveStoredBeautySettings(updated);
  };

  const handleReset = () => {
    sound.playClick();
    onChange(DEFAULT_BEAUTY_SETTINGS);
    saveStoredBeautySettings(DEFAULT_BEAUTY_SETTINGS);
  };

  const handleCompareStart = () => {
    setIsComparing(true);
    if (onCompareHold) onCompareHold(true);
  };

  const handleCompareEnd = () => {
    setIsComparing(false);
    if (onCompareHold) onCompareHold(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-xl bg-[#0e1022]/95 backdrop-blur-2xl border-t border-pink-500/40 rounded-t-3xl shadow-[0_-10px_40px_rgba(255,46,147,0.35)] text-white p-4 sm:p-5 pointer-events-auto max-h-[85vh] flex flex-col overflow-y-auto"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
                <Sparkles size={18} className={settings.enabled ? 'animate-pulse' : ''} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white">Real-Time Beauty Filter</h3>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
                      settings.enabled
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_10px_rgba(255,46,147,0.4)]'
                        : 'bg-white/10 text-gray-400 border-white/10'
                    }`}
                  >
                    {settings.enabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">GPU-accelerated live skin smoothing & radiance</p>
              </div>
            </div>

            {/* Quick Master Toggle Switch */}
            <div className="flex items-center gap-2">
              <button
                id="beauty-filter-master-toggle"
                onClick={handleTogglePower}
                title={settings.enabled ? 'Turn Beauty Filter Off' : 'Turn Beauty Filter On'}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  settings.enabled
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/50 scale-105'
                    : 'bg-white/15 text-gray-300 hover:bg-white/25 border border-white/20'
                }`}
              >
                <Wand2 size={13} />
                <span>{settings.enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
              <button
                onClick={onClose}
                aria-label="Close Beauty Filter"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Target Selector */}
          <div className="mt-3.5 flex items-center justify-between bg-white/5 rounded-2xl p-1.5 border border-white/10">
            <span className="text-[11px] font-bold text-gray-300 pl-2">Apply Filter To:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'self', label: 'My Camera (PiP)' },
                { id: 'both', label: 'Both' },
                { id: 'host', label: 'Host Stream' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    sound.playClick();
                    handleSliderChange('target', opt.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.target === opt.id
                      ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Chips */}
          <div className="mt-4">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-pink-300 flex items-center gap-1.5 mb-2">
              <Smile size={12} />
              <span>Beauty Presets</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Object.keys(BEAUTY_PRESETS) as BeautyPresetType[]).map((key) => {
                const preset = BEAUTY_PRESETS[key];
                const isSelected = settings.preset === key && settings.enabled;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer text-center relative ${
                      isSelected
                        ? 'bg-pink-500/25 border-pink-400 text-white shadow-[0_0_15px_rgba(255,46,147,0.3)] ring-1 ring-pink-400'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl mb-1">{preset.icon}</span>
                    <span className="text-[10px] font-black leading-tight line-clamp-1">{preset.name}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Parameter Sliders */}
          <div className="mt-4 space-y-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <Sun size={13} className="text-amber-400" />
                  <span>Brightness (Exposure)</span>
                </span>
                <span className="font-mono text-[11px] font-black text-amber-300">
                  {settings.brightness > 100 ? `+${settings.brightness - 100}%` : `${settings.brightness}%`}
                </span>
              </div>
              <input
                type="range"
                min="90"
                max="145"
                step="1"
                value={settings.brightness}
                onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/15 rounded-lg"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <Palette size={13} className="text-pink-400" />
                  <span>Saturation & Color Vibrance</span>
                </span>
                <span className="font-mono text-[11px] font-black text-pink-300">
                  {settings.saturation > 100 ? `+${settings.saturation - 100}%` : `${settings.saturation}%`}
                </span>
              </div>
              <input
                type="range"
                min="90"
                max="160"
                step="1"
                value={settings.saturation}
                onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value, 10))}
                className="w-full accent-pink-400 cursor-pointer h-1.5 bg-white/15 rounded-lg"
              />
            </div>

            {/* Skin Softening / Smoothness */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <Droplet size={13} className="text-cyan-400" />
                  <span>Skin Softening & Smoothing</span>
                </span>
                <span className="font-mono text-[11px] font-black text-cyan-300">
                  {settings.smoothness}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={settings.smoothness}
                onChange={(e) => handleSliderChange('smoothness', parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/15 rounded-lg"
              />
            </div>

            {/* Warm Rosy Blush Tone */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <Heart size={13} className="text-rose-400" />
                  <span>Rosy Blush Tone</span>
                </span>
                <span className="font-mono text-[11px] font-black text-rose-300">
                  {settings.warmth}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={settings.warmth}
                onChange={(e) => handleSliderChange('warmth', parseInt(e.target.value, 10))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-white/15 rounded-lg"
              />
            </div>

            {/* Soft Radiance Overlay Toggle */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-pink-400" />
                <span className="text-xs font-bold text-gray-200">Soft Radiance CSS Vignette Overlay</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  handleSliderChange('overlayGlow', !settings.overlayGlow);
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  settings.overlayGlow ? 'bg-pink-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.overlayGlow ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            {/* Compare Hold Button */}
            <button
              onMouseDown={handleCompareStart}
              onMouseUp={handleCompareEnd}
              onTouchStart={handleCompareStart}
              onTouchEnd={handleCompareEnd}
              className={`flex-1 py-2 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                isComparing
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'bg-white/10 hover:bg-white/20 text-cyan-300 border-cyan-400/40'
              }`}
            >
              <Eye size={14} />
              <span>{isComparing ? 'Showing Original' : 'Hold to Compare'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              title="Reset to Default Beauty Settings"
              className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            {/* Done Button */}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black shadow-lg shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <Check size={14} />
              <span>Apply</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
