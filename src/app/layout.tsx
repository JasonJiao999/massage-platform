// src/app/layout.tsx (已更新版)

import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import TopNavigation from '@/components/TopNavigation';
import Header from "@/components/Header";
import HeaderStaff from "@/components/HeaderStaff";
import HeaderMerchant from "@/components/HeaderMerchant";
import HeaderCustomer from '@/components/HeaderCustomer';
import { headers } from 'next/headers'; // 1. 导入 headers

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

  switch (profile?.role) {
    case 'staff':
    case 'freeman':
      roleSpecificHeader = <HeaderStaff user={user} />;
      break;
    case 'merchant':
      const { data: shop } = user 
        ? await supabase.from('shops').select('slug').eq('owner_id', user.id).single() 
        : { data: null };
      roleSpecificHeader = <HeaderMerchant user={user} shopSlug={shop?.slug || null} />;
      break;
    case 'customer':
      roleSpecificHeader = <HeaderCustomer user={user} />;
      break;
    default:
      roleSpecificHeader = <Header user={user} />;
      break;
  }

  // 2. 【核心修改】: 判断当前路径，决定是否显示顶部导航栏
  const headersList = headers();
  // `x-next-pathname` 是 Next.js 内部用来传递当前 URL 路径的头部
  const pathname = headersList.get('x-next-pathname') || '';
  const showTopNav = !pathname.startsWith('/shops/');

  return (
    <html lang="en">
      <body>
        {/* 3. 【核心修改】: 使用条件渲染 */}
        {showTopNav && (
          <div id="top-bar-container" className="sticky top-0 z-50">
            <TopNavigation>
              {roleSpecificHeader}
            </TopNavigation>
          </div>
        )}
        <main>{children}</main>

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