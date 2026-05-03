"use client";

import React, { createContext, useContext, useState } from 'react';
import content from '@/data/content.json';

type Language = keyof typeof content;
type TranslationRecord = Record<string, unknown>;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => unknown;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key: string): unknown => {
    const keys = key.split('.');
    let result: unknown = content[language];
    for (const k of keys) {
      if (isTranslationRecord(result) && k in result) {
        result = result[k];
      } else {
        return key; // fallback to key
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

function isTranslationRecord(value: unknown): value is TranslationRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
