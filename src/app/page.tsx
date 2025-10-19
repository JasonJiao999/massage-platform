// src/app/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton'; 

export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // --- 数据获取部分保持不变 ---
  const { data: workers } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url, photo_urls, tags, bio')
    .in('role', ['staff', 'freeman'])
    .eq('is_active', true);
  
  let favoritedWorkerIds = new Set<string>();
  if (user) {
    const { data: favorites } = await supabase
      .from('favorite_workers')
      .select('worker_profile_id')
      .eq('user_id', user.id);
    
    if (favorites) {
      favoritedWorkerIds = new Set(favorites.map(f => f.worker_profile_id));
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold my-8 text-center">探索我们的专业技师</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {workers?.map((worker) => {
          const displayImage = (worker.photo_urls && worker.photo_urls[0]) 
                             ? worker.photo_urls[0] 
                             : worker.avatar_url || '/default-avatar.png';

          return (
            // 移除了 relative 定位，因为不再需要绝对定位
            <div key={worker.id} className="group bg-card rounded-lg overflow-hidden border border-border flex flex-col">
              <Link href={`/worker/${worker.id}`} className="block">
                <div className="relative w-full aspect-square">
                  <Image
                    src={displayImage}
                    alt={worker.nickname || 'Worker'}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="p-4 flex flex-col flex-grow">
                {/* 【核心修改】: 使用 flex 布局将名字和按钮放在一行 */}
                <div className="flex justify-between items-start gap-2">
                  <Link href={`/worker/${worker.id}`} className="flex-1 truncate">
                    <h3 className="font-semibold text-lg group-hover:text-primary">{worker.nickname || '匿名技师'}</h3>
                  </Link>
                  {/* 现在按钮在这里，并且始终显示 */}
                  <FavoriteButton 
                    workerProfileId={worker.id}
                    isInitiallyFavorited={favoritedWorkerIds.has(worker.id)}
                    isLoggedIn={!!user} // 将登录状态传递给按钮
                  />
                </div>
                <p className="text-sm text-foreground/70 truncate mt-1">{worker.bio || '暂无简介'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}