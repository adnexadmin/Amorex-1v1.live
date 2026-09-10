import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRtcService, WebRtcCallState, WebRtcStats, ReconnectToastInfo } from '../services/WebRtcService';
import { db } from '../services/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  addDoc 
} from 'firebase/firestore';

interface UseWebRtcCallOptions {
  autoConnect?: boolean;
  isVideoCall?: boolean;
  callId?: string;
  isCaller?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function useWebRtcCall({
  autoConnect = true,
  isVideoCall = true,
  callId,
  isCaller = true,
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
  const [activeCallId, setActiveCallId] = useState<string | null>(callId || null);

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
  const unsubscribersRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const service = new WebRtcService();
    rtcServiceRef.current = service;

    service.onStateChange((state) => {
      setCallState(state);
      if (state === 'connected' && onConnected) onConnected();
      if (state === 'closed' && onDisconnected) onDisconnected();
    });

    service.onToast((toast) => {
      setReconnectToast(toast);
      if (toast.status === 'restored') {
        setTimeout(() => {
          setReconnectToast((prev) => (prev?.status === 'restored' ? null : prev));
        }, 2500);
      }
    });

    service.onStats((currentStats) => setStats(currentStats));
    service.onVolumeChange((vol) => setLocalVolume(vol));

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

    // Real WebRTC Signaling setup with Firebase Firestore
    const setupRealWebRtcConnection = async () => {
      try {
        const localStream = await service.getLocalMedia({ video: isVideoCall, audio: true });
        setHasPermission(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const peerConnection = service.getPeerConnection();
        if (!peerConnection || !db) {
          await service.initPeerConnection(false);
          return;
        }

        // Add local tracks to WebRTC peer connection
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });

        // Set remote stream event
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        const targetCallId = callId || `call_${Date.now()}`;
        setActiveCallId(targetCallId);
        const callDocRef = doc(db, 'calls', targetCallId);
        const callerCandidatesCol = collection(callDocRef, 'callerCandidates');
        const calleeCandidatesCol = collection(callDocRef, 'calleeCandidates');

        if (isCaller) {
          // 1. Caller registers ICE candidates
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              addDoc(callerCandidatesCol, event.candidate.toJSON());
            }
          };

          // 2. Create and set offer
          const offerDescription = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offerDescription);

          await setDoc(callDocRef, {
            offer: {
              type: offerDescription.type,
              sdp: offerDescription.sdp
            },
            status: 'calling',
            createdAt: Date.now()
          });

          // 3. Listen for Answer
          const unsubCall = onSnapshot(callDocRef, (snapshot) => {
            const data = snapshot.data();
            if (data?.answer && !peerConnection.currentRemoteDescription) {
              const answerDescription = new RTCSessionDescription(data.answer);
              peerConnection.setRemoteDescription(answerDescription);
            }
          });
          unsubscribersRef.current.push(unsubCall);

          // 4. Listen for Callee ICE candidates
          const unsubCandidates = onSnapshot(calleeCandidatesCol, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate).catch(console.warn);
              }
            });
          });
          unsubscribersRef.current.push(unsubCandidates);

        } else {
          // Callee Mode
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              addDoc(calleeCandidatesCol, event.candidate.toJSON());
            }
          };

          const callDocSnap = await getDoc(callDocRef);
          const callData = callDocSnap.data();

          if (callData?.offer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));
            const answerDescription = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answerDescription);

            await updateDoc(callDocRef, {
              answer: {
                type: answerDescription.type,
                sdp: answerDescription.sdp
              },
              status: 'connected'
            });
          }

          // Listen for Caller ICE candidates
          const unsubCallerCandidates = onSnapshot(callerCandidatesCol, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate).catch(console.warn);
              }
            });
          });
          unsubscribersRef.current.push(unsubCallerCandidates);
        }

      } catch (err) {
        console.warn('[useWebRtcCall] WebRTC Signaling Error:', err);
        setHasPermission(false);
        setPermissionError('Could not acquire direct media stream or signaling channel.');
      }
    };

    if (autoConnect) {
      setupRealWebRtcConnection();
    }

    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
      service.close();
      rtcServiceRef.current = null;
    };
  }, [autoConnect, isVideoCall, callId, isCaller, onConnected, onDisconnected]);

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
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];
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
    activeCallId,
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
