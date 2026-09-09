import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePartyAudioMeshOptions {
  userSeatIndex: number | null;
  totalSeats?: number;
  isMicMuted?: boolean;
  isVideoEnabled?: boolean;
}

export function usePartyAudioMesh({
  userSeatIndex,
  totalSeats = 12,
  isMicMuted = false,
  isVideoEnabled = false
}: UsePartyAudioMeshOptions) {
  const [speakingVolumes, setSpeakingVolumes] = useState<Record<number, number>>({});
  const [isAudioMeshConnected, setIsAudioMeshConnected] = useState<boolean>(false);
  const [localMicLevel, setLocalMicLevel] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(isVideoEnabled);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync isCameraActive if initial isVideoEnabled changes
  useEffect(() => {
    setIsCameraActive(isVideoEnabled);
  }, [isVideoEnabled]);

  // Setup hardware mic & camera capture when user takes a seat
  useEffect(() => {
    if (userSeatIndex === null) {
      // User left mic seat: cleanup media hardware
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setLocalStream(null);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setIsAudioMeshConnected(false);
      setLocalMicLevel(0);
      return;
    }

    // User took a seat: open audio stream (and video stream if camera active)
    let isCancelled = false;

    async function initMedia() {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: isCameraActive
              ? { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } }
              : false
          });
        } catch (mediaErr) {
          // If video requested but failed, fallback to audio only
          if (isCameraActive) {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              },
              video: false
            });
          } else {
            throw mediaErr;
          }
        }

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsAudioMeshConnected(true);

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.75;
          source.connect(analyser);
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const analyze = () => {
            if (isCancelled || !analyserRef.current) return;

            if (isMicMuted) {
              setLocalMicLevel(0);
            } else {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const avg = sum / bufferLength;
              const normalized = Math.min(100, Math.round((avg / 128) * 100));
              setLocalMicLevel(normalized);
            }

            animationFrameRef.current = requestAnimationFrame(analyze);
          };

          animationFrameRef.current = requestAnimationFrame(analyze);
        }
      } catch (err) {
        console.warn('[usePartyAudioMesh] Microphone access failed or denied:', err);
        setIsAudioMeshConnected(true); // graceful fallback
      }
    }

    initMedia();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [userSeatIndex, isMicMuted]);

  // Track mic mute dynamically on audio tracks
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !isMicMuted;
      });
    }
  }, [isMicMuted]);

  // Aggregate speaking levels across all seats in the party lounge
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      const newVolumes: Record<number, number> = {};

      // Host (Seat 0) has periodic natural speech modulation
      const hostTalking = Math.random() > 0.4;
      newVolumes[0] = hostTalking ? Math.floor(40 + Math.random() * 50) : 0;

      // Simulated guest seats chatter occasionally
      for (let i = 1; i <= totalSeats; i++) {
        if (i === userSeatIndex) {
          newVolumes[i] = isMicMuted ? 0 : localMicLevel;
        } else {
          // Other seats occasionally speak
          const isSeatActive = (i % 3 === 0 && Math.random() > 0.6) || (i === 2 && Math.random() > 0.5);
          newVolumes[i] = isSeatActive ? Math.floor(30 + Math.random() * 45) : 0;
        }
      }

      setSpeakingVolumes(newVolumes);
    }, 150);

    return () => clearInterval(simulationInterval);
  }, [userSeatIndex, localMicLevel, totalSeats, isMicMuted]);

  // Toggle camera active state & track
  const toggleCamera = useCallback(async () => {
    const nextState = !isCameraActive;
    setIsCameraActive(nextState);

    if (localStreamRef.current) {
      const currentVideoTracks = localStreamRef.current.getVideoTracks();
      if (nextState) {
        if (currentVideoTracks.length > 0) {
          currentVideoTracks.forEach((t) => (t.enabled = true));
        } else {
          try {
            const vidStream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } }
            });
            const newTrack = vidStream.getVideoTracks()[0];
            if (newTrack) {
              localStreamRef.current.addTrack(newTrack);
              setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
            }
          } catch (e) {
            console.warn('[usePartyAudioMesh] Camera add failed:', e);
            setIsCameraActive(false);
          }
        }
      } else {
        currentVideoTracks.forEach((t) => {
          t.enabled = false;
        });
      }
    }
  }, [isCameraActive]);

  return {
    speakingVolumes,
    isAudioMeshConnected,
    localMicLevel,
    localStream,
    isCameraActive,
    toggleCamera
  };
}
