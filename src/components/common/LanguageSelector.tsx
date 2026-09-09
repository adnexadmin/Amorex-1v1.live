import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import {
  AppLanguage,
  SUPPORTED_LANGUAGES,
  getAppLanguage,
  setAppLanguage
} from '../../utils/i18n';
import { sound } from '../../utils/audio';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown' | 'settings';
  className?: string;
  onChange?: (lang: AppLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
  onChange
}) => {
  const [currentLang, setCurrentLangState] = useState<AppLanguage>(getAppLanguage());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail) {
        setCurrentLangState(customEvent.detail);
      } else {
        setCurrentLangState(getAppLanguage());
      }
    };

    window.addEventListener('amorex_language_changed', handleLangChange);
    return () => {
      window.removeEventListener('amorex_language_changed', handleLangChange);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const activeLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (lang: AppLanguage) => {
    sound.playClick();
    setAppLanguage(lang);
    setCurrentLangState(lang);
    setIsOpen(false);
    if (onChange) {
      onChange(lang);
    }
  };

  // 1. Settings view format: Full horizontal pill grid or stacked list
  if (variant === 'settings') {
    return (
      <div className={`space-y-2 w-full ${className}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((item) => {
            const isSelected = item.code === currentLang;
            return (
              <button
                key={item.code}
                onClick={() => handleSelectLanguage(item.code)}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-pink-500 bg-pink-500/20 text-white shadow-[0_0_15px_rgba(255,46,147,0.3)]'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.flag}</span>
                  <div>
                    <p className="text-xs font-bold leading-none">{item.nativeName}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.name}</p>
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-pink-400" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Default dropdown / compact pill in navbar
  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        id="global-language-selector-btn"
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen);
        }}
        className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-pink-400/50 flex items-center gap-1.5 text-xs text-white transition-all shadow-sm cursor-pointer active:scale-95"
        title="Select Language / ഭാഷ തിരഞ്ഞെടുക്കുക / भाषा चुनें / اختر اللغة / மொழியைத் தேர்ந்தெடுக்கவும்"
      >
        <Globe size={13} className="text-cyan-400 shrink-0" />
        <span className="text-xs font-semibold flex items-center gap-1">
          <span>{activeLangInfo.flag}</span>
          <span className="hidden sm:inline font-medium">{activeLangInfo.nativeName}</span>
          <span className="sm:hidden uppercase text-[10px] font-bold">{activeLangInfo.code}</span>
        </span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-[#14162B] border border-white/15 shadow-2xl backdrop-blur-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-[9px] text-cyan-400">5 Languages</span>
          </div>

          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-pink-500/20 text-white font-bold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-none">{lang.nativeName}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-pink-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
