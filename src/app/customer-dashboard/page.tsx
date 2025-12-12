// src/app/customer-dashboard/page.tsx (服务器组件)
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import ProfileFormClient from './ProfileFormClient'; // 導入客戶端表單
import WorkerCard from '@/components/WorkerCard';   // 導入 WorkerCard
import Image from 'next/image';
import AutoPlayCarousel from '@/components/AutoPlayCarousel'; // 導入走馬燈組件
import ChangePasswordForm from '@/components/ChangePasswordForm';

export interface ProfileData {
  id?: string;
  full_name?: string;
  bio?: string;
  email?: string;
  tel?: string;
  qr_url?: string;
  is_active?: boolean;
  acc_active?: boolean;
  province_id?: string | null;
  district_id?: string | null;
  sub_district_id?: string | null;
  social_links: any | null;
}


type FavoriteWorker = {
  id: string;
  nickname: string | null;
  qr_url: string | null;
  photo_urls: string[] | null;
  years: number | null;
  tags: string[] | null;
  province_name: string | null;
  district_name: string | null;
  cover_image_url: string | null;
};


type GuestImage = {
  id: string;
  url: string;
};

export default async function CustomerDashboardPage() {

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  // 獲取用戶資料
  const { data: profile } = user 
    ? await supabase.from('profiles').select('*').eq('id', user.id).single() //
    : { data: null };

  // 獲取收藏的工作者
  let favoriteWorkers: FavoriteWorker[] = [];
  if (user) {
    const { data: favorites, error } = await supabase
      .from('favorite_workers') //
      .select(`
        worker:worker_profile_id (
          id, nickname, qr_url, photo_urls, years, tags,cover_image_url,
          province_name: province_id,
          district_name: district_id
        )
      `)
      .eq('user_id', user.id); 
    
    if (error) {
      console.error('Error fetching favorite workers:', error.message);
    }
    
    if (favorites) {
      favoriteWorkers = favorites.flatMap(fav => fav.worker).filter(Boolean) as FavoriteWorker[];
    }
  }

  let guestImages: GuestImage[] = [];
  const { data: imagesData, error: imagesError } = await supabase
    .from('img_admin') //
    .select('id, url') //
    .eq('asset_type', 'pm_guest');

  if (imagesError) {
    console.error('Error fetching pm_guest images:', imagesError.message);
  } else if (imagesData) {
    guestImages = imagesData as GuestImage[];
  }


  const carouselImages = guestImages.map(img => ({
    src: img.url,
    alt: 'Guest Image' // <-- 提供一個通用的 alt 標籤
  }));


  return (
    <div className="max-w-[1200px] mx-auto my-[10px]">
      {/* 渲染個人資料表單 */}
      <h1 className="text-2xl font-bold mx-[10px]">Profile</h1>

        <div className="flex flex-wrap justify-center max-w-[1200px] mx-auto">
        <div className='card w-full min-[500px]:max-w-[400px] min-[1200px]:max-w-[1200px] '>


<div className='flex flex-wrap justify-between'>
      {user ? (
        <ProfileFormClient initialData={profile as ProfileData || {}} />
      ) : (
        <p>Please log in first to edit your profile.</p>
      )}

      {/* 渲染走馬燈gg */}
      {carouselImages.length > 0 && (
        <div className=" rounded-lg shadow-lg  min-[500px]:w-[380px] min-[1200px]:w-[770px] m-[10px]">
          <AutoPlayCarousel 
            images={carouselImages} // <-- 傳入轉換後的數據
            intervalMs={30000} // 30 秒
          />
        </div>
      )} 
</div>

        </div>
        </div>

      {/* 渲染收藏列表 */}
      <div className="mt-12 pt-6 ">
        <h2 className="text-2xl font-bold mx-[10px]">Favorites</h2>
        
        <div className="flex flex-wrap justify-center max-w-[1200px] mx-auto">
        <div className='card w-full  '>
        {favoriteWorkers.length > 0 ? (
<div className='grid grid-cols-2 
                        min-[768px]:grid-cols-4   {/* 屏幕宽度 >= 768px 时显示 4 列 */}
                        min-[1024px]:grid-cols-5 {/* 屏幕宽度 >= 1024px 时显示 5 列 */}
                        gap-[10px]'>
            {favoriteWorkers.map(worker => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                isLoggedIn={!!user}
                isFavorited={true}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4">There is no data here.</p>
        )}

        </div>
        </div>


      </div> 
<div className='mx-[10px]'><ChangePasswordForm /></div>
    </div>
  );
}