// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      greeting: "Hello, World!",
      title: "My Application",
      button: "Click Here",
      description: "This is a test application for i18n"
    }
  },
  th: {
    translation: {
      welcome: "ยินดีต้อนรับ",
      greeting: "สวัสดีชาวโลก",
      title: "แอปพลิเคชันของฉัน",
      button: "คลิกที่นี่",
      description: "นี่คือแอปพลิเคชันทดสอบสำหรับ i18n"
    }
  }
};

// 只在客户端初始化
if (typeof window !== 'undefined') {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: navigator.language,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false
      }
    });
}

export default i18n;