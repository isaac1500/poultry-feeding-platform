// src/components/LanguageSwitcher/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', label: 'EN' },
    { code: 'lg', name: 'Luganda', flag: '🇺🇬', label: 'LG' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const currentLanguage = i18n.language || 'en';

  return (
    <div className="language-switcher">
      <div className="switcher-container">
        <span className="switcher-icon">🌐</span>
        <div className="language-buttons">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-btn ${currentLanguage === lang.code ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
              title={lang.name}
              aria-label={`Switch to ${lang.name}`}
            >
              <span className="flag">{lang.flag}</span>
              <span className="label">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;