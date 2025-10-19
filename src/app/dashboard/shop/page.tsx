// src/app/dashboard/shop/page.tsx (已修复版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ShopEditForm from '@/components/ShopEditForm';

export default async function ShopSettingsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  // 【核心修复】: 更新查询，一次性获取 shops 和 shop_pages 的所有数据
  const { data: shopData, error } = await supabase
    .from('shops')
    .select(`
      id,
      name,
      slug,
      description,
      phone_number,
      tags,
      social_links,
      bg_image_url,
      shop_themes (
        primary_color,
        background_color
      ),
      shop_pages (
        hero_image_url,
        featured_video_url
      )
    `)
    .eq('owner_id', user.id)
    .single();

  if (error || !shopData) {
    return <div>找不到您的店铺信息。请先创建店铺。</div>;
  }

  // 从关联查询结果中提取 shop_pages 的数据
  const shopPageData = Array.isArray(shopData.shop_pages) ? shopData.shop_pages[0] : shopData.shop_pages;

  // 【核心修复】: 组装 settings 对象，包含所有需要传递给表单的数据
  const settings = {
    shop_id: shopData.id, // <-- 添加了缺失的 shop_id
    name: shopData.name,
    slug: shopData.slug,
    description: shopData.description || '',
    phone_number: shopData.phone_number || '',
    tags: shopData.tags || [],
    social_links: shopData.social_links || {},
    theme: Array.isArray(shopData.shop_themes) ? shopData.shop_themes[0] : shopData.shop_themes,
    bg_image_url: shopData.bg_image_url,
    hero_image_url: shopPageData?.hero_image_url,
    featured_video_url: shopPageData?.featured_video_url,
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">编辑店铺信息与主题</h1>
      <ShopEditForm settings={settings} />
    </div>
  );
}