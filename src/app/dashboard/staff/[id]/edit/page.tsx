// src/app/dashboard/staff/[id]/edit/page.tsx (最终修复版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { MyProfileForm as StaffEditForm } from '@/components/MyProfileForm';

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) return <p>Your team cannot be found.</p>;

  // 查询语句保持不变
  const { data: staffRelation } = await supabase
    .from('staff')
    .select(`
      id,
      profiles (*)
    `)
    .eq('id', params.id)
    .eq('shop_id', shop.id)
    .single();

  // 【核心修复】: 
  // 检查 staffRelation.profiles 是否存在且是一个数组，如果是，则取出第一个元素。
  // 这样可以确保 staffProfile 是一个对象或 null，而不是数组。
  const staffProfile = staffRelation?.profiles && Array.isArray(staffRelation.profiles)
    ? staffRelation.profiles[0]
    : staffRelation?.profiles;

  if (!staffProfile) {
    notFound();
  }

  return (
    <div className="max-w-[1200px] mx-auto gap-[10px]">
      <h1 className="text-2xl font-bold text-white mb-6">
        Editing information: {staffProfile.nickname || 'Unnamed'}
      </h1>
      <StaffEditForm profile={staffProfile} />
    </div>
  );
}