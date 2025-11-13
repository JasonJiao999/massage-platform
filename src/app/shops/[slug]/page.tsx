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
      staff ( profiles ( id, nickname, photo_urls ) )
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
    <div className="max-w-[1200px] mx-auto flex flex-row">
      <div className="container mx-[10px] max-w-[1180px]">
        
<div className="flex flex-wrap justify-between max-w-[1180px] gap-[10px]">
  
  <div className="w-[60%] min-w-[430px] ">

        {/* 【核心修复】: 背景图现在是一个标准的 Image 组件，有明确的 width 和 height */}
        {backgroundUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
            <Image 
              src={backgroundUrl} 
              alt={`${shop.name} background`} 
              width={1200} // 给一个基础宽度
              height={900} // 给一个基础高度，保持4:3的比例
              priority
              className="card w-full h-auto object-cover" // 样式会自适应容器宽度
            />
          </div>
        )}
  </div>
        
  <div className="card w-[35%] min-w-[390px] bg-[var(--color-third)]  p-[20px]">
  
          <h1 className="text-4xl md:text-5xl font-bold ">Team:{shop.name}</h1>
          
          <p className="text-lg  max-w-3xl ">Bio:{shop.description || 'No introduction ....'}</p>
  </div>
</div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-3xl font-semibold border-b border-border pb-2 mb-6">Our team</h2>
              <div className="grid grid-cols-2 min-[800px]:grid-cols-3 min-[1200px]:grid-cols-4 gap-[10px]">
                {staffList.length > 0 ? (
                  staffList.map((staff: any) => {
                    // 【核心修复】: 明确只使用 photo_urls[0] 或默认图片
                    const displayImage = (staff.photo_urls && staff.photo_urls[0]) 
                                       ? staff.photo_urls[0] 
                                       : '/default-avatar.png'; // 如果没有照片，直接用默认图
                    
                    return (
                      <Link href={`/worker/${staff.id}`} key={staff.id} className="group text-center">
                        <div className="relative max-w-[250px] min-w-[150px] aspect-[3/4] mx-auto mb-2 rounded-lg overflow-hidden">
                          <Image 
                            src={displayImage} 
                            alt={staff.nickname || 'Staff photo'} 
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            className="object-cover card" 
                          />
                        </div>
                        {/* 【核心修复】: 明确显示 staff.nickname */}
                        <p className="font-semibold group-hover:text-primary">
                          {staff.nickname || 'No Name'}
                        </p>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-foreground/60 col-span-full">There is currently no information on the team members.</p>
                )}
              </div>
            </section>

            {/* 广告横幅 */}
       {shopPageData?.hero_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
            <Image src={shopPageData.hero_image_url} alt={`${shop.name} banner`} width={1200} height={200} className="w-full object-cover my-[20px] card" />
          </div>
        )}
          </div>

          {/* 【核心修复】: 视频现在也可以正常显示了 */}
          {videoUrl && (
            <aside>
              <h3 className="text-2xl font-semibold mb-4">Team Video</h3>
              <div className="aspect-video max-w-[1200px] rounded-lg overflow-hidden shadow-lg bg-black">
                <video 
                  src={videoUrl}
                  controls
                  preload="metadata"
                  className="w-full h-auto object-contain card mx-auto"
                >
                  Your browser does not support playing videos.
                </video>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}