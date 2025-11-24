// src/app/test/page.tsx
import React from 'react';
import TestI18n from '../../components/TestI18n';
import I18nProvider from './I18nProvider';

export default function TestPage() {
  return (
    <I18nProvider>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>
          i18n 测试应用 (TypeScript)
        </h1>
        <TestI18n />
      </div>
    </I18nProvider>
  );
}