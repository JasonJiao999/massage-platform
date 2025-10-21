// src/app/page.tsx (最终修复版 - 传递完整数据)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import WorkerSearchClient from '@/components/WorkerSearchClient';

const ITEMS_PER_PAGE = 30;

// 更新 SearchParams 以包含新的筛选条件
interface SearchParams {
  page?: string;
  q?: string;
  city?: string;
  area?: string;
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
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
    { data: adminAreasData }, // 之前这里叫 locations_admin
    { data: totalCountData }
  ] = await Promise.all([
    supabase.from('tags_admin').select('name').order('sort_order'),
    supabase.from('cities_admin').select('name, location_id').order('sort_order'),
    supabase.from('locations_admin').select('name, location_id').order('sort_order'), // 确保查询 location_id
    supabase.rpc('search_workers_count', {
        search_term: searchParams.q,
        city_filter_id: searchParams.city ? Number(searchParams.city) : null,
        area_filter_id: searchParams.area ? Number(searchParams.area) : null,
    })
  ]);

  // 【核心修复】确保将完整数据（包括 location_id）传递下去
  const adminTags = adminTagsData?.map(t => ({ tag: t.name })) || [];
  const popularCities = adminCitiesData || [];
  const popularAreas = adminAreasData || []; // 直接使用查询结果

  const totalCount = totalCountData as number || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">寻找您附近最好的技师</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          通过服务、地区、经验等条件进行筛选，找到最适合您的专业按摩服务。
        </p>
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