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

  // Real-time call duration timer reference - ONLY initiated when callState reaches 'connected'
  const connectedAtRef = useRef<number | null>(null);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState<boolean>(false);
  const hostVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasRemoteTrack, setHasRemoteTrack] = useState<boolean>(false);

  // Device orientation & mobile viewport tracking
  const { orientation, isLandscape, isPortrait, aspectRatio: viewportAspectRatio, isRotating } = useDeviceOrientation();

  // Aspect ratio fitting mode: 'auto' (smart adaptive) | 'contain' (0% crop) | 'cover' (fill screen) | '16:9' | '9:16'
  const [aspectRatioFitMode, setAspectRatioFitMode] = useState<'auto' | 'contain' | 'cover' | '16:9' | '9:16'>('auto');

  // Video stream intrinsic resolution & aspect ratio
  const [streamResolution, setStreamResolution] = useState<{ width: number; height: number; aspectRatio: number }>({
    width: 0,
    height: 0,
    aspectRatio: 16 / 9
  });

  // Brief toast on orientation change to give clear visual feedback during mobile rotation
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

  // Handler to capture intrinsic video dimensions on metadata load & resize
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

  // Determine effective fit mode based on user preference, video stream ratio, and device orientation
  const effectiveFitMode = useMemo(() => {
    if (aspectRatioFitMode !== 'auto') {
      return aspectRatioFitMode;
    }
    // In Auto mode:
    if (streamResolution.width > 0 && streamResolution.height > 0) {
      const streamIsLandscape = streamResolution.width > streamResolution.height;
      // If stream orientation matches device orientation (e.g. landscape-on-landscape or portrait-on-portrait):
      if (streamIsLandscape === isLandscape) {
        return 'cover';
      }
      // If mismatch (e.g. 9:16 vertical video on landscape phone, or 16:9 webcam on vertical phone):
      // Use 'contain' with ambient backdrop mirror to prevent distortion or heads getting chopped off!
      return 'contain';
    }
    // Default fallback: on landscape mobile, prefer contain to preserve aspect ratio
    return isLandscape ? 'contain' : 'cover';
  }, [aspectRatioFitMode, streamResolution, isLandscape]);

  // Cycle aspect ratio mode
  const cycleAspectRatioMode = () => {
    sound.playClick();
    const modes: Array<'auto' | 'contain' | 'cover' | '16:9' | '9:16'> = ['auto', 'contain', 'cover', '16:9', '9:16'];
    const currentIndex = modes.indexOf(aspectRatioFitMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setAspectRatioFitMode(nextMode);
  };

  // Capture Moment state
  const [capturedMomentUrl, setCapturedMomentUrl] = useState<string | null>(null);
  const [showCaptureModal, setShowCaptureModal] = useState<boolean>(false);
  const [momentCaption, setMomentCaption] = useState<string>(`Magical moment on video call with ${host.name} 💕✨`);
  const [captureFlash, setCaptureFlash] = useState<boolean>(false);
  const [captureSuccessToast, setCaptureSuccessToast] = useState<boolean>(false);

  const captureMoment = () => {
    sound.playClick();
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 250);

    const canvas = document.createElement('canvas');
    const videoEl = remoteVideoRef.current;
    const fallbackImgEl = document.querySelector('img[alt="' + host.name + '"]') as HTMLImageElement;
    const fallbackVideoEl = document.querySelector('video[src="' + host.videoUrl + '"]') as HTMLVideoElement;

    if (videoEl && videoEl.videoWidth > 0) {
      canvas.width = videoEl.videoWidth || 1280;
      canvas.height = videoEl.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      }
    } else if (fallbackVideoEl && fallbackVideoEl.videoWidth > 0) {
      canvas.width = fallbackVideoEl.videoWidth || 1280;
      canvas.height = fallbackVideoEl.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(fallbackVideoEl, 0, 0, canvas.width, canvas.height);
      }
    } else if (fallbackImgEl && fallbackImgEl.complete) {
      canvas.width = fallbackImgEl.naturalWidth || 1280;
      canvas.height = fallbackImgEl.naturalHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(fallbackImgEl, 0, 0, canvas.width, canvas.height);
      }
    } else {
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(`${host.name} & ${user.name}`, 80, 360);
      }
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedMomentUrl(dataUrl);
    setShowCaptureModal(true);
  };

  const downloadSnapshot = () => {
    if (!capturedMomentUrl) return;
    sound.playClick();
    const a = document.createElement('a');
    a.href = capturedMomentUrl;
    a.download = `amorex-moment-${host.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCaptureSuccessToast(true);
    setTimeout(() => setCaptureSuccessToast(false), 3000);
  };

  const publishToMoments = () => {
    if (!capturedMomentUrl) return;
    sound.playClick();

    const newPost: MomentPost = {
      id: `moment_${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorLevel: user.level,
      isVerified: user.isVerifiedHost || user.role === 'SUPER_ADMIN',
      timestamp: 'Just now',
      content: momentCaption,
      mediaType: 'image',
      mediaUrl: capturedMomentUrl,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      hasLiked: true,
      tags: ['VideoCall', 'RomanticMoment', host.name.replace(/\s+/g, '')]
    };

    try {
      const existingMomentsRaw = localStorage.getItem('amorex_moments');
      const existingMoments: MomentPost[] = existingMomentsRaw ? JSON.parse(existingMomentsRaw) : [];
      const updated = [newPost, ...existingMoments];
      localStorage.setItem('amorex_moments', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save moment:', err);
    }

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setShowCaptureModal(false);
    setCaptureSuccessToast(true);
    setTimeout(() => setCaptureSuccessToast(false), 3500);
  };


  // WebRTC Call Hook with STUN servers & Real Media Stream Capture
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
    isVideoCall: true
  });

  // Real-Time Audio Transmission (Microphone) Mute Control State & Toast
  const [micStatusToast, setMicStatusToast] = useState<string | null>(null);

  const handleToggleMicWithFeedback = () => {
    sound.playClick();
    toggleMic();
    const willBeMuted = !isMicMuted;
    setMicStatusToast(
      willBeMuted
        ? 'Microphone Muted: Audio transmission paused 🔇'
        : 'Microphone Active: Audio transmitting to host 🎙️'
    );
    setTimeout(() => {
      setMicStatusToast(null);
    }, 2400);
  };

  // Real-Time Camera Video Feed Control State & Toast
  const [videoStatusToast, setVideoStatusToast] = useState<string | null>(null);

  const handleToggleVideoWithFeedback = () => {
    sound.playClick();
    toggleVideo();
    const willBeOff = !isVideoOff;
    setVideoStatusToast(
      willBeOff
        ? 'Camera Disabled: Video feed turned off 🙈'
        : 'Camera Active: Video feed broadcasting live 📹'
    );
    setTimeout(() => {
      setVideoStatusToast(null);
    }, 2400);
  };

  // Track screen sharing duration and reset maximize on stop
  useEffect(() => {
    if (!isScreenSharing) {
      setScreenShareDuration(0);
      setIsScreenMaximized(false);
      return;
    }
    const interval = setInterval(() => {
      setScreenShareDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isScreenSharing]);

  // Dedicated Interval Hook for real-time WebRTC metrics (RTT, Jitter, Packet Loss %) based on RTCStatsReport
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

  // Real-Time Network Strength Indicator: Green for Strong, Yellow for Fair, Red for Weak
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
        bg: 'bg-rose-500',
        dot: 'bg-rose-500',
        border: 'border-rose-500/60',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50'
      };
    }

    if (quality === 'fair' || rtt > 85 || packetLoss > 1.2 || jitter > 10 || qualityScore < 75) {
      return {
        level: 'fair' as const,
        label: 'Fair',
        bars: 2,
        text: 'text-amber-400',
        bg: 'bg-amber-400',
        dot: 'bg-amber-400',
        border: 'border-amber-500/60',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
      };
    }

    return {
      level: 'strong' as const,
      label: 'Strong',
      bars: 4,
      text: 'text-emerald-400',
      bg: 'bg-emerald-400',
      dot: 'bg-emerald-400',
      border: 'border-emerald-500/50',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
    };
  }, [liveMetrics, qualityScore]);

  // Real-time poor connection threshold check (jitter > 15ms or packet loss > 2.0%)
  const isPoorConnection =
    !dismissedPoorConnection &&
    (liveMetrics.jitterMs > 15 || liveMetrics.packetLossPercentage > 2.0 || liveMetrics.connectionQuality === 'poor');

  useEffect(() => {
    if (liveMetrics.jitterMs <= 12 && liveMetrics.packetLossPercentage <= 1.5 && liveMetrics.connectionQuality !== 'poor') {
      setDismissedPoorConnection(false);
    }
  }, [liveMetrics.jitterMs, liveMetrics.packetLossPercentage, liveMetrics.connectionQuality]);

  // Sound and AI Subtitles cycle
  useEffect(() => {
    sound.playCallRinging();

    const subtitleTimer = setTimeout(() => {
      sound.playHeartLike();
      setSubtitleText(`[Live Translation] ${host.name}: "Hello my love! So wonderful to see you on private HD video! 💖"`);
    }, 2400);

    const periodicSubtitles = setInterval(() => {
      const phrases = [
        `[Live Translation] ${host.name}: "Your smile lights up my entire screen... tell me how your day went! ✨"`,
        `[Live Translation] ${host.name}: "I'm so happy we matched today. You look stunning in HD! 🌹"`,
        `[Live Translation] ${host.name}: "Should we play a mini-game or just chat by candlelight? 🥰"`,
        `[Live Translation] ${host.name}: "Sending you romantic stardust across our WebRTC stream! 💫"`
      ];
      setSubtitleText(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 12000);

    return () => {
      clearTimeout(subtitleTimer);
      clearInterval(periodicSubtitles);
    };
  }, [host.name]);

  // Check for real remote video tracks from WebRTC peer
  useEffect(() => {
    const checkTracks = () => {
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const stream = remoteVideoRef.current.srcObject as MediaStream;
        const tracks = stream.getVideoTracks();
        setHasRemoteTrack(tracks.length > 0 && tracks.some((t) => t.readyState === 'live' && t.enabled));
      } else {
        setHasRemoteTrack(false);
      }
    };
    checkTracks();
    const interval = setInterval(checkTracks, 1000);
    return () => clearInterval(interval);
  }, [remoteVideoRef]);

  // Manage unmuted playback of host live audio stream once connected
  useEffect(() => {
    if (callState === 'connected' && hostVideoRef.current) {
      hostVideoRef.current.muted = isSpeakerMuted;
      const playPromise = hostVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[PrivateCallOverlay] Unmuted host video playback blocked by browser:', err);
          if (!isSpeakerMuted) {
            setAudioAutoplayBlocked(true);
            if (hostVideoRef.current) {
              hostVideoRef.current.muted = true;
              hostVideoRef.current.play().catch(() => {});
            }
          }
        });
      }
    }
  }, [callState, isSpeakerMuted]);

  // Real-Time Call Duration & Coin Deduction ticker
  // STRICT RULE: Duration timer starts ONLY when WebRTC call connects (callState === 'connected')
  useEffect(() => {
    if (showPostCallSummary || callState === 'closed') return;

    if (callState !== 'connected') {
      // While negotiating, connecting, or ringing, duration stays strictly at 0
      if (connectedAtRef.current === null) {
        setCallDuration(0);
      }
      return;
    }

    // Call has connected! Record the exact connectedAt timestamp
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

      // Free for first 180 sec if voucher available, otherwise standard 60 coins / min of connected call
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

    // If call was cancelled or closed before connecting, duration is 0 and no coins charged
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

  // Dynamic CSS filter string calculated from current preset & intensity
  // When user holds 'Compare', temporarily bypass to 'none' for instant live before/after view
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
      {/* 1. FULLSCREEN REMOTE STREAM VIEWPORT WITH SMOOTH ASPECT RATIO ENFORCEMENT */}
      <div
        id="active-call-viewport"
        className={`absolute inset-0 w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center transition-all duration-500 ease-out ${
          isRotating ? 'scale-[0.99] blur-[0.5px]' : 'scale-100'
        }`}
      >
        {/* AMBIENT BLURRED BACKDROP MIRROR: Eliminates harsh black bars when aspect ratio is constrained (e.g. portrait video in landscape phone orientation) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-40 scale-125 filter blur-3xl transition-opacity duration-700 select-none"
        >
          {host.videoUrl ? (
            <video
              src={host.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              referrerPolicy="no-referrer"
              src={host.coverImage}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* ASPECT RATIO MAINTAINED VIDEO CONTAINER */}
        <div
          id="active-call-aspect-container"
          className={`relative z-10 flex items-center justify-center transition-all duration-500 ease-out overflow-hidden ${
            effectiveFitMode === '16:9'
              ? 'w-full aspect-video max-h-full rounded-none sm:rounded-2xl shadow-2xl'
              : effectiveFitMode === '9:16'
              ? 'h-full aspect-[9/16] max-w-full rounded-none sm:rounded-2xl shadow-2xl'
              : effectiveFitMode === '4:3'
              ? 'w-full aspect-[4/3] max-h-full rounded-none sm:rounded-2xl shadow-2xl'
              : effectiveFitMode === 'contain'
              ? 'w-full h-full flex items-center justify-center'
              : 'w-full h-full'
          }`}
        >
          {/* Real Remote WebRTC Video Track Container */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            onLoadedMetadata={handleRemoteVideoMetadata}
            onResize={handleRemoteVideoMetadata}
            style={{
              filter: applyFilterToHost ? activeFilterCSS : 'none',
              transition: 'filter 0.4s cubic-bezier(0.4, 0, 0.2, 1), object-fit 0.3s ease'
            }}
            className={`max-w-full max-h-full transition-all duration-500 ease-out ${
              effectiveFitMode === 'cover'
                ? 'w-full h-full object-cover'
                : 'w-full h-full object-contain'
            } ${hasRemoteTrack ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none absolute'}`}
          />

          {/* Real Live Host Video Stream with Real Audio (unmuted during connected call) */}
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
                onLoadedMetadata={handleRemoteVideoMetadata}
                style={{
                  filter: applyFilterToHost ? activeFilterCSS : 'none',
                  transition: 'filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className={`max-w-full max-h-full transition-all duration-500 ease-out ${
                  effectiveFitMode === 'cover'
                    ? 'w-full h-full object-cover'
                    : 'w-full h-full object-contain'
                }`}
              />
            ) : (
              <img
                referrerPolicy="no-referrer"
                src={host.coverImage || host.avatar}
                alt={host.name}
                style={{
                  filter: applyFilterToHost ? activeFilterCSS : 'none',
                  transition: 'filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className={`max-w-full max-h-full transition-all duration-500 ease-out ${
                  effectiveFitMode === 'cover'
                    ? 'w-full h-full object-cover'
                    : 'w-full h-full object-contain'
                }`}
              />
            )}
          </div>
        </div>

        {/* Browser Autoplay Sound Enabler Banner */}
        {audioAutoplayBlocked && !isSpeakerMuted && (
          <div className="absolute top-20 z-40 bg-emerald-950/90 border border-emerald-400/80 px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] backdrop-blur-xl flex items-center gap-3 text-xs">
            <Volume2 className="text-emerald-400 animate-pulse" size={18} />
            <span className="text-white font-medium">Tap to unmute host live voice</span>
            <button
              onClick={() => {
                sound.playClick();
                if (hostVideoRef.current) {
                  hostVideoRef.current.muted = false;
                  hostVideoRef.current.play().catch(() => {});
                }
                setAudioAutoplayBlocked(false);
              }}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-all"
            >
              Unmute 🔊
            </button>
          </div>
        )}

        {/* Real-time Dynamic Romantic Overlays Layer (Floating Hearts, Petals, Candlelight Ember/Flicker, Stardust) */}
        <RomanticOverlaysLayer
          filterType={videoFilter}
          intensity={filterIntensity}
          enabled={showOverlays && !isComparing}
        />

        {/* Atmospheric Romantic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90 pointer-events-none" />

        {/* Atmospheric Romantic Ambient Hue Overlay based on selected filter */}
        {videoFilter !== 'none' && !isComparing && (
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={{
              background:
                videoFilter === 'heart-aura'
                  ? 'radial-gradient(ellipse at center, transparent 40%, rgba(255, 23, 68, 0.22) 100%)'
                  : videoFilter === 'sparkle-glow'
                  ? 'radial-gradient(ellipse at center, transparent 42%, rgba(255, 215, 0, 0.18) 100%)'
                  : videoFilter === 'vintage-love'
                  ? 'radial-gradient(ellipse at center, transparent 40%, rgba(217, 119, 6, 0.2) 100%)'
                  : videoFilter === 'romantic'
                  ? 'radial-gradient(ellipse at center, transparent 45%, rgba(255, 46, 147, 0.18) 100%)'
                  : videoFilter === 'cherry-blossom'
                  ? 'radial-gradient(ellipse at center, transparent 45%, rgba(244, 114, 182, 0.18) 100%)'
                  : videoFilter === 'soft-glow'
                  ? 'radial-gradient(ellipse at center, transparent 40%, rgba(236, 72, 153, 0.18) 100%)'
                  : videoFilter === 'beauty-mode'
                  ? 'radial-gradient(ellipse at center, transparent 50%, rgba(244, 114, 182, 0.14) 100%)'
                  : videoFilter === 'candlelight'
                  ? 'radial-gradient(ellipse at center, transparent 45%, rgba(245, 158, 11, 0.2) 100%)'
                  : videoFilter === 'golden-hour'
                  ? 'radial-gradient(ellipse at center, transparent 45%, rgba(245, 158, 11, 0.18) 100%)'
                  : videoFilter === 'sepia'
                  ? 'radial-gradient(ellipse at center, transparent 45%, rgba(180, 120, 50, 0.16) 100%)'
                  : videoFilter === 'dreamy'
                  ? 'radial-gradient(ellipse at center, transparent 45%, rgba(168, 85, 247, 0.18) 100%)'
                  : videoFilter === 'vintage-noir'
                  ? 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.35) 100%)'
                  : 'transparent'
            }}
          />
        )}

        {/* Live Compare Banner */}
        {isComparing && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-black/80 border border-cyan-400/60 px-4 py-1.5 rounded-full text-xs text-cyan-300 font-bold backdrop-blur-md flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Comparing: Original Untouched Video</span>
          </div>
        )}
      </div>

      {/* 2. TOP HEADER BAR */}
      <header className="relative z-20 w-full max-w-5xl px-3 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] flex items-center justify-between">
        {/* Host Profile Badge with Live Status */}
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

        {/* WebRTC Real-Time Connection Indicator & Stats Badge */}
        <div className="flex items-center gap-2">
          {/* WebRTC Real-Time Connection Indicator & Stats Badge (Desktop) */}
          <button
            onClick={() => {
              sound.playClick();
              setShowStatsModal(!showStatsModal);
            }}
            title="Real-Time WebRTC Diagnostics: Full metrics, historical charts & trends"
            className={`hidden sm:flex bg-black/60 backdrop-blur-xl border rounded-full px-2.5 sm:px-3 py-1 items-center gap-1.5 text-xs shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              liveMetrics.connectionQuality === 'poor'
                ? 'border-rose-500/50 hover:border-rose-400 text-rose-300'
                : liveMetrics.connectionQuality === 'fair'
                ? 'border-amber-500/50 hover:border-amber-400 text-amber-300'
                : 'border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                liveMetrics.connectionQuality === 'poor'
                  ? 'bg-rose-500 animate-ping'
                  : liveMetrics.connectionQuality === 'fair'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400 animate-ping'
              }`}
            />
            <Signal
              size={12}
              className={
                liveMetrics.connectionQuality === 'poor'
                  ? 'text-rose-400'
                  : liveMetrics.connectionQuality === 'fair'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }
            />
            <span className="text-[10px] font-mono font-bold capitalize">
              {liveMetrics.connectionQuality}
            </span>
          </button>

          {/* Active Filter & Overlays Quick Header Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowFilterDrawer(true);
            }}
            title="Adjust Real-Time Romantic Video Filters & Overlays"
            className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-xl border border-pink-500/40 hover:border-pink-400 rounded-full px-2.5 sm:px-3 py-1 text-xs text-pink-200 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles size={12} className="text-pink-400" />
            <span className="text-[10px] font-bold">
              {FILTER_PRESETS.find((p) => p.id === videoFilter)?.name.split(' ')[0] || 'Filter'} ({filterIntensity}%)
            </span>
            {showOverlays && videoFilter !== 'none' && (
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            )}
          </button>

          {/* Aspect Ratio & Orientation Mode Quick Toggle Button */}
          <button
            id="active-call-aspect-ratio-toggle"
            onClick={cycleAspectRatioMode}
            title={`Aspect Ratio: ${aspectRatioFitMode.toUpperCase()} (Effective: ${effectiveFitMode === 'cover' ? 'Full Fill' : 'Fit 0% Crop'}). Click to cycle.`}
            className="flex items-center gap-1.5 bg-black/80 backdrop-blur-xl border border-cyan-400/60 hover:border-cyan-300 rounded-2xl px-2.5 sm:px-3 py-1.5 text-xs text-cyan-200 shadow-[0_0_15px_rgba(0,210,255,0.25)] ring-1 ring-cyan-400/25 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            {isLandscape ? (
              <Monitor size={12} className="text-cyan-400" />
            ) : (
              <Smartphone size={12} className="text-cyan-400" />
            )}
            <div className="flex flex-col items-start leading-none">
              <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-0.5">
                Ratio
              </span>
              <span className="font-mono font-bold text-[10px] text-white tracking-tight mt-0.5">
                {aspectRatioFitMode === 'auto'
                  ? `Auto (${effectiveFitMode})`
                  : aspectRatioFitMode === 'contain'
                  ? 'Fit (100%)'
                  : aspectRatioFitMode === 'cover'
                  ? 'Fill (Crop)'
                  : aspectRatioFitMode}
              </span>
            </div>
            <Scan size={10} className="text-cyan-300 opacity-75 ml-0.5" />
          </button>

          {/* Speaker Mute/Unmute Toggle */}
          <button
            id="active-call-toggle-speaker-btn"
            onClick={() => {
              sound.playClick();
              const nextMute = !isSpeakerMuted;
              setIsSpeakerMuted(nextMute);
              if (hostVideoRef.current) {
                hostVideoRef.current.muted = nextMute;
              }
              setAudioAutoplayBlocked(false);
            }}
            title={isSpeakerMuted ? 'Unmute Host Audio (Speaker Off)' : 'Mute Host Audio (Speaker On)'}
            aria-label={isSpeakerMuted ? 'Unmute Host Audio' : 'Mute Host Audio'}
            className={`flex items-center gap-1.5 backdrop-blur-xl border rounded-2xl px-2.5 sm:px-3 py-1.5 text-xs shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 ${
              isSpeakerMuted
                ? 'bg-red-500/30 border-red-400 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-black/80 border-emerald-400/60 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
            }`}
          >
            {isSpeakerMuted ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} className="text-emerald-400" />}
            <span className="text-[10px] font-bold hidden xs:inline">
              {isSpeakerMuted ? 'Muted' : 'Audio On'}
            </span>
          </button>

          {/* User Microphone Audio Transmission Mute Toggle */}
          <button
            id="active-call-header-mute-mic-btn"
            onClick={handleToggleMicWithFeedback}
            title={isMicMuted ? 'Unmute Microphone (Resume Audio Transmission)' : 'Mute Microphone (Pause Audio Transmission)'}
            aria-label={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            className={`flex items-center gap-1.5 backdrop-blur-xl border rounded-2xl px-2.5 sm:px-3 py-1.5 text-xs shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 ${
              isMicMuted
                ? 'bg-red-500/35 border-red-400 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.4)] ring-1 ring-red-400/50 animate-pulse'
                : 'bg-black/80 border-cyan-400/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            }`}
          >
            {isMicMuted ? <MicOff size={13} className="text-red-400" /> : <Mic size={13} className="text-cyan-400" />}
            <span className="text-[10px] font-bold hidden xs:inline">
              {isMicMuted ? 'Mic Off' : 'Mic Live'}
            </span>
          </button>

          {/* User Camera Video Feed Toggle */}
          <button
            id="active-call-header-toggle-camera-btn"
            onClick={handleToggleVideoWithFeedback}
            title={isVideoOff ? 'Turn Camera On (Start Video Feed)' : 'Turn Camera Off (Stop Video Feed)'}
            aria-label={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            className={`flex items-center gap-1.5 backdrop-blur-xl border rounded-2xl px-2.5 sm:px-3 py-1.5 text-xs shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 ${
              isVideoOff
                ? 'bg-red-500/35 border-red-400 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.4)] ring-1 ring-red-400/50 animate-pulse'
                : 'bg-black/80 border-emerald-400/60 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
            }`}
          >
            {isVideoOff ? <VideoOff size={13} className="text-red-400" /> : <VideoIcon size={13} className="text-emerald-400" />}
            <span className="text-[10px] font-bold hidden xs:inline">
              {isVideoOff ? 'Cam Off' : 'Cam Live'}
            </span>
          </button>

          {/* Flag / Report Host Action Button */}
          <button
            id="active-call-header-report-host-btn"
            onClick={() => {
              sound.playClick();
              setShowReportModal(true);
            }}
            title="Report Host / Flag Inappropriate Behavior to Super Admin"
            aria-label="Report Host"
            className="flex items-center gap-1.5 backdrop-blur-xl border border-red-500/50 bg-red-950/60 hover:bg-red-900/80 text-red-200 rounded-2xl px-2.5 sm:px-3 py-1.5 text-xs shadow-[0_0_12px_rgba(239,68,68,0.35)] cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <ShieldAlert size={13} className="text-red-400 animate-pulse" />
            <span className="text-[10px] font-bold hidden xs:inline text-red-200">Report</span>
          </button>

          {/* Real-Time Call Duration Timer & Rate Status (Persistent & Prominent) */}
          <div
            id="active-call-duration-timer"
            title={
              callState === 'connected'
                ? `Real-Time Call Duration: ${formatTime(callDuration)} • ${user.vouchers > 0 && callDuration <= 180 ? 'Free Voucher Active (180s)' : '60 Coins/min'}`
                : `WebRTC Status: ${callState === 'reconnecting' ? 'Reconnecting to Host...' : 'Connecting HD Stream...'}`
            }
            className={`backdrop-blur-2xl border rounded-2xl px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-2.5 shadow-lg transition-all ${
              callState === 'connected'
                ? 'bg-black/80 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/30'
                : callState === 'reconnecting'
                ? 'bg-black/80 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/30'
                : 'bg-black/80 border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/30'
            }`}
          >
            <div className="relative flex items-center justify-center shrink-0">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-ping absolute ${
                  callState === 'connected'
                    ? 'bg-emerald-400'
                    : callState === 'reconnecting'
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
              />
              <span
                className={`w-2 h-2 rounded-full relative ${
                  callState === 'connected'
                    ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    : callState === 'reconnecting'
                    ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                    : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                }`}
              />
            </div>

            <div className="flex flex-col items-start leading-none">
              <div className="flex items-center gap-1">
                <Clock
                  size={10}
                  className={
                    callState === 'connected'
                      ? 'text-amber-300'
                      : callState === 'reconnecting'
                      ? 'text-amber-400'
                      : 'text-cyan-300'
                  }
                />
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider ${
                    callState === 'connected'
                      ? 'text-amber-300'
                      : callState === 'reconnecting'
                      ? 'text-amber-400'
                      : 'text-cyan-300'
                  }`}
                >
                  {callState === 'connected'
                    ? 'Call Duration'
                    : callState === 'reconnecting'
                    ? 'Reconnecting'
                    : 'Connecting...'}
                </span>
              </div>
              <span
                id="active-call-duration-digits"
                className="font-mono font-black text-sm sm:text-base text-white tracking-widest tabular-nums mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {callState === 'connected' ? formatTime(callDuration) : '00:00'}
              </span>
            </div>

            <div className="flex flex-col items-end pl-2 border-l border-white/20 text-[9px] font-bold leading-tight shrink-0">
              {callState === 'connected' ? (
                <>
                  {user.vouchers > 0 && callDuration <= 180 ? (
                    <span className="text-pink-300 flex items-center gap-0.5">
                      <Sparkles size={9} className="animate-spin text-pink-400" /> Free
                    </span>
                  ) : (
                    <span className="text-amber-300 font-mono">60🪙/m</span>
                  )}
                  <span className="text-[8px] text-emerald-400 flex items-center gap-0.5 font-semibold">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" /> Live
                  </span>
                </>
              ) : (
                <>
                  <span className="text-cyan-300 font-mono text-[9px]">HD WebRTC</span>
                  <span className="text-[8px] text-cyan-400 flex items-center gap-0.5 font-semibold">
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" /> Ringing...
                  </span>
                </>
              )}
            </div>
          </div>

          {user.vouchers > 0 && callDuration <= 180 && (
            <div className="hidden md:flex items-center gap-1 bg-pink-500/30 border border-pink-400/50 rounded-full px-2.5 py-1 text-[10px] text-pink-200 font-bold">
              <Sparkles size={11} className="text-[#FFD700] animate-spin" />
              <span>Voucher Active</span>
            </div>
          )}
        </div>
      </header>

      {/* SUBTLE RECONNECTING / ICE RESTART TOAST NOTIFICATION */}
      <AnimatePresence>
        {reconnectToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`fixed top-16 sm:top-18 z-50 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl backdrop-blur-2xl shadow-2xl border flex items-center gap-3 text-xs max-w-sm sm:max-w-md ${
              reconnectToast.status === 'restored'
                ? 'bg-emerald-950/90 border-emerald-400/60 text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.35)]'
                : reconnectToast.status === 'failed'
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.35)]'
                : 'bg-[#0E1020]/95 border-amber-400/60 text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.3)]'
            }`}
          >
            {reconnectToast.status === 'restored' ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : reconnectToast.status === 'failed' ? (
              <WifiOff size={18} className="text-rose-400 shrink-0" />
            ) : (
              <RefreshCw size={18} className="text-amber-400 shrink-0 animate-spin" />
            )}

            <div className="flex-1 min-w-0">
              <div className="font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
                {reconnectToast.status === 'restored' ? (
                  <span className="text-emerald-300">Connection Restored</span>
                ) : reconnectToast.status === 'failed' ? (
                  <span className="text-rose-300">Connection Lost</span>
                ) : (
                  <span className="text-amber-300">Reconnecting...</span>
                )}
                {reconnectToast.status === 'reconnecting' && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full font-mono">
                    Attempt {reconnectToast.attempt}/{reconnectToast.maxAttempts}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-300 truncate mt-0.5">
                {reconnectToast.status === 'reconnecting'
                  ? 'Triggering Google STUN ICE restart to recover HD stream...'
                  : reconnectToast.message}
              </p>
            </div>

            {reconnectToast.status === 'failed' && (
              <button
                onClick={triggerManualReconnect}
                className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-400/40 text-[10px] font-bold transition-all cursor-pointer shrink-0"
              >
                Retry
              </button>
            )}

            <button
              onClick={dismissToast}
              className="text-gray-400 hover:text-white text-xs p-1 ml-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMOOTH ORIENTATION CHANGE TOAST NOTIFICATION (Shows when phone flips between portrait & landscape) */}
      <AnimatePresence>
        {orientationToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 backdrop-blur-2xl border border-cyan-400/70 text-cyan-200 px-3.5 py-2 rounded-2xl shadow-[0_0_30px_rgba(0,210,255,0.4)] flex items-center gap-2.5 text-xs font-bold ring-1 ring-cyan-400/30 select-none"
          >
            <RotateCcw size={14} className="text-cyan-400 animate-spin" />
            <span className="text-white tracking-wide">{orientationToast}</span>
            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/40">
              {effectiveFitMode === 'cover' ? 'Full Fill' : 'Fit (0% Distortion)'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REAL-TIME POOR CONNECTION WARNING NOTIFICATION BANNER */}
      <AnimatePresence>
        {isPoorConnection && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 sm:top-20 z-50 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl bg-rose-950/95 border-2 border-rose-500 text-rose-100 shadow-[0_0_35px_rgba(244,63,94,0.5)] backdrop-blur-2xl flex items-center gap-3 text-xs max-w-md"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500/30 border border-rose-400 flex items-center justify-center shrink-0 animate-pulse text-rose-300">
              <AlertCircle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-rose-200 flex items-center gap-1.5 text-xs">
                <span>⚠️ Poor Connection Detected</span>
                <span className="text-[9px] bg-rose-500/30 text-rose-200 px-1.5 py-0.2 rounded-full font-mono">
                  Jitter: {liveMetrics.jitterMs}ms • Loss: {liveMetrics.packetLossPercentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] text-rose-300/90 truncate mt-0.5">
                High network jitter or packet loss. Stream quality may degrade.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                triggerManualReconnect();
              }}
              className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-[10px] font-black transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1"
            >
              <RefreshCw size={11} className="animate-spin" />
              <span>Optimize</span>
            </button>
            <button
              onClick={() => setDismissedPoorConnection(true)}
              className="text-rose-300 hover:text-white text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REAL-TIME SCREEN SHARING NOTIFICATION & CONTROLS BANNER */}
      <AnimatePresence>
        {isScreenSharing && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 sm:top-20 z-40 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-teal-950/95 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_35px_rgba(16,185,129,0.45)] backdrop-blur-2xl flex items-center gap-2.5 sm:gap-3 text-xs max-w-md w-[92%] sm:w-auto justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 animate-pulse">
                <ScreenShare size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-black text-white text-[11px] sm:text-xs">
                  <span>Screen Sharing Active</span>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
                    1080p • 60fps
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/90 font-mono mt-0.5 flex items-center gap-1">
                  <span>Broadcasting:</span>
                  <span className="font-bold text-white">
                    {Math.floor(screenShareDuration / 60) < 10 ? '0' : ''}{Math.floor(screenShareDuration / 60)}:
                    {screenShareDuration % 60 < 10 ? '0' : ''}{screenShareDuration % 60}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsScreenMaximized(!isScreenMaximized);
                }}
                title={isScreenMaximized ? 'Minimize Screen to PiP' : 'Expand Screen Fullscreen'}
                className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                {isScreenMaximized ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                <span className="hidden sm:inline">{isScreenMaximized ? 'Minimize' : 'Expand'}</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  toggleScreenShare();
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer shadow-md"
              >
                <ScreenShareOff size={11} />
                <span>Stop Sharing</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Sharing Active Perimeter Halo Outline */}
      {isScreenSharing && (
        <div className="absolute inset-0 pointer-events-none border-4 border-emerald-500/50 shadow-[inset_0_0_35px_rgba(16,185,129,0.3)] z-30 transition-all duration-500 animate-pulse" />
      )}

      {/* 3. CENTER SUBTITLES & AI TRANSLATION */}
      <div className="relative z-20 w-full max-w-xl px-4 text-center">
        {callState === 'connecting' || callState === 'requesting_permissions' ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/75 backdrop-blur-xl rounded-3xl p-6 border border-pink-500/50 inline-flex flex-col items-center gap-3 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center text-3xl animate-ping">
              💘
            </div>
            <h4 className="text-base font-black text-white">Negotiating WebRTC HD Peer Connection...</h4>
            <p className="text-xs text-pink-300">Connecting Google STUN ICE Candidates with {host.name}</p>
          </motion.div>
        ) : (
          liveTranslationEnabled && subtitleText && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-black/75 backdrop-blur-xl border border-cyan-400/50 rounded-2xl p-3 text-xs text-cyan-200 shadow-2xl inline-block max-w-lg"
            >
              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold mb-1 justify-center uppercase tracking-wider">
                <Languages size={13} />
                <span>AI Live Auto-Translator</span>
              </div>
              <p className="font-semibold text-white text-xs sm:text-sm">{subtitleText}</p>
            </motion.div>
          )
        )}
      </div>

      {/* 3.1 SMALL OVERLAY ICON IN ACTIVECALLMODAL: DISPLAYS LATENCY (PING) & BITRATE, DETAILS ON CLICK */}
      <NetworkStatsOverlayIcon
        id="active-call-network-stats-overlay"
        className="absolute top-20 left-4 sm:left-6 z-30"
        latencyMs={liveMetrics.latencyMs || liveMetrics.rttMs}
        bitrateKbps={liveMetrics.bitrateKbps}
        jitterMs={liveMetrics.jitterMs}
        packetLossPercentage={liveMetrics.packetLossPercentage}
        fps={liveMetrics.fps}
        resolution={liveMetrics.resolution}
        connectionQuality={liveMetrics.connectionQuality}
        qualityScore={qualityScore}
        candidateDetails={candidateDetails}
        callDuration={callDuration}
        onSimulateSpike={simulateNetworkSpike}
        onTriggerReconnect={triggerManualReconnect}
        onOpenFullDiagnostics={() => {
          setShowStatsModal(true);
        }}
      />

      {/* 4. DRAGGABLE FLOATING LOCAL SELF CAMERA / SCREEN SHARE (PiP & Maximize View) */}
      <motion.div
        layout
        drag={!isScreenMaximized}
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        className={
          isScreenMaximized
            ? "fixed inset-3 sm:inset-10 z-40 rounded-3xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)] bg-slate-950 flex flex-col transition-all duration-300"
            : isScreenSharing
            ? "absolute top-16 sm:top-20 right-3 sm:right-6 z-30 w-44 sm:w-64 aspect-video rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.6)] bg-slate-950 group select-none cursor-move transition-all duration-300"
            : isLandscape
            ? "absolute top-14 sm:top-20 right-3 sm:right-6 z-30 w-28 sm:w-40 aspect-video rounded-2xl overflow-hidden border-2 border-pink-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,46,147,0.4)] bg-slate-900 group select-none cursor-move transition-all duration-300"
            : "absolute top-20 right-4 sm:right-6 z-30 w-32 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-pink-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,46,147,0.4)] bg-slate-900 group select-none cursor-move transition-all duration-300"
        }
      >
        {/* Maximized Screen Header Bar */}
        {isScreenMaximized && (
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-emerald-500/30 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                <ScreenShare size={15} className="text-emerald-400" />
                <span>Your Shared Screen Broadcast</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-400/40">
                1080p 60fps
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsScreenMaximized(false);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1 cursor-pointer transition-all"
              >
                <Minimize2 size={13} />
                <span>Minimize to PiP</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  toggleScreenShare();
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-md"
              >
                <ScreenShareOff size={13} />
                <span>Stop</span>
              </button>
            </div>
          </div>
        )}

        {/* Video Stream Container */}
        <div className="relative w-full h-full flex-1 overflow-hidden bg-black flex items-center justify-center">
          {!isVideoOff || isScreenSharing ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                filter: (!isScreenSharing && applyFilterToSelf) ? activeFilterCSS : 'none',
                transition: 'filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className={`w-full h-full transition-all duration-300 ${
                isScreenSharing
                  ? 'object-contain bg-slate-950 scale-x-1'
                  : 'object-cover scale-x-[-1]'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 text-xs p-2 text-center">
              <VideoOff size={24} className="text-pink-400 mb-1" />
              <span className="font-bold text-gray-300">Camera Off</span>
            </div>
          )}

          {/* Real-Time Local Mic Volume Visualizer Bar or Muted Indicator */}
          {!isMicMuted && localVolume > 0 ? (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded-full z-10 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, localVolume * 1.5)}%` }}
                />
              </div>
            </div>
          ) : isMicMuted ? (
            <div
              id="pip-mic-muted-badge"
              className="absolute top-2 left-2 flex items-center gap-1 bg-red-950/90 border border-red-500/70 px-1.5 py-0.5 rounded-full z-10 text-[9px] text-red-200 font-bold shadow-md animate-pulse"
              title="Your microphone is muted - host cannot hear you"
            >
              <MicOff size={10} className="text-red-400" />
              <span>Mic Muted</span>
            </div>
          ) : null}

          {/* Quick Self-PiP Controls Toolbar (Top Right) */}
          {!isScreenMaximized && (
            <div className="absolute top-1.5 right-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
              {/* Quick Mute Microphone Button right on PiP */}
              <button
                id="pip-quick-mute-mic-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMicWithFeedback();
                }}
                title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                aria-label={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-md ${
                  isMicMuted
                    ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]'
                    : 'bg-black/70 hover:bg-black text-white border-white/20'
                }`}
              >
                {isMicMuted ? <MicOff size={12} /> : <Mic size={12} />}
              </button>

              {isScreenSharing ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      setIsScreenMaximized(true);
                    }}
                    title="Maximize Screen View"
                    className="w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                  >
                    <Maximize2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      toggleScreenShare();
                    }}
                    title="Stop Screen Sharing"
                    className="w-7 h-7 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center border border-rose-400/40 transition-all cursor-pointer"
                  >
                    <ScreenShareOff size={12} />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    switchCamera();
                  }}
                  title="Switch Camera (Front/Rear)"
                  className="w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                >
                  <SwitchCamera size={13} />
                </button>
              )}
            </div>
          )}

          {/* Name Tag / Screen Share Status Tag */}
          {!isScreenMaximized && (
            <div className="absolute bottom-1.5 left-2 z-10">
              {isScreenSharing ? (
                <div className="bg-emerald-950/90 border border-emerald-400/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] text-emerald-200 font-bold flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Your Screen (Live)</span>
                </div>
              ) : (
                <div className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] text-white font-bold border border-white/10 flex items-center gap-1.5 shadow-md">
                  <span>You ({user.name.slice(0, 8)}) {isMicMuted && '🔇'}</span>
                  {/* PiP Mini Network Strength Indicator */}
                  <div
                    id="pip-network-strength-indicator"
                    className="flex items-end gap-[1.5px] h-2.5 w-2.5 shrink-0"
                    title={`Network Quality: ${networkStrength.label}`}
                  >
                    <span
                      className={`w-[1.5px] rounded-xs ${
                        networkStrength.bars >= 1 ? networkStrength.bg : 'bg-white/20'
                      }`}
                      style={{ height: '3px' }}
                    />
                    <span
                      className={`w-[1.5px] rounded-xs ${
                        networkStrength.bars >= 2 ? networkStrength.bg : 'bg-white/20'
                      }`}
                      style={{ height: '5px' }}
                    />
                    <span
                      className={`w-[1.5px] rounded-xs ${
                        networkStrength.bars >= 3 ? networkStrength.bg : 'bg-white/20'
                      }`}
                      style={{ height: '7px' }}
                    />
                    <span
                      className={`w-[1.5px] rounded-xs ${
                        networkStrength.bars >= 4 ? networkStrength.bg : 'bg-white/20'
                      }`}
                      style={{ height: '9px' }}
                    />
                  </div>
                  <span className="text-amber-300 font-mono text-[8px] font-semibold border-l border-white/20 pl-1">
                    {formatTime(callDuration)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* 5. BOTTOM DOCK & CALL CONTROLS */}
      <footer className="relative z-20 w-full max-w-xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] flex flex-col items-center gap-3 sm:gap-4">
        {/* Enhanced Romantic Video Filters Dock Quick Selector */}
        <VideoFilters
          activeFilter={videoFilter}
          onFilterChange={setVideoFilter}
          intensity={filterIntensity}
          onIntensityChange={setFilterIntensity}
          applyToSelf={filterTarget === 'self' || filterTarget === 'both'}
          onToggleApplyToSelf={(enabled) => setFilterTarget(enabled ? 'both' : 'host')}
          targetVideoRefs={[remoteVideoRef, ...(filterTarget === 'self' || filterTarget === 'both' ? [localVideoRef] : [])]}
          onOpenFullDrawer={() => setShowFilterDrawer(true)}
        />

        {/* Primary Call Action Controls */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 w-full flex-wrap">
          {/* Mute Mic Button */}
          <button
            id="active-call-mute-mic-btn"
            onClick={handleToggleMicWithFeedback}
            title={isMicMuted ? 'Unmute Microphone (Resume Audio Transmission)' : 'Mute Microphone (Pause Audio Transmission)'}
            aria-label={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-xl cursor-pointer relative ${
              isMicMuted
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 shadow-[0_0_22px_rgba(239,68,68,0.85)] border-2 border-red-300 ring-2 ring-red-500/40 scale-105'
                : 'bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/40'
            }`}
          >
            {isMicMuted ? <MicOff size={20} className="text-white animate-pulse" /> : <Mic size={20} />}
            {isMicMuted && (
              <span className="absolute -bottom-1 text-[7px] font-black bg-red-950 text-red-200 px-1 rounded-full border border-red-400 leading-tight tracking-wider">
                MUTED
              </span>
            )}
          </button>

          {/* Video Camera Toggle Button */}
          <button
            id="active-call-toggle-camera-btn"
            onClick={handleToggleVideoWithFeedback}
            title={isVideoOff ? 'Turn Camera On (Enable Video Feed)' : 'Turn Camera Off (Disable Video Feed)'}
            aria-label={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-xl cursor-pointer relative ${
              isVideoOff
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 shadow-[0_0_22px_rgba(239,68,68,0.85)] border-2 border-red-300 ring-2 ring-red-500/40 scale-105'
                : 'bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/40'
            }`}
          >
            {isVideoOff ? <VideoOff size={20} className="text-white animate-pulse" /> : <VideoIcon size={20} />}
            {isVideoOff && (
              <span className="absolute -bottom-1 text-[7px] font-black bg-red-950 text-red-200 px-1 rounded-full border border-red-400 leading-tight tracking-wider">
                CAM OFF
              </span>
            )}
          </button>

          {/* Screen Sharing Toggle Button */}
          <button
            onClick={async () => {
              sound.playClick();
              const nowSharing = await toggleScreenShare();
              if (nowSharing) {
                confetti({ particleCount: 25, spread: 60, origin: { y: 0.85 } });
                setSubtitleText(`[Live Translation] ${host.name}: "I can see your screen now! What are we looking at? 🖥️✨"`);
              }
            }}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen in 1v1 Call'}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer relative ${
              isScreenSharing
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.85)] border-2 border-emerald-300 ring-2 ring-emerald-400/40 scale-105'
                : 'bg-white/15 hover:bg-white/25 border border-white/20 text-emerald-300 hover:text-white'
            }`}
          >
            {isScreenSharing ? <ScreenShareOff size={19} /> : <ScreenShare size={19} />}
            {isScreenSharing && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-black text-[8px] font-black text-white items-center justify-center">
                  ●
                </span>
              </span>
            )}
          </button>

          {/* Real-Time Video Filters & Romantic Overlays Selection Drawer */}
          <button
            onClick={() => {
              sound.playClick();
              setShowFilterDrawer(true);
            }}
            title="Real-time Romantic Overlays & Beauty Filters"
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer relative ${
              videoFilter !== 'none'
                ? 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-[0_0_20px_rgba(255,46,147,0.7)] border border-pink-300'
                : 'bg-white/15 hover:bg-white/25 border border-white/20 text-pink-300 hover:text-white'
            }`}
          >
            <Wand2 size={19} className={videoFilter !== 'none' ? 'animate-pulse' : ''} />
            {videoFilter !== 'none' && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-400 border border-black flex items-center justify-center text-[8px] font-black text-white">
                ✓
              </span>
            )}
          </button>

          {/* WebRTC Real-Time Connection Diagnostics Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowStatsModal(!showStatsModal);
            }}
            title="Toggle WebRTC Real-Time Stats (RTT, Jitter, Packet Loss)"
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
              showStatsModal
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,210,255,0.8)] border border-white'
                : 'bg-white/15 hover:bg-white/25 border border-white/20 text-cyan-300 hover:text-white'
            }`}
          >
            <Activity size={19} />
          </button>

          {/* Quick 3D Heart Reaction Stardust */}
          <button
            onClick={handleSendInCallHeartExplosion}
            title="Send Floating Romantic Stardust"
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-pink-500/30 hover:bg-pink-500/50 border border-pink-400 text-pink-300 hover:text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 cursor-pointer"
          >
            <Sparkles size={19} className="text-[#FFD700] animate-pulse" />
          </button>

          {/* Capture Moment Snapshot Button */}
          <button
            onClick={captureMoment}
            title="Capture Moment Snapshot of Video Call"
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 hover:scale-110 active:scale-95 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.7)] border border-amber-300 transition-all cursor-pointer"
          >
            <Camera size={19} />
          </button>

          {/* Send Virtual Gift in 1v1 Call */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGiftDrawer();
            }}
            title="Send Virtual Gift to Host"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] hover:scale-110 active:scale-95 flex items-center justify-center text-white shadow-[0_0_25px_#FF2E93] border-2 border-white/50 transition-all cursor-pointer"
          >
            <Gift size={22} />
          </button>

          {/* Flag & Report Host Quick Action */}
          <button
            id="active-call-footer-report-btn"
            onClick={() => {
              sound.playClick();
              setShowReportModal(true);
            }}
            title="Flag Inappropriate Behavior / Report Host to Super Admin"
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/60 hover:scale-110 active:scale-95 flex items-center justify-center text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
          >
            <ShieldAlert size={19} />
          </button>

          {/* End Call Hangup */}
          <button
            onClick={handleHangUp}
            title="End Private Call"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-500 hover:scale-110 active:scale-95 flex items-center justify-center text-white shadow-[0_0_25px_rgba(239,68,68,0.8)] border-2 border-white/30 transition-all cursor-pointer"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </footer>

      {/* Flag / Report Host & Safety Violations Modal */}
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
        contextDetails={{
          callDurationSec: callDuration
        }}
      />

      {/* Real-Time Video Filter Selection Interface Drawer */}
      <VideoFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        activeFilter={videoFilter}
        onFilterChange={setVideoFilter}
        intensity={filterIntensity}
        onIntensityChange={setFilterIntensity}
        target={filterTarget}
        onTargetChange={setFilterTarget}
        showOverlays={showOverlays}
        onToggleOverlays={setShowOverlays}
        onCompareHold={setIsComparing}
      />

      {/* Real-Time WebRTC Metrics Overlay (RTT, Jitter, Packet Loss % from Stats Report) */}
      <WebRtcMetricsOverlay
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        metrics={liveMetrics}
        history={metricsHistory}
        candidateDetails={candidateDetails}
        qualityScore={qualityScore}
        callDuration={callDuration}
        onSimulateSpike={simulateNetworkSpike}
        onTriggerReconnect={triggerManualReconnect}
      />

      {/* Camera Shutter Flash Effect */}
      <AnimatePresence>
        {captureFlash && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Microphone Mute / Unmute Status Toast Notification */}
      <AnimatePresence>
        {micStatusToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl backdrop-blur-2xl shadow-2xl border flex items-center gap-2 text-xs font-bold ${
              isMicMuted
                ? 'bg-red-950/95 border-red-500/70 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.5)] ring-1 ring-red-400/40'
                : 'bg-emerald-950/95 border-emerald-500/70 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-1 ring-emerald-400/40'
            }`}
          >
            {isMicMuted ? (
              <MicOff size={15} className="text-red-400 animate-pulse shrink-0" />
            ) : (
              <Mic size={15} className="text-emerald-400 shrink-0" />
            )}
            <span>{micStatusToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Video Feed Status Toast Notification */}
      <AnimatePresence>
        {videoStatusToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl backdrop-blur-2xl shadow-2xl border flex items-center gap-2 text-xs font-bold ${
              isVideoOff
                ? 'bg-red-950/95 border-red-500/70 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.5)] ring-1 ring-red-400/40'
                : 'bg-emerald-950/95 border-emerald-500/70 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-1 ring-emerald-400/40'
            }`}
          >
            {isVideoOff ? (
              <VideoOff size={15} className="text-red-400 animate-pulse shrink-0" />
            ) : (
              <VideoIcon size={15} className="text-emerald-400 shrink-0" />
            )}
            <span>{videoStatusToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {captureSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-900/90 border border-emerald-400 text-emerald-100 px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Moment captured successfully! Saved to device & Moments feed.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture Moment Preview & Publish Modal */}
      <AnimatePresence>
        {showCaptureModal && capturedMomentUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-950 border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-[0_30px_70px_rgba(0,0,0,0.9)] text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Camera size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Capture Moment Snapshot</h3>
                    <p className="text-[10px] text-gray-400">Save or share your romantic memory</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCaptureModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Snapshot Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black aspect-video shadow-2xl">
                <img
                  referrerPolicy="no-referrer"
                  src={capturedMomentUrl}
                  alt="Captured Moment"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>Amorex 1v1 Call • {host.name}</span>
                </div>
              </div>

              {/* Caption Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-300 font-medium">Add a Caption for your Moments Feed:</label>
                <textarea
                  value={momentCaption}
                  onChange={(e) => setMomentCaption(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="Share your feelings or song preview..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={downloadSnapshot}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Download size={15} />
                  <span>Download to Device</span>
                </button>

                <button
                  type="button"
                  onClick={publishToMoments}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 hover:scale-[1.02] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
                >
                  <Sparkles size={15} className="text-amber-200" />
                  <span>Post to Moments Feed</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
