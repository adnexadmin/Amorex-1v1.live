import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRtcService, WebRtcCallState, WebRtcStats, ReconnectToastInfo } from '../services/WebRtcService';

interface UseWebRtcCallOptions {
  autoConnect?: boolean;
  isVideoCall?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function useWebRtcCall({
  autoConnect = true,
  isVideoCall = true,
  onConnected,
  onDisconnected
}: UseWebRtcCallOptions = {}) {
  const [callState, setCallState] = useState<WebRtcCallState>('idle');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [localVolume, setLocalVolume] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [reconnectToast, setReconnectToast] = useState<ReconnectToastInfo | null>(null);
  const [stats, setStats] = useState<WebRtcStats>({
    latencyMs: 32,
    rttMs: 32,
    jitterMs: 2.8,
    packetLossPercentage: 0.0,
    packetsLost: 0,
    packetsReceived: 2400,
    fps: 30,
    resolution: '1280x720 (HD 720p)',
    bitrateKbps: 2040,
    connectionQuality: 'excellent'
  });

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const rtcServiceRef = useRef<WebRtcService | null>(null);

  // Initialize service
  useEffect(() => {
    const service = new WebRtcService();
    rtcServiceRef.current = service;

    service.onStateChange((state) => {
      setCallState(state);
      if (state === 'connected' && onConnected) {
        onConnected();
      }
      if (state === 'closed' && onDisconnected) {
        onDisconnected();
      }
    });

    service.onToast((toast) => {
      setReconnectToast(toast);
      if (toast.status === 'restored') {
        // Auto dismiss restored toast after 2.5s
        setTimeout(() => {
          setReconnectToast((prev) => (prev?.status === 'restored' ? null : prev));
        }, 2500);
      }
    });

    service.onStats((currentStats) => {
      setStats(currentStats);
    });

    service.onVolumeChange((vol) => {
      setLocalVolume(vol);
    });

    service.onRemoteStream((stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    service.onScreenShareChange((isSharing) => {
      setIsScreenSharing(isSharing);
      if (localVideoRef.current && service.getLocalStream()) {
        localVideoRef.current.srcObject = service.getLocalStream();
      }
    });

    if (autoConnect) {
      service.getLocalMedia({ video: isVideoCall, audio: true })
        .then((localStream) => {
          setHasPermission(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
          return service.initPeerConnection(true);
        })
        .catch((err) => {
          console.warn('[useWebRtcCall] Media capture error:', err);
          setHasPermission(false);
          setPermissionError('Camera or Microphone access could not be acquired directly.');
        });
    }

    return () => {
      service.close();
      rtcServiceRef.current = null;
    };
  }, [autoConnect, isVideoCall, onConnected, onDisconnected]);

  const toggleMic = useCallback(() => {
    if (!rtcServiceRef.current) return;
    const isNowActive = rtcServiceRef.current.toggleAudio();
    setIsMicMuted(!isNowActive);
  }, []);

  const toggleVideo = useCallback(() => {
    if (!rtcServiceRef.current) return;
    const isNowActive = rtcServiceRef.current.toggleVideo();
    setIsVideoOff(!isNowActive);
  }, []);

  const switchCamera = useCallback(async () => {
    if (!rtcServiceRef.current) return;
    const updatedStream = await rtcServiceRef.current.switchCamera();
    if (updatedStream && localVideoRef.current) {
      localVideoRef.current.srcObject = updatedStream;
    }
  }, []);

  const triggerManualReconnect = useCallback(async () => {
    if (rtcServiceRef.current) {
      await rtcServiceRef.current.restartIce();
    }
  }, []);

  const simulateNetworkDrop = useCallback(() => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.simulateNetworkDrop();
    }
  }, []);

  const simulateNetworkSpike = useCallback(() => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.simulateNetworkSpike();
    }
  }, []);

  const dismissToast = useCallback(() => {
    setReconnectToast(null);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (!rtcServiceRef.current) return false;
    const isNowSharing = await rtcServiceRef.current.toggleScreenShare();
    setIsScreenSharing(isNowSharing);
    if (localVideoRef.current && rtcServiceRef.current.getLocalStream()) {
      localVideoRef.current.srcObject = rtcServiceRef.current.getLocalStream();
    }
    return isNowSharing;
  }, []);

  const startScreenShare = useCallback(async () => {
    if (!rtcServiceRef.current) return false;
    await rtcServiceRef.current.startScreenShare();
    setIsScreenSharing(true);
    if (localVideoRef.current && rtcServiceRef.current.getLocalStream()) {
      localVideoRef.current.srcObject = rtcServiceRef.current.getLocalStream();
    }
    return true;
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (!rtcServiceRef.current) return false;
    await rtcServiceRef.current.stopScreenShare();
    setIsScreenSharing(false);
    if (localVideoRef.current && rtcServiceRef.current.getLocalStream()) {
      localVideoRef.current.srcObject = rtcServiceRef.current.getLocalStream();
    }
    return false;
  }, []);

  const sendDataMessage = useCallback((payload: any) => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.sendDataPayload(payload);
    }
  }, []);

  const endCall = useCallback(() => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.close();
    }
  }, []);

  return {
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
    rtcService: rtcServiceRef.current,
    getPeerConnection: useCallback(() => rtcServiceRef.current?.getPeerConnection() || null, []),
    toggleMic,
    toggleVideo,
    switchCamera,
    toggleScreenShare,
    startScreenShare,
    stopScreenShare,
    triggerManualReconnect,
    simulateNetworkDrop,
    simulateNetworkSpike,
    dismissToast,
    sendDataMessage,
    endCall
  };
}
