// 文件路徑: app/admin/ads/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import AdManagementClient from './AdManagementClient';

export default async function AdminAdsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 獲取所有類型為 'promo_banner' 的媒體資產
  const { data: banners } = await supabase
    .from('img_admin')
    .select('*')
    .eq('asset_type', 'promo_banner')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-[1150px] mx-auto gap-4r p-[24px] my-[10px]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">廣告管理</h1>
        <p className="text-gray-600 mt-1">選擇一個推廣橫幅作為當前全站顯示的廣告。</p>
      </header>
      <AdManagementClient initialBanners={banners || []} />
    </div>
  );
}