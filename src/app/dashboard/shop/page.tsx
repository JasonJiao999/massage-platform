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

  // 【核心修复】: 更新查询，从 shop_pages 获取所有图片URL
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
      shop_themes (
        primary_color,
        background_color
      ),
      shop_pages (
        hero_image_url,
        featured_video_url,
        bg_image_url,
        cover_image_url
      )
    `)
    .eq('owner_id', user.id)
    .single();

  if (error || !shopData) {
    // 打印错误可以帮助调试
    if (error) console.error('Shop fetch error:', error.message);
    return <div>Your information cannot be found. Please create a team first.</div>;
  }

  // 从关联查询结果中提取 shop_pages 的数据
  // Supabase v3 返回的是数组，v2可能是对象，做兼容处理
  const shopPageData = Array.isArray(shopData.shop_pages) ? shopData.shop_pages[0] : shopData.shop_pages;

  // 【核心修复】: 组装 settings 对象，从 shopPageData 中获取图片URL
  const settings = {
    shop_id: shopData.id,
    name: shopData.name,
    slug: shopData.slug,
    description: shopData.description || '',
    phone_number: shopData.phone_number || '',
    tags: shopData.tags || [],
    social_links: shopData.social_links || {},
    theme: Array.isArray(shopData.shop_themes) ? shopData.shop_themes[0] : shopData.shop_themes,
    // 所有图片URL都来自 shopPageData
    bg_image_url: shopPageData?.bg_image_url,
    hero_image_url: shopPageData?.hero_image_url,
    featured_video_url: shopPageData?.featured_video_url,
  };

  return (
    <div className="max-w-[1200px] mx-auto gap-[10px]">
      <h1 className="text-2xl font-bold mb-6 text-white mx-[10px]">Editorial Team Information</h1>
      <ShopEditForm settings={settings} />
    </div>
  );
}