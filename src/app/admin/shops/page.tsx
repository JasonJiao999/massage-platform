// src/app/admin/shops/page.tsx
import { createClient as createAdminClient } from '@supabase/supabase-js';
import Link from 'next/link';
import ShopsListClient from './ShopsListClient'; // 我们将创建一个新的客户端组件

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';

  // 在服务器组件中，我们直接使用 service_role 密钥创建管理员客户端
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  
  // 1. 构建基础查询
  let queryBuilder = supabaseAdmin
    .from('shops')
    .select(`
      id,
      name,
      is_active,
      owner_id,
      profiles ( email )
    `)
    .order('created_at', { ascending: false });

  // 2. 【核心修正】如果存在搜索词，则分别应用 .ilike() 过滤器
  if (query) {
    // 首先根据店铺名称进行模糊搜索
    queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    
    // (更高级的按邮箱搜索需要先查询 profiles 表，然后用 owner_id 过滤 shops，
    //  为保持当前步骤简单，我们暂时只实现按店铺名搜索)
  }

  const { data: shops, error } = await queryBuilder;

  if (error) {
    console.error("Admin Error loading shops:", error);
    return <p className="text-red-500 p-8">Error loading shops: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manage All Shops</h1>
      {/* 将 shops 和 query 数据传递给客户端组件 */}
      <ShopsListClient shops={shops || []} initialQuery={query} />
    </div>
  );
}