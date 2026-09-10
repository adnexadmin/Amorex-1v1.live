import React, { useState, useMemo } from 'react';
import { ChatConversation, UserProfile, StreamHost } from '../../types';
import { sound } from '../../utils/audio';
import { getStoredRegisteredUsers } from '../../utils/storage';
import {
  Search,
  Video,
  Gift,
  Send,
  X,
  Phone,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessagesTabProps {
  conversations: ChatConversation[];
  user: UserProfile;
  hosts: StreamHost[];
  onStart1v1Call: (host: StreamHost) => void;
  onOpenGiftDrawer: (recipientName: string) => void;
  onSendMessage: (conversationId: string, text: string, type?: 'text' | 'voice' | 'image' | 'video', mediaUrl?: string) => void;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({
  conversations,
  user,
  hosts,
  onStart1v1Call,
  onOpenGiftDrawer,
  onSendMessage
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');

  // Super Admin Fallback Host Object (ID: 1000001)
  const superAdminHost: StreamHost = useMemo(() => ({
    id: 'admin_1000001',
    displayId: '1000001',
    name: 'Adnex Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
    level: 99,
    gender: 'female',
    age: 25,
    region: 'Global HQ',
    isLive: true,
    viewerCount: 9999,
    coinRatePerMin: 60,
    tags: ['SuperAdmin', 'OfficialSupport'],
    bio: 'Official Amorex Super Admin & 24/7 Live Support Center',
    followersCount: 50000,
    likesCount: 100000,
    languages: ['Malayalam', 'English', 'Hindi'],
    primaryLanguage: 'Malayalam'
  }), []);

  // Registered real users list for direct search
  const registeredUsers = useMemo(() => getStoredRegisteredUsers(), []);

  // Filter conversations & search results by Name or displayId
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // Standard matching from conversations
    let result = conversations.filter((c) => {
      if (!q) return true;
      return (
        c.hostName.toLowerCase().includes(q) ||
        (c.hostDisplayId && c.hostDisplayId.toString().includes(q))
      );
    });

    // If query exists and searching for Super Admin '1000001' or 'admin'
    if (q === '1000001' || q.includes('admin')) {
      const hasAdminInConv = result.some((c) => c.hostDisplayId === '1000001' || c.hostId === 'admin_1000001');
      if (!hasAdminInConv) {
        result = [
          {
            id: 'conv_super_admin_1000001',
            hostId: 'admin_1000001',
            hostName: 'Adnex Super Admin',
            hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            hostDisplayId: '1000001',
            lastMessage: 'Official Amorex Support & Management',
            lastMessageTime: 'Online',
            unreadCount: 0,
            messages: [
              {
                id: 'init_msg_1',
                senderId: 'admin_1000001',
                text: 'Welcome to Amorex Official Support! Tap the Call button above for direct 1v1 WebRTC video call.',
                timestamp: 'Online',
                type: 'text'
              }
            ]
          },
          ...result
        ];
      }
    }

    // Search among registered users list if query is a numeric ID
    if (q && /^\d+$/.test(q) && q !== '1000001') {
      const matchedUser = registeredUsers.find((u) => u.displayId === q || u.id === q);
      if (matchedUser && !result.some((c) => c.hostDisplayId === matchedUser.displayId)) {
        result.push({
          id: `conv_${matchedUser.id}`,
          hostId: matchedUser.id,
          hostName: matchedUser.name,
          hostAvatar: matchedUser.avatar,
          hostDisplayId: matchedUser.displayId,
          lastMessage: `Registered User (ID: ${matchedUser.displayId})`,
          lastMessageTime: 'Active',
          unreadCount: 0,
          messages: []
        });
      }
    }

    return result;
  }, [conversations, searchQuery, registeredUsers]);

  // Active Selected Conversation
  const activeConversation = useMemo(() => {
    return filteredList.find((c) => c.id === activeConversationId) || null;
  }, [filteredList, activeConversationId]);

  // Trigger 1v1 WebRTC Video Call directly
  const handleInitiateDirectCall = (conv: ChatConversation) => {
    sound.playClick();
    
    // Find matching host object or create dynamic StreamHost object for call session
    const targetHost: StreamHost = hosts.find((h) => h.id === conv.hostId || h.displayId === conv.hostDisplayId) || {
      id: conv.hostId,
      displayId: conv.hostDisplayId || '1000001',
      name: conv.hostName,
      avatar: conv.hostAvatar,
      coverImage: conv.hostAvatar,
      level: 10,
      gender: 'female',
      age: 24,
      region: 'Global',
      isLive: true,
      viewerCount: 1,
      coinRatePerMin: 60,
      tags: ['1v1Call'],
      bio: 'Connected via Messages',
      followersCount: 100,
      likesCount: 100,
      languages: ['English'],
      primaryLanguage: 'English'
    };

    onStart1v1Call(targetHost);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId) return;
    sound.playClick();
    onSendMessage(activeConversationId, messageInput.trim(), 'text');
    setMessageInput('');
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto px-2.5 sm:px-6 flex flex-col gap-3 relative">
      {/* Top Header & Direct ID Search Input */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-pink-500" />
            <span>Messages &amp; Direct Calls</span>
          </h2>
          <span className="text-[10px] text-gray-400 font-mono">
            {filteredList.length} Connections
          </span>
        </div>

        {/* ID Search Input Bar */}
        <div className="relative w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter ID (e.g. 1000001 for Super Admin) or Name..."
            className="w-full bg-white/5 border border-white/15 focus:border-pink-500 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List View */}
      <div className="space-y-2">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white/5 border border-white/10 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-xl mx-auto text-pink-400">
              🔍
            </div>
            <h4 className="text-xs font-bold text-white">No Match Found</h4>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
              Type <strong>1000001</strong> to reach Super Admin directly or enter a registered user ID.
            </p>
            <button
              onClick={() => setSearchQuery('1000001')}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs cursor-pointer shadow-md hover:scale-105 transition-transform"
            >
              Search Super Admin (1000001)
            </button>
          </div>
        ) : (
          filteredList.map((conv) => {
            const isSuperAdmin = conv.hostDisplayId === '1000001' || conv.hostId === 'admin_1000001';

            return (
              <motion.div
                key={conv.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => {
                  sound.playClick();
                  setActiveConversationId(conv.id);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSuperAdmin
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : 'bg-[#14162B]/80 hover:bg-[#1C1F38] border-white/10'
                }`}
              >
                {/* Avatar & User Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      referrerPolicy="no-referrer"
                      src={conv.hostAvatar}
                      alt={conv.hostName}
                      className={`w-11 h-11 rounded-full object-cover border-2 ${
                        isSuperAdmin ? 'border-amber-400' : 'border-pink-500'
                      }`}
                    />
                    {isSuperAdmin && (
                      <span className="absolute -bottom-1 -right-1 text-[8px] bg-amber-400 text-black px-1 rounded-full font-black">
                        ADMIN
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-white truncate flex items-center gap-1">
                        <span>{conv.hostName}</span>
                        {isSuperAdmin && <ShieldCheck size={13} className="text-amber-400 shrink-0" />}
                      </h4>
                      <span className="text-[9px] font-mono text-pink-300 bg-pink-500/20 px-1.5 py-0.2 rounded-full border border-pink-500/30">
                        ID: {conv.hostDisplayId || '1000001'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {conv.lastMessage || 'Tap to chat or call 1v1'}
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons: 1v1 WebRTC Call & Gift */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenGiftDrawer(conv.hostName);
                    }}
                    title="Send Gift"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-amber-300 transition-colors cursor-pointer"
                  >
                    <Gift size={15} />
                  </button>

                  <button
                    onClick={() => handleInitiateDirectCall(conv)}
                    title="Start Direct 1v1 WebRTC Video Call"
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#9D00FF] to-[#00D2FF] text-white font-black text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Video size={13} className="animate-pulse" />
                    <span>Call 1v1</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Full-Screen Chat Overlay Sheet */}
      <AnimatePresence>
        {activeConversation && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-xl h-full sm:h-[90vh] bg-[#090A15] border sm:border border-white/20 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative"
            >
              {/* Chat Header */}
              <div className="p-3 bg-[#14162B] border-b border-white/10 flex items-center justify-between z-10">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                  <img
                    referrerPolicy="no-referrer"
                    src={activeConversation.hostAvatar}
                    alt={activeConversation.hostName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-pink-500"
                  />
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1">
                      <span>{activeConversation.hostName}</span>
                      {activeConversation.hostDisplayId === '1000001' && (
                        <ShieldCheck size={12} className="text-amber-400" />
                      )}
                    </h4>
                    <span className="text-[10px] text-pink-300 font-mono">
                      ID: {activeConversation.hostDisplayId || '1000001'} • Online
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInitiateDirectCall(activeConversation)}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] to-[#00D2FF] text-white font-black text-xs shadow-md hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer"
                  >
                    <Video size={13} className="animate-pulse" />
                    <span>Call 1v1</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#090A15] to-[#14162B]">
                {activeConversation.messages && activeConversation.messages.length > 0 ? (
                  activeConversation.messages.map((msg) => {
                    const isMe = msg.senderId === user.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white rounded-br-none shadow-md'
                              : 'bg-white/10 border border-white/15 text-white rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-gray-500 mt-1 font-mono">{msg.timestamp}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 text-gray-500 text-xs">
                    No messages yet. Send a greeting or start a 1v1 WebRTC Video Call!
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendText} className="p-3 bg-[#14162B] border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#090A15] border border-white/15 focus:border-pink-500 rounded-full px-4 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-[#FF2E93] hover:bg-pink-600 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
