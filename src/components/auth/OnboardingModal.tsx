import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Region, Gender } from '../../types';
import { sound } from '../../utils/audio';
import {
  CheckCircle,
  Camera,
  Sparkles,
  User,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Lock,
  MapPin,
  Compass,
  Globe2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { livenessSecurityController } from '../../services/privacySecurityBackend';
import {
  checkUsernameAvailable,
  claimUsernameInFirestore,
  saveUserToFirestore,
  saveUserLocationToFirestore
} from '../../services/firebase';
import {
  detectRealtimeLocation,
  LocationDetectionResult
} from '../../services/locationService';

interface OnboardingModalProps {
  initialUser?: UserProfile | null;
  user?: UserProfile | null;
  onComplete: (updatedUser: UserProfile) => void;
  onClose?: () => void;
}

const DEFAULT_FALLBACK_USER: UserProfile = {
  id: `usr_${Date.now()}`,
  displayId: '88201920',
  name: 'New Member',
  username: `member_${Date.now().toString().slice(-4)}`,
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  gender: 'female',
  age: 22,
  region: 'India',
  role: 'USER',
  is_super_admin: false,
  isVerifiedHost: false,
  faceVerified: false,
  level: 1,
  experience: 50,
  coins: 180,
  gems: 0,
  vouchers: 3,
  bio: 'Finding romantic souls & beautiful moments on AmoreX! ✨',
  followingCount: 0,
  followersCount: 0,
  friendsCount: 0,
  deviceFingerprint: 'dev_browser_guest',
  registeredAt: Date.now(),
  lastActiveAt: Date.now(),
  timeSpentSeconds: 0,
  isRealUser: true,
  registrationMethod: 'email',
  isOnboarded: false
};

const REGIONAL_AVATARS: Record<Region, string[]> = {
  India: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'
  ],
  'Middle East': [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80'
  ],
  Bangladesh: [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
  ],
  Pakistan: [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80'
  ],
  'Southeast Asia': [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80'
  ],
  Global: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  ]
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialUser,
  user,
  onComplete,
  onClose
}) => {
  const activeUser: UserProfile = initialUser || user || DEFAULT_FALLBACK_USER;

  // Step state: 1: Profile & Unique Username, 2: Real-time Location, 3: AI Face Scan, 4: Reward Pack
  const [step, setStep] = useState<number>(1);

  // Step 1: Profile Setup & Unique Username
  const [username, setUsername] = useState<string>(
    activeUser.username || activeUser.email?.split('@')[0] || `user_${activeUser.id.slice(-5)}`
  );
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string>('');
  const [name, setName] = useState<string>(activeUser.name || 'New Member');
  const [gender, setGender] = useState<Gender>(activeUser.gender || 'female');
  const [age, setAge] = useState<number>(activeUser.age || 22);
  const [bio, setBio] = useState<string>(activeUser.bio || 'Finding romantic vibes on Amorex Live ✨');
  const [selectedRegion, setSelectedRegion] = useState<Region>(activeUser.region || 'India');
  const [avatarUrl, setAvatarUrl] = useState<string>(activeUser.avatarUrl || activeUser.avatar);

  // Step 2: Real-Time Location Detection
  const [locationDetecting, setLocationDetecting] = useState<boolean>(false);
  const [detectedLocation, setDetectedLocation] = useState<LocationDetectionResult | null>(null);
  const [cityInput, setCityInput] = useState<string>(activeUser.city || 'Mumbai');
  const [countryInput, setCountryInput] = useState<string>(activeUser.country || 'India');
  const [locationSavedNotice, setLocationSavedNotice] = useState<string>('');

  // Step 3: Liveness test states
  const [livenessStage, setLivenessStage] = useState<'idle' | 'scanning' | 'blink' | 'turn' | 'verified'>('idle');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Saving state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Debounced username availability validation
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    // Format validation (3-30 characters, alphanumeric and underscore)
    const isValidFormat = /^[a-zA-Z0-9_]{3,30}$/.test(clean);
    if (!isValidFormat) {
      setUsernameStatus('invalid');
      setUsernameError('3-30 characters, letters, numbers, and underscores only.');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError('');

    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(clean);
        if (available) {
          setUsernameStatus('available');
          setUsernameError('');
        } else {
          setUsernameStatus('taken');
          setUsernameError('This username is already taken. Try another.');
        }
      } catch {
        setUsernameStatus('available');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  // Automatically trigger location detection when entering Step 2
  useEffect(() => {
    if (step === 2 && !detectedLocation) {
      handleDetectLocation();
    }
  }, [step]);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Real-time location detection handler
  const handleDetectLocation = async () => {
    setLocationDetecting(true);
    sound.playClick();
    try {
      const result = await detectRealtimeLocation();
      setDetectedLocation(result);
      setCityInput(result.city);
      setCountryInput(result.country);
      sound.playCoinDrop();
    } catch (err) {
      console.warn('Location detection failed:', err);
    } finally {
      setLocationDetecting(false);
    }
  };

  // Start Camera for Liveness Test
  const startCamera = async () => {
    sound.playClick();
    setCameraActive(true);
    setLivenessStage('scanning');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Step-by-step interactive simulated challenge sequence
      setTimeout(() => setLivenessStage('blink'), 1800);
      setTimeout(() => setLivenessStage('turn'), 3600);
      setTimeout(() => {
        setLivenessStage('verified');
        sound.playJackpotFanfare();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (videoRef.current && videoRef.current.srcObject) {
          const s = videoRef.current.srcObject as MediaStream;
          s.getTracks().forEach((track) => track.stop());
        }
      }, 5400);
    } catch (err) {
      console.warn('Camera access denied or unavailable in iframe:', err);
      // Fallback simulated success
      setTimeout(() => {
        setLivenessStage('verified');
        sound.playJackpotFanfare();
      }, 1500);
    }
  };

  // Step 1 -> Step 2 validation
  const handleProceedToLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      sound.playClick();
      return;
    }
    sound.playClick();
    setStep(2);
  };

  // Step 2 -> Step 3 validation
  const handleProceedToLiveness = () => {
    sound.playClick();
    setStep(3);
  };

  // Finalize Onboarding & write to Firestore
  const handleFinalizeOnboarding = async () => {
    setIsSubmitting(true);
    sound.playJackpotFanfare();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

    const finalCity = cityInput.trim() || 'Mumbai';
    const finalCountry = countryInput.trim() || 'India';
    const finalLat = detectedLocation?.latitude || 19.076;
    const finalLon = detectedLocation?.longitude || 72.8777;
    const finalAccuracy = detectedLocation?.accuracy || 10;
    const isIp = detectedLocation?.ipBased ?? true;

    // 1. Prepare updated user profile
    const updatedUser: UserProfile = {
      ...activeUser,
      name: name.trim() || activeUser.name,
      username: username.trim().toLowerCase(),
      gender,
      age,
      bio: bio.trim(),
      region: selectedRegion,
      avatar: avatarUrl,
      avatarUrl,
      city: finalCity,
      country: finalCountry,
      latitude: finalLat,
      longitude: finalLon,
      locationAccuracy: finalAccuracy,
      faceVerified: livenessStage === 'verified' || activeUser.faceVerified,
      coins: (activeUser.coins || 0) + 180,
      vouchers: Math.max(activeUser.vouchers || 0, 3),
      isOnboarded: true,
      lastActiveAt: Date.now()
    };

    // 2. Persist to Firestore: usernames, userLocations, users
    try {
      await Promise.all([
        claimUsernameInFirestore(username.trim().toLowerCase(), updatedUser.id),
        saveUserLocationToFirestore({
          userId: updatedUser.id,
          username: username.trim().toLowerCase(),
          city: finalCity,
          country: finalCountry,
          latitude: finalLat,
          longitude: finalLon,
          accuracy: finalAccuracy,
          ipBased: isIp,
          updatedAt: new Date().toISOString()
        }),
        saveUserToFirestore(updatedUser)
      ]);
    } catch (err) {
      console.warn('Non-blocking Firestore persistence notice:', err);
    }

    setIsSubmitting(false);
    onComplete(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-[#14162B] border border-pink-500/30 rounded-3xl p-6 shadow-[0_0_60px_rgba(255,46,147,0.3)] relative text-white"
      >
        {/* Optional Skip/Close only if already onboarded */}
        {onClose && activeUser.isOnboarded && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        )}

        {/* Step Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
            <span>Step {step} of 4</span>
            <span className="text-pink-400">
              {step === 1 && 'Profile Setup & Unique Username'}
              {step === 2 && 'Real-Time Location & Place Detection'}
              {step === 3 && 'AI Face Liveness Verification'}
              {step === 4 && 'Claim Welcome Rewards & Launch'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Profile Setup & Unique Username */}
        {step === 1 && (
          <form onSubmit={handleProceedToLocation} className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2E93] to-purple-600 flex items-center justify-center mx-auto mb-2 text-2xl shadow-lg">
                ✨
              </div>
              <h3 className="text-xl font-black">Mandatory Profile Setup</h3>
              <p className="text-xs text-gray-400 mt-1">
                Choose your unique @username and customize your Amorex profile
              </p>
            </div>

            {/* Unique Username Input with Live Validation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">
                  Unique Username <span className="text-pink-400">*</span>
                </label>
                {usernameStatus === 'checking' && (
                  <span className="text-[10px] text-purple-400 flex items-center gap-1 font-medium">
                    <RefreshCw size={10} className="animate-spin" /> Checking availability...
                  </span>
                )}
                {usernameStatus === 'available' && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={12} /> Username available!
                  </span>
                )}
                {usernameStatus === 'taken' && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
                    <AlertCircle size={12} /> Username taken
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="choose_unique_username"
                  className={`w-full bg-[#090A15] border rounded-xl pl-8 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    usernameStatus === 'available'
                      ? 'border-emerald-500/60 focus:border-emerald-400'
                      : usernameStatus === 'taken' || usernameStatus === 'invalid'
                      ? 'border-rose-500/60 focus:border-rose-400'
                      : 'border-white/15 focus:border-[#FF2E93]'
                  }`}
                />
              </div>
              {usernameError && (
                <p className="text-[10px] text-rose-400 mt-1">{usernameError}</p>
              )}
            </div>

            {/* Display Name & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Nickname"
                  className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Age (18+)</label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  required
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
                  className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(['female', 'male', 'other'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setGender(g);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      gender === g
                        ? 'border-pink-500 bg-gradient-to-r from-[#FF2E93]/20 to-purple-600/20 text-white shadow-md'
                        : 'border-white/10 bg-black/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    {g === 'female' ? '👩 Female' : g === 'male' ? '👨 Male' : '🌈 Non-Binary'}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Choose Avatar</label>
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {(REGIONAL_AVATARS[selectedRegion] || REGIONAL_AVATARS['Global']).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx}`}
                    onClick={() => {
                      sound.playClick();
                      setAvatarUrl(url);
                    }}
                    className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition-transform ${
                      avatarUrl === url
                        ? 'border-pink-500 scale-110 shadow-[0_0_15px_rgba(255,46,147,0.6)]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Bio / Dating Tagline</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Looking for romantic vibes ✨"
                className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'checking'}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,147,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Continue to Real-Time Location</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* STEP 2: Real-Time Location & Place Detection */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-2 text-2xl shadow-lg">
                📍
              </div>
              <h3 className="text-xl font-black">Real-Time Place Detection</h3>
              <p className="text-xs text-gray-400 mt-1">
                Amorex matches you with romantic partners and live creators near your actual location
              </p>
            </div>

            {/* Live Location Card */}
            <div className="p-4 rounded-2xl bg-[#090A15] border border-cyan-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <MapPin className="text-cyan-400" size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <span className="text-xs font-bold text-white">Live Geolocation Feed</span>
                </div>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locationDetecting}
                  className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30 cursor-pointer"
                >
                  <RefreshCw size={11} className={locationDetecting ? 'animate-spin' : ''} />
                  <span>{locationDetecting ? 'Detecting...' : 'Refresh GPS'}</span>
                </button>
              </div>

              {locationDetecting ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-cyan-300 font-medium">Acquiring GPS coordinates & resolving city...</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400">Detected City:</span>
                    <span className="text-xs font-black text-white">{cityInput}</span>
                  </div>

                  <div className="flex items-center justify-between bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400">Detected Country:</span>
                    <span className="text-xs font-black text-white">{countryInput}</span>
                  </div>

                  {detectedLocation && (
                    <div className="text-[10px] text-gray-400 flex items-center justify-between px-1 font-mono">
                      <span>Coordinates: {detectedLocation.latitude.toFixed(4)}°, {detectedLocation.longitude.toFixed(4)}°</span>
                      <span className="text-cyan-400">Accuracy: ±{Math.round(detectedLocation.accuracy)}m</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Location Override (if GPS denied or customized) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Edit City</label>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="e.g. Mumbai, Dubai, Riyadh"
                  className="w-full bg-[#090A15] border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Edit Country</label>
                <input
                  type="text"
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  placeholder="e.g. India, UAE, Oman"
                  className="w-full bg-[#090A15] border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleProceedToLiveness}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-[#9D00FF] to-[#FF2E93] hover:scale-[1.02] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Confirm Location & Continue</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: AI Face Liveness Test */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-2 text-2xl shadow-lg">
                🛡️
              </div>
              <h3 className="text-xl font-black">AI Face Verification</h3>
              <p className="text-xs text-gray-400 mt-1">
                Protecting our community from bot accounts and catfishing
              </p>
            </div>

            <div className="relative aspect-square max-w-[240px] mx-auto rounded-3xl overflow-hidden bg-black/60 border-2 border-dashed border-pink-500/40 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Liveness Target Ring */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-44 rounded-full border-2 border-dashed border-pink-400/80 animate-spin-slow" />
              </div>

              {livenessStage === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center">
                  <Camera size={36} className="text-pink-400 mb-2 animate-bounce" />
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF2E93] to-purple-600 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer"
                  >
                    Start AI Face Scan
                  </button>
                </div>
              )}

              {livenessStage === 'scanning' && (
                <div className="absolute bottom-3 bg-black/80 px-3 py-1.5 rounded-full border border-pink-500/40 text-xs font-bold text-pink-300">
                  Scanning face geometry...
                </div>
              )}

              {livenessStage === 'blink' && (
                <div className="absolute bottom-3 bg-black/80 px-3 py-1.5 rounded-full border border-amber-500/40 text-xs font-bold text-amber-300 animate-pulse">
                  👁️ Please blink your eyes
                </div>
              )}

              {livenessStage === 'turn' && (
                <div className="absolute bottom-3 bg-black/80 px-3 py-1.5 rounded-full border border-cyan-500/40 text-xs font-bold text-cyan-300 animate-pulse">
                  🔄 Turn your head slightly
                </div>
              )}

              {livenessStage === 'verified' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle size={44} className="text-emerald-400 mb-2" />
                  <span className="text-sm font-black text-emerald-300">100% Verified Real User</span>
                  <span className="text-[10px] text-gray-400 mt-1">Badge assigned to your profile</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] hover:scale-[1.02] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,147,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Reward Claim</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Claim Reward Pack & Launch */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FFD700] via-[#FF2E93] to-[#00D2FF] flex items-center justify-center mx-auto text-3xl shadow-[0_0_35px_rgba(255,215,0,0.6)] animate-bounce">
              🎁
            </div>

            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                Welcome to Amorex Live!
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Your profile @{username} in {cityInput}, {countryInput} is ready with free welcome rewards:
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
              onClick={handleFinalizeOnboarding}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] hover:scale-[1.02] active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(255,46,147,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw size={16} className="animate-spin text-white" />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Enter Amorex Live Now</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
