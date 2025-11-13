// 文件路徑: src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  // 如果沒有傳入 banner 數據，或者 banner 沒有 url，則不渲染任何內容
  if (!banner || !banner.url) {
    return null;
  }

  return (

<div className="w-[full-20px] m-[10px]">
  <div className="relative aspect-[1200/200]">
<Image
        src={banner.url}
        alt={banner.name || "Promotional Banner"}
        fill={true} 
        style={{ objectFit: "cover"  }}
        className="card"
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
    <html lang="en" className="bg-[var(--background)] max-[800px]:w-[450px] ">

      <body className={` w-full max-w-[1200px] mx-auto border mb-[20px] `}>
        
        
        <Header user={user} profile={profile} logoUrl={logoUrl} />
        
        <main>
          {children}
          
        </main>
        
        
        <PromoBanner banner={activeBanner} />
        <Footer />


      </body>
    </html>
  );
}