// frontend/src/components/LanguageSwitcher/LanguageSwitcher.jsx
import React, { useState } from 'react';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'lg', name: 'Luganda', flag: '🇺🇬' },
    { code: 'sw', name: 'Swahili', flag: '🇹🇿' }
  ];

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    setIsOpen(false);
    // Here you would integrate with i18n library (like react-i18next)
    console.log(`Language changed to: ${langCode}`);
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className={styles.languageSwitcher}>
      <button 
        className={styles.switcherButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <span className={styles.flag}>{currentLang?.flag || '🌐'}</span>
        <span className={styles.languageName}>{currentLang?.name || 'English'}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className={styles.languageDropdown}>
          {languages.map((language) => (
            <button
              key={language.code}
              className={`${styles.languageOption} ${currentLanguage === language.code ? styles.active : ''}`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className={styles.optionFlag}>{language.flag}</span>
              <span className={styles.optionName}>{language.name}</span>
              {currentLanguage === language.code && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;