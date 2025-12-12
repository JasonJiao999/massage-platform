// src/components/TestI18n.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface TestI18nProps {}

const TestI18n: React.FC<TestI18nProps> = () => {
  const { t, i18n, ready } = useTranslation();

  // 添加安全检查
  const currentLanguage: string = i18n?.language || 'en';
  const isThai: boolean = currentLanguage?.startsWith?.('th') || false;

  const handleLanguageChange = (lang: 'en' | 'th'): void => {
    i18n?.changeLanguage?.(lang);
  };

  // 如果 i18n 还没有准备好，显示加载状态
  if (!ready) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>加载语言资源中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>i18n 测试组件 (TypeScript)</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px'}}>
        <p><strong>检测到的语言:</strong> {currentLanguage}</p>
        <p><strong>浏览器语言:</strong> {navigator.language}</p>
        <p><strong>是泰语环境:</strong> {isThai ? '是' : '否'}</p>
        <p><strong>i18n 状态:</strong> {ready ? '已就绪' : '加载中'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>翻译内容测试:</h3>
        <p><strong>welcome:</strong> {t('welcome')}</p>
        <p><strong>greeting:</strong> {t('greeting')}</p>
        <p><strong>title:</strong> {t('title')}</p>
        <p><strong>button:</strong> {t('button')}</p>
        <p><strong>description:</strong> {t('description')}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>UI 元素测试:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ padding: '10px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            {t('button')}
          </button>
          <div style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', borderRadius: '4px' }}>
            {t('welcome')}
          </div>
        </div>
      </div>

      <div style={{ padding: '15px'}}>
        <h3>手动切换语言测试:</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={() => handleLanguageChange('en')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: currentLanguage === 'en' ? '#6c757d' : '#007bff',
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            切换到英语
          </button>
          <button 
            onClick={() => handleLanguageChange('th')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: isThai ? '#6c757d' : '#dc3545',
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            切换到泰语
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestI18n;