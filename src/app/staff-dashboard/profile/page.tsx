// src/app/staff-dashboard/profile/page.tsx (最终修复版)

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { JoinShopForm } from '@/components/JoinShopForm';
import { LeaveShopButton } from '@/components/LeaveShopButton';
import { MyProfileForm } from '@/components/MyProfileForm';
import ToggleActiveStatusButton from '@/components/ToggleActiveStatusButton';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return <p className="p-6 text-red-500">无法加载您的个人资料，请联系管理员。</p>;
  }
  
  const { data: staffEntry } = await supabase
    .from('staff')
    .select(`
      shop_id,
      shops ( name )
    `)
    .eq('user_id', user.id)
    .single();

  const isInShop = !!staffEntry;

  // 【核心修复】: 使用更简洁、类型更安全的逻辑来提取店铺名称
  const shopsData = staffEntry?.shops;
  const shopObject = Array.isArray(shopsData) ? shopsData[0] : shopsData;
  const shopName = shopObject?.name || '未知店铺';


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">我的仪表盘</h1>
      
      <div className="p-6 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">工作状态管理</h2>
          <div className="flex items-center gap-4">
              <p>
                  当前状态: 
                  <span className={`font-bold ${profile.is_active ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profile.is_active ? '工作中' : '休息中'}
                  </span>
              </p>
              <ToggleActiveStatusButton isActive={profile.is_active ?? true} />
          </div>
          <p className="text-xs text-gray-500 mt-2">当您切换为“休息中”，顾客将无法在您的主页上进行预约。</p>
      </div>

      <MyProfileForm profile={profile} />

      <div className="p-6 border rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">店铺关系管理</h2>
        {isInShop ? (
          <div>
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