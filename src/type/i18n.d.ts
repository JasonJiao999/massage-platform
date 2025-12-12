// src/types/i18n.d.ts
import 'react-i18next';

// 定义翻译键的类型
declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: {
        welcome: string;
        greeting: string;
        title: string;
        button: string;
        description: string;
      };
    };
  }
}