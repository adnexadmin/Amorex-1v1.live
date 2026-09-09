import React from 'react';
import {
  Activity,
  Signal,
  Wifi,
  Radio,
  RefreshCw,
  Zap,
  ShieldCheck,
  Server,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { WebRtcStats } from '../../services/WebRtcService';
import { sound } from '../../utils/audio';

export interface WebRtcStatsModalProps {
  stats: WebRtcStats;
  callDuration: number;
  onClose: () => void;
  onSimulateSpike?: () => void;
  onSimulateDrop?: () => void;
  onRestartIce?: () => void;
}

export const WebRtcStatsModal: React.FC<WebRtcStatsModalProps> = ({
  stats,
  callDuration,
  onClose,
  onSimulateSpike,
  onSimulateDrop,
  onRestartIce
}) => {
  // Quality colors & helper tags
  const getQualityTheme = () => {
    switch (stats.connectionQuality) {
      case 'excellent':
        return {
          badgeText: 'Excellent Quality',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          indicatorColor: 'bg-emerald-400',
          textColor: 'text-emerald-400',
          rttEvaluation: 'Ultra-low Latency P2P',
          jitterEvaluation: 'Crystal Smooth Buffer',
          lossEvaluation: 'Near-Zero Loss'
        };
      case 'good':
        return {
          badgeText: 'Good Quality',
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          indicatorColor: 'bg-cyan-400',
          textColor: 'text-cyan-400',
          rttEvaluation: 'Standard P2P Route',
          jitterEvaluation: 'Stable Buffer',
          lossEvaluation: 'Acceptable Transport'
        };
      case 'fair':
        return {
          badgeText: 'Fair / Fluctuating',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          indicatorColor: 'bg-amber-400',
          textColor: 'text-amber-400',
          rttEvaluation: 'Elevated Network Latency',
          jitterEvaluation: 'Minor Variance Detected',
          lossEvaluation: 'Mild Packet Drop'
        };
      case 'poor':
      default:
        return {
          badgeText: 'Degraded Link',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          indicatorColor: 'bg-rose-500',
          textColor: 'text-rose-400',
          rttEvaluation: 'High Delay Detected',
          jitterEvaluation: 'High Jitter Fluctuation',
          lossEvaluation: 'Packet Loss Alert'
        };
    }
  };

  const theme = getQualityTheme();

  // RTT meter fill percentage (0ms to 200ms scale)
  const rttFillPercent = Math.min(100, Math.max(10, (stats.rttMs / 200) * 100));

  // Jitter meter fill percentage (0ms to 30ms scale)
  const jitterFillPercent = Math.min(100, Math.max(8, (stats.jitterMs / 30) * 100));

  // Loss meter fill percentage (0% to 5% scale)
  const lossFillPercent = Math.min(100, Math.max(5, (stats.packetLossPercentage / 5) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute top-14 sm:top-16 right-2 sm:right-6 z-40 w-[94vw] sm:w-[410px] max-w-[420px] bg-[#0A0D1B]/95 border border-cyan-500/40 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-[0_0_40px_rgba(0,210,255,0.2)] text-white select-none font-sans"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center">
            <Activity size={17} className="text-[#00D2FF]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-white tracking-tight">
                WebRTC Diagnostics
              </h3>
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${theme.badgeClass}`}>
                {theme.badgeText}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
              <Server size={10} className="text-cyan-400" />
              <span>Google STUN • P2P Interactive Stream</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close telemetry diagnostics"
        >
          <X size={14} />
        </button>
      </div>

      {/* 3 Core WebRTC Real-Time Health Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-3.5">
        {/* 1. ROUND-TRIP TIME (RTT) */}
        <div className="bg-white/[0.04] border border-white/10 hover:border-cyan-400/30 transition-colors rounded-2xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span className="font-bold flex items-center gap-1">
              <Radio size={11} className="text-cyan-400" />
              <span>RTT (Latency)</span>
            </span>
          </div>

          <div className="my-1.5">
            <div className="text-lg sm:text-xl font-mono font-black text-white flex items-baseline gap-0.5">
              <span>{stats.rttMs}</span>
              <span className="text-[10px] font-sans font-bold text-cyan-300">ms</span>
            </div>
            <span className="text-[9px] font-semibold text-gray-400 truncate block">
              {theme.rttEvaluation}
            </span>
          </div>

          {/* Meter progress */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                stats.rttMs < 60
                  ? 'bg-emerald-400'
                  : stats.rttMs < 120
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${rttFillPercent}%` }}
            />
          </div>
        </div>

        {/* 2. JITTER */}
        <div className="bg-white/[0.04] border border-white/10 hover:border-pink-400/30 transition-colors rounded-2xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span className="font-bold flex items-center gap-1">
              <Zap size={11} className="text-pink-400" />
              <span>Jitter</span>
            </span>
          </div>

          <div className="my-1.5">
            <div className="text-lg sm:text-xl font-mono font-black text-white flex items-baseline gap-0.5">
              <span>{stats.jitterMs.toFixed(1)}</span>
              <span className="text-[10px] font-sans font-bold text-pink-300">ms</span>
            </div>
            <span className="text-[9px] font-semibold text-gray-400 truncate block">
              {theme.jitterEvaluation}
            </span>
          </div>

          {/* Meter progress */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                stats.jitterMs < 6
                  ? 'bg-pink-400'
                  : stats.jitterMs < 15
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${jitterFillPercent}%` }}
            />
          </div>
        </div>

        {/* 3. PACKET LOSS PERCENTAGE */}
        <div className="bg-white/[0.04] border border-white/10 hover:border-amber-400/30 transition-colors rounded-2xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span className="font-bold flex items-center gap-1">
              <Signal size={11} className="text-amber-400" />
              <span>Packet Loss</span>
            </span>
          </div>

          <div className="my-1.5">
            <div className="text-lg sm:text-xl font-mono font-black text-white flex items-baseline gap-0.5">
              <span className={stats.packetLossPercentage > 2.0 ? 'text-rose-400' : 'text-emerald-300'}>
                {stats.packetLossPercentage.toFixed(2)}
              </span>
              <span className="text-[10px] font-sans font-bold text-amber-300">%</span>
            </div>
            <span className="text-[9px] font-semibold text-gray-400 truncate block">
              {theme.lossEvaluation}
            </span>
          </div>

          {/* Meter progress */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                stats.packetLossPercentage < 0.8
                  ? 'bg-emerald-400'
                  : stats.packetLossPercentage < 2.5
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${lossFillPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Granular Packet & Transport Breakdown */}
      <div className="mt-3 bg-black/40 border border-white/10 rounded-2xl p-3 font-mono text-[11px] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Packet Transmission:</span>
          <span className="text-white">
            <span className="text-emerald-400 font-bold">{stats.packetsReceived.toLocaleString()}</span> recvd /{' '}
            <span className={stats.packetsLost > 5 ? 'text-rose-400 font-bold' : 'text-gray-300'}>
              {stats.packetsLost} lost
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Video Resolution:</span>
          <span className="text-white font-semibold">{stats.resolution}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Bitrate &amp; Frame Rate:</span>
          <span className="text-cyan-300">
            {(stats.bitrateKbps / 1000).toFixed(2)} Mbps • {stats.fps} FPS
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">STUN ICE Server:</span>
          <span className="text-emerald-400">stun.l.google.com:19302</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Audio Codec &amp; AEC:</span>
          <span className="text-gray-300">Opus 48kHz (Echo Cancel Active)</span>
        </div>
      </div>

      {/* Network Test Simulation Buttons */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
        {onSimulateSpike && (
          <button
            onClick={() => {
              sound.playClick();
              onSimulateSpike();
            }}
            title="Simulate transient network jitter and packet loss"
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <Flame size={12} className="text-amber-400" />
            <span>Simulate Jitter Spike</span>
          </button>
        )}

        {onRestartIce && (
          <button
            onClick={() => {
              sound.playClick();
              onRestartIce();
            }}
            title="Re-trigger ICE candidate restart on active peer connection"
            className="py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw size={11} />
            <span>Restart ICE</span>
          </button>
        )}

        {onSimulateDrop && (
          <button
            onClick={() => {
              sound.playClick();
              onSimulateDrop();
            }}
            title="Simulate network disconnect to test auto-recovery"
            className="py-1.5 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <span>Drop Test</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
