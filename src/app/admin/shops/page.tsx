// 文件路徑: app/admin/shops/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ShopsListClient from './ShopsListClient'; // 我們將在下一步修改這個文件

// 定義搜索參數的類型
interface SearchParams {
  query?: string;
  filter?: 'name' | 'id' | 'owner_id' | 'email';
}

export default async function ShopsPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { query, filter } = searchParams;
  let shops = [];

  // 只有當提供了搜索關鍵字和篩選條件時，才執行查詢
  if (query && filter) {
    let queryBuilder = supabase
      .from('shops')
      .select('*, owner:profiles(id, email, nickname)'); // 同時獲取擁有者的信息

    // 根據不同的篩選條件構建查詢
    if (filter === 'name') {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    } else if (filter === 'id') {
      queryBuilder = queryBuilder.eq('id', query);
    } else if (filter === 'owner_id') {
      queryBuilder = queryBuilder.eq('owner_id', query);
    } else if (filter === 'email') {
      // 查詢關聯表的字段
      queryBuilder = queryBuilder.ilike('owner.email', `%${query}%`);
    }
    
    const { data } = await queryBuilder;
    shops = data || [];
  }

  return <ShopsListClient initialShops={shops} />;
}