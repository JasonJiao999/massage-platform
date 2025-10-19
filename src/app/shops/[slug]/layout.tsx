// src/app/shops/[slug]/layout.tsx (已修复版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// 【核心修复】: 导入 React 以使用 CSSProperties 类型
import React from 'react'; 

function hexToHslParts(hex: string): string | null {
    if (!hex || !hex.startsWith('#')) return null;
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    } else {
        return null;
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
}

async function getThemeByShopSlugWithClient(supabase: any, slug: string) {
  const { data, error } = await supabase
    .from('shops')
    .select(`shop_themes (primary_color, background_color)`)
    .eq('slug', slug)
    .single();

  if (error || !data || !data.shop_themes) {
    return null;
  }
  const theme = Array.isArray(data.shop_themes) ? data.shop_themes[0] : data.shop_themes;
  return theme;
}


export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const themeData = await getThemeByShopSlugWithClient(supabase, params.slug);

// 【核心修复】: 扩展 CSSProperties 类型以接受自定义变量
  const themeVariables: React.CSSProperties & { [key: string]: string } = {};
  
  if (themeData) {
    if (themeData.primary_color) {
        const hsl = hexToHslParts(themeData.primary_color);
        if (hsl) {
            themeVariables['--primary'] = hsl;
        }
    }
    if (themeData.background_color) {
        const hsl = hexToHslParts(themeData.background_color);
        if (hsl) {
            themeVariables['--background'] = hsl;
        }
    }
  }
  return (
    <div style={themeVariables}>
      {children}
    </div>
  );
}