// src/components/I18nWrapper.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

interface I18nWrapperProps {
  children: React.ReactNode;
}

export default function I18nWrapper({ children }: I18nWrapperProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 确保 i18n 已经初始化
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      i18n.on('initialized', () => {
        setIsInitialized(true);
      });
    }
  }, []);

  // 在初始化完成前显示加载状态
  if (!isInitialized) {
    return <>{children}</>; // 或者显示加载状态
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}