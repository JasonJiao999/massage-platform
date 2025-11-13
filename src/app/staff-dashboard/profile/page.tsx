// src/app/staff-dashboard/profile/page.tsx (已更新响应式布局)

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
    return <p className="p-6 text-red-500">Unable to load your profile, please contact the administrator.。</p>;
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

  const shopsData = staffEntry?.shops;
  const shopObject = Array.isArray(shopsData) ? shopsData[0] : shopsData;
  const shopName = shopObject?.name || 'Unknown Name';

  return (
    // 【修改】: 移除了 min-w-[500px]，使用 w-full 确保占满容器
    <div className="w-full max-w-[1200px] p-2 md:p-6 mx-auto space-y-8">
      
      {/* 标题栏 */}
      <div className='flex flex-row flex-wrap justify-between gap-4 items-center p-4 md:p-6'>
        <h2 className="text-xl font-bold text-white">My Profile</h2>
        <h2 className="text-xl font-bold text-white">LV-{profile.level ?? 'N/A'}</h2>
      </div>

      {/* 工作状态卡片 */}
      {/* 【修改】: 移除 max-w-[1200px]，使用 w-full。移除 m-[10px]。 */}
      <div className="card bg-[var(--color-third)] w-full rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Work status management</h2>
          {/* 【修改】: 在手机上使用 flex-col 垂直堆叠 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p>
                  Current status: 
                  <span className={`font-bold ${profile.is_active ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profile.is_active ? 'Working' : 'Resting'}
                  </span>
              </p>
              {/* 【修改】: 移除了 ToggleButton 外围的边距，使其在手机上对齐 */}
              <ToggleActiveStatusButton isActive={profile.is_active ?? true} />
          </div>
          <p className="text-xs mt-2">When you switch to "Resting", customers will not be able to make reservations on your profile.</p>
          <p>(เมื่อคุณสลับเป็น "พักผ่อน" ลูกค้าจะไม่สามารถทำการจองบนโปรไฟล์ของคุณได้)</p>
      </div>

      {/* MyProfileForm 组件 */}
      <MyProfileForm profile={profile} />

      {/* 合作关系卡片 */}
      {/* 【修改】: 移除 m-[10px] 和 max-[800px]:w-[300px]，使用 w-full */}
      <div className="card bg-[var(--color-third)] w-full mx-auto p-4 md:p-0">
        <h2 className="text-xl font-semibold w-full text-center pt-[10px]">Partner Relationship Management</h2>
        {isInShop ? (
          // 【修改】: 移除 mx-[24px]，使用 p-4 或 px-4 代替
          <div className="text-xl font-semibold w-full px-4 md:px-6 flex-col pb-[20px] space-y-4">
            <p className="break-words"> {/* 使用 break-words 替代 break-all */}
              You and “<span className="font-bold">{shopName}</span>” are partners.(คุณและ “<span className="font-bold">{shopName}</span>” เป็นหุ้นส่วนกัน)
            </p>
            <p className="break-words">If you want to end the partnership, you will become an independent worker.
              (หากคุณต้องการยุติความร่วมมือ คุณจะกลายเป็นคนงานอิสระ)</p>
            <LeaveShopButton />
          </div>
        ) : (
          <div className="p-4 md:p-6"> {/* 【修改】: 为 freeman 状态添加 padding */}
            <p className="mb-4 text-gray-700">You are currently a freeman.(ตอนนี้คุณเป็นผู้ประกอบอาชีพอิสระแล้ว)</p>
            <JoinShopForm />
          </div>
        )}
      </div>
    </div>
  );
}