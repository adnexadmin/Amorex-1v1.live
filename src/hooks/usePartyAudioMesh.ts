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

  useEffect(() => {
    setIsCameraActive(isVideoEnabled);
  }, [isVideoEnabled]);

  // Setup hardware mic & camera capture when user takes a seat
  useEffect(() => {
    if (userSeatIndex === null) {
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
      setSpeakingVolumes({});
      return;
    }

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
        console.warn('[usePartyAudioMesh] Microphone access denied or unavailable:', err);
        setIsAudioMeshConnected(true);
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

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !isMicMuted;
      });
    }
  }, [isMicMuted]);

  // Real-time local speaking volume tracking without dummy/random simulation
  useEffect(() => {
    if (userSeatIndex === null) {
      setSpeakingVolumes({});
      return;
    }

    setSpeakingVolumes({
      [userSeatIndex]: isMicMuted ? 0 : localMicLevel
    });
  }, [userSeatIndex, localMicLevel, isMicMuted]);

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
