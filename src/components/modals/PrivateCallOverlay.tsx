import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StreamHost, UserProfile, VideoFilterType, MomentPost } from '../../types';
import { sound } from '../../utils/audio';
import { useWebRtcCall } from '../../hooks/useWebRtcCall';
import { useWebRtcMetrics } from '../../hooks/useWebRtcMetrics';
import { useDeviceOrientation } from '../../hooks/useDeviceOrientation';
import { VideoFilters, getVideoFilterCSS, FILTER_PRESETS } from '../common/VideoFilters';
import { RomanticOverlaysLayer } from '../common/RomanticOverlaysLayer';
import { VideoFilterDrawer } from './VideoFilterDrawer';
import { WebRtcMetricsOverlay } from '../common/WebRtcMetricsOverlay';
import { PostCallSummary, PostCallRatingData } from './PostCallSummary';
import { WebRtcStatsModal } from './WebRtcStatsModal';
import { NetworkStatsOverlayIcon } from './NetworkStatsOverlayIcon';
import { ReportUserModal } from './ReportUserModal';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Gift,
  Sparkles,
  Smile,
  Wand2,
  Languages,
  SwitchCamera,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Signal,
  Maximize2,
  Volume2,
  VolumeX,
  AlertCircle,
  RefreshCw,
  WifiOff,
  CheckCircle2,
  ScreenShare,
  ScreenShareOff,
  Minimize2,
  ArrowLeftRight,
  Camera,
  Download,
  Clock,
  Timer,
  RotateCcw,
  Smartphone,
  Monitor,
  Scan
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export interface PrivateCallOverlayProps {
  host: StreamHost;
  user: UserProfile;
  onEndCall: (durationSec: number, coinsCharged: number, rating?: number) => void;
  onOpenGiftDrawer: () => void;
  onDeductCoins: (amount: number) => boolean;
}

