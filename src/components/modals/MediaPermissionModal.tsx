import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, CheckCircle2, Shield, AlertCircle, X, Sparkles, Smartphone, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../../utils/audio';

interface MediaPermissionModalProps {
  mode: 'video_call' | 'mic_seat' | 'call';
  onGranted: () => void;
  onClose: () => void;
}

export const MediaPermissionModal: React.FC<MediaPermissionModalProps> = ({
  mode,
  onGranted,
  onClose
}) => {
  const [testing, setTesting] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isVideo = mode === 'video_call' || mode === 'call';

  const requestPermissions = async () => {
    sound.playClick();
    setTesting(true);
    setPermissionError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media Devices API not supported in current browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false
      });

      streamRef.current = stream;
      setMicActive(true);
      if (isVideo) {
        setCameraActive(true);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
      }

      sound.playCoinDrop();
      setTimeout(() => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        onGranted();
      }, 900);
    } catch (err: any) {
      console.warn('Permission request feedback:', err);
      setPermissionError(
        'Permissions was dismissed or blocked. You can still proceed in interactive preview mode or enable browser permissions.'
      );
      setTesting(false);
    }
  };

  const handleSimulateGrant = () => {
    sound.playCoinDrop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onGranted();
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-[#14162B] border border-pink-500/40 rounded-3xl p-6 shadow-2xl relative text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF2E93] to-[#00D2FF] mx-auto flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,46,147,0.5)] mb-3">
            {isVideo ? <Camera size={26} /> : <Mic size={26} />}
          </div>
          <h3 className="text-lg font-black tracking-tight text-white">
            {isVideo ? 'Enable Camera & Microphone' : 'Enable Microphone Audio'}
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            {isVideo
              ? 'Required for crystal-clear 1v1 romantic live video and real-time AI speech translation.'
              : 'Required to speak on the 12-seat interactive party lounge mic.'}
          </p>
        </div>

        {/* Simulated Visual Browser Prompt Graphic */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#090A15] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <Globe size={13} className="text-[#00D2FF]" />
              <span className="font-mono text-gray-300">amorex.live wants to:</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Secure HTTPS</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-200">
                <Mic size={14} className="text-[#00D2FF]" />
                Use your microphone
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                Required
              </span>
            </div>

            {isVideo && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-200">
                  <Camera size={14} className="text-[#FF2E93]" />
                  Use your camera
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                  Required
                </span>
              </div>
            )}
          </div>

          {/* Live Video Camera Tester Container if activated */}
          {isVideo && (
            <div className="mt-3 relative aspect-video w-full max-h-36 bg-black/60 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-all duration-300 ${cameraActive ? 'block' : 'hidden'}`}
              />
              {!cameraActive && (
                <div className="text-center text-[11px] text-gray-400 flex flex-col items-center gap-1">
                  <Sparkles size={16} className="text-[#FFD700]" />
                  <span>Preview will display upon permission grant</span>
                </div>
              )}
            </div>
          )}
        </div>

        {permissionError && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
              <span className="text-[11px] font-semibold">{permissionError}</span>
            </div>

            {/* Mobile Safari & Chrome Quick Help Steps */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-gray-300 space-y-1.5 font-sans">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <Smartphone size={12} />
                <span>How to Unblock in Browser Settings:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[10px] text-gray-300">
                <li><strong className="text-white">iOS Safari:</strong> Tap the <span className="text-cyan-300 font-mono">"aA"</span> button in the URL address bar &gt; <span className="text-white">Website Settings</span> &gt; Set Camera &amp; Mic to <span className="text-emerald-400">"Allow"</span>.</li>
                <li><strong className="text-white">Android Chrome:</strong> Tap the <span className="text-cyan-300 font-mono">🔒 Lock</span> or Tune icon beside the URL &gt; <span className="text-white">Permissions</span> &gt; Reset &amp; Allow.</li>
                <li><strong className="text-white">Desktop:</strong> Click the camera icon on the right side of the address bar and select "Always allow".</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          <button
            onClick={requestPermissions}
            disabled={testing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,147,0.5)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Connecting Devices...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Allow & Join Now</span>
              </>
            )}
          </button>

          <button
            onClick={handleSimulateGrant}
            className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 font-bold hover:text-white transition-colors"
          >
            Continue in Virtual Interactive Mode
          </button>
        </div>

        {/* Mobile Safari/Chrome Help Footnote */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <Shield size={12} className="text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Smartphone size={11} />
            <span>iOS / Android Ready</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
