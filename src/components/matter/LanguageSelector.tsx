'use client';

import React from 'react';
import { Globe, Check } from 'lucide-react';
import { SupportedLanguage } from '@/lib/ai';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isLoading?: boolean;
}

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; script: string }> = [
  { code: 'en', label: 'English', script: 'English' },
  { code: 'hi', label: 'Hindi', script: 'हिन्दी' },
  { code: 'hinglish', label: 'Hinglish', script: 'Hinglish' },
  { code: 'mr', label: 'Marathi', script: 'मराठी' }
];

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  isLoading = false
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center space-x-1.5 bg-white border border-stone-200 rounded-xl p-1 shadow-2xs">
      <div className="flex items-center space-x-1 px-2 py-1 text-stone-500 text-xs">
        <Globe className="w-3.5 h-3.5 text-amber-600" />
        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Lang:</span>
      </div>

      <div className="flex items-center space-x-1">
        {LANGUAGES.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              } disabled:opacity-50`}
            >
              <span>{lang.script}</span>
              {isSelected && <Check className="w-3 h-3 text-amber-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