export const PrivateCallOverlay: React.FC<PrivateCallOverlayProps> = ({
  host,
  user,
  onEndCall,
  onOpenGiftDrawer,
  onDeductCoins
}) => {
  const [callDuration, setCallDuration] = useState<number>(0);
  const [videoFilter, setVideoFilter] = useState<VideoFilterType>('heart-aura');
  const [filterIntensity, setFilterIntensity] = useState<number>(100);
  const [filterTarget, setFilterTarget] = useState<'host' | 'self' | 'both'>('both');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [liveTranslationEnabled, setLiveTranslationEnabled] = useState<boolean>(true);
  const [subtitleText, setSubtitleText] = useState<string>('');
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [isPipMinimized, setIsPipMinimized] = useState<boolean>(false);
  const [showPostCallSummary, setShowPostCallSummary] = useState<boolean>(false);
  const [finalCallStats, setFinalCallStats] = useState<{ duration: number; coins: number }>({
    duration: 0,
    coins: 0
  });
  const [dismissedPoorConnection, setDismissedPoorConnection] = useState<boolean>(false);
  const [screenShareDuration, setScreenShareDuration] = useState<number>(0);
  const [isScreenMaximized, setIsScreenMaximized] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const connectedAtRef = useRef<number | null>(null);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState<boolean>(false);
  const hostVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasRemoteTrack, setHasRemoteTrack] = useState<boolean>(false);

  const { orientation, isLandscape, isPortrait, aspectRatio: viewportAspectRatio, isRotating } = useDeviceOrientation();
  const [aspectRatioFitMode, setAspectRatioFitMode] = useState<'auto' | 'contain' | 'cover' | '16:9' | '9:16'>('auto');

  const [streamResolution, setStreamResolution] = useState<{ width: number; height: number; aspectRatio: number }>({
    width: 0,
    height: 0,
    aspectRatio: 16 / 9
  });

  const [orientationToast, setOrientationToast] = useState<string | null>(null);
  const prevOrientationRef = useRef<string>(orientation);

  useEffect(() => {
    if (prevOrientationRef.current !== orientation) {
      const modeLabel = orientation === 'landscape' ? 'Landscape (16:9 Widescreen)' : 'Portrait (9:16 Mobile)';
      setOrientationToast(`Switched to ${modeLabel}`);
      const timer = setTimeout(() => setOrientationToast(null), 2500);
      prevOrientationRef.current = orientation;
      return () => clearTimeout(timer);
    }
  }, [orientation]);

  const handleRemoteVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setStreamResolution({
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight
      });
    }
  };

  const effectiveFitMode = useMemo(() => {
    if (aspectRatioFitMode !== 'auto') return aspectRatioFitMode;
    if (streamResolution.width > 0 && streamResolution.height > 0) {
      const streamIsLandscape = streamResolution.width > streamResolution.height;
      if (streamIsLandscape === isLandscape) return 'cover';
      return 'contain';
    }
    return isLandscape ? 'contain' : 'cover';
  }, [aspectRatioFitMode, streamResolution, isLandscape]);

  const cycleAspectRatioMode = () => {
    sound.playClick();
    const modes: Array<'auto' | 'contain' | 'cover' | '16:9' | '9:16'> = ['auto', 'contain', 'cover', '16:9', '9:16'];
    const currentIndex = modes.indexOf(aspectRatioFitMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setAspectRatioFitMode(nextMode);
  };

  // Deterministic shared Call ID for two cross-device participants
  const sharedCallSessionId = useMemo(() => {
    const p1 = (user.id || user.displayId || 'user_1').trim();
    const p2 = (host.id || host.displayId || 'host_2').trim();
    return [p1, p2].sort().join('_call_');
  }, [user.id, user.displayId, host.id, host.displayId]);

  // WebRTC Call Hook connected to Firebase Signaling
  const {
    localVideoRef,
    remoteVideoRef,
    callState,
    isMicMuted,
    isVideoOff,
    isScreenSharing,
    stats,
    localVolume,
    hasPermission,
    permissionError,
    reconnectToast,
    rtcService,
    getPeerConnection,
    toggleMic,
    toggleVideo,
    switchCamera,
    toggleScreenShare,
    triggerManualReconnect,
    simulateNetworkDrop,
    simulateNetworkSpike,
    dismissToast,
    sendDataMessage,
    endCall: closeRtc
  } = useWebRtcCall({
    autoConnect: true,
    isVideoCall: true,
    callId: sharedCallSessionId,
    isCaller: true
  });

  const [micStatusToast, setMicStatusToast] = useState<string | null>(null);

  const handleToggleMicWithFeedback = () => {
    sound.playClick();
    toggleMic();
    const willBeMuted = !isMicMuted;
    setMicStatusToast(
      willBeMuted
        ? 'Microphone Muted: Audio paused 🔇'
        : 'Microphone Active: Transmitting audio 🎙️'
    );
    setTimeout(() => setMicStatusToast(null), 2400);
  };

  const [videoStatusToast, setVideoStatusToast] = useState<string | null>(null);

  const handleToggleVideoWithFeedback = () => {
    sound.playClick();
    toggleVideo();
    const willBeOff = !isVideoOff;
    setVideoStatusToast(
      willBeOff
        ? 'Camera Disabled: Video off 🙈'
        : 'Camera Active: Video broadcasting live 📹'
    );
    setTimeout(() => setVideoStatusToast(null), 2400);
  };

  useEffect(() => {
    if (!isScreenSharing) {
      setScreenShareDuration(0);
      setIsScreenMaximized(false);
      return;
    }
    const interval = setInterval(() => setScreenShareDuration((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isScreenSharing]);

  const {
    metrics: liveMetrics,
    history: metricsHistory,
    candidateDetails,
    qualityScore
  } = useWebRtcMetrics({
    peerConnection: getPeerConnection(),
    rtcService,
    intervalMs: 1000,
    enabled: true
  });

  const networkStrength = useMemo(() => {
    const rtt = liveMetrics.rttMs || liveMetrics.latencyMs;
    const packetLoss = liveMetrics.packetLossPercentage;
    const jitter = liveMetrics.jitterMs;
    const quality = liveMetrics.connectionQuality;

    if (quality === 'poor' || rtt > 150 || packetLoss > 3.0 || jitter > 20 || qualityScore < 50) {
      return {
        level: 'weak' as const,
        label: 'Weak',
        bars: 1,
        text: 'text-rose-400',
        bg: 'bg-rose-500'
      };
    }

    if (quality === 'fair' || rtt > 85 || packetLoss > 1.2 || jitter > 10 || qualityScore < 75) {
      return {
        level: 'fair' as const,
        label: 'Fair',
        bars: 2,
        text: 'text-amber-400',
        bg: 'bg-amber-400'
      };
    }

    return {
      level: 'strong' as const,
      label: 'Strong',
      bars: 4,
      text: 'text-emerald-400',
      bg: 'bg-emerald-400'
    };
  }, [liveMetrics, qualityScore]);

  const isPoorConnection =
    !dismissedPoorConnection &&
    (liveMetrics.jitterMs > 15 || liveMetrics.packetLossPercentage > 2.0 || liveMetrics.connectionQuality === 'poor');

  useEffect(() => {
    if (liveMetrics.jitterMs <= 12 && liveMetrics.packetLossPercentage <= 1.5 && liveMetrics.connectionQuality !== 'poor') {
      setDismissedPoorConnection(false);
    }
  }, [liveMetrics.jitterMs, liveMetrics.packetLossPercentage, liveMetrics.connectionQuality]);

  useEffect(() => {
    sound.playCallRinging();
    const subtitleTimer = setTimeout(() => {
      sound.playHeartLike();
      setSubtitleText(`[Live Call] ${host.name}: "Connected live on WebRTC! 💖"`);
    }, 2400);

    return () => clearTimeout(subtitleTimer);
  }, [host.name]);

  // Detect real incoming remote video and audio tracks
  useEffect(() => {
    const checkTracks = () => {
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const stream = remoteVideoRef.current.srcObject as MediaStream;
        const tracks = stream.getVideoTracks();
        const hasLive = tracks.length > 0 && tracks.some((t) => t.readyState === 'live' && t.enabled);
        setHasRemoteTrack(hasLive);
        remoteVideoRef.current.muted = isSpeakerMuted;
      } else {
        setHasRemoteTrack(false);
      }
    };
    checkTracks();
    const interval = setInterval(checkTracks, 1000);
    return () => clearInterval(interval);
  }, [remoteVideoRef, isSpeakerMuted]);

  // Real-Time Call Duration & Coin Deduction
  useEffect(() => {
    if (showPostCallSummary || callState === 'closed') return;

    if (callState !== 'connected') {
      if (connectedAtRef.current === null) setCallDuration(0);
      return;
    }

    if (connectedAtRef.current === null) {
      connectedAtRef.current = Date.now();
      sound.playCallConnected();
    }

    const syncElapsed = () => {
      if (!connectedAtRef.current) return 0;
      const elapsed = Math.max(0, Math.floor((Date.now() - connectedAtRef.current) / 1000));
      setCallDuration(elapsed);
      return elapsed;
    };

    syncElapsed();

    const interval = setInterval(() => {
      const elapsed = syncElapsed();
      const hasActiveVoucher = user.vouchers > 0;
      const isFreePeriod = hasActiveVoucher && elapsed <= 180;

      if (!isFreePeriod && elapsed > 0 && elapsed % 60 === 0) {
        const success = onDeductCoins(60);
        if (!success) {
          sound.playAlert();
          closeRtc();
          const totalCoins = Math.floor((elapsed - (hasActiveVoucher ? 180 : 0)) / 60) * 60;
          setFinalCallStats({ duration: elapsed, coins: Math.max(0, totalCoins) });
          setShowPostCallSummary(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, onDeductCoins, closeRtc, showPostCallSummary, user.vouchers]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHangUp = () => {
    sound.playEndCall();
    closeRtc();

    if (connectedAtRef.current === null) {
      onEndCall(0, 0);
      return;
    }

    const currentDuration = Math.max(
      callDuration,
      Math.floor((Date.now() - connectedAtRef.current) / 1000)
    );
    const hasActiveVoucher = user.vouchers > 0;
    const billableSeconds = hasActiveVoucher ? Math.max(0, currentDuration - 180) : currentDuration;
    const totalCoins = Math.floor(billableSeconds / 60) * 60;

    setFinalCallStats({ duration: currentDuration, coins: Math.max(0, totalCoins) });
    setShowPostCallSummary(true);
  };

  const handleSendInCallHeartExplosion = () => {
    sound.playHeartLike();
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FF2E93', '#FF80AB', '#FF1744', '#FFD700']
    });
    sendDataMessage({ type: 'HEART_REACTION', timestamp: Date.now() });
  };

  const activeFilterCSS = isComparing ? 'none' : getVideoFilterCSS(videoFilter, filterIntensity);
  const applyFilterToHost = (filterTarget === 'host' || filterTarget === 'both') && !isComparing;
  const applyFilterToSelf = (filterTarget === 'self' || filterTarget === 'both') && !isComparing;

  if (showPostCallSummary) {
    return (
      <PostCallSummary
        host={host}
        user={user}
        durationSec={finalCallStats.duration}
        coinsCharged={finalCallStats.coins}
        stats={liveMetrics}
        onClose={(ratingData) => {
          onEndCall(finalCallStats.duration, finalCallStats.coins, ratingData?.rating);
        }}
        onCallAgain={() => {
          setShowPostCallSummary(false);
          connectedAtRef.current = null;
          setCallDuration(0);
          triggerManualReconnect();
        }}
      />
    );
  }

  return (
    <div
      id="active-call-modal-overlay"
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between select-none overflow-hidden font-sans w-screen h-screen h-[100dvh] w-[100dvw]"
    >
      {/* 1. REMOTE STREAM VIEWPORT */}
      <div
        id="active-call-viewport"
        className={`absolute inset-0 w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center transition-all duration-500 ease-out ${
          isRotating ? 'scale-[0.99] blur-[0.5px]' : 'scale-100'
        }`}
      >
        <div
          id="active-call-aspect-container"
          className="relative z-10 flex items-center justify-center w-full h-full overflow-hidden"
        >
          {/* Real Live Remote WebRTC Video Track (Connected User/Host Camera) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={isSpeakerMuted}
            onLoadedMetadata={handleRemoteVideoMetadata}
            onResize={handleRemoteVideoMetadata}
            style={{
              filter: applyFilterToHost ? activeFilterCSS : 'none',
              transition: 'filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className={`max-w-full max-h-full transition-all duration-500 ease-out ${
              effectiveFitMode === 'cover' ? 'w-full h-full object-cover' : 'w-full h-full object-contain'
            } ${hasRemoteTrack ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none absolute'}`}
          />

          {/* Fallback Display While Waiting for Remote Peer Connection */}
          <div
            className={`w-full h-full transition-opacity duration-700 flex items-center justify-center ${
              hasRemoteTrack ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'
            }`}
          >
            {host.videoUrl ? (
              <video
                ref={hostVideoRef}
                src={host.videoUrl}
                autoPlay
                loop
                muted={isSpeakerMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                referrerPolicy="no-referrer"
                src={host.coverImage || host.avatar}
                alt={host.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <RomanticOverlaysLayer
          filterType={videoFilter}
          intensity={filterIntensity}
          enabled={showOverlays && !isComparing}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* 2. TOP HEADER */}
      <header className="relative z-20 w-full max-w-5xl px-3 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] flex items-center justify-between">
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl rounded-full py-1.5 px-3 border border-white/20 shadow-xl">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#FF2E93] shadow-md">
            <img
              referrerPolicy="no-referrer"
              src={host.avatar}
              alt={host.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-black text-white leading-none">{host.name}</h3>
              <span className="bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                Lv.{host.level}
              </span>
            </div>
            <p className="text-[10px] text-pink-300 font-mono mt-0.5">ID: {host.displayId} • {host.region}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Speaker Mute/Unmute */}
          <button
            onClick={() => {
              sound.playClick();
              setIsSpeakerMuted(!isSpeakerMuted);
            }}
            className="flex items-center gap-1.5 backdrop-blur-xl border rounded-2xl px-2.5 sm:px-3 py-1.5 text-xs shadow-lg cursor-pointer bg-black/80 border-white/20 text-white"
          >
            {isSpeakerMuted ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} className="text-emerald-400" />}
            <span className="text-[10px] font-bold hidden xs:inline">{isSpeakerMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          {/* Call Duration Timer */}
          <div
            className="backdrop-blur-2xl border rounded-2xl px-3 sm:px-4 py-1.5 flex items-center gap-2 bg-black/80 border-amber-400/70 shadow-lg"
          >
            <Clock size={12} className="text-amber-300" />
            <span className="font-mono font-black text-sm text-white tracking-widest tabular-nums">
              {formatTime(callDuration)}
            </span>
          </div>
        </div>
      </header>

      {/* 3. CENTER SUBTITLES */}
      <div className="relative z-20 w-full max-w-xl px-4 text-center">
        {callState === 'connecting' ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/75 backdrop-blur-xl rounded-3xl p-6 border border-pink-500/50 inline-flex flex-col items-center gap-3 shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center text-2xl animate-ping">
              📞
            </div>
            <h4 className="text-sm font-black text-white">Connecting Live Call...</h4>
            <p className="text-xs text-pink-300 font-mono">Session ID: {sharedCallSessionId}</p>
          </motion.div>
        ) : null}
      </div>

      {/* 4. DRAGGABLE LOCAL SELF CAMERA (PiP) */}
      <motion.div
        layout
        drag={!isScreenMaximized}
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        className="absolute top-20 right-4 sm:right-6 z-30 w-32 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-pink-400/80 shadow-2xl bg-slate-900 group select-none cursor-move"
      >
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          {!isVideoOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 text-xs">
              <VideoOff size={24} className="text-pink-400 mb-1" />
              <span>Camera Off</span>
            </div>
          )}

          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                switchCamera();
              }}
              className="w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20"
            >
              <SwitchCamera size={13} />
            </button>
          </div>

          <div className="absolute bottom-1.5 left-2 z-10">
            <div className="bg-black/75 px-2 py-0.5 rounded-lg text-[9px] text-white font-bold border border-white/10">
              You {isMicMuted && '🔇'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. BOTTOM CALL CONTROLS */}
      <footer className="relative z-20 w-full max-w-xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-3 w-full flex-wrap">
          {/* Mute Mic */}
          <button
            onClick={handleToggleMicWithFeedback}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-xl cursor-pointer ${
              isMicMuted ? 'bg-red-600 border-2 border-red-300' : 'bg-white/15 hover:bg-white/25 border border-white/20'
            }`}
          >
            {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Toggle Camera */}
          <button
            onClick={handleToggleVideoWithFeedback}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-xl cursor-pointer ${
              isVideoOff ? 'bg-red-600 border-2 border-red-300' : 'bg-white/15 hover:bg-white/25 border border-white/20'
            }`}
          >
            {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
          </button>

          {/* Gift Drawer */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGiftDrawer();
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF2E93] to-purple-600 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            <Gift size={20} />
          </button>

          {/* End Call */}
          <button
            onClick={handleHangUp}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95 flex items-center justify-center text-white shadow-[0_0_25px_rgba(239,68,68,0.8)] border-2 border-white/30 transition-all cursor-pointer"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </footer>

      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUser={{
          id: host.id,
          name: host.name,
          avatar: host.avatar,
          displayId: host.displayId,
          role: 'VERIFIED_HOST'
        }}
        currentUser={user}
        sourceContext="1v1_call"
        contextDetails={{ callDurationSec: callDuration }}
      />
    </div>
  );
};
