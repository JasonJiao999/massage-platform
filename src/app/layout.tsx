// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Script from 'next/script'; // 导入 Script 组件

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Massage Platform',
  description: 'Your next appointment is here.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Header 组件会在这里被渲染 */}
        <Header />

        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>

        {/* 在 body 末尾加载全局的谷歌翻译脚本 */}
        <Script 
          id="google-translate-script"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive" 
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }
          `}
        </Script>
      </body>
    </html>
  );
}