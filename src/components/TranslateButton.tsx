'use client';

import { useState, useEffect } from 'react';
import { FaLanguage, FaTimes } from 'react-icons/fa';

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            autoDisplay: boolean;
            layout?: number;
          },
          elementId: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export default function TranslateButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    // 检查 Google Translate 脚本是否已加载
    if (document.getElementById('google-translate-script')) {
      return;
    }

    // 加载 Google Translate 脚本
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;

    // 初始化函数
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
            layout: 0,
          },
          'google_translate_element'
        );
      }
    };

    document.body.appendChild(script);

    return () => {
      // 清理
      const scriptElement = document.getElementById('google-translate-script');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);

  // 当弹窗打开时，将 Google Translate 选择器移动到弹窗中
  useEffect(() => {
    if (showModal) {
      const modalContainer = document.getElementById('google_translate_modal');
      const translateElement = document.getElementById('google_translate_element');

      if (modalContainer && translateElement) {
        // 克隆翻译元素到弹窗中
        const selectElement = translateElement.querySelector('.goog-te-combo');
        if (selectElement) {
          modalContainer.innerHTML = '';
          const clonedSelect = selectElement.cloneNode(true) as HTMLSelectElement;
          clonedSelect.className = 'w-full p-3 text-base rounded-lg border-2  bg-[var(--color-secondary)] text-[var(--foreground)] cursor-pointer';

          // 添加选择事件
          clonedSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            if (target.value) {
              // 更新原始选择器的值
              (selectElement as HTMLSelectElement).value = target.value;
              selectElement.dispatchEvent(new Event('change'));
              setTooltipMessage(`Translating...`);
              setShowTooltip(true);
              setShowModal(false);
              setTimeout(() => setShowTooltip(false), 2000);
            }
          });

          modalContainer.appendChild(clonedSelect);
        }
      }
    }
  }, [showModal]);

  const handleTranslate = () => {
    setIsTranslating(true);

    if (typeof window === 'undefined') {
      setIsTranslating(false);
      return;
    }

    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    setTimeout(() => {
      try {
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;

        if (selectElement) {
          const browserLang = navigator.language.split('-')[0];
          const options = Array.from(selectElement.options);
          const targetOption = options.find(
            (option) => option.value === browserLang || option.value.startsWith(browserLang)
          );

          if (targetOption) {
            selectElement.value = targetOption.value;
            selectElement.dispatchEvent(new Event('change'));
            setTooltipMessage(`Translating to ${targetOption.text}...`);
            setShowTooltip(true);
            setIsTranslating(false);
            setTimeout(() => {
              setShowTooltip(false);
            }, 3000);
          } else {
            setShowModal(true);
            setIsTranslating(false);
          }
        } else {
          setShowModal(true);
          setIsTranslating(false);

          if (isChrome) {
            setTooltipMessage('Loading translation options...');
          } else {
            setTooltipMessage('For best experience, please use Chrome browser');
          }
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 3000);
        }
      } catch (error) {
        console.error('Translation error:', error);
        setTooltipMessage('Translation service unavailable');
        setShowTooltip(true);
        setShowModal(true);
        setIsTranslating(false);
        setTimeout(() => setShowTooltip(false), 3000);
      }
    }, 1000);
  };

  return (
    <>
      {/* 隐藏的 Google Translate 容器 */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <button
        onClick={handleTranslate}
        className="fixed bottom-[100px] right-[20px] z-[9999] flex items-center justify-center w-[60px] h-[60px] bg-[var(--color-third)] text-[var(--color-secondary)] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-[var(--color-third)]"
        aria-label="Translate Page"
        title="Translate this page"
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          zIndex: 9999,
          pointerEvents: 'auto'
        }}
      >
        <FaLanguage size={28} className={isTranslating ? 'animate-spin' : ''} />
      </button>

      {showTooltip && (
        <div className="fixed bottom-[170px] right-[20px] z-50 bg-[var(--color-secondary)] text-[var(--foreground)] p-[10px] rounded-lg shadow-xl max-w-[300px] card">
          <p className="text-sm">{tooltipMessage}</p>
        </div>
      )}

      {/* 语言选择弹窗 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center  bg-[var(--color-third)]"
          onClick={() => setShowModal(false)}
        >
            <div
              className="bg-[var(--color-secondary)] rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                Select Language
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--foreground)] hover:text-[var(--color-third)] transition-colors"
                aria-label="Close"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[var(--foreground)] mb-3">
                Please select your preferred language from the dropdown below:
              </p>

              {/* Google Translate 选择器容器 */}
              <div
                id="google_translate_modal"
                className="p-4 bg-[var(--background)] rounded-lg border-2 "
              ></div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[var(--color-third)] text-[var(--color-secondary)] rounded-lg hover:opacity-80 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
