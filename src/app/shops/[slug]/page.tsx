// src/app/shops/[slug]/page.tsx (最终修复版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- 数据获取部分保持不变 ---
  const { data: shop } = await supabase
    .from('shops')
    .select(`
      id, name, description, tags,
      shop_pages ( hero_image_url, featured_video_url, bg_image_url ),
      staff ( profiles ( id, nickname, avatar_url, photo_urls ) )
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!shop) {
    notFound();
  }
  
  const shopPageData = Array.isArray(shop.shop_pages) ? shop.shop_pages[0] : shop.shop_pages;
  const staffList = (shop.staff || []).map(s => s.profiles).filter(Boolean);
  const videoUrl = shopPageData?.featured_video_url;
  const backgroundUrl = shopPageData?.bg_image_url;

  return (
    // 使用一个简单的 div 作为主容器，移除所有复杂的定位
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        
        {/* 【核心修复】: 背景图现在是一个标准的 Image 组件，有明确的 width 和 height */}
        {backgroundUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
            <Image 
              src={backgroundUrl} 
              alt={`${shop.name} background`} 
              width={1200} // 给一个基础宽度
              height={400} // 给一个基础高度，保持3:1的比例
              priority
              className="w-full h-auto object-cover" // 样式会自适应容器宽度
            />
          </div>
        )}

        {/* 广告横幅 (保持不变) */}
        {shopPageData?.hero_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
            <Image src={shopPageData.hero_image_url} alt={`${shop.name} banner`} width={1200} height={400} className="w-full h-auto object-cover" />
          </div>
        )}

        {/* 【核心修复】: 这部分内容现在可以正常显示了 */}
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
            <section>
              <h2 className="text-3xl font-semibold border-b border-border pb-2 mb-6">我们的团队</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {staffList.length > 0 ? (
                  staffList.map((staff: any) => {
                    // 【核心修复】: 明确只使用 photo_urls[0] 或默认图片
                    const displayImage = (staff.photo_urls && staff.photo_urls[0]) 
                                       ? staff.photo_urls[0] 
                                       : '/default-avatar.png'; // 如果没有照片，直接用默认图
                    
                    return (
                      <Link href={`/worker/${staff.id}`} key={staff.id} className="group text-center">
                        <div className="relative w-full aspect-square mx-auto mb-2 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                          <Image 
                            src={displayImage} 
                            alt={staff.nickname || 'Staff photo'} 
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            className="object-cover" 
                          />
                        </div>
                        {/* 【核心修复】: 明确显示 staff.nickname */}
                        <p className="font-semibold group-hover:text-primary">
                          {staff.nickname || '匿名员工'}
                        </p>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-foreground/60 col-span-full">该店铺目前还没有员工信息。</p>
                )}
              </div>
            </section>
          </div>

          {/* 【核心修复】: 视频现在也可以正常显示了 */}
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