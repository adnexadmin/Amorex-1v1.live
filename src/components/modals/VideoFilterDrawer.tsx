import React, { useState } from 'react';
import {
  Sparkles,
  Smile,
  Wand2,
  Heart,
  Sliders,
  X,
  Check,
  RotateCcw,
  Eye,
  Camera,
  Layers,
  Flame,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoFilterType } from '../../types';
import { FILTER_PRESETS, FilterPreset, FilterCategory } from '../common/VideoFilters';
import { sound } from '../../utils/audio';

export interface VideoFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: VideoFilterType;
  onFilterChange: (filter: VideoFilterType) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  target: 'host' | 'self' | 'both';
  onTargetChange: (target: 'host' | 'self' | 'both') => void;
  showOverlays: boolean;
  onToggleOverlays: (enabled: boolean) => void;
  onCompareHold?: (isComparing: boolean) => void;
}

export const VideoFilterDrawer: React.FC<VideoFilterDrawerProps> = ({
  isOpen,
  onClose,
  activeFilter,
  onFilterChange,
  intensity,
  onIntensityChange,
  target,
  onTargetChange,
  showOverlays,
  onToggleOverlays,
  onCompareHold
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [isComparing, setIsComparing] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredPresets = FILTER_PRESETS.filter((preset) => {
    if (selectedCategory === 'all') return true;
    return preset.category === selectedCategory;
  });

  const currentPreset = FILTER_PRESETS.find((p) => p.id === activeFilter) || FILTER_PRESETS[0];

  const handleSelect = (preset: FilterPreset) => {
    sound.playClick();
    onFilterChange(preset.id);
  };

  const handleReset = () => {
    sound.playClick();
    onFilterChange('none');
    onIntensityChange(100);
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
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto"
        />

        {/* Bottom Sheet Drawer */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-2xl bg-[#0c0d1e]/95 backdrop-blur-2xl border-t border-pink-500/40 rounded-t-3xl shadow-[0_-10px_40px_rgba(255,46,147,0.3)] text-white p-4 sm:p-5 pointer-events-auto max-h-[85vh] flex flex-col"
        >
          {/* Top Handle Drag Bar */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />

          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Wand2 size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>Romantic Overlays & Beauty Filters</span>
                  <span className="text-[10px] bg-pink-500/30 border border-pink-400/40 text-pink-300 font-bold px-2 py-0.5 rounded-full">
                    Real-Time 1v1
                  </span>
                </h3>
                <p className="text-[11px] text-pink-300 font-medium">
                  Active: <span className="text-white font-bold">{currentPreset.name}</span> ({intensity}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeFilter !== 'none' && (
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-gray-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                  title="Reset to Natural"
                >
                  <RotateCcw size={12} />
                  <span className="text-[11px]">Reset</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Presets', icon: '✨' },
              { id: 'romantic', label: '🌹 Romantic Overlays', icon: '💖' },
              { id: 'beauty', label: '✨ Beauty Mode', icon: '🌸' },
              { id: 'cinema', label: '🎬 Cinematic', icon: '🎞️' }
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(tab.id as FilterCategory);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/40 border border-pink-400/50'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Presets Grid */}
          <div className="overflow-y-auto pr-1 py-1 max-h-[36vh] sm:max-h-[40vh] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {filteredPresets.map((preset) => {
              const isSelected = activeFilter === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelect(preset)}
                  className={`relative flex flex-col items-start p-2.5 rounded-2xl text-left transition-all cursor-pointer border overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-pink-500/25 to-purple-700/25 border-pink-400 shadow-[0_0_18px_rgba(255,46,147,0.4)] scale-[1.02]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
                  }`}
                >
                  {/* Subtle Gradient Atmosphere in card */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${preset.previewGradient} opacity-25 group-hover:opacity-45 transition-opacity`}
                  />

                  {/* Top card bar: Icon + Selected checkmark */}
                  <div className="relative z-10 w-full flex items-center justify-between mb-1.5">
                    <span className="text-xl p-1 rounded-xl bg-black/40 backdrop-blur-md">
                      {preset.icon}
                    </span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400">
                        {preset.category}
                      </span>
                    )}
                  </div>

                  {/* Filter Name & Tagline */}
                  <div className="relative z-10 w-full">
                    <h4
                      className={`text-xs font-black truncate ${
                        isSelected ? 'text-white' : 'text-gray-200'
                      }`}
                    >
                      {preset.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5 leading-tight">
                      {preset.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls Panel (Intensity, Target, Particle Overlays, Compare) */}
          <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
            {/* Filter Intensity Slider (when not 'none') */}
            {activeFilter !== 'none' && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-gray-200">
                    <Sliders size={13} className="text-pink-400" />
                    <span>Filter Intensity</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((step) => (
                      <button
                        key={step}
                        onClick={() => onIntensityChange(step)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                          intensity === step
                            ? 'bg-pink-500 text-white font-bold'
                            : 'bg-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {step}%
                      </button>
                    ))}
                    <span className="font-mono text-pink-300 ml-1 text-xs">{intensity}%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  value={intensity}
                  onChange={(e) => onIntensityChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-full accent-pink-500 cursor-pointer"
                />
              </div>
            )}

            {/* Target Camera & Overlays Settings Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Camera Target Selector */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                  <Camera size={13} className="text-pink-400" />
                  <span>Apply To:</span>
                </span>
                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: 'host', label: 'Host' },
                      { id: 'self', label: 'Self' },
                      { id: 'both', label: 'Both' }
                    ] as const
                  ).map((tgt) => (
                    <button
                      key={tgt.id}
                      onClick={() => {
                        sound.playClick();
                        onTargetChange(tgt.id);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        target === tgt.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
                          : 'bg-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {tgt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Romantic Atmosphere Particles & Light Overlays Switch */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                  <Heart size={13} className="text-rose-400" />
                  <span>Romantic Overlays:</span>
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleOverlays(!showOverlays);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    showOverlays
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs shadow-pink-500/30'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={11} className={showOverlays ? 'animate-spin' : ''} />
                  <span>{showOverlays ? 'Particles Active' : 'Off'}</span>
                </button>
              </div>
            </div>

            {/* Hold to Compare Live Feed */}
            {activeFilter !== 'none' && (
              <div className="flex items-center justify-center pt-1">
                <button
                  onMouseDown={handleCompareStart}
                  onMouseUp={handleCompareEnd}
                  onTouchStart={handleCompareStart}
                  onTouchEnd={handleCompareEnd}
                  className={`w-full py-2 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                    isComparing
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.7)]'
                      : 'bg-white/5 hover:bg-white/10 border-white/15 text-gray-300'
                  }`}
                >
                  <Eye size={14} className={isComparing ? 'animate-pulse' : ''} />
                  <span>{isComparing ? 'Showing Original Video...' : 'Hold to View Original (Compare)'}</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
