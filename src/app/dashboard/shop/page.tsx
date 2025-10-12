// src/app/dashboard/shop/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ShopEditForm from '@/components/ShopEditForm';

export default async function ShopSettingsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  // 更新查询语句
  const { data: shopData, error } = await supabase
    .from('shops')
    .select(`
      name,
      slug,
      description,
      phone_number,
      tags,
      social_links,
      shop_themes (
        primary_color,
        background_color
      )
    `)
    .eq('owner_id', user.id)
    .single();

  if (error || !shopData) {
    return <div>找不到您的店铺信息。请先创建店铺。</div>;
  }

  const settings = {
    name: shopData.name,
    slug: shopData.slug,
    description: shopData.description || '', // <-- 新增
    phone_number: shopData.phone_number || '', // <-- 新增
    tags: shopData.tags || [],
    social_links: shopData.social_links || {},
    theme: Array.isArray(shopData.shop_themes) ? shopData.shop_themes[0] : shopData.shop_themes,
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">编辑店铺信息与主题</h1>
      <ShopEditForm settings={settings} />
    </div>
  );
}