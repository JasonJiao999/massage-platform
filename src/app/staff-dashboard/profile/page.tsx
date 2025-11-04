// src/app/staff-dashboard/profile/page.tsx 

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

  // 【核心修复】: 使用更简洁、类型更安全的逻辑来提取店铺名称
  const shopsData = staffEntry?.shops;
  const shopObject = Array.isArray(shopsData) ? shopsData[0] : shopsData;
  const shopName = shopObject?.name || 'Unknown Name';


  return (
    <div className="p-6 mx-auto space-y-8 min-w-[500px] max-w-[1200px]">
      <div className='flex flex-row flex-wrap justify-between gap-6 items-stretch p-[24px]'>
      <h2 className="text-xl font-bold text-white">My Profile</h2>
      <h2 className="text-xl font-bold text-white">LV-{profile.level ?? 'N/A'}</h2>
      </div>

      <div className="card bg-[var(--color-third)] p-[24px] rounded-lg shadow m-[10px] ">
          <h2 className="text-xl font-semibold mb-4 ">Work status management</h2>
          <div className="flex items-center ">
              <p>
                  Current status: 
                  <span className={`font-bold ${profile.is_active ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profile.is_active ? 'Working' : 'Resting'}
                  </span>
              </p>
              <ToggleActiveStatusButton isActive={profile.is_active ?? true} />
          </div>
          <p className="text-xs mt-2">When you switch to "Resting", customers will not be able to make reservations on your profile.</p>
      </div>

      <MyProfileForm profile={profile} />

      <div className="card bg-[var(--color-third)] p-[24px] mx-auto space-y-8 min-w-[500px] max-w-[1200px]">
        <h2 className="text-xl font-semibold mb-4">Partner Relationship Management</h2>
        {isInShop ? (
          <div>
            <p className="mb-4 text-gray-700">
              You and “<span className="font-bold text-blue-600">{shopName}</span>” are partners.
            </p>
            <p>If you want to end the partnership, you will become an independent worker.</p>
            <LeaveShopButton />
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-700">You are currently a freeman</p>
            <JoinShopForm />
          </div>
        )}
      </div>



    </div>
  );
}