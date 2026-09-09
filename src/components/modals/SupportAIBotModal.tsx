import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import {
  Bot,
  Send,
  X,
  Sparkles,
  ShieldCheck,
  Headphones,
  CreditCard,
  UserCheck,
  Flame,
  AlertTriangle,
  FileQuestion,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupportAIBotModalProps {
  user: UserProfile;
  onClose: () => void;
  onOpenRecharge: () => void;
  initialContext?: { source: string; query: string };
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
}

export const SupportAIBotModal: React.FC<SupportAIBotModalProps> = ({
  user,
  onClose,
  onOpenRecharge,
  initialContext
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialContext?.source?.includes('privacy_policy')) {
      return [
        {
          id: 'welcome-privacy',
          sender: 'ai',
          text: `🛡️ Welcome to the Super Admin Privacy & Data Protection Desk, ${user.name}! We received your request from Section 6 of the Privacy Policy regarding "${initialContext.query}". How can our Super Admin team assist with your data rights today?`,
          timestamp: 'Just now',
          options: [
            '🔒 Explain Zero Biometric Retention',
            '🗑️ Request Complete Data Purge',
            '🛡️ Review PII AES-256 Encryption',
            '👑 Chat Directly with Super Admin'
          ]
        }
      ];
    }
    return [
      {
        id: 'welcome-1',
        sender: 'ai',
        text: `Hello ${user.name}! 💖 Welcome to Amorex 24/7 Official Support & AI Assistance Desk. How can we help you today?`,
        timestamp: 'Just now',
        options: [
          '🪙 Coin Recharge & UTR Help',
          '💎 Host Face Verification & Agency',
          '📹 1v1 Video & Audio Call Quality',
          '🛡️ Report User / Anti-Fraud Safety',
          '🎁 Free Coins & Daily Quests'
        ]
      }
    ];
  });
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialContext && initialContext.source?.includes('privacy_policy')) {
      // If refreshed or updated with privacy context, ensure user sees privacy greeting
      setMessages([
        {
          id: `welcome-privacy-${Date.now()}`,
          sender: 'ai',
          text: `🛡️ Welcome to the Super Admin Privacy & Data Protection Desk, ${user.name}! We received your request from Section 6 of the Privacy Policy regarding "${initialContext.query}". How can our Super Admin team assist with your data rights today?`,
          timestamp: 'Just now',
          options: [
            '🔒 Explain Zero Biometric Retention',
            '🗑️ Request Complete Data Purge',
            '🛡️ Review PII AES-256 Encryption',
            '👑 Chat Directly with Super Admin'
          ]
        }
      ]);
    }
  }, [initialContext]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendOption = (option: string) => {
    handleSendMessage(option);
  };

  const handleSendMessage = (userText: string) => {
    if (!userText.trim()) return;
    sound.playClick();

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      sound.playCoinDrop();
      setIsTyping(false);

      let reply = '';
      let nextOptions: string[] | undefined = undefined;

      const lower = userText.toLowerCase();

      if (lower.includes('biometric') || lower.includes('liveness') || lower.includes('retention') || lower.includes('face')) {
        reply = `🔒 Zero-Biometric Policy Guarantee: In Amorex, all camera frames during face verification are analyzed strictly in volatile execution RAM to check eye-blink and head-yaw. Immediately after computing verification, the memory buffer is cryptographically zeroized (buffer.fill(0)) and purged. Zero facial images or biometric templates are stored in our database.`;
        nextOptions = ['Review PII AES-256 Encryption', 'Request Complete Data Purge', 'Chat Directly with Super Admin'];
      } else if (lower.includes('purge') || lower.includes('delete') || lower.includes('erasure')) {
        reply = `🗑️ Right to Erasure / Data Purge: Under GDPR & Amorex Security Policy, your account data can be wiped upon request. We do not store biometric data. Your ephemeral session tokens and encrypted logs will be purged within 24 hours. Ticket #${Math.floor(100000 + Math.random() * 900000)} created.`;
        nextOptions = ['Confirm Purge Request', 'Download Account Metadata'];
      } else if (lower.includes('encrypt') || lower.includes('pii') || lower.includes('aes') || lower.includes('privacy')) {
        reply = `🛡️ PII Security Standards: All sensitive user data (phone, email, authentication tokens) is protected with AES-256-GCM encryption at rest and DTLS-SRTP for live WebRTC audio/video streams. Our servers maintain zero plaintext visibility over private keys.`;
        nextOptions = ['🔒 Explain Zero Biometric Retention', 'Chat Directly with Super Admin'];
      } else if (lower.includes('super admin') || lower.includes('live agent') || lower.includes('human')) {
        reply = `👑 Super Admin Direct Routing: Connecting you directly to the Duty Super Admin desk. Your session context [Privacy Inquiry #${user.displayId}] has been transferred to our priority queue. A verified Super Admin is actively monitoring this room.`;
        nextOptions = ['Ask a specific privacy question', 'Report critical concern'];
      } else if (lower.includes('recharge') || lower.includes('coin') || lower.includes('utr')) {
        reply = `🪙 Coin Recharges are processed instantly via UPI and Official Agency Desk. If you made a bank transfer, enter the 12-digit UTR in the Top-Up modal for automated verification within 60 seconds! Your current balance is ${user.coins.toLocaleString()} Coins.`;
        nextOptions = ['Open Top-Up Store', 'Speak to Official WhatsApp Agent'];
      } else if (lower.includes('host') || lower.includes('verification') || lower.includes('agency')) {
        reply = `💎 Host Verification is completely free! Go to Profile → Face Verification to perform real-time 3D liveness detection. Verified hosts earn 70% commission on gifts received during 1v1 calls and party stages.`;
        nextOptions = ['How to cash out gems?', 'Agency onboarding rules'];
      } else if (lower.includes('video') || lower.includes('audio') || lower.includes('call') || lower.includes('quality')) {
        reply = `📹 All Amorex 1v1 video calls are secured with ultra-low-latency WebRTC and hardware-accelerated beauty filters. If you experience mic or camera permission blocks, allow permissions in your browser URL bar.`;
        nextOptions = ['Test Microphone', 'AI Live Translation Languages'];
      } else if (lower.includes('report') || lower.includes('safety') || lower.includes('fraud')) {
        reply = `🛡️ Amorex maintains zero tolerance for harassment, recording, or fraud. You can block and report any user directly inside calls or chat. Our AI safety moderation automatically flags suspicious behavior 24/7.`;
        nextOptions = ['Submit a detailed report', 'Community Guidelines'];
      } else if (lower.includes('top-up store')) {
        onOpenRecharge();
        reply = 'Opening the Coin Store for you now...';
      } else {
        reply = `Thank you for contacting us regarding "${userText}". Our automated AI assistant has logged ticket #${Math.floor(100000 + Math.random() * 900000)} under your ID ${user.displayId}. An official desk supervisor is reviewing this in real-time.`;
        nextOptions = ['Check Ticket Status', 'Need More Help'];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          timestamp: 'Just now',
          options: nextOptions
        }
      ]);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-[#14162B] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col h-[85vh] text-white relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D2FF] via-[#FF2E93] to-[#FFD700] flex items-center justify-center text-white shadow-[0_0_12px_#00D2FF]">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Amorex AI Support Bot</h3>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 Live
                </span>
              </div>
              <p className="text-xs text-gray-400">Instant answers • Dispute resolution • User guidance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conversation Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-start gap-2 max-w-[85%]">
                  {isAI && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00D2FF] to-[#FF2E93] flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Sparkles size={13} />
                    </div>
                  )}

                  <div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isAI
                          ? 'bg-[#1F223D] border border-white/10 text-gray-100 rounded-tl-none'
                          : 'bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Quick Options Pills */}
                    {msg.options && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendOption(opt)}
                            className="text-[11px] px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold transition-all hover:scale-102 text-left"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-2 rounded-2xl w-fit">
              <span className="animate-spin text-sm">✨</span>
              <span>Amorex AI is preparing a resolution...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="pt-3 border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your inquiry or issue..."
            className="flex-1 bg-[#090A15] border border-white/15 focus:border-[#00D2FF] rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#FF2E93] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
