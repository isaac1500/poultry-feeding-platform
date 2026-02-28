/* frontend/src/components/LanguageSwitcher/LanguageSwitcher.module.css */
.languageSwitcher {
  position: relative;
  display: inline-block;
}

.switcherButton {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.switcherButton:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.flag {
  font-size: 16px;
}

.languageName {
  flex: 1;
  text-align: left;
}

.arrow {
  font-size: 10px;
  color: #6c757d;
}

.languageDropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  margin-top: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.languageOption {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: background 0.2s;
}

.languageOption:hover {
  background: #f8f9fa;
}

.languageOption.active {
  background: #e3f2fd;
  color: #1976d2;
}

.optionFlag {
  font-size: 16px;
  width: 24px;
}

.optionName {
  flex: 1;
}

.checkmark {
  color: #2ecc71;
  font-weight: bold;
}