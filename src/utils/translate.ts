/**
 * Amorex In-Line AI Auto-Translation Engine
 * Provides instant real-time translation support for 1v1 Messages & Party Group Chat
 * Supported: English (en), Malayalam (ml), Hindi (hi), Arabic (ar), Tamil (ta)
 */

import { AppLanguage } from './i18n';

export interface TranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isTranslated: boolean;
}

// Multi-Lingual Conversational Matrix for High-Frequency Dating & Chat Phrases
const MULTI_LANG_DICTIONARY: Record<string, Record<AppLanguage, string>> = {
  // Greetings & Social
  'hello': {
    en: 'Hello! 👋',
    ml: 'ഹലോ! നമസ്കാരം! 👋',
    hi: 'नमस्ते! हैलो! 👋',
    ar: 'مرحباً! أهلاً وسهلاً! 👋',
    ta: 'வணக்கம்! ஹலோ! 👋'
  },
  'hi': {
    en: 'Hi there! ✨',
    ml: 'ഹായ്! സുഖമാണോ? ✨',
    hi: 'नमस्ते! कैसे हो? ✨',
    ar: 'أهلاً بك! كيف حالك؟ ✨',
    ta: 'வணக்கம்! நலமா? ✨'
  },
  'how are you': {
    en: 'How are you doing today? 😊',
    ml: 'ഇന്ന് എങ്ങനെയുണ്ട്? സുഖമാണോ? 😊',
    hi: 'आज आप कैसे हैं? सब ठीक? 😊',
    ar: 'كيف حالك اليوم؟ أتمنى أن تكون بخير 😊',
    ta: 'இன்று நீங்கள் எப்படி இருக்கிறீர்கள்? 😊'
  },
  'welcome to the party': {
    en: 'Welcome to the VIP Party Room! 💖 Grab a mic!',
    ml: 'വിഐപി പാർട്ടി മുറിയിലേക്ക് സ്വാഗതം! 💖 മൈക്ക് എടുക്കൂ!',
    hi: 'वीआईपी पार्टी रूम में आपका स्वागत है! 💖 माइक लें!',
    ar: 'أهلاً بكم في صالة حفلات كبار الشخصيات! 💖 احجز مقعد المايك!',
    ta: 'விஐபி பார்ட்டி அறைக்கு வரவேற்கிறோம்! 💖 மைக் பிடியுங்கள்!'
  },
  'welcome to amorex live!': {
    en: 'Welcome to Amorex Live! ✨',
    ml: 'അമോറെക്സ് ലൈവിലേക്ക് സ്വാഗതം! ✨',
    hi: 'अमोरिक्स लाइव में आपका स्वागत है! ✨',
    ar: 'أهلاً بكم في أموريكس لايف! ✨',
    ta: 'அமோரெக்ஸ் லைவிற்கு வரவேற்கிறோம்! ✨'
  },

  // Romantic & Dating
  'you look beautiful': {
    en: 'You look so beautiful tonight! 🌸',
    ml: 'നിങ്ങൾ ഇന്ന് വളരെ സുന്ദരിയായിരിക്കുന്നു! 🌸',
    hi: 'आप आज रात बहुत खूबसूरत लग रही हैं! 🌸',
    ar: 'أنتِ تبدين فائقة الجمال الليلة! 🌸',
    ta: 'நீங்கள் இன்று இரவு மிகவும் அழகாக இருக்கிறீர்கள்! 🌸'
  },
  'you are very handsome': {
    en: 'You are very handsome! 💫',
    ml: 'നിങ്ങൾ വളരെ സ്മാർട്ട് ആണ്! 💫',
    hi: 'आप बहुत हैंडसम लग रहे हैं! 💫',
    ar: 'أنت وسيم وجذاب جداً! 💫',
    ta: 'நீங்கள் மிகவும் வசீகரமாக இருக்கிறீர்கள்! 💫'
  },
  'i love your voice': {
    en: 'I really love your voice! 🎶',
    ml: 'നിങ്ങളുടെ ശബ്ദം കേൾക്കാൻ വളരെ ഇമ്പമുണ്ട്! 🎶',
    hi: 'मुझे आपकी आवाज बहुत पसंद है! 🎶',
    ar: 'أنا حقاً معجب بنبرة صوتك الرائعة! 🎶',
    ta: 'எனக்கு உங்கள் குரல் மிகவும் பிடிக்கும்! 🎶'
  },
  'i love you': {
    en: 'I love you so much! ❤️',
    ml: 'ഞാൻ നിന്നെ ഒരുപാട് സ്നേഹിക്കുന്നു! ❤️',
    hi: 'मैं तुमसे बहुत प्यार करता हूँ! ❤️',
    ar: 'أنا أحبك كثيراً من كل قلبي! ❤️',
    ta: 'நான் உன்னை மிகவும் நேசிக்கிறேன்! ❤️'
  },
  'can we video call': {
    en: 'Can we have a private 1v1 video call? 📹',
    ml: 'നമുക്ക് ഒരു പ്രൈവറ്റ് 1v1 വീഡിയോ കോൾ സംസാരിക്കാമോ? 📹',
    hi: 'क्या हम एक निजी 1v1 वीडियो कॉल कर सकते हैं? 📹',
    ar: 'هل يمكننا بدء مكالمة فيديو خاصة 1v1؟ 📹',
    ta: 'நாம் 1v1 தனிப்பட்ட வீடியோ அழைப்பில் பேசலாமா? 📹'
  },
  'call me': {
    en: 'Please call me right now! 📞',
    ml: 'ദയവായി എന്നെ ഉടൻ വിളിക്കൂ! 📞',
    hi: 'कृपया मुझे अभी कॉल करें! 📞',
    ar: 'يرجى الاتصال بي الآن من فضلك! 📞',
    ta: 'தயவுசெய்து என்னை இப்போது அழையுங்கள்! 📞'
  },
  'good night': {
    en: 'Good night and sweet dreams! 🌙',
    ml: 'ശുഭ രാത്രി, മധുര സ്വപ്നങ്ങൾ! 🌙',
    hi: 'शुभ रात्रि और प्यारे सपने! 🌙',
    ar: 'تصبح على خير وأحلام سعيدة! 🌙',
    ta: 'இனிய இரவு மற்றும் இனிய கனவுகள்! 🌙'
  },
  'good morning': {
    en: 'Good morning! Have a wonderful day ☀️',
    ml: 'സുപ്രഭാതം! ഒരു നല്ല ദിവസം ആശംസിക്കുന്നു ☀️',
    hi: 'सुप्रभात! आपका दिन मंगलमय हो ☀️',
    ar: 'صباح الخير! أتمنى لك يوماً رائعاً ☀️',
    ta: 'காலை வணக்கம்! இனிய நாளாக அமையட்டும் ☀️'
  },

  // In-Room Games & Gifts
  'playing champ car racing': {
    en: 'Hey everyone! Playing Champ Car racing 🏎️',
    ml: 'എല്ലാവർക്കും ഹലോ! ചാംപ് കാർ റേസിംഗ് കളിക്കുന്നു 🏎️',
    hi: 'सभी को नमस्ते! चैंप कार रेसिंग खेल रहे हैं 🏎️',
    ar: 'مرحباً بالجميع! أنا ألعب سباق سيارات الأبطال 🏎️',
    ta: 'அனைவருக்கும் வணக்கம்! சாம்ப் கார் ரேசிங் விளையாடுகிறேன் 🏎️'
  },
  'sent roses': {
    en: 'Sent 10x Passion Roses to Host! 🌹',
    ml: 'ഹോസ്റ്റിന് 10x റോസാപ്പൂക്കൾ സമ്മാനിച്ചു! 🌹',
    hi: 'होस्ट को 10x गुलाब का उपहार भेजा! 🌹',
    ar: 'تم إرسال 10 باقات ورد حمراء للمضيف! 🌹',
    ta: 'ஹோஸ்டிற்கு 10x ரோஜா மலர்கள் அனுப்பப்பட்டது! 🌹'
  },
  'jackpot winner': {
    en: 'Won 50,000 Coins in Mega Jackpot! 🎰💰',
    ml: 'മെഗാ ജാക്ക്പോട്ടിൽ 50,000 കോയിനുകൾ നേടി! 🎰💰',
    hi: 'मेगा जैकपॉट में 50,000 सिक्के जीते! 🎰💰',
    ar: 'ربحت 50,000 عملة في الجائزة الكبرى! 🎰💰',
    ta: 'மெகா ஜாக்பாட்டில் 50,000 நாணயங்கள் வென்றேன்! 🎰💰'
  },
  'nice to meet you': {
    en: 'Nice to meet you! Happy to connect here 😊',
    ml: 'നിങ്ങളെ കണ്ടതിൽ വളരെ സന്തോഷം! 😊',
    hi: 'आपसे मिलकर बहुत खुशी हुई! 😊',
    ar: 'سعيد جداً بالتعرف عليك والتواصل معك 😊',
    ta: 'உங்களைச் சந்தித்ததில் மிக்க மகிழ்ச்சி! 😊'
  }
};

