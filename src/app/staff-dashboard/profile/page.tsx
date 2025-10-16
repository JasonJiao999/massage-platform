// src/app/staff-dashboard/profile/page.tsx (显示店铺名称增强版)

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { JoinShopForm } from '@/components/JoinShopForm';
import { LeaveShopButton } from '@/components/LeaveShopButton';
import { MyProfileForm } from '@/components/MyProfileForm';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 获取完整的个人信息 (这部分保持不变)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return <p className="p-6 text-red-500">无法加载您的个人资料，请联系管理员。</p>;
  }
  
  // 1. 【核心修改】: 在查询雇佣关系时，同时获取店铺的名称
  // 我们使用 Supabase 的关联查询语法 `shops ( name )`
  const { data: staffEntry } = await supabase
    .from('staff')
    .select(`
      shop_id,
      shops ( name )
    `)
    .eq('user_id', user.id)
    .single();

  const isInShop = !!staffEntry;
  // 从查询结果中安全地获取店铺名称
  const shopName = staffEntry?.shops?.name || '未知店铺';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">我的仪表盘</h1>
      
      <MyProfileForm profile={profile} />

      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">店铺关系管理</h2>
        {isInShop ? (
          <div>
            {/* 2. 【核心修改】: 在这里显示获取到的店铺名称 */}
            <p className="mb-4 text-gray-700">
              您当前隶属于 “<span className="font-bold text-blue-600">{shopName}</span>” 店铺。
            </p>
            <LeaveShopButton />
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-700">您当前是自由职业者。</p>
            <JoinShopForm />
          </div>
        )}
      </div>

    </div>
  );
}