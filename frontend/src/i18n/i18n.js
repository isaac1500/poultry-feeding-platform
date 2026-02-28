// frontend/src/i18n/i18n.js - CORRECTED VERSION
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// CORRECT IMPORT PATHS - They should be in the same directory
import enTranslations from './locales/en.json';  // Changed from './locales/en.json'
import lgTranslations from './locales/lg.json';  // Changed from './locales/lg.json'


// Debug log to check if files are loading
console.log('Loading translations...', {
  en: enTranslations ? 'Loaded' : 'Failed',
  lg: lgTranslations ? 'Loaded' : 'Failed'
});

const resources = {
  en: {
    translation: enTranslations
  },
  lg: {
    translation: lgTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'lg'],
    defaultNS: 'translation',
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      checkWhitelist: true
    },
    
    // Debug settings
    debug: process.env.NODE_ENV === 'development',
    
    // Only save missing keys in development
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🌐 Missing translation: "${key}" in language: "${lng}"`);
        // Return the key itself as fallback (better UX than empty string)
        return key;
      }
      return fallbackValue || key;
    },
    
    // Better parsing
    parseMissingKeyHandler: (key) => {
      console.warn(`Missing key: ${key}`);
      return key; // Return the key itself instead of empty string
    },
    
    // React i18next options
    react: {
      useSuspense: false, // Set to true if using React Suspense
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span'],
      hashTransKey: (defaultValue) => {
        // Create hash for key
        return defaultValue;
      }
    }
  });

// Simple function to get translation safely with fallback
export const t = (key, options) => {
  try {
    return i18n.t(key, options) || key;
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
};

// Function to change language with persistence
export const changeLanguage = (lang) => {
  localStorage.setItem('i18nextLng', lang);
  return i18n.changeLanguage(lang);
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

// Check if a key exists
export const hasTranslation = (key) => {
  return i18n.exists(key);
};

// Get all available languages
export const getAvailableLanguages = () => {
  return Object.keys(resources);
};

// Language switcher utility
export const languageSwitcher = {
  toggle: () => {
    const currentLang = getCurrentLanguage();
    const nextLang = currentLang === 'en' ? 'lg' : 'en';
    return changeLanguage(nextLang);
  },
  isEnglish: () => getCurrentLanguage() === 'en',
  isLuganda: () => getCurrentLanguage() === 'lg'
};

export default i18n;