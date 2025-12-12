// 文件路徑: src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TranslateButton from "@/components/TranslateButton";
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AoFiw",
  description: "Find your new friends",
};


const PromoBanner = ({ banner }: { banner: { url: string; name: string | null } | null }) => {

  if (!banner || !banner.url) {
    return null;
  }

  return (

<div className="w-full"> {/* 添加左右内边距，确保不贴边 */}
      <div className="relative aspect-[1200/200] mx-auto w-full overflow-hidden rounded-lg shadow-lg my-[30px]"> {/* 添加一些美化样式 */}
        <Image
          src={banner.url}
          alt={banner.name || "Promotional Banner"}
          fill={true} // 保持 fill={true} 实现响应式填充
          style={{ objectFit: "cover" }}
          className="card" // 保持 card 样式
          priority
        />
      </div>
    </div>

  );
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    profile = userProfile;
  }
  
  // 這段 Promise.all 已經在獲取您需要的 'promo_banner' 
  const [
    { data: activeBanner },
    { data: logoData }
  ] = await Promise.all([
    supabase.from('img_admin').select('url, name').eq('asset_type', 'promo_banner').eq('is_active', true).single(),
    supabase.from('img_admin').select('url').eq('asset_type', 'logo').eq('is_active', true).single()
  ]);

  const logoUrl = logoData?.url || null;

  return (
    <html lang="en" className="bg-[var(--background)] ">

      <body className={` w-full max-w-[1200px] mx-auto  mb-[20px] `}>


        <Header user={user} profile={profile} logoUrl={logoUrl} />

        <main>
          {children}

        </main>

        <div>
        <PromoBanner banner={activeBanner} />
        <Footer />
        </div>

        <TranslateButton />

      </body>
    </html>
  );
}