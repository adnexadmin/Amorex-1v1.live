/**
 * Amorex Global Multi-Language System (i18n)
 * Supported languages: English (en), Malayalam (ml), Hindi (hi), Arabic (ar), Tamil (ta)
 */

export type AppLanguage = 'en' | 'ml' | 'hi' | 'ar' | 'ta';

export interface LanguageInfo {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', dir: 'ltr' }
];

export const LANGUAGE_STORAGE_KEY = 'amorex_language';

export const getAppLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage;
  if (saved && ['en', 'ml', 'hi', 'ar', 'ta'].includes(saved)) {
    return saved;
  }
  return 'en';
};

export const setAppLanguage = (lang: AppLanguage): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  
  // Also update current user preference in storage if present
  try {
    const userRaw = localStorage.getItem('amorex_user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      user.contentLanguage = lang;
      localStorage.setItem('amorex_user', JSON.stringify(user));
    }
  } catch {
    // ignore
  }

  // Set HTML dir attribute for RTL support (Arabic)
  if (document.documentElement) {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  window.dispatchEvent(new CustomEvent('amorex_language_changed', { detail: lang }));
};

// Master i18n Translation Dictionary
export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Navigation & General
    'nav.live': 'Live',
    'nav_live': 'Live',
    'nav.party': 'Party',
    'nav_party': 'Party',
    'nav.moments': 'Moments',
    'nav_moments': 'Moments',
    'nav.chat': 'Chat',
    'nav_chat': 'Chat',
    'nav.messages': 'Chat',
    'nav_messages': 'Chat',
    'nav.profile': 'Profile',
    'nav_profile': 'Profile',
    'common.coins': 'Coins',
    'common.diamonds': 'Diamonds',
    'common.recharge': 'Recharge',
    'common.vip': 'VIP',
    'common.admin': 'Admin',
    'common.superAdmin': 'Super Admin',
    'common.applyNow': 'Apply Now / Contact Admin',
    'common.apply': 'Apply Now',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save Changes',
    'common.translated': 'Translated',
    'common.showOriginal': 'Show Original',
    'common.showTranslated': 'Show Translated',
    'common.online': 'Online',
    'common.copied': 'Copied to Clipboard!',
    'common.install': 'Install App',
    'common.sound': 'Sound Effects',

    // Landing Page
    'landing.badge': 'World-Class Romantic Live Streaming & Voice Lounges',
    'landing.title1': 'Experience',
    'landing.title2': 'Love & Fun',
    'landing.title3': 'Without Borders',
    'landing.subtitle': 'Connect 1v1 on high-definition video calls with real-time multi-language AI auto-translation, join 12-seat party voice lounges, and play live interactive mini-games.',
    'landing.joinBtn': 'JOIN / SIGN IN NOW',
    'landing.enterRoom': 'Explore Live Streams',
    'landing.statUsers': 'Active Daily Users',
    'landing.statHosts': 'Verified Live Hosts',
    'landing.statPurity': 'Safe & Encrypted',
    'landing.prop1Title': 'Live 1v1 Romantic Video',
    'landing.prop1Desc': 'Crystal-clear 1v1 private video matches with real-time multi-language AI auto-translation & vouchers.',
    'landing.prop2Title': '12-Seat Party Rooms',
    'landing.prop2Desc': 'Dynamic 12-seat interactive mic grid with live soundboard, host virtual gifts, and room games.',
    'landing.prop3Title': 'In-Room Mini Games',
    'landing.prop3Desc': 'Champ Car Racing with live 30s betting cycles, 777 Mega Jackpot Slots, and real-time winner alerts.',
    'landing.prop4Title': 'Moments Social Feed',
    'landing.prop4Desc': 'Explore verified creator stories, romantic photos, and voice notes with interactive heart likes.',

    // Agent Promotion Module
    'agent.bannerBadge': 'OFFICIAL AGENT PROGRAM',
    'agent.bannerTitle': 'Become an Official Agent & Earn Money',
    'agent.bannerDesc': 'Monetize your network! Earn up to 10% commission on every user coin top-up, host recruitment incentives, and instant weekly bank payouts.',
    'agent.profitTitle': 'Earn Up to 10% Commission on Top-Ups!',
    'agent.profitDesc': 'Highest commission rate in the industry with guaranteed instant weekly payouts.',
    'agent.commissionRate': 'Earn up to 10% Commission',
    'agent.tier1': 'Tier 1: 5% Commission (1,000 - 50,000 Coins)',
    'agent.tier2': 'Tier 2: 8% Commission (50,001 - 200,000 Coins)',
    'agent.tier3': 'Diamond Agent: 10% Commission (200,000+ Coins)',
    'agent.tier1Title': 'Tier 1 • 1K - 50K Coins',
    'agent.tier1Rate': '5% Commission',
    'agent.tier2Title': 'Tier 2 • 50K - 200K Coins',
    'agent.tier2Rate': '8% Commission',
    'agent.tier3Title': 'Diamond Agent • 200K+ Coins',
    'agent.tier3Rate': '10% Commission',
    'agent.benefit1': 'Direct Host Recruitment Bonuses',
    'agent.benefit2': 'Instant Weekly Settlements & Bank Transfer',
    'agent.benefit3': 'Dedicated 24/7 Super Admin Support Manager',
    'agent.benefit4': 'Verified Agency Portal & Custom Referral Link',
    'agent.badgeVerified': 'Official Verified Agent Badge & Portal',
    'agent.contactAdminBtn': 'Apply Now / Contact Admin',
    'agent.shareBtn': 'Share App & Earn',
    'agent.simulatorTitle': 'Commission Calculator',
    'agent.simulatorSub': 'Project your monthly agent profits',
    'agent.simulatorSpendLabel': 'Monthly User Coin Top-Up Volume',
    'agent.simulatorEarnLabel': 'Your Estimated Commission Profit',
    'agent.spendTriggerTitle': 'VIP Agent Opportunity Unlocked! 🚀',
    'agent.spendTriggerSubtitle': 'You just spent coins! Why only spend when you can earn?',
    'agent.spendTriggerDesc': 'As an active Amorex VIP, you qualify to become an Official Agent. Earn up to 10% commission on every top-up made by users in your agency!',
    'agent.getStartedBtn': 'Get Started / Apply with Super Admin',
    'agent.maybeLater': 'Maybe Later',
    'agent.applySuccess': 'Inquiry routed to Super Admin! Support will contact you shortly.',

    // Dynamic App Share
    'share.title': 'Share Amorex & Earn 10% Commission',
    'share.subtitle': 'Invite friends, recruit hosts, and earn up to 10% commission on every coin top-up!',
    'share.shareText': 'Join Amorex! Become an Official Agent and earn up to 10% commission on top-ups. Click here to join: {link}',
    'share.copySuccess': 'Share message & link copied to clipboard!',
    'share.copyBtn': 'Copy Share Link & Text',
    'share.whatsappBtn': 'WhatsApp',
    'share.telegramBtn': 'Telegram',
    'share.twitterBtn': 'X (Twitter)',
    'share.nativeShareBtn': 'Share App via Web Share',
    'share.shortBtn': 'Share & Earn',
    'share.btnTitle': 'Share Amorex & Earn 10% Commission',

    // Messages & Chat
    'messages.title': 'Messages & Calls',
    'messages.searchPlaceholder': 'Search chats, contacts, or hosts...',
    'messages.tabChats': 'Chats',
    'messages.tabCalls': 'Call History',
    'messages.tabContacts': 'Contacts',
    'messages.inputPlaceholder': 'Send a romantic message or attach media...',
    'messages.callCost': '240 Coins / min',
    'messages.autoTranslateOn': 'Auto-Translation Active',
    'messages.autoTranslateSub': 'Messages automatically translate to your language',
    'messages.callAgain': 'Call Again',
    'messages.mediaAttach': 'Attach Media',

    // Party Tab
    'party.roomTitle': '12-Seat VIP Party Lounge',
    'party.grabMic': 'Grab Mic Seat',
    'party.sendGift': 'Send Virtual Gift',
    'party.games': 'Mini Games',
    'party.topGifters': 'Top Gifters',
    'party.chatPlaceholder': 'Say something romantic in the party...',
    'party.autoTranslating': 'Party Chat Translated to',

    // Profile & Settings
    'profile.title': 'My Profile',
    'profile.editProfile': 'Edit Profile',
    'profile.goldCoinDetails': 'Gold Coin Details',
    'profile.cpSpace': 'CP Space',
    'profile.dailyTasks': 'Daily Tasks',
    'profile.backpack': 'Backpack',
    'profile.settings': 'Settings',
    'profile.privacyPolicy': 'Privacy & Security Policy',
    'profile.language': 'Language / ഭാഷ / भाषा',
    'profile.logout': 'Log Out Account',
    'profile.supportBot': '24/7 AI Customer Support',
    'profile.callRecords': '1v1 Call Records'
  },

  ml: {
    // Navigation & General
    'nav.live': 'ലൈവ്',
    'nav_live': 'ലൈവ്',
    'nav.party': 'പാർട്ടി',
    'nav_party': 'പാർട്ടി',
    'nav.moments': 'മൊമെന്റ്സ്',
    'nav_moments': 'മൊമെന്റ്സ്',
    'nav.chat': 'ചാറ്റ്',
    'nav_chat': 'ചാറ്റ്',
    'nav.messages': 'ചാറ്റ്',
    'nav_messages': 'ചാറ്റ്',
    'nav.profile': 'പ്രൊഫൈൽ',
    'nav_profile': 'പ്രൊഫൈൽ',
    'common.coins': 'കോയിനുകൾ',
    'common.diamonds': 'ഡയമണ്ട്സ്',
    'common.recharge': 'റീചാർജ്',
    'common.vip': 'വിഐപി',
    'common.admin': 'അഡ്മിൻ',
    'common.superAdmin': 'സൂപ്പർ അഡ്മിൻ',
    'common.applyNow': 'ഇപ്പോൾ അപേക്ഷിക്കുക / അഡ്മിനെ ബന്ധപ്പെടുക',
    'common.apply': 'അപേക്ഷിക്കുക',
    'common.close': 'അടയ്ക്കുക',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.confirm': 'സ്ഥിരീകരിക്കുക',
    'common.save': 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
    'common.translated': 'തർജ്ജമ ചെയ്തത്',
    'common.showOriginal': 'യഥാർത്ഥ സന്ദേശം',
    'common.showTranslated': 'വിവർത്തനം കാണിക്കുക',
    'common.online': 'ഓൺലൈൻ',
    'common.copied': 'ക്ലിപ്പ്ബോർഡിലേക്ക് പകർത്തി!',
    'common.install': 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',
    'common.sound': 'ശബ്ദ ഇഫക്റ്റുകൾ',

    // Landing Page
    'landing.badge': 'ലോകോത്തര റൊമാന്റിക് ലൈവ് സ്ട്രീമിംഗും വോയ്സ് ലൗഞ്ചുകളും',
    'landing.title1': 'അതിരുകളില്ലാത്ത',
    'landing.title2': 'സ്നേഹവും സൗഹൃദവും',
    'landing.title3': 'നേരിട്ട് അനുഭവിക്കൂ',
    'landing.subtitle': 'തത്സമയ ബഹുഭാഷാ എഐ വിവർത്തനത്തോടെ ലൈവ് 1v1 വീഡിയോ കോളുകൾ ആസ്വദിക്കൂ, 12-സീറ്റ് പാർട്ടി വോയ്സ് മുറികളിൽ ചേരൂ, ആവേശകരമായ മിനി ഗെയിമുകൾ കളിക്കൂ.',
    'landing.joinBtn': 'ഇപ്പോൾ ചേരൂ / ലോഗിൻ ചെയ്യൂ',
    'landing.enterRoom': 'ലൈവ് സ്ട്രീമുകൾ കാണുക',
    'landing.statUsers': 'പ്രതിദിന സജീവ ഉപയോക്താക്കൾ',
    'landing.statHosts': 'പരിശോധിച്ചുറപ്പിച്ച ഹോസ്റ്റുകൾ',
    'landing.statPurity': 'സുരക്ഷിതവും എൻക്രിപ്റ്റ് ചെയ്തതും',
    'landing.prop1Title': 'ലൈവ് 1v1 റൊമാന്റിക് വീഡിയോ',
    'landing.prop1Desc': 'തത്സമയ എഐ ഓട്ടോ-വിവർത്തനത്തോടുകൂടിയ ഹൈ-ഡെഫനിഷൻ 1v1 പ്രൈവറ്റ് വീഡിയോ കോളുകൾ.',
    'landing.prop2Title': '12-സീറ്റ് പാർട്ടി മുറികൾ',
    'landing.prop2Desc': '12-സീറ്റ് ഇന്ററാക്ടീവ് മൈക്ക് ഗ്രിഡ്, ഡിജെ സൗണ്ട്ബോർഡ്, ഹോസ്റ്റ് സമ്മാനങ്ങൾ.',
    'landing.prop3Title': 'ഇൻ-റൂം മിനി ഗെയിമുകൾ',
    'landing.prop3Desc': '30 സെക്കൻഡ് കാർ റേസിംഗ്, 777 മെഗാ ജാക്ക്പോട്ട് സ്ലോട്ടുകൾ, തത്സമയ സമ്മാനങ്ങൾ.',
    'landing.prop4Title': 'മൊമെന്റ്സ് സോഷ്യൽ ഫീഡ്',
    'landing.prop4Desc': 'ഹോസ്റ്റുകളുടെ ചിത്രങ്ങളും വോയ്സ് നോട്ടുകളും കണ്ട് ഹൃദയപൂർവ്വം ലൈക്ക് ചെയ്യൂ.',

    // Agent Promotion Module
    'agent.bannerBadge': 'ഔദ്യോഗിക ഏജന്റ് പ്രോഗ്രാം',
    'agent.bannerTitle': 'ഒരു ഔദ്യോഗിക ഏജന്റായി മികച്ച വരുമാനം നേടൂ',
    'agent.bannerDesc': 'ഓരോ ഉപയോക്തൃ കോയിൻ ടോപ്പ്-അപ്പിലും 10% വരെ കമ്മീഷൻ നേടൂ! ഹോസ്റ്റ് റിക്രൂട്ട്മെന്റ് ബോണസും പ്രതിവാര ബാങ്ക് പേഔട്ടും ഉറപ്പ്.',
    'agent.profitTitle': 'കോയിൻ ടോപ്പ്-അപ്പുകളിൽ 10% വരെ കമ്മീഷൻ നേടൂ!',
    'agent.profitDesc': 'ഏറ്റവും ഉയർന്ന കമ്മീഷൻ നിരക്കോടെ സുരക്ഷിതമായ പ്രതിവാര ബാങ്ക് പേഔട്ടുകൾ.',
    'agent.commissionRate': '10% വരെ കമ്മീഷൻ നേടൂ',
    'agent.tier1': 'ടയർ 1: 5% കമ്മീഷൻ (1,000 - 50,000 കോയിനുകൾ)',
    'agent.tier2': 'ടയർ 2: 8% കമ്മീഷൻ (50,001 - 200,000 കോയിനുകൾ)',
    'agent.tier3': 'ഡയമണ്ട് ഏജന്റ്: 10% കമ്മീഷൻ (200,000+ കോയിനുകൾ)',
    'agent.tier1Title': 'ടയർ 1 • 1K - 50K കോയിനുകൾ',
    'agent.tier1Rate': '5% കമ്മീഷൻ',
    'agent.tier2Title': 'ടയർ 2 • 50K - 200K കോയിനുകൾ',
    'agent.tier2Rate': '8% കമ്മീഷൻ',
    'agent.tier3Title': 'ഡയമണ്ട് ഏജന്റ് • 200K+ കോയിനുകൾ',
    'agent.tier3Rate': '10% കമ്മീഷൻ',
    'agent.benefit1': 'ഡയറക്റ്റ് ഹോസ്റ്റ് റിക്രൂട്ട്മെന്റ് ഉയർന്ന ബോണസുകൾ',
    'agent.benefit2': 'തത്സമയ പ്രതിവാര സെറ്റിൽമെന്റും ബാങ്ക് ട്രാൻസ്ഫറും',
    'agent.benefit3': '24/7 സമർപ്പിത സൂപ്പർ അഡ്മിൻ സപ്പോർട്ട് മാനേജർ',
    'agent.benefit4': 'വെരിഫൈഡ് ഏജൻസി പോർട്ടലും പ്രത്യേക റഫറൽ ലിങ്കും',
    'agent.badgeVerified': 'ഔദ്യോഗിക വെരിഫൈഡ് ഏജന്റ് ബാഡ്ജും പോർട്ടലും',
    'agent.contactAdminBtn': 'ഇപ്പോൾ അപേക്ഷിക്കുക / അഡ്മിനെ ബന്ധപ്പെടുക',
    'agent.shareBtn': 'ആപ്പ് ഷെയർ ചെയ്യൂ, പണം നേടൂ',
    'agent.simulatorTitle': 'കമ്മീഷൻ വരുമാന കാൽക്കുലേറ്റർ',
    'agent.simulatorSub': 'നിങ്ങളുടെ പ്രതിമാസ ഏജന്റ് ലാഭം കണക്കാക്കുക',
    'agent.simulatorSpendLabel': 'പ്രതിമാസ ടോപ്പ്-അപ്പ് വോളിയം',
    'agent.simulatorEarnLabel': 'നിങ്ങളുടെ പ്രതീക്ഷിക്കുന്ന ലാഭം',
    'agent.spendTriggerTitle': 'വിഐപി ഏജന്റ് അവസരം ലഭ്യമായി! 🚀',
    'agent.spendTriggerSubtitle': 'നിങ്ങൾ കോയിനുകൾ ചിലവഴിച്ചു! ചിലവഴിക്കുക മാത്രമല്ല, മികച്ച വരുമാനവും നേടൂ!',
    'agent.spendTriggerDesc': 'Amorex-ന്റെ സജീവ ഉപയോക്താവ് എന്ന നിലയിൽ നിങ്ങൾക്ക് ഔദ്യോഗിക ഏജന്റാകാം. ഓരോ ടോപ്പ്-അപ്പിലും 10% വരെ കമ്മീഷനും ഹോസ്റ്റ് റിക്രൂട്ട്മെന്റ് ബോണസും നേടൂ!',
    'agent.getStartedBtn': 'തുടങ്ങാം / സൂപ്പർ അഡ്മിനുമായി സംസാരിക്കൂ',
    'agent.maybeLater': 'പിന്നീടാകാം',
    'agent.applySuccess': 'സൂപ്പർ അഡ്മിനിലേക്ക് വിവരം കൈമാറി! സപ്പോർട്ട് ഉടൻ ബന്ധപ്പെടും.',

    // Dynamic App Share
    'share.title': 'Amorex ഷെയർ ചെയ്യൂ, 10% കമ്മീഷൻ നേടൂ',
    'share.subtitle': 'സുഹൃത്തുക്കളെ ക്ഷണിക്കൂ, ഹോസ്റ്റ് ഏജൻസി വളർത്തൂ, യഥാർത്ഥ വരുമാനം സ്വന്തമാക്കൂ!',
    'share.shareText': 'Amorex-ൽ ചേരൂ! ഒരു ഔദ്യോഗിക ഏജന്റായി മാറി കോയിൻ ടോപ്പ്-അപ്പുകളിൽ 10% വരെ കമ്മീഷൻ നേടൂ. ചേരാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക: {link}',
    'share.copySuccess': 'സന്ദേശവും ലിങ്കും ക്ലിപ്പ്ബോർഡിലേക്ക് പകർത്തി!',
    'share.copyBtn': 'സന്ദേശവും ലിങ്കും പകർത്തുക',
    'share.whatsappBtn': 'വാട്സ്ആപ്പ്',
    'share.telegramBtn': 'ടെലിഗ്രാം',
    'share.twitterBtn': 'എക്സ് (ട്വിറ്റർ)',
    'share.nativeShareBtn': 'ആപ്പ് ഷെയർ ചെയ്യുക',
    'share.shortBtn': 'ഷെയർ & ഏൺ',
    'share.btnTitle': 'Amorex ഷെയർ ചെയ്ത് 10% കമ്മീഷൻ നേടൂ',

    // Messages & Chat
    'messages.title': 'സന്ദേശങ്ങളും കോളുകളും',
    'messages.searchPlaceholder': 'ചാറ്റുകൾ, കോൺടാക്റ്റുകൾ തിരയുക...',
    'messages.tabChats': 'ചാറ്റുകൾ',
    'messages.tabCalls': 'കോൾ ഹിസ്റ്ററി',
    'messages.tabContacts': 'സുഹൃത്തുക്കൾ',
    'messages.inputPlaceholder': 'റൊമാന്റിക് സന്ദേശം അയയ്ക്കൂ അല്ലെങ്കിൽ മീഡിയ ചേർക്കൂ...',
    'messages.callCost': '240 കോയിനുകൾ / മിനിറ്റ്',
    'messages.autoTranslateOn': 'ഓട്ടോ-വിവർത്തനം സജീവം',
    'messages.autoTranslateSub': 'സന്ദേശങ്ങൾ നിങ്ങളുടെ ഭാഷയിലേക്ക് നേരിട്ട് വിവർത്തനം ചെയ്യപ്പെടും',
    'messages.callAgain': 'വീണ്ടും വിളിക്കുക',
    'messages.mediaAttach': 'മീഡിയ ചേർക്കുക',

    // Party Tab
    'party.roomTitle': '12-സീറ്റ് വിഐപി പാർട്ടി ലൗഞ്ച്',
    'party.grabMic': 'മൈക്ക് സീറ്റ് എടുക്കുക',
    'party.sendGift': 'സമ്മാനം നൽകുക',
    'party.games': 'മിനി ഗെയിമുകൾ',
    'party.topGifters': 'ടോപ്പ് ഗിഫ്റ്റേഴ്സ്',
    'party.chatPlaceholder': 'പാർട്ടിയിൽ എന്തെങ്കിലും പറയൂ...',
    'party.autoTranslating': 'പാർട്ടി ചാറ്റ് മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്തു',

    // Profile & Settings
    'profile.title': 'എന്റെ പ്രൊഫൈൽ',
    'profile.editProfile': 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
    'profile.goldCoinDetails': 'ഗോൾഡ് കോയിൻ വിവരങ്ങൾ',
    'profile.cpSpace': 'സിപി സ്പേസ്',
    'profile.dailyTasks': 'പ്രതിദിന ടാസ്കുകൾ',
    'profile.backpack': 'ബാക്ക്പാക്ക്',
    'profile.settings': 'ക്രമീകരണങ്ങൾ',
    'profile.privacyPolicy': 'സ്വകാര്യത & സുരക്ഷാ നയം',
    'profile.language': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    'profile.logout': 'ലോഗ് ഔട്ട് ചെയ്യുക',
    'profile.supportBot': '24/7 എഐ കസ്റ്റമർ സപ്പോർട്ട്',
    'profile.callRecords': '1v1 കോൾ റെക്കോർഡുകൾ'
  },

  hi: {
    // Navigation & General
    'nav.live': 'लाइव',
    'nav_live': 'लाइव',
    'nav.party': 'पार्टी',
    'nav_party': 'पार्टी',
    'nav.moments': 'मोमेंट्स',
    'nav_moments': 'मोमेंट्स',
    'nav.chat': 'चैट',
    'nav_chat': 'चैट',
    'nav.messages': 'चैट',
    'nav_messages': 'चैट',
    'nav.profile': 'प्रोफाइल',
    'nav_profile': 'प्रोफाइल',
    'common.coins': 'सिक्के',
    'common.diamonds': 'हीरे',
    'common.recharge': 'रिचार्ज',
    'common.vip': 'वीआईपी',
    'common.admin': 'व्यवस्थापक',
    'common.superAdmin': 'सुपर एडमिन',
    'common.applyNow': 'अभी आवेदन करें / एडमिन से संपर्क करें',
    'common.apply': 'आवेदन करें',
    'common.close': 'बंद करें',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.save': 'परिवर्तन सहेजें',
    'common.translated': 'अनुवादित',
    'common.showOriginal': 'मूल संदेश देखें',
    'common.showTranslated': 'अनुवाद देखें',
    'common.online': 'ऑनलाइन',
    'common.copied': 'क्लिपबोर्ड पर कॉपी किया गया!',
    'common.install': 'ऐप इंस्टॉल करें',
    'common.sound': 'ध्वनि प्रभाव',

    // Landing Page
    'landing.badge': 'विश्व स्तरीय रोमांटिक लाइव स्ट्रीमिंग और वॉयस लाउंज',
    'landing.title1': 'सीमाओं के बिना',
    'landing.title2': 'प्यार और मस्ती',
    'landing.title3': 'का अनुभव करें',
    'landing.subtitle': 'रीयल-टाइम बहुभाषी एआई अनुवाद के साथ 1v1 एचडी वीडियो कॉल से जुड़ें, 12-सीट पार्टी वॉयस रूम में शामिल हों और रोमांचक गेम खेलें।',
    'landing.joinBtn': 'अभी जुड़ें / लॉगिन करें',
    'landing.enterRoom': 'लाइव स्ट्रीम देखें',
    'landing.statUsers': 'दैनिक सक्रिय उपयोगकर्ता',
    'landing.statHosts': 'सत्यापित लाइव होस्ट',
    'landing.statPurity': 'सुरक्षित और एन्क्रिप्टेड',
    'landing.prop1Title': 'लाइव 1v1 रोमांटिक वीडियो',
    'landing.prop1Desc': 'रीयल-टाइम एआई ऑटो-अनुवाद और वाउचर के साथ स्पष्ट 1v1 निजी वीडियो कॉल।',
    'landing.prop2Title': '12-सीट पार्टी रूम',
    'landing.prop2Desc': '12-सीट इंटरैक्टिव माइक ग्रिड, डीजे साउंडबोर्ड, वर्चुअल उपहार और मजेदार गेम्स।',
    'landing.prop3Title': 'इन-रूम मिनी गेम्स',
    'landing.prop3Desc': '30 सेकंड की कार रेसिंग, 777 मेगा जैकपॉट स्लॉट और लाइव विजेता पुरस्कार।',
    'landing.prop4Title': 'मोमेंट्स सोशल फीड',
    'landing.prop4Desc': 'सत्यापित क्रिएटर्स की कहानियां, खूबसूरत तस्वीरें और वॉयस नोट्स देखें।',

    // Agent Promotion Module
    'agent.bannerBadge': 'आधिकारिक एजेंट कार्यक्रम',
    'agent.bannerTitle': 'एक आधिकारिक एजेंट बनें और शानदार कमाई करें',
    'agent.bannerDesc': 'प्रत्येक कॉइन टॉप-अप पर 10% तक कमीशन कमाएं! होस्ट भर्ती बोनस और साप्ताहिक प्रत्यक्ष बैंक भुगतान।',
    'agent.profitTitle': 'कॉइन टॉप-अप पर 10% तक कमीशन कमाएं!',
    'agent.profitDesc': 'उद्योग में सबसे अधिक कमीशन दर और गारंटीकृत त्वरित बैंक भुगतान।',
    'agent.commissionRate': '10% तक कमीशन कमाएं',
    'agent.tier1': 'टियर 1: 5% कमीशन (1,000 - 50,000 सिक्के)',
    'agent.tier2': 'टियर 2: 8% कमीशन (50,001 - 200,000 सिक्के)',
    'agent.tier3': 'डायमंड एजेंट: 10% कमीशन (200,000+ सिक्के)',
    'agent.tier1Title': 'टियर 1 • 1K - 50K सिक्के',
    'agent.tier1Rate': '5% कमीशन',
    'agent.tier2Title': 'टियर 2 • 50K - 200K सिक्के',
    'agent.tier2Rate': '8% कमीशन',
    'agent.tier3Title': 'डायमंड एजेंट • 200K+ सिक्के',
    'agent.tier3Rate': '10% कमीशन',
    'agent.benefit1': 'डायरेक्ट होस्ट भर्ती पर उच्च प्रोत्साहन',
    'agent.benefit2': 'साप्ताहिक त्वरित निपटान और बैंक ट्रांसफर',
    'agent.benefit3': '24/7 समर्पित सुपर एडमिन सहायता प्रबंधक',
    'agent.benefit4': 'सत्यापित एजेंसी पोर्टल और कस्टम रेफरल लिंक',
    'agent.badgeVerified': 'आधिकारिक सत्यापित एजेंट बैज और पोर्टल',
    'agent.contactAdminBtn': 'अभी आवेदन करें / एडमिन से संपर्क करें',
    'agent.shareBtn': 'ऐप शेयर करें और कमाएं',
    'agent.simulatorTitle': 'कमीशन कमाई कैलकुलेटर',
    'agent.simulatorSub': 'अपने मासिक एजेंट मुनाफे का अनुमान लगाएं',
    'agent.simulatorSpendLabel': 'मासिक टॉप-अप वॉल्यूम',
    'agent.simulatorEarnLabel': 'आपका अनुमानित लाभ',
    'agent.spendTriggerTitle': 'वीआईपी एजेंट अवसर अनलॉक! 🚀',
    'agent.spendTriggerSubtitle': 'आपने Amorex में सिक्के खर्च किए! सिर्फ खर्च क्यों करें जब आप कमा सकते हैं?',
    'agent.spendTriggerDesc': 'सक्रिय पावर यूजर के रूप में, आप आधिकारिक एजेंट बनने के पात्र हैं। प्रत्येक कॉइन टॉप-अप पर 10% तक कमीशन और होस्ट भर्ती नकद बोनस कमाएं!',
    'agent.getStartedBtn': 'शुरू करें / सुपर एडमिन से संपर्क करें',
    'agent.maybeLater': 'शायद बाद में',
    'agent.applySuccess': 'सुपर एडमिन को संदेश भेजा गया! सपोर्ट टीम जल्द संपर्क करेगी।',

    // Dynamic App Share
    'share.title': 'Amorex शेयर करें और 10% कमीशन कमाएं',
    'share.subtitle': 'दोस्तों को आमंत्रित करें, एजेंसी बनाएं और असली कमीशन कमाएं!',
    'share.shareText': 'Amorex से जुड़ें! एक आधिकारिक एजेंट बनें और कॉइन टॉप-अप पर 10% तक कमीशन कमाएं। जुड़ने के लिए यहां क्लिक करें: {link}',
    'share.copySuccess': 'शेयर संदेश और लिंक क्लिपबोर्ड पर कॉपी किया गया!',
    'share.copyBtn': 'संदेश और लिंक कॉपी करें',
    'share.whatsappBtn': 'व्हाट्सएप',
    'share.telegramBtn': 'टेलीग्राम',
    'share.twitterBtn': 'एक्स (ट्विटर)',
    'share.nativeShareBtn': 'ऐप शेयर करें',
    'share.shortBtn': 'शेयर और कमाएं',
    'share.btnTitle': 'Amorex शेयर करें और 10% कमीशन कमाएं',

    // Messages & Chat
    'messages.title': 'संदेश और कॉल',
    'messages.searchPlaceholder': 'चैट या होस्ट खोजें...',
    'messages.tabChats': 'चैट',
    'messages.tabCalls': 'कॉल इतिहास',
    'messages.tabContacts': 'संपर्क',
    'messages.inputPlaceholder': 'रोमांटिक संदेश भेजें या मीडिया संलग्न करें...',
    'messages.callCost': '240 सिक्के / मिनट',
    'messages.autoTranslateOn': 'ऑटो-अनुवाद सक्रिय है',
    'messages.autoTranslateSub': 'संदेश आपकी भाषा में स्वचालित रूप से अनुवादित होते हैं',
    'messages.callAgain': 'फिर से कॉल करें',
    'messages.mediaAttach': 'मीडिया जोड़ें',

    // Party Tab
    'party.roomTitle': '12-सीट वीआईपी पार्टी लाउंज',
    'party.grabMic': 'माइक सीट लें',
    'party.sendGift': 'उपहार भेजें',
    'party.games': 'मिनी गेम्स',
    'party.topGifters': 'शीर्ष उपहारदाता',
    'party.chatPlaceholder': 'पार्टी में कुछ कहें...',
    'party.autoTranslating': 'पार्टी चैट का हिंदी में अनुवाद किया गया',

    // Profile & Settings
    'profile.title': 'मेरी प्रोफाइल',
    'profile.editProfile': 'प्रोफाइल संपादित करें',
    'profile.goldCoinDetails': 'स्वर्ण सिक्के विवरण',
    'profile.cpSpace': 'सीपी स्पेस',
    'profile.dailyTasks': 'दैनिक कार्य',
    'profile.backpack': 'बैकपैक',
    'profile.settings': 'सेटिंग्स',
    'profile.privacyPolicy': 'गोपनीयता और सुरक्षा नीति',
    'profile.language': 'भाषा चुनें',
    'profile.logout': 'लॉग आउट करें',
    'profile.supportBot': '24/7 एआई ग्राहक सहायता',
    'profile.callRecords': '1v1 कॉल रिकॉर्ड'
  },

  ar: {
    // Navigation & General
    'nav.live': 'مباشر',
    'nav_live': 'مباشر',
    'nav.party': 'الحفلة',
    'nav_party': 'الحفلة',
    'nav.moments': 'لحظات',
    'nav_moments': 'لحظات',
    'nav.chat': 'دردشة',
    'nav_chat': 'دردشة',
    'nav.messages': 'دردشة',
    'nav_messages': 'دردشة',
    'nav.profile': 'الملف الشخصي',
    'nav_profile': 'الملف الشخصي',
    'common.coins': 'العملات',
    'common.diamonds': 'الماس',
    'common.recharge': 'شحن الرصيد',
    'common.vip': 'VIP',
    'common.admin': 'المشرف',
    'common.superAdmin': 'المشرف العام',
    'common.applyNow': 'قدم الآن / تواصل مع الإدارة',
    'common.apply': 'قدم الآن',
    'common.close': 'إغلاق',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.save': 'حفظ التغييرات',
    'common.translated': 'مترجم',
    'common.showOriginal': 'عرض النص الأصلي',
    'common.showTranslated': 'عرض الترجمة',
    'common.online': 'متصل',
    'common.copied': 'تم النسخ إلى الحافظة!',
    'common.install': 'تثبيت التطبيق',
    'common.sound': 'المؤثرات الصوتية',

    // Landing Page
    'landing.badge': 'منصة البث المباشر وغرف الدردشة الصوتية العالمية',
    'landing.title1': 'عش تجربة',
    'landing.title2': 'الحب والمرح',
    'landing.title3': 'بلا حدود',
    'landing.subtitle': 'تواصل عبر مكالمات فيديو 1v1 فائقة الوضوح مع ترجمة فورية بالذكاء الاصطناعي، وانضم إلى غرف الحفلات الصوتية المكونة من 12 مقعداً.',
    'landing.joinBtn': 'انضم الآن / تسجيل الدخول',
    'landing.enterRoom': 'استكشف البث المباشر',
    'landing.statUsers': 'مستخدم نشط يومياً',
    'landing.statHosts': 'مضيف موثق',
    'landing.statPurity': 'آمن ومشفر تماماً',
    'landing.prop1Title': 'مكالمات فيديو 1v1 رومانسية',
    'landing.prop1Desc': 'مكالمات فيديو خاصة فائقة الوضوح مع ترجمة فورية متعددة اللغات بالذكاء الاصطناعي.',
    'landing.prop2Title': 'غرف حفلات 12 مقعداً',
    'landing.prop2Desc': 'شبكة ميكروفونات تفاعلية من 12 مقعداً مع لوحة أصوات وهدايا افتراضية.',
    'landing.prop3Title': 'ألعاب مصغرة داخل الغرف',
    'landing.prop3Desc': 'سباق سيارات سريع، وماكينات سلوتس 777 بجوائز كبرى وتنبيهات فورية للفائزين.',
    'landing.prop4Title': 'خلاصة اللحظات الاجتماعية',
    'landing.prop4Desc': 'استكشف قصص وصور ورسائل صوتية من صناع المحتوى الموثقين.',

    // Agent Promotion Module
    'agent.bannerBadge': 'برنامج الوكلاء الرسمي',
    'agent.bannerTitle': 'كن وكيلاً رسمياً واربح دخلاً استثنائياً',
    'agent.bannerDesc': 'احصل على عمولة تصل إلى 10% على كل عملية شحن عملات يقوم بها المستخدمون، ومكافآت توظيف المضيفين مع تحويلات بنكية أسبوعية.',
    'agent.profitTitle': 'اربح عمولة تصل إلى 10% على شحن العملات!',
    'agent.profitDesc': 'أعلى نسبة عمولة في هذا المجال مع تسويات بنكية أسبوعية مضمونة.',
    'agent.commissionRate': 'عمولة تصل إلى 10%',
    'agent.tier1': 'المستوى 1: عمولة 5% (1,000 - 50,000 عملة)',
    'agent.tier2': 'المستوى 2: عمولة 8% (50,001 - 200,000 عملة)',
    'agent.tier3': 'وكيل ماسي: عمولة 10% (أكثر من 200,000 عملة)',
    'agent.tier1Title': 'المستوى 1 • 1K - 50K عملة',
    'agent.tier1Rate': 'عمولة 5%',
    'agent.tier2Title': 'المستوى 2 • 50K - 200K عملة',
    'agent.tier2Rate': 'عمولة 8%',
    'agent.tier3Title': 'وكيل ماسي • 200K+ عملة',
    'agent.tier3Rate': 'عمولة 10%',
    'agent.benefit1': 'مكافآت مجزية لتوظيف واستقطاب المضيفين',
    'agent.benefit2': 'تسويات أسبوعية فورية وتحويل بنكي مباشر',
    'agent.benefit3': 'مدير دعم مخصص من الإدارة العليا على مدار الساعة',
    'agent.benefit4': 'بوابة وكالة موثقة ورابط إحالة خاص',
    'agent.badgeVerified': 'شارة وكيل موثق رسمية وبوابة خاصة',
    'agent.contactAdminBtn': 'قدم الآن / تواصل مع الإدارة',
    'agent.shareBtn': 'شارك التطبيق واربح',
    'agent.simulatorTitle': 'حاسبة أرباح العمولة',
    'agent.simulatorSub': 'احسب أرباحك الشهرية المتوقعة كوكيل',
    'agent.simulatorSpendLabel': 'حجم شحن العملات الشهري',
    'agent.simulatorEarnLabel': 'صافي أرباحك المقدرة',
    'agent.spendTriggerTitle': 'تم فتح فرصة الوكيل المميز VIP! 🚀',
    'agent.spendTriggerSubtitle': 'لقد أنفقت عملات في Amorex! لماذا تكتفي بالإنفاق بينما يمكنك أن تكسب أرباحاً هائلة؟',
    'agent.spendTriggerDesc': 'بصفتك مستخدماً نشطاً، أنت مؤهل لبرنامج الوكلاء الرسمي. احصل على عمولة تصل إلى 10% على كل عملية شحن عملات يقوم بها المستخدمون، بالإضافة إلى مكافآت استقطاب المضيفين!',
    'agent.getStartedBtn': 'ابدأ الآن / تواصل مع الإدارة العليا',
    'agent.maybeLater': 'ربما لاحقاً',
    'agent.applySuccess': 'تم توجيه طلبك للإدارة العليا! سيتواصل معك الدعم قريباً.',

    // Dynamic App Share
    'share.title': 'شارك Amorex واربح عمولة 10%',
    'share.subtitle': 'ادعُ أصدقاءك وابنِ وكالتك واحصل على عمولات حقيقية!',
    'share.shareText': 'انضم إلى Amorex! كن وكيلاً رسمياً واربح عمولة تصل إلى 10% على شحن العملات. اضغط هنا للانضمام: {link}',
    'share.copySuccess': 'تم نسخ نص المشاركة والرابط إلى الحافظة!',
    'share.copyBtn': 'نسخ الرسالة والرابط',
    'share.whatsappBtn': 'واتساب',
    'share.telegramBtn': 'تيليجرام',
    'share.twitterBtn': 'إكس (تويتر)',
    'share.nativeShareBtn': 'مشاركة التطبيق',
    'share.shortBtn': 'شارك واربح',
    'share.btnTitle': 'شارك Amorex واربح عمولة 10%',

    // Messages & Chat
    'messages.title': 'الرسائل والمكالمات',
    'messages.searchPlaceholder': 'بحث في المحادثات وجهات الاتصال...',
    'messages.tabChats': 'الدردشات',
    'messages.tabCalls': 'سجل المكالمات',
    'messages.tabContacts': 'جهات الاتصال',
    'messages.inputPlaceholder': 'أرسل رسالة رومانسية أو أرفق وسائط...',
    'messages.callCost': '240 عملة / دقيقة',
    'messages.autoTranslateOn': 'الترجمة التلقائية نشطة',
    'messages.autoTranslateSub': 'تترجم الرسائل تلقائياً إلى لغتك المفضلة',
    'messages.callAgain': 'معاودة الاتصال',
    'messages.mediaAttach': 'إرفاق وسائط',

    // Party Tab
    'party.roomTitle': 'صالة كبار الشخصيات VIP (12 مقعداً)',
    'party.grabMic': 'احجز مقعد المايك',
    'party.sendGift': 'إرسال هدية',
    'party.games': 'ألعاب مصغرة',
    'party.topGifters': 'كبار الداعمين',
    'party.chatPlaceholder': 'شارك بالحديث في الحفلة...',
    'party.autoTranslating': 'تمت ترجمة محادثة الحفلة إلى العربية',

    // Profile & Settings
    'profile.title': 'الملف الشخصي',
    'profile.editProfile': 'تعديل الملف الشخصي',
    'profile.goldCoinDetails': 'تفاصيل العملات الذهبية',
    'profile.cpSpace': 'مساحة الشريك CP',
    'profile.dailyTasks': 'المهام اليومية',
    'profile.backpack': 'الحقيبة',
    'profile.settings': 'الإعدادات',
    'profile.privacyPolicy': 'سياسة الخصوصية والأمان',
    'profile.language': 'اختر اللغة',
    'profile.logout': 'تسجيل الخروج',
    'profile.supportBot': 'دعم العملاء الذكي 24/7',
    'profile.callRecords': 'سجلات مكالمات 1v1'
  },

  ta: {
    // Navigation & General
    'nav.live': 'லைவ்',
    'nav_live': 'லைவ்',
    'nav.party': 'பார்ட்டி',
    'nav_party': 'பார்ட்டி',
    'nav.moments': 'நினைவுகள்',
    'nav_moments': 'நினைவுகள்',
    'nav.chat': 'அரட்டை',
    'nav_chat': 'அரட்டை',
    'nav.messages': 'அரட்டை',
    'nav_messages': 'அரட்டை',
    'nav.profile': 'சுயவிவரம்',
    'nav_profile': 'சுயவிவரம்',
    'common.coins': 'நாணயங்கள்',
    'common.diamonds': 'வைரங்கள்',
    'common.recharge': 'ரீசார்ஜ்',
    'common.vip': 'விஐபி',
    'common.admin': 'நிர்வாகி',
    'common.superAdmin': 'சூப்பர் அட்மின்',
    'common.applyNow': 'இப்போதே விண்ணப்பிக்கவும் / அட்மினைத் தொடர்பு கொள்ளவும்',
    'common.apply': 'விண்ணப்பிக்கவும்',
    'common.close': 'மூடு',
    'common.cancel': 'ரத்துசெய்',
    'common.confirm': 'உறுதிசெய்',
    'common.save': 'மாற்றங்களைச் சேமிக்கவும்',
    'common.translated': 'மொழிபெயர்க்கப்பட்டது',
    'common.showOriginal': 'அசல் செய்தியைக் காட்டு',
    'common.showTranslated': 'மொழிபெயர்ப்பைக் காட்டு',
    'common.online': 'ஆன்லைன்',
    'common.copied': 'கிளிப்போர்டில் நகலெடுக்கப்பட்டது!',
    'common.install': 'செயலியை நிறுவுங்கள்',
    'common.sound': 'ஒலி விளைவுகள்',

    // Landing Page
    'landing.badge': 'உலகத்தரம் வாய்ந்த ரொமாண்டிக் லைவ் ஸ்ட்ரீமிங் & குரல் லவுஞ்ச்கள்',
    'landing.title1': 'எல்லைகள் இல்லா',
    'landing.title2': 'அன்பும் மகிழ்ச்சியும்',
    'landing.title3': 'இப்போதே அனுபவியுங்கள்',
    'landing.subtitle': 'நிகழ்நேர பன்மொழி AI மொழிபெயர்ப்புடன் 1v1 HD வீடியோ அழைப்புகளில் இணையுங்கள், 12 இருக்கை பார்ட்டி அறைகளில் மகிழுங்கள்.',
    'landing.joinBtn': 'இப்போதே இணையுங்கள் / உள்நுழையுங்கள்',
    'landing.enterRoom': 'லைவ் ஸ்ட்ரீம்களைப் பார்க்கவும்',
    'landing.statUsers': 'தினசரி செயலில் உள்ள பயனர்கள்',
    'landing.statHosts': 'சரிபார்க்கப்பட்ட ஹோஸ்ட்கள்',
    'landing.statPurity': 'பாதுகாப்பானது & மறைகுறியாக்கப்பட்டது',
    'landing.prop1Title': 'லைவ் 1v1 காதல் வீடியோ',
    'landing.prop1Desc': 'நிகழ்நேர AI மொழிபெயர்ப்புடன் கூடிய படிகத் தெளிவான 1v1 தனிப்பட்ட வீடியோ அழைப்புகள்.',
    'landing.prop2Title': '12 இருக்கை பார்ட்டி அறைகள்',
    'landing.prop2Desc': '12 இருக்கை மைக் கிரிட், டிஜே சவுண்ட்போர்டு மற்றும் மெய்நிகர் பரிசுகள்.',
    'landing.prop3Title': 'மினி கேம்ஸ்',
    'landing.prop3Desc': '30 வினாடி கார் பந்தயம், 777 மெகா ஜாக்பாட் ஸ்லாட்டுகள் மற்றும் உடனடி பரிசுகள்.',
    'landing.prop4Title': 'நினைவுகள் சமூக ஊட்டம்',
    'landing.prop4Desc': 'கிரியேட்டர்களின் புகைப்படங்கள், கதைகள் மற்றும் குரல் குறிப்புகளைப் பாருங்கள்.',

    // Agent Promotion Module
    'agent.bannerBadge': 'அதிகாரப்பூர்வ ஏஜென்ட் திட்டம்',
    'agent.bannerTitle': 'அதிகாரப்பூர்வ ஏஜென்ட்டாகி சிறந்த வருமானம் ஈட்டுங்கள்',
    'agent.bannerDesc': 'பயனர்களின் ஒவ்வொரு நாணய டாப்-அப்பிலும் 10% வரை கமிஷன் பெறுங்கள்! ஹோஸ்ட் சேர்ப்பு போனஸ் மற்றும் வாராந்திர நேரடி வங்கி பரிமாற்றம்.',
    'agent.profitTitle': 'நாணய டாப்-அப்களில் 10% வரை கமிஷன் ஈட்டுங்கள்!',
    'agent.profitDesc': 'உறுதிசெய்யப்பட்ட உடனடி வாராந்திர வங்கி பரிமாற்றத்துடன் அதிகபட்ச கமிஷன்.',
    'agent.commissionRate': '10% வரை கமிஷன் ஈட்டுங்கள்',
    'agent.tier1': 'நிலை 1: 5% கமிஷன் (1,000 - 50,000 நாணயங்கள்)',
    'agent.tier2': 'நிலை 2: 8% கமிஷன் (50,001 - 200,000 நாணயங்கள்)',
    'agent.tier3': 'டயமண்ட் ஏஜென்ட்: 10% கமிஷன் (200,000+ நாணயங்கள்)',
    'agent.tier1Title': 'நிலை 1 • 1K - 50K நாணயங்கள்',
    'agent.tier1Rate': '5% கமிஷன்',
    'agent.tier2Title': 'நிலை 2 • 50K - 200K நாணயங்கள்',
    'agent.tier2Rate': '8% கமிஷன்',
    'agent.tier3Title': 'டயமண்ட் ஏஜென்ட் • 200K+ நாணயங்கள்',
    'agent.tier3Rate': '10% கமிஷன்',
    'agent.benefit1': 'நேரடி ஹோஸ்ட் சேர்ப்புக்கான சிறப்பான போனஸ்கள்',
    'agent.benefit2': 'உடனடி வாராந்திர தீர்வு மற்றும் நேரடி வங்கி பரிமாற்றம்',
    'agent.benefit3': '24/7 அர்ப்பணிக்கப்பட்ட சூப்பர் அட்மின் ஆதரவு மேலாளர்',
    'agent.benefit4': 'சரிபார்க்கப்பட்ட ஏஜென்சி போர்டல் & பிரத்யேக பரிந்துரை இணைப்பு',
    'agent.badgeVerified': 'அதிகாரப்பூர்வ சரிபார்க்கப்பட்ட ஏஜென்ட் பேட்ஜ் & போர்டல்',
    'agent.contactAdminBtn': 'இப்போதே விண்ணப்பிக்கவும் / அட்மினைத் தொடர்பு கொள்ளவும்',
    'agent.shareBtn': 'செயலியைப் பகிருங்கள், சம்பாதியுங்கள்',
    'agent.simulatorTitle': 'கமிஷன் வருமான கால்குலேட்டர்',
    'agent.simulatorSub': 'உங்கள் மாதாந்திர ஏஜென்ட் லாபத்தைக் கணக்கிடுங்கள்',
    'agent.simulatorSpendLabel': 'மாதாந்திர டாப்-அப் அளவு',
    'agent.simulatorEarnLabel': 'உங்கள் உத்தேச லாபம்',
    'agent.spendTriggerTitle': 'விஐபி ஏஜென்ட் வாய்ப்பு திறக்கப்பட்டது! 🚀',
    'agent.spendTriggerSubtitle': 'நீங்கள் நாணயங்களை செலவழித்துள்ளீர்கள்! செலவழிப்பது மட்டுமல்லாமல், வருமானமும் ஈட்டுங்கள்!',
    'agent.spendTriggerDesc': 'Amorex-ன் செயலில் உள்ள பயனர் என்ற முறையில் அதிகாரப்பூர்வ ஏஜென்ட்டாகும் தகுதி உங்களுக்கு உண்டு. ஒவ்வொரு டாப்-அப்பிலும் 10% வரை கமிஷன் மற்றும் ஹோஸ்ட் சேர்ப்பு போனஸ்களைப் பெறுங்கள்!',
    'agent.getStartedBtn': 'தொடங்கலாம் / சூப்பர் அட்மினுடன் பேசுங்கள்',
    'agent.maybeLater': 'பிறகு பார்க்கலாம்',
    'agent.applySuccess': 'சூப்பர் அட்மினுக்கு தகவல் அனுப்பப்பட்டது! ஆதரவு குழு விரைவில் தொடர்பு கொள்ளும்.',

    // Dynamic App Share
    'share.title': 'Amorex-ஐப் பகிருங்கள், 10% கமிஷன் பெறுங்கள்',
    'share.subtitle': 'நண்பர்களை அழையுங்கள், ஏஜென்சியை உருவாக்குங்கள், உண்மையான கமிஷன்களைப் பெறுங்கள்!',
    'share.shareText': 'Amorex-ல் இணையுங்கள்! அதிகாரப்பூர்வ ஏஜென்ட்டாகி நாணய டாப்-அப்களில் 10% வரை கமிஷன் பெறுங்கள். இணைய இங்கே கிளிக் செய்க: {link}',
    'share.copySuccess': 'செய்தியும் இணைப்பும் கிளிப்போர்டில் நகலெடுக்கப்பட்டது!',
    'share.copyBtn': 'செய்தி மற்றும் இணைப்பை நகலெடுக்கவும்',
    'share.whatsappBtn': 'வாட்ஸ்அப்',
    'share.telegramBtn': 'டெலிகிராம்',
    'share.twitterBtn': 'எக்ஸ் (ட்விட்டர்)',
    'share.nativeShareBtn': 'செயலியைப் பகிரவும்',
    'share.shortBtn': 'பகிர்ந்து சம்பாதிக்கவும்',
    'share.btnTitle': 'Amorex-ஐப் பகிர்ந்து 10% கமிஷன் பெறுங்கள்',

    // Messages & Chat
    'messages.title': 'செய்திகள் & அழைப்புகள்',
    'messages.searchPlaceholder': 'அரட்டைகள், தொடர்புகளைத் தேடுங்கள்...',
    'messages.tabChats': 'அரட்டைகள்',
    'messages.tabCalls': 'அழைப்பு வரலாறு',
    'messages.tabContacts': 'தொடர்புகள்',
    'messages.inputPlaceholder': 'காதல் செய்தியை அனுப்புங்கள் அல்லது மீடியாவை இணைக்கவும்...',
    'messages.callCost': '240 நாணயங்கள் / நிமிடம்',
    'messages.autoTranslateOn': 'தானியங்கி மொழிபெயர்ப்பு செயலில் உள்ளது',
    'messages.autoTranslateSub': 'செய்திகள் தானாக உங்கள் தாய்மொழியில் மொழிபெயர்க்கப்படும்',
    'messages.callAgain': 'மீண்டும் அழைக்கவும்',
    'messages.mediaAttach': 'மீடியா இணைக்கவும்',

    // Party Tab
    'party.roomTitle': '12 இருக்கை விஐபி பார்ட்டி லவுஞ்ச்',
    'party.grabMic': 'மைக் இருக்கையைப் பெறுங்கள்',
    'party.sendGift': 'பரிசு அனுப்புங்கள்',
    'party.games': 'மினி கேம்ஸ்',
    'party.topGifters': 'சிறந்த நன்கொடையாளர்கள்',
    'party.chatPlaceholder': 'பார்ட்டியில் அன்புடன் பேசவும்...',
    'party.autoTranslating': 'பார்ட்டி அரட்டை தமிழில் மொழிபெயர்க்கப்பட்டது',

    // Profile & Settings
    'profile.title': 'என் சுயவிவரம்',
    'profile.editProfile': 'சுயவிவரத்தைத் திருத்து',
    'profile.goldCoinDetails': 'தங்க நாணய விவரங்கள்',
    'profile.cpSpace': 'சிபி ஸ்பேஸ்',
    'profile.dailyTasks': 'தினசரி பணிகள்',
    'profile.backpack': 'பேக்பேக்',
    'profile.settings': 'அமைப்புகள்',
    'profile.privacyPolicy': 'தனியுரிமை & பாதுகாப்பு கொள்கை',
    'profile.language': 'மொழியைத் தேர்ந்தெடுக்கவும்',
    'profile.logout': 'வெளியேறு',
    'profile.supportBot': '24/7 AI வாடிக்கையாளர் சேவை',
    'profile.callRecords': '1v1 அழைப்புப் பதிவுகள்'
  }
};

const CLEAN_FALLBACKS: Record<string, string> = {
  'nav.live': 'Live',
  'nav_live': 'Live',
  'nav.moments': 'Moments',
  'nav_moments': 'Moments',
  'nav.party': 'Party',
  'nav_party': 'Party',
  'nav.chat': 'Chat',
  'nav_chat': 'Chat',
  'nav.messages': 'Chat',
  'nav_messages': 'Chat',
  'nav.profile': 'Profile',
  'nav_profile': 'Profile'
};

/**
 * Universal Translation Helper Function with Parameter Interpolation
 */
export const t = (key: string, customLang?: AppLanguage, params?: Record<string, string | number>): string => {
  const activeLang = customLang || getAppLanguage();
  let result = '';
  if (TRANSLATIONS[activeLang] && TRANSLATIONS[activeLang][key]) {
    result = TRANSLATIONS[activeLang][key];
  } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
    result = TRANSLATIONS.en[key];
  } else if (CLEAN_FALLBACKS[key]) {
    result = CLEAN_FALLBACKS[key];
  } else {
    result = key;
  }

  if (params && typeof result === 'string') {
    Object.entries(params).forEach(([pKey, pVal]) => {
      result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    });
  }

  return result;
};
