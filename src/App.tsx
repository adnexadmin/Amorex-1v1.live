import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  NavigationTab,
  StreamHost,
  PartyRoom,
  MomentPost,
  ChatConversation,
  BackpackItem,
  DailyTask,
  UTRRequest,
  VirtualGift,
  CallHistoryItem
} from './types';
import {
  initialUser,
  initialHosts,
  initialPartyRooms,
  initialMoments,
  initialConversations,
  initialBackpack,
  initialTasks,
  initialUTRRequests,
  virtualGifts,
  createSuperAdminProfile,
  saveRegisteredUser,
  updateUserTimeSpent,
  updateUserCoinsInRegistry,
  getStoredRegisteredUsers
} from './utils/storage';
import { sound } from './utils/audio';
import {
  auth,
  getUserFromFirestore,
  signOutFirebaseUser
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Components
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { FloatingPiPStream } from './components/common/FloatingPiPStream';
import { CoinRainCelebration } from './components/common/CoinRainCelebration';
import { LandingPage } from './components/auth/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';

// Modals
import { GiftDrawer } from './components/modals/GiftDrawer';
import { ActiveCallModal } from './components/modals/ActiveCallModal';
import { RechargeModal } from './components/modals/RechargeModal';
import { SuperAdminModal } from './components/admin/SuperAdminModal';
import { SupportAIBotModal } from './components/modals/SupportAIBotModal';
import { MediaPermissionModal } from './components/modals/MediaPermissionModal';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { AppShareModal } from './components/modals/AppShareModal';
import { AgentPromotionModal } from './components/modals/AgentPromotionModal';
import { LoadingSplashScreen } from './components/common/LoadingSplashScreen';

// 5 Core Tabs
import { LiveTab } from './components/tabs/LiveTab';
import { MomentsTab } from './components/tabs/MomentsTab';
import { PartyTab } from './components/tabs/PartyTab';
import { MessagesTab } from './components/tabs/MessagesTab';
import { ProfileTab } from './components/tabs/ProfileTab';

export function App() {
  // App state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('amorex_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('LIVE');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);
  const [isAdminSuiteOpen, setIsAdminSuiteOpen] = useState<boolean>(false);
  const [isSupportBotOpen, setIsSupportBotOpen] = useState<boolean>(false);
  const [supportBotContext, setSupportBotContext] = useState<{ source: string; query: string } | undefined>();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAgentPromoModalOpen, setIsAgentPromoModalOpen] = useState<boolean>(false);
  const [spentCoinsForPromo, setSpentCoinsForPromo] = useState<number>(0);
  const [hasShownAgentPromoSession, setHasShownAgentPromoSession] = useState<boolean>(false);
  const [mediaPermissionTargetHost, setMediaPermissionTargetHost] = useState<StreamHost | null>(null);

  // Gifting state
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState<boolean>(false);
  const [giftRecipientName, setGiftRecipientName] = useState<string>('Live Host');

  // Active 1v1 Video Call state
  const [activeCallHost, setActiveCallHost] = useState<StreamHost | null>(null);

  // Floating PiP state
  const [pipHost, setPipHost] = useState<StreamHost | null>(null);

  // Global Coin Rain state
  const [isCoinRainActive, setIsCoinRainActive] = useState<boolean>(false);
  const [coinRainPool, setCoinRainPool] = useState<number>(100000);

  // Persistent Domain Collections
  const [hosts, setHosts] = useState<StreamHost[]>(() => {
    const saved = localStorage.getItem('amorex_hosts');
    if (saved) {
      try {
        const parsed: StreamHost[] = JSON.parse(saved);
        return parsed.map((h) => {
          const defaultMatch = initialHosts.find((ih) => ih.id === h.id);
          return {
            ...h,
            languages: h.languages && h.languages.length > 0 ? h.languages : defaultMatch?.languages || ['English'],
            primaryLanguage: h.primaryLanguage || defaultMatch?.primaryLanguage || 'English'
          };
        });
      } catch (e) {
        return initialHosts;
      }
    }
    return initialHosts;
  });

  const [rooms, setRooms] = useState<PartyRoom[]>(() => {
    const saved = localStorage.getItem('amorex_rooms');
    return saved ? JSON.parse(saved) : initialPartyRooms;
  });

  const [moments, setMoments] = useState<MomentPost[]>(() => {
    const saved = localStorage.getItem('amorex_moments');
    return saved ? JSON.parse(saved) : initialMoments;
  });

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('amorex_conversations');
    return saved ? JSON.parse(saved) : initialConversations;
  });

  const [backpack, setBackpack] = useState<BackpackItem[]>(() => {
    const saved = localStorage.getItem('amorex_backpack');
    return saved ? JSON.parse(saved) : initialBackpack;
  });

  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('amorex_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [utrRequests, setUtrRequests] = useState<UTRRequest[]>(() => {
    const saved = localStorage.getItem('amorex_utr');
    return saved ? JSON.parse(saved) : initialUTRRequests;
  });

  // Sync to local storage and registered users registry
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('amorex_user', JSON.stringify(currentUser));
      if (!currentUser.is_super_admin && currentUser.isRealUser !== false) {
        saveRegisteredUser(currentUser);
      }
    } else {
      localStorage.removeItem('amorex_user');
    }
  }, [currentUser]);

  // Reactive listener for profile & avatar updates dispatched across components
  useEffect(() => {
    const handleUserUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<UserProfile>;
      if (customEvt.detail) {
        setCurrentUser(customEvt.detail);
      }
    };
    window.addEventListener('amorex_user_updated', handleUserUpdated);
    return () => {
      window.removeEventListener('amorex_user_updated', handleUserUpdated);
    };
  }, []);

  // Real-time time spent ticker for active real users
  useEffect(() => {
    if (!currentUser || currentUser.is_super_admin || currentUser.isRealUser === false) return;

    const interval = setInterval(() => {
      setCurrentUser((prev) => {
        if (!prev) return null;
        const currentSecs = prev.timeSpentSeconds || 0;
        const updatedSecs = currentSecs + 5;
        updateUserTimeSpent(prev.id, 5);
        return {
          ...prev,
          timeSpentSeconds: updatedSecs,
          lastActiveAt: Date.now()
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?.is_super_admin, currentUser?.isRealUser]);

  useEffect(() => {
    localStorage.setItem('amorex_moments', JSON.stringify(moments));
  }, [moments]);

  useEffect(() => {
    localStorage.setItem('amorex_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('amorex_utr', JSON.stringify(utrRequests));
  }, [utrRequests]);

  // Firebase Auth Initial Session State Listener
  useEffect(() => {
    let isMounted = true;
    // Safety watchdog: ensure loading splash screen resolves cleanly within 1.2s even if offline or slow network
    const watchdog = setTimeout(() => {
      if (isMounted) setIsAuthLoading(false);
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser && !currentUser) {
          const profile = await getUserFromFirestore(fbUser.uid);
          if (profile && isMounted) {
            setCurrentUser(profile);
            if (!profile.isOnboarded && !profile.is_super_admin) {
              setIsOnboardingOpen(true);
            }
          }
        }
      } catch (e) {
        console.warn('Auth state restore notice:', e);
      } finally {
        if (isMounted) {
          clearTimeout(watchdog);
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(watchdog);
      unsubscribe();
    };
  }, []);

  // Auth Handlers
  const handleAuthSuccess = (user: UserProfile, isNewUser: boolean = false) => {
    setCurrentUser(user);
    if (!user.is_super_admin) {
      saveRegisteredUser(user, true);
    }
    setIsAuthModalOpen(false);

    // If new user or onboarding incomplete, redirect to profile setup
    if ((isNewUser || !user.isOnboarded) && !user.is_super_admin) {
      setIsOnboardingOpen(true);
    } else {
      setIsOnboardingOpen(false);
      setActiveTab('LIVE');
    }
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    if (!updatedUser.is_super_admin) {
      saveRegisteredUser(updatedUser);
    }
    setIsOnboardingOpen(false);
    setActiveTab('LIVE');
  };

  const handleLogout = async () => {
    await signOutFirebaseUser();
    setCurrentUser(null);
    setIsAdminSuiteOpen(false);
    setIsGiftDrawerOpen(false);
    setActiveCallHost(null);
  };

  const handleSwitchToSuperAdmin = (email: string = 'adnexadmin@gmail.com') => {
    sound.playJackpotFanfare();
    const adminUser = createSuperAdminProfile(email, 'Adnex Super Admin');
    setCurrentUser(adminUser);
    setIsAdminSuiteOpen(true);
  };

  // Coin and Wallet Handlers
  const handleDeductCoins = (amount: number): boolean => {
    if (!currentUser) return false;
    if (currentUser.coins < amount) {
      sound.playClick();
      setIsRechargeModalOpen(true);
      return false;
    }
    const newCoins = currentUser.coins - amount;
    setCurrentUser((prev) => (prev ? { ...prev, coins: newCoins } : null));
    if (!currentUser.is_super_admin) {
      updateUserCoinsInRegistry(currentUser.id, newCoins, currentUser.gems);
    }

    // High-converting Agent Promotion trigger on coin spending
    if (amount > 0) {
      setSpentCoinsForPromo((prev) => {
        const nextTotal = prev + amount;
        if (!hasShownAgentPromoSession && (amount >= 100 || nextTotal >= 200)) {
          setHasShownAgentPromoSession(true);
          setTimeout(() => {
            sound.playJackpotFanfare();
            setIsAgentPromoModalOpen(true);
          }, 600);
        }
        return nextTotal;
      });
    }

    return true;
  };

  const handleAddCoins = (amount: number) => {
    if (!currentUser) return;
    const newCoins = currentUser.coins + amount;
    setCurrentUser((prev) => (prev ? { ...prev, coins: newCoins } : null));
    if (!currentUser.is_super_admin) {
      updateUserCoinsInRegistry(currentUser.id, newCoins, currentUser.gems);
    }
  };

  // 1v1 Call Handlers
  const handleStart1v1Call = (host: StreamHost) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const hasGrantedPermission = localStorage.getItem('amorex_media_granted');
    if (!hasGrantedPermission) {
      setMediaPermissionTargetHost(host);
    } else {
      setActiveCallHost(host);
      setPipHost(null);
    }
  };

  const handleMediaPermissionConfirmed = () => {
    localStorage.setItem('amorex_media_granted', 'true');
    if (mediaPermissionTargetHost) {
      setActiveCallHost(mediaPermissionTargetHost);
      setPipHost(null);
      setMediaPermissionTargetHost(null);
    }
  };

  const handleEndCall = (_durationSec: number, _coinsCharged: number, rating?: number) => {
    if (activeCallHost && _durationSec > 0) {
      try {
        const saved = localStorage.getItem('amorex_call_history');
        const prevHistory: CallHistoryItem[] = saved ? JSON.parse(saved) : [];
        const newRecord: CallHistoryItem = {
          id: `call-${Date.now()}`,
          hostId: activeCallHost.id,
          hostName: activeCallHost.name,
          hostAvatar: activeCallHost.avatar,
          hostCountry: activeCallHost.region,
          hostLevel: activeCallHost.level,
          durationSec: _durationSec,
          coinsCharged: _coinsCharged,
          timestamp: 'Just now',
          rating: rating || 5,
          quality: 'HD 1080p',
          status: 'completed'
        };
        const updated = [newRecord, ...prevHistory];
        localStorage.setItem('amorex_call_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to record call history:', e);
      }
    }

    setActiveCallHost(null);
    if (rating && currentUser) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              experience: prev.experience + 50
            }
          : null
      );
    }
  };

  // Gifting Handlers
  const handleOpenGiftDrawer = (recipientName: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setGiftRecipientName(recipientName);
    setIsGiftDrawerOpen(true);
  };

  const handleSendGift = (gift: VirtualGift, count: number) => {
    const totalCost = gift.coinCost * count;
    const deducted = handleDeductCoins(totalCost);
    if (!deducted) return;

    // Grant gems/exp
    if (currentUser) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              gems: prev.gems + Math.floor(totalCost * 0.7),
              exp: prev.exp + totalCost
            }
          : null
      );
    }
  };

  // Moments Handlers
  const handleLikePost = (postId: string) => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === postId) {
          const hasLiked = !m.hasLiked;
          return {
            ...m,
            hasLiked,
            likesCount: hasLiked ? m.likesCount + 1 : Math.max(0, m.likesCount - 1)
          };
        }
        return m;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!currentUser) return;
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === postId) {
          const newComment = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            text,
            time: 'Just now'
          };
          return {
            ...m,
            commentsCount: m.commentsCount + 1,
            comments: [...(m.comments || []), newComment]
          };
        }
        return m;
      })
    );
  };

  const handleCreatePost = (newPost: Omit<MomentPost, 'id' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'timestamp'>) => {
    const post: MomentPost = {
      ...newPost,
      id: `post-${Date.now()}`,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      timestamp: 'Just now',
      hasLiked: true,
      comments: []
    };
    setMoments((prev) => [post, ...prev]);
  };

  // Messaging Handlers
  const handleSendMessage = (
    conversationId: string,
    text: string,
    type: 'text' | 'voice' | 'image' | 'video' = 'text',
    mediaUrl?: string
  ) => {
    if (!currentUser) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type,
            mediaUrl
          };
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: 'Just now',
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );
  };

  // UTR & Recharge Handlers
  const handleSubmitUTR = (req: Omit<UTRRequest, 'id' | 'status' | 'timestamp'>) => {
    const newReq: UTRRequest = {
      ...req,
      id: `utr-${Date.now()}`,
      status: 'PENDING',
      timestamp: new Date().toLocaleString()
    };
    setUtrRequests((prev) => [newReq, ...prev]);
  };

  const handleApproveUTR = (id: string) => {
    setUtrRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (currentUser && (currentUser.id === r.userId || currentUser.displayId === r.userDisplayId)) {
            handleAddCoins(r.coinsExpected);
          }
          return { ...r, status: 'APPROVED' };
        }
        return r;
      })
    );
  };

  const handleRejectUTR = (id: string) => {
    setUtrRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
    );
  };

  // Super-Admin Actions
  const handleAirdropCoins = (targetDisplayId: string, amount: number): boolean => {
    let matched = false;
    if (currentUser && (currentUser.displayId === targetDisplayId || currentUser.id === targetDisplayId)) {
      handleAddCoins(amount);
      matched = true;
    }
    const regList = getStoredRegisteredUsers();
    const targetUser = regList.find((u) => u.displayId === targetDisplayId || u.id === targetDisplayId);
    if (targetUser) {
      const newCoins = (targetUser.coins || 0) + amount;
      updateUserCoinsInRegistry(targetUser.id, newCoins);
      matched = true;
    }
    if (!matched && currentUser) {
      handleAddCoins(amount);
    }
    return true;
  };

  const handleTriggerGlobalCoinRain = (poolAmount: number) => {
    setCoinRainPool(poolAmount);
    setIsCoinRainActive(true);
  };

  // Task & Backpack Actions
  const handleClaimTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && !t.isClaimed) {
          sound.playCoinDrop();
          handleAddCoins(t.rewardCoins);
          return { ...t, isClaimed: true };
        }
        return t;
      })
    );
  };

  const handleEquipBackpackItem = (itemId: string) => {
    setBackpack((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, isEquipped: !item.isEquipped };
        }
        return item;
      })
    );
  };

  // 1. While Firebase Auth is checking the initial user session, display branded loading splash screen
  if (isAuthLoading) {
    return <LoadingSplashScreen message="Authenticating session..." />;
  }

  // 2. If no logged in user, render Landing Page (Mandatory Auth Only)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090A15] text-white">
        <LandingPage
          onOpenAuthModal={(mode = 'login') => {
            setAuthModalInitialMode(mode);
            setIsAuthModalOpen(true);
          }}
          onAdminLogin={(adminUser) => handleAuthSuccess(adminUser)}
        />

        {isAuthModalOpen && (
          <AuthModal
            initialMode={authModalInitialMode}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A15] text-white flex flex-col relative overflow-x-hidden selection:bg-[#FF2E93] selection:text-white">
      {/* Sleek Interface Ambient Glowing Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#FF2E93] opacity-10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#00D2FF] opacity-10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Top Fixed Navbar */}
      <Navbar
        user={currentUser}
        onOpenProfile={() => setActiveTab('PROFILE')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenRecharge={() => setIsRechargeModalOpen(true)}
        onOpenAdminSuite={() => setIsAdminSuiteOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        activeCoinRain={isCoinRainActive}
      />

      {/* Main Tab Content View with Fullscreen BottomNav Inset */}
      <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
        {activeTab === 'LIVE' && (
          <LiveTab
            hosts={hosts}
            user={currentUser}
            onStart1v1Call={handleStart1v1Call}
            onOpenGiftDrawer={handleOpenGiftDrawer}
            onMinimizeStreamToPiP={(host) => setPipHost(host)}
          />
        )}

        {activeTab === 'MOMENTS' && (
          <MomentsTab
            posts={moments}
            user={currentUser}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onOpenGiftDrawer={handleOpenGiftDrawer}
            onCreatePost={handleCreatePost}
          />
        )}

        {activeTab === 'PARTY' && (
          <PartyTab
            rooms={rooms}
            user={currentUser}
            onOpenGiftDrawer={handleOpenGiftDrawer}
            onDeductCoins={handleDeductCoins}
            onAddCoins={handleAddCoins}
            onOpenRecharge={() => setIsRechargeModalOpen(true)}
          />
        )}

        {activeTab === 'MESSAGES' && (
          <MessagesTab
            conversations={conversations}
            user={currentUser}
            hosts={hosts}
            onStart1v1Call={handleStart1v1Call}
            onOpenGiftDrawer={handleOpenGiftDrawer}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'PROFILE' && (
          <ProfileTab
            user={currentUser}
            backpack={backpack}
            tasks={tasks}
            onOpenRecharge={() => setIsRechargeModalOpen(true)}
            onOpenAdminSuite={() => setIsAdminSuiteOpen(true)}
            onSwitchToSuperAdmin={handleSwitchToSuperAdmin}
            onOpenSupportBot={(ctx) => {
              setSupportBotContext(ctx);
              setIsSupportBotOpen(true);
            }}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onLogout={handleLogout}
            onClaimTask={handleClaimTask}
            onEquipBackpackItem={handleEquipBackpackItem}
            onStart1v1Call={handleStart1v1Call}
            hosts={hosts}
          />
        )}
      </main>

      {/* Persistent Bottom 5-Tab Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        user={currentUser}
        onTabChange={(tab) => {
          sound.playClick();
          setActiveTab(tab);
        }}
        unreadCount={conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
      />

      {/* Floating Picture-in-Picture Mini Stream */}
      {pipHost && (
        <FloatingPiPStream
          host={pipHost}
          onExpand={() => {
            handleStart1v1Call(pipHost);
            setPipHost(null);
          }}
          onClose={() => setPipHost(null)}
        />
      )}

      {/* Global Coin Rain Screen Shower Animation */}
      {isCoinRainActive && (
        <CoinRainCelebration
          poolAmount={coinRainPool}
          onClaimCoins={(coins) => {
            handleAddCoins(coins);
          }}
          onComplete={() => setIsCoinRainActive(false)}
        />
      )}

      {/* Virtual Gifts Drawer */}
      {isGiftDrawerOpen && (
        <GiftDrawer
          userCoins={currentUser?.coins ?? 0}
          recipientName={giftRecipientName}
          onSendGift={handleSendGift}
          onClose={() => setIsGiftDrawerOpen(false)}
          onOpenRecharge={() => {
            setIsGiftDrawerOpen(false);
            setIsRechargeModalOpen(true);
          }}
        />
      )}

      {/* Active 1v1 Romantic Video Call Modal */}
      {activeCallHost && (
        <ActiveCallModal
          host={activeCallHost}
          user={currentUser}
          onEndCall={handleEndCall}
          onOpenGiftDrawer={() => setIsGiftDrawerOpen(true)}
          onDeductCoins={handleDeductCoins}
        />
      )}

      {/* Coin & Gem Recharge Store */}
      {isRechargeModalOpen && (
        <RechargeModal
          user={currentUser}
          onClose={() => setIsRechargeModalOpen(false)}
          onSubmitUTR={handleSubmitUTR}
          onInstantCredit={handleAddCoins}
          onOpenSupportBot={() => {
            setIsRechargeModalOpen(false);
            setIsSupportBotOpen(true);
          }}
        />
      )}

      {/* Super-Admin Management Suite */}
      {isAdminSuiteOpen && (
        <SuperAdminModal
          user={currentUser}
          utrRequests={utrRequests}
          onApproveUTR={handleApproveUTR}
          onRejectUTR={handleRejectUTR}
          onAirdropCoins={handleAirdropCoins}
          onTriggerGlobalCoinRain={handleTriggerGlobalCoinRain}
          onClose={() => setIsAdminSuiteOpen(false)}
        />
      )}

      {/* 24/7 AI Support & Report Help Bot */}
      {isSupportBotOpen && (
        <SupportAIBotModal
          user={currentUser}
          onClose={() => {
            setIsSupportBotOpen(false);
            setSupportBotContext(undefined);
          }}
          onOpenRecharge={() => {
            setIsSupportBotOpen(false);
            setIsRechargeModalOpen(true);
          }}
          initialContext={supportBotContext}
        />
      )}

      {/* Media Audio & Video Permissions Onboarding */}
      {mediaPermissionTargetHost && (
        <MediaPermissionModal
          mode="call"
          onGranted={handleMediaPermissionConfirmed}
          onClose={() => setMediaPermissionTargetHost(null)}
        />
      )}

      {/* Authentication Gateway Modal */}
      {isAuthModalOpen && (
        <AuthModal
          initialMode={authModalInitialMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 4-Step Onboarding Profile Setup */}
      {isOnboardingOpen && (
        <OnboardingModal
          user={currentUser}
          initialUser={currentUser}
          onComplete={handleOnboardingComplete}
          onClose={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* Cross-Platform App Share Modal */}
      <AppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* High-Converting Agent Commission Promotion Modal */}
      <AgentPromotionModal
        isOpen={isAgentPromoModalOpen}
        onClose={() => setIsAgentPromoModalOpen(false)}
        onApplyWithSuperAdmin={() => {
          setIsAgentPromoModalOpen(false);
          setSupportBotContext({
            source: 'Agent Promotion Modal',
            query: 'I want to apply as an official Amorex Agent and earn up to 10% commission on every user coin top-up!'
          });
          setIsSupportBotOpen(true);
        }}
        onOpenShare={() => {
          setIsAgentPromoModalOpen(false);
          setIsShareModalOpen(true);
        }}
        triggerSpentCoins={spentCoinsForPromo}
      />
    </div>
  );
}
export default App;
