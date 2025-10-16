// src/components/GoogleTranslateWidget.tsx

'use client'; // 这是一个交互式组件，必须是客户端组件

import Image from 'next/image';
import { useState } from 'react';

// 设置 cookie 的辅助函数
const setCookie = (key: string, value: string, expiryDays: number) => {
  if (typeof window === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = key + "=" + value + ";" + expires + ";path=/";
};

export default function GoogleTranslateWidget() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // 切换语言的函数
  const changeLanguage = (lang: 'en' | 'zh-CN') => {
    // 1. 设置 Google 翻译需要的 cookie
    setCookie('googtrans', `/auto/${lang}`, 1);
    // 2. 刷新页面以应用翻译
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* 1. 这是我们自己创建的、漂亮的图标按钮 */}
      <button 
        onClick={() => setIsDropdownVisible(!isDropdownVisible)}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Change language"
      >
        <Image
          src="/icon/language-icon.svg" // <-- 指向您在 public 文件夹中的图标
          alt="语言切换"
          width={20} // <-- 设置图标宽度
          height={20} // <-- 设置图标高度
        />
      </button>

      {/* 2. 我们自己的、漂亮的下拉菜单 */}
      {isDropdownVisible && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border z-20">
          <ul className="py-1">
            <li>
              <button 
                onClick={() => changeLanguage('zh-CN')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                简体中文
              </button>
            </li>
            <li>
              <button 
                onClick={() => changeLanguage('en')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                English
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* 3. 这是原版的、被我们隐藏起来的 Google 翻译插件 */}
      {/* 它必须存在于页面上，但用户看不见它 */}
      <div id="google_translate_element" className="!hidden"></div>
    </div>
  );
}
