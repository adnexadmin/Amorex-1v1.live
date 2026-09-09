import React, { useState } from 'react';
import {
  Activity,
  Signal,
  Wifi,
  WifiOff,
  Minimize2,
  Maximize2,
  X,
  Zap,
  RefreshCw,
  Server,
  Layers,
  ShieldCheck,
  Flame,
  Clock,
  ArrowDownUp,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WebRtcStats } from '../../services/WebRtcService';
import { MetricSample, CandidatePairDetails } from '../../hooks/useWebRtcMetrics';
import { sound } from '../../utils/audio';

export interface WebRtcMetricsOverlayProps {
  metrics: WebRtcStats;
  history: MetricSample[];
  candidateDetails: CandidatePairDetails;
  qualityScore: number;
  isOpen: boolean;
  onClose: () => void;
  onSimulateSpike?: () => void;
  onTriggerReconnect?: () => void;
  isCompactInitial?: boolean;
  callDuration?: number;
}

/**
 * SVG Sparkline Generator for live WebRTC trends (RTT, Jitter, Packet Loss)
 */
const MetricSparkline: React.FC<{
  data: number[];
  color: string;
  strokeWidth?: number;
  height?: number;
  minVal?: number;
  maxVal?: number;
}> = ({ data, color, strokeWidth = 2, height = 36, minVal, maxVal }) => {
  if (!data || data.length < 2) {
    return <div className="h-9 flex items-center justify-center text-[10px] text-gray-500">Sampling...</div>;
  }

  const min = minVal !== undefined ? minVal : Math.min(...data);
  const max = maxVal !== undefined ? Math.max(maxVal, Math.max(...data)) : Math.max(...data, 1);
  const range = max - min || 1;
  const width = 100;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-9 overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {/* Current point pulsing dot */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r="2.5"
          fill={color}
          className="animate-pulse"
        />
      )}
    </svg>
  );
};

