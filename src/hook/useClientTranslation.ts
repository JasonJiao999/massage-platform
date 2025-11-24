// src/hooks/useClientTranslation.ts
'use client';

import { useState, useEffect } from 'react';
import { useTranslation as useOriginalTranslation } from 'react-i18next';

export function useClientTranslation() {
  const { t, i18n, ready } = useOriginalTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 在客户端渲染之前返回默认值
  if (!isClient || !ready) {
    return {
      t: (key: string) => key, // 返回键名作为默认值
      i18n: {
        language: 'en',
        changeLanguage: () => Promise.resolve(),
      },
      ready: false
    };
  }

  return { t, i18n, ready };
}