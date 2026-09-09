import React, { useState, useEffect } from 'react';
import { Radio, Image as ImageIcon, Users, MessageCircle, User as UserIcon } from 'lucide-react';
import { sound } from '../../utils/audio';
import { motion } from 'motion/react';
import { NavigationTab, UserProfile } from '../../types';
import { t, getAppLanguage, AppLanguage } from '../../utils/i18n';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  onChangeTab?: (tab: NavigationTab) => void;
  unreadCount?: number;
  user?: UserProfile | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onChangeTab,
  unreadCount = 0,
  user
}) => {
  const [currentLang, setCurrentLang] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail) {
        setCurrentLang(customEvent.detail);
      } else {
        setCurrentLang(getAppLanguage());
      }
    };
    window.addEventListener('amorex_language_changed', handleLangChange);
    return () => {
      window.removeEventListener('amorex_language_changed', handleLangChange);
    };
  }, []);

  const handleSelect = (tab: NavigationTab) => {
    sound.playClick();
    if (onTabChange) onTabChange(tab);
    else if (onChangeTab) onChangeTab(tab);
  };

  const tabs: Array<{
    id: NavigationTab;
    label: string;
    icon: React.FC<{ size?: number; className?: string }>;
    count?: number;
    avatar?: string;
  }> = [
    {
      id: 'LIVE',
      label: t('nav.live', currentLang) || 'Live',
      icon: Radio
    },
    {
      id: 'MOMENTS',
      label: t('nav.moments', currentLang) || 'Moments',
      icon: ImageIcon
    },
    {
      id: 'PARTY',
      label: t('nav.party', currentLang) || 'Party',
      icon: Users
    },
    {
      id: 'MESSAGES',
      label: t('nav.chat', currentLang) || t('nav.messages', currentLang) || 'Chat',
      icon: MessageCircle,
      count: unreadCount
    },
    {
      id: 'PROFILE',
      label: t('nav.profile', currentLang) || 'Profile',
      icon: UserIcon,
      avatar: user?.avatarUrl || user?.avatar
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 sm:h-20 pb-[env(safe-area-inset-bottom,0px)] box-content bg-[#090A15]/95 backdrop-blur-xl flex items-center justify-around px-2 sm:px-4 border-t border-white/10 z-40">
      <div className="max-w-lg w-full mx-auto flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              id={`bottom-nav-${tab.id.toLowerCase()}`}
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 cursor-pointer transition-all select-none ${
                isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div className="relative">
                {isActive ? (
                  <motion.div
                    layoutId="activeTabIcon"
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gradient-to-br from-[#FF2E93] to-[#FFD700] rounded-xl shadow-lg shadow-[#FF2E93]/30"
                  >
                    {tab.avatar ? (
                      <img
                        referrerPolicy="no-referrer"
                        src={tab.avatar}
                        alt="Profile"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <Icon size={20} className="text-white" />
                    )}
                  </motion.div>
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
                    {tab.avatar ? (
                      <img
                        referrerPolicy="no-referrer"
                        src={tab.avatar}
                        alt="Profile"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover border border-white/20"
                      />
                    ) : (
                      <Icon size={21} className="text-white/80" />
                    )}
                  </div>
                )}

                {/* Badge for chat notifications */}
                {Boolean(tab.count && tab.count > 0) && (
                  <div className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#FF2E93] rounded-full border-2 border-[#090A15] flex items-center justify-center text-[9px] font-bold text-white shadow-md">
                    {tab.count}
                  </div>
                )}
              </div>

              <span
                className={`text-[10px] sm:text-[11px] font-bold tracking-tight text-center truncate max-w-full leading-tight mt-0.5 ${
                  isActive ? 'text-[#FF2E93]' : 'text-white/70'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
