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
    return <p className="p-[24px] text-red-500">Unable to load your profile, please contact the administrator.。</p>;
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
    // 【修改】: 移除 min-w-[500px]，使用 w-full。p-6 -> p-[16px] md:p-[24px]。space-y-8 -> space-y-[32px]
    <div className="w-full max-w-[1200px] md:p-[24px] mx-auto space-y-[32px]">
      
      {/* 标题栏 */}
      <div className='flex flex-row flex-wrap justify-between gap-[16px] items-stretch p-[16px] md:p-[24px] w-[90%]'>
        <h2 className="text-xl font-bold text-white">My Profile</h2>
        <h2 className="text-xl font-bold text-white">LV-{profile.level ?? 'N/A'}</h2>
      </div>

      {/* 工作状态卡片 */}
      {/* 【修改】: 移除 mx-[10px]。p-[20px] -> p-[16px] md:p-[24px] */}
      <div className="card bg-[var(--color-third)] w-[full-20px] mx-[10px] rounded-lg shadow md:p-[24px]">
        <div className='p-[24px]'>
          <h2 className="text-xl font-semibold text-center">Work status management</h2>
          {/* 【修改】: 手机上 flex-col。 gap-[16px] */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[16px]">
              <p>
                  Current status: 
                  <span className={`font-bold ${profile.is_active ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profile.is_active ? 'Working' : 'Resting'}
                  </span>
              </p>
              {/* 【修改】: 移除 ToggleButton 外围的边距 */}
              <ToggleActiveStatusButton isActive={profile.is_active ?? true} />
          </div>
          <p className="text-xs mt-[8px]">When you switch to "Resting",customers will not be<br className="max-[800px]:inline hidden" />  able to make reservations on your profile.</p>
          <p>(เมื่อคุณสลับเป็น "พักผ่อน" <br className="max-[800px]:inline hidden" />ลูกค้าจะไม่สามารถทำการจองบนโปรไฟล์ของคุณได้)</p>
        </div>
      </div>

      {/* MyProfileForm 组件 */}
      <MyProfileForm profile={profile} />

      {/* 合作关系卡片 */}
      {/* 【修改】: 移除 m-[10px] 和 max-[800px]:w-[300px]。使用 w-full。 */}
      <div className="card bg-[var(--color-third)] w-[full-20px] mx-[10px]">
        <h2 className="text-xl font-semibold w-full text-center">Partner Relationship</h2>
        {isInShop ? (
          // 【修改】: 移除 mx-[24px]，使用 px-[24px]。pb-[20px]
          <div className="text-xl font-semibold w-full px-[24px] flex-col pb-[20px]">
            <p className="break-words my-[10px]"> {/* 使用 break-words 并添加间距 */}
              You and “<span className="font-bold">{shopName}</span>” are partners.<br className="max-[800px]:inline hidden" />(คุณและ “<span className="font-bold">{shopName}</span>” เป็นหุ้นส่วนกัน)
            </p>
            <p className="break-words my-[10px]"> {/* 使用 break-words 并添加间距 */}
              If you want to end the partnership,<br className="max-[800px]:inline hidden" /> you will become an independent worker.<br className="max-[800px]:inline hidden" />
              (หากคุณต้องการยุติความร่วมมือ<br className="max-[800px]:inline hidden" /> คุณจะกลายเป็นคนงานอิสระ)
            </p>
            <LeaveShopButton />
          </div>
        ) : (
          <div className="p-[24px]"> {/* 【修改】: 为 freeman 状态添加 padding */}
            <p className="mb-[16px] text-gray-700">You are currently a freeman.(ตอนนี้คุณเป็นผู้ประกอบอาชีพอิสระแล้ว)</p>
            <JoinShopForm />
          </div>
        )}
      </div>
    </div>
  );
}