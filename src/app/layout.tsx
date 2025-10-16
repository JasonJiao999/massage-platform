// src/app/layout.tsx (已修复 props 传递问题)

import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import TopNavigation from '@/components/TopNavigation';
import Header from "@/components/Header";
import HeaderStaff from "@/components/HeaderStaff";
import HeaderMerchant from "@/components/HeaderMerchant";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "按摩预订平台",
  description: "您的专属疗愈空间",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const { createClient } = await import('@/utils/supabase/server');
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  
  let roleSpecificHeader;

  // 根据用户角色，选择要渲染的角色专属 Header
  switch (profile?.role) {
    case 'staff':
    case 'freeman':
      // 【核心修正】: 将 user 对象作为 prop 传递给组件
      roleSpecificHeader = <HeaderStaff user={user} />;
      break;
    case 'merchant':
      // 【核心修正】: 将 user 对象作为 prop 传递给组件
      roleSpecificHeader = <HeaderMerchant user={user} />;
      break;
    default:
      // 通用 Header 可能也需要 user 信息来判断是否显示“登出”按钮
      roleSpecificHeader = <Header user={user} />;
      break;
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="top-bar-container" className="sticky top-0 z-50">
          <TopNavigation>
            {roleSpecificHeader}
          </TopNavigation>
        </div>
        <main>{children}</main>

        {/* 2. 【核心修正】: 在 body 闭合标签前，添加 Google 翻译的初始化脚本 */}
        <Script 
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive" 
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
            }
          `}
        </Script>
      </body>
    </html>
  );
}