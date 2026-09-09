import React, { useState, useRef } from 'react';
import { ChatConversation, StreamHost, UserProfile } from '../../types';
import { sound } from '../../utils/audio';
import { autoTranslateText, translateText } from '../../utils/translate';
import { getAppLanguage, AppLanguage, SUPPORTED_LANGUAGES, t } from '../../utils/i18n';
import {
  MessageSquare,
  Phone,
  PhoneCall,
  Video,
  Send,
  Mic,
  Gift,
  Languages,
  Sparkles,
  ArrowLeft,
  CheckCheck,
  Search,
  UserPlus,
  Users,
  Image as ImageIcon,
  Film,
  X,
  ShieldAlert,
  FolderLock,
  Plus,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface MessagesTabProps {
  conversations: ChatConversation[];
  user: UserProfile;
  hosts: StreamHost[];
  onStart1v1Call: (host: StreamHost) => void;
  onOpenGiftDrawer: (recipientName: string) => void;
  onSendMessage: (conversationId: string, text: string, type?: 'text' | 'voice' | 'image' | 'video', mediaUrl?: string) => void;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({
  conversations: initialConversations,
  user,
  hosts,
  onStart1v1Call,
  onOpenGiftDrawer,
  onSendMessage
}) => {
  const [conversationsList, setConversationsList] = useState<ChatConversation[]>([
    ...initialConversations,
    // Add default Strangers conversation
    {
      id: 'stranger-1',
      participantId: 'stranger-user-99',
      participantDisplayId: '94827104',
      participantName: 'Siddharth_Roy',
      participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
      isStranger: true,
      lastMessage: 'Hey! Loved your profile on 1v1 Radar. Would love to connect 💫',
      lastMessageTime: '10m ago',
      unreadCount: 1,
      messages: [
        {
          id: 'smsg-1',
          senderId: 'stranger-user-99',
          text: 'Hey! Loved your profile on 1v1 Radar. Would love to connect 💫',
          timestamp: '10m ago'
        }
      ]
    },
    {
      id: 'stranger-2',
      participantId: 'stranger-user-98',
      participantDisplayId: '63910482',
      participantName: 'Elena_Vip',
      participantAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      isOnline: false,
      isStranger: true,
      lastMessage: 'Are you coming to the Dubai lounge party tonight? 🥂',
      lastMessageTime: '1h ago',
      unreadCount: 2,
      messages: [
        {
          id: 'smsg-2',
          senderId: 'stranger-user-98',
          text: 'Are you coming to the Dubai lounge party tonight? 🥂',
          timestamp: '1h ago'
        }
      ]
    }
  ]);

  const [subTab, setSubTab] = useState<'Message' | 'Strangers' | 'Call' | 'Contacts'>('Message');
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>('English');
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});

  // Global Multi-Language System & Auto-Translation State
  const [currentAppLang, setCurrentAppLang] = useState<AppLanguage>(getAppLanguage());
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState<boolean>(true);
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail) {
        setCurrentAppLang(customEvent.detail);
      } else {
        setCurrentAppLang(getAppLanguage());
      }
    };
    window.addEventListener('amorex_language_changed', handleLangChange);
    return () => {
      window.removeEventListener('amorex_language_changed', handleLangChange);
    };
  }, []);

  // Media Attachment state
  const [mediaPickerOpen, setMediaPickerOpen] = useState<boolean>(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // Create Group Modal State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState<boolean>(false);
  const [groupTitle, setGroupTitle] = useState<string>('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger inline translation
  const handleTranslate = async (msgId: string, text: string) => {
    sound.playClick();
    if (translatedMessages[msgId]) {
      const next = { ...translatedMessages };
      delete next[msgId];
      setTranslatedMessages(next);
      return;
    }

    const translated = await translateText(text, targetLang);
    setTranslatedMessages((prev) => ({
      ...prev,
      [msgId]: translated
    }));
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;
    sound.playClick();

    const newMsg = {
      id: Date.now().toString(),
      senderId: user.id,
      text: messageInput.trim(),
      timestamp: 'Just now',
      type: 'text' as const
    };

    setActiveChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMsg], lastMessage: messageInput.trim(), lastMessageTime: 'Just now' } : null
    );

    setConversationsList((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, lastMessage: messageInput.trim(), lastMessageTime: 'Just now' } : c))
    );

    onSendMessage(activeChat.id, messageInput.trim(), 'text');
    setMessageInput('');
  };

  const handleSendMediaMessage = (url: string, type: 'image' | 'video') => {
    if (!activeChat) return;
    sound.playCoinDrop();

    const mediaText = type === 'image' ? '📷 [Photo Attachment]' : '🎬 [Video Attachment]';
    const newMsg = {
      id: Date.now().toString(),
      senderId: user.id,
      text: mediaText,
      timestamp: 'Just now',
      type,
      mediaUrl: url
    };

    setActiveChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMsg], lastMessage: mediaText, lastMessageTime: 'Just now' } : null
    );

    setConversationsList((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, lastMessage: mediaText, lastMessageTime: 'Just now' } : c))
    );

    onSendMessage(activeChat.id, mediaText, type, url);
    setPreviewMedia(null);
    setMediaPickerOpen(false);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim()) return;
    sound.playCoinDrop();
    confetti({ particleCount: 60, spread: 70 });

    const newGroup: ChatConversation = {
      id: `group-${Date.now()}`,
      participantId: `group-${Date.now()}`,
      participantDisplayId: `GRP-${Math.floor(1000 + Math.random() * 9000)}`,
      participantName: groupTitle.trim(),
      participantAvatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
      isGroup: true,
      groupMembers: selectedContacts,
      lastMessage: `Group "${groupTitle.trim()}" created! Welcome everyone 🎉`,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: [
        {
          id: Date.now().toString(),
          senderId: user.id,
          text: `Group "${groupTitle.trim()}" created! Welcome everyone 🎉`,
          timestamp: 'Just now'
        }
      ]
    };

    setConversationsList((prev) => [newGroup, ...prev]);
    setIsCreateGroupOpen(false);
    setGroupTitle('');
    setSelectedContacts([]);
    setActiveChat(newGroup);
  };

  const strangersCount = conversationsList.filter((c) => c.isStranger).reduce((acc, c) => acc + c.unreadCount, 0);
  const friendsCount = conversationsList.filter((c) => !c.isStranger).reduce((acc, c) => acc + c.unreadCount, 0);

  // Find host for active chat if matching
  const matchingHost = activeChat
    ? hosts.find((h) => h.name.toLowerCase() === activeChat.participantName.toLowerCase()) || hosts[0]
    : null;

  return (
    <div className="pb-24 pt-2 max-w-4xl mx-auto px-3 sm:px-4 space-y-4">
      {/* Hidden File Input for Custom Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            const isVid = file.type.startsWith('video');
            setPreviewMedia({ url, type: isVid ? 'video' : 'image' });
          }
        }}
      />

      {/* If Inside Active Chat View */}
      {activeChat ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl bg-[#14162B]/95 border border-pink-500/30 overflow-hidden shadow-2xl flex flex-col h-[75vh]"
        >
          {/* Chat Header */}
          <div className="p-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChat(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-pink-500">
                <img
                  referrerPolicy="no-referrer"
                  src={activeChat.participantAvatar}
                  alt={activeChat.participantName}
                  className="w-full h-full object-cover"
                />
                {activeChat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white leading-none">{activeChat.participantName}</h3>
                  {activeChat.isGroup && (
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded">Group</span>
                  )}
                  {activeChat.isStranger && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">Stranger</span>
                  )}
                </div>
                <p className="text-[10px] text-pink-300 font-mono mt-0.5">
                  ID: {activeChat.participantDisplayId} • {activeChat.isOnline ? 'Online now' : 'Active recently'}
                </p>
              </div>
            </div>

            {/* Header Call & Language Controls */}
            <div className="flex items-center gap-2">
              {/* Auto-Translation Quick Toggle */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAutoTranslateEnabled(!autoTranslateEnabled);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  autoTranslateEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,210,255,0.2)]'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
                title="Toggle Instant Auto-Translation to your Selected Language"
              >
                <Globe size={11} className={autoTranslateEnabled ? 'text-cyan-400' : 'text-gray-400'} />
                <span>Auto-Translate: {autoTranslateEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {matchingHost && !activeChat.isGroup && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onStart1v1Call(matchingHost);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white font-black text-xs shadow-md hover:scale-105 transition-transform"
                >
                  <Video size={13} />
                  <span>1v1 Call</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeChat.messages.map((msg) => {
              const isMe = msg.senderId === user.id;
              const isShowingOriginal = !!showOriginalMap[msg.id];
              // 100% Perfect Chat Auto-Translation into receiver's current app language
              const autoResult = (!isMe && autoTranslateEnabled) ? autoTranslateText(msg.text, currentAppLang) : null;
              const isAutoTranslated = !!(autoResult && autoResult.isTranslated && !isShowingOriginal);
              const displayText = isAutoTranslated ? autoResult.translatedText : msg.text;
              const hasTranslation = translatedMessages[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 text-xs shadow-md relative group ${
                      isMe
                        ? 'bg-gradient-to-r from-[#FF2E93] to-purple-700 text-white rounded-br-none'
                        : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {/* If Media Attachment exists */}
                    {msg.mediaUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                        {msg.type === 'video' ? (
                          <video
                            src={msg.mediaUrl}
                            controls
                            className="w-full max-h-48 rounded-xl object-cover"
                          />
                        ) : (
                          <img
                            referrerPolicy="no-referrer"
                            src={msg.mediaUrl}
                            alt="attachment"
                            className="w-full max-h-48 rounded-xl object-cover cursor-pointer hover:scale-102 transition-transform"
                            onClick={() => setPreviewMedia({ url: msg.mediaUrl!, type: 'image' })}
                          />
                        )}
                      </div>
                    )}

                    {/* Small 'Translated' Badge when auto-translated */}
                    {isAutoTranslated && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-xs">
                          <Globe size={10} className="text-cyan-300" />
                          <span>Translated ({SUPPORTED_LANGUAGES.find(l => l.code === currentAppLang)?.nativeName || currentAppLang.toUpperCase()})</span>
                        </span>
                      </div>
                    )}

                    {/* Message Text */}
                    <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>

                    {/* Auto-Translation Toggle: Show Original / Show Translated */}
                    {autoResult && autoResult.isTranslated && !isMe && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setShowOriginalMap((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }));
                        }}
                        className="mt-1 flex items-center gap-1 text-[9px] text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer underline decoration-cyan-400/30"
                      >
                        <Languages size={10} />
                        <span>{isShowingOriginal ? '✨ Show Translated' : '📜 Show Original'}</span>
                      </button>
                    )}

                    {/* AI Translation Overlay (Manual translation fallback) */}
                    {hasTranslation && !isAutoTranslated && (
                      <div className="mt-1.5 pt-1.5 border-t border-white/20 text-[11px] text-cyan-200 font-medium">
                        <span className="text-[9px] text-cyan-400 font-bold block">🌐 {targetLang} Translation:</span>
                        {hasTranslation}
                      </div>
                    )}

                    {/* Inline Manual Translate Action Button if auto-translate off */}
                    {!isMe && !autoTranslateEnabled && (
                      <button
                        onClick={() => handleTranslate(msg.id, msg.text)}
                        title="AI Translate Message"
                        className="mt-1 flex items-center gap-1 text-[9px] text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer"
                      >
                        <Languages size={10} />
                        <span>{hasTranslation ? 'Show Original' : `Translate to ${targetLang}`}</span>
                      </button>
                    )}

                    {/* Timestamp & Read ticks */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/60">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck size={11} className="text-cyan-300" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar with Media Attachment & Voice Controls */}
          <form onSubmit={handleSend} className="p-3 bg-black/50 border-t border-white/10 flex items-center gap-2">
            {/* Gift Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenGiftDrawer(activeChat.participantName);
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-[#FF2E93] flex items-center justify-center text-white shadow-sm shrink-0 hover:scale-105 transition-transform"
            >
              <Gift size={16} />
            </button>

            {/* Media Attachment Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMediaPickerOpen(!mediaPickerOpen);
              }}
              title="Attach Photo or Video"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-cyan-300 flex items-center justify-center shrink-0 transition-colors"
            >
              <ImageIcon size={16} />
            </button>

            {/* Voice Note Recorder Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsRecordingAudio(!isRecordingAudio);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                isRecordingAudio ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <Mic size={16} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Send a romantic message or attach media..."
              className="flex-1 bg-[#090A15] border border-white/15 focus:border-[#FF2E93] rounded-full px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-[#FF2E93] hover:bg-pink-600 text-white flex items-center justify-center shadow-md shrink-0 transition-transform hover:scale-105"
            >
              <Send size={15} />
            </button>
          </form>
        </motion.div>
      ) : (
        /* Conversation List View */
        <div className="space-y-4">
          {/* Sub-Tabs Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {(['Message', 'Strangers', 'Call', 'Contacts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    sound.playClick();
                    setSubTab(tab);
                  }}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                    subTab === tab
                      ? 'bg-gradient-to-r from-[#FF2E93] to-[#9D00FF] text-white shadow-[0_0_10px_#FF2E93]'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {tab === 'Message' && (
                    <>
                      <span>💬 Messages</span>
                      {friendsCount > 0 && (
                        <span className="text-[10px] bg-pink-500 text-white px-1.5 py-0.2 rounded-full font-black">
                          {friendsCount}
                        </span>
                      )}
                    </>
                  )}
                  {tab === 'Strangers' && (
                    <>
                      <span>👤 Strangers</span>
                      {strangersCount > 0 && (
                        <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded-full font-black">
                          {strangersCount}
                        </span>
                      )}
                    </>
                  )}
                  {tab === 'Call' && <span>📞 Call History</span>}
                  {tab === 'Contacts' && <span>👥 Contacts</span>}
                </button>
              ))}
            </div>

            {subTab === 'Contacts' && (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsCreateGroupOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00D2FF] to-blue-600 text-black font-black text-xs shadow-md hover:scale-105 transition-transform"
              >
                <Plus size={14} />
                <span>Create Group</span>
              </button>
            )}
          </div>

          {/* List Content based on SubTab */}
          {(subTab === 'Message' || subTab === 'Strangers') && (
            <div className="space-y-2.5">
              {conversationsList
                .filter((conv) => (subTab === 'Strangers' ? conv.isStranger : !conv.isStranger))
                .map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveChat(conv);
                    }}
                    className="p-3.5 rounded-2xl bg-[#14162B]/85 hover:bg-[#1C1E3A] border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-pink-500/50">
                        <img
                          referrerPolicy="no-referrer"
                          src={conv.participantAvatar}
                          alt={conv.participantName}
                          className="w-full h-full object-cover"
                        />
                        {conv.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090A15]" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                            {conv.participantName}
                          </h4>
                          {conv.isGroup && (
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded">
                              Group
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500 font-mono">
                            ID: {conv.participantDisplayId}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 truncate max-w-xs sm:max-w-md mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-gray-400">{conv.lastMessageTime}</span>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#FF2E93] text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Calls History Tab */}
          {subTab === 'Call' && (
            <div className="space-y-2.5">
              {[
                { name: 'Aanya Sharma', time: 'Today, 8:45 PM', duration: '4 min 12s', coins: '240 Coins', type: 'video' },
                { name: 'Layla Al-Mansoor', time: 'Yesterday, 10:15 PM', duration: '8 min 02s', coins: '480 Coins', type: 'video' },
                { name: 'Zoya Khan', time: '2 days ago', duration: '2 min 30s', coins: '120 Coins', type: 'audio' }
              ].map((call, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                      <PhoneCall size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{call.name}</h4>
                      <p className="text-[10px] text-gray-400">{call.time} • {call.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-300">{call.coins}</span>
                    <span className="text-[10px] text-emerald-400 block">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contacts Tab */}
          {subTab === 'Contacts' && (
            <div className="space-y-2.5">
              {hosts.map((host) => (
                <div key={host.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img referrerPolicy="no-referrer" src={host.avatar} alt={host.name} className="w-10 h-10 rounded-full object-cover border border-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{host.name}</h4>
                      <p className="text-[10px] text-gray-400">ID: {host.displayId} • {host.region}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onStart1v1Call(host);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                  >
                    1v1 Call
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MEDIA PICKER DRAWER / MODAL */}
      <AnimatePresence>
        {mediaPickerOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#14162B] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl text-white relative space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-sm font-bold text-white">Send Media Attachment</h4>
                <button onClick={() => setMediaPickerOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setMediaPickerOpen(false);
                  }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500 hover:bg-pink-500/10 flex flex-col items-center gap-2 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-xs font-bold text-white">Upload Photo</span>
                  <span className="text-[10px] text-gray-400">From gallery</span>
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setMediaPickerOpen(false);
                  }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 flex flex-col items-center gap-2 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Film size={20} />
                  </div>
                  <span className="text-xs font-bold text-white">Upload Video</span>
                  <span className="text-[10px] text-gray-400">Short video clip</span>
                </button>
              </div>

              {/* Romantic Preset Wallpapers / Stickers */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-gray-300">Romantic Quick Snaps:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&auto=format&fit=crop&q=80'
                  ].map((presetUrl, idx) => (
                    <img
                      key={idx}
                      referrerPolicy="no-referrer"
                      src={presetUrl}
                      alt="preset"
                      onClick={() => handleSendMediaMessage(presetUrl, 'image')}
                      className="h-16 w-full rounded-xl object-cover border border-white/10 hover:border-pink-400 cursor-pointer hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MEDIA PREVIEW & CONFIRMATION MODAL */}
      <AnimatePresence>
        {previewMedia && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#14162B] border border-pink-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-sm font-bold text-white">Preview Attachment</h4>
                <button onClick={() => setPreviewMedia(null)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-72 rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center border border-white/10">
                {previewMedia.type === 'video' ? (
                  <video src={previewMedia.url} controls autoPlay className="max-h-72 w-full object-contain" />
                ) : (
                  <img
                    referrerPolicy="no-referrer"
                    src={previewMedia.url}
                    alt="preview"
                    className="max-h-72 w-full object-contain"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendMediaMessage(previewMedia.url, previewMedia.type)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2E93] to-purple-600 text-white font-black text-xs shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Send Attachment</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE GROUP MODAL */}
      <AnimatePresence>
        {isCreateGroupOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#14162B] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <h4 className="text-sm font-bold text-white">Create Group Chat</h4>
                </div>
                <button onClick={() => setIsCreateGroupOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder="e.g. Dubai VIP Lovers Club 🥂"
                    className="w-full bg-[#090A15] border border-white/15 focus:border-[#00D2FF] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Add Members</label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {hosts.map((host) => {
                      const isSelected = selectedContacts.includes(host.name);
                      return (
                        <div
                          key={host.id}
                          onClick={() => {
                            sound.playClick();
                            setSelectedContacts((prev) =>
                              isSelected ? prev.filter((n) => n !== host.name) : [...prev, host.name]
                            );
                          }}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              referrerPolicy="no-referrer"
                              src={host.avatar}
                              alt={host.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <span className="text-xs font-bold text-white">{host.name}</span>
                          </div>
                          <span className="text-xs font-bold">{isSelected ? '✅' : '➕'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-blue-600 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-transform"
                >
                  Confirm & Launch Group Chat
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
