import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Trash2, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Cpu, 
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSupportChat: (context?: { source: string; query: string }) => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSupportChat,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('all');

  if (!isOpen) return null;

  const handleSupportClick = () => {
    sound.playClick();
    onClose();
    // Seamless routing to existing in-app Super Admin / 24/7 Support Bot
    onNavigateToSupportChat({
      source: 'privacy_policy_section_6',
      query: 'Privacy Policy & Data Security Inquiry',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0F1123] border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-gray-200">
        
        {/* Header with Glassmorphism */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[#14162B]/95 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Back to Account Settings"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Privacy Policy & Data Rights
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck size={12} /> GDPR & CCPA Compliant
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Amorex Social Universe • Last Updated: September 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              v3.2.0-SEC
            </span>
          </div>
        </div>

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-pink-500/30">
          
          {/* Executive Summary Trust Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-cyan-950/40 border border-pink-500/30 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-pink-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles size={15} className="animate-pulse text-amber-300" />
              <span>Strict Zero-Biometric Retention Guarantee</span>
            </div>
            <p className="text-xs text-gray-300 leading-normal">
              At Amorex, we consider your privacy sacrosanct. We <strong className="text-white">never store facial biometric templates</strong> or permanent vector representations. All liveness verification occurs strictly in volatile memory and is instantly zeroized upon completion.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 size={13} className="shrink-0" />
                <span>AES-256 PII Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold bg-cyan-950/40 p-1.5 rounded-lg border border-cyan-500/20">
                <Lock size={13} className="shrink-0" />
                <span>E2EE WebRTC Media</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/20 col-span-2 sm:col-span-1">
                <Trash2 size={13} className="shrink-0" />
                <span>Immediate Purge Protocol</span>
              </div>
            </div>
          </div>

          {/* Section 1: Data Collection */}
          <section className="p-4 rounded-2xl bg-[#14162B] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm border-b border-white/5 pb-2">
              <span className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-black">
                1
              </span>
              <h3>Data Collection & Information We Gather</h3>
            </div>
            <p className="text-gray-300 text-xs">
              We collect information necessary to deliver high-quality social, audio party, and video experiences:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-300 text-xs pl-1">
              <li>
                <strong className="text-white">Account Information:</strong> Screen name, avatar image, phone number/email, age self-declaration, and account binding credentials.
              </li>
              <li>
                <strong className="text-white">Wallet & Virtual Transactions:</strong> Virtual coin balances, daily task claims, gifting transactions, and diamond exchange logs.
              </li>
              <li>
                <strong className="text-white">Device & Telemetry:</strong> WebRTC connection metrics (bitrate, jitter, round-trip latency) used purely for adaptive stream quality optimization.
              </li>
              <li>
                <strong className="text-white">Communications:</strong> Public party room chats and direct messages exchanged between users on the platform.
              </li>
            </ul>
          </section>

          {/* Section 2: Data Usage */}
          <section className="p-4 rounded-2xl bg-[#14162B] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm border-b border-white/5 pb-2">
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-black">
                2
              </span>
              <h3>How We Use Your Data</h3>
            </div>
            <p className="text-gray-300 text-xs">
              Your collected information is processed solely for lawful operational objectives:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-300 text-xs pl-1">
              <li>Facilitating seamless peer-to-peer 1v1 video connections and 8-seat audio party mesh routing.</li>
              <li>Processing virtual item transactions, coin deductions, and backpack reward allocations.</li>
              <li>Enforcing safety guidelines, anti-fraud algorithms, and community moderation rules.</li>
              <li>Providing 24/7 customer service, dispute resolution, and technical problem remediation.</li>
            </ul>
          </section>

          {/* Section 3: Face Verification & Liveness Data (Critical Policy Requirement) */}
          <section className="p-4 rounded-2xl bg-[#14162B] border border-pink-500/30 space-y-3 bg-gradient-to-b from-pink-950/20 to-transparent">
            <div className="flex items-center gap-2 text-pink-300 font-extrabold text-sm border-b border-pink-500/20 pb-2">
              <span className="w-6 h-6 rounded-lg bg-pink-500/30 text-pink-300 flex items-center justify-center text-xs font-black">
                3
              </span>
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-pink-400" />
                <h3>Face Verification & Liveness Detection (Zero Biometric Retention)</h3>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
                <EyeOff size={14} />
                <span>Strict In-Memory Processing Protocol:</span>
              </div>
              <p className="text-xs text-gray-300">
                During host onboarding or identity verification, the application conducts temporary camera-based 3D liveness detection (blink detection, head tilt, smile detection) to deter automated bots and catfishing.
              </p>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white">Temporary Volatile Processing:</strong> All facial frames are held temporarily in volatile execution memory (RAM) solely for the mathematical calculation of the liveness confidence score.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Trash2 size={15} className="text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white">Absolute Immediate Deletion (Auto-Purge Protocol):</strong> Instantly upon computing the verification decision (pass/fail), the underlying image byte buffers are cryptographically zeroized (<code className="text-pink-300 font-mono text-[11px]">buffer.fill(0)</code>) and purged.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Lock size={15} className="text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white">Zero Biometric Storage:</strong> Amorex <strong className="text-pink-300 underline underline-offset-2">NEVER</strong> stores, persists, sells, or creates permanent biometric templates, facial landmark meshes, or facial embeddings in our databases or external disk stores.
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Data Security & PII Encryption */}
          <section className="p-4 rounded-2xl bg-[#14162B] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm border-b border-white/5 pb-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black">
                4
              </span>
              <div className="flex items-center gap-2">
                <Database size={16} className="text-cyan-400" />
                <h3>Data Security & Strict PII Encryption</h3>
              </div>
            </div>
            <p className="text-gray-300 text-xs">
              We employ military-grade security controls to safeguard your data at rest and in transit:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-300 text-xs pl-1">
              <li>
                <strong className="text-white">AES-256-GCM Storage Encryption:</strong> Sensitive Personally Identifiable Information (PII), such as phone numbers, emails, and device IDs, is encrypted with AES-256-GCM before write operations.
              </li>
              <li>
                <strong className="text-white">DTLS / SRTP for Live Media:</strong> Audio and video data streams during private 1v1 calls and party lounges are negotiated with end-to-end WebRTC cryptographic keys.
              </li>
              <li>
                <strong className="text-white">Zero Plaintext Credentials:</strong> Administrative passwords and access tokens are hashed using salted cryptographic key derivation.
              </li>
            </ul>
          </section>

          {/* Section 5: Information Disclosure & Third Parties */}
          <section className="p-4 rounded-2xl bg-[#14162B] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm border-b border-white/5 pb-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">
                5
              </span>
              <h3>Information Disclosure & Third Parties</h3>
            </div>
            <p className="text-gray-300 text-xs">
              We maintain a strict anti-brokerage policy:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-300 text-xs pl-1">
              <li>We <strong className="text-white">do not sell or rent</strong> personal information or communication logs to third-party data brokers or advertisers.</li>
              <li>Data is disclosed exclusively when compelled by valid legal court orders or to prevent severe imminent harm/fraud.</li>
            </ul>
          </section>

          {/* Section 6: Contact Us & Grievance - DIRECT IN-APP ROUTING (Mandatory Action Button) */}
          <section className="p-5 rounded-3xl bg-gradient-to-br from-[#1C1E3A] via-[#161830] to-[#14162B] border-2 border-pink-500/40 shadow-2xl space-y-3.5">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm border-b border-white/10 pb-2.5">
              <span className="w-7 h-7 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xs font-black shadow-md">
                6
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Contact Us & Direct Grievance Redressal
                </h3>
                <span className="text-[10px] text-pink-300 font-medium">
                  Instant response from our verified Super-Admin team
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              If you have any questions regarding your data privacy rights, want to request an export of your account metadata, or require immediate assistance from our trust & safety department, please connect with us directly:
            </p>

            {/* MANDATORY PROMINENT UI ACTION BUTTON (NO STATIC EMAIL TEXT) */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-privacy-chat-super-admin"
                onClick={handleSupportClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF2E93] via-purple-600 to-[#FF2E93] hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(255,46,147,0.5)] border border-pink-400/50 cursor-pointer transition-all transform active:scale-98 hover:brightness-110 group"
              >
                <MessageSquare size={18} className="animate-bounce text-yellow-300" />
                <span className="tracking-wide">Chat with Super Admin / 24/7 Support</span>
                <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full ml-1">
                  Online
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-2">
                <Info size={12} className="text-cyan-400" />
                <span>Opens direct encrypted In-App AI Support & Super Admin Help Desk</span>
              </div>
            </div>
          </section>

          {/* User Rights Check List */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Exercising Right to Erasure or Data Portability?</span>
            <button
              onClick={handleSupportClick}
              className="text-pink-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Request via Super Admin <ExternalLink size={11} />
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#14162B] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 text-[11px]">
            Amorex Interactive Entertainment Inc.
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