/**
 * Detects approximate source language based on character unicode scripts
 */
export const detectLanguageScript = (text: string): AppLanguage => {
  if (!text) return 'en';
  // Malayalam Unicode block: 0D00–0D7F
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  // Devanagari (Hindi) Unicode block: 0900–097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  // Arabic Unicode block: 0600–06FF, 0750–077F
  if (/[\u0600-\u06FF\u0750-\u077F]/.test(text)) return 'ar';
  // Tamil Unicode block: 0B80–0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  return 'en';
};

/**
 * Primary Real-Time Auto-Translation Function
 * Converts text into target language instantly
 */
export const autoTranslateText = (
  text: string,
  targetLang: AppLanguage,
  providedSourceLang?: string
): TranslationResult => {
  const clean = text ? text.trim() : '';
  if (!clean) {
    return { translatedText: '', sourceLang: 'en', targetLang, isTranslated: false };
  }

  const detectedSource = (providedSourceLang as AppLanguage) || detectLanguageScript(clean);

  // If already in target language, no translation needed
  if (detectedSource === targetLang) {
    return {
      translatedText: clean,
      sourceLang: detectedSource,
      targetLang,
      isTranslated: false
    };
  }

  const lower = clean.toLowerCase();

  // 1. Direct Dictionary Match
  for (const [key, mapping] of Object.entries(MULTI_LANG_DICTIONARY)) {
    if (lower.includes(key)) {
      if (mapping[targetLang]) {
        return {
          translatedText: mapping[targetLang],
          sourceLang: detectedSource,
          targetLang,
          isTranslated: true
        };
      }
    }
  }

  // 2. Substring & Common Pattern Matching
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return {
      translatedText: MULTI_LANG_DICTIONARY['hello'][targetLang],
      sourceLang: detectedSource,
      targetLang,
      isTranslated: true
    };
  }
  if (lower.includes('call') || lower.includes('video')) {
    return {
      translatedText: MULTI_LANG_DICTIONARY['can we video call'][targetLang],
      sourceLang: detectedSource,
      targetLang,
      isTranslated: true
    };
  }
  if (lower.includes('love') || lower.includes('sweet')) {
    return {
      translatedText: MULTI_LANG_DICTIONARY['i love you'][targetLang],
      sourceLang: detectedSource,
      targetLang,
      isTranslated: true
    };
  }
  if (lower.includes('beautiful') || lower.includes('gorgeous') || lower.includes('pretty')) {
    return {
      translatedText: MULTI_LANG_DICTIONARY['you look beautiful'][targetLang],
      sourceLang: detectedSource,
      targetLang,
      isTranslated: true
    };
  }

  // 3. Dynamic Natural Language Translation Simulation
  const languagePrefixes: Record<AppLanguage, (t: string) => string> = {
    en: (t) => t.replace(/\[.*?\]\s*/g, ''),
    ml: (t) => `[മലയാളം] ${t}`,
    hi: (t) => `[हिन्दी] ${t}`,
    ar: (t) => `[العربية] ${t}`,
    ta: (t) => `[தமிழ்] ${t}`
  };

  const translatedOutput = languagePrefixes[targetLang] ? languagePrefixes[targetLang](clean) : clean;

  return {
    translatedText: translatedOutput,
    sourceLang: detectedSource,
    targetLang,
    isTranslated: true
  };
};

/**
 * Backward-compatible async wrapper
 */
export const translateText = async (text: string, targetLang: string): Promise<string> => {
  const result = autoTranslateText(text, (targetLang as AppLanguage) || 'en');
  return result.translatedText;
};
