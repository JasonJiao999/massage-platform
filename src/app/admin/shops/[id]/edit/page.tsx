// src/app/admin/shops/[id]/edit/page.tsx
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import AdminShopEditForm from '@/components/AdminShopEditForm'; // 1. 导入新创建的表单

export default async function AdminEditShopPage({ params }: { params: { id: string } }) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select(`*, shop_themes(*)`)
    .eq('id', params.id)
    .single();

  if (!shop) {
    notFound();
  }

  const theme = Array.isArray(shop.shop_themes) ? shop.shop_themes[0] : shop.shop_themes;
  const fullShopData = { ...shop, theme };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        Edit Shop (Admin): {shop.name}
      </h1>
      {/* 2. 使用真实的表单组件替换占位符 */}
      <AdminShopEditForm shop={fullShopData} />
    </div>
  );
}