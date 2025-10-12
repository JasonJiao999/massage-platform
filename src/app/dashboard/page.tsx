// src/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from('shops')
    .select('name')
    .eq('owner_id', user!.id)
    .single();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">商户后台</h1>
      {shop ? (
        <p>欢迎回来, {shop.name}！</p>
      ) : (
        <div>
          <p>您还没有创建店铺。</p>
          {/* 未来可以创建一个 /dashboard/create-shop 页面 */}
          <Link href="#" className="text-blue-500 hover:underline">
            立即创建您的第一家店铺
          </Link>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold">管理您的店铺</h2>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li>
            <Link href="/dashboard/shop" className="text-blue-600 hover:underline">
                编辑店铺信息与主题
            </Link>
          </li>
          {/* 未来会在这里添加更多管理链接 */}
        </ul>
      </div>
    </div>
  );
}