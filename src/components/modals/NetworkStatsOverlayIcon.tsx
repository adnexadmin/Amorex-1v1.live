import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Signal,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Server,
  Wifi,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../../utils/audio';
import { CandidatePairDetails } from '../../hooks/useWebRtcMetrics';

export interface NetworkStatsOverlayIconProps {
  latencyMs: number; // Current ping / RTT in milliseconds
  bitrateKbps: number; // Current bitrate in kbps
  jitterMs?: number; // Packet jitter in milliseconds
  packetLossPercentage?: number; // Packet loss percentage
  fps?: number; // Frame rate
  resolution?: string; // Video resolution
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  qualityScore?: number; // 0 - 100 health score
  candidateDetails?: CandidatePairDetails;
  callDuration?: number; // Real-time session duration in seconds
  onSimulateSpike?: () => void;
  onTriggerReconnect?: () => void;
  onOpenFullDiagnostics?: () => void;
  className?: string;
  id?: string;
}

export const NetworkStatsOverlayIcon: React.FC<NetworkStatsOverlayIconProps> = ({
  latencyMs,
  bitrateKbps,
  jitterMs = 2.4,
  packetLossPercentage = 0.0,
  fps = 30,
  resolution = '1280x720 (HD 720p)',
  connectionQuality = 'excellent',
  qualityScore = 98,
  candidateDetails,
  callDuration,
  onSimulateSpike,
  onTriggerReconnect,
  onOpenFullDiagnostics,
  className = '',
  id = 'network-stats-overlay-icon'
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close details popover on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Format call duration nicely
  const formatDuration = (seconds?: number): string => {
    if (seconds === undefined) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format bitrate nicely: Mbps if >= 1000, else kbps
  const formatBitrate = (kbps: number): string => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${Math.round(kbps)} kbps`;
  };

  // Determine network strength: 'strong' (green), 'fair' (yellow), or 'weak' (red)
  const getNetworkStrength = () => {
    if (
      connectionQuality === 'poor' ||
      latencyMs > 150 ||
      (packetLossPercentage !== undefined && packetLossPercentage > 3.0) ||
      (jitterMs !== undefined && jitterMs > 20) ||
      (qualityScore !== undefined && qualityScore < 50)
    ) {
      return {
        level: 'weak' as const,
        label: 'Weak',
        bars: 1,
        color: {
          text: 'text-rose-400',
          bg: 'bg-rose-500',
          dot: 'bg-rose-500',
          border: 'border-rose-500/60',
          ring: 'ring-rose-500/30',
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50'
        },
        description: 'High latency or packet loss. Video quality adjusted.'
      };
    }

    if (
      connectionQuality === 'fair' ||
      latencyMs > 85 ||
      (packetLossPercentage !== undefined && packetLossPercentage > 1.2) ||
      (jitterMs !== undefined && jitterMs > 10) ||
      (qualityScore !== undefined && qualityScore < 75)
    ) {
      return {
        level: 'fair' as const,
        label: 'Fair',
        bars: 2,
        color: {
          text: 'text-amber-400',
          bg: 'bg-amber-400',
          dot: 'bg-amber-400',
          border: 'border-amber-500/60',
          ring: 'ring-amber-500/30',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
        },
        description: 'Moderate latency. Suitable for smooth call.'
      };
    }

    return {
      level: 'strong' as const,
      label: 'Strong',
      bars: 4,
      color: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-400',
        dot: 'bg-emerald-400',
        border: 'border-emerald-500/50',
        ring: 'ring-emerald-500/30',
        glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
      },
      description: 'Optimal connection. HD video & crystal audio.'
    };
  };

  const strength = getNetworkStrength();
  const pingColor = {
    text: strength.color.text,
    dot: strength.color.dot,
    border: strength.color.border
  };

  return (
    <div ref={containerRef} id={id} className={`relative select-none ${className}`}>
      {/* 1. NETWORK STRENGTH OVERLAY ICON & BUTTON (Displays Signal Bars, Quality & Ping) */}
      <button
        type="button"
        id={`${id}-toggle-btn`}
        onClick={() => {
          sound.playClick();
          setIsOpen((prev) => !prev);
        }}
        title={`Connection Quality: ${strength.label} (e.g. Green: Strong, Yellow: Fair, Red: Weak) • Ping: ${Math.round(latencyMs)}ms • Bitrate: ${formatBitrate(bitrateKbps)}`}
        className={`group bg-black/80 backdrop-blur-xl border rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.7)] cursor-pointer transition-all hover:scale-105 active:scale-95 ${
          isOpen
            ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-black/95'
            : `${strength.color.border} ${strength.color.glow} hover:border-white/50`
        }`}
        aria-expanded={isOpen}
        aria-label={`Network strength: ${strength.label}`}
      >
        {/* Tiered 4-Bar Cellular Signal Strength Icon (Green: Strong, Yellow: Fair, Red: Weak) */}
        <div
          id={`${id}-signal-bars`}
          className="flex items-end gap-[2px] h-3.5 w-3.5 shrink-0"
          title={`Signal Strength: ${strength.label} (${strength.bars}/4 bars)`}
          aria-hidden="true"
        >
          <span
            className={`w-[2.5px] rounded-xs transition-colors duration-300 ${
              strength.bars >= 1 ? strength.color.bg : 'bg-white/20'
            }`}
            style={{ height: '4px' }}
          />
          <span
            className={`w-[2.5px] rounded-xs transition-colors duration-300 ${
              strength.bars >= 2 ? strength.color.bg : 'bg-white/20'
            }`}
            style={{ height: '7px' }}
          />
          <span
            className={`w-[2.5px] rounded-xs transition-colors duration-300 ${
              strength.bars >= 3 ? strength.color.bg : 'bg-white/20'
            }`}
            style={{ height: '10px' }}
          />
          <span
            className={`w-[2.5px] rounded-xs transition-colors duration-300 ${
              strength.bars >= 4 ? strength.color.bg : 'bg-white/20'
            }`}
            style={{ height: '13px' }}
          />
        </div>

        {/* Live Network Strength Label (Strong / Fair / Weak) */}
        <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${strength.color.text}`}>
          {strength.label}
        </span>

        {/* Pulsing Status Dot */}
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${strength.color.dot}`}
          />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${strength.color.dot}`} />
        </span>

        {/* Divider */}
        <span className="text-white/20 text-[10px] font-bold">•</span>

        {/* Latency (Ping) Display */}
        <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-mono font-bold tracking-tight">
          <span className={strength.color.text}>{Math.round(latencyMs)}ms</span>
        </span>

        {/* Expand/Collapse Caret */}
        <span className="text-white/40 group-hover:text-white transition-colors ml-0.5">
          {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </span>
      </button>

      {/* 2. EXPANDED DETAILS PANEL (Visible ONLY When Clicked) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${id}-details-panel`}
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-0 z-50 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(0,210,255,0.15)] text-white text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Activity size={13} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white leading-tight">Network Diagnostics</h4>
                  <p className="text-[10px] text-gray-400">WebRTC Live Stream Stats</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Connection Quality Pill */}
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${strength.color.badgeBg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${strength.color.dot}`} />
                  {strength.label} ({qualityScore}%)
                </span>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsOpen(false);
                  }}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close network details"
                >
                  <X size={11} />
                </button>
              </div>
            </div>

            {/* Core Metrics: Ping & Bitrate Highlights */}
            <div className="grid grid-cols-2 gap-2 my-3">
              {/* Ping / Latency Box */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">Ping (Latency)</span>
                  <Zap size={11} className={pingColor.text} />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`font-mono text-lg font-black ${pingColor.text}`}>
                    {Math.round(latencyMs)}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">ms</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  {latencyMs < 50 ? 'Optimal for 1v1 video' : latencyMs < 100 ? 'Normal latency' : 'High network delay'}
                </p>
              </div>

              {/* Bitrate Box */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">Throughput (Bitrate)</span>
                  <Activity size={11} className="text-cyan-300" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-lg font-black text-cyan-300">
                    {(bitrateKbps / 1000).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Mbps</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5 font-mono">
                  {Math.round(bitrateKbps).toLocaleString()} kbps
                </p>
              </div>
            </div>

            {/* Detailed Secondary Metrics */}
            <div className="space-y-1.5 bg-black/40 rounded-xl p-2.5 border border-white/5 text-[10px]">
              {callDuration !== undefined && (
                <div className="flex items-center justify-between pb-1 mb-0.5 border-b border-white/10">
                  <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <Clock size={11} className="text-amber-400" />
                    Session Duration:
                  </span>
                  <span className="font-mono font-black text-amber-300 tracking-wider">
                    {formatDuration(callDuration)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Jitter (Arrival Delay Variance):</span>
                <span className="font-mono font-bold text-white">{jitterMs.toFixed(1)} ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Packet Loss:</span>
                <span
                  className={`font-mono font-bold ${
                    packetLossPercentage > 1.5 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {packetLossPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Frame Rate:</span>
                <span className="font-mono font-bold text-white">{fps} FPS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Resolution:</span>
                <span className="font-mono font-bold text-white truncate max-w-[140px]">{resolution}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span className="text-gray-400">Protocol:</span>
                <span className="font-mono font-medium text-gray-300">
                  {candidateDetails?.protocol || 'UDP (SRTP)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">STUN Server:</span>
                <span className="font-mono text-[9px] text-gray-400 truncate max-w-[150px]">
                  {candidateDetails?.relayServer || 'Google Public STUN'}
                </span>
              </div>
            </div>

            {/* Interactive Actions (Spike test & Reconnect) */}
            {(onSimulateSpike || onTriggerReconnect || onOpenFullDiagnostics) && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2">
                {onSimulateSpike && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSimulateSpike();
                    }}
                    title="Simulate network packet drop & jitter spike"
                    className="flex-1 min-w-[70px] py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <AlertTriangle size={10} />
                    <span>Test Spike</span>
                  </button>
                )}

                {onTriggerReconnect && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onTriggerReconnect();
                    }}
                    title="Trigger WebRTC ICE Restart"
                    className="flex-1 min-w-[70px] py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={10} />
                    <span>Reconnect</span>
                  </button>
                )}

                {onOpenFullDiagnostics && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsOpen(false);
                      onOpenFullDiagnostics();
                    }}
                    title="Open full WebRTC metrics & historical sparkline charts"
                    className="w-full py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 border border-white/20 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer mt-1"
                  >
                    <Sliders size={10} />
                    <span>Open Full Diagnostics & Trends</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
