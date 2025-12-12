// 文件路徑: app/admin/shops/[id]/edit/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ShopEditForm from './ShopEditForm'; // 我們將在下一步創建這個文件

export default async function ShopEditPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: shop, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !shop) {
    notFound();
  }

  return (
    <div className="max-w-[1150px] mx-auto gap-4r p-[24px] my-[10px]">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">編輯店鋪信息</h1>
      <ShopEditForm shop={shop} />
    </div>
  );
}