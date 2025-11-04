// src/app/page.tsx (最终修复版 - 传递完整数据)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import WorkerSearchClient from '@/components/WorkerSearchClient';
import ImageCarousel from '@/components/ImageCarousel';
import { unstable_noStore as noStore } from 'next/cache'; // 1. 导入 noStore

const ITEMS_PER_PAGE = 30;

// 更新 SearchParams 以包含新的筛选条件
interface SearchParams {
  page?: string;
  q?: string;
  city?: string;
  area?: string;
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  noStore();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const currentPage = Number(searchParams.page) || 1;

  // --- 1. 获取用户状态 (逻辑不变) ---
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  let favoritesSet = new Set<string>();
  if (isLoggedIn) {
    const { data: favorites } = await supabase.from('favorites').select('worker_profile_id').eq('user_id', user.id);
    if (favorites) {
      favoritesSet = new Set(favorites.map(fav => fav.worker_profile_id));
    }
  }

  // --- 2. 并行获取所有筛选器数据和总数 ---
const [
    { data: adminTagsData },
    { data: adminCitiesData },
    { data: adminAreasData },
    { data: totalCountData },
    { data: promoImagesData } // <--- 新增查询
  ] = await Promise.all([
    supabase.from('tags_admin').select('name').order('sort_order'),
    supabase.from('cities_admin').select('name, location_id').order('sort_order'),
    supabase.from('locations_admin').select('name, location_id').order('sort_order'),
    supabase.rpc('search_workers_count', {
        search_term: searchParams.q,
        city_filter_id: searchParams.city ? Number(searchParams.city) : null,
        area_filter_id: searchParams.area ? Number(searchParams.area) : null,
    }),
    // <--- 新增的查询逻辑
    supabase.from('img_admin').select('url, name').eq('asset_type', 'promo_image').eq('is_active', true)
  ]);

  // 【核心修复】确保将完整数据（包括 location_id）传递下去
  const adminTags = adminTagsData?.map(t => ({ tag: t.name })) || [];
  const popularCities = adminCitiesData || [];
  const popularAreas = adminAreasData || []; // 直接使用查询结果
  const totalCount = totalCountData as number || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const promoImages = promoImagesData || [];
  // --- 3. 获取工作者列表 ---
  const { data: workers, error: workersError } = await supabase.rpc('search_workers', {
    search_term: searchParams.q,
    city_filter_id: searchParams.city ? Number(searchParams.city) : null,
    area_filter_id: searchParams.area ? Number(searchParams.area) : null,
    page_num: currentPage,
    page_size: ITEMS_PER_PAGE
  });
  if(workersError) console.error("Error fetching workers:", workersError);
  
  // --- 4. 渲染页面 ---
  return (
    <main className="container mx-auto px-4 py-8 ">
      <div className="text-center mb-12">
        <ImageCarousel images={promoImages} />
      </div>

      <WorkerSearchClient
        initialWorkers={workers || []}
        adminTags={adminTags}
        popularCities={popularCities}
        popularAreas={popularAreas}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoggedIn={isLoggedIn}
        favoritesSet={favoritesSet}
      />
    </main>
  );
}