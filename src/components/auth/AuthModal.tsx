import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  SUPER_ADMIN_EMAIL,
  USER_SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  isSuperAdminEmail,
  createSuperAdminProfile,
  getDeviceFingerprint,
  generateDisplayId,
  saveRegisteredUser
} from '../../utils/storage';
import { sound } from '../../utils/audio';
import { AmorexLogo } from '../common/AmorexLogo';
import { X, Mail, Phone, Lock, Sparkles, ShieldCheck, CheckCircle2, Crown, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  onSuccess: (user: UserProfile, isNewUser: boolean) => void;
  onClose: () => void;
}

type AuthTab = 'email' | 'phone' | 'google';

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [authTab, setAuthTab] = useState<AuthTab>('email');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  // Email & password state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [name, setName] = useState<string>('');

  // Phone & OTP state
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [generatedTestOtp, setGeneratedTestOtp] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fingerprint = getDeviceFingerprint();

  const handleSendOtp = () => {
    if (!phone || phone.length < 8) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    sound.playClick();

    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedTestOtp(code);
      setOtpSent(true);
      setLoading(false);
      sound.playCoinDrop();
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    sound.playClick();

    setTimeout(() => {
      setLoading(false);

      // Check Super-Admin Elevation Rule
      const cleanEmail = email.trim().toLowerCase();
      const isSuperAdminMatch =
        isSuperAdminEmail(cleanEmail) ||
        cleanEmail === 'adnexadmin@gmail.com' ||
        cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

      if (isSuperAdminMatch) {
        sound.playJackpotFanfare();
        const superAdminUser = createSuperAdminProfile(cleanEmail);
        onSuccess(superAdminUser, false);
        return;
      }

      // Standard user flow
      if (authTab === 'email') {
        if (!email || !password) {
          setErrorMsg('Please provide both email and password');
          return;
        }

        const now = Date.now();
        const newUser: UserProfile = {
          id: `usr-${now}`,
          displayId: generateDisplayId(),
          name: name.trim() || email.split('@')[0] || 'Amorex Member',
          email: email.trim(),
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
          gender: 'female',
          age: 22,
          region: 'India',
          role: 'USER',
          is_super_admin: false,
          isVerifiedHost: false,
          faceVerified: false,
          level: 1,
          experience: 50,
          coins: 180, // Credited free call talk-time coins
          gems: 0,
          vouchers: 3, // 3 Free 60-Sec Call Vouchers
          bio: 'Looking for romantic vibes & friendly chats ✨',
          followingCount: 0,
          followersCount: 0,
          friendsCount: 0,
          deviceFingerprint: fingerprint,
          registeredAt: now,
          lastActiveAt: now,
          timeSpentSeconds: 0,
          isRealUser: true,
          registrationMethod: 'email'
        };

        saveRegisteredUser(newUser, true);
        onSuccess(newUser, isSignUp);
      } else if (authTab === 'phone') {
        if (!otp) {
          setErrorMsg('Please enter the 4-digit SMS OTP code');
          return;
        }
        const now = Date.now();
        const newUser: UserProfile = {
          id: `usr-${now}`,
          displayId: generateDisplayId(),
          name: `User_${phone.slice(-4)}`,
          phone: phone.trim(),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
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
          bio: 'Romantic soul connected via Amorex Live ✨',
          followingCount: 0,
          followersCount: 0,
          friendsCount: 0,
          deviceFingerprint: fingerprint,
          registeredAt: now,
          lastActiveAt: now,
          timeSpentSeconds: 0,
          isRealUser: true,
          registrationMethod: 'phone'
        };
        saveRegisteredUser(newUser, true);
        onSuccess(newUser, true);
      }
    }, 700);
  };

  const handleGoogleOneTap = () => {
    sound.playClick();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const now = Date.now();
      const googleUser: UserProfile = {
        id: `google-${now}`,
        displayId: generateDisplayId(),
        name: 'Google User',
        email: 'user@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        gender: 'female',
        age: 23,
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
        bio: 'Joined with Google OAuth ✨',
        followingCount: 0,
        followersCount: 0,
        friendsCount: 0,
        deviceFingerprint: fingerprint,
        registeredAt: now,
        lastActiveAt: now,
        timeSpentSeconds: 0,
        isRealUser: true,
        registrationMethod: 'google'
      };
      saveRegisteredUser(googleUser, true);
      onSuccess(googleUser, true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-[#14162B] border border-pink-500/30 rounded-3xl p-6 shadow-2xl relative text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div className="text-center pb-3 flex flex-col items-center">
          <AmorexLogo size="lg" showText={false} className="mb-2" />
          <h2 className="text-xl font-black tracking-tight">
            {isSignUp ? 'Create Amorex Account' : 'Welcome Back to Amorex'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Romantic Dating, 1v1 Video & 12-Seat Party Lounges
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex rounded-xl bg-black/40 p-1 mb-4 border border-white/5">
          <button
            onClick={() => {
              sound.playClick();
              setAuthTab('email');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              authTab === 'email'
                ? 'bg-gradient-to-r from-[#FF2E93] to-[#9D00FF] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Email / Admin
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setAuthTab('phone');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              authTab === 'phone'
                ? 'bg-gradient-to-r from-[#FF2E93] to-[#9D00FF] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Phone SMS OTP
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {authTab === 'email' && (
            <>
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your nickname"
                    className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={15} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com or Admin@amorex.com"
                    className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={15} />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                  />
                  <button
                    id="auth-password-toggle-btn"
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowPassword(!showPassword);
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {authTab === 'phone' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={15} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="px-3 py-2.5 bg-gradient-to-r from-[#FF2E93] to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-300">4-Digit SMS Code</label>
                    {generatedTestOtp && (
                      <span className="text-[10px] text-pink-400 font-mono">
                        Demo OTP: <strong className="underline">{generatedTestOtp}</strong>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4 digits"
                    className="w-full text-center tracking-widest text-lg font-bold bg-[#090A15] border border-pink-500/50 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] hover:scale-[1.02] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,147,0.5)] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : isSignUp ? (
              <>
                <Sparkles size={14} />
                <span>Sign Up & Claim 3 Free Vouchers</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Enter Amorex Live</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-[#14162B] px-3 text-[11px] text-gray-400 uppercase">
            Or quick connect
          </span>
        </div>

        {/* Google OAuth One-Tap */}
        <button
          onClick={handleGoogleOneTap}
          type="button"
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-gray-200 flex items-center justify-center gap-2 hover:border-pink-500/40 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>One-Tap Google OAuth</span>
        </button>

        {/* Toggle Sign-In / Sign-Up */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsSignUp(!isSignUp);
            }}
            className="text-xs text-pink-400 hover:text-pink-300 font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Anti-Fraud Engine device fingerprint note */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Anti-Fraud Hardware ID:</span>
          </div>
          <span className="font-mono text-gray-400">{fingerprint}</span>
        </div>
      </motion.div>
    </div>
  );
};
