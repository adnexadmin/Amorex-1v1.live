import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StreamHost, UserProfile, VideoFilterType } from '../../types';
import { sound } from '../../utils/audio';
import { useWebRtcCall } from '../../hooks/useWebRtcCall';
import { RomanticOverlaysLayer } from '../common/RomanticOverlaysLayer';
import { VideoFilterDrawer } from './VideoFilterDrawer';
import { ReportUserModal } from './ReportUserModal';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Gift,
  Wand2,
  SwitchCamera,
  Volume2,
  VolumeX,
  Clock,
  ShieldAlert,
  Coins
} from 'lucide-react';

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
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);

  const connectedAtRef = useRef<number | null>(null);
  const chargedSlabsRef = useRef<Set<number>>(new Set());
  const totalCoinsDeductedRef = useRef<number>(0);

  // Check if calling the same host again from persistent Call History
  const isRepeatCall = useMemo(() => {
    try {
      const raw = localStorage.getItem('amorex_call_history');
      if (!raw) return false;
      const history = JSON.parse(raw);
      return Array.isArray(history) && history.some((item: any) => item.hostId === host?.id || item.hostName === host?.name);
    } catch {
      return false;
    }
  }, [host?.id, host?.name]);

  const [currentRateText, setCurrentRateText] = useState<string>(
    isRepeatCall ? 'VIP Re-Call (2000 🪙)' : '1x Base (300 🪙)'
  );

  // Guardrail: Minimum 300 coins required to start call (or 2000 if repeat call)
  const minRequiredCoins = isRepeatCall ? 2000 : 300;
  useEffect(() => {
    if ((user?.coins ?? 0) < minRequiredCoins) {
      sound.playAlert();
      alert(`Insufficient Coins! You need at least ${minRequiredCoins} coins to initiate this call.`);
      onEndCall(0, 0);
    }
  }, [user?.coins, minRequiredCoins, onEndCall]);

  const sharedCallSessionId = useMemo(() => {
    const p1 = (user?.id || user?.displayId || 'user_1').trim();
    const p2 = (host?.id || host?.displayId || 'host_2').trim();
    return [p1, p2].sort().join('_call_');
  }, [user?.id, user?.displayId, host?.id, host?.displayId]);

  const {
    localVideoRef,
    remoteVideoRef,
    callState,
    isMicMuted,
    isVideoOff,
    toggleMic,
    toggleVideo,
    switchCamera,
    endCall: closeRtc
  } = useWebRtcCall({
    autoConnect: true,
    isVideoCall: true,
    callId: sharedCallSessionId,
    isCaller: true
  });

  // Dynamic 45-Second Multiplier Calculator with Repeat Call Engine
  const getSlabCost = (slabIndex: number): { amount: number; label: string } => {
    if (isRepeatCall) {
      return { amount: 2000, label: 'VIP Re-Call (2000 🪙)' };
    }
    if (slabIndex === 1) return { amount: 300, label: '1x Base (300 🪙)' };
    if (slabIndex === 2) return { amount: 600, label: '2x Double (600 🪙)' };
    if (slabIndex === 3) return { amount: 900, label: '3x Triple (900 🪙)' };
    if (slabIndex === 4) return { amount: 1200, label: '4x Quad (1200 🪙)' };
    return { amount: 2000, label: 'VIP Max (2000 🪙)' };
  };

  // High-Precision Real-time Interval for Slabs and Deductions
  useEffect(() => {
    if (callState !== 'connected') {
      if (connectedAtRef.current === null) setCallDuration(0);
      return;
    }

    if (connectedAtRef.current === null) {
      connectedAtRef.current = Date.now();
      sound.playCallConnected();

      // Deduct Slab 1 immediately on connect
      const firstSlab = getSlabCost(1);
      const success = onDeductCoins(firstSlab.amount);

      if (!success) {
        sound.playAlert();
        closeRtc();
        onEndCall(0, 0);
        return;
      }

      chargedSlabsRef.current.add(1);
      totalCoinsDeductedRef.current += firstSlab.amount;
      setCurrentRateText(firstSlab.label);
    }

    const interval = setInterval(() => {
      if (connectedAtRef.current) {
        const elapsed = Math.max(0, Math.floor((Date.now() - connectedAtRef.current) / 1000));
        setCallDuration(elapsed);

        // Every 45-second boundary marks a new slab
        const activeSlab = Math.floor(elapsed / 45) + 1;

        if (!chargedSlabsRef.current.has(activeSlab)) {
          const slabData = getSlabCost(activeSlab);
          const success = onDeductCoins(slabData.amount);

          if (!success) {
            sound.playAlert();
            alert("Insufficient Coins! Call ended automatically.");
            closeRtc();
            onEndCall(elapsed, totalCoinsDeductedRef.current);
          } else {
            sound.playCoinDrop();
            chargedSlabsRef.current.add(activeSlab);
            totalCoinsDeductedRef.current += slabData.amount;
            setCurrentRateText(slabData.label);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, onDeductCoins, closeRtc, onEndCall, isRepeatCall]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHangUp = () => {
    sound.playEndCall();
    closeRtc();
    const finalDuration = connectedAtRef.current
      ? Math.max(0, Math.floor((Date.now() - connectedAtRef.current) / 1000))
      : 0;
    onEndCall(finalDuration, totalCoinsDeductedRef.current);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between select-none overflow-hidden font-sans w-screen h-screen">
      {/* 1. Main Remote Video Canvas */}
      <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={isSpeakerMuted}
          className="w-full h-full object-cover"
        />

        {callState !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/75 backdrop-blur-xl border border-pink-500/50 rounded-3xl p-6 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center text-2xl animate-ping mx-auto mb-3">
                📞
              </div>
              <h4 className="text-sm font-black text-white">Connecting 1v1 Live Stream...</h4>
              <p className="text-xs text-pink-300 font-mono mt-1">{host?.name || 'User'}</p>
            </div>
          </div>
        )}

        <RomanticOverlaysLayer
          filterType={videoFilter}
          intensity={filterIntensity}
          enabled={showOverlays && !isComparing}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* 2. Top Header with Real-time Multiplier Status */}
      <header className="relative z-20 w-full max-w-5xl px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl rounded-full py-1.5 px-3 border border-white/20 shadow-xl">
          <img
            referrerPolicy="no-referrer"
            src={host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={host?.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-[#FF2E93]"
          />
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white leading-none">{host?.name}</h3>
            <p className="text-[10px] text-pink-300 font-mono mt-0.5">ID: {host?.displayId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-amber-500 to-pink-500 text-black px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg animate-pulse">
            <Coins size={12} />
            <span>{currentRateText}</span>
          </div>

          <button
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className="p-2 rounded-full bg-black/70 border border-white/20 text-white cursor-pointer"
          >
            {isSpeakerMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>

          <div className="backdrop-blur-2xl border rounded-2xl px-3 py-1.5 flex items-center gap-1.5 bg-black/80 border-amber-400/70 shadow-lg text-white text-xs font-mono font-black">
            <Clock size={12} className="text-amber-300" />
            <span>{formatTime(callDuration)}</span>
          </div>
        </div>
      </header>

      {/* 3. Floating User Camera (Picture-in-Picture) */}
      <div className="absolute top-20 right-4 z-30 w-32 sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-pink-400/80 shadow-2xl bg-slate-900">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        {isVideoOff && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-gray-400 text-xs">
            <VideoOff size={20} className="text-pink-400 mb-1" />
            <span>Cam Off</span>
          </div>
        )}
        <button
          onClick={switchCamera}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white border border-white/20 cursor-pointer"
        >
          <SwitchCamera size={12} />
        </button>
      </div>

      {/* 4. Action Dock Toolbar */}
      <footer className="relative z-20 w-full max-w-xl px-4 pb-6 flex items-center justify-center gap-3">
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer ${
            isMicMuted ? 'bg-red-600' : 'bg-white/20 border border-white/30'
          }`}
        >
          {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer ${
            isVideoOff ? 'bg-red-600' : 'bg-white/20 border border-white/30'
          }`}
        >
          {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
        </button>

        <button
          onClick={() => setShowFilterDrawer(true)}
          className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-pink-300 cursor-pointer"
        >
          <Wand2 size={20} />
        </button>

        <button
          onClick={onOpenGiftDrawer}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF2E93] to-purple-600 flex items-center justify-center text-white shadow-lg cursor-pointer"
        >
          <Gift size={20} />
        </button>

        <button
          onClick={() => setShowReportModal(true)}
          className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-300 cursor-pointer"
        >
          <ShieldAlert size={20} />
        </button>

        <button
          onClick={handleHangUp}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-2xl cursor-pointer"
        >
          <PhoneOff size={22} />
        </button>
      </footer>

      {/* Video Filter Drawer */}
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

      {/* Safety Report Modal */}
      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUser={{
          id: host?.id,
          name: host?.name,
          avatar: host?.avatar,
          displayId: host?.displayId,
          role: 'VERIFIED_HOST'
        }}
        currentUser={user}
        sourceContext="1v1_call"
        contextDetails={{ callDurationSec: callDuration }}
      />
    </div>
  );
};
