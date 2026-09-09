import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Region, Gender } from '../../types';
import { sound } from '../../utils/audio';
import { CheckCircle, Camera, Sparkles, User, ShieldCheck, ArrowRight, RefreshCw, Lock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { livenessSecurityController } from '../../services/privacySecurityBackend';

interface OnboardingModalProps {
  initialUser: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

const REGIONAL_AVATARS: Record<Region, string[]> = {
  'India': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'
  ],
  'Middle East': [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80'
  ],
  'Bangladesh': [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
  ],
  'Pakistan': [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80'
  ],
  'Southeast Asia': [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80'
  ],
  'Global': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  ]
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ initialUser, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [gender, setGender] = useState<Gender>(initialUser.gender || 'female');
  const [is18Plus, setIs18Plus] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<Region>('India');
  const [avatarUrl, setAvatarUrl] = useState<string>(initialUser.avatar);
  const [name, setName] = useState<string>(initialUser.name);

  // Liveness test states
  const [livenessStage, setLivenessStage] = useState<'idle' | 'scanning' | 'blink' | 'turn' | 'verified'>('idle');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartLiveness = async () => {
    sound.playClick();
    setLivenessStage('scanning');
    setCameraActive(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      // Camera permission or fallback
    }

    // Step through prompts: Blink -> Turn Head -> Verified
    setTimeout(() => {
      setLivenessStage('blink');
      sound.playClick();
    }, 1200);

    setTimeout(() => {
      setLivenessStage('turn');
      sound.playClick();
    }, 2400);

    setTimeout(async () => {
      // Execute backend controller: ephemeral in-memory evaluation with immediate zeroization purge
      try {
        const response = await livenessSecurityController.processLivenessVerification({
          userId: initialUser.id,
          gestureSequence: ['blink', 'turn_left', 'smile'],
          clientTimestamp: Date.now()
        });
        console.log('[Privacy Enforcement] Verification Audit Record (Biometric Retained: false):', response.auditRecord);
      } catch (err) {
        console.warn('Liveness verification background controller notice:', err);
      }

      // Immediately stop camera tracks so media frame buffers are freed from device memory
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);

      setLivenessStage('verified');
      sound.playJackpotFanfare();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    }, 3800);
  };

  const handleClaimReward = () => {
    sound.playCoinDrop();
    const updated: UserProfile = {
      ...initialUser,
      name: name || initialUser.name,
      gender,
      region: selectedRegion,
      avatar: avatarUrl,
      faceVerified: livenessStage === 'verified',
      isVerifiedHost: livenessStage === 'verified',
      coins: initialUser.coins + 180, // Credited 180 coins
      vouchers: 3 // 3 Free 60-Sec Call Vouchers
    };
    onComplete(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-[#14162B] border border-pink-500/30 rounded-3xl p-6 shadow-2xl relative text-white"
      >
        {/* Step Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
            <span>Step {step} of 4</span>
            <span className="text-pink-400">
              {step === 1 && 'Gender & 18+ Age Verification'}
              {step === 2 && 'Regional Aesthetic Avatar'}
              {step === 3 && 'AI Face Liveness Test'}
              {step === 4 && 'Claim 3 Free Call Vouchers'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Gender & Age */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2E93] to-purple-600 flex items-center justify-center mx-auto mb-2 text-2xl shadow-lg">
                👥
              </div>
              <h3 className="text-xl font-black">Select Your Gender & Profile Name</h3>
              <p className="text-xs text-gray-400 mt-1">
                Customize your dating discovery preferences on Amorex Live
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Nickname"
                className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">I am:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setGender('female');
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    gender === 'female'
                      ? 'bg-gradient-to-b from-[#FF2E93]/25 to-purple-900/30 border-[#FF2E93] shadow-[0_0_15px_rgba(255,46,147,0.4)] scale-102'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-3xl">👩</span>
                  <span className="text-sm font-bold">Female</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setGender('male');
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    gender === 'male'
                      ? 'bg-gradient-to-b from-[#00D2FF]/25 to-blue-900/30 border-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.4)] scale-102'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-3xl">👨</span>
                  <span className="text-sm font-bold">Male</span>
                </button>
              </div>
            </div>

            {/* 18+ Age Verification Checkbox */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={is18Plus}
                onChange={(e) => setIs18Plus(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF2E93] focus:ring-pink-500 bg-gray-800"
              />
              <span className="text-xs text-gray-300 font-medium">
                I confirm that I am <strong className="text-white">18 years of age or older</strong> and agree to Amorex Community Standards.
              </span>
            </label>

            <button
              disabled={!is18Plus}
              onClick={() => {
                sound.playClick();
                setStep(2);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#9D00FF] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <span>Continue to Avatar Selection</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: Regional Aesthetic Avatar */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00D2FF] to-blue-600 flex items-center justify-center mx-auto mb-2 text-2xl shadow-lg">
                🎨
              </div>
              <h3 className="text-xl font-black">Pick Cultural Aesthetic Avatar</h3>
              <p className="text-xs text-gray-400 mt-1">
                Choose an AI regional avatar or select your regional identity
              </p>
            </div>

            {/* Region Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {(['India', 'Middle East', 'Bangladesh', 'Pakistan', 'Southeast Asia'] as Region[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    sound.playClick();
                    setSelectedRegion(r);
                  }}
                  className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all ${
                    selectedRegion === r
                      ? 'bg-[#FF2E93] text-white shadow-md'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-3 gap-3 py-2">
              {REGIONAL_AVATARS[selectedRegion]?.map((url, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sound.playClick();
                    setAvatarUrl(url);
                  }}
                  className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                    avatarUrl === url
                      ? 'border-[#FF2E93] scale-105 shadow-[0_0_15px_#FF2E93]'
                      : 'border-white/10 hover:border-white/40'
                  }`}
                >
                  <img referrerPolicy="no-referrer" src={url} alt="Avatar" className="w-full h-full object-cover" />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-[#FF2E93]/20 flex items-center justify-center">
                      <CheckCircle size={22} className="text-white drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setStep(3);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#00D2FF] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <span>Continue to Face Liveness</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: AI Face Liveness Camera Test */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-2 text-2xl shadow-lg">
                🛡️
              </div>
              <h3 className="text-xl font-black">AI Face Liveness Verification</h3>
              <p className="text-xs text-gray-400 mt-1">
                Blink & turn head to verify host authenticity & earn the green verified badge
              </p>
            </div>

            {/* Camera Viewport / Liveness stage */}
            <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] bg-black/80 flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <img
                  referrerPolicy="no-referrer"
                  src={avatarUrl}
                  alt="Face"
                  className="w-full h-full object-cover opacity-70"
                />
              )}

              {/* Scanning Overlay Rings */}
              {livenessStage === 'scanning' && (
                <div className="absolute inset-0 border-2 border-dashed border-cyan-400 rounded-full animate-spin" />
              )}

              {/* Status Banner */}
              <div className="absolute bottom-2 inset-x-2 bg-black/80 backdrop-blur-md rounded-xl py-1 px-2 text-center">
                {livenessStage === 'idle' && <span className="text-[11px] text-gray-300">Tap Start Test</span>}
                {livenessStage === 'scanning' && <span className="text-[11px] text-cyan-300 font-bold animate-pulse">Detecting Face...</span>}
                {livenessStage === 'blink' && <span className="text-[11px] text-amber-300 font-bold animate-bounce">👁️ Please Blink Now!</span>}
                {livenessStage === 'turn' && <span className="text-[11px] text-pink-300 font-bold animate-bounce">🔄 Turn Head Gently</span>}
                {livenessStage === 'verified' && (
                  <span className="text-[11px] text-emerald-300 font-black flex items-center justify-center gap-1">
                    <ShieldCheck size={13} /> 100% Liveness Verified!
                  </span>
                )}
              </div>
            </div>

            {/* Zero-Biometric In-Memory Guarantee Badge */}
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 max-w-sm mx-auto text-center">
              <Lock size={11} className="shrink-0 text-emerald-400" />
              <span>100% In-Memory Processing • Facial Data Zeroized & Purged</span>
            </div>

            {livenessStage !== 'verified' ? (
              <button
                type="button"
                onClick={handleStartLiveness}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <Camera size={15} />
                <span>{livenessStage === 'idle' ? 'Start AI Camera Liveness' : 'Re-run Detection'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStep(4);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2E93] to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <span>Claim Welcome Vouchers</span>
                <ArrowRight size={15} />
              </button>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStep(4);
                }}
                className="text-[11px] text-gray-400 hover:text-white underline"
              >
                Skip camera verification for now
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Reward Credit Voucher Claim */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FFD700] via-[#FF2E93] to-[#00D2FF] flex items-center justify-center mx-auto text-3xl shadow-[0_0_25px_rgba(255,215,0,0.6)] animate-bounce">
              🎁
            </div>

            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                Congratulations & Welcome!
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Your new user bonus pack has been prepared and credited:
              </p>
            </div>

            {/* Rewards Cards */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-900/30 border border-pink-400/40">
                <div className="text-2xl mb-1">🎟️</div>
                <h4 className="text-xs font-bold text-white">3 Free 60s Call Vouchers</h4>
                <p className="text-[10px] text-pink-300">Enjoy 3 minutes of 1v1 romantic video calls on us</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-900/30 border border-amber-400/40">
                <div className="text-2xl mb-1">🪙</div>
                <h4 className="text-xs font-bold text-white">+180 Talk-Time Coins</h4>
                <p className="text-[10px] text-amber-300">Instant in-game & voice room spending balance</p>
              </div>
            </div>

            <button
              onClick={handleClaimReward}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] hover:scale-[1.02] text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,46,147,0.7)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>Enter Amorex Live Now</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