export const WebRtcMetricsOverlay: React.FC<WebRtcMetricsOverlayProps> = ({
  metrics,
  history,
  candidateDetails,
  qualityScore,
  isOpen,
  onClose,
  onSimulateSpike,
  onTriggerReconnect,
  isCompactInitial = false,
  callDuration
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(isCompactInitial);
  const [activeTab, setActiveTab] = useState<'overview' | 'graphs' | 'transport'>('overview');

  if (!isOpen) return null;

  // Extract trend series
  const rttSeries = history.map((s) => s.rttMs);
  const jitterSeries = history.map((s) => s.jitterMs);
  const lossSeries = history.map((s) => s.packetLossPercentage);
  const bitrateSeries = history.map((s) => s.bitrateKbps);

  const avgRtt = rttSeries.length > 0 ? Math.round(rttSeries.reduce((a, b) => a + b, 0) / rttSeries.length) : metrics.rttMs;
  const maxRtt = rttSeries.length > 0 ? Math.max(...rttSeries) : metrics.rttMs;
  const avgJitter =
    jitterSeries.length > 0
      ? Number((jitterSeries.reduce((a, b) => a + b, 0) / jitterSeries.length).toFixed(1))
      : metrics.jitterMs;
  const peakLoss = lossSeries.length > 0 ? Math.max(...lossSeries) : metrics.packetLossPercentage;

  // Color mapping based on performance thresholds
  const rttColor = metrics.rttMs < 50 ? 'text-emerald-400' : metrics.rttMs < 110 ? 'text-amber-400' : 'text-rose-400';
  const jitterColor = metrics.jitterMs < 5.0 ? 'text-emerald-400' : metrics.jitterMs < 15.0 ? 'text-amber-400' : 'text-rose-400';
  const lossColor =
    metrics.packetLossPercentage === 0
      ? 'text-emerald-400'
      : metrics.packetLossPercentage < 1.5
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <AnimatePresence>
      {/* 1. COMPACT FLOATING HUD PILL (When Minimized) */}
      {isMinimized ? (
        <motion.div
          drag
          dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
          initial={{ opacity: 0, scale: 0.85, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -10 }}
          className="fixed top-18 left-4 z-40 bg-[#0B0D1B]/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-2.5 shadow-[0_0_25px_rgba(0,210,255,0.3)] text-white select-none cursor-move flex items-center gap-3"
        >
          {/* Pulsing Quality Indicator */}
          <div className="flex items-center gap-1.5 pl-1">
            <span
              className={`w-2 h-2 rounded-full ${
                metrics.connectionQuality === 'poor'
                  ? 'bg-rose-500 animate-ping'
                  : metrics.connectionQuality === 'fair'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400 animate-ping'
              }`}
            />
            <Activity size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Live</span>
          </div>

          {/* RTT */}
          <div className="flex flex-col border-l border-white/10 pl-2">
            <span className="text-[9px] text-gray-400 uppercase">RTT</span>
            <span className={`text-xs font-mono font-black ${rttColor}`}>{metrics.rttMs}ms</span>
          </div>

          {/* Jitter */}
          <div className="flex flex-col border-l border-white/10 pl-2">
            <span className="text-[9px] text-gray-400 uppercase">Jitter</span>
            <span className={`text-xs font-mono font-black ${jitterColor}`}>{metrics.jitterMs}ms</span>
          </div>

          {/* Packet Loss */}
          <div className="flex flex-col border-l border-white/10 pl-2">
            <span className="text-[9px] text-gray-400 uppercase">Loss</span>
            <span className={`text-xs font-mono font-black ${lossColor}`}>{metrics.packetLossPercentage.toFixed(1)}%</span>
          </div>

          {/* Expand / Close Controls */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                setIsMinimized(false);
              }}
              title="Expand Real-Time WebRTC Diagnostics"
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer transition-colors"
            >
              <Maximize2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onClose();
              }}
              title="Close Metrics Overlay"
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white cursor-pointer transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      ) : (
        /* 2. EXPANDED REAL-TIME WEBRTC METRICS DIAGNOSTICS MODAL OVERLAY */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
          {/* Subtle backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg bg-[#0A0D1E]/95 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(0,210,255,0.35)] text-white p-4 sm:p-5 pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Activity size={18} className="text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>WebRTC Real-Time Diagnostics</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold px-2 py-0.5 rounded-full font-mono">
                      1000ms Poll
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span>STUN Peer Connection Stats Report</span>
                    <span className="text-emerald-400 font-bold">• Score {qualityScore}/100</span>
                    {callDuration !== undefined && (
                      <span className="text-amber-300 font-mono font-bold flex items-center gap-1 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 rounded-md text-[10px]">
                        <Clock size={10} className="text-amber-400" />
                        {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsMinimized(true);
                  }}
                  title="Minimize to Floating HUD Pill"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Minimize2 size={13} />
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  title="Close"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 pt-3 pb-2">
              {[
                { id: 'overview', label: 'Telemetry Overview' },
                { id: 'graphs', label: 'Live Trend Graphs' },
                { id: 'transport', label: 'ICE & STUN Transport' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="overflow-y-auto pr-1 py-1 space-y-3 flex-1">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  {/* Primary 3 Key Metrics Cards: Jitter, Packet Loss, RTT */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {/* 1. Round-Trip Time (RTT) */}
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-cyan-400" />
                          <span>RTT</span>
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">Latency</span>
                      </div>
                      <div className={`text-xl sm:text-2xl font-black font-mono leading-tight ${rttColor}`}>
                        {metrics.rttMs}
                        <span className="text-xs font-normal text-gray-400 ml-0.5">ms</span>
                      </div>
                      <div className="mt-1 text-[10px] text-gray-400 flex items-center justify-between">
                        <span>Avg: {avgRtt}ms</span>
                        <span className="text-gray-500">Max: {maxRtt}</span>
                      </div>
                    </div>

                    {/* 2. Network Jitter */}
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        <span className="flex items-center gap-1">
                          <Activity size={11} className="text-amber-400" />
                          <span>Jitter</span>
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">Buffer</span>
                      </div>
                      <div className={`text-xl sm:text-2xl font-black font-mono leading-tight ${jitterColor}`}>
                        {metrics.jitterMs}
                        <span className="text-xs font-normal text-gray-400 ml-0.5">ms</span>
                      </div>
                      <div className="mt-1 text-[10px] text-gray-400 flex items-center justify-between">
                        <span>Avg: {avgJitter}ms</span>
                        <span className={metrics.jitterMs < 5 ? 'text-emerald-400' : 'text-amber-400'}>
                          {metrics.jitterMs < 5 ? 'Stable' : 'Varying'}
                        </span>
                      </div>
                    </div>

                    {/* 3. Packet Loss Percentage */}
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        <span className="flex items-center gap-1">
                          <ArrowDownUp size={11} className="text-rose-400" />
                          <span>Loss</span>
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">Drop</span>
                      </div>
                      <div className={`text-xl sm:text-2xl font-black font-mono leading-tight ${lossColor}`}>
                        {metrics.packetLossPercentage.toFixed(1)}
                        <span className="text-xs font-normal text-gray-400 ml-0.5">%</span>
                      </div>
                      <div className="mt-1 text-[10px] text-gray-400 flex items-center justify-between">
                        <span>Lost: {metrics.packetsLost}</span>
                        <span className="text-emerald-400">{metrics.packetLossPercentage === 0 ? '0% Drop' : 'Recovered'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Telemetry: Bitrate, FPS, Resolution */}
                  <div className="grid grid-cols-3 gap-2 bg-white/[0.03] border border-white/10 rounded-2xl p-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Bitrate</span>
                      <span className="font-mono font-bold text-white">{(metrics.bitrateKbps / 1000).toFixed(2)} Mbps</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Framerate</span>
                      <span className="font-mono font-bold text-emerald-400">{metrics.fps} FPS</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Resolution</span>
                      <span className="font-mono font-bold text-cyan-300 truncate block">{metrics.resolution.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Real-time Health Rating Bar */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="flex items-center gap-1.5 text-gray-200">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span>Connection Health Score</span>
                      </span>
                      <span className="font-mono text-cyan-300">{qualityScore} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${qualityScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                      {qualityScore >= 85
                        ? 'Optimal HD audio/video sync with low jitter and zero packet loss.'
                        : qualityScore >= 60
                        ? 'Minor network fluctuation detected; adaptive bitrate algorithm active.'
                        : 'Degraded connection; automatic ICE candidate renegotiation scheduled.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE TREND GRAPHS */}
              {activeTab === 'graphs' && (
                <div className="space-y-2.5">
                  {/* RTT Sparkline */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2.5">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <Clock size={12} />
                        <span>Round-Trip Time (RTT) History</span>
                      </span>
                      <span className="font-mono text-cyan-400 text-[11px]">{metrics.rttMs} ms</span>
                    </div>
                    <MetricSparkline data={rttSeries} color="#00D2FF" minVal={10} maxVal={160} />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-0.5">
                      <span>-30s</span>
                      <span>Target &lt; 50ms</span>
                      <span>Now</span>
                    </div>
                  </div>

                  {/* Jitter Sparkline */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2.5">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <Activity size={12} />
                        <span>Packet Jitter History</span>
                      </span>
                      <span className="font-mono text-amber-400 text-[11px]">{metrics.jitterMs} ms</span>
                    </div>
                    <MetricSparkline data={jitterSeries} color="#FBBF24" minVal={0} maxVal={25} />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-0.5">
                      <span>-30s</span>
                      <span>Optimal &lt; 5ms</span>
                      <span>Now</span>
                    </div>
                  </div>

                  {/* Packet Loss Sparkline */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2.5">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-1.5 text-rose-300">
                        <ArrowDownUp size={12} />
                        <span>Packet Loss Percentage History</span>
                      </span>
                      <span className="font-mono text-rose-400 text-[11px]">{metrics.packetLossPercentage.toFixed(1)}%</span>
                    </div>
                    <MetricSparkline data={lossSeries} color="#FB7185" minVal={0} maxVal={8} />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-0.5">
                      <span>-30s</span>
                      <span>Peak: {peakLoss.toFixed(1)}%</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TRANSPORT & ICE STUN DETAILS */}
              {activeTab === 'transport' && (
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-gray-400 font-medium">STUN Server</span>
                      <span className="font-mono font-bold text-cyan-300">stun.l.google.com:19302</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-gray-400 font-medium">Candidate Pair</span>
                      <span className="font-mono font-bold text-white">{candidateDetails.localCandidateType} ➔ {candidateDetails.remoteCandidateType}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-gray-400 font-medium">Transport Protocol</span>
                      <span className="font-mono font-bold text-emerald-400">{candidateDetails.protocol}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-gray-400 font-medium">ICE State</span>
                      <span className="font-mono font-bold text-cyan-400 capitalize">{candidateDetails.transportState}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Packets Total</span>
                      <span className="font-mono text-gray-300">
                        {metrics.packetsReceived.toLocaleString()} received / {metrics.packetsLost} lost
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Interactive QA Diagnostics Action Toolbar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {onSimulateSpike && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSimulateSpike();
                    }}
                    title="Simulate transient packet jitter and loss spike"
                    className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold text-amber-200 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Flame size={12} />
                    <span>Simulate Spike</span>
                  </button>
                )}
                {onTriggerReconnect && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onTriggerReconnect();
                    }}
                    title="Simulate ICE restart and reconnect negotiation"
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-bold text-cyan-200 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Test ICE Restart</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsMinimized(true);
                }}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                Dock to HUD
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
