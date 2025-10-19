// src/app/shops/[slug]/page.tsx (最终完整版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 数据查询保持不变，它已经获取了所有需要的数据
  const { data: shop } = await supabase
    .from('shops')
    .select(`
      id, name, description, tags, bg_image_url,
      shop_pages ( hero_image_url, featured_video_url ),
      staff ( profiles ( id, nickname, avatar_url ) )
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!shop) {
    notFound();
  }
  
  // 2. 数据整理逻辑保持不变
  const shopPageData = Array.isArray(shop.shop_pages) ? shop.shop_pages[0] : shop.shop_pages;
  // 修正：确保在 staff 为 null 或 profiles 为 null 时不会出错
  const staffList = (shop.staff || []).map(s => s.profiles).filter(Boolean);
  const videoUrl = shopPageData?.featured_video_url;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 背景图容器 */}
      {shop.bg_image_url && (
        <div className="absolute inset-0 z-0 h-96">
            <Image src={shop.bg_image_url} alt={`${shop.name} background`} layout="fill" objectFit="cover" className="opacity-20" />
        </div>
      )}

      <div className="relative z-10 container mx-auto p-4 md:p-8">
        
        {/* 广告横幅 */}
        {shopPageData?.hero_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
            <Image src={shopPageData.hero_image_url} alt={`${shop.name} banner`} width={1200} height={400} className="w-full h-auto object-cover" />
          </div>
        )}

        {/* 【核心修复】: 恢复店铺核心信息显示 */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">{shop.name}</h1>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">{shop.description || '店主很懒，还没有写简介...'}</p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {shop.tags?.map((tag: string) => (
              <span key={tag} className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* 【核心修复】: 恢复员工墙部分 */}
            <section>
              <h2 className="text-3xl font-semibold border-b border-border pb-2 mb-6">我们的团队</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {staffList.map((staff: any) => (
                  <Link href={`/worker/${staff.id}`} key={staff.id} className="group text-center">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <Image src={staff.avatar_url || '/default-avatar.png'} alt={staff.nickname} layout="fill" objectFit="cover" className="rounded-full border-2 border-transparent group-hover:border-primary transition-all" />
                    </div>
                    <p className="font-semibold group-hover:text-primary">{staff.nickname}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* 视频窗口 (保持不变) */}
          {videoUrl && (
            <aside>
              <h3 className="text-2xl font-semibold mb-4">特色视频</h3>
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg bg-black">
                <video 
                  src={videoUrl}
                  controls
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  您的浏览器不支持播放视频。
                </video>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}