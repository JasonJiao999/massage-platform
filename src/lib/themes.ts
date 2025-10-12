// src/lib/themes.ts
import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function getThemeByShopSlug(slug: string) {
  noStore(); // 告诉 Next.js 不要缓存这个结果，以保证主题可以实时更新
  const supabase = createClient();

  // 我们需要通过 slug 找到 shop，然后关联查询 shop_themes
  const { data, error } = await supabase
    .from('shops')
    .select(`
      shop_themes (
        primary_color,
        secondary_color,
        background_color,
        text_color,
        border_radius,
        font_family
      )
    `)
    .eq('slug', slug)
    .single(); // 我们期望只找到一个结果

  if (error || !data || !data.shop_themes) {
    console.error('Error fetching theme or theme not found:', error);
    return null;
  }

  // Supabase 对于关联查询会返回一个数组，即使是一对一关系
  // 我们需要取出数组的第一个元素
  const theme = Array.isArray(data.shop_themes) ? data.shop_themes[0] : data.shop_themes;

  return theme;
}